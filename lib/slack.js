'use strict';

const _ = require('lodash');

module.exports.alertToSlack = alertToSlack;
module.exports.ingestSNS = ingestSNS;
module.exports.postAlert = postAlert;

function alertToSlack(snsMessage, destination, client, callback) {
  ingestSNS(snsMessage, (err, message) => {
    if (err) return callback(err);
    postAlert(destination, message, client, (err, res) => {
      if (err) return callback(err);
      const status = {
        alert: res.ok,
        destination: destination,
        message: message.text,
        url: snsMessage.url
      };
      return callback(null, status);
    });
  });
}

function ingestSNS(snsMessage, callback) {
  try {
    // handle no action options in SNS message for alerts
    let message = {
      text: snsMessage.body.slack.message,
      attachments: [
        {
          text: snsMessage.body.slack.message,
          fallback: 'You are unable to ack this alert via Slack, refer to the GitHub issue.',
          callback_id: 'dispatch_callback',
          attachment_type: 'default'
        }
      ]
    };
    if (snsMessage.url) {
      message.attachments[0].text = message.attachments[0].text + ' ' + snsMessage.url;
    }
    if (snsMessage.body.slack.actions) {
      message.attachments[0].actions = [
        {
          name: 'yes',
          text: snsMessage.body.slack.actions.yes,
          type: 'button',
          value: 1
        },
        {
          name: 'no',
          text: snsMessage.body.slack.actions.no,
          type: 'button',
          value: 0,
          style: 'danger'
        }
      ];
    }
    return callback(null, message);
  } catch (err) {
    return callback('ERR: sns message parsing error');
  }
}

function postAlert(destination, message, client, callback) {

  console.log(`postAlert called for ${destination}`);

  let options;
  if (!_.has(message, 'text')) return callback('ERR: missing message body');
  if (destination.indexOf('@') > -1) options = { as_user: true, attachments: message.attachments };
  if (destination.indexOf('#') > -1) options = { attachments: message.attachments };
  client.chat.postMessage(destination, message.text, options, function(err, res) {
    if (err) return callback(res);
    return callback(null, res);
  });
}
