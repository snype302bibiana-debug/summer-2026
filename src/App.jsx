import { useState, useEffect } from "react";

const SUMMER_START = new Date("2026-06-02");
const TOTAL_DAYS = Math.floor((new Date("2026-08-15") - SUMMER_START) / 86400000);
const PINS = { madison: "110511", garith: "062913", parent: "1985" };

const KIDS = {
  madison: { id:"madison", name:"Madison", grade:"9th Grade", emoji:"✦", color:"#C2185B", light:"rgba(194,24,91,0.1)", dark:"#880E4F", font:"Georgia,serif", tagline:"Future fashion designer. Future author. Future everything.", track:"9th Grade — Standard Diploma Track", subjects:["English & Writing","Algebra 1","Biology","World History","Creative Writing"], world:"fashion design, writing books, and building a brand" },
  garith:  { id:"garith",  name:'Garith "Bud"', grade:"8th Grade", emoji:"◈", color:"#1565C0", light:"rgba(21,101,192,0.1)", dark:"#0D47A1", font:"Georgia,serif", tagline:"Ball is life. Details matter. Systems win.", track:"8th Grade — Diploma Prep Track", subjects:["Pre-Algebra","Reading Comprehension","Science","Social Studies","Life Skills Math"], world:"basketball, video games, and music" },
  demo:    { id:"demo", name:"Demo Student", grade:"Sample Account", emoji:"◎", color:"#6D28D9", light:"rgba(109,40,217,0.1)", dark:"#4C1D95", font:"Georgia,serif", tagline:"This is a live demo — explore how the system works.", track:"Demo — Public Preview", subjects:["English & Writing","Algebra 1","Biology","World History","Creative Writing"], world:"creative work and learning", isDemo:true },
};

const PAIRS = {
  madison: [["English & Writing","Algebra 1"],["Biology","World History"],["Creative Writing","Algebra 1"],["English & Writing","Biology"],["World History","Creative Writing"],["Algebra 1","Biology"],["English & Writing","World History"]],
  garith:  [["Pre-Algebra","Reading Comprehension"],["Science","Social Studies"],["Life Skills Math","Reading Comprehension"],["Pre-Algebra","Science"],["Social Studies","Life Skills Math"],["Science","Reading Comprehension"],["Pre-Algebra","Social Studies"]],
  demo:    [["English & Writing","Algebra 1"],["Biology","World History"],["Creative Writing","Algebra 1"],["English & Writing","Biology"],["World History","Creative Writing"],["Algebra 1","Biology"],["English & Writing","World History"]],
};

function todayKey() { return new Date().toISOString().slice(0,10); }
function yestKey()  { const d=new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); }
function dayIdx()   { return Math.max(0,Math.floor((new Date()-SUMMER_START)/86400000)); }
function weekNum()  { return Math.max(1,Math.floor(dayIdx()/7)+1); }
function stageNum() { const d=dayIdx(); return d<14?1:d<28?2:3; }
function stageName(s) { return s===1?"Orientation":s===2?"Foundation":"Application"; }
function todayPair(id) { return PAIRS[id][dayIdx()%PAIRS[id].length]; }
function getStreak(p) { let s=0,d=new Date(); d.setHours(0,0,0,0); while(true){const k=d.toISOString().slice(0,10);if(p?.[k]?.done){s++;d.setDate(d.getDate()-1);}else break;} return s; }
function getLast14(p) { return Array.from({length:14},(_,i)=>{ const dt=new Date(); dt.setDate(dt.getDate()-(13-i)); const k=dt.toISOString().slice(0,10); return {k,done:!!p?.[k]?.done,today:k===todayKey(),day:dt.getDate(),data:p?.[k]}; }); }

// localStorage storage — works outside Claude sandbox
async function loadProgress() {
  const out={};
  for(const id of ["madison","garith"]){try{const r=localStorage.getItem(`prog:${id}`);out[id]=r?JSON.parse(r):{};}catch{out[id]={};}}
  out.demo=buildDemo();
  return out;
}
async function saveProgress(id,data){if(id==="demo")return;try{localStorage.setItem(`prog:${id}`,JSON.stringify(data));}catch(e){console.warn(e);}}

function buildDemo(){
  const p={},now=new Date();
  for(let i=13;i>=1;i--){
    const dt=new Date(now);dt.setDate(dt.getDate()-i);
    const k=dt.toISOString().slice(0,10);
    if(i%3!==0){const pr=PAIRS.demo[i%PAIRS.demo.length];p[k]={done:true,subjects:pr.join(" + "),[pr[0]]:{done:true,retention:{steps:[{score:3},{score:2},{score:3},{score:3},{score:3}]}},[pr[1]]:{done:true,retention:{steps:[{score:3},{score:3},{score:2},{score:3},{score:3}]}}};}
  }
  const tk=now.toISOString().slice(0,10),di=Math.max(0,Math.floor((now-SUMMER_START)/86400000)),tp=PAIRS.demo[di%PAIRS.demo.length];
  p[tk]={done:false,subjects:tp.join(" + "),[tp[0]]:{done:true}};
  return p;
}

async function askClaude(prompt){
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:prompt}]})});
    const d=await r.json();
    return d.content?.map(b=>b.text||"").join("")||"";
  }catch{return "";}
}

