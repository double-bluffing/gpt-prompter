import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

async function handler(req: Request, connInfo: ConnInfo): Promise<Response> {
  const url = new URL(req.url);
  const domain = url.hostname;
  const addr = connInfo.remoteAddr as Deno.NetAddr;
  const ip = addr.hostname;
  const cacheKey = url.href;
  console.log(`Visit from ${ip}`);
  url.protocol = "https:";
  url.hostname = "opengpt.com";
  url.port = "443";
  const response =  await fetch(url.href, {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });
  const type = await response.headers.get('content-type') || '';
  if (type.includes('text')) {
    let html = await response.text();
    html = html.replace(/opengpt.com/g, domain);
    html = html.replace(/<script[^>]*type="\w+-text\/javascript"[^>]*>.*?<\/script>/gs, '');
    html = html.replace(/<script[^>]*type="\w+-application\/javascript"[^>]*>.*?<\/script>/gs, '');
    html = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
    return new Response(html, {
      headers: response.headers
    });
  } else {
    return response;
  }
}

serve(handler);
