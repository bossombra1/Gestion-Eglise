<template>
  <div class="space-y-5">
    <header class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div><slot name="header" /></div>
      <div><slot name="actions" /></div>
    </header>
    <section><slot /></section>
  </div>
</template>
