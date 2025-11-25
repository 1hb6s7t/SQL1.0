/**
 * 数据库配置文件
 * 使用 NeonDB PostgreSQL 云数据库
 */
const { Pool } = require('pg');

// 数据库连接配置
const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_9VrHRgt4KyxT@ep-bitter-flower-adc7sv0w-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲超时
  connectionTimeoutMillis: 10000 // 连接超时
};

// 创建连接池
const pool = new Pool(dbConfig);

// 测试数据库连接
pool.on('connect', () => {
  console.log('✅ 数据库连接成功');
});

pool.on('error', (err) => {
  console.error('❌ 数据库连接错误:', err.message);
});

// 执行查询的辅助函数
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 查询执行: ${duration}ms, 行数: ${result.rowCount}`);
    return result;
  } catch (error) {
    console.error('❌ 查询错误:', error.message);
    throw error;
  }
};

// 获取单个客户端连接(用于事务)
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = {
  pool,
  query,
  getClient
};

