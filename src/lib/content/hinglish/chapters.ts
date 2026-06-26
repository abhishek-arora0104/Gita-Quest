import type { Chapter, MainTeaching, PracticalExample, QuizQuestion } from "../schema";

type QuizSeed = Omit<QuizQuestion, "id" | "difficulty">;

type HinglishSeed = {
  number: number;
  slug: string;
  title: string;
  sanskritName: string;
  subtitle: string;
  focus: string;
  setting: string;
  teaching: string;
  practice: string;
  warning: string;
  result: string;
  remembrance: string;
};

const contexts: PracticalExample["context"][] = [
  "School",
  "College",
  "Career",
  "Sports",
  "Relationships",
  "Social Media",
  "Daily Life",
];

function q(
  question: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string,
): QuizSeed {
  return { question, options, correctIndex, explanation };
}

function quiz(seed: HinglishSeed): Chapter["quiz"] {
  const easy: QuizSeed[] = [
    q(`${seed.title} adhyay ka mukhya vishay kya hai?`, [seed.focus, "Paisa kamaana", "Doosron ko haraana", "Gyaan se bachna"], 0, `Is adhyay ka kendr ${seed.focus} hai.`),
    q(`Is adhyay ka Sanskrit naam kya hai?`, [seed.sanskritName, "Karma Yoga", "Sankhya Yoga", "Dhyana Yoga"], 0, `Is adhyay ka naam ${seed.sanskritName} hai.`),
    q("Krishn Arjun ko kis disha mein le jaate hain?", [seed.teaching, "Bhrm badhane ki or", "Kartavya chhodne ki or", "Ahankar badhane ki or"], 0, seed.teaching),
    q("Is adhyay mein kaun si saadhna upyogi batayi gayi hai?", [seed.practice, "Lagataar shikayat", "Aalasy", "Dikhawa"], 0, `${seed.practice} is adhyay ki seekh ko jeevan mein laati hai.`),
    q("Yeh adhyay kis baat se savdhaan karta hai?", [seed.warning, "Sachcha prayas", "Karuna", "Vinamrata"], 0, `${seed.warning} mann ko satya se door kar sakta hai.`),
    q("Is adhyay ka parinaam kis or le jaata hai?", [seed.result, "Aur adhik bhrm", "Lobh", "Ashanti"], 0, `Yeh shiksha ${seed.result} ki or le jaati hai.`),
    q("Vidyarthi ko kya yaad rakhna chahiye?", [seed.remembrance, "Kewal parinaam mayne rakhte hain", "Ahankar hi sarvopari hai", "Doosron ka koi mulya nahi"], 0, seed.remembrance),
    q("Gita mein Krishn kiska margdarshan kar rahe hain?", ["Arjun", "Duryodhan", "Sanjay", "Dhritarashtr"], 0, "Krishn Kurukshetra mein Arjun ka margdarshan kar rahe hain."),
    q("Is adhyay ki shiksha kis ke liye upyogi hai?", ["Har sadhak aur vidyarthi ke liye", "Kewal yoddhon ke liye", "Kewal rajaon ke liye", "Kisi ke liye nahi"], 0, "Gita ki shiksha aaj ke jeevan mein bhi lagoo hoti hai."),
    q("Adhyay ko samajhne ka sahi tarika kya hai?", ["Shant mann se padhna aur jeevan mein lagoo karna", "Jaldi-jaldi chhod dena", "Sirf shabd yaad karna", "Doosron se tulna karna"], 0, "Gita kewal padhne ke liye nahi, jeene ke liye hai."),
  ];

  const medium: QuizSeed[] = [
    q("Is adhyay ko daily jeevan mein kaise lagoo kiya ja sakta hai?", [`${seed.practice} ko chhote-chhote kaamon mein apnaakar`, "Har kathin nirnay se bhaagkar", "Kewal prashansa dhundhkar", "Doosron ko dosh dekar"], 0, "Gita ki seekh chhote daily nirnayon mein dikhai deti hai."),
    q("Kaun sa vyakti is adhyay ka behtar paalan karta hai?", [`Jo ${seed.focus} ko samajh kar karma karta hai`, "Jo ahankar se chalta hai", "Jo seekhne se mana karta hai", "Jo anushasan ka mazaak udaata hai"], 0, "Sahi samajh vyavahar mein dikhai deti hai."),
    q("Chetawni ko gambheerta se lena kyun zaroori hai?", [`Kyunki ${seed.warning} aadhyaatmik vikas rokta hai`, "Kyunki chetawni kabhi kaam nahi aati", "Kyunki kartavya ka arth nahi hai", "Kyunki gyaan chhupana chahiye"], 0, "Galat pravrittian dheere-dheere mann ko baandhti hain."),
    q("Saadhna ko saarthak kya banata hai?", [`Jab woh ${seed.teaching} ko vyavahar mein badalti hai`, "Jab woh kewal dikhawe ke liye ho", "Jab usse taaliyan milein", "Jab usme satya na ho"], 0, "Saadhna ka mulya uske bheetar ke bhaav se aata hai."),
    q("Is adhyay ki ek samanya bhool kya hai?", [`${seed.warning} ko samanya maan lena`, "Nihswarth seva karna", "Ishwar ko yaad rakhna", "Aatm-sanyam rakhna"], 0, "Gita humein sookshm galtiyon ko pehchanna sikhati hai."),
    q("Yeh shiksha sambandhon ko kaise sudharti hai?", ["Vinamrata aur karuna badhaakar", "Sabko kathorta se aankar", "Zimmedari hataakar", "Kisi ki baat na sunkar"], 0, "Aadhyaatmik samajh vyavahar ko komal aur spasht banati hai."),
    q("Kaam ya padhai mein yeh shiksha kaise madad karti hai?", ["Karma seva aur anushasan mein badalkar", "Kaam ko arthheen banaakar", "Prayas ko bekaar bataakar", "Aalasy ko badhaakar"], 0, "Gita karma ko shuddh bhaav se karne ki shiksha deti hai."),
    q("Yeh adhyay humein kis se aage dekhne ko kehta hai?", ["Oopri roop aur ahankar se", "Karuna se", "Seekhne se", "Kartavya se"], 0, "Sachchi drishti baahari lebilon se aage dekhti hai."),
    q("Agar seekh ko andekha kiya jaye toh kya hota hai?", ["Mann purane bhrm mein fasa rehta hai", "Gyaan apne-aap aa jaata hai", "Kartavya khatam ho jaata hai", "Shanti nishchit ho jaati hai"], 0, "Seekh ko na jeene se purani aadatein hi chalti rehti hain."),
    q("Bhrm ke samay svasthya pratikriya kya hai?", ["Gyaan lena aur imandaari se abhyas karna", "Sab jaanne ka naatak karna", "Doosron par hamla karna", "Turant haar maan lena"], 0, "Arjun ki yatra bhi imandaar sawaal se shuru hoti hai."),
  ];

  const hard: QuizSeed[] = [
    q("Is adhyay ki gehri seekh kya hai?", [`${seed.focus} tabhi saccha hai jab woh jeevan badalta hai`, "Baahari safalta hi sab kuch hai", "Aatma prashansa par nirbhar hai", "Krodh hi gyaan hai"], 0, "Gita ki gehri seekh vyavahar aur drishti dono badalti hai."),
    q("Yeh adhyay Karma Yoga se kaise judta hai?", ["Karme ke peeche ke bhaav ko shuddh karke", "Saare karma ko hamesha ke liye nakaakar", "Ahankar ko parinaam ka maalik banaakar", "Kartavya ko bekaar banaakar"], 0, "Har adhyay karma ko gyaan aur bhakti se jodta hai."),
    q("Yahan paripakv samajh ke liye kya chahiye?", ["Antardrishti aur abhyas dono", "Sirf shabd yaad karna", "Sirf bahas jeetna", "Logon se door bhaagna"], 0, "Gita mein gyaan wahi hai jo jeevan mein utarta hai."),
    q("Yeh shiksha kathin kyun lag sakti hai?", ["Kyunki yeh ahankar ki aadaton se oopar uthne ko kehti hai", "Kyunki yeh kewal bhugol hai", "Kyunki sawaal mana hai", "Kyunki iska jeevan se sambandh nahi"], 0, "Kathinai sunne mein nahi, jeene mein aati hai."),
    q("Kaun sa vakya is adhyay ko sabse achha samjhata hai?", [`${seed.remembrance} aur ${seed.practice} ko jeevan mein laana`, "Aadhyaatmikta ka arth nishkriyata hai", "Shareer hi poora aatm hai", "Ichha har nirnay chalaye"], 0, "Adhyay ki shiksha yaad, abhyas aur aacharan mein poori hoti hai."),
  ];

  return [
    ...easy.map((item, index) => ({ ...item, id: `hin-ch${seed.number}-e${index + 1}`, difficulty: "easy" as const })),
    ...medium.map((item, index) => ({ ...item, id: `hin-ch${seed.number}-m${index + 1}`, difficulty: "medium" as const })),
    ...hard.map((item, index) => ({ ...item, id: `hin-ch${seed.number}-h${index + 1}`, difficulty: "hard" as const })),
  ];
}

