<template>
  <div class="dict-data-page">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="字典标签" prop="label">
          <el-input v-model="searchForm.label" placeholder="请输入字典标签" clearable />
        </el-form-item>
        <el-form-item label="字典键值" prop="value">
          <el-input v-model="searchForm.value" placeholder="请输入字典键值" clearable />
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
        新增数据
      </el-button>
      <el-button type="danger" :disabled="!selectedData.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
      <el-button type="warning" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出Excel
      </el-button>
      <el-button @click="goBack">
        <el-icon><Back /></el-icon>
        返回
      </el-button>
    </div>

    <!-- 表格区域 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>字典名称：{{ dictInfo.name }}</span>
          <span class="divider">|</span>
          <span>字典类型：{{ dictInfo.type }}</span>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="dataList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="label" label="字典标签" width="180" />
        <el-table-column prop="value" label="字典键值" width="180" />
        <el-table-column prop="cssClass" label="样式属性" width="120">
          <template #default="{ row }">
            <el-tag :type="row.cssClass">{{ row.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
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
      :title="dialogType === 'add' ? '新增字典数据' : '编辑字典数据'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="字典类型">
          <el-input v-model="dictInfo.type" disabled />
        </el-form-item>
        <el-form-item label="字典标签" prop="label">
          <el-input v-model="form.label" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典键值" prop="value">
          <el-input v-model="form.value" placeholder="请输入字典键值" />
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-select v-model="form.cssClass" placeholder="请选择样式属性">
            <el-option label="默认" value="" />
            <el-option label="主要" value="primary" />
            <el-option label="成功" value="success" />
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warning" />
            <el-option label="危险" value="danger" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
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
import { useRouter, useRoute } from 'vue-router'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Download,
  Back
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

interface DictData {
  id: number
  label: string
  value: string
  cssClass: string
  sort: number
  status: number
  remark: string
  createTime: string
}

// 路由
const router = useRouter()
const route = useRoute()

// 字典信息
const dictInfo = reactive({
  name: '系统状态',
  type: route.query.type as string
})

// 搜索表单
const searchForm = reactive({
  label: '',
  value: '',
  status: ''
})

// 表格数据
const loading = ref(false)
const dataList = ref<DictData[]>([])
const selectedData = ref<DictData[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  label: '',
  value: '',
  cssClass: '',
  sort: 0,
  status: 1,
  remark: ''
})

// 表单校验规则
const rules = {
  label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字典键值', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 获取字典数据列表
const fetchDataList = async () => {
  loading.value = true
  try {
    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    dataList.value = Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      label: `选项${index + 1}`,
      value: String(index + 1),
      cssClass: ['', 'primary', 'success', 'info', 'warning', 'danger'][Math.floor(Math.random() * 6)],
      sort: index + 1,
      status: Math.random() > 0.2 ? 1 : 0,
      remark: `这是选项${index + 1}的备注信息`,
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
  fetchDataList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    label: '',
    value: '',
    status: ''
  })
  handleSearch()
}

// 表格选择
const handleSelectionChange = (selection: DictData[]) => {
  selectedData.value = selection
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchDataList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchDataList()
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  Object.assign(form, {
    id: '',
    label: '',
    value: '',
    cssClass: '',
    sort: 0,
    status: 1,
    remark: ''
  })
}

// 编辑
const handleEdit = (row: DictData) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 删除
const handleDelete = (row: DictData) => {
  ElMessageBox.confirm(
    '确定要删除该字典数据吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchDataList()
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedData.value.length) {
    ElMessage.warning('请选择要删除的字典数据')
    return
  }
  ElMessageBox.confirm(
    '确定要删除选中的字典数据吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchDataList()
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
      dialogVisible.value = false
      fetchDataList()
    }
  })
}

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 返回
const goBack = () => {
  router.back()
}

// 初始化
onMounted(() => {
  if (!dictInfo.type) {
    ElMessage.error('字典类型不能为空')
    router.back()
    return
  }
  fetchDataList()
})
</script>

<style scoped lang="scss">
.dict-data-page {
  .search-card {
    margin-bottom: 16px;
  }

  .operation-bar {
    margin-bottom: 16px;
    display: flex;
    gap: 16px;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 16px;

    .divider {
      color: #dcdfe6;
    }
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 