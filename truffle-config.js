module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      from: '0x6CB9bfa330bc2515bc3e38Bc3A4517f7638733C6'
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
