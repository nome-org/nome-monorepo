<script setup lang="ts">

import { useRoute } from 'vue-router'
import { useAuth } from '../../util/useAuth';
const currentRoute = useRoute().path
const {
  auth
} = useAuth()
</script>
<template>
  <header class="flex justify-between w-full">
    <div class="flex-1 p-8 pl-12">
      <div class="drawer">
        <input id="my-drawer" type="checkbox" class="drawer-toggle peer" />
        <div class="drawer-content peer-checked:italic">
          <label for="my-drawer"
            class="uppercase border-b-2 gap-x-1 flex text-lg drawer-button w-max cursor-pointer relative z-20 active:italic">
            <span v-for="item in 'Menu'.split('')">{{ item }}</span>
          </label>
        </div>
        <div class="drawer-side">
          <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay "></label>
          <ul class="pt-24 w-80 min-h-full pl-10">
            <li :class="currentRoute === '/intro' && 'text-white hover:text-white'"
              class="mb-4 text-base-content hover:text-gray-200">
              <router-link to="/intro">→ verify</router-link>
            </li>
            <!-- FIXME: add cursor disabled when not logged in -->
            <li v-if="auth.isLoggedIn" :class="currentRoute === '/gallery' && 'text-white hover:text-white'"
              class="mb-4 text-base-content hover:text-gray-200">
              <router-link to="/gallery">→ expo</router-link>
            </li>
            <li v-if="auth.isLoggedIn" :class="currentRoute === '/gif' && 'text-white hover:text-white'"
              class="mb-4 text-base-content hover:text-gray-200">
              <router-link to="/gif">→ gif</router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="relative flex flex-col items-center flex-1">
      <h1
        class="uppercase text-white text-2xl text-center flex justify-between w-3/4 max-w-[18rem] sm:w-full mx-auto mt-8">
        <span v-for="item in 'Gallery'.split('')">{{ item }}</span>
      </h1>
      <img src="../../assets/images/logo-white.png" alt="NoMe logo" class="w-3/4 max-w-[18rem] sm:w-full mx-auto mt-8" />
    </div>
    <div class="pt-8 pr-12 flex gap-x-8 flex-1 justify-end">
      <a href="https://twitter.com/nome_nft" target="_blank">
        <img src="../../assets/images/twitter-icon.png" alt=""
          class="hover:opacity-80 transition-all opacity-50 w-[1.6rem] h-[1.6rem] invert">
      </a>
      <a href="https://discord.gg/nome" target="_blank">
        <img src="../../assets/images/discord-icon.png" alt=""
          class="hover:opacity-80 transition-all opacity-50 w-[1.6rem] h-[1.6rem] invert">
      </a>
      <a href="https://youtube.com/@nome_nft" target="_blank">
        <img src="../../assets/images/youtube-icon.png" alt=""
          class="hover:opacity-80 transition-all opacity-50 w-[1.6rem] h-[1.6rem] invert">
      </a>
    </div>
  </header>
</template>