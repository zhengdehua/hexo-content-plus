'use strict';

// 引入 Hexo 内置工具（用于 HTML 转义，防止 XSS 攻击）
const { escapeHTML, stripHTML } = require('hexo-util');

class Util {
  constructor() {
    this.mathList = [];
    this.escapeHTML = escapeHTML;
    this.stripHTML = stripHTML;
  }

  // 替换数学公式为占位符
  replaceMath(content) {
    const mathPattern = /(\$\$.*?\$\$|\$.*?\$)/gs;
    this.mathList.length = 0;

    return content.replace(mathPattern, (match) => {
      this.mathList.push(match);
      return `{{MATH_${this.mathList.length - 1}}}`;
    });
  }

  // 恢复数学公式为原始状态
  recoverMath(content) {
    return this.mathList.reduce((acc, math, index) =>
      acc.replace(`{{MATH_${index}}}`, math), content);
  }

  // 处理换行符
  setBreak(content) {
    return content.replace(/\n\n/g, '\n\n<br>\n\n')
      .replace(/\n\\\n/g, '<br><br>');
  }

  // 生成唯一 ID
  generateUniqueId(groupCounter) {
    const randomStr = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return `btf-tab-${groupCounter}-${randomStr}`;
  }

  // 渲染内容块
  renderContent(content, post, hexo) {
    const { mathjax } = post;
    const canReplaceMath = mathjax || hexo.theme.config.math.per_page;

    let block = content;

    // 处理数学公式
    if (canReplaceMath) {
      block = this.replaceMath(block);
    }

    // 处理换行符
    block = this.setBreak(block);

    // 渲染内容
    block = hexo.render.renderSync({ text: block, engine: 'markdown' }).trim();

    // 处理数学公式
    if (canReplaceMath) {
      block = this.recoverMath(block);
    }

    return block;
  }
}

module.exports = { Util };
