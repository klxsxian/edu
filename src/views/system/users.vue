<template>
  <div class="users-page">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-tree-select
            v-model="searchForm.deptId"
            :data="deptOptions"
            placeholder="请选择部门"
            clearable
            :props="{
              value: 'id',
              label: 'name',
              children: 'children'
            }"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
      <el-button type="danger" :disabled="!selectedUsers.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
      <el-button type="warning" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出Excel
      </el-button>
    </div>

    <!-- 表格区域 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="userList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="deptName" label="部门" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="380" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="success" link @click="handleAssignRole(row)">
                <el-icon><UserFilled /></el-icon>
                分配角色
              </el-button>
              <el-button type="warning" link @click="handleResetPwd(row)">
                <el-icon><Key /></el-icon>
                重置密码
              </el-button>
              <el-button
                type="danger"
                link
                @click="handleDelete(row)"
                :disabled="row.username === 'admin'"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="dialogType === 'add'">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-tree-select
            v-model="form.deptId"
            :data="deptOptions"
            placeholder="请选择部门"
            :props="{
              value: 'id',
              label: 'name',
              children: 'children'
            }"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="500px"
    >
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <span>{{ currentUser?.username }}</span>
        </el-form-item>
        <el-form-item label="姓名">
          <span>{{ currentUser?.name }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="selectedRoles">
            <el-checkbox
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.id"
            >
              {{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRoleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Download,
  UserFilled,
  Key
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

interface User {
  id: number
  username: string
  name: string
  deptId: number
  deptName: string
  phone: string
  email: string
  status: number
  createTime: string
  remark: string
}

interface Department {
  id: number
  name: string
  children?: Department[]
}

interface Role {
  id: number
  name: string
}

// 搜索表单
const searchForm = reactive({
  username: '',
  name: '',
  phone: '',
  status: '',
  deptId: ''
})

// 表格数据
const loading = ref(false)
const userList = ref<User[]>([])
const selectedUsers = ref<User[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 部门树形数据
const deptOptions = ref<Department[]>([
  {
    id: 1,
    name: '总部',
    children: [
      {
        id: 2,
        name: '教学部',
        children: [
          { id: 4, name: '高中部' },
          { id: 5, name: '初中部' }
        ]
      },
      {
        id: 3,
        name: '行政部',
        children: [
          { id: 6, name: '人事部' },
          { id: 7, name: '财务部' }
        ]
      }
    ]
  }
])

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  username: '',
  name: '',
  password: '',
  confirmPassword: '',
  deptId: '',
  phone: '',
  email: '',
  status: 1,
  remark: ''
})

// 表单校验规则
const validatePass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (form.confirmPassword !== '') {
      if (formRef.value) {
        formRef.value.validateField('confirmPassword')
      }
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ validator: validatePass, trigger: 'blur' }],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 角色相关
const roleDialogVisible = ref(false)
const currentUser = ref<User>()
const roleOptions = ref<Role[]>([
  { id: 1, name: '超级管理员' },
  { id: 2, name: '教务主任' },
  { id: 3, name: '教师' },
  { id: 4, name: '学生' }
])
const selectedRoles = ref<number[]>([])

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    userList.value = Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      username: index === 0 ? 'admin' : `user${index + 1}`,
      name: index === 0 ? '管理员' : `用户${index + 1}`,
      deptId: Math.floor(Math.random() * 7) + 1,
      deptName: '教学部',
      phone: '13800138000',
      email: `user${index + 1}@example.com`,
      status: Math.random() > 0.2 ? 1 : 0,
      createTime: '2024-03-15 10:00:00',
      remark: `这是用户${index + 1}的备注信息`
    }))
    total.value = 100
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    username: '',
    name: '',
    phone: '',
    status: '',
    deptId: ''
  })
  handleSearch()
}

// 表格选择
const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchUserList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchUserList()
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  Object.assign(form, {
    id: '',
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
    deptId: '',
    phone: '',
    email: '',
    status: 1,
    remark: ''
  })
}

// 编辑
const handleEdit = (row: User) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 删除
const handleDelete = (row: User) => {
  if (row.username === 'admin') {
    ElMessage.warning('超级管理员账号不能删除！')
    return
  }
  ElMessageBox.confirm(
    '确定要删除该用户吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchUserList()
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedUsers.value.length) {
    ElMessage.warning('请选择要删除的用户')
    return
  }
  if (selectedUsers.value.some(user => user.username === 'admin')) {
    ElMessage.warning('选中的用户中包含超级管理员，无法删除！')
    return
  }
  ElMessageBox.confirm(
    '确定要删除选中的用户吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchUserList()
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
      dialogVisible.value = false
      fetchUserList()
    }
  })
}

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 分配角色
const handleAssignRole = (row: User) => {
  currentUser.value = row
  roleDialogVisible.value = true
  // 模拟获取用户角色
  selectedRoles.value = [2, 3]
}

// 提交角色分配
const handleRoleSubmit = () => {
  ElMessage.success('角色分配成功')
  roleDialogVisible.value = false
}

// 重置密码
const handleResetPwd = (row: User) => {
  ElMessageBox.confirm(
    '确定要重置该用户的密码吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('密码重置成功，新密码已发送至用户邮箱')
  })
}

// 初始化
onMounted(() => {
  fetchUserList()
})
</script>

<style scoped lang="scss">
.users-page {
  .search-card {
    margin-bottom: 16px;
  }

  .operation-bar {
    margin-bottom: 16px;
    display: flex;
    gap: 16px;
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 