<template>
  <el-card class="box-card" style="margin-bottom: 20px;height: 78%;width: 100%">
    <div slot="header" class="clearfix">
      <span>里程碑</span>
    </div>
    <el-scrollbar max-height="70vh">
      <!-- TODO: tree 树状结构展示checkpoint-->
      <el-tree :data="data" :props="defaultProps" @node-click="handleNodeClick" :render-content="renderContent"
        style="text-align: left" :expand-on-click-node="false">

      </el-tree>
    </el-scrollbar>
  </el-card>
  <el-dialog v-model="openPreviewVisible" title="PREVIEW" close-on-click-modal close-on-press-escape>
    <div v-if="isMarkdown" v-html="markedText(convertTreeToMarkdown(data))" style="text-align: left;">
    </div>
    <!--<div v-else>-->
    <!--    <el-image :src="plantUmlCode" :preview-src-list="[plantUmlCode]" fit="cover" />-->
    <!--</div>-->
  </el-dialog>
  <el-row>
    <el-col :span="12">
      <el-button type="primary" @click="openPreviewVisible = true" style="width: 60%; height:100%;font-size: 16px;">预览
      </el-button>
    </el-col>
    <el-col :span="12">
      <el-button type="primary" @click="saveMileStone" style="width:60% ;height:100%;font-size: 15px;">保存为里程碑
      </el-button>
    </el-col>
  </el-row>
</template>


