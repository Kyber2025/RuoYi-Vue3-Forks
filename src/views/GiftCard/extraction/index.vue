<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" v-show="showSearch" label-width="90px" class="search-form-clean">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="类型" prop="giftType">
            <el-select
                v-model="queryParams.giftType"
                placeholder="请选择类型"
                clearable
                style="width: 100%"
            >
              <el-option
                  v-for="dict in gift_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="礼品卡代码" prop="code">
            <el-input
                v-model="queryParams.code"
                placeholder="请输入礼品卡代码"
                clearable
                @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="订单号" prop="orderNumber">
            <el-input
                v-model="queryParams.orderNumber"
                placeholder="请输入订单号"
                clearable
                @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <el-form-item label="创建时间">
            <el-date-picker
                v-model="dateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 搜索按钮单独一行 -->
      <el-row>
        <el-col :span="24">
          <div class="search-buttons">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 分割线 -->
    <el-divider class="divider-margin" />

    <!-- 操作按钮区 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="24">
        <el-button
            type="primary"
            plain
            icon="Search"
            @click="handleOpenNumSearch"
        >按数量提取
        </el-button>

        <el-button
            type="success"
            plain
            icon="Money"
            @click="handleOpenAmountSearch"
        >按金额提取
        </el-button>

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

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="GiftCardList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="拥有者" align="center" prop="ownerUserName" min-width="100"/>
      <el-table-column label="类型" align="center" prop="giftType" min-width="100">
        <template #default="scope">
          <dict-tag :options="gift_type" :value="scope.row.giftType"/>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center" prop="dtStr" min-width="120"/>
      <el-table-column label="礼品卡代码" align="center" prop="code" min-width="150"/>
      <el-table-column label="订单号" align="center" prop="orderNumber" min-width="150"/>
      <el-table-column label="金额" align="center" prop="amount" min-width="100"/>
      <el-table-column label="使用类型" align="center" prop="usageType" min-width="100">
        <template #default="scope">
          <dict-tag :options="ka_usage_type" :value="scope.row.usageType"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" min-width="100">
        <template #default="scope">
          <dict-tag :options="ka_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="更新人" align="center" prop="updateUser" min-width="100"/>
      <el-table-column label="更新时间" align="center" prop="updateTime" min-width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['GiftCard:GiftCard:edit']">修改
          </el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['GiftCard:GiftCard:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 统计信息和分页 -->
    <div class="pagination-container">
      <div class="amount-sum">
        <span>{{ amountSum }}</span>
      </div>
      <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100, 200]"
          @pagination="handlePagination"
      />
    </div>

    <!-- 添加或修改礼品卡对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="GiftCardRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="类型" prop="giftType">
          <el-select v-model="form.giftType" placeholder="请选择类型" style="width: 100%">
            <el-option
                v-for="dict in gift_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间" prop="dtStr">
          <el-input v-model="form.dtStr" placeholder="请输入时间"/>
        </el-form-item>
        <el-form-item label="礼品卡代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入礼品卡代码"/>
        </el-form-item>
        <el-form-item label="订单号" prop="orderNumber">
          <el-input v-model="form.orderNumber" placeholder="请输入订单号"/>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入金额"/>
        </el-form-item>
        <el-form-item label="使用类型" prop="usageType">
          <el-select
              v-model="form.usageType"
              placeholder="请选择使用类型"
              clearable
              style="width: 100%"
          >
            <el-option
                v-for="dict in ka_usage_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
              v-model="form.status"
              placeholder="请选择状态"
              clearable
              style="width: 100%"
          >
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
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 按数量提取对话框 -->
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

    <!-- 按金额提取对话框 -->
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

    <!-- 导出并变更状态对话框 -->
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
  searchByNum,
  searchByAmount,
  exportAndChangeStatus,
  updateGiftCard,
  delGiftCard,
  getGiftCard
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
const open = ref(false)
const title = ref("")
const form = ref({})
const isExtractionMode = ref(false)
const allExtractedData = ref([])
const rules = ref({
  giftType: [{ required: true, message: "礼品卡类型不能为空", trigger: "change" }],
  code: [{ required: true, message: "礼品卡代码不能为空", trigger: "blur" }],
  amount: [{ required: true, message: "金额不能为空", trigger: "blur" }],
  orderNumber: [{ required: true, message: "订单号不能为空", trigger: "blur" }]
});

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    giftType: null,
    code: null,
    orderNumber: null,
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

function handleOpenNumSearch() {
  numSearchForm.value = {giftType: null, amount: null, totalNum: null, dateRange: []}
  openNumSearch.value = true
}

function handleOpenAmountSearch() {
  amountSearchForm.value = {giftType: null, amount: null, totalAmount: null, dateRange: []}
  openAmountSearch.value = true
}

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

function reset() {
  form.value = {
    id: null,
    giftType: null,
    code: null,
    orderNumber: null,
    amount: null,
    usageType: null,
    status: "0",
    remark: null
  };
  proxy.resetForm("GiftCardRef");
}

function cancel() {
  open.value = false;
  reset();
}

function submitForm() {
  proxy.$refs["GiftCardRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateGiftCard(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

function handlePagination({page, limit}) {
  if (isExtractionMode.value) {
    const start = (page - 1) * limit
    const end = page * limit
    GiftCardList.value = allExtractedData.value.slice(start, end)
  } else {
    getList()
  }
}

function getList() {
  loading.value = true
  isExtractionMode.value = false
  allExtractedData.value = []

  const query = {
    ...queryParams.value,
    beginTime: dateRange.value?.[0] || undefined,
    endTime: dateRange.value?.[1] || undefined,
  }

  listGiftCard(query).then(response => {
    GiftCardList.value = response.rows
    total.value = response.total
    amountSum.value = response.msg
  }).finally(() => {
    loading.value = false
  })
}

function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getGiftCard(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改礼品卡"
  })
}

function handleDelete(row) {
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除礼品卡编号为"' + _ids + '"的数据项？').then(function () {
    return delGiftCard(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleExportWithUpdate() {
  exportUpdateForm.value = {
    newUsageType: null,
    newStatus: null
  };
  exportUpdateOpen.value = true;
}

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

function doRealExport() {
  const query = {
    ...queryParams.value,
    beginTime: dateRange.value?.[0] || undefined,
    endTime: dateRange.value?.[1] || undefined,
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

getList()
</script>

<style scoped>
/* 搜索表单样式 - 简洁白色风格 */
.search-form-clean {
  padding: 10px 0;
  margin-bottom: 0;
}

.search-form-clean :deep(.el-form-item__label) {
  font-weight: 400;
  color: #606266;
}

/* 搜索按钮区域 */
.search-buttons {
  text-align: center;
  padding-top: 10px;
}

.search-buttons .el-button {
  min-width: 100px;
  margin: 0 8px;
}

/* 分割线样式 */
.divider-margin {
  margin: 15px 0;
}

/* 按钮行间距 - 增加按钮之间的间距 */
.mb8 {
  margin-bottom: 12px;
}

.mb8 .el-button {
  margin-right: 10px;
  margin-bottom: 8px;
}

/* 表格样式 */
.el-table {
  margin-top: 10px;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 10px 0;
}

.amount-sum {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

/* 对话框样式优化 */
.dialog-footer {
  text-align: right;
}

/* 响应式优化 */
@media screen and (max-width: 768px) {
  .search-form-clean {
    padding: 10px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 10px;
  }

  .amount-sum {
    width: 100%;
    text-align: center;
  }

  .mb8 .el-button {
    margin-right: 5px;
  }
}
</style>
