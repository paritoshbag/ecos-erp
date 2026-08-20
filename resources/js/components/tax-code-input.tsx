import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { useState } from 'react';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';

type TaxCodeKind = 'pan' | 'gst';

type SlotRule = 'letter' | 'digit' | 'entity' | 'z' | 'check';

const CODES: Record<
    TaxCodeKind,
    {
        length: number;
        placeholder: string;
        groups: number[];
        rules: SlotRule[];
        hint: string;
    }
> = {
    pan: {
        length: 10,
        placeholder: 'AAAAA0000A',
        groups: [5, 4, 1],
        rules: [
            'letter',
            'letter',
            'letter',
            'letter',
            'letter',
            'digit',
            'digit',
            'digit',
            'digit',
            'letter',
        ],
        hint: '10 characters · 5 letters, 4 digits, 1 letter',
    },
    gst: {
        length: 15,
        placeholder: '00AAAAA0000A1Z5',
        groups: [2, 5, 4, 1, 1, 1, 1],
        rules: [
            'digit',
            'digit',
            'letter',
            'letter',
            'letter',
            'letter',
            'letter',
            'digit',
            'digit',
            'digit',
            'digit',
            'letter',
            'entity',
            'z',
            'check',
        ],
        hint: '15 characters · GSTIN',
    },
};

function groupStarts(groups: number[]): number[] {
    const starts: number[] = [];
    let offset = 0;

    for (const size of groups) {
        starts.push(offset);
        offset += size;
    }

    return starts;
}

function isAllowedAt(char: string, rule: SlotRule | undefined): boolean {
    if (rule === undefined) {
        return false;
    }

    switch (rule) {
        case 'letter':
            return /[A-Z]/.test(char);
        case 'digit':
            return /[0-9]/.test(char);
        case 'entity':
            return /[1-9A-Z]/.test(char);
        case 'z':
            return char === 'Z';
        case 'check':
            return /[0-9A-Z]/.test(char);
    }
}

function sanitizeTaxCode(raw: string, rules: SlotRule[]): string {
    const chars = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let value = '';

    for (const char of chars) {
        if (value.length >= rules.length) {
            break;
        }

        if (isAllowedAt(char, rules[value.length])) {
            value += char;
        }
    }

    return value;
}

export default function TaxCodeInput({
    id,
    name,
    kind,
    value,
    defaultValue = '',
    disabled = false,
    invalid = false,
    onBlur,
    onChange,
}: {
    id: string;
    name: string;
    kind: TaxCodeKind;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    invalid?: boolean;
    onBlur?: () => void;
    onChange?: (value: string) => void;
}) {
    const code = CODES[kind];
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(() =>
        sanitizeTaxCode(defaultValue, code.rules),
    );
    const currentValue = isControlled
        ? sanitizeTaxCode(value, code.rules)
        : uncontrolledValue;

    return (
        <div className="grid gap-1.5">
            <InputOTP
                id={id}
                name={name}
                maxLength={code.length}
                value={currentValue}
                onChange={(next) => {
                    const sanitized = sanitizeTaxCode(next, code.rules);

                    if (!isControlled) {
                        setUncontrolledValue(sanitized);
                    }

                    onChange?.(sanitized);
                }}
                onBlur={onBlur}
                disabled={disabled}
                required
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                pasteTransformer={(pasted) =>
                    pasted.replace(/[^A-Za-z0-9]/g, '')
                }
                pushPasswordManagerStrategy="none"
                aria-invalid={invalid}
                aria-describedby={`${id}-hint`}
                containerClassName="flex flex-wrap items-center gap-1.5 sm:gap-2"
            >
                {groupStarts(code.groups).map((start, groupIndex) => (
                    <InputOTPGroup key={groupIndex}>
                        {Array.from(
                            { length: code.groups[groupIndex] ?? 0 },
                            (_, slotIndex) => {
                                const index = start + slotIndex;

                                return (
                                    <InputOTPSlot
                                        key={index}
                                        index={index}
                                        placeholder={code.placeholder[index]}
                                        className="h-8 w-7 font-mono text-xs uppercase sm:h-9 sm:w-8 sm:text-sm"
                                    />
                                );
                            },
                        )}
                    </InputOTPGroup>
                ))}
            </InputOTP>
            <p
                id={`${id}-hint`}
                className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
            >
                <span>{code.hint}</span>
                <span
                    className={cn(
                        'font-mono tabular-nums',
                        currentValue.length === code.length &&
                            'text-foreground',
                    )}
                >
                    {currentValue.length}/{code.length}
                </span>
            </p>
        </div>
    );
}
