<template>
  <div class="progress-page">
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>总课程数</span>
              <el-tag type="success">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ statistics.totalCourses }}</div>
            <div class="trend">
              <span>较上月</span>
              <span :class="{ 'up': statistics.coursesGrowth > 0, 'down': statistics.coursesGrowth < 0 }">
                {{ statistics.coursesGrowth > 0 ? '+' : '' }}{{ statistics.coursesGrowth }}%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>学习人数</span>
              <el-tag type="warning">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ statistics.totalStudents }}</div>
            <div class="trend">
              <span>较上月</span>
              <span :class="{ 'up': statistics.studentsGrowth > 0, 'down': statistics.studentsGrowth < 0 }">
                {{ statistics.studentsGrowth > 0 ? '+' : '' }}{{ statistics.studentsGrowth }}%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>完课率</span>
              <el-tag type="primary">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ statistics.completionRate }}%</div>
            <div class="trend">
              <span>较上月</span>
              <span :class="{ 'up': statistics.completionGrowth > 0, 'down': statistics.completionGrowth < 0 }">
                {{ statistics.completionGrowth > 0 ? '+' : '' }}{{ statistics.completionGrowth }}%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>平均学习时长</span>
              <el-tag type="info">实时</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">{{ statistics.avgStudyTime }}h</div>
            <div class="trend">
              <span>较上月</span>
              <span :class="{ 'up': statistics.studyTimeGrowth > 0, 'down': statistics.studyTimeGrowth < 0 }">
                {{ statistics.studyTimeGrowth > 0 ? '+' : '' }}{{ statistics.studyTimeGrowth }}%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>课程完成趋势</span>
              <el-radio-group v-model="completionTimeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container" ref="completionChartRef"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>课程分类学习情况</span>
              <el-select v-model="categoryTimeRange" size="small">
                <el-option label="最近7天" value="7days" />
                <el-option label="最近30天" value="30days" />
                <el-option label="最近90天" value="90days" />
              </el-select>
            </div>
          </template>
          <div class="chart-container" ref="categoryChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 排名区域 -->
    <el-row :gutter="16" class="rank-row">
      <el-col :span="12">
        <el-card class="rank-card">
          <template #header>
            <div class="card-header">
              <span>热门课程排行</span>
              <el-radio-group v-model="courseRankType" size="small">
                <el-radio-button label="students">学习人数</el-radio-button>
                <el-radio-button label="completion">完课率</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="rank-list">
            <div v-for="(course, index) in courseRanking" :key="course.id" class="rank-item">
              <div class="rank-number" :class="{ 'top3': index < 3 }">{{ index + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ course.name }}</div>
                <div class="rank-value">
                  {{ courseRankType === 'students' ? `${course.students}人` : `${course.completion}%` }}
                </div>
              </div>
              <div class="rank-trend">
                <el-progress
                  :percentage="courseRankType === 'students' ? (course.students / maxStudents * 100) : course.completion"
                  :color="index < 3 ? '#f56c6c' : ''"
                  :show-text="false"
                  :stroke-width="8"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="rank-card">
          <template #header>
            <div class="card-header">
              <span>学习时长排行</span>
              <el-radio-group v-model="studentRankRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="rank-list">
            <div v-for="(student, index) in studentRanking" :key="student.id" class="rank-item">
              <div class="rank-number" :class="{ 'top3': index < 3 }">{{ index + 1 }}</div>
              <div class="rank-info">
                <div class="rank-name">{{ student.name }}</div>
                <div class="rank-value">{{ student.studyTime }}h</div>
              </div>
              <div class="rank-trend">
                <el-progress
                  :percentage="(student.studyTime / maxStudyTime * 100)"
                  :color="index < 3 ? '#f56c6c' : ''"
                  :show-text="false"
                  :stroke-width="8"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

// 统计数据
const statistics = reactive({
  totalCourses: 128,
  coursesGrowth: 15,
  totalStudents: 3567,
  studentsGrowth: 8,
  completionRate: 85,
  completionGrowth: -2,
  avgStudyTime: 12.5,
  studyTimeGrowth: 5
})

