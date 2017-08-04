module.exports.issue1 = issue1;
module.exports.manyIssues = manyIssues;
module.exports.closedIssue = closedIssue;

const dataDump = {
  url: 'https://api.github.com/repos/null/island/issues/7',
  repository_url: 'https://api.github.com/repos/null/island',
  labels_url: 'https://api.github.com/repos/null/island/issues/7/labels{/name}',
  comments_url: 'https://api.github.com/repos/null/island/issues/7/comments',
  events_url: 'https://api.github.com/repos/null/island/issues/7/events',
  html_url: 'https://github.com/null/island/issues/7',
  id: 123,
  number: 1,
  title: 'foobar',
  user: {},
  labels: [],
  state: 'open',
  locked: false,
  assignee: {
    'login': 'null'
  },
  assignees: [],
  milestone: null,
  comments: 0,
  created_at: '2017-08-02T23:36:11Z',
  updated_at: '2017-08-02T23:36:11Z',
  closed_at: null,
  body: 'hurry hurry'
}

function issue1() {
  let issue1 = dataDump;

  return issue1;
}

function closedIssue() {
  let closedIssue = {
    url: 'https://api.github.com/repos/null/island/issues/7',
    repository_url: 'https://api.github.com/repos/null/island',
    labels_url: 'https://api.github.com/repos/null/island/issues/7/labels{/name}',
    comments_url: 'https://api.github.com/repos/null/island/issues/7/comments',
    events_url: 'https://api.github.com/repos/null/island/issues/7/events',
    html_url: 'https://github.com/null/island/issues/7',
    id: 123,
    number: 1,
    title: 'foobar',
    user: {},
    labels: [],
    state: 'clo',
    locked: false,
    assignee: {
      'login': 'null'
    },
    assignees: [],
    milestone: null,
    comments: 0,
    created_at: '2017-08-02T23:36:11Z',
    updated_at: '2017-08-02T23:36:11Z',
    closed_at: null,
    body: 'hurry hurry',
    'closed_by': {
      'login': 'nullisland',
    }
  }

  return closedIssue;
}

function manyIssues() {
  let issues = []

  for (i = 0; i <= 150; i++) {
    issues.push(dataDump);
  }

  return issues;
}
