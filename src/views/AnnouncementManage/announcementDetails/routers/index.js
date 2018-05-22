// 引用pages
import announcementDetails from '@/views/AnnouncementManage/announcementDetails/index'

// 定义路由路径数组列表
export default[
  {
    path: '/announcementmanage/announcementDetails/:uuid',
    name: 'announcementDetails',
    component: announcementDetails
  }
]
