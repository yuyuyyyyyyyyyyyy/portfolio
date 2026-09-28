# AI 应用 / Agent 开发工程师作品集

面向技术面试官和猎头的个人作品集，使用 Vue 3 + Vite 构建。五个项目按求职 Agent、AI Job Radar、多棱镜、牡丹亭、探索运营排序，分别展示问题、技术方案、开发卡点与当前状态。

## 安装与运行

```bash
npm install
npm run dev
```

打开终端显示的本地地址（默认 `http://localhost:5173`）。

## 内容与资源

项目文案和外部链接在 `src/App.vue`；基础样式、赛博朋克主题和简历式布局分别在 `src/redesign.css`、`src/cyberpunk.css`、`src/resume-cyber.css`。图片与演示视频放在 `public/media/`。修改项目事实前，应核对实际代码、演示或已发布页面。

## 生产构建

```bash
npm run build
npm run preview
```

`npm run build` 先执行 Vite 构建，再运行 `scripts/prepare-sites.mjs` 生成 Worker 使用的静态资源。构建结果位于 `dist/`。

## GitHub Pages

仓库的 `.github/workflows/deploy.yml` 在 `master` 更新时运行 `npx vite build`，并把 `dist/` 发布到 GitHub Pages。`vite.config.js` 已使用相对路径 `base: './'`，适配仓库子路径。此工作流与本地 `npm run build` 的 Worker 打包用途不同。
