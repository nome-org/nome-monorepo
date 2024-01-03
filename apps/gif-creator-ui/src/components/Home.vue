<script setup lang="ts">
import {
  AddressPurpose,

  SendBtcTransactionOptions,
  getAddress,
  sendBtcTransaction,
} from "sats-connect";

import { useMutation, useQuery } from "@tanstack/vue-query";
import { computed, onMounted, ref, watch } from "vue";
import { getPriceApi } from "@/api/get-price.ts";
import { inscribeApi } from "@/api/inscribe.ts";
import { OrderWithStatus, getOrdersApi } from "@/api/get-orders.ts";
import { fileToBase64 } from "@/util/fileToBase64.ts";
import axios from "axios";
import Frame from "./Frame.vue";
import SelectRarity from "./shared/SelectRarity.vue";
import Footer from "./shared/Footer.vue";
import { buildGif } from "@/util/buildGIF.ts";
import { network } from "@/constants/bitcoin.ts";
import logo from "../assets/images/logo-with-slant.svg";
import {
  getAddressInfo,
  validate as validateBitcoinAddress,
  AddressType,
} from "bitcoin-address-validation";
import GetBetaAccess from "./GetBetaAccess.vue";
import OrdersForAddress from "./OrdersForAddress.vue";

type CompressAble = {
  original: File;
  compressed: File;
  duration: number;
};

const files = ref<Array<CompressAble>>([]);
const selectedRarity = ref("random");
const quantity = ref(1);
const paymentAddress = ref("");
const ordinalAddress = ref("");
const isXV = ref(true);
const quality = ref(100);
const paymentTxId = ref("");
const gifSrc = ref("");
const gifCompilationProgress = ref(0);
const isCompilingGIF = ref(false);
const framesContainerRef = ref<HTMLElement | null>(null);
const frameCompressionState = ref<boolean[]>([]);
const showGetBetaAccess = ref(true);

onMounted(() => {
  if (window.localStorage.getItem("has-beta-access")) {
    showGetBetaAccess.value = false;
  }
});


const isCompressing = computed(() => {
  return frameCompressionState.value.some((item) => item);
});



enum OrderingState {
  None,
  RequestingWalletAddress,
  WaitingForCreation,
  WaitingForPayment,
}
const orderingState = ref(OrderingState.None);

watch([files, quality], () => {
  gifSrc.value = "";
});

async function getFiles(e: Event) {
  const allAreImages = Array.from((e.target as HTMLInputElement).files).every(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type)
  );

  if (!allAreImages) {
    alert("Please select only images");
    return;
  }
  const availableSlots = 10 - files.value.length;
  if (availableSlots <= 0) {
    return;
  }

  gifSrc.value = "";
  const { files: newFilesList } = e.target as HTMLInputElement;
  const newFiles = Array.from(newFilesList).slice(0, availableSlots);
  if (!newFiles.length) {
    e.preventDefault();
    return;
  }
  let imageFiles = newFiles.map((file) => {
    return {
      img: URL.createObjectURL(file),
      original: file,
      compressed: file,
      duration: 0.5,
    };
  });
  // show original images initially
  files.value = [...files.value, ...imageFiles];
  // compress images in the meanwhile
  // after compression is done, replace original images with compressed ones
  imageFiles.forEach((file) => {
    URL.revokeObjectURL(file.img);
  });
  files.value = [...files.value.slice(0, -imageFiles.length), ...imageFiles];
}
function duplicateFile(item: CompressAble) {
  if (files.value.length >= 10) {
    return;
  }
  gifSrc.value = "";
  files.value = files.value.concat([{ ...item }]);
}

function removeFile(item: CompressAble) {
  if (!item) {
    return;
  }
  gifSrc.value = "";
  files.value = files.value.filter((file) => file !== item);
}

