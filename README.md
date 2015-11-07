# Social ideas and voting

## MEAN Stack Single Page Application Test

## Installation
1. Download the repository
2. Install npm modules: `npm install`
3. Install bower dependencies `bower install`
4. Configure `./config/db.js` istead of `mongodb://127.0.0.1:27017/test`
4. Start up the server: `node server.js setup` for the very first time database setup, then simply `node server.js`
5. View in browser at http://localhost:8080


# Strongloop server API for SPA

## CREATING PROJECT STRUCTURE

`$ slc loopback`

    ? What's the name of your application? member-signup-strongloop
    ? Enter name of the directory to contain the project: member-signup-strongloop
       create member-signup-strongloop/
         info change the working directory to member-signup-strongloop

     Generating .yo-rc.json

     I'm all done. Running npm install for you to install the required dependencies. If this fails, try running the command yourself.

     create .editorconfig
     create .jshintignore
     create .jshintrc
     create README.md
     create server\boot\authentication.js
     create server\boot\root.js
     create server\component-config.json
     create server\middleware.json
     create server\middleware.production.json
     create server\server.js
     create .gitignore
     create client\README.md

`$ cd member-signup-strongloop`

## CONFIGURE SERVER

*server/config.json*

    {
      "restApiRoot": "/api",
      "host": "0.0.0.0",
      "port": 3000,
      "remoting": {
        "context": {
          "enableHttpContext": false
        },
        "rest": {
          "normalizeHttpPath": false,
          "xml": false
        },
        "json": {
          "strict": false,
          "limit": "100kb"
        },
        "urlencoded": {
          "extended": true,
          "limit": "100kb"
        },
        "cors": false,
        "errorHandler": {
          "disableStackTrace": false
        }
      },
      "legacyExplorer": false
    }


## PREPAIRING ENVIRONMENT

`$ cat > server/config.local.js`

    'use strict';
    var GLOBAL_CONFIG = require('../global-config');
    var env = (process.env.NODE_ENV || 'development');
    var isDevEnv = env === 'development' || env === 'test';

    module.exports = {
      hostname: GLOBAL_CONFIG.hostname,
      restApiRoot: GLOBAL_CONFIG.restApiRoot,
      livereload: process.env.LIVE_RELOAD,
      isDevEnv: isDevEnv,
      indexFile: require.resolve(isDevEnv ?
        '../client/ngapp/index.html' : '../client/dist/index.html'),
      port: GLOBAL_CONFIG.port,
      legacyExplorer: GLOBAL_CONFIG.legacyExplorer,
      mailer: isDevEnv ?
           {
        from: process.env.MAILER_FROM || 'medet.tleuk@dumontgroup.nyc',
        options: {
          service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
          auth: {
            user: process.env.MAILER_EMAIL_ID || 'medet.tleuk@dumontgroup.nyc',
            pass: process.env.MAILER_PASSWORD || '32452345234523453'
          }
        },
        text: "This message contains confidential information and is intended only for the individual named. If you are not the named addressee you should not disseminate, distribute or copy this e-mail. Please notify the sender immediately by e-mail if you have received this e-mail by mistake and delete this e-mail from your system. E-mail transmission cannot be guaranteed to be secure or error-free as information could be intercepted, corrupted, lost, destroyed, arrive late or incomplete, or contain viruses. The sender therefore does not accept liability for any errors or omissions in the contents of this message, which arise as a result ofe-mail transmission. If verification is required please request a hard-copy version. Company X, Suite# 1, Street, City, Country, www.company.com"
      }
         :
         GLOBAL_CONFIG.mailer
    };

`$ cat > global-config.js`

    'use strict';

    module.exports = {
        port: process.env.PORT || 3000,
        hostname: process.env.HOST || 'localhost',
        restApiRoot: '/api',
        livereload: false,
        legacyExplorer: false,
        mailer: {
            from: process.env.MAILER_FROM || 'MAILER_FROM',
            options: {
                service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
                auth: {
                    user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
                    pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
                }
            }
        }
    };


`$ cat > server/datasources.production.js`

    // Use the same environment-based configuration as in staging
    module.exports = require('./datasources.staging.js');

`$ cat > server/datasources.staging.js`

    'use strict';

    var GLOBAL_CONFIG = require('global-config');

    var env = (process.env.NODE_ENV || 'development');
    var isDevEnv = env === 'development' || env === 'test';

    module.exports = {
      db: {
        connector: 'mongodb',
        hostname: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 27017,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: (isDevEnv ? 'branded_lifestyle_dev' : 'branded_lifestyle'),
      }
    };

