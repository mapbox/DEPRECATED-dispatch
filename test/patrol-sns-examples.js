module.exports.examples = {
  mfaDisabled: {
    'timestamp' : '2017-07-31T00:54:06.655Z',
    'title': 'User feanor has disabled 2FA on their Github account',
    'priority': 'self_service',
    'username': 'feanor',
    'message': {
      'issue': 'Two factor authentication has been disabled...',
      'directions': 'Ensure you re-enable 2FA on your Github account...',
      'prompt': {
        'message': 'Did you turn off two-factor authentication on your GitHub account? ...',
        'actions': [
          {
            'value': 'Yes'
          },
          {
            'value': 'No'
          }
        ]
      }
    }
  },
  madePublic: {
    'timestamp' : '2017-07-31T00:54:06.655Z',
    'title': 'Prvate repository silmarils made public by feanor',
    'priority': 'self_service',
    'username': 'feanor',
    'message': {
      'issue': 'A private Mapbox repository has been made public...',
      'directions': 'Please review the contents of this repository and...',
      'prompt': {
        'message': 'Did you make this private repository public? ...',
        'actions': [
          {
            'value': 'Yes'
          },
          {
            'value': 'No'
          }
        ]
      }
    }
  }
};