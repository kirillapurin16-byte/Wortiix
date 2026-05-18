// Данный скрипт загружается в бесплатный Cloudflare Workers
// Он работает без серверов, полностью бесплатно на инфраструктуре Cloudflare

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    // Разрешаем кросс-доменные запросы от вашего клиента
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (!targetUrl) {
      return new Response('Использование: ?url=https://target-website.com', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    try {
      // Имитируем запрос реального браузера к целевому заблокированному сайту
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });

      // Читаем тело страницы
      let content = await response.text();

      // Модифицируем относительные пути (картинки, стили), чтобы они грузились корректно
      const targetOrigin = new URL(targetUrl).origin;
      content = content.replace(/src="\//g, `src="${targetOrigin}/`);
      content = content.replace(/href="\//g, `href="${targetOrigin}/`);

      return new Response(content, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8'
        }
      });

    } catch (err) {
      return new Response(`Ошибка проксирования: ${err.message}`, { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};