<script>
  import "../styles/app.css";
  import "../styles/fonts.css";

  import Page from "../components/page.svelte";
  import WritingPad from "../components/writing_pad.svelte";
  import GithubButton from "../components/github_button.svelte";
  import LogoAnim from "../components/logo_anim.svelte";
  import { onMount } from "svelte";
  import { logoActive } from "../stores/store.js";
  import Game from "../components/game.svelte";

  let logoActiveVal;

  logoActive.subscribe(value => {
    logoActiveVal = value;
  });

  // import "snapsvg-cjs"

  let shareApp = () => {
    if (navigator.share) {
      // Web Share API is supported
      navigator.share({
        title: "PeaceBox",
        text: "The PeaceBox App on iOS",
        url: "https://apps.apple.com/us/app/peacebox-tools-for-your-mind/id1592436336"
      }).then(() => {
        console.log("Thanks for sharing!");
      });
    } else {
      // Fallback
    }
  };

  onMount(() => {
    setTimeout(() => {
      logoActive.update(() => 1);
      setTimeout(() => {
        logoActive.update(() => 2);

        setTimeout(() => {
          logoActive.update(() => 3);
        }, 300);
      }, 2000);
    }, 100);
  });
</script>

<Page home="true">

  <!-- Hi, I'm PeaceBox - Section 1 -->
  <div class="relative block [height:80vh] mx-auto max-w-[86rem]">
    <div
      class="mt-20 sm:mt-32 md:mt-60 px-4 lg:px-16 block md:flex flex-row justify-between w-full h-full">
      <div
        class="justify-center flex w-full basis-full md:basis-2/3 lg:basis-3/5 sm:mr-10 px-4 lg:px-0">
        <div class="container max-w-xl z-10">
          <p class="text-4xl sm:text-5xl lg:text-6xl font-vollkorn font-light text-primary">Your Mental Toolbox</p>
          <p class="text-lg text-black font-baloo2 font-extralight sm:max-w-prose mb-3 text-primary sm:pl-1.5 mt-8">
            We all deal with stress and anxiety in our lives but most of us don't know how to effectively let go of
            it.
          </p>
          <p
            class="mb-10 text-lg text-black font-baloo2 font-extralight sm:max-w-prose text-primary mt-6 sm:mt-0 sm:pl-1.5">
            PeaceBox is like a toolbox for your mind with the tools and techniques you need to relax and de-stress.
          </p>
          <div
            class="flex flex-col sm:flex-row items-center justify-center sm:justify-between flex-wrap lg:flex-nowrap">
            <div class="flex flex-row items-center justify-center sm:justify-between">
              <a href=" https://apps.apple.com/us/app/peacebox-tools-for-your-mind/id1592436336"
                 aria-label="Visit PeaceBox on the Appstore">
                <img src="../assets/appstore.svg" class="w-44 borderAppStore min-w-32">
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.neiltools&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
                <img
                  class="w-60 min-w-40"
                  alt="Get it on Google Play"
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" />
              </a>
            </div>
            <div class="mt-4 sm:mt-0">
              <GithubButton />
            </div>
          </div>

        </div>
      </div>
      <div
        id="boxTrigger"
        class="disableSelect opacity-90 md:opacity-100 justify-center w-full flex md:basis-1/3 lg:basis-2/5"
        style="min-height: 400px; min-width: 400px">
        <!--        <div-->
        <!--          class="md:w-full md:h-full lg:h-72 lg:w-72 rounded-5xl lg:rounded-6xl logoMain opacityLogo logoContainer">-->
        <!--          <div-->
        <!--            class="block justify-center items-center"-->
        <!--          >-->
        <!--            <div id="boxCanvas" style="height: 400px; width: 400px">-->
        <!--              {#if logoActiveVal <= 2}-->
        <!--                <LogoAnim active={logoActiveVal} />-->
        <!--              {/if}-->
        <!--              {#if logoActiveVal >= 2}-->

        <!--                <div class:opacity-0={logoActiveVal <= 2}-->
        <!--                     class:relative={logoActiveVal >= 2}>-->
        <!--                  <Game />-->
        <!--                </div>-->
        <!--              {/if}-->

        <!--            </div>-->
        <!--          </div>-->

        <div
          class="disableSelect scale-75 opacity-90 md:opacity-100 md:scale-100 justify-center w-full relative md:basis-1/3 lg:basis-2/5">
          <div
            class="relative md:w-full md:h-full lg:h-72 lg:w-72 rounded-5xl lg:rounded-6xl logoMain opacityLogo logoContainer">
            <div id="boxCanvas">
              {#if logoActiveVal <= 2}
                <LogoAnim active={logoActiveVal} />
              {/if}
              {#if logoActiveVal >= 2}
                <div
                  class="absolute block justify-center items-center"
                  style="width: 400px; height: 400px"
                  class:opacity-0={logoActiveVal <= 2}
                >
                  <Game />
                </div>
              {/if}
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Dont Pay for Peace - Section 2 -->
  <div class="my-80 mt-96 md:mt-72">
    <div
      class="sm:px-4 lg:px-4 flex flex-col md:flex-row justify-between items-center justify-center w-full"
      id="section2">


      <div
        class="disableSelect z-0 items-center sm:-translate-y-3 md:-translate-y-0 md:mt-10 w-3/2 sm:w-full flex md:fixed md:relative basis-full md:basis-1/2">
        <div class="rounded-5xl lg:rounded-6xl mx-auto absolute smallTapes md:tapesImage">
          <!--          <div class="absolute -top-12 left-12">-->
          <!--            <BreathingAnim/>-->
          <!--          </div>-->
          <img src="../assets/homepage_image2.webp" />
        </div>
      </div>

      <div class="justify-center relative flex basis-1/2 px-4 lg:px,-0 mx-4 z-10 sm:mr-5 mobileCard" id="section2Card">

        <div class="container w-full md:w-fit md:max-w-xl">
          <p class="text-5xl sm:text-6xl lg:text-6xl font-vollkorn font-light text-primary sm:whitespace-nowrap">Don't
            Pay for Peace&nbsp;
            <i class="fa-solid fa-hand-peace fa-sm"></i>

          </p>
          <p class="text-lg font-baloo2 font-extralight sm:max-w-prose mt-8 mb-3 text-primary sm:pl-1.5">
            With journaling tools, breathing exercises, and audio meditation tapes, you'll always have your mental
            toolbox in your back pocket
          </p>
          <p class="text-lg font-vollkorn font-extralight sm:max-w-prose mt-8 mb-3 text-primary sm:pl-1.5">
            PeaceBox is completely <strong class="font-bold">free</strong> and will never have ads. Content and tools
            are available to all users free of cost.
          </p>
          <div class="flex-row flex align-middle items-center sm:pl-1.5 mt-8 max-w-sm md:max-w-full">
            <a href="https://apps.apple.com/us/app/peacebox-tools-for-your-mind/id1592436336"
               aria-label="Visit PeaceBox on the Appstore">
              <img src="../assets/appstore.svg" class="w-44 borderAppStore min-w-32">
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.neiltools&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
              <img
                class="w-60 min-w-40 ml-4"
                alt="Get it on Google Play"
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" />
            </a>
          </div>
        </div>
      </div>

    </div>

    <div class="my-80 mt-96 md:mt-72 flex justify-center">
      <WritingPad size={6} />
    </div>
    <!-- Put your worries into words - Section 3 -->
    <!--  <div class="my-80 md:mt-72">-->
    <!--    <div-->
    <!--      class="sm:px-4 lg:px-4 flex flex-col md:flex-row justify-between items-center justify-center w-full">-->

    <!--      <div-->
    <!--        class="z-0 items-center sm:-translate-y-3 md:-translate-y-0 md:mt-10 w-3/2 sm:w-full flex md:fixed md:relative basis-full md:basis-1/2">-->
    <!--        <div class="rounded-5xl lg:rounded-6xl mx-auto absolute">-->
    <!--          &lt;!&ndash;          <img src="../assets/homepage_image2.png" />&ndash;&gt;-->
    <!--          <textarea class="outline-0 border-black rounded-lg w-40 h-72" placeholder="Put down your thoughts" cols="40"-->
    <!--                    rows="5"></textarea>-->
    <!--        </div>-->
    <!--      </div>-->

    <!--      <div class="justify-center flex basis-1/2 px-4 lg:px-0 mx-4 z-10 sm:mr-5 mobileCard lg:antiMobileCard">-->
    <!--        <div class="container w-full md:w-fit md:max-w-xl">-->
    <!--          <p class="text-5xl sm:text-6xl lg:text-6xl font-vollkorn font-light text-primary sm:whitespace-nowrap">Don't-->
    <!--            Pay for Peace &nbsp;<i class="fa-solid fa-hand-peace fa-sm"></i></p>-->
    <!--          <p class="text-lg font-baloo2 font-extralight sm:max-w-prose mt-8 mb-3 text-primary sm:pl-1.5">-->
    <!--            With journaling tools, breathing exercises, and audio meditation tapes, you'll always have your mental-->
    <!--            toolbox in your back pocket-->
    <!--          </p>-->
    <!--          <p class="text-lg font-vollkorn font-extralight sm:max-w-prose mt-8 mb-3 text-primary sm:pl-1.5">-->
    <!--            PeaceBox is completely <strong class="font-bold">free</strong> and will never have ads. Content and tools-->
    <!--            are available to all users free of cost.-->
    <!--          </p>-->
    <!--          <a href="https://apps.apple.com/us/app/peacebox-tools-for-your-mind/id1592436336">-->
    <!--            <img src="../assets/appstore.svg" class="w-32 mt-10 borderAppStore min-w-20">-->
    <!--          </a>-->
    <!--        </div>-->
    <!--      </div>-->
    <!--    </div>-->

    <!--    &lt;!&ndash;    <div>&ndash;&gt;-->
    <!--    &lt;!&ndash;      <Game/>&ndash;&gt;-->
    <!--    &lt;!&ndash;    </div>&ndash;&gt;-->
    <!--  </div>-->
</Page>
