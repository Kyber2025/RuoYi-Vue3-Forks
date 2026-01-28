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
      <el-form-item label="更新时间" style="width: 308px">
        <el-date-picker
            v-model="updateDateRange"
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
      <el-form-item label="金额" prop="amount">
        <el-input
            v-model="queryParams.amount"
            placeholder="请输入金额"
            clearable
            @keyup.enter="handleQuery"
            style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="使用类型" prop="usageType" class="search-auto-item">
        <el-select
            v-model="queryParams.usageType"
            placeholder="请选择使用类型"
            clearable
            class="search-auto-select"
        >
          <el-option
              v-for="dict in ka_usage_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status" class="search-auto-item">
        <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            class="search-auto-select"
        >
          <el-option
              v-for="dict in ka_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="拥有者" prop="ownerId" class="search-auto-item">
        <el-select
            v-model="queryParams.ownerId"
            placeholder="请选择拥有者"
            clearable
            class="search-auto-select"
        >
          <el-option
              v-for="item in ownerOptions"
              :key="item.ownerId"
              :label="item.ownerName"
              :value="item.ownerId"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-col :span="1.5">
      <el-button
          type="primary"
          plain
          icon="User"
          :disabled="multiple"
          @click="handleBatchAssignOwner"
          v-hasPermi="['GiftCard:GiftCard:edit']"
      >批量分配订单
      </el-button>

      <el-button
          type="primary"
          plain
          icon="User"
          @click="handleOpenAutoAssign"
          v-hasPermi="['GiftCard:GiftCard:edit']"
      >自动分配卡密
      </el-button>
    </el-col>

    <br>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['GiftCard:GiftCard:add']"
        >新增
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="info"
            plain
            icon="EditPen"
            :disabled="multiple"
            @click="handleBatchUpdate"
            v-hasPermi="['GiftCard:GiftCard:edit']"
        >批量修改
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['GiftCard:GiftCard:edit']"
        >修改
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['GiftCard:GiftCard:remove']"
        >删除
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['GiftCard:GiftCard:export']"
        >导出
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-upload
            class="upload-demo"
            action=""
            :http-request="handleImport"
            :show-file-list="false"
            accept=".xlsx,.xls"
            v-hasPermi="['GiftCard:GiftCard:import']"
        >
          <el-button type="primary" plain icon="Upload">导入更新</el-button>
        </el-upload>
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['GiftCard:GiftCard:edit']">修改
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['GiftCard:GiftCard:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 左边显示总金额 -->
    <span>{{ amountSum }}</span>
    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :page-sizes="[10, 20, 50, 100, 200]"
        @pagination="getList"
    />

    <!-- 添加或修改礼品卡对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="GiftCardRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类型" prop="giftType">
          <el-select v-model="form.giftType" placeholder="请选择类型">
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
        <el-form-item label="使用类型" prop="usageType" class="search-narrow-item">
          <el-select
              v-model="form.usageType"
              placeholder="请选择使用类型"
              clearable
              class="search-narrow-select"
          >
            <el-option
                v-for="dict in ka_usage_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status" class="search-narrow-item">
          <el-select
              v-model="form.status"
              placeholder="请选择状态"
              clearable
              class="search-narrow-select"
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

    <!-- 批量修改对话框 -->
    <el-dialog title="批量修改使用类型和状态" v-model="batchOpen" width="500px" append-to-body>
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="使用类型">
          <el-select
              v-model="batchForm.usageType"
              placeholder="请选择使用类型（留空不修改）"
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
        <el-form-item label="状态">
          <el-select
              v-model="batchForm.status"
              placeholder="请选择状态（留空不修改）"
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
          <el-button type="primary" @click="submitBatchUpdate">确 定</el-button>
          <el-button @click="batchOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量分配拥有者/订单 -->
    <el-dialog title="批量分配订单" v-model="assignOpen" width="500px" append-to-body>
      <el-form :model="assignForm" label-width="110px">
        <el-form-item label="分配给(拥有者)" required>
          <el-select v-model="assignForm.ownUserId" placeholder="请选择拥有者" filterable style="width: 100%">
            <el-option
                v-for="item in ownerOptionsAll"
                :key="item.ownerId"
                :label="item.ownerName"
                :value="item.ownerId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="使用类型" required>
          <el-select v-model="assignForm.usageType" placeholder="请选择使用类型" style="width: 100%">
            <el-option
                v-for="dict in ka_usage_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="强制覆盖">
          <el-switch v-model="assignForm.force"/>
          <span style="margin-left: 8px; color: #999;">开启后会覆盖已分配的卡</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitBatchAssignOwner">确 定</el-button>
          <el-button @click="assignOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 自动分配卡密 -->
    <el-dialog title="自动分配卡密" v-model="autoAssignOpen" width="520px" append-to-body>
      <el-form :model="autoAssignForm" label-width="110px">
        <el-form-item label="分配给(拥有者)" required>
          <el-select v-model="autoAssignForm.ownUserId" placeholder="请选择拥有者" filterable style="width: 100%">
            <el-option
                v-for="item in ownerOptionsAll"
                :key="item.ownerId"
                :label="item.ownerName"
                :value="item.ownerId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="使用类型" required>
          <el-select v-model="autoAssignForm.usageType" placeholder="请选择使用类型" style="width: 100%">
            <el-option
                v-for="dict in ka_usage_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="礼品卡类型" required>
          <el-select v-model="autoAssignForm.giftType" placeholder="请选择类型" style="width: 100%">
            <el-option
                v-for="dict in gift_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="单张面值" required>
          <el-input v-model="autoAssignForm.amount" type="number" placeholder="例如：100"/>
        </el-form-item>

        <el-form-item label="分配数量" required>
          <el-input v-model="autoAssignForm.quantity" type="number" placeholder="例如：10"/>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAutoAssign">确 定</el-button>
          <el-button @click="autoAssignOpen = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="GiftCard">
import {
  listGiftCard,
  getGiftCard,
  delGiftCard,
  addGiftCard,
  updateGiftCard,
  listOwnerOptions,
  batchUpdateGiftCard,
  batchAssignOwner,
  batchAutoAssignOwner,
  importGiftCardStatus
} from "@/api/GiftCard/GiftCard"
import {parseTime} from "../../../utils/ruoyi.js";
import { ref, reactive, toRefs, getCurrentInstance } from "vue"
import { ElMessageBox, ElMessage } from "element-plus"


const instance = getCurrentInstance()
const proxy = instance?.proxy
const {ka_status, ka_usage_type, gift_type} = proxy.useDict(
    'ka_status',
    'ka_usage_type',
    'gift_type'
)

const GiftCardList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const amountSum = ref(0)
const title = ref("")
const dateRange = ref([])
const updateDateRange = ref([])
const ownerOptions = ref([])
const ownerOptionsAll = ref([])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    giftType: null,
    ownerId: null,
    code: null,
    orderNumber: null,
    amount: null,
    extraNumber: null,
    usageType: null,
    status: null,
    beginTime: undefined,
    endTime: undefined,
    beginUpdateTime: undefined,
    endUpdateTime: undefined
  },
  rules: {}
})

