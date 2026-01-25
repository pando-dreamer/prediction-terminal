FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY apps/backend/package*.json ./
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/backend/src ./src
COPY apps/backend/tsconfig*.json ./

# Build the application
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]