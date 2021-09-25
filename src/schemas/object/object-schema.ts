import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";
import { BaseSchema } from "../base/base-schema";
import {
  ValidationResult,
  InferType,
  Schema,
  ValidationOptions,
} from "../schema";
import { BaseType, objectTypeFilter } from "./object-type-filter";

type SchemaObjectBase = { [key: string]: Schema<unknown> | undefined };

type SchemaObjToShape<SchemasObj extends SchemaObjectBase> = {
  [K in keyof SchemasObj]: SchemasObj[K] extends Schema<unknown>
    ? InferType<SchemasObj[K]>
    : never;
};

class ObjectSchemaImpl<
  SchemaObj extends SchemaObjectBase,
  _Shape = SchemaObjToShape<SchemaObj>,
  _Output = _Shape | undefined | null
> extends BaseSchema<BaseType, _Shape, _Output> {
  constructor(schemaObj: SchemaObj, message?: string) {
    super((input) => {
      return objectTypeFilter(input, message);
    });

    this.addShapeFilter((value: BaseType, options) => {
      return this.validateObj(schemaObj, value, options);
    });

    this.mapMode = true;
  }

  private validateObj<
    PartialSchemaObj extends {
      [key: string]: Schema<unknown> | undefined;
    }
  >(
    schemaObj: PartialSchemaObj,
    value: BaseType,
    options: ValidationOptions
  ): ValidationResult<{ [key: string]: unknown }> {
    const _value = value as { [key: string]: unknown };
    const finalValue: { [key: string]: unknown } = {};

    const errorsFieldsErrorMessages: {
      [key: string]: AnyErrorMessagesTree;
    } = {};

    for (const fieldKey of Object.keys(schemaObj)) {
      const fieldSchema = schemaObj[fieldKey];

      if (fieldSchema === undefined) continue;

      const fieldResult = fieldSchema.validate(_value[fieldKey], options);

      if (fieldResult.errors) {
        if (options?.abortEarly) {
          return {
            errors: true,
            messagesTree: [
              {
                [fieldKey]: fieldResult.messagesTree,
              },
            ],
          };
        } else {
          errorsFieldsErrorMessages[fieldKey] = fieldResult.messagesTree;
        }
      } else {
        finalValue[fieldKey] = fieldResult.value;
      }
    }

    if (Object.keys(errorsFieldsErrorMessages).length > 0) {
      return {
        errors: true,
        messagesTree: [errorsFieldsErrorMessages],
      };
    } else {
      return {
        errors: false,
        value: finalValue,
      };
    }
  }

  union<
    SchemaFactory extends (
      value: SchemaObjToShape<SchemaObj>
    ) => SchemaObjectBase,
    ResultSchemaObj extends SchemaObjectBase = Omit<
      SchemaObj,
      keyof ReturnType<SchemaFactory>
    > &
      ReturnType<SchemaFactory>,
    Result = SchemaObjToShape<ResultSchemaObj>
  >(
    schemaFactory: SchemaFactory
  ): ObjectSchemaImpl<
    ResultSchemaObj,
    Result,
    Result | Exclude<_Output, _Shape>
  > {
    this.addShapeFilter((input, options) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const schema = schemaFactory(input as any);

      const result = this.validateObj(schema, input, options);

      if (result.errors) {
        return result;
      } else {
        return {
          errors: false,
          value: result.value,
        };
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  required(message?: string): ObjectSchemaImpl<SchemaObj, _Shape, _Shape> {
    this.markAsRequiredInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  notNull(
    message?: string
  ): ObjectSchemaImpl<SchemaObj, _Shape, Exclude<_Output, null>> {
    this.markAsNotNullInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  defined(
    message?: string
  ): ObjectSchemaImpl<SchemaObj, _Shape, Exclude<_Output, undefined>> {
    this.markAsDefinedInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}

export class ObjectSchema<
  SchemaObj extends { [key: string]: Schema<unknown> }
> extends ObjectSchemaImpl<SchemaObj> {}

export function object<SchemaObj extends { [key: string]: Schema<unknown> }>(
  schemaObj: SchemaObj,
  message?: string
): ObjectSchema<SchemaObj> {
  return new ObjectSchema<SchemaObj>(schemaObj, message);
}
