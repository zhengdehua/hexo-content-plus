'use strict';

// 引入内容告示模块
const { contentInjector, AdmonitionRenderer, ContentRenderer } = require('hexo-content-plus/lib/content-admonition.js');
contentInjector(hexo); // 注入脚本
const admonitionRender = new AdmonitionRenderer(hexo);
const contentRender = new ContentRenderer(hexo);

// 注册 admonition 标签
hexo.extend.tag.register('admonition', function (args, content) {
  return admonitionRender.render(args, content, this);
}, { ends: true });

// 注册 contentblock 标签(可折叠内容盒)
hexo.extend.tag.register('contentblock', function (args, content) {
  return contentRender.contentBlock(args, content, this);
}, { ends: true });

// 注册 contentcards 标签(卡片切换)
hexo.extend.tag.register('contentcards', function (args, content) {
  return contentRender.contentCards(args, content, this);
}, { ends: true });
