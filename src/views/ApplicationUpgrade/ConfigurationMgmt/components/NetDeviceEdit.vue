<template>
  <div>
    <el-form :inline="true" :model="netDeviceDetails">
      <template v-if=" netDeviceDetails.courtDto !== null">
        <el-form-item label="省（直辖市）" :label-width="formLabelWidth">
          <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="netDeviceDetails.courtDto.province"></el-input>
        </el-form-item>
        <el-form-item label="市" :label-width="formLabelWidth">
          <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="netDeviceDetails.courtDto.city"></el-input>
        </el-form-item>
        <el-form-item label="区" :label-width="formLabelWidth">
          <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="netDeviceDetails.courtDto.district"></el-input>
        </el-form-item>
        <el-form-item label="小区名称" :label-width="formLabelWidth">
          <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="netDeviceDetails.courtDto.name"></el-input>
        </el-form-item>
      </template>
      <el-form-item label="设备名称" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="netDeviceDetails.nename"></el-input>
      </el-form-item>
      <el-form-item label="设备类型/型号" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="netDeviceDetails.type"></el-input>
      </el-form-item>
      <el-form-item label="软件版本" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="netDeviceDetails.osVersion"></el-input>
      </el-form-item>
      <el-form-item label="管理IP" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="netDeviceDetails.mgmtIp"></el-input>
      </el-form-item>
      <el-form-item label="设备SN/设备ID" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="netDeviceDetails.serialNo"></el-input>
      </el-form-item>
      <el-form-item label="运行状态" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="netDeviceDetails.status" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="固资编号" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="netDeviceDetails.assetNo" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="设备厂商" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="netDeviceDetails.vendor" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="设备服务提供商" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="netDeviceDetails.serviceProvider" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="物理机房" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="netDeviceDetails.deployment" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="是否核心" :label-width="formLabelWidth">
        <el-select v-model="netDeviceDetails.isCore" placeholder="请选择" style="width:280px;" clearable>
          <el-option v-for="item in coreList" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="外网IP" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="netDeviceDetails.internetIp" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="外网端口" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="netDeviceDetails.internetPort" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="后端IP" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="netDeviceDetails.backendIp" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="维护人" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="netDeviceDetails.operator" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="维保服务" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="netDeviceDetails.serviceLevel" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="服务到期时间" :label-width="formLabelWidth">
        <el-date-picker v-model="netDeviceDetails.serviceDuring" type="datetime" placeholder="选择日期时间"  value-format="yyyy-MM-dd HH:mm:ss" :picker-options="pickerOptionsStart" :editable="false" style="width:280px;">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="描述" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="netDeviceDetails.remark" :maxlength="maxlength"></el-input>
      </el-form-item>
      <template v-if="netDeviceDetails.extDataList !== null">
        <el-form-item :label="item.fieldName" v-for="item in netDeviceDetails.extDataList" :key="item.fieldName" :label-width="formLabelWidth">
          <el-input class="upgrade_el-input" v-model="item.fieldValue" :maxlength="maxlength"></el-input>
        </el-form-item>
      </template>
      <div style="text-align: center">
        <el-button @click="callBackCloseDialogEvent" class="cancel-btn" type="primary">取 消</el-button>
        <el-button class="action-btn" @click="updateNetDeviceInfo" type="primary">保 存</el-button>
        <el-popover ref="newCIEventPop" visible="showAddNewCIPop" placement="right" width="160" @hide="clearData" v-model="showAddNewEvent">
          <div>
            <div>
              <el-input :autofocus="true" placeholder="请输入新增项名称" size="small" v-model="fieldName"></el-input>
            </div>
            <div class="margin-top-5">
              <el-input placeholder="请输入新增项值" size="small" v-model="fieldValue"></el-input>
            </div>
          </div>
          <div class="text-right margin-top-5">
            <el-button size="mini" type="text" @click="clearData">取消</el-button>
            <el-button type="primary" size="mini" @click="addNewEvent">添加</el-button>
          </div>
        </el-popover>
        <a v-popover:newCIEventPop>
          <span>
            <el-button icon="el-icon-circle-plus-outline" style="margin-center: 10px" plain type="primary">添加</el-button>
          </span>
        </a>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    netDeviceDetails: undefined
  },
  data () {
    return {
      formLabelWidth: '160px',
      isInptDisabled: true,
      maxlength: 30,
      showAddNewCIPop: false,
      fieldName: '',
      fieldValue: '',
      showAddNewEvent: false,
      pickerOptionsStart: {
        disabledDate (time) {
          return time.getTime() < new Date() - 3600 * 1000 * 24
        }
      },
      coreList: [
        {
          value: 1,
          label: '是'
        },
        {
          value: 0,
          label: '否'
        }
      ]
    }
  },
  methods: {
    updateNetDeviceInfo () {
      this.$emit('saveOsInfoEvent', this.netDeviceDetails, 'save')
    },
    addNewEvent () {
      console.info('add new item')
      if (this.fieldName.trim() === '') {
        this.$message.error('请输入新增项名称')
      } else {
        if (this.netDeviceDetails.extDataList === null) {
          this.netDeviceDetails.extDataList = []
        }
        this.netDeviceDetails.extDataList.push({
          fieldName: this.fieldName,
          fieldValue: this.fieldValue
        })
        this.clearData()
      }
    },
    clearData () {
      console.info('clear data')
      this.showAddNewEvent = false
      this.fieldName = ''
      this.fieldValue = ''
    },
    callBackCloseDialogEvent () {
      this.$emit('saveOsInfoEvent', this.netDeviceDetails, 'cancel')
    }
  },
  watch: {
    netDeviceDetails (newValue, oldValue) {
      this.netDeviceDetails = newValue
    },
    'this.netDeviceDetails.coreList': function (newValue, oldValue) {
      console.log('--------> ' + this.netDeviceDetails.coreList)
    }
  }
}
</script>
