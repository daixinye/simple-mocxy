const assert = require('assert')

const mocks = require('../src/mock')

describe('#mocks', () => {
  describe('#get()', () => {
    it('should return null when the value is not present', () => {
      assert.equal(
        mocks.get({
          hostnanme: 'notexist'
        }),
        null
      )
    })

    it('should return { mock: 1 } when the value is {hostname: "api.guapizuzhi.com", path: "/getList"}', () => {
      assert.equal(
        mocks.get({
          hostname: 'api.guapizuzhi.com',
          path: '/getList'
        }),
        JSON.stringify({ mock: 1 })
      )
    })
  })
})
