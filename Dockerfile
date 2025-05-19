FROM node:20

# Set working directory
WORKDIR /app

# Copy files and install deps
COPY . .
RUN npm install

# Build React frontend
RUN npm run build

# Expose app port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
