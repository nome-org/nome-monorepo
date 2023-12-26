<script setup lang="ts">
import { ref, watch, computed } from "vue";

import Footer from "./shared/Footer.vue";
import Header from "./shared/Header.vue";
import { useQuery, useMutation } from '@tanstack/vue-query'
import { client } from "../api/client";
import { sendBtcTransaction, BitcoinNetworkType, getAddress, AddressPurpose } from 'sats-connect'
import FeeRate from "./ui/FeeRate.vue";
import { validate as validateBTCAddress } from 'bitcoin-address-validation'
import DisclaimerCheckbox from "./ui/DisclaimerCheckbox.vue";
import PriceItem from "./ui/PriceItem.vue";
import NumberInput from "./ui/NumberInput.vue";
import SaleProgress from "./SaleProgress.vue";
import { useMintProgress } from "../api/queries/mint-progress";

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

const {
  data: isWhiteListOpen
} = useQuery({
  queryKey: ['whitelist status'],
  queryFn: async () => {
    const response = await client.provide('get', '/whitelist/status', {})
    if (response.status === 'success') {
      return response.data.open
    }
    return false
  }
})

const isWhiteListed = ref(false)

const userPaid = ref(true)


const isAmountValid = computed(() => {
  const amount = quantity.value
  return amount > 0
    && amount % 1000 === 0
    && amount >= 1000
    && amount <= 250_000
})

