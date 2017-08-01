'use strict';

const aws = require('aws-sdk');
const slack = require('@slack/client');

// const url = process.env.SlackURL;
const url = 'https://hooks.slack.com/services/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';

/**
 * Ingest SNS message content, create Slack message.
 *
 * @name ingestSNS
 * @param {object} snsMessage - incoming SNS message.
 * @param {function} callback - a function to call when SNS data has been ingested, Slack message created.
 */
function ingestSNS(snsMessage, callback) {
  const slackMessage = {
    'text': snsMessage.slack.prompt,
    'attachments': {
      'text': ,
      'fallback': ,
      'callback_id': ,
      'actions': [
        {
          'name': ,
          'text': ,
          'type': 'button',
          'value':
        },
        {
          'name': ,
          'text': ,
          'type': 'button',
          'value':
          'style': 'danger',
        }
      ]
    }
  };
  return callback(slackMessage);
}

/**
 * Send user who triggered alarm Slack direct message.
 *
 * @name sendSlack
 * @param {object} slackMessage - composed Slack message.
 * @param {function} callback - a function to call when the Slack message has been sent.
 */
function sendSlack(slackMessage, callback) {
  const webhook = new slack.IncomingWebhook(url);
  webhook.send(slackMessage, function(err, header, status, body) {
    console.log(status);
    if (err) callback(err);
    else callback(status);
  });
}

// testing...
const exampleSNS = require('../test/patrol-sns-examples.js').examples;
ingestSNS(exampleSNS, (err, slackMessage) => {
  if (err) console.log(err);
});