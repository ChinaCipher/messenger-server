# China Cipher Messenger Server

我们看见了中华人民共和国对于其人民秘密通讯权利的剥夺，对于其打压人权运动以及独裁专政的作风，意识到中国人需要一个简单、方便又安全的通讯软件，因此我们开发了这一套：China Cipher Messenger。

其后端采用 Node.js 易扩充的 Web 后端框架 Koa，并采用原作者为中国人的流行 Web 前端框架 Vue.js，搭配 MongoDB 作为资料库使用。

## 建置服务

1. 安装依赖项目
```bash
yarn install
```

2. 运行于开发模式
```bash
yarn dev
```

3. 将原始代码透过 Babel 编译
```bash
yarn build
```

4. 运行于产品模式
```bash
yarn serve
```

## 许可证

MIT License

## 用户端专案

- [China Cipher Messenger Vue](https://github.com/ChinaCipher/messenger-vue)