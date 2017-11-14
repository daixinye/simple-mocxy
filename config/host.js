// 模块
const fs = require('fs')
const _path = require('path')

// 常量
const HOSTS_PATH = _path.join(__dirname, '../data/hosts.json')

class Hosts {
  constructor() {
    this.hosts = this._read()
  }

  // 获取配置
  get(hostname) {
    let config = this.hosts[hostname]
    switch (typeof config) {
      case 'string':
        return {
          ip: config
        }
      case 'object':
        return config
      default:
        return null
    }
  }

  // 删除配置
  delete(hostname) {
    let hosts = this.hosts
    delete hosts[hostname]
    this._save(hosts)

    return hosts
  }

  // 增加/修改配置
  set(hostname, host) {
    let hosts = this.hosts
    hosts[hostname] = host
    this._save(hosts)
  }

  _read() {
    let isHostsExist = fs.existsSync(HOSTS_PATH)
    if (isHostsExist) {
      return JSON.parse(fs.readFileSync(HOSTS_PATH, { encoding: 'utf-8' }))
    } else {
      let hosts = {}
      fs.writeFileSync(HOSTS_PATH, JSON.stringify(hosts, null, 2), {
        encoding: 'utf-8'
      })
      return hosts
    }
  }

  _save(hosts) {
    fs.writeFileSync(HOSTS_PATH, JSON.stringify(hosts, null, 2), hosts)
  }
}
module.exports = Hosts
