#!/bin/bash

# Stop and remove existing containers
docker-compose down

# Pull the latest changes from git
git pull origin main

# Copy Nginx configuration if it doesn't exist
if [ ! -f /etc/nginx/sites-available/code-cache.conf ]; then
    sudo cp nginx/code-cache.conf /etc/nginx/sites-available/
    sudo ln -s /etc/nginx/sites-available/code-cache.conf /etc/nginx/sites-enabled/
fi

# Test Nginx configuration
sudo nginx -t

# If Nginx test passes, reload Nginx
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
else
    echo "Nginx configuration test failed!"
    exit 1
fi

# Build and start the containers in detached mode
docker-compose up --build -d

# Show the status of the containers
docker-compose ps

echo "Deployment completed successfully!"
