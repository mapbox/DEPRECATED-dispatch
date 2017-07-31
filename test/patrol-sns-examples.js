module.exports.examples = {
  mfaDisabled = {
    'timestamp' : '2017-07-31T00:54:06.655Z',
    'title': 'User @feanor has disabled 2FA on their Github account',
    'priority': 'self_service',
    'message': {
      'github': {
        'issue': 'Two factor authentication has been disabled...',
        'directions': 'Ensure you re-enable 2FA on your Github account...'
      },
      'slack': {
        'prompt': 'Did you turn off two-factor authentication...',
        'response': ['Yes', 'No'],
        'condition': 'Responding `Yes` will... Respoding `No` will...'
      }
    }
  },
  madePublic = {
    'timestamp' : '2017-07-31T00:54:06.655Z',
    'title': 'Prvate repository silmarils made public by @feanor',
    'priority': 'self_service',
    'message': {
      'github': {
        'issue': 'A private Mapbox repository has been made public...',
        'directions': 'Please review the contents of this repository and...'
      },
      'slack': {
        'prompt': 'Did you make this private repository public...',
        'response': ['Yes', 'No'],
        'condition': 'Responding `Yes` will... Respoding `No` will...'
      }
    }
  }
};