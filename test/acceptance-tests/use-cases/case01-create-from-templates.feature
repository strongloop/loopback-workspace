Feature: Users should be able to create workspace from templates 
  Users can create a specification of a workspace in a template json file
  and create the workspace using the template

  Background: Workspace is empty

  Scenario: Create a workspace
    Given that the templates are loaded
    When I create a workspace from the template 'api-server'
    Then the workspace is created
