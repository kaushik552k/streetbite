const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Watch all files within the monorepo (for shared packages)
config.watchFolders = [monorepoRoot]

// Let Metro know where to resolve modules from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// Force the project root so bundle URLs resolve correctly
config.projectRoot = projectRoot

module.exports = config
