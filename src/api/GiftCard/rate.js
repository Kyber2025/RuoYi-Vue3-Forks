import request from '@/utils/request'

// 货币汇率列表（换算器用）
export function listRate() {
  return request({ url: '/GiftCard/rate/list', method: 'get' })
}

// 修改某币种汇率（管理员）
export function updateRate(data) {
  return request({ url: '/GiftCard/rate', method: 'put', data })
}

// 实时市场汇率（参考，以卢比为基准）
export function liveRate() {
  return request({ url: '/GiftCard/rate/live', method: 'get' })
}