// 图表相关
const completionTimeRange = ref('month')
const categoryTimeRange = ref('30days')
const completionChartRef = ref()
const categoryChartRef = ref()
let completionChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null

// 排名相关
const courseRankType = ref('students')
const studentRankRange = ref('week')
const maxStudents = 1000
const maxStudyTime = 100

// 课程排名数据
const courseRanking = ref([
  { id: 1, name: 'Web前端开发实战', students: 956, completion: 92 },
  { id: 2, name: 'Python数据分析', students: 845, completion: 88 },
  { id: 3, name: 'Java企业级开发', students: 789, completion: 85 },
  { id: 4, name: '微服务架构实践', students: 678, completion: 82 },
  { id: 5, name: '人工智能基础', students: 567, completion: 78 }
])

// 学生排名数据
const studentRanking = ref([
  { id: 1, name: '张三', studyTime: 89 },
  { id: 2, name: '李四', studyTime: 76 },
  { id: 3, name: '王五', studyTime: 68 },
  { id: 4, name: '赵六', studyTime: 55 },
  { id: 5, name: '钱七', studyTime: 42 }
])

// 初始化完成趋势图表
const initCompletionChart = () => {
  if (!completionChartRef.value) return
  completionChart = echarts.init(completionChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['完课人数', '新增学员']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '完课人数',
        type: 'line',
        smooth: true,
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: '新增学员',
        type: 'line',
        smooth: true,
        data: [220, 182, 191, 234, 290, 330, 310]
      }
    ]
  }
  completionChart.setOption(option)
}

// 初始化课程分类图表
const initCategoryChart = () => {
  if (!categoryChartRef.value) return
  categoryChart = echarts.init(categoryChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '课程分类',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: '前端开发' },
          { value: 735, name: '后端开发' },
          { value: 580, name: '移动开发' },
          { value: 484, name: '数据分析' },
          { value: 300, name: '人工智能' }
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
  }
  categoryChart.setOption(option)
}

// 监听时间范围变化
watch([completionTimeRange, categoryTimeRange], () => {
  // 根据时间范围更新图表数据
  // 这里模拟更新，实际应该调用接口
  if (completionChart) {
    const option = completionChart.getOption()
    // 更新数据...
    completionChart.setOption(option)
  }
  if (categoryChart) {
    const option = categoryChart.getOption()
    // 更新数据...
    categoryChart.setOption(option)
  }
})

// 监听排名类型变化
watch([courseRankType, studentRankRange], () => {
  // 根据排名类型更新排名数据
  // 这里模拟更新，实际应该调用接口
})

// 初始化
onMounted(() => {
  initCompletionChart()
  initCategoryChart()

  // 监听窗口大小变化，重绘图表
  window.addEventListener('resize', () => {
    completionChart?.resize()
    categoryChart?.resize()
  })
})
</script>

<style scoped lang="scss">
.progress-page {
  .stat-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-content {
      text-align: center;

      .number {
        font-size: 24px;
        font-weight: bold;
        margin: 10px 0;
      }

      .trend {
        color: #909399;
        font-size: 14px;

        .up {
          color: #f56c6c;
        }

        .down {
          color: #67c23a;
        }
      }
    }
  }

  .chart-row {
    margin-top: 16px;

    .chart-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chart-container {
        height: 300px;
      }
    }
  }

  .rank-row {
    margin-top: 16px;

    .rank-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .rank-list {
        .rank-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #ebeef5;

          &:last-child {
            border-bottom: none;
          }

          .rank-number {
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            background-color: #f5f7fa;
            border-radius: 4px;
            margin-right: 12px;

            &.top3 {
              background-color: #f56c6c;
              color: #fff;
            }
          }

          .rank-info {
            flex: 1;
            margin-right: 16px;

            .rank-name {
              font-size: 14px;
              margin-bottom: 4px;
            }

            .rank-value {
              font-size: 12px;
              color: #909399;
            }
          }

          .rank-trend {
            width: 120px;
          }
        }
      }
    }
  }
}
</style> 