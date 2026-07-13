import { Label } from '@luminescent/ui-qwik';
import { component$, useContext } from '@qwik.dev/core';
import { resolvedPluginContext } from '~/routes/resources/plugins';

export default component$(() => {
  const resolvedPlugin = useContext(resolvedPluginContext);

  return (
    <>
      <div class="mb-2 flex flex-col gap-1">
        <Label for="plugin-name" label="Plugin name">
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
        </Label>

        {resolvedPlugin.plugin && (
          <>
            <Label for="plugin-link" label="Plugin link">
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
            </Label>
            <Label for="plugin-icon" label="Plugin icon URL (optional)">
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
            </Label>
          </>
        )}
      </div>
    </>
  );
});
