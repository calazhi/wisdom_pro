<template>
  <div>
    <el-dialog title="人流数据展示" :visible.sync="dialogVisible" width="70%" @close="onCloseCallback" class='popup-peo'>
      <el-row>
        <el-col :span="4" class="left-text">
          <div>
            <div>
              <span>小区名称</span>
              ：{{cellDetailsList.name}}</div>
            <div>
              <span>小区地址</span>
              ：{{cellDetailsList.address}}</div>
            <div>
              <span>户数</span>
              ：{{cellDetailsList.homeCount}}户</div>
            <div>
              <span>房屋总数</span>
              ：{{cellDetailsList.houseCount}}栋</div>
            <div>
              <span>占地面积</span>
              ：{{cellDetailsList.floorArea}}平方米</div>
            <div>
              <span>建筑面积</span>
              ：{{cellDetailsList.buildArea}}平方米</div>
          </div>
        </el-col>
        <!-- 表格展示 -->
        <el-col :span="19" style="height:600px">
          <el-form ref="form" :model="parameter" label-width="80px" label-position="top">
            <el-row>
              <el-col :span="8">
                <el-form-item label="报表类型">
                  <el-select v-model="parameter.reportType" placeholder="请选择" @change="onReportTypeEvent" style="width:95%">
                    <el-option v-for="item in reportTypeList" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="开始时间">
                  <el-date-picker v-model="startDate" :type="timeType" placeholder="开始时间" :disabled='disabled' :picker-options="starForbiddenDatetime" :clearable="false" :editable="false" style="width:100%" @change="onTimeJudgment">
                  </el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="结束时间">
                  <el-date-picker v-model="endDate" :type="timeType" placeholder="结束时间" :disabled='disabled' :picker-options="endForbiddenDatetime" :clearable="false" :editable="false" style="width:100%" @change="onTimeJudgment">
                  </el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24" style="text-align:right">
                <el-button type="primary" @click="onTimeQuery">查询</el-button>
                <el-button type="success" @click="onTableSwitch" :plain="isTableActivated">表单</el-button>
                <el-button type="danger" @click="onChartSwitch" :plain="isChartActivated">图表</el-button>
              </el-col>
            </el-row>
          </el-form>
          <div class="show">
            <div v-show="isTableShow">
              <el-table :data="tableData" width="100%" height="380" stripe border v-loading='loading' element-loading-background="rgba(255, 255, 255, 1)">
                <el-table-column prop="date" label="时间">
                </el-table-column>
                <el-table-column prop="courtName" label="小区名称">
                </el-table-column>
                <el-table-column prop="perInCount" label="入园人数">
                </el-table-column>
                <el-table-column prop="perOutCount" label="出园人数">
                </el-table-column>
              </el-table>
              <el-pagination class="table-pager" background :current-page="parameter.currentPage" :page-sizes="[10, 20, 50, 100]" :page-size="parameter.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalRows" @size-change="onSizeChange" @current-change="onCurrentChange">
              </el-pagination>
            </div>
            <!-- 图表展示 -->
            <div class="echarts-frame" v-show="isChartShow">
              <div id="flow-information" @mouseout="onIsTooltip"></div>
              <div v-show="isPerErrInfo" class="pererr-info"><img :src="perErrImg"></div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import { getCourtPerAccessInfo, getPerAccessPageList, getCourtInfo } from '@/views/MapAnalysisApp/apis/index'
