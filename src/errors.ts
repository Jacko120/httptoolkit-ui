export function reportError(error: Error | string | unknown, metadata: object = {}) {
    console.log('Reporting error:', error, metadata);
}