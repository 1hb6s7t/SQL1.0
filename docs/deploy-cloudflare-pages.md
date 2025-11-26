# Cloudflare Pages 部署指南

Cloudflare Pages 提供免费的静态网站托管，全球 CDN 加速，国内访问速度较好。

## 优势

- ✅ 完全免费，无限带宽
- ✅ 全球 CDN，国内访问较快
- ✅ 自动 HTTPS
- ✅ 支持自定义域名
- ✅ 自动部署（推送即更新）

## 部署步骤

### 1. 注册 Cloudflare 账号

访问 https://dash.cloudflare.com/sign-up 注册

### 2. 进入 Pages

1. 登录 Cloudflare Dashboard
2. 左侧菜单选择 "Workers & Pages"
3. 点击 "Create application"
4. 选择 "Pages"
5. 点击 "Connect to Git"

### 3. 连接 GitHub

1. 授权 Cloudflare 访问你的 GitHub
2. 选择 `sql-learning-platform` 仓库
3. 点击 "Begin setup"

### 4. 配置构建

| 配置项 | 值 |
|--------|-----|
| Project name | sql-learning |
| Production branch | main |
| Framework preset | Vue |
| Root directory | frontend |
| Build command | npm run build |
| Build output directory | dist |

### 5. 环境变量（可选）

如果需要在构建时使用环境变量，添加：
```
VITE_API_URL=https://api.liujun-sql.xyz/api
```

### 6. 部署

点击 "Save and Deploy"，等待构建完成。

部署成功后，你会获得一个地址：
```
https://sql-learning.pages.dev
```

### 7. 绑定自定义域名

1. 在项目页面点击 "Custom domains"
2. 点击 "Set up a custom domain"
3. 输入 `liujun-sql.xyz`
4. Cloudflare 会自动配置 DNS（如果域名在 Cloudflare）

如果域名在阿里云，需要添加 CNAME 记录：
- 主机记录：@
- 记录值：sql-learning.pages.dev

### 8. 完成

访问 https://liujun-sql.xyz 即可

---

## 更新部署

推送代码到 GitHub 后，Cloudflare Pages 会自动重新构建和部署。

```bash
git add .
git commit -m "更新"
git push
```

---

## 与 Vercel 对比

| 对比项 | Cloudflare Pages | Vercel |
|--------|-----------------|--------|
| 价格 | 免费 | 免费 |
| 带宽 | 无限 | 100GB/月 |
| 构建时间 | 500次/月 | 6000分钟/月 |
| 国内速度 | ⭐⭐较好 | ⭐一般 |
| 域名配置 | 更简单(如域名在CF) | 简单 |


