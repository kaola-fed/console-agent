const list = [];
let isReady = false;

const ready = (kagent) => {
  list.forEach((fn) => fn(kagent));
  isReady = true;
};

module.exports = function(fn, kagent) {
  if (fn === true) {
    return ready(kagent);
  }

  if (isReady) {
    fn(kagent);
  } else {
    list.push(fn);
  }
}