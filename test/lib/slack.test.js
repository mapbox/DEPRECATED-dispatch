'use strict';

const file = require('../../lib/slack.js');
const fixtures = require('../../test/fixtures/slack.fixtures.js');
const sinon = require('sinon');
const test = require('tape');

/* eslint-disable no-unused-vars */

test('[slack] [ingestSNS] SNS parsing error', (t) => {
  file.ingestSNS(fixtures.sns.malformed, (err) => {
    t.equal(err, fixtures.sns.malformedMessageError, '-- should pass through error message');
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
  file.postAlert(fixtures.slack.username, {requestId: 123}, fixtures.clients.empty, 'test-channel', 123, (err, res) => {
    t.equal(err, fixtures.slack.missingMessageError, '-- should pass through error message');
    t.end();
  });
});

test('[slack] [postAlert] cannot locate destination (channel)', (t) => {
  file.postAlert(fixtures.slack.channel, fixtures.slack.message, fixtures.clients.noChannel, 'test-channel', 123, (err, res) => {
    t.ok(err, 'badSlack', '-- passes custom error on Slack failure');
    t.equal(res.ok, false, '-- ok should be false');
    t.deepEqual(res, fixtures.slack.noChannel, '-- should pass through response object');
    t.end();
  });
});

test('[slack] [postAlert] error', (t) => {
  file.postAlert(fixtures.slack.username, fixtures.slack.message, fixtures.clients.error, 'test-channel', 123, (err, res) => {
    t.ok(err, 'badSlack', '-- passes custom error on Slack failure');
    t.equal(res.ok, true, '-- ok should be true');
    t.deepEqual(res, fixtures.slack.success, '-- should pass successful response object');
    t.end();
  });
});

test('[slack] [postAlert] channel success', (t) => {
  file.postAlert(fixtures.slack.channel, fixtures.slack.message, fixtures.clients.success, 'test-channel', 123, (err, res) => {
    t.ifError(err, '-- should not error');
    t.equal(res.ok, true, '-- should be true');
    t.deepEqual(res, fixtures.slack.success, '-- should pass through response object');
    t.end();
  });
});

test('[slack] [postAlert] username success', (t) => {
  file.postAlert(fixtures.slack.username, fixtures.slack.message, fixtures.clients.success, 'test-channel', 123, (err, res) => {
    t.ifError(err, '-- should not error');
    t.equal(res.ok, true, '-- should be true');
    t.deepEqual(res, fixtures.slack.success, '-- should pass through response object');
    t.end();
  });
});

test('[slack] [postAlert] username fails, channel post success', (t) => {
  file.postAlert(fixtures.slack.username, fixtures.slack.message, fixtures.clients.error, 'test-channel', 123, (err, res) => {
    t.equal(err, 'badSlack', '-- should return custom error');
    t.equal(res.ok, true, '-- should be true');
    t.deepEqual(res, fixtures.slack.success, '-- should pass through response object');
    t.end();
  });
});

test('[slack] [postAlert] username fails, channel post fails', (t) => {
  file.postAlert(fixtures.slack.username, fixtures.slack.message, fixtures.clients.noChannel, 'test-channel', 123, (err, res) => {
    t.equal(err, 'badSlack', '-- should return custom error');
    t.equal(res.ok, false, '-- should be true');
    t.deepEqual(res, fixtures.slack.noChannel, '-- should pass through response object');
    t.end();
  });
});

test('[slack] [alertToSlack] ingestSNS error', (t) => {
  const stub = sinon.stub(file, 'ingestSNS').yields(fixtures.sns.malformedError);
  file.alertToSlack({number: 7, requestId: 123}, fixtures.slack.username, fixtures.clients.empty, 'test-channel', (err, status) => {
    t.equal(err, fixtures.sns.malformedError, '-- should pass through error message');
    t.end();
  });
  file.ingestSNS.restore();
});

test('[slack] [alertToSlack] encode error', (t) => {
  file.alertToSlack({requestId: 123}, fixtures.slack.username, fixtures.clients.empty, 'test-channel', (err, status) => {
    t.equal(err, fixtures.sns.malformedNoIssueError, '-- should pass through error message');
    t.end();
  });
});

test('[slack] [alertToSlack] postAlert message error', (t) => {
  const stub0 = sinon.stub(file, 'ingestSNS').yields(null, fixtures.slack.message);
  const stub1 = sinon.stub(file, 'postAlert').yields('badSlack');
  file.alertToSlack(fixtures.sns.success, fixtures.slack.username, fixtures.clients.error, 'test-channel', (err, status) => {
    t.error(err, '-- does not error on bad Slack message');
    t.equal(status, undefined, '-- bad Slack message generates no response object');
    t.end();
  });
  file.ingestSNS.restore();
  file.postAlert.restore();
});


test('[slack] [alertToSlack] postAlert message, no prompt', (t) => {
  const stub0 = sinon.stub(file, 'ingestSNS').yields(null, fixtures.slack.message);
  const stub1 = sinon.stub(file, 'postAlert').yields(null, fixtures.slack.success);
  file.alertToSlack(fixtures.sns.successNoPrompt, fixtures.slack.username, fixtures.clients.success, 'test-channel', (err, status) => {
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
  const stub0 = sinon.stub(file, 'ingestSNS').yields(null, fixtures.slack.message, fixtures.slack.prompt);
  const stub1 = sinon.stub(file, 'postAlert');
  stub1.withArgs(fixtures.slack.username, fixtures.slack.message, fixtures.clients.success).yields(null, fixtures.slack.success);
  stub1.withArgs(fixtures.slack.username, fixtures.slack.prompt, fixtures.clients.success).yields(null, fixtures.slack.successPrompt);
  file.alertToSlack(fixtures.sns.success, fixtures.slack.username, fixtures.clients.success, 'test-channel', (err, status) => {
    t.ifError(err, '-- should not error');
    t.equal(status.alert, true, '-- should be true');
    t.deepEqual(status, fixtures.slack.statusPrompt, '-- should pass through status object');
    t.end();
  });
  file.ingestSNS.restore();
  file.postAlert.restore();
});

test('[slack] [alertToSlack] postAlert message success, prompt error', (t) => {
  const ingestSnsStub = sinon.stub(file, 'ingestSNS').yields(null, fixtures.slack.message, fixtures.slack.prompt);
  const postAlertStub = sinon.stub(file, 'postAlert');
  postAlertStub.withArgs(fixtures.slack.username, fixtures.slack.message, fixtures.clients.success, 'test-channel', 123).yields(null, fixtures.slack.success);
  postAlertStub.withArgs(fixtures.slack.username, fixtures.slack.prompt, fixtures.clients.success,'test-channel', 123).yields('badSlack');
  file.alertToSlack(fixtures.sns.success, fixtures.slack.username, fixtures.clients.success, 'test-channel', (err, status) => {
    t.ifError(err, '-- should not error');
    t.equal(status, undefined, '-- does not pass status object when badSlacking');
    t.end();
  });
  file.ingestSNS.restore();
  file.postAlert.restore();
});
