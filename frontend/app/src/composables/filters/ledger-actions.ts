import { type ComputedRef, type Ref } from 'vue';
import { z } from 'zod';
import {
  type MatchedKeyword,
  type SearchMatcher,
  assetDeserializer,
  assetSuggestions,
  dateDeserializer,
  dateSerializer,
  dateValidator
} from '@/types/filtering';
import { LedgerActionType } from '@/types/history/ledger-action/ledger-actions-type';
import { getDateInputISOFormat } from '@/utils/date';

enum LedgerActionFilterKeys {
  ASSET = 'asset',
  TYPE = 'type',
  START = 'start',
  END = 'end',
  LOCATION = 'location'
}

enum LedgerActionFilterValueKeys {
  ASSET = 'asset',
  TYPE = 'type',
  START = 'fromTimestamp',
  END = 'toTimestamp',
  LOCATION = 'location'
}

type Matcher = SearchMatcher<
  LedgerActionFilterKeys,
  LedgerActionFilterValueKeys
>;
type Filters = MatchedKeyword<LedgerActionFilterValueKeys>;

export const useLedgerActionsFilter = () => {
  const filters: Ref<Filters> = ref({});

  const { associatedLocations } = storeToRefs(useAssociatedLocationsStore());
  const { dateInputFormat } = storeToRefs(useFrontendSettingsStore());
  const { assetSearch } = useAssetInfoApi();
  const { assetInfo } = useAssetInfoRetrievalStore();
  const { tc } = useI18n();

  const matchers: ComputedRef<Matcher[]> = computed(
    () =>
      [
        {
          key: LedgerActionFilterKeys.ASSET,
          keyValue: LedgerActionFilterValueKeys.ASSET,
          description: tc('ledger_actions.filter.asset'),
          asset: true,
          suggestions: assetSuggestions(assetSearch),
          deserializer: assetDeserializer(assetInfo)
        },
        {
          key: LedgerActionFilterKeys.TYPE,
          keyValue: LedgerActionFilterValueKeys.TYPE,
          description: tc('ledger_actions.filter.action_type'),
          string: true,
          suggestions: () => [...Object.values(LedgerActionType)],
          validate: type =>
            ([...Object.values(LedgerActionType)] as string[]).includes(type)
        },
        {
          key: LedgerActionFilterKeys.START,
          keyValue: LedgerActionFilterValueKeys.START,
          description: tc('ledger_actions.filter.start_date'),
          string: true,
          hint: tc('ledger_actions.filter.date_hint', 0, {
            format: getDateInputISOFormat(get(dateInputFormat))
          }),
          suggestions: () => [],
          validate: dateValidator(dateInputFormat),
          serializer: dateSerializer(dateInputFormat),
          deserializer: dateDeserializer(dateInputFormat)
        },
        {
          key: LedgerActionFilterKeys.END,
          keyValue: LedgerActionFilterValueKeys.END,
          description: tc('ledger_actions.filter.end_date'),
          string: true,
          hint: tc('ledger_actions.filter.date_hint', 0, {
            format: getDateInputISOFormat(get(dateInputFormat))
          }).toString(),
          suggestions: () => [],
          validate: dateValidator(dateInputFormat),
          serializer: dateSerializer(dateInputFormat),
          deserializer: dateDeserializer(dateInputFormat)
        },
        {
          key: LedgerActionFilterKeys.LOCATION,
          keyValue: LedgerActionFilterValueKeys.LOCATION,
          description: tc('ledger_actions.filter.location'),
          string: true,
          suggestions: () => get(associatedLocations),
          validate: location =>
            get(associatedLocations).includes(location as any)
        }
      ] satisfies Matcher[]
  );

  const updateFilter = (newFilters: Filters) => {
    set(filters, newFilters);
  };

  const OptionalString = z.string().optional();
  const RouteFilterSchema = z.object({
    [LedgerActionFilterValueKeys.TYPE]: OptionalString,
    [LedgerActionFilterValueKeys.LOCATION]: OptionalString,
    [LedgerActionFilterValueKeys.ASSET]: OptionalString,
    [LedgerActionFilterValueKeys.START]: OptionalString,
    [LedgerActionFilterValueKeys.END]: OptionalString
  });

  return {
    filters,
    matchers,
    updateFilter,
    RouteFilterSchema
  };
};
