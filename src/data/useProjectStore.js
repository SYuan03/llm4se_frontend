import { defineStore } from "pinia";
import { ref } from "vue";


export const useProjectStore = defineStore({
    id: 'project',
    state: () => ({
        projectName: ref(localStorage.getItem('projectName') || ''),
        projectId: ref(localStorage.getItem('projectId') || '')
    }),
    actions: {
        getProjectName() {
            return this.projectName;
        },
        setProjectName(newName) {
            this.projectName = newName;
            localStorage.setItem('projectName', newName);
        },
        getProjectId() { // 获取 projectId 的方法
            return this.projectId;
        },
        setProjectId(newId) { // 设置 projectId 的方法
            this.projectId = newId;
            localStorage.setItem('projectId', newId);
        },
    }
});
