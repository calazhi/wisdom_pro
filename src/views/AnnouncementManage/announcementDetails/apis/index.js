import Axios from '@/assets/js/AxiosPlugin'

// 公告详情
let BASE_URL = '/egc-noticemgmtcomponent'
export const noticeDetails = (params) => {
  return Axios.post(BASE_URL + '/notice/search', params).then(res => res.data)
}
