<template>
  <!-- git add -->
  <el-dialog v-model="dialogVisible" title="是否添加到工作区" :append-to-body="true" style="width:70%;height: 80vh"
    @open="openMergeView" @close="stopWatch">
    <el-row>
      <!--      <el-col :span="10">-->
      <!--        <Codemirror style="text-align: left" ref="cmEditor" v-model="tempMileStone" :options="cmOptions" disabled/>-->
      <!--      </el-col>-->
      <!--      <el-col :span="4">-->
      <!--        <el-button type="primary" @click="addToWorkspace()"-->
      <!--                   style="font-size: 1em; display: flex; justify-content: center; align-items: center;">添加到工作区➡️-->
      <!--        </el-button>-->
      <!--      </el-col>-->
      <!--      <el-col :span="10">-->
      <!--        <Codemirror style="text-align: left" ref="cmEditor"-->
      <!--                    v-model="mileStoneStore.workingSpace.find(c => c.id === messagesStore.currentConversationId).mileStone"-->
      <!--                    :options="cmOptions"/>-->
      <!--        &lt;!&ndash; <div class="text" v-html="markedText(mileStoneStore.getWorkingSpace(messagesStore.currentConversationId))">-->
      <!--</div> &ndash;&gt;-->
      <!--      </el-col>-->
      <el-scrollbar max-height="60vh" style="width: 100%">
        <div ref="cmEditor" style="text-align: left;width: 100%; height: 65vh"></div>
      </el-scrollbar>

    </el-row>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false" size="large">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>

  <div vertical style="height: 80%; background-color: #f2fafb; ">
    <div style="height: 100%">
      <el-scrollbar ref="scrollbarRef" max-height="67vh" style="padding: 1%">
        <div style="display: flex; flex-direction: column;"
          v-for="(message, index) in  messagesStore.currentConversation " :key="index" class="message-container"
          :class="{ 'left': message.isUser === true, 'right': message.isUser === false }">
          <el-row style="width: 100%;margin-bottom: 10px;" :justify="message.isUser === false ? 'start' : 'end'">
            <el-col :span="2" v-if="message.isUser === false">
              <img src='../assets/chat.svg' class="avatar">
            </el-col>
            <el-col :span="16">
              <div v-if="!message.isGraphic">
                <div class="message" style="overflow: auto;word-wrap: break-word; text-align: left;"
                  v-html="markedText(message.text)">
                </div>
              </div>

              <div v-else class="message" style="overflow: auto;word-wrap: break-word;text-align: left;">
                {{ "示例图片如下:" }}
                <el-image :src="paintImage(message.text)" :preview-src-list="[paintImage(message.text)]" fit="cover"
                  hide-on-click-modal />
              </div>
            </el-col>
            <el-col :span="2" v-if="message.isUser === true">
              <img src='../assets/vue.svg' class="avatar">
            </el-col>
          </el-row>
          <el-row>
            <div style="height: 100%;margin-right: 1000%;">
              <el-button size="large" font-size='18' v-if="message.checkpoint" type="primary"
                @click="loadDialog(message.checkpoint)">diff&merge</el-button>
            </div>
          </el-row>

        </div>
        <div v-if="resolveLoadings()" class="message-container" :class="{ 'left': false, 'right': true }">
          <el-row style="width: 100%;margin-bottom: 10px;" justify="start">
            <el-col :span="2">
              <img src='../assets/chat.svg' class="avatar">
            </el-col>
            <el-col :span="16">
              <!--              <div  class="message"-->
              <!--                   style="overflow: auto;word-wrap: break-word; text-align: left;"-->
              <!--                   v-html="markedText('Thinking')">-->
              <!--              </div>-->
              <div class="message"
                style="overflow: auto; word-wrap: break-word; text-align: left; display: flex; align-items: center">
                <p>Thinking</p><span class="dot" id="dot1">.</span><span class="dot" id="dot2">.</span><span class="dot"
                  id="dot3">.</span>
              </div>

            </el-col>
          </el-row>
        </div>
        <!-- gyx suggestion -->
        <div
          v-if="messagesStore.currentConversation.length > 0 && messagesStore.getSuggestions(messagesStore.currentConversationId).length != 0 && !resolveLoadings()"
          style="height: 20%">
          <div style="background-color: #f2fafb;">
            <div style="margin-left: 15%;text-align: left;">
              <el-row :gutter="12">
                <el-col :span="10" @click="handleCardClick(0)">
                  <el-button style="white-space: pre-wrap;" class="suggestion" shadow="always">
                    {{ getSuggestionsByIndex(0) }}
                  </el-button>
                </el-col>

                <el-col :span="10" @click="handleCardClick(1)">
                  <el-button style="white-space: pre-wrap;" class="suggestion" shadow="always">
                    {{ getSuggestionsByIndex(1) }}
                  </el-button>
                </el-col>
              </el-row>
              <el-row :gutter="12">
                <el-col :span="10" @click="handleCardClick(2)">
                  <el-button style="white-space: pre-wrap;" class="suggestion" shadow="always">
                    {{ getSuggestionsByIndex(2) }}
                  </el-button>
                </el-col>

                <el-col :span="10" @click="handleCardClick(3)">
                  <el-button style="white-space: pre-wrap;" class="suggestion" shadow="always">
                    {{ getSuggestionsByIndex(3) }}
                  </el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>


  <div v-if="messagesStore.currentConversation.length > 0" class="chat-input"
    style="height: 14.5%; background-color: #f5f5f5; margin-top: 20px;">
    <div style="position: relative; height: 100%; width: 100%;">
      <el-input v-model="input" type="textarea" placeholder="请输入内容" style="height: 100%; width: 100%;" resize="none"
        :rows="4" @keyup.enter="send"></el-input>
      <el-button type="primary" style="position: absolute; right: 1px; bottom: 2px;" @click="send"
        :loading="resolveLoadings()">发送
      </el-button>
    </div>
  </div>
  <div v-else>
    <el-button type="primary" round @click="initialize(); loading = true"
      style="width: 30%; height: 1%; margin-top: 2%; font-size: 20px;" :loading="resolveLoadings()">
      生成
    </el-button>
  </div>
