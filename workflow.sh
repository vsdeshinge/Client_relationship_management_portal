#!/bin/bash

# Sync local files to the remote server
rsync -avz --exclude 'node_modules' /mnt/d/github/Client_relationship_management_portal/ crmadmin@139.59.73.56:posspole

# SSH into the remote server and restart the Docker container
ssh crmadmin@139.59.73.56 << 'ENDSSH'
  cd posspole  # Ensure you are in the correct directory

  # Stop and remove old containers
  docker-compose down

  # Build and run the Docker container with the latest updates, and keep it running
  docker-compose up -d --build

  # Check container logs and health status
  docker ps
ENDSSH
