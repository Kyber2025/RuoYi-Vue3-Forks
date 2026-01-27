<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="default" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="手机号" prop="phone">
        <el-input
            v-model="queryParams.phone"
            placeholder="请输入手机号"
            clearable
            @keyup.enter="handleQuery"
        />
        <template #prefix>
          <el-icon><Iphone /></el-icon>
        </template>
      </el-form-item>
      <el-form-item label="手机电量" prop="batteryLevel">
        <el-input
            v-model="queryParams.batteryLevel"
            placeholder="请输入手机电量 0-100"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否充电" prop="isCharging">
        <el-select
            v-model="queryParams.isCharging"
            placeholder="请选择充电状态"
            clearable
            style="width: 180px"
            @keyup.enter="handleQuery"
        >
          <el-option :value="1" label="充电中">
            <div style="display: flex; align-items: center;">
              <el-icon color="#67C23A" style="margin-right: 8px;"><Lightning /></el-icon>
              <span>充电中</span>
            </div>
          </el-option>
          <el-option :value="0" label="未充电">
            <div style="display: flex; align-items: center;">
              <el-icon color="#909399" style="margin-right: 8px;"><CircleClose /></el-icon>
              <span>未充电</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备型号" prop="deviceModel">
        <el-input
            v-model="queryParams.deviceModel"
            placeholder="请输入设备型号"
            clearable
            @keyup.enter="handleQuery"
        />
        <template #prefix>
          <el-icon><Cellphone /></el-icon>
        </template>
      </el-form-item>
      <el-form-item label="系统版本" prop="osVersion">
        <el-input
            v-model="queryParams.osVersion"
            placeholder="请输入系统版本"
            clearable
            @keyup.enter.="handleQuery"
        />
      </el-form-item>
      <el-form-item label="应用版本" prop="appVersion">
        <el-input
            v-model="queryParams.appVersion"
            placeholder="请输入应用版本"
            clearable
            @keyup.enter.="handleQuery"
        />
      </el-form-item>
      <el-form-item label="IP地址" prop="ipAddress">
        <el-input
            v-model="queryParams.ipAddress"
            placeholder="请输入IP地址"
            clearable
            @keyup.enter.="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
            v-model="dateRangeCreatedAt"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="更新时间">
        <el-date-picker
            v-model="dateRangeUpdatedAt"
            type="datetimerange"
            range-separator="-"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="default" @click="handleQuery">
          <el-icon><Search /></el-icon>
          <span>搜索</span>
        </el-button>
        <el-button size="default" @click="resetQuery">
          <el-icon><Refresh /></el-icon>
          <span>重置</span>
        </el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            size="default"
            @click="handleAdd"
        >
          <el-icon><Plus /></el-icon>
          <span>新增</span>
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            size="default"
            :disabled="single"
            @click="handleUpdate"
        >
          <el-icon><Edit /></el-icon>
          <span>修改</span>
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            size="default"
            :disabled="multiple"
            @click="handleDelete"
        >
          <el-icon><Delete /></el-icon>
          <span>删除</span>
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            size="default"
            @click="handleExport"
        >
          <el-icon><Download /></el-icon>
          <span>导出</span>
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="logList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="手机号" align="center" prop="phone">
        <template #default="scope">
          <el-icon><Iphone /></el-icon> {{ scope.row.phone }}
        </template>
      </el-table-column>
      <el-table-column label="手机电量" align="center" prop="batteryLevel" />
      <el-table-column label="是否充电" align="center" prop="isCharging">
        <template #default="scope">
          <el-tag v-if="scope.row.isCharging == 1" type="success">
            <el-icon><Lightning /></el-icon> 充电中
          </el-tag>
          <el-tag v-else type="info">
            <el-icon><CircleClose /></el-icon> 未充电
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="内容描述 / 日志信息" align="center" prop="content" />
      <el-table-column label="状态标识" align="center" prop="status" />
      <el-table-column label="设备型号" align="center" prop="deviceModel">
        <template #default="scope">
          <el-icon><Cellphone /></el-icon> {{ scope.row.deviceModel }}
        </template>
      </el-table-column>
      <el-table-column label="系统类型 Android / iOS" align="center" prop="osType" />
      <el-table-column label="系统版本" align="center" prop="osVersion" />
      <el-table-column label="应用版本" align="center" prop="appVersion" />
      <el-table-column label="IP地址" align="center" prop="ipAddress" />
      <el-table-column label="网络类型" align="center" prop="networkType" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <el-icon><Clock /></el-icon> {{ scope.row ? parseTime(scope.row.createdAt) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updatedAt" width="180">
        <template #default="scope">
          <el-icon><Clock /></el-icon> {{ scope.row ? parseTime(scope.row.updatedAt) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
        <template #default="scope">
          <el-button
              size="small"
              type="primary"
              link
              @click="handleUpdate(scope.row)"
          >
            <el-icon><Edit /></el-icon>
            修改
          </el-button>
          <el-button
              size="small"
              type="danger"
              link
              @click="handleDelete(scope.row)"
          >
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
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
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号">
            <template #prefix>
              <el-icon><Iphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机电量" prop="batteryLevel">
          <el-input v-model="form.batteryLevel" placeholder="请输入手机电量 0-100" />
        </el-form-item>
        <el-form-item label="是否充电" prop="isCharging">
          <el-select
              v-model="form.isCharging"
              placeholder="请选择充电状态"
              style="width: 100%"
          >
            <el-option :value="1">
              <div style="display: flex; align-items: center;">
                <el-icon color="#67C23A" style="margin-right: 8px;"><Lightning /></el-icon>
                <span>充电中</span>
              </div>
            </el-option>
            <el-option :value="0">
              <div style="display: flex; align-items: center;">
                <el-icon color="#909399" style="margin-right: 8px;"><CircleClose /></el-icon>
                <span>未充电</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="内容描述 / 日志信息">
          <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入内容描述 / 日志信息"/>
        </el-form-item>
        <el-form-item label="设备型号" prop="deviceModel">
          <el-input v-model="form.deviceModel" placeholder="请输入设备型号">
            <template #prefix>
              <el-icon><Cellphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="系统版本" prop="osVersion">
          <el-input v-model="form.osVersion" placeholder="请输入系统版本" />
        </el-form-item>
        <el-form-item label="应用版本" prop="appVersion">
          <el-input v-model="form.appVersion" placeholder="请输入应用版本" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="form.ipAddress" placeholder="请输入IP地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">
            <el-icon><Check /></el-icon>
            确 定
          </el-button>
          <el-button @click="cancel">
            <el-icon><Close /></el-icon>
            取 消
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

import {
  Search, Refresh, Plus, Edit, Delete, Download,
  Iphone, Cellphone, Clock, Lightning, CircleClose,  // ✅ 确保导入了这两个图标
  Check, Close
} from '@element-plus/icons-vue'

import { listLog, getLog, delLog, addLog, updateLog } from "@/api/moblie/log"
import { parseTime } from "@/utils/ruoyi.js"

import { ElMessage, ElMessageBox } from 'element-plus'

// 遮罩层
const loading = ref(true)
// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 手机设备信息与状态记录表格数据
const logList = ref([])
// 弹出层标题
const title = ref("")
// 是否显示弹出层
const open = ref(false)

// 查询参数 (使用 reactive)
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  phone: null,
  batteryLevel: null,
  isCharging: null,
  content: null,
  status: null,
  deviceModel: null,
  osType: null,
  osVersion: null,
  appVersion: null,
  ipAddress: null,
  networkType: null,
})

const dateRangeCreatedAt = ref([])
const dateRangeUpdatedAt = ref([])
// 表单参数
const form = ref({})

// 表单校验
const rules = {
  phone: [
    { required: true, message: "手机号不能为空", trigger: "blur" }
  ],
  batteryLevel: [
    { required: true, message: "手机电量 0-100不能为空", trigger: "blur" }
  ],
  createdAt: [
    { required: true, message: "创建时间不能为空", trigger: "blur" }
  ],
}

const queryFormRef = ref()
const formRef = ref()

/** 查询手机设备信息与状态记录列表 */
function getList() {
  loading.value = true
  listLog(queryParams).then(response => {
    console.log('后端返回数据:', response)
    logList.value = response.rows || response.data || []
    total.value = response.total || 0
    loading.value = false
  }).catch(error => {
    console.error('请求失败:', error)
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
    phone: null,
    batteryLevel: null,
    isCharging: null,
    content: null,
    status: null,
    deviceModel: null,
    osType: null,
    osVersion: null,
    appVersion: null,
    ipAddress: null,
    networkType: null,
    createdAt: null,
    updatedAt: null
  }
  formRef.value?.resetFields()
}

/** 搜索按钮操作 */
function handleQuery() {

  if (dateRangeCreatedAt.value && dateRangeCreatedAt.value.length === 2) {
    queryParams['params'] = queryParams['params'] || {}
    queryParams['params']['beginCreatedAt'] = dateRangeCreatedAt.value[0]
    queryParams['params']['endCreatedAt'] = dateRangeCreatedAt.value[1]
  } else {
    if (queryParams['params']) {
      delete queryParams['params']['beginCreatedAt']
      delete queryParams['params']['endCreatedAt']
    }
  }

  if (dateRangeUpdatedAt.value && dateRangeUpdatedAt.value.length === 2) {
    queryParams['params'] = queryParams['params'] || {}
    queryParams['params']['beginUpdatedAt'] = dateRangeUpdatedAt.value[0]
    queryParams['params']['endUpdatedAt'] = dateRangeUpdatedAt.value[1]
  } else {
    if (queryParams['params']) {
      delete queryParams['params']['beginUpdatedAt']
      delete queryParams['params']['endUpdatedAt']
    }
  }

  queryParams.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  dateRangeCreatedAt.value = []
  dateRangeUpdatedAt.value = []

  // 清空 params
  if (queryParams['params']) {
    delete queryParams['params']
  }

  queryFormRef.value?.resetFields()
  handleQuery()
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
  title.value = "添加手机设备信息与状态记录"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  getLog(id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改手机设备信息与状态记录"
  })
}

/** 提交按钮 */
function submitForm() {
  formRef.value.validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateLog(form.value).then(response => {
          ElMessage.success("修改成功")
          open.value = false
          getList()
        })
      } else {
        addLog(form.value).then(response => {
          ElMessage.success("新增成功")
          open.value = false
          getList()
        })
      }
    }
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const delIds = row.id || ids.value
  ElMessageBox.confirm('是否确认删除手机设备信息与状态记录编号为"' + delIds + '"的数据项？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(function() {
    return delLog(delIds)
  }).then(() => {
    getList()
    ElMessage.success("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  ElMessage.info('导出功能开发中')
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
:deep(.el-select-dropdown__item) {
  padding: 8px 20px;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: #f5f7fa;
}
</style>
