# Stage 1: Build Frontend Assets con Node 20
FROM node:20-alpine AS node_builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Monolito PHP 8.3 / Laravel 11 Runtime
FROM php:8.3-cli-alpine AS runtime

# Dependencias ligeras esenciales de ejecución
RUN apk update && apk add --no-cache curl bash

# Directorio de la aplicación
WORKDIR /var/www/html

# Copiar Composer desde la imagen oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copiar archivos fuente del proyecto
COPY . /var/www/html

# Copiar assets compilados desde el stage 1
COPY --from=node_builder /app/public/build /var/www/html/public/build

# Generar autoloader optimizado de Composer
RUN composer dump-autoload --optimize --no-dev 2>/dev/null || true

# Variables de entorno por defecto
ENV APP_ENV=production
ENV APP_PORT=8080
ENV PORT=8080

EXPOSE 8080

# Servidor embebido con router en public/index.php en puerto 8080
CMD ["php", "-S", "0.0.0.0:8080", "-t", "public", "public/index.php"]
