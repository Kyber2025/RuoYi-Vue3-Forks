<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="90px"
             class="search-form">
      <el-form-item label="类型" prop="giftType" class="search-auto-item">
        <el-select
            v-model="queryParams.giftType"
            placeholder="请选择类型"
            clearable
            class="search-auto-select"
        >
          <el-option
              v-for="dict in gift_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        />
      </el-form-item>

      <el-form-item label="礼品卡代码" prop="code">
        <el-input
            v-model="queryParams.code"
            placeholder="请输入礼品卡代码"
            clearable
            @keyup.enter="handleQuery"
            style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="订单号" prop="orderNumber">
        <el-input
            v-model="queryParams.orderNumber"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="handleQuery"
            style="width: 200px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <br>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Search"
            @click="handleOpenNumSearch"
        >按数量提取
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Money"
            @click="handleOpenAmountSearch"
        >按金额提取
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExportWithUpdate"
            v-hasPermi="['GiftCard:GiftCard:export']"
        >导出并修改
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="GiftCardList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="拥有者" align="center" prop="ownerUserName"/>
      <el-table-column label="类型" align="center" prop="giftType">
        <template #default="scope">
          <dict-tag :options="gift_type" :value="scope.row.giftType"/>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center" prop="dtStr"/>
      <el-table-column label="礼品卡代码" align="center" prop="code"/>
      <el-table-column label="订单号" align="center" prop="orderNumber"/>
      <el-table-column label="金额" align="center" prop="amount"/>
      <el-table-column label="使用类型" align="center" prop="usageType">
        <template #default="scope">
          <dict-tag :options="ka_usage_type" :value="scope.row.usageType"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="ka_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="更新人" align="center" prop="updateUser"/>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
    </el-table>

    <span>{{ amountSum }}</span>
    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100, 200]"
        @pagination="handlePagination"
    />

    <el-dialog title="按数量提取可用卡" v-model="openNumSearch" width="450px" append-to-body>
      <el-form :model="numSearchForm" label-width="100px">
        <el-form-item label="礼品卡类型" required>
          <el-select v-model="numSearchForm.giftType" placeholder="请选择类型" style="width: 100%">
            <el-option
                v-for="dict in gift_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单张面值" required>
          <el-input type="number" v-model="numSearchForm.amount" placeholder="例如: 100"/>
        </el-form-item>
        <el-form-item label="提取数量" required>
          <el-input type="number" v-model="numSearchForm.totalNum" placeholder="例如: 10" />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
              v-model="numSearchForm.dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitNumSearch">查询提取</el-button>
        <el-button @click="openNumSearch = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog title="按金额提取可用卡" v-model="openAmountSearch" width="450px" append-to-body>
      <el-form :model="amountSearchForm" label-width="100px">
        <el-form-item label="礼品卡类型" required>
          <el-select v-model="amountSearchForm.giftType" placeholder="请选择类型" style="width: 100%">
            <el-option
                v-for="dict in gift_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单张面值" required>
          <el-input type="number" v-model="amountSearchForm.amount" placeholder="例如: 100"/>
        </el-form-item>
        <el-form-item label="目标总金额" required>
          <el-input type="number" v-model="amountSearchForm.totalAmount" placeholder="例如: 3000 (必须能整除面值)" />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
              v-model="amountSearchForm.dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitAmountSearch">查询提取</el-button>
        <el-button @click="openAmountSearch = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog title="导出并变更状态" v-model="exportUpdateOpen" width="500px" append-to-body>
      <div style="margin-bottom: 20px; color: #e6a23c;">
        <el-icon>
          <Warning/>
        </el-icon>
        注意：此操作将导出当前查询结果集中的所有数据，并将它们的状态统一修改为以下值。
      </div>
      <el-form :model="exportUpdateForm" label-width="100px">
        <el-form-item label="变更使用类型">
          <el-select v-model="exportUpdateForm.newUsageType" placeholder="请选择(留空不修改)" clearable
                     style="width: 100%">
            <el-option
                v-for="dict in ka_usage_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="变更状态">
          <el-select v-model="exportUpdateForm.newStatus" placeholder="请选择(留空不修改)" clearable
                     style="width: 100%">
            <el-option
                v-for="dict in ka_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitExportWithUpdate">确 定 导 出</el-button>
          <el-button @click="exportUpdateOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="GiftCard">
