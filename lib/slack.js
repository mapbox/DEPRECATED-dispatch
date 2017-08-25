'use strict';

const _ = require('lodash');

module.exports.alertToSlack = alertToSlack;
module.exports.ingestSNS = ingestSNS;
module.exports.postAlert = postAlert;

function alertToSlack(snsMessage, client, channel, callback) {
  ingestSNS(snsMessage, channel, (err, username, message) => {
    if (err) return callback(err);
    postAlert(username, message, client, (err, res) => {
      if (err) return callback(err);
      const status = {
        user: username,
        id: res.message.user,
        bot: res.message.bot_id,
        res: res.ok,
        timestamp: res.message.ts,
        url: snsMessage.url,
        issue: snsMessage.issue
      };
      console.log(`USER: ${status.user}, ID: ${status.id}, BOT: ${status.bot}, RES: ${status.res}, TS: ${status.timestamp}, ISSUE: ${status.issue}`);
      return callback(null, status);
    });
  });
}

function ingestSNS(snsMessage, channel, callback) {
  let userName;
  if (!snsMessage) return callback('ERR: null sns message');
  if (snsMessage.users[0]) userName = `@${snsMessage.users[0]}`;
  if (!snsMessage.users[0]) userName = `#${channel}`;
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

    return callback(null, userName, message);
  } catch (err) {
    return callback('ERR: sns message parsing error');
  }
}

function postAlert(username, message, client, callback) {
  let options;
  if (!_.has(message, 'text')) return callback('ERR: missing message body');
  if (username.indexOf('@') > -1) options = { as_user: true, attachments: message.attachments };
  if (username.indexOf('#') > -1) options = { attachments: message.attachments };
  client.chat.postMessage(username, message.text, options, function(err, res) {
    if (err) return callback(res);
    return callback(null, res);
  });
}
