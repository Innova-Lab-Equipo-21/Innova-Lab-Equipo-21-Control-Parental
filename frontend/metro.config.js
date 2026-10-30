const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    extraNodeModules: {
      'react-native/asset-registry': path.resolve(
        __dirname,
        'node_modules/@react-native/assets-registry/registry.js'
      ),
      'react-native/Libraries/Image/AssetRegistry': path.resolve(
        __dirname,
        'node_modules/@react-native/assets-registry/registry.js'
      ),
    },
    resolveRequest: (context, moduleName, platform) => {
      if (
        moduleName === 'react-native/asset-registry' ||
        moduleName === 'react-native/Libraries/Image/AssetRegistry'
      ) {
        return {
          filePath: path.resolve(
            __dirname,
            'node_modules/@react-native/assets-registry/registry.js'
          ),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
