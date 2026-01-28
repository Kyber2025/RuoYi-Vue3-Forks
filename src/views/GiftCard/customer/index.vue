<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form
        class="search-form-clean"
        :model="queryParams"
        ref="queryForm"
        v-show="showSearch"
        label-width="80px"
    >
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="收件人名" prop="firstName">
            <el-input
                v-model="queryParams.firstName"
                placeholder="请输入收件人名"
                clearable
                @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="收件人姓" prop="lastName">
            <el-input
                v-model="queryParams.lastName"
                placeholder="请输入收件人姓"
                clearable
                @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="城市" prop="city">
            <el-input v-model="queryParams.city" placeholder="请输入城市" clearable @keyup.enter="handleQuery" />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="州/省" prop="state">
            <el-input v-model="queryParams.state" placeholder="请输入州/省" clearable @keyup.enter="handleQuery" />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="queryParams.phone" placeholder="请输入联系电话" clearable @keyup.enter="handleQuery" />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="queryParams.email" placeholder="请输入邮箱" clearable @keyup.enter="handleQuery" />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
          <el-form-item label="收件地址" prop="addressLine">
            <el-input
                v-model="queryParams.addressLine"
                placeholder="请输入收件人地址"
                clearable
                @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="创建时间" prop="createdAt">
            <el-date-picker
                v-model="queryParams.createdAt"
                type="date"
                value-format="YYYY-MM-DD"
                clearable
                placeholder="请选择创建时间"
                style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="更新时间" prop="updatedAt">
            <el-date-picker
                v-model="queryParams.updatedAt"
                type="date"
                value-format="YYYY-MM-DD"
                clearable
                placeholder="请选择更新时间"
                style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 搜索按钮单独一行 -->
      <el-row>
        <el-col :span="24">
          <div class="search-buttons">
            <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
            <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>

    <!-- 分割线 -->
    <el-divider class="divider-margin" />

    <!-- 操作按钮区 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="24">
        <el-button type="primary" plain :icon="Plus" @click="handleAdd" v-hasPermi="['customer:info:add']">
          新增
        </el-button>
        <el-button type="success" plain :icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['customer:info:edit']">
          修改
        </el-button>
        <el-button type="danger" plain :icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['customer:info:remove']">
          删除
        </el-button>
        <el-button type="warning" plain :icon="Download" @click="handleExport" v-hasPermi="['customer:info:export']">
          导出
        </el-button>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" style="float: right;" />
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" min-width="80" />
      <el-table-column label="收件人名" align="center" prop="firstName" min-width="100" />
      <el-table-column label="收件人姓" align="center" prop="lastName" min-width="100" />
      <el-table-column label="收件人地址" align="center" prop="addressLine" min-width="200" />
      <el-table-column label="城市" align="center" prop="city" min-width="100" />
      <el-table-column label="州/省" align="center" prop="state" min-width="100" />
      <el-table-column label="邮编" align="center" prop="postCode" min-width="100" />
      <el-table-column label="联系电话" align="center" prop="phone" min-width="120" />
      <el-table-column label="邮箱" align="center" prop="email" min-width="150" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleUpdate(row)" v-hasPermi="['customer:info:edit']">修改</el-button>
          <el-button link type="danger" @click="handleDelete(row)" v-hasPermi="['customer:info:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加/修改对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="收件人名" prop="firstName">
          <el-input v-model="form.firstName" placeholder="请输入收件人名" />
        </el-form-item>
        <el-form-item label="收件人姓" prop="lastName">
          <el-input v-model="form.lastName" placeholder="请输入收件人姓" />
        </el-form-item>
        <el-form-item label="收件人地址" prop="addressLine">
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

state.rules = {
  firstName: [{ required: true, message: "收件人名不能为空", trigger: "blur" }],
  lastName: [{ required: true, message: "收件人姓不能为空", trigger: "blur" }],
  addressLine: [{ required: true, message: "收件人地址不能为空", trigger: "blur" }],
  city: [{ required: true, message: "城市不能为空", trigger: "blur" }],
  state: [{ required: true, message: "州/省不能为空", trigger: "change" }],
  postCode: [
    { required: true, message: "邮编不能为空", trigger: "blur" }
  ],
  phone: [{ required: true, message: "联系电话不能为空", trigger: "blur" }],
  email: [
    { required: true, message: "邮箱不能为空", trigger: "blur" },
    { type: "email", message: "邮箱格式不正确", trigger: ["blur", "change"] }
  ]
}

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
  formRef.value?.resetFields()
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

/* 对话框样式优化 */
.dialog-footer {
  text-align: right;
}

/* 响应式优化 */
@media screen and (max-width: 768px) {
  .search-form-clean {
    padding: 10px;
  }

  .mb8 .el-button {
    margin-right: 5px;
  }
}
</style>
