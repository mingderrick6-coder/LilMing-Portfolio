# LilMing Portfolio

LilMing 的个人视觉设计作品集，使用 Next.js、React 和 Three.js 构建。

## 本地运行

使用 Node.js 20.9 或更新版本及 pnpm。

```bash
pnpm install --frozen-lockfile
pnpm dev
```

打开 `http://localhost:3000`。

## 生产运行

```bash
pnpm build
pnpm start
```

仓库本身不提供网站托管。部署时使用支持 Next.js 的托管平台或 Node.js 服务器，项目根目录即构建目录。

## 内容维护

- `src/data/projects.ts`：首页 3D 螺旋作品。
- `src/data/collections.generated.json`：作品合集与展示顺序。
- `src/data/about.ts`：个人简介与联系信息。
- `public/`：网站运行所需的图片、字体、音频、动画与下载文件。
- `scripts/`：本地素材导入工具，不参与网站构建；使用前需确认脚本中的素材路径。

网站的版式与部分初始动效参考 `pacomepertant.com`。第三方组件许可见 `third-party/`。
