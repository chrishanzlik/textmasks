import { FlatType } from './flat-type';
import { MaskDefinition } from './mask-definition';
import { DEFAULT_SETTINGS, MaskingOptions } from './masking-options';
import { MaskTextParameters } from './mask-text-parameters';
import { MaskingResult } from './masking-result';

export function maskText(settings: {
  text: string;
  mask: string;
  options?: MaskingOptions;
}): FlatType<MaskingResult>;
export function maskText(settings: MaskTextParameters): MaskingResult {
  validateParameters(settings);

  const {
    text: input,
    mask,
    options,
  } = {
    ...settings,
    options: mergeSettings(DEFAULT_SETTINGS, settings.options ?? {}),
  };

  let success = true;
  let inputPtr = 0;
  let target = Array<string | undefined>(mask.length).fill(undefined);

  for (let i = 0; i < mask.length; i++) {
    const index = options.direction === 'ltr' ? i : mask.length - 1 - i;

    if (charCanBeSwapped(mask[index], options)) {
      const { isMatch, outputText } = processCharMatch(
        input.charAt(inputPtr++),
        mask[index],
        options
      );

      const placeholder =
        inputPtr > input.length ? undefined : options.invalidCharPlaceholder;

      target[index] = isMatch ? outputText : placeholder;
      success &&= isMatch;
    } else {
      target[index] = inputPtr > input.length ? undefined : mask[index];
    }
  }

  if (!options.partialOutput) {
    target = mapToFullMaskOutput(target, mask, options);
  }

  return { success, mask, input, output: target.join('').trim() };
}

function validateParameters(params: MaskTextParameters): void {
  if (!params) {
    throw new Error('A parameter object is required.');
  }

  if (params.text === undefined || params.text === null) {
    throw new Error('Null or undefined is not allowed for "text" parameter.');
  }

  if (!params.mask) {
    throw new Error('The "mask" parameter must provide a value.');
  }
}

function mapToFullMaskOutput(
  target: (string | undefined)[],
  mask: string,
  options: MaskingOptions
): (string | undefined)[] {
  return target.map((char, index) => {
    if (char !== undefined) {
      return char;
    }

    return !charCanBeSwapped(mask[index], options) ||
      options.placeholder === undefined
      ? mask.charAt(index)
      : options.placeholder;
  });
}

function mergeSettings(...settings: MaskingOptions[]): MaskingOptions {
  return settings.reduce((acc, next) => {
    const definitions = Object.assign({}, acc.definitions, next?.definitions);
    return Object.assign({}, acc, next, { definitions });
  }, {} as MaskingOptions);
}

function processCharMatch(
  inputChar: string,
  maskChar: string,
  options: MaskingOptions
): {
  isMatch: boolean;
  outputText: string;
} {
  const maskDefinition = options?.definitions && options.definitions[maskChar];
  if (maskDefinition === null) {
    return { isMatch: false, outputText: inputChar };
  }

  if (options.autocapitalize && isAlphabetical(inputChar)) {
    inputChar = adjustCapitalization(maskChar, inputChar);
  }

  return {
    isMatch: validateInputChar(inputChar, maskDefinition),
    outputText: inputChar,
  };
}

function validateInputChar(
  inputChar: string,
  definition?: MaskDefinition
): boolean {
  if (!definition?.validator) {
    return true;
  }

  if (typeof definition.validator === 'function') {
    return definition.validator(inputChar);
  } else {
    return definition.validator.test(inputChar);
  }
}

function adjustCapitalization(maskChar: string, inputChar: string): string {
  if (isUpperCase(maskChar) && !isUpperCase(inputChar)) {
    return inputChar.toUpperCase();
  } else if (!isUpperCase(maskChar) && isUpperCase(inputChar)) {
    return inputChar.toLowerCase();
  } else {
    return inputChar;
  }
}

function charCanBeSwapped(value: string, options: MaskingOptions): boolean {
  const definitionMatch = options?.definitions
    ? Object.keys(options?.definitions).indexOf(value) > -1
    : false;

  if (
    definitionMatch &&
    options.definitions &&
    options.definitions[value] === null
  ) {
    return false;
  }

  return definitionMatch || /^[a-zA-Z0-9]$/.test(value[0]);
}

function isUpperCase(value: string): boolean {
  return value === value.toUpperCase();
}

function isAlphabetical(value: string): boolean {
  return /^[a-zA-Z]$/.test(value[0]);
}
