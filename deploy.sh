#!/bin/bash
pip install --user awscli
export PATH=$PATH:$HOME/.local/bin
eval $(aws ecr get-login --region $AWS_REGION --no-include-email)
aws configure set default.region $AWS_REGION
docker tag lounasvahti:latest $ECR_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/lounasvahti:latest
docker push $ECR_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/lounasvahti:latest
aws ecs register-task-definition --family lounasvahti --cpu "256" --memory "512" --requires-compatibilities "FARGATE" --network-mode "awsvpc" --execution-role-arn ecsTaskExecutionRole --container-definitions "{\"image\":\"$ECR_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/lounasvahti:latest\",\"name\":\"lounasvahti\",\"environment\":[{\"name\":\"SLACK_API_TOKEN\",\"value\":\"$SLACK_API_TOKEN\"},{\"name\":\"SLACK_CHANNEL\",\"value\":\"$SLACK_CHANNEL\"},{\"name\":\"SLACK_USER\",\"value\":\"$SLACK_USER\"}],\"logConfiguration\":{\"logDriver\":\"awslogs\",\"options\":{\"awslogs-group\":\"/ecs/lounasvahti\",\"awslogs-region\":\"us-east-1\",\"awslogs-stream-prefix\":\"ecs\"}}}"
aws ecs update-service --cluster lounasvahti --service lounasvahti --task-definition lounasvahti --region $AWS_REGION
