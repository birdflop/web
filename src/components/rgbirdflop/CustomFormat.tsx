import { Label } from '@luminescent/ui-qwik';
import { component$, useContext } from '@qwik.dev/core';
import { inlineTranslate } from 'qwik-speak';
import Ampersand from 'lucide-icons-qwik/icons/Ampersand';
import Bold from 'lucide-icons-qwik/icons/Bold';
import Italic from 'lucide-icons-qwik/icons/Italic';
import Strikethrough from 'lucide-icons-qwik/icons/Strikethrough';
import Underline from 'lucide-icons-qwik/icons/Underline';
import Wand2 from 'lucide-icons-qwik/icons/Wand2';
import Replace from 'lucide-icons-qwik/icons/Replace';
import TextWrap from 'lucide-icons-qwik/icons/TextWrap';
import { rgbStoreContext } from '~/components/rgbirdflop/RGBirdflop';

export default component$(({ hidden }: { hidden: boolean }) => {
  const t = inlineTranslate();
  const rgbStore = useContext(rgbStoreContext);

  return (
    <div
      class={{
        'grid grid-cols-2 gap-2 transition-all duration-200': true,
        'pointer-events-none max-h-0 opacity-0': hidden,
        'pointer-events-auto max-h-125 opacity-100': !hidden,
      }}
      id="customformat"
    >
      <div class="flex flex-col gap-2">
        <Label
          for="customformat"
          label={t('rgb.colors.customFormat@@Custom Format')}
        >
          <Replace size={16} q:slot="before-label" />
          <input
            class="lum-input"
            id="customformat"
            value={rgbStore.colorFormat.color}
            placeholder="&#$1$2$3$4$5$6$f$c"
            onInput$={(e, el) => {
              rgbStore.colorFormat.color = el.value;
            }}
          />
        </Label>
        <div class="font-mono text-sm">
          <p>{t('rgb.formatting.placeholders@@Placeholders:')}</p>
          <p>
            $1 = <strong class="text-red-400">R</strong>RGGBB
          </p>
          <p>
            $2 = R<strong class="text-red-400">R</strong>GGBB
          </p>
          <p>
            $3 = RR<strong class="text-green-400">G</strong>GBB
          </p>
          <p>
            $4 = RRG<strong class="text-green-400">G</strong>BB
          </p>
          <p>
            $5 = RRGG<strong class="text-lum-accent">B</strong>B
          </p>
          <p>
            $6 = RRGGB<strong class="text-lum-accent">B</strong>
          </p>
          {rgbStore.colorFormat.char && (
            <p>$f = {t('rgb.formatting.title@@Formatting')}</p>
          )}
          <p>$c = {t('rgb.colors.character@@Character')}</p>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        {rgbStore.colorFormat.char != undefined &&
          !rgbStore.colorFormat.bold &&
          !rgbStore.colorFormat.italic &&
          !rgbStore.colorFormat.underline &&
          !rgbStore.colorFormat.strikethrough && (
            <Label
              for="format-char"
              label={t('rgb.formatting.character@@Format Character')}
            >
              <Ampersand size={16} q:slot="before-label" />
              <input
                class="lum-input"
                id="format-char"
                value={rgbStore.colorFormat.char}
                placeholder="&"
                onInput$={(e, el) => {
                  rgbStore.colorFormat.char = el.value;
                }}
              />
            </Label>
          )}
        {!rgbStore.colorFormat.char && (
          <>
            <Label for="format-bold" label={t('rgb.formatting.bold@@Bold')}>
              <Bold size={16} q:slot="before-label" />
              <input
                class="lum-input"
                id="format-bold"
                value={rgbStore.colorFormat.bold}
                placeholder="<bold>$t</bold>"
                onInput$={(e, el) => {
                  rgbStore.colorFormat.bold = el.value;
                }}
              />
            </Label>
            <Label
              for="format-italic"
              label={t('rgb.formatting.italic@@Italic')}
            >
              <Italic size={16} q:slot="before-label" />
              <input
                class="lum-input"
                id="format-italic"
                value={rgbStore.colorFormat.italic}
                placeholder="<italic>$t</italic>"
                onInput$={(e, el) => {
                  rgbStore.colorFormat.italic = el.value;
                }}
              />
            </Label>
            <Label
              for="format-underline"
              label={t('rgb.formatting.underline@@Underline')}
            >
              <Underline size={16} q:slot="before-label" />
              <input
                class="lum-input"
                id="format-underline"
                value={rgbStore.colorFormat.underline}
                placeholder="<underlined>$t</underlined>"
                onInput$={(e, el) => {
                  rgbStore.colorFormat.underline = el.value;
                }}
              />
            </Label>
            <Label
              for="format-strikethrough"
              label={t('rgb.formatting.strikethrough@@Strikethrough')}
            >
              <Strikethrough size={16} q:slot="before-label" />
              <input
                class="lum-input"
                id="format-strikethrough"
                value={rgbStore.colorFormat.strikethrough}
                placeholder="<strikethrough>$t</strikethrough>"
                onInput$={(e, el) => {
                  rgbStore.colorFormat.strikethrough = el.value;
                }}
              />
            </Label>
            <Label
              for="format-obfuscate"
              label={t('rgb.formatting.obfuscate@@Obfuscate')}
            >
              <Wand2 size={16} q:slot="before-label" />
              <input
                class="lum-input"
                id="format-obfuscate"
                value={rgbStore.colorFormat.obfuscate}
                placeholder="<obfuscated>$t</obfuscated>"
                onInput$={(e, el) => {
                  rgbStore.colorFormat.obfuscate = el.value;
                }}
              />
            </Label>
            <div class="font-mono text-sm">
              <p>{t('rgb.formatting.placeholders@@Placeholders:')}</p>
              <p>$t = Output Text</p>
            </div>
          </>
        )}
        <Label
          for="format-newline"
          label={t('rgb.formatting.newline@@New Line')}
        >
          <TextWrap size={16} q:slot="before-label" />
          <input
            class="lum-input"
            id="format-newline"
            value={rgbStore.colorFormat.newline}
            placeholder="&"
            onInput$={(e, el) => {
              rgbStore.colorFormat.newline = el.value;
            }}
          />
        </Label>
      </div>
    </div>
  );
});
