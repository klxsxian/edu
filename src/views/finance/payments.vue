<template>
  <div class="payments-page">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="学员姓名" prop="studentName">
          <el-input v-model="searchForm.studentName" placeholder="请输入学员姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="缴费状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="未缴费" :value="0" />
            <el-option label="部分缴费" :value="1" />
            <el-option label="已缴费" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="缴费时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
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
        新增缴费
      </el-button>
      <el-upload
        class="upload-btn"
        action="/api/payment/import"
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
    </div>

    <!-- 表格区域 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="paymentList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="缴费编号" width="120" />
        <el-table-column prop="studentName" label="学员姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column prop="totalAmount" label="应缴金额" width="120">
          <template #default="{ row }">
            ¥{{ row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="paidAmount" label="已缴金额" width="120">
          <template #default="{ row }">
            ¥{{ row.paidAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="remainAmount" label="剩余金额" width="120">
          <template #default="{ row }">
            ¥{{ (row.totalAmount - row.paidAmount).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="缴费状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentTime" label="缴费时间" width="180" />
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
      :title="dialogType === 'add' ? '新增缴费' : '编辑缴费'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="学员" prop="studentId">
          <el-select
            v-model="form.studentId"
            placeholder="请选择学员"
            filterable
            remote
            :remote-method="remoteSearchStudent"
            :loading="studentLoading"
          >
            <el-option
              v-for="item in studentOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <span>{{ item.name }}</span>
              <span class="option-desc">{{ item.className }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="缴费项目" prop="items">
          <div v-for="(item, index) in form.items" :key="index" class="fee-item">
            <el-select v-model="item.type" placeholder="请选择项目" style="width: 180px">
              <el-option label="学费" :value="1" />
              <el-option label="住宿费" :value="2" />
              <el-option label="教材费" :value="3" />
              <el-option label="其他费用" :value="4" />
            </el-select>
            <el-input-number
              v-model="item.amount"
              :min="0"
              :precision="2"
              :step="100"
              style="width: 180px; margin: 0 10px"
            />
            <el-button type="danger" circle @click="removeFeeItem(index)">
              <el-icon><Minus /></el-icon>
            </el-button>
          </div>
          <el-button type="primary" plain @click="addFeeItem">
            <el-icon><Plus /></el-icon>
            添加缴费项目
          </el-button>
        </el-form-item>
        <el-form-item label="缴费方式" prop="paymentMethod">
          <el-select v-model="form.paymentMethod" placeholder="请选择缴费方式">
            <el-option label="现金" :value="1" />
            <el-option label="微信" :value="2" />
            <el-option label="支付宝" :value="3" />
            <el-option label="银行转账" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="缴费时间" prop="paymentTime">
          <el-date-picker
            v-model="form.paymentTime"
            type="datetime"
            placeholder="请选择缴费时间"
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
      title="缴费详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="缴费编号">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="学员姓名">{{ detail.studentName }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
        <el-descriptions-item label="班级">{{ detail.className }}</el-descriptions-item>
        <el-descriptions-item label="应缴金额">¥{{ detail.totalAmount?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="已缴金额">¥{{ detail.paidAmount?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="缴费状态">
          <el-tag :type="getStatusType(detail.status)">
            {{ getStatusText(detail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="缴费时间">{{ detail.paymentTime }}</el-descriptions-item>
        <el-descriptions-item label="缴费方式">{{ getPaymentMethodText(detail.paymentMethod) }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ detail.remark }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>缴费明细</el-divider>
      
      <el-table :data="detail.items" border>
        <el-table-column prop="type" label="缴费项目">
          <template #default="{ row }">
            {{ getFeeTypeText(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额">
          <template #default="{ row }">
            ¥{{ row.amount?.toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
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
  Upload,
  View,
  Minus
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

interface PaymentForm {
  studentId: number
  items: Array<{
    type: number
    amount: number
  }>
  paymentMethod: number
  paymentTime: string
  remark: string
}

interface PaymentDetail {
  id: string
  studentName: string
  phone: string
  className: string
  totalAmount: number
  paidAmount: number
  status: number
  paymentTime: string
  paymentMethod: number
  remark: string
  items: Array<{
    type: number
    amount: number
  }>
}

// 搜索表单
const searchForm = reactive({
  studentName: '',
  phone: '',
  status: '',
  dateRange: []
})

// 表格数据
const loading = ref(false)
const paymentList = ref<PaymentDetail[]>([])
const selectedPayments = ref<PaymentDetail[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive<PaymentForm>({
  studentId: 0,
  items: [],
  paymentMethod: 1,
  paymentTime: '',
  remark: ''
})

// 表单校验规则
const rules = {
  studentId: [{ required: true, message: '请选择学员', trigger: 'change' }],
  items: [{ required: true, message: '请添加缴费项目', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '请选择缴费方式', trigger: 'change' }],
  paymentTime: [{ required: true, message: '请选择缴费时间', trigger: 'change' }]
}

// 详情对话框
const detailDialogVisible = ref(false)
const detail = ref<PaymentDetail>({} as PaymentDetail)

// 学员选择相关
const studentLoading = ref(false)
const studentOptions = ref<Array<{ id: number, name: string, className: string }>>([])

// 获取缴费列表
const fetchPaymentList = async () => {
  loading.value = true
  try {
    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    paymentList.value = Array.from({ length: 10 }, (_, index) => ({
      id: `P${String(index + 1).padStart(6, '0')}`,
      studentName: `学员${index + 1}`,
      phone: '13800138000',
      className: `班级${index + 1}`,
      totalAmount: 10000,
      paidAmount: Math.random() > 0.5 ? 10000 : 5000,
      status: Math.random() > 0.5 ? 2 : 1,
      paymentTime: '2024-03-15 10:00:00',
      paymentMethod: Math.floor(Math.random() * 4) + 1,
      remark: `这是缴费${index + 1}的备注信息`,
      items: [
        { type: 1, amount: 8000 },
        { type: 2, amount: 2000 }
      ]
    }))
    total.value = 100
  } finally {
    loading.value = false
  }
}

// 获取状态类型
const getStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: 'danger',
    1: 'warning',
    2: 'success'
  }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '未缴费',
    1: '部分缴费',
    2: '已缴费'
  }
  return map[status] || '未知'
}

// 获取缴费方式文本
const getPaymentMethodText = (method: number) => {
  const map: Record<number, string> = {
    1: '现金',
    2: '微信',
    3: '支付宝',
    4: '银行转账'
  }
  return map[method] || '未知'
}

// 获取费用类型文本
const getFeeTypeText = (type: number) => {
  const map: Record<number, string> = {
    1: '学费',
    2: '住宿费',
    3: '教材费',
    4: '其他费用'
  }
  return map[type] || '未知'
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchPaymentList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    studentName: '',
    phone: '',
    status: '',
    dateRange: []
  })
  handleSearch()
}

// 表格选择
const handleSelectionChange = (selection: PaymentDetail[]) => {
  selectedPayments.value = selection
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchPaymentList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchPaymentList()
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  Object.assign(form, {
    studentId: 0,
    items: [],
    paymentMethod: 1,
    paymentTime: '',
    remark: ''
  })
}

// 编辑
const handleEdit = (row: PaymentDetail) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, {
    studentId: row.id,
    items: row.items,
    paymentMethod: row.paymentMethod,
    paymentTime: row.paymentTime,
    remark: row.remark
  })
}

// 查看详情
const handleDetail = (row: PaymentDetail) => {
  detail.value = row
  detailDialogVisible.value = true
}

// 删除
const handleDelete = (row: PaymentDetail) => {
  ElMessageBox.confirm(
    '确定要删除该缴费记录吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchPaymentList()
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
      dialogVisible.value = false
      fetchPaymentList()
    }
  })
}

// 远程搜索学员
const remoteSearchStudent = async (query: string) => {
  if (!query) return
  studentLoading.value = true
  try {
    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    studentOptions.value = Array.from({ length: 5 }, (_, index) => ({
      id: index + 1,
      name: `${query}${index + 1}`,
      className: `班级${index + 1}`
    }))
  } finally {
    studentLoading.value = false
  }
}

// 添加缴费项目
const addFeeItem = () => {
  form.items.push({
    type: 1,
    amount: 0
  })
}

// 移除缴费项目
const removeFeeItem = (index: number) => {
  form.items.splice(index, 1)
}

// 上传前校验
const beforeUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件！')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('文件大小不能超过 2MB！')
    return false
  }
  return true
}

// 导入成功处理
const handleImportSuccess = (response: any) => {
  if (response.code === 200) {
    ElMessage.success('导入成功')
    fetchPaymentList()
  } else {
    ElMessage.error(response.message || '导入失败')
  }
}

// 导入失败处理
const handleImportError = () => {
  ElMessage.error('导入失败，请检查文件格式或网络连接')
}

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 初始化
onMounted(() => {
  fetchPaymentList()
})
</script>

<style scoped lang="scss">
.payments-page {
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

  .fee-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .option-desc {
    margin-left: 10px;
    color: #999;
    font-size: 12px;
  }
}
</style> 