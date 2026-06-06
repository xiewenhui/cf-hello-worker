export interface Env {
  DB: KVNamespace; // 对应 wrangler.toml 中的 KV 绑定
  ASSETS: Fetcher; // 对应 wrangler.toml 中的 Assets 绑定
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. 如果访问的是 API 路径，走后端动态逻辑
    if (url.pathname === '/api/visit') {
      // 从 KV 中获取当前计数（如果没有则默认为 0）
      const current = await env.DB.get('views') || '0';
      const nextCount = parseInt(current) + 1;
      
      // 将新计数存回 KV
      await env.DB.put('views', nextCount.toString());

      // 返回 JSON 数据
      return new Response(JSON.stringify({ count: nextCount }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. 如果不是 API 路径（比如访问 / 或 /index.html），直接转交给前端 Assets
    return env.ASSETS.fetch(request);
  }
};