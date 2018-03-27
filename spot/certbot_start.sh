#!/bin/sh

echo 'Waiting to start up certbot.';

sleep 10;

for i in 1 2 3;
do echo 'About to run certbot' && certbot certonly --webroot --agree-tos -n -m $C_EMAIL -w /.certbot -d $C_DOMAIN && break || sleep 15;
done
