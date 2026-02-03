import React from 'react';

const Quiz = ({ onAnswer }) => {
    const [step, setStep] = React.useState(0);
    const [answers, setAnswers] = React.useState({});

    const questions = [
        {
            id: 'context',
            text: 'Para quem é o mimo? 🎁',
            options: [
                { label: 'Para Mim 🙋‍♀️', value: 'self', type: 'self', img: '/images/ella_radiance.jpg' },
                { label: 'Presente 🎁', value: 'gift', type: 'gift', img: '/images/sacolas.jpg' },
            ]
        },
        {
            id: 'vibe',
            text: 'Qual a ocasião?',
            options: [
                { label: 'Festa & Glamour ✨', value: 'festa', type: 'doce', img: '/images/inebriante_header.jpg' },
                { label: 'Dia a dia & Trabalho 💼', value: 'trabalho', type: 'fresco', img: '/images/empire_tradicional.jpg' },
                { label: 'Relax & Casa 🏠', value: 'casa', type: 'suave', img: '/images/aroma_di_bamboo.jpg' }
            ]
        },
        {
            id: 'smell',
            text: 'O que te agrada mais?',
            options: [
                { label: 'Doce / Marcante 🍭', value: 'doce', type: 'doce', img: '/images/dazzle.jpg' },
                { label: 'Fresco / Cítrico 🍋', value: 'fresco', type: 'fresco', img: '/images/lattitude_expedition_2.jpg' },
                { label: 'Madeira / Intenso 🪵', value: 'madeirado', type: 'madeirado', img: '/images/empire_icon_one.jpg' }
            ]
        }
    ];

    const handleOptionClick = (option, questionId) => {
        const newAnswers = { ...answers, [questionId]: option };
        setAnswers(newAnswers);

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            onAnswer(newAnswers);
        }
    };

    const currentQ = questions[step];

    return (
        <div className="flex flex-col space-y-4 w-full animate-fade-in-up">
            <h3 className="text-xl font-bold text-hinode-gold mb-2">{currentQ.text}</h3>
            <div className="grid grid-cols-2 gap-3">
                {currentQ.options.map((opt) => (
                    <button
                        key={opt.label}
                        onClick={() => handleOptionClick(opt, currentQ.id)}
                        className="group relative h-32 rounded-xl overflow-hidden border border-white/20 hover:border-hinode-gold transition-all duration-300"
                    >
                        <img src={opt.img} alt={opt.label} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                        <span className="absolute bottom-2 left-2 right-2 text-sm font-medium text-white shadow-sm z-10 drop-shadow-md">
                            {opt.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Quiz;
