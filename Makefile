.PHONY: install update clean help test dusk dev stop-dev build migrate bash
.DEFAULT_GOAL   = help

include .env

PRIMARY_COLOR   		= \033[0;34m
PRIMARY_COLOR_BOLD   	= \033[1;34m

SUCCESS_COLOR   		= \033[0;32m
SUCCESS_COLOR_BOLD   	= \033[1;32m

DANGER_COLOR    		= \033[0;31m
DANGER_COLOR_BOLD    	= \033[1;31m

WARNING_COLOR   		= \033[0;33m
WARNING_COLOR_BOLD   	= \033[1;33m

NO_COLOR      			= \033[m

# For test
filter      ?= tests
dir         ?=

php := docker-compose run --rm php php
bash := docker-compose run --rm php bash
composer := docker-compose run --rm php composer
mariadb := docker-compose exec mariadb mysql -psecret -e
npm := docker-compose run --rm webpack_dev_server npm

node_modules: package.json
	@$(npm) install

vendor: composer.json
	@$(composer) install

install: vendor node_modules ## Install the composer dependencies and npm dependencies

update: ## Update the composer dependencies and npm dependencies
	@$(composer) update
	@$(npm) run update
	@$(npm) install

clean: ## Remove cache
	@echo "$(DANGER_COLOR)Removing Symfony cache...$(NO_COLOR)"
	@$(php) bin/console cache:pool:clear --quiet cache.app
	@echo "$(DANGER_COLOR)Removing billings PDF...$(NO_COLOR)"
	@rm -rf ./var/storage/billings/*

help: ## Display this help
	@awk 'BEGIN {FS = ":.*##"; } /^[a-zA-Z_-]+:.*?##/ { printf "$(PRIMARY_COLOR_BOLD)%-15s$(NO_COLOR) %s\n", $$1, $$2 }' $(MAKEFILE_LIST) | sort

test: ## Run PHP tests (parameters : dir=tests/Feature/LoginTest.php || filter=get)
	@echo "Creating database: $(PRIMARY_COLOR_BOLD)$(APP_NAME)_test$(NO_COLOR)..."
	@$(mariadb) "drop database if exists $(APP_NAME)_test; create database $(APP_NAME)_test;"
	@$(php) bin/phpunit $(dir) --filter $(filter) --testdox

dev: install ## Run development servers
	@docker-compose up -d nginx webpack_dev_server #laravel_echo_server
	@echo "Dev server launched on http://localhost:$(APP_PORT)"
	@echo "Mail server launched on http://localhost:1080"
	@echo "Webpack dev server launched on http://localhost:3000"

stop-dev: ## Stop development servers
	@docker-compose down
	@echo "Dev server stopped: http://localhost:$(APP_PORT)"
	@echo "Mail server stopped: http://localhost:1080"
	@echo "Webpack dev server stopped: http://localhost:3000"

build: install ## Build assets projects for production
	@rm -rf ./public/assets/*
	@$(npm) run build

migrate: clean ## Refresh database by running new migrations
	@echo "$(PRIMARY_COLOR)Migrating database...$(NO_COLOR)"
	@$(php) bin/console doctrine:migrations:migrate --no-interaction --quiet
	@$(php) bin/console doctrine:fixtures:load --no-interaction --no-debug

purge-database: ## Purge dev database (MIGRATE=0[default])
	@$(mariadb) "drop database if exists $(APP_NAME); create database $(APP_NAME);"
ifdef MIGRATE
	@rm -rf migrations/*
	@$(php) bin/console make:migration
endif

bash: ## Run bash in PHP container
	@$(bash)
