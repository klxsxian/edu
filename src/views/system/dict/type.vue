<template>
  <div class="dict-type-page">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入字典名称" clearable />
        </el-form-item>
        <el-form-item label="字典类型" prop="type">
          <el-input v-model="searchForm.type" placeholder="请输入字典类型" clearable />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" :value="1" />
            <el-option label="停用" :value="0" />
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
        新增字典
      </el-button>
      <el-button type="danger" :disabled="!selectedTypes.length" @click="handleBatchDelete">
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
        :data="typeList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="字典名称" width="180" />
        <el-table-column prop="type" label="字典类型" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '停用' }}
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
              <el-button type="success" link @click="handleData(row)">
                <el-icon><List /></el-icon>
                数据
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
      :title="dialogType === 'add' ? '新增字典' : '编辑字典'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="字典名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Download,
  List
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

interface DictType {
  id: number
  name: string
  type: string
  status: number
  remark: string
  createTime: string
}

// 路由
const router = useRouter()

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const typeList = ref<DictType[]>([])
const selectedTypes = ref<DictType[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  name: '',
  type: '',
  status: 1,
  remark: ''
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  type: [
    { required: true, message: '请输入字典类型', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_]*$/, message: '字典类型必须以小写字母开头，只能包含小写字母、数字和下划线', trigger: 'blur' }
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 获取字典类型列表
const fetchTypeList = async () => {
  loading.value = true
  try {
    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    typeList.value = Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      name: `字典${index + 1}`,
      type: `dict_${index + 1}`,
      status: Math.random() > 0.2 ? 1 : 0,
      remark: `这是字典${index + 1}的备注信息`,
      createTime: '2024-03-15 10:00:00'
    }))
    total.value = 100
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchTypeList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    type: '',
    status: ''
  })
  handleSearch()
}

// 表格选择
const handleSelectionChange = (selection: DictType[]) => {
  selectedTypes.value = selection
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchTypeList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchTypeList()
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  Object.assign(form, {
    id: '',
    name: '',
    type: '',
    status: 1,
    remark: ''
  })
}

// 编辑
const handleEdit = (row: DictType) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 删除
const handleDelete = (row: DictType) => {
  ElMessageBox.confirm(
    '确定要删除该字典吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchTypeList()
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedTypes.value.length) {
    ElMessage.warning('请选择要删除的字典')
    return
  }
  ElMessageBox.confirm(
    '确定要删除选中的字典吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchTypeList()
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
      dialogVisible.value = false
      fetchTypeList()
    }
  })
}

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 查看字典数据
const handleData = (row: DictType) => {
  router.push({
    name: 'DictData',
    query: { type: row.type }
  })
}

// 初始化
onMounted(() => {
  fetchTypeList()
})
</script>

<style scoped lang="scss">
.dict-type-page {
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