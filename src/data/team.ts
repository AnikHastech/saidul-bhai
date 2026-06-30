// ============================================================
//  Team — the "masthead". Single source of truth shared by the
//  About page team strip and the /team/[slug] detail pages.
// ============================================================

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  img: string;
  location: string;
  /** Year they joined asmaz. */
  since: string;
  /** One-line area of focus. */
  focus: string;
  /** Short hero strapline. */
  tagline: string;
  /** Long-form bio paragraphs. */
  bio: string[];
  /** Pull quote. */
  quote: string;
  /** Skill tags. */
  expertise: string[];
  social: { instagram?: string; x?: string; linkedin?: string };
  /** Featured (open) panel on the About strip. */
  open?: boolean;
}

export const TEAM: TeamMember[] = [
  {
    slug: 'rio-hassan',
    name: 'Rio Hassan',
    role: 'Creative Director',
    img: '/images/mz%20team-01.jpg',
    location: 'New York, US',
    since: '2016',
    focus: 'Brand & art direction',
    tagline: 'Sets the visual standard for every issue, page and product shoot at asmaz.',
    bio: [
      'Rio has shaped the asmaz visual language since the very first shelf went live — from the masthead type to the way a product is lit on the page. The goal has never changed: make the recommendation feel as considered as the product itself.',
      'Before asmaz, Rio art-directed for independent design magazines and a handful of consumer-tech brands, learning that the best editorial design gets out of the reader’s way. Today that instinct runs through every template in the store.',
    ],
    quote: 'Good design is a promise — it tells you the product was made by people who actually cared.',
    expertise: ['Art Direction', 'Editorial Design', 'Photography', 'Brand Systems'],
    social: { instagram: 'https://instagram.com', x: 'https://x.com', linkedin: 'https://linkedin.com' },
    open: true,
  },
  {
    slug: 'mira-khan',
    name: 'Mira Khan',
    role: 'Head of Curation',
    img: '/images/mz%20team-02.jpg',
    location: 'London, UK',
    since: '2017',
    focus: 'Product selection',
    tagline: 'Decides what earns a place on the shelf — and what quietly never does.',
    bio: [
      'Mira runs the room where every product is argued over before it’s listed. If it isn’t something the team would recommend to a friend, it doesn’t make the cut, no matter how big the brand or the margin.',
      'She built the asmaz scoring rubric — durability, repairability, honest value — that keeps the catalogue small and trustworthy on sight.',
    ],
    quote: 'We don’t carry everything. We carry the right things, and we can tell you exactly why.',
    expertise: ['Merchandising', 'Buying', 'Category Strategy', 'Vendor Relations'],
    social: { instagram: 'https://instagram.com', x: 'https://x.com', linkedin: 'https://linkedin.com' },
  },
  {
    slug: 'dev-verma',
    name: 'Dev Verma',
    role: 'Tech Editor',
    img: '/images/mz%20team-03.jpg',
    location: 'Bengaluru, IN',
    since: '2018',
    focus: 'Reviews & testing',
    tagline: 'Opens, charges and lives with every flagship before a single word is written.',
    bio: [
      'Dev leads the test bench. Battery runs, thermal logs, real-world use — the unglamorous work that turns a spec sheet into an honest verdict readers can trust.',
      'He’ll happily tell you when a flagship isn’t worth it, even when asmaz sells it. That independence is the whole point.',
    ],
    quote: 'A spec sheet is a hypothesis. The verdict only comes after you’ve actually lived with the thing.',
    expertise: ['Hardware Testing', 'Benchmarking', 'Long-form Reviews', 'Audio'],
    social: { instagram: 'https://instagram.com', x: 'https://x.com', linkedin: 'https://linkedin.com' },
  },
  {
    slug: 'lena-saito',
    name: 'Lena Saito',
    role: 'Community Lead',
    img: '/images/mz%20team-04.jpg',
    location: 'Tokyo, JP',
    since: '2019',
    focus: 'Community & support',
    tagline: 'Makes sure a real human answers — seven days a week, no scripts.',
    bio: [
      'Lena built the asmaz support culture around a simple idea: the relationship matters more than any single transaction. Returns are handled with no interrogation, and questions get a straight answer.',
      'She also runs the reader community — the buying threads, the trade-in programme, the conversations that decide what gets reviewed next.',
    ],
    quote: 'Support isn’t a cost centre. It’s the most honest conversation we have with the people who trust us.',
    expertise: ['Customer Experience', 'Community', 'Trade-in Program', 'Lifecycle'],
    social: { instagram: 'https://instagram.com', x: 'https://x.com', linkedin: 'https://linkedin.com' },
  },
  {
    slug: 'tom-oyelaran',
    name: 'Tom Oyelaran',
    role: 'Operations',
    img: '/images/mz%20team-05.jpg',
    location: 'Lagos, NG',
    since: '2020',
    focus: 'Logistics & fulfilment',
    tagline: 'Gets the right box to the right door — carbon-neutral, no surprises.',
    bio: [
      'Tom keeps the promise the rest of the team makes. Orders ship carbon-neutral, duties are calculated up front, and packaging is plastic-free and recyclable.',
      'He’s the reason same-day delivery works in a dozen cities, and the reason a return is as painless as the purchase.',
    ],
    quote: 'The fastest way to lose trust is at the doorstep. We obsess over the last mile so you never have to.',
    expertise: ['Logistics', 'Fulfilment', 'Sustainability', 'Last-mile'],
    social: { instagram: 'https://instagram.com', x: 'https://x.com', linkedin: 'https://linkedin.com' },
  },
  {
    slug: 'priya-nandi',
    name: 'Priya Nandi',
    role: 'Photo Editor',
    img: '/images/mz%20team-06.jpg',
    location: 'Mumbai, IN',
    since: '2021',
    focus: 'Studio & imagery',
    tagline: 'Shoots every product the way it deserves to be seen — honestly.',
    bio: [
      'Priya runs the studio. No retouched fantasies — just clean, true-to-life imagery that shows a product as it actually is, scratches and all.',
      'Her lighting kits and templates are why every card in the store looks like it belongs to the same magazine.',
    ],
    quote: 'A photo should sell the truth, not hide it. If the product is good, honesty is the best art direction.',
    expertise: ['Product Photography', 'Studio Lighting', 'Retouching', 'Set Design'],
    social: { instagram: 'https://instagram.com', x: 'https://x.com', linkedin: 'https://linkedin.com' },
  },
];

export function getTeamMember(slug: string): TeamMember | undefined {
  return TEAM.find((m) => m.slug === slug);
}