<script setup>
import { ref, reactive, nextTick, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
// import { Codemirror } from 'vue-codemirror';
import { useMileStoneStore } from "../data/useMileStoneStore";
import { useProjectStore } from "../data/useProjectStore";
import { useMessageStore } from "../data/useMessageStore";
import { marked } from "marked";
import { encode } from "plantuml-encoder";
import axios from "axios";
import BASE_URL from "../../util.js";

const openPreviewVisible = ref(false);      // boolean variable to determine if the preview can be seen  or not
const mileStoneStore = useMileStoneStore(); // use the store to get the milestone
const projectStore = useProjectStore();     // use the store to get the project id
const messageStore = useMessageStore();     // use the store to get the message


// new
function convertTreeToMarkdown(treeNodes, level = 1) {
  let markdownText = "";

  // 遍历树节点
  treeNodes.forEach(node => {
    // 根据层级确定 Markdown 标题的级别
    const prefix = '#'.repeat(level);

    // 将节点标签转换为 Markdown 标题
    markdownText += `${prefix} ${node.label}\n\n`;

    // 如果节点有子节点，递归地调用函数处理它们
    if (node.children && node.children.length > 0) {
      markdownText += convertTreeToMarkdown(node.children, level + 1);
    }

    // 如果节点有内容，则添加内容
    if (node.value) {
      markdownText += `${node.value}\n\n`;
    }
  });

  return markdownText;
}


const obj = mileStoneStore.workingSpace.find(c => c.id === '需求规格说明文档');
console.log("obj")
console.log(obj)

const should = ref("### 引言\n\n#### 1.1 目的\n本需求规格说明文档旨在详细说明“记账软件”项目的需求，包括功能需求、性能需求、界面设计与约束条件等，以指导软件的设计、实现和验证过程。\n\n#### 1.2 范围\n“记账软件”是一款帮助用户追踪日常活动、记录饮食、设定健康目标并提供相应反馈建议的应用软件。该软件还包括定时提醒功能，并且注重用户界面友好性和数据的安全性。\n\n#### 1.3 定义、首字母缩写和缩略语\n- UI - User Interface（用户界面）\n- API - Application Programming Interface（应用程序接口）\n\n#### 1.4 参考文献\n本文档目前没有明确的参考文献。\n\n#### 1.5 文档组织\n后续章节将分为“总体描述”和“详细需求描述”，覆盖产品概述、功能细节及其他重要的技术说明细节。\n\n### 总体描述\n\n#### 2.1 产品前景\n“记账软件”致力于创建一个全方位健康管理平台，以监测和促进个人健康和生活质量。通过高效的数据跟踪与分析，用户能更好地理解和实现其健康目标。\n\n#### 2.2 产品功能\n- 活动监测：追踪用户日常活动，并提供历史数据查看。\n- 饮食记录：记录每日饮食情况，提供卡路里信息参考。\n- 健康目标设定：设定个性化健康目标，并依据用户进度提供反馈。\n- 提醒功能：自定义活动和饮食记录的提醒。\n\n#### 2.3 用户特征\n适用于有追踪健康活动需求、对饮食卡路里有记录需求以及愿意进行健康目标管理的用户。\n\n#### 2.4 约束\n- 数据同步需要保证在多种设备上的一致性和及时性。\n- 必须遵循相关的数据保护法规，确保用户隐私安全。\n\n#### 2.5 假设和依赖\n- 假设用户使用的设备能够连接互联网并具备基本的数据传输功能。\n- 依赖于第三方API提供食物库的卡路里数据。\n\n### 详细需求描述\n\n#### 3.1 对外接口需求\n##### 3.1.1 用户界面\n- 设计一个直观、易用的UI，支持个性化主题色设置。\n  \n##### 3.1.2 硬件接口\n- 支持常见移动设备的内置传感器，如计步器。\n\n##### 3.1.3 软件接口\n无。\n\n##### 3.1.4 通信接口\n- 需与服务器通信同步用户数据。\n- 调用第三方API获取食品卡路里信息。\n\n#### 3.2 功能需求\n##### 3.2.1 系统特性1 - 活动监测\n###### 3.2.1.1 特性描述\n- 能够追踪用户的日常活动数据，如步数、跑步距离和消耗的卡路里。\n- 支持查看过去的活动历史。\n  \n###### 3.2.1.2 刺激/响应序列\n- 用户进行活动，如走路或跑步。\n- 应用收集活动数据并显示当前活动状态。\n- 用户可以请求历史活动记录并获得展示。\n\n###### 3.2.1.3 相关功能需求\n- 实时更新用户活动数据。\n- 提供图表显示活动趋势分析。\n\n##### 3.2.2 系统特性2 - 饮食记录\n###### 3.2.2.1 特性描述\n- 允许用户记录每天的饮食及对应的卡路里摄入。\n- 向用户提供一个内置的食品卡路里数据库。\n\n###### 3.2.2.2 刺激/响应序列\n- 用户输入饮食信息。\n- 应用根据用户输入或选择提供的食物数据计算卡路里。\n- 用户查看每日或累计的卡路里摄入。\n\n###### 3.2.2.3 相关功能需求\n- 食物数据库需要包含常见食物的卡路里信息。\n- 提供简单的饮食记录方式，例如扫码输入或搜索数据库。\n\n...以此类推，为其他系统特性也详细规定功能需求。\n\n#### 3.3 性能需求\n- 数据同步不应超过5秒延迟。\n- 应用应支持在iOS及Android系统上流畅运行。\n\n#### 3.4 约束\n- 产品必须遵守软件平台商店的发布规定。\n\n#### 3.5 质量属性\n- 易用性：直观的用户界面设计、个性化主题设置。\n- 可用性：高可用性和最小化运行错误。\n- 安全性：保证数据加密和隐私保护。\n\n#### 3.6 其他需求\n无。\n\n---\n\n根据当前提供的项目信息，已经描述了需求规格说明文档的主要构成部分。上述文本遵循了IEEE830-1998的模板格式，并结合了所提供的项目进展信息。应注意，实际文档中的某些部分（如用例图和系统顺序图）当前还未提供详细信息，需在后续开发阶段补充。\n\n下面是我猜测您可能接下来会问的问题：\n1. 我们还需要提供哪些信息才能进一步完善需求规格说明文档？\n2. 我们应该如何确保所有的功能需求都已经被考虑并且符合用户需求？\n3. 如果我们需要添加或更改某些功能，需求规格说明文档应该如何更新？\n4. 如何将需求规格说明文档转化为具体的软件设计任务？")

// markdown editor


// preview
const isMarkdown = ref(true);       // check is a markdown txt or is a plantUML code
// watch function used to monitor the change of code.value and output it in HTML form

function markedText(text) {
  console.log(text);
  return marked(text);
}

const handleNodeClick = (nodeModel, node) => {
  // 仅当点击具体内容的节点时，才切换编辑状态
  if (node.label === '内容') {
    console.log(nodeModel.editing)
    console.log("in handleNodeClick 内容")
  }
}

const data = computed(() => {
  return [
    {
      label: '引言',
      children: [
        {
          label: '目的',
          children: [
            {
              label: '内容',
              // 将value绑定到obj.introduction.purpose
              value: obj.checkpoint.introduction.purpose,
              editing: false,
            }
          ]
        },
        {
          label: '范围',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.introduction.scope,
              editing: false,
            }
          ]
        },
        {
          label: '定义、首字母缩写和缩略语',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.introduction.definitions_acronyms_and_abbreviations,
              editing: false,
            }
          ]
        },
        {
          label: '参考文献',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.introduction.references,
              editing: false,
            }
          ]
        },
        {
          label: '文档组织',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.introduction.overview,
              editing: false,
            }
          ]
        },
      ],
    },
    {
      label: '总体描述',
      children: [
        {
          label: '产品前景',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.overall_description.product_perspective,
              editing: false,
            }
          ]
        },
        {
          label: '产品功能',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.overall_description.product_functions,
              editing: false,
            }
          ]
        },
        {
          label: '用户特征',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.overall_description.user_characteristics,
              editing: false,
            }
          ]
        },
        {
          label: '约束',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.overall_description.constraints,
              editing: false,
            }
          ]
        },
        {
          label: '假设和依赖',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.overall_description.assumptions_and_dependencies,
              editing: false,
            }
          ]
        },
      ],
    },
    {
      label: '详细需求描述',
      children: [
        {
          label: '对外接口需求',
          children: [
            {
              label: '用户界面',
              children: [
                {
                  label: '内容',
                  value: obj.checkpoint.specific_requirements.external_interface_requirements.user_interfaces,
                  editing: false,
                }
              ]
            },
            {
              label: '硬件接口',
              children: [
                {
                  label: '内容',
                  value: obj.checkpoint.specific_requirements.external_interface_requirements.hardware_interfaces,
                  editing: false,
                }
              ]
            },
            {
              label: '软件接口',
              children: [
                {
                  label: '内容',
                  value: obj.checkpoint.specific_requirements.external_interface_requirements.software_interfaces,
                  editing: false,
                }
              ]
            },
            {
              label: '通信接口',
              children: [
                {
                  label: '内容',
                  value: obj.checkpoint.specific_requirements.external_interface_requirements.communications_interfaces,
                  editing: false,
                }
              ]
            },
          ],
        },
        {
          label: '功能需求',
          // 这里需要根据obj.checkpoint.specific_requirements.functional_requirements的长度动态生成
          children: obj.checkpoint.specific_requirements.functional_requirements.map((feature, index) => {
            return {
              label: `${feature.feature_name}`,
              editing: false,   // 这个列表的名字需要能够编辑
              canDelete: true,
              children: [
                {
                  label: '特性描述',
                  children: [
                    {
                      label: '内容',
                      value: feature.introduction_of_feature,
                      editing: false,
                    }
                  ]
                },
                {
                  label: '刺激/响应序列',
                  children: [
                    {
                      label: '内容',
                      value: feature.stimulus_response_sequence,
                      editing: false,
                    }
                  ]
                },
                {
                  label: '相关功能需求',
                  children: [
                    {
                      label: '内容',
                      value: feature.associated_functional_requirements,
                      editing: false,
                    }
                  ]
                },
              ],
            }
          }),
        },
        {
          label: '性能需求',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.specific_requirements.performance_requirements,
              editing: false,
            }
          ]
        },
        {
          label: '约束',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.specific_requirements.design_constraints,
              editing: false,
            }
          ]
        },
        {
          label: '质量属性',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.specific_requirements.software_system_attributes,
              editing: false,
            }
          ]
        },
        {
          label: '其他需求',
          children: [
            {
              label: '内容',
              value: obj.checkpoint.specific_requirements.other_requirements,
              editing: false,
            }
          ]
        },
      ],
    },
  ]

})

