<template>
  <div class="ui-common">
    <div>
      <search-condition @handleFilterEvent="_handleFilter" :searchConDetails="searchConditionList" ></search-condition>
    </div>
    <div class="flex-1 flex-c" v-loading="synDataLoading" element-loading-background="rgba(0, 0, 0, 0.8)" element-loading-text="玩命异步更新中,稍后手动刷新数据...">
      <div style="margin-top: 10px">
        <el-table :data="osListData" stripe border v-loading="loading" height="680">
          <el-table-column type="index" :index="indexMethod" label="序号" width="50">
          </el-table-column>
          <el-table-column v-for="(item, index) in tableTitleList " :key="index" :prop="item.prop"  v-if="item.showColumn" :label="item.colName" sortable>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center">
            <template slot-scope="scope">
              <el-button @click="_handleCheckDetails(scope.$index)" type="text" class="el-icon-view" style="font-size:15px;color: #0078f4" :title="detailsTitle">
              </el-button>
              <el-button @click="_handleEdit(scope.$index)" type="text" class="el-icon-edit" style="font-size:15px;color: #0078f4" :title="editTitle">
              </el-button>
              <el-button @click="_handleSynData(scope.$index)" type="text" class="el-icon-refresh" style="font-size:15px;color: #0078f4" :title="refreshTitle">
              </el-button>
              <el-button @click="_handleCheckHistory(scope.$index)" type="text" class="el-icon-time" style="font-size:15px;color: #0078f4" :title="historyTitle">
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div>
        <div>
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="searchConditionList.currentPage" :page-sizes="[10, 20, 50]" :page-size="searchConditionList.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </div>
      </div>
    </div>
    <el-dialog :title="dialogStatus" :visible.sync="dialogDetailsVisible" top="8vh">
      <os-details :osDetails="osDetails" @closeDialogEvent="closeDialog"></os-details>
    </el-dialog>
    <el-dialog :title="dialogStatus" :visible.sync="dialogEditVisible" top="8vh">
      <os-edit :osDetails="osDetails" @saveOsInfoEvent="_updateOsInfo"></os-edit>
    </el-dialog>
    <el-dialog :title="dialogStatus" :visible.sync="dialogHistoryVisible" top="8vh" width="80%">
      <comm-history :commHistoryList="osHistoryData"></comm-history>
    </el-dialog>
    <el-dialog :title="dialogStatus" :visible.sync="dialogShowColsVisible">
      <select-table-columns :allTableTitleList="allTableTitleList" @showColsEvent="handleSave" ref="selectDynCols"></select-table-columns>
    </el-dialog>
  </div>
</template>

<script>
import searchCondition from './components/SearchCondition'
import osDetails from './components/OsDetails'
import osEdit from './components/OsEdit'
import CommHistory from './components/CommHistory'
import SelectTableColumns from './components/SelectTableColumns'

