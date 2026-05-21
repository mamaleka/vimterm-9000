# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with angie
FROM docker.angie.software/angie:latest AS production

COPY --from=builder /app/dist /usr/share/angie/html

# Custom angie config for SPA routing
COPY nginx.conf /etc/angie/http.d/default.conf

EXPOSE 80

CMD ["angie", "-g", "daemon off;"]
