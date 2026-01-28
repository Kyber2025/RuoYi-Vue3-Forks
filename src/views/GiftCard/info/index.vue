<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form
        :model="queryParams"
        ref="queryForm"
        v-show="showSearch"
        label-width="110px"
        class="search-form-clean"
    >
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="设备号码" prop="deviceNumber">
            <el-input
                v-model="queryParams.deviceNumber"
                placeholder="请输入设备号码"
                clearable
                @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="钱包余额" prop="currentAmount">
            <el-input
                v-model="queryParams.currentAmount"
                placeholder="请输入当前钱包余额"
                clearable
                @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="钱包上限" prop="rechargeLimit">
            <el-input
                v-model="queryParams.rechargeLimit"
                placeholder="请输入充值金额上限"
                clearable
                @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="买书单价" prop="dailyBookUnitPrice">
            <el-input
                v-model="queryParams.dailyBookUnitPrice"
                placeholder="请输入当天买书单价"
                clearable
                @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="当日充值上限" prop="dailyRechargeLimit">
            <el-input
                v-model="queryParams.dailyRechargeLimit"
                placeholder="请输入当日充值上限金额"
                clearable
                @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="当日实际充值" prop="dailyRechargeAmount">
            <el-input
                v-model="queryParams.dailyRechargeAmount"
                placeholder="请输入当天实际充值金额"
                clearable
                @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="当日买书上限" prop="dailyShoppingLimit">
            <el-input
                v-model="queryParams.dailyShoppingLimit"
                placeholder="请输入当日买书上限金额"
                clearable
                @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="当日买书金额" prop="dailyShoppingAmount">
            <el-input
                v-model="queryParams.dailyShoppingAmount"
                placeholder="请输入当日买书实际金额"
                clearable
                @keyup.enter.native="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="充值开关" prop="rechargeEnabled">
            <el-select v-model="queryParams.rechargeEnabled" placeholder="全部" clearable style="width: 100%">
              <el-option label="开启" :value="1"/>
              <el-option label="关闭" :value="0"/>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="购物开关" prop="shoppingEnabled">
            <el-select v-model="queryParams.shoppingEnabled" placeholder="全部" clearable style="width: 100%">
              <el-option label="开启" :value="1"/>
              <el-option label="关闭" :value="0"/>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="设备开关" prop="deviceEnabled">
            <el-select v-model="queryParams.deviceEnabled" placeholder="全部" clearable style="width: 100%">
              <el-option label="启用" :value="1"/>
              <el-option label="停用" :value="0"/>
            </el-select>
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
        <el-button
            type="primary"
            plain
            :icon="Plus"
            @click="handleAdd"
            v-hasPermi="['device:info:add']"
        >新增
        </el-button>
        <el-button
            type="success"
            plain
            :icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['device:info:edit']"
        >修改
        </el-button>
        <el-button
            type="danger"
            plain
            :icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['device:info:remove']"
        >删除
        </el-button>
        <el-button
            type="warning"
            plain
            :icon="Download"
            @click="handleExport"
            v-hasPermi="['device:info:export']"
        >导出
        </el-button>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" style="float: right;"></right-toolbar>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="设备号码" align="center" prop="deviceNumber" min-width="120"/>
      <el-table-column label="钱包余额" align="center" prop="currentAmount" min-width="100"/>
      <el-table-column label="钱包上限" align="center" prop="rechargeLimit" min-width="100"/>
      <el-table-column label="买书单价" align="center" prop="dailyBookUnitPrice" min-width="100"/>
      <el-table-column label="当日充值上限金额" align="center" prop="dailyRechargeLimit" min-width="140"/>
      <el-table-column label="当日实际充值金额" align="center" prop="dailyRechargeAmount" min-width="140"/>
      <el-table-column label="当日买书上限金额" align="center" prop="dailyShoppingLimit" min-width="140"/>
      <el-table-column label="当日买书实际余额" align="center" prop="dailyShoppingAmount" min-width="140"/>
      <el-table-column label="充值开关" align="center" min-width="100">
        <template #default="{ row }">
          <el-switch
              v-model="row.rechargeEnabled"
              :active-value="1"
              :inactive-value="0"
              active-text="开"
              inactive-text="关"
              @change="val => handleSwitchChange(row, 'rechargeEnabled', val)"
          />
        </template>
      </el-table-column>
      <el-table-column label="购物开关" align="center" min-width="100">
        <template #default="{ row }">
          <el-switch
              v-model="row.shoppingEnabled"
              :active-value="1"
              :inactive-value="0"
              active-text="开"
              inactive-text="关"
              @change="val => handleSwitchChange(row, 'shoppingEnabled', val)"
          />
        </template>
      </el-table-column>
      <el-table-column label="设备开关" align="center" min-width="100">
        <template #default="{ row }">
          <el-switch
              v-model="row.deviceEnabled"
              :active-value="1"
              :inactive-value="0"
              active-text="开"
              inactive-text="关"
              @change="val => handleSwitchChange(row, 'deviceEnabled', val)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150" fixed="right">
        <template #default="{ row }">
          <el-button
              link
              type="primary"
              :icon="Edit"
              @click="handleUpdate(row)"
              v-hasPermi="['device:info:edit']"
          >修改
          </el-button>
          <el-button
              link
              type="danger"
              icon="el-icon-delete"
              @click="handleDelete(row)"
              v-hasPermi="['device:info:remove']"
          >删除
          </el-button>
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

    <!-- 添加或修改设备信息对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="设备号码" prop="deviceNumber">
          <el-input v-model="form.deviceNumber" placeholder="请输入设备号码"/>
        </el-form-item>
        <el-form-item label="钱包上限" prop="rechargeLimit">
          <el-input v-model="form.rechargeLimit" placeholder="请输入充值金额上限"/>
        </el-form-item>
        <el-form-item label="买书单价" prop="dailyBookUnitPrice">
          <el-input v-model="form.dailyBookUnitPrice" placeholder="请输入当天买书单价"/>
        </el-form-item>
        <el-form-item label="当日充值上限金额" prop="dailyRechargeLimit">
          <el-input v-model="form.dailyRechargeLimit" placeholder="请输入当日充值上限金额"/>
        </el-form-item>
        <el-form-item label="当日买书上限金额" prop="dailyShoppingLimit">
          <el-input v-model="form.dailyShoppingLimit" placeholder="请输入当日买书上限金额"/>
        </el-form-item>
        <el-form-item label="充值开关" prop="rechargeEnabled">
          <el-switch v-model="form.rechargeEnabled" :active-value="1" :inactive-value="0"/>
        </el-form-item>
        <el-form-item label="购物开关" prop="shoppingEnabled">
          <el-switch v-model="form.shoppingEnabled" :active-value="1" :inactive-value="0"/>
        </el-form-item>
        <el-form-item label="设备开关" prop="deviceEnabled">
          <el-switch v-model="form.deviceEnabled" :active-value="1" :inactive-value="0"/>
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

