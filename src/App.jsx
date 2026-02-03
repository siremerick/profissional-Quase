import React, { useState, useEffect, useRef } from 'react';
import { getRecomendations, products } from './botLogic';
import Quiz from './components/Quiz.jsx';

// Simple Icons
const BotIcon = () => (
  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-hinode-gold to-yellow-300 flex items-center justify-center text-hinode-black font-bold shadow-lg shadow-hinode-gold/30 flex-shrink-0">
    H
  </div>
);

const UserIcon = () => (
  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold flex-shrink-0">
    Eu
  </div>
);

// Receipt Component for "Professional Email" Look
const Receipt = ({ cart, total, userData }) => (
  <div className="bg-white text-black p-5 rounded-lg shadow-xl font-mono text-sm border-t-8 border-hinode-gold max-w-sm mx-auto my-2 animate-fade-in-up">
    <div className="text-center mb-4 border-b border-gray-200 pb-2">
      <h2 className="font-bold text-xl uppercase tracking-widest text-gray-800">Pedido Confirmado</h2>
      <p className="text-gray-500 text-xs mt-1">{new Date().toLocaleDateString()} • #ORD-{Math.floor(Math.random() * 10000)}</p>
    </div>

    <div className="mb-4 text-xs text-gray-600 space-y-1">
      <p><span className="font-bold text-gray-800">Cliente:</span> {userData.name}</p>
      <p><span className="font-bold text-gray-800">Email:</span> {userData.email}</p>
      <p><span className="font-bold text-gray-800">Whats:</span> {userData.phone}</p>
      <p><span className="font-bold text-gray-800">Entrega:</span> {userData.address}</p>
    </div>

    <div className="space-y-2 mb-4 border-b border-gray-200 pb-4 min-h-[100px]">
      {cart.map((item, index) => (
        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
          <span className="truncate w-40 font-medium">{item.name}</span>
          <span className="font-bold">R$ {item.price.toFixed(2)}</span>
        </div>
      ))}
    </div>

    <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2 text-hinode-gold">
      <span>TOTAL</span>
      <span>R$ {total}</span>
    </div>

    <div className="mt-4 text-[10px] text-center text-gray-400 uppercase">
      Hinode Group • Viva Dias de Alegria
    </div>
  </div>
);

