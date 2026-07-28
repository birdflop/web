import { $, component$, useContext, useSignal, useStore } from '@qwik.dev/core';
import { useNavigate } from '@qwik.dev/router';
import { SelectMenu } from '@luminescent/ui-qwik';
import Save from 'lucide-icons-qwik/icons/Save';
import Send from 'lucide-icons-qwik/icons/Send';
import { Notification, NotificationContext } from '~/util/Notification';
import type { Server } from '~/util/db';
import { createServer, updateServer } from '~/util/serverlist/actions';
import {
  SERVER_TAGS,
  LIMITS,
  DEFAULT_JAVA_PORT,
  DEFAULT_BEDROCK_PORT,
  DEFAULT_VOTIFIER_PORT,
} from '~/util/serverlist/constants';
import type { ServerFormInput } from '~/util/serverlist/validation';
import BBCodeEditor from './BBCodeEditor';

interface ServerFormProps {
  mode: 'create' | 'edit';
  initial?: Server;
}

export default component$<ServerFormProps>(({ mode, initial }) => {
  const nav = useNavigate();
  const notifications = useContext(NotificationContext);
  const submitting = useSignal(false);

  const form = useStore<ServerFormInput & { tags: string[] }>({
    name: initial?.name ?? '',
    edition: initial?.edition ?? 'java',
    javaHost: initial?.javaHost ?? '',
    javaPort: initial?.javaPort ?? '',
    bedrockHost: initial?.bedrockHost ?? '',
    bedrockPort: initial?.bedrockPort ?? '',
    website: initial?.website ?? '',
    discord: initial?.discord ?? '',
    bannerUrl: initial?.bannerUrl ?? '',
    shortDescription: initial?.shortDescription ?? '',
    description: initial?.description ?? '',
    tags: initial?.tags ?? [],
    votifierHost: initial?.votifierHost ?? '',
    votifierPort: initial?.votifierPort ?? '',
    votifierToken: initial?.votifierToken ?? '',
  });

  const showJava = form.edition === 'java' || form.edition === 'both';
  const showBedrock = form.edition === 'bedrock' || form.edition === 'both';

  const toggleTag = $((tag: string) => {
    if (form.tags.includes(tag)) {
      form.tags = form.tags.filter((t) => t !== tag);
    } else if (form.tags.length < LIMITS.maxTags) {
      form.tags = [...form.tags, tag];
    }
  });

  const submit = $(async () => {
    submitting.value = true;
    try {
      const result =
        mode === 'create'
          ? await createServer({ ...form })
          : await updateServer(initial!.id, { ...form });

      if (result.success) {
        notifications.push(
          new Notification()
            .setTitle(
              mode === 'create' ? 'Server submitted!' : 'Server updated!'
            )
            .setDescription('Your listing is live.')
            .setBgColor('lum-grad-bg-green/50')
            .toJSON()
        );
        await nav(`/serverlist/${result.slug}`);
      } else {
        notifications.push(
          new Notification()
            .setTitle('Could not save listing')
            .setDescription(result.errors.join(' '))
            .setBgColor('lum-grad-bg-red/50')
            .setPersist(true)
            .toJSON()
        );
      }
    } finally {
      submitting.value = false;
    }
  });

  return (
    <div class="flex flex-col gap-4">
      {/* Basics */}
      <div class="lum-card gap-3">
        <h2 class="text-lg font-bold">Basics</h2>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold">Server name *</span>
          <input
            class="lum-input"
            maxLength={LIMITS.name}
            value={form.name}
            onInput$={(e, el) => (form.name = el.value)}
            placeholder="My Awesome Network"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold">Short description</span>
          <input
            class="lum-input"
            maxLength={LIMITS.shortDescription}
            value={form.shortDescription}
            onInput$={(e, el) => (form.shortDescription = el.value)}
            placeholder="One-line tagline shown in the list"
          />
        </label>

        <div class="flex flex-col gap-1">
          <span class="text-sm font-semibold">Description *</span>
          <BBCodeEditor
            value={form.description ?? ''}
            onChange$={$((v: string) => (form.description = v))}
            maxLength={LIMITS.description}
            placeholder="Tell players what makes your server special..."
          />
          <span class="text-lum-text-secondary text-xs">
            Select text and use the toolbar to add formatting, or type BBCode
            directly. Use Preview to see the result.
          </span>
        </div>
      </div>

      {/* Connection */}
      <div class="lum-card gap-3">
        <h2 class="text-lg font-bold">Connection</h2>
        <label class="flex max-w-xs flex-col gap-1">
          <span class="text-sm font-semibold">Edition *</span>
          <SelectMenu
            class={{ 'lum-bg-lum-input-bg/40': true }}
            value={form.edition}
            onChange$={(e, el) => (form.edition = el.value)}
            values={[
              { name: 'Java', value: 'java' },
              { name: 'Bedrock', value: 'bedrock' },
              { name: 'Java & Bedrock', value: 'both' },
            ]}
          />
        </label>

        {showJava && (
          <div class="flex flex-wrap gap-2">
            <label class="flex min-w-48 flex-1 flex-col gap-1">
              <span class="text-sm font-semibold">Java address *</span>
              <input
                class="lum-input"
                value={form.javaHost}
                onInput$={(e, el) => (form.javaHost = el.value)}
                placeholder="play.example.com"
              />
            </label>
            <label class="flex w-28 flex-col gap-1">
              <span class="text-sm font-semibold">Port</span>
              <input
                class="lum-input"
                type="number"
                value={form.javaPort}
                onInput$={(e, el) => (form.javaPort = el.value)}
                placeholder={String(DEFAULT_JAVA_PORT)}
              />
            </label>
          </div>
        )}

        {showBedrock && (
          <div class="flex flex-wrap gap-2">
            <label class="flex min-w-48 flex-1 flex-col gap-1">
              <span class="text-sm font-semibold">Bedrock address *</span>
              <input
                class="lum-input"
                value={form.bedrockHost}
                onInput$={(e, el) => (form.bedrockHost = el.value)}
                placeholder="play.example.com"
              />
            </label>
            <label class="flex w-28 flex-col gap-1">
              <span class="text-sm font-semibold">Port</span>
              <input
                class="lum-input"
                type="number"
                value={form.bedrockPort}
                onInput$={(e, el) => (form.bedrockPort = el.value)}
                placeholder={String(DEFAULT_BEDROCK_PORT)}
              />
            </label>
          </div>
        )}
      </div>

      {/* Presentation */}
      <div class="lum-card gap-3">
        <h2 class="text-lg font-bold">Presentation</h2>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold">Banner image URL</span>
          <input
            class="lum-input"
            value={form.bannerUrl}
            onInput$={(e, el) => (form.bannerUrl = el.value)}
            placeholder="https://i.imgur.com/yourbanner.png"
          />
        </label>
        <div class="flex flex-wrap gap-2">
          <label class="flex min-w-48 flex-1 flex-col gap-1">
            <span class="text-sm font-semibold">Website</span>
            <input
              class="lum-input"
              value={form.website}
              onInput$={(e, el) => (form.website = el.value)}
              placeholder="https://example.com"
            />
          </label>
          <label class="flex min-w-48 flex-1 flex-col gap-1">
            <span class="text-sm font-semibold">Discord invite</span>
            <input
              class="lum-input"
              value={form.discord}
              onInput$={(e, el) => (form.discord = el.value)}
              placeholder="https://discord.gg/..."
            />
          </label>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-sm font-semibold">
            Tags{' '}
            <span class="text-lum-text-secondary font-normal">
              ({form.tags.length}/{LIMITS.maxTags})
            </span>
          </span>
          <div class="flex flex-wrap gap-1">
            {SERVER_TAGS.map((tag) => {
              const active = form.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick$={() => toggleTag(tag)}
                  class={{
                    'lum-btn lum-btn-p-1 rounded-lum-1 text-sm': true,
                    'lum-bg-lum-accent/30': active,
                    'lum-bg-lum-input-bg/40': !active,
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Votifier */}
      <div class="lum-card gap-3">
        <h2 class="text-lg font-bold">Votifier (optional)</h2>
        <p class="text-lum-text-secondary text-sm">
          Provide your NuVotifier (Votifier v2 token) details so voters get
          in-game rewards. Votes still count toward your ranking even without
          Votifier.
        </p>
        <div class="flex flex-wrap gap-2">
          <label class="flex min-w-48 flex-1 flex-col gap-1">
            <span class="text-sm font-semibold">Votifier host</span>
            <input
              class="lum-input"
              value={form.votifierHost}
              onInput$={(e, el) => (form.votifierHost = el.value)}
              placeholder="play.example.com"
            />
          </label>
          <label class="flex w-28 flex-col gap-1">
            <span class="text-sm font-semibold">Port</span>
            <input
              class="lum-input"
              type="number"
              value={form.votifierPort}
              onInput$={(e, el) => (form.votifierPort = el.value)}
              placeholder={String(DEFAULT_VOTIFIER_PORT)}
            />
          </label>
        </div>
        <label class="flex flex-col gap-1">
          <span class="text-sm font-semibold">Votifier token</span>
          <input
            class="lum-input font-mono text-sm"
            value={form.votifierToken}
            onInput$={(e, el) => (form.votifierToken = el.value)}
            placeholder="The token from your NuVotifier config"
          />
        </label>
      </div>

      <button
        class="lum-btn lum-bg-blue hover:lum-bg-blue/80 self-start"
        disabled={submitting.value}
        onClick$={submit}
      >
        {mode === 'create' ? <Send size={18} /> : <Save size={18} />}
        {submitting.value
          ? 'Saving...'
          : mode === 'create'
            ? 'Submit server'
            : 'Save changes'}
      </button>
    </div>
  );
});
