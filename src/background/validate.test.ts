import { describe, expect, it } from "vitest";
import { checkReply } from "./validate.js";
import type { SwapRequest, SwapReply } from "./prompt.js";

const request: SwapRequest = {
  i: 0,
  text: "Edible fruits in particular have long propagated.",
  replace: [{ en: "have", zh: "有" }],
};

describe("checkReply", () => {
  it("accepts a swap kept apart from English by spaces", () => {
    const reply: SwapReply = {
      text: "Edible fruits in particular 有 long propagated.",
      used: [{ zh: "有", en: "have" }],
    };
    expect(checkReply(request, reply).ok).toBe(true);
  });

  it("rejects a swap jammed against an English word with no space", () => {
    const reply: SwapReply = {
      text: "Edible fruits in particular有 long propagated.",
      used: [{ zh: "有", en: "have" }],
    };
    const checked = checkReply(request, reply);
    expect(checked.ok).toBe(false);
    expect(checked.problems.join()).toMatch(/jammed/);
  });

  it("rejects a reply stuck in a repetition loop", () => {
    const reply: SwapReply = {
      text: "Edible fruits in particular 有 long propagated. " + "the edible portion. ".repeat(80),
      used: [{ zh: "有", en: "have" }],
    };
    const checked = checkReply(request, reply);
    expect(checked.ok).toBe(false);
    expect(checked.problems.join()).toMatch(/repetition/);
  });
});
