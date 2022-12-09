<script lang="ts">
  import { onMount } from 'svelte'

  let canvas: HTMLCanvasElement

  onMount(() => {
    const ctx = canvas.getContext('2d')
  })
</script>

<canvas bind:this={canvas} />
