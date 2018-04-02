<template>
  <div class="main">
    <div class="importFile-container">
      <el-row :gutter="60" class="deviceElrow">
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <el-upload
              style="margin-left: 10px"
              class="firmwareUpload"
              ref="upload"
              drag
              :limit=2
              :multiple="false"
              :on-change="_handleUploadFile"
              :on-success="_handleSucess"
              :on-error="_handleError"
              :action="attrUpload"
              :data="uploadData"
              :auto-upload="false">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击选择文件</em></div>
              <!--<el-button slot="trigger" size="medium" plain>本地文件浏览</el-button>-->
            </el-upload>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="60" class="deviceElrow">
        <el-col :span="10">
          <div class="grid-content bg-purple">
            <input-box title="固件名称"
                       class="uploadInput"
                       :required="true"
                       code="fileName"
                       :disabled="true"
                       @listenToInput="_saveDeviceData"
                       :value="fileInfo.name"
                       ref="fileName">
            </input-box>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="60" class="deviceElrow">
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <input-box title="设备类型"
                        :required="true"
                        code="deviceType"
                        :options="deviceType"
                        :disabled="true"
                        :value="fileInfo.deviceType"
                        @listenToInput="_saveDeviceData"
                        ref="deviceType">
            </input-box>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <input-box title="厂商名称"
                        :required="true"
                        code="providerCode"
                        :disabled="true"
                        ref="providerCode"
                        :options="providerType"
                        :value="fileInfo.providerCode"
                        @listenToInput="_saveDeviceData">
            </input-box>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <input-box title="固件版本"
                       :required="true"
                       code="firmwareVersion"
                       :disabled="true"
                       :value="fileInfo.firmwareVersion"
                       @listenToInput="_saveDeviceData"
                       ref="firmwareVersion">
            </input-box>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <input-box title="固件大小"
                       :required="true"
                       code="fileSize"
                       ref="fileSize"
                       :disabled="true"
                       :value="(fileInfo.size)?(parseInt(fileInfo.size)/1000000).toString():''"
                       append="MB"
                       @listenToInput="_saveDeviceData">
            </input-box>
          </div>
        </el-col>
      </el-row>
      <div class="action-container">
        <el-button @click="_importFile" type="primary" icon="el-icon-upload">导入</el-button>
      </div>
    </div>
  </div>
</template>

<script>
  import ElRow from 'element-ui/packages/row/src/row'
  import selectBox from '../../deviceInfoMaintain/components/selectBox'
  import inputBox from '../../deviceInfoMaintain/components/inputBox'
  import ElButton from 'element-ui/packages/button/src/button.vue'
  import {importDmFotaFile, getUploadAddr} from '../apis/index.js'

  export default {
    props: {
      deviceTypeList: {
        type: Array
      },
      deviceType: {
        type: Array
      },
      providerType: {
        type: Array
      }
    },
    components: {
      ElButton,
      ElRow,
      selectBox,
      inputBox
    },
    data () {
      return {
        uploadData: {module: 'dm', submit: 'Upload'},
        attrUpload: '',
        importData: {},
        fileInfo: {},
        descArray: {},
        tokenHeaders: {'FrontType': 'scp-admin-ui', 'Authorization': sessionStorage.token}
      }
    },
    methods: {
      _importFile () {
        if (this.attrUpload !== '') this.$refs.upload.submit()
      },
      _handleUploadFile (file, fileList) {
        getUploadAddr()
          .then(result => {
            this.attrUpload = result
          })
        if (fileList.length === 2) {
          fileList.shift()
        }
        var array = file.name.split('_')
        // 判断文件名是否合法
        if (array.length === 4 && this._isValid('deviceTypeDesc', array[1], this.deviceType) && this._isValid('providerName', array[0], this.providerType)) {
          if (file.size !== 0) {
            file['deviceType'] = this.descArray.deviceTypeDesc
            file['providerCode'] = this.descArray.providerName
            file['firmwareVersion'] = array[2]
            this.fileInfo = file
            this.importData['deviceType'] = array[1]
            this.importData['providerCode'] = array[0]
            this.importData['firmwareVersion'] = array[2]
            this.importData['fileName'] = file.name
            this.importData['fileSize'] = (parseInt(file.size) / 1000000).toString()
          } else {
            this.$message({
              message: '导入文件不能为空文件',
              type: 'error'
            })
          }
        } else {
          this.$message({
            message: '请导入与主数据（厂商编码+设备类型）有效匹配的固件文件（厂商编码_设备类型_版本号_日期yyyyMMdd.后缀）',
            type: 'error'
          })
        }
      },
      _saveDeviceData (data) {
        for (var key in data) {
          this.importData[key] = data[key]
        }
      },
      _handleSucess (response) {
        // {"fileSize":"72159378","fileName":"1005_2001_V68_20180314.zip","uri":"\/demo\/20180321043127\/1005_2001_V68_20180314.zip"}
        this.importData['uri'] = response.uri
        importDmFotaFile(this.importData)
          .then(result => {
            this.$message({
              message: JSON.stringify(result),
              type: 'success'
            })
            for (var key in this.importData) {
              if (this.$refs[key]) {
                this.$refs[key].clearBox()
              }
            }
            this.importData = {}
            this.fileInfo = {}
          })
          .catch()
      },
      _handleError (err) {
        this.$message({
          message: JSON.stringify(err),
          type: 'error'
        })
      },
      _isValid (type, data, array) {
        var isValid = false
        array.forEach((value) => {
          if (data === value.value) {
            isValid = true
            this.descArray[type] = value.label
            return isValid
          }
        })
        return isValid
      }
    }
  }
</script>
