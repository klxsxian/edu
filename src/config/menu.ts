import {
  House,
  User,
  Setting,
  OfficeBuilding,
  Money,
  Tickets,
  List,
  Monitor,
  Document,
  TrendCharts
} from '@element-plus/icons-vue'

export const menuList = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    meta: {
      title: '首页',
      icon: House
    }
  },
  {
    path: '/teaching',
    name: 'Teaching',
    meta: {
      title: '教务管理',
      icon: Document
    },
    children: [
      {
        path: '/teaching/students',
        name: 'Students',
        meta: {
          title: '学员管理',
          icon: User
        }
      }
    ]
  },
  {
    path: '/finance',
    name: 'Finance',
    meta: {
      title: '财务管理',
      icon: Money
    },
    children: [
      {
        path: '/finance/payment',
        name: 'Payment',
        meta: {
          title: '缴费登记',
          icon: Tickets
        }
      }
    ]
  },
  {
    path: '/system',
    name: 'System',
    meta: {
      title: '系统管理',
      icon: Setting
    },
    children: [
      {
        path: '/system/users',
        name: 'Users',
        meta: {
          title: '用户管理',
          icon: User
        }
      },
      {
        path: '/system/departments',
        name: 'Departments',
        meta: {
          title: '部门管理',
          icon: OfficeBuilding
        }
      },
      {
        path: '/system/roles',
        name: 'Roles',
        meta: {
          title: '角色管理',
          icon: User
        }
      },
      {
        path: '/system/permissions',
        name: 'Permissions',
        meta: {
          title: '权限管理',
          icon: List
        }
      },
      {
        path: '/system/menus',
        name: 'Menus',
        meta: {
          title: '菜单管理',
          icon: List
        }
      },
      {
        path: '/system/dict',
        name: 'Dict',
        meta: {
          title: '字典管理',
          icon: Document
        },
        children: [
          {
            path: '/system/dict/type',
            name: 'DictType',
            meta: {
              title: '字典类型',
              icon: Document
            }
          },
          {
            path: '/system/dict/data',
            name: 'DictData',
            meta: {
              title: '字典数据',
              icon: List
            }
          }
        ]
      },
      {
        path: '/system/online',
        name: 'Online',
        meta: {
          title: '在线用户',
          icon: Monitor
        }
      },
      {
        path: '/system/operlog',
        name: 'OperLog',
        meta: {
          title: '操作日志',
          icon: Document
        }
      }
    ]
  },
  {
    path: '/statistics',
    name: 'Statistics',
    meta: {
      title: '统计分析',
      icon: TrendCharts
    },
    children: [
      {
        path: '/statistics/progress',
        name: 'Progress',
        meta: {
          title: '学习进度',
          icon: TrendCharts
        }
      }
    ]
  }
] 