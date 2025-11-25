/**
 * SQL知识点模型
 * 处理SQL知识点相关的数据库操作
 */

const { query } = require('../config/database');

class Knowledge {
  /**
   * 获取所有知识点
   */
  static async getAll(category = null, difficulty = null) {
    let sql = `
      SELECT * FROM sql_knowledge_points
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;
    
    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    
    if (difficulty) {
      sql += ` AND difficulty = $${paramIndex++}`;
      params.push(difficulty);
    }
    
    sql += ' ORDER BY id';
    
    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * 通过ID获取知识点
   */
  static async findById(id) {
    const sql = 'SELECT * FROM sql_knowledge_points WHERE id = $1';
    const result = await query(sql, [id]);
    
    // 增加浏览次数
    if (result.rows[0]) {
      await query('UPDATE sql_knowledge_points SET view_count = view_count + 1 WHERE id = $1', [id]);
    }
    
    return result.rows[0];
  }

  /**
   * 获取所有分类
   */
  static async getCategories() {
    const sql = `
      SELECT DISTINCT category, COUNT(*) as count
      FROM sql_knowledge_points
      GROUP BY category
      ORDER BY category
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * 搜索知识点
   */
  static async search(keyword) {
    const sql = `
      SELECT * FROM sql_knowledge_points
      WHERE title ILIKE $1 OR content ILIKE $1 OR common_mistakes ILIKE $1
      ORDER BY view_count DESC
    `;
    const result = await query(sql, [`%${keyword}%`]);
    return result.rows;
  }

  /**
   * 获取热门知识点
   */
  static async getPopular(limit = 5) {
    const sql = `
      SELECT * FROM sql_knowledge_points
      ORDER BY view_count DESC
      LIMIT $1
    `;
    const result = await query(sql, [limit]);
    return result.rows;
  }

  /**
   * 创建知识点（管理员功能）
   */
  static async create({ category, title, content, difficulty, commonMistakes, examples }) {
    const sql = `
      INSERT INTO sql_knowledge_points (category, title, content, difficulty, common_mistakes, examples)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await query(sql, [category, title, content, difficulty, commonMistakes, examples]);
    return result.rows[0];
  }

  /**
   * 更新知识点（管理员功能）
   */
  static async update(id, { category, title, content, difficulty, commonMistakes, examples }) {
    const sql = `
      UPDATE sql_knowledge_points
      SET category = COALESCE($1, category),
          title = COALESCE($2, title),
          content = COALESCE($3, content),
          difficulty = COALESCE($4, difficulty),
          common_mistakes = COALESCE($5, common_mistakes),
          examples = COALESCE($6, examples),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const result = await query(sql, [category, title, content, difficulty, commonMistakes, examples, id]);
    return result.rows[0];
  }

  /**
   * 删除知识点（管理员功能）
   */
  static async delete(id) {
    const sql = 'DELETE FROM sql_knowledge_points WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * 记录用户学习进度
   */
  static async recordProgress(userId, knowledgePointId, score) {
    const sql = `
      INSERT INTO user_knowledge_progress (user_id, knowledge_point_id, score, is_completed, completed_at)
      VALUES ($1, $2, $3, $4, CASE WHEN $4 THEN CURRENT_TIMESTAMP ELSE NULL END)
      ON CONFLICT (user_id, knowledge_point_id) 
      DO UPDATE SET 
        score = GREATEST(user_knowledge_progress.score, $3),
        is_completed = user_knowledge_progress.is_completed OR $4,
        completed_at = CASE WHEN $4 AND user_knowledge_progress.completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE user_knowledge_progress.completed_at END
      RETURNING *
    `;
    const isCompleted = score >= 80;
    const result = await query(sql, [userId, knowledgePointId, score, isCompleted]);
    return result.rows[0];
  }

  /**
   * 获取用户学习进度
   */
  static async getUserProgress(userId) {
    const sql = `
      SELECT 
        kp.*,
        ukp.score,
        ukp.is_completed,
        ukp.completed_at
      FROM sql_knowledge_points kp
      LEFT JOIN user_knowledge_progress ukp ON kp.id = ukp.knowledge_point_id AND ukp.user_id = $1
      ORDER BY kp.id
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  /**
   * 获取常见易错知识点总结
   */
  static async getCommonMistakesSummary() {
    const sql = `
      SELECT category, title, common_mistakes
      FROM sql_knowledge_points
      WHERE common_mistakes IS NOT NULL AND common_mistakes != ''
      ORDER BY view_count DESC
    `;
    const result = await query(sql);
    return result.rows;
  }
}

module.exports = Knowledge;

