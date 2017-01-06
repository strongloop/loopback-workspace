Feature: Users should be able to create models 
  As a workspace client using the EXAMPLE workspace
  I want to create a model in my workspace

  Background: Workspace is loaded in a given directory

  Scenario: Create a Facet
    Given that I have loaded the workspace
    When I create a facet 'server'
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

  Scenario: Add a property to the model
    Given the model 'Customer' exists
    When I add property 'name' of type 'string'
    Then the model property is created

  Scenario: Add a relation to the model
    Given I add relation 'orders' from 'Customer' to 'Order' 
    When the relation is of type 'hasMany' and foreignKey 'customerId'
    Then the model relation is created

