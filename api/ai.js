import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
      Atue como um Mentor de Elite para Concursos Públicos.
      Gere um plano estratégico visual e estruturado em HTML para:
      - Concurso: ${concurso}
      - Banca: ${banca}
      - Perfil: ${nivel}
      - Horas/dia: ${horas}
      - Prova: ${dataProva}

      REGRAS DE FORMATAÇÃO (HTML PURO):
      1. NÃO use tags <html>, <head>, <body>. Retorne apenas o conteúdo interno.
      2. Use as classes CSS especificadas abaixo para estilização automática no frontend.
      3. Seja numérico e específico nas estimativas.

      ESTRUTURA DA RESPOSTA:

      <!-- SEÇÃO 1: DADOS PARA GRÁFICOS (HIDDEN) -->
      <!-- Estime de 0 a 100: Dificuldade da Banca, Exigência do Cargo, Compatibilidade do Perfil -->
      <div id="ai-chart-data" 
           data-difficulty="[INSERIR NUMERO 0-100]" 
           data-demand="[INSERIR NUMERO 0-100]" 
           data-compatibility="[INSERIR NUMERO 0-100]">
      </div>

      <!-- SEÇÃO 2: DIAGNÓSTICO -->
      <div class="section-title">
          <h2>Diagnóstico Estratégico</h2>
          <p>Análise de compatibilidade com a banca <strong>${banca}</strong></p>
      </div>
      <div class="diagnosis-text">
        [Texto curto e direto (max 3 linhas) sobre a "pegada" da banca para este cargo]
      </div>

      <!-- SEÇÃO 3: PLANO SEMANAL (GRID) -->
      <div class="section-title">
          <h2>Ciclo Semanal de Elite</h2>
      </div>
      <div class="weekly-grid">
         <!-- Repita para Seg a Dom -->
         <div class="day-card">
            <div class="day-header">Segunda</div>
            <div class="day-content">
               [Matéria 1]<br>
               [Matéria 2]<br>
               <span class="tag">Revisão</span>
            </div>
         </div>
         <!-- ... outros dias ... -->
         <div class="day-card">
            <div class="day-header">Domingo</div>
            <div class="day-content">Simulado + Correção</div>
         </div>
      </div>

      <!-- SEÇÃO 4: MATÉRIAS E RISCOS -->
      <div class="section-title">
          <h2>Radar de Matérias</h2>
      </div>
      <div class="cards-container">
          <!-- Gere 3 a 4 cards das matérias mais importantes -->
          <div class="strategy-card border-left-red">
             <h3>[Nome da Matéria Crítica]</h3>
             <span class="badge badge-high">Prioridade Alta</span>
             <p>[O que a banca mais cobra desta matéria]</p>
          </div>
          <div class="strategy-card border-left-yellow">
             <h3>[Nome da Matéria Base]</h3>
             <span class="badge badge-medium">Essencial</span>
             <p>[Foco tático sugerido]</p>
          </div>
          <!-- etc -->
      </div>

      <!-- SEÇÃO 5: SIMULADOR DE APROVAÇÃO -->
      <div class="section-title">
          <h2>Simulador de Cenários</h2>
      </div>
      <div class="simulator-box">
          <div class="scenario">
              <span>Cenário Conservador (Corte)</span>
              <div class="progress-bg"><div class="progress-fill" style="width: [INSERIR % ESTIMADA]%;"></div></div>
              <span class="score-text">[INSERIR %]% de acertos</span>
          </div>
          <div class="scenario">
              <span>Cenário Otimista (Nomeação)</span>
              <div class="progress-bg"><div class="progress-fill success" style="width: [INSERIR % MAIOR]%;"></div></div>
              <span class="score-text">[INSERIR %]% de acertos</span>
          </div>
          <p class="mt-2"><small>Baseado no histórico da ${banca}.</small></p>
      </div>

      <!-- SEÇÃO 6: CHECKLIST GAMIFICADO -->
      <div class="section-title">
          <h2>Protocolo Diário</h2>
      </div>
      <div class="checklist-container">
          <label class="check-item">
              <input type="checkbox">
              <span>Resolver 15 questões de [Matéria do Dia]</span>
          </label>
          <label class="check-item">
              <input type="checkbox">
              <span>Lei Seca / Leitura por 30min</span>
          </label>
          <label class="check-item">
              <input type="checkbox">
              <span>Revisão Ativa (Flashcards/Resumo)</span>
          </label>
          <div class="progress-bar-container">
             <div class="daily-progress" id="daily-progress-bar" style="width: 0%"></div>
          </div>
          <p class="text-center"><small>Complete para ganhar XP mental.</small></p>
      </div>
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é uma IA especialista em concursos de alto nível." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    return res.status(200).json({ result: completion.choices[0].message.content });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: "<p class='error'>Erro ao gerar estratégia. Tente novamente.</p>" });
  }
}
