FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Build the application
RUN npm run build

# Install http-server to serve the static files
RUN npm install -g http-server

# Railway dynamically assigns PORT via env variable
EXPOSE ${PORT:-4200}

# Serve the 'browser' folder - use Railway's PORT env var, fallback to 4200
# -a 0.0.0.0 binds to all interfaces (Railway requires this)
CMD ["sh", "-c", "http-server dist/TIM12Frontend/browser -p ${PORT:-4200} -a 0.0.0.0"]
