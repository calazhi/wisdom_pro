
<template>
  <div class='ui-common'>
     <div class="flex-c flex-1">
      <el-row style="height: 100%;">
        <el-col :span="10" style='height: 100%;' class="flex-c">
          <div>
            <el-button icon="el-icon-circle-plus-outline" @click="handleCreate" plain type="primary">添加</el-button>
            <el-select clearable
              v-model='userType' 
              placeholder='请选择用户类型'
              style="width:260px; float:right"
              @change='userTypeSelected'
              >
              <el-option
                v-for='item in userTypeOptions'
                :key='item.itemCode'
                :label='item.itemName'
                :value='item.itemCode'>
              </el-option>
            </el-select>
          </div>
          <div class="flex-1 flex-c">
          <grid-list id="roleTable"
            :editable="true"
            :deletable="true"
            :showOperation="true"
            :tableData="roleData.roleBaseVoList"
            :params="roleListParam"
            style="margin-top: 15px; max-height: 100%;"
            @listenToDeleteEvent="roleDeleteEvent"
            @listenToEditEvent="roleEditEvent"
          ></grid-list>
          </div>
          <el-pagination
            @size-change="handleRoleSizeChange"
            @current-change="handleRoleCurrentChange"
            :page-sizes="[5, 10, 15]"
            :page-size="query.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="roleData.pageCount"
            style="margin-top:15px; margin-bottom:20px">
          </el-pagination>
        </el-col>
        <el-dialog :title="dialogStatus"
        :close-on-click-modal="false"
        :show-close="true"
        :before-close="roleAddEvent"
        :visible.sync="dialogFormVisible">
            <role-add
              :form="roleForm"
              :userTypeList="userTypeOptions"
              @listenToAddEvent="roleAddEvent"
              v-show="showCreate"
            ></role-add>
        </el-dialog>
        <el-col :span="14" style='margin-top:40px;' v-show="showGrid">
          <el-card class="box-card" style='margin-left:10px; margin-top:15px'>
            <role-edit ref="roleedit"
              @listenToEditEvent="roleBaseVoEditEvent"
              @listenToCloseEvent="roleCloseEvent"
              :roleUserData = 'subUserData'
              :roleUsergroupData="subUsergroupData"
              :roleResourceData="subResourceData"
              :form="roleForm"
              :userTypeList="userTypeOptions"
              style='margin-top: 20px'
            ></role-edit>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import gridList from './component/gridList.vue'
  import roleEdit from './component/roleEdit.vue'
  import roleAdd from './component/roleAdd.vue'
  import {
    getRoleList,
    getRoleData,
    deleteRole,
    listUserType
  } from '@/views/UserMgmt/userManagement/apis'
  export default {
    name: 'role',
    props: {
      roleName: undefined
    },
    data () {
      return {
        showCreate: false,
        showGrid: false,
        total: 0,
        roleId: undefined,
        roleData: {
          pageCount: undefined,
          roleBaseVoList: undefined
        },
        roleListParam: undefined,
        subUserData: {
          roleUserVoList: undefined,
          pageCount: undefined
        },
        subUsergroupData: {
          roleUsergroupVoList: undefined,
          pageCount: undefined
        },
        subResourceData: {
          roleAuthResourceVoList: undefined,
          pageCount: undefined
        },
        dialogFormVisible: false,
        gridListParam: undefined,
        gridListTableData: undefined,
        dialogStatus: undefined,
        userGroupData: undefined,
        query: {
          roleId: '',
          currentPage: 1,
          pageSize: 10,
          cloudFlag: 1,
          courtUuid: '',
          userType: ''
        },
        editQuery: {
          roleId: '',
          currentPage: 1,
          pageSize: 5
        },
        roleForm: {
          roleName: undefined,
          remark: undefined,
          uuid: undefined,
          userType: undefined
        },
        userTypeOptions: undefined
      }
    },
    components: {
      gridList,
      roleEdit,
      roleAdd
    },
    methods: {
      getRoleListTable () {
        getRoleList(this.query)
          .then(
            function (result) {
              this.roleData = result
            }.bind(this)
          )
          .catch(
            function (error) {
              console.log(error)
            }
          )
      },
      loadData () {
        this.roleListParam = [{
          title: '角色名称',
          prop: 'roleName'
        },
        {
          title: '用户类型',
          prop: 'userTypeName'
        },
        {
          title: '角色说明',
          prop: 'remark'
        }]
        this.getRoleListTable()
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
      },
      roleDeleteEvent (data) {
        this.roleId = data.uuid
        deleteRole(data.uuid)
          .then(
            function (result) {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.showGrid = false
              this.getRoleListTable()
            }.bind(this)
          )
          .catch(
            function (error) {
              this.$message.error(error.response.data.message)
            }
          )
      },
      roleEditEvent (data) {
        this.showCreate = false
        this.showGrid = true
        this.roleId = data.uuid
        this.editQuery.roleId = data.uuid
        getRoleData(this.editQuery)
          .then(
            function (result) {
              this.subUsergroupData = result.roleUsergroupPageVo
              this.subUserData = result.roleUserPageVo
              this.subResourceData = result.roleAuthResourcePageVo
              this.roleForm.roleName = result.roleBaseVo.roleName
              this.roleForm.remark = result.roleBaseVo.remark
              this.roleForm.uuid = result.roleBaseVo.uuid
              this.roleForm.userType = result.roleBaseVo.userType
              this.roleName = result.roleBaseVo.roleName
            }.bind(this)
          )
          .catch(
            function (error) {
              console.log(error)
            }
          )
        this.$refs.roleedit.changeRoleEditDiaLogEvent()
      },
      roleAddEvent (data) {
        this.getRoleListTable()
        this.dialogFormVisible = false
        this.showCreate = false
      },
      roleBaseVoEditEvent (data) {
        this.getRoleListTable()
      },
      roleCloseEvent () {
        this.showGrid = false
      },
      handleRoleCurrentChange (val) {
        this.query.currentPage = val
        this.getRoleListTable()
      },
      handleRoleSizeChange (val) {
        this.query.pageSize = val
        this.getRoleListTable()
      },
      handleCreate () {
        this.showCreate = true
        this.showGrid = false
        this.dialogStatus = '添加角色'
        this.roleForm.roleName = undefined
        this.roleForm.remark = undefined
        this.roleForm.uuid = undefined
        this.roleForm.userType = undefined
        this.dialogFormVisible = true
      },
      userTypeSelected (data) {
        this.query.userType = data
        this.getRoleListTable()
      }
    },
    created: function () {
      this.loadData()
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #roleTable >>> colgroup col:nth-child(1) {
    width: 25%;
  }
  #roleTable >>> colgroup col:nth-child(2) {
    width: 20%;
  }
  #roleTable >>> colgroup col:nth-child(3) {
    width: 35%
  }
  #roleTable >>> colgroup col:nth-child(4) {
    width: 20%
  }
</style>
