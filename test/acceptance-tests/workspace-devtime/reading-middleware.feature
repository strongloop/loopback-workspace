Feature: Users should be able to read middleware configurations
  As a workspace client using the EXAMPLE workspace
  I want to query all the middleware configurations in my workspace
  So that I can reference the middleware phases

  Background: Workspace is loaded in a given directory

  Scenario: get a list of middleware phases
    Given The workspace has 6 middleware phases configured
    When I list the middlewares
    Then All the phases are returned

  Scenario: find a middleware method
    Given The 'initial' phase has a method './middleware/log-error' in the file '/server/middleware/log-error.js'
    When I query for the middleware method 'initial./middleware/log-error'
    Then The middleware config for the method is returned