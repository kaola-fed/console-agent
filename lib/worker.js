const Agent = require('../core/agent');

// const {parserMap} = require('../core/parser');
const gracefulExit = require('graceful-process');

const options = JSON.parse(process.argv[2]);

process.on('uncaughtException', (e) => {
    console.error(e);
});

const agent = new Agent(options);

agent.ready()
    .then(() => {
        process.send({
            action: 'started'
        });
    })
    .catch(e => console.error(e));

gracefulExit({
    logger: console,
    label: 'agentk'
});