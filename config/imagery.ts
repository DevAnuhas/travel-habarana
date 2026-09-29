const cloudinary = (path: string) =>
  `https://res.cloudinary.com/travelhabarana/image/upload/${path}`

export const imagery = {
  hero: {
    src: cloudinary("v1747225669/1_s6q0hr.jpg"),
    alt: "A herd of wild elephants grazing beside the Minneriya tank",
  },
  guests: [
    {
      src: cloudinary("v1747400857/IMG_8961_ntttrb.jpg"),
      alt: "Guests smiling in a safari jeep",
    },
    {
      src: cloudinary("v1747400887/IMG_0422_g3orcr.jpg"),
      alt: "A group of guests standing up in an open jeep",
    },
    {
      src: cloudinary("v1747400905/IMG_8953_rirwyz.jpg"),
      alt: "Guests photographing wildlife from the jeep",
    },
    {
      src: cloudinary("v1747225191/cover_yulgqs.jpg"),
      alt: "Safari jeeps lined up on a park track",
    },
  ],
} as const
