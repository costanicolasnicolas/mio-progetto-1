# Known (San Francisco, voice-AI matchmaker): full product system and user flow

**Method note (important for the report writer).** The repository's domain-allowlist hook blocked WebFetch on every non-catalogue domain tried (techcrunch.com, sfist.com, apps.apple.com). So every finding below comes from **WebSearch result extracts** (the search engine's summary of the page), not from full pages read directly. Treat quotes as close paraphrases. Known's own website, privacy policy, terms and FAQ were **not** found or read. Labels used: **[COMPANY]** = claim by Known, its founders or its App Store listing; **[INDEPENDENT]** = a journalist or third party describing the product; **[THIRD-PARTY/COMMERCIAL]** = a review site with its own commercial interest (e.g. Social Catfish sells identity checks). Research date: 2026-11-26.

## 1. Company basics, registration and eligibility

### Takeaway
Known was founded by Stanford dropouts Celeste Amadon (CEO) and Asher Allen. It launched publicly in San Francisco in February 2026 after a beta in late 2025, has about $9.7-10M in funding, and was reported as Bay Area-only for most of 2026. Eligibility is reportedly 21+. I found no documentation of ID, selfie or phone verification, or of a formal waitlist.

### Cited Findings
- Founders Celeste Amadon (CEO) and Asher Allen. Launched in San Francisco in February 2026. About $10M raised from Coelius Capital, Forerunner Ventures and NFX (per PitchBook) [INDEPENDENT] — [SFist, May 2026](https://sfist.com/2026/05/06/new-ai-dating-app-out-of-sf-says-half-its-matches-say-yes-to-real-dates/)
- Both founders are 22 and Stanford dropouts. One source reports the round as $9.7M from Forerunner, NFX and Pear [INDEPENDENT] — [KTVU](https://www.ktvu.com/news/2-stanford-dropouts-raise-10m-change-app-dating-world); [Bitcoinworld (TechCrunch rewrite)](https://bitcoinworld.co.in/voice-ai-dating-app-known-funding/)
- Forerunner Ventures led a $9.7M round [INDEPENDENT] — [Forbes, 11 Jul 2026](https://www.forbes.com/sites/sofiachierchio/2026/07/11/these-gen-z-founders-are-reinventing-dating-apps-without-the-swipe/)
- TechCrunch covered the beta in December 2025 [INDEPENDENT] — [TechCrunch, 19 Dec 2025](https://techcrunch.com/2025/12/19/known-uses-voice-ai-to-help-you-go-on-more-in-person-dates)
- Origin: the founders first built an AI app that booked restaurants for dates. They pivoted after users stayed on the voice onboarding far longer than expected [INDEPENDENT] — [TechCrunch](https://techcrunch.com/2025/12/19/known-uses-voice-ai-to-help-you-go-on-more-in-person-dates/); [TableTransfers analysis](https://tabletransfers.com/blog/posts/known-pivoted-from-ai-books-your-date-a-restaurant-to-ai-onboards-you-for-dating-and-it-sa/)
- Age and audience: users aged 21+, average age about 27, focus on serious relationships rather than hookups. **Caution:** this came from a search extract that merged several pages (App Store listing, AI Learning Guides and others), so the exact originating page is not confirmed — [AI Learning Guides](https://ailearningguides.com/known-ai-dating-app-voice-matchmaker/)
- Geography: as of 2026, Bay Area only; not available elsewhere in the US or internationally; Southern California expansion said to be planned for later in 2026; users outside the Bay Area are "likely on a waitlist." The waitlist point is a blog inference, not a company statement — search extract drawing on [Laterstack](https://laterstack.com/known-voice-ai-dating-startup/) and [Anketta blog](https://anketta.app/blog/known-sonder-ditto-ai-dating-2026)
- Korea Daily also describes the app as limited to the San Francisco area [INDEPENDENT] — [Korea Daily](https://en.koreadaily.com/ai-dating-app/)
- One aggregator headline says "San Francisco and New York," but no other source confirms a New York launch — [News Minimalist](https://www.newsminimalist.com/articles/known-app-uses-ai-voice-interviews-to-find-compatible-matches-in-san-francisco-and-new-york-ef5da5e8)
- App Store: listing id6748926392 ("Known: AI Matchmaking / Swipeless Dating App"; titles vary across snapshots). The listing mentions "vouching" by friends and "updating your photos." The extracts showed **no** selfie or ID verification [COMPANY] — [App Store](https://apps.apple.com/us/app/known-swipeless-dating-app/id6748926392)

### Inferences
- Registration is probably: download the iOS app, create an account, check location (Bay Area) and age (21+), then go straight into the voice interview. This is not documented step by step.
- With no verification documented, safety relies mainly on the $15 commitment fee and on friend vouching.

### Gaps
- Not documented: whether there is formal ID, selfie or phone verification; how the waitlist works; whether there is an Android version; how location is checked.
- The New York presence is unconfirmed, and so is the status of any Southern California expansion as of November 2026.

## 2. The AI voice interview

### Takeaway
Onboarding is a spoken conversation with an AI matchmaker ("a voice call, not a form") about personality, values and what the user wants. It averages about 26 minutes per the company, with conflicting figures elsewhere. The questions were reportedly designed with a group of psychologists. No persona name, text alternative or redo policy was found.

### Cited Findings
- Users onboard through a spoken interview about who they are, what they want and their values. A group of psychologists helped design the questions. Average session is 26 minutes [COMPANY via INDEPENDENT] — [SFist](https://sfist.com/2026/05/06/new-ai-dating-app-out-of-sf-says-half-its-matches-say-yes-to-real-dates/); [Global Dating Insights](https://www.globaldatinginsights.com/featured/known-raises-on-voice-ai-to-push-dating-back-offline/)
- App Store wording (paraphrased in the extract): "A voice call, not a form. Most members spend about 26 minutes on the call. Known writes your profile for you and keeps it current as it learns more" [COMPANY] — [App Store](https://apps.apple.com/us/app/known-swipeless-dating-app/id6748926392)
- Reported lengths conflict: about 30 minutes, with the AI matchmaker "calling" users ([Korea Daily](https://en.koreadaily.com/ai-dating-app/)); 26 minutes ([Social Catfish](https://socialcatfish.com/scamfish/known-dating-app-review/)); 15 minutes (LA Times as republished, per search extract); one user's onboarding reportedly lasted 1 hour 38 minutes (search extract; originating page uncertain, possibly [Laterstack](https://laterstack.com/known-voice-ai-dating-startup/) or [TechCrunch](https://techcrunch.com/2025/12/19/known-uses-voice-ai-to-help-you-go-on-more-in-person-dates/))
- What is analysed: one report says the AI looks not only at answers but at hesitations, intonation and laughter ([Korea Daily](https://en.koreadaily.com/ai-dating-app/)). Another source mentions "voice-derived signals including communication style, tone, and expressed preferences." A later search could not reconfirm the hesitation and laughter detail, so treat it as single-source.
- Rationale: the founders say spoken answers are more authentic and less edited than typed ones [COMPANY] — [Korea Daily](https://en.koreadaily.com/ai-dating-app/)
- Critic's view: the voice intake is "essentially eHarmony's 29-dimension questionnaire with a ChatGPT wrapper" [INDEPENDENT/OPINION] — [Dating Industry Insights](https://www.datingindustryinsights.com/news/dating-startups-curated-matchmaking-trend)
- An App Store reviewer complained that the AI interview missed details. The developer replied that accuracy feedback helps improve the product — search extract of the [App Store](https://apps.apple.com/us/app/known-swipeless-dating-app/id6748926392) reviews

### Inferences
- "Keeps it current as it learns more" suggests the profile is updated after later conversations and feedback, not fixed after one interview. Whether users can explicitly redo the interview is not documented.

### Gaps
- No public list of the actual questions.
- Not found: the AI matchmaker's name or persona, a text alternative, a redo option, or how follow-up questions work.

## 3. Profile: what is generated, photos, what the user sees

### Takeaway
There is no self-written profile and no browsing. Known writes the profile from the interview. Photos are hidden during matching and revealed only once the AI makes an introduction (some sources say only after both accept). How compatibility is explained to users is not documented.

### Cited Findings
- No profiles, no swiping, no in-app chat [INDEPENDENT] — [Axios, 14 May 2026](https://axios.com/2026/05/14/ai-matchmaker-online-dating-tech); [SFist](https://sfist.com/2026/05/06/new-ai-dating-app-out-of-sf-says-half-its-matches-say-yes-to-real-dates/)
- Known writes the profile for the user [COMPANY] — [App Store](https://apps.apple.com/us/app/known-swipeless-dating-app/id6748926392)
- Photos are hidden until the AI makes an introduction [INDEPENDENT] — search extract attributed to [Global Dating Insights](https://www.globaldatinginsights.com/featured/ai-voice-based-dating-app-known-raises-10-million/) / [KTVU](https://www.ktvu.com/news/2-stanford-dropouts-raise-10m-change-app-dating-world)
- No photo upload or profile form at onboarding; photos stay hidden during matching; the photo reveal is the first point at which a reverse image search is possible. The site also says photos are seen only after the AI introduction and both parties' acceptance [THIRD-PARTY/COMMERCIAL] — [Social Catfish](https://socialcatfish.com/scamfish/known-dating-app-review/)
- The App Store listing mentions "updating your photos" and friend vouching, so photos are uploaded at some point [COMPANY] — [App Store](https://apps.apple.com/us/app/known-swipeless-dating-app/id6748926392)

### Inferences
- Photos are probably uploaded after or alongside the interview and shown at the moment of introduction. Sources differ on whether that moment comes before or after acceptance.

### Gaps
- Not documented: exactly when photos are uploaded, what text the match card shows, and whether a "why you match" explanation is shown.

## 4. Matching mechanics

### Takeaway
Known sends one introduction at a time, with a 24-hour window to accept the introduction and agree to a date. If either person passes, the introduction closes and Known starts on the next one. Weekly volume is not published.

### Cited Findings
- One introduction at a time. If either person passes, the introduction closes and Known starts on the next [COMPANY] — [App Store](https://apps.apple.com/us/app/known-swipeless-dating-app/id6748926392)
- 24-hour windows to accept introductions and agree to dates [INDEPENDENT] — [Global Dating Insights](https://www.globaldatinginsights.com/featured/ai-voice-based-dating-app-known-raises-10-million/); [Korea Daily](https://en.koreadaily.com/ai-dating-app/)
- After a match, both people have 24 hours to agree to a date [THIRD-PARTY/COMMERCIAL] — [Social Catfish](https://socialcatfish.com/scamfish/known-dating-app-review/)
- "A limited window to accept a match and agree to meet in person" [INDEPENDENT] — [NBC Bay Area](https://www.nbcbayarea.com/news/local/stanford-known-dating-app-ai/4091043/)
- Introductions are made by a "proprietary algorithm" after the interviews [INDEPENDENT] — [Axios](https://axios.com/2026/05/14/ai-matchmaker-online-dating-tech)
- Acceptance claims, which conflict: 50% of proposed dates accepted so far ([SFist](https://sfist.com/2026/05/06/new-ai-dating-app-out-of-sf-says-half-its-matches-say-yes-to-real-dates/), CEO claim); 80% of introductions led to an in-person date "in early testing" ([App Store](https://apps.apple.com/us/app/known-swipeless-dating-app/id6748926392), [Forbes](https://www.forbes.com/sites/sofiachierchio/2026/07/11/these-gen-z-founders-are-reinventing-dating-apps-without-the-swipe/)). All are [COMPANY] figures and none is independently verified. Known has not shared user numbers or revenue (SFist).

### Inferences
- "Accept" probably means both saying yes and paying $15 together (see section 5), so accepting and committing to a date are likely one step.

### Gaps
- Not documented: matches per week, what happens if the 24 hours lapse with no answer, whether the decliner gives a reason, and whether decliners are penalised.

## 5. Date logistics, the $15 fee, no-shows

### Takeaway
After both people accept, Known acts as a concierge: it picks the time (using availability and calendar inputs) and the restaurant (using stated likes and dislikes), and makes the reservation. Each person pays $15 to secure the date; the fee is also meant to deter no-shows. There is no chat before the date. Refund and cancellation rules are not public.

### Cited Findings
- Users pay $15 to secure their real-life hang, which also helps prevent no-shows [INDEPENDENT] — [Axios, May 2026](https://axios.com/2026/05/14/ai-matchmaker-online-dating-tech); repeated in [Axios SF, 21 Jul 2026](https://www.axios.com/local/san-francisco/2026/07/21/ai-wants-to-be-your-wingman)
- Free to join; the $15 is charged only when a user commits to a match [INDEPENDENT] — [SFist](https://sfist.com/2026/05/06/new-ai-dating-app-out-of-sf-says-half-its-matches-say-yes-to-real-dates/)
- Each person pays $15 to accept a match, after which Known arranges the time, restaurant and reservation (San Diego Union-Tribune, per search extract; URL not retrieved) [INDEPENDENT]
- Once both agree, Known schedules the date as a concierge, including time and location [INDEPENDENT] — [Global Dating Insights](https://www.globaldatinginsights.com/featured/ai-voice-based-dating-app-known-raises-10-million/)
- The app picks restaurants based on likes and dislikes; users give first-date availability through AI chat and calendar integrations [INDEPENDENT] — [TechCrunch](https://techcrunch.com/2025/12/19/known-uses-voice-ai-to-help-you-go-on-more-in-person-dates/)
- Beta pricing was $30 per successful date, which differs from the later $15 [INDEPENDENT] — [TechCrunch](https://techcrunch.com/2025/12/19/known-uses-voice-ai-to-help-you-go-on-more-in-person-dates/)
- No-show rate under 1%, per the founder [COMPANY via INDEPENDENT] — [Forbes](https://www.forbes.com/sites/sofiachierchio/2026/07/11/these-gen-z-founders-are-reinventing-dating-apps-without-the-swipe/)
- No in-app chat between users [INDEPENDENT] — [Axios](https://axios.com/2026/05/14/ai-matchmaker-online-dating-tech)

### Inferences
- The $15 works like a commitment deposit, not a payment for the meal. Who pays the restaurant bill is not documented, so presumably the daters do.

### Gaps
- Not documented: refund rules for cancellations or no-shows, rescheduling rules, whether users can veto a venue, and penalties for no-shows.

## 6. After the date: feedback, learning, second dates

### Takeaway
Known asks both people for feedback after each date and says this improves future matches. Second dates appear to be left to the couple; no source describes the app organising them.

### Cited Findings
- After each date, Known asks users for feedback. Amadon says this refines future matches by improving the system's understanding of compatibility [COMPANY via INDEPENDENT] — [SFist](https://sfist.com/2026/05/06/new-ai-dating-app-out-of-sf-says-half-its-matches-say-yes-to-real-dates/)
- Users give feedback to the AI and get more refined recommendations [INDEPENDENT] — [TechCrunch](https://techcrunch.com/2025/12/19/known-uses-voice-ai-to-help-you-go-on-more-in-person-dates/)
- One App Store reviewer was matched with someone not seeking a serious relationship — App Store reviews (search extract)

### Gaps
- Not documented: whether feedback is given by voice or form, how contact details are exchanged after the date, whether second dates cost anything, and whether the app pauses matching when a couple keeps dating.

## 7. Business model and pricing

### Takeaway
The model is pay-per-date, not subscription. Joining and the interview are free; each person pays $15 per committed date (it was $30 per successful date in the beta). The founders' thesis is that apps should earn money only when people actually meet.

### Cited Findings
- Free to join and to complete the interview; $15 per committed match — [SFist](https://sfist.com/2026/05/06/new-ai-dating-app-out-of-sf-says-half-its-matches-say-yes-to-real-dates/); [Axios](https://axios.com/2026/05/14/ai-matchmaker-online-dating-tech)
- Charges for setting up actual dates rather than through subscription tiers [INDEPENDENT] — [Fast Company](https://www.fastcompany.com/91484596/every-dating-app-has-ai-now-can-it-help-make-better-matches)
- Founder thesis: dating apps should make money only when they help people meet in person; frustrated Gen Z singles will pay [COMPANY via INDEPENDENT] — [Forbes](https://www.forbes.com/sites/sofiachierchio/2026/07/11/these-gen-z-founders-are-reinventing-dating-apps-without-the-swipe/)
- Beta: $30 per successful date — [TechCrunch](https://techcrunch.com/2025/12/19/known-uses-voice-ai-to-help-you-go-on-more-in-person-dates/)

### Gaps
- No revenue or user figures are public. App Store in-app purchase price tiers were not read.

## 8. Safety, privacy and terms

### Takeaway
I could not locate Known's privacy policy or terms. Voice-data retention, AI training use and deletion rights are **undocumented** in this research. The only safety features visible are hidden photos, friend vouching, the $15 commitment and public-venue restaurant dates.

### Cited Findings
- The only search hit about Known's privacy is a secondary guide advising users to check whether recordings are stored, how long, whether they train AI, and how to delete. It does not state Known's practices — [AI Learning Guides](https://ailearningguides.com/known-ai-dating-app-voice-matchmaker/)
- Social Catfish advises running a reverse image search at the photo reveal, before the date. Social Catfish sells this service [THIRD-PARTY/COMMERCIAL] — [Social Catfish](https://socialcatfish.com/scamfish/known-dating-app-review/)
- Friend "vouching" appears in the App Store listing [COMPANY] — [App Store](https://apps.apple.com/us/app/known-swipeless-dating-app/id6748926392)

### Gaps
- Not documented: the privacy policy, raw audio vs transcript retention, deletion, CCPA rights, the terms of service and the App Store privacy labels. For comparison only, a similar app, Date Drop, says it does not keep raw audio and stores only transcripts ([Date Drop privacy](https://trydatedrop.com/privacy-policy)). **Do not transfer this to Known.**

## 9. Technology providers

### Takeaway
No public source found names Known's AI or voice providers (OpenAI, ElevenLabs or others). Only "proprietary algorithm," "voice-derived signals" and calendar integrations are mentioned.

### Cited Findings
- "Proprietary algorithm" — [Axios](https://axios.com/2026/05/14/ai-matchmaker-online-dating-tech)
- Calendar integrations for availability — [TechCrunch](https://techcrunch.com/2025/12/19/known-uses-voice-ai-to-help-you-go-on-more-in-person-dates/)
- A search for OpenAI, ElevenLabs or Stanford in connection with Known returned nothing relevant.

### Gaps
- Not found: the LLM, speech-to-text and text-to-speech vendors. A DEV Community "architectural review" of a voice-first matchmaking platform appeared in results, but it was not shown to be about Known and was not used ([dev.to](https://dev.to/janakii/architectural-review-engineering-a-voice-first-ai-matchmaking-platform-3ilj)). A founder podcast exists but was not reviewed ([Spotify: "Inside Known"](https://open.spotify.com/episode/1G3vkS8aqXdVoQrnxeaCr8)).

## Worked example (illustrative, reconstructed from the sources above; undocumented steps marked)
1. Marco, 28, in San Francisco, downloads Known on iOS. Eligibility is 21+ and Bay Area only (age and location checks are not documented in detail).
2. He has a voice call with the AI matchmaker, about 26 minutes per the company (other reports say 15-30 minutes), about his personality, values and what he wants. No form, no bio to write.
3. Known writes his profile. He adds photos (timing undocumented) and can ask friends to vouch for him.
4. Known sends him one introduction: Giulia. Her photo appears only at this point. Each of them has 24 hours to accept and agree to a date.
5. Both accept and each pays $15. Through chat and calendar inputs, Known picks a time and a restaurant that fits their tastes and books it. There is no chat between them beforehand.
6. They meet (the company says no-shows are under 1%). Cancellation and refund rules are undocumented.
7. Afterwards Known asks each of them for feedback, which refines the next introduction. If either had passed at step 4, that introduction would have closed and Known would have started on the next one.
