# loopback-example-bluemix

This is a sample application to demonstrate LoopBack integration with Bluemix as part of Cloud Native Developer Experience initiative.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/strongloop/loopback-example-bluemix)
[![Create Toolchain](https://console.ng.bluemix.net/devops/graphics/create_toolchain_button.png)](https://console.ng.bluemix.net/devops/setup/deploy/?repository=https://github.com/strongloop/loopback-example-bluemix)

# Integration points

## Data Sources from Bluemix services

- Cloudant
- DashDB
- Databases from Compose
- Object storage

## Connectors for Bluemix services

- Messaging
- Watson APIs
- ...

## Authentication with Bluemix

## Integration with OpenWhisk

## Delivery Pipeline

## Monitoring

## API Connect

- API management
- oAuth 2.0 auth

# Extension to loopback-cli

## Generate manifest files for Bluemix

- [manifest.yml](https://console.ng.bluemix.net/docs/manageapps/depapps.html#appmanifest):
```yaml
applications:
- path: .
  memory: 512M
  instances: 1
  domain: mybluemix.net
  name: loopback-example-bluemix
  host: loopback-example-bluemix
  disk_quota: 1024M
```

- .bluemix/pipeline.yaml


## Provision Bluemix services
## Publish to Bluemix

- cf push
- delivery pipeline (triggered by git push)
- deploy to bluemix button

## Run as a container

```bash
cf install-plugin https://static-ice.ng.bluemix.net/ibm-containers-mac
cf ic init
cf ic namespace get
cf ic build -t registry.ng.bluemix.net/rfeng .
cf ic images
```

# References

- https://console.ng.bluemix.net/docs/manageapps/mngapps.html#manageapps
- https://github.com/ibm-bluemix-mobile-services/bluemix-generator
- https://console.ng.bluemix.net/docs/containers/container_cfapp_tutorial_intro.html
- https://github.com/Puquios/hello-containers
- https://github.com/IBM-Bluemix/bluechatter
- https://github.com/open-toolchain/toolchain-demo
