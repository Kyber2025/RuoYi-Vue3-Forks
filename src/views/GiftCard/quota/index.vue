<template>
  <div class="app-container">
    <!-- 搜索 -->
    <el-form :inline="true" label-width="70px">
      <el-form-item label="账号">
        <el-input v-model="queryParams.userName" placeholder="请输入账号" clearable
                  style="width: 180px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getList">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="openAdd"
                   v-hasPermi="['GiftCard:quota:edit']">设置额度</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="quotaList" border>
      <el-table-column label="账号" align="center" prop="userName" min-width="120" />
      <el-table-column label="总额度" align="center" prop="totalQuota" min-width="120">
        <template #default="scope">₹{{ scope.row.totalQuota }}</template>
      </el-table-column>
      <el-table-column label="已用额度(待核销)" align="center" prop="usedAmount" min-width="130">
        <template #default="scope">₹{{ scope.row.usedAmount }}</template>
      </el-table-column>
      <el-table-column label="已核销额度" align="center" prop="settledAmount" min-width="120">
        <template #default="scope">₹{{ scope.row.settledAmount ?? 0 }}</template>
      </el-table-column>
      <el-table-column label="剩余额度" align="center" prop="remainAmount" min-width="120">
        <template #default="scope">
          <span :style="{ color: Number(scope.row.remainAmount) <= 0 ? '#f56c6c' : '#67c23a' }">
            ₹{{ scope.row.remainAmount }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" min-width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'info'">
            {{ scope.row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" min-width="160" />
      <el-table-column label="操作" align="center" min-width="140">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="openEdit(scope.row)"
                     v-hasPermi="['GiftCard:quota:edit']">修改</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['GiftCard:quota:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 设置额度弹窗 -->
    <el-dialog :title="dialogTitle" v-model="open" width="460px" append-to-body>
      <el-form ref="quotaRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="账号" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择账号" filterable clearable
                     :disabled="isEdit" style="width: 100%">
            <el-option v-for="u in ownerOptions" :key="u.ownerId" :label="u.ownerName" :value="u.ownerId" />
          </el-select>
        </el-form-item>
        <el-form-item label="总额度" prop="totalQuota">
          <el-input-number v-model="form.totalQuota" :min="0" :step="1000" :precision="2"
                           controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="open = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="GiftCardQuota">
import { listQuota, saveQuota, delQuota } from "@/api/GiftCard/quota"
import { listOwnerOptions } from "@/api/GiftCard/GiftCard"
import { ref, reactive, toRefs, getCurrentInstance } from "vue"

const { proxy } = getCurrentInstance()

const loading = ref(false)
const total = ref(0)
const quotaList = ref([])
const ownerOptions = ref([])
const open = ref(false)
const isEdit = ref(false)
const dialogTitle = ref("")

const data = reactive({
  queryParams: { pageNum: 1, pageSize: 10, userName: null, status: null },
  form: { id: null, userId: null, totalQuota: 0, status: "0", remark: null },
  rules: {
    userId: [{ required: true, message: "请选择账号", trigger: "change" }],
    totalQuota: [{ required: true, message: "请输入总额度", trigger: "blur" }]
  }
})
const { queryParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listQuota(queryParams.value).then(res => {
    quotaList.value = res.rows
    total.value = res.total
    loading.value = false
  }).catch(() => { loading.value = false })
}
function resetQuery() {
  queryParams.value.userName = null
  queryParams.value.status = null
  queryParams.value.pageNum = 1
  getList()
}
function loadOwners() {
  // allFlag=true：列出所有有效账号（额度可设给任意账号，而非仅“当过归属人”的）
  listOwnerOptions({ allFlag: true }).then(res => { ownerOptions.value = res.data || [] }).catch(() => {})
}
function resetForm() {
  form.value = { id: null, userId: null, totalQuota: 0, status: "0", remark: null }
  proxy.resetForm("quotaRef")
}
function openAdd() {
  resetForm()
  isEdit.value = false
  dialogTitle.value = "设置额度"
  open.value = true
}
function openEdit(row) {
  resetForm()
  isEdit.value = true
  dialogTitle.value = "修改额度"
  form.value = {
    id: row.id, userId: row.userId, totalQuota: Number(row.totalQuota),
    status: row.status, remark: row.remark
  }
  open.value = true
}
function submitForm() {
  proxy.$refs["quotaRef"].validate(valid => {
    if (!valid) return
    saveQuota(form.value).then(() => {
      proxy.$modal.msgSuccess("保存成功")
      open.value = false
      getList()
    })
  })
}
function handleDelete(row) {
  proxy.$modal.confirm(`确认删除账号「${row.userName}」的额度记录？`).then(() => {
    return delQuota(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功")
    getList()
  }).catch(() => {})
}

loadOwners()
getList()
</script>
