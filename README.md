[![Build Status](https://travis-ci.com/mapbox/dispatch.svg?token=s7DU2T5bv9A6JyGJHzqV&branch=announce-only)](https://travis-ci.com/mapbox/dispatch)

# Dispatch

![Dispatch logo](https://github.com/mapbox/dispatch/blob/master/assets/dispatch-large.png)

Dispatch is an alarm routing tool for security and platform incident response teams. It dynamically routes alarms to PagerDuty or Slack based on incident severity, urgency, or type. It also supports emergency broadcast style alerts via Slack. Dispatch sends interactive Slack direct messages that empower users to self-triage their own security alarms. Dispatch uses GitHub repositories to maintain an audit log of all alarms, avoiding the need to maintain a separate database to store state. It also supports escalating alarms from Slack to PagerDuty.

To use Dispatch, have your applications and monitoring systems send SNS messages following the [Dispatch message specification](MESSAGE-SPEC.md) to your Dispatch SNS topic.

## Dispatch alert types

- **Broadcast alerts** are one-to-many, sending the same message via Slack to all users listed in the Dispatch message.
- **Self-service alerts** first message the user with an interactive Slack message, prompting the user to positively or negatively confirm the alarm. The user’s interaction is tracked by a dedicated GitHub issue, providing an the audit trail for the alarm. If a user positively confirms the message, Dispatch closes the corresponding GitHub issue. If a user negatively confirms the message, Dispatch escalates the alarm to PagerDuty.
- **High priority alerts** are sent directly to PagerDuty.

## Architecture

Dispatch consists of two separate AWS Lambda functions that leverage the [lambda-cfn](github.com/mapbox/lambda-cfn) framework:

- **dispatch-incoming**: receives SNS notifications and creates PagerDuty alarms or GitHub issues.
- **dispatch-triage**: uses API Gateway to respond to Slack interactive messages, either closing the corresponding GitHub issue or escalating the issue to PagerDuty.

## Prerequisites

### Lambda-cfn

To deploy and manage Dispatch you'll need to globally install the latest version of [lambda-cfn](https://github.com/mapbox/lambda-cfn).

`npm install -g @mapbox/lambda-cfn`

### Third party services

You'll also need a GitHub organization with private repositories, a PagerDuty account, and a Slack workspace in order to run Dispatch.

## Set up

To set up Dispatch for your organization, you'll need to do the following:

1. Configure GitHub
1. Configure PagerDuty
1. Configure the Dispatch Slack bot
1. Configure AWS Key Management Service (KMS)
1. Deploy the dispatch-incoming AWS Lambda function
1. Deploy the dispatch-triage AWS Lambda function
1. Update the Dispatch Slack app with the dispatch-triage API Gateway URL

### 1. Configure GitHub

To configure GitHub for Dispatch, you'll need to do the following:

1. Create or select a GitHub repository for Dispatch GitHub issues
1. Create a machine account or select an existing user account to run Dispatch
1. Generate a GitHub personal access token with `repo` scope with the account from step 2

Dispatch creates a new GitHub issue for each alarm, using the `title` and `body` from the Dispatch message specification to populate the issue. You can use an existing GitHub repository or create a new one. You'll provide the name of the GitHub repository via the `GithubRepo` CloudFormation parameter when deploying the `incoming` and `triage` functions via lambda-cfn in steps 3 and 4 of setup.

When deploying Dispatch you'll also need to provide a GitHub personal access token with a full `repo` scope via the `GithubToken` CloudFormation parameter. For least privilege we recommend that you use a dedicated GitHub account that only has write access to your Dispatch alerts repository. Dispatch will use the account associated with the access token to create GitHub issues.

It's on our road map to evaluate and possibly switch to [GitHub apps](https://developer.github.com/apps/) instead of personal access tokens.

### 2. Configure PagerDuty

You'll need to create a new PagerDuty service or use an existing one for Dispatch to send alerts to. You'll also need a PagerDuty admin or account owner [to generate a new dedicated API key](https://support.pagerduty.com/docs/using-the-api#section-generating-an-api-key) for Dispatch.

### 3. Configure Slack

You'll need to create a custom Slack app and bot user in your Slack workspace for Dispatch. It's on our road map to eventually publish an installable Slack app in the public Slack App Directory to make this process easier.

1. Visit https://api.slack.com/apps/, click **Create an App**. Provide a name, select your Slack workspace, then click **Create App**.
1. Scroll down to **Display Information** and upload the Dispatch Slack App icon as well as provide a description for your users. We recommend "Security alarm routing bot - https://github.com/mapbox/dispatch" but feel free to use your own!
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

* `GithubOwner` = your GitHub organization's name
* `GithubRepo` = GitHub repository for Dispatch issues
* `GithubToken` = [sensitive] GitHub personal access token for Dispatch machine account
* `PagerDutyServiceId` = the ID of your Dispatch PagerDuty service, obtained from the service URL in PagerDuty
* `PagerDutyFromAddress` = email address of a valid PagerDuty user in your team, [required by the PagerDuty API](https://v2.developer.pagerduty.com/docs/incident-creation-api)
* `PagerDutyApiKey` = [sensitive] PagerDuty API key
* `SlackChannel` = Fallback Slack channel for when Dispatch direct messages fail
* `SlackBotToken` = [sensitive] Bot user OAuth access token from your Dispatch Slack app (begins with `xoxb-`)
* `KmsKey` = cloudformation-kms stack name or AWS KMS key ARN to encrypt sensitive parameter values

For `CodeS3Bucket`, `CodeS3Prefix`, `GitSha`, and `ServiceAlarmEmail` parameters please see the [lambda-cfn documentation for these parameters](https://github.com/mapbox/lambda-cfn#providing-parameter-values).

### 6. Deploy the dispatch-triage AWS Lambda function

Similar to deploying dispatch-incoming, switch to the `triage` directory then deploy dispatch-triage using `lambda-cfn create -k <environment name>`.

You'll need to provide the same parameter values from deploying dispatch-incoming, except for the Slack related parameters.

Once the deploy is finished, run `lambda-cfn info <environment name>` then scroll down to the `Outputs` section of the CloudFormation template. We'll use the `triageWebhookAPIEndpoint` URL in the next step to update our Slack app.

### 7. Update the Dispatch Slack app with the dispatch-triage API Gateway URL

1. After deploying dispatch-triage, from the `triage` directory run `lambda-cfn info <environment name>` then scroll down to the `Outputs` section of the CloudFormation template. 
1. Copy the value for `triageWebhookAPIEndpoint`. It should be an AWS API Gateway URL.
1. [Visit your Slack Apps](https://api.slack.com/apps), then click on **Interactive Components** under the **Features** section.
1. Click on **Enable Interactive Components**.
1. Paste the URL for `triageWebhookAPIEndpoint` under **Request URL** and click on **Save changes**.

You're done setting up Dispatch! You can now test and verify your installation, see the Testing section.

## Testing

You can test your Dispatch installation by using the [AWS CLI](https://aws.amazon.com/cli/) to send SNS messages that follow the Dispatch [message specification](MESSAGE-SPEC.md). For the complete message specification see [`MESSAGE-SPEC.md`](MESSAGE-SPEC.md).

We've provided examples for each Dispatch alert type - self-service, high priority, and broadcast - below. To obtain your Dispatch SNS topic ARN (`$SNS_ARN` in the examples), from the `incoming` directory:

1. Run `lambda-cfn info <environment name>`
1. Scroll down to the `Outputs` section of the CloudFormation template and copy the value for `incomingSNSTopic`.

### Self-service example

This will send a Slack direct message from your Dispatch bot and create a GitHub issue in your Dispatch repo for a user. If the user clicks yes it will close the GitHub issue. If the user clicks know it will trigger a PagerDuty incident.

Replace `$SNS_ARN` and `$USER` with your SNS topic ARN and your GitHub and Slack usernames.

```
aws sns publish --topic-arn "$SNS_ARN" --subject "test" \
--message "{\"type\":\"self-service\",\"users\":[{\"slack\": \"$USER\",\"github\":\"$USER\"}],\"body\":{\"github\":{\"title\":\"self-service title\",\"body\":\"self-service body\"},\"slack\":{\"message\":\"testSlackMessage\",\"prompt\":\"testSlackPrompt\",\"actions\":{\"yes\":\"testYesAction\",\"no\":\"testNoAction\"}}}}"
```

### Broadcast example

Broadcast alerts are self-service alerts sent to multiple users. Replace `$SNS_ARN` with your SNS topic ARN and provide GitHub and Slack usernames for `$USER1` and `$USER2`.

```
aws sns publish --topic-arn "$SNS_ARN" --subject "test" \
--message "{\"type\":\"broadcast\",\"users\":[{\"slack\": \"$USER1\",\"github\":\"$USER1\"},{\"slack\": \"$USER2\",\"github\":\"$USER2\"}],\"body\":{\"github\":{\"title\":\"broadcast title\",\"body\":\"broadcast body\"},\"slack\":{\"message\":\"testSlackMessage\",\"prompt\":\"testSlackPrompt\",\"actions\":{\"yes\":\"testYesAction\",\"no\":\"testNoAction\"}}}}"
```

### High priority example

High priority Dispatch alerts create PagerDuty incidents without creating a GitHub issue. Replace `$SNS_ARN` and `$PD_SERVICE_ID` with your SNS topic ARN and PagerDuty service ID.

```
aws sns publish --topic-arn "$SNS_ARN" --subject "test" --message "{\"type\":\"high\",\"body\":{\"pagerduty\":{\"service\":\"$PD_SERVICE_ID\",\"title\":\"testAlert\",\"body\":\"testAlert\"}}}"
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

Dispatch uses eslint for linting and tape for tests. It mocks HTTP requests with sinon and nock. Tests run on Travis CI after every commit.

* `npm test` will run eslint then tape.
* `npm lint` will only run eslint.
* `npm unit-test` will only run tape tests.

## Contributing

Contributors are welcome! If you want to contribute, please fork this repo then submit a pull request (PR).

All of your tests should pass both locally and in Travis before we'll accept your PR. We also request that you add additional test coverage and documentation updates in your PR where applicable.