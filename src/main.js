import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element'
//导入阿里矢量图样式
import './assets/fonts/iconfont.css'
//导入全局样式表
import '@/assets/css/global.css'
//导入axios
import axios from 'axios'
axios.defaults.baseURL = 'http://39.105.182.200:8888/api/private/v1'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
