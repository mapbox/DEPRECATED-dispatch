[![Build Status](https://travis-ci.com/mapbox/dispatch.svg?token=s7DU2T5bv9A6JyGJHzqV&branch=announce-only)](https://travis-ci.com/mapbox/dispatch)

# dispatch

![switchboard](https://github.com/mapbox/dispatch/blob/master/assets/switchboard.jpg)

`dispatch` is an alarm routing tool.

It can be used to both dynamically route incoming alarms to either PagerDuty or Slack based on type, and to send "emergency broadcast style" alert messages via Slack. The alert types currently supported are listed below. `dispatch` uses a dedicated GitHub repository to track the state of alarms. It is triggered by sending messages to its SNS topic using the [MESSAGE-SPEC.md](MESSAGE-SPEC.md) format and interfaces with Slack as a Slack app and companion bot. It supports interactive Slack messages, allowing users to interact with their alarms without leaving Slack and supports escalating alarms from Slack to PagerDuty.

## Dispatch alert types

- **Broadcast alerts** are one-to-many, sending the same text, via Slack, to all users listed in the `dispatch` message.
- **Self-service alerts** first message the user with an interactive Slack message, prompting the user to positively or negatively confirm the alarm text. The user’s interaction is tracked by a dedicated GitHub issue, providing an the audit trail for the alarm. If a user positively confirms the message, the corresponding GitHub issue is closed, but if a user negatively confirms the message, the alarm is escalated to PagerDuty.
- **High priority alerts** are sent directly to PagerDuty.

## Architecture

`dispatch` uses the [lambda-cfn](github.com/mapbox/lambda-cfn) framework, and is composed of two separate AWS Lambda functions:

- **Incoming**: receives the SNS notification and handles the initial alarm routing and GitHub issue creation.
- **Triage**: uses API Gateway to respond to Slack interactive messages, either closing the corresponding GitHub issue or escalating the issue to PagerDuty.

## Setup

#### Third party services

`dispatch` has several external dependencies which must be setup and configured before the `dispatch` functions can be deployed:

1. **Slack app** and **bot**:  Create a new Slack App at https://api.slack.com/apps/ for `dispatch` to use for communicating with your users.
    - Under **Bot Users**, create a **Bot User** named `dispatch` and check **Always Show My Bot as Online**.
    - Under **OAuth Tokens & Redirect URLs** you will need to **Install** the app to generate the necessary bot access token, required in the [CloudFormation template](https://github.com/mapbox/dispatch/blob/master/incoming/function.template.js#L32-L34).
    - On this same page, the following **Scopes** must be defined:
      - `bot`, Add a bot user with the username @dispatch.
      - `chat:write:bot`, Send messages as dispatch.
    - Under **Interactive Messages**, enable the feature. You will need to deploy `triage` before you can add the API gateway endpoint as the **Request URL**.
    - Be sure to update the **Display Information** section with the following description of `dispatch`: "Security alarm routing bot - https://github.com/mapbox/dispatch".
    - NOTE: This process may no longer be necessary if `dispatch` is packaged and released as a Slack app.
2. **PagerDuty user** and **API key**: Create an **API key** for `dispatch` to use. Creating a dedicated PagerDuty machine account for these API keys instead of using an individual’s account is recommended.
3. **GitHub repository** and **API key**: `dispatch` uses a GitHub repository and issues as its “database” for tracking alarm state. An existing repository can be used, but it is recommended to issue API keys from a dedicated GitHub machine account with the following scopes:
    - _list of token scopes to be added_

#### Dispatch

1. Deploy both the `incoming` and `triage` functions using[`lambda-cfn`](https://github.com/mapbox/lambda-cfn/#deploying-lambda-functions-to-aws).
2. Get the `triage`  webhook URL:
    - The output of the `triage` stack contains the webhook URL for the function, this can be found with `lambda-cfn info <stack>` from within the `/triage` directory.
3. Update the Slack App:
    - Under **Interactive Messages** for the `dispatch` Slack App, update the **Request URL** with  `triage` webhook URL.

## Testing

Test `dispatch` messages can be sent using the [`awscli`](https://aws.amazon.com/cli/). Examples for each `dispatch` message type are included below. The SNS topic ARN can be found from the `incoming` function with `lambda-cfn info <stack>` from within the `/incoming` directory.

For the complete message specification see [`MESSAGE-SPEC.md`](MESSAGE-SPEC.md).

- **Self-service example**, replace `$SNS_ARN`, `$USER`
  ```
  aws sns publish --topic-arn "$SNS_ARN" --subject "" \
  --message "{\"type\":\"self-service\",\"users\":[{\"slack\": \"$USER\",\"github\":\"$USER\"}],\"body\":{\"github\":{\"title\":\"self-service title\",\"body\":\"self-service body\"},\"slack\":{\"message\":\"testSlackMessage\",\"prompt\":\"testSlackPrompt\",\"actions\":{\"yes\":\"testYesAction\",\"no\":\"testNoAction\"}}}}"
  ```

- **High priority example**, replace `$SNS_ARN`
  ```
  aws sns publish --topic-arn "$SNS_ARN" --subject "" \
  --message "{\"type\":\"high\",\"body\":{\"pagerduty\":{\"title\":\"pagerduty title\"}}}}"
  ```

- **Broadcast example**, replace `$SNS_ARN`, `$USER1`,`$USER2`
  ```
  aws sns publish --topic-arn "$SNS_ARN" --subject "" \
  --message "{\"type\":\"broadcast\",\"users\":[{\"slack\": \"$USER1\",\"github\":\"$USER1\"},{\"slack\": \"$USER2\",\"github\":\"$USER2\"}],\"body\":{\"github\":{\"title\":\"broadcast title\",\"body\":\"broadcast body\"},\"slack\":{\"message\":\"testSlackMessage\",\"prompt\":\"testSlackPrompt\",\"actions\":{\"yes\":\"testYesAction\",\"no\":\"testNoAction\"}}}}"
  ```