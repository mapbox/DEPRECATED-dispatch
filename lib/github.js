'use strict';

const GitHubApi = require('github');

/**
 * Authenticate and initialize GitHub API
 *
 * @name authenticate
 * @param {string} token - GitHub token
 */
function authenticate(token) {
  const github = new GitHubApi({});

  github.authenticate({
    type: 'oauth',
    token: token
  });

  return github;
};

/**
 * Check for existing GitHub issue
 *
 * @name checkForIssue
 * @param {object} options - contains owner, repo, issue title, and body
 * @param {boolean} retrigger - if true, sends dispatch alert if issue is already open
 *                              if false, does not send a new alert for existing issue
 * @param {string} token - GitHub token
 */
const checkForIssue = (options, retrigger, token) => {
  return new Promise ((resolve, reject) => {
    const github = authenticate(token);
    let issues = [];
    let issueState = 'open';

    if (retrigger === false) { issueState = 'all'; }

    github.issues.getForRepo({
      owner: options.owner,
      repo: options.repo,
      state: issueState
    }, getIssues);

    function getIssues(err, res) {
      if (err) {
        // if there are no issues found, resolve empty array
        if (err.status === 'Not Found') resolve([]);
        reject(err);
      } else {
        issues = issues.concat(res.data);
        if (github.hasNextPage(res)) {
          github.getNextPage(res, getIssues);
        } else {
          const match = issues.filter(issue => issue.title === options.title);
          resolve(match);
        }
      }
    };
  });
};

/**
 * Create a new GitHub issue
 *
 * @name createIssue
 * @param {object} options - contains owner, repo, issue title, and body
 * @param {boolean} retrigger - if true, sends dispatch alert if issue is already open
 *                              if false, does not send a new alert for existing issue
 * @param {string} token - GitHub token
 */
const createIssue = (options, retrigger, token) => {
  return new Promise ((resolve, reject) => {
    const github = authenticate(token);
    const issueExists = checkForIssue(options, retrigger, token);

    issueExists.then(response => {
      if (response.length > 0) {
        resolve({ status: 'exists', issue: response[0].number });
      } else {
        let output = options;

        github.issues.create(options, (err, res) => {
          if (err) reject(err);
          if (res) {
            output.number = res.data.number;
            output.url = res.data.html_url;
          }

          resolve(output);
        });
      }
    }).catch(err => { reject(err); });
  });
};

/**
 * Close a GitHub issue
 *
 * @name closeIssue
 * @param {object} options - contains owner, repo, issue number
 * @param {string} token - GitHub token
 */
const closeIssue = (options, token) => {
  return new Promise ((resolve, reject) => {
    const github = authenticate(token);

    github.issues.edit({
      owner: options.owner,
      repo: options.repo,
      number: options.number,
      state: 'closed'
    }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

module.exports.authenticate = authenticate;
module.exports.checkForIssue = checkForIssue;
module.exports.createIssue = createIssue;
module.exports.closeIssue = closeIssue;
