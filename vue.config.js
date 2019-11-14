path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@cis/query-support': path.join(__dirname, 'src', 'library.js')
      }
    }
  }
}
