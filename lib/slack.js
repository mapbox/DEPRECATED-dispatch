'use strict';

const slack = require('@slack/client');

const botToken = process.env.SlackBotToken;
const web = new slack.WebClient(botToken);

module.exports = alertToSlack;
function alertToSlack(snsMessage, callback) {
  ingestSNS(snsMessage, (err, username, message) => {
    if (err) return callback(err);
    postAlert(username, message, (err, res) => {
      if (err) return callback(err);
      const status = {
        user: username,
        id: res.message.user,
        bot: res.message.bot_id,
        ok: res.ok,
        timestamp: res.message.ts
      };
      console.log(`USER: ${status.user}, ID: ${status.id}, BOT: ${status.bot}, OK: ${status.ok}, TS: ${status.timestamp}`);
      return callback(null, status);
    });
  });
}

function ingestSNS(snsMessage, callback) {
  if (!ingestSNS) return callback('Null SNS message contents');
  const username = `@${snsMessage.username}`;
  const message = {
    "text": snsMessage.message.issue,
    "attachments": [
      {
        "text": snsMessage.message.prompt.message,
        "fallback": "You are unable to ack this alert via Slack, refer to the GitHub issue.",
        "callback_id": "dispatch_callback",
        "attachment_type": "default",
        "actions": [
          {
            "name": "yes",
            "text": snsMessage.message.prompt.actions[0].value,
            "type": "button",
            "value": snsMessage.message.prompt.actions[0].value
          },
          {
            "name": "no",
            "text": snsMessage.message.prompt.actions[1].value,
            "type": "button",
            "value": snsMessage.message.prompt.actions[1].value,
            "style": "danger"
          }
        ]
      }
    ]
  };
  return callback(null, username, message);
}

function postAlert(username, message, callback) {
  web.chat.postMessage(username, message.text, {
    as_user: true,
    attachments: message.attachments
  }, function(err, res) {
    if (err) return callback(err);
    return callback(null, res);
  });
}