const C = {
  "English & Writing":{icon:"✍",note:"4 of your 24 required SC diploma credits.",stages:{
    1:{title:"What Writing Actually Is",obj:"Orientation: writing as a power skill",content:"Writing is not about grammar rules — it is about thinking clearly and making other people see what you see.\n\nEvery person who has ever changed anything did it partly through writing.\n\nThree types you will do in 9th grade:\n\nArgumentative — you take a position and defend it.\nInformational — you explain something so a reader understands it.\nNarrative — you tell a story that makes a reader feel something.",tryIt:"In 3 to 4 sentences, write about something you care about deeply. Do not worry about being correct — just write what you actually think.",ai:true,deep:"The writers who change culture write to make you feel something unexpected — Toni Morrison, James Baldwin, designers who write their own collection notes.\n\nChallenge: Find one designer who writes about their own work. Write 2 sentences about what their writing tells you about how they think.",real:"Your book idea is real. The fashion brand you will build is real. Both require you to write things that make people believe in what you are doing before they can see it.",recall:"What are the three types of writing you will do in 9th grade? Name them and give one sentence describing what each one does.",why:"Why do you think humans invented writing instead of just relying on memory and speech to pass information down?",connect:{madison:"You want to build a fashion brand. Write 2 sentences about how writing will matter in your specific future — not generally, but for the exact thing you are building.",garith:"Think about your favorite athlete or musician. Write 2 sentences about one way they use writing in their career that most people would not think about.",demo:"Think about a goal you have. Write 2 sentences about how writing could help you get there."},teach:"Explain the difference between argumentative, informational, and narrative writing to a 5th grader who has never heard these words. Use one example for each."},
    2:{title:"Thesis Statements",obj:"BCSD ELA: Construct clear argumentative claims",content:"A thesis is the one sentence your entire essay has to prove.\n\nWeak: Fashion affects how people feel.\nStrong: Fast fashion trains consumers to treat clothing as disposable — and that habit is destroying the environment and the people who make the clothes.\n\nThe strong version takes a clear position. Someone could argue against it. That is the test.",tryIt:"Write a thesis statement for this topic: Social media affects how teenagers see themselves. Make it specific enough that someone could argue the opposite.",ai:true,deep:"For fashion design: every collection has a concept statement. That is your thesis.\n\nChallenge: Find a designer whose collection has a clear concept. Write their concept as a one-sentence thesis.",real:"When you pitch your first collection you will have exactly one sentence to make them lean in. That sentence is your thesis.",recall:"Without looking back — what makes a thesis statement strong versus weak? Explain it in your own words.",why:"Why does a thesis need to be something someone could disagree with?",connect:{madison:"Write a one-sentence thesis for your fashion brand — what it stands for and why it matters more than what already exists.",garith:"Write a one-sentence thesis about something in basketball or gaming that you believe is true but that a lot of people would argue against.",demo:"Write a one-sentence thesis about something you believe that not everyone would agree with."},teach:"Explain what a thesis statement is to a 5th grader. Use a real example of a weak one and a strong one."},
    3:{title:"Argument, Evidence, Analysis",obj:"BCSD ELA: Support claims with relevant evidence",content:"Every strong essay runs on three parts:\n\nClaim — what you believe.\nEvidence — facts, quotes, or examples that support it.\nAnalysis — your explanation of why the evidence proves the claim.\n\nMost students skip the analysis. The analysis is where your grade lives.\n\nAfter every piece of evidence write: This shows that [connection to your claim].",tryIt:"Write a claim about the fashion industry. Add one piece of evidence and one sentence of analysis explaining why that evidence proves your claim.",ai:true,deep:"Challenge: Take your claim and write a full paragraph — claim, two pieces of evidence each with analysis, and a final sentence connecting it all back to your thesis.",real:"This is how lawyers build cases, how journalists support investigative stories, and how brand strategists justify repositioning.",recall:"Name the three parts of a strong argument and explain in one sentence what each one does.",why:"Why is the analysis step the hardest — and why do most students skip it?",connect:{madison:"Think about a design decision a fashion brand made that you think was right or wrong. Write a claim, one piece of evidence, and one sentence of analysis.",garith:"Think about a controversial call or trade in basketball. Write a claim, one piece of evidence, and one sentence of analysis.",demo:"Think about something you believe strongly. Write a claim, one piece of evidence, and one sentence of analysis."},teach:"Explain the difference between evidence and analysis to a 5th grader. Why is just having evidence not enough?"},
  }},
  "Algebra 1":{icon:"∑",note:"Required credit. EOC counts as 30% of your final grade in SC.",stages:{
    1:{title:"What Algebra Actually Is",obj:"Orientation: algebra as a problem-solving language",content:"Algebra was invented to solve problems where you do not know one of the numbers yet.\n\nExample: A dress sells for $120. You made $840 in sales. How many dresses did you sell?\n\n120 × n = 840\n\nThe letter n is a variable — a placeholder for the number you do not know.",tryIt:"Write a real situation from your life where you do not know one of the numbers. Describe it in 1 to 2 sentences and identify what the unknown is.",ai:true,deep:"The word algebra comes from the Arabic al-jabr, meaning the reunion of broken parts. It was invented to solve business and trade problems.",real:"The pricing of your first collection requires algebra. Cost of materials + cost of labor + profit margin = selling price.",recall:"In your own words — what is a variable, and what problem does algebra solve that regular arithmetic cannot?",why:"Why do you think mathematicians invented a letter to stand in for a number instead of just guessing?",connect:{madison:"Write a real equation from your fashion business — something you would actually need to solve. Use a variable for the unknown.",garith:"Write a real equation from basketball — salary cap, scoring average, or anything else. Use a variable for the unknown.",demo:"Write a real equation from your own life. Use a variable for the unknown."},teach:"Explain what a variable is to a 5th grader who has never seen algebra. Use one real-life example."},
    2:{title:"Variables and Expressions",obj:"BCSD Math: Represent and interpret algebraic expressions",content:"To solve 3x + 5 = 20:\nStep 1: Subtract 5 from both sides: 3x = 15\nStep 2: Divide both sides by 3: x = 5\n\nCheck: 3(5) + 5 = 20. Correct.\n\nThe rule: whatever you do to one side of an equation, do to the other.",tryIt:"Solve for x: 4x + 3 = 19. Show both steps.",ans:"4",hint:"Step 1: Subtract 3 — 4x = 16. Step 2: Divide by 4 — x = 4.",deep:"Challenge: Create your own equation using a real fashion or sports scenario and solve it.",real:"A fashion buyer or sports analyst calculates exact targets using equations like these every day.",recall:"Walk through the two steps for solving a two-step equation. Why do you have to do the same thing to both sides?",why:"Why does the rule do the same thing to both sides work? What would happen if you only changed one side?",connect:{madison:"Your fabric costs $3.50 per yard. You have $63 to spend. Write the equation and solve for how many yards you can buy.",garith:"A player earns $18 per point in a bonus structure and already has $54. He wants $126 total. Write the equation and solve.",demo:"Write a real two-step equation from your own life and solve it."},teach:"Explain two-step equations to a 5th grader. Walk them through one example step by step."},
    3:{title:"Linear Equations and Slope",obj:"BCSD Math: Represent and interpret linear relationships",content:"y = mx + b\nm = slope (how fast it changes)\nb = starting value\n\nExample: Start with $50 in savings, add $30 each week.\ny = 30x + 50\nAfter 4 weeks: y = 30(4) + 50 = 170",tryIt:"You start with $200 in savings and spend $25 per week on fabric. Write the equation and calculate how much you have after 5 weeks.",ans:"75",hint:"y = 200 - 25x. After 5 weeks: y = 200 - 25(5) = 75.",deep:"Challenge: Write a linear equation for your own scenario. At what point does it reach zero or break even?",real:"Every business projection is a linear equation at its core.",recall:"What do m and b represent in y = mx + b? Explain each one in plain language.",why:"Why is a constant rate of change called a slope? What does it mean visually if a slope is steep versus flat?",connect:{madison:"Write a linear equation for your fashion business. What does the slope tell you about your business?",garith:"A player improves their three-point percentage by 2% every month starting from 28%. When do they hit 40%?",demo:"Write a linear equation for something in your life that changes at a constant rate."},teach:"Explain y = mx + b to a 5th grader using a story about saving money. Make the slope and starting value obvious."},
  }},
  "Biology":{icon:"⬡",note:"Required credit. EOC counts as 30% of your final grade.",stages:{
    1:{title:"What Science Is",obj:"Orientation: scientific thinking as a tool",content:"Science is not a collection of facts. It is a method of thinking.\n\nThe method: observe, ask why, form a testable explanation, test it, look at the results honestly, update your understanding.\n\nBiology connects directly to fashion because every material you will ever design with comes from a living system.",tryIt:"Pick one clothing material — cotton, silk, wool, leather. Write 2 to 3 sentences about where you think it comes from.",ai:true,deep:"Bolt Threads grew silk protein using yeast cells. Modern Meadow grew leather from fungal mycelium. Biology is becoming the most important design tool in fashion.",real:"Stella McCartney partnered with Bolt Threads to create a bag made from mycelium leather.",recall:"Describe the scientific method in your own words — not the steps, but what the overall point of it is.",why:"Why is updating your conclusion when the data says you are wrong considered a strength of science rather than a weakness?",connect:{madison:"Think about one material you want to use in your designs. Describe a scientific question you could ask about that material.",garith:"Think about one thing in basketball that coaches seem to do by instinct. Write a scientific question you could test.",demo:"Think about something you believe is true. Write a scientific question you could test."},teach:"Explain the scientific method to a 5th grader in 4 to 5 sentences. Use an example from everyday life."},
    2:{title:"Cells — The Unit Everything Is Built From",obj:"BCSD Science: Structure and function of cells",content:"Every living thing is made of cells.\n\nKey parts:\nCell membrane — controls what enters and exits.\nNucleus — contains your DNA.\nMitochondria — converts food into usable energy (ATP).\nRibosome — reads DNA and builds proteins.\nVacuole — stores water, nutrients, or waste.",tryIt:"Name the part of the cell that produces energy and explain in one sentence what it does.",ans:"mitochondria",hint:"The mitochondria converts food molecules into ATP, which is the energy currency every living cell uses.",deep:"Challenge: Research how cotton fiber forms from plant cells. Write 3 sentences in your own words.",real:"Biotech companies creating next-generation fashion materials are engineering cells to produce specific proteins and fibers.",recall:"Name all five cell parts from the lesson and give a one-word job description for each one.",why:"Why does a cell need a membrane that controls what enters and exits?",connect:{madison:"Silk is produced by silkworm cells. Cotton fiber is produced by plant cells. Pick one and describe how the fiber is made at the cellular level.",garith:"Your muscles are made of cells. Explain what is happening inside those muscle cells when you are sprinting.",demo:"Pick one living material. Based on what you know about cells, describe how you think it is produced."},teach:"Explain the mitochondria to a 5th grader. Use an analogy that makes it memorable — not just it is the powerhouse of the cell."},
    3:{title:"Ecosystems and Fashion",obj:"BCSD Science: Energy flow and human impact on ecosystems",content:"An ecosystem is all living and nonliving things in an area interacting as a system.\n\nEnergy flows one direction: Sun → Producers → Consumers → Decomposers. Only 10% passes from one level to the next.\n\nFashion industry impact:\nCotton farming uses 24% of all insecticides used globally.\nSynthetic fabric releases microplastics into waterways.\nTextile dye runoff contaminates freshwater systems across Southeast Asia.",tryIt:"A textile factory releases chemical dye into a river. Trace the impact through at least 3 ecosystem levels in 4 to 5 sentences.",ai:true,deep:"Challenge: Research one specific ecosystem damaged by conventional fashion. Write 5 sentences — 3 on the damage and 2 on a design solution.",real:"Fashion buyers at major retailers now evaluate brands on environmental impact alongside price and design.",recall:"Explain energy flow in an ecosystem in your own words. Why does only 10% pass from one level to the next?",why:"Why does disrupting one part of an ecosystem cause problems throughout the whole system?",connect:{madison:"You are launching a fashion brand. Write 3 sentences about one supply chain decision that would reduce your ecosystem impact.",garith:"Sports stadiums have a significant ecosystem footprint. Write 3 sentences about one change a major arena could make.",demo:"Think about one industry you interact with daily. Write 3 sentences about one ecosystem impact it has."},teach:"Explain the 10% energy rule to a 5th grader. Why does it matter that so much energy is lost between each level?"},
  }},
  "World History":{icon:"◎",note:"Standard 9th grade Social Studies. Counts toward 3 required Social Studies credits.",stages:{
    1:{title:"What History Is",obj:"Orientation: historical thinking as systems understanding",content:"History is not a list of things that happened. That is a timeline.\n\nHistory is the study of why things happened, who was affected, whose story was recorded, and whose was left out.\n\nEvery system you live inside right now has a history that explains why it works the way it does.",tryIt:"Think about one thing in your life that is just the way it is — a rule, a social norm. Write 2 to 3 sentences about where you think that system came from.",ai:true,deep:"The concept of seasonal collections was invented in Paris in the mid-1800s. It was a business decision, not a natural law.",real:"Designers who understand fashion history can speak to journalists, buyers, and investors from a position of authority.",recall:"In your own words — what is the difference between a timeline and actual historical thinking?",why:"Why is it important to ask whose story was left out of the historical record?",connect:{madison:"Think about one rule or norm in the fashion industry. Write 3 sentences tracing where you think it came from historically.",garith:"The NBA has a salary cap and a draft system. Write 3 sentences about why you think those systems were created.",demo:"Think about one system or rule in an industry you care about. Write 3 sentences about where you think it came from."},teach:"Explain to a 5th grader why history is more than just memorizing dates and events."},
    2:{title:"Primary and Secondary Sources",obj:"BCSD Social Studies: Evaluate historical sources",content:"Primary source — created at the time of the event by someone who was there.\nExamples: a letter, a photograph, a speech.\n\nSecondary source — created later, analyzing primary sources.\nExamples: a textbook, a documentary.\n\nFor any source ask: Who created this? When? For what audience? What might they have left out?",tryIt:"Classify each source: (1) A Vogue magazine from 1965. (2) A fashion history textbook from 2018. (3) An interview recorded with a designer who worked in Paris in 1967.",ai:true,deep:"Challenge: Find one primary source related to a historical fashion event. Analyze it using the four key questions.",real:"The Met's Costume Institute builds every exhibition around primary source research.",recall:"What is the difference between a primary and secondary source? Give one example of each.",why:"Why can a primary source be unreliable even though the person was actually there?",connect:{madison:"Find or think of one primary source from fashion history. Write 3 sentences analyzing it using the four key questions.",garith:"Think of a famous moment in basketball history. Name one primary source and one secondary source that would exist.",demo:"Think of a historical event you know about. Name one primary source and one secondary source."},teach:"Explain the difference between primary and secondary sources to a 5th grader."},
    3:{title:"Cause and Effect",obj:"BCSD Social Studies: Analyze cause and effect relationships",content:"Nothing in history happens in isolation. Every event is both an effect of what came before and a cause of what comes next.\n\nThe Industrial Revolution of the 1800s created the fast fashion problem of the 2020s. Steam machinery → mass textile production → falling prices → mass market → fast fashion.\n\nThat is the chain.",tryIt:"The rise of social media in the 2010s changed how fashion trends spread. Identify two causes of this shift and two effects on designers, consumers, and the industry.",ai:true,deep:"Challenge: Choose any major fashion moment from the last 50 years. Write a chain of at least 4 linked causes and effects.",real:"Brand strategists think in cause and effect constantly. History taught you how to think this way.",recall:"Explain the cause-and-effect chain from the Industrial Revolution to modern fast fashion in your own words.",why:"Why is it important to trace the full chain of causes and effects rather than just identifying the most obvious single cause?",connect:{madison:"Think about a trend in fashion right now. Write a cause-and-effect chain of at least 3 links tracing how it got here.",garith:"Think about one rule or format change in basketball. Write a cause-and-effect chain of at least 3 links.",demo:"Think about one major change in an industry you know. Write a cause-and-effect chain of at least 3 links."},teach:"Explain cause and effect in history to a 5th grader. Use a simple chain of 3 events they would recognize."},
  }},
  "Creative Writing":{icon:"✦",note:"Elective credit toward your 8 required electives.",stages:{
    1:{title:"You Already Have a Story",obj:"Orientation: find what you want to write",content:"Every writer starts with something they cannot stop thinking about.\n\nToni Morrison wrote about what it felt like to be a Black woman in America at a time when that story was not being told by the people who lived it.\n\nThe writers who build real careers write about what will not leave them alone.",tryIt:"Write 3 to 5 sentences about the story you want to write. Not the plot — the feeling you want the reader to have when they finish it.",ai:true,deep:"Published authors describe books two ways: the external story and the internal story. The internal story is why readers tell other people about it.",real:"Literary agents evaluate manuscripts on both levels. The authors who build long careers are the ones whose internal stories resonate.",recall:"What is the difference between the external story and the internal story of a book?",why:"Why do you think the writers who write about what will not leave them alone tend to produce stronger work?",connect:{madison:"Write 3 sentences about what will not leave you alone — the thing you know your book needs to be about.",garith:"Think about a story that stayed with you after it ended. Write 3 sentences about what its internal story was really about.",demo:"Think about a story that stayed with you after it ended. Write 3 sentences about what its internal story was really about."},teach:"Explain the difference between external and internal story to a 5th grader. Use a movie or book they would know."},
    2:{title:"Premise and Stakes",obj:"Build a publishable premise",content:"Formula: [Character with a specific quality] wants [specific goal] but [specific obstacle] because [specific stakes].\n\nWeak: A girl tries to find her family.\nStrong: A girl with a photographic memory of everything except her own past tries to find her biological family — but every lead reveals a truth more dangerous than the mystery.\n\nSpecificity is everything.",tryIt:"Write a one-sentence premise for the story you want to write using the formula: character with a specific quality, goal, obstacle, stakes.",ai:true,deep:"Strong premises: specific distinctive character, high personal stakes, built-in tension where the obstacle connects to the character's strength or weakness.",real:"This is pitch culture — the ability to make someone lean in with one sentence.",recall:"Name the four parts of a strong premise and explain why each one matters.",why:"Why does specificity make a premise stronger?",connect:{madison:"Take the premise you wrote and make it 20% more specific — sharpen the character quality, raise the stakes, or clarify the obstacle.",garith:"Write a premise for a story set in the world of basketball or gaming. Use the full formula.",demo:"Take a premise you wrote or a story you love. Rewrite or describe the premise using the full four-part formula."},teach:"Explain what a premise is to a 5th grader and why every story needs one."},
    3:{title:"Voice — The Thing That Makes Your Writing Yours",obj:"Develop a distinct narrative voice",content:"Voice is the personality of the writing.\n\nVoice 1: She walked into the room. Everyone looked up.\n\nVoice 2: She entered the way only certain people do — like the room had been waiting for her, and the room knew it, and she knew it, and everyone else was just catching up.\n\nVoice 2 has a perspective. An attitude. That is voice.",tryIt:"Describe the last time you walked into a room and felt something. Write 4 to 5 sentences in your actual voice.",ai:true,deep:"Voice can be developed. Write a lot, read widely, and keep asking what it felt like and what it meant.",real:"Fashion designers who build recognizable brands have a voice that shows up consistently.",recall:"In your own words — what is voice in writing, and what are the two things it comes from?",why:"Why can voice not be faked for long?",connect:{madison:"Write 3 sentences about your fashion brand in your actual voice — not professional, not safe. Just your real perspective.",garith:"Write 3 sentences about your favorite player or game in your actual voice — not a review, just how you actually experience it.",demo:"Write 3 sentences about something you care about in your actual voice."},teach:"Explain what voice is in writing to a 5th grader. Use two versions of the same sentence to show the difference."},
  }},
  "Pre-Algebra":{icon:"◈",note:"Mastery here is your direct path into Algebra 1 — a required SC diploma credit.",stages:{
    1:{title:"What Math Is Really For",obj:"Orientation: math as a tool for real problems",content:"Every system you care about runs on math.\n\nBasketball: field goal percentage, player efficiency rating, salary cap calculations.\nVideo games: physics engines, damage formulas, probability tables.\nMusic: time signatures, frequency ratios, streaming revenue splits.",tryIt:"Pick one thing you care about — basketball, a specific game, music. Write 3 to 4 sentences about the ways math is involved in it.",ai:true,deep:"The NBA calculates Player Efficiency Rating: Points + Rebounds + Assists + Steals + Blocks minus Missed shots and Turnovers, divided by Minutes × 15.",real:"Every NBA front office has analysts who use mathematical models to evaluate players.",recall:"Name three real systems you care about and one specific way math is involved in each one.",why:"Why do you think math is involved in almost every system that humans build?",connect:{madison:"Think about the financial side of a fashion brand. Write 3 sentences about three specific things you would need math to figure out.",garith:"Think about the last game you watched or played. Write 3 sentences about three specific numbers that mattered.",demo:"Think about something you do or care about. Write 3 sentences about three specific ways math shows up in it."},teach:"Explain to a 5th grader why math is not just a school subject but a real tool. Use one specific example."},
    2:{title:"Order of Operations",obj:"BCSD Math: Apply PEMDAS",content:"PEMDAS:\nParentheses first\nExponents second\nMultiplication and Division left to right\nAddition and Subtraction left to right\n\nExample: 5 + 3 × 4\nWrong: 8 × 4 = 32\nRight: 3 × 4 = 12 first, then 5 + 12 = 17",tryIt:"Solve using PEMDAS: 6 + (2 × 5) - 3²",ans:"7",hint:"Step 1: Parentheses: 2 × 5 = 10. Step 2: Exponent: 3² = 9. Step 3: 6 + 10 - 9 = 7.",deep:"Challenge: Write your own multi-step expression and solve it with PEMDAS then without to see how different the answers are.",real:"The developers who build game systems have to understand PEMDAS perfectly.",recall:"List the PEMDAS order from memory and give a one-sentence reason why order matters at all.",why:"Why does math need a universal rule for order of operations?",connect:{madison:"Write a math expression with at least 3 operations that represents a real fashion business calculation. Solve it using PEMDAS.",garith:"Write a math expression with at least 3 operations that calculates something real in basketball. Solve it using PEMDAS.",demo:"Write a math expression with at least 3 operations that represents something real in your life. Solve it using PEMDAS."},teach:"Explain PEMDAS to a 5th grader who has never heard of it. Walk through one example step by step."},
    3:{title:"Variables and Expressions",obj:"BCSD Math: Evaluate and write algebraic expressions",content:"Evaluate 3x + 7 when x = 4: 3(4) + 7 = 12 + 7 = 19\n\nYou are getting ahead of 9th grade Algebra right now.",tryIt:"Evaluate 2x² + 3x - 1 when x = 3.",ans:"26",hint:"2(9) = 18, 3(3) = 9, 18 + 9 - 1 = 26.",deep:"True Shooting Percentage = Points ÷ (2 × (FGA + 0.44 × FTA)). Calculate it for your favorite player.",real:"Game designers write and balance damage formulas — algebraic expressions — to make games fair and fun.",recall:"Explain what it means to evaluate an algebraic expression. Walk through the process in your own words.",why:"Why is substituting a value into a variable useful in real life?",connect:{madison:"Write an algebraic expression for something real in fashion. Evaluate it for a specific value.",garith:"Write an algebraic expression for a real basketball calculation. Evaluate it for your favorite player's stats.",demo:"Write an algebraic expression for something real in your life. Evaluate it for a specific value."},teach:"Explain how to evaluate an algebraic expression to a 5th grader. Walk through one full example."},
  }},
  "Reading Comprehension":{icon:"◉",note:"ELA is 4 required credits for the SC diploma.",stages:{
    1:{title:"What Reading Comprehension Actually Is",obj:"Orientation: active reading as a skill",content:"Reading comprehension is not reading words. It is understanding what the words mean together — the main idea, the implication, the argument being made.\n\nReading a box score: not just numbers — understanding what the game looked like.\nReading a game manual: not just absorbing rules — understanding the system.",tryIt:"Find something written you actually care about. Read it. Write 2 to 3 sentences about the main point and one thing the writer implied but did not directly say.",ai:true,deep:"Reading things slightly above your current level pushes your skills forward faster than comfortable reading.",real:"NBA scouts write detailed scouting reports. That is reading comprehension applied to basketball.",recall:"In your own words — what is the difference between reading words and actually comprehending what you read?",why:"Why does reading things slightly above your current level improve your comprehension faster?",connect:{madison:"Find a paragraph from a fashion article. Write 2 sentences about the main point and one thing the writer implied.",garith:"Find a paragraph from a basketball article. Write 2 sentences about the main point and one thing the writer implied.",demo:"Find a paragraph from something you read recently. Write 2 sentences about the main point and one implied thing."},teach:"Explain the difference between reading and reading comprehension to a 5th grader."},
    2:{title:"Main Idea and Supporting Details",obj:"BCSD ELA: Identify central ideas",content:"Every text has a main idea — the central point the whole thing is trying to make.\n\nHow to find it:\n1. Ask what every paragraph has in common.\n2. Look for the sentence that could summarize the whole.\n3. Ask: what is the author trying to tell me overall?\n\nMain ideas are general. Details are specific.",tryIt:"Read this and identify the main idea and two supporting details: The three-point revolution permanently changed basketball strategy. Teams built around three-point shooting won more games. Coaches redesigned offensive systems around spacing and efficiency. Players who could not shoot from distance became strategic liabilities.",ai:true,deep:"Challenge: Find a sports article. Write: main idea in one sentence, three supporting details, and a five-word title.",real:"Every coach gives players game film analysis with a main point and supporting evidence.",recall:"Explain the three steps for finding a main idea in your own words.",why:"Why is being able to identify the main idea quickly a real advantage in actual life situations?",connect:{madison:"Find a short fashion article. Write the main idea in one sentence and two supporting details.",garith:"Find a short basketball article. Write the main idea in one sentence and two supporting details.",demo:"Find a short article about something you care about. Write the main idea in one sentence and two supporting details."},teach:"Explain the difference between a main idea and a supporting detail to a 5th grader."},
    3:{title:"Inference — Reading What Is Not Said",obj:"BCSD ELA: Draw logical inferences",content:"An inference is a conclusion you reach from evidence plus your own knowledge.\n\nText: Marcus checked his phone three times during warm-ups. The coach saw it and did not say anything. Yet.\n\nThe text never says Marcus is in trouble. But you know it.\n\nEvidence + your knowledge of how the world works = inference.\n\nA guess is unsupported. An inference is supported.",tryIt:"Read this and write two inferences with the evidence supporting each: The locker room was quieter than usual. Players dressed quickly and kept their eyes down. When the coach walked in, nobody looked up. The only sound was cleats on tile.",ai:true,deep:"Challenge: Find a scene in a book or article that implies something without stating it. Write the implied information and two pieces of evidence.",real:"Coaches read players by inferring from body language, energy, and shot selection.",recall:"What is the difference between a guess and an inference? What makes an inference valid?",why:"Why do authors imply things instead of stating them directly?",connect:{madison:"Read a fashion designer's interview. Write one inference about what they value — with specific evidence from the text.",garith:"Think about a coach or player you have observed. Write one inference about their mindset — with specific evidence.",demo:"Think about a person or situation you have observed recently. Write one inference with the specific evidence."},teach:"Explain the difference between a guess and an inference to a 5th grader. Use a short scene to show how evidence leads to a conclusion."},
  }},
  "Science":{icon:"⬡",note:"3 required credits for the SC diploma.",stages:{
    1:{title:"What Science Is",obj:"Orientation: scientific method as a way of thinking",content:"Science is not a collection of facts. It is a method for figuring out what is actually true.\n\nThe method:\n1. Observe something and notice a pattern.\n2. Ask why it happens.\n3. Make a hypothesis — a testable prediction.\n4. Design an experiment.\n5. Collect data honestly.\n6. Draw a conclusion and update if the data demands it.",tryIt:"Think about something in basketball, gaming, or music you have noticed — a pattern. Write it as a scientific observation: what do you notice, and what question does it make you want to ask?",ai:true,deep:"Sports science is one of the fastest-growing fields in professional athletics. NBA teams have sports scientists who study performance.",real:"Video game developers run experiments — testing different versions of a mechanic, collecting data, and updating the design.",recall:"Describe the six steps of the scientific method in your own words.",why:"Why is forming a hypothesis before you test something important?",connect:{madison:"Think about a design decision in fashion. Write a hypothesis you could actually test and describe the experiment.",garith:"Think about a basketball skill — free throw routine, sleep before a game. Write a hypothesis you could test.",demo:"Think about something you believe is true about performance or behavior. Write a hypothesis you could test."},teach:"Explain the scientific method to a 5th grader using an example from a sport or game."},
    2:{title:"Force and Motion",obj:"BCSD Science: Apply Newton's Laws",content:"Newton's three laws:\n\nLaw 1 — Inertia: An object stays at rest or keeps moving until a force acts on it.\n\nLaw 2 — F = ma: Force equals mass times acceleration.\n\nLaw 3 — Action and Reaction: Every force has an equal and opposite force back.",tryIt:"A player has a mass of 90 kg and accelerates at 3 m/s². What force are their legs producing? Use F = ma.",ans:"270",hint:"F = 90 × 3 = 270 Newtons.",deep:"Challenge: Research the optimal free throw release angle and explain it using Newton's laws.",real:"Sports engineers use Newton's laws to design shoes, courts, and equipment.",recall:"State Newton's three laws in your own words. Give a one-sentence basketball example for each one.",why:"Why does Law 3 mean that you cannot jump without the ground?",connect:{madison:"Think about how a model moves on a runway. Write 3 sentences connecting Newton's laws to movement in fashion.",garith:"Think about a specific basketball move. Write 3 sentences connecting each step to one of Newton's laws.",demo:"Think about a physical activity you do. Write 3 sentences connecting it to Newton's three laws."},teach:"Explain Newton's three laws to a 5th grader using only basketball examples."},
    3:{title:"Energy Transformation",obj:"BCSD Science: Analyze conservation of energy",content:"The Law of Conservation of Energy: energy cannot be created or destroyed. It can only change form.\n\nTypes:\nChemical — stored in food.\nKinetic — energy of motion.\nPotential — stored energy due to position.\nThermal — heat generated when energy transforms.\nSound — vibrations.",tryIt:"Trace the energy transformations: a player drinks a sports drink, sprints, jumps for a dunk, and the crowd roars. Name at least 4 energy types in order.",ai:true,deep:"Challenge: Research what wearable technology NBA teams use during practices. Write 4 sentences about what it measures.",real:"Electric vehicles use regenerative braking to convert kinetic energy back into stored electrical energy.",recall:"Name the five types of energy from the lesson and give a one-sentence real-world example of each one.",why:"Why is it significant that energy can never be destroyed — only changed form?",connect:{madison:"Think about the energy involved in producing a piece of clothing. Trace at least three energy transformations.",garith:"Trace the energy transformations in a full-court fast break. Name at least five transformations in order.",demo:"Think about something you do physically. Trace the energy transformations from your last meal to that action."},teach:"Explain the Law of Conservation of Energy to a 5th grader. Use the example of a jump shot."},
  }},
  "Social Studies":{icon:"◉",note:"3 required credits for the SC diploma.",stages:{
    1:{title:"What Social Studies Is",obj:"Orientation: systems thinking applied to history",content:"Social Studies is the study of how humans organize themselves — governments, economies, cultures, conflicts, and the systems of power that determine who gets what and why.\n\nWhy does the NBA have a salary cap? History.\nWhy does America have the government structure it has? History.\n\nWhen you understand the history of a system, you can navigate it on your own terms.",tryIt:"Think about one rule or system that affects your life — at school, in basketball, in gaming. Write 3 to 4 sentences about where you think it came from.",ai:true,deep:"The NBA Collective Bargaining Agreement exists because of a specific history of labor disputes going back to 1964.",real:"The athletes who understand the systems they operate inside can advocate for themselves and make better decisions.",recall:"In your own words — what is Social Studies actually studying, and why is it more useful than memorizing dates?",why:"Why is understanding the history of a system more powerful than just knowing the rules of that system?",connect:{madison:"Think about the fashion industry as a system. Write 3 sentences about one power structure in it — who controls what and who benefits.",garith:"Think about professional basketball as a system. Write 3 sentences about one power structure in it.",demo:"Think about an industry or institution you interact with. Write 3 sentences about one power structure in it."},teach:"Explain to a 5th grader why learning about history matters right now — use one example from sports or entertainment."},
    2:{title:"The Constitution",obj:"BCSD Social Studies: Analyze U.S. government structure",content:"Three branches:\n\nLegislative — Congress. Makes the laws.\nExecutive — President. Enforces the laws. Can veto.\nJudicial — Supreme Court. Interprets the laws. Can strike down unconstitutional laws.\n\nThis is called checks and balances. No single branch can dominate the others.",tryIt:"Congress passes a law that the President disagrees with. Walk through what can happen next in 3 to 4 sentences.",ai:true,deep:"Antitrust law — from the Constitution's Commerce Clause — is why the NBA cannot collude to suppress player wages.",real:"Player agents, team executives, and league commissioners work inside constitutional law constantly.",recall:"Name the three branches of government, their main job, and their main check on the other branches.",why:"Why did the founders design a system where no single branch has complete power?",connect:{madison:"Write 3 sentences about one way the Constitution's principles could or should apply to the fashion industry.",garith:"Write 3 sentences connecting the NBA Players Association to the checks-and-balances principle.",demo:"Think about an organization you are part of. Write 3 sentences about whether it has checks and balances."},teach:"Explain checks and balances to a 5th grader using a sports team as the analogy."},
    3:{title:"Civil Rights — How Change Actually Happens",obj:"BCSD Social Studies: Civil Rights Movement",content:"The Civil Rights Movement was a sustained, organized campaign to end racial segregation in America.\n\nKey events:\n1955: Montgomery Bus Boycott — 381 days of economic pressure.\n1963: March on Washington — 250,000 people.\n1964: Civil Rights Act.\n1965: Voting Rights Act.\n\nThe strategy: nonviolent direct action + legal challenges + economic pressure + coalition building.",tryIt:"The Montgomery Bus Boycott lasted 381 days. Write 3 to 4 sentences connecting the economic impact to why the city eventually gave in.",ai:true,deep:"In 2020, NBA players used economic pressure — refusing to play — just as Montgomery residents used the boycott in 1955.",real:"Every athlete who uses their platform is operating in a tradition that runs directly through the Civil Rights Movement.",recall:"Name the four strategies used in the Civil Rights Movement. Explain in one sentence why each one was necessary.",why:"Why was nonviolent direct action strategically powerful even when it was met with violence?",connect:{madison:"Write 3 sentences connecting the strategies of the Civil Rights Movement to what change would require in the fashion supply chain.",garith:"Write 3 sentences connecting the specific tactics players used in the 2020 NBA bubble strike to the Civil Rights Movement.",demo:"Think about an injustice in an industry or community you know. Write 3 sentences about how the Civil Rights strategy could apply."},teach:"Explain to a 5th grader why the Civil Rights Movement needed all four strategies at the same time."},
  }},
  "Life Skills Math":{icon:"◈",note:"Builds the financial literacy that connects to the Economics credit required for the SC diploma.",stages:{
    1:{title:"Why Most People Struggle With Money",obj:"Orientation: financial literacy as a power skill",content:"Most adults in America were never taught how money works.\n\nMost professional athletes go broke within five years of retirement. Not because they did not earn enough. Because nobody taught them how money works.\n\nFour things that determine your financial life:\n1. What you earn.\n2. What you spend.\n3. What you save and invest.\n4. What you owe and what it costs you.",tryIt:"Write 3 to 4 sentences about what you think you know about money and what you do not know.",ai:true,deep:"Your dad has built a business, manages a family estate, and is structuring a Dynasty Trust. All of that runs on financial literacy.",real:"The average NBA career lasts 4.5 years. The players who retire wealthy built financial literacy alongside their basketball skills.",recall:"Name the four things that determine your financial life and give a one-sentence explanation of each one.",why:"Why do you think schools historically have not taught personal finance?",connect:{madison:"Think about launching a fashion brand. Write 3 sentences about all four financial factors in the first year.",garith:"Think about a professional athlete's financial life. Write 3 sentences about all four factors.",demo:"Think about your own financial life in 5 years. Write 3 sentences about all four factors."},teach:"Explain to a 5th grader why financial literacy is a power skill. Use one example that shows what happens when someone does not have it."},
    2:{title:"Budgeting",obj:"BCSD Financial Literacy: Create and evaluate a personal budget",content:"A budget is a plan for your money before you spend it.\n\nThe 50/30/20 rule:\n50% on needs\n30% on wants\n20% on savings and debt payoff\n\nPay yourself first — move savings out before you have a chance to spend it.",tryIt:"Monthly income: $600. Fixed expenses: $80 phone. Variable: $120 food, $60 gaming. Using 50/30/20, how much should you be saving?",ans:"120",hint:"20% of $600 = $120.",deep:"Challenge: Create a monthly budget for a hypothetical first year out of high school. Use the 50/30/20 framework.",real:"Your dad built 8508 Production around budget discipline — knowing exactly what comes in, what goes out, and what the margin is.",recall:"Explain the 50/30/20 rule in your own words. Why does pay yourself first work better than saving whatever is left?",why:"Why is a budget a plan made before you spend rather than a record of what you spent?",connect:{madison:"Write a monthly budget for your first year running a fashion brand. Apply the 50/30/20 framework.",garith:"Write a monthly budget for your first year as a professional athlete. Apply the 50/30/20 framework.",demo:"Write a monthly budget for your life one year from now. Apply the 50/30/20 framework."},teach:"Explain the 50/30/20 rule to a 5th grader. Use a specific monthly income amount and walk them through how to split it."},
    3:{title:"Credit and Interest",obj:"BCSD Financial Literacy: True cost of credit",content:"Simple Interest: I = P × R × T\nP = Principal, R = Rate as decimal, T = Time in years\n\nBorrow $500 at 8% for 2 years:\nI = 500 × 0.08 × 2 = $80\nTotal paid back: $580\n\nYour credit score (300 to 850) determines your interest rate.",tryIt:"You borrow $1,500 at 12% simple interest for 3 years. How much total interest do you pay?",ans:"540",hint:"I = 1500 × 0.12 × 3 = $540.",deep:"Calculate total interest on a $25,000 car loan at 6% for 5 years. Then at 18%. What is the difference?",real:"The credit score you build starting at 18 determines the interest rate on your first home and your first business loan.",recall:"Walk through the simple interest formula — what each letter means and how to use it.",why:"Why does a higher credit score result in a lower interest rate?",connect:{madison:"You need a $15,000 business loan. Calculate the interest at 7% for 3 years versus 18% for 3 years. Write 2 sentences about what that difference means.",garith:"A rookie signs a car lease at 19% because he has no credit history. Calculate $30,000 for 4 years at 19% versus 6%. Write 2 sentences about why building credit early matters.",demo:"Think of a purchase you might finance in the next 10 years. Calculate the interest at two different rates."},teach:"Explain simple interest to a 5th grader using I = P × R × T. Walk through one full example with real numbers."},
  }},
};

const STEPS = [
  { id:"recall",  icon:"🧠", label:"Recall",     color:"#6366F1", desc:"Without looking back — what was the main point of this lesson?" },
  { id:"why",     icon:"💡", label:"Explain Why", color:"#F59E0B", desc:"Why does this concept work the way it does?" },
  { id:"connect", icon:"🔗", label:"Connect",     color:"#10B981", desc:"Connect this to your own world." },
  { id:"teach",   icon:"📣", label:"Teach It",    color:"#EC4899", desc:"Explain this to a 5th grader. Use one concrete example." },
  { id:"rate",    icon:"⭐", label:"Self-Rate",   color:"#8B5CF6", desc:"How confident do you feel about this concept right now?" },
];

