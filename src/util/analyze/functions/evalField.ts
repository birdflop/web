import type { DictOfVars, OptionData } from '../types';
import createField from './createField';

export default function evalField(
  fields: Field[],
  option: OptionData[],
  option_name: string,
  plugins: DictOfVars['plugins'],
  server_properties: DictOfVars['server_properties'],
  bukkit: DictOfVars['bukkit'],
  spigot: DictOfVars['spigot'],
  paper: DictOfVars['paper'],
  pufferfish: DictOfVars['pufferfish'],
  purpur: DictOfVars['purpur']
) {
  const dict_of_vars: DictOfVars = {
    plugins,
    server_properties,
    bukkit,
    spigot,
    paper,
    pufferfish,
    purpur,
  };
  option.forEach((option_data) => {
    let add_to_field = true;
    option_data.expressions.forEach((expression) => {
      (Object.keys(dict_of_vars) as (keyof DictOfVars)[]).forEach(
        (config_name) => {
          if (
            expression.vars.includes(config_name) &&
            !dict_of_vars[config_name]
          )
            add_to_field = false;
        }
      );
      try {
        if (add_to_field && !expression.bool(dict_of_vars))
          add_to_field = false;
      } catch (err) {
        console.error(err);
        add_to_field = false;
      }
    });
    (Object.keys(dict_of_vars) as (keyof DictOfVars)[]).forEach(
      (config_name) => {
        if (
          add_to_field &&
          option_data.value.includes(config_name) &&
          !dict_of_vars[config_name]
        )
          add_to_field = false;
      }
    );
    option_data.name = option_name;
    if (add_to_field) fields.push(createField(option_data));
  });
}
