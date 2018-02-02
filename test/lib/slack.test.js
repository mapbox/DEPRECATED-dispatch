'use strict';

const test = require('tape');
const sinon = require('sinon');

const slack = require('../../lib/slack.js');
const fixtures = require('../../test/fixtures/slack.fixtures.js');

test('[slack] [formatMessage] SNS parsing error', (assert) => {
  slack.formatMessage(fixtures.sns.malformed, (err) => {
    assert.equal(err instanceof TypeError, true, '-- should return TypeError');
    assert.end();
  });
});

test('[slack] [formatMessage] self-service success', (assert) => {
  slack.formatMessage(fixtures.sns.success, (err, message, prompt) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(message, fixtures.slack.message, '-- should return valid message object');
    assert.deepEqual(prompt, fixtures.slack.prompt, '-- should return valid prompt object');
    assert.end();
  });
});

test('[slack] [formatMessage] self-service with response text success', (assert) => {
  slack.formatMessage(fixtures.sns.successWithResponse, (err, message, prompt) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(message, fixtures.slack.message, '-- should return valid message object');
    assert.deepEqual(prompt, fixtures.slack.promptWithResponseText, '-- should return valid prompt object');
    assert.end();
  });
});

test('[slack] [formatMessage] broadcast success', (assert) => {
  slack.formatMessage(fixtures.sns.broadcast, (err, message) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(message, fixtures.slack.messageBroadcast, '-- should return valid message object');
    assert.end();
  });
});

test('[slack] [postAlert] missing message body error', (assert) => {
  slack.postAlert(fixtures.slack.username, fixtures.slack.missingMessage, fixtures.clients.empty, fixtures.slack.channel, fixtures.sns.requestId, (err) => {
    assert.equal(err, fixtures.slack.missingMessageError, '-- should return error message');
    assert.end();
  });
});

test('[slack] [postAlert] destination user error, fallback channel success', (assert) => {
  slack.postAlert(fixtures.slack.username, fixtures.slack.message, fixtures.clients.errorUser, fixtures.slack.channel, fixtures.sns.requestId, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, fixtures.slack.successFallback, '-- should pass through response object');
    assert.equal(res.ok, true, '-- res.ok should be true');
    assert.equal(res.channel, fixtures.slack.channelId, '-- destination error for user should post to fallback channel');
    assert.end();
  });
});

test('[slack] [postAlert] destination user error, fallback channel error', (assert) => {
  slack.postAlert(fixtures.slack.username, fixtures.slack.message, fixtures.clients.errorChannel, fixtures.slack.channel, fixtures.sns.requestId, (err, res) => {
    assert.equal(err, fixtures.slack.errorNoChannel.error, '-- passes custom error on Slack failure');
    assert.deepEqual(res, fixtures.slack.errorNoChannel, '-- should pass through response object');
    assert.equal(res.ok, false, '-- res.ok should be false');
    assert.end();
  });
});

test('[slack] [postAlert] destination user success', (assert) => {
  slack.postAlert(fixtures.slack.username, fixtures.slack.message, fixtures.clients.success, fixtures.slack.channel, fixtures.sns.requestId, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, fixtures.slack.success, '-- should pass through response object');
    assert.equal(res.ok, true, '-- res.ok should be true');
    assert.end();
  });
});

test('[slack] [alertToSlack] encode error', (assert) => {
  slack.alertToSlack(fixtures.sns.encode, fixtures.slack.username, fixtures.clients.empty, fixtures.slack.channel, (err) => {
    assert.equal(err, fixtures.sns.encodeError, '-- should return error');
    assert.end();
  });
});

test('[slack] [alertToSlack] formatMessage error', (assert) => {
  let formatMessageStub = sinon.stub(slack, 'formatMessage') // eslint-disable-line no-unused-vars
    .yields(new TypeError('testError'));

  slack.alertToSlack(fixtures.sns.malformed, fixtures.slack.username, fixtures.clients.empty, fixtures.slack.channel, (err) => {
    assert.equal(err instanceof TypeError, true, '-- should return TypeError');
    assert.end();
  });

  slack.formatMessage.restore();
});

