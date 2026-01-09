                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="90px" class="search-form">
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
        />
      </el-form-item>
      <el-form-item label="订单号" prop="orderNumber">
        <el-input
          v-model="queryParams.orderNumber"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="金额" prop="amount">
        <el-input
          v-model="queryParams.amount"
          placeholder="请输入金额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="编号" prop="extraNumber">
        <el-input
          v-model="queryParams.extraNumber"
          placeholder="请输入编号"
          clearable
          @keyup.enter="handleQuery"
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
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['GiftCard:GiftCard:add']"
        >新增</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="info"
            plain
            icon="EditPen"
            :disabled="multiple"
            @click="handleBatchUpdate"
            v-hasPermi="['GiftCard:GiftCard:edit']"
        >批量修改</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['GiftCard:GiftCard:edit']"
        >修改</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['GiftCard:GiftCard:remove']"
        >删除</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['GiftCard:GiftCard:export']"
        >导出</el-button>
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

      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Search"
            @click="handleOpenNumSearch"
        >按数量提取</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Money"
            @click="handleOpenAmountSearch"
        >按金额提取</el-button>
      </el-col>

      <el-col :span="1.5" style="margin-left: auto;">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExportWithUpdate"
            v-hasPermi="['GiftCard:GiftCard:export']"
        >导出并修改</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="GiftCardList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="发件人" align="center" prop="sender" />
      <el-table-column label="拥有者" align="center" prop="ownerUserName" />
      <el-table-column label="主题" align="center" prop="subject" />
      <el-table-column label="类型" align="center" prop="giftType">
        <template #default="scope">
          <dict-tag :options="gift_type" :value="scope.row.giftType"/>
        </template>
      </el-table-column>
      <el-table-column label="时间" align="center" prop="dtStr" />
      <el-table-column label="礼品卡代码" align="center" prop="code" />
      <el-table-column label="订单号" align="center" prop="orderNumber" />
      <el-table-column label="金额" align="center" prop="amount" />
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
      <el-table-column label="更新人" align="center" prop="updateUser" />
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
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['GiftCard:GiftCard:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['GiftCard:GiftCard:remove']">删除</el-button>
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
      @pagination="handlePagination"
    />

    <!-- 添加或修改礼品卡对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="GiftCardRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="发件人" prop="sender">
          <el-input v-model="form.sender" placeholder="请输入发件人" />
        </el-form-item>
        <el-form-item label="主题" prop="subject">
          <el-input v-model="form.subject" placeholder="请输入主题" />
        </el-form-item>
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
          <el-input v-model="form.dtStr" placeholder="请输入时间" />
        </el-form-item>
        <el-form-item label="礼品卡代码" prop="code">
          <el-input v-model="form.code" placeholder="请输入礼品卡代码" />
        </el-form-item>
        <el-form-item label="订单号" prop="orderNumber">
          <el-input v-model="form.orderNumber" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="编号" prop="extraNumber">
          <el-input v-model="form.extraNumber" placeholder="请输入编号" />
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

    <!-- 限制卡查询 -->
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
          <el-input type="number" v-model="numSearchForm.amount" placeholder="例如: 100" />
        </el-form-item>
        <el-form-item label="提取数量" required>
          <el-input type="number" v-model="numSearchForm.totalNum" placeholder="例如: 10" />
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
          <el-input type="number" v-model="amountSearchForm.amount" placeholder="例如: 100" />
        </el-form-item>
        <el-form-item label="目标总金额" required>
          <el-input type="number" v-model="amountSearchForm.totalAmount" placeholder="例如: 3000 (必须能整除面值)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitAmountSearch">查询提取</el-button>
        <el-button @click="openAmountSearch = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog title="导出并变更状态" v-model="exportUpdateOpen" width="500px" append-to-body>
      <div style="margin-bottom: 20px; color: #e6a23c;">
        <el-icon><Warning /></el-icon>
        注意：此操作将导出当前查询结果集中的所有数据，并将它们的状态统一修改为以下值。
      </div>
      <el-form :model="exportUpdateForm" label-width="100px">
        <el-form-item label="变更使用类型">
          <el-select v-model="exportUpdateForm.newUsageType" placeholder="请选择(留空不修改)" clearable style="width: 100%">
            <el-option
                v-for="dict in ka_usage_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="变更状态">
          <el-select v-model="exportUpdateForm.newStatus" placeholder="请选择(留空不修改)" clearable style="width: 100%">
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
import { listGiftCard, getGiftCard, delGiftCard, addGiftCard, updateGiftCard,
  batchUpdateGiftCard, importGiftCardStatus, searchByNum, searchByAmount,exportAndChangeStatus } from "@/api/GiftCard/GiftCard"
import {parseTime} from "../../../utils/ruoyi.js";

const { proxy } = getCurrentInstance()
const { ka_status, ka_usage_type, gift_type } = proxy.useDict(
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
const isExtractionMode = ref(false) // 标记：当前是否处于“提取结果查看”模式
const allExtractedData = ref([])    // 缓存：存储提取回来的所有数据

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    giftType: null,
    //dtStr: null,

    code: null,
    orderNumber: null,
    amount: null,
    extraNumber: null,
    usageType: null,
    status: null,
    beginTime: undefined,
    endTime: undefined
  },
  rules: {
  }
})

const { queryParams, form, rules } = toRefs(data)

const openNumSearch = ref(false)
const openAmountSearch = ref(false)
const openResult = ref(false)
const resultList = ref([])
const resultTotalAmount = ref(0)

