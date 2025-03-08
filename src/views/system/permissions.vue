<template>
  <div class="permissions-container">
    <el-row :gutter="20">
      <!-- 角色列表 -->
      <el-col :span="6">
        <el-card class="role-list">
          <template #header>
            <div class="card-header">
              <span>角色列表</span>
              <el-input
                v-model="searchRole"
                placeholder="搜索角色"
                clearable
                @clear="handleRoleSearch"
                @input="handleRoleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>
          <el-scrollbar height="calc(100vh - 280px)">
            <div class="role-items">
              <div
                v-for="role in filteredRoles"
                :key="role.id"
                class="role-item"
                :class="{ active: currentRole?.id === role.id }"
                @click="handleRoleSelect(role)"
              >
                <span>{{ role.name }}</span>
                <span class="role-code">{{ role.code }}</span>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>

      <!-- 权限配置 -->
      <el-col :span="18">
        <el-card v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>权限配置</span>
              <div class="header-right">
                <el-radio-group v-model="permissionType" size="small">
                  <el-radio-button label="menu">菜单权限</el-radio-button>
                  <el-radio-button label="data">数据权限</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>

          <!-- 菜单权限配置 -->
          <div v-if="permissionType === 'menu'" class="menu-permissions">
            <el-scrollbar height="calc(100vh - 280px)">
              <el-tree
                ref="menuTreeRef"
                :data="menuTree"
                show-checkbox
                node-key="id"
                :props="{ label: 'title', children: 'children' }"
                :default-checked-keys="checkedMenus"
                @check="handleMenuCheck"
              >
                <template #default="{ node, data }">
                  <div class="menu-node">
                    <el-icon><component :is="data.icon" /></el-icon>
                    <span>{{ node.label }}</span>
                    <span v-if="data.permission" class="permission-tag">
                      {{ data.permission }}
                    </span>
                  </div>
                </template>
              </el-tree>
            </el-scrollbar>
          </div>

          <!-- 数据权限配置 -->
          <div v-else class="data-permissions">
            <el-form :model="dataPermission" label-width="100px">
              <el-form-item label="数据范围">
                <el-radio-group v-model="dataPermission.scope">
                  <el-radio label="1">全部数据权限</el-radio>
                  <el-radio label="2">本部门数据权限</el-radio>
                  <el-radio label="3">本部门及以下数据权限</el-radio>
                  <el-radio label="4">仅本人数据权限</el-radio>
                  <el-radio label="5">自定义数据权限</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <el-form-item v-if="dataPermission.scope === '5'" label="选择部门">
                <el-tree-select
                  v-model="dataPermission.departments"
                  :data="departmentTree"
                  multiple
                  show-checkbox
                  check-strictly
                  :render-after-expand="false"
                  placeholder="请选择部门"
                />
              </el-form-item>
            </el-form>
          </div>

          <div class="actions">
            <el-button type="primary" @click="handleSave">保存配置</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { TreeInstance } from 'element-plus'

// 模拟角色数据
const roleList = [
  { id: 1, name: '超级管理员', code: 'SUPER_ADMIN' },
  { id: 2, name: '管理员', code: 'ADMIN' },
  { id: 3, name: '普通用户', code: 'USER' },
  { id: 4, name: '访客', code: 'GUEST' }
]

// 模拟菜单树数据
const menuTree = [
  {
    id: 1,
    title: '系统管理',
    icon: 'Setting',
    children: [
      {
        id: 11,
        title: '用户管理',
        icon: 'User',
        permission: 'system:user:list'
      },
      {
        id: 12,
        title: '角色管理',
        icon: 'User',
        permission: 'system:role:list'
      }
    ]
  },
  {
    id: 2,
    title: '教务管理',
    icon: 'Document',
    children: [
      {
        id: 21,
        title: '学员管理',
        icon: 'User',
        permission: 'teaching:student:list'
      }
    ]
  }
]

// 模拟部门树数据
const departmentTree = [
  {
    value: 1,
    label: '总公司',
    children: [
      {
        value: 11,
        label: '北京分公司'
      },
      {
        value: 12,
        label: '上海分公司'
      }
    ]
  }
]

// 状态定义
const loading = ref(false)
const searchRole = ref('')
const currentRole = ref<any>(null)
const permissionType = ref('menu')
const menuTreeRef = ref<TreeInstance>()
const checkedMenus = ref<number[]>([])
const dataPermission = ref({
  scope: '1',
  departments: []
})

// 计算过滤后的角色列表
const filteredRoles = computed(() => {
  if (!searchRole.value) return roleList
  return roleList.filter(role => 
    role.name.toLowerCase().includes(searchRole.value.toLowerCase()) ||
    role.code.toLowerCase().includes(searchRole.value.toLowerCase())
  )
})

// 处理角色搜索
const handleRoleSearch = () => {
  // 实现角色搜索逻辑
}

// 处理角色选择
const handleRoleSelect = (role: any) => {
  currentRole.value = role
  // 模拟加载该角色的权限数据
  loading.value = true
  setTimeout(() => {
    checkedMenus.value = [11, 21] // 模拟已选中的菜单ID
    dataPermission.value = {
      scope: '2',
      departments: []
    }
    loading.value = false
  }, 500)
}

// 处理菜单选择
const handleMenuCheck = (nodes: any) => {
  console.log('选中的菜单:', nodes)
}

// 保存配置
const handleSave = () => {
  if (!currentRole.value) {
    ElMessage.warning('请先选择一个角色')
    return
  }

  loading.value = true
  setTimeout(() => {
    ElMessage.success('保存成功')
    loading.value = false
  }, 500)
}

// 重置配置
const handleReset = () => {
  if (!currentRole.value) {
    ElMessage.warning('请先选择一个角色')
    return
  }

  // 重置为初始状态
  if (permissionType.value === 'menu') {
    menuTreeRef.value?.setCheckedKeys([])
  } else {
    dataPermission.value = {
      scope: '1',
      departments: []
    }
  }
}
</script>

<style scoped lang="scss">
.permissions-container {
  .role-list {
    .card-header {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .role-items {
      .role-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        margin-bottom: 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          background-color: #f5f7fa;
        }

        &.active {
          background-color: #ecf5ff;
          color: #409eff;
        }

        .role-code {
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .menu-permissions {
    .menu-node {
      display: flex;
      align-items: center;
      gap: 8px;

      .permission-tag {
        font-size: 12px;
        color: #909399;
        background-color: #f5f7fa;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }
  }

  .data-permissions {
    padding: 20px 0;
  }

  .actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}
</style> 