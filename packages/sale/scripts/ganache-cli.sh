#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$rpc_pid" ] && ps -p $rpc_pid > /dev/null; then
    kill -9 $rpc_pid
  fi
}

setup_testing_variables() {
  PORT=${PORT-8545}
  BALANCE=${BALANCE-100000}
  # Allow yuge gas limit for solidity tests
  GAS_LIMIT=${GAS_LIMIT-100000000}
  NETWORK_ID=${NETWORK_ID-15}
  ACCOUNTS=${ACCOUNTS-200}
}

start_ganache() {
  echo "Starting ganache-cli on byzantium..."
  # Rollback to byzantium hardfork to more closely mirror 2017 hardfork state
  # Allow unlimited contract size for solidity tests
  npx ganache-cli --allowUnlimitedContractSize -k byzantium -i ${NETWORK_ID} -l ${GAS_LIMIT} -g ${GAS_PRICE} -a ${ACCOUNTS} -e ${BALANCE} -p ${PORT} > /dev/null &
  rpc_pid=$!
  sleep 3
  echo "Running ganache-cli with pid ${rpc_pid} in port ${PORT}"
}

run_tests() {
  echo "Running tests $@..."
  npx truffle test --network rpc $@
}

setup_testing_variables
start_ganache
run_tests $@