const { data: totalFee, dataUpdatedAt } = useQuery({
  queryKey: ["price", files, selectedRarity, quantity],
  queryFn: async () => {
    const data = await getPriceApi({
      count: quantity.value,
      fee: 6,
      imageSizes: files.value.map((file) => file.compressed.size),
      rareSats: selectedRarity.value,
    });
    return data.data.totalFee / 100_000_000;
  },
  enabled: () => Boolean(gifSrc.value && files.value.length > 0),
});
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
    return response.data.data.rateUsd;
  },
});


const createInscriptionOrderMut = useMutation({
  mutationKey: ["inscribe", files, selectedRarity, quantity],
  mutationFn: async () => {
    const fileData = [];
    for (const file of files.value) {
      fileData.push({
        dataURL: await fileToBase64(file.compressed),
        duration: 1000,
        name: file.original.name,
        size: file.compressed.size,
        type: file.compressed.type,
      });
    }
    const {
      data: {
        payment_details: { address, amount },
      },
    } = await inscribeApi({
      files: fileData,
      feeRate: 6,
      payAddress: paymentAddress.value,
      rarity: selectedRarity.value as any,
      receiverAddress: ordinalAddress.value,
    });

    return {
      address,
      amount,
    };
  },
});
async function waitXV() {
  try {
    orderingState.value = OrderingState.RequestingWalletAddress;
    await getAddress({
      payload: {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
        message:
          "We need the address you'll use to pay for the service, and the address where you want to receive the Ordinals.",
        network: {
          type: network,
        },
      },
      onFinish: async (response) => {
        response.addresses.forEach((item) => {
          if (item.purpose == "ordinals") {
            ordinalAddress.value = item.address;
          } else if (item.purpose == "payment") {
            paymentAddress.value = item.address;
          }
        });
        if (paymentAddress.value) {
          orderingState.value = OrderingState.WaitingForCreation;
          const { address, amount } =
            await createInscriptionOrderMut.mutateAsync();
          sendBTC(address, amount)
            .then(() => {
              orderingState.value = OrderingState.None;
            })
            .catch(() => {
              orderingState.value = OrderingState.None;
            });
          orderingState.value = OrderingState.WaitingForPayment;
        } else {
          isXV.value = false;
        }
      },
      onCancel: () => {
        orderingState.value = OrderingState.None;
      },
    });
  } catch (err) {
    orderingState.value = OrderingState.None;
  }
}
function sendBTC(address: string, amount: number) {
  return new Promise((resolve, reject) => {
    const sendBtcOptions: SendBtcTransactionOptions = {
      payload: {
        network: {
          type: network,
        },
        recipients: [
          {
            address: address,
            amountSats: BigInt(amount),
          },
        ],
        senderAddress: paymentAddress.value,
      },
      onFinish: (response) => {
        paymentTxId.value = response;
        resolve(response);
      },
      onCancel: reject,
    };
    return sendBtcTransaction(sendBtcOptions);
  });
}

async function generateGIF() {
  if (files.value.length == 0) {
    return;
  }

  if (gifSrc.value) {
    URL.revokeObjectURL(gifSrc.value);
    gifSrc.value = "";
  }

  isCompilingGIF.value = true;
  gifCompilationProgress.value = 0;
  const gifBlob = await buildGif({
    frames: files.value.map((item) => ({
      imageFile: item.compressed,
      duration: item.duration,
    })),
    onProgress: (progress) => {
      gifCompilationProgress.value = Math.ceil(progress * 100);
    },
  });

  gifSrc.value = URL.createObjectURL(gifBlob);
  isCompilingGIF.value = false;
}

