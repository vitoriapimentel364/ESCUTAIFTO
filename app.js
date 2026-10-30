// EscutaIFTO - Aplicação JavaScript
// Projeto Acadêmico - Demonstração Funcional
// Chatbot com protocolo de crise - SEM IA REAL (apenas regras por palavras-chave)

// Estado da aplicação
let currentUser = {
    name: '',
    matricula: '',
    situation: '',
    situationText: ''
};

let tickets = [];
let ticketCounter = 1;

// Estado do chat para protocolo de crise e acolhimento
let chatState = {
    history: [],
    crisisActive: false,
    askedImmediateDanger: false,
    waitingDangerResponse: false,
    waitingClarification: false,
    waitingFrequencyQuestion: false,
    askedFrequency: false,
    riskLevel: 'none',
    inCrisisFlow: false,
    crisisType: null,
    lastCrisisMessage: '',
    currentTopic: null,
    topicAskedDetails: false,
    topicAskedFrequency: false,
    topicAskedSafe: false
};

// Palavras-chave para detecção de crise e triagem
const crisisKeywords = {
    selfHarm: [
        'automutilacao', 'auto-mutilação', 'auto mutilação', 'me corto', 'me cortando',
        'me machuco', 'me machucando', 'me machucar', 'machucar a mim', 'me machucaria',
        'lesionar a mim', 'ferir a mim mesmo', 'ferir a mim',
        'cortar os pulsos', 'cortar-me', 'me ferir', 'autolesao', 'auto-lesão',
        'me queimo', 'me queimando', 'arranho até sangrar', 'bato a cabeça',
        'pensei em me machucar', 'pensando em me machucar'
    ],
    suicide: [
        'quero morrer', 'acabar com tudo', 'tirar minha vida', 'não quero mais viver',
        'vou me matar', 'me matar', 'suicidio', 'suicídio', 'ideação suicida',
        'prefiro morrer', 'melhor morrer', 'não aguento mais viver', 'desaparecer para sempre'
    ],
    violence: [
        'estupro', 'abuso sexual', 'agressão grave', 'ameaça de morte',
        'me bateram', 'estou sendo agredido', 'violência doméstica',
        'estou sendo abusado', 'me forçaram', 'agredido', 'agredida'
    ],
    harassment: [
        'assedio sexual', 'assédio sexual', 'assedio moral', 'assédio moral',
        'tocaram sem consentimento', 'importunação sexual'
    ],
    racism: [
        'racismo', 'preconceito racial', 'xenofobia', 'discriminação racial',
        'apelido racista', 'piada racista', 'ofensa racial'
    ],
    bullying: [
        'bullying', 'intimidação', 'humilhação', 'zoando', 'caçoando',
        'exclusão', 'isolamento intencional'
    ],
    immediateRisk: [
        'agora mesmo', 'neste exato momento', 'com uma faca', 'com arma',
        'sobre uma ponte', 'vou pular', 'tenho remédios', 'tomando remédios'
    ],
    indirectDistress: [
        'não aguento mais', 'não vejo saída', 'não tem mais motivo',
        'todos estariam melhor sem mim', 'ninguém sentiria minha falta',
        'desisto de tudo'
    ]
};

// Mapeamento para sugestão de categoria por triagem (regras por palavras-chave)
function suggestCategory(message) {
    const lowerMsg = message.toLowerCase();
    
    if (crisisKeywords.suicide.some(k => lowerMsg.includes(k)) || 
        crisisKeywords.selfHarm.some(k => lowerMsg.includes(k))) {
        return 'autolesao_risco_suicidio';
    }
    if (crisisKeywords.harassment.some(k => lowerMsg.includes(k))) {
        return 'assedio_moral_sexual';
    }
    if (crisisKeywords.racism.some(k => lowerMsg.includes(k))) {
        return 'racismo_discriminacao';
    }
    if (crisisKeywords.bullying.some(k => lowerMsg.includes(k))) {
        return 'bullying_violencia';
    }
    if (crisisKeywords.violence.some(k => lowerMsg.includes(k))) {
        return 'bullying_violencia';
    }
    if (lowerMsg.includes('triste') || lowerMsg.includes('ansiedade') || lowerMsg.includes('depressão') || 
        lowerMsg.includes('panico') || lowerMsg.includes('pânico')) {
        return 'saude_emocional';
    }
    if (lowerMsg.includes('nota') || lowerMsg.includes('prova') || lowerMsg.includes('reprova') || 
        lowerMsg.includes('matrícula') || lowerMsg.includes('bolsa')) {
        return 'problemas_academicos';
    }
    if (lowerMsg.includes('fome') || lowerMsg.includes('moradia') || lowerMsg.includes('transporte') || 
        lowerMsg.includes('auxílio') || lowerMsg.includes('vulnerável')) {
        return 'vulnerabilidade_social';
    }
    if (lowerMsg.includes('conflito') || lowerMsg.includes('briga') || lowerMsg.includes('desentendimento')) {
        return 'conflitos_convivencia';
    }
    return 'outros';
}

// Sugestão de setor conforme categoria/contexto (regra)
function suggestSector(category, message) {
    const lowerMsg = message.toLowerCase();
    if (category === 'autolesao_risco_suicidio') {
        return 'Psicologia';
    }
    if (category === 'saude_emocional') {
        return 'Psicologia';
    }
    if (category === 'assedio_moral_sexual') {
        return 'Setor institucional responsável por denúncias e proteção';
    }
    if (category === 'racismo_discriminacao') {
        return 'Setor institucional responsável por denúncias e proteção';
    }
    if (category === 'bullying_violencia') {
        return 'Setor institucional responsável por denúncias e proteção';
    }
    if (category === 'vulnerabilidade_social') {
        return 'Assistência estudantil';
    }
    if (category === 'problemas_academicos') {
        return 'Coordenação de curso';
    }
    if (category === 'conflitos_convivencia') {
        return 'Setor pedagógico';
    }
    return 'Outro setor competente';
}

// Determinar prioridade por triagem (baseado em gravidade/urgência, avaliação contextual)
function determinePriority(message, category) {
    const lowerMsg = message.toLowerCase();
    
    // Risco imediato prevalece
    if (crisisKeywords.suicide.some(k => lowerMsg.includes(k)) || 
        crisisKeywords.immediateRisk.some(k => lowerMsg.includes(k))) {
        return { priority: 'urgente', reason: 'Risco imediato relatado (indícios de autolesão/ideação suicida ou situação de perigo imediato).' };
    }
    if (category === 'autolesao_risco_suicidio') {
        return { priority: 'urgente', reason: 'Categoria relacionada a autolesão/risco de suicídio. Requer atenção especial e orientação para ajuda humana emergencial.' };
    }
    
    // Violência com ameaça/risco imediato
    if (crisisKeywords.violence.some(k => lowerMsg.includes(k))) {
        // Considerar contexto: presença de "ameaça", "agora", "perigo"
        if (lowerMsg.includes('ameaça') || lowerMsg.includes('agora') || lowerMsg.includes('imediato') || lowerMsg.includes('perigo')) {
            return { priority: 'urgente', reason: 'Violência com indício de ameaça/risco imediato relatado.' };
        }
        // Violência grave sem ameaça explícita - alta, não necessariamente urgente
        return { priority: 'alta', reason: 'Relato de violência grave. Requer avaliação humana com prioridade.' };
    }
    
    // Assédio - considerar recorrência/gravidade, não classificar automaticamente como urgente
    if (crisisKeywords.harassment.some(k => lowerMsg.includes(k))) {
        if (lowerMsg.includes('repetidas') || lowerMsg.includes('repetidamente') || lowerMsg.includes('todos os dias') || lowerMsg.includes('frequente')) {
            return { priority: 'alta', reason: 'Assédio com indício de recorrência. Requer acompanhamento e avaliação.' };
        }
        if (lowerMsg.includes('ameaça') || lowerMsg.includes('chantagem')) {
            return { priority: 'urgente', reason: 'Assédio com ameaça/chantagem relatado. Risco grave.' };
        }
        return { priority: 'alta', reason: 'Relato de assédio moral/sexual. Requer avaliação cuidadosa.' };
    }
    
    // Racismo/discriminação - não automático urgente, considerar recorrência/gravidade
    if (crisisKeywords.racism.some(k => lowerMsg.includes(k))) {
        if (lowerMsg.includes('repetidas') || lowerMsg.includes('frequente') || lowerMsg.includes('todos os dias') || lowerMsg.includes('ameaça')) {
            return { priority: 'alta', reason: 'Racismo/discriminação com indício de recorrência ou gravidade. Requer acompanhamento.' };
        }
        return { priority: 'media', reason: 'Relato de racismo/discriminação. Requer acolhimento e avaliação.' };
    }
    
    // Bullying
    if (crisisKeywords.bullying.some(k => lowerMsg.includes(k))) {
        if (lowerMsg.includes('repetidas') || lowerMsg.includes('frequente') || lowerMsg.includes('todos os dias')) {
            return { priority: 'alta', reason: 'Bullying recorrente relatado. Requer acompanhamento.' };
        }
        return { priority: 'media', reason: 'Relato de bullying. Requer acolhimento e avaliação.' };
    }
    
    if (category === 'saude_emocional') {
        if (lowerMsg.includes('muito forte') || lowerMsg.includes('desesperado') || lowerMsg.includes('desesperada')) {
            return { priority: 'alta', reason: 'Sofrimento emocional intenso relatado. Requer acolhimento prioritário.' };
        }
        return { priority: 'media', reason: 'Demanda de saúde emocional. Requer acolhimento e possível encaminhamento.' };
    }
    
    if (category === 'vulnerabilidade_social') {
        return { priority: 'alta', reason: 'Situação de vulnerabilidade social com impacto nos estudos. Requer apoio da Assistência Estudantil.' };
    }
    
    if (category === 'problemas_academicos') {
        return { priority: 'media', reason: 'Demanda acadêmica. Requer orientação pedagógica/coordenação conforme necessidade.' };
    }
    
    if (category === 'conflitos_convivencia') {
        return { priority: 'media', reason: 'Conflito de convivência. Requer mediação e acompanhamento conforme gravidade.' };
    }
    
    return { priority: 'baixa', reason: 'Orientação/demanda sem risco imediato evidente. Requer acolhimento.' };
}

