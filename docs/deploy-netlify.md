# Netlify 部署指南

Netlify 是老牌静态网站托管平台，功能丰富，使用简单。

## 部署步骤

### 1. 注册账号

访问 https://app.netlify.com/signup 用 GitHub 登录

### 2. 导入项目

1. 点击 "Add new site" → "Import an existing project"
2. 选择 "GitHub"
3. 选择你的仓库

### 3. 配置构建

| 配置项 | 值 |
|--------|-----|
| Base directory | frontend |
| Build command | npm run build |
| Publish directory | frontend/dist |

### 4. 部署

点击 "Deploy site"

### 5. 绑定域名

1. 进入 Site settings → Domain management
2. 点击 "Add custom domain"
3. 输入 `liujun-sql.xyz`
4. 在阿里云添加 DNS 记录

---

## 与其他平台对比

Netlify 特色：
- 内置表单处理
- 分支预览部署
- 函数支持（类似 Serverless）


