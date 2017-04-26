'use strict';

let TR = require('./TR');
let Graph = require('./Graph');
let prompt = require('prompt');
let denodeify = require('denodeify');
let promptGet = denodeify(prompt.get);

(async function () {
  var loginSchema = {
    properties: {
      username: {
        required: true
      },
      password: {
        hidden: true,
        replace: '*'
      }
    }
  };

  var startSchema = {
    properties: {
      username: {
      }
    }
  }
   
  // 
  // prompt for username and password
  //
  console.log('\n**************************************************\n')
  console.log('\tWelcome to the Trustroots scraper!');
  console.log('\n**************************************************\n\n')
  console.log('Write your login data for trustroots.org:');
  prompt.start();
  let result = await promptGet(loginSchema);
  let username = result.username;
  let password = result.password

  await TR.login(username, password);
  console.log('successfully logged in as', username);


  console.log(`\n\nWrite the username from which you wish to start crawling:\ndefault: ${username}`);
  prompt.start();
  let startResult = await promptGet(startSchema);
  let startUsername = startResult.username || username;

  console.log('\nscraping started. be patient. it can take a while (around 1000 connected users).\n');
  console.log('\noutput:\ncount  username  count contacts\n');

  var graph = new Graph();
  await graph.scrape([startUsername]);

  //write the data to files
  await graph.outputUsers();
  await graph.outputDynamicGraph();

  console.log('\n\n********************************************************\n');
  console.log('\tfinished successfully!\n');
  console.log('\tyou will find the output in');
  console.log('\t./output/graph.gdt');
  console.log('\t./output/users.txt\n');
  console.log('\tyou can try Gephi to visualise them\n');
  console.log('\tGoodbye! ^_^\n');
  console.log('********************************************************\n');
})()
.catch(function (e) {
  if(e.status === 403) {
    console.log('login not successful.');
  }
  else console.error(e);
});
