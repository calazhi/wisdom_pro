<template>
  <div class="ui-common">
    <div>
      <search-dep-condition  @handleFilterEvent="_handleFilter" :searchConDetails="searchConditionList"></search-dep-condition>
    </div>
    <el-row style="height: 100%">
      <el-col :span="24">
        <div style="margin-top: 20px" >
          <el-table :data="middlewareDepListData" stripe border style="height: 750px;overflow-y: scroll;">
            <el-table-column  type="index" label="序号" width="50" :index="indexMethod">
            </el-table-column>
            <el-table-column v-for="(item, index) in tableTitleList " :key="index" :prop="item.prop" :label="item.colName" :width="item.width" sortable>
            </el-table-column>
            <el-table-column v-for="(item, index) in tableOsTitleExtData " :key="index" :prop="item.prop" :label="item.colName" :width="item.width" sortable>
            </el-table-column>
            <!-- <el-table-column fixed="right" label="操作" width="80">
              <template slot-scope="scope">
                <el-button @click="_handleCheckDetails(scope.$index)" type="text" class="el-icon-view" style="font-size:15px;color: #0078f4" :title="detailsTitle">
                  <img :src="detailsImg"/>
                </el-button>
              </template>
            </el-table-column> -->
          </el-table>
        </div>
        <div>
          <div>
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page.sync="searchConditionList.pageNo"
              :page-sizes="[10, 20, 50]"
              :page-size="searchConditionList.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
          </el-pagination>
          </div>
        </div>
      </el-col>
    </el-row>
    <div>
      <el-dialog :title="dialogStatus" :visible.sync="dialogDetailsVisible" top="8vh">
        <middleware-dep-details-com :middlewareDepDetails="middlewareDepDetails"></middleware-dep-details-com>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import searchDepCondition from './SearchDepCondition'
import middlewareDepDetailsCom from './MiddlewareDepDetails'
import { getMiddlewareDepDetails, getMiddlewareDepByPage } from '../apis/index'
export default {
  components: {
    searchDepCondition,
    middlewareDepDetailsCom
  },
  data () {
    return {
      queryInput: '',
      selectOpts: [],
      total: 0,
      dialogStatus: '',
      dialogDetailsVisible: false,
      middlewareDepListData: undefined,
      middlewareDepDetails: undefined,
      maxlength: 30,
      searchConditionList: {
        'key': '',
        'pageNo': 1,
        'pageSize': 10
      },
      tableTitleList: [
        {
          colName: '批次',
          prop: 'batchName',
          width: 200
        }, {
          colName: '软件包名称',
          prop: 'packageName',
          width: 200
        }, {
          colName: '软件包版本',
          prop: 'packageVersion',
          width: 150
        }, {
          colName: '所依赖的中间件类型',
          prop: 'softwareType',
          width: 200
        }, {
          colName: '所依赖的中间件名称',
          prop: 'name',
          width: 200
        }, {
          colName: '最低版本',
          prop: 'earliestVer',
          width: 120
        }, {
          colName: '最高版本(可不限)',
          prop: 'latestVer',
          width: 150
        }
      ],
      tableOsTitleExtData: [],
      extMaxLenth: 6,
      detailsTitle: '查看详情',
      detailsImg: require('../assets/images/details.png')
    }
  },
  methods: {
    // 查询
    _handleFilter (params) {
      getMiddlewareDepByPage(params)
        .then(
          function (result) {
            this.middlewareDepListData = result.data.data
            this.total = result.pageCount
          }.bind(this)
        ).catch(
          function (error) {
            this.$message({
              message: error,
              center: true,
              showClose: true,
              type: 'error',
              duration: 2000
            }).bind(this)
            console.log(error)
          }
        )
    },

    // 查看中间件依赖每条详细信息
    _handleCheckDetails (rowIdx) {
      this.dialogStatus = '操作系统环境依赖信息详情'
      var rowData = this.middlewareDepListData[rowIdx]
      var eachRowUUID = rowData.uuid
      console.log('check rowData -- >' + eachRowUUID)
      getMiddlewareDepDetails(eachRowUUID)
          .then(
            function (result) {
              console.info('result -->' + JSON.stringify(result))
              this.middlewareDepDetails = result.data
              this.dialogDetailsVisible = true
              console.log('middleware dep details -----------> ' + JSON.stringify(this.middlewareDepDetails))
            }.bind(this)
          )
          .catch()
    },

    // 初始加载中间件依赖的信息
    loadData () {
      this.tableOsTitleExtData = []
      for (let i = 1; i < this.extMaxLenth + 1; i++) {
        var colName = '配置项' + i
        var extData = 'extData' + i
        var keyArr = ['colName', 'prop', 'width']
        var valArr = [colName, extData, '100']
        this.tableOsTitleExtData.push(this.getExtData(keyArr, valArr))
      }
      getMiddlewareDepByPage(this.searchConditionList)
        .then(
          function (result) {
            for (let i = 1; result.data.data !== null && i < result.data.data.length + 1; i++) {
              for (let k = 1; result.data.data[i - 1].extData !== null && k < this.extMaxLenth + 1; k++) {
                console.log('Data get2222 .....: ' + result.data.data[i - 1].extData[k - 1].value)
                // var key = '配置项' + k
                var key2 = 'extData' + k
                result.data.data[i - 1][key2] = result.data.data[i - 1].extData[k - 1].value
              }
            }
            console.log('init middleware data -- >' + JSON.stringify(result))
            this.middlewareDepListData = result.data.data
            this.total = result.data.totalCount
          }.bind(this)
        )
        .catch(
          function (error) {
            console.log(error)
          }
        )
    },

    // 改变分页大小
    handleSizeChange (val) {
      this.searchConditionList.pageSize = val
      this.loadData()
    },

    // 跳转页数
    handleCurrentChange (val) {
      this.searchConditionList.pageNo = val
      this.loadData()
    },
    indexMethod (index) {
      console.log('indexMethod : ' + index)
      var pageSize = this.searchConditionList.pageSize
      if (!pageSize) pageSize = 10
      var page = this.searchConditionList.pageNo
      if (!page) page = 1
      var computedIndex = pageSize * (page - 1) + index + 1
      console.log('computedIndex : ' + computedIndex)
      return computedIndex
    },
    // data
    getExtData (keyArr, valArr) {
      var data = {}
      for (let i = 0; i < keyArr.length; i++) {
        var key = keyArr[i]
        var val = valArr[i]
        data[key] = val
      }
      return data
    }
  },

  mounted () {
    // this.loadData()
  }
}
</script>
<style scoped>
  .ui-common >>> .el-table__header-wrapper {
    height: 50px !important;
  }
  .el-table__header {
    height: 50px !important;
  }
  .el-table >>> th {
    padding: 0 !important;
  }
  .el-table >>> td {
    padding: 0 !important;
  }
</style>
