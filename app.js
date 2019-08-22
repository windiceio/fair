import Vue from 'vue'
new Vue({
  el: "#app",
  data: {
    game: 'dice',
    verifyClient: '',
    verifyServer: '',
    verifyNonce: '',
    resultData: 0
  },
  created () {
    const query = URI(document.location.search).search(true)
    this.verifyClient = query.verifyClient ? query.verifyClient : ''
    this.verifyServer = query.verifyServer ? query.verifyServer : ''
    this.verifyNonce = query.verifyNonce ? query.verifyNonce : ''
  },
  computed: {
    verifyHash: function () {
      return this.verifyServer.length > 0 ? CryptoJS.SHA256(this.verifyServer) : ''
    },
    result: function () {
      if (this.game === 'dice') {
        if (this.resultData.length == 3) {
          return '0' + this.resultData
        } else if (this.resultData.length == 2) {
          return '00' + this.resultData
        } else if (this.resultData.length == 1) {
          return '000' + this.resultData
        }
      }
      return this.resultData
    }
  },
  watch: {
    verifyClient: function() { this.getResult() },
    verifyServer: function() { this.getResult() },
    verifyNonce: function() { this.getResult() }
  },
  methods: {
    getResult: function() {
      switch (this.game) {
        case 'dice':
          this.getResultDice()
          break
        case 'crash':
          this.getResultCrash()
          break
      }
    },
  	getResultDice: function() {
      if (this.verifyServer && this.verifyClient && this.verifyNonce) {
        const hash = CryptoJS.SHA512(this.verifyServer + this.verifyClient + this.verifyNonce).toString()

        let index = 0
        let lucky = parseInt(hash.substr(index, 5), 16)
        while (lucky >= 1000000) {
          lucky = parseInt(hash.substr(index, 5), 16)
          index += 5
        }
        this.resultData = (lucky % 10000).toString()
      }
    },
    getResultCrash: function() {
      if (this.verifyServer && this.verifyClient && this.verifyNonce) {
          const sec = this.verifyServer + this.verifyClient + this.verifyNonce
          let count = 0
          let hash = CryptoJS.SHA512(sec + ":" + count).toString()

          let index = 0
          let lucky = parseInt(hash.substr(index, 8), 16)
          while (lucky >= 10000000000) {
            if (index+8 > hash.length) {
              count++
              index = 0
              hash = CryptoJS.SHA512(sec + ":" + count).toString()
            }

            lucky = parseInt(hash.substr(index, 8), 16)
            index += 1
          }

          const result = lucky % 100000000
       
          const output = (0.00000001 / (result + 1) * 0.99) * 100000000 * 100000000

          this.resultData = parseInt((output * 100).toString()) / 100
        }
    },
    changeGame: function(game) {
      this.game = game
      this.getResult()
    }
  }
})
