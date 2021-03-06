# textmasks

[![npm](https://img.shields.io/npm/v/textmasks)](https://www.npmjs.com/package/textmasks)

Experimental typescript/javascript lib for masking texts.

## Installation guide

```bash
npm install textmasks --save
```

## Mask options

TBC...

### Default definitions

Default definitions for all numbers and alphabetical characters:

| Char(s) | Description         | Expression  |
| ------- | ------------------- | ----------- |
| a-z     | Lower case letters  | `/^[a-z]$/` |
| A-Z     | Uppser case letters | `/^[A-Z]$/` |
| 0-9     | Numbers             | `/^[0-9]$/` |

## Work with the string extension

```typescript
'123456'.mask('(999)-999', options);
```

## Examples

Direct match:

```typescript
import { maskText } from 'textmasks';

const result = maskText({
  text: '123456',
  mask: '(9)99-999',
});

result.output === '(1)23-456'; // true
```

Partial mask output:

```typescript
import { maskText } from 'textmasks';

const result = maskText({
  text: '123',
  mask: '(9)99-999',
  options: {
    partialOutput: true,
  },
});

result.output === '(1)123-'; // true
```

Full mask output with RTL-direction:

```typescript
import { maskText } from 'textmasks';

const result = maskText({
  text: '12',
  mask: '(9)99-999',
  options: {
    placeholder: '_',
    partialOutput: false,
    direction: 'rtl',
  },
});

result.output === '(_)__-_21'; // true
```
