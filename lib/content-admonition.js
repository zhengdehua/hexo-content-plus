'use strict';

const fs = require('fs');
const path = require('path');
const { ContentUtil } = require('hexo-content-plus/lib/util');

const injector = function (hexo) {
  // 注入 CSS 到网站 head 中
  const style = fs.readFileSync(path.resolve(__dirname, '../css/content-admonition.css')).toString();
  hexo.extend.filter.register('after_generate', function () {
    this.extend.injector.register('head_end', `<style>${style}</style>`, 'post');
  });
};

const initTypes = function (prefixedKey) {
  let types = {
    info: "#00b8d4 || fa fa-circle-info",
    success: "#00c853 || fa fa-check",
    warning: "#ff9100 || fa fa-triangle-exclamation",
    failure: "#ff5252 || fa fa-xmark",
    quote: "#9e9e9e || fa fa-quote-right",
  };

  // 添加样式前缀
  return Object.fromEntries(
    Object.entries(types).map(([key, value]) => {
      const [color, icon] = value.split('||').map(part => part.trim());
      return [`${prefixedKey}${key}`, [color, icon]];
    })
  );
};

const renderContent = function (content, hexo) {
  const util = new ContentUtil();
  const { mathjax } = this;
  const canReplaceMath = mathjax || hexo.theme.config.math.per_page;

  let block = content;

  // 处理数学公式
  if (canReplaceMath) {
    block = util.replaceMath(block);
  }

  // 处理换行符
  block = util.setBreak(block);

  // 渲染内容
  block = hexo.render.renderSync({ text: block, engine: 'markdown' }).trim().replace(/\n/g, '\n  ');

  // 处理数学公式
  if (canReplaceMath) {
    block = util.recoverMath(block);
  }

  return block;
};

class AdmonitionRenderer {
  constructor(hexo) {
    this.hexo = hexo;

    // 配置与常量定义
    this.nameHeader = "admonition";
    this.nh = this.nameHeader; // 缩写别名
    this.defaultType = "info"; // 默认类型
    this.types = initTypes(this.nameHeader);
  }

  render(args, content, post) {
    let title = args.join(' ');
    let type = this.defaultType;

    if (this.types[`${this.nh}${args[0]}`]) {
      type = args[0];
      title = title.slice(type.length).trim();
    }

    // 设置默认标题
    if (!title) {
      title = type.charAt(0).toUpperCase() + type.slice(1);
    }

    const fullType = `${this.nh}${type}`;
    const block = renderContent.call(post, content, this.hexo);

    if (title) {
      return `
      <div class="${this.nh}-block ${this.nh}-${type}">
        <p class="${this.nh}-title">
          <i class="${this.types[fullType][1]} fa-fw"></i>${title}
        </p>
        ${block}
      </div>
      `;
    }
    else {
      return `<div class="${this.nh}-${type}">${block}</div>`;
    }
  }
}

class ContentRenderer {
  constructor(hexo) {
    this.hexo = hexo;

    // 配置与常量定义
    this.nameHeader = "hcb";
    this.defaultType = "info"; // 默认类型
    this.nh = this.nameHeader; // 缩写别名
    this.cardCount = 0; // 卡片计数器
    this.types = initTypes(this.nameHeader);
  }

  /**
   * 解析通用参数（type 和 title）
   * @param {Array} args 输入参数数组
   * @returns {Object} 解析后的参数对象
   */
  parseArgs(args) {
    let title = args.join(' ');
    let type = this.defaultType;
    let open = false;

    if (this.types[`${this.nameHeader}${args[0]}`]) {
      type = args[0];
      title = title.slice(type.length).trim();
    }

    if (args.length > 1 && args[1] === 'open') {
      open = true;
      title = title.slice('open'.length).trim();
    }

    // 设置默认标题
    if (!title) {
      title = type.charAt(0).toUpperCase() + type.slice(1);
    }

    return {
      title,
      type,
      fullType: `${this.nameHeader}${type}`,
      open
    };
  }

