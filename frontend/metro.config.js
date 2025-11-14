const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Allow Metro to watch files located one level above the Expo project (e.g. the shared api folder)
config.watchFolders = [workspaceRoot];

// Ensure modules can be resolved from both the app's node_modules and the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Provide aliases so imports can reference the shared api utilities
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@': projectRoot,
  '@api': path.resolve(workspaceRoot, 'api'),
};

config.resolver.alias = {
  ...config.resolver.alias,
  '@': projectRoot,
  '@api': path.resolve(workspaceRoot, 'api'),
};

module.exports = config;
