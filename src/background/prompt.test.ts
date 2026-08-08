import { describe, expect, it } from "vitest";
import { parseReply } from "./prompt.js";

describe("parseReply", () => {
  it("reads the sentence line and its swap lines", () => {
    const content = ["Bob 有 一个 蓝色 苹果.", "A| 有 | owns", "A| 蓝色 | blue"].join("\n");

    expect(parseReply(content)).toEqual({
      text: "Bob 有 一个 蓝色 苹果.",
      used: [
        { zh: "有", en: "owns" },
        { zh: "蓝色", en: "blue" },
      ],
    });
  });

  it("ignores stray blank lines and tolerates a sentence with no swaps used", () => {
    const content = ["", "Plain sentence, nothing swapped.", ""].join("\n");
    expect(parseReply(content)).toEqual({ text: "Plain sentence, nothing swapped.", used: [] });
  });
});
