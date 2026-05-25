# 微信公众号 Markdown 编辑器

<div align="center">

[![Desktop App](https://img.shields.io/badge/Desktop%20App-Electron-47848F?style=flat-square&logo=electron)](https://github.com/flyeric0212/wx-md/releases)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-success?style=flat-square&logo=opensourceinitiative)](https://github.com/flyeric0212/wx-md)
[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Cross Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)]()

</div>

一款专为微信公众号内容创作者打造的桌面级 Markdown 编辑器。基于 Electron 构建，提供媲美专业 IDE 的文件管理和编辑体验，同时保留网页版的便捷性，让公众号排版从此告别繁琐。

[在线体验](https://md.flyeric.top) &nbsp;|&nbsp; [下载桌面版](https://github.com/flyeric0212/wx-md/releases)

![wx-md 界面预览](images/wx-md-ui.png)

## 为什么选择桌面版？

桌面版是 wx-md 的核心体验，专为高频创作场景设计：

- **本地文件管理**：像 VS Code 一样浏览、打开、编辑本地 Markdown 文件
- **多文件并行编辑**：同时打开多篇草稿，通过标签页快速切换
- **自动保存与恢复**：关闭应用后自动记忆工作区，下次打开一切如初
- **一键上传草稿**：直接推送文章到微信公众号草稿箱，无需手动复制粘贴
- **原生操作体验**：系统级文件夹选择、快捷键、文件对话框，操作更流畅

网页版适合临时编辑和轻量使用，桌面版才是日常创作的主力工具。

## 桌面版专属功能

### 文件浏览器侧栏

- 使用系统原生文件夹选择器打开本地目录
- 树形结构展示文件夹层级，支持展开/收起
- 直接打开 `.md`、`.markdown`、`.txt` 文件进行编辑
- 在侧栏中直观浏览整个项目的文档结构

### 多标签页编辑

- 同时打开多个 Markdown 文件，每个文件独立标签页
- 点击标签页即可在不同文档间快速切换
- 未保存的修改会在标签上显示圆点提示
- 关闭标签前自动提示保存，避免内容丢失

### 文件操作

在侧栏的任意文件或文件夹上右键，即可进行：

- **打开**：在编辑器中打开 Markdown 文件
- **新建文件**：在当前目录下创建新的 Markdown 文件
- **新建文件夹**：在当前目录下创建新的文件夹
- **重命名**：修改文件或文件夹名称
- **删除**：将文件或文件夹移入回收站
- **刷新**：重新读取当前目录的文件列表

### 工作区自动恢复

- 自动记录当前打开的文件夹路径和所有标签页状态
- 数据保存在本地配置文件 `~/.wx-md/workspace-state.json`
- 下次启动应用时自动还原上次的全部工作上下文
- 创作无需中断，随时关闭，随时回到刚才的状态

### Ctrl+S 保存

- 按 `Ctrl+S`（macOS 为 `Cmd+S`）将当前标签页内容保存到原始文件
- 保存成功后标签上的未保存提示自动消失
- 编辑本地文件就像使用任何专业编辑器一样自然

### 微信公众号草稿上传

- 直接将当前文章上传到微信公众号后台的草稿箱
- 无需复制、粘贴、调整格式，一键完成发布前准备
- 在应用内即可完成从写作到上传的完整工作流

## 共享功能（桌面版 + 网页版）

### 实时 Markdown 编辑与预览

- 左侧 CodeMirror 6 编辑器，右侧实时渲染预览
- 编辑区与预览区滚动同步，写作时随时查看效果
- 完整支持 Markdown 语法：标题、段落、引用、有序/无序列表、粗体、斜体、删除线、链接、图片、表格、代码块等
- 代码块语法高亮，支持多种编程语言

### 一键复制为微信格式

- 点击"复制"按钮，将文章转换为微信公众号兼容的 HTML 结构
- 直接粘贴到公众号后台编辑器，格式保持一致
- 自动修正 HTML 结构，确保在微信公众号中正确渲染

### 三种预览模式

- **自适应**：预览区宽度随窗口自适应
- **手机**：模拟手机屏幕宽度（375px），预览移动端效果
- **宽屏**：固定 900px 宽度，适合桌面端阅读体验

### 丰富的主题与样式

- **编辑器主题**：浅色 / 深色两种编辑器外观
- **字体设置**：多种字体和字号可选
- **主题色**：自定义预览区的主色调
- **代码高亮主题**：多种 Highlight.js 代码主题风格

## 安装

### 桌面应用（推荐）

前往 [Releases](https://github.com/flyeric0212/wx-md/releases) 页面下载对应系统的安装包：

- **Windows**：下载 `.exe` 安装程序，双击运行即可安装
- **macOS**：下载 `.dmg` 文件，拖拽到应用程序文件夹
- **Linux**：下载对应发行版的安装包

安装完成后打开应用，选择一个本地文件夹即可开始创作。

### 开发环境搭建

如果你希望从源码运行或参与开发：

**环境要求**

- Node.js 18.0.0 或更高版本
- npm 8.0.0 或更高版本

**安装依赖**

```bash
npm install
```

**启动桌面版开发模式**

```bash
npm run start
```

**启动网页版开发模式**

```bash
npm run dev
```

应用将在 http://localhost:5173 启动。

**构建生产版本**

```bash
npm run build
```

构建后的文件生成在 `dist` 目录。

**桌面应用打包**

```bash
npm run build
npm run package
npm run make
```

打包后的文件位于 `out` 目录。

## 技术栈

- **桌面框架**：Electron（Context Isolation + Preload 安全模型）
- **前端框架**：React 19
- **开发语言**：TypeScript
- **编辑器引擎**：CodeMirror 6
- **Markdown 解析**：Marked
- **代码高亮**：Highlight.js
- **HTML 净化**：DOMPurify
- **UI 组件**：Radix UI
- **样式方案**：TailwindCSS + CSS/Less
- **打包工具**：Electron Forge（Windows 使用 Squirrel 安装器）
- **构建工具**：Vite

## Docker 部署

如果你更倾向于在服务器上部署网页版，可以使用 Docker：

### 构建镜像

```bash
docker build -t your-repo/wx-md:latest .
```

### 跨平台构建并推送

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t your-repo/wx-md:latest --push .
```

### 使用 docker-compose 部署

```bash
cd deploy
docker-compose build
docker-compose up -d
```

访问 http://localhost 即可使用。

## 使用指南

### 桌面版基本操作

1. 打开应用后，点击侧栏顶部的"打开文件夹"按钮选择本地目录
2. 在文件树中点击任意 Markdown 文件，即可在编辑器中打开
3. 在左侧编辑区输入 Markdown 内容，右侧实时预览效果
4. 按 `Ctrl+S` 保存当前文件
5. 点击顶部工具栏的"复制"按钮，将文章复制为微信格式
6. 或点击"上传草稿"按钮，直接推送至微信公众号草稿箱

### 网页版基本操作

1. 在左侧编辑区输入 Markdown 格式的文本
2. 右侧会实时显示渲染后的 HTML 效果
3. 点击顶部工具栏的"复制"按钮可以复制为微信公众号格式
4. 直接粘贴到微信公众号后台编辑器中即可

### 样式设置

工具栏提供多种样式选项：

- **主题**：选择编辑器外观主题（浅色 / 深色）
- **字体**：选择预览区的字体
- **字号**：选择预览区的字号大小
- **主题色**：选择预览区的主色调
- **代码主题**：选择代码块的高亮主题

### 预览模式

- **自适应**：预览区宽度自适应窗口大小
- **手机**：模拟手机屏幕宽度（375px）
- **宽屏**：固定宽度（900px）

## 开发指南

### 核心组件

- `MarkdownEditor`：主编辑器组件，协调编辑器、预览区、工具栏和侧栏的联动
- `FileExplorer`：文件浏览器组件，管理文件夹树和文件选择状态
- `FileTree`：递归文件树组件，支持展开/收起和右键菜单
- `TabBar`：标签页组件，管理多文件的打开和切换
- `Toolbar`：工具栏组件，提供样式设置和快捷操作

### 核心功能实现

- `renderMarkdown`：Markdown 渲染函数，将 Markdown 文本转换为适合微信的 HTML
- `useElectronFile`：文件操作 Hook，区分 Electron 和网页环境，处理本地文件读写
- `useCopy`：复制功能 Hook，处理复制为微信公众号格式
- `useStore`：状态管理 Hook，管理编辑器内容和用户设置
- `ThemeContext`：主题上下文，负责主题样式的实时应用

## 贡献指南

我们欢迎任何形式的贡献，包括但不限于：

- 提交 bug 报告
- 提交功能请求
- 提交代码修复
- 提交新功能实现
- 改进文档

### 贡献步骤

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 提交 [Issue](https://github.com/flyeric0212/wx-md/issues)
- 发送邮件至 [bo.liang0212@outlook.com](mailto:bo.liang0212@outlook.com)

## 致谢

感谢所有为本项目做出贡献的开发者和用户。
