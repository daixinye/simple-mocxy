const fs = require('fs')

// 获取数据
const getData = (host, path, cb) => {
    let ip = getIp(host)
    if(ip){
        fs.readFile(`./${host}/${ip}/${path}`, 'utf8', (err, res) => {
            cb({
                success: true,
                message: '恭喜你获得了你想要的数据',
                data: JSON.parse(res)
            })
        })
    } else {
        cb({
            success: false,
            message: '没有要找到对应的ip'
        })
    }
}
/**
 * 根据host获取ip
 * @param {*} host 
 */
const getIp = (host) => {
    return readConfigFile('./config.json')[host]
}
/**
 * 读取所有的配置的json
 * @param {*} host 
 */
const readConfigFile = (file) => {
    let fileData = null
    try {
        fileData = fs.readFileSync(file, 'utf8')
        if(fileData){
            return JSON.parse(fileData)
        } else {
            return {}
        }
    } catch(e) {
        throw new Error('config.json不存在')
    }
}
/**
 * 判断文件夹或者文件是否存在
 * @param {*} path 
 */
const fsExistsSync = (path) => {
    try {
        fs.accessSync(path, fs.F_OK)
    } catch(e) {
        return false
    }
    return true
}
/**
 * 初始化，根据host和path获取对应的ip和数据
 * @param {*} host 
 * @param {*} path 
 */
const init = (host, path) => {
    return new Promise((resolve, reject) => {
        if(fsExistsSync(host)){
            getData(host, path, function(data){
                if(data && data.success){
                    resolve(data)
                } else {
                    reject(data)
                }
            })
        } else {
            reject({
                success: false,
                message: 'host或者path不存在～'
            })
        }
    })
}

let host = 'api.guapizuzhi.com'

init(host, 'getList.json')
.then(data => {
    console.log(data)
})
.catch(err => {
    console.log(err)
})

module.exports = {
    init
}