const handleContactAdded = () => {
  window.localStorage.setItem("has-beta-access", "true");
  showGetBetaAccess.value = false;
};
</script>
<template>
  <div class="">
    <div class="pt-[25px] px-[25px] pb-0">
      <div class="min-h-[11.7rem] relative">
        <a class="w-[48%] md:w-[23%] mx-0 mb-20 mt-6 invert hover:bg-bottom relative inline-block bg-no-repeat bg-cover bg-top before:absolute before:top-0 before:bottom-[-19%] before:left-0 before:right-0 after:absolute after:w-[99%] after:h-[8%] after:bottom-[-19%]"
          href="/" :style="{ backgroundImage: `url(${logo})` }">
          <img src="../assets/images/logo-blank.png" alt="" class="block w-full" />
        </a>
        <a class="right-0 top-0 absolute text-[20px] leading-[15px] mx-0 mt-6 mb-20 text-white underline transition-all duration-75 hover:italic underline-offset-8 hover:underline"
          href="https://nome.gallery">
          Gallery
        </a>
      </div>
      <main>
        <div class="mt-6">
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
          <!--  To create animation, please follow the
          steps: -->

          <br /><br />
          <div class="mt-12  h-[50vh]" v-if="showGetBetaAccess">
            <GetBetaAccess @addContact="handleContactAdded" />
          </div>
        </div>
        <section v-if="!showGetBetaAccess">
          <div class="w-full lg:w-[90%] xl:w-[80%] 2xl:w-[57%] text-base">
            1. Upload PNG or JPEG frames (10 Max);
            <br />
            2. Set order, timing, and .webp file size;
            <br />
            3. Generate GIF, set quantity and rarity;
            <br />
            4. Inscribe frames + recursive GIFs.
          </div>

          <div class="flex justify-start mt-12 w-full sm:w-1/2">
            <label
              class="min-w-[13.3rem] py-2 px-0 text-lg text-center transition-transform duration-200 hover:scale-110 bg-white text-black p-1 cursor-pointer z-10 rounded-xl mb-3">
              UPLOAD FRAMES
              <input type="file" accept="image/png, image/jpeg, image/webp" multiple hidden v-on:change="getFiles" />
            </label>
          </div>

          <div align="center">
            <!--        <button class="upload-button button" type="button" @click="upload">Add Picture</button>-->
            <!-- <image-compressor :scale="scale" class="compressor" :done="getFiles"  :quality="quality" ref="compressor"></image-compressor> -->

            <div class="w-full flex flex-wrap gap-4 mt-12 mb-12" ref="framesContainerRef">
              <!-- <div class="w-full sm:w-1/2 pr-4 pl-4 md:w-1/3 pr-4 pl-4 lg:w-1/4 pr-4 pl-4 "> -->
              <Frame v-for="(item, index) in files" :key="'frame/' + item.original.name + index" :index="index"
                :original="item.original" v-model:duration="item.duration" @on-plus-click="duplicateFile(item)"
                @on-x-click="removeFile(item)" @on-compressed="
                  item.compressed = $event;
                frameCompressionState[index] = false;
                " @on-compressing="frameCompressionState[index] = $event" :compression-rate="quality" />
              <!-- </div> -->
              <Frame v-if="files.length == 0" :index="0" :duration="0.5" />
            </div>
          </div>
          <div class="w-full flex sm:flex-row flex-col-reverse sm:flex-wrap gap-16 sm:gap-0">
            <div class="w-full p-0 basis-full sm:basis-1/2">
              <button type="button" @click="generateGIF" :disabled="isCompilingGIF || isCompressing"
                class="mx-0 mb-16 sm:mb-24 min-w-[13.3rem] py-2 px-0 text-lg text-center transition-transform duration-200 hover:scale-110 bg-white text-black p-1 cursor-pointer z-10 rounded-xl disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100">
                <span v-if="isCompilingGIF"> Generating GIF... </span>
                <span v-else-if="isCompressing"> Compressing... </span>
                <span v-else> GENERATE GIF </span>
              </button>
            </div>
            <div class="flex-1 px-0 basis-full sm:basis-1/2">
              <div class="my-4 flex px-0 sm:pl-4 flex-col justify-center sm:justify-start sm:w-[40%] sm:min-w-[16rem]">
                <input type="range" :value="quality" @change="
                  quality = Number(($event.target as HTMLInputElement).value)
                  " min="1" max="100" class="" />
                <label class="mt-[1.2rem] text-center w-full text-2xl sm:text-base">.webp file quality – {{ quality
                }}%</label>
              </div>
            </div>
          </div>

          <div>
            <div class="flex flex-col md:flex-row w-full gap-x-12">
              <div class="basis-full md:basis-1/2 flex justify-center">
                <div :class="isCompilingGIF ? 'cursor-wait' : ''"
                  class="p-6 border border-opacity-20 border-white h-[30rem] w-full flex justify-center items-center mt-8">
                  <img v-if="gifSrc && files.length > 0" :src="gifSrc" alt="" class="w-full h-full object-contain" />
                  <span v-if="isCompilingGIF" class="text-4xl">{{ gifCompilationProgress }}%</span>
                </div>
              </div>
              <!-- col-12 col-sm-6 flex-fill frame-box d-flex align-items-center justify-content-center -->
              <div class="basis-full md:basis-1/2 flex-col flex max-w-sm mx-auto md:mx-0">
                <div class="w-full">
                  <div class="h-9 text-lg sm:text-base mb-1 mt-8">
                    GIF Quantity
                  </div>
                  <input type="number" v-model="quantity"
                    class="border border-solid border-white bg-transparent h-10 rounded-xl text-right pr-3 text-white w-full" />
                  <div class="h-9 mt-10 text-lg sm:text-base mb-1">Rarity</div>
                </div>
                <SelectRarity :selected-rarity="selectedRarity" @update:selected-rarity="selectedRarity = $event" />
                <div class="mt-14" :class="gifSrc && files.length > 0 ? 'block' : 'hidden'">
                  <div class="flex mt-3 justify-between text-gray-500">
                    <div>Frames</div>
                    <div>{{ files.length }}</div>
                  </div>
                  <div class="flex justify-between text-gray-500">
                    <div>Total items</div>
                    <div>{{ files.length + quantity }}</div>
                  </div>
                  <div class="flex justify-between text-gray-500">
                    <div>Final USD price</div>
                    <div v-show="usdPrice && totalFee">
                      ${{ (usdPrice * totalFee).toFixed(2) }}
                    </div>
                  </div>
                  <div class="flex justify-between text-gray-500">
                    <div>Final BTC price</div>
                    <div>{{ totalFee && totalFee.toFixed(8) }}</div>
                  </div>
                </div>
                <div class="w-full pr-4 pl-4">
                  <div>
                    <div class="flex justify-center pt-12 w-full">
                      <button @click="waitXV" :disabled="orderingState !== OrderingState.None"
                        class="mx-0 mt-6 min-w-[13.3rem] py-2 px-4 text-lg text-center transition-transform duration-200 hover:scale-110 bg-white text-black p-1 cursor-pointer z-10 rounded-xl disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100">
                        <span v-if="orderingState ===
                          OrderingState.RequestingWalletAddress
                          ">
                          Requesting Addresses...
                        </span>
                        <span v-else-if="orderingState === OrderingState.WaitingForCreation
                          ">
                          Creating order...
                        </span>
                        <span v-else-if="orderingState === OrderingState.WaitingForPayment
                          ">
                          Waiting for payment...
                        </span>
                        <span v-else> INSCRIBE </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <OrdersForAddress />

            <div class="w-full flex flex-wrap mt-48">
              <div class="w-full sm:w-1/2 pr-4 pl-4">
                <!--      <div class="w-full text-left input-title mt-3">Thank you</div>-->
                <!--      <div class="w-full text-left input-title">Link to transaction</div>-->
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
input[type="range"] {
  @apply appearance-none flex items-center h-px w-full m-0 p-0 border-0;
}

input[type="range"]::-webkit-slider-thumb {
  @apply appearance-none bg-white h-8 w-4 sm:h-6 sm:w-3 rounded-lg;
}
</style>
