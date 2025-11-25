/**
 * 认证控制器
 * 处理用户注册、登录等认证相关操作
 */

const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

/**
 * 用户注册
 */
exports.register = async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    // 检查邮箱是否已存在
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: '该用户名已被使用'
      });
    }

    // 创建用户
    const user = await User.create({ username, email, password });

    // 生成token
    const token = generateToken(user.id);

    // 更新最后登录时间
    await User.updateLastLogin(user.id);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.created_at
        },
        token
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册过程中发生错误'
    });
  }
};

/**
 * 用户登录
 */
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // 查找用户
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 检查账号状态
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用'
      });
    }

    // 生成token
    const token = generateToken(user.id);

    // 更新最后登录时间
    await User.updateLastLogin(user.id);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatar_url,
          role: user.role,
          createdAt: user.created_at,
          lastLogin: user.last_login
        },
        token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录过程中发生错误'
    });
  }
};

/**
 * 获取当前用户信息
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const stats = await User.getLearningStats(req.user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatar_url,
          role: user.role,
          createdAt: user.created_at,
          lastLogin: user.last_login
        },
        stats
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

/**
 * 更新用户信息
 */
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, avatarUrl } = req.body;

    // 如果要更新用户名，检查是否已存在
    if (username && username !== req.user.username) {
      const existing = await User.findByUsername(username);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: '该用户名已被使用'
        });
      }
    }

    // 如果要更新邮箱，检查是否已存在
    if (email && email !== req.user.email) {
      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被注册'
        });
      }
    }

    const updatedUser = await User.update(req.user.id, { username, email, avatarUrl });

    res.json({
      success: true,
      message: '更新成功',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    });
  }
};

/**
 * 修改密码
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 获取用户完整信息（包含密码hash）
    const user = await User.findByEmail(req.user.email);
    
    // 验证当前密码
    const isValid = await User.verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 更新密码
    await User.changePassword(req.user.id, newPassword);

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败'
    });
  }
};

/**
 * 获取用户学习历史
 */
exports.getLearningHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const history = await User.getSqlHistory(req.user.id, limit);

    res.json({
      success: true,
      data: { history }
    });
  } catch (error) {
    console.error('获取学习历史错误:', error);
    res.status(500).json({
      success: false,
      message: '获取学习历史失败'
    });
  }
};

