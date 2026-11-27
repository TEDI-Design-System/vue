import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { useArgs } from 'storybook/preview-api';
import { defineComponent } from 'vue';

import { useTediLabels } from './labels';
import type { TediLabels, TediLanguage } from './labels-map';
import TediLabelProvider from './TediLabelProvider.vue';

/**
 * Sets the locale and texts of the components inside it. Install `createTedi` once for the whole app; use the
 * provider for one part of the page. See [Labels](?path=/docs/documentation-labels--docs) for setup and the list of
 * texts.
 */
const meta = {
  title: 'TEDI-Ready/Providers/LabelProvider',
  component: TediLabelProvider,
  argTypes: {
    locale: { control: 'inline-radio', options: ['et', 'en', 'ru'] },
    // Controls serialise args to JSON, which would drop the function labels.
    labels: { control: false },
  },
} satisfies Meta<typeof TediLabelProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const languages: TediLanguage[] = ['et', 'en', 'ru'];

const LabelsDemo = defineComponent({
  name: 'LabelsDemo',
  setup: () => ({ ...useTediLabels(), languages }),
  template: `
    <div :lang="locale" class="flex flex-column gap-3">
      <div class="flex gap-2">
        <button
          v-for="language in languages"
          :key="language"
          type="button"
          :aria-pressed="locale === language"
          @click="setLocale(language)"
        >
          {{ language }}
        </button>
      </div>
      <dl>
        <dt><code>close</code> (overridden in English)</dt>
        <dd>{{ t('close') }}</dd>
        <dt><code>scroll-fade.label</code></dt>
        <dd>{{ t('scroll-fade.label') }}</dd>
        <dt><code>demo.results</code> (added by the app, a function)</dt>
        <dd>{{ t('demo.results', 1) }}, {{ t('demo.results', 4) }}, {{ t('demo.results', 21) }}</dd>
        <dt><code>missing.key</code> (no text: returns the key)</dt>
        <dd>{{ t('missing.key') }}</dd>
      </dl>
    </div>
  `,
});

const ruPlural = new Intl.PluralRules('ru');
const labels: TediLabels = {
  close: { en: 'Close this' },
  'demo.results': {
    et: (count: number) => `${count} ${count === 1 ? 'tulemus' : 'tulemust'}`,
    en: (count: number) => `${count} ${count === 1 ? 'result' : 'results'}`,
    ru: (count: number) =>
      `${count} ${{ one: 'результат', few: 'результата' }[ruPlural.select(count) as 'one' | 'few'] ?? 'результатов'}`,
  },
};

export const Default: Story = {
  args: { locale: 'en', labels },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { TediLabelProvider, LabelsDemo },
      setup: () => ({ args, updateLocale: (locale: TediLanguage) => updateArgs({ locale }) }),
      template: `
        <TediLabelProvider v-bind="args" @update:locale="updateLocale">
          <LabelsDemo />
        </TediLabelProvider>
      `,
    };
  },
};
