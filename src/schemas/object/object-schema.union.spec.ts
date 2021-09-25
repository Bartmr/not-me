import { boolean } from "../boolean/boolean-schema";
import { equals } from "../equals/equals-schema";
import { number } from "../number/number-schema";
import { ValidationResult, InferType, Schema } from "../schema";
import { string } from "../string/string-schema";
import { object } from "./object-schema";

describe("Object Schema - Union", () => {
  describe("Simple Union", () => {
    const schema: Schema<
      { common: string } & ({ a: "a"; c: number } | { a: "b"; d: boolean })
    > = object({
      common: equals(["common"]).required(),
      a: equals(["a", "b"] as const).required(),
    })
      .union((v) => {
        if (v.a === "a") {
          return {
            a: equals(["a"] as const).required(),
            c: equals([0]).required(),
          };
        } else {
          return {
            a: equals(["b"] as const).required(),
            d: equals([false]).required(),
          };
        }
      })
      .required();

    it("valid", () => {
      type Expected = InferType<typeof schema>;

      const input: Expected = { common: "common", a: "a", c: 0 };

      const result: ValidationResult<Expected> = schema.validate(input);

      if (result.errors) {
        throw new Error();
      } else {
        const value: Expected = result.value;

        expect(value).toEqual(input);
      }

      const input2: Expected = { common: "common", a: "b", d: false };
      const result2 = schema.validate(input2);

      if (result2.errors) {
        throw new Error();
      } else {
        const value: Expected = result2.value;

        expect(value).toEqual(input2);
      }
    });

    it("errors", () => {
      const input = { common: "common", a: "b", d: 0 };

      const result = schema.validate(input);

      expect(result).toEqual({
        errors: true,
        messagesTree: [
          {
            d: ["Input must be one of the allowed values"],
          },
        ],
      });
    });

    it("Unions should not disrupt nullabilty type of result", () => {
      const schema: Schema<
        | {
            a: true;
            b: number;
          }
        | {
            a?: false | null;
            c: string;
          }
      > = object({
        a: boolean(),
      })
        .required()
        .union((v) => {
          if (v.a) {
            return {
              a: equals([true]).required(),
              b: number().required(),
            };
          } else {
            return {
              a: equals([false]),
              c: string().required(),
            };
          }
        });

      // NO-OP test
      expect(!!schema).toBe(true);
    });
  });
});
