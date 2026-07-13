import { decompressFrames, parseGIF } from 'gifuct-js';
import JSZip from 'jszip';

export type AnimtextureFrame = {
  img: HTMLImageElement;
  delay: number;
};

export type AnimtextureTexture = {
  name: string;
  path: string;
  namespace: string;
  width: number;
  height: number;
  lockdimensions: boolean;
  bounce: boolean;
  syncduration: boolean;
  showChatPreview: boolean;
  frames: AnimtextureFrame[];
};

export type RenderedTexture = {
  png: string;
  mcmeta: string;
};

export const RESOURCE_PACK_FORMAT = 88;

export async function base64ToFile(dataURL: string) {
  const arr = dataURL.split(',');
  const match = arr[0].match(/:(.*?);/);
  const mime = match ? match[1] : '';
  const result = await fetch(dataURL);
  return {
    mime,
    buffer: await result.arrayBuffer(),
  };
}

export const readFileAsDataURL = (file: Blob) =>
  new Promise<ProgressEvent<FileReader>>((resolve, reject) => {
    const f = new FileReader();
    f.readAsDataURL(file);
    f.onloadend = (e) => resolve(e);
    f.onerror = reject;
  });

export const createTexture = (index = 1): AnimtextureTexture => ({
  name: index === 1 ? 'stone' : `animtexture-${index}`,
  path: 'block',
  namespace: 'minecraft',
  width: 16,
  height: 16,
  lockdimensions: true,
  bounce: false,
  syncduration: false,
  showChatPreview: false,
  frames: [],
});

export const loadImageFromCanvas = (canvas: HTMLCanvasElement) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = canvas.toDataURL();
  });

export const loadImageFromDataURL = (dataURL: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataURL;
  });

export const drawGifFramePatch = (
  ctx: CanvasRenderingContext2D,
  frame: {
    dims: { width: number; height: number; top: number; left: number };
    patch: Uint8ClampedArray;
  }
) => {
  const patchCanvas = document.createElement('canvas');
  patchCanvas.width = frame.dims.width;
  patchCanvas.height = frame.dims.height;

  const patchCtx = patchCanvas.getContext('2d')!;
  const frameImageData = patchCtx.createImageData(
    frame.dims.width,
    frame.dims.height
  );
  frameImageData.data.set(frame.patch);
  patchCtx.putImageData(frameImageData, 0, 0);

  ctx.drawImage(patchCanvas, frame.dims.left, frame.dims.top);
};

const getGifBackgroundColor = (parsedGif: {
  gct: [number, number, number][];
  lsd: { backgroundColorIndex: number; width: number; height: number };
}) => {
  const backgroundColor = parsedGif.gct[parsedGif.lsd.backgroundColorIndex];
  return backgroundColor
    ? `rgb(${backgroundColor[0]}, ${backgroundColor[1]}, ${backgroundColor[2]})`
    : null;
};

export const loadGifFrames = async (arrayBuffer: ArrayBuffer) => {
  const parsedGif = parseGIF(arrayBuffer);
  const gifFrames = decompressFrames(parsedGif, true);
  const canvas = document.createElement('canvas');
  canvas.width = parsedGif.lsd.width;
  canvas.height = parsedGif.lsd.height;
  const ctx = canvas.getContext('2d')!;
  const backgroundColor = getGifBackgroundColor(parsedGif);

  const resetCanvas = (
    left: number,
    top: number,
    width: number,
    height: number
  ) => {
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(left, top, width, height);
    } else {
      ctx.clearRect(left, top, width, height);
    }
  };

  resetCanvas(0, 0, canvas.width, canvas.height);

  const frames: { img: HTMLImageElement; delay: number }[] = [];
  let previousFrame: {
    dims: { width: number; height: number; top: number; left: number };
    disposalType: number;
  } | null = null;
  let restoreImageData: ImageData | null = null;

  for (const frame of gifFrames) {
    if (previousFrame) {
      if (previousFrame.disposalType === 2) {
        resetCanvas(
          previousFrame.dims.left,
          previousFrame.dims.top,
          previousFrame.dims.width,
          previousFrame.dims.height
        );
      } else if (previousFrame.disposalType === 3 && restoreImageData) {
        ctx.putImageData(restoreImageData, 0, 0);
      }
    }

    restoreImageData =
      frame.disposalType === 3
        ? ctx.getImageData(0, 0, canvas.width, canvas.height)
        : null;
    drawGifFramePatch(ctx, frame);

    const img = await loadImageFromCanvas(canvas);
    frames.push({
      img,
      delay: Math.ceil(frame.delay / 100),
    });

    previousFrame = {
      dims: frame.dims,
      disposalType: frame.disposalType,
    };
  }

  return frames;
};

export const normalizeTextureName = (name: string) =>
  name
    .trim()
    .replace(/^\/+/, '')
    .replace(/\\/g, '/')
    .replace(/\.png$/i, '') || 'texture';

export const getTextureFrameHeight = (texture: AnimtextureTexture) =>
  texture.lockdimensions ? texture.width : texture.height;

export const buildTextureOutputs = (
  texture: AnimtextureTexture
): RenderedTexture => {
  if (texture.frames.length === 0) {
    return { png: '', mcmeta: '' };
  }

  const canvas = document.createElement('canvas');
  const frameHeight = getTextureFrameHeight(texture);
  canvas.width = texture.width;
  canvas.height = frameHeight * texture.frames.length;

  const ctx = canvas.getContext('2d')!;
  for (let i = 0; i != texture.frames.length; i++) {
    const img = texture.frames[i].img;
    ctx.drawImage(img, 0, i * frameHeight, texture.width, frameHeight);
  }

  const mcmeta = {
    animation: {
      frames: [
        ...texture.frames.map((frame, i) => ({
          index: i,
          time: frame.delay,
        })),
        ...(texture.bounce
          ? texture.frames.map((frame, i) => ({
              index: texture.frames.length - i,
              time: texture.frames[i].delay,
            }))
          : []),
      ],
    },
  };

  return {
    png: canvas.toDataURL(),
    mcmeta: JSON.stringify(mcmeta, null, 2),
  };
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const getUniqueTextureName = (names: Set<string>, name: string) => {
  const baseName = normalizeTextureName(name);
  let uniqueName = baseName;
  let counter = 1;

  while (names.has(uniqueName)) {
    uniqueName = `${baseName}-${counter}`;
    counter++;
  }

  names.add(uniqueName);
  return uniqueName;
};

export const buildResourcePack = async (textures: AnimtextureTexture[]) => {
  const zip = new JSZip();
  zip.file(
    'pack.mcmeta',
    JSON.stringify(
      {
        pack: {
          pack_format: RESOURCE_PACK_FORMAT,
          description: 'Generated by Birdflop AnimTexture',
        },
      },
      null,
      2
    )
  );

  const names = new Set<string>();
  for (const texture of textures) {
    if (texture.frames.length === 0) continue;

    const { png, mcmeta } = buildTextureOutputs(texture);
    if (!png) continue;

    const name = getUniqueTextureName(names, texture.name);
    const pngBlob = await (await fetch(png)).blob();
    zip.file(
      `assets/${texture.namespace}/textures/${texture.path}/${name}.png`,
      pngBlob
    );
    zip.file(
      `assets/${texture.namespace}/textures/${texture.path}/${name}.png.mcmeta`,
      mcmeta
    );
  }

  return zip.generateAsync({ type: 'blob' });
};
