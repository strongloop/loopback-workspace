Feature: Users should be able to read a list of artifacts
  As a workspace client using the workspace js module
  I want to read a list of artifacts in my workspace
  So that I can reference the contents of my application by name

  Background: Workspace is loaded in a given directory

  Scenario: Get a list of models
    Given I have a workspace containing 3 models
    When I list models for the workspace
    Then All the model configs are returned
