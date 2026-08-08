# Model bake-off

12 sentences, temperature 0.2, run 2026-08-08T14:05:44.827Z.
Every model got the same sentences with the same words already chosen by the engine.

| model | valid | swaps used | reasoning tokens | time | cost/page | natural |
|---|---|---|---|---|---|---|
| `google/gemini-3.5-flash-lite` | 12/12 | 34/35 | 0 | 4.8s | $0.0061 | 9/12 |
| `anthropic/claude-sonnet-5` | 11/12 | 31/35 | 197 | 13.0s | $0.0383 | 8/11 |

## Sentences

**google/gemini-3.5-flash-lite**

- Bob owns a 蓝的苹果, the apple is 神奇的.
- She 开ed the 门 and walked into the small 房间.
- The old man 坐 by the window and 念 his 书.

**anthropic/claude-sonnet-5**

- She 开 the 门 and walked into the small 房间.
- The old man 坐 by the window and 念 his 书.
- They 吃 dinner 一起 and talked about the 天气.