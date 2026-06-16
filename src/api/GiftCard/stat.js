import request from '@/utils/request'

// ===== 按操作人 =====
// 汇总（主表）：操作人 → 总数量 + 总金额
export function summaryByOperator(query) {
  return request({ url: '/GiftCard/stat/summary', method: 'get', params: query })
}
// 详情（钻取）：某操作人 → 类型 × 使用类型 × 面值
export function detailByOperator(query) {
  return request({ url: '/GiftCard/stat/detail', method: 'get', params: query })
}

// ===== 按拥有者 =====
// 汇总（主表）：拥有者 → 总数量 + 总金额
export function summaryByOwner(query) {
  return request({ url: '/GiftCard/stat/ownerSummary', method: 'get', params: query })
}
// 详情（钻取）：某拥有者 → 类型 × 使用类型 × 面值
export function detailByOwner(query) {
  return request({ url: '/GiftCard/stat/ownerDetail', method: 'get', params: query })
}
