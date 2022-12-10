<script lang="ts">
  import { onMount } from 'svelte'
  import { baseKg } from './constant'
  import { Mass } from './mass'
  import { Sim } from './sim'

  let canvas: HTMLCanvasElement
  let sim: Sim

  const kgMultiplierOptions = [1, 5, 10, 50, 100, 500, 1000, 100000]
  let kgMultiplier = kgMultiplierOptions[0]
  $: kg = baseKg * kgMultiplier

  let fixedPos = false

  const addMass = (
    e: MouseEvent & {
      currentTarget: EventTarget & HTMLCanvasElement
    }
  ) => {
    let rect = canvas.getBoundingClientRect()
    sim.addMass(
      new Mass({
        pos: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
        kg,
        vel: {
          x: 0,
          y: 0,
        },
        fixedPos,
      })
    )
  }

  onMount(() => {
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    sim = new Sim()
    sim.start(canvas, ctx)
  })
</script>

<canvas class="fixed" on:click={addMass} bind:this={canvas} />

<div
  class="absolute flex-col bottom-5 left-5 bg-white/10 hover:bg-white/90 transition-all rounded flex w-fit px-4 py-2"
>
  <div class="flex gap-4">
    <h1>Mass</h1>
    {#each kgMultiplierOptions as mul}
      <button
        on:click={() => (kgMultiplier = mul)}
        class:font-bold={mul === kgMultiplier}
        class:underline={mul === kgMultiplier}>x{mul}</button
      >
    {/each}
  </div>
  <div class="flex gap-4">
    <h1>Fixed Position</h1>
    <button
      on:click={() => {
        fixedPos = true
      }}
      class:font-bold={fixedPos}
      class:underline={fixedPos}>Yes</button
    >
    <button
      on:click={() => {
        fixedPos = false
      }}
      class:font-bold={!fixedPos}
      class:underline={fixedPos}>No</button
    >
  </div>
</div>
