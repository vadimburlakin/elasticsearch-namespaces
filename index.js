const debug = require('debug')('elasticsearch-namespaces:index');

// load ES spec files
const ApiSpec = require('./es-api-spec');
ApiSpec.loadSpecs('./rest-api-spec/src/main/resources/rest-api-spec/api');

// load users yaml
const UserManager = require('./user-manager');
UserManager.loadUsers('users');

// set up our proxy server
const express = require('express');
const app = express();
const UPSTREAM = process.env.UPSTREAM || 'http://localhost:9200';

// 1. Authenticate the user, and reject if credentials are invalid
app.use(require('./middleware/authenticate-user'));

// 2. Determine ES API endpoint
app.use(require('./middleware/set-elasticsearch-endpoint'));

// 3. Authorize index write operations
app.use(require('./middleware/authorize-index-writes'));

// 4. Forward to ES
app.use('/', require('./middleware/forward-to-upstream')({ target: UPSTREAM }));

const port = process.env.PORT || 3001;
app.listen(port);
debug(`lsitening on port ${port}`);