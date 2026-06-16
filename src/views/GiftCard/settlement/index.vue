<template>
  <div class="app-container">
    <!-- 搜索 -->
    <el-form :inline="true" label-width="70px">
      <el-form-item label="账号">
        <el-input v-model="queryParams.userName" placeholder="请输入账号" clearable
                  style="width: 160px" @keyup.enter="getList" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="待审核" value="0" />
          <el-option label="已核销" value="1" />
          <el-option label="驳回" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="getList">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="list" border>
      <el-table-column label="账号" align="center" prop="userName" min-width="110" />
      <el-table-column label="核销金额" align="center" prop="amount" min-width="110">
        <template #default="scope">₹{{ scope.row.amount }}</template>
      </el-table-column>
      <el-table-column label="支付截图" align="center" min-width="100">
        <template #default="scope">
          <image-preview v-if="scope.row.paymentImage" :src="scope.row.paymentImage" :width="50" :height="50" />
          <span v-else style="color:#909399;">未上传</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" min-width="90">
        <template #default="scope">
          <el-tag :type="statusTag(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" prop="submitTime" min-width="160" />
      <el-table-column label="审核人" align="center" prop="confirmBy" min-width="100" />
      <el-table-column label="备注" align="center" prop="remark" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" align="center" min-width="180" fixed="right">
        <template #default="scope">
          <template v-if="scope.row.status === '0'">
            <el-button link type="success" icon="Check" @click="handleConfirm(scope.row)"
                       v-hasPermi="['GiftCard:settlement:audit']">通过</el-button>
            <el-button link type="warning" icon="Close" @click="handleReject(scope.row)"
                       v-hasPermi="['GiftCard:settlement:audit']">驳回</el-button>
          </template>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['GiftCard:settlement:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup name="GiftCardSettlement">
import { listSettlement, confirmSettlement, rejectSettlement, delSettlement } from "@/api/GiftCard/settlement"
import { ref, reactive, toRefs, getCurrentInstance } from "vue"

const { proxy } = getCurrentInstance()

const loading = ref(false)
const total = ref(0)
const list = ref([])

const data = reactive({
  queryParams: { pageNum: 1, pageSize: 10, userName: null, status: null }
})
const { queryParams } = toRefs(data)

function statusText(s) { return s === '1' ? '已核销' : (s === '2' ? '驳回' : '待审核') }
function statusTag(s) { return s === '1' ? 'success' : (s === '2' ? 'info' : 'warning') }

function getList() {
  loading.value = true
  listSettlement(queryParams.value).then(res => {
    list.value = res.rows
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
function handleConfirm(row) {
  proxy.$modal.confirm(`确认通过账号「${row.userName}」的核销（₹${row.amount}）？通过后将清零其已用额度。`).then(() => {
    return confirmSettlement(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess("已核销，额度已清零")
    getList()
  }).catch(() => {})
}
function handleReject(row) {
  proxy.$prompt('请输入驳回原因', '驳回核销', { inputType: 'textarea' }).then(({ value }) => {
    return rejectSettlement(row.id, { remark: value })
  }).then(() => {
    proxy.$modal.msgSuccess("已驳回")
    getList()
  }).catch(() => {})
}
function handleDelete(row) {
  proxy.$modal.confirm('确认删除该核销记录？').then(() => {
    return delSettlement(row.id)
  }).then(() => {
    proxy.$modal.msgSuccess("删除成功")
    getList()
  }).catch(() => {})
}

getList()
</script>
