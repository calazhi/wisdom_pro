<template>
  <div class='ui-common'>
    <div class="app-container flex-1 flex-c" calendar-list-container>
      <div v-show="showGrid == true" class="flex-1 flex-c">
        
      <div>
        <el-button icon="el-icon-circle-plus-outline" @click="handleCreate" plain type="primary" >添加</el-button>
        <span style="float:right">
          <el-select clearable
            v-model='userType' 
            placeholder='请选择用户类型'
            style="width:260px; margin-right:10px"
            @change='userTypeSelected'
            >
            <el-option
              v-for='item in userTypeOptions'
              :key='item.itemCode'
              :label='item.itemName'
              :value='item.itemCode'>
            </el-option>
          </el-select>
          <el-input @keyup.enter.native="handleFilter" style="width:360px; display:inline-block" class="filter-item" placeholder="请输入用户组名称" v-model="searchText"></el-input>
          <el-button class="cancel-btn" type="primary" @click="handleFilterReset" style="margin-left:10px">清空</el-button>
          <el-button class="action-btn" type="primary" @click="handleFilter" style="margin-left:10px">查询</el-button>
        </span>
      </div>

        <div class="border-divide"></div>

        <div class="table-container" >
          <grid-list id="usergroupTable"
            :editable="true"
            :deletable="true"
            :showOperation="true"
            :tableData="userGroupList"
            :params="userGroupListParam"
            style="margin-top: 15px"
            @listenToDeleteEvent="userGroupDeleteEvent"
            @listenToEditEvent="gridEditEvent"
          ></grid-list>
        </div>
        <div>
          <el-pagination
            :page-sizes="[5,10,20,30]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            style="margin-top:10px"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :page-size="query.pageSize"
          ></el-pagination>
        </div>
      </div>
      <el-dialog :title="dialogAddStatus"
      :close-on-click-modal="false"
      :show-close="true"
      :before-close="userGroupAddEvent"
      :visible.sync="dialogFormAddVisible">
        <user-group-create
          @listenToAddEvent="userGroupAddEvent"
          v-show="showCreate"
          :userTypeList="userTypeOptions"
        ></user-group-create>
      </el-dialog>
      <el-dialog :title="dialogEditStatus"
      :visible.sync="dialogFormEditVisible" :close-on-click-modal="false">
        <user-group-edit
          :userGroupDetailData="subUserGroupData"
          :dirUsergroupDetailData="dirChildrenUserGroupData"
          :dirUserDetailData="userData"
          :roleDetailData="roleData"
          :editForm="userGroupForm"
          :userTypeList="userTypeOptions"
          @listenToChildEditEvent="childEditEvent"
          @listenToChildDeleteEvent="childDeleteEvent"
          @listenToChildCloseEvent="childCloseEvent"
          v-show="showEdit"
          :usergroupUuid="usergroupUuid"
        ></user-group-edit>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import gridList from './component/gridList.vue'
  import userGroupEdit from './component/userGroupEdit.vue'
  import userGroupCreate from './component/userGroupCreate'
  import {
    getUserGroupList,
    getUserGroupData,
    deleteUserGroup,
    listUserType
  } from '@/views/UserMgmt/userManagement/apis'
  export default {
    name: 'userGroup',
    data () {
      return {
        userTypeOptions: undefined,
        searchText: '',
        showCreate: false,
        showEdit: false,
        dirChildrenUserGroupData: undefined,
        userData: undefined,
        roleData: undefined,
        userGroupList: undefined,
        userGroupListParam: undefined,
        total: 0,
        dialogFormAddVisible: false,
        dialogFormEditVisible: false,
        showGrid: true,
        showSubGrid: false,
        activeName: '0',
        userGroupForm: {
          usergroupName: undefined,
          parentUsergroupName: undefined,
          remark: undefined,
          uuid: undefined,
          userType: undefined
        },
        usergroupUuid: undefined,
        treeData: undefined,
        treeHighlight: true,
        subUserGroupData: undefined,
        filterText: '',
        gridListParam: undefined,
        gridListTableData: undefined,
        dialogAddStatus: undefined,
        dialogEditStatus: undefined,
        query: {
          currentPage: 1,
          pageSize: 10,
          usergroupUuid: '',
          userGroupName: '',
          cloudFlag: 1,
          courtUuid: '',
          userType: ''
        },
        queryEdit: {
          currentPage: 1,
          pageSize: 5,
          usergroupUuid: ''
        }
      }
    },
    components: {
      gridList,
      userGroupEdit,
      userGroupCreate
    },
    methods: {
      initData () {
        this.searchText = ''
      },
      getUserGroupListTable () {
        getUserGroupList(this.query)
          .then(
            function (result) {
              this.userGroupList = result.usergroupBaseVoList
              this.total = result.pageCount
            }.bind(this)
          )
          .catch(
            function (error) {
              console.log(error)
            }
          )
      },
      loadData () {
        this.userGroupListParam = [{
          title: '用户组名称',
          prop: 'usergroupName'
        },
        {
          title: '用户类型',
          prop: 'userTypeName'
        },
        {
          title: '用户组说明',
          prop: 'remark'
        },
        {
          title: '直属用户',
          prop: 'dirUsersName'
        }]
        this.getUserGroupListTable()
        listUserType()
          .then(
            function (result) {
              this.userTypeOptions = result
            }.bind(this)
          )
          .catch(
            function (error) {
              console.log('错误：' + error)
            }
          )
        this.initData()
      },
      filterNode (value, data) {
        if (!value) return true
        return data.label.indexOf(value) !== -1
      },
      handleFilter () {
        this.query.userGroupName = this.searchText
        this.getUserGroupListTable()
      },
      handleFilterReset () {
        this.searchText = ''
        this.query.userGroupName = ''
        this.userType = ''
        this.query.userType = ''
        this.getUserGroupListTable()
      },
      handleCreate () {
        this.dialogAddStatus = '添加用户组'
        this.showCreate = true
        this.showEdit = false
        this.dialogFormAddVisible = true
      },
      handleTabClick (tab, event) {
        this.showGrid = (tab.name === '0')
      },
      handleNodeClick (data) {
        this.showSubGrid = true
      },
      handleTreeCreate () {
        this.handleCreate()
      },
      handleTreeSave () {
      },
      handleTreeDelete () {
        this.showSubGrid = false
        this.treeHighlight = false
      },
      handleSizeChange (val) {
        this.query.pageSize = val
        this.query.usergroupName = this.searchText
        this.getUserGroupListTable()
      },
      handleCurrentChange (val) {
        this.query.currentPage = val
        this.query.usergroupName = this.searchText
        this.getUserGroupListTable()
      },
      userGroupDeleteEvent (data) {
        this.usergroupUuid = data.uuid
        this.query.usergroupUuid = this.usergroupUuid
        deleteUserGroup(this.usergroupUuid)
          .then(
            function (result) {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.getUserGroupListTable()
            }.bind(this)
          )
          .catch(
            function (error) {
              console.log(error)
              this.$message.error(error.response.data.message)
            }
          )
      },
      gridEditEvent (data) {
        this.dialogFormEditVisible = true
        this.showEdit = true
        this.showCreate = false
        this.dialogEditStatus = '编辑用户组'
        this.usergroupUuid = data.uuid
        this.query.usergroupUuid = this.usergroupUuid
        this.queryEdit.usergroupUuid = this.usergroupUuid
        getUserGroupData(this.queryEdit)
            .then(
              function (result) {
                this.subUserGroupData = result
                this.dirChildrenUserGroupData = this.subUserGroupData.dirChildrenUsergroupPageVo || []
                this.userData = this.subUserGroupData.usergroupUserPageVo || []
                this.roleData = this.subUserGroupData.usergroupRolePageVo || []
                this.userGroupForm.usergroupName = result.usergroupBaseVo.usergroupName
                this.userGroupForm.uuid = result.usergroupBaseVo.uuid
                this.userGroupForm.remark = result.usergroupBaseVo.remark
                this.userGroupForm.userType = result.usergroupBaseVo.userType
                this.usergroupUuid = result.usergroupBaseVo.uuid
              }.bind(this)
            )
            .catch(
              function (error) {
                console.log(error)
              }
            )
      },
      childEditEvent (data) {
        this.getUserGroupListTable()
      },
      childDeleteEvent (data) {
        this.getUserGroupListTable()
      },
      userGroupAddEvent (data) {
        this.getUserGroupListTable()
        this.dialogFormAddVisible = false
        this.showCreate = false
      },
      childCloseEvent () {
        this.dialogFormEditVisible = false
      },
      userTypeSelected (data) {
        this.query.userType = data
        this.getUserGroupListTable()
      }
    },
    created () {
      this.loadData()
    }
  }
</script>

<style scoped>
  #usergroupTable >>> colgroup col:nth-child(1) {
    width: 15%
  }
  #usergroupTable >>> colgroup col:nth-child(2) {
    width: 15%
  }
  #usergroupTable >>> colgroup col:nth-child(3) {
    width: 30%
  }
  #usergroupTable >>> colgroup col:nth-child(4) {
    width: 30%
  }
  #usergroupTable >>> colgroup col:nth-child(5) {
    width: 10%
  }
</style>
