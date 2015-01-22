2015-01-22, Version 3.7.0
=========================

 * Fix registration of status route (Miroslav Bajtoš)


2015-01-15, Version 3.6.5
=========================

 * Fix handling of workspaces with nested packages (Miroslav Bajtoš)

 * Facet: remove PackageDefinition-related code (Miroslav Bajtoš)

 * Fix the test case (Raymond Feng)


2015-01-07, Version 3.6.4
=========================

 * Add description/repostiory/readme to avoid npm warnings (Raymond Feng)

 * Fix bad CLA URL in CONTRIBUTING.md (Ryan Graham)

 * available-connectors: add Couchbase connector (Miroslav Bajtoš)


2014-12-15, Version 3.6.3
=========================

 * Set base model of discovered models (Miroslav Bajtoš)


2014-12-11, Version 3.6.2
=========================

 * Fix discovery of model properties with id:true (Miroslav Bajtoš)

 * Update chai to ^1.10 (Miroslav Bajtoš)


2014-12-08, Version 3.6.1
=========================

 * Remove underscore (Ryan Graham)


2014-12-02, Version 3.6.0
=========================

 * api-server: remove static middleware placeholder (Miroslav Bajtoš)

 * Remove supportedTypes (Raymond Feng)

 * template/api-server: introduce middleware.json (Miroslav Bajtoš)

 * Add remoting options to server/config.json (Raymond Feng)


2014-12-01, Version 3.5.2
=========================

 * Remove "npm install loopback-explorer" log (Miroslav Bajtoš)

 * ModelDefinition: make idInjection true by default (Miroslav Bajtoš)


2014-10-22, Version 3.5.0
=========================

 * Include loopback in model sources (Miroslav Bajtoš)

 * Fix definition of `description` properties (Miroslav Bajtoš)

 * Handle shorthand property definition (Miroslav Bajtoš)

 * connector: load loopback models from filesystem (Miroslav Bajtoš)

 * templates/api-server: remove `url` from config (Miroslav Bajtoš)

 * available-connectors: add saphana (Jenson Zhao)

 * api-server: add jshint to devDependencies (Miroslav Bajtoš)


2014-10-07, Version 3.4.2
=========================

 * Workspace: do not forward HOST and PORT to child (Miroslav Bajtoš)


2014-10-02, Version 3.4.1
=========================

 * fixup! move wait-till-listening to regular deps (Miroslav Bajtoš)

 * squash! use unique port for start/stop tests (Miroslav Bajtoš)

 * fixup! fetch host:port before spawn, fix tests (Miroslav Bajtoš)

 * Add contribution guidelines (Ryan Graham)

 * Workspace: use waitTillListening in start() (Miroslav Bajtoš)


2014-10-01, Version 3.4.0
=========================

 * fixup! implement isRunning, fix remoting data (Miroslav Bajtoš)

 * Workspace: implement start/stop/restart (Miroslav Bajtoš)


2014-09-29, Version 3.3.4
=========================

 * Bump version (Raymond Feng)

 * Use discoverSchema for the case where options.schema is not present (Raymond Feng)

 * createModel should use the dataSource.name for model config (Ritchie Martori)

 * Fix connector default schema setting (Raymond Feng)


2014-09-25, Version 3.3.2
=========================

 * Bump version (Raymond Feng)

 * Fix the types for scopes/indexes (Raymond Feng)

 * Improve compatibility of end-to-end tests (Ryan Graham)

 * Bump ncp dependency to 1.0.0 (Ryan Graham)


2014-09-24, Version 3.3.1
=========================

 * test: enable mysql tests on Jenkins (Ryan Graham)

 * Collect stderr from child instead of self (Ryan Graham)


2014-09-19, Version 3.3.0
=========================

 * Expose `ModelProperty.availableTypes` via REST (Miroslav Bajtoš)

 * Add `any` to the list of property types (Miroslav Bajtoš)

 * Fix acl properties (Ritchie Martori)

 * Rename `ModelConfig.dataSource` to `dataSourceRef` (Miroslav Bajtoš)

 * Rework datasource invoke crash test (Ritchie Martori)

 * Ensure ACLs are ordered and have unique IDs (Ritchie Martori)

 * Add remoting for ds.createModel (Ritchie Martori)

 * Cleanup duplicate code in e2e tests... Also add uncaughtException handling in datasource-invoke. (Ritchie Martori)

 * Add dataSourceDef.createModel (Ritchie Martori)

 * Use invokeInWorkspace for discover methods (Ritchie Martori)

 * Refactor datasource-invoke to use Process#send() (Ritchie Martori)


