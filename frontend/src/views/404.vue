<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <img src="https://picsum.photos/seed/404/400/300" alt="404" class="not-found-img" />
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被移动</p>
      <div class="actions">
        <el-button type="primary" @click="goBack">返回上页</el-button>
        <el-button @click="goHome">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.not-found-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.not-found-content {
  text-align: center;
}

.not-found-img {
  width: 400px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 120px;
  color: #409eff;
  margin: 0 0 20px 0;
  line-height: 1;
  font-weight: bold;
}

h2 {
  font-size: 32px;
  color: #303133;
  margin: 0 0 10px 0;
}

p {
  font-size: 16px;
  color: #909399;
  margin: 0 0 30px 0;
}

.actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}
</style>
