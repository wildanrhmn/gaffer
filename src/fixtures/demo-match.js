// A realistic grassroots match scenario used by the scripted demo (`npm run demo`)
// so Gaffer runs end-to-end without a live microphone. This is the coach talking
// out loud on the touchline during the first half of an U-14 match.
//
// `tMs` is the offset from kickoff. `text` is exactly what a coach would say.
// Tags are intentionally NOT included here — the LLM tagger derives them at runtime,
// which is what we want to demonstrate.

export const demoRoster = [
  { number: 1, name: 'Amara', position: 'GK' },
  { number: 2, name: 'Priya', position: 'RB' },
  { number: 4, name: 'Sofia', position: 'RCB' },
  { number: 5, name: 'Chloe', position: 'LCB' },
  { number: 3, name: 'Isla', position: 'LB' },
  { number: 6, name: 'Nadia', position: 'DM' },
  { number: 8, name: 'Grace', position: 'CM' },
  { number: 10, name: 'Mei', position: 'AM' },
  { number: 7, name: 'Zara', position: 'RW' },
  { number: 11, name: 'Leah', position: 'LW' },
  { number: 9, name: 'Fatima', position: 'ST' },
];

export const demoMatch = {
  team: 'Riverside U-14 Girls',
  opponent: 'Oakfield',
  roster: demoRoster,
};

// ~ first half of touchline narration. Deliberately messy, natural speech —
// the kind of thing a real coach mutters, not clean prose.
export const demoNarration = [
  { tMs: 30_000, text: "Okay good start, keep it on the deck, no rush." },
  { tMs: 95_000, text: "Their number 7 is quick, Priya you have to get tighter to him, don't let him turn." },
  { tMs: 140_000, text: "Good press Fatima! That's it, force them wide." },
  { tMs: 210_000, text: "We keep losing the second ball in midfield, Nadia you're too deep, step up." },
  { tMs: 260_000, text: "Their 7 got in behind Priya again down our right, that's twice now." },
  { tMs: 330_000, text: "Mei drop into the pocket, you're too high, come get the ball off Grace." },
  { tMs: 410_000, text: "Better! Lovely play Grace, that's the pass we want." },
  { tMs: 480_000, text: "Watch the throw-in, they've got a routine, mark their big number 4 short." },
  { tMs: 500_000, text: "See, from that same throw again, we switched off, that nearly cost us." },
  { tMs: 560_000, text: "Isla push up a bit when we have it, give Leah an option outside." },
  { tMs: 640_000, text: "Second balls again! We have to win those, Nadia and Grace you're both watching it." },
  { tMs: 720_000, text: "Their 7 down our right side once more, Priya you're getting dragged inside." },
  { tMs: 800_000, text: "Great block Sofia, that's defending." },
  { tMs: 880_000, text: "Come on, we press together or not at all, Fatima you went alone there." },
  { tMs: 950_000, text: "Good, half time coming, stay compact, don't concede right before the break." },
];
