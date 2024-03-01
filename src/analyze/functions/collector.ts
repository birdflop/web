export function collector(id: string, url: string, type: 'spark' | 'timings') {
  if (!url) return;
  return fetch(url + '/' + type, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  }).catch(error => {
    console.error('Fetch error:', error);
    return Promise.reject(error);
  });
}