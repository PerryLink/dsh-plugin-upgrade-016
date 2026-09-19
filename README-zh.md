# dsh-plugin-upgrade-016

DeepSeek Harness 跳跃 `0.1.5-rc.2 → 0.1.6-alpha.2` 的**封闭走廊升级技能与扫描器**。它打包一张版本锁定走廊卡 + 一个零依赖接缝扫描器，目录共**五条接缝**——全部为 `error` 级，且每条都有检测器：

| 接缝 | 破坏 |
|---|---|
| `E1` | 抛错（或内联慢工作）的 `agent/created` 监听器阻断 agent 创建——宿主在串行链上派发。 |
| `E2` | 异步 `apply` 竞态：首个 `await` 之后的任何注册在卸载窗口内死于 `INACTIVE_EFFECT`。 |
| `E3` | 被删槽/状态键：`settings.plugin.item`（→ `plugins.item`）与 `SessionListState.current`——两者都**静默**失效。 |
| `E4` | 被删客户端 API `sessions.open/openSubagent/clear`（→ `retain`/`using`/`retainInfo`）——点击路径抛错或吞错。 |
| `E5` | 被删模型字面量 `deepseek-v4-flash*`/`deepseek-v4-vision-exp`——未编目 id 透传 text-only。 |

本包 = **bundle 技能**（模型只在任务需要时看到走廊卡）+ 面向插件作者的 **npx CLI**。它不取代、也不共享 `dsh-plugin-upgrade-015`（后者负责 `0.1.3-alpha.1 → 0.1.5-rc.1` 走廊）：走廊永不加宽，加了接缝的 hop 就是新包。

## What it is

- `skills/plugin-upgrade-016/` — 打包的代理技能：frontmatter 路由、修-验循环、`references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md`（版本卡：每条接缝的证据/修法/退出判据）。
- `lib/scan-0.1.6.mjs` — 零依赖扫描器（仅 Node 标准库）。出生即硬化：`lib/` **会被扫描**（已提交构建物会把旧接缝带给用户）、所有逐行行为都是 catalog 字段、渲染顺序由 catalog 派生。
- `scripts/scan-0.1.6.mjs` — CLI（`npx dsh-plugin-upgrade-016-scan --repo <path>`）；exit 0 = 无 error 命中，exit 1 = 至少一条。
- `docs/EVIDENCE.md` — 每条接缝的命令→输出出处。

干净扫描**必要但不充分**：本走廊的破坏从两端都是静默的。必须用真宿主冒烟、写日志仓的 resume 往返、client 半边的真浏览器断言来收口。

## Quick start

```sh
dsh plugin --profile web add dsh-plugin-upgrade-016
npx dsh-plugin-upgrade-016-scan --repo <your-plugin-repo>
```

技能自我路由：当任务是跨 `0.1.5-rc.2 → 0.1.6-alpha.2` 迁移插件仓时，模型加载打包的卡片并跑修-验循环。

## Scanner usage

```sh
node scripts/scan-0.1.6.mjs [--repo <path>] [--json <out.json>] [--seams E1,E3] [--quiet]
```

退出码：`0` = 无 error 级命中 · `1` = 至少一条 error 命中 · `2` = 用法失败。扫描器只读：绝不写被扫目录。

## The five seams

完整证据与修法见版本卡（`skills/plugin-upgrade-016/references/v0.1.5-rc.2-to-v0.1.6-alpha.2.md`）。速记：

- **E1** — `agent/created` 监听器绝不抛错；同步工作包 try/catch，重工作延后（`queueMicrotask`/`setImmediate`/自有队列）。
- **E2** — 一切注册在异步 `apply` 的第一个 `await` 之前完成；`register()` 返回值交给 `ctx.effect()`。
- **E3** — 设置卡挂 `plugins.item`（list 槽：`id`/`order`/`label`，props `{view:'summary'|'page'}`）；「当前会话」从标准 props（`sessionId`/`useSessionStatus`/`retainedBy.mainView`）推导，绝不读 `list.current`。
- **E4** — 跳转走 `sessions.retain(id, { source })`；保存并在卸载时 dispose 返回的句柄。
- **E5** — 模型字面量留在 alpha.2 目录内；替换 `deepseek-v4-flash*`/`deepseek-v4-vision-exp`。

## Configuration

每个旋钮都是 Schemastery `Config` 字段，`cordis.patch.yml` 内联注释：

- `enabled`（默认 `true`）— 注册打包技能。
- `skillName`（默认 `plugin-upgrade-016`）— 发布到模型目录的技能名。
- `skillsRoot`（默认包内 `skills/`）— 必须含 `<skillName>/SKILL.md`。
- `userInvocable`（默认 `true`）— 除模型调用外允许用户调用。

## Development

```sh
pnpm install
pnpm test                    # 扫描器 fixture + 卡↔目录 parity + 真 Cordis 挂载
pnpm run check:readmes       # 五语 README 同步
pnpm run verify:self-contained
pnpm run verify:artifacts    # pack + tarball 检查
pnpm pack
```

## Topics

`dsh` · `dsh-plugin` · `deepseek-harness` · `deepseek` · `cordis` · `plugin-upgrade` · `migration` · `skill` · `version-card` · `scanner` · `client-slots`

## License

Apache-2.0。见 `LICENSE` 与 `THIRD_PARTY_NOTICES.md`。
