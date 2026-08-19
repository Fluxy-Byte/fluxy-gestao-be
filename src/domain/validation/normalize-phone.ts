// Estratégia única de gravação de telefone no banco (Client e User): somente
// dígitos, sempre com o DDI 55 na frente — todo telefone salvo é potencialmente
// usado para contato/matching via WhatsApp. Considera que o DDI já está presente
// quando há 12+ dígitos começando com 55 (mesmo critério de user.repository.ts,
// findByPhone), evitando duplicar o prefixo em números cujo DDD também seja 55
// (ex: Santa Maria/RS).
export function normalizePhoneForStorage(phone: string): string | null {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return null;
    return digits.length >= 12 && digits.startsWith("55") ? digits : `55${digits}`;
}

// Alguns integrações externas (ex: Asaas) esperam o telefone sem o DDI — desfaz a
// normalização acima para esses casos pontuais.
export function stripCountryCode(stored: string | null | undefined): string {
    if (!stored) return "";
    const digits = stored.replace(/\D/g, "");
    return digits.length >= 12 && digits.startsWith("55") ? digits.slice(2) : digits;
}
