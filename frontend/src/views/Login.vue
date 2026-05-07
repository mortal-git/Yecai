<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>业财管理系统</h1>
        <p>Enterprise Finance Management System</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item label="验证码" prop="captcha" v-if="showCaptcha">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              prefix-icon="Key"
              size="large"
              style="flex: 1"
            />
            <img
              :src="captchaUrl"
              alt="验证码"
              class="captcha-img"
              @click="refreshCaptcha"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
            <a href="#" class="forgot-password">忘记密码?</a>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <p>© 2024 业财管理系统 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElForm } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)
const showCaptcha = ref(false)
const captchaUrl = ref('https://picsum.photos/120/40?random=' + Math.random())

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  rememberMe: false
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  captcha: showCaptcha.value
    ? [{ required: true, message: '请输入验证码', trigger: 'blur' }]
    : []
}

// 刷新验证码
const refreshCaptcha = () => {
  captchaUrl.value = 'https://picsum.photos/120/40?random=' + Math.random()
}

// 登录
const handleLogin = () => {
  if (!loginFormRef.value) return

  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 模拟登录请求
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 这里应该调用真实的登录接口
        if (loginForm.username === 'admin' && loginForm.password === '123456') {
          localStorage.setItem('token', 'mock-token-' + Date.now())
          localStorage.setItem('userInfo', JSON.stringify({
            username: loginForm.username,
            role: 'admin'
          }))

          ElMessage.success('登录成功')
          router.push('/dashboard')
        } else {
          ElMessage.error('用户名或密码错误')
          // 登录失败显示验证码
          showCaptcha.value = true
          refreshCaptcha()
        }
      } catch (error) {
        ElMessage.error('登录失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  width: 480px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
}

.login-header p {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.login-form {
  margin-bottom: 20px;
}

.captcha-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-img {
  width: 120px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-password {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  font-size: 16px;
  font-weight: 500;
}

.login-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.login-footer p {
  margin: 0;
}
</style>
