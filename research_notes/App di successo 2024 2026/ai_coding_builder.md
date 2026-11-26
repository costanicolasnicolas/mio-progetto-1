# AI coding and vibe-coding / app-builder companies (2024-2026): founders, numbers, growth mechanics

> Method note: research date 2026-11-26. The project's WebFetch domain-allowlist hook (`.claude/hooks/domain_allowlist.py`) blocked full-page fetches of techcrunch.com and wikipedia.org. Every figure below therefore comes from search-engine result extracts of the cited pages, not from a full read of each article. Treat each one as "reported by the cited outlet", not as independently verified. Labels used:
> - **[CO]**: company claim, such as a blog, press release or founder statement
> - **[PRESS]**: press report or estimate from unnamed sources
> - **[EST]**: third-party estimate (Sacra and similar)
> - **[FILING]**: public-company filing or earnings release
>
> ARR in this sector is almost always an annualized run-rate (latest month x 12). It is not audited recognized revenue.

## 1. What each product does, launch/explosion year, founders and background

### Takeaway
Six companies cover three patterns:
- **AI-native IDEs and agents for professional developers:** Cursor/Anysphere and Windsurf/Codeium, the second absorbed by Cognition.
- **Prompt-to-app builders for non-coders:** Lovable, Bolt.new, Base44 and Emergent.
- **A 2016-era platform that found product-market fit with an agent in late 2024:** Replit.

Almost all of them took off between late 2024 and 2025.

### Cited Findings

