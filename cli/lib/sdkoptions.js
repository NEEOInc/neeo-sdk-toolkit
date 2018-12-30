'use strict';

const debug = require('debug')('neeo:cli:sdkoptions');
const fs = require('fs');

const ENV_MAPPING = {
  serverName: 'NEEO_SERVER_NAME',
  serverPort: 'NEEO_SERVER_PORT',
  serverIp: 'NEEO_SERVER_IP',
  serverBaseURL: 'NEEO_SERVER_BASEURL',
  brainHost: 'NEEO_HOST_IP',
  brainPort: 'NEEO_HOST_PORT',
};

module.exports = {
  load,
};

function load() {
  return Object.assign(
    {},
    getPackageJSONOptions(),
    getEnvironmentOptions()
  );
}

function getPackageJSONOptions() {
  const packageJSONPath = process.cwd() + '/package.json';
  let packageFile = {};

  try {
    packageFile = readJSONFile(packageJSONPath);
  } catch(error) {
    debug('Failed to load package.json ', error.message);
  }

  return packageFile.neeoSdkOptions || {};
}

function getEnvironmentOptions() {
  return Object.keys(ENV_MAPPING)
    .reduce((options, key) => {
      const envVar = process.env[ENV_MAPPING[key]];
      if (envVar) {
        options[key] = envVar;
      }
      return options;
    }, {});
}

function readJSONFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
