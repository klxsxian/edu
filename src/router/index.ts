import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/login/index.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/',
      component: MainLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/dashboard/index.vue'),
          meta: { title: '首页' }
        },
        {
          path: 'teaching',
          name: 'Teaching',
          redirect: '/teaching/students',
          children: [
            {
              path: 'students',
              name: 'Students',
              component: () => import('../views/teaching/students.vue'),
              meta: { title: '学员管理' }
            }
          ]
        },
        {
          path: 'finance',
          name: 'Finance',
          redirect: '/finance/payment',
          children: [
            {
              path: 'payment',
              name: 'Payment',
              component: () => import('../views/finance/payments.vue'),
              meta: { title: '缴费登记' }
            }
          ]
        },
        {
          path: 'system',
          name: 'System',
          redirect: '/system/users',
          children: [
            {
              path: 'users',
              name: 'Users',
              component: () => import('../views/system/users.vue'),
              meta: { title: '用户管理' }
            },
            {
              path: 'departments',
              name: 'Departments',
              component: () => import('../views/system/departments.vue'),
              meta: { title: '部门管理' }
            },
            {
              path: 'roles',
              name: 'Roles',
              component: () => import('../views/system/roles.vue'),
              meta: { title: '角色管理' }
            },
            {
              path: 'permissions',
              name: 'Permissions',
              component: () => import('../views/system/permissions.vue'),
              meta: { title: '权限管理' }
            },
            {
              path: 'menus',
              name: 'Menus',
              component: () => import('../views/system/menus.vue'),
              meta: { title: '菜单管理' }
            },
            {
              path: 'dict',
              name: 'Dict',
              redirect: '/system/dict/type',
              children: [
                {
                  path: 'type',
                  name: 'DictType',
                  component: () => import('../views/system/dict/type.vue'),
                  meta: { title: '字典类型' }
                },
                {
                  path: 'data',
                  name: 'DictData',
                  component: () => import('../views/system/dict/data.vue'),
                  meta: { title: '字典数据' }
                }
              ]
            },
            {
              path: 'online',
              name: 'Online',
              component: () => import('../views/system/online.vue'),
              meta: { title: '在线用户' }
            },
            {
              path: 'operlog',
              name: 'OperLog',
              component: () => import('../views/system/operlog.vue'),
              meta: { title: '操作日志' }
            }
          ]
        },
        {
          path: 'statistics',
          name: 'Statistics',
          redirect: '/statistics/progress',
          children: [
            {
              path: 'progress',
              name: 'Progress',
              component: () => import('../views/statistics/progress.vue'),
              meta: { title: '学习进度' }
            }
          ]
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('../views/profile/index.vue'),
          meta: { title: '个人信息' }
        },
        {
          path: '/profile/password',
          name: 'Password',
          component: () => import('../views/profile/password.vue'),
          meta: { title: '修改密码' }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 获取token
  const token = localStorage.getItem('token')
  
  // 如果是访问登录页
  if (to.path === '/login') {
    if (token) {
      // 已登录则跳转到首页
      next('/')
    } else {
      // 未登录则允许访问登录页
      next()
    }
  } else {
    // 访问其他页面时
    if (token) {
      // 已登录则允许访问
      next()
    } else {
      // 未登录则跳转到登录页
      next('/login')
    }
  }
})

export default router 