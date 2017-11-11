'use strict'
// 模块
const fs = require('fs')
const _path = require('path')

// 常量
const HOSTS_PATH = _path.join(__dirname, 'hosts.json')
const MOCKS_PATH = _path.join(__dirname, '/mocks')

// 类
class Config {
  constructor(request) {
    this.request = request
    this.hosts = new Hosts()
    this.mock = new Mocks()
  }

  getMock() {
    return this.mock.getMockData({
      host: this.request.host,
      ip: this.hosts.getIP(this.request.host),
      path: this.request.path
    })
  }

  getIP() {
    return this.hosts.getIP(this.request.host)
  }
}

class Hosts {
  constructor() {
    this.hosts = this._readHosts()
  }

  getIP(hostname) {
    return this.hosts[hostname] || null
  }

  _readHosts() {
    let isHostsExist = fs.existsSync(HOSTS_PATH)
    if (isHostsExist) {
      return JSON.parse(fs.readFileSync(HOSTS_PATH, { encoding: 'utf-8' }))
    } else {
      let hosts = {}
      fs.writeFileSync(HOSTS_PATH, JSON.stringify(hosts, null, 4), {
        encoding: 'utf-8'
      })
      return hosts
    }
  }
}

class Mocks {
  constructor() {}

  getMockData(request) {
    let { host, ip, path } = request
    return this._readMock(host, ip, path)
  }

  _getMockLocalPath(host, ip, path) {
    return _path.join(MOCKS_PATH, `/${host}/${ip}/${path}.json`)
  }

  _readMock(host, ip, path) {
    let mockPath = this._getMockLocalPath(host, ip, path)
    let isMockExist = fs.existsSync(mockPath)
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

module.exports = Config
