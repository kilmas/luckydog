<template>
  <div>
    <my-header :account="account" :copyData="copyData" :onCopy="onCopy" v-bind:onError="onError" :myGameList="myGameList" :addShow="addShow" :showRule="showRule" :login="login" :signout="signout" />
    <main>
      <div class="row m-1">
        <div class="col-lg-3 col-md-6 col-sm-6" v-for="(item, index) in filterItems" :key="item.id">
          <b-card tag="article" class="mb-2">
            <a :href="item.url">
              <div class="img-box"><b-card-img :src="item.pic" alt="Image" top></b-card-img></div>
              <b-card-title class="mt-4">{{ item.title }}</b-card-title>
            </a>
            <p class="card-text" v-if="item.desc">
              {{ item.desc }}
            </p>
            <div class="row">
              <div class="col-md-12">
                <b-input-group size="sm" :prepend="item.paid.split(' ')[1]" :append="`Return ${item.rate}%`">
                  <b-form-input readonly :value="Number(item.price.split(' ')[0])"></b-form-input>
                </b-input-group>
                <br />
                <b-progress :max="Number(item.price.split(' ')[0])" show-progress animated>
                  <b-progress-bar
                    :value="Number(item.paid.split(' ')[0]) + Number(item.liked.split(' ')[0])"
                    :label="`${(((Number(item.paid.split(' ')[0]) + Number(item.liked.split(' ')[0])) / Number(item.price.split(' ')[0])) * 100).toFixed(2)}%`"
                  ></b-progress-bar>
                </b-progress>
              </div>
              <div class="col-md-12">
                <div class="text-right pt-4" style="min-height: 80px">
                  <span v-if="item.winner" class="text-info mr-2"
                    >Winner: <strong>{{ item.winner }}</strong></span
                  >
                  <router-link :to="{ name: 'LuckydogDetail', params: { id: item.id }, query: $route.query }" class="mr-2">参与细节...</router-link>
                  <b-button @click="addShow(item.id)" variant="success" class="mr-2" v-if="item.status === '0' && item.start == account.name">更新</b-button>
                  <b-button @click="likeShow(index, item.id)" v-if="!item.winner" variant="danger" class="mr-2">赞</b-button>
                  <b-button @click="joinShow(index, item.id)" v-if="!item.winner" variant="primary">拼</b-button>
                </div>
              </div>
            </div>
          </b-card>
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
        <b-form-group id="exampleInputGroup1" :label="`剩余参与Token数量:${rangePayMax} ${paySym}`" label-for="rangePay">
          <b-form-input id="rangePay1" v-model="payToken" :disabled="rangePayMin === rangePayMax" :min="rangePayMin" :max="rangePayMax"></b-form-input>
          <b-form-input id="rangePay2" v-model="payToken" type="range" :disabled="rangePayMin === rangePayMax" :step="1 / (10 ** (tabTokens[paySym] - 4))" :min="rangePayMin" :max="rangePayMax"></b-form-input>
          <div class="mt-2">参与: {{ Number(payToken).toFixed(tabTokens[paySym]) }} {{ paySym }}</div>
        </b-form-group>
        <b-button type="submit" variant="primary" block :disabled="submitLoading">Submit<b-spinner v-show="submitLoading" small type="grow"></b-spinner></b-button>
      </b-form> -->
      <join-game-form :paySym="paySym" :joinGame="joinGame" v-model="payToken" :rangePayMin="rangePayMin" :rangePayMax="rangePayMax" :tabTokens="tabTokens" :submitLoading="submitLoading" />
    </b-modal>
    <b-modal v-model="showLike" centered title="赞是赞助的赞，当然当作点赞也没问题，来赞它点Token" hide-footer>
      <!-- <b-form @submit.stop.prevent="likeGame">
        <b-form-group id="exampleInputGroup2" :label="`剩余赞助Token数量:${rangePayMax} ${paySym}`" label-for="rangePay">
          <b-form-input id="rangePay3" v-model="payToken" :min="rangePayMin" :max="rangePayMax"></b-form-input>
          <b-form-input id="rangePay4" v-model="payToken" type="range" :disabled="rangePayMin === rangePayMax" :step="1 / (10 ** (tabTokens[paySym] - 4))" :min="rangePayMin" :max="rangePayMax"></b-form-input>
          <div class="mt-2">赞助: {{ Number(payToken).toFixed(4) }} {{ paySym }}</div>
        </b-form-group>
        <b-button type="submit" variant="primary" block>Submit<b-spinner v-show="submitLoading" small type="grow"></b-spinner></b-button>
      </b-form> -->
      <like-game-form :paySym="paySym" :likeGame="likeGame" v-model="payToken" :rangePayMin="rangePayMin" :rangePayMax="rangePayMax" :tabTokens="tabTokens" :submitLoading="submitLoading" />
    </b-modal>
    <b-modal v-model="formShow" centered hide-footer title="增加拼购商品">
      <b-form @submit.stop.prevent="addGame">
        <b-form-group id="exampleInputGroup3" :label="`参与:${paySym}`" label-for="payTokenInput">
          <b-input-group size="sm">
            <b-form-input id="payTokenInput" type="text" v-model="payToken" required placeholder=""> </b-form-input>
            <b-input-group-append>
              <b-form-select v-model="paySym" :options="tokens" size="sm h-100"></b-form-select>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group id="exampleInputGroup6" :label="`返奖率:${payRate}%`" label-for="payTokenInput">
          <b-form-input id="payRateInput" type="range" v-model="payRate" min="50" max="99" required placeholder="50-99"> </b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary" block :disabled="submitLoading">Submit<b-spinner v-show="submitLoading" small type="grow"></b-spinner></b-button>
      </b-form>
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
        <b-form-group id="exampleInputGroup4" label="价格Token:" label-for="tokenInput">
          <b-input-group>
            <b-form-input id="tokenInput" type="text" v-model="form.price" :state="stateToken" required placeholder=""> </b-form-input>
            <b-input-group-append>
              <b-form-select :value="form.paySym" disabled :options="tokens" size="sm h-100"></b-form-select>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group id="exampleInputGroup5" :label="`商品价格/price(FO): ${(cncform / rate).toFixed(4)} (FO/USDT:${rate})`" label-for="cncInput">
          <b-input-group size="sm" append="USDT转换FO" prepend="$">
            <b-form-input id="cncInput" v-model="cncform" type="number" min="10.00" required placeholder=""> </b-form-input>
          </b-input-group>
        </b-form-group>
        <b-button type="reset" variant="danger" block>Reset</b-button>
        <b-button type="submit" variant="primary" :disabled="submitLoading" block>Submit<b-spinner v-show="submitLoading" small type="grow"></b-spinner></b-button>
      </b-form>
    </b-modal>
    <b-modal v-model="ruleShow" @ok="handleOk" centered title="幸运肥波拼拼拼">
      <b-list-group class="text-danger">
        <b-list-group-item v-for="(item, index) in $t('foRules')" :key="index">{{ item }}</b-list-group-item>
      </b-list-group>
    </b-modal>
    <v-loading v-show="loading"></v-loading>
  </div>
