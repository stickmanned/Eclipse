/**
 * Ordinary English sentences, the kind Eclipse will meet on a real page.
 *
 * Deliberately mixed: news, blog writing, documentation, and dialogue. If the
 * engine only worked on simple textbook sentences it would look fine here and
 * fail on the open web.
 */
export const CORPUS: readonly string[] = [
  // plain narrative
  "Bob owns a blue apple, the apple is magical.",
  "She opened the door and walked into the small room.",
  "The old man sat by the window and read his book.",
  "They ate dinner together and talked about the weather.",
  "My sister bought a new car last week.",
  "The cat slept on the warm floor all afternoon.",
  "He wrote a long letter to his mother.",
  "We walked to the station and waited for the train.",
  "The child laughed and ran across the green field.",
  "I drank cold water after the long walk.",

  // news
  "The government announced a new plan to build more houses.",
  "Prices for food and energy rose again this month.",
  "Doctors say the new medicine helps most patients sleep better.",
  "The company said it will hire two hundred workers this year.",
  "Heavy rain closed several roads in the north of the country.",
  "A local school won the national music competition on Saturday.",
  "Police asked people to stay away from the area.",
  "The president will meet business leaders in the capital next week.",

  // blog and opinion
  "I think the best way to learn a language is to use it every day.",
  "Most people give up because progress feels slow at first.",
  "You do not need expensive tools to start making music.",
  "The problem is not time, it is that we spend it badly.",
  "After three months I finally understood why this matters.",
  "Reading every morning changed how I think about my work.",

  // documentation
  "Open the file and change the value of the first line.",
  "This function returns the number of items in the list.",
  "If the program stops, check the log file for errors.",
  "You must save your work before you close the window.",
  "The system sends a message when the process is complete.",
  "Set the option to true to turn on this feature.",

  // dialogue
  "Where did you put my keys?",
  "I do not know, ask your brother.",
  "Can you help me move this table?",
  "She said she would come back before six.",
  "What time does the shop open on Sunday?",
  "That is a very good question, let me think about it.",

  // longer, mixed
  "The teacher explained the lesson twice, but half the class still looked confused.",
  "Every year thousands of people visit the mountain to see the sunrise.",
  "He learned to cook by watching his grandmother in the kitchen.",
  "Nobody expected the small team to win the game so easily.",
  "The book describes how a young woman built a business from nothing.",
];
