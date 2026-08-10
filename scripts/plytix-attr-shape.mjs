// Read the FULL shape of existing attributes to learn the correct create payload
// (error said field is `type_class`, not `type`). GET one attribute by id + list
// with all fields.
import { readFileSync } from 'node:fs'
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(Boolean).map(l => {
    const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]
  })
)
const auth = await fetch('https://auth.plytix.com/auth/api/get-token', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ api_key: env.PLYTIX_API_KEY, api_password: env.PLYTIX_API_PASSWORD }),
})
const token = (await auth.json())?.data?.[0]?.access_token
const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

// GET a specific attribute (metal) by id to see its full field set
const metalId = '6a5828571eff176280ab1ee9'
const one = await fetch(`https://pim.plytix.com/api/v1/attributes/product/${metalId}`, { headers: H })
console.log('GET attribute by id status:', one.status)
console.log('metal attribute full:', JSON.stringify((await one.json()).data?.[0] || {}, null, 1).slice(0, 900))

// search returning ALL fields (attributes: ['*'])
const all = await fetch('https://pim.plytix.com/api/v1/attributes/product/search', {
  method: 'POST', headers: H,
  body: JSON.stringify({ filters: [], attributes: ['*'], pagination: { page: 1, page_size: 3 } }),
})
console.log('\nsearch all-fields status:', all.status)
const aj = await all.json()
;(aj.data || []).forEach(a => console.log(a.name || a.label, '=>', JSON.stringify(a).slice(0, 300)))
