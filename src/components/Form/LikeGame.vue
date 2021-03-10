<template>
  <b-form @submit.stop.prevent="likeGame">
    <b-form-group id="exampleInputGroup2" :label="`剩余赞助Token数量:${rangePayMax} ${paySym}`" label-for="rangePay">
      <b-form-input id="rangePay3" v-model="payToken" @input="inputAct" :min="rangePayMin" :max="rangePayMax"></b-form-input>
      <b-form-input
        id="rangePay4"
        v-model="payToken"
        @input="inputAct"
        type="range"
        :disabled="rangePayMin === rangePayMax"
        :step="1 / 10 ** tabTokens[paySym]"
        :min="rangePayMin"
        :max="rangePayMax"
      ></b-form-input>
      <div class="mt-2">赞助: {{ Number(payToken).toFixed(4) }} {{ paySym }}</div>
    </b-form-group>
    <b-button type="submit" variant="primary" block>Submit<b-spinner v-show="submitLoading" small type="grow"></b-spinner></b-button>
  </b-form>
</template>

<script>
export default {
  props: {
    value: {},
    rangePayMin: {
      default: 0.0001,
    },
    rangePayMax: {
      default: 1,
    },
    paySym: {
      default: 'FO',
    },
    tabTokens: {
      default: {},
    },
    likeGame: {
      default: () => {},
    },
    submitLoading: {
      default: false,
    },
  },
  data() {
    return {
      payToken: 0,
    }
  },
  methods: {
    inputAct() {
      this.$emit('input', this.payToken)
    },
  },
  watch: {
    value(newValue) {
      this.payToken = newValue
    },
  },
}
</script>
<style lang="scss" scoped></style>