2014-09-05, Version 3.2.0
=========================

 * Bump version (Raymond Feng)

 * available-connectors: describe connector settings (Miroslav Bajtoš)

 * available-connectors: add Email connector (Miroslav Bajtoš)

 * available-connectors: add "features" info (Miroslav Bajtoš)

 * Add a queue for facet load/save (Raymond Feng)

 * available-connectors: add npm package info (Miroslav Bajtoš)

 * Dedupe files to be saved (Raymond Feng)

 * Add model.js script generation (Ritchie Martori)

 * Make sure the result is passed to callback (Raymond Feng)

 * Report `ping` errors as HTTP 200 (Miroslav Bajtoš)

 * Fix the grunt file (Raymond Feng)

 * datasource-invoke: handle sync errors (Miroslav Bajtoš)

 * testConnection: fix a typo in error message (Miroslav Bajtoš)

 * test: isolate `testConnection` tests (Miroslav Bajtoš)

 * Update minimum juggler version to v2.7.0 (Miroslav Bajtoš)

 * testConnection: use ping, run in workspace app (Miroslav Bajtoš)

 * Bump up minimum required version of juggler (Miroslav Bajtoš)

 * Clean up dependencies (Raymond Feng)

 * Preserve property order in models.json (Miroslav Bajtoš)

 * test: skip tests using MySQL on Jenkins CI (Miroslav Bajtoš)

 * connector: pass correct arguments to save cb (Miroslav Bajtoš)

 * Implement autoupdate/automigrate (Miroslav Bajtoš)

 * DataSourceDefinition: prevent double callback (Miroslav Bajtoš)

 * Definition: fix loadToCache to return `id` (Miroslav Bajtoš)

 * Add public property to model config definition (Ritchie Martori)

 * Add name validations (Miroslav Bajtoš)

 * WorkspaceEntity.getFromCache: improve error msg (Miroslav Bajtoš)

 * Definition.addToCache: remove related models (Miroslav Bajtoš)

 * facet: use a static version of getUniqueId (Miroslav Bajtoš)

 * test: increase timeout for `npm install` (Miroslav Bajtoš)

 * models: make PackageDefinition public (Miroslav Bajtoš)

 * DataSourceDefinition: fix remoting metadata (Miroslav Bajtoš)

 * package: update fs-extra (Miroslav Bajtoš)

 * DataSourceDefinition: handle unknown connector (Miroslav Bajtoš)

 * Fix removing models not removing from the file system (Ritchie Martori)

 * Add test for creating datasources over REST (Ritchie Martori)

 * Fix the comment (Raymond Feng)

 * Fix typo (Raymond Feng)

 * Add custom remote method definitions (Ritchie Martori)


2014-07-24, Version 3.1.0
=========================

 * api-server template: add dot files (Miroslav Bajtoš)


2014-07-22, Version 3.0.0
=========================

 * Update versions (Raymond Feng)

 * package: update dependencies (Miroslav Bajtoš)

 * Upgrade runtime to loopback 2.0. (Miroslav Bajtoš)

 * Fix the dep order (Raymond Feng)

 * Add a test for favicon (Raymond Feng)

 * Add url param to print out the link for both unix and windows (Raymond Feng)

 * Fix a typo to the callback function (Raymond Feng)

 * Add `baseModel` to connector metadata (Miroslav Bajtoš)

 * Fix base dir for glob paths (Raymond Feng)

 * Add favicon to avoid url-not-found warnings (Raymond Feng)

 * Fix the default host and port (Raymond Feng)

 * 3.0.0-beta3 (Ritchie Martori)

 * Allow modelProperty.type to be any value instead of object (Ritchie Martori)


2014-07-17, Version 3.0.0-beta2
===============================

 * 3.0.0-beta2 (Miroslav Bajtoš)

 * ModelProperty: support `['string']` type (Miroslav Bajtoš)


