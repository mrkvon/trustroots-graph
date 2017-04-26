'use strict';

let denodeify = require('denodeify');
let request = require('request').defaults({jar: true});

let get = denodeify(request.get, function (err, resp, body) {
  return [err, body];
});

let post = denodeify(request.post, function (err, resp, body) {
  return [err, body];
});

class TR {
  //async
  static async login(username, password) {
    let body = await post({url: 'https://www.trustroots.org/api/auth/signin', form:{username: username, password: password}});
    let jsonBody = JSON.parse(body);
    let isNotLoggedIn = jsonBody && jsonBody.hasOwnProperty('message') && jsonBody.message === 'Unknown user or invalid password';
    let isLoggedIn = jsonBody && jsonBody.hasOwnProperty('_id');

    if(isNotLoggedIn) {
      let e = new Error('login not successful');
      e.status = 403;
      throw e;
    }
    else if (isLoggedIn) {
      return;
    }
    else {
      let e = new Error(jsonBody.message || 'other error');
      e.status = 500;
      throw e;
    }
  }

  //async
  static logout() {
  
  }

  //show all existing hosts
  static hosts() {
  }

  static async user(username) {
    let body = await get({url: `https://www.trustroots.org/api/users/${username}`});
    let jsonBody = JSON.parse(body);
    if(jsonBody && jsonBody.hasOwnProperty('message') && jsonBody.message === 'Not found.') {
      let e = new Error('Not found.');
      e.status = 404;
      throw e;
    }
    return ({
      id: jsonBody._id,
      username: jsonBody.username,
      name: jsonBody.displayName,
      created: new Date(jsonBody.created),
      gender: jsonBody.gender
    });
  }

  static async contacts(id) {
    let body = await get({url: `https://www.trustroots.org/api/contacts/${id}`});
    let jsonBody = JSON.parse(body);

    let contacts = [];
    for(let rawContact of jsonBody){
      //include only confirmed and not deleted
      if(rawContact && rawContact.confirmed === true) {
        let contact = rawContact.user;
        delete rawContact.user;
        let finalContact = {
          id: contact._id,
          username: contact.username,
          name: contact.displayName,
          created: new Date(rawContact.created)
        }
        contacts.push(finalContact);
      }
    }
    return contacts;
  }
}

module.exports = TR;
