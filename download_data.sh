#!/bin/bash

# Define the directory where you want to save the JSON files
BACKUP_DIR="/home/crmadmin/posspole/json_backup"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# MongoDB URI
MONGO_URI="mongodb+srv://doadmin:0w5Bh26oH43E7cX1@db-mongodb-blr1-64234-171b1e0b.mongo.ondigitalocean.com/admin"

# Collections to export
collections=(
  "admins"
  "businessproposals"
  "channelpartners"
  "clients"
  "customers"
  "domainexperts"
  "faceImages.chunks"
  "faceImages.files"
  "investors"
  "manufacturers"
  "moms"
  "schedulemeetings"
  "serviceproviders"
  "syndicateclients"
  "syndicates"
  "visits"
)

# Export each collection in JSON format
for collection in "${collections[@]}"; do
  echo "Exporting $collection..."
  mongoexport --uri="$MONGO_URI" --collection="$collection" --out="$BACKUP_DIR/$collection.json" --jsonArray
done

echo "Export completed. All collections saved to $BACKUP_DIR."
