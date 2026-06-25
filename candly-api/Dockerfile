# ─────────────────────────────────────────────────────────
# Dockerfile for Candly API (Laravel 13 + PHP 8.3)
# ─────────────────────────────────────────────────────────

# Step 1 : Base Image
FROM php:8.4-fpm-alpine

# Step 2 : Install system dependencies and PHP extensions
RUN apk add --no-cache \
    bash \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
  && docker-php-ext-install \
    pdo \
    pdo_mysql \
    zip \
    gd \
    mbstring \
    bcmath

# Step 3 : Install Composer (PHP dependency manager)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Step 4 : Define the working directory
WORKDIR /var/www/html

# Step 5 : Copy the dependency files FIRST
COPY composer.json composer.lock ./

# Step 6 : Installer les dépendances PHP
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Step 7 : Copy the rest of the source code
COPY . .

# Step 8 : Generate the Laravel application key (if not already defined)
RUN php artisan key:generate --no-interaction

# Step 9 : Create the Laravel storage link (if not already defined)
RUN php artisan storage:link --no-interaction

# Step 10 : Set permissions on Laravel directories
RUN chown -R www-data:www-data \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache \
  && chmod -R 775 \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache

# Step 11 : Documenting the listening port
EXPOSE 8000

# Step 12 : Start command
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
