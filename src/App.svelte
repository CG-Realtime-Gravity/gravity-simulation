<script lang="ts">
  import { onMount } from 'svelte'
  import { Mass } from './mass'
  import { Sim } from './sim'

  let canvas: HTMLCanvasElement
  let sim: Sim

  const baseKg = 200_000_000_000

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
        kg: baseKg,
        vel: {
          x: 0,
          y: 0,
        },
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

<canvas on:click={addMass} bind:this={canvas} />
