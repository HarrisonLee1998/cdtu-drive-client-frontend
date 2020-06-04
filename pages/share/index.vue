<template>
  <div>
    <div class="container">
      <!--按钮-->
      <div>
        <el-button type="primary" @click="cancelShare">
          <i class="fas fa-ban" />
          取消分享
        </el-button>
      </div>
      <!--分享表格-->
      <div>
        <el-table
          :data="pageInfo.list"
          border
          style="width: 100%"
          @selection-change="handleSelection"
        >
          <el-table-column
            type="selection"
            width="55"
            fixed
          />
          <el-table-column
            prop="title"
            fixed
            label="分享文件"
            width="200"
          />
          <el-table-column
            prop="viewTimes"
            width="120"
            label="浏览次数"
          />
          <el-table-column
            prop="saveTimes"
            width="120"
            label="浏览次数"
          />
          <el-table-column
            prop="saveTimes"
            width="120"
            label="下载次数"
          />
          <el-table-column
            prop="createDate"
            width="200"
            label="分享时间"
          />
          <el-table-column
            prop="expireDate"
            width="200"
            label="过期时间"
          />
          <el-table-column
            prop="isValid"
            width="120"
            label="是否有效"
          />
          <el-table-column label="操作" width="220" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="go(scope.row.id)">
                查看分享主页
              </el-button>
              <el-button type="text">
                复制分享信息
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="pageInfo.total"
          :page-size="pageSize"
          :current-page="pageNo"
          :pager-count="pagerCount"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      pageInfo: {
        total: 0,
        list: []
      },
      pagerCount: 5,
      pageNo: 1,
      pageSize: 10,
      sortBy: 'create_date',
      select: []
    }
  },
  created () {
    this.getShare()
  },
  methods: {
    getShare () {
      this.$axios.get(`/api/share/${this.pageNo}/${this.pageSize}/${this.sortBy}`)
        .then((res) => {
          if (res.data.status === 'OK') {
            this.parseShareInfo(res.data.map.pageInfo)
          }
        })
    },
    parseShareInfo (pageInfo) {
      pageInfo.list.forEach((share) => {
        share.createDate = this.$moment(share.createDate).format('YYYY/MM/DD HH:mm:ss')
        if (share.expireDate) {
          const date = new Date(share.expireDate)
          share.expireDate = this.$moment(date).format('YYYY/MM/DD HH:mm:ss')
          if (date.getTime() - new Date().getTime() < 0) {
            share.isValid = '否'
          } else {
            share.isValid = '是'
          }
        } else {
          share.expireDate = '-'
          share.isValid = '是'
        }
      })
      console.log(pageInfo)
      this.pageInfo = pageInfo
    },
    go (id) {
      const url = encodeURI(`/share/details?sid=${id}&path=/`)
      this.$router.push(url)
    },
    handleSelection (selection) {
      this.select = []
      selection.forEach((share) => {
        this.select.push(share.id)
      })
    },
    cancelShare () {
      if (this.select.length === 0) {
        this.$message.error('请先选择所要取消的分享')
        return
      }
      this.$axios.post('/api/share/cancel', {
        ids: this.select
      })
        .then((res) => {
          if (res.data.status === 'OK') {
            this.$message.success('操作成功')
            this.getShare()
          } else {
            this.$message.error('操作失败')
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 90%;
  margin: 20px auto
}
.el-table {
  margin: 20px 0;
}
.pagination{
  display: flex;
  justify-content: center;
}
</style>
