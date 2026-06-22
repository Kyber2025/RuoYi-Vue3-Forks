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
                     :disabled="available <= 0">申请核销</el-button>
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
      <el-table-column label="实付金额" align="center" min-width="130">
        <template #default="scope">
          <span v-if="scope.row.settleForeignAmount != null">{{ scope.row.settleForeignAmount }} {{ scope.row.settleCurrency }}</span>
          <span v-else style="color:#909399;">—</span>
        </template>
      </el-table-column>
      <el-table-column label="结算汇率" align="center" min-width="100">
        <template #default="scope">
          <span v-if="scope.row.settleRate != null">{{ scope.row.settleRate }}</span>
          <span v-else style="color:#909399;">—</span>
        </template>
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

    <!-- 申请核销弹窗（提交后不可修改/撤销，提交前需二次确认） -->
    <el-dialog title="申请核销" v-model="submitOpen" width="480px" append-to-body>
      <div style="margin-bottom:12px; color:#606266;">
        已消耗 <b style="color:#f56c6c;">₹{{ quota ? quota.usedAmount : 0 }}</b>
        ｜ 待审核 <b>₹{{ pendingAmount }}</b>
        ｜ 剩余可核销 <b style="color:#67c23a;">₹{{ available }}</b>（可分多笔提交）
      </div>
      <el-form label-width="90px">
        <el-form-item label="核销金额">
          <div style="display:flex; align-items:center; width:100%;">
            <el-input v-model="submitForm.amount" type="number" placeholder="0" @input="recalcForeign" style="flex:1;">
              <template #prepend>₹</template>
            </el-input>
            <el-button link type="primary" style="margin-left:8px; white-space:nowrap;"
                       @click="submitForm.amount = available; recalcForeign()">剩余全额</el-button>
          </div>
          <div style="font-size:12px;color:#909399;">单位：卢比（₹），额度始终按卢比计</div>
        </el-form-item>
        <el-divider content-position="left" style="margin:6px 0 14px;">
          <span style="font-size:13px;color:#909399;">实际结算（仅记录，不影响卢比额度）</span>
        </el-divider>
        <el-form-item label="结算币种">
          <el-select v-model="submitForm.settleCurrency" style="width:100%" @change="onCurrencyChange">
            <el-option v-for="c in currencyOptions" :key="c.code" :label="`${c.name}（${c.code}）`" :value="c.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="约定汇率">
          <el-input v-model="submitForm.settleRate" type="number" placeholder="0"
                    :disabled="submitForm.settleCurrency === 'INR'" @input="recalcForeign" style="width:100%" />
          <div style="font-size:12px;color:#909399;">1 {{ submitForm.settleCurrency }} = 多少卢比（双方约定，可改）</div>
        </el-form-item>
        <el-form-item label="实付金额">
          <el-input v-model="submitForm.settleForeignAmount" type="number" placeholder="0"
                    @input="recalcRate" style="width:100%" />
          <div style="font-size:12px;color:#909399;">默认=核销额÷汇率；手动改这里会实时反算汇率（单位：{{ submitForm.settleCurrency }}）</div>
        </el-form-item>
        <el-divider style="margin:6px 0 14px;" />
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
import { listRate } from "@/api/GiftCard/rate"
import { ref, reactive, toRefs, computed, getCurrentInstance } from "vue"
import { ElMessageBox } from "element-plus"
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
// 待审核金额合计（当前页）：允许分多笔提交，剩余可核销 = 已消耗 − 待审核
const pendingAmount = computed(() =>
  (list.value || []).filter(r => r.status === '0')
    .reduce((s, r) => s + Number(r.amount || 0), 0))
const available = computed(() => {
  const used = quota.value ? Number(quota.value.usedAmount || 0) : 0
  return Math.max(0, used - pendingAmount.value)
})

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

