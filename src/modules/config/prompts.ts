export const EXTRACT_IMAGES_PROMPT = `
Extraia o NOME DO CLIENTE e o TOTAL BRUTO da tabela da página que irei enviar. Retorne apenas o que foi extraido, sem nenhuma outra informação, formatado como "NOME: {NOME DO CLIENTE}, TOTAL: {TOTAL BRUTO}" para cada linha da tabela. {only_with_ok}`;

export const FORMAT_DATA_INTO_JSON_PROMPT = `
Formate os dados que foram extraídos de uma tabela para um ARRAY JSON.

DADOS: "{extract_data}"`;
