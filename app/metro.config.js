const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, '../shared');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [sharedRoot];

config.resolver = {
  ...config.resolver,
  sourceExts: ['ts', 'tsx', 'js', 'jsx', 'json'],
  extraNodeModules: new Proxy(
    {},
    {
      get: (target, name) => {
        if (name === 'shared') {
          return sharedRoot;
        }
        return path.join(__dirname, `node_modules/${name}`);
      },
    }
  ),
};

module.exports = config;
