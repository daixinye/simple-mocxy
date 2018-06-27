const fs = require('fs')
const _path = require('path')

const MOCKS_PATH = _path.resolve(__dirname, '../config/mocks')

function readMockObj(hostname) {
    let mockPath = _path.join(MOCKS_PATH, `/${hostname}.js`)
    let isMockExist = fs.existsSync(mockPath) && fs.statSync(mockPath).isFile()

    delete require.cache[mockPath]
    return isMockExist ? require(mockPath) : {}
}

function formatMockData(target) {
    switch (typeof target) {
        case 'object':
            return JSON.stringify(target)
        case 'string':
            return target
        default:
            return ''
    }
}

class Mocks {
    get(options) {
        let { hostname, path } = options
        let mockObj = readMockObj(hostname)
        return path in mockObj ? formatMockData(mockObj[path]) : null
    }
}

module.exports = new Mocks()
