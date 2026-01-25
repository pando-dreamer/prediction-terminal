FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY apps/frontend/package*.json ./
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/frontend/src ./src
COPY apps/frontend/public ./public
COPY apps/frontend/tsconfig.json ./
COPY apps/frontend/tailwind.config.js ./

EXPOSE 3000

CMD ["npm", "start"]