const ready = require('../utils/ready');
const path = require('path');
const KoaPath = path.join(process.cwd(), 'node_modules', 'koa')

let Application;

try {
  Application = require(KoaPath);
} catch(e) {
  // eslint-disable-next-line
}

if (Application) {
  const createContent = Application.prototype.createContext;
  ready((kagent) => {
    Application.prototype.createContext = function(...args) {
      const context = Reflect.apply(createContent, this, args);
      const onerror = context.onerror;
      context.onerror = function(...args2) {
        kagent.error(args2[0], context);
        return Reflect.apply(onerror, this, args2);
      }
      return context;
    }
  })
}