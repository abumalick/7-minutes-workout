import type { ExerciseInstruction } from "./exercise";

export const instructions: ExerciseInstruction[] = [
  {
    slug: "01-decharge",
    label: "Position de décharge",
    duration: 120,
    text: "Sur le dos, posez les mollets sur une chaise ou un canapé, hanches et genoux à quatre-vingt-dix degrés. Laissez le bas du dos se relâcher au sol et respirez lentement.",
    image: {
      accent: "the lower back",
      view: "side profile",
      pose: "side profile, the whole body drawn as one continuous figure in front of a plain low rectangular ottoman (a simple solid block, no backrest, no legs); the person lies on their back on the floor with head, shoulders and torso flat on the ground and arms alongside the body, then the thighs turn straight upward at a right angle, and the calves continue horizontally forward across the flat top of the ottoman with the knees bent square directly above its near edge — the body outline forms a clear right-angled step, and the ottoman sits entirely behind and below the legs so the figure stays fully readable.",
    },
  },
  // A2 — échelle d'extension, 4 crans. On n'en fait qu'UN par séance, et on ne monte
  // d'un cran que lorsque le cran actuel ne réveille plus la douleur de jambe — sur
  // plusieurs jours, jamais dans la même séance. Le cran actif ci-dessous est le 2.
  //
  // Cran 1 — « Ventre à plat », 150 s
  //   "Allongé sur le ventre, à plat, la tête tournée d'un côté. Ne faites rien d'autre
  //    que respirer et laisser le bas du dos se relâcher. C'est un exercice, même si ça
  //    n'y ressemble pas."
  //   pose : lying face down (prone) flat on the floor, arms relaxed alongside the body,
  //   head turned to one side, hips and legs fully in contact with the ground.
  //
  // Cran 2 — « Extension sur le ventre » (sphinx), 150 s  ← ACTIF
  //
  // Cran 3 — « Extension sur les bras tendus », 60 s (10 répétitions)
  //   "Sur le ventre, mains sous les épaules. Poussez sur les bras pour monter le buste
  //    en gardant le bassin au sol, puis redescendez. Dix fois, sans forcer la fin de
  //    course."
  //   pose : lying face down (prone), both arms pushing straight and locked to lift the
  //   chest high off the floor while the pelvis and thighs stay pressed to the ground,
  //   the lower back arching (a cobra / press-up, not a plank).
  //
  // Cran 4 — comme le cran 3, plus de petits roulements du bassin d'un côté à l'autre
  //   entre les répétitions ; même durée, même image que le cran 3.
  //
  // Pour changer de cran : remplacer label / duration / text / image.pose ci-dessous,
  // puis régénérer les deux assets de ce slug —
  //   ELEVENLABS_API_KEY=… ELEVENLABS_VOICE_ID=onwK4e9ZLuTAKqWW03F9 \
  //     node scripts/generate-voice.ts back-phase-a --force 02-extension-ventre
  //   OPENAI_API_KEY=… node scripts/generate-images.ts back-phase-a --force 02-extension-ventre
  // (le mp3 dit le label avant la consigne : le regénérer n'est pas optionnel.)
  {
    slug: "02-extension-ventre",
    label: "Extension sur le ventre",
    duration: 150,
    text: "Sur le ventre, appuyé sur les avant-bras, le bassin reste au sol. Laissez le bas du dos se creuser sans forcer. La douleur doit remonter vers la fesse, jamais descendre dans la jambe.",
    image: {
      accent: "the lower back",
      view: "side profile",
      pose: "lying face down (prone), chest and head lifted in a gentle back extension propped on the forearms, hips staying on the floor.",
    },
  },
  {
    slug: "03-glisse-sciatique-droit",
    label: "Glissements du sciatique (droite)",
    duration: 60,
    text: "Assis au bord de la chaise, jambe droite tendue devant. Tendez le genou en ramenant les orteils vers vous et laissez la tête partir en arrière, puis pliez le genou en pointant le pied et le menton vers la poitrine. Aucune sensation d'étirement.",
    image: {
      accent: "the sciatic nerve down the back of the right leg",
      view: "side profile",
      pose: "seated on the front edge of a plain simple chair with the back tall and the hands resting on the thighs; the right leg extended forward with the knee straight and the foot pulled back so the toes point up toward the ceiling, the left foot flat on the floor; at the same time the head tipped gently backward, chin away from the chest.",
    },
  },
  {
    slug: "04-bascule-bassin",
    label: "Bascule du bassin",
    duration: 60,
    text: "Sur le dos, genoux pliés. À l'inspiration, cambrez légèrement le bas du dos ; à l'expiration, plaquez-le sur le tapis. Amplitude douce, la moitié de ce que vous pourriez faire.",
    image: {
      accent: "the lower back and lumbar spine",
      view: "side profile",
      pose: "lying on back in profile; knees bent, feet flat, hips down, arms alongside, pressing the lower back gently into the floor (pelvic tilt).",
    },
  },
  {
    slug: "05-dos-de-chat",
    label: "Dos de chat",
    duration: 45,
    text: "À quatre pattes, alternez lentement dos creusé et dos arrondi, sur la respiration. Restez court sur la partie arrondie et gardez une amplitude confortable.",
    image: {
      accent: "the rounded spine (mid and lower back)",
      view: "side profile",
      pose: 'on all fours (quadruped), spine rounded upward into a "cat" arch, head tucked.',
    },
  },
  {
    slug: "06-psoas-droit",
    label: "Psoas iliaque (droit)",
    duration: 45,
    text: "En fente, genou droit au sol, amenez la hanche droite en extension complète pour étirer le psoas ; vous sentez une légère tension au pli de l'aine.",
    image: {
      accent: "the front of the right hip",
      view: "side profile",
      pose: "half-kneeling lunge — right knee down on the floor, left foot forward flat with the front knee bent about 90 degrees, hips pressed forward, torso upright.",
    },
  },
  {
    slug: "07-psoas-gauche",
    label: "Psoas iliaque (gauche)",
    duration: 45,
    text: "Changez de côté, genou gauche au sol, et amenez la hanche gauche en extension complète pour étirer le psoas.",
    image: {
      accent: "the front of the left hip",
      view: "side profile",
      pose: "half-kneeling lunge — left knee down on the floor, right foot forward flat with the front knee bent about 90 degrees, hips pressed forward, torso upright.",
    },
  },
];
