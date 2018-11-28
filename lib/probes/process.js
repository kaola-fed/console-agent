const kagent = require('../core/kagent');

kagent.guage('process', async() => {
  return {
    cpu: 100,
    memory: 100,
  };
})
