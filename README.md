# Perth Web meetup site

The aim of this site is to:
- introduce a meetup group
- advertise specific meetup events
- track RSVPs for events

## Running locally

You will need PHP and Composer installed. We support [Devbox](https://www.jetify.com/devbox/) for local development if you want to have the correct version of PHP and Composer installed.

To start developing:

    devbox services up

This will start a server at `http://localhost:8000`.

## Docker deployment

Build the image with `docker build -t perth-web-devs .`. It serves HTTP on
port 8080 and runs Laravel migrations automatically when the container starts.
Provide production configuration at runtime, including `APP_ENV=production`,
`APP_DEBUG=false`, `APP_KEY`, `APP_URL`, database settings, and mail settings.
Use the existing application key and database when moving an existing deployment.

If using SQLite, set `DB_CONNECTION=sqlite` and `DB_DATABASE` to an absolute
path on a persistent volume. Create or copy the database file there before
starting the container, and ensure the `www-data` user can write to both the
file and its directory. Persist any application files stored under `storage/`
as needed. Set `LOG_CHANNEL=stderr` to send Laravel logs to container logs.

## Commands

Run `php artisan meetup` to see available commands for this project.

## Laravel

This project uses [Laravel](https://laravel.com). You can read the Laravel project readme [here](./README-laravel.md).

It's my first time using Laravel. Feedback and advice welcome!
