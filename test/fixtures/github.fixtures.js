'use strict';

module.exports.issue1 = issue1;
module.exports.manyIssues = manyIssues;
module.exports.closedIssue = closedIssue;

module.exports.broadcastIssue = {
  url: 'https://api.github.com/repos/testGitHubOwner/testGitHubRepo/issues/7',
  repository_url: 'https://api.github.com/repos/testGitHubOwner/testGitHubRepo',
  labels_url: 'https://api.github.com/repos/testGitHubOwner/testGitHubRepo/issues/7/labels{/name}',
  comments_url: 'https://api.github.com/repos/testGitHubOwner/testGitHubRepo/issues/7/comments',
  events_url: 'https://api.github.com/repos/testGitHubOwner/testGitHubRepo/issues/7/events',
  html_url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7',
  id: 123,
  number: 7,
  title: 'testGitHubTitle',
  user: {},
  labels: [],
  state: 'open',
  locked: false,
  assignee: null,
  assignees: [],
  milestone: null,
  comments: 0,
  created_at: '2017-08-02T23:36:11Z',
  updated_at: '2017-08-02T23:36:11Z',
  closed_at: null,
  body: 'testGithubBody\n\n @testGitHubUser'
};

module.exports.selfServiceIssue = {
  id: 123,
  url: 'https://api.github.com/repos/testGitHubOwner/testGitHubRepo/issues/7',
  repository_url: 'https://api.github.com/repos/testGitHubOwner/testGitHubRepo',
  labels_url: 'https://api.github.com/repos/testGitHubOwner/testGitHubRepo/issues/7/labels{/name}',
  comments_url: 'https://api.github.com/repos/testGitHubOwner/testGitHubRepo/issues/7/comments',
  events_url: 'https://api.github.com/repos/testGitHubOwner/testGitHubRepo/issues/7/events',
  html_url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7',
  number: 7,
  state: 'open',
  title: 'testGitHubTitle',
  body: 'testGitHubBody\n\n @testGitHubUser',
  user: {},
  labels: [],
  assignee: null,
  assignees: [],
  milestone: null,
  locked: false,
  comments: 0,
  closed_at: null,
  created_at: '2017-08-02T23:36:11Z',
  updated_at: '2017-08-02T23:36:11Z'
};

const dataDump = {
  url: 'https://api.github.com/repos/testOwner/testRepo/issues/7',
  repository_url: 'https://api.github.com/repos/testOwner/testRepo',
  labels_url: 'https://api.github.com/repos/testOwner/testRepo/issues/7/labels{/name}',
  comments_url: 'https://api.github.com/repos/testOwner/testRepo/issues/7/comments',
  events_url: 'https://api.github.com/repos/testOwner/testRepo/issues/7/events',
  html_url: 'https://github.com/testOwner/testRepo/issues/7',
  id: 123,
  number: 7,
  title: 'testTitle',
  user: {},
  labels: [],
  state: 'open',
  locked: false,
  assignee: null,
  assignees: [],
  milestone: null,
  comments: 0,
  created_at: '2017-08-02T23:36:11Z',
  updated_at: '2017-08-02T23:36:11Z',
  closed_at: null,
  body: 'testBody'
};

function issue1() {
  let issue1 = dataDump;
  return issue1;
}

function closedIssue() {
  let closedIssue = {
    url: 'https://api.github.com/repos/testOwner/testRepo/issues/7',
    repository_url: 'https://api.github.com/repos/testOwner/testRepo',
    labels_url: 'https://api.github.com/repos/testOwner/testRepo/issues/7/labels{/name}',
    comments_url: 'https://api.github.com/repos/testOwner/testRepo/issues/7/comments',
    events_url: 'https://api.github.com/repos/testOwner/testRepo/issues/7/events',
    html_url: 'https://github.com/testOwner/testRepo/issues/7',
    id: 123,
    number: 7,
    title: 'testTitle',
    user: {},
    labels: [],
    state: 'closed',
    locked: false,
    assignee: null,
    assignees: [],
    milestone: null,
    comments: 0,
    created_at: '2017-08-02T23:36:11Z',
    updated_at: '2017-08-02T23:36:11Z',
    closed_at: null,
    body: 'testBody',
    'closed_by': {
      'login': 'testUser'
    }
  };

  return closedIssue;
}

function manyIssues() {
  let issues = [];

  for (var i = 0; i <= 150; i++) {
    issues.push(dataDump);
  }

  return issues;
}
