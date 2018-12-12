const URL = require('url');
const http = require('http');
const ready = require('../utils/ready');
let kagent;
const createServer = http.createServer;

ready(_kagent => {
  kagent = _kagent;
});

http.createServer = function(...args) {
  const [handle] = args;

  args[0] = (req, res) => {
    const end = res.end;
    const url = URL.parse(req.url)
    const path = url.pathname;
    const timer = kagent.timer('app/url/' + path);

    timer.start();

    res.end = function(...args1) {
      timer.close();
      kagent.meter('app/url/' + res.statusCode + '/' + path).mark();
      return Reflect.apply(end, this, args1);
    }

    handle(req, res);
  }

  return Reflect.apply(createServer, this, args);
};

