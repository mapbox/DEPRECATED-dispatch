'use strict';

const tape = require('tape');
const nock = require('nock');
const githubRequests = require('../../lib/github.js');
const issuesFixtures = require('../fixtures/github.fixtures.js');

tape('[github] Receive auth object from request', function(assert) {
  let auth = {
    type: 'oauth',
    token: 'FakeApiToken'
  };

  let ghAuth = githubRequests.authenticate('FakeApiToken');

  assert.same(ghAuth.auth, auth, 'Function returns expected auth object');
  assert.end();
});

tape('[github] Finds requested issue', function(assert) {
  let issue = [ issuesFixtures.issue1()] ;

  let optionsExists = {
    token: 'FakeApiToken',
    owner: 'testOwner',
    repo: 'testRepo',
    title: 'testTitle'
  };

  nock('https://api.github.com')
      .get('/repos/testOwner/testRepo/issues')
      .query({state: 'open', access_token: 'FakeApiToken'})
      .reply(200, issue);

  githubRequests.checkForIssue(optionsExists)
  .then(res => {
    assert.deepEqual(Array.isArray(res), true, 'Response is an array');
    assert.deepEqual(res, issue, 'Found issue');
    assert.end();
  })
    .catch(err => { console.log(err); });
});

tape('[github] Does not find a match to the requested issue', function(assert) {
  let issue = issuesFixtures.issue1();

  let optionsDoesntExist = {
    token: 'FakeApiToken',
    owner: 'testOwner',
    repo: 'testRepo',
    title: 'anotherTestTitle'
  };

  nock('https://api.github.com')
      .get('/repos/testOwner/testRepo/issues')
      .query({state: 'open', access_token: 'FakeApiToken'})
      .reply(200, issue);

  githubRequests.checkForIssue(optionsDoesntExist)
  .then(res => {
    assert.deepEqual(Array.isArray(res), true, 'Response is an array');
    assert.deepEqual(res, [], 'Returns empty array');
    assert.end();
  })
    .catch(err => { console.log(err);} );
});

tape('[github] Pagination works', function(assert) {
  let issues = issuesFixtures.manyIssues(); // contains 150 issues

  let optionsExist = {
    token: 'FakeApiToken',
    owner: 'testOwner',
    repo: 'testRepo',
    title: 'testTitle'
  };

  nock('https://api.github.com')
      .get('/repos/testOwner/testRepo/issues')
      .query({state: 'open', access_token: 'FakeApiToken'})
      .reply(200, issues);

  githubRequests.checkForIssue(optionsExist)
  .then(res => {
    assert.deepEqual(Array.isArray(res), true, 'Response is an array');
    assert.deepEqual(res, issues, 'Returns all 150 issues');
    assert.end();
  })
    .catch(err => { console.log(err);} );
});

tape('[github] Does not create issue because one exists', function(assert) {
  let issue = issuesFixtures.issue1();

  let optionsExists = {
    token: 'FakeApiToken',
    owner: 'testOwner',
    repo: 'testRepo',
    title: 'testTitle',
    body: 'testBody'
  };

  nock('https://api.github.com')
      .get('/repos/testOwner/testRepo/issues')
      .query({state: 'open', access_token: 'FakeApiToken'})
      .reply(200, issue);

  githubRequests.createIssue(optionsExists)
    .then(res => {
      assert.deepEqual(res, {status: 'exists', issue: 7}, 'Does not create issue');
      assert.end();
    })
    .catch(err => { console.log(err); } );
});

tape('[github] Creates issue', function(assert) {
  let noIssue = [];
  let issue = issuesFixtures.issue1();

  let options = {
    token: 'FakeApiToken',
    owner: 'testOwner',
    repo: 'testRepo',
    title: 'testTitle',
    body: 'testBody',
    user: 'testUser'
  };

  nock('https://api.github.com')
      .get('/repos/testOwner/testRepo/issues')
      .query({state: 'open', access_token: 'FakeApiToken'})
      .reply(200, noIssue);

  nock('https://api.github.com:443', {"encodedQueryParams":true})
      .post('/repos/testOwner/testRepo/issues', {"title":"testTitle","body":"testBody"})
      .query({"access_token":"FakeApiToken"})
      .reply(201, issue);

  githubRequests.createIssue(options)
  .then(res => {
    assert.deepEqual(res.issue, issue.number, 'Issue created');
    assert.equal(res.user, issue.assignee.login, 'Issue is assigned');
    assert.end();
  })
  .catch(err => { console.log(err); });
});

tape('[github] Closes issue', function(assert) {
  let closedIssue = issuesFixtures.closedIssue();

  let options = {
    token: 'FakeApiToken',
    owner: 'testOwner',
    repo: 'testRepo',
    number: '1'
  };

  nock('https://api.github.com:443', {"encodedQueryParams":true})
    .patch('/repos/testOwner/testRepo/issues/1', {"state":"closed"})
    .query({"access_token":"FakeApiToken"})
    .reply(200, closedIssue);

  githubRequests.closeIssue(options)
  .then(res => {
    assert.deepEqual(res.data, closedIssue, 'Issue is closed');
    assert.end();
  })
  .catch(err => { console.log(err); });
});
