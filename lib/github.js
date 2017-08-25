'use strict';
const GitHubApi = require('github');

function authenticate(token) {
  const github = new GitHubApi({});

  github.authenticate({
    type: "oauth",
    token: token
  });

  return github;
};

const checkForIssue = (options) => {
  return new Promise ((resolve, reject) => {
    let github =  authenticate(options.token);
    let issues = [];
    let req = github.issues.getForRepo({
      owner: options.owner,
      repo: options.repo,
      state: 'open'
    }, getIssues);

    function getIssues(err, res) {
      if (err) reject(err);
      else {
        issues = issues.concat(res.data);
        if (github.hasNextPage(res)) {
          github.getNextPage(res, getIssues);
        } else {
          // XXX make this whole thing more efficient by returning as soon as
          // a match is found, instead of building up all the state and then
          // returning.
          var match = issues.filter(issue => issue.title === options.title);
          resolve(match);
        }
      }
    };
  });
};

const createIssue = (options) => {
  return new Promise ((resolve, reject) => {
    let github =  authenticate(options.token);
    let issueExists = checkForIssue(options);
    issueExists.then(response => {
      if (response.length > 0) {
        console.log('Issue %s already exists', response[0].number);
        resolve({status: 'exists', issue: response[0].number});
      } else {
        github.issues.create({
          owner: options.owner,
          repo: options.repo,
          title: options.title,
          body: options.body
        }, function (err, res) {
          if (err) reject(err);
          if (res) {
            options.issue = res.data.number;
            options.url = res.data.url;
            console.log('Github issue created. URL: ' + res.data.url);
          }
          resolve(options);
        });
      }
    })
    .catch(error => { console.log(error); });
  });
};

const closeIssue = (options) => {
  return new Promise ((resolve, reject) => {
    let github =  authenticate(options.token);
    github.issues.edit({
      owner: options.owner,
      repo: options.repo,
      number: options.issue,
      state: 'closed'
    }, function (err, res) {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

module.exports.checkForIssue = checkForIssue;
module.exports.createIssue = createIssue;
module.exports.closeIssue = closeIssue;
module.exports.authenticate = authenticate;
