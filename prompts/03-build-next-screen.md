# Initiator — Build One Frontend Screen

Run the `frontend-screen-builder` skill.

If I explicitly name a screen, build that screen. Otherwise, build the next eligible frontend screen according to the persistent Figma/module documentation.

Build exactly ONE screen. Make it dynamic and production-oriented according to the Figma design, project specification, architecture, and real data contracts available in the project.

After implementation, automatically run the UI reviewer and tester. Fix in-scope findings, rerun checks, update all workflow docs, and mark the screen DONE only when the quality gates pass.

Do NOT build a second screen in this invocation.

Do NOT perform any Git/repository operations.

If I later say "continue" or "next", repeat the workflow for the next eligible screen.
