FROM node:20

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install

# Expose the app port
EXPOSE 4000

# Start the backend
CMD ["node", "backend/server.js"]
