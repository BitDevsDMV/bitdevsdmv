import type { APIRoute } from 'astro';
import { contributeMarkdown } from '../lib/llms';

export const GET: APIRoute = async () =>
  new Response(contributeMarkdown(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
