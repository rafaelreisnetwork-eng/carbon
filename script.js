const GROQ_KEY='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';
const EF={eletricidade:0.0843,diesel:2.676,gas_natural:2.04,glp:1.50,biomassa:0.20};
const BENCH={
  'Alimentícia e Bebidas':{avg:780,src:'EPE BEN 2022'},
  'Têxtil e Vestuário':{avg:420,src:'EPE BEN 2022'},
  'Metalúrgica e Siderúrgica':{avg:3800,src:'SEEG 2022'},
  'Química e Petroquímica':{avg:2900,src:'SEEG 2022'},
  'Papel e Celulose':{avg:2100,src:'EPE BEN 2022'},
  'Plásticos e Borracha':{avg:620,src:'EPE BEN 2022'},
  'Cerâmica e Vidro':{avg:1050,src:'SEEG 2022'},
  'Madeira e Móveis':{avg:340,src:'EPE BEN 2022'},
  'Automobilística':{avg:2400,src:'SEEG 2022'},
  'Outros':{avg:580,src:'EPE BEN 2022'},
};

// Sector-specific equivalences
function fmtEq(v){
  if(v>=1e6) return (v/1e6).toFixed(1).replace('.',',')+' mi';
  if(v>=1e4) return Math.round(v/1000).toLocaleString('pt-BR')+' mil';
  return Math.round(v).toLocaleString('pt-BR');
}
const EQUIV={
  default:[
    {ico:'i-plane',     f:v=>fmtEq(v/1.8),    lbl:'voos São Paulo → Nova York (ida e volta por passageiro)'},
    {ico:'i-car',       f:v=>fmtEq(v/2.0),    lbl:'carros rodando durante um ano inteiro'},
    {ico:'i-tree',      f:v=>fmtEq(v/0.022),  lbl:'árvores plantadas para compensar as emissões em 1 ano'},
  ],
  'Alimentícia e Bebidas':[
    {ico:'i-snowflake', f:v=>fmtEq(v*34),     lbl:'geladeiras domésticas ligadas durante um ano inteiro'},
    {ico:'i-truck',     f:v=>fmtEq(v/14),     lbl:'caminhões frigoríficos rodando por um ano'},
    {ico:'i-flame',     f:v=>fmtEq(v*10),     lbl:'horas de caldeira industrial a gás em operação'},
  ],
  'Metalúrgica e Siderúrgica':[
    {ico:'i-flame',     f:v=>fmtEq(v*10),     lbl:'horas de forno industrial em alta temperatura'},
    {ico:'i-factory',   f:v=>fmtEq(v/1.8),   lbl:'toneladas de aço com emissão de processo equivalente'},
    {ico:'i-tree',      f:v=>fmtEq(v/0.022),  lbl:'árvores necessárias para compensar em 1 ano'},
  ],
  'Têxtil e Vestuário':[
    {ico:'i-shirt',     f:v=>fmtEq(v*2000),   lbl:'camisetas tingidas (energia de tingimento equivalente)'},
    {ico:'i-drop',      f:v=>fmtEq(v*2370),   lbl:'ciclos de lavagem industrial realizados'},
    {ico:'i-flame',     f:v=>fmtEq(v*10),     lbl:'horas de secador de tecidos a gás em operação'},
  ],
  'Química e Petroquímica':[
    {ico:'i-beaker',    f:v=>fmtEq(v*10),     lbl:'horas de reator ou coluna de destilação em operação'},
    {ico:'i-flame',     f:v=>fmtEq(v*2.5),    lbl:'barris de petróleo equivalente em energia consumida'},
    {ico:'i-tree',      f:v=>fmtEq(v/0.022),  lbl:'árvores necessárias para compensar em 1 ano'},
  ],
  'Papel e Celulose':[
    {ico:'i-package',   f:v=>fmtEq(v*114),    lbl:'resmas de papel A4 (emissão equivalente de produção)'},
    {ico:'i-flame',     f:v=>fmtEq(v*10),     lbl:'horas de caldeira de vapor de processo em operação'},
    {ico:'i-tree',      f:v=>fmtEq(v/0.022),  lbl:'árvores necessárias para compensar em 1 ano'},
  ],
  'Plásticos e Borracha':[
    {ico:'i-package',   f:v=>fmtEq(v*2222),   lbl:'garrafas PET (emissão equivalente de produção)'},
    {ico:'i-flame',     f:v=>fmtEq(v*10),     lbl:'horas de injetora ou extrusora em operação'},
    {ico:'i-car',       f:v=>fmtEq(v/2.0),    lbl:'carros rodando um ano (referência de escala)'},
  ],
  'Cerâmica e Vidro':[
    {ico:'i-brick',     f:v=>fmtEq(v*4000),   lbl:'tijolos cerâmicos queimados (emissão equivalente)'},
    {ico:'i-flame',     f:v=>fmtEq(v*10),     lbl:'horas de forno túnel ou intermitente em operação'},
    {ico:'i-tree',      f:v=>fmtEq(v/0.022),  lbl:'árvores necessárias para compensar em 1 ano'},
  ],
  'Madeira e Móveis':[
    {ico:'i-tree',      f:v=>fmtEq(v*3550),   lbl:'tábuas de madeira secadas em estufa industrial'},
    {ico:'i-flame',     f:v=>fmtEq(v*10),     lbl:'horas de estufa de secagem de madeira em operação'},
    {ico:'i-package',   f:v=>fmtEq(v*114),    lbl:'painéis de madeira processados (referência)'},
  ],
  'Automobilística':[
    {ico:'i-car',       f:v=>fmtEq(v/0.5),    lbl:'carros montados com emissão de processo equivalente'},
    {ico:'i-flame',     f:v=>fmtEq(v*10),     lbl:'horas de cabine de pintura em operação'},
    {ico:'i-factory',   f:v=>fmtEq(v*1000),   lbl:'peças metálicas estampadas e processadas'},
  ],
};

// Sector-specific context for the AI — makes responses concrete and different per segment
const SECTOR_CTX={
  'Alimentícia e Bebidas':`Principais consumos energéticos no setor: refrigeração industrial (30-40% do consumo elétrico), geração de vapor para pasteurização e cozimento (20-30%), motores e bombas (15-20%), ar comprimido (10-15%), iluminação.
Tecnologias e oportunidades típicas: chillers de alta eficiência com economizador, variadores de frequência (VFDs) em compressores de refrigeração e bombas centrífugas, sistemas de recuperação de calor em pasteurizadores e autoclaves, retorno de condensado em sistemas a vapor, manutenção de purgadores de vapor, isolamento térmico de tubulações frias e quentes, sistema de gestão de energia ISO 50001, bancos de capacitores para correção do fator de potência, iluminação LED com sensores de presença em câmaras frias.
Se a empresa usa diesel ou gás para geração de vapor: avaliar eficiência da caldeira (rendimento típico 75-85%, potencial para 90%+ com economizadores), e verificar temperatura dos gases de saída.`,
  'Têxtil e Vestuário':`Principais consumos: tinturaria e lavanderia (30-45%), secagem e acabamento (25-35%), ar comprimido (12-18%), motores de teares e máquinas de costura (15-20%), iluminação e HVAC.
Tecnologias e oportunidades típicas: recuperação de calor de banhos de tingimento (redução de 20-30% no consumo de vapor), VFDs em ventiladores de secadores e teares, controle automático de temperatura em jigger e jet dyeing machines, reúso de água quente dos banhos de enxágue, substituição de resistências elétricas por sistemas a gás natural de alta eficiência (se o custo do kWh for alto), manutenção preditiva de motores (identificar motores subdimensionados ou superdimensionados), correção do fator de potência, revisão do contrato de energia (demanda contratada vs demanda real).`,
  'Metalúrgica e Siderúrgica':`Principais consumos: fornos de fundição, forjamento e tratamento térmico (45-65%), motores elétricos e bombas hidráulicas (15-20%), ar comprimido (8-12%), iluminação industrial.
Tecnologias e oportunidades típicas: recuperadores de calor (regeneradores/recuperadores) nos fornos — recuperação de 15-30% do calor dos gases de exaustão; queimadores de alta eficiência com controle de relação ar/gás; curvas de aquecimento otimizadas com controle PLC nos fornos; VFDs em ventiladores de exaustão e bombas de circulação; gestão de carga (evitar demanda de pico); troca de óleos hidráulicos por fluidos sintéticos de alta eficiência; auditoria de ar comprimido (vazamentos respondem por 20-30% do consumo em média); substituição de fornos antigos por modelos a indução elétrica (para ligas especiais).`,
  'Química e Petroquímica':`Principais consumos: aquecimento de processos via vapor e fluidos térmicos (35-50%), bombas e compressores (20-30%), torres de resfriamento e chillers (15-20%), iluminação e HVAC.
Tecnologias e oportunidades típicas: análise de integração energética (Pinch Analysis) para aproveitamento máximo do calor interno dos processos; otimização de sistemas de vapor — purgas, isolamento, retorno de condensado, manutenção de purgadores (perdas típicas de 15-25%); VFDs em bombas centrífugas e compressores de processo (economia de 20-40% em carga parcial); sistemas de cogeração (aproveitamento do calor residual para geração elétrica); monitoramento em tempo real do consumo por unidade de produção (indicador de intensidade energética); revisão dos setpoints de temperatura nos reatores e trocadores de calor.`,
  'Papel e Celulose':`Principais consumos: secagem (30-45%), sistemas de vapor (25-35%), motores e formadores (20-25%), iluminação e outros.
Tecnologias e oportunidades típicas: recuperação de calor nos secadores de folha (cylinder dryers) via hoods fechados de alta eficiência; cogeração com caldeira de recuperação de licor negro (se processo kraft); VFDs em bombas de massa, ventiladores e refinadores; controle automático de gramatura e umidade do papel; otimização do sistema de vácuo (caixas de sucção e bombas de anel líquido são grandes consumidores); auditoria de ar comprimido; recuperação de calor do ar de saída das secções de secagem para pré-aquecer o ar de entrada; monitoramento de perdas de vapor na rede de distribuição.`,
  'Plásticos e Borracha':`Principais consumos: injetoras e extrusoras (50-65% do consumo), sistemas de resfriamento (chillers e torres, 20-25%), ar comprimido (8-12%), iluminação.
Tecnologias e oportunidades típicas: substituição de injetoras hidráulicas por injetoras totalmente elétricas ou híbridas (economia de 30-60% por máquina); VFDs nas bombas hidráulicas das injetoras convencionais (redução de 20-40%); recuperação de calor do óleo hidráulico para pré-aquecimento de material; auditoria de ar comprimido (identificar vazamentos — perdas médias de 25-35%); otimização dos setpoints de temperatura dos cilindros das extrusoras; insulated hot runner systems para redução de rejeitos e tempo de ciclo; chiller de alta eficiência com free cooling economizador; monitoramento do consumo específico por tonelada produzida.`,
  'Cerâmica e Vidro':`Principais consumos: fornos de queima e fusão (60-78% do consumo total), ar comprimido (10-15%), motores de transporte e prensas (8-12%), iluminação.
Tecnologias e oportunidades típicas: recuperadores de calor nos fornos túnel — aproveitamento dos gases de exaustão para pré-aquecer o ar de combustão (economia de 15-25% no consumo de gás); otimização das curvas de queima com controle PLC e sensores de temperatura em múltiplas zonas; manutenção do refratário (fissuras causam perda de calor); VFDs nos ventiladores de exaustão e injeção de ar; troca de queimadores convencionais por queimadores de alta velocidade e alta eficiência; avaliação da troca para gás natural (se ainda usa lenha/óleo); auditoria de ar comprimido; iluminação LED nas áreas de produção e armazéns.`,
  'Madeira e Móveis':`Principais consumos: ar comprimido (25-35%), secadores de madeira/estufas (25-30%), motores de serras, lixadeiras e tupia (20-25%), iluminação e HVAC.
Tecnologias e oportunidades típicas: auditoria e eliminação de vazamentos de ar comprimido (perdas médias de 25-35% do consumo total); VFDs nos compressores de ar (economia de 20-35%); aproveitamento da serragem e resíduos de madeira para geração de calor nas estufas de secagem (biomassa própria — pode cobrir 60-80% da demanda térmica); controle automático de temperatura e umidade nas câmaras de secagem; iluminação LED em toda a fábrica (economia típica de 50-70% na iluminação); manutenção preventiva de motores (troca por motores IE3/IE4 de alta eficiência ao final da vida útil); correção do fator de potência.`,
  'Automobilística':`Principais consumos: cabine de pintura (30-45%), prensas e solda (20-25%), ar comprimido (15-20%), HVAC da fábrica e iluminação (10-15%).
Tecnologias e oportunidades típicas: recirculação de ar nas cabines de pintura com controle de VOC (economia de 30-50% no aquecimento do ar); VFDs nos ventiladores de exaustão e suprimento da pintura; otimização da pressão no sistema de ar comprimido (cada 1 bar de redução = ~7% de economia) e auditoria de vazamentos; modernização dos chillers da cabine de pintura; sensores de presença e controle de iluminação por zona; compressores de parafuso com VFD substituindo compressores de pistão; monitoramento de energia por linha de produção (gestão por OEE energético).`,
  'Outros':`Oportunidades transversais aplicáveis à maioria dos segmentos industriais: auditoria de ar comprimido (vazamentos tipicamente representam 20-35% do consumo); variadores de frequência em motores de bombas, ventiladores e compressores (economia de 20-40% em carga variável); substituição de iluminação convencional por LED industrial (economia de 50-70%); correção do fator de potência (evita multas e reduz perdas na rede); manutenção preventiva de motores elétricos e troca por modelos de alta eficiência IE3/IE4; monitoramento e submedição de energia elétrica por setor (identifica desperdícios ocultos); gestão de demanda de ponta (evitar picos que encarecem a conta de energia).`
};

