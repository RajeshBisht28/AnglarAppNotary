# LeafletENotary

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.9.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


## Create Production Build:
`ng build --configuration production --base-href /e-notary/`

## Switch Node Version
nvm use 20.19.0


## Project Structure as below::
src/
├── app/
│   ├── core/                      # Core functionality (singleton services)
│   │   ├── guards/                # Route guards
│   │   │   └── auth.guard.ts     # Protects routes (Enable /diable unauthcanicated or user role based routing ) 
│   │   ├── interceptors/         # HTTP interceptors
│   │   │   └── auth.interceptor.ts # Adds token (Inculde every API auth token in headrs and check api return status 400, 404 etc.)
│   │   ├── services/             # Global services
│   │   │   ├── api.service.ts    # HTTP wrapper (API endpoint)
│   │   │   ├── auth.service.ts   # Auth logic
│   │   │   ├── error-handler.service.ts # Global error handling
│   │   │   └── logger.service.ts # Logging
│   │   └── core.module.ts        # Core module (singletons)
│   │   └── index.ts              # Export ALL core functionality
│   ├── features/                 # Lazy-loaded feature modules
│   │   ├── landing/              # Landing page (Scene 1)
│   │   │   ├── components/       # UI components
│   │   │   │   └── landing-page/
│   │   │   │       ├── landing-page.component.ts
│   │   │   │       ├── landing-page.component.html
│   │   │   │       └── landing-page.component.scss
│   │   │   ├── services/         # Feature-specific services (optional if required for data sharing between components)
│   │   │   │   └── landing.service.ts
│   │   │   ├── landing-routing.module.ts # Feature routing 
│   │   │   └── landing.module.ts # Feature module
│   │   │
│   │   ├── auth/                 # Authentication (Scenes 2-4)
│   │   │   ├── components/
│   │   │   │   ├── login/        # Login form
│   │   │   │   ├── register/     # Registration (Scene 2)
│   │   │   │   └── kba-verification/ # KBA (Scene 3)
│   │   │   ├── services/
│   │   │   │   └── auth-feature.service.ts #(optional if required for data sharing between components)
│   │   │   ├── auth-routing.module.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── document/             # Document handling (Scene 5)
│   │   │   ├── components/
│   │   │   │   ├── upload/       # Document upload
│   │   │   │   └── review/       # Signature detection
│   │   │   ├── services/
│   │   │   │   └── document.service.ts  #(optional if required for data sharing between components)
│   │   │   ├── document-routing.module.ts
│   │   │   └── document.module.ts
│   │   │
│   │   ├── notarization/         # Notarization (Scenes 6-15)
│   │   │   ├── components/
│   │   │   │   ├── scheduling/   # Scene 6
│   │   │   │   ├── video-session/ # Scene 7
│   │   │   │   └── confirmation/ # Scene 12-15
│   │   │   ├── services/
│   │   │   │   └── notarization.service.ts  #(optional if required for data sharing between components)
│   │   │   ├── notarization-routing.module.ts
│   │   │   └── notarization.module.ts
│   │   │
│   │   └── shared/               # Shared resources
│   │       ├── components/       # Reusable UI (buttons, toolbar, footer, loading spinner, dialogs, message confirmation)
│   │       ├── directives/       # Custom directives
│   │       ├── pipes/            # Pipes (e.g., `dateFormat, formatting`)
│   │       ├── material/         # Material module
│   │       │   └── material.module.ts 
│   │       └── shared.module.ts  # Exports shared items
│   │       └── index.ts          # Export ALL Shared functionality
│   ├── models/                   # Interfaces/types
│   │   ├── user.model.ts         # User interface
│   │   └── document.model.ts     # Document interface
│   │
│   ├── utils/                    # Utility functions
│   │   ├── date.utils.ts         # Date helpers
│   │   └── validation.utils.ts   # Form validation
│   │
│   ├── app-routing.module.ts     # Main routing (lazy loading)
│   └── app.module.ts             # Root module
│
├── assets/
│   ├── i18n/                     # Translation files (Optinal)
│   ├── images/                   # App images
│   └── scss/                     # Global SCSS
│       ├── _variables.scss       # Theme variables (Optinal)
│       ├── _mixins.scss          # SCSS mixins
│       └── styles.scss           # Main styles
│
├── environments/                 # Dev/prod configs
└── styles/                       # Global CSS




import { DynamicDialogService } from 'src/app/shared/components/dynamic-dialog/dynamic-dialog.service';

constructor(private dynamicDialog: DynamicDialogService) {}

openCreateUser() {
  this.dynamicDialog.open({
    title: 'Create user',
    message: 'Fill the details below.',
    fields: [
      { name: 'firstName', label: 'First name', type: 'text', required: true, validators: ['minLength'], minLength: 2 },
      { name: 'lastName', label: 'Last name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', validators: ['email', 'required'] },
      { name: 'role', label: 'Role', type: 'select', options: [
          { label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }
      ], required: true },
      { name: 'tos', label: 'I agree to Terms', type: 'checkbox', required: true }
    ],
    initialValues: { role: 'user' },
    buttons: [
      { text: 'Cancel', type: 'close' },
      { text: 'Save', type: 'submit', color: 'primary', disabledWhenInvalid: true }
    ],
    onSubmit: async (payload) => {
      // Call your API here
      // return await this.http.post('/api/users', payload).toPromise();
      return payload; // mock
    },
    autoCloseOnSuccess: true
  }).subscribe(result => {
    if (result) {
      // result contains whatever your onSubmit returned
    }
  });
}



Real-world scenarios covered
Text, textarea, number, email, password, select, date, checkbox.
Built-in validators: required, email, min/max, minLength/maxLength, pattern.
Prefill values via initialValues.
Custom actions via buttons with type: 'custom' and onAction.
Disable submit until valid with disabledWhenInvalid.
Optional autoCloseOnSuccess.