import LOG_TAG from '@/views/MapAnalysisApp/assets/js/mapanalysislog.js'
import errImg from '@/views/MapAnalysisApp/assets/images/err.png'
export default {
  data () {
    return {
      form: {
        date: '', // 日期
        dateList: [], // 日期集合
        courtUuid: '', // 小区id
        courtName: '', // 小区名称
        perInCount: '', // 入园人数
        perInCountList: [], // 入园人数集合
        perOutCount: '', // 出园人数,
        perOutCountList: [] // 出园人数集合
      },
      reportTypeList: [{
        value: '0',
        label: '日报'
      }, {
        value: '1',
        label: '月报'
      }, {
        value: '2',
        label: '年报'
      }],
      parameter: {
        courtUuid: '', // 小区ID
        currentPage: 1, // 多少页
        pageSize: 10, // 多少条数据
        reportType: '0', // 报表类型（日、月、年）
        startTime: null, // 开始时间
        endTime: null // 结束时间
      },
      cellDetailsList: {}, // 小区详细信息
      timeType: 'date', // 日期type属性
      totalRows: 0, // 数据条数
      tableData: [], // 表格数据
      isTableActivated: false, // 是否激活表格按钮
      isChartActivated: true, // 是否激活图表按钮
      isChartShow: false, // 是否显示图表
      isTableShow: true, // 是否显示表格
      disabled: true,
      isPerErrInfo: false, // 图表不显示时的错误提示
      dialogVisible: false, // 弹窗开关
      pickerShow: null,
      perErrImg: errImg, // 图表错误提示
      startDate: new Date(new Date().setDate(new Date().getDate() - 6)), // 开始时间
      endDate: new Date(), // 结束时间
      lastStartTime: null, // 上一个开始时间
      lastEndTime: null, // 上一个结束时间
      peopleChart: null,
      myChartNode: null,
      canvasNode: null,
      loading: true, // 加载中
      chartClickNum: 0, // 图表点击计数
      tableClickNum: 0, // 表格点击计数
      isRequest: true, // 时间判断
      // 限制开始时间与结束时间
      starForbiddenDatetime: {
        disabledDate: (time) => {
          return time.getTime() > this.endDate
        }
      },
      endForbiddenDatetime: {
        disabledDate: (time) => {
          return time.getTime() > new Date() || time.getTime() < new Date(this.processingDate(this.startDate, '/'))
        }
      }
    }
  },
  methods: {
    /**
    * 选择报表类型加载不同的日期选择器和默认的时间 *
    * @param {string} val 报表类型：日报(0) 月报(1) 年报(2)
    */
    onReportTypeEvent: function (val) {
      if (val === '0') { // 1年31622400000  6天518400000
        this.timeType = 'date'
        this.startDate = new Date(this.endDate.getTime() - 518400000)
      } else if (val === '1') {
        this.timeType = 'date'
        this.startDate = new Date(this.endDate.getTime() - 2592000000)
      } else {
        this.timeType = 'month'
        this.startDate = new Date(this.endDate.getTime() - 31622400000)
      }
      console.log(this.startDate)
    },
    /**
    * @description 点击切换图表展示 *
    */
    onChartSwitch: function () {
      console.log(LOG_TAG + ' 点击切换图表展示 ')
      // 图表显隐
      this.isChartShow = true
      this.isTableShow = false
      // 图表按钮是否激活状态
      this.isChartActivated = false
      this.isTableActivated = true
      // echarts图表
      this.myChartNode = document.querySelector('#flow-information')
      this.canvasNode = document.querySelector('.echarts-frame')
      this.peopleChart = this.$echarts.init(this.myChartNode)
      this.peopleChart.setOption(this.echartsData())
      // 多次点击
      if (this.chartClickNum > 0) return
      this.chartClickNum++
      // 判断时间是否选择正确
      this.onTimeJudgment()
      if (!this.isRequest) {
        this.startDate = this.lastStartTime
        this.endDate = this.lastEndTime
      }
      this.getPerData()
    },
    /**
    * @description echart图表数据 *
    */
    echartsData: function () {
      let options = {
        title: {
          text: '人员流量'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#ddd'
            }
          },
          backgroundColor: 'rgba(255,255,255,1)',
          padding: [5, 10],
          textStyle: {
            color: '#7588E4'
          },
          extraCssText: 'box-shadow: 0 0 5px rgba(0,0,0,0.3)'
        },
        toolbox: {
          right: '20',
          feature: {
            magicType: {
              type: ['line', 'bar']
            },
            iconStyle: {
              borderColor: '#000000'
            },
            saveAsImage: {
              show: true,
              right: '20'
            }
          }
        },
        dataZoom: [{ // 这个dataZoom组件，默认控制x轴。
          type: 'slider', // 这个 dataZoom 组件是 slider 型 dataZoom 组件
          start: 0, // 左边在 10% 的位置。
          // end: 10 // 滑块结束位置设置。
          end: this.form.dateList.length > 31 ? 10 : 100 // 滑块结束位置设置。
        },
        { // 这个dataZoom组件，也控制x轴。
          type: 'inside', // 这个 dataZoom 组件是 inside 型 dataZoom 组件
          start: 10, // 左边在 10% 的位置。
          end: 60 // 右边在 60% 的位置。
        }],
        legend: {
          x: 'center', // 默认在上面，
          data: ['入园人数', '出园人数']
        },
        xAxis: [{
          type: 'category',
          data: this.form.dateList,
          boundaryGap: false,
          splitLine: {
            show: true,
            interval: 'auto',
            lineStyle: {
              color: ['#D4DFF5']
            }
          },
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#609ee9'
            }
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              fontSize: 14
            }
          }
        }],
        yAxis: [{
          type: 'value',
          splitLine: {
            lineStyle: {
              color: ['#D4DFF5']
            }
          },
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#609ee9'
            }
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              fontSize: 14
            }
          }
        }],
        series: [{
          name: '入园人数',
          type: 'line',
          smooth: true,
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 6,
          data: this.form.perInCountList,
          areaStyle: {
            normal: {
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(199, 237, 250,0.7)'
              }, {
                offset: 1,
                color: 'rgba(199, 237, 250,0.5)'
              }], false)
            }
          },
          itemStyle: {
            normal: {
              color: '#f7b851'
            }
          },
          lineStyle: {
            normal: {
              width: 3
            }
          }
        }, {
          name: '出园人数',
          type: 'line',
          data: this.form.perOutCountList,
          smooth: true,
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 6,
          areaStyle: {
            normal: {
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(216, 244, 247,1)'
              }, {
                offset: 1,
                color: 'rgba(216, 244, 247,1)'
              }], false)
            }
          },
          itemStyle: {
            normal: {
              color: '#58c8da'
            }
          },
          lineStyle: {
            normal: {
              width: 3
            }
          }
        }]
      }
      return options
    },
    /**
    * @description 点击切换表格展示 *
    */
    onTableSwitch: function () {
      console.log(LOG_TAG + ' 点击切换表格展示 ')
      // 处理图表切换表单刷新宽带显示不全
      let tableHeader = document.querySelector('.el-table__header')
      let tableBody = document.querySelector('.el-table__body')
      tableHeader.style.width = '100%'
      tableBody.style.width = '100%'
      // 图表显隐
      this.isChartShow = false
      this.isTableShow = true
      // 图表按钮是否激活状态
      this.isChartActivated = true
      this.isTableActivated = false
      // 多次点击
      if (this.tableClickNum > 0) return
      this.tableClickNum++
      // 判断时间是否选择正确
      this.onTimeJudgment()
      if (this.isRequest) this.getPgingData()
    },
    /**
    * @description 打开组件的回调 *
    * @param {string} _courtUuid 从主页传入的当前小区id
    */
    streamPeople: function (_courtUuid) {
      this.onTimeJudgment()
      if (this.isRequest) {
        if (this.isTableShow) {
          this.getPgingData()
        } else {
          this.getPerData()
        }
      }
      this.parameter.courtUuid = _courtUuid
      // 获取小区详细信息
      getCourtInfo({ courtUuid: _courtUuid }).then(res => {
        this.cellDetailsList = res.data.data
        console.log(LOG_TAG + ' 成功获取到小区的详细信息 ')
      })
      this.dialogVisible = true
      // 屏幕宽度发生改变时重置容器高宽
      window.onresize = () => {
        throttle(myChartContainer, 50)
      }
      let then = this
      function myChartContainer () {
        if (then.isChartShow) {
          then.peopleChart.resize()
          then.isTooltip()
        }
      }
      /**
      * 函数节流方法
      * @param Function fn 延时调用函数
      * @param Number delay 延迟多长时间
      * @return Function 延迟执行的方法
      */
      function throttle (fn, delay) {
        clearTimeout(fn.timeoutId)
        fn.timeoutId = setTimeout(function () {
          fn()
        }, delay)
      }
      // 处理在ie下变换报表形式日期不变的问题
      if (window.ActiveXObject || 'ActiveXObject' in window) {
        setTimeout(() => {
          this.disabled = false
        }, 230)
      } else {
        this.disabled = false
      }
    },
    /**
    * @description 按时间（报表类型）查询 *
    */
    onTimeQuery: function () {
      console.log(LOG_TAG + ' 按时间（报表类型）查询 ')
      this.parameter.currentPage = 1
      this.onTimeJudgment()
      if (this.isRequest) {
        if (this.isTableShow) this.getPgingData()
        else this.getPerData()
      }
      // 重置点击次数
      if (this.isTableShow) {
        this.chartClickNum = 0
      } else {
        this.tableClickNum = 0
      }
    },
    /**
    * @description 检查日期范围是否超出规定 *
    */
    onTimeJudgment () {
      switch (this.parameter.reportType) {
        case '0':
          if (this.endDate.getTime() - this.startDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
            this.$message({
              type: 'error',
              message: '日报查询范围为1个月'
            })
            this.isRequest = false
          } else {
            this.lastStartTime = this.startDate
            this.lastEndTime = this.endDate
            this.isRequest = true
          }
          break
        case '1':
          if (this.endDate.getTime() - this.startDate.getTime() > 365 * 24 * 60 * 60 * 1000) {
            this.$message({
              type: 'error',
              message: '月报查询范围为1年'
            })
            this.isRequest = false
          } else {
            this.isRequest = true
            this.lastStartTime = this.startDate
            this.lastEndTime = this.endDate
          }
          break
        case '2':
          this.isRequest = true
          break
      }
    },
    /**
    * @description 分页组件单页总数变化 *
    * @param {string} val 每页显示数据条数
    */
    onSizeChange: function (val) {
      this.parameter.pageSize = val
      this.parameter.currentPage = 1
      this.onTimeJudgment()
      if (!this.isRequest) {
        this.startDate = this.lastStartTime
        this.endDate = this.lastEndTime
      }
      this.getPgingData()
    },
    /**
    * @description 分页组件当前页变化 *
    * @param {string} val 显示的页数
    */
    onCurrentChange: function (val) {
      this.parameter.currentPage = val
      this.onTimeJudgment()
      if (!this.isRequest) {
        this.startDate = this.lastStartTime
        this.endDate = this.lastEndTime
      }
      this.getPgingData()
    },
    /**
    * @description 获取人流信息(图表) *
    */
    getPerData: function () {
      this.parameter.startTime = this.processingDate(this.startDate, '-')
      this.parameter.endTime = this.processingDate(this.endDate, '-')
      getCourtPerAccessInfo(this.parameter).then(res => {
        if (res.data.code === '00000') {
          this.isPerErrInfo = false
          console.log(LOG_TAG + ' 成功获取到小区人流信息(图表) ')
          let perData = res.data.data
          // 添加前先清空
          this.form.dateList = []
          this.form.perInCountList = []
          this.form.perOutCountList = []
          // 请求成功如果没数据返回 补0
          if (perData.length <= 0) {
            this.form.dateList = [this.parameter.endTime]
            this.form.perInCountList = ['0']
            this.form.perOutCountList = ['0']
          } else {
            for (let i = perData.length - 1; i >= 0; i--) {
              this.form.dateList.push(perData[i].date)
              this.form.perInCountList.push(perData[i].perInCount)
              this.form.perOutCountList.push(perData[i].perOutCount)
            }
          }
          // 数据改变时 初始化图表数据
          if (this.isChartShow) {
            this.peopleChart.setOption(this.echartsData())
            this.peopleChart.resize()
            this.isTooltip()
          }
        }
      })
        .catch(() => {
          this.peopleChart.clear()
          console.log(this.peopleChart)
          this.isPerErrInfo = true
        })
    },
    // 鼠标移出echarts图表时
    onIsTooltip: function () {
      this.isTooltip()
    },
    /**
    * @description 当只有1条数据时默认显示tooltip
    */
    isTooltip: function () {
      if (this.form.dateList.length === 1) {
        setTimeout(() => {
          this.peopleChart.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: 0
          })
        }, 100)
      } else {
        this.peopleChart.dispatchAction({
          type: 'hideTip'
        })
      }
    },
    /**
    * @description 处理日期对象 *
    * @param {Object} date 要处理的日期对象
    * @param {String} connector 返回日期的连接符 处理element日期插件在ie下只识别"/"的问题
    * @return {String} 返回后台所需要的日期格式（2018-2-16）
    */
    processingDate: function (date, connector) {
      let year = date.getFullYear()
      let month = date.getMonth() + 1
      let day = date.getDate()
      return year + connector + month + connector + day
    },
    /**
    * @description 获取人流分页信息（表格） *
    */
    getPgingData: function () {
      this.parameter.startTime = this.processingDate(this.startDate, '-')
      this.parameter.endTime = this.processingDate(this.endDate, '-')
      this.loading = true
      getPerAccessPageList(this.parameter).then(res => {
        if (res.data.code === '00000') {
          console.log(LOG_TAG + ' 成功获取到小区人流信息(表格) ')
          this.loading = false
          this.tableData = res.data.data.result
          this.totalRows = res.data.data.totalRows
        }
      }).catch(() => {
        this.loading = false
      })
    },
    // 关闭窗口(dialog)前重置数据
    onCloseCallback: function () {
      this.chartClickNum = 0
      this.parameter.currentPage = 1
      this.loading = true
      if (this.peopleChart) {
        this.peopleChart.dispatchAction({
          type: 'restore'
        })
      }
    }
  }
}
</script>
<style lang='less' scoped>
.popup-peo {
  /deep/.el-dialog {
    min-width: 710px;
  }
  /deep/.table-pager {
    padding: 0;
    padding-right: 10px;
    text-align: right;
    position: absolute;
    right: 60px;
    bottom: 35px;
  }
  /deep/.block {
    float: left;
    margin-right: 40px;
  }
  /deep/.el-form-item__label {
    padding: 0;
    font-size: 16px;
    font-weight: 540;
  }
  /deep/.el-form-item {
    margin-bottom: 10px;
  }
  /deep/.show {
    padding: 10px 0 5px 5px;
    height: 430px;
    margin-top: 10px;
  }
  /deep/.echarts-frame {
    border: 1px solid #ccc;
    padding: 10px 8px 5px 5px;
  }
  /deep/.el-dialog__body {
    padding: 0px 20px;
  }
}
#flow-information {
  height: 420px;
  position: relative;
}
.left-text {
  padding: 5px 10px;
  div {
    line-height: 30px;
    span {
      width: 65px;
      text-align: justify;
      text-align-last: justify;
      display: inline-block;
      overflow: hidden;
      vertical-align: top;
    }
  }
}
.pererr-info {
  position: absolute;
  top: 290px;
  left: 190px;
  right: 0;
  bottom: 0;
  text-align: center;
  font-size: 26px;
  font-weight: bolder;
}
</style>

