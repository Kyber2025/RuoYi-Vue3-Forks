<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单号" prop="orderNumber">
        <el-input
            v-model="queryParams.orderNumber"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="handleQuery"
            style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="操作人" prop="operatorName">
        <el-input
            v-model="queryParams.operatorName"
            placeholder="请输入操作人姓名"
            clearable
            @keyup.enter="handleQuery"
            style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="操作类型" prop="operationType">
        <el-select
            v-model="queryParams.operationType"
            placeholder="请选择操作类型"
            clearable
            style="width: 200px"
        >
          <el-option
              v-for="dict in giftCardOperOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="操作时间" style="width: 308px">
        <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['gift:operationLog:export']"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="giftCardOperationLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="礼品卡ID" align="center" prop="giftCardId" />
      <el-table-column label="订单号" align="center" prop="orderNumber" min-width="150" />
      <el-table-column label="操作人" align="center" prop="operatorName" />
      <el-table-column label="操作类型" align="center" prop="operationType" width="220">
        <template #default="scope">
          <el-tag>
            {{ giftCardOperOptions.find(opt => opt.value === scope.row.operationType)?.label || scope.row.operationType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态变更" align="center" width="120">
        <template #default="scope">
          <div v-if="scope.row.oldStatus !== scope.row.newStatus">
            {{ scope.row.oldStatus }} <el-icon><Right /></el-icon> {{ scope.row.newStatus }}
          </div>
          <div v-else>
            {{ scope.row.newStatus }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类型变更" align="center" width="120">
        <template #default="scope">
          <div v-if="scope.row.oldUsageType !== scope.row.newUsageType && scope.row.newUsageType">
            {{ scope.row.oldUsageType }} <el-icon><Right /></el-icon> {{ scope.row.newUsageType }}
          </div>
          <div v-else>
            {{ scope.row.newUsageType || '-' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作金额" align="center" prop="operationAmount" />
<!--      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />-->
      <el-table-column label="IP地址" align="center" prop="ipAddress" width="160"/>
      <el-table-column label="操作时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['gift:operationLog:edit']">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="giftCardOperationLogRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="GiftCardOperationLog">
import { listGiftCardOperationLog, getGiftCardOperationLog,
  updateGiftCardOperationLog, exportGiftCardOperationLog } from "@/api/GiftCard/giftCardOperationLog";
import { parseTime } from "@/utils/ruoyi";
const { proxy } = getCurrentInstance();

const giftCardOperationLogList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    giftCardId: null,
    operatorName: null,
    operationType: null,
    orderNumber: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

const giftCardOperOptions = [
  { value: "SYSTEM_IMPORT", label: "系统创建" },
  { value: "UPDATE_WEB_ONE", label: "客户端单笔修改" },
  { value: "UPDATE_APP", label: "手机端修改状态(卡密已经充值)" },
  { value: "UPDATE_APP_GET", label: "手机端获取未使用的卡密" },
  { value: "UPDATE_WEB_BATCH", label: "客户端批量修改" },
  { value: "UPDATE_WEB_IMPORT", label: "客户端导入更新" },
  { value: "UPDATE_WEB_EXPORT", label: "客户端导出修改" }
];

/** 查询礼品卡操作日志列表 */
function getList() {
  loading.value = true;
  listGiftCardOperationLog(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    giftCardOperationLogList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    giftCardId: null,
    remark: null
  };
  proxy.resetForm("giftCardOperationLogRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value
  getGiftCardOperationLog(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改礼品卡操作日志";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["giftCardOperationLogRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateGiftCardOperationLog(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}


/** 导出按钮操作 */
function handleExport() {
  proxy.download('gift-cards/operation/log/export', {
    ...queryParams.value
  }, `gift_card_operation_log_${new Date().getTime()}.xlsx`)
}

getList();
</script>