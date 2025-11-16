'use strict';

const path = require('path');
const fs = require('fs');
const { TreeUtil } = require('hexo-content-plus/lib/util');

const injector = function (hexo) {
  // 定位本地依赖文件路径
  const nodeModulesDir = path.join(__dirname, 'node_modules');

  // binary-tree-visualizer 核心文件路径
  const visualizerUmdPath = path.join(
    nodeModulesDir,
    'binary-tree-visualizer',
    'dist',
    'index.min.js'  // 插件压缩后的核心文件
  );

  // 页面访问路径(复制到 public 目录后)
  const visualizerPublicPath = '/plugins/hexo-binary-tree/index.min.js';

  // 复制本地依赖到 Hexo 公共目录(确保页面可访问)
  const hexoPublicDir = path.join(hexo.base_dir, 'public', 'plugins', 'hexo-binary-tree');

  // 确保公共目录存在(递归创建多级目录)
  if (!fs.existsSync(hexoPublicDir)) {
    fs.mkdirSync(hexoPublicDir, { recursive: true });
  }
  // 复制 UMD 文件到 public 目录
  fs.copyFileSync(visualizerUmdPath, path.join(hexoPublicDir, 'index.min.js'));

  // 注入核心 JS 依赖(原生 JS，无 CSS 依赖)
  hexo.extend.injector.register('body_end', `
  <script src="${visualizerPublicPath}"></script>
`, 'post'); // 仅文章页注入

  // 注入初始化渲染脚本(原生 JS 直接调用插件)
  hexo.extend.injector.register('body_end', `
  <script>
    // 页面加载完成后渲染所有二叉树
    window.addEventListener('load', () => {
      const BinaryTreeVisualizer = window.BinaryTreeVisualizer;
      if (!BinaryTreeVisualizer) {
        console.error('[Hexo 二叉树插件] 依赖加载失败，请检查 public/plugins/hexo-binary-tree/index.min.js 是否存在');
        return;
      }

      // 遍历所有二叉树配置
      const treeConfigs = window.hexoBinaryTrees || {};
      Object.entries(treeConfigs).forEach(([containerId, { data, layout, options }]) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 适配水平/垂直布局(调整参数)
        const visualizerOptions = { ...options };
        if (layout === 'horizontal') {
          visualizerOptions.levelGap = 150; // 水平布局增大水平间距
          visualizerOptions.siblingGap = 80; // 减小垂直间距
        }

        // 初始化二叉树可视化
        new BinaryTreeVisualizer(\`#\${containerId}\`, data, visualizerOptions);

        // 可选：添加节点点击事件(原生 JS 交互)
        container.addEventListener('click', (e) => {
          const node = e.target.closest('.binary-tree-node');
          if (node) {
            const nodeVal = node.textContent.trim();
            console.log('点击节点：', nodeVal);
            // 可选：高亮节点(添加临时样式)
            node.style.backgroundColor = '#1890ff';
            setTimeout(() => node.style.backgroundColor = options.nodeColor, 500);
          }
        });
      });
    });
  </script>
`, 'post');
};

const renderTree = function (args, content) {
  const util = new TreeUtil();
  // 解析参数：容器ID(可选)、布局方向(vertical/horizontal，可选)
  const containerId = args[0] || `binary-tree-${Date.now()}`;
  const layout = args[1] || 'vertical'; // 新增布局参数(自定义扩展)

  // 解析二叉树数据(适配 binary-tree-visualizer 的数据格式：val/left/right)
  let treeData = {};
  try {
    const rawData = JSON.parse(content.trim());
    // 转换为插件要求的格式：{ val: xxx, left: {}, right: {} }
    treeData = util.transformTreeData(rawData);
    if (!treeData.val) {
      throw new Error('根节点必须包含 val 字段(节点值)');
    }
  } catch (err) {
    console.error('[Hexo 二叉树插件] 数据格式错误：', err.message);
    return `<div style="color: #f44336; padding: 10px; border: 1px solid #ffecec; border-radius: 4px;">
      二叉树渲染失败：${err.message}(请检查JSON语法，格式要求：{val: 1, left: {}, right: {}})
    </div>`;
  }

  // 生成容器 + 存储树数据和配置
  return `
    <!-- 二叉树容器：适配水平/垂直布局 -->
    <div id="${containerId}" style="width: 100%; height: 550px; margin: 1.5rem 0; overflow: auto;"></div>

    <script>
      // 全局存储所有二叉树配置
      window.hexoBinaryTrees = window.hexoBinaryTrees || {};
      window.hexoBinaryTrees['${containerId}'] = {
        data: ${JSON.stringify(treeData)},
        layout: '${layout}',
        options: {
          nodeRadius: 28, // 节点半径
          nodeColor: '#42b983', // 节点背景色(绿色系)
          lineColor: '#666', // 连线颜色
          fontSize: 16, // 节点文字大小
          levelGap: 90, // 层级间距
          siblingGap: 50 // 兄弟节点间距
        }
      };
    </script>
  `;
};

module.exports = {
  treeInjector: injector,
  renderTree
};
