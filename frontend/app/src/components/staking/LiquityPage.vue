<script setup lang="ts">
import { Module } from '@/types/modules';
import { Section } from '@/types/status';

const modules = [Module.LIQUITY];
const { isModuleEnabled } = useModules();
const { fetchStaking, fetchPools } = useLiquityStore();
const { shouldShowLoadingScreen } = useStatusStore();
const moduleEnabled = isModuleEnabled(modules[0]);
const loading = shouldShowLoadingScreen(Section.DEFI_LIQUITY_STAKING);
const premium = usePremium();

const load = async () => {
  await fetchStaking();
  await fetchPools();
};

onMounted(async () => {
  if (get(moduleEnabled)) {
    await load();
  }
});

watch(moduleEnabled, async enabled => {
  if (enabled) {
    await load();
  }
});

const { tc } = useI18n();
</script>

<template>
  <div>
    <no-premium-placeholder
      v-if="!premium"
      :text="tc('liquity_page.no_premium')"
    />
    <module-not-active v-else-if="!moduleEnabled" :modules="modules" />
    <progress-screen v-else-if="loading">
      <template #message>
        {{ tc('liquity_page.loading') }}
      </template>
    </progress-screen>
    <div v-else>
      <liquity-staking-details>
        <template #modules>
          <active-modules :modules="modules" />
        </template>
      </liquity-staking-details>
    </div>
  </div>
</template>
