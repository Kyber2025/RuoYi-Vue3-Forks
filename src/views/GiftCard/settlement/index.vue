<template>
  <div class="app-container">
    <!-- 货币换算器：USDT / 卢比 / 港币 / 人民币（以卢比为基准，后台维护汇率） -->
    <el-card shadow="never" class="mb8" style="margin-bottom:12px;">
      <template #header>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-weight:bold;">💱 货币换算器</span>
          <el-button size="small" type="primary" plain @click="openRate"
                     v-hasPermi="['GiftCard:settlement:audit']">汇率设置</el-button>
        </div>
      </template>
      <el-row :gutter="12">
        <el-col :span="6" v-for="c in currencies" :key="c.code">
          <div style="font-size:12px;color:#909399;margin-bottom:4px;">{{ c.name }}（{{ c.code }}）</div>
          <el-input v-model="amounts[c.code]" type="number" placeholder="0"
                    @input="convertFrom(c.code)" clearable>
            <template #prepend>{{ c.symbol }}</template>
          </el-input>
        </el-col>
      </el-row>
      <div style="margin-top:10px; display:flex; align-items:center; flex-wrap:wrap; gap:10px;">
        <span style="font-size:12px;color:#606266;">换算依据：</span>
        <el-radio-group v-model="rateMode" size="small" @change="recompute">
          <el-radio-button label="manual">手动汇率</el-radio-button>
          <el-radio-button label="live">实时汇率</el-radio-button>
        </el-radio-group>
        <el-button size="small" :loading="liveLoading" @click="fetchLive">获取实时汇率</el-button>
        <span v-if="liveRates" style="font-size:12px;color:#909399;">
          实时更新：{{ liveRates.updateTime }}（{{ liveRates.source }}）
        </span>
      </div>
      <div style="margin-top:6px;font-size:12px;color:#909399;">
        {{ rateMode === 'live' ? '实时' : '手动' }}汇率（1 单位 = 多少卢比）：
        <span v-for="c in nonBase" :key="c.code" style="margin-right:14px;">1 {{ c.code }} = ₹{{ effRate(c.code) }}</span>
      </div>
    </el-card>

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
      <el-form-item label="提交时间">
        <el-date-picker v-model="dateRange" value-format="YYYY-MM-DD" type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                        style="width: 240px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="list" border>
      <el-table-column label="账号" align="center" prop="userName" min-width="110" />
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
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 汇率设置（管理员） -->
    <el-dialog title="汇率设置（以卢比 INR 为基准）" v-model="rateOpen" width="440px" append-to-body>
      <div style="margin-bottom:10px;">
        <el-button size="small" type="success" plain :loading="liveLoading" @click="fillRateFormFromLive">用实时汇率填入</el-button>
        <span v-if="liveRates" style="margin-left:8px;font-size:12px;color:#909399;">实时：{{ liveRates.updateTime }}</span>
      </div>
      <el-form label-width="150px">
        <el-form-item v-for="r in rateForm" :key="r.code" :label="`1 ${r.name}（${r.code}）=`">
          <el-input-number v-model="r.rateToInr" :min="0.000001" :precision="6" :step="1"
                           controls-position="right" style="width:78%" />
          <span style="margin-left:6px;color:#909399;">卢比</span>
        </el-form-item>
        <div style="color:#909399;font-size:12px;padding-left:8px;">基准币种「卢比(INR)」固定为 1，不可修改。</div>
      </el-form>
      <template #footer>
        <el-button @click="rateOpen = false">取 消</el-button>
        <el-button type="primary" @click="saveRates">保 存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="GiftCardSettlement">
import { listSettlement, confirmSettlement, rejectSettlement } from "@/api/GiftCard/settlement"
import { listRate, updateRate, liveRate } from "@/api/GiftCard/rate"
import { ref, reactive, toRefs, computed, getCurrentInstance } from "vue"

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