const {queryParams, form, rules} = toRefs(data)

/** 查询礼品卡列表 */
function getList() {
  loading.value = true

  const query = {
    ...queryParams.value,
    beginTime: dateRange.value?.[0] || undefined,
    endTime: dateRange.value?.[1] || undefined,
    beginUpdateTime: updateDateRange.value?.[0] || undefined,
    endUpdateTime: updateDateRange.value?.[1] || undefined
  }

  listGiftCard(query).then(response => {
    GiftCardList.value = response.rows
    total.value = response.total
    amountSum.value = response.msg
  }).finally(() => {
    loading.value = false
  })
}

// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    sender: null,
    subject: null,
    giftType: null,
    dtStr: null,
    code: null,
    orderNumber: null,
    amount: null,
    extraNumber: null,
    usageType: null,
    status: null,
    createTime: null
  }
  proxy.resetForm("GiftCardRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/**
 * 加载已经分配卡密的用户
 */
function loadOwnerOptions() {
  listOwnerOptions().then(res => {
    const list = res?.data ?? res?.rows ?? []
    ownerOptions.value = [
      {ownerId: -1, ownerName: '未分配'},
      ...list
    ]
  }).catch(err => {
    console.error("loadOwnerOptions error:", err)
    ownerOptions.value = [{ownerId: -1, ownerName: '未分配'}]
  })
}

/**
 * 加载全部的用户
 * @return {*}
 */
function loadOwnerOptionsAll() {
  return listOwnerOptions({allFlag: true}).then(res => {
    const list = res?.data ?? res?.rows ?? []
    ownerOptionsAll.value = list
  }).catch(() => {
    ownerOptionsAll.value = []
  })
}

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  updateDateRange.value = []
  proxy.resetForm("queryRef")
  handleQuery()
}

