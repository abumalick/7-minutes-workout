import type { ExerciseInstruction } from "./exercise";

// Texts are deliberately terse: the spoken clip is "<label>. <text>" and plays during
// the 10s rest that precedes the exercise. A rest grows to fit its clip
// (ceil(spoken) + 2), so anything over ~8s spoken would stretch the rests and dilute
// the short-rest interval protocol this workout is built on.
export const instructions: ExerciseInstruction[] = [
  {
    slug: "01-jumping-jacks",
    label: "Jumping jacks",
    duration: 30,
    text: "Sautez en écartant les jambes et en levant les bras au-dessus de la tête.",
    image: {
      accent: "the shoulders and the outer thighs",
      view: "front view",
      pose: "standing, captured mid-jump of a jumping jack: both legs spread wide apart in a V with the feet just off the ground, both arms swung straight up overhead and slightly apart, body upright and open.",
    },
  },
  {
    slug: "02-chaise-contre-le-mur",
    label: "Chaise contre le mur",
    duration: 30,
    text: "Dos plaqué au mur, cuisses à l'horizontale. Tenez la position.",
    image: {
      accent: "the quadriceps (front of the thighs)",
      view: "side profile",
      pose: "a wall sit: the whole back and head flat against a plain vertical wall drawn as a simple flat surface, hips and knees bent 90 degrees so the thighs are horizontal and the shins vertical, feet flat on the floor, arms hanging relaxed at the sides.",
    },
  },
  {
    slug: "03-pompes",
    label: "Pompes",
    duration: 30,
    text: "Corps gainé, descendez la poitrine vers le sol, puis remontez.",
    image: {
      accent: "the chest and the triceps",
      view: "side profile",
      pose: "a push-up at the bottom of the movement: hands and toes on the floor, elbows bent so the chest hovers just above the ground, the body held in one straight braced line from head to heels.",
    },
  },
  {
    slug: "04-crunch-abdominal",
    label: "Crunch abdominal",
    duration: 30,
    text: "Allongé, genoux pliés, décollez les épaules vers vos genoux.",
    image: {
      accent: "the abdominal muscles",
      view: "side profile",
      pose: "lying on the back on the floor with the knees bent and the feet flat; the shoulders and upper back curled up off the floor toward the knees, hands lightly at the temples, lower back staying down.",
    },
  },
  {
    slug: "05-montee-sur-chaise",
    label: "Montée sur chaise",
    duration: 30,
    text: "Montez un pied sur la chaise, puis l'autre, et redescendez.",
    image: {
      accent: "the quadriceps and the glutes",
      view: "side profile",
      pose: "a step-up onto a plain simple chair: one foot planted flat on the chair seat with that knee bent, the body rising up over it, the other leg trailing below with the toe still near the floor, torso upright.",
    },
  },
  {
    slug: "06-squats",
    label: "Squats",
    duration: 30,
    text: "Pieds écartés, descendez les hanches comme pour vous asseoir.",
    image: {
      accent: "the quadriceps and the glutes",
      view: "side profile",
      pose: "a bodyweight squat at depth: feet hip-width apart and flat on the floor, hips pushed back and down until the thighs are close to horizontal, chest lifted and back straight, both arms extended forward for balance.",
    },
  },
  {
    slug: "07-dips-triceps",
    label: "Dips triceps sur chaise",
    duration: 30,
    text: "Dos à la chaise, mains sur le bord, fléchissez les coudes.",
    image: {
      accent: "the triceps (back of the upper arms)",
      view: "side profile",
      pose: "a triceps dip with the back to a plain simple chair: both hands gripping the front edge of the chair seat just behind the hips, legs extended forward with the heels on the floor, elbows bent so the hips sink below the level of the seat.",
    },
  },
  {
    slug: "08-planche",
    label: "Planche",
    duration: 30,
    text: "Sur les avant-bras, corps aligné des épaules aux talons. Tenez.",
    image: {
      accent: "the abdominal muscles and the core",
      view: "side profile",
      pose: "a forearm plank: both forearms flat on the floor with the elbows directly under the shoulders, toes on the floor, the body held in one straight rigid line from the head through the hips to the heels.",
    },
  },
  {
    slug: "09-montees-de-genoux",
    label: "Montées de genoux sur place",
    duration: 30,
    text: "Courez sur place en montant les genoux à hauteur de hanches.",
    image: {
      accent: "the hip flexors and the front of the thighs",
      view: "front view",
      pose: "running in place with high knees: one knee driven up to hip height with that thigh horizontal, the other foot on the ground, the opposite arm swung forward with the elbow bent, torso tall.",
    },
  },
  {
    slug: "10-fentes",
    label: "Fentes",
    duration: 30,
    text: "Avancez un pied et descendez le genou arrière vers le sol.",
    image: {
      accent: "the quadriceps and the glutes",
      view: "side profile",
      pose: "a forward lunge at the bottom: one leg stepped forward with the knee bent 90 degrees and that thigh horizontal, the back knee lowered to hover just above the floor, torso upright and tall, arms at the sides.",
    },
  },
  {
    slug: "11-pompe-avec-rotation",
    label: "Pompe avec rotation",
    duration: 30,
    text: "Une pompe, puis tournez le buste et tendez un bras au ciel.",
    image: {
      accent: "the chest and the obliques",
      view: "three-quarter view",
      pose: "the rotation half of a push-up with rotation: from the top of a push-up the body has turned onto one side, supported on a single straight arm with the feet stacked, the free arm extended straight up toward the ceiling so the arms form one vertical line, body straight from head to heels.",
    },
  },
  {
    slug: "12-planche-laterale-gauche",
    label: "Planche latérale (gauche)",
    duration: 30,
    text: "Sur l'avant-bras gauche, hanches décollées, corps bien aligné. Tenez.",
    image: {
      accent: "the obliques on the left side of the trunk",
      view: "front view",
      pose: "a side plank supported on the LEFT forearm, with the head end of the body at the LEFT of the frame and the stacked feet at the RIGHT: the forearm lies flat along the floor with the elbow bent 90 degrees directly beneath the shoulder (the upper arm vertical, NOT a straight propped arm), the hips lifted high so the body makes one straight rising diagonal from head to heels, the free arm resting along the top hip.",
    },
  },
  {
    slug: "13-planche-laterale-droite",
    label: "Planche latérale (droite)",
    duration: 30,
    text: "Sur l'avant-bras droit, hanches décollées, corps bien aligné. Tenez.",
    image: {
      accent: "the obliques on the right side of the trunk",
      view: "front view",
      pose: "a side plank supported on the RIGHT forearm, with the head end of the body at the RIGHT of the frame and the stacked feet at the LEFT: the forearm lies flat along the floor with the elbow bent 90 degrees directly beneath the shoulder (the upper arm vertical, NOT a straight propped arm), the hips lifted high so the body makes one straight rising diagonal from head to heels, the free arm resting along the top hip.",
    },
  },
];
