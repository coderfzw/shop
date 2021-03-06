//导入axios
import axios from 'axios'
import Vue from 'vue'
import NProgress from 'nprogress'
axios.defaults.baseURL = 'http://39.105.182.200:8888/api/private/v1',
// axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
//请求拦截器
axios.interceptors.request.use(config => {
  //展示进度条
  NProgress.start()
  //请求头添加token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
//响应拦截器
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios
