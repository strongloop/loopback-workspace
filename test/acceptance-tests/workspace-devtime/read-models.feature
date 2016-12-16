Feature: Users should be able to read a list of artifacts
  As a workspace client using the EXAMPLE workspace
  I want to read the contents of a model definition

  Background: Workspace is loaded in a given directory

  Scenario: find a model definition
    Given The model 'users' exists
    When I query for the model definition of 'users'
    Then The model definition is returned