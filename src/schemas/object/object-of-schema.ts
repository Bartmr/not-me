import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";
import { BaseSchema } from "../base/base-schema";
import { InferType, Schema } from "../schema";
import { BaseType, objectTypeFilter } from "./object-type-filter";

type FieldsSchemaBase = Schema<unknown>;

abstract class ObjectOfSchemaImpl<
  FieldsSchema extends FieldsSchemaBase,
  _Shape = { [key: string]: InferType<FieldsSchema> },
  _Output extends _Shape | undefined = _Shape | undefined
> extends BaseSchema<BaseType, _Shape, _Output> {
  constructor(fieldsSchema: FieldsSchema, message?: string) {
    super((input) => objectTypeFilter(input, message));

    this.addShapeFilter((input, options) => {
      const _input = input as { [key: string]: unknown };
      const finalValue: { [key: string]: unknown } = {};
      const errors: { [key: string]: AnyErrorMessagesTree } = {};

      for (const fieldKey in _input) {
        const fieldValue = _input[fieldKey];

        const result = fieldsSchema.validate(fieldValue, options);

        if (result.errors) {
          if (options?.abortEarly) {
            return {
              errors: true,
              messagesTree: {
                [fieldKey]: result.messagesTree,
              },
            };
          } else {
            errors[fieldKey] = result.messagesTree;
          }
        } else {
          finalValue[fieldKey] = result.value;
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
          value: finalValue,
        };
      }
    });
  }

  required(message?: string): ObjectOfSchemaImpl<FieldsSchema, _Shape, _Shape> {
    this.markAsRequiredInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}

export class ObjectOfSchema<
  FieldsSchema extends FieldsSchemaBase
> extends ObjectOfSchemaImpl<FieldsSchema> {}

export function objectOf<FieldsSchema extends FieldsSchemaBase>(
  fieldsSchema: FieldsSchema,
  message?: string
): ObjectOfSchema<FieldsSchema> {
  return new ObjectOfSchema<FieldsSchema>(fieldsSchema, message);
}
