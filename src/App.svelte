<script lang="ts">
  import { onMount } from 'svelte'
  import { Mass } from './mass'
  import { Sim } from './sim'

  let canvas: HTMLCanvasElement
  let sim: Sim

  const addMass = (
    e: MouseEvent & {
      currentTarget: EventTarget & HTMLCanvasElement
    }
  ) => {
    console.log(e.screenX, e.screenY)
    let rect = canvas.getBoundingClientRect()
    sim.addMass(
      new Mass({
        pos: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
        kg: 200_000_000_00,
        vel: {
          x: 2,
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
    let rect = canvas.getBoundingClientRect()
    sim.addMass(
      new Mass({
        pos: {
          x: canvas.width / 2,
          y: canvas.height / 2,
        },
        kg: 200_000_000_000_00,
        vel: {
          x: 0,
          y: 0,
        },
      })
    )
    sim.start(canvas, ctx)
  })
</script>

<canvas on:click={addMass} bind:this={canvas} />
