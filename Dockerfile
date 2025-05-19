# Use Node base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# Expose your server port
EXPOSE 4000

# Start the Node server
CMD ["node", "server.js"]
