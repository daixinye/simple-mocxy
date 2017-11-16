const fs = require('fs')
const readline = require('readline')
const os = require('os')
const _path = require('path')

const HOSTS_PATH = _path.join(__dirname, '../data/hosts')

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
      let parser = new Parser(
        fs.readFileSync(HOSTS_PATH, { encoding: 'utf-8' })
      )
      return parser.parse()
    } else {
      let hosts = {}
      this._save({})
      return hosts
    }
  }

  _save(hosts) {
    // fs.writeFileSync(HOSTS_PATH, JSON.stringify(hosts, null, 2), hosts)
  }
}

class Parser {
  constructor(file) {
    this.file = file
    this.INDENT = '  '
    this.lineStack = file.split(os.EOL)
  }
  parse() {
    let root = {}
    let current = root
    let stack = [root]

    this.lineStack.forEach(line => {
      line = this.readline(line)
      if (!line.key) return

      current = stack[line.indent]
      if (line.key && line.value) {
        current[line.key] = line.value
      }
      if (line.key && !line.value) {
        current[line.key] = {}
        stack[line.indent + 1] = current[line.key]
      }
    })
    return root
  }
  readline(line) {
    let obj = {
      indent: 0,
      key: null,
      value: null
    }
    line = line.split('#')[0].split(this.INDENT)
    line.forEach(i => {
      if (i === '') {
        obj.indent++
      } else {
        i = i.split(' ')
        obj.key = i[0] || null
        obj.value = i[1] || null
      }
    })
    return obj
  }
}

module.exports = Hosts
