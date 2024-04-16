<template>
  <el-card class="box-card" style="margin-bottom: 20px;height: 78%;width: 100%">
    <div slot="header" class="clearfix">
      <span>里程碑</span>
    </div>
    <el-select v-model="selectedItem" placeholder="Select" style="width: 100%; height: 10%" @change="handleChange"
      value-key="name">
      <el-option v-for="item in usecaseList" :key="item.name" :label="item.name" :value="item">
      </el-option>
    </el-select>
    <div>
      <el-scrollbar max-height="70vh" style="height: 80%">
        <!-- TODO: 用下拉框或者树状结构展示milestone -->
        <!--        <Codemirror style="text-align: left" ref="cmEditor" v-model="code" :options="cmOptions" />-->
        <div ref="cmEditor" style="width: 100%; height: 53vh; text-align: left; padding-top: 1vh; padding-bottom: 1vh"></div>
      </el-scrollbar>

      <div style="height: 20%; bottom: 0; text-align: center;">
        <el-row>
          <el-col span="8">
            <el-button type="primary" @click="renameSelectedItem">重命名当前用例</el-button>
          </el-col>
          <el-col span="8">
            <el-button type="primary" @click="deleteSelectedItem">删除当前用例</el-button>
          </el-col>
          <el-col span="8">
            <el-button type="primary" @click="addNewItem">新增用例</el-button>
          </el-col>
        </el-row>
      </div>
    </div>


  </el-card>
  <el-dialog v-model="openPreviewVisible" title="PREVIEW" close-on-click-modal close-on-press-escape>
    <div v-html="markedText(convertRequirementsToText(usecaseList))" style="text-align: left;">
    </div>

  </el-dialog>

  <el-row>
    <el-col :span="12">
      <el-button type="primary" @click="openPreviewVisible = true"
        style="width: 60%; height:100%;font-size: 16px;">预&nbsp览</el-button>
    </el-col>
    <el-col :span="12">
      <el-button type="primary" @click="saveMileStone" style="width:60% ;height:100%;font-size: 15px;">保存为里程碑</el-button>
    </el-col>
  </el-row>
</template>



<script setup>
import { ref, watch,onMounted, onBeforeUnmount,nextTick } from "vue";
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/edit/closebrackets.js';
import BASE_URL from "../../util.js";
import { ElMessage, ElMessageBox } from "element-plus";
// import { Codemirror } from 'vue-codemirror';

import { marked } from "marked";
import { useMileStoneStore } from "../data/useMileStoneStore.js";
import axios from "axios";
import {useProjectStore} from "../data/useProjectStore.js";
const openPreviewVisible = ref(false);      // boolean variable to determine if the preview can be seen  or not
const mileStoneStore = useMileStoneStore();
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
const code = ref('');     // code editor's contents
const selectedItem = ref();

onMounted(() => {
  nextTick(() => {
    const editor = CodeMirror(cmEditor.value, {
      value: code.value,
      lineNumbers: true,
      line: true,
      mode: 'text/plain',
      tabSize: 4,
      autoCloseBrackets: true,
      smartIndent: true
    });
    editor.setSize("100%", "100%");


    editor.on("change", () => {
      const currentValue = editor.getValue();
      code.value = currentValue;
    });

    // 监听 Vue 数据模型的更改
    stopWatch = watch(code, (newVal) => {
      if (newVal !== editor.getValue()) {
        editor.setValue(newVal);
      }
    });
  });
})

onBeforeUnmount(()=>{
  stopWatch()
})

// preview
// const isMarkdown = ref(true);       // check is a markdown txt or is a plantUML code
// watch function used to monitor the change of code.value and output it in HTML form

function convertRequirementsToText(array) {
  console.log("array")
  console.log(array)

  let res = ""
  for (let i = 0; i < array.length; i++) {
    res += "### ";
    res += array[i].name
    res += "\n\n"
    res += array[i].description
    res += "\n\n"
  }
  return res
}

function markedText(text) {
  console.log(text);
  return marked(text);
}

/// save the milestone button
const saveMileStone = async () => {
  try {
    const confirm = await ElMessageBox.confirm(
      "是否保存当前内容到里程碑中",
      "确认信息",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    let project_id = projectStore.getProjectId();
    let url = `${BASE_URL}/project/${project_id}/requirement/usecase/specification/milestone`;
    const response = await axios.post(url, {
      milestone: usecaseList.value
    });

    ElMessage({
      type: "success",
      message: "保存成功"
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      ElMessage({
        type: "info",
        message: "取消操作"
      });
    }
  }
}
//////////////////////////////////////////////////////

// markdown editor
// const cmEditor = ref();


// const cmOptions = ref({
//   tabSize: 4,
//   mode: 'text/javascript',
//   theme: 'base16-dark',
//   lineNumbers: true,
//   line: true,
// })

const usecaseList = ref([]);

usecaseList.value = mileStoneStore.workingSpace.find(c => c.id === '用例分析文档')?.mileStone || []
console.log("usecaseList");
console.log(usecaseList.value);
const handleChange = () => {
  console.log("selectedItem", selectedItem.value);
  code.value = selectedItem.value.description;
}

// 当code发生变化时，更新milestone
watch(code, (newVal, oldVal) => {
  selectedItem.value.description = newVal;
  usecaseList.value.forEach((item) => {
    if (item.name === selectedItem.value.name) {
      item.description = selectedItem.value.description;
    }
  });
})

const renameSelectedItem = () => {
  ElMessageBox.prompt('请输入新的用例名称', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '用例名称不能为空'
  }).then(({ value }) => {
    selectedItem.value.name = value;
    usecaseList.value.forEach((item) => {
      if (item.name === selectedItem.value.name) {
        item.name = selectedItem.value.name;
      }
    });
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '取消输入'
    });
  });
}

const deleteSelectedItem = () => {
  ElMessageBox.confirm('是否删除当前用例', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    usecaseList.value = usecaseList.value.filter((item) => item.name !== selectedItem.value.name);
    // 清空选择器和code区
    selectedItem.value = usecaseList.value[0];    // tag：可能会有bug，也许一个用例都没有
    code.value = selectedItem.value.description;
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '取消删除'
    });
  });
}

const addNewItem = () => {
  ElMessageBox.prompt('请输入新的用例名称', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '用例名称不能为空'
  }).then(({ value }) => {
    usecaseList.value.push({
      name: value,
      description: ''
    });
    selectedItem.value = usecaseList.value[usecaseList.value.length - 1];
    code.value = selectedItem.value.description;
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '取消输入'
    });
  });
}


</script>

<style scoped>
.button-group {
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
</style>
