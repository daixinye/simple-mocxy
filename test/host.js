const Host = require('../config/host.js')
const test = require('./test.js')

const host = new Host()
const hostname = Date.parse(new Date()) + '.gua.com'

const cases = [
  // 增加一个 string 配置
  function() {
    host.set(hostname, '127.0.0.1')
    this.equal(host.get(hostname).ip, '127.0.0.1')

    host.delete(hostname)
    this.equal(host.get(hostname), null)
  },
  // 增加一个 object 配置
  function() {
    host.set(hostname, {
      ip: '127.0.0.1',
      port: '8000'
    })

    this.equal(host.get(hostname).ip, '127.0.0.1')
    this.equal(host.get(hostname).port, 8000)
    host.delete(hostname)
  }
]

test(cases)
