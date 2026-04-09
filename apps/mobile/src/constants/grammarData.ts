// Placeholder for grammarData.ts - the original file was not found
export const grammarTopics = [
  {
    id: "tenses",
    title: "Tenses",
    chapters: [
      {
        id: "ch-present",
        title: "Present Tenses",
        subtopics: [
          {
            id: "present-simple",
            title: "Present Simple",
            definition: "Used for habits, daily routines, and general truths.",
            rule: "Subject + Base Verb (add -s/-es for 3rd person singular)",
            examples: [
              "I drink coffee every morning.",
              "The sun rises in the east.",
              "She works in a bank.",
            ],
            exercises: [
              {
                id: "ps-ex1",
                type: "multiple_choice",
                question: "Which sentence is in Present Simple tense?",
                options: [
                  "I am eating dinner.",
                  "I eat dinner every day.",
                  "I ate dinner yesterday.",
                  "I will eat dinner tomorrow.",
                ],
                answer: "I eat dinner every day.",
                explanation: "Present simple is used for habits or repeated actions.",
              },
              {
                id: "ps-ex2",
                type: "fill_blank",
                question: "He ______ (play) tennis on Saturdays.",
                options: ["play", "plays", "playing", "played"],
                answer: "plays",
                explanation: "For 3rd person singular (He/She/It), we add -s to the verb.",
              },
              {
                id: "ps-ex3",
                type: "sentence_correction",
                question: "Choose the correct version: They goes to school by bus.",
                options: [
                  "They go to school by bus.",
                  "They goes to school by bus.",
                  "They going to school by bus.",
                ],
                answer: "They go to school by bus.",
                explanation: "With 'They', the base form of the verb 'go' is used.",
              },
              {
                id: "ps-ex4",
                type: "true_false",
                question: "'Present Simple' is used for actions happening right now.",
                options: ["True", "False"],
                answer: "False",
                explanation: "Present Simple is for habits; Present Continuous is for actions now.",
              },
            ],
          },
          {
            id: "present-continuous",
            title: "Present Continuous",
            definition: "Used for actions happening right now or temporary situations.",
            rule: "Subject + am/is/are + Verb-ing",
            examples: [
              "I am studying for my exams.",
              "They are playing football right now.",
              "It is raining outside.",
            ],
            exercises: [
              {
                id: "pc-ex1",
                type: "multiple_choice",
                question: "What are you doing ______?",
                options: ["every day", "right now", "yesterday", "last week"],
                answer: "right now",
                explanation: "Present Continuous is used for things happening 'right now'.",
              },
              {
                id: "pc-ex2",
                type: "fill_blank",
                question: "She ______ (bake) a cake in the kitchen.",
                options: ["is baking", "are baking", "baking", "bakes"],
                answer: "is baking",
                explanation: "Subject 'She' takes 'is' followed by 'baking'.",
              },
            ],
          },
        ],
      },
      {
        id: "ch-past",
        title: "Past Tenses",
        subtopics: [
          {
            id: "past-simple",
            title: "Past Simple",
            definition: "Used for completed actions at a specific time in the past.",
            rule: "Subject + Past Tense of Verb (Verb-ed for regular)",
            examples: [
              "I visited Paris last year.",
              "He bought a new car yesterday.",
              "We watched a movie last night.",
            ],
            exercises: [
              {
                id: "pas-ex1",
                type: "multiple_choice",
                question: "I ______ to the cinema yesterday.",
                options: ["go", "went", "going", "gone"],
                answer: "went",
                explanation: "'Went' is the past simple form of 'go'.",
              },
              {
                id: "pas-ex2",
                type: "sentence_correction",
                question: "Correct the sentence: He did not played football.",
                options: [
                  "He did not play football.",
                  "He did not played football.",
                  "He does not play football.",
                ],
                answer: "He did not play football.",
                explanation: "After 'did not', we use the base form of the verb.",
              },
            ],
          },
        ],
      },
      {
        id: "ch-future",
        title: "Future Tenses",
        subtopics: [
          {
            id: "future-simple",
            title: "Future Simple",
            definition: "Used for spontaneous decisions, promises, and predictions.",
            rule: "Subject + will + base verb",
            examples: [
              "I will call you later.",
              "It will rain tomorrow.",
              "I'll help you with that.",
            ],
            exercises: [
              {
                id: "fs-ex1",
                type: "multiple_choice",
                question: "I ______ do my best to help you.",
                options: ["will", "am", "do", "going to"],
                answer: "will",
                explanation: "'Will' is used for promises and spontaneous offers.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "parts-of-speech",
    title: "Parts of Speech",
    chapters: [
      {
        id: "ch-nouns",
        title: "Nouns & Pronouns",
        subtopics: [
          {
            id: "nouns",
            title: "Nouns",
            definition: "Words that name people, places, things, or ideas.",
            rule: "Can be common (city) or proper (London), countable or uncountable.",
            examples: ["Apple (thing)", "Teacher (person)", "Freedom (idea)"],
            exercises: [
              {
                id: "n-ex1",
                type: "multiple_choice",
                question: "Which of these is a proper noun?",
                options: ["Country", "City", "France", "Village"],
                answer: "France",
                explanation: "Proper nouns are specific names and are always capitalized.",
              },
              {
                id: "n-ex2",
                type: "true_false",
                question: "The word 'London' is a common noun.",
                options: ["True", "False"],
                answer: "False",
                explanation: "'London' is a specific city name, making it a proper noun.",
              },
            ],
          },
        ],
      },
      {
        id: "ch-modifiers",
        title: "Adjectives & Adverbs",
        subtopics: [
          {
            id: "adjectives",
            title: "Adjectives",
            definition: "Words that describe or modify nouns.",
            rule: "Usually placed before the noun or after a linking verb.",
            examples: ["The blue car.", "He is happy.", "A beautiful garden."],
            exercises: [
              {
                id: "adj-ex1",
                type: "multiple_choice",
                question: "She wore a ______ dress.",
                options: ["beautifully", "beauty", "beautiful", "beautify"],
                answer: "beautiful",
                explanation: "Adjectives like 'beautiful' describe nouns like 'dress'.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "articles",
    title: "Articles",
    chapters: [
      {
        id: "ch-articles-base",
        title: "Types of Articles",
        subtopics: [
          {
            id: "a-an",
            title: "Indefinite Articles (A/An)",
            definition: "Used before singular countable nouns that are not specific.",
            rule: "Use 'A' before consonant sounds; 'An' before vowel sounds.",
            examples: ["A book", "An apple", "An hour (vowel sound 'h' is silent)"],
            exercises: [
              {
                id: "art-ex1",
                type: "fill_blank",
                question: "I saw ______ umbrella on the chair.",
                options: ["a", "an", "the", "no article"],
                answer: "an",
                explanation: "Umbrella starts with a vowel sound, so we use 'an'.",
              },
              {
                id: "art-ex2",
                type: "multiple_choice",
                question: "Choose the correct article for 'University'.",
                options: ["A", "An"],
                answer: "A",
                explanation: "'University' starts with a 'y' sound, which is a consonant sound.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "modal-verbs",
    title: "Modal Verbs",
    chapters: [
      {
        id: "ch-modals-base",
        title: "Ability and Permission",
        subtopics: [
          {
            id: "can-could",
            title: "Can & Could",
            definition: "Used to express ability, possibility, or permission.",
            rule: "Modal + Base Verb (no 'to')",
            examples: [
              "I can swim.",
              "Could you open the door?",
              "He could run fast when he was young.",
            ],
            exercises: [
              {
                id: "mod-ex1",
                type: "multiple_choice",
                question: "She ______ speak three languages.",
                options: ["cans", "can", "can to", "could to"],
                answer: "can",
                explanation:
                  "Modals are never followed by 'to' and do not take '-s' in 3rd person.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "conditionals",
    title: "Conditionals",
    chapters: [
      {
        id: "ch-cond-base",
        title: "Types of Conditionals",
        subtopics: [
          {
            id: "first-conditional",
            title: "First Conditional",
            definition: "Used for real and possible situations in the future.",
            rule: "If + Present Simple, will + base verb",
            examples: ["If it rains, I will stay home.", "If you study, you will pass the exam."],
            exercises: [
              {
                id: "cond-ex1",
                type: "fill_blank",
                question: "If she ______ (hurry), she will catch the bus.",
                options: ["hurry", "hurries", "hurrying", "hurried"],
                answer: "hurries",
                explanation: "In the 'if' clause of the first conditional, we use Present Simple.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "voice-speech",
    title: "Voice and Reported Speech",
    chapters: [
      {
        id: "ch-voice-base",
        title: "Active and Passive Voice",
        subtopics: [
          {
            id: "passive-voice",
            title: "Passive Voice",
            definition: "Used when the focus is on the action rather than who performs it.",
            rule: "Subject + Be + Past Participle",
            examples: ["The letter was sent yesterday.", "Rice is grown in India."],
            exercises: [
              {
                id: "voi-ex1",
                type: "sentence_correction",
                question: "Select the correct passive form: The cake were eaten by him.",
                options: [
                  "The cake was eaten by him.",
                  "The cake were eaten by him.",
                  "The cake eaten by him.",
                ],
                answer: "The cake was eaten by him.",
                explanation: "'The cake' is singular, so it takes 'was'.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "phrasal-verbs",
    title: "Phrasal Verbs and Collocations",
    chapters: [
      {
        id: "ch-phrasal-base",
        title: "Common Phrasal Verbs",
        subtopics: [
          {
            id: "get-on",
            title: "Phrasal Verbs with 'Get'",
            definition: "Combinations of 'get' with prepositions that change the meaning.",
            rule: "Verb + Particle",
            examples: [
              "Get up (wake up)",
              "Get along (have a good relationship)",
              "Get over (recover from)",
            ],
            exercises: [
              {
                id: "phr-ex1",
                type: "multiple_choice",
                question: "She needs to ______ her cold before the trip.",
                options: ["get up", "get on", "get over", "get in"],
                answer: "get over",
                explanation: "'Get over' means to recover from an illness.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "punctuation-structure",
    title: "Punctuation and Sentence Structure",
    chapters: [
      {
        id: "ch-punc-base",
        title: "Basic Punctuation",
        subtopics: [
          {
            id: "commas",
            title: "The Comma (,)",
            definition: "Used to separate items, clauses, or provide a pause.",
            rule: "Use for lists, after introductory phrases, and between adjectives.",
            examples: ["I bought milk, eggs, and bread.", "However, I didn't like the movie."],
            exercises: [
              {
                id: "punc-ex1",
                type: "true_false",
                question: "Commas are used at the end of every sentence.",
                options: ["True", "False"],
                answer: "False",
                explanation: "Periods (.) or Question marks (?) are used at the end of sentences.",
              },
            ],
          },
        ],
      },
    ],
  },
];
