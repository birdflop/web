import { Component } from '@qwik.dev/core';
import type { AvailableConfig } from '~/util/flags/config';

export interface EnvironmentOption {
  icon?: Component<Record<string, unknown> /* will be fixed in qwik v2 */>;
  config: AvailableConfig[];
}
