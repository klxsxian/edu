<template>
  <div class="roles-page">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
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
        新增角色
      </el-button>
      <el-button type="danger" :disabled="!selectedRoles.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="roleList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="code" label="角色编码" width="150" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="success" link @click="handlePermission(row)">
                <el-icon><Setting /></el-icon>
                权限设置
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
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
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入角色编码" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
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

    <!-- 权限设置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限设置"
      width="600px"
    >
      <el-form label-width="80px">
        <el-form-item label="角色名称">
          <span>{{ currentRole?.name }}</span>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-tree
            ref="menuTreeRef"
            :data="menuList"
            show-checkbox
            node-key="id"
            :props="{
              label: 'title',
              children: 'children'
            }"
            :default-checked-keys="selectedMenus"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePermissionSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Delete,
  Edit,
  Setting
} from '@element-plus/icons-vue'

interface Role {
  id: number
  name: string
  code: string
  sort: number
  status: number
  remark: string
  createTime: string
}

interface MenuItem {
  id: number
  parentId: number | null
  title: string
  children?: MenuItem[]
}

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const roleList = ref<Role[]>([])
const selectedRoles = ref<Role[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref()
const form = reactive({
  id: '',
  name: '',
  code: '',
  sort: 1,
  status: 1,
  remark: ''
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 权限设置相关
const permissionDialogVisible = ref(false)
const currentRole = ref<Role>()
const menuTreeRef = ref()
const selectedMenus = ref<number[]>([])

// 菜单列表数据（示例）
const menuList = ref<MenuItem[]>([
  {
    id: 1,
    parentId: null,
    title: '首页',
    children: []
  },
  {
    id: 2,
    parentId: null,
    title: '教学管理',
    children: [
      {
        id: 21,
        parentId: 2,
        title: '学员管理'
      }
    ]
  },
  {
    id: 3,
    parentId: null,
    title: '系统管理',
    children: [
      {
        id: 31,
        parentId: 3,
        title: '用户管理'
      },
      {
        id: 32,
        parentId: 3,
        title: '角色管理'
      },
      {
        id: 33,
        parentId: 3,
        title: '菜单管理'
      }
    ]
  }
])

// 初始化数据
const fetchRoleList = () => {
  loading.value = true
  // 模拟接口调用
  setTimeout(() => {
    roleList.value = [
      {
        id: 1,
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        sort: 1,
        status: 1,
        remark: '系统最高权限',
        createTime: '2024-03-15 10:00:00'
      },
      {
        id: 2,
        name: '教务主任',
        code: 'TEACHING_DIRECTOR',
        sort: 2,
        status: 1,
        remark: '教学部门负责人',
        createTime: '2024-03-15 10:00:00'
      }
    ]
    total.value = 2
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchRoleList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    status: ''
  })
  handleSearch()
}

// 表格选择
const handleSelectionChange = (selection: Role[]) => {
  selectedRoles.value = selection
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchRoleList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchRoleList()
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  Object.assign(form, {
    id: '',
    name: '',
    code: '',
    sort: 1,
    status: 1,
    remark: ''
  })
}

// 编辑
const handleEdit = (row: Role) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 删除
const handleDelete = (row: Role) => {
  ElMessageBox.confirm(
    '确定要删除该角色吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchRoleList()
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedRoles.value.length) {
    ElMessage.warning('请选择要删除的角色')
    return
  }
  ElMessageBox.confirm(
    '确定要删除选中的角色吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchRoleList()
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
      dialogVisible.value = false
      fetchRoleList()
    }
  })
}

// 打开权限设置
const handlePermission = (row: Role) => {
  currentRole.value = row
  permissionDialogVisible.value = true
  // 模拟获取角色权限
  selectedMenus.value = [1, 21, 31]
}

// 提交权限设置
const handlePermissionSubmit = () => {
  if (!menuTreeRef.value) return
  const checkedKeys = menuTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys()
  const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]
  
  ElMessage.success('权限设置成功')
  permissionDialogVisible.value = false
}

// 初始化
fetchRoleList()
</script>

<style scoped lang="scss">
.roles-page {
  .search-card {
    margin-bottom: 16px;
  }

  .operation-bar {
    margin-bottom: 16px;
  }

  .table-card {
    .pagination {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style> 