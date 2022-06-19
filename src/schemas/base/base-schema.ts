import { DefaultErrorMessagesManager } from "../../error-messages/default-messages/default-error-messages-manager";
import { throwError } from "../../utils/throw-error";
import {
  ValidationResult,
  Schema,
  ValidationOptions,
  AcceptedValueValidationResult,
  InferType,
} from "../schema";

enum FilterType {
  BaseType = "base-type",
  Shape = "shape",
  Test = "test",
  Transform = "transform",
  UndefinedCatching = "undefined-catching",
  NullCatchingFilter = "null-catching",
  NullableCatchingFilter = "nullable-catching",
}

type BaseTypeFilter<BaseType> = {
  type: FilterType.BaseType;
  filterFn: (
    input: unknown,
    options: ValidationOptions
  ) => ValidationResult<BaseType>;
};

type ShapeFilter<Type> = {
  type: FilterType.Shape;
  filterFn: (input: Type, options: ValidationOptions) => ValidationResult<Type>;
};

type TestFilter<V> = {
  type: FilterType.Test;
  filterFn: (value: V) => null | string;
};

type TransformFilter<V, R> = {
  type: FilterType.Transform;
  filterFn: (value: V) => R;
};

type UndefinedCatchingFilter = {
  type: FilterType.UndefinedCatching;
  message: string;
};

type NullCatchingFilter = {
  type: FilterType.NullCatchingFilter;
  message: string;
};

type NullableCatchingFilter = {
  type: FilterType.NullableCatchingFilter;
  message: string;
};

export abstract class BaseSchema<
  BaseType,
  Shape extends BaseType = BaseType,
  _Output = Shape | undefined | null
