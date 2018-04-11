var fs = require('fs')
var express = require('express');
var os = require('os');
var pty = require('node-pty');
var path = require('path');
var chokidar = require('chokidar');

var http = require('http');
var https = require('https');
var expressWs = require('express-ws');

require('ejs'); // allows 'pkg' to include this dependency. see https://github.com/zeit/pkg#config

const instanceToken = process.env.INSTANCE_TOKEN;
const useSSL = process.env.USE_SSL;

var port = process.env.PORT || 3000;
var host = os.platform() === 'win32' ? '127.0.0.1' : '0.0.0.0';

if (!instanceToken) {
  console.error('ERROR: Instance token is not set!');
  process.exit(1);
}

if (useSSL === '1') {
  var bootstrapApp = express();
  bootstrapApp.use('/.well-known', express.static('/.certbot/.well-known/'));
  var bootstrapServer = http.createServer(bootstrapApp);
  bootstrapServer.listen(80, host, function() {
    console.log("HTTP bootstrap server is live.");
  });
  var certdir = '/etc/letsencrypt/live/' + process.env.C_DOMAIN
  var privkey = certdir + '/privkey.pem';
  var certkey =  certdir + '/fullchain.pem';
  
  function attemptHttps() {
    if (fs.existsSync(privkey) && fs.existsSync(certkey)) {
      console.log("SSL keys exist.");
      bootstrapServer.close(() => {
        console.log("HTTP bootstrap server has closed.");
      });
      initRealServer((app) => {
        var options = {key: fs.readFileSync(privkey), cert: fs.readFileSync(certkey)};
        return https.createServer(options, app);
      });
    } else {
      console.log('Cert files not ready. Waiting 2 secs.');
      setTimeout(attemptHttps, 2000);
    }
  }

  attemptHttps();
} else {
  console.log('Not using SSL.');
  initRealServer((app) => {
    return http.createServer(app);
  });
}


function initRealServer(serverCreateCallback) {
  var app = express();
  var server = serverCreateCallback(app);
  var expressWsInstance = expressWs(app, server); // This is needed to use ws routes
  var terminals = {};
  var logs = {};
  app.set('view engine', 'ejs');
  app.use('/build', express.static(path.join(__dirname, 'node_modules', 'xterm', 'dist')));
  var requiresValidToken = function (req, res, next) {
    if (req.query.token == instanceToken) {
      next();
    } else {
      res.sendStatus(401);
    }
  };
  app.get('/health-check', requiresValidToken, (req, res) => res.sendStatus(200));
  
  app.get('/', requiresValidToken, function(req, res){
    res.render(path.join(__dirname, 'views', 'index'), {instanceToken: instanceToken});
  });
  
  app.get('/favicon.ico', function(req, res){
    res.sendFile(path.join(__dirname, '/favicon.ico'));
  });
  
  app.get('/style.css', function(req, res){
    res.sendFile(path.join(__dirname, '/style.css'));
  });
  
  app.get('/main.js', requiresValidToken, function(req, res){
    res.render(path.join(__dirname, 'views', 'main'), {instanceToken: instanceToken});
  });

  app.post('/terminals', requiresValidToken, function (req, res) {
    var cols = parseInt(req.query.cols),
        rows = parseInt(req.query.rows),
        term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
          name: 'xterm-color',
          cols: cols || 80,
          rows: rows || 24,
          cwd: process.env.PWD,
          env: process.env
        });
  
    console.log('Created terminal with PID: ' + term.pid);
    terminals[term.pid] = term;
    logs[term.pid] = '';
    term.on('data', function(data) {
      logs[term.pid] += data;
    });
    res.send(term.pid.toString());
    res.end();
  });

  app.post('/terminals/:pid/size', requiresValidToken, function (req, res) {
    var pid = parseInt(req.params.pid),
        cols = parseInt(req.query.cols),
        rows = parseInt(req.query.rows),
        term = terminals[pid];
  
    term.resize(cols, rows);
    console.log('Resized terminal ' + pid + ' to ' + cols + ' cols and ' + rows + ' rows.');
    res.end();
  });

  app.ws('/file/:fileid', function(ws, req) {
    if (req.query.token == instanceToken) {
      var theFilePath = undefined;
      var fileId = req.params.fileid;
      ws.on('message', function(msg) {
        try {
          msg_obj = JSON.parse(msg);
        } catch (e) {
          msg_obj = undefined;
        }
        if (msg_obj && msg_obj.event === 'fileDownload') {
          console.log('Received message', msg_obj);
          if (msg_obj.event === 'fileDownload') {
            console.log(msg_obj.path);
            theFilePath = msg_obj.path;
            fs.readFile(msg_obj.path, "utf8", function(err, data) {
              ws.send(data);
            });
          }
        } else {
          // Must be a file for us to save.
          fs.writeFile(theFilePath, msg, (err) => {
            if (err) {
              console.error("Error saving file", err);
            }
          });
        }
      });
      ws.on('close', function () {
        console.log('Closed');
      });
    } else {
      ws.close();
    }
  });

  app.ws('/files', function(ws, req) {
    if (req.query.token == instanceToken) {
      var watcher = chokidar.watch('/root', {ignored: /(^|[\/\\])\../, ignorePermissionErrors: true}).on('all', (event, path) => {
        console.log(event, path);
        data = {event: event, path: path};
        try {
          ws.send(JSON.stringify(data));
        } catch (ex) {
          console.error(ex);
          // The WebSocket is not open, ignore
        }
      });
      console.log('Connected to file watcher');
      ws.on('close', function () {
        watcher.close();
        console.log('Closed file watcher');
      });
    } else {
      ws.close();
    }
  });
  
  app.ws('/terminals/:pid', function (ws, req) {
    if (req.query.token == instanceToken) {
      var term = terminals[parseInt(req.params.pid)];
      console.log('Connected to terminal ' + term.pid);
      ws.send(logs[term.pid]);
    
      term.on('data', function(data) {
        try {
          ws.send(data);
        } catch (ex) {
          // The WebSocket is not open, ignore
        }
      });
      ws.on('message', function(msg) {
        term.write(msg);
      });
      ws.on('close', function () {
        term.kill();
        console.log('Closed terminal ' + term.pid);
        // Clean things up
        delete terminals[term.pid];
        delete logs[term.pid];
      });
    } else {
      ws.close();
    }
    
  });
  
  server.listen(port, host, function() {
    console.log("Server is live at " + host + ":" + port + "!");
  });

}
