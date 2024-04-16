
<template>
    <el-row :gutter="20" style="height: 100%">
        <el-col :span="16">
            <chat />
        </el-col>

        <el-col :span="8">
            <srsTree v-if="messagesStore.currentConversationId && messagesStore.currentConversationId === '需求规格说明文档'" />
            <usecase-tree
                v-else-if="messagesStore.currentConversationId && messagesStore.currentConversationId === '用例分析文档'" />
            <Milestone v-else />
        </el-col>
    </el-row>
</template>

<script setup>
import Chat from "./chat.vue";
import Milestone from "./milestone.vue";
import UsecaseTree from "./usecaseTree.vue";
import SrsTree from "./srsTree.vue";
import { useMessageStore } from "../data/useMessageStore.js";
import BASE_URL from "../../util.js";
const messagesStore = useMessageStore();

</script>

