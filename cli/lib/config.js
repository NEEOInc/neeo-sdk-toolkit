'use strict';

module.exports = {
  devicesDirectory: process.env.NEEO_DEVICES_DIRECTORY || 'devices',
  devicesExcludedDirectories: process.env.NEEO_DEVICES_EXCLUDED_DIRECTORIES || [],
};
