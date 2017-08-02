const Github = require('github');


module.exports.issueExists = issueExists;
module.exports.createIssue = createIssue;
module.exports.closeIssue = closeIssue;

function issueExists(options) {
  return new Promise ((resolve, reject) => {
    const github = new Github({});

    github.authenticate({
      type: "oauth",
      token: options.token
    });

    var issues = [];

    var req = github.issues.getForRepo({
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
}

function createIssue(options) {
  return new Promise ((resolve, reject) => {
    const github = new Github({});

    github.authenticate({
      type: "oauth",
      token: options.token
    });

    if (issueExists.length > 0) {
      console.log('Issue already exists. Commenting instead.'); // TODO: Make comment functionality
    } else {
      console.log(issueExists.length);
      var create = github.issues.create({
        owner: options.owner,
        repo: options.repo,
        title: options.message.user + ': ' + options.message.issue,
        body: options.message.description,
        assignees: [options.message.user]
      }, function (err, res) {
        if (err) reject(err);
        options.githubIssue = res.data.number;
        console.log('Github issue created. URL: ' + res.data.url);
      });
      resolve(create);
    }
  });
}

function closeIssue(options) {
  return new Promise ((resolve, reject) => {
    const github = new Github({});

    github.authenticate({
      type: "oauth",
      token: options.token
    });
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
