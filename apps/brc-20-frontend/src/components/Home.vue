
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
          <span class="lg:block">
           BRC-20 is an experimental standard for fungible tokens on the Bitcoin blockchain. BRC-20 tokens unlock new capabilities for the Bitcoin network, such as their use in DeFi protocols and blockchain applications.
          </span>



        </div>

      </main>
    </div>
    <Footer />
<!--    <Footer />-->
  </div>
</template>

<style scoped>

</style>
<script setup lang="ts">
import Footer from "./shared/Footer.vue";
import Header from "./shared/Header.vue";
</script>
