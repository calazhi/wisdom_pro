<template>
  <div>
    <el-form :inline="true" :model="auServerDetails">
      <template v-if="auServerDetails.courtDto !== null">
        <el-form-item label="省（直辖市）" :label-width="formLabelWidth">
          <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="auServerDetails.courtDto.province"></el-input>
        </el-form-item>
        <el-form-item label="市" :label-width="formLabelWidth">
          <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="auServerDetails.courtDto.city"></el-input>
        </el-form-item>
        <el-form-item label="区" :label-width="formLabelWidth">
          <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="auServerDetails.courtDto.district"></el-input>
        </el-form-item>
        <el-form-item label="小区名称" :label-width="formLabelWidth">
          <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="auServerDetails.courtDto.name"></el-input>
        </el-form-item>
      </template>
      <el-form-item label="CPU型号" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="auServerDetails.cpuModel"></el-input>
      </el-form-item>
      <el-form-item label="CPU核数" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="auServerDetails.numberOfCore"></el-input>
      </el-form-item>
      <el-form-item label="CPU主频(GHz)" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="auServerDetails.cpuFreq"></el-input>
      </el-form-item>
      <el-form-item label="服务器UUID" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="auServerDetails.uuid"></el-input>
      </el-form-item>
      <el-form-item label="BIOS版本" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="auServerDetails.biosVersion"></el-input>
      </el-form-item>
      <el-form-item label="运行内存(M)" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="auServerDetails.ram"></el-input>
      </el-form-item>
      <el-form-item label="硬盘容量(G)" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="auServerDetails.lhdSpaceTotal"></el-input>
      </el-form-item>

      <template v-if=" auServerDetails.auNetAdapters !== null">
        <div v-for="(detail, index) in auServerDetails.auNetAdapters" :key="detail.uuid">
          <el-form-item :label="calNameLable(index)" :label-width="formLabelWidth">
            <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="detail.name"></el-input>
          </el-form-item>
          <el-form-item :label="calMacLabel(index)" :label-width="formLabelWidth">
            <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="detail.mac"></el-input>
          </el-form-item>
        </div>
      </template>
      <template v-if=" auServerDetails.auPhds !== null">
        <div v-for="(item, index) in auServerDetails.auPhds" :key="index">
          <el-form-item :label="calSNLabel(index)" :label-width="formLabelWidth">
            <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="item.serialNo"></el-input>
          </el-form-item>
          <el-form-item :label="calSpaceTtotalLabel(index)" :label-width="formLabelWidth">
            <el-input class="upgrade_el-input" :disabled="isInptDisabled" v-model="item.spaceTotal"></el-input>
          </el-form-item>
        </div>
      </template>
      <el-form-item label="固定资产编号" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="auServerDetails.aeestNo"></el-input>
      </el-form-item>
      <el-form-item label="管理IP" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="auServerDetails.mgmtIp"></el-input>
      </el-form-item>
      <el-form-item label="服务器用途名称" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="auServerDetails.functionName" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="物理机房" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="auServerDetails.deployment" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="安装的机柜" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="auServerDetails.cabinet" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="安装的机柜位置(U)" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="auServerDetails.cabU" :maxlength="maxlength"></el-input>
      </el-form-item>
      <el-form-item label="运行状态" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="auServerDetails.status"></el-input>
      </el-form-item>
      <el-form-item label="维护人" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="auServerDetails.operator"></el-input>
      </el-form-item>
      <el-form-item label="维保服务" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="auServerDetails.serviceLevel"></el-input>
      </el-form-item>
      <el-form-item label="服务到期时间" :label-width="formLabelWidth">
        <el-date-picker v-model="auServerDetails.serviceDuring" type="datetime" placeholder="选择日期时间"  value-format="yyyy-MM-dd HH:mm:ss" :picker-options="pickerOptionsStart" :editable="false" style="width:280px;">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="描述" :label-width="formLabelWidth">
        <el-input class="upgrade_el-input" v-model="auServerDetails.remark" :maxlength="maxlength"></el-input>
      </el-form-item>

      <template v-if="auServerDetails.extDataList">
        <el-form-item :label="item.fieldName" v-for="item in auServerDetails.extDataList" :key="item.fieldName" :label-width="formLabelWidth">
          <el-input class="upgrade_el-input" v-model="item.fieldValue" :maxlength="maxlength"></el-input>
        </el-form-item>
      </template>

      <div style="text-align: center">
        <el-button @click="callBackCloseDialogEvent" class="cancel-btn" type="primary">取 消</el-button>
        <el-button @click="callBackSaveEvent" class="action-btn" type="primary">保 存</el-button>

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
    auServerDetails: {
      type: Object
    }
  },
  data () {
    return {
      formLabelWidth: '140px',
      isInptDisabled: true,
      showAddNewEvent: false,
      maxlength: 30,
      fieldName: '',
      fieldValue: '',
      // 生效日期
      pickerOptionsStart: {
        disabledDate (time) {
          return time.getTime() < new Date() - 3600 * 1000 * 24
        }
      }
    }
  },
  methods: {
    callBackSaveEvent () {
      this.$emit('saveServInfoEvent', this.auServerDetails, 'save')
    },
    calNameLable (index) {
      return '物理网卡' + (+index + 1) + '名称'
    },
    calMacLabel (index) {
      return '物理网卡' + (+index + 1) + 'MAC'
    },
    calSNLabel (index) {
      return '硬盘' + (+index + 1) + '序列号SN'
    },
    calSpaceTtotalLabel (index) {
      return '硬盘' + (+index + 1) + '容量'
    },
    addNewEvent () {
      console.info('add new item')
      if (this.fieldName.trim() === '') {
        this.$message.error('请输入新增项名称')
      } else {
        if (this.auServerDetails.extDataList === null) {
          this.auServerDetails.extDataList = []
        }
        this.auServerDetails.extDataList.push({
          fieldName: this.fieldName,
          fieldValue: this.fieldValue
        })
        this.clearData()
        console.info(JSON.stringify(this.auServerDetails))
      }
    },
    clearData () {
      console.info('clear data')
      this.showAddNewEvent = false
      this.fieldName = ''
      this.fieldValue = ''
    },
    callBackCloseDialogEvent () {
      this.$emit('saveServInfoEvent', this.auServerDetails, 'cancel')
    }
  },
  watch: {
    auServerDetails (newValue, oldValue) {
      this.auServerDetails = newValue
    },
    deep: true
  }
}
</script>
