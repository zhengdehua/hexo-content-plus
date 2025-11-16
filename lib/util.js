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

module.exports = {
  ContentUtil
};
