'use strict'
const Hosts = require('./host')
const Mocks = require('./mock')
// 类
class Config {
  constructor(request) {
    this.request = request
    this.hosts = new Hosts()
    this.mock = new Mocks()
  }

  getMock() {
    return this.mock.getMock({
      host: this.request.host,
      path: this.request.path
    })
  }

  getIP() {
    return this.hosts.getIP(this.request.host)
  }
}

module.exports = Config
