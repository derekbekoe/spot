FROM ubuntu:16.04

# Clone and use a specific commit as we haven't tested it with the latest.
RUN apt-get update && apt-get install -y git && apt-get install -y curl && git clone https://github.com/sourcelair/xterm.js.git xtermjs && cd xtermjs && git reset --hard ea07bf8f694a6e9714779b19c174e26162c39196 && cd - && curl -sL https://deb.nodesource.com/setup_6.x -o node_install.sh && bash node_install.sh &&  apt-get install -y nodejs libssl-dev libffi-dev python-dev build-essential python-pip && cd xtermjs && npm --silent install && rm -rf /var/lib/apt/lists/*

# Override demo files with our own
COPY app.js main.js index.html style.css favicon.ico package.json /xtermjs/demo/

RUN cd /xtermjs/demo/ && npm install

# certbot directories
# RUN apt-get update; apt-get install -y software-properties-common; add-apt-repository ppa:certbot/certbot;  apt-get update; apt-get install -y certbot
# RUN mkdir -p /.certbot/.well-known/acme-challenge

COPY start.sh cert_start.sh /

RUN chmod +x /start.sh
RUN chmod +x /cert_start.sh

CMD /start.sh && sleep infinity
# CMD /start.sh; /cert_start.sh && sleep infinity
