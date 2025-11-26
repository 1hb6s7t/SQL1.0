# 阿里云服务器 + 域名部署指南

将 SQL 学习平台部署到阿里云服务器，绑定域名 liujun-sql.xyz

## 前置条件

- 已购买阿里云轻量应用服务器（Ubuntu系统）
- 已购买域名 liujun-sql.xyz
- 服务器安全组已开放端口：22, 80, 443

## 第一步：连接服务器

```bash
ssh root@你的服务器IP
```

## 第二步：安装环境

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 安装 PM2
npm install -g pm2

# 安装 Nginx
apt install nginx -y

# 安装 Git
apt install git -y
```

## 第三步：上传项目

### 方式一：使用 Git（推荐）

```bash
cd /var/www
git clone 你的GitHub仓库地址 sql-learning
cd sql-learning
```

### 方式二：使用 SFTP

使用 FileZilla 等工具将项目上传到 `/var/www/sql-learning`

## 第四步：安装依赖

```bash
cd /var/www/sql-learning

# 根目录
npm install

# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

## 第五步：配置后端环境变量

```bash
cd /var/www/sql-learning/backend
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_9VrHRgt4KyxT@ep-bitter-flower-adc7sv0w-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=liujun_sql_platform_super_secret_key_2024
JWT_EXPIRES_IN=7d
QWEN_API_KEY=sk-f7595fe3394f4b81a72f15c929c91e4f
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
QWEN_MODEL=qwen3-coder-plus
FRONTEND_URL=https://liujun-sql.xyz
EOF
```

## 第六步：初始化数据库

```bash
cd /var/www/sql-learning/backend
npm run init-db
```

## 第七步：修改前端 API 地址

编辑 `/var/www/sql-learning/frontend/src/services/api.js`，确保生产环境 API 地址正确：

```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // 使用 Nginx 反向代理
  : '/api';
```

## 第八步：构建前端

```bash
cd /var/www/sql-learning/frontend
npm run build
```

## 第九步：配置 Nginx

```bash
nano /etc/nginx/sites-available/liujun-sql
```

粘贴以下内容：

```nginx
server {
    listen 80;
    server_name liujun-sql.xyz www.liujun-sql.xyz;

    # 前端静态文件
    root /var/www/sql-learning/frontend/dist;
    index index.html;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # AI 请求超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

启用配置：

```bash
ln -s /etc/nginx/sites-available/liujun-sql /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

## 第十步：启动后端服务

```bash
cd /var/www/sql-learning/backend
pm2 start src/app.js --name sql-backend
pm2 save
pm2 startup
```

## 第十一步：配置域名解析

在阿里云 DNS 控制台添加：

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| A | @ | 你的服务器IP |
| A | www | 你的服务器IP |

## 第十二步：配置 HTTPS（免费证书）

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 获取并安装证书
certbot --nginx -d liujun-sql.xyz -d www.liujun-sql.xyz

# 测试自动续期
certbot renew --dry-run
```

## 完成！

访问 https://liujun-sql.xyz 即可使用

---

## 常用运维命令

```bash
# 查看后端状态
pm2 status

# 查看后端日志
pm2 logs sql-backend

# 重启后端
pm2 restart sql-backend

# 重启 Nginx
systemctl restart nginx

# 更新代码
cd /var/www/sql-learning
git pull
cd backend && npm install
cd ../frontend && npm install && npm run build
pm2 restart sql-backend
```

## 域名备案说明

⚠️ **重要**：如果使用国内服务器，域名需要备案才能正常访问。

- 阿里云服务器：需要在阿里云备案
- 海外服务器（如香港）：无需备案

备案流程：
1. 进入阿里云备案系统
2. 填写主体信息和网站信息
3. 上传证件照片
4. 等待审核（约 7-20 个工作日）


