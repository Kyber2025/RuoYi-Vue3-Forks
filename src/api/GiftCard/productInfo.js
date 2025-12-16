import request from '@/utils/request'

// 查询礼品卡可购买商品信息列表
export function listInfo(query) {
  return request({
    url: '/gift-cards/products/info/list',
    method: 'get',
    params: query
  })
}

// 查询礼品卡可购买商品信息详细
export function getInfo(id) {
  return request({
    url: '/gift-cards/products/info/' + id,
    method: 'get'
  })
}

// 新增礼品卡可购买商品信息
export function addInfo(data) {
  return request({
    url: '/gift-cards/products/info',
    method: 'post',
    data: data
  })
}

// 修改礼品卡可购买商品信息
export function updateInfo(data) {
  return request({
    url: '/gift-cards/products/info',
    method: 'put',
    data: data
  })
}

// 删除礼品卡可购买商品信息
export function delInfo(id) {
  return request({
    url: '/gift-cards/products/info/' + id,
    method: 'delete'
  })
}
