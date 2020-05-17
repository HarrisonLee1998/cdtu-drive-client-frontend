<template>
  <div>
    <div class="file-list-item-title">
      <i v-if="file.isFolder" class="fas fa-folder file-icon folder-icon" />
      <i v-else :class="[icons[file.fileType], 'file-icon']" />
      <span class="file-name">{{ file.fileName }}</span>
    </div>
    <span class="file-list-item-size">{{ file.fileSize }}</span>
    <span class="file-list-item-date">{{ file.fileDate }}</span>
  </div>
</template>

<script>
export default {
  props: {
    file: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      icons: {
        docx: 'far fa-file-word',
        img: 'fas fa-image',
        video: 'fas fa-video',
        music: 'fas fa-music'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.file-icon {
  margin-right: 10px;
  font-size: 16px;
}
.folder-icon {
  color: #ffd659;
}
.file-name {
  font-size: 12px;
  cursor: pointer;
}
.file-name:hover {
  color: deepskyblue;
}
</style>
