# Muqyy LobeHub

基于 LobeHub v2.2.19（234e0fc7）的私人网页聊天部署。生产分支为 `deploy/muqyy-lobehub`。

采用 Vercel、Neon PostgreSQL 和阿里云 OSS。聊天模型使用 OpenAI 兼容中转的 GPT 6.1 Sol，文件存储桶为私有，用户通过邮箱与密码登录。

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

## 发布

先验证登录、聊天、文件上传与读取，再发布生产版本。Vercel CLI 上传大量源码文件时使用 `--archive=tgz`，发布目录不得包含 Git 元数据、`.env`、密钥、`node_modules` 或本地生成的构建文件。

```sh
vercel deploy --prod --yes --archive=tgz --scope muqy1818s-projects
```
