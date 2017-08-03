const tape = require('tape');
const nock = require('nock');
const githubAPI = require('github');
const github = new githubAPI({});
const githubRequests = require('../lib/github.js')

// Auth into GH

// Does the issue exist? (look at array)
tape('Finds a match to the requested issue', function(assert) {

});

tape('Does not find a match to the request issue', function(assert) {

})


// Create issue
  // Find Issue. Is a dub? Do a comment.
  // Not a dub? Make an issue

// Close issue