function ConfirmModal({subject,color,onYes,onNo}) {
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}}>
      <div style={{background:"var(--color-background-primary)",borderRadius:"20px 20px 0 0",padding:"28px 24px 44px",width:"100%",maxWidth:520}}>
        <div style={{width:40,height:4,borderRadius:99,background:"var(--color-border-secondary)",margin:"0 auto 24px"}} />
        <div style={{width:56,height:56,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><span style={{fontSize:26,color:"#fff"}}>✓</span></div>
        <h3 style={{fontSize:20,fontWeight:700,color:"var(--color-text-primary)",textAlign:"center",margin:"0 0 8px",fontFamily:"Georgia,serif"}}>Mark {subject} complete?</h3>
        <p style={{fontSize:14,color:"var(--color-text-secondary)",textAlign:"center",fontFamily:"sans-serif",lineHeight:1.6,margin:"0 0 28px"}}>This saves your progress and starts your 5-step retention review.</p>
        <button onClick={onYes} style={{display:"block",width:"100%",background:color,border:"none",borderRadius:14,padding:"15px",fontSize:16,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"sans-serif",marginBottom:10}}>Yes, I finished it — let's lock it in ✓</button>
        <button onClick={onNo} style={{display:"block",width:"100%",background:"none",border:"1.5px solid var(--color-border-secondary)",borderRadius:14,padding:"13px",fontSize:14,color:"var(--color-text-secondary)",cursor:"pointer",fontFamily:"sans-serif"}}>Not yet — go back</button>
      </div>
    </div>
  );
}

