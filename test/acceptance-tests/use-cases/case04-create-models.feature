Feature: Users should be able to create models 
  As a workspace client using the EXAMPLE workspace
  I want to create a model in my workspace

  Background: Workspace is loaded in a given directory

  Scenario: Create a Facet
    Given that I have loaded the workspace
    When I create a facet 'client'
    Then the facet is created

  Scenario: Create a model
    Given that I have loaded the workspace
    When I create model 'Customer'
    Then the model definition is created

  Scenario: Add model config to facet
    Given that the model 'Customer' exists
    When I create a model config in facet 'server'
    Then the model configuration is created

  Scenario: Create a model
    Given that I have loaded the workspace
    When I create model 'Order'
    Then the model definition is created

  Scenario: Add model config to facet
    Given that the model 'Order' exists
    When I create a model config in facet 'server'
    Then the model configuration is created

  Scenario: Add a property to the model
    Given the model 'Customer' exists
    When I add property 'name' of type 'string'
    Then the model property is created

  Scenario: Add a custom method to the model
    Given I add model method 'addReview'
    When the method has an argument 'description' type 'string'
    And the method has a return parameter 'status' type 'string'
    And I call the model method api
    Then the model method is created

  Scenario: Add a relation to the model
    Given I add relation 'orders' from 'Customer' to 'Order' 
    When the relation is of type 'hasMany' and foreignKey 'customerId'
    Then the model relation is created

  Scenario: update model definition
    Given The model 'Order' exists
    When I change property 'plural' to 'orders' 
    And I change property 'strict' to 'false'
    Then The model definition json is updated

  Scenario: update model config
    When I change 'server' facet Model Config property 'public' to 'true' 
    Then The model config json is updated

  Scenario: query the created model
    When I query for the model 'Customer'
    Then the model definition is returned

  Scenario: query the created model config
    When I query for the model config 'Customer'
    Then the model config is returned