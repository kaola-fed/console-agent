const ready = require('../utils/ready');
const os = require('os');

ready((kagent) => {
  if (kagent.isMaster) {
    kagent.guage('system', async() => {
      const _os = {
        'load': os.loadavg(),
        'cpus': os.cpus(),
        'freemem': os.freemem()
      };

      return _os;
    });
  }
})