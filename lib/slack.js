'use strict';

const encode = require('./utils').encode;
const slack = {};

slack.alertToSlack = function(snsMessage, destination, client, slackChannel, callback) {
  if (!snsMessage.number) {
    console.log(`${snsMessage.requestId} No GitHub issue number found in message body`);
    return callback('No GitHub issue number found in message body');
  } else {
    encode({github: snsMessage.number}, (err, res) => {
      if (err) return callback(err);
      console.log(`${snsMessage.requestId} generated Slack callback_id ${res} for issue ${snsMessage.number} user ${destination}`);
      snsMessage.callback_id = res; // eslint-disable-line camelcase
      slack.ingestSNS(snsMessage, (err, message, prompt) => {
        if (err) return callback(err);
        slack.postAlert(destination, message, client, slackChannel, snsMessage.requestId, (err, res) => {
          console.log('message');
          if (err && err == 'badSlack') {
            return callback(null, res);
          } else if (err) {
            return callback(err);
          }
          const status = {
            alert: res.ok,
            destination: destination,
            message: res.message.text,
            url: snsMessage.url
          };
          if (prompt) {
            console.log('prompt');
            slack.postAlert(destination, prompt, client, slackChannel, snsMessage.requestId, (err, res) => {
              if (err && err == 'badSlack') {
                return callback(null, res);
              };
              if (err) return callback(err);
              status.message = `${status.message}, Prompt: ${res.message.text}`;
              console.log(`${snsMessage.requestId} sent Slack message for issue ${snsMessage.number} to ${destination}`);
              return callback(null, status);
            });
          } else {
            console.log(`${snsMessage.requestId} sent Slack message for issue ${snsMessage.number} to ${destination}`);
            return callback(null, status);
          }
        });
      });
    });
  }
};

slack.ingestSNS = function(snsMessage, callback) {
  console.log('ingestSNS called');
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
    return callback(`${snsMessage.requestId} sns message parsing error: ${err}`);
  }
};

slack.postAlert = function(destination, alert, client, slackChannel, requestId, callback) {
  let options;

  if (!alert.text) return callback(`${requestId} missing Slack message body`);
  if (destination.indexOf('@') > -1) options = { 'as_user': true, attachments: alert.attachments };
  if (destination.indexOf('#') > -1) options = { attachments: alert.attachments };
  client.chat.postMessage(destination, alert.text, options, function(err, res) {
    if (err) {
      console.log(`${requestId} Error sending message to slack destination: ${destination}`);
      let postFailure = {
        text: `Error sending message to \`${destination}\` for requestId ${requestId}`,
        attachments: [
          {
            title: 'Slack error message',
            text: JSON.stringify(res)
          }
        ]
      };
      client.chat.postMessage(slackChannel, postFailure.text, { attachments: postFailure.attachments}, function(err, res) {
        if (err) {
          console.log(`${requestId} Error sending message to slack channel ${slackChannel} for slack destination failure ${destination}`);
        }
        // return a custom error so we can skip generating a second error notification
        return callback('badSlack', res);
      });
    } else {
      return callback(null, res);
    }
  });
};

// module.exports.alertToSlack = alertToSlack;
// module.exports.ingestSNS = ingestSNS;
// module.exports.postAlert = postAlert;
module.exports = slack;
