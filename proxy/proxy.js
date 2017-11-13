'use strict'
const http = require('http')
const url = require('url')
const MockConfig = require('../config')

const ENCODING = 'utf-8'

class Proxy {
  constructor(config) {
    this.config = config
    this.server = http.createServer(this.listener)
  }

  start() {
    let port = this.config.port || 9999
    this.server.listen(port).on('listening', () => {
      console.log('server started on %s', port)
    })
  }

  listener(req, res) {
    let body = ''
    req.setEncoding(ENCODING)
    req.on('data', chunk => (body += chunk))
    req.on('end', () => {
      let { hostname, port, path } = url.parse(req.url)
      let { method, headers } = req

      let mockConfig = new MockConfig({
        host: hostname,
        path: path,
        method: method
      })

      let ip = mockConfig.getIP()
      let mock = mockConfig.getMock()

      console.log('request: %s %s %s %s', hostname, port, path, method)

      // response set Header
      res.setHeader('content-type', 'text/plain; charset=' + ENCODING)

      if (mock) {
        res.end(JSON.stringify(mock), ENCODING)
        return this
      }

      let options = {
        hostname: ip || hostname,
        port,
        path,
        method,
        headers
      }

      let proxyReq = http
        .request(options, proxyRes => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers)
          proxyRes.pipe(res)
        })
        .on('error', err => res.end())

      req.pipe(proxyReq)
      return this
    })
  }
}

module.exports = Proxy
