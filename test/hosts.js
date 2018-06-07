const Hosts = require('../src/host');

let hosts = new Hosts();

console.log(hosts.get('m.guapizuzhi.com', '/j/abc'));
console.log(hosts.get('m.guapizuzhi.com', ''));
console.log(hosts.get('m.guapizuzhi.com'));
