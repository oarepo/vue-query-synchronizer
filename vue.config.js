const path = require('path')

console.log('config loaded')

function resolve (...dir) {
    return path.join(__dirname, ...dir)
}

module.exports = {
    chainWebpack: config => {
        config.resolve.alias
            .set('@oarepo/vue-query-synchronizer', resolve('src', 'library'))
    }
}
