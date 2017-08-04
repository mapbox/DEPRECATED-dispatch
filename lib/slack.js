'use strict';

const webClient = require('@slack/client').WebClient;

module.exports.alertToSlack = alertToSlack;
function alertToSlack(snsMessage, botToken, callback) {
  const web = new slack.WebClient(botToken);
  ingestSNS(snsMessage, (err, username, message) => {
    if (err) return callback(err);
    postAlert(username, message, web, (err, res) => {
      if (err) return callback(err);
      const status = {
        user: username,
        id: res.message.user,
        bot: res.message.bot_id,
        res: res.ok,
        timestamp: res.message.ts
      };
      console.log(`USER: ${status.user}, ID: ${status.id}, BOT: ${status.bot}, RES: ${status.res}, TS: ${status.timestamp}`);
      return callback(null, status);
    });
  });
}

module.exports.ingestSNS = ingestSNS;
function ingestSNS(snsMessage, callback) {
  if (!snsMessage) return callback('ERR: null sns message');
  if (!snsMessage.username) return callback('ERR: null username in sns message');
  try {
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
  } catch (err) {
    return callback('ERR: sns message parsing error');
  }
}

module.exports.postAlert = postAlert;
function postAlert(username, message, web, callback) {
  web.chat.postMessage(username, message.text, {
    as_user: true,
    attachments: message.attachments
  }, function(err, res) {
    if (err) return callback(err);
    return callback(null, res);
  });
}