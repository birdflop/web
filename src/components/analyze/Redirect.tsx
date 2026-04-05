import { RequestHandler } from '@builder.io/qwik-city';

// redirect to analyze page.
export const onGet: RequestHandler = ({ redirect, params }) => {
  if (params.id) redirect(301, `/resources/analyze/${params.id}`);
  else redirect(301, '/resources/analyze');
};