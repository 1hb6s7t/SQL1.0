/**
 * 初始化例题数据库
 * 运行: node backend/src/scripts/initExercises.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { query, pool } = require('../config/database');

async function initExercises() {
  try {
    console.log('🚀 开始初始化例题数据库...\n');

    // 1. 创建练习数据库表（模拟教学用的 Student, Course, SC 表）
    console.log('📦 创建练习数据库表...');
    
    // 先删除已存在的表（如果有）
    await query('DROP TABLE IF EXISTS practice_sc CASCADE');
    await query('DROP TABLE IF EXISTS practice_course CASCADE');
    await query('DROP TABLE IF EXISTS practice_student CASCADE');
    await query('DROP TABLE IF EXISTS exercises CASCADE');
    await query('DROP TABLE IF EXISTS exercise_submissions CASCADE');

    // 创建 Student 表
    await query(`
      CREATE TABLE practice_student (
        Sno CHAR(10) PRIMARY KEY,
        Sname CHAR(20) UNIQUE,
        Ssex CHAR(2),
        Sage INT,
        Sdept CHAR(20)
      )
    `);
    console.log('  ✓ practice_student 表创建成功');

    // 创建 Course 表
    await query(`
      CREATE TABLE practice_course (
        Cno CHAR(4) PRIMARY KEY,
        Cname CHAR(40) NOT NULL,
        Cpno CHAR(4),
        Ccredit SMALLINT
      )
    `);
    console.log('  ✓ practice_course 表创建成功');

    // 创建 SC 表
    await query(`
      CREATE TABLE practice_sc (
        Sno CHAR(10),
        Cno CHAR(4),
        Grade INT,
        PRIMARY KEY (Sno, Cno)
      )
    `);
    console.log('  ✓ practice_sc 表创建成功');

    // 2. 插入学生数据
    console.log('\n📝 插入学生数据...');
    const students = [
      ['2022101', '李勇', '男', 20, '计算机科学与技术'],
      ['2022102', '张三', '女', 19, '计算机科学与技术'],
      ['2022103', '赵正', '男', 21, '计算机科学与技术'],
      ['2022201', '刘晨', '女', 19, '网络工程'],
      ['2022202', '李楠', '男', 18, '网络工程'],
      ['2022203', '杨瑞', '男', 21, '网络工程'],
      ['2022301', '郭宇', '男', 19, '电子信息工程'],
      ['2022302', '王名', '女', 18, '电子信息工程'],
      ['2022303', '李心', '女', 20, '电子信息工程']
    ];
    
    for (const s of students) {
      await query(
        'INSERT INTO practice_student (Sno, Sname, Ssex, Sage, Sdept) VALUES ($1, $2, $3, $4, $5)',
        s
      );
    }
    console.log(`  ✓ 插入 ${students.length} 条学生记录`);

    // 3. 插入课程数据
    console.log('\n📚 插入课程数据...');
    const courses = [
      ['1', '高等数学', null, 5],
      ['2', '离散数学', null, 3],
      ['3', 'C语言', null, 4],
      ['4', '数字逻辑', null, 3],
      ['5', '计算机组成原理', '4', 3],
      ['6', 'JAVA程序设计', '3', 4],
      ['7', '数据结构', '3', 4],
      ['8', '数据库原理与应用', '7', 4],
      ['9', '操作系统', '8', 4],
      ['10', '计算机网络原理', '9', 3]
    ];
    
    for (const c of courses) {
      await query(
        'INSERT INTO practice_course (Cno, Cname, Cpno, Ccredit) VALUES ($1, $2, $3, $4)',
        c
      );
    }
    console.log(`  ✓ 插入 ${courses.length} 条课程记录`);

    // 4. 插入选课成绩数据
    console.log('\n📊 插入选课成绩数据...');
    const scRecords = [
      ['2022101', '1', 92],
      ['2022101', '2', 85],
      ['2022101', '3', 88],
      ['2022102', '2', 90],
      ['2022102', '3', 80],
      ['2022102', '4', 58],
      ['2022103', '1', 56],
      ['2022103', '2', 87],
      ['2022103', '4', 82],
      ['2022201', '1', 69],
      ['2022201', '3', 93],
      ['2022201', '4', null]
    ];
    
    for (const sc of scRecords) {
      await query(
        'INSERT INTO practice_sc (Sno, Cno, Grade) VALUES ($1, $2, $3)',
        sc
      );
    }
    console.log(`  ✓ 插入 ${scRecords.length} 条选课成绩记录`);

    // 5. 创建例题表
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
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ exercises 表创建成功');

    // 6. 创建学生答题记录表
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

    // 7. 插入例题数据
    console.log('\n📝 插入例题数据...');
    const exercises = [
      {
        title: '查询指定学号学生信息',
        description: '查询学号为2022101的学生的详细情况。',
        difficulty: 'beginner',
        category: '基础查询',
        hint: '使用 SELECT * FROM 表名 WHERE 条件 的格式',
        correct_sql: "SELECT * FROM practice_student WHERE Sno = '2022101'",
        expected_result_description: '应返回学号为2022101的李勇同学的完整信息',
        order_index: 1
      },
      {
        title: '模糊查询姓刘的学生',
        description: '查询所有姓刘学生的姓名、学号和性别。',
        difficulty: 'beginner',
        category: '模糊查询',
        hint: '使用 LIKE 操作符进行模糊匹配，姓刘表示名字以"刘"开头',
        correct_sql: "SELECT Sname, Sno, Ssex FROM practice_student WHERE Sname LIKE '刘%'",
        expected_result_description: '应返回所有姓刘学生的姓名、学号和性别',
        order_index: 2
      },
      {
        title: '查询不及格学生学号',
        description: '查询考试成绩有不及格的学生的学号。',
        difficulty: 'intermediate',
        category: '条件查询',
        hint: '不及格表示成绩小于60分，使用 DISTINCT 去重',
        correct_sql: "SELECT DISTINCT Sno FROM practice_sc WHERE Grade < 60",
        expected_result_description: '应返回有不及格成绩的学生学号（去重）',
        order_index: 3
      },
      {
        title: '计算课程平均成绩',
        description: '计算选修了1号课程的学生平均成绩。',
        difficulty: 'intermediate',
        category: '聚合函数',
        hint: '使用 AVG() 聚合函数计算平均值',
        correct_sql: "SELECT AVG(Grade) FROM practice_sc WHERE Cno = '1'",
        expected_result_description: '应返回1号课程的平均成绩',
        order_index: 4
      },
      {
        title: '查询课程最高分',
        description: '查询选修1号课程的学生最高分数。',
        difficulty: 'intermediate',
        category: '聚合函数',
        hint: '使用 MAX() 聚合函数查找最大值',
        correct_sql: "SELECT MAX(Grade) FROM practice_sc WHERE Cno = '1'",
        expected_result_description: '应返回1号课程的最高分数',
        order_index: 5
      },
      {
        title: '成绩排序查询',
        description: '查询选修了3号课程的学生的学号及其成绩，查询结果按分数降序排列。',
        difficulty: 'intermediate',
        category: '排序查询',
        hint: '使用 ORDER BY 子句进行排序，DESC 表示降序',
        correct_sql: "SELECT Sno, Grade FROM practice_sc WHERE Cno = '3' ORDER BY Grade DESC",
        expected_result_description: '应返回选修3号课程学生的学号和成绩，按成绩从高到低排列',
        order_index: 6
      }
    ];

    for (const ex of exercises) {
      await query(`
        INSERT INTO exercises (title, description, difficulty, category, hint, correct_sql, expected_result_description, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [ex.title, ex.description, ex.difficulty, ex.category, ex.hint, ex.correct_sql, ex.expected_result_description, ex.order_index]);
    }
    console.log(`  ✓ 插入 ${exercises.length} 道例题`);

    console.log('\n✅ 例题数据库初始化完成！');
    console.log('\n📊 数据库概览:');
    console.log('  - practice_student: 9 条学生记录');
    console.log('  - practice_course: 10 条课程记录');
    console.log('  - practice_sc: 12 条选课成绩记录');
    console.log('  - exercises: 6 道例题');

  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
  } finally {
    await pool.end();
  }
}

initExercises();

