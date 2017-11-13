const Config = require('../config/index.js')

const cases = [
  function() {
    let config = new Config({
      host: 'api.guapizuzhi.com',
      path: 'getList',
      method: 'get'
    })

    console.log(config.getMock())
    console.log(config.getIP())
  }
]

cases[0]()