2014-07-17, Version 3.0.0-beta1
===============================

 * 3.0.0-beta1 (Miroslav Bajtoš)

 * ModelAccessControl: remove values not implemented (Miroslav Bajtoš)

 * ModelRelation: add `hasOne` type, name/value API (Miroslav Bajtoš)

 * Omit `id` from the package.json file (Miroslav Bajtoš)

 * Move method-override from dev to dependencies (Miroslav Bajtoš)

 * Use the package 'method-override' (Miroslav Bajtoš)

 * Fix issues discovered during review (Miroslav Bajtoš)

 * Refactor `config.json` into FacetSetting (Miroslav Bajtoš)

 * Remove PackageDefinition from Facet (Miroslav Bajtoš)

 * Rework templates and model definitions (Miroslav Bajtoš)

 * Rename ComponentModel to ModelConfig (Miroslav Bajtoš)

 * Rename ComponentDefinition to Facet. (Miroslav Bajtoš)

 * templates: use loopback-boot 2.0.0-beta2 (Miroslav Bajtoš)

 * templates: fixate loopback-boot version (Miroslav Bajtoš)

 * Rename "models.json" to "model-config.json" (Miroslav Bajtoš)

 * templates: merge "rest" into "server" (Miroslav Bajtoš)

 * Fix order of keys in JSON files (Miroslav Bajtoš)

 * package: add repository and license (Miroslav Bajtoš)

 * test: use strong-cached-install in e2e tests (Miroslav Bajtoš)

 * connector: synchronize reads and writes (Miroslav Bajtoš)

 * Support `_meta.sources` in `models.json` (Miroslav Bajtoš)

 * ModelDefinition: drop `dataSource`, add `base` (Miroslav Bajtoš)

 * ModelDefinition: include custom options (Miroslav Bajtoš)

 * ModelRelation: fix relations and serialization (Miroslav Bajtoš)

 * Add ModelProperty.isId (Miroslav Bajtoš)

 * Refactor getUniqueId into a static method (Ritchie Martori)

 * Ensure component models are saved to the correct component (Ritchie Martori)

 * Refactor id creation to use belongsTo foreign key (Ritchie Martori)

 * Add componentName to correct models and mark required (Ritchie Martori)

 * Fix embed identifiers (Ritchie Martori)

 * Add unique id base methods (Ritchie Martori)

 * api-server: add `/` route (Miroslav Bajtoš)

 * Simplify templates - use `app.get('url')` (Miroslav Bajtoš)

 * test: Increase `npm install` timeout (Miroslav Bajtoš)

 * test/end-to-end: implement caching of npm packages (Miroslav Bajtoš)

 * test: implement end-to-end tests (Miroslav Bajtoš)

 * Implement a hook for custom of `cp -r` (Miroslav Bajtoš)

 * Implement Workspace.isValidDir (Miroslav Bajtoš)

 * Mark all `componentName` properties as required. (Miroslav Bajtoš)

 * templates: clean up + upgrade to loopback-boot 2.0 (Miroslav Bajtoš)

 * Omit json config files in the root component (Miroslav Bajtoš)

 * Move restApiRoot from api-server to server (Miroslav Bajtoš)

 * Fix serialization of component models (Miroslav Bajtoš)

 * Fix `name` in the root `package.json` (Miroslav Bajtoš)

 * Omit extra properties from json files (Miroslav Bajtoš)

 * Revert exec support (Ritchie Martori)

 * Implement the discovery API (Ritchie Martori)

 * Add exec support to components (Ritchie Martori)

 * Move TODOs to github (Ritchie Martori)

 * Only clear the loader once loadFromFile is complete (Ritchie Martori)

 * Use correct name for model definition name testing (Ritchie Martori)

 * Fix deserialization of embedded key-value maps (Miroslav Bajtoš)

 * ModelAccessControl: rename 'method' to 'property' (Miroslav Bajtoš)

 * connector: fix race condition in loadFromFile (Miroslav Bajtoš)

 * Fix serialization of Model ACLs. (Miroslav Bajtoš)

 * ModelAccessControl: improve metadata providers (Miroslav Bajtoš)

 * ModelProperty: implement `availableTypes` (Miroslav Bajtoš)

 * Workspace: implement `listAvailableConnectors` (Miroslav Bajtoš)

 * ModelDefinition: include `name` in the json file (Miroslav Bajtoš)

 * package: add mocha as dev-dep and test script (Miroslav Bajtoš)

 * Prevent the cache from being destroyed from loading from the fs in parallel (Ritchie Martori)

 * Refactor ModelDefinition into ComponentModel (Ritchie Martori)

 * WIP Add component template support (Ritchie Martori)

 * Rename AppDefinition => ComponentDefinition (Ritchie Martori)

 * Fix caching embeded data (Ritchie Martori)

 * Fix model property embedding (Ritchie Martori)

 * Add model definition tests (Ritchie Martori)

 * Add grunt dev deps (Ritchie Martori)

 * Fix workspace package name (Ritchie Martori)

 * Remove stray console.log (Ritchie Martori)

 * Add gruntfile and tasks for loopback-angular client (Ritchie Martori)

 * Initial working persistence (Ritchie Martori)

 * Create connector patches for file sync (Ritchie Martori)

 * Initial ConfigFile impl (Ritchie Martori)

 * Rework persistence using change event (Ritchie Martori)

 * Rework persistence into new DefinitionFile class (Ritchie Martori)

 * Connector WIP (Ritchie Martori)

 * Start Connector Impl (Ritchie Martori)

 * Initial 3.0 refactor (Ritchie Martori)


