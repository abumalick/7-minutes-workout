import type { ExerciseInstruction } from "./exercise";

export const instructions: ExerciseInstruction[] = [
  {
    slug: "01-orteil-assis-droite",
    label: "Toucher d'orteil assis (droite)",
    duration: 30,
    text: "Assis, une jambe tendue, penchez-vous vers le pied en gardant le dos long.",
    image: {
      accent: "the right hamstring and calf",
      view: "side profile",
      pose: "seated on the floor in profile; the right leg extended straight forward, the other leg bent with the knee out to the side; torso folding forward with a long back, both hands reaching toward the right toes.",
    },
  },
  {
    slug: "02-orteil-assis-gauche",
    label: "Toucher d'orteil assis (gauche)",
    duration: 30,
    text: "Même mouvement, de l'autre côté.",
    image: {
      accent: "the left hamstring and calf",
      view: "side profile",
      pose: "seated on the floor in profile; the left leg extended straight forward, the other leg bent with the knee out to the side; torso folding forward with a long back, both hands reaching toward the left toes.",
    },
  },
  {
    slug: "03-orteil-jambe-repliee-droite",
    label: "Toucher d'orteil, jambe repliée (droite)",
    duration: 30,
    text: "Une jambe tendue, l'autre pied contre la cuisse, penchez-vous vers l'orteil.",
    image: {
      accent: "the right hamstring",
      view: "side profile",
      pose: "seated on the floor in profile; the right leg extended straight, the sole of the other foot resting against the inner thigh of the extended leg; torso folding forward over the extended leg, hands reaching toward the right foot.",
    },
  },
  {
    slug: "04-orteil-jambe-repliee-gauche",
    label: "Toucher d'orteil, jambe repliée (gauche)",
    duration: 30,
    text: "Même mouvement, de l'autre côté.",
    image: {
      accent: "the left hamstring",
      view: "side profile",
      pose: "seated on the floor in profile; the left leg extended straight, the sole of the other foot resting against the inner thigh of the extended leg; torso folding forward over the extended leg, hands reaching toward the left foot.",
    },
  },
  {
    slug: "05-papillon",
    label: "Papillon",
    duration: 30,
    text: "Plantes de pieds jointes, genoux vers le sol, penchez-vous doucement.",
    image: {
      accent: "the inner thighs and groin",
      view: "front view",
      pose: "seated on the floor facing the viewer; soles of the feet pressed together, knees dropped out to the sides toward the floor; hands holding the feet, torso leaning slightly forward with a straight back.",
    },
  },
  {
    slug: "06-torsion-assise-droite",
    label: "Torsion assise (droite)",
    duration: 30,
    text: "Assis, croisez la jambe et tournez le buste pour étirer les fessiers et le dos.",
    image: {
      accent: "the right glute and the spine",
      view: "front view",
      pose: "seated on the floor facing the viewer; the right leg bent and crossed over the other extended leg with the foot flat on the floor; torso upright and twisted toward the right side, the opposite elbow pressing against the outside of the bent knee, the other hand on the floor behind.",
    },
  },
  {
    slug: "07-torsion-assise-gauche",
    label: "Torsion assise (gauche)",
    duration: 30,
    text: "Même torsion, de l'autre côté.",
    image: {
      accent: "the left glute and the spine",
      view: "front view",
      pose: "seated on the floor facing the viewer; the left leg bent and crossed over the other extended leg with the foot flat on the floor; torso upright and twisted toward the left side, the opposite elbow pressing against the outside of the bent knee, the other hand on the floor behind.",
    },
  },
  {
    slug: "08-talon-fesse-droite",
    label: "Talon à la fesse, allongé (droite)",
    duration: 30,
    text: "Allongé, ramenez le talon vers la fesse pour étirer le quadriceps.",
    image: {
      accent: "the right quadriceps",
      view: "side profile",
      pose: "lying face down on the floor in profile; one leg straight; the right knee bent with the heel pulled toward the buttock, the right hand reaching back to hold the right ankle, head resting on the other forearm.",
    },
  },
  {
    slug: "09-talon-fesse-gauche",
    label: "Talon à la fesse, allongé (gauche)",
    duration: 30,
    text: "Même étirement, de l'autre côté.",
    image: {
      accent: "the left quadriceps",
      view: "side profile",
      pose: "lying face down on the floor in profile; one leg straight; the left knee bent with the heel pulled toward the buttock, the left hand reaching back to hold the left ankle, head resting on the other forearm.",
    },
  },
  {
    slug: "10-pigeon-droite",
    label: "Pigeon (droite)",
    duration: 45,
    text: "Jambe avant repliée devant vous, jambe arrière tendue, buste incliné vers l'avant.",
    image: {
      accent: "the right hip and glute",
      view: "side profile",
      pose: "floor pigeon pose in profile; the right shin folded in front of the body, knee bent, the other leg extended straight behind on the floor; torso folded forward over the front shin, forearms resting on the floor.",
    },
  },
  {
    slug: "11-pigeon-gauche",
    label: "Pigeon (gauche)",
    duration: 45,
    text: "Même posture, de l'autre côté.",
    image: {
      accent: "the left hip and glute",
      view: "side profile",
      pose: "floor pigeon pose in profile; the left shin folded in front of the body, knee bent, the other leg extended straight behind on the floor; torso folded forward over the front shin, forearms resting on the floor.",
    },
  },
  {
    slug: "12-squat-profond",
    label: "Squat profond",
    duration: 45,
    text: "Accroupi, talons au sol, coudes poussant les genoux vers l'extérieur.",
    image: {
      accent: "the hips, groin and ankles",
      view: "front view",
      pose: "deep squat facing the viewer; feet slightly wider than shoulders with heels flat on the floor; hands pressed together at the chest with the elbows pushing the knees outward; back straight.",
    },
  },
];
