declare interface Field {
  name: string;
  value: string;
  buttons?: { text: string; url: string }[];
  inline?: boolean;
}

declare interface FieldOption extends Field {
  prefix?: string;
  suffix?: string;
}
