#!/bin/bash

# Remote server details
REMOTE_USER="crmadmin"
REMOTE_HOST="139.59.73.56"
REMOTE_PATH="/tmp/clients.json"  # Temporary file path on the server

# Local storage path
LOCAL_STORAGE_PATH="/mnt/d/posspole/clients.json" # WSL path for Windows drive D:\posspole

# MongoDB connection details
MONGO_URI="mongodb+srv://shakthi:shakthi@shakthi.xuq11g4.mongodb.net/admin"

# Command to run on the remote server
REMOTE_COMMAND=$(cat <<'EOF'
mongosh "mongodb+srv://shakthi:shakthi@shakthi.xuq11g4.mongodb.net/admin" --quiet <<MONGO_SCRIPT
use admin;
printjson(db.clients.find({}, { name: 1, companyName: 1, email: 1, _id: 0 }).toArray());
MONGO_SCRIPT
EOF
)

# Execute the query on the remote server and redirect output to a JSON file
ssh $REMOTE_USER@$REMOTE_HOST "echo '$REMOTE_COMMAND' | bash > $REMOTE_PATH"

# Copy the JSON file from the server to the local storage path
scp $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH $LOCAL_STORAGE_PATH

# Confirm the operation
if [ $? -eq 0 ]; then
  echo "Client data saved to $LOCAL_STORAGE_PATH successfully."
else
  echo "Failed to fetch and save client data."
fi
