/* ═══════════════════════════════════════════════
   EMOTILEARN - CONSTANTS & STATIC MOCK DATA
═══════════════════════════════════════════════ */

export const EM = {
  focused:    { emoji:"🎯", label:"Focused",    color:"#00ff88", badge:"b-green",  tip:"You're in the zone! Serving advanced content." },
  confused:   { emoji:"😕", label:"Confused",   color:"#ff8c00", badge:"b-orange", tip:"Switching to step-by-step explanations." },
  bored:      { emoji:"😴", label:"Bored",      color:"#9d4edd", badge:"b-purple", tip:"Challenge mode activated — stay engaged!" },
  happy:      { emoji:"😊", label:"Happy",      color:"#00d4ff", badge:"b-blue",   tip:"Great energy! Maintaining current pace." },
  frustrated: { emoji:"😤", label:"Frustrated", color:"#ff3366", badge:"b-red",    tip:"Slowing down — extra hints & support added." },
};

export const ICON = {
  dashboard: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  learn:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  emotion:   <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  analytics: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  admin:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  settings:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  camera:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  play:      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  brain:     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.14Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.14Z"/></svg>,
  zap:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  check:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  bell:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
};

export const COURSES = [
  { id:1, title:"Machine Learning Fundamentals", subject:"AI/ML",      progress:72, lessons:24, duration:"18h", icon:"🧠", color:"#00d4ff" },
  { id:2, title:"Data Structures & Algorithms",  subject:"CS",         progress:45, lessons:32, duration:"24h", icon:"⚡", color:"#00ff88" },
  { id:3, title:"Neural Network Design",          subject:"Deep Learn", progress:18, lessons:20, duration:"15h", icon:"🔬", color:"#9d4edd" },
  { id:4, title:"Python for Data Science",        subject:"Python",     progress:90, lessons:16, duration:"12h", icon:"🐍", color:"#ffd60a" },
];

export const ADAPT_LESSONS = {
  focused:    [
    { title:"Advanced Gradient Descent & Adam",    type:"Advanced",     icon:"🚀", time:"25m", diff:5 },
    { title:"Transformer Architecture Internals",  type:"Research",     icon:"🔬", time:"35m", diff:5 },
    { title:"Custom CNN from Scratch",             type:"Project",      icon:"⚙️", time:"40m", diff:5 },
  ],
  confused:   [
    { title:"Gradient Descent — Visual Guide",     type:"Beginner",     icon:"📚", time:"15m", diff:1 },
    { title:"Neural Networks Explained Simply",    type:"Visual",       icon:"🎨", time:"12m", diff:1 },
    { title:"Guided Practice with Step Hints",     type:"Exercise",     icon:"✏️", time:"20m", diff:2 },
  ],
  bored:      [
    { title:"Speed Coding: ML Challenge",          type:"Competition",  icon:"⚡", time:"10m", diff:4 },
    { title:"Build a Digit Recognizer",            type:"Project",      icon:"🛠️", time:"30m", diff:4 },
    { title:"Rapid-Fire Quiz — 50 Questions",      type:"Game",         icon:"🎮", time:"12m", diff:3 },
  ],
  happy:      [
    { title:"Convolutional Neural Networks",       type:"Intermediate", icon:"📡", time:"22m", diff:3 },
    { title:"Real-World ML Case Studies",          type:"Applied",      icon:"💼", time:"25m", diff:3 },
    { title:"Model Evaluation & Tuning",           type:"Skills",       icon:"📊", time:"18m", diff:3 },
  ],
  frustrated: [
    { title:"Back to Basics: Core ML Concepts",   type:"Foundation",   icon:"🏗️", time:"15m", diff:1 },
    { title:"Common Mistakes & How to Fix",        type:"Support",      icon:"🛟", time:"12m", diff:1 },
    { title:"AI Tutor Walkthrough Session",        type:"Guided",       icon:"🤝", time:"20m", diff:1 },
  ],
};

export const weekData = [
  { day:"Mon", engagement:72, completion:65, score:78 },
  { day:"Tue", engagement:85, completion:78, score:82 },
  { day:"Wed", engagement:68, completion:60, score:74 },
  { day:"Thu", engagement:90, completion:85, score:88 },
  { day:"Fri", engagement:82, completion:75, score:85 },
  { day:"Sat", engagement:60, completion:55, score:70 },
  { day:"Sun", engagement:45, completion:40, score:65 },
];

export const emDist = [
  { name:"Focused", value:38, color:"#00ff88" },
  { name:"Happy",   value:25, color:"#00d4ff" },
  { name:"Confused",value:18, color:"#ff8c00" },
  { name:"Bored",   value:12, color:"#9d4edd" },
  { name:"Frustrated",value:7,color:"#ff3366" },
];

export const studentRows = [
  { name:"Aarav S.",  emotion:"focused",    score:94, time:"2h15m", course:"ML Fundamentals", status:"Online" },
  { name:"Priya M.",  emotion:"confused",   score:67, time:"1h42m", course:"Neural Networks",  status:"Online" },
  { name:"Zara K.",   emotion:"bored",      score:78, time:"3h10m", course:"Data Structures",  status:"Away"   },
  { name:"Ethan R.",  emotion:"happy",      score:88, time:"1h55m", course:"Python DS",         status:"Online" },
  { name:"Nina L.",   emotion:"frustrated", score:52, time:"0h48m", course:"ML Fundamentals",  status:"Online" },
  { name:"Kai T.",    emotion:"focused",    score:91, time:"2h30m", course:"Deep Learning",    status:"Offline"},
];
