import React, { useState, useEffect, useRef } from 'react';
import { products } from './botLogic';

// Simple Icons
const BotIcon = () => (
  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 flex-shrink-0">
    Q
  </div>
);

const UserIcon = () => (
  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold flex-shrink-0">
    Eu
  </div>
);

// Receipt Component for "Professional Email" Look
const Receipt = ({ cart, total, userData }) => (
  <div className="bg-white text-black p-5 rounded-lg shadow-xl font-mono text-sm border-t-8 border-blue-600 max-w-sm mx-auto my-2 animate-fade-in-up">
    <div className="text-center mb-4 border-b border-gray-200 pb-2">
      <h2 className="font-bold text-xl uppercase tracking-widest text-gray-800">Interesse Confirmado</h2>
      <p className="text-gray-500 text-xs mt-1">{new Date().toLocaleDateString()} • #EDU-{Math.floor(Math.random() * 10000)}</p>
    </div>

    <div className="mb-4 text-xs text-gray-600 space-y-1">
      <p><span className="font-bold text-gray-800">Cliente:</span> {userData.name}</p>
      <p><span className="font-bold text-gray-800">Email:</span> {userData.email}</p>
      <p><span className="font-bold text-gray-800">Whats:</span> {userData.phone}</p>
    </div>

    <div className="space-y-2 mb-4 border-b border-gray-200 pb-4 min-h-[100px]">
      {cart.map((item, index) => (
        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
          <span className="truncate w-40 font-medium">{item.name}</span>
          <span className="font-bold">R$ {(item.price * (1 - (item.discount || 0))).toFixed(2)}</span>
        </div>
      ))}
    </div>

    <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2 text-blue-600">
      <div className="flex flex-col">
        <span>VALOR ESTIMADO</span>
        {cart.filter(i => i.category === 'ead').length >= 3 && (
          <span className="text-[10px] text-green-600 font-normal">Combo EAD aplicado! 📚✅</span>
        )}
      </div>
      <span>R$ {total}</span>
    </div>

    <div className="mt-4 text-[10px] text-center text-gray-400 uppercase">
      Quase • Especialista em Formação Profissional
    </div>
  </div>
);

