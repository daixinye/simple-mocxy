const Config = require('../config/index.js')

const cases = [
  // 正常 case
  function() {
    let config = new Config({
      host: 'api.guapizuzhi.com',
      path: 'getList',
      method: 'get'
    })

    console.log(config.getMock())
    console.log(config.getIP())
  },
  // path 为空时
  function() {
    let config = new Config({
      host: 'api.guapizuzhi.com',
      path: '',
      method: 'get'
    })

    console.log(config.getMock())
    console.log(config.getIP())
  }
]

cases.forEach(f => f.call(null))
