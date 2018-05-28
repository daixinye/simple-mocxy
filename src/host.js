const fs = require('fs')
const readline = require('readline')
const _path = require('path')

const HOSTS_PATH = _path.join(__dirname, '../config/hosts.yaml')
const js_yaml = require('js-yaml')

class Host {
  constructor(ip, port, headers) {
    this.ip = ip || ''
    this.port = port || 80
    this.headers = headers || {}
  }
}

class Hosts {
  constructor() {
    this.hosts = this._read()
    fs.watchFile(
      HOSTS_PATH,
      { persistent: true, interval: 500 },
      (curr, prev) => {
        console.log('Hosts 配置发生改变，已重新加载')
        this.hosts = this._read()
      }
    )
  }

  // 获取配置
  get(hostname) {
    let hostConfig = this.hosts[hostname]
    switch (typeof hostConfig) {
      case 'string':
        var ip = hostConfig
        return new Host(ip)
      case 'object':
        var ip = hostConfig.ip
        var port = hostConfig.port
        var headers = hostConfig.headers
        return new Host(ip, port, headers)
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
      return js_yaml.safeLoad(fs.readFileSync(HOSTS_PATH, {
        encoding: 'utf-8'
      }))
    } else {
      let hosts = {}
      this._save({})
      return hosts
    }
  }

  _save(hosts) {
  }
}

module.exports = Hosts
