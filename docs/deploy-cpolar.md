# 使用 cpolar 内网穿透部署指南（推荐国内用户）

cpolar 是国内的内网穿透服务，速度更快，免费版也很好用。

## 步骤 1：注册 cpolar 账号

1. 访问 https://www.cpolar.com/
2. 点击"免费注册"
3. 完成注册并登录

## 步骤 2：下载安装 cpolar

1. 在 cpolar 控制台下载 Windows 客户端
2. 运行安装程序
3. 安装完成后，cpolar 会自动启动

## 步骤 3：登录 cpolar

打开命令行：
```bash
cpolar authtoken 你的authtoken
```

你的 authtoken 在 cpolar 网站的"验证"页面可以找到。

## 步骤 4：启动隧道

### 暴露后端服务（端口3000）

```bash
cpolar http 3000
```

你会看到类似输出：
```
公网地址 -> http://xxxxxx.cpolar.cn
```

### 暴露前端服务（端口5173）

新开一个终端：
```bash
cpolar http 5173
```

## 步骤 5：修改前端 API 配置

编辑 `frontend/src/services/api.js`：

```javascript
const api = axios.create({
  baseURL: 'http://你的cpolar后端地址.cpolar.cn/api',
  // ...
})
```

## 步骤 6：修改后端 CORS 配置

编辑 `backend/src/app.js`，添加 cpolar 地址到 CORS：

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://你的cpolar前端地址.cpolar.cn'  // 添加这行
  ],
  credentials: true,
  // ...
}));
```

## 步骤 7：重启服务并分享

1. 重启前后端服务
2. 将 cpolar 前端地址分享给其他人

## cpolar 免费版说明

- ✅ 无需备案
- ✅ 支持 HTTP/HTTPS
- ✅ 国内访问速度快
- ⚠️ 免费隧道每24小时会重新分配地址
- ⚠️ 带宽有一定限制

## 升级付费版

如需固定域名，可以升级付费版（约10元/月起）。

