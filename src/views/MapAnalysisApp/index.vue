<template>
  <div class="map-container">
    <div class="map-con ui-common">
      <div class="search-box">
        <el-select class="pro-select" v-model="provinceSel">
          <el-option v-for="vo in provinArr" :key="vo.value" :label="vo.label" :value="vo.value"></el-option>
        </el-select>
        <el-input v-model="searchCourtName" :maxlength="16" :minlength="1" placeholder="请输入小区名称" @keyup.enter.native="onSearchCourt" clearable></el-input>
        <el-button class="search-btn" type="primary" @click="onSearchCourt">查询</el-button>
      </div>
      <div id="map-ecarts" style="width:1000px; height:800px"></div>
    </div>
    <div class="list-table">
      <el-tabs v-model="activeName">
        <el-tab-pane label="推荐小区" name="first">
          <court-table :tableData="courtListTB"></court-table>
        </el-tab-pane>
        <el-tab-pane :label="provinceName" name="second">
          <court-table :tableData="provinceListTB"></court-table>
        </el-tab-pane>
        <el-tab-pane label="搜索结果小区" name="third">
          <court-table :tableData="searchListTB"></court-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import CourtTable from '@/views/MapAnalysisApp/components/CourtTable'
import { getCourtList } from '@/views/MapAnalysisApp/apis/index.js'
import mapData from '@/views/MapAnalysisApp/assets/js/mapechartsdata.js'
import LOG_TAG from '@/views/MapAnalysisApp/assets/js/mapanalysislog.js'
require('echarts/map/js/china')
export default {
  components: {
    CourtTable
  },
  data () {
    return {
      mycharts: null,
      searchCourtName: '',
      courtListTB: [],
      provinceListTB: [],
      searchListTB: [],
      rowkeys: [0],
      activeName: 'first',
      provinceName: '全省小区',
      provinceSel: '',
      provinArr: [{ value: '', label: '-全国范围-' }]
    }
  },
  mounted: function () {
    console.log(LOG_TAG + ' 初始化全国小区列表信息  ')
    this.getCourtListData()
    this.getMyCharts.setOption(mapData.option)
    this.getMyCharts.on('click', this.handleClickMap)
  },
  methods: {
    /**
     * @description 点击地图
     * @param e 点击事件对象
     */
    handleClickMap: function (e) {
      mapData.updateChooseData([]) // 清空‘强调显示’的小区信息
      this.getMyCharts.setOption(mapData.option)
      if (e.seriesType === 'scatter' || e.seriesType === 'effectScatter') {
        // 跳转到指定的小区的详情页
        this.$router.push('/mapanalysisapp/courtinfo/' + e.data.courtUuid) // courtUuid
      } else if (e.seriesType === 'map') {
        this.searchCourtName = ''
        this.activeName = 'second'
        this.provinceName = e.data.name + '小区'
        this.provinceListTB = e.data.courts
      }
    },
    /**
     * @description 获取小区列表数据
     * @param {String} isSearch 是否要查询部分小区
     */
    getCourtListData: function (isSearch) {
      // 查询小区列表数据，初始化全国小区列表点位 { courtName: this.searchCourtName }
      getCourtList({ courtName: this.searchCourtName, org: this.provinceSel }).then(res => {
        if (res.data.code === '00000') {
          let list = res.data.data ? res.data.data : []
          this.courtList = list
          let pointdata = []
          let prodata = []
          let proObj = {}
          console.log(LOG_TAG + ' 成功获取到小区列表数据; 小区数量： ' + list.length)
          for (let i = 0, len = list.length; i < len; i++) {
            let item = list[i]
            if (item.latitude && item.longitude) {
              let obj = {
                name: item.name, // name 小区名字
                value: [item.longitude, item.latitude],
                courtUuid: item.uuid
              }
              pointdata.push(obj)
            }
            if (!isSearch && item.province) {
              let pname = item.province.replace('省', '') // province
              if (!proObj[pname]) {
                proObj[pname] = {}
                proObj[pname].value = 0
                proObj[pname].courts = []
                prodata.push({ value: item.province, label: item.province })
              }
              proObj[pname].value += 1
              proObj[pname].courts.push(item)
            }
          }
          if (isSearch && isSearch === 'search') {
            mapData.updateChooseData(pointdata)
            this.activeName = 'third'
            this.searchListTB = list
          } else {
            mapData.updateData(pointdata)
            mapData.updateProvinceData(proObj)
            this.courtListTB = list.slice(0, 10)
            prodata = this.pinyinSort(prodata) // 把省份名称按字母顺序排序
            if (prodata.length > 0) this.provinArr = this.provinArr.concat(prodata)
          }
          this.getMyCharts.setOption(mapData.option)
        }
      }).catch(err => {
        console.warn(LOG_TAG + ' 获取到小区列表数据失败： ' + err)
      })
    },
    /**
     * @description 按条件查询小区列表
     */
    onSearchCourt: function () {
      let str = this.searchCourtName // 把多个空格合并成一个空格
      str = str.trim() // 去掉字符串前后的空格
      str = str.replace(/s+/g, ' ')
      if (str === '') {
        this.searchCourtName = str
        this.$message({
          type: 'warning',
          message: '请输入要查询的小区名称'
        })
        return
      }
      this.getCourtListData('search')
    },
    /**
     * @description 把数组里的数据按字母顺序排序
     * @param {Array} arr 要排序的数组
     * @returns {Array} data1 排好序后的数组
     */
    pinyinSort: function (arr) {
      if (!String.prototype.localeCompare) return []
      var zh = '阿八嚓哒妸发旮哈讥咔垃痳拏噢妑七呥扨它穵夕丫帀'.split('')
      var data1 = []
      for (var i = 0; i <= zh.length; i++) {
        arr.map(function (v, index) {
          let kk = v.label.localeCompare(zh[i], 'zh')
          if ((!zh[i - 1] || zh[i - 1].localeCompare(v.label, 'zh') <= 0) && kk === -1) {
            data1.push(v)
          }
        })
      }
      return data1
    }
  },
  computed: {
    getMyCharts: function () {
      return this.mycharts ? this.mycharts : this.$echarts.init(document.getElementById('map-ecarts'))
    }
  }
}
</script>
<style lang="less" scoped>
.map-container {
  width: 100%;
  min-width: 1500px;
  min-height: 860px;
  display: flex;
  display: -webkit-flex;
  flex-flow: row nowrap;
  box-sizing: border-box;
  /deep/ .list-table {
    width: 500px;
    overflow: auto;
    margin: 7px 0px 0px 0px;
    box-sizing: border-box;
    .el-table {
      max-height: 735px;
      overflow: auto;
    }
    .el-table::before {
      display: none;
    }
    .el-table__row {
      height: 60px;
    }
    .demo-table-expand {
      font-size: 0;
    }
    .demo-table-expand label {
      width: 90px;
      color: #999;
    }
    .demo-table-expand span {
      color: rgb(224, 127, 15);
    }
    .demo-table-expand .el-form-item {
      margin-right: 0;
      margin-bottom: 0;
      width: 50%;
    }
    .demo-table-expand .el-form-item.itemlarge {
      width: 100%;
    }
  }
}
.map-con {
  display: flex;
  display: -webkit-flex;
  flex-flow: column nowrap;
  align-items: center;
  box-sizing: border-box;
}
.search-box {
  width: 60%;
  height: 60px;
  display: flex;
  display: -webkit-flex;
  flex-flow: row nowrap;
  align-items: center;
  .pro-select {
    width: 40%;
  }
}
</style>
