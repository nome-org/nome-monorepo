
<script setup lang="ts">
import { ref, watch, computed } from "vue";

import Footer from "./shared/Footer.vue";
import Header from "./shared/Header.vue";
import { useQuery, useMutation } from '@tanstack/vue-query'
import { client } from "../api/client";
import { sendBtcTransaction, BitcoinNetworkType, getAddress, AddressPurpose } from 'sats-connect'

type IFee = {
  name: string,
  value: number,
  time: string
};

const address = ref("");
const quantity = ref(0);
const selectedFee = ref<IFee | null>(null);
const customFee = ref<number>();
const feesQ = useQuery<{
  fastestFee: number,
  halfHourFee: number,
  hourFee: number,
  economyFee: number,
  minimumFee: number
}>({
  queryKey: ['fees'],
  queryFn: async () => {
    return fetch(`${import.meta.env.VITE_APP_MEMPOOL_URL}/api/v1/fees/recommended`)
      .then(res => res.json())
  },
})

const fees = ref<IFee[]>([])
watch(feesQ.data, (feesResponse) => {
  if (feesResponse && !customFee.value) {
    customFee.value = feesResponse.fastestFee
    fees.value = [
      {
        name: "Economy",
        value: feesResponse.economyFee,
        time: "Multiple days"
      },
      {
        name: "Normal",
        value: feesResponse.hourFee,
        time: "1 hour"
      },
      {
        name: "Custom",
        value: feesResponse.fastestFee,
        time: "Choose fee"
      }
    ]
    selectedFee.value = fees.value[1];
  }
})

const { data: wlData, refetch: checkClaim, isSuccess: wlCheckDone } = useQuery({
  queryKey: ['wl check', address],
  queryFn: () => client.provide('get', '/check-claim', {
    address: address.value,
  }),
  enabled: false
})

const claimStatus = computed(() => {
  return wlData.value?.status === 'success' ? wlData.value.data.status : null
})

const eligibleFreeAmount = computed(() => {
  switch (claimStatus.value) {
    case 'GiveawayWinner':
      return 2000
    case 'Holder':
      return 1000
    default:
      return 0
  }
})

const isWhiteList = computed(() => {
  console.log({
    wlData: wlData.value,
    wlCheckDone: wlCheckDone.value,
    claimStatus: claimStatus.value
  })
  return !wlCheckDone.value || claimStatus.value;
})

const feeRate = computed(() => {
  return (
    selectedFee.value?.name === 'Custom'
      ? customFee.value
      : selectedFee.value?.value)
})

const priceQ = useQuery({
  queryKey: ['price', selectedFee, quantity, customFee],
  queryFn: () => {
    if (!selectedFee.value || !quantity.value || !address.value) {
      return
    }
    return client.provide('get', '/price', {
      feeRate: String(feeRate.value),
      amount: String(quantity.value),
      address: address.value,
    })
  },
  enabled: () => quantity.value >= 1000,
})

const priceData = computed(() => {
  return priceQ.data.value?.status !== 'success' ? null : priceQ.data.value.data
})

const checkWL = async () => {
  const claimData = await checkClaim()
  if (claimData.data?.status === 'success') {
    quantity.value = 1000
    if (claimData.data.data.status === 'GiveawayWinner') {
      quantity.value = 2000
    }
  }
}

const paymentTx = ref('')

const createOrderM = useMutation({
  mutationKey: ['createOrder', quantity, address, feeRate],
  mutationFn: async () => {
    if (!address.value || !quantity.value || !feeRate.value) {
      return
    }
    const data = await client.provide('post', '/orders', {
      receiveAddress: address.value,
      amount: quantity.value,
      feeRate: feeRate.value,
    })

    if (data.status === 'success') {
      const {
        paymentAddress,
        totalPrice
      } = data.data

      const networkType = import.meta.env.VITE_APP_BITCOIN_NETWORK === 'testnet'
        ? BitcoinNetworkType.Testnet
        : BitcoinNetworkType.Mainnet;
      getAddress({
        payload: {
          message: `We'll need this address to pay for your order.`,
          network: {
            type: networkType,
          },
          purposes: [AddressPurpose.Payment]
        },
        onFinish(address) {
          sendBtcTransaction({
            payload: {
              network: {
                type: networkType
              },
              recipients: [
                {
                  address: paymentAddress,
                  amountSats: BigInt(totalPrice)
                }
              ],
              senderAddress: address.addresses[0].address
            },
            onCancel: () => {
              console.log('cancelled')
            },
            onFinish: (tx) => {
              paymentTx.value = `${import.meta.env.VITE_APP_MEMPOOL_URL}/tx/${tx}`
            }
          })
        },
        onCancel() { }
      })
    }
  }
})

