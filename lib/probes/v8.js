const ready = require('../utils/ready');
const v8 = require('v8');
const gc = (require('gc-stats'))();

/* eslint-disable */
const aliases = {
  new_space: 'heap/space/new',
  old_space: 'heap/space/old',
  code_space: 'heap/space/code',
  map_space: 'heap/space/map',
  large_object_space: 'heap/space/large_object',
  total_heap_size: 'heap/total',
  total_heap_size_executable: 'heap/executable',
  used_heap_size: 'heap/used',
  heap_size_limit: 'heap/limit',
  total_physical_size: 'heap/physical',
  total_available_size: 'heap/total_available',
};
/* eslint-enable */

// 在 probes 目录内直接使用 kagent.xxx 即可
ready((kagent) => {

  kagent.guage('v8', () => {
    const _v8 = {};
    
    if (typeof v8.getHeapSpaceStatistics === 'function') {
      var data = v8.getHeapSpaceStatistics();
      for (const item of data) {
        const name = item.space_name;
        const aliased = aliases[name];
        if (aliased) {
          _v8[aliased] = Math.round(item.space_used_size / 1000);
        }
      }
    }
  
    if (typeof v8.getHeapStatistics === 'function') {
      var heapStats = v8.getHeapStatistics();
      for (const [name, value] of Object.entries(heapStats)) {
        const aliased = aliases[name];
        if (aliased) {
          _v8[aliased] = Math.round(value / 1000);
        }
      }
    }
  
    return _v8;
  });

  gc.on('stats', function (stats) {
    kagent.meter('v8/gc').mark();
    kagent.histogram('v8/gc/pause').update(stats.pause / (Math.pow(10, 6)));
  });
})

