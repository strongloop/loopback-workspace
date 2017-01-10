Feature: Users should be able to create middleware configurations
  As a workspace client using the EXAMPLE workspace
  I want to create configurations in my workspace

  Background: Workspace is loaded in a given directory

  Scenario: create a middleware function
    Given The workspace has a 'initial' phase
    When I create a middleware 'ErrorHandler' 
    And with middleware function '/middleware/log-error' for paths '/Customer'
    Then The middleware config is created

  Scenario: find a middleware method
    When I query for the middleware method 'initial./middleware/log-error'
    Then The middleware config for the method is returned
