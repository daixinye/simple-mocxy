'use strict'
const http = require('http')
const url = require('url')
const ProxyConfig = require('../config')

const ENCODING = 'utf-8'

class Proxy {
  constructor(config) {
    this.config = config
    this.server = http.createServer(this.listener)
  }

  start() {
    let port = this.config.port || 9999
    this.server.listen(port).on('listening', () => {
      console.log('server started on %s \n', port)
    })
  }

  listener(req, res) {
    let body = ''
    req.setEncoding(ENCODING)
    req.on('data', chunk => (body += chunk))
    req.on('end', () => {
      let { hostname, port, path } = url.parse(req.url)
      let { method, headers } = req

      let proxyConfig = new ProxyConfig({
        host: hostname,
        path: path,
        method: method
      })

      let host = proxyConfig.getHost()
      let mock = proxyConfig.getMock()

      console.log('%s %s %s %s %s', Date(), method, hostname, port || 80, path)

      if (mock) {
        // response set Header
        res.setHeader('content-type', 'text/plain; charset=' + ENCODING)
        res.setHeader(
          'Access-Control-Allow-Origin',
          req.headers['origin'] || '*'
        )
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.end(JSON.stringify(mock), ENCODING)
        return this
      }

      let options = {
        hostname: (host && host.ip) || hostname,
        port: (host && host.port) || port,
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
