import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

type QuestionOpt = [string, string] | [string, string, string];

interface QuestionDef {
  id: string;
  q: string;
  help?: string;
  type: 'single' | 'multi';
  opts: QuestionOpt[];
  show?: (a: QuizAnswers) => boolean;
}

interface QuizAnswers {
  [key: string]: string | string[] | undefined;
}

interface LeadData {
  nome: string;
  whats: string;
  email: string;
  ok: boolean;
}

interface VisaScoreItem {
  id: string;
  name: string;
  group: 'ni' | 'im';
  desc: string;
  s: number;
  plus: string[];
  minus: string[];
}

interface RequirementCheck {
  t: string;
  st: 'ok' | 'no' | 'q';
}

const DEFAULT_WHATSAPP = '5519998448417';
const LEAD_WEBHOOK = '';
const CALLMEBOT_PHONE = '+5519998448417';
const CALLMEBOT_APIKEY = '';

const Q: QuestionDef[] = [
  {
    id: 'objetivo',
    q: 'Qual é o seu principal objetivo nos Estados Unidos?',
    type: 'single',
    opts: [
      ['turismo', 'Turismo ou viagens rápidas de negócios'],
      ['estudo', 'Estudar (idiomas, graduação, pós ou intercâmbio)'],
      ['trabalho', 'Trabalhar temporariamente'],
      ['transferencia', 'Ser transferido(a) pela empresa onde trabalho'],
      ['talento', 'Atuar nos EUA pelo meu destaque profissional'],
      ['investir', 'Investir ou abrir um negócio'],
      ['casamento', 'Casar ou viver com cidadão(ã) americano(a)'],
      ['familia', 'Morar perto de familiares que vivem lá'],
      ['greencard_trabalho', 'Morar de forma permanente pelo trabalho (Green Card)'],
      ['naosei', 'Ainda não sei, quero conhecer minhas opções'],
    ],
  },
  {
    id: 'idade',
    q: 'Qual é a sua faixa de idade?',
    type: 'single',
    opts: [
      ['menor', 'Menos de 18 anos'],
      ['18_25', '18 a 25 anos'],
      ['26_35', '26 a 35 anos'],
      ['36_45', '36 a 45 anos'],
      ['46', '46 anos ou mais'],
    ],
  },
  {
    id: 'escolaridade',
    q: 'Qual é a sua escolaridade?',
    type: 'single',
    opts: [
      ['medio', 'Ensino médio ou técnico'],
      ['sup_and', 'Ensino superior em andamento'],
      ['superior', 'Ensino superior completo'],
      ['pos', 'Pós-graduação ou MBA'],
      ['mestrado', 'Mestrado'],
      ['doutorado', 'Doutorado'],
    ],
  },
  {
    id: 'experiencia',
    q: 'Quantos anos de experiência profissional você tem na sua área?',
    type: 'single',
    opts: [
      ['0', 'Menos de 2 anos'],
      ['1', 'De 2 a 5 anos'],
      ['2', 'De 5 a 10 anos'],
      ['3', 'Mais de 10 anos'],
    ],
  },
  {
    id: 'situacao',
    q: 'Qual é a sua situação profissional hoje?',
    type: 'single',
    opts: [
      ['clt', 'Empregado(a) com carteira assinada'],
      ['empresario', 'Empresário(a) ou sócio(a)'],
      ['autonomo', 'Autônomo(a) ou profissional liberal'],
      ['servidor', 'Servidor(a) público(a)'],
      ['estudante', 'Estudante'],
      ['sem', 'Sem vínculo no momento ou aposentado(a)'],
    ],
  },
  {
    id: 'cargo',
    q: 'Como você descreveria o seu cargo atual?',
    type: 'single',
    opts: [
      ['gestao', 'Gestão ou diretoria', 'Coordena equipes, área ou a empresa'],
      ['especialista', 'Especialista técnico', 'Domina produtos, sistemas ou processos da empresa'],
      ['operacional', 'Operacional ou administrativo'],
      ['na', 'Não se aplica'],
    ],
  },
  {
    id: 'empresa',
    q: 'Você trabalha em empresa que tem matriz, filial ou afiliada nos EUA?',
    type: 'single',
    opts: [
      ['sim1', 'Sim, e estou nela há 1 ano ou mais'],
      ['simmenos', 'Sim, mas estou nela há menos de 1 ano'],
      ['dono', 'Sou dono(a) de empresa e quero abrir uma unidade nos EUA'],
      ['nao', 'Não'],
    ],
  },
  {
    id: 'destaque',
    q: 'Quais destes pontos fazem parte da sua carreira?',
    help: 'Marque todos que se aplicam.',
    type: 'multi',
    opts: [
      ['premios', 'Prêmios ou reconhecimentos na minha área'],
      ['publicacoes', 'Artigos, livros ou pesquisas publicadas'],
      ['midia', 'Matérias sobre mim ou meu trabalho na imprensa'],
      ['palestras', 'Palestras, bancas ou júri em eventos da área'],
      ['associacoes', 'Associação de prestígio que exige mérito para entrar'],
      ['salario', 'Remuneração bem acima da média da profissão'],
      ['nenhum', 'Nenhum destes'],
    ],
  },
  {
    id: 'oferta',
    q: 'Você tem oferta de emprego de uma empresa americana?',
    type: 'single',
    opts: [
      ['formal', 'Sim, tenho uma oferta formal'],
      ['conversando', 'Estou em conversa com empresas'],
      ['nao', 'Não'],
    ],
  },
  {
    id: 'ingles',
    q: 'Como está o seu inglês?',
    type: 'single',
    opts: [
      ['0', 'Básico'],
      ['1', 'Intermediário'],
      ['2', 'Avançado ou fluente'],
    ],
  },
  {
    id: 'capital',
    q: 'Quanto você teria disponível para investir nos EUA?',
    help: 'Valores em dólares, com origem que você consiga comprovar.',
    type: 'single',
    opts: [
      ['0', 'Até US$ 100 mil'],
      ['1', 'De US$ 100 mil a US$ 500 mil'],
      ['2', 'De US$ 500 mil a US$ 800 mil'],
      ['3', 'De US$ 800 mil a US$ 1,05 milhão'],
      ['4', 'Acima de US$ 1,05 milhão'],
    ],
  },
  {
    id: 'cidadania',
    q: 'Você tem outra cidadania além da brasileira?',
    help: 'Alguns vistos de investidor só são possíveis com cidadania de países que têm tratado de comércio com os EUA.',
    type: 'single',
    opts: [
      ['tratado', 'Sim (ex.: italiana, portuguesa, espanhola, alemã, japonesa)'],
      ['nao', 'Não, apenas brasileira'],
    ],
  },
  {
    id: 'familia',
    q: 'Você tem algum destes vínculos com cidadãos ou residentes americanos?',
    help: 'Marque todos que se aplicam.',
    type: 'multi',
    opts: [
      ['conjuge', 'Sou casado(a) com cidadão(ã) americano(a)'],
      ['noivo', 'Sou noivo(a) de cidadão(ã) americano(a)'],
      ['filho21', 'Tenho filho(a) cidadão(ã) americano(a) com 21 anos ou mais'],
      ['pais', 'Meu pai ou minha mãe é cidadão(ã) americano(a)'],
      ['irmao', 'Tenho irmão(ã) cidadão(ã) americano(a)'],
      ['gc', 'Meu cônjuge ou meus pais têm Green Card'],
      ['nenhum', 'Nenhum destes'],
    ],
  },
  {
    id: 'vinculos',
    q: 'Quais vínculos você tem com o Brasil hoje?',
    help: 'Marque todos que se aplicam. Eles mostram ao consulado que você vai voltar.',
    type: 'multi',
    opts: [
      ['emprego', 'Emprego ou empresa ativa'],
      ['renda', 'Renda que consigo comprovar'],
      ['imovel', 'Imóvel ou bens em meu nome'],
      ['familia', 'Família ou dependentes no Brasil'],
      ['viagens', 'Viagens internacionais anteriores'],
      ['nenhum', 'Nenhum destes'],
    ],
  },
  {
    id: 'historico',
    q: 'Qual é o seu histórico com vistos americanos?',
    type: 'single',
    opts: [
      ['nunca', 'Nunca solicitei'],
      ['aprovado', 'Já tive visto aprovado'],
      ['negado', 'Já tive visto negado'],
      ['overstay', 'Já fiquei nos EUA além do prazo permitido'],
    ],
  },
  {
    id: 'escola',
    q: 'Você já escolheu uma escola nos EUA?',
    type: 'single',
    show: (a) => a.objetivo === 'estudo',
    opts: [
      ['aceite', 'Sim, já tenho aceite (I-20 ou DS-2019)'],
      ['pesquisando', 'Estou pesquisando escolas'],
      ['nao', 'Ainda não'],
    ],
  },
];

