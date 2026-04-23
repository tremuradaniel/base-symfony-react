SHELL := /bin/bash
DOCKER_COMPOSE = docker compose
PHP_CONT = symfony_php
NODE_CONT = symfony_frontend

.PHONY: setup build up down sh-php sh-node init migrations create-admin create-root-user create-user

setup: build init up

build:
	$(DOCKER_COMPOSE) build

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

sh-php:
	$(DOCKER_COMPOSE) exec php bash

sh-node:
	$(DOCKER_COMPOSE) exec frontend bash

migrations:
	$(DOCKER_COMPOSE) exec php bin/console doctrine:migrations:diff --no-interaction || true
	$(DOCKER_COMPOSE) exec php bin/console doctrine:migrations:migrate --no-interaction

create-admin: migrations
	@read -p "Enter Admin Email: " email; \
	read -p "Enter Admin Password: " password; \
	$(DOCKER_COMPOSE) exec php bin/console app:create-admin "$$email" "$$password"

create-root-user: migrations
	@read -p "Enter Root User Email: " email; \
	read -sp "Enter Root User Password: " password; echo; \
	$(DOCKER_COMPOSE) exec php bin/console app:create-admin "$$email" "$$password"

create-user: migrations
	@read -p "Enter User Email: " email; \
	read -sp "Enter User Password: " password; echo; \
	$(DOCKER_COMPOSE) exec php bin/console app:create-user "$$email" "$$password"

init:
	# Initialize Symfony if directory is empty
	@if [ ! -d "backend" ] || [ ! -f "backend/composer.json" ]; then \
		mkdir -p backend; \
		$(DOCKER_COMPOSE) run --rm php composer create-project symfony/skeleton:^7.0 . --no-interaction; \
		$(DOCKER_COMPOSE) run --rm php composer require webapp --no-interaction; \
	fi
	# Install Symfony dependencies
	$(DOCKER_COMPOSE) exec php composer install --working-dir=/var/www/html/backend
	# Generate JWT keys if missing
	@if [ ! -f "backend/config/jwt/private.pem" ]; then \
		$(DOCKER_COMPOSE) exec php sh -c "mkdir -p /var/www/html/backend/config/jwt && openssl genrsa -aes256 -passout pass:your_jwt_passphrase -out /var/www/html/backend/config/jwt/private.pem 4096 && openssl rsa -pubout -passin pass:your_jwt_passphrase -in /var/www/html/backend/config/jwt/private.pem -out /var/www/html/backend/config/jwt/public.pem"; \
	fi
	# Initialize React if directory is empty
	@if [ ! -d "frontend" ] || [ ! -f "frontend/package.json" ]; then \
		mkdir -p frontend; \
		$(DOCKER_COMPOSE) run --rm frontend npm create vite@latest . -- --template react --yes; \
		$(DOCKER_COMPOSE) run --rm frontend npm install; \
	fi
	$(MAKE) fix-permissions

clean:
	$(DOCKER_COMPOSE) down -v
	sudo rm -rf backend frontend

fix-permissions:
	sudo chown -R $$(id -u):$$(id -g) .
