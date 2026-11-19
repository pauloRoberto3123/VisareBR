import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

type OptionTuple = [string, string];

interface FieldDef {
  id: string;
  type: 'num' | 'text' | 'tel' | 'select' | 'radio' | 'check';
  label: string;
  hint?: string;
  req?: boolean | ((a: FormAnswers) => boolean);
  min?: number;
  max?: number;
  minMsg?: string;
  ph?: string;
  ac?: string;
  money?: boolean;
  none?: string;
  opts?: OptionTuple[];
  show?: (a: FormAnswers) => boolean;
}

interface StepDef {
  title: string;
  sub: string;
  show?: (a: FormAnswers) => boolean;
  fields: FieldDef[];
}

interface FormAnswers {
  [key: string]: string | string[] | boolean | undefined;
  paises: string[];
  outros: string[];
  problemas: string[];
  ocup: string[];
  parentesGrau: string[];
  parentesStatus: string[];
}

const DEFAULT_WA = '5519998448417';

const OBJ: OptionTuple[] = [
  ['turismo', 'Turismo ou visitar família/amigos'],
  ['negocios', 'Negócios, feiras, congressos'],
  ['tratamento', 'Tratamento médico'],
  ['estudo', 'Estudar (inglês, graduação, curso técnico)'],
  ['intercambio', 'Intercâmbio, au pair, pesquisa, estágio'],
  ['trabalho', 'Trabalhar para empresa americana'],
  ['transferencia', 'Transferência pela empresa onde trabalho'],
  ['talento', 'Sou destaque na minha área (prêmios, reconhecimento)'],
  ['investir', 'Investir ou abrir empresa nos EUA'],
  ['morar', 'Morar nos EUA por meio de familiar'],
  ['casar', 'Casar com cidadão(ã) americano(a)'],
  ['acompanhar', 'Acompanhar cônjuge ou pai/mãe que terá visto'],
  ['naosei', 'Ainda não sei'],
];

const TEMP = ['turismo', 'negocios', 'tratamento', 'naosei'];
const TIES = ['turismo', 'negocios', 'tratamento', 'naosei', 'estudo', 'intercambio'];
const WORK = ['clt', 'servidor', 'empresario', 'mei', 'pj', 'autonomo'];
const FAMPAY = ['conjuge', 'pai', 'mae', 'pais', 'filho'];

const is = (a: FormAnswers, k: string, ...v: string[]) => v.includes(String(a[k] ?? ''));
const has = (a: FormAnswers, k: string, ...v: string[]) => {
  const val = a[k];
  return Array.isArray(val) && val.some((x) => v.includes(x));
};
const notMinor = (a: FormAnswers) => a.idade !== 'menor';

