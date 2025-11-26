/**
 * 重置用户脚本 - 删除所有用户并重新创建
 * 运行: node backend/src/scripts/resetUsers.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { query, pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// ========== 配置要创建的12个用户 ==========
const usersToCreate = [
  { username: 'student01', email: 'student01@sql.edu' },
  { username: 'student02', email: 'student02@sql.edu' },
  { username: 'student03', email: 'student03@sql.edu' },
  { username: 'student04', email: 'student04@sql.edu' },
  { username: 'student05', email: 'student05@sql.edu' },
  { username: 'student06', email: 'student06@sql.edu' },
  { username: 'student07', email: 'student07@sql.edu' },
  { username: 'student08', email: 'student08@sql.edu' },
  { username: 'student09', email: 'student09@sql.edu' },
  { username: 'student10', email: 'student10@sql.edu' },
  { username: 'student11', email: 'student11@sql.edu' },
  { username: 'student12', email: 'student12@sql.edu' },
];

// 统一密码
const PASSWORD = 'admin123';
// =====================================

async function resetUsers() {
  try {
    console.log('🔄 开始重置用户数据...\n');
    console.log('=' .repeat(70));

    // 第一步：删除所有相关数据
    console.log('\n🗑️  正在删除现有用户数据...');
    
    // 删除用户学习记录
    await query('DELETE FROM user_learning_records');
    console.log('  ✓ 用户学习记录已删除');
    
    // 删除用户SQL历史
    await query('DELETE FROM user_sql_history');
    console.log('  ✓ 用户SQL历史已删除');
    
    // 删除评论（因为评论关联用户）
    await query('DELETE FROM comments');
    console.log('  ✓ 评论已删除');
    
    // 删除所有用户
    const deleteResult = await query('DELETE FROM users');
    console.log(`  ✓ 用户已删除 (共 ${deleteResult.rowCount} 个)`);

    // 重置ID序列
    await query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    console.log('  ✓ 用户ID序列已重置');

    console.log('\n✅ 所有用户数据已清除！');
    console.log('\n' + '=' .repeat(70));

    // 第二步：创建新用户
    console.log('\n🚀 开始创建新用户...\n');
    
    const passwordHash = await bcrypt.hash(PASSWORD, 12);
    const createdUsers = [];

    for (const userData of usersToCreate) {
      const uuid = uuidv4();
      
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
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        password: PASSWORD
      });

      console.log(`  ✅ 创建成功: ${userData.username}`);
    }

    // 输出结果
    console.log('\n' + '=' .repeat(70));
    console.log('\n📋 新创建的用户账号列表:\n');
    console.log('-'.repeat(70));
    console.log('| ID | 用户名       | 邮箱                    | 密码     |');
    console.log('-'.repeat(70));
    
    createdUsers.forEach(user => {
      const id = String(user.id).padStart(2);
      const username = user.username.padEnd(12);
      const email = user.email.padEnd(23);
      const password = user.password.padEnd(8);
      console.log(`| ${id} | ${username} | ${email} | ${password} |`);
    });
    
    console.log('-'.repeat(70));
    console.log(`\n✅ 共创建 ${createdUsers.length} 个用户，密码统一为: ${PASSWORD}`);

    // 保存到文件
    const outputPath = path.join(__dirname, '../../../user-accounts.txt');
    
    let fileContent = `SQL学习平台 - 用户账号列表\n`;
    fileContent += `生成时间: ${new Date().toLocaleString('zh-CN')}\n`;
    fileContent += `统一密码: ${PASSWORD}\n`;
    fileContent += `${'='.repeat(60)}\n\n`;
    
    createdUsers.forEach((user, index) => {
      fileContent += `【账号 ${index + 1}】\n`;
      fileContent += `用户名: ${user.username}\n`;
      fileContent += `邮箱: ${user.email}\n`;
      fileContent += `密码: ${user.password}\n`;
      fileContent += `${'-'.repeat(40)}\n`;
    });

    fs.writeFileSync(outputPath, fileContent, 'utf8');
    console.log(`\n📁 账号信息已保存到: user-accounts.txt`);

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    await pool.end();
    console.log('\n✅ 操作完成！');
  }
}

resetUsers();

