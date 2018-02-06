'use strict';

const test = require('tape');
const nock = require('nock');
const github = require('../../lib/github.js');
const githubFixtures = require('../fixtures/github.fixtures.js');

const token = 'testToken';

test('[github] [authenticate] Receive auth object from request', function(assert) {
  let auth = {
    type: 'oauth',
    token: token
  };
  let ghAuth = github.authenticate(token);
  assert.same(ghAuth.auth, auth, '-- function returns expected auth object');
  assert.end();
});

test('[github] [checkForIssue] Finds requested issue', function(assert) {
  let issue = [ githubFixtures.issue1() ];
  let retrigger = true;
  let options = {
    owner: 'testOwner',
    repo: 'testRepo',
    title: 'testTitle'
  };

  nock('https://api.github.com')
    .get('/repos/testOwner/testRepo/issues')
    .query({ state: 'open', access_token: token })
    .reply(200, issue);

  github.checkForIssue(options, retrigger, token)
    .then(res => {
      assert.deepEqual(Array.isArray(res), true, '-- response is an array');
      assert.deepEqual(res, issue, '-- found issue');
      assert.end();
    })
    .catch(err => { console.log(err); });
});

test('[github] [checkForIssue] Does not find a match to the requested issue', function(assert) {
  let retrigger = true;
  let options = {
    owner: 'testOwner',
    repo: 'testRepo',
    title: 'testTitleNotFound'
  };

  nock('https://api.github.com')
    .get('/repos/testOwner/testRepo/issues')
    .query({ state: 'open', access_token: token })
    .reply(function(uri, requestBody) { // eslint-disable-line no-unused-vars
      return [
        githubFixtures.noIssueFound.code,
        githubFixtures.noIssueFound.message,
        githubFixtures.noIssueFound.headers
      ];
    });

  github.checkForIssue(options, retrigger, token)
    .then(res => {
      assert.deepEqual(Array.isArray(res), true, '-- response is an array');
      assert.deepEqual(res, [], '-- returns empty array');
      assert.end();
    })
    .catch(err => { console.log(err); });
});

test('[github] [checkForIssue] Pagination works', function(assert) {
  let issues = githubFixtures.manyIssues(); // contains 150 issues
  let retrigger = true;
  let options = {
    owner: 'testOwner',
    repo: 'testRepo',
    title: 'testTitle'
  };

  nock('https://api.github.com')
    .get('/repos/testOwner/testRepo/issues')
    .query({ state: 'open', access_token: token })
    .reply(200, issues);

  github.checkForIssue(options, retrigger, token)
    .then(res => {
      assert.deepEqual(Array.isArray(res), true, '-- response is an array');
      assert.deepEqual(res, issues, '-- returns all 150 issues');
      assert.end();
    })
    .catch(err => { console.log(err); });
});

test('[github] [createIssue] Does not create issue because one exists. Retrigger is on.', function(assert) {
  let issue = githubFixtures.issue1();
  let retrigger = true;
  let options = {
    owner: 'testOwner',
    repo: 'testRepo',
    title: 'testTitle',
    body: 'testBody'
  };

  nock('https://api.github.com')
    .get('/repos/testOwner/testRepo/issues')
    .query({ state: 'open', access_token: token })
    .reply(200, issue);

  github.createIssue(options, retrigger, token)
    .then(res => {
      assert.deepEqual(res, { status: 'exists', issue: 7 }, '-- does not create issue');
      assert.end();
    })
    .catch(err => { console.log(err); });
});

test('[github] [createIssue] Does not create issue because one exists. Retrigger is off.', function(assert) {
  let issue = githubFixtures.closedIssue();
  let retrigger = false;
  let options = {
    owner: 'testOwner',
    repo: 'testRepo',
    title: 'testTitle',
    body: 'testBody'
  };

  nock('https://api.github.com')
    .get('/repos/testOwner/testRepo/issues')
    .query({ state: 'all', access_token: token })
    .reply(200, issue);

  github.createIssue(options, retrigger, token)
    .then(res => {
      assert.deepEqual(res, { status: 'exists', issue: 7 }, '-- does not create issue');
      assert.end();
    })
    .catch(err => { console.log(err); });
});

test('[github] [createIssue] No existing issue, creates new issue', function(assert) {
  let issue = githubFixtures.issue1();
  let retrigger = true;
  let options = {
    owner: 'testOwner',
    repo: 'testRepo',
    title: 'testTitle',
    body: 'testBody'
  };

  nock('https://api.github.com')
    .get('/repos/testOwner/testRepo/issues')
    .query({ state: 'open', access_token: token })
    .reply(200, []);

  nock('https://api.github.com', { encodedQueryParams: true })
    .post('/repos/testOwner/testRepo/issues', { title: 'testTitle', body: 'testBody' })
    .query({ access_token: token })
    .reply(201, issue);

  github.createIssue(options, retrigger, token)
    .then(res => {
      assert.deepEqual(res.number, issue.number, '-- issue is created');
      assert.end();
    })
    .catch(err => { console.log(err); });
});

test('[github] [closeIssue] Closes issue', function(assert) {
  let closedIssue = githubFixtures.closedIssue();
  let options = {
    owner: 'testOwner',
    repo: 'testRepo',
    number: '1'
  };

  nock('https://api.github.com', { encodedQueryParams: true })
    .patch('/repos/testOwner/testRepo/issues/1', { state: 'closed' })
    .query({ access_token: token })
    .reply(200, closedIssue);

  github.closeIssue(options, token)
    .then(res => {
      assert.deepEqual(res.data, closedIssue, '-- issue is closed');
      assert.end();
    })
    .catch(err => { console.log(err); });
});
