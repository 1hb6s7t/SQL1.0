/**
 * AI服务 - 使用Qwen API
 * 提供SQL代码分析、评价和智能回复功能
 */

const config = require('../config/env');

class AIService {
  constructor() {
    this.apiKey = config.qwenApiKey;
    this.apiUrl = config.qwenApiUrl;
    // 代码相关任务使用 qwen3-coder-plus
    this.coderModel = config.qwenCoderModel;
    // 通用对话任务使用 qwen-max
    this.maxModel = config.qwenMaxModel;
    // 默认模型
    this.defaultModel = config.qwenModel;
    
    console.log('🤖 AI模型配置:');
    console.log(`   代码模型: ${this.coderModel}`);
    console.log(`   对话模型: ${this.maxModel}`);
  }

  /**
   * 调用Qwen API
   * @param {Array} messages - 消息数组
   * @param {number} maxTokens - 最大token数
   * @param {string} modelType - 模型类型: 'coder' | 'max' | 'default'
   */
  async callQwenAPI(messages, maxTokens = 2000, modelType = 'default') {
    // 根据任务类型选择模型
    let model;
    switch (modelType) {
      case 'coder':
        model = this.coderModel;
        break;
      case 'max':
        model = this.maxModel;
        break;
      default:
        model = this.defaultModel;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`📝 使用模型: ${model}`);
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI API调用失败:', error.message);
      throw error;
    }
  }

  /**
   * 分析SQL代码
   */
  async analyzeSQLCode(sqlCode) {
    const messages = [
      {
        role: 'system',
        content: `你是一位专业的SQL教师和代码评审专家。请分析用户提供的SQL代码，指出：
1. 代码的正确性和可能的错误
2. 代码风格和最佳实践建议
3. 性能优化建议
4. 常见易错点提醒
请用中文回复，语气友好专业。`
      },
      {
        role: 'user',
        content: `请分析以下SQL代码：\n\`\`\`sql\n${sqlCode}\n\`\`\``
      }
    ];

    return this.callQwenAPI(messages, 2000, 'coder');  // 使用代码模型
  }

  /**
   * 评价用户评论中的SQL代码
   */
  async evaluateCommentCode(commentContent, codeSnippet) {
    const messages = [
      {
        role: 'system',
        content: `你是SQL学习平台的AI助手。用户在评论区分享了SQL代码，请：
1. 首先理解用户的问题或分享内容
2. 对SQL代码进行专业评价
3. 指出代码中的优点和可改进之处
4. 提供具体的修改建议
5. 如果代码有错误，请解释错误原因并给出正确示例

请用中文回复，语气友好、鼓励学习。回复长度适中，重点突出。`
      },
      {
        role: 'user',
        content: `用户评论：${commentContent}\n\nSQL代码：\n\`\`\`sql\n${codeSnippet}\n\`\`\``
      }
    ];

    return this.callQwenAPI(messages, 2000, 'coder');  // 使用代码模型
  }

  /**
   * 智能回复用户评论
   */
  async generateReply(commentContent, parentContent = null) {
    let systemPrompt = `你是SQL学习平台的AI助手"小Q"。你的任务是回复用户的评论，提供有帮助的SQL学习建议。

回复要求：
1. 友好、专业、鼓励学习
2. 如果用户提问，给出清晰的解答
3. 如果用户分享经验，给予肯定并补充
4. 适当引用SQL知识点
5. 回复长度适中，不要过长
6. 开头可以加一个友好的称呼或表情`;

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    if (parentContent) {
      messages.push({
        role: 'user',
        content: `原评论：${parentContent}\n\n需要回复的内容：${commentContent}`
      });
    } else {
      messages.push({
        role: 'user',
        content: commentContent
      });
    }

    return this.callQwenAPI(messages, 1000, 'max');  // 使用对话模型
  }

  /**
   * 总结常见SQL易错知识点
   */
  async summarizeCommonMistakes(recentComments) {
    const commentsText = recentComments.map((c, i) => 
      `${i + 1}. ${c.content}${c.code_snippet ? `\n代码: ${c.code_snippet}` : ''}`
    ).join('\n\n');

    const messages = [
      {
        role: 'system',
        content: `你是SQL教学专家。根据用户最近的评论和代码，总结出常见的SQL易错点和学习建议。

输出格式：
## 📊 本周SQL易错点总结

### 🔴 高频错误
（列出最常见的错误类型）

### 💡 学习建议
（针对性的学习建议）

### ✅ 正确示例
（给出正确的SQL写法示例）

请用中文回复，格式清晰，内容实用。`
      },
      {
        role: 'user',
        content: `以下是最近的用户评论和SQL代码：\n\n${commentsText}`
      }
    ];

    return this.callQwenAPI(messages, 2500, 'max');  // 使用对话模型
  }

  /**
   * 解答SQL问题
   */
  async answerSQLQuestion(question) {
    const messages = [
      {
        role: 'system',
        content: `你是专业的SQL教师。请回答用户关于SQL的问题。

回答要求：
1. 准确、清晰、易懂
2. 提供示例代码
3. 解释原理
4. 指出常见错误
5. 适当拓展相关知识

请用中文回复。`
      },
      {
        role: 'user',
        content: question
      }
    ];

    return this.callQwenAPI(messages, 2000, 'max');  // 使用对话模型
  }

  /**
   * 生成SQL练习题
   */
  async generateExercise(topic, difficulty = 'beginner') {
    const difficultyMap = {
      'beginner': '初级',
      'intermediate': '中级', 
      'advanced': '高级'
    };

    const messages = [
      {
        role: 'system',
        content: `你是SQL教学专家。请生成一道${difficultyMap[difficulty]}难度的SQL练习题。

输出格式：
## 📝 练习题

### 题目
（清晰的题目描述）

### 数据表结构
（相关表的结构说明）

### 示例数据
（一些示例数据）

### 参考答案
（正确的SQL语句，用代码块包裹）

### 解析
（答案解析和知识点说明）

请用中文回复。`
      },
      {
        role: 'user',
        content: `请生成一道关于"${topic}"的SQL练习题`
      }
    ];

    return this.callQwenAPI(messages, 2000, 'max');  // 使用对话模型
  }

  /**
   * SQL代码纠错
   */
  async correctSQL(wrongSQL, errorMessage = null) {
    let prompt = `这是一段有问题的SQL代码：\n\`\`\`sql\n${wrongSQL}\n\`\`\``;
    
    if (errorMessage) {
      prompt += `\n\n错误信息：${errorMessage}`;
    }

    prompt += '\n\n请指出错误并给出正确的写法。';

    const messages = [
      {
        role: 'system',
        content: `你是SQL纠错专家。请：
1. 识别SQL代码中的错误
2. 解释错误原因
3. 给出正确的SQL代码
4. 提供避免此类错误的建议

请用中文回复，格式清晰。`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return this.callQwenAPI(messages, 2000, 'coder');  // 使用代码模型
  }

  /**
   * 分析例题答案错误原因并给出引导
   */
  async analyzeExerciseAnswer(exerciseDescription, hint, userSQL, userResult, correctSQL) {
    const messages = [
      {
        role: 'system',
        content: `你是一位耐心的SQL教师，正在帮助学生练习SQL查询。学生的答案不正确，你需要：

1. **分析错误原因**：指出学生SQL语句中的具体问题
2. **引导思考**：不要直接给出正确答案，而是通过提问或提示引导学生思考
3. **给出建议**：提供修改方向，但让学生自己尝试修正
4. **鼓励学生**：用友好的语气鼓励学生继续尝试

注意：
- 不要直接展示正确的SQL语句
- 用循序渐进的方式引导
- 语气要友好、鼓励
- 回复要简洁，重点突出`
      },
      {
        role: 'user',
        content: `**题目要求**：${exerciseDescription}

**题目提示**：${hint}

**学生的SQL语句**：
\`\`\`sql
${userSQL}
\`\`\`

**学生的查询结果**：${userResult.success ? JSON.stringify(userResult.rows, null, 2) : `执行错误: ${userResult.error}`}

请分析学生的错误并给出引导性的反馈。`
      }
    ];

    return this.callQwenAPI(messages, 1500, 'coder');
  }

  /**
   * 为例题生成提示
   */
  async generateExerciseHint(exerciseDescription, existingHint, userSQL = null) {
    let userContext = '';
    if (userSQL) {
      userContext = `\n\n学生当前的尝试：\n\`\`\`sql\n${userSQL}\n\`\`\``;
    }

    const messages = [
      {
        role: 'system',
        content: `你是一位SQL教师，学生在做SQL练习时遇到困难，需要你提供提示。

要求：
1. 不要直接给出答案
2. 提供思考方向和关键点
3. 可以提醒相关的SQL语法
4. 鼓励学生自己尝试
5. 回复要简洁明了`
      },
      {
        role: 'user',
        content: `**题目**：${exerciseDescription}

**现有提示**：${existingHint}${userContext}

请根据题目给学生一些额外的思考提示，帮助他们找到解题方向。`
      }
    ];

    return this.callQwenAPI(messages, 800, 'max');
  }
}

// 导出单例
module.exports = new AIService();

