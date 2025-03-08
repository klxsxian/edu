<template>
  <div class="students-page">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="searchForm.name" placeholder="请输入学员姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="在读" :value="1" />
            <el-option label="休学" :value="2" />
            <el-option label="毕业" :value="3" />
            <el-option label="退学" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="classId">
          <el-select v-model="searchForm.classId" placeholder="请选择班级" clearable>
            <el-option
              v-for="item in classList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
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
        新增学员
      </el-button>
      <el-upload
        class="upload-btn"
        action="/api/student/import"
        :show-file-list="false"
        :before-upload="beforeUpload"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
      >
        <el-button type="success">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
      </el-upload>
      <el-button type="warning" @click="handleExport">
        <el-icon><Download /></el-icon>
        批量导出
      </el-button>
      <el-button type="danger" :disabled="!selectedStudents.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 表格区域 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="studentList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="学号" width="100" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="入学日期" width="120" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="success" link @click="handleDetail(row)">
                <el-icon><View /></el-icon>
                详情
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
      :title="dialogType === 'add' ? '新增学员' : '编辑学员'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入学员姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="班级" prop="classId">
          <el-select v-model="form.classId" placeholder="请选择班级">
            <el-option
              v-for="item in classList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="在读" :value="1" />
            <el-option label="休学" :value="2" />
            <el-option label="毕业" :value="3" />
            <el-option label="退学" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="入学日期" prop="joinDate">
          <el-date-picker
            v-model="form.joinDate"
            type="date"
            placeholder="请选择入学日期"
          />
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="学员详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="学号">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ detail.gender === 1 ? '男' : '女' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ detail.idCard }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ detail.className }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(detail.status)">
            {{ getStatusText(detail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="入学日期">{{ detail.joinDate }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detail.remark }}</el-descriptions-item>
      </el-descriptions>
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
  Upload,
  Download,
  View
} from '@element-plus/icons-vue'
import type { FormInstance, UploadProps } from 'element-plus'

interface Student {
  id: string
  name: string
  gender: number
  phone: string
  idCard: string
  classId: number
  className: string
  status: number
  joinDate: string
  remark: string
}

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  status: '',
  classId: ''
})

// 表格数据
const loading = ref(false)
const studentList = ref<Student[]>([])
const selectedStudents = ref<Student[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 班级列表
const classList = ref([
  { id: 1, name: '高三一班' },
  { id: 2, name: '高三二班' },
  { id: 3, name: '高三三班' }
])

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  id: '',
  name: '',
  gender: 1,
  phone: '',
  idCard: '',
  classId: '',
  status: 1,
  joinDate: '',
  remark: ''
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入学员姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  classId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  joinDate: [{ required: true, message: '请选择入学日期', trigger: 'change' }]
}

// 详情对话框
const detailDialogVisible = ref(false)
const detail = ref<Student>({} as Student)

// 获取学员列表
const fetchStudentList = async () => {
  loading.value = true
  try {
    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    studentList.value = Array.from({ length: 10 }, (_, index) => ({
      id: `2024${String(index + 1).padStart(4, '0')}`,
      name: `学员${index + 1}`,
      gender: Math.random() > 0.5 ? 1 : 2,
      phone: '13800138000',
      idCard: '110101199003077777',
      classId: Math.floor(Math.random() * 3) + 1,
      className: `高三${Math.floor(Math.random() * 3) + 1}班`,
      status: Math.floor(Math.random() * 4) + 1,
      joinDate: '2024-03-01',
      remark: `这是学员${index + 1}的备注信息`
    }))
    total.value = 100
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchStudentList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    phone: '',
    status: '',
    classId: ''
  })
  handleSearch()
}

// 表格选择
const handleSelectionChange = (selection: Student[]) => {
  selectedStudents.value = selection
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchStudentList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchStudentList()
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  Object.assign(form, {
    id: '',
    name: '',
    gender: 1,
    phone: '',
    idCard: '',
    classId: '',
    status: 1,
    joinDate: '',
    remark: ''
  })
}

// 编辑
const handleEdit = (row: Student) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 详情
const handleDetail = (row: Student) => {
  detail.value = row
  detailDialogVisible.value = true
}

// 删除
const handleDelete = (row: Student) => {
  ElMessageBox.confirm(
    '确定要删除该学员吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchStudentList()
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedStudents.value.length) {
    ElMessage.warning('请选择要删除的学员')
    return
  }
  ElMessageBox.confirm(
    '确定要删除选中的学员吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchStudentList()
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
      dialogVisible.value = false
      fetchStudentList()
    }
  })
}

// 批量导入
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isExcel = file.type === 'application/vnd.ms-excel' || 
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件！')
    return false
  }
  return true
}

const handleImportSuccess = () => {
  ElMessage.success('导入成功')
  fetchStudentList()
}

const handleImportError = () => {
  ElMessage.error('导入失败')
}

// 批量导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '在读',
    2: '休学',
    3: '毕业',
    4: '退学'
  }
  return statusMap[status] || '未知'
}

// 获取状态类型
const getStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    1: 'success',
    2: 'warning',
    3: 'info',
    4: 'danger'
  }
  return typeMap[status] || ''
}

// 初始化
onMounted(() => {
  fetchStudentList()
})
</script>

<style scoped lang="scss">
.students-page {
  .search-card {
    margin-bottom: 16px;
  }

  .operation-bar {
    margin-bottom: 16px;
    display: flex;
    gap: 16px;

    .upload-btn {
      display: inline-block;
    }
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 