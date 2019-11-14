path = require('path')

module.exports = {
    configureWebpack: {
        resolve: {
            alias: {
                '@oarepo/vue-query-synchronizer': path.join(__dirname, 'src', 'library.js')
            }
        }
    }
}
