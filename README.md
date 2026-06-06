# hello-worker

一个基于 Cloudflare Workers 的访问计数器演示项目，展示 Workers + Assets + KV 的全栈协作模式。

## 项目结构

```
hello-worker/
├── src/index.ts          # 后端入口：API 路由 + KV 读写
├── public/index.html     # 前端页面：展示访问计数
├── wrangler.jsonc        # Wrangler 配置
└── README.md
```

## 工作原理

- **前端**（`public/index.html`）：页面加载时请求 `/api/visit`，将返回的计数显示在页面上。
- **后端**（`src/index.ts`）：收到 `/api/visit` 请求后，从 KV 读取当前计数 +1 后写回，返回 JSON。其他路径一律转交给 Assets 绑定处理静态文件。
- **KV**：以键 `views` 存储访问次数。

## 本地运行与测试

```bash
npx wrangler dev
```

Wrangler 会自动完成以下工作：

1. 读取 `wrangler.jsonc`，确定入口和静态资源目录
2. 用 esbuild 实时编译 TypeScript
3. 在 `localhost:8787` 启动本地服务器
4. 模拟 KV 数据库（数据存储在 `.wrangler/` 目录下的本地 SQLite）
5. 开启热重载，保存代码后自动重新编译

浏览器打开 `http://localhost:8787`，每次刷新页面访问次数会自增。

## 部署到云端

### 1. 创建 KV 命名空间

```bash
npx wrangler kv namespace create DB
```
$ npx wrangler kv namespace create DB

 ⛅️ wrangler 4.98.0
───────────────────
Resource location: remote

🌀 Creating namespace with title "DB"
✨ Success!
To access your new KV Namespace in your Worker, add the following snippet to your configuration file:
{
  "kv_namespaces": [
    {
      "binding": "DB",
      "id": "d7d1051771e748c8a96906d07cdba25e"
    }
  ]
}

命令行会输出类似 `{"binding": "DB", "id": "456xyz..."}` 的内容，将其替换到 `wrangler.jsonc` 中的 `kv_namespaces` 部分。

### 2. 发布

```bash
npx wrangler deploy
```

Wrangler 会将代码压缩打包、上传静态资源和 Worker 代码到 Cloudflare，并在全球 300+ 数据中心同步分发。部署完成后会得到一个 `https://xxx.workers.dev` 网址。

## dev 与 deploy 的区别

| | `npx wrangler dev` | `npx wrangler deploy` |
|---|---|---|
| **运行位置** | 本地电脑 | Cloudflare 全球边缘网络 |
| **KV 存储** | 本地 SQLite（`.wrangler/` 目录） | 云端真正的 KV 命名空间 |
| **静态资源** | 从本地磁盘读取 | 上传到 Cloudflare 全球存储 |
| **代码** | 未压缩，支持热重载 | 压缩混淆，生产级打包 |
| **访问方式** | `localhost:8787` | `https://xxx.workers.dev` |

简而言之：`dev` 是本地沙盒演练，`deploy` 是把成果推到全球边缘节点。
