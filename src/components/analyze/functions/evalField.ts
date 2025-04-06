import createField from './createField';

export default function evalField(fields: Field[], option: any[], option_name: string, plugins: any[], server_properties: any, bukkit: any, spigot: any, paper: any, pufferfish: any, purpur: any) {
  const dict_of_vars: any = { plugins, server_properties, bukkit, spigot, paper, pufferfish, purpur };
  option.forEach(option_data => {
    let add_to_field = true;
    option_data.expressions.forEach((expression: any) => {
      Object.keys(dict_of_vars).forEach(config_name => {
        if (expression.vars.includes(config_name) && !dict_of_vars[config_name]) add_to_field = false;
      });
      try {
        if (add_to_field && !expression.bool(dict_of_vars)) add_to_field = false;
      }
      catch (err) {
        console.error(err);
        add_to_field = false;
      }
    });
    Object.keys(dict_of_vars).forEach(config_name => {
      if (add_to_field && option_data.value.includes(config_name) && !dict_of_vars[config_name]) add_to_field = false;
    });
    option_data.name = option_name;
    if (add_to_field) fields.push(createField(option_data));
  });
}