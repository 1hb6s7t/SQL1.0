/**
 * 初始化例题数据库 - 双项目并列版
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { query, pool } = require('../config/database');

async function initExercises() {
  try {
    console.log('🚀 开始初始化双项目例题数据库...');

    await query('DROP TABLE IF EXISTS exercise_submissions CASCADE');
    await query('DROP TABLE IF EXISTS exercises CASCADE');
    await query('DROP TABLE IF EXISTS equip_run_log CASCADE');
    await query('DROP TABLE IF EXISTS equipment CASCADE');
    await query('DROP TABLE IF EXISTS sensor_monitor CASCADE');

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

    await query(`
      CREATE TABLE equipment (
        equip_id VARCHAR(20) PRIMARY KEY,
        equip_name VARCHAR(30) NOT NULL,
        workshop VARCHAR(20) NOT NULL,
        status VARCHAR(10) NOT NULL,
        purchase_year INT NOT NULL
      )
    `);

    await query(`
      CREATE TABLE equip_run_log (
        log_id SERIAL PRIMARY KEY,
        equip_id VARCHAR(20) NOT NULL REFERENCES equipment(equip_id),
        run_hours DECIMAL(5,2) NOT NULL CHECK (run_hours >= 0),
        production_num INT NOT NULL CHECK (production_num >= 0),
        run_date VARCHAR(10) NOT NULL
      )
    `);

    await query(`
      CREATE TABLE exercises (
        id SERIAL PRIMARY KEY,
        project_code VARCHAR(30) NOT NULL DEFAULT 'exercise1',
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
      await query('INSERT INTO sensor_monitor (sensor_id, monitor_type, monitor_value, monitor_time, location, status) VALUES ($1,$2,$3,$4,$5,$6)', data);
    }

    const equipmentData = [
      ['DEV202501', '数控机床', 'W01', '正常', 2023],
      ['DEV202502', '机械臂', 'W01', '正常', 2023],
      ['DEV202503', '传送带', 'W02', '维修', 2023],
      ['DEV202504', '激光切割机', 'W02', '正常', 2024],
      ['DEV202505', '分拣机', 'W01', '闲置', 2024],
      ['DEV202506', '数控铣床', 'W02', '正常', 2024]
    ];
    for (const data of equipmentData) {
      await query('INSERT INTO equipment (equip_id, equip_name, workshop, status, purchase_year) VALUES ($1,$2,$3,$4,$5)', data);
    }

    const logData = [
      ['DEV202501', 8.50, 320, '2025-11-01'],
      ['DEV202502', 10.00, 450, '2025-11-01'],
      ['DEV202501', 7.80, 290, '2025-11-02'],
      ['DEV202502', 8.00, 380, '2025-11-02'],
      ['DEV202501', 8.30, 310, '2025-11-03'],
      ['DEV202502', 9.50, 420, '2025-11-03'],
      ['DEV202505', 0.00, 0, '2025-11-03'],
      ['DEV202501', 7.90, 280, '2025-11-04'],
      ['DEV202504', 9.20, 280, '2025-11-01'],
      ['DEV202506', 8.40, 270, '2025-11-01'],
      ['DEV202504', 8.50, 300, '2025-11-02'],
      ['DEV202506', 7.90, 250, '2025-11-02'],
      ['DEV202504', 8.80, 310, '2025-11-03'],
      ['DEV202506', 8.70, 280, '2025-11-03'],
      ['DEV202503', 0.00, 0, '2025-11-03']
    ];
    for (const data of logData) {
      await query('INSERT INTO equip_run_log (equip_id, run_hours, production_num, run_date) VALUES ($1,$2,$3,$4)', data);
    }

    const exercises = [
      ['exercise1','基础列选择查询','【场景】农业运维基础数据统计\n\n查询所有监测记录的传感器编号、监测类型和数值。','beginner','选择列','使用 SELECT 列1, 列2, 列3 FROM 表名 的格式，选择指定的列',"SELECT sensor_id, monitor_type, monitor_value FROM sensor_monitor",'返回传感器编号、类型、数值','选择表中的若干列',1],
      ['exercise1','去重查询（DISTINCT）','【场景】设备清单统计\n\n查询已部署的所有传感器编号（避免重复统计）。','beginner','去重查询','使用 DISTINCT 关键字消除重复行',"SELECT DISTINCT sensor_id FROM sensor_monitor",'返回不重复传感器编号','DISTINCT去重',2],
      ['exercise1','比较条件查询','【场景】农业高温预警筛选\n\n查询温度高于30℃的异常监测记录。','beginner','条件查询','使用 WHERE 子句配合比较运算符(>) 和 AND',"SELECT * FROM sensor_monitor WHERE monitor_type = '温度' AND monitor_value > 30",'返回高温记录','WHERE 条件查询',3],
      ['exercise1','范围查询（BETWEEN）','【场景】适宜作物生长湿度筛选\n\n查询土壤含水量在20%~25%之间的正常记录。','intermediate','范围查询','使用 BETWEEN...AND...',"SELECT sensor_id, monitor_value, location FROM sensor_monitor WHERE monitor_type = '土壤含水量' AND monitor_value BETWEEN 20 AND 25 AND status = '正常'",'返回土壤含水量适中记录','BETWEEN范围查询',4],
      ['exercise1','模糊查询（LIKE）','【场景】特定编号和区域的传感器筛选\n\n查询编号以S20250开头且安装在农田区域的传感器记录。','intermediate','模糊查询','使用 LIKE 与 %',"SELECT * FROM sensor_monitor WHERE sensor_id LIKE 'S20250%' AND location LIKE '%农田%'",'返回匹配记录','LIKE模糊查询',5],
      ['exercise1','空值查询（IS NULL）','【场景】运维故障排查\n\n查询设备状态为空的传感器监测记录。','intermediate','空值查询','使用 IS NULL 谓词',"SELECT sensor_id, monitor_time, location FROM sensor_monitor WHERE status IS NULL",'返回状态为空记录','IS NULL 空值查询',6],
      ['exercise2','创建W01车间正常设备视图','【场景】运维员需要快速查看W01车间处于正常状态的设备。\n\n请创建视图 W01_Normal_Equip_View，仅展示 equip_id、equip_name、purchase_year 三列。','beginner','行列子集视图','用 WHERE workshop + status 过滤',"SELECT equip_id, equip_name, purchase_year FROM equipment WHERE workshop = 'W01' AND status = '正常'",'返回W01正常设备','行列子集视图',1],
      ['exercise2','查询W01正常设备清单','【场景】基于已创建的视图查询全部数据。','beginner','视图查询','直接 SELECT * 查询视图对应结果',"SELECT * FROM (SELECT equip_id, equip_name, purchase_year FROM equipment WHERE workshop = 'W01' AND status = '正常') t",'返回W01正常设备清单','视图查询',2],
      ['exercise2','筛选正常状态设备','【场景】管理员需要维护正常状态设备视图的数据范围。','beginner','带CHECK OPTION视图','先写出视图对应的 SELECT 结果',"SELECT equip_id, equip_name, status FROM equipment WHERE status = '正常'",'返回所有正常设备','CHECK OPTION视图基础',3],
      ['exercise2','计算设备使用年限','【场景】需要统计设备已使用年限。','intermediate','带表达式的视图','使用 2025 - purchase_year AS use_years',"SELECT equip_id, equip_name, purchase_year, 2025 - purchase_year AS use_years FROM equipment",'返回设备使用年限','表达式视图',4],
      ['exercise2','统计设备总运行时长','【场景】统计员需要分析每台设备累计运行时长。','intermediate','分组视图','使用 SUM(run_hours) 和 GROUP BY equip_id',"SELECT equip_id, SUM(run_hours) AS total_run_hours FROM equip_run_log GROUP BY equip_id",'返回每台设备的累计运行时长','分组视图',5],
      ['exercise2','筛选高运行时长设备','【场景】在累计运行时长统计基础上筛选运行时长不少于30小时的设备。','intermediate','基于视图的视图','把分组结果作为子查询再次过滤',"SELECT equip_id, total_run_hours FROM (SELECT equip_id, SUM(run_hours) AS total_run_hours FROM equip_run_log GROUP BY equip_id) t WHERE total_run_hours >= 30",'返回高运行时长设备','基于视图的视图',6]
    ];

    for (const ex of exercises) {
      await query('INSERT INTO exercises (project_code, title, description, difficulty, category, hint, correct_sql, expected_result_description, knowledge_point, order_index) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', ex);
    }

    console.log('✅ 双项目例题初始化完成！');
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

initExercises();
