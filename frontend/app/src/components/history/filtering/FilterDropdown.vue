<script setup lang="ts">
import { type AssetInfo } from '@rotki/common/lib/data';
import { type ComputedRef, type Ref } from 'vue';
import { type SearchMatcher, type Suggestion } from '@/types/filtering';
import { compareSymbols } from '@/utils/assets';
import { logger } from '@/utils/logging';
import { splitSearch } from '@/utils/search';

const props = withDefaults(
  defineProps<{
    matchers: SearchMatcher<any>[];
    used: string[];
    suggestion?: SearchMatcher<any> | null;
    keyword?: string;
    selectedSuggestion: number;
  }>(),
  {
    suggestion: () => null,
    keyword: ''
  }
);

const emit = defineEmits<{
  (e: 'click', item: string): void;
  (e: 'suggest', item: Suggestion): void;
  (e: 'apply:filter', item: Suggestion): void;
}>();

const { keyword, suggestion, selectedSuggestion } = toRefs(props);

const css = useCssModule();

const lastSuggestion: Ref<Suggestion | null> = ref(null);
const suggested: Ref<Suggestion[]> = ref([]);

const available: ComputedRef<SearchMatcher<any>[]> = computed(
  ({ matchers, used }: { matchers: SearchMatcher<any>[]; used: string[] }) =>
    matchers.filter(({ key, multiple }) => !used.includes(key) || multiple)
);

const updateSuggestion = (value: Suggestion[], index: number) => {
  set(lastSuggestion, value[index]);
  emit('suggest', {
    index,
    key: value[index].key,
    value: value[index].value,
    asset: value[index].asset,
    total: value.length
  });
};

const click = (key: string) => {
  if (key.trim().length > 0) {
    emit('click', key);
  }
};

const applyFilter = (item: Suggestion) => {
  const value = typeof item.value === 'string' ? item.value : item.value.symbol;
  if (value) {
    emit('apply:filter', item);
  }
};

watch(selectedSuggestion, index => {
  updateSuggestion(get(suggested), index);
});

watch(suggested, value => {
  if (value.length > 0) {
    if (get(lastSuggestion) !== value[0]) {
      updateSuggestion(value, 0);
    }
  } else {
    set(lastSuggestion, null);
    emit('suggest', { key: '', index: 0, total: 0 } as Suggestion);
  }
});

watch([keyword, suggestion], async ([keyword, suggestion]) => {
  if (!keyword || !suggestion) {
    return [];
  }

  const search = splitSearch(keyword);
  const suggestedFilter = suggestion.key;

  const searchString = search[1] ?? '';
  let suggestedItems: { key: string; value: string | AssetInfo }[] = [];
  if ('string' in suggestion) {
    suggestedItems = suggestion.suggestions().map(item => ({
      key: suggestedFilter,
      value: item
    }));
  } else if ('asset' in suggestion) {
    if (searchString) {
      suggestedItems = (await suggestion.suggestions(searchString)).map(
        asset => {
          return {
            key: suggestedFilter,
            value: asset
          };
        }
      );
    }
  } else {
    logger.debug('Matcher is missing asset=true or string=true', suggestion);
  }
  set(
    suggested,
    suggestedItems
      .sort((a, b) => {
        const aText =
          typeof a.value === 'string'
            ? a.value
            : `${a.value.symbol} ${a.value.evmChain}`;
        const bText =
          typeof b.value === 'string'
            ? b.value
            : `${b.value.symbol} ${b.value.evmChain}`;
        return compareSymbols(aText, bText, searchString);
      })
      .slice(0, 5)
      .map((a, index) => ({
        index,
        key: a.key,
        value: a.value,
        asset: typeof a.value !== 'string',
        total: suggestedItems.length
      }))
  );
});

const { t } = useI18n();
</script>

<template>
  <div class="px-4 py-1">
    <div v-if="suggestion">
      <div v-if="suggested.length > 0" class="pb-2" :class="css.suggestions">
        <div
          v-for="(item, index) in suggested"
          :key="item.index"
          :tabindex="index"
        >
          <v-btn
            text
            color="primary"
            :class="{
              'fill-width': true,
              [css.selected]: index === selectedSuggestion
            }"
            class="text-none text-body-1 px-3"
            @click="applyFilter(item)"
          >
            <span class="text-start fill-width">
              <suggested-item :suggestion="item" />
            </span>
          </v-btn>
        </div>
      </div>
      <div v-else class="pb-0">
        <div class="text--secondary">
          {{ t('table_filter.no_suggestions', { search: keyword }) }}
        </div>
      </div>
      <div
        v-if="suggestion.hint"
        class="caption-text text--secondary text-wrap"
      >
        {{ suggestion.hint }}
      </div>
    </div>
    <div v-else-if="keyword" class="pb-2">
      <span>{{ t('table_filter.unsupported_filter') }}</span>
      <span class="font-weight-medium ms-2">{{ keyword }}</span>
    </div>
    <div v-if="!suggestion">
      <div class="caption-text text--secondary">
        {{ t('table_filter.title') }}
      </div>
      <v-divider class="my-2" />
      <div :class="css.suggestions">
        <filter-entry
          v-for="matcher in available"
          :key="matcher.key"
          :matcher="matcher"
          @click="click($event)"
        />
      </div>
    </div>

    <div class="caption-text text--secondary text--lighten-2 mt-2">
      <v-divider class="my-2" />
      <span>{{ t('table_filter.hint.description') }}</span>
      <span class="font-weight-medium">
        {{ t('table_filter.hint.example') }}
      </span>
    </div>
    <div class="caption-text text--secondary text--lighten-2 mt-1">
      {{ t('table_filter.hint_filter') }}
    </div>
  </div>
</template>

<style module lang="scss">
.selected {
  background-color: var(--v-primary-lighten4);
}

.suggestions {
  max-height: 180px;
  overflow-y: scroll;
}
</style>
