# neeo-cli

The NEEO CLI helps with running and developing NEEO SDK drivers.

## Installing NEEO SDK drivers and running them with the CLI

For example if you want to run the `https://github.com/nklerk/neeo_driver-kodi` driver with the CLI in the `my-neeo-server/` folder.

To install locally:
```
mkdir my-neeo-server
cd my-neeo-server
npm init -y
npm install --save https://github.com/nklerk/neeo_driver-kodi @neeo/cli
```

To start the server with the driver:
```
npx neeo-cli start
```

## Installing the CLI Globally:

Globally: `npm install -g @neeo/cli`

## Using the CLI to run drivers:

`neeo-cli start` will start the drivers installed in the current folder.

## Installing drivers for the CLI server

Drivers can easily be installed from different sources via npm:

* Drivers hosted on npm (for example `${driverName}`):
  * `npm install --save ${driverName}`
* Drivers hosted on Github (for example: `${githubURL}`):
  * `npm install --save git+${githubURL}`
* Drivers availabe locally (relative to current path for example `../neeo-driver-custom-device`):
  * `npm install ../neeo-driver-custom-device`
* For more options see [npm install documentation](https://docs.npmjs.com/cli/install)

The NEEO CLI will automatically load installed drivers it finds in the `node_modules` folder. Currently NEEO Drivers are detected by prefix (recomendation `neeo-driver-`):

For example:
* `neeo-driver-example`
* `neeo-driver-device-example`
* `neeo-driver-custom-example`

For backwards compatibility reasons drivers prefixed with `neeo-` or `neeo_` are still loaded, but we recommend new drivers to use `neeo-driver-` as a prefix.

## Configuration and options

The neeo-cli can be configured to start the server with different options.

In the package.json you can use a `neeoSdkOptions` property:
```
  "dependencies": { ... },
  "devDependencies": { ... },
  "neeoSdkOptions": {
    "serverName": "neeo-sdk-examples-server", // Optional name for the server
    "serverPort": 6336, // Port the server will listen for connections on
    "brainHost": "10.0.0.2", // If set will connect to a specific Brain instead of discovering one
  }
```

Environement variable options (these will take precedence over the `neeoSdkOptions` above):
* `NEEO_SERVER_NAME` – Sets the server name (overrides `neeoSdkOptions.serverName`)
* `NEEO_SERVER_PORT` – Sets the port the server will run on (overrides `neeoSdkOptions.serverPort`)
* `NEEO_HOST_IP` – Sets IP of the NEEO Brain to connect to (overrides `neeoSdkOptions.brainHost`)
