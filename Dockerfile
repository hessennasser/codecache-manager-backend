FROM node:20.17.0

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy TypeScript config
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start:prod"]