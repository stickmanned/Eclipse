import { describe, expect, it } from "vitest";
import { parseReply } from "./prompt.js";

describe("parseReply", () => {
  it("reads sentence and swap lines keyed by index", () => {
    const content = [
      "[0] Bob 有 一个 蓝色 苹果.",
      "[0] A| 有 | owns",
      "[0] A| 蓝色 | blue",
      "[1] She 开 the 门.",
      "[1] A| 开 | opened",
    ].join("\n");

    const parsed = parseReply(content);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({
      i: 0,
      text: "Bob 有 一个 蓝色 苹果.",
      used: [
        { zh: "有", en: "owns" },
        { zh: "蓝色", en: "blue" },
      ],
    });
    expect(parsed[1]).toEqual({ i: 1, text: "She 开 the 门.", used: [{ zh: "开", en: "opened" }] });
  });

  it("ignores stray lines and tolerates a sentence with no swaps used", () => {
    const content = ["not a real line", "[0] Plain sentence, nothing swapped.", ""].join("\n");
    expect(parseReply(content)).toEqual([{ i: 0, text: "Plain sentence, nothing swapped.", used: [] }]);
  });
});