// ===== 结算币种/汇率（提交人填写，仅记录，不参与额度计算）=====
const rateList = ref([])
const currencyOptions = computed(() => rateList.value)
const rateMap = computed(() => {
  const m = {}
  rateList.value.forEach(r => { m[r.code] = Number(r.rateToInr) })
  return m
})
function loadRates() {
  listRate().then(res => { rateList.value = res.data || [] }).catch(() => {})
}
// 改 核销额/汇率 → 算实付金额 = 核销额 ÷ 汇率
function recalcForeign() {
  const amt = Number(submitForm.value.amount)
  const rate = Number(submitForm.value.settleRate)
  if (amt > 0 && rate > 0) {
    submitForm.value.settleForeignAmount = Math.round((amt / rate) * 100) / 100
  }
}
// 改 实付金额 → 反算汇率 = 核销额 ÷ 实付（保持三者一致）；卢比固定汇率1不反算
function recalcRate() {
  if (submitForm.value.settleCurrency === 'INR') return
  const amt = Number(submitForm.value.amount)
  const foreign = Number(submitForm.value.settleForeignAmount)
  if (amt > 0 && foreign > 0) {
    submitForm.value.settleRate = Math.round((amt / foreign) * 1000000) / 1000000
  }
}
// 切换币种：卢比固定汇率1；其它带出当前手动汇率作为起填值，再重算实付
function onCurrencyChange() {
  const code = submitForm.value.settleCurrency
  if (code === 'INR') {
    submitForm.value.settleRate = 1
  } else if (rateMap.value[code]) {
    submitForm.value.settleRate = rateMap.value[code]
  }
  recalcForeign()
}

const submitOpen = ref(false)
const submitForm = ref({ amount: 0, settleCurrency: 'USDT', settleRate: null, settleForeignAmount: null, paymentImage: '', remark: '' })
function openSubmit() {
  submitForm.value = {
    amount: available.value,
    settleCurrency: 'USDT', settleRate: rateMap.value['USDT'] || null, settleForeignAmount: null,
    paymentImage: '', remark: ''
  }
  recalcForeign()
  submitOpen.value = true
}
function doSubmit() {
  const amount = Number(submitForm.value.amount)
  const rate = Number(submitForm.value.settleRate)
  const foreign = submitForm.value.settleForeignAmount === '' || submitForm.value.settleForeignAmount == null
    ? null : Number(submitForm.value.settleForeignAmount)
  if (!amount || amount <= 0) {
    proxy.$modal.msgError("请输入核销金额"); return
  }
  if (!submitForm.value.settleCurrency) {
    proxy.$modal.msgError("请选择结算币种"); return
  }
  if (!rate || rate <= 0) {
    proxy.$modal.msgError("请输入约定汇率"); return
  }
  const cur = submitForm.value.settleCurrency
  // 二次信息确认：提交后不可修改/撤销
  const html =
    '<div style="line-height:1.9">' +
    '核销金额：<b>₹' + amount + '</b><br/>' +
    '结算币种：<b>' + cur + '</b><br/>' +
    '约定汇率：<b>' + rate + '</b>（1 ' + cur + ' = ₹' + rate + '）<br/>' +
    '实付金额：<b>' + (foreign != null ? foreign + ' ' + cur : '—') + '</b><br/>' +
    '<span style="color:#f56c6c;font-weight:bold;">提交后不可修改、不可撤销，请务必核对；如信息有误，责任自负。</span>' +
    '</div>'
  ElMessageBox.confirm(html, '请确认核销信息', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '确认提交',
    cancelButtonText: '返回修改',
    type: 'warning'
  }).then(() => {
    return submitSettlement({
      amount, settleCurrency: cur, settleRate: rate, settleForeignAmount: foreign,
      paymentImage: submitForm.value.paymentImage, remark: submitForm.value.remark
    })
  }).then(() => {
    proxy.$modal.msgSuccess("核销申请已提交，等待审核")
    submitOpen.value = false
    loadQuota()
    getList()
  }).catch(() => {})
}

// 管理员豁免额度，无需查询额度和核销记录
if (!isAdmin.value) {
  loadRates()
  loadQuota()
  getList()
}
</script>
