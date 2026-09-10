# IPF UAE Platform

## Supabase setup

1. Copy `.env.example` to `.env` and set the server and `VITE_` Supabase keys.
2. For a new database, run these three files in order: `server/schema.sql`, `server/migrations/003_supabase_auth.sql`, `server/migrations/006_unified_identity.sql`, `server/migrations/007_signup_trigger_and_admin_integrity.sql`. The other numbered migrations (`002`, `003_identity_rbac_workflow`, `004`, `005`) are already folded into `schema.sql` and only matter when bootstrapping a database that predates it.
3. For an existing database that predates Supabase Auth, run `server/migrations/003_supabase_auth.sql`, `006_unified_identity.sql` and `007_signup_trigger_and_admin_integrity.sql` in order before deploying this version.
4. Set `IPF_ADMIN_EMAIL` and a 12+ character `IPF_ADMIN_PASSWORD`. The first API request creates or links that Supabase Auth user as the initial super admin.
5. Configure the Supabase Site URL and allowed redirect URLs for the deployed domain. Registration follows the project's email-confirmation setting.

Member, Yuva and administrator credentials are handled by Supabase Auth. Application profiles, membership numbers, roles and organisational scopes remain in public tables protected by server-side authorization and database constraints.

## Development

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
