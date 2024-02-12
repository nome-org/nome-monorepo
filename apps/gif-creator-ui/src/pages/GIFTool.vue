<script setup lang="ts">
import { useMutation, useQuery } from "@tanstack/vue-query";
import { computed, onMounted, ref } from "vue";
import { inscribeApi } from "../api/inscribe";
import { fileToBase64 } from "../util/fileToBase64";
import axios from "axios";
import SelectRarity from "../components/shared/SelectRarity.vue";
import Footer from "../components/shared/Footer.vue";
import { network } from "../constants/bitcoin";
import GetBetaAccess from "../components/GetBetaAccess.vue";
import OrdersForAddress from "../components/OrdersForAddress.vue";
import { FeeRateSelector, SelectWallet } from "@repo/shared-ui"
import GIFPreview from "../components/GIFPreview.vue";
import { usePriceQuery } from "../api/queries/price";
import MintInfo from "../components/MintInfo.vue";
import { CompressAble, OrderingState } from "../constants/inscriptions";
import InscribeButton from "../components/ui/InscribeButton.vue";
import FrameManager from "../components/FrameManager.vue";
import {
  //  createToken,
  useAuthStore
} from "@repo/auth-utils";
import VideoPlayer from "../components/shared/VideoPlayer.vue";
import NewHeader from "../components/shared/NewHeader.vue";
import { WalletType, sendBTCLeather, sendBTCUnisat, sendBTCXverse } from "@repo/wallet-utils";


const auth = useAuthStore()


const files = ref<Array<CompressAble>>([]);
const selectedRarity = ref("random");
const feeRate = ref("")
const quantity = ref(1);

const paymentTxId = ref("");
const gifSrc = ref("");
const gifCompilationProgress = ref(0);
const isCompilingGIF = ref(false);
const showGetBetaAccess = ref(true);

onMounted(() => {
  if (window.localStorage.getItem("has-beta-access")) {
    showGetBetaAccess.value = false;
  }
});

const orderingState = ref(OrderingState.None);

function handleGifProgress(progress: number) {
  if (gifSrc.value) {
    URL.revokeObjectURL(gifSrc.value);
    gifSrc.value = "";
  }
  if (!isCompilingGIF.value) {
    isCompilingGIF.value = true
  }
  gifCompilationProgress.value = progress
}

function handleGIFGenerated(
  [gifUrl, frames]: [
    string,
    CompressAble[]
  ]
) {
  isCompilingGIF.value = false
  gifSrc.value = gifUrl;
  files.value = frames
}

