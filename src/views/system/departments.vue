<template>
  <div class="departments-page">
    <el-card class="tree-card">
      <template #header>
        <div class="card-header">
          <span>部门管理</span>
          <el-button type="primary" @click="handleAdd(null)">
            <el-icon><Plus /></el-icon>
            新增部门
          </el-button>
        </div>
      </template>
      <el-tree
        ref="treeRef"
        :data="departmentList"
        :props="{
          label: 'name',
          children: 'children'
        }"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <span>{{ node.label }}</span>
            <div class="operation">
              <el-button type="primary" link @click="handleAdd(data)">
                <el-icon><Plus /></el-icon>
                新增
              </el-button>
              <el-button type="primary" link @click="handleEdit(data)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(node, data)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </template>
      </el-tree>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增部门' : '编辑部门'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="上级部门">
          <el-tree-select
            v-model="form.parentId"
            :data="departmentList"
            :props="{
              value: 'id',
              label: 'name',
              children: 'children'
            }"
            placeholder="请选择上级部门"
            clearable
            :disabled="!!form.parentId && dialogType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

interface Department {
  id: number
  parentId: number | null
  name: string
  sort: number
  status: number
  remark: string
  children?: Department[]
}

// 部门列表数据
const departmentList = ref<Department[]>([
  {
    id: 1,
    parentId: null,
    name: '总部',
    sort: 1,
    status: 1,
    remark: '',
    children: [
      {
        id: 2,
        parentId: 1,
        name: '教学部',
        sort: 1,
        status: 1,
        remark: '',
        children: [
          {
            id: 4,
            parentId: 2,
            name: '高中部',
            sort: 1,
            status: 1,
            remark: ''
          },
          {
            id: 5,
            parentId: 2,
            name: '初中部',
            sort: 2,
            status: 1,
            remark: ''
          }
        ]
      },
      {
        id: 3,
        parentId: 1,
        name: '行政部',
        sort: 2,
        status: 1,
        remark: '',
        children: [
          {
            id: 6,
            parentId: 3,
            name: '人事部',
            sort: 1,
            status: 1,
            remark: ''
          },
          {
            id: 7,
            parentId: 3,
            name: '财务部',
            sort: 2,
            status: 1,
            remark: ''
          }
        ]
      }
    ]
  }
])

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref()
const form = reactive({
  id: '',
  parentId: null as number | null,
  name: '',
  sort: 1,
  status: 1,
  remark: ''
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 新增部门
const handleAdd = (data: Department | null) => {
  dialogType.value = 'add'
  dialogVisible.value = true
  Object.assign(form, {
    id: '',
    parentId: data?.id || null,
    name: '',
    sort: 1,
    status: 1,
    remark: ''
  })
}

// 编辑部门
const handleEdit = (data: Department) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, {
    id: data.id,
    parentId: data.parentId,
    name: data.name,
    sort: data.sort,
    status: data.status,
    remark: data.remark
  })
}

// 删除部门
const handleDelete = (node: any, data: Department) => {
  // 检查是否有子部门
  if (data.children && data.children.length > 0) {
    ElMessage.warning('该部门下有子部门，不能删除')
    return
  }

  ElMessageBox.confirm(
    '确定要删除该部门吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('删除成功')
    node.parent.data.children = node.parent.data.children.filter(
      (item: Department) => item.id !== data.id
    )
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '修改成功')
      dialogVisible.value = false
      // 这里应该调用接口更新数据
    }
  })
}
</script>

<style scoped lang="scss">
.departments-page {
  .tree-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      padding-right: 8px;

      .operation {
        display: none;
      }

      &:hover .operation {
        display: block;
      }
    }
  }
}
</style> 