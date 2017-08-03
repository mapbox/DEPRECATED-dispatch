const tape = require('tape');
const nock = require('nock');
const githubRequests = require('../../lib/github.js');

// Auth into GH
tape('Receive auth object from request', function(assert) {
  let auth = {
    type: 'oauth',
    token: 'FakeApiToken'
  };

  githubRequests.authenticate('FakeApiToken', function(err, res){
    console.log('HI');
    assert.ifErr(err, 'Function does not error');
    assert.true(res.auth, auth, 'Function returns expected auth object');
    assert.end();
  });
});

// Does the issue exist? (look at array)
// tape('Finds a match to the requested issue', function(assert) {
//
// });
//
// tape('Does not find a match to the request issue', function(assert) {
//
// });
//
// tape('Pagination', function(assert) {
//
// });

// Create issue
  // Find Issue. Is a dub? Do a comment.
  // Not a dub? Make an issue

// Close issue
