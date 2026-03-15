const config = require('../config/env')

class AIService {
  constructor() {
    this.apiKey = config.aiApiKey
    this.apiUrl = `${config.aiBaseUrl.replace(/\/$/, '')}${config.aiChatPath}`
    this.coderModel = config.qwenCoderModel
    this.maxModel = config.qwenMaxModel
    this.defaultModel = config.qwenModel
    this.authScheme = config.aiAuthScheme
    this.extraHeaderName = config.aiExtraHeaderName
    this.extraHeaderValue = config.aiExtraHeaderValue

    console.log('🤖 AI模型配置:')
    console.log(`   Provider: ${config.aiProvider}`)
    console.log(`   Base URL: ${config.aiBaseUrl}`)
    console.log(`   代码模型: ${this.coderModel}`)
    console.log(`   对话模型: ${this.maxModel}`)
  }

  buildHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `${this.authScheme} ${this.apiKey}`
    }
    if (this.extraHeaderName && this.extraHeaderValue) {
      headers[this.extraHeaderName] = this.extraHeaderValue
    }
    return headers
  }

  async callQwenAPI(messages, maxTokens = 2000, modelType = 'default') {
    let model = this.defaultModel
    if (modelType === 'coder') model = this.coderModel
    if (modelType === 'max') model = this.maxModel

    const body = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(body)
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`AI API请求失败: ${response.status} - ${errorText}`)
      }
      const data = await response.json()
      return data?.choices?.[0]?.message?.content || 'AI 未返回有效内容'
    } catch (error) {
      console.error('AI API调用失败:', error.message)
      throw error
    }
  }

  async analyzeSQLCode(sqlCode) {
    return this.callQwenAPI([
      { role: 'system', content: '你是一位专业的SQL教师和代码评审专家。请分析用户提供的SQL代码，指出正确性、风格建议、性能优化建议和常见易错点。请用中文回复。' },
      { role: 'user', content: `请分析以下SQL代码：
\`\`\`sql
${sqlCode}
\`\`\`` }
    ], 2000, 'coder')
  }

  async evaluateCommentCode(commentContent, codeSnippet) {
    return this.callQwenAPI([
      { role: 'system', content: '你是SQL学习平台的AI助手。请专业评价用户评论中的 SQL 代码，指出优点、问题和修改建议，用中文回复。' },
      { role: 'user', content: `用户评论：${commentContent}

SQL代码：
\`\`\`sql
${codeSnippet}
\`\`\`` }
    ], 2000, 'coder')
  }

  async generateReply(commentContent, parentContent = null) {
    const content = parentContent ? `原评论：${parentContent}

需要回复的内容：${commentContent}` : commentContent
    return this.callQwenAPI([
      { role: 'system', content: '你是SQL学习平台的AI助手。请友好、专业地回复用户评论，给出简洁有帮助的 SQL 学习建议。' },
      { role: 'user', content }
    ], 1000, 'max')
  }

  async summarizeCommonMistakes(recentComments) {
    const commentsText = recentComments
      .map((c, i) => `${i + 1}. ${c.content}${c.code_snippet ? `\n代码: ${c.code_snippet}` : ''}`)
      .join('\n\n')
    return this.callQwenAPI([
      { role: 'system', content: '你是SQL教学专家。请总结近期用户常见 SQL 易错点，并给出学习建议与正确示例，使用清晰中文格式。' },
      { role: 'user', content: `以下是最近的用户评论和SQL代码：\n\n${commentsText}` }
    ], 2500, 'max')
  }

  async answerSQLQuestion(question) {
    return this.callQwenAPI([
      { role: 'system', content: '你是专业的SQL教师。请准确、清晰地回答用户关于 SQL 的问题，并适当给出示例。' },
      { role: 'user', content: question }
    ], 2000, 'max')
  }

  async generateExercise(topic, difficulty = 'beginner') {
    return this.callQwenAPI([
      { role: 'system', content: '你是SQL教学专家。请根据主题和难度生成一道带题目、表结构、示例数据、参考答案与解析的 SQL 练习题。' },
      { role: 'user', content: `请生成一道关于“${topic}”的 ${difficulty} 难度 SQL 练习题` }
    ], 2000, 'max')
  }

  async correctSQL(wrongSQL, errorMessage = null) {
    const prompt = `这是一段有问题的SQL代码：
\`\`\`sql
${wrongSQL}
\`\`\`${errorMessage ? `

错误信息：${errorMessage}` : ''}

请指出错误并给出正确写法。`
    return this.callQwenAPI([
      { role: 'system', content: '你是SQL纠错专家。请识别错误、解释原因、给出正确 SQL，并提供避免此类错误的建议。' },
      { role: 'user', content: prompt }
    ], 2000, 'coder')
  }

  async analyzeExerciseAnswer(exerciseDescription, hint, userSQL, userResult) {
    return this.callQwenAPI([
      { role: 'system', content: '你是一位耐心的SQL教师。学生答案不正确时，请分析问题、给出引导性建议，但不要直接贴出最终答案。' },
      { role: 'user', content: `题目要求：${exerciseDescription}

题目提示：${hint}

学生SQL：
\`\`\`sql
${userSQL}
\`\`\`

学生查询结果：${userResult.success ? JSON.stringify(userResult.rows, null, 2) : `执行错误: ${userResult.error}`}` }
    ], 1500, 'coder')
  }

  async generateExerciseHint(exerciseDescription, existingHint, userSQL = null) {
    return this.callQwenAPI([
      { role: 'system', content: '你是一位SQL教师。请给学生提供额外提示，不要直接给标准答案，重点提示思路和关键语法。' },
      { role: 'user', content: `题目：${exerciseDescription}

现有提示：${existingHint}${userSQL ? `

学生当前尝试：
\`\`\`sql
${userSQL}
\`\`\`` : ''}` }
    ], 1200, 'coder')
  }
}

module.exports = new AIService()
