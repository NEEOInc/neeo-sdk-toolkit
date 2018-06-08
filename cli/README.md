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
* Drivers availabe locally (relative to current path for example `../myCustomDriver`):
  * `npm install ../myCustomDriver`
* For more options see [npm install documentation](https://docs.npmjs.com/cli/install)

## Configuration and options

The neeo-cli can be configured with several options.

In the package json there is the `neeoSdkOptions` property:
```
  "neeoSdkOptions": {
    "serverName": "neeo-sdk-examples-server", // Optional name for the server
    "serverPort": 6336, // Server port
    "brainHost": "10.0.0.2", // If set will connect to a specific Brain instead of discovering one
  }
```

Environement variable options (these will take precedence over the `neeoSdkOptions` above:

* `NEEO_DEVICES_DIRECTORY` - deprecated
* `NEEO_DEVICES_EXCLUDED_DIRECTORIES` - deprecated