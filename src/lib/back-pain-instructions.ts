export type ExerciseInstruction = {
  slug: string;
  label: string;
  duration: number;
  text: string;
};

export const backPainInstructions: ExerciseInstruction[] = [
  {
    slug: "01-flexion-hanche",
    label: "Flexion de hanche (gauche)",
    duration: 30,
    text: "Allongé sur le dos, ramenez un genou vers la poitrine pour assouplir la hanche et le bas du dos, en respirant lentement.",
  },
  {
    slug: "01b-flexion-hanche-droit",
    label: "Flexion de hanche (droite)",
    duration: 30,
    text: "Allongé sur le dos, ramenez un genou vers la poitrine pour assouplir la hanche et le bas du dos, en respirant lentement.",
  },
  {
    slug: "02-double-flexion-hanche",
    label: "Double flexion de hanche",
    duration: 30,
    text: "Ramenez les deux genoux vers la poitrine et ajoutez de petites rotations pour détendre la région lombaire.",
  },
  {
    slug: "03-pont-fessier",
    label: "Pont fessier",
    duration: 30,
    text: "Levez les fesses pour renforcer les fessiers, puis redéroulez la colonne vertèbre par vertèbre, du haut vers le bas.",
  },
  {
    slug: "04-lordose-cyphose",
    label: "Lordose – cyphose",
    duration: 30,
    text: "À l'inspiration, cambrez le dos ; à l'expiration, plaquez le bas du dos sur le tapis, en dissociant lombaires et bassin.",
  },
  {
    slug: "05-rotation",
    label: "Rotation lombaire",
    duration: 30,
    text: "Laissez tomber les genoux d'un côté puis de l'autre pour assouplir en rotation les lombaires et les dorsales.",
  },
  {
    slug: "06-piriforme-gauche",
    label: "Piriforme (gauche)",
    duration: 30,
    text: "Étirez le muscle piriforme du côté gauche. Vous devez sentir l'étirement au milieu de la fesse.",
  },
  {
    slug: "07-piriforme-droit",
    label: "Piriforme (droit)",
    duration: 30,
    text: "Étirez le muscle piriforme du côté droit. Gardez une respiration lente et régulière.",
  },
  {
    slug: "08-carre-lombes-gauche",
    label: "Carré des lombes (gauche)",
    duration: 30,
    text: "Assis à côté des talons, inclinez le buste vers la gauche pour étirer le carré des lombes.",
  },
  {
    slug: "09-carre-lombes-droit",
    label: "Carré des lombes (droit)",
    duration: 30,
    text: "Inclinez maintenant le buste vers la droite pour étirer le carré des lombes de l’autre côté.",
  },
  {
    slug: "10-priere",
    label: "Prière",
    duration: 30,
    text: "Reculez les fesses vers les talons et tendez les mains loin devant, comme une prière, pour étirer tout le dos.",
  },
  {
    slug: "11-dos-de-chat",
    label: "Dos de chat",
    duration: 30,
    text: "À quatre pattes, alternez extension complète à l'expiration et flexion complète à l'inspiration, sans plier les coudes.",
  },
  {
    slug: "12-gainage-alterne",
    label: "Gainage alterné",
    duration: 30,
    text: "À quatre pattes, tendez un bras et la jambe opposée, tenez quelques secondes, puis changez de côté.",
  },
  {
    slug: "13-extension-vertebrale",
    label: "Extension vertébrale",
    duration: 30,
    text: "Sur le ventre, montez en extension du dos et faites de petits mouvements de balancier pour assouplir.",
  },
  {
    slug: "14-plan-posterieur",
    label: "Plan postérieur",
    duration: 40,
    text: "Renforcez le plan postérieur en maintenant la position, avec de petits mouvements des membres pour solliciter les muscles.",
  },
  {
    slug: "15-psoas-gauche",
    label: "Psoas iliaque (gauche)",
    duration: 30,
    text: "En fente, amenez la hanche gauche en extension complète pour étirer le psoas ; vous sentez une légère tension au pli de l'aine.",
  },
  {
    slug: "16-psoas-droit",
    label: "Psoas iliaque (droit)",
    duration: 30,
    text: "Changez de côté et amenez la hanche droite en extension complète pour étirer le psoas.",
  },
  {
    slug: "17-anterieure",
    label: "Face antérieure",
    duration: 30,
    text: "Étirez toute la face avant du corps, abdominaux et pectoraux, avec une extension du dos, en tenant la position.",
  },
  {
    slug: "18-accroupi",
    label: "Accroupi",
    duration: 60,
    text: "Accroupissez-vous complètement pour un étirement axial de la colonne ; tenez la position pour relâcher le dos.",
  },
];
