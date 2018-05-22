<template>
  <el-container>
    <div class="map-con">
      <div class="info-con">
        <h2 class="info-title">{{courtInfo.name}}</h2>
        <div class="item-row">
          <span class="item-label">小区地址：</span>
          <span class="item-value">{{courtInfo.address}}</span>
        </div>
        <div class="item-row">
          <span class="item-label">房屋总数：</span>
          <span class="item-value">{{courtInfo.houseCount}}栋</span>
        </div>
        <div class="item-row">
          <span class="item-label">户数总数：</span>
          <span class="item-value">{{courtInfo.homeCount}}户</span>
        </div>
        <div class="item-row">
          <span class="item-label">建筑面积：</span>
          <span class="item-value">{{courtInfo.buildArea}}平方米</span>
        </div>
        <div class="item-row">
          <span class="item-label">占地面积：</span>
          <span class="item-value">{{courtInfo.floorArea}}平方米</span>
        </div>
      </div>
      <!-- end info-con -->
      <el-card class="echarts-box">
        <el-button class="checkmore-btn" type="text" @click="onCheckDetailHandler(1)">查看详情</el-button>
        <div id="map-ecarts2" style="width:480px; height:330px"></div>
        <div v-show="isPerErrInfo" class="err-info"><img :src="perErrImg"></div>
      </el-card>
      <el-card class="echarts-box">
        <el-button class="checkmore-btn" type="text" @click="onCheckDetailHandler(2)">查看详情</el-button>
        <div id="map-ecarts3" style="width:480px; height:330px"></div>
        <div v-show="isCarErrInfo" class="err-info"><img :src="perErrImg"></div>
      </el-card>
      <el-card class="echarts-box1">
        <el-button class="checkmore-btn" type="text" @click="onCheckDetailHandler(0)">查看详情</el-button>
        <div id="map-ecarts0" class="small-box" style="width:420px; height:330px"></div>
        <div id="map-ecarts1" class="small-box" style="width:570px; height:330px"></div>
        <div v-show="isOwnerErrInfo" class="err-info"><img :src="perErrImg"></div>
      </el-card>
      <el-card class="echarts-box">
        <el-button class="checkmore-btn" type="text" @click="onCheckDetailHandler(3)">查看详情</el-button>
        <div id="map-ecarts4" style="width:480px; height:330px"></div>
        <div v-show="isEquiErrInfo" class="err-info"><img :src="perErrImg"></div>
      </el-card>
      <car-stream ref="carStream"></car-stream>
      <stream-people ref="streamPeople"></stream-people>
      <owner-portrait ref="OwnerPortrait"></owner-portrait>
      <equipment-report ref="equipmentReport"></equipment-report>
    </div>
  </el-container>
