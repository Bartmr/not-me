import { Schema } from "../schema";
import { date } from "./date-schema";

describe("Date Schema", () => {
  it("Fail with unparsable date string", () => {
    const schema: Schema<Date> = date().required();

    expect(schema.validate("abc")).toEqual({
      errors: true,
      messagesTree: ["Invalid date"],
    });
  });

  it("Parsable date string", () => {
    const schema: Schema<Date> = date().required();

    const dateInput = new Date();

    const result = schema.validate(dateInput.toJSON());

    if (result.errors) {
      throw new Error();
    } else {
      expect(result.value.getTime()).toBe(dateInput.getTime());
    }
  });

  it("Empty strings should be transformed to undefined", () => {
    const schema: Schema<Date | undefined | null> = date();

    expect(schema.validate("")).toEqual({
      errors: false,
      value: undefined,
    });
  });

  it("Strings with only whitespaces should be transformed to undefined", () => {
    const schema: Schema<Date | undefined | null> = date();

    expect(schema.validate("   ")).toEqual({
      errors: false,
      value: undefined,
    });
  });
});
