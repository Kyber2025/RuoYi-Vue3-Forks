<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- ============ Tab 1: 按操作人 ============ -->
      <el-tab-pane label="按操作人统计" name="operator">
        <el-form :inline="true" label-width="80px">
          <el-form-item label="操作人">
            <el-input v-model="opName" placeholder="请输入操作人" clearable style="width: 180px"
                      @keyup.enter="loadOpSummary" />
          </el-form-item>
          <el-form-item label="使用时间">
            <el-date-picker v-model="opDateRange" type="daterange" value-format="YYYY-MM-DD"
                            format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" style="width: 240px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="loadOpSummary">搜索</el-button>
            <el-button icon="Refresh" @click="resetOp">重置</el-button>
            <el-button type="warning" plain icon="Download" @click="exportOpSummary"
                       v-hasPermi="['GiftCard:stat:export']">导出汇总</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="opLoading" :data="opSummary" border show-summary :summary-method="sumSummary">
          <el-table-column label="操作人" align="center" prop="userName" min-width="140" />
          <el-table-column label="总数量" align="center" prop="totalCount" min-width="120" />
          <el-table-column label="总金额" align="center" prop="totalAmount" min-width="140">
            <template #default="scope">₹{{ scope.row.totalAmount }}</template>
          </el-table-column>
          <el-table-column label="操作" align="center" min-width="100">
            <template #default="scope">
              <el-button link type="primary" icon="View" @click="openDetail('operator', scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- ============ Tab 2: 按拥有者 ============ -->
      <el-tab-pane label="按拥有者统计" name="owner">
        <el-form :inline="true" label-width="80px">
          <el-form-item label="拥有者">
            <el-input v-model="ownerName" placeholder="请输入拥有者" clearable style="width: 180px"
                      @keyup.enter="loadOwnerSummary" />
          </el-form-item>
          <el-form-item label="使用时间">
            <el-date-picker v-model="ownerDateRange" type="daterange" value-format="YYYY-MM-DD"
                            format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" style="width: 240px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="loadOwnerSummary">搜索</el-button>
            <el-button icon="Refresh" @click="resetOwner">重置</el-button>
            <el-button type="warning" plain icon="Download" @click="exportOwnerSummary"
                       v-hasPermi="['GiftCard:stat:export']">导出汇总</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="ownerLoading" :data="ownerSummary" border show-summary :summary-method="sumSummary">
          <el-table-column label="拥有者" align="center" prop="userName" min-width="140" />
          <el-table-column label="总数量" align="center" prop="totalCount" min-width="120" />
          <el-table-column label="总金额" align="center" prop="totalAmount" min-width="140">
            <template #default="scope">₹{{ scope.row.totalAmount }}</template>
          </el-table-column>
          <el-table-column label="操作" align="center" min-width="100">
            <template #default="scope">
              <el-button link type="primary" icon="View" @click="openDetail('owner', scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- ============ 详情弹窗 ============ -->
    <el-dialog :title="detailTitle" v-model="detailOpen" width="720px" append-to-body>
      <div style="margin-bottom: 10px; color: #909399; font-size: 13px;">
        统计时间：{{ detailTimeText }}
      </div>
      <el-table v-loading="detailLoading" :data="detailList" border show-summary :summary-method="sumDetail"
                :span-method="cardTypeSpan" max-height="460">
        <el-table-column label="礼品卡类型" align="center" prop="cardType" min-width="110" />
        <el-table-column label="使用类型" align="center" prop="usageTypeName" min-width="110" />
        <el-table-column label="面值" align="center" prop="faceValue" min-width="90">
          <template #default="scope">₹{{ scope.row.faceValue }}</template>
        </el-table-column>
        <el-table-column label="数量" align="center" prop="cardCount" min-width="90" />
        <el-table-column label="金额" align="center" prop="totalAmount" min-width="120">
          <template #default="scope">₹{{ scope.row.totalAmount }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup name="GiftCardStat">
import { summaryByOperator, detailByOperator, summaryByOwner, detailByOwner } from "@/api/GiftCard/stat"
import { ref, getCurrentInstance } from "vue"

const { proxy } = getCurrentInstance()
const activeTab = ref("operator")

// ===== Tab1: 操作人汇总 =====
const opLoading = ref(false)
const opSummary = ref([])
const opName = ref(null)
const opDateRange = ref([])

