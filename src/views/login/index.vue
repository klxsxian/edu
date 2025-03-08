<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-title">Nexus后台管理系统</div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item prop="captcha">
          <div class="captcha-wrapper">
            <el-input
              v-model="loginForm.captcha"
              placeholder="验证码"
              :prefix-icon="Key"
            />
            <img
              :src="captchaImg"
              class="captcha-img"
              @click="refreshCaptcha"
              alt="验证码"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { login, getCaptcha, type LoginResponse } from '@/api/auth'
import { useUserStore } from '@/stores/user'

interface LoginForm {
  username: string
  password: string
  captcha: string
}

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const captchaImg = ref('')
const userStore = useUserStore()

// 登录表单
const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  captcha: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 4, message: '验证码长度应为4个字符', trigger: 'blur' }
  ]
}

// 获取验证码
const refreshCaptcha = async () => {
  try {
    const response = await getCaptcha()
    // 将二进制数据转换为Base64
    const reader = new FileReader()
    reader.onload = (e) => {
      captchaImg.value = e.target?.result as string
    }
    // 确保response是Blob类型
    if (response instanceof Blob) {
      reader.readAsDataURL(response)
    } else {
      throw new Error('Invalid captcha response format')
    }
  } catch (error) {
    console.error('获取验证码失败', error)
  }
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 验证验证码
      const storedCode = sessionStorage.getItem('captcha_code')
      if (loginForm.captcha.toUpperCase() !== storedCode) {
        ElMessage.error('验证码错误')
        refreshCaptcha()
        return
      }

      loading.value = true
      try {
        const res = await login({
          username: loginForm.username,
          password: loginForm.password
        })
        
        if (res.code === 200 && res.data) {
          ElMessage.success('登录成功')
          // 只设置token，用户信息使用默认值
          userStore.setToken(res.data.token)
          router.push('/')
        } else {
          ElMessage.error(res.message || '登录失败')
          refreshCaptcha()
        }
      } catch (error: any) {
        console.error('登录错误:', error)
        ElMessage.error(error.response?.data?.message || error.message || '登录失败')
        refreshCaptcha()
      } finally {
        loading.value = false
      }
    }
  })
}

// 初始化时获取验证码
onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: url('@/assets/images/login-bg.jpg') no-repeat center;
  background-size: 100% 100%;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
  }

  .login-box {
    width: 400px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;

    .login-title {
      margin-bottom: 30px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .login-form {
      .captcha-wrapper {
        display: flex;
        gap: 12px;

        .el-input {
          flex: 1;
        }

        .captcha-img {
          height: 40px;
          cursor: pointer;
        }
      }

      .login-button {
        width: 100%;
      }
    }
  }
}
</style> 