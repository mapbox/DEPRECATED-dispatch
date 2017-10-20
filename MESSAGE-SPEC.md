## Self-service dispatch

Dispatch will create a GitHub issue and an interactive Slack notification for the user. The Slack interactivity accepts two action types, "yes" and "no", which are sent to the dispatch-triage function for further processing.

Self service messages accept only a single user.

If action responses are not passed, the response will default to the return value of the Dispatch triage function, which most likely will be something ugly and not undestandable to the user, so it's recommended to pass response text.

### Self-service message specification

``` javascript
{
    type: 'self-service', // required
    requestId: 'STRING_VALUE', // optional, id for logging
    retrigger: 'BOOLEAN', // optional, if set to false, Dispatch will not send a message if an issue has already been reported
    users: [ // see complete users array specification below
        {
            slack: 'STRING_VALUE', // required, Slack handle
            github: 'STRING_VALUE' // required, GitHub handle
        }
    ],
    body: { // required
        github: {
            title: 'STRING_VALUE' // required, GitHub issue title
            body: 'STRING_VALUE' // required, GitHub issue body
        }
        slack: {
            message: 'STRING_VALUE', // required, Slack message
            prompt: 'STRING_VALUE', // required, Slack prompt for yes or not response
            actions: {
                yes: 'STRING_VALUE', // required, Slack button text for 'yes' action type
                yes_response: 'STRING_VALUE', // optional, Dispatch Triage response to return to user
                no: 'STRING_VALUE', // required, Slack button text for 'no' action type
                no_response: 'STRING_VALUE', // optional, Dispatch Triage response to return to user
            }
        }
    }
}
```

#### Message vs. prompt

To illustrate the difference between the `message` and `prompt` pieces of the `body` object, see below:

![messagevsprompt](https://github.com/mapbox/dispatch/blob/master/assets/message-vs-prompt.png)

## Broadcast dispatch

Dispatch will notify all users via a Slack notification. It does not currently support interactive Slack buttons.

Broadcast messages accept one or more users.

### Broadcast message specification

``` javascript
{
    type: 'broadcast', // required
    requestId: 'STRING_VALUE', // optional, id for logging
    retrigger: 'BOOLEAN', // optional, if set to false, Dispatch will not send a message if an issue has already been reported
    users: [ // see complete users array specification below
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
        }
        slack: {
            message: 'STRING_VALUE', // required, Slack message
        }
    }
}
```

## High priority dispatch

Dispatch will open a PagerDuty incident.

### High priority message specification


``` javascript
{
    type: 'high', // required
    requestId: 'STRING_VALUE', // optional, id for logging
    body: {
        pagerduty: {
            service: 'STRING_VALUE', // required, PagerDuty service id to create incident for
            title: 'STRING_VALUE', // required, PagerDuty incident title
            body: 'STRING_VALUE' // optional, PagerDuty incident body
        }
    }
}

```

## Users array specification

It is the responsibility of the caller to build and format the message's `users` array correctly for the type of message the caller would like to dispatch. The user objects passed in the array can contain any number of additional fields beyond those required by the Dispatch message type, and Dispatch-incoming will ignore these.

If the Slack handle does not contain an `@` symbol, it will be automatically added. GitHub handles should not contain an `@` symbol.

``` javascript
    users: [
        {
            slack: 'user1SlackHandle',
            github: 'user1GitHubHandle',
            foo: 'bar', // ignored
            rab: 'oof' // ignored
        },
        {
            slack: 'user2SlackHandle',
            github: 'user2GitHubHandle',
            foobar: 'foobaz', // ignored
            zaboof: 'raboof' // ignored
        },
        ...
    ]
```

If a Slack or GitHub handle is not passed in the `users` array, Dispatch will attempt to use sane defaults:
- Slack: defaults to the channel set by the `SlackChannel` stack parameter
- GitHub: defaults to `@mapbox/security`
