// Custom jest resolver: maps .js → .ts for local source imports
const fs = require('fs')
const path = require('path')

module.exports = (request, options) => {
  // Only remap relative imports ending in .js that resolve to a .ts file
  if (request.startsWith('.') && request.endsWith('.js')) {
    const tsRequest = request.slice(0, -3) + '.ts'
    const tsCandidate = path.resolve(options.basedir, tsRequest)
    if (fs.existsSync(tsCandidate)) {
      return options.defaultResolver(tsRequest, options)
    }
  }
  return options.defaultResolver(request, options)
}