</template>

<script setup>
// import {Codemirror} from 'vue-codemirror';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/merge/merge.css';
import 'codemirror/addon/merge/merge.js';
import { diff_match_patch, DIFF_EQUAL, DIFF_DELETE, DIFF_INSERT } from 'diff-match-patch';
import { useProjectStore } from "../data/useProjectStore.js";
import { useMessageStore } from "../data/useMessageStore.js";
import { useMileStoneStore } from "../data/useMileStoneStore";
import { ref, reactive, nextTick, onMounted, watch } from 'vue'
import axios from 'axios'
import { marked } from 'marked';
import { encode } from 'plantuml-encoder';

const scrollbarRef = ref(null);
const mileStoneStore = useMileStoneStore()
const tempMileStone = ref('');
const projectStore = useProjectStore();
const messagesStore = useMessageStore();
const dialogVisible = ref(false);
const input = ref('')
import BASE_URL from "../../util.js";
// watch(mileStone, (newValue, oldValue) => {
//     mileStoneStore.setWorkingSpace(messagesStore.currentConversationId, newValue);
//     // 在这里添加你的代码，处理 mileStone 的变化
// });

function mergeShow() {
  dialogVisible.value = !dialogVisible.value;
}

const loading = ref(false)

const cmEditor = ref()
const cmOptions = ref({
  tabSize: 4,
  mode: 'text/javascript',
  theme: 'base16-dark',
  lineNumbers: true,
  line: true,
})