const dateRange = ref([])
function getList() {
  loading.value = true
  listSettlement(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    list.value = res.rows
    total.value = res.total
    loading.value = false
  }).catch(() => { loading.value = false })
}
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
function resetQuery() {
  dateRange.value = []
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
// ===== 货币换算器 =====
const SYMBOLS = { USDT: '$', INR: '₹', HKD: 'HK$', CNY: '¥' }
const rateList = ref([])        // 手动维护汇率 [{id,code,name,rateToInr}]
const liveRates = ref(null)     // 实时汇率 {USDT,INR,HKD,CNY,updateTime,source}
const rateMode = ref('manual')  // 换算依据：manual 手动 / live 实时
const liveLoading = ref(false)
let lastCode = ''               // 记录用户最后编辑的币种，用于换汇率后重算

const currencies = computed(() =>
  rateList.value.map(r => ({ ...r, symbol: SYMBOLS[r.code] || r.code })))
const nonBase = computed(() => currencies.value.filter(c => c.code !== 'INR'))

const manualMap = computed(() => {
  const m = {}
  rateList.value.forEach(r => { m[r.code] = Number(r.rateToInr) })
  return m
})
const liveMap = computed(() => {
  const m = {}
  if (liveRates.value) {
    ['USDT', 'INR', 'HKD', 'CNY'].forEach(k => {
      if (liveRates.value[k] != null) m[k] = Number(liveRates.value[k])
    })
  }
  return m
})
// 当前生效汇率：选了"实时"且已获取则用实时，否则用手动
const rateMap = computed(() =>
  (rateMode.value === 'live' && liveRates.value) ? liveMap.value : manualMap.value)

function effRate(code) {
  const v = rateMap.value[code]
  return v != null ? parseFloat(Number(v).toFixed(6)) : '—'
}

const amounts = reactive({ USDT: '', INR: '', HKD: '', CNY: '' })
// 在某币种输入框输入时，按当前生效汇率换算其它币种（以卢比为桥）
function convertFrom(code) {
  lastCode = code
  const v = Number(amounts[code])
  if (!amounts[code] || isNaN(v) || v <= 0) {
    Object.keys(amounts).forEach(k => { if (k !== code) amounts[k] = '' })
    return
  }
  const inr = v * (rateMap.value[code] || 0)
  Object.keys(rateMap.value).forEach(k => {
    if (k !== code) {
      const r = rateMap.value[k] || 0
      amounts[k] = r > 0 ? String(Math.round((inr / r) * 10000) / 10000) : ''
    }
  })
}
// 切换汇率依据或刷新实时汇率后，按上次编辑的币种重算
function recompute() {
  if (lastCode && amounts[lastCode]) convertFrom(lastCode)
}
function loadRates() {
  listRate().then(res => { rateList.value = res.data || [] }).catch(() => {})
}
function fetchLive() {
  liveLoading.value = true
  liveRate().then(res => {
    liveRates.value = res.data
    rateMode.value = 'live'
    recompute()
    proxy.$modal.msgSuccess("已获取实时汇率")
  }).catch(() => {}).finally(() => { liveLoading.value = false })
}

// 汇率设置弹窗
const rateOpen = ref(false)
const rateForm = ref([])
function openRate() {
  rateForm.value = nonBase.value.map(c => ({ id: c.id, code: c.code, name: c.name, rateToInr: Number(c.rateToInr) }))
  rateOpen.value = true
}
function fillRateFormFromLive() {
  if (!liveRates.value) {
    // 还没拉过实时汇率，先拉再填
    liveLoading.value = true
    liveRate().then(res => {
      liveRates.value = res.data
      doFillFromLive()
    }).catch(() => { proxy.$modal.msgError("获取实时汇率失败") })
      .finally(() => { liveLoading.value = false })
    return
  }
  doFillFromLive()
}
function doFillFromLive() {
  rateForm.value.forEach(r => {
    const lv = liveRates.value[r.code]
    if (lv != null) r.rateToInr = parseFloat(Number(lv).toFixed(6))
  })
  proxy.$modal.msgSuccess("已用实时汇率填入，确认后点保存")
}
async function saveRates() {
  for (const r of rateForm.value) {
    if (!r.rateToInr || r.rateToInr <= 0) { proxy.$modal.msgError(`${r.name} 汇率必须大于 0`); return }
  }
  for (const r of rateForm.value) {
    await updateRate({ id: r.id, code: r.code, rateToInr: r.rateToInr })
  }
  proxy.$modal.msgSuccess("汇率已更新")
  rateOpen.value = false
  loadRates()
}

loadRates()
getList()
</script>
