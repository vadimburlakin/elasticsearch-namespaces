require('should');

const User = require('../user.js');

function makeUser() {
  return {
    "username":"user",
    "password":"password",
    "api_restrictions":{
      "order":"allow,deny",
      "allow":"all",
      "deny":"none"
    }
  };
}

describe('User', () => {
  describe('allow-deny policy', () => {
    const testCases = [
      {
        config: {
          api_restrictions: {
            order: 'allow',
            allow: {
              indices: 'all'
            }
          }
        },
        target: 'usr_*',
        expectation: true
      },
      {
        config: {
          api_restrictions: {
            order: 'allow',
            allow: {
              indices: 'all'
            }
          }
        },
        target: '*',
        expectation: true
      },
      {
        config: {
          api_restrictions: {
            order: 'allow',
            allow: {
              indices: 'all'
            }
          }
        },
        target: '_all',
        expectation: true
      },
      {
        config: {
          api_restrictions: {
            order: 'deny',
            deny: {
              indices: 'all'
            }
          }
        },
        target: 'usr_*',
        expectation: false
      },
      {
        config: {
          api_restrictions: {
            order: 'deny',
            deny: {
              indices: 'all'
            }
          }
        },
        target: '*',
        expectation: false
      },
      {
        config: {
          api_restrictions: {
            order: 'allow',
            allow: {
              indices: ['usr_*']
            }
          }
        },
        target: '*',
        expectation: true
      },
    ];
    testCases.forEach((test,i) => {
      it(`check case ${i}`, () => {
        const config = Object.assign(makeUser(), test.config);
        const user = new User(config);
        user._isEntityAccessible('indices', test.target).should.equal(test.expectation);
      });
    });
  });
});