// 新增：批量修改相关
const batchOpen = ref(false)
const batchForm = ref({
  usageType: null,
  status: null
})

//批量分配订单
const assignOpen = ref(false)
const assignForm = ref({
  ownUserId: null,
  usageType: null,
  force: false
})

//自动分配卡密
const autoAssignOpen = ref(false)
const autoAssignForm = ref({
  ownUserId: null,
  usageType: null,
  giftType: null,
  amount: null,
  quantity: 1
})

/** 批量修改按钮操作 */
function handleBatchUpdate() {
  if (ids.value.length === 0) {
    proxy.$modal.msgError("请至少选择一条数据")
    return
  }
  batchForm.value = {
    usageType: null,
    status: null
  }
  batchOpen.value = true
}

/**
 * 批量分配卡密
 */
async function handleBatchAssignOwner() {
  if (ids.value.length === 0) {
    proxy.$modal.msgError("请至少选择一条数据")
    return
  }

  assignForm.value = {ownUserId: null, usageType: null, force: false}

  // 打开前加载全量用户（仅此处用 all=true）
  await loadOwnerOptionsAll()

  assignOpen.value = true
}

/**
 * 自动分配卡密
 * @return {Promise<void>}
 */
async function handleOpenAutoAssign() {
  autoAssignForm.value = {
    ownUserId: null,
    usageType: null,
    giftType: null,
    amount: null,
    quantity: 1
  }

  if (!ownerOptionsAll.value || ownerOptionsAll.value.length === 0) {
    await loadOwnerOptionsAll()
  }

  autoAssignOpen.value = true
}

/**
 * 点击批量分配卡密
 */
function submitBatchAssignOwner() {
  if (!assignForm.value.ownUserId) {
    proxy.$modal.msgError("请选择拥有者")
    return
  }
  if (!assignForm.value.usageType) {
    proxy.$modal.msgError("请选择使用类型")
    return
  }

  const payload = {
    ids: ids.value,
    ownUserId: assignForm.value.ownUserId,
    usageType: assignForm.value.usageType,
    force: assignForm.value.force
  }

  proxy.$modal
      .confirm(`确认将选中的 ${ids.value.length} 张卡批量分配给该拥有者吗？`)
      .then(() => {
        proxy.$modal.loading("正在分配中...")
        return batchAssignOwner(payload)
      })
      .then((res) => {
        proxy.$modal.closeLoading()
        // 你后端返回：rows / requested / force / ownUserId
        const rows = res?.rows ?? res?.data?.rows
        const requested = res?.requested ?? res?.data?.requested
        proxy.$modal.msgSuccess(res?.msg || `分配完成：成功 ${rows ?? '-'} / 请求 ${requested ?? ids.value.length}`)
        assignOpen.value = false
        getList()
      })
      .catch(() => {
        proxy.$modal.closeLoading()
      })
}

