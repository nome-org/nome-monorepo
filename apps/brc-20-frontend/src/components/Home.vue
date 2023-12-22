<script setup lang="ts">
import { ref, watch, computed } from "vue";

import Footer from "./shared/Footer.vue";
import Header from "./shared/Header.vue";
import { useQuery, useMutation } from '@tanstack/vue-query'
import { client } from "../api/client";
import { sendBtcTransaction, BitcoinNetworkType, getAddress, AddressPurpose } from 'sats-connect'
import FeeRate from "./FeeRate.vue";
import { validate as validateBTCAddress } from 'bitcoin-address-validation'

type IFee = {
  name: string,
  value: number,
  time: string
};

const address = ref("");
const quantity = ref(1000);
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

const { refetch: checkClaim, isSuccess: isClaimChecked, data: claimData } = useQuery({
  queryKey: ['wl check', address],
  queryFn: () => client.provide('get', '/check-claim', {
    address: address.value,
  }),

  enabled: false
})

const eligibleFreeAmount = ref(0)

const isWhiteListOpen = ref(false)

const isWhiteListed = ref(false)

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
  enabled: () => {
    return quantity.value >= 1000
      && !!selectedFee.value
      && !!quantity.value
      && !!address.value
      && isAddressValid.value
  },
})

const priceData = computed(() => {
  return priceQ.data.value?.status !== 'success' ? null : priceQ.data.value.data
})

