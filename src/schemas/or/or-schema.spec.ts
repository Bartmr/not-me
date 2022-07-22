import { equals } from "../equals/equals-schema";
import { number } from "../number/number-schema";
import { Schema } from "../schema";
import { or } from "./or-schema";

describe("Or Schema", () => {
  it("Should match", () => {
    const schema: Schema<number | "string-literal"> = or([
      number(),
      equals(["string-literal"] as const),
    ]).required();

    const resultForNumber = schema.validate(2);
    const resultForStringNumber = schema.validate("2");
    const resultForStringLiteral = schema.validate("string-literal");

    expect(resultForNumber).toEqual({
      errors: false,
      value: 2,
    });

    expect(resultForStringNumber).toEqual({
      errors: false,
      value: 2,
    });

    expect(resultForStringLiteral).toEqual({
      errors: false,
      value: "string-literal",
    });
  });

  it("Should fail", () => {
    const schema: Schema<number | "string-literal"> = or([
      number(),
      equals(["string-literal"] as const),
    ]).required();

    const result = schema.validate("hello");

    expect(result).toEqual({
      errors: true,
      messagesTree: expect.any(Array) as unknown,
    });
  });

  it("Should throw when schemas are not provided on declaration", () => {
    expect(() => {
      or([] as unknown as [Schema<unknown>]).required();
    }).toThrow("No schemas provided");
  });
});
