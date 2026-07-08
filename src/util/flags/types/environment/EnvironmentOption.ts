import { Component } from '@builder.io/qwik';
import type { AvailableConfig } from '~/util/flags/config';

export interface EnvironmentOption {
  icon?: Component<any /* will be fixed in qwik v2 */>;
  config: AvailableConfig[];
}
