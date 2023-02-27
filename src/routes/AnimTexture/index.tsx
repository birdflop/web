import { component$, useStore, } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const store = useStore({
      frames: [] as any[],
      textureName: ''
  });

  return (
    <section class="flex mx-auto max-w-6xl px-6 items-center justify-center min-h-[calc(100lvh-80px)]">
      <div class="mt-10 min-h-[60px]">
        <h1 class="font-bold tracking-tight text-purple-100 text-4xl mb-2 ease-in-out">
          Animated Textures
        </h1>
        <h2 class="font-bold tracking-tight text-purple-100 text-xl mb-12 ease-in-out">
          Easily merge textures for resource pack animations<br/>
          (THIS PAGE IS HEAVILY A WORK IN PROGRESS)
        </h2>

        <script async src="/scripts/gif-frames.js" />
        <p>Select Frame(s)</p>
        <input type="file" multiple accept="image/*" class="text-white text-xl file:bg-gray-600 file:hover:bg-gray-500 file:rounded-lg file:cursor-pointer file:px-4 file:py-2 file:mr-4 mt-2 text-transparent file:text-white file:text-lg file:border-none" onChange$={
          (event) => {
            if (!event.target.files) return;
            Array.from(event.target.files).forEach(file => {
              const f = new FileReader();
              f.readAsDataURL(file);
              f.onloadend = async (e) => {
                const b64 = e!.target!.result;
                const type = b64!.toString().split(",")[0].split(";")[0].split(":")[1];
                if (type == "image/gif") {
                  //@ts-ignore
                  const gifframes = await gifFrames({ url: b64, frames: 'all' });
                  gifframes.forEach((frame: any) => {
                    const contentStream = frame.getImage();
                    const imageData = window.btoa(String.fromCharCode.apply(null, contentStream._obj));
                    const b64frame = `data:image/png;base64,${imageData}`;

                    store.frames = [...store.frames, { img: b64frame, delay: Math.ceil(20 * frame.frameInfo.delay / 100) }];
                  });
                  return;
                }
                store.frames = [...store.frames, { img: b64, delay: 20 }];
              }
            })
          }
        } />
        
        <div id="imgs" class="flex flex-wrap max-h-[620px] overflow-auto my-4 gap-2">
          {store.frames.map(frame => {
            return <div class="w-24 rounded-lg border-gray-700 border-2">
              <img width={96} height={96} class="rounded-t-md" src={frame.img} />
              <input type="number" value={frame.delay} class="w-full text-lg bg-gray-700 text-white text-center focus:bg-gray-600 p-2 rounded-b-md"/>
            </div>
          })}
        </div>

        <p>Texture Name</p>
        <input class="text-lg bg-gray-700 text-white focus:bg-gray-600 rounded-lg p-2 mb-6 mt-2" onInput$={(event: any) => {store.textureName = event.target!.value}} />
        <button class="text-white text-md bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer px-4 py-2 ml-2">
          Generate
        </button>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: 'Animated Texture Creator',
  meta: [
    {
      name: 'description',
      content: 'A Minecraft multitool for you'
    },
    {
      name: 'og:description',
      content: 'A Minecraft multitool for you'
    },
    {
      name: 'og:image',
      content: 'https://simplymc.art/images/icon.png'
    }
  ]
}