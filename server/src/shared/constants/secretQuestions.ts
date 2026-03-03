export const SECRET_QUESTIONS = [
  { id: "mother_maiden", question: "What is your mother's maiden name?" },
  { id: "first_pet", question: "What was the name of your first pet?" },
  { id: "birth_city", question: "In what city were you born?" },
  { id: "favorite_teacher", question: "What was the name of your favorite teacher?" },
  { id: "first_car", question: "What was the model of your first car?" },
  { id: "childhood_nickname", question: "What was your childhood nickname?" },
  { id: "favorite_food", question: "What is your favorite food?" },
] as const;

export type SecretQuestionId = (typeof SECRET_QUESTIONS)[number]["id"];