test('[slack] [alertToSlack] postAlert error', (assert) => {
  let formatMessageStub = sinon.stub(slack, 'formatMessage') // eslint-disable-line no-unused-vars
    .yields(null, fixtures.slack.message);
  let postAlertStub = sinon.stub(slack, 'postAlert') // eslint-disable-line no-unused-vars
    .yields(fixtures.slack.errorNoChannel.error, fixtures.slack.errorNoChannel);

  slack.alertToSlack(fixtures.sns.success, fixtures.slack.username, fixtures.clients.errorUser, fixtures.slack.channel, (err) => {
    assert.equal(err, fixtures.slack.errorNoChannel, '-- should return error');
    assert.end();
  });

  slack.formatMessage.restore();
  slack.postAlert.restore();
});

test('[slack] [alertToSlack] postAlert message success, no prompt', (assert) => {
  let formatMessageStub = sinon.stub(slack, 'formatMessage') // eslint-disable-line no-unused-vars
    .yields(null, fixtures.slack.message);
  let postAlertStub = sinon.stub(slack, 'postAlert') // eslint-disable-line no-unused-vars
    .yields(null, fixtures.slack.success);

  slack.alertToSlack(fixtures.sns.successNoPrompt, fixtures.slack.username, fixtures.clients.success, fixtures.slack.channel, (err, status) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(status, fixtures.slack.status, '-- should return status');
    assert.equal(status.alert, true, '-- status.alert should be true');
    assert.end();
  });

  slack.formatMessage.restore();
  slack.postAlert.restore();
});

test('[slack] [alertToSlack] postAlert message success, prompt error', (assert) => {
  let formatMessageStub = sinon.stub(slack, 'formatMessage') // eslint-disable-line no-unused-vars
    .yields(null, fixtures.slack.message, fixtures.slack.prompt);
  let postAlertStub = sinon.stub(slack, 'postAlert');

  postAlertStub.withArgs(fixtures.slack.username, fixtures.slack.message, fixtures.clients.success, fixtures.slack.channel, fixtures.sns.requestId)
    .yields(null, fixtures.slack.success);
  postAlertStub.withArgs(fixtures.slack.username, fixtures.slack.prompt, fixtures.clients.success, fixtures.slack.channel, fixtures.sns.requestId)
    .yields(fixtures.slack.errorNoChannel.error, fixtures.slack.errorNoChannel);

  slack.alertToSlack(fixtures.sns.success, fixtures.slack.username, fixtures.clients.success, fixtures.slack.channel, (err) => {
    assert.equal(err, fixtures.slack.errorNoChannel.error, '-- should return error');
    assert.end();
  });

  slack.formatMessage.restore();
  slack.postAlert.restore();
});

test('[slack] [alertToSlack] postAlert message success, prompt success', (assert) => {
  let formatMessageStub = sinon.stub(slack, 'formatMessage') // eslint-disable-line no-unused-vars
    .yields(null, fixtures.slack.message, fixtures.slack.prompt);
  let postAlertStub = sinon.stub(slack, 'postAlert');

  postAlertStub.withArgs(fixtures.slack.username, fixtures.slack.message, fixtures.clients.success)
    .yields(null, fixtures.slack.success);
  postAlertStub.withArgs(fixtures.slack.username, fixtures.slack.prompt, fixtures.clients.success)
    .yields(null, fixtures.slack.successPrompt);

  slack.alertToSlack(fixtures.sns.success, fixtures.slack.username, fixtures.clients.success, fixtures.slack.channel, (err, status) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(status, fixtures.slack.statusPrompt, '-- should return status');
    assert.equal(status.alert, true, '-- status.alert should be true');
    assert.end();
  });

  slack.formatMessage.restore();
  slack.postAlert.restore();
});