let stopWatch1;
let stopWatch2;
let editor = null
let openMergeView = () => {
  nextTick(() => {
    window.diff_match_patch = diff_match_patch;
    window.DIFF_EQUAL = DIFF_EQUAL;
    window.DIFF_DELETE = DIFF_DELETE;
    window.DIFF_INSERT = DIFF_INSERT;
    if (editor == null) {
      editor = CodeMirror.MergeView(cmEditor.value, {
        value: mileStoneStore.workingSpace.find(c => c.id === messagesStore.currentConversationId).mileStone,
        orig: messagesStore.checkpoints.find(c => c.id === messagesStore.currentConversationId).checkpoint,
        lineNumbers: true,
        line: true,
        mode: 'text/plain',
        tabSize: 4,
        autoCloseBrackets: true,
        smartIndent: true,
        highlightDifferences: true,
        collapseIdentical: false,
        revertButtons: true
      });


      editor.editor().on("change", () => {
        const currentId = messagesStore.currentConversationId;
        const currentValue = editor.editor().getValue();
        const workingSpace = mileStoneStore.workingSpace.find(c => c.id === currentId);
        if (workingSpace) {
          workingSpace.mileStone = currentValue;
        }
      });

      // 监听 Vue 数据模型的更改
      stopWatch1 = watch(() => mileStoneStore.workingSpace.find(c => c.id === messagesStore.currentConversationId).mileStone, (newVal) => {
        if (newVal !== editor.editor().getValue()) {
          editor.editor().setValue(newVal);
          editor.editor().refresh()
        }
      });

      stopWatch2 = watch(() => messagesStore.checkpoints.find(c => c.id === messagesStore.currentConversationId).checkpoint, (newVal) => {
        editor.rightOriginal().setValue(newVal);
        editor.rightOriginal().refresh()
      })
    }
  });
}

function loadDialog(checkpoint) {
  messagesStore.checkpoints.find(c => c.id === messagesStore.currentConversationId).checkpoint = checkpoint
  dialogVisible.value = !dialogVisible.value;
}

//gyx suggestion
function getSuggestionsByIndex(index) {
  return messagesStore.suggestions.find(c => c.id === messagesStore.currentConversationId)?.suggestion[index];
}

function handleCardClick(index) {
  input.value = getSuggestionsByIndex(index);
  send();
}

//

function test() {
  console.log("test");
  dialogVisible.value = !dialogVisible.value;
}

function resolveLoadings() {
  const item = messagesStore.loadings.find(item => item.id === messagesStore.getCurrentConversationId());
  console.log(item);
  return item ? item.loading : false;
}

async function initialize() {
  let Id = messagesStore.getCurrentConversationId();
  messagesStore.loadings.find(item => item.id === Id).loading = true;
  await postInitialize();
  messagesStore.loadings.find(item => item.id === Id).loading = false;
  console.log("initialize完成");
  input.value = '';
}

async function postInitialize() {
  var data;
  let project_id = projectStore.getProjectId();
  let name = messagesStore.getCurrentConversationId();
  if (name === "用例图") {
    data = await handlePost(`${BASE_URL}/project/${project_id}/requirement/usecase/diagram/chat`, true);
    if (data && data.checkpoint) {
      mileStoneStore.workingSpace.find(c => c.id === name).mileStone = data.checkpoint
    }
  } else if (name === "概念类图") {
    data = await handlePost(`${BASE_URL}/project/${project_id}/requirement/conceptual-class-diagram/chat`, true);
    if (data && data.checkpoint) {
      mileStoneStore.workingSpace.find(c => c.id === name).mileStone = data.checkpoint
    }
  } else if (name === "系统顺序图") {
    data = await handlePost(`${BASE_URL}/project/${project_id}/requirement/system-sequence-diagram/chat`, true);
    if (data && data.checkpoint) {
      mileStoneStore.workingSpace.find(c => c.id === name).mileStone = data.checkpoint

    }
  } else if (name === "状态图") {
    data = await handlePost(`${BASE_URL}/project/${project_id}/requirement/state-diagram/chat`, true);
    if (data && data.checkpoint) {
      mileStoneStore.workingSpace.find(c => c.id === name).mileStone = data.checkpoint
    }

  } else if (name === "需求规格说明文档") {
    data = await handlePost(`${BASE_URL}/project/${project_id}/requirement/srs/chat`, true);
    if (data && data.checkpoint) {
      mileStoneStore.setWorkingSpace("需求规格说明文档", data.checkpoint);

    }
  } else if (name === "用例分析文档") {
    data = await handlePost(`${BASE_URL}/project/${project_id}/requirement/usecase/specification/chat`, true);
    console.log(data)
    if (data && data.checkpoint) {
      mileStoneStore.setWorkingSpace("用例分析文档", data.checkpoint);

    }
  }
}

function markedText(text) {
  return marked(text || '');
}

