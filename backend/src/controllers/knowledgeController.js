/**
 * 知识点控制器
 * 处理SQL知识点相关的操作
 */

const Knowledge = require('../models/Knowledge');
const aiService = require('../services/aiService');

/**
 * 获取所有知识点
 */
exports.getKnowledgePoints = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const knowledgePoints = await Knowledge.getAll(category, difficulty);

    res.json({
      success: true,
      data: { knowledgePoints }
    });
  } catch (error) {
    console.error('获取知识点错误:', error);
    res.status(500).json({
      success: false,
      message: '获取知识点失败'
    });
  }
};

/**
 * 获取单个知识点详情
 */
exports.getKnowledgePoint = async (req, res) => {
  try {
    const { id } = req.params;
    const knowledgePoint = await Knowledge.findById(id);

    if (!knowledgePoint) {
      return res.status(404).json({
        success: false,
        message: '知识点不存在'
      });
    }

    res.json({
      success: true,
      data: { knowledgePoint }
    });
  } catch (error) {
    console.error('获取知识点详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取知识点详情失败'
    });
  }
};

/**
 * 获取所有分类
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Knowledge.getCategories();

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败'
    });
  }
};

/**
 * 搜索知识点
 */
exports.searchKnowledge = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '请提供搜索关键词'
      });
    }

    const results = await Knowledge.search(keyword);

    res.json({
      success: true,
      data: { results }
    });
  } catch (error) {
    console.error('搜索知识点错误:', error);
    res.status(500).json({
      success: false,
      message: '搜索失败'
    });
  }
};

/**
 * 获取热门知识点
 */
exports.getPopularKnowledge = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const popular = await Knowledge.getPopular(limit);

    res.json({
      success: true,
      data: { knowledgePoints: popular }
    });
  } catch (error) {
    console.error('获取热门知识点错误:', error);
    res.status(500).json({
      success: false,
      message: '获取热门知识点失败'
    });
  }
};

/**
 * 获取用户学习进度
 */
exports.getUserProgress = async (req, res) => {
  try {
    const progress = await Knowledge.getUserProgress(req.user.id);

    // 计算总体进度
    const total = progress.length;
    const completed = progress.filter(p => p.is_completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        progress,
        summary: {
          total,
          completed,
          percentage
        }
      }
    });
  } catch (error) {
    console.error('获取学习进度错误:', error);
    res.status(500).json({
      success: false,
      message: '获取学习进度失败'
    });
  }
};

/**
 * 记录学习进度
 */
exports.recordProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { score } = req.body;

    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: '分数必须在0-100之间'
      });
    }

    const progress = await Knowledge.recordProgress(req.user.id, id, score);

    res.json({
      success: true,
      message: '进度记录成功',
      data: { progress }
    });
  } catch (error) {
    console.error('记录进度错误:', error);
    res.status(500).json({
      success: false,
      message: '记录进度失败'
    });
  }
};

/**
 * 获取常见易错点总结
 */
exports.getCommonMistakes = async (req, res) => {
  try {
    const mistakes = await Knowledge.getCommonMistakesSummary();

    res.json({
      success: true,
      data: { mistakes }
    });
  } catch (error) {
    console.error('获取易错点错误:', error);
    res.status(500).json({
      success: false,
      message: '获取易错点失败'
    });
  }
};

/**
 * 创建知识点（管理员）
 */
exports.createKnowledge = async (req, res) => {
  try {
    const { category, title, content, difficulty, commonMistakes, examples } = req.body;

    if (!category || !title || !content) {
      return res.status(400).json({
        success: false,
        message: '分类、标题和内容为必填项'
      });
    }

    const knowledgePoint = await Knowledge.create({
      category,
      title,
      content,
      difficulty: difficulty || 'beginner',
      commonMistakes,
      examples
    });

    res.status(201).json({
      success: true,
      message: '知识点创建成功',
      data: { knowledgePoint }
    });
  } catch (error) {
    console.error('创建知识点错误:', error);
    res.status(500).json({
      success: false,
      message: '创建知识点失败'
    });
  }
};

/**
 * 更新知识点（管理员）
 */
exports.updateKnowledge = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, title, content, difficulty, commonMistakes, examples } = req.body;

    const knowledgePoint = await Knowledge.update(id, {
      category,
      title,
      content,
      difficulty,
      commonMistakes,
      examples
    });

    if (!knowledgePoint) {
      return res.status(404).json({
        success: false,
        message: '知识点不存在'
      });
    }

    res.json({
      success: true,
      message: '知识点更新成功',
      data: { knowledgePoint }
    });
  } catch (error) {
    console.error('更新知识点错误:', error);
    res.status(500).json({
      success: false,
      message: '更新知识点失败'
    });
  }
};

/**
 * 删除知识点（管理员）
 */
exports.deleteKnowledge = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Knowledge.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '知识点不存在'
      });
    }

    res.json({
      success: true,
      message: '知识点删除成功'
    });
  } catch (error) {
    console.error('删除知识点错误:', error);
    res.status(500).json({
      success: false,
      message: '删除知识点失败'
    });
  }
};

