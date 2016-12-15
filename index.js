const ops = require('./lib/ops');
const util = require('./lib/util');
const path = require('path');
const fs = require('fs');
const async = require('async');

const argv = require('minimist')(process.argv.slice(2),{
  'default': {
    'config': path.join(__dirname,'config.json')
  }
});

async.waterfall([
  function(next) {
    fs.readFile(argv.config,'utf-8',next);
  },
  function(json,next) {
    util.config = argv.config = JSON.parse(json);
    if (argv._.length > 0 && ops[argv._[0]]) {
      ops[argv._[0]].fn(argv,next);
    } else {
      var errMessage = 'Invalid operation. Choices are:\n';
      for(var op in ops) {
        errMessage += op + ': ' + ops[op].name + '\n';
      }
      next(errMessage);
    }
  }
],function(err) {
  util.close();
  if (err) {
    console.error(err);
  }
});
