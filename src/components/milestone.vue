<template>
  <el-card class="box-card" style="margin-bottom: 20px;height: 78%;width: 100%">
    <div slot="header" class="clearfix">
      <span>工作区</span>
    </div>
    <el-scrollbar max-height="70vh">
      <!--            <Codemirror style="text-align: left" ref="cmEditor"-->
      <!--                v-model="mileStoneStore.workingSpace.find(c => c.id === messagesStore.currentConversationId).mileStone"-->
      <!--                :options="cmOptions" />-->
      <div ref="cmEditor" style="width: 100%; height: 65vh; text-align: left;"></div>
    </el-scrollbar>
  </el-card>
  <el-dialog v-model="openPreviewVisible" title="PREVIEW" close-on-click-modal close-on-press-escape>
    <div v-if="isMarkdown"
         v-html="markedText(mileStoneStore.workingSpace.find(c => c.id === messagesStore.currentConversationId).mileStone)"
         style="text-align: left;">
    </div>
    <div v-else>
      <el-image
          :src="paintImage(mileStoneStore.workingSpace.find(c => c.id === messagesStore.currentConversationId).mileStone)"
          :preview-src-list="[paintImage(mileStoneStore.workingSpace.find(c => c.id === messagesStore.currentConversationId).mileStone)]"
          fit="cover"/>
    </div>
  </el-dialog>
  <el-row>
    <el-col :span="12">
      <el-button type="primary" @click="openPreviewVisible = true"
                 style="width: 60%; height:100%;font-size: 16px;">预览
      </el-button>
    </el-col>
    <el-col :span="12">
      <el-button type="primary" @click="saveMileStone"
                 style="width:60% ;height:100%;font-size: 15px;">保存为里程碑
      </el-button>
    </el-col>
  </el-row>
</template>


<script setup>
import {ref, onMounted, nextTick, watch, onBeforeUnmount} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
// import { Codemirror } from 'vue-codemirror';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/edit/closebrackets.js';
import {useMessageStore} from "../data/useMessageStore.js";
import {useMileStoneStore} from "../data/useMileStoneStore";
import {useProjectStore} from "../data/useProjectStore.js";
import {marked} from "marked";
import {encode} from "plantuml-encoder";
import axios from "axios";
import BASE_URL from "../../util.js";

const openPreviewVisible = ref(false);      // boolean variable to determine if the preview can be seen  or not
const mileStoneStore = useMileStoneStore()
const messagesStore = useMessageStore();
const projectStore = useProjectStore();

// markdown editor
const cmEditor = ref();

// const cmOptions = ref({
//     tabSize: 4,
//     mode: 'text/javascript',
//     theme: 'base16-dark',
//     lineNumbers: true,
//     line: true,
// })

let stopWatch

onMounted(() => {
  nextTick(() => {
    const editor = CodeMirror(cmEditor.value, {
      value: '',
      lineNumbers: true,
      line: true,
      mode: 'text/plain',
      tabSize: 4,
      autoCloseBrackets: true,
      smartIndent: true
    });
    editor.setSize("100%", "100%");

    editor.on("change", () => {
      const currentId = messagesStore.currentConversationId;
      const currentValue = editor.getValue();
      const workingSpace = mileStoneStore.workingSpace.find(c => c.id === currentId);
      if (workingSpace) {
        workingSpace.mileStone = currentValue;
      }
    });

    // 监听 Vue 数据模型的更改
    stopWatch = watch(() => mileStoneStore.workingSpace.find(c => c.id === messagesStore.currentConversationId).mileStone, (newVal) => {
      if (newVal !== editor.getValue()) {
        editor.setValue(newVal);
      }
    });
  });
})

onBeforeUnmount(()=>{
  stopWatch()
})

function paintImage(image) {
  let encodedMilestone = encode(image);
  let plantUmlUrl = `http://www.plantuml.com/plantuml/svg/${encodedMilestone}`;
  return plantUmlUrl;
}