const S={emp:'',resp:'',seg:'',porte:'',kwh:0,fat:0,usaComb:false,ct:'',cq:0,area:0,aud:'',ger:'',trn:'',idade:'',desp:'',budget:'',obs:'',sectAnswers:{},res:null,ai:null,tempoDiagnostico:0,modo:'',livreSinais:null};

// Sectors that focus on energy cost savings (not CO2 credits as primary angle)
const COST_FOCUS=['Alimentícia e Bebidas','Têxtil e Vestuário','Madeira e Móveis','Plásticos e Borracha'];

// Sector-specific adaptive questions for step 2
const SECT_Q={
  'Alimentícia e Bebidas':[
    {id:'sq1',lbl:'Sistema de refrigeração industrial',opts:['Uso intensivo (câmaras frias, chillers)','Uso moderado','Não utiliza refrigeração industrial']},
    {id:'sq2',lbl:'Geração de vapor (caldeira)',opts:['Sim, caldeira a gás natural','Sim, caldeira a biomassa/lenha','Sim, caldeira elétrica','Não utiliza vapor']}
  ],
  'Têxtil e Vestuário':[
    {id:'sq1',lbl:'Processo de tingimento ou lavanderia',opts:['Sim, é o processo principal','Uso moderado','Não realiza tingimento']},
    {id:'sq2',lbl:'Sistema de secagem de tecidos',opts:['Secadora / rameira a gás','Secadora elétrica','Ar ambiente / sem secagem forçada']}
  ],
  'Metalúrgica e Siderúrgica':[
    {id:'sq1',lbl:'Tipo de forno predominante',opts:['Forno a gás natural','Forno elétrico de indução','Forno de resistência elétrica','Forno a óleo combustível']},
    {id:'sq2',lbl:'Horas de operação dos fornos por dia',opts:['Até 8h por dia','8 a 16h por dia','Mais de 16h (quase contínuo)']}
  ],
  'Química e Petroquímica':[
    {id:'sq1',lbl:'Regime de operação do processo',opts:['Processo contínuo (24h/dia)','Processo em batelada (por lotes)','Misto']},
    {id:'sq2',lbl:'Sistema de resfriamento de processo',opts:['Torre de resfriamento','Chiller industrial','Água da rede ou rio','Não utiliza resfriamento']}
  ],
  'Papel e Celulose':[
    {id:'sq1',lbl:'Tipo de processo produtivo',opts:['Celulose kraft (branqueada)','Papel a partir de reciclados','Papel mecânico']},
    {id:'sq2',lbl:'Possui cogeração de energia?',opts:['Sim, turbina a vapor','Sim, outro sistema','Não possui cogeração']}
  ],
  'Plásticos e Borracha':[
    {id:'sq1',lbl:'Processo de transformação predominante',opts:['Injeção (injetoras)','Extrusão (extrusoras)','Sopro','Misto']},
    {id:'sq2',lbl:'Tipo de máquinas de injeção',opts:['Hidráulicas (maioria)','Elétricas ou híbridas (maioria)','Misto','Não utiliza injetoras']}
  ],
  'Cerâmica e Vidro':[
    {id:'sq1',lbl:'Tipo de forno de queima',opts:['Forno túnel a gás natural','Forno intermitente a gás','Forno elétrico','Forno a lenha / biomassa']},
    {id:'sq2',lbl:'Faixa de temperatura de queima',opts:['Até 900°C (cerâmica vermelha)','900–1200°C (porcelanato, grês)','Acima de 1200°C (refratário, vidro)']}
  ],
  'Madeira e Móveis':[
    {id:'sq1',lbl:'Possui estufa de secagem de madeira?',opts:['Sim, a gás natural','Sim, a biomassa / lenha','Sim, elétrica','Não possui estufa']},
    {id:'sq2',lbl:'Volume de resíduos de madeira gerados',opts:['Alto (serraria, laminação)','Moderado (marcenaria, móveis)','Baixo']}
  ],
  'Automobilística':[
    {id:'sq1',lbl:'Possui cabine ou linha de pintura?',opts:['Sim, linha completa de pintura','Sim, pintura parcial','Não possui pintura']},
    {id:'sq2',lbl:'Equipamentos de processo pesado',opts:['Prensas hidráulicas','Prensas mecânicas','Robôs de solda e montagem','Não se aplica']}
  ],
  'Outros':[]
};

// LIVE COUNTER
(function(){
  const rate=500_000_000/(365*24*3600);
  function tick(){const now=new Date(),mn=new Date(now);mn.setHours(0,0,0,0);const el=document.getElementById('live-n');if(el)el.textContent=Math.floor((now-mn)/1000*rate).toLocaleString('pt-BR');}
  tick();setInterval(tick,1000);
})();

// ── CRONÔMETRO DO DIAGNÓSTICO RÁPIDO ──────────────────────────
let ftInterval=null, ftStart=null, ftElapsedMs=0;
// Mostradores do cronômetro: formulário guiado e Modo Livre
const FT_DISPLAYS=['form-timer-txt','livre-timer-txt'];
function formatarTempo(ms){
  const s=Math.max(0,Math.floor(ms/1000));
  const mm=String(Math.floor(s/60)).padStart(2,'0');
  const ss=String(s%60).padStart(2,'0');
  return mm+':'+ss;
}
function pintarCronometro(ms){
  const t=formatarTempo(ms);
  FT_DISPLAYS.forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=t;});
}
function iniciarCronometro(){
  if(ftInterval)return; // já rodando
  ftStart=Date.now()-ftElapsedMs;
  pintarCronometro(ftElapsedMs);
  ftInterval=setInterval(()=>{
    ftElapsedMs=Date.now()-ftStart;
    pintarCronometro(ftElapsedMs);
  },1000);
}
function pararCronometro(){
  if(ftInterval){
    ftElapsedMs=Date.now()-ftStart;   // fecha no instante exato, não no último tick
    clearInterval(ftInterval);ftInterval=null;
    pintarCronometro(ftElapsedMs);
  }
  return ftElapsedMs;
}
function resetarCronometro(){
  pararCronometro();
  ftElapsedMs=0;ftStart=null;
  pintarCronometro(0);
}

function showPg(id){
  document.querySelectorAll('.pg').forEach(p=>{p.classList.remove('on');p.style.display='none';});
  const el=document.getElementById('pg-'+id);
  el.style.display='';
  el.classList.add('on');
  document.documentElement.scrollTop=0;
  document.body.scrollTop=0;
  const tb=document.querySelector('.topbar');
  if(tb){id==='hero'?tb.classList.remove('not-hero'):tb.classList.add('not-hero');tb.dataset.pg=id;}
}

// ── QUALIDADE DO DIAGNÓSTICO ──────────────────────────────────
// Mede a COMPLETUDE dos dados fornecidos (não é "acurácia" do cálculo).
// Cada campo tem um peso; o que o usuário não respondeu simplesmente não pontua.
// Não existe piso artificial: o mínimo obrigatório fica na faixa dos 45-50%.
const Q_PESOS={
  // obrigatórios do fluxo guiado — somam 44
  seg:8, porte:6, kwh:14, aud:6, ger:5, trn:5,
  // opcionais — somam 56 (é aqui que a barra realmente sobe)
  fat:12, sect:8, area:7, idade:7, desp:7, budget:6, comb:5, obs:4
};
const Q_ROTULOS={
  seg:'segmento', porte:'porte da empresa', kwh:'consumo elétrico mensal',
  aud:'histórico de auditoria', ger:'geração própria', trn:'turnos de funcionamento',
  fat:'valor da conta de energia', sect:'perguntas do seu segmento', area:'área da fábrica',
  idade:'idade dos equipamentos', desp:'onde há mais desperdício',
  budget:'orçamento disponível', comb:'consumo de combustível',
  obs:'informações adicionais'
};

// Modo Guia — pontua campo a campo
function qualidadeGuiada(){
  const qs=SECT_Q[S.seg]||[];
  const respondidas=Object.keys(S.sectAnswers||{}).length;
  const fracSect=qs.length?Math.min(respondidas/qs.length,1):1; // segmento sem perguntas não é penalizado

  const preenchido={
    seg   : !!S.seg,
    porte : !!S.porte,
    kwh   : Number(S.kwh)>0,
    aud   : !!S.aud,
    ger   : !!S.ger,
    trn   : !!S.trn,
    fat   : Number(S.fat)>0,
    area  : Number(S.area)>0,
    idade : !!S.idade,
    desp  : !!S.desp,
    budget: !!S.budget,
    // quem não usa combustível não é penalizado; quem usa só pontua se informar tipo e quantidade
    comb  : S.usaComb ? (!!S.ct && Number(S.cq)>0) : true,
    obs   : !!(S.obs && S.obs.trim().length>=25)
  };

  let pct=0; const faltando=[];
  Object.keys(Q_PESOS).forEach(k=>{
    if(k==='sect'){
      pct+=Q_PESOS.sect*fracSect;
      if(fracSect<1) faltando.push(Q_ROTULOS.sect);
      return;
    }
    if(preenchido[k]) pct+=Q_PESOS[k];
    else faltando.push(Q_ROTULOS[k]);
  });
  return{pct:Math.max(0,Math.min(100,Math.round(pct))),faltando:faltando};
}

// Modo Livre — pontua o que o TEXTO do usuário permitiu extrair.
// Teto de 85%: texto livre sempre tem menos dado verificável que o formulário.
const QL_PESOS={texto:10,seg:12,kwh:16,conta:10,comb:8,equip:8,idade:6,orcamento:6,meta:5,area:4,turnos:4};
const QL_ROTULOS={
  texto:'uma descrição mais detalhada', seg:'o segmento da indústria',
  kwh:'o consumo em kWh', conta:'o valor da conta de energia',
  comb:'o combustível utilizado', equip:'os equipamentos do processo',
  idade:'a idade dos equipamentos', orcamento:'o orçamento disponível',
  meta:'a meta de redução', area:'a área da fábrica', turnos:'os turnos de operação'
};
// Lê o texto livre e marca quais informações realmente apareceram
function extrairSinaisLivre(txt,metrics){
  const t=String(txt||'').toLowerCase();
  const temNum=/\d/.test(t);
  return{
    texto    : t.length>=140,
    seg      : !!(metrics && metrics.seg && metrics.seg!=='Outros'),
    kwh      : /\d[\d.,]*\s*(kwh|kw\/h|mwh|megawatt|quilowatt)/.test(t),
    conta    : temNum && /(r\$|reais)\s*[\d.,]+|conta de (energia|luz)|fatura de energia|gasto com energia/.test(t),
    comb     : /(diesel|g[áa]s natural|glp|biomassa|lenha|cavaco|baga[çc]o|[óo]leo combust[íi]vel)/.test(t),
    equip    : /(caldeira|forno|compressor|chiller|c[âa]mara fria|refrigera|motor|bomba|inje[çc]|extrus|secador|estufa|prensa|torre de resfriamento|ilumina|ar comprimido|vapor)/.test(t),
    idade    : /\d+\s*anos|antig|obsolet|velh|d[ée]cada/.test(t),
    orcamento: temNum && /(or[çc]amento|investir|investimento|capital dispon|tenho r\$|disponho)/.test(t),
    meta     : /(meta|objetivo|reduzir|redu[çc][ãa]o|neutralizar|net zero|iso 50001)/.test(t),
    area     : /\d[\d.,]*\s*(m²|m2|metros quadrados)/.test(t),
    turnos   : /(turno|24h|24 horas|opera[çc][ãa]o cont[íi]nua|ininterrupt)/.test(t)
  };
}
function qualidadeLivre(){
  const d=S.livreSinais||{};
  let pct=0; const faltando=[];
  Object.keys(QL_PESOS).forEach(k=>{
    if(d[k]) pct+=QL_PESOS[k];
    else faltando.push(QL_ROTULOS[k]);
  });
  return{pct:Math.max(8,Math.min(85,Math.round(pct))),faltando:faltando};
}

// Ponto único de leitura — devolve pontuação + o que ficou faltando
function detalheQualidade(){
  return S.modo==='livre' ? qualidadeLivre() : qualidadeGuiada();
}
function calcularQualidade(){return detalheQualidade().pct;}

function atualizarQualidade(){
  const panel=document.getElementById('quality-panel');
  if(!panel)return;
  const det=detalheQualidade();
  const pct=det.pct;
  const fill=document.getElementById('q-fill');
  const badge=document.getElementById('q-badge');
  const msg=document.getElementById('q-msg');
  const btn=document.getElementById('q-btn');
  const pctEl=document.getElementById('q-pct');

  // Nível
  let lvl,badgeTxt,msgTxt;
  if(pct<70){lvl='lvl1';badgeTxt='Pré-diagnóstico inicial';msgTxt='Quanto mais informações você fornecer, mais preciso será o pré-diagnóstico.';}
  else if(pct<90){lvl='lvl2';badgeTxt='Diagnóstico mais completo';msgTxt='Agora temos mais informações para identificar oportunidades de economia.';}
  else{lvl='lvl3';badgeTxt='Análise detalhada';msgTxt='Excelente — o pré-diagnóstico está bem embasado nos dados que você forneceu.';}

  // Lista o que ainda falta — deixa explícito por que não está em 100%
  if(det.faltando && det.faltando.length && pct<90){
    const l=det.faltando.slice(0,3).join(', ');
    msgTxt+=(S.modo==='livre'?' Não identificamos no seu texto: ':' Ainda faltam: ')+l+
            (det.faltando.length>3?' e mais '+(det.faltando.length-3)+' item(ns)':'')+'.';
  }

  pctEl.textContent=pct+'%';
  fill.className='quality-fill '+lvl;
  fill.style.width='0%';
  setTimeout(()=>{fill.style.width=pct+'%';},200);
  badge.className='quality-badge '+lvl;
  badge.textContent=badgeTxt;
  msg.textContent=msgTxt;

  // Botão some só quando o diagnóstico guiado já está praticamente completo
  if(S.modo!=='livre' && pct>=90) btn.classList.add('hidden');
  else btn.classList.remove('hidden');
  btn.lastChild.textContent=S.modo==='livre'?' Preencher o formulário guiado':' Adicionar mais dados';
}

