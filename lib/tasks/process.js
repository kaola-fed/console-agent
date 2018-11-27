const kAgent = require('../core/k-agent');

exports.doTask = () => {
  kAgent.pLog({
    data: {
      cpu: 100
    }
  });
}