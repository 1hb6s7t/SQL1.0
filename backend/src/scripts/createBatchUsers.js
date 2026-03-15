/**
 * 批量创建用户脚本
 * 运行: node backend/src/scripts/createBatchUsers.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { query, pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const defaultPassword = 'admin123';
const usersToCreate = [
  { username: 'teacher', email: 'teacher@sql.local', password: defaultPassword },
  ...Array.from({ length: 25 }, (_, i) => ({
    username: `student${String(i + 1).padStart(2, '0')}`,
    email: `student${String(i + 1).padStart(2, '0')}@sql.local`,
    password: defaultPassword
  }))
];

async function createBatchUsers() {
  console.log('🚀 开始批量创建用户...');
  console.log('='.repeat(80));

  const createdUsers = [];
  const skippedUsers = [];

  for (const userData of usersToCreate) {
    try {
      const existingUsername = await query('SELECT id FROM users WHERE username = $1', [userData.username]);
      if (existingUsername.rows.length > 0) {
        console.log(`⚠️  跳过: ${userData.username} (用户名已存在)`);
        skippedUsers.push({ ...userData, reason: '用户名已存在' });
        continue;
      }

      const existingEmail = await query('SELECT id FROM users WHERE email = $1', [userData.email]);
      if (existingEmail.rows.length > 0) {
        console.log(`⚠️  跳过: ${userData.username} (邮箱已存在)`);
        skippedUsers.push({ ...userData, reason: '邮箱已存在' });
        continue;
      }

      const uuid = uuidv4();
      const passwordHash = await bcrypt.hash(userData.password, 12);
      const result = await query(`
        INSERT INTO users (uuid, username, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, uuid, username, email, created_at
      `, [uuid, userData.username, userData.email, passwordHash]);

      const newUser = result.rows[0];
      await query(`
        INSERT INTO user_learning_records (user_id, sql_topic, content)
        VALUES ($1, '欢迎学习', '开始您的数据库课程学习之旅！')
      `, [newUser.id]);

      createdUsers.push({ ...newUser, password: userData.password });
      console.log(`✅ 创建成功: ${userData.username}`);
    } catch (error) {
      console.log(`❌ 创建失败: ${userData.username} - ${error.message}`);
      skippedUsers.push({ ...userData, reason: error.message });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📋 创建结果汇总:\n');

  createdUsers.forEach(user => {
    console.log(`- ${user.username} | ${user.email} | ${user.password}`);
  });

  const outputPath = path.join(__dirname, '../../../user-accounts.txt');
  let fileContent = `《数据库原理与应用》智能学习平台 - 用户账号列表\n`;
  fileContent += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
  fileContent += `${'='.repeat(60)}\n\n`;

  createdUsers.forEach((user, index) => {
    fileContent += `【账号 ${index + 1}】\n`;
    fileContent += `用户名: ${user.username}\n`;
    fileContent += `邮箱: ${user.email}\n`;
    fileContent += `密码: ${user.password}\n`;
    fileContent += `${'-'.repeat(40)}\n`;
  });

  if (skippedUsers.length) {
    fileContent += `\n【跳过账号】\n`;
    skippedUsers.forEach(user => {
      fileContent += `${user.username} - ${user.reason}\n`;
    });
  }

  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`\n📁 账号信息已保存到: ${outputPath}`);

  await pool.end();
  console.log(`\n✅ 批量创建完成！成功 ${createdUsers.length} 个，跳过 ${skippedUsers.length} 个。`);
}

createBatchUsers().catch(console.error);
