const assert = require('assert')

const hosts = require('../lib/host');

assert.deepEqual(hosts.get('m.guapizuzhi.com', '/j/abc'), {
    ip: '127.0.0.2',
    headers: {},
    protocal: 'https',
    port: 443
})

assert.deepEqual(hosts.get('m.guapizuzhi.com'), {
    ip: '127.0.0.1',
    headers: {},
    protocal: 'http',
    port: 80
})

process.exit(0)