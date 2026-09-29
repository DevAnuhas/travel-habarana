# Package landing page drafts

Drafts for the admin "Landing page" tab of five packages. Every line in a paste-ready block comes from text already published on www.ceylonsafari.com or in `components/common/faq-data.ts`. Nothing is added from general knowledge. Where the sources disagree, the field is held back and the conflict goes to the owner.

Sources were fetched on 2026-09-29. The live package pages still use the old layout: name, description, duration, "What's Included", group size and a booking panel. No live page shows a price.

## How to use this file

- Paste each code block into the admin field with the same name.
- `— none in live copy; see owner questions —` means no source supports the field. Leave it empty until the owner answers.
- `— held back: …; see owner question N —` means the sources state something but contradict each other. The owner question gives the candidate text to paste once confirmed.
- Tags such as **[C1]** point to the contradiction index near the end.
- The admin limits in `lib/types.ts` are tighter than the brief in places: a start time ≤ 40 characters, a pickup area ≤ 60, a what-to-bring item ≤ 100, at most 10 itinerary steps and 10 FAQs. All blocks below fit.
- Itinerary lines without a time must start with ` | `. Without it, the admin reads the title as a time.
- Spelling is British (colour, socialise, travellers). The live copy mixes US and UK spelling.
- Two search titles are close to existing blog titles: `/blogs/cooking-class-habarana` ("Sri Lankan Cooking Class in Habarana") and `/blogs/kaudulla-national-park-jeep-safari` ("Kaudulla National Park Jeep Safari from Habarana"). The drafts below avoid an exact match, but the blog and package pages will still compete in search.

---

### Minneriya National Park Safari

**Sources used:**

- https://www.ceylonsafari.com/packages/minneriya-national-park-safari
- https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures
- https://www.ceylonsafari.com/blogs/habarana-jeep-safari
- https://www.ceylonsafari.com/blogs/minneriya-jeep-safari-habarana
- https://www.ceylonsafari.com/blogs/minneriya-jeep-safari
- `components/common/faq-data.ts`

**Paste-ready.**

**summary**

```text
A jeep safari from Habarana to Minneriya National Park, where wild elephant herds gather on the grassland around the ancient Minneriya Tank in the dry season.
```

**seoTitle**

```text
Minneriya National Park Safari from Habarana
```

**seoDescription**

```text
Jeep safari from Habarana to Minneriya National Park. Watch wild elephant herds at the ancient Minneriya Tank, plus deer, buffalo and birdlife.
```

**groupSize**

```text
1 to 6 people per jeep
```

**highlights**

```text
Elephant herds gather on the grassland around the ancient Minneriya Tank in the dry season
Watch elephant families graze, bathe, play and socialise out in the open
The best-known safari park near Habarana, recommended for first-time visitors
The Minneriya Tank is an ancient reservoir built by King Mahasen in the 3rd century AD
Look for sambar deer, spotted deer, wild buffalo and crocodiles
An Important Bird Area, with painted storks, lesser adjutants, spot-billed pelicans and eagles
Sloth bears and leopards live in the park, but sightings are rare
Close to Habarana, with Sigiriya Rock Fortress and Polonnaruwa nearby
```

**notIncluded**

— none in live copy; see owner questions —

**timeSlots**

— held back: times appear only as general advice and conflict with the stated duration; see owner question 2 —

**pickupAreas**

```text
Habarana
Sigiriya
Dambulla
```

**whatToBring**

```text
Sunscreen
Hat
Sunglasses
Comfortable, neutral-coloured clothing
Camera with a secure strap
Binoculars, if you have them
```

**itinerary**

```text
 | Hotel pickup | You are collected from your hotel or the agreed meeting point
 | Drive to Minneriya National Park
 | Jeep safari | Your route and time in the park depend on where the wildlife is, road conditions and park rules
 | Drop-off | Back to your hotel or the meeting point
```

**faqs**

```text
What is the Minneriya elephant gathering?
In the dry season the water in the Minneriya Tank drops and fresh grass grows on the exposed ground. Elephant herds come in from the surrounding forests of Matale, Polonnaruwa and Trincomalee to feed and drink.

Is Minneriya a good choice for a first safari?
Yes. Minneriya is the best-known safari park near Habarana. Its open grassland and large elephant herds make it the park we recommend for first-time visitors.

Should we go in the morning or the afternoon?
Morning safaris are cooler, with softer light and an early start. Afternoon safaris can be rewarding as wildlife becomes more active again and the light turns toward sunset. In the dry season, afternoon trips are popular because elephants gather near water. No time of day guarantees a sighting, so pick the one that fits your plans.
```

**season**

— held back: sources conflict; see owner question 9 —

**description** (proposed replacement for "About this experience")

```text
Minneriya National Park is the best-known safari park near Habarana, in Sri Lanka's North Central Province. It is centred on the Minneriya Tank, an ancient reservoir built by King Mahasen in the 3rd century AD. The area was first protected as a wildlife sanctuary in 1938 and became a national park in 1997.

The park is famous for its elephant gathering. In the dry season, herds collect on the grassland around the tank, and you can watch whole families grazing, bathing, playing and socialising.

Elephants are the main reason to come, but not the only one. Sambar deer, spotted deer, wild buffalo, toque macaques and purple-faced langurs live here, along with water monitors, mugger crocodiles and Indian pythons. Sloth bears and leopards are present, but sightings are rare.

Minneriya is an Important Bird Area. Birds found here include painted storks, lesser adjutants, spot-billed pelicans and eagles, and endemic species such as the Sri Lanka junglefowl and the grey hornbill.

The park is close to Habarana, and Sigiriya Rock Fortress and the ancient city of Polonnaruwa are nearby, so it fits well into a trip around the Cultural Triangle.
```

**Owner to confirm before publishing.**

