import { MyGame } from './MyGame';

// IMPORTANT: This patch must run synchronously before the engine boots.
// Using dynamic import can be "too late" (pointer events may fire first),
// so we statically import EventBoundary here.
import { EventBoundary } from 'pixi.js';
import { Container } from 'pixi.js';

// PixiJS v8 compatibility shim:
// In some Pixi builds, EventBoundary expects hit-test targets to expose
// currentTarget.isInteractive(), but many display objects only have properties.
// Patch EventBoundary to tolerate missing isInteractive() and avoid crashing.
const __shimKey = '__pixiIsInteractiveShimApplied';
if (!(globalThis as any)[__shimKey]) {
	(globalThis as any)[__shimKey] = true;

	const EB = EventBoundary as any;
	if (EB?.prototype) {

			const computeInteractive = (t: any): boolean => {
			if (!t) return false;
			// Pixi v7/v8 convention.
			if (typeof t.eventMode === 'string') return t.eventMode !== 'none';
			// Older convention.
			if (typeof t.interactive === 'boolean') return t.interactive;
			// If unknown, assume interactive so the event system doesn't crash.
			return true;
		};

			const safeIsInteractive = (t: any): boolean => {
				if (!t) return false;
				if (typeof t.isInteractive === 'function') {
					try {
						return !!t.isInteractive();
					} catch {
						return computeInteractive(t);
					}
				}
				return computeInteractive(t);
			};

			// Global fallback: some Pixi internals call `e.isInteractive()` directly.
			// In this project, most display objects inherit from Container, so patching
			// Container.prototype covers the majority of the scene graph.
			const C = Container as any;
			if (C?.prototype && typeof C.prototype.isInteractive !== 'function') {
				C.prototype.isInteractive = function isInteractivePatched() {
					return safeIsInteractive(this);
				};
			}


			// Patch BOTH methods that can hit the direct isInteractive() call.
			const harden = (methodName: 'hitTestMoveRecursive' | 'hitTestRecursive') => {
				const orig = EB.prototype[methodName];
				if (typeof orig !== 'function') return;

				EB.prototype[methodName] = function hardenedHitTest(...args: any[]) {
					const currentTarget = args?.[0];
					let restore: (() => void) | null = null;

					if (currentTarget) {
						const prev = currentTarget.isInteractive;
						currentTarget.isInteractive = function patchedIsInteractive() {
							return safeIsInteractive(this);
						};
						restore = () => {
							if (prev === undefined) delete currentTarget.isInteractive;
							else currentTarget.isInteractive = prev;
						};
					}

					try {
						return orig.apply(this, args);
					} finally {
						restore?.();
					}
				};
			};

			harden('hitTestMoveRecursive');
			harden('hitTestRecursive');
		}
}

new MyGame().run();

// --- Render pipeline hardening ---
// Some builds end up with effect objects whose `pipe` key doesn't exist in the
// renderer's `renderPipes` map, causing crashes like:
//   undefined is not an object (evaluating 'i[n.pipe].push')
// This hook aliases missing pipes to the default 'filter' pipe.
try {
	// Top-level singleton for most Pixi internals.
	const anyPIXI = globalThis as any;
	const Renderer = anyPIXI?.Renderer;
	if (Renderer?.prototype && !Renderer.prototype.__hkPatchedRenderPipes) {
		Renderer.prototype.__hkPatchedRenderPipes = true;
		const origRender = Renderer.prototype.render;
		if (typeof origRender === 'function') {
			Renderer.prototype.render = function patchedRender(...args: any[]) {
				const pipes = (this as any)?.renderPipes;
				if (pipes && typeof pipes === 'object' && pipes.filter) {
					// Ensure any missing pipe key resolves to a working pipe.
					const fallback = pipes.filter;
					return origRender.apply(
						Object.assign(this, {
							renderPipes: new Proxy(pipes, {
								get(target, prop) {
									if (typeof prop === 'string' && !(prop in target)) return fallback;
									return (target as any)[prop as any];
								}
							})
						}),
						args
					);
				}
				return origRender.apply(this, args);
			};
		}
	}
} catch {
	// Best-effort only.
}
