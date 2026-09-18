# EVIDENCE · dsh-plugin-upgrade-016

> 走廊方法论要求：卡片与扫描器里的每一条事实都能回溯到一条命令 + 输出。
> 本文件记录 leg C（`0.1.5-rc.2 → 0.1.6-alpha.2`）五条接缝的出处。
> 标注纪律：`已实测` = 本建包会话在 `D:\deepseek-harness`（tag `dsh-v0.1.6-alpha.2`，HEAD `ddefc45`）上重跑过；`转引已核实` = 方案文件 R3/A02/A01 已在研究期回源码核实，本会话不重复跑；`未验证` = 未跑。

## E1 · `agent/created` 串行派发（error）— 已实测

```console
$ git -C D:\deepseek-harness grep -n "agent/created" ddefc45 -- "packages/core/agent/src/*.ts"
ddefc45:packages/core/agent/src/index.ts:109:  * child plugins) exists before `session/created`, `agent/created`,
ddefc45:packages/core/agent/src/index.ts:176:  * `agent/created` listeners before releasing queued work. The sequence is
ddefc45:packages/core/agent/src/index.ts:417:  * serial `agent/created` listener fails. Emits `agent/disposed`
ddefc45:packages/core/agent/src/index.ts:547:      await this.ctx.serial(entry.carrier, 'agent/created', {
```

断言：`:547` 的 `ctx.serial(..., 'agent/created', ...)` 证明监听器在创建链上**串行 await** —— 一个抛错的监听器直接中断创建。A1 语义转引 `[A02]`/`[A05]`（已核实）。

## E2 · 异步 apply 竞态（error）— 转引已核实

宿主 fiber 在卸载窗口内对迟到的 `ctx.effect` 抛 `INACTIVE_EFFECT`（抛点 `fiber.ts` 已由方案 `[A02]` 回源码核实）；`register()` 返回值丢弃 = 旧闭包继续生效（反例 doublecheck `src/guard/index.ts:664`，正例 `:685-688`）。本卡检测面 = 「`export async function apply` 首个 `await` 之后出现 `ctx.effect|ctx.on|ctx.provide|ctx.plugin|*.register`」。本会话未真机复现卸载时序（`未验证`，扫描器是静态检测）。

## E3 · `settings.plugin.item` 与 `SessionListState.current`（error）— 已实测

```console
$ git -C D:\deepseek-harness grep -n "settings\.plugin\.item" ddefc45 -- "*.ts"
ddefc45:packages/client/ui-settings-models/src/client/slot-contract.ts:11: * the namespace follows `settings.plugin.item`, and the key domain stays the
$ git -C D:\deepseek-harness grep -n "'plugins\.item'" ddefc45 -- "*.ts"
ddefc45:packages/client/ui-plugin-manager/src/client/slot-contract.ts:32:  'plugins.item': { kind: 'list'; scope: 'root'; owner: PluginConfigViewProps }
ddefc45:packages/client/ui-plugin-manager/src/client/index.ts:89:  'plugins.item': { kind: 'list', scope: 'root' },
```

断言：`settings.plugin.item` 只剩一条**注释**（旧名说明），槽契约里已无该 key；新契约 = `plugins.item`（list/root）。`SessionListState.current` 的删除与 7 仓命中由 `[R3]` §② 穷尽差集核实（主控已回源码复核全部命中仓；`未验证` 本会话未重跑该差集）。

## E4 · `sessions.open/openSubagent/clear`（error）— 已实测

```console
$ git -C D:\deepseek-harness grep -n "openSubagent" ddefc45 -- "*.ts"
(no matches)
$ git -C D:\deepseek-harness grep -n "retain" ddefc45 -- "packages/api/session-controller/src/client/sessions/manager.ts"
ddefc45:packages/api/session-controller/src/client/sessions/manager.ts:149:  throw new Error(`sessions.retain: unknown session ${id}`)
```

断言：`openSubagent` 在 alpha.2 源码零命中；替代面 `retain` 存在。`open`/`clear` 的删除与三个消费方的形态（session-pin 响亮 TypeError、background-agents 吞错、claude-move 特性探测）由 `[R3]` §② 核实。

## E5 · 模型字面量 `deepseek-v4-flash*`/`deepseek-v4-vision-exp`（error）— 已实测

```console
$ git -C D:\deepseek-harness grep -rn "deepseek-v4-flash" ddefc45 -- "packages"
(no matches)
$ git -C D:\deepseek-harness grep -rn "deepseek-v4-pro" ddefc45 -- "packages" | head -3
ddefc45:packages/client/ui-model-selection/src/client/index.ts:52:  'deepseek-official/deepseek-v4-pro': 'option.deepseekV4Pro.description',
```

断言：被删 id 在 alpha.2 源码零命中，`deepseek-v4-pro` 仍在册。目录 4→2 与「未编目 id 透传 text-only」（上游 `llm-deepseek/README.md:48` 原文）由 `[A03]`/`[主控 M2]` 核实；非测试区 3 仓引用 + autotier README×5 与 8 个测试文件硬编码由 `[R4]` 新发现核实。

## 家族面事实（W0 钉死，本卡前置）

- 事件词表 58（+`workspace/changes`）、槽表 70 键、默认模型目录 2 条：`[A01]` §3 核实。
- peer canonical 三段式：`dsh-plugin-kit/data/peer-range.json`（W0 0-K 合入，tripwire exit 0 已实测）。
- 未验证项（诚实）：0.1.6 走廊卡在真实 45 仓上的全量扫描回归（等 W1 修复落地后跑）；本包真宿主冒烟（首次 publish 前执行）。
