const async = require('async');
const util = require('../util');
const stringify = require('csv-stringify');
const _ = require('lodash');

const saveColumns = [
  'name',
  'id',
  'screen_name',
  'url',
  'location',
  'friends_count',
  'followers_count',
  'Friend',
  'Follower'
];

module.exports = {
  'name': 'User Report',
  'fn': function(options,done) {
    async.waterfall([
      function(next) {
        async.parallel([
          function(next1) {
            getUserPagedRequest('friends','Friend',next1);
          },
          function(next1) {
            getUserPagedRequest('followers','Follower',next1);
          },
        ],next);
      },
      function(lists,next) {
        joinLists(lists,next);
      },
      function(list,next) {
        outputList(list,next);
      }
    ],done);
  }
};

function getUserPagedRequest(operation,header,done) {
  const output = {
    'users': [],
    'type': operation
  }
  const req = function(cursor) {
    const params = {
      'cursor': cursor,
      'count': 200
    }
    util.requestQueue.push({
      'params': {
        'operation': '/' + operation + '/list.json',
        'qs': params
      },
      'callback': function(err,res,body) {
        if (err) {
          done(err);
        } else if (body && body.users) {
          body.users.forEach(function(user) {
            user[header] = true;
          });
          output.users = output.users.concat(body.users);
          if (body.next_cursor) {
            req(body.next_cursor);
          } else {
            done(null,output);
          }
        } else {
          console.error(new Error(JSON.stringify(body)));
          req(cursor);
        }
      }
    });
  }
  req(-1);
}

function joinLists(lists,done) {
  const masterList = [];
  lists.forEach(function(list) {
    list.users.forEach(function(user) {
      const foundUserIndex = masterList.findIndex(function(_user) {
        return _user.id === user.id;
      });
      if (foundUserIndex >= 0) {
        masterList[foundUserIndex] = _.defaults(masterList[foundUserIndex],user);
      } else {
        masterList.push(user);
      }
    });
  });
  done(null,masterList);
}

function outputList(list,next) {
  stringify(list,{'header':true,'columns':saveColumns},function(err,output){
    if (err) {
      next(err);
    } else {
      console.log(output);
      next();
    }
  });
}
