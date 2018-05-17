const User = require('./user');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const debug = require('debug')('elasticsearch-namespaces:user-manager');
require('colors');

const UserManager = {};

UserManager.USER_CONFIGS = [];

UserManager.USERS = {};

// TOOD
// move to some KVS (Consul?)
UserManager.loadUsers = function(_path) {
  fs.readdirSync(_path).forEach(function(file) {
    if (!/\.ya?ml$/.test(file)) return;

    try {
      let doc = yaml.safeLoad(fs.readFileSync(path.join(_path, file), 'utf8'));

      if (!doc.users instanceof Array) {
        console.error('');
        console.error(`Expected user file ${ file } to contain 'users' array with user configurations.`.red.bold);
        console.error('');
        process.exit(1);
      }

      doc.users.forEach(user => {
        if (typeof user.username !== 'string') {
          console.error('');
          console.error(`User configuration must specify a username. Check configuration of ${ file }:`.red.bold);
          console.error('');
          process.exit(1);
        }
      });

      UserManager.USER_CONFIGS = UserManager.USER_CONFIGS.concat(doc.users);
    } catch (e) {
      console.error('');
      console.error(`Could not load user file: ${ file }:`.red.bold);
      console.error(e.message);
      console.error('');
      process.exit(1);
    }
  });

  UserManager.USER_CONFIGS.forEach(userConfig => {
    const username = userConfig.username;

    if (UserManager.USERS[username]) {
      console.error('');
      console.error(`Duplicate configuration for user ${ username }. Please configure each user exactly once.`.red.bold);
      console.error('');
      process.exit(1);
    }

    UserManager.USERS[username] = new User(userConfig);
  });

  debug('loaded ' + Object.keys(UserManager.USERS).length + ' users');
}

UserManager.authenticate = function(username, password) {
  if (!UserManager.USERS[username]) return false;
  return UserManager.USERS[username].authenticate(password);
}

UserManager.getUser = function(username) {
  return UserManager.USERS[username] || null;
}

exports = module.exports = UserManager;