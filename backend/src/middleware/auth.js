/**
 * 认证中间件
 * 处理JWT验证和用户身份识别
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

/**
 * 验证JWT Token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期，请重新登录'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }

    console.error('认证错误:', error);
    return res.status(500).json({
      success: false,
      message: '认证过程中发生错误'
    });
  }
};

/**
 * 可选认证 - 如果有token则验证，没有则继续
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.userId);
      if (user && user.is_active) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // 忽略token错误，继续处理请求
    next();
  }
};

/**
 * 验证管理员权限
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '需要登录'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }

  next();
};

/**
 * 验证版主或管理员权限
 */
const requireModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '需要登录'
    });
  }

  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: '需要版主或管理员权限'
    });
  }

  next();
};

/**
 * 生成JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  requireModerator,
  generateToken
};

