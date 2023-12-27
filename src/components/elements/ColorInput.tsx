
import { component$, Slot } from '@builder.io/qwik';
import ColorPicker from 'simple-color-picker';
import { RawTextInput } from './TextInput';
import { isServer } from '@builder.io/qwik/build';

// COLOR INPUT
// ====================
// This is a custom input component that uses a color picker.
// It requires the following CSS:
// .Scp {
//   display: flex;
//   height: 170px !important;
//   width: 170px !important;
//   padding: 10px !important;
//   border-radius: 0.375rem;
//   border: hsl(0, 27%, 76%);
//   border-width: 1px;
// }
// ====================
// It also requires the parent element to have position: relative.
// This is because the color picker is absolutely positioned.
// ====================

export default component$(({ onInput$, ...props }: any) => {
  return (
    <div>
      <label for={props.id} class="mb-2 flex">
        <Slot />
      </label>
      <RawTextInput {...props}
        onFocus$={(event: InputEvent) => {
          const pickerDiv = document.getElementById(`${props.id}-color-picker`)!;

          if (!pickerDiv.children.length) {
            if (isServer) return;
            const textinput = event.target as HTMLInputElement;
            const picker = new ColorPicker({
              el: pickerDiv,
              color: props.value,
              background: '#1D1D1D',
              width: 150,
              height: 150,
            });
            picker.onChange((color: string) => {
              textinput.value = color;
              onInput$(color);
            });
            textinput.addEventListener('input', () => {
              picker.setColor(textinput.value);
            });
          }

          pickerDiv.style.display = 'block';
        }}
        onBlur$={() => {
          const pickerDiv = document.getElementById(`${props.id}-color-picker`)!;
          pickerDiv.style.display = 'none';
        }}
        style={{
          borderLeft: `40px solid ${props.value}`,
          width: '100%',
        }}
      />
      <div id={`${props.id}-color-picker`} class="hidden absolute mt-2" />
    </div>
  );
});