function RetentionWalkthrough({kidId,subject,lesson,onComplete}) {
  const kid=KIDS[kidId];
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState({});
  const [input,setInput]=useState("");
  const [fb,setFb]=useState(null);
  const [loading,setLoading]=useState(false);
  const [rating,setRating]=useState(null);
  const [stepDone,setStepDone]=useState(false);
  const current=STEPS[step];
  const isLast=step===STEPS.length-1;
  const isRating=current.id==="rate";

  function getPrompt() {
    if(current.id==="recall") return lesson.recall;
    if(current.id==="why") return lesson.why;
    if(current.id==="connect") return lesson.connect?.[kidId]||lesson.connect?.demo||"Connect what you just learned to something real in your own life.";
    if(current.id==="teach") return lesson.teach;
    return "";
  }

  async function submit() {
    if(!input.trim()||stepDone)return;
    setLoading(true);
    const text=await askClaude(`You are a retention coach for ${kid.name}. Subject: ${subject}. Step: ${current.label}.\nTheir answer: "${input}"\nLesson: "${lesson.title}"\nGive feedback in exactly 2 sentences:\n1. What they got right.\n2. One specific thing to deepen.\nBe direct and encouraging. Under 60 words.`);
    setFb(text||"Good thinking. Keep building on this.");
    setAnswers(prev=>({...prev,[current.id]:{input,fb:text,ts:Date.now()}}));
    setStepDone(true);
    setLoading(false);
  }

  function advance() {
    if(isLast){onComplete({...answers,rate:{score:rating||2,ts:Date.now()}});return;}
    setStep(s=>s+1);setInput("");setFb(null);setStepDone(false);setRating(null);
  }

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <div style={{background:current.color,padding:"52px 16px 14px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <p style={{fontSize:15,fontWeight:700,color:"#fff",margin:0,fontFamily:"sans-serif"}}>Retention Review · {subject}</p>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.8)",fontFamily:"sans-serif",margin:0}}>Step {step+1} of {STEPS.length}</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.25)",borderRadius:99,height:4,overflow:"hidden"}}>
          <div style={{width:`${((step+1)/STEPS.length)*100}%`,height:"100%",background:"#fff",borderRadius:99,transition:"width 0.4s"}} />
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 40px"}}>
        <div style={{display:"flex",gap:8,marginBottom:20,justifyContent:"center"}}>
          {STEPS.map((s,i)=>(
            <div key={s.id} style={{width:32,height:32,borderRadius:"50%",background:i<step?"var(--color-background-secondary)":i===step?current.color:"var(--color-background-secondary)",border:`2px solid ${i<=step?current.color:"var(--color-border-tertiary)"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s"}}>
              <span style={{fontSize:i<step?12:14}}>{i<step?"✓":s.icon}</span>
            </div>
          ))}
        </div>
        <div style={{background:"var(--color-background-primary)",border:`2px solid ${current.color}`,borderRadius:16,padding:"20px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:24}}>{current.icon}</span>
            <div>
              <p style={{fontSize:16,fontWeight:700,color:"var(--color-text-primary)",margin:0,fontFamily:"sans-serif"}}>{current.label}</p>
              <p style={{fontSize:11,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0,textTransform:"uppercase",letterSpacing:1}}>{current.desc}</p>
            </div>
          </div>
          {!isRating&&<p style={{fontSize:15,color:"var(--color-text-primary)",lineHeight:1.7,fontFamily:"sans-serif",margin:0,padding:"12px 14px",background:"var(--color-background-secondary)",borderRadius:10}}>{getPrompt()}</p>}
        </div>
        {isRating?(
          <div>
            <p style={{fontSize:14,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:"0 0 16px",textAlign:"center"}}>How well do you understand {subject} right now?</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              {[{v:1,label:"Still fuzzy",emoji:"🤔",desc:"I get the idea but I am not sure I could explain it"},{v:2,label:"Getting it",emoji:"👍",desc:"I understand it and could explain the main points"},{v:3,label:"Got it",emoji:"🔥",desc:"I could teach this and apply it right now"}].map(r=>(
                <button key={r.v} onClick={()=>{setRating(r.v);setStepDone(true);}} style={{background:rating===r.v?`rgba(${r.v===1?"239,68,68":r.v===2?"245,158,11":"34,197,94"},0.12)`:"var(--color-background-primary)",border:`2px solid ${rating===r.v?r.v===1?"#EF4444":r.v===2?"#F59E0B":"#22C55E":"var(--color-border-secondary)"}`,borderRadius:14,padding:"14px 8px",cursor:"pointer",textAlign:"center"}}>
                  <p style={{fontSize:24,margin:"0 0 6px"}}>{r.emoji}</p>
                  <p style={{fontSize:12,fontWeight:700,color:"var(--color-text-primary)",fontFamily:"sans-serif",margin:"0 0 4px"}}>{r.label}</p>
                  <p style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0,lineHeight:1.4}}>{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ):(
          <>
            <textarea value={input} onChange={e=>setInput(e.target.value)} disabled={stepDone} placeholder="Write your response here..." rows={4} style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${fb?"rgba(99,102,241,0.5)":"var(--color-border-secondary)"}`,borderRadius:10,padding:"10px 12px",fontSize:14,fontFamily:"sans-serif",resize:"vertical",outline:"none",background:stepDone?"var(--color-background-secondary)":"var(--color-background-primary)",color:"var(--color-text-primary)"}} />
            {!stepDone&&<button onClick={submit} disabled={loading||!input.trim()} style={{marginTop:8,background:loading||!input.trim()?"var(--color-background-secondary)":current.color,color:loading||!input.trim()?"var(--color-text-secondary)":"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:600,fontFamily:"sans-serif",cursor:loading||!input.trim()?"default":"pointer"}}>{loading?"Reviewing...":"Submit"}</button>}
            {fb&&<div style={{marginTop:12,padding:"12px 14px",borderRadius:10,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.3)"}}><p style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",letterSpacing:1.5,margin:"0 0 6px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Coach feedback</p><p style={{fontSize:14,color:"var(--color-text-primary)",lineHeight:1.65,fontFamily:"sans-serif",margin:0}}>{fb}</p></div>}
          </>
        )}
        {stepDone&&<button onClick={advance} style={{display:"block",width:"100%",background:current.color,border:"none",borderRadius:14,padding:"14px",fontSize:15,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"sans-serif",marginTop:12,textAlign:"center"}}>{isLast?"Complete review ✓":"Next step →"}</button>}
      </div>
    </div>
  );
}

function SpacedRetrieval({kidId,subject,lesson,onDone}) {
  const kid=KIDS[kidId];
  const [input,setInput]=useState("");
  const [fb,setFb]=useState(null);
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  async function check() {
    setLoading(true);
    const text=await askClaude(`Spaced retrieval coach for ${kid.name}. Yesterday they learned: "${lesson.title}" in ${subject}. They were asked: "${lesson.recall}". Their answer today: "${input}". In 2 sentences: what they remembered well, and one thing to reinforce. Warm and brief. Under 50 words.`);
    setFb(text||"Good recall. Keep it up.");setDone(true);setLoading(false);
  }
  return(
    <div style={{background:"var(--color-background-primary)",border:`2px solid ${kid.color}`,borderRadius:16,padding:"18px 20px",marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <span style={{fontSize:22}}>🔁</span>
        <div>
          <p style={{fontSize:13,fontWeight:700,color:kid.color,margin:0,fontFamily:"sans-serif"}}>Yesterday: {subject}</p>
          <p style={{fontSize:11,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>60-second recall — spaced retrieval</p>
        </div>
      </div>
      <p style={{fontSize:14,color:"var(--color-text-primary)",lineHeight:1.7,fontFamily:"sans-serif",margin:"0 0 12px",padding:"10px 12px",background:"var(--color-background-secondary)",borderRadius:8}}>{lesson.recall}</p>
      {!done?(
        <>
          <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Quick answer — no looking back..." rows={2} style={{width:"100%",boxSizing:"border-box",border:"1.5px solid var(--color-border-secondary)",borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"sans-serif",resize:"none",outline:"none",background:"var(--color-background-primary)",color:"var(--color-text-primary)",marginBottom:8}} />
          <div style={{display:"flex",gap:8}}>
            <button onClick={check} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?"var(--color-background-secondary)":kid.color,color:loading||!input.trim()?"var(--color-text-secondary)":"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:600,fontFamily:"sans-serif",cursor:loading||!input.trim()?"default":"pointer"}}>{loading?"Checking...":"Submit recall"}</button>
            <button onClick={onDone} style={{background:"none",border:"1px solid var(--color-border-secondary)",borderRadius:8,padding:"8px 16px",fontSize:12,color:"var(--color-text-secondary)",fontFamily:"sans-serif",cursor:"pointer"}}>Skip</button>
          </div>
        </>
      ):(
        <>
          {fb&&<p style={{fontSize:13,color:"var(--color-text-primary)",lineHeight:1.6,fontFamily:"sans-serif",margin:"0 0 10px",padding:"10px 12px",background:"rgba(99,102,241,0.08)",borderRadius:8,border:"1px solid rgba(99,102,241,0.3)"}}>{fb}</p>}
          <button onClick={onDone} style={{background:kid.color,border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:600,color:"#fff",fontFamily:"sans-serif",cursor:"pointer"}}>Continue to today →</button>
        </>
      )}
    </div>
  );
}

function LessonView({kidId,subject,alreadyDone,onBack,onDone}) {
  const kid=KIDS[kidId];
  const s=stageNum();
  const lesson=C[subject]?.stages?.[s]||C[subject]?.stages?.[3];
  const [input,setInput]=useState("");
  const [fb,setFb]=useState(null);
  const [checking,setChecking]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const [deep,setDeep]=useState(false);
  const [mode,setMode]=useState(alreadyDone?"done":"lesson");
  if(!lesson) return <div style={{padding:40,color:"var(--color-text-primary)",fontFamily:"sans-serif"}}>Lesson not found for {subject}</div>;
  const isWriting=!lesson.ans&&lesson.ai;
  const chunks=lesson.content.split("\n\n").filter(Boolean);
  async function check(){
    if(!input.trim()||mode==="done")return;
    setChecking(true);setFb(null);
    if(isWriting){
      const t=await askClaude(`Concise academic coach for ${kid.name}. Asked: "${lesson.tryIt}". Answered: "${input}". Feedback in 3 parts, no headers: 1. What they did well. 2. One specific improvement. 3. One rewritten version. Under 80 words. Direct.`);
      setFb({type:"writing",text:t||"Good effort."});
    } else {
      const uNum=parseFloat(input.replace(/[^0-9.\-]/g,""));
      const cNum=parseFloat(lesson.ans);
      const correct=(!isNaN(uNum)&&!isNaN(cNum)&&Math.abs(uNum-cNum)<0.05)||input.trim().toLowerCase().includes((lesson.ans||"").toLowerCase());
      if(correct){setFb({type:"correct",text:"That is exactly right."});setMode("done");onDone(subject,true,null);}
      else{const t=await askClaude(`Student ${kid.name} answered "${input}" to: "${lesson.tryIt}". Correct: ${lesson.ans}. Hint: "${lesson.hint}". 2 sentences: what went wrong and guide them. Encouraging.`);setFb({type:"wrong",text:t||lesson.hint});}
    }
    setChecking(false);
  }
  const fbBg={correct:"rgba(34,197,94,0.1)",wrong:"rgba(234,179,8,0.1)",writing:"rgba(99,102,241,0.1)"};
  const fbBorder={correct:"#22C55E",wrong:"#EAB308",writing:"#6366F1"};
  const fbLabel={correct:"Correct ✓",wrong:"Not quite",writing:"Coach feedback"};
  if(mode==="walkthrough") return <RetentionWalkthrough kidId={kidId} subject={subject} lesson={lesson} onComplete={(data)=>{setMode("done");onDone(subject,true,data);}} />;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      {confirm&&<ConfirmModal subject={subject} color={kid.color} onYes={()=>{setConfirm(false);setMode("walkthrough");}} onNo={()=>setConfirm(false)} />}
      <div style={{background:kid.color,padding:"16px 16px 14px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <p style={{fontSize:17,fontWeight:700,color:"#fff",margin:0,fontFamily:kid.font,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{subject}</p>
          <span style={{background:"rgba(255,255,255,0.2)",borderRadius:99,padding:"4px 10px",fontSize:16,marginLeft:10}}>{C[subject]?.icon}</span>
        </div>
        <p style={{fontSize:12,color:"rgba(255,255,255,0.75)",margin:"4px 0 0",fontFamily:"sans-serif"}}>Stage {s} · {stageName(s)}{mode==="done"?" · Complete ✓":""}</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 60px"}}>
        <div style={{background:kid.light,borderRadius:10,padding:"10px 14px",marginBottom:16,border:`1px solid ${kid.color}`}}>
          <p style={{fontSize:12,color:"var(--color-text-primary)",fontFamily:"sans-serif",margin:0,lineHeight:1.6}}><strong style={{color:kid.color}}>Diploma track:</strong> {C[subject].note}</p>
        </div>
        <p style={{fontSize:10,fontWeight:700,color:"var(--color-text-tertiary)",letterSpacing:2,margin:"0 0 4px",fontFamily:"sans-serif",textTransform:"uppercase"}}>{lesson.obj}</p>
        <h2 style={{fontSize:22,fontWeight:700,color:"var(--color-text-primary)",margin:"0 0 20px",fontFamily:kid.font,lineHeight:1.2}}>{lesson.title}</h2>
        {chunks.map((chunk,ci)=>{
          const lines=chunk.split("\n").filter(l=>l.trim());
          const isCode=lines.some(l=>/^(Step|Law |PEMDAS|\d\.|[A-Z]{2,}:)/.test(l.trim())||l.includes(" = ")||l.includes(" × ")||l.includes(" → "));
          if(isCode) return <div key={ci} style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"14px 16px",marginBottom:16,borderLeft:`3px solid ${kid.color}`}}>{lines.map((ln,li)=><p key={li} style={{fontSize:13,color:"var(--color-text-primary)",lineHeight:1.7,margin:"2px 0",fontFamily:"monospace"}}>{ln}</p>)}</div>;
          return <p key={ci} style={{fontSize:15,color:"var(--color-text-primary)",lineHeight:1.8,margin:"0 0 14px",fontFamily:"sans-serif"}}>{lines.join(" ")}</p>;
        })}
        <div style={{background:"rgba(245,158,11,0.1)",borderRadius:10,padding:"12px 14px",marginBottom:14,borderLeft:"3px solid #F59E0B",marginTop:8}}>
          <p style={{fontSize:11,fontWeight:700,color:"#92400E",letterSpacing:1.5,margin:"0 0 8px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Now you try it</p>
          <p style={{fontSize:14,color:"var(--color-text-primary)",lineHeight:1.7,fontFamily:"sans-serif",margin:0}}>{lesson.tryIt}</p>
        </div>
        <textarea value={input} onChange={e=>setInput(e.target.value)} disabled={mode==="done"} placeholder={isWriting?"Write your answer here...":"Type your answer..."} rows={isWriting?4:2} style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${fb?fbBorder[fb.type]:"var(--color-border-secondary)"}`,borderRadius:10,padding:"10px 12px",fontSize:14,fontFamily:"sans-serif",resize:"vertical",outline:"none",background:mode==="done"?"var(--color-background-secondary)":"var(--color-background-primary)",color:"var(--color-text-primary)"}} />
        {mode!=="done"&&<button onClick={check} disabled={checking||!input.trim()} style={{marginTop:8,background:checking||!input.trim()?"var(--color-background-secondary)":kid.color,color:checking||!input.trim()?"var(--color-text-secondary)":"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:500,fontFamily:"sans-serif",cursor:checking||!input.trim()?"default":"pointer"}}>{checking?"Checking...":"Check my answer"}</button>}
        {fb&&<div style={{marginTop:12,padding:"12px 14px",borderRadius:10,background:fbBg[fb.type],border:`1px solid ${fbBorder[fb.type]}`}}><p style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",letterSpacing:1.5,margin:"0 0 6px",fontFamily:"sans-serif",textTransform:"uppercase"}}>{fbLabel[fb.type]}</p><p style={{fontSize:14,color:"var(--color-text-primary)",lineHeight:1.65,fontFamily:"sans-serif",margin:0}}>{fb.text}</p>{fb.type==="writing"&&mode!=="done"&&<button onClick={()=>setConfirm(true)} style={{display:"block",marginTop:12,background:kid.color,border:"none",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:700,color:"#fff",fontFamily:"sans-serif",cursor:"pointer"}}>Mark complete ✓</button>}</div>}
        {mode!=="done"&&<div style={{marginTop:20,padding:"16px 18px",borderRadius:14,border:`2px dashed ${kid.color}`,background:kid.light,textAlign:"center"}}><p style={{fontSize:13,color:kid.dark,fontFamily:"sans-serif",margin:"0 0 12px",fontWeight:500}}>Finished? Tap confirm to save your progress and start the retention review.</p><button onClick={()=>setConfirm(true)} style={{background:kid.color,border:"none",borderRadius:10,padding:"11px 24px",fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"sans-serif"}}>Confirm complete ✓</button></div>}
        {mode==="done"&&<div style={{background:"rgba(34,197,94,0.1)",border:"1px solid #22C55E",borderRadius:12,padding:"16px 18px",marginTop:16,textAlign:"center"}}><p style={{fontSize:15,fontWeight:600,color:"#16A34A",margin:"0 0 4px",fontFamily:"sans-serif"}}>✓ Saved and reviewed</p><p style={{fontSize:13,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>Lesson complete and retention locked in. Parent dashboard updated.</p></div>}
        <button onClick={()=>setDeep(v=>!v)} style={{display:"block",width:"100%",background:"none",border:`1.5px solid ${kid.color}`,borderRadius:12,padding:"12px 16px",fontSize:13,fontWeight:600,color:kid.color,fontFamily:"sans-serif",cursor:"pointer",marginTop:20,textAlign:"center"}}>{deep?"Hide deeper content ↑":"🔑 Go deeper ↓"}</button>
        {deep&&<div style={{marginTop:12,borderRadius:12,overflow:"hidden",border:`1.5px solid ${kid.color}`}}><div style={{background:"var(--color-background-secondary)",padding:"18px 20px"}}><p style={{fontSize:11,fontWeight:700,color:kid.color,letterSpacing:2,margin:"0 0 12px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Going deeper</p>{lesson.deep.split("\n").filter(l=>l.trim()).map((ln,i)=><p key={i} style={{fontSize:14,color:"var(--color-text-primary)",lineHeight:1.8,margin:"0 0 10px",fontFamily:"sans-serif"}}>{ln}</p>)}</div><div style={{background:kid.light,padding:"18px 20px",borderTop:`1.5px solid ${kid.color}`}}><p style={{fontSize:11,fontWeight:700,color:kid.color,letterSpacing:2,margin:"0 0 10px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Where you use this</p><p style={{fontSize:15,color:"var(--color-text-primary)",lineHeight:1.8,margin:0,fontFamily:"sans-serif"}}>{lesson.real}</p></div></div>}
      </div>
      <BottomBar onBack={onBack} label={subject} sublabel={`Stage ${s} · ${stageName(s)}`} color={kid.color} />
    </div>
  );
}

function Session({kidId,kidProg,onDone,onBack}) {
  const kid=KIDS[kidId];
  const td=kidProg[todayKey()]||{};
  const yd=kidProg[yestKey()]||{};
  const pair=todayPair(kidId);
  const [active,setActive]=useState(null);
  const yestPair=PAIRS[kidId][Math.max(0,(dayIdx()-1))%PAIRS[kidId].length];
  const spacedSubjects=yestPair.filter(sub=>yd[sub]?.done&&!td[`spaced_${sub}`]);
  const [spacedDone,setSpacedDone]=useState({});
  if(active) return <LessonView kidId={kidId} subject={active} alreadyDone={!!td[active]?.done} onBack={()=>setActive(null)} onDone={(sub,correct,retention)=>{onDone(sub,correct,retention);setActive(null);}} />;
  const d0=!!td[pair[0]]?.done,d1=!!td[pair[1]]?.done;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <div style={{background:kid.color,padding:"16px 16px 14px",flexShrink:0}}>
        <p style={{fontSize:17,fontWeight:700,color:"#fff",margin:"0 0 2px",fontFamily:kid.font}}>Today's Session</p>
        <p style={{fontSize:12,color:"rgba(255,255,255,0.75)",margin:0,fontFamily:"sans-serif"}}>Week {weekNum()} · Stage {stageNum()} of 3 · {[d0,d1].filter(Boolean).length}/2 complete</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 40px"}}>
        {spacedSubjects.filter(s=>!spacedDone[s]).map(sub=>{
          const lesson=C[sub]?.stages?.[stageNum()]||C[sub]?.stages?.[3];
          if(!lesson)return null;
          return <SpacedRetrieval key={sub} kidId={kidId} subject={sub} lesson={lesson} onDone={()=>{setSpacedDone(p=>({...p,[sub]:true}));onDone(`spaced_${sub}`,true,null);}} />;
        })}
        <div style={{background:"rgba(245,158,11,0.1)",borderRadius:12,padding:"12px 16px",marginBottom:16,border:"1px solid rgba(245,158,11,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{background:"#F59E0B",color:"#fff",fontSize:10,fontWeight:700,letterSpacing:1.5,padding:"2px 8px",borderRadius:99,fontFamily:"sans-serif",textTransform:"uppercase"}}>Stage {stageNum()} — {stageName(stageNum())}</span>
            <span style={{fontSize:12,color:"var(--color-text-secondary)",fontFamily:"sans-serif"}}>{[d0,d1].filter(Boolean).length}/2 complete</span>
          </div>
        </div>
        {pair.map((sub,i)=>{
          const done=i===0?d0:d1;
          return(
            <button key={sub} onClick={()=>setActive(sub)} style={{display:"flex",alignItems:"center",gap:14,width:"100%",background:done?"rgba(34,197,94,0.08)":"var(--color-background-primary)",border:`2px solid ${done?"#22C55E":kid.color}`,borderRadius:16,padding:"18px 20px",marginBottom:12,cursor:"pointer",textAlign:"left"}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:done?"rgba(34,197,94,0.15)":kid.light,border:`2px solid ${done?"#22C55E":kid.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:20}}>{done?"✓":C[sub]?.icon}</span></div>
              <div style={{flex:1}}>
                <p style={{fontSize:16,fontWeight:600,color:done?"#16A34A":"var(--color-text-primary)",margin:"0 0 3px",fontFamily:kid.font}}>{sub}</p>
                <p style={{fontSize:12,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>{done?"Lesson + retention review complete":"~13 minutes · lesson + 5-step review"}</p>
              </div>
              {!done&&<span style={{fontSize:20,color:kid.color}}>→</span>}
            </button>
          );
        })}
        {d0&&d1&&<div style={{background:"rgba(34,197,94,0.1)",border:"2px solid #22C55E",borderRadius:16,padding:"24px",textAlign:"center",marginTop:8}}><p style={{fontSize:32,margin:"0 0 12px"}}>🎯</p><p style={{fontSize:18,fontWeight:700,color:"#16A34A",margin:"0 0 6px",fontFamily:kid.font}}>Both subjects complete and reviewed.</p><p style={{fontSize:13,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>Parent dashboard is up to date.</p></div>}
      </div>
      <BottomBar onBack={onBack} label="Today's Session" sublabel={`Week ${weekNum()} · Stage ${stageNum()} of 3`} color={kid.color} />
    </div>
  );
}

function KidDash({kidId,progress,onBack,onSession}) {
  const kid=KIDS[kidId],kp=progress[kidId]||{};
  const str=getStreak(kp),l14=getLast14(kp);
  const sessions=Object.values(kp).filter(v=>typeof v==="object"&&v.done).length;
  const tp=todayPair(kidId),td=kp[todayKey()]||{};
  const s1=!!td[tp[0]]?.done,s2=!!td[tp[1]]?.done,bothDone=s1&&s2;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <div style={{background:kid.color,padding:"20px 20px 24px",flexShrink:0,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}} />
        <p style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontFamily:"sans-serif",letterSpacing:2,margin:"0 0 4px",textTransform:"uppercase"}}>{kid.track}</p>
        <h2 style={{fontSize:26,fontWeight:700,color:"#fff",margin:"0 0 4px",fontFamily:kid.font}}>{kid.name}</h2>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.8)",fontFamily:"sans-serif",margin:0}}>{kid.tagline}</p>
        {str>0&&<div style={{display:"inline-block",marginTop:10,background:"rgba(255,255,255,0.2)",borderRadius:99,padding:"4px 14px"}}><span style={{fontSize:12,color:"#fff",fontFamily:"sans-serif",fontWeight:500}}>⚡ {str} day streak</span></div>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 40px"}}>
        <div style={{background:bothDone?"rgba(34,197,94,0.1)":"var(--color-background-primary)",border:`2px solid ${bothDone?"#22C55E":kid.color}`,borderRadius:16,padding:"16px 18px",marginBottom:16}}>
          <p style={{fontSize:11,fontWeight:700,color:bothDone?"#16A34A":kid.color,letterSpacing:1.5,margin:"0 0 8px",fontFamily:"sans-serif",textTransform:"uppercase"}}>{bothDone?"Today Complete ✓":"Today's Session · ~26 min"}</p>
          <div style={{display:"flex",gap:8,marginBottom:bothDone?0:14,flexWrap:"wrap"}}>
            {tp.map((sub,i)=>{const done=i===0?s1:s2;return(<span key={i} style={{background:done?"rgba(34,197,94,0.12)":kid.light,color:done?"#15803D":kid.dark,border:`1px solid ${done?"#22C55E":kid.color}`,borderRadius:99,padding:"4px 12px",fontSize:12,fontFamily:"sans-serif",fontWeight:500}}>{done?"✓ ":""}{sub}</span>);})}
          </div>
          {!bothDone&&<button onClick={onSession} style={{display:"block",width:"100%",background:kid.color,border:"none",borderRadius:12,padding:"13px 16px",fontSize:15,fontWeight:600,color:"#fff",cursor:"pointer",fontFamily:"sans-serif",textAlign:"center"}}>Start today's session →</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[{l:"Sessions",v:sessions},{l:"Week",v:weekNum()},{l:"Streak",v:`${str}d`}].map(s=>(
            <div key={s.l} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"12px 14px"}}>
              <p style={{fontSize:22,fontWeight:600,color:kid.color,fontFamily:"sans-serif",margin:"0 0 2px"}}>{s.v}</p>
              <p style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0,textTransform:"uppercase",letterSpacing:1}}>{s.l}</p>
            </div>
          ))}
        </div>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px 16px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <p style={{fontSize:11,fontWeight:600,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0,textTransform:"uppercase",letterSpacing:1}}>Summer Progress</p>
            <p style={{fontSize:12,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>{sessions}/{TOTAL_DAYS} days</p>
          </div>
          <div style={{background:"var(--color-background-secondary)",borderRadius:99,height:8,overflow:"hidden"}}>
            <div style={{width:`${Math.min(100,Math.round((sessions/TOTAL_DAYS)*100))}%`,height:"100%",background:kid.color,borderRadius:99}} />
          </div>
        </div>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px 16px"}}>
          <p style={{fontSize:11,fontWeight:600,color:"var(--color-text-secondary)",letterSpacing:1.5,margin:"0 0 10px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Last 14 Days</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:6}}>
            {l14.map(d=>(<div key={d.k} style={{aspectRatio:"1",borderRadius:8,background:d.done?kid.color:d.today?kid.light:"var(--color-background-secondary)",border:d.today?`2px solid ${kid.color}`:"none",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,fontFamily:"sans-serif",fontWeight:500,color:d.done?"#fff":"var(--color-text-tertiary)"}}>{d.day}</span></div>))}
          </div>
        </div>
      </div>
      <BottomBar onBack={onBack} label={kid.name} sublabel={kid.grade} color={kid.color} />
    </div>
  );
}

function ParentDash({progress,onBack}) {
  const today=todayKey();
  const [expanded,setExpanded]=useState({});
  function retentionScore(subData) {
    if(!subData?.retention)return null;
    const ret=subData.retention;
    const filled=STEPS.filter(s=>ret[s.id]).length;
    const selfRate=ret.rate?.score||0;
    return {filled,total:STEPS.length,selfRate};
  }
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <div style={{background:"#0F172A",padding:"20px 20px 24px",flexShrink:0}}>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontFamily:"sans-serif",letterSpacing:2,margin:"0 0 4px",textTransform:"uppercase"}}>Parent View</p>
        <h2 style={{fontSize:24,fontWeight:600,color:"#fff",margin:"0 0 2px",fontFamily:"sans-serif"}}>Monitoring Dashboard</h2>
        <p style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontFamily:"sans-serif",margin:0}}>Week {weekNum()} · Stage {stageNum()} — {stageName(stageNum())} · Updates in real time</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 40px"}}>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:16,padding:"16px 18px",marginBottom:16}}>
          <p style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",letterSpacing:1.5,margin:"0 0 14px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Today — {today}</p>
          {["madison","garith"].map(kidId=>{
            const kid=KIDS[kidId],kp=progress[kidId]||{},td=kp[today]||{},pair=todayPair(kidId);
            const s1=!!td[pair[0]]?.done,s2=!!td[pair[1]]?.done,both=s1&&s2,neither=!s1&&!s2;
            const r0=retentionScore(td[pair[0]]),r1=retentionScore(td[pair[1]]);
            const key=`today_${kidId}`;
            return(
              <div key={kidId} style={{padding:"12px 0",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:both?"rgba(34,197,94,0.15)":kid.light,border:`2px solid ${both?"#22C55E":kid.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:18}}>{both?"✓":kid.emoji}</span></div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)",margin:"0 0 4px",fontFamily:kid.font}}>{kid.name}</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {pair.map((sub,i)=>{const done=i===0?s1:s2;return(<span key={sub} style={{background:done?"rgba(34,197,94,0.12)":"var(--color-background-secondary)",color:done?"#16A34A":"var(--color-text-secondary)",border:`1px solid ${done?"#22C55E":"var(--color-border-tertiary)"}`,borderRadius:99,padding:"3px 10px",fontSize:11,fontFamily:"sans-serif"}}>{done?"✓ ":""}{sub}</span>);})}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <span style={{background:both?"rgba(34,197,94,0.12)":neither?"rgba(239,68,68,0.08)":"rgba(245,158,11,0.12)",color:both?"#16A34A":neither?"#DC2626":"#92400E",border:`1px solid ${both?"#22C55E":neither?"#EF4444":"#F59E0B"}`,borderRadius:99,padding:"4px 12px",fontSize:11,fontFamily:"sans-serif",fontWeight:700}}>{both?"Done ✓":neither?"Not started":"In progress"}</span>
                    {(r0||r1)&&<button onClick={()=>setExpanded(p=>({...p,[key]:!p[key]}))} style={{background:"none",border:"none",fontSize:11,color:"var(--color-text-secondary)",fontFamily:"sans-serif",cursor:"pointer",padding:"2px 0"}}>{expanded[key]?"Hide detail ↑":"Retention detail ↓"}</button>}
                  </div>
                </div>
                {expanded[key]&&(r0||r1)&&(
                  <div style={{marginTop:12,padding:"12px 14px",background:"var(--color-background-secondary)",borderRadius:12}}>
                    <p style={{fontSize:10,fontWeight:700,color:"var(--color-text-secondary)",letterSpacing:1.5,margin:"0 0 10px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Retention breakdown</p>
                    {pair.map((sub,i)=>{
                      const score=i===0?r0:r1;
                      if(!score)return null;
                      const rateLabels=["","Still fuzzy","Getting it","Got it"];
                      const rateColors=["","#EF4444","#F59E0B","#22C55E"];
                      return(
                        <div key={sub} style={{marginBottom:10,paddingBottom:10,borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                            <p style={{fontSize:12,fontWeight:600,color:"var(--color-text-primary)",fontFamily:"sans-serif",margin:0}}>{sub}</p>
                            {score.selfRate>0&&<span style={{background:`rgba(${score.selfRate===1?"239,68,68":score.selfRate===2?"245,158,11":"34,197,94"},0.12)`,color:rateColors[score.selfRate],border:`1px solid ${rateColors[score.selfRate]}`,borderRadius:99,padding:"2px 8px",fontSize:10,fontFamily:"sans-serif",fontWeight:700}}>{rateLabels[score.selfRate]}</span>}
                          </div>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            {STEPS.map((st)=>{
                              const subData=progress[kidId]?.[today]?.[sub];
                              const stepDone=subData?.retention?.[st.id];
                              return(<div key={st.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{width:28,height:28,borderRadius:"50%",background:stepDone?st.color:"var(--color-background-primary)",border:`2px solid ${stepDone?st.color:"var(--color-border-secondary)"}`,display:"flex",alignItems:"center",justifyContent:"center"}} title={st.label}><span style={{fontSize:12}}>{stepDone?st.icon:"·"}</span></div><p style={{fontSize:9,color:"var(--color-text-tertiary)",fontFamily:"sans-serif",margin:0,textAlign:"center",lineHeight:1.2}}>{st.label}</p></div>);
                            })}
                            <p style={{fontSize:11,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:"0 0 0 4px"}}>{score.filled}/{score.total} steps</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {["madison","garith"].map(kidId=>{
          const kid=KIDS[kidId],kp=progress[kidId]||{};
          const sessions=Object.values(kp).filter(v=>typeof v==="object"&&v.done).length;
          const str=getStreak(kp),l14=getLast14(kp);
          const subCounts=kid.subjects.reduce((acc,s)=>{acc[s]=Object.values(kp).filter(v=>typeof v==="object"&&v[s]?.done).length;return acc;},{});
          const retCounts=kid.subjects.reduce((acc,s)=>{acc[s]=Object.values(kp).filter(v=>typeof v==="object"&&v[s]?.retention).length;return acc;},{});
          return(
            <div key={kidId} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:16,marginBottom:16,overflow:"hidden"}}>
              <div style={{background:kid.color,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div><p style={{fontSize:16,fontWeight:700,color:"#fff",margin:"0 0 2px",fontFamily:kid.font}}>{kid.name}</p><p style={{fontSize:11,color:"rgba(255,255,255,0.75)",fontFamily:"sans-serif",margin:0}}>{kid.grade} · {kid.track}</p></div>
                <div style={{textAlign:"right"}}><p style={{fontSize:24,fontWeight:700,color:"#fff",margin:"0 0 2px",fontFamily:"sans-serif"}}>{sessions}</p><p style={{fontSize:10,color:"rgba(255,255,255,0.75)",fontFamily:"sans-serif",margin:0,textTransform:"uppercase",letterSpacing:1}}>Sessions</p></div>
              </div>
              <div style={{padding:"14px 18px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                  {[{l:"Streak",v:`${str}d`},{l:"Week",v:weekNum()},{l:"Progress",v:`${Math.round((sessions/TOTAL_DAYS)*100)}%`}].map(s=>(<div key={s.l} style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"10px 12px"}}><p style={{fontSize:18,fontWeight:600,color:kid.color,fontFamily:"sans-serif",margin:"0 0 2px"}}>{s.v}</p><p style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0,textTransform:"uppercase",letterSpacing:1}}>{s.l}</p></div>))}
                </div>
                <p style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",letterSpacing:1.5,margin:"0 0 8px",textTransform:"uppercase"}}>Last 14 Days</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(14, 1fr)",gap:4,marginBottom:14}}>
                  {l14.map(d=><div key={d.k} style={{aspectRatio:"1",borderRadius:4,background:d.done?kid.color:d.today?kid.light:"var(--color-background-secondary)",border:d.today?`2px solid ${kid.color}`:"none"}} />)}
                </div>
                <p style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",letterSpacing:1.5,margin:"0 0 8px",textTransform:"uppercase"}}>Subject Coverage — Lessons · Retention</p>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {kid.subjects.map(sub=>(<div key={sub} style={{display:"flex",alignItems:"center",gap:10}}><p style={{fontSize:12,color:"var(--color-text-primary)",fontFamily:"sans-serif",margin:0,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub}</p><div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}><div style={{width:8,height:8,borderRadius:"50%",background:subCounts[sub]>0?kid.color:"var(--color-background-secondary)",border:`1px solid ${subCounts[sub]>0?kid.color:"var(--color-border-tertiary)"}`}} /><span style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",minWidth:12}}>{subCounts[sub]}</span><div style={{width:8,height:8,borderRadius:"50%",background:retCounts[sub]>0?"#6366F1":"var(--color-background-secondary)",border:`1px solid ${retCounts[sub]>0?"#6366F1":"var(--color-border-tertiary)"}`}} /><span style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",minWidth:12}}>{retCounts[sub]}</span></div></div>))}
                </div>
                <div style={{display:"flex",gap:12,marginTop:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:"50%",background:kid.color}} /><span style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif"}}>Lessons</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:"50%",background:"#6366F1"}} /><span style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif"}}>Retention reviews</span></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <BottomBar onBack={onBack} label="Parent Dashboard" sublabel={`Week ${weekNum()} · Stage ${stageNum()}`} color="#4C1D95" />
    </div>
  );
}

function PinScreen({title,subtitle,expected,onOk,onCancel}) {
  const [entered,setEntered]=useState("");
  const [shake,setShake]=useState(false);
  const [err,setErr]=useState(false);
  const len=expected.length;
  function press(v){
    if(entered.length>=len)return;
    const next=entered+v;setEntered(next);setErr(false);
    if(next.length===len){if(next===expected){setTimeout(onOk,200);}else{setShake(true);setErr(true);setTimeout(()=>{setShake(false);setEntered("");},700);}}
  }
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px"}}>
      <div style={{width:50,height:50,borderRadius:"50%",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}><span style={{fontSize:22,color:"#94A3B8"}}>◈</span></div>
      <h2 style={{fontSize:22,fontWeight:600,color:"var(--color-text-primary)",margin:"0 0 6px",fontFamily:"sans-serif"}}>{title}</h2>
      <p style={{fontSize:13,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:"0 0 32px",textAlign:"center"}}>{subtitle}</p>
      <div style={{display:"flex",gap:10,marginBottom:36,animation:shake?"shake 0.5s ease":"none"}}>
        {Array.from({length:len},(_,i)=><div key={i} style={{width:13,height:13,borderRadius:"50%",background:i<entered.length?(err?"#EF4444":"#0F172A"):"var(--color-background-secondary)",border:`2px solid ${err?"#EF4444":i<entered.length?"#0F172A":"var(--color-border-secondary)"}`,transition:"all 0.15s"}} />)}
      </div>
      {err&&<p style={{fontSize:12,color:"#EF4444",fontFamily:"sans-serif",margin:"-20px 0 20px",fontWeight:600}}>Incorrect PIN</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3, 68px)",gap:10,marginBottom:20}}>
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k,i)=>
          k===""?<div key={i} />:k==="⌫"?
          <button key={i} onClick={()=>{setEntered(e=>e.slice(0,-1));setErr(false);}} style={{height:68,borderRadius:14,background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-secondary)",fontSize:20,cursor:"pointer",color:"var(--color-text-secondary)",display:"flex",alignItems:"center",justifyContent:"center"}}>⌫</button>:
          <button key={i} onClick={()=>press(k)} style={{height:68,borderRadius:14,background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-secondary)",fontSize:20,fontWeight:500,cursor:"pointer",color:"var(--color-text-primary)",fontFamily:"sans-serif"}}>{k}</button>
        )}
      </div>
      <button onClick={onCancel} style={{background:"none",border:"none",fontSize:13,color:"var(--color-text-secondary)",fontFamily:"sans-serif",cursor:"pointer",padding:"8px 16px"}}>Cancel</button>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

export default function App() {
  const [screen,setScreen]=useState("home");
  const [activeKid,setActiveKid]=useState(null);
  const [pinTarget,setPinTarget]=useState(null);
  const [progress,setProgress]=useState({madison:{},garith:{},demo:{}});

  useEffect(()=>{loadProgress().then(p=>setProgress(p));},[]);

  async function markDone(kidId,subject,correct,retention) {
    if(kidId==="demo")return;
    const today2=todayKey(),pair=todayPair(kidId),kp=progress[kidId]||{},ex=kp[today2]||{};
    const subUpdate={done:true,correct,ts:Date.now()};
    if(retention) subUpdate.retention=retention;
    const upd={...ex,[subject]:subUpdate,subjects:pair.join(" + ")};
    if(subject.startsWith("spaced_")){const np={...progress,[kidId]:{...kp,[today2]:{...ex,[subject]:{done:true,ts:Date.now()}}}};setProgress(np);await saveProgress(kidId,np[kidId]);return;}
    const s1=subject===pair[0]?true:!!ex[pair[0]]?.done;
    const s2=subject===pair[1]?true:!!ex[pair[1]]?.done;
    if(s1&&s2) upd.done=true;
    const np={...progress,[kidId]:{...kp,[today2]:upd}};
    setProgress(np);
    await saveProgress(kidId,np[kidId]);
  }

  const wrap=node=><div style={{maxWidth:520,margin:"0 auto",minHeight:"100dvh",display:"flex",flexDirection:"column",paddingTop:"env(safe-area-inset-top)"}}>{node}</div>;

  if(screen==="kidpin") return wrap(<PinScreen title={`${KIDS[pinTarget]?.name}'s Account`} subtitle="Enter your personal PIN." expected={PINS[pinTarget]} onOk={()=>{setActiveKid(pinTarget);setScreen("dash");}} onCancel={()=>{setPinTarget(null);setScreen("home");}} />);
  if(screen==="parentpin") return wrap(<PinScreen title="Parent Access" subtitle="Enter your PIN to view the monitoring dashboard." expected={PINS.parent} onOk={()=>setScreen("parent")} onCancel={()=>setScreen("home")} />);
  if(screen==="parent") return wrap(<ParentDash progress={progress} onBack={()=>setScreen("home")} />);
  if(screen==="dash"&&activeKid) return wrap(<KidDash kidId={activeKid} progress={progress} onBack={()=>{setScreen("home");setActiveKid(null);}} onSession={()=>setScreen("session")} />);
  if(screen==="session"&&activeKid) return wrap(<Session kidId={activeKid} kidProg={progress[activeKid]||{}} onDone={(sub,correct,ret)=>markDone(activeKid,sub,correct,ret)} onBack={()=>setScreen("dash")} />);

  return wrap(
    <div style={{flex:1,padding:"48px 24px 32px",display:"flex",flexDirection:"column"}}>
      <p style={{fontSize:11,letterSpacing:3,color:"var(--color-text-secondary)",fontFamily:"sans-serif",textTransform:"uppercase",margin:"0 0 10px"}}>Berkeley County School District</p>
      <h1 style={{fontSize:34,fontWeight:600,color:"var(--color-text-primary)",margin:"0 0 4px",fontFamily:"Georgia,serif",letterSpacing:"-1px"}}>Summer 2026</h1>
      <p style={{fontSize:15,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:"0 0 36px"}}>SC Diploma Prep · Daily Habit System</p>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
        {["madison","garith","demo"].map(kidId=>{
          const k=KIDS[kidId],kp=progress[kidId]||{};
          const sessions=Object.values(kp).filter(v=>typeof v==="object"&&v.done).length;
          const str=getStreak(kp),td=kp[todayKey()]||{},pair=todayPair(kidId);
          const s1=!!td[pair[0]]?.done,s2=!!td[pair[1]]?.done,both=s1&&s2,partial=(s1||s2)&&!both;
          return(
            <button key={kidId} onClick={()=>{if(k.isDemo){setActiveKid("demo");setScreen("dash");}else{setPinTarget(kidId);setScreen("kidpin");}}}
              style={{background:"var(--color-background-primary)",border:`2px solid ${both?"#22C55E":partial?"#F59E0B":k.isDemo?"rgba(109,40,217,0.4)":"var(--color-border-secondary)"}`,borderRadius:16,padding:"18px 20px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:50,height:50,borderRadius:"50%",background:both?"rgba(34,197,94,0.12)":k.light,border:`2px solid ${both?"#22C55E":k.color}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:22,color:both?"#16A34A":k.color}}>{both?"✓":k.emoji}</span>
                </div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <p style={{fontSize:16,fontWeight:600,color:"var(--color-text-primary)",margin:0,fontFamily:k.font}}>{k.name}</p>
                    {k.isDemo&&<span style={{background:"rgba(109,40,217,0.1)",color:"#6D28D9",border:"1px solid rgba(109,40,217,0.3)",borderRadius:99,padding:"1px 8px",fontSize:10,fontFamily:"sans-serif",fontWeight:700,letterSpacing:1}}>DEMO</span>}
                    {!k.isDemo&&<span style={{fontSize:11,color:"var(--color-text-tertiary)",fontFamily:"sans-serif"}}>🔒</span>}
                  </div>
                  <p style={{fontSize:12,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>{k.grade} · {sessions} sessions{str>0?` · ⚡ ${str}d`:""}</p>
                </div>
              </div>
              <span style={{background:both?"rgba(34,197,94,0.12)":partial?"rgba(245,158,11,0.12)":k.isDemo?"rgba(109,40,217,0.08)":"var(--color-background-secondary)",color:both?"#16A34A":partial?"#92400E":k.isDemo?"#6D28D9":"var(--color-text-tertiary)",border:`1px solid ${both?"#22C55E":partial?"#F59E0B":k.isDemo?"rgba(109,40,217,0.3)":"var(--color-border-tertiary)"}`,borderRadius:99,padding:"4px 12px",fontSize:11,fontFamily:"sans-serif",fontWeight:600,whiteSpace:"nowrap"}}>
                {both?"Done ✓":partial?"1/2 done":k.isDemo?"View demo →":"Start →"}
              </span>
            </button>
          );
        })}
      </div>
      <button onClick={()=>setScreen("parentpin")} style={{display:"flex",alignItems:"center",gap:12,background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:16,padding:"16px 20px",cursor:"pointer",textAlign:"left",width:"100%"}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18,color:"#94A3B8"}}>◈</span></div>
        <div><p style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)",margin:"0 0 2px",fontFamily:"sans-serif"}}>Parent Dashboard</p><p style={{fontSize:12,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>Completion monitoring · PIN protected</p></div>
      </button>
      <p style={{fontSize:11,color:"var(--color-text-tertiary)",fontFamily:"sans-serif",margin:"24px 0 0",lineHeight:1.6,textAlign:"center"}}>SC Standard Diploma requires 24 credits.<br />Every session builds toward that goal.</p>
    </div>
  );
}
function buildDemo(){
  const p={},now=new Date();
  for(let i=13;i>=1;i--){
    const dt=new Date(now);dt.setDate(dt.getDate()-i);
    const k=dt.toISOString().slice(0,10);
    if(i%3!==0){const pr=PAIRS.demo[i%PAIRS.demo.length];p[k]={done:true,subjects:pr.join(" + "),[pr[0]]:{done:true,retention:{steps:[{score:3},{score:2},{score:3},{score:3},{score:3}]}},[pr[1]]:{done:true,retention:{steps:[{score:3},{score:3},{score:2},{score:3},{score:3}]}}};}
  }
  const tk=now.toISOString().slice(0,10),di=Math.max(0,Math.floor((now-SUMMER_START)/86400000)),tp=PAIRS.demo[di%PAIRS.demo.length];
  p[tk]={done:false,subjects:tp.join(" + "),[tp[0]]:{done:true}};
  return p;
}

async function askClaude(prompt){
  try{
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,messages:[{role:"user",content:prompt}]})});
    const d=await r.json();
    return d.content?.map(b=>b.text||"").join("")||"";
  }catch{return "";}
}

const C = {
  "English & Writing":{icon:"✍",note:"4 of your 24 required SC diploma credits.",stages:{
    1:{title:"What Writing Actually Is",obj:"Orientation: writing as a power skill",content:"Writing is not about grammar rules — it is about thinking clearly and making other people see what you see.\n\nEvery person who has ever changed anything did it partly through writing.\n\nThree types you will do in 9th grade:\n\nArgumentative — you take a position and defend it.\nInformational — you explain something so a reader understands it.\nNarrative — you tell a story that makes a reader feel something.",tryIt:"In 3 to 4 sentences, write about something you care about deeply. Do not worry about being correct — just write what you actually think.",ai:true,deep:"The writers who change culture write to make you feel something unexpected — Toni Morrison, James Baldwin, designers who write their own collection notes.\n\nChallenge: Find one designer who writes about their own work. Write 2 sentences about what their writing tells you about how they think.",real:"Your book idea is real. The fashion brand you will build is real. Both require you to write things that make people believe in what you are doing before they can see it.",recall:"What are the three types of writing you will do in 9th grade? Name them and give one sentence describing what each one does.",why:"Why do you think humans invented writing instead of just relying on memory and speech to pass information down?",connect:{madison:"You want to build a fashion brand. Write 2 sentences about how writing will matter in your specific future — not generally, but for the exact thing you are building.",garith:"Think about your favorite athlete or musician. Write 2 sentences about one way they use writing in their career that most people would not think about.",demo:"Think about a goal you have. Write 2 sentences about how writing could help you get there."},teach:"Explain the difference between argumentative, informational, and narrative writing to a 5th grader who has never heard these words. Use one example for each."},
    2:{title:"Thesis Statements",obj:"BCSD ELA: Construct clear argumentative claims",content:"A thesis is the one sentence your entire essay has to prove.\n\nWeak: Fashion affects how people feel.\nStrong: Fast fashion trains consumers to treat clothing as disposable — and that habit is destroying the environment and the people who make the clothes.\n\nThe strong version takes a clear position. Someone could argue against it. That is the test.",tryIt:"Write a thesis statement for this topic: Social media affects how teenagers see themselves. Make it specific enough that someone could argue the opposite.",ai:true,deep:"For fashion design: every collection has a concept statement. That is your thesis.\n\nChallenge: Find a designer whose collection has a clear concept. Write their concept as a one-sentence thesis.",real:"When you pitch your first collection you will have exactly one sentence to make them lean in. That sentence is your thesis.",recall:"Without looking back — what makes a thesis statement strong versus weak? Explain it in your own words.",why:"Why does a thesis need to be something someone could disagree with?",connect:{madison:"Write a one-sentence thesis for your fashion brand — what it stands for and why it matters more than what already exists.",garith:"Write a one-sentence thesis about something in basketball or gaming that you believe is true but that a lot of people would argue against.",demo:"Write a one-sentence thesis about something you believe that not everyone would agree with."},teach:"Explain what a thesis statement is to a 5th grader. Use a real example of a weak one and a strong one."},
    3:{title:"Argument, Evidence, Analysis",obj:"BCSD ELA: Support claims with relevant evidence",content:"Every strong essay runs on three parts:\n\nClaim — what you believe.\nEvidence — facts, quotes, or examples that support it.\nAnalysis — your explanation of why the evidence proves the claim.\n\nMost students skip the analysis. The analysis is where your grade lives.\n\nAfter every piece of evidence write: This shows that [connection to your claim].",tryIt:"Write a claim about the fashion industry. Add one piece of evidence and one sentence of analysis explaining why that evidence proves your claim.",ai:true,deep:"Challenge: Take your claim and write a full paragraph — claim, two pieces of evidence each with analysis, and a final sentence connecting it all back to your thesis.",real:"This is how lawyers build cases, how journalists support investigative stories, and how brand strategists justify repositioning.",recall:"Name the three parts of a strong argument and explain in one sentence what each one does.",why:"Why is the analysis step the hardest — and why do most students skip it?",connect:{madison:"Think about a design decision a fashion brand made that you think was right or wrong. Write a claim, one piece of evidence, and one sentence of analysis.",garith:"Think about a controversial call or trade in basketball. Write a claim, one piece of evidence, and one sentence of analysis.",demo:"Think about something you believe strongly. Write a claim, one piece of evidence, and one sentence of analysis."},teach:"Explain the difference between evidence and analysis to a 5th grader. Why is just having evidence not enough?"},
  }},
  "Algebra 1":{icon:"∑",note:"Required credit. EOC counts as 30% of your final grade in SC.",stages:{
    1:{title:"What Algebra Actually Is",obj:"Orientation: algebra as a problem-solving language",content:"Algebra was invented to solve problems where you do not know one of the numbers yet.\n\nExample: A dress sells for $120. You made $840 in sales. How many dresses did you sell?\n\n120 × n = 840\n\nThe letter n is a variable — a placeholder for the number you do not know.",tryIt:"Write a real situation from your life where you do not know one of the numbers. Describe it in 1 to 2 sentences and identify what the unknown is.",ai:true,deep:"The word algebra comes from the Arabic al-jabr, meaning the reunion of broken parts. It was invented to solve business and trade problems.",real:"The pricing of your first collection requires algebra. Cost of materials + cost of labor + profit margin = selling price.",recall:"In your own words — what is a variable, and what problem does algebra solve that regular arithmetic cannot?",why:"Why do you think mathematicians invented a letter to stand in for a number instead of just guessing?",connect:{madison:"Write a real equation from your fashion business — something you would actually need to solve. Use a variable for the unknown.",garith:"Write a real equation from basketball — salary cap, scoring average, or anything else. Use a variable for the unknown.",demo:"Write a real equation from your own life. Use a variable for the unknown."},teach:"Explain what a variable is to a 5th grader who has never seen algebra. Use one real-life example."},
    2:{title:"Variables and Expressions",obj:"BCSD Math: Represent and interpret algebraic expressions",content:"To solve 3x + 5 = 20:\nStep 1: Subtract 5 from both sides: 3x = 15\nStep 2: Divide both sides by 3: x = 5\n\nCheck: 3(5) + 5 = 20. Correct.\n\nThe rule: whatever you do to one side of an equation, do to the other.",tryIt:"Solve for x: 4x + 3 = 19. Show both steps.",ans:"4",hint:"Step 1: Subtract 3 — 4x = 16. Step 2: Divide by 4 — x = 4.",deep:"Challenge: Create your own equation using a real fashion or sports scenario and solve it.",real:"A fashion buyer or sports analyst calculates exact targets using equations like these every day.",recall:"Walk through the two steps for solving a two-step equation. Why do you have to do the same thing to both sides?",why:"Why does the rule do the same thing to both sides work? What would happen if you only changed one side?",connect:{madison:"Your fabric costs $3.50 per yard. You have $63 to spend. Write the equation and solve for how many yards you can buy.",garith:"A player earns $18 per point in a bonus structure and already has $54. He wants $126 total. Write the equation and solve.",demo:"Write a real two-step equation from your own life and solve it."},teach:"Explain two-step equations to a 5th grader. Walk them through one example step by step."},
    3:{title:"Linear Equations and Slope",obj:"BCSD Math: Represent and interpret linear relationships",content:"y = mx + b\nm = slope (how fast it changes)\nb = starting value\n\nExample: Start with $50 in savings, add $30 each week.\ny = 30x + 50\nAfter 4 weeks: y = 30(4) + 50 = 170",tryIt:"You start with $200 in savings and spend $25 per week on fabric. Write the equation and calculate how much you have after 5 weeks.",ans:"75",hint:"y = 200 - 25x. After 5 weeks: y = 200 - 25(5) = 75.",deep:"Challenge: Write a linear equation for your own scenario. At what point does it reach zero or break even?",real:"Every business projection is a linear equation at its core.",recall:"What do m and b represent in y = mx + b? Explain each one in plain language.",why:"Why is a constant rate of change called a slope? What does it mean visually if a slope is steep versus flat?",connect:{madison:"Write a linear equation for your fashion business. What does the slope tell you about your business?",garith:"A player improves their three-point percentage by 2% every month starting from 28%. When do they hit 40%?",demo:"Write a linear equation for something in your life that changes at a constant rate."},teach:"Explain y = mx + b to a 5th grader using a story about saving money. Make the slope and starting value obvious."},
  }},
  "Biology":{icon:"⬡",note:"Required credit. EOC counts as 30% of your final grade.",stages:{
    1:{title:"What Science Is",obj:"Orientation: scientific thinking as a tool",content:"Science is not a collection of facts. It is a method of thinking.\n\nThe method: observe, ask why, form a testable explanation, test it, look at the results honestly, update your understanding.\n\nBiology connects directly to fashion because every material you will ever design with comes from a living system.",tryIt:"Pick one clothing material — cotton, silk, wool, leather. Write 2 to 3 sentences about where you think it comes from.",ai:true,deep:"Bolt Threads grew silk protein using yeast cells. Modern Meadow grew leather from fungal mycelium. Biology is becoming the most important design tool in fashion.",real:"Stella McCartney partnered with Bolt Threads to create a bag made from mycelium leather.",recall:"Describe the scientific method in your own words — not the steps, but what the overall point of it is.",why:"Why is updating your conclusion when the data says you are wrong considered a strength of science rather than a weakness?",connect:{madison:"Think about one material you want to use in your designs. Describe a scientific question you could ask about that material.",garith:"Think about one thing in basketball that coaches seem to do by instinct. Write a scientific question you could test.",demo:"Think about something you believe is true. Write a scientific question you could test."},teach:"Explain the scientific method to a 5th grader in 4 to 5 sentences. Use an example from everyday life."},
    2:{title:"Cells — The Unit Everything Is Built From",obj:"BCSD Science: Structure and function of cells",content:"Every living thing is made of cells.\n\nKey parts:\nCell membrane — controls what enters and exits.\nNucleus — contains your DNA.\nMitochondria — converts food into usable energy (ATP).\nRibosome — reads DNA and builds proteins.\nVacuole — stores water, nutrients, or waste.",tryIt:"Name the part of the cell that produces energy and explain in one sentence what it does.",ans:"mitochondria",hint:"The mitochondria converts food molecules into ATP, which is the energy currency every living cell uses.",deep:"Challenge: Research how cotton fiber forms from plant cells. Write 3 sentences in your own words.",real:"Biotech companies creating next-generation fashion materials are engineering cells to produce specific proteins and fibers.",recall:"Name all five cell parts from the lesson and give a one-word job description for each one.",why:"Why does a cell need a membrane that controls what enters and exits?",connect:{madison:"Silk is produced by silkworm cells. Cotton fiber is produced by plant cells. Pick one and describe how the fiber is made at the cellular level.",garith:"Your muscles are made of cells. Explain what is happening inside those muscle cells when you are sprinting.",demo:"Pick one living material. Based on what you know about cells, describe how you think it is produced."},teach:"Explain the mitochondria to a 5th grader. Use an analogy that makes it memorable — not just it is the powerhouse of the cell."},
    3:{title:"Ecosystems and Fashion",obj:"BCSD Science: Energy flow and human impact on ecosystems",content:"An ecosystem is all living and nonliving things in an area interacting as a system.\n\nEnergy flows one direction: Sun → Producers → Consumers → Decomposers. Only 10% passes from one level to the next.\n\nFashion industry impact:\nCotton farming uses 24% of all insecticides used globally.\nSynthetic fabric releases microplastics into waterways.\nTextile dye runoff contaminates freshwater systems across Southeast Asia.",tryIt:"A textile factory releases chemical dye into a river. Trace the impact through at least 3 ecosystem levels in 4 to 5 sentences.",ai:true,deep:"Challenge: Research one specific ecosystem damaged by conventional fashion. Write 5 sentences — 3 on the damage and 2 on a design solution.",real:"Fashion buyers at major retailers now evaluate brands on environmental impact alongside price and design.",recall:"Explain energy flow in an ecosystem in your own words. Why does only 10% pass from one level to the next?",why:"Why does disrupting one part of an ecosystem cause problems throughout the whole system?",connect:{madison:"You are launching a fashion brand. Write 3 sentences about one supply chain decision that would reduce your ecosystem impact.",garith:"Sports stadiums have a significant ecosystem footprint. Write 3 sentences about one change a major arena could make.",demo:"Think about one industry you interact with daily. Write 3 sentences about one ecosystem impact it has."},teach:"Explain the 10% energy rule to a 5th grader. Why does it matter that so much energy is lost between each level?"},
  }},
  "World History":{icon:"◎",note:"Standard 9th grade Social Studies. Counts toward 3 required Social Studies credits.",stages:{
    1:{title:"What History Is",obj:"Orientation: historical thinking as systems understanding",content:"History is not a list of things that happened. That is a timeline.\n\nHistory is the study of why things happened, who was affected, whose story was recorded, and whose was left out.\n\nEvery system you live inside right now has a history that explains why it works the way it does.",tryIt:"Think about one thing in your life that is just the way it is — a rule, a social norm. Write 2 to 3 sentences about where you think that system came from.",ai:true,deep:"The concept of seasonal collections was invented in Paris in the mid-1800s. It was a business decision, not a natural law.",real:"Designers who understand fashion history can speak to journalists, buyers, and investors from a position of authority.",recall:"In your own words — what is the difference between a timeline and actual historical thinking?",why:"Why is it important to ask whose story was left out of the historical record?",connect:{madison:"Think about one rule or norm in the fashion industry. Write 3 sentences tracing where you think it came from historically.",garith:"The NBA has a salary cap and a draft system. Write 3 sentences about why you think those systems were created.",demo:"Think about one system or rule in an industry you care about. Write 3 sentences about where you think it came from."},teach:"Explain to a 5th grader why history is more than just memorizing dates and events."},
    2:{title:"Primary and Secondary Sources",obj:"BCSD Social Studies: Evaluate historical sources",content:"Primary source — created at the time of the event by someone who was there.\nExamples: a letter, a photograph, a speech.\n\nSecondary source — created later, analyzing primary sources.\nExamples: a textbook, a documentary.\n\nFor any source ask: Who created this? When? For what audience? What might they have left out?",tryIt:"Classify each source: (1) A Vogue magazine from 1965. (2) A fashion history textbook from 2018. (3) An interview recorded with a designer who worked in Paris in 1967.",ai:true,deep:"Challenge: Find one primary source related to a historical fashion event. Analyze it using the four key questions.",real:"The Met's Costume Institute builds every exhibition around primary source research.",recall:"What is the difference between a primary and secondary source? Give one example of each.",why:"Why can a primary source be unreliable even though the person was actually there?",connect:{madison:"Find or think of one primary source from fashion history. Write 3 sentences analyzing it using the four key questions.",garith:"Think of a famous moment in basketball history. Name one primary source and one secondary source that would exist.",demo:"Think of a historical event you know about. Name one primary source and one secondary source."},teach:"Explain the difference between primary and secondary sources to a 5th grader."},
    3:{title:"Cause and Effect",obj:"BCSD Social Studies: Analyze cause and effect relationships",content:"Nothing in history happens in isolation. Every event is both an effect of what came before and a cause of what comes next.\n\nThe Industrial Revolution of the 1800s created the fast fashion problem of the 2020s. Steam machinery → mass textile production → falling prices → mass market → fast fashion.\n\nThat is the chain.",tryIt:"The rise of social media in the 2010s changed how fashion trends spread. Identify two causes of this shift and two effects on designers, consumers, and the industry.",ai:true,deep:"Challenge: Choose any major fashion moment from the last 50 years. Write a chain of at least 4 linked causes and effects.",real:"Brand strategists think in cause and effect constantly. History taught you how to think this way.",recall:"Explain the cause-and-effect chain from the Industrial Revolution to modern fast fashion in your own words.",why:"Why is it important to trace the full chain of causes and effects rather than just identifying the most obvious single cause?",connect:{madison:"Think about a trend in fashion right now. Write a cause-and-effect chain of at least 3 links tracing how it got here.",garith:"Think about one rule or format change in basketball. Write a cause-and-effect chain of at least 3 links.",demo:"Think about one major change in an industry you know. Write a cause-and-effect chain of at least 3 links."},teach:"Explain cause and effect in history to a 5th grader. Use a simple chain of 3 events they would recognize."},
  }},
  "Creative Writing":{icon:"✦",note:"Elective credit toward your 8 required electives.",stages:{
    1:{title:"You Already Have a Story",obj:"Orientation: find what you want to write",content:"Every writer starts with something they cannot stop thinking about.\n\nToni Morrison wrote about what it felt like to be a Black woman in America at a time when that story was not being told by the people who lived it.\n\nThe writers who build real careers write about what will not leave them alone.",tryIt:"Write 3 to 5 sentences about the story you want to write. Not the plot — the feeling you want the reader to have when they finish it.",ai:true,deep:"Published authors describe books two ways: the external story and the internal story. The internal story is why readers tell other people about it.",real:"Literary agents evaluate manuscripts on both levels. The authors who build long careers are the ones whose internal stories resonate.",recall:"What is the difference between the external story and the internal story of a book?",why:"Why do you think the writers who write about what will not leave them alone tend to produce stronger work?",connect:{madison:"Write 3 sentences about what will not leave you alone — the thing you know your book needs to be about.",garith:"Think about a story that stayed with you after it ended. Write 3 sentences about what its internal story was really about.",demo:"Think about a story that stayed with you after it ended. Write 3 sentences about what its internal story was really about."},teach:"Explain the difference between external and internal story to a 5th grader. Use a movie or book they would know."},
    2:{title:"Premise and Stakes",obj:"Build a publishable premise",content:"Formula: [Character with a specific quality] wants [specific goal] but [specific obstacle] because [specific stakes].\n\nWeak: A girl tries to find her family.\nStrong: A girl with a photographic memory of everything except her own past tries to find her biological family — but every lead reveals a truth more dangerous than the mystery.\n\nSpecificity is everything.",tryIt:"Write a one-sentence premise for the story you want to write using the formula: character with a specific quality, goal, obstacle, stakes.",ai:true,deep:"Strong premises: specific distinctive character, high personal stakes, built-in tension where the obstacle connects to the character's strength or weakness.",real:"This is pitch culture — the ability to make someone lean in with one sentence.",recall:"Name the four parts of a strong premise and explain why each one matters.",why:"Why does specificity make a premise stronger?",connect:{madison:"Take the premise you wrote and make it 20% more specific — sharpen the character quality, raise the stakes, or clarify the obstacle.",garith:"Write a premise for a story set in the world of basketball or gaming. Use the full formula.",demo:"Take a premise you wrote or a story you love. Rewrite or describe the premise using the full four-part formula."},teach:"Explain what a premise is to a 5th grader and why every story needs one."},
    3:{title:"Voice — The Thing That Makes Your Writing Yours",obj:"Develop a distinct narrative voice",content:"Voice is the personality of the writing.\n\nVoice 1: She walked into the room. Everyone looked up.\n\nVoice 2: She entered the way only certain people do — like the room had been waiting for her, and the room knew it, and she knew it, and everyone else was just catching up.\n\nVoice 2 has a perspective. An attitude. That is voice.",tryIt:"Describe the last time you walked into a room and felt something. Write 4 to 5 sentences in your actual voice.",ai:true,deep:"Voice can be developed. Write a lot, read widely, and keep asking what it felt like and what it meant.",real:"Fashion designers who build recognizable brands have a voice that shows up consistently.",recall:"In your own words — what is voice in writing, and what are the two things it comes from?",why:"Why can voice not be faked for long?",connect:{madison:"Write 3 sentences about your fashion brand in your actual voice — not professional, not safe. Just your real perspective.",garith:"Write 3 sentences about your favorite player or game in your actual voice — not a review, just how you actually experience it.",demo:"Write 3 sentences about something you care about in your actual voice."},teach:"Explain what voice is in writing to a 5th grader. Use two versions of the same sentence to show the difference."},
  }},
  "Pre-Algebra":{icon:"◈",note:"Mastery here is your direct path into Algebra 1 — a required SC diploma credit.",stages:{
    1:{title:"What Math Is Really For",obj:"Orientation: math as a tool for real problems",content:"Every system you care about runs on math.\n\nBasketball: field goal percentage, player efficiency rating, salary cap calculations.\nVideo games: physics engines, damage formulas, probability tables.\nMusic: time signatures, frequency ratios, streaming revenue splits.",tryIt:"Pick one thing you care about — basketball, a specific game, music. Write 3 to 4 sentences about the ways math is involved in it.",ai:true,deep:"The NBA calculates Player Efficiency Rating: Points + Rebounds + Assists + Steals + Blocks minus Missed shots and Turnovers, divided by Minutes × 15.",real:"Every NBA front office has analysts who use mathematical models to evaluate players.",recall:"Name three real systems you care about and one specific way math is involved in each one.",why:"Why do you think math is involved in almost every system that humans build?",connect:{madison:"Think about the financial side of a fashion brand. Write 3 sentences about three specific things you would need math to figure out.",garith:"Think about the last game you watched or played. Write 3 sentences about three specific numbers that mattered.",demo:"Think about something you do or care about. Write 3 sentences about three specific ways math shows up in it."},teach:"Explain to a 5th grader why math is not just a school subject but a real tool. Use one specific example."},
    2:{title:"Order of Operations",obj:"BCSD Math: Apply PEMDAS",content:"PEMDAS:\nParentheses first\nExponents second\nMultiplication and Division left to right\nAddition and Subtraction left to right\n\nExample: 5 + 3 × 4\nWrong: 8 × 4 = 32\nRight: 3 × 4 = 12 first, then 5 + 12 = 17",tryIt:"Solve using PEMDAS: 6 + (2 × 5) - 3²",ans:"7",hint:"Step 1: Parentheses: 2 × 5 = 10. Step 2: Exponent: 3² = 9. Step 3: 6 + 10 - 9 = 7.",deep:"Challenge: Write your own multi-step expression and solve it with PEMDAS then without to see how different the answers are.",real:"The developers who build game systems have to understand PEMDAS perfectly.",recall:"List the PEMDAS order from memory and give a one-sentence reason why order matters at all.",why:"Why does math need a universal rule for order of operations?",connect:{madison:"Write a math expression with at least 3 operations that represents a real fashion business calculation. Solve it using PEMDAS.",garith:"Write a math expression with at least 3 operations that calculates something real in basketball. Solve it using PEMDAS.",demo:"Write a math expression with at least 3 operations that represents something real in your life. Solve it using PEMDAS."},teach:"Explain PEMDAS to a 5th grader who has never heard of it. Walk through one example step by step."},
    3:{title:"Variables and Expressions",obj:"BCSD Math: Evaluate and write algebraic expressions",content:"Evaluate 3x + 7 when x = 4: 3(4) + 7 = 12 + 7 = 19\n\nYou are getting ahead of 9th grade Algebra right now.",tryIt:"Evaluate 2x² + 3x - 1 when x = 3.",ans:"26",hint:"2(9) = 18, 3(3) = 9, 18 + 9 - 1 = 26.",deep:"True Shooting Percentage = Points ÷ (2 × (FGA + 0.44 × FTA)). Calculate it for your favorite player.",real:"Game designers write and balance damage formulas — algebraic expressions — to make games fair and fun.",recall:"Explain what it means to evaluate an algebraic expression. Walk through the process in your own words.",why:"Why is substituting a value into a variable useful in real life?",connect:{madison:"Write an algebraic expression for something real in fashion. Evaluate it for a specific value.",garith:"Write an algebraic expression for a real basketball calculation. Evaluate it for your favorite player's stats.",demo:"Write an algebraic expression for something real in your life. Evaluate it for a specific value."},teach:"Explain how to evaluate an algebraic expression to a 5th grader. Walk through one full example."},
  }},
  "Reading Comprehension":{icon:"◉",note:"ELA is 4 required credits for the SC diploma.",stages:{
    1:{title:"What Reading Comprehension Actually Is",obj:"Orientation: active reading as a skill",content:"Reading comprehension is not reading words. It is understanding what the words mean together — the main idea, the implication, the argument being made.\n\nReading a box score: not just numbers — understanding what the game looked like.\nReading a game manual: not just absorbing rules — understanding the system.",tryIt:"Find something written you actually care about. Read it. Write 2 to 3 sentences about the main point and one thing the writer implied but did not directly say.",ai:true,deep:"Reading things slightly above your current level pushes your skills forward faster than comfortable reading.",real:"NBA scouts write detailed scouting reports. That is reading comprehension applied to basketball.",recall:"In your own words — what is the difference between reading words and actually comprehending what you read?",why:"Why does reading things slightly above your current level improve your comprehension faster?",connect:{madison:"Find a paragraph from a fashion article. Write 2 sentences about the main point and one thing the writer implied.",garith:"Find a paragraph from a basketball article. Write 2 sentences about the main point and one thing the writer implied.",demo:"Find a paragraph from something you read recently. Write 2 sentences about the main point and one implied thing."},teach:"Explain the difference between reading and reading comprehension to a 5th grader."},
    2:{title:"Main Idea and Supporting Details",obj:"BCSD ELA: Identify central ideas",content:"Every text has a main idea — the central point the whole thing is trying to make.\n\nHow to find it:\n1. Ask what every paragraph has in common.\n2. Look for the sentence that could summarize the whole.\n3. Ask: what is the author trying to tell me overall?\n\nMain ideas are general. Details are specific.",tryIt:"Read this and identify the main idea and two supporting details: The three-point revolution permanently changed basketball strategy. Teams built around three-point shooting won more games. Coaches redesigned offensive systems around spacing and efficiency. Players who could not shoot from distance became strategic liabilities.",ai:true,deep:"Challenge: Find a sports article. Write: main idea in one sentence, three supporting details, and a five-word title.",real:"Every coach gives players game film analysis with a main point and supporting evidence.",recall:"Explain the three steps for finding a main idea in your own words.",why:"Why is being able to identify the main idea quickly a real advantage in actual life situations?",connect:{madison:"Find a short fashion article. Write the main idea in one sentence and two supporting details.",garith:"Find a short basketball article. Write the main idea in one sentence and two supporting details.",demo:"Find a short article about something you care about. Write the main idea in one sentence and two supporting details."},teach:"Explain the difference between a main idea and a supporting detail to a 5th grader."},
    3:{title:"Inference — Reading What Is Not Said",obj:"BCSD ELA: Draw logical inferences",content:"An inference is a conclusion you reach from evidence plus your own knowledge.\n\nText: Marcus checked his phone three times during warm-ups. The coach saw it and did not say anything. Yet.\n\nThe text never says Marcus is in trouble. But you know it.\n\nEvidence + your knowledge of how the world works = inference.\n\nA guess is unsupported. An inference is supported.",tryIt:"Read this and write two inferences with the evidence supporting each: The locker room was quieter than usual. Players dressed quickly and kept their eyes down. When the coach walked in, nobody looked up. The only sound was cleats on tile.",ai:true,deep:"Challenge: Find a scene in a book or article that implies something without stating it. Write the implied information and two pieces of evidence.",real:"Coaches read players by inferring from body language, energy, and shot selection.",recall:"What is the difference between a guess and an inference? What makes an inference valid?",why:"Why do authors imply things instead of stating them directly?",connect:{madison:"Read a fashion designer's interview. Write one inference about what they value — with specific evidence from the text.",garith:"Think about a coach or player you have observed. Write one inference about their mindset — with specific evidence.",demo:"Think about a person or situation you have observed recently. Write one inference with the specific evidence."},teach:"Explain the difference between a guess and an inference to a 5th grader. Use a short scene to show how evidence leads to a conclusion."},
  }},
  "Science":{icon:"⬡",note:"3 required credits for the SC diploma.",stages:{
    1:{title:"What Science Is",obj:"Orientation: scientific method as a way of thinking",content:"Science is not a collection of facts. It is a method for figuring out what is actually true.\n\nThe method:\n1. Observe something and notice a pattern.\n2. Ask why it happens.\n3. Make a hypothesis — a testable prediction.\n4. Design an experiment.\n5. Collect data honestly.\n6. Draw a conclusion and update if the data demands it.",tryIt:"Think about something in basketball, gaming, or music you have noticed — a pattern. Write it as a scientific observation: what do you notice, and what question does it make you want to ask?",ai:true,deep:"Sports science is one of the fastest-growing fields in professional athletics. NBA teams have sports scientists who study performance.",real:"Video game developers run experiments — testing different versions of a mechanic, collecting data, and updating the design.",recall:"Describe the six steps of the scientific method in your own words.",why:"Why is forming a hypothesis before you test something important?",connect:{madison:"Think about a design decision in fashion. Write a hypothesis you could actually test and describe the experiment.",garith:"Think about a basketball skill — free throw routine, sleep before a game. Write a hypothesis you could test.",demo:"Think about something you believe is true about performance or behavior. Write a hypothesis you could test."},teach:"Explain the scientific method to a 5th grader using an example from a sport or game."},
    2:{title:"Force and Motion",obj:"BCSD Science: Apply Newton's Laws",content:"Newton's three laws:\n\nLaw 1 — Inertia: An object stays at rest or keeps moving until a force acts on it.\n\nLaw 2 — F = ma: Force equals mass times acceleration.\n\nLaw 3 — Action and Reaction: Every force has an equal and opposite force back.",tryIt:"A player has a mass of 90 kg and accelerates at 3 m/s². What force are their legs producing? Use F = ma.",ans:"270",hint:"F = 90 × 3 = 270 Newtons.",deep:"Challenge: Research the optimal free throw release angle and explain it using Newton's laws.",real:"Sports engineers use Newton's laws to design shoes, courts, and equipment.",recall:"State Newton's three laws in your own words. Give a one-sentence basketball example for each one.",why:"Why does Law 3 mean that you cannot jump without the ground?",connect:{madison:"Think about how a model moves on a runway. Write 3 sentences connecting Newton's laws to movement in fashion.",garith:"Think about a specific basketball move. Write 3 sentences connecting each step to one of Newton's laws.",demo:"Think about a physical activity you do. Write 3 sentences connecting it to Newton's three laws."},teach:"Explain Newton's three laws to a 5th grader using only basketball examples."},
    3:{title:"Energy Transformation",obj:"BCSD Science: Analyze conservation of energy",content:"The Law of Conservation of Energy: energy cannot be created or destroyed. It can only change form.\n\nTypes:\nChemical — stored in food.\nKinetic — energy of motion.\nPotential — stored energy due to position.\nThermal — heat generated when energy transforms.\nSound — vibrations.",tryIt:"Trace the energy transformations: a player drinks a sports drink, sprints, jumps for a dunk, and the crowd roars. Name at least 4 energy types in order.",ai:true,deep:"Challenge: Research what wearable technology NBA teams use during practices. Write 4 sentences about what it measures.",real:"Electric vehicles use regenerative braking to convert kinetic energy back into stored electrical energy.",recall:"Name the five types of energy from the lesson and give a one-sentence real-world example of each one.",why:"Why is it significant that energy can never be destroyed — only changed form?",connect:{madison:"Think about the energy involved in producing a piece of clothing. Trace at least three energy transformations.",garith:"Trace the energy transformations in a full-court fast break. Name at least five transformations in order.",demo:"Think about something you do physically. Trace the energy transformations from your last meal to that action."},teach:"Explain the Law of Conservation of Energy to a 5th grader. Use the example of a jump shot."},
  }},
  "Social Studies":{icon:"◉",note:"3 required credits for the SC diploma.",stages:{
    1:{title:"What Social Studies Is",obj:"Orientation: systems thinking applied to history",content:"Social Studies is the study of how humans organize themselves — governments, economies, cultures, conflicts, and the systems of power that determine who gets what and why.\n\nWhy does the NBA have a salary cap? History.\nWhy does America have the government structure it has? History.\n\nWhen you understand the history of a system, you can navigate it on your own terms.",tryIt:"Think about one rule or system that affects your life — at school, in basketball, in gaming. Write 3 to 4 sentences about where you think it came from.",ai:true,deep:"The NBA Collective Bargaining Agreement exists because of a specific history of labor disputes going back to 1964.",real:"The athletes who understand the systems they operate inside can advocate for themselves and make better decisions.",recall:"In your own words — what is Social Studies actually studying, and why is it more useful than memorizing dates?",why:"Why is understanding the history of a system more powerful than just knowing the rules of that system?",connect:{madison:"Think about the fashion industry as a system. Write 3 sentences about one power structure in it — who controls what and who benefits.",garith:"Think about professional basketball as a system. Write 3 sentences about one power structure in it.",demo:"Think about an industry or institution you interact with. Write 3 sentences about one power structure in it."},teach:"Explain to a 5th grader why learning about history matters right now — use one example from sports or entertainment."},
    2:{title:"The Constitution",obj:"BCSD Social Studies: Analyze U.S. government structure",content:"Three branches:\n\nLegislative — Congress. Makes the laws.\nExecutive — President. Enforces the laws. Can veto.\nJudicial — Supreme Court. Interprets the laws. Can strike down unconstitutional laws.\n\nThis is called checks and balances. No single branch can dominate the others.",tryIt:"Congress passes a law that the President disagrees with. Walk through what can happen next in 3 to 4 sentences.",ai:true,deep:"Antitrust law — from the Constitution's Commerce Clause — is why the NBA cannot collude to suppress player wages.",real:"Player agents, team executives, and league commissioners work inside constitutional law constantly.",recall:"Name the three branches of government, their main job, and their main check on the other branches.",why:"Why did the founders design a system where no single branch has complete power?",connect:{madison:"Write 3 sentences about one way the Constitution's principles could or should apply to the fashion industry.",garith:"Write 3 sentences connecting the NBA Players Association to the checks-and-balances principle.",demo:"Think about an organization you are part of. Write 3 sentences about whether it has checks and balances."},teach:"Explain checks and balances to a 5th grader using a sports team as the analogy."},
    3:{title:"Civil Rights — How Change Actually Happens",obj:"BCSD Social Studies: Civil Rights Movement",content:"The Civil Rights Movement was a sustained, organized campaign to end racial segregation in America.\n\nKey events:\n1955: Montgomery Bus Boycott — 381 days of economic pressure.\n1963: March on Washington — 250,000 people.\n1964: Civil Rights Act.\n1965: Voting Rights Act.\n\nThe strategy: nonviolent direct action + legal challenges + economic pressure + coalition building.",tryIt:"The Montgomery Bus Boycott lasted 381 days. Write 3 to 4 sentences connecting the economic impact to why the city eventually gave in.",ai:true,deep:"In 2020, NBA players used economic pressure — refusing to play — just as Montgomery residents used the boycott in 1955.",real:"Every athlete who uses their platform is operating in a tradition that runs directly through the Civil Rights Movement.",recall:"Name the four strategies used in the Civil Rights Movement. Explain in one sentence why each one was necessary.",why:"Why was nonviolent direct action strategically powerful even when it was met with violence?",connect:{madison:"Write 3 sentences connecting the strategies of the Civil Rights Movement to what change would require in the fashion supply chain.",garith:"Write 3 sentences connecting the specific tactics players used in the 2020 NBA bubble strike to the Civil Rights Movement.",demo:"Think about an injustice in an industry or community you know. Write 3 sentences about how the Civil Rights strategy could apply."},teach:"Explain to a 5th grader why the Civil Rights Movement needed all four strategies at the same time."},
  }},
  "Life Skills Math":{icon:"◈",note:"Builds the financial literacy that connects to the Economics credit required for the SC diploma.",stages:{
    1:{title:"Why Most People Struggle With Money",obj:"Orientation: financial literacy as a power skill",content:"Most adults in America were never taught how money works.\n\nMost professional athletes go broke within five years of retirement. Not because they did not earn enough. Because nobody taught them how money works.\n\nFour things that determine your financial life:\n1. What you earn.\n2. What you spend.\n3. What you save and invest.\n4. What you owe and what it costs you.",tryIt:"Write 3 to 4 sentences about what you think you know about money and what you do not know.",ai:true,deep:"Your dad has built a business, manages a family estate, and is structuring a Dynasty Trust. All of that runs on financial literacy.",real:"The average NBA career lasts 4.5 years. The players who retire wealthy built financial literacy alongside their basketball skills.",recall:"Name the four things that determine your financial life and give a one-sentence explanation of each one.",why:"Why do you think schools historically have not taught personal finance?",connect:{madison:"Think about launching a fashion brand. Write 3 sentences about all four financial factors in the first year.",garith:"Think about a professional athlete's financial life. Write 3 sentences about all four factors.",demo:"Think about your own financial life in 5 years. Write 3 sentences about all four factors."},teach:"Explain to a 5th grader why financial literacy is a power skill. Use one example that shows what happens when someone does not have it."},
    2:{title:"Budgeting",obj:"BCSD Financial Literacy: Create and evaluate a personal budget",content:"A budget is a plan for your money before you spend it.\n\nThe 50/30/20 rule:\n50% on needs\n30% on wants\n20% on savings and debt payoff\n\nPay yourself first — move savings out before you have a chance to spend it.",tryIt:"Monthly income: $600. Fixed expenses: $80 phone. Variable: $120 food, $60 gaming. Using 50/30/20, how much should you be saving?",ans:"120",hint:"20% of $600 = $120.",deep:"Challenge: Create a monthly budget for a hypothetical first year out of high school. Use the 50/30/20 framework.",real:"Your dad built 8508 Production around budget discipline — knowing exactly what comes in, what goes out, and what the margin is.",recall:"Explain the 50/30/20 rule in your own words. Why does pay yourself first work better than saving whatever is left?",why:"Why is a budget a plan made before you spend rather than a record of what you spent?",connect:{madison:"Write a monthly budget for your first year running a fashion brand. Apply the 50/30/20 framework.",garith:"Write a monthly budget for your first year as a professional athlete. Apply the 50/30/20 framework.",demo:"Write a monthly budget for your life one year from now. Apply the 50/30/20 framework."},teach:"Explain the 50/30/20 rule to a 5th grader. Use a specific monthly income amount and walk them through how to split it."},
    3:{title:"Credit and Interest",obj:"BCSD Financial Literacy: True cost of credit",content:"Simple Interest: I = P × R × T\nP = Principal, R = Rate as decimal, T = Time in years\n\nBorrow $500 at 8% for 2 years:\nI = 500 × 0.08 × 2 = $80\nTotal paid back: $580\n\nYour credit score (300 to 850) determines your interest rate.",tryIt:"You borrow $1,500 at 12% simple interest for 3 years. How much total interest do you pay?",ans:"540",hint:"I = 1500 × 0.12 × 3 = $540.",deep:"Calculate total interest on a $25,000 car loan at 6% for 5 years. Then at 18%. What is the difference?",real:"The credit score you build starting at 18 determines the interest rate on your first home and your first business loan.",recall:"Walk through the simple interest formula — what each letter means and how to use it.",why:"Why does a higher credit score result in a lower interest rate?",connect:{madison:"You need a $15,000 business loan. Calculate the interest at 7% for 3 years versus 18% for 3 years. Write 2 sentences about what that difference means.",garith:"A rookie signs a car lease at 19% because he has no credit history. Calculate $30,000 for 4 years at 19% versus 6%. Write 2 sentences about why building credit early matters.",demo:"Think of a purchase you might finance in the next 10 years. Calculate the interest at two different rates."},teach:"Explain simple interest to a 5th grader using I = P × R × T. Walk through one full example with real numbers."},
  }},
};

const STEPS = [
  { id:"recall",  icon:"🧠", label:"Recall",     color:"#6366F1", desc:"Without looking back — what was the main point of this lesson?" },
  { id:"why",     icon:"💡", label:"Explain Why", color:"#F59E0B", desc:"Why does this concept work the way it does?" },
  { id:"connect", icon:"🔗", label:"Connect",     color:"#10B981", desc:"Connect this to your own world." },
  { id:"teach",   icon:"📣", label:"Teach It",    color:"#EC4899", desc:"Explain this to a 5th grader. Use one concrete example." },
  { id:"rate",    icon:"⭐", label:"Self-Rate",   color:"#8B5CF6", desc:"How confident do you feel about this concept right now?" },
];

function ConfirmModal({subject,color,onYes,onNo}) {
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}}>
      <div style={{background:"var(--color-background-primary)",borderRadius:"20px 20px 0 0",padding:"28px 24px 44px",width:"100%",maxWidth:520}}>
        <div style={{width:40,height:4,borderRadius:99,background:"var(--color-border-secondary)",margin:"0 auto 24px"}} />
        <div style={{width:56,height:56,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><span style={{fontSize:26,color:"#fff"}}>✓</span></div>
        <h3 style={{fontSize:20,fontWeight:700,color:"var(--color-text-primary)",textAlign:"center",margin:"0 0 8px",fontFamily:"Georgia,serif"}}>Mark {subject} complete?</h3>
        <p style={{fontSize:14,color:"var(--color-text-secondary)",textAlign:"center",fontFamily:"sans-serif",lineHeight:1.6,margin:"0 0 28px"}}>This saves your progress and starts your 5-step retention review.</p>
        <button onClick={onYes} style={{display:"block",width:"100%",background:color,border:"none",borderRadius:14,padding:"15px",fontSize:16,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"sans-serif",marginBottom:10}}>Yes, I finished it — let's lock it in ✓</button>
        <button onClick={onNo} style={{display:"block",width:"100%",background:"none",border:"1.5px solid var(--color-border-secondary)",borderRadius:14,padding:"13px",fontSize:14,color:"var(--color-text-secondary)",cursor:"pointer",fontFamily:"sans-serif"}}>Not yet — go back</button>
      </div>
    </div>
  );
}

function RetentionWalkthrough({kidId,subject,lesson,onComplete}) {
  const kid=KIDS[kidId];
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState({});
  const [input,setInput]=useState("");
  const [fb,setFb]=useState(null);
  const [loading,setLoading]=useState(false);
  const [rating,setRating]=useState(null);
  const [stepDone,setStepDone]=useState(false);
  const current=STEPS[step];
  const isLast=step===STEPS.length-1;
  const isRating=current.id==="rate";

  function getPrompt() {
    if(current.id==="recall") return lesson.recall;
    if(current.id==="why") return lesson.why;
    if(current.id==="connect") return lesson.connect?.[kidId]||lesson.connect?.demo||"Connect what you just learned to something real in your own life.";
    if(current.id==="teach") return lesson.teach;
    return "";
  }

  async function submit() {
    if(!input.trim()||stepDone)return;
    setLoading(true);
    const text=await askClaude(`You are a retention coach for ${kid.name}. Subject: ${subject}. Step: ${current.label}.\nTheir answer: "${input}"\nLesson: "${lesson.title}"\nGive feedback in exactly 2 sentences:\n1. What they got right.\n2. One specific thing to deepen.\nBe direct and encouraging. Under 60 words.`);
    setFb(text||"Good thinking. Keep building on this.");
    setAnswers(prev=>({...prev,[current.id]:{input,fb:text,ts:Date.now()}}));
    setStepDone(true);
    setLoading(false);
  }

  function advance() {
    if(isLast){onComplete({...answers,rate:{score:rating||2,ts:Date.now()}});return;}
    setStep(s=>s+1);setInput("");setFb(null);setStepDone(false);setRating(null);
  }

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <div style={{background:current.color,padding:"12px 16px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <p style={{fontSize:13,fontWeight:700,color:"#fff",margin:0,fontFamily:"sans-serif"}}>Retention Review · {subject}</p>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.8)",fontFamily:"sans-serif",margin:0}}>Step {step+1} of {STEPS.length}</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.25)",borderRadius:99,height:4,overflow:"hidden"}}>
          <div style={{width:`${((step+1)/STEPS.length)*100}%`,height:"100%",background:"#fff",borderRadius:99,transition:"width 0.4s"}} />
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 40px"}}>
        <div style={{display:"flex",gap:8,marginBottom:20,justifyContent:"center"}}>
          {STEPS.map((s,i)=>(
            <div key={s.id} style={{width:32,height:32,borderRadius:"50%",background:i<step?"var(--color-background-secondary)":i===step?current.color:"var(--color-background-secondary)",border:`2px solid ${i<=step?current.color:"var(--color-border-tertiary)"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s"}}>
              <span style={{fontSize:i<step?12:14}}>{i<step?"✓":s.icon}</span>
            </div>
          ))}
        </div>
        <div style={{background:"var(--color-background-primary)",border:`2px solid ${current.color}`,borderRadius:16,padding:"20px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:24}}>{current.icon}</span>
            <div>
              <p style={{fontSize:16,fontWeight:700,color:"var(--color-text-primary)",margin:0,fontFamily:"sans-serif"}}>{current.label}</p>
              <p style={{fontSize:11,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0,textTransform:"uppercase",letterSpacing:1}}>{current.desc}</p>
            </div>
          </div>
          {!isRating&&<p style={{fontSize:15,color:"var(--color-text-primary)",lineHeight:1.7,fontFamily:"sans-serif",margin:0,padding:"12px 14px",background:"var(--color-background-secondary)",borderRadius:10}}>{getPrompt()}</p>}
        </div>
        {isRating?(
          <div>
            <p style={{fontSize:14,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:"0 0 16px",textAlign:"center"}}>How well do you understand {subject} right now?</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              {[{v:1,label:"Still fuzzy",emoji:"🤔",desc:"I get the idea but I am not sure I could explain it"},{v:2,label:"Getting it",emoji:"👍",desc:"I understand it and could explain the main points"},{v:3,label:"Got it",emoji:"🔥",desc:"I could teach this and apply it right now"}].map(r=>(
                <button key={r.v} onClick={()=>{setRating(r.v);setStepDone(true);}} style={{background:rating===r.v?`rgba(${r.v===1?"239,68,68":r.v===2?"245,158,11":"34,197,94"},0.12)`:"var(--color-background-primary)",border:`2px solid ${rating===r.v?r.v===1?"#EF4444":r.v===2?"#F59E0B":"#22C55E":"var(--color-border-secondary)"}`,borderRadius:14,padding:"14px 8px",cursor:"pointer",textAlign:"center"}}>
                  <p style={{fontSize:24,margin:"0 0 6px"}}>{r.emoji}</p>
                  <p style={{fontSize:12,fontWeight:700,color:"var(--color-text-primary)",fontFamily:"sans-serif",margin:"0 0 4px"}}>{r.label}</p>
                  <p style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0,lineHeight:1.4}}>{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ):(
          <>
            <textarea value={input} onChange={e=>setInput(e.target.value)} disabled={stepDone} placeholder="Write your response here..." rows={4} style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${fb?"rgba(99,102,241,0.5)":"var(--color-border-secondary)"}`,borderRadius:10,padding:"10px 12px",fontSize:14,fontFamily:"sans-serif",resize:"vertical",outline:"none",background:stepDone?"var(--color-background-secondary)":"var(--color-background-primary)",color:"var(--color-text-primary)"}} />
            {!stepDone&&<button onClick={submit} disabled={loading||!input.trim()} style={{marginTop:8,background:loading||!input.trim()?"var(--color-background-secondary)":current.color,color:loading||!input.trim()?"var(--color-text-secondary)":"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:600,fontFamily:"sans-serif",cursor:loading||!input.trim()?"default":"pointer"}}>{loading?"Reviewing...":"Submit"}</button>}
            {fb&&<div style={{marginTop:12,padding:"12px 14px",borderRadius:10,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.3)"}}><p style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",letterSpacing:1.5,margin:"0 0 6px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Coach feedback</p><p style={{fontSize:14,color:"var(--color-text-primary)",lineHeight:1.65,fontFamily:"sans-serif",margin:0}}>{fb}</p></div>}
          </>
        )}
        {stepDone&&<button onClick={advance} style={{display:"block",width:"100%",background:current.color,border:"none",borderRadius:14,padding:"14px",fontSize:15,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"sans-serif",marginTop:12,textAlign:"center"}}>{isLast?"Complete review ✓":"Next step →"}</button>}
      </div>
    </div>
  );
}

function SpacedRetrieval({kidId,subject,lesson,onDone}) {
  const kid=KIDS[kidId];
  const [input,setInput]=useState("");
  const [fb,setFb]=useState(null);
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  async function check() {
    setLoading(true);
    const text=await askClaude(`Spaced retrieval coach for ${kid.name}. Yesterday they learned: "${lesson.title}" in ${subject}. They were asked: "${lesson.recall}". Their answer today: "${input}". In 2 sentences: what they remembered well, and one thing to reinforce. Warm and brief. Under 50 words.`);
    setFb(text||"Good recall. Keep it up.");setDone(true);setLoading(false);
  }
  return(
    <div style={{background:"var(--color-background-primary)",border:`2px solid ${kid.color}`,borderRadius:16,padding:"18px 20px",marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <span style={{fontSize:22}}>🔁</span>
        <div>
          <p style={{fontSize:13,fontWeight:700,color:kid.color,margin:0,fontFamily:"sans-serif"}}>Yesterday: {subject}</p>
          <p style={{fontSize:11,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>60-second recall — spaced retrieval</p>
        </div>
      </div>
      <p style={{fontSize:14,color:"var(--color-text-primary)",lineHeight:1.7,fontFamily:"sans-serif",margin:"0 0 12px",padding:"10px 12px",background:"var(--color-background-secondary)",borderRadius:8}}>{lesson.recall}</p>
      {!done?(
        <>
          <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Quick answer — no looking back..." rows={2} style={{width:"100%",boxSizing:"border-box",border:"1.5px solid var(--color-border-secondary)",borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"sans-serif",resize:"none",outline:"none",background:"var(--color-background-primary)",color:"var(--color-text-primary)",marginBottom:8}} />
          <div style={{display:"flex",gap:8}}>
            <button onClick={check} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?"var(--color-background-secondary)":kid.color,color:loading||!input.trim()?"var(--color-text-secondary)":"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:600,fontFamily:"sans-serif",cursor:loading||!input.trim()?"default":"pointer"}}>{loading?"Checking...":"Submit recall"}</button>
            <button onClick={onDone} style={{background:"none",border:"1px solid var(--color-border-secondary)",borderRadius:8,padding:"8px 16px",fontSize:12,color:"var(--color-text-secondary)",fontFamily:"sans-serif",cursor:"pointer"}}>Skip</button>
          </div>
        </>
      ):(
        <>
          {fb&&<p style={{fontSize:13,color:"var(--color-text-primary)",lineHeight:1.6,fontFamily:"sans-serif",margin:"0 0 10px",padding:"10px 12px",background:"rgba(99,102,241,0.08)",borderRadius:8,border:"1px solid rgba(99,102,241,0.3)"}}>{fb}</p>}
          <button onClick={onDone} style={{background:kid.color,border:"none",borderRadius:8,padding:"8px 16px",fontSize:12,fontWeight:600,color:"#fff",fontFamily:"sans-serif",cursor:"pointer"}}>Continue to today →</button>
        </>
      )}
    </div>
  );
}

function LessonView({kidId,subject,alreadyDone,onBack,onDone}) {
  const kid=KIDS[kidId];
  const s=stageNum();
  const lesson=C[subject]?.stages?.[s]||C[subject]?.stages?.[3];
  const [input,setInput]=useState("");
  const [fb,setFb]=useState(null);
  const [checking,setChecking]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const [deep,setDeep]=useState(false);
  const [mode,setMode]=useState(alreadyDone?"done":"lesson");
  if(!lesson) return <div style={{padding:40,color:"var(--color-text-primary)",fontFamily:"sans-serif"}}>Lesson not found for {subject}</div>;
  const isWriting=!lesson.ans&&lesson.ai;
  const chunks=lesson.content.split("\n\n").filter(Boolean);
  async function check(){
    if(!input.trim()||mode==="done")return;
    setChecking(true);setFb(null);
    if(isWriting){
      const t=await askClaude(`Concise academic coach for ${kid.name}. Asked: "${lesson.tryIt}". Answered: "${input}". Feedback in 3 parts, no headers: 1. What they did well. 2. One specific improvement. 3. One rewritten version. Under 80 words. Direct.`);
      setFb({type:"writing",text:t||"Good effort."});
    } else {
      const uNum=parseFloat(input.replace(/[^0-9.\-]/g,""));
      const cNum=parseFloat(lesson.ans);
      const correct=(!isNaN(uNum)&&!isNaN(cNum)&&Math.abs(uNum-cNum)<0.05)||input.trim().toLowerCase().includes((lesson.ans||"").toLowerCase());
      if(correct){setFb({type:"correct",text:"That is exactly right."});setMode("done");onDone(subject,true,null);}
      else{const t=await askClaude(`Student ${kid.name} answered "${input}" to: "${lesson.tryIt}". Correct: ${lesson.ans}. Hint: "${lesson.hint}". 2 sentences: what went wrong and guide them. Encouraging.`);setFb({type:"wrong",text:t||lesson.hint});}
    }
    setChecking(false);
  }
  const fbBg={correct:"rgba(34,197,94,0.1)",wrong:"rgba(234,179,8,0.1)",writing:"rgba(99,102,241,0.1)"};
  const fbBorder={correct:"#22C55E",wrong:"#EAB308",writing:"#6366F1"};
  const fbLabel={correct:"Correct ✓",wrong:"Not quite",writing:"Coach feedback"};
  if(mode==="walkthrough") return <RetentionWalkthrough kidId={kidId} subject={subject} lesson={lesson} onComplete={(data)=>{setMode("done");onDone(subject,true,data);}} />;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      {confirm&&<ConfirmModal subject={subject} color={kid.color} onYes={()=>{setConfirm(false);setMode("walkthrough");}} onNo={()=>setConfirm(false)} />}
      <div style={{background:kid.color,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:6,padding:"6px 12px",color:"#fff",fontSize:13,fontFamily:"sans-serif",cursor:"pointer"}}>← Back</button>
        <div style={{flex:1,minWidth:0}}>
          <p style={{fontSize:15,fontWeight:700,color:"#fff",margin:0,fontFamily:kid.font,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{subject}</p>
          <p style={{fontSize:11,color:"rgba(255,255,255,0.75)",margin:0,fontFamily:"sans-serif"}}>Stage {s} · {stageName(s)}{mode==="done"?" · Complete ✓":""}</p>
        </div>
        <span style={{background:"rgba(255,255,255,0.2)",borderRadius:99,padding:"4px 10px",fontSize:16}}>{C[subject]?.icon}</span>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 60px"}}>
        <div style={{background:kid.light,borderRadius:10,padding:"10px 14px",marginBottom:16,border:`1px solid ${kid.color}`}}>
          <p style={{fontSize:12,color:"var(--color-text-primary)",fontFamily:"sans-serif",margin:0,lineHeight:1.6}}><strong style={{color:kid.color}}>Diploma track:</strong> {C[subject].note}</p>
        </div>
        <p style={{fontSize:10,fontWeight:700,color:"var(--color-text-tertiary)",letterSpacing:2,margin:"0 0 4px",fontFamily:"sans-serif",textTransform:"uppercase"}}>{lesson.obj}</p>
        <h2 style={{fontSize:22,fontWeight:700,color:"var(--color-text-primary)",margin:"0 0 20px",fontFamily:kid.font,lineHeight:1.2}}>{lesson.title}</h2>
        {chunks.map((chunk,ci)=>{
          const lines=chunk.split("\n").filter(l=>l.trim());
          const isCode=lines.some(l=>/^(Step|Law |PEMDAS|\d\.|[A-Z]{2,}:)/.test(l.trim())||l.includes(" = ")||l.includes(" × ")||l.includes(" → "));
          if(isCode) return <div key={ci} style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"14px 16px",marginBottom:16,borderLeft:`3px solid ${kid.color}`}}>{lines.map((ln,li)=><p key={li} style={{fontSize:13,color:"var(--color-text-primary)",lineHeight:1.7,margin:"2px 0",fontFamily:"monospace"}}>{ln}</p>)}</div>;
          return <p key={ci} style={{fontSize:15,color:"var(--color-text-primary)",lineHeight:1.8,margin:"0 0 14px",fontFamily:"sans-serif"}}>{lines.join(" ")}</p>;
        })}
        <div style={{background:"rgba(245,158,11,0.1)",borderRadius:10,padding:"12px 14px",marginBottom:14,borderLeft:"3px solid #F59E0B",marginTop:8}}>
          <p style={{fontSize:11,fontWeight:700,color:"#92400E",letterSpacing:1.5,margin:"0 0 8px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Now you try it</p>
          <p style={{fontSize:14,color:"var(--color-text-primary)",lineHeight:1.7,fontFamily:"sans-serif",margin:0}}>{lesson.tryIt}</p>
        </div>
        <textarea value={input} onChange={e=>setInput(e.target.value)} disabled={mode==="done"} placeholder={isWriting?"Write your answer here...":"Type your answer..."} rows={isWriting?4:2} style={{width:"100%",boxSizing:"border-box",border:`1.5px solid ${fb?fbBorder[fb.type]:"var(--color-border-secondary)"}`,borderRadius:10,padding:"10px 12px",fontSize:14,fontFamily:"sans-serif",resize:"vertical",outline:"none",background:mode==="done"?"var(--color-background-secondary)":"var(--color-background-primary)",color:"var(--color-text-primary)"}} />
        {mode!=="done"&&<button onClick={check} disabled={checking||!input.trim()} style={{marginTop:8,background:checking||!input.trim()?"var(--color-background-secondary)":kid.color,color:checking||!input.trim()?"var(--color-text-secondary)":"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:500,fontFamily:"sans-serif",cursor:checking||!input.trim()?"default":"pointer"}}>{checking?"Checking...":"Check my answer"}</button>}
        {fb&&<div style={{marginTop:12,padding:"12px 14px",borderRadius:10,background:fbBg[fb.type],border:`1px solid ${fbBorder[fb.type]}`}}><p style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",letterSpacing:1.5,margin:"0 0 6px",fontFamily:"sans-serif",textTransform:"uppercase"}}>{fbLabel[fb.type]}</p><p style={{fontSize:14,color:"var(--color-text-primary)",lineHeight:1.65,fontFamily:"sans-serif",margin:0}}>{fb.text}</p>{fb.type==="writing"&&mode!=="done"&&<button onClick={()=>setConfirm(true)} style={{display:"block",marginTop:12,background:kid.color,border:"none",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:700,color:"#fff",fontFamily:"sans-serif",cursor:"pointer"}}>Mark complete ✓</button>}</div>}
        {mode!=="done"&&<div style={{marginTop:20,padding:"16px 18px",borderRadius:14,border:`2px dashed ${kid.color}`,background:kid.light,textAlign:"center"}}><p style={{fontSize:13,color:kid.dark,fontFamily:"sans-serif",margin:"0 0 12px",fontWeight:500}}>Finished? Tap confirm to save your progress and start the retention review.</p><button onClick={()=>setConfirm(true)} style={{background:kid.color,border:"none",borderRadius:10,padding:"11px 24px",fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"sans-serif"}}>Confirm complete ✓</button></div>}
        {mode==="done"&&<div style={{background:"rgba(34,197,94,0.1)",border:"1px solid #22C55E",borderRadius:12,padding:"16px 18px",marginTop:16,textAlign:"center"}}><p style={{fontSize:15,fontWeight:600,color:"#16A34A",margin:"0 0 4px",fontFamily:"sans-serif"}}>✓ Saved and reviewed</p><p style={{fontSize:13,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>Lesson complete and retention locked in. Parent dashboard updated.</p></div>}
        <button onClick={()=>setDeep(v=>!v)} style={{display:"block",width:"100%",background:"none",border:`1.5px solid ${kid.color}`,borderRadius:12,padding:"12px 16px",fontSize:13,fontWeight:600,color:kid.color,fontFamily:"sans-serif",cursor:"pointer",marginTop:20,textAlign:"center"}}>{deep?"Hide deeper content ↑":"🔑 Go deeper ↓"}</button>
        {deep&&<div style={{marginTop:12,borderRadius:12,overflow:"hidden",border:`1.5px solid ${kid.color}`}}><div style={{background:"var(--color-background-secondary)",padding:"18px 20px"}}><p style={{fontSize:11,fontWeight:700,color:kid.color,letterSpacing:2,margin:"0 0 12px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Going deeper</p>{lesson.deep.split("\n").filter(l=>l.trim()).map((ln,i)=><p key={i} style={{fontSize:14,color:"var(--color-text-primary)",lineHeight:1.8,margin:"0 0 10px",fontFamily:"sans-serif"}}>{ln}</p>)}</div><div style={{background:kid.light,padding:"18px 20px",borderTop:`1.5px solid ${kid.color}`}}><p style={{fontSize:11,fontWeight:700,color:kid.color,letterSpacing:2,margin:"0 0 10px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Where you use this</p><p style={{fontSize:15,color:"var(--color-text-primary)",lineHeight:1.8,margin:0,fontFamily:"sans-serif"}}>{lesson.real}</p></div></div>}
      </div>
    </div>
  );
}

function Session({kidId,kidProg,onDone,onBack}) {
  const kid=KIDS[kidId];
  const td=kidProg[todayKey()]||{};
  const yd=kidProg[yestKey()]||{};
  const pair=todayPair(kidId);
  const [active,setActive]=useState(null);
  const yestPair=PAIRS[kidId][Math.max(0,(dayIdx()-1))%PAIRS[kidId].length];
  const spacedSubjects=yestPair.filter(sub=>yd[sub]?.done&&!td[`spaced_${sub}`]);
  const [spacedDone,setSpacedDone]=useState({});
  if(active) return <LessonView kidId={kidId} subject={active} alreadyDone={!!td[active]?.done} onBack={()=>setActive(null)} onDone={(sub,correct,retention)=>{onDone(sub,correct,retention);setActive(null);}} />;
  const d0=!!td[pair[0]]?.done,d1=!!td[pair[1]]?.done;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <div style={{background:kid.color,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:6,padding:"6px 12px",color:"#fff",fontSize:13,fontFamily:"sans-serif",cursor:"pointer"}}>← Back</button>
        <div><p style={{fontSize:15,fontWeight:700,color:"#fff",margin:0,fontFamily:kid.font}}>Today's Session</p><p style={{fontSize:11,color:"rgba(255,255,255,0.75)",margin:0,fontFamily:"sans-serif"}}>Week {weekNum()} · Stage {stageNum()} of 3</p></div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 40px"}}>
        {spacedSubjects.filter(s=>!spacedDone[s]).map(sub=>{
          const lesson=C[sub]?.stages?.[stageNum()]||C[sub]?.stages?.[3];
          if(!lesson)return null;
          return <SpacedRetrieval key={sub} kidId={kidId} subject={sub} lesson={lesson} onDone={()=>{setSpacedDone(p=>({...p,[sub]:true}));onDone(`spaced_${sub}`,true,null);}} />;
        })}
        <div style={{background:"rgba(245,158,11,0.1)",borderRadius:12,padding:"12px 16px",marginBottom:16,border:"1px solid rgba(245,158,11,0.3)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{background:"#F59E0B",color:"#fff",fontSize:10,fontWeight:700,letterSpacing:1.5,padding:"2px 8px",borderRadius:99,fontFamily:"sans-serif",textTransform:"uppercase"}}>Stage {stageNum()} — {stageName(stageNum())}</span>
            <span style={{fontSize:12,color:"var(--color-text-secondary)",fontFamily:"sans-serif"}}>{[d0,d1].filter(Boolean).length}/2 complete</span>
          </div>
        </div>
        {pair.map((sub,i)=>{
          const done=i===0?d0:d1;
          return(
            <button key={sub} onClick={()=>setActive(sub)} style={{display:"flex",alignItems:"center",gap:14,width:"100%",background:done?"rgba(34,197,94,0.08)":"var(--color-background-primary)",border:`2px solid ${done?"#22C55E":kid.color}`,borderRadius:16,padding:"18px 20px",marginBottom:12,cursor:"pointer",textAlign:"left"}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:done?"rgba(34,197,94,0.15)":kid.light,border:`2px solid ${done?"#22C55E":kid.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:20}}>{done?"✓":C[sub]?.icon}</span></div>
              <div style={{flex:1}}>
                <p style={{fontSize:16,fontWeight:600,color:done?"#16A34A":"var(--color-text-primary)",margin:"0 0 3px",fontFamily:kid.font}}>{sub}</p>
                <p style={{fontSize:12,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>{done?"Lesson + retention review complete":"~13 minutes · lesson + 5-step review"}</p>
              </div>
              {!done&&<span style={{fontSize:20,color:kid.color}}>→</span>}
            </button>
          );
        })}
        {d0&&d1&&<div style={{background:"rgba(34,197,94,0.1)",border:"2px solid #22C55E",borderRadius:16,padding:"24px",textAlign:"center",marginTop:8}}><p style={{fontSize:32,margin:"0 0 12px"}}>🎯</p><p style={{fontSize:18,fontWeight:700,color:"#16A34A",margin:"0 0 6px",fontFamily:kid.font}}>Both subjects complete and reviewed.</p><p style={{fontSize:13,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>Parent dashboard is up to date.</p></div>}
      </div>
    </div>
  );
}

function KidDash({kidId,progress,onBack,onSession}) {
  const kid=KIDS[kidId],kp=progress[kidId]||{};
  const str=getStreak(kp),l14=getLast14(kp);
  const sessions=Object.values(kp).filter(v=>typeof v==="object"&&v.done).length;
  const tp=todayPair(kidId),td=kp[todayKey()]||{};
  const s1=!!td[tp[0]]?.done,s2=!!td[tp[1]]?.done,bothDone=s1&&s2;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <div style={{background:kid.color,padding:"20px 20px 24px",flexShrink:0,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.08)"}} />
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:6,padding:"4px 12px",color:"#fff",fontSize:12,fontFamily:"sans-serif",cursor:"pointer",marginBottom:14}}>← Back</button>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontFamily:"sans-serif",letterSpacing:2,margin:"0 0 4px",textTransform:"uppercase"}}>{kid.track}</p>
        <h2 style={{fontSize:26,fontWeight:700,color:"#fff",margin:"0 0 4px",fontFamily:kid.font}}>{kid.name}</h2>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.8)",fontFamily:"sans-serif",margin:0}}>{kid.tagline}</p>
        {str>0&&<div style={{display:"inline-block",marginTop:10,background:"rgba(255,255,255,0.2)",borderRadius:99,padding:"4px 14px"}}><span style={{fontSize:12,color:"#fff",fontFamily:"sans-serif",fontWeight:500}}>⚡ {str} day streak</span></div>}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 40px"}}>
        <div style={{background:bothDone?"rgba(34,197,94,0.1)":"var(--color-background-primary)",border:`2px solid ${bothDone?"#22C55E":kid.color}`,borderRadius:16,padding:"16px 18px",marginBottom:16}}>
          <p style={{fontSize:11,fontWeight:700,color:bothDone?"#16A34A":kid.color,letterSpacing:1.5,margin:"0 0 8px",fontFamily:"sans-serif",textTransform:"uppercase"}}>{bothDone?"Today Complete ✓":"Today's Session · ~26 min"}</p>
          <div style={{display:"flex",gap:8,marginBottom:bothDone?0:14,flexWrap:"wrap"}}>
            {tp.map((sub,i)=>{const done=i===0?s1:s2;return(<span key={i} style={{background:done?"rgba(34,197,94,0.12)":kid.light,color:done?"#15803D":kid.dark,border:`1px solid ${done?"#22C55E":kid.color}`,borderRadius:99,padding:"4px 12px",fontSize:12,fontFamily:"sans-serif",fontWeight:500}}>{done?"✓ ":""}{sub}</span>);})}
          </div>
          {!bothDone&&<button onClick={onSession} style={{display:"block",width:"100%",background:kid.color,border:"none",borderRadius:12,padding:"13px 16px",fontSize:15,fontWeight:600,color:"#fff",cursor:"pointer",fontFamily:"sans-serif",textAlign:"center"}}>Start today's session →</button>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[{l:"Sessions",v:sessions},{l:"Week",v:weekNum()},{l:"Streak",v:`${str}d`}].map(s=>(
            <div key={s.l} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"12px 14px"}}>
              <p style={{fontSize:22,fontWeight:600,color:kid.color,fontFamily:"sans-serif",margin:"0 0 2px"}}>{s.v}</p>
              <p style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0,textTransform:"uppercase",letterSpacing:1}}>{s.l}</p>
            </div>
          ))}
        </div>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px 16px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <p style={{fontSize:11,fontWeight:600,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0,textTransform:"uppercase",letterSpacing:1}}>Summer Progress</p>
            <p style={{fontSize:12,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>{sessions}/{TOTAL_DAYS} days</p>
          </div>
          <div style={{background:"var(--color-background-secondary)",borderRadius:99,height:8,overflow:"hidden"}}>
            <div style={{width:`${Math.min(100,Math.round((sessions/TOTAL_DAYS)*100))}%`,height:"100%",background:kid.color,borderRadius:99}} />
          </div>
        </div>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px 16px"}}>
          <p style={{fontSize:11,fontWeight:600,color:"var(--color-text-secondary)",letterSpacing:1.5,margin:"0 0 10px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Last 14 Days</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:6}}>
            {l14.map(d=>(<div key={d.k} style={{aspectRatio:"1",borderRadius:8,background:d.done?kid.color:d.today?kid.light:"var(--color-background-secondary)",border:d.today?`2px solid ${kid.color}`:"none",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,fontFamily:"sans-serif",fontWeight:500,color:d.done?"#fff":"var(--color-text-tertiary)"}}>{d.day}</span></div>))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentDash({progress,onBack}) {
  const today=todayKey();
  const [expanded,setExpanded]=useState({});
  function retentionScore(subData) {
    if(!subData?.retention)return null;
    const ret=subData.retention;
    const filled=STEPS.filter(s=>ret[s.id]).length;
    const selfRate=ret.rate?.score||0;
    return {filled,total:STEPS.length,selfRate};
  }
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:0}}>
      <div style={{background:"#0F172A",padding:"20px 20px 24px",flexShrink:0}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.12)",border:"none",borderRadius:6,padding:"4px 12px",color:"#fff",fontSize:12,fontFamily:"sans-serif",cursor:"pointer",marginBottom:14}}>← Back</button>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontFamily:"sans-serif",letterSpacing:2,margin:"0 0 4px",textTransform:"uppercase"}}>Parent View</p>
        <h2 style={{fontSize:24,fontWeight:600,color:"#fff",margin:"0 0 2px",fontFamily:"sans-serif"}}>Monitoring Dashboard</h2>
        <p style={{fontSize:12,color:"rgba(255,255,255,0.6)",fontFamily:"sans-serif",margin:0}}>Week {weekNum()} · Stage {stageNum()} — {stageName(stageNum())} · Updates in real time</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 40px"}}>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:16,padding:"16px 18px",marginBottom:16}}>
          <p style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",letterSpacing:1.5,margin:"0 0 14px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Today — {today}</p>
          {["madison","garith"].map(kidId=>{
            const kid=KIDS[kidId],kp=progress[kidId]||{},td=kp[today]||{},pair=todayPair(kidId);
            const s1=!!td[pair[0]]?.done,s2=!!td[pair[1]]?.done,both=s1&&s2,neither=!s1&&!s2;
            const r0=retentionScore(td[pair[0]]),r1=retentionScore(td[pair[1]]);
            const key=`today_${kidId}`;
            return(
              <div key={kidId} style={{padding:"12px 0",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:both?"rgba(34,197,94,0.15)":kid.light,border:`2px solid ${both?"#22C55E":kid.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:18}}>{both?"✓":kid.emoji}</span></div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)",margin:"0 0 4px",fontFamily:kid.font}}>{kid.name}</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {pair.map((sub,i)=>{const done=i===0?s1:s2;return(<span key={sub} style={{background:done?"rgba(34,197,94,0.12)":"var(--color-background-secondary)",color:done?"#16A34A":"var(--color-text-secondary)",border:`1px solid ${done?"#22C55E":"var(--color-border-tertiary)"}`,borderRadius:99,padding:"3px 10px",fontSize:11,fontFamily:"sans-serif"}}>{done?"✓ ":""}{sub}</span>);})}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <span style={{background:both?"rgba(34,197,94,0.12)":neither?"rgba(239,68,68,0.08)":"rgba(245,158,11,0.12)",color:both?"#16A34A":neither?"#DC2626":"#92400E",border:`1px solid ${both?"#22C55E":neither?"#EF4444":"#F59E0B"}`,borderRadius:99,padding:"4px 12px",fontSize:11,fontFamily:"sans-serif",fontWeight:700}}>{both?"Done ✓":neither?"Not started":"In progress"}</span>
                    {(r0||r1)&&<button onClick={()=>setExpanded(p=>({...p,[key]:!p[key]}))} style={{background:"none",border:"none",fontSize:11,color:"var(--color-text-secondary)",fontFamily:"sans-serif",cursor:"pointer",padding:"2px 0"}}>{expanded[key]?"Hide detail ↑":"Retention detail ↓"}</button>}
                  </div>
                </div>
                {expanded[key]&&(r0||r1)&&(
                  <div style={{marginTop:12,padding:"12px 14px",background:"var(--color-background-secondary)",borderRadius:12}}>
                    <p style={{fontSize:10,fontWeight:700,color:"var(--color-text-secondary)",letterSpacing:1.5,margin:"0 0 10px",fontFamily:"sans-serif",textTransform:"uppercase"}}>Retention breakdown</p>
                    {pair.map((sub,i)=>{
                      const score=i===0?r0:r1;
                      if(!score)return null;
                      const rateLabels=["","Still fuzzy","Getting it","Got it"];
                      const rateColors=["","#EF4444","#F59E0B","#22C55E"];
                      return(
                        <div key={sub} style={{marginBottom:10,paddingBottom:10,borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                            <p style={{fontSize:12,fontWeight:600,color:"var(--color-text-primary)",fontFamily:"sans-serif",margin:0}}>{sub}</p>
                            {score.selfRate>0&&<span style={{background:`rgba(${score.selfRate===1?"239,68,68":score.selfRate===2?"245,158,11":"34,197,94"},0.12)`,color:rateColors[score.selfRate],border:`1px solid ${rateColors[score.selfRate]}`,borderRadius:99,padding:"2px 8px",fontSize:10,fontFamily:"sans-serif",fontWeight:700}}>{rateLabels[score.selfRate]}</span>}
                          </div>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            {STEPS.map((st)=>{
                              const subData=progress[kidId]?.[today]?.[sub];
                              const stepDone=subData?.retention?.[st.id];
                              return(<div key={st.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{width:28,height:28,borderRadius:"50%",background:stepDone?st.color:"var(--color-background-primary)",border:`2px solid ${stepDone?st.color:"var(--color-border-secondary)"}`,display:"flex",alignItems:"center",justifyContent:"center"}} title={st.label}><span style={{fontSize:12}}>{stepDone?st.icon:"·"}</span></div><p style={{fontSize:9,color:"var(--color-text-tertiary)",fontFamily:"sans-serif",margin:0,textAlign:"center",lineHeight:1.2}}>{st.label}</p></div>);
                            })}
                            <p style={{fontSize:11,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:"0 0 0 4px"}}>{score.filled}/{score.total} steps</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {["madison","garith"].map(kidId=>{
          const kid=KIDS[kidId],kp=progress[kidId]||{};
          const sessions=Object.values(kp).filter(v=>typeof v==="object"&&v.done).length;
          const str=getStreak(kp),l14=getLast14(kp);
          const subCounts=kid.subjects.reduce((acc,s)=>{acc[s]=Object.values(kp).filter(v=>typeof v==="object"&&v[s]?.done).length;return acc;},{});
          const retCounts=kid.subjects.reduce((acc,s)=>{acc[s]=Object.values(kp).filter(v=>typeof v==="object"&&v[s]?.retention).length;return acc;},{});
          return(
            <div key={kidId} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:16,marginBottom:16,overflow:"hidden"}}>
              <div style={{background:kid.color,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div><p style={{fontSize:16,fontWeight:700,color:"#fff",margin:"0 0 2px",fontFamily:kid.font}}>{kid.name}</p><p style={{fontSize:11,color:"rgba(255,255,255,0.75)",fontFamily:"sans-serif",margin:0}}>{kid.grade} · {kid.track}</p></div>
                <div style={{textAlign:"right"}}><p style={{fontSize:24,fontWeight:700,color:"#fff",margin:"0 0 2px",fontFamily:"sans-serif"}}>{sessions}</p><p style={{fontSize:10,color:"rgba(255,255,255,0.75)",fontFamily:"sans-serif",margin:0,textTransform:"uppercase",letterSpacing:1}}>Sessions</p></div>
              </div>
              <div style={{padding:"14px 18px"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                  {[{l:"Streak",v:`${str}d`},{l:"Week",v:weekNum()},{l:"Progress",v:`${Math.round((sessions/TOTAL_DAYS)*100)}%`}].map(s=>(<div key={s.l} style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"10px 12px"}}><p style={{fontSize:18,fontWeight:600,color:kid.color,fontFamily:"sans-serif",margin:"0 0 2px"}}>{s.v}</p><p style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0,textTransform:"uppercase",letterSpacing:1}}>{s.l}</p></div>))}
                </div>
                <p style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",letterSpacing:1.5,margin:"0 0 8px",textTransform:"uppercase"}}>Last 14 Days</p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(14, 1fr)",gap:4,marginBottom:14}}>
                  {l14.map(d=><div key={d.k} style={{aspectRatio:"1",borderRadius:4,background:d.done?kid.color:d.today?kid.light:"var(--color-background-secondary)",border:d.today?`2px solid ${kid.color}`:"none"}} />)}
                </div>
                <p style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",letterSpacing:1.5,margin:"0 0 8px",textTransform:"uppercase"}}>Subject Coverage — Lessons · Retention</p>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {kid.subjects.map(sub=>(<div key={sub} style={{display:"flex",alignItems:"center",gap:10}}><p style={{fontSize:12,color:"var(--color-text-primary)",fontFamily:"sans-serif",margin:0,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub}</p><div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}><div style={{width:8,height:8,borderRadius:"50%",background:subCounts[sub]>0?kid.color:"var(--color-background-secondary)",border:`1px solid ${subCounts[sub]>0?kid.color:"var(--color-border-tertiary)"}`}} /><span style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",minWidth:12}}>{subCounts[sub]}</span><div style={{width:8,height:8,borderRadius:"50%",background:retCounts[sub]>0?"#6366F1":"var(--color-background-secondary)",border:`1px solid ${retCounts[sub]>0?"#6366F1":"var(--color-border-tertiary)"}`}} /><span style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif",minWidth:12}}>{retCounts[sub]}</span></div></div>))}
                </div>
                <div style={{display:"flex",gap:12,marginTop:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:"50%",background:kid.color}} /><span style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif"}}>Lessons</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:"50%",background:"#6366F1"}} /><span style={{fontSize:10,color:"var(--color-text-secondary)",fontFamily:"sans-serif"}}>Retention reviews</span></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PinScreen({title,subtitle,expected,onOk,onCancel}) {
  const [entered,setEntered]=useState("");
  const [shake,setShake]=useState(false);
  const [err,setErr]=useState(false);
  const len=expected.length;
  function press(v){
    if(entered.length>=len)return;
    const next=entered+v;setEntered(next);setErr(false);
    if(next.length===len){if(next===expected){setTimeout(onOk,200);}else{setShake(true);setErr(true);setTimeout(()=>{setShake(false);setEntered("");},700);}}
  }
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px"}}>
      <div style={{width:50,height:50,borderRadius:"50%",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20}}><span style={{fontSize:22,color:"#94A3B8"}}>◈</span></div>
      <h2 style={{fontSize:22,fontWeight:600,color:"var(--color-text-primary)",margin:"0 0 6px",fontFamily:"sans-serif"}}>{title}</h2>
      <p style={{fontSize:13,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:"0 0 32px",textAlign:"center"}}>{subtitle}</p>
      <div style={{display:"flex",gap:10,marginBottom:36,animation:shake?"shake 0.5s ease":"none"}}>
        {Array.from({length:len},(_,i)=><div key={i} style={{width:13,height:13,borderRadius:"50%",background:i<entered.length?(err?"#EF4444":"#0F172A"):"var(--color-background-secondary)",border:`2px solid ${err?"#EF4444":i<entered.length?"#0F172A":"var(--color-border-secondary)"}`,transition:"all 0.15s"}} />)}
      </div>
      {err&&<p style={{fontSize:12,color:"#EF4444",fontFamily:"sans-serif",margin:"-20px 0 20px",fontWeight:600}}>Incorrect PIN</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3, 68px)",gap:10,marginBottom:20}}>
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k,i)=>
          k===""?<div key={i} />:k==="⌫"?
          <button key={i} onClick={()=>{setEntered(e=>e.slice(0,-1));setErr(false);}} style={{height:68,borderRadius:14,background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-secondary)",fontSize:20,cursor:"pointer",color:"var(--color-text-secondary)",display:"flex",alignItems:"center",justifyContent:"center"}}>⌫</button>:
          <button key={i} onClick={()=>press(k)} style={{height:68,borderRadius:14,background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-secondary)",fontSize:20,fontWeight:500,cursor:"pointer",color:"var(--color-text-primary)",fontFamily:"sans-serif"}}>{k}</button>
        )}
      </div>
      <button onClick={onCancel} style={{background:"none",border:"none",fontSize:13,color:"var(--color-text-secondary)",fontFamily:"sans-serif",cursor:"pointer",padding:"8px 16px"}}>Cancel</button>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

export default function App() {
  const [screen,setScreen]=useState("home");
  const [activeKid,setActiveKid]=useState(null);
  const [pinTarget,setPinTarget]=useState(null);
  const [progress,setProgress]=useState({madison:{},garith:{},demo:{}});

  useEffect(()=>{loadProgress().then(p=>setProgress(p));},[]);

  async function markDone(kidId,subject,correct,retention) {
    if(kidId==="demo")return;
    const today2=todayKey(),pair=todayPair(kidId),kp=progress[kidId]||{},ex=kp[today2]||{};
    const subUpdate={done:true,correct,ts:Date.now()};
    if(retention) subUpdate.retention=retention;
    const upd={...ex,[subject]:subUpdate,subjects:pair.join(" + ")};
    if(subject.startsWith("spaced_")){const np={...progress,[kidId]:{...kp,[today2]:{...ex,[subject]:{done:true,ts:Date.now()}}}};setProgress(np);await saveProgress(kidId,np[kidId]);return;}
    const s1=subject===pair[0]?true:!!ex[pair[0]]?.done;
    const s2=subject===pair[1]?true:!!ex[pair[1]]?.done;
    if(s1&&s2) upd.done=true;
    const np={...progress,[kidId]:{...kp,[today2]:upd}};
    setProgress(np);
    await saveProgress(kidId,np[kidId]);
  }

  const wrap=node=><div style={{maxWidth:520,margin:"0 auto",minHeight:"100dvh",display:"flex",flexDirection:"column"}}>{node}</div>;

  if(screen==="kidpin") return wrap(<PinScreen title={`${KIDS[pinTarget]?.name}'s Account`} subtitle="Enter your personal PIN." expected={PINS[pinTarget]} onOk={()=>{setActiveKid(pinTarget);setScreen("dash");}} onCancel={()=>{setPinTarget(null);setScreen("home");}} />);
  if(screen==="parentpin") return wrap(<PinScreen title="Parent Access" subtitle="Enter your PIN to view the monitoring dashboard." expected={PINS.parent} onOk={()=>setScreen("parent")} onCancel={()=>setScreen("home")} />);
  if(screen==="parent") return wrap(<ParentDash progress={progress} onBack={()=>setScreen("home")} />);
  if(screen==="dash"&&activeKid) return wrap(<KidDash kidId={activeKid} progress={progress} onBack={()=>{setScreen("home");setActiveKid(null);}} onSession={()=>setScreen("session")} />);
  if(screen==="session"&&activeKid) return wrap(<Session kidId={activeKid} kidProg={progress[activeKid]||{}} onDone={(sub,correct,ret)=>markDone(activeKid,sub,correct,ret)} onBack={()=>setScreen("dash")} />);

  return wrap(
    <div style={{flex:1,padding:"48px 24px 32px",display:"flex",flexDirection:"column"}}>
      <p style={{fontSize:11,letterSpacing:3,color:"var(--color-text-secondary)",fontFamily:"sans-serif",textTransform:"uppercase",margin:"0 0 10px"}}>Berkeley County School District</p>
      <h1 style={{fontSize:34,fontWeight:600,color:"var(--color-text-primary)",margin:"0 0 4px",fontFamily:"Georgia,serif",letterSpacing:"-1px"}}>Summer 2026</h1>
      <p style={{fontSize:15,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:"0 0 36px"}}>SC Diploma Prep · Daily Habit System</p>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
        {["madison","garith","demo"].map(kidId=>{
          const k=KIDS[kidId],kp=progress[kidId]||{};
          const sessions=Object.values(kp).filter(v=>typeof v==="object"&&v.done).length;
          const str=getStreak(kp),td=kp[todayKey()]||{},pair=todayPair(kidId);
          const s1=!!td[pair[0]]?.done,s2=!!td[pair[1]]?.done,both=s1&&s2,partial=(s1||s2)&&!both;
          return(
            <button key={kidId} onClick={()=>{if(k.isDemo){setActiveKid("demo");setScreen("dash");}else{setPinTarget(kidId);setScreen("kidpin");}}}
              style={{background:"var(--color-background-primary)",border:`2px solid ${both?"#22C55E":partial?"#F59E0B":k.isDemo?"rgba(109,40,217,0.4)":"var(--color-border-secondary)"}`,borderRadius:16,padding:"18px 20px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:50,height:50,borderRadius:"50%",background:both?"rgba(34,197,94,0.12)":k.light,border:`2px solid ${both?"#22C55E":k.color}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:22,color:both?"#16A34A":k.color}}>{both?"✓":k.emoji}</span>
                </div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <p style={{fontSize:16,fontWeight:600,color:"var(--color-text-primary)",margin:0,fontFamily:k.font}}>{k.name}</p>
                    {k.isDemo&&<span style={{background:"rgba(109,40,217,0.1)",color:"#6D28D9",border:"1px solid rgba(109,40,217,0.3)",borderRadius:99,padding:"1px 8px",fontSize:10,fontFamily:"sans-serif",fontWeight:700,letterSpacing:1}}>DEMO</span>}
                    {!k.isDemo&&<span style={{fontSize:11,color:"var(--color-text-tertiary)",fontFamily:"sans-serif"}}>🔒</span>}
                  </div>
                  <p style={{fontSize:12,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>{k.grade} · {sessions} sessions{str>0?` · ⚡ ${str}d`:""}</p>
                </div>
              </div>
              <span style={{background:both?"rgba(34,197,94,0.12)":partial?"rgba(245,158,11,0.12)":k.isDemo?"rgba(109,40,217,0.08)":"var(--color-background-secondary)",color:both?"#16A34A":partial?"#92400E":k.isDemo?"#6D28D9":"var(--color-text-tertiary)",border:`1px solid ${both?"#22C55E":partial?"#F59E0B":k.isDemo?"rgba(109,40,217,0.3)":"var(--color-border-tertiary)"}`,borderRadius:99,padding:"4px 12px",fontSize:11,fontFamily:"sans-serif",fontWeight:600,whiteSpace:"nowrap"}}>
                {both?"Done ✓":partial?"1/2 done":k.isDemo?"View demo →":"Start →"}
              </span>
            </button>
          );
        })}
      </div>
      <button onClick={()=>setScreen("parentpin")} style={{display:"flex",alignItems:"center",gap:12,background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:16,padding:"16px 20px",cursor:"pointer",textAlign:"left",width:"100%"}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18,color:"#94A3B8"}}>◈</span></div>
        <div><p style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)",margin:"0 0 2px",fontFamily:"sans-serif"}}>Parent Dashboard</p><p style={{fontSize:12,color:"var(--color-text-secondary)",fontFamily:"sans-serif",margin:0}}>Completion monitoring · PIN protected</p></div>
      </button>
      <p style={{fontSize:11,color:"var(--color-text-tertiary)",fontFamily:"sans-serif",margin:"24px 0 0",lineHeight:1.6,textAlign:"center"}}>SC Standard Diploma requires 24 credits.<br />Every session builds toward that goal.</p>
    </div>
  );
}