function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Olá! Seja muito bem-vindo(a). 👋' },
    { id: 2, sender: 'bot', text: 'Sou consultora especialista em cursos livres e formação profissional. Vou te ajudar a escolher a melhor capacitação para alavancar sua carreira!' },
    { id: 3, sender: 'bot', text: 'Como posso te chamar para darmos início ao seu futuro?' }
  ]);
  const [cart, setCart] = useState([]);
  const [lastSuggestedProducts, setLastSuggestedProducts] = useState([]);
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    email: '',
    step: 'ask_name'
  });
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (sender, text, type = 'text', extras = {}) => {
    setMessages(prev => [...prev, { id: Date.now(), sender, text, type, ...extras }]);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    addMessage('user', userText);
    setInputValue('');

    const term = userText.toLowerCase();

    // REGISTRATION FLOW
    if (userData.step === 'ask_name') {
      if (userText.length < 3) {
        addMessage('bot', 'Nome muito curto para um registro profissional! Digite seu nome completo, por favor. 😊');
        return;
      }
      setUserData(prev => ({ ...prev, name: userText, step: 'ask_gender' }));
      setTimeout(() => {
        addMessage('bot', `Prazer, ${userText}! 🤝\nA Quase preza pelo atendimento de excelência. Como você prefere ser tratado(a)?`, 'actions', {
          actions: [
            { label: 'Sr. (Ele) 👨', value: 'male' },
            { label: 'Sra. (Ela) 👩', value: 'female' },
          ]
        });
      }, 600);
      return;
    }

    if (userData.step === 'ask_gender') {
      const g = term;
      let gender = 'neutral';
      if (g.includes('sr') || g.includes('ele') || g.includes('homem')) gender = 'male';
      if (g.includes('sra') || g.includes('ela') || g.includes('mulher')) gender = 'female';
      handleGenderSelection(gender);
      return;
    }

    if (userData.step === 'ask_phone') {
      const phoneClean = term.replace(/\D/g, '');
      if (phoneClean.length < 10) {
        addMessage('bot', 'Esse número parece incompleto. Digite o DDD + Número para mantermos contato profissional (ex: 11988887777). 📱');
        return;
      }
      setUserData(prev => ({ ...prev, phone: userText, step: 'ask_email' }));
      setTimeout(() => addMessage('bot', 'Excelente! Registrado. Qual seu melhor e-mail para receber as propostas e detalhes dos cursos? 📧'), 600);
      return;
    }

    if (userData.step === 'ask_email') {
      if (!term.includes('@') || !term.includes('.') || term.length < 5) {
        addMessage('bot', 'Preciso de um e-mail válido para enviar seu material! Tente novamente (ex: nome@gmail.com). 🤔');
        return;
      }
      setUserData(prev => ({ ...prev, email: userText, step: 'menu' }));
      finishRegistration();
      return;
    }

    // SMART CONSULTANCY LOGIC
    setTimeout(() => {
      // Intent: Duration
      if (term.includes('tempo') || term.includes('dura') || term.includes('hora')) {
        const product = lastSuggestedProducts.find(p => term.includes(p.name.toLowerCase().split(' ')[0])) || lastSuggestedProducts[0];
        if (product && product.duration) {
          addMessage('bot', `O curso de **${product.name}** tem uma carga horária de **${product.duration}**. É uma formação completa e focada em resultados!`);
          return;
        }
      }

      // Intent: Syllabus/About
      if (term.includes('trata') || term.includes('aprende') || term.includes('conteudo') || term.includes('oque e') || term.includes('sobre')) {
        const product = lastSuggestedProducts.find(p => term.includes(p.name.toLowerCase().split(' ')[0])) || lastSuggestedProducts[0];
        if (product) {
          const syllabus = product.syllabus ? `\n\n**O que você vai aprender:**\n${product.syllabus.map(s => `• ${s}`).join('\n')}` : '';
          addMessage('bot', `Com certeza! O curso **${product.name}** foi desenhado para te dar autoridade no assunto. ${product.description}${syllabus}`);
          return;
        }
      }

      // Intent: Price/Discount
      if (term.includes('valor') || term.includes('preco') || term.includes('quanto') || term.includes('desconto')) {
        addMessage('bot', `Trabalhamos com condições exclusivas! 💎\n\n• **Cursos de Condutores**: R$ 200,00 (Consigo liberar 25% de desconto para fechamento hoje!)\n• **Cursos EAD**: R$ 175,00 cada. \n\n🔥 **MEGA COMBO**: Fechando 3 cursos EAD, o pacote sai por apenas **R$ 425,00** (Economia de R$ 100!).`);
        return;
      }

      // Intent: Direct Search
      const foundProducts = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.tags.some(t => t.toLowerCase().includes(term))
      );

      if (foundProducts.length > 0) {
        setLastSuggestedProducts(foundProducts);
        addMessage('bot', `Como especialista, recomendei ${foundProducts.length} opções que vão impulsionar sua carreira:`);
        addMessage('bot', '', 'products', { products: foundProducts.slice(0, 5) });
      } else {
        addMessage('bot', 'Não localizei esse termo exato, mas como consultora, posso te sugerir nossas formações mais buscadas. O que você busca desenvolver hoje?');
        addMessage('bot', 'Ex: "MOPP", "Transporte Escolar", "NR 10", "Primeiros Socorros".');
      }
    }, 600);
  };

  const handleShowCatalog = (category = null) => {
    let filtered = products;
    if (category) {
      filtered = products.filter(p => p.category === category);
    }

    const displayProducts = filtered.slice(0, 10);
    setLastSuggestedProducts(displayProducts);
    const labels = { condutores: 'Formação de Condutores', ead: 'Cursos Livres EAD' };

    addMessage('user', category ? `Ver ${labels[category] || category}` : 'Ver Todos os Cursos');
    setTimeout(() => {
      addMessage('bot', category ? `Excelente escolha! Aqui estão as melhores opções em ${labels[category] || category}:` : 'Confira nossas principais qualificações:');
      if (displayProducts.length === 0) {
        addMessage('bot', 'Poxa, no momento essas vagas estão esgotadas ou em atualização. ✨');
      } else {
        addMessage('bot', '', 'products', { products: displayProducts });
      }
    }, 500);
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    const actions = [
      { label: '🛒 Finalizar Intenção', value: 'checkout' },
      { label: '🔎 Ver mais opções', value: 'continue' }
    ];
    setTimeout(() => {
      addMessage('bot', `Excelente decisão! **${product.name}** é um passo gigante para seu futuro. Quer adicionar mais algum ou já quer garantir sua vaga?`, 'actions', { actions });
    }, 500);
  };

  const handleGenderSelection = (gender) => {
    setUserData(prev => ({ ...prev, gender, step: 'ask_phone' }));
    const treatment = gender === 'male' ? 'Sr.' : (gender === 'female' ? 'Sra.' : '');
    setTimeout(() => {
      addMessage('bot', `Entendido, ${treatment} ${userData.name.split(' ')[0]}! 😉\nPara um atendimento personalizado e envio de orçamentos, qual seu WhatsApp?`);
    }, 600);
  };

  const handleAction = (actionValue) => {
    if (actionValue === 'male' || actionValue === 'female') {
      handleGenderSelection(actionValue);
      return;
    }
    if (actionValue === 'checkout') {
      handleCheckout();
    } else {
      addMessage('user', 'Ver mais cursos');
      addMessage('bot', 'Foco total no crescimento! O que mais te interessa? Tenho formações em Transporte e Segurança do Trabalho.');
    }
  };

  const finishRegistration = () => {
    setTimeout(() => {
      addMessage('bot', `Tudo pronto, cadastro finalizado com sucesso! ✅\n\nAgora sou sua consultora dedicada. Posso te apresentar nossos pacotes promocionais?`);
      addMessage('bot', 'Digite o curso que procura ou use os botões de categoria acima.');
    }, 800);
  };

  const calculateTotal = (currentCart) => {
    let total = 0;
    let eadCount = 0;
    currentCart.forEach(p => {
      if (p.category === 'ead') {
        eadCount++;
        total += p.price;
      } else {
        total += p.price * (1 - (p.discount || 0));
      }
    });
    const bundles = Math.floor(eadCount / 3);
    total -= bundles * 100;
    return total.toFixed(2);
  };

  const handleCheckout = () => {
    const total = calculateTotal(cart);
    addMessage('user', 'Quero garantir minha vaga');
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'bot',
      type: 'receipt',
      cart: cart,
      total: total,
      userData: userData
    }]);

    const bodyItems = cart.map(p => `• ${p.name}: R$ ${(p.price * (1 - (p.discount || 0))).toFixed(2)}`).join('%0D%0A');
    const textBody = `🧾 INTERESSE EM CURSOS (Quase) %0D%0ACliente: ${userData.name}%0D%0AWhatsApp: ${userData.phone}%0D%0A%0D%0AItens:%0D%0A${bodyItems}%0D%0A%0D%0ATotal Estimado: R$ ${total}`;
    const mailto = `mailto:emerickallan@gmail.com?subject=Interesse em Cursos - ${userData.name}&body=${textBody}`;

    setTimeout(() => {
      addMessage('bot', `Seu plano de carreira está pronto! Toque no botão abaixo para me enviar seu interesse direto por e-mail e eu entrarei em contato para concluir sua matrícula.`, 'link', { url: mailto, text: '📩 Enviar Interesse via E-mail' });
    }, 1000);
  };

  return (
    <div className="flex justify-center min-h-screen p-0 sm:p-4 font-sans bg-slate-950">
      <div className="w-full max-w-md flex flex-col h-screen sm:h-[90vh] glass-dark sm:rounded-3xl overflow-hidden relative shadow-2xl border-x sm:border border-white/10">

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60 backdrop-blur-xl z-50 sticky top-0">
          <div className="flex items-center space-x-3">
            <BotIcon />
            <div>
              <h1 className="font-bold text-lg text-white tracking-wide">Quase Bot</h1>
              <p className="text-[10px] text-green-400 flex items-center gap-1 font-medium tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Consultora Especialista
              </p>
            </div>
          </div>
          <div className="relative group cursor-pointer z-50 transition-transform active:scale-95" onClick={handleCheckout}>
            <div className="p-2 bg-white/5 rounded-full border border-white/10">
              <span className="text-xl">🎓</span>
            </div>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                {cart.length}
              </span>
            )}
          </div>
        </div>

        {/* Category Filter */}
        {userData.step === 'menu' && (
          <div className="bg-slate-900/40 backdrop-blur-md border-b border-white/5 py-3 z-40">
            <div className="flex overflow-x-auto gap-3 px-4 scrollbar-hide pb-1">
              {[
                { id: null, label: 'Todos', icon: '✨' },
                { id: 'condutores', label: 'Condutores', icon: '🚛' },
                { id: 'ead', label: 'Cursos EAD', icon: '📚' }
              ].map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => handleShowCatalog(cat.id)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-blue-600/20 hover:border-blue-500 transition-all text-sm text-gray-300 flex-shrink-0"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`flex items-end gap-2 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.sender === 'bot' && msg.type !== 'receipt' ? <BotIcon /> : (msg.sender === 'user' ? <UserIcon /> : null)}

                {msg.type === 'receipt' ? (
                  <Receipt cart={msg.cart} total={msg.total} userData={msg.userData} />
                ) : (
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white font-medium rounded-br-none' : 'bg-white/5 text-gray-100 border border-white/5 rounded-bl-none'}`}>
                    {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}

                    {msg.type === 'products' && (
                      <div className="mt-4 flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x mandatory -mx-4 px-4">
                        {msg.products.map(p => (
                          <div key={p.id} className="snap-center shrink-0 w-[80%] sm:w-[260px] bg-slate-900 rounded-2xl border border-white/10 flex flex-col shadow-xl overflow-hidden">
                            <div className="w-full aspect-video bg-white/5 relative image-container">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover logo-mask" />
                              <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white backdrop-blur">
                                {p.category === 'condutores' ? 'FORMAÇÃO' : 'EAD'}
                              </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                              <h4 className="font-bold text-white mb-1 leading-tight h-10 overflow-hidden text-ellipsis line-clamp-2">{p.name}</h4>
                              <p className="text-[10px] text-gray-400 mb-3 h-8 overflow-hidden line-clamp-2">{p.highlights}</p>

                              <div className="mt-auto mb-4">
                                {p.category === 'condutores' ? (
                                  <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs line-through">R$ {p.price.toFixed(2)}</span>
                                    <span className="text-green-400 font-bold text-lg">R$ {(p.price * (1 - p.discount)).toFixed(2)}</span>
                                  </div>
                                ) : (
                                  <span className="text-blue-400 font-bold text-lg">R$ {p.price.toFixed(2)}</span>
                                )}
                              </div>
                              <button onClick={() => addToCart(p)} className="w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-blue-500 transition-colors shadow-lg">
                                TENHO INTERESSE
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.type === 'actions' && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.actions.map(action => (
                          <button key={action.value} onClick={() => handleAction(action.value)} className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl text-xs transition-all">
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.type === 'link' && (
                      <a href={msg.url} target="_blank" rel="noreferrer" className="block mt-4 text-center bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-0.5">
                        {msg.text}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleInputSubmit} className="p-4 bg-slate-950 border-t border-white/10">
          <div className="bg-white/5 rounded-full flex items-center p-1 pl-5 border border-white/10 focus-within:border-blue-500/50 transition-colors">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={userData.step === 'ask_name' ? "Seu nome completo..." : "Fale com sua consultora..."}
              className="bg-transparent flex-1 outline-none text-white placeholder-white/20 text-sm py-2"
            />
            <button type="submit" disabled={!inputValue.trim()} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 disabled:opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
