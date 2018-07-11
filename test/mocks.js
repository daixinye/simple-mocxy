const assert = require('assert')

const mocks = require('../src/mock')

describe('#mocks', () => {
  describe('#get()', () => {
    it('({ hostnanme: "notexist.com" }) -> null', () => {
      assert.equal(
        mocks.get({
          hostnanme: 'notexist.com'
        }),
        null
      )
    })

    it('({hostname: "api.guapizuzhi.com", path: "/getList"}) -> { mock:1 }', () => {
      assert.equal(
        mocks.get({
          hostname: 'api.guapizuzhi.com',
          path: '/getList'
        }),
        JSON.stringify({ mock: 1 })
      )
    })
  })

  describe('#hasConfig()', () => {
    it('(api.guapizuzhi.com) -> true', () => {
      assert.equal(mocks.hasConfig('api.guapizuzhi.com'), true)
    })
    it('(notexist.com) -> false', () => {
      assert.equal(mocks.hasConfig('notexist.com'), false)
    })
    it('( ) -> false', () => {
      assert.equal(mocks.hasConfig(), false)
    })
  })
})
