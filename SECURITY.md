# Security Policy

## Reporting a Vulnerability

Report vulnerabilities privately to the maintainer (GitHub Security Advisory or the contact in the repository profile). Do not open a public issue for a vulnerability.

## Scope

- The scanner (`lib/scan-0.1.6.mjs`) is read-only and dependency-free: it reads files inside the scanned repository and writes nothing there. Its only writes are the optional `--json` report at the path you give it.
- The plugin host face (`index.mjs`) registers one bundled agent skill and imports nothing beyond the injected `skills` service and the declared peers.
- The package bundles no executables beyond the scanner bin, performs no network access, and holds no credentials.

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x | Yes (the closed `0.1.5-rc.2 -> 0.1.6-alpha.2` corridor) |

## Security boundaries

- Never run the scanner with elevated permissions on untrusted trees: it reads file contents but performs no sandboxing of its own.
- The `--json` output path is resolved with `path.resolve`; pass explicit paths in CI.
- The skill body is documentation plus instructions; the model only loads it when a task matches its routing fields.
