<script setup lang="ts">
import { createClient } from '@supabase/supabase-js'
import { createInscription, BitcoinNetworkType } from 'sats-connect'

import Footer from './Footer.vue';
import { computed, ref } from 'vue';
const supabaseUrl = 'https://ftnvenogeqopznklvbia.supabase.co'
const supabaseKey = import.meta.env.VITE_APP_SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const email = ref("")
const isEmailValid = computed(() => {
    return email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
})
const isEmailSet = localStorage.getItem("EMAIL_SET") !== null;
const inscribe = async () => {
    if (!isEmailSet) {
        submitEmail()
    }
    createInscription({
        onFinish() { },
        onCancel() { },
        payload: {
            network: {
                type: BitcoinNetworkType.Mainnet
            },

            payloadType: "PLAIN_TEXT",
            contentType: 'text/html',
            content: `<body style="height: 100vh; margin:0;">
<img src="/content/f521bd6f20436933d980a326fd983f84d13a04bd952f12a52f57ea7d27fb00c3i0" style="width: 100%; height: 100%; object-fit: contain;">
</body>`,
        },
    })
}

const submitEmail = async () => {
    const { data, error } = await supabase.from('Emails').insert([{ email }])
    if (error) {
        localStorage.setItem("EMAIL_SET", '1')
        console.log(error)
    } else {
        console.log(data)
    }
}
</script>
<template>
    <main class="w-full bg-black text-white">
        <header class="px-6 relative">
            <div class="w-full flex flex-row justify-between border-b border-solid border-gray-700 pb-20 pt-6">
                <div class="basis-3/5 max-w-[280px]">
                    <img src="../assets/images/logo-white.png" alt="Logo" />
                </div>

                <a href="http://nome.wtf" class="underline underline-offset-8 basis-1/5 text-end">nome.wtf</a>
            </div>
            <div class="absolute -bottom-10 right-8 md:right-56 flex flex-col text-center text-xl italic">
                <span>Bitcoin</span>
                <span>Phone</span>
                <span>Wallpaper</span>
            </div>
        </header>
        <section class="w-full pt-16 p-6 md:p-14 pb-0 flex flex-col md:flex-row gap-16 max-w-[1440px]">
            <article class="xl:basis-1/3 basis-1/2 max-w-sm">
                <div class="text-4xl italic relative w-max mb-10">
                    <h3 class="text-lg">Thank you for visiting the</h3>
                    <hr class="bottom-4 absolute w-full border-t-[3px] z-0" />
                    <h1 class="text-center">BEAR MARKET</h1>
                </div>
                <p class="text-gray-500 italic text-sm">
                    The exhibition is designed as an immersive experience for the community
                    to showcase the new Bitcoin Ordinals technology.
                </p>
                <p class="mt-10 text-gray-500 italic text-sm">
                    To get a free BTC wallpaper on mobile:
                </p>

                <div class="w-full">
                    <ol class="mt-8 flex flex-col gap-2 text-sm">
                        <li>1. Download & install <a href="">Xverse</a> wallet</li>
                        <li>
                            2. Go to the browser section -
                            <img src="../assets/images/world_icon.png" alt="" class="h-4 inline" />
                        </li>
                        <li>
                            3. Enter URL on top:
                            <a class="inline underline underline-offset-4 italic" href="https://nome.gallery/miami">
                                nome.gallery/miami
                            </a>
                        </li>
                        <li>4. Proceed with the mint in the wallet</li>
                    </ol>
                </div>
            </article>
            <aside class="xl:basis-1/3 basis-1/2 w-full flex flex-col items-center relative">
                <img src="../assets/images/bear-wallpaper.png" alt="" class="w-auto max-h-[380px] mx-auto">
                <button type="button" @click="inscribe()" :disabled="!isEmailValid"
                    class="md:block hidden bg-white rounded-2xl text-black uppercase text-xl h-12 w-full max-w-[15rem] absolute -bottom-[8rem] disabled:opacity-50 disabled:cursor-not-allowed">
                    Free mint
                </button>

            </aside>
        </section>
        <section class="max-w-[1440px]">
            <form class="pt-8 p-6 md:p-8 md:pt-6 pb-0 w-full  flex flex-col md:flex-row gap-y-6 items-center">
                <input type="email" placeholder="email" name="email" v-model="email" autocomplete="new-password"
                    :class="{ 'border-red-500': email && !isEmailValid, 'border-green-500': isEmailValid }"
                    class="xl:basis-1/3 max-w-xs bg-black px-4 py-2 rounded-xl border border-solid border-gray-500 w-full placeholder:italic placeholder:text-gray-600 text-lg outline-0 transition-all"
                    required>
                <div class="xl:basis-1/3 text-center w-full">

                    <button :disabled="!isEmailValid" type="button" @click="inscribe()"
                        class="md:hidden bg-white rounded-2xl text-black uppercase text-xl h-12 w-full max-w-[15rem] disabled:opacity-50 disabled:cursor-not-allowed">
                        Free mint
                    </button>
                </div>
            </form>
        </section>
        <Footer />
    </main>
</template>
