<template>
  <div>
    <div class="header">
      <Header />
    </div>
    <nuxt />
  </div>
</template>

<script>
import Header from '~/components/Header'
export default {
  components: {
    Header
  }
}
</script>
