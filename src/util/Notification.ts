import { createContextId, QRL } from '@builder.io/qwik';

export interface NotificationType {
  id: string;
  title?: string;
  description?: string;
  bgColor?: string;
  buttons?: {
    text: string;
    href: string;
    umamiEvent?: string;
  }[];
  action?: { text: string; onClick$: QRL<() => void> };
  persist?: boolean;
}

export class Notification implements NotificationType {
  id: string;
  title?: string;
  description?: string;
  bgColor?: string;
  buttons?: {
    text: string;
    href: string;
    umamiEvent?: string;
  }[];
  action?: { text: string; onClick$: QRL<() => void> };
  persist?: boolean;

  constructor(notification?: Partial<Notification>) {
    this.id = Math.random().toString(36).substring(2, 15);

    if (notification) {
      this.title = notification.title;
      this.description = notification.description;
      this.bgColor = notification.bgColor;
      this.buttons = notification.buttons || [];
      this.action = notification.action;
      this.persist = notification.persist || false;
    }
    return this;
  }

  setTitle(title: string) {
    this.title = title;
    return this;
  }

  setDescription(description: string) {
    this.description = description;
    return this;
  }

  setBgColor(bgColor: string) {
    this.bgColor = bgColor;
    return this;
  }

  setButtons(buttons: typeof this.buttons) {
    this.buttons = buttons;
    return this;
  }

  setAction(action: typeof this.action) {
    this.action = action;
    return this;
  }

  setPersist(persist: boolean) {
    this.persist = persist;
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      bgColor: this.bgColor,
      buttons: this.buttons,
      action: this.action,
      persist: this.persist,
    };
  }
}

export const NotificationContext = createContextId<NotificationType[]>(
  'notification-context',
);
