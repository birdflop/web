import { createContextId } from '@builder.io/qwik';

export class Notification {
  id: string;
  title: string;
  description?: string;
  bgColor?: string;
  buttons?: { text: string; href: string }[];
  persist?: boolean;

  constructor(title: string) {
    this.id = Math.random().toString(36).substring(2, 15);
    this.title = title;
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

  setPersist(persist: boolean) {
    this.persist = persist;
    return this;
  }
}

export const NotificationContext = createContextId<Notification[]>('notification-context');