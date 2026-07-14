export function serialize<T>(value: T): T {
    return JSON.parse(
        JSON.stringify(value, (_key, val) => (typeof val === "bigint" ? Number(val) : val)),
    );
}