// 把tree再转回和milestone一样的格式
// 先建立中英文对照表
const labelToKeyMap = {
  "引言": "introduction",
  "目的": "purpose",
  "范围": "scope",
  "定义、首字母缩写和缩略语": "definitions_acronyms_and_abbreviations",
  "参考文献": "references",
  "文档组织": "overview",
  "总体描述": "overall_description",
  "产品前景": "product_perspective",
  "产品功能": "product_functions",
  "用户特征": "user_characteristics",
  "约束": "constraints",
  "假设和依赖": "assumptions_and_dependencies",
  "详细需求描述": "specific_requirements",
  "对外接口需求": "external_interface_requirements",
  "用户界面": "user_interfaces",
  "硬件接口": "hardware_interfaces",
  "软件接口": "software_interfaces",
  "通信接口": "communications_interfaces",

  "功能需求": "functional_requirements",
  "特性描述": "introduction_of_feature",
  "刺激/响应序列": "stimulus_response_sequence",
  "相关功能需求": "associated_functional_requirements",

  "性能需求": "performance_requirements",
  "质量属性": "software_system_attributes",
  "其他需求": "other_requirements",
}

function convertToMilestone(treeData) {
  const milestone = { checkpoint: {} };

  function buildSection(node, currentObject, parentObject, parentKey) {
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        const key = labelToKeyMap[child.label] || child.label;
        if (child.children && child.children.length > 0) {
          currentObject[key] = {};
          buildSection(child, currentObject[key], currentObject, key);
        } else {
          // 如果节点有value，则直接设置，否则创建一个空对象以便后续添加属性
          // if (child.value) {
          if (child.label === '内容') {
            parentObject[parentKey] = child.value;
          } else {
            currentObject[key] = {};  // 应该走不到这里
          }
        }
      });
    }
  }

  // 初始化构建
  treeData.value.forEach((node) => {
    const key = labelToKeyMap[node.label] || node.label;
    milestone.checkpoint[key] = {};
    buildSection(node, milestone.checkpoint[key]);
  });

  console.log(milestone.checkpoint.specific_requirements.functional_requirements)

  // 打印类型
  console.log(typeof milestone.checkpoint.specific_requirements.functional_requirements)

  // 遍历functional_requirements下的内容
  milestone.checkpoint.specific_requirements.functional_requirements = Object.keys(milestone.checkpoint.specific_requirements.functional_requirements).map((key) => {
    return {
      "feature_name": key,
      ...milestone.checkpoint.specific_requirements.functional_requirements[key] // 使用对象扩展运算符将原始对象的其余部分合并到新对象中
    };
  });

  // 把specific_requirements.constraints这个key改成design_constraints
  // FIX
  milestone.checkpoint.specific_requirements.design_constraints = milestone.checkpoint.specific_requirements.constraints;
  delete milestone.checkpoint.specific_requirements.constraints;

  return milestone;
}

