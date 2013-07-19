# Loopback Workspace

Each Workspace manages a directory of Loopback Projects for a user, team, or organization. Workspace can be used either
programmatically, or through a built-in REST interface.

## Running the REST server

After cloning the Workspace repository, run the following:

    node workspace --root `~/my-loopback-workspace`

Of course, this example assumes the repo is cloned at `./workspace`, and that the desired root directory for projects is
`~/my-loopback-workspace`. Please make any appropriate changes for your own use.

## Using Workspaces programmatically

TODO

## Extending the Workspace

New factories can be added to Workspace through the `factories` directory of. When a new Module is added to a Project,
the `type` parameter of the body is used to determine which factory to load, by name. For example, if there's a factory
named `app` installed, a new Module from the following body would use that factory:

```
{
  "name": "MyModule",
  "type": "app",
  "port": 5050
}
```

Each factory consists of a legal Node module that exports a Function. That Function should extend the `Factory`
interface that Workspace provides, extending `render()` and `dependencies()` as necessary. (Otherwise, that would be a
very body Factory, indeed.)
