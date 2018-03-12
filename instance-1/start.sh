#!/bin/sh

sed 's/INSTANCE_TOKEN_PLACEHOLDER/'$INSTANCE_TOKEN'/' -i /xtermjs/demo/index.html; sed 's/INSTANCE_TOKEN_PLACEHOLDER/'$INSTANCE_TOKEN'/' -i /xtermjs/demo/main.js;
npm run build --prefix /xtermjs; echo "\nexport PS1='\w\$ '\n" >> ~/.bashrc; nohup node /xtermjs/demo/app &
