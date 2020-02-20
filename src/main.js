import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element'
//导入阿里矢量图样式
import './assets/fonts/iconfont.css'
//导入全局样式表
import '@/assets/css/global.css'
//导入axios网络请求
import '@/axios'
//导入treetable插件
import TreeTable from 'vue-table-with-tree-grid'

Vue.config.productionTip = false

Vue.component('tree-table',TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
