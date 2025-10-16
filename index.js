'use strict';

// 使用 CSS 变量减少重复代码，提高可维护性
const css = require('./source/css/admonition.css').toString();

// 注入 CSS 到网站 head 中
hexo.extend.filter.register('after_generate', function () {
  this.extend.injector.register('head_end', `<style>${css}</style>`, 'post');
});

const admonition = require('./lib/admonition');
hexo.extend.tag.register('admonition', admonition(args, content), { ends: true });
