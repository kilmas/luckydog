<template>
  <div>
    <my-header :account="account" :copyData="copyData" v-bind:onCopy="onCopy" v-bind:onError="onError" :myGameList="[]" :addShow="addShow" :showRule="showRule" :login="login" :signout="signout" />
    <main>
      <div class="row m-1">
        <div class="col-lg-6 col-md-6 col-sm-6">
          <b-card tag="article" class="mb-2" v-if="item.id > -1">
            <a :href="item.url">
              <div class="img-box"><b-card-img :src="item.pic" alt="Image" top></b-card-img></div>
              <b-card-title class="mt-4">{{ item.title }}</b-card-title>
            </a>
            <div class="row">
              <div class="col-md-12 col-sm-12">
                <b-input-group size="sm" :prepend="item.paid.split(' ')[1]" :append="`Return ${item.rate}%`">
                  <b-form-input readonly :value="Number(item.price.split(' ')[0])"></b-form-input>
                </b-input-group>
                <br />
                <b-progress :value="Number(item.paid.split(' ')[0]) + Number(item.liked.split(' ')[0])" :max="Number(item.price.split(' ')[0])" show-progress animated></b-progress>
              </div>
              <div class="col-md-12 col-sm-12">
                <div class="text-right">
                  <br />
                  <b-link @click="showWinner" class="mr-4" v-if="item.winner">获胜: {{ item.winner }}</b-link>
                  <b-button @click="addShow()" variant="success" class="mr-2" v-if="item.status === '0' && item.paid != item.price && item.start == account.name">更新</b-button>
                  <b-button @click="likeShow(item.id)" variant="danger" class="mr-2" :disabled="!!item.winner">赞</b-button>
                  <b-button @click="joinShow(item.id)" class="mr-2" variant="primary" :disabled="!!item.winner">拼</b-button>
                  <b-button
                    @click="verify(item)"
                    v-if="Number(item.paid.split(' ')[0].replace('.', '')) + Number(item.liked.split(' ')[0].replace('.', '')) === Number(item.price.split(' ')[0].replace('.', '')) && !item.winner"
                    variant="primary"
                    :disabled="submitLoading"
                    >开奖<b-spinner v-show="submitLoading" small type="grow"></b-spinner
                  ></b-button>
                </div>
              </div>
            </div>
          </b-card>
        </div>
        <div class="col-lg-6 col-md-6 col-sm-6">
          <h4 class="m-4">参与记录</h4>
          <b-list-group class="text-primary">
            <b-list-group-item v-for="(record, index) in records" :key="index"
              >ID{{ record.id }}. <strong>{{ record.player }}</strong> 在 {{ moment(record.dateline / 1000).format('YYYY-MM-DD HH:mm:ss') }} 参与 <em>{{ record.pay }}</em> win ID
              {{ String(record.winid).substr(record.gameid === 0 ? 0: String(record.gameid).length) }}</b-list-group-item
            >
          </b-list-group>
        </div>
      </div>
      <div class="row m-4">
        <div class="col-lg-12 col-md-12 col-sm-6">
          <h3>商品详情 <em>暂无</em></h3>
          <a :href="item.url"><b-badge variant="primary"> 物品链接跳转 ></b-badge></a>
        </div>
      </div>
    </main>
    <b-modal v-model="tranHash" centered :hide-header="!tranTitle" :title="tranTitle" hide-footer>
      <div :class="tranText" style="word-wrap: break-word">
        {{ tranMsg }}
      </div>
    </b-modal>
    <b-modal v-model="showJoin" centered title="我也来拼团" hide-footer>
      <!-- <b-form @submit.stop.prevent="joinGame">
        <b-form-group id="exampleInputGroup2" :label="`剩余参与${paySym}数量:${rangePayMax} ${paySym}`" label-for="rangePay">
          <b-form-input id="rangePay" v-model="payToken" type="range" :disabled="rangePayMin===rangePayMax" :min="rangePayMin === rangePayMax ? 0: rangePayMin" :max="rangePayMax"></b-form-input>
          <div class="mt-2">参与: {{ parseInt(payToken).toFixed(tokenLength) }} {{paySym}}</div>
        </b-form-group>
        <b-button type="submit" variant="primary" block>Submit<b-spinner v-show="submitLoading" small type="grow"></b-spinner></b-button>
      </b-form> -->
      <join-game-form :paySym="paySym" :joinGame="joinGame" v-model="payToken" :rangePayMin="rangePayMin" :rangePayMax="rangePayMax" :tabTokens="tabTokens" :submitLoading="submitLoading" />
    </b-modal>
    <b-modal v-model="showLike" centered title="我来赞助" hide-footer>
      <!-- <b-form @submit.stop.prevent="likeGame">
        <b-form-group id="exampleInputGroup2" :label="`剩余赞助${paySym}数量:${rangePayMax} ${paySym}`" label-for="rangePay">
          <b-form-input id="rangePay" v-model="payToken" type="range" :min="rangePayMin" :max="rangePayMax"></b-form-input>
          <div class="mt-2">赞助: {{ parseInt(payToken).toFixed(4) }} {{paySym}}</div>
        </b-form-group>
        <b-button type="submit" variant="primary" block>Submit<b-spinner v-show="submitLoading" small type="grow"></b-spinner></b-button>
      </b-form> -->
      <like-game-form :paySym="paySym" :likeGame="likeGame" v-model="payToken" :rangePayMin="rangePayMin" :rangePayMax="rangePayMax" :tabTokens="tabTokens" :submitLoading="submitLoading" />
    </b-modal>

    <b-modal v-model="modal" centered>
      <div class="text-info">{{ modalMsg }}</div>
    </b-modal>
    <b-modal v-model="updateForm" centered hide-footer>
      <b-form @submit.stop.prevent="onSubmit" @reset="onReset">
        <b-form-group id="exampleInputGroup1" label="拍品标题:" label-for="名称">
          <b-form-input id="titleInput" type="text" v-model="form.title" required placeholder=""> </b-form-input>
        </b-form-group>
        <b-form-group id="exampleInputGroup2" label="首图URL:" label-for="picInput" :invalid-feedback="invalidPic">
          <b-form-input id="picInput" type="text" v-model="form.pic" required :state="statePic" placeholder=""> </b-form-input>
        </b-form-group>
        <b-form-group id="exampleInputGroup3" label="商品URL:" label-for="urlInput" :invalid-feedback="invalidUrl">
          <b-form-input id="urlInput" type="text" v-model="form.url" :state="stateUrl" required placeholder=""> </b-form-input>
        </b-form-group>
        <b-form-group id="exampleInputGroup4" :label="`FO: ${form.price} + FO/USDT:${rate}`" label-for="cncInput">
          <b-form-input id="cncInput" v-model="cncform" type="number" min="10.00" required placeholder=""> </b-form-input>
        </b-form-group>
        <b-button type="reset" variant="danger" block>Reset</b-button>
        <b-button type="submit" variant="primary" block>Submit<b-spinner v-show="submitLoading" small type="grow"></b-spinner></b-button>
      </b-form>
    </b-modal>
    <b-modal v-model="ruleShow" @ok="handleOk" centered title="幸运肥波拼拼拼">
      <b-list-group class="text-danger">
        <b-list-group-item v-for="(item, index) in $t('foRules')" :key="index">{{ item }}</b-list-group-item>
      </b-list-group>
    </b-modal>
    <b-modal v-model="winnerShow" @ok="handleOk" centered title="开奖过程">
      <b-list-group class="text-primary" v-if="item">
        <b-list-group-item v-for="(record, index) in records" :key="index">
          ({{ record.player }} paid {{ record.pay }}) win ID {{ String(record.winid).substr(record.gameid === 0? 0: String(record.gameid).length) }}</b-list-group-item
        >
        <b-list-group-item v-if="item.winner">
          ethHash <a :href="`https://cn.etherscan.com/block/0x${item.status.split(',')[4]}`"> 0x{{ item.status.split(',')[4].substr(0, 8) }}... </a> % paid ({{ playerPaid }}) = <span class="text-success">{{ luckyNum }} </span>Lucky
          ({{ item.winner }})
        </b-list-group-item>
      </b-list-group>
    </b-modal>
    <v-loading v-show="loading"></v-loading>
  </div>
