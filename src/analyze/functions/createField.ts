
export default function createField(option: FieldOption) {
  const field: FieldOption = { name: option.name, value: option.value };
  if (option.prefix) field.name = option.prefix + ' ' + field.name;
  if (option.suffix) field.name = field.name + option.suffix;
  if (option.buttons) field.buttons = option.buttons;
  return field;
}