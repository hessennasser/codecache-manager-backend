#!/bin/bash

# Stop and remove existing containers
docker-compose down

# Pull the latest changes from git
git pull origin main

# Build and start the containers in detached mode
docker-compose up --build -d

# Show the status of the containers
docker-compose ps

echo "Deployment completed successfully!"
