<template>
  <div class="app-container">
    <!-- 管理员不受额度限制，无需核销 -->
    <el-alert v-if="isAdmin" :closable="false" type="info"
              title="当前为管理员账户，提取不受额度限制，无需核销" />

    <!-- 我的额度 -->
    <el-alert v-if="!isAdmin && quota" :closable="false" style="margin-bottom: 12px;"
              :type="remain <= 0 ? 'error' : 'success'">
      <template #title>
        <div style="display:flex; align-items:center; justify-content:space-between; font-size:14px;">
          <span>
            我的提取额度：总 <b>₹{{ quota.totalQuota }}</b>
            ｜ 已用 <b>₹{{ quota.usedAmount }}</b>
            ｜ 剩余 <b :style="{ color: remain <= 0 ? '#f56c6c' : '#67c23a' }">₹{{ remain }}</b>
          </span>
          <el-button size="small" type="warning" @click="openSubmit"
                     :disabled="Number(quota.usedAmount) <= 0">申请核销</el-button>
        </div>
      </template>
    </el-alert>
    <el-alert v-else-if="!isAdmin" :closable="false" type="warning" style="margin-bottom: 12px;"
              title="当前账号未开通提取额度" />

    <!-- 我的核销记录（可展开看审核流程）；管理员无核销，不显示 -->
    <el-table v-if="!isAdmin" v-loading="loading" :data="list" border>
      <el-table-column type="expand">
        <template #default="scope">
          <div style="padding: 10px 30px;">
            <el-steps :active="stepActive(scope.row)" align-center
                      :process-status="scope.row.status === '2' ? 'error' : 'process'"
                      :finish-status="scope.row.status === '2' ? 'error' : 'success'">
              <el-step title="提交申请" :description="scope.row.submitTime" />
              <el-step :title="scope.row.status === '0' ? '等待审核' : (scope.row.status === '1' ? '审核通过' : '审核驳回')"
                       :description="scope.row.status === '0' ? '审核中…' : (scope.row.confirmBy ? (scope.row.confirmBy + ' · ' + (scope.row.confirmTime || '')) : '')" />
              <el-step :title="scope.row.status === '1' ? '额度已恢复' : '完成'"
                       :description="scope.row.status === '1' ? '可继续提取' : (scope.row.status === '2' ? (scope.row.remark || '驳回') : '')" />
            </el-steps>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="核销金额" align="center" prop="amount" min-width="110">
        <template #default="scope">₹{{ scope.row.amount }}</template>
      </el-table-column>
      <el-table-column label="支付截图" align="center" min-width="90">
        <template #default="scope">
          <image-preview v-if="scope.row.paymentImage" :src="scope.row.paymentImage" :width="46" :height="46" />
          <span v-else style="color:#909399;">未上传</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" min-width="100">
        <template #default="scope">
          <el-tag :type="statusTag(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" align="center" prop="submitTime" min-width="160" />
      <el-table-column label="审核时间" align="center" prop="confirmTime" min-width="160" />
      <el-table-column label="审核人" align="center" prop="confirmBy" min-width="90" />
      <el-table-column label="驳回原因/备注" align="center" prop="remark" min-width="140" show-overflow-tooltip />
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 申请核销弹窗 -->
    <el-dialog title="申请核销" v-model="submitOpen" width="460px" append-to-body>
      <div style="margin-bottom:12px; color:#606266;">
        当前已消耗额度：<b style="color:#f56c6c;">₹{{ quota ? quota.usedAmount : 0 }}</b>（可部分核销）
      </div>
      <el-form label-width="90px">
        <el-form-item label="核销金额">
          <el-input-number v-model="submitForm.amount" :min="0.01"
                           :max="quota ? Number(quota.usedAmount) : 0" :step="100" :precision="2"
                           controls-position="right" style="width: 100%" />
          <el-button link type="primary" style="margin-left:8px;"
                     @click="submitForm.amount = quota ? Number(quota.usedAmount) : 0">全额</el-button>
        </el-form-item>
        <el-form-item label="支付截图">
          <image-upload v-model="submitForm.paymentImage" :limit="1" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="submitForm.remark" type="textarea" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="submitOpen = false">取 消</el-button>
        <el-button type="primary" @click="doSubmit">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MySettlement">
import { mySettlement, submitSettlement } from "@/api/GiftCard/settlement"
import { myQuota } from "@/api/GiftCard/quota"
import { ref, reactive, toRefs, computed, getCurrentInstance } from "vue"
import useUserStore from "@/store/modules/user"

const { proxy } = getCurrentInstance()

// 是否超级管理员（豁免额度，无需核销）
const isAdmin = computed(() => (useUserStore().roles || []).includes('admin'))

const loading = ref(false)
const total = ref(0)
const list = ref([])
const quota = ref(null)
const remain = computed(() => quota.value
  ? Number(quota.value.totalQuota || 0) - Number(quota.value.usedAmount || 0) : 0)

const data = reactive({ queryParams: { pageNum: 1, pageSize: 10 } })
const { queryParams } = toRefs(data)

function statusText(s) { return s === '1' ? '已核销' : (s === '2' ? '已驳回' : '待审核') }
function statusTag(s) { return s === '1' ? 'success' : (s === '2' ? 'danger' : 'warning') }
function stepActive(row) {
  if (row.status === '0') return 1   // 提交完成，审核中
  return 3                            // 已通过/驳回，流程结束
}

function loadQuota() {
  myQuota().then(res => { quota.value = res.data || null }).catch(() => { quota.value = null })
}
function getList() {
  loading.value = true
  mySettlement(queryParams.value).then(res => {
    list.value = res.rows
    total.value = res.total
    loading.value = false
  }).catch(() => { loading.value = false })
}

const submitOpen = ref(false)
const submitForm = ref({ amount: 0, paymentImage: '', remark: '' })
function openSubmit() {
  // 默认全额核销当前已消耗
  submitForm.value = { amount: quota.value ? Number(quota.value.usedAmount) : 0, paymentImage: '', remark: '' }
  submitOpen.value = true
}
function doSubmit() {
  if (!submitForm.value.amount || submitForm.value.amount <= 0) {
    proxy.$modal.msgError("请输入核销金额")
    return
  }
  submitSettlement(submitForm.value).then(() => {
    proxy.$modal.msgSuccess("核销申请已提交，等待审核")
    submitOpen.value = false
    loadQuota()
    getList()
  })
}

// 管理员豁免额度，无需查询额度和核销记录
if (!isAdmin.value) {
  loadQuota()
  getList()
}
</script>
