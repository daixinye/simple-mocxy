const fs = require('fs')
const _path = require('path')

const MOCKS_PATH = _path.resolve(__dirname, '../config/mocks')

class Mocks {
  constructor() {}

  getMock(request) {
    let { host, path } = request
    return this._readMock(host, path)
  }

  _getMockLocalPath(host, path) {
    return _path.join(MOCKS_PATH, `/${host}/${path}`)
  }

  _readMock(host, path) {
    let mockPath = this._getMockLocalPath(host, path)
    let isMockExist = fs.existsSync(mockPath) && fs.statSync(mockPath).isFile()
    if (isMockExist) {
      return JSON.parse(
        fs.readFileSync(mockPath, {
          encoding: 'utf-8'
        })
      )
    } else {
      return null
    }
  }
}

module.exports = Mocks
