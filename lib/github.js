'use strict';
const Github = require('github')

function authenticate(token) {
  const github = new Github({});

  github.authenticate({
    type: "oauth",
    token: token
  });

  return github;
};

const issueExists = (options) => {
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
    }
  });
};

let options = {
  token: '022e7f758e95b4a7eab3374cc4e6aac221639004',
  owner: 'mapbox',
  repo: 'dispatcher-notifications-test',
  title: 'there is a fire'
}
issueExists(options).catch(err => {console.log(err);});

const createIssue = (options) => {
  return new Promise ((resolve, reject) => {
    let github =  authenticate(options.token);
    let checkForIssue = issueExists(options);
    checkForIssue
    .then(response => {
      if (response.length > 0) {
        console.log('Issue already exists. Commenting instead.');
        resolve('No issue created');
        // TODO: Make comment functionality
      } else {
        let create = github.issues.create({
          owner: options.owner,
          repo: options.repo,
          title: options.title,
          body: options.body,
          assignees: [options.user]
        }, function (err, res) {
          if (err) reject(err);
          if (res) {
            options.githubIssue = res.data.number
            console.log('Github issue created. URL: ' + res.data.url);
          }
          resolve(options);
        });
      }
    })
    .catch(error => { console.log(error); });
  })
};

const closeIssue = (options) => {
  return new Promise ((resolve, reject) => {
    let github =  authenticate(options.token);
    github.issues.edit({
      owner: options.owner,
      repo: options.repo,
      number: options.githubIssueNumber,
      state: 'closed'
    }, function (err, res) {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

module.exports.issueExists = issueExists;
module.exports.createIssue = createIssue;
module.exports.closeIssue = closeIssue;
module.exports.authenticate = authenticate;
