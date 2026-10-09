// Official Duolingo artwork, served from Duolingo's CDN through the
// same-origin rewrites in next.config.ts (`/duo-cdn`, `/duo-simg`).

const cdn = (path: string) => `/duo-cdn/${path}`;

export interface LessonCharacterAnimations {
  idle: string;
  correct: string;
  incorrect: string;
}

/** Duolingo character Lottie files live at simg-ssl.duolingo.com/lottie/<Name>[_Cropped].json */
function character(idle: string, correct: string, incorrect: string): LessonCharacterAnimations {
  const url = (name: string) => `/duo-simg/lottie/${name.includes("Cropped") ? name : name + "_Cropped"}.json`;
  return { idle: url(idle), correct: url(correct), incorrect: url(incorrect) };
}

export const DUO = {
  logo: cdn("vendor/70a4be81077a8037698067f583816ff9.svg"),
  logoCompact: cdn("vendor/0cecd302cf0bcd0f73d51768feff75fe.svg"),

  nav: {
    learn: cdn("vendor/784035717e2ff1d448c0f6cc4efc89fb.svg"),
    leaderboards: cdn("vendor/ca9178510134b4b0893dbac30b6670aa.svg"),
    quests: cdn("vendor/7ef36bae3f9d68fc763d3451b5167836.svg"),
    shop: cdn("vendor/0e58a94dda219766d98c7796b910beee.svg"),
    profile: cdn("vendor/24e0dcdc06870ead47b3600f0d41eb5b.svg"),
    more: cdn("vendor/7159c0b5d4250a5aea4f396d53f17f0c.svg"),
    sounds: cdn("vendor/3b4928101472fce4e9edac920c1b3817.svg"),
    practice: cdn("vendor/5187f6694476a769d4a4e28149867e3e.svg"),
  },
  chessPromo: cdn("images/chess/sideBarAd/3549d5abe62aa4c972c692239ee8cc9c.svg"),
  superDuo: cdn("images/super/fb7130289a205fadd2e196b9cc866555.svg"),

  flags: { es: cdn("vendor/59a90a2cedd48b751a8fd22014768fd7.svg") } as Record<string, string>,

  streakActive: cdn("images/icons/398e4298a3b39ce566050e5c041949ef.svg"),
  streakInactive: { light: cdn("images/icons/ba95e6081679d9d7e8c132da5cfce1ec.svg"), dark: cdn("images/icons/65b8a029d7a148218f1ac98a198f8b42.svg") },
  gem: cdn("images/gems/45c14e05be9c1af1d7d0b54c6eed7eee.svg"),
  heart: cdn("images/hearts/8fdba477c56a8eeb23f0f7e67fdec6d9.svg"),

  questXp: cdn("images/goals/2b5a211d830a24fab92e291d50f65d1d.svg"),
  questChest: cdn("images/goals/33af8ba58d22f3ea21279e9a84756833.svg"),
  /** Quests page banner for returning learners ("Welcome Back!"). */
  questsWelcomeBack: cdn("images/goals/32275ce0b0ad5fa857431238610833d0.svg"),
  leagueLocked: cdn("images/leagues/d4280fdf64d66de7390fe84802432a53.svg"),
  monthlyBadge: cdn("images/goals/e07e459ea20aef826b42caa71498d85f.svg"),
  questLocked: cdn("images/goals/b4d50b5a518e587420bed74bcb381ac4.svg"),
  more: {
    englishTest: cdn("vendor/e6cd0301d02b8a8fcb0b223e528b8691.svg"),
  },
  /** Sad Duo shown in the "Wait, don't go!" quit dialog. */
  quitDuo: cdn("images/ed9f592a37a6ce248be0beec9c13a0e1.svg"),
  popover: {
    gemsChest: cdn("vendor/33b35ed687f7caabe24c79829a1b98a3.svg"),
    heartEmpty: cdn("images/hearts/e38b9a1ee10d36ff6e57a66ae97e91ff.svg"),
    heartRed: cdn("images/hearts/7631e3ee734dd4fe7792626b59457fa4.svg"),
    heartUnlimited: cdn("images/hearts/4f3842c690acf9bf0d4b06e6ab2fffcf.svg"),
    heartRefill: cdn("images/hearts/547ffcf0e6256af421ad1a32c26b8f1a.svg"),
    heartRefillGray: cdn("images/hearts/e88ae1259cc55c279da4650952269a7b.svg"),
    gemGray: cdn("images/gems/76cbc4f5cb7dfe46aa85b82d788ff4d5.svg"),
    streakFlame: cdn("images/streakCalendar/a72349d80ba9da4368853a3446f93530.svg"),
    streakFlameOff: { light: cdn("images/streakCalendar/6560af174fb32067434375771bc0f648.svg"), dark: cdn("images/streakCalendar/915a7a5265c20f671cb9196bd27a8f42.svg") },
    friendStreaks: cdn("images/e5b5f8c58690d0ce39bca3c3af55530a.svg"),
    streakSocietyLock: cdn("images/streakSociety/6f7448890a01e473d141f94fea3fceb9.svg"),
  },
  shopHeart: cdn("images/hearts/547ffcf0e6256af421ad1a32c26b8f1a.svg"),
  shopFreeze: cdn("images/icons/216ddc11afcbb98f44e53d565ccf479e.svg"),

  path: {
    sectionArrow: cdn("images/path/icons/e013fd27fc6bd1d2fea85fe707b615cd.svg"),
    guidebook: cdn("images/path/5b531828e59ae83aadb3d88e6b3a98a8.svg"),
    star: cdn("images/path/icons/ef9c771afdb674f0ff82fae25c6a7b0a.svg"),
    completed: cdn("images/path/icons/bfa591f6854b4de08e1656b3e8ca084f.svg"),
    legendary: cdn("images/path/icons/53727b0c96103443bc616435bb1f2fbc.svg"),
    shine: cdn("images/path/4950512fbafc582eeebe5d171c08285b.svg"),
    starLocked: { light: cdn("images/path/icons/ddd21f172a2db0f5ef169c09b4d3badb.svg"), dark: cdn("images/path/icons/cbb0e971ac10030a120848c71c419892.svg") },
    trophyLocked: { light: cdn("images/path/icons/7d84afaa096ff1f1d3f8c86d6c2c9542.svg"), dark: cdn("images/path/icons/f4b1c683214cf55f5ddea4535b983745.svg") },
    trophyPassed: cdn("images/path/icons/44fdc5acd4cc2644f6c8329939446b42.svg"),
    trophyLegendary: cdn("images/path/icons/75b874102acc84fd5709365bd445dc3e.svg"),
    chestLocked: { light: cdn("images/path/b841637c196f5be786d8b8578a42ffbf.svg"), dark: cdn("images/path/0ae912c0b7a66354a850e6733ef653cb.svg") },
    chestOpen: cdn("images/path/8e1b4675455a4e453aac3681e0f5599e.svg"),
    /** Fast-forward icon on the first node of a locked unit ("Jump here?"). */
    jump: cdn("images/path/icons/5e4203031e39fc43d94371565fd0d369.svg"),
  },
  /** Duo on a pedestal shown before a unit test ("Pass this test to jump ahead"). */
  jumpSplash: cdn("images/sessionSplash/6e7d1756105a96276a20179ed8c15521.svg"),

  /** Animated Duo standing beside the learning path (Lottie). */
  duoPathLottie: cdn("lottie/pathCharacters/01a1427cc5613179ea3d7568a5f7445b.json"),
  /**
   * Character beside each unit on the path, in unit order, matching the greyed-out
   * `lockedCharacters` shown before the unit is reached (Duolingo's DUO_TWIRL,
   * LILY_SHIRTS and OSCAR_FLOWER).
   */
  unitCharacters: [
    cdn("lottie/pathCharacters/01a1427cc5613179ea3d7568a5f7445b.json"),
    cdn("lottie/pathCharacters/a3579eb9c6bb2fd6ee757fe0e7e415ad.json"),
    cdn("lottie/pathCharacters/843367dca1d93f9279d29b44e03d78bf.json"),
  ],
  /** Duo popping up between exercises ("Super impressive!", "Let's review…"). */
  midLessonDuo: cdn("lottie/7f1370b3f1d802951f0cab013ecb05c2.json"),
  /** Profile page artwork. */
  profile: {
    edit: cdn("images/profile/00e52dc386f5aeaef537e239c70739ab.svg"),
    xp: cdn("images/profile/01ce3a817dd01842581c3d18debcbc46.svg"),
    streak: cdn("images/profile/8a6dca76019d059a81c4c7c1145aa7a4.svg"),
    top3: cdn("images/profile/3f97ae337724f7edb6dfbef23cd3a6e7.svg"),
    top3None: cdn("images/profile/96e056d06fd492261f98901b53ccc256.svg"),
    findFriends: cdn("images/profile/48b8884ac9d7513e65f3a2b54984c5c4.svg"),
    inviteFriends: cdn("images/profile/146923c24e252de2fd1a124f57905359.svg"),
    friends: cdn("images/profile/a925a18c6be921a81bf0e13102983168.svg"),
    linkedinDuo: cdn("images/linkedin/e87fe1fe94949f0a5d80ab0fb9b7d351.svg"),
    close: cdn("images/icons/025ca503a8052143218170d06ba40104.svg"),
  },
  /** Artwork on each achievement badge, by achievement code. */
  achievements: {
    wildfire: cdn("images/goals/8787ab04a1279f1c7ca12201834e90f7.svg"),
    sage: cdn("images/goals/974e284761265b0eb6c9fd85243c5c4b.svg"),
    scholar: cdn("images/practiceHub/2c76c04c8e99125ccda0b74b11ac468e.svg"),
    sharpshooter: cdn("images/goals/39f13d2de304cad2ac2f88b31a7e2ff4.svg"),
    conqueror: cdn("images/leagues/22df4cb957e6cf2d7198b6e5449a342e.svg"),
    legendary: cdn("images/path/icons/53727b0c96103443bc616435bb1f2fbc.svg"),
  } as Record<string, string>,
  /** League badges and leaderboard medals. */
  leagues: {
    bronze: cdn("images/leagues/192181672ada150becd83a74a4266ae9.svg"),
    locked: cdn("images/leagues/0f2ec3b0ead032476829f47c4157a4fd.svg"),
    medals: [
      cdn("images/leagues/9e4f18c0bc42c7508d5fa5b18346af11.svg"),
      cdn("images/leagues/cc7b8f8582e9cfb88408ab851ec2e9bd.svg"),
      cdn("images/leagues/eef523c872b71178ef5acb2442d453a2.svg"),
    ],
  },
  /** Leaderboard status emojis ("flag" uses the course flag). */
  status: {
    sunglasses: cdn("images/leagues/2439bac00452e99ba7bf6a7ed0b04196.svg"),
    party: cdn("images/leagues/2ceb401cae52712705b66a77df83ce40.svg"),
    muscle: cdn("images/leagues/6b8a8db5ac7f847e7e87efe97c8b451a.svg"),
    eyes: cdn("images/leagues/a8e5c18e80054228b2c61168846ff643.svg"),
    popcorn: cdn("images/leagues/573de2bc90b2499eeb2b3738cff90133.svg"),
    angry: cdn("images/leagues/f12703218fc80de76a63e650726f742e.svg"),
    hundred: cdn("images/leagues/5642e1e72813a88e8973b551a2004c7f.svg"),
    poop: cdn("images/leagues/beb0df263d0f696bc7095d56b448ca78.svg"),
    trophy: cdn("images/leagues/22df4cb957e6cf2d7198b6e5449a342e.svg"),
    dumpster: cdn("images/leagues/9fadb349c2ece257386a0e576359c867.svg"),
    cat: cdn("images/leagues/535fc27de224cc7d311dbb5de4f33be6.svg"),
  },
  /** Duolingo's "SUPER" badge. */
  superBadge: cdn("images/super/2e50c3e8358914df5285dc8cf45d0b4c.svg"),
  /** Practice Hub artwork. */
  practiceHub: {
    targetPractice: cdn("images/practiceHub/6a52992125c91e4966ac4df34af93f57.svg"),
    speak: cdn("images/practiceHub/3e81c469cbffa24102aa839524868adf.svg"),
    listen: cdn("images/practiceHub/2ebe830fd55a7f2754d371bcd79faf32.svg"),
    stories: cdn("images/practiceHub/2c76c04c8e99125ccda0b74b11ac468e.svg"),
    mistakes: cdn("images/practiceHub/648b88c8b70ebaaff919e49b0aa54949.svg"),
  },
  /** Unit guidebook page. */
  guidebook: {
    back: cdn("images/a440799373d131cb4a2bbfe8add8a10f.svg"),
    /** Header character per unit, the same cast as `unitCharacters`. */
    characters: [
      cdn("images/pathCharacters/guidebook/61e3a5ac98e388bf0de9244e10da39cb.svg"),
      cdn("images/pathCharacters/guidebook/4eaafed54241c1649af93bd8c9a4d2f7.svg"),
      cdn("images/pathCharacters/guidebook/0a7807397bc9125928ba9c642aec48b3.svg"),
    ],
  },
  /** Post-lesson screens. */
  sessionEnd: {
    scoreDuo: cdn("lottie/6f4525b361ab4ef04c92af8f42cdcec6.json"),
    questBurst: cdn("lottie/2a62162ea93d55dee67189cc47bd98ab.json"),
    gemChest: cdn("lottie/de3e9a8a9576d9bb68cb519a438ed03f.json"),
    legendaryDuo: cdn("images/legendary/f0a2f6c85b97b56ec2b30d25b85a04c7.svg"),
  },
  /** Character celebration scenes for the lesson-complete screen (one is picked at random). */
  lessonEndScenes: [
    "02218ef5b515ab654caf5f800139e287",
    "29577d79499288cf3f21a9fed045d055",
    "420f91aab8058bdfa6b8e6df23cf777b",
    "4eaa0aaabd6a29a0fb66f091b7b573b0",
    "554b86a49516cd82283865cc8115331a",
    "68a30cf365cfc1525ebfa9cd6104fba9",
    "70afcd2abb7c0dbd6f51364ef3113ca3",
    "8de1591bf90781e606b64859060729e3",
    "d7a171566382b5daa0a992087a19b58d",
  ].map((h) => cdn(`lottie/sessionEnd/${h}.json`)),
  /** Whistling Duo used on the loading screen. */
  loadingDuo: cdn("lottie/pathCharacters/9eaf4990aaf1c6a96ea3960cf159c787.json"),
  /** Sparkle burst played at the end of the lesson progress bar when it grows. */
  progressSparkle: cdn("lottie/2a62162ea93d55dee67189cc47bd98ab.json"),
  /** Greyed-out characters beside locked units, in unit order from Unit 2 (light and dark artwork pair up by index). */
  lockedCharacters: {
    light: [cdn("images/pathCharacters/locked/34443969dabd59f00795cc94457c1b3b.svg"), cdn("images/pathCharacters/locked/f1a8ca7d22677f84c9781b7e9034f688.svg")],
    dark: [cdn("images/pathCharacters/dark/a3e1fd17f6d11b10ecae6bf5bc1ca701.svg"), cdn("images/pathCharacters/dark/350eb5e80d4ddc292088d0acc5ef3e2d.svg")],
  },

  /** Lesson characters: idle loop plus the reactions played after an answer. */
  characters: [
    character("Falstaff_IDLE", "Falstaff_CORRECT_Cropped_Tango", "Bear_INCORRECT"),
    character("Zari_IDLE", "Zari_CORRECT_Cropped_HappyDance", "Pink_INCORRECT"),
    character("Lin_IDLE", "Lin_CORRECT_Cropped_Wink", "Kai_INCORRECT"),
    character("Oscar_IDLE", "Oscar_CORRECT_Cropped_Coffee", "Mo_INCORRECT"),
    character("Junior_IDLE", "Junior_CORRECT", "Junior_INCORRECT"),
    character("Bea_IDLE", "B_CORRECT", "B_INCORRECT"),
  ],

  font: {
    regular: cdn("vendor/f2331bbfd902cdf8971c4d3184a44283.woff2"),
    italic: cdn("vendor/3bbe299f41d8289a47d91773fee0cb6a.woff2"),
  },
};