see also: https://docs.strongloop.com/display/public/LB/Environment-specific+configuration

`$ touch client/ngapp/index.html`

`$ touch client/dist/index.html`

*Yes, they are empty, that's only for example.*

## ADDING ME LITERAL SUPPPORT

in *server/server.js*

    app.use(loopback.token({ model: app.models.accessToken, currentUserLiteral: 'me' }));

*/api/Users/me* is implemented.

## CURRENT USER WORKAROUND

for adding **app.currentUser** in *server/server.js*

    // Retrieve the currently authenticated user
    app.use(function (req, res, next) {
    // First, get the access token, either from the url or from the headers
    var tokenId = false;
    if (req.query && req.query.access_token) {
      tokenId = req.query.access_token;
    }
    else if (req.headers && req.headers.Authorization) {
      tokenId = req.headers.Authorization
    }

    // Now, if there is a tokenId, use it to look up the currently authenticated
    // user and attach it to the app
    app.currentUser = false;
    if (tokenId) {
      var UserModel = app.models.User;

      // Logic borrowed from user.js -> User.logout()
      UserModel.relations.accessTokens.modelTo.findById(tokenId, function(err, accessToken) {
        if (err) return next(err);
        if ( ! accessToken) return next(new Error('could not find accessToken ' + tokenId));

        // Look up the user associated with the accessToken
        UserModel.findById(accessToken.userId, function (err, user) {
          if (err) return next(err);
          if ( ! user) return next(new Error('could not find a valid user'));

          app.currentUser = user;
          next();
        });
      });
    }

    // If no tokenId was found, continue without waiting
    else {
      next();
    }
    });

## GENERATING MODELS

`$ slc loopback:model`

    ? Enter the model name: Store
    ? Select the data-source to attach Store to: db (memory)
    ? Select model's base class
    > PersistedModel
    ? Expose Store via the REST API? Yes
    ? Custom plural form (used to build REST URL): Stores
    Let's add some Store properties now.

    Enter an empty property name when done.
    ? Property name: name
       invoke   loopback:property
    ? Property type: string
    ? Required? Yes

    Let's add another Store property.
    Enter an empty property name when done.
    ? Property name: created
       invoke   loopback:property
    ? Property type: date
    ? Required? No

## ALTER MODELS (ADDING DAFAULTS)

in *common\models\store.json*:

    "created": {
      "type": "date",
      "defaultFn": "now"
    },

## SETUP RELATIONS

**NB** Only "many to many" relations working fine (not only as `parent.child.create()` method)

http://www.slideshare.net/rfeng/loopback-models

Look at last 4 screens

`$ slc loopback:relation`

OR

`$ cat > common/models/store-user.json`

    {
      "name": "StoreUser",
      "plural": "StoreUsers",
      "base": "PersistedModel",
      "idInjection": true,
      "options": {
        "validateUpsert": true
      },
      "properties": {},
      "validations": [],
      "relations": {
        "user": {
          "type": "belongsTo",
          "model": "User",
          "foreignKey": "userId"
        },
        "store": {
          "type": "belongsTo",
          "model": "Store",
          "foreignKey": "storeId"
        }
      },
      "acls": [],
      "methods": {}
    }

in *common/models/user.json*:

    "relations": {
      "stores": {
        "type": "hasMany",
        "model": "Store",
        "foreignKey": "userId",
        "through": "StoreUser"
      }
    }


in *common/models/store.js*:

      "relations": {
        "users": {
          "type": "hasMany",
          "model": "User",
          "foreignKey": "storeId",
          "through": "StoreUser"
        }
      }

in *server/model-config.json*:

      "StoreUser": {
        "dataSource": "db",
        "public": false
      },


Use in code:

    store.users.add(user, function (err) {console.log('An User-Store relation added!');});

Related models population solutions: https://docs.strongloop.com/display/public/LB/Querying+related+models

Use in API: `GET /Users/{id}?filter={"include": "users"}`

Example of setting relation without explicit middle connection model:

`$ slc loopback:relation`

    ? Select the model to create the relationship from: Brand
    ? Relation type: has and belongs to many
    ? Choose a model to create a relationship with: Store
    ? Enter the property name for the relation: stores
    ? Optionally enter a custom foreign key:

