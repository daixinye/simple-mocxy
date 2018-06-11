'use strict';
const http = require('http');
const https = require('https');
const url = require('url');
const net = require('net');

const hosts = require('./host');
const mocks = require('./mock');

const ENCODING = 'utf-8';

const proxyConfig = {
  getMock(host, path) {
    return mocks.getMock({
      host,
      path
    });
  },
  getHost(hostname, path) {
    return hosts.get(hostname, path);
  }
};

class Mocxy {
  constructor(config) {
    this.server = http.createServer(this.httpListener);
    this.server.on('connect', this.httpsListener);
  }

  start(port = 9999) {
    this.server.listen(port).on('listening', () => {
      console.log('server started on %s \n', port);
    });
  }

  httpsListener(req, cltSocket, head) {
    let srvUrl = url.parse(`http://${req.url}`);

    // console.log(`HTTPS ${srvUrl.hostname}:${srvUrl.port}`);

    var srvSocket = net.connect(
      srvUrl.port,
      srvUrl.hostname,
      () => {
        cltSocket.write(
          'HTTP/1.1 200 Connection Established\r\n' +
            'Proxy-agent: Simple-Moxcy\r\n' +
            '\r\n'
        );
        srvSocket.write(head);
        srvSocket.pipe(cltSocket);
        cltSocket.pipe(srvSocket);
      }
    );

    srvSocket.on('error', e => {
      console.error(e);
    });
  }

  httpListener(req, res) {
    let body = '';
    req.setEncoding(ENCODING);
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      let { hostname, port, path } = url.parse(req.url);
      let { method, headers } = req;

      let host = proxyConfig.getHost(hostname, path);
      let mock = proxyConfig.getMock(hostname, path);

      let options = {
        hostname,
        port,
        path,
        method,
        headers
      };

      if (mock) {
        // 返回 mock 数据
        res.setHeader('content-type', 'text/plain; charset=' + ENCODING);
        res.setHeader(
          'Access-Control-Allow-Origin',
          req.headers['origin'] || '*'
        );
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.end(JSON.stringify(mock), ENCODING);
        return;
      }

      if (host) {
        options.hostname = host.ip || hostname;
        options.port = host.port || 80;
        for (let header in host.headers) {
          let operator = header[0];
          let value = host.headers[header];
          header = header.slice(1);
          switch (operator) {
            case '=':
              headers[header] = value;
              break;
            case '+':
              headers[header] += value;
              break;
            default:
          }
        }

        console.log(
          'HTTP %s %s %s %s => %s %s %s',
          method,
          hostname,
          port || 80,
          path,
          host.protocal,
          host.ip,
          host.port
        );

        if (host.protocal === 'https') {
          let httpsReq = https
            .request(options, httpsRes => {
              httpsRes.headers['simple-moxcy-host'] = options.hostname;
              httpsRes.headers['simple-moxcy-port'] = options.port;
              httpsRes.headers['simple-moxcy-headers'] = JSON.stringify(
                host.headers || {}
              );

              res.writeHead(httpsRes.statusCode, httpsRes.headers);
              httpsRes.pipe(res);
            })
            .on('error', err => res.end());

          req.pipe(httpsReq);

          return this;
        } else {
          let proxyReq = http
            .request(options, proxyRes => {
              if (host) {
                proxyRes.headers['simple-moxcy-host'] = options.hostname;
                proxyRes.headers['simple-moxcy-port'] = options.port;
                proxyRes.headers['simple-moxcy-headers'] = JSON.stringify(
                  host.headers || {}
                );
              }
              res.writeHead(proxyRes.statusCode, proxyRes.headers);
              proxyRes.pipe(res);
            })
            .on('error', err => res.end());

          req.pipe(proxyReq);
          return this;
        }
      }

      let proxyReq = http
        .request(options, proxyRes => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        })
        .on('error', err => res.end());

      proxyReq.write(body);
      proxyReq.end();

      req.pipe(proxyReq);
      return this;
    });
  }
}

module.exports = new Mocxy();
