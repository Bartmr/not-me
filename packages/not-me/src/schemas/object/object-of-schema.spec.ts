import { equals } from "../equals/equals-schema";
import { ValidationResult } from "../schema";
import { objectOf } from "./object-of-schema";

describe("Object Of Schema", () => {
  const schema = objectOf(equals(["a"] as const).defined()).defined();

  it("valid", () => {
    const result: ValidationResult<{ [key: string]: "a" }> = schema.validate({
      b: "a",
    });

    expect(result).toEqual({
      errors: false,
      value: { b: "a" },
    });
  });

  it("errors", () => {
    const result: ValidationResult<{ [key: string]: "a" }> = schema.validate({
      b: "b",
    });

    expect(result).toEqual({
      errors: true,
      messagesTree: {
        b: ["Input must be one of the allowed values"],
      },
    });
  });

  it("is not an object", () => {
    const result: ValidationResult<{ [key: string]: "a" }> = schema.validate(
      true
    );

    expect(result).toEqual({
      errors: true,
      messagesTree: ["Input must be an object"],
    });
  });
});
