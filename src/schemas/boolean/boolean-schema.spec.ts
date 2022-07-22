import { Schema } from "../schema";
import { boolean } from "./boolean-schema";

describe("Boolean Schema", () => {
  it("Empty strings should be transformed to undefined", () => {
    const schema: Schema<boolean | undefined | null> = boolean();

    expect(schema.validate("")).toEqual({
      errors: false,
      value: undefined,
    });
  });

  it("Strings with only whitespaces should be transformed to undefined", () => {
    const schema: Schema<boolean | undefined | null> = boolean();

    expect(schema.validate("   ")).toEqual({
      errors: false,
      value: undefined,
    });
  });

  it("Should transform boolean strings to booleans", () => {
    const schema: Schema<boolean | undefined | null> = boolean();

    expect(schema.validate("true")).toEqual({
      errors: false,
      value: true,
    });

    expect(schema.validate("false")).toEqual({
      errors: false,
      value: false,
    });
  });

  it("Should be valid", () => {
    const schema: Schema<boolean | undefined | null> = boolean();

    expect(schema.validate(true)).toEqual({
      errors: false,
      value: true,
    });

    expect(schema.validate(false)).toEqual({
      errors: false,
      value: false,
    });
  });

  it("Should be valid", () => {
    const schema: Schema<boolean | undefined | null> = boolean();

    expect(schema.validate("  true")).toEqual({
      errors: false,
      value: true,
    });

    expect(schema.validate("false  ")).toEqual({
      errors: false,
      value: false,
    });
  });

  it("Should be invalid", () => {
    const schema: Schema<boolean | undefined | null> = boolean();

    expect(schema.validate("Hello")).toEqual({
      errors: true,
      messagesTree: ["Must be a boolean"],
    });
  });

  it("Should be invalid", () => {
    const schema: Schema<boolean | undefined | null> = boolean();

    expect(schema.validate(1)).toEqual({
      errors: true,
      messagesTree: ["Must be a boolean"],
    });
  });

  it("Should be invalid", () => {
    const schema: Schema<boolean | undefined | null> = boolean();

    expect(schema.validate(0)).toEqual({
      errors: true,
      messagesTree: ["Must be a boolean"],
    });
  });
});
