/**
 * 例题控制器
 * 处理例题练习相关的请求
 */

const Exercise = require('../models/Exercise');
const aiService = require('../services/aiService');

/**
 * 获取所有例题列表
 */
exports.getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.getAll();
    res.json({
      success: true,
      data: { exercises }
    });
  } catch (error) {
    console.error('获取例题列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取例题列表失败'
    });
  }
};

/**
 * 获取例题详情
 */
exports.getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await Exercise.getById(id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: '例题不存在'
      });
    }

    // 如果用户已登录，获取其答题记录
    let submission = null;
    if (req.user) {
      submission = await Exercise.getSubmission(req.user.id, id);
    }

    res.json({
      success: true,
      data: { 
        exercise: {
          ...exercise,
          // 不返回正确答案给前端
          correct_sql: undefined
        },
        submission 
      }
    });
  } catch (error) {
    console.error('获取例题详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取例题详情失败'
    });
  }
};

/**
 * 获取表结构信息
 */
exports.getTableSchema = async (req, res) => {
  try {
    const schema = await Exercise.getTableSchema();
    res.json({
      success: true,
      data: { schema }
    });
  } catch (error) {
    console.error('获取表结构失败:', error);
    res.status(500).json({
      success: false,
      message: '获取表结构失败'
    });
  }
};

/**
 * 执行SQL查询（仅查看结果，不验证）
 */
exports.executeSQL = async (req, res) => {
  try {
    const { sql } = req.body;
    
    if (!sql || !sql.trim()) {
      return res.status(400).json({
        success: false,
        message: '请输入SQL语句'
      });
    }

    const result = await Exercise.executeUserSQL(sql);
    
    res.json({
      success: result.success,
      data: result,
      message: result.success ? '执行成功' : result.error
    });
  } catch (error) {
    console.error('执行SQL失败:', error);
    res.status(500).json({
      success: false,
      message: '执行SQL失败'
    });
  }
};

/**
 * 提交答案并验证
 */
exports.submitAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { sql } = req.body;
    const userId = req.user.id;

    if (!sql || !sql.trim()) {
      return res.status(400).json({
        success: false,
        message: '请输入SQL语句'
      });
    }

    // 获取例题信息
    const exercise = await Exercise.getById(id);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: '例题不存在'
      });
    }

    // 比较结果
    const comparison = await Exercise.compareResults(sql, id);
    
    let aiFeedback = null;
    
    // 如果答案错误，调用AI分析
    if (!comparison.isCorrect) {
      try {
        aiFeedback = await aiService.analyzeExerciseAnswer(
          exercise.description,
          exercise.hint,
          sql,
          comparison.userResult,
          exercise.correct_sql
        );
      } catch (aiError) {
        console.error('AI分析失败:', aiError);
        aiFeedback = '暂时无法获取AI分析，请根据提示自行检查SQL语句。';
      }
    }

    // 保存答题记录
    const submission = await Exercise.saveSubmission(
      userId,
      id,
      sql,
      comparison.isCorrect,
      aiFeedback
    );

    res.json({
      success: true,
      data: {
        isCorrect: comparison.isCorrect,
        message: comparison.message,
        userResult: comparison.userResult,
        aiFeedback,
        attemptCount: submission.attempt_count
      }
    });
  } catch (error) {
    console.error('提交答案失败:', error);
    res.status(500).json({
      success: false,
      message: '提交答案失败'
    });
  }
};

/**
 * 获取用户答题进度
 */
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await Exercise.getUserProgress(userId);
    
    // 计算统计数据
    const total = progress.length;
    const completed = progress.filter(p => p.is_correct).length;
    const attempted = progress.filter(p => p.attempt_count > 0).length;

    res.json({
      success: true,
      data: {
        progress,
        stats: {
          total,
          completed,
          attempted,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error('获取答题进度失败:', error);
    res.status(500).json({
      success: false,
      message: '获取答题进度失败'
    });
  }
};

/**
 * 获取AI提示
 */
exports.getHint = async (req, res) => {
  try {
    const { id } = req.params;
    const { userSQL } = req.body;

    const exercise = await Exercise.getById(id);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: '例题不存在'
      });
    }

    // 调用AI生成提示
    const hint = await aiService.generateExerciseHint(
      exercise.description,
      exercise.hint,
      userSQL
    );

    res.json({
      success: true,
      data: { hint }
    });
  } catch (error) {
    console.error('获取AI提示失败:', error);
    res.status(500).json({
      success: false,
      message: '获取提示失败'
    });
  }
};

/**
 * 获取所有分类
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Exercise.getCategories();
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败'
    });
  }
};

