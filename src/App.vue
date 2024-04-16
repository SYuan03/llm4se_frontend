<template>
  <!--这个dialog是一开始针对的两种情况的项目信息-->
  <el-dialog v-model="dialogVisible" title="项目信息" width="80%">
    <el-row>
      <el-input v-model="newProjectName" placeholder="请输入项目名称" style="margin-bottom: 5%"></el-input>
      <el-input v-model="newProjectDescription" :autosize="{ minRows: 8, maxRows: 16 }" type="textarea"
        placeholder="请输入项目描述" style="margin-bottom: 5%" />
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showReturnedIdDialog">确定</el-button>
        <el-button type="success" @click="showIdDialog">已有项目id，点这里</el-button>
      </span>
    </el-row>
  </el-dialog>

  <!--这个是已有id的情况-->
  <el-dialog v-model="dialogIdVisible" title="输入已有项目Id" width="90%">
    <el-row>
      <el-input v-model="exsitProjectId" placeholder="请输入项目Id" style="margin-bottom: 5%"></el-input>
      <span slot="footer" class="dialog-footer">

        <el-button type="primary" @click="saveExistProjectId">确定</el-button>
      </span>
    </el-row>
  </el-dialog>

  <!--这个是需要新建项目的情况-->
  <el-dialog v-model="dialogReturnedIdVisible" title="您的项目Id，请记住他！" width="90%">
    <el-row>
      <!-- 左侧内容 -->
      <el-input v-model="returnedProjectId">
        <template #suffix>
          <el-icon @click="handleCopy" class="cursor-pointer">
            <CopyDocument />
          </el-icon>
        </template>
      </el-input>
    </el-row>
  </el-dialog>


  <div class="common-layout">
    <el-header style="height:8vh; background-color:rgb(205, 248, 255);display: flex; align-items: center;">
      <el-text class="mx-1" type="primary"
        style="float: left; font-size: 40px; padding-top: 1%; padding-bottom: 1%; padding-left:2%">SE
        Assistant
      </el-text>
      <div style="display: flex;margin-left: auto;">
        <div style="margin-right: 20px;">
          <el-button type="success" @click="exportProject">一键导出</el-button>
        </div>
        <div>
          <el-button type="primary" @click="exitProject">退出项目</el-button>
        </div>
      </div>
    </el-header>
    <el-container style="height:92vh;width: 100%; ">
      <el-container>

        <el-aside style="width: 160px;">
          <Index /> <!-- 侧边栏 -->
        </el-aside>

        <el-main>

          <mainBody />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>

import Chat from "./components/chat.vue";
import Index from "./components/index.vue";
import mainBody from "./components/mainBody.vue";
import { useProjectStore } from "./data/useProjectStore.js";
import axios from "axios";
import { ElMessage } from "element-plus";
import { copyText } from 'vue3-clipboard'
import { CopyDocument } from '@element-plus/icons-vue'
import { useMileStoneStore } from "./data/useMileStoneStore.js"
import BASE_URL from "../util.js";
export default {
  components: {
    Chat,
    CopyDocument,
    Index,
    mainBody,
  },
  data() {
    const store = useProjectStore();
    const newProjectName = "";
    const mileStoneStore = useMileStoneStore();
    const newProjectDescription = "";
    const exsitProjectId = "";
    const returnedProjectId = "";

    return {
      mileStoneStore,
      dialogVisible: false,
      store,
      dialogIdVisible: false,
      dialogReturnedIdVisible: false,
      projectId: "5030ac86-1194-4700-9cac-7e3be38080d1",
      newProjectName,
      newProjectDescription,
      exsitProjectId,
      returnedProjectId,
    };
  },
  mounted() {
    if (this.store.getProjectId() === "") {
      this.dialogVisible = true;
    }
    if (this.store.projectId !== "") {
      axios.get(`${BASE_URL}/project/${this.store.projectId}/progress`)
        .then(response => {
          // 处理 response
          console.log(response);
          this.mileStoneStore.load(response.data.data.progress);
        })
        .catch(error => {
          // 处理错误
          // ElNotification({
          //   title: '出现错误',
          //   message: error.message,
          //   type: 'error',
          // })
          console.error(error);
        });
    }

  },
  methods: {

    showIdDialog() {
      this.dialogVisible = false;
      this.dialogIdVisible = true;
    },

    showReturnedIdDialog() {
      // 这里向后端发送两次请求
      // 第一次是发送项目名称返回项目id
      console.log(this.newProjectName);
      this.store.setProjectName(this.newProjectName);
      axios
        .post(`${BASE_URL}/project`, {
          project_name: this.newProjectName,
        })
        .then((res) => {
          console.log(res);
          this.store.setProjectId(res.data.data.project_id);
          console.log(this.store.getProjectId());
          this.returnedProjectId = this.store.getProjectId();
          console.log(this.returnedProjectId);

          axios
            .post(`${BASE_URL}/project/${this.returnedProjectId}/description`, {
              project_desc: this.newProjectDescription,
            })
            .then((res) => {
              console.log(res);
              this.dialogVisible = false;
              this.dialogReturnedIdVisible = true;
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    },

    handleCopy() {
      console.log(this.returnedProjectId);
      copyText(this.returnedProjectId, undefined, (error) => {
        if (error) {
          ElMessage.warning(`复制失败: ${error} ！`);
        } else {
          ElMessage.success(`复制: ${this.returnedProjectId} 成功！`);
        }
      })
    },

    exitProject() {
      this.store.setProjectId("");
      this.store.setProjectName("");
      this.dialogVisible = true;

      this.returnedProjectId = "";
      this.dialogReturnedIdVisible = false;
      this.dialogIdVisible = false;
      this.newProjectName = "";
      this.newProjectDescription = "";
      this.exsitProjectId = "";
      this.returnedProjectId = "";
    },

    saveExistProjectId() {
      this.dialogIdVisible = false;
      this.store.setProjectId(this.exsitProjectId);

      axios.get(`${BASE_URL}/project/${this.exsitProjectId}/progress`)
        .then(response => {
          // 处理 response
          console.log(response);
          this.store.setProjectName(response.data.data.progress.project_name);
          this.mileStoneStore.load(response.data.data.progress);
        })
        .catch(error => {
          // 处理错误
          console.error(error);
        });
    },

    exportProject() {
      axios.get(`${BASE_URL}/project/${this.store.projectId}/progress`)
        .then(response => {
          // 处理 response
          this.mileStoneStore.load(response.data.data.progress);
          let content = this.mileStoneStore.export();
          // 创建一个 Blob 对象
          const blob = new Blob([content], { type: 'text/markdown' });

          // 创建一个 URL 对象
          const url = URL.createObjectURL(blob);

          // 创建一个下载链接
          const link = document.createElement('a');
          link.href = url;
          let name = this.store.projectName;
          link.download = `${name}.md`;
          // 触发下载
          link.click();
          // 释放 URL 对象
          URL.revokeObjectURL(url);
        })
        .catch(error => {
          // 处理错误
          console.error(error);
        });
    },
  }
};
</script>
<style scoped>
.common-layout {
  height: 100%;
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
