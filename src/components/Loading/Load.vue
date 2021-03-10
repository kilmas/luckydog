<template>
<div id="modal-overlay">
  <div class="modal-data">
     <div sytle="text-align:center;">
        <b-spinner label="Loading..."></b-spinner>
     </div>
     <label class="warning"> loading...</label>
  </div>
</div>
</template>
<script>
export default {
  name: "LoadingModal",
  components: {
    "v-loading": hloading
  },
  data: function() {
    return {};
  }
};
</script>

<style>
</style>