<template>
  <div class="main inquirebox">
    <el-form label-width="100px" class="demo-ruleForm" :label-position="labelPosition">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <el-form-item label="编号:">
              <el-input placeholder="请输入内容" v-model="inputform.noticeNumber" clearable>
              </el-input>
            </el-form-item>
          </div>
        </el-col>
        <el-col :span="6" :offset="5">
          <div class="grid-content bg-purple">
            <el-form-item label="标题名称:">
              <el-input placeholder="请输入内容" v-model="inputform.noticeTitle" clearable>
              </el-input>
            </el-form-item>
          </div>
        </el-col>
        <el-button type="primary" class="inquirebutton" @click="loadData">查询</el-button>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <el-form-item label="发布日期:">
              <div class="block">
                <el-date-picker v-model="inputinquiredata" type="datetimerange" range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" @change="confirm">
                </el-date-picker>
              </div>
            </el-form-item>
          </div>
        </el-col>
        <el-col :span="6" :offset="5">
          <div class="grid-content bg-purple">
            <el-form-item label="状态:">
              <el-select v-model="inputform.noticeStatus" placeholder="请选择" size="medium" @change="selectoption">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-col>
      </el-row>
    </el-form>
    <div class="emptybox1"></div>
    <el-button type="primary" @click="tonoticepublish" style="margin-top:20px">发布公告</el-button>
    <inquiredata-list @getCurrent='current' :noticedataList="noticedataList" @getPage="page" :total="total" :currenPage="currentPage"></inquiredata-list>
  </div>
</template>
<script>
import inquiredataList from './inquiredataList'
import { searchNoticeList } from '../apis/index.js'
export default {
  components: {
    inquiredataList
  },
  data () {
    return {
      currentPage: 1,
      labelPosition: 'left',
      inputinquiredata: '',
      total: 0,
      queryChange: false,
      noticedataList: [],  // 查询公告列表数据
      inputform: {
        currentPage: 1,
        pageSize: 10,
        noticeNumber: '',
        noticeTitle: '',
        noticeStatus: '',
        validStartTime: '',
        validEndTime: ''
      },
      options: [{
        value: '0',
        label: '未生效'
      }, {
        value: '1',
        label: '已发布'
      }, {
        value: '2',
        label: '已失效'
      }, {
        value: '3',
        label: '已撤销'
      }]
    }
  },
  created () {
    this.loadData()
  },
  methods: {
    filtersTime (bindDate) { // 时间戳转换标准格式的时间
      let date = new Date(bindDate)
      let Y = date.getFullYear() + '-'
      let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      let D = date.getDate() + ' '
      let h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':'
      let m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':'
      let s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds()
      return Y + M + D + h + m + s
    },
    // 转化为时间戳
    confirm () {
      if (this.inputinquiredata !== null) {
        console.log(this.inputinquiredata)
        this.inputform.validStartTime = Date.parse(this.inputinquiredata[0])
        this.inputform.validEndTime = Date.parse(this.inputinquiredata[1])
      } else {
        this.inputform.validStartTime = ''
        this.inputform.validEndTime = ''
      }
    },
    selectoption (statusnumber) {
      this.noticeStatus = statusnumber
      console.log('选择的值为：' + this.noticeStatus)
    },
    queryData () {
      if (!this.queryParam) {
        this.queryParam = true
        this.inputform.currentPage = 1
      }
      this.loadData()
    },
    loadData () {
      var params = this.inputform
      searchNoticeList(params)
        .then((result) => {
          this.noticedataList = result.data.result
          this.total = result.data.totalCount
          for (var i = 0; i < this.noticedataList.length; i++) { // 数据处理
            this.noticedataList[i].publishTime = this.filtersTime(this.noticedataList[i].publishTime)
            this.noticedataList[i].validStartTime = this.filtersTime(this.noticedataList[i].validStartTime)
            this.noticedataList[i].validEndTime = this.filtersTime(this.noticedataList[i].validEndTime)
            this.noticedataList[i].effectTime = this.noticedataList[i].validStartTime + '~' + this.noticedataList[i].validEndTime
            var courtUuidsArr = this.noticedataList[i].courtUuids
            if (courtUuidsArr.length > 0) { // 处理关联小区
              var courtUuidsString = ''
              for (var k = 0; k < courtUuidsArr.length; k++) {
                courtUuidsString = courtUuidsString + courtUuidsArr[k].name + ';'
              }
              this.noticedataList[i].courtUuids = courtUuidsString
            } else {
              this.noticedataList[i].courtUuids = ''
            }
            console.log(this.noticedataList[i])
            switch (this.noticedataList[i].noticeStatus) {
              case 0:
                this.noticedataList[i].noticeStatus = '未生效'
                break
              case 1:
                this.noticedataList[i].noticeStatus = '已发布'
                break
              case 2:
                this.noticedataList[i].noticeStatus = '已失效'
                break
              case 3:
                this.noticedataList[i].noticeStatus = '已撤销'
                break
            }
          }
        })
        .catch((error) => {
          console.log('请求失败' + error)
        })
    },
    tonoticepublish () { // 去发布页面
      this.$router.push('/AnnouncementManage/announcementCompile/')
    },
    current (data) {
      this.currentPage = data
      this.inputform.currentPage = data
      this.loadData()
    },
    page (val) {
      this.inputform.pageSize = val
      this.loadData()
    }
  }
}
</script>
<style>
.inquirebutton {
  margin-left: 100px;
}
.emptybox1 {
  width: 100%;
  height: 100px;
  border-bottom: 1px solid #c3c3c3;
}
.inquirebox {
  margin-top: 40px;
}
</style>
