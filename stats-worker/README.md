# Leptailure · 访问统计部署说明

网站是 GitHub Pages 静态站点，不能独立取得和保存访问者 IP。这个独立 Cloudflare Worker + D1 服务提供网站统计、地理位置（粗略）、短期伪匿名访客标识及管理员 CSV 导出。

## 部署

1. 登录 Cloudflare，在本文件夹安装或运行官方 Wrangler（Node.js 20+）：
   `npx wrangler login`
2. 创建 D1 数据库：
   `npx wrangler d1 create leptailure_visits`
3. 将返回的 database_id 填入 wrangler.toml。
4. 初始化远程数据库：
   `npx wrangler d1 execute leptailure_visits --remote --file=./schema.sql`
5. 配置仅服务端可见的两个秘密：
   `npx wrangler secret put ADMIN_PASSWORD`
   `npx wrangler secret put HASH_SALT`
   注意不要把密码加入 git，也不要复用 GitHub 密码。
6. 部署：`npx wrangler deploy`
7. 将公开的 Worker HTTPS 地址填入仓库根目录 `visit-config.js` 的 `LEPTAILURE_STATS_URL`。
8. 网站后台地址：`https://leptailure.github.io/tools/visits.html`，使用用户名 `admin` 和你设置的 `ADMIN_PASSWORD`。

## 权限与统计范围

- 独立后台的访问记录 API 受 Basic Authentication 密码保护，务必仅使用 HTTPS。
- 站点只在访客明确同意后发送页面浏览事件；拒绝后不发送。
- Worker 从 Cloudflare 请求上下文读取 IP，仅使用每日密盐哈希生成 **按日轮换的伪匿名标识**；数据库不存完整原始 IP，城市和国家为粗略推断。
- 每天自动清理超过 30 天的记录；报表支持 7、30、90 天，但不会恢复已删除的数据。
- 日期按 UTC，IP / 设备 / 广告拦截 / 同意率会影响结果；每日访客标识合计不等于真实人数。
- 代码尚未配置 Worker 地址前，访问统计页面会显示「未接入后端」，不能误认为统计真实为零。
- IP 哈希仍可能属于个人数据，且本项目代码并不构成法律合规保证。上线前检查适用的 RGPD / CNIL 要求及数据处理协议。
