
npm install

export INSTANCE_TOKEN='XXXX'
export PORT=3000

node app.js

# Build spot-host into executable
node_modules/.bin/pkg --out-path build package.json
./build/spot-host-macos


# Deploy with arm template
az group deployment create --resource-group myResourceGroup --name myContainerGroup --template-file azuredeploy.json

