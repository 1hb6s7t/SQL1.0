# 📖 部署指南汇总

选择适合你的部署方案：

## 方案对比

| 方案 | 成本 | 难度 | 速度 | 适用场景 |
|------|------|------|------|---------|
| **ngrok 内网穿透** | 免费 | ⭐ | 较慢 | 临时演示、测试 |
| **cpolar 内网穿透** | 免费 | ⭐ | 快 | 国内用户测试 |
| **Vercel + Render** | 免费 | ⭐⭐ | 快 | 长期使用、个人项目 |
| **云服务器** | 50-200元/年 | ⭐⭐⭐ | 最快 | 正式运营、企业使用 |

## 推荐选择

### 🎯 我只是想快速给朋友看看
→ 使用 [cpolar 内网穿透](./deploy-cpolar.md)，5分钟搞定

### 🎯 我想长期免费运行
→ 使用 [Vercel + Render 免费平台](./deploy-free-platforms.md)

### 🎯 我想做正式的学习平台给很多人用
→ 使用 [云服务器部署](./deploy-cloud-server.md)

## 详细指南

1. [ngrok 内网穿透部署](./deploy-ngrok.md) - 国外服务，需要科学上网
2. [cpolar 内网穿透部署](./deploy-cpolar.md) - 国内服务，推荐
3. [Vercel + Render 免费部署](./deploy-free-platforms.md) - 零成本正式部署
4. [Netlify 部署指南](./deploy-netlify.md) - Netlify 前端 + Render 后端
5. [云服务器部署](./deploy-cloud-server.md) - 最稳定的方案
6. [更新 API 密钥指南](./update-api-key.md) - 如何在已部署项目上更新千问 API 密钥

## 快速开始

### 最快体验（5分钟）

1. 下载安装 [cpolar](https://www.cpolar.com/)
2. 注册账号，获取 authtoken
3. 运行：
```bash
# 启动项目
npm run dev

# 新开终端，暴露后端
cpolar http 3000

# 再开终端，暴露前端
cpolar http 5173
```
4. 把 cpolar 给的地址分享给朋友

### 正式部署（30分钟）

按照 [Vercel + Render 免费部署指南](./deploy-free-platforms.md) 操作。

