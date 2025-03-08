<template>
  <div class="online-page">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="searchForm.username" placeholder="请输入用户名称" clearable />
        </el-form-item>
        <el-form-item label="登录IP" prop="ip">
          <el-input v-model="searchForm.ip" placeholder="请输入登录IP" clearable />
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

    <!-- 表格区域 -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="onlineList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="token" label="会话编号" width="120" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名称" width="120" />
        <el-table-column prop="deptName" label="部门" width="120" />
        <el-table-column prop="ip" label="登录IP" width="130" />
        <el-table-column prop="location" label="登录地点" width="150" />
        <el-table-column prop="browser" label="浏览器" width="120" />
        <el-table-column prop="os" label="操作系统" width="120" />
        <el-table-column prop="loginTime" label="登录时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.username !== 'admin'"
              type="danger"
              link
              @click="handleForceLogout(row)"
            >
              <el-icon><CircleClose /></el-icon>
              强退
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  CircleClose
} from '@element-plus/icons-vue'

interface OnlineUser {
  token: string
  username: string
  deptName: string
  ip: string
  location: string
  browser: string
  os: string
  loginTime: string
}

// 搜索表单
const searchForm = reactive({
  username: '',
  ip: ''
})

// 表格数据
const loading = ref(false)
const onlineList = ref<OnlineUser[]>([])
const selectedUsers = ref<OnlineUser[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取在线用户列表
const fetchOnlineList = async () => {
  loading.value = true
  try {
    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    onlineList.value = Array.from({ length: 10 }, (_, index) => ({
      token: `token-${index + 1}`,
      username: index === 0 ? 'admin' : `user${index + 1}`,
      deptName: `部门${index + 1}`,
      ip: `192.168.1.${index + 1}`,
      location: '广东省深圳市',
      browser: 'Chrome',
      os: 'Windows 10',
      loginTime: '2024-03-15 10:00:00'
    }))
    total.value = 100
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchOnlineList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    username: '',
    ip: ''
  })
  handleSearch()
}

// 表格选择
const handleSelectionChange = (selection: OnlineUser[]) => {
  selectedUsers.value = selection
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchOnlineList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchOnlineList()
}

// 强制退出
const handleForceLogout = (row: OnlineUser) => {
  if (row.username === 'admin') {
    ElMessage.warning('不允许强退超级管理员')
    return
  }
  ElMessageBox.confirm(
    `确定要强制退出用户"${row.username}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('操作成功')
    fetchOnlineList()
  })
}

// 初始化
onMounted(() => {
  fetchOnlineList()
})
</script>

<style scoped lang="scss">
.online-page {
  .search-card {
    margin-bottom: 16px;
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style> 