# 私用本地运行

这份说明只覆盖当前 fork 上可离线排盘的开源副本。它不是公网服务，也不是完整的 AI 解读或合盘商业系统。

隔离云端环境里跑通安装、类型检查、测试和构建，只说明那台临时虚拟机当时能算盘。那个地址不会留给个人长期打开，也不要为了体验把本仓库部署到公网。

## 许可证

- 代码：仓库根目录 `LICENSE`，MIT。
- 样本 / 解读数据集：`DATASET-LICENSE`，CC BY 4.0。数据集在上游 Release，不在 `npm` 安装范围内。本说明不下载这些数据集。
- `docs/tianji-ziwei/` 里的倪海厦资料：CC BY-NC-SA 4.0，见该目录 `LICENSE.md`。不要把这部分拿去做商业化。

## 开源副本没有的能力

- 没有 `/api/interpret`，没有 `/api/heming`。页面上的 AI 解读和合盘分析会得到「开源版不含该接口」。
- `lib/ziwei/db-analysis.ts` 里的 `STAR_DB` 是空对象。知识库详情不会变成完整断语库。
- `@anthropic-ai/sdk`、`pg`、`ioredis` 仍留在依赖里，但开源页面没有引用它们。不配置密钥，也不要为了排盘去注册付费接口。

## 时辰

`BirthInfo.hour` 是 0–11 的时辰地支索引（0 子、1 丑、…、11 亥），不是钟点。钟点放在 `clockHour` / `clockMinute`，经 `lib/ziwei/chart-entry.ts` 的 `resolveTrueSolarBirthInfo` / `generateTrueSolarChart` 换算后再排盘。

## 遥测

`app/layout.tsx` 已去掉 Vercel Analytics 和 Speed Insights。`dev` / `build` / `start` 设置 `NEXT_TELEMETRY_DISABLED=1`，避免 Next.js 向 `https://telemetry.nextjs.org/api/v1/record` 上报。

字体用系统字体栈（`app/globals.css` 的 `--font`）。排盘应用的构建不请求 Google Fonts。`research/` 下有一份研究用 HTML 模板引用了 Google Fonts，日常排盘不要运行那套研究脚本。

## 浏览器里会留下什么

- `ziwei_history` 的读写在 `lib/ziwei/history.ts`。当前页面没有引用 `useHistory()`，打开排盘页不会把出生资料写入这个键。
- 主题键 `ziwei-theme`、流派键 `ziwei-school-config-v1` 会写在本机 localStorage，不上传。
- 首页公告键 `announcement_seen_2026-05-01` 只记录是否看过公告。
- 排盘页起盘后，解读面板会向本站 `/api/interpret` 发请求。开源副本没有这个路由，请求停在本机并返回 404，不会把盘面送到外部模型。
- 不要把真实出生信息输入页面。浏览器历史和自动填充可能留下你亲手输入的内容。验证时只用虚构资料。

## 在自己的电脑上运行

需要 Node.js 20.9 或更新版本。在本 fork 的分支上：

```bash
npm ci --no-audit --no-fund
npm run typecheck
npm test
npm run build
npm run demo:fictional
npm run dev
```

开发服务器只给本机使用。浏览器打开 `http://127.0.0.1:3000/chart`。虚构示例与 `npm run demo:fictional` 相同：姓名「虚构示例甲」，公历 2001-01-01，钟点 08:30，经度 121.5，男。这组数字不代表真人。

`npm ci` 会访问 `https://registry.npmjs.org` 下载锁文件里的包。`esbuild` 的 `postinstall` 在对应平台包已经装上时，只检查本地二进制；装不上时才会再向 npm 注册表取 `@esbuild` 平台包。不要加 `--no-optional`，否则会触发这条回退下载。
