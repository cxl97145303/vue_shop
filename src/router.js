import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './components/Login.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes:[
    {
      path: '/',
      redirect: '/login'    //路由重定向
    },
    {
      path: '/login',
      component: Login
    }
  ]
})

export default router
