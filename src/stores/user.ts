import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface UserInfo {
  username: string
  roles: string[]
  nickname?: string
  avatar?: string
}

// 模拟的默认用户信息
const defaultUserInfo: UserInfo = {
  username: 'admin',
  roles: ['admin'],
  nickname: '管理员',
  avatar: ''
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo>(JSON.parse(localStorage.getItem('user') || JSON.stringify(defaultUserInfo)))
  const router = useRouter()

  // 设置token
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
    // 设置默认用户信息
    setUserInfo(defaultUserInfo)
  }

  // 设置用户信息
  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    localStorage.setItem('user', JSON.stringify(info))
  }

  // 清除用户状态
  function clearUserState() {
    token.value = ''
    userInfo.value = { ...defaultUserInfo }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 退出登录
  async function logout() {
    try {
      clearUserState()
      router.push('/login')
    } catch (error) {
      console.error('退出登录失败', error)
    }
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout,
    clearUserState
  }
}) 