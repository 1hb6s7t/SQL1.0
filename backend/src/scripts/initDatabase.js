/**
 * 数据库初始化脚本
 * 创建所有必要的数据表
 */

const { pool } = require('../config/database');

// 删除旧表的SQL（按依赖顺序删除）
const dropTablesSQL = `
DROP TABLE IF EXISTS platform_statistics CASCADE;
DROP TABLE IF EXISTS user_knowledge_progress CASCADE;
DROP TABLE IF EXISTS ai_responses CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS user_sql_history CASCADE;
DROP TABLE IF EXISTS user_learning_records CASCADE;
DROP TABLE IF EXISTS sql_knowledge_points CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
`;

// SQL表创建语句
const createTablesSQL = `
-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) DEFAULT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- 用户学习记录表(每个用户注册后自动创建)
CREATE TABLE IF NOT EXISTS user_learning_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sql_topic VARCHAR(100) NOT NULL,
    content TEXT,
    is_correct BOOLEAN DEFAULT false,
    attempt_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户SQL操作历史表
CREATE TABLE IF NOT EXISTS user_sql_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sql_query TEXT NOT NULL,
    execution_result TEXT,
    is_success BOOLEAN DEFAULT false,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE DEFAULT NULL,
    content TEXT NOT NULL,
    code_snippet TEXT DEFAULT NULL,
    likes_count INTEGER DEFAULT 0,
    is_ai_reply BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 评论点赞表
CREATE TABLE IF NOT EXISTS comment_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, comment_id)
);

-- AI回复记录表
CREATE TABLE IF NOT EXISTS ai_responses (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    original_content TEXT NOT NULL,
    ai_analysis TEXT,
    code_evaluation TEXT,
    common_mistakes TEXT,
    suggestions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SQL知识点表
CREATE TABLE IF NOT EXISTS sql_knowledge_points (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    common_mistakes TEXT,
    examples TEXT,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户知识点学习进度表
CREATE TABLE IF NOT EXISTS user_knowledge_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    knowledge_point_id INTEGER REFERENCES sql_knowledge_points(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    score INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, knowledge_point_id)
);

-- 统计数据表
CREATE TABLE IF NOT EXISTS platform_statistics (
    id SERIAL PRIMARY KEY,
    stat_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    total_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    new_comments INTEGER DEFAULT 0,
    ai_responses_count INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sql_history_user_id ON user_sql_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_comment_id ON ai_responses(comment_id);

-- 插入默认的SQL知识点数据
INSERT INTO sql_knowledge_points (category, title, content, difficulty, common_mistakes, examples) VALUES
('基础查询', 'SELECT语句基础', 'SELECT语句是SQL中最常用的语句，用于从数据库表中检索数据。基本语法：SELECT column1, column2 FROM table_name;', 'beginner', '1. 忘记写FROM子句\n2. 列名拼写错误\n3. 混淆*和具体列名的使用场景', 'SELECT * FROM users;\nSELECT username, email FROM users;'),
('条件查询', 'WHERE子句过滤', 'WHERE子句用于过滤记录，只返回满足指定条件的行。可以使用比较运算符(=, <>, <, >, <=, >=)和逻辑运算符(AND, OR, NOT)。', 'beginner', '1. 字符串值忘记加引号\n2. NULL值比较应用IS NULL而非=\n3. AND和OR优先级混淆', 'SELECT * FROM users WHERE age > 18;\nSELECT * FROM users WHERE name IS NOT NULL;'),
('排序分组', 'ORDER BY排序', 'ORDER BY子句用于对结果集进行排序。ASC表示升序(默认)，DESC表示降序。可以按多个列排序。', 'beginner', '1. 忘记指定排序方向\n2. 在ORDER BY中使用未选择的列\n3. 对NULL值排序的行为不了解', 'SELECT * FROM users ORDER BY created_at DESC;\nSELECT * FROM products ORDER BY price ASC, name DESC;'),
('聚合函数', 'COUNT, SUM, AVG等', '聚合函数用于对一组值进行计算并返回单个值。常用函数：COUNT()计数、SUM()求和、AVG()平均值、MAX()最大值、MIN()最小值。', 'intermediate', '1. COUNT(*)与COUNT(column)的区别\n2. 聚合函数中NULL值的处理\n3. 没有GROUP BY时使用聚合函数的限制', 'SELECT COUNT(*) FROM users;\nSELECT AVG(price) FROM products WHERE category = ''electronics'';'),
('表连接', 'JOIN连接操作', 'JOIN用于根据两个或多个表之间的相关列组合它们的数据。类型包括：INNER JOIN、LEFT JOIN、RIGHT JOIN、FULL JOIN。', 'intermediate', '1. 混淆不同JOIN类型的结果\n2. 忘记指定ON连接条件\n3. 多表连接时的性能问题', 'SELECT u.name, o.total FROM users u INNER JOIN orders o ON u.id = o.user_id;\nSELECT * FROM users u LEFT JOIN orders o ON u.id = o.user_id;'),
('子查询', '嵌套查询', '子查询是嵌套在另一个查询中的SELECT语句。可以用在SELECT、FROM、WHERE子句中。', 'advanced', '1. 子查询返回多行时使用=而非IN\n2. 相关子查询的性能问题\n3. 子查询与JOIN的选择', 'SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE total > 100);\nSELECT name, (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS order_count FROM users u;'),
('数据修改', 'INSERT, UPDATE, DELETE', 'INSERT添加新记录，UPDATE修改现有记录，DELETE删除记录。这些操作会修改数据库中的数据。', 'beginner', '1. INSERT时列数与值数不匹配\n2. UPDATE/DELETE忘记WHERE条件导致全表操作\n3. 违反约束条件', 'INSERT INTO users (name, email) VALUES (''张三'', ''zhang@example.com'');\nUPDATE users SET status = ''active'' WHERE id = 1;\nDELETE FROM users WHERE id = 1;'),
('索引优化', '创建和使用索引', '索引可以大大提高查询速度，但会降低写入速度。应该在经常用于查询条件的列上创建索引。', 'advanced', '1. 过度创建索引\n2. 在低基数列上创建索引\n3. 复合索引的列顺序问题', 'CREATE INDEX idx_users_email ON users(email);\nCREATE UNIQUE INDEX idx_users_username ON users(username);')
ON CONFLICT DO NOTHING;
`;

// 初始化函数
async function initDatabase() {
  console.log('🚀 开始初始化数据库...\n');
  
  try {
    // 先删除旧表
    console.log('🗑️ 清理旧数据表...');
    await pool.query(dropTablesSQL);
    console.log('✅ 旧表清理完成！\n');
    
    // 执行建表SQL
    console.log('📦 创建新数据表...');
    await pool.query(createTablesSQL);
    console.log('✅ 数据表创建成功！');
    
    // 验证表创建
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 已创建的数据表:');
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    
    // 检查知识点数据
    const knowledgeCount = await pool.query('SELECT COUNT(*) FROM sql_knowledge_points');
    console.log(`\n📚 SQL知识点数量: ${knowledgeCount.rows[0].count}`);
    
    console.log('\n✨ 数据库初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// 运行初始化
initDatabase()
  .then(() => {
    console.log('\n🎉 可以开始使用SQL学习平台了！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 初始化过程中出现错误:', error);
    process.exit(1);
  });

