# Stage 1 : Build React
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV PUBLIC_URL=/
RUN npm run build

# Stage 2 : Servir avec nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx config pour SPA (redirige toutes les routes vers index.html)
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
