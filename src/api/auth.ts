import request from '@/utils/request'

export interface LoginData {
  username: string
  password: string
}

export interface LoginResponse {
  code: number
  message?: string
  data: {
    token: string
  }
}

// 模拟验证码
export function getCaptcha() {
  // 返回一个Promise，模拟生成验证码图片
  return new Promise<Blob>((resolve) => {
    // 创建一个canvas元素
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 100
    canvas.height = 40

    // 设置背景色
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 生成4位随机验证码
    const code = Math.random().toString(36).substring(2, 6).toUpperCase()
    // 存储验证码到sessionStorage，用于验证
    sessionStorage.setItem('captcha_code', code)

    // 绘制验证码
    ctx.font = 'bold 24px Arial'
    ctx.fillStyle = '#333'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    
    // 添加干扰线
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
      ctx.beginPath()
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.stroke()
    }

    // 绘制文字，添加随机偏移
    for (let i = 0; i < code.length; i++) {
      ctx.fillStyle = `rgb(${Math.random() * 150},${Math.random() * 150},${Math.random() * 150})`
      ctx.save()
      ctx.translate(25 + i * 20, 20)
      ctx.rotate((Math.random() - 0.5) * 0.3)
      ctx.fillText(code[i], 0, 0)
      ctx.restore()
    }

    // 将canvas转换为Blob
    canvas.toBlob((blob) => {
      resolve(blob!)
    })
  })
}

// 登录方法
export function login(data: LoginData): Promise<LoginResponse> {
  return request({
    url: '/api/users/login',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(data)
  })
} 