function makeChapter(seed: HinglishSeed): Chapter {
  const examples: PracticalExample[] = [
    `Padhai ya kaam karte samay ${seed.practice} ko yaad rakhein aur parinaam ki chinta kam karein.`,
    `Doston ke saath matbhed mein ${seed.teaching} ko vyavahar mein laayein.`,
    `Karyasthal par safalta ko ahankar nahi, seva ka avsar maanein.`,
    `Khel mein jeet-haar se oopar uthkar anushasan aur samman rakhein.`,
    `Parivaar mein kathin baat bhi prem aur dhairya se kahein.`,
    `Social media par tulna aur dikhawe se bachkar satya ko prathamikta dein.`,
    `Daily jeevan mein chhoti seva ko bhi Bhagwan ko arpit samjhein.`,
  ].map((text, index) => ({ context: contexts[index], text }));

  const intro = [
    `${seed.title} Bhagavad Gita ka mahattvapurn adhyay hai. Iska mukhya vishay ${seed.focus} hai. Krishn Arjun ko aasan lekin gehri drishti dete hain, taaki woh kewal bhaavnaon se nahi, balki gyaan aur shraddha se nirnay le sake.`,
    `Is adhyay mein ${seed.setting} ko aadhar banaakar jeevan ki disha samjhayi gayi hai. Krishn batate hain ki mannushya ke karma, vichar aur bhaav tabhi shuddh hote hain jab woh ahankar se hattkar satya aur Ishwar se judte hain.`,
    `Aaj ke jeevan mein bhi yeh adhyay bahut upyogi hai. Padhai, career, parivaar, rishton aur kathin nirnayon mein ${seed.practice} humein shant, spasht aur zimmedar banata hai.`,
  ].join("\n\n");

  const storyOverview = [
    `Arjun Krishn se margdarshan chahta hai, kyunki use samajhna hai ki sahi raasta kya hai. Krishn use batate hain ki aadhyaatmik jeevan kewal vichar nahi hai; yeh dekhne, chunne aur karma karne ka tariqa hai.`,
    `Krishn is adhyay mein samjhate hain ki ${seed.teaching}. Jab mannushya is baat ko bhool jaata hai, tab ${seed.warning} use bhrmit kar deta hai.`,
    `Adhyay dheere-dheere yeh dikhata hai ki baahari paristhiti se adhik mahattvapurn bheetar ka bhaav hai. Ek hi karma bandhan bhi ban sakta hai aur mukti ka saadhan bhi, yeh is par nirbhar hai ki woh kis bhaavna se kiya gaya hai.`,
    `Krishn Arjun ko yaad dilate hain ki ${seed.remembrance}. Yeh smaran mann ko sthir karta hai aur kartavya ko seva bana deta hai.`,
    `Ant mein adhyay sadhak ko ${seed.result} ki or le jaata hai. Yeh seekh kewal Arjun ke liye nahi, har us vyakti ke liye hai jo jeevan ko adhik saccha aur shant banana chahta hai.`,
  ].join("\n\n");

  const mainTeachings: MainTeaching[] = [
    {
      heading: seed.focus,
      body: `Is adhyay ki pehli seekh hai ki ${seed.focus} jeevan ki disha badal sakta hai. Jab mannushya ise samajhta hai, tab woh paristhiti se bhaagta nahi, balki sahi drishti se uska saamna karta hai.`,
    },
    {
      heading: "Bhaav ki shuddhi",
      body: `Krishn baar-baar batate hain ki karma se adhik mahattvapurn karma ka bhaav hai. Ahankar, lobh ya dar se kiya gaya karma mann ko baandhta hai; seva, shraddha aur samarpan se kiya gaya karma mann ko halka karta hai.`,
    },
    {
      heading: "Savdhani aur aatm-sanyam",
      body: `${seed.warning} sadhak ko raaste se bhataka sakta hai. Isliye indriyon, mann aur buddhi ko sahi disha dena zaroori hai. Aatm-sanyam dabav nahi, balki svatantrata ki taiyaari hai.`,
    },
    {
      heading: "Jeevan mein abhyas",
      body: `${seed.practice} kewal pooja ya padhai tak seemit nahi hai. Yeh bolne, kaam karne, sunne, nirnay lene aur doosron se vyavahar karne mein dikhai de na chahiye.`,
    },
  ];

  return {
    number: seed.number,
    slug: seed.slug,
    title: seed.title,
    sanskritName: seed.sanskritName,
    subtitle: seed.subtitle,
    readingTimeMins: 7,
    wordCount: 1500,
    intro,
    storyOverview,
    mainTeachings,
    practicalExamples: examples,
    lessonsForDailyLife: [
      `${seed.practice} ko roz ke chhote kaamon mein apnaayein.`,
      `Kathin paristhiti mein ruk kar poochhein: mera saccha kartavya kya hai?`,
      `${seed.warning} ko mann mein jaldi pehchaanein.`,
      `Parinaam se pehle bhaav aur prayas ko shuddh karein.`,
      `Doosron se tulna kam karein aur apni saadhna par dhyaan dein.`,
      `Har din ek kaam seva ya samarpan ke bhaav se karein.`,
    ],
    keyTakeaways: [
      `${seed.title} ka kendr ${seed.focus} hai.`,
      `Krishn Arjun ko bhrm se spashttata ki or le jaate hain.`,
      `Sahi karma wahi hai jo shuddh bhaav se kiya jaye.`,
      `${seed.warning} mann ko baandh sakta hai.`,
      `${seed.practice} sadhak ko sthir banata hai.`,
      `Antim lakshya ${seed.result} hai.`,
    ],
    keyLessons: [
      `Gyaan ko vyavahar mein utarna zaroori hai.`,
      `Ahankar se nahi, seva se karma karein.`,
      `Mann ko disha dene ke liye abhyas chahiye.`,
      `Samarpan kamjori nahi, gehri shakti hai.`,
      `Satya ko samajhna aur jeena dono zaroori hain.`,
      `Krishn ka smaran kartavya ko pavitra banata hai.`,
    ],
    reflectionQuestions: [
      `Is adhyay ki kaun si seekh aapke jeevan mein sabse adhik lagoo hoti hai?`,
      `Aapke jeevan mein ${seed.warning} kis roop mein aata hai?`,
      `Aap ${seed.practice} ko is saptaah kaise apnayenge?`,
      `Kaun sa nirnay aap adhik shant mann se lena chahte hain?`,
    ],
    seo: {
      metaTitle: `Bhagavad Gita Adhyay ${seed.number} Saar - ${seed.title}`,
      metaDescription: `Bhagavad Gita adhyay ${seed.number} ka aasan Hinglish saar: ${seed.focus}, daily jeevan ki seekh aur 25 sawalon ka quiz.`,
      keywords: [
        `Bhagavad Gita Adhyay ${seed.number}`,
        seed.title,
        seed.sanskritName,
        "Bhagavad Gita Hinglish saar",
        "Gita quiz",
      ],
    },
    quiz: quiz(seed),
  };
}

