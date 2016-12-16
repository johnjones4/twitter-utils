const async = require('async');
const fs = require('fs');
const util = require('../util');
const parse = require('csv-parse');

module.exports = {
  'name': 'Unfollow',
  'fn': function(options,done) {
    if (options.csv) {
      async.waterfall([
        function(next) {
          fs.createReadStream(options.csv).pipe(parse({'columns': true},next));
        },
        function(csv,next) {
          if (csv.length > 0 && csv[1].id) {
            async.parallel(
              csv.map(function(user) {
                return function(next1) {
                  unFollow(user,next1);
                }
              }),
              next
            );
          } else {
            next(new Error('No id column!'));
          }
        }
      ],done);
    } else {
      done(new Error('Missing CSV option!'));
    }
  }
}

function unFollow(user,done) {
  util.requestQueue.push({
    'params': {
      'operation': '/friendships/destroy.json',
      'method': 'DELETE',
      'qs': {
        'user_id': user.id
      }
    },
    'callback': function(err,res,body) {
      if (body && body.following === false) {
        console.log('Unfollowed @' + body.screen_name);
      } else {
        console.error('Error unfollowing ' + user.id);
        console.error(body);
      }
      done();
    }
  });
}
