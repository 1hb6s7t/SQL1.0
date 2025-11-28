/**
 * 例题模型
 * 处理例题和答题相关的数据库操作
 */

const { query } = require('../config/database');

class Exercise {
  /**
   * 获取所有例题
   */
  static async getAll() {
    const sql = `
      SELECT id, title, description, difficulty, category, hint, order_index, created_at
      FROM exercises
      ORDER BY order_index ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * 根据ID获取例题详情
   */
  static async getById(id) {
    const sql = `
      SELECT * FROM exercises WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * 根据分类获取例题
   */
  static async getByCategory(category) {
    const sql = `
      SELECT id, title, description, difficulty, category, hint, order_index
      FROM exercises
      WHERE category = $1
      ORDER BY order_index ASC
    `;
    const result = await query(sql, [category]);
    return result.rows;
  }

  /**
   * 获取所有分类
   */
  static async getCategories() {
    const sql = `
      SELECT DISTINCT category FROM exercises ORDER BY category
    `;
    const result = await query(sql);
    return result.rows.map(row => row.category);
  }

  /**
   * 执行用户SQL并获取结果
   */
  static async executeUserSQL(userSQL) {
    try {
      // 安全检查：只允许 SELECT 语句
      const trimmedSQL = userSQL.trim().toUpperCase();
      if (!trimmedSQL.startsWith('SELECT')) {
        return {
          success: false,
          error: '只允许执行 SELECT 查询语句',
          rows: []
        };
      }

      // 检查危险关键字
      const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'CREATE'];
      for (const keyword of dangerousKeywords) {
        if (trimmedSQL.includes(keyword)) {
          return {
            success: false,
            error: `不允许使用 ${keyword} 操作`,
            rows: []
          };
        }
      }

      const result = await query(userSQL);
      return {
        success: true,
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields ? result.fields.map(f => f.name) : []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        rows: []
      };
    }
  }

  /**
   * 执行正确答案SQL获取预期结果
   */
  static async executeCorrectSQL(exerciseId) {
    const exercise = await this.getById(exerciseId);
    if (!exercise) {
      return { success: false, error: '例题不存在' };
    }

    try {
      const result = await query(exercise.correct_sql);
      return {
        success: true,
        rows: result.rows,
        rowCount: result.rowCount
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 比较用户答案和正确答案
   */
  static async compareResults(userSQL, exerciseId) {
    // 获取用户SQL执行结果
    const userResult = await this.executeUserSQL(userSQL);
    if (!userResult.success) {
      return {
        isCorrect: false,
        userResult,
        message: `SQL执行错误: ${userResult.error}`
      };
    }

    // 获取正确答案执行结果
    const correctResult = await this.executeCorrectSQL(exerciseId);
    if (!correctResult.success) {
      return {
        isCorrect: false,
        message: '获取正确答案失败'
      };
    }

    // 比较结果
    const isCorrect = this.compareResultSets(userResult.rows, correctResult.rows);

    return {
      isCorrect,
      userResult,
      correctResult,
      message: isCorrect ? '恭喜你，答案正确！' : '答案不正确，请再试试'
    };
  }

  /**
   * 比较两个结果集是否相同
   */
  static compareResultSets(userRows, correctRows) {
    // 行数不同
    if (userRows.length !== correctRows.length) {
      return false;
    }

    // 空结果
    if (userRows.length === 0) {
      return true;
    }

    // 将结果转为字符串进行比较（忽略顺序和列名大小写）
    const normalizeRow = (row) => {
      const values = Object.values(row).map(v => 
        v === null ? 'NULL' : String(v).trim()
      );
      return values.sort().join('|');
    };

    const userSet = new Set(userRows.map(normalizeRow));
    const correctSet = new Set(correctRows.map(normalizeRow));

    if (userSet.size !== correctSet.size) {
      return false;
    }

    for (const item of userSet) {
      if (!correctSet.has(item)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 保存用户答题记录
   */
  static async saveSubmission(userId, exerciseId, userSQL, isCorrect, aiFeedback = null) {
    // 检查是否已有答题记录
    const existingSQL = `
      SELECT id, attempt_count FROM exercise_submissions
      WHERE user_id = $1 AND exercise_id = $2
    `;
    const existing = await query(existingSQL, [userId, exerciseId]);

    if (existing.rows.length > 0) {
      // 更新现有记录
      const updateSQL = `
        UPDATE exercise_submissions
        SET user_sql = $1, is_correct = $2, ai_feedback = $3, 
            attempt_count = attempt_count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $4 AND exercise_id = $5
        RETURNING *
      `;
      const result = await query(updateSQL, [userSQL, isCorrect, aiFeedback, userId, exerciseId]);
      return result.rows[0];
    } else {
      // 创建新记录
      const insertSQL = `
        INSERT INTO exercise_submissions (user_id, exercise_id, user_sql, is_correct, ai_feedback)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const result = await query(insertSQL, [userId, exerciseId, userSQL, isCorrect, aiFeedback]);
      return result.rows[0];
    }
  }

  /**
   * 获取用户的答题进度
   */
  static async getUserProgress(userId) {
    const sql = `
      SELECT 
        e.id, e.title, e.difficulty, e.category,
        es.is_correct, es.attempt_count, es.updated_at
      FROM exercises e
      LEFT JOIN exercise_submissions es ON e.id = es.exercise_id AND es.user_id = $1
      ORDER BY e.order_index ASC
    `;
    const result = await query(sql, [userId]);
    return result.rows;
  }

  /**
   * 获取用户某道题的答题记录
   */
  static async getSubmission(userId, exerciseId) {
    const sql = `
      SELECT * FROM exercise_submissions
      WHERE user_id = $1 AND exercise_id = $2
    `;
    const result = await query(sql, [userId, exerciseId]);
    return result.rows[0];
  }

  /**
   * 获取练习数据库的表结构信息
   */
  static async getTableSchema() {
    return {
      tables: [
        {
          name: 'Student',
          actualName: 'practice_student',
          description: '学生信息表',
          columns: [
            { name: 'Sno', type: 'CHAR(10)', description: '学号（主键）' },
            { name: 'Sname', type: 'CHAR(20)', description: '姓名' },
            { name: 'Ssex', type: 'CHAR(2)', description: '性别' },
            { name: 'Sage', type: 'INT', description: '年龄' },
            { name: 'Sdept', type: 'CHAR(20)', description: '所在系' }
          ]
        },
        {
          name: 'Course',
          actualName: 'practice_course',
          description: '课程信息表',
          columns: [
            { name: 'Cno', type: 'CHAR(4)', description: '课程号（主键）' },
            { name: 'Cname', type: 'CHAR(40)', description: '课程名' },
            { name: 'Cpno', type: 'CHAR(4)', description: '先修课程号' },
            { name: 'Ccredit', type: 'SMALLINT', description: '学分' }
          ]
        },
        {
          name: 'SC',
          actualName: 'practice_sc',
          description: '选课成绩表',
          columns: [
            { name: 'Sno', type: 'CHAR(10)', description: '学号（外键）' },
            { name: 'Cno', type: 'CHAR(4)', description: '课程号（外键）' },
            { name: 'Grade', type: 'INT', description: '成绩' }
          ]
        }
      ],
      note: '注意：实际查询时请使用 practice_student, practice_course, practice_sc 作为表名'
    };
  }
}

module.exports = Exercise;

