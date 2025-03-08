<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button type="primary" @click="handleEdit">修改信息</el-button>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">
          {{ userInfo.username }}
        </el-descriptions-item>
        <el-descriptions-item label="用户昵称">
          {{ userInfo.nickname || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号码">
          {{ userInfo.phone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userInfo.email || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="部门">
          {{ userInfo.department || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="角色">
          {{ userInfo.roles?.join(', ') || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ userInfo.createTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="最后登录时间">
          {{ userInfo.lastLoginTime || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 修改信息对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="修改个人信息"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import type { FormInstance } from 'element-plus'

const userStore = useUserStore()
const userInfo = userStore.userInfo

// 表单相关
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  nickname: '',
  phone: '',
  email: ''
})

// 表单验证规则
const rules = {
  nickname: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 打开编辑对话框
const handleEdit = () => {
  Object.assign(form, {
    nickname: userInfo.nickname,
    phone: userInfo.phone,
    email: userInfo.email
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      // 模拟更新
      setTimeout(() => {
        userStore.setUserInfo({
          ...userInfo,
          ...form
        })
        ElMessage.success('修改成功')
        dialogVisible.value = false
      }, 500)
    }
  })
}
</script>

<style scoped lang="scss">
.profile-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style> 