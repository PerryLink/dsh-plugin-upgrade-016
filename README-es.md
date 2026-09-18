# dsh-plugin-upgrade-016

La **skill de actualización de corredor cerrado y el escáner** para el salto `0.1.5-rc.2 → 0.1.6-alpha.2` de DeepSeek Harness. Empaqueta una tarjeta de corredor bloqueada por versión y un escáner de costuras sin dependencias sobre un **catálogo de cinco costuras** — todas de severidad `error` y todas con detector:

| Costura | Rotura |
|---|---|
| `E1` | Un listener `agent/created` que lanza (o hace trabajo lento en línea) bloquea la creación del agente — el host lo despacha en una cadena serial. |
| `E2` | Carrera en `apply` asíncrono: cualquier registro después del primer `await` muere con `INACTIVE_EFFECT` en la ventana de descarga. |
| `E3` | Claves de slot/estado eliminadas: `settings.plugin.item` (→ `plugins.item`) y `SessionListState.current` — ambas fallan **en silencio**. |
| `E4` | APIs de cliente eliminadas `sessions.open/openSubagent/clear` (→ `retain`/`using`/`retainInfo`) — las rutas de clic lanzan o tragan errores. |
| `E5` | Literales de modelo eliminados `deepseek-v4-flash*`/`deepseek-v4-vision-exp` — los ids sin catalogar se enrutan como solo texto. |

El paquete es una **skill empaquetada** (el modelo ve la tarjeta solo cuando la tarea la necesita) más una **CLI npx** para autores de plugins. No sustituye ni comparte nada con `dsh-plugin-upgrade-015` (que posee el corredor `0.1.3-alpha.1 → 0.1.5-rc.1`): un corredor nunca se ensancha, y un salto que añade costuras es un paquete nuevo.

## What it is

- `skills/plugin-upgrade-016/` — la skill empaquetada: enrutado por frontmatter, el bucle corregir-y-verificar, y `references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md` (la tarjeta de versión: evidencia, receta y criterios de salida por costura).
- `lib/scan-0.1.6.mjs` — un escáner sin dependencias (solo stdlib de Node). Endurecido de nacimiento: `lib/` **se escanea** (los artefactos compilados enviados llevan costuras viejas al usuario), cada comportamiento por línea es un campo del catálogo y el orden de render deriva del catálogo.
- `scripts/scan-0.1.6.mjs` — la CLI (`npx dsh-plugin-upgrade-016-scan --repo <path>`); exit 0 = sin aciertos error, exit 1 = al menos uno.
- `docs/EVIDENCE.md` — el registro comando→salida detrás de cada costura.

Un escaneo limpio es **necesario, no suficiente**: la rotura de este corredor es silenciosa por ambos lados. Verifica con un smoke de host real, un viaje de ida y vuelta de resume para escritores de logs y una aserción de navegador real para la mitad cliente.

## Quick start

```sh
dsh plugin --profile web add @perrylink/dsh-plugin-upgrade-016
npx dsh-plugin-upgrade-016-scan --repo <your-plugin-repo>
```

La skill se enruta sola: cuando la tarea es migrar un repo de plugins a través de `0.1.5-rc.2 → 0.1.6-alpha.2`, el modelo carga la tarjeta empaquetada y ejecuta el bucle corregir-y-verificar.

## Scanner usage

```sh
node scripts/scan-0.1.6.mjs [--repo <path>] [--json <out.json>] [--seams E1,E3] [--quiet]
```

Códigos de salida: `0` = sin aciertos de severidad error · `1` = al menos un acierto error · `2` = fallo de uso. El escáner es de solo lectura: nunca escribe dentro del árbol escaneado.

## The five seams

Evidencia y receta completas en la tarjeta de versión (`skills/plugin-upgrade-016/references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md`). Formas cortas:

- **E1** — nunca lances en un listener `agent/created`; envuelve el trabajo síncrono en try/catch, aplaza el trabajo pesado (`queueMicrotask`/`setImmediate`/cola propia).
- **E2** — todo se registra antes del primer `await` de un `apply` asíncrono; los resultados de `register()` van a `ctx.effect()`.
- **E3** — las tarjetas de ajustes montan en `plugins.item` (slot de lista: `id`/`order`/`label`, props `{view:'summary'|'page'}`); la sesión actual deriva de props estándar (`sessionId`/`useSessionStatus`/`retainedBy.mainView`), nunca `list.current`.
- **E4** — navega vía `sessions.retain(id, { source })`; guarda y desecha el handle devuelto.
- **E5** — los literales de modelo se quedan dentro del catálogo alpha.2; sustituye `deepseek-v4-flash*`/`deepseek-v4-vision-exp`.

## Configuration

Cada perilla es un campo `Config` de Schemastery, documentado en línea en `cordis.patch.yml`:

- `enabled` (por defecto `true`) — registra la skill empaquetada.
- `skillName` (por defecto `plugin-upgrade-016`) — nombre publicado en el catálogo del modelo.
- `skillsRoot` (por defecto el `skills/` del paquete) — debe contener `<skillName>/SKILL.md`.
- `userInvocable` (por defecto `true`) — invocable por el usuario además de por el modelo.

## Development

```sh
pnpm install
pnpm test                    # fixtures del escáner + paridad tarjeta↔catálogo + montaje Cordis real
pnpm run check:readmes       # sincronía de READMEs en cinco idiomas
pnpm run verify:self-contained
pnpm run verify:artifacts    # pack + inspección del tarball
pnpm pack
```

## Topics

`dsh` · `dsh-plugin` · `deepseek-harness` · `deepseek` · `cordis` · `plugin-upgrade` · `migration` · `skill` · `version-card` · `scanner` · `client-slots`

## License

Apache-2.0. Ver `LICENSE` y `THIRD_PARTY_NOTICES.md`.
