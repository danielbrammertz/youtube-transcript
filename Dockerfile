FROM node:22.14.0-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and force node-fetch to a compatible version
RUN npm ci
RUN npm uninstall node-fetch
RUN npm install node-fetch@2.6.7 --save

# Copy project files
COPY . .

# Create a Node.js flag file to enable CommonJS compatibility with ESM modules
ENV NODE_OPTIONS="--experimental-modules --es-module-specifier-resolution=node"

# Build the project
RUN npm run build

# Expose the API port (default is 3000)
EXPOSE 3000

# Command to run the API server
CMD ["npm", "run", "start"] 