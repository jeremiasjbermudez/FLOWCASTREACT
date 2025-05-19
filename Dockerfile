# Use Node base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install

# Expose the port your app runs on
EXPOSE 4000

# Start your backend (adjust if needed)
CMD ["node", "server.js"]