</template>
<script>
import { getCourtInfo, getCourtPerAccessInfo, getCourtCarAccessInfo, getListDeviceType, getCourtProfile } from '@/views/MapAnalysisApp/apis/index.js'
import { updateCarData, updatePeopleData } from '@/views/MapAnalysisApp/assets/js/iostream.js'
import equipKind from '@/views/MapAnalysisApp/assets/js/equipkind.js'
import { updateSexData, updateAgeData } from '@/views/MapAnalysisApp/assets/js/ownerinfo.js'
import StreamPeople from '@/views/MapAnalysisApp/components/StreamPeople'
import CarStream from '@/views/MapAnalysisApp/components/CarStream'
import EquipmentReport from '@/views/MapAnalysisApp/components/EquipmentReport'
import OwnerPortrait from '@/views/MapAnalysisApp/components/OwnerPortrait'
import LOG_TAG from '@/views/MapAnalysisApp/assets/js/mapanalysislog.js'
import errImg from '@/views/MapAnalysisApp/assets/images/err.png'
export default {
  components: {
    StreamPeople,
    CarStream,
    EquipmentReport,
    OwnerPortrait
  },
  data () {
    return {
      echartsList: [],
      courtInfo: {
        uuid: '',
        courtName: '',
        org: '',
        regionName: '',
        houseCount: '',
        homeCount: '',
        buildArea: '',
        floorArea: ''
      },
      startTime: '',
      isOwnerErrInfo: false, // 业主错误提提
      isPerErrInfo: false, // 人流错误提示
      isCarErrInfo: false, // 车流错误提示
      isEquiErrInfo: false, // 设备错误提示
      endTime: '',
      perErrImg: errImg,
      reportType: '0' // 报表类型：0日报 1月报 2年报
    }
  },
  mounted: function () {
    this.courtInfo.uuid = this.$route.params.courtUuid
    console.log(LOG_TAG + ' 初始化小区详情页面  ')
    this.getCourtInfoData()
    var sDate = new Date()
    var eDate = new Date()
    sDate.setTime(sDate.getTime() - 3600 * 1000 * 24 * 7) //
    this.startTime = sDate.getFullYear() + '-' + (sDate.getMonth() + 1) + '-' + sDate.getDate()
    this.endTime = eDate.getFullYear() + '-' + (eDate.getMonth() + 1) + '-' + eDate.getDate()
    // 获取数据前，先初始化图表的框架 mod by zmj 2018-04-09
    let timeDate = this.getDates()
    let peo = updatePeopleData(timeDate, [0], [0])
    this.getMyCharts(2).setOption(peo)
    let caro = updatePeopleData(timeDate, [0], [0])
    this.getMyCharts(3).setOption(caro)
    let sexData = [{ value: 0, name: '男' }, { value: 0, name: '女' }]
    let sexop = updateSexData(sexData)
    let ageop = updateAgeData([0], [0])
    this.getMyCharts(0).setOption(sexop)
    this.getMyCharts(1).setOption(ageop)
    this.getPeopleStreamData()
    this.getCarStreamData()
    this.getEquipKindsData()
    this.getCourtOwnerData()
  },
  methods: {
    /**
     * @description 获取小区详情信息
     */
    getCourtInfoData: function () {
      let param = { courtUuid: this.courtInfo.uuid }
      getCourtInfo(param).then(res => {
        console.log(LOG_TAG + ' 获取到小区详细信息  ')
        if (res.data.code === '00000') {
          let list = res.data.data
          this.courtInfo = Object.assign({}, list)
        }
      }).catch(err => {
        console.warn(LOG_TAG + ' 获取到小区详情数据失败： ' + err)
      })
    },
    /**
     * @description 获取最近一个月内的人员流量日报数据
     */
    getPeopleStreamData: function () {
      let param = {
        courtUuid: this.courtInfo.uuid,
        reportType: this.reportType,
        startTime: this.startTime,
        endTime: this.endTime
      }
      getCourtPerAccessInfo(param).then(res => {
        if (res.data.code === '00000') {
          let data = res.data.data
          let timeDate = []
          let perInCount = []
          let perOutCount = []
          if (data && data.length > 0) {
            data = data.reverse()
            data.map(function (item, index) {
              timeDate.push(item.date.substr(0, 13) + '点')
              perInCount.push(parseFloat(item.perInCount))
              perOutCount.push(parseFloat(item.perOutCount))
              return item
            })
          } else {
            timeDate = this.getDates()
            perInCount.push(0)
            perOutCount.push(0)
          }
          let peo = updatePeopleData(timeDate, perInCount, perOutCount)
          this.getMyCharts(2).setOption(peo)
        } else {
          this.isPerErrInfo = true
          this.getMyCharts(2).clear() // 清除默认的图表框
        }
      }).catch(() => {
        this.isPerErrInfo = true
        this.getMyCharts(2).clear() // 清除默认的图表框
      })
    },
    /**
     * @description 获取最近一个月内的车行流量日报数据
     */
    getCarStreamData: function () {
      let param = {
        courtUuid: this.courtInfo.uuid,
        reportType: this.reportType,
        startTime: this.startTime,
        endTime: this.endTime
      }
      getCourtCarAccessInfo(param).then(res => {
        if (res.data.code === '00000') {
          let data = res.data.data
          let timeDate = []
          let carInCount = []
          let carOutCount = []
          if (data && data.length > 0) {
            data = data.reverse()
            data.map(function (item, index) {
              timeDate.push(item.date.substr(0, 13) + '点')
              carInCount.push(parseFloat(item.carInCount))
              carOutCount.push(parseFloat(item.carOutCount))
              return item
            })
          } else {
            timeDate = this.getDates()
            carInCount.push(0)
            carOutCount.push(0)
          }
          let caro = updateCarData(timeDate, carInCount, carOutCount)
          this.getMyCharts(3).setOption(caro)
        } else {
          this.isCarErrInfo = true
          this.getMyCharts(3).clear() // 清除默认的图表框
        }
      }).catch(() => {
        this.isCarErrInfo = true
        this.getMyCharts(3).clear() // 清除默认的图表框
      })
    },
    /**
     * @description 获取小区设备种类数据
     */
    getEquipKindsData: function () {
      let param = {
        courtUuid: this.courtInfo.uuid
      }
      getListDeviceType(param).then(res => {
        if (res.data.code === '00000') {
          let data = res.data.data // .slice(0, 10)
          let equipData = []
          let oto = { name: '其他', value: 0 }
          data.map(function (item, index) {
            if (index > 5) {
              oto.value += item.deviceCount
            } else {
              let obj = {
                name: item.deviceTypeDesc,
                value: item.deviceCount
              }
              equipData.push(obj)
            }
            return item
          })
          equipData.push(oto)
          equipKind.updateData(equipData)
          // 判断设备数据是否为空
          if (equipData.length <= 0) {
            this.isEquiErrInfo = true
          } else {
            this.isEquiErrInfo = false
            this.getMyCharts(4).setOption(equipKind.option)
          }
        } else {
          this.isEquiErrInfo = true
        }
      }).catch(() => {
        this.isEquiErrInfo = true
      })
    },
    /**
     * @description 获取小区业主年龄、性别占比数据
     */
    getCourtOwnerData: function () {
      let param = { courtUuid: this.courtInfo.uuid, type: '1' }
      getCourtProfile(param).then(res => {
        if (res.data.code === '00000') {
          let ageData = []
          let ageLevelData = []
          let list = res.data.data
          let lastAgeNum = 0
          let sexData = []
          let maleOwner = 0
          let femaleOwner = 0
          let ageGroup = []
          let isEightyAbove = false
          if (list.sexInfo && list.sexInfo[0]) {
            list.sexInfo.map(function (item, index) {
              maleOwner += parseInt(item.maleOwner)
              femaleOwner += parseInt(item.femaleOwner)
              return item
            })
            sexData = [{ value: maleOwner, name: '男' }, { value: femaleOwner, name: '女' }]
          } else {
            sexData = [{ value: '0', name: '男' }, { value: '0', name: '女' }]
          }
          list = list.ageGroupInfo ? list.ageGroupInfo : []
          list.map(function (item, index) {
            if (item.group) {
              ageGroup = item.group.split('-')
              if (parseInt(ageGroup[0]) >= 80) {
                lastAgeNum += item.countNum
                isEightyAbove = true
              } else {
                ageLevelData.push(item.group)
                ageData.push(item.countNum)
              }
              if (index === list.length - 1 && isEightyAbove) {
                ageLevelData.push('80以上')
              }
            } else {
              ageLevelData.unshift('未录入年龄')
              ageData.unshift(item.countNum)
            }
            return item
          })
          ageData.push(lastAgeNum)
          let sexop = updateSexData(sexData)
          let ageop = updateAgeData(ageLevelData, ageData)
          this.getMyCharts(0).setOption(sexop)
          this.getMyCharts(1).setOption(ageop)
        } else {
          this.isOwnerErrInfo = true
          this.getMyCharts(0).clear() // 清除默认的图表框
          this.getMyCharts(1).clear() // 清除默认的图表框
        }
      }).catch(() => {
        this.isOwnerErrInfo = true
        this.getMyCharts(0).clear() // 清除默认的图表框
        this.getMyCharts(1).clear() // 清除默认的图表框
      })
    },
    /**
     * @description 查看各个报表的详情
     * @param {Int} index 索引
     */
    onCheckDetailHandler: function (index) {
      switch (index) {
        case 0:
          this.$refs['OwnerPortrait'].ownerPortrait(this.courtInfo.uuid)
          break
        case 1:
          this.$refs['streamPeople'].streamPeople(this.courtInfo.uuid)
          break
        case 2:
          this.$refs.carStream.goToCarStreamPage(this.courtInfo.uuid)
          break
        case 3:
          this.$refs['equipmentReport'].equipmentReport(this.courtInfo.uuid, this.courtInfo.name)
          break
      }
    },
    /**
     * @description 获取索引对应的Echarts对象
     * @param {Int} index 索引
     * @returns {Object} Echarts对象
     */
    getMyCharts: function (index) {
      return this.echartsList[index] ? this.echartsList[index] : this.$echarts.init(document.getElementById('map-ecarts' + index))
    },
    getDates: function (params) {
      let arr = []
      let t = new Date().getTime()
      for (let d = 0; d < 7; d++) {
        let dd = new Date(t)
        let mon = (dd.getMonth() + 1)
        mon = mon < 10 ? '0' + mon : mon
        let date = dd.getDate()
        date = date < 10 ? '0' + date : date
        let str = dd.getFullYear() + '-' + mon + '-' + date
        arr.push(str)
        t -= 86400000 // 1天的毫秒数
      }
      return arr.reverse()
    }
  }
}
</script>
<style lang="less" scoped>
.map-con {
  width: 100%;
  height: 800px;
  min-width: 1650px;
  padding: 15px 0px;
  color: #374258;
  background-color: #fee;
  /deep/.el-card__body {
    padding: 10px 20px;
  }
  /deep/.el-card__header {
    padding: 10px 20px;
  }
}
.info-con {
  display: inline-block;
  width: 520px;
  text-align: center;
  vertical-align: middle;
}
.info-title {
  margin-top: 23px;
}
.item-row {
  margin: 35px 0px;
}
.item-label {
  color: rgb(180, 154, 154);
}
.item-value {
  display: inline-block;
  width: 300px;
  text-align: left;
  padding-left: 10px;
  border-bottom: 1px solid #ccc;
}
.echarts-box1 {
  position: relative;
  display: inline-block;
  width: 1045px;
  height: 360px;
  margin: 15px 0px 10px 15px;
  vertical-align: middle;
}
.echarts-box {
  position: relative;
  display: inline-block;
  width: 520px;
  height: 360px;
  margin: 15px 0px 10px 15px;
  vertical-align: middle;
}
.small-box {
  display: inline-block;
}
.err-info {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  text-align: center;
  line-height: 300px;
  font-size: 20px;
  font-weight: bold;
}
.checkmore-btn {
  display: inline-block;
  width: 70px;
  height: 30px;
  line-height: 30px;
  position: absolute;
  top: 6px;
  right: 75px;
  padding: 0px;
  z-index: 10;
  border-bottom: 2px solid rgb(228, 140, 10);
}
</style>
