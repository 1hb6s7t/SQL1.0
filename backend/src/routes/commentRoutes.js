/**
 * 评论路由
 */

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// 公开路由（可选认证）
router.get('/', optionalAuth, commentController.getComments);
router.get('/recent', commentController.getRecentComments);
router.get('/:id', optionalAuth, commentController.getComment);

// 需要认证的路由
router.post('/', authenticateToken, commentController.createComment);
router.put('/:id', authenticateToken, commentController.updateComment);
router.delete('/:id', authenticateToken, commentController.deleteComment);
router.post('/:id/like', authenticateToken, commentController.likeComment);
router.post('/:id/ai-reply', authenticateToken, commentController.requestAIReply);

// 获取用户自己的评论
router.get('/user/me', authenticateToken, commentController.getUserComments);

module.exports = router;

