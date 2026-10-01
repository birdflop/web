import { component$, useVisibleTask$ } from '@qwik.dev/core';
import { parseMotdLine, shadowColor } from '~/util/motd';
import { getFormattingClasses } from '~/components/rgbirdflop/preview';
import { obfuscateText } from '~/util/rgb/obfuscator';

export interface MotdTextProps {
  text: string;
  class?: string;
}

export function renderMotdLine(line: string) {
  const runs = parseMotdLine(line);
  if (runs.length === 0) return <span> </span>;
  return runs.map((run, i) => (
    <span
      key={`run${i}`}
      data-obf={run.style.obfuscated ? run.text : undefined}
      class={{
        ...getFormattingClasses(run.style),
        'motd-obf': run.style.obfuscated,
      }}
      style={{
        color: run.style.color,
        textShadow: `2px 2px 0 ${shadowColor(run.style.color)}`,
      }}
    >
      {run.text}
    </span>
  ));
}

export const MotdText = component$<MotdTextProps>(
  ({ text, class: className = '' }) => {
    // Animate obfuscated (&k / §k) text by scrambling characters
    // oxlint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$((taskCtx) => {
      const id = setInterval(() => {
        document.querySelectorAll<HTMLElement>('.motd-obf').forEach((el) => {
          const original = el.getAttribute('data-obf') ?? el.textContent ?? '';
          el.textContent = obfuscateText(original);
        });
      }, 70);
      taskCtx.cleanup(() => clearInterval(id));
    });

    const lines = text.split(/\r?\n/);

    return (
      <div class={`font-mc leading-snug break-words ${className}`}>
        {lines.map((line, idx) => (
          <div key={idx} class="min-h-[1.2em]">
            {renderMotdLine(line)}
          </div>
        ))}
      </div>
    );
  }
);

export default MotdText;
