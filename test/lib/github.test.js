const tape = require('tape');
const nock = require('nock');
const githubRequests = require('../../lib/github.js');
const issuesFixtures = require('../fixtures/github.js');

tape('Receive auth object from request', function(assert) {
  let auth = {
    type: 'oauth',
    token: 'FakeApiToken'
  };

  let ghAuth = githubRequests.authenticate('FakeApiToken');

  assert.same(ghAuth.auth, auth, 'Function returns expected auth object');
  assert.end();
});

tape('Finds requested issue', function(assert) {
  let issue = [ issuesFixtures.issue1()] ;

  let optionsExists = {
    token: 'FakeApiToken',
    owner: 'null',
    repo: 'island',
    title: 'foobar'
  }

  nock('https://api.github.com')
      .get('/repos/null/island/issues')
      .query({state: 'open', access_token: 'FakeApiToken'})
      .reply(200, issue);

  githubRequests.issueExists(optionsExists)
  .then(res => {
    assert.deepEqual(Array.isArray(res), true, 'Response is an array')
    assert.deepEqual(res, issue, 'Found issue')
    assert.end();
  })
  .catch(err => { console.log(err)} );
});

tape('Does not find a match to the request issue', function(assert) {
  let issue = issuesFixtures.issue1();

  let optionsDoesntExist = {
    token: 'FakeApiToken',
    owner: 'null',
    repo: 'island',
    title: 'foobatz'
  }

  nock('https://api.github.com')
      .get('/repos/null/island/issues')
      .query({state: 'open', access_token: 'FakeApiToken'})
      .reply(200, issue);

  githubRequests.issueExists(optionsDoesntExist)
  .then(res => {
    assert.deepEqual(Array.isArray(res), true, 'Response is an array')
    assert.deepEqual(res, [], 'Returns empty array')
    assert.end();
  })
  .catch(err => { console.log(err)} );
});

tape('Pagination works', function(assert) {
  let issues = issuesFixtures.manyIssues(); // contains 150 issues

  let optionsExist = {
    token: 'FakeApiToken',
    owner: 'null',
    repo: 'island',
    title: 'foobar'
  }

  nock('https://api.github.com')
      .get('/repos/null/island/issues')
      .query({state: 'open', access_token: 'FakeApiToken'})
      .reply(200, issues);

  githubRequests.issueExists(optionsExist)
  .then(res => {
    assert.deepEqual(Array.isArray(res), true, 'Response is an array')
    assert.deepEqual(res, issues, 'Returns all 150 issues')
    assert.end();
  })
  .catch(err => { console.log(err)} );
});

tape('Does not create issue because one exists', function(assert) {
  let issue = issuesFixtures.issue1();

  let optionsExists = {
    token: 'FakeApiToken',
    owner: 'null',
    repo: 'island',
    title: 'foobar',
    body: 'when the foo went to the bar',
    assignees: ['nully']
  }

  nock('https://api.github.com')
      .get('/repos/null/island/issues')
      .query({state: 'open', access_token: 'FakeApiToken'})
      .reply(200, issue);

  githubRequests.createIssue(optionsExists)
  .then(res => {
    assert.deepEqual(res, 'No issue created', 'Does not create issue')
    assert.end();
  })
  .catch(err => { console.log(err)} );
});

tape('Creates issue', function(assert) {
  let noIssue = []
  let issue = issuesFixtures.issue1();

  let options = {
    token: 'FakeApiToken',
    owner: 'null',
    repo: 'island',
    title: 'foobar',
    body: 'hurry hurry',
    user: 'null'
  }

  nock('https://api.github.com')
      .get('/repos/null/island/issues')
      .query({state: 'open', access_token: 'FakeApiToken'})
      .reply(200, noIssue);

  nock('https://api.github.com:443', {"encodedQueryParams":true})
      .post('/repos/null/island/issues', {"title":"foobar","body":"hurry hurry","assignees":["null"]})
      .query({"access_token":"FakeApiToken"})
      .reply(201, issue);

  githubRequests.createIssue(options)
  .then(res => {
    assert.deepEqual(res.githubIssue, issue.number, 'Issue created');
    assert.equal(res.user, issue.assignee.login, 'Issue is assigned');
    assert.end();
  })
  .catch(err => { console.log(err); });
});

tape('Closes issue', function(assert) {
  let closedIssue = issuesFixtures.closedIssue();

  let options = {
    token: 'FakeApiToken',
    owner: 'null',
    repo: 'island',
    githubIssueNumber: '1'
  };

  nock('https://api.github.com:443', {"encodedQueryParams":true})
    .patch('/repos/null/island/issues/1', {"state":"closed"})
    .query({"access_token":"FakeApiToken"})
    .reply(200, closedIssue)

  githubRequests.closeIssue(options)
  .then(res => {
    assert.deepEqual(res.data, closedIssue, 'Issue is closed');
    assert.end();
  })
  .catch(err => { console.log(err); });
});
