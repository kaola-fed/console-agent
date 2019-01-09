
<p align=center>
    <h1>console-agent</h1>
    <a href="https://github.com/kaola-fed/kagent">
        <img src="https://img.shields.io/npm/v/kagent.svg?style=for-the-badge"/>
    </a>
    <a href="https://travis-ci.org/kaola-fed/kagent">
        <img src="https://img.shields.io/travis-ci/kaola-fed/kagent.svg?branch=feature_megalo&style=for-the-badge"/>
    </a>
    <a href="https://codecov.io/gh/kaola-fed/kagent">
        <img src="https://img.shields.io/codecov/c/github/kaola-fed/kagent.svg?style=for-the-badge"/>
    </a>
</p>

## 架构图
### agent 与 connection 交互
![](https://user-images.githubusercontent.com/10825163/50828911-b761f200-137d-11e9-90f8-f94db6d9eed3.png)

## 特性
* Leader/Follower 进程模型，保障监控模块高可用；
* 内置进程监控探针，采集进程信息；
* 与 connection 模块维持长连接，上报监控信息与执行远程端命令

## 快速开始
### 注册应用
#### 1. 进入系统
![](https://user-images.githubusercontent.com/10825163/50830874-1296e300-1384-11e9-8872-dee5d2a1a4b2.png)
#### 2. 创建应用
![](https://user-images.githubusercontent.com/10825163/50830884-1b87b480-1384-11e9-9ee9-2fd4b49c9c8e.png)
#### 3. 记录 app_id 与 app_secret
![](https://user-images.githubusercontent.com/10825163/50830883-19255a80-1384-11e9-9f99-e2b37bc52221.png)

### 安装依赖
```bash
$ npm i -S console-agent
```

### 创建 `.kagentrc.js`
```js
module.exports = {
  "server": "http://127.0.0.1:7009",                // connection 模块暴露的地址
  "appid": "5",                                     // appid
  "secret": "84fe6510-1340-11e9-94fa-d9a76a880c81", // secret
  "cluster": "localjd"                              // 集群名
}
```

### 启动
```bash
$ node index.js --require ./node_modules/console-agent/index.js
```
*egg 用户推荐使用 [egg-console-agent](https://github.com/kaola-fed/egg-console-agent)*

## 使用
### 模块引入
```js
const agent = require('console-agent');
```

### ready
`Leader/Follower` 模型建立以及与 `Connection` 的对接是异步过程。本地埋探针的操作应当使用 `ready` 函数确保流程启动完毕。

```js
const getMysqlConnections = () => {};

agent.ready(() => {
    agent.guage('connections', () => {
        return getMysqlConnections()
    })
});
```

### 探针 API
#### agent.guage
```js
const getMysqlConnections = () => {};
agent.guage('connections', () => {
    return getMysqlConnections()
})
```

#### agent.counter
该操作用来统计某一时刻的数量，常用于统计连接数

```js
const redisCounter = agent.counter('redis');

redisCounter.inc();
redisCounter.dec();
```

#### agent.histogram
该操作用来统计某一操作的数据分布，如 `MIN`/`MAX`/`AVG`

```js
const redisRT = agent.histogram('redis-rt');

redisRT.update(35);
redisRT.update(34);
redisRT.update(33);
```

#### agent.meter
该操作用来统计某一操作的触发频率，如 `QPS`

```js
const redisQPS = agent.meter('redis-qps');

redisRT.mark();
redisRT.mark();
redisRT.mark();
```


#### agent.timer
`timer` 是 `meter` 与 `histogram` 的封装。

```js
const http = require('http');

http.createServer((req, res) => {
    const end = res.end;
    const url = URL.parse(req.url)
    const path = url.pathname;
    const timer = kagent.timer('http');
    timer.start();

    res.end = function(...args1) {
      timer.close();
      kagent.meter('app/url/' + res.statusCode + '/' + path).mark();
      return Reflect.apply(end, this, args1);
    }
});
```

## LICENSE
MIT
