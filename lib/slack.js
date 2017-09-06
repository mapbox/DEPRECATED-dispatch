'use strict';

const encode = require('./utils').encode;

module.exports.alertToSlack = alertToSlack;
module.exports.ingestSNS = ingestSNS;
module.exports.postAlert = postAlert;

function alertToSlack(snsMessage, destination, client, callback) {
  if (!snsMessage.number) {
    console.log(`${snsMessage.requestId} No GitHub issue number found in message body`);
    return callback('No GitHub issue number found in message body');
  } else {
    encode({github: snsMessage.number}, (err, res) => {
      if (err) return callback(err);
      console.log(`${snsMessage.requestId} generated Slack callback_id ${res} for issue ${snsMessage.number} user ${destination}`);
      snsMessage.callback_id = res;
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
          console.log(`${snsMessage.requestId} slack message for issue ${snsMessage.number} sent to ${destination}`);
          return callback(null, status);
        });
      });
    });
  }
}

function ingestSNS(snsMessage, callback) {
  try {
    let message = {
      text: snsMessage.body.slack.message,
      attachments: [
        {
          fallback: 'You are unable to ack this alert via Slack, refer to the GitHub issue.',
          callback_id: snsMessage.callback_id,
          attachment_type: 'default'
        }
      ]
    };
    if (snsMessage.url && snsMessage.type != 'broadcast') {
      message.attachments[0].text = snsMessage.url;
    }
    if (snsMessage.body.slack.actions) {
      message.attachments[0].actions = [
        {
          name: 'yes',
          text: snsMessage.body.slack.actions.yes,
          type: 'button',
          value: (snsMessage.body.slack.actions.yes_response ?
                  snsMessage.body.slack.actions.yes_response : false)
        },
        {
          name: 'no',
          text: snsMessage.body.slack.actions.no,
          type: 'button',
          value: (snsMessage.body.slack.actions.no_response ?
                  snsMessage.body.slack.actions.no_response : false),
          style: 'danger'
        }
      ];
    }
    return callback(null, message);
  } catch (err) {
    return callback(`${snsMessage.requestId} sns message parsing error`);
  }
}

function postAlert(destination, message, client, callback) {
  let options;
  if (!message.text) return callback(`${message.requestId} missing Slack message body`);
  if (destination.indexOf('@') > -1) options = { as_user: true, attachments: message.attachments };
  if (destination.indexOf('#') > -1) options = { attachments: message.attachments };
  client.chat.postMessage(destination, message.text, options, function(err, res) {
    if (err) return callback(res);
    return callback(null, res);
  });
}
