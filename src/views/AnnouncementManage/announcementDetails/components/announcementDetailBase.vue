<template>
  <div class="detailmain">
    <el-button type="primary" @click="backAction">返回</el-button>
    <h5 class="infotitle">基本信息</h5>
    <div class="infocontent">
      <div class="infocontenleft">
        <div class="number fontstyle">
          <span>编号：</span>
          <span>{{details.noticeNumber}}</span>
        </div>
        <div class="house fontstyle margintop">
          <span>生效小区：</span>
          <span v-for="item in details.courtUuids" :key="item.courtUuid" style="margin-right:10px;">{{item.name}}</span>
        </div>
      </div>
      <div class="infocontentright">
        <div class="time fontstyle">
          <span>生效时间：</span>
          <span>{{details.validStartTime | date}}</span>~
          <span>{{details.validEndTime | date }}</span>
        </div>
        <div class="status fontstyle margintop">
          <span>状态：</span>
          <span>{{statusText}}</span>
        </div>
      </div>
    </div>
    <h5 class="infotitle" style="margin-top:50px">公告内容</h5>
    <div class="announcecontent">
      <h5 class="atitle fontstyle">【{{details.noticeTitle}}】</h5>
      <div class="digest fontstyle">
        <span>摘要：</span>
        <span>{{details.noticeSummary}}</span>
      </div>
      <div class="page-wrapper" v-html="detailContent">
      </div>
      <!--<div class="announcementImgbox"><img class="announcementImg" src="../assets/img/img.jpg" /></div>-->
      <!--<div class="announcetext">-->
        <!--<p>我是西藏林芝鲁朗，素有“神仙居住•东方瑞士”之美誉 我想告诉天下人，百里桃花中国最美春天即将下凡（最佳赏花期2018.3.15-4.30） 来到我这美丽的宝座 您可以漫步鲁朗湖，欣赏蓝天白云雪山-->

        <!--</p>-->
      <!--</div>-->
      <!--<div class="tips fontstyle">-->
        <!--<p>【温馨提示】国内航班直达林芝的城市和班次数量有限，西藏之旅至少提前两周预订，如有其他疑问， 可致电酒店集团全球预订中心4008 408 006；拨打林芝恒大酒店总机电话0894-589 3333；还可拨打020-38658526酒店集团大客户销售中心 翁清龙-->
        <!--</p>-->
      <!--</div>-->
      <!--<div class="bottomname fontstyle">-->
        <!--<div>-->
          <!--<p>恒大酒店集团</p>-->
          <!--<p style="margin-top:5px">2018-4-24</p>-->
        <!--</div>-->
      <!--</div>-->
    </div>
    <div class="bottomtable">
      <h5 class="record">操作记录</h5>
      <div class="tablebox">
        <template>
          <el-table :data="currentArr" style="width: 100%">
            <el-table-column prop="noticeStatus" label="操作名称" width="180">
            </el-table-column>
            <el-table-column prop="createTime" label="操作时间" width="180">
            </el-table-column>
            <el-table-column prop="createUser" label="操作人" width="300">
            </el-table-column>
          </el-table>
        </template>
        <div class="paginationbox">
          <el-pagination :page-size="5" :pager-count="11" layout="prev, pager, next" :total="totals" @current-change="currentChange">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { noticeDetails } from '../apis/index.js'
