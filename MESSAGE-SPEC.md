## Self-service dispatch

Dispatch will create a GitHub issue and an interactive Slack notification for the user. The Slack interactivity accepts two action types, "yes" and "no", which are sent to the dispatch-triage function for further processing.

Self service messages accept only a single user.

### Self-service message specification

``` javascript
{
    type: 'self-service', // required
    requestId: 'STRING_VALUE', // optional, id for logging
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
            actions: {
                yes: 'STRING_VALUE', // Slack button text for 'yes' action type
                no: 'STRING_VALUE', // Slack button text for 'no' action type
            }
        }
    }
}
```

## Broadcast dispatch

Dispatch will notify all users via a Slack notification. It does not currently support interactive Slack buttons.

Broadcast messages accept one or more users.

### Broadcast message specification

``` javascript
{
    type: 'broadcast', // required
    requestId: 'STRING_VALUE', // optional, id for logging
    users: [ // see complete users array specification below
        {
            slack: 'STRING_VALUE' // required, Slack handle
        },
        {
            slack: 'STRING_VALUE'  // required, Slack handle
        }
    ],
    body: {
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

It is the repsonsiblity of the caller to build and format the message's `users` array correctly for the type of message the caller would like to dispatch. The user objects passed in the array can contain any number of additional fields beyond those required by the Dispatch message type, and Dispatch-incoming will ignore these.

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

If a message type requires a user attribute that is not available, for example, a user doesn't have a slack account yet, passing an empty user object will alert the Dispatch-incoming default channel configured by the stack `SlackChannel` parameter.
