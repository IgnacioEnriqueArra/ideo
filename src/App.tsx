import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './AppContext';
import { Feed } from './components/Feed';
import { IdeaDetail } from './components/IdeaDetail';
import { Profile } from './components/Profile';
import { NewsFeed } from './components/NewsFeed';
import { Notifications } from './components/Notifications';
import { Bookmarks } from './components/Bookmarks';
import { Messages } from './components/Messages';
import { Layout } from './components/Layout';
import { ComposeModal } from './components/ComposeModal';
import { Settings } from './components/Settings';
import { AdminDashboard } from './components/AdminDashboard';
import { Communities } from './components/Communities';
import { AnimatePresence } from 'motion/react';

function AppContent() {
  const { currentUser, isAuthReady, isAuthModalOpen, setAuthModalOpen } = useAppContext();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 640);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 640);
    const handleOpenPost = (e: any) => {
      setSelectedIdeaId(e.detail);
      setActiveTab('home'); // Ensure we are on home to see the detail
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('open-post', handleOpenPost);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('open-post', handleOpenPost);
    };
  }, []);

  // Admin logic for PC
  const isAdminPath = window.location.pathname === '/agent';

  if (isDesktop && isAdminPath) {
    if (!isAuthReady) {
      return (
        <div className="h-screen w-full bg-white flex items-center justify-center">
          <div className="animate-pulse text-4xl font-black text-primary tracking-tighter">fork.</div>
        </div>
      );
    }

    if (!currentUser || currentUser.email !== 'ignacioarra.it@gmail.com') {
      return (
        <div className="h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full">
            {!currentUser ? (
              <AuthScreen />
            ) : (
              <div className="bg-white p-8 rounded-[2.5rem] border border-red-100 shadow-xl text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                  ✕
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Restricted Access</h2>
                <p className="text-gray-500 mb-8">This section is for authorized administrators only.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-primary text-white font-bold py-4 rounded-full hover:bg-blue-600 transition-all"
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen w-full bg-gray-50 overflow-hidden">
         <AdminDashboard onBack={() => window.location.href = '/'} />
      </div>
    );
  }

  if (!isAuthReady) {
    return (
      <div className="h-[100dvh] w-full bg-white dark:bg-gray-950 max-w-md mx-auto border-x border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-6 transition-colors">
        <div className="mb-6 animate-pulse">
          <span className="text-4xl font-black text-primary tracking-tighter">fork.</span>
        </div>
      </div>
    );
  }

  // Guest can see the feed
  // if (!currentUser) {
  //   return <AuthScreen />;
  // }

  const renderContent = () => {
    if (selectedUserId) {
      return (
        <Profile 
          key="profile-view" 
          userId={selectedUserId} 
          onBack={() => setSelectedUserId(null)} 
        />
      );
    }

    if (selectedIdeaId) {
      return (
        <IdeaDetail 
          key="detail"
          ideaId={selectedIdeaId} 
          onBack={() => setSelectedIdeaId(null)} 
          onUserClick={(id) => {
            if (!currentUser) {
              setAuthModalOpen(true);
            } else {
              setSelectedUserId(id);
            }
          }}
        />
      );
    }
    
    switch (activeTab) {
      case 'profile':
        return <Profile key="profile" onBack={() => setActiveTab('home')} />;
      case 'communities':
        return <Communities key="communities" onBack={() => setActiveTab('home')} />;
      case 'news':
        return <NewsFeed key="news" />;
      case 'notifications':
        return <Notifications key="notifications" onUserClick={setSelectedUserId} />;
      case 'bookmarks':
        return <Bookmarks key="bookmarks" onBack={() => setActiveTab('home')} onUserClick={setSelectedUserId} />;
      case 'settings':
        return <Settings key="settings" onBack={() => setActiveTab('home')} />;
      case 'messages':
        return <Messages key="messages" />;
      default:
        return (
          <Feed 
            key="feed" 
            onSelectIdea={(id) => {
              if (!currentUser && viewCount >= 3) {
                setAuthModalOpen(true);
              } else {
                setSelectedIdeaId(id);
                if (!currentUser) setViewCount(prev => prev + 1);
              }
            }} 
            onUserClick={(id) => {
              if (!currentUser) {
                setAuthModalOpen(true);
              } else {
                setSelectedUserId(id);
              }
            }}
            onNotificationsClick={() => {
              if (!currentUser) {
                setAuthModalOpen(true);
              } else {
                setActiveTab('notifications');
              }
            }} 
          />
        );
    }
  };

  if (isAuthModalOpen) {
    return <AuthScreen onDone={() => setAuthModalOpen(false)} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        if (!currentUser && ['notifications', 'bookmarks', 'settings', 'messages', 'profile'].includes(tab)) {
          setAuthModalOpen(true);
          return;
        }
        setSelectedIdeaId(null);
        setSelectedUserId(null);
        setActiveTab(tab);
      }} 
      onCompose={() => {
        if (!currentUser) {
          setAuthModalOpen(true);
        } else {
          setIsComposeOpen(true);
        }
      }}
    >
      {!currentUser && activeTab === 'home' && !selectedIdeaId && !selectedUserId && (
        <div className="bg-primary/5 border-b border-primary/10 p-4 animate-in slide-in-from-top duration-500">
           <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Explore the best of <span className="font-bold text-primary">fork.</span> Create an account to join the conversation.</p>
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="shrink-0 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm"
              >
                Join now
              </button>
           </div>
        </div>
      )}
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
      <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const WORD_LIST = ["abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent", "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert", "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter", "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "anchor", "ancient", "anger", "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique", "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic", "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest", "arrive", "arrow", "art", "artefact", "artist", "artwork", "ask", "aspect", "assault", "asset", "assist", "assume", "asthma", "athlete", "atom", "attack", "attend", "attitude", "attract", "auction", "audit", "august", "aunt", "author", "auto", "autumn", "average", "avocado", "avoid", "awake", "aware", "away", "awesome", "awful", "awkward", "axis", "baby", "bachelor", "bacon", "badge", "bag", "balance", "balcony", "ball", "bamboo", "banana", "banner", "bar", "barely", "bargain", "barrel", "base", "basic", "basket", "battle", "beach", "bean", "beauty", "because", "become", "beef", "before", "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit", "best", "betray", "better", "between", "beyond", "bicycle", "bid", "bike", "bind", "biology", "bird", "birth", "bitter", "black", "blade", "blame", "blank", "blast", "blend", "bless", "blind", "blood", "blossom", "blouse", "blue", "blur", "blush", "board", "boat", "body", "boil", "bomb", "bone", "bonus", "book", "boost", "border", "boring", "borrow", "boss", "bottom", "bounce", "box", "boy", "bracket", "brain", "brand", "brass", "brave", "bread", "breeze", "brick", "bridge", "brief", "bright", "bring", "brisk", "broccoli", "broken", "bronze", "broom", "brother", "brown", "brush", "bubble", "buddy", "budget", "buffalo", "build", "bulb", "bulk", "bullet", "bundle", "bunker", "burden", "burger", "burst", "bus", "business", "busy", "butter", "buyer", "buzz", "cabbage", "cabin", "cable", "cactus", "cage", "cake", "call", "calm", "camera", "camp", "can", "canal", "cancel", "candy", "cannon", "canoe", "canvas", "canyon", "capable", "capital", "captain", "car", "carbon", "card", "cargo", "carpet", "carry", "cart", "case", "cash", "casino", "castle", "casual", "cat", "catalog", "catch", "category", "cattle", "caught", "cause", "caution", "cave", "ceiling", "celery", "cement", "census", "century", "cereal", "certain", "chair", "chalk", "champion", "change", "chaos", "chapter", "charge", "chase", "chat", "cheap", "check", "cheese", "chef", "cherry", "chest", "chicken", "chief", "child", "chimney", "choice", "choose", "chronic", "chuckle", "chunk", "churn", "cigar", "cinnamon", "circle", "citizen", "city", "civil", "claim", "clap", "clarify", "claw", "clay", "clean", "clerk", "clever", "click", "client", "cliff", "climb", "clinic", "clip", "clock", "clog", "close", "cloth", "cloud", "clown", "club", "clump", "cluster", "clutch", "coach", "coast", "coconut", "code", "coffee", "coil", "coin", "collect", "color", "column", "combine", "come", "comfort", "comic", "common", "company", "concert", "conduct", "confirm", "congress", "connect", "consider", "control", "convince", "cook", "cool", "copper", "copy", "coral", "core", "corn", "correct", "cost", "cotton", "couch", "country", "couple", "course", "cousin", "cover", "coyote", "crack", "cradle", "craft", "cram", "crane", "crash", "crater", "crawl", "crazy", "cream", "credit", "creek", "crew", "cricket", "crime", "crisp", "critic", "crop", "cross", "crouch", "crowd", "crucial", "cruel", "cruise", "crumble", "crunch", "crush", "cry", "crystal", "cube", "culture", "cup", "cupboard", "curious", "current", "curtain", "curve", "cushion", "custom", "cute", "cycle", "dad", "damage", "damp", "dance", "danger", "daring", "dash", "daughter", "dawn", "day", "deal", "debate", "debris", "decade", "december", "decide", "decline", "decorate", "decrease", "deer", "defense", "define", "defy", "degree", "delay", "deliver", "demand", "demise", "denial", "dentist", "deny", "depart", "depend", "deposit", "depth", "deputy", "derive", "describe", "desert", "design", "desk", "despair", "destroy", "detail", "detect", "develop", "device", "devote", "diagram", "dial", "diamond", "diary", "dice", "diesel", "diet", "differ", "digital", "dignity", "dilemma", "dinner", "dinosaur", "direct", "dirt", "disagree", "discover", "disease", "dish", "dismiss", "disorder", "display", "distance", "divert", "divide", "divorce", "dizzy", "doctor", "document", "dog", "doll", "dolphin", "domain", "donate", "donkey", "donor", "door", "dose", "double", "dove", "draft", "dragon", "drama", "drastic", "draw", "dream", "dress", "drift", "drill", "drink", "drip", "drive", "drop", "drum", "dry", "duck", "dumb", "dune", "during", "dust", "dutch", "duty", "dwarf", "dynamic", "eager", "eagle", "early", "earn", "earth", "easily", "east", "easy", "echo", "ecology", "economy", "edge", "edit", "educate", "effort", "egg", "eight", "either", "elbow", "elder", "electric", "elegant", "element", "elephant", "elevator", "elite", "else", "embark", "embody", "embrace", "emerge", "emotion", "employ", "empower", "empty", "enable", "enact", "end", "endless", "endorse", "enemy", "energy", "enforce", "engage", "engine", "enhance", "enjoy", "enlist", "enough", "enrich", "enroll", "ensure", "enter", "entire", "entry", "envelope", "episode", "equal", "equip", "era", "erase", "erode", "error", "erupt", "escape", "essay", "essence", "estate", "eternal", "ethics", "evidence", "evil", "evoke", "evolve", "exact", "example", "excess", "exchange", "excite", "exclude", "excuse", "execute", "exercise", "exhaust", "exhibit", "exile", "exist", "exit", "exotic", "expand", "expect", "expire", "explain", "expose", "express", "extend", "extra", "eye", "eyebrow", "fabric", "face", "facility", "fact", "fade", "fail", "faint", "fair", "faith", "fall", "false", "fame", "family", "famous", "fan", "fancy", "fantasy", "farm", "fashion", "fat", "fatal", "father", "fatigue", "fault", "favorite", "feature", "february", "federal", "fee", "feed", "feel", "female", "fence", "festival", "fetch", "fever", "few", "fiber", "fiction", "field", "figure", "file", "film", "filter", "final", "find", "fine", "finger", "finish", "fire", "firm", "first", "fiscal", "fish", "fit", "fitness", "fix", "flag", "flame", "flash", "flat", "flavor", "flee", "flight", "flip", "float", "flock", "floor", "flower", "fluid", "flush", "fly", "foam", "focus", "fog", "foil", "fold", "follow", "food", "foot", "force", "forest", "forget", "fork", "fortune", "forum", "forward", "fossil", "foster", "found", "fox", "fragile", "frame", "frequent", "fresh", "friend", "fringe", "frog", "front", "frost", "frown", "frozen", "fruit", "fuel", "fun", "funny", "furnace", "fury", "future", "gadget", "gain", "galaxy", "gallery", "game", "gap", "garage", "garbage", "garden", "garlic", "garment", "gas", "gasp", "gate", "gather", "gauge", "gaze", "general", "genius", "genre", "gentle", "genuine", "gesture", "ghost", "giant", "gift", "giggle", "ginger", "giraffe", "girl", "give", "glad", "glance", "glare", "glass", "glide", "glimpse", "globe", "gloom", "glory", "glove", "glow", "glue", "goat", "goddess", "gold", "good", "goose", "gorilla", "gospel", "gossip", "govern", "gown", "grab", "grace", "grain", "grant", "grape", "grass", "gravity", "great", "green", "grid", "grief", "grit", "grocery", "group", "grow", "grunt", "guard", "guess", "guide", "guilt", "guitar", "gun", "gym", "habit", "hair", "half", "hammer", "hamster", "hand", "happy", "harbor", "hard", "harsh", "harvest", "hat", "have", "hawk", "hazard", "head", "health", "heart", "heavy", "hedgehog", "height", "hello", "helmet", "help", "hen", "hero", "hidden", "high", "hill", "hint", "hip", "hire", "history", "hobby", "hockey", "hold", "hole", "holiday", "hollow", "home", "honey", "hood", "hope", "horn", "horror", "horse", "hospital", "host", "hotel", "hour", "hover", "hub", "huge", "human", "humble", "humor", "hundred", "hungry", "hunt", "hurdle", "hurry", "hurt", "husband", "hybrid", "ice", "icon", "idea", "identify", "idle", "ignore", "ill", "illegal", "illness", "image", "imitate", "immense", "immune", "impact", "impose", "improve", "impulse", "inch", "include", "income", "increase", "index", "indicate", "indoor", "industry", "infant", "inflict", "inform", "inhale", "inherit", "initial", "inject", "injury", "inmate", "inner", "innocent", "input", "inquiry", "insane", "insect", "inside", "inspire", "install", "intact", "interest", "into", "invest", "invite", "involve", "iron", "island", "isolate", "issue", "item", "ivory", "jacket", "jaguar", "jar", "jazz", "jealous", "jeans", "jelly", "jewel", "job", "join", "joke", "journey", "joy", "judge", "juice", "jump", "jungle", "junior", "junk", "just", "kangaroo", "keen", "keep", "ketchup", "key", "kick", "kid", "kidney", "kind", "kingdom", "kiss", "kit", "kitchen", "kite", "kitten", "kiwi", "knee", "knife", "knock", "know", "lab", "label", "labor", "ladder", "lady", "lake", "lamp", "language", "laptop", "large", "later", "latin", "laugh", "laundry", "lava", "law", "lawn", "lawsuit", "layer", "lazy", "leader", "leaf", "learn", "leave", "lecture", "left", "leg", "legal", "legend", "lemon", "lend", "length", "lens", "leopard", "lesson", "letter", "level", "liar", "liberty", "library", "license", "life", "lift", "light", "like", "limb", "limit", "link", "lion", "liquid", "list", "little", "live", "lizard", "load", "loan", "lobster", "local", "lock", "logic", "lonely", "long", "loop", "lottery", "loud", "lounge", "love", "loyal", "lucky", "luggage", "lumber", "lunar", "lunch", "luxury", "lyrics", "machine", "mad", "magic", "magnet", "maid", "mail", "main", "major", "make", "mammal", "man", "manage", "mandate", "mango", "mansion", "manual", "maple", "marble", "march", "margin", "marine", "market", "marriage", "mask", "mass", "master", "match", "material", "math", "matrix", "matter", "maximum", "maze", "meadow", "mean", "measure", "meat", "mechanic", "medal", "media", "melody", "melt", "member", "memory", "mention", "menu", "mercy", "merge", "merit", "merry", "mesh", "message", "metal", "method", "middle", "midnight", "milk", "million", "mimic", "mind", "minimum", "minor", "minute", "miracle", "mirror", "misery", "miss", "mistake", "mix", "mixed", "mixture", "mobile", "model", "modify", "mom", "moment", "monitor", "monkey", "monster", "month", "moon", "moral", "more", "morning", "mosquito", "mother", "motion", "motor", "mountain", "mouse", "move", "movie", "much", "muffin", "mule", "multiply", "muscle", "museum", "mushroom", "music", "must", "mutual", "myself", "mystery", "myth", "naive", "name", "napkin", "narrow", "nasty", "nation", "nature", "near", "neck", "need", "negative", "neglect", "neither", "nephew", "nerve", "nest", "net", "network", "neutral", "never", "news", "next", "nice", "night", "noble", "noise", "nominee", "noodle", "normal", "north", "nose", "notable", "note", "nothing", "notice", "novel", "now", "nuclear", "number", "nurse", "nut", "oak", "obey", "object", "oblige", "obscure", "observe", "obtain", "obvious", "occur", "ocean", "october", "odor", "off", "offer", "office", "often", "oil", "okay", "old", "olive", "olympic", "omit", "once", "one", "onion", "online", "only", "open", "opera", "opinion", "oppose", "option", "orange", "orbit", "orchard", "order", "ordinary", "organ", "orient", "original", "orphan", "ostrich", "other", "outdoor", "outer", "output", "outside", "oval", "oven", "over", "own", "owner", "oxygen", "oyster", "ozone", "pact", "paddle", "page", "pair", "palace", "palm", "panda", "panel", "panic", "panther", "paper", "parade", "parent", "park", "parrot", "party", "pass", "patch", "path", "patient", "patrol", "pattern", "pause", "pave", "payment", "peace", "peanut", "pear", "peasant", "pelican", "pen", "penalty", "pencil", "people", "pepper", "perfect", "permit", "person", "pet", "phone", "photo", "phrase", "physical", "piano", "picnic", "picture", "piece", "pig", "pigeon", "pill", "pilot", "pink", "pioneer", "pipe", "pistol", "pitch", "pizza", "place", "planet", "plastic", "plate", "play", "please", "pledge", "pluck", "plug", "plunge", "poem", "poet", "point", "polar", "pole", "police", "pond", "pony", "pool", "popular", "portion", "position", "possible", "post", "potato", "pottery", "poverty", "powder", "power", "practice", "praise", "predict", "prefer", "prepare", "present", "pretty", "prevent", "price", "pride", "primary", "print", "priority", "prison", "private", "prize", "problem", "process", "produce", "profit", "program", "project", "promote", "proof", "property", "prosper", "protect", "proud", "provide", "public", "pudding", "pull", "pulp", "pulse", "pumpkin", "punch", "pupil", "puppy", "purchase", "purity", "purpose", "purse", "push", "put", "puzzle", "pyramid", "quality", "quantum", "quarter", "question", "quick", "quit", "quiz", "quote", "rabbit", "raccoon", "race", "rack", "radar", "radio", "rail", "rain", "raise", "rally", "ramp", "ranch", "random", "range", "rapid", "rare", "rate", "rather", "raven", "raw", "razor", "ready", "real", "reason", "rebel", "rebuild", "recall", "receive", "recipe", "record", "recycle", "reduce", "reflect", "reform", "refuse", "region", "regret", "regular", "reject", "relax", "release", "relief", "rely", "remain", "remember", "remind", "remove", "render", "renew", "rent", "reopen", "repair", "repeat", "replace", "report", "require", "rescue", "resemble", "resist", "resource", "response", "result", "retire", "retreat", "return", "reunion", "reveal", "review", "reward", "rhythm", "rib", "ribbon", "rice", "rich", "ride", "ridge", "rifle", "right", "rigid", "ring", "riot", "ripple", "risk", "ritual", "rival", "river", "road", "roast", "robot", "robust", "rocket", "romance", "roof", "rookie", "room", "rose", "rotate", "rough", "round", "route", "royal", "rubber", "rude", "rug", "rule", "run", "runway", "rural", "sad", "saddle", "sadness", "safe", "sail", "salad", "salmon", "salon", "salt", "salute", "same", "sample", "sand", "satisfy", "satoshi", "sauce", "sausage", "save", "say", "scale", "scan", "scare", "scatter", "scene", "scheme", "school", "science", "scissors", "scorpion", "scout", "scrap", "screen", "script", "scrub", "sea", "search", "season", "seat", "second", "secret", "section", "security", "seed", "seek", "segment", "select", "sell", "seminar", "senior", "sense", "sentence", "series", "service", "session", "settle", "setup", "seven", "shadow", "shaft", "shallow", "share", "shed", "shell", "sheriff", "shield", "shift", "shine", "ship", "shiver", "shock", "shoe", "shoot", "shop", "short", "shoulder", "shove", "shrimp", "shrug", "shuffle", "shy", "sibling", "sick", "side", "siege", "sight", "sign", "silent", "silk", "silly", "silver", "similar", "simple", "since", "sing", "siren", "sister", "situate", "six", "size", "skate", "skill", "skin", "skirt", "skull", "slab", "slam", "sleep", "slide", "slight", "slip", "slogan", "slot", "slow", "slush", "small", "smart", "smile", "smoke", "smooth", "snack", "snake", "snap", "sniff", "snow", "soap", "soccer", "social", "sock", "soda", "soft", "solar", "soldier", "solid", "solution", "solve", "someone", "song", "soon", "sorry", "sort", "soul", "sound", "soup", "source", "south", "space", "spare", "spatial", "spawn", "speak", "special", "speed", "spell", "spend", "sphere", "spice", "spider", "spike", "spin", "spirit", "split", "spoil", "sponsor", "spoon", "sport", "spot", "spray", "spread", "spring", "spy", "square", "squeeze", "squirrel", "stable", "stadium", "staff", "stage", "stairs", "stamp", "stand", "start", "state", "stay", "steak", "steel", "stem", "step", "stereo", "stick", "still", "sting", "stock", "stomach", "stone", "stool", "story", "stove", "strategy", "street", "strike", "strong", "struggle", "student", "stuff", "stumble", "style", "subject", "submit", "subway", "success", "such", "sudden", "suffer", "sugar", "suggest", "suit", "summer", "sun", "sunny", "sunset", "super", "supply", "supreme", "sure", "surface", "surge", "surprise", "surround", "survey", "suspect", "sustain", "swallow", "swamp", "swap", "swarm", "swear", "sweet", "swift", "swim", "swing", "switch", "sword", "symbol", "symptom", "syrup", "system", "table", "tackle", "tag", "tail", "talent", "talk", "tank", "tape", "target", "task", "taste", "tattoo", "taxi", "teach", "team", "tell", "ten", "tenant", "tennis", "tent", "term", "test", "text", "thank", "that", "theme", "then", "theory", "there", "they", "thing", "this", "thought", "three", "thrive", "throw", "thumb", "thunder", "ticket", "tide", "tiger", "tilt", "timber", "time", "tiny", "tip", "tired", "tissue", "title", "toast", "tobacco", "today", "toddler", "toe", "together", "toilet", "token", "tomato", "tomorrow", "tone", "tongue", "tonight", "tool", "tooth", "top", "topic", "topple", "torch", "tornado", "tortoise", "toss", "total", "tourist", "toward", "tower", "town", "toy", "track", "trade", "traffic", "tragic", "train", "transfer", "trap", "trash", "travel", "tray", "treat", "tree", "trend", "trial", "tribe", "trick", "trigger", "trim", "trip", "trophy", "trouble", "truck", "true", "truly", "trumpet", "trust", "truth", "try", "tube", "tuition", "tumble", "tuna", "tunnel", "turkey", "turn", "turtle", "twelve", "twenty", "twice", "twin", "twist", "two", "type", "typical", "ugly", "umbrella", "unable", "unaware", "uncle", "uncover", "under", "undo", "unfair", "unfold", "unhappy", "uniform", "unique", "unit", "universe", "unknown", "unlock", "until", "unusual", "unveil", "update", "upgrade", "uphold", "upon", "upper", "upset", "urban", "urge", "usage", "use", "used", "useful", "useless", "usual", "utility", "vacant", "vacuum", "vague", "valid", "valley", "valve", "van", "vanish", "vapor", "various", "vast", "vault", "vehicle", "velvet", "vendor", "venture", "venue", "verb", "verify", "version", "very", "vessel", "veteran", "viable", "vibrant", "vicious", "victory", "video", "view", "village", "vintage", "violin", "virtual", "virus", "visa", "visit", "visual", "vital", "vivid", "vocal", "voice", "void", "volcano", "volume", "vote", "voyage", "wage", "wagon", "wait", "walk", "wall", "walnut", "want", "warfare", "warm", "warrior", "wash", "wasp", "waste", "water", "wave", "way", "wealth", "weapon", "wear", "weasel", "weather", "web", "wedding", "weekend", "weird", "welcome", "west", "wet", "whale", "what", "wheat", "wheel", "when", "where", "whip", "whisper", "wide", "width", "wife", "wild", "will", "win", "window", "wine", "wing", "wink", "winner", "winter", "wire", "wisdom", "wise", "wish", "witness", "wolf", "woman", "wonder", "wood", "wool", "word", "work", "world", "worry", "worth", "wrap", "wreck", "wrestle", "wrist", "write", "wrong", "yard", "year", "yellow", "you", "young", "youth", "zebra", "zero", "zone", "zoo"];

function generateSeedPhrase() {
  const words = [];
  for(let i=0; i<5; i++) {
    words.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
  }
  return words.join(' ');
}

function AuthScreen({ onDone }: { onDone?: () => void }) {
  const { login, signup } = useAppContext();
  // isLogin true means inputting phrase to login, false means creating new identity
  const [isLogin, setIsLogin] = useState(true);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [generatedSeed, setGeneratedSeed] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLogin && !generatedSeed) {
      setGeneratedSeed(generateSeedPhrase());
    }
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let success = false;
      if (isLogin) {
        if (!seedPhrase.trim()) {
           alert("Please enter a recovery phrase.");
           return;
        }
        if (login) success = await login(seedPhrase);
      } else {
        if (signup) success = await signup(generatedSeed);
      }
      if (success && onDone) onDone();
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSeed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-950 flex flex-col md:flex-row transition-colors">
      {/* Web3 Desktop Graphic Side */}
      <div className="hidden md:flex flex-1 bg-gray-900 overflow-hidden relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-blue-900/40 z-0" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0 mix-blend-overlay" />
        <div className="z-10 text-white max-w-xl w-full">
          <h1 className="text-7xl font-black mb-8 tracking-tighter shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">fork.</h1>
          <p className="text-3xl font-light text-gray-300 mb-10 leading-snug">Ideas, projects, news, anonymous journalists, and anyone who cares about their privacy.</p>
          <p className="text-xl font-bold text-white mb-8">Own your identity.</p>
          <div className="flex gap-4">
            <div className="w-16 h-1.5 bg-primary rounded-full"></div>
            <div className="w-6 h-1.5 bg-white/20 rounded-full"></div>
            <div className="w-6 h-1.5 bg-white/20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col w-full relative">
        <button onClick={() => onDone?.()} className="absolute top-6 right-6 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-20">
          <X className="w-6 h-6 text-gray-400" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <div className="md:hidden mb-6 sm:mb-12 flex justify-center">
              <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-primary tracking-tighter">fork.</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              {isLogin ? 'Access Identity' : 'Generate Identity'}
            </h1>
            <p className="text-gray-500 mb-6 sm:mb-10 text-sm leading-relaxed">
              {isLogin 
                ? 'Enter your 5-word secret recovery phrase to authenticate your session.' 
                : 'Welcome to the future of social networks. No emails, no passwords. Just a decentralized identity you own.'}
            </p>
            
            <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-8">
              {isLogin ? (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Recovery Phrase</label>
                  <textarea 
                    placeholder="e.g. apple banana cherry date elderberry" 
                    value={seedPhrase} 
                    onChange={e=>setSeedPhrase(e.target.value)} 
                    required 
                    className="w-full p-4 sm:p-5 rounded-3xl border border-gray-200 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all dark:bg-gray-900 dark:border-gray-800 dark:focus:border-primary dark:text-white resize-none h-28 sm:h-32 font-mono text-sm sm:text-[15px] leading-relaxed shadow-sm block" 
                  />
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-6">
                   <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 p-3.5 sm:p-5 rounded-2xl flex items-start gap-3 sm:gap-4 shadow-sm">
                     <div className="text-orange-500 mt-0.5 text-lg sm:text-xl leading-none">⚠️</div>
                     <div className="text-xs sm:text-sm text-orange-800 dark:text-orange-200 leading-relaxed text-[13px]">
                        <strong className="block mb-0.5 sm:mb-1 font-bold text-sm sm:text-[15px]">Save these words!</strong>
                        This is the ONLY way to access your account. If lost, your account cannot be recovered.
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2 sm:gap-3">
                     {generatedSeed.split(' ').map((word, index) => (
                       <div key={index} className="bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 py-2 sm:py-2.5 pr-4 pl-10 rounded-xl relative shadow-sm min-w-0">
                         <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-200/50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-800 flex items-center justify-center rounded-l-xl">
                           <span className="text-gray-500 text-[10px] sm:text-xs font-mono font-bold">{index + 1}</span>
                         </div>
                         <span className="block font-bold text-gray-900 dark:text-white text-sm sm:text-[15px] tracking-wide text-center truncate">
                           {word}
                         </span>
                       </div>
                     ))}
                   </div>

                   <button 
                     type="button" 
                     onClick={copyToClipboard}
                     className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold py-3 sm:py-4 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm sm:text-[15px] flex items-center justify-center gap-2 shadow-sm active:scale-95"
                   >
                     {copied ? '✓ Copied to clipboard' : 'Copy Recovery Phrase'}
                   </button>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-3.5 sm:py-4 rounded-2xl sm:rounded-[1.25rem] shadow-lg sm:shadow-xl shadow-primary/25 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-base sm:text-lg"
              >
                {isLoading ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  isLogin ? 'Access Identity' : 'I have saved my phrase'
                )}
              </button>
            </form>

            <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-5 sm:mt-8 text-gray-500 dark:text-gray-400 text-sm sm:text-[15px] hover:text-primary dark:hover:text-primary transition-colors font-semibold">
              {isLogin ? "Need a new identity? Generate one" : "Already have an identity? Access it here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { motion } from 'motion/react';
import { X } from 'lucide-react';






