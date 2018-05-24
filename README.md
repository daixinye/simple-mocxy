# simple-mocxy

一个正向代理，用于切换 Hosts 和数据 Mock。

配合Chrome插件 [SwitchySharp](https://chrome.google.com/webstore/detail/proxy-switchysharp/dpplabbmogkhghncfbfdeeokoefdjegm) 使用更佳。

## 使用

### 配置
修改 `./data/hosts` 文件，像配置系统Hosts文件一样配置它：
```
# 支持单行注释
api.guapizuzhi.com 127.0.0.1 # 支持行末注释

m.local.guapizuzhi.com
  ip 127.0.0.1
  port 8000
  headers
    =simple-mocxy true
    +cookie mock=1;

m.guapizuzhi.com 127.0.0.1
```
可以看到，除了映射IP地址之外，我们还可以指定其端口（port），甚至还能修改HTTP 请求的Headers。

需要注意的是，一个域名下面的子配置需要有两个空格的缩进哦。

### 启动
```shell
$ npm run start

server started on 9999
```
可以看到代理服务器默认启动在 9999 端口上。

### 配合 SwitchySharp 使用
在Chrome中安装 [SwitchySharp](https://chrome.google.com/webstore/detail/proxy-switchysharp/dpplabbmogkhghncfbfdeeokoefdjegm) 后，新建情景模式，手动配置HTTP代理（暂不支持HTTPS）为`127.0.0.1:9999`。

接下来Chrome中访问的HTTP站点，都会先通过 simple-mocxy 代理。根据相关配置，代理会将HTTP请求发送到指定的服务器。如果当前网站没有相关配置，代理就会进行透明转发。

## 关于

### simple-moxcy 想尝试解决什么问题？

做前端开发，与后端的联调当然是不可避免的。然而繁杂的本地环境、测试环境、预发环境和线上环境让debug变得异常麻烦。所谓的切换环境，大多数情况下就是切换Hosts。切就切吧...但是切换系统Hosts有一个主要问题是，系统和浏览器通常都会有缓存。而这个缓存给我们带来的直观感受就是，“切换Hosts有延迟”。simple-moxcy 想尝试解决的第一个问题，就是切换Hosts的延迟问题。

除此之外，代码发布到测试环境或预发环境后，我们常常也会面临难以调试的问题。作为一个前端你打开了开发者工具，看到Network下发的数个请求就开始疑惑，是前端没正确处理接口给的数据吗？还是后端给的数据不正确呢？这种情况下，如果能在浏览器端”直接修改接口数据“该有多好。 simple-moxcy 想尝试解决的第二个问题，就是通过配置拦截请求并返回期望的数据，通过一招移花接木，直接就可以进行一个初步的问题定位。

另外，simple-moxcy 还想在系统Hosts配置方式的基础上，加入更多方便的功能，比如把域名指定到某台服务器上的非80端口上、给HTTP Request带上一些Header。这些功能都应该可以通过简单的配置实现。
