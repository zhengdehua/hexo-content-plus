'use strict';

class ContentUtil {
  constructor() {
    this.mathList = [];
  }

  replaceMath(content) {
    const mathPattern = /(\$\$.*?\$\$|\$.*?\$)/gs;
    this.mathList.length = 0;

    return content.replace(mathPattern, (match) => {
      this.mathList.push(match);
      return `{{MATH_${this.mathList.length - 1}}}`;
    });
  }

  recoverMath(content) {
    return this.mathList.reduce((acc, math, index) =>
      acc.replace(`{{MATH_${index}}}`, math), content);
  }

  setBreak(content) {
    return content.replace(/\n\n/g, '\n\n<br>\n\n')
      .replace(/\n\\\n/g, '<br><br>');
  }
}

class TreeUtil {
  // ------------------------------
  // 辅助函数：转换 Markdown 输入数据为插件要求的格式
  // 输入格式(简化)：{ val: 1, left: { val: 2 }, right: { val: 3 } }
  // 或支持 children 格式：{ val: 1, children: [ { val: 2 }, { val: 3 } ] }
  // ------------------------------
  transformTreeData(rawData) {
    if (!rawData) return null;

    // 1. 处理 val 字段(必填)
    const tree = { val: rawData.val };

    // 2. 处理 left/right 直接定义的情况
    if (rawData.left) tree.left = transformTreeData(rawData.left);
    if (rawData.right) tree.right = transformTreeData(rawData.right);

    // 3. 兼容 children 数组格式([左子树, 右子树])
    if (Array.isArray(rawData.children)) {
      tree.left = transformTreeData(rawData.children[0]);
      tree.right = transformTreeData(rawData.children[1]);
    }

    return tree;
  }
}

module.exports = {
  ContentUtil,
  TreeUtil
};