<script>
import {listInfo, getInfo, delInfo, addInfo, updateInfo} from "@/api/GiftCard/info"
import {Search, Refresh, Plus, Edit, Delete, Download} from '@element-plus/icons-vue'

export default {
  name: "Info",
  data() {
    const validateBookPrice = (rule, value, callback) => {
      const price = Number(value)
      const limit = Number(this.form.dailyRechargeLimit)

      if (value == null || value === '' || this.form.dailyRechargeLimit == null || this.form.dailyRechargeLimit === '') {
        return callback()
      }

      if (Number.isNaN(price) || Number.isNaN(limit)) {
        return callback(new Error("请输入合法的数字"))
      }

      if (price > limit - 1000) {
        return callback(new Error("买书单价必须 ≤ 当天充值上限 - 1000"))
      }

      callback()
    }
    return {
      Search, Refresh, Plus, Edit, Delete, Download,
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
        deviceNumber: null,
        currentAmount: null,
        rechargeLimit: null,
        dailyBookUnitPrice: null,
        dailyRechargeLimit: null,
        dailyRechargeAmount: null,
        dailyShoppingLimit: null,
        dailyShoppingAmount: null,
        rechargeEnabled: null,
        shoppingEnabled: null,
        deviceEnabled: null,
      },
      form: {},
      rules: {
        deviceNumber: [
          {required: true, message: "设备号码不能为空", trigger: "blur"}
        ],
        currentAmount: [
          {required: true, message: "当前钱包余额不能为空", trigger: "blur"}
        ],
        rechargeLimit: [
          {required: true, message: "充值金额上限不能为空", trigger: "blur"}
        ],
        dailyBookUnitPrice: [
          {required: true, message: "买书单价不能为空", trigger: "blur"},
          {validator: validateBookPrice, trigger: ["blur", "change"]}
        ],
        dailyRechargeLimit: [
          {required: true, message: "当天充值上限不能为空", trigger: "blur"},
        ],
        dailyRechargeAmount: [
          {required: true, message: "当日实际充值金额不能为空", trigger: "blur"},
        ],
        dailyShoppingLimit: [
          {required: true, message: "当日买书上限金额不能为空", trigger: "blur"}
        ],
        dailyShoppingAmount: [
          {required: true, message: "当日买书实际余额不能为空", trigger: "blur"}
        ],
        rechargeEnabled: [
          {required: true, message: "充值开关不能为空", trigger: "blur"}
        ],
        shoppingEnabled: [
          {required: true, message: "购物开关不能为空", trigger: "blur"}
        ],
        deviceEnabled: [
          {required: true, message: "设备开关不能为空", trigger: "blur"}
        ],
        createTime: [
          {required: true, message: "创建时间不能为空", trigger: "blur"}
        ],
        updateTime: [
          {required: true, message: "更新时间不能为空", trigger: "blur"}
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /**
     * 开关切换
     */
    handleSwitchChange(row, field, val) {
      const oldVal = val === 1 ? 0 : 1

      const payload = {...row, [field]: val}

      updateInfo(payload).then(() => {
        this.$modal.msgSuccess("已更新")
      }).catch(() => {
        row[field] = oldVal
        this.$modal.msgError("更新失败，已回滚")
      })
    },
    /** 查询设备信息列表 */
    getList() {
      this.loading = true
      listInfo(this.queryParams).then(response => {
        this.infoList = (response.rows || []).map(r => ({
          ...r,
          rechargeEnabled: r.rechargeEnabled == null ? 0 : Number(r.rechargeEnabled),
          shoppingEnabled: r.shoppingEnabled == null ? 0 : Number(r.shoppingEnabled),
          deviceEnabled: r.deviceEnabled == null ? 0 : Number(r.deviceEnabled),
        }))
        this.total = response.total || 0
      }).catch(err => {
        this.$modal.msgError("查询失败：" + (err.msg || err.message || "未知错误"))
        this.infoList = []
        this.total = 0
      }).finally(() => {
        this.loading = false
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        id: null,
        deviceNumber: null,
        currentAmount: null,
        rechargeLimit: null,
        dailyBookUnitPrice: null,
        dailyRechargeLimit: null,
        dailyRechargeAmount: null,
        dailyShoppingLimit: null,
        dailyShoppingAmount: null,
        rechargeEnabled: 0,
        shoppingEnabled: 0,
        deviceEnabled: 0,
        createTime: null,
        updateTime: null
      }
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加设备信息"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()

      const rawId = row?.id ?? (Array.isArray(this.ids) ? this.ids[0] : this.ids)
      const id = Number(rawId)

      if (!rawId) {
        this.$modal.msgWarning("请选择一条数据再修改")
        return
      }
      if (Number.isNaN(id)) {
        this.$modal.msgError("ID 非法：" + rawId)
        return
      }

      getInfo(id).then(res => {
        const d = res.data || {}
        this.form = {
          ...d,
          rechargeEnabled: d.rechargeEnabled == null ? 0 : Number(d.rechargeEnabled),
          shoppingEnabled: d.shoppingEnabled == null ? 0 : Number(d.shoppingEnabled),
          deviceEnabled: d.deviceEnabled == null ? 0 : Number(d.deviceEnabled),
        }
        this.open = true
        this.title = "修改设备信息"
      }).catch(err => {
        this.$modal.msgError("获取详情失败：" + (err.msg || err.message || "未知错误"))
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateInfo(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addInfo(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除设备信息编号为"' + ids + '"的数据项？').then(function () {
        return delInfo(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/gift-cards/info/export', {
        ...this.queryParams
      }, `info_${new Date().getTime()}.xlsx`)
    }
  }
}
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