const REQ: Record<string, string[]> = {
  b1b2: [
    'Propósito temporário: turismo, visita, tratamento médico ou reuniões de negócios (sem trabalhar nos EUA)',
    'Formulário DS-160, pagamento da taxa e entrevista no consulado',
    'Comprovar vínculos com o Brasil que garantam o retorno (emprego, renda, família, bens)',
    'Recursos para pagar a viagem e a estadia',
  ],
  f1: [
    'Aceite em escola credenciada pelo SEVP e o formulário I-20',
    'Pagamento da taxa SEVIS, DS-160 e entrevista',
    'Curso em tempo integral (inglês intensivo, graduação, pós etc.)',
    'Recursos comprovados para curso e manutenção',
    'Intenção de voltar ao Brasil ao fim do curso',
  ],
  j1: [
    'Programa de intercâmbio com patrocinador designado pelo Departamento de Estado e o formulário DS-2019',
    'Pagamento da taxa SEVIS, DS-160 e entrevista',
    'Requisitos do programa (au pair, estágio, trainee, pesquisa, professor)',
    'Alguns programas exigem 2 anos de residência no Brasil depois do intercâmbio',
  ],
  h1b: [
    'Oferta de emprego de empresa americana em ocupação especializada',
    'Diploma de nível superior na área do cargo (ou equivalência)',
    'Registro e seleção no sorteio anual de vagas',
    'Petição I-129 aprovada pelo USCIS, com LCA certificada pelo Departamento do Trabalho',
  ],
  l1: [
    'Empresa no exterior com matriz, filial, subsidiária ou coligada nos EUA, operando nos dois países',
    '1 ano contínuo de trabalho em tempo integral na empresa nos últimos 3 anos',
    'Cargo de executivo, gerente (L-1A) ou conhecimento especializado (L-1B)',
    'Petição I-129 aprovada pelo USCIS; escritório novo exige local físico garantido',
    'Família vai com visto L-2',
  ],
  o1: [
    'Destaque extraordinário comprovado, com reconhecimento nacional ou internacional',
    'Pelo menos 3 critérios de prova (prêmios, mídia, publicações, júri, cargo de destaque, remuneração alta) ou um prêmio de grande porte',
    'Empregador ou agente nos EUA que apresente a petição I-129',
    'Parecer (carta) de grupo profissional ou especialista da área',
  ],
  e2: [
    'Cidadania de país com tratado de comércio com os EUA (o Brasil não tem)',
    'Investimento substancial, comprometido e em risco em negócio real nos EUA',
    'Negócio não marginal: deve gerar mais que o sustento da família ou ter impacto econômico',
    'Controle de pelo menos 50% do negócio e vir para dirigi-lo',
    'Comprovar a origem lícita dos recursos',
  ],
  k1: [
    'Noivo(a) cidadão(ã) americano(a) apresenta a petição I-129F',
    'Os dois livres para casar e com encontro presencial nos últimos 2 anos',
    'Casar nos EUA em até 90 dias após a entrada',
    'Depois do casamento, pedido de Green Card nos EUA',
  ],
  cr1: [
    'Casamento válido com cidadão(ã) americano(a)',
    'Petição I-130 apresentada pelo cônjuge cidadão',
    'Comprovar que o casamento é verdadeiro',
    'Declaração de suporte financeiro (I-864) do cônjuge e entrevista no consulado',
  ],
  fam: [
    'Familiar cidadão ou residente permanente apresenta a petição I-130',
    'Cidadão pode pedir cônjuge, filhos, pais (se tiver 21 anos ou mais) e irmãos',
    'Residente permanente pode pedir cônjuge e filhos solteiros',
    'Fila de espera conforme a categoria e declaração de suporte financeiro (I-864)',
  ],
  eb1: [
    'Habilidade extraordinária com reconhecimento sustentado no topo da área',
    'Um prêmio de grande porte ou provas de pelo menos 3 dos 10 critérios do USCIS',
    'Não exige oferta de emprego: a própria pessoa pode fazer a petição I-140',
    'Continuar trabalhando na área nos EUA',
  ],
  niw: [
    'Mestrado ou doutorado, ou diploma superior com 5 anos de experiência progressiva (ou habilidade excepcional)',
    'Proposta de trabalho com mérito substancial e importância nacional para os EUA',
    'Estar bem posicionado(a) para levar a proposta adiante',
    'Mostrar que dispensar a oferta de emprego beneficia os EUA (petição I-140 própria)',
  ],
  eb3: [
    'Oferta de emprego permanente de empresa americana',
    'Certificação de trabalho (PERM) pelo Departamento do Trabalho',
    'Petição I-140 do empregador',
    'Fila de espera conforme a categoria e o país',
  ],
  eb5: [
    'Investimento de US$ 1,05 milhão, ou US$ 800 mil em área prioritária (TEA) ou centro regional',
    'Criar pelo menos 10 empregos em tempo integral para trabalhadores americanos',
    'Comprovar a origem lícita de todo o capital',
    'Petição I-526E (centro regional) ou I-526',
  ],
};

const INFO: Record<string, { tipo: string; about: string; para: string[] }> = {
  b1b2: {
    tipo: 'Temporário',
    about:
      'É o visto de visitante, o mais pedido pelos brasileiros. Serve para viajar aos EUA a passeio, visitar família e amigos, fazer tratamento médico, participar de feiras, congressos e reuniões de negócios. Não permite trabalhar nem fazer curso regular. Pode ser emitido com validade de vários anos, e o tempo de cada estadia é definido na entrada nos EUA.',
    para: [
      'Quem vai viajar a turismo ou visitar parentes',
      'Quem vai a reuniões, feiras e eventos de negócios',
      'Quem vai fazer tratamento médico',
      'Quem tem vínculos sólidos no Brasil e vai voltar',
    ],
  },
  f1: {
    tipo: 'Temporário',
    about:
      'É o visto de estudante para cursos acadêmicos e de inglês em escolas credenciadas. Você fica nos EUA enquanto durar o curso. O trabalho é bem limitado: em geral, só dentro da escola ou em estágio ligado ao curso, com autorização.',
    para: [
      'Quem vai fazer inglês intensivo, graduação, mestrado ou doutorado',
      'Quem já escolheu a escola ou está escolhendo',
      'Quem consegue comprovar recursos para o curso e para se manter',
    ],
  },
  j1: {
    tipo: 'Temporário',
    about:
      'É o visto de intercâmbio. Funciona por meio de programas com um patrocinador aprovado pelo governo americano, como au pair, estágio, trainee, pesquisa e professor visitante. O tempo de permanência depende do programa.',
    para: [
      'Jovens que querem ser au pair',
      'Estudantes e recém-formados em estágio ou trainee',
      'Pesquisadores, professores e profissionais em programas de intercâmbio',
    ],
  },
  h1b: {
    tipo: 'Temporário (trabalho)',
    about:
      'É o visto de trabalho para profissionais com diploma superior contratados por uma empresa americana. A empresa faz o pedido, e as vagas novas passam por um sorteio anual. A aprovação inicial é de até 3 anos, com possibilidade de prorrogação.',
    para: [
      'Profissionais com nível superior na área do cargo',
      'Quem já tem oferta de emprego de empresa americana',
      'Áreas como tecnologia, engenharia, saúde, finanças e outras especializadas',
    ],
  },
  l1: {
    tipo: 'Temporário (trabalho)',
    about:
      'É o visto de transferência dentro da mesma empresa. Serve para quem trabalha em uma empresa no exterior e vai atuar na matriz, filial ou empresa ligada nos EUA, inclusive abrindo um escritório novo. O L-1A (executivos e gerentes) permite ficar até 7 anos, e o L-1B (especialistas) até 5. O cônjuge e os filhos vão com o visto L-2.',
    para: [
      'Empresários que querem abrir uma unidade da empresa nos EUA',
      'Diretores, gerentes e especialistas de empresas com operação nos EUA',
      'Quem está há pelo menos 1 ano na empresa',
    ],
  },
  o1: {
    tipo: 'Temporário (trabalho)',
    about:
      'É o visto para pessoas com destaque extraordinário em ciências, educação, negócios, esportes ou artes. É preciso provar reconhecimento nacional ou internacional com documentos. Um empregador ou agente nos EUA faz o pedido. A aprovação inicial é de até 3 anos, com prorrogações.',
    para: [
      'Profissionais premiados ou reconhecidos na área',
      'Pessoas com matérias na imprensa, publicações ou participação como jurado',
      'Artistas, atletas, pesquisadores e empreendedores de destaque',
    ],
  },
  e2: {
    tipo: 'Temporário (investimento)',
    about:
      'É o visto para quem investe e administra um negócio nos EUA. Só pode ser pedido por cidadãos de países com tratado com os EUA. O Brasil não tem esse tratado, então o brasileiro precisa ter outra cidadania, como italiana ou portuguesa. Pode ser renovado enquanto o negócio estiver funcionando.',
    para: [
      'Quem tem cidadania de país com tratado (ex.: Itália, Portugal, Espanha)',
      'Quem quer abrir, comprar ou expandir um negócio nos EUA',
      'Quem tem capital próprio, de origem comprovada, para investir',
    ],
  },
  k1: {
    tipo: 'Temporário (casamento)',
    about:
      'É o visto de noivo(a) de cidadão americano. A pessoa entra nos EUA para casar em até 90 dias e, depois do casamento, pede o Green Card lá mesmo.',
    para: [
      'Quem está noivo(a) de cidadão(ã) americano(a)',
      'Casais que se encontraram pessoalmente nos últimos 2 anos',
      'Quem pretende casar e morar nos EUA',
    ],
  },
  cr1: {
    tipo: 'Green Card (imigrante)',
    about:
      'É o Green Card para quem é casado(a) com cidadão americano. O cônjuge cidadão faz o pedido. Se o casamento tem menos de 2 anos, o Green Card é condicional (CR-1); com 2 anos ou mais, é o IR-1. A pessoa já chega aos EUA como residente permanente.',
    para: [
      'Quem já é casado(a) com cidadão(ã) americano(a)',
      'Casais que conseguem comprovar que o casamento é verdadeiro',
    ],
  },
  fam: {
    tipo: 'Green Card (imigrante)',
    about:
      'É o Green Card pedido por um familiar que já é cidadão americano ou residente permanente. Pais, filhos, cônjuges e irmãos podem estar em categorias diferentes, e algumas têm fila de espera de anos.',
    para: [
      'Pais de cidadão americano com 21 anos ou mais',
      'Filhos e cônjuges de cidadãos ou de residentes permanentes',
      'Irmãos de cidadão americano (fila mais longa)',
    ],
  },
  eb1: {
    tipo: 'Green Card (imigrante)',
    about:
      'É o Green Card para quem está entre os melhores da sua área. Não precisa de empregador: a própria pessoa faz o pedido, desde que comprove reconhecimento nacional ou internacional sustentado.',
    para: [
      'Profissionais no topo da área, com prêmios e reconhecimento',
      'Pesquisadores, executivos, artistas e atletas de alto nível',
    ],
  },
  niw: {
    tipo: 'Green Card (imigrante)',
    about:
      'É o Green Card por interesse nacional (EB-2 NIW). É para profissionais com formação avançada cujo trabalho traz benefício importante para os EUA. Não precisa de oferta de emprego: a própria pessoa faz o pedido.',
    para: [
      'Quem tem mestrado ou doutorado',
      'Quem tem diploma superior e 5 anos ou mais de experiência progressiva',
      'Profissionais com um projeto de trabalho relevante para os EUA',
    ],
  },
  eb3: {
    tipo: 'Green Card (imigrante)',
    about:
      'É o Green Card com patrocínio de um empregador americano, para profissionais, trabalhadores qualificados e outros trabalhadores. O processo começa com a certificação de trabalho da empresa e costuma ter fila de espera.',
    para: [
      'Quem tem oferta de emprego permanente nos EUA',
      'Profissionais com diploma e trabalhadores com experiência ou qualificação',
    ],
  },
  eb5: {
    tipo: 'Green Card (imigrante)',
    about:
      'É o Green Card por investimento. O investidor aplica o valor mínimo exigido em um negócio americano que gere empregos. O cônjuge e os filhos solteiros menores de 21 anos recebem o Green Card junto.',
    para: [
      'Quem tem pelo menos US$ 800 mil para investir, com origem comprovada',
      'Quem quer morar nos EUA com a família por meio de investimento',
    ],
  },
};

