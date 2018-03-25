
npm install

export INSTANCE_TOKEN='XXXX'
export PORT=3000

node app.js

# Build spot-host into executable
node_modules/.bin/pkg package.json
