import { handleRequest } from './handler'

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
}

function handleOptions(request: Request): Response {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers;
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders: Record<string, string> = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "",
    }

    return new Response(null, {
      headers: respHeaders,
    })
  }
  else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS",
      },
    })
  }
}

addEventListener('fetch', (event) => {
  // event.respondWith(handleRequest(event.request))
  const request = event.request
  const url = new URL(request.url)

  if (url.pathname === "/") {
    return new Response(`Welcome to the Molereum Faucet!`)
  } else if (url.pathname.startsWith('/send/')) {
    if (request.method === "OPTIONS") {
      // Handle CORS preflight requests
      event.respondWith(handleOptions(request))
    }
    else if (
      request.method === "GET" ||
      request.method === "HEAD" ||
      request.method === "POST"
    ) {
      // Handle requests to the API server
      event.respondWith(handleRequest(request))
    }
    else {
      event.respondWith(
        new Response(null, {
          status: 405,
          statusText: "Method Not Allowed",
        }),
      )
    }
  }
  else {
    event.respondWith(
      new Response(null, {
        status: 404,
        statusText: "Nothing to see here.",
      }),
    )
  }
})
