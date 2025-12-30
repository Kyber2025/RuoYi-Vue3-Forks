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