</template>

<script>
const Fo = require('fibos.js')
import LoadingModal from './Loading/LoadingModal.vue'
import MyHeader from './Header/Index.vue'
import JoinGameForm from './Form/JoinGame.vue'
import LikeGameForm from './Form/LikeGame.vue'
import lodashGet from 'lodash/get'
import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'
const moment = require('moment')
Vue.use(VueClipboard)

const foMainChain = '6aa7bd33b6b45192465afa3553dedb531acaaff8928cf64b70bd4c5e49b7ec6a'
const foTestChain = '68cee14f598d88d340b50940b6ddfba28c444b46cd5f33201ace82c78896793a'

export default {
  name: 'LuckydogDetail',
  components: {
    'v-loading': LoadingModal,
    'my-header': MyHeader,
    'join-game-form': JoinGameForm,
    'like-game-form': LikeGameForm,
  },
  computed: {
    rangePayMin() {
      if (!this.item.price) {
        return 1
      }
      return 1 / 10 ** this.item.paid.split(' ')[0].split('.')[1].length

      // const price = this.item.price
      // const priceAsset = price.split(' ')
      // const remind = priceAsset[0] - this.item.paid.split(' ')[0] - this.item.liked.split(' ')[0]
      // if (remind == 0) {
      //   return 0
      // }
      // const cMin = Math.ceil(priceAsset[0] * 0.05)
      // let min = remind / 100
      // if (min < cMin) {
      //   min = cMin
      //   if (min > remind) {
      //     min = remind
      //   }
      // }
      // return min
    },
    rangePayMax() {
      if (!this.item.price) {
        return 1
      }
      const price = this.item.price
      const priceAsset = price.split(' ')
      const max = Number(priceAsset[0] - this.item.paid.split(' ')[0] - this.item.liked.split(' ')[0]).toFixed(priceAsset[0].split('.')[1].length)
      return max
    },
  },
  mounted() {
    document.title = 'Luckydog'
    if (this.$route.query.debug == 'fo') {
      this.selectNet = 'foTest'
    }
    this.initIronman()
    if (!localStorage.getItem('showRule')) {
      this.ruleShow = true
      localStorage.setItem('showRule', 1)
    }
    const foNetwork = this.network['foMain']
    this.fomain = this.fo = Fo({
      chainId: this.chains['foMain'],
      httpEndpoint: `${location.protocol}//${foNetwork.reqHost}:${location.protocol === 'http:' ? foNetwork.port : foNetwork.reqPort}`,
    })
    this.reflesh()
    this.setRate(30)
  },
  data() {
    return {
      updateForm: false,
      form: {
        id: 0,
        pic: '',
        price: '0.0000 FO',
        url: '',
      },
      invalidPic: '',
      invalidUrl: '',
      stateUrl: true,
      statePic: true,
      cncform: 1,
      records: [],
      rate: '',
      modalMsg: '',
      modal: false,
      account: {},
      showJoin: false,
      requiredFields: '',
      fo: null,
      ref: null,
      loading: false,
      show: false,
      model: {
        mobile: '',
      },
      winner: '1',
      message: '',
      spocked: '',
      contractName: 'fibosluckdog',
      ironman: null,
      id: 0,
      payToken: (100).toFixed(4),
      paySym: 'FO',
      tokenLength: 4,
      gameId: 0,
      selectNet: 'foMain',
      chains: {
        foTest: foTestChain,
        foMain: foMainChain,
      },
      item: {
        paid: '',
        price: '',
        status,
      },
      modalInfo: { title: '', content: '' },
      ruleShow: false,
      tranHash: false,
      tranMsg: '',
      network: {
        foTest: {
          name: 'FO test',
          protocol: 'http',
          port: 80,
          reqPort: 80,
          host: 'api.testnet.fo',
          blockchain: 'fibos',
          chainId: foTestChain,
          reqHost: 'api.testnet.fo',
        },
        foMain: {
          name: 'FIBOS Mainnet',
          protocol: 'http',
          port: 80,
          reqPort: 443,
          host: 'api.fibos.rocks',
          blockchain: 'fibos',
          chainId: foMainChain,
          reqHost: 'rpc-mainnet.bitewd.com',
        },
      },
      copyData: '',
      submitLoading: false,
      showLike: false,
      winnerShow: false,
      playerPaid: 0,
      allSecret: '',
      luckyNum: 0,
      tranTitle: '',
      tranText: 'text-success',
      foPrice: 1,
      tabTokens: { FO: 4, FOUSDT: 6, FODAI: 8, FOETH: 8, FOUSDK: 6 },
      tokens: [
        { text: 'FO', value: 'FO' },
        { text: 'FOUSDT', value: 'FOUSDT' },
        { text: 'FODAI', value: 'FODAI' },
        { text: 'FOETH', value: 'FOETH' },
        { text: 'FOUSDK', value: 'FOUSDK' },
      ],
    }
  },
  methods: {
    showWinner() {
      this.winnerShow = true
    },
    onSubmit() {
      this.updateAction(this.form.id)
    },
    onReset() {},
    errMsg(e) {
      return typeof e === 'string' ? lodashGet(e.match(/Error: ([\S\s]*?)at/), '[1]', e) : JSON.stringify(e)
    },
    tranModal(show, msg, text, title) {
      if (msg) {
        this.tranMsg = msg
      }
      if (text) {
        this.tranText = text
      }
      if (title) {
        this.tranTitle = title
      } else {
        this.tranTitle = ''
      }
      this.tranHash = show
    },
    likeShow(id) {
      this.gameId = id
      if (this.rangePayMin > 0) {
        this.paySym = this.item.paid.split(' ')[1]
        this.payToken = this.rangePayMin
        this.showLike = true
      } else {
        this.modal = true
        this.modalMsg = '已结束'
      }
    },
    joinShow(id) {
      this.gameId = id
      if (this.rangePayMin > 0) {
        this.paySym = this.item.paid.split(' ')[1]
        this.payToken = this.rangePayMin
        this.showJoin = true
      } else {
        this.modal = true
        this.modalMsg = '已结束'
      }
    },
    addShow() {
      // this.updateForm = true
      // this.form.id = this.item.id
      this.$router.push('/')
      this.setRate(100)
    },
    async joinGame() {
      if (this.submitLoading) {
        return
      }
      this.submitLoading = true
      var message = `join,${this.gameId}`

      if (this.$route.query.ref) {
        message += `,${this.$route.query.ref}`
      }
      try {
        let contract = await this.fo.contract('eosio.token', {
          requiredFields: this.requiredFields,
        })
        let trx = await contract.transfer(this.account.name, this.contractName, `${Number(this.payToken).toFixed(this.tabTokens[this.paySym])} ${this.paySym}`, message)
        console.log(trx)
        const player = await this._getPlaying(this.account.name)
        if (player) {
          this.getGame(player.play_id)
        }
        this.tranModal(true, '参与成功', 'text-success')
        this.showJoin = false
      } catch (e) {
        this.tranModal(true, this.errMsg(e), 'text-danger', 'Play fail! replay!')
      }
      this.reflesh()
      this.submitLoading = false
    },
    async likeGame() {
      // 执行智能合约
      if (this.submitLoading) {
        return
      }
      this.submitLoading = true
      var message = `like,${this.gameId}`

      if (this.$route.query.ref) {
        message += `,${this.$route.query.ref}`
      }
      this.submitLoading = false
      // 执行智能合约
      try {
        let trx = await this.fo.transfer(this.account.name, this.contractName, `${Number(this.payToken).toFixed(this.tabTokens[this.paySym])} ${this.paySym}`, message)
        console.log(trx)
        const player = await this._getPlaying(this.account.name)
        if (player) {
          this.getGame(player.play_id)
        }
        this.tranModal(true, '参与成功', 'text-success')
        this.showJoin = false
      } catch (e) {
        this.tranModal(true, this.errMsg(e), 'text-danger', 'Play fail! replay!')
      }
      this.submitLoading = false
    },
    invite() {
      this.modal = true
      this.modalMsg = '复制成功：' + this.copyData
    },
    onCopy(e) {
      console.log(e)
      this.modal = true
      this.modalMsg = '复制成功：' + this.copyData
    },
    onError(e) {
      console.log(e)
    },
    Invest() {
      this.modal = true
      this.modalMsg = '复制成功：' + this.copyData
    },
    async getAccount(account = this.contractName) {
      const token = await this.fo.getTableRows(true, 'eosio.token', account, 'accounts', '', '', '')
      return token.rows
    },
    login() {
      this.reqIronman()
    },
    signout() {
      this.account = {}
      this.ironman.forgetIdentity(this.ironman.identity)
    },
    showRule() {
      this.ruleShow = true
    },
    handleOk() {},
    async updateAction(id) {
      // 执行智能合约
      try {
        const contract = await this.fo.contract(this.contractName, { requiredFields: this.requiredFields })
        const trx = await contract.update(id, this.form.price, this.form.title, this.form.url, this.form.pic, { authorization: this.account.name })
        console.log(trx)
        this.reflesh()
        this.tranModal(true, 'Play success! Wait for verify!', 'text-success')
      } catch (e) {
        this.tranModal(true, this.errMsg(e), 'text-danger', 'Play fail! replay!')
      }
      this.submitLoading = false
      this.updateForm = false
    },
    async verify(item) {
      this.submitLoading = true
      try {
        const contract = await this.fo.contract(this.contractName, { requiredFields: this.requiredFields })
        const trx = await contract.verify(item.id, { authorization: this.account.name })
        console.log(trx)
        this.tranModal(true, 'Play success! Wait for verify!', 'text-success')
      } catch (e) {
        this.tranModal(true, this.errMsg(e), 'text-danger', 'Play fail! replay!')
      }
      this.submitLoading = false
      this.reflesh()
    },
    async _getPlaying(player) {
      try {
        var res = await this.fo.getTableRows(true, this.contractName, this.contractName, 'players', 'account', player, -1, 1)
        if (res.rows && res.rows[0]) {
          let player = res.rows[0]
          return player
        }
      } catch (e) {
        console.log(e)
        return null
      }
    },
    async getGame(id) {
      try {
        const res = await this.fo.getTableRows(true, this.contractName, this.contractName, 'games', 'id', id, id, 1)
        if (res.rows && res.rows[0]) {
          this.item = res.rows[0]
        }
      } catch (e) {
        console.log(e)
      }
    },
    async getRecords(gameid) {
      const res = await this.fo.getTableRows(true, this.contractName, this.contractName, 'records', 'id', gameid, gameid, 100, 'i64', 2, true)
      this.records = res.rows
    },
    initIronman() {
      if (window.ironman) {
        this.ironman = window.ironman
        this.reqIronman()
      } else {
        document.addEventListener('ironmanLoaded', () => {
          window.ironman.fo = window.ironman.eos
          this.ironman = window.ironman
          this.reqIronman()
        })
      }
    },
    async reqIronman() {
      const ironman = this.ironman
      const foNetwork = this.network[this.selectNet]

      const RequirefoNetwork = {
        blockchain: foNetwork.blockchain,
        chainId: this.chains[this.selectNet],
        host: foNetwork.host,
        port: foNetwork.reqPort,
        protocol: foNetwork.http,
      }

      try {
        let identity = await ironman.getIdentity({ accounts: [RequirefoNetwork] })
        console.log('get identity')
        const account = identity.accounts.find(acc => acc.blockchain === 'fibos')
        // FO参数
        // FO参数
        const foOptions = {
          broadcast: true,
          chainId: this.chains[this.selectNet],
        }
        //获取FO instance
        if (this.selectNet === 'foMain') {
          if (location.protocol === 'https:') {
            foNetwork.host = foNetwork.reqHost
            foNetwork.port = 443
            foNetwork.protocol = 'https'
          } else {
            foNetwork.host = foNetwork.reqHost
            foNetwork.port = 80
            foNetwork.protocol = 'http'
          }
        }
        const fo = ironman.fibos(foNetwork, Fo, foOptions, foNetwork.protocol)
        const requiredFields = {
          accounts: [foNetwork],
        }

        this.fo = fo

        this.requiredFields = requiredFields
        this.account = account
        this.copyData = 'http://luckydog.qingah.com/#/'
        this.reflesh()
        this.copyData += 'detail/' + this.$route.params.id
        this.copyData += '?ref=' + this.account.name
      } catch (e) {
        console.log('error', e)
      }
    },
    async reflesh() {
      const id = parseInt(this.$route.params.id)
      await this.getGame(id)
      await this.getRecords(id)
    },
    resetModal() {
      this.modalInfo.title = ''
      this.modalInfo.content = ''
    },
    async getfoPrice() {
      let swapmarket
      try {
        swapmarket = await this.fomain.getTableRows(true, 'eosio.token', 'eosio.token', 'swapmarket', '', '0', '1', 1)
      } catch (e) {
        return null
      }
      const {
        tokenx: { quantity: quantityx },
        tokeny: { quantity: quantityy },
      } = swapmarket.rows[0]
      const usdtprice = Number(quantityx.split(' ')[0])
      const foprice = Number(quantityy.split(' ')[0])
      this.foPrice = usdtprice / foprice
      return this.foPrice
    },
    async setRate(newForm) {
      if (this.foPrice) {
        this.form.price = parseInt(newForm / this.foPrice) + '.0000 FO'
        this.rate = this.foPrice.toFixed(6)
      }
    },
    moment,
    lodashGet,
  },
  watch: {
    form: {
      handler(newForm) {
        if (newForm.pic) {
          if (/^https?:\/\/.+/.test(newForm.pic)) {
            this.statePic = true
            this.invalidPic = ''
          } else {
            this.statePic = false
            this.invalidPic = '填入正确http(s)://网址'
          }
        }
        if (newForm.url) {
          if (/^https?:\/\/.+/.test(newForm.url)) {
            this.stateUrl = true
            this.invalidUrl = ''
          } else {
            this.stateUrl = false
            this.invalidUrl = '填入正确http(s)://网址'
          }
        }
      },
      deep: true,
    },
    async cncform(newForm) {
      this.getfoPrice()
      this.setRate(newForm, this.foPrice)
    },
    item(newVal) {
      if (newVal.paid) {
        const allSecret = newVal.status && newVal.status.split(',')[4] ? newVal.status.split(',')[4] : 0
        const paidAsset = newVal.paid.split(' ')
        this.luckyNum = (window.BigInt(`0x${allSecret}`) % window.BigInt(Number(paidAsset[0].replace('.', '')))) //  * window.BigInt(10 ** paidAsset[0].split('.')[1].length
        this.allSecret = allSecret
        this.playerPaid = newVal.paid
      }
    },
    $route(to) {
      console.log(to)
      // this.getIndex(to.params.id)
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.img-box {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 95%;
}
.img-box img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 95%;
}
</style>
