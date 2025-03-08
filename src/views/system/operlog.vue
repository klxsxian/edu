<template>
  <div class="operlog-page">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="系统模块" prop="module">
          <el-input v-model="searchForm.module" placeholder="请输入系统模块" clearable />
        </el-form-item>
        <el-form-item label="操作人员" prop="operator">
          <el-input v-model="searchForm.operator" placeholder="请输入操作人员" clearable />
        </el-form-item>
        <el-form-item label="操作类型" prop="type">
          <el-select v-model="searchForm.type" placeholder="请选择操作类型" clearable>
            <el-option label="新增" value="INSERT" />
            <el-option label="修改" value="UPDATE" />
            <el-option label="删除" value="DELETE" />
            <el-option label="授权" value="GRANT" />
            <el-option label="导出" value="EXPORT" />
            <el-option label="导入" value="IMPORT" />
            <el-option label="强退" value="FORCE" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="成功" :value="0" />
            <el-option label="失败" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
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
      <el-button type="danger" :disabled="!selectedLogs.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
      <el-button type="warning" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出Excel
      </el-button>
      <el-button type="danger" @click="handleClear">
        <el-icon><Delete /></el-icon>
        清空日志
      </el-button>
    </div>

    <!-- 表格区域 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="logList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="日志编号" width="80" />
        <el-table-column prop="module" label="系统模块" width="150" />
        <el-table-column prop="type" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeTag(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人员" width="120" />
        <el-table-column prop="ip" label="操作IP" width="130" />
        <el-table-column prop="location" label="操作地点" width="150" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operTime" label="操作时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="操作日志详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="系统模块">{{ currentLog.module }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="getOperationTypeTag(currentLog.type)">{{ currentLog.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人员">{{ currentLog.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="currentLog.status === 0 ? 'success' : 'danger'">
            {{ currentLog.status === 0 ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作IP">{{ currentLog.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作地点">{{ currentLog.location }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ currentLog.operTime }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">{{ currentLog.method }}</el-descriptions-item>
        <el-descriptions-item label="请求URL" :span="2">{{ currentLog.url }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <div class="code-block">{{ currentLog.requestParam }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="返回参数" :span="2">
          <div class="code-block">{{ currentLog.responseData }}</div>
        </el-descriptions-item>
        <el-descriptions-item v-if="currentLog.status === 1" label="错误信息" :span="2">
          <div class="error-block">{{ currentLog.errorMsg }}</div>
        </el-descriptions-item>
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
  Delete,
  Download,
  View
} from '@element-plus/icons-vue'

interface OperLog {
  id: number
  module: string
  type: string
  operator: string
  ip: string
  location: string
  status: number
  operTime: string
  method: string
  url: string
  requestParam: string
  responseData: string
  errorMsg?: string
}

// 搜索表单
const searchForm = reactive({
  module: '',
  operator: '',
  type: '',
  status: '',
  dateRange: []
})

// 表格数据
const loading = ref(false)
const logList = ref<OperLog[]>([])
const selectedLogs = ref<OperLog[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 详情对话框
const detailVisible = ref(false)
const currentLog = ref<OperLog>({} as OperLog)

// 获取操作日志列表
const fetchLogList = async () => {
  loading.value = true
  try {
    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    logList.value = Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      module: '系统管理',
      type: ['INSERT', 'UPDATE', 'DELETE', 'GRANT', 'EXPORT', 'IMPORT', 'FORCE', 'OTHER'][Math.floor(Math.random() * 8)],
      operator: `user${index + 1}`,
      ip: `192.168.1.${index + 1}`,
      location: '广东省深圳市',
      status: Math.random() > 0.2 ? 0 : 1,
      operTime: '2024-03-15 10:00:00',
      method: 'POST',
      url: '/api/system/user',
      requestParam: JSON.stringify({ id: index + 1, name: `用户${index + 1}` }, null, 2),
      responseData: JSON.stringify({ code: 200, msg: '操作成功' }, null, 2),
      errorMsg: '操作失败，服务器内部错误'
    }))
    total.value = 100
  } finally {
    loading.value = false
  }
}

// 获取操作类型标签样式
const getOperationTypeTag = (type: string) => {
  const map: Record<string, string> = {
    INSERT: 'success',
    UPDATE: 'warning',
    DELETE: 'danger',
    GRANT: 'info',
    EXPORT: '',
    IMPORT: '',
    FORCE: 'danger',
    OTHER: 'info'
  }
  return map[type] || 'info'
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchLogList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    module: '',
    operator: '',
    type: '',
    status: '',
    dateRange: []
  })
  handleSearch()
}

// 表格选择
const handleSelectionChange = (selection: OperLog[]) => {
  selectedLogs.value = selection
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchLogList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchLogList()
}

// 查看详情
const handleViewDetail = (row: OperLog) => {
  currentLog.value = row
  detailVisible.value = true
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedLogs.value.length) {
    ElMessage.warning('请选择要删除的日志')
    return
  }
  ElMessageBox.confirm(
    '确定要删除选中的日志吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchLogList()
  })
}

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 清空日志
const handleClear = () => {
  ElMessageBox.confirm(
    '确定要清空所有操作日志吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('清空成功')
    fetchLogList()
  })
}

// 初始化
onMounted(() => {
  fetchLogList()
})
</script>

<style scoped lang="scss">
.operlog-page {
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

  .code-block {
    padding: 8px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .error-block {
    padding: 8px;
    background-color: #fef0f0;
    border-radius: 4px;
    color: #f56c6c;
  }
}
</style> 