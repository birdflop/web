import { component$, Slot, useStore } from '@builder.io/qwik';

export default component$(({ id, value, className }: any) => {
  return (
    <div class="flex flex-col">
      <label for={id} class="mb-2">
        <Slot />
      </label>
      <RawOutputField id={id} value={value} className={`mb-3 ${className}`} />
    </div>
  )
});

export const RawOutputField = component$(({ id, value, className }: any) => {
  const store: any = useStore({
    alerts: [],
  }, { deep: true });
  return (
    <>
      <textarea disabled class={`transition ease-in-out cursor-pointer bg-gray-800 text-gray-50 hover:bg-gray-700 focus:bg-gray-700 rounded-md px-3 py-2 break-words ${className}`} id={id} value={value} onClick$={(event: any) => {
        navigator.clipboard.writeText(event.target!.value);
        const alert = {
          class: 'text-green-500',
          text: 'Copied to clipboard!',
        }
        if (event.target!.value.length > 256) {
          const alert2 = {
            class: 'text-red-500',
            text: 'This text is over 256 characters and may not fit in the chat box!',
          }
          store.alerts.push(alert2);
          setTimeout(() => {
            store.alerts.splice(store.alerts.indexOf(alert2), 1);
          }, 2000);
        }
        store.alerts.push(alert);
        setTimeout(() => {
          store.alerts.splice(store.alerts.indexOf(alert), 1);
        }, 1000);
      }}/>
      {
        store.alerts.map((alert: any) => {
          return <p class={alert.class}>{alert.text}</p>
        })
      }
    </>
  )
});