import request from '@/utils/request'

// 查询礼品卡操作日志列表
export function listGiftCardOperationLog(query) {
    return request({
        url: '/gift-cards/operation/log/list',
        method: 'get',
        params: query
    })
}

// 查询礼品卡操作日志详细
export function getGiftCardOperationLog(id) {
    return request({
        url: '/gift-cards/operation/log/' + id,
        method: 'get'
    })
}

// 修改礼品卡操作日志
export function updateGiftCardOperationLog(data) {
    return request({
        url: '/gift-cards/operation/log',
        method: 'put',
        data: data
    })
}

// 导出礼品卡操作日志
export function exportGiftCardOperationLog(query) {
    return request({
        url: '/gift-cards/operation/log/export',
        method: 'post',
        params: query
    })
}