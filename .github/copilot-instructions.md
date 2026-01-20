# Copilot / AI Agent Instructions — Obby3DPlayableAd

Short, actionable guidance for making safe, correct changes in this Cocos Creator project.

## Project overview
- Engine: Cocos Creator 3.8 (TypeScript). Project files live under `assets/`, scenes under `assets/Scenes/`, and runtime scripts under `assets/Scripts/`.
- Physics: Bullet physics is chosen (see README.md) — code relies on `CharacterController` and `PhysicsSystem` from the `cc` runtime.
- Large binary/asset store: `library/` contains engine-generated hashed assets — do NOT edit files there manually.

## Key files to inspect (examples)
- Main example controller: `assets/Scripts/ObbyCharacterController.ts` — consult this for input handling, gravity/jump logic, and CharacterController event hooks (e.g. `onControllerColliderHit`).
- Project metadata: `tsconfig.cocos.json` for TypeScript configuration used by the engine/editor, and `package.json` contains only project metadata.
- Scene root and nodes: scenes are under `assets/Scenes/` and the code expects a child node named `HitPoint` (lookups use `this.node.scene.getChildByName('HitPoint')`).

## Architecture & patterns (what to know)
- Runtime API: code imports from `cc` (engine namespace). Prefer using engine APIs rather than reimplementing physics or transforms.
- CharacterController-centric flow: movement and collisions are driven by `CharacterController.move()`, velocity tracked in `_playerVelocity`, and `PhysicsSystem.instance.fixedTimeStep` is used for deterministic updates in `update()`.
- Input: uses the global `input` object and `Input.EventType` for keyboard/touch. Keyboard handling is in `keyProcess()` and touch handlers are present but commented/placeholder.
- Event listeners: components register engine events in `onEnable()` and must unregister in `onDisable()`; follow this pattern when adding listeners.
- Editor-visible state: many fields use `@property({readonly: true, visible: true, serializable: false})` for runtime-only inspector display — changing those annotations affects editor presentation.

## Project-specific conventions
- Keep runtime code in `assets/Scripts/`. Avoid moving scripts out of `assets/` because the engine depends on the asset layout and .meta files.
- Do not edit `.meta` files or files under `library/` — these are engine-managed and will be regenerated.
- Node naming: some logic relies on scene node names (example: parent name `'台阶测试'` is used by `isStair()`); prefer adjusting logic to be more robust before renaming nodes in scenes.
- Material properties: code modifies a material property `mainColor` via `ModelComponent.material.setProperty('mainColor', ...)` — follow this established pattern for simple visual feedback.

## Safe change checklist for agents
- Prefer minimal, localized edits: change `assets/Scripts/ObbyCharacterController.ts` only if the behavior you need is centered there.
- Avoid changing project settings via editing generated JSON files; use the Cocos Creator editor for configuration where possible.
- Preserve `@property` decorators and event listener registration patterns to keep editor integration and lifecycle behavior intact.
- When touching physics logic, respect `PhysicsSystem.instance.fixedTimeStep` usage and test in the Cocos Creator editor or target runtime.

## Build / test / run notes
- This repository is an engine project — there are no npm build scripts to compile runtime code outside the editor. Use Cocos Creator (Editor) to open the project and run the scene in the preview or target platform.
- TypeScript compilation is controlled by the engine using `tsconfig.cocos.json`. Do not replace or assume an external webpack/ts-node build unless you add explicit tooling and update the repo.

## Examples for quick reference
- Movement loop: `update()` in `assets/Scripts/ObbyCharacterController.ts` uses `PhysicsSystem.instance.fixedTimeStep` and `this._cct!.move(this._movement)`.
- Collision hook: `this._cct.on('onControllerColliderHit', this.onControllerColliderHit, this)` and push logic uses `body.setLinearVelocity(pushDir)`.

## What agents should not do
- Do not modify files under `library/`, generated `.meta` files, or bulk-reformat files that will be tracked by the engine.
- Do not remove or rename scene nodes relied upon by scripts without updating corresponding code references (e.g. `HitPoint`, `'台阶测试'`).
- Do not add property with name 'node' to components, this.node in components is internally managed by the engine

If anything here is unclear or you want more granularity (e.g. recommended test steps to run in the Editor, or a checklist for staging and packaging), tell me which area to expand.
