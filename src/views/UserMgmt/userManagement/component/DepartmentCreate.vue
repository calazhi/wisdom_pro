<template>
  <div>
    <el-form :model='department' :rules="rules" ref="department" :inline="true">
      <el-form-item label='用户类型' prop='departmentType' :label-width="formLabelWidth">
        <el-select v-model='department.departmentType' class="user_el-select" placeholder="请选择用户类型" @change="deptTypeSelected">
          <el-option v-for='item in departmentTypeSelect' :key='item.itemCode' :label='item.itemName' :value='item.itemCode'></el-option>
       </el-select>
      </el-form-item>
      <div>
        <el-form-item label='部门名称' prop='departmentName' :label-width="formLabelWidth">
          <el-input v-model='department.departmentName' placeholder='请输入部门名称' class="user_el-input"></el-input>
        </el-form-item>
        <el-form-item label='上级部门' :label-width="formLabelWidth">
          <el-select v-model='department.parentDepartmentUuid' class="user_el-select">
            <el-option v-for='item in departmentSelect' :key='item.uuid' :label='item.departmentName' :value='item.uuid'></el-option>
        </el-select>
        </el-form-item>
      </div>
      <div class="el-textarea">
        <el-form-item label='部门说明' :label-width="formLabelWidth">
          <el-input type='textarea' :rows="3" v-model='department.remark' placeholder='请输入部门说明'></el-input>
        </el-form-item>
      </div>
      <div class="user-button" align="center">
        <el-row>
          <el-col>
            <span class="dialog-footer">
              <el-button class='cancel-btn' @click="cancelEvent('department')" type='primary'>取消</el-button>
              <el-button type="primary" @click="create('department')" class='action-btn'>保 存</el-button>
            </span>
          </el-col>
        </el-row>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getDepartmentOptions } from '@/views/UserMgmt/userManagement/apis'
export default {
  props: {
    // departmentSelect: undefined,
    departmentTypeSelect: undefined
  },
  methods: {
    getDepartmentList (params) {
      getDepartmentOptions(params)
        .then(
          function (result) {
            console.log('>>>>:' + JSON.stringify(result))
            this.departmentSelect = result
          }.bind(this)
        )
        .catch(
          function (error) {
            console.log(error)
          }
        )
    },
    deptTypeSelected (data) {
      this.department.parentDepartmentUuid = ''
      this.dictData.departmentType = this.department.departmentType
      this.getDepartmentList(this.dictData)
    },
    create (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$emit('gridCreateEvent', this.department)
        } else {
          return false
        }
      })
    },
    cancelEvent (department) {
      console.log('cancelEvent')
      this.$refs[department].clearValidate()
      this.$refs[department].resetFields()
      this.$emit('canelDialogEvent')
    },
    initParentDepartmentUuid (val, valType) {
      console.log('<<<<<<<<<<<<<<<<<<<<<:val:' + val)
      console.log('<<<<<<<<<<<<<<<<<<<<<:valType:' + valType)
      this.dictData.departmentType = valType
      this.getDepartmentList(this.dictData)
      if (val === 'CREATION_VIRTUAL_UUID') {
        val = ''
      }
      this.department = {
        departmentType: valType,
        departmentName: undefined,
        parentDepartmentUuid: val,
        remark: undefined
      }
      // this.department.parentDepartmentUuid = val
    },
    initDepartmentInfo () {
      this.department = {
        departmentName: undefined,
        parentDepartmentUuid: '',
        departmentType: undefined,
        remark: undefined
      }
    }
  },
  data () {
    return {
      departmentSelect: undefined,
      formLabelWidth: '120px',
      department: {
        departmentName: undefined,
        parentDepartmentUuid: '',
        departmentType: undefined,
        remark: undefined
      },
      rules: {
        departmentName: [
          { required: true, message: '请输入部门名称', trigger: 'blur' },
          { max: 64, message: '长度不能超过64个字符' }
        ],
        departmentType: [
          { required: true, message: '请选择部门类别', trigger: 'change' }
        ]
      },
      dictData: {
        cloudFlag: 1,
        departmentType: ''
      }
    }
  }
}
</script>
<style scoped>
.el-textarea{
  width: 392%;
}
</style>