function opParams() {
  const p = { operatorName: opName.value }
  if (opDateRange.value && opDateRange.value.length === 2) {
    p.beginTime = opDateRange.value[0]; p.endTime = opDateRange.value[1]
  }
  return p
}
function loadOpSummary() {
  opLoading.value = true
  summaryByOperator(opParams()).then(res => {
    opSummary.value = res.rows || res.data || []
    opLoading.value = false
  }).catch(() => { opLoading.value = false })
}
function resetOp() { opName.value = null; opDateRange.value = []; loadOpSummary() }
function exportOpSummary() {
  proxy.download('GiftCard/stat/summaryExport', { ...opParams() }, `礼品卡汇总_按操作人_${new Date().getTime()}.xlsx`)
}

// ===== Tab2: 拥有者汇总 =====
const ownerLoading = ref(false)
const ownerSummary = ref([])
const ownerName = ref(null)
const ownerDateRange = ref([])

function ownerParams() {
  const p = { ownerName: ownerName.value }
  if (ownerDateRange.value && ownerDateRange.value.length === 2) {
    p.beginTime = ownerDateRange.value[0]; p.endTime = ownerDateRange.value[1]
  }
  return p
}
function loadOwnerSummary() {
  ownerLoading.value = true
  summaryByOwner(ownerParams()).then(res => {
    ownerSummary.value = res.rows || res.data || []
    ownerLoading.value = false
  }).catch(() => { ownerLoading.value = false })
}
function resetOwner() { ownerName.value = null; ownerDateRange.value = []; loadOwnerSummary() }
function exportOwnerSummary() {
  proxy.download('GiftCard/stat/ownerSummaryExport', { ...ownerParams() }, `礼品卡汇总_按拥有者_${new Date().getTime()}.xlsx`)
}

function handleTabChange(name) {
  if (name === 'owner' && ownerSummary.value.length === 0) loadOwnerSummary()
}

// ===== 详情弹窗 =====
const detailOpen = ref(false)
const detailLoading = ref(false)
const detailList = ref([])
const detailTitle = ref("")
const detailTimeText = ref("")

function openDetail(dim, row) {
  detailOpen.value = true
  detailLoading.value = true
  detailList.value = []
  const dateRange = dim === 'operator' ? opDateRange.value : ownerDateRange.value
  const params = {}
  if (dateRange && dateRange.length === 2) {
    params.beginTime = dateRange[0]; params.endTime = dateRange[1]
    detailTimeText.value = `${dateRange[0]} ~ ${dateRange[1]}`
  } else {
    detailTimeText.value = "全部时间"
  }

  if (dim === 'operator') {
    detailTitle.value = `操作人「${row.userName}」使用明细`
    params.operatorName = row.userName
    detailByOperator(params).then(res => {
      detailList.value = res.rows || res.data || []
      detailLoading.value = false
    }).catch(() => { detailLoading.value = false })
  } else {
    detailTitle.value = `拥有者「${row.userName}」使用明细`
    if (row.userId == null) params.nullOwner = true
    else params.ownerUserId = row.userId
    detailByOwner(params).then(res => {
      detailList.value = res.rows || res.data || []
      detailLoading.value = false
    }).catch(() => { detailLoading.value = false })
  }
}

/** 合并详情里"礼品卡类型"相同的连续行 */
function cardTypeSpan({ rowIndex, columnIndex }) {
  if (columnIndex === 0) {
    const list = detailList.value
    if (rowIndex > 0 && list[rowIndex].cardType === list[rowIndex - 1].cardType) {
      return { rowspan: 0, colspan: 0 }
    }
    let span = 1
    for (let i = rowIndex + 1; i < list.length; i++) {
      if (list[i].cardType === list[rowIndex].cardType) span++
      else break
    }
    return { rowspan: span, colspan: 1 }
  }
}

/** 汇总表尾合计 */
function sumSummary(param) {
  const { columns, data } = param
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) { sums[index] = '合计'; return }
    if (column.property === 'totalCount') {
      sums[index] = data.reduce((a, c) => a + (Number(c.totalCount) || 0), 0)
    } else if (column.property === 'totalAmount') {
      sums[index] = '₹' + data.reduce((a, c) => a + (Number(c.totalAmount) || 0), 0)
    } else { sums[index] = '' }
  })
  return sums
}

/** 详情表尾合计 */
function sumDetail(param) {
  const { columns, data } = param
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) { sums[index] = '合计'; return }
    if (column.property === 'cardCount') {
      sums[index] = data.reduce((a, c) => a + (Number(c.cardCount) || 0), 0)
    } else if (column.property === 'totalAmount') {
      sums[index] = '₹' + data.reduce((a, c) => a + (Number(c.totalAmount) || 0), 0)
    } else { sums[index] = '' }
  })
  return sums
}

loadOpSummary()
</script>