// Mensagens do chatbot
const botMessages = {
    initial: [
        "Olá! Seja muito bem-vindo(a) ao EscutaIFTO. 💚",
        "Meu nome é Assistente Virtual do EscutaIFTO. Estou aqui para te acolher com respeito e sem julgamentos.",
        "Antes de começar, gostaria que soubesse: eu não me apresento como psicóloga, não diagnostico e as decisões sobre providências pertencem aos profissionais responsáveis.",
        "Este é um sistema demonstrativo, sem IA real. Não substituo atendimento humano qualificado.",
        "Vamos conversar com calma. Como posso te ajudar hoje?"
    ],
    aconteceu_comigo: [
        "Sinto muito que você esteja passando por isso. Você tem toda razão em buscar apoio.",
        "Pode me contar com suas próprias palavras: o que aconteceu exatamente?",
        "Se preferir, pode ir aos poucos. Não precisa relatar tudo de uma vez."
    ],
    presenciei: [
        "Obrigada por ter a coragem de relatar isso. É importante falar sobre situações que afetam outras pessoas também.",
        "Pode me contar: quem foi envolvido? Quando aconteceu?",
        "Você se sente seguro(a) para continuar essa conversa?"
    ],
    orientacao: [
        "Você fez a escolha certa em buscar orientação. Estou aqui para te ajudar.",
        "Pode me dizer qual dúvida ou situação você gostaria de entender melhor?",
        "Vamos juntos pensar nas melhores opções de apoio."
    ]
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeChat();
    initializeCaseForm();
    initializeAdmin();
    initializeModals();
    resetChatState();
});

function resetChatState() {
    chatState = {
        history: [],
        crisisActive: false,
        askedImmediateDanger: false,
        waitingDangerResponse: false,
        waitingClarification: false,
        waitingFrequencyQuestion: false,
        askedFrequency: false,
        riskLevel: 'none',
        inCrisisFlow: false,
        crisisType: null,
        lastCrisisMessage: '',
        currentTopic: null,
        topicAskedDetails: false,
        topicAskedFrequency: false,
        topicAskedSafe: false
    };
}

// Navegação Mobile
function initializeNavigation() {
    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
}

// Inicialização do Chat
function initializeChat() {
    const situationBtns = document.querySelectorAll('.situation__btn');
    const startChatBtn = document.getElementById('startChatBtn');
    
    situationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            situationBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentUser.situation = this.dataset.situation;
            
            switch(currentUser.situation) {
                case 'comigo':
                    currentUser.situationText = 'Aconteceu comigo';
                    break;
                case 'presenciei':
                    currentUser.situationText = 'Presenciei uma situação';
                    break;
                case 'orientacao':
                    currentUser.situationText = 'Quero orientação';
                    break;
            }
        });
    });
    
    if (startChatBtn) {
        startChatBtn.addEventListener('click', function() {
            const nameInput = document.getElementById('studentName');
            const matInput = document.getElementById('studentMat');
            
            if (!nameInput.value.trim()) {
                alert('Por favor, informe um nome fictício.');
                nameInput.focus();
                return;
            }
            
            if (!matInput.value.trim()) {
                alert('Por favor, informe uma matrícula fictícia.');
                matInput.focus();
                return;
            }
            
            if (!currentUser.situation) {
                alert('Por favor, selecione sobre o que você quer conversar.');
                return;
            }
            
            currentUser.name = nameInput.value.trim();
            currentUser.matricula = matInput.value.trim();
            
            resetChatState();
            
            // Remover botão "Fazer novo relato" se existir
            const existingNewBtn = document.getElementById('newReportBtn');
            if (existingNewBtn) {
                existingNewBtn.remove();
            }
            
            document.getElementById('identification').style.display = 'none';
            document.getElementById('chatContainer').style.display = 'block';
            
            document.getElementById('chatUserName').textContent = currentUser.name;
            document.getElementById('chatUserMat').textContent = currentUser.matricula;
            document.getElementById('chatSituation').textContent = currentUser.situationText;
            
            document.getElementById('chatMessages').innerHTML = '';
            startBotConversation();
        });
    }
    
    const sendBtn = document.getElementById('sendMessageBtn');
    const messageInput = document.getElementById('userMessageInput');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendUserMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendUserMessage();
            }
        });
    }
    
    const registerBtn = document.getElementById('registerCaseBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            openCaseForm();
        });
    }
    
    const urgentBtn = document.getElementById('urgentBtn');
    if (urgentBtn) {
        urgentBtn.addEventListener('click', function() {
            showUrgentModal();
        });
    }
}

function startBotConversation() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    
    let delay = 0;
    
    botMessages.initial.forEach(msg => {
        setTimeout(() => {
            addBotMessage(msg);
        }, delay);
        delay += 1000;
    });
    
    setTimeout(() => {
        const situationMessages = botMessages[currentUser.situation === 'comigo' ? 'aconteceu_comigo' : 
                                                  currentUser.situation === 'presenciei' ? 'presenciei' : 'orientacao'];
        situationMessages.forEach((msg, index) => {
            setTimeout(() => {
                addBotMessage(msg);
            }, index * 1200);
        });
    }, delay + 500);
}

function addBotMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message message--bot';
    messageDiv.innerHTML = `
        <div>${message}</div>
        <span class="message__time">${getCurrentTime()}</span>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Detectar crise
function detectCrisis(message) {
    const lowerMsg = message.toLowerCase();
    
    // Verificar ideação suicida primeiro
    for (let keyword of crisisKeywords.suicide) {
        if (lowerMsg.includes(keyword)) {
            return { type: 'suicide', level: 'immediate' };
        }
    }
    
    // Verificar automutilação - mais amplo, sem exigir "eu" se já tem "me machucar"
    for (let keyword of crisisKeywords.selfHarm) {
        if (lowerMsg.includes(keyword)) {
            // Ativar protocolo se for relato pessoal ou situação "Aconteceu comigo"
            if (lowerMsg.includes('eu') || lowerMsg.includes('estou') || lowerMsg.includes('me ') || 
                lowerMsg.includes('pensei') || currentUser.situation === 'comigo' || 
                currentUser.situation === '') {
                return { type: 'selfHarm', level: 'high' };
            }
        }
    }
    
    // Verificação adicional específica para "me machucar"
    if ((lowerMsg.includes('me machucar') || lowerMsg.includes('machucar')) && 
        (lowerMsg.includes('pensei') || lowerMsg.includes('queria') || lowerMsg.includes('vou'))) {
        return { type: 'selfHarm', level: 'high' };
    }
    
    // Verificar violência grave
    for (let keyword of crisisKeywords.violence) {
        if (lowerMsg.includes(keyword)) {
            return { type: 'violence', level: 'high' };
        }
    }
    
    // Verificar risco imediato
    for (let keyword of crisisKeywords.immediateRisk) {
        if (lowerMsg.includes(keyword)) {
            return { type: 'immediateRisk', level: 'immediate' };
        }
    }
    
    // Verificar sofrimento indireto
    for (let keyword of crisisKeywords.indirectDistress) {
        if (lowerMsg.includes(keyword) && (lowerMsg.includes('eu') || currentUser.situation === 'comigo')) {
            return { type: 'distress', level: 'moderate' };
        }
    }
    
    return null;
}

// Avaliar resposta sobre perigo imediato
function evaluateDangerResponse(message) {
    const lowerMsg = message.toLowerCase().trim();
    
    if ((lowerMsg.includes('não') || lowerMsg.includes('nao')) && 
        (lowerMsg.includes('estou em perigo') || lowerMsg.includes('risco agora') || 
         lowerMsg.includes('perigo imediato') || lowerMsg.includes('em risco'))) {
        return { type: 'ambiguous', confidence: 'low' };
    }
    
    const ambiguousPhrases = ['talvez', 'não sei', 'nao sei', 'não tenho certeza', 'nao tenho certeza', 
                             'depende', 'meio', 'mais ou menos'];
    
    if (ambiguousPhrases.some(phrase => lowerMsg.includes(phrase))) {
        return { type: 'ambiguous', confidence: 'low' };
    }
    
    if ((lowerMsg.includes('sim') && (lowerMsg.includes('não') || lowerMsg.includes('nao')))) {
        return { type: 'ambiguous', confidence: 'low' };
    }
    
    if (lowerMsg === 'sim' || lowerMsg === 's') {
        return { type: 'yes', confidence: 'high' };
    }
    if (lowerMsg.startsWith('sim,')) {
        return { type: 'yes', confidence: 'high' };
    }
    
    if (lowerMsg === 'não' || lowerMsg === 'nao' || lowerMsg === 'n') {
        return { type: 'no', confidence: 'high' };
    }
    if ((lowerMsg.startsWith('não,') || lowerMsg.startsWith('nao,')) && !lowerMsg.includes('sim')) {
        return { type: 'no', confidence: 'high' };
    }
    
    if (lowerMsg.includes('não sei') || lowerMsg.includes('nao sei') || lowerMsg.includes('talvez')) {
        return { type: 'ambiguous', confidence: 'low' };
    }
    
    return { type: 'unclear', confidence: 'low' };
}

function sendUserMessage() {
    const messageInput = document.getElementById('userMessageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chatMessages');
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message message--user';
    userMessageDiv.innerHTML = `
        <div>${escapeHtml(message)}</div>
        <span class="message__time">${getCurrentTime()}</span>
    `;
    chatMessages.appendChild(userMessageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    chatState.history.push({ role: 'user', message: message, time: getCurrentTime() });
    
    messageInput.value = '';
    
    if (chatState.waitingClarification) {
        chatState.waitingClarification = false;
        handleClarificationResponse(message);
        return;
    }
    
    if (chatState.waitingDangerResponse) {
        handleCrisisResponse(message);
        return;
    }
    
    if (chatState.waitingFrequencyQuestion) {
        chatState.waitingFrequencyQuestion = false;
        setTimeout(() => {
            addBotMessage("Obrigada por compartilhar isso. Esse sofrimento merece atenção, independentemente da frequência.");
        }, 500);
        setTimeout(() => {
            addBotMessage("O protocolo de acolhimento continua ativo. Você gostaria de continuar conversando ou prefere orientação sobre como buscar apoio com os profissionais responsáveis ou setor responsável do IFTO?");
        }, 1500);
        setTimeout(() => {
            addBotMessage("Lembre-se: eu não diagnostico nem substituo atendimento profissional. Você pode registrar um caso com prioridade urgente quando se sentir pronto(a) clicando em '📝 Registrar Caso'.");
        }, 2500);
        return;
    }
    
    const crisisDetection = detectCrisis(message);
    
    if (crisisDetection) {
        if (!chatState.crisisActive) {
            activateCrisisProtocol(crisisDetection);
            return;
        } else {
            continueCrisisProtocol(message, crisisDetection);
            return;
        }
    }
    
    if (chatState.crisisActive && chatState.inCrisisFlow) {
        continueCrisisProtocol(message, null);
        return;
    }
    
    setTimeout(() => {
        handleNormalResponse(message);
    }, 800);
}

function activateCrisisProtocol(crisisDetection) {
    chatState.crisisActive = true;
    chatState.inCrisisFlow = true;
    chatState.riskLevel = crisisDetection.level;
    chatState.crisisType = crisisDetection.type;
    
    setTimeout(() => {
        addBotMessage("Você tem coragem em falar isso. Eu te acolho com respeito e sem julgamentos. Isso não é sua culpa.");
    }, 500);
    
    setTimeout(() => {
        addBotMessage("Eu não sou psicóloga(o), não faço diagnósticos e não substituo atendimento humano qualificado. As decisões sobre providências pertencem aos profissionais responsáveis.");
    }, 1500);
    
    setTimeout(() => {
        addBotMessage("As informações aqui devem ser tratadas com privacidade, respeitando os limites e procedimentos institucionais. **Não posso prometer sigilo absoluto.** Em situações que envolvam risco grave ou iminente, pode ser necessário que profissionais responsáveis tomem conhecimento para garantir sua segurança ou a de terceiros.");
    }, 2500);
    
    setTimeout(() => {
        addBotMessage("Para te orientar da melhor forma: **Você está em perigo imediato AGORA? Precisa de atendimento médico neste momento?** Responda de forma clara - sim ou não. Se sua resposta for ambígua, vou pedir um esclarecimento.");
        chatState.waitingDangerResponse = true;
        chatState.askedImmediateDanger = true;
    }, 3500);
}

function handleCrisisResponse(message) {
    chatState.waitingDangerResponse = false;
    const evaluation = evaluateDangerResponse(message);
    
    if (evaluation.type === 'ambiguous' || evaluation.type === 'unclear') {
        setTimeout(() => {
            addBotMessage("Não consegui entender com clareza. Vou te perguntar novamente de forma mais direta:");
        }, 500);
        
        setTimeout(() => {
            addBotMessage("**Existe algum risco imediato à sua vida ou integridade física neste exato momento?** Responda apenas 'sim' ou 'não'. Se sua resposta for ambígua, por precaução vou te orientar a buscar ajuda humana urgente.");
            chatState.waitingDangerResponse = true;
        }, 1500);
        return;
    }
    
    if (evaluation.type === 'yes') {
        setTimeout(() => {
            addBotMessage("Entendo. Em situação de risco imediato, sua segurança é prioridade.");
        }, 500);
        
        setTimeout(() => {
            addBotMessage("🚨 **ORIENTAÇÃO DE EMERGÊNCIA:** Procure ajuda humana urgente agora. Caso haja risco de morte iminente, ligue para o **SAMU (192)** ou dirija-se ao pronto-socorro mais próximo.");
        }, 1500);
        
        setTimeout(() => {
            addBotMessage("Também é importante acionar os canais de atendimento da instituição (Serviço de Atendimento ao Estudante, Segurança ou Ouvidoria) assim que for seguro para você.");
        }, 2500);
        
        setTimeout(() => {
            addBotMessage("Ofereço **encaminhamento para os profissionais responsáveis da instituição**. Você pode registrar este caso no formulário - ele será marcado como prioritário para análise. **Importante:** Eu não envio este encaminhamento automaticamente, pois não há integração real. A decisão sobre providências cabe aos profissionais responsáveis.");
        }, 3500);
        
        setTimeout(() => {
            addBotMessage("Você gostaria de continuar conversando comigo enquanto pensa sobre isso? Ou prefere ir direto para registrar o caso clicando em '📝 Registrar Caso'?");
        }, 4500);
    } else if (evaluation.type === 'no') {
        chatState.crisisActive = true;
        chatState.inCrisisFlow = true;
        chatState.waitingFrequencyQuestion = true;
        chatState.askedFrequency = true;
        chatState.waitingDangerResponse = false;
        
        setTimeout(() => {
            addBotMessage("Entendi. Mesmo que não exista perigo imediato agora, o que você está sentindo merece atenção e cuidado.");
        }, 500);
        
        setTimeout(() => {
            addBotMessage("O protocolo de acolhimento **continua ativo**. Não vou encerrar essa conversa.");
        }, 1500);
        
        setTimeout(() => {
            addBotMessage("Você tem pensado em se machucar com frequência? Ou foi uma situação pontual?");
        }, 2500);
        
        setTimeout(() => {
            addBotMessage("Lembre-se: eu não diagnostico e não substituo atendimento profissional. É importante buscar orientação com um profissional qualificado ou com o setor responsável do IFTO. Caso a situação mude e haja risco imediato, me avise sem demora.");
        }, 3500);
    }
}

function handleClarificationResponse(message) {
    const evaluation = evaluateDangerResponse(message);
    
    if (evaluation.type === 'ambiguous' || evaluation.type === 'unclear') {
        setTimeout(() => {
            addBotMessage("Por precaução, vou te orientar a buscar ajuda humana urgentemente, já que não ficou claro sobre risco imediato.");
        }, 500);
        
        setTimeout(() => {
            addBotMessage("🚨 Caso haja qualquer risco, ligue para o **SAMU (192)** ou procure o pronto-socorro mais próximo. Acione também os canais da instituição.");
        }, 1500);
        
        setTimeout(() => {
            addBotMessage("O protocolo continua ativo. Vamos conversar - você pode me dizer com suas palavras como está se sentindo agora?");
            chatState.inCrisisFlow = true;
            chatState.crisisActive = true;
        }, 2500);
        return;
    }
    
    if (evaluation.type === 'yes') {
        handleCrisisResponse(message);
    } else {
        handleCrisisResponse(message);
    }
}

function continueCrisisProtocol(message, crisisDetection) {
    if (chatState.waitingFrequencyQuestion) {
        chatState.waitingFrequencyQuestion = false;
        setTimeout(() => {
            addBotMessage("Obrigada por compartilhar isso. Esse sofrimento merece atenção, independentemente da frequência.");
        }, 500);
        setTimeout(() => {
            addBotMessage("O protocolo de acolhimento continua ativo. Você gostaria de continuar conversando ou prefere orientação sobre como buscar apoio com os profissionais responsáveis ou setor responsável do IFTO?");
        }, 1500);
        setTimeout(() => {
            addBotMessage("Lembre-se: eu não diagnostico nem substituo atendimento profissional. Você pode registrar um caso com prioridade urgente quando se sentir pronto(a).");
        }, 2500);
        return;
    }
    
    if (crisisDetection && crisisDetection.level === 'immediate') {
        setTimeout(() => {
            addBotMessage("Vejo que a situação permanece grave. **Você está em perigo imediato agora?** Responda 'sim' ou 'não'.");
            chatState.waitingDangerResponse = true;
        }, 500);
        return;
    }
    
    setTimeout(() => {
        addBotMessage("Estou te ouvindo. O protocolo de acolhimento continua ativo. Continue no seu ritmo, sem pressa.");
    }, 500);
    
    if (!chatState.askedFrequency) {
        setTimeout(() => {
            addBotMessage("Você ainda se sente em perigo imediato agora? Se sim, me diga claramente para te orientar com urgência.");
            chatState.waitingDangerResponse = true;
        }, 1500);
    } else {
        setTimeout(() => {
            addBotMessage("Você gostaria de falar mais sobre como tem se sentido? Estou aqui para te acolher.");
        }, 1500);
    }
}

function classifyTopic(message) {
    const lowerMsg = message.toLowerCase();
    if (crisisKeywords.racism.some(k => lowerMsg.includes(k))) return 'racismo';
    if (crisisKeywords.harassment.some(k => lowerMsg.includes(k))) return 'assedio';
    if (crisisKeywords.bullying.some(k => lowerMsg.includes(k))) return 'bullying';
    if (crisisKeywords.violence.some(k => lowerMsg.includes(k))) return 'violencia';
    if (crisisKeywords.suicide.some(k => lowerMsg.includes(k)) || crisisKeywords.selfHarm.some(k => lowerMsg.includes(k))) return 'crise';
    if (lowerMsg.includes('triste') || lowerMsg.includes('ansiedade') || lowerMsg.includes('depressão') || lowerMsg.includes('panico') || lowerMsg.includes('pânico') || lowerMsg.includes('angustia') || lowerMsg.includes('angústia')) return 'saude_emocional';
    if (lowerMsg.includes('nota') || lowerMsg.includes('prova') || lowerMsg.includes('reprova') || lowerMsg.includes('matrícula') || lowerMsg.includes('bolsa') || lowerMsg.includes('falta') || lowerMsg.includes('professor')) return 'academico';
    if (lowerMsg.includes('conflito') || lowerMsg.includes('briga') || lowerMsg.includes('desentendimento') || lowerMsg.includes('convivência') || lowerMsg.includes('convivencia')) return 'convivencia';
    if (lowerMsg.includes('fome') || lowerMsg.includes('moradia') || lowerMsg.includes('transporte') || lowerMsg.includes('auxílio') || lowerMsg.includes('auxilio') || lowerMsg.includes('vulnerável') || lowerMsg.includes('vulneravel')) return 'vulnerabilidade';
    return 'outros';
}

function handleNormalResponse(message) {
    const lowerMsg = message.toLowerCase();
    const topic = classifyTopic(message);
    
    if (lowerMsg.includes('obrigad') || lowerMsg.includes('valeu')) {
        addBotMessage("De nada. Estou aqui para te acolher. Se precisar, continue falando.");
        return;
    }
    
    if (lowerMsg.includes('não sei') || lowerMsg.includes('tenho medo') || lowerMsg.includes('receio')) {
        addBotMessage("Tudo bem não saber por onde começar ou sentir medo. Você tem coragem em buscar apoio. Pode me contar aos poucos, da forma que se sentir mais confortável. O relato é livre, mesmo que não saiba identificar a categoria.");
        return;
    }
    
    if (lowerMsg.includes('sozinho') || lowerMsg.includes('sozinha')) {
        addBotMessage("Você não está sozinho(a). Buscar apoio já é um passo importante e corajoso. Estou te ouvindo sem julgamentos.");
        return;
    }
    
    if (lowerMsg.includes('culpa') || lowerMsg.includes('mereci')) {
        addBotMessage("Escute isso com atenção: o que aconteceu não é sua culpa. Ninguém merece passar por racismo, assédio, bullying, violência ou qualquer tipo de agressão. Você tem razão em buscar ajuda.");
        return;
    }
    
    // Respostas contextualizadas por categoria
    if (topic === 'racismo' && !chatState.topicAskedDetails) {
        chatState.currentTopic = 'racismo';
        chatState.topicAskedDetails = true;
        setTimeout(() => {
            addBotMessage("Sinto muito que você esteja passando por isso. Comentários racistas são uma forma de discriminação e devem ser levados a sério. Isso não é sua culpa.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Se se sentir confortável, pode me contar um pouco mais: isso acontece com frequência? Foi dito na sua frente ou por trás? Você se sente seguro(a) na sua turma?");
        }, 1500);
        return;
    } else if (topic === 'racismo' && chatState.topicAskedDetails) {
        setTimeout(() => {
            addBotMessage("Obrigada por compartilhar isso comigo. Obrigado(a) por confiar nesse espaço. Você não precisa enfrentar isso sozinho(a).");
        }, 500);
        setTimeout(() => {
            addBotMessage("Podemos organizar seu relato para que você possa buscar apoio na instituição. Você gostaria de registrar essa situação, ou prefere apenas orientação por enquanto?");
        }, 1500);
        return;
    }
    
    if (topic === 'assedio' && !chatState.topicAskedDetails) {
        chatState.currentTopic = 'assedio';
        chatState.topicAskedDetails = true;
        setTimeout(() => {
            addBotMessage("Sinto muito que isso esteja acontecendo com você. Assédio moral ou sexual nunca é sua culpa. Sua segurança e dignidade são importantes.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Se puder, me conta: aconteceu com você ou presenciou? Foi uma vez ou mais vezes? Você está em segurança agora?");
        }, 1500);
        return;
    } else if (topic === 'assedio' && chatState.topicAskedDetails) {
        setTimeout(() => {
            addBotMessage("Obrigada por ter coragem de falar sobre isso. Eu não minimizo e não julgo. Isso precisa ser levado a sério.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Podemos organizar as informações para apoio. Você gostaria de registrar o caso ou prefere orientação sobre como agir?");
        }, 1500);
        return;
    }
    
    if (topic === 'bullying' && !chatState.topicAskedDetails) {
        chatState.currentTopic = 'bullying';
        chatState.topicAskedDetails = true;
        setTimeout(() => {
            addBotMessage("Sinto muito que você esteja vivendo isso. Bullying causa sofrimento e não deve ser normalizado. Você não tem culpa.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Me conta com suas palavras: o que tem acontecido? Com que frequência? Você se sente seguro(a) agora?");
        }, 1500);
        return;
    } else if (topic === 'bullying' && chatState.topicAskedDetails) {
        setTimeout(() => {
            addBotMessage("Obrigada por compartilhar. Isso merece atenção e cuidado. Você não está sozinho(a).");
        }, 500);
        setTimeout(() => {
            addBotMessage("Podemos registrar esse caso para buscar apoio adequado. Gostaria de fazer isso agora ou prefere conversar mais um pouco?");
        }, 1500);
        return;
    }
    
    if (topic === 'violencia' && !chatState.topicAskedDetails) {
        chatState.currentTopic = 'violencia';
        chatState.topicAskedDetails = true;
        setTimeout(() => {
            addBotMessage("Sinto muito que você esteja passando por essa situação. Violência nunca é sua culpa. Sua integridade física e emocional são prioridade.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Você está em segurança neste momento? Precisa de ajuda imediata? Se houver risco imediato, vou te orientar para buscar ajuda humana agora.");
        }, 1500);
        return;
    } else if (topic === 'violencia' && chatState.topicAskedDetails) {
        setTimeout(() => {
            addBotMessage("Obrigada por confiar nesse espaço. É importante cuidar da sua segurança.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Podemos organizar seu relato. Você gostaria de registrar esse caso ou prefere orientação sobre os canais de apoio?");
        }, 1500);
        return;
    }
    
    if (topic === 'saude_emocional' && !chatState.topicAskedDetails) {
        chatState.currentTopic = 'saude_emocional';
        chatState.topicAskedDetails = true;
        setTimeout(() => {
            addBotMessage("Sinto muito que você esteja se sentindo assim. Seus sentimentos são válidos. Você não precisa enfrentar isso sozinho(a).");
        }, 500);
        setTimeout(() => {
            addBotMessage("Quer me contar um pouco mais? O que tem pesado mais nesses últimos dias? Você tem alguém com quem possa contar agora?");
        }, 1500);
        return;
    } else if (topic === 'saude_emocional' && chatState.topicAskedDetails) {
        setTimeout(() => {
            addBotMessage("Obrigada por compartilhar isso. Cuidar da saúde emocional é importante e corajoso.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Podemos pensar juntos em apoio. Se sentir necessidade, você pode registrar um caso ou buscar apoio com os profissionais da instituição.");
        }, 1500);
        return;
    }
    
    if (topic === 'academico' && !chatState.topicAskedDetails) {
        chatState.currentTopic = 'academico';
        chatState.topicAskedDetails = true;
        setTimeout(() => {
            addBotMessage("Entendo que isso está te afetando. Problemas acadêmicos também merecem acolhimento e podem impactar seu bem-estar.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Me conta: qual situação está te preocupando? É com alguma disciplina, frequência, bolsa ou outra questão?");
        }, 1500);
        return;
    } else if (topic === 'academico' && chatState.topicAskedDetails) {
        setTimeout(() => {
            addBotMessage("Obrigada por explicar. Vamos ver juntos as opções de apoio.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Você gostaria de organizar isso para registro ou prefere apenas orientação por enquanto?");
        }, 1500);
        return;
    }
    
    if (topic === 'convivencia' && !chatState.topicAskedDetails) {
        chatState.currentTopic = 'convivencia';
        chatState.topicAskedDetails = true;
        setTimeout(() => {
            addBotMessage("Conflitos de convivência podem ser estressantes. Vamos conversar com calma e sem julgamentos.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Me conta: o que aconteceu? Isso envolve outras pessoas? Está afetando seu dia a dia?");
        }, 1500);
        return;
    } else if (topic === 'convivencia' && chatState.topicAskedDetails) {
        setTimeout(() => {
            addBotMessage("Obrigada por compartilhar. Às vezes conversar já ajuda. Vamos pensar em caminhos para melhorar essa situação.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Gostaria de registrar ou só conversar por enquanto?");
        }, 1500);
        return;
    }
    
    if (topic === 'vulnerabilidade' && !chatState.topicAskedDetails) {
        chatState.currentTopic = 'vulnerabilidade';
        chatState.topicAskedDetails = true;
        setTimeout(() => {
            addBotMessage("Sinto muito que você esteja passando por essa dificuldade. Questões como moradia, transporte ou alimentação merecem acolhimento.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Me conta: qual necessidade precisa de apoio agora? Isso está te impedindo de seguir com seus estudos?");
        }, 1500);
        return;
    } else if (topic === 'vulnerabilidade' && chatState.topicAskedDetails) {
        setTimeout(() => {
            addBotMessage("Obrigada por confiar. Existem possibilidades de apoio na instituição. Vamos organizar seu relato para buscar orientação adequada.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Você gostaria de registrar esse caso?");
        }, 1500);
        return;
    }
    
    if (topic === 'outros' && !chatState.topicAskedDetails) {
        chatState.currentTopic = 'outros';
        chatState.topicAskedDetails = true;
        setTimeout(() => {
            addBotMessage("Estou aqui para te acolher. Pode me contar livremente sua situação, mesmo que não saiba em qual categoria se encaixa.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Aconteceu com você, presenciou ou é uma dúvida/orientação? O que você gostaria de conversar?");
        }, 1500);
        return;
    } else if (topic === 'outros' && chatState.topicAskedDetails) {
        setTimeout(() => {
            addBotMessage("Obrigada por compartilhar. Vou te ouvir com atenção.");
        }, 500);
        setTimeout(() => {
            addBotMessage("Se quiser, podemos organizar as informações para registro. Caso precise de orientação, estou aqui.");
        }, 1500);
        return;
    }
    
    // Fallback genérico
    const responses = [
        "Obrigada por compartilhar isso comigo. Estou ouvindo com atenção, respeito e sem julgamentos.",
        "Você tem coragem em falar sobre isso. Isso não é sua culpa.",
        "Entendo. Pode me contar mais detalhes, no seu ritmo?",
        "Estou aqui para te apoiar. Se preferir, diga se aconteceu com você, se presenciou ou se é apenas orientação.",
        "Suas palavras são importantes. Podemos organizar isso para registro se você quiser."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addBotMessage(randomResponse);
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Formulário de Caso
function initializeCaseForm() {
    const registerBtn = document.getElementById('registerCaseBtn');
    const cancelBtn = document.getElementById('cancelCaseBtn');
    const caseForm = document.getElementById('caseForm');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            document.getElementById('caseFormSection').style.display = 'none';
            document.getElementById('chat').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    if (caseForm) {
        caseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateTicket();
        });
    }
}

function openCaseForm() {
    if (!currentUser.name || !currentUser.matricula) {
        alert('Por favor, inicie uma conversa primeiro na seção "Conversar".\n\nÉ necessário preencher nome, matrícula e selecionar a situação.');
        document.getElementById('chat').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    document.getElementById('caseName').value = currentUser.name;
    document.getElementById('caseMat').value = currentUser.matricula;
    document.getElementById('caseSituation').value = currentUser.situationText;
    
    document.getElementById('caseDescription').value = '';
    document.getElementById('caseCategory').value = '';
    document.getElementById('casePriority').value = '';
    document.getElementById('caseReferral').value = '';
    
    if (chatState.crisisActive) {
        document.getElementById('casePriority').value = 'urgente';
    } else {
        // Sugestão de triagem por regras (sem IA)
        const desc = document.getElementById('caseDescription').value || '';
        const cat = suggestCategory(desc);
        const prio = determinePriority(desc, cat);
        // Mapear categoria sugerida para valor do select
        const catSelect = document.getElementById('caseCategory');
        if (catSelect && cat && catSelect.querySelector(`option[value="${cat}"]`)) {
            catSelect.value = cat;
        }
        const prioSelect = document.getElementById('casePriority');
        if (prioSelect && prio) {
            if (prio === 'urgente') prioSelect.value = 'urgente';
            else if (prio === 'alta') prioSelect.value = 'alta';
            else if (prio === 'media') prioSelect.value = 'media';
            else prioSelect.value = 'baixa';
        }
    }
    
    document.getElementById('caseFormSection').style.display = 'block';
    document.getElementById('caseFormSection').scrollIntoView({ behavior: 'smooth' });
}

function generateTicket() {
    const description = document.getElementById('caseDescription').value;
    const category = document.getElementById('caseCategory').value;
    const priority = document.getElementById('casePriority').value;
    const referral = document.getElementById('caseReferral').value;
    
    if (!description || !category || !priority) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    const ticketNumber = `ESC-2024-${String(ticketCounter).padStart(3, '0')}`;
    ticketCounter++;
    
    const categoryMap = {
        'racismo_discriminacao': 'Racismo e discriminação',
        'bullying_violencia': 'Bullying e violência',
        'assedio_moral_sexual': 'Assédio moral e sexual',
        'saude_emocional': 'Saúde emocional',
        'autolesao_risco_suicidio': 'Autolesão e risco de suicídio',
        'problemas_academicos': 'Problemas acadêmicos',
        'conflitos_convivencia': 'Conflitos de convivência',
        'vulnerabilidade_social': 'Vulnerabilidade social',
        'outros': 'Outros assuntos'
    };
    
    const priorityMap = {
        'baixa': 'Baixa',
        'media': 'Média',
        'alta': 'Alta',
        'urgente': 'Urgente'
    };
    
    // Aplicar triagem com regras transparentes - considerar histórico da conversa
    const contextForTriage = [
        currentUser.situationText || '',
        description,
        chatState.lastCrisisMessage || '',
        ...(chatState.history || []).map(h => h.message || '')
    ].join(' ');
    
    const triage = determinePriority(contextForTriage, category);
    const suggestedSector = suggestSector(category, contextForTriage);
    
    const ticket = {
        number: ticketNumber,
        name: currentUser.name,
        matricula: currentUser.matricula,
        situation: currentUser.situationText,
        description: description,
        category: categoryMap[category],
        categoryKey: category,
        priority: priorityMap[priority] || triage.priority.charAt(0).toUpperCase() + triage.priority.slice(1),
        priorityKey: priority || triage.priority,
        classificationReason: triage.reason,
        suggestedSector: suggestedSector,
        sector: suggestedSector,
        referral: referral || 'Aguardando análise dos profissionais responsáveis',
        responsible: 'Coordenação de Assistência Estudantil (fictício)',
        status: (priority === 'urgente' || triage.priority === 'urgente') ? 'Urgente' : 'Aberto',
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        providencias: 'Aguardando análise e providências dos profissionais responsáveis',
        contextoInicial: contextForTriage.substring(0, 500),
        acompanhamento: [
            { date: new Date().toLocaleDateString('pt-BR'), time: getCurrentTime(), action: `Ticket criado e registrado no sistema (simulado). Triagem baseada em regras (considerando relato inicial + descrição): ${triage.reason} Setor sugerido: ${suggestedSector}.` }
        ],
        crisisRelated: chatState.crisisActive || category === 'autolesao_risco_suicidio'
    };
    
    tickets.push(ticket);
    
    document.getElementById('caseFormSection').style.display = 'none';
    
    updateTicketsList();
    updateAdminPanel();
    
    alert(`Ticket ${ticketNumber} gerado com sucesso!\n\nProtocolo: ${ticketNumber}\nStatus: ${ticket.status}\nPrioridade: ${ticket.priority}\n\nO ticket foi registrado no sistema demonstrativo.\n\n**Nota:** Não houve envio real para profissionais. A classificação e providências dependem da análise humana.`);
    
    // Adicionar botão "Fazer novo relato" na área de chat
    const chatActions = document.querySelector('.chat__actions');
    if (chatActions) {
        // Remover botão existente se houver
        const existingNewBtn = document.getElementById('newReportBtn');
        if (existingNewBtn) {
            existingNewBtn.remove();
        }
        const newReportBtn = document.createElement('button');
        newReportBtn.className = 'action__btn';
        newReportBtn.id = 'newReportBtn';
        newReportBtn.innerHTML = '🔄 Fazer novo relato';
        newReportBtn.onclick = startNewReport;
        chatActions.appendChild(newReportBtn);
    }
    
    document.getElementById('tickets').scrollIntoView({ behavior: 'smooth' });
}

function updateTicketsList() {
    const ticketsList = document.getElementById('ticketsList');
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = '<p class="no__tickets">Nenhum ticket registrado ainda.</p>';
        return;
    }
    
    ticketsList.innerHTML = '';
    
    tickets.slice().reverse().forEach(ticket => {
        const ticketCard = document.createElement('div');
        ticketCard.className = 'ticket__card';
        
        let statusClass = 'status__aberto';
        if (ticket.status === 'Em Andamento') statusClass = 'status__andamento';
        if (ticket.status === 'Concluído') statusClass = 'status__concluido';
        if (ticket.status === 'Urgente') statusClass = 'status__andamento';
        
        ticketCard.innerHTML = `
            <div class="ticket__header">
                <span class="ticket__number">${ticket.number}</span>
                <span class="ticket__status ${statusClass}">${ticket.status}</span>
            </div>
            <div class="ticket__info">
                <div><strong>Data:</strong> ${ticket.date} às ${ticket.time}</div>
                <div><strong>Estudante:</strong> ${ticket.name}</div>
                <div><strong>Matrícula:</strong> ${ticket.matricula}</div>
                <div><strong>Situação:</strong> ${ticket.situation}</div>
                <div><strong>Categoria:</strong> ${ticket.category}</div>
                <div><strong>Prioridade:</strong> ${ticket.priority}</div>
                ${ticket.crisisRelated ? '<div><strong>⚠️ Relacionado a protocolo de crise:</strong> Sim</div>' : ''}
            </div>
            <div class="ticket__section">
                <h5>📝 Descrição do caso:</h5>
                <p>${escapeHtml(ticket.description)}</p>
            </div>
            <div class="ticket__section">
                <h5>👤 Responsável (fictício):</h5>
                <p>${ticket.responsible}</p>
            </div>
            <div class="ticket__section">
                <h5>🔄 Providências:</h5>
                <p>${ticket.providencias}</p>
            </div>
            <div class="ticket__section">
                <h5>📋 Encaminhamento sugerido:</h5>
                <p>${escapeHtml(ticket.referral)}</p>
            </div>
            <div class="ticket__section">
                <h5>📈 Acompanhamento:</h5>
                ${ticket.acompanhamento.map(acc => 
                    `<p><strong>${acc.date} ${acc.time}:</strong> ${acc.action}</p>`
                ).join('')}
            </div>
        `;
        ticketsList.appendChild(ticketCard);
    });
}

function initializeAdmin() {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function() {
            const user = document.getElementById('adminUser').value;
            const pass = document.getElementById('adminPass').value;
            
            if (user === 'coordenacao' && pass === 'demo123') {
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                updateAdminPanel();
                alert('Acesso autorizado ao painel administrativo (simulado)');
            } else {
                alert('Usuário ou senha incorretos.\n\nDica: usuário "coordenacao" e senha "demo123"');
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            document.getElementById('adminPanel').style.display = 'none';
            document.getElementById('adminLogin').style.display = 'block';
            document.getElementById('adminUser').value = '';
            document.getElementById('adminPass').value = '';
        });
    }
}

function updateAdminPanel() {
    const totalTicketsEl = document.getElementById('totalTickets');
    const openTicketsEl = document.getElementById('openTickets');
    const inProgressTicketsEl = document.getElementById('inProgressTickets');
    const completedTicketsEl = document.getElementById('completedTickets');
    const urgentTicketsEl = document.getElementById('urgentTickets');
    const crisisTicketsEl = document.getElementById('crisisTickets');
    const adminTicketsList = document.getElementById('adminTicketsList');
    
    if (totalTicketsEl) totalTicketsEl.textContent = tickets.length;
    
    const openCount = tickets.filter(t => t.status === 'Aberto').length;
    if (openTicketsEl) openTicketsEl.textContent = openCount;
    
    const inProgressCount = tickets.filter(t => t.status === 'Em Andamento').length;
    if (inProgressTicketsEl) inProgressTicketsEl.textContent = inProgressCount;
    
    const completedCount = tickets.filter(t => t.status === 'Concluído').length;
    if (completedTicketsEl) completedTicketsEl.textContent = completedCount;
    
    const urgentCount = tickets.filter(t => t.priority === 'Urgente' || t.status === 'Urgente').length;
    if (urgentTicketsEl) urgentTicketsEl.textContent = urgentCount;
    
    const crisisCount = tickets.filter(t => t.crisisRelated).length;
    if (crisisTicketsEl) crisisTicketsEl.textContent = crisisCount;
    
    if (adminTicketsList) {
        if (tickets.length === 0) {
            adminTicketsList.innerHTML = '<p class="no__tickets">Nenhum ticket registrado.</p>';
            return;
        }
        
        adminTicketsList.innerHTML = '';
        tickets.slice().reverse().forEach((ticket, index) => {
            const ticketCard = document.createElement('div');
            ticketCard.className = 'admin__ticket-card';
            ticketCard.style.cursor = 'pointer';
            ticketCard.dataset.ticketIndex = tickets.length - 1 - index;
            
            let statusClass = 'status__aberto';
            if (ticket.status === 'Em Andamento') statusClass = 'status__andamento';
            if (ticket.status === 'Concluído') statusClass = 'status__concluido';
            if (ticket.status === 'Urgente') statusClass = 'status__andamento';
            
            let priorityStyle = '';
            if (ticket.priority === 'Urgente') {
                priorityStyle = 'background: #fee2e2; color: #991b1b; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600;';
            }
            
            let crisisBadge = '';
            if (ticket.crisisRelated) {
                crisisBadge = '<span style="background: #fef3c7; color: #92400e; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">⚠️ Protocolo de Crise</span>';
            }
            
            ticketCard.innerHTML = `
                <div class="admin__ticket-header">
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                        <span class="admin__ticket-number">${ticket.number}</span>
                        ${crisisBadge}
                    </div>
                    <span class="admin__ticket-status ${statusClass}">${ticket.status}</span>
                </div>
                <div class="admin__ticket-info" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.4rem;">
                    <div><strong>Estudante:</strong> ${escapeHtml(ticket.name)}</div>
                    <div><strong>Matrícula:</strong> ${ticket.matricula}</div>
                    <div><strong>Categoria:</strong> ${ticket.category}</div>
                    <div><strong>Prioridade:</strong> <span style="${priorityStyle}">${ticket.priority}</span></div>
                    <div><strong>Data:</strong> ${ticket.date} ${ticket.time}</div>
                    <div><strong>Responsável:</strong> ${ticket.responsible}</div>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--primary-color); font-weight: 500;">
                    👁️ Clique para ver detalhes completos
                </div>
            `;
            
            ticketCard.addEventListener('click', function() {
                showTicketDetails(tickets[tickets.length - 1 - index], { admin: true });
            });
            
            adminTicketsList.appendChild(ticketCard);
        });
    }
}

function showTicketDetails(ticket, opts = {}) {
    const modal = document.getElementById('ticketDetailModal');
    const title = document.getElementById('ticketDetailTitle');
    const body = document.getElementById('ticketDetailBody');
    
    if (!modal || !title || !body) return;
    
    const isAdmin = opts.admin === true;
    
    title.textContent = `Detalhes do Ticket ${ticket.number}`;
    
    let statusClass = 'status__aberto';
    if (ticket.status === 'Em Andamento') statusClass = 'status__andamento';
    if (ticket.status === 'Concluído') statusClass = 'status__concluido';
    if (ticket.status === 'Urgente') statusClass = 'status__andamento';
    
    const adminControls = isAdmin ? `
        <div style="margin-bottom: 1rem; padding: 0.9rem; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px;">
            <h4 style="color: var(--primary-color); margin-bottom: 0.6rem;">Gerenciamento (Painel Administrativo)</h4>
            <div style="margin-bottom: 0.6rem;">
                <label style="display: block; margin-bottom: 0.3rem; font-weight: 500;">Alterar status:</label>
                <select id="adminTicketStatusSelect" class="form__select" style="max-width: 240px;">
                    <option value="Aberto" ${ticket.status === 'Aberto' ? 'selected' : ''}>Aberto</option>
                    <option value="Em Andamento" ${ticket.status === 'Em Andamento' ? 'selected' : ''}>Em andamento</option>
                    <option value="Concluído" ${ticket.status === 'Concluído' ? 'selected' : ''}>Concluído</option>
                    ${ticket.status === 'Urgente' ? '<option value="Urgente" selected>Urgente</option>' : ''}
                </select>
            </div>
            <div style="margin-bottom: 0.6rem;">
                <label style="display: block; margin-bottom: 0.3rem; font-weight: 500;">Alterar prioridade:</label>
                <select id="adminTicketPrioritySelect" class="form__select" style="max-width: 240px;">
                    <option value="Baixa" ${ticket.priority === 'Baixa' ? 'selected' : ''}>Baixa</option>
                    <option value="Média" ${ticket.priority === 'Média' ? 'selected' : ''}>Média</option>
                    <option value="Alta" ${ticket.priority === 'Alta' ? 'selected' : ''}>Alta</option>
                    <option value="Urgente" ${ticket.priority === 'Urgente' ? 'selected' : ''}>Urgente</option>
                </select>
            </div>
            <div style="margin-bottom: 0.6rem;">
                <label style="display: block; margin-bottom: 0.3rem; font-weight: 500;">Alterar setor sugerido:</label>
                <select id="adminTicketSectorSelect" class="form__select" style="max-width: 320px;">
                    <option value="Psicologia" ${(ticket.suggestedSector === 'Psicologia' || ticket.sector === 'Psicologia') ? 'selected' : ''}>Psicologia</option>
                    <option value="Coordenação de curso" ${(ticket.suggestedSector === 'Coordenação de curso' || ticket.sector === 'Coordenação de curso') ? 'selected' : ''}>Coordenação de curso</option>
                    <option value="Setor pedagógico" ${(ticket.suggestedSector === 'Setor pedagógico' || ticket.sector === 'Setor pedagógico') ? 'selected' : ''}>Setor pedagógico</option>
                    <option value="Assistência estudantil" ${(ticket.suggestedSector === 'Assistência estudantil' || ticket.sector === 'Assistência estudantil') ? 'selected' : ''}>Assistência estudantil</option>
                    <option value="Setor institucional responsável por denúncias e proteção" ${(ticket.suggestedSector === 'Setor institucional responsável por denúncias e proteção' || ticket.sector === 'Setor institucional responsável por denúncias e proteção') ? 'selected' : ''}>Setor institucional responsável por denúncias e proteção</option>
                    <option value="Outro setor competente" ${(ticket.suggestedSector === 'Outro setor competente' || ticket.sector === 'Outro setor competente') ? 'selected' : ''}>Outro setor competente</option>
                </select>
            </div>
            <div style="margin-bottom: 0.6rem;">
                <label style="display: block; margin-bottom: 0.3rem; font-weight: 500;">Atualizar providências:</label>
                <textarea id="adminTicketProvidencias" class="form__textarea" rows="2" placeholder="Descreva providências adotadas ou a adotar...">${escapeHtml(ticket.providencias || '')}</textarea>
            </div>
            <div style="margin-bottom: 0.6rem;">
                <label style="display: block; margin-bottom: 0.3rem; font-weight: 500;">Adicionar observação ao histórico:</label>
                <textarea id="adminTicketObservation" class="form__textarea" rows="2" placeholder="Ex.: Prioridade revisada após análise, providências em andamento..."></textarea>
            </div>
            <button class="btn__primary" id="adminSaveTicketChanges" style="max-width: 220px;">Salvar alterações</button>
            <small style="display: block; margin-top: 0.4rem; color: var(--text-secondary);">Prioridade, setor sugerido e providências podem ser revisados. Alterações são registradas no histórico e refletidas em "Meus Tickets".</small>
        </div>
    ` : '';
    
    body.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
                <span class="ticket__status ${statusClass}">${ticket.status}</span>
                <span style="padding: 0.3rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: ${ticket.priority === 'Urgente' ? '#fee2e2' : ticket.priority === 'Alta' ? '#fef3c7' : '#e2e8f0'}; color: ${ticket.priority === 'Urgente' ? '#991b1b' : ticket.priority === 'Alta' ? '#92400e' : '#475569'};">Prioridade: ${ticket.priority}</span>
                ${ticket.crisisRelated ? '<span style="padding: 0.3rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: #fef3c7; color: #92400e;">⚠️ Protocolo de Crise</span>' : ''}
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
            <div><strong>Estudante:</strong> ${escapeHtml(ticket.name)}</div>
            <div><strong>Matrícula:</strong> ${ticket.matricula}</div>
            <div><strong>Situação:</strong> ${ticket.situation}</div>
            <div><strong>Categoria:</strong> ${ticket.category}</div>
            <div><strong>Data/Hora:</strong> ${ticket.date} às ${ticket.time}</div>
            <div><strong>Responsável:</strong> ${ticket.responsible}</div>
            <div><strong>Setor sugerido:</strong> ${ticket.suggestedSector || ticket.sector || 'A definir'}</div>
            <div><strong>Status do atendimento:</strong> ${ticket.status}</div>
        </div>
        <div style="margin-bottom: 1rem; background: #f8fafc; padding: 0.75rem; border-radius: 8px;">
            <strong>Motivo da classificação (triagem por regras):</strong><br/>
            <span>${ticket.classificationReason || 'Classificação baseada em regras transparentes (sem diagnóstico profissional).'}</span>
        </div>
        
        <div style="margin-bottom: 1rem;">
            <h4 style="color: var(--primary-color); margin-bottom: 0.4rem;">📝 Descrição do caso</h4>
            <p style="background: var(--bg-gray); padding: 0.75rem; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(ticket.description)}</p>
        </div>
        
        <div style="margin-bottom: 1rem;">
            <h4 style="color: var(--primary-color); margin-bottom: 0.4rem;">🔄 Providências</h4>
            <p style="background: var(--bg-gray); padding: 0.75rem; border-radius: 8px;">${escapeHtml(ticket.providencias)}</p>
        </div>
        
        <div style="margin-bottom: 1rem;">
            <h4 style="color: var(--primary-color); margin-bottom: 0.4rem;">📋 Encaminhamento sugerido</h4>
            <p style="background: var(--bg-gray); padding: 0.75rem; border-radius: 8px;">${escapeHtml(ticket.referral)}</p>
        </div>
        
        ${adminControls}
        
        <div style="margin-bottom: 1rem;">
            <h4 style="color: var(--primary-color); margin-bottom: 0.4rem;">📈 Histórico de atualizações</h4>
            ${(ticket.acompanhamento || []).map(acc => 
                `<div style="background: var(--bg-gray); padding: 0.5rem 0.75rem; border-radius: 8px; margin-bottom: 0.4rem;">
                    <strong>${acc.date} ${acc.time}:</strong> ${acc.action}
                </div>`
            ).join('')}
        </div>
        
        <button class="modal__btn" id="closeTicketDetailBtn" style="background: var(--primary-color);">Fechar</button>
    `;
    
    modal.style.display = 'flex';
    
    setTimeout(() => {
        const closeBtn = document.getElementById('closeTicketDetailBtn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }
        
        if (isAdmin) {
            const saveBtn = document.getElementById('adminSaveTicketChanges');
            if (saveBtn) {
                saveBtn.onclick = () => {
                    const statusSelect = document.getElementById('adminTicketStatusSelect');
                    const prioritySelect = document.getElementById('adminTicketPrioritySelect');
                    const sectorSelect = document.getElementById('adminTicketSectorSelect');
                    const providenciasInput = document.getElementById('adminTicketProvidencias');
                    const obsInput = document.getElementById('adminTicketObservation');
                    const newStatus = statusSelect ? statusSelect.value : ticket.status;
                    const newPriority = prioritySelect ? prioritySelect.value : ticket.priority;
                    const newSector = sectorSelect ? sectorSelect.value : (ticket.suggestedSector || ticket.sector);
                    const newProvidencias = providenciasInput ? providenciasInput.value : (ticket.providencias || '');
                    const obs = obsInput ? obsInput.value.trim() : '';
                    
                    const ticketIdx = tickets.findIndex(t => t.number === ticket.number);
                    if (ticketIdx === -1) {
                        alert('Não foi possível localizar este ticket.');
                        return;
                    }
                    
                    let updated = false;
                    
                    if (newStatus && newStatus !== ticket.status) {
                        if (newStatus === 'Aberto' || newStatus === 'Em Andamento' || newStatus === 'Concluído' || newStatus === 'Urgente') {
                            tickets[ticketIdx].status = newStatus;
                            if (!tickets[ticketIdx].acompanhamento) tickets[ticketIdx].acompanhamento = [];
                            tickets[ticketIdx].acompanhamento.push({
                                date: new Date().toLocaleDateString('pt-BR'),
                                time: getCurrentTime(),
                                action: `Status alterado para: ${newStatus}`
                            });
                            updated = true;
                        }
                    }
                    
                    if (newPriority && newPriority !== ticket.priority) {
                        const oldPriority = ticket.priority;
                        tickets[ticketIdx].priority = newPriority;
                        if (!tickets[ticketIdx].acompanhamento) tickets[ticketIdx].acompanhamento = [];
                        tickets[ticketIdx].acompanhamento.push({
                            date: new Date().toLocaleDateString('pt-BR'),
                            time: getCurrentTime(),
                            action: `Prioridade revisada: ${oldPriority} → ${newPriority}`
                        });
                        updated = true;
                    }
                    
                    if (newSector && newSector !== (ticket.suggestedSector || ticket.sector)) {
                        const oldSector = ticket.suggestedSector || ticket.sector || 'A definir';
                        tickets[ticketIdx].suggestedSector = newSector;
                        tickets[ticketIdx].sector = newSector;
                        if (!tickets[ticketIdx].acompanhamento) tickets[ticketIdx].acompanhamento = [];
                        tickets[ticketIdx].acompanhamento.push({
                            date: new Date().toLocaleDateString('pt-BR'),
                            time: getCurrentTime(),
                            action: `Setor sugerido revisado: ${oldSector} → ${newSector}`
                        });
                        updated = true;
                    }
                    
                    if (newProvidencias !== undefined && newProvidencias !== (ticket.providencias || '')) {
                        const oldProv = ticket.providencias || '(vazio)';
                        tickets[ticketIdx].providencias = newProvidencias;
                        if (!tickets[ticketIdx].acompanhamento) tickets[ticketIdx].acompanhamento = [];
                        tickets[ticketIdx].acompanhamento.push({
                            date: new Date().toLocaleDateString('pt-BR'),
                            time: getCurrentTime(),
                            action: `Providências atualizadas`
                        });
                        updated = true;
                    }
                    
                    if (obs) {
                        if (!tickets[ticketIdx].acompanhamento) tickets[ticketIdx].acompanhamento = [];
                        tickets[ticketIdx].acompanhamento.push({
                            date: new Date().toLocaleDateString('pt-BR'),
                            time: getCurrentTime(),
                            action: `Observação: ${obs}`
                        });
                        updated = true;
                    }
                    
                    if (!updated) {
                        alert('Nenhuma alteração a salvar.');
                        return;
                    }
                    
                    updateAdminPanel();
                    updateTicketsList();
                    
                    modal.style.display = 'none';
                    alert('Alterações salvas com sucesso.\n\nPrioridade, setor sugerido e providências revisados. Histórico preservado. Mudanças sincronizadas com "Meus Tickets".');
                };
            }
        }
    }, 100);
}

