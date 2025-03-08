<template>
  <div class="dashboard">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20">
      <el-col :span="4" v-for="(card, index) in cards" :key="index">
        <el-card class="data-card" :body-style="{ padding: '20px' }">
          <div class="card-content">
            <el-icon class="card-icon" :class="card.color">
              <component :is="card.icon" />
            </el-icon>
            <div class="card-info">
              <div class="card-value">{{ card.value }}</div>
              <div class="card-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>学员增长趋势</span>
            </div>
          </template>
          <div class="student-growth-chart chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>缴费状态分布</span>
            </div>
          </template>
          <div class="payment-status-chart chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统通知 -->
    <el-card class="notice-card">
      <template #header>
        <div class="card-header">
          <span>系统通知</span>
        </div>
      </template>
      <el-table :data="notifications" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="标题" width="200" />
        <el-table-column prop="content" label="内容" />
        <el-table-column prop="date" label="发布时间" width="180" />
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  User,
  School,
  Collection,
  Reading,
  OfficeBuilding,
  Checked
} from '@element-plus/icons-vue'

// 数据卡片信息
const cards = ref([
  {
    label: '学员总数',
    value: 1234,
    icon: User,
    color: 'blue'
  },
  {
    label: '教师总数',
    value: 56,
    icon: School,
    color: 'green'
  },
  {
    label: '课程总数',
    value: 89,
    icon: Reading,
    color: 'orange'
  },
  {
    label: '班级总数',
    value: 32,
    icon: OfficeBuilding,
    color: 'purple'
  },
  {
    label: '缴费完成人数',
    value: 980,
    icon: Checked,
    color: 'success'
  },
  {
    label: '待缴费人数',
    value: 45,
    icon: Collection,
    color: 'red'
  }
])

// 系统通知数据
const notifications = ref([
  {
    title: '系统升级通知',
    content: '系统将于本周六凌晨2点进行升级维护，预计耗时2小时',
    date: '2024-03-15 10:00'
  },
  {
    title: '新功能上线',
    content: '新增学员批量导入功能，支持Excel文件导入',
    date: '2024-03-14 14:30'
  },
  {
    title: '课程调整通知',
    content: '下周一起高三数学课程时间调整为下午2点',
    date: '2024-03-13 16:00'
  }
])

// 图表实例
let studentGrowthChart: echarts.ECharts
let paymentStatusChart: echarts.ECharts

// 分页参数
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 加载状态
const loading = ref(false)

// 数据刷新定时器
let refreshTimer: number | null = null

// 获取数据概览
const fetchDashboardData = async () => {
  loading.value = true
  try {
    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新数据卡片
    cards.value = cards.value.map(card => ({
      ...card,
      value: Math.floor(Math.random() * 1000) + 100 // 模拟数据
    }))
    
    // 更新图表数据
    updateCharts()
    
    // 获取系统通知
    fetchNotifications()
  } finally {
    loading.value = false
  }
}

// 获取系统通知
const fetchNotifications = async () => {
  // 模拟接口调用
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 模拟分页数据
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  notifications.value = Array.from({ length: 20 }, (_, index) => ({
    title: `系统通知 ${index + 1}`,
    content: `这是第 ${index + 1} 条系统通知的内容`,
    date: new Date(Date.now() - index * 86400000).toLocaleString()
  })).slice(start, end)
  
  total.value = 20
}

// 更新图表
const updateCharts = () => {
  if (studentGrowthChart && paymentStatusChart) {
    // 更新学员增长趋势数据
    studentGrowthChart.setOption({
      series: [{
        data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 200) + 100)
      }]
    })
    
    // 更新缴费状态分布数据
    paymentStatusChart.setOption({
      series: [{
        data: [
          { value: Math.floor(Math.random() * 500) + 500, name: '已缴费' },
          { value: Math.floor(Math.random() * 300) + 300, name: '部分缴费' },
          { value: Math.floor(Math.random() * 200) + 200, name: '未缴费' }
        ]
      }]
    })
  }
}

// 处理窗口大小变化
const handleResize = () => {
  studentGrowthChart?.resize()
  paymentStatusChart?.resize()
}

// 处理分页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchNotifications()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchNotifications()
}

// 初始化图表
const initCharts = () => {
  // 初始化学员增长趋势图表
  const studentGrowthEl = document.querySelector('.student-growth-chart') as HTMLElement
  if (studentGrowthEl) {
    studentGrowthChart = echarts.init(studentGrowthEl)
    studentGrowthChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [150, 230, 224, 218, 135, 147],
        type: 'line',
        smooth: true,
        areaStyle: {
          opacity: 0.1
        }
      }]
    })
  }

  // 初始化缴费状态分布图表
  const paymentStatusEl = document.querySelector('.payment-status-chart') as HTMLElement
  if (paymentStatusEl) {
    paymentStatusChart = echarts.init(paymentStatusEl)
    paymentStatusChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { value: 735, name: '已缴费' },
            { value: 580, name: '部分缴费' },
            { value: 484, name: '未缴费' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    })
  }
}

onMounted(() => {
  // 初始化图表
  nextTick(() => {
    initCharts()
  })

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
  
  // 初始化数据
  fetchDashboardData()
  
  // 设置定时刷新（每5分钟）
  refreshTimer = window.setInterval(fetchDashboardData, 5 * 60 * 1000)
})

onUnmounted(() => {
  // 清理事件监听和定时器
  window.removeEventListener('resize', handleResize)
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // 销毁图表实例
  studentGrowthChart?.dispose()
  paymentStatusChart?.dispose()
})
</script>

<style scoped lang="scss">
.dashboard {
  .data-card {
    margin-bottom: 20px;
    
    .card-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .card-icon {
        font-size: 48px;
        padding: 16px;
        border-radius: 8px;

        &.blue {
          background-color: rgba(24, 144, 255, 0.1);
          color: #1890FF;
        }

        &.green {
          background-color: rgba(82, 196, 26, 0.1);
          color: #52C41A;
        }

        &.orange {
          background-color: rgba(250, 173, 20, 0.1);
          color: #FAAD14;
        }

        &.purple {
          background-color: rgba(114, 46, 209, 0.1);
          color: #722ED1;
        }

        &.success {
          background-color: rgba(82, 196, 26, 0.1);
          color: #52C41A;
        }

        &.red {
          background-color: rgba(245, 34, 45, 0.1);
          color: #F5222D;
        }
      }

      .card-info {
        .card-value {
          font-size: 24px;
          font-weight: bold;
          line-height: 1;
          margin-bottom: 8px;
        }

        .card-label {
          color: #666;
          font-size: 14px;
        }
      }
    }
  }

  .chart-row {
    margin-bottom: 20px;
  }

  .chart-card {
    .chart {
      height: 300px;
      width: 100%;
    }
  }

  .card-header {
    font-weight: bold;
  }

  .notice-card {
    .pagination {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style> 