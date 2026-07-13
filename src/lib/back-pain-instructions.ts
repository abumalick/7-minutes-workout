import type { ExerciseInstruction } from "./exercise";

export const instructions: ExerciseInstruction[] = [
  {
    slug: "01-flexion-hanche",
    label: "Flexion de hanche (gauche)",
    duration: 30,
    text: "Allongé sur le dos, ramenez un genou vers la poitrine pour assouplir la hanche et le bas du dos, en respirant lentement.",
    image: {
      accent: "the left hip and lower back",
      view: "side profile",
      pose: "lying on back in profile; the left knee pulled toward the chest with both hands around the shin, the right leg extended flat on the floor.",
    },
  },
  {
    slug: "01b-flexion-hanche-droit",
    label: "Flexion de hanche (droite)",
    duration: 30,
    text: "Allongé sur le dos, ramenez un genou vers la poitrine pour assouplir la hanche et le bas du dos, en respirant lentement.",
    image: {
      accent: "the right hip and lower back",
      view: "side profile",
      pose: "lying on back in profile; the right knee pulled toward the chest with both hands around the shin, the left leg extended flat on the floor.",
    },
  },
  {
    slug: "02-double-flexion-hanche",
    label: "Double flexion de hanche",
    duration: 30,
    text: "Ramenez les deux genoux vers la poitrine et ajoutez de petites rotations pour détendre la région lombaire.",
    image: {
      accent: "the lower back",
      view: "side profile",
      pose: "lying on back in profile; both knees pulled to the chest, hands clasped around the shins, head resting down.",
    },
  },
  {
    slug: "03-pont-fessier",
    label: "Pont fessier",
    duration: 30,
    text: "Levez les fesses pour renforcer les fessiers, puis redéroulez la colonne vertèbre par vertèbre, du haut vers le bas.",
    image: {
      accent: "the glutes and hips",
      view: "side profile",
      pose: "lying on back in profile; knees bent, feet flat, hips lifted into a bridge forming a straight diagonal from knees to shoulders, arms flat alongside.",
    },
  },
  {
    slug: "04-lordose-cyphose",
    label: "Lordose – cyphose",
    duration: 30,
    text: "À l'inspiration, cambrez le dos ; à l'expiration, plaquez le bas du dos sur le tapis, en dissociant lombaires et bassin.",
    image: {
      accent: "the lower back and lumbar spine",
      view: "side profile",
      pose: "lying on back in profile; knees bent, feet flat, hips down, arms alongside, pressing the lower back gently into the floor (pelvic tilt).",
    },
  },
  {
    slug: "05-rotation",
    label: "Rotation lombaire",
    duration: 30,
    text: "Laissez tomber les genoux d'un côté puis de l'autre pour assouplir en rotation les lombaires et les dorsales.",
    image: {
      accent: "the lower back and obliques",
      view: "side view",
      pose: "lying flat on the back with both arms stretched out wide to the sides on the floor in a T; both knees bent and stacked together, dropped down to one side so the knees rest toward the floor, while the shoulders and upper back stay flat — a gentle lower-spine twist.",
    },
  },
  {
    slug: "06-piriforme-gauche",
    label: "Piriforme (gauche)",
    duration: 30,
    text: "Étirez le muscle piriforme du côté gauche. Vous devez sentir l'étirement au milieu de la fesse.",
    image: {
      accent: "the left gluteal region",
      view: "side profile",
      pose: "lying on the back, head down; the right thigh raised toward the chest with the right knee bent and the right foot off the floor; the left ankle crossed on top of the right thigh just above the knee, the bent left knee splayed open to the side so the two legs form the shape of a number 4; the left arm threaded through the gap between the two legs and the right arm passing around the outside, both hands clasping together behind the right thigh (gripping the back of the thigh) to pull it toward the chest — the arms wrap around the BACK of the thigh and must never rest on top of the leg.",
    },
  },
  {
    slug: "07-piriforme-droit",
    label: "Piriforme (droit)",
    duration: 30,
    text: "Étirez le muscle piriforme du côté droit. Gardez une respiration lente et régulière.",
    image: {
      accent: "the right gluteal region",
      view: "side profile",
      pose: "lying on the back, head down; the left thigh raised toward the chest with the left knee bent and the left foot off the floor; the right ankle crossed on top of the left thigh just above the knee, the bent right knee splayed open to the side so the two legs form the shape of a number 4; the right arm threaded through the gap between the two legs and the left arm passing around the outside, both hands clasping together behind the left thigh (gripping the back of the thigh) to pull it toward the chest — the arms wrap around the BACK of the thigh and must never rest on top of the leg.",
    },
  },
  {
    slug: "08-carre-lombes-gauche",
    label: "Carré des lombes (gauche)",
    duration: 30,
    text: "Assis à côté des talons, inclinez le buste vers la gauche pour étirer le carré des lombes.",
    image: {
      accent: "the left side of the trunk (flank)",
      view: "front view",
      pose: "seated on the floor with both legs folded to one side (side-sitting); the torso leaning over to the right while the left arm reaches up and over the head in a long sideways curve, stretching the left side of the trunk.",
    },
  },
  {
    slug: "09-carre-lombes-droit",
    label: "Carré des lombes (droit)",
    duration: 30,
    text: "Inclinez maintenant le buste vers la droite pour étirer le carré des lombes de l’autre côté.",
    image: {
      accent: "the right side of the trunk (flank)",
      view: "front view",
      pose: "seated on the floor with both legs folded to one side (side-sitting); the torso leaning over to the left while the right arm reaches up and over the head in a long sideways curve, stretching the right side of the trunk.",
    },
  },
  {
    slug: "10-priere",
    label: "Prière",
    duration: 30,
    text: "Reculez les fesses vers les talons et tendez les mains loin devant, comme une prière, pour étirer tout le dos.",
    image: {
      accent: "the whole spine and lower back",
      view: "side profile",
      pose: "child's pose — kneeling with hips sitting back toward the heels, torso folded forward, both arms stretched far forward flat on the floor, head down.",
    },
  },
  {
    slug: "11-dos-de-chat",
    label: "Dos de chat",
    duration: 30,
    text: "À quatre pattes, alternez extension complète à l'expiration et flexion complète à l'inspiration, sans plier les coudes.",
    image: {
      accent: "the rounded spine (mid and lower back)",
      view: "side profile",
      pose: 'on all fours (quadruped), spine rounded upward into a "cat" arch, head tucked.',
    },
  },
  {
    slug: "12-gainage-alterne",
    label: "Gainage alterné",
    duration: 30,
    text: "À quatre pattes, tendez un bras et la jambe opposée, tenez quelques secondes, puis changez de côté.",
    image: {
      accent: "the lower back and core",
      view: "side profile",
      pose: "on all fours in a bird-dog — one arm extended straight forward and the opposite leg extended straight back, forming one horizontal line, torso level.",
    },
  },
  {
    slug: "13-extension-vertebrale",
    label: "Extension vertébrale",
    duration: 30,
    text: "Sur le ventre, montez en extension du dos et faites de petits mouvements de balancier pour assouplir.",
    image: {
      accent: "the lower back",
      view: "side profile",
      pose: "lying face down (prone), chest and head lifted in a gentle back extension propped on the forearms, hips staying on the floor.",
    },
  },
  {
    slug: "14-plan-posterieur",
    label: "Plan postérieur",
    duration: 40,
    text: "Renforcez le plan postérieur en maintenant la position, avec de petits mouvements des membres pour solliciter les muscles.",
    image: {
      accent: "the whole back of the body (back, gluteal region, and hamstrings)",
      view: "side profile",
      pose: "lying face down (prone), arms extended forward past the head and legs lifted off the floor in a shallow arc (superman).",
    },
  },
  {
    slug: "15-psoas-gauche",
    label: "Psoas iliaque (gauche)",
    duration: 30,
    text: "En fente, amenez la hanche gauche en extension complète pour étirer le psoas ; vous sentez une légère tension au pli de l'aine.",
    image: {
      accent: "the front of the left hip",
      view: "side profile",
      pose: "half-kneeling lunge — left knee down on the floor, right foot forward flat with the front knee bent about 90 degrees, hips pressed forward, torso upright.",
    },
  },
  {
    slug: "16-psoas-droit",
    label: "Psoas iliaque (droit)",
    duration: 30,
    text: "Changez de côté et amenez la hanche droite en extension complète pour étirer le psoas.",
    image: {
      accent: "the front of the right hip",
      view: "side profile",
      pose: "half-kneeling lunge — right knee down on the floor, left foot forward flat with the front knee bent about 90 degrees, hips pressed forward, torso upright.",
    },
  },
  {
    slug: "17-anterieure",
    label: "Face antérieure",
    duration: 30,
    text: "Étirez toute la face avant du corps, abdominaux et pectoraux, avec une extension du dos, en tenant la position.",
    image: {
      accent: "the front of the torso — abdominals and chest",
      view: "side profile",
      pose: "kneeling upright on both knees, then arching the back strongly backwards and reaching both hands down and back to touch the heels, pushing the hips and chest forward and tilting the head back so the whole front of the body (abdomen and chest) opens and stretches — a camel-style backbend.",
    },
  },
  {
    slug: "18-accroupi",
    label: "Accroupi",
    duration: 60,
    text: "Accroupissez-vous complètement pour un étirement axial de la colonne ; tenez la position pour relâcher le dos.",
    image: {
      accent: "the lower back and spine",
      view: "slight 3/4 front angle",
      pose: "deep full squat — heels flat on the floor, hips low, torso upright between the knees, arms reaching forward for balance.",
    },
  },
];
