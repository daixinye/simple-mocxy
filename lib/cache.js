const fs = require('fs');
const path = require('path');

const PATH = path.join(__dirname, '_cache');

class Cache {
  constructor() {
    if (!fs.existsSync(PATH)) {
      fs.mkdirSync(PATH);
    }
  }

  get(name, key) {
    let cache_path = path.join(PATH, name, key);
    if (fs.existsSync(cache_path)) {
      return fs.readFileSync(cache_path, 'utf-8');
    }
    return null;
  }

  set(name, key, value) {
    let cache_dir_path = path.join(PATH, name);

    if (!fs.existsSync(cache_dir_path)) {
      fs.mkdirSync(cache_dir_path);
    }

    let cache_path = path.join(PATH, name, key);
    fs.writeFile(cache_path,value, e => {
      e && console.log('cache: ',e)
    })
  }
}

module.exports = new Cache();
