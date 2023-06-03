# app-runner-my-media-api

## Create ECR private repository via ECR console

## Log in to AWS ECR

```
aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <USER_ID>.dkr.ecr.<REGION>.amazonaws.com
```

## Create docker image

```
docker image build . -t my-media-api
```

## Append tag

```
docker tag my-media-api:latest <USER_ID>.dkr.ecr.<REGION>.amazonaws.com/my-media-api:latest
```

## Push image to ECR private repository

```
docker push <USER_ID>.dkr.ecr.<REGION>.amazonaws.com/my-media-api:latest
```

## Create IAM role for App Runner service

## Create App Runner service with the ECR private repository setup above

## Do testing

## Clean up
