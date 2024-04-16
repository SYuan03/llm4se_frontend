import { createApp } from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import {
    create,
    NLayout,
    NLayoutHeader,
    NLayoutFooter,
    NLayoutContent,
    NSpace
} from 'naive-ui'
import { createPinia } from "pinia";
import { marked } from 'marked';
const pinia = createPinia();
// 创建 Naive UI 实例
const naive = create({
    components: [NLayout,
        NLayoutHeader,
        NLayoutFooter,
        NLayoutContent,
        NSpace]
})

const app = createApp(App)

app.use(ElementPlus)
app.use(naive)
app.use(pinia);
app.mount('#app')