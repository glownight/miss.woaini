# 个人作品展示网站

一个使用 React + TypeScript 构建的现代化个人作品展示网站，具有炫酷的动画效果和响应式设计。

## ✨ 特性

- 🎨 **现代化设计** - 渐变背景、毛玻璃效果、流畅动画
- 📱 **响应式布局** - 完美适配桌面端、平板和移动设备
- ⚡ **高性能** - 基于 Vite 构建，快速加载
- 🔧 **TypeScript** - 类型安全，更好的开发体验
- 🚀 **一键部署** - 优化的 Vercel 部署配置

## 🛠️ 技术栈

- **前端框架**: React 18
- **类型系统**: TypeScript
- **构建工具**: Vite
- **样式**: CSS3 (原生CSS，包含动画和响应式设计)
- **部署平台**: Vercel

## 🚀 快速开始

### 本地开发

1. 克隆项目
```bash
git clone <your-repo-url>
cd miss.woaini
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 打开浏览器访问 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📦 部署到 Vercel

### 方法一：通过 Vercel CLI

1. 安装 Vercel CLI
```bash
npm i -g vercel
```

2. 登录 Vercel
```bash
vercel login
```

3. 部署项目
```bash
vercel
```

### 方法二：通过 GitHub 集成

1. 将代码推送到 GitHub 仓库
2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "New Project"
4. 选择你的 GitHub 仓库
5. Vercel 会自动检测项目配置并部署

## 🎨 自定义内容

### 修改个人信息

编辑 `src/App.tsx` 文件中的以下内容：

```typescript
// 个人信息
<h1 className="name">你的姓名</h1>
<p className="title">你的职位</p>
<p className="description">你的个人介绍</p>

// 联系方式
<a href="mailto:your-email@example.com" className="contact-btn">
  📧 联系我
</a>
<a href="https://github.com/yourusername" className="contact-btn">
  🔗 GitHub
</a>
```

### 修改技能栈

```typescript
const skills = [
  "你的技能1", "你的技能2", "你的技能3", 
  // 添加更多技能...
]
```

### 修改项目展示

```typescript
const projects: Project[] = [
  {
    id: 1,
    title: "项目名称",
    description: "项目描述",
    url: "项目链接",
    tech: ["技术1", "技术2"]
  },
  // 添加更多项目...
]
```

## 🎯 项目结构

```
miss.woaini/
├── public/                 # 静态资源
├── src/
│   ├── App.tsx            # 主应用组件
│   ├── App.css            # 样式文件
│   ├── main.tsx           # 应用入口
│   └── vite-env.d.ts      # TypeScript 声明
├── vercel.json            # Vercel 部署配置
├── package.json           # 项目依赖
└── README.md              # 项目说明
```

## 🌟 设计特色

- **动态渐变背景** - 15秒循环的多色渐变动画
- **毛玻璃效果** - backdrop-filter 实现的现代化卡片设计
- **悬停动画** - 丰富的交互反馈效果
- **浮动动画** - 头像的自然浮动效果
- **文字发光** - 姓名的动态发光效果
- **响应式网格** - 自适应的技能和项目展示布局

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
