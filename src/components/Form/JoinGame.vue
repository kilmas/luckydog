<template>
  <b-form @submit.stop.prevent="joinGame">
    <b-form-group id="exampleInputGroup1" :label="`剩余参与Token数量:${rangePayMax} ${paySym}`" label-for="rangePay">
      <b-form-input id="rangePay1" v-model="payToken" :disabled="rangePayMin === rangePayMax" :min="rangePayMin" :max="rangePayMax" @input="inputAct"></b-form-input>
      <b-form-input
        id="rangePay2"
        v-model="payToken"
        @input="inputAct"
        type="range"
        :disabled="rangePayMin === rangePayMax"
        :step="1 / (10 ** tabTokens[paySym])"
        :min="rangePayMin"
        :max="rangePayMax"
      ></b-form-input>
      <div class="mt-2">参与: {{ Number(payToken).toFixed(tabTokens[paySym]) }} {{ paySym }}</div>
    </b-form-group>
    <b-button type="submit" variant="primary" block :disabled="submitLoading">Submit<b-spinner v-show="submitLoading" small type="grow"></b-spinner></b-button>
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
    joinGame: {
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
