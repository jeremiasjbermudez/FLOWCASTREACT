# Use the official PHP image with Apache
FROM php:8.2-apache

# Enable MySQL support
RUN docker-php-ext-install mysqli

# Copy everything to Apache's web root
COPY . /var/www/html/

# Set working directory
WORKDIR /var/www/html
