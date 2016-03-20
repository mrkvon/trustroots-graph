'use strict';

var fs = require('fs');
var request = require('request').defaults({jar: true});
var functions = require('./functions');
var output = functions.output;//graph, users
var get = functions.get; //user, connections
var login = require('./secret/login');

request.post({url: 'https://www.trustroots.org/api/auth/signin', form:{username: login.username, password: login.password}}, function (err, resp, body) {
  var checkuser = 'mrkvon';
  var nodes = [checkuser];
  var links = [];

  return scrape([checkuser], nodes, links)//, paths, connections)
    .then(null, function (err) {
      if(err) console.org(err);
    });
});

//this function should get users connected to previous row of users 
function scrape(usersToResearch, foundUsers, links) {
  //console.log(usersToResearch, 'scrape!');
  //console.log(foundUsers, 'found users');

  var contactUsernames = [];
  var promiseChain = Promise.resolve();
  for(let usrnm of usersToResearch) {

    promiseChain = promiseChain.then(researchFunction(usrnm, contactUsernames, links));
    

  }

  return promiseChain
    .then(function () {
      var newLevel = [];
      //console.log(contactArrays);
      //if users were not scraped yet
      //add them to usersToScrape
      //and add the to newLevel
        //console.log(ca);
      //console.log(contactUsernames);
      for(let c of contactUsernames) {
        if(foundUsers.indexOf(c) === -1) {
          foundUsers.push(c);
          newLevel.push(c);
          console.log(c);
        }
        else{
          console.log('***', c);
        }
      }
      //console.log(newLevel);
      return newLevel;
    })
    .then(function (nl) {
      //console.log(nl);
      console.log(foundUsers.length, '*******');
      console.log(nl.length, 'next level');
      if(nl.length > 0) {
        scrape(nl, foundUsers, links);
      }
      else {
        console.log(foundUsers.length);
        console.log('writing graph');
        return output.graph(foundUsers.sort(), links, 'graph')
          .then(function () {
            console.log('writing users')
            return output.users(foundUsers.sort(), 'users');
          })
          .then(function () {
            console.log('finished!');
          })
          .then(null, function (err){
            console.log(err);
          });
      }
    });
}

//this returns a function to put to .then() to create a for cycle.
function researchFunction(username, contactUsernames, links) {
  return function () {
    return get.user(username)
      .then(function (_usr) {
        return get.connections(_usr._id);
      })
      .then(function (cts) {
        for (let contact of cts) {
          if(contact) {
            links.push([contact.username, username]);
            if(contactUsernames.indexOf(contact.username) === -1)
              contactUsernames.push(contact.username);
          }
        }
        return;
      })
      .then(null, function (err) {console.log(err, username);});
  };
}
