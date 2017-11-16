const Hosts = require('./host')
const Mocks = require('./mock')

const hosts = new Hosts()
const mocks = new Mocks()

module.exports = {
  getMock(host, path) {
    return mocks.getMock({
      host,
      path
    })
  },
  getHost(hostname) {
    return hosts.get(hostname)
  }
}