// Volta ao formulário para completar dados (Modo Guia)
function adicionarDados(){
  // Se veio do Modo Livre, direciona para o formulário guiado
  if(S.modo==='livre' || S.emp==='Modo Livre'){
    alert('Para adicionar mais dados com precisão, preencha o formulário guiado. Suas informações serão calculadas passo a passo.');
    reiniciar();
    showPg('form');
    goStep(1);
    return;
  }
  // Repovoa os campos visíveis com o que já foi preenchido
  repovoarFormulario();
  showPg('form');
  iniciarCronometro();   // retoma a contagem de onde parou
  if(!S.fat || !(S.usaComb&&S.cq>0)) goStep(2);
  else goStep(3);
  window.scrollTo(0,0);
}

// Restaura os valores de S nos campos do formulário
function repovoarFormulario(){
  const set=(id,v)=>{const e=document.getElementById(id);if(e&&v)e.value=v;};
  set('f-emp',S.emp);set('f-resp',S.resp);
  set('f-kwh',S.kwh||'');set('f-fat',S.fat||'');
  set('f-area',S.area||'');set('f-cq',S.cq||'');
  set('f-obs',S.obs);
  // segmento (botões)
  if(S.seg){document.querySelectorAll('.seg-btn').forEach(b=>{if(b.dataset.seg===S.seg){b.classList.add('on');}});
    const cc=document.getElementById('company-card');if(cc)cc.style.display='block';
    renderSectQs();}
  // combustível
  if(S.usaComb){S.usaComb=true;const tsw=document.getElementById('tsw');if(tsw)tsw.classList.add('on');
    const cx=document.getElementById('comb-x');if(cx)cx.style.display='block';
    set('f-ct',S.ct);updU();}
  // pills (porte, aud, ger, trn, idade, desp, budget)
  const pillGroups={porte:S.porte,aud:S.aud,ger:S.ger,trn:S.trn,idade:S.idade,desp:S.desp,budget:S.budget};
  Object.entries(pillGroups).forEach(([g,val])=>{
    if(!val)return;
    document.querySelectorAll('.pill[data-g="'+g+'"]').forEach(p=>{if(p.dataset.v===val)p.classList.add('on');});
  });
  // perguntas setoriais
  Object.entries(S.sectAnswers||{}).forEach(([lbl,val])=>{
    document.querySelectorAll('.pill').forEach(p=>{if(p.dataset.v===val)p.classList.add('on');});
  });
}

function reiniciar(){
  Object.assign(S,{emp:'',resp:'',seg:'',porte:'',kwh:0,fat:0,usaComb:false,ct:'',cq:0,area:0,aud:'',ger:'',trn:'',res:null,ai:null,tempoDiagnostico:0,modo:'',livreSinais:null});
  resetarCronometro();
  ['f-emp','f-resp','f-kwh','f-fat','f-area','f-cq','f-obs','f-livre'].forEach(i=>{const e=document.getElementById(i);if(e)e.value='';});
  const chip=document.getElementById('r-chip');
  if(chip)chip.innerHTML='<svg class="ico" width="11" height="11"><use href="#i-check"/></svg> Plano concluído';
  const tmp=document.getElementById('r-tempo');if(tmp)tmp.textContent='—';
  const tmpl=document.getElementById('r-tempo-lbl');if(tmpl)tmpl.textContent='tempo até o resultado';
  document.getElementById('f-ct').value='';
  document.querySelectorAll('.pill').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('on'));
  document.getElementById('company-card').style.display='none';
  document.getElementById('sect-qs').innerHTML='';
  S.seg='';S.usaComb=false;S.budget='';S.obs='';S.idade='';S.desp='';S.sectAnswers={};document.getElementById('tsw').classList.remove('on');document.getElementById('comb-x').style.display='none';
  goStep(1);showPg('hero');
}

function goStep(n){
  document.querySelectorAll('.fstep').forEach(s=>s.classList.remove('on'));
  document.getElementById('fs'+n).classList.add('on');
  for(let i=1;i<=3;i++){
    const d=document.getElementById('pd'+i),l=document.getElementById('pl'+i);
    d.className='prog-dot';l.className='prog-lbl';
    if(i<n){d.classList.add('done');d.innerHTML='<svg class="ico" width="12" height="12"><use href="#i-check"/></svg>';}
    else if(i===n){d.classList.add('cur');d.textContent=i;l.classList.add('cur');}
    else{d.textContent=i;}
  }
  document.getElementById('pbar').style.width=((n-1)/2*100)+'%';
}

function next(from){
  if(from===1){
    S.emp=document.getElementById('f-emp').value.trim();
    S.resp=document.getElementById('f-resp').value.trim();
    // S.seg and S.porte collected via selSeg() and pill()
    if(!S.seg){alert('Selecione o segmento industrial.');return;}
    if(!S.emp){alert('Informe o nome da empresa.');return;}
    if(!S.porte){alert('Selecione o porte da empresa.');return;}
    document.getElementById('li3-seg').textContent=S.seg;
    renderSectQs();
    showPg('form');goStep(2);
  }else if(from===2){
    S.kwh=parseFloat(document.getElementById('f-kwh').value)||0;S.fat=parseFloat(document.getElementById('f-fat').value)||0;
    if(S.kwh<=0){alert('Informe o consumo elétrico mensal em kWh.');return;}
    if(S.usaComb){S.ct=document.getElementById('f-ct').value;S.cq=parseFloat(document.getElementById('f-cq').value)||0;if(!S.ct){alert('Selecione o tipo de combustível.');return;}}
    goStep(3);
  }
}
function prev(from){goStep(from-1);}
function togComb(){S.usaComb=!S.usaComb;document.getElementById('tsw').classList.toggle('on',S.usaComb);document.getElementById('comb-x').style.display=S.usaComb?'block':'none';}
function updU(){const u={diesel:'L/mês',gas_natural:'m³/mês',glp:'L/mês',biomassa:'kg/mês'};document.getElementById('f-cu').textContent=u[document.getElementById('f-ct').value]||'un/mês';}
function pill(el){const g=el.dataset.g;document.querySelectorAll('.pill[data-g="'+g+'"]').forEach(p=>p.classList.remove('on'));el.classList.add('on');S[g]=el.dataset.v;}

