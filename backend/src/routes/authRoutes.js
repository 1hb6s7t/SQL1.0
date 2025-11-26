/**
 * 认证路由
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// 注册验证规则
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('用户名长度应在2-50个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少为6个字符')
];

// 登录验证规则（支持用户名或邮箱）
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('请输入用户名或邮箱'),
  body('password')
    .notEmpty()
    .withMessage('请输入密码')
];

// 公开路由
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// 需要认证的路由
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/password', authenticateToken, authController.changePassword);
router.get('/history', authenticateToken, authController.getLearningHistory);

module.exports = router;

