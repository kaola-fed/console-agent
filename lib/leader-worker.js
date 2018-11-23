const {Leader} = require('./');

const argv = JSON.parse(process.argv[2]);
const leader = new Leader({
  sock: argv.sock
});

leader.ready()
  .then(() => {
    process.send('started');
  })
  .catch(e => {
    console.error(e);
  })

// throw new Error('')