  /**
   * 渲染内容框
   * @param {Array} args 参数数组
   * @param {string} content 内容
   * @returns {string} 渲染后的HTML
   */
  contentBlock(args, content, post) {
    let { fullType, title, open } = this.parseArgs(args);
    const block = renderContent.call(post, content, this.hexo);

    return `
<details class="${this.nh}-content block ${fullType}"${open ? ' open' : ''}>
  <summary>
    <i class="${this.types[fullType][1]} fa-fw"></i>${title}
    <div class="${this.nh}-block-open-button"><i class="fa fa-chevron-down fa-fw"></i></div>
  </summary>
  ${block}
</details>
    `;
  }

  /**
   * 渲染内容卡片
   * @param {Array} args 参数数组
   * @param {string} content 内容
   * @returns {string} 渲染后的HTML
   */
  contentCards(args, content, post) {
    this.cardCount++;
    const cardId = this.cardCount;
    const { fullType, title } = this.parseArgs(args);
    const contents = content.split(/<!-{2,}card-break-{2,}>/);
    const color = this.types[fullType][0];
    const titles = title.split(' ');

    for (let i = 0; i < contents.length; i++) {
      contents[i] = renderContent.call(post, contents[i], this.hexo);
    }

    return `
<div class="${this.nh}-content ${this.nh}-cards ${fullType}" id="${this.nh}-content_cards_${cardId}" style="--cards-color: ${color}">
  ${titles.map((_, i) => `
    <input ${!i ? 'checked="checked"' : ''} 
           class="${this.nh}-content ${this.nh}-cards-input" 
           id="${this.nh}-content_cards_${cardId}_input_${i}" 
           name="${this.nh}-content_cards_${cardId}_inputs" 
           type="radio">
  `).join('\n')}

  <div class="${this.nh}-content ${this.nh}-cards-labels ${fullType}" 
       id="${this.nh}-content_cards_${cardId}_labels" 
       style="--md-indicator-x: 0px; --md-indicator-width: 0px;">
    ${titles.map((title, i) => `
      <label class="${this.nh}-content ${this.nh}-cards-label" 
             id="${this.nh}-content_cards_${cardId}_label_${i}" 
             for="${this.nh}-content_cards_${cardId}_input_${i}">
        ${title}
      </label>
    `).join('\n')}
  </div>

  <div class="${this.nh}-content ${this.nh}-cards-contents" id="${this.nh}-content_cards_${cardId}_contents">
    ${titles.map((_, i) => `
      <div class="${this.nh}-content ${this.nh}-cards-content" id="${this.nh}-content_cards_${cardId}_content_${i}">
        ${contents[i]}
      </div>
    `).join('\n')}
  </div>

  <script>
    // 卡片切换逻辑
    function select_${cardId}(id) {
      let x = 0;
      for (let i = 0; i < ${titles.length}; i++) {
        const label = document.getElementById("${this.nh}-content_cards_${cardId}_label_" + i);
        const content = document.getElementById("${this.nh}-content_cards_${cardId}_content_" + i);

        if (i === id) {
          label.classList.add('active');
          content.classList.add('active');
          // 更新指示器位置和宽度
          document.getElementById("${this.nh}-content_cards_${cardId}_labels").style.setProperty("--md-indicator-x", x + "px");
          document.getElementById("${this.nh}-content_cards_${cardId}_labels").style.setProperty("--md-indicator-width", window.getComputedStyle(label).width);
        } else {
          label.classList.remove('active');
          content.classList.remove('active');
        }
        x += parseFloat(window.getComputedStyle(label).width);
      }
    }

    // 初始化与绑定事件
    select_${cardId}(0);
    ${titles.map((_, i) => `
      document.getElementById("${this.nh}-content_cards_${cardId}_input_${i}")
        .addEventListener("change", () => select_${cardId}(${i}));
    `).join('\n')}
  </script>
</div>
    `;
  }
}

module.exports = {
  contentInjector: injector,
  AdmonitionRenderer,
  ContentRenderer
};