> implements Schema<_Output>
{
  _outputType!: _Output;

  protected wrapValueBeforeValidation?: (input: unknown) => unknown;

  private baseTypeFilter: BaseTypeFilter<BaseType>;
  private shapeFilters: ShapeFilter<BaseType>[] = [];
  private otherFilters: Array<
    | TestFilter<InferType<this>>
    | TransformFilter<InferType<this>, unknown>
    | UndefinedCatchingFilter
    | NullCatchingFilter
    | NullableCatchingFilter
  > = [];

  protected mapMode?: boolean;

  constructor(typeFilterFn: BaseTypeFilter<BaseType>["filterFn"]) {
    this.baseTypeFilter = {
      type: FilterType.BaseType,
      filterFn: typeFilterFn,
    };
  }

  protected addShapeFilter(filterFn: ShapeFilter<BaseType>["filterFn"]): void {
    this.shapeFilters.push({
      type: FilterType.Shape,
      filterFn,
    });
  }

  validate(
    input: unknown,
    options?: ValidationOptions
  ): ValidationResult<_Output> {
    const _options: ValidationOptions = options;

    let _currentValue = input;

    if (this.wrapValueBeforeValidation) {
      _currentValue = this.wrapValueBeforeValidation(_currentValue);
    }

    // Ignore null and undefined by using loose equality '!='
    if (_currentValue != undefined) {
      /*
        BASE TYPE FILTER
      */

      const typeFilterResponse = this.baseTypeFilter.filterFn(
        _currentValue,
        _options
      );

      if (typeFilterResponse.errors) {
        return typeFilterResponse;
      } else {
        _currentValue = typeFilterResponse.value;
      }

      /*
        SHAPE FILTERS
      */

      let shapedValue: BaseType;

      if (this.mapMode) {
        shapedValue = {} as BaseType;

        /* 
          Used with ObjectSchema.union(),
          in order make the object more precise as it goes through many filters,
          including transform() calls on each of its properties
        */
        let shapedValueWithUnknownProperties = {
          /*
            Avoid changing the original object instance (which might even break the expected types from it, when running transformations),
            by cloning it

            Also fixes errors like 'TypeError: Cannot set property x of #<y> which has only a getter'

            We can assume it's an object since only the ObjectSchema sets this.mapMode.
            We also know it's an object because we already went through the type filter
          */
          ...(_currentValue as { [key: string]: unknown }),
        } as unknown as BaseType;

        for (let i = 0; i < this.shapeFilters.length; i++) {
          const shapeFilter = this.shapeFilters[i] || throwError();

          const filterRes = shapeFilter.filterFn(
            shapedValueWithUnknownProperties,
            _options
          );

          if (filterRes.errors) {
            return filterRes;
          } else {
            shapedValue = Object.assign(shapedValue, filterRes.value);
            shapedValueWithUnknownProperties = Object.assign(
              shapedValueWithUnknownProperties,
              filterRes.value
            );
          }
        }
      } else {
        shapedValue = _currentValue as BaseType;

        for (let i = 0; i < this.shapeFilters.length; i++) {
          const shapeFilter = this.shapeFilters[i] || throwError();

          const filterRes = shapeFilter.filterFn(shapedValue, _options);

          if (filterRes.errors) {
            return filterRes;
          } else {
            shapedValue = filterRes.value;
          }
        }
      }

      _currentValue = shapedValue;
    }

    /*
      OTHER FILTERS
    */
    const testFiltersErrors: string[] = [];

    for (const filter of this.otherFilters) {
      if (filter.type === FilterType.Test) {
        const result = filter.filterFn(_currentValue as InferType<this>);

        if (result === null) {
          continue;
        } else {
          if (_options?.abortEarly) {
            return {
              errors: true,
              messagesTree: [result],
            };
          } else {
            testFiltersErrors.push(result);
            continue;
          }
        }
      } else if (filter.type === FilterType.Transform) {
        _currentValue = filter.filterFn(_currentValue as InferType<this>);
      } else if (filter.type === FilterType.NullableCatchingFilter) {
        // Catch null and undefined by using loose equality '=='
        if (_currentValue == undefined) {
          return {
            errors: true,
            messagesTree: [filter.message],
          };
        }

        continue;
      } else if (filter.type === FilterType.UndefinedCatching) {
        if (_currentValue === undefined) {
          return {
            errors: true,
            messagesTree: [filter.message],
          };
        }

        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      else if (filter.type === FilterType.NullCatchingFilter) {
        if (_currentValue === null) {
          return {
            errors: true,
            messagesTree: [filter.message],
          };
        }

        continue;
      } else {
        throw new Error();
      }
    }

    if (testFiltersErrors.length > 0) {
      return {
        errors: true,
        messagesTree: testFiltersErrors,
      };
    }

    return {
      errors: false,
      value: _currentValue,
    } as AcceptedValueValidationResult<InferType<this>>;
  }

  protected markAsDefinedInternally(message: undefined | string): void {
    this.otherFilters.push({
      type: FilterType.UndefinedCatching,
      message:
        message ||
        DefaultErrorMessagesManager.getDefaultMessages().base
          ?.cannotBeUndefined ||
        "Input must be defined",
    });
  }

  protected markAsNotNullInternally(message: undefined | string): void {
    this.otherFilters.push({
      type: FilterType.NullCatchingFilter,
      message:
        message ||
        DefaultErrorMessagesManager.getDefaultMessages().base?.cannotBeNull ||
        "Input cannot be null",
    });
  }

  protected markAsRequiredInternally(message: undefined | string): void {
    this.otherFilters.push({
      type: FilterType.NullableCatchingFilter,
      message:
        message ||
        DefaultErrorMessagesManager.getDefaultMessages().base?.isRequired ||
        "Input is required",
    });
  }

  public abstract required(message?: string): Schema<Shape>;
  public abstract defined(
    message?: string
  ): Schema<Exclude<_Output, undefined>>;
  public abstract notNull(message?: string): Schema<Exclude<_Output, null>>;

  test(testFunction: (value: _Output) => null | string): this {
    this.otherFilters.push({
      type: FilterType.Test,
      filterFn: testFunction,
    });

    return this;
  }

  transform<TransformFunction extends (value: _Output) => unknown>(
    transformFunction: TransformFunction
  ): Schema<ReturnType<TransformFunction>> {
    this.otherFilters.push({
      type: FilterType.Transform,
      filterFn: transformFunction,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}