const num = (v: unknown): number => {
  const t = String(v ?? '')
    .replace(/[^\d,.]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return t ? parseFloat(t) : NaN;
};

const brl = (n: number): string =>
  isNaN(n) ? '' : 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function faixaIdade(n: number): string {
  if (isNaN(n)) return '';
  if (n < 18) return 'menor de idade';
  if (n <= 22) return 'até 22';
  if (n <= 25) return '23 a 25';
  const b = [30, 35, 40, 45, 50, 55, 60, 65];
  for (const x of b) if (n <= x) return `${x - 4} a ${x}`;
  return 'acima de 65';
}

const idadeTxt = (a: FormAnswers): string => {
  const n = num(a.idadeNum);
  return isNaN(n) ? '' : `${n} anos (faixa ${faixaIdade(n)})`;
};

const dias = (a: FormAnswers): number => {
  const t = String(a.estadia || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const m = t.match(/(\d+[.,]?\d*)\s*(dia|semana|mes|ano)?/);
  if (!m) return NaN;
  const n = parseFloat(m[1].replace(',', '.'));
  const u = (m[2] || (/ano/.test(t) ? 'ano' : /mes/.test(t) ? 'mes' : /semana/.test(t) ? 'semana' : 'dia')) as
    | 'dia'
    | 'semana'
    | 'mes'
    | 'ano';
  return Math.round(n * { dia: 1, semana: 7, mes: 30, ano: 365 }[u]);
};

const STEPS: StepDef[] = [
  {
    title: 'Objetivo nos EUA',
    sub: 'Conte sua idade e o principal motivo da sua ida.',
    fields: [
      { id: 'idadeNum', type: 'num', label: 'Sua idade (em anos)', req: true, min: 1, max: 110, minMsg: 'Digite uma idade válida', ph: 'Ex.: 34' },
      { id: 'obj', type: 'radio', label: 'O que você pretende fazer nos EUA?', req: true, opts: OBJ },
      {
        id: 'curso',
        type: 'radio',
        label: 'Que tipo de curso?',
        req: true,
        show: (a) => is(a, 'obj', 'estudo'),
        opts: [
          ['ingles', 'Inglês intensivo'],
          ['superior', 'Graduação, mestrado ou doutorado'],
          ['tecnico', 'Curso técnico ou profissionalizante'],
        ],
      },
      {
        id: 'i20',
        type: 'radio',
        label: 'Já tem aceite da escola (formulário I-20)?',
        req: true,
        show: (a) => is(a, 'obj', 'estudo'),
        opts: [
          ['sim', 'Sim'],
          ['andamento', 'Em andamento'],
          ['nao', 'Ainda não'],
        ],
      },
      {
        id: 'programa',
        type: 'radio',
        label: 'Qual programa?',
        req: true,
        show: (a) => is(a, 'obj', 'intercambio'),
        opts: [
          ['aupair', 'Au pair'],
          ['wat', 'Work and Travel'],
          ['pesquisa', 'Pesquisador ou professor'],
          ['estagio', 'Estágio ou trainee'],
        ],
      },
      {
        id: 'patrocinador',
        type: 'radio',
        label: 'Já tem patrocinador do programa (formulário DS-2019)?',
        req: true,
        show: (a) => is(a, 'obj', 'intercambio'),
        opts: [
          ['sim', 'Sim'],
          ['nao', 'Ainda não'],
        ],
      },
      {
        id: 'oferta',
        type: 'radio',
        label: 'Tem oferta de emprego de uma empresa americana disposta a patrocinar o visto?',
        req: true,
        show: (a) => is(a, 'obj', 'trabalho'),
        opts: [
          ['sim', 'Sim'],
          ['conversando', 'Em negociação'],
          ['nao', 'Não'],
        ],
      },
      {
        id: 'umano',
        type: 'radio',
        label: 'Trabalha há pelo menos 1 ano, nos últimos 3 anos, numa empresa que tem matriz, filial ou coligada nos EUA?',
        req: true,
        show: (a) => is(a, 'obj', 'transferencia'),
        opts: [
          ['sim', 'Sim'],
          ['nao', 'Não'],
        ],
      },
      {
        id: 'cargoL',
        type: 'radio',
        label: 'Seu cargo é de gestão/executivo ou de conhecimento especializado?',
        req: true,
        show: (a) => is(a, 'obj', 'transferencia'),
        opts: [
          ['sim', 'Sim'],
          ['nao', 'Não'],
        ],
      },
      {
        id: 'reconhecimento',
        type: 'radio',
        label: 'Você tem prêmios, publicações, mídia ou reconhecimento na sua área?',
        req: true,
        show: (a) => is(a, 'obj', 'talento'),
        opts: [
          ['sim', 'Sim, nacional ou internacional'],
          ['parcial', 'Algum reconhecimento'],
          ['nao', 'Ainda não'],
        ],
      },
      {
        id: 'posgrad',
        type: 'radio',
        label: 'Tem mestrado, doutorado ou mais de 5 anos de experiência após a graduação?',
        req: true,
        show: (a) => is(a, 'obj', 'talento'),
        opts: [
          ['sim', 'Sim'],
          ['nao', 'Não'],
        ],
      },
      {
        id: 'cidTratado',
        type: 'radio',
        label: 'Você tem outra cidadania além da brasileira (ex.: italiana)?',
        req: true,
        show: (a) => is(a, 'obj', 'investir'),
        opts: [
          ['sim', 'Sim'],
          ['nao', 'Não'],
        ],
      },
      {
        id: 'capital',
        type: 'select',
        label: 'Quanto pretende investir?',
        req: true,
        show: (a) => is(a, 'obj', 'investir'),
        opts: [
          ['ate500', 'Até R$ 500 mil'],
          ['ate2m', 'R$ 500 mil a R$ 2 milhões'],
          ['ate5m', 'R$ 2 a 5 milhões'],
          ['mais5m', 'Mais de R$ 5 milhões'],
        ],
      },
      {
        id: 'parente',
        type: 'radio',
        label: 'Qual familiar é cidadão americano ou tem green card?',
        req: true,
        show: (a) => is(a, 'obj', 'morar'),
        opts: [
          ['conjuge', 'Cônjuge'],
          ['pais', 'Pai ou mãe'],
          ['filho', 'Filho(a) maior de 21 anos'],
          ['irmao', 'Irmão ou irmã'],
          ['nenhum', 'Nenhum desses'],
        ],
      },
      {
        id: 'statusParente',
        type: 'radio',
        label: 'Esse familiar é:',
        req: true,
        show: (a) => is(a, 'obj', 'morar') && Boolean(a.parente) && a.parente !== 'nenhum',
        opts: [
          ['cidadao', 'Cidadão americano'],
          ['greencard', 'Residente permanente (green card)'],
        ],
      },
      {
        id: 'noivoCid',
        type: 'radio',
        label: 'Seu noivo(a) é cidadão(ã) americano(a)?',
        req: true,
        show: (a) => is(a, 'obj', 'casar'),
        opts: [
          ['sim', 'Sim'],
          ['nao', 'Não, tem outro status'],
        ],
      },
      {
        id: 'encontro',
        type: 'radio',
        label: 'Vocês se encontraram pessoalmente nos últimos 2 anos?',
        req: true,
        show: (a) => is(a, 'obj', 'casar'),
        opts: [
          ['sim', 'Sim'],
          ['nao', 'Não'],
        ],
      },
      {
        id: 'titular',
        type: 'radio',
        label: 'Qual visto o titular (cônjuge ou pai/mãe) terá?',
        req: true,
        show: (a) => is(a, 'obj', 'acompanhar'),
        opts: [
          ['F', 'Estudante (F-1)'],
          ['J', 'Intercâmbio (J-1)'],
          ['H', 'Trabalho (H)'],
          ['L', 'Transferência (L-1)'],
          ['outro', 'Outro / não sei'],
        ],
      },
      {
        id: 'relacao',
        type: 'radio',
        label: 'Você é:',
        req: true,
        show: (a) => is(a, 'obj', 'acompanhar'),
        opts: [
          ['conjuge', 'Cônjuge do titular'],
          ['filho', 'Filho(a) solteiro(a) menor de 21'],
          ['outro', 'Outro parente'],
        ],
      },
    ],
  },
  {
    title: 'Trabalho e renda',
    sub: 'Situação profissional e financeira no Brasil.',
    show: notMinor,
    fields: [
      {
        id: 'ocup',
        type: 'check',
        label: 'Qual a sua situação profissional hoje?',
        hint: 'Marque todas que se aplicam. Ex.: CLT e também atende como autônomo(a).',
        req: true,
        none: 'desempregado',
        opts: [
          ['clt', 'Empregado(a) com carteira (CLT)'],
          ['servidor', 'Servidor(a) público(a)'],
          ['empresario', 'Empresário(a) / sócio(a) com CNPJ'],
          ['mei', 'MEI (microempreendedor individual)'],
          ['pj', 'PJ (presta serviço com CNPJ para outra empresa)'],
          ['autonomo', 'Autônomo(a) sem CNPJ / profissional liberal'],
          ['aposentado', 'Aposentado(a) ou pensionista'],
          ['estudante', 'Estudante'],
          ['lar', 'Do lar'],
          ['desempregado', 'Sem trabalho no momento'],
        ],
      },
      {
        id: 'empresa',
        type: 'text',
        label: 'Emprego atual: onde você trabalha e qual o seu cargo ou área de atuação',
        hint: 'Informe o nome da empresa (ou se trabalha por conta própria) e a sua função. Se tiver mais de um trabalho, inclua todos.',
        req: true,
        show: (a) => has(a, 'ocup', ...WORK),
        ph: 'Ex.: Hospital São Lucas – enfermeira (CLT)',
      },
      {
        id: 'tempo',
        type: 'radio',
        label: 'Há quanto tempo está na sua ocupação principal?',
        req: true,
        show: (a) => has(a, 'ocup', ...WORK),
        opts: [
          ['m6', 'Menos de 6 meses'],
          ['a1', '6 meses a 1 ano'],
          ['a3', '1 a 3 anos'],
          ['a5', '3 a 5 anos'],
          ['a5p', 'Mais de 5 anos'],
        ],
      },
      {
        id: 'rendaNum',
        type: 'num',
        money: true,
        label: 'Sua renda mensal individual (R$)',
        hint: 'Digite o valor aproximado que você recebe por mês. Ex.: 3.500',
        req: (a) => has(a, 'ocup', ...WORK, 'aposentado'),
        show: (a) => has(a, 'ocup', ...WORK, 'aposentado'),
        min: 1500,
        minMsg: 'A renda mensal precisa ser de pelo menos R$ 1.500',
        ph: 'Ex.: 3.500',
      },
      {
        id: 'rendaNum2',
        type: 'num',
        money: true,
        label: 'Renda mensal própria, se tiver (R$)',
        hint: 'Deixe em branco se não tiver renda.',
        show: (a) => !has(a, 'ocup', ...WORK, 'aposentado'),
        min: 1500,
        minMsg: 'Se informar renda, ela precisa ser de pelo menos R$ 1.500',
        ph: 'Ex.: 2.000',
      },
      {
        id: 'ir',
        type: 'radio',
        label: 'Você declara Imposto de Renda?',
        req: true,
        opts: [
          ['dia', 'Sim, em dia'],
          ['pendente', 'Sim, mas tenho pendência'],
          ['isento', 'Sou isento(a)'],
          ['nao', 'Não declaro'],
        ],
      },
    ],
  },
  {
    title: 'Vínculos com o Brasil',
    sub: 'O que te liga ao Brasil e garante o seu retorno.',
    fields: [
      {
        id: 'civil',
        type: 'radio',
        label: 'Estado civil',
        req: true,
        show: notMinor,
        opts: [
          ['solteiro', 'Solteiro(a)'],
          ['casado', 'Casado(a) no civil'],
          ['uniaoDoc', 'União estável com documento (escritura ou declaração)'],
          ['moraJunto', 'União doméstica (mora junto, sem documento)'],
          ['divorciado', 'Divorciado(a) ou separado(a)'],
          ['viuvo', 'Viúvo(a)'],
        ],
      },
      {
        id: 'conjugeTrab',
        type: 'radio',
        label: 'Seu cônjuge ou companheiro(a) trabalha?',
        req: true,
        show: (a) => is(a, 'civil', 'casado', 'uniaoDoc', 'moraJunto'),
        opts: [
          ['sim', 'Sim'],
          ['nao', 'Não'],
        ],
      },
      {
        id: 'conjugeFica',
        type: 'radio',
        label: 'Seu cônjuge ou companheiro(a) vai viajar com você?',
        req: true,
        show: (a) => is(a, 'civil', 'casado', 'uniaoDoc', 'moraJunto'),
        opts: [
          ['fica', 'Não, fica no Brasil'],
          ['junto', 'Sim, vai junto'],
        ],
      },
      {
        id: 'filhos',
        type: 'radio',
        label: 'Tem filhos?',
        req: true,
        show: notMinor,
        opts: [
          ['nao', 'Não'],
          ['ficam', 'Sim, e ficam no Brasil durante a viagem'],
          ['juntos', 'Sim, e vão viajar comigo'],
        ],
      },
      {
        id: 'imovel',
        type: 'radio',
        label: 'Tem imóvel no seu nome (próprio ou financiado)?',
        req: true,
        show: notMinor,
        opts: [
          ['sim', 'Sim'],
          ['nao', 'Não'],
        ],
      },
      {
        id: 'veiculo',
        type: 'radio',
        label: 'Tem veículo no seu nome?',
        req: true,
        show: notMinor,
        opts: [
          ['sim', 'Sim'],
          ['nao', 'Não'],
        ],
      },
      {
        id: 'outros',
        type: 'check',
        label: 'Outros vínculos (marque todos que se aplicam)',
        opts: [
          ['estuda', 'Estudo no Brasil (faculdade, pós)'],
          ['cuida', 'Cuido de pais ou familiares'],
          ['invest', 'Tenho investimentos ou aplicações'],
          ['socio', 'Tenho participação em empresa'],
          ['pets', 'Tenho compromissos fixos (contratos, clientes)'],
        ],
      },
    ],
  },
  {
    title: 'Histórico de viagens',
    sub: 'Viagens anteriores e situações que o consulado considera.',
    fields: [
      {
        id: 'vistoAnt',
        type: 'radio',
        label: 'Já teve visto americano?',
        req: true,
        opts: [
          ['nunca', 'Nunca'],
          ['vigente', 'Sim, ainda válido'],
          ['vencido', 'Sim, já vencido'],
        ],
      },
      {
        id: 'usou',
        type: 'radio',
        label: 'Já viajou aos EUA com esse visto?',
        req: true,
        show: (a) => is(a, 'vistoAnt', 'vigente', 'vencido'),
        opts: [
          ['sim', 'Sim, e voltei dentro do prazo'],
          ['nao', 'Nunca usei'],
        ],
      },
      {
        id: 'vezesEUA',
        type: 'radio',
        label: 'Quantas vezes já foi aos EUA?',
        req: true,
        show: (a) => is(a, 'usou', 'sim'),
        opts: [
          ['1', '1 vez'],
          ['2', '2 ou 3 vezes'],
          ['4', '4 vezes ou mais'],
        ],
      },
      {
        id: 'paises',
        type: 'check',
        label: 'Para onde já viajou fora do Brasil?',
        req: true,
        none: 'nenhum',
        opts: [
          ['sul', 'América do Sul'],
          ['europa', 'Europa'],
          ['canada', 'Canadá ou México'],
          ['asia', 'Ásia ou Oceania'],
          ['outros', 'Outros países'],
          ['nenhum', 'Nunca viajei para o exterior'],
        ],
      },
      {
        id: 'recusa',
        type: 'radio',
        label: 'Já teve visto americano negado?',
        req: true,
        opts: [
          ['nao', 'Não'],
          ['sim', 'Sim'],
        ],
      },
      {
        id: 'recusaVezes',
        type: 'radio',
        label: 'Quantas vezes teve o visto negado?',
        req: true,
        show: (a) => is(a, 'recusa', 'sim'),
        opts: [
          ['1', '1 vez'],
          ['2', '2 vezes'],
          ['3', '3 vezes ou mais'],
        ],
      },
      {
        id: 'recusaQuando',
        type: 'radio',
        label: 'Quando foi a última recusa?',
        req: true,
        show: (a) => is(a, 'recusa', 'sim'),
        opts: [
          ['m6', 'Há menos de 6 meses'],
          ['m12', 'Entre 6 meses e 1 ano'],
          ['mais', 'Há mais de 1 ano'],
        ],
      },
      {
        id: 'mudou',
        type: 'radio',
        label: 'Sua situação mudou desde a recusa?',
        req: true,
        show: (a) => is(a, 'recusa', 'sim'),
        opts: [
          ['muito', 'Sim, mudou bastante (emprego, renda, família)'],
          ['pouco', 'Mudou pouco'],
          ['nada', 'Não mudou'],
        ],
      },
      {
        id: 'problemas',
        type: 'check',
        label: 'Alguma destas situações se aplica a você?',
        req: true,
        none: 'nenhum',
        hint: 'Suas respostas são confidenciais e servem só para orientar a análise.',
        opts: [
          ['overstay', 'Já fiquei nos EUA além do prazo'],
          ['trabalhoIlegal', 'Já trabalhei nos EUA sem autorização'],
          ['deport', 'Já fui deportado(a) ou impedido(a) de entrar'],
          ['cancelado', 'Já tive visto americano cancelado ou revogado'],
          ['criminal', 'Tenho processo ou antecedente criminal'],
          ['nenhum', 'Nenhuma delas'],
        ],
      },
    ],
  },
  {
    title: 'Família nos EUA',
    sub: 'Parentes que moram nos Estados Unidos e a situação deles.',
    fields: [
      {
        id: 'parenteEUA',
        type: 'radio',
        label: 'Você tem parentes morando nos EUA?',
        req: true,
        opts: [
          ['sim', 'Sim'],
          ['nao', 'Não'],
        ],
      },
      {
        id: 'parentesGrau',
        type: 'check',
        label: 'Quem são?',
        req: true,
        show: (a) => is(a, 'parenteEUA', 'sim'),
        opts: [
          ['pais', 'Pai ou mãe'],
          ['irmaos', 'Irmão(s)'],
          ['filhos', 'Filho(s)'],
          ['conjuge', 'Cônjuge'],
          ['tios', 'Tios ou avós'],
          ['primos', 'Primos ou sobrinhos'],
          ['outro', 'Outro'],
        ],
      },
      {
        id: 'parentesStatus',
        type: 'check',
        label: 'Qual a situação deles nos EUA?',
        hint: 'Marque todas que se aplicam.',
        req: true,
        show: (a) => is(a, 'parenteEUA', 'sim'),
        opts: [
          ['cidadao', 'Cidadão americano'],
          ['greencard', 'Residente permanente (green card)'],
          ['trabalho', 'Com visto de trabalho'],
          ['estudante', 'Com visto de estudante'],
          ['visitante', 'Como turista ou visitante'],
          ['processo', 'Em processo de imigração (asilo, green card em andamento)'],
          ['irregular', 'Sem status regular (visto vencido ou sem documentos)'],
          ['naosei', 'Não sei'],
          ['outro', 'Outro'],
        ],
      },
    ],
  },
  {
    title: 'Sobre a viagem',
    sub: 'Destino, tempo de estadia, acompanhantes e quem paga.',
    fields: [
      { id: 'destino', type: 'text', label: 'Para qual cidade e estado dos EUA pretende ir?', req: true, ph: 'Ex.: Orlando, Flórida' },
      { id: 'estadia', type: 'text', label: 'Quanto tempo pretende ficar nos EUA?', hint: 'Exemplo: 15 dias, 6 meses ou 2 anos.', req: true, ph: 'Ex.: 15 dias' },
      {
        id: 'comquem',
        type: 'radio',
        label: 'Vai sozinho(a) ou acompanhado(a)?',
        req: true,
        show: (a) => TEMP.includes(String(a.obj ?? '')),
        opts: [
          ['sozinho', 'Sozinho(a)'],
          ['conjuge', 'Com cônjuge ou companheiro(a)'],
          ['filhos', 'Com filhos'],
          ['familia', 'Com outros familiares'],
          ['parceiro', 'Com namorado(a) ou noivo(a)'],
          ['amigos', 'Com amigos'],
          ['trabalho', 'Com colegas de trabalho'],
          ['outro', 'Outro'],
        ],
      },
      {
        id: 'acompVisto',
        type: 'radio',
        label: 'Quem vai com você tem visto americano?',
        req: true,
        show: (a) => TEMP.includes(String(a.obj ?? '')) && Boolean(a.comquem) && a.comquem !== 'sozinho',
        opts: [
          ['sim', 'Sim, tem visto válido'],
          ['junto', 'Vai pedir o visto junto comigo'],
          ['nao', 'Não tem visto'],
          ['naosei', 'Não sei'],
        ],
      },
      {
        id: 'paga',
        type: 'radio',
        label: 'Quem vai pagar a viagem?',
        req: true,
        show: (a) => TEMP.includes(String(a.obj ?? '')) || a.obj === 'estudo',
        opts: [
          ['proprio', 'Eu mesmo(a)'],
          ['conjuge', 'Cônjuge ou companheiro(a)'],
          ['pai', 'Pai'],
          ['mae', 'Mãe'],
          ['pais', 'Pai e mãe'],
          ['filho', 'Filho(a)'],
          ['empresa', 'A empresa onde trabalho'],
          ['noivo', 'Namorado(a) ou noivo(a)'],
          ['amigo', 'Amigo(a)'],
          ['parente', 'Outro parente'],
          ['bolsa', 'Bolsa de estudos'],
          ['outro', 'Outro'],
        ],
      },
    ],
  },
  {
    title: 'Seus dados',
    sub: 'Última etapa: para identificarmos o seu resultado.',
    fields: [
      { id: 'nome', type: 'text', label: 'Nome completo', req: true, ac: 'name' },
      { id: 'whats', type: 'tel', label: 'WhatsApp com DDD', req: true, ac: 'tel', ph: '(11) 99999-9999' },
      { id: 'email', type: 'text', label: 'E-mail (opcional)', ac: 'email', ph: 'seuemail@exemplo.com' },
      { id: 'cidade', type: 'text', label: 'Cidade / Estado onde mora', req: true, ph: 'Ex.: Campinas / SP' },
    ],
  },
];

function findF(id: string): FieldDef | undefined {
  for (const s of STEPS) {
    for (const f of s.fields) {
      if (f.id === id) return f;
    }
  }
  return undefined;
}

function fShow(f: FieldDef | undefined, a: FormAnswers): boolean {
  if (!f) return false;
  return !f.show || f.show(a);
}

function lbl(fid: string, val: string): string {
  for (const s of STEPS) {
    for (const f of s.fields) {
      if (f.id === fid && f.opts) {
        const o = f.opts.find((opt) => opt[0] === val);
        return o ? o[1] : val;
      }
    }
  }
  return val;
}

function lblO(a: FormAnswers, id: string, v?: string | string[]): string {
  const target = v === undefined ? a[id] : v;
  const one = (x: string) => (x === 'outro' ? `Outro: ${String(a[id + '_txt'] || '')}` : lbl(id, x));
  if (Array.isArray(target)) {
    return target
      .filter((x) => x !== 'nenhum')
      .map(one)
      .join(', ');
  }
  return target ? one(String(target)) : '';
}

function rendaVal(a: FormAnswers): number {
  const r = num(a.rendaNum);
  return fShow(findF('rendaNum'), a) ? r : num(a.rendaNum2);
}

function visaFor(a: FormAnswers): [string, string] {
  switch (a.obj) {
    case 'turismo':
      return ['B-2 (Turismo)', 'Visto de visitante, emitido normalmente como B1/B2'];
    case 'tratamento':
      return ['B-2 (Tratamento médico)', 'Visto de visitante B1/B2, com documentação médica e de custeio'];
    case 'negocios':
      return ['B-1 (Negócios)', 'Visto de visitante B1/B2 para reuniões, feiras e congressos, sem trabalho remunerado nos EUA'];
    case 'naosei':
      return ['B1/B2 (Turismo e Negócios)', 'O visto mais comum para quem ainda está definindo os planos'];
    case 'estudo':
      return a.curso === 'tecnico'
        ? ['M-1 (Estudante de curso técnico)', 'Exige matrícula em escola aprovada (formulário I-20)']
        : ['F-1 (Estudante)', 'Exige matrícula em escola aprovada (formulário I-20)'];
    case 'intercambio':
      return ['J-1 (Intercâmbio)', 'Exige patrocinador do programa (formulário DS-2019)'];
    case 'trabalho':
      return ['Visto de trabalho (categorias H)', 'Exige petição aprovada pelo empregador americano'];
    case 'transferencia':
      return ['L-1 (Transferência intracompanhia)', 'Exige petição da empresa nos EUA'];
    case 'talento':
      return ['O-1 (temporário) ou EB-1 / EB-2 NIW (green card)', 'Para quem comprova destaque ou mérito na área'];
    case 'investir':
      return a.cidTratado === 'sim'
        ? ['E-2 (Investidor de tratado) ou EB-5', 'E-2 depende da sua outra cidadania; o Brasil não é país de tratado']
        : ['EB-5 (Investidor - green card)', 'O Brasil não é país de tratado para o E-2; o caminho direto é o EB-5'];
    case 'morar':
      return ['Visto de imigrante por família', 'Exige petição do familiar cidadão ou residente'];
    case 'casar':
      return ['K-1 (Noivo(a) de cidadão americano)', 'Exige petição do noivo(a) cidadão'];
    case 'acompanhar': {
      const m = { F: 'F-2', J: 'J-2', H: 'H-4', L: 'L-2' }[String(a.titular ?? '')];
      return [m ? `${m} (Dependente)` : 'Visto de dependente', 'Segue o visto do titular'];
    }
    default:
      return ['B1/B2 (Turismo e Negócios)', 'Visto de visitante'];
  }
}

function tiesScore(a: FormAnswers) {
  let s = 0;
  const good: string[] = [];
  const att: string[] = [];
  let capLow = false;
  const emp: Record<string, number> = {
    servidor: 20,
    clt: 18,
    empresario: 20,
    mei: 13,
    pj: 14,
    autonomo: 11,
    aposentado: 16,
    estudante: 9,
    lar: 5,
    desempregado: 0,
  };

  if (a.idade === 'menor') {
    s += 30;
    good.push('Menores de idade são avaliados junto com os pais ou responsáveis');
    if (FAMPAY.includes(String(a.paga ?? ''))) {
      s += 15;
      good.push('Viagem custeada pelos pais ou família');
    }
  } else {
    const O = a.ocup || [];
    s += Math.max(0, ...O.map((o) => emp[o] || 0));
    const fontes = O.filter((o) => WORK.includes(o) || o === 'aposentado').length;
    if (fontes >= 2) {
      s += 4;
      good.push('Mais de uma fonte de renda');
    }
    if (has(a, 'ocup', 'servidor', 'clt', 'empresario', 'mei', 'pj')) good.push('Ocupação formal e comprovável');
    if (O.includes('aposentado')) good.push('Renda de aposentadoria comprovável');
    if (O.includes('desempregado')) att.push('Sem trabalho no momento: é preciso mostrar outras fontes de sustento e vínculos');
    if (O.includes('autonomo')) att.push('Renda como autônomo(a)/PF: organize comprovantes (extratos, recibos, notas, contratos)');
    const t = fShow(findF('tempo'), a) ? ({ m6: 0, a1: 4, a3: 8, a5: 11, a5p: 14 } as Record<string, number>)[String(a.tempo ?? '')] : undefined;
    if (t !== undefined) {
      s += t;
      if (t >= 8) good.push('Tempo de atuação consistente');
      if (t <= 4) att.push('Pouco tempo na ocupação atual');
    } else if (O.includes('aposentado')) {
      s += 10;
    }
    const rv = rendaVal(a);
    const r = isNaN(rv) ? 0 : rv <= 3000 ? (rv <= 1600 ? 0 : 4) : rv <= 5000 ? 8 : rv <= 10000 ? 12 : rv <= 20000 ? 15 : 17;
    s += r;
    const lowSelf = !isNaN(rv) && rv <= 3000 && a.paga === 'proprio';
    if (lowSelf) {
      att.push(`Renda de ${brl(rv)} pode não ser compatível com o custo de uma viagem paga por conta própria`);
      capLow = true;
    }
    if (r >= 12) good.push('Renda compatível com viagem internacional');
    if (r <= 4 && !lowSelf) att.push('Renda baixa para os custos da viagem: será importante mostrar quem custeia e como');
    const ir = ({ dia: 10, isento: 3, pendente: -5, nao: 0 } as Record<string, number>)[String(a.ir ?? '')] || 0;
    s += ir;
    if (a.ir === 'dia') good.push('Imposto de Renda em dia');
    if (a.ir === 'pendente') att.push('Pendência no Imposto de Renda: regularize antes da entrevista');
    if (a.ir === 'nao' && r >= 8) att.push('Com essa renda, a declaração de IR fortalece muito o perfil');
    if (has(a, 'ocup', 'estudante', 'lar') && !has(a, 'ocup', ...WORK) && FAMPAY.includes(String(a.paga ?? ''))) {
      s += 6;
    }
    const n = num(a.idadeNum);
    if (!isNaN(n) && n <= 25 && !has(a, 'ocup', ...WORK) && a.civil !== 'casado') {
      att.push('Pessoas jovens, solteiras e sem trabalho formal costumam ter os vínculos analisados com mais atenção');
    }
  }

  let v = 0;
  if (a.civil === 'casado') {
    v += 6;
    good.push('Casamento civil no Brasil');
  }
  if (a.civil === 'uniaoDoc') {
    v += 6;
    good.push('União estável documentada');
  }
  if (a.civil === 'moraJunto') {
    v += 3;
    att.push('União sem documento: uma escritura ou declaração de união estável fortalece o vínculo');
  }
  if (a.filhos === 'ficam') {
    v += 8;
    good.push('Filhos que permanecem no Brasil');
  }
  if (a.imovel === 'sim') {
    v += 7;
    good.push('Imóvel no seu nome');
  }
  if (a.veiculo === 'sim') v += 3;
  v += Math.min((a.outros || []).length * 3, 9);
  if ((a.outros || []).includes('estuda')) good.push('Estudos em andamento no Brasil');
  s += Math.min(v, 24);
  if (a.idade !== 'menor' && v < 6) att.push('Poucos vínculos de bens e família no Brasil');
  if (a.usou === 'sim') {
    s += 14;
    good.push('Já usou visto americano e voltou no prazo');
  } else if (a.vistoAnt && a.vistoAnt !== 'nunca') {
    s += 6;
  }

  const P = a.paises || [];
  let pv = 0;
  if (P.includes('europa')) pv += 5;
  if (P.includes('canada')) pv += 4;
  if (P.includes('asia')) pv += 3;
  if (P.includes('outros')) pv += 2;
  if (P.includes('sul')) pv += 3;
  s += Math.min(pv, 8);
  if (pv >= 5) good.push('Histórico de viagens internacionais');
  if (P.includes('nenhum') && a.usou !== 'sim') att.push('Sem viagens internacionais anteriores');

  if (a.recusa === 'sim') {
    s += ({ m6: -15, m12: -8, mais: -4 } as Record<string, number>)[String(a.recusaQuando ?? '')] || 0;
    s += ({ muito: 4, pouco: 0, nada: -5 } as Record<string, number>)[String(a.mudou ?? '')] || 0;
    if (a.recusaQuando === 'm6') att.push('Recusa há menos de 6 meses: uma nova tentativa precisa mostrar mudança real no perfil');
    else att.push('Recusa anterior: a nova entrevista deve deixar claro o que mudou');
  }
  if (['noivo', 'amigo', 'parente', 'outro'].includes(String(a.paga ?? ''))) {
    s -= 6;
    att.push('Viagem paga por pessoa sem parentesco direto: precisa ser bem explicada');
  }
  const d = TEMP.includes(String(a.obj ?? '')) ? dias(a) : NaN;
  if (!isNaN(d) && d > 90) {
    s -= 6;
    att.push('Estadia longa: justifique o período e o retorno');
  } else if (!isNaN(d) && d > 30) {
    s -= 2;
  }
  if (a.comquem && a.comquem !== 'sozinho' && a.acompVisto === 'nao') att.push('Acompanhante sem visto americano: avaliar se vai pedir junto');
  if (a.conjugeFica === 'fica') good.push('Cônjuge permanece no Brasil durante a viagem');
  if (has(a, 'parentesStatus', 'irregular')) att.push('Parente em situação irregular nos EUA costuma ser questionado na entrevista');
  if (has(a, 'parentesStatus', 'cidadao', 'greencard')) att.push('Parente cidadão ou residente nos EUA: deixe clara a intenção de voltar ao Brasil');
  if (a.obj === 'estudo') {
    if (a.i20 === 'sim') good.push('Aceite da escola (I-20) emitido');
    else att.push('Para o F-1/M-1 é preciso o I-20 da escola antes do agendamento');
  }
  if (a.obj === 'intercambio' && a.patrocinador !== 'sim') att.push('Para o J-1 é preciso o DS-2019 do patrocinador antes do agendamento');
  if ((a.problemas || []).includes('cancelado')) att.push('Visto cancelado ou revogado anteriormente precisa de análise individual');
  if (capLow) s = Math.min(s, 55);

  return { score: Math.max(0, Math.min(100, Math.round(s))), good, att };
}

function pathEval(a: FormAnswers) {
  const good: string[] = [];
  const att: string[] = [];
  let lv: 'forte' | 'moderado' | 'construcao' | 'especial' = 'moderado';

  switch (a.obj) {
    case 'trabalho':
      if (a.oferta === 'sim') {
        lv = 'forte';
        good.push('Oferta de empresa americana disposta a patrocinar');
        att.push('A empresa precisa ter a petição aprovada pelo USCIS antes da entrevista');
      } else if (a.oferta === 'conversando') {
        att.push('Sem oferta fechada ainda: o visto depende da empresa iniciar a petição');
      } else {
        lv = 'construcao';
        att.push('Visto de trabalho exige uma empresa americana que patrocine o processo');
      }
      break;
    case 'transferencia':
      if (a.umano === 'sim' && a.cargoL === 'sim') {
        lv = 'forte';
        good.push('Tempo de empresa e cargo compatíveis com o L-1');
      } else {
        lv = 'construcao';
        att.push('O L-1 exige 1 ano contínuo na empresa nos últimos 3 anos e cargo de gestão ou conhecimento especializado');
      }
      break;
    case 'talento':
      if (a.reconhecimento === 'sim') {
        lv = 'forte';
        good.push('Reconhecimento na área');
      } else if (a.reconhecimento === 'parcial') {
        att.push('É preciso reunir mais provas de destaque (prêmios, mídia, publicações, cartas)');
      } else {
        lv = 'construcao';
        att.push('Ainda faltam provas de destaque na área');
      }
      if (a.posgrad === 'sim') good.push('Formação ou experiência avançada (base para o EB-2 NIW)');
      break;
    case 'investir':
      if (a.cidTratado === 'sim') good.push('Outra cidadania pode abrir o caminho do E-2');
      if (a.capital === 'ate500' && a.cidTratado !== 'sim') {
        lv = 'construcao';
        att.push('O EB-5 exige investimento mínimo de US$ 800 mil em área prioritária ou US$ 1,05 milhão nas demais');
      } else if (a.capital === 'ate2m' && a.cidTratado !== 'sim') {
        att.push('Valor pode não atingir o mínimo do EB-5 (US$ 800 mil a US$ 1,05 milhão)');
      } else {
        lv = 'forte';
        good.push('Capital compatível com caminhos de investimento');
      }
      att.push('Investimento exige origem lícita dos recursos comprovada');
      break;
    case 'morar':
      if (a.parente === 'nenhum') {
        lv = 'construcao';
        att.push('Sem familiar cidadão ou residente que possa fazer a petição');
      } else if (a.parente === 'irmao') {
        att.push('Petição por irmão é possível só se ele for cidadão, com fila de espera longa');
      } else if (a.parente === 'filho' && a.statusParente === 'greencard') {
        lv = 'construcao';
        att.push('Filho com green card não pode pedir os pais; só depois de virar cidadão');
      } else {
        lv = 'forte';
        good.push('Familiar elegível para fazer a petição');
      }
      break;
    case 'casar':
      if (a.noivoCid === 'sim' && a.encontro === 'sim') {
        lv = 'forte';
        good.push('Noivo(a) cidadão(ã) e encontro presencial nos últimos 2 anos');
      } else {
        lv = 'construcao';
        if (a.noivoCid !== 'sim') att.push('O K-1 só existe para noivos de cidadãos americanos');
        if (a.encontro !== 'sim') att.push('O K-1 exige encontro presencial nos últimos 2 anos (com raras exceções)');
      }
      break;
    case 'acompanhar':
      if (a.relacao !== 'outro' && a.titular !== 'outro') {
        lv = 'forte';
        good.push('Você se enquadra como dependente do titular');
      } else {
        lv = 'construcao';
        att.push('Dependentes são apenas cônjuge e filhos solteiros menores de 21 anos');
      }
      break;
  }
  return { lv, good, att };
}

function buildMsg(
  a: FormAnswers,
  vis: string,
  nivel: string,
  proto: string,
  resumo: { good: string[]; att: string[]; crit: string[] },
  pc: { main: number }
): string {
  const DIV = '━━━━━━━━━━━━━━━━';
  const d = new Date();
  const dataHora =
    d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const item = (k: string, v: unknown) => (v ? `• ${k}: ${v}` : null);
  const L: string[] = [];
  const add = (...x: (string | null | undefined | false)[]) =>
    x.forEach((y) => {
      if (y !== null && y !== undefined && y !== false) L.push(y);
    });

  const rv = rendaVal(a);
  const adulto = a.idade !== 'menor';

  add('*VISAREBR | AVALIAÇÃO DE PERFIL*', `${dataHora} · ${proto}`, DIV);
  add(`*${String(a.nome ?? '')}* · ${idadeTxt(a)}`);
  if (adulto) {
    add(
      `Estado civil: ${lbl('civil', String(a.civil ?? ''))}${
        fShow(findF('conjugeTrab'), a) ? ` (cônjuge ${a.conjugeTrab === 'sim' ? 'trabalha' : 'não trabalha'})` : ''
      }`
    );
  }
  add(`Filhos: ${adulto ? lbl('filhos', String(a.filhos ?? '')) : 'menor de idade'}`, '');
  add(`*Aprovação estimada – ${vis}: ${pc.main}%*`, `_${nivel}_`);
  if (resumo.crit.length) add(`⚠ Informou: ${resumo.crit.join(', ')}`);
  add('');
  add('*VIAGEM*', item('Objetivo', lbl('obj', String(a.obj ?? ''))));

  const extra = [
    'curso',
    'i20',
    'programa',
    'patrocinador',
    'oferta',
    'umano',
    'cargoL',
    'reconhecimento',
    'posgrad',
    'cidTratado',
    'capital',
    'parente',
    'statusParente',
    'noivoCid',
    'encontro',
    'titular',
    'relacao',
  ].filter((k) => a[k] && fShow(findF(k), a));

  extra.forEach((k) => {
    const f = findF(k);
    if (f) add(`• ${f.label.replace(/\?$/, '')}: ${lbl(k, String(a[k]))}`);
  });

  add(item('Destino', a.destino), item('Tempo de estadia', a.estadia));
  if (fShow(findF('comquem'), a)) {
    add(
      `• Vai com: ${lblO(a, 'comquem')}${
        fShow(findF('acompVisto'), a) ? ` (${lbl('acompVisto', String(a.acompVisto ?? '')).toLowerCase()})` : ''
      }`
    );
  }
  if (a.paga && fShow(findF('paga'), a)) add(item('Quem paga', lblO(a, 'paga')));
  add('');

  if (adulto) {
    add('*RENDA E TRABALHO*', `• Renda: ${isNaN(rv) ? 'sem renda própria' : brl(rv)}`);
    add(
      item(
        'Vínculo',
        (a.ocup || []).map((o) => lbl('ocup', o)).join(' e ') +
          (has(a, 'ocup', ...WORK)
            ? has(a, 'ocup', 'clt', 'servidor', 'empresario', 'mei', 'pj')
              ? ' (formal)'
              : ' (informal)'
            : '')
      )
    );
    if (fShow(findF('empresa'), a)) add(item('Emprego atual', a.empresa));
    if (fShow(findF('tempo'), a)) add(item('Tempo no trabalho', lbl('tempo', String(a.tempo ?? ''))));
    add(item('Imposto de Renda', lbl('ir', String(a.ir ?? ''))), '');
  }

  add('*VÍNCULOS E BENS*');
  if (adulto) add(`• Imóvel: ${lbl('imovel', String(a.imovel ?? ''))} · Veículo: ${lbl('veiculo', String(a.veiculo ?? ''))}`);
  if ((a.outros || []).length) add(item('Outros', a.outros.map((x) => lbl('outros', x)).join(', ')));
  add(
    a.parenteEUA === 'sim'
      ? `• Parentes nos EUA: ${lblO(a, 'parentesGrau')} – ${lblO(a, 'parentesStatus')}`
      : '• Parentes nos EUA: não'
  );
  add(
    `• Visto anterior: ${lbl('vistoAnt', String(a.vistoAnt ?? ''))}${
      a.usou === 'sim' ? `, já foi aos EUA ${lbl('vezesEUA', String(a.vezesEUA ?? '')).toLowerCase()}` : ''
    }`
  );
  if (a.recusa === 'sim') {
    add(
      `• Recusa: ${lbl('recusaVezes', String(a.recusaVezes ?? ''))}, a última ${lbl(
        'recusaQuando',
        String(a.recusaQuando ?? '')
      ).toLowerCase()}`
    );
  }
  add('');
  if (resumo.att.length) add('*ATENÇÃO*', ...resumo.att.slice(0, 5).map((x) => '! ' + x));
  return L.join('\n');
}

function computeResult(a: FormAnswers, waNumber: string) {
  const [vis, visDesc] = visaFor(a);
  const probs = (a.problemas || []).filter((p) => p !== 'nenhum');
  const crit = probs.filter((p) => ['overstay', 'trabalhoIlegal', 'deport', 'criminal', 'cancelado'].includes(p));
  let lv: 'forte' | 'moderado' | 'construcao' | 'especial' = 'moderado';
  let score: number | null = null;
  let good: string[] = [];
  let att: string[] = [];

  if (TIES.includes(String(a.obj ?? ''))) {
    const t = tiesScore(a);
    score = t.score;
    good = t.good;
    att = t.att;
    lv = score >= 62 ? 'forte' : score >= 40 ? 'moderado' : 'construcao';
  } else {
    const p = pathEval(a);
    lv = p.lv;
    good = p.good;
    att = p.att;
  }

  if (crit.length) lv = 'especial';

  const LV: Record<string, [string, string]> = {
    forte: ['Perfil forte', 'Seu perfil reúne bons elementos para o visto indicado.'],
    moderado: ['Perfil moderado', 'Seu perfil tem base, mas alguns pontos precisam ser fortalecidos e bem apresentados.'],
    construcao: ['Perfil em construção', 'Hoje o perfil ainda tem pontos importantes a desenvolver antes de solicitar o visto.'],
    especial: [
      'Requer análise especializada',
      'Uma das situações informadas exige avaliação individual antes de qualquer pedido de visto.',
    ],
  };

  const segs = { forte: 3, moderado: 2, construcao: 1, especial: 1 }[lv];
  const segColor = { forte: '#1f7a4d', moderado: '#a2610c', construcao: '#b31942', especial: '#b31942' }[lv];
  const now = new Date();
  const proto =
    'AV-' +
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    '-' +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0');

  if (!good.length) good.push('Vamos identificar seus pontos fortes na análise com a equipe');
  if (!att.length) att.push('Organize os documentos que comprovam o que você respondeu');

  const critTxt: Record<string, string> = {
    overstay: 'permanência além do prazo',
    trabalhoIlegal: 'trabalho sem autorização',
    deport: 'deportação ou entrada negada',
    criminal: 'antecedente criminal',
    cancelado: 'visto cancelado ou revogado',
  };

  const resumo = { good, att, crit: crit.map((c) => critTxt[c]) };

  let main = score !== null ? score : { forte: 80, moderado: 55, construcao: 20, especial: 10 }[lv];
  if (crit.length) main = Math.min(main, 15);
  main = Math.max(5, Math.min(90, main));
  const pc = { main };

  const msg = buildMsg(a, vis, LV[lv][0], proto, resumo, pc);
  const href = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(msg);

  return { lv, LV, segs, segColor, proto, vis, visDesc, crit, critTxt, good, att, href, pc };
}

const initialAnswers = (): FormAnswers => ({
  paises: [],
  outros: [],
  problemas: [],
  ocup: [],
  parentesGrau: [],
  parentesStatus: [],
});

export default function ProfileEvaluation() {
  const { settings } = useSettings();
  const waNumber = settings?.whatsappNumber ? settings.whatsappNumber.replace(/\D/g, '') : DEFAULT_WA;

  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers);
  const [step, setStep] = useState<number>(-1); // -1 = intro, >=0 = step index, 999 = result
  const [errorMsg, setErrorMsg] = useState<string>('');
  const panelRef = useRef<HTMLElement | null>(null);

  const visibleSteps = STEPS.filter((s) => !s.show || s.show(answers));

  const scrollTop = () => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateAnswer = (id: string, val: string) => {
    setErrorMsg('');
    setAnswers((prev) => {
      const next = { ...prev, [id]: val };
      if (id === 'idadeNum') {
        const n = num(val);
        next.idade = isNaN(n) ? undefined : n < 18 ? 'menor' : 'adulto';
      }
      return next;
    });
  };

  const toggleCheckbox = (f: FieldDef, optVal: string, checked: boolean) => {
    setErrorMsg('');
    setAnswers((prev) => {
      const current = Array.isArray(prev[f.id]) ? (prev[f.id] as string[]) : [];
      let nextArr: string[];
      if (checked) {
        if (f.none && optVal === f.none) {
          nextArr = [f.none];
        } else {
          nextArr = current.filter((x) => x !== f.none).concat(optVal);
        }
      } else {
        nextArr = current.filter((x) => x !== optVal);
      }
      return { ...prev, [f.id]: nextArr };
    });
  };

  const handleNext = () => {
    const a: FormAnswers = { ...answers };
    if (a.idadeNum) {
      const n = num(a.idadeNum);
      a.idade = isNaN(n) ? undefined : n < 18 ? 'menor' : 'adulto';
    }
    const list = STEPS.filter((s) => !s.show || s.show(a));
    const currentStep = list[step];
    if (!currentStep) return;

    const miss: string[] = [];
    for (const f of currentStep.fields) {
      if (!fShow(f, a)) continue;
      const v = a[f.id];
      const req = typeof f.req === 'function' ? f.req(a) : Boolean(f.req);
      const empty = f.type === 'check' ? !(Array.isArray(v) && v.length > 0) : !String(v || '').trim();
      if (req && empty) {
        miss.push(f.label);
        continue;
      }
      if (f.type === 'num' && !empty) {
        const n = num(v);
        if (isNaN(n) || n < (f.min || 0) || (f.max && n > f.max)) {
          miss.push(f.minMsg || f.label);
        }
      }
      const hasOutroOpt = f.opts && f.opts.some((o) => o[0] === 'outro');
      const isOutroSelected = Array.isArray(v) ? v.includes('outro') : v === 'outro';
      if (hasOutroOpt && isOutroSelected && !String(a[f.id + '_txt'] || '').trim()) {
        miss.push(f.label + ' (descreva a opção Outro)');
      }
    }

    if (
      currentStep.fields.some((f) => f.id === 'whats') &&
      a.whats &&
      String(a.whats).replace(/\D/g, '').length < 10
    ) {
      miss.push('WhatsApp com DDD (mínimo 10 números)');
    }

    if (miss.length > 0) {
      setErrorMsg('Falta responder: ' + miss.join(' · '));
      return;
    }

    setAnswers(a);
    setErrorMsg('');
    if (step < list.length - 1) {
      setStep(step + 1);
      scrollTop();
    } else {
      setStep(999);
      scrollTop();
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step <= 0) {
      setStep(-1);
    } else {
      setStep(step - 1);
    }
    scrollTop();
  };

  const handleRedo = () => {
    setAnswers(initialAnswers());
    setErrorMsg('');
    setStep(-1);
    scrollTop();
  };

  const result = step === 999 ? computeResult(answers, waNumber) : null;

  return (
    <div className="min-h-screen bg-[#f3f5f9] text-[#14213a] pb-16">
      {/* Header Banner */}
      <header className="bg-[#0a3161] text-white pt-8 pb-20 px-4 relative overflow-hidden">
        <div
          className="absolute -right-28 -top-16 w-[520px] h-[420px] -rotate-12 opacity-5 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, #fff 0 22px, transparent 22px 44px)',
          }}
        />
        <div className="max-w-[760px] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#c5a880] mb-3">
            <span>VisareBR · Diagnóstico Consular</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-3">
            Avaliação de Perfil para Visto Americano
          </h1>
          <p className="text-[#d6e0ef] max-w-[58ch] text-base leading-relaxed">
            Responda algumas perguntas e veja na hora como está o seu perfil para o visto americano e o que pode ser fortalecido.
          </p>
        </div>
      </header>

      {/* Main Panel */}
      <main className="px-4">
        <div className="max-w-[760px] mx-auto">
          <section
            ref={panelRef}
            aria-live="polite"
            className="bg-white border border-[#e2e6ee] rounded-[18px] shadow-[0_18px_40px_rgba(10,49,97,0.10)] -mt-12 relative z-20 overflow-hidden"
          >
            {/* INTRO VIEW */}
            {step === -1 && (
              <>
                <div className="p-6 sm:p-8">
                  <h2 className="text-2xl font-extrabold text-[#14213a] mb-2">
                    Avalie o seu perfil para o visto americano
                  </h2>
                  <p className="text-[#5b6578] mb-5">
                    São 7 etapas rápidas, cerca de 5 minutos. Ao concluir, você vê o resultado na hora e pode enviá-lo para a nossa equipe pelo WhatsApp.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
                    <li className="bg-[#f7f8fb] border border-[#e2e6ee] rounded-xl p-3.5 text-sm font-semibold">
                      <b className="block text-[#8a6a3c] text-xs uppercase tracking-widest mb-1">Objetivo</b>
                      Turismo, estudo, trabalho, investimento, família e outros
                    </li>
                    <li className="bg-[#f7f8fb] border border-[#e2e6ee] rounded-xl p-3.5 text-sm font-semibold">
                      <b className="block text-[#8a6a3c] text-xs uppercase tracking-widest mb-1">Vínculos</b>
                      Trabalho, renda, Imposto de Renda, família e bens
                    </li>
                    <li className="bg-[#f7f8fb] border border-[#e2e6ee] rounded-xl p-3.5 text-sm font-semibold">
                      <b className="block text-[#8a6a3c] text-xs uppercase tracking-widest mb-1">Histórico</b>
                      Viagens anteriores, vistos e recusas
                    </li>
                  </ul>
                  <p className="text-xs text-[#5b6578] mt-4">
                    Resultado orientativo. A decisão sobre qualquer visto é exclusiva do oficial consular dos EUA.
                  </p>
                </div>
                <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-[#e2e6ee] bg-[#f7f8fb]">
                  <span />
                  <button
                    type="button"
                    onClick={() => {
                      setStep(0);
                      scrollTop();
                    }}
                    className="bg-[#b31942] hover:bg-[#981437] text-white font-extrabold rounded-xl px-6 py-3 min-h-[48px] transition-colors cursor-pointer"
                  >
                    Começar avaliação
                  </button>
                </div>
              </>
            )}

            {/* QUESTION STEPS VIEW */}
            {step >= 0 && step < visibleSteps.length && (
              <>
                {/* Progress Bars */}
                <div className="flex gap-1.5 px-6 pt-5">
                  {visibleSteps.map((_, idx) => (
                    <span
                      key={idx}
                      className={`flex-1 h-1.5 rounded-full transition-colors ${
                        idx < step ? 'bg-[#b31942]' : idx === step ? 'bg-[#c5a880]' : 'bg-[#e2e6ee]'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-baseline gap-3 px-6 pt-3 text-xs text-[#5b6578] font-bold uppercase tracking-wider">
                  <span>
                    Etapa {step + 1} de {visibleSteps.length}
                  </span>
                  <span>{visibleSteps[step].title}</span>
                </div>

                {/* Fields Body */}
                <div className="px-6 pt-3 pb-6">
                  <h2 className="text-2xl font-extrabold text-[#14213a] mt-2 mb-1">
                    {visibleSteps[step].title}
                  </h2>
                  <p className="text-[#5b6578] mb-5">{visibleSteps[step].sub}</p>

                  <div className="space-y-5">
                    {visibleSteps[step].fields.map((f) => {
                      if (!fShow(f, answers)) return null;
                      const v = answers[f.id];
                      const outroSelected =
                        f.opts &&
                        f.opts.some((o) => o[0] === 'outro') &&
                        (Array.isArray(v) ? v.includes('outro') : v === 'outro');

                      if (f.type === 'num' || f.type === 'text' || f.type === 'tel') {
                        return (
                          <div key={f.id} className="grid gap-2">
                            <label htmlFor={`f_${f.id}`} className="font-bold text-[15px] text-[#14213a]">
                              {f.label}
                            </label>
                            {f.hint && <div className="text-xs text-[#5b6578] font-medium -mt-1">{f.hint}</div>}
                            <input
                              id={`f_${f.id}`}
                              type={f.type === 'num' ? 'text' : f.type}
                              inputMode={f.type === 'num' ? 'numeric' : undefined}
                              autoComplete={f.ac}
                              placeholder={f.ph || ''}
                              value={String(v ?? '')}
                              onChange={(e) => updateAnswer(f.id, e.target.value)}
                              className="w-full text-[#14213a] bg-[#f7f8fb] border-[1.5px] border-[#e2e6ee] rounded-xl px-3.5 py-3 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#c5a880]"
                            />
                          </div>
                        );
                      }

                      if (f.type === 'select') {
                        return (
                          <div key={f.id} className="grid gap-2">
                            <label htmlFor={`f_${f.id}`} className="font-bold text-[15px] text-[#14213a]">
                              {f.label}
                            </label>
                            <select
                              id={`f_${f.id}`}
                              value={String(v ?? '')}
                              onChange={(e) => updateAnswer(f.id, e.target.value)}
                              className="w-full text-[#14213a] bg-[#f7f8fb] border-[1.5px] border-[#e2e6ee] rounded-xl px-3.5 py-3 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#c5a880]"
                            >
                              <option value="">Selecione</option>
                              {(f.opts || []).map((o) => (
                                <option key={o[0]} value={o[0]}>
                                  {o[1]}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      }

                      const multi = f.type === 'check';
                      const wide = (f.opts?.length || 0) > 8 || f.id === 'obj';

                      return (
                        <fieldset key={f.id} className="grid gap-2 border-0 p-0 m-0">
                          <legend className="font-bold text-[15px] text-[#14213a] mb-1.5">{f.label}</legend>
                          {f.hint && <div className="text-xs text-[#5b6578] font-medium -mt-1 mb-1">{f.hint}</div>}
                          <div
                            className={`grid gap-2.5 ${
                              wide ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                            }`}
                          >
                            {(f.opts || []).map((o) => {
                              const checked = multi
                                ? Array.isArray(v) && v.includes(o[0])
                                : v === o[0];

                              return (
                                <label
                                  key={o[0]}
                                  className={`relative flex items-center gap-2.5 min-h-[50px] px-3.5 py-2.5 border-[1.5px] rounded-xl font-semibold text-[15px] leading-snug cursor-pointer transition-colors ${
                                    checked
                                      ? 'border-[#b31942] bg-[#fbe9ee]/60 text-[#14213a]'
                                      : 'border-[#e2e6ee] bg-[#f7f8fb] text-[#14213a] hover:border-[#c5a880]'
                                  }`}
                                >
                                  <input
                                    type={multi ? 'checkbox' : 'radio'}
                                    name={f.id}
                                    value={o[0]}
                                    checked={checked}
                                    onChange={(e) =>
                                      multi
                                        ? toggleCheckbox(f, o[0], e.target.checked)
                                        : updateAnswer(f.id, o[0])
                                    }
                                    className="sr-only"
                                  />
                                  <span
                                    className={`w-[18px] h-[18px] shrink-0 border-2 transition-all ${
                                      multi ? 'rounded-[5px]' : 'rounded-full'
                                    } ${
                                      checked
                                        ? 'border-[#b31942] bg-[#b31942] shadow-[inset_0_0_0_3px_#ffffff]'
                                        : 'border-[#5b6578] bg-transparent'
                                    }`}
                                  />
                                  <span>{o[1]}</span>
                                </label>
                              );
                            })}
                          </div>
                          {outroSelected && (
                            <input
                              type="text"
                              placeholder="Escreva aqui"
                              value={String(answers[f.id + '_txt'] ?? '')}
                              onChange={(e) => updateAnswer(f.id + '_txt', e.target.value)}
                              className="w-full mt-2 text-[#14213a] bg-[#f7f8fb] border-[1.5px] border-[#e2e6ee] rounded-xl px-3.5 py-3 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#c5a880]"
                            />
                          )}
                        </fieldset>
                      );
                    })}
                  </div>

                  {errorMsg && (
                    <div className="text-[#b31942] font-bold text-sm mt-4">{errorMsg}</div>
                  )}
                </div>

                {/* Step Navigation */}
                <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-[#e2e6ee] bg-[#f7f8fb]">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="bg-transparent text-[#14213a] border-[1.5px] border-[#e2e6ee] hover:border-[#14213a] font-extrabold rounded-xl px-5 py-3 min-h-[48px] transition-colors cursor-pointer"
                  >
                    {step === 0 ? 'Início' : 'Voltar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#b31942] hover:bg-[#981437] text-white font-extrabold rounded-xl px-6 py-3 min-h-[48px] transition-colors cursor-pointer"
                  >
                    {step === visibleSteps.length - 1 ? 'Ver meu resultado' : 'Continuar'}
                  </button>
                </div>

                {step === visibleSteps.length - 1 && (
                  <p className="text-xs text-[#5b6578] px-6 pb-4 bg-[#f7f8fb] m-0">
                    Ao concluir, o seu resultado aparece aqui na tela, com um botão para enviá-lo à equipe VisareBR pelo WhatsApp.
                  </p>
                )}
              </>
            )}

            {/* RESULT VIEW */}
            {step === 999 && result && (
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start gap-4 flex-wrap border-b border-dashed border-[#e2e6ee] pb-4">
                  <div>
                    <div className="text-xs tracking-widest uppercase text-[#5b6578] font-bold">
                      Ficha de avaliação · {result.proto}
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#14213a] mt-1.5">
                      {String(answers.nome ?? '').split(' ')[0]}, este é o seu resultado
                    </h2>
                  </div>
                  <div
                    className="border-[3px] rounded-xl px-3.5 py-2 font-extrabold tracking-widest uppercase text-sm -rotate-3"
                    style={{ color: result.segColor, borderColor: result.segColor }}
                  >
                    {result.LV[result.lv][0]}
                  </div>
                </div>

                {/* Chance Meter */}
                <div className="mt-5 bg-[#f7f8fb] border border-[#e2e6ee] rounded-2xl p-4">
                  <div className="flex justify-between items-baseline gap-3 font-bold">
                    <span>Chance estimada de aprovação</span>
                    <b className="text-3xl leading-none tabular-nums" style={{ color: result.segColor }}>
                      {result.pc.main}%
                    </b>
                  </div>
                  <div
                    className="h-3 rounded-full bg-[#e2e6ee] my-2.5 overflow-hidden"
                    role="img"
                    aria-label={`Chance estimada de ${result.pc.main}%`}
                  >
                    <i
                      className="block h-full rounded-full transition-all"
                      style={{ width: `${result.pc.main}%`, background: result.segColor }}
                    />
                  </div>
                  <small className="block text-[#5b6578] text-xs leading-relaxed">
                    Estimativa com base nas suas respostas. Com a orientação certa e a documentação bem preparada, o seu perfil pode ser fortalecido.
                  </small>
                </div>

                {/* 3-segment Level Bar */}
                <div className="grid grid-cols-3 gap-1.5 mt-4 mb-1.5" aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-2.5 rounded-full bg-[#e2e6ee]"
                      style={i <= result.segs ? { background: result.segColor } : undefined}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-xs text-[#5b6578] font-bold">
                  <span>Em construção</span>
                  <span className="text-center">Moderado</span>
                  <span className="text-right">Forte</span>
                </div>

                <p className="mt-3.5 font-semibold text-[#14213a]">{result.LV[result.lv][1]}</p>

                {/* Recommended Visa Box */}
                <div className="mt-4 bg-[#f5eee4] rounded-2xl p-4">
                  <small className="text-[#8a6a3c] font-extrabold tracking-widest uppercase text-xs block">
                    Visto indicado para o seu objetivo
                  </small>
                  <b className="text-xl text-[#14213a] block mt-0.5">{result.vis}</b>
                  <span className="text-sm text-[#5b6578]">{result.visDesc}</span>
                </div>

                <a
                  href={result.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full bg-[#1f9d55] hover:bg-[#198246] text-white font-extrabold text-base rounded-xl py-4 px-5 flex items-center justify-center gap-2.5 transition-colors"
                >
                  Enviar meu resultado pelo WhatsApp
                </a>

                {result.crit.length > 0 && (
                  <div className="mt-4 bg-[#fbe9ee] text-[#14213a] rounded-2xl p-4 text-sm">
                    <b className="text-[#b31942]">Atenção:</b> você informou{' '}
                    {result.crit.map((c) => result.critTxt[c]).join(', ')}. Essas situações podem gerar inelegibilidade e precisam de análise individual. Fale com a nossa equipe antes de preencher o DS-160.
                  </div>
                )}

                {/* Good & Attention Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
                  <div className="border border-[#e2e6ee] rounded-2xl p-4">
                    <h3 className="text-[#1f7a4d] font-extrabold text-[15px] mb-2">Pontos fortes</h3>
                    <ul className="list-disc pl-4 space-y-1.5 text-sm">
                      {result.good.map((x, idx) => (
                        <li key={idx}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="border border-[#e2e6ee] rounded-2xl p-4">
                    <h3 className="text-[#a2610c] font-extrabold text-[15px] mb-2">Pontos de atenção</h3>
                    <ul className="list-disc pl-4 space-y-1.5 text-sm">
                      {result.att.map((x, idx) => (
                        <li key={idx}>{x}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-5 grid gap-2.5">
                  <div className="bg-[#e7f4ec] rounded-2xl p-4">
                    <small className="text-[#1f7a4d] font-extrabold tracking-widest uppercase text-xs block">
                      Próximo passo
                    </small>
                    <span className="block font-semibold text-sm mt-0.5">
                      Toque no botão abaixo para enviar o seu resultado à equipe VisareBR pelo WhatsApp. A mensagem já vai pronta: é só tocar em enviar.
                    </span>
                  </div>

                  <a
                    href={result.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#1f9d55] hover:bg-[#198246] text-white font-extrabold text-base rounded-xl py-4 px-5 flex items-center justify-center gap-2.5 transition-colors"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.1.3.7 1.2 1.5 1.9 1 .9 1.8 1.2 2.1 1.3.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" />
                    </svg>
                    Enviar resultado pelo WhatsApp
                  </a>

                  <Link
                    to="/"
                    className="bg-[#b31942] hover:bg-[#981437] text-white font-extrabold rounded-xl py-3.5 px-5 text-center transition-colors"
                  >
                    Voltar para o início
                  </Link>
                  <button
                    type="button"
                    onClick={handleRedo}
                    className="bg-transparent text-[#14213a] border-[1.5px] border-[#e2e6ee] hover:border-[#14213a] font-extrabold rounded-xl py-3.5 px-5 transition-colors cursor-pointer"
                  >
                    Refazer avaliação
                  </button>
                </div>

                <p className="text-xs text-[#5b6578] mt-5 border-t border-[#e2e6ee] pt-3.5 leading-relaxed">
                  Resultado orientativo, gerado automaticamente a partir das suas respostas e com base nos critérios públicos do Departamento de Estado dos EUA. Não é garantia de aprovação: a decisão sobre qualquer visto é exclusiva do oficial consular. Para uma análise completa, fale com a equipe VisareBR.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

