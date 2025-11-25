/**
 * AI功能路由
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// 公开路由（可选认证以记录历史）
router.post('/analyze', optionalAuth, aiController.analyzeSQL);
router.post('/ask', aiController.askQuestion);
router.post('/correct', optionalAuth, aiController.correctSQL);
router.post('/chat', aiController.chat);
router.post('/evaluate', aiController.evaluateCode);

// 需要认证的路由
router.post('/exercise', authenticateToken, aiController.generateExercise);
router.get('/weekly-summary', aiController.getWeeklySummary);

module.exports = router;

