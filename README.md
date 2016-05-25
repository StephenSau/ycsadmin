# 壹财税运营管理后台 #

---

## 一、初始化前端开发环境（可选） ##

请按以下顺序进行软件安装（若本机已安装过NodeJS, Ruby, Sass及Gulp的话，可跳过此步骤）：

1. 安装[NodeJS](http://nodejs.org/)
2. 安装[Ruby 2.0](http://rubyinstaller.org/downloads/)
3. 安装[Sass](http://www.sass-lang.com/install)
4. 在命令行下执行 `npm install --global gulp`

---

## 二、本地配置（必须） ##

1. 将本工作区clone到本地
2. 打开命令行，cd到`public`文件夹，然后按顺序执行下列指令

```
npm install
npm update
```

至此，运行环境和本地配置完毕。

---

## 三、日常开发 ##

准备开发前，通过命令行cd到`public`文件夹，输入以下指令即可：

```
gulp
```

Gulp会自动打包文件到js及css目录下

---

## 四、前端文件规范 ##

- 开发版本的CSS文件位于`scss`目录下；
- 开发版本的Javascript文件位于`scripts`（而非`js`）目录下；
- Controller统一放置于`scripts/ycs/controller`目录下
- Directive统一放置于`scripts/ycs/directive`目录下

----

## 五、常用Gulp指令 ##

### 5.1 最常用 ###

- 日常开发：`gulp`
- 准备发布到测试环境：`gulp qa`
- 生成发布到生产环境的zip文件：`gulp zip`

### 5.2 不常用 ###

- 重置两个`index.html`文件的版本时间戳：`gulp rev:reset`
- 清理中介文件：`gulp clean`

[壹财税官网](http://www.1caishui.com/)