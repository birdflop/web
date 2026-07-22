declare interface TyperElement extends Element {
  dataset: {
    delim?: string;
    words?: string;
    delay?: string | number;
    loop?: string | number;
    deletedelay?: string | number;
    deleteDelay?: string | number;
    colors?: string;
    cursordisplay?: string;
    cursorDisplay?: string;
    owner?: string;
  };
  style: CSSStyleDeclaration;
}

export function initiateTyper() {
  class CursorInstance {
    element: TyperElement;
    cursorDisplay: string;
    on: boolean;
    interval: ReturnType<typeof setInterval>;
    owner?: TyperInstance;

    constructor(element: TyperElement) {
      this.element = element;
      this.cursorDisplay =
        element.dataset.cursordisplay || element.dataset.cursorDisplay || '_';
      element.innerHTML = this.cursorDisplay;
      this.on = true;
      element.style.transition = 'all 0.1s';
      this.interval = setInterval(() => this.updateBlinkState(), 400);
    }

    updateBlinkState() {
      if (this.on) {
        this.element.style.opacity = '0';
        this.on = false;
      } else {
        this.element.style.opacity = '1';
        this.on = true;
      }
    }
  }

  class TyperInstance {
    element: TyperElement;
    words: string[];
    delay: number;
    loop: number;
    deleteDelay: number;
    progress: {
      word: number;
      char: number;
      building: boolean;
      looped: number;
    };
    typing: boolean;
    colors: string[];
    colorIndex: number;
    cursor?: CursorInstance;

    constructor(element: TyperElement) {
      this.element = element;
      const delim = element.dataset.delim || ',';
      const words = element.dataset.words || 'override these,sample typing';
      this.words = words.split(delim).filter((v) => v); // non empty words
      this.delay = Number(element.dataset.delay || 200);
      const loopVal = element.dataset.loop || 'true';
      this.loop =
        loopVal === 'false' ? 1 : Number(loopVal) || Number.MAX_SAFE_INTEGER;
      this.deleteDelay = Number(
        element.dataset.deletedelay || element.dataset.deleteDelay || 800
      );

      this.progress = { word: 0, char: 0, building: true, looped: 0 };
      this.typing = true;

      const colors = element.dataset.colors || 'black';
      this.colors = colors.split(',');
      this.element.style.color = this.colors[0];
      this.colorIndex = 0;

      this.doTyping();
    }

    doTyping() {
      const e = this.element;
      const p = this.progress;
      const w = p.word;
      const c = p.char;
      const currentDisplay = Array.from(this.words[w]).slice(0, c).join('');
      let atWordEnd = false;
      if (this.cursor) {
        this.cursor.element.style.opacity = '1';
        this.cursor.on = true;
        clearInterval(this.cursor.interval);
        this.cursor.interval = setInterval(
          () => this.cursor?.updateBlinkState(),
          400
        );
      }

      e.innerHTML = currentDisplay;

      if (p.building) {
        atWordEnd = p.char === this.words[w].length;
        if (atWordEnd) {
          p.building = false;
        } else {
          p.char += 1;
        }
      } else {
        if (p.char === 0) {
          p.building = true;
          p.word = (p.word + 1) % this.words.length;
          this.colorIndex = (this.colorIndex + 1) % this.colors.length;
          this.element.style.color = this.colors[this.colorIndex];
        } else {
          p.char -= 1;
        }
      }

      if (p.word === this.words.length - 1) {
        p.looped += 1;
      }

      if (!p.building && this.loop <= p.looped) {
        this.typing = false;
      }

      setTimeout(
        () => {
          if (this.typing) {
            this.doTyping();
          }
        },
        atWordEnd ? this.deleteDelay : this.delay
      );
    }
  }

  function TyperSetup() {
    const typers: Record<string, TyperInstance> = {};
    for (const e of document.getElementsByClassName('typer')) {
      const el = e as TyperElement;
      if (el.id) {
        typers[el.id] = new TyperInstance(el);
      }
    }
    for (const e of document.getElementsByClassName('cursor')) {
      const el = e as TyperElement;
      const cursor = new CursorInstance(el);
      const ownerId = el.dataset.owner;
      if (ownerId && typers[ownerId]) {
        cursor.owner = typers[ownerId];
        typers[ownerId].cursor = cursor;
      }
    }
  }

  TyperSetup();
}
