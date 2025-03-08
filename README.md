# EduNexus 教育培训后台管理系统

## 项目介绍

EduNexus 是一个现代化的教育培训后台管理系统，基于 Vue 3 + TypeScript + Element Plus 开发。系统提供了教学管理、财务管理、系统管理和统计分析等功能，帮助教育培训机构提高管理效率。

## 主要功能

- 首页：显示关键数据概览和系统通知
- 教学管理：学员管理等
- 财务管理：缴费登记等
- 系统管理：用户、部门、角色、权限等管理
- 统计分析：学习进度统计等

## 技术栈

- Vue 3
- TypeScript
- Element Plus
- Vue Router
- Pinia
- ECharts
- Vite
- Sass

## 开发环境

- Node.js >= 16
- npm >= 8

## 项目运行

1. 安装依赖

\`\`\`bash
npm install
\`\`\`

2. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

3. 构建生产版本

\`\`\`bash
npm run build
\`\`\`

## 项目结构

\`\`\`
edu-nexus-frontend/
├── public/             # 静态资源
├── src/
│   ├── api/           # API 接口
│   ├── assets/        # 项目资源
│   ├── components/    # 公共组件
│   ├── composables/   # 组合式函数
│   ├── layouts/       # 布局组件
│   ├── router/        # 路由配置
│   ├── stores/        # 状态管理
│   ├── styles/        # 全局样式
│   ├── types/         # 类型定义
│   ├── utils/         # 工具函数
│   ├── views/         # 页面组件
│   ├── App.vue        # 根组件
│   └── main.ts        # 入口文件
├── .env               # 环境变量
├── index.html         # HTML 模板
├── package.json       # 项目配置
├── tsconfig.json      # TypeScript 配置
└── vite.config.ts     # Vite 配置
\`\`\`

## 开发规范

- 遵循 Vue 3 组合式 API 风格
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 和 Prettier 代码规范
- 组件和函数使用 PascalCase 命名
- 文件使用 kebab-case 命名

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

[MIT](LICENSE) 