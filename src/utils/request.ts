import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // 使用相对路径，通过 Vite 代理转发请求
  timeout: 10000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    // 添加通用请求头
    config.headers['Content-Type'] = 'application/json'
    config.headers['Accept'] = 'application/json'
    
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果是二进制数据（例如验证码图片），直接返回
    if (response.config.responseType === 'blob') {
      return response.data
    }

    // 如果是登录接口，直接返回整个响应数据
    if (response.config.url?.includes('/login')) {
      return res
    }

    // 其他接口的响应处理
    if (res.code === 200) {
      return res.data
    } else {
      ElMessage.error(res.message || '系统错误')
      return Promise.reject(new Error(res.message || '系统错误'))
    }
  },
  error => {
    console.error('请求错误', error)
    ElMessage.error(error.message || '系统错误')
    return Promise.reject(error)
  }
)

export default service 