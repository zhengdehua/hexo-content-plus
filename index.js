'use strict';

const fs = require('fs');
const path = require('path');

const { AdmonitionRenderer, ContentRenderer } = require('hexo-content-plus/lib/render');
const admonitionRender = new AdmonitionRenderer(hexo);
const contentRender = new ContentRenderer(hexo);

// 注入 CSS 到网站 head 中
const style = fs.readFileSync(path.resolve(__dirname, './css/content.css')).toString();
hexo.extend.filter.register('after_generate', function () {
  this.extend.injector.register('head_end', `<style>${style}</style>`, 'post');
});

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