function convertRequirementsToText(checkpoint) {
  let text = "";

  // Introduction section
  const intro = checkpoint.introduction;
  text += `### 引言\n\n`;
  for (let key in intro) {
    if (key === 'purpose') {
      text += `#### 1.1 目的\n${intro[key]}\n\n`;
    } else if (key === 'scope') {
      text += `#### 1.2 范围\n${intro[key]}\n\n`;
    } else if (key === 'definitions_acronyms_and_abbreviations') {
      text += `#### 1.3 定义、首字母缩写和缩略语\n${intro[key]}\n\n`;
    } else if (key === 'references') {
      text += `#### 1.4 参考文献\n${intro[key]}\n\n`;
    } else if (key === 'overview') {
      text += `#### 1.5 文档组织\n${intro[key]}\n\n`;
    }
  }

  // Overall description section
  const overallDesc = checkpoint.overall_description;
  text += `### 总体描述\n\n`;
  for (let key in overallDesc) {
    if (key === 'product_perspective') {
      text += `#### 2.1 产品前景\n${overallDesc[key]}\n\n`;
    } else if (key === 'product_functions') {
      text += `#### 2.2 产品功能\n${overallDesc[key]}\n\n`;
    } else if (key === 'user_characteristics') {
      text += `#### 2.3 用户特征\n${overallDesc[key]}\n\n`;
    } else if (key === 'constraints') {
      text += `#### 2.4 约束\n${overallDesc[key]}\n\n`;
    } else if (key === 'assumptions_and_dependencies') {
      text += `#### 2.5 假设和依赖\n${overallDesc[key]}\n\n`;
    }
  }

  // Specific requirements section
  const specReqs = checkpoint.specific_requirements;
  text += `### 详细需求描述\n\n`;

  // External interface requirements
  const extInterfaceReqs = specReqs.external_interface_requirements;
  text += `#### 3.1 对外接口需求\n`;
  for (let key in extInterfaceReqs) {
    if (key === 'user_interfaces') {
      text += `##### 3.1.1 用户界面\n${extInterfaceReqs[key]}\n\n`;
    } else if (key === 'hardware_interfaces') {
      text += `##### 3.1.2 硬件接口\n${extInterfaceReqs[key]}\n\n`;
    } else if (key === 'software_interfaces') {
      text += `##### 3.1.3 教件接口\n${extInterfaceReqs[key]}\n\n`;
    } else if (key === 'communications_interfaces') {
      text += `##### 3.1.4 通信接口\n${extInterfaceReqs[key]}\n\n`;
    }
  }

  // Functional requirements
  const funcReqs = specReqs.functional_requirements;
  text += `#### 3.2 功能需求\n`;
  funcReqs.forEach((feature, index) => {
    text += `##### 3.2.${index + 1} ${feature.feature_name}\n###### 3.2.${index + 1}.1 特性描述\n${feature.introduction_of_feature}\n\n`;
    text += `###### 3.2.${index + 1}.2 刺激/响应序列\n${feature.stimulus_response_sequence}\n\n`;
    text += `###### 3.2.${index + 1}.3 相关功能需求\n${feature.associated_functional_requirements}\n\n`;
  });

  // Performance requirements
  text += `#### 3.3 性能需求\n${specReqs.performance_requirements}\n\n`;

  // Design constraints
  text += `#### 3.4 约束\n${specReqs.design_constraints}\n\n`;

  // Software system attributes
  text += `#### 3.5 质量属性\n${specReqs.software_system_attributes}\n\n`;

  // Other requirements
  text += `#### 3.6 其他需求\n${specReqs.other_requirements || "无。"}\n\n`;

  return text;
}


// preview
const isMarkdown = ref(false);       // check is a markdown txt or is a plantUML code
// watch function used to monitor the change of code.value and output it in HTML form
// plantUml

function markedText(text) {
  console.log(text);
  return marked(text);
}


/// save the milestone button
const saveMileStone = () => {
  ElMessageBox.confirm(
      "milestone will be saved. Continue?",
      "Warning",
      {
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
        type: "warning"
      }
  )
      .then(async () => {
        await handleSaveMileStone();
        ElMessage({
          type: "success",
          message: "Save completed"
        })
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "save canceled"
        })
      })
}

async function handleSaveMileStone() {
  let name = messagesStore.currentConversationId;
  let project_id = projectStore.getProjectId();
  console.log("发送请求");
  if (name === "用例图") {
    return handlePost(`${BASE_URL}/project/${project_id}/requirement/usecase/diagram/milestone`);
  } else if (name === "概念类图") {
    return handlePost(`${BASE_URL}/project/${project_id}/requirement/conceptual-class-diagram/milestone`);
  } else if (name === "系统顺序图") {
    return handlePost(`${BASE_URL}/project/${project_id}/requirement/system-sequence-diagram/milestone`);
  } else if (name === "状态图") {
    return handlePost(`${BASE_URL}/project/${project_id}/requirement/state-diagram/milestone`);
  }
}

async function handlePost(url) {
  let name = messagesStore.currentConversationId;
  let content = mileStoneStore.workingSpace.find(c => c.id === messagesStore.currentConversationId).mileStone;
  try {
    const response = await axios.post(url, {
      milestone: content
    });
    console.log(response);
  } catch (error) {
    console.log(error);
  }
}
</script>
