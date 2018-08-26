const Agent = require('./core/agentk');

// const {parserMap} = require('../core/parser');
const gracefulExit = require('graceful-process');

const options = JSON.parse(process.argv[2]);

process.on('uncaughtException', (e) => {
    // eslint-disable-next-line 
    console.error(e);
});

const agent = new Agent(options);

agent.ready()
    .then(() => {
        process.send({
            action: 'started'
        });
    })
    // eslint-disable-next-line 
    .catch(e => console.error(e));

gracefulExit({
    logger: console,
    label: 'agentk'
});