1. **Price.** No live page shows one. The booking panel says "No payment required - we'll get back to you within 24 hours with pricing and availability." What is the starting price, in which currency, and is it per jeep or per person?
2. **Start times [C10].** The only times on the site are general advice: "Morning Safari: 6:00 AM – 9:00 AM" and "Afternoon Safari: 3:00 PM – 6:30 PM" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures). The afternoon slot is 3.5 hours, but the package says "Duration 3 hours" (https://www.ceylonsafari.com/packages/minneriya-national-park-safari). What are your real start times? If they match, paste `6:00 am` and `3:00 pm` into timeSlots.
3. **Park entrance tickets.** One blog lists "Park entrance tickets (optional)" under "Most Habarana safari tours include" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures). Another says "confirm whether entrance tickets, pickup, and refreshments are included before booking" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). The package's included list does not mention tickets. Are tickets included? If not, paste `Park entrance tickets` into notIncluded.
4. **Pickup areas and charge [C7].** The FAQ says "complimentary pickup and drop-off from hotels in Habarana, Sigiriya, and Dambulla. For hotels outside these areas, there may be an additional charge" (`faq-data.ts`). The Habarana blog says to "confirm whether entrance tickets, pickup, and refreshments are included" and mentions an "eligible nearby pickup location" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). Which areas are covered, is pickup free there, and what does it cost elsewhere? The draft lists the three towns only and says nothing about cost.
5. **Group size.** The package says "1-6 people per jeep" and the FAQ says "up to 6 passengers plus the driver and guide". Is 6 the maximum? Does a solo traveller or a couple pay for the whole jeep?
6. **Driver and guide [C9].** The FAQ says "up to 6 passengers plus the driver and guide" (two people). The Habarana blog says "Your driver-guide collects you" (one person) (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). Another blog says "led by experienced drivers and trackers" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures). Is there a separate guide in the jeep, or one driver-guide? The draft avoids saying either.
7. **Water and snacks [C8].** The package includes "Snack & Water" and the FAQ says "Water bottles and snacks are provided on all our safaris." The Habarana blog says "Bring drinking water" and to "confirm whether … refreshments are included" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). Which is true? Water is left out of whatToBring until you answer.
8. **Which park on the day [C11].** The Habarana blog says "Instead of promising one park months in advance, Ceylon Safari checks current local conditions and recommends the park offering the most suitable wildlife experience on the day" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). If a guest books Minneriya and the herds are at Kaudulla, what happens? The itinerary currently says "Drive to Minneriya National Park".
9. **Season months [C1].** The sources disagree:
   - "From May to October, hundreds of elephants converge" (https://www.ceylonsafari.com/packages/minneriya-national-park-safari)
   - "from May to October … The famous Elephant Gathering peaks between July and September" (`faq-data.ts`)
   - "From July to October, Minneriya hosts the legendary Elephant Gathering" and, in the same post, "May to October: Best for elephant sightings / July to September: Peak elephant gathering period" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures)
   - "May to October, peaking in August and September" (https://www.ceylonsafari.com/blogs/minneriya-jeep-safari-habarana)
   - "peak season (December-January and July-August)" (`faq-data.ts`, booking FAQ; this may mean the tourist peak, not the elephant peak)

   Most sources support this candidate: `Best: Jul, Aug, Sep / Good: May, Jun, Oct`. Confirm or correct it.
10. **Herd size [C2].** One post says "200–300 wild elephants can be seen together" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures). The duplicate post says "herds of up to 300 to 700 elephants" (https://www.ceylonsafari.com/blogs/minneriya-jeep-safari-habarana). The package says "hundreds of elephants". The draft gives no number. Which figure, if any, should the site use?
11. **"World's largest" [C4].** The package says "the world's largest gathering of wild Asian elephants" and the duplicate post says "the largest annual congregation of Asian wild elephants on Earth" (https://www.ceylonsafari.com/blogs/minneriya-jeep-safari-habarana). The comparison post says "one of the largest wild elephant gatherings in Asia" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures). The draft uses neither. Keep it out, or pick one wording?
12. **Duration.** Is "3 hours" time inside the park, or door to door including the drive?
13. **Historical facts.** The draft states "built by King Mahasen in the 3rd century AD" (two blogs agree). It also states the sanctuary and national park dates, from "designted as a natioanal park on 12 august 1997, having been originally declared as a wildlife sanctuary in 1938" (https://www.ceylonsafari.com/blogs/minneriya-jeep-safari). Are you happy to publish these?
14. **"Recommended for first-time visitors."** The draft keeps this from "Highly recommended for first-time visitors" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures). Confirm it is your recommendation.

**Typo fixes in the current `description`:**

The live text has no spelling errors. These are the wording and claim changes in the proposed replacement:

- "Experience the awe-inspiring spectacle of the world's largest gathering of wild Asian elephants at Minneriya National Park." → removed (superlative disputed, question 11)
- "From May to October, hundreds of elephants converge around the ancient Minneriya Tank" → "In the dry season, herds collect on the grassland around the tank" (months held back, question 9)
- "creating a breathtaking scene of grazing, bathing, and socializing" → "you can watch whole families grazing, bathing, playing and socialising"
- "vibrant birdlife like eagles and storks" → "Birds found here include painted storks, lesser adjutants, spot-billed pelicans and eagles"
- "A Minneriya National Park Safari is a must for those seeking a profound connection with Sri Lanka's wildlife." → removed
- "socializing" → "socialising" (only if you standardise on British spelling)

---

### Kaudulla National Park Safari

**Sources used:**

- https://www.ceylonsafari.com/packages/kaudulla-national-park-safari
- https://www.ceylonsafari.com/blogs/kaudulla-national-park-jeep-safari
- https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures
- https://www.ceylonsafari.com/blogs/habarana-jeep-safari
- `components/common/faq-data.ts`

**Paste-ready.**

**summary**

```text
A jeep safari from Habarana to Kaudulla National Park, where elephants come to the Kaudulla Reservoir and herds often move when conditions change at nearby Minneriya.
```

**seoTitle**

```text
Kaudulla National Park Safari from Habarana
```

**seoDescription**

```text
Jeep safari from Habarana to Kaudulla National Park: elephants at the reservoir, pelicans and other birdlife, and fewer crowds than Minneriya.
```

**groupSize**

```text
1 to 6 people per jeep
```

**highlights**

```text
Elephant herds come to drink and feed at the Kaudulla Reservoir, especially in the dry season
Can be the better choice when elephants move from Minneriya as water levels change
Less crowded than Minneriya, with a calm, quiet pace for relaxed wildlife watching
Forest, grassland and reservoir scenery
Recognised by BirdLife International as an Important Bird Area
Look for spot-billed pelicans, Asian spoonbills, black-headed ibis and grey-headed fish eagles
Large flocks of pelicans on the water at sunset, a favourite with photographers
Sambar deer, axis deer, wild boar and jackals, with leopards and grey slender lorises more elusive
```

**notIncluded**

— none in live copy; see owner questions —

**timeSlots**

— held back: times appear only as general advice and conflict with the stated duration; see owner question 2 —

**pickupAreas**

```text
Habarana
Sigiriya
Dambulla
```

**whatToBring**

```text
Sunscreen
Hat
Sunglasses
Comfortable, neutral-coloured clothing
Camera with a secure strap
Binoculars, if you have them
```

**itinerary**

```text
 | Hotel pickup | You are collected from your hotel or the agreed meeting point
 | Drive to Kaudulla National Park
 | Jeep safari | Your route and time in the park depend on where the wildlife is, road conditions and park rules
 | Drop-off | Back to your hotel or the meeting point
```

**faqs**

```text
Should I choose Kaudulla or Minneriya?
Elephants move between the two parks as water levels change. When conditions change at Minneriya, herds often move to Kaudulla, and Kaudulla can then give better sightings with fewer crowds. If your dates are flexible, ask us which park has had the better recent conditions before you book.

What birds can we see at Kaudulla?
Kaudulla is an Important Bird Area. Species recorded here include spot-billed pelican, lesser adjutant, Asian spoonbill, grey-headed fish eagle, black-headed ibis, painted stork, open-billed stork and peafowl. At sunset, large flocks of pelicans gather on the water.

Are elephant sightings guaranteed?
No. Animals move with water, food and weather, and Ceylon Safari does not promise specific sightings.
```

**season**

— held back: sources conflict; see owner question 9 —

**description** (proposed replacement for "About this experience")

```text
Kaudulla National Park lies in Sri Lanka's North Central Province, a short drive from Habarana and Minneriya. It was declared a national park in 2002. Forest and grassland surround the Kaudulla Reservoir, which is an important meeting place for the park's wildlife.

Elephants come to the water to drink, especially in the dry season. Herds move between Kaudulla and Minneriya as water levels change. When conditions shift at Minneriya, Kaudulla can give better elephant sightings, with fewer crowds and a calmer pace.

Other mammals here include sambar deer, axis deer, wild boar, jackals, monkeys, chevrotains and sloth bears. Leopards and grey slender lorises are more elusive. The reservoir also holds many fish species and freshwater turtles, including the Indian flap-shelled turtle and the Indian black turtle.

BirdLife International recognises Kaudulla as an Important Bird Area. Look for spot-billed pelicans, lesser adjutants, Asian spoonbills, black-headed ibis, painted and open-billed storks, peafowl and the grey-headed fish eagle. At sunset, large flocks of pelicans gather on the water, a favourite scene for photographers.
```

**Owner to confirm before publishing.**

1. **Price.** No live page shows one ("we'll get back to you within 24 hours with pricing and availability"). What is the starting price, in which currency, and is it per jeep or per person?
2. **Start times [C10].** The only times are "Morning Safari: 6:00 AM – 9:00 AM" and "Afternoon Safari: 3:00 PM – 6:30 PM" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures), against "Duration 3 hours" (https://www.ceylonsafari.com/packages/kaudulla-national-park-safari). What are your real start times for Kaudulla?
3. **Park entrance tickets.** "Park entrance tickets (optional)" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures) vs "confirm whether entrance tickets … are included" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). Included or not? If not, paste `Park entrance tickets` into notIncluded.
4. **Pickup areas and charge [C7].** "complimentary pickup and drop-off from hotels in Habarana, Sigiriya, and Dambulla" (`faq-data.ts`) vs "confirm whether … pickup … [is] included" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). Which areas, is pickup free, and what is the charge elsewhere?
5. **Group size.** "1-6 people per jeep" (package) and "up to 6 passengers plus the driver and guide" (`faq-data.ts`). Confirm the maximum, and whether small groups pay for the whole jeep.
6. **Driver and guide [C9].** "plus the driver and guide" (`faq-data.ts`) vs "Your driver-guide collects you" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). One person or two?
7. **Water and snacks [C8].** "Snack & Water" (package) and "Water bottles and snacks are provided on all our safaris" (`faq-data.ts`) vs "Bring drinking water" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). Which is true?
8. **Which park on the day [C11].** "recommends the park offering the most suitable wildlife experience on the day" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). Does a Kaudulla booking always go to Kaudulla?
9. **Season months [C1].** The sources disagree:
   - "The best time to visit the park is between August and December, particularly during September and October when the largest gathering of Elephants can be witnessed" (https://www.ceylonsafari.com/blogs/kaudulla-national-park-jeep-safari)
   - "from May to October … peaks between July and September" (`faq-data.ts`, about Habarana safaris in general)
   - "particularly during the dry season" (https://www.ceylonsafari.com/packages/kaudulla-national-park-safari)
   - "Elephant herds may move here during the drier part of the year" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari)

   The Kaudulla post alone gives `Best: Sep, Oct / Good: Aug, Nov, Dec`. Is that right, or does Kaudulla follow the May to October window?
10. **Landscape [C5].** The package says "evergreen forests and grassy plains" (https://www.ceylonsafari.com/packages/kaudulla-national-park-safari). The blog says "a mix of dry scrub forest and grasslands" (https://www.ceylonsafari.com/blogs/kaudulla-national-park-jeep-safari). The draft says only "forest and grassland". Which description is correct?
11. **Tank history [C6].** The blog says "one of the famed 16 irrigation tanks built by King Mahasen in 1959" (https://www.ceylonsafari.com/blogs/kaudulla-national-park-jeep-safari). Two other posts date King Mahasen's Minneriya Tank to "the 3rd century AD", so "1959" cannot be right. The draft leaves the tank's history out. What should it say?
12. **Species counts.** The Kaudulla post gives "24 species of mammals", "160 of species of birds" and "25 species of reptiles". The Minneriya post gives exactly the same figures: "over 24 mammal species, 160 bird species, and 25 reptile species" (https://www.ceylonsafari.com/blogs/minneriya-jeep-safari-habarana). They look copied from one park to the other. The draft uses no counts. Are any of them right for Kaudulla?
13. **Paddle boat.** "Visitors also have the opportunity to take a memorable paddle boat ride across the reservoir" (https://www.ceylonsafari.com/blogs/kaudulla-national-park-jeep-safari). Do you offer this? Is it part of the package or extra? It is left out of the draft.
14. **Crowds.** The draft keeps "Less crowded than Minneriya" and "fewer crowds" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures). Is that still true in the peak months?
15. **Distance.** "it located 20km away from habarana" (https://www.ceylonsafari.com/blogs/kaudulla-national-park-jeep-safari) vs "just a short drive from Habarana and Minneriya" (comparison post). The draft uses "a short drive". Do you want to publish a distance or drive time?
16. **Historical fact.** "It was declared a national park in 2002" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures). OK to publish?
17. **Unclear names left out.** "the Giant eagle" (which species?) and "Fejervaryapulla" (spelling of the endemic frog) (https://www.ceylonsafari.com/blogs/kaudulla-national-park-jeep-safari).

**Typo fixes in the current `description`:**

The live text has no spelling errors. These are the wording and claim changes in the proposed replacement:

- "Discover the serene beauty of Kaudulla National Park, a hidden gem in Sri Lanka's Cultural Triangle." → "Kaudulla National Park lies in Sri Lanka's North Central Province, a short drive from Habarana and Minneriya."
- "evergreen forests and grassy plains" → "Forest and grassland" (landscape disputed, question 10)
- "the park teems with sambar deer, wild boar, and rare birds" → "Other mammals here include sambar deer, axis deer, wild boar …"
- "A Kaudulla National Park Safari offers a tranquil yet exhilarating escape into the heart of Sri Lanka's natural heritage." → removed

---

### Hurulu Eco Park Safari

**Sources used:**

- https://www.ceylonsafari.com/packages/hurulu-eco-park-safari
- https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures
- https://www.ceylonsafari.com/blogs/habarana-jeep-safari
- `components/common/faq-data.ts`

**Paste-ready.**

**summary**

```text
A jeep safari from Habarana into Hurulu Eco Park, a forest reserve where elephants roam through dense woodland and gather at the Hurulu Wewa reservoir in the dry season.
```

**seoTitle**

```text
Hurulu Eco Park Jeep Safari from Habarana
```

**seoDescription**

```text
Forest jeep safari from Habarana in Hurulu Eco Park, part of a UNESCO biosphere reserve. Elephants, langurs, deer and fewer vehicles.
```

**groupSize**

```text
1 to 6 people per jeep
```

**highlights**

```text
A forest safari through dense vegetation, unlike the open grassland of Minneriya and Kaudulla
Part of the Hurulu Forest Reserve, a UNESCO biosphere reserve
An important corridor for elephants moving between habitats
Elephant herds gather around the Hurulu Wewa reservoir in the dry season
Fewer tourists and vehicles
Purple-faced langurs, toque macaques, deer, porcupines and monitor lizards
Elusive leopards, junglefowl and rare birds live in the forest
Can offer rewarding elephant and bird sightings when animals leave the larger parks
```

**notIncluded**

— none in live copy; see owner questions —

**timeSlots**

— held back: times appear only as general advice and conflict with the stated duration; see owner question 2 —

**pickupAreas**

```text
Habarana
Sigiriya
Dambulla
```

**whatToBring**

```text
Sunscreen
Hat
Sunglasses
Comfortable, neutral-coloured clothing
Camera with a secure strap
Binoculars, if you have them
```

**itinerary**

```text
 | Hotel pickup | You are collected from your hotel or the agreed meeting point
 | Drive to Hurulu Eco Park
 | Jeep safari | Your route and time in the park depend on where the wildlife is, road conditions and park rules
 | Drop-off | Back to your hotel or the meeting point
```

**faqs**

```text
How is Hurulu different from Minneriya and Kaudulla?
Minneriya and Kaudulla are known for grassland around their reservoirs. Hurulu is a forest-based safari with dense vegetation, so you see elephants in a wooded setting. There are also fewer vehicles.

Is Hurulu better in the morning?
Hurulu suits a morning safari well. Mornings are cooler, the light is softer, and you are out before the middle of the day.

How should we behave around wildlife?
Give the animals space. Please do not ask the driver to crowd, chase, feed or block wildlife. Keep your voice low, stay inside the jeep where required, and follow the driver's instructions. Patient watching is safer for you and less disruptive for the elephants.
```

**season**

— held back: sources conflict; see owner question 9 —

**description** (proposed replacement for "About this experience")

```text
Hurulu Eco Park is part of the Hurulu Forest Reserve near Habarana, in Sri Lanka's North Central Province. The reserve is a UNESCO biosphere reserve and an important corridor for elephants on the move.

Unlike Minneriya and Kaudulla, Hurulu is a forest-based safari. The vegetation is dense and there are fewer vehicles, which suits nature lovers and anyone interested in conservation.

Elephants roam through the forest, and in the dry season herds gather around the Hurulu Wewa reservoir. When animals move away from the larger national parks, Hurulu can offer rewarding elephant and bird sightings.

Other wildlife includes purple-faced langurs, toque macaques, deer, porcupines and monitor lizards. Junglefowl and rare birds live in the forest, and so do leopards, though they are elusive.
```

**Owner to confirm before publishing.**

1. **Price.** No live page shows one ("we'll get back to you within 24 hours with pricing and availability"). What is the starting price, in which currency, and is it per jeep or per person?
2. **Start times [C10].** "Morning Safari: 6:00 AM – 9:00 AM" and "Afternoon Safari: 3:00 PM – 6:30 PM" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures) vs "Duration 3 hours" (https://www.ceylonsafari.com/packages/hurulu-eco-park-safari). The same post calls Hurulu "Perfect for morning safaris". Do you run afternoon Hurulu safaris, and at what times?
3. **Park entrance tickets.** "Park entrance tickets (optional)" (comparison post) vs "confirm whether entrance tickets … are included" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). Included or not?
4. **Pickup areas and charge [C7].** "complimentary pickup and drop-off from hotels in Habarana, Sigiriya, and Dambulla" (`faq-data.ts`) vs "confirm whether … pickup … [is] included" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). Which areas, is pickup free, and what does it cost elsewhere?
5. **Group size.** "1-6 people per jeep" (package) and "up to 6 passengers plus the driver and guide" (`faq-data.ts`). Confirm.
6. **Driver and guide [C9].** "plus the driver and guide" (`faq-data.ts`) vs "Your driver-guide collects you" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). One person or two?
7. **Water and snacks [C8].** "Snack & Water" (package) and "provided on all our safaris" (`faq-data.ts`) vs "Bring drinking water" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). Which is true?
8. **Which park on the day [C11].** "recommends the park offering the most suitable wildlife experience on the day" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari). Does a Hurulu booking always go to Hurulu?
9. **Season months [C1].** The package says "During the dry season, from April to September, you can witness herds of elephants gathering around the Hurulu Wewa reservoir" (https://www.ceylonsafari.com/packages/hurulu-eco-park-safari). The FAQ says "from May to October … peaks between July and September" (`faq-data.ts`). Candidate from the package alone: `Good: Apr, May, Jun, Jul, Aug, Sep`. No source names best months for Hurulu. Which months are right?
10. **Leopards.** The package says "home to elusive leopards". The comparison post's Hurulu wildlife list does not mention leopards (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures). The draft keeps "elusive leopards". Confirm.
11. **"Fewer tourists and vehicles."** Kept from the comparison post. Still true?
12. **Corridor wording.** The package says "a critical corridor for elephant migration". The draft softens this to "an important corridor". Is either wording something you can stand behind?

**Typo fixes in the current `description`:**

The live text has no spelling errors. These are the wording and claim changes in the proposed replacement:

- "Embark on a journey through one of Sri Lanka's hidden gems, the Hurulu Eco Park, nestled in the heart of the North Central Province." → "Hurulu Eco Park is part of the Hurulu Forest Reserve near Habarana, in Sri Lanka's North Central Province."
- "particularly its majestic elephants, as they roam freely in their natural habitat" → "Elephants roam through the forest"
- "a critical corridor for elephant migration" → "an important corridor for elephants on the move" (question 12)
- "During the dry season, from April to September, … creating a breathtaking spectacle" → "in the dry season herds gather around the Hurulu Wewa reservoir" (months held back, question 9)
- "colorful jungle fowl" → "Junglefowl"
- "making every moment a thrilling encounter with nature's wonders. A Hurulu Eco Park Safari promises an unforgettable adventure into Sri Lanka's wild soul." → removed

---

### Village Experience Tour

**Sources used:**

- https://www.ceylonsafari.com/packages/village-experience-tour
- https://www.ceylonsafari.com/blogs/habarana-jeep-safari

**Paste-ready.**

**summary**

```text
A village tour with a boat ride, a traditional lunch of nine curries, a cooking demonstration, and tuk-tuk and tractor rides, with a village guide.
```

**seoTitle**

```text
Sri Lankan Village Tour: Boat Ride, Lunch and Tuk-Tuk
```

**seoDescription**

```text
A village tour with a boat ride, a traditional lunch of nine curries with chicken and lake fish, a cooking demonstration, and tuk-tuk and tractor rides.
```

**groupSize**

— held back: live copy says "per jeep" on a tour with no jeep described; see owner question 5 —

**highlights**

```text
A boat ride through quiet waterways surrounded by greenery
A traditional lunch of nine curries, including chicken and fresh lake fish, served with rice
A cooking demonstration
Tuk-tuk and tractor rides through the village
A village guide shows you local culture, crafts and daily life
Meet local people and see how they live day to day
Designed to complement a safari
```

**notIncluded**

— none in live copy; see owner questions —

**timeSlots**

— none in live copy; see owner questions —

**pickupAreas**

— none in live copy; see owner questions —

**whatToBring**

— none in live copy; see owner questions —

**itinerary**

```text
 | Boat ride | Through quiet waterways surrounded by greenery
 | Traditional lunch | Nine curries, including chicken and fresh lake fish, served with rice
 | Tuk-tuk and tractor rides | Through the village, with a look at local culture, crafts and daily life
```

**faqs**

```text
Can I combine this tour with a safari?
Yes. The tour is designed to complement a safari. A safari from Habarana can be combined with a village experience, a cooking class, Sigiriya or Polonnaruwa.
```

**season**

— none in live copy; see owner questions —

**description** (proposed replacement for "About this experience")

```text
This tour takes you into rural Sri Lankan village life. It begins with a boat ride through quiet waterways surrounded by greenery. Lunch is a traditional meal of nine curries, including chicken and fresh lake fish, served with rice. The tour finishes with tuk-tuk and tractor rides through the village.

A village guide goes with you and shows you local culture, crafts and daily life. You meet the people who live there and see how they spend their days. The tour also includes a cooking demonstration.
```

**Owner to confirm before publishing.**

1. **Price.** No live page shows one. What is the starting price, in which currency, and is it per person or per group?
2. **Start time.** No time is stated anywhere. Lunch is part of the tour, so does it always start in the morning? What times can guests choose?
3. **Location.** The package never says where the village is. Is it in Habarana, or how far away? The draft does not name a place.
4. **Pickup.** The pickup FAQ talks about safaris. Is hotel pickup included for this tour, and from which areas?
5. **Group size.** The live page says "1-6 people per jeep" (https://www.ceylonsafari.com/packages/village-experience-tour), but the tour as described uses a boat, a tuk-tuk and a tractor. Is there a jeep? What is the real group limit, and does the tuk-tuk ride limit it?
6. **Tractor ride [C14].** The description says "tuk-tuk and tractor rides through the village". The included list has "Tuk-Tuk Ride" but no tractor ride (https://www.ceylonsafari.com/packages/village-experience-tour). Are both included?
7. **Cooking demonstration.** "Cooking Demonstration" is on the included list but never appears in the description. When does it happen? Is it the preparation of the lunch? It is left out of the itinerary until you answer.
8. **Lunch.** Confirm "nine traditional curries, including chicken and fresh lake fish". Is there a vegetarian option?
9. **Order of the day.** The description says "Conclude your journey with tuk-tuk and tractor rides", then goes on: "Wander through rural villages … Engage with locals" (https://www.ceylonsafari.com/packages/village-experience-tour). What order does the day really run in? The draft itinerary follows boat, lunch, rides.
10. **Name [C17].** The description calls it "a Cultural Village Tour". The package is named "Village Experience Tour". Which name is right?
11. **Duration.** Is "3-4 hours" door to door?
12. **Weather.** The page says "Available daily, subject to weather conditions". Is there a season or weather limit for the boat ride?
13. **What to bring.** Nothing is stated. Should guests bring anything, such as a hat or a change of clothes?

**Typo fixes in the current `description`:**

The live text has no spelling errors. These are the wording and claim changes in the proposed replacement:

- "Immerse yourself in the vibrant traditions of Sri Lanka with a Cultural Village Tour." → "This tour takes you into rural Sri Lankan village life." (name mismatch, question 10)
- "Begin with a serene boat ride, gliding through tranquil waterways surrounded by lush greenery." → "It begins with a boat ride through quiet waterways surrounded by greenery."
- "Savor a sumptuous lunch featuring nine traditional curries" → "Lunch is a traditional meal of nine curries"
- "Conclude your journey with tuk-tuk and tractor rides" followed by more activities → the rides come last, and the guide and locals move to the second paragraph (order to confirm, question 9)
- "This tour is the perfect complement to your safari adventure." → "The tour is designed to complement a safari." (moved to the FAQ)
- "where warm hospitality and ancient customs come alive" and "This tour unveils the rich heritage of Sri Lanka's rural heartland, offering a deep, personal connection to its culture and community." → removed
- "Savor" → "savour" (only if you standardise on British spelling)

---

### Sri Lankan Culinary Journey

**Sources used:**

- https://www.ceylonsafari.com/packages/sri-lankan-culinary-journey
- https://www.ceylonsafari.com/blogs/cooking-class-habarana

**Paste-ready.**

**summary**

```text
A hands-on Sri Lankan cooking class in Habarana. A local chef explains the spices and ingredients, you cook a rice and curry meal, then sit down to eat it.
```

**seoTitle**

```text
Hands-On Sri Lankan Cooking Class in Habarana
```

**seoDescription**

```text
Cook rice and curry with a local chef in Habarana. Learn the spices, cook dhal and vegetable curries, eat your meal and take the recipes home.
```

**groupSize**

— held back: sources conflict; see owner question 4 —

**highlights**

```text
Cook a Sri Lankan rice and curry meal with a local chef
Learn about the spices and other ingredients, from cinnamon to cardamom
Dishes include vegetable curries, dhal curry, sambol, pappadam and rice
Home-style food: what local families eat, not restaurant dishes
Simple methods using fresh local ingredients
Sit down to eat the meal you cooked
Take away the recipes for every dish you cooked
Designed for international travellers who want to learn traditional cooking
```

**notIncluded**

— none in live copy; see owner questions —

**timeSlots**

— none in live copy; see owner questions —

**pickupAreas**

— none in live copy; see owner questions —

**whatToBring**

— none in live copy; see owner questions —

**itinerary**

```text
 | Meet your chef | Learn about the spices and other ingredients used in Sri Lankan cooking
 | Cook | Prepare rice and curries using fresh local ingredients
 | Eat | Sit down to the meal you cooked
 | Recipes | Receive the recipes for all the dishes
```

**faqs**

```text
What will we cook?
A Sri Lankan rice and curry meal: vegetable curries, dhal curry, sambol or a Sri Lankan salad, pappadam and rice. You also get a detailed explanation of every ingredient.

Do we eat the food we cook?
Yes. The class ends with you sitting down to the meal you cooked.

Do we get the recipes?
Yes. You receive the recipes for all the dishes you cook.
```

**season**

— none in live copy; see owner questions —

**description** (proposed replacement for "About this experience")

```text
This is a hands-on Sri Lankan cooking class in Habarana, set in a village. A local chef teaches you the food that Sri Lankan families cook at home, not the dishes you find on restaurant menus.

You learn about the spices and other ingredients that go into the local cuisine, including cinnamon and cardamom, with a detailed explanation of each one. Then you cook a rice and curry meal: vegetable curries, dhal curry, sambol or a Sri Lankan salad, pappadam and rice. The methods are simple and use fresh local ingredients.

When the cooking is done, you sit down and eat the meal you made. You also receive the recipes for every dish. The class is designed for international travellers who want to learn traditional Sri Lankan cooking.
```

**Owner to confirm before publishing.**

1. **Price.** No live page shows one. What is the starting price, in which currency, and is it per person or per group?
2. **Start times.** None are stated. When does the class start, and are lunch and dinner classes both possible?
3. **Duration [C3].** The package says "3-4 hours" (https://www.ceylonsafari.com/packages/sri-lankan-culinary-journey). The blog says "You will get the full Sri Lankan cuisine experiance in 2 or 3 hours" (https://www.ceylonsafari.com/blogs/cooking-class-habarana). Which is right? Fix the other page too.
4. **Group size [C12].** The package says "1-6 people per jeep". The blog says the class "is geared to groups of two or more" (https://www.ceylonsafari.com/blogs/cooking-class-habarana). Can one person book? What is the maximum? Is there a jeep at all? If it is 2 to 6, paste `2 to 6 people`.
5. **Private.** The blog calls it "this private cooking class in Habarana". Is the class only for the booking group? The draft does not say "private".
6. **Dishes [C13].** The blog gives two lists: "5 vegitables curries,Dhal curry, chicken curry,sambol/mellum or sri lankan salad, pappadam and Rice" and "4-5 vegetable curries, Dhal curry, chicken or fish curry, salad/mellum or coconut sambol, pappadam, rice" (https://www.ceylonsafari.com/blogs/cooking-class-habarana). How many vegetable curries? Chicken, fish, or a choice? Is there a vegetarian version? The draft leaves out the number and the meat or fish curry.
7. **Water and fruit.** The blog says "Water bottle, and fruits" come with the class. The package's included list does not. Are they included?
8. **Chef or home cook.** The package says "Under the guidance of local chefs" and "Local Chef Guide". The blog says "from a local" and "what locals eat in their homes". Who teaches the class? The draft says "a local chef".
9. **Hands-on or demonstration.** The package says "hands-on cooking class". The blog says "The demonstrations are based on creating dishes". Do guests cook each dish themselves?
10. **Location.** The blog says "in Habarana". The package says "a welcoming village environment". Where exactly is it, and can guests find it on a map?
11. **Pickup.** Is hotel pickup included, and from which areas?
12. **Spelling.** The blog writes "mellum". Is the usual spelling "mallum"? The draft uses "a Sri Lankan salad" to avoid guessing.
13. **Order of the class.** The draft itinerary runs ingredients, cooking, eating, recipes. Is that the real order?

**Typo fixes in the current `description`:**

The live text has no spelling errors. These are the wording and claim changes in the proposed replacement:

- "Dive into the soul of Sri Lankan cuisine with our Sri Lankan Culinary Journey, a hands-on cooking class that brings the island's flavors to life." → "This is a hands-on Sri Lankan cooking class in Habarana, set in a village."
- "Under the guidance of local chefs, you'll master the art of preparing traditional dishes" → "A local chef teaches you the food that Sri Lankan families cook at home" ("master" overstates a single class; chef or home cook is question 8)
- "culminating in a delicious meal you've crafted yourself" → "you sit down and eat the meal you made"
- "Perfect for food enthusiasts, this journey is a flavorful celebration of Sri Lanka's heritage." → removed
- "flavors" → "flavours" (only if you standardise on British spelling)

---

### Claims already on the site to confirm

These are claims in copy the owner already published. The drafts either kept them as written or left them out. Each one needs a yes or a removal.

**FAQ (`components/common/faq-data.ts`, live in the site-wide FAQ)**

1. "Yes, we offer complimentary pickup and drop-off from hotels in Habarana, Sigiriya, and Dambulla. For hotels outside these areas, there may be an additional charge." This conflicts with "confirm whether entrance tickets, pickup, and refreshments are included before booking" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari) **[C7]**. The drafts list the three towns but do not say "complimentary".
2. "Our jeeps can comfortably accommodate up to 6 passengers plus the driver and guide." This conflicts with "Your driver-guide" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari) **[C9]**.
3. "Water bottles and snacks are provided on all our safaris." This conflicts with "Bring drinking water" (https://www.ceylonsafari.com/blogs/habarana-jeep-safari) **[C8]**.
4. "We accept cash, major credit cards, and bank transfers. For credit card payments, a small processing fee may apply." Do you take cards today? How much is the fee?
5. "The best time for wildlife safaris in Habarana is from May to October … The famous Elephant Gathering peaks between July and September." Also "1-2 weeks during peak season (December-January and July-August)". The first is a wildlife season and the second reads like a tourist season. Neither matches the Kaudulla post ("between August and December") or the Hurulu package ("from April to September") **[C1]**.
6. "We provide extra safety measures and engaging activities for young wildlife enthusiasts." What are they? If you can't name them, remove the sentence.
7. Cancellation. The live site still shows "Cancellations made 48 hours or more before the scheduled safari. Cancellations less than 24 hours in advance are non-refundable." The first sentence is unfinished, and nothing covers 24 to 48 hours. The repo already replaces it with "Cancellation terms depend on the tour and the date…" pending your written policy. Both conflict with the "Free Cancellation" badge on every package page **[C15]**.

**Package pages (all five, live booking panel)**

8. "Free Cancellation". Is any cancellation free, and up to when? **[C15]**
9. "Instant Confirmation" on the same panel as "we'll get back to you within 24 hours with pricing and availability". Both cannot be true **[C16]**.
10. "Available daily, subject to weather conditions". Confirm for each package.
11. Included items on the three safaris: "Luxury Jeep with Seatbelts", "Snack & Water", "Insurance Covered", "Expert Safari Guide".
    - "Luxury": the blogs describe "4x4 open-top jeep safaris" (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures) and "an open jeep safari" (https://www.ceylonsafari.com/blogs/minneriya-jeep-safari-habarana). Is the jeep open-top? What makes it luxury?
    - "Insurance Covered": what insurance, who holds it, and what does it cover? The home and packages listing pages also show "insurance coverd" (typo) on the Sigiriya City Tours card.
    - "Expert Safari Guide": a separate guide, or the driver-guide? **[C9]**
12. "1-6 people per jeep" on the Village Experience Tour and the Sri Lankan Culinary Journey. Neither tour describes a jeep.
13. Village included list: "Traditional Lunch", "Boat Ride", "Tuk-Tuk Ride", "Village Guide", "Cooking Demonstration". There is no "Tractor Ride", though the description promises one **[C14]**.
14. Culinary included list: "Hands-on Cooking Class", "Traditional Recipes", "Fresh Ingredients", "Local Chef Guide", "Cultural Insights". "Cultural Insights" is vague. Is it the "cultural storytelling" in the description?

**"Private"**

15. The home page headline is "Private Jeep Safaris in Habarana & Minneriya". The Habarana blog has "What to expect on a private safari" and the cooking blog has "this private cooking class". None of the package pages say private. Is every jeep and class only for the booking group? The drafts leave "private" out.

**Blog claims and factual errors (flagged, not fixed)**

16. "Kaudulla is historically important as it is one of the famed 16 irrigation tanks built by King Mahasen in 1959" (https://www.ceylonsafari.com/blogs/kaudulla-national-park-jeep-safari). Two other posts put King Mahasen in "the 3rd century AD", so "1959" is wrong on the site's own evidence **[C6]**.
17. Species counts are identical for two parks. Kaudulla has "24 species of mammals … 160 of species of birds … 25 species of reptiles" (https://www.ceylonsafari.com/blogs/kaudulla-national-park-jeep-safari). Minneriya has "over 24 mammal species, 160 bird species, and 25 reptile species" (https://www.ceylonsafari.com/blogs/minneriya-jeep-safari-habarana). One set is probably copied.
18. Superlatives about the Minneriya gathering: "the world's largest gathering of wild Asian elephants" (package), "the largest annual congregation of Asian wild elephants on Earth" (duplicate post) and "one of the largest wild elephant gatherings in Asia" (comparison post) **[C4]**.
19. Herd size: "200–300 wild elephants" vs "up to 300 to 700 elephants" **[C2]**.
20. The comparison post (https://www.ceylonsafari.com/blogs/minneriya-kaudulla-and-hurulu-eco-park-wildlife-adventures) says "High success rate of elephant sightings", "The highest chance to see elephants", "Affordable safari options" and "Eco-friendly wildlife tourism". The Habarana post says "Ceylon Safari does not promise specific sightings". Keep the strong wording, or soften it to match?
21. "We promise to Provide your Safari Experience With Superior service of a different Kind" (https://www.ceylonsafari.com/blogs/kaudulla-national-park-jeep-safari). This is an unsupported promise, and it has typos ("Nationla", "Lets").
22. "nestled in the enchanting landscapes of sigiriya, we offer thrilling Jeep Safaris through three of the country's most captivating national parks" (https://www.ceylonsafari.com/blogs/minneriya-jeep-safari). The business address is Habarana, and Hurulu is an eco park, not a national park.
23. The page https://www.ceylonsafari.com/blogs/minneriya-jeep-safari has a search description that promises "practical timing, wildlife, pickup, and responsible viewing advice", but the body is four short paragraphs with none of that. The body also has many typos: "neaby", "designted", "natioanal", "disconetted", "gate way", "there natural habitat", "diserve fauna", "exhilarting".
24. Other blog typos seen: "vegitables" and "experiance" (https://www.ceylonsafari.com/blogs/cooking-class-habarana); the heading "MInneriya Jeep Safari Habarana" (https://www.ceylonsafari.com/blogs/minneriya-jeep-safari-habarana); "Kaudula" in the Kaudulla post.

### Contradiction index

| Tag | Topic | Conflicting sources | Packages affected |
|---|---|---|---|
| C1 | Season months | "From May to October" (Minneriya package, FAQ); "From July to October" and "July to September: Peak" (comparison post); "peaking in August and September" (duplicate Minneriya post); "from April to September" (Hurulu package); "between August and December" (Kaudulla post); "peak season (December-January and July-August)" (FAQ) | Minneriya, Kaudulla, Hurulu |
| C2 | Minneriya herd size | "200–300" (comparison post) vs "300 to 700" (duplicate Minneriya post) | Minneriya |
| C3 | Cooking class length | "3-4 hours" (package) vs "2 or 3 hours" (cooking post) | Culinary |
| C4 | Size of the gathering | "the world's largest" (package) vs "one of the largest … in Asia" (comparison post) | Minneriya |
| C5 | Kaudulla landscape | "evergreen forests" (package) vs "dry scrub forest" (Kaudulla post) | Kaudulla |
| C6 | Kaudulla tank date | "built by King Mahasen in 1959" vs Mahasen "in the 3rd century AD" | Kaudulla |
| C7 | Pickup cost | "complimentary pickup" (FAQ) vs "confirm whether … pickup … [is] included" (Habarana post) | All safaris |
| C8 | Water and snacks | "provided on all our safaris" (FAQ) and "Snack & Water" (packages) vs "Bring drinking water" (Habarana post) | All safaris |
| C9 | Driver and guide | "the driver and guide" (FAQ) vs "Your driver-guide" (Habarana post) | All safaris |
| C10 | Afternoon slot vs duration | "3:00 PM – 6:30 PM" (comparison post) vs "3 hours" (packages) | All safaris |
| C11 | Which park | Park-specific packages vs "recommends the park … on the day" (Habarana post) | All safaris |
| C12 | Cooking group size | "1-6 people" (package) vs "groups of two or more" (cooking post) | Culinary |
| C13 | Cooking dish list | "5 vegitables curries … chicken curry" vs "4-5 vegetable curries … chicken or fish curry" (same post) | Culinary |
| C14 | Tractor ride | Description "tuk-tuk and tractor rides" vs included list "Tuk-Tuk Ride" only | Village |
| C15 | Cancellation | "Free Cancellation" (packages) vs "less than 24 hours … non-refundable" (live FAQ) | All five |
| C16 | Confirmation speed | "Instant Confirmation" vs "within 24 hours" (same panel) | All five |
| C17 | Village tour name | "Cultural Village Tour" (description) vs "Village Experience Tour" (package name) | Village |

### Content gate note

Each safari page needs at least 500 words that appear on no other package page. This draft does not meet that gate on its own. Measured on the paste-ready blocks alone, there are about 450 package-unique words for Minneriya, 420 for Kaudulla and 370 for Hurulu. The unique text comes mostly from highlights, FAQs and the proposed description. The itinerary, what-to-bring and pickup blocks repeat across all three safaris by design, so they add no unique words. The gate is met only after the owner answers the questions above, confirms the facts, and enters the content. Park-specific details are the obvious place to grow each page: real start times, the season, the herd size, the Kaudulla boat ride and the tank's history. Any text added later must meet the same rule as this draft. It comes from the owner, not from general knowledge.
