addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */

const setCache = async (data, limit) => {
  await PORTT.put("cert" + limit, data, { expirationTtl: 60 * 30 })
}

const getCache = (limit) => PORTT.get("cert" + limit)


async function handleRequest(request) {
  const { searchParams } = new URL(request.url)
  let limit = searchParams.get('limit')
  const cache = await getCache(limit)

  if (!cache) {
    let resp = await fetch('https://berowra.karanvk.deta.app/api/collection/1tattom4nomb')
    let data = await resp.json()
    let keys = []
    data.items.every((element, index) => {
      if (index == limit) {
        return false
      }
      keys.push(`https://berowra.karanvk.deta.app/api/content/${element.key}`)
      return true
    });
    const pages = await Promise.all(keys.map(async url => {
      const resp = await fetch(url);
      return resp.json();
    }));
    let results = []
    pages.forEach((element) => {
      const content = element.content
      let transformed = {}
      transformed.title = element.title
      for (var key in content) {
        if (content.hasOwnProperty(key)) {
          transformed[content[key].title] = content[key].value === "None" ? null : content[key].value;
        }
      }
      if (transformed["Certificate"] != null) {
        transformed["Certificate"] = transformed["Certificate"].map(e => "https://berowra.karanvk.deta.app/file/" + e)
      }
      // if (transformed["Image"] != null) {
      //   transformed["Image"] = transformed["Image"].map(e => "https://berowra.karanvk.deta.app/file/" + e)
      // }
      results.push(transformed)
    })
    let body = JSON.stringify(results)
    await setCache(body, limit)
    return new Response(body, {
      headers: { 'content-type': 'application/json' },
    })
  } else {
    return new Response(cache, {
      headers: { 'content-type': 'application/json' },
    })
  }



}
