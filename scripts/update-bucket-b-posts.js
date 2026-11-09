// update-bucket-b-posts.js — rewrites all 4 Bucket B posts to ~900 words, shorter paragraphs
// node --env-file=.env.local scripts/update-bucket-b-posts.js

const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const POSTS = [

{
slug: 'mens-diamond-rings',
body: `<p><em>Men's diamond rings are one of the least-guided purchases in fine jewelry. The conventions that govern women's rings don't transfer — and that's the first thing to get right.</em></p>
<hr>
<h3 id="proportion">Proportion First</h3>
<h2 id="why-scale-decides-everything">Why Scale Decides Everything</h2>
<p>The most common mistake in men's diamond jewelry is a mismatch between stone height, setting construction, and band width. A cathedral solitaire on a narrow band works in women's jewelry because every element is scaled for it. On a wide men's shank, the same configuration reads as borrowed — a component from one design grafted onto another.</p>
<p>Men's rings run from 4mm to 12mm wide. Most men find their proportional center between 6mm and 10mm, but the only reliable way to find the right width is to put rings on your hand. A 4mm band disappears on a wide hand. A 12mm band on a narrow hand reads as architectural armor.</p>

<h3 id="black-diamond">Black Diamond</h3>
<h2 id="a-different-visual-language">A Different Visual Language</h2>
<p>Black diamond is opaque rather than transparent. Where a colorless diamond scintillates in prismatic flashes, black diamond absorbs light and presents a deep, graphic surface — matte to slightly lustrous depending on the cut and polish. That visual language translates naturally into men's jewelry.</p>
<p>The two dominant approaches: monochromatic (black diamond in blackened metal, the ring reads as a single tonal object) or contrasting (black diamond in platinum or yellow gold, where the boundary between metal and stone is the design). Both are valid — the choice is whether you want cohesion or contrast.</p>
<p>Most commercial black diamonds have been irradiated or fracture-filled. These treatments can make the stone marginally more brittle. For a ring worn daily in demanding conditions, bezel or channel setting provides better protection than prongs that leave the girdle exposed.</p>

<h3 id="metal">Metal Over Time</h3>
<h2 id="what-each-metal-costs-over-decades">What Each Metal Costs Over Decades</h2>
<p>Platinum is the right metal for a men's ring meant for decades of daily wear. It doesn't change color, requires no plating, and develops a wear patina most men prefer to periodic polishing. A wide men's ring in platinum has genuine heft — which reinforces the sense of permanence the piece is meant to carry.</p>
<p>White gold requires rhodium plating to maintain its white color. The plating wears through at high-contact points after months of daily wear. For an active man, the maintenance difference between white gold and platinum over five years is meaningful.</p>
<p>Titanium, tungsten, and cobalt chrome are harder than precious metals. They're also not resizable. Men's fingers change with age and fitness. A ring that can't be resized must be replaced. For a ring meant for a lifetime, that tradeoff matters more than the upfront cost savings.</p>

<h3 id="setting-styles">Setting Construction</h3>
<h2 id="bezel-channel-flush">Bezel, Channel, and Flush</h2>
<p>A bezel setting — continuous metal rim rather than prongs — is the most protective construction and one of the cleanest looking on a men's ring. The stone is fully secured, the girdle protected from impact. Particularly appropriate for black diamonds.</p>
<p>Channel setting places stones in a groove between two parallel walls with no prongs. Diamonds sit flush or near-flush with the band surface — a clean linear look without raised elements. Ideal for smaller diamonds, especially in a wide men's band.</p>
<p>Flush or gypsy setting places a single stone into a drilled seat, level with the surface. Only the table of the stone is visible. For men's rings, this delivers the stone as a quiet personal detail rather than a focal point — one or three flush-set diamonds across a plain band reads as refinement, not ornamentation.</p>

<h3 id="sizing">Sizing and Service</h3>
<h2 id="what-to-know-before-you-commission">What to Know Before You Commission</h2>
<p>Men's ring sizing is more variable than women's because men's hands respond more dramatically to temperature and physical changes. Size to the larger end of your natural range — a ring sized for summer fits year-round. A ring sized for winter will be loose and at risk of loss in warm months.</p>
<p>Wide bands feel tighter than narrow ones at the same nominal size. A man sized at 10 in a 4mm band typically needs a 10.5 or 11 in a 10mm band. Ask explicitly about width compensation when sizing a ring above 8mm — some jewelers adjust for it automatically, others don't.</p>
<p>Know the service history of the piece before you buy it. A plain precious metal band is straightforward to resize at any point. A band with stones set across the full surface requires removal and resetting in the modified section. Tension-set rings may not be resizable at all without damaging the design.</p>`
},

{
slug: 'stretch-band-rings',
body: `<p><em>A standard ring is sized to the finger's base circumference. Fingers are not cylinders. For many people, the joint is meaningfully larger than the base — and no standard size satisfies both requirements at once.</em></p>
<hr>
<h3 id="the-problem">The Knuckle Problem</h3>
<h2 id="why-standard-sizing-fails">Why Standard Sizing Fails for Many Hands</h2>
<p>The difference between knuckle and base circumference varies by person. For some hands it's minimal — half a size or less — and a standard ring works fine. For others, particularly those with joint changes from arthritis or age, the difference is substantial enough that no standard size works for both.</p>
<p>The conventional workarounds don't hold up. Sizing up to clear the knuckle leaves the ring spinning and migrating throughout the day. Sizing down means a struggle every time the ring goes on and off, with the knuckle abrading the metal over years. Neither is a solution — they're accommodations to a constraint the jewelry industry has accepted rather than solved.</p>

<h3 id="easyfit">The EasyFit Shank</h3>
<h2 id="how-the-mechanism-works">How the Mechanism Works</h2>
<p>The EasyFit shank is a patented ring construction by Bez Ambar. The mechanism replaces the continuous band of a standard shank with a flexible structure that opens under gentle lateral pressure and closes securely when released. From the outside, the ring looks like any other fine jewelry piece — the mechanism is entirely internal, visible only at the underside of the shank.</p>
<p>In the open position, the ring passes over a significantly larger diameter than the closed position — typically enough to accommodate the full difference between joint size and base size. In the closed position, it contracts to the base circumference, holding the ring in place without spinning. No springs, no pins, no small components that wear out. The mechanism relies on controlled metal elasticity.</p>

<h3 id="who-benefits">Who It Helps Most</h3>
<h2 id="candidates-for-a-stretch-ring">Candidates for a Stretch or EasyFit Ring</h2>
<p>The most common candidate is someone whose knuckle circumference is one or more sizes larger than their ring base. This is particularly common in women over fifty, where joint changes — from arthritis or aging — progressively increase the difference between joint and base size.</p>
<p>Arthritis affects ring sizing in two ways: it enlarges the joint, and it makes forcing a tight ring over an inflamed joint painful. An EasyFit ring eliminates both problems — the joint is never stressed during entry, and the ring doesn't need to be sized to a compromised dimension.</p>
<p>Pregnancy and the temporary swelling it causes create the same problem in a shorter time frame. While an EasyFit shank is designed for permanent jewelry, the concept allows women to continue wearing meaningful pieces through periods when their fingers are temporarily enlarged.</p>

<h3 id="the-extent">The Extent Collection</h3>
<h2 id="the-same-mechanism-at-bracelet-scale">The Same Mechanism at Bracelet Scale</h2>
<p>The Extent bracelets apply the same engineering at wrist scale. The patented flex mechanism allows the bracelet to open wide for the hand and close precisely around the wrist. No clasp to manage, no box closure to align, no push-tab spring to break. It goes on and off with a gesture.</p>
<p>The collection runs round brilliant diamonds in 25mm and 30mm widths, Asscher-cut in a double-row configuration, and emerald-cut in a full edge-to-edge setting. The round models — Liquid Carat™ — present diamonds in an unbroken sequence with no visible structural interruption. The bracelet moves like fabric and returns to its shape.</p>
<p>What the Extent collection demonstrates is that the flex mechanism is compatible with serious fine jewelry construction: VS clarity stones, matched cuts, substantial carat weights. This is not a compromise. It's the same standard of construction as any other Bez Ambar piece, with the mechanism engineered in from the start.</p>

<h3 id="commissioning">Commissioning</h3>
<h2 id="how-to-order-a-ring-with-an-easyfit-shank">How to Order a Ring With an EasyFit Shank</h2>
<p>The process begins with establishing both measurements: knuckle circumference and base circumference. Both are needed to specify the mechanism's range of motion for the individual hand. The sizing consultation is more involved than for a standard ring — the jeweler needs to understand the full range, not just a nominal size.</p>
<p>The EasyFit shank can be added to most ring designs. Existing pieces can be retrofitted in many cases, and new pieces can be built with it from the start. Lead time is the same as for any custom fine jewelry piece — typically six to ten weeks depending on complexity.</p>`
},

{
slug: 'ring-enhancers-and-guards',
body: `<p><em>A ring enhancer is designed to frame and expand an existing ring without modifying the original piece. It solves problems that buying a new ring doesn't address.</em></p>
<hr>
<h3 id="what-enhancers-do">What Enhancers Do</h3>
<h2 id="how-an-enhancer-differs-from-a-band">How an Enhancer Differs from a Matching Band</h2>
<p>A ring enhancer wraps around or sits against an existing ring rather than stacking beside it. Where a matching wedding band sits alongside the engagement ring with a gap between them, an enhancer is shaped to fit the existing setting — contouring around the prongs, enclosing the stone's base, or framing the entire piece within a larger decorative structure.</p>
<p>The gap matters more than it seems. A straight band next to a cathedral or low-profile solitaire leaves a visible space between the band and the setting. Over years of daily wear, the two rings also migrate against each other and abrade the prongs. An enhancer eliminates both problems: it fits snugly without forcing the engagement ring into a fixed position.</p>
<p>Ring guards are a related but distinct category — bands designed to secure a ring that fits loosely. Where an enhancer is primarily aesthetic, a guard is primarily functional. In practice, many pieces serve both purposes: a fitted guard with pavé diamonds across its shoulders is simultaneously functional and decorative.</p>

<h3 id="types">Main Configurations</h3>
<h2 id="what-each-enhancer-achieves">What Each Enhancer Achieves</h2>
<p>A V-notch or U-notch enhancer is the most common type. The center of the enhancer is shaped to receive the existing ring's setting — a prong solitaire sits in a V-cut, a bezel-set stone in a U-cut. The enhancer frames the engagement ring from below and to both sides, and its outer surface extends the ring's visual footprint.</p>
<p>A bypass enhancer runs on either side of the ring, with decorative elements arching alongside the center stone without a cutout. This works for rings that are already decorative enough that a cutout would interrupt the design.</p>
<p>A full frame surrounds the engagement ring completely within a larger setting. This transforms the original piece into a component of a new, larger ring. The most dramatic option — the frame can display the original stone in a halo configuration or shift its apparent shape by surrounding it with differently cut diamonds.</p>

<h3 id="soldered-vs-removable">Permanent or Removable</h3>
<h2 id="whether-to-connect-the-pieces">Whether to Connect the Pieces</h2>
<p>Soldering the enhancer to the engagement ring creates a single rigid unit. The two can't migrate against each other, no debris accumulates in the gap, and the composite piece wears cleanly. The cost is that the two pieces can no longer be worn separately.</p>
<p>For a woman who will always wear both rings together, soldering is the right choice. For a woman who wants the option of wearing the engagement ring alone — during pregnancy, during athletic activity, or simply when she wants a different look — keeping the pieces separate is the right choice.</p>
<p>A middle option is a small positioning notch on the enhancer's inner surface that locates the engagement ring precisely without permanently joining them. This reduces migration without committing to a permanent connection. Not all jewelers offer this — it requires a custom fit rather than a standard contour.</p>

<h3 id="commissioning">Commissioning</h3>
<h2 id="what-to-bring-to-the-jeweler">What to Bring to the Jeweler</h2>
<p>An enhancer made to fit a specific engagement ring requires that ring to be physically present during design and fitting. The jeweler needs to measure the setting geometry, the shank profile, and the overall ring height. Photographs are insufficient for a precision fit. The engagement ring will need to be left with the jeweler for the duration of fabrication — typically four to eight weeks.</p>
<p>The metal should match the engagement ring or contrast deliberately. Mixing white gold and platinum is a common unintentional mismatch: platinum is a cool neutral white, rhodium-plated white gold is a brighter reflective white. On the hand together, the difference is visible as the rhodium wears.</p>
<p>Budget for the enhancer itself, the labor for the custom fit, and — if soldering — the cost of the join and finish. A well-made enhancer in precious metal with quality side stones typically runs $1,500 to $8,000 depending on scale and stone weight.</p>`
},

{
slug: 'baguette-diamond-bands-for-women',
body: `<p><em>A baguette diamond doesn't sparkle the way a round brilliant does. It reflects in broad, rectangular flashes — cool and architectural rather than prismatic. This is not a compromise. It is a completely different design language.</em></p>
<hr>
<h3 id="how-baguettes-behave">How Baguettes Behave</h3>
<h2 id="step-cut-light-vs-brilliant-light">Step-Cut Light vs. Brilliant-Cut Light</h2>
<p>Baguette is a step-cut diamond with a rectangular outline. Rather than many small facets designed to maximize scintillation, baguette diamonds have fewer, larger parallel facets that produce broad mirror-like reflections. The stone acts like a hall of mirrors rather than a prism — light enters, bounces in a sequence of rectangular flashes, and exits in patterns that shift as the hand moves.</p>
<p>In a band, multiple baguettes set edge to edge create a horizontal sequence of parallel reflections running around the finger. The effect is precise, linear, and considered — the exact opposite of the omnidirectional sparkle of a pavé or brilliant-cut band. It's a specific visual language, and it rewards wearing.</p>
<p>Color shows more readily in step-cuts than in brilliant cuts — the large open facets don't mask body color. G or above in white metal is the correct minimum. Clarity matters similarly: inclusions in a baguette's open table are more visible than in a brilliant cut. VS clarity or above is appropriate for fine jewelry baguettes worn in daylight.</p>

<h3 id="channel-setting">Channel Setting</h3>
<h2 id="why-it-suits-baguettes">Why It Suits Baguettes</h2>
<p>Channel setting — stones held in a groove between two parallel metal rails with no individual prongs — is the standard for baguette bands because it matches the stone's geometry. The rectangular outline of each baguette runs parallel to the channel walls, and each stone's ends meet the adjacent stone's ends with minimum metal between them.</p>
<p>The quality of the channel setting determines long-term stone stability. Baguettes in a channel rely on precise calibration of channel width — slightly too wide and the stones shift laterally, slightly too narrow and they can't seat correctly. Custom-cut or carefully calibrated stones produce a better result than mixed or uncalibrated ones. This is a bench-level quality issue most clients never think to ask about.</p>

<h3 id="eternity-vs-half">Eternity vs. Half-Eternity</h3>
<h2 id="what-the-construction-difference-means">What the Construction Difference Means</h2>
<p>A baguette eternity band — stones set continuously around the full circumference — is one of the most demanding settings to execute and one of the most striking when done right. Every stone is visible from every angle. The calibration requirement is the highest in the category: the stones in the final position must meet the first position without a visible step in height or a gap in the setting.</p>
<p>A half-eternity baguette band — stones set across the top half only — is a more practical construction for daily wear. The undersetting is plain metal, comfortable against the palm, and significantly less complex to fabricate. The visual difference is perceptible only when the ring is off the finger; on the hand, both present an uninterrupted line of stone across the visible surface.</p>

<h3 id="pairing">Pairing with Other Rings</h3>
<h2 id="how-baguette-bands-work-alongside-other-pieces">How Baguette Bands Work Alongside Other Pieces</h2>
<p>A baguette band pairs differently with a solitaire than a brilliant-cut band would. The step-cut character creates a contrast with the brilliant-cut center stone — the two stones speak different visual languages, and that contrast is the point. The solitaire's scintillation is set against the baguette's mirror reflections, and neither diminishes the other. This is why baguette bands have been a standard pairing with round solitaires for nearly a century.</p>
<p>A baguette band next to a step-cut engagement ring creates a unified tonal story — both pieces speaking the same language, the combination reading as considered rather than eclectic. A three-piece set with a step-cut center flanked by two matching baguette bands is one of the most architecturally resolved configurations in fine jewelry.</p>

<h3 id="bez-ambar">The Bez Ambar Baguette Band</h3>
<h2 id="c0625-the-oval-eternity">C0625 — The Oval Eternity</h2>
<p>The Bez Ambar baguette eternity band (C0625) is a full-eternity oval ring composed entirely of baguette-cut diamonds, channel-set in a seamless line. The oval outline distinguishes it from a standard round band — the stones on the upper and lower portions are angled to follow the oval's curve, which requires more precise calibration than a round band where every stone occupies an equivalent arc position. The result follows the finger's natural cross-section rather than sitting as a perfect circle.</p>
<p>Made in Los Angeles in 18k or platinum. Made to order, sized precisely to the client's finger. Channel-setting quality and stone calibration held to the same standard across all configurations — each stone examined against its adjacent stones in the channel before setting, the finished ring checked for visual continuity across the full circumference before delivery.</p>`
}

]

async function run() {
  for (const post of POSTS) {
    const result = await pool.query(
      'UPDATE blog_posts SET body = $1 WHERE slug = $2 RETURNING slug',
      [post.body, post.slug]
    )
    const wc = post.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(w => w).length
    console.log(result.rows.length ? `UPDATED: ${post.slug} (~${wc} words)` : `NOT FOUND: ${post.slug}`)
  }
  await pool.end()
  console.log('Done.')
}

run().catch(e => { console.error(e.message); process.exit(1) })
