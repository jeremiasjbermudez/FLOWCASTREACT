# Use Node base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install server dependencies
RUN npm install

# Expose app port (adjust if needed)
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]
