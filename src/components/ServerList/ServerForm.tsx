import {
  $,
  component$,
  useContext,
  useSignal,
  useStore,
  useVisibleTask$,
} from '@qwik.dev/core';
import { useNavigate } from '@qwik.dev/router';
import { Label, SelectMenu } from '@luminescent/ui-qwik';
import Save from 'lucide-icons-qwik/icons/Save';
import Send from 'lucide-icons-qwik/icons/Send';
import FileText from 'lucide-icons-qwik/icons/FileText';
import MessageSquare from 'lucide-icons-qwik/icons/MessageSquare';
import Gamepad2 from 'lucide-icons-qwik/icons/Gamepad2';
import Globe from 'lucide-icons-qwik/icons/Globe';
import Hash from 'lucide-icons-qwik/icons/Hash';
import Image from 'lucide-icons-qwik/icons/Image';
import Tag from 'lucide-icons-qwik/icons/Tag';
import Radio from 'lucide-icons-qwik/icons/Radio';
import Key from 'lucide-icons-qwik/icons/Key';
import Info from 'lucide-icons-qwik/icons/Info';
import Palette from 'lucide-icons-qwik/icons/Palette';
import Braces from 'lucide-icons-qwik/icons/Braces';
import ExternalLink from 'lucide-icons-qwik/icons/ExternalLink';
import Wifi from 'lucide-icons-qwik/icons/Wifi';
import Zap from 'lucide-icons-qwik/icons/Zap';
import SendHorizonal from 'lucide-icons-qwik/icons/SendHorizonal';
import CheckCircle from 'lucide-icons-qwik/icons/CheckCircle';
import CircleX from 'lucide-icons-qwik/icons/CircleX';
import { rgbDefaults } from '@birdflop/rgbirdflop';
import RgbPreview from '~/components/rgbirdflop/RgbPreview';
import { useSession } from '~/routes/plugin@auth';
import { getPresets, type rgbPreset } from '~/util/rgb/presets';
import { Notification, NotificationContext } from '~/util/Notification';
import type { Server } from '~/util/db';
import {
  createServer,
  updateServer,
  testVote,
} from '~/util/serverlist/actions';
import {
  SERVER_TAGS,
  LIMITS,
  DEFAULT_JAVA_PORT,
  DEFAULT_BEDROCK_PORT,
  DEFAULT_VOTIFIER_PORT,
} from '~/util/serverlist/constants';
import type { ServerFormInput } from '~/util/serverlist/validation';
import BBCodeEditor from './BBCodeEditor';
import SiDiscord from 'simple-icons-qwik/icons/SiDiscord';

interface ServerFormProps {
  mode: 'create' | 'edit';
  initial?: Server;
}