function selSeg(el){
  document.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  S.seg=el.dataset.seg;
  // Reveal company fields
  const cc=document.getElementById('company-card');
  cc.style.display='block';
  cc.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function renderSectQs(){
  const qs=SECT_Q[S.seg]||[];
  const wrap=document.getElementById('sect-qs');
  if(!qs.length){wrap.innerHTML='';return;}
  wrap.innerHTML='<div class="card" style="margin-top:4px"><div class="card-eye">Perguntas específicas — '+S.seg+'</div><div class="card-head" style="font-size:1rem;margin-bottom:16px">Mais algumas informações do seu processo</div>'+
    qs.map(q=>`<div class="field"><label class="flabel" style="margin-bottom:8px">${q.lbl}</label><div class="pills" id="${q.id}">${q.opts.map(o=>`<div class="pill" data-g="${q.id}" data-v="${o}" onclick="pill(this)">${o}</div>`).join('')}</div></div>`).join('')+
  '</div>';
}
function togMethod(){const b=document.getElementById('meth-body'),c=document.getElementById('meth-chev');const open=b.classList.toggle('open');c.innerHTML=open?'<use href="#i-chev-u"/>':'<use href="#i-chev-d"/>';}

function calcular(){
  const co2El=S.kwh*EF.eletricidade;
  let co2Cb=0;if(S.usaComb&&S.cq>0&&S.ct)co2Cb=S.cq*(EF[S.ct]||0);
  const co2MesKg=co2El+co2Cb,co2Ano=(co2MesKg*12)/1000;
  const potEE=S.aud==='nao'?0.22:S.aud==='plan'?0.18:0.11;
  const potRen=S.ger==='nao'?0.17:0.07,potProc=0.10;
  const tarifa=S.fat>0&&S.kwh>0?S.fat/S.kwh:0.72;
  // Economia: eletricidade + combustível economizado
  const econEl=S.kwh*12*potEE*tarifa;
  const precoComb={diesel:5.80,gas_natural:3.50,glp:6.50,biomassa:0.40}[S.ct]||0;
  const econComb=(S.usaComb&&S.cq>0)?S.cq*12*potProc*precoComb:0;
  const econReais=econEl+econComb;
  const co2Red=co2Ano*(potEE+potProc),vlCred=co2Red*75;
  const bench=BENCH[S.seg]||{avg:580,src:'EPE BEN 2022'};
  return{co2Ano,co2MesTon:co2MesKg/1000,potEE,potRen,potProc,econReais,co2Red,vlCred,tarifa,bench};
}

function animLoad(){
  let i=0;const seq=[700,700,100];
  function tick(){
    if(i>0){document.getElementById('ls'+i).className='li ok';document.getElementById('li'+i).innerHTML='<svg class="ico" width="11" height="11"><use href="#i-check"/></svg>';}
    i++;
    if(i<=4){document.getElementById('ls'+i).className='li run';document.getElementById('li'+i).innerHTML='<svg class="ico" width="11" height="11"><use href="#i-zap"/></svg>';if(i<4)setTimeout(tick,seq[i-1]);}
  }
  tick();
}

// ══════════ PLANO LOCAL (sem IA) ══════════
// Usado quando o servidor de IA não responde (rede bloqueada, sem internet, limite da chave...).
// Gera o MESMO formato de texto que a IA devolveria, então a tela de resultado e o PDF funcionam igual.
function planoLocal(res){
  const kwh=S.kwh||0, tar=res.tarifa||0.72;
  const n=(v,d=1)=>v.toLocaleString('pt-BR',{maximumFractionDigits:d});
  const rs=v=>'R$ '+(Math.round(v/1000)*1000).toLocaleString('pt-BR');
  const precoComb={diesel:5.80,gas_natural:3.50,glp:6.50,biomassa:0.40}[S.ct]||0;
  const gastoComb=(S.usaComb&&S.cq>0)?S.cq*12*precoComb:0;
  const tCO2=(k)=>k*12*(EF.eletricidade||0.0843)/1000;   // kWh/mês poupados -> tCO₂/ano
  const seg=S.seg||'Outros';
  const nomeComb=({gas_natural:'gás natural',glp:'GLP',diesel:'diesel',biomassa:'biomassa'})[S.ct]||String(S.ct);
  const A=[];
  const add=(o)=>{
    o.invMin=Math.max(o.invMin,o.piso||0);o.invMax=Math.max(o.invMax,o.invMin*1.5);
    o.pbMin=Math.max(3,Math.round(o.invMin/o.econ*12));o.pbMax=Math.max(o.pbMin+3,Math.round(o.invMax/o.econ*12));
    A.push(o);
  };
  const ele=(pct)=>kwh*12*pct*tar;   // economia anual (R$) por % do consumo elétrico
  add({id:'ilum',piso:6000,invMin:kwh*0.25,invMax:kwh*0.45,econ:Math.max(ele(0.05),1),
    titulo:'Retrofit de iluminação para LED com sensores de presença e aproveitamento de luz natural',
    descricao:`Trocar lâmpadas de descarga e fluorescentes por luminárias LED industriais e instalar sensores de presença e dimerização nas áreas de menor ocupação do segmento ${seg}. É uma medida de baixo risco e fácil de executar; costuma reduzir de 40% a 60% o consumo da iluminação.`,
    impacto:`≈ 5% de redução no consumo elétrico (≈ ${n(kwh*0.05,0)} kWh/mês · ${n(tCO2(kwh*0.05))} tCO₂/ano evitadas)`});
  add({id:'vfd',piso:20000,invMin:kwh*0.7,invMax:kwh*1.2,econ:Math.max(ele(0.08),1),
    titulo:'Variadores de frequência (VFDs) em motores, ventiladores e bombas de maior potência',
    descricao:`Instalar VFDs nos motores de maior carga e funcionamento variável (ventilação, bombas e esteiras) do segmento ${seg}, ajustando a rotação à demanda real. Em cargas centrífugas, reduzir 20% da rotação corta cerca de 50% da potência consumida.`,
    impacto:`≈ 8% de redução no consumo elétrico (≈ ${n(kwh*0.08,0)} kWh/mês · ${n(tCO2(kwh*0.08))} tCO₂/ano evitadas)`});
  add({id:'ar',piso:8000,invMin:kwh*0.3,invMax:kwh*0.6,econ:Math.max(ele(0.04),1),
    titulo:'Programa de ar comprimido: caça-vazamentos, redução de pressão e sequenciamento dos compressores',
    descricao:`Mapear e eliminar vazamentos (podem consumir de 20% a 30% do ar gerado), reduzir a pressão de operação ao mínimo necessário e instalar controle de sequenciamento entre compressores. Cada 1 bar a menos de pressão reduz cerca de 7% da energia do compressor.`,
    impacto:`≈ 4% de redução no consumo elétrico (≈ ${n(kwh*0.04,0)} kWh/mês · ${n(tCO2(kwh*0.04))} tCO₂/ano evitadas)`});
  add({id:'refr',piso:15000,invMin:kwh*0.4,invMax:kwh*0.8,econ:Math.max(ele(0.06),1),
    titulo:'Otimização da refrigeração: pressão de condensação, vedação de câmaras e manutenção de condensadores',
    descricao:`Ajustar a pressão de condensação, trocar borrachas e cortinas de vedação, limpar condensadores e revisar o degelo e o isolamento das câmaras. Em refrigeração industrial, ganhos de 5% a 10% aparecem só com operação e manutenção.`,
    impacto:`≈ 6% de redução no consumo elétrico (≈ ${n(kwh*0.06,0)} kWh/mês · ${n(tCO2(kwh*0.06))} tCO₂/ano evitadas)`});
  if(gastoComb>0){
    const e=Math.max(gastoComb*0.10,1);
    add({id:'calor',piso:30000,invMin:gastoComb*0.7,invMax:gastoComb*1.4,econ:e,
      titulo:'Isolamento térmico e recuperação de calor dos gases de exaustão (economizador / pré-aquecimento)',
      descricao:`Recuperar o calor dos gases de exaustão para pré-aquecer o ar de combustão ou a água de alimentação, reparar isolamentos e refratários danificados e regular a relação ar/combustível nos queimadores. Por ser ${nomeComb}, a economia vem direto na conta de combustível, com ganhos típicos de 8% a 12%.`,
      impacto:`≈ 10% de redução no consumo de combustível (≈ ${n(S.cq*0.10,0)} unidades/mês · ${n(S.cq*0.10*12*(EF[S.ct]||0)/1000)} tCO₂/ano evitadas)`});
  }else{
    add({id:'calor',piso:25000,invMin:kwh*0.6,invMax:kwh*1.0,econ:Math.max(ele(0.05),1),
      titulo:'Isolamento térmico de fornos, estufas e linhas de calor com recuperação de calor residual',
      descricao:`Revisar o isolamento de fornos, estufas e tubulações quentes e aproveitar o calor residual de processo para pré-aquecimento no segmento ${seg}. Reduz perdas térmicas e a carga elétrica de aquecimento.`,
      impacto:`≈ 5% de redução no consumo elétrico (≈ ${n(kwh*0.05,0)} kWh/mês · ${n(tCO2(kwh*0.05))} tCO₂/ano evitadas)`});
  }
  if(S.ger!=='sim'){
    const kwp=Math.max(5,kwh*0.2/115), gen=kwp*115;
    add({id:'solar',piso:0,invMin:kwp*4200,invMax:kwp*5200,econ:Math.max(gen*12*tar,1),
      titulo:'Usina solar fotovoltaica para cobrir parte do consumo',
      descricao:`Instalar cerca de ${n(kwp,0)} kWp de painéis fotovoltaicos (telhado ou solo) para cobrir em torno de 20% do consumo atual, com vida útil acima de 25 anos. É a opção de maior investimento, mas protege a empresa de reajustes de tarifa.`,
      impacto:`≈ ${n(gen,0)} kWh/mês gerados (≈ 20% do consumo · ${n(tCO2(gen))} tCO₂/ano evitadas)`});
  }
  if(S.aud!=='sim'){
    add({id:'aud',piso:8000,invMin:Math.max(kwh*0.08,8000),invMax:Math.max(kwh*0.2,16000),econ:Math.max(ele(0.03),1),
      titulo:'Auditoria energética com submedição por linha de produção e metas de consumo',
      descricao:`Instalar medidores por linha ou equipamento principal, levantar o perfil de carga e definir metas mensais de kWh por unidade produzida. Sem medição fica difícil achar o desperdício; este passo costuma revelar ganhos rápidos que ainda não foram vistos.`,
      impacto:`≈ 3% de redução no consumo elétrico (≈ ${n(kwh*0.03,0)} kWh/mês · ${n(tCO2(kwh*0.03))} tCO₂/ano evitadas)`});
  }
  if(/antigos/.test(S.idade||'')){
    add({id:'motor',piso:30000,invMin:kwh*0.9,invMax:kwh*1.5,econ:Math.max(ele(0.05),1),
      titulo:'Modernização de motores e equipamentos antigos para alto rendimento (IE3/IE4)',
      descricao:`Substituir os motores mais antigos e rebobinados por modelos IE3/IE4, começando pelos que operam mais de 4.000 horas por ano. Equipamentos com mais de 15 anos têm rendimento bem inferior ao atual.`,
      impacto:`≈ 5% de redução no consumo elétrico (≈ ${n(kwh*0.05,0)} kWh/mês · ${n(tCO2(kwh*0.05))} tCO₂/ano evitadas)`});
  }
  // 1ª recomendação: a do desperdício apontado pelo gestor
  const d=S.desp||'';
  const alvo=/ar comprimido/.test(d)?'ar':/motores|bombas/.test(d)?'vfd':/calor|vapor|forno/.test(d)?'calor':/refriger/.test(d)?'refr':/ilumin/.test(d)?'ilum':'';
  const byPb=(a,b)=>a.pbMin-b.pbMin;
  let ord=[...A].sort(byPb);
  const first=ord.find(a=>a.id===alvo);
  if(first) ord=[first,...ord.filter(a=>a!==first)];
  // Orçamento: só entram ações cujo investimento mínimo somado cabe no limite
  const ceil=budgetCeil(S.budget||'');
  const pick=[];let soma=0;
  for(const a of ord){
    if(pick.length>=3) break;
    if(ceil&&soma+a.invMin>ceil) continue;
    pick.push(a);soma+=a.invMin;
  }
  // Sempre 3 ações: se o orçamento não comporta todas, completa com as mais baratas restantes
  // (o aviso de orçamento da tela informa que o plano completo passa do limite).
  [...A].filter(a=>!pick.includes(a)).sort((a,b)=>a.invMin-b.invMin).forEach(a=>{if(pick.length<3)pick.push(a);});
  const rest=pick.slice(1).sort(byPb);
  const final=[pick[0],...rest];

  const benchDiff=(res.co2Ano-res.bench.avg)/res.bench.avg*100;
  const pos=benchDiff>15?`cerca de ${Math.abs(benchDiff).toFixed(0)}% acima da média estimada do setor`:benchDiff<-15?`cerca de ${Math.abs(benchDiff).toFixed(0)}% abaixo da média estimada do setor`:'próxima da média estimada do setor';
  const sit=`${S.emp||'A empresa'} consome ${n(kwh,0)} kWh/mês${S.usaComb?` e usa ${nomeComb}`:''}, o que gera cerca de ${n(res.co2Ano)} tCO₂/ano, uma posição ${pos} (${n(res.bench.avg,0)} tCO₂/ano em ${seg}). O potencial de redução energética identificado é de ${(res.potEE*100).toFixed(0)}%.\n\nEste plano foi montado pelo próprio sistema com regras-padrão para o segmento ${seg} e os dados informados, porque o servidor de IA não respondeu. Valores de investimento e retorno são estimativas de ordem de grandeza e devem ser confirmadas em visita técnica.`;
  const recs=final.map(a=>`[REC]
TITULO: ${a.titulo}
DESCRICAO: ${a.descricao}
IMPACTO: ${a.impacto}
INVESTIMENTO: ${rs(a.invMin)} – ${rs(a.invMax)}
PAYBACK: ${a.pbMin} a ${a.pbMax} meses
[/REC]`).join('\n\n');
  return `SITUAÇÃO ATUAL\n${sit}\n\n${recs}\n\nRETORNO FINANCEIRO\nRetorno agregado estimado entre ${Math.min(...final.map(a=>a.pbMin))} e ${Math.max(...final.map(a=>a.pbMax))} meses, começando pelas ações de payback mais curto.`;
}

async function gerar(){
  S.area=parseFloat(document.getElementById('f-area').value)||0;
  S.obs=document.getElementById('f-obs').value.trim();
  // Collect sector-specific answers
  S.sectAnswers={};
  (SECT_Q[S.seg]||[]).forEach(q=>{
    const sel=document.querySelector('#'+q.id+' .pill.on');
    if(sel) S.sectAnswers[q.lbl]=sel.dataset.v;
  });
  if(!S.aud){alert('Informe se já realizou auditoria energética.');return;}
  if(!S.ger){alert('Informe sobre geração própria de energia.');return;}
  if(!S.trn){alert('Selecione os turnos de funcionamento.');return;}
  S.modo='guia';
  const chipEl=document.getElementById('r-chip');if(chipEl)chipEl.innerHTML='<svg class="ico" width="11" height="11"><use href="#i-check"/></svg> Plano concluído';
  const res=calcular();S.res=res;
  showPg('load');animLoad();
  try{
    const ai=await callGroq(res);S.ai=ai;
    S.tempoDiagnostico=pararCronometro();
    document.getElementById('ls4').className='li ok';
    document.getElementById('li4').innerHTML='<svg class="ico" width="11" height="11"><use href="#i-check"/></svg>';
    await delay(500);renderRes(res,ai);
  }catch(err){
    S.tempoDiagnostico=pararCronometro();
    console.error('[CarbonTrack] IA indisponível, usando plano local:',err);
    let local=null;
    try{local=planoLocal(res);}catch(e2){console.error('[CarbonTrack] plano local falhou:',e2);}
    if(local){
      S.ai=local;
      document.getElementById('ls4').className='li ok';
      document.getElementById('li4').innerHTML='<svg class="ico" width="11" height="11"><use href="#i-check"/></svg>';
      await delay(400);renderRes(res,local);
      document.getElementById('r-chip').innerHTML='<svg class="ico" width="11" height="11"><use href="#i-warn"/></svg> Plano gerado pelo sistema (IA indisponível)';
    }else{
      S.ai=null;await delay(400);renderRes(res,null,err.message);
    }
  }
}
function delay(ms){return new Promise(r=>setTimeout(r,ms));}

function buildPrompt(res){
  const n=(v,d=1)=>v.toLocaleString('pt-BR',{maximumFractionDigits:d});
  const c=v=>'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:0});
  const ctx=SECTOR_CTX[S.seg]||SECTOR_CTX['Outros'];
  const audStr=S.aud==='sim'?'Já realizou auditoria energética — recomendações devem ir além do básico, focando em tecnologias de segunda e terceira camada.':S.aud==='nao'?'Nunca realizou auditoria energética — há alto potencial de ganhos rápidos com medidas básicas ainda não implementadas.':'Planejando realizar auditoria — recomendações devem ajudar a priorizar onde a auditoria deve focar.';
  const combStr=S.usaComb?`Além da energia elétrica, utiliza ${S.ct} (${n(S.cq,0)} unidades/mês), gerando ${n(S.cq*(EF[S.ct]||0)/1000)} tCO₂/mês adicionais.`:'Utiliza apenas energia elétrica (sem combustíveis fósseis no processo).';
  const benchDiff=((res.co2Ano-res.bench.avg)/res.bench.avg*100);
  const benchStr=benchDiff>15?`${benchDiff.toFixed(0)}% ACIMA da média do setor (${n(res.bench.avg,0)} tCO₂/ano) — situação de alerta.`:benchDiff<-15?`${Math.abs(benchDiff).toFixed(0)}% ABAIXO da média do setor — bom desempenho relativo, foco em manutenção e refinamento.`:`Na média do setor (referência: ${n(res.bench.avg,0)} tCO₂/ano) — potencial de melhora moderado.`;
  const obsStr=S.obs?`\nINFORMAÇÕES ADICIONAIS DO GESTOR (prioridade alta — ao menos uma das recomendações deve abordar diretamente o que foi mencionado abaixo):\n"${S.obs}"\n`:'';
  const budgetStr=S.budget?`\nORÇAMENTO DISPONÍVEL: ${S.budget}. Entregue SEMPRE EXATAMENTE 3 recomendações. Escolha ações de MENOR custo para que a soma dos investimentos MÍNIMOS caiba neste valor; se mesmo assim a terceira não couber, entregue-a como a opção mais barata possível (o sistema avisa o gestor automaticamente que o plano completo passa do orçamento). Nunca entregue menos de 3. PREFIRA modernizar (VFDs, isolamento, retrofit) a substituir máquinas inteiras, que raramente cabem no orçamento. Priorize o equipamento que o gestor indicou como maior problema. Ao final, confira se a soma dos investimentos mínimos cabe no orçamento; se não, troque por ações mais baratas, mas mantenha 3 recomendações.\n`:'';
  const sectStr=Object.keys(S.sectAnswers).length>0?'\nCARACTERÍSTICAS ESPECÍFICAS DO PROCESSO:\n'+Object.entries(S.sectAnswers).map(([k,v])=>`- ${k}: ${v}`).join('\n')+'\n':'';
  const focusStr=COST_FOCUS.includes(S.seg)
    ?'\nÊNFASE OBRIGATÓRIA: Este segmento prioriza redução de custos operacionais. Foque as recomendações em economia na conta de energia (R$/ano). Mencione CO₂ apenas como benefício ambiental secundário — não como argumento principal. Use linguagem de eficiência operacional e retorno financeiro, não de sustentabilidade corporativa.\n'
    :'\nÊNFASE: Equilibre redução de emissões e economia financeira. Mencione créditos de carbono e pressão ESG onde for relevante para este segmento.\n';
  return`Você é um engenheiro especialista em eficiência energética industrial e mercado de carbono no Brasil, com profundo conhecimento do segmento ${S.seg}.

CONTEXTO ESPECÍFICO DO SEGMENTO ${S.seg.toUpperCase()}:
${ctx}

DADOS DA EMPRESA:
- Empresa: ${S.emp} | Segmento: ${S.seg} | Porte: ${S.porte}
- Área: ${S.area>0?n(S.area,0)+' m²':'—'} | Turnos: ${S.trn}
- ${audStr}
- Geração própria: ${S.ger==='sim'?'Possui geração própria — considerar ampliar capacidade.':'Não possui geração própria — energia solar fotovoltaica é oportunidade relevante.'}${S.idade?`
- Idade dos equipamentos principais: ${S.idade}${S.idade.includes('antigos')?' — equipamentos antigos têm alto potencial de ganho com modernização/retrofit; priorize isso.':''}`:''}${S.desp?`
- Desperdício percebido pelo gestor: ${S.desp}${S.desp!=='não sei ao certo'?' — ao menos uma recomendação deve atacar diretamente essa área.':''}`:''}

CONSUMO E EMISSÕES CALCULADOS:
- Consumo elétrico: ${n(S.kwh,0)} kWh/mês | Tarifa: R$ ${res.tarifa.toFixed(2)}/kWh
- ${combStr}
- Emissões totais: ${n(res.co2MesTon)} tCO₂/mês | ${n(res.co2Ano)} tCO₂/ano
- Posição setorial: ${benchStr}
- Potencial de redução energética identificado: ${(res.potEE*100).toFixed(0)}%
- Economia financeira potencial: ${c(res.econReais)}/ano
- CO₂ evitável: ${n(res.co2Red)} tCO₂/ano | Créditos estimados: ${c(res.vlCred)}/ano
${sectStr}${budgetStr}${focusStr}${obsStr}
INSTRUÇÃO: Gere um relatório de pré-diagnóstico usando EXATAMENTE este formato, sem introduções:

SITUAÇÃO ATUAL
[2 parágrafos: análise específica desta empresa, citando os números calculados acima e a posição setorial. Seja direto e técnico.]

[REC]
TITULO: [nome específico da ação — ex: "Variadores de Frequência nos Compressores de Ar Comprimido", não "Otimizar processos"]
DESCRICAO: [2-3 frases técnicas explicando o que fazer e por que. Citar equipamentos, sistemas ou processos específicos do segmento ${S.seg}. Incluir métricas típicas do setor.]
IMPACTO: [X% de redução no consumo elétrico ou X tCO₂/ano evitadas — calcule com base nos ${n(S.kwh,0)} kWh/mês desta empresa]
INVESTIMENTO: [R$ X.000 – R$ Y.000 para empresa de médio porte]
PAYBACK: [X a Y meses]
[/REC]

[REC]
TITULO: [segunda recomendação — diferente área de atuação da primeira]
DESCRICAO: [descrição técnica específica para ${S.seg}]
IMPACTO: [impacto calculado com os dados desta empresa]
INVESTIMENTO: [faixa de investimento]
PAYBACK: [prazo de retorno]
[/REC]

[REC]
TITULO: [terceira recomendação]
DESCRICAO: [descrição técnica específica]
IMPACTO: [impacto calculado]
INVESTIMENTO: [faixa de investimento]
PAYBACK: [prazo de retorno]
[/REC]

RETORNO FINANCEIRO
[1 parágrafo curto e QUALITATIVO — NÃO repita valores em reais (o sistema já mostra os números corretos automaticamente). Foque em: prazo de retorno agregado, e se as ações atendem a meta da empresa. Se o gestor citou pressão de clientes/ESG, mencione.]

Regras CRÍTICAS:
(1) A PRIMEIRA recomendação DEVE atacar o equipamento/problema que o gestor indicou como maior fonte de desperdício${S.desp?` (ele indicou: ${S.desp})`:''}. Se um equipamento tem múltiplos problemas (ex: refratários trincados E queimadores antigos), a ação principal deve tratá-los em conjunto, não como itens "também".
(2) Cada recomendação deve ser ESPECÍFICA — nomeie a tecnologia e o que fazer. Nunca escreva "otimizar o sistema X"; escreva a ação concreta (ex: "isolamento térmico da câmara + recuperação de calor do ar de exaustão + VFDs nos ventiladores").
(3) COERÊNCIA INVESTIMENTO×IMPACTO: ações de MAIOR impacto podem ter maior investimento; a de MENOR impacto deve ter o MENOR investimento. Não recomende a ação de menor impacto com o maior custo.
(4) Ordene do menor para o maior payback.
(5) NÃO cite valores em reais de economia no texto — o sistema calcula e exibe os corretos.
(6) Use termos técnicos do segmento ${S.seg}. Máximo 520 palavras.`;
}

async function groqChat(messages,temperature){
  // Até 3 tentativas em falha de REDE (wifi de feira oscila). Erros HTTP (chave, limite) não repetem.
  // Limite de tempo por tentativa: sem isso, rede lenta/bloqueada deixava a tela de carregamento travada para sempre.
  let r,lastErr;
  for(let t=1;t<=3;t++){
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),45000);
    try{
      r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',
        signal:ctrl.signal,
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+GROQ_KEY},
        body:JSON.stringify({model:'openai/gpt-oss-120b',messages,temperature,max_tokens:4096,reasoning_effort:'low'})
      });
      clearTimeout(timer);
      break;
    }catch(e){
      clearTimeout(timer);
      console.error('Falha ao chamar a IA (tentativa '+t+'):',e);
      lastErr=e;
      if(e&&e.name==='AbortError') throw new Error('A IA demorou demais para responder (mais de 45 segundos). Verifique a internet e tente de novo.');
      if(t<3) await new Promise(res=>setTimeout(res,1500*t));
    }
  }
  if(!r){
    if(typeof navigator!=='undefined'&&navigator.onLine===false) throw new Error('Sem conexão com a internet. Conecte-se à rede e tente de novo.');
    throw new Error('Não foi possível alcançar o servidor da IA (api.groq.com). A rede pode estar bloqueando esse endereço; tente outra rede (ex.: 4G do celular).');
  }
  if(!r.ok){let m='HTTP '+r.status;try{const e=await r.json();m=e.error?.message||m;}catch(_){}throw new Error(m);}
  const d=await r.json();
  const c=d.choices?.[0];
  const txt=(c?.message?.content||'').trim();
  if(!txt) throw new Error('A IA retornou resposta vazia (finish_reason: '+(c?.finish_reason||'?')+'). Tente novamente.');
  return txt;
}

