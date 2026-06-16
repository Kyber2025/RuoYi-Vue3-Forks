<template>
  <div class="app-container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- ============ Tab 1: 按操作人 ============ -->
      <el-tab-pane label="按操作人统计" name="operator">
        <el-form :inline="true" label-width="80px">
          <el-form-item label="操作人">
            <el-input v-model="opQuery.operatorName" placeholder="请输入操作人" clearable
                      style="width: 180px" @keyup.enter="getOpList" />
          </el-form-item>
          <el-form-item label="使用时间">
            <el-date-picker v-model="opDateRange" type="daterange" value-format="YYYY-MM-DD"
                            format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" style="width: 240px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="getOpList">搜索</el-button>
            <el-button icon="Refresh" @click="resetOp">重置</el-button>
            <el-button type="warning" plain icon="Download" @click="exportOp"
                       v-hasPermi="['GiftCard:stat:export']">导出</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="opLoading" :data="opList" border show-summary
                  :summary-method="getSummaries" :span-method="(p) => firstColSpan(p, opList, 'operatorName')">
          <el-table-column label="操作人" align="center" prop="operatorName" min-width="120" />
          <el-table-column label="使用类型" align="center" prop="usageTypeName" min-width="110" />
          <el-table-column label="面值" align="center" prop="faceValue" min-width="90">
            <template #default="scope">₹{{ scope.row.faceValue }}</template>
          </el-table-column>
          <el-table-column label="数量" align="center" prop="cardCount" min-width="90" />
          <el-table-column label="小计金额" align="center" prop="totalAmount" min-width="120">
            <template #default="scope">₹{{ scope.row.totalAmount }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- ============ Tab 2: 按拥有者 ============ -->
      <el-tab-pane label="按拥有者统计" name="owner">
        <el-form :inline="true" label-width="80px">
          <el-form-item label="拥有者">
            <el-input v-model="ownerQuery.ownerName" placeholder="请输入拥有者" clearable
                      style="width: 180px" @keyup.enter="getOwnerList" />
          </el-form-item>
          <el-form-item label="使用时间">
            <el-date-picker v-model="ownerDateRange" type="daterange" value-format="YYYY-MM-DD"
                            format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" style="width: 240px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="getOwnerList">搜索</el-button>
            <el-button icon="Refresh" @click="resetOwner">重置</el-button>
            <el-button type="warning" plain icon="Download" @click="exportOwner"
                       v-hasPermi="['GiftCard:stat:export']">导出</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="ownerLoading" :data="ownerList" border show-summary
                  :summary-method="getSummaries" :span-method="(p) => firstColSpan(p, ownerList, 'ownerName')">
          <el-table-column label="拥有者" align="center" prop="ownerName" min-width="130" />
          <el-table-column label="使用类型" align="center" prop="usageTypeName" min-width="110" />
          <el-table-column label="面值" align="center" prop="faceValue" min-width="90">
            <template #default="scope">₹{{ scope.row.faceValue }}</template>
          </el-table-column>
          <el-table-column label="数量" align="center" prop="cardCount" min-width="90" />
          <el-table-column label="小计金额" align="center" prop="totalAmount" min-width="120">
            <template #default="scope">₹{{ scope.row.totalAmount }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="GiftCardStat">
import { listGiftCardStat, listGiftCardStatByOwner } from "@/api/GiftCard/stat"
import { ref, reactive, getCurrentInstance } from "vue"

const { proxy } = getCurrentInstance()

const activeTab = ref("operator")

// ===== Tab1: 操作人 =====
const opLoading = ref(false)
const opList = ref([])
const opDateRange = ref([])
const opQuery = reactive({ operatorName: null })

function getOpList() {
  opLoading.value = true
  const params = { operatorName: opQuery.operatorName }
  if (opDateRange.value && opDateRange.value.length === 2) {
    params.beginTime = opDateRange.value[0]
    params.endTime = opDateRange.value[1]
  }
  listGiftCardStat(params).then(res => {
    opList.value = res.rows || res.data || []
    opLoading.value = false
  }).catch(() => { opLoading.value = false })
}
function resetOp() {
  opQuery.operatorName = null
  opDateRange.value = []
  getOpList()
}
function exportOp() {
  const params = { operatorName: opQuery.operatorName }
  if (opDateRange.value && opDateRange.value.length === 2) {
    params.beginTime = opDateRange.value[0]
    params.endTime = opDateRange.value[1]
  }
  proxy.download('GiftCard/stat/export', { ...params }, `礼品卡统计_按操作人_${new Date().getTime()}.xlsx`)
}

// ===== Tab2: 拥有者 =====
const ownerLoading = ref(false)
const ownerList = ref([])
const ownerDateRange = ref([])
const ownerQuery = reactive({ ownerName: null })

function getOwnerList() {
  ownerLoading.value = true
  const params = { ownerName: ownerQuery.ownerName }
  if (ownerDateRange.value && ownerDateRange.value.length === 2) {
    params.beginTime = ownerDateRange.value[0]
    params.endTime = ownerDateRange.value[1]
  }
  listGiftCardStatByOwner(params).then(res => {
    ownerList.value = res.rows || res.data || []
    ownerLoading.value = false
  }).catch(() => { ownerLoading.value = false })
}
function resetOwner() {
  ownerQuery.ownerName = null
  ownerDateRange.value = []
  getOwnerList()
}
function exportOwner() {
  const params = { ownerName: ownerQuery.ownerName }
  if (ownerDateRange.value && ownerDateRange.value.length === 2) {
    params.beginTime = ownerDateRange.value[0]
    params.endTime = ownerDateRange.value[1]
  }
  proxy.download('GiftCard/stat/ownerExport', { ...params }, `礼品卡统计_按拥有者_${new Date().getTime()}.xlsx`)
}

// 切 Tab 时懒加载（拥有者数据第一次切过去才查）
function handleTabChange(name) {
  if (name === 'owner' && ownerList.value.length === 0) {
    getOwnerList()
  }
}

/** 合并第一列（操作人/拥有者）相同的连续行，让报表按分组阅读 */
function firstColSpan({ row, column, rowIndex, columnIndex }, list, key) {
  if (columnIndex === 0) {
    if (rowIndex > 0 && list[rowIndex][key] === list[rowIndex - 1][key]) {
      return { rowspan: 0, colspan: 0 }
    }
    let span = 1
    for (let i = rowIndex + 1; i < list.length; i++) {
      if (list[i][key] === row[key]) span++
      else break
    }
    return { rowspan: span, colspan: 1 }
  }
}

/** 表尾合计：数量合计 + 金额合计 */
function getSummaries(param) {
  const { columns, data } = param
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) { sums[index] = '合计'; return }
    if (column.property === 'cardCount') {
      sums[index] = data.reduce((acc, cur) => acc + (Number(cur.cardCount) || 0), 0)
    } else if (column.property === 'totalAmount') {
      sums[index] = '₹' + data.reduce((acc, cur) => acc + (Number(cur.totalAmount) || 0), 0)
    } else {
      sums[index] = ''
    }
  })
  return sums
}

getOpList()
</script>
