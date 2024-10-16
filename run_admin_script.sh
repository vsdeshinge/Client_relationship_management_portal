#!/bin/bash

# SSH into the remote server and delete the existing create_admin.js file
ssh crmadmin@139.59.73.56 << 'ENDSSH'
  cd posspole  # Navigate to the correct directory
  
  # Remove the old create_admin.js file
  rm -f create_admin.js
  
ENDSSH

# Sync the updated create_admin.js file to the remote server
rsync -avz /mnt/d/github/Client_relationship_management_portal/create_admin.js crmadmin@139.59.73.56:posspole

# SSH into the remote server and run the updated create_admin.js script
ssh crmadmin@139.59.73.56 << 'ENDSSH'
  cd posspole  # Navigate to the correct directory

  # Run the updated create_admin.js file with Node.js
  node create_admin.js

ENDSSH
