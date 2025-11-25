/**
 * AI控制器
 * 处理所有AI相关的功能接口
 */

const aiService = require('../services/aiService');
const Comment = require('../models/Comment');
const User = require('../models/User');

/**
 * 分析SQL代码
 */
exports.analyzeSQL = async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql || sql.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供SQL代码'
      });
    }

    const analysis = await aiService.analyzeSQLCode(sql);

    // 如果用户已登录，记录SQL历史
    if (req.user) {
      await User.recordSqlExecution(req.user.id, sql, { analysis }, true, 0);
    }

    res.json({
      success: true,
      data: { analysis }
    });
  } catch (error) {
    console.error('SQL分析错误:', error);
    res.status(500).json({
      success: false,
      message: 'SQL分析失败，请稍后重试'
    });
  }
};

/**
 * 回答SQL问题
 */
exports.askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请输入您的问题'
      });
    }

    const answer = await aiService.answerSQLQuestion(question);

    res.json({
      success: true,
      data: { answer }
    });
  } catch (error) {
    console.error('问答错误:', error);
    res.status(500).json({
      success: false,
      message: '回答问题失败，请稍后重试'
    });
  }
};

/**
 * 生成练习题
 */
exports.generateExercise = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: '请指定练习主题'
      });
    }

    const exercise = await aiService.generateExercise(
      topic,
      difficulty || 'beginner'
    );

    res.json({
      success: true,
      data: { exercise }
    });
  } catch (error) {
    console.error('生成练习题错误:', error);
    res.status(500).json({
      success: false,
      message: '生成练习题失败，请稍后重试'
    });
  }
};

/**
 * SQL代码纠错
 */
exports.correctSQL = async (req, res) => {
  try {
    const { sql, errorMessage } = req.body;

    if (!sql || sql.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供需要纠错的SQL代码'
      });
    }

    const correction = await aiService.correctSQL(sql, errorMessage);

    // 如果用户已登录，记录SQL历史
    if (req.user) {
      await User.recordSqlExecution(req.user.id, sql, { correction, errorMessage }, false, 0);
    }

    res.json({
      success: true,
      data: { correction }
    });
  } catch (error) {
    console.error('SQL纠错错误:', error);
    res.status(500).json({
      success: false,
      message: 'SQL纠错失败，请稍后重试'
    });
  }
};

/**
 * 获取本周易错点总结
 */
exports.getWeeklySummary = async (req, res) => {
  try {
    // 获取包含代码的最近评论
    const recentComments = await Comment.getWithCode(20);

    if (recentComments.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: '## 📊 本周SQL易错点总结\n\n暂无足够的数据生成总结，请继续在评论区分享您的SQL代码！'
        }
      });
    }

    const summary = await aiService.summarizeCommonMistakes(recentComments);

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('生成总结错误:', error);
    res.status(500).json({
      success: false,
      message: '生成总结失败，请稍后重试'
    });
  }
};

/**
 * 智能聊天
 */
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请输入消息'
      });
    }

    const reply = await aiService.generateReply(message);

    res.json({
      success: true,
      data: { reply }
    });
  } catch (error) {
    console.error('聊天错误:', error);
    res.status(500).json({
      success: false,
      message: '获取回复失败，请稍后重试'
    });
  }
};

/**
 * 评价SQL代码（详细版）
 */
exports.evaluateCode = async (req, res) => {
  try {
    const { content, codeSnippet } = req.body;

    if (!codeSnippet || codeSnippet.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供SQL代码'
      });
    }

    const evaluation = await aiService.evaluateCommentCode(
      content || '请评价这段SQL代码',
      codeSnippet
    );

    res.json({
      success: true,
      data: { evaluation }
    });
  } catch (error) {
    console.error('代码评价错误:', error);
    res.status(500).json({
      success: false,
      message: '代码评价失败，请稍后重试'
    });
  }
};