2014-07-16, Version 2.6.0
=========================

 * Upgrade to loopback@1.10.0 (Raymond Feng)


2014-07-01, Version 2.5.2
=========================

 * Bump version (Raymond Feng)

 * Fix the test case (Raymond Feng)

 * Update datasources to reflect new push component. (Dave Bryand)


2014-07-01, Version 2.5.1
=========================

 * Update deps (Raymond Feng)


2014-06-25, Version 2.5.0
=========================

 * Update deps (Raymond Feng)

 * Replace bodyParser with json & urlencoded (Raymond Feng)

 * acl-definition: use loopback.ACL as the base (Miroslav Bajtoš)

 * Implement AclDefinition model. (Miroslav Bajtoš)

 * PropertyDefinition: implement `availableTypes` (Miroslav Bajtoš)

 * Project: implement `listAvailableConnectors` (Miroslav Bajtoš)

 * test: remove unneeded db cleanup (Miroslav Bajtoš)

 * Fix datasource config to remove stderr logs (Miroslav Bajtoš)

 * Implement ModelPropertyDefinition model. (Miroslav Bajtoš)

 * Remove the uniqueness constraint from Project name (Miroslav Bajtoš)

 * Fix Project.fromConfig to save the object created (Miroslav Bajtoš)

 * fix typo in jsdoc type annotation (Miroslav Bajtoš)

 * Use app.boot() to setup models. (Miroslav Bajtoš)

 * Fix validations of name uniqueness (Miroslav Bajtoš)

 * integration.test: fix failing test (Miroslav Bajtoš)

 * Project: toConfig() must not use stale relations (Miroslav Bajtoš)

 * datasource: validate uniqueness of name (Miroslav Bajtoš)

 * Define more schema properties (Miroslav Bajtoš)

 * Project: support custom fs.writeFile (Miroslav Bajtoš)

 * Project: support custom name in createFromTemplate (Miroslav Bajtoš)


2014-02-23, Version 2.4.0
=========================

 * Bump version and update to loopback 1.7.0 (Raymond Feng)

 * Update to MIT/StrongLoop dual license (Raymond Feng)


2014-02-17, Version 2.3.1
=========================

 * Update loopback dep (Raymond Feng)

 * Upgrade juggler (Raymond Feng)

 * Fix the id type (Raymond Feng)

 * Update loopback version range (Raymond Feng)

 * Update dependencies (Raymond Feng)


2014-01-27, Version 2.3.0
=========================

 * Bump version (Raymond Feng)

 * Remove strong-agent and strong-cluster-control (Sam Roberts)


2014-01-23, Version 2.2.1
=========================

 * Expose ACL related models to models.json (Raymond Feng)

 * Generate files with consistent whitespace (Sam Roberts)


2014-01-14, Version 2.2.0
=========================

 * Update dep to push (Raymond Feng)

 * Bump versions (Raymond Feng)

 * Add base model (Raymond Feng)

 * Add data source test (Raymond Feng)

 * Add integration tests for push REST apis (Raymond Feng)

 * Add loopback-push-notification as dep (Raymond Feng)

 * Customize the endpoint for push (Raymond Feng)

 * initial push models template updates (Ritchie Martori)

 * Refactor explorer integration, add "started" event (Miroslav Bajtoš)

 * app.start() calls app.listen() (Miroslav Bajtoš)

 * Bump up deps versions (Miroslav Bajtoš)

 * Remove loopback-explorer's basePath option (Miroslav Bajtoš)

 * Mount REST API at app.get('restApiRoot') (Miroslav Bajtoš)

 * Allow app to be runnable within a supervisor (Sam Roberts)

 * Add missing token middleware (Ritchie Martori)


2013-12-20, Version 2.1.2
=========================

 * cookieParser requires a string argument. (Chris S)


