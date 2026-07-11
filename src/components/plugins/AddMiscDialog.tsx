import { component$, useContext } from '@builder.io/qwik';
import { resolvedPluginContext } from '~/routes/resources/plugins';

export default component$(() => {
  const resolvedPlugin = useContext(resolvedPluginContext);

  return (
    <>
      <div class="mb-2 flex flex-col gap-1">
        <label for="plugin-name">Plugin name</label>
        <input
          type="text"
          class="lum-input"
          placeholder="Plugin name"
          id="plugin-name"
          onInput$={(e, el) => {
            const value = el.value;
            if (!resolvedPlugin.plugin) {
              resolvedPlugin.plugin = {
                id: Math.random().toString(36).substring(2, 15),
                type: 'misc',
              };
            }
            resolvedPlugin.plugin.name = value;
          }}
        />

        {resolvedPlugin.plugin && (
          <>
            <label for="plugin-link">Plugin link</label>
            <input
              type="text"
              class="lum-input"
              placeholder="https://example.com/plugin"
              id="plugin-link"
              onInput$={(e, el) => {
                const value = el.value;
                resolvedPlugin.plugin!.url = value;
              }}
            />
            <label for="plugin-icon">Plugin icon URL (optional)</label>
            <input
              type="text"
              class="lum-input"
              placeholder="https://example.com/icon.png"
              id="plugin-icon"
              onInput$={(e, el) => {
                const value = el.value;
                resolvedPlugin.plugin!.iconUrl = value;
              }}
            />
          </>
        )}
      </div>
    </>
  );
});
