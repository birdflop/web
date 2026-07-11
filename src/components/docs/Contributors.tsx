import { component$ } from '@qwik.dev/core';
import { useDocumentHead } from '@qwik.dev/router';

export default component$(() => {
  const { frontmatter } = useDocumentHead<{ contributors?: string[] }>();
  const contributors = frontmatter.contributors || [];
  if (!contributors.length) {
    return null;
  }

  return (
    <div class="lum-card my-12">
      <h2 class="my-0!">Contributors</h2>
      <p>Thank you to everyone who has helped us improve our documentation!</p>
      <div class="m-0 flex list-none flex-row flex-wrap items-center justify-start gap-2 p-0">
        {contributors.map((contributor: string) => (
          <a
            key={`contributor-${contributor}`}
            href={`https://github.com/${contributor}`}
            target="_blank"
            rel="noreferrer"
            class="lum-btn gap-2 p-2 pr-3 font-bold"
          >
            <img
              loading="lazy"
              src={`https://github.com/${contributor}.png?size=80`}
              width="40"
              height="40"
              alt={contributor}
              class="rounded-lum-1! h-auto w-10"
            />
            <span>{contributor}</span>
          </a>
        ))}
      </div>
    </div>
  );
});
