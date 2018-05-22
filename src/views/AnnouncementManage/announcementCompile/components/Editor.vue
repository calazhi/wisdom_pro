<template>
    <div class="editor-wrapper">
        <div ref="editor" style="text-align:left">

        </div>
      <div class="text-leave"><span>{{leaveNum}}</span>/<span>2000</span></div>
    </div>
</template>
<style>
  .editor-wrapper{
    position:relative;
    z-index:1;
  }
</style>
<script>
    import E from 'wangeditor'
    export default {
      name: 'editor',
      props: {
        clearEditor: Boolean
      },
      data () {
        return {
          editor: null,
          contentHtml: '',
          leaveNum: 0
        }
      },
      methods: {
        getContent: function () {
          // alert(this.editorContent)
        }
      },
      mounted () {
        this.editor = new E(this.$refs.editor)
        this.editor.customConfig.uploadImgHeaders = {
          Authorization: window.localStorage.token,
          FrontType: 'egc-admin-ui',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '-1'
        }
        // 自定义菜单配置
        this.editor.customConfig.menus = [
          'head',  // 标题
          'bold',  // 粗体
          'fontSize',  // 字号
          'fontName',  // 字体
          'italic',  // 斜体
          'underline',  // 下划线
          'strikeThrough',  // 删除线
          'foreColor',  // 文字颜色
          'backColor',  // 背景颜色
          'link',  // 插入链接
          'justify',  // 对齐方式
          'quote',  // 引用
          'emoticon',  // 表情
          'image',  // 插入图片
          'table',  // 表格
          'undo',  // 撤销
          'redo'  // 重复
        ]
        // 自定义字体
        this.editor.customConfig.fontNames = [
          '宋体',
          '微软雅黑',
          '楷体',
          '仿宋',
          'NSimSun',
          'Arial',
          'Tahoma',
          'Verdana'
        ]
        this.editor.customConfig.uploadFileName = 'file'
        this.editor.customConfig.withCredentials = true
        this.editor.customConfig.uploadImgMaxSize = 3 * 1024 * 1024  // 限制图片大小
        this.editor.customConfig.uploadImgServer = '/egc-noticemgmtcomponent/image/setByFormData'
        this.editor.customConfig.onchange = (html) => {
          let contLength = this.editor.txt.text().length
          this.leaveNum = 2000 - contLength
          this.$emit('cont', {html: html, length: contLength})
        }
        this.editor.customConfig.uploadImgHooks = {
          // success: function (xhr, editor, result) {
          //   console.log(result)
          // },
          customInsert: function (insert, result, editor) {
            // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
            // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果
            // 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
            var url = result.data
            console.log(url)
            insert(url)
            // result 必须是一个 JSON 格式字符串！！！否则报错
          }
        }
        this.editor.create()
      },
      watch: {
        clearEditor () {
          this.editor.txt.clear()
        }
      }
    }
</script>

<style scoped lang="less">
  .editor-wrapper{
    position:relative;
    width:60%;
    .text-leave{
      position:absolute;
      right:40px;
      bottom:0px;
    }
  }
</style>