const numSearchForm = ref({
  giftType: null,
  amount: null,
  totalNum: null
})

const amountSearchForm = ref({
  giftType: null,
  amount: null,
  totalAmount: null
})

const exportUpdateOpen = ref(false);
const exportUpdateForm = ref({
  newUsageType: null,
  newStatus: null
});

// 2. 打开对话框方法
function handleOpenNumSearch() {
  numSearchForm.value = { giftType: null, amount: null, totalNum: null }
  openNumSearch.value = true
}

function handleOpenAmountSearch() {
  amountSearchForm.value = { giftType: null, amount: null, totalAmount: null }
  openAmountSearch.value = true
}

// 3. 提交按数量查询
function submitNumSearch() {
  const params = numSearchForm.value
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
  const params = amountSearchForm.value
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

// 5. 显示结果通用方法 (修改版：直接渲染到主表格)
function showResult(list) {
  // 【新增】1. 开启提取模式
  isExtractionMode.value = true

  // 【新增】2. 把后端给的所有数据备份到本地
  allExtractedData.value = list

  // 3. 设置总条数（分页组件会根据这个计算有多少页）
  total.value = list.length

  // 4. 计算总金额
  const sum = list.reduce((prev, curr) => prev + (curr.amount || 0), 0)
  amountSum.value = "本次提取总金额: " + sum

  // 【新增】5. 强制重置到第 1 页，防止用户之前翻到了第 5 页导致数据显示为空
  queryParams.value.pageNum = 1

  // 【新增】6. 手动触发一次切片，显示第 1 页数据
  handlePagination({
    page: queryParams.value.pageNum,
    limit: queryParams.value.pageSize
  })

  // 7. 关闭弹窗并提示
  openResult.value = false
  proxy.$modal.msgSuccess("提取成功，结果已展示")
}

/** * 统一的分页处理入口
 * 根据当前模式，决定是“查库”还是“查本地数组”
 */
function handlePagination({ page, limit }) {
  if (isExtractionMode.value) {
    // --- 模式 A: 前端内存分页 (针对提取结果) ---
    // 计算切片的起始和结束位置
    const start = (page - 1) * limit
    const end = page * limit
    // 从缓存的全量数据中，切出一页给表格显示
    GiftCardList.value = allExtractedData.value.slice(start, end)
  } else {
    // --- 模式 B: 后端数据库分页 (针对普通查询) ---
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
    endTime: dateRange.value?.[1] || undefined
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

/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm("queryRef")
  handleQuery()
}

// 新增：批量修改相关
const batchOpen = ref(false)
const batchForm = ref({
  usageType: null,
  status: null
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
  proxy.$modal.confirm('是否确认删除礼品卡编号为"' + _ids + '"的数据项？').then(function() {
    return delGiftCard(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  const query = {
    ...queryParams.value,
    beginTime: dateRange.value?.[0] || undefined,
    endTime: dateRange.value?.[1] || undefined
  }

  // 【新增】关键逻辑：如果是提取模式，只导出提取到的那几条
  if (isExtractionMode.value && allExtractedData.value.length > 0) {
    // 获取所有提取数据的 ID，并转为逗号分隔的字符串
    query.ids = allExtractedData.value.map(item => item.id).join(',');
  }

  proxy.download('GiftCard/GiftCard/export', query, `GiftCard_${new Date().getTime()}.xlsx`)
}

// 【新增导出并修改】点击“导出并修改”按钮
function handleExportWithUpdate() {
  exportUpdateForm.value = {
    newUsageType: null,
    newStatus: null
  };
  exportUpdateOpen.value = true;
}

// 【新增导出并修改】提交导出并修改
function submitExportWithUpdate() {
  const newUsageType = exportUpdateForm.value.newUsageType;
  const newStatus = exportUpdateForm.value.newStatus;

  // 校验：防止误操作，至少要选一个，或者你可以允许都不选（仅导出）
  if (!newUsageType && (newStatus === null || newStatus === '')) {
    proxy.$modal.confirm('您未选择任何变更项，将仅执行普通导出，是否继续？').then(() => {
      doRealExport();
    }).catch(() => {});
    return;
  }

  // 再次确认
  proxy.$modal.confirm('确认要导出并修改当前结果集的状态吗？').then(() => {
    doRealExport();
  }).catch(() => {});
}

// 【新增导出并修改】执行真正的请求
function doRealExport() {
  const query = {
    ...queryParams.value,
    beginTime: dateRange.value?.[0] || undefined,
    endTime: dateRange.value?.[1] || undefined
  };

  let ids = null;
  if (isExtractionMode.value && allExtractedData.value.length > 0) {
    // 如果是提取模式，收集所有提取数据的ID，用逗号分隔或直接传数组（取决于axios配置，RuoYi通常支持逗号分隔）
    // 这里生成逗号分隔字符串，后端 Long[] 可以自动解析
    ids = allExtractedData.value.map(item => item.id).join(',');
  }

  proxy.$modal.loading("正在导出并更新数据，请稍候...");

  exportAndChangeStatus(query, exportUpdateForm.value.newUsageType, exportUpdateForm.value.newStatus, ids)
      .then((res) => {
        // 处理文件下载
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

getList()
</script>

<style scoped>
/* 搜索区域：允许自动换行 */
.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

/* 搜索区域里的每个表单项之间留点间距 */
.search-form .el-form-item {
  margin-right: 12px;
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