// 使用函数
const milestoneFromTreeData = convertToMilestone(data);
const json1 = JSON.stringify(milestoneFromTreeData.checkpoint);
const json2 = JSON.stringify(obj.checkpoint);
const defaultProps = {
  children: 'children',
  label: 'label',
}

const append = (tree) => {
  const newChild = {
    label: "新系统特性",
    editing: false,   // 这个列表的名字需要能够编辑
    canDelete: true,
    children: [
      {
        label: '特性描述',
        children: [
          {
            label: '内容',
            value: "",
            editing: false,
          }
        ]
      },
      {
        label: '刺激/响应序列',
        children: [
          {
            label: '内容',
            value: "",
            editing: false,
          }
        ]
      },
      {
        label: '相关功能需求',
        children: [
          {
            label: '内容',
            value: "",
            editing: false,
          }
        ]
      },
    ],
  }
  if (!tree.children) {
    tree.children = []
  }
  tree.children.push(newChild)
  // data = [...data]
}

const renderContent = (h, { node, data }) => {
  const divStyle = {
    width: '100%',
  };
  const textareaStyle = {
    width: '100%', // 宽度占满容器
    boxSizing: 'border-box', // 边框包含在宽度内
  };
  if (data.editing) {
    if (data.canDelete) { // 说明是新系统特性那个列表的内容
      return h('div', {
        style: divStyle
      }, [
        h('input', {
          value: data.label, // 设置内容
          onInput: (event) => {
            // 更新节点的值
            data.label = event.target.value;  // 注意是label
          },
          onBlur: () => {
            data.editing = false; // 退出编辑状态
          }
        })
      ]);
    }

    // 正在编辑状态
    return h('div', {
      style: divStyle
    }, [
      h('textarea', {
        style: textareaStyle,
        rows: 12, // 默认显示8行
        value: data.value, // 设置内容
        onInput: (event) => {
          // 更新节点的值
          data.value = event.target.value;
        },
        onBlur: () => {
          data.editing = false; // 退出编辑状态
        }
      })
    ]);
  } else {
    if (node.label === '功能需求') {
      // 需要多一个append按钮
      return h(
        'span',
        {
          class: 'custom-tree-node',
        },
        h('span', null, node.label),
        h(
          'span',
          null,
          h(
            'a',
            {
              onClick: () => append(data),
            },
            '新增系统特性'
          ),
        )
      )
    }

    if (data.canDelete) { // 这里要用data而不是node
      console.log("in renderContent 新系统特性")
      console.log(node)
      // 需要多一个删除按钮
      return h(
        'span',
        {
          class: 'custom-tree-node',
        },
        h('span', null, node.label),
        h(
          'span',
          null,
          h(
            'a',
            {
              onClick: () => {
                data.editing = true;
              },
            },
            '编辑名称'
          ),
        ),
        h(
          'span',
          null,
          h(
            'a',
            {
              onClick: () => {
                const parent = node.parent;
                const children = parent.data.children || [];
                const index = children.indexOf(data);
                if (index > -1) {
                  children.splice(index, 1);
                }
              },
            },
            '删除'
          ),
        )
      )
    }
    // 非编辑状态
    return h('div', [
      h('span', {
        style: "white-space: pre-wrap",
        onClick: () => {
          if (node.label === '内容') {
            console.log("in renderContent 内容")
            data.editing = true;
            nextTick(() => {
              const textarea = document.activeElement?.querySelector('textarea');
              textarea?.focus();
            });
          }
        }
      }, data.value || node.label)
    ]);
  }
};


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

    console.log(convertToMilestone(data));
    let project_id = projectStore.getProjectId();
    let url = `${BASE_URL}/project/${project_id}/requirement/srs/milestone`;
    const response = await axios.post(url, {
      milestone: convertToMilestone(data).checkpoint
    });

    ElMessage({
      type: "success",
      message: "保存成功"
    });
  } catch (error) {
    if (error instanceof Error) {
      ElMessage({
        type: "info",
        message: "取消操作"
      });
    }
  }
}
</script>

<style scoped>
:deep(.custom-tree-node) {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