function CHK(id: string, a: QuizAnswers): RequirementCheck[] {
  const arr = (k: string): string[] => {
    const val = a[k];
    return Array.isArray(val) ? val.filter((v) => v !== 'nenhum') : [];
  };
  const has = (k: string, v: string): boolean => arr(k).includes(v);
  const edu = ({ medio: 0, sup_and: 1, superior: 2, pos: 3, mestrado: 4, doutorado: 5 } as Record<string, number>)[
    String(a.escolaridade ?? '')
  ] ?? 0;
  const exp = Number(a.experiencia) || 0;
  const eng = Number(a.ingles) || 0;
  const cap = Number(a.capital) || 0;
  const ties = arr('vinculos').length;
  const aw = arr('destaque').length;
  const prof = ['clt', 'empresario', 'servidor', 'autonomo'].includes(String(a.situacao ?? ''));
  const okIf = (c: boolean, alt: 'no' | 'q' = 'no'): 'ok' | 'no' | 'q' => (c ? 'ok' : alt);

  const L: Record<string, [string, 'ok' | 'no' | 'q'][]> = {
    b1b2: [
      ['Propósito temporário (turismo, visita ou negócios)', ['turismo', 'naosei'].includes(String(a.objetivo ?? '')) ? 'ok' : 'q'],
      ['Vínculos fortes com o Brasil (emprego, renda, família, bens)', ties >= 3 ? 'ok' : ties >= 1 ? 'q' : 'no'],
      ['Ocupação ou renda comprovável', okIf(prof || has('vinculos', 'renda'))],
      ['Recursos para pagar a viagem', okIf(has('vinculos', 'renda'), 'q')],
      ['Histórico sem permanência irregular nos EUA', okIf(a.historico !== 'overstay')],
    ],
    f1: [
      ['Aceite de escola credenciada (I-20)', a.escola === 'aceite' ? 'ok' : a.escola === 'pesquisando' ? 'q' : 'no'],
      ['Recursos para pagar o curso e se manter', okIf(cap >= 1 || has('vinculos', 'renda'), 'q')],
      ['Inglês adequado ao curso', okIf(eng >= 1, 'q')],
      ['Vínculos e intenção de voltar ao Brasil', ties >= 2 ? 'ok' : ties === 1 ? 'q' : 'no'],
    ],
    j1: [
      ['Programa com patrocinador aprovado (DS-2019)', a.escola === 'aceite' ? 'ok' : 'q'],
      ['Perfil do programa (idade, estudo ou formação)', okIf(['18_25', '26_35'].includes(String(a.idade ?? '')) || a.situacao === 'estudante', 'q')],
      ['Inglês adequado', okIf(eng >= 1)],
      ['Vínculos com o Brasil', ties >= 2 ? 'ok' : ties === 1 ? 'q' : 'no'],
    ],
    h1b: [
      ['Diploma de nível superior na área', edu >= 2 ? 'ok' : edu === 1 ? 'q' : 'no'],
      ['Oferta de empresa americana que patrocine', a.oferta === 'formal' ? 'ok' : a.oferta === 'conversando' ? 'q' : 'no'],
      ['Experiência na área', okIf(exp >= 1, 'q')],
      ['Seleção no sorteio anual de vagas', 'q'],
    ],
    l1: [
      ['Empresa com matriz, filial ou coligada nos EUA (ou plano de abrir)', okIf(Boolean(a.empresa) && a.empresa !== 'nao')],
      ['1 ano contínuo na empresa nos últimos 3 anos', okIf(['sim1', 'dono'].includes(String(a.empresa ?? '')))],
      ['Cargo de gestão, diretoria ou especialista', okIf(['gestao', 'especialista'].includes(String(a.cargo ?? '')))],
    ],
    o1: [
      ['Pelo menos 3 provas de destaque (prêmios, mídia, publicações, júri...)', aw >= 3 ? 'ok' : aw >= 1 ? 'q' : 'no'],
      ['Reconhecimento contínuo na carreira', exp >= 2 ? 'ok' : 'q'],
      ['Empregador ou agente nos EUA', a.oferta === 'formal' ? 'ok' : 'q'],
    ],
    e2: [
      ['Cidadania de país com tratado (o Brasil não tem)', okIf(a.cidadania === 'tratado')],
      ['Investimento substancial no negócio', cap >= 1 ? 'ok' : 'q'],
      ['Experiência empresarial para dirigir o negócio', a.situacao === 'empresario' ? 'ok' : 'q'],
    ],
    k1: [
      ['Noivo(a) cidadão(ã) americano(a)', okIf(has('familia', 'noivo'))],
      ['Encontro pessoal nos últimos 2 anos', has('familia', 'noivo') ? 'q' : 'no'],
    ],
    cr1: [
      ['Casamento com cidadão(ã) americano(a)', okIf(has('familia', 'conjuge'))],
      ['Comprovar que o casamento é verdadeiro', has('familia', 'conjuge') ? 'q' : 'no'],
    ],
    fam: [
      ['Familiar cidadão ou residente que faça o pedido', okIf(['filho21', 'pais', 'gc', 'irmao', 'conjuge'].some((v) => has('familia', v)))],
      ['Parentesco aceito pela lei (cônjuge, pais, filhos ou irmãos)', okIf(['filho21', 'pais', 'gc', 'irmao', 'conjuge'].some((v) => has('familia', v)))],
      ['Familiar com renda para assinar o suporte financeiro', 'q'],
    ],
    eb1: [
      ['Destaque no topo da área (grande prêmio ou 3 de 10 critérios)', aw >= 3 ? 'ok' : aw >= 1 ? 'q' : 'no'],
      ['Carreira longa e reconhecida', exp === 3 ? 'ok' : exp === 2 ? 'q' : 'no'],
      ['Continuar atuando na área nos EUA', 'q'],
    ],
    niw: [
      ['Mestrado, ou graduação + 5 anos de experiência', edu >= 4 || (edu >= 2 && exp >= 2) ? 'ok' : edu >= 2 ? 'q' : 'no'],
      ['Proposta de trabalho com importância nacional para os EUA', 'q'],
      ['Histórico que mostre estar bem posicionado', aw >= 2 || exp >= 2 ? 'ok' : 'q'],
    ],
    eb3: [
      ['Oferta de emprego permanente nos EUA', a.oferta === 'formal' ? 'ok' : a.oferta === 'conversando' ? 'q' : 'no'],
      ['Formação ou experiência para o cargo', okIf(edu >= 2 || exp >= 1, 'q')],
      ['Certificação de trabalho (PERM) pelo empregador', 'q'],
    ],
    eb5: [
      ['Investimento mínimo (US$ 800 mil em área prioritária ou US$ 1,05 milhão)', cap >= 3 ? 'ok' : cap === 2 ? 'q' : 'no'],
      ['Origem lícita de todo o capital comprovada', 'q'],
      ['Criar 10 empregos nos EUA', 'q'],
    ],
  };

  return (L[id] || []).map(([t, st]) => ({ t, st }));
}

