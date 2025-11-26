/**
 * 查看所有用户列表
 * 运行: node backend/src/scripts/listUsers.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { query, pool } = require('../config/database');

async function listUsers() {
  try {
    console.log('📋 正在查询用户列表...\n');
    
    const result = await query(`
      SELECT 
        id,
        uuid,
        username,
        email,
        role,
        is_active,
        created_at,
        last_login
      FROM users
      ORDER BY created_at DESC
    `);

    if (result.rows.length === 0) {
      console.log('❌ 暂无用户数据');
    } else {
      console.log('=' .repeat(100));
      console.log('用户列表 (共 ' + result.rows.length + ' 个用户)');
      console.log('=' .repeat(100));
      console.log('\n');
      
      result.rows.forEach((user, index) => {
        console.log(`【用户 ${index + 1}】`);
        console.log(`  ID: ${user.id}`);
        console.log(`  UUID: ${user.uuid}`);
        console.log(`  用户名: ${user.username}`);
        console.log(`  邮箱: ${user.email}`);
        console.log(`  角色: ${user.role}`);
        console.log(`  状态: ${user.is_active ? '活跃' : '禁用'}`);
        console.log(`  注册时间: ${user.created_at}`);
        console.log(`  最后登录: ${user.last_login || '从未登录'}`);
        console.log('-'.repeat(50));
      });
    }

    // 统计信息
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
      FROM users
    `);
    
    const stats = statsResult.rows[0];
    console.log('\n📊 统计信息:');
    console.log(`  总用户数: ${stats.total}`);
    console.log(`  管理员: ${stats.admin_count}`);
    console.log(`  普通用户: ${stats.user_count}`);
    console.log(`  活跃用户: ${stats.active_count}`);

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    await pool.end();
    console.log('\n✅ 查询完成');
  }
}

listUsers();

