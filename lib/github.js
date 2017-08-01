const Github = require('github');

module.exports.issueExists = (options) => {
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
};

// TODO
//module.exports.closeIssue
