<template>
  <div class="menu-container">
    <div class="menu-header">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增
      </el-button>
    </div>

    <!-- 菜单表格 -->
    <el-table
      :data="menuList"
      row-key="id"
      :tree-props="{ children: 'children' }"
      border
      style="width: 100%; margin-top: 15px"
    >
      <el-table-column prop="title" label="菜单名称" min-width="180">
        <template #default="{ row }">
          <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          <span style="margin-left: 6px">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由地址" min-width="150" />
      <el-table-column prop="permission" label="权限标识" min-width="150" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.type === 'menu' ? '' : 'info'">
            {{ row.type === 'menu' ? '菜单' : '按钮' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button
              type="primary"
              link
              @click="handleAdd(row)"
            >
              新增
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
            >
              修改
            </el-button>
            <el-button
              type="primary"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑菜单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增菜单' : '编辑菜单'"
      width="600px"
    >
      <el-form
        ref="menuFormRef"
        :model="menuForm"
        :rules="menuRules"
        label-width="100px"
      >
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="menuForm.parentId"
            :data="menuOptions"
            :props="{ label: 'title', value: 'id' }"
            placeholder="选择上级菜单"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="菜单类型">
          <el-radio-group v-model="menuForm.type">
            <el-radio label="menu">菜单</el-radio>
            <el-radio label="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="menuForm.title" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="图标" v-if="menuForm.type === 'menu'">
          <el-input v-model="menuForm.icon" placeholder="请选择图标">
            <template #append>
              <el-button @click="openIconSelector">
                <el-icon><Select /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="路由地址"
          prop="path"
          v-if="menuForm.type === 'menu'"
        >
          <el-input v-model="menuForm.path" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item
          label="权限标识"
          prop="permission"
          v-if="menuForm.type === 'button'"
        >
          <el-input
            v-model="menuForm.permission"
            placeholder="请输入权限标识"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="menuForm.sort"
            :min="0"
            :max="999"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="menuForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Select } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

// 模拟菜单数据
const menuList = ref([
  {
    id: 1,
    title: '系统管理',
    path: '/system',
    icon: 'Setting',
    type: 'menu',
    sort: 1,
    status: 1,
    children: [
      {
        id: 11,
        parentId: 1,
        title: '用户管理',
        path: '/system/users',
        icon: 'User',
        type: 'menu',
        sort: 1,
        status: 1,
        children: [
          {
            id: 111,
            parentId: 11,
            title: '用户查询',
            permission: 'system:user:query',
            type: 'button',
            sort: 1,
            status: 1
          },
          {
            id: 112,
            parentId: 11,
            title: '用户新增',
            permission: 'system:user:add',
            type: 'button',
            sort: 2,
            status: 1
          }
        ]
      }
    ]
  }
])

// 菜单表单
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const menuFormRef = ref<FormInstance>()
const menuForm = reactive({
  id: undefined,
  parentId: undefined,
  title: '',
  icon: '',
  path: '',
  permission: '',
  type: 'menu',
  sort: 0,
  status: 1
})

// 表单验证规则
const menuRules = {
  title: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入路由地址', trigger: 'blur' }
  ],
  permission: [
    { required: true, message: '请输入权限标识', trigger: 'blur' }
  ]
}

// 菜单树选项
const menuOptions = ref(menuList.value)

// 新增菜单
const handleAdd = (row?: any) => {
  dialogType.value = 'add'
  dialogVisible.value = true
  // 重置表单
  Object.assign(menuForm, {
    id: undefined,
    parentId: row?.id,
    title: '',
    icon: '',
    path: '',
    permission: '',
    type: 'menu',
    sort: 0,
    status: 1
  })
}

// 编辑菜单
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  // 填充表单数据
  Object.assign(menuForm, row)
}

// 删除菜单
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    '确定要删除该菜单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 模拟删除
    ElMessage.success('删除成功')
  })
}

// 状态变更
const handleStatusChange = (row: any) => {
  ElMessage.success(`修改状态成功：${row.status ? '启用' : '停用'}`)
}

// 提交表单
const handleSubmit = async () => {
  if (!menuFormRef.value) return
  
  await menuFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 模拟提交
      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '修改成功')
      dialogVisible.value = false
    }
  })
}

// 打开图标选择器
const openIconSelector = () => {
  // TODO: 实现图标选择器
  ElMessage.info('图标选择功能开发中')
}
</script>

<style scoped lang="scss">
.menu-container {
  padding: 20px;

  .menu-header {
    margin-bottom: 16px;
  }
}
</style> 