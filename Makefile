DOCKER_COMPOSE = docker compose
PHP_CONT = symfony_php
NODE_CONT = symfony_frontend

.PHONY: setup build up down sh-php sh-node init

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

init:
	# Initialize Symfony if directory is empty
	@if [ ! -d "backend" ] || [ ! -f "backend/composer.json" ]; then \
		mkdir -p backend; \
		$(DOCKER_COMPOSE) run --rm php composer create-project symfony/skeleton:^7.0 . --no-interaction; \
		$(DOCKER_COMPOSE) run --rm php composer require webapp --no-interaction; \
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
