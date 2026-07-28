# AI Product Portfolio

一个面向 AI 创业公司招聘负责人的个人产品作品集，使用 Vue 3 + Vite 构建。

## 安装与运行

```bash
npm install
npm run dev
```

打开终端显示的本地地址（默认 `http://localhost:5173`）。

## 修改个人信息

在 `src/App.vue` 与 `index.html` 中搜索并替换：`杜雨菲`、`duyufei000@126.com`、`https://github.com/yuyuyyyyyyyyyyyy`。将个人头像 `photo.jpg` 和 `resume.pdf` 放入 `public/`。

## 生产构建

```bash
npm run build
npm run preview
```

构建结果位于 `dist/`。

## 部署到 Vercel

1. 将项目推送到 GitHub。
2. 在 Vercel 选择 **Add New Project** 并导入仓库。
3. Framework Preset 选择 **Vite**；Build Command 使用 `npm run build`；Output Directory 使用 `dist`。
4. 点击 Deploy。

也可安装 Vercel CLI 后运行 `vercel`。

## 部署到 GitHub Pages

若部署在 `https://<username>.github.io/<repo>/`，先在 `vite.config.js` 中加入 `base: '/<repo>/'`。随后构建并发布 `dist/` 目录，或使用 GitHub Actions 的 Vite 官方模板。
