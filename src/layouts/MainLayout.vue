<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <img src="@/assets/logo.png" alt="logo" />
        <span>Nexus后台管理</span>
      </div>
      <el-menu
        :default-active="route.path"
        class="menu"
        :router="true"
        :collapse="isCollapse"
      >
        <template v-for="menu in menuList" :key="menu.path">
          <!-- 没有子菜单的情况 -->
          <el-menu-item v-if="!menu.children?.length" :index="menu.path">
            <el-icon>
              <component :is="menu.meta.icon" />
            </el-icon>
            <template #title>{{ menu.meta.title }}</template>
          </el-menu-item>
          <!-- 有子菜单的情况 -->
          <el-sub-menu v-else :index="menu.path">
            <template #title>
              <el-icon>
                <component :is="menu.meta.icon" />
              </el-icon>
              <span>{{ menu.meta.title }}</span>
            </template>
            <template v-for="subMenu in menu.children" :key="subMenu.path">
              <!-- 递归处理多级菜单 -->
              <template v-if="subMenu.children?.length">
                <el-sub-menu :index="subMenu.path">
                  <template #title>
                    <el-icon>
                      <component :is="subMenu.meta.icon" />
                    </el-icon>
                    <span>{{ subMenu.meta.title }}</span>
                  </template>
                  <el-menu-item
                    v-for="item in subMenu.children"
                    :key="item.path"
                    :index="item.path"
                  >
                    <el-icon>
                      <component :is="item.meta.icon" />
                    </el-icon>
                    <template #title>{{ item.meta.title }}</template>
                  </el-menu-item>
                </el-sub-menu>
              </template>
              <!-- 普通子菜单 -->
              <el-menu-item v-else :index="subMenu.path">
                <el-icon>
                  <component :is="subMenu.meta.icon" />
                </el-icon>
                <template #title>{{ subMenu.meta.title }}</template>
              </el-menu-item>
            </template>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="left">
          <el-icon
            class="collapse-btn"
            @click="isCollapse = !isCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :icon="User" />
              {{ userStore.userInfo.nickname }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Fold, Expand, ArrowDown, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { menuList } from '@/config/menu'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'password':
      router.push('/profile/password')
      break
    case 'logout':
      ElMessageBox.confirm(
        '确定要退出登录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        userStore.logout()
      })
      break
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;

  .aside {
    background-color: #304156;
    
    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      color: #fff;
      font-size: 18px;
      font-weight: bold;
      
      img {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }
    }

    .menu {
      border-right: none;
      background-color: #304156;
    }

    :deep(.el-menu) {
      background-color: #304156;

      .el-menu-item, .el-sub-menu__title {
        color: #bfcbd9;

        &:hover {
          color: #fff;
          background-color: #263445;
        }
      }

      .el-menu-item.is-active {
        color: #409eff;
        background-color: #263445;
      }
    }
  }

  .header {
    background-color: #fff;
    border-bottom: 1px solid #dcdfe6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    .left {
      display: flex;
      align-items: center;
      gap: 20px;

      .collapse-btn {
        font-size: 20px;
        cursor: pointer;
        
        &:hover {
          color: #409eff;
        }
      }
    }

    .right {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
    }
  }

  .main {
    background-color: #f0f2f5;
    padding: 20px;
  }
}
</style> 