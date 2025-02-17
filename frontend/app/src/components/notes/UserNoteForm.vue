<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { type PropType } from 'vue';
import { type UserNote } from '@/types/notes';

const props = defineProps({
  value: {
    required: true,
    type: Object as PropType<Partial<UserNote>>
  }
});

const emit = defineEmits(['input', 'valid']);

const { t } = useI18n();
const { value } = toRefs(props);

const input = (newInput: Partial<UserNote>) => {
  emit('input', { ...get(value), ...newInput });
};

const rules = {
  content: {
    required: helpers.withMessage(
      t('notes_menu.rules.content.non_empty').toString(),
      required
    )
  }
};

const v$ = useVuelidate(
  rules,
  { content: computed(() => get(value).content) },
  { $autoDirty: true }
);

watch(v$, ({ $invalid }) => {
  emit('valid', !$invalid);
});
</script>
<template>
  <v-form :value="!v$.$invalid" class="pt-2">
    <div>
      <v-text-field
        :value="value.title"
        outlined
        :placeholder="t('notes_menu.labels.title')"
        @input="input({ title: $event })"
      />
    </div>
    <div>
      <v-textarea
        :value="value.content"
        outlined
        :placeholder="t('notes_menu.labels.content')"
        :error-messages="v$.content.$errors.map(e => e.$message)"
        @input="input({ content: $event })"
      />
    </div>
  </v-form>
</template>
