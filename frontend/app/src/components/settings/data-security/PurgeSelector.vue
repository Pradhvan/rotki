<script setup lang="ts">
import { type PropType } from 'vue';
import { type BaseMessage } from '@/types/messages';
import { SUPPORTED_MODULES } from '@/types/modules';
import {
  ALL_CENTRALIZED_EXCHANGES,
  ALL_DECENTRALIZED_EXCHANGES,
  ALL_MODULES,
  ALL_TRANSACTIONS,
  PURGABLE,
  type PurgeParams,
  type Purgeable
} from '@/types/session/purge';

defineProps({
  value: { required: true, type: String as PropType<Purgeable> },
  status: {
    required: false,
    type: Object as PropType<BaseMessage | null>,
    default: null
  },
  pending: { required: false, type: Boolean, default: false }
});

const emit = defineEmits<{
  (e: 'input', value: Purgeable): void;
  (e: 'purge', value: PurgeParams): void;
}>();

const input = (value: Purgeable) => emit('input', value);
const purge = (payload: PurgeParams) => emit('purge', payload);

const { tc } = useI18n();
const { tradeLocations } = useTradeLocations();

const text = (source: Purgeable) => {
  const location = get(tradeLocations).find(
    ({ identifier }) => identifier === source
  );
  if (location) {
    return tc('purge_selector.exchange', 0, {
      name: location.name
    });
  }

  const module = SUPPORTED_MODULES.find(
    ({ identifier }) => identifier === source
  );
  if (module) {
    return tc('purge_selector.module', 0, { name: module.name });
  }

  if (source === ALL_TRANSACTIONS) {
    return tc('purge_selector.ethereum_transactions');
  } else if (source === ALL_CENTRALIZED_EXCHANGES) {
    return tc('purge_selector.all_exchanges');
  } else if (source === ALL_MODULES) {
    return tc('purge_selector.all_modules');
  } else if (source === ALL_DECENTRALIZED_EXCHANGES) {
    return tc('purge_selector.all_decentralized_exchanges');
  }
  return source;
};

const purgable = PURGABLE.map(id => ({
  id,
  text: text(id)
})).sort((a, b) => (a.text < b.text ? -1 : 1));
</script>

<template>
  <div>
    <v-row class="mb-0" align="center">
      <v-col>
        <v-autocomplete
          outlined
          :value="value"
          :label="tc('purge_selector.label')"
          :items="purgable"
          item-text="text"
          item-value="id"
          :disabled="pending"
          hide-details
          @input="input"
        />
      </v-col>
      <v-col cols="auto">
        <v-tooltip open-delay="400" top>
          <template #activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              icon
              :disabled="!value || pending"
              :loading="pending"
              v-on="on"
              @click="purge({ source: value, text: text(value) })"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span> {{ tc('purge_selector.tooltip') }} </span>
        </v-tooltip>
      </v-col>
    </v-row>

    <action-status-indicator v-if="status" :status="status" />
  </div>
</template>
