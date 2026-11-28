import { component$, useVisibleTask$ } from '@qwik.dev/core';
import { parseMotdLine, shadowColor } from '~/util/motd';
import { getFormattingClasses } from '~/components/rgbirdflop/preview';
import { obfuscateText } from '~/util/rgb/obfuscator';

export interface MotdTextProps {
  text: string;
  class?: string;
}

// One page-wide timer scrambles every obfuscated run, shared by all mounted
// MotdText instances (e.g. many server cards) instead of one interval each.
// Mutation stays inside these functions because Qwik moves the task closure
// into its own module, where it couldn't reassign module-level bindings.
let obfuscationUsers = 0;
let obfuscationTimer: ReturnType<typeof setInterval> | undefined;

function acquireObfuscationTimer() {
  obfuscationUsers++;
  if (obfuscationTimer !== undefined) return;
  obfuscationTimer = setInterval(() => {
    document.querySelectorAll<HTMLElement>('.motd-obf').forEach((el) => {
      const original = el.getAttribute('data-obf') ?? el.textContent ?? '';
      el.textContent = obfuscateText(original);
    });
  }, 70);
}

function releaseObfuscationTimer() {
  obfuscationUsers = Math.max(0, obfuscationUsers - 1);
  if (obfuscationUsers === 0 && obfuscationTimer !== undefined) {
    clearInterval(obfuscationTimer);
    obfuscationTimer = undefined;
  }
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
      acquireObfuscationTimer();
      taskCtx.cleanup(releaseObfuscationTimer);
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
