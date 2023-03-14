import { component$, useVisibleTask$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

import { CoffeeIcon } from 'qwik-feather-icons';

// @ts-ignore
import iconAVIF from '~/images/icon.png?avif';
// @ts-ignore
import iconWEBP from '~/images/icon.png?webp';
// @ts-ignore
import { src as iconPlaceholder } from '~/images/icon.png?metadata';

import { QwikPartytown } from '~/components/partytown/partytown';

export default component$(() => {
  useVisibleTask$(()=>{
    initiateTyper()
  }, {strategy: "document-idle"})
  return (
    <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <div class="text-center justify-center">
        <div class="flex relative justify-center align-center mb-10 w-full">
          <div class="absolute top-24 w-64 h-64 bg-pink-400 rounded-full opacity-10 animate-blob ease-in-out filter blur-2xl left-[45%]"></div>
          <div class="absolute top-24 w-64 h-64 bg-purple-400 rounded-full opacity-10 animate-blob ease-in-out filter blur-2xl right-[50%] animation-delay-2000"></div>
          <div class="absolute bottom-32 w-64 h-64 bg-violet-400 rounded-full opacity-10 animate-blob ease-in-out filter blur-2xl left-[30%] animation-delay-4000"></div>
          <div class="z-10">
            <picture>
              <source srcSet={iconAVIF} type="image/avif" />
              <source srcSet={iconWEBP} type="image/webp" />
              <img
                src={iconPlaceholder}
                height={300}
                width={300}
                alt="SimplyMC icon"
                loading="eager"
                decoding="async"
              />
            </picture>
          </div>
        </div>
        <div class="mt-10 space-y-3 min-h-[60px]">
          <h1 class="text-gray-50 text-4xl mb-12">
            Minecraft multitool for <span class="typer" id="main" data-words="developers,server owners,players,you" data-colors="#cd2032,#ad3960,#8e518d,#6e6abb" data-delay="50" data-deleteDelay="1000"></span>
            <span class="cursor" data-owner="main" data-cursor-display="|"></span>
          </h1>
          <div class="flex justify-center">
            <a href="https://ko-fi.com/akiradev" class="flex transition duration-200 ease-in-out rounded-xl shadow-lg backdrop-blur-lg bg-gradient-to-b from-pink-900/80 to-pink-700/80 hover:bg-pink-700 px-6 py-3 text-pink-100 md:py-4 md:px-8 text-sm md:text-lg whitespace-nowrap gap-5 items-center">
              <CoffeeIcon/> Consider donating if this helped you
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});

export function initiateTyper() { 
  var Typer = function(element) {
  this.element = element;
  var delim = element.dataset.delim || ",";
  var words = element.dataset.words || "override these,sample typing";
  this.words = words.split(delim).filter((v) => v); // non empty words
  this.delay = element.dataset.delay || 200;
  this.loop = element.dataset.loop || "true";
  if (this.loop === "false" ) { this.loop = 1 }
  this.deleteDelay = element.dataset.deletedelay || element.dataset.deleteDelay || 800;

  this.progress = { word: 0, char: 0, building: true, looped: 0 };
  this.typing = true;

  var colors = element.dataset.colors || "black";
  this.colors = colors.split(",");
  this.element.style.color = this.colors[0];
  this.colorIndex = 0;

  this.doTyping();
};

Typer.prototype.start = function() {
  if (!this.typing) {
    this.typing = true;
    this.doTyping();
  }
};
Typer.prototype.stop = function() {
  this.typing = false;
};
Typer.prototype.doTyping = function() {
  var e = this.element;
  var p = this.progress;
  var w = p.word;
  var c = p.char;
  var currentDisplay = [...this.words[w]].slice(0, c).join("");
  var atWordEnd;
  if (this.cursor) {
    this.cursor.element.style.opacity = "1";
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

  if (!p.building && this.loop <= p.looped){
    this.typing = false;
  }

  setTimeout(() => {
    if (this.typing) { this.doTyping() };
  }, atWordEnd ? this.deleteDelay : this.delay);
};

var Cursor = function(element) {
  this.element = element;
  this.cursorDisplay = element.dataset.cursordisplay || element.dataset.cursorDisplay || "_";
  element.innerHTML = this.cursorDisplay;
  this.on = true;
  element.style.transition = "all 0.1s";
  this.interval = setInterval(() => this.updateBlinkState(), 400);
}
Cursor.prototype.updateBlinkState = function() {
  if (this.on) {
    this.element.style.opacity = "0";
    this.on = false;
  } else {
    this.element.style.opacity = "1";
    this.on = true;
  }
}

function TyperSetup() {
  var typers = {};
  for (let e of document.getElementsByClassName("typer")) {
    typers[e.id] = new Typer(e);
  }
  for (let e of document.getElementsByClassName("typer-stop")) {
    let owner = typers[e.dataset.owner];
    e.onclick = () => owner.stop();
  }
  for (let e of document.getElementsByClassName("typer-start")) {
    let owner = typers[e.dataset.owner];
    e.onclick = () => owner.start();
  }
  for (let e of document.getElementsByClassName("cursor")) {
    let t = new Cursor(e);
    t.owner = typers[e.dataset.owner];
    t.owner.cursor = t;
  }
}

TyperSetup();
}

export const head: DocumentHead = {
  title: 'A Minecraft Multitool',
  meta: [
    {
      name: 'description',
      content: 'A Minecraft multitool for you',
    },
    {
      name: 'og:description',
      content: 'A Minecraft multitool for you',
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png',
    },
  ],
};