2013-12-18, Version 2.1.1
=========================

 * Bump LoopBack version to 1.4.x (Ritchie Martori)

 * Add missing middleware and cookieSecret (Ritchie Martori)


2013-12-17, Version 2.1.0
=========================

 * Add loopback-datasource-juggler as devDependency (Ryan Graham)

 * Fix loopback-explorer and swagger setup. (Miroslav Bajtos)

 * test: fix typo (Miroslav Bajtos)

 * Remove extraneous middleware (Ritchie Martori)

 * Bump version (Ritchie Martori)

 * add app.enableAuth() to enable auth / access control (Ritchie Martori)


2013-12-06, Version 2.0.3
=========================

 * Bump version (Ritchie Martori)

 * Fix config.name => package.name mapping (Ritchie Martori)

 * Add missing host parameter to app.listen() (Ritchie Martori)

 * Add project.addPermission() (Ritchie Martori)


2013-12-03, Version v2.0.2
==========================



2013-12-03, Version 2.0.2
=========================

 * Fix missing options and properties from models (Ritchie Martori)

 * Fix the logger as 'development' is not a valid format (Raymond Feng)

 * test: Redirect stdout logs to stderr (Miroslav Bajtos)

 * Mount REST API at `/api` (Miroslav Bajtos)

 * Fix empty swagger descriptor (Miroslav Bajtos)

 * Add .jshintignore (Miroslav Bajtos)

 * Add jshint configuration. (Miroslav Bajtos)

 * Unskip mobile smoke test (Ritchie Martori)

 * Fix autoWiring assertion errors (Ritchie Martori)

 * AccessToken compatibility updates for lb@1.3.0 (Ritchie Martori)

 * Minor app template updates (Ritchie Martori)

 * Use the configured error handler for unknown urls (Miroslav Bajtos)

 * Remove blanket and bump version (Raymond Feng)

 * Update loopback dep version (Ritchie Martori)

 * Update mobile template (Ritchie Martori)

 * Add getModel / getDataSourceByName (Ritchie Martori)

 * Move pacakge to template file, Upgrade temp dependency (Ritchie Martori)

 * Add new loopback-explorer (Ritchie Martori)

 * Update session relationship template (Ritchie Martori)

 * Bump verison (Ritchie Martori)

 * Initial 2.0 rewrite (Ritchie)

 * Add repo to package.json (Raymond Feng)

 * Update dependencies (Raymond Feng)

 * Update deps for sls-1.1 (Raymond Feng)

 * bump version (Ritchie Martori)

 * Update app template, model template, and project api (Ritchie Martori)

 * Use hostname instead of ip (Raymond Feng)

 * Make listener port/ip configurable (Raymond Feng)

 * Add redirect from /explorer to /explorer/. (Michael Schoonmaker)

 * Add docs module. (Michael Schoonmaker)

 * Upgrade to 0.2.15 (Raymond Feng)

 * Add keywords to package.json (Raymond Feng)

 * Finalize package.json for sls-1.0.0 (Raymond Feng)

 * Add strong-agent and strong-cluster-control as optional deps (Raymond Feng)

 * Add informational GET / route. (Michael Schoonmaker)

 * Improve startup messages. (Michael Schoonmaker)


2013-09-17, Version strongloopsuite-1.0.0-5
===========================================

 * Fix the loopback dependency to be a version for the release (Raymond Feng)


2013-09-12, Version strongloopsuite-1.0.0-4
===========================================

 * Add redirect from /explorer to /explorer/. (Michael Schoonmaker)

 * Add docs module. (Michael Schoonmaker)

 * Upgrade to 0.2.15 (Raymond Feng)


2013-09-11, Version strongloopsuite-1.0.0-3
===========================================

 * Add informational GET / route. (Michael Schoonmaker)

 * Improve startup messages. (Michael Schoonmaker)

 * Add keywords to package.json (Raymond Feng)


2013-09-10, Version strongloopsuite-1.0.0-2
===========================================

 * Upgrade to with strong-agent 0.2.11 (Raymond Feng)

 * Finalize package.json for sls-1.0.0 (Raymond Feng)

 * Changed tag to strongloopsuite-1.0.0-2 (cgole)


2013-09-09, Version strongloopsuite-1.0.0-1
===========================================

 * Add strong-agent and strong-cluster-control as optional deps (Raymond Feng)


2013-09-05, Version strongloopsuite-1.0.0-0
===========================================

 * Updated to use tagged version strongloopsuite-1.0.0-0 of dependencies (cgole)


2013-09-04, Version 1.2.0
=========================

 * First release!
