'use strict';

const slack = require('../lib/slack.js');
const webClient = require('@slack/client').WebClient;
const sinon = require('sinon');
const test = require('tape');
const snsFixtures = require('../test/fixtures/sns-fixtures.js').sns;
const slackFixtures = require('../test/fixtures/slack-fixtures.js').slack;

process.env.SlackBotToken = 'test-slack-bot-token';

test('[slack] [ingestSNS] error', (t) => {});

test('[slack] [ingestSNS] malformed message', (t) => {});

test('[slack] [ingestSNS] success', (t) => {});

test('[slack] [postAlert] error', (t) => {});

test('[slack] [postAlert] malformed message', (t) => {});

test('[slack] [postAlert] success', (t) => {});

test('[slack] [alertToSlack] ingestSNS error', (t) => {});

test('[slack] [alertToSlack] postAlert error', (t) => {});

test('[slack] [alertToSlack] error', (t) => {});

test('[slack] [alertToSlack] success', (t) => {});