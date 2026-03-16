const { query } = require('../config/database');

const project1NewExercises = [
  {
    project_code: 'exercise1',
    title: '排序查询（ORDER BY）',
    description: '【场景】西区大棚数据追溯\n\n查询西区大棚的所有监测记录，按监测时间降序排列（最新数据优先）。',
    difficulty: 'intermediate',
    category: '排序查询',
    hint: '使用 WHERE 过滤 location，再用 ORDER BY monitor_time DESC 降序排列。',
    correct_sql: "SELECT * FROM sensor_monitor WHERE location = '西区大棚' ORDER BY monitor_time DESC",
    expected_result_description: '返回西区大棚记录（按时间降序）',
    knowledge_point: '查询结果排序',
    order_index: 7,
  },
  {
    project_code: 'exercise1',
    title: '聚合函数查询（AVG / MAX / COUNT）',
    description: '【场景】东区农田环境趋势分析\n\n统计东区农田温度监测的平均值、最高值和记录总数。',
    difficulty: 'intermediate',
    category: '聚合函数',
    hint: '使用 AVG(monitor_value)、MAX(monitor_value)、COUNT(*) 三个聚合函数，WHERE 过滤 location 和 monitor_type。',
    correct_sql: "SELECT AVG(monitor_value) AS avg_temp, MAX(monitor_value) AS max_temp, COUNT(*) AS record_count FROM sensor_monitor WHERE location = '东区农田' AND monitor_type = '温度'",
    expected_result_description: '返回平均温度、最高温度、记录总数',
    knowledge_point: '使用集函数',
    order_index: 8,
  },
  {
    project_code: 'exercise1',
    title: '多重条件组合查询',
    description: '【场景】跨区域异常排查\n\n查询 2025 年 11 月 2 日期间，南区果园或北区菜地的正常状态监测记录。',
    difficulty: 'intermediate',
    category: '多重条件组合',
    hint: "使用 WHERE 组合 monitor_time 日期范围、(location = '南区果园' OR location = '北区菜地') 和 status = '正常'，注意 OR 条件需用括号。",
    correct_sql: "SELECT * FROM sensor_monitor WHERE monitor_time >= '2025-11-02 00:00:00' AND monitor_time < '2025-11-03 00:00:00' AND (location = '南区果园' OR location = '北区菜地') AND status = '正常'",
    expected_result_description: '返回指定日期指定区域的正常记录',
    knowledge_point: '选择元组-多重条件',
    order_index: 9,
  },
];

async function ensureExerciseSeeds() {
  try {
    const exists = await query(`SELECT to_regclass('public.exercises') AS name`);
    if (!exists.rows[0]?.name) {
      console.log('ℹ️ exercises 表不存在，跳过自动补题');
      return;
    }

    for (const ex of project1NewExercises) {
      const existing = await query(
        `SELECT id FROM exercises WHERE project_code = $1 AND order_index = $2 LIMIT 1`,
        [ex.project_code, ex.order_index]
      );

      if (existing.rows.length > 0) {
        continue;
      }

      await query(
        `INSERT INTO exercises (project_code, title, description, difficulty, category, hint, correct_sql, expected_result_description, knowledge_point, order_index)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          ex.project_code,
          ex.title,
          ex.description,
          ex.difficulty,
          ex.category,
          ex.hint,
          ex.correct_sql,
          ex.expected_result_description,
          ex.knowledge_point,
          ex.order_index,
        ]
      );
    }

    const count = await query(`SELECT COUNT(*)::int AS total FROM exercises WHERE project_code = 'exercise1'`);
    console.log(`✅ 项目一题库补齐检查完成，当前题目数: ${count.rows[0].total}`);
  } catch (error) {
    console.error('❌ 自动补题失败:', error.message);
  }
}

module.exports = {
  ensureExerciseSeeds,
};
