'use strict';

var request = require('request').defaults({jar: true});
var fs = require('fs');

function outputGraph(nodes, edges, filename) {
  return new Promise(function (resolve, reject) {
    var wholeName = (filename || 'graph')+'.gdf';
    var wholePath = './output/'+wholeName;

    var gdfString = 'nodedef>name VARCHAR,label VARCHAR\n';
    for(let un of nodes) {
      gdfString+=un+','+un+'\n';
    }

    gdfString += 'edgedef>node1 VARCHAR,node2 VARCHAR\n'
    
    for(let cn of edges) {
      gdfString += cn[0]+','+cn[1]+'\n';
    }

    fs.unlink(wholePath, function (err) {
      if(err) return reject(err);
      fs.writeFile(wholePath, gdfString, function (err) {
        if(err) return reject(err);
        return resolve(null);
      });
    });
  });
}

function outputUsers(users, filename) {
  return new Promise(function (resolve, reject) {
    var filename = filename || 'users';
    var wholeFilename = filename + '.txt';
    var wholePath = './output/' + wholeFilename;
    fs.unlink(wholePath, function (err) {
      if(err) return reject(err);
      fs.writeFile(wholePath, users.join('\n'), function (err) {
        if(err) return reject(err);
        return resolve(null);
      });
    });
  });
}

function getUser(username) {
//  console.log('search user', username);
  return new Promise(function (resolve, reject) {
    try{
      request.get({url: 'https://www.trustroots.org/api/users/'+username}, function (err, resp, body) {
  //      console.log(resp);
        if(err) return reject(err);
        var jb = JSON.parse(body);
        resolve({_id: jb._id, username: jb.username});
      });
    }
    catch(err) {
      reject(err);
    }
  });
}

function getConnections(id) {
//  console.log('getting connections of', id)
  return new Promise(function (resolve, reject) {
    try {
      request.get({url: 'https://www.trustroots.org/api/contacts/'+id}, function (err, resp, body) {
        if(err) return reject(err);
        var jb = JSON.parse(body);
        var cts = [];

        for(let cnt of jb){
          //include only confirmed contacts
          if(cnt.confirmed === true || cnt.confirmed === undefined) {
            let us = cnt.users;
            let usr = cnt.users[0]._id === id ? cnt.users[1] : cnt.users[0];
            cts.push(usr);
          }
        }
        resolve(cts);
      });
    }
    catch(err) {
      reject(err);
    }
  });
}

module.exports = {
  output: {
    graph: outputGraph,
    users: outputUsers
  },
  get: {
    user: getUser,
    connections: getConnections
  }
};