const ICO: Record<'ok' | 'no' | 'q', string> = { ok: '✓', no: '✗', q: '?' };
const STL: Record<'ok' | 'no' | 'q', string> = { ok: 'Já tem', no: 'Falta', q: 'A confirmar' };

function calculateScores(a: QuizAnswers): VisaScoreItem[] {
  const has = (k: string, v: string) => {
    const val = a[k];
    return Array.isArray(val) && val.includes(v);
  };
  const cnt = (k: string) => {
    const val = a[k];
    return Array.isArray(val) ? val.filter((v) => v !== 'nenhum').length : 0;
  };
  const edu =
    ({ medio: 0, sup_and: 1, superior: 2, pos: 3, mestrado: 4, doutorado: 5 } as Record<string, number>)[
      String(a.escolaridade ?? '')
    ] ?? 0;
  const exp = Number(a.experiencia) || 0;
  const eng = Number(a.ingles) || 0;
  const cap = Number(a.capital) || 0;
  const ties = cnt('vinculos');
  const awards = cnt('destaque');
  const prof = ['clt', 'empresario', 'servidor', 'autonomo'].includes(String(a.situacao ?? ''));
  const obj = String(a.objetivo ?? '');
  const h = String(a.historico ?? '');
  const advanced = edu >= 4 || (edu >= 2 && exp >= 1);

  const R: VisaScoreItem[] = [];
  const add = (
    id: string,
    name: string,
    group: 'ni' | 'im',
    desc: string,
    s: number,
    plus: string[],
    minus: string[],
    cap_ = 95
  ) => {
    R.push({
      id,
      name,
      group,
      desc,
      s: Math.round(Math.max(3, Math.min(Math.min(cap_, 90), s))),
      plus,
      minus,
    });
  };

  // ---------- Não imigrante ----------
  {
    const s =
      40 +
      Math.min(ties, 5) * 8 +
      (prof ? 8 : 0) +
      (obj === 'turismo' ? 10 : 0) -
      (['greencard_trabalho', 'familia', 'casamento'].includes(obj) ? 6 : 0) -
      (a.situacao === 'sem' ? 8 : 0) -
      (a.idade === '18_25' && !prof ? 6 : 0) +
      (h === 'aprovado' ? 12 : 0);
    const p: string[] = [];
    const m: string[] = [];
    if (ties >= 3) p.push('Bons vínculos com o Brasil');
    if (prof) p.push('Ocupação estável no Brasil');
    if (h === 'aprovado') p.push('Já teve visto aprovado');
    if (ties < 2) m.push('Fortaleça e documente seus vínculos com o Brasil (emprego, renda, bens, família)');
    add(
      'b1b2',
      'B1/B2 · Turismo e negócios',
      'ni',
      'Viagens de turismo, visitas e reuniões de negócios, sem trabalhar nos EUA.',
      s,
      p,
      m
    );
  }
  {
    const s =
      15 +
      (obj === 'estudo' ? 30 : obj === 'naosei' ? 5 : -10) +
      eng * 7 +
      (a.escola === 'aceite' ? 18 : a.escola === 'pesquisando' ? 8 : 0) +
      (cap >= 1 ? 10 : 0) +
      Math.min(ties, 3) * 4 +
      (['18_25', '26_35'].includes(String(a.idade ?? '')) ? 6 : 0) +
      (h === 'aprovado' ? 5 : 0);
    const p: string[] = [];
    const m: string[] = [];
    if (obj === 'estudo') p.push('Objetivo é estudar');
    if (eng >= 1) p.push('Nível de inglês ajuda na escolha do curso');
    if (a.escola === 'aceite') p.push('Já tem aceite da escola');
    if (cap < 1) m.push('É preciso comprovar recursos para pagar o curso e se manter');
    if (a.escola !== 'aceite') m.push('O visto só é pedido depois do aceite de uma escola credenciada (I-20)');
    add(
      'f1',
      'F-1 · Estudante',
      'ni',
      'Cursos de inglês, graduação, mestrado ou outros cursos acadêmicos em escola credenciada.',
      s,
      p,
      m
    );
  }
  {
    const s =
      10 +
      (obj === 'estudo' ? 15 : 0) +
      (a.idade === '18_25' ? 15 : a.idade === '26_35' ? 8 : 0) +
      (a.situacao === 'estudante' ? 12 : 0) +
      (edu >= 1 ? 6 : 0) +
      eng * 6 +
      Math.min(ties, 3) * 3;
    const p: string[] = [];
    const m: string[] = [];
    if (a.idade === '18_25' || a.idade === '26_35') p.push('Faixa de idade comum nos programas');
    if (a.situacao === 'estudante') p.push('Perfil de estudante');
    if (eng >= 1) p.push('Inglês adequado');
    m.push('Depende de um programa patrocinador aprovado (au pair, estágio, pesquisa, professor)');
    add(
      'j1',
      'J-1 · Intercâmbio',
      'ni',
      'Programas de intercâmbio patrocinados: au pair, estágio, trainee, pesquisa e ensino.',
      s,
      p,
      m,
      80
    );
  }
  {
    const s =
      5 +
      (edu >= 2 ? 20 : 0) +
      (edu >= 4 ? 5 : 0) +
      (a.oferta === 'formal' ? 30 : a.oferta === 'conversando' ? 10 : 0) +
      exp * 4 +
      eng * 5 +
      (obj === 'trabalho' ? 8 : 0);
    const p: string[] = [];
    const m: string[] = [];
    if (edu >= 2) p.push('Tem diploma de nível superior');
    if (a.oferta === 'formal') p.push('Já tem oferta de emprego');
    if (edu < 2) m.push('Exige diploma de nível superior (ou equivalência) na área do cargo');
    if (a.oferta !== 'formal') m.push('Precisa de um empregador americano que patrocine a petição');
    m.push('Há sorteio anual de vagas, então a chance também depende da seleção');
    add(
      'h1b',
      'H-1B · Profissional especializado',
      'ni',
      'Trabalho temporário em cargo que exige formação superior, com patrocínio de empresa americana.',
      s,
      p,
      m,
      55
    );
  }
  {
    const s =
      3 +
      (a.empresa === 'sim1' ? 50 : a.empresa === 'dono' ? 35 : a.empresa === 'simmenos' ? 18 : 0) +
      (a.cargo === 'gestao' ? 20 : a.cargo === 'especialista' ? 15 : 0) +
      (obj === 'transferencia' ? 12 : 0);
    const p: string[] = [];
    const m: string[] = [];
    if (a.empresa === 'sim1') p.push('1 ano ou mais na empresa com unidade nos EUA');
    if (a.empresa === 'dono') p.push('Empresa própria que pode abrir unidade nos EUA');
    if (a.cargo === 'gestao') p.push('Cargo de gestão (perfil L-1A)');
    if (a.cargo === 'especialista') p.push('Conhecimento especializado (perfil L-1B)');
    if (a.empresa === 'simmenos') m.push('É preciso 1 ano contínuo na empresa, nos últimos 3 anos');
    if (a.empresa === 'nao') m.push('Exige empresa com matriz, filial, subsidiária ou afiliada nos EUA');
    if (!['gestao', 'especialista'].includes(String(a.cargo ?? ''))) {
      m.push('O cargo precisa ser de gestão, executivo ou de conhecimento especializado');
    }
    add(
      'l1',
      'L-1 · Transferência pela empresa',
      'ni',
      'Transferência de gerentes, executivos e especialistas para a mesma empresa nos EUA. A família vai com o L-2.',
      s,
      p,
      m,
      92
    );
  }
  {
    const s =
      3 +
      Math.min(awards, 5) * 10 +
      (exp === 3 ? 15 : exp === 2 ? 8 : 0) +
      (edu >= 3 ? 5 : 0) +
      (obj === 'talento' ? 12 : 0);
    const p: string[] = [];
    const m: string[] = [];
    if (awards >= 3) p.push(`${awards} sinais de destaque na carreira`);
    if (exp >= 2) p.push('Carreira longa na área');
    if (awards < 3) m.push('Exige provas de reconhecimento nacional ou internacional (prêmios, mídia, publicações, júri)');
    m.push('Precisa de empregador ou agente nos EUA que apresente a petição');
    add(
      'o1',
      'O-1 · Habilidade extraordinária',
      'ni',
      'Para profissionais com destaque comprovado em ciências, artes, educação, negócios ou esportes.',
      s,
      p,
      m,
      85
    );
  }
  {
    let s: number;
    const p: string[] = [];
    const m: string[] = [];
    if (a.cidadania !== 'tratado') {
      s = 4;
      m.push('O Brasil não tem tratado E-2 com os EUA. Só é possível com cidadania de um país com tratado');
    } else {
      s =
        10 +
        ([0, 25, 35, 40, 40][cap] || 0) +
        (a.situacao === 'empresario' ? 15 : 0) +
        (obj === 'investir' ? 15 : 0) +
        (exp >= 1 ? 5 : 0);
      p.push('Tem cidadania de país com tratado');
      if (cap >= 1) p.push('Capital para um investimento substancial');
      if (cap < 1) m.push('O investimento precisa ser substancial para o tipo de negócio');
    }
    add(
      'e2',
      'E-2 · Investidor por tratado',
      'ni',
      'Abrir ou comprar um negócio nos EUA e administrá-lo, para cidadãos de países com tratado.',
      s,
      p,
      m,
      88
    );
  }
  {
    const ok = has('familia', 'noivo');
    const s = ok ? 85 + (obj === 'casamento' ? 6 : 0) : 2;
    add(
      'k1',
      'K-1 · Noivo(a) de cidadão',
      'ni',
      'Entrada nos EUA para casar com cidadão(ã) americano(a) em até 90 dias.',
      s,
      ok ? ['Noivado com cidadão(ã) americano(a)'] : [],
      ok
        ? ['O relacionamento precisa ser comprovado e os dois devem ter se encontrado pessoalmente']
        : ['Só se aplica a quem é noivo(a) de cidadão(ã) americano(a)']
    );
  }

  // ---------- Imigrante ----------
  {
    const ok = has('familia', 'conjuge');
    const s = ok ? 88 : 2;
    add(
      'cr1',
      'IR-1/CR-1 · Cônjuge de cidadão',
      'im',
      'Green Card para quem é casado(a) com cidadão(ã) americano(a).',
      s,
      ok ? ['Casamento com cidadão(ã) americano(a)'] : [],
      ok ? ['O casamento precisa ser comprovado como verdadeiro'] : ['Só se aplica a cônjuges de cidadãos americanos']
    );
  }
  {
    let s = 2;
    const p: string[] = [];
    const m: string[] = [];
    if (has('familia', 'filho21')) {
      s = 80;
      p.push('Filho(a) cidadão(ã) com 21 anos ou mais pode pedir pelos pais');
    } else if (has('familia', 'pais')) {
      s = 68;
      p.push('Pai ou mãe cidadão(ã) pode pedir pelos filhos');
      m.push('Filhos maiores de 21 ou casados entram em fila de espera');
    } else if (has('familia', 'gc')) {
      s = 50;
      p.push('Familiar com Green Card pode fazer o pedido');
      m.push('Há fila de espera por categoria');
    } else if (has('familia', 'irmao')) {
      s = 35;
      p.push('Irmão(ã) cidadão(ã) pode fazer o pedido');
      m.push('A fila para irmãos costuma levar muitos anos');
    } else {
      m.push('Depende de um familiar cidadão ou residente permanente que faça o pedido');
    }
    add(
      'fam',
      'Green Card por família',
      'im',
      'Pedido feito por pais, filhos, irmãos ou cônjuge cidadão ou com Green Card.',
      s,
      p,
      m
    );
  }
  {
    const s =
      2 +
      Math.min(awards, 6) * 11 +
      (exp === 3 ? 12 : exp === 2 ? 6 : 0) +
      (edu >= 4 ? 8 : 0) +
      (obj === 'talento' ? 8 : 0);
    const p: string[] = [];
    const m: string[] = [];
    if (awards >= 3) p.push('Vários sinais de reconhecimento');
    if (exp === 3) p.push('Mais de 10 anos de carreira');
    m.push('Exige reconhecimento sustentado no topo da área, comprovado por documentos');
    add(
      'eb1',
      'EB-1A · Habilidade extraordinária',
      'im',
      'Green Card sem oferta de emprego para quem está entre os melhores da sua área.',
      s,
      p,
      m,
      82
    );
  }
  {
    const s =
      3 +
      (advanced ? 35 : 0) +
      (edu === 5 ? 8 : 0) +
      exp * 4 +
      Math.min(awards, 4) * 5 +
      (eng === 2 ? 5 : 0) +
      (['greencard_trabalho', 'talento'].includes(obj) ? 8 : 0);
    const p: string[] = [];
    const m: string[] = [];
    if (edu >= 4) p.push('Mestrado ou doutorado');
    else if (advanced) p.push('Diploma superior com 5 anos ou mais de experiência');
    if (awards >= 2) p.push('Conquistas que fortalecem o caso');
    if (!advanced) m.push('Exige mestrado, ou diploma superior com 5 anos de experiência progressiva');
    m.push('O trabalho precisa ter mérito e importância nacional para os EUA');
    add(
      'niw',
      'EB-2 NIW · Interesse nacional',
      'im',
      'Green Card sem oferta de emprego para profissionais qualificados cujo trabalho beneficia os EUA.',
      s,
      p,
      m,
      advanced ? 85 : 20
    );
  }
  {
    const s =
      3 +
      (a.oferta === 'formal' ? 45 : a.oferta === 'conversando' ? 12 : 0) +
      (edu >= 2 ? 10 : 0) +
      (exp >= 1 ? 8 : 0) +
      (['greencard_trabalho', 'trabalho'].includes(obj) ? 8 : 0);
    const p: string[] = [];
    const m: string[] = [];
    if (a.oferta === 'formal') p.push('Já tem oferta de emprego');
    if (a.oferta !== 'formal') m.push('Exige oferta de emprego permanente e patrocínio do empregador (PERM)');
    m.push('O processo costuma ter fila de espera longa');
    add(
      'eb3',
      'EB-3 · Trabalhadores com oferta de emprego',
      'im',
      'Green Card com patrocínio de empregador para profissionais, trabalhadores qualificados e outros.',
      s,
      p,
      m,
      78
    );
  }
  {
    const s = ([3, 3, 12, 65, 78][cap] || 3) + (obj === 'investir' ? 10 : 0) + (a.situacao === 'empresario' ? 4 : 0);
    const p: string[] = [];
    const m: string[] = [];
    if (cap >= 3) p.push('Capital compatível com o investimento mínimo');
    if (cap < 3) m.push('Investimento mínimo de US$ 800 mil (área prioritária) ou US$ 1,05 milhão');
    m.push('É preciso comprovar a origem lícita dos recursos e gerar 10 empregos');
    add(
      'eb5',
      'EB-5 · Investidor',
      'im',
      'Green Card por investimento em negócio americano que gere empregos.',
      s,
      p,
      m,
      90
    );
  }

  R.forEach((r) => {
    if (h === 'overstay') {
      r.s = Math.max(3, r.s - (r.group === 'ni' ? 35 : 15));
      r.minus.unshift('Permanência além do prazo pode gerar impedimento. Precisa de análise individual');
    } else if (h === 'negado' && r.group === 'ni') {
      r.s = Math.max(3, r.s - 8);
      r.minus.push('Negativa anterior: o novo pedido precisa mostrar o que mudou');
    }
  });

  return R;
}

