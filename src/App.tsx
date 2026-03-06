import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Compass, Wind, Send, Loader2, RefreshCw, Languages, RotateCcw, ChevronRight, Zap, Brain, Activity, Quote, Sun, Moon } from "lucide-react";
import Markdown from "react-markdown";
import { translations, Language } from "./translations";
import { getOracleInterpretation, getDailyEnergy, getFengShuiAdvice, getFengShuiImageAdvice, getAscendingWisdom, getEmergencyRescue } from "./services/geminiService";

type Tab = "oracle" | "energy" | "fengshui";

interface DailyEnergy {
  element: string;
  meaning: string;
  suggestion: string;
}

// --- Components ---

const ZenCoin = ({ isTossing, result, index, isDark }: { isTossing: boolean, result: number | null, index: number, isDark: boolean }) => {
  return (
    <motion.div
      animate={isTossing ? { 
        rotateY: [0, 720 + index * 180, 1440 + index * 360, 2160 + index * 540],
        rotateX: [0, 45, -45, 0],
        y: [0, -100 - index * 20, 0, -50, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
        filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
      } : {
        rotateY: result === 1 ? 0 : 180,
        rotateX: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)"
      }}
      transition={{ 
        duration: 1.5, 
        ease: [0.23, 1, 0.32, 1],
        delay: index * 0.1
      }}
      className={`w-16 h-16 rounded-full relative preserve-3d shadow-2xl ${isDark ? 'shadow-white/5' : 'shadow-black/10'}`}
    >
      {/* Front (Heads/Yang) */}
      <div className={`absolute inset-0 backface-hidden rounded-full flex items-center justify-center border-2 ${isDark ? 'bg-amber-900/40 border-amber-500/30' : 'bg-amber-100 border-amber-600/30'} overflow-hidden`}>
        <div className={`w-6 h-6 border-2 ${isDark ? 'border-amber-500/40' : 'border-amber-600/40'} rotate-45 flex items-center justify-center`}>
          <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-amber-500/40' : 'bg-amber-600/40'}`} />
        </div>
        <div className={`absolute inset-0 opacity-10 bg-[radial-gradient(circle,transparent_20%,black_100%)]`} />
        <span className={`absolute bottom-1 text-[8px] font-bold uppercase tracking-widest ${isDark ? 'text-amber-500/40' : 'text-amber-600/40'}`}>Yang</span>
      </div>
      
      {/* Back (Tails/Yin) */}
      <div className={`absolute inset-0 backface-hidden rounded-full flex items-center justify-center border-2 rotate-y-180 ${isDark ? 'bg-slate-800/40 border-slate-500/30' : 'bg-slate-100 border-slate-600/30'} overflow-hidden`}>
        <div className={`w-6 h-6 border-2 ${isDark ? 'border-slate-500/40' : 'border-slate-600/40'} flex items-center justify-center`}>
          <div className={`w-3 h-[1px] ${isDark ? 'bg-slate-500/40' : 'bg-slate-600/40'}`} />
        </div>
        <div className={`absolute inset-0 opacity-10 bg-[radial-gradient(circle,transparent_20%,black_100%)]`} />
        <span className={`absolute bottom-1 text-[8px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500/40' : 'text-slate-600/40'}`}>Yin</span>
      </div>
    </motion.div>
  );
};

