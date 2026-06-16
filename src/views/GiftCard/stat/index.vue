<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" label-width="80px">
      <el-form-item label="操作人" prop="operatorName">
        <el-input
            v-model="queryParams.operatorName"
            placeholder="请输入操作人"
            clearable
            style="width: 180px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="使用时间">
        <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['GiftCard:stat:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 统计表格 -->
    <el-table
        v-loading="loading"
        :data="statList"
        border
        show-summary
        :summary-method="getSummaries"
        :span-method="operatorSpanMethod"
    >
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
  </div>
</template>

<script setup name="GiftCardStat">
import { listGiftCardStat } from "@/api/GiftCard/stat"
import { ref, reactive, toRefs, getCurrentInstance } from "vue"

const { proxy } = getCurrentInstance()

const loading = ref(false)
const showSearch = ref(true)
const statList = ref([])
const dateRange = ref([])

const data = reactive({
  queryParams: {
    operatorName: null,
    beginTime: null,
    endTime: null
  }
})
const { queryParams } = toRefs(data)

/** 查询统计列表 */
function getList() {
  loading.value = true
  const params = { ...queryParams.value }
  if (dateRange.value && dateRange.value.length === 2) {
    params.beginTime = dateRange.value[0]
    params.endTime = dateRange.value[1]
  } else {
    params.beginTime = null
    params.endTime = null
  }
  listGiftCardStat(params).then(res => {
    statList.value = res.rows || res.data || []
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

/** 搜索 */
function handleQuery() {
  getList()
}

/** 重置 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  queryParams.value.operatorName = null
  getList()
}

/** 导出 */
function handleExport() {
  const params = { ...queryParams.value }
  if (dateRange.value && dateRange.value.length === 2) {
    params.beginTime = dateRange.value[0]
    params.endTime = dateRange.value[1]
  }
  proxy.download('GiftCard/stat/export', { ...params }, `用户礼品卡使用统计_${new Date().getTime()}.xlsx`)
}

/** 合并"操作人"单元格：同一操作人的多行合并为一格，让报表按用户分组阅读 */
function operatorSpanMethod({ row, column, rowIndex, columnIndex }) {
  if (columnIndex === 0) {
    const list = statList.value
    // 当前行与上一行操作人相同 → 隐藏
    if (rowIndex > 0 && list[rowIndex].operatorName === list[rowIndex - 1].operatorName) {
      return { rowspan: 0, colspan: 0 }
    }
    // 往下数连续相同操作人的行数
    let span = 1
    for (let i = rowIndex + 1; i < list.length; i++) {
      if (list[i].operatorName === row.operatorName) span++
      else break
    }
    return { rowspan: span, colspan: 1 }
  }
}

/** 表尾合计行：数量合计 + 金额合计 */
function getSummaries(param) {
  const { columns, data } = param
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    if (column.property === 'cardCount') {
      const total = data.reduce((acc, cur) => acc + (Number(cur.cardCount) || 0), 0)
      sums[index] = total
    } else if (column.property === 'totalAmount') {
      const total = data.reduce((acc, cur) => acc + (Number(cur.totalAmount) || 0), 0)
      sums[index] = '₹' + total
    } else {
      sums[index] = ''
    }
  })
  return sums
}

getList()
</script>