function startNewReport() {
    // Limpar mensagens da conversa
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
    }
    
    // Reiniciar estado do chatbot
    resetChatState();
    
    // Limpar dados do usuário para novo relato (mantém apenas nome/matrícula se desejar, mas melhor limpar contexto)
    // Preservar nome/matrícula para conveniência, mas resetar situação
    currentUser.situation = '';
    currentUser.situationText = '';
    
    // Remover botão "Fazer novo relato"
    const existingNewBtn = document.getElementById('newReportBtn');
    if (existingNewBtn) {
        existingNewBtn.remove();
    }
    
    // Voltar para identificação para selecionar nova situação
    document.getElementById('chatContainer').style.display = 'none';
    document.getElementById('identification').style.display = 'block';
    
    // Limpar seleção de situação
    const situationBtns = document.querySelectorAll('.situation__btn');
    situationBtns.forEach(b => b.classList.remove('active'));
    
    // Limpar campo de mensagem
    const messageInput = document.getElementById('userMessageInput');
    if (messageInput) {
        messageInput.value = '';
    }
    
    document.getElementById('chat').scrollIntoView({ behavior: 'smooth' });
}

function initializeModals() {
    const urgentBtn = document.getElementById('urgentBtn');
    const closeBtn = document.getElementById('closeUrgentModal');
    const okBtn = document.getElementById('okUrgentBtn');
    const modal = document.getElementById('urgentModal');
    
    if (urgentBtn) {
        urgentBtn.addEventListener('click', showUrgentModal);
    }
    
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    if (okBtn && modal) {
        okBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    const ticketDetailModal = document.getElementById('ticketDetailModal');
    const closeTicketDetailModal = document.getElementById('closeTicketDetailModal');
    
    if (closeTicketDetailModal && ticketDetailModal) {
        closeTicketDetailModal.addEventListener('click', function() {
            ticketDetailModal.style.display = 'none';
        });
    }
    
    if (ticketDetailModal) {
        ticketDetailModal.addEventListener('click', function(e) {
            if (e.target === ticketDetailModal) {
                ticketDetailModal.style.display = 'none';
            }
        });
    }
}

function showUrgentModal() {
    const modal = document.getElementById('urgentModal');
    if (modal) {
        modal.style.display = 'flex';
    }
    
    setTimeout(() => {
        addBotMessage("🚨 SINALIZAÇÃO DE URGÊNCIA: Caso exista risco imediato à sua integridade física ou à sua vida, procure ajuda humana emergencial agora.");
    }, 500);
    setTimeout(() => {
        addBotMessage("**Orientações claras:** Em risco de morte iminente, ligue para o **SAMU (192)** ou dirija-se ao pronto-socorro mais próximo. Em situações de violência ou ameaça imediata, acione a Segurança Institucional do seu campus, se estiver seguro(a) para isso.");
    }, 1500);
    setTimeout(() => {
        addBotMessage("**Importante:** Este protótipo **NÃO aciona automaticamente** nenhum profissional, setor ou serviço. Os canais acima são referências para busca de ajuda humana. O registro de caso no sistema é apenas para organização e não substitui contato emergencial.");
    }, 2500);
    setTimeout(() => {
        addBotMessage("Se houver risco imediato, priorize sua segurança primeiro. Depois, você pode registrar o caso com prioridade URGENTE pelo formulário.");
    }, 3500);
}