async function callGroq(res){
  return groqChat([
    {role:'system',content:`Você é um engenheiro especialista em eficiência energética industrial no Brasil, com 15 anos de experiência no segmento ${S.seg}. Responda em português brasileiro. Siga EXATAMENTE o formato solicitado com as tags [REC] e [/REC].`},
    {role:'user',content:buildPrompt(res)}
  ],0.55);
}

function parseAI(text){
  const recRx=/\[REC\]([\s\S]*?)\[\/REC\]/g;
  const recs=[];let m;
  while((m=recRx.exec(text))!==null){
    const b=m[1];
    const get=(k)=>{const r=b.match(new RegExp(k+':\\s*([\\s\\S]*?)(?=\\n[A-Z]+:|$)'));return r?r[1].trim():'';}
    recs.push({titulo:get('TITULO'),descricao:get('DESCRICAO'),impacto:get('IMPACTO'),investimento:get('INVESTIMENTO'),payback:get('PAYBACK')});
  }
  const situacao=(text.match(/SITUA[CÇ][AÃ]O ATUAL\s*([\s\S]*?)(?=\[REC\])/)||[])[1]?.trim()||'';
  const retorno=(text.match(/RETORNO FINANCEIRO\s*([\s\S]*?)$/)||[])[1]?.trim()||'';
  return{recs,situacao,retorno};
}

let seg_override='';
function renderRes(res,aiText,errMsg){
  try {
  const n=(v,d=1)=>v.toLocaleString('pt-BR',{maximumFractionDigits:d});
  const fk=v=>{if(v>=1e6)return'R$ '+n(v/1e6,1)+' M';if(v>=1e3)return'R$ '+n(v/1e3,0)+' mil';return'R$ '+n(v,0);};

  document.getElementById('r-title').textContent=S.emp||'Plano de Melhorias';
  const modoLbl=S.modo==='livre'?'Modo Livre':'Modo Guia';
  document.getElementById('r-meta').textContent=[S.seg,S.porte,S.budget?'Orçamento: '+S.budget:'',new Date().toLocaleDateString('pt-BR')].filter(Boolean).join(' · ');
  // Tempo total de preenchimento — indicador próprio, não escondido na linha de metadados
  const tempoEl=document.getElementById('r-tempo');
  const tempoLbl=document.getElementById('r-tempo-lbl');
  if(tempoEl) tempoEl.textContent=S.tempoDiagnostico?formatarTempo(S.tempoDiagnostico):'—';
  if(tempoLbl) tempoLbl.textContent='tempo até o resultado · '+modoLbl;

  // Precisão dos números depende da qualidade dos dados fornecidos
  const qpct=calcularQualidade();
  const preciso=qpct>=70;             // 70%+ = números diretos; abaixo = estimativa preliminar "até"
  const money=fk(res.econReais);
  const co2=n(res.co2Red);
  const cred=fk(res.vlCred);

  document.getElementById('r-co2').textContent=n(res.co2Ano);
  document.getElementById('r-eco').textContent=preciso?money:'até '+money;
  // Crédito de carbono: só como "potencial futuro" — nunca como valor garantido
  document.getElementById('r-cred').textContent=cred;
  // Dois resultados — economia (R$) + carbono evitado (tCO₂), com precisão adaptada
  document.getElementById('d-money').textContent=preciso?money:'até '+money;
  document.getElementById('d-carbon').textContent=(preciso?'':'até ')+co2+' t';

  // Nota do painel muda conforme a qualidade
  const dnote=document.querySelector('.dual-note');
  if(dnote){
    dnote.textContent=preciso
      ? 'Potenciais estimados a partir dos dados fornecidos. As recomendações priorizam o que cabe no seu orçamento.'
      : 'Estimativa preliminar baseada nos dados disponíveis. A precisão aumenta conforme você adiciona mais informações sobre os equipamentos.';
  }
  atualizarQualidade();
  // Equivalências por setor
  const eqs=EQUIV[S.seg]||EQUIV.default;
  const eqGrid=document.getElementById('eq-grid');
  if(eqGrid){
    eqGrid.innerHTML=eqs.map(e=>`<div class="eq-card"><div class="eq-ico"><svg class="ico" width="26" height="26"><use href="#${e.ico}"/></svg></div><div class="eq-val">${e.f(res.co2Ano)}</div><div class="eq-lbl">${e.lbl}</div></div>`).join('');
  }

  // Benchmark — só afirma comparação se houver dados; sempre alerta sobre comparabilidade
  const b=res.bench;
  const st=document.getElementById('bench-status');
  if(b && b.avg>0){
    const diff=((res.co2Ano-b.avg)/b.avg)*100;
    if(diff>15)st.innerHTML=`<span class="bench-status above"><svg class="ico" width="12" height="12"><use href="#i-warn"/></svg> Cerca de ${Math.abs(diff).toFixed(0)}% acima da média estimada do setor</span>`;
    else st.innerHTML=`<span class="bench-status ok"><svg class="ico" width="12" height="12"><use href="#i-check"/></svg> ${diff<-15?'Cerca de '+Math.abs(diff).toFixed(0)+'% abaixo da média estimada':'Próximo à média estimada do setor'}</span>`;
    document.getElementById('bench-note').innerHTML=`Média estimada para o segmento ${S.seg} (fonte: ${b.src}). <strong>Comparação apenas indicativa:</strong> empresas do mesmo setor variam muito conforme produção, porte e intensidade energética. Para um comparativo preciso, seria necessário informar a produção (ex: tCO₂ por tonelada produzida).`;
  } else {
    st.innerHTML='';
    document.getElementById('bench-note').textContent='Comparativo setorial indisponível.';
  }

  // Impact
  document.getElementById('imp-num').textContent=Math.round(res.co2Red*5500).toLocaleString('pt-BR');

  showPg('res');

  // EARLY EXIT for errors — show error UI without animating broken bars
  if(errMsg){
    document.getElementById('r-situacao').innerHTML=`<div class="err-card">Não foi possível conectar ao servidor de IA.<br><small style="opacity:.7">${errMsg}</small></div>`;
    document.getElementById('rec-list').innerHTML='<div style="background:var(--white);border-radius:4px;padding:28px;text-align:center;color:var(--light);border:1px solid var(--border)">Recomendações indisponíveis — verifique a conexão e tente novamente.</div>';
    document.getElementById('r-retorno').textContent='—';
    return;
  }

  // Animate bars (only when there's valid data)
  setTimeout(()=>{
    const safeAvg=(b && b.avg>0)?b.avg:res.co2Ano;
    const max=Math.max(res.co2Ano,safeAvg,1)*1.2;
    document.getElementById('bb-co').style.width=(res.co2Ano/max*100)+'%';
    document.getElementById('bb-ref').style.width=(safeAvg/max*100)+'%';
    document.getElementById('bb-co-val').textContent=n(res.co2Ano)+' t';
    document.getElementById('bb-ref-val').textContent=n(safeAvg,0)+' t';
    const v1=Math.min(res.potEE*100,100),v2=Math.min(res.potProc*100+5,100),v3=Math.min(res.potRen*100,100);
    document.getElementById('b1').style.width=v1+'%';document.getElementById('p1').textContent=v1.toFixed(0)+'%';
    document.getElementById('b2').style.width=v2+'%';document.getElementById('p2').textContent=v2.toFixed(0)+'%';
    document.getElementById('b3').style.width=v3+'%';document.getElementById('p3').textContent=v3.toFixed(0)+'%';
  },320);

  const parsed=parseAI(aiText);
  document.getElementById('r-situacao').textContent=parsed.situacao||aiText.split('\n')[0];
  // Resumo confiável gerado pelo CÓDIGO (números corretos, não os da IA)
  const fkr=v=>{if(v>=1e6)return'R$ '+n(v/1e6,1)+' milhões';if(v>=1e3)return'R$ '+n(v/1e3,0)+' mil';return'R$ '+n(v,0);};
  // Soma o investimento mínimo das recomendações (para coerência)
  const invSum=(parsed.recs||[]).reduce((a,r)=>a+parseInvestMin(r.investimento),0);
  const invTxt=invSum>0?` · Investimento estimado das ações: a partir de ${fkr(invSum)}`:'';
  const resumoCodigo=`Potencial de economia: ${fkr(res.econReais)}/ano · CO₂ evitável: ${n(res.co2Red)} tCO₂/ano${invTxt}. Crédito de carbono é potencial futuro, não valor garantido.`;
  const retornoTxt=document.getElementById('r-retorno');
  // Mostra APENAS o resumo do código — evita que erros de número da IA apareçam
  retornoTxt.innerHTML=`<strong style="color:var(--forest)">${resumoCodigo}</strong>`;

  const list=document.getElementById('rec-list');
  if(parsed.recs.length===0){
    list.innerHTML='<div class="block" style="white-space:pre-wrap;font-size:.88rem;color:#3D5248;line-height:1.75">'+aiText+'</div>';
  }else{
    list.innerHTML=parsed.recs.map((r,i)=>`
      <div class="rec-card">
        <div class="rec-head">
          <div class="rec-num">0${i+1}</div>
          <div class="rec-title">${r.titulo}</div>
        </div>
        <div class="rec-desc">${r.descricao}</div>
        <div class="rec-footer">
          <div class="rec-metric"><div class="rm-lbl">Redução estimada</div><div class="rm-val">${r.impacto||'—'}</div></div>
          <div class="rec-metric"><div class="rm-lbl">Investimento</div><div class="rm-val">${r.investimento||'—'}</div></div>
          <div class="rec-metric"><div class="rm-lbl">Payback estimado</div><div class="rm-val">${r.payback||'—'}</div></div>
        </div>
      </div>`).join('');
    // Verificação de orçamento no código (rede de segurança)
    checkBudget(parsed.recs);
  }
  } catch(e) {
    console.error('renderRes error:', e);
    alert('Erro ao montar resultados: '+e.message+'\n\nAbra o console (F12) para detalhes.');
  }
}

