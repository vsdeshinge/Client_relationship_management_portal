FROM node:16

# Create and change to the app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the app's source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Run the app
CMD [ "npm", "start" ]