export default {
  data () {
    return {
      details: {
        courtUuid: ''
      },
      operateArr: [],
      statusText: '', // 状态
      totals: 0, // 操作记录总数
      currentArr: [],
      currentPage: 1,
      detailContent: ''
    }
  },
  created () {
    let id = this.$route.params.uuid
    let data = {
      uuid: id
    }
    this.getDetails(data)
  },
  methods: {
    backAction () {
      this.$router.back()
    },
    currentChange (data) {
      let arr = this.operateArr
      this.currentArr = arr.slice(5 * (data - 1), 5 * data)
    },
    getContent (key) { // 获取公告内容样式替换
      let pcStyle = `<style>p{color:#666;font-size:16px;line-height:26px;width: 100%;height: auto; word-wrap:break-word;word-break:break-all;overflow: hidden;}
                  img{ max-width: 100%;margin:18px 0}
                  img[data-w-e]{ margin:0;}
                  li{list-style-position:inside;color:#666;}
                  h2{font-size:22px;}
      </style>`
      key = key.replace(/[\r\n]/g, '')
      key = key.replace(/<style>.*<\/style>/g, pcStyle)
      return key
    },
    getDetails (id) { // 获取公告详情
      noticeDetails(id).then(res => {
        this.details = res.data
        this.detailContent = this.getContent(this.details.noticeContent)
        console.log(this.detailContent)
        this.operateArr = res.data.operLog
        for (let i = 0; i < this.operateArr.length; i++) {
          this.operateArr[i].createTime = this.getFilter(this.operateArr[i].createTime)
          switch (this.operateArr[i].noticeStatus) {
            case 0:
              this.operateArr[i].noticeStatus = '发布'
              break
            case 1:
              this.operateArr[i].noticeStatus = '上线'
              break
            case 2:
              this.operateArr[i].noticeStatus = '失效'
              break
            case 3:
              this.operateArr[i].noticeStatus = '撤销'
              break
          }
        }
        this.currentArr = this.operateArr.slice(0, 5)
        this.totals = this.operateArr.length
        switch (res.data.noticeStatus) {
          case 0:
            this.statusText = '未生效'
            break
          case 1:
            this.statusText = '已发布'
            break
          case 2:
            this.statusText = '已失效'
            break
          case 3:
            this.statusText = '已撤销'
            break
        }
      })
    },
    getFilter (prama) {
      let date = new Date(prama)
      let Y = date.getFullYear() + '-'
      let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      let D = date.getDate() + ' '
      let h = date.getHours() + ':'
      let m = date.getMinutes() + ':'
      let s = date.getSeconds()
      return Y + M + D + h + m + s
    }
  },
  filters: {
    date (bindDate) {
      let date = new Date(bindDate)
      let Y = date.getFullYear() + '-'
      let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      let D = date.getDate() + ' '
      let h = date.getHours() + ':'
      let m = date.getMinutes() + ':'
      let s = date.getSeconds()
      return Y + M + D + h + m + s
    }
  }
}
</script>

<style scoped>
.infotitle {
  margin-top: 20px;
  font-size: 16px;
  color: #000;
  font-weight: normal;
}
.infocontent {
  border-top: 1px solid #dddddd;
  padding: 20px 200px 0 20px;
  display: flex;
}
.fontstyle {
  color: #000;
  font-size: 14px;
}
.margintop {
  margin-top: 20px;
}
.infocontenleft {
  width: 50%;
}
.infocontentright {
  width: 50%;
}
.announcecontent {
  border-top: 1px solid #d4d4d4;
  padding: 20px 50px 0 50px;
}
.atitle {
  text-align: center;
  font-size:22px;
}
.digest {
  width: 50%;
  min-height: 60px;
  border: 1px solid #d7d7d7;
  border-radius: 4px;
  padding: 10px;
  margin-top: 20px;
  word-wrap: break-word;
  font-size:17px;
}
.announcementImgbox {
  width: 500px;
  height: 337px;
  margin-top: 20px;
  margin-bottom: 20px;
}
.announcementImg {
  width: 100%;
  height: 100%;
}
.tips {
  margin-top: 20px;
}
.bottomname {
  margin-top: 50px;
  display: flex;
  justify-content: flex-end;
}
.tablebox {
  border-top: 1px solid #cdcdcd;
  padding: 30px 0 0 30px;
}
.record {
  font-size: 16px;
  color: #000;
  font-weight: normal;
}
.paginationbox {
  margin-top: 20px;
}
  .house{
    padding-right:10px;
    box-sizing:border-box;
  }
  .page-wrapper{
    min-height:300px;
    margin-top:10px;
    width:70%;
  }
</style>
