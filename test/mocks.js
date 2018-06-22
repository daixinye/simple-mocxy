const assert = require('assert');

const mocks = require('../lib/mock');

assert.deepEqual(
  mocks.get({
    hostname: 'api.guapizuzhi.com',
    path: '/getList'
  }),
  JSON.stringify({ mock: 1 })
);
