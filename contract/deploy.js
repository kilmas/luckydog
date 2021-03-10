var FIBOS = require("fibos.js");
const fs = require("fs");
const path = require("path");
const ssl = require('ssl')
ssl.ca.loadRootCerts()
var config_data = require("./config.js");

var config = config_data.test;
if (process.argv[2] && process.argv[2] === "prod") {
  config = config_data.prod;
}
// 创建合约账户
var name = config.contract;

var pubkey = config.publicKey;

fibos = FIBOS({
  chainId: config.chainId,
  keyProvider: config.privateKey,
  httpEndpoint: config.httpEndpoint,
  logger: {
    log: null,
    error: null,
  },
});

// 发布一个合约

var dir = "";
var log = null;
// 部署abi
var abi = JSON.parse(fs.readTextFile(path.join(dir, "abi.json")));
log = fibos.setabiSync(name, abi);
console.log(log);

// 部署代码
const js_code = fs.readTextFile(path.join(dir, "dog.js"));
log = fibos.setcodeSync(name, 0, 0, fibos.compileCode(js_code));
console.log(log);
log = fibos.updateauthSync({
  account: name,
  permission: "active",
  parent: 'owner',
  auth: {
    threshold: 1,
    keys: [{
      key: pubkey, // 你的公钥
      weight: 1
    }],
    "accounts": [{
      "permission": {
        "actor": name,
        "permission": "eosio.code"
      },
      "weight": 1
    }]
  }
}, {
  authorization: name
});
console.log(log)
