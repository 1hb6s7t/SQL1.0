# 使用 ngrok 内网穿透部署指南

ngrok 可以将本地服务暴露到公网，适合测试和小规模使用。

## 步骤 1：注册 ngrok 账号

1. 访问 https://ngrok.com/
2. 点击 "Sign up" 注册免费账号
3. 登录后，在 Dashboard 找到你的 **Authtoken**

## 步骤 2：下载安装 ngrok

### Windows:
1. 访问 https://ngrok.com/download
2. 下载 Windows 版本
3. 解压到项目目录或任意位置

## 步骤 3：配置 ngrok

打开命令行，运行：
```bash
ngrok config add-authtoken 你的authtoken
```

## 步骤 4：启动本地服务

确保 SQL 学习平台正在运行：
```bash
npm run dev
```

## 步骤 5：启动 ngrok 隧道

### 方式一：仅暴露后端 API（推荐）

```bash
ngrok http 3000
```

你会看到类似输出：
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

然后修改前端配置，将 API 地址改为 ngrok 提供的地址。

### 方式二：同时暴露前后端

需要两个终端窗口：

终端1 - 暴露后端：
```bash
ngrok http 3000
```

终端2 - 暴露前端：
```bash
ngrok http 5173
```

## 步骤 6：配置前端 API 地址

编辑 `frontend/src/services/api.js`，修改 baseURL：

```javascript
const api = axios.create({
  baseURL: 'https://你的ngrok后端地址.ngrok.io/api',  // 改为ngrok地址
  // ...
})
```

然后重新构建前端：
```bash
cd frontend
npm run build
```

## 步骤 7：分享给其他人

将 ngrok 提供的 HTTPS 地址分享给其他人即可访问。

## 注意事项

1. **免费版限制**：
   - 每次启动地址会变化
   - 同时只能开一个隧道
   - 有请求速率限制

2. **付费版优势**：
   - 固定域名
   - 多个隧道
   - 更高的速率限制

3. **安全提醒**：
   - ngrok 地址任何人都可以访问
   - 不要在生产环境使用
   - 定期更换地址

