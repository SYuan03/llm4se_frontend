# 使用官方的 Node.js 16 镜像作为基础镜像
FROM node:18 AS build

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json 到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目文件到工作目录
COPY . .

# 构建项目
RUN npm run build

# 使用 nginx 镜像作为基础镜像
FROM nginx:stable-alpine

# 安装 vim
RUN apk add vim

# 将构建产物复制到 nginx 的网页目录
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# 对外暴露 80 端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
