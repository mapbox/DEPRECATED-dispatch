var githubAPI = require('github');
var gh = new githubAPI({
  version: '3.0.0'
});

gh.authenticate({
  type: 'token',
  token: process.env.githubToken
})

var message1 = {
  severity: 'low',
  issue: 'not enough data',
  description: 'upload the section of the document',
  user: 'oliikit-test'
}
var message2 = {
  severity: 'high',
  issue: 'user did a real bad thing',
  description: 'go fix your bad thing',
  user: 'oliikit-test'
}

function processSNS(message) {
  if (message.severity === 'high') {

  } else {
    createGithubIssue(message);
  }
};

function createGithubIssue(message) {
  var issueParams = {
    owner: 'oliikit-test',
    repo: 'lambda-test',
    title: message.user + ': ' + message.issue,
    body: message.description,
    assignees: [message.user]
  };
  var links = [];

  function search(params, state){
    gh.search.issues({
      q: params.title + '+in:title+type:issue+state:' + state
    }, function(err, res) {
      if (err) console.log(err);

      // TODO: return links in an array from the search
      res.data.items.forEach(function(issue) {
        links.push(issue.url)
        return links
      })
    })
  };

  function comment(user, issueNum) {
    var commentParams = {
      owner: 'oliikit-test',
      repo: 'lambda-test',
      number: issueNum,
      body: '@' + user + ', following up on this issue. Have you had a chance to resolve it?'
    }

    gh.issues.createComment(commentParams, function(err, res) {
      if (err) console.log(err);
      if (res) console.log('Comment created. URL: ' + res.data.url);
    })
  };
};
