import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";
import { BaseSchema } from "../base/base-schema";
import { InferType, Schema } from "../schema";

type ElementsSchemaBase = Schema<unknown>;
type BaseType = unknown[];

class ArraySchemaImpl<
  ElementsSchema extends ElementsSchemaBase,
  _Shape extends InferType<ElementsSchema>[] = InferType<ElementsSchema>[],
  _Output = _Shape | undefined | null
> extends BaseSchema<BaseType, _Shape, _Output> {
  private minLength = 0;
  private minLengthMessage?: string;

  private maxLength = Infinity;
  private maxLengthMessage?: string;

  constructor(elementsSchema: ElementsSchema, message?: string) {
    super((input) => {
      if (input instanceof Array) {
        return {
          errors: false,
          value: input,
        };
      } else {
        return {
          errors: true,
          messagesTree: [
            message ||
              DefaultErrorMessagesManager.getDefaultMessages().array
                ?.notAnArray ||
              "Input must be an array",
          ],
        };
      }
    });

    this.addShapeFilter((input, options) => {
      const errors: { [key: number]: AnyErrorMessagesTree } = {};

      const validatedArray = [];

      const lessThanMinimumDefaultMessage =
        DefaultErrorMessagesManager.getDefaultMessages().array?.lessThanMinimum;

      const moreThanMaximumDefaultMessage =
        DefaultErrorMessagesManager.getDefaultMessages().array?.moreThanMaximum;

      if (input.length < this.minLength) {
        return {
          errors: true,
          messagesTree: [
            this.minLengthMessage ||
              (lessThanMinimumDefaultMessage &&
                lessThanMinimumDefaultMessage(this.minLength)) ||
              `Must have more than ${this.minLength} item${
                this.minLength === 1 ? "" : "s"
              }`,
          ],
        };
      } else if (input.length > this.maxLength) {
        return {
          errors: true,
          messagesTree: [
            this.maxLengthMessage ||
              (moreThanMaximumDefaultMessage &&
                moreThanMaximumDefaultMessage(this.maxLength)) ||
              `Must have less than ${this.maxLength} item${
                this.maxLength === 1 ? "" : "s"
              }`,
          ],
        };
      }

      for (let index = 0; index < input.length; index++) {
        const element = input[index];

        const result = elementsSchema.validate(element, options);

        if (result.errors) {
          if (options?.abortEarly) {
            return {
              errors: true,
              messagesTree: {
                [index]: result.messagesTree,
              },
            };
          } else {
            errors[index] = result.messagesTree;
          }
        } else {
          validatedArray.push(result.value);
        }
      }

      if (Object.keys(errors).length > 0) {
        return {
          errors: true,
          messagesTree: errors,
        };
      } else {
        return {
          errors: false,
          value: validatedArray,
        };
      }
    });
  }

  required(message?: string): ArraySchemaImpl<ElementsSchema, _Shape, _Shape> {
    this.markAsRequiredInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  notNull(
    message?: string
  ): ArraySchemaImpl<ElementsSchema, _Shape, Exclude<_Output, null>> {
    this.markAsNotNullInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  defined(
    message?: string
  ): ArraySchemaImpl<ElementsSchema, _Shape, Exclude<_Output, undefined>> {
    this.markAsDefinedInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  wrapIfNotAnArray(): ArraySchemaImpl<Schema<unknown>, _Shape, _Shape> {
    this.wrapValueBeforeValidation = (input): undefined | null | unknown[] => {
      if (input instanceof Array) {
        return input as unknown[];
      } else {
        // Convert null and undefined by using loose equality '=='
        if (input == undefined) {
          return [];
        } else {
          return [input];
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  min(length: number, message?: string): this {
    this.minLength = length;
    this.minLengthMessage = message;

    return this;
  }

  max(length: number, message?: string): this {
    this.maxLength = length;
    this.maxLengthMessage = message;

    return this;
  }
}

export class ArraySchema<
  ElementsSchema extends ElementsSchemaBase
> extends ArraySchemaImpl<ElementsSchema> {}

export function array<ElementsSchema extends ElementsSchemaBase>(
  elementsSchema: ElementsSchema,
  message?: string
): ArraySchema<ElementsSchema> {
  return new ArraySchema<ElementsSchema>(elementsSchema, message);
}
