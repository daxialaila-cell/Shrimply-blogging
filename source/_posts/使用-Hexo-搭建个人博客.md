---
title: 使用 Hexo 搭建个人博客
date: 2026-06-01 14:00:00
updated: 2026-06-01 14:00:00
tags: [Hexo, 博客, 教程]
categories: [技术]
cover: /img/posts/cover-hexo.svg
sticky: 100
---

## 为什么选择 Hexo

Hexo 是一个快速、简洁且高效的静态博客框架。它使用 Markdown 解析文章，在几秒内即可生成静态网页。

![Hexo 工作流](/img/posts/inline-hexo-workflow.svg)

### 核心优势

- **极快的生成速度** — 百篇文章只需几秒
- **Markdown 写作** — 专注内容而非排版
- **丰富的主题生态** — 数百款开源主题可选
- **一键部署** — GitHub Pages、Vercel、Netlify

### 快速上手

```bash
# 安装 Hexo CLI
npm install hexo-cli -g

# 初始化博客
hexo init my-blog
cd my-blog

# 新建文章
hexo new "我的第一篇文章"

# 本地预览
hexo server

# 生成静态文件
hexo generate
```

### 写作工作流

创建一个新文章后，使用 Markdown 语法写作：

```markdown
---
title: 文章标题
date: 2026-06-01
tags: [标签1, 标签2]
categories: [分类]
---

## 二级标题

正文内容...
```

写完文章后运行 `hexo generate` 即可生成静态 HTML。

### 部署到线上

最简单的方式是使用 **GitHub Pages**：

1. 创建 `username.github.io` 仓库
2. 安装 `hexo-deployer-git`
3. 配置 `_config.yml` 中的 `deploy` 字段
4. 运行 `hexo deploy`

整个过程不超过 5 分钟，你的博客就上线了。
