'use strict'
const http = require('http')
const url = require('url')

class Proxy {
  constructor(config) {
    this.config = config
    this.server = http.createServer(this.listener)
  }

  start() {
    let port = this.config.port || 8989
    this.server.listen(port).on('listening', function() {
      console.log('server started on %s', port)
    })
  }

  listener(req, res) {
    let body = ''
    req.setEncoding('utf-8')
    req.on('data', chunk => (body += chunk))
    req.on('end', () => {
      let { hostname, port, path } = url.parse(req.url)
      let { method, headers } = req

      // 修改请求
      let options = {
        hostname,
        port,
        path,
        method,
        headers
      }
      console.log('request: %s %s %s %s', hostname, port, path, method)

      let proxyReq = http
        .request(options, proxyRes => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers)
          // 修改响应
          proxyRes.pipe(res)
        })
        .on('error', err => res.end())

      req.pipe(proxyReq)
    })
  }
}

module.exports = Proxy
