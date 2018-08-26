'use strict';

var exec = require('child_process').exec;

/**
  * Spawn a binary and read its stdout.
  * @param  {String} cmd
  * @param  {Function} done(err, stdout)
  */
function run(cmd, options, done) {
    if (typeof options === 'function') {
        done = options;
        options = undefined;
    }

    var executed = false;
    var ch = exec(cmd, options);
    var stdout = '';
    var stderr = '';

    ch.stdout.on('data', function(d) {
        stdout += d.toString();
    });

    ch.stderr.on('data', function(d) {
        stderr += d.toString();
    });

    ch.on('error', function(err) {
        if (executed) {
            return;
        }
        executed = true;
        done(new Error(err));
    });

    ch.on('close', function(code, signal) {
        if (executed) {
            return;
        }
        executed = true;

        if (stderr) {
            return done(new Error(stderr));
        }

        done(null, stdout, code);
    });
}

module.exports = run;
