import { describe, expect, it } from 'vite-plus/test';
import { renderBBCode } from '../bbcode';

// No user-controlled markup may survive: every '<' in the output must start
// one of the tags the renderer itself emits.
const ALLOWED_TAG =
  /^<\/?(strong|em|u|s|div|blockquote|code|span|a|img|ul|li|br)[\s>/]/;
function expectOnlyKnownTags(html: string) {
  for (let i = html.indexOf('<'); i !== -1; i = html.indexOf('<', i + 1))
    expect(html.slice(i)).toMatch(ALLOWED_TAG);
}

describe('renderBBCode', () => {
  it('renders the supported tags', () => {
    expect(renderBBCode('[b]a[/b][i]b[/i][u]c[/u][s]d[/s]')).toBe(
      '<strong>a</strong><em>b</em><u>c</u><s>d</s>'
    );
    expect(renderBBCode('[center]x[/center]')).toBe(
      '<div style="text-align:center">x</div>'
    );
    expect(renderBBCode('[quote]x[/quote]')).toBe('<blockquote>x</blockquote>');
    expect(renderBBCode('[color=#ff0000]x[/color]')).toBe(
      '<span style="color:#ff0000">x</span>'
    );
    expect(renderBBCode('[color=Red]x[/color]')).toBe(
      '<span style="color:red">x</span>'
    );
    expect(renderBBCode('[size=99]x[/size]')).toBe(
      '<span style="font-size:32px">x</span>'
    );
    expect(renderBBCode('[url=https://a.com/?x=1&y=2]go[/url]')).toBe(
      '<a href="https://a.com/?x=1&amp;y=2" target="_blank" rel="noopener noreferrer nofollow">go</a>'
    );
    expect(renderBBCode('[url]https://a.com[/url]')).toBe(
      '<a href="https://a.com" target="_blank" rel="noopener noreferrer nofollow">https://a.com</a>'
    );
    expect(renderBBCode('[img]https://a.com/x.png[/img]')).toBe(
      '<img src="https://a.com/x.png" alt="" style="max-width:100%;height:auto" loading="lazy" />'
    );
    expect(renderBBCode('[list]\n[*]one\n[*]two\n[/list]\nafter')).toBe(
      '<ul><li>one</li><li>two</li></ul>after'
    );
    expect(renderBBCode('a\nb')).toBe('a<br />b');
  });

  it('handles nesting and is case-insensitive', () => {
    expect(renderBBCode('[B][i]x[/I][/b]')).toBe('<strong><em>x</em></strong>');
    expect(
      renderBBCode('[url=https://a.com][b][color=blue]x[/color][/b][/url]')
    ).toBe(
      '<a href="https://a.com" target="_blank" rel="noopener noreferrer nofollow"><strong><span style="color:blue">x</span></strong></a>'
    );
  });

  it('escapes raw HTML', () => {
    expect(renderBBCode('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
    expect(renderBBCode('[b]<img src=x onerror=alert(1)>[/b]')).toBe(
      '<strong>&lt;img src=x onerror=alert(1)&gt;</strong>'
    );
  });

  it('keeps invalid color/size tags as literal text', () => {
    expect(renderBBCode('[color=@]x[/color]')).toBe('[color=@]x[/color]');
    expect(renderBBCode('[size=x]y[/size]')).toBe('[size=x]y[/size]');
    expect(renderBBCode('[color=red;background:url(x)]x[/color]')).toBe(
      '[color=red;background:url(x)]x[/color]'
    );
  });

  it('keeps unclosed and mismatched tags literal', () => {
    expect(renderBBCode('[b]x')).toBe('[b]x');
    expect(renderBBCode('x[/b]')).toBe('x[/b]');
    expect(renderBBCode('[b][i]x[/b]')).toBe('<strong>[i]x</strong>');
    expect(renderBBCode('[img]https://a.com/x.png')).toBe(
      '[img]https://a.com/x.png'
    );
  });

  it('rejects unsafe URLs', () => {
    expect(renderBBCode('[url=javascript:alert(1)]x[/url]')).toBe(
      '[url=javascript:alert(1)]x[/url]'
    );
    expect(renderBBCode('[img]javascript:alert(1)[/img]')).toBe(
      '[img]javascript:alert(1)[/img]'
    );
    for (const bad of ['"', "'", '<', '>', ' ', '[', '`']) {
      const out = renderBBCode(`[img]http://a/${bad}onerror=alert(1)[/img]`);
      expect(out).not.toContain('<img');
      expectOnlyKnownTags(out);
    }
  });

  it('does not reassemble tags from stripped invalid ones (regression)', () => {
    const payload =
      '[img]http://a/[u[co[size=x][/size]lor=@][/color]rl=http://x/onerror=alert(1)//]z[/img][/url]';
    const out = renderBBCode(payload);
    expect(out).toBe(
      '[img]http://a/[u[co[size=x][/size]lor=@][/color]rl=http://x/onerror=alert(1)//]z[/img][/url]'
    );
    expect(out).not.toContain('<img');
    expect(out).not.toContain('<a ');
    expectOnlyKnownTags(out);

    // Same trick aimed at a link href and at a color attribute.
    for (const p of [
      '[url=http://a/[u[co[size=x][/size]lor=@][/color]rl=http://x/]z[/url]',
      '[co[b][/b]lor=red]x[/color]',
      '[u[size=x][/size]rl]http://a/"onmouseover=alert(1)//[/url]',
      '[img]http://a/[img]http://b/[/img][/img]',
    ]) {
      const html = renderBBCode(p);
      expectOnlyKnownTags(html);
      expect(html).not.toMatch(/="[^"]*</);
      expect(html).not.toMatch(/<[^>]*\son\w+=/i);
    }
  });

  it('renders code content verbatim', () => {
    expect(renderBBCode('[code][b]x[/b] <i>[/code]')).toBe(
      '<code>[b]x[/b] &lt;i&gt;</code>'
    );
  });

  it('does not treat [*] outside a list as markup', () => {
    expect(renderBBCode('[*]x')).toBe('[*]x');
    expect(renderBBCode('[list][*]a')).toBe('[list][*]a');
  });
});
