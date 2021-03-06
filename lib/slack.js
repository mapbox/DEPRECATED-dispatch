'use strict';

const utils = require('./utils');

const slack = {};

/**
 * Encompasses all Slack alert functionality
 *
 * @param {object} user - user object, contains Slack ID (destination)
 * @param {object} inputMessage - SNS message body from incoming/function.js
 * @param {string} slackChannel - Fallback Slack channel in the event of error alerting to destination
 * @param {object} client - Slack WebClient, created in incoming/function.js
 * @param {function} callback - returns err and status
 */
slack.alertToSlack = function(user, inputMessage, slackChannel, client, callback) {
  if (!inputMessage.number) {
    return callback(`Error - dispatch ${inputMessage.requestId} message body missing GitHub issue number`);
  }

  utils.encode({ github: inputMessage.number, requestId: inputMessage.requestId }, (err, res) => {
    if (err) return callback(err);

    // add encode result to SNS message as callback_id for Slack API
    inputMessage.callback_id = res;

    slack.formatMessage(inputMessage, (err, message, prompt) => {
      if (err) return callback(err);

      // check if user.slackID fell back to slackDefaultChannel
      if (user.defaulted) {
        // send message
        const fallbackChannel = user.slackId;
        slack.postAlert(fallbackChannel, message, client, slackChannel, inputMessage.requestId, (err, res) => {
          if (err) return callback(err);

          // create status object
          let status = {
            alert: res.ok,
            destination: user.slackId,
            message: res.message.text,
            url: inputMessage.url
          };

          // send error, do not send question prompt to fallback channel
          let fallbackMessage = {
            text: `Slack user ID was missing, fellback to \`${fallbackChannel}\` for requestId ${requestId}`
          };
          slack.postAlert(fallbackChannel, fallbackMessage, client, slackChannel, inputMessage.requestId, (err, res) => {
            if (err) return callback(err);

            // add fallbackMessage to status message
            status.message = `${status.message}, Fallback: ${res.message.text}`;

            return callback(null, status);
          });
        });
      }
      // user.slackId did not default
      else {
        // send message
        slack.postAlert(user.slackId, message, client, slackChannel, inputMessage.requestId, (err, res) => {
          if (err) return callback(err);

          let status = {
            alert: res.ok,
            destination: user.slackId,
            message: res.message.text,
            url: inputMessage.url
          };

          // send prompt
          if (prompt) {
            slack.postAlert(user.slackId, prompt, client, slackChannel, inputMessage.requestId, (err, res) => {
              if (err) return callback(err);

              // add prompt to status message
              status.message = `${status.message}, Prompt: ${res.message.text}`;

              return callback(null, status);
            });
          } else {
            return callback(null, status);
          }
        });
      }
    });
  });
};

/**
 * Formats SNS message contents for posting to Slack
 *
 * @param {object} inputMessage - SNS message body
 * @param {function} callback - returns err, message, and prompt (if needed)
 */
slack.formatMessage = function(inputMessage, callback) {
  try {
    let message = {
      text: inputMessage.body.slack.message,
      attachments: [
        {
          fallback: 'Could not load GitHub issue.',
          callback_id: inputMessage.callback_id,
          attachment_type: 'default'
        }
      ]
    };

    if (inputMessage.url && inputMessage.type != 'broadcast') message.attachments[0].text = inputMessage.url;

    if (inputMessage.body.slack.prompt) {
      let prompt = {
        text: inputMessage.body.slack.prompt,
        attachments: [
          {
            fallback: 'You are unable to address this alert via Slack, refer to the GitHub issue.',
            callback_id: inputMessage.callback_id,
            attachment_type: 'default',
            actions: [
              {
                name: 'yes',
                text: inputMessage.body.slack.actions.yes,
                type: 'button',
                value: (inputMessage.body.slack.actions.yes_response ? inputMessage.body.slack.actions.yes_response : false)
              },
              {
                name: 'no',
                text: inputMessage.body.slack.actions.no,
                type: 'button',
                value: (inputMessage.body.slack.actions.no_response ? inputMessage.body.slack.actions.no_response : false),
                style: 'danger'
              }
            ]
          }
        ]
      };
      return callback(null, message, prompt);
    } else {
      return callback(null, message, null);
    }
  } catch (err) {
    return callback(err);
  }
};

/**
 * Posts an alert to Slack
 *
 * @param {string} destination - Slack alert destination, either a user or default channel
 * @param {object} message - message or prompt body generated by formatMessage
 * @param {object} client - Slack WebClient, created in incoming/function.js
 * @param {string} slackChannel - Fallback Slack channel in the event of error alerting to destination
 * @param {string} requestId - unique ID per dispatch alert
 * @param {function} callback - returns err and res
 */
slack.postAlert = function(destination, message, client, slackChannel, requestId, callback) {
  if (!message.text) return callback('missing Slack message body');

  let options;

  if (destination.indexOf('#') > -1) {
    // destination is a channel
    options = { attachments: message.attachments };
  } else {
    // destination is a user
    options = { 'as_user': true, attachments: message.attachments };
  }

  client.chat.postMessage(destination, message.text, options, (err, res) => {
    if (err) {
      // log initial error, do not return until postFailure attempt
      console.log({
        severity: 'error',
        requestId: requestId,
        service: 'slack',
        message: `${err} for destination ${destination}`
      });

      // log error to default SlackChannel for visibility
      let postFailure = {
        text: `Error sending message to \`${destination}\` for requestId ${requestId}`,
        attachments: [
          {
            title: 'Slack error message',
            text: JSON.stringify(res)
          }
        ]
      };

      client.chat.postMessage(slackChannel, postFailure.text, { attachments: postFailure.attachments }, (err, res) => {
        if (err) return callback(`${err} for destination ${slackChannel}`, res);
        return callback(null, res);
      });
    } else {
      return callback(null, res);
    }
  });
};

module.exports = slack;
