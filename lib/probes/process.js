const kagent = require('../core/kagent');


// 在 probes 目录内直接使用 kagent.xxx 即可
kagent.guage('process', async() => {
  return {
    cpu: 100,
    memory: 100,
  };
});

// 否则需要执行 kagent.ready() 确保 kagent 已初始化完毕
// kagent.ready(() => {
//   kagent.guage('process', async() => {
//     return {
//       cpu: 100,
//       memory: 100,
//     };
//   });
// })

// 系统监控一般只在一个进程中运行，使用 `kagent.isMaster` 做判断
// kagent.ready(() => {
//   if (kagent.isMaster) {
//     kagent.guage('system.cpu', async() => {
//       return {
//         cpu: 100,
//         memory: 100,
//       };
//     });
//   }
// })