function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Olá! Sou o HinoBot. 💎' },
    { id: 2, sender: 'bot', text: 'Antes de começarmos, como posso te chamar?' }
  ]);
  const [cart, setCart] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    maritalStatus: '',
    anniversary: '',
    address: '',
    step: 'ask_name'
  });
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showQuiz]);

  const addMessage = (sender, text, type = 'text', extras = {}) => {
    setMessages(prev => [...prev, { id: Date.now(), sender, text, type, ...extras }]);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    addMessage('user', userText);
    setInputValue('');

    // Conversational Registration Flow
    if (userData.step === 'ask_name') {
      if (userText.length < 3) {
        addMessage('bot', 'Nome muito curto! Digite seu nome completo, por favor. 😊');
        return;
      }
      setUserData(prev => ({ ...prev, name: userText, step: 'ask_phone' }));
      setTimeout(() => addMessage('bot', `Prazer, ${userText}! 💎\nMe passa seu WhatsApp? (Ex: 11999999999)`), 600);
      return;
    }

    if (userData.step === 'ask_phone') {
      const phoneClean = userText.replace(/\D/g, '');
      if (phoneClean.length < 10) {
        addMessage('bot', 'Esse número parece incompleto. Digite o DDD + Número (ex: 11988887777). 📱');
        return;
      }
      setUserData(prev => ({ ...prev, phone: userText, step: 'ask_email' }));
      setTimeout(() => addMessage('bot', 'Anotado! E qual seu melhor e-mail? 📧'), 600);
      return;
    }

    if (userData.step === 'ask_email') {
      if (!userText.includes('@') || !userText.includes('.') || userText.length < 5) {
        addMessage('bot', 'E-mail inválido! Tente novamante (ex: nome@gmail.com). 🤔');
        return;
      }
      setUserData(prev => ({ ...prev, email: userText, step: 'ask_bday' }));
      setTimeout(() => addMessage('bot', 'Show! Agora me conta: quando é seu aniversário? (Dia/Mês)'), 600);
      return;
    }

    if (userData.step === 'ask_bday') {
      setUserData(prev => ({ ...prev, birthday: userText, step: 'ask_marital' }));
      setTimeout(() => {
        addMessage('bot', 'Oba, festa chegando! 🎉\nUma pergunta indiscreta (mas útil rs): Você é casado(a), solteiro(a)?', 'actions', {
          actions: [
            { label: 'Casado(a) 💍', value: 'married' },
            { label: 'Solteiro(a) 💃', value: 'single' },
            { label: 'Namorando 💑', value: 'dating' }
          ]
        });
      }, 600);
      return;
    }

    if (userData.step === 'ask_anniversary') {
      setUserData(prev => ({ ...prev, anniversary: userText, step: 'ask_address' }));
      setTimeout(() => addMessage('bot', 'Perfeito! 😍\nE para finalizar: Onde você mora? (Endereço para entrega) 🚚'), 600);
      return;
    }

    if (userData.step === 'ask_address') {
      setUserData(prev => ({ ...prev, address: userText, step: 'menu' }));
      finishRegistration();
      return;
    }

    // Smart Search Logic
    setTimeout(() => {
      const term = userText.toLowerCase();

      // 1. Check for commands/keywords
      if (term.includes('quiz')) {
        handleStartQuiz();
        return;
      }

      // 2. Search in Products
      const foundProducts = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.tags.some(t => t.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );

      if (foundProducts.length > 0) {
        addMessage('bot', `Encontrei ${foundProducts.length} opções para "${userText}":`);
        addMessage('bot', '', 'products', { products: foundProducts.slice(0, 5) }); // Show max 5 matches
      } else {
        addMessage('bot', 'Não encontrei nenhum produto exato com esse nome. �\nMas posso te ajudar a escolher com o Quiz!');
        addMessage('bot', 'Topa descobrir sua fragrância ideal?', 'action', { action: 'start_quiz' });
      }
    }, 600);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    addMessage('user', 'Quero fazer o quiz!');
  };

  const handleQuizFinish = (answers) => {
    setShowQuiz(false);
    const recs = getRecomendations(answers);

    addMessage('bot', 'Com base nas suas escolhas, separei estes produtos incríveis:');

    setTimeout(() => {
      addMessage('bot', '', 'products', { products: recs });
      setTimeout(() => {
        addMessage('bot', 'Gostou de algum? Clique em "Me Interessa" para adicionar à sacola.');
      }, 1000);
    }, 800);
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    setTimeout(() => {
      addMessage('bot', `Ótima escolha! ${product.name} adicionado á sua sacola. 🛍️\n\nQuer finalizar o pedido por e-mail ou ver mais coisas?`, 'actions', {
        actions: [
          { label: 'Finalizar Pedido', value: 'checkout' },
          { label: 'Ver mais', value: 'continue' }
        ]
      });
    }, 500);
  };

  const handleAction = (actionValue) => {
    if (actionValue === 'checkout') {
      handleCheckout();
    } else if (['married', 'dating'].includes(actionValue)) {
      addMessage('user', actionValue === 'married' ? 'Casado(a)' : 'Namorando');
      setUserData(prev => ({ ...prev, maritalStatus: actionValue, step: 'ask_anniversary' }));
      setTimeout(() => addMessage('bot', 'Que amor! ❤️ E qual a data dessa data especial? (Data do casamento ou namoro)'), 600);
    } else if (actionValue === 'single') {
      addMessage('user', 'Solteiro(a)');
      setUserData(prev => ({ ...prev, maritalStatus: 'single', step: 'ask_address' }));
      setTimeout(() => addMessage('bot', 'Livre, leve e solto(a)! ✨\nE para finalizar: Onde você mora? (Endereço para entrega) 🚚'), 600);
    } else {
      addMessage('user', 'Quero ver mais.');
      addMessage('bot', 'Sem problemas! Digite o que procura (ex: "barba", "hidratante").');
    }
  };

  const finishRegistration = () => {
    setTimeout(() => {
      addMessage('bot', `Cadastro top! Tudo pronto. ✅\n\nAgora sim: Posso te ajudar a achar o produto ideal.`);
      addMessage('bot', 'Topa fazer nosso Quiz de Estilo?', 'action', { action: 'start_quiz' });
    }, 800);
  };

  const handleCheckout = () => {
    const total = cart.reduce((acc, p) => acc + p.price, 0).toFixed(2);

    // 1. Show User the "Professional" Receipt UI
    addMessage('user', 'Finalizar Pedido');
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'bot',
      type: 'receipt', // Special type for receipt
      cart: cart,
      total: total,
      userData: userData
    }]);

    // 2. Prepare the Mailto Link (Text Only, but highly formatted)
    // Using simple spacing chars for "formatting" in plain text
    // Adding some padding logic for better alignment
    const bodyItems = cart.map(p => `• ${p.name.padEnd(25, '.')} R$ ${p.price.toFixed(2)}`).join('%0D%0A');

    const textBody = `
🧾 *PEDIDO HINOBOT*
==============================%0D%0A
👤 *DADOS DO CLIENTE:*%0D%0A
Nome: ${userData.name}%0D%0A
Email: ${userData.email}%0D%0A
WhatsApp: ${userData.phone}%0D%0A
Endereço: ${userData.address ? userData.address : 'Não informado'}%0D%0A
==============================%0D%0A
🛍️ *ITENS DO PEDIDO:*%0D%0A
${bodyItems}%0D%0A
==============================%0D%0A
💰 *TOTAL A PAGAR: R$ ${total}*%0D%0A
==============================%0D%0A
Obs: Envie este email para processarmos seu pedido! 🚀
`;

    const mailto = `mailto:emerickallan@gmail.com?subject=🛍️ Pedido HinoBot - ${userData.name}&body=${textBody}`;

    setTimeout(() => {
      addMessage('bot', `Gerei seu pedido, ${userData.name}! Clique abaixo para enviar.`, 'link', { url: mailto, text: '📩 Enviar Pedido Agora' });
    }, 1000);
  };

  return (
    <div className="flex justify-center min-h-screen p-0 sm:p-4 font-sans bg-black">
      <div className="w-full max-w-md flex flex-col h-screen sm:h-[90vh] glass-dark sm:rounded-3xl overflow-hidden relative shadow-2xl border-x sm:border border-white/10">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60 backdrop-blur-xl z-10 sticky top-0">
          <div className="flex items-center space-x-3">
            <BotIcon />
            <div>
              <h1 className="font-bold text-lg text-white tracking-wide">HinoBot</h1>
              <p className="text-[10px] text-green-400 flex items-center gap-1 font-medium tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
              </p>
            </div>
          </div>
          <div className="relative group cursor-pointer z-50 hover:scale-110 transition-transform active:scale-95" onClick={handleCheckout}>
            <div className="p-2 bg-white/5 rounded-full border border-white/10">
              <span className="text-xl">🛍️</span>
            </div>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-hinode-gold text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-lg shadow-hinode-gold/50">
                {cart.length}
              </span>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`flex items-end gap-2 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.sender === 'bot' && msg.type !== 'receipt' ? <BotIcon /> : (msg.sender === 'user' ? <UserIcon /> : null)}

                {msg.type === 'receipt' ? (
                  <Receipt cart={msg.cart} total={msg.total} userData={msg.userData} />
                ) : (
                  <div className={`
                        p-4 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-sm
                        ${msg.sender === 'user'
                      ? 'bg-gradient-to-br from-hinode-gold to-[#a17f38] text-black font-medium rounded-br-none shadow-hinode-gold/10'
                      : 'bg-white/5 text-gray-100 border border-white/5 rounded-bl-none'}
                    `}>
                    {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}

                    {/* Action Buttons */}
                    {msg.type === 'action' && msg.action === 'start_quiz' && !showQuiz && cart.length === 0 && (
                      <button
                        onClick={handleStartQuiz}
                        className="mt-4 w-full bg-gradient-to-r from-transparent to-white/5 border border-hinode-gold/30 hover:border-hinode-gold text-hinode-gold py-3 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-95"
                      >
                        ✨ Iniciar Quiz de Estilo
                      </button>
                    )}

                    {/* Large Product Carousel (Stories Style) */}
                    {msg.type === 'products' && (
                      <div className="mt-4 flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x mandatory -mx-4 px-4 scroll-smooth">
                        {msg.products.map(p => (
                          <div key={p.id} className="snap-center shrink-0 w-[85%] sm:w-[280px] bg-black/60 rounded-2xl p-0 border border-white/10 flex flex-col items-center hover:border-hinode-gold/50 transition-all shadow-xl overflow-hidden group">
                            <div className="w-full aspect-[4/5] bg-white/5 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              <div className="absolute bottom-3 left-3 z-20">
                                <p className="text-hinode-gold text-lg font-bold bg-black/60 px-3 py-1 rounded backdrop-blur border border-white/10">R$ {p.price.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="p-4 w-full text-left">
                              <h4 className="font-bold text-white text-lg mb-1 leading-tight">{p.name}</h4>
                              <p className="text-gray-400 text-xs line-clamp-2 mb-4 h-8">{p.description || "Fragrância marcante e envolvente."}</p>
                              <button
                                onClick={() => addToCart(p)}
                                className="w-full bg-white text-black text-sm font-bold py-3 rounded-xl hover:bg-hinode-gold transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2"
                              >
                                <span>🛍️</span> Adicionar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Generic Actions */}
                    {msg.type === 'actions' && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.actions.map(action => (
                          <button
                            key={action.value}
                            onClick={() => handleAction(action.value)}
                            className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-95"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Link Button */}
                    {msg.type === 'link' && (
                      <a
                        href={msg.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block mt-4 text-center bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-green-900/40 transform hover:-translate-y-0.5"
                      >
                        {msg.text}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Quiz Interface Embedded */}
          {showQuiz && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="flex items-end gap-2 max-w-[100%] w-full">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-0 rounded-2xl w-full shadow-2xl overflow-hidden">
                  <Quiz onAnswer={handleQuizFinish} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleInputSubmit} className="p-4 bg-black/80 border-t border-white/10 backdrop-blur-xl">
          <div className="glass rounded-full flex items-center p-1 pl-5 pr-1 focus-within:border-hinode-gold/50 transition-colors bg-white/5">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                userData.step === 'ask_name' ? "Digite seu nome..." :
                  userData.step === 'ask_phone' ? "Seu WhatsApp..." :
                    userData.step === 'ask_email' ? "Seu E-mail..." :
                      userData.step === 'ask_bday' ? "Data de Niver..." :
                        userData.step === 'ask_anniversary' ? "Data Especial..." :
                          userData.step === 'ask_address' ? "Endereço completo..." :
                            "Digite sua mensagem..."
              }
              className="bg-transparent flex-1 outline-none text-white placeholder-white/40 text-sm py-2.5"
              disabled={showQuiz}
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-10 h-10 bg-hinode-gold rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-hinode-gold/20"
            >
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
