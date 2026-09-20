# 07 createFeature

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.6.

## Development server

To start a local development server, run:

```bash
npm start
```

This starts the Fastify stub server at `http://127.0.0.1:3000` when it is not already running, then starts Angular at `http://localhost:4200/`.

To use a different Angular port, set `FRONTEND_PORT` when starting the application:

```bash
FRONTEND_PORT=4300 npm start
```

The stub server provides the following endpoints:

- `GET /health`
- `GET /api/dashboard`
- `GET /api/details`
- `GET /api/details/:detailId`
- `GET /api/details/:detailId/history`

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