watch(claimData, () => {
  if (claimData.value?.status === 'success') {
    const { data: claimInfo } = claimData.value
    quantity.value = claimInfo.freeAmount || 1000
    eligibleFreeAmount.value = claimInfo.freeAmount
    isWhiteListOpen.value = claimInfo.isWhitelistOpen
    isWhiteListed.value = claimInfo.isWhitelisted
  }

})

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
      await checkClaim()
      const {
        paymentAddress,
        totalPrice
      } = data.data

      const networkType = import.meta.env.VITE_APP_BITCOIN_NETWORK === 'testnet'
        ? BitcoinNetworkType.Testnet
        : BitcoinNetworkType.Mainnet;
      getAddress({
        payload: {
          message: `We will need this address to pay for your order.`,
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

const disclaimersCheck = ref([false, false])
const consented = computed(() => disclaimersCheck.value.every(item => item))
const isAddressValid = computed(() => validateBTCAddress(address.value))
const isEligibleToMint = computed(() => {
  const wl = isWhiteListOpen.value && isWhiteListed.value
  const publicSale = !isWhiteListOpen.value
  const shouldMint = wl || publicSale

  return isClaimChecked.value && shouldMint
})

function makeTwitterPost() { }
</script>
<template>
  <div class="">
    <div class="pt-[25px] px-[25px] pb-0">
      <Header />
      <main>
        <div class="mt-6">
          <h1 class="text-2xl pb-2 border-b border-solid border-opacity-20 border-white">• $N0ME BRC-20 •</h1>
          <div class="md:mt-0 mb-44 sm:mb-16 xl:mb-12 w-full relative">
            <div
              class="absolute left-0 top-8 sm:-top-12 sm:left-auto sm:right-4 lg:right-52 italic text-2xl sm:text-center">
              BTC token <br />
              that has cool <br />
              Utility
            </div>
          </div>
        </div>
        <div class="w-full lg:w-[90%] xl:w-[80%] 2xl:w-[57%] text-base">
          <span class="block mb-12">
            NōME is a brand that changes the world by bringing art back to people. The brand name translates as no one or
            no ID. We prioritize privacy and create solutions to empower people to own their data.
          </span>

          <a href="" target="_blank" rel="noreferrer noopener"
            class="uppercase underline underline-offset-4 mb-6 text-xl block">
            "NOME ART"
          </a>
          <p class="mb-8">
            We established an independent
            <a href="" class="font-bold text-[#A50EA5]">
              nonprofit organization 501(c)(3)
            </a>
            to move the global Digital Art movement
            forward. NOME ART's mission is to be the best place to learn about crypto art, and tech, and have fun. We
            believe in a future where systems are self-sovereign and decentralized.
          </p>
          <p class="mb-8">
            Today, we are excited to launch the first
            <a href="" class="font-bold text-[#A50EA5]">
              crowdfunding
            </a>
            mint,
            leveraging the modern
            <a href="" class="font-bold text-[#A50EA5]">
              Bitcoin BRC-20
            </a>
            technology.
            BRC-20 is an experimental standard for fungible tokens on the L1 Bitcoin blockchain. Raised funds will be
            invested back into the ecosystem, improving the Web3 space with our Ordinals tech tools and education.
          </p>

        </div>


        <div class="pb-12 pt-2 md:mt-8 mt-12 w-full relative">
          <h3 class="my-8 text-xl">Welcome</h3>
          <div class="flex items-start gap-6 mt-6 w-full">
            <button
              class="bg-white text-black md:w-[20%] w-[30%] p-1.5 rounded-md whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
              :disabled="!consented || !isAddressValid" @click="checkClaim()">
              WL Access
            </button>
            <div>
              <input type="text" placeholder="Wallet address" v-model="address"
                class="border-white border-2 border-solid border-opacity-40 p-1.5 w-full rounded-[10px] bg-transparent outline-none" />
              <div class="mt-8 relative -left-12 gap-y-4 flex flex-col">
                <label class="flex gap-x-6">
                  <input v-model="disclaimersCheck[0]" class="w-6" type="checkbox">
                  If you are a holder, please, provide the wallet address that holds the 1/1 art.
                </label>
                <label class="flex gap-x-6">
                  <input v-model="disclaimersCheck[1]" class="w-6" type="checkbox">
                  If you place someone else's address, your tokens will be sent to another person.
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-solid border-opacity-20 border-white py-8" v-show="isClaimChecked">
          <p v-if="eligibleFreeAmount > 0 && isWhiteListOpen">
            <span class="text-[#51F55C]">Congratulations!</span> You got
            {{ eligibleFreeAmount.toLocaleString() }}
            FREE $N0ME tokens as a Holder, Team, or GA Winner. <br />
            Please, pay the Network fees below. You have <span class="text-[#51F55C]">10 minutes</span> to purchase
            more tokens.
          </p>
          <p v-else-if="isWhiteListOpen && isWhiteListed">
            Welcome to the Whitelist mint! You have <span class="text-[#51F55C]">10 minutes</span> to purchase the
            $N0ME tokens.
          </p>
          <p class="mt-4" v-else>
            Sorry, your wallet is not registered for Whitelist,
            <span class="text-[#51F55C]">public $N0ME mint</span> starts in 2 hours after the WL.
          </p>
        </div>
        <div v-if="isEligibleToMint" class="pt-2 md:mt-8 mt-12 mb-12 w-full relative">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 my-6 w-full lg:w-[80%]">
            <div class="mt-10">
              <!-- <div :class="eligibleFreeAmount > 0 ? 'visible' : 'invisible'">
                <span class="text-[#51F55C] text-xl">Congratulations!</span>
                <p class="text-xl">You claimed {{ eligibleFreeAmount }} free NOME tokens</p>
                <p class="mt-4 text-[#5A5A5A]">To receive them, please, proceed with the Network fees payment below.</p>
              </div> -->
              <img class="my-8 w-full object-fill" src="/chart.png" alt="Chart" />
              <div class="flex items-center justify-center">
                <button class="text-black bg-white w-[60%] text-xl rounded-lg p-1" @click="makeTwitterPost()">Post on
                  Twitter</button>
              </div>
            </div>

            <div class="w-full">
              <div class="flex items-center justify-center">
                <img src="/stats.png" class="" alt="Stats" />
              </div>

              <div class="mt-8 flex flex-col">
                <label class="mb-2">Mint quantity</label>
                <input type="number" placeholder="min 1,000 / max 250,000" v-model="quantity" min="1000" max="250000"
                  step="1000"
                  class="border-white border-2 border-solid border-opacity-40 p-1.5 w-full rounded-[10px] bg-transparent outline-none" />
              </div>

              <div class="grid grid-cols-3 gap-5 mt-8">
                <FeeRate v-for="feeRate in fees" :label="feeRate.name" :time="feeRate.time" :key="feeRate.name"
                  :is-selected="selectedFee?.name === feeRate.name" @selected-fee="selectedFee = feeRate"
                  v-if="feesQ.isSuccess" :value="feeRate.value" />
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
