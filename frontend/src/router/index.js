/**
 * Vue Router配置
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由懒加载
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/Login.vue')
const Register = () => import('@/views/Register.vue')
const Profile = () => import('@/views/Profile.vue')
const Knowledge = () => import('@/views/Knowledge.vue')
const KnowledgeDetail = () => import('@/views/KnowledgeDetail.vue')
const Playground = () => import('@/views/Playground.vue')
const Community = () => import('@/views/Community.vue')
const AboutUs = () => import('@/views/AboutUs.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: '注册', guest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: Knowledge,
    meta: { title: '知识库' }
  },
  {
    path: '/knowledge/:id',
    name: 'KnowledgeDetail',
    component: KnowledgeDetail,
    meta: { title: '知识点详情' }
  },
  {
    path: '/playground',
    name: 'Playground',
    component: Playground,
    meta: { title: 'SQL练习场' }
  },
  {
    path: '/community',
    name: 'Community',
    component: Community,
    meta: { title: '社区' }
  },
  {
    path: '/about',
    name: 'AboutUs',
    component: AboutUs,
    meta: { title: '关于我们' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || 'SQL学习平台'} - SQL学习平台`
  
  const authStore = useAuthStore()
  
  // 需要认证的页面
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // 已登录用户访问登录/注册页面
  if (to.meta.guest && authStore.isLoggedIn) {
    next({ name: 'Home' })
    return
  }
  
  next()
})

export default router

