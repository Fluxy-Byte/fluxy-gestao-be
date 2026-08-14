export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

function sameMonth(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// Calcula a próxima ocorrência de uma OS fixa a partir de `from`, seguindo a regra
// combinada com o usuário para os dois checkboxes (podem ser marcados juntos):
// - só "toda semana": repete no mesmo dia da semana e horário, mas só dentro do mês da
//   OS original (originDate) — ao cruzar para o mês seguinte, a série termina sozinha
//   (retorna null), sem precisar de data de fim configurada.
// - só "todo mês": repete no mesmo dia do mês e horário, para sempre.
// - as duas juntas: repete toda semana, para sempre (não fica preso a um único mês).
export function nextOrderOccurrence(
    originDate: Date,
    from: Date,
    recurWeekly: boolean,
    recurMonthly: boolean,
): Date | null {
    if (recurWeekly) {
        const next = addDays(from, 7);
        if (!recurMonthly && !sameMonth(next, originDate)) return null;
        return next;
    }
    if (recurMonthly) {
        return addMonths(from, 1);
    }
    return null;
}
