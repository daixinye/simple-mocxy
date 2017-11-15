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
        return
      }

      let options = {
        hostname,
        port,
        path,
        method,
        headers
      }

      if (host) {
        options.hostname = host.ip || hostname
        options.port = host.port || 80
        for (let header in host.headers) {
          let operator = header[0]
          let value = host.headers[header]
          header = header.slice(1)
          switch (operator) {
            case '=':
              headers[header] = value
              break
            case '+':
              headers[header] += value
              break
            default:
          }
        }
      }

      let proxyReq = http
        .request(options, proxyRes => {
          if (host) {
            proxyRes.headers['simple-moxcy-host'] = options.hostname
            proxyRes.headers['simple-moxcy-port'] = options.port
            proxyRes.headers['simple-moxcy-headers'] = JSON.stringify(
              host.headers || {}
            )
          }
          res.writeHead(proxyRes.statusCode, proxyRes.headers)
          proxyRes.pipe(res)
        })
        .on('error', err => res.end())

      proxyReq.write(body)
      proxyReq.end()

      req.pipe(proxyReq)
      return this
    })
  }
}

module.exports = Proxy
