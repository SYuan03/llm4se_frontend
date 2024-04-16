<template>
    <div class="box-cards">
        <el-card class="box-card" v-for="(name, i) in cardNames" :key="i" @click="handleClick(name)"
            :class="{ 'hover-card': true, 'deep-card': messageStore.currentConversationId === name }"
            @mouseover="addArrow(i)" @mouseleave="removeArrow(i)">
            {{ name }}<span v-if="arrowIndex === i"> =></span>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useProjectStore } from "../data/useProjectStore.js";
import { useMessageStore } from "../data/useMessageStore.js";
import BASE_URL from "../../util.js";
const arrowIndex = ref(-1);
const cardNames = ref(["用例图", "概念类图", "系统顺序图", "状态图", "需求规格说明文档", "用例分析文档"])
const projectStore = useProjectStore();
const messageStore = useMessageStore();

onMounted(() => {
    handleClick("用例图");
});
function addArrow(index) {
    arrowIndex.value = index;
}

function removeArrow(index) {
    if (arrowIndex.value === index) {
        arrowIndex.value = -1;
    }
}

const loadHistory = (name, url) => {
    let project_id = projectStore.getProjectId();
    messageStore.setCurrentConversation(name)
    messageStore.setCurrentConversationId(name)
    if (messageStore.isMessagesEmpty(name)) {
        axios.get(url, { project_id })
            .then(function (response) {
                console.log(response.data.data.history);
                loadingHistory(response.data.data.history, name, false);

                if (messageStore.isMessagesEmpty(name)) {
                    loadingHistory(response.data.data.history, name, false);
                }
            })
            .catch(function (error) {
                console.log(error);
                // ElNotification({
                //     title: '出现错误',
                //     message: error.message,
                //     type: 'error',
                // })
            });
    }
}

function handleClick(name) {
    let project_id = projectStore.getProjectId();
    messageStore.setCurrentConversation(name);
    messageStore.setCurrentConversationId(name);

    if (name === "用例图") {
        loadHistory(name, `${BASE_URL}/project/${project_id}/requirement/usecase/diagram/history`);
    } else if (name === "概念类图") {
        loadHistory(name, `${BASE_URL}/project/${project_id}/requirement/conceptual-class-diagram/history`);
    } else if (name === "系统顺序图") {
        loadHistory(name, `${BASE_URL}/project/${project_id}/requirement/system-sequence-diagram/history`);
    } else if (name === "状态图") {
        loadHistory(name, `${BASE_URL}/project/${project_id}/requirement/state-diagram/history`);
    } else if (name === "需求规格说明文档") {
        loadHistory(name, `${BASE_URL}/project/${project_id}/requirement/srs/history`);
    } else if (name === "用例分析文档") {
        loadHistory(name, `${BASE_URL}/project/${project_id}/requirement/usecase/specification/history`);
    }
}

function loadingHistory(history, name) {
    for (let item of history) {
        if (item.role == "user") {
            messageStore.addMessage(name, { text: item.content, isUser: true, isGraphic: false });
        } else if (item.role == "assistant") {
            if (item.checkpoint && messageStore.currentConversationId.includes('图')) {
                messageStore.addMessage(name, { text: item.content, isUser: false, isGraphic: false, checkpoint: item.checkpoint });
            } else {
                messageStore.addMessage(name, { text: item.content, isUser: false, isGraphic: false });
            }
            if (item.checkpoint && item.checkpoint != '' && messageStore.currentConversationId.includes('图')) {
                messageStore.addMessage(name, { text: item.checkpoint, isUser: false, isGraphic: true });
                console.log(item.checkpoint);
            }
        }

    }
    console.log("LoadingHistory结束");
    messageStore.setCurrentConversation(name);
    messageStore.setCurrentConversationId(name);
}

</script>

<style scoped>
.box-cards {
    padding-top: 20px;
    padding-left: 20px;

}

.box-card {
    height: 11vh;
    margin-bottom: 20px;
    width: calc(100% - 20px);

    :hover {
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }
}

.hover-card {
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.hover-card:hover {
    background-color: rgba(205, 248, 255, 0.8);
}

.deep-card {
    background-color: rgb(205, 248, 255);
    /* Change this to the color you want */
}
</style>