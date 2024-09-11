#!/bin/bash

# Sync local files to the remote server
rsync -avz --exclude 'node_modules' /mnt/d/github/Client_relationship_management_portal/ crmadmin@139.59.73.56:posspole

# SSH into the remote server and restart the Docker container
ssh crmadmin@139.59.73.56 << 'ENDSSH'
  cd posspole  # Ensure you are in the correct directory

  # Stop all running containers
  docker stop $(docker ps -aq)

  # Remove all containers
  docker rm $(docker ps -aq)

  # Remove all images
  docker rmi $(docker images -q)

  # Build and run the Docker container with the latest updates, and keep it running
  docker-compose -f docker-compose.yml up -d --build

  # Sleep indefinitely to prevent the container from exiting automatically
  docker exec -d $(docker ps -q) sh -c "while true; do sleep 1000; done"
ENDSSH
