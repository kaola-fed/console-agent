const kAgent = require('../core/k-agent');

kAgent.guage('process', async() => {
  return {
    cpu: 100
  };
})