/** 提交批量修改 */
function submitBatchUpdate() {
  // 校验：至少选择一项要修改的内容
  if (batchForm.value.usageType === null && batchForm.value.status === null) {
    proxy.$modal.msgWarning("请至少选择一项要修改的内容")
    return
  }

  // 确认对话框
  proxy.$modal.confirm(`是否确认批量修改选中的 ${ids.value.length} 条礼品卡？`)
      .then(() => {
        // 构造请求参数
        const data = {
          ids: ids.value,
          usageType: batchForm.value.usageType || null,  // 空字符串或 undefined 转为 null
          status: batchForm.value.status !== null && batchForm.value.status !== ''
              ? Number(batchForm.value.status)
              : null
        }

        // 调用我们刚才在 api 中定义的 batchUpdateGiftCard
        return batchUpdateGiftCard(data)
      })
      .then(() => {
        proxy.$modal.msgSuccess("批量修改成功")
        batchOpen.value = false
        getList()  // 刷新表格
      })
      .catch(() => {
      })
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加礼品卡"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getGiftCard(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改礼品卡"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["GiftCardRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateGiftCard(form.value).then(() => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addGiftCard(form.value).then(() => {
          proxy.$modal.msgSuccess("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
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

/** 导出按钮操作 */
function handleExport() {
  const query = {
    ...queryParams.value,
    beginTime: dateRange.value?.[0] || undefined,
    endTime: dateRange.value?.[1] || undefined,
    beginUpdateTime: updateDateRange.value?.[0] || undefined,
    endUpdateTime: updateDateRange.value?.[1] || undefined
  }

  proxy.$modal.confirm(`即将导出 ${total.value} 条数据，是否继续？`)
      .then(() => {
        proxy.download('GiftCard/GiftCard/export', query, `GiftCard_${new Date().getTime()}.xlsx`)
      })
      .catch(() => {
      });
}

/** 导入更新状态（上传Excel） */
function handleImport(param) {
  const file = param.file
  if (!file) {
    proxy.$modal.msgError("请选择文件")
    return
  }

  // 检查文件类型
  const fileName = file.name
  const fileExt = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase()
  if (!['xlsx', 'xls'].includes(fileExt)) {
    proxy.$modal.msgError("只能上传 Excel 文件（.xlsx 或 .xls）")
    return
  }

  const formData = new FormData()
  formData.append("file", file)

  proxy.$modal.loading("正在导入，请稍候...")

  importGiftCardStatus(formData).then(res => {
    proxy.$modal.msgSuccess(res.msg || "导入成功")
    getList() // 刷新表格，显示最新状态
  }).catch(() => {
    proxy.$modal.msgError("导入失败，请检查文件格式或数据是否正确")
  }).finally(() => {
    proxy.$modal.closeLoading()
  })
}

async function submitAutoAssign() {
  const f = autoAssignForm.value
  const $modal = proxy?.$modal // 可选：用于 loading

  if (!f.ownUserId) return $modal?.msgError?.("请选择拥有者") || ElMessage.error("请选择拥有者")
  if (!f.usageType) return $modal?.msgError?.("请选择使用类型") || ElMessage.error("请选择使用类型")
  if (!f.giftType) return $modal?.msgError?.("请选择礼品卡类型") || ElMessage.error("请选择礼品卡类型")
  if (!f.amount || Number(f.amount) <= 0) return $modal?.msgError?.("请输入正确的单张面值") || ElMessage.error("请输入正确的单张面值")
  if (!f.quantity || Number(f.quantity) < 1) return $modal?.msgError?.("请输入正确的分配数量") || ElMessage.error("请输入正确的分配数量")

  const payload = {
    ownUserId: f.ownUserId,
    usageType: f.usageType,
    giftType: f.giftType,
    amount: f.amount,
    quantity: Number(f.quantity)
  }

  const giftTypeLabel = getDictLabel(gift_type?.value ?? gift_type, payload.giftType)

  const html = `
    <div style="line-height:1.8">
      <div><b>确认自动分配卡密？</b></div>
      <br/>
      <div>礼品卡类型：<b>${giftTypeLabel}</b></div>
      <div>单张面值：<b>${payload.amount}</b></div>
      <div>分配数量：<b>${payload.quantity}</b></div>
      <br/>
      <div style="color:#e6a23c">
        ⚠ 将把「未分配」的卡密分配给该拥有者，此操作不可撤销
      </div>
    </div>
  `

  try {
    await ElMessageBox.confirm(html, "系统提示", {
      type: "warning",
      dangerouslyUseHTMLString: true,
      confirmButtonText: "确定",
      cancelButtonText: "取消"
    })

    $modal?.loading?.("正在分配中...")

    const res = await batchAutoAssignOwner(payload)

    const data = res?.data ?? res ?? {}
    const assignedCount = Number(data.assignedCount ?? 0)
    const assignedTotalAmount = data.assignedTotalAmount ?? 0

    if (assignedCount <= 0) {
      ElMessage.warning(data.msg || "库存不足或无可分配卡密")
      return
    }

    ElMessage.success(`分配成功：${assignedCount} 张（总金额 ${assignedTotalAmount}）`)
    autoAssignOpen.value = false
    getList()
  } catch (e) {
    // 取消 或 请求异常 都会进来
  } finally {
    $modal?.closeLoading?.()
  }
}


function getDictLabel(dictOptions, value) {
  if (value === null || value === undefined || value === '') return ''

  const arr =
      Array.isArray(dictOptions) ? dictOptions :
          Array.isArray(dictOptions?.value) ? dictOptions.value :
              Array.isArray(dictOptions?.data) ? dictOptions.data :
                  []

  const item = arr.find(d => String(d.value) === String(value))
  return item?.label ?? String(value)
}


loadOwnerOptions()
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
