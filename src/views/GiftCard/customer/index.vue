<template>
  <div class="app-container">
    <el-form
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

      <el-form-item label="收件人地址" prop="addressLine">
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

      <el-form-item label="邮编" prop="postCode">
        <el-input v-model="queryParams.postCode" placeholder="请输入邮编" clearable @keyup.enter="handleQuery" />
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
        <el-button type="primary" size="small" @click="handleQuery">搜索</el-button>
        <el-button size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain size="small" @click="handleAdd" v-hasPermi="['system:info:add']">
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain size="small" :disabled="single" @click="handleUpdate" v-hasPermi="['system:info:edit']">
          修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain size="small" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:info:remove']">
          删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain size="small" @click="handleExport" v-hasPermi="['system:info:export']">
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

      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="{ row }">
          <span>{{ parseTime(row.createdAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
        <template #default="{ row }">
          <span>{{ parseTime(row.updatedAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleUpdate(row)" v-hasPermi="['system:info:edit']">修改</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)" v-hasPermi="['system:info:remove']">删除</el-button>
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
          <el-input v-model="form.postCode" placeholder="请输入邮编" />
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
import { ref, reactive, toRefs, getCurrentInstance } from "vue"
import { listInfo, getInfo, delInfo, addInfo, updateInfo } from "@/api/GiftCard/customerInfo"

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
  rules: {
    firstName: [{ required: true, message: "收件人名不能为空", trigger: "blur" }]
  }
})

const { loading, ids, single, multiple, showSearch, total, infoList, title, open, queryParams, form, rules } = toRefs(state)

function getList() {
  loading.value = true
  listInfo(queryParams.value).then(res => {
    infoList.value = res.rows
    total.value = res.total
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
  proxy?.resetForm("formRef") // 如果你项目里有 resetForm 方法
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy?.resetForm("queryForm")
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
  const id = row?.id || ids.value
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
