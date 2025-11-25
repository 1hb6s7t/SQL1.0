/**
 * 用户模型
 * 处理用户相关的数据库操作
 */

const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  /**
   * 创建新用户
   */
  static async create({ username, email, password }) {
    const uuid = uuidv4();
    const passwordHash = await bcrypt.hash(password, 12);
    
    const sql = `
      INSERT INTO users (uuid, username, email, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, uuid, username, email, role, is_active, created_at
    `;
    
    const result = await query(sql, [uuid, username, email, passwordHash]);
    
    // 为新用户创建初始学习记录
    if (result.rows[0]) {
      await this.initUserLearningData(result.rows[0].id);
    }
    
    return result.rows[0];
  }

  /**
   * 初始化用户学习数据
   */
  static async initUserLearningData(userId) {
    const sql = `
      INSERT INTO user_learning_records (user_id, sql_topic, content)
      VALUES ($1, '欢迎学习', '开始您的SQL学习之旅！')
    `;
    await query(sql, [userId]);
  }

  /**
   * 通过邮箱查找用户
   */
  static async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = $1 AND is_active = true`;
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  /**
   * 通过用户名查找用户
   */
  static async findByUsername(username) {
    const sql = `SELECT * FROM users WHERE username = $1 AND is_active = true`;
    const result = await query(sql, [username]);
    return result.rows[0];
  }

  /**
   * 通过ID查找用户
   */
  static async findById(id) {
    const sql = `
      SELECT id, uuid, username, email, avatar_url, role, is_active, created_at, last_login
      FROM users WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * 通过UUID查找用户
   */
  static async findByUuid(uuid) {
    const sql = `
      SELECT id, uuid, username, email, avatar_url, role, is_active, created_at, last_login
      FROM users WHERE uuid = $1
    `;
    const result = await query(sql, [uuid]);
    return result.rows[0];
  }

  /**
   * 验证密码
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 更新最后登录时间
   */
  static async updateLastLogin(userId) {
    const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`;
    await query(sql, [userId]);
  }

  /**
   * 更新用户信息
   */
  static async update(userId, { username, email, avatarUrl }) {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (username) {
      updates.push(`username = $${paramIndex++}`);
      values.push(username);
    }
    if (email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(avatarUrl);
    }

    if (updates.length === 0) return null;

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const sql = `
      UPDATE users SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, uuid, username, email, avatar_url, role, created_at
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * 修改密码
   */
  static async changePassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const sql = `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`;
    await query(sql, [passwordHash, userId]);
  }

  /**
   * 获取用户学习统计
   */
  static async getLearningStats(userId) {
    const sql = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN is_correct = true THEN 1 END) as correct_count,
        COUNT(DISTINCT sql_topic) as topics_learned
      FROM user_learning_records
      WHERE user_id = $1
    `;
    const result = await query(sql, [userId]);
    return result.rows[0];
  }

  /**
   * 获取用户SQL操作历史
   */
  static async getSqlHistory(userId, limit = 20) {
    const sql = `
      SELECT * FROM user_sql_history
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await query(sql, [userId, limit]);
    return result.rows;
  }

  /**
   * 记录用户SQL操作
   */
  static async recordSqlExecution(userId, sqlQuery, result, isSuccess, executionTime) {
    const sql = `
      INSERT INTO user_sql_history (user_id, sql_query, execution_result, is_success, execution_time_ms)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const queryResult = await query(sql, [userId, sqlQuery, JSON.stringify(result), isSuccess, executionTime]);
    return queryResult.rows[0];
  }

  /**
   * 获取所有用户（管理员功能）
   */
  static async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT id, uuid, username, email, role, is_active, created_at, last_login
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await query(sql, [limit, offset]);
    
    const countResult = await query('SELECT COUNT(*) FROM users');
    
    return {
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }
}

module.exports = User;

