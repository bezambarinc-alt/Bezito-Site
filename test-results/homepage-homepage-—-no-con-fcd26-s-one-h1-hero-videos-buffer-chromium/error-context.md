# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> homepage — no console errors, one h1, hero videos buffer
- Location: tests/homepage.spec.ts:5:5

# Error details

```
Error: Console errors: Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 21
Received array:  ["Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.", "Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.", "Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.", "Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.", "Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.", "Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.", "Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.", "Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.", "Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.", "Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.", …]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - button "Open menu" [ref=e3] [cursor=pointer]:
      - generic [ref=e5]: Menu
    - link "Bez Ambar — home" [ref=e6] [cursor=pointer]:
      - /url: /
      - text: Bez Ambar
    - generic [ref=e7]:
      - button "Search" [ref=e8] [cursor=pointer]
      - button "Concierge" [ref=e12] [cursor=pointer]
  - main [ref=e16]:
    - generic [ref=e18]:
      - generic [ref=e22]:
        - paragraph [ref=e23]: Bez Ambar · Los Angeles
        - heading "The Magic of Light" [level=1] [ref=e24]
        - paragraph [ref=e25]: A certificate can grade a stone. It cannot tell how the light dances within it. In lesser hands, light merely touches the stone; done right, it melts into the divine.
      - generic [ref=e29]:
        - paragraph [ref=e30]: The Oval Band
        - heading "A Line You Never Take Off" [level=2] [ref=e31]
        - paragraph [ref=e32]: Cut to fit its place, set to disappear. Every stone calibrated to the hand that wears it. It doesn't announce itself; it stays.
    - generic [ref=e33]:
      - img "We Don't Just Cut the Stone. We Design the Cut." [ref=e36]
      - generic [ref=e38]:
        - paragraph [ref=e39]: Designing Diamond Cuts Since 1979
        - heading "We Don't Just Cut the Stone. We Design the Cut." [level=2] [ref=e40]
        - paragraph [ref=e41]: Most jewelry houses source pre-cut diamonds and build around them. Some cut their own—using other people's geometries. Bez Ambar designs the facets themselves, executes every cut in-house, and shapes each stone to fit its exact position in the piece. That's not craftsmanship. It's a different discipline entirely.
    - generic [ref=e42]:
      - img "From the Princess to the Elysian" [ref=e45]
      - generic [ref=e47]:
        - paragraph [ref=e48]: The Cuts
        - heading "From the Princess to the Elysian" [level=2] [ref=e49]
        - paragraph [ref=e50]: Bez Ambar is one of the original architects of the modern princess cut—a cut now part of the global language of fine jewelry. The same instinct continues through the Blaze®, the Elysian Cut™ and everything that follows.
        - link "Discover the Cuts →" [ref=e51] [cursor=pointer]:
          - /url: /elysian-cut
    - generic:
      - generic:
        - paragraph: The Secret
        - heading "SHHH" [level=2]
        - paragraph: Bez Ambar. Los Angeles. Est. 1979.
    - generic [ref=e56]:
      - paragraph [ref=e57]: The Design
      - heading "Drawn, Engineered, Finished by Hand" [level=2] [ref=e58]
      - paragraph [ref=e59]: For decades Bez Ambar has pushed the diamond cutting and faceting industry—treating every component as an act of high artistry. We honour the tools of tradition while constantly searching for new directions in style, technology, and technique. Everything we make arrives at uncompromised excellence.
      - link "Inside the Atelier →" [ref=e60] [cursor=pointer]:
        - /url: /about-bez-ambar
    - generic [ref=e61]:
      - img "A Commitment to Perfection" [ref=e64]
      - generic [ref=e66]:
        - paragraph [ref=e67]: The Details
        - heading "A Commitment to Perfection" [level=2] [ref=e68]
        - paragraph [ref=e69]: We don't source stones and build around them. We cut every stone to fit its exact position in the piece—using our own diamond cutting facility and deep faceting expertise. Each stone is shaped, calibrated, and set so nothing is ever off. Not by a degree. Not ever.
    - generic:
      - generic:
        - paragraph: Bez Ambar
        - heading "Chiseling Light" [level=2]
        - paragraph: Los Angeles · Since 1979
    - generic [ref=e70]:
      - generic [ref=e72]:
        - img "We Are Committed to Service"
      - generic [ref=e74]:
        - paragraph [ref=e75]: Our Service
        - heading "We Are Committed to Service" [level=2] [ref=e76]
        - paragraph [ref=e77]: We repair or restore any piece manufactured by Bez Ambar since 1979—regardless of its age. If we made it, we stand behind it. Bring it back. We'll make it right.
    - generic [ref=e78]:
      - generic [ref=e80]:
        - img "By Appointment, with the Concierge"
      - generic [ref=e82]:
        - paragraph [ref=e83]: Private Viewing
        - heading "By Appointment, with the Concierge" [level=2] [ref=e84]
        - paragraph [ref=e85]: Some pieces ask to be seen alone. Arrange a private viewing at the Los Angeles atelier—an existing piece, a single stone, or a commission of your own. Our concierge will guide you through the collection personally. No showroom, no crowd. Just the work, and the people who know it best.
        - button "Arrange a Private Consultation →" [ref=e86] [cursor=pointer]
    - generic [ref=e88]:
      - heading "We Transform Stones Into Art." [level=2] [ref=e89]
      - paragraph [ref=e90]: In partnership with diamond cutters, color stone dealers, and retailers. All inquiries welcome.
      - button "Bring Us Your Stone →" [ref=e91] [cursor=pointer]
      - paragraph [ref=e93]: Bez Ambar
      - paragraph [ref=e94]: Los Angeles · Est. 1979
    - generic [ref=e96]:
      - heading "The Private List" [level=2] [ref=e97]
      - paragraph [ref=e98]: First access to new pieces, archive discoveries, and notes from the atelier. Rarely sent. Always worth it.
      - generic [ref=e99]:
        - textbox "Your email" [ref=e100]
        - button "Join" [ref=e101] [cursor=pointer]
  - contentinfo [ref=e102]:
    - generic [ref=e103]:
      - generic [ref=e104]:
        - generic [ref=e105]:
          - paragraph [ref=e106]: Bez Ambar
          - paragraph [ref=e107]: Inventor of the Princess Cut
          - paragraph [ref=e108]: Los Angeles · Est. 1979
          - generic [ref=e109]:
            - link "Instagram" [ref=e110] [cursor=pointer]:
              - /url: https://www.instagram.com/bezambarjewelry/
            - link "Pinterest" [ref=e115] [cursor=pointer]:
              - /url: https://www.pinterest.com/bezambarinc/
            - link "YouTube" [ref=e118] [cursor=pointer]:
              - /url: https://www.youtube.com/@BezAmbarInc/
            - link "TikTok" [ref=e122] [cursor=pointer]:
              - /url: https://www.tiktok.com/@bezambar
            - link "LinkedIn" [ref=e125] [cursor=pointer]:
              - /url: https://www.linkedin.com/in/bez-ambar-869936a/
        - generic [ref=e129]:
          - button "Shop"
          - generic [ref=e130]:
            - link "Rings" [ref=e131] [cursor=pointer]:
              - /url: /jewelry/rings
            - link "Bands" [ref=e132] [cursor=pointer]:
              - /url: /jewelry/bands
            - link "Bracelets" [ref=e133] [cursor=pointer]:
              - /url: /jewelry/bracelets
            - link "Earrings" [ref=e134] [cursor=pointer]:
              - /url: /jewelry/earrings
            - link "Necklaces" [ref=e135] [cursor=pointer]:
              - /url: /jewelry/necklaces
            - link "Pendants" [ref=e136] [cursor=pointer]:
              - /url: /jewelry/pendants
            - link "The Archive" [ref=e137] [cursor=pointer]:
              - /url: /archive
        - generic [ref=e138]:
          - button "Discover"
          - generic [ref=e139]:
            - link "About Bez Ambar" [ref=e140] [cursor=pointer]:
              - /url: /about-bez-ambar
            - link "The Story" [ref=e141] [cursor=pointer]:
              - /url: /the-story
            - link "The Cuts" [ref=e142] [cursor=pointer]:
              - /url: /cuts
            - link "Elysian Cut™" [ref=e143] [cursor=pointer]:
              - /url: /elysian-cut
            - link "Journal" [ref=e144] [cursor=pointer]:
              - /url: /blog
            - link "Diamond Education" [ref=e145] [cursor=pointer]:
              - /url: /diamond-education
            - link "Ring Size Guide" [ref=e146] [cursor=pointer]:
              - /url: /ring-size-chart
        - generic [ref=e147]:
          - button "Service"
          - generic [ref=e148]:
            - button "Atelier Concierge" [ref=e149] [cursor=pointer]
            - link "Contact" [ref=e150] [cursor=pointer]:
              - /url: /contact
            - link "Warranty & Policies" [ref=e151] [cursor=pointer]:
              - /url: /warranty
        - generic [ref=e152]:
          - button "Visit the Atelier"
          - generic [ref=e153]:
            - generic [ref=e154]: 611 Wilshire BlvdLos Angeles, CA 90017
            - paragraph [ref=e155]: Private atelier · by appointment
            - button "Arrange a Visit ›" [ref=e156] [cursor=pointer]
      - generic [ref=e157]:
        - paragraph [ref=e158]: © 2026 Bez Ambar Inc. All rights reserved.
        - navigation "Legal" [ref=e159]:
          - link "Privacy Policy" [ref=e160] [cursor=pointer]:
            - /url: /privacy-policy
          - link "Terms of Service" [ref=e161] [cursor=pointer]:
            - /url: /terms
          - link "Warranty" [ref=e162] [cursor=pointer]:
            - /url: /warranty
  - navigation [ref=e163]:
    - button [ref=e164] [cursor=pointer]: ×
    - link:
      - /url: /
      - text: BEZ AMBAR
    - list [ref=e165]:
      - listitem [ref=e166]:
        - button [ref=e167] [cursor=pointer]: Collections ›
      - listitem [ref=e168]:
        - link [ref=e169] [cursor=pointer]:
          - /url: /archive
          - text: Jewelry Archive
      - listitem [ref=e170]:
        - button [ref=e171] [cursor=pointer]: Journal ›
      - listitem [ref=e172]:
        - button [ref=e173] [cursor=pointer]: Atelier ›
      - listitem [ref=e174]:
        - button [ref=e175] [cursor=pointer]: Service
  - dialog [ref=e176]:
    - button [ref=e178] [cursor=pointer]: ✕
    - generic [ref=e179]:
      - heading [level=2] [ref=e180]: Connect with the Atelier
      - paragraph [ref=e181]: We respond personally within one business day.
      - generic [ref=e182]:
        - generic [ref=e183]:
          - generic [ref=e184]:
            - generic [ref=e185]: Your Name
            - textbox [ref=e186]:
              - /placeholder: First and Last
          - generic [ref=e187]:
            - generic [ref=e188]: Email Address
            - textbox [ref=e189]:
              - /placeholder: you@email.com
        - generic [ref=e190]:
          - generic [ref=e191]:
            - generic [ref=e192]: Phone (optional)
            - textbox [ref=e193]:
              - /placeholder: (xxx) xxx-xxxx
          - generic [ref=e194]:
            - generic [ref=e195]: How Can We Help
            - combobox [ref=e196] [cursor=pointer]
        - generic [ref=e197]:
          - generic [ref=e198]: Message (optional)
          - textbox [ref=e199]:
            - /placeholder: Tell us what you have in mind…
        - paragraph [ref=e200]: Your enquiry is private and handled directly by Bez's team.
        - button [ref=e201] [cursor=pointer]: Send Inquiry
      - generic [ref=e202]:
        - separator [ref=e203]
        - generic [ref=e204]:
          - generic [ref=e205]: Tel
          - link [ref=e206] [cursor=pointer]:
            - /url: tel:2136299191
            - text: (213) 629-9191
        - generic [ref=e207]:
          - generic [ref=e208]: Atelier
          - generic [ref=e209]: 611 Wilshire Blvd Los Angeles, CA 90017
  - dialog [ref=e210]:
    - generic [ref=e211]:
      - button [ref=e212] [cursor=pointer]
      - heading [level=2] [ref=e215]: Contact Us
      - list [ref=e216]:
        - listitem [ref=e217]:
          - button [ref=e218] [cursor=pointer]:
            - generic [ref=e222]: Atelier Chat
            - generic [ref=e223]: ›
        - listitem [ref=e224]:
          - link [ref=e225] [cursor=pointer]:
            - /url: tel:2136299191
            - generic [ref=e229]: Call Us
            - generic [ref=e230]: ›
        - listitem [ref=e231]:
          - button [ref=e232] [cursor=pointer]:
            - generic [ref=e240]: Book an Appointment
            - generic [ref=e241]: ›
        - listitem [ref=e242]:
          - button [ref=e243] [cursor=pointer]:
            - generic [ref=e248]: Find a Retailer
            - generic [ref=e249]: ›
        - listitem [ref=e250]:
          - button [ref=e251] [cursor=pointer]:
            - generic [ref=e255]: Services
            - generic [ref=e256]: ›
  - alert [ref=e257]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | const IGNORE_ORIGINS = ['vercel.live', 'chrome-extension://']
  4  | 
  5  | test('homepage — no console errors, one h1, hero videos buffer', async ({ page }) => {
  6  |   const consoleErrors: string[] = []
  7  | 
  8  |   page.on('console', (msg) => {
  9  |     if (msg.type() === 'error') {
  10 |       const text = msg.text()
  11 |       const ignore = IGNORE_ORIGINS.some((o) => text.includes(o))
  12 |       if (!ignore) consoleErrors.push(text)
  13 |     }
  14 |   })
  15 | 
  16 |   await page.goto('/', { waitUntil: 'networkidle' })
  17 | 
  18 |   // No unexpected console errors
> 19 |   expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toHaveLength(0)
     |                                                                        ^ Error: Console errors: Applying inline style violates the following Content Security Policy directive 'style-src 'self' 'unsafe-inline' 'nonce-curator-8a90bee5-25c8-4b36-a23b-0db33a392762' https://fonts.googleapis.com https://webfonts.fontstand.com https://d3a1s2k5oq9b60.cloudfront.net https://cdn.curator.io'. Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list. The action has been blocked.
  20 | 
  21 |   // Exactly one h1
  22 |   const h1Count = await page.locator('h1').count()
  23 |   expect(h1Count).toBe(1)
  24 | 
  25 |   // Both top-hero <video> elements reach readyState >= 2 within 8 seconds
  26 |   const videos = page.locator('.ScrollWipeCarousel-module__pin video')
  27 |   await expect(videos).toHaveCount(2)
  28 | 
  29 |   for (let i = 0; i < 2; i++) {
  30 |     await expect
  31 |       .poll(
  32 |         () => videos.nth(i).evaluate((v: HTMLVideoElement) => v.readyState),
  33 |         { timeout: 8_000, message: `Hero video ${i} did not reach readyState >= 2` },
  34 |       )
  35 |       .toBeGreaterThanOrEqual(2)
  36 |   }
  37 | })
  38 | 
```