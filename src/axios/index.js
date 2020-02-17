//导入axios
import axios from 'axios'
import Vue from 'vue'
axios.defaults.baseURL = 'http://39.105.182.200:8888/api/private/v1'
//请求拦截器
axios.interceptors.request.use(config => {
  //请求头添加token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios