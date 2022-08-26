const SplittingStrategies = {
    ANYWHERE: (input, offset, limit) => (offset + limit),
    ON_WHITESPACE: (input, offset, limit) => onChars(input, offset, limit, /\s/),
    ON_NEW_LINE: (input, offset, limit) => onChars(input, offset, limit, /\n/),
}

function onChars(input, offset, limit, regex) {
    for (let i = offset + limit; i >= offset; i--) {
        if (regex.test(input[i])) {
            return i;
        }
    }
    return -1;
}

function splitString(
    string,
    limit,
    trim = true,
    strategies = [SplittingStrategies.ANYWHERE]
) {
    let splits = [];
    let offset = 0;

    while (offset < string.length) {
        let chunk;
        if (string.length - offset <= limit) {
            chunk = string.substring(offset);
            offset = string.length;
        } else {
            for (const strategy of strategies) {
                let newOffset = strategy(string, offset, limit);
                if (newOffset > offset) {
                    newOffset = Math.min(newOffset, string.length);
                    chunk = string.substring(offset, newOffset);
                    offset = newOffset;
                    break;
                }
            }
        }

        if (chunk == null) {
            throw new Error(`You forgot to add a splitting strategy!`);
        }
        if (trim) {
            chunk = chunk.trim();
        }
        if (chunk.length > 0) {
            splits.push(chunk);
        }
    }

    return splits;
}

export { splitString, SplittingStrategies };