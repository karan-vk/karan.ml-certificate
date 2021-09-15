addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */

const setCache = async (data) => {
  await PORTT.put("cert", JSON.stringify(data), { expirationTtl: 60 * 30 })
}

const getCache = () => PORTT.get("cert")


async function handleRequest(request) {
  console.log(JSON.stringify(request))

  const cache = await getCache()

  if (true) {
    let resp = await fetch('https://berowra.karanvk.deta.app/api/collection/1tattom4nomb')
    let data = await resp.json()
    let keys = []
    data.items.forEach((element) => {
      keys.push(`https://berowra.karanvk.deta.app/api/content/${element.key}`)
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
      if (transformed["Image"] != null) {
        transformed["Image"] = transformed["Image"].map(e => "https://berowra.karanvk.deta.app/file/" + e)
      }
      results.push(transformed)
    })

    await setCache(results)
    return new Response(JSON.stringify(results), {
      headers: { 'content-type': 'application/json' },
    })
  } else {
    return new Response(cache, {
      headers: { 'content-type': 'application/json' },
    })
  }



}