export default component$<ServerFormProps>(({ mode, initial }) => {
  const nav = useNavigate();
  const notifications = useContext(NotificationContext);
  const session = useSession();
  const submitting = useSignal(false);
  const availablePresets = useSignal<
    Array<{ name: string; preset: rgbPreset }>
  >([]);
  const selectedPresetIndex = useSignal<string>('');
  const testingVotifier = useSignal(false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    try {
      const rawOptions: Array<{ name: string; preset: rgbPreset }> = [];

      const saved = session.value?.user?.savedPresets ?? [];
      for (const p of saved) {
        if (p.preset) {
          const name = p.name || 'Saved Preset';
          rawOptions.push({
            name,
            preset: { ...p.preset, text: name },
          });
        }
      }

      const privatePresets = session.value?.user?.privatePresets ?? [];
      for (const p of privatePresets) {
        rawOptions.push({ name: p.text || 'Private Preset', preset: p });
      }

      const localPresets = getPresets();
      for (const p of localPresets) {
        rawOptions.push({ name: p.text || 'Local Preset', preset: p });
      }

      const uniqueOptions: Array<{ name: string; preset: rgbPreset }> = [];
      const seen = new Set<string>();

      for (const opt of rawOptions) {
        const key = JSON.stringify(opt.preset);
        if (!seen.has(key)) {
          seen.add(key);
          uniqueOptions.push(opt);
        }
      }

      if (initial?.rgbPreset) {
        const initStr = JSON.stringify(initial.rgbPreset);
        const matchIdx = uniqueOptions.findIndex(
          (o) => JSON.stringify(o.preset) === initStr
        );
        if (matchIdx !== -1) {
          selectedPresetIndex.value = String(matchIdx);
        } else {
          uniqueOptions.unshift({
            name: 'Current Server Preset',
            preset: initial.rgbPreset,
          });
          selectedPresetIndex.value = '0';
        }
      }

      availablePresets.value = uniqueOptions;
    } catch (err) {
      console.error('Error fetching user presets:', err);
    }
  });

  const form = useStore<ServerFormInput & { tags: string[] }>({
    name: initial?.name ?? '',
    edition: initial?.edition ?? 'java',
    minVersion: initial?.minVersion ?? '',
    maxVersion: initial?.maxVersion ?? '',
    rgbPreset: initial?.rgbPreset
      ? JSON.stringify(initial.rgbPreset, null, 2)
      : '',
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

  const handleTestVote = $(async () => {
    const host = form.votifierHost?.trim();
    const token = form.votifierToken?.trim();
    if (!host || !token) return;
    testingVotifier.value = true;
    const result = await testVote({
      serverId: initial?.id,
      votifierHost: host,
      votifierPort: form.votifierPort,
      votifierToken: token,
      javaHost: form.javaHost?.trim(),
    });
    testingVotifier.value = false;

    if (result.success) {
      notifications.push(
        new Notification()
          .setTitle('Test vote delivered!')
          .setDescription(
            'NuVotifier accepted the packet. Check your server console for the vote event.'
          )
          .setBgColor('lum-grad-bg-green/50')
          .toJSON()
      );
    } else {
      notifications.push(
        new Notification()
          .setTitle('Test vote failed')
          .setDescription(result.error ?? 'Unknown error.')
          .setBgColor('lum-grad-bg-red/50')
          .setPersist(true)
          .toJSON()
      );
    }
  });

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
    <div class="grid gap-4 sm:grid-cols-2">
      {/* Basics */}
      <div class="lum-card gap-3">
        <h2 class="flex items-center gap-2 text-lg font-bold">
          <Info size={20} />
          Basics
        </h2>
        <Label for="server-name" label="Server name *">
          <FileText size={16} q:slot="before-label" />
          <input
            id="server-name"
            class="lum-input"
            maxLength={LIMITS.name}
            value={form.name}
            onInput$={(e, el) => (form.name = el.value)}
            placeholder="My Awesome Network"
          />
        </Label>

        <Label for="short-description" label="Short description">
          <MessageSquare size={16} q:slot="before-label" />
          <input
            id="short-description"
            class="lum-input"
            maxLength={LIMITS.shortDescription}
            value={form.shortDescription}
            onInput$={(e, el) => (form.shortDescription = el.value)}
            placeholder="One-line tagline shown in the list"
          />
        </Label>

        <Label for="description" label="Description *">
          <FileText size={16} q:slot="before-label" />
          <div class="flex flex-col gap-1">
            <BBCodeEditor
              id="description"
              value={form.description ?? ''}
              onChange$={(v: string) => (form.description = v)}
              maxLength={LIMITS.description}
              placeholder="Tell players what makes your server special..."
            />
            <span class="text-lum-text-secondary text-xs">
              Select text and use the toolbar to add formatting, or type BBCode
              directly. Use Preview to see the result.
            </span>
          </div>
        </Label>
      </div>

      {/* Presentation */}
      <div class="lum-card gap-3">
        <h2 class="flex items-center gap-2 text-lg font-bold">
          <Image size={20} />
          Presentation
        </h2>
        <Label for="banner-url" label="Banner image URL">
          <Image size={16} q:slot="before-label" />
          <input
            id="banner-url"
            class="lum-input"
            value={form.bannerUrl}
            onInput$={(e, el) => (form.bannerUrl = el.value)}
            placeholder="https://i.imgur.com/yourbanner.png"
          />
        </Label>
        <div class="flex flex-wrap gap-2">
          <Label for="website" label="Website" class="min-w-48 flex-1">
            <Globe size={16} q:slot="before-label" />
            <input
              id="website"
              class="lum-input"
              value={form.website}
              onInput$={(e, el) => (form.website = el.value)}
              placeholder="https://example.com"
            />
          </Label>
          <Label for="discord" label="Discord invite" class="min-w-48 flex-1">
            <SiDiscord size={16} class="fill-current" q:slot="before-label" />
            <input
              id="discord"
              class="lum-input"
              value={form.discord}
              onInput$={(e, el) => (form.discord = el.value)}
              placeholder="https://discord.gg/..."
            />
          </Label>
        </div>

        <Label label={`Tags (${form.tags.length}/${LIMITS.maxTags})`}>
          <Tag size={16} q:slot="before-label" />
          <div class="flex flex-wrap gap-1">
            {SERVER_TAGS.map((tag) => {
              const active = form.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick$={() => toggleTag(tag)}
                  class={{
                    'lum-btn lum-btn-p-1 text-sm': true,
                    'lum-bg-lum-accent/30 hover:lum-bg-lum-accent/50': active,
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </Label>
      </div>

      {/* Connection */}
      <div class="lum-card gap-3">
        <h2 class="flex items-center gap-2 text-lg font-bold">
          <Wifi size={20} />
          Connection
        </h2>
        <div class="grid grid-cols-2 gap-2">
          <Label for="edition" label="Edition *" class="min-w-44 flex-1">
            <Gamepad2 size={16} q:slot="before-label" />
            <SelectMenu
              id="edition"
              class={{ 'lum-bg-lum-input-bg/40': true }}
              value={form.edition}
              onChange$={(e, el) => (form.edition = el.value)}
              values={[
                { name: 'Java', value: 'java' },
                { name: 'Bedrock', value: 'bedrock' },
                { name: 'Java & Bedrock', value: 'both' },
              ]}
            />
          </Label>
          <Label for="min-version" label="Version">
            <Tag size={16} q:slot="before-label" />
            <span class="text-lum-text-secondary text-sm" q:slot="after-label">
              (optional)
            </span>
            <div class="flex items-center gap-2">
              <input
                id="min-version"
                class="lum-input min-w-20 flex-1"
                maxLength={LIMITS.version}
                value={form.minVersion}
                onInput$={(e, el) => (form.minVersion = el.value)}
                placeholder="1.8"
              />
              <span class="text-lum-text-secondary">to</span>
              <input
                id="max-version"
                class="lum-input min-w-20 flex-1"
                maxLength={LIMITS.version}
                value={form.maxVersion}
                onInput$={(e, el) => (form.maxVersion = el.value)}
                placeholder="26.2"
              />
            </div>
          </Label>

          {showJava && (
            <>
              <Label
                for="java-host"
                label="Java address *"
                class="min-w-48 flex-1"
              >
                <Globe size={16} q:slot="before-label" />
                <input
                  id="java-host"
                  class="lum-input"
                  value={form.javaHost}
                  onInput$={(e, el) => (form.javaHost = el.value)}
                  placeholder="play.example.com"
                />
              </Label>
              <Label for="java-port" label="Port" class="w-28">
                <Hash size={16} q:slot="before-label" />
                <input
                  id="java-port"
                  class="lum-input"
                  type="number"
                  value={form.javaPort}
                  onInput$={(e, el) => (form.javaPort = el.value)}
                  placeholder={String(DEFAULT_JAVA_PORT)}
                />
              </Label>
            </>
          )}

          {showBedrock && (
            <>
              <Label
                for="bedrock-host"
                label="Bedrock address *"
                class="min-w-48 flex-1"
              >
                <Globe size={16} q:slot="before-label" />
                <input
                  id="bedrock-host"
                  class="lum-input"
                  value={form.bedrockHost}
                  onInput$={(e, el) => (form.bedrockHost = el.value)}
                  placeholder="play.example.com"
                />
              </Label>
              <Label for="bedrock-port" label="Port" class="w-28">
                <Hash size={16} q:slot="before-label" />
                <input
                  id="bedrock-port"
                  class="lum-input"
                  type="number"
                  value={form.bedrockPort}
                  onInput$={(e, el) => (form.bedrockPort = el.value)}
                  placeholder={String(DEFAULT_BEDROCK_PORT)}
                />
              </Label>
            </>
          )}
        </div>
      </div>

      {/* Votifier */}
      <div class="lum-card gap-3">
        <h2 class="flex items-center gap-2 text-lg font-bold">
          <Zap size={20} />
          Votifier
          <span class="text-lum-text-secondary text-sm font-normal">
            (optional)
          </span>
        </h2>
        <p class="text-lum-text-secondary text-sm">
          Provide your NuVotifier (Votifier v2 token) details so voters get
          in-game rewards. Votes still count toward your ranking even without
          Votifier.
        </p>
        <div class="flex flex-wrap gap-2">
          <Label
            for="votifier-host"
            label="Votifier host"
            class="min-w-48 flex-1"
          >
            <Radio size={16} q:slot="before-label" />
            <input
              id="votifier-host"
              class="lum-input"
              value={form.votifierHost}
              onInput$={(e, el) => (form.votifierHost = el.value)}
              placeholder="play.example.com"
            />
          </Label>
          <Label for="votifier-port" label="Port" class="w-28">
            <Hash size={16} q:slot="before-label" />
            <input
              id="votifier-port"
              class="lum-input"
              type="number"
              value={form.votifierPort}
              onInput$={(e, el) => (form.votifierPort = el.value)}
              placeholder={String(DEFAULT_VOTIFIER_PORT)}
            />
          </Label>
        </div>
        <Label for="votifier-token" label="Votifier token">
          <Key size={16} q:slot="before-label" />
          <input
            id="votifier-token"
            class="lum-input font-mono text-sm"
            value={form.votifierToken}
            onInput$={(e, el) => (form.votifierToken = el.value)}
            placeholder="The token from your NuVotifier config"
          />
        </Label>

        <div class="border-lum-input-bg/60 mt-2 flex flex-col gap-3 border-t pt-4">
          <h3 class="flex items-center gap-2 text-sm font-semibold">
            <SendHorizonal size={16} /> Test Votifier Connection
          </h3>
          <p class="text-lum-text-secondary text-xs">
            Sends a real Votifier v2 packet to your configured host / port using
            your token. Your in-game vote reward should trigger.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="test-vote-btn"
              class="lum-btn lum-bg-lum-input-bg/60 hover:lum-bg-lum-input-bg lum-btn-p-1 flex items-center gap-2 text-sm disabled:opacity-50"
              disabled={
                testingVotifier.value ||
                !form.votifierHost?.trim() ||
                !form.votifierToken?.trim()
              }
              onClick$={handleTestVote}
            >
              <SendHorizonal size={14} />
              {testingVotifier.value ? 'Sending…' : 'Send test vote'}
            </button>
            {(!form.votifierHost?.trim() || !form.votifierToken?.trim()) && (
              <span class="text-lum-text-secondary flex items-center gap-1 text-xs">
                <CircleX size={13} class="text-red-400" />
                Fill in Votifier host and token above first
              </span>
            )}
            {!!form.votifierHost?.trim() && !!form.votifierToken?.trim() && (
              <span class="text-lum-text-secondary flex items-center gap-1 text-xs">
                <CheckCircle size={13} class="text-green-400" />
                Votifier configured — ready to test
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RGBirdflop Preset */}
      <div class="lum-card gap-3">
        <h2 class="flex items-center gap-2 text-lg font-bold">
          <Palette size={20} />
          RGBirdflop Preset
          <span class="text-lum-text-secondary text-sm font-normal">
            (optional)
          </span>
          <a
            href="/resources/rgb"
            target="_blank"
            rel="noopener noreferrer"
            class="lum-btn lum-bg-lum-input-bg/40 hover:lum-bg-lum-input-bg/60 text-sm"
          >
            <ExternalLink size={16} /> Create a preset on RGBirdflop
          </a>
        </h2>
        <p class="text-lum-text-secondary text-sm">
          Select a default RGBirdflop preset for your server. Players visiting{' '}
          <code class="bg-lum-input-bg/40 rounded px-1 py-0.5">
            /resources/rgb?s={form.name || 'serverName'}
          </code>{' '}
          will open RGBirdflop with this preset loaded.
        </p>

        <div class="flex flex-wrap items-end gap-3">
          <Label
            for="preset-select"
            label="Select a preset for your server"
            class="min-w-64 flex-1"
          >
            <Palette size={16} q:slot="before-label" />
            <SelectMenu
              id="preset-select"
              class="lum-bg-lum-input-bg/40 w-full"
              values={availablePresets.value.map((opt, i) => ({
                name: opt.name,
                value: i.toString(),
                custom: true,
              }))}
              onChange$={(e, el) => {
                selectedPresetIndex.value = el.value;
                if (el.value === '' || el.value === '-1') {
                  form.rgbPreset = '';
                } else {
                  const idx = parseInt(el.value, 10);
                  const chosen = availablePresets.value[idx];
                  if (chosen) {
                    form.rgbPreset = JSON.stringify(chosen.preset);
                  }
                }
              }}
              value={
                selectedPresetIndex.value !== ''
                  ? selectedPresetIndex.value
                  : undefined
              }
            >
              {availablePresets.value.map((opt, i) => (
                <span
                  key={i}
                  q:slot={i.toString()}
                  class={{
                    'font-mc tracking-tight break-all': true,
                    'font-mc-bold': opt.preset.baseFormatting?.bold,
                    'font-mc-italic': opt.preset.baseFormatting?.italic,
                    'font-mc-bold-italic':
                      opt.preset.baseFormatting?.bold &&
                      opt.preset.baseFormatting?.italic,
                    [`${opt.preset.colorFormat?.class}`]:
                      opt.preset.colorFormat?.class,
                  }}
                >
                  <RgbPreview
                    rgbStore={{ ...rgbDefaults, ...opt.preset }}
                    shadowLength={2}
                  />
                </span>
              ))}
              <span
                q:slot="dropdown"
                class={{
                  'font-mc tracking-tight break-all': true,
                  'font-mc-bold':
                    availablePresets.value[
                      parseInt(selectedPresetIndex.value, 10)
                    ]?.preset.baseFormatting?.bold,
                  'font-mc-italic':
                    availablePresets.value[
                      parseInt(selectedPresetIndex.value, 10)
                    ]?.preset.baseFormatting?.italic,
                  'font-mc-bold-italic':
                    availablePresets.value[
                      parseInt(selectedPresetIndex.value, 10)
                    ]?.preset.baseFormatting?.bold &&
                    availablePresets.value[
                      parseInt(selectedPresetIndex.value, 10)
                    ]?.preset.baseFormatting?.italic,
                  [`${availablePresets.value[parseInt(selectedPresetIndex.value, 10)]?.preset.colorFormat?.class}`]:
                    availablePresets.value[
                      parseInt(selectedPresetIndex.value, 10)
                    ]?.preset.colorFormat?.class,
                }}
              >
                {availablePresets.value[parseInt(selectedPresetIndex.value, 10)]
                  ?.preset ? (
                  <RgbPreview
                    rgbStore={{
                      ...rgbDefaults,
                      ...availablePresets.value[
                        parseInt(selectedPresetIndex.value, 10)
                      ].preset,
                    }}
                    shadowLength={2}
                  />
                ) : (
                  '-- None --'
                )}
              </span>
            </SelectMenu>
          </Label>

          <Label for="rgb-preset" label="Or paste custom Preset JSON">
            <Braces size={16} q:slot="before-label" />
            <input
              id="rgb-preset"
              class="lum-input font-mono text-sm"
              value={
                typeof form.rgbPreset === 'string'
                  ? form.rgbPreset
                  : form.rgbPreset
                    ? JSON.stringify(form.rgbPreset, null, 2)
                    : ''
              }
              onInput$={(e, el) => {
                form.rgbPreset = el.value;
                selectedPresetIndex.value = '';
              }}
              placeholder="Paste a RGBirdflop preset"
            />
          </Label>
        </div>
      </div>

      <div class="sm:col-span-2">
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
    </div>
  );
});
