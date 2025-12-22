<template>
  <div class="app-container">
    <el-form
        class="search-form"
        :model="queryParams"
        ref="queryForm"
        size="small"
        :inline="true"
        v-show="showSearch"
        label-width="68px"
    >
      <el-form-item label="收件人名" prop="firstName">
        <el-input
            v-model="queryParams.firstName"
            placeholder="请输入收件人名"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="收件人姓" prop="lastName">
        <el-input
            v-model="queryParams.lastName"
            placeholder="请输入收件人姓"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="收件人地址" prop="addressLine" class="addr-item">
        <el-input
            v-model="queryParams.addressLine"
            placeholder="请输入收件人地址"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item label="城市" prop="city">
        <el-input v-model="queryParams.city" placeholder="请输入城市" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <el-form-item label="州/省" prop="state">
        <el-input v-model="queryParams.state" placeholder="请输入州/省" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入联系电话" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="queryParams.email" placeholder="请输入邮箱" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <el-form-item label="创建时间" prop="createdAt">
        <el-date-picker
            v-model="queryParams.createdAt"
            type="date"
            value-format="YYYY-MM-DD"
            clearable
            placeholder="请选择创建时间"
        />
      </el-form-item>

      <el-form-item label="更新时间" prop="updatedAt">
        <el-date-picker
            v-model="queryParams.updatedAt"
            type="date"
            value-format="YYYY-MM-DD"
            clearable
            placeholder="请选择更新时间"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" size="small" @click="resetQuery">重置</el-button>

      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain :icon="Plus" size="small" @click="handleAdd" v-hasPermi="['customer:info:add']">
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain :icon="Edit" size="small" :disabled="single" @click="handleUpdate" v-hasPermi="['customer:info:edit']">
          修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain :icon="Delete" size="small" :disabled="multiple" @click="handleDelete" v-hasPermi="['customer:info:remove']">
          删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain :icon="Download" size="small" @click="handleExport" v-hasPermi="['customer:info:export']">
          导出
        </el-button>
      </el-col>

      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="收件人名" align="center" prop="firstName" />
      <el-table-column label="收件人姓" align="center" prop="lastName" />
      <el-table-column label="收件人地址" align="center" prop="addressLine" />
      <el-table-column label="城市" align="center" prop="city" />
      <el-table-column label="州/省" align="center" prop="state" />
      <el-table-column label="邮编" align="center" prop="postCode" />
      <el-table-column label="联系电话" align="center" prop="phone" />
      <el-table-column label="邮箱" align="center" prop="email" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleUpdate(row)" v-hasPermi="['customer:info:edit']">修改</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)" v-hasPermi="['customer:info:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="收件人名" prop="firstName">
          <el-input v-model="form.firstName" placeholder="请输入收件人名" />
        </el-form-item>
        <el-form-item label="收件人姓" prop="lastName">
          <el-input v-model="form.lastName" placeholder="请输入收件人姓" />
        </el-form-item>
        <el-form-item label="收件人地址" prop="addressLine" class="addr-item">
          <el-input v-model="form.addressLine" placeholder="请输入收件人地址" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="form.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="州/省" prop="state">
          <el-input v-model="form.state" placeholder="请输入州/省" />
        </el-form-item>
        <el-form-item label="邮编" prop="postCode">
          <el-input v-model="form.postCode" placeholder="选择州后自动填充" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
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

<script setup>
import { ref, reactive, toRefs, getCurrentInstance, watch } from "vue"
import { listInfo, getInfo, delInfo, addInfo, updateInfo } from "@/api/GiftCard/customerInfo"
import { Search, Refresh, Plus, Edit, Delete, Download } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()

const queryForm = ref()
const formRef = ref()

/*const stateOptions = [
  { label: "Assam", value: "Assam", postCode: "781123" },
  { label: "Ladakh", value: "Ladakh", postCode: "194201" },
  { label: "Kerala", value: "Kerala", postCode: "673888" },
  { label: "Goa", value: "Goa", postCode: "403002" },
  { label: "Sikkim", value: "Sikkim", postCode: "737101" }
]*/

const state = reactive({
  loading: true,
  ids: [],
  single: true,
  multiple: true,
  showSearch: true,
  total: 0,
  infoList: [],
  title: "",
  open: false,
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    firstName: null,
    lastName: null,
    addressLine: null,
    city: null,
    state: null,
    postCode: null,
    phone: null,
    email: null,
    createdAt: null,
    updatedAt: null
  },
  form: {},
  rules: {}
})

const { loading, ids, single, multiple, showSearch, total, infoList, title, open, queryParams, form, rules } = toRefs(state)

