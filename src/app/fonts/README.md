# display-cjk.woff2

首页**展示级标题**（hero 大标题、各区块大标题、收尾标题）里中文用的思源黑体子集。

- **字体**：Noto Sans SC（思源黑体，Adobe/Google 同一套设计），SIL Open Font License 1.1，可自由再分发。
- **内容**：只含 `src/i18n/messages/*.json` 里 `home.hero.title`、`home.cta.title`、
  `home.sections.*.title` 出现的汉字（当前 54 个字符），weight 500，约 9 KB。
- **重新生成**：改完标题文案（或换字体/字重）后跑

  ```bash
  node scripts/generate-display-subset.mjs
  ```

  字体族与字重写在脚本顶部的 `FAMILY` / `WEIGHT`。
  ⚠️ 字重必须写进 family 里（`family=Noto+Sans+SC:wght@500`）；写成独立的 `&wght@500`
  Google 会忽略，直接返回 400 字重（踩过一次）。
  产物提交进仓库，构建和部署都不需要联网。
- **怎么用**：`src/app/layout.tsx` 上以 `--font-display-cjk` 挂到 `<html>`；
  `globals.css` 的 `--font-display` 把它排在 Geist 之后 —— 拉丁走 Geist、中文走这个子集，
  子集里没有的字回退到本机思源黑体 / 苹方 / 微软雅黑。
- **注意**：字号/字重由 `.home-hero-title`、`.display-title` 两条 CSS 规则统一给
  （都是 weight 500），组件里不要再写 `font-semibold` 之类，否则会和子集字重打架。