import {
  getOSInfoByPage,
  getOSDetails,
  updateOSInfo,
  getOSHistoryList,
  syncOSData,
  downloadResultFile
} from './apis/index'
export default {
  components: {
    searchCondition,
    osDetails,
    osEdit,
    CommHistory,
    SelectTableColumns
  },
  data () {
    return {
      queryInput: '',
      selectOpts: [],
      total: 0,
      dialogStatus: '',
      addr: '',
      dialogDetailsVisible: false,
      dialogEditVisible: false,
      dialogSynDataVisible: false,
      dialogHistoryVisible: false,
      osListData: undefined,
      osDetails: undefined,
      downloadData: undefined,
      osHistoryData: undefined,
      synDataLoading: false,
      syncDataStatus: '',
      loading: true,
      searchConditionList: {
        city: '',
        condition: '',
        currentPage: 1,
        district: '',
        pageSize: 10,
        province: ''
      },
      tableTitleList: [
        {
          colName: '省（直辖市）',
          prop: 'courtDto.province',
          showColumn: true
        },
        {
          colName: '市',
          prop: 'courtDto.city',
          showColumn: true
        },
        {
          colName: '区',
          prop: 'courtDto.district',
          showColumn: true
        },
        {
          colName: '小区名称',
          prop: 'courtDto.name',
          width: 120
        },
        {
          colName: '操作系统名称',
          prop: 'name',
          showColumn: true
        },
        {
          colName: '操作系统版本',
          prop: 'version',
          width: 260
        },
        {
          colName: '操作系统位数',
          prop: 'dataLength',
          showColumn: true
        },
        {
          colName: '服务器主机名称',
          prop: 'hostname',
          showColumn: true
        },
        {
          colName: '描述',
          prop: 'remark',
          showColumn: true
        }
      ],
      detailsTitle: '查看详情',
      editTitle: '编辑',
      refreshTitle: '比对更新',
      historyTitle: '历史信息',
      excelData: {
        result: [],
        theah: []
      },
      lineData: [],
      excelPath: '',
      downloadFile: '',
      allTableTitleList: [],
      temptableTitleList: [],
      dialogShowColsVisible: false

    }
  },
  methods: {
    // 条件查询
    _handleFilter (params, type) {
      console.log('type -->' + type)
      if (type === 'search') {
        this.loading = true
        getOSInfoByPage(params)
          .then(
            function (result) {
              this.osListData = result.ossList
              this.total = result.pageCount
              this.loading = false
            }.bind(this)
          )
          .catch(function (error) {
            this.$message({
              message: error,
              center: true,
              showClose: true,
              type: 'error',
              duration: 2000
            }).bind(this)
            console.log(error)
          })
      } else if (type === 'download') {
        let downloadCls = 3
        downloadResultFile(params, downloadCls)
          .then(
            function (result) {
              this.loading = false
            }.bind(this)
          )
          .catch(
            function (error) {
              this.loading = false
              console.log(error)
            }.bind(this)
          )
      } else if (type === 'showcols') {
        if (this.$refs.selectDynCols) {
          this.$refs.selectDynCols.setDefaultColsChecked()
        }
        this.dialogStatus = '选择需要显示的列'
        this.dialogShowColsVisible = true
      }
    },

    generateDataTemplate (params) {
      console.log('generateDataTemplate params -- > ' + JSON.stringify(params))
    },

    // 详情
    _handleCheckDetails (rowIdx) {
      this.dialogStatus = '操作系统信息详情'
      var rowData = this.osListData[rowIdx]
      var eachRowUUID = rowData.uuid
      console.log('check rowData -- >' + eachRowUUID)
      getOSDetails(eachRowUUID)
        .then(
          function (result) {
            console.log(
              ' detail result ->>>>>>>>>>>>>   ' + JSON.stringify(result)
            )
            console.log(result)
            this.osDetails = result.auOss
            this.dialogDetailsVisible = true
          }.bind(this)
        )
        .catch()
    },

    // 编辑
    _handleEdit (rowIdx) {
      this.dialogStatus = '操作系统信息修改'
      var rowData = this.osListData[rowIdx]
      var eachRowUUID = rowData.uuid
      console.log('edit rowData -- >' + eachRowUUID)
      getOSDetails(eachRowUUID)
        .then(
          function (result) {
            console.log('edit result --> ' + JSON.stringify(result))
            this.osDetails = result.auOss
            this.dialogEditVisible = true
          }.bind(this)
        )
        .catch(function (error) {
          console.log(error)
        })
    },

    // 更新
    _updateOsInfo (params, type) {
      if (type === 'save') {
        updateOSInfo(params)
          .then(
            function (result) {
              if (result === 'Success!') {
                this.dialogEditVisible = false
                this.$message({
                  title: '成功',
                  message: '保存成功',
                  type: 'success',
                  duration: 2000
                })
              }
              // 再次加载列表的数据
              this.loadData()
            }.bind(this)
          )
          .catch(function (error) {
            console.log(error)
          })
      } else if (type === 'cancel') {
        this.dialogEditVisible = false
      }
    },

    // 比对刷新
    _handleSynData (rowIdx) {
      this.synDataLoading = true
      var rowData = this.osListData[rowIdx]
      var eachRowUUID = rowData.uuid
      // 刷新操作系统
      syncOSData(eachRowUUID)
        .then(
          function (result) {
            console.log('refresh oss result -- > ' + JSON.stringify(result))
            this.syncDataStatus = result
            if (this.syncDataStatus === 'Success!') {
              setTimeout(() => {
                this.synDataLoading = false
                this.loadData()
                this.$message({
                  message: '刷新成功',
                  type: 'success'
                })
              }, 3000)
            }
          }.bind(this)
        )
        .catch(
          function (error) {
            console.log(error)
            this.synDataLoading = false
          }.bind(this)
        )
    },

    // 历史记录
    _handleCheckHistory (rowIdx) {
      this.dialogStatus = '操作系统历史信息详情'
      this.dialogHistoryVisible = true
      var rowData = this.osListData[rowIdx]
      var eachRowUUID = rowData.uuid
      console.log('history rowData -- >' + eachRowUUID)
      getOSHistoryList(eachRowUUID)
        .then(
          function (result) {
            console.log('History - > ' + JSON.stringify(result))
            this.osHistoryData = result.auOssHisList
          }.bind(this)
        )
        .catch(function (error) {
          console.log(error)
        })
    },
    closeDialog () {
      this.dialogDetailsVisible = false
    },
    // 初始加载
    loadData () {
      getOSInfoByPage(this.searchConditionList)
        .then(
          function (result) {
            console.log('operating system result === > ' + JSON.stringify(result))
            this.allTableTitleList = result.columnDtoList
            this.temptableTitleList = result.columnDtoList
            this.osListData = result.ossList
            this.total = result.pageCount
            this.loading = false
          }.bind(this)
        )
        .catch(function (error) {
          console.log(error)
        })
    },

    // 改变分页大小
    handleSizeChange (val) {
      this.searchConditionList.pageSize = val
      this.loadData()
    },

    // 跳转页数
    handleCurrentChange (val) {
      this.searchConditionList.currentPage = val
      this.loadData()
    },
    indexMethod (index) {
      var pageSize = this.searchConditionList.pageSize
      if (!pageSize) pageSize = 10
      var page = this.searchConditionList.currentPage
      if (!page) page = 1
      var computedIndex = pageSize * (page - 1) + index + 1
      return computedIndex
    },
    handleSave (checkedColumns) {
      console.log('begin to save columns--> ' + checkedColumns)
      for (var i = 0; i < this.allTableTitleList.length; i++) {
        this.temptableTitleList[i].showColumn = false
        for (var j = 0; j < checkedColumns.length; j++) {
          if (this.temptableTitleList[i].colName === checkedColumns[j]) {
            this.tableTitleList[i].showColumn = true
          }
          this.tableTitleList = this.temptableTitleList
        }
      }
      this.dialogShowColsVisible = false
    }
  },
  mounted () {
    this.loadData()
  }
}
</script>

<style scoped>
@import 'assets/css/upgrademgmt.less';
</style>
