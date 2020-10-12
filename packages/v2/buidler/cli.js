const inquirer = require('inquirer')
const { calculateContractAddress } = require('./utils')

async function deploy({ antv1, chain, owner }) {
  if (!web3.utils.isAddress(owner)) {
    console.log('Error: --owner must be an Ethereum address')
    return
  }

  if (!web3.utils.isAddress(antv1)) {
    console.log('Error: --antv1 must be an Ethereum address')
    return
  }

  const ANTv2 = artifacts.require('ANTv2')
  const ANTv2Migrator = artifacts.require('ANTv2Migrator')

  const from = (await web3.eth.getAccounts())[0].toLowerCase()
  const currentNonce = await web3.eth.getTransactionCount(from)
  const antv2Addr = calculateContractAddress(from, currentNonce)
  const migratorAddr = calculateContractAddress(from, currentNonce + 1)

  console.log('Deploying ANTv2 and ANTv2Migrator...')
  console.log()

  console.log('Deploying from address:', web3.utils.toChecksumAddress(from))
  console.log('Migration owner:', web3.utils.toChecksumAddress(owner))
  console.log()
  console.log('ANTv2 address:', web3.utils.toChecksumAddress(antv2Addr))
  console.log('ANTv2Migrator address:', web3.utils.toChecksumAddress(migratorAddr))
  console.log()

  const { confirmed } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirmed',
    message: 'Continue?',
  }])

  if (confirmed) {
    await ANTv2.new(chain, migratorAddr),
    await ANTv2Migrator.new(owner, antv1, antv2Addr)

    const deployedANTv2 = await ANTv2.at(antv2Addr)
    const deployedMigrator = await ANTv2Migrator.at(migratorAddr)
    console.log()
    console.log('ANTv2 minter:', await deployedANTv2.minter())
    console.log('ANTv2Migrator owner:', await deployedMigrator.owner())
    console.log('ANTv2Migrator ANTv1:', await deployedMigrator.antv1())
    console.log('ANTv2Migrator ANTv2:', await deployedMigrator.antv2())
    console.log()

    console.log('Complete!')
  }
}

module.exports = {
  deploy
}
