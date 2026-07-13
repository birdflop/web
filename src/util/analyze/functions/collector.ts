export async function collector(
  id: string,
  url: string,
  type: 'spark' | 'timings'
) {
  if (!url) return;
  try {
    await fetch(url + '/' + type, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
