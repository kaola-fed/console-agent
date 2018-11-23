const path = require('path');

module.exports = (dir) => {
  return path.join(dir, process.cwd().replace(/[^\w]/g, '_') + '.sock');
}