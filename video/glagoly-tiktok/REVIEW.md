# REVIEW — glagoly-tiktok

## Creative calls
- The story is the person's own: her two clips (intro «…или как выучить таблицу неправильных глаголов без напряга. Погнали, покажу!»
  and outro «Ну что, теперь легче учить неправильные глаголы… Всем пока!») bracket a phone screen recording, so no alternative
  storylines were built. Not built: a kinetic-type opener («118 глаголов → 4 группы») and a pure speed-challenge film.
- The screen recording is the real trainer rebuilt from its own CSS and copy (irregular-verbs.html) at true iPhone scale, so every
  label, colour and option on screen is the product's; the session (goed → went, take/draw, break, a 60-second round) is staged.
- Example numbers on screen (record 17, 24 of 118 learned, 5-day streak, 19/22 today) are illustrative demo progress, not real stats.
- Clips were iPhone HLG HDR: tone-mapped to SDR BT.709 (zscale + mobius) and loudness-normalised to about −15 LUFS.
- No music: none available offline; on TikTok a track is added in-app under the voice.
- Captions burned in for her two clips (from whisper small, checked against the clips' pauses). The voiceover part carries short
  labels instead; captions for it can be added once the recorded voice exists.

## Measured vs looked at
- `check`: 0 errors. Kept warnings: `dead_stretch` 11.5–16.25 s is a false positive (the screen is `data-layout-ignore`, and the
  tab tap, scroll, typing and check all happen there — confirmed on snapshots); `nested_media_start_basis_ambiguous` (SFX times
  are scene-local on purpose); `font_face_local_only` (flag emoji uses the installed Noto Color Emoji); demo.html length.
- The screen is excluded from layout audits on purpose: it is product UI (white on #E27396 buttons, 11–13 px labels at 30–36 px
  on screen), the site's own design.
- Snapshots checked at every tap, both transitions and the payoff; every tap dot lands on its target after fixing the h1 wrap.
- Sound was measured, not heard (see the render's `audio` report in the reply).

## Weakest shot / next
- B1 (7.3–11.5 s) holds ~2 s after the ABC highlight with only the voice moving; with more time, a second beat there
  (tapping the ABC row) or a shorter hold.
- When the voiceover arrives: place it at 0:07, duck the clicks under it, add voice captions in the 1180 px band.
