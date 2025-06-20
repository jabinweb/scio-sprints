export type Topic = {
  id: string;
  name: string;
  type: 'video' | 'interactive' | 'exercise' | 'audio';
  duration: string;
  completed: boolean;
  content: {
    type: 'external_link' | 'video' | 'pdf' | 'text' | 'interactive_widget';
    url?: string;
    videoUrl?: string;
    pdfUrl?: string;
    textContent?: string;
    widgetConfig?: Record<string, unknown>;
  };
};

export const classData = {
  5: {
    name: 'Class 5',
    description: 'Foundation level learning with interactive content',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        icon: '🔢',
        color: 'from-blue-400 to-blue-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Numbers and Operations',
            topics: [
              { 
                id: 't1', 
                name: 'Large Numbers', 
                type: 'video', 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.youtube.com/watch?v=example1' }
              },
              { 
                id: 't2', 
                name: 'Place Value', 
                type: 'interactive', 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.khanacademy.org/place-value' }
              },
              { 
                id: 't3', 
                name: 'Comparing Numbers', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/comparing-numbers' }
              },
              { 
                id: 't4', 
                name: 'Practice Questions', 
                type: 'exercise', 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/practice' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Basic Arithmetic',
            topics: [
              { 
                id: 't5', 
                name: 'Addition & Subtraction', 
                type: 'video', 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/addition-subtraction' }
              },
              { 
                id: 't6', 
                name: 'Multiplication Tables', 
                type: 'audio', 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/multiplication' }
              },
              { 
                id: 't7', 
                name: 'Division Methods', 
                type: 'interactive', 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/division' }
              }
            ]
          }
        ]
      },
      {
        id: 'science',
        name: 'Science',
        icon: '🔬',
        color: 'from-green-400 to-green-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Our Environment',
            topics: [
              { 
                id: 't1', 
                name: 'Living and Non-living', 
                type: 'video', 
                duration: '16 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/living-nonliving' }
              },
              { 
                id: 't2', 
                name: 'Plants Around Us', 
                type: 'interactive', 
                duration: '24 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/plants' }
              },
              { 
                id: 't3', 
                name: 'Animals and Their Homes', 
                type: 'video', 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/animals' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Food and Health',
            topics: [
              { 
                id: 't4', 
                name: 'Healthy Food Habits', 
                type: 'video', 
                duration: '14 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/healthy-food' }
              },
              { 
                id: 't5', 
                name: 'Vitamins and Minerals', 
                type: 'interactive', 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/vitamins' }
              }
            ]
          }
        ]
      },
      {
        id: 'english',
        name: 'English',
        icon: '📚',
        color: 'from-purple-400 to-purple-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Grammar Basics',
            topics: [
              { 
                id: 't1', 
                name: 'Nouns and Pronouns', 
                type: 'video', 
                duration: '10 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/nouns-pronouns' }
              },
              { 
                id: 't2', 
                name: 'Verbs and Adjectives', 
                type: 'interactive', 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/verbs-adjectives' }
              },
              { 
                id: 't3', 
                name: 'Adverbs and Prepositions', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/adverbs-prepositions' }
              },
              { 
                id: 't4', 
                name: 'Sentence Structure', 
                type: 'exercise', 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/sentence-structure' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Composition',
            topics: [
              { 
                id: 't5', 
                name: 'Paragraph Writing', 
                type: 'video', 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/paragraph-writing' }
              },
              { 
                id: 't6', 
                name: 'Essay Writing', 
                type: 'audio', 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/essay-writing' }
              },
              { 
                id: 't7', 
                name: 'Report Writing', 
                type: 'interactive', 
                duration: '28 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/report-writing' }
              }
            ]
          }
        ]
      },
      {
        id: 'social',
        name: 'Social Studies',
        icon: '🌍',
        color: 'from-orange-400 to-orange-600',
        isLocked: true,
        chapters: [
          {
            id: 'ch1',
            name: 'Our Country',
            topics: [
              { 
                id: 't1', 
                name: 'States and Capitals', 
                type: 'video', 
                duration: '15 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/states-capitals' }
              },
              { 
                id: 't2', 
                name: 'Major Rivers', 
                type: 'interactive', 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/major-rivers' }
              },
              { 
                id: 't3', 
                name: 'Mountains and Plains', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/mountains-plains' }
              }
            ]
          }
        ]
      }
    ]
  },
  6: {
    name: 'Class 6',
    description: 'Intermediate level with advanced concepts',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        icon: '🔢',
        color: 'from-blue-400 to-blue-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Integers and Rational Numbers',
            topics: [
              { 
                id: 't1', 
                name: 'Understanding Integers', 
                type: 'video', 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/integers' }
              },
              { 
                id: 't2', 
                name: 'Rational Numbers', 
                type: 'interactive', 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/rational-numbers' }
              },
              { 
                id: 't3', 
                name: 'Number Line', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/number-line' }
              },
              { 
                id: 't4', 
                name: 'Operations on Integers', 
                type: 'exercise', 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/integer-operations' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Algebraic Expressions',
            topics: [
              { 
                id: 't5', 
                name: 'Introduction to Algebra', 
                type: 'video', 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/algebra-intro' }
              },
              { 
                id: 't6', 
                name: 'Variables and Constants', 
                type: 'audio', 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/variables-constants' }
              },
              { 
                id: 't7', 
                name: 'Algebraic Identities', 
                type: 'interactive', 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/algebraic-identities' }
              }
            ]
          }
        ]
      },
      {
        id: 'science',
        name: 'Science',
        icon: '🔬',
        color: 'from-green-400 to-green-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Components of Food',
            topics: [
              { 
                id: 't1', 
                name: 'Carbohydrates', 
                type: 'video', 
                duration: '16 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/carbohydrates' }
              },
              { 
                id: 't2', 
                name: 'Proteins and Fats', 
                type: 'interactive', 
                duration: '24 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/proteins-fats' }
              },
              { 
                id: 't3', 
                name: 'Vitamins and Minerals', 
                type: 'video', 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/vitamins-minerals' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Chemical Reactions',
            topics: [
              { 
                id: 't4', 
                name: 'Introduction to Chemical Reactions', 
                type: 'video', 
                duration: '14 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/chemical-reactions' }
              },
              { 
                id: 't5', 
                name: 'Types of Chemical Reactions', 
                type: 'interactive', 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/reaction-types' }
              }
            ]
          }
        ]
      },
      {
        id: 'english',
        name: 'English',
        icon: '📚',
        color: 'from-purple-400 to-purple-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Tenses',
            topics: [
              { 
                id: 't1', 
                name: 'Present Tense', 
                type: 'video', 
                duration: '10 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/present-tense' }
              },
              { 
                id: 't2', 
                name: 'Past Tense', 
                type: 'interactive', 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/past-tense' }
              },
              { 
                id: 't3', 
                name: 'Future Tense', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/future-tense' }
              },
              { 
                id: 't4', 
                name: 'Perfect Tense', 
                type: 'exercise', 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/perfect-tense' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Punctuation and Sentence Structure',
            topics: [
              { 
                id: 't5', 
                name: 'Commas and Full Stops', 
                type: 'video', 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/punctuation' }
              },
              { 
                id: 't6', 
                name: 'Question Marks and Exclamation Points', 
                type: 'audio', 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/question-marks' }
              },
              { 
                id: 't7', 
                name: 'Sentence Fragments and Run-ons', 
                type: 'interactive', 
                duration: '28 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/sentence-fragments' }
              }
            ]
          }
        ]
      },
      {
        id: 'social',
        name: 'Social Studies',
        icon: '🌍',
        color: 'from-orange-400 to-orange-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Geographical Features',
            topics: [
              { 
                id: 't1', 
                name: 'Mountains, Valleys, and Plains', 
                type: 'video', 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/geographical-features' }
              },
              { 
                id: 't2', 
                name: 'Rivers, Lakes, and Oceans', 
                type: 'interactive', 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/water-bodies' }
              },
              { 
                id: 't3', 
                name: 'Deserts and Forests', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/deserts-forests' }
              },
              { 
                id: 't4', 
                name: 'Climate and Weather', 
                type: 'exercise', 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/climate-weather' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Cultural Heritage',
            topics: [
              { 
                id: 't5', 
                name: 'Famous Monuments', 
                type: 'video', 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/monuments' }
              },
              { 
                id: 't6', 
                name: 'Traditional Dances and Music', 
                type: 'audio', 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/traditional-arts' }
              },
              { 
                id: 't7', 
                name: 'Festivals and Celebrations', 
                type: 'interactive', 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/festivals' }
              }
            ]
          }
        ]
      }
    ]
  },
  7: {
    name: 'Class 6',
    description: 'Intermediate level with advanced concepts',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        icon: '🔢',
        color: 'from-blue-400 to-blue-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Integers and Rational Numbers',
            topics: [
              { 
                id: 't1', 
                name: 'Understanding Integers', 
                type: 'video', 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/integers' }
              },
              { 
                id: 't2', 
                name: 'Rational Numbers', 
                type: 'interactive', 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/rational-numbers' }
              },
              { 
                id: 't3', 
                name: 'Number Line', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/number-line' }
              },
              { 
                id: 't4', 
                name: 'Operations on Integers', 
                type: 'exercise', 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/integer-operations' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Algebraic Expressions',
            topics: [
              { 
                id: 't5', 
                name: 'Introduction to Algebra', 
                type: 'video', 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/algebra-intro' }
              },
              { 
                id: 't6', 
                name: 'Variables and Constants', 
                type: 'audio', 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/variables-constants' }
              },
              { 
                id: 't7', 
                name: 'Algebraic Identities', 
                type: 'interactive', 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/algebraic-identities' }
              }
            ]
          }
        ]
      },
      {
        id: 'science',
        name: 'Science',
        icon: '🔬',
        color: 'from-green-400 to-green-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Components of Food',
            topics: [
              { 
                id: 't1', 
                name: 'Carbohydrates', 
                type: 'video', 
                duration: '16 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/carbohydrates' }
              },
              { 
                id: 't2', 
                name: 'Proteins and Fats', 
                type: 'interactive', 
                duration: '24 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/proteins-fats' }
              },
              { 
                id: 't3', 
                name: 'Vitamins and Minerals', 
                type: 'video', 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/vitamins-minerals' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Chemical Reactions',
            topics: [
              { 
                id: 't4', 
                name: 'Introduction to Chemical Reactions', 
                type: 'video', 
                duration: '14 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/chemical-reactions' }
              },
              { 
                id: 't5', 
                name: 'Types of Chemical Reactions', 
                type: 'interactive', 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/reaction-types' }
              }
            ]
          }
        ]
      },
      {
        id: 'english',
        name: 'English',
        icon: '📚',
        color: 'from-purple-400 to-purple-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Tenses',
            topics: [
              { 
                id: 't1', 
                name: 'Present Tense', 
                type: 'video', 
                duration: '10 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/present-tense' }
              },
              { 
                id: 't2', 
                name: 'Past Tense', 
                type: 'interactive', 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/past-tense' }
              },
              { 
                id: 't3', 
                name: 'Future Tense', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/future-tense' }
              },
              { 
                id: 't4', 
                name: 'Perfect Tense', 
                type: 'exercise', 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/perfect-tense' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Punctuation and Sentence Structure',
            topics: [
              { 
                id: 't5', 
                name: 'Commas and Full Stops', 
                type: 'video', 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/punctuation' }
              },
              { 
                id: 't6', 
                name: 'Question Marks and Exclamation Points', 
                type: 'audio', 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/question-marks' }
              },
              { 
                id: 't7', 
                name: 'Sentence Fragments and Run-ons', 
                type: 'interactive', 
                duration: '28 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/sentence-fragments' }
              }
            ]
          }
        ]
      },
      {
        id: 'social',
        name: 'Social Studies',
        icon: '🌍',
        color: 'from-orange-400 to-orange-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Geographical Features',
            topics: [
              { 
                id: 't1', 
                name: 'Mountains, Valleys, and Plains', 
                type: 'video', 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/geographical-features' }
              },
              { 
                id: 't2', 
                name: 'Rivers, Lakes, and Oceans', 
                type: 'interactive', 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/water-bodies' }
              },
              { 
                id: 't3', 
                name: 'Deserts and Forests', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/deserts-forests' }
              },
              { 
                id: 't4', 
                name: 'Climate and Weather', 
                type: 'exercise', 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/climate-weather' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Cultural Heritage',
            topics: [
              { 
                id: 't5', 
                name: 'Famous Monuments', 
                type: 'video', 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/monuments' }
              },
              { 
                id: 't6', 
                name: 'Traditional Dances and Music', 
                type: 'audio', 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/traditional-arts' }
              },
              { 
                id: 't7', 
                name: 'Festivals and Celebrations', 
                type: 'interactive', 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/festivals' }
              }
            ]
          }
        ]
      }
    ]
  },
  8: {
    name: 'Class 7',
    description: 'Advanced curriculum with exam preparation',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        icon: '🔢',
        color: 'from-blue-400 to-blue-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Rational Numbers and Proportions',
            topics: [
              { 
                id: 't1', 
                name: 'Understanding Rational Numbers', 
                type: 'video', 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/rational-numbers' }
              },
              { 
                id: 't2', 
                name: 'Proportions and Ratios', 
                type: 'interactive', 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/proportions' }
              },
              { 
                id: 't3', 
                name: 'Percentage', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/percentage' }
              },
              { 
                id: 't4', 
                name: 'Profit and Loss', 
                type: 'exercise', 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/profit-loss' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Linear Equations',
            topics: [
              { 
                id: 't5', 
                name: 'Introduction to Linear Equations', 
                type: 'video', 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/linear-equations' }
              },
              { 
                id: 't6', 
                name: 'Solving Equations', 
                type: 'audio', 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/solving-equations' }
              },
              { 
                id: 't7', 
                name: 'Applications of Linear Equations', 
                type: 'interactive', 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/linear-applications' }
              }
            ]
          }
        ]
      },
      {
        id: 'science',
        name: 'Science',
        icon: '🔬',
        color: 'from-green-400 to-green-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Physical and Chemical Changes',
            topics: [
              { 
                id: 't1', 
                name: 'Understanding Physical Changes', 
                type: 'video', 
                duration: '16 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/physical-changes' }
              },
              { 
                id: 't2', 
                name: 'Chemical Reactions in Daily Life', 
                type: 'interactive', 
                duration: '24 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/chemical-reactions-daily' }
              },
              { 
                id: 't3', 
                name: 'Acids, Bases, and Salts', 
                type: 'video', 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/acids-bases-salts' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Structure of the Atom',
            topics: [
              { 
                id: 't4', 
                name: 'Introduction to Atomic Structure', 
                type: 'video', 
                duration: '14 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/atomic-structure' }
              },
              { 
                id: 't5', 
                name: 'Subatomic Particles', 
                type: 'interactive', 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/subatomic-particles' }
              }
            ]
          }
        ]
      },
      {
        id: 'english',
        name: 'English',
        icon: '📚',
        color: 'from-purple-400 to-purple-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Active and Passive Voice',
            topics: [
              { 
                id: 't1', 
                name: 'Understanding Active Voice', 
                type: 'video', 
                duration: '10 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/active-voice' }
              },
              { 
                id: 't2', 
                name: 'Understanding Passive Voice', 
                type: 'interactive', 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/passive-voice' }
              },
              { 
                id: 't3', 
                name: 'Changing Voices', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/changing-voices' }
              },
              { 
                id: 't4', 
                name: 'Exercises on Voice', 
                type: 'exercise', 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/voice-exercises' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Direct and Indirect Speech',
            topics: [
              { 
                id: 't5', 
                name: 'Understanding Direct Speech', 
                type: 'video', 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/direct-speech' }
              },
              { 
                id: 't6', 
                name: 'Understanding Indirect Speech', 
                type: 'audio', 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/indirect-speech' }
              },
              { 
                id: 't7', 
                name: 'Changing Speech Forms', 
                type: 'interactive', 
                duration: '28 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/speech-forms' }
              }
            ]
          }
        ]
      },
      {
        id: 'social',
        name: 'Social Studies',
        icon: '🌍',
        color: 'from-orange-400 to-orange-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Revolutionary Leaders',
            topics: [
              { 
                id: 't1', 
                name: 'George Washington', 
                type: 'video', 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/george-washington' }
              },
              { 
                id: 't2', 
                name: 'Mahatma Gandhi', 
                type: 'interactive', 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.example.com/mahatma-gandhi' }
              },
              { 
                id: 't3', 
                name: 'Nelson Mandela', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/nelson-mandela' }
              },
              { 
                id: 't4', 
                name: 'Winston Churchill', 
                type: 'exercise', 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/winston-churchill' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Independence Movements',
            topics: [
              { 
                id: 't5', 
                name: 'American Revolution', 
                type: 'video', 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/american-revolution' }
              },
              { 
                id: 't6', 
                name: 'French Revolution', 
                type: 'audio', 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/french-revolution' }
              },
              { 
                id: 't7', 
                name: 'Indian Independence', 
                type: 'interactive', 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/indian-independence' }
              }
            ]
          }
        ]
      }
    ]
  },
  9: {
    name: 'Class 8',
    description: 'Pre-board preparation with comprehensive content',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        icon: '🔢',
        color: 'from-blue-400 to-blue-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Exponents and Powers',
            topics: [
              { id: 't1', name: 'Understanding Exponents', type: 'video', duration: '15 min', completed: true },
              { id: 't2', name: 'Laws of Exponents', type: 'interactive', duration: '20 min', completed: true },
              { id: 't3', name: 'Scientific Notation', type: 'video', duration: '12 min', completed: false },
              { id: 't4', name: 'Square and Cube Roots', type: 'exercise', duration: '30 min', completed: false }
            ]
          },
          {
            id: 'ch2',
            name: 'Polynomials',
            topics: [
              { id: 't5', name: 'Introduction to Polynomials', type: 'video', duration: '18 min', completed: false },
              { id: 't6', name: 'Types of Polynomials', type: 'audio', duration: '25 min', completed: false },
              { id: 't7', name: 'Operations on Polynomials', type: 'interactive', duration: '22 min', completed: false }
            ]
          }
        ]
      },
      {
        id: 'science',
        name: 'Science',
        icon: '🔬',
        color: 'from-green-400 to-green-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Matter and Its Properties',
            topics: [
              { id: 't1', name: 'States of Matter', type: 'video', duration: '16 min', completed: true },
              { id: 't2', name: 'Physical and Chemical Properties', type: 'interactive', duration: '24 min', completed: false },
              { id: 't3', name: 'Changes in States of Matter', type: 'video', duration: '20 min', completed: false }
            ]
          },
          {
            id: 'ch2',
            name: 'Atoms and Molecules',
            topics: [
              { id: 't4', name: 'Introduction to Atoms', type: 'video', duration: '14 min', completed: false },
              { id: 't5', name: 'Molecules and Compounds', type: 'interactive', duration: '18 min', completed: false }
            ]
          }
        ]
      },
      {
        id: 'english',
        name: 'English',
        icon: '📚',
        color: 'from-purple-400 to-purple-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Conditional Sentences',
            topics: [
              { id: 't1', name: 'Zero Conditional', type: 'video', duration: '10 min', completed: true },
              { id: 't2', name: 'First Conditional', type: 'interactive', duration: '15 min', completed: true },
              { id: 't3', name: 'Second Conditional', type: 'video', duration: '12 min', completed: false },
              { id: 't4', name: 'Exercises on Conditionals', type: 'exercise', duration: '25 min', completed: false }
            ]
          },
          {
            id: 'ch2',
            name: 'Reported Speech',
            topics: [
              { id: 't5', name: 'Introduction to Reported Speech', type: 'video', duration: '20 min', completed: false },
              { id: 't6', name: 'Changing Direct Speech to Reported Speech', type: 'audio', duration: '30 min', completed: false },
              { id: 't7', name: 'Exercises on Reported Speech', type: 'interactive', duration: '28 min', completed: false }
            ]
          }
        ]
      },
      {
        id: 'social',
        name: 'Social Studies',
        icon: '🌍',
        color: 'from-orange-400 to-orange-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Global Issues',
            topics: [
              { id: 't1', name: 'Climate Change', type: 'video', duration: '15 min', completed: true },
              { id: 't2', name: 'Pollution', type: 'interactive', duration: '20 min', completed: true },
              { id: 't3', name: 'Sustainable Development', type: 'video', duration: '12 min', completed: false },
              { id: 't4', name: 'Conservation of Resources', type: 'exercise', duration: '30 min', completed: false }
            ]
          },
          {
            id: 'ch2',
            name: 'Current Affairs',
            topics: [
              { id: 't5', name: 'National Events', type: 'video', duration: '18 min', completed: false },
              { id: 't6', name: 'International Relations', type: 'audio', duration: '25 min', completed: false },
              { id: 't7', name: 'Economic Developments', type: 'interactive', duration: '22 min', completed: false }
            ]
          }
        ]
      }
    ]
  }
} as const;

export type ClassData = typeof classData;
export type ClassId = keyof ClassData;
export type Subject = ClassData[ClassId]['subjects'][0];
export type Chapter = Subject['chapters'][0];
