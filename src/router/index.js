import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '@/components/Login'
// import Home from '@/components/Home'
// import Welcome from '@/components/Welcome'
// import User from '@/components/user/User'
// import Rights from '@/components/power/Rights'
// import Roles from '@/components/power/Roles'
// import Categories from '@/components/goods/Categories'

//懒加载
const Login = () => import('@/components/Login')
const Home = () => import('@/components/Home')
const Welcome = () => import('@/components/Welcome')
const User = () => import('@/components/user/User')
const Rights = () => import('@/components/power/Rights')
const Roles = () => import('@/components/power/Roles')
const Categories = () => import('@/components/goods/Categories')

Vue.use(VueRouter)

const routes = [
  {
    path: '',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: User
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Categories
      }
    ]
  }
]

const router = new VueRouter({
  routes,
  mode: 'history',
  base: '/shop'
})

//挂载路由导航守卫
router.beforeEach((to,from,next) => {
  //检测要跳转的是否是登录页，是则放行
  if(to.path == '/login') return next()
  //不是则检测是否有token值,存在则放行,不存在则返回登录页
  const token = window.sessionStorage.getItem('token')
  if(!token) return next('/login')
  next()
})

export default router
