import type { APIRoute } from 'astro';
import { aboutMarkdown } from '../lib/llms';

export const GET: APIRoute = async () =>
  new Response(aboutMarkdown(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