const level = (s: number): ['alta' | 'media' | 'baixa', string] =>
  s >= 70 ? ['alta', 'Alta compatibilidade'] : s >= 40 ? ['media', 'Média compatibilidade'] : ['baixa', 'Baixa compatibilidade'];

const QLBL: Record<string, string> = {
  objetivo: 'Objetivo',
  idade: 'Idade',
  escolaridade: 'Escolaridade',
  experiencia: 'Experiência na área',
  situacao: 'Situação profissional',
  cargo: 'Cargo',
  empresa: 'Empresa com unidade nos EUA',
  destaque: 'Destaque na carreira',
  oferta: 'Oferta de emprego nos EUA',
  ingles: 'Inglês',
  capital: 'Capital para investir',
  cidadania: 'Outra cidadania',
  familia: 'Família cidadã/residente nos EUA',
  vinculos: 'Vínculos com o Brasil',
  historico: 'Histórico de vistos',
  escola: 'Escola nos EUA',
};

function lab(id: string, v: string | string[] | undefined): string {
  const q = Q.find((x) => x.id === id);
  if (!q || v === undefined) return String(v ?? '');
  const f = (k: string) => (q.opts.find((o) => o[0] === k) || [])[1] || k;
  return Array.isArray(v) ? v.map(f).join(', ') : f(v);
}

function origemLead(): string {
  return typeof window !== 'undefined' && /visarebr/i.test(window.location.hostname)
    ? 'site visarebr.com.br'
    : 'site VisareBR';
}

