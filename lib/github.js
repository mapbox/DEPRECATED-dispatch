'use strict'
const Github = require('github');

function authenticate(token) {
  return new Promise((resolve, reject) => {
    const github = new Github({});

    github.authenticate({
      type: "oauth",
      token: token
    });

    resolve(github);
  });
};


const issueExists = (options) => {
  return new Promise ((resolve, reject) => {

    authenticate(options.token)
    .then(gh => {
      var issues = [];

      var req = gh.issues.getForRepo({
        owner: options.owner,
        repo: options.repo,
        state: 'open'
      }, getIssues);

      function getIssues(err, res) {
        if (err) reject(err);
        else {
          issues = issues.concat(res.data);
          if (gh.hasNextPage(res)) {
            gh.getNextPage(res, getIssues);
          } else {
            // XXX make this whole thing more efficient by returning as soon as
            // a match is found, instead of building up all the state and then
            // returning.
            var match = issues.filter(issue => issue.title === options.title);
            console.log(match);
            resolve(match);
          }
        }
      }
    })
    .catch(error => {console.log(error);})
  });
};

const createIssue = (options) => {
  return new Promise ((resolve, reject) => {
    authenticate(options.token)
    .then(gh => {
      let checkForIssue = issueExists(options);
      checkForIssue
      .then(response => {
        if (response.length > 0) {
          console.log('Issue already exists. Commenting instead.');
          // TODO: Make comment functionality
        } else {
          var create = gh.issues.create({
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
    .catch(error => { console.log(error); })
  })
};

const closeIssue = (options) => {
  return new Promise ((resolve, reject) => {
    authenticate(options.token)
    .then(gh => {
      gh.issues.edit({
        owner: options.owner,
        repo: options.repo,
        number: options.githubIssueNumber,
        state: 'closed'
      }, function (err, res) {
        if (err) reject(err);
        else resolve(res);
      });
    .catch(error => { console.log(error); })
    })
  });
};

module.exports.issueExists = issueExists;
module.exports.createIssue = createIssue;
module.exports.closeIssue = closeIssue;
