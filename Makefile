#: help - Display callable targets (this help information)
help:
	@echo "Reference card for usual actions in development environment."
	@echo "Here are available targets:"
	@egrep -o "^#: (.+)" [Mm]akefile  | sed 's/#: /* /'
.PHONY: help

#: init - install node dependencies
init:
	yarn
	@echo "run `cp .env.example .env` and fill it in with your values"
.PHONY: init

#: start - start development server
start:
	yarn start
.PHONY: start

#: stop - does nothing
stop:
	@echo "nothing to stop"
.PHONY: stop

#: destroy - does nothing
destroy:
	@echo "nothing to destroy"
.PHONY: destroy

#: lint - runs typescript, eslint, and prettier to check for any type errors, style errors, or formatting errors
lint:
	yarn lint
.PHONY: lint

#: pretty - run prettier to auto format code
pretty:
	yarn fmt
	@echo "fyi we have a git pre-commit hook that will format only changed files"
.PHONY: pretty

#: test - runs vitest on codebase
test:
	yarn test
.PHONY: test

#: clean - removes any files created during installation or development
clean:
	rm -rf node_modules
	rm *.log
.PHONY: clean

#: build - builds production assets for deployment
build:
	yarn build
.PHONY: build
