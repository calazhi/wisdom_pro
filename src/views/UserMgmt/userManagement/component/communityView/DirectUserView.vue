
<template>
  <div>
    <el-table :data="directUserData" max-height="580" element-loading-text="拼命加载中" style="width:100%" id="directTable">
        <!-- <el-table-column width="55" type="index" label="序号" align="center"></el-table-column> -->
        <el-table-column prop="fullName" label="用户姓名"></el-table-column>
        <el-table-column prop="userName" label="登录 ID"></el-table-column>
        <el-table-column prop="position" label="职务"></el-table-column>
        <el-table-column prop="departmentName" label="部门"></el-table-column>
        <el-table-column prop="primaryPhone" label="手机号"></el-table-column>
        <el-table-column prop="idenNum" label="身份证号码"></el-table-column>
    </el-table>
    <div>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="listQuery.page"
          :page-sizes="[5, 10, 15]"
          :page-size="listQuery.limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>
    <div>
      <el-form><el-form-item><el-input v-show="false"></el-input></el-form-item></el-form>
    </div>
  </div>
</template>

<script>
  import {
    getDepartmentUserVoList
  } from '@/views/UserMgmt/userManagement/apis'

export default {
    props: {
      departmentUuidValue: undefined,
      courtUuidValue: undefined
    },
    data () {
      return {
        directUserData: undefined,
        total: 0,
        listQuery: {
          page: 1,
          limit: 5,
          cloudFlag: 0,
          departmentUuid: '',
          courtUuid: ''
        }
      }
    },
    methods: {
      // 改变分页大小
      handleSizeChange (val) {
        this.listQuery.limit = val
        this.listQuery.departmentUuid = this.departmentUuidValue
        this.listQuery.courtUuid = this.courtUuidValue
        this.findDirectUserList(this.listQuery)
      },
      // 跳转页数
      handleCurrentChange (val) {
        this.listQuery.page = val
        this.listQuery.departmentUuid = this.departmentUuidValue
        this.listQuery.courtUuid = this.courtUuidValue
        this.findDirectUserList(this.listQuery)
      },
      // 获取用户组列表
      findDirectUserList (listQueryParm) {
        getDepartmentUserVoList(listQueryParm)
          .then(
            function (result) {
              this.directUserData = result.departmentUserVoList  // 获取当前部门下的直属用户列表信息(带分页)
              this.total = result.pageCount
            }.bind(this)
          )
          .catch(function (error) {
            console.log(error)
          })
      }
    }
  }
</script>
<style scoped>
#directTable >>> colgroup :nth-child(1) {
  width: 16%;
}
#directTable >>> colgroup :nth-child(2) {
  width: 16%;
}
#directTable >>> colgroup :nth-child(3) {
  width: 16%;
}
#directTable >>> colgroup :nth-child(4) {
  width: 15%;
}
#directTable >>> colgroup :nth-child(5) {
  width: 18%;
}
#directTable >>> colgroup :nth-child(6) {
  width: 19%;
}
</style>