import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { eventToMarkdown } from '../../lib/llms';

export async function getStaticPaths() {
  const events = await getCollection('events', ({ data }) => !data.draft);
  return events.map((event) => ({
    params: { id: event.id },
    props: { event },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { event } = props;
  const body = typeof event.body === 'string' ? event.body : '';
  return new Response(eventToMarkdown(event, body), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
