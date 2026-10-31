FROM serversideup/php:8.3-fpm-nginx AS vendor

WORKDIR /var/www/html
COPY --chown=www-data:www-data composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction
COPY --chown=www-data:www-data . .
RUN composer dump-autoload --optimize --no-dev --no-interaction

FROM serversideup/php:8.3-fpm-nginx

ENV AUTORUN_ENABLED=true \
    AUTORUN_LARAVEL_MIGRATION=true \
    PHP_OPCACHE_ENABLE=1

COPY --chown=www-data:www-data --from=vendor /var/www/html /var/www/html
