/**
 * 初始化例题数据库 - 智慧农业传感器监测系统
 * 运行: node backend/src/scripts/initExercises.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { query, pool } = require('../config/database');

async function initExercises() {
  try {
    console.log('🚀 开始初始化智慧农业传感器监测系统例题数据库...\n');

    // 1. 删除已存在的表（如果有）
    console.log('🗑️  清理旧数据表...');
    await query('DROP TABLE IF EXISTS exercise_submissions CASCADE');
    await query('DROP TABLE IF EXISTS exercises CASCADE');
    await query('DROP TABLE IF EXISTS sensor_monitor CASCADE');
    // 同时清理旧的学生-课程表（如果存在）
    await query('DROP TABLE IF EXISTS practice_sc CASCADE');
    await query('DROP TABLE IF EXISTS practice_course CASCADE');
    await query('DROP TABLE IF EXISTS practice_student CASCADE');
    console.log('  ✓ 旧表清理完成');

    // 2. 创建传感器监测表
    console.log('\n📦 创建传感器监测数据表...');
    await query(`
      CREATE TABLE sensor_monitor (
        monitor_id SERIAL PRIMARY KEY,
        sensor_id VARCHAR(20) NOT NULL,
        monitor_type VARCHAR(20) NOT NULL,
        monitor_value DECIMAL(6,2) NOT NULL,
        monitor_time TIMESTAMP NOT NULL,
        location VARCHAR(30) NOT NULL,
        status VARCHAR(10) NULL
      )
    `);
    console.log('  ✓ sensor_monitor 表创建成功');

    // 3. 插入传感器监测数据
    console.log('\n📝 插入传感器监测数据...');
    const sensorData = [
      ['S202501', '温度', 25.30, '2025-11-01 08:00:00', '东区农田', '正常'],
      ['S202502', '湿度', 65.20, '2025-11-01 08:00:00', '东区农田', '正常'],
      ['S202503', '土壤含水量', 22.50, '2025-11-01 09:00:00', '西区大棚', '正常'],
      ['S202501', '温度', 26.80, '2025-11-01 10:00:00', '东区农田', '正常'],
      ['S202504', '温度', 32.10, '2025-11-01 10:00:00', '南区果园', '异常'],
      ['S202502', '湿度', 58.70, '2025-11-01 11:00:00', '东区农田', '正常'],
      ['S202505', '土壤含水量', 18.30, '2025-11-01 11:00:00', '西区大棚', null],
      ['S202503', '土壤含水量', 23.10, '2025-11-02 08:00:00', '西区大棚', '正常'],
      ['S202506', '湿度', 45.90, '2025-11-02 09:00:00', '南区果园', '正常'],
      ['S202504', '温度', 33.50, '2025-11-02 10:00:00', '南区果园', '异常'],
      ['S202507', '温度', 24.70, '2025-11-02 10:00:00', '北区菜地', '正常'],
      ['S202508', '湿度', 72.30, '2025-11-02 11:00:00', '北区菜地', null]
    ];

    for (const data of sensorData) {
      await query(
        `INSERT INTO sensor_monitor (sensor_id, monitor_type, monitor_value, monitor_time, location, status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        data
      );
    }
    console.log(`  ✓ 插入 ${sensorData.length} 条传感器监测记录`);

    // 4. 创建例题表
    console.log('\n📋 创建例题表...');
    await query(`
      CREATE TABLE exercises (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        difficulty VARCHAR(20) DEFAULT 'beginner',
        category VARCHAR(50),
        hint TEXT,
        correct_sql TEXT NOT NULL,
        expected_result_description TEXT,
        knowledge_point TEXT,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ exercises 表创建成功');

    // 5. 创建学生答题记录表
    await query(`
      CREATE TABLE exercise_submissions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        exercise_id INT REFERENCES exercises(id),
        user_sql TEXT NOT NULL,
        is_correct BOOLEAN DEFAULT FALSE,
        ai_feedback TEXT,
        attempt_count INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ exercise_submissions 表创建成功');

    // 6. 插入智慧农业例题数据
    console.log('\n📝 插入智慧农业例题数据...');
    const exercises = [
      {
        title: '基础列选择查询',
        description: '【场景】农业运维基础数据统计\n\n查询所有监测记录的传感器编号、监测类型和数值。',
        difficulty: 'beginner',
        category: '选择列',
        hint: '使用 SELECT 列1, 列2, 列3 FROM 表名 的格式，选择指定的列',
        correct_sql: "SELECT sensor_id, monitor_type, monitor_value FROM sensor_monitor",
        expected_result_description: '应返回所有监测记录的传感器编号(sensor_id)、监测类型(monitor_type)和监测数值(monitor_value)',
        knowledge_point: '选择表中的若干列——指定目标列表达式，不查询冗余字段',
        order_index: 1
      },
      {
        title: '去重查询（DISTINCT）',
        description: '【场景】设备清单统计\n\n查询已部署的所有传感器编号（避免重复统计）。',
        difficulty: 'beginner',
        category: '去重查询',
        hint: '使用 DISTINCT 关键字消除重复行',
        correct_sql: "SELECT DISTINCT sensor_id FROM sensor_monitor",
        expected_result_description: '应返回所有不重复的传感器编号',
        knowledge_point: 'DISTINCT短语消除重复行，对应实际运维中设备清单统计需求',
        order_index: 2
      },
      {
        title: '比较条件查询',
        description: '【场景】农业高温预警筛选\n\n查询温度高于30℃的异常监测记录。',
        difficulty: 'beginner',
        category: '条件查询',
        hint: '使用 WHERE 子句配合比较运算符(>)和 AND 连接多个条件',
        correct_sql: "SELECT * FROM sensor_monitor WHERE monitor_type = '温度' AND monitor_value > 30",
        expected_result_description: '应返回所有温度监测类型且数值超过30的记录',
        knowledge_point: '比较运算符（>）+ 多重条件（AND），适配工程异常筛选场景',
        order_index: 3
      },
      {
        title: '范围查询（BETWEEN）',
        description: '【场景】适宜作物生长湿度筛选\n\n查询土壤含水量在20%~25%之间的正常记录，显示传感器编号、监测数值和位置。',
        difficulty: 'intermediate',
        category: '范围查询',
        hint: '使用 BETWEEN...AND... 谓词进行范围筛选',
        correct_sql: "SELECT sensor_id, monitor_value, location FROM sensor_monitor WHERE monitor_type = '土壤含水量' AND monitor_value BETWEEN 20 AND 25 AND status = '正常'",
        expected_result_description: '应返回土壤含水量在20-25之间且状态正常的记录的传感器编号、数值和位置',
        knowledge_point: 'BETWEEN...AND...谓词，精准筛选数值范围',
        order_index: 4
      },
      {
        title: '模糊查询（LIKE）',
        description: '【场景】特定编号和区域的传感器筛选\n\n查询编号以"S20250"开头且安装在"农田"区域的传感器记录。',
        difficulty: 'intermediate',
        category: '模糊查询',
        hint: '使用 LIKE 操作符，% 代表任意长度字符串',
        correct_sql: "SELECT * FROM sensor_monitor WHERE sensor_id LIKE 'S20250%' AND location LIKE '%农田%'",
        expected_result_description: '应返回传感器编号以S20250开头且位置包含"农田"的所有记录',
        knowledge_point: 'LIKE通配符（%），实现模糊匹配查询',
        order_index: 5
      },
      {
        title: '空值查询（IS NULL）',
        description: '【场景】运维故障排查\n\n查询设备状态为空（离线）的传感器监测记录，显示传感器编号、监测时间和位置。',
        difficulty: 'intermediate',
        category: '空值查询',
        hint: '使用 IS NULL 谓词判断空值，注意不能用 = NULL',
        correct_sql: "SELECT sensor_id, monitor_time, location FROM sensor_monitor WHERE status IS NULL",
        expected_result_description: '应返回状态为空的传感器记录的编号、时间和位置',
        knowledge_point: 'IS NULL谓词，处理缺失值场景',
        order_index: 6
      },
      {
        title: '排序查询（ORDER BY）',
        description: '【场景】最新数据优先展示\n\n查询西区大棚的所有监测记录，按监测时间降序排列。',
        difficulty: 'intermediate',
        category: '排序查询',
        hint: '使用 ORDER BY 子句，DESC 表示降序排列',
        correct_sql: "SELECT * FROM sensor_monitor WHERE location = '西区大棚' ORDER BY monitor_time DESC",
        expected_result_description: '应返回西区大棚的所有监测记录，按时间从新到旧排列',
        knowledge_point: 'ORDER BY子句，DESC降序排列，适配工程数据时效性需求',
        order_index: 7
      },
      {
        title: '集函数查询（AVG/MAX/COUNT）',
        description: '【场景】环境趋势分析\n\n统计东区农田温度监测的平均值、最高值和记录总数。',
        difficulty: 'intermediate',
        category: '聚合函数',
        hint: '使用 AVG() 计算平均值，MAX() 获取最大值，COUNT(*) 统计记录数',
        correct_sql: "SELECT AVG(monitor_value) AS avg_temperature, MAX(monitor_value) AS max_temperature, COUNT(*) AS total_records FROM sensor_monitor WHERE location = '东区农田' AND monitor_type = '温度'",
        expected_result_description: '应返回东区农田温度监测的平均温度、最高温度和总记录数',
        knowledge_point: 'AVG/MAX/COUNT集函数，实现数据统计分析',
        order_index: 8
      },
      {
        title: '多重条件组合查询',
        description: '【场景】复杂条件精准筛选\n\n查询2025年11月2日期间，南区果园或北区菜地的正常状态监测记录。',
        difficulty: 'advanced',
        category: '组合查询',
        hint: '使用 AND/OR 组合多个条件，注意使用括号明确优先级',
        correct_sql: "SELECT * FROM sensor_monitor WHERE monitor_time BETWEEN '2025-11-02 00:00:00' AND '2025-11-02 23:59:59' AND (location = '南区果园' OR location = '北区菜地') AND status = '正常'",
        expected_result_description: '应返回11月2日当天南区果园或北区菜地状态正常的所有监测记录',
        knowledge_point: 'AND/OR组合条件，复杂场景精准筛选',
        order_index: 9
      }
    ];

    for (const ex of exercises) {
      await query(`
        INSERT INTO exercises (title, description, difficulty, category, hint, correct_sql, expected_result_description, knowledge_point, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [ex.title, ex.description, ex.difficulty, ex.category, ex.hint, ex.correct_sql, ex.expected_result_description, ex.knowledge_point, ex.order_index]);
    }
    console.log(`  ✓ 插入 ${exercises.length} 道智慧农业例题`);

    // 7. 创建索引优化查询性能
    console.log('\n🔧 创建索引...');
    await query('CREATE INDEX IF NOT EXISTS idx_sensor_monitor_type ON sensor_monitor(monitor_type)');
    await query('CREATE INDEX IF NOT EXISTS idx_sensor_monitor_location ON sensor_monitor(location)');
    await query('CREATE INDEX IF NOT EXISTS idx_sensor_monitor_time ON sensor_monitor(monitor_time)');
    console.log('  ✓ 索引创建完成');

    console.log('\n' + '═'.repeat(60));
    console.log('✅ 智慧农业传感器监测系统例题数据库初始化完成！');
    console.log('═'.repeat(60));
    console.log('\n📊 数据库概览:');
    console.log('  📋 sensor_monitor: 12 条传感器监测记录');
    console.log('  📝 exercises: 9 道SQL单表查询例题');
    console.log('\n📚 例题知识点覆盖:');
    console.log('  1. 选择表中的若干列（指定列查询）');
    console.log('  2. DISTINCT去重查询');
    console.log('  3. WHERE条件查询（比较运算符）');
    console.log('  4. BETWEEN范围查询');
    console.log('  5. LIKE模糊查询');
    console.log('  6. IS NULL空值查询');
    console.log('  7. ORDER BY排序查询');
    console.log('  8. 聚合函数（AVG/MAX/COUNT）');
    console.log('  9. AND/OR多重条件组合查询');

  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

initExercises();
