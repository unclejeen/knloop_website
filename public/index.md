# knloop · Agent 原生知识库

> knloop 探索 Agent 作为主要用户时，知识管理可以是什么样子。目标是实现人机对齐，所有内容以 .md 格式存储，不绑定人类用户的同时 对 Agent 更友好。

knloop 会继续探索更适合与 Agent 交互的方案。

*本文件是 https://knloop.ai/ 的 Markdown 版本，随站点内容生成，与 HTML 页面内容一致。*

## 工作流

1. **Human · 制定规则和约束**：写下规范、SOP、QA、复盘和上下文。判断由你沉淀，规则由你定义。
2. **Agent · Agent 读取**：原生支持 Claude Code / Codex 等。Agent 通过 MCP 读写你的笔记。
3. **Agent · Agent 干活**：Agent 按你的规范执行，并回写产出。执行结果继续成为上下文，继续循环。
4. **Git · Git 留痕**：自动 commit & 版本控制。每一次改动都可 diff，随时可以回退。

## 核心能力

### 本地优先，纯 Markdown

本地磁盘原生存储。文件干净、透明、可迁移，不被格式和平台锁定。

### AI 原生协作，开箱即用

自动加载常用 Agent CLI，无需配置。原生支持 Codex、Claude Code、Pi、DeepSeek Harness 等 AI Agent。

### 内置 MCP，外部 Agent 也能读写

你的笔记就是 Agent 的上下文。外部 Agent 可读、可写，产出写回同一个库。

### Git 原生集成，自动 commit & 版本控制

文档像代码一样被管理。每一次改动都有记录，每一次提交都可 diff，方便随时回退。

### 可视化块编辑 + Raw 双模式

块编辑模式、RAW 两种模式无缝切换。超大文档自动进入 RAW 模式。

### 学习成本低，上手即用

交互逻辑自然，打开就能写。Cmd+K 与快捷键符合直觉，新手也能快速进入状态。

## 下载

- 已提供安装包：Windows、Android、Linux（Linux 按发行版选 AppImage / deb / rpm）。
- macOS、iOS：即将推出。
- 全部安装包与历史版本：https://github.com/unclejeen/knloop_website/releases
- 各平台直链与说明见 [安装指南](https://knloop.ai/install.md)。

## 反馈

微信群与 QQ 群的联系方式见 [问题反馈](https://knloop.ai/feedback.md)。