// Extrai o menor valor de investimento de uma string tipo "R$ 80.000 – R$ 120.000"
function parseInvestMin(str){
  if(!str) return 0;
  // pega todos os números (com mil/k) da string
  const nums=[];
  const re=/R?\$?\s*([\d.,]+)\s*(mil|k)?/gi;
  let m;
  while((m=re.exec(str))!==null){
    let v=parseFloat(m[1].replace(/\./g,'').replace(',','.'));
    if(isNaN(v)) continue;
    if(m[2]) v*=1000;            // "80 mil" -> 80000
    else if(v<1000) v*=1000;     // "80" provavelmente é 80 mil em contexto de investimento
    nums.push(v);
  }
  return nums.length?Math.min(...nums):0;
}

// Faixa máxima do orçamento selecionado
function budgetCeil(b){
  const map={'até R$ 20 mil':20000,'R$ 20–50 mil':50000,'R$ 50–100 mil':100000,'R$ 100–300 mil':300000,'acima de R$ 300 mil':99999999};
  return map[b]||0;
}

function checkBudget(recs){
  const old=document.getElementById('budget-check');
  if(old) old.remove();
  if(!S.budget || !recs.length) return;
  const ceil=budgetCeil(S.budget);
  if(!ceil) return;
  const somaMin=recs.reduce((a,r)=>a+parseInvestMin(r.investimento),0);
  if(somaMin<=0) return;
  const fmt=v=>'R$ '+Math.round(v).toLocaleString('pt-BR');
  const cabe=somaMin<=ceil;
  const banner=document.createElement('div');
  banner.id='budget-check';
  banner.style.cssText='margin-top:4px;margin-bottom:14px;padding:13px 16px;border-radius:3px;font-size:.8rem;line-height:1.5;display:flex;gap:10px;align-items:flex-start;'+
    (cabe?'background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;':'background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;');
  banner.innerHTML=cabe
    ? `<svg class="ico" width="15" height="15" style="margin-top:1px"><use href="#i-check"/></svg><span><strong>Plano dentro do orçamento.</strong> Investimento mínimo somado: ${fmt(somaMin)} — cabe no seu limite (${S.budget}).</span>`
    : `<svg class="ico" width="15" height="15" style="margin-top:1px"><use href="#i-warn"/></svg><span><strong>Atenção: o plano completo ultrapassa o orçamento.</strong> Investimento mínimo somado: ${fmt(somaMin)}, acima do seu limite (${S.budget}). Considere executar as ações de menor payback primeiro e negociar um complemento de orçamento.</span>`;
  const list=document.getElementById('rec-list');
  list.parentNode.insertBefore(banner, list.nextSibling);
}

// ── MODO LIVRE ──────────────────────────────────────────────────
function buildPromptLivre(txt){
  return`Você é um engenheiro especialista em eficiência energética industrial no Brasil, com profundo conhecimento de todos os segmentos industriais.

TEXTO LIVRE ENVIADO PELO GESTOR:
"${txt}"

TAREFA — siga EXATAMENTE esta ordem:

PASSO 1 — EXTRAÇÃO E ESTIMATIVA:
- Identifique: segmento, equipamentos citados, problemas, metas, orçamento
- Estime dados faltantes com médias setoriais (EPE BEN 2022, SEEG 2022):
  · Alimentícia média: 120.000 kWh/mês + 8.000 m³ gás/mês
  · Metalúrgica média: 280.000 kWh/mês + fornos a gás
  · Têxtil média: 95.000 kWh/mês + vapor
  · Química média: 220.000 kWh/mês + combustíveis
  · Papel média: 380.000 kWh/mês + biomassa
  · Plásticos média: 110.000 kWh/mês
  · Cerâmica média: 160.000 kWh/mês + gás
  · Madeira média: 55.000 kWh/mês
  · Automobilística média: 320.000 kWh/mês

PASSO 2 — NÃO CALCULE EMISSÕES. Apenas informe os DADOS DE ENTRADA que você extraiu ou estimou. O cálculo de CO₂ será feito pelo sistema, não por você.
- Consumo elétrico mensal em kWh (extraído do texto ou estimado pela média setorial)
- Tipo de combustível principal, se houver (diesel / gas_natural / glp / biomassa / nenhum)
- Quantidade mensal de combustível (em litros para diesel/glp, m³ para gás, kg para biomassa)
- Segmento identificado (use exatamente um dos: Alimentícia e Bebidas / Metalúrgica e Siderúrgica / Têxtil e Vestuário / Química e Petroquímica / Papel e Celulose / Plásticos e Borracha / Cerâmica e Vidro / Madeira e Móveis / Automobilística / Outros)

Médias setoriais de referência para estimar o consumo elétrico, se o texto não informar:
  · Alimentícia: 120.000 kWh/mês · Metalúrgica: 280.000 kWh/mês · Têxtil: 95.000 kWh/mês
  · Química: 220.000 kWh/mês · Papel: 380.000 kWh/mês · Plásticos: 110.000 kWh/mês
  · Cerâmica: 160.000 kWh/mês · Madeira: 55.000 kWh/mês · Automobilística: 320.000 kWh/mês

PASSO 3 — GERE O RELATÓRIO usando EXATAMENTE este formato:

[METRICS]
KWH_MES: [número, só o número — consumo elétrico mensal em kWh]
COMBUSTIVEL: [diesel / gas_natural / glp / biomassa / nenhum]
COMB_QTD: [número, só o número — quantidade mensal; 0 se nenhum]
SEG: [segmento identificado]
[/METRICS]

SITUAÇÃO ATUAL
[2 parágrafos: análise específica e PESSOAL baseada no texto. Use a "voz da empresa" — demonstre que você ouviu a dor do gestor. Cite os equipamentos e a idade deles mencionados no texto (ex: "seus fornos de 22 anos"), os valores que ele está perdendo, e a pressão que ele mencionou (clientes, diretoria, metas). Se ele citou uma meta da diretoria, mencione-a aqui.]

REGRAS CRÍTICAS ANTES DE RECOMENDAR (leia com atenção):
1. ORÇAMENTO É UMA TRAVA RÍGIDA. Se o gestor informou um orçamento (ex: R$ 250 mil), a SOMA DOS INVESTIMENTOS MÍNIMOS das recomendações NÃO PODE ultrapassar esse valor. Se as 3 ações não cabem, recomende apenas 2 — ou ações de menor custo. NUNCA recomende um plano que estoura o orçamento.
2. PRIORIZE O QUE O GESTOR DISSE SER O MAIOR PROBLEMA. Se ele disse "meu maior problema são as injetoras", a PRIMEIRA recomendação DEVE atacar as injetoras — não outro equipamento.
3. PREFIRA MODERNIZAR A SUBSTITUIR. Substituir máquinas (ex: trocar injetora) custa R$ 200-500 mil por unidade e raramente cabe no orçamento. Recomende MODERNIZAÇÃO (VFDs, isolamento, manutenção, retrofit) em vez de substituição completa, a menos que o orçamento claramente permita.
4. Ao final, confira: a soma dos investimentos mínimos é menor ou igual ao orçamento? Se não, REFAÇA com ações mais baratas.

[REC]
TITULO: [ação ESPECÍFICA com tecnologia nomeada — ex: "Recuperadores de calor nos gases de exaustão dos fornos", não "sistema de recuperação de calor"]
DESCRICAO: [2-3 frases técnicas. Cite o equipamento específico do texto, a tecnologia concreta (VFD, recuperador, LED 150 lm/W, sensores), parâmetros típicos (ex: reduzir pressão de 8 para 6,5 bar) e o percentual de economia esperado. Seja executável: o gestor precisa saber O QUÊ, COMO e com QUAL tecnologia.]
IMPACTO: [redução estimada — ex: "15-18% no consumo dos fornos = ~X tCO₂/ano". Se houver meta da diretoria, diga quanto % da meta esta ação atende.]
INVESTIMENTO: [faixa realista dentro do orçamento mencionado]
PAYBACK: [prazo realista — LED costuma ser 3-6 meses, ar comprimido 8-12 meses, recuperação de calor 10-14 meses]
[/REC]

[REC]
TITULO: [segunda recomendação — tecnologia nomeada, área diferente da primeira]
DESCRICAO: [descrição técnica executável, específica para o equipamento citado]
IMPACTO: [impacto estimado + % da meta da diretoria, se houver]
INVESTIMENTO: [faixa realista]
PAYBACK: [prazo realista]
[/REC]

[REC]
TITULO: [terceira recomendação — tecnologia nomeada]
DESCRICAO: [descrição técnica executável]
IMPACTO: [impacto estimado + % da meta]
INVESTIMENTO: [faixa realista]
PAYBACK: [prazo realista]
[/REC]

RETORNO FINANCEIRO
[1 parágrafo: soma das economias das 3 recomendações, payback agregado, e — se houver meta da diretoria — quanto % da meta as 3 ações atendem JUNTAS. Seja honesto: se as 3 ações não batem a meta sozinhas, diga isso e sugira que ações adicionais (ex: VFD em exaustores e bombas, correção de fator de potência) completariam o restante. Indique quanto do orçamento sobra. Se o gestor mencionou pressão de clientes ou ESG, inclua esse argumento.]

Regras: (1) paybacks realistas e curtos para ações de baixo custo; (2) investimentos coerentes com tecnologias reais (recuperador de calor: R$30-50 mil por forno; auditoria de ar comprimido + VFDs: R$120-160 mil; LED industrial: R$200-400 por ponto); (3) seja técnico e específico, nunca genérico; (4) ao citar percentuais de redução, use as faixas reais das tecnologias do setor (ex: recuperação de calor em efluentes de tingimento têxtil reduz 20-30% do consumo de vapor; recuperadores em fornos reduzem 15-25%); (5) as TRÊS recomendações devem ser ações de ENGENHARIA com impacto físico direto (recuperadores de calor, VFDs em bombas/ventiladores, reúso de água quente, isolamento térmico de tubulações, substituição de queimadores, correção de fator de potência). NÃO use "monitoramento de energia" ou "sistema de gestão" como uma das três recomendações principais; (6) IMPORTANTE — quando NÃO houver dados específicos dos equipamentos (potência dos motores, horas de operação, consumo por equipamento), NÃO afirme um percentual fechado como certo. Em vez disso, escreva no IMPACTO algo como "potencial de X-Y% — a confirmar com dados dos equipamentos" e mencione que a quantificação precisa exige medição. Seja honesto sobre a incerteza; (7) máximo 550 palavras.`;
}

function parseMetrics(txt){
  const m=txt.match(/\[METRICS\]([\s\S]*?)\[\/METRICS\]/);
  if(!m) return null;
  const b=m[1];
  const gn=k=>{const r=b.match(new RegExp(k+':\\s*([\\d.,]+)'));return r?parseFloat(r[1].replace(/\./g,'').replace(',','.')):0;};
  const gs=k=>{const r=b.match(new RegExp(k+':\\s*(.+)'));return r?r[1].trim():'';};
  // Normaliza o combustível para uma das chaves de EF
  let combRaw=gs('COMBUSTIVEL').toLowerCase();
  let comb='nenhum';
  if(/diesel/.test(combRaw)) comb='diesel';
  else if(/g[áa]s\s*natural|gas_natural|gn\b/.test(combRaw)) comb='gas_natural';
  else if(/glp|g[áa]s\s*de\s*cozinha|propano/.test(combRaw)) comb='glp';
  else if(/biomassa|lenha|cavaco|bagac/.test(combRaw)) comb='biomassa';
  return{
    kwh:gn('KWH_MES'),
    comb:comb,
    combQtd:gn('COMB_QTD'),
    seg:gs('SEG')||'Outros'
  };
}