`$ slc loopback:relation`

    ? Select the model to create the relationship from: Store
    ? Relation type: has and belongs to many
    ? Choose a model to create a relationship with: Brand
    ? Enter the property name for the relation: brands
    ? Optionally enter a custom foreign key:

## EXTENDING USER MODEL (WITH PROPERTIES AND RELATIONS)

**NB** Dirty hack but good: no workaround

`$ edit node_modules\loopback\common\models\user.json`

    "properties": {
      "firstName": {
        "type": "string",
        "required": true,
        "trim": true
      },
      "lastName": {
        "type": "string",
        "required": true,
        "trim": true
      },
      "displayName": {
        "type": "string",
        "required": true,
        "trim": true
      }
    },

    ...

      "relations": {
        "stores": {
          "type": "hasMany",
          "model": "Store",
          "foreignKey": "userId",
          "through": "StoreUser"
        },

### Best way (with the external model):

`$ slc loopback:model`

    ? Enter the model name: UserData
    ? Select the data-source to attach UserData to: db (memory)
    ? Select model's base class PersistedModel
    ? Expose UserData via the REST API? Yes
    ? Custom plural form (used to build REST URL): UserData
    Let's add some UserData properties now.

    Enter an empty property name when done.
    ? Property name: displayName
       invoke   loopback:property
    ? Property type: string
    ? Required? No

`$ slc loopback:relation`

    ? Select the model to create the relationship from: UserData
    ? Relation type: belongs to
    ? Choose a model to create a relationship with: User
    ? Enter the property name for the relation: user
    ? Optionally enter a custom foreign key: userId

**Problem**: non-native access: `UserData.find(where: {usedId: {eq: User.id}})` not simply `User.UserData`

## EXTENDING MODEL WITH VALIDATION AND HOOKS

`$ touch common/model/client.js`
`$ cat > common/model/client.js`

    module.exports = function(Client) {
      Client.validatesLengthOf('gender', {min: 1, message: {min: 'Please fill in client gender'}});

      Client.beforeRemote('create', function(context, user, next) {
        var req = context.req;

        // do sonething before create Client, e.g. add Date.now() or req.accessToken.userId to the data context (req.body)
        // manual is here: https://docs.strongloop.com/display/public/LB/Adding+logic+to+models
        next();
      });
    };

## ADDING CUSTOM METHODS TO MODEL

`cat > server/boot/brand.js`

    module.exports = function (app) {
      var Brand = app.models.Brand;
      Brand.prototype.add_stores = function(stores, cb) {

        if (Array.isArray(stores)) {
          for (var i = 0; i < stores.length; i++) {
            if (stores[i] instanceof app.models.Store)
              this.stores.add(stores[i], function (err) { console.log('Brand added to store.')});
          }
        } else {
          if (stores instanceof app.models.Store)
            this.stores.add(stores, function (err) { console.log('Brand added to store.')});
        }
        cb(null);
      }

    };

*NB*: for internal ones, not for API, see:

## ADD MANUAL ROUTE (REMOTE METHOD) TO API MODELS

Adding to model API: /api/Users/me

https://docs.strongloop.com/display/public/LB/Remote+methods

https://docs.strongloop.com/display/public/LB/Extend+your+API

in *common/model/user.js*:

    User.me = function(req, res, cb) {
      var AccessToken = app.models.AccessToken;
      AccessToken.findForRequest(req, {}, function (aux, accesstoken) {
        if (accesstoken == undefined) {
          res.status(401);
          res.send({
            'Error': 'Unauthorized',
            'Message': 'You need to be authenticated to access this endpoint'
          });
        } else {
          var UserModel = app.models.User;
          UserModel.findById(accesstoken.userId, function (err, user) {
            console.log(user);
            res.status(200);
            res.send(user);
          });
        }
      });

    };
    User.remoteMethod(
      'me',
      {
        accepts: [
          {arg: 'req', type: 'object', 'http': {source: 'req'}},
          {arg: 'res', type: 'object', 'http': {source: 'res'}}
        ],
        http: {path: '/me', verb: 'get'},
        returns: {arg: 'user', type: 'object'}
      }
    );

don't forget in *common/models/users.json*:

     {
       "principalType": "ROLE",
       "principalId": "$everyone",
       "permission": "ALLOW",
       "property": "me"
     },

## ADDING MANUAL ACLS TO MODEL

An example from *node_modules\loopback\common\models\user.json*:

     "hidden": ["password"],
      "acls": [
        {
          "principalType": "ROLE",
          "principalId": "$everyone",
          "permission": "DENY"
        },
        {
          "principalType": "ROLE",
          "principalId": "$everyone",
          "permission": "ALLOW",
          "property": "create"
        },
        {
          "principalType": "ROLE",
          "principalId": "$owner",
          "permission": "ALLOW",
          "property": "deleteById"
        },
        {
          "principalType": "ROLE",
          "principalId": "$everyone",
          "permission": "ALLOW",
          "property": "login"
        },
        {
          "principalType": "ROLE",
          "principalId": "$everyone",
          "permission": "ALLOW",
          "property": "logout"
        },
        {
          "principalType": "ROLE",
          "principalId": "$owner",
          "permission": "ALLOW",
          "property": "findById"
        },
        {
          "principalType": "ROLE",
          "principalId": "$owner",
          "permission": "ALLOW",
          "property": "updateAttributes"
        },
        {
          "principalType": "ROLE",
          "principalId": "$everyone",
          "permission": "ALLOW",
          "property": "me"
        },
        {
          "principalType": "ROLE",
          "principalId": "$everyone",
          "permission": "ALLOW",
          "property": "confirm"
        },
        {
          "principalType": "ROLE",
          "principalId": "$everyone",
          "permission": "ALLOW",
          "property": "resetPassword",
          "accessType": "EXECUTE"
        }
      ],

## ADD MANUAL ROUTE TO API

Adding to express route: */me*

`$ touch server/boot/routes.js`
`$ cat > touch server/boot/route.js`

    module.exports = function(app) {

      app.get('/me', function (req, res) {
        var AccessToken = app.models.AccessToken;
        AccessToken.findForRequest(req, {}, function (aux, accesstoken) {
          if (accesstoken == undefined) {
            res.status(401);
            res.send({
              'Error': 'Unauthorized',
              'Message': 'You need to be authenticated to access this endpoint'
            });
          } else {
            var UserModel = app.models.user;
            UserModel.findById(accesstoken.userId, function (err, user) {
              console.log(user);
              res.status(200);
              res.send();
            });
          }
        });
      });

    };

## DEFINING MIDDLEWARE

https://docs.strongloop.com/display/public/LB/Defining+middleware

## DEFINING MIXINS TO MODELS

https://docs.strongloop.com/display/public/LB/Defining+mixins

(it works both on backend and fronent after exporting)

## INSTAIILNG DEPENDANCES

As usual, edit package.json then

`npm install`

## TEST DATABASE

`cat > init_database.js` (modified from current version but the same thing at all)

`cat > server/boot/sample-models.js`

    module.exports = function(app) {
      var User = app.models.User;
      var chalk = require('chalk');

      var init_database = require('../../init_database')
        , env = (process.env.NODE_ENV || 'development')
        , isDevEnv = env === 'development' || env === 'test'
        ;

      if(isDevEnv){

      init_database.mock_user(app, function(_user){
        init_database.mock_stores(app, init_database.mock_data.store_names, function(_stores){
          init_database.mock_brands(app, init_database.mock_data.brand_names, _stores, function(_brands){
            init_database.mock_countries(app, init_database.mock_data.country_names, _brands, function(_countries){
              init_database.mock_clients(app, init_database.mock_data.people, function(){
                console.log(chalk.blue('Initialization complete'));
              });
            });
          });
        });
      });

      }

    };

or just fill *data.json* and put it in *daserver/datasources.json*

    {
      "db": {
        "name": "db",
        "connector": "memory",
        "file": "data.json"
      }
    }

*NB*: If there is data.json in config, after first run comment *server/boot/sample-models.js* execution from project.

## RUN API EXPLORER

`node .`

http://localhost:3000/explorer/

Go to *POST User/login* tab then fill

    {
      "username": "JohnDoe",
      "password": "opensesame"
    }

Try to fill include: *user*

Submit and get the token in response (e.g. *id = gw6ZKAydfk9phDN5Eb2qxnz1lkAHkEuQ6761RzB1MlWxsC8m81X075XejaXosoO8*) and user login data.

Put id as access_token in the API explorer head.

## RUN STRONGLOOP ARC

`$ slc arc`

*NB*: need to register first

*NB*: does not use here model explorer and editor for memory DB, it works strange - use it for remote dbs like mongodb etc.

## GENERATE AND EXPORT API SCRIPT TO ANGULAR

`$ lb-ng server/server.js client/js/lb-services.js`

*NB*: first create path *client/js/*

Manual page: https://docs.strongloop.com/display/public/LB/Generating+Angular+API+docs

## GENERATE API DOCS

Fill dependances to *package.json*:

    "grunt": "^0.4.5",
    "grunt-contrib-jshint": "~0.10.0",
    "grunt-contrib-nodeunit": "~0.4.1",
    "grunt-contrib-uglify": "~0.5.0",
    "docular": "^0.8.14",
    "loopback-sdk-angular": "^1.5.0",
    "grunt-docular": "^0.2.4",
    "grunt-loopback-sdk-angular": "^1.1.2"

`$ cat > Gruntfile.js`

    module.exports = function(grunt) {
      grunt.initConfig({
        loopback_sdk_angular: {
          services: {
            options: {
              input: 'server/server.js',
              output: 'client/js/lb-services.js'
            }
          }
        },
        docular: {
          groups: [
            {
              groupTitle: 'LoopBack',
              groupId: 'loopback',
              sections: [
                {
                  id: 'lbServices',
                  title: 'LoopBack Services',
                  scripts: [ 'client/js/lb-services.js' ]
                }
              ]
            }
          ]
        }
      });

      // Load the plugin that provides the "loopback-sdk-angular" and "grunt-docular" tasks.
      grunt.loadNpmTasks('grunt-loopback-sdk-angular');
      grunt.loadNpmTasks('grunt-docular');
      // Default task(s).
      grunt.registerTask('default', ['loopback_sdk_angular', 'docular']);
    };

`$ grunt`

    Running "loopback_sdk_angular:services" (loopback_sdk_angular) task
    > Loaded LoopBack app "server/server.js"
    Generating "lbServices" for the API endpoint "/api"
    Warning: scope User.accessTokens targets class "AccessToken", which is not exposed
    via remoting. The Angular code for this scope won't be generated.
    > Generated Angular services file "client/js/lb-services.js"

    Running "docular" task
    Loading individual files for gid: Base
    Loading individual files for gid: loopback
    Loading individual files for gid: lbServices
    Parsing files for gid:  Base
    Parsing files for gid:  loopback
    Parsing files for gid:  lbServices
    Backfilling file data for gid:  Base
    Backfilling file data for gid:  loopback
    Backfilling file data for gid:  lbServices
    Creating docs from for gid:  Base
    Creating docs from for gid:  loopback
    Creating docs from for gid:  lbServices
    Dependencies saved

    Done, without errors.

Place generated interactive API documentation page in separate server root and make sure it's working and useful.

Examples:

https://github.com/strongloop/loopback-example-angular/blob/master/client/js/controllers/todo.js

https://docs.strongloop.com/display/public/LB/Angular+example+app

https://docs.strongloop.com/display/public/LB/AngularJS+JavaScript+SDK

## CONFIGURING ANGULAR APP

Place lb-services.js in htdocs and include it in script lists in index.html.

Then edit *lb-services.js*:

    var urlBase = "http://localhost:3000/api";
    var authHeader = 'authorization';

## NATIVE GETTING ELEMENTS

 in Angular code:

    angular.module('my-app-module',  ['ngRoute' /* etc */, 'lbServices', 'my-app.controllers'])

    // access User model
    module.controller('LoginCtrl', function($scope, User, $location) {
      $scope.login = function() {
        $scope.loginResult = User.login($scope.credentials,
          function() {
            // success
          }, function(res) {
            // error
          });

 by strongloop imported model:

     var Client = angular.injector(['lbServices']).get('Client');
     $scope.clients = Client.find(
         { filter: { limit: 10 , order: 'id DESC'} },
         function(list) {
             $scope.clients = successResponse;
             $scope.$broadcast('scroll.refreshComplete');
         },
         function(errorResponse) {
             $scope.$broadcast('scroll.refreshComplete');
         }
     );

 by manual API http request:

    $http({
        method: 'GET',
        url: CORE_CONST.REST_URL + 'Brands/' + brand.id + '/Stores'
    }).then(function(successResponse){
        $scope.internal.stores = successResponse.data;
    }, error_handler);

*NB*: Use or `?access_token=` query param or `Authorization` (**NOT** `Authentication`) header.

## OFFLINE SYNCHRONIZE

https://docs.strongloop.com/display/public/LB/Synchronization

It's an experimenthal project of full server project partition to client (via *browserify* http://browserify.org/).
It generates bulk *browser.bundle.js* and contains all loopback libraries and permit to operate with the server data models.

in *model/model-name.json*

    "trackChanges": true,

in *model/model-name.js*

    module.exports = function(ModelName) {
      ModelName.handleChangeError = function(err) {
        console.warn('Cannot update change records for ModelName:', err);
      };
    }

in *client/models/local-model-name.json*

    {
      "name": "LocalModelName",
      "base": "ModelName"
    }

in *client/models/remote-model-name.json*

    {
      "name": "RemoteModelName",
      "base": "ModelName",
      "plural": "ModelNames",
      "trackChanges": false,
      "enableRemoteReplication": true
    }

in *client/model-config.json*

    {
      "_meta": {
        "sources": ["../../common/models", "./models"]
      },
      "RemoteModelName": {
        "dataSource": "remote"
      },
      "LocalModelName": {
        "dataSource": "local"
      }
    }

in *client/datasources.json*

    {
      "remote": {
        "connector": "remote",
        "url": "/api"
      },
      "local": {
        "connector": "memory",
        "localStorage": "model-name-db"
      }
    }

in *client/boot/replication.js* for *Todo* model.

    module.exports = function(client) {
      var LocalTodo = client.models.LocalTodo;
      var RemoteTodo = client.models.RemoteTodo;

      var since = { push: -1, pull: -1 };

      function sync() {
        // It is important to push local changes first,
        // that way any conflicts are resolved at the client
        LocalTodo.replicate(
          RemoteTodo,
          since.push,
          function pushed(err, conflicts, cps) {
            // TODO: handle err
            if (conflicts.length)
              handleConflicts(conflicts);

            since.push = cps;

            RemoteTodo.replicate(
              LocalTodo,
              since.pull,
              function pulled(err, conflicts, cps) {
                // TODO: handle err
                if (conflicts)
                  handleConflicts(conflicts.map(function(c) { return c.swapParties(); }));
                since.pull = cps;
              });
          });
      }

      LocalTodo.observe('after save', function(ctx, next) {
        next();
        sync(); // in background
      });

      LocalTodo.observe('after delete', function(ctx, next) {
        next();
        sync(); // in background
      });

      function handleConflicts(conflicts) {
        // TODO notify user about the conflicts
      }
    };

Browserify project:

`$ cat > client/build.js`

    var b = browserify({ basedir: __dirname });
    b.require('./client.js', { expose: 'lbclient '});

    boot.compileToBrowserify({ appRootDir: __dirname }, b);

    var bundlePath = path.resolve(__dirname, 'browser.bundle.js');
    b.pipe(fs.createWriteStream(bundlePath));

Import *browser.bundle.js* script in project.

Now we can call `LocalModel.replicate(RemoteModel)` from client and server side.

## BODY PARSER PROBLEM

There is an issue that in remote methods and custom endpoint POST method makes *req.data* as *undefined* on XLR requests.

It's an express (and, so, strongloop) issue - routes must be after *app.use(bodyParser())* but 'server/boot' is loading in sometimes strange order, so put

      var bodyParser  = require('body-parser');

      ...

      // use it separately for no 'deprecated' warnings.
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({
        extended: true
      }));

in *server/server.js* before

    boot(app, __dirname, function(err) {

and in *server/middleware.json*:

      "parse": {
        "body-parser#json": {},
        "body-parser#urlencoded": {"params": { "extended": true }}
      },

It must help.

But if its not, use common API approach.

`$ cat > common/models/store.js`

    module.exports = function(Store) {

      Store.change_scope = function(storeId, cb) {
        if (!Store.app.currentUser) {
          return cb(new Error('You need to be authenticated to access this endpoint'), null);
        } else if (!storeId) {
          return cb(new Error('No storeId found'), null);
        } else {
          Store.findById(storeId, function (err, store) {
            if (err || ! store) return cb(new Error('Store not found'), null);

            Store.app.currentUser.stores.destroyAll(function (err) {
              if (err) return cb(new Error('Store not found'), null);

              console.log([store.id, Store.app.currentUser.id]);
              store.users.add(Store.app.currentUser, function (err) {console.log('An User-Store relation added!');});
              cb(null, store);
            });
          });
        }
      };
      Store.remoteMethod(
        'change_scope',
        { accepts: [
            { arg: 'storeId', type: 'number', required: true},
          ],
          returns: {arg: 'store', type: 'object'},
          http: {path: '/change_scope', verb: 'post', status: 200, errorStatus: 404}
        }
      );

    };
