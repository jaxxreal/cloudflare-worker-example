const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': 'http://localhost:5000',
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
  'Access-Control-Max-Age': '86400',
}

addEventListener('fetch', event => {
  const { request } = event

  if (request.method === 'POST') {
    return event.respondWith(handlePostRequest(request))
  } else if (request.method === 'GET') {
    return event.respondWith(handleGetRequest(request))
  } else if (request.method === 'OPTIONS') {
    return event.respondWith(handleOptions(request))
  }
})

function handleOptions(request) {
  // Make sure the necessary headers are present
  // for this to be a valid pre-flight request
  let headers = request.headers
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Handle CORS pre-flight request.
    // If you want to check or reject the requested method + headers
    // you can do that here.
    let respHeaders = {
      ...corsHeaders,
      // Allow all future content Request headers to go back to browser
      // such as Authorization (Bearer) or X-Client-Name-Version
      'Access-Control-Allow-Headers': request.headers.get(
        'Access-Control-Request-Headers',
      ),
    }

    return new Response(null, {
      headers: respHeaders,
    })
  } else {
    // Handle standard OPTIONS request.
    // If you want to allow other HTTP Methods, you can do that here.
    return new Response(null, {
      headers: {
        Allow: 'GET, HEAD, POST, OPTIONS',
      },
    })
  }
}

async function handlePostRequest(request) {
  const expiryDate = new Date(8640000000000000).toUTCString()
  const requestPayload = await request.json()
  const body = JSON.stringify({
    clientIP: request.headers.get('CF-Connecting-IP'),
  })

  const response = new Response(body, {
    headers: {
      'content-type': 'application/json',
    },
  })

  response.headers.set('Access-Control-Allow-Method', '*')
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5000')
  response.headers.set('Access-Control-Allow-Headers', '*')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  Object.keys(requestPayload).forEach(key => {
    response.headers.append(
      'set-cookie',
      `${key}=${requestPayload[key]}; expires=${expiryDate}; path=/; domain=.r071xo.workers.dev; HttpOnly; SameSite=None; Secure`,
    )
  })

  return response
}

const code = cookie => `
const requestCookie = '${cookie}';

if (requestCookie.includes('name=') && requestCookie.includes('quote=')) {
  requestCookie.split(';').forEach(cookie => {
    document.cookie = 'local_' + cookie.trim();
  });
} else {
  fetch('https://sweeps.r071xo.workers.dev/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ name, quote })
  }).then((response) => {
    return response.json()
  }).then((data) => {
    console.log(data)
  });
}
`

async function handleGetRequest(request) {
  return new Response(code(request.headers.get('Cookie')), {
    headers: { 'content-type': 'text/javascript' },
  })
}
