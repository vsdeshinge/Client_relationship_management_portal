#!/bin/bash

# SSH into the remote server and delete the existing create_syndicate.js file
ssh crmadmin@139.59.73.56 << 'ENDSSH'
  cd posspole  # Navigate to the correct directory
  
  # Remove the old create_syndicate.js file
  rm -f create_syndicate.js
  
ENDSSH

# Sync the updated create_syndicate.js file to the remote server
rsync -avz /mnt/d/github/Client_relationship_management_portal/create_syndicate.js crmadmin@139.59.73.56:posspole

# SSH into the remote server and run the updated create_syndicate.js script
ssh crmadmin@139.59.73.56 << 'ENDSSH'
  cd posspole  # Navigate to the correct directory

  # Run the updated create_syndicate.js file with Node.js
  node create_syndicate.js

ENDSSH