const isFormValid = computed(() => {
  return isAmountValid.value
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
  enabled: () => {
    return isFormValid.value
      && !!selectedFee.value
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
              senderAddress: address.addresses[0].address,
            },
            onCancel: () => {
              console.log('cancelled')
            },
            onFinish: (tx) => {
              userPaid.value = true
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
  // return import.meta.env.DEV;
  return isClaimChecked.value && shouldMint
})

function makeTwitterPost() {
  const tweetText = encodeURIComponent(`🪙  NōME 🪙
Just minted $NOME BRC-20 that has a utility:

• Access to the NōME platform 
• Rewarding Ordinals community
• Discount for upcoming collections

More info:
https://brc20.nome.wtf/`)
  window.open(`https://twitter.com/intent/tweet?text=${tweetText}`)
}

const { data: usdPrice } = useQuery({
  queryKey: ["coinCap"],
  enabled: () => Boolean(address.value && priceData.value && priceQ.dataUpdatedAt.value),
  refetchInterval: () => {
    const now = new Date().getTime();
    const shouldRefresh = Boolean(
      priceQ.dataUpdatedAt.value &&
      now - priceQ.dataUpdatedAt.value < 60_000
    );

    return shouldRefresh ? 20_000 : false;
  },
  queryFn: async () => {
    const response = await fetch(
      "https://api.coincap.io/v2/rates/bitcoin",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then(res => res.json());
    return response.data.rateUsd;
  },
});

const progress = useMintProgress()

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

          <h1 class="uppercase underline underline-offset-4 mb-6 text-xl block">
            "NOME ART"
          </h1>
          <p class="mb-8">
            We established an independent
            <span class="font-bold text-pink">
              nonprofit organization 501(c)(3)
            </span>
            to move the global Digital Art movement
            forward. NOME ART's mission is to be the best place to learn about crypto art, and tech, and have fun. We
            believe in a future where systems are self-sovereign and decentralized.
          </p>
          <p class="mb-8">
            Today, we are excited to launch the first
            <span class="font-bold text-pink">
              crowdfunding
            </span>
            mint,
            leveraging the modern
            <span class="font-bold text-pink">
              Bitcoin BRC-20
            </span>
            technology.
            BRC-20 is an experimental standard for fungible tokens on the L1 Bitcoin blockchain. Raised funds will be
            invested back into the ecosystem, improving the Web3 space with our Ordinals tech tools and education.
          </p>

        </div>


        <div class="pb-12 pt-2 md:mt-8 mt-12 w-full relative">
          <h3 class="my-8 text-xl">Welcome</h3>
          <div class="flex flex-col-reverse sm:flex-row items-start gap-6 mt-6 w-full">
            <button
              class="bg-white text-black md:w-[20%] w-full p-1.5 rounded-md whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
              :disabled="!consented || !isAddressValid" @click="checkClaim()">
              {{ isWhiteListOpen ? 'WL Access' : 'Public Access' }}
            </button>
            <div>
              <input type="text" placeholder="Wallet address" v-model="address"
                class="border-white border-2 border-solid border-opacity-40 p-1.5 w-full rounded-[10px] bg-transparent outline-none" />
              <div class="mt-8 relative sm:-left-12 gap-y-4 flex flex-col">
                <DisclaimerCheckbox v-if="isWhiteListOpen" v-model="disclaimersCheck[0]"
                  text="If you are a holder, please, provide the wallet address that holds the 1/1 art." />
                <DisclaimerCheckbox v-model="disclaimersCheck[1]"
                  text="If you place someone else's address, your tokens will be sent to another person." />
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-solid border-opacity-20 border-white py-8" v-show="isClaimChecked">
          <p v-if="eligibleFreeAmount > 0 && isWhiteListOpen">
            <span class="text-green">Congratulations!</span> You got
            {{ eligibleFreeAmount.toLocaleString() }}
            FREE $N0ME tokens as a Holder, Team, or GA Winner. <br />
            Please, pay the Network fees below. You have <span class="text-green">10 minutes</span> to purchase
            more tokens.
          </p>
          <p v-else-if="isWhiteListOpen && isWhiteListed">
            Welcome to the Whitelist mint! You have <span class="text-green">10 minutes</span> to purchase the
            $N0ME tokens.
          </p>
          <p class="mt-4" v-else>
            Sorry, your wallet is not registered for Whitelist,
            <span class="text-green">public $N0ME mint</span> starts in 2 hours after the WL.
          </p>
        </div>

        <div v-if="isEligibleToMint" class="pt-2 md:mt-8 mt-12 mb-12 w-full relative">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 my-6 w-full lg:w-[80%]">
            <!-- <div class="mt-10"> -->
            <!-- <div :class="eligibleFreeAmount > 0 ? 'visible' : 'invisible'">
                <span class="text-green text-xl">Congratulations!</span>
                <p class="text-xl">You claimed {{ eligibleFreeAmount }} free NOME tokens</p>
                <p class="mt-4 text-[#5A5A5A]">To receive them, please, proceed with the Network fees payment below.</p>
              </div> -->
            <!-- <img class="my-8 w-full object-fill" src="/chart.png" alt="Chart" /> -->
            <!-- </div> -->

            <div class="w-full sm:ml-12">
              <div class="flex items-center justify-center">
                <!-- <img src="/stats.png" class="" alt="Stats" /> -->
                <SaleProgress />
              </div>
              <div class="mt-8 flex flex-col">
                <label>
                  <div class="mb-4 text-xl">
                    Total quantity
                  </div>
                  <NumberInput placeholder="min 1,000 / max 250,000" v-model="quantity"
                    class="border-white border-2 border-solid border-opacity-40 p-1.5 w-full rounded-[10px] bg-transparent outline-none" />
                  <p class="mt-2 text-pink text-sm" v-if="!isAmountValid">
                    Please, make sure to place integer numbers with no hundreds (e.g. 1,000 | 18,000 | 111,001,000) within
                    the min & max range
                  </p>
                </label>
              </div>

              <div class="grid grid-cols-3 gap-5 mt-8">
                <FeeRate v-for="feeRate in fees" :label="feeRate.name" :time="feeRate.time" :key="feeRate.name"
                  :is-selected="selectedFee?.name === feeRate.name" @selected-fee="selectedFee = feeRate"
                  v-if="feesQ.isSuccess" :value="feeRate.value" />
              </div>

              <div class="mt-8 flex flex-col" v-if="selectedFee?.name === 'Custom'">
                <label class="mb-2">You can add a custom fee below</label>
                <div class="w-full bg-white text-black p-2 flex items-center gap-5 rounded-md">
                  <NumberInput v-model="customFee" className="outline-none w-full" />
                  <span>sats/vByte</span>
                </div>
              </div>

              <div :class="priceQ.isSuccess ? 'visible' : 'invisible'"
                class="mt-8 flex flex-col gap-2 text-[#5a5a5a] text-xl">
                <PriceItem label="Tokens price BTC:" :value="((priceData?.brc20Price || 0) / 1e8).toFixed(8)" />
                <PriceItem label="Network Fee:" :value="((
                  (priceData?.minerFees || 0) +
                  (priceData?.basePostage || 0)
                ) / 1e8).toFixed(8)" />
                <PriceItem label="Total BTC:" :value="((priceData?.total || 0) / 1e8).toFixed(8)" />
                <PriceItem label="Total USD:" :value="`$${(usdPrice * (priceData?.total || 0) / 1e8).toFixed(2)}`" />

              </div>
              <button :disabled="!isFormValid && progress < 50_000_000"
                class="text-black bg-white w-full rounded-lg p-1 text-xl mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
                @click="createOrderM.mutate()">
                MINT $NOME
              </button>
              <p class="text-center text-xl text-[#5a5a5a] mt-4" v-if="paymentTx">
                Link to the <a :href="paymentTx" target="_blank" rel="noreferrer noopener"
                  class="underline underline-offset-8 hover:underline">mempool</a>
              </p>
              <button v-if="userPaid" class="text-black bg-white w-full rounded-lg p-1 text-xl mt-16"
                @click="makeTwitterPost()">
                Post on Twitter
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    <div class="pt-48">
      <Footer />
    </div>
  </div>
</template>

<style scoped></style>
