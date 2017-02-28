Feature: Users should be able to create middleware configurations
  As a workspace client using the EXAMPLE workspace
  I want to create configurations in my workspace

  Background: Workspace is loaded in a given directory

  Scenario: Create a middleware function
    Given The workspace 'api-server' has a 'initial' phase
    When I create a middleware 'ErrorHandler' 
    And with middleware function './middleware/log-error' for paths '/Customer'
    Then The middleware config is created

  Scenario: Find a middleware method
    When I query for the middleware method 'initial:./middleware/log-error' in the workspace 'api-server'
    Then The middleware config for the method is returned

  Scenario: Create a DataSource
    When I create datasource 'sampleRest' with connector 'rest' in workspace 'hello-world'
    Then the datasource definition is created

  Scenario: Update a DataSource
    When I update datasource 'db' with connector 'sqllite'
    Then the datasource configuration is updated

  Scenario: Create a model
    Given that I have loaded the workspace 'api-server'
    When I create model 'Customer'
    Then the model definition is created

  Scenario: Add model config to facet
    Given that the model 'Customer' exists in workspace 'api-server'
    When I create a model config in facet 'server'
    Then the model configuration is created

  Scenario: Add model config to facet
    Given that the model 'Message' exists in workspace 'hello-world'
    When I create a model config in facet 'server'
    Then the model configuration is created

  Scenario: Create a model
    Given that I have loaded the workspace 'api-server'
    When I create model 'Order'
    Then the model definition is created

  Scenario: Add model config to facet
    Given that the model 'Order' exists in workspace 'api-server'
    When I create a model config in facet 'server'
    Then the model configuration is created

  Scenario: Add a property to the model
    When I add property 'name' of type 'string' for model 'Customer' in workspace 'api-server'
    Then the model property is created

  Scenario: Add access control
    When I add acl to model 'Customer'
    Then the model acl is created

  Scenario: Add a custom method to the model
    Given I add model method 'addReview' to model 'Customer' in workspace 'api-server'
    When the method has an argument 'description' type 'string'
    And the method has a return parameter 'status' type 'string'
    And I call the model method api
    Then the model method is created

  Scenario: Add a relation to the model in workspace 'api-server'
    Given I add relation 'orders' from 'Customer' to 'Order' 
    When the relation is of type 'hasMany' and foreignKey 'customerId'
    Then the model relation is created

  Scenario: Update model definition
    Given the model 'Order' exists in workspace 'api-server'
    When I change property 'plural' to 'orders' 
    And I change property 'strict' to 'false'
    Then The model definition json is updated

  Scenario: Update model config
    When I change 'server' facet Model Config property 'public' to 'true' in workspace 'api-server' for model 'Order'
    Then The model config json is updated

  Scenario: Query the created model
    When I query for the model 'Customer' in workspace 'api-server'
    Then the model definition is returned

  Scenario: Query the created model
    When I query for the model 'Message' in workspace 'hello-world'
    Then the model definition is returned
