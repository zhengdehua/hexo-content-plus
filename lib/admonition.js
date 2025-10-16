'use strict';

const marked = require('marked');

// 处理数学公式
const mathList = []; // 存储提取的公式

const replaceMath = content => {
  const mathPattern = /(\$\$.*?\$\$|\$.*?\$)/gs; // 匹配块级和行内公式
  mathList.length = 0; // 清空之前的公式列表

  return content.replace(mathPattern, (match) => {
    mathList.push(match);
    return `{{MATH_${mathList.length - 1}}}`; // 生成占位符
  });
};

const recoverMath = content => {
  return mathList.reduce((acc, math, index) =>
    acc.replace(`{{MATH_${index}}}`, math), content);
};

// 处理换行符
const setBreak = content => {
  content = content.replace(/\n\n/g, '\n\n<br>\n\n')
    .replace(/\n\\\n/g, '<br><br>');
  return content;
};

// 渲染内容
const render = function (args, content) {
  const [type, title] = args;
  const { mathjax } = this;
  const canReplaceMath = mathjax || hexo.theme.config.math.per_page;
  let block = content;

  // 处理数学公式
  if (canReplaceMath) {
    block = replaceMath(block);
  }

  // 处理换行符
  block = setBreak(block);

  // 渲染内容
  block = marked.parse(block);

  // 处理数学公式
  if (canReplaceMath) {
    block = recoverMath(block);
  }

  if (title) {
    return `<div class="admonition ${type.toLowerCase()}"><p class="admonition-title">${title}</p>${block}</div>\n\n`;
  }
  else {
    return `<div class="admonition ${type.toLowerCase()}">${block}</div>\n\n`;
  }
};

module.exports = render;
