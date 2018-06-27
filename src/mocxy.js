'use strict'
const http = require('http')
const https = require('https')
const url = require('url')
const net = require('net')

const hosts = require('./host')
const mocks = require('./mock')
const cache = require('./cache')

const createFakeHttpsWebSite = require('./utils/createFakeWebsite')

const ENCODING = 'utf-8'

function log(prefix, options, errinfo) {
    let time = Date()
    options =
        typeof options === 'object' ? JSON.stringify(options, null, 4) : options
    errinfo =
        typeof errinfo === 'object' ? JSON.stringify(errinfo, null, 4) : errinfo

    console.error(
        `${time}\r\n${prefix}\r\n---\r\n ${options}\r\n---\r\n ${errinfo}\r\n---\r\n \r\n`
    )
}

const proxyConfig = {
    getMock(hostname, path) {
        path = path.split('?')[0]
        return mocks.get({
            hostname,
            path
        })
    },
    getHost(hostname, path) {
        return hosts.get(hostname, path)
    }
}

function saveCookie(options) {
    if (options.headers.cookie) {
        cache.set('cookie', options.hostname, options.headers.cookie)
    }
}

function doTransparent(req, res, options) {
    if (options.protocol === 'https:') {
        let proxyReq = https
            .request(options, function(proxyRes) {
                res.writeHead(proxyRes.statusCode, proxyRes.headers)
                proxyRes.pipe(res)
            })
            .on('error', err => {
                log(
                    `https: ${options.method} ${options.hostname}:${
                        options.port
                    }${options.path} `,
                    options,
                    err
                )
                res.end()
            })
        req.pipe(proxyReq)
    } else {
        let proxyReq = http.request(options, proxyRes => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers)
            proxyRes.pipe(res)
        })
        proxyReq.on('error', err => {
            log(
                `tranparent: ${options.method} ${options.hostname}:${
                    options.port
                }${options.path} `,
                options,
                err
            )
            res.end()
        })
        req.pipe(proxyReq)
    }
}

function doMock(req, res, options, mock) {
    // 返回 mock 数据
    res.setHeader('content-type', 'text/plain; charset=' + ENCODING)
    res.setHeader('Access-Control-Allow-Origin', req.headers['origin'] || '*')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.end(mock, ENCODING)
}

function doSwitchHost(req, res, options, host) {
    options.hostname = host.ip || options.hostname
    options.port = host.port || 80
    host.headers['=cookie'] =
        cache.get('cookie', options.hostname) || options.headers['cookie'] || ''
    for (let header in host.headers) {
        let operator = header[0]
        let value = host.headers[header]
        header = header.slice(1)
        switch (operator) {
            case '=':
                options.headers[header] = value
                break
            case '+':
                options.headers[header] += value
                break
            default:
        }
    }

    if (host.protocol === 'https') {
        options.protocol = 'https:'
        let httpsReq = https
            .request(options, httpsRes => {
                if (host) {
                    httpsRes.headers['simple-moxcy-host'] = options.hostname
                    httpsRes.headers['simple-moxcy-port'] = options.port
                    httpsRes.headers['simple-moxcy-headers'] = JSON.stringify(
                        host.headers || {}
                    )
                }
                res.writeHead(httpsRes.statusCode, httpsRes.headers)
                httpsRes.pipe(res)
            })
            .on('error', err => {
                res.end()
            })

        req.pipe(httpsReq)
    } else {
        options.protocol = 'http:'
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
            .on('error', err => {
                res.end()
            })

        req.pipe(proxyReq)
    }
}

function redirect(req, res, options) {
    let host = proxyConfig.getHost(options.hostname, options.path)
    let mock = proxyConfig.getMock(options.hostname, options.path)

    if (!mock && !host) {
        saveCookie(options)
        doTransparent(req, res, options)
    }

    req.on('end', () => {
        if (mock) {
            doMock(req, res, options, mock)
            return
        }

        if (host) {
            doSwitchHost(req, res, options, host)
        }
    })
}

class Mocxy {
    constructor(config) {
        this.server = http.createServer(this.httpListener)
        this.server.on('connect', this.httpsListener)
    }

    start(port = 9999) {
        this.server.listen(port).on('listening', () => {
            console.log('mocxy started on %s \n', port)
        })
    }

    httpsListener(req, cltSocket, head) {
        let srvUrl = url.parse(`http://${req.url}`)

        createFakeHttpsWebSite(
            srvUrl.hostname,
            port => {
                var srvSocket = net.connect(
                    port,
                    '127.0.0.1',
                    () => {
                        cltSocket.write(
                            'HTTP/1.1 200 Connection Established\r\n' +
                                'Proxy-agent: simple-mocxy\r\n' +
                                '\r\n'
                        )
                        srvSocket.write(head)
                        srvSocket.pipe(cltSocket)
                        cltSocket.pipe(srvSocket)
                    }
                )
                srvSocket.on('error', err => {})
            },
            (req, res) => {
                let body = ''
                req.setEncoding(ENCODING)
                req.on('data', chunk => (body += chunk))

                var urlObject = url.parse(req.url)
                let options = {
                    protocol: 'https:',
                    hostname: req.headers.host.split(':')[0],
                    method: req.method,
                    port: 443,
                    path: urlObject.path,
                    headers: req.headers
                }

                redirect(req, res, options)
            }
        )
    }

    httpListener(req, res) {
        let body = ''
        req.setEncoding(ENCODING)
        req.on('data', chunk => (body += chunk))

        let { hostname, port, path } = url.parse(req.url)
        let { method, headers } = req

        let options = {
            protocol: 'http:',
            hostname,
            port,
            path,
            method,
            headers
        }

        redirect(req, res, options)
    }
}

module.exports = new Mocxy()
