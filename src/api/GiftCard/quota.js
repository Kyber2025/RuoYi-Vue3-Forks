import request from '@/utils/request'

// 额度列表（管理员：所有账号）
export function listQuota(query) {
  return request({ url: '/GiftCard/quota/list', method: 'get', params: query })
}

// 我的额度（任意登录账号）
export function myQuota() {
  return request({ url: '/GiftCard/quota/my', method: 'get' })
}

// 按账号查额度
export function getQuotaByUser(userId) {
  return request({ url: '/GiftCard/quota/user/' + userId, method: 'get' })
}

// 新增/修改额度（同账号自动覆盖）
export function saveQuota(data) {
  return request({ url: '/GiftCard/quota', method: 'post', data })
}
