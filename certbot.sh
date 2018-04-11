#!/bin/sh

if [ "$USE_SSL" = "1" ]; then
    echo 'Waiting to start up certbot.';
    sleep 10;
    for i in 1 2 3;
    do echo 'About to run certbot' && certbot certonly --webroot --agree-tos -n -m $C_EMAIL -w /.certbot -d $C_DOMAIN && break || sleep 15;
    done
else
    echo 'SSL not in use. Nothing to do.';
fi

echo 'Done. Keeping container running...';

while true; do sleep 5; done
