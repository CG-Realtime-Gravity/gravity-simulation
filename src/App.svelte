<script lang="ts">
  import { onMount } from 'svelte'
  import { baseKg } from './constant'
  import { Mass } from './mass'
  import { Sim, type ColorMode, type Mode } from './sim'
  import Icon from '@iconify/svelte'

  type Direction = 'up' | 'down' | 'left' | 'right'

  let canvas: HTMLCanvasElement
  const sim = new Sim()

  let dragging = false

  const kgMultiplierOptions = [1, 5, 10, 50, 100, 500, 1000, 100000]
  let kgMultiplier = kgMultiplierOptions[0]
  $: kg = baseKg * kgMultiplier

  let fixedPos = false

  let direction: Direction = 'left'
  const directions: Direction[] = ['up', 'down', 'left', 'right']

  let speed = 0
  const speedOptions = [0, 0.1, 0.2, 0.3, 0.5, 1, 5]

  let mode: Mode = 'normal'
  const modes: Mode[] = ['normal', 'combine']

  let running = true
  $: sim.setRunning(running)

  const colorModes: ColorMode[] = ['size', 'gravity']
  let colorMode: ColorMode = colorModes[0]
  $: {
    sim.setColorMode(colorMode)
  }

  const addMass = (clientX: number, clientY: number) => {
    let rect = canvas.getBoundingClientRect()
    sim.addMass(
      new Mass({
        pos: {
          x: clientX - rect.left,
          y: clientY - rect.top,
        },
        kg,
        vel: {
          x: direction === 'left' ? -speed : direction === 'right' ? speed : 0,
          y: direction === 'up' ? -speed : direction === 'down' ? speed : 0,
        },
        fixedPos,
      })
    )
  }

  onMount(() => {
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    sim.start(canvas, ctx)
  })
</script>

<canvas
  on:mousedown={() => {
    dragging = true
  }}
  on:mouseup={() => {
    dragging = false
  }}
  on:mousemove={(e) => {
    if (dragging) addMass(e.clientX, e.clientY)
  }}
  on:touchstart={() => {
    dragging = true
  }}
  on:touchend={() => {
    dragging = false
  }}
  on:touchmove={(e) => {
    if (dragging) addMass(e.touches[0].clientX, e.touches[0].clientY)
  }}
  class="fixed"
  on:click={(e) => {
    addMass(e.clientX, e.clientY)
  }}
  bind:this={canvas}
/>

<div
  class="absolute flex-col bottom-5 select-none left-5 bg-white/5 hover:bg-white/90 transition-all rounded flex w-fit px-4 py-2 gap-3"
>
  <div class="flex-col">
    <div class="flex gap-4">
      <h1 class="font-bold">Mass:</h1>
      {#each kgMultiplierOptions as mul}
        <button
          on:click={() => {
            kgMultiplier = mul
            fixedPos = false
          }}
          class={mul === kgMultiplier ? 'text-black' : 'text-black/30'}
          >x{mul}</button
        >
      {/each}
    </div>
    <span class="text-sm">base mass {baseKg.toLocaleString('en-US')} kg</span>
  </div>
  <div class="flex gap-4">
    <h1 class="font-bold">Fixed Position:</h1>
    <button
      on:click={() => {
        fixedPos = true
      }}
      class={fixedPos ? 'text-black' : 'text-black/30'}
      >Yes</button
    >
    <button
      on:click={() => {
        fixedPos = false
      }}
      class={!fixedPos ? 'text-black' : 'text-black/30'}
      >No</button
    >
  </div>
    <div class="flex gap-4">
      <h1 class="font-bold">Speed:</h1>
      {#each speedOptions as sp}
        <button
          on:click={() => {
            speed = sp
          }}
          class={sp === speed ? 'text-black' : 'text-black/30'}
          >{sp}</button
        >
      {/each}
    </div>
    <div class="flex gap-4">
      <h1 class="font-bold">Direction:</h1>
      {#each directions as dir}
        <button
          on:click={() => {
            direction = dir
          }}
          >
          <Icon 
            icon={dir === 'up' ? 'material-symbols:arrow-upward-rounded' : dir === 'down' ? 'material-symbols:arrow-downward-rounded' : dir === 'left' ? 'material-symbols:arrow-back-rounded' : 'material-symbols:arrow-forward-rounded'}
            class={`text-2xl ${dir === direction?'text-black':'text-black/30'}`}
          />
        </button>
      {/each}
    </div>
  <div class="flex gap-4">
    <h1 class="font-bold">Mode:</h1>
    {#each modes as m}
      <button
        on:click={() => {
          sim.setMode(m)
          mode = m
        }}
        class={m === mode ? 'text-black' : 'text-black/30'}
        >{m}</button
      >
    {/each}
  </div>
  <div class="flex gap-4">
    <h1 class="font-bold">Simulation:</h1>
    <button
      on:click={() => {
        running = !running
      }}
    >
      <Icon
        icon={running === false
          ? 'material-symbols:play-arrow-outline-rounded'
          : 'material-symbols:pause-outline-rounded'}
        class="text-2xl"
      />
    </button>
  </div>
  <div class="flex gap-4">
    <h1>Coloring</h1>
    {#each colorModes as m}
      <button
        on:click={() => {
          colorMode = m
        }}
        class:font-bold={m === colorMode}
        class:underline={m === colorMode}>{m}</button
      >
    {/each}
  </div>
  <button on:click={() => sim.reset()} class="flex w-content">clear</button>
</div>
