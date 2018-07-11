const assert = require('assert')

const hosts = require('../src/host')

describe('#hosts', () => {
  describe('#get()', () => {
    it('("www.guapizuzhi.com") -> ip: 127.0.0.1 ...', () => {
      assert.deepEqual(hosts.get('www.guapizuzhi.com', ''), {
        ip: '127.0.0.1',
        port: 80,
        protocol: 'http',
        headers: {}
      })
    })

    it('("m.guapizuzhi.com") -> protocol: http ...', () => {
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

  describe('#hasConfig()', () => {
    it('("www.guapizuzhi.com") -> true', () => {
      assert.equal(hosts.hasConfig('www.guapizuzhi.com'), true)
    })
    it('("notexist.com") -> false', () => {
      assert.equal(hosts.hasConfig('notexist.com'), false)
    })
    it('( ) -> false', () => {
      assert.equal(hosts.hasConfig(), false)
    })
  })
})
