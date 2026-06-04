// Strict question sequences for each element - based on the plan
export const ELEMENT_QUESTIONS = {
  space: [
    "What does it look like?",
    "Is it indoors or outdoors?",
    "What time of day or what light quality does it have?",
    "What is the ground beneath you like?",
    "How does this space make you feel - vast, intimate, familiar, foreign?",
  ],
  cube: [
    "Now, within this space, there is a cube. What does your cube look like?",
    "What color is the cube?",
    "What is it made of?",
    "How large is it relative to the space?",
    "Where is it positioned - on the ground, floating, partially buried?",
    "How far away from you does it sit?",
    "If you were to approach the cube, how would you describe its texture?",
    "How does it make you feel when you look at it?",
  ],
  ladder: [
    "In this space, a ladder appears. What does it look like?",
    "How tall is it?",
    "Where is it positioned - what is it leaning on or where does it lead?",
    "What is it made of - wood, metal, something else?",
    "What is its condition like - sturdy, worn, pristine?",
    "If you tried to climb it, how difficult would it be?",
    "What is its relationship to the cube?",
  ],
  flowers: [
    "You notice flowers in this space. Are there flowers here?",
    "Where do they appear in your space?",
    "What kind and color are they?",
    "Are they growing, cut, or arranged?",
    "Are they well-tended or neglected?",
    "How are they contained - in the ground, in a vase, floating?",
    "What is their relationship to the cube?",
  ],
  storm: [
    "As you observe your space, a storm forms. Is there a storm?",
    "Where is it - near or far from your space?",
    "What kind of storm is it?",
    "How big and intense is it?",
    "How does it affect your space?",
    "How does it make you feel?",
    "Is it moving toward or away from you?",
  ],
  animal: [
    "An animal enters or is present in this space. What kind of animal is it?",
    "Where is it positioned in your space?",
    "What is it doing?",
    "How do you feel about its presence?",
    "What is its relationship to you?",
    "What is its relationship to the cube?",
    "What characteristics would you give it?",
  ],
};

export function getCurrentElement(messageCount: number): string {
  // Rough progression through elements based on message count
  // Space: messages 0-4
  // Cube: messages 5-12
  // Ladder: messages 13-19
  // Flowers: messages 20-26
  // Storm: messages 27-33
  // Animal: messages 34+

  if (messageCount < 5) return "space";
  if (messageCount < 13) return "cube";
  if (messageCount < 20) return "ladder";
  if (messageCount < 27) return "flowers";
  if (messageCount < 34) return "storm";
  return "animal";
}

export function getNextQuestion(element: string, elementQuestionIndex: number): string {
  const questions = ELEMENT_QUESTIONS[element as keyof typeof ELEMENT_QUESTIONS];
  if (!questions) return "";
  if (elementQuestionIndex >= questions.length) return questions[questions.length - 1];
  return questions[elementQuestionIndex];
}
