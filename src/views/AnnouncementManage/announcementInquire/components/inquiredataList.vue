<template>
  <div style="margin-top: 10px" class="announce-list">
    <el-table :data="noticedataList" class="deviceMgmTable" highlight-current-row stripe border style="width: 100%">
      <el-table-column :resizable="false" prop="noticeNumber" label="通知编号" width="150">
      </el-table-column>
      <el-table-column :resizable="false" prop="noticeTitle" label="标题" width="250">
      </el-table-column>
      <el-table-column :resizable="false" prop="noticeStatus" label="状态" width="150">
      </el-table-column>
      <el-table-column :resizable="false" prop="courtUuids" label="适用组织" show-overflow-tooltip width="250">
      </el-table-column>
      <el-table-column :resizable="false" prop="noticePublisher" label="发布人" width="150">
      </el-table-column>
      <el-table-column :resizable="false" prop="publishTime" label="发布时间" width="250" show-overflow-tooltip>
      </el-table-column>
      <el-table-column :resizable="false" prop="effectTime" label="生效时间" width="300">
      </el-table-column>
      <el-table-column fixed="right" label="操作">
        <template slot-scope="scope">
          <el-tooltip content="撤销" placement="top-start" effect="light">
            <el-button @click.stop.native="_handleRemove(scope.$index,noticedataList,scope.row)" type="text" icon="el-icon-remove" style="font-size:15px;color: #0078f4" v-if="scope.row.noticeStatus !== '已撤销'&&scope.row.noticeStatus !=='已失效'"></el-button>
          </el-tooltip>
          <el-tooltip content="详情" placement="top-start" effect="light">
            <el-button @click.stop.native="_handleToDetail(scope.row)" type="text" icon="el-icon-view" style="font-size:15px;color: #0078f4"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="block" style="margin-top: 20px">
      <div class="r_page">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[5, 10, 15, 20]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>

    <!-- 对话框 -->
    <el-dialog width="75%" top="8vh">
      <main-device-dialog>
      </main-device-dialog>
    </el-dialog>
  </div>
</template>
<script>
import { updatestatus } from '../apis/index.js'
export default {
  props: {
    noticedataList: Array,
    total: Number,
    currentPage: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      dataList: []
    }
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
    handleSizeChange (val) {
      this.$emit('getPage', val)
    },
    handleCurrentChange (data) {
      this.$emit('getCurrent', data)
    },
    _handleRemove (index, rows, row) { // 撤销操作
      var params = {}
      var uidarr = []
      uidarr.push(row.uuid)
      params.noticeUuids = uidarr
      console.log(JSON.stringify(row))
      updatestatus(params)
        .then((result) => {
          this.noticedataList[index].noticeStatus = '已撤销'
          console.log('请求成功' + result)
        })
        .catch((error) => {
          console.log('请求失败' + error)
        })
      console.log('序列是' + row.uuid)
    },
    _handleToDetail (row) {
      var uuid = row.uuid
      this.$router.push('/AnnouncementManage/announcementDetails/' + uuid)
    }
  }
}
</script>
<style>
  .announce-list .deviceMgmTable .el-table__header-wrapper{
    height: 48px!important;
  }
</style>
