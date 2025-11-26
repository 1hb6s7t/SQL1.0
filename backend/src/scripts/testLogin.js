/**
 * 测试登录脚本
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { query, pool } = require('../config/database');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    console.log('🔍 测试登录功能...\n');

    // 1. 查询用户
    const username = 'student01';
    const password = 'admin123';
    
    console.log(`尝试登录用户: ${username}`);
    console.log(`使用密码: ${password}\n`);

    // 通过用户名查找
    const userResult = await query(
      'SELECT * FROM users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ 用户不存在！');
      await pool.end();
      return;
    }

    const user = userResult.rows[0];
    console.log('✅ 找到用户:');
    console.log(`  ID: ${user.id}`);
    console.log(`  用户名: ${user.username}`);
    console.log(`  邮箱: ${user.email}`);
    console.log(`  密码哈希: ${user.password_hash.substring(0, 30)}...`);

    // 2. 验证密码
    console.log('\n🔐 验证密码...');
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (isValid) {
      console.log('✅ 密码验证成功！');
    } else {
      console.log('❌ 密码验证失败！');
      
      // 额外测试：重新生成哈希看是否匹配
      console.log('\n📝 调试信息:');
      const newHash = await bcrypt.hash(password, 12);
      console.log(`  新生成的哈希: ${newHash.substring(0, 30)}...`);
      console.log(`  数据库的哈希: ${user.password_hash.substring(0, 30)}...`);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await pool.end();
  }
}

testLogin();

