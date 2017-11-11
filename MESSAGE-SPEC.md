# Dispatch Message Specification

To route alarms through Dispatch, send an [AWS SNS](https://aws.amazon.com/sns/) message to your Dispatch SNS topic that follows the Dispatch message specification.

The Dispatch message specification currently accepts three types of alarm routing:

* Self-service
* Broadcast
* High priority

## Self-service dispatch

Self-service Dispatch messages do the following for a single user:

1. Create a GitHub issue and tag the user's GitHub handle.
2. Send an interactive Slack direct message to the user, which prompts them to respond yes or no.

If a GitHub username is not provided or could not be found, Dispatch will fall back to the `GithubDefaultUser` parameter.
If a Slack username is not provided or could not be found, Dispatch will fall back to the `SlackChannel` parameter.

The self-service message on Slack includes a link to the associated GitHub issue. The dispatch-triage AWS Lambda function handles the yes or no response from the user in Slack, either closing the GitHub issue or escalating the issue to PagerDuty.

### Message specification

``` javascript
{
  type: 'self-service', // required
  requestId: 'STRING_VALUE', // optional, id for logging
  githubRepo: 'STRING_VALUE', // optional, specify GitHub repository for Dispatch issue
  retrigger: 'BOOLEAN', // optional, if set to false Dispatch will not send a message if an issue has already been reported
  users: [ // required
    {
      slack: 'STRING_VALUE', // required, Slack handle
      github: 'STRING_VALUE' // required, GitHub handle
    }
  ],
  body: { // required
    github: {
      title: 'STRING_VALUE' // required, GitHub issue title
      body: 'STRING_VALUE' // required, GitHub issue body
    },
    slack: {
      message: 'STRING_VALUE', // required, Slack message
      prompt: 'STRING_VALUE', // required, Slack prompt for yes or no response
      actions: {
        yes: 'STRING_VALUE', // required, Slack button text for 'yes' action type
        yes_response: 'STRING_VALUE', // optional, dispatch-triage response to  user after they click yes
        no: 'STRING_VALUE', // required, Slack button text for 'no' action type
        no_response: 'STRING_VALUE', // optional, dispatch-triage response to user after they click no
      }
    }
  }
}
```

### Use `yes_response` and `no_response`

Though `body.slack.actions.yes_response` and `body.slack.actions.no_response` are not required, we recommend you use them in your self service messages so that your users have friendly experiences with Dispatch. If you omit these properties then your users will receive default return values from the dispatch-triage AWS Lambda function.

### Slack message vs. prompt

To help explain the difference between `body.slack.message` and `body.slack.prompt`, see this Dispatch self-service alarm in Slack:

![messagevsprompt](https://github.com/mapbox/dispatch/blob/master/assets/message-vs-prompt.png)

In the example above, the text that begins with "It looks like Two-factor authentication (2FA)" is the Slack message (`body.slack.message`). By comparison, "Please confirm whether or not your disabled 2FA below" is the prompt (`body.slack.prompt`).

## Broadcast dispatch

Broadcast Dispatch messages do the following:

1. Send a non-interactive Slack direct message to a list of users.
1. Create a single GitHub issue with the list of notified users for audit log purposes.

Broadcast messages do not currently support interactive Slack messages. Though they do create a single GitHub issue, this ticket intentionally does not tag the GitHub handles of notified users. Instead, it lists their Slack handles.

Unlike self-service alarms, broadcast Slack DMs do not include a link to their associated GitHub issue. If you need to provide a link to a GitHub issue for educational or training purposes you should include it in the Slack message via `body.slack.message`.

### Message specification

``` javascript
{
  type: 'broadcast', // required
  requestId: 'STRING_VALUE', // optional, id for logging
  githubRepo: 'STRING_VALUE', // optional, specify GitHub repository for Dispatch issue
  retrigger: 'BOOLEAN', // optional, if set to false Dispatch will not send a message if an issue has already been reported
  users: [
    {
      slack: 'STRING_VALUE' // required, Slack handle
    },
    {
      slack: 'STRING_VALUE'  // required, Slack handle
    }
  ],
  body: {
    github: {
        title: 'STRING_VALUE', // required, GitHub issue title
        body: 'STRING_VALUE' // required, GitHub issue body
    },
    slack: {
      message: 'STRING_VALUE', // required, Slack message
    }
  }
}
```

## High priority dispatch

High priority dispatch messages open a PagerDuty incident.

### Message specification


``` javascript
{
  type: 'high', // required
  requestId: 'STRING_VALUE', // optional, id for logging
  body: {
    pagerduty: {
      service: 'STRING_VALUE', // required, PagerDuty service ID to create incident for
      title: 'STRING_VALUE', // required, PagerDuty incident title
      body: 'STRING_VALUE' // optional, PagerDuty incident body
    }
  }
}
```

## Users array specification

Dispatch only processes Slack and GitHub handles in the `users` array. It ignores handles or usernames for other services. This allows you to connect Dispatch to a central API or username mappings file without having to scrub or remove other data.

Dispatch automatically adds the `@` symbol to Slack handles if it is missing. Do not add the `@` symbol to GitHub handles.

``` javascript
users: [
  {
    slack: 'user1SlackHandle',
    github: 'user1GitHubHandle',
    google: 'user1GoogleHandle', // ignored
    okta: 'user1OktaHandle' // ignored
  },
  {
    slack: 'user2SlackHandle',
    github: 'user2GitHubHandle',
    google: 'user2GoogleHandle', // ignored
    okta: 'user2OktaHandle' // ignored
  },
  ...
]
```

If a Slack or GitHub handle is missing from the `users` array, then Dispatch will failover to either a Slack channel or GitHub user/team for visibility. These values are set via CloudFormation parameters when deploying dispatch-incoming and dispatch-triage via [lambda-cfn](https://github.com/mapbox/lambda-cfn).

* Slack = `SlackChanel`
* GitHub = `GithubDefaultUser`
