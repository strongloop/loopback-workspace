Feature: Test the created Workspace
  
  Background: Workspace is created in a given directory

  Scenario: Boot the api-server workspace
     When I boot the 'api-server' workspace
     Then it provides status on the root url
     Then it provides status on the root url only
     Then it has favicon enabled
     Then it provides CORS headers for all URLs

  Scenario: Boot the hello-world workspace
     When I boot the 'hello-world' workspace
     Then it provides status on the root url
     Then it provides status on the root url only
     Then it has favicon enabled
     Then it provides CORS headers for all URLs
