const fs = require('fs')
const _path = require('path')

const HOSTS_PATH = _path.join(__dirname, '../config/hosts.yaml')
const jsYaml = require('js-yaml')

const readConfig = function () {
  let isHostsExist = fs.existsSync(HOSTS_PATH)
  if (isHostsExist) {
    return jsYaml.safeLoad(
      fs.readFileSync(HOSTS_PATH, {
        encoding: 'utf-8'
      })
    )
  } else {
    let hosts = {}
    this._save({})
    return hosts
  }
}

class Host {
  constructor (ip, port, headers, protocol) {
    this.ip = ip || ''
    this.headers = headers || {}
    this.protocol = protocol || 'http'
    this.port = port || (protocol === 'https' ? 443 : 80)
  }
}

class Hosts {
  constructor () {
    this.hosts = readConfig()

    fs.watchFile(
      HOSTS_PATH,
      { persistent: true, interval: 500 },
      (curr, prev) => {
        console.log('Hosts config has reloaded')
        this.hosts = readConfig()
      }
    )
  }

  hasConfig (hostname = '') {
    return hostname in this.hosts
  }

  get (hostname, path = '') {
    let hostConfig = this.hosts[hostname]
    if (!hostConfig) {
      return null
    }

    if (hostConfig.path) {
      for (let p in hostConfig.path) {
        if (path.search(p) === 0) {
          hostConfig = hostConfig.path[p]
        }
      }
    }

    switch (typeof hostConfig) {
      case 'string':
        var ip = hostConfig
        return new Host(ip)
      case 'object':
        ip = hostConfig.ip
        var port = hostConfig.port
        var headers = hostConfig.headers
        var protocol = hostConfig.protocol
        return new Host(ip, port, headers, protocol)
      default:
        return null
    }
  }
}

module.exports = new Hosts()
