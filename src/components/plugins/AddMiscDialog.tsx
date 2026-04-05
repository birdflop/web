import { component$, useContext } from '@builder.io/qwik';
import { resolvedPluginContext } from '~/routes/resources/plugins';

export default component$(() => {
  const resolvedPlugin = useContext(resolvedPluginContext);

  return <>
    <div class="flex flex-col gap-1 mb-2">

      <label for="plugin-name">
        Plugin name
      </label>
      <input type="text" class="lum-input" placeholder="Plugin name" id="plugin-name"
        onInput$={(e, el) => {
          const value = el.value;
          resolvedPlugin.plugin = {
            ...resolvedPlugin.plugin,
            type: 'misc',
            name: value,
          };
        }}
      />
      <label for="plugin-link">
        Plugin link
      </label>
      <input type="text" class="lum-input" placeholder="https://example.com/plugin" id="plugin-link"
        onInput$={(e, el) => {
          const value = el.value;
          resolvedPlugin.plugin = {
            ...resolvedPlugin.plugin,
            type: 'misc',
            name: resolvedPlugin.plugin?.name ?? value.split('/').pop(),
            url: value,
          };
        }}
      />
      <label for="plugin-icon">
        Plugin icon URL (optional)
      </label>
      <input type="text" class="lum-input" placeholder="https://example.com/icon.png" id="plugin-icon"
        onInput$={(e, el) => {
          const value = el.value;
          resolvedPlugin.plugin = {
            ...resolvedPlugin.plugin,
            type: 'misc',
            data: {
              ...resolvedPlugin.plugin?.data,
              iconUrl: value,
            },
          };
        }}
      />

    </div>
  </>;
});