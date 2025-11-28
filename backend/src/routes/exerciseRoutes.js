/**
 * 例题路由
 */

const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// 公开路由
router.get('/', exerciseController.getAllExercises);
router.get('/categories', exerciseController.getCategories);
router.get('/schema', exerciseController.getTableSchema);

// 可选认证（登录用户可以看到自己的答题记录）
router.get('/:id', optionalAuth, exerciseController.getExerciseById);

// 执行SQL（公开，用于测试）
router.post('/execute', exerciseController.executeSQL);

// 需要登录的路由
router.post('/:id/submit', authenticateToken, exerciseController.submitAnswer);
router.post('/:id/hint', authenticateToken, exerciseController.getHint);
router.get('/user/progress', authenticateToken, exerciseController.getUserProgress);

module.exports = router;

