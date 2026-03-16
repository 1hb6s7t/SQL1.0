/**
 * 项目模型
 */
const { query } = require('../config/database');

class Exercise {
  static async getAll(projectCode = null) {
    let sql = `SELECT id, project_code, title, description, difficulty, category, hint, order_index, created_at FROM exercises`;
    const params = [];
    if (projectCode) {
      sql += ` WHERE project_code = $1`;
      params.push(projectCode);
    }
    sql += ` ORDER BY order_index ASC`;
    const result = await query(sql, params);
    return result.rows;
  }

  static async getById(id) {
    const result = await query(`SELECT * FROM exercises WHERE id = $1`, [id]);
    return result.rows[0];
  }

  static async getCategories(projectCode = null) {
    let sql = `SELECT DISTINCT category FROM exercises`;
    const params = [];
    if (projectCode) {
      sql += ` WHERE project_code = $1`;
      params.push(projectCode);
    }
    sql += ` ORDER BY category`;
    const result = await query(sql, params);
    return result.rows.map(r => r.category);
  }

  static async executeUserSQL(userSQL) {
    try {
      const sql = userSQL.trim();
      const normalizedSQL = sql.replace(/\s+/g, ' ').trim();
      const upperSQL = normalizedSQL.toUpperCase();

      if (!sql) {
        return { success: false, error: '请输入 SQL 语句', rows: [] };
      }

      const strippedSQL = normalizedSQL.replace(/;\s*$/, '');
      if (strippedSQL.includes(';')) {
        return { success: false, error: '仅支持执行单条 SQL 语句', rows: [] };
      }

      const isSelectQuery = /^SELECT\b/i.test(normalizedSQL);
      const isCreateViewQuery = /^CREATE\s+(OR\s+REPLACE\s+)?VIEW\b/i.test(normalizedSQL);

      if (!isSelectQuery && !isCreateViewQuery) {
        return { success: false, error: '当前编辑区仅允许执行 SELECT 查询或 CREATE VIEW 语句', rows: [] };
      }

      const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE'];
      for (const keyword of dangerousKeywords) {
        if (upperSQL.includes(keyword)) {
          return { success: false, error: `不允许使用 ${keyword} 操作`, rows: [] };
        }
      }

      if (isCreateViewQuery) {
        const hasAsSelect = /^CREATE\s+(OR\s+REPLACE\s+)?VIEW\s+[A-Z0-9_".]+\s*(\([^)]*\))?\s+AS\s+SELECT\b/i.test(normalizedSQL);
        if (!hasAsSelect) {
          return { success: false, error: 'CREATE VIEW 语句格式不正确，需使用 CREATE VIEW ... AS SELECT ...', rows: [] };
        }

        const executableSQL = /^CREATE\s+VIEW\b/i.test(sql)
          ? sql.replace(/^CREATE\s+VIEW\b/i, 'CREATE OR REPLACE VIEW')
          : sql;

        await query(executableSQL);
        return {
          success: true,
          rows: [],
          rowCount: 0,
          fields: [],
          message: '视图创建成功，现在可以继续使用 SELECT 查询该视图'
        };
      }

      const result = await query(sql);
      return {
        success: true,
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields ? result.fields.map(f => f.name) : []
      };
    } catch (error) {
      return { success: false, error: error.message, rows: [] };
    }
  }

  static extractCreatedViewName(userSQL) {
    const normalizedSQL = userSQL.trim().replace(/\s+/g, ' ');
    const match = normalizedSQL.match(/^CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+([A-Za-z_][A-Za-z0-9_$]*|"[^"]+")/i);
    return match ? match[1] : null;
  }

  static async executeCorrectSQL(exerciseId) {
    const exercise = await this.getById(exerciseId);
    if (!exercise) return { success: false, error: '项目不存在' };
    try {
      const result = await query(exercise.correct_sql);
      return { success: true, rows: result.rows, rowCount: result.rowCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static compareResultSets(userRows, correctRows) {
    if (userRows.length !== correctRows.length) return false;
    if (userRows.length === 0) return true;
    const normalizeRow = row => Object.values(row).map(v => v === null ? 'NULL' : String(v).trim()).sort().join('|');
    const userSet = new Set(userRows.map(normalizeRow));
    const correctSet = new Set(correctRows.map(normalizeRow));
    if (userSet.size !== correctSet.size) return false;
    for (const item of userSet) if (!correctSet.has(item)) return false;
    return true;
  }

  static async compareResults(userSQL, exerciseId) {
    const userResult = await this.executeUserSQL(userSQL);
    if (!userResult.success) {
      return { isCorrect: false, userResult, message: `SQL执行错误: ${userResult.error}` };
    }

    const correctResult = await this.executeCorrectSQL(exerciseId);
    if (!correctResult.success) {
      return { isCorrect: false, message: '获取正确答案失败' };
    }

    let comparableUserRows = userResult.rows;
    const createdViewName = this.extractCreatedViewName(userSQL);
    if (createdViewName) {
      try {
        const createdViewResult = await query(`SELECT * FROM ${createdViewName}`);
        comparableUserRows = createdViewResult.rows;
      } catch (error) {
        return { isCorrect: false, userResult, message: `视图已创建，但读取视图失败: ${error.message}` };
      }
    }

    const isCorrect = this.compareResultSets(comparableUserRows, correctResult.rows);
    return {
      isCorrect,
      userResult: { ...userResult, rows: comparableUserRows },
      correctResult,
      message: isCorrect ? '恭喜你，答案正确！' : '答案不正确，请再试试'
    };
  }

  static async saveSubmission(userId, exerciseId, userSQL, isCorrect, aiFeedback = null) {
    const existing = await query(`SELECT id, attempt_count FROM exercise_submissions WHERE user_id = $1 AND exercise_id = $2`, [userId, exerciseId]);
    if (existing.rows.length > 0) {
      const result = await query(`
        UPDATE exercise_submissions
        SET user_sql = $1, is_correct = $2, ai_feedback = $3, attempt_count = attempt_count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $4 AND exercise_id = $5
        RETURNING *
      `, [userSQL, isCorrect, aiFeedback, userId, exerciseId]);
      return result.rows[0];
    }
    const result = await query(`
      INSERT INTO exercise_submissions (user_id, exercise_id, user_sql, is_correct, ai_feedback)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, exerciseId, userSQL, isCorrect, aiFeedback]);
    return result.rows[0];
  }

  static async getUserProgress(userId, projectCode = null) {
    let sql = `
      SELECT e.id, e.project_code, e.title, e.difficulty, e.category, es.is_correct, es.attempt_count, es.updated_at
      FROM exercises e
      LEFT JOIN exercise_submissions es ON e.id = es.exercise_id AND es.user_id = $1
    `;
    const params = [userId];
    if (projectCode) {
      sql += ` WHERE e.project_code = $2`;
      params.push(projectCode);
    }
    sql += ` ORDER BY e.order_index ASC`;
    const result = await query(sql, params);
    return result.rows;
  }

  static async getSubmission(userId, exerciseId) {
    const result = await query(`SELECT * FROM exercise_submissions WHERE user_id = $1 AND exercise_id = $2`, [userId, exerciseId]);
    return result.rows[0];
  }

  static getProjectSchemas() {
    return {
      exercise1: {
        projectCode: 'exercise1',
        projectLabel: '项目一',
        projectName: '智慧农业传感器监测系统单表查询实战项目',
        projectDescription: '基于传感器监测单表，训练 SELECT、DISTINCT、WHERE、BETWEEN、LIKE、IS NULL、ORDER BY 与聚合函数等核心查询能力。',
        tables: [{
          name: 'sensor_monitor', actualName: 'sensor_monitor', description: '传感器监测记录表',
          columns: [
            { name: 'monitor_id', type: 'INT', description: '监测记录唯一ID' },
            { name: 'sensor_id', type: 'VARCHAR(20)', description: '传感器编号' },
            { name: 'monitor_type', type: 'VARCHAR(20)', description: '监测类型' },
            { name: 'monitor_value', type: 'DECIMAL(6,2)', description: '监测数值' },
            { name: 'monitor_time', type: 'TIMESTAMP', description: '监测时间' },
            { name: 'location', type: 'VARCHAR(30)', description: '安装位置' },
            { name: 'status', type: 'VARCHAR(10)', description: '状态' }
          ]
        }],
        sampleData: [
          { sensor_id: 'S202501', monitor_type: '温度', monitor_value: 25.3, location: '东区农田', status: '正常' },
          { sensor_id: 'S202504', monitor_type: '温度', monitor_value: 32.1, location: '南区果园', status: '异常' },
          { sensor_id: 'S202505', monitor_type: '土壤含水量', monitor_value: 18.3, location: '西区大棚', status: null }
        ],
        knowledgePoints: ['选择列', 'DISTINCT', 'WHERE 条件过滤', 'BETWEEN 范围查询', 'LIKE 模糊查询', 'IS NULL 空值判断', 'ORDER BY 排序', '聚合函数（AVG/MAX/COUNT）', '多重条件组合查询'],
        note: '项目一保留原单表查询训练内容。'
      },
      exercise2: {
        projectCode: 'exercise2',
        projectLabel: '项目二',
        projectName: '智能制造设备管理系统视图应用实战项目',
        projectDescription: '基于设备基础表与运行日志表，训练视图定义、视图查询、表达式计算、分组统计与基于视图再次筛选。',
        tables: [
          {
            name: 'equipment', actualName: 'equipment', description: '设备基础信息表',
            columns: [
              { name: 'equip_id', type: 'VARCHAR(20)', description: '设备编号（主键）' },
              { name: 'equip_name', type: 'VARCHAR(30)', description: '设备名称' },
              { name: 'workshop', type: 'VARCHAR(20)', description: '所属车间' },
              { name: 'status', type: 'VARCHAR(10)', description: '设备状态' },
              { name: 'purchase_year', type: 'INT', description: '采购年份' }
            ]
          },
          {
            name: 'equip_run_log', actualName: 'equip_run_log', description: '设备运行日志表',
            columns: [
              { name: 'log_id', type: 'INT', description: '日志ID' },
              { name: 'equip_id', type: 'VARCHAR(20)', description: '设备编号' },
              { name: 'run_hours', type: 'DECIMAL(5,2)', description: '当日运行时长' },
              { name: 'production_num', type: 'INT', description: '当日合格产品数' },
              { name: 'run_date', type: 'VARCHAR(10)', description: '运行日期' }
            ]
          }
        ],
        sampleData: [
          { equip_id: 'DEV202501', equip_name: '数控机床', workshop: 'W01', status: '正常', purchase_year: 2023 },
          { equip_id: 'DEV202504', equip_name: '激光切割机', workshop: 'W02', status: '正常', purchase_year: 2024 },
          { equip_id: 'DEV202505', equip_name: '分拣机', workshop: 'W01', status: '闲置', purchase_year: 2024 }
        ],
        knowledgePoints: ['行列子集视图', 'CHECK OPTION', '表达式视图', '分组视图', '基于视图的视图', '视图查询与删除'],
        note: '项目二新增为并列项目，不覆盖原项目一。'
      }
    };
  }

  static async getTableSchema(projectCode = 'exercise1') {
    return this.getProjectSchemas()[projectCode] || this.getProjectSchemas().exercise1;
  }
}

module.exports = Exercise;
