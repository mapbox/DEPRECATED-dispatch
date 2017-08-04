'use strict';

const file = require('../lib/slack.js');
const fixtures = require('../test/fixtures/slack.fixtures.js');
const sinon = require('sinon');
const test = require('tape');
const webClient = require('@slack/client').WebClient;

process.env.SlackBotToken = 'test-slack-bot-token';

test('[slack] [ingestSNS] error', (t) => {
  file.ingestSNS(null, (err) => {
    t.equal(err, 'ERR: null sns message', '-- should pass through error message');
    t.end();
  });
});

test('[slack] [ingestSNS] missing username', (t) => {
  file.ingestSNS(fixtures.sns.nullUsername, (err) => {
    t.equal(err, 'ERR: null username in sns message', '-- should pass through error message');
    t.end();
  });
});

test('[slack] [ingestSNS] uncaught parsing error', (t) => {
  file.ingestSNS(fixtures.sns.malformed, (err) => {
    t.equal(err, 'ERR: sns message parsing error','-- should pass through error message');
    t.end();
  });
});

test('[slack] [ingestSNS] success', (t) => {
  file.ingestSNS(fixtures.sns.mfaDisabled, (err, username, message) => {
    t.equal(username, fixtures.slack.username, '-- should return @username');
    t.deepEqual(message, fixtures.slack.message, '-- should return valid message object');
    t.end();
  });
});

test('[slack] [postAlert] error', (t) => {});

test('[slack] [postAlert] malformed message', (t) => {});

test('[slack] [postAlert] success', (t) => {});

test('[slack] [alertToSlack] ingestSNS error', (t) => {});

test('[slack] [alertToSlack] postAlert error', (t) => {});

test('[slack] [alertToSlack] error', (t) => {});

test('[slack] [alertToSlack] success', (t) => {});