# LoopBack Workspace 3.0

**⚠️ LoopBack 3 is in Maintenance LTS mode, only critical bugs and critical
security fixes will be provided. (See
[Module Long Term Support Policy](#module-long-term-support-policy) below.)**

We urge all LoopBack 3 users to migrate their applications to LoopBack 4 as
soon as possible. Refer to our
[Migration Guide](https://loopback.io/doc/en/lb4/migration-overview.html)
for more information on how to upgrade.

## Overview

The `loopback-workspace` module provides node.js and REST APIs for interacting
with a set of loopback components. Components are organized in the following
basic directory structure:

```txt
  /my-workspace
    /my-component-a
    /my-component-b
    /my-component-c
    package.json
```

Each component has the following basic structure:

```txt
  /my-component
    config.json
    datasources.json
    model-config.json
    /models
      my-model.json
      my-model.js
```

## Usage

**Basic**

The `loopback-workspace` itself is a loopback component. The following
will load the workspace in the current working directory (`process.cwd()`).

```js
// workspace is a loopback `app` object
var workspace = require('loopback-workspace');
```

**Custom Workspace Directory**

To start the workspace in a specific directory, specify the `WORKSPACE_DIR` env
variable.

**REST**

In order to use the REST api, mount the app on an existing express app or call
`workspace.listen(PORT)`.

## Test

**To run end-to-end tests, you will need a local MySQL instance.**

Run `node test/helpers/setup-mysql.js` to create a test database and
a test user. This is a one-time task to run only once when setting up your
development environment.

Use the `npm test` command to run the tests.

## Module Long Term Support Policy

This module adopts the [Module Long Term Support (LTS)](http://github.com/CloudNativeJS/ModuleLTS) policy, with the following End Of Life (EOL) dates:

| Version | Status          | Published | EOL      |
| ------- | --------------- | --------- | -------- |
| 4.x     | Maintenance LTS | Sep 2017  | Dec 2020 |
| 3.x     | End-of-Life     | Jul 2014  | Apr 2019 |

Learn more about our LTS plan in the [docs](https://loopback.io/doc/en/contrib/Long-term-support.html).