// Calcula CO₂ e economia no CÓDIGO (não na IA) — mesma lógica do Modo Guia
function calcularLivre(kwh, comb, combQtd, seg){
  const co2El=kwh*EF.eletricidade;
  let co2Cb=0;
  if(combQtd>0 && EF[comb]) co2Cb=combQtd*EF[comb];
  const co2MesKg=co2El+co2Cb;
  const co2Ano=(co2MesKg*12)/1000;
  const potEE=0.18, potProc=0.10, potRen=0.15;
  const tarifa=0.72;
  // Economia: energia elétrica + combustível economizados
  const econEl=kwh*12*potEE*tarifa;
  const precoComb={diesel:5.80,gas_natural:3.50,glp:6.50,biomassa:0.40}[comb]||0;
  const econComb=combQtd>0?combQtd*12*potProc*precoComb:0;
  const econReais=econEl+econComb;
  const co2Red=co2Ano*(potEE+potProc);
  const vlCred=co2Red*75;
  const bench=BENCH[seg]||{avg:580,src:'EPE BEN 2022'};
  return{co2Ano,co2MesTon:co2MesKg/1000,potEE,potRen,potProc,econReais,co2Red,vlCred,tarifa,bench};
}

async function gerarLivre(){
  const txt=document.getElementById('f-livre').value.trim();
  if(!txt||txt.length<30){alert('Descreva sua situação com um pouco mais de detalhes (mínimo 30 caracteres).');return;}
  S.modo='livre';
  S.livreSinais=extrairSinaisLivre(txt,null);   // provisório; refinado após a extração da IA
  showPg('load');
  // animate loading
  let i=0;const seq=[600,600,100];
  function tick(){
    if(i>0){document.getElementById('ls'+i).className='li ok';document.getElementById('li'+i).innerHTML='<svg class="ico" width="11" height="11"><use href="#i-check"/></svg>';}
    i++;
    if(i<=4){document.getElementById('ls'+i).className='li run';document.getElementById('li'+i).innerHTML='<svg class="ico" width="11" height="11"><use href="#i-zap"/></svg>';if(i<4)setTimeout(tick,seq[i-1]);}
  }
  tick();
  try{
    const aiText=await groqChat([
      {role:'system',content:'Você é um engenheiro especialista em eficiência energética industrial no Brasil. Siga EXATAMENTE o formato solicitado, incluindo os blocos [METRICS], [REC] e todas as seções pedidas. Responda em português brasileiro.'},
      {role:'user',content:buildPromptLivre(txt)}
    ],0.5);
    S.tempoDiagnostico=pararCronometro();
    const metrics=parseMetrics(aiText);
    S.livreSinais=extrairSinaisLivre(txt,metrics);   // qualidade varia conforme o que foi extraído
    // mark step 4 done
    document.getElementById('ls4').className='li ok';
    document.getElementById('li4').innerHTML='<svg class="ico" width="11" height="11"><use href="#i-check"/></svg>';
    await delay(400);
    // Build a res-like object — CÁLCULO FEITO NO CÓDIGO, não pela IA
    if(metrics && metrics.kwh>0){
      seg_override=metrics.seg;
      const realRes=calcularLivre(metrics.kwh, metrics.comb, metrics.combQtd, metrics.seg);
      S.res=realRes; S.ai=aiText; S.seg=metrics.seg; S.emp='Modo Livre';
      // Store extracted inputs for transparency
      S.kwh=metrics.kwh; S.ct=metrics.comb; S.cq=metrics.combQtd;
      document.getElementById('r-chip').innerHTML='<svg class="ico" width="11" height="11"><use href="#i-sparkle"/></svg> Modo Livre — cálculo do sistema';
      renderRes(realRes,aiText);
    } else if(metrics){
      // metrics parsed but no kWh — use sector average
      seg_override=metrics.seg;
      const avgKwh={'Alimentícia e Bebidas':120000,'Metalúrgica e Siderúrgica':280000,'Têxtil e Vestuário':95000,'Química e Petroquímica':220000,'Papel e Celulose':380000,'Plásticos e Borracha':110000,'Cerâmica e Vidro':160000,'Madeira e Móveis':55000,'Automobilística':320000,'Outros':100000}[metrics.seg]||100000;
      const realRes=calcularLivre(avgKwh, metrics.comb, metrics.combQtd, metrics.seg);
      S.res=realRes; S.ai=aiText; S.seg=metrics.seg; S.emp='Modo Livre';
      document.getElementById('r-chip').innerHTML='<svg class="ico" width="11" height="11"><use href="#i-sparkle"/></svg> Modo Livre — estimativa setorial';
      renderRes(realRes,aiText);
    } else {
      // fallback: show raw AI text
      seg_override='';
      const fakeRes={co2Ano:0,co2MesTon:0,potEE:0.18,potRen:0.15,potProc:0.10,econReais:0,co2Red:0,vlCred:0,tarifa:0.72,bench:{avg:580,src:'EPE BEN 2022'}};
      S.res=fakeRes; S.ai=aiText; S.seg='Outros'; S.emp='Modo Livre';
      renderRes(fakeRes,aiText);
    }
  } catch(err){
    S.tempoDiagnostico=pararCronometro();
    console.error('[CarbonTrack] Falha no Modo Livre:',err);
    const fakeRes={co2Ano:0,co2MesTon:0,potEE:0,potRen:0,potProc:0,econReais:0,co2Red:0,vlCred:0,tarifa:0,bench:{avg:0,src:''}};
    S.res=fakeRes; S.ai=null; S.emp=S.emp||'Modo Livre';   // sem isso o PDF quebra depois de um erro aqui
    await delay(300); renderRes(fakeRes,null,err.message);
  }
}

