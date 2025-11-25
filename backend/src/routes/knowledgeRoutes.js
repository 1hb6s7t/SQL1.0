/**
 * 知识点路由
 */

const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// 公开路由
router.get('/', knowledgeController.getKnowledgePoints);
router.get('/categories', knowledgeController.getCategories);
router.get('/popular', knowledgeController.getPopularKnowledge);
router.get('/search', knowledgeController.searchKnowledge);
router.get('/mistakes', knowledgeController.getCommonMistakes);
router.get('/:id', knowledgeController.getKnowledgePoint);

// 需要认证的路由
router.get('/user/progress', authenticateToken, knowledgeController.getUserProgress);
router.post('/:id/progress', authenticateToken, knowledgeController.recordProgress);

// 管理员路由
router.post('/', authenticateToken, requireAdmin, knowledgeController.createKnowledge);
router.put('/:id', authenticateToken, requireAdmin, knowledgeController.updateKnowledge);
router.delete('/:id', authenticateToken, requireAdmin, knowledgeController.deleteKnowledge);

module.exports = router;

