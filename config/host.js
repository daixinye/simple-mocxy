// 模块
const fs = require('fs')
const _path = require('path')

// 常量
const HOSTS_PATH = _path.join(__dirname, '../data/hosts.json')

class Hosts {
  constructor() {
    this.hosts = this._readHosts()
  }

  getIP(hostname) {
    return this.hosts[hostname] || null
  }

  _readHosts() {
    let isHostsExist = fs.existsSync(HOSTS_PATH)
    if (isHostsExist) {
      return JSON.parse(fs.readFileSync(HOSTS_PATH, { encoding: 'utf-8' }))
    } else {
      let hosts = {}
      fs.writeFileSync(HOSTS_PATH, JSON.stringify(hosts, null, 4), {
        encoding: 'utf-8'
      })
      return hosts
    }
  }
}
module.exports = Hosts