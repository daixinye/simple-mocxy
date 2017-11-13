const Proxy = require('./proxy.js')

const proxy = new Proxy({
  port: 9999
})

proxy.start()
