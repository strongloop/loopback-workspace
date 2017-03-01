Feature: Users should be able to create an empty workspace 
  as well as create and find artifacts in the workspace

  Background: Workspace is loaded in a given directory

  Scenario: Create a model
    Given that I have loaded the workspace 'empty-server'
    When I create model 'TestModel'
    Then the model definition is created

  Scenario: Query a DataSource
    When I query for datasource 'db' from workspace 'empty-server'
    Then the datasource definition is returned

  Scenario: Find a middleware method
    When I query for the middleware method 'initial:compression' in the workspace 'empty-server'
    Then The middleware config for the method is returned

  Scenario: Add model config to facet
    Given that the model 'TestModel' exists in workspace 'empty-server'
    When I create a model config in facet 'server'
    Then the model configuration is created

  Scenario: Add a property to the model
    When I add property 'property1' of type 'string' for model 'TestModel' in workspace 'empty-server'
    Then the model property is created

  Scenario: Query the created model
    When I query for the model 'TestModel' in workspace 'empty-server'
    Then the model definition is returned

  Scenario: Query the created model config
    When I query for the model config 'TestModel' in workspace 'empty-server'
    Then the model config is returned

  Scenario: create a facet
    When I create a facet 'client' in workspace 'empty-server'
    Then the facet is created
