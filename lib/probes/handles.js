
const activeRequest = typeof process._getActiveRequests === 'function';
const activeHandles = typeof process._getActiveRequests === 'function';
const ready = require('../utils/ready');

// 在 probes 目录内直接使用 kagent.xxx 即可
ready((kagent) => {
  kagent.guage('process/handles', async() => {
    const handles = {}
  
    if (activeRequest) {
      handles.request = process._getActiveRequests().length;
    }
  
    if (activeHandles) {
      handles.handles = process._getActiveHandles().length;
    }
  
    return Object.entries(handles)
      .reduce((prev, [name, value]) => {
        return Object.assign(prev, {
          [name]: value
        })
      }, {});
  });
});
