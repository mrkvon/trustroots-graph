'use strict';

let fs = require('fs');
let denodeify = require('denodeify');

let unlink = denodeify(fs.unlink);
let writeFile = denodeify(fs.writeFile);

let User = require('./User');

class Graph {
  constructor() {
    this._users = [];
    this._links = [];
  }

  get users() {
    return this._users;
  }

  get links() {
    //get connections of every user (and not duplicate, or yes?)
    let links = [];
    let users = this.users;
    //create connections from the user and her contacts
    for(let user of users) {
      let contacts = user.contacts;
      for(let contact of contacts) {
        links.push([user.username, contact.username, contact.created]);      
      }
    }
    return links;
  }

  //returns boolean indicating whether user is already in the graph._users
  hasUser (username) {
    for(let usr of this._users) {
      if(usr.username === username) {
        return true;
      }
    }
    return false;
  }

  //async
  
  //filling the graph with the data
  async scrape(usernames) {
    //TODO there may be also ids stored for efficiency

    let currentLevel = usernames;
    let nextLevel;
    while(currentLevel.length > 0) {
      nextLevel = [];
      for(let username of currentLevel) {
        let user = new User(username);

        //get connections of each user from nextLevel
        try {
          await user.scrape();

          //save the user to this._users;
          
          this._users.push(user);
          console.log(`${this.users.length}  ${user.username}  ${user.contacts.length}`);

          //fill first-time users to _nextLevel;
          let contacts = user.contacts;
          for(let contact of contacts) {
            let isNotAnywhereYet = nextLevel.indexOf(contact.username) === -1 && currentLevel.indexOf(contact.username) === -1 && this.hasUser(contact.username) === false;
            if(isNotAnywhereYet) {
              nextLevel.push(contact.username);
            }
          }
        }
        catch(e) {
          //there are some inconsistencies in the database - some contacts don't exist 
          if(e.status === 404) {}
          else{
            throw e;
          }
        }
      }
      currentLevel = nextLevel;
    }
  }
  
  async outputGraph (filename) {
    var path = `./output/${filename || 'graph'}.gdf`;
    
    //outputString will be eventually written to the gdf file
    //first the node header
    var outputString = 'nodedef>name VARCHAR,label VARCHAR\n';
    //write users to the outputString;
    let users = this.users;
    for(let user of users) {
      outputString += `${user.username},${user.username}\n`;
    }
    
    //write edge header to the outputString
    outputString += 'edgedef>node1 VARCHAR,node2 VARCHAR\n'
    //write links to the outputString
    let links = this.links;
    for(let link of links) {
      outputString += `${link[0]},${link[1]}\n`;
    }
    
    //write the data to the file
    await unlink(path);
    await writeFile(path, outputString);
  }

  async outputDynamicGraph (filename) {
    var path = `./output/${filename || 'graph'}.gdf`;
    
    //outputString will be eventually written to the gdf file
    //first the node header
    var outputString = 'nodedef>name VARCHAR,label VARCHAR,timeinterval VARCHAR\n';
    //write users to the outputString;
    let users = this.users;
    for(let user of users) {
      outputString += `${user.username},${user.username},${getOutputDate.call(user.created)}\n`;
    }
    
    //write edge header to the outputString
    outputString += 'edgedef>node1 VARCHAR,node2 VARCHAR,timeinterval VARCHAR\n'
    //write links to the outputString
    let links = this.links;
    for(let link of links) {
      outputString += `${link[0]},${link[1]},${getOutputDate.call(link[2])}\n`;
    }
    
    //write the data to the file
    await unlink(path);
    await writeFile(path, outputString);
  }

  async outputUsers (filename) {
    var path = `./output/${filename || 'users'}.txt`;

    //get usernames from the list of user objects
    var usernames = [];
    var users = this.users;
    for(let user of users) {
      usernames.push(user.username);
    }
    
    //write to output file
    await unlink(path);
    await writeFile(path, usernames.join('\n')+'\n');
  }
}

function getOutputDate() {
  let YYYY = this.getUTCFullYear();
  let MM = `00${this.getUTCMonth()+1}`.slice(-2);
  let DD = `00${this.getUTCDate()}`.slice(-2);
  let hh = `00${this.getUTCHours()}`.slice(-2);
  let mm = `00${this.getUTCMinutes()}`.slice(-2);
  let ss = `00${this.getUTCSeconds()}`.slice(-2);
  return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
}

module.exports = Graph;
