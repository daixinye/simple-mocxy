const assert = require('assert')

const hosts = require('../src/host')

describe('#hosts', () => {
  describe('#get()', () => {
    it('test get wwww.guapizuzhi.com', () => {
      assert.deepEqual(hosts.get('www.guapizuzhi.com', ''), {
        ip: '127.0.0.1',
        port: 80,
        protocol: 'http',
        headers: {}
      })
    })

    it('test get m.guapizuzhi.com', () => {
      assert.deepEqual(hosts.get('m.guapizuzhi.com'), {
        protocol: 'http',
        ip: '127.0.0.1',
        port: 8000,
        headers: {
          '=host': 'guapizuzhi.com',
          '+cookie': 'mock=1;'
        }
      })
    })
  })
})
