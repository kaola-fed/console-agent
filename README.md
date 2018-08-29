
<p align=center>
    <h1>KAgent</h1>
    <a href="https://github.com/kaola-fed/kagent">
        <img src="https://img.shields.io/npm/v/kagent.svg?style=for-the-badge"/>
    </a>
    <a href="https://travis-ci.org/kaola-fed/agentk">
        <img src="https://img.shields.io/travis-ci/kaola-fed/kagent.svg?branch=feature_megalo&style=for-the-badge"/>
    </a>
    <a href="https://codecov.io/gh/kaola-fed/kagent">
        <img src="https://img.shields.io/codecov/c/github/kaola-fed/kagent.svg?style=for-the-badge"/>
    </a>
</p>

## 特性
* 内置应用度量标准 Metrics，支持应用打点；
* 内置 Node.js 进程级信息收集任务，支持外部扩展；
* 内置 Filesystem Reporter 上报监控信息，支持自定义；

## API 介绍
### start(options, callback)
```js
const KAgent = require('kagent');
KAgent.start({
    name: 'appName',
    reporter: ['filesystem'],
    tasks: [],
    rundir: path.join(__dirname, 'fixtures/run'),
    flushInterval: 1000,
    files: {
        'built-in': path.join(__dirname, 'fixtures/agentk/built-in.log'),
        application: path.join(__dirname, 'fixtures/agentk/application.log'),
        error: path.join(__dirname, 'fixtures/common-error.log')
    }
}, (err, results) => {

});
```

### new Metrix(scope, tag)
```js
const { Metrix } = require('kagent');
const metrix = new Metrix({
    files: {
        'built-in': path.join(__dirname, 'fixtures/agentk/built-in.log'),
        application: path.join(__dirname, 'fixtures/agentk/application.log'),
        error: path.join(__dirname, 'fixtures/common-error.log')
    }
});
```

#### getCounter()
```js
const counter = metrix.getCounter();
counter.inc();
counter.dec();
```

#### getGuage()
```js
const guage = metrix.getGuage();
guage.setValue();
```

#### getHistogram()
```js
const histogram = metrix.getHistogram();
histogram.update(1);
```

#### getMeter()
```js
const meter = metrix.getMeter();
meter.mark();

```
#### getTimer()
```js
const timer = metrix.getTimer();
// some async thing
// await xxx();
timer.end();
```

#### addMetric(scope, metric, tag?)
```js
metrix.addMetric(['connection'], counter);
metrix.addMetric(['cpu'], guage);
metrix.addMetric(['histogram'], histogram);
metrix.addMetric(['meter'], meter);
metrix.addMetric(['access'], timer);
```

## 概念抽象
### Logger
应用运行的过程中的 Metrics 记录，会运行在 worker 进程。

### Collector
Metrics 的收集者，负责定期的执行 Task 任务，并合并所有 Task 的输出，调用 Reporter 上报。

#### Task
Task 是 Collector 得以生成 Metrics 信息的载体，每个 Task 都允许设定执行时间，不设定执行时间，或是和默认的执行周期一致的，则会推入到 collect 阶段前执行。

有以下内置的 Task：

##### Process Task
收集所有运行中的 Node.js 进程运行信息，包括 CPU 占用率、内存占用、启动参数等等。

##### Metrix Parser Task
分析应用/框架的打点记录，用于生成 QPS/RT 等关键指标，也可用于业务数据的打点。

##### Clean Log Task
定期清除 KAgent 的运行日志，以防撑爆硬盘.

### Agent
服务端的代理人，包括：

1. 执行服务端命令；
2. 上报 Metrics 信息。

#### Reporter
由 Collector 驱动，进行 Metrics 上报，内置落盘文件的 Reporter。

##### Filesystem Reporter
落盘 JSON 文件，一般可由系统 agent 采集，汇总到自家的监控系统。

## LICENSE
MIT
