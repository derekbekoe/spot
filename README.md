# spot

## Instances

### instance-1

A demo instance.

```bash
docker build instance-1 -t debekoe.azurecr.io/spot-instance-1:0.0.6

docker run -d -p 7001:1000 -e PORT=1000 -e INSTANCE_TOKEN=XXXX debekoe.azurecr.io/spot-instance-1:0.0.6

docker push debekoe.azurecr.io/spot-instance-1:0.0.6
```


```bash
export SN=spot-instance-1-0002
export RG=spot-instance-dev
export LOC=westus
export IMG=debekoe.azurecr.io/spot-instance-1:0.0.6
export RPASS=
az container create --resource-group $RG --name $SN --image $IMG --cpu 1 --memory 1 --registry-password $RPASS --ip-address public --ports 80 443 5000 --dns-name-label $SN -e PORT=80 INSTANCE_TOKEN=XXXX C_EMAIL=derek@derekbekoe.com C_DOMAIN=$SN.$LOC.azurecontainer.io -l $LOC
```

**Version tracking**

0.0.1 - Attempted certbot version on ACI but can't verify domain

0.0.2 - Non-SSL version. Works with the console

0.0.3 - Getting file watcher to work with simple console.log

0.0.4 - Getting file watcher to work with ws endpoint

0.0.5 - Can get directory listing and syncing

0.0.6 - Can get files through socket


### instance-aspnetcore

Get Started with ASP.NET Core

https://docs.microsoft.com/en-us/aspnet/core/getting-started

```bash
docker build instance-aspnetcore -t debekoe.azurecr.io/spot-instance-aspnetcore:0.0.1

# Expose 5000 for the server.
docker run -d -p 7001:1000 -p 7002:5000 -e PORT=1000 -e INSTANCE_TOKEN=XXXX debekoe.azurecr.io/spot-instance-aspnetcore:0.0.1

docker push debekoe.azurecr.io/spot-instance-aspnetcore:0.0.1
```


```bash
export SN=spot-instance-aspnetcore-0001
export RG=spot-instance-dev
export LOC=westus
export IMG=debekoe.azurecr.io/spot-instance-aspnetcore:0.0.1
export RPASS=
az container create --resource-group $RG --name $SN --image $IMG --cpu 1 --memory 1 --registry-password $RPASS --ip-address public --ports 80 443 5000 --dns-name-label $SN -e PORT=80 INSTANCE_TOKEN=debekoe C_EMAIL=derek@derekbekoe.com C_DOMAIN=$SN.$LOC.azurecontainer.io -l $LOC
```

```bash
watch az container show -g $RG -n $SN -otable
watch az container show -g $RG -n $SN --query containers[0].instanceView.events
az container logs -g $RG -n $SN --follow
```

**Version tracking**

0.0.1 - First version.
