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

process.on('message', async (msg) => {
    msg.action = msg.action || msg;
    msg.data = msg.data || {};
    if (msg.action === 'collect') {
        const id = msg.data.id;
        const results = await agent.collect();
        process.send({
            action: 'response-collect-' + id,
            data: results
        });
    } else if (msg.action === 'report') {
        const id = msg.data.id;
        const results = await agent.collect();
        const rs = await agent.report(results);

        process.send({
            action: 'response-report-' + id,
            data: rs
        });
    }
})

gracefulExit({
    logger: console,
    label: 'agentk'
});