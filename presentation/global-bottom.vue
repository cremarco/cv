<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const { currentPage, total } = useNav()

// Keep the cover (slide 1) clean — no chrome there.
const show = computed(() => currentPage.value > 1)

// Fill the bar proportionally; the last slide reads as full.
const progress = computed(() => Math.min(currentPage.value / Math.max(total.value, 1), 1))
</script>

<template>
  <div v-if="show" class="aipp-chrome">
    <div class="aipp-progress" aria-hidden="true">
      <div class="aipp-progress-fill" :style="{ transform: `scaleX(${progress})` }" />
    </div>
    <div class="aipp-pageno">
      <span class="aipp-pageno-current">{{ currentPage }}</span>
      <span class="aipp-pageno-sep">/</span>
      <span class="aipp-pageno-total">{{ total }}</span>
    </div>
  </div>
</template>

<style scoped>
.aipp-chrome {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
  font-family: var(--aipp-font);
}

/* Thin, full-bleed rounded track pinned to the slide's bottom edge. */
.aipp-progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--aipp-line);
  overflow: hidden;
}

.aipp-progress-fill {
  width: 100%;
  height: 100%;
  transform-origin: left center;
  border-radius: 0 3px 3px 0;
  background: var(--aipp-accent-gradient);
  background-size: 100% 100%;
  transition: transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* Quiet page counter in the bottom-right margin. */
.aipp-pageno {
  position: absolute;
  right: 1.7rem;
  bottom: 1.1rem;
  display: flex;
  gap: 0.3rem;
  align-items: baseline;
  font-size: 0.82rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
  color: var(--aipp-faint);
}

.aipp-pageno-current {
  color: var(--aipp-soft);
  font-weight: 680;
}

.aipp-pageno-sep {
  opacity: 0.55;
}

@media (prefers-reduced-motion: reduce) {
  .aipp-progress-fill {
    transition: none;
  }
}
</style>
