Feature: Users should be able to read a list of artifacts
  As a workspace client using the EXAMPLE workspace
  I want to read a list of artifacts in my workspace
  So that I can reference the contents of my application by name

  Background: Workspace is loaded in a given directory

  Scenario: Get a list of models
    Given I have a workspace containing 3 models
    When I list models for the workspace
    Then All the model configs are returned

  Scenario: find a model definition
    Given The model 'User' exists
    When I query for the model definition of 'User'
    Then The model definition of 'User' is returned

  Scenario: find a model property
    Given The model 'User' exists and the property 'role' exists
    When I query for the model property 'common.user.role'
    Then The model property config for 'common.user.role' is returned

  Scenario: find a model method
    Given The model 'User' exists and the method 'testMethod' exists
    When I query for the model method 'common.user.testMethod'
    Then The model method config for 'common.user.testMethod' is returned

  Scenario: find a model relation
    Given The model 'User' exists and the relation 'roles' exists
    When I query for the model relation 'common.user.roles'
    Then The model relation config for 'common.user.roles' is returned

  Scenario: get a list of access control list (ACL) for a model
    Given The model 'TestModel' exists and it has 3 ACL configurations
    When I list the model access controls for the model 'TestModel'
    Then All the acl configurations are returned

  Scenario: get a list of middleware phases
    Given The workspace has 6 middleware phases configured
    When I list the middlewares
    Then All the phases are returned

  Scenario: find a middleware method
    Given The 'initial' phase has a method './middleware/log-error' in the file '/server/middleware/log-error.js'
    When I query for the middleware method 'initial./middleware/log-error'
    Then The middleware config for the method is returned