import { component$ } from '@builder.io/qwik';
import { useDocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  const { frontmatter } = useDocumentHead<{ contributors?: string[] }>();
  const contributors = frontmatter.contributors || [];
  if (!contributors.length) {
    return null;
  }

  return (
    <div class="lum-card my-12">
      <h2 class="my-0!">
        Contributors
      </h2>
      <p>
        Thank you to everyone who has helped us improve our documentation!
      </p>
      <div class="flex flex-row flex-wrap justify-start gap-2 items-center list-none m-0 p-0">
        {contributors.map((contributor: string) => (
          <a key={`contributor-${contributor}`} href={`https://github.com/${contributor}`} target="_blank" rel="noreferrer" class="lum-btn lum-bg-gray-900 p-3 font-bold">
            <img
              loading="lazy"
              src={`https://github.com/${contributor}.png?size=80`}
              width="40"
              height="40"
              alt={contributor}
              class="w-10 h-auto"
            />
            <span class="text-white">
              {contributor}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
});