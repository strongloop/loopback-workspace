Feature: Users should be able to create datasources 
  As a workspace client using the EXAMPLE workspace
  I want to create a DataSource in my workspace

  Background: Workspace is loaded in a given directory

  Scenario: Create a DataSource
    Given that I have a workspace created from a template
    When I create datasource 'db' with connector 'memory'
    Then the datasource definition is created
