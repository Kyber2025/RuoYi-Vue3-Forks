import request from '@/utils/request'

// 用户礼品卡使用统计列表（按操作人 × 使用类型 × 面值）
export function listGiftCardStat(query) {
  return request({
    url: '/GiftCard/stat/list',
    method: 'get',
    params: query
  })
}

// 用户礼品卡使用统计列表（按拥有者 × 使用类型 × 面值）
export function listGiftCardStatByOwner(query) {
  return request({
    url: '/GiftCard/stat/ownerList',
    method: 'get',
    params: query
  })
}
