import { component$ } from '@builder.io/qwik';
import { useDocumentHead, useLocation } from '@builder.io/qwik-city';

import icon from '~/images/icon.png';

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>{`SimplyMC: ${head.title}`}</title>
      <meta content={`SimplyMC: ${head.title}`} property="og:title"/>
      <meta content="#881645" name="theme-color"/>

      <link rel="canonical" href={loc.url.href} />
      <link rel="icon" type="image/png" href={icon} />
      <link rel="apple-touch-icon" href="/apple-icon.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {head.meta.map((m) => (
        <meta {...m} />
      ))}

      {head.links.map((l) => (
        <link {...l} />
      ))}

      {head.styles.map((s) => (
        <style {...s.props} dangerouslySetInnerHTML={s.style} />
      ))}
    </>
  );
});