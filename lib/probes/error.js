const ready = require('../utils/ready');
const ErrorLogParser = require('../utils/error-logs-parser');
const path = require('path');

let errorLogParser;
ready((kagent) => {
  if (kagent.isMaster) {
    kagent.guage('error', async () => {
      if (!errorLogParser) {
        errorLogParser = new ErrorLogParser({
          file: path.join(process.cwd(), './logs/common-error.log')
        });

        await errorLogParser.ready();
        const error = errorLogParser.getResult();
        errorLogParser = undefined;

        return error;
      }
    });
  }
})