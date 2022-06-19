export type DefaultErrorMessages = Partial<{
  object: Partial<{
    notAnObject: string;
  }>;
  array: Partial<{
    notAnArray: string;
    lessThanMinimum: (minLength: number) => string;
    moreThanMaximum: (maxLength: number) => string;
  }>;
  base: Partial<{
    cannotBeNull: string;
    cannotBeUndefined: string;
    isRequired: string;
  }>;
  equals: Partial<{
    notEqual: string;
  }>;
  number: Partial<{
    notANumber: string;
  }>;
  string: Partial<{
    notAString: string;
  }>;
  date: Partial<{
    notADate: string;
    invalidDate: string;
  }>;
  boolean: Partial<{
    notABoolean: string;
  }>;
}>;
