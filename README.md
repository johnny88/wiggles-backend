# Wiggles Backend

Right now the wiggles backend consists of firebase hooks. This could change to a more serverless approach in the future but for now this is alright.

# How to deploy

Deploying this natively can be a giant pain as firebase functions only support node version 8. This is why I included a docker container so we can easily work around this requirement. In order to deploy run the following commands:

```
docker-compose build
docker-compose run --rm cloud-functions /bin/bash -c "cd functions && yarn deploy"
```

```
docker build -t wiggles-backend-go:latest .
docker run -p 8080:8080 \
-v ~/.config/wiggles-service-account.json:/wiggles-service-account.json \
-e GOOGLE_APPLICATION_CREDENTIALS:/wiggles-service-account.json \
wiggles-backend-go
```
