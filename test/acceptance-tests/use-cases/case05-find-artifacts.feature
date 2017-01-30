Feature: Users should be able to query workspace artifacts 
  As a workspace client using the EXAMPLE workspace
  I want to view the artifacts in my workspace

  Background: Workspace is loaded in a given directory

  Scenario: Query a DataSource
    When I query for datasource 'db'
    Then the datasource definition is returned
