import request from '@/utils/request'

// 查询手机设备信息与状态记录列表
export function listLog(query) {
    return request({
        url: '/device/log/list',
        method: 'get',
        params: query
    })
}

// 查询手机设备信息与状态记录详细
export function getLog(id) {
    return request({
        url: '/device/log/' + id,
        method: 'get'
    })
}

// 新增手机设备信息与状态记录
export function addLog(data) {
    return request({
        url: '/device/log',
        method: 'post',
        data: data
    })
}

// 修改手机设备信息与状态记录
export function updateLog(data) {
    return request({
        url: '/device/log',
        method: 'put',
        data: data
    })
}

// 删除手机设备信息与状态记录
export function delLog(id) {
    return request({
        url: '/device/log/' + id,
        method: 'delete'
    })
}
