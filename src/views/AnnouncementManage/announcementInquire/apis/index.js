import Axios from '@/assets/js/AxiosPlugin'

// 接口地址
const BASE_PATH = '/egc-noticemgmtcomponent'
// 查询公告
// export const searchNoticeList = (params) => {
//   return Axios.post('http://192.168.0.186:30940/egc-noticemgmtcomponent/notice/searchlist', params).then(res => res.data)
// }
export const searchNoticeList = (params) => {
  return Axios.post(BASE_PATH + '/notice/searchlist', params).then(res => res.data)
}
export const updatestatus = (params) => {
  return Axios.post(BASE_PATH + '/notice/updatestatus', params).then(res => res.data)
}