</template>

<script>
// import axios from 'axios'
const Fo = require('fibos.js')
import lodashGet from 'lodash/get'
import LoadingModal from './Loading/LoadingModal.vue'
import MyHeader from './Header/Index.vue'
// import AddGameForm from './Form/AddGame.vue'
import JoinGameForm from './Form/JoinGame.vue'
import LikeGameForm from './Form/LikeGame.vue'

import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

// const ecc = Fo.modules.ecc;

const items = []

const foMainChain = '6aa7bd33b6b45192465afa3553dedb531acaaff8928cf64b70bd4c5e49b7ec6a'
const foTestChain = '68cee14f598d88d340b50940b6ddfba28c444b46cd5f33201ace82c78896793a'

export default {
  name: 'Luckydog',
  components: {
    'v-loading': LoadingModal,
    'my-header': MyHeader,
    // 'add-game-form': AddGameForm,
    'join-game-form': JoinGameForm,
    'like-game-form': LikeGameForm,
  },
  computed: {
    filterItems() {
      if (!this.items.length) {
        return []
      }
      return this.items.filter(item => item.status.substr(0, 1) !== '0')
    },
    rangePayMin() {
      if (!this.filterItems.length) {
        return 1
      }
      return 1 / 10 ** this.filterItems[this.gameIndex].paid.split(' ')[0].split('.')[1].length

      // const price = this.filterItems[this.gameIndex].price
      // const priceAsset = price.split(' ')
      // const remind = priceAsset[0] - this.filterItems[this.gameIndex].paid.split(' ')[0] - this.filterItems[this.gameIndex].liked.split(' ')[0]
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
      if (!this.filterItems.length) {
        return 1
      }
      const item = this.filterItems[this.gameIndex]
      const price = item.price
      const priceAsset = price.split(' ')
      const tokenLength = priceAsset[0].split('.')[1].length
      const max = (Number(priceAsset[0].replace('.', '') - item.paid.split(' ')[0].replace('.', '')  - item.liked.split(' ')[0].replace('.', '')) / (10 ** tokenLength)).toFixed(tokenLength)
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
    // this.setRate(30)
    this.reflesh()
  },
  data() {
    return {
      formShow: false,
      showLike: false,
      updateForm: false,
      form: {
        id: 0,
        pic: '',
        price: '0.0000 FO',
      },
      tranText: 'text-success',
      invalidPic: '',
      invalidUrl: '',
      stateToken: true,
      stateUrl: true,
      statePic: true,
      cncform: 30,
      counter: 33,
      max: 100,
      assets: [],
      rate: '',
      modalMsg: '',
      modal: false,
      tabIndex: 0,
      query: {},
      account: {},
      showJoin: false,
      requiredFields: '',
      fo: null,
      ref: null,
      loading: false,
      submitLoading: false,
      show: false,
      model: {
        mobile: '',
      },
      winner: '1',
      message: '',
      payRate: 95,
      contractName: 'fibosluckdog',
      ironman: null,
      id: 0,
      timeV: null,
      payToken: (10).toFixed(4),
      paySym: 'FO',
      tokenLength: 4,
      gameId: 0,
      gameIndex: 0,
      myGameList: [],
      variants: ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'light', 'dark'],
      selectNet: 'foMain',
      chains: {
        foTest: foTestChain,
        foMain: foMainChain,
      },
      items: items,
      currentPage: 1,
      perPage: 10,
      totalRows: items.length,
      sortBy: null,
      sortDesc: false,
      sortDirection: 'asc',
      filter: null,
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
          host: 'testnet.fo',
          blockchain: 'fibos',
          chainId: foTestChain,
        },
        foMain: {
          name: 'FIBOS Mainnet',
          protocol: 'http',
          port: 80,
          reqPort: 443,
          blockchain: 'fibos',
          host: 'rpc-mainnet.bitewd.com',
          reqHost: 'rpc-mainnet.bitewd.com',
          chainId: foMainChain,
        },
      },
      copyData: '',
      audio: null,
      tranTitle: '',
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
    async reflesh() {
      await this.getMyJoin()
    },
    likeShow(index, id) {
      this.gI = index
      this.gameId = id
      if (this.rangePayMin > 0) {
        this.paySym = this.filterItems[index].paid.split(' ')[1]
        this.payToken = this.rangePayMin
        this.showLike = true
      } else {
        this.modal = true
        this.modalMsg = '已结束'
      }
    },
    joinShow(index, id) {
      this.gameIndex = index
      this.gameId = id
      if (this.rangePayMin > 0) {
        this.paySym = this.filterItems[index].paid.split(' ')[1]
        this.payToken = this.rangePayMin
        this.showJoin = true
      } else {
        this.modal = true
        this.modalMsg = '已结束'
      }
    },
    setiItem(item) {
      this.updateForm = true
      this.form.id = item.id
      const payAsset = item.paid.split(' ')
      this.$set(this.form, 'price', payAsset[0] * 2)
      this.$set(this.form, 'title', item.title)
      this.$set(this.form, 'url', item.url)
      this.$set(this.form, 'pic', item.pic)
      this.$set(this.form, 'paySym', payAsset[1])
      this.paySym = payAsset[1]
    },
    addShow(id) {
      let item = this.myGameList[0]
      if (id > -1) {
        item = this.items.find(item => item.id === id)
        this.setiItem(item)
      } else if (item && item.status === '0') {
        this.setiItem(item)
      } else {
        this.formShow = true
      }
      // this.setRate(30)
    },
    async joinGame() {
      this.submitLoading = true
      var message = `join,${this.gameId}`
      if (this.$route.query.ref) {
        message += `,${this.$route.query.ref}`
      }
      // 执行智能合约
      try {
        let trx = await this.fo.transfer(this.account.name, this.contractName, `${Number(this.payToken).toFixed(this.tabTokens[this.paySym])} ${this.paySym}`, message)
        console.log(trx)
        const player = await this._getPlaying(this.account.name)
        if (player) {
          this.getGame(player.play_id)
        }
        this.reflesh()
        this.tranModal(true, '参与成功', 'text-success')
        //
        this.showJoin = false
      } catch (e) {
        this.tranModal(true, this.errMsg(e), 'text-danger', 'Play fail! replay!')
      }
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
      // 执行智能合约
      try {
        let trx = await this.fo.transfer(this.account.name, this.contractName, `${Number(this.payToken).toFixed(this.tabTokens[this.paySym])} ${this.paySym}`, message)
        console.log(trx)
        const player = await this._getPlaying(this.account.name)
        if (player) {
          this.getGame(player.play_id)
        }
        this.tranModal(true, '赞助成功', 'text-success')
        this.showJoin = false
      } catch (e) {
        this.tranModal(true, this.errMsg(e), 'text-danger', 'Play fail! replay!')
      }
      this.submitLoading = false
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
    async addGame() {
      if (this.submitLoading) {
        return
      }
      this.submitLoading = true
      var message = `start,${this.payRate}`

      if (this.$route.query.ref) {
        message += `,${this.$route.query.ref}`
      }
      // 执行智能合约
      try {
        let trx = await this.fo.transfer(this.account.name, this.contractName, `${Number(this.payToken).toFixed(this.tabTokens[this.paySym])} ${this.paySym}`, message)
        console.log(trx)
        const player = await this._getPlaying(this.account.name)
        if (player) {
          await this.reflesh()
          this.addShow(player.play_id)
        }
      } catch (e) {
        this.tranModal(true, this.errMsg(e), 'text-danger', 'Play fail! replay!')
      }
      this.formShow = false
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
    async getAccount(account = 'fibosluckdog') {
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
      this.submitLoading = true
      try {
        const contract = await this.fo.contract(this.contractName, { requiredFields: this.requiredFields })
        const trx = await contract.update(id, `${Number(this.form.price).toFixed(this.tabTokens[this.paySym])} ${this.form.paySym}`, this.form.title, this.form.url, this.form.pic, {
          authorization: this.account.name,
        })
        console.log(trx)
        this.reflesh()
        this.tranModal(true, 'Play success! Wait for verify!', 'text-success')
      } catch (e) {
        this.tranModal(true, this.errMsg(e), 'text-danger', 'Play fail! replay!')
      }
      this.updateForm = false
      this.submitLoading = false
      this.reflesh()
    },
    async _getPlaying(player) {
      try {
        var res = await this.fo.getTableRows(true, this.contractName, this.contractName, 'players', 'account', player, player, 1)
        if (res.rows && res.rows[0]) {
          let player = res.rows[0]
          return player
        }
      } catch (e) {
        console.log(e)
        return null
      }
    },
    async getMyJoin() {
      try {
        const res = await this.fo.getTableRows(true, this.contractName, this.contractName, 'games', 'id', '', '', 50, 'i64', 1, true)
        this.items = res.rows
        this.myGameList = []
        res.rows.forEach(element => {
          if (element.start === this.account.name) {
            this.myGameList.push(element)
          }
        })
      } catch (e) {
        console.error(e)
      }
    },
    showWithdraw() {
      this.show = true
    },
    async withdraw(id) {
      try {
        let contract = await this.fo.contract(this.contractName, {
          requiredFields: this.requiredFields,
        })
        let trx = contract.withdraw(id, { authorization: this.account.name })
        console.log('1.获取签名后的交易，前端需要将此数据传入后台', trx)
        this.tranModal(true, 'withdraw success!', 'text-success')
      } catch (e) {
        this.tranModal(true, this.errMsg(e), 'text-danger', 'withdraw fail! Wait for verify!')
      }
    },
    async getGame(id) {
      try {
        const res = await this.fo.getTableRows(true, this.contractName, this.contractName, 'games', 'id', id, id + 1, 1)
        if (res.rows && res.rows[0]) {
          let unshift = true
          for (var i in this.items) {
            if (this.items[i].id == id) {
              this.$set(this.items, i, res.rows[0])
              // this.items[i] = res.rows[0];
              unshift = false
              break
            }
          }
          if (unshift) {
            this.items.unshift(res.rows[0])
          }
        }
      } catch (e) {
        console.log(e)
      }
    },
    initIronman() {
      if (window.ironman) {
        this.ironman = window.ironman
        this.reqIronman()
      } else {
        document.addEventListener('ironmanLoaded', () => {
          // console.log("extension load", ironmanExtension);
          // 防止别的网页应用 调用window.ironman 对象
          window.ironman.fo = window.ironman.eos
          this.ironman = window.ironman
          // If you want to require a specific version of Scatter
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
        // protocol: foNetwork.protocol,
        host: foNetwork.host,
        port: foNetwork.reqPort,
        protocol: foNetwork.http,
      }

      // 给用户推荐网络， 第一次需要授权
      // ironman.suggestNetwork(foNetwork);
      // ironman.getIdentity 用户授权页面
      try {
        let identity = await ironman.getIdentity({ accounts: [RequirefoNetwork] })
        console.log('get identity')
        const account = identity.accounts.find(acc => acc.blockchain === 'fibos')
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
        this.copyData = 'https://luckydog.qingah.com/?ref=' + this.account.name
        this.reflesh()
      } catch (e) {
        console.log('error', e)
      }
    },
    init() {},
    resetModal() {
      this.modalInfo.title = ''
      this.modalInfo.content = ''
    },
    async setRate() {
      this.getfoPrice()
      if (this.foPrice) {
        // this.form.price = parseInt(newForm / this.foPrice) + '.0000 FO'
        this.rate = this.foPrice.toFixed(6)
      }
    },
  },
  watch: {
    // payToken(newVal) {
    // if (Number(newVal) < 50) {
    //   this.payToken = (50).toFixed(4)
    // }
    // },
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
    cncform(newForm) {
      this.setRate(newForm)
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import url('//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css');
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
