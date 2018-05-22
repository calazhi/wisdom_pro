import Axios from '@/assets/js/AxiosPlugin'

// 接口地址
const BASE_PATH = '/egc-noticemgmtcomponent'

// 发布公告
export const publishNotice = (params) => {
  return Axios.post(BASE_PATH + '/notice/publish', params).then(res => res.data)
}
// 获取指定小区
export const getArea = (params) => {
  return Axios.post(BASE_PATH + '/notice/getCourtsByConditions', params).then(res => res.data)
}
