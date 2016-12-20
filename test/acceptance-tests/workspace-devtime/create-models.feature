Feature: Users should be able to create models 
  As a workspace client using the EXAMPLE workspace
  I want to create a model in my workspace

  Background: Workspace is loaded in a given directory

  Scenario: Create a model
    Given that I have loaded the workspace
    When I create model 'Customer'
    Then the model definition json is created
    