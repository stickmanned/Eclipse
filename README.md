# Eclipse

<img src="/src/README_src/Eclipse_Text.png">

Eclipse is an online assistant, supplementing clients with a new method on how to learn French over enhancing their reading comprehensions. Eclipse is added into your browser as a chrome extension, and there are 2 separate modes in which the extension can be used. The modes are Translation mode, and Paraphrase mode. 

Translation mode is recommended for learners who are new to French (roughly delf A2 TO B1 comprehensions, which users will adjust in settings). In this setting, words from all over an article the viewer is reading, will be translated into French. If these translated words are clicked on by the viewer, they will be given a multi choice guess on their direct translation and meaning. When successful with the multichoice questions, the AI will grow more ambitious and translate more words from the article into French. If questions are answered incorrectly, the AI will become less ambitious and translate less words in compatibility towards the viewer’s minimal and beginner French comprehension. Eclipse will also track the user’s progress and understanding of French words by recording how many questions on the definitions of words in the article, are answered correctly. 

The other learning mode which Eclipse offers, Paraphrase mode, provides the Viewers with a rather advanced method on learning French. This method is recommended for learners with a B1-C2  comprehensions. In this setting, the entire article the viewer is reading can be translated into the new language. Users will be able to read through the entire text and improve their reading comprehension when as well being able to click over words they do not understand. This time, rather than providing a direct translation on the denotations of these words, the AI will generate clues in French, allowing the users to guess the meaning of the words based on the clue’s contextual phrasing. 

**Our theme: Every Eclipse has a secret waiting to be uncovered**

**How our project related to our theme:** Metaphorically, an eclipse is the temporary shadowing or overpowering of one prominent force by something else. This metaphoric definition, ties with the functionality of our project, as words of another language (the language the user is trying to learn) will overpower and contextually replace words from the article in the language the viewer understands well.

---

## TL;DR

1. The familiar English meaning is **hidden**.
2. A French word takes its place.
3. You **predict** what it means from the sentence around it.
4. The Truth Card **uncovers the evidence**.
5. Your moon phase moves as the concept becomes reliable.

---

## Quick start

```bash
npm ci
npm run build
```

Then load it:

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. **Load unpacked** -> select `.output/chrome-mv3`

Start the demo articles in a second terminal:

```bash
npm run demo
```

Open <http://127.0.0.1:4321/demo-a.html>, click the Eclipse toolbar icon, and press **Start Eclipse**.

There is no account or extension-side API key. Start the loopback AI service with `npm run api`; the keys are set using .env


---

## Video walkthrough

See [here](https://youtu.be/j-cHfa5xX30)

---

## Manual walkthrough plan
See [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) for a proposed runthrough script for more vigourous testing

---

## Command manual

| Command                | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | WXT dev server with hot reload                  |
| `npm run build`        | Production build into `.output/chrome-mv3`      |
| `npm run zip`          | Packaged extension zip                          |
| `npm run demo`         | Serve the two demo articles on `127.0.0.1:4321` |
| `npm run api`          | Local AI generation API on `127.0.0.1:8787`     |
| `npm run typecheck`    | `tsc --noEmit`                                  |
| `npm run lint`         | ESLint                                          |
| `npm run format:check` | Prettier, check only                            |
| `npm test`             | Unit, DOM and API suites (Vitest)               |
| `npm run test:e2e`     | Browser end-to-end (Playwright, real Chrome)    |
| `npm run check`        | typecheck → lint → format → tests → build       |

`npm run test:e2e` builds what it needs and starts the demo server itself.

---