const seeds: HinglishSeed[] = [
  { number: 1, slug: "arjunas-dilemma", title: "Arjun ka Vishad", sanskritName: "Arjuna Visada Yoga", subtitle: "Jab sahi kaam asambhav lagta hai", focus: "Bhrm mein sahi marg dhoondhna", setting: "Kurukshetra ke yuddhakshetr mein Arjun ka sankat", teaching: "Sachchi sahayata tab shuru hoti hai jab hum apni uljhan svikaar karte hain", practice: "Imandaar sawaal aur sahi margdarshan", warning: "Bhaavnaon mein bahakar kartavya bhoolna", result: "Spashttata aur margdarshan", remembrance: "Bhrm kamjori nahi, seekhne ka dwaar ho sakta hai" },
  { number: 2, slug: "the-wisdom-of-the-soul", title: "Aatma ka Gyaan", sanskritName: "Sankhya Yoga", subtitle: "Shashvat aatma aur nishkaam karma", focus: "Aatma ki amartaa aur nishkaam karma", setting: "Arjun ke shok ka uttar", teaching: "Aatma na janm leti hai, na marti hai", practice: "Kartavya karna aur fal ki aasakti chhodna", warning: "Ichha aur krodh se buddhi dhakna", result: "Sthir buddhi aur shanti", remembrance: "Aap shareer aur mann se adhik gehre hain" },
  { number: 3, slug: "the-yoga-of-action", title: "Karma Yoga", sanskritName: "Karma Yoga", subtitle: "Swarth chhodkar kartavya karna", focus: "Nihswarth karma", setting: "Gyaan aur karma ke beech Arjun ki shanka", teaching: "Karma ko seva aur arpit banana chahiye", practice: "Fal ki aasakti bina apna kartavya karna", warning: "Swarthi ichha aur krodh", result: "Karma mein svatantrata", remembrance: "Koi bhi pal bhi karma ke bina nahi reh sakta" },
  { number: 4, slug: "the-yoga-of-knowledge", title: "Gyaan ka Yoga", sanskritName: "Jnana Yoga", subtitle: "Divya gyaan aur shuddh karma", focus: "Divya gyaan", setting: "Krishn ke praacheen yoga ki vyakhya", teaching: "Gyaan karma ko shuddh karta hai", practice: "Vinamrata se guru aur shaastr se seekhna", warning: "Ahankar aur adhoori jaankari", result: "Karmabandhan se mukti", remembrance: "Jab dharm ghatta hai, divya margdarshan prakat hota hai" },
  { number: 5, slug: "the-yoga-of-renunciation", title: "Tyaag ka Yoga", sanskritName: "Karma Sanyasa Yoga", subtitle: "Karma karte hue ahankar chhodna", focus: "Bheetar ka saccha tyaag", setting: "Karma aur sannyaas ki tulna", teaching: "Saccha tyaag parinaam ki aasakti chhodna hai", practice: "Kartavya karte hue swamitva chhodna", warning: "Baahari tyaag lekin bheetar aasakti", result: "Bheetar ki shanti", remembrance: "Kamal ki tarah sansaar mein rehkar bhi usse lipt na hon" },
  { number: 6, slug: "the-yoga-of-meditation", title: "Dhyan Yoga", sanskritName: "Dhyana Yoga", subtitle: "Mann ko mitra banana", focus: "Mann ka abhyas aur dhyan", setting: "Dhyan ki vidhi aur Arjun ki shanka", teaching: "Mann abhyas aur vairagya se sanbhalta hai", practice: "Niyamit dhyan, santulan aur dhairya", warning: "Chanchal mann aur asantulit jeevan", result: "Antar ki sthirata", remembrance: "Mann mitra bhi ban sakta hai aur shatru bhi" },
  { number: 7, slug: "knowledge-of-the-absolute", title: "Param Satya ka Gyaan", sanskritName: "Jnana Vijnana Yoga", subtitle: "Sabke peeche Krishn ko jaanna", focus: "Krishn ko sabka srot samajhna", setting: "Gyaan aur anubhooti ki shiksha", teaching: "Jagat aur jeev dono Krishn ki shakti se judte hain", practice: "Saadharan cheezon mein bhi Bhagwan ko yaad karna", warning: "Maya aur prakriti ke gunon mein fnsna", result: "Shraddha aur samarpan", remembrance: "Sab kuch Krishn mein motiyon ki tarah piroya hai" },
  { number: 8, slug: "attaining-the-supreme", title: "Param Pad ki Praapti", sanskritName: "Aksara Brahma Yoga", subtitle: "Jeevan bhar Ishwar ka smaran", focus: "Ant samay mein Krishn ka smaran", setting: "Mrityu, brahm aur smaran par Arjun ke prashn", teaching: "Antim smaran jeevan bhar ke abhyas se banta hai", practice: "Kartavya karte hue Krishn ko yaad rakhna", warning: "Asthaayi lakshyon ko antim maanna", result: "Param dhaam ki praapti", remembrance: "Krishn kehte hain: mujhe yaad karo aur apna kartavya karo" },
  { number: 9, slug: "the-king-of-knowledge", title: "Raajvidya", sanskritName: "Raja Vidya Yoga", subtitle: "Premmay bhakti ka gupt gyaan", focus: "Aasan prem-bhakti", setting: "Krishn ka sabse gopaneeya gyaan", teaching: "Prem se arpit chhoti vastu bhi svikaar hoti hai", practice: "Har karma aur bhojan ko Krishn ko arpit karna", warning: "Bhagwan ko kewal baahari roop se dekhna", result: "Bhakti aur aadhyaatmik aasha", remembrance: "Patra, pushp, fal ya jal prem se arpit karein" },
  { number: 10, slug: "divine-manifestations", title: "Divya Vibhootiyan", sanskritName: "Vibhuti Yoga", subtitle: "Har mahanata mein Krishn ki jhalak", focus: "Duniya mein divya mahima dekhna", setting: "Arjun ki Krishn ki vibhootiyan sunne ki ichha", teaching: "Har sundar aur mahan vastu Krishn ki chamak se aati hai", practice: "Sundarta aur gun dekhkar kritagy hona", warning: "Mahanata se irshya karna", result: "Smaran aur bhakti", remembrance: "Jo bhi tejasvi hai, woh Krishn ki vibhooti ki jhalak hai" },
  { number: 11, slug: "the-universal-form", title: "Vishwa Roop", sanskritName: "Visvarupa Darshana Yoga", subtitle: "Krishn ka viraat swaroop", focus: "Krishn ka vishwaroop darshan", setting: "Arjun ko divya drishti milna", teaching: "Ishwar srishti, samay aur vinaash sabko dhaaran karta hai", practice: "Ahankar chhodkar Ishwar ka saadhan banna", warning: "Bhagwan ko kewal aaraamadayak roop tak seemit karna", result: "Vinamrata aur shraddha", remembrance: "Krishn samay ke roop mein bhi prakat hote hain" },
  { number: 12, slug: "the-yoga-of-devotion", title: "Bhakti Yoga", sanskritName: "Bhakti Yoga", subtitle: "Priya bhakt ke gun", focus: "Premmay bhakti", setting: "Saakaar aur niraakaar upaasana par Arjun ka prashn", teaching: "Sachchi bhakti charitra ko badalti hai", practice: "Krishn ka smaran, seva aur fal-tyaag", warning: "Bhakti ko dikhawa banana", result: "Krishn ko priya hona", remembrance: "Krishn abhyas ke liye karunamay seedhi dete hain" },
  { number: 13, slug: "nature-and-the-self", title: "Prakriti aur Aatma", sanskritName: "Ksetra Ksetrajna Vibhaga Yoga", subtitle: "Kshetr aur kshetragya ko samajhna", focus: "Shareer aur jaanne waali aatma ka bhed", setting: "Kshetr, kshetragya aur param saakshi ki shiksha", teaching: "Shareer kshetr hai aur aatma uska jaanne waala", practice: "Vicharon aur bhaavon ko saakshi bhaav se dekhna", warning: "Shareer aur mann hi poora aatm maanna", result: "Aatm-bodh aur vinamrata", remembrance: "Paramaatma har shareer mein saakshi hai" },
  { number: 14, slug: "the-three-modes", title: "Teen Gun", sanskritName: "Guna Traya Vibhaga Yoga", subtitle: "Sattv, raj aur tam ka prabhav", focus: "Prakriti ke teen gun", setting: "Gunon se bandhan aur unse oopar uthna", teaching: "Sattv spasht karta hai, raj chanchal karta hai, tam dhakta hai", practice: "Spashttata badhane waali aadatein aur bhakti", warning: "Chanchalta, aalasy aur gunon ka ahankar", result: "Gunon se oopar aadhyaatmik svatantrata", remembrance: "Bhakti gunon se oopar uthne ka marg hai" },
  { number: 15, slug: "the-supreme-person", title: "Param Purush", sanskritName: "Purushottama Yoga", subtitle: "Ulta vriksh aur param srot", focus: "Param Purush Krishn", setting: "Sansaar roopi ulte vriksh ki upma", teaching: "Drishya sansaar ki jad oopar, param srot mein hai", practice: "Vairagya se aasakti kaatna", warning: "Shaakhon mein khokar jad bhoolna", result: "Param pad ki khoj", remembrance: "Jeev Krishn ke sanatan ansh hain" },
  { number: 16, slug: "divine-and-demoniac-natures", title: "Daivi aur Asuri Swabhaav", sanskritName: "Daivasura Sampad Vibhaga Yoga", subtitle: "Charitra ki do dishayein", focus: "Daivi gunon ka vikas", setting: "Daivi aur asuri gunon ka varnan", teaching: "Vinamrata, satya aur karuna oopar uthate hain", practice: "Shaastr aur vivek se nirnay lena", warning: "Kaam, krodh, lobh aur ahankar", result: "Mukti ki disha mein charitra", remembrance: "Kaam, krodh aur lobh patan ke teen dwar hain" },
  { number: 17, slug: "the-threefold-faith", title: "Teen Prakaar ki Shraddha", sanskritName: "Sraddha Traya Vibhaga Yoga", subtitle: "Shraddha, bhojan aur daan mein gun", focus: "Shraddha ki gunvatta", setting: "Shaastr-viheen shraddha par Arjun ka prashn", teaching: "Shraddha mannushya ke swabhaav ke anusaar hoti hai", practice: "Saattvik bhojan, vaani, daan aur tap", warning: "Dikhawe ya haani ke liye saadhna karna", result: "Shuddh shraddha", remembrance: "Bhaav aur uddeshy karma ki gunvatta tay karte hain" },
  { number: 18, slug: "the-path-to-liberation", title: "Moksh ka Marg", sanskritName: "Moksha Sanyasa Yoga", subtitle: "Krishn ki antim shiksha", focus: "Samarpan, kartavya aur mukti", setting: "Poori Gita ka saar aur Arjun ki spashttata", teaching: "Apne kartavya ko arpit banaakar Krishn ki sharan lein", practice: "Fal-tyaag, bhakti aur samarpan", warning: "Aalasy ya ahankar se kartavya chhodna", result: "Mukti aur nidarta", remembrance: "Krishn kehte hain: meri sharan mein aao, daro mat" },
];

export const hinglishChaptersByNumber: Record<number, Chapter> = Object.fromEntries(
  seeds.map((seed) => [seed.number, makeChapter(seed)]),
) as Record<number, Chapter>;
