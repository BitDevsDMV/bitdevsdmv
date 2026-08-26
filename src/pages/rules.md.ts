import type { APIRoute } from 'astro';
import { rulesMarkdown } from '../lib/llms';

export const GET: APIRoute = async () =>
  new Response(rulesMarkdown(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
