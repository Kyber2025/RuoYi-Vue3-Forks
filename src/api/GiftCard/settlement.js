import request from '@/utils/request'

// 核销列表（管理员）
export function listSettlement(query) {
  return request({ url: '/GiftCard/settlement/list', method: 'get', params: query })
}

// 我的核销记录
export function mySettlement(query) {
  return request({ url: '/GiftCard/settlement/my', method: 'get', params: query })
}

// 申请核销（提交支付截图）
export function submitSettlement(data) {
  return request({ url: '/GiftCard/settlement/submit', method: 'post', data })
}

// 审核通过
export function confirmSettlement(id) {
  return request({ url: '/GiftCard/settlement/confirm/' + id, method: 'put' })
}

// 驳回
export function rejectSettlement(id, data) {
  return request({ url: '/GiftCard/settlement/reject/' + id, method: 'put', data })
}

// 删除
export function delSettlement(ids) {
  return request({ url: '/GiftCard/settlement/' + ids, method: 'delete' })
}
