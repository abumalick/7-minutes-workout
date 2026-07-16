import type { ExerciseInstruction } from "./exercise";

export const instructions: ExerciseInstruction[] = [
  {
    slug: "01-figure-4-droite",
    label: "Figure 4 (droite)",
    duration: 30,
    text: "Sur le dos, placez le pied droit sur le genou gauche. Passez la main entre les jambes, attrapez l'arrière de la cuisse gauche et tirez doucement le genou vers vous. Tenez sans douleur.",
    image: {
      accent: "the right glute and piriformis",
      view: "side profile",
      pose: "lying on back; the right ankle crossed over the left thigh just above the knee forming a figure-four, both hands reaching around behind the left thigh (clasped behind the hamstring, never on top) to draw the left knee toward the chest; head resting on the floor.",
    },
  },
  {
    slug: "02-figure-4-gauche",
    label: "Figure 4 (gauche)",
    duration: 30,
    text: "Sur le dos, placez le pied gauche sur le genou droit. Passez la main entre les jambes, attrapez l'arrière de la cuisse droite et tirez doucement le genou vers vous. Tenez sans douleur.",
    image: {
      accent: "the left glute and piriformis",
      view: "side profile",
      pose: "lying on back; the left ankle crossed over the right thigh just above the knee forming a figure-four, both hands reaching around behind the right thigh (clasped behind the hamstring, never on top) to draw the right knee toward the chest; head resting on the floor.",
    },
  },
  {
    slug: "03-piriforme-droit",
    label: "Piriforme (droit)",
    duration: 30,
    text: "Pied droit posé sur le genou gauche. Attrapez le genou droit à deux mains et tirez-le vers l'épaule gauche, puis relâchez. Répétez en douceur.",
    image: {
      accent: "the right glute and piriformis",
      view: "three-quarter view from above",
      pose: "lying on back; the right ankle crossed over the left thigh in a figure-four, both hands clasped around the right knee drawing it diagonally across the body toward the left shoulder; head resting down.",
    },
  },
  {
    slug: "04-piriforme-gauche",
    label: "Piriforme (gauche)",
    duration: 30,
    text: "Pied gauche posé sur le genou droit. Attrapez le genou gauche à deux mains et tirez-le vers l'épaule droite, puis relâchez. Répétez en douceur.",
    image: {
      accent: "the left glute and piriformis",
      view: "three-quarter view from above",
      pose: "lying on back; the left ankle crossed over the right thigh in a figure-four, both hands clasped around the left knee drawing it diagonally across the body toward the right shoulder; head resting down.",
    },
  },
  {
    slug: "05-jambe-tendue-alterne",
    label: "Jambe tendue (alterné)",
    duration: 30,
    text: "Allongé sur le dos, jambes tendues. Levez une jambe bien droite en gardant le bas du dos plaqué au sol, redescendez, puis alternez avec l'autre jambe.",
    image: {
      accent: "the hamstring of the raised leg",
      view: "side profile",
      pose: "lying flat on back, arms resting at the sides; the right leg lifted straight toward the ceiling with the knee fully extended while the left leg stays flat on the floor; lower back and glutes kept flat on the ground.",
    },
  },
  {
    slug: "06-glisse-ischios-droit",
    label: "Glissé ischios (droit)",
    duration: 30,
    text: "Sur le dos, ramenez la cuisse droite à la verticale, mains derrière la cuisse. Tendez la jambe vers le plafond puis repliez-la, l'autre jambe restant au sol.",
    image: {
      accent: "the right hamstring",
      view: "side profile",
      pose: "lying on back; the right thigh raised perpendicular to the floor with both hands clasped behind the thigh, the lower leg extending up toward the ceiling then bending at the knee; the left leg flat on the floor.",
    },
  },
  {
    slug: "07-glisse-ischios-gauche",
    label: "Glissé ischios (gauche)",
    duration: 30,
    text: "Sur le dos, ramenez la cuisse gauche à la verticale, mains derrière la cuisse. Tendez la jambe vers le plafond puis repliez-la, l'autre jambe restant au sol.",
    image: {
      accent: "the left hamstring",
      view: "side profile",
      pose: "lying on back; the left thigh raised perpendicular to the floor with both hands clasped behind the thigh, the lower leg extending up toward the ceiling then bending at the knee; the right leg flat on the floor.",
    },
  },
  {
    slug: "08-genou-croise-droite",
    label: "Genou croisé (droite)",
    duration: 30,
    text: "Allongé sur le dos, jambes tendues. Croisez la jambe droite par-dessus la gauche et tournez doucement vers ce côté en vous aidant du coude. Tenez la position.",
    image: {
      accent: "the right outer hip and glute",
      view: "three-quarter view from above",
      pose: "lying on back in a supine spinal twist; the right knee lifted and crossed over the body toward the left side, the left hand resting on the outside of the right knee to guide it down, both shoulders staying grounded.",
    },
  },
  {
    slug: "09-genou-croise-gauche",
    label: "Genou croisé (gauche)",
    duration: 30,
    text: "Allongé sur le dos, jambes tendues. Croisez la jambe gauche par-dessus la droite et tournez doucement vers ce côté en vous aidant du coude. Tenez la position.",
    image: {
      accent: "the left outer hip and glute",
      view: "three-quarter view from above",
      pose: "lying on back in a supine spinal twist; the left knee lifted and crossed over the body toward the right side, the right hand resting on the outside of the left knee to guide it down, both shoulders staying grounded.",
    },
  },
  {
    slug: "10-90-90-droite",
    label: "Étirement 90-90 (droite)",
    duration: 30,
    text: "Assis, les deux genoux pliés à 90 degrés, jambes ouvertes. Amenez la jambe droite derrière vous en gardant les deux genoux à angle droit. Tenez.",
    image: {
      accent: "the right hip rotators and glute",
      view: "three-quarter view from above",
      pose: "seated on the floor; the left leg in front with the knee bent 90 degrees and shin across the body, the right leg positioned behind with the knee bent 90 degrees and thigh rotated inward; torso upright, leaning slightly forward over the front shin.",
    },
  },
  {
    slug: "11-90-90-gauche",
    label: "Étirement 90-90 (gauche)",
    duration: 30,
    text: "Assis, les deux genoux pliés à 90 degrés, jambes ouvertes. Amenez la jambe gauche derrière vous en gardant les deux genoux à angle droit. Tenez.",
    image: {
      accent: "the left hip rotators and glute",
      view: "three-quarter view from above",
      pose: "seated on the floor; the right leg in front with the knee bent 90 degrees and shin across the body, the left leg positioned behind with the knee bent 90 degrees and thigh rotated inward; torso upright, leaning slightly forward over the front shin.",
    },
  },
  {
    slug: "12-lever-jambe-lateral-droit",
    label: "Lever de jambe latéral (côté droit)",
    duration: 30,
    text: "Allongé sur le côté droit, jambes tendues et empilées. Levez lentement la jambe du dessus avec les fessiers, sans élan, puis redescendez-la.",
    image: {
      accent: "the left outer hip and gluteus medius",
      view: "side profile",
      pose: "lying on the right side, body in one straight line, the right (bottom) arm extended along the floor to support the head; both legs straight and stacked, the top (left) leg lifted upward with the foot held flat, engaging the outer hip.",
    },
  },
  {
    slug: "13-coquille-droit",
    label: "Coquille (côté droit)",
    duration: 30,
    text: "Sur le côté droit, genoux pliés à 90 degrés et pieds joints. Ouvrez le genou du dessus sans basculer le bassin, puis refermez. Répétez.",
    image: {
      accent: "the left gluteus medius",
      view: "side profile",
      pose: "lying on the right side, knees bent about 90 degrees and stacked with the feet together; the top (left) knee rotating open toward the ceiling like a clam shell while the feet stay touching and the pelvis stays stable; the bottom arm supporting the head.",
    },
  },
  {
    slug: "14-lever-jambe-lateral-gauche",
    label: "Lever de jambe latéral (côté gauche)",
    duration: 30,
    text: "Allongé sur le côté gauche, jambes tendues et empilées. Levez lentement la jambe du dessus avec les fessiers, sans élan, puis redescendez-la.",
    image: {
      accent: "the right outer hip and gluteus medius",
      view: "side profile",
      pose: "lying on the left side, body in one straight line, the left (bottom) arm extended along the floor to support the head; both legs straight and stacked, the top (right) leg lifted upward with the foot held flat, engaging the outer hip.",
    },
  },
  {
    slug: "15-coquille-gauche",
    label: "Coquille (côté gauche)",
    duration: 30,
    text: "Sur le côté gauche, genoux pliés à 90 degrés et pieds joints. Ouvrez le genou du dessus sans basculer le bassin, puis refermez. Répétez.",
    image: {
      accent: "the right gluteus medius",
      view: "side profile",
      pose: "lying on the left side, knees bent about 90 degrees and stacked with the feet together; the top (right) knee rotating open toward the ceiling like a clam shell while the feet stay touching and the pelvis stays stable; the bottom arm supporting the head.",
    },
  },
  {
    slug: "16-extension-hanche-quadrupede",
    label: "Extension de hanche à 4 pattes (alterné)",
    duration: 30,
    text: "À quatre pattes, dos bien droit. Tendez une jambe vers l'arrière en serrant le fessier, sans cambrer ni tourner le bassin. Redescendez et alternez.",
    image: {
      accent: "the right glute and hamstring",
      view: "side profile",
      pose: "on hands and knees in a quadruped position with a flat, level back; the right leg extended straight back and lifted to hip height, driving the heel backward so head, spine and leg form one straight line; hips level with no arching.",
    },
  },
];
