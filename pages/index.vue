<template>
  <div class="container">
    <!--上传组件-->
    <Uploader />
    <!--文件列表组件-->
    <FileList />
  </div>
</template>

<script>
import Uploader from '~/components/file/Upload'
import FileList from '~/components/filelist/FileList'
export default {
  components: {
    FileList,
    Uploader
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 2.5% 1.5%;
}
</style>
