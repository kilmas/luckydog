const CONTRACT_NAME = 'fibosluckdog'
const WIN_BLOCK = 25

const sendToken = function (to, quantity, memo) {
  trans.send_inline(
    'eosio.token',
    'transfer',
    {
      from: CONTRACT_NAME,
      to,
      quantity,
      memo,
    },
    [
      {
        actor: CONTRACT_NAME,
        permission: 'active',
      },
    ]
  )
}

const indexes = {
  game: [64, o => [o.gameid]],
  winid: [64, o => [o.winid]],
  player: [64, o => [o.player]],
}

const start_indexes = {
  account: [64, o => [o.start]],
}

const update_player = function (account, id, ref) {
  const players = db.players(CONTRACT_NAME, CONTRACT_NAME)
  const player = players.find(account)
  if (!player.data) {
    let data = {
      id: account,
      play_id: id,
      ref: '',
    }
    if (ref) {
      data.ref = ref
    }
    players.emplace(CONTRACT_NAME, data)
  } else {
    if (player.data.ref == '' && ref) {
      player.data.ref = ref
    }
    player.data.play_id = id
    player.update(CONTRACT_NAME)
  }
}

const _game = function (data) {
  return Object.assign(
    {
      id: 1,
      start: '',
      winner: '',
      dateline: '',
      status: '',
      price: '100.0000 FO',
      paid: '0.0000 FO',
      liked: '0.0000 FO',
      title: '',
      url: '',
      pic: '',
      rate: 95,
    },
    data
  )
}

/**
 * @param id
 * @returns
 */
exports.init = id => {
  action.require_auth(CONTRACT_NAME)
  console.log(id)
}

const removeMax = 20
/**
 * @param id
 * @returns
 */
exports.remove = id => {
  action.require_auth(CONTRACT_NAME)
  const games = db.games(CONTRACT_NAME, CONTRACT_NAME, start_indexes)
  const game = games.find(id)
  assert(!!game.data, 'No game id')
  assert(!!game.data.winner, 'No game winner')

  const records = db.records(CONTRACT_NAME, CONTRACT_NAME, indexes)

  let itr = records.indexes.game.find({ gameid: id })
  let i = 0
  while (itr.data) {
    let itr1 = itr
    itr = itr.next()
    if (parseInt(itr1.data.gameid) !== parseInt(id)) {
      break
    }
    itr1.remove()
    i++
    if (i > removeMax) {
      break
    }
  }
  if (i <= removeMax) {
    game.remove()
  }
}

const join_game = function (id, account, paying, ref) {
  const games = db.games(CONTRACT_NAME, CONTRACT_NAME, start_indexes)
  const game = games.find(id)
  assert(!!game.data, 'No game id')
  const likedAsset = game.data.liked.split(' ')
  const paidAsset = game.data.paid.split(' ')
  const assetLength = paidAsset[0].split('.')[1].length
  const priceAsset = game.data.price.split(' ')
  const payAsset = paying.split(' ')
  assert(payAsset[1] === paidAsset[1], 'Pay sym not right')
  const remain = Number(priceAsset[0].replace('.', '') - paidAsset[0].replace('.', '') - likedAsset[0].replace('.', ''))
  const payAmount = Number(payAsset[0].replace('.', ''))
  assert(payAmount <= remain, 'Pay amount too high')
  assert(game.data.status.substr(0, 1) === '1', 'Not start status!')

  if (payAmount === remain) {
    const blocks = db.blocks('eosio.cross', 'eosio.cross')
    const block = blocks.find(Number(blocks.get_primary_key()) - 1)
    assert(!!block.data, 'No last block')
    game.data.status = `1,${block.data.nonce},${block.data.number},${action.publication_time / 1000}`
    assert(action.publication_time / 1000000 - parseInt(block.data.timestamp, 16) < 240, 'Eth current hash timestamp too old, please replay!')
  }

  const paid = BigInt(paidAsset[0].replace('.', '')) + BigInt(payAsset[0].replace('.', ''))
  const paid_index = paid.toString()
  game.data.paid = `${(Number(paid) / 10 ** assetLength).toFixed(assetLength)} ${paidAsset[1]}`

  const records = db.records(CONTRACT_NAME, CONTRACT_NAME, indexes)
  const rid = records.get_primary_key()
  records.emplace(CONTRACT_NAME, {
    id: rid,
    gameid: id,
    player: account,
    dateline: action.publication_time,
    pay: paying,
    winid: Number(`${id}${paid_index}`),
  })

  game.update(CONTRACT_NAME)
  update_player(account, id, ref)
}

const like_game = function (id, paying) {
  const games = db.games(CONTRACT_NAME, CONTRACT_NAME, start_indexes)
  const game = games.find(id)
  const likedAsset = game.data.liked.split(' ')
  const assetLength = likedAsset[0].split('.')[1].length
  const priceAsset = game.data.price.split(' ')
  const payAsset = paying.split(' ')
  const paidAsset = game.data.paid.split(' ')

  assert(likedAsset[1] === payAsset[1], 'Not asset sym!')
  const remain = Number(priceAsset[0].replace('.', '') - paidAsset[0].replace('.', '') - likedAsset[0].replace('.', ''))
  assert(Number(payAsset[0].replace('.', '')) < remain, 'Like too high')
  assert(game.data.status.substr(0, 1) === '1', 'Not start yet!')

  game.data.liked = `${(Number(likedAsset[0]) + Number(payAsset[0])).toFixed(assetLength)} ${likedAsset[1]}`
  game.update(CONTRACT_NAME)
}

