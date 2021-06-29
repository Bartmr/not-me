import { Schema } from "../schema";
import { date } from "./date-schema";

describe("Date Schema", () => {
  it("Fail with unparsable date string", () => {
    const schema: Schema<Date> = date().required();

    expect(schema.validate("abc")).toEqual({
      errors: true,
      messagesTree: ["Input is not a valid date"],
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
});
