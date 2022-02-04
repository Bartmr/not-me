import { Schema } from "../schema";
import { boolean } from "./boolean-schema";

describe("Date Schema", () => {
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
});
