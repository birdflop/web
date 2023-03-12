import { component$, useVisibleTask$, useStore } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';
import yaml from "yaml";
import TextInput from '~/components/elements/TextInput';

function formatMinecraftString(minecraftString: string) {
    // Regular expression pattern to match Minecraft formatting codes and custom hex codes
    const pattern = /&[0-9A-Fa-fk-or]|&#([0-9A-Fa-f]{6})/g;
    const matches = minecraftString.match(pattern);
  
    if (!matches) {
      return minecraftString;
    }
  
    let htmlString = minecraftString;
  
    for (const match of matches) {
      let cssClass = "";
      let color = "";
      if (match.startsWith("&#")) {
        const hexColor = match.substr(2);
        color = `color: #${hexColor}`;
      } else {
        cssClass = getCssClass(match);
      }
      htmlString = htmlString.replace(match, `<span style="${color}" class="font-${cssClass}">`);
    }
  
    htmlString = htmlString.replace(/&r/g, "</span>");
  
    return htmlString;
  }
  
  function getCssClass(formatCode: string) {
    switch (formatCode) {
      case "&l":
        return "bold";
      case "&m":
        return "strikethrough";
      case "&n":
        return "underline";
      case "&o":
        return "italic";
      default:
        return "";
    }
  }
  


export default component$(() => {
    const store: any = useStore({
        text: 'SimplyMC',
        speed: 50,
        frames: [],
        frame: 1
    }, { deep: true });

    useVisibleTask$(() => {
        let speed = store.speed

        let frameInterval = setInterval(() => setFrame(), Math.ceil(speed / 50) * 50);

        function setFrame() {
            if (!store.frames[0]) return;
            if (speed != store.speed) {
                clearInterval(frameInterval);
                speed = store.speed;
                frameInterval = setInterval(() => setFrame(), Math.ceil(speed / 50) * 50);
            }
            store.frame = store.frame + 1 >= store.frames.length ? 0 : store.frame + 1;
        }
    });

    return (
        <section class="flex mx-auto max-w-7xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.5.1/jscolor.min.js"></script>
            <div class="mt-10 min-h-[60px] w-full">
                <h1 class="font-bold text-gray-50 text-4xl mb-2">
                    Animation Previewer
                </h1>
                <h2 class="text-gray-50 text-xl mb-12">
                    Preview TAB Animations without the need to put them ingame
                </h2>

                <TextInput big id="Animaton" value={store.outputFormat} placeholder="SimplyMC" onInput$={
                    (event: any) => {
                        const data = yaml.parse(event.target!.value)
                        const key = Object.keys(data)[0]
                        store.speed = data[key]["change-interval"]
                        store.frames = data[key]["texts"]
                    }
                }>
                    Output Format
                </TextInput>

                <h1 class={`text-6xl my-6 break-all max-w-7xl -space-x-[1px]`} dangerouslySetInnerHTML={(() => {
                        if (!store.frames[0]) return;
                        const idk = formatMinecraftString(store.frames[store.frame])
                        return idk;
                        // return <span style={`color: #${idk.text};`} class={`font${store.underline ? '-underline' : ''}${store.strikethrough ? '-strikethrough' : ''}`}>{idk.text}</span>;
                    })()}>
                    
                </h1>

            </div>
        </section>
    );
});

export const head: DocumentHead = {
    title: 'TAB Animation Previewer',
    meta: [
        {
            name: 'description',
            content: 'Tab animation previewer'
        },
        {
            name: 'og:description',
            content: 'Tab animation previewer'
        },
        {
            name: 'og:image',
            content: 'https://simplymc.art/images/icon.png'
        }
    ]
}