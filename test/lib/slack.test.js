'use strict';

const file = require('../../lib/slack.js');
const fixtures = require('../../test/fixtures/slack.fixtures.js');
const sinon = require('sinon');
const test = require('tape');

/* eslint-disable no-unused-vars */

test('[slack] [ingestSNS] SNS parsing error', (t) => {
  file.ingestSNS(fixtures.sns.malformed, (err) => {
    t.equal(err, fixtures.sns.malformedError, '-- should pass through error message');
    t.end();
  });
});

test('[slack] [ingestSNS] self-service success', (t) => {
  file.ingestSNS(fixtures.sns.success, (err, message, prompt) => {
    t.ifError(err, '-- should not error');
    t.deepEqual(message, fixtures.slack.message, '-- should return valid message object');
    t.deepEqual(prompt, fixtures.slack.prompt, '-- should return valid prompt object');
    t.end();
  });
});

test('[slack] [ingestSNS] self-service with response text success', (t) => {
  file.ingestSNS(fixtures.sns.successWithResponse, (err, message, prompt) => {
    t.ifError(err, '-- should not error');
    t.deepEqual(message, fixtures.slack.message, '-- should return valid message object');
    t.deepEqual(prompt, fixtures.slack.promptWithResponseText, '-- should return valid prompt object');
    t.end();
  });
});

test('[slack] [ingestSNS] broadcast success', (t) => {
  file.ingestSNS(fixtures.sns.broadcast, (err, message) => {
    t.ifError(err, '-- should not error');
    t.deepEqual(message, fixtures.slack.messageBroadcast, '-- should return valid message object');
    t.end();
  });
});

test('[slack] [postAlert] missing message body', (t) => {
  file.postAlert(fixtures.slack.username, {requestId: 123}, fixtures.clients.empty, (err, res) => {
    t.equal(err, fixtures.slack.missingMessageError, '-- should pass through error message');
    t.end();
  });
});

test('[slack] [postAlert] cannot locate destination (channel)', (t) => {
  file.postAlert(fixtures.slack.channel, fixtures.slack.message, fixtures.clients.noChannel, (err, res) => {
    t.equal(err.ok, false, '-- ok should be false');
    t.deepEqual(err, fixtures.slack.noChannel, '-- should pass through error response object');
    t.end();
  });
});

test('[slack] [postAlert] error', (t) => {
  file.postAlert(fixtures.slack.username, fixtures.slack.message, fixtures.clients.error, (err, res) => {
    t.equal(err.ok, false, '-- ok should be false');
    t.deepEqual(err, fixtures.slack.error, '-- should pass through error response object');
    t.end();
  });
});

test('[slack] [postAlert] channel success', (t) => {
  file.postAlert(fixtures.slack.channel, fixtures.slack.message, fixtures.clients.success, (err, res) => {
    t.ifError(err, '-- should not error');
    t.equal(res.ok, true, '-- should be true');
    t.deepEqual(res, fixtures.slack.success, '-- should pass through response object');
    t.end();
  });
});

test('[slack] [postAlert] username success', (t) => {
  file.postAlert(fixtures.slack.username, fixtures.slack.message, fixtures.clients.success, (err, res) => {
    t.ifError(err, '-- should not error');
    t.equal(res.ok, true, '-- should be true');
    t.deepEqual(res, fixtures.slack.success, '-- should pass through response object');
    t.end();
  });
});

test('[slack] [alertToSlack] ingestSNS error', (t) => {
  const stub = sinon.stub(file, 'ingestSNS').returns(fixtures.sns.malformedError);
  file.alertToSlack({number: 7, requestId: 123}, fixtures.slack.username, fixtures.clients.empty, (err, status) => {
    t.equal(err, fixtures.sns.malformedError, '-- should pass through error message');
    t.end();
  });
  file.ingestSNS.restore();
});

test('[slack] [alertToSlack] encode error', (t) => {
  file.alertToSlack({requestId: 123}, fixtures.slack.username, fixtures.clients.empty, (err, status) => {
    t.equal(err, fixtures.sns.malformedNoIssueError, '-- should pass through error message');
    t.end();
  });
});

test('[slack] [alertToSlack] postAlert message error', (t) => {
  const stub0 = sinon.stub(file, 'ingestSNS').returns(null, fixtures.slack.message);
  const stub1 = sinon.stub(file, 'postAlert').returns(fixtures.slack.error);
  file.alertToSlack(fixtures.sns.success, fixtures.slack.username, fixtures.clients.error, (err, status) => {
    t.equal(err.ok, false, '-- ok should be false');
    t.deepEqual(err, fixtures.slack.error, '-- should pass through error response object');
    t.end();
  });
  file.ingestSNS.restore();
  file.postAlert.restore();
});

test('[slack] [alertToSlack] postAlert message success, prompt error', (t) => {
  const stub0 = sinon.stub(file, 'ingestSNS').returns(null, fixtures.slack.message, fixtures.slack.prompt);
  const stub1 = sinon.stub(file, 'postAlert');
  stub1.withArgs(fixtures.slack.username, fixtures.slack.message, fixtures.clients.success).returns(null, fixtures.slack.success);
  stub1.withArgs(fixtures.slack.username, fixtures.slack.message, fixtures.clients.error).returns(fixtures.slack.error);
  file.alertToSlack(fixtures.sns.success, fixtures.slack.username, fixtures.clients.error, (err, status) => {
    t.equal(err.ok, false, '-- ok should be false');
    t.deepEqual(err, fixtures.slack.error, '-- should pass through error response object');
    t.end();
  });
  file.ingestSNS.restore();
  file.postAlert.restore();
});

test('[slack] [alertToSlack] postAlert message, no prompt', (t) => {
  const stub0 = sinon.stub(file, 'ingestSNS').returns(null, fixtures.slack.message);
  const stub1 = sinon.stub(file, 'postAlert').returns(null, fixtures.slack.success);
  file.alertToSlack(fixtures.sns.successNoPrompt, fixtures.slack.username, fixtures.clients.success, (err, status) => {
    t.ifError(err, '-- should not error');
    t.equal(status.alert, true, '-- should be true');
    t.deepEqual(status, fixtures.slack.status, '-- should pass through status object');
    t.end();
  });
  file.ingestSNS.restore();
  file.postAlert.restore();
});

// NOTE: Make a second pass at this test case, can be improved

test('[slack] [alertToSlack] postAlert message and prompt success', (t) => {
  const stub0 = sinon.stub(file, 'ingestSNS').returns(null, fixtures.slack.message, fixtures.slack.prompt);
  const stub1 = sinon.stub(file, 'postAlert');
  stub1.withArgs(fixtures.slack.username, fixtures.slack.message, fixtures.clients.success).returns(null, fixtures.slack.success);
  stub1.withArgs(fixtures.slack.username, fixtures.slack.prompt, fixtures.clients.success).returns(null, fixtures.slack.successPrompt);
  file.alertToSlack(fixtures.sns.success, fixtures.slack.username, fixtures.clients.success, (err, status) => {
    t.ifError(err, '-- should not error');
    t.equal(status.alert, true, '-- should be true');
    t.deepEqual(status, fixtures.slack.statusPrompt, '-- should pass through status object');
    t.end();
  });
  file.ingestSNS.restore();
  file.postAlert.restore();
});
