/**
 * 测试登录API
 */

const http = require('http');

const data = JSON.stringify({
  email: 'student01',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('🔍 测试登录API...\n');
console.log('请求地址: http://localhost:3000/api/auth/login');
console.log('请求数据:', { email: 'student01', password: 'admin123' });
console.log('\n等待响应...\n');

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('状态码:', res.statusCode);
    console.log('响应:', body);
    
    try {
      const json = JSON.parse(body);
      if (json.success) {
        console.log('\n✅ 登录成功！');
        console.log('用户:', json.data.user.username);
        console.log('Token:', json.data.token.substring(0, 50) + '...');
      } else {
        console.log('\n❌ 登录失败:', json.message);
      }
    } catch (e) {
      console.log('响应解析失败:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ 请求失败:', e.message);
  console.log('\n可能原因:');
  console.log('1. 后端服务未启动 - 请运行 npm run dev');
  console.log('2. 端口3000被占用');
});

req.write(data);
req.end();

