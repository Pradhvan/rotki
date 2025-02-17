<script setup lang="ts">
import { type ComputedRef, type PropType } from 'vue';
import { Routes } from '@/router/routes';
import {
  type TradeLocation,
  type TradeLocationData
} from '@/types/history/trade/location';

const props = defineProps({
  identifier: { required: true, type: String as PropType<TradeLocation> },
  icon: { required: false, type: Boolean, default: false },
  size: { required: false, type: String, default: '24px' },
  opensDetails: { required: false, type: Boolean, default: true },
  detailPath: { required: false, type: String, default: '' }
});

const { identifier, detailPath } = toRefs(props);

const { getLocation } = useLocationInfo();

const location: ComputedRef<TradeLocationData> = computed(() =>
  getLocation(get(identifier))
);

const route = computed<{ path: string }>(() => {
  if (get(detailPath)) {
    return { path: get(detailPath) };
  }

  const path = get(location).detailPath;
  if (path) {
    return { path };
  }

  return {
    path: Routes.LOCATIONS.replace(':identifier', get(location).identifier)
  };
});
</script>

<template>
  <navigator-link :enabled="opensDetails" :to="route" component="div">
    <list-item
      v-bind="$attrs"
      class="my-0 text-center"
      :show-details="false"
      :title="location.name"
    >
      <template #icon>
        <location-icon
          class="location-display"
          :item="location"
          :icon="icon"
          :size="size"
        />
      </template>
    </list-item>
  </navigator-link>
</template>

<style scoped lang="scss">
.location-display {
  width: 100%;
}
</style>
