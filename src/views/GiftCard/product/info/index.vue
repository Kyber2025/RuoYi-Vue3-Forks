<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" label-width="90px" class="search-form-clean">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="商品名称" prop="productName">
            <el-input
                v-model="queryParams.productName"
                placeholder="请输入商品名称"
                clearable
                @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="拥有者" prop="userName">
            <el-input
                v-model="queryParams.userName"
                placeholder="请输入用户名"
                clearable
                @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
          <el-form-item label="商品金额" prop="amount">
            <el-input
                v-model="queryParams.amount"
                placeholder="请输入商品金额"
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
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%">
            </el-date-picker>
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
        <el-button type="primary" plain :icon="Plus" @click="handleAdd" v-hasPermi="['products:info:add']">新增</el-button>
        <el-button type="success" plain :icon="Edit" :disabled="single" @click="handleUpdate" v-hasPermi="['products:info:edit']">修改</el-button>
        <el-button type="danger" plain :icon="Delete" :disabled="multiple" @click="handleDelete" v-hasPermi="['products:info:remove']">删除</el-button>
        <el-button type="warning" plain :icon="Download" @click="handleExport" v-hasPermi="['products:info:export']">导出</el-button>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" style="float: right;" />
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="拥有者" align="center" prop="userName" min-width="100" />
      <el-table-column label="商品名称" align="center" prop="productName" min-width="150" />
      <el-table-column label="商品购买地址" align="center" prop="productUrl" min-width="200" />
      <el-table-column label="商品金额" align="center" prop="amount" min-width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="180">
        <template #default="{ row }">
          <span>{{ parseTime(row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" min-width="180">
        <template #default="{ row }">
          <span>{{ parseTime(row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :icon="Edit" @click="handleUpdate(row)" v-hasPermi="['products:info:edit']">修改</el-button>
          <el-button link type="danger" :icon="Delete" @click="handleDelete(row)" v-hasPermi="['products:info:remove']">删除</el-button>
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

    <!-- 添加或修改礼品卡可购买商品信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品购买地址" prop="productUrl">
          <el-input v-model="form.productUrl" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="拥有者" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择拥有者" clearable style="width: 100%">
            <el-option
                v-for="user in userList"
                :key="user.userId"
                :label="user.userName"
                :value="user.userId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品金额" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入商品金额" />
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
import { listInfo, getInfo, delInfo, addInfo, updateInfo } from "@/api/GiftCard/productInfo"
import { listUser } from "@/api/system/user"
import { parseTime } from "../../../../utils/ruoyi.js"
import { Search, Refresh, Plus, Edit, Delete, Download } from '@element-plus/icons-vue'

export default {
  name: "Info",
  computed: {
    Download() {
      return Download
    },
    Delete() {
      return Delete
    },
    Edit() {
      return Edit
    },
    Plus() {
      return Plus
    },
    Refresh() {
      return Refresh
    },
    Search() {
      return Search
    }
  },
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      infoList: [],
      userList: [],
      dateRange: [],
      title: "",
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        productName: null,
        productUrl: null,
        userName: null,
        amount: null
      },
      form: {},
      rules: {
        productName: [
          { required: true, message: "商品名称不能为空", trigger: "blur" }
        ],
        productUrl: [
          { required: true, message: "商品购买地址不能为空", trigger: "blur" }
        ],
        userId: [
          { required: true, message: "请选择所有者", trigger: "change" }
        ],
        amount: [
          { required: true, message: "商品金额不能为空", trigger: "blur" }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getUserList()
  },
  methods: {
    parseTime,
    /** 查询礼品卡可购买商品信息列表 */
    getList() {
      this.loading = true
      this.queryParams.params = {}
      if (this.dateRange != null && this.dateRange.length === 2) {
        this.queryParams.params["beginTime"] = this.dateRange[0]
        this.queryParams.params["endTime"] = this.dateRange[1]
      }
      listInfo(this.queryParams).then(response => {
        this.infoList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    /** 查询用户列表 */
    getUserList() {
      listUser({ pageNum: 1, pageSize: 1000 }).then(response => {
        this.userList = response.rows
        console.log('用户列表加载成功:', this.userList)
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        id: null,
        productName: null,
        productUrl: null,
        userId: null,
        amount: null
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
      this.dateRange = []
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
      this.title = "添加礼品卡可购买商品信息"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      if (!id || (Array.isArray(id) && id.length === 0)) return
      getInfo(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改礼品卡可购买商品信息"
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
      const ids = row?.id ?? this.ids
      if (!ids || (Array.isArray(ids) && ids.length === 0)) return

      this.$modal.confirm(`是否确认删除礼品卡可购买商品信息编号为"${ids}"的数据项？`)
          .then(() => delInfo(ids))
          .then(() => {
            this.getList()
            this.$modal.msgSuccess("删除成功")
          })
          .catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('/gift-cards/products/info/export', {
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
