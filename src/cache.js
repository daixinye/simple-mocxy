const fs = require('fs')
const path = require('path')

const PATH = path.join(__dirname, '_cache')

class Cache {
    constructor() {
        if (!fs.existsSync(PATH)) {
            fs.mkdirSync(PATH)
        }
    }

    get(name, key) {
        let cachePath = path.join(PATH, name, key)
        if (fs.existsSync(cachePath)) {
            return fs.readFileSync(cachePath, 'utf-8')
        }
        return null
    }

    set(name, key, value) {
        let cacheDirPath = path.join(PATH, name)

        if (!fs.existsSync(cacheDirPath)) {
            fs.mkdirSync(cacheDirPath)
        }

        let cachePath = path.join(PATH, name, key)
        fs.writeFile(cachePath, value, e => {
            e && console.log('cache: ', e)
        })
    }
}

module.exports = new Cache()
