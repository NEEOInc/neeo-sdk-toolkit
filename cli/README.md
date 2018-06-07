# @neeo/cli

The NEEO CLI helps with running and developing NEEO SDK drivers.

## Installing the CLI:

Globally: `npm install -g @neeo/cli`

Locally to your package: `npm install @neeo/cli`

## Using the CLI to run drivers:

`neeo-cli start` will start the drivers installed in the current folder.

### Advanced options

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

## Installing NEEO SDK drivers and running them with the CLI

For example if you want to run `${driverName}` with the CLI in the `/my-neeo-server/` folder you can install it with the following commands:

```
npm install -g @neeo/cli
cd /my-neeo-server
npm init -y
npm install --save ${driverName}
```

You can then add the settings SDK server settings to the end of `/my-neeo-server/package.json`:

```
  ,
  "neeoSdkOptions": {
    "serverName": "my-neeo-server"
  }
```
or with optional expicit IP of the NEEO Brain to connect to
```
  ,
  "neeoSdkOptions": {
    "serverName": "my-neeo-server",
    "brainHost": "10.0.0.2"
  }
```

Then the driver will start when you run `neeo-cli start`,

### Handling different drivers sources

Drivers can easily be installed from different sources via npm:

* Drivers hosted on npm (for example `${driverName}`):
  * `npm install --save ${driverName}`
* Drivers hosted on Github (for example: `${githubURL}`):
  * `npm install --save git+${githubURL}`
* Drivers availabe locally (relative to current path for example `../myCustomDriver`):
  * `npm install ../myCustomDriver`
* For more options see [npm install documentation](https://docs.npmjs.com/cli/install)