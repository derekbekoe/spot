var term,
protocol,
socketURL,
socket,
pid;

var terminalContainer = document.getElementById('terminal-container');

var instanceToken = 'INSTANCE_TOKEN_PLACEHOLDER';

createTerminal();

function createTerminal() {
    // Clean terminal
    while (terminalContainer.children.length) {
        terminalContainer.removeChild(terminalContainer.children[0]);
    }
    term = new Terminal({
        cursorBlink: true
    });
    term.on('resize', function(size) {
        if (!pid) {
            return;
        }
        var cols = size.cols,
            rows = size.rows,
            url = '/terminals/' + pid + '/size?cols=' + cols + '&rows=' + rows + '&token=' + instanceToken;

        fetch(url, {
            method: 'POST'
        });
    });
    protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
    socketURL = protocol + location.hostname + ((location.port) ? (':' + location.port) : '') + '/terminals/';

    term.open(terminalContainer, true);
    term.writeln('Welcome!');
    term.fit();

    setTimeout(() => {
        cols = term.cols;
        rows = term.rows;
        fetch('/terminals?cols=' + cols + '&rows=' + rows + '&token=' + instanceToken, {
            method: 'POST'
        }).then(function(res) {
    
            res.text().then(function(pid) {
                window.pid = pid;
                socketURL += pid;
                socketURL += '/?token=' + instanceToken;
                socket = new WebSocket(socketURL);
                socket.onopen = runRealTerminal;
            });
        });
    }, 0);
    

}

function runRealTerminal() {
    term.attach(socket);
    term._initialized = true;
}
