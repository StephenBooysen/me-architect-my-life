# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build the React renderer
RUN npm run build:renderer

# Create data directory for SQLite database with proper permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Expose port 4000 (as configured)
EXPOSE 4000

# Start the web application
CMD ["npm", "run", "start:web"]