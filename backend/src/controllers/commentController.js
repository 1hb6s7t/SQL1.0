/**
 * 评论控制器
 * 处理评论的CRUD操作和AI回复功能
 */

const Comment = require('../models/Comment');
const aiService = require('../services/aiService');
const { query } = require('../config/database');

/**
 * 获取评论列表
 */
exports.getComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const parentId = req.query.parentId || null;

    const result = await Comment.getAll(page, limit, parentId);

    // 如果用户已登录，添加是否已点赞的信息
    if (req.user) {
      for (let comment of result.comments) {
        comment.hasLiked = await Comment.hasLiked(comment.id, req.user.id);
      }
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取评论列表失败'
    });
  }
};

/**
 * 获取单个评论及其回复
 */
exports.getComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    // 获取回复
    const replies = await Comment.getAll(1, 100, id);

    res.json({
      success: true,
      data: {
        comment,
        replies: replies.comments
      }
    });
  } catch (error) {
    console.error('获取评论详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取评论详情失败'
    });
  }
};

/**
 * 创建评论
 */
exports.createComment = async (req, res) => {
  try {
    const { content, codeSnippet, parentId } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '评论内容不能为空'
      });
    }

    // 如果是回复，验证父评论是否存在
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: '要回复的评论不存在'
        });
      }
    }

    // 创建评论
    const comment = await Comment.create({
      userId: req.user.id,
      parentId: parentId || null,
      content: content.trim(),
      codeSnippet: codeSnippet || null
    });

    // 获取完整的评论信息（包含用户信息）
    const fullComment = await Comment.findById(comment.id);

    // 如果评论包含SQL代码，触发AI分析
    if (codeSnippet) {
      // 异步进行AI分析，不阻塞响应
      triggerAIAnalysis(comment.id, content, codeSnippet, req.user.id).catch(console.error);
    }

    res.status(201).json({
      success: true,
      message: '评论发布成功',
      data: { comment: fullComment }
    });
  } catch (error) {
    console.error('创建评论错误:', error);
    res.status(500).json({
      success: false,
      message: '发布评论失败'
    });
  }
};

/**
 * 触发AI分析（异步）
 */
async function triggerAIAnalysis(commentId, content, codeSnippet, userId) {
  try {
    // 调用AI分析SQL代码
    const analysis = await aiService.evaluateCommentCode(content, codeSnippet);

    // 保存AI分析结果
    await query(`
      INSERT INTO ai_responses (comment_id, original_content, ai_analysis, code_evaluation)
      VALUES ($1, $2, $3, $3)
    `, [commentId, content, analysis]);

    // 创建AI回复评论
    const aiReply = await Comment.create({
      userId: null, // AI回复没有用户ID
      parentId: commentId,
      content: analysis,
      codeSnippet: null,
      isAiReply: true
    });

    console.log(`AI分析完成，回复ID: ${aiReply.id}`);
  } catch (error) {
    console.error('AI分析失败:', error);
  }
}

/**
 * 更新评论
 */
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, codeSnippet } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '评论内容不能为空'
      });
    }

    const updatedComment = await Comment.update(
      id,
      req.user.id,
      content.trim(),
      codeSnippet
    );

    if (!updatedComment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在或无权修改'
      });
    }

    res.json({
      success: true,
      message: '评论更新成功',
      data: { comment: updatedComment }
    });
  } catch (error) {
    console.error('更新评论错误:', error);
    res.status(500).json({
      success: false,
      message: '更新评论失败'
    });
  }
};

/**
 * 删除评论
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Comment.delete(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: '评论不存在或无权删除'
      });
    }

    res.json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({
      success: false,
      message: '删除评论失败'
    });
  }
};

/**
 * 点赞/取消点赞评论
 */
exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    const result = await Comment.like(id, req.user.id);

    res.json({
      success: true,
      message: result.liked ? '点赞成功' : '取消点赞成功',
      data: { liked: result.liked }
    });
  } catch (error) {
    console.error('点赞错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
};

/**
 * 获取用户的评论
 */
exports.getUserComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await Comment.getByUserId(req.user.id, page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取用户评论错误:', error);
    res.status(500).json({
      success: false,
      message: '获取评论失败'
    });
  }
};

/**
 * 获取最新评论
 */
exports.getRecentComments = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const comments = await Comment.getRecent(limit);

    res.json({
      success: true,
      data: { comments }
    });
  } catch (error) {
    console.error('获取最新评论错误:', error);
    res.status(500).json({
      success: false,
      message: '获取最新评论失败'
    });
  }
};

/**
 * 手动触发AI回复
 */
exports.requestAIReply = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    // 获取父评论内容（如果有）
    let parentContent = null;
    if (comment.parent_id) {
      const parent = await Comment.findById(comment.parent_id);
      parentContent = parent ? parent.content : null;
    }

    // 生成AI回复
    const aiReplyContent = await aiService.generateReply(comment.content, parentContent);

    // 创建AI回复
    const aiReply = await Comment.create({
      userId: null,
      parentId: comment.id,
      content: aiReplyContent,
      codeSnippet: null,
      isAiReply: true
    });

    const fullReply = await Comment.findById(aiReply.id);

    res.json({
      success: true,
      message: 'AI回复成功',
      data: { reply: fullReply }
    });
  } catch (error) {
    console.error('AI回复错误:', error);
    res.status(500).json({
      success: false,
      message: 'AI回复失败'
    });
  }
};

