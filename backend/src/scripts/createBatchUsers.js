/**
 * 批量创建用户脚本
 * 运行: node backend/src/scripts/createBatchUsers.js
 * 
 * 可修改下方的 usersToCreate 数组来自定义用户
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { query, pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// ========== 配置要创建的用户 ==========
// 可以修改这个数组来自定义用户
const usersToCreate = [
  { username: 'student01', email: 'student01@sql.edu', password: 'Sql@2024#01' },
  { username: 'student02', email: 'student02@sql.edu', password: 'Sql@2024#02' },
  { username: 'student03', email: 'student03@sql.edu', password: 'Sql@2024#03' },
  { username: 'student04', email: 'student04@sql.edu', password: 'Sql@2024#04' },
  { username: 'student05', email: 'student05@sql.edu', password: 'Sql@2024#05' },
  { username: 'student06', email: 'student06@sql.edu', password: 'Sql@2024#06' },
  { username: 'student07', email: 'student07@sql.edu', password: 'Sql@2024#07' },
  { username: 'student08', email: 'student08@sql.edu', password: 'Sql@2024#08' },
  { username: 'student09', email: 'student09@sql.edu', password: 'Sql@2024#09' },
  { username: 'student10', email: 'student10@sql.edu', password: 'Sql@2024#10' },
];
// =====================================

async function createBatchUsers() {
  console.log('🚀 开始批量创建用户...\n');
  console.log('=' .repeat(80));
  
  const createdUsers = [];
  const failedUsers = [];

  for (const userData of usersToCreate) {
    try {
      // 检查用户名是否已存在
      const existingUsername = await query(
        'SELECT id FROM users WHERE username = $1',
        [userData.username]
      );
      
      if (existingUsername.rows.length > 0) {
        console.log(`⚠️  跳过: ${userData.username} (用户名已存在)`);
        failedUsers.push({ ...userData, reason: '用户名已存在' });
        continue;
      }

      // 检查邮箱是否已存在
      const existingEmail = await query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );
      
      if (existingEmail.rows.length > 0) {
        console.log(`⚠️  跳过: ${userData.username} (邮箱已存在)`);
        failedUsers.push({ ...userData, reason: '邮箱已存在' });
        continue;
      }

      // 创建用户
      const uuid = uuidv4();
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      const result = await query(`
        INSERT INTO users (uuid, username, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, uuid, username, email, created_at
      `, [uuid, userData.username, userData.email, passwordHash]);

      const newUser = result.rows[0];
      
      // 初始化学习记录
      await query(`
        INSERT INTO user_learning_records (user_id, sql_topic, content)
        VALUES ($1, '欢迎学习', '开始您的SQL学习之旅！')
      `, [newUser.id]);

      createdUsers.push({
        ...newUser,
        password: userData.password  // 保存原始密码用于输出
      });

      console.log(`✅ 创建成功: ${userData.username} (${userData.email})`);

    } catch (error) {
      console.log(`❌ 创建失败: ${userData.username} - ${error.message}`);
      failedUsers.push({ ...userData, reason: error.message });
    }
  }

  console.log('\n' + '=' .repeat(80));
  console.log('\n📋 创建结果汇总:\n');
  
  if (createdUsers.length > 0) {
    console.log('✅ 成功创建的用户:');
    console.log('-'.repeat(80));
    console.log('| 用户名       | 邮箱                    | 密码           |');
    console.log('-'.repeat(80));
    
    createdUsers.forEach(user => {
      const username = user.username.padEnd(12);
      const email = user.email.padEnd(23);
      const password = user.password.padEnd(14);
      console.log(`| ${username} | ${email} | ${password} |`);
    });
    
    console.log('-'.repeat(80));
    console.log(`\n共成功创建 ${createdUsers.length} 个用户`);
  }

  if (failedUsers.length > 0) {
    console.log('\n⚠️  未能创建的用户:');
    failedUsers.forEach(user => {
      console.log(`  - ${user.username}: ${user.reason}`);
    });
  }

  // 保存账号信息到文件
  const fs = require('fs');
  const outputPath = require('path').join(__dirname, '../../../user-accounts.txt');
  
  let fileContent = `SQL学习平台 - 用户账号列表\n`;
  fileContent += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
  fileContent += `${'='.repeat(60)}\n\n`;
  
  createdUsers.forEach((user, index) => {
    fileContent += `【账号 ${index + 1}】\n`;
    fileContent += `用户名: ${user.username}\n`;
    fileContent += `邮箱: ${user.email}\n`;
    fileContent += `密码: ${user.password}\n`;
    fileContent += `${'-'.repeat(40)}\n`;
  });

  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`\n📁 账号信息已保存到: ${outputPath}`);

  await pool.end();
  console.log('\n✅ 批量创建完成！');
}

createBatchUsers().catch(console.error);

