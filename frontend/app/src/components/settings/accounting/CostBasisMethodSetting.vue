<script setup lang="ts">
import { CostBasisMethod } from '@/types/user';

const costBasisMethod = ref<CostBasisMethod>(CostBasisMethod.FIFO);
const { costBasisMethod: method } = storeToRefs(useAccountingSettingsStore());

onMounted(() => {
  set(costBasisMethod, get(method));
});

const { tc } = useI18n();

const getSuccessMessage = (method: string) =>
  tc('account_settings.messages.cost_basis_method.success', 0, {
    method: method.toUpperCase()
  });

const getErrorMessage = (method: string) =>
  tc('account_settings.messages.cost_basis_method.error', 0, {
    method: method.toUpperCase()
  });
</script>

<template>
  <settings-option
    #default="{ error, success, update }"
    setting="costBasisMethod"
    :success-message="getSuccessMessage"
    :error-message="getErrorMessage"
  >
    <cost-basis-method-settings
      v-model="costBasisMethod"
      class="accounting-settings__cost-basis-method pt-4"
      :success-messages="success"
      :error-messages="error"
      :label="tc('accounting_settings.labels.cost_basis_method')"
      color="primary"
      @change="update"
    />
  </settings-option>
</template>
