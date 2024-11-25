# 多人在线贪吃蛇游戏

一个基于 WebSocket 的实时多人贪吃蛇游戏。

## 功能特点

- 实时多人游戏
- WebSocket 通信
- 随机生成食物和障碍物
- 实时分数统计
- 玩家列表显示
- 碰撞检测
- 边界环绕

## 技术栈

- 前端：HTML5 Canvas, Vanilla JavaScript
- 后端：Node.js, Express
- 网络：WebSocket (ws)

## 安装说明

1. 克隆仓库：
```bash
git clone [repository-url]
cd multiplayer-snake
```

2. 安装依赖：
```bash
npm install
```

3. 启动服务器：
```bash
npm start
```

4. 访问游戏：
打开浏览器访问 `http://localhost:3000`

## 游戏说明

1. 输入用户名登录
2. 使用方向键（↑↓←→）控制蛇的移动
3. 吃到食物可以增加长度和分数
4. 避免撞到其他玩家或障碍物
5. 可以穿过边界到达对面

## 在线演示

访问 [Replit Demo](https://9a124e0c-f479-48af-a701-2ca9816a9013-00-pzqo8fd1p3c4.pike.replit.dev/) 体验游戏

## 开发说明

### 目录结构
```
.
├── index.html      # 游戏前端界面
├── server.js       # WebSocket 服务器
├── package.json    # 项目配置
└── README.md       # 项目说明
```

### WebSocket 消息类型

- login: 玩家登录
- loginSuccess: 登录成功
- loginError: 登录错误
- gameState: 游戏状态更新
- update: 玩家状态更新

## 许可证

MIT License

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 发起 Pull Request

## 联系方式

如有问题或建议，请提交 Issue。
