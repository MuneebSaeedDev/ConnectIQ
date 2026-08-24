# Initiator — Build One Complete Module

Run the `module-builder` skill.

If I explicitly name a module, build that module. Otherwise, build the next eligible module according to the persistent module plan.

Before implementing the module, map every required frontend screen to the frontend screen inventory. If any required frontend screen is not already DONE/VERIFIED, STOP and report the exact missing screen IDs. Do not build those screens inside the module workflow. Tell me to run the frontend-screen-builder initiator first.

If prerequisites pass, build exactly ONE complete module across frontend integration, backend, data, authorization, validation, and all required integrations.

Automatically run the UI reviewer, integration reviewer, and tester. Fix in-scope findings, rerun checks, update all workflow docs, and mark the module DONE only after all quality gates pass.

Do NOT build a second module in this invocation.

Do NOT perform any Git/repository operations.

If I later say "continue" or "next", repeat the workflow for the next eligible module.
