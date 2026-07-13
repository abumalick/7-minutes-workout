import type { ExerciseInstruction } from "./exercise";

export const instructions: ExerciseInstruction[] = [
  {
    slug: "01-etirement-axial",
    label: "Étirement axial",
    duration: 35,
    text: "Assis bien droit, montez les mains le plus haut possible à l'inspiration pour un étirement axial, puis inclinez doucement le buste d'un côté puis de l'autre.",
    image: {
      accent: "the spine and the left side of the trunk (flank)",
      view: "front view",
      pose: "seated upright on a plain simple chair (hips and knees bent about 90 degrees, thighs horizontal); both arms stretched straight overhead with the hands together reaching as high as possible, then the whole torso curving over to one side in a long lateral bend — an axial elongation of the spine with a side stretch.",
    },
  },
  {
    slug: "02-rotation-gauche",
    label: "Rotation (gauche)",
    duration: 25,
    text: "Croisez les jambes et effectuez une rotation du buste vers la gauche, du côté de la jambe supérieure, en gardant le dos droit.",
    image: {
      accent: "the lower back and obliques",
      view: "front view",
      pose: "seated upright on a plain simple chair with one leg crossed over the other; the torso rotated to the left in a seated spinal twist, the head turned to look over the left shoulder, one hand resting on the opposite knee to deepen the twist, back tall.",
    },
  },
  {
    slug: "03-rotation-droite",
    label: "Rotation (droite)",
    duration: 25,
    text: "Changez de côté et effectuez une rotation du buste vers la droite, lentement, sur la respiration.",
    image: {
      accent: "the lower back and obliques",
      view: "front view",
      pose: "seated upright on a plain simple chair with one leg crossed over the other; the torso rotated to the right in a seated spinal twist, the head turned to look over the right shoulder, one hand resting on the opposite knee to deepen the twist, back tall.",
    },
  },
  {
    slug: "04-enroulement-epaules",
    label: "Enroulement des épaules",
    duration: 30,
    text: "Assis ou debout, enroulez les épaules vers l'arrière à l'inspiration pour étirer les petits pectoraux, puis revenez en position neutre à l'expiration.",
    image: {
      accent: "the chest and the front of the shoulders",
      view: "side profile",
      pose: "seated upright on a plain simple chair; both shoulders rolled back and down with the shoulder blades drawn together, the chest opened forward, arms relaxed at the sides.",
    },
  },
  {
    slug: "05-extension-membres-sup",
    label: "Extension des membres supérieurs",
    duration: 25,
    text: "Tendez complètement les bras, les doigts, les poignets et les coudes à l'inspiration pour étirer tout le membre supérieur, puis relâchez à l'expiration.",
    image: {
      accent: "the arms, forearms and hands (the upper limbs)",
      view: "side profile",
      pose: "seated upright on a plain simple chair; both arms extended straight out in front, elbows, wrists and fingers fully straightened and the fingers spread wide, reaching to lengthen the whole upper limb.",
    },
  },
  {
    slug: "06-extension-globale",
    label: "Extension globale",
    duration: 30,
    text: "Sur votre chaise, bombez le torse vers l'avant à l'inspiration en enchaînant une extension cervicale, dorsale et lombaire.",
    image: {
      accent: "the whole spine (neck, upper back and lower back)",
      view: "side profile",
      pose: "seated on the edge of a plain simple chair; the chest lifted and pushed forward and up, the whole spine arching into a gentle backbend from the neck through the upper back to the lower back, the head tilted slightly back.",
    },
  },
  {
    slug: "07-extension-lombaire",
    label: "Extension lombaire",
    duration: 40,
    text: "Placez les mains sur les vertèbres lombaires et effectuez une extension complète du bas du dos, revenez, puis recommencez.",
    image: {
      accent: "the lower back (lumbar spine)",
      view: "side profile",
      pose: "seated upright on a plain simple chair; both hands placed on the lower back over the lumbar vertebrae, gently arching backward into a localized lower-back extension.",
    },
  },
];
