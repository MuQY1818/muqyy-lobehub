# Muqyy LobeHub

基于 LobeHub v2.2.19（234e0fc7）的私人网页聊天部署。生产分支为 `deploy/muqyy-lobehub`。

采用 Vercel、Neon PostgreSQL 和阿里云 OSS。聊天模型使用 OpenAI 兼容中转的 GPT-6.2 Sol（默认）和 GPT-6.1 Sol，文件存储桶为私有，用户通过邮箱与密码登录。

## 本地开发与二次开发

使用 Node.js 22、pnpm 12.4.1、Bun 1.4.3 或更新版本。根据官方 `.env.example` 配置本地 `.env.local`，不要提交真实密钥。

```sh
pnpm install
bun run dev
```

API 密钥、数据库连接、存储凭据、加密密钥及登录白名单均由 Vercel 环境变量管理。

## 数据库兼容配置

Neon 已停止允许安装 `pg_search`，当前部署显式选择 `FTS_SEARCH_PROVIDER=pg_like`，使用 LobeHub 自带的 PostgreSQL 搜索实现。迁移脚本会保留全部数据表迁移，在临时副本中跳过只用于 ParadeDB 的扩展和 BM25 索引；上游 SQL 文件保持原样。

`KEY_VAULTS_SECRET` 设置后需要长期保留，否则此前加密的 API 配置无法解密。

## 文件处理

文件原件保存在 OSS，通过签名 URL 上传和访问。现有 API 不提供嵌入模型，因此设置 `CHUNKS_AUTO_EMBEDDING=0` 和 `CHUNKS_AUTO_GEN_METADATA=0`。文件聊天使用解析后的文本；语义知识库检索需另外接入可用的嵌入模型。

## 图像生成

两个账号各有两个自定义服务商：`laoli-image`（显示为「GPT 生图 · 普通」，默认 1024×1024）和 `laoli-image-4k`（「GPT 生图 · 4K」，默认 3840×2160，可选 2160×3840）。均使用 OpenAI SDK、`https://video.laoliimage2.win/v1` 和 `/images/generations`，每次生成 1 张。凭据保存在数据库的加密 Key Vault 中，使用老李站「画布专用」分组下、只允许指定模型的专用令牌。

2026-11 老李站改了模型目录，原 `gpt-image-2.5` 已下线，令牌返回 `403 当前凭据无权执行此操作`。现在两种模式都使用 `特价2.5-flare-可用鸡蛋`（1K 0.02、4K 0.04 积分/张，与原价相同），令牌另允许同价的 `特价2.5-sunburst-可用鸡蛋` 作备用。2026-11-25 实测 1024×1024 与 3840×2160 均出图。老李站再改名时，先在其 `/api/pricing` 查新模型 ID，再同步修改令牌的模型限制和两个服务商里的模型 ID。

部分失败响应外层 HTTP 状态为 200，需要同时检查响应内容；此时 LobeHub 可能显示 `Invalid image response: missing or empty data array`。

## 界面精简

面向非技术用户，默认只保留对话、上传文件和生图：

- 侧边栏默认隐藏任务、资源、项目、社区、文稿、记忆；首页隐藏吉祥物、推荐卡片、动态和「上新」横幅，并隐藏 Agent/任务模式切换；对话输入框下方的模式、设备、审批控制栏整体隐藏，账号审批模式设为自动批准。默认值集中在 `src/store/global/muqyyLayout.ts`，每个浏览器首次加载时一次性应用（`muqyyLayoutVersion`），之后以用户自己的自定义为准。
- 手机端新增 `/image` 生图页和底部「生图」标签，复用电脑端页面并自行加载话题列表。
- `FEATURE_FLAGS=-market,-welcome_suggest,-changelog,-check_updates`。
- 默认助手改名为「GPT 助手」。

## 发布

Vercel Hobby 需要设置 `NEXT_ENABLE_ADAPTER=0`，使用兼容的 Next.js 构建器合并路由；`NEXT_EXPERIMENTAL_FUNCTION_BUNDLING` 留空。`vercel.json` 统一函数超时为 300 秒，避免同类路由因为配置不同而拆分。新版部署适配器会为大量路由分别创建函数，超过 Hobby 的 12 个函数限制。

先验证登录、聊天、文件上传与读取，再发布生产版本。Vercel CLI 上传大量源码文件时使用 `--archive=tgz`，发布目录不得包含 Git 元数据、`.env`、密钥、`node_modules` 或本地生成的构建文件。

仓库没有提交 lockfile，Vercel 每次按最新版本解析依赖；`hono-openapi` 和 `@standard-community/standard-openapi` 已在 `pnpm-workspace.yaml` 与 `package.json` 的 overrides 中锁定到 2026-10 可构建的版本。若再次出现依赖相关的构建失败，参照归档的 `node_modules/.pnpm` 版本补充 overrides。

必须从不含 `.git` 的导出目录部署，否则 Vercel 会读取提交作者并以邮箱未关联 GitHub 为由阻止部署。先 `--skip-domain` 部署并验证，再 `vercel promote`：

```sh
rm -rf ../deploy-export && mkdir ../deploy-export && git archive HEAD | tar -x -C ../deploy-export && cp -r .vercel ../deploy-export/
cd ../deploy-export && vercel deploy --prod --skip-domain --yes --archive=tgz --scope muqy1818s-projects
vercel promote <部署地址> --scope muqy1818s-projects
```
