import request from '@/utils/request'

// 查询礼品卡列表
export function listGiftCard(query) {
  return request({
    url: '/GiftCard/GiftCard/list',
    method: 'get',
    params: query
  })
}

// 查询礼品卡详细
export function getGiftCard(id) {
  return request({
    url: '/GiftCard/GiftCard/' + id,
    method: 'get'
  })
}

// 新增礼品卡
export function addGiftCard(data) {
  return request({
    url: '/GiftCard/GiftCard',
    method: 'post',
    data: data
  })
}

// 修改礼品卡
export function updateGiftCard(data) {
  return request({
    url: '/GiftCard/GiftCard',
    method: 'put',
    data: data
  })
}

// 删除礼品卡
export function delGiftCard(id) {
  return request({
    url: '/GiftCard/GiftCard/' + id,
    method: 'delete'
  })
}

// 新增：批量修改礼品卡 usage_type 和 status
export function batchUpdateGiftCard(data) {
  return request({
    url: '/GiftCard/GiftCard/batchUpdate',
    method: 'put',
    data: data
  })
}

// 导入更新使用类型和状态（上传Excel）
export function importGiftCardStatus(data) {
  return request({
    url: '/GiftCard/GiftCard/importStatus',
    method: 'post',
    data: data,
    headers: {
      // 关键：上传文件时必须设置这个 Content-Type，否则后端收不到文件
      'Content-Type': 'multipart/form-data'
    },
    // 超时时间稍长一点，防止大文件上传卡住
    timeout: 60000
  })
}

// 按数量提取可用卡
export function searchByNum(query) {
  return request({
    url: '/GiftCard/GiftCard/searchByNum',
    method: 'get',
    params: query
  })
}

// 按总金额提取可用卡
export function searchByAmount(query) {
  return request({
    url: '/GiftCard/GiftCard/searchByAmount',
    method: 'get',
    params: query
  })
}

// 导出并修改状态
export function exportAndChangeStatus(query, newUsageType, newStatus,ids) {
  return request({
    url: '/GiftCard/GiftCard/exportAndChangeStatus',
    method: 'post',
    // 将查询参数和新的状态参数合并发送
    params: {
      ...query,
      newUsageType: newUsageType,
      newStatus: newStatus,
      ids: ids
    },
    responseType: 'blob' // 必须设置，用于下载文件
  })
}

// 查询礼品卡拥有者下拉列表
export function listOwnerOptions(query) {
  return request({
    url: '/GiftCard/GiftCard/ownerOptions',
    method: 'get',
    params: query
  })
}

export function batchAssignOwner(data) {
  return request({
    url: '/GiftCard/GiftCard/batchAssignOwner',
    method: 'put',
    data
  })
}

// 自动按数量+面值分配未分配卡
export function batchAutoAssignOwner(data) {
  return request({
    url: '/GiftCard/GiftCard/batchAutoAssignOwner',
    method: 'put',
    data
  })
}