</script>
<template>
  <div class="">
    <div class="pt-[25px] px-[25px] pb-0">
      <Header />
      <main>
        <div class="mt-6">
          <h1 class="text-2xl pb-2">• $N0ME BRC-20 •</h1>
          <div
            class="border-b border-solid border-opacity-20 border-white md:mt-0 mb-44 sm:mb-16 xl:mb-12 w-full relative">
            <div
              class="absolute left-0 top-8 sm:-top-12 sm:left-auto sm:right-4 lg:right-52 italic text-2xl sm:text-center">
              BTC token <br />
              that has cool <br />
              Utility
            </div>
          </div>
        </div>
        <div class="w-full lg:w-[90%] xl:w-[80%] 2xl:w-[57%] text-base">
          <span class="block mb-6">
            BRC-20 is an experimental standard for fungible tokens on the Bitcoin blockchain. BRC-20 tokens unlock new
            capabilities for the Bitcoin network, such as their use in DeFi protocols and blockchain applications.
          </span>

          <a href="" target="_blank" rel="noreferrer noopener" class="font-bold text-[#A50EA5]">$N0ME BRC-20</a>
          <span class="block mb-6">
            Written with zero "0" instead of "o".
          </span>
          <li>Supply: 100million</li>
          <li>Whitelist: 2k spots</li>
          <li>Price: $0.005</li>

          <span class="block mt-6">
            <a href="" target="_blank" rel="noreferrer noopener" class="font-bold text-[#A50EA5]">Whitelist form.</a>
            There are limited tokens available in a first-come, first-serve mint. However, a whitelist guarantees
            eligibility and offers a 20% discount.
            Note that the whitelist allocation
            will be closing by Dec 15, so act fast if you want to take advantage of this limited-time offer.
          </span>

          <span class="block mt-4">
            Read about utility and distribution in <a href="" target="_blank" rel="noreferrer noopener"
              class="font-bold text-[#A50EA5]">DOCS.</a>
          </span>
        </div>


        <div class="border-t border-solid border-opacity-20 border-white pt-2 md:mt-8 mt-12 w-full relative">
          <p class="mt-4">If you are a Holder, please, provide the wallet address that holds 1/1 art.</p>
          <p>If you place someone else address, your tokens will be sent to another person.</p>
          <div class="flex items-center gap-6 mt-6 w-full md:w-[75%]">
            <button class="bg-white text-black w-[30%] p-1.5 rounded-md whitespace-nowrap" @click="checkWL()">WL
              Access</button>
            <input type="text" placeholder="Wallet address" v-model="address"
              class="border-white border-2 border-solid border-opacity-40 p-1.5 w-[70%] rounded-[10px] bg-transparent outline-none" />
          </div>
          <p class="mt-4 text-[#5A5A5A] text-sm" :class="!isWhiteList ? 'visible' : 'invisible'">Sorry your wallet is not
            registered for Whitelist, public mint would be
            open soon</p>
        </div>

        <div class="border-t border-solid border-opacity-20 border-white pt-2 md:mt-8 mt-12 mb-12 w-full relative">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 my-6">
            <div class="mt-10">
              <div :class="eligibleFreeAmount > 0 ? 'visible' : 'invisible'">
                <span class="text-[#51F55C] text-xl">Congratulations!</span>
                <p class="text-xl">You claimed {{ eligibleFreeAmount }} free NOME tokens</p>
                <p class="mt-4 text-[#5A5A5A]">To receive them, please, proceed with the Network fees payment below.</p>
              </div>
              <img class="my-8 w-full object-fill" src="/chart.png" alt="Chart" />
              <div class="flex items-center justify-center">
                <button class="text-black bg-white w-[60%] text-xl rounded-lg p-1">Post on Twitter</button>
              </div>
            </div>

            <div class="mx-auto w-[90%]">
              <div class="flex items-center justify-center">
                <img src="/stats.png" class="" alt="Stats" />
              </div>

              <div class="mt-8 flex flex-col">
                <label class="mb-2">Mint quantity</label>
                <input type="number" placeholder="min 1,000 / max 250,000" v-model="quantity"
                  class="border-white border-2 border-solid border-opacity-40 p-1.5 w-full rounded-[10px] bg-transparent outline-none" />
              </div>

              <div class="grid grid-cols-3 gap-5 mt-8" v-if="feesQ.isSuccess">
                <div class="bg-[#1D1D1D] flex flex-col items-center justify-center rounded-md p-4 cursor-pointer"
                  :class="f?.value === selectedFee?.value ? 'border-2 border-white bg-[#2C2C2C]' : ''"
                  v-for="(f, i) in fees" :key="i" @click="selectedFee = f">
                  <b>{{ f.name }}</b>
                  <span class="text-[#5a5a5a] text-center text-sm">{{ f.value }} sats/vByte</span>
                  <p class="mt-4 text-[#5a5a5a] text-center text-sm">{{ f.time }}</p>
                </div>
              </div>

              <div class="mt-8 flex flex-col" v-if="selectedFee?.name === 'Custom'">
                <label class="mb-2">You can add a custom fee below</label>
                <div class="w-full bg-white text-black p-2 flex items-center gap-5 rounded-md">
                  <input v-model="customFee" type="number" class="outline-none w-full" />
                  <span>sats/vByte</span>
                </div>
              </div>

              <div :class="priceQ.isSuccess ? 'visible' : 'invisible'"
                class="mt-8 flex flex-col gap-2 text-[#5a5a5a] text-xl">
                <span>Network Fee: {{ (priceData?.minerFees || 0) / 1e8 }}</span>
                <span>Total BTC: {{ (priceData?.total || 0) / 1e8 }}</span>
                <span>Total USD: 0.000001</span>
              </div>
              <button class="text-black bg-white w-full rounded-lg p-1 text-xl mt-6" @click="createOrderM.mutate()">MINT
                $NOME</button>
              <p class="text-center text-xl text-[#5a5a5a] mt-4" v-if="paymentTx">
                Link to the <a :href="paymentTx" target="_blank" rel="noreferrer noopener"
                  class="underline underline-offset-8 hover:underline">mempool</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
    <Footer />
  </div>
</template>

<style scoped></style>
