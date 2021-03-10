<template>
  <div id="app">
    <transition
      name="fade"
      mode="out-in">
      <router-view class="view" />
    </transition>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to blockchain world'
    }
  }
}
</script>

<style lang="scss">
#app {
  text-align: center;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