function waText(R: VisaScoreItem[], ans: QuizAnswers, lead: LeadData, visibleQs: QuestionDef[]): string {
  const D = '━━━━━━━━━━━━━━━━';
  const d = new Date();
  const L: string[] = [];
  const sorted = [...R].sort((x, y) => y.s - x.s);

  L.push(
    '*VISAREBR | QUAL VISTO COMBINA COM VOCÊ*',
    'Diagnóstico de compatibilidade',
    `Data: ${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    `Origem: ${origemLead()}`,
    D,
    ''
  );
  L.push('*CLIENTE*', `• Nome: ${lead.nome}`, `• WhatsApp: ${lead.whats}`);
  if (lead.email) L.push(`• E-mail: ${lead.email}`);
  L.push(`• Objetivo: ${lab('objetivo', ans.objetivo)}`, '');
  L.push('*RESULTADO GERAL*', `• Mais indicado: ${sorted[0].name} (${sorted[0].s}%)`);
  sorted.slice(1, 3).forEach((r) => L.push(`• Também compatível: ${r.name} (${r.s}%)`));
  if (ans.historico === 'overstay') {
    L.push('• ALERTA: informou permanência além do prazo. Precisa de análise individual');
  }
  L.push('');

  const block = (title: string, arr: VisaScoreItem[]) => {
    L.push(D, `*${title}*`, '');
    arr.forEach((r) => {
      const c = CHK(r.id, ans);
      const n = c.filter((x) => x.st === 'ok').length;
      L.push(`*${r.name}: ${r.s}%* – tem ${n} de ${c.length} requisitos`);
      c.forEach((x) => L.push(`${ICO[x.st]} ${x.t}${x.st === 'q' ? ' (a confirmar)' : ''}`));
      L.push('');
    });
  };

  block(
    'VISTOS TEMPORÁRIOS (NÃO IMIGRANTE)',
    R.filter((r) => r.group === 'ni').sort((x, y) => y.s - x.s)
  );
  block(
    'GREEN CARD (IMIGRANTE)',
    R.filter((r) => r.group === 'im').sort((x, y) => y.s - x.s)
  );

  L.push(D, '*RESPOSTAS DO CLIENTE*');
  visibleQs.forEach((q) => {
    const v = ans[q.id];
    if (v !== undefined && !(Array.isArray(v) && !v.length)) {
      L.push(`• ${QLBL[q.id] || q.id}: ${lab(q.id, v)}`);
    }
  });
  L.push('', D, '_Legenda: ✓ já tem · ✗ falta · ? a confirmar_');
  return L.join('\n');
}

function chunks(text: string, max = 3000): string[] {
  const out: string[] = [];
  let cur = '';
  for (const line of text.split('\n')) {
    if ((cur + '\n' + line).length > max && cur) {
      out.push(cur);
      cur = line;
    } else {
      cur = cur ? cur + '\n' + line : line;
    }
  }
  if (cur) out.push(cur);
  return out.map((c, i, arr) => (arr.length > 1 ? `(${i + 1}/${arr.length})\n` + c : c));
}

function ChecklistBlock({ list }: { list: RequirementCheck[] }) {
  const n = list.filter((x) => x.st === 'ok').length;
  return (
    <div className="mt-2.5 bg-[#f5f6fb] rounded-xl p-3">
      <div className="text-[13.5px] font-bold text-[#0b0f57] mb-1.5">
        Requisitos: você já tem <b>{n} de {list.length}</b>
      </div>
      <ul className="space-y-1.5 text-sm">
        {list.map((x, idx) => {
          const iconColor = x.st === 'ok' ? 'text-[#1f8a55]' : x.st === 'no' ? 'text-[#c8102e]' : 'text-[#b7791f]';
          const badgeStyle =
            x.st === 'ok'
              ? 'bg-[#e5f5ec] text-[#1f8a55]'
              : x.st === 'no'
              ? 'bg-[#fde8eb] text-[#c8102e]'
              : 'bg-[#fbf1e1] text-[#b7791f]';

          return (
            <li key={idx} className="grid grid-cols-[20px_1fr] gap-1.5 items-start">
              <i aria-hidden="true" className={`not-italic font-extrabold text-center ${iconColor}`}>
                {ICO[x.st]}
              </i>
              <span>
                {x.t}{' '}
                <em className={`not-italic text-xs font-bold px-2 py-0.5 rounded-full ml-1 whitespace-nowrap ${badgeStyle}`}>
                  {STL[x.st]}
                </em>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function VisaMatcher() {
  const { settings } = useSettings();
  const waNumber = settings?.whatsappNumber ? settings.whatsappNumber.replace(/\D/g, '') : DEFAULT_WHATSAPP;

  const [ans, setAns] = useState<QuizAnswers>({});
  const [step, setStep] = useState<number>(-1);
  const [lead, setLead] = useState<LeadData>({ nome: '', whats: '', email: '', ok: false });
  const [errMsg, setErrMsg] = useState<string>('');
  const [selectedVisaId, setSelectedVisaId] = useState<string | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);

  const visibleQs = Q.filter((q) => !q.show || q.show(ans));
  const total = visibleQs.length + 1;

  const scrollTop = () => {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOptionSelect = (q: QuestionDef, key: string) => {
    if (q.type === 'multi') {
      const current = Array.isArray(ans[q.id]) ? (ans[q.id] as string[]) : [];
      let nextArr: string[];
      if (key === 'nenhum') {
        nextArr = current.includes('nenhum') ? [] : ['nenhum'];
      } else {
        const withoutNone = current.filter((x) => x !== 'nenhum');
        nextArr = withoutNone.includes(key) ? withoutNone.filter((x) => x !== key) : [...withoutNone, key];
      }
      setAns((prev) => ({ ...prev, [q.id]: nextArr }));
    } else {
      setAns((prev) => ({ ...prev, [q.id]: key }));
      setTimeout(() => {
        setStep((s) => s + 1);
      }, 140);
    }
  };

  const sendLeadOptional = (R: VisaScoreItem[], currentLead: LeadData) => {
    const texto = waText(R, ans, currentLead, visibleQs);
    const objetivo = (Q[0].opts.find((o) => o[0] === ans.objetivo) || [])[1] || '';
    if (LEAD_WEBHOOK) {
      try {
        fetch(LEAD_WEBHOOK, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            data: new Date().toISOString(),
            ...currentLead,
            origem: origemLead(),
            objetivo,
            respostas: ans,
            resultado: R.map((r) => ({ visto: r.name, pct: r.s })),
            mensagem_whatsapp: texto,
          }),
        });
      } catch {
        // ignore optional webhook error
      }
    }
    if (CALLMEBOT_APIKEY) {
      chunks(texto).forEach((part, i) =>
        setTimeout(() => {
          try {
            fetch(
              `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
                CALLMEBOT_PHONE
              )}&apikey=${encodeURIComponent(CALLMEBOT_APIKEY)}&text=${encodeURIComponent(part)}`,
              { mode: 'no-cors' }
            );
          } catch {
            // ignore optional callmebot error
          }
        }, i * 2500)
      );
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed: LeadData = {
      nome: lead.nome.trim(),
      whats: lead.whats.trim(),
      email: lead.email.trim(),
      ok: lead.ok,
    };
    const digits = trimmed.whats.replace(/\D/g, '');
    if (trimmed.nome.length < 3) {
      setErrMsg('Digite seu nome completo.');
      return;
    }
    if (digits.length < 10) {
      setErrMsg('Digite seu WhatsApp com DDD, por exemplo (11) 91234-5678.');
      return;
    }
    if (!trimmed.ok) {
      setErrMsg('Marque a autorização de contato para ver o resultado.');
      return;
    }
    setLead(trimmed);
    setErrMsg('');
    const R = calculateScores(ans);
    setStep(visibleQs.length + 1);
    sendLeadOptional(R, trimmed);
    scrollTop();
  };

  const handleRedo = () => {
    setAns({});
    setStep(-1);
    setErrMsg('');
    setSelectedVisaId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const results = step > visibleQs.length ? calculateScores(ans) : [];
  const sortedResults = [...results].sort((a, b) => b.s - a.s);
  const bestVisa = sortedResults[0];
  const niVisas = results.filter((r) => r.group === 'ni').sort((a, b) => b.s - a.s);
  const imVisas = results.filter((r) => r.group === 'im').sort((a, b) => b.s - a.s);
  const selectedVisa = selectedVisaId ? results.find((x) => x.id === selectedVisaId) : null;

  const renderVisaRow = (r: VisaScoreItem) => {
    const [cls, labelTxt] = level(r.s);
    const barColor = cls === 'alta' ? 'bg-[#1f8a55]' : cls === 'media' ? 'bg-[#b7791f]' : 'bg-[#8a8fb0]';
    const chipStyle =
      cls === 'alta'
        ? 'bg-[#e5f5ec] text-[#1f8a55]'
        : cls === 'media'
        ? 'bg-[#fbf1e1] text-[#b7791f]'
        : 'bg-[#eef0f6] text-[#565b80]';

    return (
      <div
        key={r.id}
        role="button"
        tabIndex={0}
        onClick={() => setSelectedVisaId(r.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedVisaId(r.id);
          }
        }}
        aria-label={`Entender o visto ${r.name}`}
        className="border-t border-[#e3e5f2] py-4 px-3 -mx-3 rounded-2xl cursor-pointer hover:bg-[#f6f7fd] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b93ff]"
      >
        <div className="flex justify-between items-baseline gap-3">
          <strong className="text-[17px] text-[#0b0f57]">{r.name}</strong>
          <span className="font-extrabold text-[22px] tabular-nums text-[#0b0f57]">{r.s}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#eef0f6] my-2 overflow-hidden">
          <span className={`block h-full rounded-full ${barColor}`} style={{ width: `${r.s}%` }} />
        </div>
        <div>
          <span className={`inline-block text-xs font-bold tracking-wide px-2.5 py-0.5 rounded-full mr-2 ${chipStyle}`}>
            {labelTxt}
          </span>
          <span className="text-sm text-[#5b5f86]">{r.desc}</span>
        </div>
        <ChecklistBlock list={CHK(r.id, ans)} />
        <span className="inline-block mt-2 text-sm font-bold text-[#c8102e]">
          Entenda este visto e veja se combina com você ›
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-[#141738] pb-16">
      {/* Header Band */}
      <header className="bg-[#0b0f57] text-white pt-8 pb-24 px-4 relative overflow-hidden">
        <div
          className="absolute -right-28 -top-40 w-[520px] h-[520px] -rotate-[28deg] opacity-10 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, #c8102e 0 34px, #ffffff 34px 68px)',
          }}
        />
        <div className="max-w-[760px] mx-auto relative z-10">
          <div className="text-xs font-bold tracking-[0.14em] uppercase text-[#c9cdf2] mb-3">
            Assessoria em Visto Americano
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase leading-none mb-3 tracking-tight">
            Qual visto <em className="not-italic text-[#ff4d61]">combina</em> com o seu perfil?
          </h1>
          <p className="max-w-[56ch] text-[#d6d9f5] text-[17px]">
            Responda algumas perguntas e veja a compatibilidade do seu perfil com cada tipo de visto americano, temporário ou de imigração.
          </p>
        </div>
      </header>

      {/* Main Card */}
      <main className="px-4">
        <section
          ref={cardRef}
          aria-live="polite"
          className="max-w-[760px] mx-auto -mt-16 bg-white rounded-3xl shadow-[0_24px_60px_rgba(11,15,87,0.14)] p-6 sm:p-10 relative z-20"
        >
          {/* INTRO STEP */}
          {step < 0 && (
            <>
              <div className="flex justify-between items-center gap-3 text-xs font-bold tracking-widest uppercase text-[#5b5f86]">
                <span>Avaliação gratuita · cerca de 3 minutos</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b0f57] mt-3.5 mb-2 leading-tight">
                Descubra os caminhos possíveis para você nos EUA
              </h2>
              <p className="text-[#5b5f86] text-[15px] mb-6">
                São {Q.length - 1} perguntas rápidas sobre seus objetivos, formação, carreira e família.
              </p>
              <ul className="grid gap-3 my-4 mb-6">
                <li className="flex gap-3 items-start">
                  <b className="w-7 h-7 shrink-0 rounded-full bg-[#fde8eb] text-[#c8102e] grid place-items-center text-sm font-bold">
                    1
                  </b>
                  <span>Você responde sobre o seu perfil, sem precisar de documentos.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <b className="w-7 h-7 shrink-0 rounded-full bg-[#fde8eb] text-[#c8102e] grid place-items-center text-sm font-bold">
                    2
                  </b>
                  <span>Recebe a compatibilidade com 14 tipos de visto, temporários e de Green Card.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <b className="w-7 h-7 shrink-0 rounded-full bg-[#fde8eb] text-[#c8102e] grid place-items-center text-sm font-bold">
                    3
                  </b>
                  <span>Envia o diagnóstico para a equipe VisareBR e recebe uma orientação personalizada.</span>
                </li>
              </ul>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="bg-[#c8102e] hover:bg-[#a80d26] text-white font-bold text-base rounded-full px-7 py-3.5 transition-colors cursor-pointer"
              >
                Começar avaliação →
              </button>
              <p className="text-xs text-[#5b5f86] mt-4">
                Usamos apenas os critérios oficiais do USCIS e do Departamento de Estado dos EUA.
              </p>
            </>
          )}

          {/* QUESTIONS STEP */}
          {step >= 0 && step < visibleQs.length && (() => {
            const q = visibleQs[step];
            const v = ans[q.id];
            const multi = q.type === 'multi';
            const isSel = (k: string) => (multi ? Array.isArray(v) && v.includes(k) : v === k);

            return (
              <>
                <div className="flex justify-between items-center gap-3 text-xs font-bold tracking-widest uppercase text-[#5b5f86]">
                  <span>
                    Pergunta {step + 1} de {total}
                  </span>
                  <span>{Math.round((step / total) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-[#e3e5f2] rounded-full mt-3 mb-6 overflow-hidden">
                  <span
                    className="block h-full bg-[#c8102e] rounded-full transition-all duration-300"
                    style={{ width: `${(step / total) * 100}%` }}
                  />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b0f57] mb-2 leading-tight">{q.q}</h2>
                <p className="text-[#5b5f86] text-[15px] mb-5">
                  {q.help ? q.help : multi ? 'Marque todos que se aplicam.' : 'Escolha uma opção.'}
                </p>

                <div className="grid gap-2.5">
                  {q.opts.map(([k, l, d]) => {
                    const active = isSel(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => handleOptionSelect(q, k)}
                        aria-pressed={active}
                        className={`flex items-center gap-3.5 w-full text-left text-base font-semibold rounded-2xl px-4 py-3.5 border-[1.5px] transition-colors cursor-pointer ${
                          active
                            ? 'border-[#0b0f57] bg-[#f0f1ff] text-[#141738]'
                            : 'border-[#e3e5f2] bg-white text-[#141738] hover:border-[#161c7a]'
                        }`}
                      >
                        <span
                          className={`w-[22px] h-[22px] shrink-0 border-2 grid place-items-center ${
                            multi ? 'rounded-md' : 'rounded-full'
                          } ${active ? 'bg-[#0b0f57] border-[#0b0f57]' : 'border-[#b9bdd8] bg-transparent'}`}
                        >
                          {active &&
                            (multi ? (
                              <span className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 -translate-y-[1px]" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-white" />
                            ))}
                        </span>
                        <span>
                          {l}
                          {d && <small className="block font-medium text-[#5b5f86] text-sm">{d}</small>}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between gap-3 mt-6 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="bg-transparent text-[#0b0f57] border-[1.5px] border-[#e3e5f2] hover:border-[#0b0f57] font-bold text-base rounded-full px-6 py-3.5 transition-colors cursor-pointer"
                  >
                    ← Voltar
                  </button>
                  {multi && (
                    <button
                      type="button"
                      disabled={!(Array.isArray(v) && v.length > 0)}
                      onClick={() => setStep(step + 1)}
                      className="bg-[#c8102e] hover:bg-[#a80d26] disabled:bg-[#e9a3ad] disabled:cursor-not-allowed text-white font-bold text-base rounded-full px-6 py-3.5 transition-colors cursor-pointer"
                    >
                      Continuar →
                    </button>
                  )}
                </div>
              </>
            );
          })()}

          {/* LEAD FORM STEP */}
          {step === visibleQs.length && (
            <>
              <div className="flex justify-between items-center gap-3 text-xs font-bold tracking-widest uppercase text-[#5b5f86]">
                <span>
                  Pergunta {total} de {total}
                </span>
                <span>Último passo</span>
              </div>
              <div className="h-1.5 bg-[#e3e5f2] rounded-full mt-3 mb-6 overflow-hidden">
                <span
                  className="block h-full bg-[#c8102e] rounded-full transition-all duration-300"
                  style={{ width: `${((total - 1) / total) * 100}%` }}
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b0f57] mb-2 leading-tight">
                Para onde enviamos o seu diagnóstico?
              </h2>
              <p className="text-[#5b5f86] text-[15px] mb-5">Seu resultado aparece logo em seguida.</p>

              <form onSubmit={handleLeadSubmit} noValidate>
                <div className="grid gap-1.5 mb-3.5">
                  <label htmlFor="vm_nome" className="font-bold text-sm text-[#0b0f57]">
                    Nome completo
                  </label>
                  <input
                    id="vm_nome"
                    autoComplete="name"
                    value={lead.nome}
                    onChange={(e) => {
                      setErrMsg('');
                      setLead({ ...lead, nome: e.target.value });
                    }}
                    required
                    className="text-base px-3.5 py-3 border-[1.5px] border-[#e3e5f2] rounded-xl bg-white text-[#141738] w-full focus:outline-none focus:ring-2 focus:ring-[#8b93ff]"
                  />
                </div>

                <div className="grid gap-1.5 mb-3.5">
                  <label htmlFor="vm_whats" className="font-bold text-sm text-[#0b0f57]">
                    WhatsApp com DDD
                  </label>
                  <input
                    id="vm_whats"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(11) 91234-5678"
                    value={lead.whats}
                    onChange={(e) => {
                      setErrMsg('');
                      setLead({ ...lead, whats: e.target.value });
                    }}
                    required
                    className="text-base px-3.5 py-3 border-[1.5px] border-[#e3e5f2] rounded-xl bg-white text-[#141738] w-full focus:outline-none focus:ring-2 focus:ring-[#8b93ff]"
                  />
                </div>

                <div className="grid gap-1.5 mb-3.5">
                  <label htmlFor="vm_email" className="font-bold text-sm text-[#0b0f57]">
                    E-mail (opcional)
                  </label>
                  <input
                    id="vm_email"
                    type="email"
                    autoComplete="email"
                    value={lead.email}
                    onChange={(e) => setLead({ ...lead, email: e.target.value })}
                    className="text-base px-3.5 py-3 border-[1.5px] border-[#e3e5f2] rounded-xl bg-white text-[#141738] w-full focus:outline-none focus:ring-2 focus:ring-[#8b93ff]"
                  />
                </div>

                <label className="flex gap-2.5 items-start text-sm text-[#5b5f86] cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={lead.ok}
                    onChange={(e) => {
                      setErrMsg('');
                      setLead({ ...lead, ok: e.target.checked });
                    }}
                    className="mt-1 w-[18px] h-[18px] shrink-0"
                  />
                  <span>Autorizo a VisareBR a entrar em contato comigo sobre o meu resultado.</span>
                </label>

                {errMsg && <p className="text-[#c8102e] text-sm font-semibold mt-3">{errMsg}</p>}

                <div className="flex justify-between gap-3 mt-6 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="bg-transparent text-[#0b0f57] border-[1.5px] border-[#e3e5f2] hover:border-[#0b0f57] font-bold text-base rounded-full px-6 py-3.5 transition-colors cursor-pointer"
                  >
                    ← Voltar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#c8102e] hover:bg-[#a80d26] text-white font-bold text-base rounded-full px-6 py-3.5 transition-colors cursor-pointer"
                  >
                    Ver meu resultado →
                  </button>
                </div>

                <p className="text-xs text-[#5b5f86] mt-4">
                  Ao confirmar, seu resultado aparece na hora e pode ser enviado para a equipe VisareBR.
                </p>
              </form>
            </>
          )}

          {/* RESULTS STEP */}
          {step > visibleQs.length && bestVisa && (
            <>
              <div className="flex justify-between items-center gap-3 text-xs font-bold tracking-widest uppercase text-[#5b5f86]">
                <span>Seu diagnóstico</span>
                <span>100%</span>
              </div>
              <div className="h-1.5 bg-[#e3e5f2] rounded-full mt-3 mb-6 overflow-hidden">
                <span className="block h-full bg-[#c8102e] rounded-full w-full" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b0f57] mb-2 leading-tight">
                {lead.nome.split(' ')[0] ? `${lead.nome.split(' ')[0]}, estes` : 'Estes'} são os caminhos mais compatíveis com o seu perfil
              </h2>
              <p className="text-[#5b5f86] text-[15px] mb-5">
                A porcentagem mostra o quanto o seu perfil atende aos requisitos de cada visto.{' '}
                <b>Toque em qualquer visto</b> para entender o que ele é e o que é preciso para ter.
              </p>

              {/* Top Best Visa Banner */}
              <div className="bg-[#0b0f57] text-white rounded-2xl p-5 flex gap-4 items-center flex-wrap">
                <div className="font-black text-5xl leading-none tabular-nums">{bestVisa.s}%</div>
                <div>
                  <div className="text-xs tracking-widest uppercase text-[#c9cdf2] font-bold">Caminho mais indicado</div>
                  <div className="font-extrabold text-2xl leading-tight">{bestVisa.name}</div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="mt-7 bg-[#fde8eb] rounded-2xl p-5">
                <h4 className="font-extrabold text-xl text-[#0b0f57] mb-1.5">Quer conversar sobre o seu perfil?</h4>
                <p className="text-[15px] mb-3.5 text-[#141738]">
                  Envie o seu resultado para a equipe VisareBR pelo WhatsApp. Vamos analisar o seu perfil com você e mostrar o melhor caminho para o seu visto.
                </p>
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waText(results, ans, lead, visibleQs))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1f8a55] hover:bg-[#197346] text-white font-bold text-base rounded-full px-6 py-3.5 inline-flex items-center justify-center gap-2.5 transition-colors"
                >
                  Enviar meu resultado para a equipe VisareBR
                </a>
              </div>

              {/* Non-immigrant Visas List */}
              <div className="mt-8">
                <h3 className="font-extrabold text-sm tracking-widest uppercase text-[#c8102e] mb-1">
                  Vistos temporários (não imigrante)
                </h3>
                <p className="text-[#5b5f86] text-sm mb-3">
                  Para estudar, trabalhar, investir ou visitar os EUA por um período.
                </p>
                <div>{niVisas.map(renderVisaRow)}</div>
              </div>

              {/* Immigrant Visas List */}
              <div className="mt-8">
                <h3 className="font-extrabold text-sm tracking-widest uppercase text-[#c8102e] mb-1">
                  Green Card (imigrante)
                </h3>
                <p className="text-[#5b5f86] text-sm mb-3">Para morar nos EUA de forma permanente.</p>
                <div>{imVisas.map(renderVisaRow)}</div>
              </div>

              <p className="text-xs text-[#5b5f86] mt-6 leading-relaxed">
                Este resultado é uma estimativa da compatibilidade do seu perfil com os requisitos de cada visto, com base nas regras oficiais do USCIS e do Departamento de Estado dos EUA. Não é garantia de aprovação: a decisão é sempre do governo americano, após a análise dos documentos e da entrevista.
              </p>

              <div className="flex justify-between gap-3 mt-6 flex-wrap">
                <Link
                  to="/"
                  className="bg-[#c8102e] hover:bg-[#a80d26] text-white font-bold text-base rounded-full px-6 py-3.5 text-center transition-colors"
                >
                  Voltar para o site VisareBR
                </Link>
                <button
                  type="button"
                  onClick={handleRedo}
                  className="bg-transparent text-[#0b0f57] border-[1.5px] border-[#e3e5f2] hover:border-[#0b0f57] font-bold text-base rounded-full px-6 py-3.5 transition-colors cursor-pointer"
                >
                  Refazer avaliação
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Modal Details for Selected Visa */}
      {selectedVisa && (() => {
        const info = INFO[selectedVisa.id] || { tipo: '', about: selectedVisa.desc, para: [] };
        const [cls, labelTxt] = level(selectedVisa.s);
        const barColor = cls === 'alta' ? 'bg-[#1f8a55]' : cls === 'media' ? 'bg-[#b7791f]' : 'bg-[#8a8fb0]';
        const chipStyle =
          cls === 'alta'
            ? 'bg-[#e5f5ec] text-[#1f8a55]'
            : cls === 'media'
            ? 'bg-[#fbf1e1] text-[#b7791f]'
            : 'bg-[#eef0f6] text-[#565b80]';

        return (
          <div
            className="fixed inset-0 z-50 bg-[#0b0f57]/60 flex items-center justify-center p-3"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedVisaId(null);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Detalhes do visto"
              className="bg-white text-[#141738] rounded-3xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setSelectedVisaId(null)}
                className="sticky top-3 float-right mr-3 mt-3 w-9 h-9 rounded-full bg-white/90 text-[#0b0f57] text-lg font-bold grid place-items-center cursor-pointer z-10 shadow"
              >
                ✕
              </button>

              <div className="bg-[#0b0f57] text-white px-6 pt-7 pb-5">
                <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#c9cdf2]">
                  {info.tipo}
                </span>
                <h3 className="font-extrabold text-2xl leading-tight mt-1.5 mb-2.5">{selectedVisa.name}</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-black text-4xl leading-none">{selectedVisa.s}%</span>
                  <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${chipStyle}`}>
                    {labelTxt} com o seu perfil
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/20 mt-3 overflow-hidden">
                  <span className={`block h-full rounded-full ${barColor}`} style={{ width: `${selectedVisa.s}%` }} />
                </div>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <h4 className="font-extrabold text-xs tracking-widest uppercase text-[#c8102e] mb-1.5">
                    O que é este visto
                  </h4>
                  <p className="text-[15.5px] leading-relaxed">{info.about}</p>
                </div>

                {info.para && info.para.length > 0 && (
                  <div>
                    <h4 className="font-extrabold text-xs tracking-widest uppercase text-[#c8102e] mb-1.5">
                      Para quem é
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-[15px]">
                      {info.para.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-extrabold text-xs tracking-widest uppercase text-[#c8102e] mb-1.5">
                    Requisitos e o que você já tem
                  </h4>
                  <ChecklistBlock list={CHK(selectedVisa.id, ans)} />
                </div>

                {REQ[selectedVisa.id] && (
                  <div>
                    <h4 className="font-extrabold text-xs tracking-widest uppercase text-[#c8102e] mb-1.5">
                      Etapas do processo
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-[15px]">
                      {REQ[selectedVisa.id].map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2">
                  <a
                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                      `Olá, VisareBR! Sou ${lead.nome}. Fiz a avaliação e quero saber mais sobre o ${selectedVisa.name} (${selectedVisa.s}% de compatibilidade).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#1f8a55] hover:bg-[#197346] text-white font-bold text-base rounded-full py-3.5 px-6 flex items-center justify-center transition-colors"
                  >
                    Quero saber mais sobre este visto
                  </a>
                </div>

                <p className="text-xs text-[#5b5f86] leading-relaxed">
                  Informações baseadas nos critérios oficiais do USCIS e do Departamento de Estado dos EUA. A decisão final é sempre do governo americano.
                </p>
              </div>

              <div className="sticky bottom-0 bg-white px-6 py-3.5 border-t border-[#e3e5f2]">
                <button
                  type="button"
                  onClick={() => setSelectedVisaId(null)}
                  className="w-full bg-transparent text-[#0b0f57] border-[1.5px] border-[#e3e5f2] hover:border-[#0b0f57] font-bold text-base rounded-full py-3 transition-colors cursor-pointer"
                >
                  Voltar ao resultado
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

