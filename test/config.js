const Config = require('../config/index.js')
const test = require('./test')

const cases = [
  // 正常 case
  function() {
    let config = new Config({
      host: 'api.guapizuzhi.com',
      path: 'getList',
      method: 'get'
    })

    this.equal(config.getMock().mock, true)
    this.equal(config.getHost().ip, '127.0.0.1')
  },
  // path 为空时
  function() {
    let config = new Config({
      host: 'api.guapizuzhi.com',
      path: '',
      method: 'get'
    })

    this.equal(config.getMock(), null)
    this.equal(config.getHost().ip, '127.0.0.1')
  }
]

test(cases)