const ZenBackground = ({ isDark, mousePos }: { isDark: boolean, mousePos: { x: number, y: number } }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Dynamic Gradients that follow mouse subtly */}
      <motion.div 
        animate={{
          x: mousePos.x * 0.05,
          y: mousePos.y * 0.05,
          scale: [1, 1.1, 1],
          opacity: isDark ? [0.1, 0.15, 0.1] : [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -top-1/4 -left-1/4 w-[150%] h-[150%] rounded-full blur-[120px] ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-100/40'}`}
      />
      <motion.div 
        animate={{
          x: -mousePos.x * 0.03,
          y: -mousePos.y * 0.03,
          scale: [1.1, 1, 1.1],
          opacity: isDark ? [0.05, 0.1, 0.05] : [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className={`absolute -bottom-1/4 -right-1/4 w-[150%] h-[150%] rounded-full blur-[120px] ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-50/30'}`}
      />
      
      {/* Noise Texture */}
      <div className={`absolute inset-0 opacity-[0.02] mix-blend-overlay ${isDark ? 'invert' : ''}`} 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')` }} />
      
      <div className={`absolute inset-0 ${isDark ? 'bg-black/95' : 'bg-[#F5F2ED]/85'} backdrop-blur-[1px]`} />
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{ 
          backgroundImage: `radial-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px)`, 
          backgroundSize: '60px 60px' 
        }} 
      />
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>("en");
  const [isDark, setIsDark] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const t = translations[lang];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const cycleLanguage = () => {
    const langs: Language[] = ["en", "zh", "ja"];
    const currentIndex = langs.indexOf(lang);
    const nextIndex = (currentIndex + 1) % langs.length;
    setLang(langs[nextIndex]);
  };

  const [activeTab, setActiveTab] = useState<Tab>("oracle");
  
  // Oracle / Liu Yao State
  const [oracleStep, setOracleStep] = useState<"question" | "toss" | "result">("question");
  const [oracleQuestion, setOracleQuestion] = useState("");
  const [hexagram, setHexagram] = useState<number[]>([]); // 6 lines, each 0-3 (heads count)
  const [currentToss, setCurrentToss] = useState<number[] | null>(null); // 3 coins
  const [isTossing, setIsTossing] = useState(false);
  const [oracleAnswer, setOracleAnswer] = useState("");
  const [isOracleLoading, setIsOracleLoading] = useState(false);

  // Energy State
  const [dailyEnergy, setDailyEnergy] = useState<DailyEnergy | null>(null);
  const [isEnergyLoading, setIsEnergyLoading] = useState(false);
  const [energyInput, setEnergyInput] = useState("");
  const [ascendingResult, setAscendingResult] = useState<any>(null);
  const [emergencyResult, setEmergencyResult] = useState<any>(null);
  const [isAscendingLoading, setIsAscendingLoading] = useState(false);
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);

  // Feng Shui State
  const [fsDesk, setFsDesk] = useState("");
  const [fsBed, setFsBed] = useState("");
  const [fsRoom, setFsRoom] = useState("");
  const [fsAdvice, setFsAdvice] = useState("");
  const [isFsLoading, setIsFsLoading] = useState(false);

  const [fsImage, setFsImage] = useState<string | null>(null);
  const [isFsImageLoading, setIsFsImageLoading] = useState(false);
  const [fsImageAdvice, setFsImageAdvice] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFsImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFsImage = async () => {
    if (!fsImage) return;
    setIsFsImageLoading(true);
    try {
      const advice = await getFengShuiImageAdvice(fsImage, lang);
      setFsImageAdvice(advice || "");
    } catch (err) {
      console.error(err);
    } finally {
      setIsFsImageLoading(false);
    }
  };

  const tossCoins = () => {
    if (hexagram.length >= 6 || isTossing) return;
    setIsTossing(true);
    setCurrentToss(null);
    
    // Simulate toss
    setTimeout(() => {
      const newToss = [
        Math.random() > 0.5 ? 1 : 0,
        Math.random() > 0.5 ? 1 : 0,
        Math.random() > 0.5 ? 1 : 0,
      ];
      const headsCount = newToss.filter(c => c === 1).length;
      setCurrentToss(newToss);
      setHexagram([...hexagram, headsCount]);
      setIsTossing(false);
    }, 1200);
  };

  const resetOracle = () => {
    setHexagram([]);
    setCurrentToss(null);
    setOracleAnswer("");
    setOracleQuestion("");
    setOracleStep("question");
  };

  const askOracle = async () => {
    if (!oracleQuestion.trim() || hexagram.length < 6) return;
    setIsOracleLoading(true);
    setOracleAnswer(""); // Clear previous answer
    try {
      const answer = await getOracleInterpretation(oracleQuestion, hexagram, lang);
      if (answer) {
        setOracleAnswer(answer);
        setOracleStep("result");
      } else {
        throw new Error("No answer received");
      }
    } catch (err) {
      console.error("Oracle API Error:", err);
      alert(lang === "zh" ? "神谕暂时无法连接，请稍后再试。" : "The Oracle is currently disconnected. Please try again later.");
    } finally {
      setIsOracleLoading(false);
    }
  };

  const generateEnergy = async () => {
    setIsEnergyLoading(true);
    try {
      const data = await getDailyEnergy(lang);
      setDailyEnergy(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnergyLoading(false);
    }
  };

  const handleAscendingWisdom = async () => {
    if (!energyInput.trim()) return;
    setIsAscendingLoading(true);
    setAscendingResult(null);
    setEmergencyResult(null);
    try {
      const result = await getAscendingWisdom(energyInput, lang);
      setAscendingResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAscendingLoading(false);
    }
  };

  const handleEmergencyRescue = async () => {
    if (!energyInput.trim()) return;
    setIsEmergencyLoading(true);
    setEmergencyResult(null);
    setAscendingResult(null);
    try {
      const result = await getEmergencyRescue(energyInput, lang);
      setEmergencyResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEmergencyLoading(false);
    }
  };

  const getFengShuiAdviceHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFsLoading(true);
    try {
      const advice = await getFengShuiAdvice(fsDesk, fsBed, fsRoom, lang);
      setFsAdvice(advice || "");
    } catch (err) {
      console.error(err);
    } finally {
      setIsFsLoading(false);
    }
  };

  const renderLine = (heads: number) => {
    const isSolid = heads === 1 || heads === 3;
    const isChanging = heads === 0 || heads === 3;

    return (
      <div className="flex items-center justify-center gap-4 w-full h-4 relative">
        {isSolid ? (
          <div className={`w-32 h-2 rounded-full transition-colors duration-700 ${isDark ? 'bg-white' : 'bg-ink'}`} />
        ) : (
          <div className="flex gap-4 w-32 justify-between">
            <div className={`w-14 h-2 rounded-full transition-colors duration-700 ${isDark ? 'bg-white' : 'bg-ink'}`} />
            <div className={`w-14 h-2 rounded-full transition-colors duration-700 ${isDark ? 'bg-white' : 'bg-ink'}`} />
          </div>
        )}
        {isChanging && (
          <div className={`absolute right-[-24px] w-4 h-4 rounded-full border-2 transition-colors duration-700 ${heads === 3 ? 'border-vermilion bg-vermilion/20' : isDark ? 'border-white flex items-center justify-center' : 'border-ink flex items-center justify-center'}`}>
            {heads === 0 && <span className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-ink'}`}>×</span>}
          </div>
        )}
      </div>
    );
  };

  const ScrollingSuggestions = ({ suggestions, onSelect, lang }: { suggestions: string[], onSelect: (s: string) => void, lang: Language }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % suggestions.length);
      }, 4000);
      return () => clearInterval(timer);
    }, [suggestions.length]);

    return (
      <div className={`mt-8 pt-6 border-t transition-colors duration-700 ${isDark ? 'border-white/5' : 'border-ink/5'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-1 rounded-full bg-vermilion animate-pulse" />
          <span className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-700 ${isDark ? 'text-white/20' : 'text-ink/30'}`}>
            {translations[lang].suggestionsTitle}
          </span>
        </div>
        <div className="relative h-14 overflow-hidden cursor-pointer group" onClick={() => onSelect(suggestions[index])}>
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ y: 30, opacity: 0, filter: "blur(8px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -30, opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className={`absolute inset-0 flex items-center text-sm md:text-base font-serif italic transition-all duration-500 leading-relaxed ${isDark ? 'text-white/40 group-hover:text-white' : 'text-ink/50 group-hover:text-vermilion'}`}
            >
              {suggestions[index]}
            </motion.div>
          </AnimatePresence>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={16} className={isDark ? "text-white" : "text-vermilion"} />
          </div>
        </div>
      </div>
    );
  };

  const PhilosophyCard = ({ card }: { card: any }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
      <div 
        className="relative h-[320px] w-full cursor-pointer perspective-1000 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="relative w-full h-full transition-all duration-700 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Front */}
          <div className={`absolute inset-0 backface-hidden eastern-card p-8 flex flex-col justify-between transition-colors duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-ink/5'}`}>
            <div className="relative z-10">
              <div className="text-[10px] font-bold text-vermilion uppercase tracking-[0.2em] mb-4 opacity-80">{card.source}</div>
              <p className={`text-xl font-serif leading-relaxed italic transition-colors duration-700 ${isDark ? 'text-white/90' : 'text-ink'}`}>
                "{card.originalText}"
              </p>
            </div>
            
            {/* Decorative Element */}
            <div className={`absolute top-0 right-0 w-24 h-24 opacity-[0.03] transition-colors duration-700 ${isDark ? 'text-white' : 'text-ink'}`}>
              <Quote size={96} />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-[1px] bg-vermilion/30" />
              <div className="text-[10px] font-bold text-vermilion uppercase tracking-[0.2em] group-hover:scale-110 transition-transform duration-500">
                {t.tapToReveal}
              </div>
            </div>
          </div>

          {/* Back */}
          <div 
            className={`absolute inset-0 backface-hidden eastern-card p-8 flex flex-col rotate-y-180 transition-colors duration-700 ${isDark ? 'bg-white/10 border-white/20' : 'bg-paper border-ink/10'}`}
          >
            <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 transition-colors duration-700 ${isDark ? 'text-white/40' : 'text-ink/30'}`}>{t.interpretation}</div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <p className={`text-base font-serif leading-relaxed transition-colors duration-700 ${isDark ? 'text-white/80' : 'text-ink/80'}`}>
                {card.interpretation}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
               <div className="w-1.5 h-1.5 rounded-full bg-vermilion/40" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans relative overflow-x-hidden transition-colors duration-700 ${isDark ? 'dark bg-black text-white' : 'bg-paper text-ink'}`}>
      <ZenBackground isDark={isDark} mousePos={mousePos} />
      
      {/* Header */}
      <header className={`py-10 px-4 text-center border-b relative transition-all duration-700 ${isDark ? 'border-white/5 bg-black/20' : 'border-ink/5 bg-white/20'} backdrop-blur-sm`}>
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-full border transition-all duration-300 ${isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-ink/10 bg-white/50 text-ink hover:bg-black/5'}`}
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={cycleLanguage}
            className={`flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border transition-all duration-300 ${isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-ink/10 bg-white/50 text-ink hover:bg-vermilion hover:text-white hover:border-vermilion'}`}
          >
            <Languages size={12} />
            <span>{lang.toUpperCase()}</span>
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        >
          <h1 className={`text-4xl md:text-5xl font-serif mb-2 tracking-tight transition-colors duration-700 ${isDark ? 'text-white' : 'text-ink'}`}>
            {t.title} <span className="text-vermilion italic">AI</span>
          </h1>
          <p className={`font-serif italic text-sm md:text-base tracking-wide transition-colors duration-700 ${isDark ? 'text-white/40' : 'text-ink/40'}`}>
            {t.subtitle}
          </p>
        </motion.div>
      </header>

      {/* Navigation */}
      <nav className={`flex justify-center gap-2 p-4 sticky top-0 backdrop-blur-xl z-10 border-b transition-all duration-700 ${isDark ? 'bg-black/40 border-white/5' : 'bg-paper/40 border-ink/5'}`}>
        <div className={`p-1 rounded-full border flex gap-1 shadow-sm transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-ink/5'}`}>
          {[
            { id: "oracle", icon: Sparkles, label: t.oracle },
            { id: "energy", icon: Wind, label: t.energy },
            { id: "fengshui", icon: Compass, label: t.fengshui },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-500 text-[10px] uppercase tracking-widest font-bold ${
                activeTab === item.id
                  ? (isDark ? "bg-white text-black shadow-lg shadow-white/10" : "bg-ink text-paper shadow-lg shadow-ink/20")
                  : (isDark ? "text-white/40 hover:text-white hover:bg-white/5" : "text-ink/40 hover:text-ink hover:bg-white/50")
              }`}
            >
              <item.icon size={12} />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-md md:max-w-2xl mx-auto w-full p-4 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === "oracle" && (
            <motion.div
              key="oracle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <AnimatePresence mode="wait">
                {oracleStep === "question" && (
                  <motion.div
                    key="step-q"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`eastern-card p-8 transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-ink/5'}`}
                  >
                    <h2 className={`text-2xl font-serif mb-8 flex items-center gap-3 transition-colors duration-700 ${isDark ? 'text-white' : 'text-ink'}`}>
                      <span className="text-vermilion font-bold">01</span> {t.questionStep}
                    </h2>
                    <div className="space-y-8">
                      <div className="relative">
                        <textarea
                          value={oracleQuestion}
                          onChange={(e) => setOracleQuestion(e.target.value)}
                          placeholder={t.placeholderQuestion}
                          className={`w-full border rounded-[2rem] px-8 py-6 text-lg min-h-[200px] focus:outline-none focus:ring-4 transition-all resize-none font-serif leading-relaxed ${
                            isDark 
                              ? 'bg-white/5 border-white/10 text-white placeholder:text-white/10 focus:ring-white/5 focus:border-white/20' 
                              : 'bg-paper/30 border-ink/10 text-ink placeholder:text-ink/20 focus:ring-vermilion/5 focus:border-vermilion/20'
                          }`}
                        />
                        <div className={`absolute bottom-6 right-8 text-[10px] font-mono transition-colors duration-700 ${isDark ? 'text-white/20' : 'text-ink/20'}`}>
                          {oracleQuestion.length} / 200
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setOracleStep("toss")}
                        disabled={!oracleQuestion.trim()}
                        className={`w-full py-4 rounded-full font-bold tracking-widest uppercase text-xs transition-all duration-500 shadow-lg ${
                          !oracleQuestion.trim()
                            ? "opacity-20 grayscale cursor-not-allowed"
                            : isDark 
                              ? "bg-white text-black hover:scale-[1.02] shadow-white/10" 
                              : "bg-vermilion text-white hover:scale-[1.02] shadow-vermilion/20"
                        }`}
                      >
                        <span className="flex items-center justify-center gap-3">
                          {t.startDivination} <ChevronRight size={16} />
                        </span>
                      </button>

                      <ScrollingSuggestions 
                        lang={lang}
                        suggestions={t.suggestedQuestions} 
                        onSelect={(s) => setOracleQuestion(s)} 
                      />
                    </div>
                  </motion.div>
                )}

                {oracleStep === "toss" && (
                  <motion.div
                    key="step-t"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="eastern-card p-6"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-serif flex items-center gap-2">
                        <span className="text-vermilion font-bold">02</span> {t.tossStep}
                      </h2>
                      <button onClick={() => setOracleStep("question")} className="text-xs text-ink/40 hover:text-ink">
                        {t.back}
                      </button>
                    </div>

                    <div className={`rounded-2xl p-8 border flex flex-col items-center gap-10 transition-colors duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-paper/50 border-ink/5'}`}>
                      <div className="flex gap-8">
                        {[0, 1, 2].map((i) => (
                          <ZenCoin 
                            key={i} 
                            index={i} 
                            isTossing={isTossing} 
                            result={currentToss ? currentToss[i] : null} 
                            isDark={isDark}
                          />
                        ))}
                      </div>
                      
                      <div className="flex flex-col items-center gap-4 w-full">
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={tossCoins}
                            disabled={isTossing || hexagram.length >= 6}
                            className={`flex-1 group relative overflow-hidden px-10 py-4 rounded-full font-bold tracking-widest uppercase text-xs transition-all duration-500 ${
                              isTossing || hexagram.length >= 6
                                ? "opacity-20 grayscale cursor-not-allowed"
                                : isDark 
                                  ? "bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10" 
                                  : "bg-ink text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-ink/20"
                            }`}
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {isTossing ? <RefreshCw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                              {hexagram.length < 6 ? t.tossCoins : t.hexagramResult}
                            </span>
                          </button>
                          <button
                            onClick={resetOracle}
                            className={`p-4 rounded-full transition-all duration-300 ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-ink/5 text-ink hover:bg-ink/10'}`}
                            title={t.reset}
                          >
                            <RotateCcw size={18} />
                          </button>
                        </div>
                        
                        <div className={`text-[10px] font-mono tracking-widest uppercase transition-colors duration-700 ${isDark ? 'text-white/40' : 'text-ink/40'}`}>
                          {t.tossCount.replace("{count}", hexagram.length.toString())}
                        </div>
                      </div>
                    </div>

                    {hexagram.length > 0 && (
                      <div className="flex flex-col-reverse items-center gap-3 py-6 border-t border-ink/5 mt-6">
                        {hexagram.map((heads, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            className="w-full flex justify-center"
                          >
                            {renderLine(heads)}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {hexagram.length === 6 && (
                      <button
                        onClick={askOracle}
                        disabled={isOracleLoading}
                        className="vermilion-button w-full flex items-center justify-center gap-2 mt-4"
                      >
                        {isOracleLoading ? <Loader2 className="animate-spin" size={18} /> : t.interpret}
                      </button>
                    )}
                  </motion.div>
                )}

                {oracleStep === "result" && (
                  <motion.div
                    key="step-r"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-[100] overflow-y-auto p-4 md:p-10 flex flex-col transition-colors duration-700 ${isDark ? 'bg-black' : 'bg-[#F5F2ED]'}`}
                  >
                    <ZenBackground isDark={isDark} mousePos={mousePos} />
                    
                    <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col pt-10 pb-20">
                      <div className="flex justify-between items-center mb-12">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-ink text-paper'}`}>
                            <Quote size={20} />
                          </div>
                          <h2 className={`text-3xl font-serif transition-colors duration-700 ${isDark ? 'text-white' : 'text-ink'}`}>
                            {t.ascendingWisdom}
                          </h2>
                        </div>
                        <button 
                          onClick={resetOracle}
                          className={`p-3 rounded-full transition-all duration-300 ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-ink/5 text-ink hover:bg-ink/10'}`}
                          title={t.reset}
                        >
                          <X size={24} />
                        </button>
                      </div>

                      <div className={`eastern-card p-8 md:p-12 shadow-2xl transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-ink/5'}`}>
                        <div className={`mb-12 p-6 rounded-2xl border italic text-lg font-serif transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10 text-white/60' : 'bg-paper border-ink/5 text-ink/70'}`}>
                          "{oracleQuestion}"
                        </div>
                        
                        <div className="flex flex-col-reverse items-center gap-3 mb-16 opacity-40 scale-90">
                          {hexagram.map((heads, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ scaleX: 0, opacity: 0 }}
                              animate={{ scaleX: 1, opacity: 1 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              {renderLine(heads)}
                            </motion.div>
                          ))}
                        </div>

                        <div className={`prose max-w-none transition-colors duration-700 ${isDark ? 'prose-invert prose-p:text-white/80 prose-headings:text-white' : 'prose-ink prose-p:text-ink/80 prose-headings:text-ink'}`}>
                          <Markdown>{oracleAnswer}</Markdown>
                        </div>
                        
                        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
                           <div className="w-12 h-[1px] bg-vermilion/30" />
                           <button
                            onClick={resetOracle}
                            className={`px-12 py-4 rounded-full font-bold tracking-widest uppercase text-xs transition-all duration-500 ${isDark ? 'bg-white text-black hover:scale-105 shadow-lg shadow-white/10' : 'bg-ink text-white hover:scale-105 shadow-lg shadow-ink/20'}`}
                          >
                            {t.back}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "energy" && (
            <motion.div
              key="energy"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Unified Input Section */}
              <div className={`eastern-card p-8 md:p-10 space-y-8 transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-ink/5'}`}>
                <div className="flex items-center gap-4 mb-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-700 ${isDark ? 'bg-white/10 text-white' : 'bg-vermilion/10 text-vermilion'}`}>
                    <Brain size={24} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-serif transition-colors duration-700 ${isDark ? 'text-white' : 'text-ink'}`}>{t.energy}</h2>
                    <p className={`text-xs italic transition-colors duration-700 ${isDark ? 'text-white/40' : 'text-ink/60'}`}>{t.energyDesc}</p>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={energyInput}
                    onChange={(e) => setEnergyInput(e.target.value)}
                    placeholder={t.energyInputPlaceholder}
                    className={`w-full border rounded-[2rem] px-8 py-6 text-lg min-h-[200px] focus:outline-none focus:ring-4 transition-all resize-none font-serif leading-relaxed ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/10 focus:ring-white/5 focus:border-white/20' 
                        : 'bg-paper/30 border-ink/10 text-ink placeholder:text-ink/20 focus:ring-vermilion/5 focus:border-vermilion/20'
                    }`}
                  />
                  <div className={`absolute bottom-6 right-8 text-[10px] font-mono transition-colors duration-700 ${isDark ? 'text-white/20' : 'text-ink/20'}`}>
                    {energyInput.length} / 500
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAscendingWisdom}
                    disabled={isAscendingLoading || isEmergencyLoading || !energyInput.trim()}
                    className={`py-4 rounded-full font-bold tracking-widest uppercase text-[10px] flex items-center justify-center gap-2 transition-all duration-500 shadow-lg ${
                      isAscendingLoading || isEmergencyLoading || !energyInput.trim()
                        ? "opacity-20 grayscale cursor-not-allowed"
                        : isDark 
                          ? "bg-white text-black hover:scale-105 shadow-white/10" 
                          : "bg-vermilion text-white hover:scale-105 shadow-vermilion/20"
                    }`}
                  >
                    {isAscendingLoading ? <Loader2 className="animate-spin" size={14} /> : <><Sparkles size={14} /> {t.ascendingWisdom}</>}
                  </button>
                  <button
                    onClick={handleEmergencyRescue}
                    disabled={isAscendingLoading || isEmergencyLoading || !energyInput.trim()}
                    className={`py-4 rounded-full font-bold tracking-widest uppercase text-[10px] flex items-center justify-center gap-2 transition-all duration-500 shadow-lg ${
                      isAscendingLoading || isEmergencyLoading || !energyInput.trim()
                        ? "opacity-20 grayscale cursor-not-allowed"
                        : isDark 
                          ? "bg-white/10 text-white border border-white/10 hover:bg-white/20 shadow-white/5" 
                          : "bg-ink text-paper hover:bg-ink/90 shadow-ink/10"
                    }`}
                  >
                    {isEmergencyLoading ? <Loader2 className="animate-spin" size={14} /> : <><Zap size={14} /> {t.emergencyRescue}</>}
                  </button>
                </div>
              </div>

              {/* Results Section */}
              <AnimatePresence mode="wait">
                {ascendingResult && (
                  <motion.div
                    key="ascending-result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Wisdom Insight */}
                    <div className={`eastern-card p-10 relative overflow-hidden space-y-8 transition-colors duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-ink/5'}`}>
                      <div className="absolute top-0 left-0 w-full h-1 bg-vermilion/40" />
                      <h3 className={`text-[10px] font-bold uppercase tracking-[0.4em] mb-2 transition-colors duration-700 ${isDark ? 'text-white/30' : 'text-vermilion'}`}>{t.todaysInsight}</h3>
                      
                      <div className="space-y-8">
                        <p className={`text-xl font-serif leading-relaxed italic border-l-4 border-vermilion/30 pl-8 py-2 transition-colors duration-700 ${isDark ? 'text-white/90' : 'text-ink'}`}>
                          {ascendingResult.empatheticOpening}
                        </p>
                        
                        <div className={`text-lg font-serif leading-relaxed space-y-6 transition-colors duration-700 ${isDark ? 'text-white/70' : 'text-ink/80'}`}>
                          <Markdown>{ascendingResult.wisdomAnalysis}</Markdown>
                        </div>
                      </div>
                    </div>

                    {/* Philosophy Cards */}
                    <div className={`grid grid-cols-1 gap-4 ${ascendingResult.philosophyCards.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                      {ascendingResult.philosophyCards.map((card: any, idx: number) => (
                        <PhilosophyCard key={idx} card={card} />
                      ))}
                    </div>

                    {/* Action Tasks */}
                    <div className={`eastern-card p-10 transition-colors duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-ink/5'}`}>
                      <h3 className={`text-[10px] font-bold uppercase tracking-[0.4em] mb-8 transition-colors duration-700 ${isDark ? 'text-white/20' : 'text-ink/30'}`}>{t.actionTasks}</h3>
                      <div className="space-y-4">
                        {ascendingResult.actionTasks.map((task: string, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex items-center gap-4 p-5 rounded-2xl border group transition-all duration-500 ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10' : 'bg-paper/50 border-ink/5 hover:bg-white hover:shadow-sm'}`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-700 ${isDark ? 'bg-white/10 text-white' : 'bg-vermilion/10 text-vermilion'}`}>
                              {idx + 1}
                            </div>
                            <p className={`font-serif text-base transition-colors duration-700 ${isDark ? 'text-white/80' : 'text-ink/80'}`}>{task}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {emergencyResult && (
                  <motion.div
                    key="emergency-result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-6">
                      {emergencyResult.suggestions.map((suggestion: any, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`relative p-8 rounded-[2rem] border-2 flex flex-col sm:flex-row gap-6 items-start transition-all duration-500 shadow-sm ${
                            suggestion.difficulty === "Hard" 
                              ? "bg-vermilion text-white border-vermilion shadow-vermilion/20" 
                              : suggestion.difficulty === "Medium"
                              ? isDark ? "bg-white/10 border-white/20 text-white shadow-none" : "bg-white border-vermilion/20 text-ink shadow-black/5"
                              : isDark ? "bg-white/5 border-white/10 text-white/80 shadow-none" : "bg-stone-100 border-stone-200 text-ink shadow-black/5"
                          }`}
                        >
                          {/* Large Number Indicator */}
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 shadow-inner transition-colors duration-500 ${
                            suggestion.difficulty === "Hard" 
                              ? "bg-white text-vermilion" 
                              : isDark ? "bg-white/20 text-white" : "bg-vermilion text-white"
                          }`}>
                            {suggestion.id}
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <h4 className="text-xl font-serif font-bold tracking-tight">
                                {suggestion.title}
                              </h4>
                              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border-2 transition-colors duration-500 ${
                                suggestion.difficulty === "Hard" 
                                  ? "border-white/30 text-white" 
                                  : isDark ? "border-white/20 text-white/60" : "border-vermilion/20 text-vermilion"
                              }`}>
                                {suggestion.difficulty}
                              </span>
                            </div>
                            <p className={`text-base leading-relaxed font-medium transition-colors duration-500 ${
                              suggestion.difficulty === "Hard" ? "text-white/90" : isDark ? "text-white/70" : "text-ink/80"
                            }`}>
                              {suggestion.content}
                            </p>
                          </div>

                          {/* Difficulty Progress Indicator (Visual) */}
                          <div className="absolute top-4 right-8 flex gap-1">
                            {[1, 2, 3].map((step) => (
                              <div 
                                key={step}
                                className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                                  step <= (suggestion.difficulty === "Easy" ? 1 : suggestion.difficulty === "Medium" ? 2 : 3)
                                    ? (suggestion.difficulty === "Hard" ? "bg-white" : isDark ? "bg-white" : "bg-vermilion")
                                    : (suggestion.difficulty === "Hard" ? "bg-white/20" : isDark ? "bg-white/10" : "bg-vermilion/10")
                                }`}
                              />
                            ))}
                          </div>
                        </motion.div>
                      ))}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className={`p-10 text-center italic rounded-[2.5rem] shadow-2xl relative overflow-hidden transition-all duration-700 ${isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-ink text-white'}`}
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-vermilion" />
                        <Quote className={`mx-auto mb-6 transition-colors duration-700 ${isDark ? 'text-white/40' : 'text-vermilion'}`} size={32} />
                        <p className={`text-xl font-serif leading-relaxed max-w-2xl mx-auto transition-colors duration-700 ${isDark ? 'text-white/80' : 'text-white'}`}>
                          {emergencyResult.shortQuote}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "fengshui" && (
            <motion.div
              key="fengshui"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Text Advice */}
              <div className={`eastern-card p-10 transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-ink/5'}`}>
                <h2 className={`text-2xl font-serif mb-8 flex items-center gap-3 transition-colors duration-700 ${isDark ? 'text-white' : 'text-ink'}`}>
                  <Compass className="text-vermilion" size={24} /> {t.fsTitle}
                </h2>
                <form onSubmit={getFengShuiAdviceHandler} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 transition-colors duration-700 ${isDark ? 'text-white/20' : 'text-ink/30'}`}>{t.fsDesk}</label>
                      <input
                        type="text"
                        value={fsDesk}
                        onChange={(e) => setFsDesk(e.target.value)}
                        placeholder="e.g. North"
                        className={`w-full border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 transition-all ${
                          isDark 
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/10 focus:ring-white/5 focus:border-white/20' 
                            : 'bg-paper/30 border-ink/10 text-ink placeholder:text-ink/20 focus:ring-vermilion/5 focus:border-vermilion/20'
                        }`}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 transition-colors duration-700 ${isDark ? 'text-white/20' : 'text-ink/30'}`}>{t.fsBed}</label>
                      <input
                        type="text"
                        value={fsBed}
                        onChange={(e) => setFsBed(e.target.value)}
                        placeholder="e.g. East"
                        className={`w-full border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 transition-all ${
                          isDark 
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/10 focus:ring-white/5 focus:border-white/20' 
                            : 'bg-paper/30 border-ink/10 text-ink placeholder:text-ink/20 focus:ring-vermilion/5 focus:border-vermilion/20'
                        }`}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 transition-colors duration-700 ${isDark ? 'text-white/20' : 'text-ink/30'}`}>{t.fsRoom}</label>
                      <input
                        type="text"
                        value={fsRoom}
                        onChange={(e) => setFsRoom(e.target.value)}
                        placeholder="e.g. South"
                        className={`w-full border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 transition-all ${
                          isDark 
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/10 focus:ring-white/5 focus:border-white/20' 
                            : 'bg-paper/30 border-ink/10 text-ink placeholder:text-ink/20 focus:ring-vermilion/5 focus:border-vermilion/20'
                        }`}
                      />
                    </div>
                  </div>
                  <button
                    disabled={isFsLoading}
                    className={`w-full py-4 rounded-full font-bold tracking-widest uppercase text-xs transition-all duration-500 shadow-lg ${
                      isFsLoading
                        ? "opacity-20 grayscale cursor-not-allowed"
                        : isDark 
                          ? "bg-white text-black hover:scale-[1.02] shadow-white/10" 
                          : "bg-vermilion text-white hover:scale-[1.02] shadow-vermilion/20"
                    }`}
                  >
                    {isFsLoading ? <Loader2 className="animate-spin" size={18} /> : <span>{t.getAdvice}</span>}
                  </button>
                </form>

                {fsAdvice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`mt-10 pt-10 border-t transition-colors duration-700 ${isDark ? 'border-white/10 prose-invert prose-p:text-white/70 prose-headings:text-white' : 'border-ink/5 prose-ink prose-p:text-ink/70 prose-headings:text-ink'} prose prose-sm max-w-none`}
                  >
                    <Markdown>{fsAdvice}</Markdown>
                  </motion.div>
                )}
              </div>

              {/* Image Analysis */}
              <div className={`eastern-card p-10 transition-all duration-700 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-ink/5'}`}>
                <h2 className={`text-2xl font-serif mb-3 flex items-center gap-3 transition-colors duration-700 ${isDark ? 'text-white' : 'text-ink'}`}>
                  <Sparkles className="text-gold" size={24} /> {t.uploadFloorPlan}
                </h2>
                <p className={`text-sm mb-10 font-serif italic transition-colors duration-700 ${isDark ? 'text-white/40' : 'text-ink/40'}`}>
                  {t.uploadDesc}
                </p>

                <div className="space-y-8">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="fs-image-upload"
                    />
                    <label
                      htmlFor="fs-image-upload"
                      className={`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-[2.5rem] cursor-pointer transition-all duration-500 overflow-hidden shadow-inner ${
                        isDark 
                          ? 'bg-white/5 border-white/10 hover:border-gold/50 hover:bg-white/10' 
                          : 'bg-paper/30 border-ink/10 hover:border-gold/50 hover:bg-white/50'
                      }`}
                    >
                      {fsImage ? (
                        <img src={fsImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className={`flex flex-col items-center transition-colors ${isDark ? 'text-white/20 group-hover:text-gold' : 'text-ink/20 group-hover:text-gold'}`}>
                          <Wind size={64} className="mb-6 opacity-50" />
                          <span className="text-xs font-bold uppercase tracking-[0.2em]">{t.uploadFloorPlan}</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {fsImage && (
                    <button
                      onClick={analyzeFsImage}
                      disabled={isFsImageLoading}
                      className={`w-full py-4 rounded-full font-bold tracking-widest uppercase text-xs transition-all duration-500 shadow-lg ${
                        isFsImageLoading
                          ? "opacity-20 grayscale cursor-not-allowed"
                          : isDark 
                            ? "bg-white text-black hover:scale-[1.02] shadow-white/10" 
                            : "bg-vermilion text-white hover:scale-[1.02] shadow-vermilion/20"
                      }`}
                    >
                      {isFsImageLoading ? <Loader2 className="animate-spin" size={18} /> : <span>{t.getAdvice}</span>}
                    </button>
                  )}
                </div>

                {fsImageAdvice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`mt-10 pt-10 border-t transition-colors duration-700 ${isDark ? 'border-white/10' : 'border-ink/5'}`}
                  >
                    <h3 className="text-[10px] font-bold text-vermilion mb-6 uppercase tracking-[0.4em]">{t.imageAdvice}</h3>
                    <div className={`prose prose-sm max-w-none transition-colors duration-700 ${isDark ? 'prose-invert prose-p:text-white/70 prose-headings:text-white' : 'prose-ink prose-p:text-ink/70 prose-headings:text-ink'}`}>
                      <Markdown>{fsImageAdvice}</Markdown>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-ink/30 text-[10px] font-serif italic">
        <p>© {new Date().getFullYear()} Eastern Wisdom AI.</p>
      </footer>
    </div>
  );
}
