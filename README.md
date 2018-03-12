# spot

## Instances

### instance-1

A demo instance.

```bash
docker build instance-1 -t debekoe.azurecr.io/spot-instance-1:0.0.1

docker run -d -p 5001:1000 -e PORT=1000 -e INSTANCE_TOKEN=XXXX debekoe.azurecr.io/spot-instance-1:0.0.1

docker push debekoe.azurecr.io/spot-instance-1:0.0.1
```


```bash
export SN=spot-instance-1-0003
export RG=spot-instance-dev
export LOC=westus
export IMG=debekoe.azurecr.io/spot-instance-1:0.0.1
az container create --resource-group $RG --name $SN --image $IMG --cpu 1 --memory 1 --registry-password $RPASS --ip-address public --ports 80 443 --dns-name-label $SN -e PORT=80 INSTANCE_TOKEN=debekoe C_EMAIL=derek@derekbekoe.com C_DOMAIN=$SN.$LOC.azurecontainer.io -l $LOC
```

**Version tracking**

0.0.1 - Attempted certbot version on ACI but can't verify domain

0.0.2 - Non-SSL version. Works with the console

0.0.3 - Getting file watcher to work
