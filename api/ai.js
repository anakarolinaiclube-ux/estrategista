import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Configuração de CORS para permitir que o front fale com o back
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { concurso, banca, horas, nivel, dataProva } = req.body;

    const prompt = `
      Você é um estrategista especialista em concursos públicos.
      Crie um plano claro, realista e motivador, sem promessas irreais.

      DADOS DO ALUNO:
      - Concurso Alvo: ${concurso}
      - Banca Organizadora: ${banca}
      - Tempo Disponível: ${horas} horas por dia
      - Nível Atual: ${nivel}
      - Data da Prova (previsão): ${dataProva}

      Estrutura obrigatória da resposta (usar HTML sem tags html/body):
      <h2>Diagnóstico Inicial</h2>
      [Análise breve sobre a dificuldade do concurso ${concurso} e o perfil da banca ${banca}]

      <h2>Plano de Estudos Semanal Personalizado</h2>
      [Tabela ou lista HTML simples com sugestão de divisão de matérias para ${horas} horas diárias]

      <h2>Distribuição Estratégica das Matérias</h2>
      [O que priorizar baseado no perfil da banca ${banca}]

      <h2>Simulador de Aprovação por Banca</h2>
      [Uma simulação fictícia baseada em estatísticas gerais: Qual nota de corte estimada e quantos acertos são necessários por matéria para ter chance real]

      <h2>Pontos de Atenção e Riscos</h2>
      [Onde a maioria dos candidatos reprova nesta banca]

      <h2>Plano de Contingência (se perder dias)</h2>
      [O que fazer se ficar doente ou tiver imprevistos para não perder o ritmo]

      <h2>Checklist Diário do Concurseiro</h2>
      [3 a 5 itens práticos]

      Regras:
      - NÃO faça perguntas
      - NÃO explique cálculos
      - NÃO cite fontes
      - NÃO prometa aprovação
      - Use linguagem clara, humana e estratégica
      - Use <p>, <strong>, <ul>, <li> e <br> para formatação
      - Gere apenas o conteúdo interno (sem <html>, <body>)
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo rápido e eficiente
      messages: [
        { role: "system", content: "Você é um mentor estratégico de concursos." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const htmlContent = completion.choices[0].message.content;

    return res.status(200).json({ result: htmlContent });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: "<p style='color:red'>Erro ao gerar o plano. Verifique a chave da API ou tente novamente.</p>" });
  }
}