const { data: totalFee, dataUpdatedAt } = usePriceQuery({
  feeRate: computed(() => Number(feeRate.value)),
  frameCount: computed(() => files.value.length),
  imageSizes: computed(() => files.value.map(file => file.compressed.size)),
  mintQuantity: quantity,
  selectedRarity
})
const { data: usdPrice } = useQuery({
  queryKey: ["coinCap"],
  enabled: () => Boolean(totalFee.value && dataUpdatedAt.value),
  refetchInterval: () => {
    const now = new Date().getTime();
    const shouldRefresh = Boolean(
      totalFee.value &&
      dataUpdatedAt.value &&
      now - dataUpdatedAt.value < 20_000
    );

    return shouldRefresh ? 20_000 : false;
  },
  queryFn: async () => {
    const response = await axios.get(
      "https://api.coincap.io/v2/rates/bitcoin",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return Number(response.data.data.rateUsd);
  },
});

const createInscriptionOrderMut = useMutation({
  mutationKey: ["inscribe", files, selectedRarity, quantity, feeRate],
  mutationFn: async ({
    ordinalAddress,
  }: {
    ordinalAddress: string;
  }) => {
    const fileData = [];
    for (const file of files.value) {
      fileData.push({
        dataURL: await fileToBase64(file.compressed),
        duration: file.duration,
        name: file.original.name,
        size: file.compressed.size,
        type: file.compressed.type,
      });
    }
    const response = await inscribeApi({
      files: fileData,
      feeRate: Number(feeRate.value),
      quantity: Number(quantity.value),
      rarity: selectedRarity.value as any,
      receiverAddress: ordinalAddress,
      token: ""
      // createToken({
      //   privateKey: auth.privateKey,
      //   prefix: import.meta.env.VITE_APP_CHALLENGE_TEXT,
      // })
    });
    if (response.status !== 'success') {
      throw new Error(response.error.message);
    }
    return response.data.payment_details
  },
});
const isPaymentPopupOpen = ref(false)

async function waitXV() {
  isPaymentPopupOpen.value = true
  orderingState.value = OrderingState.RequestingWalletAddress;
}

const handleContactAdded = () => {
  window.localStorage.setItem("has-beta-access", "true");
  showGetBetaAccess.value = false;
};

const handleWalletSelected = async (walletType: WalletType) => {
  const sendBTCFnByWalletType = {
    [WalletType.leather]: sendBTCLeather,
    [WalletType.unisat]: sendBTCUnisat,
    [WalletType.xverse]: sendBTCXverse
  }
  const sendFn = sendBTCFnByWalletType[walletType]
  try {

    orderingState.value = OrderingState.WaitingForCreation;

    const { ordinalAddress, paymentAddress } = auth
    const { address, amount } = await createInscriptionOrderMut.mutateAsync({
      ordinalAddress,
    });

    orderingState.value = OrderingState.WaitingForPayment;

    sendFn({
      recipient: address,
      amountInSats: amount,
      senderAddress: paymentAddress,
      network
    })
      .then((txId) => {
        paymentTxId.value = txId;
        orderingState.value = OrderingState.None;
        isPaymentPopupOpen.value = false
      })
      .catch(() => {
        orderingState.value = OrderingState.None;
        isPaymentPopupOpen.value = false
      });
  } catch (err) {
    orderingState.value = OrderingState.None;
  }
}

</script>
<template>
  <SelectWallet @wallet-selected="handleWalletSelected($event)" :is-open="isPaymentPopupOpen"
    @close-modal="isPaymentPopupOpen = false" />
  <div class="">
    <NewHeader />
    <div class="pt-[25px] px-[25px] pb-0">
      <main>
        <div class="mt-20">
          <h1 class="text-2xl pb-2">• Stop motion tool •</h1>
          <div
            class="border-b border-solid border-opacity-20 border-white md:mt-0 mb-44 sm:mb-16 xl:mb-12 w-full relative">
            <div
              class="absolute left-0 top-8 sm:-top-12 sm:left-auto sm:right-4 lg:right-52 italic text-2xl sm:text-center">
              Resize <br />
              and Inscribe <br />
              Animations
            </div>
          </div>
        </div>
        <div class="w-full lg:w-[90%] xl:w-[80%] 2xl:w-[57%] text-base">
          <span class="lg:block">
            This is a platform for the community to explore the potential of
            Bitcoin Ordinals,
          </span>
          <span class="lg:block">
            enabling the creation of recursive animations, resizing images, and
            inscriptions on rare sats all in one place.
          </span>

          <br /><br />
          <VideoPlayer
            source="https://link.storjshare.io/s/jx5dbptn3eokr6l5jlns6dokh7uq/nome%2FGIF%20tutorial.mp4?view=1" />
          <div class="mt-12  h-[50vh]" v-if="showGetBetaAccess">
            <GetBetaAccess @addContact="handleContactAdded" />
          </div>
        </div>
        <section v-if="!showGetBetaAccess">
          <div class="w-full lg:w-[90%] xl:w-[80%] 2xl:w-[57%] text-base mb-12">
            1. Upload PNG or JPEG frames (10 Max);
            <br />
            2. Set order, timing, and .webp file size;
            <br />
            3. Generate GIF, set quantity and rarity;
            <br />
            4. Inscribe frames + recursive GIFs.
          </div>

          <FrameManager @generated="handleGIFGenerated" @progress="handleGifProgress" />

          <div>
            <div class="flex flex-col md:flex-row w-full gap-x-12 mt-4">
              <div class="basis-full md:basis-1/2 flex justify-center">
                <GIFPreview :img-src="gifSrc" :is-loading="isCompilingGIF" :progress="gifCompilationProgress" />
              </div>
              <!-- col-12 col-sm-6 flex-fill frame-box d-flex align-items-center justify-content-center -->
              <div class="basis-full md:basis-1/2 flex-col flex max-w-lg mx-auto md:mx-0">
                <div class="w-full">
                  <div class="h-9 text-lg sm:text-base mb-1 mt-8">
                    GIF Quantity
                  </div>
                  <input type="number" v-model="quantity"
                    class="border border-solid border-white bg-transparent h-10 rounded-xl text-right pr-3 text-white w-full" />
                  <div class="h-9 mt-10 text-lg sm:text-base mb-1">Rarity</div>
                </div>
                <SelectRarity :selected-rarity="selectedRarity" @update:selected-rarity="selectedRarity = $event" />
                <div class="mt-14 mb-7">
                  <FeeRateSelector v-model="feeRate" />
                </div>
                <MintInfo v-if="gifSrc && files.length > 0" :frames-count="files.length" :mint-quantity="quantity"
                  :total-fee="totalFee" :usd-price="usdPrice" />

                <div class="w-full pr-4 pl-4">
                  <div>
                    <div class="flex flex-col items-center pt-12 w-full mt-6">
                      <InscribeButton @inscribe="waitXV" :ordering-state="orderingState" />
                      <div class="w-full flex flex-col items-center mt-7" v-if="paymentTxId">
                        <div class="w-full text-left input-title">Thank you for creating art with us!</div>
                        <a :href="'https://mempool.space/tx/' + paymentTxId"
                          class="text-left input-title underline underline-offset-4">
                          Mempool link
                        </a>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <OrdersForAddress />

          </div>
        </section>
      </main>
    </div>
    <Footer />
  </div>
</template>