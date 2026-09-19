# dsh-plugin-upgrade-016

A **skill de atualização de corredor fechado e o escâner** para o salto `0.1.5-rc.2 → 0.1.6-alpha.2` do DeepSeek Harness. Ele empacota um cartão de corredor travado por versão e um escâner de costuras sem dependências sobre um **catálogo de cinco costuras** — todas de severidade `error` e todas com detector:

| Costura | Quebra |
|---|---|
| `E1` | Um listener `agent/created` que lança (ou faz trabalho lento em linha) bloqueia a criação do agente — o host o despacha em uma cadeia serial. |
| `E2` | Corrida no `apply` assíncrono: qualquer registro após o primeiro `await` morre com `INACTIVE_EFFECT` na janela de descarga. |
| `E3` | Chaves de slot/estado removidas: `settings.plugin.item` (→ `plugins.item`) e `SessionListState.current` — ambas falham **em silêncio**. |
| `E4` | APIs de cliente removidas `sessions.open/openSubagent/clear` (→ `retain`/`using`/`retainInfo`) — caminhos de clique lançam ou engolem erros. |
| `E5` | Literais de modelo removidos `deepseek-v4-flash*`/`deepseek-v4-vision-exp` — ids não catalogados roteiam como somente texto. |

O pacote é uma **skill empacotada** (o modelo vê o cartão apenas quando a tarefa precisa) mais uma **CLI npx** para autores de plugins. Ele não substitui nem compartilha nada com `dsh-plugin-upgrade-015` (que possui o corredor `0.1.3-alpha.1 → 0.1.5-rc.1`): um corredor nunca se alarga, e um salto que adiciona costuras é um pacote novo.

## What it is

- `skills/plugin-upgrade-016/` — a skill empacotada: roteamento por frontmatter, o laço corrigir-e-verificar, e `references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md` (o cartão de versão: evidência, receita e critérios de saída por costura).
- `lib/scan-0.1.6.mjs` — um escâner sem dependências (somente stdlib do Node). Endurecido de nascimento: `lib/` **é escaneado** (artefatos compilados enviados levam costuras velhas ao usuário), todo comportamento por linha é um campo do catálogo e a ordem de render deriva do catálogo.
- `scripts/scan-0.1.6.mjs` — a CLI (`npx dsh-plugin-upgrade-016-scan --repo <path>`); exit 0 = nenhum acerto de erro, exit 1 = pelo menos um.
- `docs/EVIDENCE.md` — o registro comando→saída por trás de cada costura.

Um escaneamento limpo é **necessário, não suficiente**: a quebra deste corredor é silenciosa pelos dois lados. Verifique com um smoke de host real, um round-trip de resume para gravadores de logs e uma asserção de navegador real para a metade cliente.

## Quick start

```sh
dsh plugin --profile web add dsh-plugin-upgrade-016
npx dsh-plugin-upgrade-016-scan --repo <your-plugin-repo>
```

A skill se roteia sozinha: quando a tarefa é migrar um repo de plugins através de `0.1.5-rc.2 → 0.1.6-alpha.2`, o modelo carrega o cartão empacotado e roda o laço corrigir-e-verificar.

## Scanner usage

```sh
node scripts/scan-0.1.6.mjs [--repo <path>] [--json <out.json>] [--seams E1,E3] [--quiet]
```

Códigos de saída: `0` = nenhum acerto de severidade erro · `1` = pelo menos um acerto de erro · `2` = falha de uso. O escâner é somente leitura: nunca escreve dentro da árvore escaneada.

## The five seams

Evidência e receita completas no cartão de versão (`skills/plugin-upgrade-016/references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md`). Formas curtas:

- **E1** — nunca lance em um listener `agent/created`; envolva trabalho síncrono em try/catch, adie trabalho pesado (`queueMicrotask`/`setImmediate`/fila própria).
- **E2** — tudo se registra antes do primeiro `await` de um `apply` assíncrono; resultados de `register()` vão para `ctx.effect()`.
- **E3** — cartões de ajustes montam em `plugins.item` (slot de lista: `id`/`order`/`label`, props `{view:'summary'|'page'}`); a sessão atual deriva de props padrão (`sessionId`/`useSessionStatus`/`retainedBy.mainView`), nunca `list.current`.
- **E4** — navegue via `sessions.retain(id, { source })`; guarde e descarte o handle devolvido.
- **E5** — literais de modelo ficam dentro do catálogo alpha.2; substitua `deepseek-v4-flash*`/`deepseek-v4-vision-exp`.

## Configuration

Cada botão é um campo `Config` do Schemastery, documentado em linha no `cordis.patch.yml`:

- `enabled` (padrão `true`) — registra a skill empacotada.
- `skillName` (padrão `plugin-upgrade-016`) — nome publicado no catálogo do modelo.
- `skillsRoot` (padrão o `skills/` do pacote) — deve conter `<skillName>/SKILL.md`.
- `userInvocable` (padrão `true`) — invocável pelo usuário além do modelo.

## Development

```sh
pnpm install
pnpm test                    # fixtures do escâner + paridade cartão↔catálogo + montagem Cordis real
pnpm run check:readmes       # sincronia dos READMEs em cinco idiomas
pnpm run verify:self-contained
pnpm run verify:artifacts    # pack + inspeção do tarball
pnpm pack
```

## Topics

`dsh` · `dsh-plugin` · `deepseek-harness` · `deepseek` · `cordis` · `plugin-upgrade` · `migration` · `skill` · `version-card` · `scanner` · `client-slots`

## License

Apache-2.0. Veja `LICENSE` e `THIRD_PARTY_NOTICES.md`.
