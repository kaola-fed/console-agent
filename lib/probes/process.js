const pidusage = require('pidusage');
const ready = require('../utils/ready');

// 在 probes 目录内直接使用 kagent.xxx 即可
ready((kagent) => {
  kagent.guage('process/resource', async() => {
    const proc = await pidusage(process.pid);
    proc.executable = process.argv0;
    proc.argv = process.argv.slice(1);
    proc.memoryUsage = process.memoryUsage();
  
    return Object.entries(proc).reduce((prev, [name, value]) => {
      return Object.assign(prev, {
        [name]: value
      })
    }, {});
  });
  
})