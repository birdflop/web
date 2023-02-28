declare interface Field {
	name: string;
	value: string;
	buttons?: any[];
	inline?: boolean;
}

declare interface FieldOption extends Field {
	prefix?: string;
	suffix?: string;
}