function paintImage(image) {
  let encodedMilestone = encode(image);
  let plantUmlUrl = `http://www.plantuml.com/plantuml/svg/${encodedMilestone}`;
  return plantUmlUrl;
}

async function send() {
  if (!resolveLoadings()) {
    input.value = input.value.trim();
    if (input.value === '') {
      return;
    }
    let name = messagesStore.getCurrentConversationId();
    messagesStore.addMessage(name, { text: input.value, isUser: true, isGraphic: false });
    handleSend();
    input.value = '';

    console.log(scrollbarRef.value)
    await nextTick(() => {
      const container = scrollbarRef.value.$el.querySelector('.el-scrollbar__wrap');
      container.scrollTop = container.scrollHeight;
    });
  } else {
    ElNotification({
      title: '请等待',
      message: '正在思考中',
      type: 'warning',
    })

  }
}

async function handleSend() {

  let Id = messagesStore.getCurrentConversationId();
  messagesStore.loadings.find(item => item.id === Id).loading = true;
  let project_id = projectStore.getProjectId();
  let name = messagesStore.getCurrentConversationId();
  let data;
  if (name === "用例图") {
    data = await handlePost(`${BASE_URL}/project/${project_id}/requirement/usecase/diagram/chat`, false);
    // if (data && data.checkpoint) {
    //   mileStoneStore.checkpoints.find(c => c.id === name).checkpoint = tempMileStone.value = data.checkpoint;
    // }
  } else if (name === "概念类图") {
    data = await handlePost(`${BASE_URL}/project/${project_id}/requirement/conceptual-class-diagram/chat`, false);
    // if (data && data.checkpoint) {
    //   mileStoneStore.checkpoints.find(c => c.id === name).checkpoint = tempMileStone.value = data.checkpoint;

    // }
  } else if (name === "系统顺序图") {
    data = await handlePost(`${BASE_URL}/project/${project_id}/requirement/system-sequence-diagram/chat`, false);
    // if (data && data.checkpoint) {
    //   mileStoneStore.checkpoints.find(c => c.id === name).checkpoint = tempMileStone.value = data.checkpoint;

    // }
  } else if (name === "状态图") {
    data = await handlePost(`${BASE_URL}/project/${project_id}/requirement/state-diagram/chat`, false);
    // if (data && data.checkpoint) {
    //   mileStoneStore.checkpoints.find(c => c.id === name).checkpoint = tempMileStone.value = data.checkpoint;
    // }

  } else if (name === "需求规格说明文档") {
    data = await handlePost(`${BASE_URL}/project/${project_id}/requirement/srs/chat`, false);

  } else if (name === "用例分析文档") {
    data = await handlePost(`${BASE_URL}/project/${project_id}/requirement/usecase/specification/chat`, false);
  }
  messagesStore.loadings.find(item => item.id === Id).loading = false;
  await nextTick(() => {
    const container = scrollbarRef.value.$el.querySelector('.el-scrollbar__wrap');
    container.scrollTop = container.scrollHeight;
  });

}

async function handlePost(url, isInitial) {
  let name = messagesStore.getCurrentConversationId();
  let message = input.value; // 这是你的 message 参数

  if (isInitial) {
    try {
      const response = await axios.post(url, {
        initial: true
      });
      console.log(response.data);
      console.log(response.data.data);
      var item = response.data.data;
      if (item.checkpoint && name.includes('图')) {
        messagesStore.addMessage(name, { text: item.message, isUser: false, isGraphic: false, checkpoint: item.checkpoint });
      } else {
        messagesStore.addMessage(name, { text: item.message, isUser: false, isGraphic: false });
      }
      if (item.checkpoint && item.checkpoint != '' && name.includes('图')) {
        messagesStore.addMessage(name, { text: item.checkpoint, isUser: false, isGraphic: true });
        console.log(item.checkpoint);
      }
      if (item.suggestions && item.suggestions.length != 0) {
        messagesStore.setSuggestions(name, item.suggestions);
      }
      messagesStore.loadings.find(item => item.id === name).loading = false;
      return response.data.data;
    } catch (error) {
      ElNotification({
        title: '出现错误',
        message: error.message,
        type: 'error',
      })
      console.log(error);
    }
  } else {
    let update_ctx = await checkUpdate();
    try {
      const response = await axios.post(url, {
        message,
        update_ctx
      });
      console.log(response.data);
      console.log(response.data.data);
      var item = response.data.data;
      if (item.checkpoint && name.includes('图')) {
        messagesStore.addMessage(name, { text: item.message, isUser: false, isGraphic: false, checkpoint: item.checkpoint });
      } else {
        messagesStore.addMessage(name, { text: item.message, isUser: false, isGraphic: false });
      }
      if (item.checkpoint && item.checkpoint != '' && name.includes('图')) {
        messagesStore.addMessage(name, { text: item.checkpoint, isUser: false, isGraphic: true });
        console.log(item.checkpoint);
      }
      if (item.suggestions && item.suggestions.length != 0) {
        messagesStore.setSuggestions(name, item.suggestions);
      }
      return response.data.data;
    } catch (error) {
      ElNotification({
        title: '出现错误',
        message: error.message,
        type: 'error',
      })
      console.log(error);
    }
  }

}

