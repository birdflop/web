module.exports = function createField(option) {
	const field = { name: option.name, value: option.value };
	if (option.prefix) field.name = option.prefix + ' ' + field.name;
	if (option.suffix) field.name = field.name + option.suffix;
	if (option.buttons) field.buttons = option.buttons;
	return field;
};