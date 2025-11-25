/**
 * 评论模型
 * 处理评论相关的数据库操作
 */

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Comment {
  /**
   * 创建评论
   */
  static async create({ userId, parentId, content, codeSnippet, isAiReply = false }) {
    const uuid = uuidv4();
    
    const sql = `
      INSERT INTO comments (uuid, user_id, parent_id, content, code_snippet, is_ai_reply)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await query(sql, [uuid, userId, parentId, content, codeSnippet, isAiReply]);
    return result.rows[0];
  }

  /**
   * 获取评论列表（带分页和用户信息）
   */
  static async getAll(page = 1, limit = 20, parentId = null) {
    const offset = (page - 1) * limit;
    
    let sql;
    let params;
    
    if (parentId === null) {
      // 获取顶级评论
      sql = `
        SELECT 
          c.*,
          u.username,
          u.avatar_url,
          u.role as user_role,
          (SELECT COUNT(*) FROM comments WHERE parent_id = c.id AND is_deleted = false) as reply_count
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.parent_id IS NULL AND c.is_deleted = false
        ORDER BY c.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      params = [limit, offset];
    } else {
      // 获取某评论的回复
      sql = `
        SELECT 
          c.*,
          u.username,
          u.avatar_url,
          u.role as user_role,
          (SELECT COUNT(*) FROM comments WHERE parent_id = c.id AND is_deleted = false) as reply_count
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = $1 AND c.is_deleted = false
        ORDER BY c.created_at ASC
        LIMIT $2 OFFSET $3
      `;
      params = [parentId, limit, offset];
    }
    
    const result = await query(sql, params);
    
    // 获取总数
    let countSql;
    let countParams;
    
    if (parentId === null) {
      countSql = 'SELECT COUNT(*) FROM comments WHERE parent_id IS NULL AND is_deleted = false';
      countParams = [];
    } else {
      countSql = 'SELECT COUNT(*) FROM comments WHERE parent_id = $1 AND is_deleted = false';
      countParams = [parentId];
    }
    
    const countResult = await query(countSql, countParams);
    
    return {
      comments: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  /**
   * 通过ID获取评论
   */
  static async findById(id) {
    const sql = `
      SELECT 
        c.*,
        u.username,
        u.avatar_url,
        u.role as user_role
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1 AND c.is_deleted = false
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * 通过UUID获取评论
   */
  static async findByUuid(uuid) {
    const sql = `
      SELECT 
        c.*,
        u.username,
        u.avatar_url,
        u.role as user_role
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.uuid = $1 AND c.is_deleted = false
    `;
    const result = await query(sql, [uuid]);
    return result.rows[0];
  }

  /**
   * 更新评论
   */
  static async update(id, userId, content, codeSnippet) {
    const sql = `
      UPDATE comments 
      SET content = $1, code_snippet = $2, is_edited = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND user_id = $4 AND is_deleted = false
      RETURNING *
    `;
    const result = await query(sql, [content, codeSnippet, id, userId]);
    return result.rows[0];
  }

  /**
   * 删除评论（软删除）
   */
  static async delete(id, userId) {
    const sql = `
      UPDATE comments 
      SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    const result = await query(sql, [id, userId]);
    return result.rows[0];
  }

  /**
   * 点赞评论
   */
  static async like(commentId, userId) {
    // 检查是否已点赞
    const checkSql = 'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2';
    const checkResult = await query(checkSql, [commentId, userId]);
    
    if (checkResult.rows.length > 0) {
      // 取消点赞
      await query('DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2', [commentId, userId]);
      await query('UPDATE comments SET likes_count = likes_count - 1 WHERE id = $1', [commentId]);
      return { liked: false };
    } else {
      // 添加点赞
      await query('INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)', [commentId, userId]);
      await query('UPDATE comments SET likes_count = likes_count + 1 WHERE id = $1', [commentId]);
      return { liked: true };
    }
  }

  /**
   * 检查用户是否已点赞
   */
  static async hasLiked(commentId, userId) {
    const sql = 'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2';
    const result = await query(sql, [commentId, userId]);
    return result.rows.length > 0;
  }

  /**
   * 获取用户的评论
   */
  static async getByUserId(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT * FROM comments
      WHERE user_id = $1 AND is_deleted = false
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await query(sql, [userId, limit, offset]);
    
    const countResult = await query(
      'SELECT COUNT(*) FROM comments WHERE user_id = $1 AND is_deleted = false',
      [userId]
    );
    
    return {
      comments: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  /**
   * 获取包含SQL代码的评论（用于AI分析）
   */
  static async getWithCode(limit = 10) {
    const sql = `
      SELECT 
        c.*,
        u.username
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.code_snippet IS NOT NULL 
        AND c.code_snippet != ''
        AND c.is_deleted = false
      ORDER BY c.created_at DESC
      LIMIT $1
    `;
    const result = await query(sql, [limit]);
    return result.rows;
  }

  /**
   * 获取评论及其所有回复（树形结构）
   */
  static async getWithReplies(commentId) {
    const sql = `
      WITH RECURSIVE comment_tree AS (
        SELECT 
          c.*,
          u.username,
          u.avatar_url,
          0 as depth
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id = $1 AND c.is_deleted = false
        
        UNION ALL
        
        SELECT 
          c.*,
          u.username,
          u.avatar_url,
          ct.depth + 1
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        JOIN comment_tree ct ON c.parent_id = ct.id
        WHERE c.is_deleted = false
      )
      SELECT * FROM comment_tree ORDER BY depth, created_at
    `;
    const result = await query(sql, [commentId]);
    return result.rows;
  }

  /**
   * 获取最新评论
   */
  static async getRecent(limit = 5) {
    const sql = `
      SELECT 
        c.*,
        u.username,
        u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.is_deleted = false
      ORDER BY c.created_at DESC
      LIMIT $1
    `;
    const result = await query(sql, [limit]);
    return result.rows;
  }
}

module.exports = Comment;