import {
  listGiftCard,
  // [修改点] 删除了 listOwnerOptions 引用，因为移除了拥有者下拉框
  searchByNum,
  searchByAmount,
  exportAndChangeStatus
} from "@/api/GiftCard/GiftCard"
import {parseTime} from "../../../utils/ruoyi.js";
import { ref, reactive, toRefs, getCurrentInstance } from "vue"
import { saveAs } from "file-saver"

const instance = getCurrentInstance()
const proxy = instance?.proxy
const {ka_status, ka_usage_type, gift_type} = proxy.useDict(
    'ka_status',
    'ka_usage_type',
    'gift_type'
)

const GiftCardList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const amountSum = ref(0)
const dateRange = ref([])
// [修改点] 删除了 updateDateRange 变量
// [修改点] 删除了 ownerOptions 变量
const isExtractionMode = ref(false)
const allExtractedData = ref([])

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    giftType: null,
    code: null,
    orderNumber: null,
    // [修改点] 删除了 amount, extraNumber, usageType, status, ownerId, beginUpdateTime, endUpdateTime 等参数
    beginTime: undefined,
    endTime: undefined
  },
})

const {queryParams} = toRefs(data)

const openNumSearch = ref(false)
const openAmountSearch = ref(false)
const openResult = ref(false)

const numSearchForm = ref({
  giftType: null,
  amount: null,
  totalNum: null,
  dateRange: []
})

const amountSearchForm = ref({
  giftType: null,
  amount: null,
  totalAmount: null,
  dateRange: []
})

const exportUpdateOpen = ref(false);
const exportUpdateForm = ref({
  newUsageType: null,
  newStatus: null
});

// 2. 打开对话框方法
function handleOpenNumSearch() {
  numSearchForm.value = {giftType: null, amount: null, totalNum: null}
  openNumSearch.value = true
}

function handleOpenAmountSearch() {
  amountSearchForm.value = {giftType: null, amount: null, totalAmount: null}
  openAmountSearch.value = true
}

// 3. 提交按数量查询
function submitNumSearch() {
  const formDateRange = numSearchForm.value.dateRange || [];
  const params = {
    ...numSearchForm.value,
    beginTime: formDateRange[0] || undefined,
    endTime: formDateRange[1] || undefined
  }
  if (!params.giftType || !params.amount || !params.totalNum) {
    proxy.$modal.msgError("请完整填写所有选项")
    return
  }

  proxy.$modal.loading("正在提取中...")
  searchByNum(params).then(res => {
    proxy.$modal.closeLoading()
    if (res.data) {
      showResult(res.data)
      openNumSearch.value = false
    }
  }).catch(() => {
    proxy.$modal.closeLoading()
  })
}

// 4. 提交按金额查询
function submitAmountSearch() {
  const formDateRange = amountSearchForm.value.dateRange || [];
  const params = {
    ...amountSearchForm.value,
    beginTime: formDateRange[0] || undefined,
    endTime: formDateRange[1] || undefined
  }
  if (!params.giftType || !params.amount || !params.totalAmount) {
    proxy.$modal.msgError("请完整填写所有选项")
    return
  }

  proxy.$modal.loading("正在提取中...")
  searchByAmount(params).then(res => {
    proxy.$modal.closeLoading()
    if (res.data) {
      showResult(res.data)
      openAmountSearch.value = false
    }
  }).catch(() => {
    proxy.$modal.closeLoading()
  })
}

// 5. 显示结果通用方法 (直接渲染到主表格)
function showResult(list) {
  isExtractionMode.value = true
  allExtractedData.value = list
  total.value = list.length
  const sum = list.reduce((prev, curr) => prev + (curr.amount || 0), 0)
  amountSum.value = "本次提取总金额: " + sum
  queryParams.value.pageNum = 1
  handlePagination({
    page: queryParams.value.pageNum,
    limit: queryParams.value.pageSize
  })
  openResult.value = false
  proxy.$modal.msgSuccess("提取成功，结果已展示")
}

