import { Component } from '@qwik.dev/core';
import type { IconProps } from 'simple-icons-qwik/base-icon';
import type { AvailableConfig } from '~/util/flags/config';

export interface EnvironmentOption {
  icon?: Component<IconProps>;
  config: AvailableConfig[];
}