**Cursor (Anysphere), AI-native code editor, a VS Code fork with agents and its own models**
- Founded 2022 by four MIT classmates: Michael Truell, Sualeh Asif, Arvid Lunnemark and Aman Sanger — [Contrary Research](https://research.contrary.com/company/anysphere); [Business Today interview with Sanger](https://businesstoday.in/latest/trends/story/paranoia-is-daily-life-cursor-cofounder-aman-sanger-on-scaling-silicon-valleys-hottest-ai-coding-startup-503512-2025-11-24)
- One secondary source says Lunnemark left in October 2025. This is uncorroborated — [Contrary Research](https://research.contrary.com/report/cursor)
- Launched its own model, Composer, in October 2025. The Series D money is aimed mainly at research [CO] — [Cursor blog, Series D](https://cursor.com/blog/series-d); [SiliconANGLE](https://siliconangle.com/2025/11/13/nvidia-google-back-2-3b-round-ai-code-editor-startup-cursor/)
- Exit: SpaceX acquired Anysphere in an all-stock deal valued at about $60B, closed 2026-08-14 according to most sources (one says 08-15).
  - Anysphere shares converted into 389,289,254 SpaceX Class A shares.
  - Cursor became a wholly owned subsidiary inside a new "SpaceXAI" unit.
  - Background: in April 2026 SpaceX had taken an option to buy for $60B, or pay $10B for joint work. The merger agreement was signed in June 2026.
  - [PRESS; reportedly based on an 8-K] — [AI Weekly](https://aiweekly.co/alerts/spacex-closes-60b-cursor-deal-folds-it-into-spacexai-unit); [MarketReview](https://www.marketreview.com/news/spacex-cursor-acquisition/); [Tech-Insider](https://tech-insider.org/cursor-60-billion-valuation-anysphere-ai-coding-2026/); [valueaddvc](https://valueaddvc.com/pulse/spacex-cursor-acquisition-closes-2026)
  - Caveat: these are mostly aggregator or blog sources. The primary SEC 8-K was not read. The $60B is the implied equity value of the share consideration, not cash.

**Lovable (Stockholm), prompt-to-full-stack web app builder for non-developers**
- Founded 2023 by Anton Osika and Fabian Hedin. It grew out of GPT Engineer, an open-source command-line app generator (June 2023), and was relaunched as Lovable in late 2024 — [Sacra](https://sacra.com/c/lovable/); [TechCrunch 2025-07-23](https://techcrunch.com/2025/07/23/eight-months-in-swedish-unicorn-lovable-crosses-the-100m-arr-milestone)
- The "8 months to $100M ARR" count starts from the late-2024 relaunch, not from GPT Engineer's 2023 debut — [TechCrunch](https://techcrunch.com/2025/07/23/eight-months-in-swedish-unicorn-lovable-crosses-the-100m-arr-milestone)

**Replit (San Francisco), browser IDE plus "Replit Agent" that builds, debugs, provisions a database and deploys**
- CEO and founder: Amjad Masad. The company is about 9 years old; TechCrunch described it in 2025 as "after nine years of grinding, Replit finally found its market" — [TechCrunch 2025-10-02](https://techcrunch.com/2025/10/02/after-nine-years-of-grinding-replit-finally-found-its-market-can-it-keep-it)
- Replit Agent launched in fall 2024. Masad called it "the first agent-based coding experience in the world" that can "debug it, deploy, provision the database for you" [CO] — [TechCrunch 2025-09-10](https://techcrunch.com/2025/09/10/replit-hits-3b-valuation-on-150m-annualized-revenue)

**Bolt.new (StackBlitz), in-browser prompt-to-app builder on StackBlitz's WebContainers technology**
- CEO: Eric Simons. Before Bolt, StackBlitz's earlier product made less than $1M ARR and was not venture-scaling. The board reportedly gave the company an ultimatum in December 2023. Bolt launched in October 2024 — [Lenny's Newsletter](https://www.lennysnewsletter.com/p/inside-bolt-eric-simons); [Huxiu](https://www.huxiu.com/article/4590545.html); [Latent Space](https://www.latent.space/p/bolt)

**Windsurf (formerly Codeium), AI IDE and autocomplete**
- Founders: CEO Varun Mohan and co-founder Douglas Chen. Both joined Google DeepMind in July 2025 — [TechCrunch 2025-07-11](https://techcrunch.com/2025/07/11/windsurfs-ceo-goes-to-google-openais-acquisition-falls-apart); [DeepLearning.AI The Batch](https://www.deeplearning.ai/the-batch/google-cognition-carve-up-windsurf-after-openais-failed-3b-acquisition-bid/)
- Exit saga:
  - **May 2025:** OpenAI agreed to buy Windsurf for about $3B [PRESS, Bloomberg; never officially confirmed as a price].
  - **July 2025:** the exclusivity expired, which an OpenAI spokesperson confirmed. Reported cause: Microsoft would have gained access to Windsurf IP under its OpenAI contract.
  - **2025-07-11:** Google paid $2.4B for a non-exclusive licence plus hiring Mohan, Chen and top researchers. Google took no equity and no control [PRESS, Bloomberg/The Information; reported as confirmed].
  - **2025-07-14:** Cognition (maker of Devin) acquired the remaining IP, product, brand and roughly 200+ staff for an undisclosed price.
  - Sources: [Fortune 2025-07-11](https://fortune.com/2025/07/11/the-exclusivity-on-openais-3-billion-acquisition-for-coding-startup-windsfurf-has-expired/); [TechCrunch](https://techcrunch.com/2025/07/11/windsurfs-ceo-goes-to-google-openais-acquisition-falls-apart); [ITPro](https://www.itpro.com/software/development/openais-plan-to-acquire-ai-coding-startup-windsurf-ended-in-disaster-heres-how-the-deal-fell-apart); [Bloomberg 2025-07-14](https://www.bloomberg.com/news/articles/2025-07-14/ai-startup-cognition-to-buy-windsurf-after-google-licensing-deal); [Cognition blog](https://cognition.ai/blog/windsurf)
- Cognition said 100% of Windsurf employees would have vesting cliffs waived and fully accelerated vesting [CO] — [Cognition blog](https://cognition.ai/blog/windsurf)
- About three weeks later Cognition laid off 30 Windsurf staff. It offered the roughly 200 remaining staff a buyout worth 9 months' salary, or an intense schedule including weekends [PRESS, The Information via TechCrunch/CNBC] — [Entrepreneur](https://www.entrepreneur.com/business-news/ai-windsurf-take-the-9-month-pay-buyout-or-work-6-days/495554); [Storyboard18](https://www.storyboard18.com/how-it-works/after-acquisition-cognition-hits-reset-at-windsurf-with-layoffs-and-buyout-offers-78311.htm)

**Base44 (Israel), natural-language app builder, acquired by Wix**
- Solo-founded by Maor Shlomo. The company was about 6 months old and bootstrapped when Wix bought it on 2025-06-18 — [TechCrunch 2025-06-18](https://techcrunch.com/2025/06/18/six-month-old-solo-owned-vibe-coder-base44-sells-to-wix-for-80m-cash); [Wix press room](https://www.wix.com/press-room/home/post/wix-further-expands-into-vibe-coding-with-acquisition-of-base44-a-hyper-growth-startup-that-simplif)

**Emergent (India/US, YC), vibe-coding platform aimed at small businesses and everyday entrepreneurs**
- Co-founded by twin brothers Mukund Jha (CEO) and Madhav Jha. A $23M Series A came with the launch announcement in September 2025 [CO] — [BusinessWire 2025-09-24](https://www.businesswire.com/news/home/20250924838488/en/Emergent-Announces-%2423M-Launches-a-Vibe-Coding-Platform-for-Small-Businesses-and-Everyday-Entrepreneurs-Unlocking-Who-Can-Build-and-Sell-Software)
- Note: TechCrunch counts "eight months after launch" up to February 2026, which implies a product launch around June 2025 — [TechCrunch 2026-02-17](https://techcrunch.com/2026/02/17/emergent-hits-100m-arr-eight-months-after-launch-rolls-out-mobile-app)

### Inferences
- The "explosion year" clusters tightly: Bolt (October 2024), Replit Agent (fall 2024), Lovable relaunch (late 2024), Cursor's hypergrowth (2024-2025), then Base44 and Emergent (2025). Better frontier models (Claude 3.5 Sonnet onward) appear to be the common trigger, but this is not confirmed in the sources above.
- Two founder archetypes: young technical founders from elite schools (Cursor, from MIT), and repeat or pivoting founders whose earlier product had stalled (StackBlitz, Replit, Lovable's GPT Engineer).

### Gaps
- Detailed backgrounds (prior employers, education) for Osika, Hedin, Masad, Simons, Shlomo and the Jha twins were not retrieved from a citable page in this session.
- The primary SpaceX 8-K and merger agreement were not read.
- Cognition's price for Windsurf was never disclosed.

## 2. Verified numbers: ARR/revenue, valuation, rounds, acquisition prices, users (with dates)

### Takeaway
The headline figures are well documented in company announcements and major press:
- **Cursor:** over $1B ARR (November 2025), $29.3B valuation, then a roughly $60B stock exit (August 2026).
- **Lovable:** $500M ARR (June 2026), $13.3B valuation.
- **Replit:** $150M ARR (September 2025), $9B valuation (March 2026).
- **Base44:** bought for $80M cash, now about $250M ARR under Wix.
- **Emergent:** $100M ARR, $1.5B valuation.
- **Bolt:** $40M ARR, $700M valuation.

Nearly all ARR figures are unaudited company claims. The only public-company disclosure is Wix's reporting on Base44.

### Cited Findings

**Cursor / Anysphere**
- **2025-06-05/06:** $900M Series C at a $9.9B valuation, led by Thrive. ARR above $500M; used by more than half of the Fortune 500 [CO] — [Cursor blog Series C](https://cursor.com/blog/series-c); [Bloomberg](https://www.bloomberg.com/news/articles/2025-06-05/anysphere-hailed-as-fastest-growing-startup-ever-raises-900-million)
- **2025-11-13:** $2.3B Series D at a $29.3B post-money valuation, led by Accel and Coatue with Google, Nvidia, Thrive, a16z and DST. Annualized revenue above $1B; enterprise revenue up about 100x in 2025 year to date [CO] — [Cursor blog Series D](https://cursor.com/blog/series-d); [Bloomberg](https://www.bloomberg.com/news/articles/2025-11-13/ai-startup-cursor-raises-funds-at-29-3-billion-value-wsj-says); [BusinessWire](https://www.businesswire.com/news/home/20251113939996/en)
- **February 2026:** $2B ARR [PRESS/secondary] — [Let's Data Science](https://letsdatascience.com/blog/cursor-2-billion-funding-round-50-billion-valuation)
- **May 2026:** conflicting figures of $3B ARR (Wikipedia, as summarized by search) and $4B ARR [EST] — [valueaddvc](https://valueaddvc.com/company/cursor). Treat both as unconfirmed.
- **April 2026:** talks to raise at least $2B at about $50B [PRESS] — [The Next Web](https://thenextweb.com/news/cursor-anysphere-2-billion-funding-50-billion-valuation-ai-coding). One source says this round never closed — [teahose](https://www.teahose.com/guides/cursor-valuation)
- **2026-08-14:** acquired by SpaceX for about $60B in stock [PRESS] (see Section 1)

**Lovable**
- **July 2025:** $100M ARR about 8 months after relaunch [CO] — [TechCrunch 2025-07-23](https://techcrunch.com/2025/07/23/eight-months-in-swedish-unicorn-lovable-crosses-the-100m-arr-milestone); [Tech.eu](https://tech.eu/2025/07/23/lovable-becomes-fastest-software-company-ever-to-reach-100m-arr/)
- **November 2025:** $200M ARR [CO via Bloomberg]; nearly 8M users [CO] — [TechCrunch 2025-11-10](https://techcrunch.com/2025/11/10/lovable-says-its-nearing-8-million-users-as-the-year-old-ai-coding-startup-eyes-more-corporate-employees)
- **December 2025:** $330M Series B at a $6.6B valuation, led by CapitalG and Menlo — [SaaSRise](https://www.saasrise.com/deals/lovable-raises-330m-series-b-led-by-capitalg-and-menlo-ventures-valuation-north-of-6b-96b49a9c-0458-4df5-acf8-e70ff6ff3b5b). One aggregator wrongly dates it to June 2026.
- **ARR milestones [CO]:** $300M in January 2026; $400M in February 2026, adding $100M of ARR in a single month — [TechCrunch 2026-03-11](https://techcrunch.com/2026/03/11/lovable-says-it-added-100m-in-revenue-last-month-alone-with-just-146-employees/)
- **June 2026:** $500M ARR [CO] — [TechCrunch 2026-08-12](https://techcrunch.com/2026/08/12/lovable-confirms-new-13-3b-valuation-raises-another-400m/)
- **2026-08-12:** $400M Series C at a $13.3B valuation, led by Menlo Ventures and the Scaleup Europe Fund [CO, confirmed to TechCrunch] — [TechCrunch](https://techcrunch.com/2026/08/12/lovable-confirms-new-13-3b-valuation-raises-another-400m/)
- **About 2026-09-24:** above $600M ARR, attributed to co-founder Hedin speaking at a conference [secondary; weaker] — [valueaddvc](https://valueaddvc.com/blog/lovable-vibe-coding-app-builder-company-deep-dive)

**Replit**
- **Revenue jump:** annualized revenue rose from $2.8M to $150M in under a year [CO] — [TechCrunch 2025-09-10](https://techcrunch.com/2025/09/10/replit-hits-3b-valuation-on-150m-annualized-revenue)
- **2025-09-10:** $250M Series C at a $3B valuation [CO] — [TechCrunch](https://techcrunch.com/2025/09/10/replit-hits-3b-valuation-on-150m-annualized-revenue); [Replit press release via Newswire](https://www.newswire.ca/news-releases/replit-closes-250-million-in-funding-to-build-on-customer-momentum-842902687.html)
- **2026-03-11:** $400M Series D at a $9B post-money valuation, led by Georgian — [Trending Topics](https://www.trendingtopics.eu/replit-raises-400m-tripling-its-valuation-to-9-billion-in-six-months/); [AI Magazine](https://aimagazine.com/news/replit-ai-agents-vibe-coding-and-a-us-9bn-valuation)
- **ARR estimates:**
  - About $300M at end-2025 and about $525M in April 2026 [EST] — [Sacra](https://sacra.com/c/replit/)
  - About $500M as of September 2026 [EST] — [Specter](https://www.tryspecter.com/revenue-valuation/replit)
  - The $1B ARR "by end-2026" is a company target, not an achieved figure — [TechBuzz](https://www.techbuzz.ai/articles/replit-hits-9b-valuation-eyes-1b-arr-in-monster-round)
- **Total raised:** sources conflict, citing $650M+, $880M (CNBC) and $922M — [Specter](https://www.tryspecter.com/revenue-valuation/replit)

**Bolt.new / StackBlitz**
- **Early ARR:** about $4M in the first 4 weeks; $20M in about 60 days with roughly 15 people [CO, Simons talk] — [AI Engineer World's Fair](https://ai.engineer/talks/bolt-new-how-we-scaled-0-20m-arr-in-60-days-with-15-people); [Sacra](https://sacra.com/c/bolt-new/)
- **About March 2025:** $40M ARR within about 5 months, with fewer than 20 people [CO/EST] — [Lenny's Newsletter](https://www.lennysnewsletter.com/p/inside-bolt-eric-simons); [Sacra](https://sacra.com/research/bolt-new)
- **Users, early 2025:** more than 3M registered and more than 1M monthly active [EST]. Later "5M users" figures conflict on date — [Sacra](https://sacra.com/c/bolt-new/)
- **January 2025:** Series B of about $105.5M at a $700M valuation, led by Emergence and GV [PRESS, Bloomberg/CEO] — [Bloomberg 2025-01-21](https://www.bloomberg.com/news/articles/2025-01-21/ai-speech-to-code-startup-stackblitz-is-in-talks-for-a-700-million-valuation)
- **2026:** no confirmed revenue or valuation figures found — [Enterprise DNA](https://enterprisedna.co/resources/ai-map/company/stackblitz)

**Windsurf / Codeium → Cognition**
- **Prices:** OpenAI's bid about $3B [PRESS]; Google's licence plus hires $2.4B [PRESS, reported confirmed]; Cognition's price undisclosed (see Section 1)
- **September 2025:** Cognition raised more than $400M at a $10.2B valuation. Scott Wu: "Our acquisition of Windsurf more than doubled our ARR." Combined enterprise ARR was up more than 30% in the 7 weeks after the deal [CO] — [SiliconANGLE 2025-09-08](https://siliconangle.com/2025/09/08/ai-coding-startup-cognition-raises-400m-10-2b-valuation/); [VentureBeat](https://venturebeat.com/programming-development/cognition-follows-windsurf-acquisition-with-usd400m-fundraise-showing-strong); [Cognition blog](https://cognition.ai/blog/funding-growth-and-the-next-frontier-of-ai-coding-agents)
- **Devin ARR:** $1M in September 2024 to $73M in June 2025 [CO/EST] — [Sacra](https://sacra.com/c/cognition)
- **2026-05-27:** more than $1B raised at a $26B valuation; run-rate grew from $37M (May 2025) to $492M [CO] — [SiliconANGLE](https://siliconangle.com/2026/05/27/vibe-coding-startup-cognition-doubles-valuation-new-1b-round/); [The Next Web](https://thenextweb.com/news/cognition-just-raised-1-billion-at-a-26-billion-valuation-and-90-of-its-own-code-is-written-by-its-ai)
- **September 2026:** more than $2B raised at a $48B valuation; run-rate about $900M [CO/PRESS] — [The Next Web](https://thenextweb.com/news/cognition-series-e-48bn-flat-multiple)
- Windsurf's own standalone ARR at the time of the 2025 deals was not found in a citable result (see Gaps)

**Base44 → Wix**
- **2025-06-18 deal:** about $80M in cash plus earn-outs through 2029 [FILING/CO] — [Wix press room](https://www.wix.com/press-room/home/post/wix-further-expands-into-vibe-coding-with-acquisition-of-base44-a-hyper-growth-startup-that-simplif); [Nasdaq press release](https://www.nasdaq.com/press-release/wix-further-expands-vibe-coding-acquisition-base44-hyper-growth-startup-simplifies)
  - $25M of the price went to employees as a retention bonus.
  - At sale: more than 100,000 users in its first months, and partnerships with eToro and Similarweb — [Globes](https://en.globes.co.il/en/article-1001513267); [SiliconANGLE](https://siliconangle.com/2025/06/18/base44-joins-wix-80m-deal-support-natural-language-software-development)
- **ARR under Wix [FILING]:** about $100M (Q4 2025 report, early March 2026); $150M (mid-May 2026, Q1 report); close to $250M (Q3 2026 report, 2026-11-10) — [Wix Q3 2026 results](https://www.wix.com/press-room/home/post/wix-reports-third-quarter-2026-results); [Wix Q4/FY2025 results](https://www.wix.com/press-room/home/post/wix-reports-fourth-quarter-and-full-year-2025-results); [24/7 Wall St](https://247wallst.com/cards/wix-q3-2026-earnings-wix-01m72jzf2wx07zns419hjb9zx6)
- **Unit economics [FILING]:** Base44's non-GAAP gross margin was 58% in Q3 2026, up from near zero in Q1, with a target above 60% at year-end. Annual plans are more than 20% of the newest cohort, up from about 5%. Wix total ARR is $2.021B (+15% year on year) — [24/7 Wall St](https://247wallst.com/cards/wix-q3-2026-earnings-wix-01m72jzf2wx07zns419hjb9zx6); [FourWeekMBA](https://fourweekmba.com/ai-wixs-base44-nears-250m-arr-as-free-cash-flow-falls-41/)

**Emergent**
- **September 2025:** more than $15M ARR within 90 days of launch; $23M Series A [CO] — [BusinessWire](https://www.businesswire.com/news/home/20250924838488/en/Emergent-Announces-%2423M-Launches-a-Vibe-Coding-Platform-for-Small-Businesses-and-Everyday-Entrepreneurs-Unlocking-Who-Can-Build-and-Sell-Software)
- **2026-01-20:** $70M Series B led by Khosla and SoftBank Vision Fund 2 at about a $300M valuation, triple the previous one. Claimed $50M ARR and more than 5M users in 190+ countries [CO/PRESS] — [BusinessWire](https://www.businesswire.com/news/home/20260120852493/en); [SiliconANGLE](https://siliconangle.com/2026/01/20/vibe-coding-startup-emergent-triples-valuation-70m-funding-round/)
- **2026-02-17:** $100M ARR about 8 months after launch [CO]. Sacra separately estimates about $25M in December 2025 to $100M in February 2026 [EST] — [TechCrunch](https://techcrunch.com/2026/02/17/emergent-hits-100m-arr-eight-months-after-launch-rolls-out-mobile-app); [Sacra](https://sacra.com/c/emergent)
- **2026-07-15:** $130M Series C at a $1.5B valuation. More than 12M apps built, and 70% of users have no coding experience [CO] — [SiliconANGLE](https://siliconangle.com/2026/07/15/emergent-emerges-latest-ai-unicorn-raising-130m-funding/); [The Next Web](https://thenextweb.com/news/emergent-130m-series-c-vibe-coding-unicorn)

### Inferences
- **Founder wealth:**
  - The largest documented liquidity events are Cursor, with a roughly $60B SpaceX stock deal split among four co-founders and investors, and Windsurf's $2.4B Google licence, which reportedly included multi-year pay packages for the hired team.
  - Base44 is the clearest "solo founder gets rich fast" case: $80M in cash after about 6 months, with Shlomo as sole owner. $25M of the $80M went to staff, so the founder's share is at most about $55M plus earn-outs. This is an inference; his actual take was not disclosed.
  - Lovable, Replit and Emergent founders are rich on paper only (private valuations). No liquidity is documented.
- **Base44 as an acquisition:** $80M bought an asset that reached about $250M ARR within about 17 months, per Wix's own filings.
- **Valuation multiples:** roughly 25-30x run-rate in the 2025-2026 rounds (Lovable about $13.3B on $500M; Cursor $29.3B on more than $1B; Replit $9B on about $300-500M).

### Gaps
- Windsurf's standalone ARR at the time of the OpenAI, Google and Cognition events. An "$82M ARR" figure circulates but did not surface in a citable search result.
- Cursor's ARR after February 2026: the $3B and $4B figures are unconfirmed.
- Exact Bolt figures for 2025-2026, after the $40M ARR milestone.
- Personal net-worth figures (Forbes/Bloomberg billionaire lists) for any of these founders were not retrieved.

## 3. What worked: growth mechanism, revenue model, speed to revenue

### Takeaway
Every winner was product-led with near-zero paid acquisition at the start, monetized through freemium credit or usage subscriptions from day one, and spread by social virality: people sharing apps they built on X/LinkedIn, plus developer word of mouth. Speed to $100M ARR fell from years to 8 months (Lovable, Emergent).

### Cited Findings
- **Bolt:** speed to revenue was $0 to about $4M ARR in 4 weeks and $20M in about 60 days. It ran on a pre-existing in-browser runtime (WebContainers), so Bolt was a thin layer that shipped quickly [CO] — [AI Engineer](https://ai.engineer/orgs/bolt-new-stackblitz); [Evil Martians case study](https://evilmartians.com/chronicles/bolt-new-from-stackblitz-how-they-surfed-the-ai-wave-with-no-wipeouts)
- **Lovable:** described as the fastest software company ever to reach $100M ARR, ahead of OpenAI, Cursor and Wiz [CO/PRESS] — [The Next Web 2025-07-24](https://thenextweb.com/news/vibe-coding-platform-lovable-becomes-historys-fastest-growing-software-startup); [Tech.eu](https://tech.eu/2025/07/23/lovable-becomes-fastest-software-company-ever-to-reach-100m-arr/)
  - It later pushed into corporate and enterprise customers — [TechCrunch 2025-11-10](https://techcrunch.com/2025/11/10/lovable-says-its-nearing-8-million-users-as-the-year-old-ai-coding-startup-eyes-more-corporate-employees); [Fortune 2025-11-21](https://fortune.com/2025/11/21/lovables-ceo-ai-vibe-coding-enterprise-ambitions-annual-revenue/)
- **Cursor:** ARR reportedly doubled about every 2 months in early 2025 [PRESS] — [Unite.AI via search](https://www.unite.ai/?p=276420)
  - Bottom-up adoption by individual developers turned into enterprise contracts: more than half of the Fortune 500 by June 2025, and enterprise revenue up about 100x in 2025 [CO] — [Cursor Series C](https://cursor.com/blog/series-c); [Cursor Series D](https://cursor.com/blog/series-d)
- **Replit:** bet the company on Agent for non-engineers. Enterprise deals then arrived through employees who used it [PRESS] — [TechCrunch 2025-10-02](https://techcrunch.com/2025/10/02/after-nine-years-of-grinding-replit-finally-found-its-market-can-it-keep-it)
- **Base44:** distribution and scale were the stated reasons for selling. Shlomo said Wix was "probably the only company that can help them scale and distribute globally" [CO] — [Globes](https://en.globes.co.il/en/article-1001513267)
  - Under Wix the playbook is heavy sales and marketing reinvestment, rising annual-plan share and improving cohort retention [FILING] — [24/7 Wall St](https://247wallst.com/cards/wix-q3-2026-earnings-wix-01m72jzf2wx07zns419hjb9zx6)
- **Revenue model and margin pressure:** these products resell LLM inference, so gross margin is the weak point. Base44 went from near-zero non-GAAP gross margin in Q1 2026 to 58% in Q3 2026. Wix also prepaid GPUs, a roughly $10M working-capital hit in Q4 [FILING] — [24/7 Wall St](https://247wallst.com/cards/wix-q3-2026-earnings-wix-01m72jzf2wx07zns419hjb9zx6)
  - Cursor built its own Composer model partly to reduce dependence on third-party models [CO] — [Cursor Series D](https://cursor.com/blog/series-d)
  - One single low-profile source claims OpenAI would stop supplying models to Cursor after the SpaceX deal. Unverified; do not use without confirmation — [Tech-Insider](https://tech-insider.org/cursor-60-billion-valuation-anysphere-ai-coding-2026/)
- **Emergent:** targets small businesses and everyday entrepreneurs, pitching "monetizable software". It launched a mobile app at $100M ARR [CO] — [BusinessWire 2026-01-20](https://www.businesswire.com/news/home/20260120852493/en/Emergent-Raises-$70M-from-Khosla-Ventures-and-SoftBank-Vision-Fund-2-to-Enable-Anyone-to-Turn-Ideas-into-Monetizable-Software); [TechCrunch](https://techcrunch.com/2026/02/17/emergent-hits-100m-arr-eight-months-after-launch-rolls-out-mobile-app)

### Inferences
- The repeatable recipe:
  1. Ride a step-change in model capability.
  2. Make the "wow" visible in under a minute, because a working app from one prompt is inherently shareable.
  3. Charge a monthly subscription with credit or usage limits from day one.
  4. Move upmarket to teams and enterprise once bottom-up usage exists.
- Fast-but-shallow ARR is a risk. Annual-plan share was only about 5% a year earlier at Base44, and secondary sources flag retention questions for consumer vibe-coding tools. Monthly-plan-heavy run-rates may churn.

### Gaps
- Exact pricing tiers (for example $20/month Pro plans and credit systems) were not retrieved from citable pages this session.
- Churn and retention data are unavailable, except for Wix's qualitative statements on Base44.

## 4. Which incumbents or categories they beat or disrupted

### Takeaway
- **Professional developers:** Cursor took share and mindshare from GitHub Copilot, which was first to market and Microsoft-backed, and it forced Copilot toward agents and usage pricing.
- **Non-coders:** Lovable, Bolt, Base44 and Emergent attack website and no-code builders (Wix itself chose to buy rather than compete) and the low end of freelance development work on Fiverr and Upwork.

### Cited Findings
- **GitHub Copilot:** 20M all-time users as of July 2025. This is cumulative and includes the free tier [CO, Microsoft] — [TechCrunch 2025-07-30](https://techcrunch.com/2025/07/30/github-copilot-crosses-20-million-all-time-users/); [Dataconomy](https://dataconomy.com/2025/07/31/github-copilot-now-has-over-20-million-users/)
  - 2026 commentary describes Microsoft as "slipping" in AI coding against Cursor and Claude Code. GitHub moved to usage-based billing, and some enterprises (for example NinjaOne) reportedly moved engineers to Claude Code over pricing [opinion/commentary] — [Michael Parekh Substack](https://michaelparekh.substack.com/p/ai-microsoft-slipping-in-ai-coding); [Microsoft 4QFY26 commentary](https://nikhs.substack.com/p/microsoft-4qfy26-earnings-the-efficient)
- **Wix's defensive acquisition:** Wix, the incumbent website builder, bought Base44 rather than lose the category. By Q3 2026 Base44 was about 12% of Wix's total ARR [FILING; the 12% is an outlet's calculation] — [24/7 Wall St](https://247wallst.com/cards/wix-q3-2026-earnings-wix-01m72jzf2wx07zns419hjb9zx6); [TechRadar](https://techradar.com/pro/website-building/wix-jumps-on-the-vibe-coding-bandwagon-with-a-new-acquisition)
- **Freelance platforms:**
  - Upwork's mid-2025 study found AI job substitution "real, but narrow" — [Axios 2025-06-30](https://www.axios.com/2025/06/30/ai-job-vibe-coding-upwork)
  - Fiverr repositioned with a vibe-coding services campaign: humans finish what non-coders start with AI — [Fiverr press](https://www.fiverr.com/news/vibe-coding-brand-campaign-2025)
  - As of September 2026, Fiverr shares were down 61% and Upwork down 47% over the past year. The effect is framed as fewer tasks and lower incomes rather than measured job losses — [Irish Times 2026-09-18](https://www.irishtimes.com/business/work/2026/09/18/the-gig-economy-faces-its-ai-apocalypse/)
- **Cursor vs. Windsurf:** in the head-to-head between AI IDEs, Windsurf was the runner-up that got carved up, with OpenAI's bid failing and Google and Cognition splitting it — [DeepLearning.AI The Batch](https://www.deeplearning.ai/the-batch/google-cognition-carve-up-windsurf-after-openais-failed-3b-acquisition-bid/)

### Inferences
- **Who is exposed:** small web and dev agencies and freelance developers who build MVPs, internal tools and landing pages, plus no-code tools such as Bubble, Webflow and Glide. The sourced evidence covers freelance markets and Wix; nothing citable was found on Bubble or Webflow specifically.
- **Why the stock moves are only suggestive:** the Fiverr/Upwork share-price declines coincide with vibe-coding growth, but the sources do not establish causation.

### Gaps
- No citable 2026 market-share data for Cursor vs Copilot vs Claude Code.
- No data on Bubble, Webflow or traditional agency revenue impact.

## 5. Team size at key revenue milestones

### Takeaway
These are among the leanest revenue ramps in software history:
- Bolt: about 15 people at $20M ARR
- Lovable: 45 at $100M and 146 at $400M
- Base44: 6-8 people at sale
- Cursor: a few hundred people at $1-2B ARR

### Cited Findings
- **Bolt.new:** about 15 people at $20M ARR in about 60 days; fewer than 20 at $40M ARR in about 5 months [CO] — [AI Engineer talk](https://ai.engineer/talks/bolt-new-how-we-scaled-0-20m-arr-in-60-days-with-15-people); [Lenny's Newsletter](https://www.lennysnewsletter.com/p/inside-bolt-eric-simons)
- **Lovable:** 45 full-time employees at $100M ARR (July 2025) — [TechCrunch 2025-07-23](https://techcrunch.com/2025/07/23/eight-months-in-swedish-unicorn-lovable-crosses-the-100m-arr-milestone). 146 employees at $400M ARR (February/March 2026), about $2.7M ARR per employee [CO, CRO] — [TechCrunch 2026-03-11](https://techcrunch.com/2026/03/11/lovable-says-it-added-100m-in-revenue-last-month-alone-with-just-146-employees/)
- **Base44:** a solo founder plus 6 employees (Globes) or 8 (TechCrunch) at the $80M sale — [Globes](https://en.globes.co.il/en/article-1001513267); [TechCrunch](https://techcrunch.com/2025/06/18/six-month-old-solo-owned-vibe-coder-base44-sells-to-wix-for-80m-cash)
- **Cursor:** grew from 4 to 40+ people during 2024 [single secondary source] — [Taskade blog](https://www.taskade.com/blog/anysphere-cursor-history.md)
  - Later estimates conflict: about 150 at $2B ARR, about 245 in December 2025, and "300+" [secondary; unreliable] — [DEV Community](https://dev.to/andrew-ooo/cursor-hits-2b-arr-with-150-employees-thats-133-million-per-person-237n); [DEV Community](https://dev.to/andrew-ooo/how-cursor-became-the-fastest-b2b-company-to-1b-arr-with-just-300-employees-34na); [Latka](https://getlatka.com/companies/cursor.com/team)
- **Replit:** earlier peaked at 130 employees, more than revenue could sustain, and laid off about half before the Agent breakout [PRESS] — [TechCrunch 2025-10-02](https://techcrunch.com/2025/10/02/after-nine-years-of-grinding-replit-finally-found-its-market-can-it-keep-it)
- **Windsurf:** about 200+ employees remained after the Google hires, when Cognition took over (July/August 2025) — [Entrepreneur](https://www.entrepreneur.com/business-news/ai-windsurf-take-the-9-month-pay-buyout-or-work-6-days/495554)
- **Cognition:** says about 90% of its own code is written by its AI [CO] — [The Next Web](https://thenextweb.com/news/cognition-just-raised-1-billion-at-a-26-billion-valuation-and-90-of-its-own-code-is-written-by-its-ai)

### Inferences
- Revenue per employee of $1-3M+ ARR is common in this cohort, against roughly $0.2-0.4M for typical SaaS. That typical-SaaS benchmark is general knowledge, not sourced here.
- The lean model works because inference providers carry the R&D burden and product-led growth replaces sales teams early on.

### Gaps
- Cursor's exact headcount at $100M, $500M and $1B ARR (no primary source found).
- Replit, Emergent and Bolt headcount in 2026.
