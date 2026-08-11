export interface RetailerLocation {
  label?: string
  street: string
  city: string
  state: string
  zip: string
  hours: string
  phone?: string
}

export interface Retailer {
  slug: string
  name: string
  shortName: string
  cityState: string
  heroImg: string
  about: string
  website: string
  ctaCity: string
  locations: RetailerLocation[]
}

export const RETAILERS: Retailer[] = [
  {
    slug: 'ahee-jewelers',
    name: 'Edmund T. Ahee Jeweler',
    shortName: 'Ahee Jeweler',
    cityState: 'Grosse Pointe Woods, MI',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Jewelry%20Images/Rings/crossover-ashoka-white-hand',
    about: "Family jeweler serving greater Detroit since 1947. An authorized Bez Ambar destination for over two decades, Ahee brings the precision of the Elysian Cut\u2122 to the Grosse Pointe community.",
    website: 'https://www.ahee.com',
    ctaCity: 'Grosse Pointe Woods',
    locations: [
      {
        street: '20139 Mack Avenue',
        city: 'Grosse Pointe Woods',
        state: 'MI',
        zip: '48236',
        phone: '(313) 886-4600',
        hours: 'Mon\u2013Sat 10am\u20136pm \u00b7 Sun Closed',
      },
    ],
  },
  {
    slug: 'alson-jewelers',
    name: 'Alson Jewelers',
    shortName: 'Alson Jewelers',
    cityState: 'Cleveland, OH',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Jewelry%20Images/Rings/ceylon-sapphire-1130-hero',
    about: "Cleveland\u2019s preeminent fine jewelry destination and authorized Rolex jeweler. Alson carries Bez Ambar\u2019s distinctive diamond designs, from the Princess Cut originals to the Elysian Cut\u2122, in their Chagrin Boulevard showroom.",
    website: 'https://www.alsonjewelers.com',
    ctaCity: 'Cleveland',
    locations: [
      {
        street: '28149 Chagrin Boulevard',
        city: 'Beachwood',
        state: 'OH',
        zip: '44122',
        phone: '(216) 464-6767',
        hours: 'Mon\u2013Fri 10:30am\u20135:30pm \u00b7 Sat 10am\u20135pm \u00b7 Sun Closed',
      },
    ],
  },
  {
    slug: 'ascot-diamonds',
    name: 'Ascot Diamonds',
    shortName: 'Ascot Diamonds',
    cityState: 'Dallas & Washington D.C.',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Jewelry%20Images/Rings/tourmaline-zircon-shank-baguette',
    about: "By-appointment diamond specialists with showrooms in Dallas and Washington D.C. Ascot focuses on custom engagement rings and precision-cut loose diamonds \u2014 a natural fit for the Bez Ambar atelier\u2019s approach to light performance.",
    website: 'https://www.ascotdiamonds.com',
    ctaCity: 'Dallas & Washington D.C.',
    locations: [
      {
        label: 'Dallas',
        street: '15851 Dallas Pkwy, Suite 170',
        city: 'Addison',
        state: 'TX',
        zip: '75001',
        phone: '(866) 382-8020',
        hours: 'Mon\u2013Fri 10am\u20136pm \u00b7 Sat 10am\u20132pm \u00b7 By appointment recommended',
      },
      {
        label: 'Washington D.C.',
        street: '4301 Fairfax Drive, Suite 107',
        city: 'Arlington',
        state: 'VA',
        zip: '22203',
        phone: '(866) 382-8020',
        hours: 'Mon\u2013Fri 10am\u20136pm \u00b7 Sat 10am\u20133pm \u00b7 By appointment recommended',
      },
    ],
  },
  {
    slug: 'bigham-jewelers',
    name: 'Bigham Jewelers',
    shortName: 'Bigham Jewelers',
    cityState: 'Naples, FL',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Jewelry%20Images/Necklaces/premiere-25ct-oval-hero',
    about: "Naples, Florida\u2019s destination for fine jewelry and an authorized Bez Ambar showroom. Bigham serves the Gulf Coast\u2019s discerning clientele with an edited selection of diamond jewelry from the Bez Ambar collection.",
    website: 'https://www.bighamjewelers.com',
    ctaCity: 'Naples',
    locations: [
      {
        street: '2425 Tamiami Trail North, Suite 101',
        city: 'Naples',
        state: 'FL',
        zip: '34103',
        phone: '(239) 434-2800',
        hours: 'Mon\u2013Fri 10am\u20135pm \u00b7 Sat\u2013Sun Closed',
      },
    ],
  },
  {
    slug: 'eiseman-jewels',
    name: 'Eiseman Jewels',
    shortName: 'Eiseman Jewels',
    cityState: 'Dallas, TX',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Golden_Hour_C0895_W_Camera_Raw_filter_m4grbg',
    about: "Dallas\u2019s premier jeweler since 1963. Located at NorthPark Center \u2014 one of the finest shopping destinations in the American Southwest \u2014 Eiseman Jewels carries Bez Ambar alongside an exceptional collection of luxury timepieces and fine jewelry.",
    website: 'https://www.eisemanjewels.com',
    ctaCity: 'Dallas',
    locations: [
      {
        label: 'NorthPark Center',
        street: '8687 N Central Expressway, Suite 516',
        city: 'Dallas',
        state: 'TX',
        zip: '75225',
        phone: '(214) 369-6100',
        hours: 'Sun\u2013Fri 10am\u20135pm \u00b7 Sat Closed',
      },
    ],
  },
  {
    slug: 'i-gorman-jewelers',
    name: 'I. Gorman Jewelers',
    shortName: 'I. Gorman',
    cityState: 'Washington, DC',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Jewelry%20Images/Necklaces/baguette-line-lifestyle',
    about: "Washington D.C.\u2019s intimate atelier for estate and fine jewelry since 1981. By appointment, I. Gorman offers a curated perspective on diamond design \u2014 including select pieces from the Bez Ambar collection \u2014 from their K Street studio.",
    website: 'https://www.igorman.com',
    ctaCity: 'Washington',
    locations: [
      {
        street: '1133 20th Street NW, Suite LL1',
        city: 'Washington',
        state: 'DC',
        zip: '20036',
        phone: '(202) 775-8544',
        hours: 'Tue\u2013Sat 12\u20135pm \u00b7 By appointment',
      },
    ],
  },
  {
    slug: 'james-elliott-jewelers',
    name: 'James Elliot',
    shortName: 'James Elliot',
    cityState: 'Scottsdale, AZ',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Jewelry%20Images/Rings/crossover-ashoka-yellow-stack',
    about: "Scottsdale\u2019s most refined private jewelry showroom. James Elliot combines deep gemological expertise with a personal, appointment-driven experience \u2014 the same philosophy that defines the Bez Ambar atelier.",
    website: 'https://www.jameselliot.com',
    ctaCity: 'Scottsdale',
    locations: [
      {
        street: '7293 N Scottsdale Road, Suite 101',
        city: 'Scottsdale',
        state: 'AZ',
        zip: '85253',
        phone: '(480) 368-9009',
        hours: 'Tue\u2013Sat 10am\u20135:30pm \u00b7 Sun\u2013Mon By appointment',
      },
    ],
  },
  {
    slug: 'kassab-jewelers',
    name: 'Kassab Jewelers',
    shortName: 'Kassab Jewelers',
    cityState: 'Portland, OR',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Jewelry%20Images/Necklaces/pear-shaped-necklace-hero2',
    about: "The Pacific Northwest\u2019s premier fine jewelry retailer, with three locations across Greater Portland and the Oregon coast. Kassab Jewelers is an authorized Bez Ambar destination serving a clientele that prizes craftsmanship over volume.",
    website: 'https://www.kassabjewelers.com',
    ctaCity: 'Portland',
    locations: [
      {
        label: 'Downtown Portland',
        street: '529 SW Broadway',
        city: 'Portland',
        state: 'OR',
        zip: '97205',
        hours: 'Tue\u2013Sat 10am\u20135pm \u00b7 Mon\u2013Sun Closed',
      },
      {
        label: 'Lake Oswego',
        street: '310 N State Street, Suite 106',
        city: 'Lake Oswego',
        state: 'OR',
        zip: '97034',
        hours: 'Mon\u2013Sat 10am\u20136pm \u00b7 Sun Closed',
      },
      {
        label: 'Washington Square',
        street: '9306 SW Washington Square Road',
        city: 'Tigard',
        state: 'OR',
        zip: '97223',
        hours: 'Mon\u2013Sat 10am\u20139pm \u00b7 Sun 11am\u20137pm',
      },
    ],
  },
  {
    slug: 'london-jewelers-long-island',
    name: 'London Jewelers',
    shortName: 'London Jewelers',
    cityState: 'New York, NY',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Jewelry%20Images/Rings/ceylon-sapphire-1130-model',
    about: "New York\u2019s iconic luxury jeweler, serving five generations of discerning clients across Long Island and the Hamptons. London Jewelers carries Bez Ambar\u2019s most celebrated designs \u2014 including the originator of the Princess Cut \u2014 in their landmark showrooms.",
    website: 'https://www.londonjewelers.com',
    ctaCity: 'New York',
    locations: [
      {
        label: 'Manhasset',
        street: '2046 Northern Boulevard',
        city: 'Manhasset',
        state: 'NY',
        zip: '11030',
        hours: 'Mon\u2013Sat 10am\u20135:30pm \u00b7 Sun 12\u20135:30pm',
      },
      {
        label: 'Americana Manhasset',
        street: '2188 Northern Boulevard',
        city: 'Manhasset',
        state: 'NY',
        zip: '11030',
        hours: 'Mon\u2013Sat 10am\u20135:30pm \u00b7 Sun 12\u20135:30pm',
      },
      {
        label: 'Glen Cove',
        street: '28 School Street',
        city: 'Glen Cove',
        state: 'NY',
        zip: '11542',
        hours: 'Mon\u2013Sat 9:30am\u20134:45pm \u00b7 Sun Closed',
      },
      {
        label: 'East Hampton',
        street: '2 Main Street',
        city: 'East Hampton',
        state: 'NY',
        zip: '11937',
        hours: 'Mon\u2013Sat 10am\u20135:30pm \u00b7 Sun 11am\u20135pm',
      },
      {
        label: 'Southampton',
        street: '47 Main Street',
        city: 'Southampton',
        state: 'NY',
        zip: '11968',
        hours: 'Mon\u2013Sat 10am\u20135:30pm \u00b7 Sun 11am\u20135pm',
      },
    ],
  },
  {
    slug: 'radcliffe-jewelers',
    name: 'Radcliffe Jewelers',
    shortName: 'Radcliffe Jewelers',
    cityState: 'Baltimore, MD',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Jewelry%20Images/Bracelets/5FLX45-on-hand',
    about: "Maryland\u2019s trusted fine jewelry retailer with showrooms in Pikesville and Towson. Radcliffe Jewelers brings the Bez Ambar collection to the greater Baltimore community, offering the full range of diamond designs with personal service.",
    website: 'https://www.radcliffejewelers.com',
    ctaCity: 'Baltimore',
    locations: [
      {
        label: 'Pikesville',
        street: '1819 Reisterstown Road',
        city: 'Pikesville',
        state: 'MD',
        zip: '21208',
        phone: '(410) 321-6590',
        hours: 'Please call for current hours',
      },
      {
        label: 'Towson',
        street: '800 Kenilworth Drive',
        city: 'Towson',
        state: 'MD',
        zip: '21204',
        phone: '(410) 321-6590',
        hours: 'Please call for current hours',
      },
    ],
  },
  {
    slug: 'royal-jewelers-andover',
    name: 'Royal Jewelers',
    shortName: 'Royal Jewelers',
    cityState: 'Andover, MA',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Jewelry%20Images/Necklaces/single-row-lifestyle',
    about: "Andover\u2019s premier fine jewelry destination, Royal Jewelers has served New England for decades with an elegant Main Street showroom. An authorized Bez Ambar retailer bringing the atelier\u2019s diamond artistry to the greater Boston area.",
    website: 'https://www.royaljewelers.com',
    ctaCity: 'Andover',
    locations: [
      {
        street: '58 Main Street',
        city: 'Andover',
        state: 'MA',
        zip: '01810',
        phone: '(978) 475-3330',
        hours: 'Mon\u2013Wed & Fri 10am\u20135:30pm \u00b7 Thu 10am\u20137pm \u00b7 Sat 10am\u20135pm \u00b7 Sun Closed',
      },
    ],
  },
  {
    slug: 'sid-potts',
    name: 'Sid Potts, Inc.',
    shortName: 'Sid Potts',
    cityState: 'Shreveport, LA',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Jewelry%20Images/Bracelets/flex-bracelet-on-black',
    about: "Shreveport\u2019s landmark diamond destination. Sid Potts has been an authorized Bez Ambar retailer since the early years of the collection, bringing princess-cut and fine diamond jewelry to the Gulf South with the expertise of a multi-generational jeweler.",
    website: 'https://www.sidpotts.com',
    ctaCity: 'Shreveport',
    locations: [
      {
        street: '8535 Business Park Drive',
        city: 'Shreveport',
        state: 'LA',
        zip: '71105',
        phone: '(318) 797-2929',
        hours: 'Mon\u2013Fri 9am\u20135:30pm \u00b7 Sat 10am\u20132pm',
      },
    ],
  },
  {
    slug: 't-bird-jewelers',
    name: 'T-Bird Jewels',
    shortName: 'T-Bird Jewels',
    cityState: 'Las Vegas, NV',
    heroImg: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good,w_1600,c_fill,g_center/Fancy_Very_Pink_Oval_C0747_2_copy_i47pyg',
    about: "Las Vegas\u2019s destination for fine and estate diamond jewelry. T-Bird Jewels brings a collector\u2019s eye to an exceptional inventory that includes Bez Ambar designs alongside vintage and rare pieces for the discerning buyer.",
    website: 'https://www.tbirdjewels.com',
    ctaCity: 'Las Vegas',
    locations: [
      {
        street: '1013 South Rampart Boulevard',
        city: 'Las Vegas',
        state: 'NV',
        zip: '89145',
        phone: '(702) 256-3900',
        hours: 'Mon\u2013Sat 10am\u20136pm',
      },
    ],
  },
]

export function getRetailer(slug: string): Retailer | undefined {
  return RETAILERS.find((r) => r.slug === slug)
}

/** Build the Google Maps embed URL from a location */
export function mapEmbedUrl(loc: RetailerLocation): string {
  const q = encodeURIComponent(`${loc.street}, ${loc.city}, ${loc.state} ${loc.zip}`)
  return `https://maps.google.com/maps?q=${q}&output=embed&z=16`
}

/** Build the Google Maps directions URL from a location */
export function directionsUrl(loc: RetailerLocation): string {
  const q = encodeURIComponent(`${loc.street}, ${loc.city}, ${loc.state} ${loc.zip}`)
  return `https://maps.google.com/?q=${q}`
}
