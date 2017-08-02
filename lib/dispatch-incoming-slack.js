'use strict';

const aws = require('aws-sdk');
const slack = require('@slack/client');
const _ = require('underscore');

const botToken = process.env.SlackBotToken;
const rtm = new slack.RtmClient(botToken);

// testing...
const exampleSNS = require('../test/patrol-sns-examples.js').examples;
alertToSlack(exampleSNS.mfaDisabled, (err) => {
  if (err) console.log(err);
});

module.exports = alertToSlack;
function alertToSlack(snsMessage, callback) {
  ingestSNS(snsMessage, (username, message) => {
    initSlackBot(username, (err, slackUser, slackIm) => {
      if (err) return callback(err);
      console.log(`Queued alert for @${slackUser.name}, ID: ${slackUser.id}...`);
      initAlert(message, slackIm.id, (err) => {
        if (err) return callback(err);
      });
    });
    rtm.start();
  });
}

function ingestSNS(snsMessage, callback) {
  const username = snsMessage.username;
  const message = {
    'text': snsMessage.message.issue,
    'attachments': [
      {
        'text': snsMessage.message.prompt,
        'fallback': snsMessage.title,
        'callback_id': 'dispatch_callback',
        'actions': [
          {
            'name': 'yes',
            'text': snsMessage.message.prompt.actions[0].value,
            'type': 'button',
            'value': snsMessage.message.prompt.actions[0].value
          },
          {
            'name': 'no',
            'text': snsMessage.message.prompt.actions[1].value,
            'type': 'button',
            'value': snsMessage.message.prompt.actions[1].value,
            'style': 'danger',
          }
        ]
      }
    ]
  };
  return callback(username, message);
}

function initSlackBot(username, callback) {
  rtm.on(slack.CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
    getSlackUser(rtmStartData, username, (err, slackUser) => {
      if (err) return callback(err);
      getSlackIm(rtmStartData, slackUser.id, (err, slackIm) => {
        if (err) return callback(err);
        return callback(null, slackUser, slackIm);
      });
    });
  });
}

function initAlert(message, id, callback) {
  rtm.on(slack.CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, (err) => {
    if (err) return callback(err);
    rtm.chat.postMessage(message, id, (err) => {
      if (err) return callback(err);
      return callback();
    });
  });
}

function getSlackUser(data, username, callback) {
  const slackUser = _.find(data.users, (user) => { return user.name === username; });
  if (!slackUser) return callback(`User ${username} not found in Slack`);
  return callback(null, slackUser);
}

function getSlackIm(data, id, callback) {
  const slackIm = _.find(data.ims, (im) => { return im.user === id; });
  if (!slackIm) return callback(`No associated IM found for user ${id} found in Slack`);
  return callback(null, slackIm);
}