/*const validateStatePostCode = (rule, value, callback) => {
  const st = form.value.state
  const pc = form.value.postCode
  const found = stateOptions.find(i => i.value === st)
  if (!found) return callback(new Error("请选择州/省"))
  if (pc !== found.postCode) return callback(new Error(`邮编必须为 ${found.postCode}`))
  callback()
}*/

state.rules = {
  firstName: [{ required: true, message: "收件人名不能为空", trigger: "blur" }],
  lastName: [{ required: true, message: "收件人姓不能为空", trigger: "blur" }],
  addressLine: [{ required: true, message: "收件人地址不能为空", trigger: "blur" }],
  city: [{ required: true, message: "城市不能为空", trigger: "blur" }],
  state: [{ required: true, message: "州/省不能为空", trigger: "change" }],
  postCode: [
    { required: true, message: "邮编不能为空", trigger: "blur" },
    /*{ validator: validateStatePostCode, trigger: ["blur", "change"] }*/
  ],
  phone: [{ required: true, message: "联系电话不能为空", trigger: "blur" }],
  email: [
    { required: true, message: "邮箱不能为空", trigger: "blur" },
    { type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] }
  ]
}

/*const syncPostCode = (target) => {
  const found = stateOptions.find(i => i.value === target.state)
  target.postCode = found ? found.postCode : null
}*/

/*watch(
    () => queryParams.value.state,
    (val) => {
      const found = stateOptions.find(i => i.value === val)
      queryParams.value.postCode = found ? found.postCode : null
    }
)

watch(
    () => form.value.state,
    () => syncPostCode(form.value),
    { immediate: true }
)*/

function getList() {
  loading.value = true
  listInfo(queryParams.value).then(res => {
    infoList.value = res.rows
    total.value = res.total
  }).finally(() => {
    loading.value = false
  })
}

function reset() {
  form.value = {
    id: null,
    firstName: null,
    lastName: null,
    addressLine: null,
    city: null,
    state: null,
    postCode: null,
    phone: null,
    email: null
  }
  formRef.value?.resetFields() // 如果你项目里有 resetForm 方法
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  queryForm.value?.resetFields()
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  reset()
  open.value = true
  title.value = "新增收件人信息"
}

function handleUpdate(row) {
  reset()
  const id = row?.id ?? (Array.isArray(ids.value) ? ids.value[0] : ids.value)
  if (!id) return
  getInfo(id).then(res => {
    form.value = res.data
    open.value = true
    title.value = "修改收件人信息"
  })
}

function submitForm() {
  formRef.value?.validate(valid => {
    if (!valid) return
    const req = form.value.id ? updateInfo(form.value) : addInfo(form.value)
    req.then(() => {
      proxy?.$modal?.msgSuccess(form.value.id ? "修改成功" : "新增成功")
      open.value = false
      getList()
    })
  })
}

function cancel() {
  open.value = false
  reset()
}

function handleDelete(row) {
  const delIds = row?.id || ids.value
  if (!delIds || (Array.isArray(delIds) && delIds.length === 0)) return
  proxy?.$modal
      ?.confirm(`是否确认删除编号为"${delIds}"的数据项？`)
      .then(() => delInfo(delIds))
      .then(() => {
        getList()
        proxy?.$modal?.msgSuccess("删除成功")
      })
      .catch(() => {})
}

function handleExport() {
  proxy?.download?.(
      "/gift-cards/customer/info/export",
      { ...queryParams.value },
      `info_${Date.now()}.xlsx`
  )
}

getList()
</script>

<style scoped>
/* 搜索区改成 grid，彻底解决挤来挤去的问题 */
.search-form {
  display: grid;
  grid-template-columns: repeat(4, minmax(220px, 1fr)); /* 一行4列 */
  column-gap: 18px;
  row-gap: 10px;
  align-items: start;
}

/* 覆盖 inline form-item 默认的 margin（不然 grid 不好看） */
.search-form :deep(.el-form-item) {
  margin-right: 0 !important;
  margin-bottom: 0 !important;
}

/* label 不换行，避免“收件人地址”被拆两行把下面顶下去 */
.search-form :deep(.el-form-item__label) {
  white-space: nowrap;
  line-height: 32px;
}

/* 让“收件人地址”占两列，基本就不会被挤到第二行 */
.search-form :deep(.addr-item) {
  grid-column: span 2;
}

/* 州/省下拉框变大：让 item 更宽 + select 占满 */
/*.search-form :deep(.state-item) {
  min-width: 260px;
}
.search-form :deep(.state-item .el-select) {
  width: 100%;
}*/

</style>
