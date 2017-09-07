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
      snsMessage.callback_id = res; // eslint-disable-line camelcase
      ingestSNS(snsMessage, (err, message, prompt) => {
        if (err) return callback(err);
        postAlert(destination, message, client, (err, res) => {
          if (err) return callback(err);
          const status = {
            alert: res.ok,
            destination: destination,
            message: res.message.text,
            url: snsMessage.url
          };
          if (prompt) {
            postAlert(destination, prompt, client, (err, res) => {
              if (err) return callback(err);
              status.message = `${status.message}, Prompt: ${res.message.text}`;
            });
          }
          console.log(`${snsMessage.requestId} sent Slack message for issue ${snsMessage.number} sent to ${destination}`);
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
          fallback: 'Could not load GitHub issue.',
          'callback_id': snsMessage.callback_id,
          'attachment_type': 'default'
        }
      ]
    };
    if (snsMessage.url && snsMessage.type != 'broadcast') {
      message.attachments[0].text = snsMessage.url;
    }
    if (snsMessage.body.slack.prompt) {
      let prompt = {
        text: snsMessage.body.slack.prompt,
        attachments: [
          {
            fallback: 'You are unable to address this alert via Slack, refer to the GitHub issue.',
            'callback_id': snsMessage.callback_id,
            'attachment_type': 'default',
            actions: [
              {
                name: 'yes',
                text: snsMessage.body.slack.actions.yes,
                type: 'button',
                value: (snsMessage.body.slack.actions.yes_response ? snsMessage.body.slack.actions.yes_response : false)
              },
              {
                name: 'no',
                text: snsMessage.body.slack.actions.no,
                type: 'button',
                value: (snsMessage.body.slack.actions.no_response ? snsMessage.body.slack.actions.no_response : false),
                style: 'danger'
              }
            ]
          }
        ]
      };
      return callback(null, message, prompt);
    } else return callback(null, message, null);
  } catch (err) {
    return callback(`${snsMessage.requestId} sns message parsing error`);
  }
}

function postAlert(destination, alert, client, callback) {
  let options;
  if (!alert.text) return callback(`${alert.requestId} missing Slack message body`);
  if (destination.indexOf('@') > -1) options = { 'as_user': true, attachments: alert.attachments };
  if (destination.indexOf('#') > -1) options = { attachments: alert.attachments };
  client.chat.postMessage(destination, alert.text, options, function(err, res) {
    if (err) return callback(res);
    return callback(null, res);
  });
}
