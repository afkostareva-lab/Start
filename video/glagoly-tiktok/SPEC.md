# SPEC — «Неправильные глаголы без напряга» (TikTok)

GOAL:    a schoolkid watching on mute understands in one pass that the trainer turns the irregular-verbs table into a game, and opens the link.
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps.
TIME:    45 s x 30 = 1350 frames. No music bed (added in the TikTok app); voiceover recorded by the person over 7–39 s.
STORY:   the person's own footage sets it: her intro (problem, «погнали, покажу») → a phone screen recording of the trainer → her outro.
         One learner, one session: groups → write (goed ✗ → went) → choose → cards (break–broke–broken) → 60-second round, new record 17 → progress.
LOOK:    the trainer's own UI rebuilt from its CSS (irregular-verbs.html): ground #ECF2D8, card #fffdf8, ink #4a2a38, accent #E27396,
         ok #2f8f99 / #B3DEE2, bad #c94f77 / #EFCFE3. Page at 390 CSS px, zoom 2.769 to 1080 wide (real iPhone scale).
         Display: Playfair Display 900 (Cyrillic didone, nearest to the site's Abril Fatface which has no Cyrillic).
         Body: Inter (InterUI @font-face). Site h1/q-ru: Abril Fatface + PT Serif for Cyrillic, as Georgia on the phone.
         Labels: ink box #4a2a38, radius 26, cream text 92 px, accent words #EB9AB2. Captions: Inter 800 58 px on ink box 92%.
OBJECTS: the phone screen (status bar 9:41, Safari URL bar «afkostareva-lab.github.io»), a grey touch dot for each tap.
MOTION:  page scroll power2.inOut 0.5–0.9 s; punch-ins power2.inOut 0.7 s; payoff push-in power3.out 0.6 s;
         labels: blur-in 0.18 s / per word 0.13 s, 0.09 s apart / clip wipe 0.32 s expo.out; exits blur-out 0.18 s.
         App open: card from y+520, scale 0.8 → full in 0.5 s power3.out. App close: scale 0.74, y+1500 in 0.55 s power3.in.
SHOTS:   0–7 intro clip, hook title on the wall above her head (frame 0 = thumbnail), captions of her words.
         6.7–7.2 screen opens · 7.3 scroll to the 4 groups, ABC lights · 12.2 «Напиши», goed/gone typed, 15.55 check → went
         · 19.85 «Выбери», taken ✓, drew ✓ · 24.9 «Карточки», 26.1 flip break–broke–broken · 29.45 «На время», 30.55 start,
         time-lapse run to 34.3, 34.35 trophy + push-in · 35.4 scroll to stats · 39.3 screen closes onto the outro.
         39.3–45 outro clip, captions, 42.0 end card «Ссылка на тренажёр — под видео».
SAFE:    words between y 168 and 1330; captions and end card x 60–920 (clear of the right action rail).
INTRO:   restyled to the daughter's CapCut look: Montserrat Bold («Study» face) + Lora SemiBold Italic («English makes me
         nervous» face), red #C52E2A on a pink sticker outline #F7CBE2 (text-shadow ring 0.24em), tilted −4…−9°.
BANNED:  dark void, glow, gradients as decoration, everything fading up, three cards in a row, docked logo, click rings,
         bouncing UI, captions under the right rail.
