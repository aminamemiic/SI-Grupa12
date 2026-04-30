FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Build the application
RUN npm run build

# Install http-server to serve the static files
RUN npm install -g http-server

# The port Railway uses
EXPOSE 4200

# Serve the 'browser' folder which contains the compiled Angular app
CMD ["http-server", "dist/TIM12Frontend/browser", "-p", "4200", "--host", "0.0.0.0"]