// Gera um PNG do logo a partir do SVG para uso no PDF
function carregarLogoPDF(size=160){
  return new Promise((resolve)=>{
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="21" fill="none" stroke="#22C55E" stroke-width="2.5"/>
      <path d="M18 31c-1.5-9 3-15 12-17-1 10-4.5 15-12 17z" fill="#1A7A3A"/>
      <path d="M17 25h6l3-8 4.5 15 3-10 2 5h13" fill="none" stroke="#22C55E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="44" cy="27" r="2.2" fill="#22C55E"/>
    </svg>`;
    const img = new Image();
    img.onload = ()=>{
      try{
        const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
        const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,size,size);
        resolve(canvas.toDataURL('image/png'));
      }catch(e){resolve(null);}
    };
    img.onerror = ()=>resolve(null);
    setTimeout(()=>resolve(null),2000);   // nunca deixa a geração do PDF pendurada
    try{ img.src='data:image/svg+xml;base64,'+btoa(svg); }catch(e){ resolve(null); }
  });
}

// ── PDF ─────────────────────────────────────────────────────────
// As fontes padrão do jsPDF usam WinAnsi: caracteres fora dessa tabela
// (subscritos como o "₂" de CO₂, travessões, aspas curvas) saíam quebrados
// ou derrubavam a geração. Tudo que vai para o PDF passa por aqui.
function pdfTxt(v){
  if(v===null||v===undefined) return '';
  return String(v)
    .replace(/[\u2080-\u2089]/g,m=>String.fromCharCode(48+(m.charCodeAt(0)-0x2080))) // ₂ -> 2
    .replace(/[\u2013\u2014\u2212]/g,'-')
    .replace(/[\u2018\u2019\u2032]/g,"'")
    .replace(/[\u201C\u201D]/g,'"')
    .replace(/\u2026/g,'...')
    .replace(/[\u00a0\u2007\u202f\u200b]/g,' ')
    .replace(/[^\u0000-\u00ff]/g,'')          // remove o que a fonte não sabe desenhar
    .replace(/[ \t]{2,}/g,' ')
    .trim();
}

async function gerarPDF(){
  const btn=document.getElementById('btn-pdf');
  const btnLabel='<svg class="ico" width="15" height="15"><use href="#i-down"/></svg>Baixar Plano em PDF';
  btn.innerHTML='<svg class="ico" width="14" height="14"><use href="#i-clock"/></svg> Gerando...';
  btn.disabled=true;
  try{
    if(!window.jspdf||!window.jspdf.jsPDF)
      throw new Error('A biblioteca jsPDF não carregou. Verifique a conexão e recarregue a página.');
    const res=S.res;
    if(!res||typeof res.co2Ano!=='number')
      throw new Error('Não há diagnóstico calculado para exportar. Gere o diagnóstico antes de baixar o PDF.');

    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({unit:'mm',format:'a4'});

    /* ═══ grade da página ═══ */
    const W=210, M=18, CW=W-M*2, BOT=272;   // BOT deixa a faixa do rodapé (284mm) sempre livre
    let y=0;

    /* ═══ paleta e estilos — um único padrão para o documento inteiro ═══ */
    const C={ink:[13,31,19],forest:[26,92,52],signal:[34,197,94],white:[255,255,255],
             body:[55,65,81],label:[120,140,130],slate:[82,102,106],lime:[134,239,172],
             sky:[125,211,252],soft:[134,180,150],panel:[240,251,244],border:[182,226,196]};
    const F={
      title  :{s:16,  w:'bold',   c:C.ink},
      sub    :{s:9.5, w:'normal', c:C.slate},
      eyebrow:{s:9,   w:'normal', c:C.label},
      secHead:{s:8.5, w:'bold',   c:C.white},
      label  :{s:7.5, w:'bold',   c:C.label},
      value  :{s:8.5, w:'bold',   c:C.ink},
      body   :{s:8.5, w:'normal', c:C.body},
      recTit :{s:9.5, w:'bold',   c:C.ink},
      recNum :{s:7.5, w:'bold',   c:C.forest},
      recBody:{s:7.8, w:'normal', c:C.body},
      metLbl :{s:6,   w:'bold',   c:C.forest},
      metVal :{s:7.5, w:'normal', c:C.body},
      small  :{s:6.5, w:'normal', c:C.label}
    };
    const LH=st=>st.s*0.48;                       // altura de linha em mm
    const use=st=>{doc.setFontSize(st.s);doc.setFont('helvetica',st.w);doc.setTextColor(st.c[0],st.c[1],st.c[2]);};
    const split=(t,st,w)=>{use(st);return doc.splitTextToSize(pdfTxt(t)||'—',Math.max(10,w));};
    // Quebra em mais linhas; se ainda não couber no espaço reservado, reduz a fonte.
    // Nenhum texto dinâmico é cortado.
    const fit=(t,st,w,maxLines,minSize)=>{
      let s=st.s,lines;
      for(;;){
        doc.setFontSize(s);doc.setFont('helvetica',st.w);
        lines=doc.splitTextToSize(pdfTxt(t)||'—',Math.max(10,w));
        if(lines.length<=maxLines||s<=minSize)break;
        s-=0.5;
      }
      return{lines:lines.slice(0,Math.max(maxLines,lines.length)),size:s,lh:s*0.48};
    };
    const drawFit=(f,st,x,top,align)=>{
      doc.setFontSize(f.size);doc.setFont('helvetica',st.w);doc.setTextColor(st.c[0],st.c[1],st.c[2]);
      f.lines.forEach((l,i)=>doc.text(l,x,top+i*f.lh,align?{align:align}:undefined));
      return f.lines.length*f.lh;
    };

    const logoData=await carregarLogoPDF();
    function miniHeader(){
      doc.setFillColor(C.ink[0],C.ink[1],C.ink[2]);doc.rect(0,0,W,14,'F');
      if(logoData) doc.addImage(logoData,'PNG',M,3,8,8);
      use({s:10,w:'bold',c:C.signal});doc.text('CarbonTrack',logoData?M+11:M,9.5);
      use({s:7,w:'normal',c:[167,243,208]});doc.text('Plano de Melhorias - continuação',W-M,9.5,{align:'right'});
      return 24;
    }
    // Abre página nova quando o bloco não cabe inteiro — nada é cortado ao meio
    const ensure=h=>{if(y+h>BOT){doc.addPage();y=miniHeader();}};
    // Texto corrido com paginação linha a linha
    const flow=(t,st,opt)=>{
      opt=opt||{};
      const x=opt.x!==undefined?opt.x:M, w=opt.w!==undefined?opt.w:CW;
      const lines=split(t,st,w), lh=LH(st);
      lines.forEach(l=>{ensure(lh);use(st);doc.text(l,x,y);y+=lh;});
      y+=(opt.gap||0);
    };
    const section=t=>{
      ensure(8+10);
      doc.setFillColor(C.ink[0],C.ink[1],C.ink[2]);doc.rect(M,y,CW,8,'F');
      use(F.secHead);doc.text(pdfTxt(t),M+3,y+5.5);
      y+=13;
    };
    const painel=(titulo,texto)=>{
      const lines=split(texto,F.body,CW-10), h=lines.length*LH(F.body)+(titulo?16:10);
      ensure(h);
      doc.setFillColor(C.panel[0],C.panel[1],C.panel[2]);
      doc.setDrawColor(C.border[0],C.border[1],C.border[2]);doc.setLineWidth(0.3);
      doc.roundedRect(M,y,CW,h,1,1,'FD');
      let ty=y+7;
      if(titulo){use({s:8,w:'bold',c:C.forest});doc.text(pdfTxt(titulo),M+5,ty);ty+=6;}
      use(F.body);lines.forEach((l,i)=>doc.text(l,M+5,ty+i*LH(F.body)));
      y+=h+6;
    };

    /* ═══ dados ═══ */
    const n=(v,d=1)=>(typeof v==='number'&&isFinite(v)?v:0).toLocaleString('pt-BR',{maximumFractionDigits:d});
    const fk=v=>{
      v=(typeof v==='number'&&isFinite(v))?v:0;
      if(v>=1e6) return 'R$ '+n(v/1e6,1)+' M';
      if(v>=1e3) return 'R$ '+n(v/1e3,0)+' mil';
      return 'R$ '+n(v,0);
    };
    const parsed=S.ai?parseAI(S.ai):{recs:[],situacao:'',retorno:''};
    const q=detalheQualidade();
    const modoLbl=S.modo==='livre'?'Modo Livre':'Modo Guia';

    /* ═══ CABEÇALHO ═══ */
    doc.setFillColor(C.ink[0],C.ink[1],C.ink[2]);doc.rect(0,0,W,46,'F');
    const tX=logoData?M+20:M;
    if(logoData) doc.addImage(logoData,'PNG',M,12,16,16);
    use({s:19,w:'bold',c:C.signal});doc.text('CarbonTrack',tX,20);
    use({s:9.5,w:'normal',c:[167,243,208]});
    doc.text(split('Plano de Melhorias e Diagnóstico de Carbono Industrial',{s:9.5,w:'normal',c:[167,243,208]},W-tX-M)[0],tX,29);
    use({s:8,w:'normal',c:[100,160,120]});
    doc.text(pdfTxt(new Date().toLocaleDateString('pt-BR')+' · Protótipo Feira de Ciências 2025'),tX,38);

    y=58;
    use(F.eyebrow);doc.text('PLANO DE MELHORIAS',M,y);y+=8;

    // Nome da empresa — quebra em até 2 linhas e reduz a fonte se ainda não couber
    const emp=fit(S.emp||'Empresa',F.title,CW,2,10);
    y+=drawFit(emp,F.title,M,y);
    y+=2;
    use(F.sub);
    split([S.seg,S.porte].filter(Boolean).join(' · ')||'—',F.sub,CW).forEach(l=>{doc.text(l,M,y);y+=LH(F.sub);});
    y+=4;
    doc.setDrawColor(C.border[0],C.border[1],C.border[2]);doc.setLineWidth(0.4);doc.line(M,y,W-M,y);y+=8;

    /* ═══ FICHA DA EMPRESA — rótulo e valor em colunas, valor com quebra ═══ */
    const labW=44, valX=M+labW+4, valW=CW-labW-4;
    [['Responsável',S.resp||'—'],
     ['Modo do diagnóstico',modoLbl],
     ['Consumo elétrico',Number(S.kwh)>0?n(S.kwh,0)+' kWh/mês':'—'],
     ['Tempo até o resultado',S.tempoDiagnostico?formatarTempo(S.tempoDiagnostico):'—'],
     ['Qualidade dos dados',q.pct+'%'],
     ['Área',Number(S.area)>0?n(S.area,0)+' m²':'—'],
     ['Auditoria',S.aud==='sim'?'Já realizou':S.aud==='nao'?'Nunca realizou':S.aud==='plan'?'Planejando realizar':'—'],
     ['Geração própria',S.ger==='sim'?'Possui':S.ger==='nao'?'Não possui':'—'],
     ['Turnos',S.trn||'—'],
     ['Idade equipam.',S.idade||'—'],
     ['Desperdício percebido',S.desp||'—'],
     ['Orçamento',S.budget||'—']
    ].filter(([l,v])=>v!=='—'||['Tempo até o resultado','Qualidade dos dados'].includes(l)).forEach(([l,v])=>{
      const f=fit(v,F.value,valW,2,6.5);
      const h=Math.max(6.5,f.lines.length*f.lh+2.5);
      ensure(h);
      use(F.label);doc.text(pdfTxt(l)+':',M,y+3.8);
      drawFit(f,F.value,valX,y+3.8);
      y+=h;
    });
    y+=6;

    /* ═══ DOIS RESULTADOS ═══ */
    ensure(30);
    doc.setFillColor(C.ink[0],C.ink[1],C.ink[2]);doc.roundedRect(M,y,CW,24,1,1,'F');
    const colA=M+5, colB=M+CW/2+3, halfW=CW/2-8;
    use({s:7,w:'bold',c:C.lime});doc.text('PARA O SEU BOLSO',colA,y+7);
    drawFit(fit(fk(res.econReais)+'/ano',{s:13,w:'bold',c:C.white},halfW,1,7.5),{s:13,w:'bold',c:C.white},colA,y+15);
    use({s:6,w:'normal',c:C.soft});doc.text('economia na conta de energia',colA,y+20.5);
    use({s:7,w:'bold',c:C.sky});doc.text('PARA O MEIO AMBIENTE',colB,y+7);
    drawFit(fit(n(res.co2Red)+' tCO2/ano',{s:13,w:'bold',c:C.white},halfW,1,7.5),{s:13,w:'bold',c:C.white},colB,y+15);
    use({s:6,w:'normal',c:C.soft});doc.text('emissões evitadas por ano',colB,y+20.5);
    y+=30;

    /* ═══ MÉTRICAS — 3 cards de largura calculada (nunca passam da margem) ═══ */
    const gap=6, cardW=(CW-gap*2)/3;
    ensure(28);
    [['Emissão Anual',n(res.co2Ano)+' tCO2/ano',[220,252,231],[22,101,52]],
     ['Pot. Economia',fk(res.econReais)+'/ano',[219,234,254],[29,78,216]],
     ['Créditos CO2',fk(res.vlCred)+'/ano',[254,243,199],[146,64,14]]
    ].forEach(([lbl,val,bg,tc],i)=>{
      const x=M+i*(cardW+gap);
      doc.setFillColor(bg[0],bg[1],bg[2]);doc.roundedRect(x,y,cardW,24,1,1,'F');
      use({s:6.5,w:'bold',c:tc});doc.text(pdfTxt(lbl.toUpperCase()),x+cardW/2,y+8,{align:'center'});
      const f=fit(val,{s:9,w:'bold',c:C.ink},cardW-6,2,6);
      drawFit(f,{s:9,w:'bold',c:C.ink},x+cardW/2,f.lines.length>1?y+14.5:y+17,'center');
    });
    y+=32;

    /* ═══ SITUAÇÃO ATUAL ═══ */
    if(parsed.situacao){
      section('SITUAÇÃO ATUAL');
      flow(parsed.situacao,F.body,{gap:6});
    }

    /* ═══ RECOMENDAÇÕES — altura do card calculada a partir do conteúdo ═══ */
    section('PLANO DE MELHORIAS - RECOMENDAÇÕES PRIORITÁRIAS');
    if(!parsed.recs.length){
      painel(null,'As recomendações detalhadas não foram geradas nesta execução — a IA não respondeu no formato esperado. '+
                  'Os números de emissões, economia potencial e redução deste relatório foram calculados pelo próprio sistema '+
                  'com os fatores oficiais (MCTI, IPCC, EPE/SEEG) e seguem válidos. Gere o diagnóstico novamente para obter o plano de ações.');
    }else{
      const colGap=5, colW=(CW-10-colGap*2)/3;
      parsed.recs.forEach((r,i)=>{
        const tit=fit(r.titulo||('Recomendação '+(i+1)),F.recTit,CW-10-13,3,7);
        const desc=split(r.descricao||'—',F.recBody,CW-10);
        const mets=[['REDUÇÃO',r.impacto],['INVESTIMENTO',r.investimento],['PAYBACK',r.payback]]
          .map(([l,v])=>({l:l,f:fit(v,F.metVal,colW,4,6)}));
        const metLines=Math.max.apply(null,mets.map(m=>m.f.lines.length));
        const hTit=tit.lines.length*tit.lh;
        const hDesc=desc.length*LH(F.recBody);
        const h=7+hTit+3+hDesc+5+3.8+metLines*3.6+4;
        ensure(h+4);
        const top=y;
        doc.setFillColor(C.panel[0],C.panel[1],C.panel[2]);
        doc.setDrawColor(C.border[0],C.border[1],C.border[2]);doc.setLineWidth(0.3);
        doc.roundedRect(M,top,CW,h,1,1,'FD');
        use(F.recNum);doc.text('0'+(i+1),M+5,top+7);
        drawFit(tit,F.recTit,M+13,top+7);
        const descY=top+7+hTit+3;
        use(F.recBody);desc.forEach((l,li)=>doc.text(l,M+5,descY+li*LH(F.recBody)));
        const metY=descY+hDesc+5;
        mets.forEach((m,ci)=>{
          const cx=M+5+ci*(colW+colGap);
          use(F.metLbl);doc.text(m.l,cx,metY);
          drawFit(m.f,F.metVal,cx,metY+3.8);
        });
        y=top+h+5;
      });
    }

    /* ═══ RETORNO FINANCEIRO ═══ */
    const resumo='Potencial de economia: '+fk(res.econReais)+'/ano · CO2 evitável: '+n(res.co2Red)+
                 ' tCO2/ano. Crédito de carbono é potencial futuro, não valor garantido.';
    painel('RETORNO FINANCEIRO ESTIMADO',(parsed.retorno? parsed.retorno+' ' : '')+resumo);

    /* ═══ IMPACTO EM ESCALA ═══ */
    ensure(30);
    doc.setFillColor(C.ink[0],C.ink[1],C.ink[2]);doc.roundedRect(M,y,CW,24,1,1,'F');
    use({s:7,w:'bold',c:C.lime});doc.text('IMPACTO EM ESCALA',M+5,y+7);
    const impTxt=split('Se 10% das médias indústrias brasileiras implementassem melhorias equivalentes (5.500 empresas):',
                       {s:6.5,w:'normal',c:[167,243,208]},CW-10);
    use({s:6.5,w:'normal',c:[167,243,208]});
    impTxt.slice(0,2).forEach((l,i)=>doc.text(l,M+5,y+12.5+i*3.4));
    drawFit(fit(Math.round(res.co2Red*5500).toLocaleString('pt-BR')+' tCO2/ano evitadas',
                {s:11,w:'bold',c:C.signal},CW-10,1,7),{s:11,w:'bold',c:C.signal},M+5,y+21);
    y+=30;

    /* ═══ ODS ═══ */
    ensure(22);
    const odsW=(CW-gap*2)/3;
    [['ODS 7','Energia Acessível',[244,185,14]],
     ['ODS 9','Indústria e Inovação',[224,90,36]],
     ['ODS 13','Ação Climática',[63,126,68]]
    ].forEach(([num,txt,bg],i)=>{
      const x=M+i*(odsW+gap);
      doc.setFillColor(bg[0],bg[1],bg[2]);doc.roundedRect(x,y,odsW,17,1,1,'F');
      use({s:9,w:'bold',c:C.white});doc.text(num,x+5,y+8);
      drawFit(fit(txt,{s:6.5,w:'normal',c:C.white},odsW-10,1,5),{s:6.5,w:'normal',c:C.white},x+5,y+13.5);
    });
    y+=24;

    /* ═══ NOTA DE METODOLOGIA ═══ */
    painel('METODOLOGIA E LIMITES',
      'Pré-diagnóstico, não auditoria. Estimativas a partir de um conjunto reduzido de dados e de médias setoriais — '+
      'servem para indicar oportunidades e por onde começar, não para dimensionar projetos. Fatores: energia elétrica '+
      '0,0843 kgCO2/kWh (MCTI 2022), diesel 2,676 kgCO2/L, gás natural 2,04 kgCO2/m³, GLP 1,50 kgCO2/L, biomassa '+
      '0,20 kgCO2/kg (IPCC/MCTI), crédito de carbono R$ 75/tCO2 (mercado voluntário 2024). Qualidade dos dados '+
      'deste diagnóstico: '+q.pct+'%.');

    /* ═══ RODAPÉ + NUMERAÇÃO — aplicado a todas as páginas no fim ═══ */
    const totalPaginas=doc.internal.getNumberOfPages();
    for(let p=1;p<=totalPaginas;p++){
      doc.setPage(p);
      doc.setFillColor(C.ink[0],C.ink[1],C.ink[2]);doc.rect(0,284,W,13,'F');
      use({s:6.5,w:'normal',c:C.lime});
      doc.text(split('CarbonTrack — Plano de Melhorias e Diagnóstico Ambiental · Feira de Ciências 2025',{s:6.5,w:'normal',c:C.lime},CW-22)[0],M,290);
      use({s:6.5,w:'normal',c:[82,120,100]});
      doc.text(split('Fontes: SEEG, MCTI, EPE BEN 2022, CNI, IPCC, FAO · Pré-diagnóstico baseado em hipóteses — não substitui auditoria certificada',{s:6.5,w:'normal',c:[82,120,100]},CW-22)[0],M,294.5);
      use({s:7,w:'normal',c:C.lime});
      doc.text('Pág. '+p+'/'+totalPaginas,W-M,290,{align:'right'});
    }

    const nomeArq=pdfTxt(S.emp||'Empresa').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'_').slice(0,40)||'Empresa';
    doc.save('CarbonTrack_'+nomeArq+'_'+new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')+'.pdf');
  }catch(e){
    // Registra a causa real em vez de engolir tudo num catch genérico
    console.error('[CarbonTrack] Falha ao gerar PDF:',e);
    alert('Não foi possível gerar o PDF.\n\nMotivo: '+((e&&e.message)?e.message:e)+
          '\n\nDetalhes técnicos no console do navegador (F12).');
  }finally{
    btn.innerHTML=btnLabel;btn.disabled=false;
  }
}

// ══════════ FECEAP — é só aqui que se mexe no dia da feira ══════════
// ══════════ FECEAP ══════════
function irInicio(){
  pararCronometro();
  showPg('hero');
}
function abrirFeceap(){
  showPg('feceap');
}

document.querySelectorAll('.pg:not(.on)').forEach(p=>p.style.display='none');
