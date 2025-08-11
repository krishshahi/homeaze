# Use Node.js LTS version with Alpine for smaller image size
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies and security updates
RUN apk update && apk upgrade && \
    apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S homeaze -u 1001

# Development stage
FROM base AS development

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci --only=production=false && \
    npm cache clean --force

# Copy source code
COPY . .

# Change ownership to non-root user
RUN chown -R homeaze:nodejs /app
USER homeaze

# Expose port
EXPOSE 5000

# Development command with hot reload
CMD ["npm", "run", "dev"]

# Production dependencies stage
FROM base AS deps

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf ~/.npm

# Production build stage
FROM base AS build

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Remove development dependencies
RUN npm prune --production

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S homeaze -u 1001

# Copy production dependencies
COPY --from=deps --chown=homeaze:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=homeaze:nodejs . .

# Create directories for uploads and logs
RUN mkdir -p uploads logs && \
    chown -R homeaze:nodejs uploads logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Switch to non-root user
USER homeaze

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Expose port
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/server.js"]
