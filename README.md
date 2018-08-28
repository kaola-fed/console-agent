# KAgent

<p align=center>
    <a href="https://github.com/kaola-fed/kagent">
        <img src="https://img.shields.io/npm/v/kagent.svg?style=for-the-badge"/>
    </a>
    <a href="https://travis-ci.org/kaola-fed/agentk">
        <img src="https://img.shields.io/travis-ci/kaola-fed/kagent.svg?branch=feature_megalo&style=for-the-badge"/>
    </a>
    <a href="https://codecov.io/gh/kaola-fed/agentk">
        <img src="https://img.shields.io/codecov/c/github/kaola-fed/agentk.svg?style=for-the-badge"/>
    </a>
</p>

## 特性
* 内置 Metrics 的业界系统度量体系，支持应用内 Metrics 打点；
* 内置 Node.js 进程级信息收集任务，支持外部扩展；
* 内置 Filesystem Reporter 上报监控信息，支持自定义；

## 概念抽象
### Generator
这是应用运行过程信息的生成者，一般会负责监听端口，处理`HTTP` 业务逻辑，进行业务所需要的计算，需要在运行过程中进行一些 Metrcs 的打点操作。

### Collector
作为 Metrcs 的收集者，抽象出 Task 的概念，Collector 负责定期的执行 Task 任务，并合并所有 Task 的输出，作为当前的 Metrics 状态，后调用 Reporter 上报。

#### Task
Task 是 Collector 得以生成 Metrics 信息的载体，每个 Task 都允许设定执行时间，不设定执行时间，或是和默认的执行周期一致的，则会推入到 collect 阶段前执行。

有以下内置的 Task：

##### Process Task
收集所有运行中的 Node.js 进程运行信息，包括 CPU 占用率、内存占用、启动参数等等。

##### Metrix Parser Task
分析应用/框架的打点记录，用于生成 QPS/RT 等关键指标，也可用于业务数据的打点。

##### Clean Log Task
定期清除 KAgent 的运行日志，以防撑爆硬盘.

### Connector
负责与服务端系统的对接，包括服务端命令执行以及 Metrics 信息上报。

#### Reporter
由 Collector 驱动，进行 Metrics 的上报，内置落盘文件的 Reporter。

##### Filesystem Reporter
落盘 JSON 文件，一般可由系统 agent 采集，汇总到自家的监控系统。

## LICENSE
MIT