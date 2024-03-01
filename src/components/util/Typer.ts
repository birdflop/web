declare interface typerElement extends Element {
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
  style: any;
}

export function initiateTyper() {
  function Typer(this: {
    element: typerElement;
    words: string[];
    delay: string | number;
    loop: string | number;
    deleteDelay: string | number;
    progress: { word: number; char: number; building: boolean; looped: number };
    typing: boolean;
    colors: string[];
    colorIndex: number;
    doTyping: () => void;
  }, element: typerElement) {
    this.element = element;
    const delim = element.dataset.delim || ',';
    const words = element.dataset.words || 'override these,sample typing';
    this.words = words.split(delim).filter((v) => v); // non empty words
    this.delay = element.dataset.delay || 200;
    this.loop = element.dataset.loop || 'true';
    if (this.loop === 'false') { this.loop = 1; }
    this.deleteDelay = element.dataset.deletedelay || element.dataset.deleteDelay || 800;

    this.progress = { word: 0, char: 0, building: true, looped: 0 };
    this.typing = true;

    const colors = element.dataset.colors || 'black';
    this.colors = colors.split(',');
    this.element.style.color = this.colors[0];
    this.colorIndex = 0;

    this.doTyping();
  }

  Typer.prototype.doTyping = function (this: {
    element: typerElement;
    progress: { word: number; char: number; building: boolean; looped: number };
    words: string[];
    cursor: { element: typerElement; on: boolean; interval: any; updateBlinkState: () => void };
    typing: boolean;
    colorIndex: number;
    colors: string[];
    delay: number;
    deleteDelay: number;
    doTyping: () => void;
    loop: number;
  }) {
    const e = this.element;
    const p = this.progress;
    const w = p.word;
    const c = p.char;
    const currentDisplay = [...this.words[w]].slice(0, c).join('');
    let atWordEnd;
    if (this.cursor) {
      this.cursor.element.style.opacity = '1';
      this.cursor.on = true;
      clearInterval(this.cursor.interval);
      this.cursor.interval = setInterval(() => this.cursor.updateBlinkState(), 400);
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

    setTimeout(() => {
      if (this.typing) { this.doTyping(); }
    }, atWordEnd ? this.deleteDelay : this.delay);
  };

  const Cursor = function (this: {
    element: typerElement;
    cursorDisplay: string;
    on: boolean;
    interval: any;
    updateBlinkState: () => void;
  }, element: typerElement) {
    this.element = element;
    this.cursorDisplay = element.dataset.cursordisplay || element.dataset.cursorDisplay || '_';
    element.innerHTML = this.cursorDisplay;
    this.on = true;
    element.style.transition = 'all 0.1s';
    this.interval = setInterval(() => this.updateBlinkState(), 400);
  };

  Cursor.prototype.updateBlinkState = function (this: {
    element: typerElement;
    on: boolean;
  }) {
    if (this.on) {
      this.element.style.opacity = '0';
      this.on = false;
    } else {
      this.element.style.opacity = '1';
      this.on = true;
    }
  };

  function TyperSetup() {
    const typers: any = {};
    for (const e of document.getElementsByClassName('typer')) {
      typers[e.id] = new (Typer as any)(e as typerElement);
    }
    for (const e of document.getElementsByClassName('cursor')) {
      const t = new (Cursor as any)(e as typerElement);
      t.owner = typers[(e as any).dataset.owner];
      t.owner.cursor = t;
    }
  }

  TyperSetup();
}