async function checkUpdate() {
  let project_id = projectStore.getProjectId();
  const name = messagesStore.getCurrentConversationId();
  if (name === "用例图") {
    return await getUpdate(`${BASE_URL}/project/${project_id}/requirement/usecase/diagram/ctx-status`);
  } else if (name === "概念类图") {
    return await getUpdate(`${BASE_URL}/project/${project_id}/requirement/conceptual-class-diagram/ctx-status`);
  } else if (name === "系统顺序图") {
    return await getUpdate(`${BASE_URL}/project/${project_id}/requirement/system-sequence-diagram/ctx-status`);
  } else if (name === "状态图") {
    return await getUpdate(`${BASE_URL}/project/${project_id}/requirement/state-diagram/ctx-status`);
  } else if (name === "需求规格说明文档") {
    return await getUpdate(`${BASE_URL}/project/${project_id}/requirement/srs/ctx-status`);
  } else if (name === "用例分析文档") {
    return await getUpdate(`${BASE_URL}/project/${project_id}/requirement/usecase/specification/ctx-status`);
  }
  return false;
}

async function getUpdate(url) {
  try {
    const response = await axios.get(url);
    console.log(response.data);
    return response.data.data.is_latest;
  } catch (error) {
    console.log(error);
    ElNotification({
      title: '出现错误',
      message: error.message,
      type: 'error',
    })
  }
  return false;
}

</script>

<style scoped>
.suggestion {
  width: 100%;
  height: 5vh;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;

  :hover {
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }
}

.message-container {
  display: flex;
  /* margin-bottom: 1px; */
  align-items: flex-end;
  /* 对齐消息和头像 */
}

.message-container.left {
  justify-content: flex-start;
}

.message-container.right {
  justify-content: flex-end;
}

.message-container .avatar {
  width: 30px;
  height: 30px;
  margin-top: 5px;
  /* 圆形头像 */
}


.message {
  padding: 5px;
  border-radius: 10px;
  background-color: rgb(205, 248, 255);
  max-width: 100%;
}

.message-container.right .message {
  background-color: rgb(205, 248, 255);
  color: black;
}

.message-container.left .message {
  background-color: white;
  color: black;
}

.dot {
  opacity: 0;
  animation-duration: 3s;
  /* 总动画时间 */
  animation-iteration-count: infinite;
}

#dot1 {
  animation-name: blinkingDot1;
}

#dot2 {
  animation-name: blinkingDot2;
}

#dot3 {
  animation-name: blinkingDot3;
}

@keyframes blinkingDot1 {

  0%,
  24% {
    opacity: 0;
  }

  25%,
  100% {
    opacity: 1;
  }

  /* 第一个点显示时间最长 */
}

@keyframes blinkingDot2 {

  0%,
  49% {
    opacity: 0;
  }

  50%,
  100% {
    opacity: 1;
  }

  /* 第二个点显示时间较短 */
}

@keyframes blinkingDot3 {

  0%,
  74% {
    opacity: 0;
  }

  75%,
  100% {
    opacity: 1;
  }

  /* 第三个点显示时间最短 */
}

::v-deep .CodeMirror-merge,
::v-deep .CodeMirror-merge .CodeMirror {
  height: 55vh !important;
}
</style>