/**
 * @param account
 * @param pay
 * @param ref
 */
const _start = (player, pay, _rate, ref) => {
  const games = db.games(CONTRACT_NAME, CONTRACT_NAME, start_indexes)
  const id = games.get_primary_key()

  const rate = parseInt(_rate)
  assert(rate > 1 && rate < 100, 'Return Win Rate 1-100')
  const payAsset = pay.split(' ')
  const payLength = payAsset[0].split('.')[1].length
  const data = _game({
    id,
    start: player,
    dateline: action.publication_time,
    status: '0',
    price: pay,
    paid: pay,
    rate,
    liked: `${Number(0).toFixed(payLength)} ${payAsset[1]}`,
  })
  games.emplace(CONTRACT_NAME, data)

  const records = db.records(CONTRACT_NAME, CONTRACT_NAME, indexes)
  const record_id = records.get_primary_key()

  records.emplace(CONTRACT_NAME, {
    id: record_id,
    gameid: id,
    player,
    dateline: action.publication_time,
    pay,
    winid: Number(`${id}${Number(payAsset[0].replace('.', ''))}`),
  })
  update_player(player, id, ref)
}

/**
 * @param from
 * @param to
 * @param amount
 * @param memo
 * @returns
 */
exports.on_transfer = (from, to, amount, memo) => {
  if (from === CONTRACT_NAME || to !== CONTRACT_NAME) {
    return
  }

  const params = memo.split(',')
  if (params[0] === 'start') {
    _start(from, amount, params[1], params[2])
  } else if (params[0] === 'join') {
    const gameid = parseInt(params[1])
    if (gameid > -1) {
      join_game(gameid, from, amount, params[2])
    }
  } else if (params[0] === 'like') {
    const gameid = parseInt(params[1])
    if (gameid > -1) {
      like_game(gameid, amount)
    }
  }
}

/**
 * @param id
 * @param price
 * @param title
 * @param url
 * @param pic
 */
exports.update = (id, price, title, url, pic) => {
  const account = action.authorization[0].actor

  const games = db.games(CONTRACT_NAME, CONTRACT_NAME, start_indexes)
  const game = games.find(id)
  assert(!!game.data, 'No game id')

  if (account == game.data.start) {
    action.require_auth(game.data.start)
  } else {
    action.require_auth(CONTRACT_NAME)
  }

  const gameAsset = game.data.price.split(' ')
  const priceAsset = price.split(' ')
  assert(gameAsset[1] === priceAsset[1], 'Asset sym not right!')
  assert(gameAsset[0].split('.')[1].length === priceAsset[0].split('.')[1].length, 'Asset sym not right!')

  if (Number(priceAsset[0]) > Number(gameAsset[0])) {
    game.data.price = price
    if (game.data.status === '0') {
      game.data.status = '1'
    }
  }
  if (pic) {
    game.data.pic = pic
  }
  if (title) {
    game.data.title = title
  }
  if (url) {
    game.data.url = url
  }
  game.update(CONTRACT_NAME)
}

/**
 * @param id
 *
 */
exports.verify = id => {
  const games = db.games(CONTRACT_NAME, CONTRACT_NAME, start_indexes)
  let game = games.find(id)

  assert(!!game.data, 'No game id')

  const blocks = db.blocks('eosio.cross', 'eosio.cross')
  const statusArr = game.data.status.split(',')
  const lastTime = statusArr[3] / 1000
  const nonce = statusArr[1]
  let block = blocks.find(Number(nonce) + WIN_BLOCK)
  while (block.data) {
    if (parseInt(block.data.timestamp, 16) < lastTime) {
      block = block.next()
    } else {
      break
    }
  }

  assert(!!block.data, 'Not eth block yet')

  const paidAsset = game.data.paid.split(' ')
  assert(BigInt(game.data.liked.split(' ')[0].replace('.', '')) + BigInt(paidAsset[0].replace('.', '')) === BigInt(game.data.price.split(' ')[0].replace('.', '')), 'Not finished yet')

  const records = db.records(CONTRACT_NAME, CONTRACT_NAME, indexes)
  const hashSecret = BigInt(`0x${block.data.tx_hash}`)
  const sum_paid = Number(paidAsset[0].replace('.', ''))
  const win = Number(hashSecret % BigInt(sum_paid))
  let witr = records.indexes.winid.upperbound({ winid: Number(`${id}${win}`) })
  while (witr.data) {
    if (parseInt(witr.data.gameid) === parseInt(id)) {
      break
    }
    witr = witr.next()
  }
  assert(!!witr.data, 'No record!')
  game.data.winner = witr.data.player
  const assetLength = paidAsset[0].split('.')[1].length
  const reward = `${((Number(game.data.price.split(' ')[0]) * Number(game.data.rate)) / 100).toFixed(assetLength)} ${paidAsset[1]}`
  sendToken(game.data.winner, reward, `Game ${game.data.id} WIN Number ${win}`)
  const status = game.data.status
  game.data.status = `2${status.substr(1)},${block.data.tx_hash}`
  game.update(CONTRACT_NAME)
}

exports.withdraw = id => {
  console.log(id)
}
