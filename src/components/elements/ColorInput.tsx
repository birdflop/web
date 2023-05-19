
import { component$, Slot, useVisibleTask$ } from '@builder.io/qwik';
import ColorPicker from 'simple-color-picker';
import { RawTextInput } from './TextInput';

export default component$(({ onInput$, ...props }: any) => {
  useVisibleTask$(() => {
    const picker = new ColorPicker({
      el: document.getElementById(`${props.id}-color-picker`)!,
      color: props.value,
      background: '#1D1D1D',
      width: 150,
      height: 150,
    });
    const textinput = document.getElementById(props.id)! as HTMLInputElement;
    picker.onChange((color: string) => {
      textinput.value = color;
      onInput$(color);
    });
    textinput.addEventListener('input', () => {
      picker.setColor(textinput.value);
    });
  });
  return (
    <div class="flex flex-col">
      <label for={props.id} class="mb-2">
        <Slot />
      </label>
      <RawTextInput {...props}
        onFocus$={() => {
          const picker = document.getElementById(`${props.id}-color-picker`)!;
          picker.style.display = 'block';
        }}
        onBlur$={() => {
          const picker = document.getElementById(`${props.id}-color-picker`)!;
          picker.style.display = 'none';
        }}
        style={{
          borderLeft: `40px solid ${props.value}`,
        }}
      />
      <div id={`${props.id}-color-picker`} class="hidden absolute mt-20" />
    </div>
  );
});