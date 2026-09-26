# assets/home-shots

首页下面「一个标题 + 一张图」那几块的**原图**（设计稿尺寸的截图，最宽 4480 px）。

放在这里而不是 `public/`：这里是构建输入，不是要发布的东西。
直接发原图等于让浏览器下 1.3 MB、11 MP 的截图去填 832 px 宽的图区。

跑一次生成脚本，会按宽度压成 AVIF/WebP 输出到 `public/home/`：

```bash
node scripts/optimize-home-shots.mjs   # 需要 ffmpeg
```

改图/加图的完整流程见 `scripts/home-shots-plan.mjs` 的注释。产物提交进仓库，
所以日常构建和部署不需要 ffmpeg。
