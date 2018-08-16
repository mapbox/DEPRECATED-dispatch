[![Build Status](https://travis-ci.org/mapbox/dispatch.svg?branch=master)](https://travis-ci.org/mapbox/dispatch)

![Dispatch logo](https://github.com/mapbox/dispatch/blob/master/assets/dispatch-large.png)

**Dispatch** is an alarm routing tool for security and platform incident response teams. It dynamically routes alarms to [PagerDuty](https://www.pagerduty.com/) or [Slack](https://slack.com/) based on incident severity, urgency, or type. Dispatch sends interactive Slack direct messages that empower users to self-triage their own security alarms. It also supports emergency broadcast style alerts via Slack, as well as escalating alarms from Slack to PagerDuty. For each alarm, Dispatch creates a GitHub issue for auditing and logging purposes, avoiding the need to maintain a separate database to store state.

To use Dispatch, have your applications and monitoring systems send [AWS Simple Notification Service](https://aws.amazon.com/sns/) (SNS) messages following the [Dispatch message specification](MESSAGE-SPEC.md) to your Dispatch SNS topic.

## Dispatch alert types

- **Self-service alerts** send interactive Slack messages to users, prompting them to answer yes or no. The user's response is tracked via a GitHub issue for audit purposes. If a user responds yes, it closes the issue. If a user response no, Dispatch escalates the alarm to PagerDuty.
- **Broadcast alerts** are non-interactive messages delivered via Slack to multiple users. These alerts create a single GitHub issue for audit purposes with a list of users that received the message.
- **High priority alerts** are sent directly to PagerDuty.
- **Low priority alerts** are sent directly to a GitHub issue.

## Architecture

Dispatch consists of two separate [AWS Lambda functions](https://aws.amazon.com/lambda/) that leverage the [lambda-cfn](github.com/mapbox/lambda-cfn) framework:

- **dispatch-incoming**: receives SNS notifications and creates PagerDuty alarms or GitHub issues.
- **dispatch-triage**: uses [API Gateway](https://aws.amazon.com/api-gateway/) to respond to Slack interactive messages, either closing the corresponding GitHub issue or escalating the issue to PagerDuty.

## Prerequisites

### Lambda-cfn

To deploy and manage Dispatch you'll need to globally install the latest version of [lambda-cfn](https://github.com/mapbox/lambda-cfn).

`npm install -g @mapbox/lambda-cfn`

### Third party services

You'll also need a GitHub organization with private repositories, a PagerDuty account, and a Slack workspace in order to run Dispatch.

## Set up

To set up Dispatch for your organization, you'll need to do the following:

1. Configure GitHub
2. Configure PagerDuty
3. Configure the Dispatch Slack app and bot
4. Configure AWS Key Management Service (KMS)
5. Deploy the dispatch-incoming AWS Lambda function
6. Deploy the dispatch-triage AWS Lambda function
7. Update the Dispatch Slack app with the dispatch-triage API Gateway URL

### 1. Configure GitHub

To configure GitHub for Dispatch, you'll need to do the following:

1. Create or select a default GitHub repository for Dispatch GitHub issues
2. Select or create a failover default GitHub user or team
3. Create a machine account or select an existing user account to run Dispatch
4. Generate a GitHub personal access token with `repo` scope with the account from Step #2

Dispatch creates a new GitHub issue for each alarm, using the `title` and `body` from the Dispatch message specification to populate the issue. You can use an existing GitHub repository or create a new one. You'll provide the name of the default GitHub repository via the `GitHubRepo` CloudFormation parameter when deploying the `incoming` and `triage` functions via lambda-cfn in steps 3 and 4 of setup. Dispatch will default to creating issues in this repository; however, you can also specify a different destination repository using the `githubRepo` property in the SNS message specification. This allows different alarms to be routed to different GitHub repos.

When deploying Dispatch you'll also need to provide a GitHub personal access token with a full `repo` scope via the `GitHubToken` CloudFormation parameter. For least privilege we recommend that you use a dedicated GitHub account that only has write access to your Dispatch alerts repository. Dispatch will use the account associated with the access token to create GitHub issues.

If Dispatch doesn't receive the GitHub handle for the user in the SNS message, then it will fallback to tagging a default GitHub user or GitHub team. Provide this via the `GitHubDefaultUser` CloudFormation parameter.

It's on our road map to evaluate and possibly switch to [GitHub apps](https://developer.github.com/apps/) instead of personal access tokens.

### 2. Configure PagerDuty

You'll need to create a new PagerDuty service or use an existing one for Dispatch to send alerts to. You'll also need a PagerDuty admin or account owner [to generate a new dedicated API key](https://support.pagerduty.com/docs/using-the-api#section-generating-an-api-key) for Dispatch.

### 3. Configure Slack

You'll need to create a custom Slack app and bot user in your Slack workspace for Dispatch. It's on our road map to eventually publish an installable Slack app in the public Slack App Directory to make this process easier.

1. Visit https://api.slack.com/apps/, click **Create an App**. Provide a name, select your Slack workspace, then click **Create App**.
1. Scroll down to **App Credentials** and save the value for **Verification Token** somewhere safe and secure. You'll need this value later when deploying dispatch-triage for the `SlackVerificationToken` parameter.
1. Scroll down to **Display Information** and [upload the Dispatch Slack App icon](https://github.com/mapbox/dispatch/blob/master/assets/dispatch-slack-app.jpg) as well as provide a description for your users. We recommend "Security alarm routing bot - https://github.com/mapbox/dispatch" but feel free to use your own!
1. Click on **Bot Users** under the Features section, then create a **Bot User** named Dispatch and check **Always Show My Bot as Online**.
1. Click on **OAuth & Permissions** under the Features section, then scroll down to the **Scopes** section. Add the `chat:write:bot` scope. You should already see the `bot` scope added from step 2, but if not then add it.
1. On the same page, scroll to the top and click on **Install App to Workspace** then **Authorize**.
1. Save the value for the **Bot User OAuth Access Token** somewhere safe - you'll need it for the `SlackBotToken` parameter later when deploying the dispatch-incoming Lambda function. You can also retrieve this later by clicking on **Install App** under the **Settings** section.

### 4. Configure AWS Key Management Service (KMS)

Dispatch by default uses [cloudformation-kms](https://github.com/mapbox/cloudformation-kms) to decrypt the values of sensitive CloudFormation parameters, such as PagerDuty and Slack API keys, that are encrypted as part of the deploy process with lambda-cfn. [Follow the setup instructions for cloudformation-kms](https://github.com/mapbox/cloudformation-kms#usage).

If you'd prefer to *not* use [cloudformation-kms](https://github.com/mapbox/cloudformation-kms), then you can also edit the CloudFormation templates for both [incoming](https://github.com/mapbox/dispatch/blob/master/incoming/function.template.js) and [triage](https://github.com/mapbox/dispatch/blob/master/triage/function.template.js) to use raw KMS key ARNs instead of cloudformation-kms stacks. Replace the following `statements` section of `function.template.js` for both the [dispatch-incoming](https://github.com/mapbox/dispatch/blob/master/incoming/function.template.js) and [dispatch-triage](https://github.com/mapbox/dispatch/blob/master/triage/function.template.js) AWS Lambda functions.

Instead of

```js
  statements: [
    {
      Effect: 'Allow',
      Action: [
        'kms:Decrypt'
      ],
      Resource: {
        'Fn::ImportValue': {
          'Ref': 'KmsKey'
        }
      }
    }
  ],
```

Instead use

```js
  statements: [
    {
      Effect: 'Allow',
      Action: [
        'kms:Decrypt'
      ],
      Resource: {
        'Ref': 'KmsKey'
      }
    }
  ],
```

This will allow you to pass in a raw KMS key ARN when deploying both Lambda functions instead of a CloudFormation stack name or alias.

### 5. Deploy the dispatch-incoming AWS Lambda function

To deploy dispatch-incoming to your AWS infrastructure you'll need to first clone Dispatch, navigate to the `incoming` directory, then use `lambda-cfn create` to launch a new CloudFormation stack. Since we're providing sensitive credentials as parameter values, to encrypt them in CloudFormation we'll use the `-k` flag with `lambda-cfn create`.

```sh
git clone git@github.com:mapbox/dispatch.git
cd dispatch/incoming
lambda-cfn create <environment-name> -k
```

For example, if you run `lambda-cfn create dev -k` this will create a CloudFormation stack named `dispatch-incoming-dev`.

When deploying or updating dispatch-incoming you'll need to provide values for the following CloudFormation parameters:

* `GitHubOwner` = Your GitHub organization's name
* `GitHubDefaultUser` = Default GitHub user or team when a user's GitHub handle is missing
* `GitHubRepo` = Default GitHub repository for Dispatch issues
* `GitHubToken` = [sensitive] GitHub personal access token for Dispatch machine account
* `PagerDutyServiceId` = The ID of your Dispatch PagerDuty service, obtained from the service URL in PagerDuty
* `PagerDutyFromAddress` = Email address of a valid PagerDuty user in your team, [required by the PagerDuty API](https://v2.developer.pagerduty.com/docs/incident-creation-api)
* `PagerDutyApiKey` = [sensitive] PagerDuty API key
* `slackDefaultChannel` = Fallback Slack channel for when Dispatch direct messages fail
* `SlackBotToken` = [sensitive] Bot user OAuth access token from your Dispatch Slack app (begins with `xoxb-`)
* `KmsKey` = Cloudformation-kms stack name or AWS KMS key ARN to encrypt sensitive parameter values

For `CodeS3Bucket`, `CodeS3Prefix`, `GitSha`, and `ServiceAlarmEmail` please see the [lambda-cfn documentation for these parameters](https://github.com/mapbox/lambda-cfn#providing-parameter-values).

### 6. Deploy the dispatch-triage AWS Lambda function

Similar to deploying dispatch-incoming, switch to the `triage` directory then deploy dispatch-triage using `lambda-cfn create -k <environment name>`.

You'll need to provide most of the same parameter values from deploying dispatch-incoming. Notably, you'll need to provide the Slack verification token for your Dispatch app (step #2 of configuring Slack) for the `SlackVerificationToken` CloudFormation parameter.

### 7. Update the Dispatch Slack app with the dispatch-triage API Gateway URL

1. After deploying dispatch-triage, from the `triage` directory run `lambda-cfn info <environment name>` then scroll down to the `Outputs` section of the CloudFormation template.
1. Copy the value for `triageWebhookAPIEndpoint`. It should be an AWS API Gateway URL.
1. [Visit your Slack Apps](https://api.slack.com/apps), then click on **Interactive Components** under the **Features** section.
1. Click on **Enable Interactive Components**.
1. Paste the URL for `triageWebhookAPIEndpoint` under **Request URL** and click on **Save changes**.

You're done setting up Dispatch! You can now test and verify your installation, [see the Testing section](https://github.com/mapbox/dispatch/blob/master/README.md#testing).

## Testing

You can test your Dispatch installation by using the [AWS CLI](https://aws.amazon.com/cli/) to send SNS messages that follow the Dispatch [message specification](MESSAGE-SPEC.md). For the complete message specification see [`MESSAGE-SPEC.md`](MESSAGE-SPEC.md).

We've provided examples for each Dispatch alert type - self-service, high priority, and broadcast - below. To obtain your Dispatch SNS topic ARN (`$SNS_ARN` in the examples), from the `incoming` directory:

1. Run `lambda-cfn info <environment name>`
1. Scroll down to the `Outputs` section of the CloudFormation template and copy the value for `incomingSNSTopic`.

### Self-service example

This will send a Slack direct message from your Dispatch bot and create a GitHub issue in your Dispatch repo for a user. If the user clicks yes it will close the GitHub issue. If the user clicks no it will trigger a PagerDuty incident.

Replace `$SNS_ARN` and `$USER` with your SNS topic ARN and your GitHub and Slack usernames.

```
aws sns publish --topic-arn "$SNS_ARN" --subject "test" \
--message "{\"type\":\"self-service\",\"users\":[{\"slackId\": \"$USER\",\"github\":\"$USER\"}],\"body\":{\"github\":{\"title\":\"self-service title\",\"body\":\"self-service body\"},\"slack\":{\"message\":\"testSlackMessage\",\"prompt\":\"testSlackPrompt\",\"actions\":{\"yes\":\"testYesAction\",\"no\":\"testNoAction\"}}}}"
```

### Broadcast example

Broadcast alerts send non-interactive Slack messages to multiple users. They create a single GitHub issue of the broadcast for audit purposes, but do not create a GitHub issue for each user. Replace `$SNS_ARN` with your SNS topic ARN and provide GitHub and Slack usernames for `$USER1` and `$USER2`.

```
aws sns publish --topic-arn "$SNS_ARN" --subject "test" \
--message "{\"type\":\"broadcast\",\"users\":[{\"slackId\": \"$USER1\"},{\"slackId\": \"$USER2\"}],\"body\":{\"github\":{\"title\":\"broadcast title\",\"body\":\"broadcast body\", \"labels\": [\"broadcast\"]},\"slack\":{\"message\":\"testSlackMessage\"}}}"
```

### High priority example

High priority Dispatch alerts create PagerDuty incidents without creating a GitHub issue. Replace `$SNS_ARN` and `$PD_SERVICE_ID` with your SNS topic ARN and PagerDuty service ID.

```
aws sns publish --topic-arn "$SNS_ARN" --subject "test" --message "{\"type\":\"high-priority\",\"body\":{\"pagerduty\":{\"service\":\"$PD_SERVICE_ID\",\"title\":\"testAlert\",\"body\":\"testAlert\"}}}"
```

### Low priority example

Low priority Dispatch alerts create a GitHub issue only. Replace `$SNS_ARN` and `$GITHUB_REPO` with your SNS topic ARN and target GitHub repository.

```
aws sns publish --topic-arn "$SNS_ARN" --subject "test" --message "{\"type\":\"low-priority\",\"githubRepo\":\"$GITHUB_REPO\",\"body\":{\"github\":{\"title\":\"low-priority title\",\"body\":\"low-priority body\", \"labels\": [\"low_priority\"]}}}"
```

### Nag example

Low priority Dispatch alerts create a GitHub issue only. Replace `$SNS_ARN` and `$GITHUB_REPO` with your SNS topic ARN and target GitHub repository.

```
aws sns publish --topic-arn "$SNS_ARN" --subject "test" --message "{\"type\":\"nag\",\"githubRepo\":\"$GITHUB_REPO\",\"body\":{\"github\":{\"title\":\"nag title\",\"body\":\"low-priority body\", \"labels\": [\"low_priority\"]}}}"
```


## Development

### Installation

Make sure you are running Node 6.10.3 with npm 5 installed.

```sh
git clone git@github.com:mapbox/dispatch.git
cd dispatch
npm install
```

### Tests

Dispatch uses [eslint](https://github.com/eslint/eslint) for linting and [tape](https://github.com/substack/tape) for tests. It mocks HTTP requests with [sinon](https://github.com/sinonjs/sinon) and [nock](https://github.com/node-nock/nock). Tests run on Travis CI after every commit.

* `npm test` will run eslint then tape.
* `npm lint` will only run eslint.
* `npm unit-test` will only run tape tests.

## Feature Roadmap

The planned features and development roadmap for Dispatch can be found in the [Dispatch Roadmap](https://github.com/mapbox/dispatch/projects/1) GitHub project.

## Contributing

Contributors are welcome! If you want to contribute, please fork this repo then submit a pull request (PR).

All of your tests should pass both locally and in Travis before we'll accept your PR. We also request that you add additional test coverage and documentation updates in your PR where applicable.
