Feature: Users should be able to create workspace from templates 
  Users can create a specification of a workspace in a template json file
  and create the workspace using the template

  Background: Workspace is empty

  Scenario: Create a empty-server workspace
    Given that the templates are loaded
    When I create a workspace from the template 'empty-server'
    Then the workspace is created

  Scenario: Create a api-server workspace
    When I create a workspace from the template 'api-server'
    Then the workspace is created

  Scenario: Create a hello-world workspace
    When I create a workspace from the template 'hello-world'
    Then the workspace is created

  Scenario: Load empty-server workspace
    When I load the 'empty-server' workspace from the sandbox directory
    Then the workspace is loaded with datasources
    And the workspace is loaded with middleware

  Scenario: Load api-server workspace
    When I load the 'api-server' workspace from the sandbox directory
    Then the workspace is loaded with datasources
    And the workspace is loaded with middleware

  Scenario: Load hello-world workspace
    When I load the 'hello-world' workspace from the sandbox directory
    Then the workspace is loaded with datasources
