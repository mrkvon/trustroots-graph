'use strict';

let co = require('co');

let TR = require('./TR');
//object User represents each user
//async User.scrape(): read User data
class User {
  constructor (username) {
    this._username = username;
    this._contacts = [];
    this._created;
  }

  get username () {
    return this._username;
  }
  
  get created () {
    return this._created;
  }

  get id () {
    return this._id;
  }

  get contacts () {
    let contacts = [];
    for(let contact of this._contacts) {
      contacts.push({
        username: contact.username,
        id: contact.id,
        created: contact.created
      });
    }
    return contacts;
  }
  
  //async
  scrape () {
    return co.call(this, function * () {
      let user = yield TR.user(this._username);
      let contacts = yield TR.contacts(user.id);

      this._id = user.id;
      this._created = user.created
      this._contacts = contacts;
    });
  }
}

module.exports = User;