/** * 统一的分页处理入口 */
function handlePagination({page, limit}) {
  if (isExtractionMode.value) {
    const start = (page - 1) * limit
    const end = page * limit
    GiftCardList.value = allExtractedData.value.slice(start, end)
  } else {
    getList()
  }
}

/** 查询礼品卡列表 */
function getList() {
  loading.value = true
  isExtractionMode.value = false
  allExtractedData.value = []

  const query = {
    ...queryParams.value,
    beginTime: dateRange.value?.[0] || undefined,
    endTime: dateRange.value?.[1] || undefined,
    // [修改点] 删除了 updateDateRange 相关参数
  }

  listGiftCard(query).then(response => {
    GiftCardList.value = response.rows
    total.value = response.total
    amountSum.value = response.msg
  }).finally(() => {
    loading.value = false
  })
}

// [修改点] 删除了 loadOwnerOptions 方法

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  // [修改点] 删除了 updateDateRange 重置
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据 (用于导出并修改)
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

// 【导出并修改】点击“导出并修改”按钮
function handleExportWithUpdate() {
  exportUpdateForm.value = {
    newUsageType: null,
    newStatus: null
  };
  exportUpdateOpen.value = true;
}

// 【导出并修改】提交导出并修改
function submitExportWithUpdate() {
  const newUsageType = exportUpdateForm.value.newUsageType;
  const newStatus = exportUpdateForm.value.newStatus;

  if (!newUsageType && (newStatus === null || newStatus === '')) {
    proxy.$modal.confirm('您未选择任何变更项，将仅执行普通导出，是否继续？').then(() => {
      doRealExport();
    }).catch(() => {
    });
    return;
  }

  let dataCount = 0;
  if (isExtractionMode.value) {
    dataCount = allExtractedData.value.length;
  } else {
    dataCount = total.value;
  }

  proxy.$modal.confirm(
      `当前共有 ${dataCount} 条数据等待处理。\n\n确认要导出并修改这 ${dataCount} 条数据的状态吗？`
  ).then(() => {
    doRealExport();
  }).catch(() => {
  });
}

// 【导出并修改】执行真正的请求
function doRealExport() {
  const query = {
    ...queryParams.value,
    beginTime: dateRange.value?.[0] || undefined,
    endTime: dateRange.value?.[1] || undefined,
    // [修改点] 删除了 updateDateRange 相关参数
  };

  let ids = null;
  if (isExtractionMode.value && allExtractedData.value.length > 0) {
    ids = allExtractedData.value.map(item => item.id).join(',');
  }

  proxy.$modal.loading("正在导出并更新数据，请稍候...");

  exportAndChangeStatus(query, exportUpdateForm.value.newUsageType, exportUpdateForm.value.newStatus, ids)
      .then((res) => {
        const blob = new Blob([res])
        saveAs(blob, `GiftCard_Updated_${new Date().getTime()}.xlsx`)

        proxy.$modal.closeLoading();
        proxy.$modal.msgSuccess("操作成功");
        exportUpdateOpen.value = false;
      })
      .catch(() => {
        proxy.$modal.closeLoading();
      });
}

// [修改点] 删除了 loadOwnerOptions() 的调用
getList()
</script>

<style scoped>
/* 搜索区域：允许自动换行 */
.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

/* 搜索区域里的每个表单项之间留点间距 */
.search-form .el-form-item {
  margin-right: 12px;
  margin-bottom: 18px;
}

/* 三个下拉：类型 / 使用类型 / 状态，自适应宽度 */
.search-auto-item {
  flex: 1 1 180px;
  min-width: 150px;
  max-width: 200px;
}

/* 下拉框占满自己那一格 */
.search-auto-select {
  width: 100%;
}

.search-form .el-form-item__label {
  white-space: nowrap;
}

.search-form :deep(.el-form-item__label) {
  white-space: nowrap;
  flex: 0 0 90px;
}
</style>