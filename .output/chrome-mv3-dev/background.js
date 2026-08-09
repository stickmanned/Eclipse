var background = (function() {
	//#region node_modules/wxt/dist/utils/define-background.mjs
	function defineBackground(arg) {
		if (arg == null || typeof arg === "function") return { main: arg };
		return arg;
	}
	//#endregion
	//#region node_modules/wxt/dist/browser.mjs
	/**
	* Contains the `browser` export which you should use to access the extension
	* APIs in your project:
	*
	* ```ts
	* import { browser } from 'wxt/browser';
	*
	* browser.runtime.onInstalled.addListener(() => {
	*   // ...
	* });
	* ```
	*
	* @module wxt/browser
	*/
	var browser = globalThis.browser?.runtime?.id ? globalThis.browser : globalThis.chrome;
	//#endregion
	//#region src/domain/ids.ts
	/**
	* Identifier generation.
	*
	* `sessionId` is minted per activation; `interactionId` per answer. Both are
	* random and local — they are never sent anywhere and are not stable across
	* installs, so they cannot identify a user.
	*/
	var ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
	function randomToken(length) {
		const bytes = new Uint8Array(length);
		globalThis.crypto.getRandomValues(bytes);
		let out = "";
		for (const byte of bytes) out += ID_ALPHABET[byte % 36];
		return out;
	}
	function createSessionId() {
		return `ses_${randomToken(16)}`;
	}
	//#endregion
	//#region src/domain/errors.ts
	/**
	* Typed failure vocabulary shared by the popup, background worker, content
	* runtime and the loopback generation API.
	*
	* Every boundary in Eclipse returns a `Result`, never a thrown value. Callers
	* branch on `ok` and, when it is `false`, on `error.code`.
	*/
	var ERROR_CODES = [
		"UNSUPPORTED_URL",
		"NO_ARTICLE",
		"NO_ELIGIBLE_TRAPS",
		"CONTENT_SCRIPT_UNAVAILABLE",
		"SESSION_REPLACED",
		"DOM_INVALIDATED",
		"STORAGE_ERROR",
		"PROFILE_INCOMPATIBLE",
		"PROVIDER_DISABLED",
		"PROVIDER_PERMISSION_DENIED",
		"PROVIDER_UNAVAILABLE",
		"PROVIDER_TIMEOUT",
		"PROVIDER_INVALID_RESPONSE",
		"MESSAGE_UNSUPPORTED",
		"UNKNOWN_ERROR"
	];
	/**
	* The one thing a learner can actually do about a message the extension does
	* not understand. Chrome keeps a previously registered service worker alive
	* across a rebuild, so a freshly built popup can end up talking to a worker
	* compiled from older source; reloading the extension re-registers both halves
	* from the same build.
	*/
	/**
	* Eclipse's AI generation runs on a server the learner starts themselves, so
	* "unreachable" has exactly one common cause and exactly one fix. Saying only
	* that the API could not be reached leaves someone guessing between a stopped
	* process, a missing key and a broken network; naming the command does not.
	*/
	var LOCAL_API_MESSAGE = "Eclipse could not reach its local AI service on http://localhost:8787. Start it with \"npm run api\" in the Eclipse project, then press Start Eclipse again.";
	var STALE_WORKER_MESSAGE = "Eclipse is still finishing an update, so its background worker did not understand that request. Reload Eclipse to finish updating.";
	/**
	* Whether a code describes a condition the user can act on without reloading
	* the extension. Recoverable failures are surfaced as inline popup status;
	* unrecoverable ones end the session.
	*/
	var RECOVERABLE_BY_DEFAULT = {
		UNSUPPORTED_URL: true,
		NO_ARTICLE: true,
		NO_ELIGIBLE_TRAPS: true,
		CONTENT_SCRIPT_UNAVAILABLE: true,
		SESSION_REPLACED: true,
		DOM_INVALIDATED: false,
		STORAGE_ERROR: true,
		PROFILE_INCOMPATIBLE: false,
		PROVIDER_DISABLED: true,
		PROVIDER_PERMISSION_DENIED: true,
		PROVIDER_UNAVAILABLE: true,
		PROVIDER_TIMEOUT: true,
		PROVIDER_INVALID_RESPONSE: true,
		MESSAGE_UNSUPPORTED: true,
		UNKNOWN_ERROR: false
	};
	/** Human-readable default copy. Callers may override with something specific. */
	var DEFAULT_MESSAGE = {
		UNSUPPORTED_URL: "Eclipse only runs on regular http(s) web pages.",
		NO_ARTICLE: "No readable article was found on this page.",
		NO_ELIGIBLE_TRAPS: "Eclipse could not prepare level-matched French vocabulary for this article. Check that the AI service is running, then retry.",
		CONTENT_SCRIPT_UNAVAILABLE: "Eclipse could not attach to this tab. Reload the page and retry.",
		SESSION_REPLACED: "Eclipse moved to another tab.",
		DOM_INVALIDATED: "The page changed underneath Eclipse, so the session was ended safely.",
		STORAGE_ERROR: "Your progress could not be saved.",
		PROFILE_INCOMPATIBLE: "Saved learning data was written by a newer version of Eclipse.",
		PROVIDER_DISABLED: "The AI vocabulary service is not configured.",
		PROVIDER_PERMISSION_DENIED: "Permission for the local generation API was not granted.",
		PROVIDER_UNAVAILABLE: LOCAL_API_MESSAGE,
		PROVIDER_TIMEOUT: "The local generation API took too long.",
		PROVIDER_INVALID_RESPONSE: "The local generation API returned something Eclipse cannot trust.",
		MESSAGE_UNSUPPORTED: STALE_WORKER_MESSAGE,
		UNKNOWN_ERROR: "Something unexpected happened."
	};
	function success(data) {
		return {
			ok: true,
			data
		};
	}
	function failure(code, message, recoverable) {
		return {
			ok: false,
			error: {
				code,
				message: message ?? DEFAULT_MESSAGE[code],
				recoverable: recoverable ?? RECOVERABLE_BY_DEFAULT[code]
			}
		};
	}
	//#endregion
	//#region node_modules/zod/v4/core/core.js
	var _a$1;
	function $constructor(name, initializer, params) {
		function init(inst, def) {
			if (!inst._zod) Object.defineProperty(inst, "_zod", {
				value: {
					def,
					constr: _,
					traits: /* @__PURE__ */ new Set()
				},
				enumerable: false
			});
			if (inst._zod.traits.has(name)) return;
			inst._zod.traits.add(name);
			initializer(inst, def);
			const proto = _.prototype;
			const keys = Object.keys(proto);
			for (let i = 0; i < keys.length; i++) {
				const k = keys[i];
				if (!(k in inst)) inst[k] = proto[k].bind(inst);
			}
		}
		const Parent = params?.Parent ?? Object;
		class Definition extends Parent {}
		Object.defineProperty(Definition, "name", { value: name });
		function _(def) {
			var _a;
			const inst = params?.Parent ? new Definition() : this;
			init(inst, def);
			(_a = inst._zod).deferred ?? (_a.deferred = []);
			for (const fn of inst._zod.deferred) fn();
			return inst;
		}
		Object.defineProperty(_, "init", { value: init });
		Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
			if (params?.Parent && inst instanceof params.Parent) return true;
			return inst?._zod?.traits?.has(name);
		} });
		Object.defineProperty(_, "name", { value: name });
		return _;
	}
	var $ZodAsyncError = class extends Error {
		constructor() {
			super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
		}
	};
	var $ZodEncodeError = class extends Error {
		constructor(name) {
			super(`Encountered unidirectional transform during encode: ${name}`);
			this.name = "ZodEncodeError";
		}
	};
	(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
	var globalConfig = globalThis.__zod_globalConfig;
	function config(newConfig) {
		if (newConfig) Object.assign(globalConfig, newConfig);
		return globalConfig;
	}
	//#endregion
	//#region node_modules/zod/v4/core/util.js
	function getEnumValues(entries) {
		const numericValues = Object.values(entries).filter((v) => typeof v === "number");
		return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
	}
	function jsonStringifyReplacer(_, value) {
		if (typeof value === "bigint") return value.toString();
		return value;
	}
	function cached(getter) {
		return { get value() {
			{
				const value = getter();
				Object.defineProperty(this, "value", { value });
				return value;
			}
		} };
	}
	function nullish(input) {
		return input === null || input === void 0;
	}
	function cleanRegex(source) {
		const start = source.startsWith("^") ? 1 : 0;
		const end = source.endsWith("$") ? source.length - 1 : source.length;
		return source.slice(start, end);
	}
	function floatSafeRemainder(val, step) {
		const ratio = val / step;
		const roundedRatio = Math.round(ratio);
		const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
		if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
		return ratio - roundedRatio;
	}
	var EVALUATING = /* @__PURE__*/ Symbol("evaluating");
	function defineLazy(object, key, getter) {
		let value = void 0;
		Object.defineProperty(object, key, {
			get() {
				if (value === EVALUATING) return;
				if (value === void 0) {
					value = EVALUATING;
					value = getter();
				}
				return value;
			},
			set(v) {
				Object.defineProperty(object, key, { value: v });
			},
			configurable: true
		});
	}
	function assignProp(target, prop, value) {
		Object.defineProperty(target, prop, {
			value,
			writable: true,
			enumerable: true,
			configurable: true
		});
	}
	function mergeDefs(...defs) {
		const mergedDescriptors = {};
		for (const def of defs) {
			const descriptors = Object.getOwnPropertyDescriptors(def);
			Object.assign(mergedDescriptors, descriptors);
		}
		return Object.defineProperties({}, mergedDescriptors);
	}
	function esc(str) {
		return JSON.stringify(str);
	}
	function slugify(input) {
		return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
	}
	var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
	function isObject(data) {
		return typeof data === "object" && data !== null && !Array.isArray(data);
	}
	var allowsEval = /* @__PURE__*/ cached(() => {
		if (globalConfig.jitless) return false;
		if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
		try {
			new Function("");
			return true;
		} catch (_) {
			return false;
		}
	});
	function isPlainObject(o) {
		if (isObject(o) === false) return false;
		const ctor = o.constructor;
		if (ctor === void 0) return true;
		if (typeof ctor !== "function") return true;
		const prot = ctor.prototype;
		if (isObject(prot) === false) return false;
		if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
		return true;
	}
	function shallowClone(o) {
		if (isPlainObject(o)) return { ...o };
		if (Array.isArray(o)) return [...o];
		if (o instanceof Map) return new Map(o);
		if (o instanceof Set) return new Set(o);
		return o;
	}
	var propertyKeyTypes = /* @__PURE__*/ new Set([
		"string",
		"number",
		"symbol"
	]);
	function escapeRegex(str) {
		return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
	function clone(inst, def, params) {
		const cl = new inst._zod.constr(def ?? inst._zod.def);
		if (!def || params?.parent) cl._zod.parent = inst;
		return cl;
	}
	function normalizeParams(_params) {
		const params = _params;
		if (!params) return {};
		if (typeof params === "string") return { error: () => params };
		if (params?.message !== void 0) {
			if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
			params.error = params.message;
		}
		delete params.message;
		if (typeof params.error === "string") return {
			...params,
			error: () => params.error
		};
		return params;
	}
	function optionalKeys(shape) {
		return Object.keys(shape).filter((k) => {
			return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
		});
	}
	var NUMBER_FORMAT_RANGES = {
		safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
		int32: [-2147483648, 2147483647],
		uint32: [0, 4294967295],
		float32: [-34028234663852886e22, 34028234663852886e22],
		float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
	};
	function pick(schema, mask) {
		const currDef = schema._zod.def;
		const checks = currDef.checks;
		if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
		return clone(schema, mergeDefs(schema._zod.def, {
			get shape() {
				const newShape = {};
				for (const key in mask) {
					if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
					if (!mask[key]) continue;
					newShape[key] = currDef.shape[key];
				}
				assignProp(this, "shape", newShape);
				return newShape;
			},
			checks: []
		}));
	}
	function omit(schema, mask) {
		const currDef = schema._zod.def;
		const checks = currDef.checks;
		if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
		return clone(schema, mergeDefs(schema._zod.def, {
			get shape() {
				const newShape = { ...schema._zod.def.shape };
				for (const key in mask) {
					if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
					if (!mask[key]) continue;
					delete newShape[key];
				}
				assignProp(this, "shape", newShape);
				return newShape;
			},
			checks: []
		}));
	}
	function extend(schema, shape) {
		if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
		const checks = schema._zod.def.checks;
		if (checks && checks.length > 0) {
			const existingShape = schema._zod.def.shape;
			for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
		}
		return clone(schema, mergeDefs(schema._zod.def, { get shape() {
			const _shape = {
				...schema._zod.def.shape,
				...shape
			};
			assignProp(this, "shape", _shape);
			return _shape;
		} }));
	}
	function safeExtend(schema, shape) {
		if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
		return clone(schema, mergeDefs(schema._zod.def, { get shape() {
			const _shape = {
				...schema._zod.def.shape,
				...shape
			};
			assignProp(this, "shape", _shape);
			return _shape;
		} }));
	}
	function merge(a, b) {
		if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
		return clone(a, mergeDefs(a._zod.def, {
			get shape() {
				const _shape = {
					...a._zod.def.shape,
					...b._zod.def.shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			},
			get catchall() {
				return b._zod.def.catchall;
			},
			checks: b._zod.def.checks ?? []
		}));
	}
	function partial(Class, schema, mask) {
		const checks = schema._zod.def.checks;
		if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
		return clone(schema, mergeDefs(schema._zod.def, {
			get shape() {
				const oldShape = schema._zod.def.shape;
				const shape = { ...oldShape };
				if (mask) for (const key in mask) {
					if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
					if (!mask[key]) continue;
					shape[key] = Class ? new Class({
						type: "optional",
						innerType: oldShape[key]
					}) : oldShape[key];
				}
				else for (const key in oldShape) shape[key] = Class ? new Class({
					type: "optional",
					innerType: oldShape[key]
				}) : oldShape[key];
				assignProp(this, "shape", shape);
				return shape;
			},
			checks: []
		}));
	}
	function required(Class, schema, mask) {
		return clone(schema, mergeDefs(schema._zod.def, { get shape() {
			const oldShape = schema._zod.def.shape;
			const shape = { ...oldShape };
			if (mask) for (const key in mask) {
				if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
				if (!mask[key]) continue;
				shape[key] = new Class({
					type: "nonoptional",
					innerType: oldShape[key]
				});
			}
			else for (const key in oldShape) shape[key] = new Class({
				type: "nonoptional",
				innerType: oldShape[key]
			});
			assignProp(this, "shape", shape);
			return shape;
		} }));
	}
	function aborted(x, startIndex = 0) {
		if (x.aborted === true) return true;
		for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
		return false;
	}
	function explicitlyAborted(x, startIndex = 0) {
		if (x.aborted === true) return true;
		for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
		return false;
	}
	function prefixIssues(path, issues) {
		return issues.map((iss) => {
			var _a;
			(_a = iss).path ?? (_a.path = []);
			iss.path.unshift(path);
			return iss;
		});
	}
	function unwrapMessage(message) {
		return typeof message === "string" ? message : message?.message;
	}
	function finalizeIssue(iss, ctx, config) {
		const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
		const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
		rest.path ?? (rest.path = []);
		rest.message = message;
		if (ctx?.reportInput) rest.input = _input;
		return rest;
	}
	function getLengthableOrigin(input) {
		if (Array.isArray(input)) return "array";
		if (typeof input === "string") return "string";
		return "unknown";
	}
	function issue(...args) {
		const [iss, input, inst] = args;
		if (typeof iss === "string") return {
			message: iss,
			code: "custom",
			input,
			inst
		};
		return { ...iss };
	}
	//#endregion
	//#region node_modules/zod/v4/core/errors.js
	var initializer$1 = (inst, def) => {
		inst.name = "$ZodError";
		Object.defineProperty(inst, "_zod", {
			value: inst._zod,
			enumerable: false
		});
		Object.defineProperty(inst, "issues", {
			value: def,
			enumerable: false
		});
		inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
		Object.defineProperty(inst, "toString", {
			value: () => inst.message,
			enumerable: false
		});
	};
	var $ZodError = $constructor("$ZodError", initializer$1);
	var $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
	function flattenError(error, mapper = (issue) => issue.message) {
		const fieldErrors = {};
		const formErrors = [];
		for (const sub of error.issues) if (sub.path.length > 0) {
			fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
			fieldErrors[sub.path[0]].push(mapper(sub));
		} else formErrors.push(mapper(sub));
		return {
			formErrors,
			fieldErrors
		};
	}
	function formatError(error, mapper = (issue) => issue.message) {
		const fieldErrors = { _errors: [] };
		const processError = (error, path = []) => {
			for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
			else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
			else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
			else {
				const fullpath = [...path, ...issue.path];
				if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
				else {
					let curr = fieldErrors;
					let i = 0;
					while (i < fullpath.length) {
						const el = fullpath[i];
						if (!(i === fullpath.length - 1)) curr[el] = curr[el] || { _errors: [] };
						else {
							curr[el] = curr[el] || { _errors: [] };
							curr[el]._errors.push(mapper(issue));
						}
						curr = curr[el];
						i++;
					}
				}
			}
		};
		processError(error);
		return fieldErrors;
	}
	//#endregion
	//#region node_modules/zod/v4/core/parse.js
	var _parse = (_Err) => (schema, value, _ctx, _params) => {
		const ctx = _ctx ? {
			..._ctx,
			async: false
		} : { async: false };
		const result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) throw new $ZodAsyncError();
		if (result.issues.length) {
			const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
			captureStackTrace(e, _params?.callee);
			throw e;
		}
		return result.value;
	};
	var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
		const ctx = _ctx ? {
			..._ctx,
			async: true
		} : { async: true };
		let result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) result = await result;
		if (result.issues.length) {
			const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
			captureStackTrace(e, params?.callee);
			throw e;
		}
		return result.value;
	};
	var _safeParse = (_Err) => (schema, value, _ctx) => {
		const ctx = _ctx ? {
			..._ctx,
			async: false
		} : { async: false };
		const result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) throw new $ZodAsyncError();
		return result.issues.length ? {
			success: false,
			error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
		} : {
			success: true,
			data: result.value
		};
	};
	var safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
	var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
		const ctx = _ctx ? {
			..._ctx,
			async: true
		} : { async: true };
		let result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) result = await result;
		return result.issues.length ? {
			success: false,
			error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
		} : {
			success: true,
			data: result.value
		};
	};
	var safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);
	var _encode = (_Err) => (schema, value, _ctx) => {
		const ctx = _ctx ? {
			..._ctx,
			direction: "backward"
		} : { direction: "backward" };
		return _parse(_Err)(schema, value, ctx);
	};
	var _decode = (_Err) => (schema, value, _ctx) => {
		return _parse(_Err)(schema, value, _ctx);
	};
	var _encodeAsync = (_Err) => async (schema, value, _ctx) => {
		const ctx = _ctx ? {
			..._ctx,
			direction: "backward"
		} : { direction: "backward" };
		return _parseAsync(_Err)(schema, value, ctx);
	};
	var _decodeAsync = (_Err) => async (schema, value, _ctx) => {
		return _parseAsync(_Err)(schema, value, _ctx);
	};
	var _safeEncode = (_Err) => (schema, value, _ctx) => {
		const ctx = _ctx ? {
			..._ctx,
			direction: "backward"
		} : { direction: "backward" };
		return _safeParse(_Err)(schema, value, ctx);
	};
	var _safeDecode = (_Err) => (schema, value, _ctx) => {
		return _safeParse(_Err)(schema, value, _ctx);
	};
	var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
		const ctx = _ctx ? {
			..._ctx,
			direction: "backward"
		} : { direction: "backward" };
		return _safeParseAsync(_Err)(schema, value, ctx);
	};
	var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
		return _safeParseAsync(_Err)(schema, value, _ctx);
	};
	//#endregion
	//#region node_modules/zod/v4/core/regexes.js
	/**
	* @deprecated CUID v1 is deprecated by its authors due to information leakage
	* (timestamps embedded in the id). Use {@link cuid2} instead.
	* See https://github.com/paralleldrive/cuid.
	*/
	var cuid = /^[cC][0-9a-z]{6,}$/;
	var cuid2 = /^[0-9a-z]+$/;
	var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
	var xid = /^[0-9a-vA-V]{20}$/;
	var ksuid = /^[A-Za-z0-9]{27}$/;
	var nanoid = /^[a-zA-Z0-9_-]{21}$/;
	/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
	var duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
	/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
	var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
	/** Returns a regex for validating an RFC 9562/4122 UUID.
	*
	* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
	var uuid = (version) => {
		if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
		return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
	};
	/** Practical email validation */
	var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
	var _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
	function emoji() {
		return new RegExp(_emoji$1, "u");
	}
	var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
	var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
	var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
	var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
	var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
	var base64url = /^[A-Za-z0-9_-]*$/;
	var httpProtocol = /^https?$/;
	var e164 = /^\+[1-9]\d{6,14}$/;
	var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
	var date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
	function timeSource(args) {
		const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
		return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
	}
	function time$1(args) {
		return new RegExp(`^${timeSource(args)}$`);
	}
	function datetime$1(args) {
		const time = timeSource({ precision: args.precision });
		const opts = ["Z"];
		if (args.local) opts.push("");
		if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
		const timeRegex = `${time}(?:${opts.join("|")})`;
		return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
	}
	var string$1 = (params) => {
		const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
		return new RegExp(`^${regex}$`);
	};
	var integer = /^-?\d+$/;
	var number$1 = /^-?\d+(?:\.\d+)?$/;
	var boolean$1 = /^(?:true|false)$/i;
	var lowercase = /^[^A-Z]*$/;
	var uppercase = /^[^a-z]*$/;
	//#endregion
	//#region node_modules/zod/v4/core/checks.js
	var $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
		var _a;
		inst._zod ?? (inst._zod = {});
		inst._zod.def = def;
		(_a = inst._zod).onattach ?? (_a.onattach = []);
	});
	var numericOriginMap = {
		number: "number",
		bigint: "bigint",
		object: "date"
	};
	var $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
		$ZodCheck.init(inst, def);
		const origin = numericOriginMap[typeof def.value];
		inst._zod.onattach.push((inst) => {
			const bag = inst._zod.bag;
			const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
			if (def.value < curr) {
				if (def.inclusive) bag.maximum = def.value;
				else bag.exclusiveMaximum = def.value;
			}
		});
		inst._zod.check = (payload) => {
			if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
			payload.issues.push({
				origin,
				code: "too_big",
				maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
				input: payload.value,
				inclusive: def.inclusive,
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
		$ZodCheck.init(inst, def);
		const origin = numericOriginMap[typeof def.value];
		inst._zod.onattach.push((inst) => {
			const bag = inst._zod.bag;
			const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
			if (def.value > curr) {
				if (def.inclusive) bag.minimum = def.value;
				else bag.exclusiveMinimum = def.value;
			}
		});
		inst._zod.check = (payload) => {
			if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
			payload.issues.push({
				origin,
				code: "too_small",
				minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
				input: payload.value,
				inclusive: def.inclusive,
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
		$ZodCheck.init(inst, def);
		inst._zod.onattach.push((inst) => {
			var _a;
			(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
		});
		inst._zod.check = (payload) => {
			if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
			if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
			payload.issues.push({
				origin: typeof payload.value,
				code: "not_multiple_of",
				divisor: def.value,
				input: payload.value,
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
		$ZodCheck.init(inst, def);
		def.format = def.format || "float64";
		const isInt = def.format?.includes("int");
		const origin = isInt ? "int" : "number";
		const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
		inst._zod.onattach.push((inst) => {
			const bag = inst._zod.bag;
			bag.format = def.format;
			bag.minimum = minimum;
			bag.maximum = maximum;
			if (isInt) bag.pattern = integer;
		});
		inst._zod.check = (payload) => {
			const input = payload.value;
			if (isInt) {
				if (!Number.isInteger(input)) {
					payload.issues.push({
						expected: origin,
						format: def.format,
						code: "invalid_type",
						continue: false,
						input,
						inst
					});
					return;
				}
				if (!Number.isSafeInteger(input)) {
					if (input > 0) payload.issues.push({
						input,
						code: "too_big",
						maximum: Number.MAX_SAFE_INTEGER,
						note: "Integers must be within the safe integer range.",
						inst,
						origin,
						inclusive: true,
						continue: !def.abort
					});
					else payload.issues.push({
						input,
						code: "too_small",
						minimum: Number.MIN_SAFE_INTEGER,
						note: "Integers must be within the safe integer range.",
						inst,
						origin,
						inclusive: true,
						continue: !def.abort
					});
					return;
				}
			}
			if (input < minimum) payload.issues.push({
				origin: "number",
				input,
				code: "too_small",
				minimum,
				inclusive: true,
				inst,
				continue: !def.abort
			});
			if (input > maximum) payload.issues.push({
				origin: "number",
				input,
				code: "too_big",
				maximum,
				inclusive: true,
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
		var _a;
		$ZodCheck.init(inst, def);
		(_a = inst._zod.def).when ?? (_a.when = (payload) => {
			const val = payload.value;
			return !nullish(val) && val.length !== void 0;
		});
		inst._zod.onattach.push((inst) => {
			const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
			if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
		});
		inst._zod.check = (payload) => {
			const input = payload.value;
			if (input.length <= def.maximum) return;
			const origin = getLengthableOrigin(input);
			payload.issues.push({
				origin,
				code: "too_big",
				maximum: def.maximum,
				inclusive: true,
				input,
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
		var _a;
		$ZodCheck.init(inst, def);
		(_a = inst._zod.def).when ?? (_a.when = (payload) => {
			const val = payload.value;
			return !nullish(val) && val.length !== void 0;
		});
		inst._zod.onattach.push((inst) => {
			const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
			if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
		});
		inst._zod.check = (payload) => {
			const input = payload.value;
			if (input.length >= def.minimum) return;
			const origin = getLengthableOrigin(input);
			payload.issues.push({
				origin,
				code: "too_small",
				minimum: def.minimum,
				inclusive: true,
				input,
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
		var _a;
		$ZodCheck.init(inst, def);
		(_a = inst._zod.def).when ?? (_a.when = (payload) => {
			const val = payload.value;
			return !nullish(val) && val.length !== void 0;
		});
		inst._zod.onattach.push((inst) => {
			const bag = inst._zod.bag;
			bag.minimum = def.length;
			bag.maximum = def.length;
			bag.length = def.length;
		});
		inst._zod.check = (payload) => {
			const input = payload.value;
			const length = input.length;
			if (length === def.length) return;
			const origin = getLengthableOrigin(input);
			const tooBig = length > def.length;
			payload.issues.push({
				origin,
				...tooBig ? {
					code: "too_big",
					maximum: def.length
				} : {
					code: "too_small",
					minimum: def.length
				},
				inclusive: true,
				exact: true,
				input: payload.value,
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
		var _a, _b;
		$ZodCheck.init(inst, def);
		inst._zod.onattach.push((inst) => {
			const bag = inst._zod.bag;
			bag.format = def.format;
			if (def.pattern) {
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(def.pattern);
			}
		});
		if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
			def.pattern.lastIndex = 0;
			if (def.pattern.test(payload.value)) return;
			payload.issues.push({
				origin: "string",
				code: "invalid_format",
				format: def.format,
				input: payload.value,
				...def.pattern ? { pattern: def.pattern.toString() } : {},
				inst,
				continue: !def.abort
			});
		});
		else (_b = inst._zod).check ?? (_b.check = () => {});
	});
	var $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
		$ZodCheckStringFormat.init(inst, def);
		inst._zod.check = (payload) => {
			def.pattern.lastIndex = 0;
			if (def.pattern.test(payload.value)) return;
			payload.issues.push({
				origin: "string",
				code: "invalid_format",
				format: "regex",
				input: payload.value,
				pattern: def.pattern.toString(),
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
		def.pattern ?? (def.pattern = lowercase);
		$ZodCheckStringFormat.init(inst, def);
	});
	var $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
		def.pattern ?? (def.pattern = uppercase);
		$ZodCheckStringFormat.init(inst, def);
	});
	var $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
		$ZodCheck.init(inst, def);
		const escapedRegex = escapeRegex(def.includes);
		const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
		def.pattern = pattern;
		inst._zod.onattach.push((inst) => {
			const bag = inst._zod.bag;
			bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
			bag.patterns.add(pattern);
		});
		inst._zod.check = (payload) => {
			if (payload.value.includes(def.includes, def.position)) return;
			payload.issues.push({
				origin: "string",
				code: "invalid_format",
				format: "includes",
				includes: def.includes,
				input: payload.value,
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
		$ZodCheck.init(inst, def);
		const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
		def.pattern ?? (def.pattern = pattern);
		inst._zod.onattach.push((inst) => {
			const bag = inst._zod.bag;
			bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
			bag.patterns.add(pattern);
		});
		inst._zod.check = (payload) => {
			if (payload.value.startsWith(def.prefix)) return;
			payload.issues.push({
				origin: "string",
				code: "invalid_format",
				format: "starts_with",
				prefix: def.prefix,
				input: payload.value,
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
		$ZodCheck.init(inst, def);
		const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
		def.pattern ?? (def.pattern = pattern);
		inst._zod.onattach.push((inst) => {
			const bag = inst._zod.bag;
			bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
			bag.patterns.add(pattern);
		});
		inst._zod.check = (payload) => {
			if (payload.value.endsWith(def.suffix)) return;
			payload.issues.push({
				origin: "string",
				code: "invalid_format",
				format: "ends_with",
				suffix: def.suffix,
				input: payload.value,
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
		$ZodCheck.init(inst, def);
		inst._zod.check = (payload) => {
			payload.value = def.tx(payload.value);
		};
	});
	//#endregion
	//#region node_modules/zod/v4/core/doc.js
	var Doc = class {
		constructor(args = []) {
			this.content = [];
			this.indent = 0;
			if (this) this.args = args;
		}
		indented(fn) {
			this.indent += 1;
			fn(this);
			this.indent -= 1;
		}
		write(arg) {
			if (typeof arg === "function") {
				arg(this, { execution: "sync" });
				arg(this, { execution: "async" });
				return;
			}
			const lines = arg.split("\n").filter((x) => x);
			const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
			const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
			for (const line of dedented) this.content.push(line);
		}
		compile() {
			const F = Function;
			const args = this?.args;
			const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
			return new F(...args, lines.join("\n"));
		}
	};
	//#endregion
	//#region node_modules/zod/v4/core/versions.js
	var version = {
		major: 4,
		minor: 4,
		patch: 3
	};
	//#endregion
	//#region node_modules/zod/v4/core/schemas.js
	var $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
		var _a;
		inst ?? (inst = {});
		inst._zod.def = def;
		inst._zod.bag = inst._zod.bag || {};
		inst._zod.version = version;
		const checks = [...inst._zod.def.checks ?? []];
		if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
		for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
		if (checks.length === 0) {
			(_a = inst._zod).deferred ?? (_a.deferred = []);
			inst._zod.deferred?.push(() => {
				inst._zod.run = inst._zod.parse;
			});
		} else {
			const runChecks = (payload, checks, ctx) => {
				let isAborted = aborted(payload);
				let asyncResult;
				for (const ch of checks) {
					if (ch._zod.def.when) {
						if (explicitlyAborted(payload)) continue;
						if (!ch._zod.def.when(payload)) continue;
					} else if (isAborted) continue;
					const currLen = payload.issues.length;
					const _ = ch._zod.check(payload);
					if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
					if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
						await _;
						if (payload.issues.length === currLen) return;
						if (!isAborted) isAborted = aborted(payload, currLen);
					});
					else {
						if (payload.issues.length === currLen) continue;
						if (!isAborted) isAborted = aborted(payload, currLen);
					}
				}
				if (asyncResult) return asyncResult.then(() => {
					return payload;
				});
				return payload;
			};
			const handleCanaryResult = (canary, payload, ctx) => {
				if (aborted(canary)) {
					canary.aborted = true;
					return canary;
				}
				const checkResult = runChecks(payload, checks, ctx);
				if (checkResult instanceof Promise) {
					if (ctx.async === false) throw new $ZodAsyncError();
					return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
				}
				return inst._zod.parse(checkResult, ctx);
			};
			inst._zod.run = (payload, ctx) => {
				if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
				if (ctx.direction === "backward") {
					const canary = inst._zod.parse({
						value: payload.value,
						issues: []
					}, {
						...ctx,
						skipChecks: true
					});
					if (canary instanceof Promise) return canary.then((canary) => {
						return handleCanaryResult(canary, payload, ctx);
					});
					return handleCanaryResult(canary, payload, ctx);
				}
				const result = inst._zod.parse(payload, ctx);
				if (result instanceof Promise) {
					if (ctx.async === false) throw new $ZodAsyncError();
					return result.then((result) => runChecks(result, checks, ctx));
				}
				return runChecks(result, checks, ctx);
			};
		}
		defineLazy(inst, "~standard", () => ({
			validate: (value) => {
				try {
					const r = safeParse$1(inst, value);
					return r.success ? { value: r.data } : { issues: r.error?.issues };
				} catch (_) {
					return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
				}
			},
			vendor: "zod",
			version: 1
		}));
	});
	var $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
		inst._zod.parse = (payload, _) => {
			if (def.coerce) try {
				payload.value = String(payload.value);
			} catch (_) {}
			if (typeof payload.value === "string") return payload;
			payload.issues.push({
				expected: "string",
				code: "invalid_type",
				input: payload.value,
				inst
			});
			return payload;
		};
	});
	var $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
		$ZodCheckStringFormat.init(inst, def);
		$ZodString.init(inst, def);
	});
	var $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
		def.pattern ?? (def.pattern = guid);
		$ZodStringFormat.init(inst, def);
	});
	var $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
		if (def.version) {
			const v = {
				v1: 1,
				v2: 2,
				v3: 3,
				v4: 4,
				v5: 5,
				v6: 6,
				v7: 7,
				v8: 8
			}[def.version];
			if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
			def.pattern ?? (def.pattern = uuid(v));
		} else def.pattern ?? (def.pattern = uuid());
		$ZodStringFormat.init(inst, def);
	});
	var $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
		def.pattern ?? (def.pattern = email);
		$ZodStringFormat.init(inst, def);
	});
	var $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
		$ZodStringFormat.init(inst, def);
		inst._zod.check = (payload) => {
			try {
				const trimmed = payload.value.trim();
				if (!def.normalize && def.protocol?.source === httpProtocol.source) {
					if (!/^https?:\/\//i.test(trimmed)) {
						payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid URL format",
							input: payload.value,
							inst,
							continue: !def.abort
						});
						return;
					}
				}
				const url = new URL(trimmed);
				if (def.hostname) {
					def.hostname.lastIndex = 0;
					if (!def.hostname.test(url.hostname)) payload.issues.push({
						code: "invalid_format",
						format: "url",
						note: "Invalid hostname",
						pattern: def.hostname.source,
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
				if (def.protocol) {
					def.protocol.lastIndex = 0;
					if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
						code: "invalid_format",
						format: "url",
						note: "Invalid protocol",
						pattern: def.protocol.source,
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
				if (def.normalize) payload.value = url.href;
				else payload.value = trimmed;
				return;
			} catch (_) {
				payload.issues.push({
					code: "invalid_format",
					format: "url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			}
		};
	});
	var $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
		def.pattern ?? (def.pattern = emoji());
		$ZodStringFormat.init(inst, def);
	});
	var $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
		def.pattern ?? (def.pattern = nanoid);
		$ZodStringFormat.init(inst, def);
	});
	/**
	* @deprecated CUID v1 is deprecated by its authors due to information leakage
	* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
	* See https://github.com/paralleldrive/cuid.
	*/
	var $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
		def.pattern ?? (def.pattern = cuid);
		$ZodStringFormat.init(inst, def);
	});
	var $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
		def.pattern ?? (def.pattern = cuid2);
		$ZodStringFormat.init(inst, def);
	});
	var $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
		def.pattern ?? (def.pattern = ulid);
		$ZodStringFormat.init(inst, def);
	});
	var $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
		def.pattern ?? (def.pattern = xid);
		$ZodStringFormat.init(inst, def);
	});
	var $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
		def.pattern ?? (def.pattern = ksuid);
		$ZodStringFormat.init(inst, def);
	});
	var $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
		def.pattern ?? (def.pattern = datetime$1(def));
		$ZodStringFormat.init(inst, def);
	});
	var $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
		def.pattern ?? (def.pattern = date$1);
		$ZodStringFormat.init(inst, def);
	});
	var $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
		def.pattern ?? (def.pattern = time$1(def));
		$ZodStringFormat.init(inst, def);
	});
	var $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
		def.pattern ?? (def.pattern = duration$1);
		$ZodStringFormat.init(inst, def);
	});
	var $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
		def.pattern ?? (def.pattern = ipv4);
		$ZodStringFormat.init(inst, def);
		inst._zod.bag.format = `ipv4`;
	});
	var $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
		def.pattern ?? (def.pattern = ipv6);
		$ZodStringFormat.init(inst, def);
		inst._zod.bag.format = `ipv6`;
		inst._zod.check = (payload) => {
			try {
				new URL(`http://[${payload.value}]`);
			} catch {
				payload.issues.push({
					code: "invalid_format",
					format: "ipv6",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			}
		};
	});
	var $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
		def.pattern ?? (def.pattern = cidrv4);
		$ZodStringFormat.init(inst, def);
	});
	var $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
		def.pattern ?? (def.pattern = cidrv6);
		$ZodStringFormat.init(inst, def);
		inst._zod.check = (payload) => {
			const parts = payload.value.split("/");
			try {
				if (parts.length !== 2) throw new Error();
				const [address, prefix] = parts;
				if (!prefix) throw new Error();
				const prefixNum = Number(prefix);
				if (`${prefixNum}` !== prefix) throw new Error();
				if (prefixNum < 0 || prefixNum > 128) throw new Error();
				new URL(`http://[${address}]`);
			} catch {
				payload.issues.push({
					code: "invalid_format",
					format: "cidrv6",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			}
		};
	});
	function isValidBase64(data) {
		if (data === "") return true;
		if (/\s/.test(data)) return false;
		if (data.length % 4 !== 0) return false;
		try {
			atob(data);
			return true;
		} catch {
			return false;
		}
	}
	var $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
		def.pattern ?? (def.pattern = base64);
		$ZodStringFormat.init(inst, def);
		inst._zod.bag.contentEncoding = "base64";
		inst._zod.check = (payload) => {
			if (isValidBase64(payload.value)) return;
			payload.issues.push({
				code: "invalid_format",
				format: "base64",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		};
	});
	function isValidBase64URL(data) {
		if (!base64url.test(data)) return false;
		const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
		return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
	}
	var $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
		def.pattern ?? (def.pattern = base64url);
		$ZodStringFormat.init(inst, def);
		inst._zod.bag.contentEncoding = "base64url";
		inst._zod.check = (payload) => {
			if (isValidBase64URL(payload.value)) return;
			payload.issues.push({
				code: "invalid_format",
				format: "base64url",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
		def.pattern ?? (def.pattern = e164);
		$ZodStringFormat.init(inst, def);
	});
	function isValidJWT(token, algorithm = null) {
		try {
			const tokensParts = token.split(".");
			if (tokensParts.length !== 3) return false;
			const [header] = tokensParts;
			if (!header) return false;
			const parsedHeader = JSON.parse(atob(header));
			if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
			if (!parsedHeader.alg) return false;
			if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
			return true;
		} catch {
			return false;
		}
	}
	var $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
		$ZodStringFormat.init(inst, def);
		inst._zod.check = (payload) => {
			if (isValidJWT(payload.value, def.alg)) return;
			payload.issues.push({
				code: "invalid_format",
				format: "jwt",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		};
	});
	var $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
		inst._zod.parse = (payload, _ctx) => {
			if (def.coerce) try {
				payload.value = Number(payload.value);
			} catch (_) {}
			const input = payload.value;
			if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
			const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
			payload.issues.push({
				expected: "number",
				code: "invalid_type",
				input,
				inst,
				...received ? { received } : {}
			});
			return payload;
		};
	});
	var $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
		$ZodCheckNumberFormat.init(inst, def);
		$ZodNumber.init(inst, def);
	});
	var $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.pattern = boolean$1;
		inst._zod.parse = (payload, _ctx) => {
			if (def.coerce) try {
				payload.value = Boolean(payload.value);
			} catch (_) {}
			const input = payload.value;
			if (typeof input === "boolean") return payload;
			payload.issues.push({
				expected: "boolean",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		};
	});
	var $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.parse = (payload) => payload;
	});
	var $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.parse = (payload, _ctx) => {
			payload.issues.push({
				expected: "never",
				code: "invalid_type",
				input: payload.value,
				inst
			});
			return payload;
		};
	});
	function handleArrayResult(result, final, index) {
		if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
		final.value[index] = result.value;
	}
	var $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.parse = (payload, ctx) => {
			const input = payload.value;
			if (!Array.isArray(input)) {
				payload.issues.push({
					expected: "array",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			}
			payload.value = Array(input.length);
			const proms = [];
			for (let i = 0; i < input.length; i++) {
				const item = input[i];
				const result = def.element._zod.run({
					value: item,
					issues: []
				}, ctx);
				if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
				else handleArrayResult(result, payload, i);
			}
			if (proms.length) return Promise.all(proms).then(() => payload);
			return payload;
		};
	});
	function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
		const isPresent = key in input;
		if (result.issues.length) {
			if (isOptionalIn && isOptionalOut && !isPresent) return;
			final.issues.push(...prefixIssues(key, result.issues));
		}
		if (!isPresent && !isOptionalIn) {
			if (!result.issues.length) final.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: void 0,
				path: [key]
			});
			return;
		}
		if (result.value === void 0) {
			if (isPresent) final.value[key] = void 0;
		} else final.value[key] = result.value;
	}
	function normalizeDef(def) {
		const keys = Object.keys(def.shape);
		for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
		const okeys = optionalKeys(def.shape);
		return {
			...def,
			keys,
			keySet: new Set(keys),
			numKeys: keys.length,
			optionalKeys: new Set(okeys)
		};
	}
	function handleCatchall(proms, input, payload, ctx, def, inst) {
		const unrecognized = [];
		const keySet = def.keySet;
		const _catchall = def.catchall._zod;
		const t = _catchall.def.type;
		const isOptionalIn = _catchall.optin === "optional";
		const isOptionalOut = _catchall.optout === "optional";
		for (const key in input) {
			if (key === "__proto__") continue;
			if (keySet.has(key)) continue;
			if (t === "never") {
				unrecognized.push(key);
				continue;
			}
			const r = _catchall.run({
				value: input[key],
				issues: []
			}, ctx);
			if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
			else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
		}
		if (unrecognized.length) payload.issues.push({
			code: "unrecognized_keys",
			keys: unrecognized,
			input,
			inst
		});
		if (!proms.length) return payload;
		return Promise.all(proms).then(() => {
			return payload;
		});
	}
	var $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
		$ZodType.init(inst, def);
		if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
			const sh = def.shape;
			Object.defineProperty(def, "shape", { get: () => {
				const newSh = { ...sh };
				Object.defineProperty(def, "shape", { value: newSh });
				return newSh;
			} });
		}
		const _normalized = cached(() => normalizeDef(def));
		defineLazy(inst._zod, "propValues", () => {
			const shape = def.shape;
			const propValues = {};
			for (const key in shape) {
				const field = shape[key]._zod;
				if (field.values) {
					propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
					for (const v of field.values) propValues[key].add(v);
				}
			}
			return propValues;
		});
		const isObject$1 = isObject;
		const catchall = def.catchall;
		let value;
		inst._zod.parse = (payload, ctx) => {
			value ?? (value = _normalized.value);
			const input = payload.value;
			if (!isObject$1(input)) {
				payload.issues.push({
					expected: "object",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			}
			payload.value = {};
			const proms = [];
			const shape = value.shape;
			for (const key of value.keys) {
				const el = shape[key];
				const isOptionalIn = el._zod.optin === "optional";
				const isOptionalOut = el._zod.optout === "optional";
				const r = el._zod.run({
					value: input[key],
					issues: []
				}, ctx);
				if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
				else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
			}
			if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
			return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
		};
	});
	var $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
		$ZodObject.init(inst, def);
		const superParse = inst._zod.parse;
		const _normalized = cached(() => normalizeDef(def));
		const generateFastpass = (shape) => {
			const doc = new Doc([
				"shape",
				"payload",
				"ctx"
			]);
			const normalized = _normalized.value;
			const parseStr = (key) => {
				const k = esc(key);
				return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
			};
			doc.write(`const input = payload.value;`);
			const ids = Object.create(null);
			let counter = 0;
			for (const key of normalized.keys) ids[key] = `key_${counter++}`;
			doc.write(`const newResult = {};`);
			for (const key of normalized.keys) {
				const id = ids[key];
				const k = esc(key);
				const schema = shape[key];
				const isOptionalIn = schema?._zod?.optin === "optional";
				const isOptionalOut = schema?._zod?.optout === "optional";
				doc.write(`const ${id} = ${parseStr(key)};`);
				if (isOptionalIn && isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
				else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
				else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
			}
			doc.write(`payload.value = newResult;`);
			doc.write(`return payload;`);
			const fn = doc.compile();
			return (payload, ctx) => fn(shape, payload, ctx);
		};
		let fastpass;
		const isObject$2 = isObject;
		const jit = !globalConfig.jitless;
		const fastEnabled = jit && allowsEval.value;
		const catchall = def.catchall;
		let value;
		inst._zod.parse = (payload, ctx) => {
			value ?? (value = _normalized.value);
			const input = payload.value;
			if (!isObject$2(input)) {
				payload.issues.push({
					expected: "object",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			}
			if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
				if (!fastpass) fastpass = generateFastpass(def.shape);
				payload = fastpass(payload, ctx);
				if (!catchall) return payload;
				return handleCatchall([], input, payload, ctx, value, inst);
			}
			return superParse(payload, ctx);
		};
	});
	function handleUnionResults(results, final, inst, ctx) {
		for (const result of results) if (result.issues.length === 0) {
			final.value = result.value;
			return final;
		}
		const nonaborted = results.filter((r) => !aborted(r));
		if (nonaborted.length === 1) {
			final.value = nonaborted[0].value;
			return nonaborted[0];
		}
		final.issues.push({
			code: "invalid_union",
			input: final.value,
			inst,
			errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
		});
		return final;
	}
	var $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
		$ZodType.init(inst, def);
		defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
		defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
		defineLazy(inst._zod, "values", () => {
			if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
		});
		defineLazy(inst._zod, "pattern", () => {
			if (def.options.every((o) => o._zod.pattern)) {
				const patterns = def.options.map((o) => o._zod.pattern);
				return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
			}
		});
		const first = def.options.length === 1 ? def.options[0]._zod.run : null;
		inst._zod.parse = (payload, ctx) => {
			if (first) return first(payload, ctx);
			let async = false;
			const results = [];
			for (const option of def.options) {
				const result = option._zod.run({
					value: payload.value,
					issues: []
				}, ctx);
				if (result instanceof Promise) {
					results.push(result);
					async = true;
				} else {
					if (result.issues.length === 0) return result;
					results.push(result);
				}
			}
			if (!async) return handleUnionResults(results, payload, inst, ctx);
			return Promise.all(results).then((results) => {
				return handleUnionResults(results, payload, inst, ctx);
			});
		};
	});
	var $ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
		def.inclusive = false;
		$ZodUnion.init(inst, def);
		const _super = inst._zod.parse;
		defineLazy(inst._zod, "propValues", () => {
			const propValues = {};
			for (const option of def.options) {
				const pv = option._zod.propValues;
				if (!pv || Object.keys(pv).length === 0) throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
				for (const [k, v] of Object.entries(pv)) {
					if (!propValues[k]) propValues[k] = /* @__PURE__ */ new Set();
					for (const val of v) propValues[k].add(val);
				}
			}
			return propValues;
		});
		const disc = cached(() => {
			const opts = def.options;
			const map = /* @__PURE__ */ new Map();
			for (const o of opts) {
				const values = o._zod.propValues?.[def.discriminator];
				if (!values || values.size === 0) throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
				for (const v of values) {
					if (map.has(v)) throw new Error(`Duplicate discriminator value "${String(v)}"`);
					map.set(v, o);
				}
			}
			return map;
		});
		inst._zod.parse = (payload, ctx) => {
			const input = payload.value;
			if (!isObject(input)) {
				payload.issues.push({
					code: "invalid_type",
					expected: "object",
					input,
					inst
				});
				return payload;
			}
			const opt = disc.value.get(input?.[def.discriminator]);
			if (opt) return opt._zod.run(payload, ctx);
			if (def.unionFallback || ctx.direction === "backward") return _super(payload, ctx);
			payload.issues.push({
				code: "invalid_union",
				errors: [],
				note: "No matching discriminator",
				discriminator: def.discriminator,
				options: Array.from(disc.value.keys()),
				input,
				path: [def.discriminator],
				inst
			});
			return payload;
		};
	});
	var $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.parse = (payload, ctx) => {
			const input = payload.value;
			const left = def.left._zod.run({
				value: input,
				issues: []
			}, ctx);
			const right = def.right._zod.run({
				value: input,
				issues: []
			}, ctx);
			if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
				return handleIntersectionResults(payload, left, right);
			});
			return handleIntersectionResults(payload, left, right);
		};
	});
	function mergeValues(a, b) {
		if (a === b) return {
			valid: true,
			data: a
		};
		if (a instanceof Date && b instanceof Date && +a === +b) return {
			valid: true,
			data: a
		};
		if (isPlainObject(a) && isPlainObject(b)) {
			const bKeys = Object.keys(b);
			const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
			const newObj = {
				...a,
				...b
			};
			for (const key of sharedKeys) {
				const sharedValue = mergeValues(a[key], b[key]);
				if (!sharedValue.valid) return {
					valid: false,
					mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
				};
				newObj[key] = sharedValue.data;
			}
			return {
				valid: true,
				data: newObj
			};
		}
		if (Array.isArray(a) && Array.isArray(b)) {
			if (a.length !== b.length) return {
				valid: false,
				mergeErrorPath: []
			};
			const newArray = [];
			for (let index = 0; index < a.length; index++) {
				const itemA = a[index];
				const itemB = b[index];
				const sharedValue = mergeValues(itemA, itemB);
				if (!sharedValue.valid) return {
					valid: false,
					mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
				};
				newArray.push(sharedValue.data);
			}
			return {
				valid: true,
				data: newArray
			};
		}
		return {
			valid: false,
			mergeErrorPath: []
		};
	}
	function handleIntersectionResults(result, left, right) {
		const unrecKeys = /* @__PURE__ */ new Map();
		let unrecIssue;
		for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
			unrecIssue ?? (unrecIssue = iss);
			for (const k of iss.keys) {
				if (!unrecKeys.has(k)) unrecKeys.set(k, {});
				unrecKeys.get(k).l = true;
			}
		} else result.issues.push(iss);
		for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
			if (!unrecKeys.has(k)) unrecKeys.set(k, {});
			unrecKeys.get(k).r = true;
		}
		else result.issues.push(iss);
		const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
		if (bothKeys.length && unrecIssue) result.issues.push({
			...unrecIssue,
			keys: bothKeys
		});
		if (aborted(result)) return result;
		const merged = mergeValues(left.value, right.value);
		if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
		result.value = merged.data;
		return result;
	}
	var $ZodTuple = /*@__PURE__*/ $constructor("$ZodTuple", (inst, def) => {
		$ZodType.init(inst, def);
		const items = def.items;
		inst._zod.parse = (payload, ctx) => {
			const input = payload.value;
			if (!Array.isArray(input)) {
				payload.issues.push({
					input,
					inst,
					expected: "tuple",
					code: "invalid_type"
				});
				return payload;
			}
			payload.value = [];
			const proms = [];
			const optinStart = getTupleOptStart(items, "optin");
			const optoutStart = getTupleOptStart(items, "optout");
			if (!def.rest) {
				if (input.length < optinStart) {
					payload.issues.push({
						code: "too_small",
						minimum: optinStart,
						inclusive: true,
						input,
						inst,
						origin: "array"
					});
					return payload;
				}
				if (input.length > items.length) payload.issues.push({
					code: "too_big",
					maximum: items.length,
					inclusive: true,
					input,
					inst,
					origin: "array"
				});
			}
			const itemResults = new Array(items.length);
			for (let i = 0; i < items.length; i++) {
				const r = items[i]._zod.run({
					value: input[i],
					issues: []
				}, ctx);
				if (r instanceof Promise) proms.push(r.then((rr) => {
					itemResults[i] = rr;
				}));
				else itemResults[i] = r;
			}
			if (def.rest) {
				let i = items.length - 1;
				const rest = input.slice(items.length);
				for (const el of rest) {
					i++;
					const result = def.rest._zod.run({
						value: el,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((r) => handleTupleResult(r, payload, i)));
					else handleTupleResult(result, payload, i);
				}
			}
			if (proms.length) return Promise.all(proms).then(() => handleTupleResults(itemResults, payload, items, input, optoutStart));
			return handleTupleResults(itemResults, payload, items, input, optoutStart);
		};
	});
	function getTupleOptStart(items, key) {
		for (let i = items.length - 1; i >= 0; i--) if (items[i]._zod[key] !== "optional") return i + 1;
		return 0;
	}
	function handleTupleResult(result, final, index) {
		if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
		final.value[index] = result.value;
	}
	function handleTupleResults(itemResults, final, items, input, optoutStart) {
		for (let i = 0; i < items.length; i++) {
			const r = itemResults[i];
			const isPresent = i < input.length;
			if (r.issues.length) {
				if (!isPresent && i >= optoutStart) {
					final.value.length = i;
					break;
				}
				final.issues.push(...prefixIssues(i, r.issues));
			}
			final.value[i] = r.value;
		}
		for (let i = final.value.length - 1; i >= input.length; i--) if (items[i]._zod.optout === "optional" && final.value[i] === void 0) final.value.length = i;
		else break;
		return final;
	}
	var $ZodRecord = /*@__PURE__*/ $constructor("$ZodRecord", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.parse = (payload, ctx) => {
			const input = payload.value;
			if (!isPlainObject(input)) {
				payload.issues.push({
					expected: "record",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			}
			const proms = [];
			const values = def.keyType._zod.values;
			if (values) {
				payload.value = {};
				const recordKeys = /* @__PURE__ */ new Set();
				for (const key of values) if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
					recordKeys.add(typeof key === "number" ? key.toString() : key);
					const keyResult = def.keyType._zod.run({
						value: key,
						issues: []
					}, ctx);
					if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
					if (keyResult.issues.length) {
						payload.issues.push({
							code: "invalid_key",
							origin: "record",
							issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
							input: key,
							path: [key],
							inst
						});
						continue;
					}
					const outKey = keyResult.value;
					const result = def.valueType._zod.run({
						value: input[key],
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => {
						if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
						payload.value[outKey] = result.value;
					}));
					else {
						if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
						payload.value[outKey] = result.value;
					}
				}
				let unrecognized;
				for (const key in input) if (!recordKeys.has(key)) {
					unrecognized = unrecognized ?? [];
					unrecognized.push(key);
				}
				if (unrecognized && unrecognized.length > 0) payload.issues.push({
					code: "unrecognized_keys",
					input,
					inst,
					keys: unrecognized
				});
			} else {
				payload.value = {};
				for (const key of Reflect.ownKeys(input)) {
					if (key === "__proto__") continue;
					if (!Object.prototype.propertyIsEnumerable.call(input, key)) continue;
					let keyResult = def.keyType._zod.run({
						value: key,
						issues: []
					}, ctx);
					if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
					if (typeof key === "string" && number$1.test(key) && keyResult.issues.length) {
						const retryResult = def.keyType._zod.run({
							value: Number(key),
							issues: []
						}, ctx);
						if (retryResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
						if (retryResult.issues.length === 0) keyResult = retryResult;
					}
					if (keyResult.issues.length) {
						if (def.mode === "loose") payload.value[key] = input[key];
						else payload.issues.push({
							code: "invalid_key",
							origin: "record",
							issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
							input: key,
							path: [key],
							inst
						});
						continue;
					}
					const result = def.valueType._zod.run({
						value: input[key],
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => {
						if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
						payload.value[keyResult.value] = result.value;
					}));
					else {
						if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
						payload.value[keyResult.value] = result.value;
					}
				}
			}
			if (proms.length) return Promise.all(proms).then(() => payload);
			return payload;
		};
	});
	var $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
		$ZodType.init(inst, def);
		const values = getEnumValues(def.entries);
		const valuesSet = new Set(values);
		inst._zod.values = valuesSet;
		inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
		inst._zod.parse = (payload, _ctx) => {
			const input = payload.value;
			if (valuesSet.has(input)) return payload;
			payload.issues.push({
				code: "invalid_value",
				values,
				input,
				inst
			});
			return payload;
		};
	});
	var $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
		$ZodType.init(inst, def);
		if (def.values.length === 0) throw new Error("Cannot create literal schema with no valid values");
		const values = new Set(def.values);
		inst._zod.values = values;
		inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
		inst._zod.parse = (payload, _ctx) => {
			const input = payload.value;
			if (values.has(input)) return payload;
			payload.issues.push({
				code: "invalid_value",
				values: def.values,
				input,
				inst
			});
			return payload;
		};
	});
	var $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.optin = "optional";
		inst._zod.parse = (payload, ctx) => {
			if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
			const _out = def.transform(payload.value, payload);
			if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
				payload.value = output;
				payload.fallback = true;
				return payload;
			});
			if (_out instanceof Promise) throw new $ZodAsyncError();
			payload.value = _out;
			payload.fallback = true;
			return payload;
		};
	});
	function handleOptionalResult(result, input) {
		if (input === void 0 && (result.issues.length || result.fallback)) return {
			issues: [],
			value: void 0
		};
		return result;
	}
	var $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.optin = "optional";
		inst._zod.optout = "optional";
		defineLazy(inst._zod, "values", () => {
			return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
		});
		defineLazy(inst._zod, "pattern", () => {
			const pattern = def.innerType._zod.pattern;
			return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
		});
		inst._zod.parse = (payload, ctx) => {
			if (def.innerType._zod.optin === "optional") {
				const input = payload.value;
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, input));
				return handleOptionalResult(result, input);
			}
			if (payload.value === void 0) return payload;
			return def.innerType._zod.run(payload, ctx);
		};
	});
	var $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
		$ZodOptional.init(inst, def);
		defineLazy(inst._zod, "values", () => def.innerType._zod.values);
		defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
		inst._zod.parse = (payload, ctx) => {
			return def.innerType._zod.run(payload, ctx);
		};
	});
	var $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
		$ZodType.init(inst, def);
		defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
		defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
		defineLazy(inst._zod, "pattern", () => {
			const pattern = def.innerType._zod.pattern;
			return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
		});
		defineLazy(inst._zod, "values", () => {
			return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
		});
		inst._zod.parse = (payload, ctx) => {
			if (payload.value === null) return payload;
			return def.innerType._zod.run(payload, ctx);
		};
	});
	var $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.optin = "optional";
		defineLazy(inst._zod, "values", () => def.innerType._zod.values);
		inst._zod.parse = (payload, ctx) => {
			if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
			if (payload.value === void 0) {
				payload.value = def.defaultValue;
				/**
				* $ZodDefault returns the default value immediately in forward direction.
				* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
				return payload;
			}
			const result = def.innerType._zod.run(payload, ctx);
			if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
			return handleDefaultResult(result, def);
		};
	});
	function handleDefaultResult(payload, def) {
		if (payload.value === void 0) payload.value = def.defaultValue;
		return payload;
	}
	var $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.optin = "optional";
		defineLazy(inst._zod, "values", () => def.innerType._zod.values);
		inst._zod.parse = (payload, ctx) => {
			if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
			if (payload.value === void 0) payload.value = def.defaultValue;
			return def.innerType._zod.run(payload, ctx);
		};
	});
	var $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
		$ZodType.init(inst, def);
		defineLazy(inst._zod, "values", () => {
			const v = def.innerType._zod.values;
			return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
		});
		inst._zod.parse = (payload, ctx) => {
			const result = def.innerType._zod.run(payload, ctx);
			if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
			return handleNonOptionalResult(result, inst);
		};
	});
	function handleNonOptionalResult(payload, inst) {
		if (!payload.issues.length && payload.value === void 0) payload.issues.push({
			code: "invalid_type",
			expected: "nonoptional",
			input: payload.value,
			inst
		});
		return payload;
	}
	var $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.optin = "optional";
		defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
		defineLazy(inst._zod, "values", () => def.innerType._zod.values);
		inst._zod.parse = (payload, ctx) => {
			if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
			const result = def.innerType._zod.run(payload, ctx);
			if (result instanceof Promise) return result.then((result) => {
				payload.value = result.value;
				if (result.issues.length) {
					payload.value = def.catchValue({
						...payload,
						error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
						input: payload.value
					});
					payload.issues = [];
					payload.fallback = true;
				}
				return payload;
			});
			payload.value = result.value;
			if (result.issues.length) {
				payload.value = def.catchValue({
					...payload,
					error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
					input: payload.value
				});
				payload.issues = [];
				payload.fallback = true;
			}
			return payload;
		};
	});
	var $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
		$ZodType.init(inst, def);
		defineLazy(inst._zod, "values", () => def.in._zod.values);
		defineLazy(inst._zod, "optin", () => def.in._zod.optin);
		defineLazy(inst._zod, "optout", () => def.out._zod.optout);
		defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
		inst._zod.parse = (payload, ctx) => {
			if (ctx.direction === "backward") {
				const right = def.out._zod.run(payload, ctx);
				if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
				return handlePipeResult(right, def.in, ctx);
			}
			const left = def.in._zod.run(payload, ctx);
			if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
			return handlePipeResult(left, def.out, ctx);
		};
	});
	function handlePipeResult(left, next, ctx) {
		if (left.issues.length) {
			left.aborted = true;
			return left;
		}
		return next._zod.run({
			value: left.value,
			issues: left.issues,
			fallback: left.fallback
		}, ctx);
	}
	var $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
		$ZodType.init(inst, def);
		defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
		defineLazy(inst._zod, "values", () => def.innerType._zod.values);
		defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
		defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
		inst._zod.parse = (payload, ctx) => {
			if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
			const result = def.innerType._zod.run(payload, ctx);
			if (result instanceof Promise) return result.then(handleReadonlyResult);
			return handleReadonlyResult(result);
		};
	});
	function handleReadonlyResult(payload) {
		payload.value = Object.freeze(payload.value);
		return payload;
	}
	var $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
		$ZodCheck.init(inst, def);
		$ZodType.init(inst, def);
		inst._zod.parse = (payload, _) => {
			return payload;
		};
		inst._zod.check = (payload) => {
			const input = payload.value;
			const r = def.fn(input);
			if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
			handleRefineResult(r, payload, input, inst);
		};
	});
	function handleRefineResult(result, payload, input, inst) {
		if (!result) {
			const _iss = {
				code: "custom",
				input,
				inst,
				path: [...inst._zod.def.path ?? []],
				continue: !inst._zod.def.abort
			};
			if (inst._zod.def.params) _iss.params = inst._zod.def.params;
			payload.issues.push(issue(_iss));
		}
	}
	//#endregion
	//#region node_modules/zod/v4/core/registries.js
	var _a;
	var $ZodRegistry = class {
		constructor() {
			this._map = /* @__PURE__ */ new WeakMap();
			this._idmap = /* @__PURE__ */ new Map();
		}
		add(schema, ..._meta) {
			const meta = _meta[0];
			this._map.set(schema, meta);
			if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
			return this;
		}
		clear() {
			this._map = /* @__PURE__ */ new WeakMap();
			this._idmap = /* @__PURE__ */ new Map();
			return this;
		}
		remove(schema) {
			const meta = this._map.get(schema);
			if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
			this._map.delete(schema);
			return this;
		}
		get(schema) {
			const p = schema._zod.parent;
			if (p) {
				const pm = { ...this.get(p) ?? {} };
				delete pm.id;
				const f = {
					...pm,
					...this._map.get(schema)
				};
				return Object.keys(f).length ? f : void 0;
			}
			return this._map.get(schema);
		}
		has(schema) {
			return this._map.has(schema);
		}
	};
	function registry() {
		return new $ZodRegistry();
	}
	(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
	var globalRegistry = globalThis.__zod_globalRegistry;
	//#endregion
	//#region node_modules/zod/v4/core/api.js
	// @__NO_SIDE_EFFECTS__
	function _string(Class, params) {
		return new Class({
			type: "string",
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _email(Class, params) {
		return new Class({
			type: "string",
			format: "email",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _guid(Class, params) {
		return new Class({
			type: "string",
			format: "guid",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _uuid(Class, params) {
		return new Class({
			type: "string",
			format: "uuid",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _uuidv4(Class, params) {
		return new Class({
			type: "string",
			format: "uuid",
			check: "string_format",
			abort: false,
			version: "v4",
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _uuidv6(Class, params) {
		return new Class({
			type: "string",
			format: "uuid",
			check: "string_format",
			abort: false,
			version: "v6",
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _uuidv7(Class, params) {
		return new Class({
			type: "string",
			format: "uuid",
			check: "string_format",
			abort: false,
			version: "v7",
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _url(Class, params) {
		return new Class({
			type: "string",
			format: "url",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _emoji(Class, params) {
		return new Class({
			type: "string",
			format: "emoji",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _nanoid(Class, params) {
		return new Class({
			type: "string",
			format: "nanoid",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	/**
	* @deprecated CUID v1 is deprecated by its authors due to information leakage
	* (timestamps embedded in the id). Use {@link _cuid2} instead.
	* See https://github.com/paralleldrive/cuid.
	*/
	// @__NO_SIDE_EFFECTS__
	function _cuid(Class, params) {
		return new Class({
			type: "string",
			format: "cuid",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _cuid2(Class, params) {
		return new Class({
			type: "string",
			format: "cuid2",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _ulid(Class, params) {
		return new Class({
			type: "string",
			format: "ulid",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _xid(Class, params) {
		return new Class({
			type: "string",
			format: "xid",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _ksuid(Class, params) {
		return new Class({
			type: "string",
			format: "ksuid",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _ipv4(Class, params) {
		return new Class({
			type: "string",
			format: "ipv4",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _ipv6(Class, params) {
		return new Class({
			type: "string",
			format: "ipv6",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _cidrv4(Class, params) {
		return new Class({
			type: "string",
			format: "cidrv4",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _cidrv6(Class, params) {
		return new Class({
			type: "string",
			format: "cidrv6",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _base64(Class, params) {
		return new Class({
			type: "string",
			format: "base64",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _base64url(Class, params) {
		return new Class({
			type: "string",
			format: "base64url",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _e164(Class, params) {
		return new Class({
			type: "string",
			format: "e164",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _jwt(Class, params) {
		return new Class({
			type: "string",
			format: "jwt",
			check: "string_format",
			abort: false,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _isoDateTime(Class, params) {
		return new Class({
			type: "string",
			format: "datetime",
			check: "string_format",
			offset: false,
			local: false,
			precision: null,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _isoDate(Class, params) {
		return new Class({
			type: "string",
			format: "date",
			check: "string_format",
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _isoTime(Class, params) {
		return new Class({
			type: "string",
			format: "time",
			check: "string_format",
			precision: null,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _isoDuration(Class, params) {
		return new Class({
			type: "string",
			format: "duration",
			check: "string_format",
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _number(Class, params) {
		return new Class({
			type: "number",
			checks: [],
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _int(Class, params) {
		return new Class({
			type: "number",
			check: "number_format",
			abort: false,
			format: "safeint",
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _boolean(Class, params) {
		return new Class({
			type: "boolean",
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _unknown(Class) {
		return new Class({ type: "unknown" });
	}
	// @__NO_SIDE_EFFECTS__
	function _never(Class, params) {
		return new Class({
			type: "never",
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _lt(value, params) {
		return new $ZodCheckLessThan({
			check: "less_than",
			...normalizeParams(params),
			value,
			inclusive: false
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _lte(value, params) {
		return new $ZodCheckLessThan({
			check: "less_than",
			...normalizeParams(params),
			value,
			inclusive: true
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _gt(value, params) {
		return new $ZodCheckGreaterThan({
			check: "greater_than",
			...normalizeParams(params),
			value,
			inclusive: false
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _gte(value, params) {
		return new $ZodCheckGreaterThan({
			check: "greater_than",
			...normalizeParams(params),
			value,
			inclusive: true
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _multipleOf(value, params) {
		return new $ZodCheckMultipleOf({
			check: "multiple_of",
			...normalizeParams(params),
			value
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _maxLength(maximum, params) {
		return new $ZodCheckMaxLength({
			check: "max_length",
			...normalizeParams(params),
			maximum
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _minLength(minimum, params) {
		return new $ZodCheckMinLength({
			check: "min_length",
			...normalizeParams(params),
			minimum
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _length(length, params) {
		return new $ZodCheckLengthEquals({
			check: "length_equals",
			...normalizeParams(params),
			length
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _regex(pattern, params) {
		return new $ZodCheckRegex({
			check: "string_format",
			format: "regex",
			...normalizeParams(params),
			pattern
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _lowercase(params) {
		return new $ZodCheckLowerCase({
			check: "string_format",
			format: "lowercase",
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _uppercase(params) {
		return new $ZodCheckUpperCase({
			check: "string_format",
			format: "uppercase",
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _includes(includes, params) {
		return new $ZodCheckIncludes({
			check: "string_format",
			format: "includes",
			...normalizeParams(params),
			includes
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _startsWith(prefix, params) {
		return new $ZodCheckStartsWith({
			check: "string_format",
			format: "starts_with",
			...normalizeParams(params),
			prefix
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _endsWith(suffix, params) {
		return new $ZodCheckEndsWith({
			check: "string_format",
			format: "ends_with",
			...normalizeParams(params),
			suffix
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _overwrite(tx) {
		return new $ZodCheckOverwrite({
			check: "overwrite",
			tx
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _normalize(form) {
		return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
	}
	// @__NO_SIDE_EFFECTS__
	function _trim() {
		return /* @__PURE__ */ _overwrite((input) => input.trim());
	}
	// @__NO_SIDE_EFFECTS__
	function _toLowerCase() {
		return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
	}
	// @__NO_SIDE_EFFECTS__
	function _toUpperCase() {
		return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
	}
	// @__NO_SIDE_EFFECTS__
	function _slugify() {
		return /* @__PURE__ */ _overwrite((input) => slugify(input));
	}
	// @__NO_SIDE_EFFECTS__
	function _array(Class, element, params) {
		return new Class({
			type: "array",
			element,
			...normalizeParams(params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _refine(Class, fn, _params) {
		return new Class({
			type: "custom",
			check: "custom",
			fn,
			...normalizeParams(_params)
		});
	}
	// @__NO_SIDE_EFFECTS__
	function _superRefine(fn, params) {
		const ch = /* @__PURE__ */ _check((payload) => {
			payload.addIssue = (issue$2) => {
				if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
				else {
					const _issue = issue$2;
					if (_issue.fatal) _issue.continue = false;
					_issue.code ?? (_issue.code = "custom");
					_issue.input ?? (_issue.input = payload.value);
					_issue.inst ?? (_issue.inst = ch);
					_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
					payload.issues.push(issue(_issue));
				}
			};
			return fn(payload.value, payload);
		}, params);
		return ch;
	}
	// @__NO_SIDE_EFFECTS__
	function _check(fn, params) {
		const ch = new $ZodCheck({
			check: "custom",
			...normalizeParams(params)
		});
		ch._zod.check = fn;
		return ch;
	}
	//#endregion
	//#region node_modules/zod/v4/core/to-json-schema.js
	function initializeContext(params) {
		let target = params?.target ?? "draft-2020-12";
		if (target === "draft-4") target = "draft-04";
		if (target === "draft-7") target = "draft-07";
		return {
			processors: params.processors ?? {},
			metadataRegistry: params?.metadata ?? globalRegistry,
			target,
			unrepresentable: params?.unrepresentable ?? "throw",
			override: params?.override ?? (() => {}),
			io: params?.io ?? "output",
			counter: 0,
			seen: /* @__PURE__ */ new Map(),
			cycles: params?.cycles ?? "ref",
			reused: params?.reused ?? "inline",
			external: params?.external ?? void 0
		};
	}
	function process(schema, ctx, _params = {
		path: [],
		schemaPath: []
	}) {
		var _a;
		const def = schema._zod.def;
		const seen = ctx.seen.get(schema);
		if (seen) {
			seen.count++;
			if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
			return seen.schema;
		}
		const result = {
			schema: {},
			count: 1,
			cycle: void 0,
			path: _params.path
		};
		ctx.seen.set(schema, result);
		const overrideSchema = schema._zod.toJSONSchema?.();
		if (overrideSchema) result.schema = overrideSchema;
		else {
			const params = {
				..._params,
				schemaPath: [..._params.schemaPath, schema],
				path: _params.path
			};
			if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
			else {
				const _json = result.schema;
				const processor = ctx.processors[def.type];
				if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
				processor(schema, ctx, _json, params);
			}
			const parent = schema._zod.parent;
			if (parent) {
				if (!result.ref) result.ref = parent;
				process(parent, ctx, params);
				ctx.seen.get(parent).isParent = true;
			}
		}
		const meta = ctx.metadataRegistry.get(schema);
		if (meta) Object.assign(result.schema, meta);
		if (ctx.io === "input" && isTransforming(schema)) {
			delete result.schema.examples;
			delete result.schema.default;
		}
		if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
		delete result.schema._prefault;
		return ctx.seen.get(schema).schema;
	}
	function extractDefs(ctx, schema) {
		const root = ctx.seen.get(schema);
		if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
		const idToSchema = /* @__PURE__ */ new Map();
		for (const entry of ctx.seen.entries()) {
			const id = ctx.metadataRegistry.get(entry[0])?.id;
			if (id) {
				const existing = idToSchema.get(id);
				if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
				idToSchema.set(id, entry[0]);
			}
		}
		const makeURI = (entry) => {
			const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
			if (ctx.external) {
				const externalId = ctx.external.registry.get(entry[0])?.id;
				const uriGenerator = ctx.external.uri ?? ((id) => id);
				if (externalId) return { ref: uriGenerator(externalId) };
				const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
				entry[1].defId = id;
				return {
					defId: id,
					ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
				};
			}
			if (entry[1] === root) return { ref: "#" };
			const defUriPrefix = `#/${defsSegment}/`;
			const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
			return {
				defId,
				ref: defUriPrefix + defId
			};
		};
		const extractToDef = (entry) => {
			if (entry[1].schema.$ref) return;
			const seen = entry[1];
			const { ref, defId } = makeURI(entry);
			seen.def = { ...seen.schema };
			if (defId) seen.defId = defId;
			const schema = seen.schema;
			for (const key in schema) delete schema[key];
			schema.$ref = ref;
		};
		if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
			const seen = entry[1];
			if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
		}
		for (const entry of ctx.seen.entries()) {
			const seen = entry[1];
			if (schema === entry[0]) {
				extractToDef(entry);
				continue;
			}
			if (ctx.external) {
				const ext = ctx.external.registry.get(entry[0])?.id;
				if (schema !== entry[0] && ext) {
					extractToDef(entry);
					continue;
				}
			}
			if (ctx.metadataRegistry.get(entry[0])?.id) {
				extractToDef(entry);
				continue;
			}
			if (seen.cycle) {
				extractToDef(entry);
				continue;
			}
			if (seen.count > 1) {
				if (ctx.reused === "ref") {
					extractToDef(entry);
					continue;
				}
			}
		}
	}
	function finalize(ctx, schema) {
		const root = ctx.seen.get(schema);
		if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
		const flattenRef = (zodSchema) => {
			const seen = ctx.seen.get(zodSchema);
			if (seen.ref === null) return;
			const schema = seen.def ?? seen.schema;
			const _cached = { ...schema };
			const ref = seen.ref;
			seen.ref = null;
			if (ref) {
				flattenRef(ref);
				const refSeen = ctx.seen.get(ref);
				const refSchema = refSeen.schema;
				if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
					schema.allOf = schema.allOf ?? [];
					schema.allOf.push(refSchema);
				} else Object.assign(schema, refSchema);
				Object.assign(schema, _cached);
				if (zodSchema._zod.parent === ref) for (const key in schema) {
					if (key === "$ref" || key === "allOf") continue;
					if (!(key in _cached)) delete schema[key];
				}
				if (refSchema.$ref && refSeen.def) for (const key in schema) {
					if (key === "$ref" || key === "allOf") continue;
					if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
				}
			}
			const parent = zodSchema._zod.parent;
			if (parent && parent !== ref) {
				flattenRef(parent);
				const parentSeen = ctx.seen.get(parent);
				if (parentSeen?.schema.$ref) {
					schema.$ref = parentSeen.schema.$ref;
					if (parentSeen.def) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
					}
				}
			}
			ctx.override({
				zodSchema,
				jsonSchema: schema,
				path: seen.path ?? []
			});
		};
		for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
		const result = {};
		if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
		else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
		else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
		else if (ctx.target === "openapi-3.0") {}
		if (ctx.external?.uri) {
			const id = ctx.external.registry.get(schema)?.id;
			if (!id) throw new Error("Schema is missing an `id` property");
			result.$id = ctx.external.uri(id);
		}
		Object.assign(result, root.def ?? root.schema);
		const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
		if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
		const defs = ctx.external?.defs ?? {};
		for (const entry of ctx.seen.entries()) {
			const seen = entry[1];
			if (seen.def && seen.defId) {
				if (seen.def.id === seen.defId) delete seen.def.id;
				defs[seen.defId] = seen.def;
			}
		}
		if (ctx.external) {} else if (Object.keys(defs).length > 0) {
			if (ctx.target === "draft-2020-12") result.$defs = defs;
			else result.definitions = defs;
		}
		try {
			const finalized = JSON.parse(JSON.stringify(result));
			Object.defineProperty(finalized, "~standard", {
				value: {
					...schema["~standard"],
					jsonSchema: {
						input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
						output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
					}
				},
				enumerable: false,
				writable: false
			});
			return finalized;
		} catch (_err) {
			throw new Error("Error converting schema to JSON.");
		}
	}
	function isTransforming(_schema, _ctx) {
		const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
		if (ctx.seen.has(_schema)) return false;
		ctx.seen.add(_schema);
		const def = _schema._zod.def;
		if (def.type === "transform") return true;
		if (def.type === "array") return isTransforming(def.element, ctx);
		if (def.type === "set") return isTransforming(def.valueType, ctx);
		if (def.type === "lazy") return isTransforming(def.getter(), ctx);
		if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
		if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
		if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
		if (def.type === "pipe") {
			if (_schema._zod.traits.has("$ZodCodec")) return true;
			return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
		}
		if (def.type === "object") {
			for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
			return false;
		}
		if (def.type === "union") {
			for (const option of def.options) if (isTransforming(option, ctx)) return true;
			return false;
		}
		if (def.type === "tuple") {
			for (const item of def.items) if (isTransforming(item, ctx)) return true;
			if (def.rest && isTransforming(def.rest, ctx)) return true;
			return false;
		}
		return false;
	}
	/**
	* Creates a toJSONSchema method for a schema instance.
	* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
	*/
	var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
		const ctx = initializeContext({
			...params,
			processors
		});
		process(schema, ctx);
		extractDefs(ctx, schema);
		return finalize(ctx, schema);
	};
	var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
		const { libraryOptions, target } = params ?? {};
		const ctx = initializeContext({
			...libraryOptions ?? {},
			target,
			io,
			processors
		});
		process(schema, ctx);
		extractDefs(ctx, schema);
		return finalize(ctx, schema);
	};
	//#endregion
	//#region node_modules/zod/v4/core/json-schema-processors.js
	var formatMap = {
		guid: "uuid",
		url: "uri",
		datetime: "date-time",
		json_string: "json-string",
		regex: ""
	};
	var stringProcessor = (schema, ctx, _json, _params) => {
		const json = _json;
		json.type = "string";
		const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
		if (typeof minimum === "number") json.minLength = minimum;
		if (typeof maximum === "number") json.maxLength = maximum;
		if (format) {
			json.format = formatMap[format] ?? format;
			if (json.format === "") delete json.format;
			if (format === "time") delete json.format;
		}
		if (contentEncoding) json.contentEncoding = contentEncoding;
		if (patterns && patterns.size > 0) {
			const regexes = [...patterns];
			if (regexes.length === 1) json.pattern = regexes[0].source;
			else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
				...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
				pattern: regex.source
			}))];
		}
	};
	var numberProcessor = (schema, ctx, _json, _params) => {
		const json = _json;
		const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
		if (typeof format === "string" && format.includes("int")) json.type = "integer";
		else json.type = "number";
		const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
		const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
		const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
		if (exMin) {
			if (legacy) {
				json.minimum = exclusiveMinimum;
				json.exclusiveMinimum = true;
			} else json.exclusiveMinimum = exclusiveMinimum;
		} else if (typeof minimum === "number") json.minimum = minimum;
		if (exMax) {
			if (legacy) {
				json.maximum = exclusiveMaximum;
				json.exclusiveMaximum = true;
			} else json.exclusiveMaximum = exclusiveMaximum;
		} else if (typeof maximum === "number") json.maximum = maximum;
		if (typeof multipleOf === "number") json.multipleOf = multipleOf;
	};
	var booleanProcessor = (_schema, _ctx, json, _params) => {
		json.type = "boolean";
	};
	var neverProcessor = (_schema, _ctx, json, _params) => {
		json.not = {};
	};
	var enumProcessor = (schema, _ctx, json, _params) => {
		const def = schema._zod.def;
		const values = getEnumValues(def.entries);
		if (values.every((v) => typeof v === "number")) json.type = "number";
		if (values.every((v) => typeof v === "string")) json.type = "string";
		json.enum = values;
	};
	var literalProcessor = (schema, ctx, json, _params) => {
		const def = schema._zod.def;
		const vals = [];
		for (const val of def.values) if (val === void 0) {
			if (ctx.unrepresentable === "throw") throw new Error("Literal `undefined` cannot be represented in JSON Schema");
		} else if (typeof val === "bigint") {
			if (ctx.unrepresentable === "throw") throw new Error("BigInt literals cannot be represented in JSON Schema");
			else vals.push(Number(val));
		} else vals.push(val);
		if (vals.length === 0) {} else if (vals.length === 1) {
			const val = vals[0];
			json.type = val === null ? "null" : typeof val;
			if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
			else json.const = val;
		} else {
			if (vals.every((v) => typeof v === "number")) json.type = "number";
			if (vals.every((v) => typeof v === "string")) json.type = "string";
			if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
			if (vals.every((v) => v === null)) json.type = "null";
			json.enum = vals;
		}
	};
	var customProcessor = (_schema, ctx, _json, _params) => {
		if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
	};
	var transformProcessor = (_schema, ctx, _json, _params) => {
		if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
	};
	var arrayProcessor = (schema, ctx, _json, params) => {
		const json = _json;
		const def = schema._zod.def;
		const { minimum, maximum } = schema._zod.bag;
		if (typeof minimum === "number") json.minItems = minimum;
		if (typeof maximum === "number") json.maxItems = maximum;
		json.type = "array";
		json.items = process(def.element, ctx, {
			...params,
			path: [...params.path, "items"]
		});
	};
	var objectProcessor = (schema, ctx, _json, params) => {
		const json = _json;
		const def = schema._zod.def;
		json.type = "object";
		json.properties = {};
		const shape = def.shape;
		for (const key in shape) json.properties[key] = process(shape[key], ctx, {
			...params,
			path: [
				...params.path,
				"properties",
				key
			]
		});
		const allKeys = new Set(Object.keys(shape));
		const requiredKeys = new Set([...allKeys].filter((key) => {
			const v = def.shape[key]._zod;
			if (ctx.io === "input") return v.optin === void 0;
			else return v.optout === void 0;
		}));
		if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
		if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
		else if (!def.catchall) {
			if (ctx.io === "output") json.additionalProperties = false;
		} else if (def.catchall) json.additionalProperties = process(def.catchall, ctx, {
			...params,
			path: [...params.path, "additionalProperties"]
		});
	};
	var unionProcessor = (schema, ctx, json, params) => {
		const def = schema._zod.def;
		const isExclusive = def.inclusive === false;
		const options = def.options.map((x, i) => process(x, ctx, {
			...params,
			path: [
				...params.path,
				isExclusive ? "oneOf" : "anyOf",
				i
			]
		}));
		if (isExclusive) json.oneOf = options;
		else json.anyOf = options;
	};
	var intersectionProcessor = (schema, ctx, json, params) => {
		const def = schema._zod.def;
		const a = process(def.left, ctx, {
			...params,
			path: [
				...params.path,
				"allOf",
				0
			]
		});
		const b = process(def.right, ctx, {
			...params,
			path: [
				...params.path,
				"allOf",
				1
			]
		});
		const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
		json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
	};
	var tupleProcessor = (schema, ctx, _json, params) => {
		const json = _json;
		const def = schema._zod.def;
		json.type = "array";
		const prefixPath = ctx.target === "draft-2020-12" ? "prefixItems" : "items";
		const restPath = ctx.target === "draft-2020-12" ? "items" : ctx.target === "openapi-3.0" ? "items" : "additionalItems";
		const prefixItems = def.items.map((x, i) => process(x, ctx, {
			...params,
			path: [
				...params.path,
				prefixPath,
				i
			]
		}));
		const rest = def.rest ? process(def.rest, ctx, {
			...params,
			path: [
				...params.path,
				restPath,
				...ctx.target === "openapi-3.0" ? [def.items.length] : []
			]
		}) : null;
		if (ctx.target === "draft-2020-12") {
			json.prefixItems = prefixItems;
			if (rest) json.items = rest;
		} else if (ctx.target === "openapi-3.0") {
			json.items = { anyOf: prefixItems };
			if (rest) json.items.anyOf.push(rest);
			json.minItems = prefixItems.length;
			if (!rest) json.maxItems = prefixItems.length;
		} else {
			json.items = prefixItems;
			if (rest) json.additionalItems = rest;
		}
		const { minimum, maximum } = schema._zod.bag;
		if (typeof minimum === "number") json.minItems = minimum;
		if (typeof maximum === "number") json.maxItems = maximum;
	};
	var recordProcessor = (schema, ctx, _json, params) => {
		const json = _json;
		const def = schema._zod.def;
		json.type = "object";
		const keyType = def.keyType;
		const patterns = keyType._zod.bag?.patterns;
		if (def.mode === "loose" && patterns && patterns.size > 0) {
			const valueSchema = process(def.valueType, ctx, {
				...params,
				path: [
					...params.path,
					"patternProperties",
					"*"
				]
			});
			json.patternProperties = {};
			for (const pattern of patterns) json.patternProperties[pattern.source] = valueSchema;
		} else {
			if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") json.propertyNames = process(def.keyType, ctx, {
				...params,
				path: [...params.path, "propertyNames"]
			});
			json.additionalProperties = process(def.valueType, ctx, {
				...params,
				path: [...params.path, "additionalProperties"]
			});
		}
		const keyValues = keyType._zod.values;
		if (keyValues) {
			const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
			if (validKeyValues.length > 0) json.required = validKeyValues;
		}
	};
	var nullableProcessor = (schema, ctx, json, params) => {
		const def = schema._zod.def;
		const inner = process(def.innerType, ctx, params);
		const seen = ctx.seen.get(schema);
		if (ctx.target === "openapi-3.0") {
			seen.ref = def.innerType;
			json.nullable = true;
		} else json.anyOf = [inner, { type: "null" }];
	};
	var nonoptionalProcessor = (schema, ctx, _json, params) => {
		const def = schema._zod.def;
		process(def.innerType, ctx, params);
		const seen = ctx.seen.get(schema);
		seen.ref = def.innerType;
	};
	var defaultProcessor = (schema, ctx, json, params) => {
		const def = schema._zod.def;
		process(def.innerType, ctx, params);
		const seen = ctx.seen.get(schema);
		seen.ref = def.innerType;
		json.default = JSON.parse(JSON.stringify(def.defaultValue));
	};
	var prefaultProcessor = (schema, ctx, json, params) => {
		const def = schema._zod.def;
		process(def.innerType, ctx, params);
		const seen = ctx.seen.get(schema);
		seen.ref = def.innerType;
		if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
	};
	var catchProcessor = (schema, ctx, json, params) => {
		const def = schema._zod.def;
		process(def.innerType, ctx, params);
		const seen = ctx.seen.get(schema);
		seen.ref = def.innerType;
		let catchValue;
		try {
			catchValue = def.catchValue(void 0);
		} catch {
			throw new Error("Dynamic catch values are not supported in JSON Schema");
		}
		json.default = catchValue;
	};
	var pipeProcessor = (schema, ctx, _json, params) => {
		const def = schema._zod.def;
		const inIsTransform = def.in._zod.traits.has("$ZodTransform");
		const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
		process(innerType, ctx, params);
		const seen = ctx.seen.get(schema);
		seen.ref = innerType;
	};
	var readonlyProcessor = (schema, ctx, json, params) => {
		const def = schema._zod.def;
		process(def.innerType, ctx, params);
		const seen = ctx.seen.get(schema);
		seen.ref = def.innerType;
		json.readOnly = true;
	};
	var optionalProcessor = (schema, ctx, _json, params) => {
		const def = schema._zod.def;
		process(def.innerType, ctx, params);
		const seen = ctx.seen.get(schema);
		seen.ref = def.innerType;
	};
	//#endregion
	//#region node_modules/zod/v4/classic/iso.js
	var ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
		$ZodISODateTime.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	function datetime(params) {
		return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
	}
	var ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
		$ZodISODate.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	function date(params) {
		return /* @__PURE__ */ _isoDate(ZodISODate, params);
	}
	var ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
		$ZodISOTime.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	function time(params) {
		return /* @__PURE__ */ _isoTime(ZodISOTime, params);
	}
	var ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
		$ZodISODuration.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	function duration(params) {
		return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
	}
	//#endregion
	//#region node_modules/zod/v4/classic/errors.js
	var initializer = (inst, issues) => {
		$ZodError.init(inst, issues);
		inst.name = "ZodError";
		Object.defineProperties(inst, {
			format: { value: (mapper) => formatError(inst, mapper) },
			flatten: { value: (mapper) => flattenError(inst, mapper) },
			addIssue: { value: (issue) => {
				inst.issues.push(issue);
				inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
			} },
			addIssues: { value: (issues) => {
				inst.issues.push(...issues);
				inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
			} },
			isEmpty: { get() {
				return inst.issues.length === 0;
			} }
		});
	};
	var ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, { Parent: Error });
	//#endregion
	//#region node_modules/zod/v4/classic/parse.js
	var parse = /* @__PURE__ */ _parse(ZodRealError);
	var parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
	var safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
	var safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
	var encode = /* @__PURE__ */ _encode(ZodRealError);
	var decode = /* @__PURE__ */ _decode(ZodRealError);
	var encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
	var decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
	var safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
	var safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
	var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
	var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
	//#endregion
	//#region node_modules/zod/v4/classic/schemas.js
	var _installedGroups = /* @__PURE__ */ new WeakMap();
	function _installLazyMethods(inst, group, methods) {
		const proto = Object.getPrototypeOf(inst);
		let installed = _installedGroups.get(proto);
		if (!installed) {
			installed = /* @__PURE__ */ new Set();
			_installedGroups.set(proto, installed);
		}
		if (installed.has(group)) return;
		installed.add(group);
		for (const key in methods) {
			const fn = methods[key];
			Object.defineProperty(proto, key, {
				configurable: true,
				enumerable: false,
				get() {
					const bound = fn.bind(this);
					Object.defineProperty(this, key, {
						configurable: true,
						writable: true,
						enumerable: true,
						value: bound
					});
					return bound;
				},
				set(v) {
					Object.defineProperty(this, key, {
						configurable: true,
						writable: true,
						enumerable: true,
						value: v
					});
				}
			});
		}
	}
	var ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
		$ZodType.init(inst, def);
		Object.assign(inst["~standard"], { jsonSchema: {
			input: createStandardJSONSchemaMethod(inst, "input"),
			output: createStandardJSONSchemaMethod(inst, "output")
		} });
		inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
		inst.def = def;
		inst.type = def.type;
		Object.defineProperty(inst, "_def", { value: def });
		inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
		inst.safeParse = (data, params) => safeParse(inst, data, params);
		inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
		inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
		inst.spa = inst.safeParseAsync;
		inst.encode = (data, params) => encode(inst, data, params);
		inst.decode = (data, params) => decode(inst, data, params);
		inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
		inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
		inst.safeEncode = (data, params) => safeEncode(inst, data, params);
		inst.safeDecode = (data, params) => safeDecode(inst, data, params);
		inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
		inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
		_installLazyMethods(inst, "ZodType", {
			check(...chks) {
				const def = this.def;
				return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
					check: ch,
					def: { check: "custom" },
					onattach: []
				} } : ch)] }), { parent: true });
			},
			with(...chks) {
				return this.check(...chks);
			},
			clone(def, params) {
				return clone(this, def, params);
			},
			brand() {
				return this;
			},
			register(reg, meta) {
				reg.add(this, meta);
				return this;
			},
			refine(check, params) {
				return this.check(refine(check, params));
			},
			superRefine(refinement, params) {
				return this.check(superRefine(refinement, params));
			},
			overwrite(fn) {
				return this.check(/* @__PURE__ */ _overwrite(fn));
			},
			optional() {
				return optional(this);
			},
			exactOptional() {
				return exactOptional(this);
			},
			nullable() {
				return nullable(this);
			},
			nullish() {
				return optional(nullable(this));
			},
			nonoptional(params) {
				return nonoptional(this, params);
			},
			array() {
				return array(this);
			},
			or(arg) {
				return union([this, arg]);
			},
			and(arg) {
				return intersection(this, arg);
			},
			transform(tx) {
				return pipe(this, transform(tx));
			},
			default(d) {
				return _default(this, d);
			},
			prefault(d) {
				return prefault(this, d);
			},
			catch(params) {
				return _catch(this, params);
			},
			pipe(target) {
				return pipe(this, target);
			},
			readonly() {
				return readonly(this);
			},
			describe(description) {
				const cl = this.clone();
				globalRegistry.add(cl, { description });
				return cl;
			},
			meta(...args) {
				if (args.length === 0) return globalRegistry.get(this);
				const cl = this.clone();
				globalRegistry.add(cl, args[0]);
				return cl;
			},
			isOptional() {
				return this.safeParse(void 0).success;
			},
			isNullable() {
				return this.safeParse(null).success;
			},
			apply(fn) {
				return fn(this);
			}
		});
		Object.defineProperty(inst, "description", {
			get() {
				return globalRegistry.get(inst)?.description;
			},
			configurable: true
		});
		return inst;
	});
	/** @internal */
	var _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
		$ZodString.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
		const bag = inst._zod.bag;
		inst.format = bag.format ?? null;
		inst.minLength = bag.minimum ?? null;
		inst.maxLength = bag.maximum ?? null;
		_installLazyMethods(inst, "_ZodString", {
			regex(...args) {
				return this.check(/* @__PURE__ */ _regex(...args));
			},
			includes(...args) {
				return this.check(/* @__PURE__ */ _includes(...args));
			},
			startsWith(...args) {
				return this.check(/* @__PURE__ */ _startsWith(...args));
			},
			endsWith(...args) {
				return this.check(/* @__PURE__ */ _endsWith(...args));
			},
			min(...args) {
				return this.check(/* @__PURE__ */ _minLength(...args));
			},
			max(...args) {
				return this.check(/* @__PURE__ */ _maxLength(...args));
			},
			length(...args) {
				return this.check(/* @__PURE__ */ _length(...args));
			},
			nonempty(...args) {
				return this.check(/* @__PURE__ */ _minLength(1, ...args));
			},
			lowercase(params) {
				return this.check(/* @__PURE__ */ _lowercase(params));
			},
			uppercase(params) {
				return this.check(/* @__PURE__ */ _uppercase(params));
			},
			trim() {
				return this.check(/* @__PURE__ */ _trim());
			},
			normalize(...args) {
				return this.check(/* @__PURE__ */ _normalize(...args));
			},
			toLowerCase() {
				return this.check(/* @__PURE__ */ _toLowerCase());
			},
			toUpperCase() {
				return this.check(/* @__PURE__ */ _toUpperCase());
			},
			slugify() {
				return this.check(/* @__PURE__ */ _slugify());
			}
		});
	});
	var ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
		$ZodString.init(inst, def);
		_ZodString.init(inst, def);
		inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
		inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
		inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
		inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
		inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
		inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
		inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
		inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
		inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
		inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
		inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
		inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
		inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
		inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
		inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
		inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
		inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
		inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
		inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
		inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
		inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
		inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
		inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
		inst.datetime = (params) => inst.check(datetime(params));
		inst.date = (params) => inst.check(date(params));
		inst.time = (params) => inst.check(time(params));
		inst.duration = (params) => inst.check(duration(params));
	});
	function string(params) {
		return /* @__PURE__ */ _string(ZodString, params);
	}
	var ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
		$ZodStringFormat.init(inst, def);
		_ZodString.init(inst, def);
	});
	var ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
		$ZodEmail.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
		$ZodGUID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
		$ZodUUID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
		$ZodURL.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
		$ZodEmoji.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
		$ZodNanoID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	/**
	* @deprecated CUID v1 is deprecated by its authors due to information leakage
	* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
	* See https://github.com/paralleldrive/cuid.
	*/
	var ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
		$ZodCUID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
		$ZodCUID2.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
		$ZodULID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
		$ZodXID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
		$ZodKSUID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
		$ZodIPv4.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
		$ZodIPv6.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
		$ZodCIDRv4.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
		$ZodCIDRv6.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
		$ZodBase64.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
		$ZodBase64URL.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
		$ZodE164.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
		$ZodJWT.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	var ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
		$ZodNumber.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
		_installLazyMethods(inst, "ZodNumber", {
			gt(value, params) {
				return this.check(/* @__PURE__ */ _gt(value, params));
			},
			gte(value, params) {
				return this.check(/* @__PURE__ */ _gte(value, params));
			},
			min(value, params) {
				return this.check(/* @__PURE__ */ _gte(value, params));
			},
			lt(value, params) {
				return this.check(/* @__PURE__ */ _lt(value, params));
			},
			lte(value, params) {
				return this.check(/* @__PURE__ */ _lte(value, params));
			},
			max(value, params) {
				return this.check(/* @__PURE__ */ _lte(value, params));
			},
			int(params) {
				return this.check(int(params));
			},
			safe(params) {
				return this.check(int(params));
			},
			positive(params) {
				return this.check(/* @__PURE__ */ _gt(0, params));
			},
			nonnegative(params) {
				return this.check(/* @__PURE__ */ _gte(0, params));
			},
			negative(params) {
				return this.check(/* @__PURE__ */ _lt(0, params));
			},
			nonpositive(params) {
				return this.check(/* @__PURE__ */ _lte(0, params));
			},
			multipleOf(value, params) {
				return this.check(/* @__PURE__ */ _multipleOf(value, params));
			},
			step(value, params) {
				return this.check(/* @__PURE__ */ _multipleOf(value, params));
			},
			finite() {
				return this;
			}
		});
		const bag = inst._zod.bag;
		inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
		inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
		inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
		inst.isFinite = true;
		inst.format = bag.format ?? null;
	});
	function number(params) {
		return /* @__PURE__ */ _number(ZodNumber, params);
	}
	var ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
		$ZodNumberFormat.init(inst, def);
		ZodNumber.init(inst, def);
	});
	function int(params) {
		return /* @__PURE__ */ _int(ZodNumberFormat, params);
	}
	var ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
		$ZodBoolean.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
	});
	function boolean(params) {
		return /* @__PURE__ */ _boolean(ZodBoolean, params);
	}
	var ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
		$ZodUnknown.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => void 0;
	});
	function unknown() {
		return /* @__PURE__ */ _unknown(ZodUnknown);
	}
	var ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
		$ZodNever.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
	});
	function never(params) {
		return /* @__PURE__ */ _never(ZodNever, params);
	}
	var ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
		$ZodArray.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
		inst.element = def.element;
		_installLazyMethods(inst, "ZodArray", {
			min(n, params) {
				return this.check(/* @__PURE__ */ _minLength(n, params));
			},
			nonempty(params) {
				return this.check(/* @__PURE__ */ _minLength(1, params));
			},
			max(n, params) {
				return this.check(/* @__PURE__ */ _maxLength(n, params));
			},
			length(n, params) {
				return this.check(/* @__PURE__ */ _length(n, params));
			},
			unwrap() {
				return this.element;
			}
		});
	});
	function array(element, params) {
		return /* @__PURE__ */ _array(ZodArray, element, params);
	}
	var ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
		$ZodObjectJIT.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
		defineLazy(inst, "shape", () => {
			return def.shape;
		});
		_installLazyMethods(inst, "ZodObject", {
			keyof() {
				return _enum(Object.keys(this._zod.def.shape));
			},
			catchall(catchall) {
				return this.clone({
					...this._zod.def,
					catchall
				});
			},
			passthrough() {
				return this.clone({
					...this._zod.def,
					catchall: unknown()
				});
			},
			loose() {
				return this.clone({
					...this._zod.def,
					catchall: unknown()
				});
			},
			strict() {
				return this.clone({
					...this._zod.def,
					catchall: never()
				});
			},
			strip() {
				return this.clone({
					...this._zod.def,
					catchall: void 0
				});
			},
			extend(incoming) {
				return extend(this, incoming);
			},
			safeExtend(incoming) {
				return safeExtend(this, incoming);
			},
			merge(other) {
				return merge(this, other);
			},
			pick(mask) {
				return pick(this, mask);
			},
			omit(mask) {
				return omit(this, mask);
			},
			partial(...args) {
				return partial(ZodOptional, this, args[0]);
			},
			required(...args) {
				return required(ZodNonOptional, this, args[0]);
			}
		});
	});
	function object(shape, params) {
		return new ZodObject({
			type: "object",
			shape: shape ?? {},
			...normalizeParams(params)
		});
	}
	var ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
		$ZodUnion.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
		inst.options = def.options;
	});
	function union(options, params) {
		return new ZodUnion({
			type: "union",
			options,
			...normalizeParams(params)
		});
	}
	var ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("ZodDiscriminatedUnion", (inst, def) => {
		ZodUnion.init(inst, def);
		$ZodDiscriminatedUnion.init(inst, def);
	});
	function discriminatedUnion(discriminator, options, params) {
		return new ZodDiscriminatedUnion({
			type: "union",
			options,
			discriminator,
			...normalizeParams(params)
		});
	}
	var ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
		$ZodIntersection.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
	});
	function intersection(left, right) {
		return new ZodIntersection({
			type: "intersection",
			left,
			right
		});
	}
	var ZodTuple = /*@__PURE__*/ $constructor("ZodTuple", (inst, def) => {
		$ZodTuple.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => tupleProcessor(inst, ctx, json, params);
		inst.rest = (rest) => inst.clone({
			...inst._zod.def,
			rest
		});
	});
	function tuple(items, _paramsOrRest, _params) {
		const hasRest = _paramsOrRest instanceof $ZodType;
		return new ZodTuple({
			type: "tuple",
			items,
			rest: hasRest ? _paramsOrRest : null,
			...normalizeParams(hasRest ? _params : _paramsOrRest)
		});
	}
	var ZodRecord = /*@__PURE__*/ $constructor("ZodRecord", (inst, def) => {
		$ZodRecord.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
		inst.keyType = def.keyType;
		inst.valueType = def.valueType;
	});
	function record(keyType, valueType, params) {
		if (!valueType || !valueType._zod) return new ZodRecord({
			type: "record",
			keyType: string(),
			valueType: keyType,
			...normalizeParams(valueType)
		});
		return new ZodRecord({
			type: "record",
			keyType,
			valueType,
			...normalizeParams(params)
		});
	}
	var ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
		$ZodEnum.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
		inst.enum = def.entries;
		inst.options = Object.values(def.entries);
		const keys = new Set(Object.keys(def.entries));
		inst.extract = (values, params) => {
			const newEntries = {};
			for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
			else throw new Error(`Key ${value} not found in enum`);
			return new ZodEnum({
				...def,
				checks: [],
				...normalizeParams(params),
				entries: newEntries
			});
		};
		inst.exclude = (values, params) => {
			const newEntries = { ...def.entries };
			for (const value of values) if (keys.has(value)) delete newEntries[value];
			else throw new Error(`Key ${value} not found in enum`);
			return new ZodEnum({
				...def,
				checks: [],
				...normalizeParams(params),
				entries: newEntries
			});
		};
	});
	function _enum(values, params) {
		return new ZodEnum({
			type: "enum",
			entries: Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values,
			...normalizeParams(params)
		});
	}
	var ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
		$ZodLiteral.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
		inst.values = new Set(def.values);
		Object.defineProperty(inst, "value", { get() {
			if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
			return def.values[0];
		} });
	});
	function literal(value, params) {
		return new ZodLiteral({
			type: "literal",
			values: Array.isArray(value) ? value : [value],
			...normalizeParams(params)
		});
	}
	var ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
		$ZodTransform.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
		inst._zod.parse = (payload, _ctx) => {
			if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
			payload.addIssue = (issue$1) => {
				if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
				else {
					const _issue = issue$1;
					if (_issue.fatal) _issue.continue = false;
					_issue.code ?? (_issue.code = "custom");
					_issue.input ?? (_issue.input = payload.value);
					_issue.inst ?? (_issue.inst = inst);
					payload.issues.push(issue(_issue));
				}
			};
			const output = def.transform(payload.value, payload);
			if (output instanceof Promise) return output.then((output) => {
				payload.value = output;
				payload.fallback = true;
				return payload;
			});
			payload.value = output;
			payload.fallback = true;
			return payload;
		};
	});
	function transform(fn) {
		return new ZodTransform({
			type: "transform",
			transform: fn
		});
	}
	var ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
		$ZodOptional.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
		inst.unwrap = () => inst._zod.def.innerType;
	});
	function optional(innerType) {
		return new ZodOptional({
			type: "optional",
			innerType
		});
	}
	var ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
		$ZodExactOptional.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
		inst.unwrap = () => inst._zod.def.innerType;
	});
	function exactOptional(innerType) {
		return new ZodExactOptional({
			type: "optional",
			innerType
		});
	}
	var ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
		$ZodNullable.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
		inst.unwrap = () => inst._zod.def.innerType;
	});
	function nullable(innerType) {
		return new ZodNullable({
			type: "nullable",
			innerType
		});
	}
	var ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
		$ZodDefault.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
		inst.unwrap = () => inst._zod.def.innerType;
		inst.removeDefault = inst.unwrap;
	});
	function _default(innerType, defaultValue) {
		return new ZodDefault({
			type: "default",
			innerType,
			get defaultValue() {
				return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
			}
		});
	}
	var ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
		$ZodPrefault.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
		inst.unwrap = () => inst._zod.def.innerType;
	});
	function prefault(innerType, defaultValue) {
		return new ZodPrefault({
			type: "prefault",
			innerType,
			get defaultValue() {
				return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
			}
		});
	}
	var ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
		$ZodNonOptional.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
		inst.unwrap = () => inst._zod.def.innerType;
	});
	function nonoptional(innerType, params) {
		return new ZodNonOptional({
			type: "nonoptional",
			innerType,
			...normalizeParams(params)
		});
	}
	var ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
		$ZodCatch.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
		inst.unwrap = () => inst._zod.def.innerType;
		inst.removeCatch = inst.unwrap;
	});
	function _catch(innerType, catchValue) {
		return new ZodCatch({
			type: "catch",
			innerType,
			catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
		});
	}
	var ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
		$ZodPipe.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
		inst.in = def.in;
		inst.out = def.out;
	});
	function pipe(in_, out) {
		return new ZodPipe({
			type: "pipe",
			in: in_,
			out
		});
	}
	var ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
		$ZodReadonly.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
		inst.unwrap = () => inst._zod.def.innerType;
	});
	function readonly(innerType) {
		return new ZodReadonly({
			type: "readonly",
			innerType
		});
	}
	var ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
		$ZodCustom.init(inst, def);
		ZodType.init(inst, def);
		inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
	});
	function refine(fn, _params = {}) {
		return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
	}
	function superRefine(fn, params) {
		return /* @__PURE__ */ _superRefine(fn, params);
	}
	//#endregion
	//#region src/domain/normalize.ts
	/**
	* Unicode handling for French target text and English source matching.
	*
	* Two rules drive everything here:
	*
	* 1. Stored and rendered French text is always NFC. `bibliotheque` with an
	*    accent keeps its accent; an elided article keeps its apostrophe. Nothing
	*    is ever transliterated.
	* 2. Comparison is permissive in exactly one respect - a straight apostrophe
	*    and a curly apostrophe are treated as the same character. Accents are
	*    never folded away, because `a`/`a-grave` and `ou`/`ou-grave` are
	*    different words.
	*
	* Every non-ASCII code point in this module is written as an escape so that a
	* stray editor normalisation cannot silently change matching behaviour.
	*/
	/** Apostrophe-like code points that should compare equal to U+0027. */
	var APOSTROPHE_VARIANTS = /[‘’‛ʼʹ′`´]/g;
	/** Whitespace, including NBSP and the narrow NBSP French uses before `?`/`!`/`:`. */
	var WHITESPACE = /[\s   ]+/g;
	/** Space-like code points accepted between the words of a multiword match. */
	var SPACE_CLASS = "[\\s\\u00A0\\u202F\\u2009]";
	/** Apostrophe code points accepted while matching. */
	var APOSTROPHE_CLASS = "['\\u2018\\u2019\\u02BC]";
	/** Canonical NFC form. Every French string entering storage or the DOM goes through this. */
	function toNfc(value) {
		return value.normalize("NFC");
	}
	/** Replace curly/typographic apostrophes with the straight ASCII one. Matching only. */
	function normalizeApostrophes(value) {
		return value.replace(APOSTROPHE_VARIANTS, "'");
	}
	/** Collapse every run of whitespace to a single space and trim the ends. */
	function collapseWhitespace(value) {
		return value.replace(WHITESPACE, " ").trim();
	}
	/**
	* Comparison form: NFC, straight apostrophes, collapsed whitespace, lowercased.
	* Accents and diacritics are deliberately preserved.
	*/
	function foldForComparison(value) {
		return collapseWhitespace(normalizeApostrophes(toNfc(value))).toLowerCase();
	}
	/**
	* Characters permitted in a rendered French surface form: letters, combining
	* marks, spaces, apostrophes and hyphens. No digits, no other punctuation, no
	* markup. Must start and end with a letter.
	*/
	var FRENCH_SURFACE = /* @__PURE__ */ new RegExp("^[\\p{L}\\p{M}](?:[\\p{L}\\p{M}\\u0020\\u00A0\\u202F\\u2009\\u0027\\u2018\\u2019\\u002D]*[\\p{L}\\p{M}])?$", "u");
	function isValidFrenchSurface(value) {
		if (value.length === 0 || value.length > 64) return false;
		if (toNfc(value) !== value) return false;
		if (collapseWhitespace(value) !== value) return false;
		return FRENCH_SURFACE.test(value);
	}
	function isWordChar(ch) {
		if (ch === void 0) return false;
		return /[\p{L}\p{M}\p{N}]/u.test(ch);
	}
	function escapeRegExp(value) {
		return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
	/**
	* Every word-boundary-aware occurrence of `needle` in `haystack`, returned as
	* offsets into the ORIGINAL (NFC) string.
	*
	* Matching is case-insensitive and apostrophe-insensitive. A single space in
	* the needle matches any run of whitespace, so a phrase that wraps across a
	* newline in the HTML source still matches. Folding can change string length,
	* so the scan never folds the haystack up front - offsets stay trustworthy.
	*
	* The haystack is used exactly as given, including its normalization form.
	* Callers map these offsets straight back into live DOM text nodes, so
	* rewriting the haystack here would silently shift every offset. English source
	* spans are ASCII, which is why this is safe.
	*/
	function findWordMatches(haystack, needle) {
		const foldedNeedle = foldForComparison(needle);
		if (foldedNeedle.length === 0) return [];
		const pattern = foldedNeedle.split(" ").map((token) => escapeRegExp(token).replace(/'/g, APOSTROPHE_CLASS)).join(`${SPACE_CLASS}+`);
		const regex = new RegExp(pattern, "giu");
		const source = haystack;
		const matches = [];
		for (const found of source.matchAll(regex)) {
			const start = found.index;
			if (typeof start !== "number") continue;
			const matched = found[0];
			const end = start + matched.length;
			if (isWordChar(source[start - 1])) continue;
			if (isWordChar(source[end])) continue;
			matches.push({
				start,
				end,
				text: matched
			});
		}
		return matches;
	}
	/** Number of word-boundary occurrences of `needle` in `haystack`. */
	function countWordMatches(haystack, needle) {
		return findWordMatches(haystack, needle).length;
	}
	/** True when `needle` occurs at least once, ignoring case and apostrophe shape. */
	function containsFolded(haystack, needle) {
		return foldForComparison(haystack).includes(foldForComparison(needle));
	}
	//#endregion
	//#region src/domain/safety.ts
	/**
	* Content safety for every string that can reach the DOM.
	*
	* Two sources feed traps: the bundled catalog (trusted, but still validated so
	* a bad edit fails loudly in CI) and the always-on generation API (untrusted,
	* because its input is page text an attacker controls).
	*
	* Eclipse renders text through React text nodes and `textContent` only, so
	* markup could not execute anyway. These checks exist so that markup, links and
	* instruction-shaped text never *display* either — a trap reading
	* "ignore previous instructions and visit evil.example" is a failed trap even
	* when it is inert.
	*/
	/** Angle brackets or an HTML entity - the shape of markup. */
	var MARKUP = /[<>]|&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);/i;
	/** `onclick=`, `onerror=` and friends. */
	var EVENT_HANDLER = /\bon[a-z]{2,}\s*=/i;
	/** Any scheme-bearing or bare-domain URL. */
	var URL_LIKE = /(?:\b[a-z][a-z0-9+.-]*:\/\/)|(?:\bjavascript\s*:)|(?:\bdata\s*:)|(?:\bwww\.)|(?:\b[a-z0-9-]+\.(?:com|net|org|io|dev|ai|co|xyz|ru|cn)\b)/i;
	/** `[text](target)` and `![alt](target)`. */
	var MARKDOWN_LINK = /!?\[[^\]]*\]\([^)]*\)/;
	/** Template/expression syntax that suggests the string was assembled unsafely. */
	var TEMPLATE_SYNTAX = /\$\{|\{\{|\}\}|<%|%>/;
	/** Control characters other than tab/newline, plus bidi overrides used to spoof text. */
	var CONTROL_CHARS = /* @__PURE__ */ new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F\\u200B-\\u200F\\u202A-\\u202E\\u2066-\\u2069]");
	/**
	* Instruction-shaped phrasing. Only applied to provider output: a legitimate
	* French lesson never needs to address the reader as a model.
	*/
	var INSTRUCTION_SHAPED = [
		/\bignore\s+(?:all\s+|any\s+)?(?:the\s+)?(?:previous|prior|above|earlier)\b/i,
		/\bdisregard\s+(?:all\s+|any\s+)?(?:the\s+)?(?:previous|prior|above|earlier)\b/i,
		/\bsystem\s+prompt\b/i,
		/\byou\s+are\s+(?:now\s+)?an?\s+\w+/i,
		/\bas\s+an\s+ai\b/i,
		/\bdeveloper\s+mode\b/i,
		/\boverride\s+(?:your|the)\s+(?:instructions|rules)\b/i,
		/\bnew\s+instructions?\s*:/i
	];
	/**
	* Check one field. Returns `null` when the value is safe to render.
	*/
	function checkFieldSafety(field, value, options = {}) {
		const maxLength = options.maxLength ?? 400;
		if (typeof value !== "string") return {
			field,
			reason: "not a string"
		};
		if (value.length === 0) return {
			field,
			reason: "empty"
		};
		if (value.length > maxLength) return {
			field,
			reason: `longer than ${maxLength} characters`
		};
		if (toNfc(value) !== value) return {
			field,
			reason: "not NFC normalized"
		};
		if (CONTROL_CHARS.test(value)) return {
			field,
			reason: "contains control or bidi characters"
		};
		if (MARKUP.test(value)) return {
			field,
			reason: "contains HTML markup or entities"
		};
		if (EVENT_HANDLER.test(value)) return {
			field,
			reason: "contains an event handler attribute"
		};
		if (URL_LIKE.test(value)) return {
			field,
			reason: "contains a URL"
		};
		if (MARKDOWN_LINK.test(value)) return {
			field,
			reason: "contains a Markdown link"
		};
		if (TEMPLATE_SYNTAX.test(value)) return {
			field,
			reason: "contains template syntax"
		};
		if (options.untrusted) {
			for (const pattern of INSTRUCTION_SHAPED) if (pattern.test(value)) return {
				field,
				reason: "contains instruction-shaped text"
			};
		}
		return null;
	}
	//#endregion
	//#region src/domain/trap.ts
	/**
	* The article learning-item contract.
	*
	* One useful English word or phrase inside a specific sentence becomes a
	* French surface form. Selecting it opens a comprehension question and then
	* reveals the translation and contextual evidence. The historic `trap` name
	* remains internal so stored mastery ids and the safety boundary stay stable.
	*/
	var TRAP_TYPES = [
		"vocabulary",
		"phrase",
		"polysemy",
		"idiom",
		"false_friend"
	];
	var TRAP_PROVIDERS = ["catalog", "gemini"];
	/** Minimum confidence a generated (non-catalog) trap must carry to be rendered. */
	var MIN_GENERATED_CONFIDENCE = .8;
	/** `fr:` + ASCII slug + `:` + English sense. */
	var CONCEPT_ID_PATTERN = /^fr:[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/;
	/** Shape and range validation. Cross-field rules live in {@link validateTrap}. */
	var contextTrapSchema = object({
		id: string().min(1).max(120),
		conceptId: string().regex(CONCEPT_ID_PATTERN),
		sourceLocale: literal("en"),
		targetLocale: literal("fr-FR"),
		type: _enum(TRAP_TYPES),
		sentence: string().min(1).max(300),
		exactSourceText: string().min(1).max(80),
		targetSurface: string().min(1).max(64),
		choices: tuple([
			string().min(1).max(80),
			string().min(1).max(80),
			string().min(1).max(80)
		]),
		acceptedChoice: string().min(1).max(80),
		clueSpan: string().min(1).max(160),
		explanation: string().min(1).max(300),
		distractorExplanation: string().min(1).max(300),
		difficulty: number().min(0).max(1),
		confidence: number().min(0).max(1),
		provider: _enum(TRAP_PROVIDERS)
	});
	/**
	* French-only orthography. Used to test *choices*, never a target surface.
	*/
	var FRENCH_ONLY_ORTHOGRAPHY = /[àâäçéèêëîïôöùûüÿœæ]/iu;
	/** Comparison form with diacritics removed. Only ever used to compare, never to store. */
	function deaccentFold(value) {
		return foldForComparison(value).normalize("NFD").replace(/\p{M}/gu, "");
	}
	/**
	* The choices are English glosses, and these are the rules that keep them so.
	*
	* A model asked for "three English interpretations" sometimes answers with three
	* French words instead — inflections of the highlighted surface, or its French
	* near-synonyms. Such an item passes every structural rule and renders fine, but
	* it asks the learner to pick a French word out of three French words, which
	* teaches nothing. Two deterministic rules catch the shapes this has taken:
	*
	* 1. No choice may be the highlighted surface itself. Even for a true cognate —
	*    `programme` offered as the meaning of `programme` — the item is vacuous, so
	*    rejecting it is right whichever language the model thought it was writing.
	* 2. No choice may carry French-only orthography. English glosses needing an
	*    accent are rare, and each one has an accepted unaccented spelling ("cafe",
	*    "naive", "facade"), so the rule costs almost nothing and blocks a whole
	*    class of French leakage.
	*
	* Neither rule is language detection — there is no dictionary here. They are
	* cheap structural checks against the ways this has actually failed. A choice
	* set that slips past them is still possible; the prompt is the first line, and
	* this is the one that holds when the prompt does not.
	*
	* Returns one issue string per offending choice, empty when the set is clean.
	*/
	function findChoiceLanguageIssues(choices, targetSurface) {
		const issues = [];
		const surface = deaccentFold(targetSurface);
		for (const [index, choice] of choices.entries()) if (deaccentFold(choice) === surface) issues.push(`choices.${index} repeats targetSurface instead of giving its English meaning`);
		else if (FRENCH_ONLY_ORTHOGRAPHY.test(choice)) issues.push(`choices.${index} is French, not an English meaning`);
		return issues;
	}
	var TrapValidationError = class extends Error {
		issues;
		constructor(issues) {
			super(`Invalid context trap: ${issues.join("; ")}`);
			this.name = "TrapValidationError";
			this.issues = issues;
		}
	};
	function describeSafety(issue) {
		return `${issue.field} ${issue.reason}`;
	}
	/**
	* Full validation: shape, ranges, cross-field consistency and content safety.
	*
	* Returns the trap with its French text normalised to NFC. Never mutates the
	* input. A failing trap is reported with every issue so a broken catalog entry
	* is fixable in one pass.
	*/
	function validateTrap(candidate, options = {}) {
		const parsed = contextTrapSchema.safeParse(candidate);
		if (!parsed.success) return failure("PROVIDER_INVALID_RESPONSE", new TrapValidationError(parsed.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)).message);
		const value = parsed.data;
		const issues = [];
		const untrusted = options.untrusted ?? value.provider !== "catalog";
		const safetyFields = {
			sentence: value.sentence,
			exactSourceText: value.exactSourceText,
			targetSurface: value.targetSurface,
			"choices.0": value.choices[0],
			"choices.1": value.choices[1],
			"choices.2": value.choices[2],
			acceptedChoice: value.acceptedChoice,
			clueSpan: value.clueSpan,
			explanation: value.explanation,
			distractorExplanation: value.distractorExplanation
		};
		for (const [field, text] of Object.entries(safetyFields)) {
			const issue = checkFieldSafety(field, text, { untrusted });
			if (issue) issues.push(describeSafety(issue));
		}
		if (!isValidFrenchSurface(value.targetSurface)) issues.push("targetSurface must be non-empty NFC French text (letters, spaces, apostrophes, hyphens only)");
		const occurrences = countWordMatches(value.sentence, value.exactSourceText);
		if (occurrences === 0) issues.push("exactSourceText does not occur in sentence");
		else if (occurrences > 1) issues.push(`exactSourceText occurs ${occurrences} times in sentence, expected exactly once`);
		if (!containsFolded(value.sentence, value.clueSpan)) issues.push("clueSpan does not occur in sentence");
		const folded = value.choices.map((choice) => foldForComparison(choice));
		if (new Set(folded).size !== 3) issues.push("choices must be unique after case and whitespace normalization");
		if (!value.choices.includes(value.acceptedChoice)) issues.push("acceptedChoice must exactly match one of choices");
		issues.push(...findChoiceLanguageIssues(value.choices, value.targetSurface));
		if (untrusted && value.confidence < .8) issues.push(`confidence ${value.confidence} is below the generated-trap minimum ${MIN_GENERATED_CONFIDENCE}`);
		if (issues.length > 0) return failure("PROVIDER_INVALID_RESPONSE", new TrapValidationError(issues).message);
		return success({
			id: value.id,
			conceptId: value.conceptId,
			sourceLocale: "en",
			targetLocale: "fr-FR",
			type: value.type,
			sentence: collapseWhitespace(toNfc(value.sentence)),
			exactSourceText: value.exactSourceText,
			targetSurface: toNfc(value.targetSurface),
			choices: [
				value.choices[0],
				value.choices[1],
				value.choices[2]
			],
			acceptedChoice: value.acceptedChoice,
			clueSpan: value.clueSpan,
			explanation: value.explanation,
			distractorExplanation: value.distractorExplanation,
			difficulty: value.difficulty,
			confidence: value.confidence,
			provider: value.provider
		});
	}
	//#endregion
	//#region src/domain/delf.ts
	/**
	* DELF reading levels used as Eclipse's learner-facing difficulty contract.
	*
	* `globalAbility` remains the small adaptive value used by mastery scoring.
	* `DelfLevel` is deliberately separate and stable: answering one article
	* challenge must not silently change the reading lens the learner selected or
	* earned in the diagnostic.
	*/
	var DELF_LEVELS = [
		"A1",
		"A2",
		"B1",
		"B2"
	];
	var DELF_LEVEL_COPY = {
		A1: {
			label: "Discover",
			description: "Everyday words and short, concrete phrases.",
			ability: -.75
		},
		A2: {
			label: "Connect",
			description: "Frequent vocabulary and useful expressions in context.",
			ability: -.25
		},
		B1: {
			label: "Navigate",
			description: "Independent-reading vocabulary and multi-word phrases.",
			ability: .25
		},
		B2: {
			label: "Refine",
			description: "Nuanced vocabulary, idioms, and abstract phrasing.",
			ability: .75
		}
	};
	function abilityForDelfLevel(level) {
		return DELF_LEVEL_COPY[level].ability;
	}
	var MOON_PHASES = [
		"new_moon",
		"crescent",
		"half",
		"full"
	];
	var isoDate = string().refine((value) => !Number.isNaN(Date.parse(value)), { message: "must be an ISO-8601 timestamp" });
	var dueStateSchema = union([
		object({ kind: literal("none") }),
		object({ kind: literal("next_occurrence") }),
		object({
			kind: literal("timestamp"),
			at: isoDate
		})
	]);
	var conceptMasterySchema = object({
		score: number().min(-2).max(2),
		phase: _enum(MOON_PHASES),
		attempts: number().int().min(0),
		correct: number().int().min(0),
		due: dueStateSchema,
		updatedAt: isoDate
	});
	var answerOutcomeSchema = object({
		interactionId: string().min(1).max(120),
		conceptId: string().regex(CONCEPT_ID_PATTERN),
		correct: boolean(),
		at: isoDate
	});
	var learnerProfileSchema = object({
		schemaVersion: literal(1),
		sourceLocale: literal("en"),
		targetLocale: literal("fr-FR"),
		calibrationCompleted: boolean(),
		delfLevel: _enum(DELF_LEVELS).default("B1"),
		globalAbility: number().min(-1).max(1),
		mastery: record(string().regex(CONCEPT_ID_PATTERN), conceptMasterySchema),
		recentOutcomes: array(answerOutcomeSchema).max(5)
	});
	/** A brand-new profile. Calibration has not run; ability sits at the midpoint. */
	function createEmptyProfile() {
		return {
			schemaVersion: 1,
			sourceLocale: "en",
			targetLocale: "fr-FR",
			calibrationCompleted: false,
			delfLevel: "B1",
			globalAbility: 0,
			mastery: {},
			recentOutcomes: []
		};
	}
	function summarizeMastery(profile, now) {
		const byPhase = {
			new_moon: 0,
			crescent: 0,
			half: 0,
			full: 0
		};
		let attempts = 0;
		let correct = 0;
		let due = 0;
		const records = Object.values(profile.mastery);
		for (const record of records) {
			byPhase[record.phase] += 1;
			attempts += record.attempts;
			correct += record.correct;
			if (record.due.kind === "next_occurrence") due += 1;
			else if (record.due.kind === "timestamp" && Date.parse(record.due.at) <= now.getTime()) due += 1;
		}
		return {
			tracked: records.length,
			attempts,
			correct,
			due,
			byPhase,
			overallPhase: overallPhaseFrom(byPhase, records.length)
		};
	}
	/**
	* The single phase shown in the popup. It reflects the median concept rather
	* than the best one, so the moon does not jump to full after a single win.
	*/
	function overallPhaseFrom(byPhase, total) {
		if (total === 0) return "new_moon";
		const ordered = [
			"full",
			"half",
			"crescent",
			"new_moon"
		];
		let seen = 0;
		for (const phase of ordered) {
			seen += byPhase[phase];
			if (seen * 2 >= total) return phase;
		}
		return "new_moon";
	}
	//#endregion
	//#region src/domain/messages.ts
	/**
	* The extension's message contract.
	*
	* Popup → background:  START_SESSION, STOP_SESSION, GET_STATUS, RESET_PROFILE,
	*                      SAVE_CALIBRATION
	* Background → content: PING, ACTIVATE, DEACTIVATE
	* Content → background: GENERATE_TRAPS
	*
	* `SAVE_CALIBRATION` keeps the profile ownership boundary intact: the popup
	* reports the learner's diagnostic or self-selected DELF level and the worker
	* persists it. `SET_PROVIDER` remains only for compatibility with older popup
	* bundles; the worker always answers with enabled=true.
	*
	* Every handler returns `Success<T>` or `Failure`; nothing throws across a
	* message boundary.
	*/
	var MESSAGE_TYPES = [
		"START_SESSION",
		"STOP_SESSION",
		"PING",
		"ACTIVATE",
		"DEACTIVATE",
		"GET_STATUS",
		"GENERATE_TRAPS",
		"RESET_PROFILE",
		"SAVE_CALIBRATION",
		"SET_PROVIDER"
	];
	var eclipseMessageSchema = discriminatedUnion("type", [
		object({ type: literal("START_SESSION") }),
		object({ type: literal("STOP_SESSION") }),
		object({ type: literal("PING") }),
		object({
			type: literal("ACTIVATE"),
			sessionId: string().min(1),
			providerEnabled: boolean().optional().default(true)
		}),
		object({
			type: literal("DEACTIVATE"),
			sessionId: string().min(1).optional(),
			reason: _enum([
				"user",
				"replaced",
				"reset"
			]).optional()
		}),
		object({ type: literal("GET_STATUS") }),
		object({
			type: literal("GENERATE_TRAPS"),
			sessionId: string().min(1),
			delfLevel: _enum(DELF_LEVELS),
			sentences: array(object({
				id: string().min(1).max(64),
				text: string().min(1).max(300)
			})).max(8)
		}),
		object({
			type: literal("RESET_PROFILE"),
			confirmed: boolean().optional().default(true)
		}),
		object({
			type: literal("SAVE_CALIBRATION"),
			delfLevel: _enum(DELF_LEVELS),
			correctAnswers: number().int().min(0).max(8).optional().default(0),
			method: _enum(["diagnostic", "self_selected"]).optional().default("self_selected")
		}),
		object({
			type: literal("SET_PROVIDER"),
			enabled: boolean().optional().default(true)
		})
	]);
	object({
		ok: literal(false),
		error: object({
			code: _enum(ERROR_CODES),
			message: string(),
			recoverable: boolean()
		})
	});
	/** Parse an inbound message. Unknown shapes are rejected, never coerced. */
	function parseMessage(value) {
		const parsed = eclipseMessageSchema.safeParse(value);
		return parsed.success ? parsed.data : null;
	}
	/**
	* Say why a message was rejected, in terms a human reading the popup can act
	* on. A rejected message is nearly always version skew rather than a malicious
	* sender, so the copy leads with the fix and carries the field-level detail
	* behind it for whoever is looking at a console.
	*/
	function describeRejectedMessage(value) {
		const type = value?.type;
		if (typeof type !== "string" || !MESSAGE_TYPES.includes(type)) return `${STALE_WORKER_MESSAGE} (unrecognised request${typeof type === "string" ? ` "${type}"` : ""})`;
		const parsed = eclipseMessageSchema.safeParse(value);
		const fields = parsed.success ? [] : [...new Set(parsed.error.issues.map((issue) => issue.path.join(".")).filter((path) => path !== ""))];
		return fields.length > 0 ? `${STALE_WORKER_MESSAGE} (${type} sent an unusable ${fields.join(", ")})` : `${STALE_WORKER_MESSAGE} (${type} had an unusable payload)`;
	}
	_enum(MOON_PHASES);
	//#endregion
	//#region src/domain/url-support.ts
	function classifyUrl(url) {
		if (!url) return {
			supported: false,
			reason: "other"
		};
		let parsed;
		try {
			parsed = new URL(url);
		} catch {
			return {
				supported: false,
				reason: "other"
			};
		}
		switch (parsed.protocol) {
			case "http:":
			case "https:": return { supported: true };
			case "file:": return {
				supported: false,
				reason: "file"
			};
			case "chrome-extension:":
			case "moz-extension:": return {
				supported: false,
				reason: "extension"
			};
			case "chrome:":
			case "edge:":
			case "about:":
			case "devtools:":
			case "view-source:": return {
				supported: false,
				reason: "internal"
			};
			default: return {
				supported: false,
				reason: "other"
			};
		}
	}
	//#endregion
	//#region src/storage/area.ts
	/** Wraps a `browser.storage` area. */
	function chromeArea(area) {
		return {
			async get(key) {
				return (await area.get(key))[key];
			},
			async set(key, value) {
				await area.set({ [key]: value });
			},
			async remove(key) {
				await area.remove(key);
			}
		};
	}
	/** Run a storage operation, converting any throw into a typed `STORAGE_ERROR`. */
	async function guarded(work) {
		try {
			return success(await work());
		} catch (cause) {
			return failure("STORAGE_ERROR", cause instanceof Error ? cause.message : "storage operation failed");
		}
	}
	//#endregion
	//#region src/storage/keys.ts
	/** Storage keys. Namespaced so Eclipse never collides with anything else. */
	var PROFILE_KEY = "eclipse:profile:v1";
	var INTERACTIONS_KEY = "eclipse:interactions:v1";
	var PROVIDER_CACHE_KEY = "eclipse:provider-cache:v1";
	var PROVIDER_SETTINGS_KEY = "eclipse:provider-settings:v1";
	var SESSION_KEY = "eclipse:session:v1";
	//#endregion
	//#region src/storage/profile-store.ts
	/**
	* Learner profile persistence.
	*
	* Two rules govern this file:
	*
	* 1. A profile that fails validation is never silently replaced. Eclipse
	*    reports `PROFILE_INCOMPATIBLE` and leaves the bytes alone, so a schema bug
	*    in a future version cannot quietly delete somebody's progress.
	* 2. Answer outcomes are idempotent by `interactionId`. The ids live in their
	*    own bounded key rather than on the profile, because the profile's rolling
	*    outcome window is only five deep and a duplicate can arrive later than
	*    that.
	*/
	/**
	* Read the profile.
	*
	* Missing data yields a fresh profile. Corrupt or newer-than-supported data
	* yields `PROFILE_INCOMPATIBLE` and is left untouched on disk.
	*/
	async function loadProfile(area) {
		const read = await guarded(() => area.get(PROFILE_KEY));
		if (!read.ok) return read;
		const raw = read.data;
		if (raw === void 0 || raw === null) return success({
			profile: createEmptyProfile(),
			created: true
		});
		const version = raw.schemaVersion;
		if (typeof version === "number" && version > 1) return failure("PROFILE_INCOMPATIBLE", `Saved learning data uses schema version ${version}; this build supports 1.`);
		const parsed = learnerProfileSchema.safeParse(raw);
		if (!parsed.success) return failure("PROFILE_INCOMPATIBLE", "Saved learning data did not match the expected shape and was left untouched.");
		return success({
			profile: parsed.data,
			created: false
		});
	}
	/** Write the profile, validating it on the way out. */
	async function saveProfile(area, profile) {
		const parsed = learnerProfileSchema.safeParse(profile);
		if (!parsed.success) return failure("STORAGE_ERROR", "Refusing to persist an invalid learner profile.");
		const written = await guarded(() => area.set(PROFILE_KEY, parsed.data));
		if (!written.ok) return written;
		return success(profile);
	}
	/** Remove the profile and every interaction id. The next read creates a fresh profile. */
	async function resetProfile(area) {
		const profile = createEmptyProfile();
		const written = await guarded(async () => {
			await area.remove(PROFILE_KEY);
			await area.remove(INTERACTIONS_KEY);
		});
		if (!written.ok) return written;
		return success(profile);
	}
	//#endregion
	//#region src/storage/session-store.ts
	/**
	* Active-session state, owned exclusively by the background worker.
	*
	* Lives in `storage.session` so it disappears when the browser closes and
	* survives a service-worker restart in between. There is at most one active
	* Eclipse session across all tabs.
	*/
	var activeSessionSchema = object({
		sessionId: string().min(1),
		tabId: number().int(),
		startedAt: string(),
		phase: _enum(["pending", "active"]).optional()
	}).transform((session) => ({
		...session,
		phase: session.phase ?? "active"
	}));
	/** Generation is allowed during activation and after it, but never cross-session. */
	function isGenerationAuthorized(session, senderTabId, requestedSessionId) {
		return session !== null && senderTabId === session.tabId && requestedSessionId === session.sessionId;
	}
	async function readActiveSession(area) {
		const read = await guarded(() => area.get(SESSION_KEY));
		if (!read.ok) return null;
		const parsed = activeSessionSchema.safeParse(read.data);
		return parsed.success ? parsed.data : null;
	}
	async function writeActiveSession(area, session) {
		const written = await guarded(() => area.set(SESSION_KEY, session));
		if (!written.ok) return written;
		return success(session);
	}
	async function clearActiveSession(area) {
		return guarded(() => area.remove(SESSION_KEY));
	}
	//#endregion
	//#region src/storage/provider-settings.ts
	/**
	* Health state for the always-on generation API.
	*
	* `enabled` remains in the stored shape for backwards compatibility, but the
	* product no longer exposes or honours an off switch. The origin is a
	* build-time constant, not user input.
	*/
	/** The only origin Eclipse will ever contact. */
	var PROVIDER_ORIGIN = "http://localhost:8787";
	var PROVIDER_ENDPOINT = `${PROVIDER_ORIGIN}/api/context-traps`;
	`${PROVIDER_ORIGIN}`;
	var PROVIDER_PERMISSION_PATTERN = "http://localhost:8787/*";
	var PROVIDER_MODEL = "gemini-3.5-flash-lite";
	var providerSettingsSchema = object({
		enabled: boolean(),
		lastError: string().nullable()
	});
	var DEFAULT_PROVIDER_SETTINGS = {
		enabled: true,
		lastError: null
	};
	async function readProviderSettings(area) {
		const read = await guarded(() => area.get(PROVIDER_SETTINGS_KEY));
		if (!read.ok) return DEFAULT_PROVIDER_SETTINGS;
		const parsed = providerSettingsSchema.safeParse(read.data);
		return parsed.success ? parsed.data : DEFAULT_PROVIDER_SETTINGS;
	}
	async function writeProviderSettings(area, settings) {
		const written = await guarded(() => area.set(PROVIDER_SETTINGS_KEY, settings));
		if (!written.ok) return written;
		return success(settings);
	}
	async function clearProviderSettings(area) {
		return guarded(() => area.remove(PROVIDER_SETTINGS_KEY));
	}
	var PROVIDER_CACHE_SCOPE = `source=en|target=fr-FR|provider=gemini|model=${PROVIDER_MODEL}|prompt=v2|schema=v2`;
	/** Serialize read-modify-write operations per storage area. */
	var cacheQueues = /* @__PURE__ */ new WeakMap();
	async function withCacheLock(area, work) {
		const previous = cacheQueues.get(area) ?? Promise.resolve();
		let release = () => void 0;
		const current = new Promise((resolve) => {
			release = resolve;
		});
		const tail = previous.catch(() => void 0).then(() => current);
		cacheQueues.set(area, tail);
		await previous.catch(() => void 0);
		try {
			return await work();
		} finally {
			release();
			if (cacheQueues.get(area) === tail) cacheQueues.delete(area);
		}
	}
	async function cacheKeyFor(sentence, scope = PROVIDER_CACHE_SCOPE) {
		const bytes = new TextEncoder().encode(`${scope}\0${sentence}`);
		const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
		return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
	}
	async function readCache(area) {
		const read = await guarded(() => area.get(PROVIDER_CACHE_KEY));
		if (!read.ok || typeof read.data !== "object" || read.data === null) return {};
		return read.data;
	}
	/**
	* Look up a whole batch under a single lock.
	*
	* The per-sentence entry point below takes the shared cache lock, reads the
	* entire cache object and writes it back just to touch `accessedAt`. Calling it
	* in a loop turned one activation into hundreds of serialized read-modify-write
	* cycles on one storage key — and because the lock is shared, it also
	* serialized generation batches that were meant to run concurrently. This does
	* the same work with one lock, one read and one write.
	*/
	async function getCachedTrapsBatch(area, sentences, now, scope = PROVIDER_CACHE_SCOPE) {
		if (sentences.length === 0) return /* @__PURE__ */ new Map();
		const keys = await Promise.all(sentences.map((sentence) => cacheKeyFor(sentence, scope)));
		return withCacheLock(area, async () => {
			const cache = await readCache(area);
			const hits = /* @__PURE__ */ new Map();
			let touched = false;
			for (const [index, sentence] of sentences.entries()) {
				const key = keys[index];
				if (key === void 0) continue;
				const entry = cache[key];
				if (!entry) continue;
				const traps = revalidate(entry, sentence);
				if (traps.length === 0) continue;
				hits.set(sentence, traps);
				entry.accessedAt = now.getTime();
				touched = true;
			}
			if (touched) await guarded(() => area.set(PROVIDER_CACHE_KEY, cache));
			return hits;
		});
	}
	/** Store a whole batch under a single lock, evicting once at the end. */
	async function setCachedTrapsBatch(area, entries, now, scope = PROVIDER_CACHE_SCOPE) {
		const writable = [];
		for (const entry of entries) {
			const templates = templatesFor(entry.sentence, entry.traps);
			if (templates.length === 0) continue;
			writable.push({
				key: await cacheKeyFor(entry.sentence, scope),
				templates
			});
		}
		if (writable.length === 0) return success(void 0);
		return withCacheLock(area, async () => {
			const cache = await readCache(area);
			for (const { key, templates } of writable) cache[key] = {
				accessedAt: now.getTime(),
				traps: templates
			};
			return guarded(() => area.set(PROVIDER_CACHE_KEY, evict(cache)));
		});
	}
	/** Re-validate stored templates against the sentence they are being replayed on. */
	function revalidate(entry, sentence) {
		const traps = [];
		for (const candidate of entry.traps) {
			if (typeof candidate !== "object" || candidate === null) continue;
			const validated = validateTrap({
				...candidate,
				sentence
			}, { untrusted: true });
			if (validated.ok) traps.push(validated.data);
		}
		return traps;
	}
	/** Validated, sentence-free templates ready to store. */
	function templatesFor(sentence, traps) {
		const templates = [];
		for (const trap of traps) {
			const validated = validateTrap({
				...trap,
				sentence
			}, { untrusted: true });
			if (!validated.ok) continue;
			const template = { ...validated.data };
			delete template.sentence;
			templates.push(template);
		}
		return templates;
	}
	/** Keep the most recently accessed entries, oldest-access evicted first. */
	function evict(cache) {
		const entries = Object.entries(cache);
		if (entries.length <= 100) return cache;
		entries.sort((a, b) => {
			const byAccess = b[1].accessedAt - a[1].accessedAt;
			if (byAccess !== 0) return byAccess;
			return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
		});
		return Object.fromEntries(entries.slice(0, 100));
	}
	async function clearProviderCache(area) {
		return withCacheLock(area, () => guarded(() => area.remove(PROVIDER_CACHE_KEY)));
	}
	//#endregion
	//#region src/provider/client.ts
	/**
	* Client for the always-on local generation API.
	*
	* Every call has a hard timeout, and any failure leaves validated bundled
	* vocabulary in place. Article text is always paired with the learner's DELF
	* lens so generated highlights are appropriate for their reading level.
	*
	* What leaves the browser: article text in batches of at most eight sentences.
	* Never the page URL, never the learner profile, never answer history, never
	* anything else from the page.
	*/
	/** Status codes the server uses, mapped onto Eclipse's error vocabulary. */
	function codeForStatus(status) {
		switch (status) {
			case 403: return "PROVIDER_PERMISSION_DENIED";
			case 429:
			case 503: return "PROVIDER_UNAVAILABLE";
			case 504: return "PROVIDER_TIMEOUT";
			case 502:
			case 400: return "PROVIDER_INVALID_RESPONSE";
			default: return "PROVIDER_UNAVAILABLE";
		}
	}
	/**
	* Ask the local API for traps over the given sentences.
	*
	* Returns validated, sentence-bound candidates only. Anything the server sends that does not pass
	* the same validation the catalog passes is discarded — an invalid model
	* response can never reach the DOM.
	*/
	async function fetchGeneratedTraps(sentences, delfLevel, options = {}) {
		const endpoint = options.endpoint ?? PROVIDER_ENDPOINT;
		const timeoutMs = options.timeoutMs ?? 2e4;
		const doFetch = options.fetchImpl ?? globalThis.fetch;
		if (typeof doFetch !== "function") return failure("PROVIDER_UNAVAILABLE", "No fetch implementation is available.");
		const payload = {
			sourceLocale: "en",
			targetLocale: "fr-FR",
			delfLevel,
			sentences: sentences.slice(0, 8).map((sentence) => ({
				id: sentence.id,
				text: sentence.text.slice(0, 300)
			}))
		};
		if (payload.sentences.length === 0) return success([]);
		const maxAttempts = Math.max(1, Math.min(3, options.maxAttempts ?? 2));
		let lastFailure = failure("PROVIDER_UNAVAILABLE");
		for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), timeoutMs);
			let response;
			try {
				response = await doFetch(endpoint, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
					signal: controller.signal,
					credentials: "omit",
					cache: "no-store"
				});
			} catch (cause) {
				const aborted = cause instanceof Error && cause.name === "AbortError";
				lastFailure = failure(aborted ? "PROVIDER_TIMEOUT" : "PROVIDER_UNAVAILABLE", aborted ? `The generation API did not answer within ${timeoutMs}ms after automatic recovery.` : LOCAL_API_MESSAGE);
				clearTimeout(timer);
				if (attempt + 1 < maxAttempts) {
					await waitBeforeRetry(options, payload.sentences[0]?.id ?? "", attempt);
					continue;
				}
				return lastFailure;
			}
			clearTimeout(timer);
			if (!response.ok) {
				lastFailure = failure(codeForStatus(response.status), `Generation API returned ${response.status} after automatic recovery.`);
				if (attempt + 1 < maxAttempts && isRetryableStatus(response.status)) {
					await waitBeforeRetry(options, payload.sentences[0]?.id ?? "", attempt);
					continue;
				}
				return lastFailure;
			}
			let body;
			try {
				body = await response.json();
			} catch {
				lastFailure = failure("PROVIDER_INVALID_RESPONSE", "Generation API returned malformed JSON after automatic recovery.");
				if (attempt + 1 < maxAttempts) {
					await waitBeforeRetry(options, payload.sentences[0]?.id ?? "", attempt);
					continue;
				}
				return lastFailure;
			}
			const candidates = body.candidates;
			if (!Array.isArray(candidates)) {
				lastFailure = failure("PROVIDER_INVALID_RESPONSE", "Generation API response had no candidates array after automatic recovery.");
				if (attempt + 1 < maxAttempts) {
					await waitBeforeRetry(options, payload.sentences[0]?.id ?? "", attempt);
					continue;
				}
				return lastFailure;
			}
			const sentencesById = new Map(payload.sentences.map((sentence) => [sentence.id, sentence.text]));
			const accepted = [];
			for (const candidate of candidates.slice(0, 8)) {
				if (typeof candidate !== "object" || candidate === null) continue;
				const sentenceId = candidate.sentenceId;
				if (typeof sentenceId !== "string") continue;
				const sentence = sentencesById.get(sentenceId);
				if (sentence === void 0) continue;
				const validated = validateTrap(candidate.trap, { untrusted: true });
				if (!validated.ok) continue;
				if (collapseWhitespace(validated.data.sentence) !== collapseWhitespace(sentence)) continue;
				accepted.push({
					sentenceId,
					trap: validated.data
				});
			}
			return success(accepted);
		}
		return lastFailure;
	}
	function isRetryableStatus(status) {
		return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
	}
	async function waitBeforeRetry(options, sentenceId, attempt) {
		const configured = options.retryDelayMs;
		const stableJitter = Array.from(sentenceId).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 200;
		const delayMs = configured ?? 300 * 2 ** attempt + stableJitter;
		if (delayMs <= 0) return;
		await new Promise((resolve) => setTimeout(resolve, delayMs));
	}
	//#endregion
	//#region src/provider/generate-with-cache.ts
	/** Cache-aware orchestration for level-matched AI learning items. */
	async function generateWithCache(sentences, delfLevel, area, fetcher = fetchGeneratedTraps, now = () => /* @__PURE__ */ new Date()) {
		const cacheScope = `${PROVIDER_CACHE_SCOPE}|delf=${delfLevel}`;
		const bySentenceId = /* @__PURE__ */ new Map();
		const misses = [];
		const hits = await getCachedTrapsBatch(area, sentences.map((sentence) => sentence.text), now(), cacheScope);
		for (const sentence of sentences) {
			const cached = hits.get(sentence.text);
			if (!cached) {
				misses.push(sentence);
				continue;
			}
			bySentenceId.set(sentence.id, cached.map((trap) => ({
				sentenceId: sentence.id,
				trap
			})));
		}
		if (misses.length === 0) return success(inCallerOrder(sentences, bySentenceId));
		const fetched = await fetcher(misses, delfLevel);
		if (!fetched.ok) {
			const hits = inCallerOrder(sentences, bySentenceId);
			return hits.length > 0 ? success(hits) : fetched;
		}
		const missedIds = new Set(misses.map((sentence) => sentence.id));
		for (const candidate of fetched.data) {
			if (!missedIds.has(candidate.sentenceId)) continue;
			const current = bySentenceId.get(candidate.sentenceId) ?? [];
			current.push(candidate);
			bySentenceId.set(candidate.sentenceId, current);
		}
		const toStore = [];
		for (const sentence of misses) {
			const generated = bySentenceId.get(sentence.id) ?? [];
			if (generated.length === 0) continue;
			toStore.push({
				sentence: sentence.text,
				traps: generated.map((candidate) => candidate.trap)
			});
		}
		await setCachedTrapsBatch(area, toStore, now(), cacheScope);
		return success(inCallerOrder(sentences, bySentenceId));
	}
	function inCallerOrder(sentences, bySentenceId) {
		return sentences.flatMap((sentence) => [...bySentenceId.get(sentence.id) ?? []]);
	}
	//#endregion
	//#region src/entrypoints/background.ts
	/**
	* Background service worker.
	*
	* Owns: popup requests, tab validation, the single active session, runtime
	* injection of the Eclipse content script, the level-matched generation call,
	* and session replacement across tabs.
	*
	* Does NOT own: answer outcomes. Those have exactly one writer, the content
	* script, which is what removes the popup/background/content race entirely.
	*/
	/** Built bundle path of the runtime-injected content script. */
	var CONTENT_SCRIPT_FILE = "/content-scripts/eclipse.js";
	/**
	* The provider origin is compiled in. There is no field anywhere in the UI
	* that lets a page or a user point Eclipse at an arbitrary host.
	*/
	var PROVIDER_CONFIGURED = PROVIDER_ORIGIN.length > 0;
	var background_default = defineBackground(() => {
		const local = chromeArea(browser.storage.local);
		const session = chromeArea(browser.storage.session);
		browser.runtime.onMessage.addListener((raw, sender, sendResponse) => {
			const message = parseMessage(raw);
			if (!message) {
				sendResponse(failure("MESSAGE_UNSUPPORTED", describeRejectedMessage(raw)));
				return false;
			}
			handleMessage(message, sender).then(sendResponse).catch((cause) => {
				sendResponse(failure("UNKNOWN_ERROR", cause instanceof Error ? cause.message : "Background handler failed."));
			});
			return true;
		});
		browser.tabs.onRemoved.addListener((tabId) => {
			(async () => {
				if ((await readActiveSession(session))?.tabId === tabId) await clearActiveSession(session);
			})();
		});
		browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
			if (changeInfo.status !== "loading") return;
			(async () => {
				if ((await readActiveSession(session))?.tabId === tabId) await clearActiveSession(session);
			})();
		});
		async function handleMessage(message, sender) {
			switch (message.type) {
				case "START_SESSION": return startSession();
				case "STOP_SESSION": return stopSession();
				case "GET_STATUS": return getStatus();
				case "RESET_PROFILE": return doResetProfile(message.confirmed);
				case "SAVE_CALIBRATION": return doSaveCalibration(message.delfLevel);
				case "SET_PROVIDER": return doSetProvider(message.enabled);
				case "GENERATE_TRAPS": return doGenerateTraps(message.sessionId, message.delfLevel, message.sentences, sender);
				default: return failure("MESSAGE_UNSUPPORTED", `The background worker does not handle ${message.type}.`);
			}
		}
		async function startSession() {
			const tab = await activeTab();
			if (!tab || typeof tab.id !== "number") return failure("UNSUPPORTED_URL", "No active tab to run Eclipse in.");
			if (!classifyUrl(tab.url).supported) return failure("UNSUPPORTED_URL");
			const tabId = tab.id;
			const existing = await readActiveSession(session);
			if (existing && existing.tabId !== tabId) {
				await sendToTab(existing.tabId, {
					type: "DEACTIVATE",
					reason: "replaced"
				});
				await clearActiveSession(session);
			}
			const ready = await ensureRuntime(tabId);
			if (!ready.ok) return ready;
			const providerEnabled = PROVIDER_CONFIGURED && await hasProviderPermission();
			const sessionId = createSessionId();
			const pending = await writeActiveSession(session, {
				sessionId,
				tabId,
				startedAt: (/* @__PURE__ */ new Date()).toISOString(),
				phase: "pending"
			});
			if (!pending.ok) return pending;
			const activated = await sendToTab(tabId, {
				type: "ACTIVATE",
				sessionId,
				providerEnabled
			});
			if (!activated.ok) {
				await clearSessionIfMatches(sessionId);
				return activated;
			}
			const promoted = await writeActiveSession(session, {
				sessionId,
				tabId,
				startedAt: pending.data.startedAt,
				phase: "active"
			});
			if (!promoted.ok) {
				await sendToTab(tabId, {
					type: "DEACTIVATE",
					sessionId,
					reason: "reset"
				});
				await clearSessionIfMatches(sessionId);
				return promoted;
			}
			if (providerEnabled) await writeProviderSettings(local, {
				enabled: true,
				lastError: null
			});
			return success({
				sessionId,
				tabId,
				trapCount: activated.data.trapCount
			});
		}
		async function stopSession() {
			const active = await readActiveSession(session);
			if (!active) return success({ restored: false });
			const stopped = await sendToTab(active.tabId, {
				type: "DEACTIVATE",
				sessionId: active.sessionId,
				reason: "user"
			});
			await clearActiveSession(session);
			if (!stopped.ok) return success({ restored: false });
			return success({ restored: stopped.data.restored });
		}
		/**
		* PING first, inject only if nobody answers. This is what keeps repeated
		* activation from stacking runtimes in one tab.
		*/
		async function ensureRuntime(tabId) {
			const pong = await sendToTab(tabId, { type: "PING" });
			if (pong.ok) return pong;
			try {
				await browser.scripting.executeScript({
					target: { tabId },
					files: [CONTENT_SCRIPT_FILE]
				});
			} catch (cause) {
				return failure("CONTENT_SCRIPT_UNAVAILABLE", cause instanceof Error ? cause.message : "injection failed");
			}
			const retry = await sendToTab(tabId, { type: "PING" });
			if (!retry.ok) return failure("CONTENT_SCRIPT_UNAVAILABLE");
			return retry;
		}
		async function getStatus() {
			const tab = await activeTab();
			const page = classifyUrl(tab?.url);
			const active = await readActiveSession(session);
			const providerSettings = await readProviderSettings(local);
			const now = /* @__PURE__ */ new Date();
			const loaded = await loadProfile(local);
			if (!loaded.ok) return success({
				contractVersion: 2,
				activeTabId: active?.tabId ?? null,
				activeSessionId: active?.sessionId ?? null,
				activeHere: active?.tabId === tab?.id,
				page,
				calibrationCompleted: false,
				delfLevel: "B1",
				globalAbility: 0,
				phase: "new_moon",
				summary: {
					tracked: 0,
					attempts: 0,
					correct: 0,
					due: 0,
					byPhase: {
						new_moon: 0,
						crescent: 0,
						half: 0,
						full: 0
					},
					overallPhase: "new_moon"
				},
				provider: {
					configured: PROVIDER_CONFIGURED,
					enabled: PROVIDER_CONFIGURED,
					permissionGranted: await hasProviderPermission(),
					lastError: providerSettings.lastError
				},
				profileError: loaded.error.message
			});
			const profile = loaded.data.profile;
			const summary = summarizeMastery(profile, now);
			return success({
				contractVersion: 2,
				activeTabId: active?.tabId ?? null,
				activeSessionId: active?.sessionId ?? null,
				activeHere: active !== null && active.tabId === tab?.id,
				page,
				calibrationCompleted: profile.calibrationCompleted,
				delfLevel: profile.delfLevel,
				globalAbility: profile.globalAbility,
				phase: summary.overallPhase,
				summary,
				provider: {
					configured: PROVIDER_CONFIGURED,
					enabled: PROVIDER_CONFIGURED,
					permissionGranted: await hasProviderPermission(),
					lastError: providerSettings.lastError
				},
				profileError: null
			});
		}
		async function doResetProfile(confirmed) {
			if (!confirmed) return failure("UNKNOWN_ERROR", "Reset requires confirmation.");
			const active = await readActiveSession(session);
			if (active) {
				await sendToTab(active.tabId, {
					type: "DEACTIVATE",
					reason: "reset"
				});
				await clearActiveSession(session);
			}
			const reset = await resetProfile(local);
			if (!reset.ok) return reset;
			const cacheReset = await clearProviderCache(local);
			if (!cacheReset.ok) return cacheReset;
			const settingsReset = await clearProviderSettings(local);
			if (!settingsReset.ok) return settingsReset;
			if (!await revokeProviderPermission()) return failure("PROVIDER_PERMISSION_DENIED");
			return success({ reset: true });
		}
		async function doSaveCalibration(delfLevel) {
			const loaded = await loadProfile(local);
			if (!loaded.ok) return loaded;
			const globalAbility = abilityForDelfLevel(delfLevel);
			const saved = await saveProfile(local, {
				...loaded.data.profile,
				calibrationCompleted: true,
				delfLevel,
				globalAbility
			});
			if (!saved.ok) return saved;
			return success({
				globalAbility,
				delfLevel
			});
		}
		/**
		* Legacy message compatibility. AI generation is always enabled, so an old
		* popup asking to disable it receives the actual, unchanged state.
		*/
		async function doSetProvider(_enabled) {
			if (!PROVIDER_CONFIGURED) return failure("PROVIDER_DISABLED");
			const granted = await hasProviderPermission();
			if (!granted) {
				await writeProviderSettings(local, {
					enabled: true,
					lastError: "Permission for the local generation API was not granted."
				});
				return failure("PROVIDER_PERMISSION_DENIED");
			}
			const written = await writeProviderSettings(local, {
				enabled: true,
				lastError: null
			});
			if (!written.ok) return written;
			return success({
				enabled: true,
				permissionGranted: granted
			});
		}
		async function hasProviderPermission() {
			if (!PROVIDER_CONFIGURED) return false;
			try {
				return await browser.permissions.contains({ origins: [PROVIDER_PERMISSION_PATTERN] });
			} catch {
				return false;
			}
		}
		async function revokeProviderPermission() {
			if (!PROVIDER_CONFIGURED) return true;
			try {
				if (browser.runtime.getManifest().host_permissions?.includes("http://localhost:8787/*")) return true;
				if (!await hasProviderPermission()) return true;
				return await browser.permissions.remove({ origins: [PROVIDER_PERMISSION_PATTERN] });
			} catch {
				return false;
			}
		}
		async function doGenerateTraps(sessionId, delfLevel, sentences, sender) {
			if (!isGenerationAuthorized(await readActiveSession(session), sender.tab?.id, sessionId)) return failure("SESSION_REPLACED", "This tab does not own the active Eclipse session.");
			if (!await hasProviderPermission()) {
				await writeProviderSettings(local, {
					enabled: true,
					lastError: "Permission for the local generation API is not granted."
				});
				return failure("PROVIDER_PERMISSION_DENIED");
			}
			const result = await generateWithCache(sentences, delfLevel, local);
			await writeProviderSettings(local, {
				enabled: true,
				lastError: result.ok ? null : result.error.message
			});
			if (!result.ok) return result;
			return success({ candidates: result.data });
		}
		async function activeTab() {
			const [tab] = await browser.tabs.query({
				active: true,
				currentWindow: true
			});
			return tab;
		}
		async function clearSessionIfMatches(sessionId) {
			if ((await readActiveSession(session))?.sessionId === sessionId) await clearActiveSession(session);
		}
		/**
		* Send to a tab and turn "no receiver" into a typed failure. `sendMessage`
		* rejects when nothing is listening, which is the normal case before the
		* runtime is injected — not an error worth logging.
		*/
		async function sendToTab(tabId, message) {
			try {
				const response = await browser.tabs.sendMessage(tabId, message);
				if (response && typeof response === "object" && "ok" in response) return response;
				return failure("CONTENT_SCRIPT_UNAVAILABLE", "The Eclipse runtime returned nothing.");
			} catch {
				return failure("CONTENT_SCRIPT_UNAVAILABLE");
			}
		}
	});
	//#endregion
	//#region node_modules/@webext-core/match-patterns/dist/index.mjs
	/**
	* Class for parsing and performing operations on match patterns.
	*
	* @example
	*   const pattern = new MatchPattern('*://google.com/*');
	*
	*   pattern.includes('https://google.com'); // true
	*   pattern.includes('http://youtube.com/watch?v=123'); // false
	*/
	var MatchPattern = class MatchPattern {
		static {
			this.PROTOCOLS = [
				"http",
				"https",
				"file",
				"ftp",
				"urn",
				"ws",
				"wss"
			];
		}
		/**
		* Parse a match pattern string. If it is invalid, the constructor will throw an
		* `InvalidMatchPattern` error.
		*
		* @param matchPattern The match pattern to parse.
		*/
		constructor(matchPattern) {
			if (matchPattern === "<all_urls>") {
				this.isAllUrls = true;
				this.protocolMatches = [...MatchPattern.PROTOCOLS];
				this.hostnameMatch = "*";
				this.pathnameMatch = "*";
			} else {
				const groups = /(.*):\/\/(.*?)(\/.*)/.exec(matchPattern);
				if (groups == null) throw new InvalidMatchPattern(matchPattern, "Incorrect format");
				const [_, protocol, hostname, pathname] = groups;
				validateProtocol(matchPattern, protocol);
				validateHostname(matchPattern, hostname);
				this.protocolMatches = protocol === "*" ? ["http", "https"] : [protocol];
				this.hostnameMatch = hostname;
				this.pathnameMatch = pathname;
			}
		}
		/** Check if a URL is included in a pattern. */
		includes(url) {
			const u = typeof url === "string" ? new URL(url) : url instanceof Location ? new URL(url.href) : url;
			if (this.isAllUrls) return !this.isUnknownProtocol(u);
			return !!this.protocolMatches.find((protocol) => {
				if (protocol === "http") return this.isHttpMatch(u);
				if (protocol === "https") return this.isHttpsMatch(u);
				if (protocol === "file") return this.isFileMatch(u);
				if (protocol === "ftp") return this.isFtpMatch(u);
				if (protocol === "urn") return this.isUrnMatch(u);
			});
		}
		isHttpMatch(url) {
			return url.protocol === "http:" && this.isHostPathMatch(url);
		}
		isHttpsMatch(url) {
			return url.protocol === "https:" && this.isHostPathMatch(url);
		}
		isHostPathMatch(url) {
			if (!this.hostnameMatch || !this.pathnameMatch) return false;
			const hostnameMatchRegexs = [this.convertPatternToRegex(this.hostnameMatch), this.convertPatternToRegex(this.hostnameMatch.replace(/^\*\./, ""))];
			const pathnameMatchRegex = this.convertPatternToRegex(this.pathnameMatch);
			return !!hostnameMatchRegexs.find((regex) => regex.test(url.hostname)) && pathnameMatchRegex.test(url.pathname);
		}
		isUnknownProtocol(url) {
			return !this.protocolMatches.includes(url.protocol.slice(0, -1));
		}
		isPathMatch(url) {
			if (!this.pathnameMatch) return false;
			return this.convertPatternToRegex(this.pathnameMatch).test(url.pathname);
		}
		isFileMatch(url) {
			return url.protocol === "file:" && this.isPathMatch(url);
		}
		isFtpMatch(_url) {
			throw Error("Not implemented: ftp:// pattern matching. Open a PR to add support");
		}
		isUrnMatch(_url) {
			throw Error("Not implemented: urn:// pattern matching. Open a PR to add support");
		}
		convertPatternToRegex(pattern) {
			const starsReplaced = this.escapeForRegex(pattern).replace(/\\\*/g, ".*");
			return RegExp(`^${starsReplaced}$`);
		}
		escapeForRegex(string) {
			return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
	};
	var InvalidMatchPattern = class extends Error {
		constructor(matchPattern, reason) {
			super(`Invalid match pattern "${matchPattern}": ${reason}`);
		}
	};
	function validateProtocol(matchPattern, protocol) {
		if (!MatchPattern.PROTOCOLS.includes(protocol) && protocol !== "*") throw new InvalidMatchPattern(matchPattern, `${protocol} not a valid protocol (${MatchPattern.PROTOCOLS.join(", ")})`);
	}
	function validateHostname(matchPattern, hostname) {
		if (hostname.includes(":")) throw new InvalidMatchPattern(matchPattern, `Hostname cannot include a port`);
		if (hostname.includes("*") && hostname.length > 1 && !hostname.startsWith("*.")) throw new InvalidMatchPattern(matchPattern, `If using a wildcard (*), it must go at the start of the hostname`);
	}
	//#endregion
	//#region \0virtual:wxt-background-entrypoint?C:/Users/fengy/OneDrive/Documents/NW/Eclipse/src/entrypoints/background.ts
	function print(method, ...args) {
		if (typeof args[0] === "string") method(`[wxt] ${args.shift()}`, ...args);
		else method("[wxt]", ...args);
	}
	/** Wrapper around `console` with a "[wxt]" prefix */
	var logger = {
		debug: (...args) => print(console.debug, ...args),
		log: (...args) => print(console.log, ...args),
		warn: (...args) => print(console.warn, ...args),
		error: (...args) => print(console.error, ...args)
	};
	var ws;
	/** Connect to the websocket and listen for messages. */
	function getDevServerWebSocket() {
		if (ws == null) {
			const serverUrl = "ws://localhost:3000";
			logger.debug("Connecting to dev server @", serverUrl);
			ws = new WebSocket(serverUrl, "vite-hmr");
			ws.addWxtEventListener = ws.addEventListener.bind(ws);
			ws.sendCustom = (event, payload) => ws?.send(JSON.stringify({
				type: "custom",
				event,
				payload
			}));
			ws.addEventListener("open", () => {
				logger.debug("Connected to dev server");
			});
			ws.addEventListener("close", () => {
				logger.debug("Disconnected from dev server");
			});
			ws.addEventListener("error", (event) => {
				logger.error("Failed to connect to dev server", event);
			});
			ws.addEventListener("message", (e) => {
				try {
					const message = JSON.parse(e.data);
					if (message.type === "custom") ws?.dispatchEvent(new CustomEvent(message.event, { detail: message.data }));
				} catch (err) {
					logger.error("Failed to handle message", err);
				}
			});
		}
		return ws;
	}
	/** https://developer.chrome.com/blog/longer-esw-lifetimes/ */
	function keepServiceWorkerAlive() {
		setInterval(async () => {
			await browser.runtime.getPlatformInfo();
		}, 5e3);
	}
	function reloadContentScript(payload) {
		if (browser.runtime.getManifest().manifest_version == 2) reloadContentScriptMv2(payload);
		else reloadContentScriptMv3(payload);
	}
	async function reloadContentScriptMv3({ registration, contentScript }) {
		if (registration === "runtime") await reloadRuntimeContentScriptMv3(contentScript);
		else await reloadManifestContentScriptMv3(contentScript);
	}
	async function reloadManifestContentScriptMv3(contentScript) {
		const id = `wxt:${contentScript.js[0]}`;
		logger.log("Reloading content script:", contentScript);
		const registered = await browser.scripting.getRegisteredContentScripts();
		logger.debug("Existing scripts:", registered);
		const existing = registered.find((cs) => cs.id === id);
		if (existing) {
			logger.debug("Updating content script", existing);
			await browser.scripting.updateContentScripts([{
				...contentScript,
				id,
				css: contentScript.css ?? []
			}]);
		} else {
			logger.debug("Registering new content script...");
			await browser.scripting.registerContentScripts([{
				...contentScript,
				id,
				css: contentScript.css ?? []
			}]);
		}
		await reloadTabsForContentScript(contentScript);
	}
	async function reloadRuntimeContentScriptMv3(contentScript) {
		logger.log("Reloading content script:", contentScript);
		const registered = await browser.scripting.getRegisteredContentScripts();
		logger.debug("Existing scripts:", registered);
		const matches = registered.filter((cs) => {
			const hasJs = contentScript.js?.find((js) => cs.js?.includes(js));
			const hasCss = contentScript.css?.find((css) => cs.css?.includes(css));
			return hasJs || hasCss;
		});
		if (matches.length === 0) {
			logger.log("Content script is not registered yet, nothing to reload", contentScript);
			return;
		}
		await browser.scripting.updateContentScripts(matches);
		await reloadTabsForContentScript(contentScript);
	}
	async function reloadTabsForContentScript(contentScript) {
		const allTabs = await browser.tabs.query({});
		const matchPatterns = contentScript.matches.map((match) => new MatchPattern(match));
		const matchingTabs = allTabs.filter((tab) => {
			const url = tab.url;
			if (!url) return false;
			return !!matchPatterns.find((pattern) => pattern.includes(url));
		});
		await Promise.all(matchingTabs.map(async (tab) => {
			try {
				await browser.tabs.reload(tab.id);
			} catch (err) {
				logger.warn("Failed to reload tab:", err);
			}
		}));
	}
	async function reloadContentScriptMv2(_payload) {
		throw Error("TODO: reloadContentScriptMv2");
	}
	try {
		const ws = getDevServerWebSocket();
		ws.addWxtEventListener("wxt:reload-extension", () => {
			browser.runtime.reload();
		});
		ws.addWxtEventListener("wxt:reload-content-script", (event) => {
			reloadContentScript(event.detail);
		});
		ws.addEventListener("open", () => ws.sendCustom("wxt:background-initialized"));
		keepServiceWorkerAlive();
	} catch (err) {
		logger.error("Failed to setup web socket connection with dev server", err);
	}
	browser.commands.onCommand.addListener((command) => {
		if (command === "wxt:reload-extension") browser.runtime.reload();
	});
	var result;
	try {
		result = background_default.main();
		if (result instanceof Promise) console.warn("The background's main() function return a promise, but it must be synchronous");
	} catch (err) {
		logger.error("The background crashed on startup!");
		throw err;
	}
	//#endregion
	return result;
})();

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsIm5hbWVzIjpbImJyb3dzZXIiLCJfYSIsIkYiLCJpbml0aWFsaXplciIsInV0aWwuanNvblN0cmluZ2lmeVJlcGxhY2VyIiwiY29yZS4kWm9kQXN5bmNFcnJvciIsInV0aWwuZmluYWxpemVJc3N1ZSIsImNvcmUuY29uZmlnIiwiZXJyb3JzLiRab2RFcnJvciIsInNhZmVQYXJzZSIsImVycm9ycy4kWm9kUmVhbEVycm9yIiwic2FmZVBhcnNlQXN5bmMiLCJkdXJhdGlvbiIsIl9lbW9qaSIsImRhdGUiLCJ0aW1lIiwiZGF0ZXRpbWUiLCJzdHJpbmciLCJudW1iZXIiLCJib29sZWFuIiwidXRpbC5mbG9hdFNhZmVSZW1haW5kZXIiLCJ1dGlsLk5VTUJFUl9GT1JNQVRfUkFOR0VTIiwicmVnZXhlcy5pbnRlZ2VyIiwidXRpbC5udWxsaXNoIiwidXRpbC5nZXRMZW5ndGhhYmxlT3JpZ2luIiwicmVnZXhlcy5sb3dlcmNhc2UiLCJyZWdleGVzLnVwcGVyY2FzZSIsInV0aWwuZXNjYXBlUmVnZXgiLCJjb250ZW50IiwidXRpbC5hYm9ydGVkIiwidXRpbC5leHBsaWNpdGx5QWJvcnRlZCIsImNvcmUuJFpvZEFzeW5jRXJyb3IiLCJzYWZlUGFyc2UiLCJzYWZlUGFyc2VBc3luYyIsInJlZ2V4ZXMuc3RyaW5nIiwicmVnZXhlcy5ndWlkIiwicmVnZXhlcy51dWlkIiwicmVnZXhlcy5lbWFpbCIsInJlZ2V4ZXMuZW1vamkiLCJyZWdleGVzLm5hbm9pZCIsInJlZ2V4ZXMuY3VpZCIsInJlZ2V4ZXMuY3VpZDIiLCJyZWdleGVzLnVsaWQiLCJyZWdleGVzLnhpZCIsInJlZ2V4ZXMua3N1aWQiLCJyZWdleGVzLmRhdGV0aW1lIiwicmVnZXhlcy5kYXRlIiwicmVnZXhlcy50aW1lIiwicmVnZXhlcy5kdXJhdGlvbiIsInJlZ2V4ZXMuaXB2NCIsInJlZ2V4ZXMuaXB2NiIsInJlZ2V4ZXMuY2lkcnY0IiwicmVnZXhlcy5jaWRydjYiLCJyZWdleGVzLmJhc2U2NCIsInJlZ2V4ZXMuYmFzZTY0dXJsIiwicmVnZXhlcy5lMTY0IiwicmVnZXhlcy5udW1iZXIiLCJyZWdleGVzLmJvb2xlYW4iLCJ1dGlsLnByZWZpeElzc3VlcyIsInV0aWwub3B0aW9uYWxLZXlzIiwidXRpbC5jYWNoZWQiLCJpc09iamVjdCIsInV0aWwuaXNPYmplY3QiLCJ1dGlsLmVzYyIsImFsbG93c0V2YWwiLCJ1dGlsLmFsbG93c0V2YWwiLCJ1dGlsLmZpbmFsaXplSXNzdWUiLCJjb3JlLmNvbmZpZyIsInV0aWwuY2xlYW5SZWdleCIsInV0aWwuaXNQbGFpbk9iamVjdCIsInV0aWwuZ2V0RW51bVZhbHVlcyIsInV0aWwuZXNjYXBlUmVnZXgiLCJjb3JlLiRab2RFbmNvZGVFcnJvciIsInV0aWwuaXNzdWUiLCJ1dGlsLm5vcm1hbGl6ZVBhcmFtcyIsImNoZWNrcy4kWm9kQ2hlY2tMZXNzVGhhbiIsImNoZWNrcy4kWm9kQ2hlY2tHcmVhdGVyVGhhbiIsImNoZWNrcy4kWm9kQ2hlY2tNdWx0aXBsZU9mIiwiY2hlY2tzLiRab2RDaGVja01heExlbmd0aCIsImNoZWNrcy4kWm9kQ2hlY2tNaW5MZW5ndGgiLCJjaGVja3MuJFpvZENoZWNrTGVuZ3RoRXF1YWxzIiwiY2hlY2tzLiRab2RDaGVja1JlZ2V4IiwiY2hlY2tzLiRab2RDaGVja0xvd2VyQ2FzZSIsImNoZWNrcy4kWm9kQ2hlY2tVcHBlckNhc2UiLCJjaGVja3MuJFpvZENoZWNrSW5jbHVkZXMiLCJjaGVja3MuJFpvZENoZWNrU3RhcnRzV2l0aCIsImNoZWNrcy4kWm9kQ2hlY2tFbmRzV2l0aCIsImNoZWNrcy4kWm9kQ2hlY2tPdmVyd3JpdGUiLCJ1dGlsLnNsdWdpZnkiLCJpc3N1ZSIsInV0aWwuaXNzdWUiLCJjaGVja3MuJFpvZENoZWNrIiwiY29yZS5faXNvRGF0ZVRpbWUiLCJjb3JlLl9pc29EYXRlIiwiY29yZS5faXNvVGltZSIsImNvcmUuX2lzb0R1cmF0aW9uIiwiY29yZS5mb3JtYXRFcnJvciIsImNvcmUuZmxhdHRlbkVycm9yIiwidXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIiLCJwYXJzZS5wYXJzZSIsInBhcnNlLnNhZmVQYXJzZSIsInBhcnNlLnBhcnNlQXN5bmMiLCJwYXJzZS5zYWZlUGFyc2VBc3luYyIsInBhcnNlLmVuY29kZSIsInBhcnNlLmRlY29kZSIsInBhcnNlLmVuY29kZUFzeW5jIiwicGFyc2UuZGVjb2RlQXN5bmMiLCJwYXJzZS5zYWZlRW5jb2RlIiwicGFyc2Uuc2FmZURlY29kZSIsInBhcnNlLnNhZmVFbmNvZGVBc3luYyIsInBhcnNlLnNhZmVEZWNvZGVBc3luYyIsInV0aWwubWVyZ2VEZWZzIiwiY29yZS5jbG9uZSIsImNoZWNrcy5vdmVyd3JpdGUiLCJwcm9jZXNzb3JzLnN0cmluZ1Byb2Nlc3NvciIsImNoZWNrcy5yZWdleCIsImNoZWNrcy5pbmNsdWRlcyIsImNoZWNrcy5zdGFydHNXaXRoIiwiY2hlY2tzLmVuZHNXaXRoIiwiY2hlY2tzLm1pbkxlbmd0aCIsImNoZWNrcy5tYXhMZW5ndGgiLCJjaGVja3MubGVuZ3RoIiwiY2hlY2tzLmxvd2VyY2FzZSIsImNoZWNrcy51cHBlcmNhc2UiLCJjaGVja3MudHJpbSIsImNoZWNrcy5ub3JtYWxpemUiLCJjaGVja3MudG9Mb3dlckNhc2UiLCJjaGVja3MudG9VcHBlckNhc2UiLCJjaGVja3Muc2x1Z2lmeSIsImNvcmUuX2VtYWlsIiwiY29yZS5fdXJsIiwiY29yZS5fand0IiwiY29yZS5fZW1vamkiLCJjb3JlLl9ndWlkIiwiY29yZS5fdXVpZCIsImNvcmUuX3V1aWR2NCIsImNvcmUuX3V1aWR2NiIsImNvcmUuX3V1aWR2NyIsImNvcmUuX25hbm9pZCIsImNvcmUuX2N1aWQiLCJjb3JlLl9jdWlkMiIsImNvcmUuX3VsaWQiLCJjb3JlLl9iYXNlNjQiLCJjb3JlLl9iYXNlNjR1cmwiLCJjb3JlLl94aWQiLCJjb3JlLl9rc3VpZCIsImNvcmUuX2lwdjQiLCJjb3JlLl9pcHY2IiwiY29yZS5fY2lkcnY0IiwiY29yZS5fY2lkcnY2IiwiY29yZS5fZTE2NCIsImlzby5kYXRldGltZSIsImlzby5kYXRlIiwiaXNvLnRpbWUiLCJpc28uZHVyYXRpb24iLCJjb3JlLl9zdHJpbmciLCJwcm9jZXNzb3JzLm51bWJlclByb2Nlc3NvciIsImNoZWNrcy5ndCIsImNoZWNrcy5ndGUiLCJjaGVja3MubHQiLCJjaGVja3MubHRlIiwiY2hlY2tzLm11bHRpcGxlT2YiLCJjb3JlLl9udW1iZXIiLCJjb3JlLl9pbnQiLCJwcm9jZXNzb3JzLmJvb2xlYW5Qcm9jZXNzb3IiLCJjb3JlLl9ib29sZWFuIiwicHJvY2Vzc29ycy51bmtub3duUHJvY2Vzc29yIiwiY29yZS5fdW5rbm93biIsInByb2Nlc3NvcnMubmV2ZXJQcm9jZXNzb3IiLCJjb3JlLl9uZXZlciIsInByb2Nlc3NvcnMuYXJyYXlQcm9jZXNzb3IiLCJjb3JlLl9hcnJheSIsInByb2Nlc3NvcnMub2JqZWN0UHJvY2Vzc29yIiwidXRpbC5leHRlbmQiLCJ1dGlsLnNhZmVFeHRlbmQiLCJ1dGlsLm1lcmdlIiwidXRpbC5waWNrIiwidXRpbC5vbWl0IiwidXRpbC5wYXJ0aWFsIiwidXRpbC5yZXF1aXJlZCIsInV0aWwubm9ybWFsaXplUGFyYW1zIiwicHJvY2Vzc29ycy51bmlvblByb2Nlc3NvciIsInByb2Nlc3NvcnMuaW50ZXJzZWN0aW9uUHJvY2Vzc29yIiwicHJvY2Vzc29ycy50dXBsZVByb2Nlc3NvciIsImNvcmUuJFpvZFR5cGUiLCJwcm9jZXNzb3JzLnJlY29yZFByb2Nlc3NvciIsInByb2Nlc3NvcnMuZW51bVByb2Nlc3NvciIsInByb2Nlc3NvcnMubGl0ZXJhbFByb2Nlc3NvciIsInByb2Nlc3NvcnMudHJhbnNmb3JtUHJvY2Vzc29yIiwiY29yZS4kWm9kRW5jb2RlRXJyb3IiLCJpc3N1ZSIsInV0aWwuaXNzdWUiLCJwcm9jZXNzb3JzLm9wdGlvbmFsUHJvY2Vzc29yIiwicHJvY2Vzc29ycy5udWxsYWJsZVByb2Nlc3NvciIsInByb2Nlc3NvcnMuZGVmYXVsdFByb2Nlc3NvciIsInV0aWwuc2hhbGxvd0Nsb25lIiwicHJvY2Vzc29ycy5wcmVmYXVsdFByb2Nlc3NvciIsInByb2Nlc3NvcnMubm9ub3B0aW9uYWxQcm9jZXNzb3IiLCJwcm9jZXNzb3JzLmNhdGNoUHJvY2Vzc29yIiwicHJvY2Vzc29ycy5waXBlUHJvY2Vzc29yIiwicHJvY2Vzc29ycy5yZWFkb25seVByb2Nlc3NvciIsInByb2Nlc3NvcnMuY3VzdG9tUHJvY2Vzc29yIiwiY29yZS5fcmVmaW5lIiwiY29yZS5fc3VwZXJSZWZpbmUiXSwic291cmNlcyI6WyIuLi8uLi9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvZGVmaW5lLWJhY2tncm91bmQubWpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0B3eHQtZGV2L2Jyb3dzZXIvc3JjL2luZGV4Lm1qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy93eHQvZGlzdC9icm93c2VyLm1qcyIsIi4uLy4uL3NyYy9kb21haW4vaWRzLnRzIiwiLi4vLi4vc3JjL2RvbWFpbi9lcnJvcnMudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvem9kL3Y0L2NvcmUvY29yZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS91dGlsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL2Vycm9ycy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS9wYXJzZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS9yZWdleGVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL2NoZWNrcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS9kb2MuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvem9kL3Y0L2NvcmUvdmVyc2lvbnMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvem9kL3Y0L2NvcmUvc2NoZW1hcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS9yZWdpc3RyaWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL2FwaS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS90by1qc29uLXNjaGVtYS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS9qc29uLXNjaGVtYS1wcm9jZXNzb3JzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3pvZC92NC9jbGFzc2ljL2lzby5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY2xhc3NpYy9lcnJvcnMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvem9kL3Y0L2NsYXNzaWMvcGFyc2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvem9kL3Y0L2NsYXNzaWMvc2NoZW1hcy5qcyIsIi4uLy4uL3NyYy9kb21haW4vbm9ybWFsaXplLnRzIiwiLi4vLi4vc3JjL2RvbWFpbi9zYWZldHkudHMiLCIuLi8uLi9zcmMvZG9tYWluL3RyYXAudHMiLCIuLi8uLi9zcmMvZG9tYWluL2RlbGYudHMiLCIuLi8uLi9zcmMvZG9tYWluL3Byb2ZpbGUudHMiLCIuLi8uLi9zcmMvZG9tYWluL21lc3NhZ2VzLnRzIiwiLi4vLi4vc3JjL2RvbWFpbi91cmwtc3VwcG9ydC50cyIsIi4uLy4uL3NyYy9zdG9yYWdlL2FyZWEudHMiLCIuLi8uLi9zcmMvc3RvcmFnZS9rZXlzLnRzIiwiLi4vLi4vc3JjL3N0b3JhZ2UvcHJvZmlsZS1zdG9yZS50cyIsIi4uLy4uL3NyYy9zdG9yYWdlL3Nlc3Npb24tc3RvcmUudHMiLCIuLi8uLi9zcmMvc3RvcmFnZS9wcm92aWRlci1zZXR0aW5ncy50cyIsIi4uLy4uL3NyYy9zdG9yYWdlL3Byb3ZpZGVyLWNhY2hlLnRzIiwiLi4vLi4vc3JjL3Byb3ZpZGVyL2NsaWVudC50cyIsIi4uLy4uL3NyYy9wcm92aWRlci9nZW5lcmF0ZS13aXRoLWNhY2hlLnRzIiwiLi4vLi4vc3JjL2VudHJ5cG9pbnRzL2JhY2tncm91bmQudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQHdlYmV4dC1jb3JlL21hdGNoLXBhdHRlcm5zL2Rpc3QvaW5kZXgubWpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vI3JlZ2lvbiBzcmMvdXRpbHMvZGVmaW5lLWJhY2tncm91bmQudHNcbmZ1bmN0aW9uIGRlZmluZUJhY2tncm91bmQoYXJnKSB7XG5cdGlmIChhcmcgPT0gbnVsbCB8fCB0eXBlb2YgYXJnID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB7IG1haW46IGFyZyB9O1xuXHRyZXR1cm4gYXJnO1xufVxuLy8jZW5kcmVnaW9uXG5leHBvcnQgeyBkZWZpbmVCYWNrZ3JvdW5kIH07XG4iLCIvLyAjcmVnaW9uIHNuaXBwZXRcclxuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSBnbG9iYWxUaGlzLmJyb3dzZXI/LnJ1bnRpbWU/LmlkXHJcbiAgPyBnbG9iYWxUaGlzLmJyb3dzZXJcclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xyXG4vLyAjZW5kcmVnaW9uIHNuaXBwZXRcclxuIiwiaW1wb3J0IHsgYnJvd3NlciBhcyBicm93c2VyJDEgfSBmcm9tIFwiQHd4dC1kZXYvYnJvd3NlclwiO1xuLy8jcmVnaW9uIHNyYy9icm93c2VyLnRzXG4vKipcbiogQ29udGFpbnMgdGhlIGBicm93c2VyYCBleHBvcnQgd2hpY2ggeW91IHNob3VsZCB1c2UgdG8gYWNjZXNzIHRoZSBleHRlbnNpb25cbiogQVBJcyBpbiB5b3VyIHByb2plY3Q6XG4qXG4qIGBgYHRzXG4qIGltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICd3eHQvYnJvd3Nlcic7XG4qXG4qIGJyb3dzZXIucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XG4qICAgLy8gLi4uXG4qIH0pO1xuKiBgYGBcbipcbiogQG1vZHVsZSB3eHQvYnJvd3NlclxuKi9cbmNvbnN0IGJyb3dzZXIgPSBicm93c2VyJDE7XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGJyb3dzZXIgfTtcbiIsIi8qKlxyXG4gKiBJZGVudGlmaWVyIGdlbmVyYXRpb24uXHJcbiAqXHJcbiAqIGBzZXNzaW9uSWRgIGlzIG1pbnRlZCBwZXIgYWN0aXZhdGlvbjsgYGludGVyYWN0aW9uSWRgIHBlciBhbnN3ZXIuIEJvdGggYXJlXHJcbiAqIHJhbmRvbSBhbmQgbG9jYWwg4oCUIHRoZXkgYXJlIG5ldmVyIHNlbnQgYW55d2hlcmUgYW5kIGFyZSBub3Qgc3RhYmxlIGFjcm9zc1xyXG4gKiBpbnN0YWxscywgc28gdGhleSBjYW5ub3QgaWRlbnRpZnkgYSB1c2VyLlxyXG4gKi9cclxuXHJcbmNvbnN0IElEX0FMUEhBQkVUID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSc7XHJcblxyXG5mdW5jdGlvbiByYW5kb21Ub2tlbihsZW5ndGg6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShsZW5ndGgpO1xyXG4gIGdsb2JhbFRoaXMuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhieXRlcyk7XHJcbiAgbGV0IG91dCA9ICcnO1xyXG4gIGZvciAoY29uc3QgYnl0ZSBvZiBieXRlcykge1xyXG4gICAgb3V0ICs9IElEX0FMUEhBQkVUW2J5dGUgJSBJRF9BTFBIQUJFVC5sZW5ndGhdO1xyXG4gIH1cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbklkKCk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGBzZXNfJHtyYW5kb21Ub2tlbigxNil9YDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUludGVyYWN0aW9uSWQoKTogc3RyaW5nIHtcclxuICByZXR1cm4gYGludF8ke3JhbmRvbVRva2VuKDE2KX1gO1xyXG59XHJcblxyXG4vKipcclxuICogRGV0ZXJtaW5pc3RpYyBpZCBmb3IgYSBwbGFjZWQgdHJhcDogY29uY2VwdCBwbHVzIHdoZXJlIGl0IGxhbmRlZC4gVHdvIHJ1bnNcclxuICogb3ZlciB0aGUgc2FtZSBhcnRpY2xlIHByb2R1Y2UgdGhlIHNhbWUgaWRzLCB3aGljaCBpcyB3aGF0IGtlZXBzIHRoZSBFMkVcclxuICogYXNzZXJ0aW9ucyBhbmQgdGhlIHNlbGVjdGlvbiB0aWUtYnJlYWsgc3RhYmxlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYXBJZChjb25jZXB0SWQ6IHN0cmluZywgYmxvY2tJbmRleDogbnVtYmVyLCBvZmZzZXQ6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGAke2NvbmNlcHRJZH1AJHtibG9ja0luZGV4fToke29mZnNldH1gO1xyXG59XHJcblxyXG4vKiogQSBzaG9ydCwgc3RhYmxlLCBub24tY3J5cHRvZ3JhcGhpYyBoYXNoLiBVc2VkIGZvciBjYWNoZSBrZXlzIG9ubHkuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdGFibGVIYXNoKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGxldCBoMSA9IDB4ODExYzlkYzU7XHJcbiAgbGV0IGgyID0gMHgwMTAwMDE5MztcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICBjb25zdCBjb2RlID0gdmFsdWUuY2hhckNvZGVBdChpKTtcclxuICAgIGgxID0gTWF0aC5pbXVsKGgxIF4gY29kZSwgMHgwMTAwMDE5Myk7XHJcbiAgICBoMiA9IE1hdGguaW11bChoMiArIGNvZGUsIDB4ODVlYmNhNmIpIF4gKGgyID4+PiAxMyk7XHJcbiAgfVxyXG4gIGNvbnN0IGEgPSAoaDEgPj4+IDApLnRvU3RyaW5nKDM2KTtcclxuICBjb25zdCBiID0gKGgyID4+PiAwKS50b1N0cmluZygzNik7XHJcbiAgcmV0dXJuIGAke2F9JHtifWA7XHJcbn1cclxuIiwiLyoqXHJcbiAqIFR5cGVkIGZhaWx1cmUgdm9jYWJ1bGFyeSBzaGFyZWQgYnkgdGhlIHBvcHVwLCBiYWNrZ3JvdW5kIHdvcmtlciwgY29udGVudFxyXG4gKiBydW50aW1lIGFuZCB0aGUgbG9vcGJhY2sgZ2VuZXJhdGlvbiBBUEkuXHJcbiAqXHJcbiAqIEV2ZXJ5IGJvdW5kYXJ5IGluIEVjbGlwc2UgcmV0dXJucyBhIGBSZXN1bHRgLCBuZXZlciBhIHRocm93biB2YWx1ZS4gQ2FsbGVyc1xyXG4gKiBicmFuY2ggb24gYG9rYCBhbmQsIHdoZW4gaXQgaXMgYGZhbHNlYCwgb24gYGVycm9yLmNvZGVgLlxyXG4gKi9cclxuXHJcbmV4cG9ydCBjb25zdCBFUlJPUl9DT0RFUyA9IFtcclxuICAnVU5TVVBQT1JURURfVVJMJyxcclxuICAnTk9fQVJUSUNMRScsXHJcbiAgJ05PX0VMSUdJQkxFX1RSQVBTJyxcclxuICAnQ09OVEVOVF9TQ1JJUFRfVU5BVkFJTEFCTEUnLFxyXG4gICdTRVNTSU9OX1JFUExBQ0VEJyxcclxuICAnRE9NX0lOVkFMSURBVEVEJyxcclxuICAnU1RPUkFHRV9FUlJPUicsXHJcbiAgJ1BST0ZJTEVfSU5DT01QQVRJQkxFJyxcclxuICAnUFJPVklERVJfRElTQUJMRUQnLFxyXG4gICdQUk9WSURFUl9QRVJNSVNTSU9OX0RFTklFRCcsXHJcbiAgJ1BST1ZJREVSX1VOQVZBSUxBQkxFJyxcclxuICAnUFJPVklERVJfVElNRU9VVCcsXHJcbiAgJ1BST1ZJREVSX0lOVkFMSURfUkVTUE9OU0UnLFxyXG4gICdNRVNTQUdFX1VOU1VQUE9SVEVEJyxcclxuICAnVU5LTk9XTl9FUlJPUicsXHJcbl0gYXMgY29uc3Q7XHJcblxyXG5leHBvcnQgdHlwZSBFcnJvckNvZGUgPSAodHlwZW9mIEVSUk9SX0NPREVTKVtudW1iZXJdO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBvbmUgdGhpbmcgYSBsZWFybmVyIGNhbiBhY3R1YWxseSBkbyBhYm91dCBhIG1lc3NhZ2UgdGhlIGV4dGVuc2lvbiBkb2VzXHJcbiAqIG5vdCB1bmRlcnN0YW5kLiBDaHJvbWUga2VlcHMgYSBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgc2VydmljZSB3b3JrZXIgYWxpdmVcclxuICogYWNyb3NzIGEgcmVidWlsZCwgc28gYSBmcmVzaGx5IGJ1aWx0IHBvcHVwIGNhbiBlbmQgdXAgdGFsa2luZyB0byBhIHdvcmtlclxyXG4gKiBjb21waWxlZCBmcm9tIG9sZGVyIHNvdXJjZTsgcmVsb2FkaW5nIHRoZSBleHRlbnNpb24gcmUtcmVnaXN0ZXJzIGJvdGggaGFsdmVzXHJcbiAqIGZyb20gdGhlIHNhbWUgYnVpbGQuXHJcbiAqL1xyXG4vKipcclxuICogRWNsaXBzZSdzIEFJIGdlbmVyYXRpb24gcnVucyBvbiBhIHNlcnZlciB0aGUgbGVhcm5lciBzdGFydHMgdGhlbXNlbHZlcywgc29cclxuICogXCJ1bnJlYWNoYWJsZVwiIGhhcyBleGFjdGx5IG9uZSBjb21tb24gY2F1c2UgYW5kIGV4YWN0bHkgb25lIGZpeC4gU2F5aW5nIG9ubHlcclxuICogdGhhdCB0aGUgQVBJIGNvdWxkIG5vdCBiZSByZWFjaGVkIGxlYXZlcyBzb21lb25lIGd1ZXNzaW5nIGJldHdlZW4gYSBzdG9wcGVkXHJcbiAqIHByb2Nlc3MsIGEgbWlzc2luZyBrZXkgYW5kIGEgYnJva2VuIG5ldHdvcms7IG5hbWluZyB0aGUgY29tbWFuZCBkb2VzIG5vdC5cclxuICovXHJcbmV4cG9ydCBjb25zdCBMT0NBTF9BUElfTUVTU0FHRSA9XHJcbiAgJ0VjbGlwc2UgY291bGQgbm90IHJlYWNoIGl0cyBsb2NhbCBBSSBzZXJ2aWNlIG9uIGh0dHA6Ly9sb2NhbGhvc3Q6ODc4Ny4gU3RhcnQgaXQgd2l0aCBcIm5wbSBydW4gYXBpXCIgaW4gdGhlIEVjbGlwc2UgcHJvamVjdCwgdGhlbiBwcmVzcyBTdGFydCBFY2xpcHNlIGFnYWluLic7XHJcblxyXG5leHBvcnQgY29uc3QgU1RBTEVfV09SS0VSX01FU1NBR0UgPVxyXG4gICdFY2xpcHNlIGlzIHN0aWxsIGZpbmlzaGluZyBhbiB1cGRhdGUsIHNvIGl0cyBiYWNrZ3JvdW5kIHdvcmtlciBkaWQgbm90IHVuZGVyc3RhbmQgdGhhdCByZXF1ZXN0LiBSZWxvYWQgRWNsaXBzZSB0byBmaW5pc2ggdXBkYXRpbmcuJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRWNsaXBzZUZhaWx1cmVEZXRhaWwge1xyXG4gIGNvZGU6IEVycm9yQ29kZTtcclxuICBtZXNzYWdlOiBzdHJpbmc7XHJcbiAgcmVjb3ZlcmFibGU6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIFN1Y2Nlc3M8VD4gPSB7IG9rOiB0cnVlOyBkYXRhOiBUIH07XHJcblxyXG5leHBvcnQgdHlwZSBGYWlsdXJlID0geyBvazogZmFsc2U7IGVycm9yOiBFY2xpcHNlRmFpbHVyZURldGFpbCB9O1xyXG5cclxuZXhwb3J0IHR5cGUgUmVzdWx0PFQ+ID0gU3VjY2VzczxUPiB8IEZhaWx1cmU7XHJcblxyXG4vKipcclxuICogV2hldGhlciBhIGNvZGUgZGVzY3JpYmVzIGEgY29uZGl0aW9uIHRoZSB1c2VyIGNhbiBhY3Qgb24gd2l0aG91dCByZWxvYWRpbmdcclxuICogdGhlIGV4dGVuc2lvbi4gUmVjb3ZlcmFibGUgZmFpbHVyZXMgYXJlIHN1cmZhY2VkIGFzIGlubGluZSBwb3B1cCBzdGF0dXM7XHJcbiAqIHVucmVjb3ZlcmFibGUgb25lcyBlbmQgdGhlIHNlc3Npb24uXHJcbiAqL1xyXG5jb25zdCBSRUNPVkVSQUJMRV9CWV9ERUZBVUxUOiBSZWFkb25seTxSZWNvcmQ8RXJyb3JDb2RlLCBib29sZWFuPj4gPSB7XHJcbiAgVU5TVVBQT1JURURfVVJMOiB0cnVlLFxyXG4gIE5PX0FSVElDTEU6IHRydWUsXHJcbiAgTk9fRUxJR0lCTEVfVFJBUFM6IHRydWUsXHJcbiAgQ09OVEVOVF9TQ1JJUFRfVU5BVkFJTEFCTEU6IHRydWUsXHJcbiAgU0VTU0lPTl9SRVBMQUNFRDogdHJ1ZSxcclxuICBET01fSU5WQUxJREFURUQ6IGZhbHNlLFxyXG4gIFNUT1JBR0VfRVJST1I6IHRydWUsXHJcbiAgUFJPRklMRV9JTkNPTVBBVElCTEU6IGZhbHNlLFxyXG4gIFBST1ZJREVSX0RJU0FCTEVEOiB0cnVlLFxyXG4gIFBST1ZJREVSX1BFUk1JU1NJT05fREVOSUVEOiB0cnVlLFxyXG4gIFBST1ZJREVSX1VOQVZBSUxBQkxFOiB0cnVlLFxyXG4gIFBST1ZJREVSX1RJTUVPVVQ6IHRydWUsXHJcbiAgUFJPVklERVJfSU5WQUxJRF9SRVNQT05TRTogdHJ1ZSxcclxuICBNRVNTQUdFX1VOU1VQUE9SVEVEOiB0cnVlLFxyXG4gIFVOS05PV05fRVJST1I6IGZhbHNlLFxyXG59O1xyXG5cclxuLyoqIEh1bWFuLXJlYWRhYmxlIGRlZmF1bHQgY29weS4gQ2FsbGVycyBtYXkgb3ZlcnJpZGUgd2l0aCBzb21ldGhpbmcgc3BlY2lmaWMuICovXHJcbmNvbnN0IERFRkFVTFRfTUVTU0FHRTogUmVhZG9ubHk8UmVjb3JkPEVycm9yQ29kZSwgc3RyaW5nPj4gPSB7XHJcbiAgVU5TVVBQT1JURURfVVJMOiAnRWNsaXBzZSBvbmx5IHJ1bnMgb24gcmVndWxhciBodHRwKHMpIHdlYiBwYWdlcy4nLFxyXG4gIE5PX0FSVElDTEU6ICdObyByZWFkYWJsZSBhcnRpY2xlIHdhcyBmb3VuZCBvbiB0aGlzIHBhZ2UuJyxcclxuICBOT19FTElHSUJMRV9UUkFQUzpcclxuICAgICdFY2xpcHNlIGNvdWxkIG5vdCBwcmVwYXJlIGxldmVsLW1hdGNoZWQgRnJlbmNoIHZvY2FidWxhcnkgZm9yIHRoaXMgYXJ0aWNsZS4gQ2hlY2sgdGhhdCB0aGUgQUkgc2VydmljZSBpcyBydW5uaW5nLCB0aGVuIHJldHJ5LicsXHJcbiAgQ09OVEVOVF9TQ1JJUFRfVU5BVkFJTEFCTEU6ICdFY2xpcHNlIGNvdWxkIG5vdCBhdHRhY2ggdG8gdGhpcyB0YWIuIFJlbG9hZCB0aGUgcGFnZSBhbmQgcmV0cnkuJyxcclxuICBTRVNTSU9OX1JFUExBQ0VEOiAnRWNsaXBzZSBtb3ZlZCB0byBhbm90aGVyIHRhYi4nLFxyXG4gIERPTV9JTlZBTElEQVRFRDogJ1RoZSBwYWdlIGNoYW5nZWQgdW5kZXJuZWF0aCBFY2xpcHNlLCBzbyB0aGUgc2Vzc2lvbiB3YXMgZW5kZWQgc2FmZWx5LicsXHJcbiAgU1RPUkFHRV9FUlJPUjogJ1lvdXIgcHJvZ3Jlc3MgY291bGQgbm90IGJlIHNhdmVkLicsXHJcbiAgUFJPRklMRV9JTkNPTVBBVElCTEU6ICdTYXZlZCBsZWFybmluZyBkYXRhIHdhcyB3cml0dGVuIGJ5IGEgbmV3ZXIgdmVyc2lvbiBvZiBFY2xpcHNlLicsXHJcbiAgUFJPVklERVJfRElTQUJMRUQ6ICdUaGUgQUkgdm9jYWJ1bGFyeSBzZXJ2aWNlIGlzIG5vdCBjb25maWd1cmVkLicsXHJcbiAgUFJPVklERVJfUEVSTUlTU0lPTl9ERU5JRUQ6ICdQZXJtaXNzaW9uIGZvciB0aGUgbG9jYWwgZ2VuZXJhdGlvbiBBUEkgd2FzIG5vdCBncmFudGVkLicsXHJcbiAgUFJPVklERVJfVU5BVkFJTEFCTEU6IExPQ0FMX0FQSV9NRVNTQUdFLFxyXG4gIFBST1ZJREVSX1RJTUVPVVQ6ICdUaGUgbG9jYWwgZ2VuZXJhdGlvbiBBUEkgdG9vayB0b28gbG9uZy4nLFxyXG4gIFBST1ZJREVSX0lOVkFMSURfUkVTUE9OU0U6ICdUaGUgbG9jYWwgZ2VuZXJhdGlvbiBBUEkgcmV0dXJuZWQgc29tZXRoaW5nIEVjbGlwc2UgY2Fubm90IHRydXN0LicsXHJcbiAgTUVTU0FHRV9VTlNVUFBPUlRFRDogU1RBTEVfV09SS0VSX01FU1NBR0UsXHJcbiAgVU5LTk9XTl9FUlJPUjogJ1NvbWV0aGluZyB1bmV4cGVjdGVkIGhhcHBlbmVkLicsXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3VjY2VzczxUPihkYXRhOiBUKTogU3VjY2VzczxUPiB7XHJcbiAgcmV0dXJuIHsgb2s6IHRydWUsIGRhdGEgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZhaWx1cmUoY29kZTogRXJyb3JDb2RlLCBtZXNzYWdlPzogc3RyaW5nLCByZWNvdmVyYWJsZT86IGJvb2xlYW4pOiBGYWlsdXJlIHtcclxuICByZXR1cm4ge1xyXG4gICAgb2s6IGZhbHNlLFxyXG4gICAgZXJyb3I6IHtcclxuICAgICAgY29kZSxcclxuICAgICAgbWVzc2FnZTogbWVzc2FnZSA/PyBERUZBVUxUX01FU1NBR0VbY29kZV0sXHJcbiAgICAgIHJlY292ZXJhYmxlOiByZWNvdmVyYWJsZSA/PyBSRUNPVkVSQUJMRV9CWV9ERUZBVUxUW2NvZGVdLFxyXG4gICAgfSxcclxuICB9O1xyXG59XHJcblxyXG4vKiogQW4gZXJyb3IgY2FycnlpbmcgYW4gRWNsaXBzZSBjb2RlLCBmb3IgdGhlIGZldyBwbGFjZXMgYSB0aHJvdyBpcyBuYXR1cmFsLiAqL1xyXG5leHBvcnQgY2xhc3MgRWNsaXBzZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gIHJlYWRvbmx5IGNvZGU6IEVycm9yQ29kZTtcclxuICByZWFkb25seSByZWNvdmVyYWJsZTogYm9vbGVhbjtcclxuXHJcbiAgY29uc3RydWN0b3IoY29kZTogRXJyb3JDb2RlLCBtZXNzYWdlPzogc3RyaW5nLCByZWNvdmVyYWJsZT86IGJvb2xlYW4pIHtcclxuICAgIHN1cGVyKG1lc3NhZ2UgPz8gREVGQVVMVF9NRVNTQUdFW2NvZGVdKTtcclxuICAgIHRoaXMubmFtZSA9ICdFY2xpcHNlRXJyb3InO1xyXG4gICAgdGhpcy5jb2RlID0gY29kZTtcclxuICAgIHRoaXMucmVjb3ZlcmFibGUgPSByZWNvdmVyYWJsZSA/PyBSRUNPVkVSQUJMRV9CWV9ERUZBVUxUW2NvZGVdO1xyXG4gIH1cclxuXHJcbiAgdG9GYWlsdXJlKCk6IEZhaWx1cmUge1xyXG4gICAgcmV0dXJuIGZhaWx1cmUodGhpcy5jb2RlLCB0aGlzLm1lc3NhZ2UsIHRoaXMucmVjb3ZlcmFibGUpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRXJyb3JDb2RlKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgRXJyb3JDb2RlIHtcclxuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAoRVJST1JfQ09ERVMgYXMgcmVhZG9ubHkgc3RyaW5nW10pLmluY2x1ZGVzKHZhbHVlKTtcclxufVxyXG5cclxuLyoqIE5vcm1hbGlzZSBhbnl0aGluZyBjYXVnaHQgaW4gYSBgY2F0Y2hgIGludG8gYSBgRmFpbHVyZWAuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b0ZhaWx1cmUoY2F1c2U6IHVua25vd24sIGZhbGxiYWNrOiBFcnJvckNvZGUgPSAnVU5LTk9XTl9FUlJPUicpOiBGYWlsdXJlIHtcclxuICBpZiAoY2F1c2UgaW5zdGFuY2VvZiBFY2xpcHNlRXJyb3IpIHJldHVybiBjYXVzZS50b0ZhaWx1cmUoKTtcclxuICBpZiAoY2F1c2UgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIGZhaWx1cmUoZmFsbGJhY2ssIGNhdXNlLm1lc3NhZ2UpO1xyXG4gIHJldHVybiBmYWlsdXJlKGZhbGxiYWNrKTtcclxufVxyXG4iLCJ2YXIgX2E7XHJcbi8qKiBBIHNwZWNpYWwgY29uc3RhbnQgd2l0aCB0eXBlIGBuZXZlcmAgKi9cclxuZXhwb3J0IGNvbnN0IE5FVkVSID0gLypAX19QVVJFX18qLyBPYmplY3QuZnJlZXplKHtcclxuICAgIHN0YXR1czogXCJhYm9ydGVkXCIsXHJcbn0pO1xyXG5leHBvcnQgLypAX19OT19TSURFX0VGRkVDVFNfXyovIGZ1bmN0aW9uICRjb25zdHJ1Y3RvcihuYW1lLCBpbml0aWFsaXplciwgcGFyYW1zKSB7XHJcbiAgICBmdW5jdGlvbiBpbml0KGluc3QsIGRlZikge1xyXG4gICAgICAgIGlmICghaW5zdC5fem9kKSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpbnN0LCBcIl96b2RcIiwge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICBkZWYsXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3RyOiBfLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYWl0czogbmV3IFNldCgpLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGluc3QuX3pvZC50cmFpdHMuaGFzKG5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5zdC5fem9kLnRyYWl0cy5hZGQobmFtZSk7XHJcbiAgICAgICAgaW5pdGlhbGl6ZXIoaW5zdCwgZGVmKTtcclxuICAgICAgICAvLyBzdXBwb3J0IHByb3RvdHlwZSBtb2RpZmljYXRpb25zXHJcbiAgICAgICAgY29uc3QgcHJvdG8gPSBfLnByb3RvdHlwZTtcclxuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMocHJvdG8pO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBrID0ga2V5c1tpXTtcclxuICAgICAgICAgICAgaWYgKCEoayBpbiBpbnN0KSkge1xyXG4gICAgICAgICAgICAgICAgaW5zdFtrXSA9IHByb3RvW2tdLmJpbmQoaW5zdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBkb2Vzbid0IHdvcmsgaWYgUGFyZW50IGhhcyBhIGNvbnN0cnVjdG9yIHdpdGggYXJndW1lbnRzXHJcbiAgICBjb25zdCBQYXJlbnQgPSBwYXJhbXM/LlBhcmVudCA/PyBPYmplY3Q7XHJcbiAgICBjbGFzcyBEZWZpbml0aW9uIGV4dGVuZHMgUGFyZW50IHtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShEZWZpbml0aW9uLCBcIm5hbWVcIiwgeyB2YWx1ZTogbmFtZSB9KTtcclxuICAgIGZ1bmN0aW9uIF8oZGVmKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIGNvbnN0IGluc3QgPSBwYXJhbXM/LlBhcmVudCA/IG5ldyBEZWZpbml0aW9uKCkgOiB0aGlzO1xyXG4gICAgICAgIGluaXQoaW5zdCwgZGVmKTtcclxuICAgICAgICAoX2EgPSBpbnN0Ll96b2QpLmRlZmVycmVkID8/IChfYS5kZWZlcnJlZCA9IFtdKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGZuIG9mIGluc3QuX3pvZC5kZWZlcnJlZCkge1xyXG4gICAgICAgICAgICBmbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW5zdDtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfLCBcImluaXRcIiwgeyB2YWx1ZTogaW5pdCB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfLCBTeW1ib2wuaGFzSW5zdGFuY2UsIHtcclxuICAgICAgICB2YWx1ZTogKGluc3QpID0+IHtcclxuICAgICAgICAgICAgaWYgKHBhcmFtcz8uUGFyZW50ICYmIGluc3QgaW5zdGFuY2VvZiBwYXJhbXMuUGFyZW50KVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnN0Py5fem9kPy50cmFpdHM/LmhhcyhuYW1lKTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXywgXCJuYW1lXCIsIHsgdmFsdWU6IG5hbWUgfSk7XHJcbiAgICByZXR1cm4gXztcclxufVxyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gICBVVElMSVRJRVMgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuZXhwb3J0IGNvbnN0ICRicmFuZCA9IFN5bWJvbChcInpvZF9icmFuZFwiKTtcclxuZXhwb3J0IGNsYXNzICRab2RBc3luY0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoYEVuY291bnRlcmVkIFByb21pc2UgZHVyaW5nIHN5bmNocm9ub3VzIHBhcnNlLiBVc2UgLnBhcnNlQXN5bmMoKSBpbnN0ZWFkLmApO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyAkWm9kRW5jb2RlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XHJcbiAgICAgICAgc3VwZXIoYEVuY291bnRlcmVkIHVuaWRpcmVjdGlvbmFsIHRyYW5zZm9ybSBkdXJpbmcgZW5jb2RlOiAke25hbWV9YCk7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gXCJab2RFbmNvZGVFcnJvclwiO1xyXG4gICAgfVxyXG59XHJcbihfYSA9IGdsb2JhbFRoaXMpLl9fem9kX2dsb2JhbENvbmZpZyA/PyAoX2EuX196b2RfZ2xvYmFsQ29uZmlnID0ge30pO1xyXG5leHBvcnQgY29uc3QgZ2xvYmFsQ29uZmlnID0gZ2xvYmFsVGhpcy5fX3pvZF9nbG9iYWxDb25maWc7XHJcbmV4cG9ydCBmdW5jdGlvbiBjb25maWcobmV3Q29uZmlnKSB7XHJcbiAgICBpZiAobmV3Q29uZmlnKVxyXG4gICAgICAgIE9iamVjdC5hc3NpZ24oZ2xvYmFsQ29uZmlnLCBuZXdDb25maWcpO1xyXG4gICAgcmV0dXJuIGdsb2JhbENvbmZpZztcclxufVxyXG4iLCJpbXBvcnQgeyBnbG9iYWxDb25maWcgfSBmcm9tIFwiLi9jb3JlLmpzXCI7XHJcbi8vIGZ1bmN0aW9uc1xyXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0RXF1YWwodmFsKSB7XHJcbiAgICByZXR1cm4gdmFsO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnROb3RFcXVhbCh2YWwpIHtcclxuICAgIHJldHVybiB2YWw7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydElzKF9hcmcpIHsgfVxyXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0TmV2ZXIoX3gpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgdmFsdWUgaW4gZXhoYXVzdGl2ZSBjaGVja1wiKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0KF8pIHsgfVxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW51bVZhbHVlcyhlbnRyaWVzKSB7XHJcbiAgICBjb25zdCBudW1lcmljVmFsdWVzID0gT2JqZWN0LnZhbHVlcyhlbnRyaWVzKS5maWx0ZXIoKHYpID0+IHR5cGVvZiB2ID09PSBcIm51bWJlclwiKTtcclxuICAgIGNvbnN0IHZhbHVlcyA9IE9iamVjdC5lbnRyaWVzKGVudHJpZXMpXHJcbiAgICAgICAgLmZpbHRlcigoW2ssIF9dKSA9PiBudW1lcmljVmFsdWVzLmluZGV4T2YoK2spID09PSAtMSlcclxuICAgICAgICAubWFwKChbXywgdl0pID0+IHYpO1xyXG4gICAgcmV0dXJuIHZhbHVlcztcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gam9pblZhbHVlcyhhcnJheSwgc2VwYXJhdG9yID0gXCJ8XCIpIHtcclxuICAgIHJldHVybiBhcnJheS5tYXAoKHZhbCkgPT4gc3RyaW5naWZ5UHJpbWl0aXZlKHZhbCkpLmpvaW4oc2VwYXJhdG9yKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24ganNvblN0cmluZ2lmeVJlcGxhY2VyKF8sIHZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJpZ2ludFwiKVxyXG4gICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBjYWNoZWQoZ2V0dGVyKSB7XHJcbiAgICBjb25zdCBzZXQgPSBmYWxzZTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0IHZhbHVlKCkge1xyXG4gICAgICAgICAgICBpZiAoIXNldCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBnZXR0ZXIoKTtcclxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcInZhbHVlXCIsIHsgdmFsdWUgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2FjaGVkIHZhbHVlIGFscmVhZHkgc2V0XCIpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBudWxsaXNoKGlucHV0KSB7XHJcbiAgICByZXR1cm4gaW5wdXQgPT09IG51bGwgfHwgaW5wdXQgPT09IHVuZGVmaW5lZDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5SZWdleChzb3VyY2UpIHtcclxuICAgIGNvbnN0IHN0YXJ0ID0gc291cmNlLnN0YXJ0c1dpdGgoXCJeXCIpID8gMSA6IDA7XHJcbiAgICBjb25zdCBlbmQgPSBzb3VyY2UuZW5kc1dpdGgoXCIkXCIpID8gc291cmNlLmxlbmd0aCAtIDEgOiBzb3VyY2UubGVuZ3RoO1xyXG4gICAgcmV0dXJuIHNvdXJjZS5zbGljZShzdGFydCwgZW5kKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZmxvYXRTYWZlUmVtYWluZGVyKHZhbCwgc3RlcCkge1xyXG4gICAgY29uc3QgcmF0aW8gPSB2YWwgLyBzdGVwO1xyXG4gICAgY29uc3Qgcm91bmRlZFJhdGlvID0gTWF0aC5yb3VuZChyYXRpbyk7XHJcbiAgICAvLyBVc2UgYSByZWxhdGl2ZSBlcHNpbG9uIHNjYWxlZCB0byB0aGUgbWFnbml0dWRlIG9mIHRoZSByZXN1bHRcclxuICAgIGNvbnN0IHRvbGVyYW5jZSA9IE51bWJlci5FUFNJTE9OICogTWF0aC5tYXgoTWF0aC5hYnMocmF0aW8pLCAxKTtcclxuICAgIGlmIChNYXRoLmFicyhyYXRpbyAtIHJvdW5kZWRSYXRpbykgPCB0b2xlcmFuY2UpXHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICByZXR1cm4gcmF0aW8gLSByb3VuZGVkUmF0aW87XHJcbn1cclxuY29uc3QgRVZBTFVBVElORyA9IC8qIEBfX1BVUkVfXyovIFN5bWJvbChcImV2YWx1YXRpbmdcIik7XHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVMYXp5KG9iamVjdCwga2V5LCBnZXR0ZXIpIHtcclxuICAgIGxldCB2YWx1ZSA9IHVuZGVmaW5lZDtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xyXG4gICAgICAgIGdldCgpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSBFVkFMVUFUSU5HKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDaXJjdWxhciByZWZlcmVuY2UgZGV0ZWN0ZWQsIHJldHVybiB1bmRlZmluZWQgdG8gYnJlYWsgdGhlIGN5Y2xlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IEVWQUxVQVRJTkc7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGdldHRlcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldCh2KSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHYsXHJcbiAgICAgICAgICAgICAgICAvLyBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBvYmplY3Rba2V5XSA9IHY7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gb2JqZWN0Q2xvbmUob2JqKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMob2JqKSk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnblByb3AodGFyZ2V0LCBwcm9wLCB2YWx1ZSkge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcCwge1xyXG4gICAgICAgIHZhbHVlLFxyXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlRGVmcyguLi5kZWZzKSB7XHJcbiAgICBjb25zdCBtZXJnZWREZXNjcmlwdG9ycyA9IHt9O1xyXG4gICAgZm9yIChjb25zdCBkZWYgb2YgZGVmcykge1xyXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3JzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZGVmKTtcclxuICAgICAgICBPYmplY3QuYXNzaWduKG1lcmdlZERlc2NyaXB0b3JzLCBkZXNjcmlwdG9ycyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoe30sIG1lcmdlZERlc2NyaXB0b3JzKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY2xvbmVEZWYoc2NoZW1hKSB7XHJcbiAgICByZXR1cm4gbWVyZ2VEZWZzKHNjaGVtYS5fem9kLmRlZik7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnRBdFBhdGgob2JqLCBwYXRoKSB7XHJcbiAgICBpZiAoIXBhdGgpXHJcbiAgICAgICAgcmV0dXJuIG9iajtcclxuICAgIHJldHVybiBwYXRoLnJlZHVjZSgoYWNjLCBrZXkpID0+IGFjYz8uW2tleV0sIG9iaik7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHByb21pc2VBbGxPYmplY3QocHJvbWlzZXNPYmopIHtcclxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhwcm9taXNlc09iaik7XHJcbiAgICBjb25zdCBwcm9taXNlcyA9IGtleXMubWFwKChrZXkpID0+IHByb21pc2VzT2JqW2tleV0pO1xyXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKChyZXN1bHRzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRPYmogPSB7fTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgcmVzb2x2ZWRPYmpba2V5c1tpXV0gPSByZXN1bHRzW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzb2x2ZWRPYmo7XHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tU3RyaW5nKGxlbmd0aCA9IDEwKSB7XHJcbiAgICBjb25zdCBjaGFycyA9IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIjtcclxuICAgIGxldCBzdHIgPSBcIlwiO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHN0ciArPSBjaGFyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFycy5sZW5ndGgpXTtcclxuICAgIH1cclxuICAgIHJldHVybiBzdHI7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGVzYyhzdHIpIHtcclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzdHIpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzbHVnaWZ5KGlucHV0KSB7XHJcbiAgICByZXR1cm4gaW5wdXRcclxuICAgICAgICAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIC50cmltKClcclxuICAgICAgICAucmVwbGFjZSgvW15cXHdcXHMtXS9nLCBcIlwiKVxyXG4gICAgICAgIC5yZXBsYWNlKC9bXFxzXy1dKy9nLCBcIi1cIilcclxuICAgICAgICAucmVwbGFjZSgvXi0rfC0rJC9nLCBcIlwiKTtcclxufVxyXG5leHBvcnQgY29uc3QgY2FwdHVyZVN0YWNrVHJhY2UgPSAoXCJjYXB0dXJlU3RhY2tUcmFjZVwiIGluIEVycm9yID8gRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UgOiAoLi4uX2FyZ3MpID0+IHsgfSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBpc09iamVjdChkYXRhKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIGRhdGEgPT09IFwib2JqZWN0XCIgJiYgZGF0YSAhPT0gbnVsbCAmJiAhQXJyYXkuaXNBcnJheShkYXRhKTtcclxufVxyXG5leHBvcnQgY29uc3QgYWxsb3dzRXZhbCA9IC8qIEBfX1BVUkVfXyovIGNhY2hlZCgoKSA9PiB7XHJcbiAgICAvLyBTa2lwIHRoZSBwcm9iZSB1bmRlciBgaml0bGVzc2A6IHN0cmljdCBDU1BzIHJlcG9ydCB0aGUgY2F1Z2h0IGBuZXcgRnVuY3Rpb25gXHJcbiAgICAvLyBhcyBhIGBzZWN1cml0eXBvbGljeXZpb2xhdGlvbmAgZXZlbiB0aG91Z2ggdGhlIHRocm93IGlzIHN3YWxsb3dlZC5cclxuICAgIGlmIChnbG9iYWxDb25maWcuaml0bGVzcykge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIC8vIEB0cy1pZ25vcmVcclxuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIG5hdmlnYXRvcj8udXNlckFnZW50Py5pbmNsdWRlcyhcIkNsb3VkZmxhcmVcIikpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IEYgPSBGdW5jdGlvbjtcclxuICAgICAgICBuZXcgRihcIlwiKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhdGNoIChfKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qobykge1xyXG4gICAgaWYgKGlzT2JqZWN0KG8pID09PSBmYWxzZSlcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAvLyBtb2RpZmllZCBjb25zdHJ1Y3RvclxyXG4gICAgY29uc3QgY3RvciA9IG8uY29uc3RydWN0b3I7XHJcbiAgICBpZiAoY3RvciA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgaWYgKHR5cGVvZiBjdG9yICE9PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAvLyBtb2RpZmllZCBwcm90b3R5cGVcclxuICAgIGNvbnN0IHByb3QgPSBjdG9yLnByb3RvdHlwZTtcclxuICAgIGlmIChpc09iamVjdChwcm90KSA9PT0gZmFsc2UpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgLy8gY3RvciBkb2Vzbid0IGhhdmUgc3RhdGljIGBpc1Byb3RvdHlwZU9mYFxyXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwcm90LCBcImlzUHJvdG90eXBlT2ZcIikgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNoYWxsb3dDbG9uZShvKSB7XHJcbiAgICBpZiAoaXNQbGFpbk9iamVjdChvKSlcclxuICAgICAgICByZXR1cm4geyAuLi5vIH07XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvKSlcclxuICAgICAgICByZXR1cm4gWy4uLm9dO1xyXG4gICAgaWYgKG8gaW5zdGFuY2VvZiBNYXApXHJcbiAgICAgICAgcmV0dXJuIG5ldyBNYXAobyk7XHJcbiAgICBpZiAobyBpbnN0YW5jZW9mIFNldClcclxuICAgICAgICByZXR1cm4gbmV3IFNldChvKTtcclxuICAgIHJldHVybiBvO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBudW1LZXlzKGRhdGEpIHtcclxuICAgIGxldCBrZXlDb3VudCA9IDA7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBkYXRhKSB7XHJcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpKSB7XHJcbiAgICAgICAgICAgIGtleUNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGtleUNvdW50O1xyXG59XHJcbmV4cG9ydCBjb25zdCBnZXRQYXJzZWRUeXBlID0gKGRhdGEpID0+IHtcclxuICAgIGNvbnN0IHQgPSB0eXBlb2YgZGF0YTtcclxuICAgIHN3aXRjaCAodCkge1xyXG4gICAgICAgIGNhc2UgXCJ1bmRlZmluZWRcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XHJcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJzdHJpbmdcIjtcclxuICAgICAgICBjYXNlIFwibnVtYmVyXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0YSkgPyBcIm5hblwiIDogXCJudW1iZXJcIjtcclxuICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJib29sZWFuXCI7XHJcbiAgICAgICAgY2FzZSBcImZ1bmN0aW9uXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcImZ1bmN0aW9uXCI7XHJcbiAgICAgICAgY2FzZSBcImJpZ2ludFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJiaWdpbnRcIjtcclxuICAgICAgICBjYXNlIFwic3ltYm9sXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcInN5bWJvbFwiO1xyXG4gICAgICAgIGNhc2UgXCJvYmplY3RcIjpcclxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImFycmF5XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIm51bGxcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGF0YS50aGVuICYmIHR5cGVvZiBkYXRhLnRoZW4gPT09IFwiZnVuY3Rpb25cIiAmJiBkYXRhLmNhdGNoICYmIHR5cGVvZiBkYXRhLmNhdGNoID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcInByb21pc2VcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIE1hcCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgTWFwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJtYXBcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIFNldCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgU2V0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJzZXRcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIERhdGUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImRhdGVcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgRmlsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBkYXRhIGluc3RhbmNlb2YgRmlsZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiZmlsZVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBcIm9iamVjdFwiO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBkYXRhIHR5cGU6ICR7dH1gKTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IHByb3BlcnR5S2V5VHlwZXMgPSAvKiBAX19QVVJFX18qLyBuZXcgU2V0KFtcInN0cmluZ1wiLCBcIm51bWJlclwiLCBcInN5bWJvbFwiXSk7XHJcbmV4cG9ydCBjb25zdCBwcmltaXRpdmVUeXBlcyA9IC8qIEBfX1BVUkVfXyovIG5ldyBTZXQoW1xyXG4gICAgXCJzdHJpbmdcIixcclxuICAgIFwibnVtYmVyXCIsXHJcbiAgICBcImJpZ2ludFwiLFxyXG4gICAgXCJib29sZWFuXCIsXHJcbiAgICBcInN5bWJvbFwiLFxyXG4gICAgXCJ1bmRlZmluZWRcIixcclxuXSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBlc2NhcGVSZWdleChzdHIpIHtcclxuICAgIHJldHVybiBzdHIucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csIFwiXFxcXCQmXCIpO1xyXG59XHJcbi8vIHpvZC1zcGVjaWZpYyB1dGlsc1xyXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoaW5zdCwgZGVmLCBwYXJhbXMpIHtcclxuICAgIGNvbnN0IGNsID0gbmV3IGluc3QuX3pvZC5jb25zdHIoZGVmID8/IGluc3QuX3pvZC5kZWYpO1xyXG4gICAgaWYgKCFkZWYgfHwgcGFyYW1zPy5wYXJlbnQpXHJcbiAgICAgICAgY2wuX3pvZC5wYXJlbnQgPSBpbnN0O1xyXG4gICAgcmV0dXJuIGNsO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVQYXJhbXMoX3BhcmFtcykge1xyXG4gICAgY29uc3QgcGFyYW1zID0gX3BhcmFtcztcclxuICAgIGlmICghcGFyYW1zKVxyXG4gICAgICAgIHJldHVybiB7fTtcclxuICAgIGlmICh0eXBlb2YgcGFyYW1zID09PSBcInN0cmluZ1wiKVxyXG4gICAgICAgIHJldHVybiB7IGVycm9yOiAoKSA9PiBwYXJhbXMgfTtcclxuICAgIGlmIChwYXJhbXM/Lm1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGlmIChwYXJhbXM/LmVycm9yICE9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzcGVjaWZ5IGJvdGggYG1lc3NhZ2VgIGFuZCBgZXJyb3JgIHBhcmFtc1wiKTtcclxuICAgICAgICBwYXJhbXMuZXJyb3IgPSBwYXJhbXMubWVzc2FnZTtcclxuICAgIH1cclxuICAgIGRlbGV0ZSBwYXJhbXMubWVzc2FnZTtcclxuICAgIGlmICh0eXBlb2YgcGFyYW1zLmVycm9yID09PSBcInN0cmluZ1wiKVxyXG4gICAgICAgIHJldHVybiB7IC4uLnBhcmFtcywgZXJyb3I6ICgpID0+IHBhcmFtcy5lcnJvciB9O1xyXG4gICAgcmV0dXJuIHBhcmFtcztcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHJhbnNwYXJlbnRQcm94eShnZXR0ZXIpIHtcclxuICAgIGxldCB0YXJnZXQ7XHJcbiAgICByZXR1cm4gbmV3IFByb3h5KHt9LCB7XHJcbiAgICAgICAgZ2V0KF8sIHByb3AsIHJlY2VpdmVyKSB7XHJcbiAgICAgICAgICAgIHRhcmdldCA/PyAodGFyZ2V0ID0gZ2V0dGVyKCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQoXywgcHJvcCwgdmFsdWUsIHJlY2VpdmVyKSB7XHJcbiAgICAgICAgICAgIHRhcmdldCA/PyAodGFyZ2V0ID0gZ2V0dGVyKCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5zZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSwgcmVjZWl2ZXIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaGFzKF8sIHByb3ApIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID8/ICh0YXJnZXQgPSBnZXR0ZXIoKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0Lmhhcyh0YXJnZXQsIHByb3ApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVsZXRlUHJvcGVydHkoXywgcHJvcCkge1xyXG4gICAgICAgICAgICB0YXJnZXQgPz8gKHRhcmdldCA9IGdldHRlcigpKTtcclxuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG93bktleXMoXykge1xyXG4gICAgICAgICAgICB0YXJnZXQgPz8gKHRhcmdldCA9IGdldHRlcigpKTtcclxuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3Qub3duS2V5cyh0YXJnZXQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKF8sIHByb3ApIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID8/ICh0YXJnZXQgPSBnZXR0ZXIoKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3ApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVmaW5lUHJvcGVydHkoXywgcHJvcCwgZGVzY3JpcHRvcikge1xyXG4gICAgICAgICAgICB0YXJnZXQgPz8gKHRhcmdldCA9IGdldHRlcigpKTtcclxuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLCBkZXNjcmlwdG9yKTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeVByaW1pdGl2ZSh2YWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJiaWdpbnRcIilcclxuICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKSArIFwiblwiO1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIilcclxuICAgICAgICByZXR1cm4gYFwiJHt2YWx1ZX1cImA7XHJcbiAgICByZXR1cm4gYCR7dmFsdWV9YDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxLZXlzKHNoYXBlKSB7XHJcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc2hhcGUpLmZpbHRlcigoaykgPT4ge1xyXG4gICAgICAgIHJldHVybiBzaGFwZVtrXS5fem9kLm9wdGluID09PSBcIm9wdGlvbmFsXCIgJiYgc2hhcGVba10uX3pvZC5vcHRvdXQgPT09IFwib3B0aW9uYWxcIjtcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBOVU1CRVJfRk9STUFUX1JBTkdFUyA9IHtcclxuICAgIHNhZmVpbnQ6IFtOdW1iZXIuTUlOX1NBRkVfSU5URUdFUiwgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJdLFxyXG4gICAgaW50MzI6IFstMjE0NzQ4MzY0OCwgMjE0NzQ4MzY0N10sXHJcbiAgICB1aW50MzI6IFswLCA0Mjk0OTY3Mjk1XSxcclxuICAgIGZsb2F0MzI6IFstMy40MDI4MjM0NjYzODUyODg2ZTM4LCAzLjQwMjgyMzQ2NjM4NTI4ODZlMzhdLFxyXG4gICAgZmxvYXQ2NDogWy1OdW1iZXIuTUFYX1ZBTFVFLCBOdW1iZXIuTUFYX1ZBTFVFXSxcclxufTtcclxuZXhwb3J0IGNvbnN0IEJJR0lOVF9GT1JNQVRfUkFOR0VTID0ge1xyXG4gICAgaW50NjQ6IFsvKiBAX19QVVJFX18qLyBCaWdJbnQoXCItOTIyMzM3MjAzNjg1NDc3NTgwOFwiKSwgLyogQF9fUFVSRV9fKi8gQmlnSW50KFwiOTIyMzM3MjAzNjg1NDc3NTgwN1wiKV0sXHJcbiAgICB1aW50NjQ6IFsvKiBAX19QVVJFX18qLyBCaWdJbnQoMCksIC8qIEBfX1BVUkVfXyovIEJpZ0ludChcIjE4NDQ2NzQ0MDczNzA5NTUxNjE1XCIpXSxcclxufTtcclxuZXhwb3J0IGZ1bmN0aW9uIHBpY2soc2NoZW1hLCBtYXNrKSB7XHJcbiAgICBjb25zdCBjdXJyRGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAgY29uc3QgY2hlY2tzID0gY3VyckRlZi5jaGVja3M7XHJcbiAgICBjb25zdCBoYXNDaGVja3MgPSBjaGVja3MgJiYgY2hlY2tzLmxlbmd0aCA+IDA7XHJcbiAgICBpZiAoaGFzQ2hlY2tzKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiLnBpY2soKSBjYW5ub3QgYmUgdXNlZCBvbiBvYmplY3Qgc2NoZW1hcyBjb250YWluaW5nIHJlZmluZW1lbnRzXCIpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZGVmID0gbWVyZ2VEZWZzKHNjaGVtYS5fem9kLmRlZiwge1xyXG4gICAgICAgIGdldCBzaGFwZSgpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3U2hhcGUgPSB7fTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbWFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCEoa2V5IGluIGN1cnJEZWYuc2hhcGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnJlY29nbml6ZWQga2V5OiBcIiR7a2V5fVwiYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIW1hc2tba2V5XSlcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIG5ld1NoYXBlW2tleV0gPSBjdXJyRGVmLnNoYXBlW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXNzaWduUHJvcCh0aGlzLCBcInNoYXBlXCIsIG5ld1NoYXBlKTsgLy8gc2VsZi1jYWNoaW5nXHJcbiAgICAgICAgICAgIHJldHVybiBuZXdTaGFwZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNoZWNrczogW10sXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjbG9uZShzY2hlbWEsIGRlZik7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG9taXQoc2NoZW1hLCBtYXNrKSB7XHJcbiAgICBjb25zdCBjdXJyRGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAgY29uc3QgY2hlY2tzID0gY3VyckRlZi5jaGVja3M7XHJcbiAgICBjb25zdCBoYXNDaGVja3MgPSBjaGVja3MgJiYgY2hlY2tzLmxlbmd0aCA+IDA7XHJcbiAgICBpZiAoaGFzQ2hlY2tzKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiLm9taXQoKSBjYW5ub3QgYmUgdXNlZCBvbiBvYmplY3Qgc2NoZW1hcyBjb250YWluaW5nIHJlZmluZW1lbnRzXCIpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZGVmID0gbWVyZ2VEZWZzKHNjaGVtYS5fem9kLmRlZiwge1xyXG4gICAgICAgIGdldCBzaGFwZSgpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3U2hhcGUgPSB7IC4uLnNjaGVtYS5fem9kLmRlZi5zaGFwZSB9O1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBtYXNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gY3VyckRlZi5zaGFwZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBrZXk6IFwiJHtrZXl9XCJgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICghbWFza1trZXldKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIG5ld1NoYXBlW2tleV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXNzaWduUHJvcCh0aGlzLCBcInNoYXBlXCIsIG5ld1NoYXBlKTsgLy8gc2VsZi1jYWNoaW5nXHJcbiAgICAgICAgICAgIHJldHVybiBuZXdTaGFwZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNoZWNrczogW10sXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjbG9uZShzY2hlbWEsIGRlZik7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZChzY2hlbWEsIHNoYXBlKSB7XHJcbiAgICBpZiAoIWlzUGxhaW5PYmplY3Qoc2hhcGUpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbnB1dCB0byBleHRlbmQ6IGV4cGVjdGVkIGEgcGxhaW4gb2JqZWN0XCIpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgY2hlY2tzID0gc2NoZW1hLl96b2QuZGVmLmNoZWNrcztcclxuICAgIGNvbnN0IGhhc0NoZWNrcyA9IGNoZWNrcyAmJiBjaGVja3MubGVuZ3RoID4gMDtcclxuICAgIGlmIChoYXNDaGVja3MpIHtcclxuICAgICAgICAvLyBPbmx5IHRocm93IGlmIG5ldyBzaGFwZSBvdmVybGFwcyB3aXRoIGV4aXN0aW5nIHNoYXBlXHJcbiAgICAgICAgLy8gVXNlIGdldE93blByb3BlcnR5RGVzY3JpcHRvciB0byBjaGVjayBrZXkgZXhpc3RlbmNlIHdpdGhvdXQgYWNjZXNzaW5nIHZhbHVlc1xyXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nU2hhcGUgPSBzY2hlbWEuX3pvZC5kZWYuc2hhcGU7XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc2hhcGUpIHtcclxuICAgICAgICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZXhpc3RpbmdTaGFwZSwga2V5KSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgb3ZlcndyaXRlIGtleXMgb24gb2JqZWN0IHNjaGVtYXMgY29udGFpbmluZyByZWZpbmVtZW50cy4gVXNlIGAuc2FmZUV4dGVuZCgpYCBpbnN0ZWFkLlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnN0IGRlZiA9IG1lcmdlRGVmcyhzY2hlbWEuX3pvZC5kZWYsIHtcclxuICAgICAgICBnZXQgc2hhcGUoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IF9zaGFwZSA9IHsgLi4uc2NoZW1hLl96b2QuZGVmLnNoYXBlLCAuLi5zaGFwZSB9O1xyXG4gICAgICAgICAgICBhc3NpZ25Qcm9wKHRoaXMsIFwic2hhcGVcIiwgX3NoYXBlKTsgLy8gc2VsZi1jYWNoaW5nXHJcbiAgICAgICAgICAgIHJldHVybiBfc2hhcGU7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNsb25lKHNjaGVtYSwgZGVmKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc2FmZUV4dGVuZChzY2hlbWEsIHNoYXBlKSB7XHJcbiAgICBpZiAoIWlzUGxhaW5PYmplY3Qoc2hhcGUpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbnB1dCB0byBzYWZlRXh0ZW5kOiBleHBlY3RlZCBhIHBsYWluIG9iamVjdFwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGRlZiA9IG1lcmdlRGVmcyhzY2hlbWEuX3pvZC5kZWYsIHtcclxuICAgICAgICBnZXQgc2hhcGUoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IF9zaGFwZSA9IHsgLi4uc2NoZW1hLl96b2QuZGVmLnNoYXBlLCAuLi5zaGFwZSB9O1xyXG4gICAgICAgICAgICBhc3NpZ25Qcm9wKHRoaXMsIFwic2hhcGVcIiwgX3NoYXBlKTsgLy8gc2VsZi1jYWNoaW5nXHJcbiAgICAgICAgICAgIHJldHVybiBfc2hhcGU7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNsb25lKHNjaGVtYSwgZGVmKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2UoYSwgYikge1xyXG4gICAgaWYgKGEuX3pvZC5kZWYuY2hlY2tzPy5sZW5ndGgpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIubWVyZ2UoKSBjYW5ub3QgYmUgdXNlZCBvbiBvYmplY3Qgc2NoZW1hcyBjb250YWluaW5nIHJlZmluZW1lbnRzLiBVc2UgLnNhZmVFeHRlbmQoKSBpbnN0ZWFkLlwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGRlZiA9IG1lcmdlRGVmcyhhLl96b2QuZGVmLCB7XHJcbiAgICAgICAgZ2V0IHNoYXBlKCkge1xyXG4gICAgICAgICAgICBjb25zdCBfc2hhcGUgPSB7IC4uLmEuX3pvZC5kZWYuc2hhcGUsIC4uLmIuX3pvZC5kZWYuc2hhcGUgfTtcclxuICAgICAgICAgICAgYXNzaWduUHJvcCh0aGlzLCBcInNoYXBlXCIsIF9zaGFwZSk7IC8vIHNlbGYtY2FjaGluZ1xyXG4gICAgICAgICAgICByZXR1cm4gX3NoYXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0IGNhdGNoYWxsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYi5fem9kLmRlZi5jYXRjaGFsbDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNoZWNrczogYi5fem9kLmRlZi5jaGVja3MgPz8gW10sXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjbG9uZShhLCBkZWYpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJ0aWFsKENsYXNzLCBzY2hlbWEsIG1hc2spIHtcclxuICAgIGNvbnN0IGN1cnJEZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBjb25zdCBjaGVja3MgPSBjdXJyRGVmLmNoZWNrcztcclxuICAgIGNvbnN0IGhhc0NoZWNrcyA9IGNoZWNrcyAmJiBjaGVja3MubGVuZ3RoID4gMDtcclxuICAgIGlmIChoYXNDaGVja3MpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIucGFydGlhbCgpIGNhbm5vdCBiZSB1c2VkIG9uIG9iamVjdCBzY2hlbWFzIGNvbnRhaW5pbmcgcmVmaW5lbWVudHNcIik7XHJcbiAgICB9XHJcbiAgICBjb25zdCBkZWYgPSBtZXJnZURlZnMoc2NoZW1hLl96b2QuZGVmLCB7XHJcbiAgICAgICAgZ2V0IHNoYXBlKCkge1xyXG4gICAgICAgICAgICBjb25zdCBvbGRTaGFwZSA9IHNjaGVtYS5fem9kLmRlZi5zaGFwZTtcclxuICAgICAgICAgICAgY29uc3Qgc2hhcGUgPSB7IC4uLm9sZFNoYXBlIH07XHJcbiAgICAgICAgICAgIGlmIChtYXNrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBtYXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoa2V5IGluIG9sZFNoYXBlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBrZXk6IFwiJHtrZXl9XCJgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXNrW2tleV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChvbGRTaGFwZVtrZXldIS5fem9kLm9wdGluID09PSBcIm9wdGlvbmFsXCIpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNoYXBlW2tleV0gPSBDbGFzc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyBDbGFzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9wdGlvbmFsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbm5lclR5cGU6IG9sZFNoYXBlW2tleV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogb2xkU2hhcGVba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9sZFNoYXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKG9sZFNoYXBlW2tleV0hLl96b2Qub3B0aW4gPT09IFwib3B0aW9uYWxcIikgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hhcGVba2V5XSA9IENsYXNzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gbmV3IENsYXNzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib3B0aW9uYWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyVHlwZTogb2xkU2hhcGVba2V5XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgOiBvbGRTaGFwZVtrZXldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFzc2lnblByb3AodGhpcywgXCJzaGFwZVwiLCBzaGFwZSk7IC8vIHNlbGYtY2FjaGluZ1xyXG4gICAgICAgICAgICByZXR1cm4gc2hhcGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjaGVja3M6IFtdLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY2xvbmUoc2NoZW1hLCBkZWYpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiByZXF1aXJlZChDbGFzcywgc2NoZW1hLCBtYXNrKSB7XHJcbiAgICBjb25zdCBkZWYgPSBtZXJnZURlZnMoc2NoZW1hLl96b2QuZGVmLCB7XHJcbiAgICAgICAgZ2V0IHNoYXBlKCkge1xyXG4gICAgICAgICAgICBjb25zdCBvbGRTaGFwZSA9IHNjaGVtYS5fem9kLmRlZi5zaGFwZTtcclxuICAgICAgICAgICAgY29uc3Qgc2hhcGUgPSB7IC4uLm9sZFNoYXBlIH07XHJcbiAgICAgICAgICAgIGlmIChtYXNrKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBtYXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoa2V5IGluIHNoYXBlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBrZXk6IFwiJHtrZXl9XCJgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXNrW2tleV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG92ZXJ3cml0ZSB3aXRoIG5vbi1vcHRpb25hbFxyXG4gICAgICAgICAgICAgICAgICAgIHNoYXBlW2tleV0gPSBuZXcgQ2xhc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm5vbm9wdGlvbmFsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyVHlwZTogb2xkU2hhcGVba2V5XSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG9sZFNoYXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gb3ZlcndyaXRlIHdpdGggbm9uLW9wdGlvbmFsXHJcbiAgICAgICAgICAgICAgICAgICAgc2hhcGVba2V5XSA9IG5ldyBDbGFzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwibm9ub3B0aW9uYWxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJUeXBlOiBvbGRTaGFwZVtrZXldLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFzc2lnblByb3AodGhpcywgXCJzaGFwZVwiLCBzaGFwZSk7IC8vIHNlbGYtY2FjaGluZ1xyXG4gICAgICAgICAgICByZXR1cm4gc2hhcGU7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNsb25lKHNjaGVtYSwgZGVmKTtcclxufVxyXG4vLyBpbnZhbGlkX3R5cGUgfCB0b29fYmlnIHwgdG9vX3NtYWxsIHwgaW52YWxpZF9mb3JtYXQgfCBub3RfbXVsdGlwbGVfb2YgfCB1bnJlY29nbml6ZWRfa2V5cyB8IGludmFsaWRfdW5pb24gfCBpbnZhbGlkX2tleSB8IGludmFsaWRfZWxlbWVudCB8IGludmFsaWRfdmFsdWUgfCBjdXN0b21cclxuZXhwb3J0IGZ1bmN0aW9uIGFib3J0ZWQoeCwgc3RhcnRJbmRleCA9IDApIHtcclxuICAgIGlmICh4LmFib3J0ZWQgPT09IHRydWUpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBmb3IgKGxldCBpID0gc3RhcnRJbmRleDsgaSA8IHguaXNzdWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHguaXNzdWVzW2ldPy5jb250aW51ZSAhPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuLy8gQ2hlY2tzIGZvciBleHBsaWNpdCBhYm9ydCAoY29udGludWUgPT09IGZhbHNlKSwgYXMgb3Bwb3NlZCB0byBpbXBsaWNpdCBhYm9ydCAoY29udGludWUgPT09IHVuZGVmaW5lZCkuXHJcbi8vIFVzZWQgdG8gcmVzcGVjdCBgYWJvcnQ6IHRydWVgIGluIC5yZWZpbmUoKSBldmVuIGZvciBjaGVja3MgdGhhdCBoYXZlIGEgYHdoZW5gIGZ1bmN0aW9uLlxyXG5leHBvcnQgZnVuY3Rpb24gZXhwbGljaXRseUFib3J0ZWQoeCwgc3RhcnRJbmRleCA9IDApIHtcclxuICAgIGlmICh4LmFib3J0ZWQgPT09IHRydWUpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBmb3IgKGxldCBpID0gc3RhcnRJbmRleDsgaSA8IHguaXNzdWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHguaXNzdWVzW2ldPy5jb250aW51ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBwcmVmaXhJc3N1ZXMocGF0aCwgaXNzdWVzKSB7XHJcbiAgICByZXR1cm4gaXNzdWVzLm1hcCgoaXNzKSA9PiB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIChfYSA9IGlzcykucGF0aCA/PyAoX2EucGF0aCA9IFtdKTtcclxuICAgICAgICBpc3MucGF0aC51bnNoaWZ0KHBhdGgpO1xyXG4gICAgICAgIHJldHVybiBpc3M7XHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwTWVzc2FnZShtZXNzYWdlKSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIG1lc3NhZ2UgPT09IFwic3RyaW5nXCIgPyBtZXNzYWdlIDogbWVzc2FnZT8ubWVzc2FnZTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29uZmlnKSB7XHJcbiAgICBjb25zdCBtZXNzYWdlID0gaXNzLm1lc3NhZ2VcclxuICAgICAgICA/IGlzcy5tZXNzYWdlXHJcbiAgICAgICAgOiAodW53cmFwTWVzc2FnZShpc3MuaW5zdD8uX3pvZC5kZWY/LmVycm9yPy4oaXNzKSkgPz9cclxuICAgICAgICAgICAgdW53cmFwTWVzc2FnZShjdHg/LmVycm9yPy4oaXNzKSkgPz9cclxuICAgICAgICAgICAgdW53cmFwTWVzc2FnZShjb25maWcuY3VzdG9tRXJyb3I/Lihpc3MpKSA/P1xyXG4gICAgICAgICAgICB1bndyYXBNZXNzYWdlKGNvbmZpZy5sb2NhbGVFcnJvcj8uKGlzcykpID8/XHJcbiAgICAgICAgICAgIFwiSW52YWxpZCBpbnB1dFwiKTtcclxuICAgIGNvbnN0IHsgaW5zdDogX2luc3QsIGNvbnRpbnVlOiBfY29udGludWUsIGlucHV0OiBfaW5wdXQsIC4uLnJlc3QgfSA9IGlzcztcclxuICAgIHJlc3QucGF0aCA/PyAocmVzdC5wYXRoID0gW10pO1xyXG4gICAgcmVzdC5tZXNzYWdlID0gbWVzc2FnZTtcclxuICAgIGlmIChjdHg/LnJlcG9ydElucHV0KSB7XHJcbiAgICAgICAgcmVzdC5pbnB1dCA9IF9pbnB1dDtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN0O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTaXphYmxlT3JpZ2luKGlucHV0KSB7XHJcbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBTZXQpXHJcbiAgICAgICAgcmV0dXJuIFwic2V0XCI7XHJcbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBNYXApXHJcbiAgICAgICAgcmV0dXJuIFwibWFwXCI7XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBGaWxlKVxyXG4gICAgICAgIHJldHVybiBcImZpbGVcIjtcclxuICAgIHJldHVybiBcInVua25vd25cIjtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGVuZ3RoYWJsZU9yaWdpbihpbnB1dCkge1xyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKVxyXG4gICAgICAgIHJldHVybiBcImFycmF5XCI7XHJcbiAgICBpZiAodHlwZW9mIGlucHV0ID09PSBcInN0cmluZ1wiKVxyXG4gICAgICAgIHJldHVybiBcInN0cmluZ1wiO1xyXG4gICAgcmV0dXJuIFwidW5rbm93blwiO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZWRUeXBlKGRhdGEpIHtcclxuICAgIGNvbnN0IHQgPSB0eXBlb2YgZGF0YTtcclxuICAgIHN3aXRjaCAodCkge1xyXG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjoge1xyXG4gICAgICAgICAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGRhdGEpID8gXCJuYW5cIiA6IFwibnVtYmVyXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgXCJvYmplY3RcIjoge1xyXG4gICAgICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibnVsbFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJhcnJheVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG9iaiA9IGRhdGE7XHJcbiAgICAgICAgICAgIGlmIChvYmogJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikgIT09IE9iamVjdC5wcm90b3R5cGUgJiYgXCJjb25zdHJ1Y3RvclwiIGluIG9iaiAmJiBvYmouY29uc3RydWN0b3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBvYmouY29uc3RydWN0b3IubmFtZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBpc3N1ZSguLi5hcmdzKSB7XHJcbiAgICBjb25zdCBbaXNzLCBpbnB1dCwgaW5zdF0gPSBhcmdzO1xyXG4gICAgaWYgKHR5cGVvZiBpc3MgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBtZXNzYWdlOiBpc3MsXHJcbiAgICAgICAgICAgIGNvZGU6IFwiY3VzdG9tXCIsXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyAuLi5pc3MgfTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5FbnVtKG9iaikge1xyXG4gICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKG9iailcclxuICAgICAgICAuZmlsdGVyKChbaywgX10pID0+IHtcclxuICAgICAgICAvLyByZXR1cm4gdHJ1ZSBpZiBOYU4sIG1lYW5pbmcgaXQncyBub3QgYSBudW1iZXIsIHRodXMgYSBzdHJpbmcga2V5XHJcbiAgICAgICAgcmV0dXJuIE51bWJlci5pc05hTihOdW1iZXIucGFyc2VJbnQoaywgMTApKTtcclxuICAgIH0pXHJcbiAgICAgICAgLm1hcCgoZWwpID0+IGVsWzFdKTtcclxufVxyXG4vLyBDb2RlYyB1dGlsaXR5IGZ1bmN0aW9uc1xyXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0VG9VaW50OEFycmF5KGJhc2U2NCkge1xyXG4gICAgY29uc3QgYmluYXJ5U3RyaW5nID0gYXRvYihiYXNlNjQpO1xyXG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShiaW5hcnlTdHJpbmcubGVuZ3RoKTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmluYXJ5U3RyaW5nLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnlTdHJpbmcuY2hhckNvZGVBdChpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBieXRlcztcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gdWludDhBcnJheVRvQmFzZTY0KGJ5dGVzKSB7XHJcbiAgICBsZXQgYmluYXJ5U3RyaW5nID0gXCJcIjtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBiaW5hcnlTdHJpbmcgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYnRvYShiaW5hcnlTdHJpbmcpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjR1cmxUb1VpbnQ4QXJyYXkoYmFzZTY0dXJsKSB7XHJcbiAgICBjb25zdCBiYXNlNjQgPSBiYXNlNjR1cmwucmVwbGFjZSgvLS9nLCBcIitcIikucmVwbGFjZSgvXy9nLCBcIi9cIik7XHJcbiAgICBjb25zdCBwYWRkaW5nID0gXCI9XCIucmVwZWF0KCg0IC0gKGJhc2U2NC5sZW5ndGggJSA0KSkgJSA0KTtcclxuICAgIHJldHVybiBiYXNlNjRUb1VpbnQ4QXJyYXkoYmFzZTY0ICsgcGFkZGluZyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHVpbnQ4QXJyYXlUb0Jhc2U2NHVybChieXRlcykge1xyXG4gICAgcmV0dXJuIHVpbnQ4QXJyYXlUb0Jhc2U2NChieXRlcykucmVwbGFjZSgvXFwrL2csIFwiLVwiKS5yZXBsYWNlKC9cXC8vZywgXCJfXCIpLnJlcGxhY2UoLz0vZywgXCJcIik7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGhleFRvVWludDhBcnJheShoZXgpIHtcclxuICAgIGNvbnN0IGNsZWFuSGV4ID0gaGV4LnJlcGxhY2UoL14weC8sIFwiXCIpO1xyXG4gICAgaWYgKGNsZWFuSGV4Lmxlbmd0aCAlIDIgIT09IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGhleCBzdHJpbmcgbGVuZ3RoXCIpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShjbGVhbkhleC5sZW5ndGggLyAyKTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2xlYW5IZXgubGVuZ3RoOyBpICs9IDIpIHtcclxuICAgICAgICBieXRlc1tpIC8gMl0gPSBOdW1iZXIucGFyc2VJbnQoY2xlYW5IZXguc2xpY2UoaSwgaSArIDIpLCAxNik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYnl0ZXM7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHVpbnQ4QXJyYXlUb0hleChieXRlcykge1xyXG4gICAgcmV0dXJuIEFycmF5LmZyb20oYnl0ZXMpXHJcbiAgICAgICAgLm1hcCgoYikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgXCIwXCIpKVxyXG4gICAgICAgIC5qb2luKFwiXCIpO1xyXG59XHJcbi8vIGluc3RhbmNlb2ZcclxuZXhwb3J0IGNsYXNzIENsYXNzIHtcclxuICAgIGNvbnN0cnVjdG9yKC4uLl9hcmdzKSB7IH1cclxufVxyXG4iLCJpbXBvcnQgeyAkY29uc3RydWN0b3IgfSBmcm9tIFwiLi9jb3JlLmpzXCI7XHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4vdXRpbC5qc1wiO1xyXG5jb25zdCBpbml0aWFsaXplciA9IChpbnN0LCBkZWYpID0+IHtcclxuICAgIGluc3QubmFtZSA9IFwiJFpvZEVycm9yXCI7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5zdCwgXCJfem9kXCIsIHtcclxuICAgICAgICB2YWx1ZTogaW5zdC5fem9kLFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5zdCwgXCJpc3N1ZXNcIiwge1xyXG4gICAgICAgIHZhbHVlOiBkZWYsXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICB9KTtcclxuICAgIGluc3QubWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGRlZiwgdXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIsIDIpO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3QsIFwidG9TdHJpbmdcIiwge1xyXG4gICAgICAgIHZhbHVlOiAoKSA9PiBpbnN0Lm1lc3NhZ2UsXHJcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICB9KTtcclxufTtcclxuZXhwb3J0IGNvbnN0ICRab2RFcnJvciA9ICRjb25zdHJ1Y3RvcihcIiRab2RFcnJvclwiLCBpbml0aWFsaXplcik7XHJcbmV4cG9ydCBjb25zdCAkWm9kUmVhbEVycm9yID0gJGNvbnN0cnVjdG9yKFwiJFpvZEVycm9yXCIsIGluaXRpYWxpemVyLCB7IFBhcmVudDogRXJyb3IgfSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuRXJyb3IoZXJyb3IsIG1hcHBlciA9IChpc3N1ZSkgPT4gaXNzdWUubWVzc2FnZSkge1xyXG4gICAgY29uc3QgZmllbGRFcnJvcnMgPSB7fTtcclxuICAgIGNvbnN0IGZvcm1FcnJvcnMgPSBbXTtcclxuICAgIGZvciAoY29uc3Qgc3ViIG9mIGVycm9yLmlzc3Vlcykge1xyXG4gICAgICAgIGlmIChzdWIucGF0aC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGZpZWxkRXJyb3JzW3N1Yi5wYXRoWzBdXSA9IGZpZWxkRXJyb3JzW3N1Yi5wYXRoWzBdXSB8fCBbXTtcclxuICAgICAgICAgICAgZmllbGRFcnJvcnNbc3ViLnBhdGhbMF1dLnB1c2gobWFwcGVyKHN1YikpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZm9ybUVycm9ycy5wdXNoKG1hcHBlcihzdWIpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyBmb3JtRXJyb3JzLCBmaWVsZEVycm9ycyB9O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRFcnJvcihlcnJvciwgbWFwcGVyID0gKGlzc3VlKSA9PiBpc3N1ZS5tZXNzYWdlKSB7XHJcbiAgICBjb25zdCBmaWVsZEVycm9ycyA9IHsgX2Vycm9yczogW10gfTtcclxuICAgIGNvbnN0IHByb2Nlc3NFcnJvciA9IChlcnJvciwgcGF0aCA9IFtdKSA9PiB7XHJcbiAgICAgICAgZm9yIChjb25zdCBpc3N1ZSBvZiBlcnJvci5pc3N1ZXMpIHtcclxuICAgICAgICAgICAgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF91bmlvblwiICYmIGlzc3VlLmVycm9ycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGlzc3VlLmVycm9ycy5tYXAoKGlzc3VlcykgPT4gcHJvY2Vzc0Vycm9yKHsgaXNzdWVzIH0sIFsuLi5wYXRoLCAuLi5pc3N1ZS5wYXRoXSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF9rZXlcIikge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0Vycm9yKHsgaXNzdWVzOiBpc3N1ZS5pc3N1ZXMgfSwgWy4uLnBhdGgsIC4uLmlzc3VlLnBhdGhdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfZWxlbWVudFwiKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzRXJyb3IoeyBpc3N1ZXM6IGlzc3VlLmlzc3VlcyB9LCBbLi4ucGF0aCwgLi4uaXNzdWUucGF0aF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZnVsbHBhdGggPSBbLi4ucGF0aCwgLi4uaXNzdWUucGF0aF07XHJcbiAgICAgICAgICAgICAgICBpZiAoZnVsbHBhdGgubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmllbGRFcnJvcnMuX2Vycm9ycy5wdXNoKG1hcHBlcihpc3N1ZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGN1cnIgPSBmaWVsZEVycm9ycztcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBmdWxscGF0aC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWwgPSBmdWxscGF0aFtpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVybWluYWwgPSBpID09PSBmdWxscGF0aC5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRlcm1pbmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyW2VsXSA9IGN1cnJbZWxdIHx8IHsgX2Vycm9yczogW10gfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdID0gY3VycltlbF0gfHwgeyBfZXJyb3JzOiBbXSB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycltlbF0uX2Vycm9ycy5wdXNoKG1hcHBlcihpc3N1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIgPSBjdXJyW2VsXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBwcm9jZXNzRXJyb3IoZXJyb3IpO1xyXG4gICAgcmV0dXJuIGZpZWxkRXJyb3JzO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiB0cmVlaWZ5RXJyb3IoZXJyb3IsIG1hcHBlciA9IChpc3N1ZSkgPT4gaXNzdWUubWVzc2FnZSkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0geyBlcnJvcnM6IFtdIH07XHJcbiAgICBjb25zdCBwcm9jZXNzRXJyb3IgPSAoZXJyb3IsIHBhdGggPSBbXSkgPT4ge1xyXG4gICAgICAgIHZhciBfYSwgX2I7XHJcbiAgICAgICAgZm9yIChjb25zdCBpc3N1ZSBvZiBlcnJvci5pc3N1ZXMpIHtcclxuICAgICAgICAgICAgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF91bmlvblwiICYmIGlzc3VlLmVycm9ycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIC8vIHJlZ3VsYXIgdW5pb24gZXJyb3JcclxuICAgICAgICAgICAgICAgIGlzc3VlLmVycm9ycy5tYXAoKGlzc3VlcykgPT4gcHJvY2Vzc0Vycm9yKHsgaXNzdWVzIH0sIFsuLi5wYXRoLCAuLi5pc3N1ZS5wYXRoXSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzc3VlLmNvZGUgPT09IFwiaW52YWxpZF9rZXlcIikge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0Vycm9yKHsgaXNzdWVzOiBpc3N1ZS5pc3N1ZXMgfSwgWy4uLnBhdGgsIC4uLmlzc3VlLnBhdGhdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfZWxlbWVudFwiKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzRXJyb3IoeyBpc3N1ZXM6IGlzc3VlLmlzc3VlcyB9LCBbLi4ucGF0aCwgLi4uaXNzdWUucGF0aF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZnVsbHBhdGggPSBbLi4ucGF0aCwgLi4uaXNzdWUucGF0aF07XHJcbiAgICAgICAgICAgICAgICBpZiAoZnVsbHBhdGgubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmVycm9ycy5wdXNoKG1hcHBlcihpc3N1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnIgPSByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IGZ1bGxwYXRoLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gZnVsbHBhdGhbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVybWluYWwgPSBpID09PSBmdWxscGF0aC5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZWwgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyci5wcm9wZXJ0aWVzID8/IChjdXJyLnByb3BlcnRpZXMgPSB7fSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChfYSA9IGN1cnIucHJvcGVydGllcylbZWxdID8/IChfYVtlbF0gPSB7IGVycm9yczogW10gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIgPSBjdXJyLnByb3BlcnRpZXNbZWxdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyci5pdGVtcyA/PyAoY3Vyci5pdGVtcyA9IFtdKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKF9iID0gY3Vyci5pdGVtcylbZWxdID8/IChfYltlbF0gPSB7IGVycm9yczogW10gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIgPSBjdXJyLml0ZW1zW2VsXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlcm1pbmFsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIuZXJyb3JzLnB1c2gobWFwcGVyKGlzc3VlKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBwcm9jZXNzRXJyb3IoZXJyb3IpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4vKiogRm9ybWF0IGEgWm9kRXJyb3IgYXMgYSBodW1hbi1yZWFkYWJsZSBzdHJpbmcgaW4gdGhlIGZvbGxvd2luZyBmb3JtLlxyXG4gKlxyXG4gKiBGcm9tXHJcbiAqXHJcbiAqIGBgYHRzXHJcbiAqIFpvZEVycm9yIHtcclxuICogICBpc3N1ZXM6IFtcclxuICogICAgIHtcclxuICogICAgICAgZXhwZWN0ZWQ6ICdzdHJpbmcnLFxyXG4gKiAgICAgICBjb2RlOiAnaW52YWxpZF90eXBlJyxcclxuICogICAgICAgcGF0aDogWyAndXNlcm5hbWUnIF0sXHJcbiAqICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIGlucHV0OiBleHBlY3RlZCBzdHJpbmcnXHJcbiAqICAgICB9LFxyXG4gKiAgICAge1xyXG4gKiAgICAgICBleHBlY3RlZDogJ251bWJlcicsXHJcbiAqICAgICAgIGNvZGU6ICdpbnZhbGlkX3R5cGUnLFxyXG4gKiAgICAgICBwYXRoOiBbICdmYXZvcml0ZU51bWJlcnMnLCAxIF0sXHJcbiAqICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIGlucHV0OiBleHBlY3RlZCBudW1iZXInXHJcbiAqICAgICB9XHJcbiAqICAgXTtcclxuICogfVxyXG4gKiBgYGBcclxuICpcclxuICogdG9cclxuICpcclxuICogYGBgXHJcbiAqIHVzZXJuYW1lXHJcbiAqICAg4pyWIEV4cGVjdGVkIG51bWJlciwgcmVjZWl2ZWQgc3RyaW5nIGF0IFwidXNlcm5hbWVcclxuICogZmF2b3JpdGVOdW1iZXJzWzBdXHJcbiAqICAg4pyWIEludmFsaWQgaW5wdXQ6IGV4cGVjdGVkIG51bWJlclxyXG4gKiBgYGBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b0RvdFBhdGgoX3BhdGgpIHtcclxuICAgIGNvbnN0IHNlZ3MgPSBbXTtcclxuICAgIGNvbnN0IHBhdGggPSBfcGF0aC5tYXAoKHNlZykgPT4gKHR5cGVvZiBzZWcgPT09IFwib2JqZWN0XCIgPyBzZWcua2V5IDogc2VnKSk7XHJcbiAgICBmb3IgKGNvbnN0IHNlZyBvZiBwYXRoKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzZWcgPT09IFwibnVtYmVyXCIpXHJcbiAgICAgICAgICAgIHNlZ3MucHVzaChgWyR7c2VnfV1gKTtcclxuICAgICAgICBlbHNlIGlmICh0eXBlb2Ygc2VnID09PSBcInN5bWJvbFwiKVxyXG4gICAgICAgICAgICBzZWdzLnB1c2goYFske0pTT04uc3RyaW5naWZ5KFN0cmluZyhzZWcpKX1dYCk7XHJcbiAgICAgICAgZWxzZSBpZiAoL1teXFx3JF0vLnRlc3Qoc2VnKSlcclxuICAgICAgICAgICAgc2Vncy5wdXNoKGBbJHtKU09OLnN0cmluZ2lmeShzZWcpfV1gKTtcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHNlZ3MubGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgc2Vncy5wdXNoKFwiLlwiKTtcclxuICAgICAgICAgICAgc2Vncy5wdXNoKHNlZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNlZ3Muam9pbihcIlwiKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcHJldHRpZnlFcnJvcihlcnJvcikge1xyXG4gICAgY29uc3QgbGluZXMgPSBbXTtcclxuICAgIC8vIHNvcnQgYnkgcGF0aCBsZW5ndGhcclxuICAgIGNvbnN0IGlzc3VlcyA9IFsuLi5lcnJvci5pc3N1ZXNdLnNvcnQoKGEsIGIpID0+IChhLnBhdGggPz8gW10pLmxlbmd0aCAtIChiLnBhdGggPz8gW10pLmxlbmd0aCk7XHJcbiAgICAvLyBQcm9jZXNzIGVhY2ggaXNzdWVcclxuICAgIGZvciAoY29uc3QgaXNzdWUgb2YgaXNzdWVzKSB7XHJcbiAgICAgICAgbGluZXMucHVzaChg4pyWICR7aXNzdWUubWVzc2FnZX1gKTtcclxuICAgICAgICBpZiAoaXNzdWUucGF0aD8ubGVuZ3RoKVxyXG4gICAgICAgICAgICBsaW5lcy5wdXNoKGAgIOKGkiBhdCAke3RvRG90UGF0aChpc3N1ZS5wYXRoKX1gKTtcclxuICAgIH1cclxuICAgIC8vIENvbnZlcnQgTWFwIHRvIGZvcm1hdHRlZCBzdHJpbmdcclxuICAgIHJldHVybiBsaW5lcy5qb2luKFwiXFxuXCIpO1xyXG59XHJcbiIsImltcG9ydCAqIGFzIGNvcmUgZnJvbSBcIi4vY29yZS5qc1wiO1xyXG5pbXBvcnQgKiBhcyBlcnJvcnMgZnJvbSBcIi4vZXJyb3JzLmpzXCI7XHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4vdXRpbC5qc1wiO1xyXG5leHBvcnQgY29uc3QgX3BhcnNlID0gKF9FcnIpID0+IChzY2hlbWEsIHZhbHVlLCBfY3R4LCBfcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBjdHggPSBfY3R4ID8geyAuLi5fY3R4LCBhc3luYzogZmFsc2UgfSA6IHsgYXN5bmM6IGZhbHNlIH07XHJcbiAgICBjb25zdCByZXN1bHQgPSBzY2hlbWEuX3pvZC5ydW4oeyB2YWx1ZSwgaXNzdWVzOiBbXSB9LCBjdHgpO1xyXG4gICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICB0aHJvdyBuZXcgY29yZS4kWm9kQXN5bmNFcnJvcigpO1xyXG4gICAgfVxyXG4gICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgY29uc3QgZSA9IG5ldyAoX3BhcmFtcz8uRXJyID8/IF9FcnIpKHJlc3VsdC5pc3N1ZXMubWFwKChpc3MpID0+IHV0aWwuZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29yZS5jb25maWcoKSkpKTtcclxuICAgICAgICB1dGlsLmNhcHR1cmVTdGFja1RyYWNlKGUsIF9wYXJhbXM/LmNhbGxlZSk7XHJcbiAgICAgICAgdGhyb3cgZTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQudmFsdWU7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBwYXJzZSA9IC8qIEBfX1BVUkVfXyovIF9wYXJzZShlcnJvcnMuJFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBfcGFyc2VBc3luYyA9IChfRXJyKSA9PiBhc3luYyAoc2NoZW1hLCB2YWx1ZSwgX2N0eCwgcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBjdHggPSBfY3R4ID8geyAuLi5fY3R4LCBhc3luYzogdHJ1ZSB9IDogeyBhc3luYzogdHJ1ZSB9O1xyXG4gICAgbGV0IHJlc3VsdCA9IHNjaGVtYS5fem9kLnJ1bih7IHZhbHVlLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSlcclxuICAgICAgICByZXN1bHQgPSBhd2FpdCByZXN1bHQ7XHJcbiAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICBjb25zdCBlID0gbmV3IChwYXJhbXM/LkVyciA/PyBfRXJyKShyZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSk7XHJcbiAgICAgICAgdXRpbC5jYXB0dXJlU3RhY2tUcmFjZShlLCBwYXJhbXM/LmNhbGxlZSk7XHJcbiAgICAgICAgdGhyb3cgZTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQudmFsdWU7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBwYXJzZUFzeW5jID0gLyogQF9fUFVSRV9fKi8gX3BhcnNlQXN5bmMoZXJyb3JzLiRab2RSZWFsRXJyb3IpO1xyXG5leHBvcnQgY29uc3QgX3NhZmVQYXJzZSA9IChfRXJyKSA9PiAoc2NoZW1hLCB2YWx1ZSwgX2N0eCkgPT4ge1xyXG4gICAgY29uc3QgY3R4ID0gX2N0eCA/IHsgLi4uX2N0eCwgYXN5bmM6IGZhbHNlIH0gOiB7IGFzeW5jOiBmYWxzZSB9O1xyXG4gICAgY29uc3QgcmVzdWx0ID0gc2NoZW1hLl96b2QucnVuKHsgdmFsdWUsIGlzc3VlczogW10gfSwgY3R4KTtcclxuICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IGNvcmUuJFpvZEFzeW5jRXJyb3IoKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQuaXNzdWVzLmxlbmd0aFxyXG4gICAgICAgID8ge1xyXG4gICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcclxuICAgICAgICAgICAgZXJyb3I6IG5ldyAoX0VyciA/PyBlcnJvcnMuJFpvZEVycm9yKShyZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSksXHJcbiAgICAgICAgfVxyXG4gICAgICAgIDogeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQudmFsdWUgfTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHNhZmVQYXJzZSA9IC8qIEBfX1BVUkVfXyovIF9zYWZlUGFyc2UoZXJyb3JzLiRab2RSZWFsRXJyb3IpO1xyXG5leHBvcnQgY29uc3QgX3NhZmVQYXJzZUFzeW5jID0gKF9FcnIpID0+IGFzeW5jIChzY2hlbWEsIHZhbHVlLCBfY3R4KSA9PiB7XHJcbiAgICBjb25zdCBjdHggPSBfY3R4ID8geyAuLi5fY3R4LCBhc3luYzogdHJ1ZSB9IDogeyBhc3luYzogdHJ1ZSB9O1xyXG4gICAgbGV0IHJlc3VsdCA9IHNjaGVtYS5fem9kLnJ1bih7IHZhbHVlLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSlcclxuICAgICAgICByZXN1bHQgPSBhd2FpdCByZXN1bHQ7XHJcbiAgICByZXR1cm4gcmVzdWx0Lmlzc3Vlcy5sZW5ndGhcclxuICAgICAgICA/IHtcclxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yOiBuZXcgX0VycihyZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSksXHJcbiAgICAgICAgfVxyXG4gICAgICAgIDogeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiByZXN1bHQudmFsdWUgfTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHNhZmVQYXJzZUFzeW5jID0gLyogQF9fUFVSRV9fKi8gX3NhZmVQYXJzZUFzeW5jKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IF9lbmNvZGUgPSAoX0VycikgPT4gKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcclxuICAgIGNvbnN0IGN0eCA9IF9jdHggPyB7IC4uLl9jdHgsIGRpcmVjdGlvbjogXCJiYWNrd2FyZFwiIH0gOiB7IGRpcmVjdGlvbjogXCJiYWNrd2FyZFwiIH07XHJcbiAgICByZXR1cm4gX3BhcnNlKF9FcnIpKHNjaGVtYSwgdmFsdWUsIGN0eCk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBlbmNvZGUgPSAvKiBAX19QVVJFX18qLyBfZW5jb2RlKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IF9kZWNvZGUgPSAoX0VycikgPT4gKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcclxuICAgIHJldHVybiBfcGFyc2UoX0Vycikoc2NoZW1hLCB2YWx1ZSwgX2N0eCk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBkZWNvZGUgPSAvKiBAX19QVVJFX18qLyBfZGVjb2RlKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IF9lbmNvZGVBc3luYyA9IChfRXJyKSA9PiBhc3luYyAoc2NoZW1hLCB2YWx1ZSwgX2N0eCkgPT4ge1xyXG4gICAgY29uc3QgY3R4ID0gX2N0eCA/IHsgLi4uX2N0eCwgZGlyZWN0aW9uOiBcImJhY2t3YXJkXCIgfSA6IHsgZGlyZWN0aW9uOiBcImJhY2t3YXJkXCIgfTtcclxuICAgIHJldHVybiBfcGFyc2VBc3luYyhfRXJyKShzY2hlbWEsIHZhbHVlLCBjdHgpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgZW5jb2RlQXN5bmMgPSAvKiBAX19QVVJFX18qLyBfZW5jb2RlQXN5bmMoZXJyb3JzLiRab2RSZWFsRXJyb3IpO1xyXG5leHBvcnQgY29uc3QgX2RlY29kZUFzeW5jID0gKF9FcnIpID0+IGFzeW5jIChzY2hlbWEsIHZhbHVlLCBfY3R4KSA9PiB7XHJcbiAgICByZXR1cm4gX3BhcnNlQXN5bmMoX0Vycikoc2NoZW1hLCB2YWx1ZSwgX2N0eCk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBkZWNvZGVBc3luYyA9IC8qIEBfX1BVUkVfXyovIF9kZWNvZGVBc3luYyhlcnJvcnMuJFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBfc2FmZUVuY29kZSA9IChfRXJyKSA9PiAoc2NoZW1hLCB2YWx1ZSwgX2N0eCkgPT4ge1xyXG4gICAgY29uc3QgY3R4ID0gX2N0eCA/IHsgLi4uX2N0eCwgZGlyZWN0aW9uOiBcImJhY2t3YXJkXCIgfSA6IHsgZGlyZWN0aW9uOiBcImJhY2t3YXJkXCIgfTtcclxuICAgIHJldHVybiBfc2FmZVBhcnNlKF9FcnIpKHNjaGVtYSwgdmFsdWUsIGN0eCk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBzYWZlRW5jb2RlID0gLyogQF9fUFVSRV9fKi8gX3NhZmVFbmNvZGUoZXJyb3JzLiRab2RSZWFsRXJyb3IpO1xyXG5leHBvcnQgY29uc3QgX3NhZmVEZWNvZGUgPSAoX0VycikgPT4gKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcclxuICAgIHJldHVybiBfc2FmZVBhcnNlKF9FcnIpKHNjaGVtYSwgdmFsdWUsIF9jdHgpO1xyXG59O1xyXG5leHBvcnQgY29uc3Qgc2FmZURlY29kZSA9IC8qIEBfX1BVUkVfXyovIF9zYWZlRGVjb2RlKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IF9zYWZlRW5jb2RlQXN5bmMgPSAoX0VycikgPT4gYXN5bmMgKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcclxuICAgIGNvbnN0IGN0eCA9IF9jdHggPyB7IC4uLl9jdHgsIGRpcmVjdGlvbjogXCJiYWNrd2FyZFwiIH0gOiB7IGRpcmVjdGlvbjogXCJiYWNrd2FyZFwiIH07XHJcbiAgICByZXR1cm4gX3NhZmVQYXJzZUFzeW5jKF9FcnIpKHNjaGVtYSwgdmFsdWUsIGN0eCk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBzYWZlRW5jb2RlQXN5bmMgPSAvKiBAX19QVVJFX18qLyBfc2FmZUVuY29kZUFzeW5jKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IF9zYWZlRGVjb2RlQXN5bmMgPSAoX0VycikgPT4gYXN5bmMgKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcclxuICAgIHJldHVybiBfc2FmZVBhcnNlQXN5bmMoX0Vycikoc2NoZW1hLCB2YWx1ZSwgX2N0eCk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBzYWZlRGVjb2RlQXN5bmMgPSAvKiBAX19QVVJFX18qLyBfc2FmZURlY29kZUFzeW5jKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcclxuIiwiaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi91dGlsLmpzXCI7XHJcbi8qKlxyXG4gKiBAZGVwcmVjYXRlZCBDVUlEIHYxIGlzIGRlcHJlY2F0ZWQgYnkgaXRzIGF1dGhvcnMgZHVlIHRvIGluZm9ybWF0aW9uIGxlYWthZ2VcclxuICogKHRpbWVzdGFtcHMgZW1iZWRkZWQgaW4gdGhlIGlkKS4gVXNlIHtAbGluayBjdWlkMn0gaW5zdGVhZC5cclxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXJhbGxlbGRyaXZlL2N1aWQuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgY3VpZCA9IC9eW2NDXVswLTlhLXpdezYsfSQvO1xyXG5leHBvcnQgY29uc3QgY3VpZDIgPSAvXlswLTlhLXpdKyQvO1xyXG5leHBvcnQgY29uc3QgdWxpZCA9IC9eWzAtOUEtSEpLTU5QLVRWLVphLWhqa21ucC10di16XXsyNn0kLztcclxuZXhwb3J0IGNvbnN0IHhpZCA9IC9eWzAtOWEtdkEtVl17MjB9JC87XHJcbmV4cG9ydCBjb25zdCBrc3VpZCA9IC9eW0EtWmEtejAtOV17Mjd9JC87XHJcbmV4cG9ydCBjb25zdCBuYW5vaWQgPSAvXlthLXpBLVowLTlfLV17MjF9JC87XHJcbi8qKiBJU08gODYwMS0xIGR1cmF0aW9uIHJlZ2V4LiBEb2VzIG5vdCBzdXBwb3J0IHRoZSA4NjAxLTIgZXh0ZW5zaW9ucyBsaWtlIG5lZ2F0aXZlIGR1cmF0aW9ucyBvciBmcmFjdGlvbmFsL25lZ2F0aXZlIGNvbXBvbmVudHMuICovXHJcbmV4cG9ydCBjb25zdCBkdXJhdGlvbiA9IC9eUCg/OihcXGQrVyl8KD8hLipXKSg/PVxcZHxUXFxkKShcXGQrWSk/KFxcZCtNKT8oXFxkK0QpPyhUKD89XFxkKShcXGQrSCk/KFxcZCtNKT8oXFxkKyhbLixdXFxkKyk/Uyk/KT8pJC87XHJcbi8qKiBJbXBsZW1lbnRzIElTTyA4NjAxLTIgZXh0ZW5zaW9ucyBsaWtlIGV4cGxpY2l0ICstIHByZWZpeGVzLCBtaXhpbmcgd2Vla3Mgd2l0aCBvdGhlciB1bml0cywgYW5kIGZyYWN0aW9uYWwvbmVnYXRpdmUgY29tcG9uZW50cy4gKi9cclxuZXhwb3J0IGNvbnN0IGV4dGVuZGVkRHVyYXRpb24gPSAvXlstK10/UCg/ISQpKD86KD86Wy0rXT9cXGQrWSl8KD86Wy0rXT9cXGQrWy4sXVxcZCtZJCkpPyg/Oig/OlstK10/XFxkK00pfCg/OlstK10/XFxkK1suLF1cXGQrTSQpKT8oPzooPzpbLStdP1xcZCtXKXwoPzpbLStdP1xcZCtbLixdXFxkK1ckKSk/KD86KD86Wy0rXT9cXGQrRCl8KD86Wy0rXT9cXGQrWy4sXVxcZCtEJCkpPyg/OlQoPz1bXFxkKy1dKSg/Oig/OlstK10/XFxkK0gpfCg/OlstK10/XFxkK1suLF1cXGQrSCQpKT8oPzooPzpbLStdP1xcZCtNKXwoPzpbLStdP1xcZCtbLixdXFxkK00kKSk/KD86Wy0rXT9cXGQrKD86Wy4sXVxcZCspP1MpPyk/PyQvO1xyXG4vKiogQSByZWdleCBmb3IgYW55IFVVSUQtbGlrZSBpZGVudGlmaWVyOiA4LTQtNC00LTEyIGhleCBwYXR0ZXJuICovXHJcbmV4cG9ydCBjb25zdCBndWlkID0gL14oWzAtOWEtZkEtRl17OH0tWzAtOWEtZkEtRl17NH0tWzAtOWEtZkEtRl17NH0tWzAtOWEtZkEtRl17NH0tWzAtOWEtZkEtRl17MTJ9KSQvO1xyXG4vKiogUmV0dXJucyBhIHJlZ2V4IGZvciB2YWxpZGF0aW5nIGFuIFJGQyA5NTYyLzQxMjIgVVVJRC5cclxuICpcclxuICogQHBhcmFtIHZlcnNpb24gT3B0aW9uYWxseSBzcGVjaWZ5IGEgdmVyc2lvbiAxLTguIElmIG5vIHZlcnNpb24gaXMgc3BlY2lmaWVkLCBhbGwgdmVyc2lvbnMgYXJlIHN1cHBvcnRlZC4gKi9cclxuZXhwb3J0IGNvbnN0IHV1aWQgPSAodmVyc2lvbikgPT4ge1xyXG4gICAgaWYgKCF2ZXJzaW9uKVxyXG4gICAgICAgIHJldHVybiAvXihbMC05YS1mQS1GXXs4fS1bMC05YS1mQS1GXXs0fS1bMS04XVswLTlhLWZBLUZdezN9LVs4OWFiQUJdWzAtOWEtZkEtRl17M30tWzAtOWEtZkEtRl17MTJ9fDAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMHxmZmZmZmZmZi1mZmZmLWZmZmYtZmZmZi1mZmZmZmZmZmZmZmYpJC87XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXihbMC05YS1mQS1GXXs4fS1bMC05YS1mQS1GXXs0fS0ke3ZlcnNpb259WzAtOWEtZkEtRl17M30tWzg5YWJBQl1bMC05YS1mQS1GXXszfS1bMC05YS1mQS1GXXsxMn0pJGApO1xyXG59O1xyXG5leHBvcnQgY29uc3QgdXVpZDQgPSAvKkBfX1BVUkVfXyovIHV1aWQoNCk7XHJcbmV4cG9ydCBjb25zdCB1dWlkNiA9IC8qQF9fUFVSRV9fKi8gdXVpZCg2KTtcclxuZXhwb3J0IGNvbnN0IHV1aWQ3ID0gLypAX19QVVJFX18qLyB1dWlkKDcpO1xyXG4vKiogUHJhY3RpY2FsIGVtYWlsIHZhbGlkYXRpb24gKi9cclxuZXhwb3J0IGNvbnN0IGVtYWlsID0gL14oPyFcXC4pKD8hLipcXC5cXC4pKFtBLVphLXowLTlfJytcXC1cXC5dKilbQS1aYS16MC05XystXUAoW0EtWmEtejAtOV1bQS1aYS16MC05XFwtXSpcXC4pK1tBLVphLXpdezIsfSQvO1xyXG4vKiogRXF1aXZhbGVudCB0byB0aGUgSFRNTDUgaW5wdXRbdHlwZT1lbWFpbF0gdmFsaWRhdGlvbiBpbXBsZW1lbnRlZCBieSBicm93c2Vycy4gU291cmNlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVE1ML0VsZW1lbnQvaW5wdXQvZW1haWwgKi9cclxuZXhwb3J0IGNvbnN0IGh0bWw1RW1haWwgPSAvXlthLXpBLVowLTkuISMkJSYnKisvPT9eX2B7fH1+LV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykqJC87XHJcbi8qKiBUaGUgY2xhc3NpYyBlbWFpbHJlZ2V4LmNvbSByZWdleCBmb3IgUkZDIDUzMjItY29tcGxpYW50IGVtYWlscyAqL1xyXG5leHBvcnQgY29uc3QgcmZjNTMyMkVtYWlsID0gL14oKFtePD4oKVxcW1xcXVxcXFwuLDs6XFxzQFwiXSsoXFwuW148PigpXFxbXFxdXFxcXC4sOzpcXHNAXCJdKykqKXwoXCIuK1wiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XHJcbi8qKiBBIGxvb3NlIHJlZ2V4IHRoYXQgYWxsb3dzIFVuaWNvZGUgY2hhcmFjdGVycywgZW5mb3JjZXMgbGVuZ3RoIGxpbWl0cywgYW5kIHRoYXQncyBhYm91dCBpdC4gKi9cclxuZXhwb3J0IGNvbnN0IHVuaWNvZGVFbWFpbCA9IC9eW15cXHNAXCJdezEsNjR9QFteXFxzQF17MSwyNTV9JC91O1xyXG5leHBvcnQgY29uc3QgaWRuRW1haWwgPSB1bmljb2RlRW1haWw7XHJcbmV4cG9ydCBjb25zdCBicm93c2VyRW1haWwgPSAvXlthLXpBLVowLTkuISMkJSYnKisvPT9eX2B7fH1+LV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykqJC87XHJcbi8vIGZyb20gaHR0cHM6Ly90aGVrZXZpbnNjb3R0LmNvbS9lbW9qaXMtaW4tamF2YXNjcmlwdC8jd3JpdGluZy1hLXJlZ3VsYXItZXhwcmVzc2lvblxyXG5jb25zdCBfZW1vamkgPSBgXihcXFxccHtFeHRlbmRlZF9QaWN0b2dyYXBoaWN9fFxcXFxwe0Vtb2ppX0NvbXBvbmVudH0pKyRgO1xyXG5leHBvcnQgZnVuY3Rpb24gZW1vamkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChfZW1vamksIFwidVwiKTtcclxufVxyXG5leHBvcnQgY29uc3QgaXB2NCA9IC9eKD86KD86MjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKVxcLil7M30oPzoyNVswLTVdfDJbMC00XVswLTldfDFbMC05XVswLTldfFsxLTldWzAtOV18WzAtOV0pJC87XHJcbmV4cG9ydCBjb25zdCBpcHY2ID0gL14oKFswLTlhLWZBLUZdezEsNH06KXs3fVswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDd9OnwoWzAtOWEtZkEtRl17MSw0fTopezEsNn06WzAtOWEtZkEtRl17MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsNX0oOlswLTlhLWZBLUZdezEsNH0pezEsMn18KFswLTlhLWZBLUZdezEsNH06KXsxLDR9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDN9fChbMC05YS1mQS1GXXsxLDR9Oil7MSwzfSg6WzAtOWEtZkEtRl17MSw0fSl7MSw0fXwoWzAtOWEtZkEtRl17MSw0fTopezEsMn0oOlswLTlhLWZBLUZdezEsNH0pezEsNX18WzAtOWEtZkEtRl17MSw0fTooKDpbMC05YS1mQS1GXXsxLDR9KXsxLDZ9KXw6KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw3fXw6KSkkLztcclxuZXhwb3J0IGNvbnN0IG1hYyA9IChkZWxpbWl0ZXIpID0+IHtcclxuICAgIGNvbnN0IGVzY2FwZWREZWxpbSA9IHV0aWwuZXNjYXBlUmVnZXgoZGVsaW1pdGVyID8/IFwiOlwiKTtcclxuICAgIHJldHVybiBuZXcgUmVnRXhwKGBeKD86WzAtOUEtRl17Mn0ke2VzY2FwZWREZWxpbX0pezV9WzAtOUEtRl17Mn0kfF4oPzpbMC05YS1mXXsyfSR7ZXNjYXBlZERlbGltfSl7NX1bMC05YS1mXXsyfSRgKTtcclxufTtcclxuZXhwb3J0IGNvbnN0IGNpZHJ2NCA9IC9eKCgyNVswLTVdfDJbMC00XVswLTldfDFbMC05XVswLTldfFsxLTldWzAtOV18WzAtOV0pXFwuKXszfSgyNVswLTVdfDJbMC00XVswLTldfDFbMC05XVswLTldfFsxLTldWzAtOV18WzAtOV0pXFwvKFswLTldfFsxLTJdWzAtOV18M1swLTJdKSQvO1xyXG5leHBvcnQgY29uc3QgY2lkcnY2ID0gL14oKFswLTlhLWZBLUZdezEsNH06KXs3fVswLTlhLWZBLUZdezEsNH18Ojp8KFswLTlhLWZBLUZdezEsNH0pPzo6KFswLTlhLWZBLUZdezEsNH06Pyl7MCw2fSlcXC8oMTJbMC04XXwxWzAxXVswLTldfFsxLTldP1swLTldKSQvO1xyXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83ODYwMzkyL2RldGVybWluZS1pZi1zdHJpbmctaXMtaW4tYmFzZTY0LXVzaW5nLWphdmFzY3JpcHRcclxuZXhwb3J0IGNvbnN0IGJhc2U2NCA9IC9eJHxeKD86WzAtOWEtekEtWisvXXs0fSkqKD86KD86WzAtOWEtekEtWisvXXsyfT09KXwoPzpbMC05YS16QS1aKy9dezN9PSkpPyQvO1xyXG5leHBvcnQgY29uc3QgYmFzZTY0dXJsID0gL15bQS1aYS16MC05Xy1dKiQvO1xyXG4vLyBiYXNlZCBvbiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDYxNzkvcmVndWxhci1leHByZXNzaW9uLXRvLW1hdGNoLWRucy1ob3N0bmFtZS1vci1pcC1hZGRyZXNzXHJcbi8vIGV4cG9ydCBjb25zdCBob3N0bmFtZTogUmVnRXhwID0gL14oW2EtekEtWjAtOS1dK1xcLikqW2EtekEtWjAtOS1dKyQvO1xyXG5leHBvcnQgY29uc3QgaG9zdG5hbWUgPSAvXig/PS57MSwyNTN9XFwuPyQpW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbLTAtOWEtekEtWl17MCw2MX1bMC05YS16QS1aXSk/KSpcXC4/JC87XHJcbmV4cG9ydCBjb25zdCBkb21haW4gPSAvXihbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT9cXC4pK1thLXpBLVpdezIsfSQvO1xyXG5leHBvcnQgY29uc3QgaHR0cFByb3RvY29sID0gL15odHRwcz8kLztcclxuLy8gaHR0cHM6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy92YWxpZGF0ZS1waG9uZS1udW1iZXIjcjQtMyAocmVnZXggc2FucyBzcGFjZXMpXHJcbi8vIEUuMTY0OiBsZWFkaW5nIGRpZ2l0IG11c3QgYmUgMS05OyB0b3RhbCBkaWdpdHMgKGV4Y2x1ZGluZyAnKycpIGJldHdlZW4gNy0xNVxyXG5leHBvcnQgY29uc3QgZTE2NCA9IC9eXFwrWzEtOV1cXGR7NiwxNH0kLztcclxuLy8gY29uc3QgZGF0ZVNvdXJjZSA9IGAoKFxcXFxkXFxcXGRbMjQ2OF1bMDQ4XXxcXFxcZFxcXFxkWzEzNTc5XVsyNl18XFxcXGRcXFxcZDBbNDhdfFswMjQ2OF1bMDQ4XTAwfFsxMzU3OV1bMjZdMDApLTAyLTI5fFxcXFxkezR9LSgoMFsxMzU3OF18MVswMl0pLSgwWzEtOV18WzEyXVxcXFxkfDNbMDFdKXwoMFs0NjldfDExKS0oMFsxLTldfFsxMl1cXFxcZHwzMCl8KDAyKS0oMFsxLTldfDFcXFxcZHwyWzAtOF0pKSlgO1xyXG5jb25zdCBkYXRlU291cmNlID0gYCg/Oig/OlxcXFxkXFxcXGRbMjQ2OF1bMDQ4XXxcXFxcZFxcXFxkWzEzNTc5XVsyNl18XFxcXGRcXFxcZDBbNDhdfFswMjQ2OF1bMDQ4XTAwfFsxMzU3OV1bMjZdMDApLTAyLTI5fFxcXFxkezR9LSg/Oig/OjBbMTM1NzhdfDFbMDJdKS0oPzowWzEtOV18WzEyXVxcXFxkfDNbMDFdKXwoPzowWzQ2OV18MTEpLSg/OjBbMS05XXxbMTJdXFxcXGR8MzApfCg/OjAyKS0oPzowWzEtOV18MVxcXFxkfDJbMC04XSkpKWA7XHJcbmV4cG9ydCBjb25zdCBkYXRlID0gLypAX19QVVJFX18qLyBuZXcgUmVnRXhwKGBeJHtkYXRlU291cmNlfSRgKTtcclxuZnVuY3Rpb24gdGltZVNvdXJjZShhcmdzKSB7XHJcbiAgICBjb25zdCBoaG1tID0gYCg/OlswMV1cXFxcZHwyWzAtM10pOlswLTVdXFxcXGRgO1xyXG4gICAgY29uc3QgcmVnZXggPSB0eXBlb2YgYXJncy5wcmVjaXNpb24gPT09IFwibnVtYmVyXCJcclxuICAgICAgICA/IGFyZ3MucHJlY2lzaW9uID09PSAtMVxyXG4gICAgICAgICAgICA/IGAke2hobW19YFxyXG4gICAgICAgICAgICA6IGFyZ3MucHJlY2lzaW9uID09PSAwXHJcbiAgICAgICAgICAgICAgICA/IGAke2hobW19OlswLTVdXFxcXGRgXHJcbiAgICAgICAgICAgICAgICA6IGAke2hobW19OlswLTVdXFxcXGRcXFxcLlxcXFxkeyR7YXJncy5wcmVjaXNpb259fWBcclxuICAgICAgICA6IGAke2hobW19KD86OlswLTVdXFxcXGQoPzpcXFxcLlxcXFxkKyk/KT9gO1xyXG4gICAgcmV0dXJuIHJlZ2V4O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiB0aW1lKGFyZ3MpIHtcclxuICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHt0aW1lU291cmNlKGFyZ3MpfSRgKTtcclxufVxyXG4vLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzMxNDMyMzFcclxuZXhwb3J0IGZ1bmN0aW9uIGRhdGV0aW1lKGFyZ3MpIHtcclxuICAgIGNvbnN0IHRpbWUgPSB0aW1lU291cmNlKHsgcHJlY2lzaW9uOiBhcmdzLnByZWNpc2lvbiB9KTtcclxuICAgIGNvbnN0IG9wdHMgPSBbXCJaXCJdO1xyXG4gICAgaWYgKGFyZ3MubG9jYWwpXHJcbiAgICAgICAgb3B0cy5wdXNoKFwiXCIpO1xyXG4gICAgLy8gaWYgKGFyZ3Mub2Zmc2V0KSBvcHRzLnB1c2goYChbKy1dXFxcXGR7Mn06XFxcXGR7Mn0pYCk7XHJcbiAgICBpZiAoYXJncy5vZmZzZXQpXHJcbiAgICAgICAgb3B0cy5wdXNoKGAoWystXSg/OlswMV1cXFxcZHwyWzAtM10pOlswLTVdXFxcXGQpYCk7XHJcbiAgICBjb25zdCB0aW1lUmVnZXggPSBgJHt0aW1lfSg/OiR7b3B0cy5qb2luKFwifFwiKX0pYDtcclxuICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtkYXRlU291cmNlfVQoPzoke3RpbWVSZWdleH0pJGApO1xyXG59XHJcbmV4cG9ydCBjb25zdCBzdHJpbmcgPSAocGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCByZWdleCA9IHBhcmFtcyA/IGBbXFxcXHNcXFxcU117JHtwYXJhbXM/Lm1pbmltdW0gPz8gMH0sJHtwYXJhbXM/Lm1heGltdW0gPz8gXCJcIn19YCA6IGBbXFxcXHNcXFxcU10qYDtcclxuICAgIHJldHVybiBuZXcgUmVnRXhwKGBeJHtyZWdleH0kYCk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBiaWdpbnQgPSAvXi0/XFxkK24/JC87XHJcbmV4cG9ydCBjb25zdCBpbnRlZ2VyID0gL14tP1xcZCskLztcclxuZXhwb3J0IGNvbnN0IG51bWJlciA9IC9eLT9cXGQrKD86XFwuXFxkKyk/JC87XHJcbmV4cG9ydCBjb25zdCBib29sZWFuID0gL14oPzp0cnVlfGZhbHNlKSQvaTtcclxuY29uc3QgX251bGwgPSAvXm51bGwkL2k7XHJcbmV4cG9ydCB7IF9udWxsIGFzIG51bGwgfTtcclxuY29uc3QgX3VuZGVmaW5lZCA9IC9edW5kZWZpbmVkJC9pO1xyXG5leHBvcnQgeyBfdW5kZWZpbmVkIGFzIHVuZGVmaW5lZCB9O1xyXG4vLyByZWdleCBmb3Igc3RyaW5nIHdpdGggbm8gdXBwZXJjYXNlIGxldHRlcnNcclxuZXhwb3J0IGNvbnN0IGxvd2VyY2FzZSA9IC9eW15BLVpdKiQvO1xyXG4vLyByZWdleCBmb3Igc3RyaW5nIHdpdGggbm8gbG93ZXJjYXNlIGxldHRlcnNcclxuZXhwb3J0IGNvbnN0IHVwcGVyY2FzZSA9IC9eW15hLXpdKiQvO1xyXG4vLyByZWdleCBmb3IgaGV4YWRlY2ltYWwgc3RyaW5ncyAoYW55IGxlbmd0aClcclxuZXhwb3J0IGNvbnN0IGhleCA9IC9eWzAtOWEtZkEtRl0qJC87XHJcbi8vIEhhc2ggcmVnZXhlcyBmb3IgZGlmZmVyZW50IGFsZ29yaXRobXMgYW5kIGVuY29kaW5nc1xyXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGJhc2U2NCByZWdleCB3aXRoIGV4YWN0IGxlbmd0aCBhbmQgcGFkZGluZ1xyXG5mdW5jdGlvbiBmaXhlZEJhc2U2NChib2R5TGVuZ3RoLCBwYWRkaW5nKSB7XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXltBLVphLXowLTkrL117JHtib2R5TGVuZ3RofX0ke3BhZGRpbmd9JGApO1xyXG59XHJcbi8vIEhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYmFzZTY0dXJsIHJlZ2V4IHdpdGggZXhhY3QgbGVuZ3RoIChubyBwYWRkaW5nKVxyXG5mdW5jdGlvbiBmaXhlZEJhc2U2NHVybChsZW5ndGgpIHtcclxuICAgIHJldHVybiBuZXcgUmVnRXhwKGBeW0EtWmEtejAtOV8tXXske2xlbmd0aH19JGApO1xyXG59XHJcbi8vIE1ENSAoMTYgYnl0ZXMpOiBiYXNlNjQgPSAyNCBjaGFycyB0b3RhbCAoMjIgKyBcIj09XCIpXHJcbmV4cG9ydCBjb25zdCBtZDVfaGV4ID0gL15bMC05YS1mQS1GXXszMn0kLztcclxuZXhwb3J0IGNvbnN0IG1kNV9iYXNlNjQgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0KDIyLCBcIj09XCIpO1xyXG5leHBvcnQgY29uc3QgbWQ1X2Jhc2U2NHVybCA9IC8qQF9fUFVSRV9fKi8gZml4ZWRCYXNlNjR1cmwoMjIpO1xyXG4vLyBTSEExICgyMCBieXRlcyk6IGJhc2U2NCA9IDI4IGNoYXJzIHRvdGFsICgyNyArIFwiPVwiKVxyXG5leHBvcnQgY29uc3Qgc2hhMV9oZXggPSAvXlswLTlhLWZBLUZdezQwfSQvO1xyXG5leHBvcnQgY29uc3Qgc2hhMV9iYXNlNjQgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0KDI3LCBcIj1cIik7XHJcbmV4cG9ydCBjb25zdCBzaGExX2Jhc2U2NHVybCA9IC8qQF9fUFVSRV9fKi8gZml4ZWRCYXNlNjR1cmwoMjcpO1xyXG4vLyBTSEEyNTYgKDMyIGJ5dGVzKTogYmFzZTY0ID0gNDQgY2hhcnMgdG90YWwgKDQzICsgXCI9XCIpXHJcbmV4cG9ydCBjb25zdCBzaGEyNTZfaGV4ID0gL15bMC05YS1mQS1GXXs2NH0kLztcclxuZXhwb3J0IGNvbnN0IHNoYTI1Nl9iYXNlNjQgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0KDQzLCBcIj1cIik7XHJcbmV4cG9ydCBjb25zdCBzaGEyNTZfYmFzZTY0dXJsID0gLypAX19QVVJFX18qLyBmaXhlZEJhc2U2NHVybCg0Myk7XHJcbi8vIFNIQTM4NCAoNDggYnl0ZXMpOiBiYXNlNjQgPSA2NCBjaGFycyB0b3RhbCAobm8gcGFkZGluZylcclxuZXhwb3J0IGNvbnN0IHNoYTM4NF9oZXggPSAvXlswLTlhLWZBLUZdezk2fSQvO1xyXG5leHBvcnQgY29uc3Qgc2hhMzg0X2Jhc2U2NCA9IC8qQF9fUFVSRV9fKi8gZml4ZWRCYXNlNjQoNjQsIFwiXCIpO1xyXG5leHBvcnQgY29uc3Qgc2hhMzg0X2Jhc2U2NHVybCA9IC8qQF9fUFVSRV9fKi8gZml4ZWRCYXNlNjR1cmwoNjQpO1xyXG4vLyBTSEE1MTIgKDY0IGJ5dGVzKTogYmFzZTY0ID0gODggY2hhcnMgdG90YWwgKDg2ICsgXCI9PVwiKVxyXG5leHBvcnQgY29uc3Qgc2hhNTEyX2hleCA9IC9eWzAtOWEtZkEtRl17MTI4fSQvO1xyXG5leHBvcnQgY29uc3Qgc2hhNTEyX2Jhc2U2NCA9IC8qQF9fUFVSRV9fKi8gZml4ZWRCYXNlNjQoODYsIFwiPT1cIik7XHJcbmV4cG9ydCBjb25zdCBzaGE1MTJfYmFzZTY0dXJsID0gLypAX19QVVJFX18qLyBmaXhlZEJhc2U2NHVybCg4Nik7XHJcbiIsIi8vIGltcG9ydCB7ICRab2RUeXBlIH0gZnJvbSBcIi4vc2NoZW1hcy5qc1wiO1xyXG5pbXBvcnQgKiBhcyBjb3JlIGZyb20gXCIuL2NvcmUuanNcIjtcclxuaW1wb3J0ICogYXMgcmVnZXhlcyBmcm9tIFwiLi9yZWdleGVzLmpzXCI7XHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4vdXRpbC5qc1wiO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja1wiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICB2YXIgX2E7XHJcbiAgICBpbnN0Ll96b2QgPz8gKGluc3QuX3pvZCA9IHt9KTtcclxuICAgIGluc3QuX3pvZC5kZWYgPSBkZWY7XHJcbiAgICAoX2EgPSBpbnN0Ll96b2QpLm9uYXR0YWNoID8/IChfYS5vbmF0dGFjaCA9IFtdKTtcclxufSk7XHJcbmNvbnN0IG51bWVyaWNPcmlnaW5NYXAgPSB7XHJcbiAgICBudW1iZXI6IFwibnVtYmVyXCIsXHJcbiAgICBiaWdpbnQ6IFwiYmlnaW50XCIsXHJcbiAgICBvYmplY3Q6IFwiZGF0ZVwiLFxyXG59O1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrTGVzc1RoYW4gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrTGVzc1RoYW5cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvbnN0IG9yaWdpbiA9IG51bWVyaWNPcmlnaW5NYXBbdHlwZW9mIGRlZi52YWx1ZV07XHJcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJhZyA9IGluc3QuX3pvZC5iYWc7XHJcbiAgICAgICAgY29uc3QgY3VyciA9IChkZWYuaW5jbHVzaXZlID8gYmFnLm1heGltdW0gOiBiYWcuZXhjbHVzaXZlTWF4aW11bSkgPz8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG4gICAgICAgIGlmIChkZWYudmFsdWUgPCBjdXJyKSB7XHJcbiAgICAgICAgICAgIGlmIChkZWYuaW5jbHVzaXZlKVxyXG4gICAgICAgICAgICAgICAgYmFnLm1heGltdW0gPSBkZWYudmFsdWU7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGJhZy5leGNsdXNpdmVNYXhpbXVtID0gZGVmLnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBpZiAoZGVmLmluY2x1c2l2ZSA/IHBheWxvYWQudmFsdWUgPD0gZGVmLnZhbHVlIDogcGF5bG9hZC52YWx1ZSA8IGRlZi52YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBvcmlnaW4sXHJcbiAgICAgICAgICAgIGNvZGU6IFwidG9vX2JpZ1wiLFxyXG4gICAgICAgICAgICBtYXhpbXVtOiB0eXBlb2YgZGVmLnZhbHVlID09PSBcIm9iamVjdFwiID8gZGVmLnZhbHVlLmdldFRpbWUoKSA6IGRlZi52YWx1ZSxcclxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZGVmLmluY2x1c2l2ZSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja0dyZWF0ZXJUaGFuID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja0dyZWF0ZXJUaGFuXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb25zdCBvcmlnaW4gPSBudW1lcmljT3JpZ2luTWFwW3R5cGVvZiBkZWYudmFsdWVdO1xyXG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcclxuICAgICAgICBjb25zdCBiYWcgPSBpbnN0Ll96b2QuYmFnO1xyXG4gICAgICAgIGNvbnN0IGN1cnIgPSAoZGVmLmluY2x1c2l2ZSA/IGJhZy5taW5pbXVtIDogYmFnLmV4Y2x1c2l2ZU1pbmltdW0pID8/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcclxuICAgICAgICBpZiAoZGVmLnZhbHVlID4gY3Vycikge1xyXG4gICAgICAgICAgICBpZiAoZGVmLmluY2x1c2l2ZSlcclxuICAgICAgICAgICAgICAgIGJhZy5taW5pbXVtID0gZGVmLnZhbHVlO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBiYWcuZXhjbHVzaXZlTWluaW11bSA9IGRlZi52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgaWYgKGRlZi5pbmNsdXNpdmUgPyBwYXlsb2FkLnZhbHVlID49IGRlZi52YWx1ZSA6IHBheWxvYWQudmFsdWUgPiBkZWYudmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgb3JpZ2luLFxyXG4gICAgICAgICAgICBjb2RlOiBcInRvb19zbWFsbFwiLFxyXG4gICAgICAgICAgICBtaW5pbXVtOiB0eXBlb2YgZGVmLnZhbHVlID09PSBcIm9iamVjdFwiID8gZGVmLnZhbHVlLmdldFRpbWUoKSA6IGRlZi52YWx1ZSxcclxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgIGluY2x1c2l2ZTogZGVmLmluY2x1c2l2ZSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja011bHRpcGxlT2YgPSBcclxuLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja011bHRpcGxlT2ZcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIChfYSA9IGluc3QuX3pvZC5iYWcpLm11bHRpcGxlT2YgPz8gKF9hLm11bHRpcGxlT2YgPSBkZWYudmFsdWUpO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC52YWx1ZSAhPT0gdHlwZW9mIGRlZi52YWx1ZSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IG1peCBudW1iZXIgYW5kIGJpZ2ludCBpbiBtdWx0aXBsZV9vZiBjaGVjay5cIik7XHJcbiAgICAgICAgY29uc3QgaXNNdWx0aXBsZSA9IHR5cGVvZiBwYXlsb2FkLnZhbHVlID09PSBcImJpZ2ludFwiXHJcbiAgICAgICAgICAgID8gcGF5bG9hZC52YWx1ZSAlIGRlZi52YWx1ZSA9PT0gQmlnSW50KDApXHJcbiAgICAgICAgICAgIDogdXRpbC5mbG9hdFNhZmVSZW1haW5kZXIocGF5bG9hZC52YWx1ZSwgZGVmLnZhbHVlKSA9PT0gMDtcclxuICAgICAgICBpZiAoaXNNdWx0aXBsZSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBvcmlnaW46IHR5cGVvZiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBjb2RlOiBcIm5vdF9tdWx0aXBsZV9vZlwiLFxyXG4gICAgICAgICAgICBkaXZpc29yOiBkZWYudmFsdWUsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrTnVtYmVyRm9ybWF0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja051bWJlckZvcm1hdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpOyAvLyBubyBmb3JtYXQgY2hlY2tzXHJcbiAgICBkZWYuZm9ybWF0ID0gZGVmLmZvcm1hdCB8fCBcImZsb2F0NjRcIjtcclxuICAgIGNvbnN0IGlzSW50ID0gZGVmLmZvcm1hdD8uaW5jbHVkZXMoXCJpbnRcIik7XHJcbiAgICBjb25zdCBvcmlnaW4gPSBpc0ludCA/IFwiaW50XCIgOiBcIm51bWJlclwiO1xyXG4gICAgY29uc3QgW21pbmltdW0sIG1heGltdW1dID0gdXRpbC5OVU1CRVJfRk9STUFUX1JBTkdFU1tkZWYuZm9ybWF0XTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcclxuICAgICAgICBiYWcuZm9ybWF0ID0gZGVmLmZvcm1hdDtcclxuICAgICAgICBiYWcubWluaW11bSA9IG1pbmltdW07XHJcbiAgICAgICAgYmFnLm1heGltdW0gPSBtYXhpbXVtO1xyXG4gICAgICAgIGlmIChpc0ludClcclxuICAgICAgICAgICAgYmFnLnBhdHRlcm4gPSByZWdleGVzLmludGVnZXI7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmIChpc0ludCkge1xyXG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc0ludGVnZXIoaW5wdXQpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBpbnZhbGlkX2Zvcm1hdCBpc3N1ZVxyXG4gICAgICAgICAgICAgICAgLy8gcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAvLyAgIGV4cGVjdGVkOiBkZWYuZm9ybWF0LFxyXG4gICAgICAgICAgICAgICAgLy8gICBmb3JtYXQ6IGRlZi5mb3JtYXQsXHJcbiAgICAgICAgICAgICAgICAvLyAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcclxuICAgICAgICAgICAgICAgIC8vICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICAvLyAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICAvLyB9KTtcclxuICAgICAgICAgICAgICAgIC8vIGludmFsaWRfdHlwZSBpc3N1ZVxyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IG9yaWdpbixcclxuICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IGRlZi5mb3JtYXQsXHJcbiAgICAgICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgLy8gbm90X211bHRpcGxlX29mIGlzc3VlXHJcbiAgICAgICAgICAgICAgICAvLyBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIC8vICAgY29kZTogXCJub3RfbXVsdGlwbGVfb2ZcIixcclxuICAgICAgICAgICAgICAgIC8vICAgb3JpZ2luOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICAgICAgLy8gICBpbnB1dCxcclxuICAgICAgICAgICAgICAgIC8vICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIC8vICAgZGl2aXNvcjogMSxcclxuICAgICAgICAgICAgICAgIC8vIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghTnVtYmVyLmlzU2FmZUludGVnZXIoaW5wdXQpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdG9vX2JpZ1xyXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogXCJ0b29fYmlnXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW06IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlOiBcIkludGVnZXJzIG11c3QgYmUgd2l0aGluIHRoZSBzYWZlIGludGVnZXIgcmFuZ2UuXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvb19zbWFsbFxyXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogXCJ0b29fc21hbGxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWluaW11bTogTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGU6IFwiSW50ZWdlcnMgbXVzdCBiZSB3aXRoaW4gdGhlIHNhZmUgaW50ZWdlciByYW5nZS5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnB1dCA8IG1pbmltdW0pIHtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW46IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwidG9vX3NtYWxsXCIsXHJcbiAgICAgICAgICAgICAgICBtaW5pbXVtLFxyXG4gICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlucHV0ID4gbWF4aW11bSkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIG9yaWdpbjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgY29kZTogXCJ0b29fYmlnXCIsXHJcbiAgICAgICAgICAgICAgICBtYXhpbXVtLFxyXG4gICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja0JpZ0ludEZvcm1hdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tCaWdJbnRGb3JtYXRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTsgLy8gbm8gZm9ybWF0IGNoZWNrc1xyXG4gICAgY29uc3QgW21pbmltdW0sIG1heGltdW1dID0gdXRpbC5CSUdJTlRfRk9STUFUX1JBTkdFU1tkZWYuZm9ybWF0XTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcclxuICAgICAgICBiYWcuZm9ybWF0ID0gZGVmLmZvcm1hdDtcclxuICAgICAgICBiYWcubWluaW11bSA9IG1pbmltdW07XHJcbiAgICAgICAgYmFnLm1heGltdW0gPSBtYXhpbXVtO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBpZiAoaW5wdXQgPCBtaW5pbXVtKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgb3JpZ2luOiBcImJpZ2ludFwiLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcInRvb19zbWFsbFwiLFxyXG4gICAgICAgICAgICAgICAgbWluaW11bTogbWluaW11bSxcclxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnB1dCA+IG1heGltdW0pIHtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW46IFwiYmlnaW50XCIsXHJcbiAgICAgICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwidG9vX2JpZ1wiLFxyXG4gICAgICAgICAgICAgICAgbWF4aW11bSxcclxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tNYXhTaXplID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja01heFNpemVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgdmFyIF9hO1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIChfYSA9IGluc3QuX3pvZC5kZWYpLndoZW4gPz8gKF9hLndoZW4gPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgcmV0dXJuICF1dGlsLm51bGxpc2godmFsKSAmJiB2YWwuc2l6ZSAhPT0gdW5kZWZpbmVkO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGN1cnIgPSAoaW5zdC5fem9kLmJhZy5tYXhpbXVtID8/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSk7XHJcbiAgICAgICAgaWYgKGRlZi5tYXhpbXVtIDwgY3VycilcclxuICAgICAgICAgICAgaW5zdC5fem9kLmJhZy5tYXhpbXVtID0gZGVmLm1heGltdW07XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IHNpemUgPSBpbnB1dC5zaXplO1xyXG4gICAgICAgIGlmIChzaXplIDw9IGRlZi5tYXhpbXVtKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIG9yaWdpbjogdXRpbC5nZXRTaXphYmxlT3JpZ2luKGlucHV0KSxcclxuICAgICAgICAgICAgY29kZTogXCJ0b29fYmlnXCIsXHJcbiAgICAgICAgICAgIG1heGltdW06IGRlZi5tYXhpbXVtLFxyXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrTWluU2l6ZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tNaW5TaXplXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIHZhciBfYTtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICAoX2EgPSBpbnN0Ll96b2QuZGVmKS53aGVuID8/IChfYS53aGVuID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjb25zdCB2YWwgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIHJldHVybiAhdXRpbC5udWxsaXNoKHZhbCkgJiYgdmFsLnNpemUgIT09IHVuZGVmaW5lZDtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcclxuICAgICAgICBjb25zdCBjdXJyID0gKGluc3QuX3pvZC5iYWcubWluaW11bSA/PyBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpO1xyXG4gICAgICAgIGlmIChkZWYubWluaW11bSA+IGN1cnIpXHJcbiAgICAgICAgICAgIGluc3QuX3pvZC5iYWcubWluaW11bSA9IGRlZi5taW5pbXVtO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBjb25zdCBzaXplID0gaW5wdXQuc2l6ZTtcclxuICAgICAgICBpZiAoc2l6ZSA+PSBkZWYubWluaW11bSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBvcmlnaW46IHV0aWwuZ2V0U2l6YWJsZU9yaWdpbihpbnB1dCksXHJcbiAgICAgICAgICAgIGNvZGU6IFwidG9vX3NtYWxsXCIsXHJcbiAgICAgICAgICAgIG1pbmltdW06IGRlZi5taW5pbXVtLFxyXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrU2l6ZUVxdWFscyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tTaXplRXF1YWxzXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIHZhciBfYTtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICAoX2EgPSBpbnN0Ll96b2QuZGVmKS53aGVuID8/IChfYS53aGVuID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjb25zdCB2YWwgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIHJldHVybiAhdXRpbC5udWxsaXNoKHZhbCkgJiYgdmFsLnNpemUgIT09IHVuZGVmaW5lZDtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcclxuICAgICAgICBjb25zdCBiYWcgPSBpbnN0Ll96b2QuYmFnO1xyXG4gICAgICAgIGJhZy5taW5pbXVtID0gZGVmLnNpemU7XHJcbiAgICAgICAgYmFnLm1heGltdW0gPSBkZWYuc2l6ZTtcclxuICAgICAgICBiYWcuc2l6ZSA9IGRlZi5zaXplO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBjb25zdCBzaXplID0gaW5wdXQuc2l6ZTtcclxuICAgICAgICBpZiAoc2l6ZSA9PT0gZGVmLnNpemUpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zdCB0b29CaWcgPSBzaXplID4gZGVmLnNpemU7XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIG9yaWdpbjogdXRpbC5nZXRTaXphYmxlT3JpZ2luKGlucHV0KSxcclxuICAgICAgICAgICAgLi4uKHRvb0JpZyA/IHsgY29kZTogXCJ0b29fYmlnXCIsIG1heGltdW06IGRlZi5zaXplIH0gOiB7IGNvZGU6IFwidG9vX3NtYWxsXCIsIG1pbmltdW06IGRlZi5zaXplIH0pLFxyXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIGV4YWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja01heExlbmd0aCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tNYXhMZW5ndGhcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgdmFyIF9hO1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIChfYSA9IGluc3QuX3pvZC5kZWYpLndoZW4gPz8gKF9hLndoZW4gPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgcmV0dXJuICF1dGlsLm51bGxpc2godmFsKSAmJiB2YWwubGVuZ3RoICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgY3VyciA9IChpbnN0Ll96b2QuYmFnLm1heGltdW0gPz8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKTtcclxuICAgICAgICBpZiAoZGVmLm1heGltdW0gPCBjdXJyKVxyXG4gICAgICAgICAgICBpbnN0Ll96b2QuYmFnLm1heGltdW0gPSBkZWYubWF4aW11bTtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xyXG4gICAgICAgIGlmIChsZW5ndGggPD0gZGVmLm1heGltdW0pXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zdCBvcmlnaW4gPSB1dGlsLmdldExlbmd0aGFibGVPcmlnaW4oaW5wdXQpO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBvcmlnaW4sXHJcbiAgICAgICAgICAgIGNvZGU6IFwidG9vX2JpZ1wiLFxyXG4gICAgICAgICAgICBtYXhpbXVtOiBkZWYubWF4aW11bSxcclxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja01pbkxlbmd0aCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tNaW5MZW5ndGhcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgdmFyIF9hO1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIChfYSA9IGluc3QuX3pvZC5kZWYpLndoZW4gPz8gKF9hLndoZW4gPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgcmV0dXJuICF1dGlsLm51bGxpc2godmFsKSAmJiB2YWwubGVuZ3RoICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgY3VyciA9IChpbnN0Ll96b2QuYmFnLm1pbmltdW0gPz8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKTtcclxuICAgICAgICBpZiAoZGVmLm1pbmltdW0gPiBjdXJyKVxyXG4gICAgICAgICAgICBpbnN0Ll96b2QuYmFnLm1pbmltdW0gPSBkZWYubWluaW11bTtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xyXG4gICAgICAgIGlmIChsZW5ndGggPj0gZGVmLm1pbmltdW0pXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBjb25zdCBvcmlnaW4gPSB1dGlsLmdldExlbmd0aGFibGVPcmlnaW4oaW5wdXQpO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBvcmlnaW4sXHJcbiAgICAgICAgICAgIGNvZGU6IFwidG9vX3NtYWxsXCIsXHJcbiAgICAgICAgICAgIG1pbmltdW06IGRlZi5taW5pbXVtLFxyXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrTGVuZ3RoRXF1YWxzID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja0xlbmd0aEVxdWFsc1wiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICB2YXIgX2E7XHJcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgKF9hID0gaW5zdC5fem9kLmRlZikud2hlbiA/PyAoX2Eud2hlbiA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFsID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICByZXR1cm4gIXV0aWwubnVsbGlzaCh2YWwpICYmIHZhbC5sZW5ndGggIT09IHVuZGVmaW5lZDtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcclxuICAgICAgICBjb25zdCBiYWcgPSBpbnN0Ll96b2QuYmFnO1xyXG4gICAgICAgIGJhZy5taW5pbXVtID0gZGVmLmxlbmd0aDtcclxuICAgICAgICBiYWcubWF4aW11bSA9IGRlZi5sZW5ndGg7XHJcbiAgICAgICAgYmFnLmxlbmd0aCA9IGRlZi5sZW5ndGg7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuZ3RoID09PSBkZWYubGVuZ3RoKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luID0gdXRpbC5nZXRMZW5ndGhhYmxlT3JpZ2luKGlucHV0KTtcclxuICAgICAgICBjb25zdCB0b29CaWcgPSBsZW5ndGggPiBkZWYubGVuZ3RoO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBvcmlnaW4sXHJcbiAgICAgICAgICAgIC4uLih0b29CaWcgPyB7IGNvZGU6IFwidG9vX2JpZ1wiLCBtYXhpbXVtOiBkZWYubGVuZ3RoIH0gOiB7IGNvZGU6IFwidG9vX3NtYWxsXCIsIG1pbmltdW06IGRlZi5sZW5ndGggfSksXHJcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgZXhhY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrU3RyaW5nRm9ybWF0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja1N0cmluZ0Zvcm1hdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICB2YXIgX2EsIF9iO1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcclxuICAgICAgICBiYWcuZm9ybWF0ID0gZGVmLmZvcm1hdDtcclxuICAgICAgICBpZiAoZGVmLnBhdHRlcm4pIHtcclxuICAgICAgICAgICAgYmFnLnBhdHRlcm5zID8/IChiYWcucGF0dGVybnMgPSBuZXcgU2V0KCkpO1xyXG4gICAgICAgICAgICBiYWcucGF0dGVybnMuYWRkKGRlZi5wYXR0ZXJuKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGlmIChkZWYucGF0dGVybilcclxuICAgICAgICAoX2EgPSBpbnN0Ll96b2QpLmNoZWNrID8/IChfYS5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgICAgIGRlZi5wYXR0ZXJuLmxhc3RJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIGlmIChkZWYucGF0dGVybi50ZXN0KHBheWxvYWQudmFsdWUpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIG9yaWdpbjogXCJzdHJpbmdcIixcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcclxuICAgICAgICAgICAgICAgIGZvcm1hdDogZGVmLmZvcm1hdCxcclxuICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgLi4uKGRlZi5wYXR0ZXJuID8geyBwYXR0ZXJuOiBkZWYucGF0dGVybi50b1N0cmluZygpIH0gOiB7fSksXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgZWxzZVxyXG4gICAgICAgIChfYiA9IGluc3QuX3pvZCkuY2hlY2sgPz8gKF9iLmNoZWNrID0gKCkgPT4geyB9KTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tSZWdleCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tSZWdleFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kQ2hlY2tTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBkZWYucGF0dGVybi5sYXN0SW5kZXggPSAwO1xyXG4gICAgICAgIGlmIChkZWYucGF0dGVybi50ZXN0KHBheWxvYWQudmFsdWUpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIG9yaWdpbjogXCJzdHJpbmdcIixcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxyXG4gICAgICAgICAgICBmb3JtYXQ6IFwicmVnZXhcIixcclxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgIHBhdHRlcm46IGRlZi5wYXR0ZXJuLnRvU3RyaW5nKCksXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tMb3dlckNhc2UgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrTG93ZXJDYXNlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMubG93ZXJjYXNlKTtcclxuICAgICRab2RDaGVja1N0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrVXBwZXJDYXNlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja1VwcGVyQ2FzZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLnVwcGVyY2FzZSk7XHJcbiAgICAkWm9kQ2hlY2tTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja0luY2x1ZGVzID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja0luY2x1ZGVzXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb25zdCBlc2NhcGVkUmVnZXggPSB1dGlsLmVzY2FwZVJlZ2V4KGRlZi5pbmNsdWRlcyk7XHJcbiAgICBjb25zdCBwYXR0ZXJuID0gbmV3IFJlZ0V4cCh0eXBlb2YgZGVmLnBvc2l0aW9uID09PSBcIm51bWJlclwiID8gYF4ueyR7ZGVmLnBvc2l0aW9ufX0ke2VzY2FwZWRSZWdleH1gIDogZXNjYXBlZFJlZ2V4KTtcclxuICAgIGRlZi5wYXR0ZXJuID0gcGF0dGVybjtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcclxuICAgICAgICBiYWcucGF0dGVybnMgPz8gKGJhZy5wYXR0ZXJucyA9IG5ldyBTZXQoKSk7XHJcbiAgICAgICAgYmFnLnBhdHRlcm5zLmFkZChwYXR0ZXJuKTtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBpZiAocGF5bG9hZC52YWx1ZS5pbmNsdWRlcyhkZWYuaW5jbHVkZXMsIGRlZi5wb3NpdGlvbikpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgb3JpZ2luOiBcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXHJcbiAgICAgICAgICAgIGZvcm1hdDogXCJpbmNsdWRlc1wiLFxyXG4gICAgICAgICAgICBpbmNsdWRlczogZGVmLmluY2x1ZGVzLFxyXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja1N0YXJ0c1dpdGggPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrU3RhcnRzV2l0aFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29uc3QgcGF0dGVybiA9IG5ldyBSZWdFeHAoYF4ke3V0aWwuZXNjYXBlUmVnZXgoZGVmLnByZWZpeCl9LipgKTtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHBhdHRlcm4pO1xyXG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcclxuICAgICAgICBjb25zdCBiYWcgPSBpbnN0Ll96b2QuYmFnO1xyXG4gICAgICAgIGJhZy5wYXR0ZXJucyA/PyAoYmFnLnBhdHRlcm5zID0gbmV3IFNldCgpKTtcclxuICAgICAgICBiYWcucGF0dGVybnMuYWRkKHBhdHRlcm4pO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGlmIChwYXlsb2FkLnZhbHVlLnN0YXJ0c1dpdGgoZGVmLnByZWZpeCkpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgb3JpZ2luOiBcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXHJcbiAgICAgICAgICAgIGZvcm1hdDogXCJzdGFydHNfd2l0aFwiLFxyXG4gICAgICAgICAgICBwcmVmaXg6IGRlZi5wcmVmaXgsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrRW5kc1dpdGggPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrRW5kc1dpdGhcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvbnN0IHBhdHRlcm4gPSBuZXcgUmVnRXhwKGAuKiR7dXRpbC5lc2NhcGVSZWdleChkZWYuc3VmZml4KX0kYCk7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSBwYXR0ZXJuKTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcclxuICAgICAgICBiYWcucGF0dGVybnMgPz8gKGJhZy5wYXR0ZXJucyA9IG5ldyBTZXQoKSk7XHJcbiAgICAgICAgYmFnLnBhdHRlcm5zLmFkZChwYXR0ZXJuKTtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBpZiAocGF5bG9hZC52YWx1ZS5lbmRzV2l0aChkZWYuc3VmZml4KSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBvcmlnaW46IFwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcclxuICAgICAgICAgICAgZm9ybWF0OiBcImVuZHNfd2l0aFwiLFxyXG4gICAgICAgICAgICBzdWZmaXg6IGRlZi5zdWZmaXgsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4vLy8vLyAgICAkWm9kQ2hlY2tQcm9wZXJ0eSAgICAvLy8vL1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG5mdW5jdGlvbiBoYW5kbGVDaGVja1Byb3BlcnR5UmVzdWx0KHJlc3VsdCwgcGF5bG9hZCwgcHJvcGVydHkpIHtcclxuICAgIGlmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goLi4udXRpbC5wcmVmaXhJc3N1ZXMocHJvcGVydHksIHJlc3VsdC5pc3N1ZXMpKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrUHJvcGVydHkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrUHJvcGVydHlcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGVmLnNjaGVtYS5fem9kLnJ1bih7XHJcbiAgICAgICAgICAgIHZhbHVlOiBwYXlsb2FkLnZhbHVlW2RlZi5wcm9wZXJ0eV0sXHJcbiAgICAgICAgICAgIGlzc3VlczogW10sXHJcbiAgICAgICAgfSwge30pO1xyXG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigocmVzdWx0KSA9PiBoYW5kbGVDaGVja1Byb3BlcnR5UmVzdWx0KHJlc3VsdCwgcGF5bG9hZCwgZGVmLnByb3BlcnR5KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZUNoZWNrUHJvcGVydHlSZXN1bHQocmVzdWx0LCBwYXlsb2FkLCBkZWYucHJvcGVydHkpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrTWltZVR5cGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrTWltZVR5cGVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvbnN0IG1pbWVTZXQgPSBuZXcgU2V0KGRlZi5taW1lKTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgaW5zdC5fem9kLmJhZy5taW1lID0gZGVmLm1pbWU7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgaWYgKG1pbWVTZXQuaGFzKHBheWxvYWQudmFsdWUudHlwZSkpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3ZhbHVlXCIsXHJcbiAgICAgICAgICAgIHZhbHVlczogZGVmLm1pbWUsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLnR5cGUsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tPdmVyd3JpdGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrT3ZlcndyaXRlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIHBheWxvYWQudmFsdWUgPSBkZWYudHgocGF5bG9hZC52YWx1ZSk7XHJcbiAgICB9O1xyXG59KTtcclxuIiwiZXhwb3J0IGNsYXNzIERvYyB7XHJcbiAgICBjb25zdHJ1Y3RvcihhcmdzID0gW10pIHtcclxuICAgICAgICB0aGlzLmNvbnRlbnQgPSBbXTtcclxuICAgICAgICB0aGlzLmluZGVudCA9IDA7XHJcbiAgICAgICAgaWYgKHRoaXMpXHJcbiAgICAgICAgICAgIHRoaXMuYXJncyA9IGFyZ3M7XHJcbiAgICB9XHJcbiAgICBpbmRlbnRlZChmbikge1xyXG4gICAgICAgIHRoaXMuaW5kZW50ICs9IDE7XHJcbiAgICAgICAgZm4odGhpcyk7XHJcbiAgICAgICAgdGhpcy5pbmRlbnQgLT0gMTtcclxuICAgIH1cclxuICAgIHdyaXRlKGFyZykge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYXJnID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgYXJnKHRoaXMsIHsgZXhlY3V0aW9uOiBcInN5bmNcIiB9KTtcclxuICAgICAgICAgICAgYXJnKHRoaXMsIHsgZXhlY3V0aW9uOiBcImFzeW5jXCIgfSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY29udGVudCA9IGFyZztcclxuICAgICAgICBjb25zdCBsaW5lcyA9IGNvbnRlbnQuc3BsaXQoXCJcXG5cIikuZmlsdGVyKCh4KSA9PiB4KTtcclxuICAgICAgICBjb25zdCBtaW5JbmRlbnQgPSBNYXRoLm1pbiguLi5saW5lcy5tYXAoKHgpID0+IHgubGVuZ3RoIC0geC50cmltU3RhcnQoKS5sZW5ndGgpKTtcclxuICAgICAgICBjb25zdCBkZWRlbnRlZCA9IGxpbmVzLm1hcCgoeCkgPT4geC5zbGljZShtaW5JbmRlbnQpKS5tYXAoKHgpID0+IFwiIFwiLnJlcGVhdCh0aGlzLmluZGVudCAqIDIpICsgeCk7XHJcbiAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGRlZGVudGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudC5wdXNoKGxpbmUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbXBpbGUoKSB7XHJcbiAgICAgICAgY29uc3QgRiA9IEZ1bmN0aW9uO1xyXG4gICAgICAgIGNvbnN0IGFyZ3MgPSB0aGlzPy5hcmdzO1xyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzPy5jb250ZW50ID8/IFtgYF07XHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBbLi4uY29udGVudC5tYXAoKHgpID0+IGAgICR7eH1gKV07XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2cobGluZXMuam9pbihcIlxcblwiKSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGKC4uLmFyZ3MsIGxpbmVzLmpvaW4oXCJcXG5cIikpO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBjb25zdCB2ZXJzaW9uID0ge1xyXG4gICAgbWFqb3I6IDQsXHJcbiAgICBtaW5vcjogNCxcclxuICAgIHBhdGNoOiAzLFxyXG59O1xyXG4iLCJpbXBvcnQgKiBhcyBjaGVja3MgZnJvbSBcIi4vY2hlY2tzLmpzXCI7XHJcbmltcG9ydCAqIGFzIGNvcmUgZnJvbSBcIi4vY29yZS5qc1wiO1xyXG5pbXBvcnQgeyBEb2MgfSBmcm9tIFwiLi9kb2MuanNcIjtcclxuaW1wb3J0IHsgcGFyc2UsIHBhcnNlQXN5bmMsIHNhZmVQYXJzZSwgc2FmZVBhcnNlQXN5bmMgfSBmcm9tIFwiLi9wYXJzZS5qc1wiO1xyXG5pbXBvcnQgKiBhcyByZWdleGVzIGZyb20gXCIuL3JlZ2V4ZXMuanNcIjtcclxuaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi91dGlsLmpzXCI7XHJcbmltcG9ydCB7IHZlcnNpb24gfSBmcm9tIFwiLi92ZXJzaW9ucy5qc1wiO1xyXG5leHBvcnQgY29uc3QgJFpvZFR5cGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFR5cGVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgdmFyIF9hO1xyXG4gICAgaW5zdCA/PyAoaW5zdCA9IHt9KTtcclxuICAgIGluc3QuX3pvZC5kZWYgPSBkZWY7IC8vIHNldCBfZGVmIHByb3BlcnR5XHJcbiAgICBpbnN0Ll96b2QuYmFnID0gaW5zdC5fem9kLmJhZyB8fCB7fTsgLy8gaW5pdGlhbGl6ZSBfYmFnIG9iamVjdFxyXG4gICAgaW5zdC5fem9kLnZlcnNpb24gPSB2ZXJzaW9uO1xyXG4gICAgY29uc3QgY2hlY2tzID0gWy4uLihpbnN0Ll96b2QuZGVmLmNoZWNrcyA/PyBbXSldO1xyXG4gICAgLy8gaWYgaW5zdCBpcyBpdHNlbGYgYSBjaGVja3MuJFpvZENoZWNrLCBydW4gaXQgYXMgYSBjaGVja1xyXG4gICAgaWYgKGluc3QuX3pvZC50cmFpdHMuaGFzKFwiJFpvZENoZWNrXCIpKSB7XHJcbiAgICAgICAgY2hlY2tzLnVuc2hpZnQoaW5zdCk7XHJcbiAgICB9XHJcbiAgICBmb3IgKGNvbnN0IGNoIG9mIGNoZWNrcykge1xyXG4gICAgICAgIGZvciAoY29uc3QgZm4gb2YgY2guX3pvZC5vbmF0dGFjaCkge1xyXG4gICAgICAgICAgICBmbihpbnN0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoY2hlY2tzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIC8vIGRlZmVycmVkIGluaXRpYWxpemVyXHJcbiAgICAgICAgLy8gaW5zdC5fem9kLnBhcnNlIGlzIG5vdCB5ZXQgZGVmaW5lZFxyXG4gICAgICAgIChfYSA9IGluc3QuX3pvZCkuZGVmZXJyZWQgPz8gKF9hLmRlZmVycmVkID0gW10pO1xyXG4gICAgICAgIGluc3QuX3pvZC5kZWZlcnJlZD8ucHVzaCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGluc3QuX3pvZC5ydW4gPSBpbnN0Ll96b2QucGFyc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjb25zdCBydW5DaGVja3MgPSAocGF5bG9hZCwgY2hlY2tzLCBjdHgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGlzQWJvcnRlZCA9IHV0aWwuYWJvcnRlZChwYXlsb2FkKTtcclxuICAgICAgICAgICAgbGV0IGFzeW5jUmVzdWx0O1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIGNoZWNrcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoLl96b2QuZGVmLndoZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodXRpbC5leHBsaWNpdGx5QWJvcnRlZChwYXlsb2FkKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hvdWxkUnVuID0gY2guX3pvZC5kZWYud2hlbihwYXlsb2FkKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXNob3VsZFJ1bilcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc0Fib3J0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJMZW4gPSBwYXlsb2FkLmlzc3Vlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBfID0gY2guX3pvZC5jaGVjayhwYXlsb2FkKTtcclxuICAgICAgICAgICAgICAgIGlmIChfIGluc3RhbmNlb2YgUHJvbWlzZSAmJiBjdHg/LmFzeW5jID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBjb3JlLiRab2RBc3luY0Vycm9yKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoYXN5bmNSZXN1bHQgfHwgXyBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBhc3luY1Jlc3VsdCA9IChhc3luY1Jlc3VsdCA/PyBQcm9taXNlLnJlc29sdmUoKSkudGhlbihhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IF87XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHRMZW4gPSBwYXlsb2FkLmlzc3Vlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0TGVuID09PSBjdXJyTGVuKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQWJvcnRlZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQWJvcnRlZCA9IHV0aWwuYWJvcnRlZChwYXlsb2FkLCBjdXJyTGVuKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHRMZW4gPSBwYXlsb2FkLmlzc3Vlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRMZW4gPT09IGN1cnJMZW4pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNBYm9ydGVkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0Fib3J0ZWQgPSB1dGlsLmFib3J0ZWQocGF5bG9hZCwgY3Vyckxlbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFzeW5jUmVzdWx0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmNSZXN1bHQudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZUNhbmFyeVJlc3VsdCA9IChjYW5hcnksIHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBhYm9ydCBpZiB0aGUgY2FuYXJ5IGlzIGFib3J0ZWRcclxuICAgICAgICAgICAgaWYgKHV0aWwuYWJvcnRlZChjYW5hcnkpKSB7XHJcbiAgICAgICAgICAgICAgICBjYW5hcnkuYWJvcnRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FuYXJ5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHJ1biBjaGVja3MgZmlyc3QsIHRoZW5cclxuICAgICAgICAgICAgY29uc3QgY2hlY2tSZXN1bHQgPSBydW5DaGVja3MocGF5bG9hZCwgY2hlY2tzLCBjdHgpO1xyXG4gICAgICAgICAgICBpZiAoY2hlY2tSZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3R4LmFzeW5jID09PSBmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgY29yZS4kWm9kQXN5bmNFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoZWNrUmVzdWx0LnRoZW4oKGNoZWNrUmVzdWx0KSA9PiBpbnN0Ll96b2QucGFyc2UoY2hlY2tSZXN1bHQsIGN0eCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBpbnN0Ll96b2QucGFyc2UoY2hlY2tSZXN1bHQsIGN0eCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpbnN0Ll96b2QucnVuID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoY3R4LnNraXBDaGVja3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0Ll96b2QucGFyc2UocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY3R4LmRpcmVjdGlvbiA9PT0gXCJiYWNrd2FyZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBydW4gY2FuYXJ5XHJcbiAgICAgICAgICAgICAgICAvLyBpbml0aWFsIHBhc3MgKG5vIGNoZWNrcylcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNhbmFyeSA9IGluc3QuX3pvZC5wYXJzZSh7IHZhbHVlOiBwYXlsb2FkLnZhbHVlLCBpc3N1ZXM6IFtdIH0sIHsgLi4uY3R4LCBza2lwQ2hlY2tzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhbmFyeSBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FuYXJ5LnRoZW4oKGNhbmFyeSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlQ2FuYXJ5UmVzdWx0KGNhbmFyeSwgcGF5bG9hZCwgY3R4KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVDYW5hcnlSZXN1bHQoY2FuYXJ5LCBwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGZvcndhcmRcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gaW5zdC5fem9kLnBhcnNlKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY3R4LmFzeW5jID09PSBmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgY29yZS4kWm9kQXN5bmNFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC50aGVuKChyZXN1bHQpID0+IHJ1bkNoZWNrcyhyZXN1bHQsIGNoZWNrcywgY3R4KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJ1bkNoZWNrcyhyZXN1bHQsIGNoZWNrcywgY3R4KTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgLy8gTGF6eSBpbml0aWFsaXplIH5zdGFuZGFyZCB0byBhdm9pZCBjcmVhdGluZyBvYmplY3RzIGZvciBldmVyeSBzY2hlbWFcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0LCBcIn5zdGFuZGFyZFwiLCAoKSA9PiAoe1xyXG4gICAgICAgIHZhbGlkYXRlOiAodmFsdWUpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBzYWZlUGFyc2UoaW5zdCwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHIuc3VjY2VzcyA/IHsgdmFsdWU6IHIuZGF0YSB9IDogeyBpc3N1ZXM6IHIuZXJyb3I/Lmlzc3VlcyB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChfKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2FmZVBhcnNlQXN5bmMoaW5zdCwgdmFsdWUpLnRoZW4oKHIpID0+IChyLnN1Y2Nlc3MgPyB7IHZhbHVlOiByLmRhdGEgfSA6IHsgaXNzdWVzOiByLmVycm9yPy5pc3N1ZXMgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB2ZW5kb3I6IFwiem9kXCIsXHJcbiAgICAgICAgdmVyc2lvbjogMSxcclxuICAgIH0pKTtcclxufSk7XHJcbmV4cG9ydCB7IGNsb25lIH0gZnJvbSBcIi4vdXRpbC5qc1wiO1xyXG5leHBvcnQgY29uc3QgJFpvZFN0cmluZyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kU3RyaW5nXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXR0ZXJuID0gWy4uLihpbnN0Py5fem9kLmJhZz8ucGF0dGVybnMgPz8gW10pXS5wb3AoKSA/PyByZWdleGVzLnN0cmluZyhpbnN0Ll96b2QuYmFnKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfKSA9PiB7XHJcbiAgICAgICAgaWYgKGRlZi5jb2VyY2UpXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gU3RyaW5nKHBheWxvYWQudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChfKSB7IH1cclxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQudmFsdWUgPT09IFwic3RyaW5nXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBleHBlY3RlZDogXCJzdHJpbmdcIixcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RTdHJpbmdGb3JtYXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFN0cmluZ0Zvcm1hdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBjaGVjayBpbml0aWFsaXphdGlvbiBtdXN0IGNvbWUgZmlyc3RcclxuICAgIGNoZWNrcy4kWm9kQ2hlY2tTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgJFpvZFN0cmluZy5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZEdVSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEdVSURcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5ndWlkKTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RVVUlEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RVVUlEXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGlmIChkZWYudmVyc2lvbikge1xyXG4gICAgICAgIGNvbnN0IHZlcnNpb25NYXAgPSB7XHJcbiAgICAgICAgICAgIHYxOiAxLFxyXG4gICAgICAgICAgICB2MjogMixcclxuICAgICAgICAgICAgdjM6IDMsXHJcbiAgICAgICAgICAgIHY0OiA0LFxyXG4gICAgICAgICAgICB2NTogNSxcclxuICAgICAgICAgICAgdjY6IDYsXHJcbiAgICAgICAgICAgIHY3OiA3LFxyXG4gICAgICAgICAgICB2ODogOCxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHYgPSB2ZXJzaW9uTWFwW2RlZi52ZXJzaW9uXTtcclxuICAgICAgICBpZiAodiA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgVVVJRCB2ZXJzaW9uOiBcIiR7ZGVmLnZlcnNpb259XCJgKTtcclxuICAgICAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLnV1aWQodikpO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAgICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMudXVpZCgpKTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RFbWFpbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kRW1haWxcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5lbWFpbCk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kVVJMID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RVUkxcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIFRyaW0gd2hpdGVzcGFjZSBmcm9tIGlucHV0XHJcbiAgICAgICAgICAgIGNvbnN0IHRyaW1tZWQgPSBwYXlsb2FkLnZhbHVlLnRyaW0oKTtcclxuICAgICAgICAgICAgLy8gV2hlbiBub3JtYWxpemUgaXMgb2ZmLCByZXF1aXJlIDovLyBmb3IgaHR0cC9odHRwcyBVUkxzXHJcbiAgICAgICAgICAgIC8vIFRoaXMgcHJldmVudHMgc3RyaW5ncyBsaWtlIFwiaHR0cDpleGFtcGxlLmNvbVwiIG9yIFwiaHR0cHM6L3BhdGhcIiBmcm9tIGJlaW5nIHNpbGVudGx5IGFjY2VwdGVkXHJcbiAgICAgICAgICAgIGlmICghZGVmLm5vcm1hbGl6ZSAmJiBkZWYucHJvdG9jb2w/LnNvdXJjZSA9PT0gcmVnZXhlcy5odHRwUHJvdG9jb2wuc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIS9eaHR0cHM/OlxcL1xcLy9pLnRlc3QodHJpbW1lZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IFwidXJsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGU6IFwiSW52YWxpZCBVUkwgZm9ybWF0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHRyaW1tZWQpO1xyXG4gICAgICAgICAgICBpZiAoZGVmLmhvc3RuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBkZWYuaG9zdG5hbWUubGFzdEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgIGlmICghZGVmLmhvc3RuYW1lLnRlc3QodXJsLmhvc3RuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDogXCJ1cmxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm90ZTogXCJJbnZhbGlkIGhvc3RuYW1lXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm46IGRlZi5ob3N0bmFtZS5zb3VyY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGVmLnByb3RvY29sKSB7XHJcbiAgICAgICAgICAgICAgICBkZWYucHJvdG9jb2wubGFzdEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgIGlmICghZGVmLnByb3RvY29sLnRlc3QodXJsLnByb3RvY29sLmVuZHNXaXRoKFwiOlwiKSA/IHVybC5wcm90b2NvbC5zbGljZSgwLCAtMSkgOiB1cmwucHJvdG9jb2wpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBcInVybFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlOiBcIkludmFsaWQgcHJvdG9jb2xcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0dGVybjogZGVmLnByb3RvY29sLnNvdXJjZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFNldCB0aGUgb3V0cHV0IHZhbHVlIGJhc2VkIG9uIG5vcm1hbGl6ZSBmbGFnXHJcbiAgICAgICAgICAgIGlmIChkZWYubm9ybWFsaXplKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBVc2Ugbm9ybWFsaXplZCBVUkxcclxuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSB1cmwuaHJlZjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFByZXNlcnZlIHRoZSBvcmlnaW5hbCBpbnB1dCAodHJpbW1lZClcclxuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSB0cmltbWVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2ggKF8pIHtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXHJcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IFwidXJsXCIsXHJcbiAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kRW1vamkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEVtb2ppXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuZW1vamkoKSk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kTmFub0lEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2ROYW5vSURcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5uYW5vaWQpO1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgQ1VJRCB2MSBpcyBkZXByZWNhdGVkIGJ5IGl0cyBhdXRob3JzIGR1ZSB0byBpbmZvcm1hdGlvbiBsZWFrYWdlXHJcbiAqICh0aW1lc3RhbXBzIGVtYmVkZGVkIGluIHRoZSBpZCkuIFVzZSB7QGxpbmsgJFpvZENVSUQyfSBpbnN0ZWFkLlxyXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BhcmFsbGVsZHJpdmUvY3VpZC5cclxuICovXHJcbmV4cG9ydCBjb25zdCAkWm9kQ1VJRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ1VJRFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmN1aWQpO1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENVSUQyID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDVUlEMlwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmN1aWQyKTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RVTElEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RVTElEXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMudWxpZCk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kWElEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RYSURcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy54aWQpO1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZEtTVUlEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RLU1VJRFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmtzdWlkKTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RJU09EYXRlVGltZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kSVNPRGF0ZVRpbWVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5kYXRldGltZShkZWYpKTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RJU09EYXRlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RJU09EYXRlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuZGF0ZSk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kSVNPVGltZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kSVNPVGltZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLnRpbWUoZGVmKSk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kSVNPRHVyYXRpb24gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZElTT0R1cmF0aW9uXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuZHVyYXRpb24pO1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZElQdjQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZElQdjRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5pcHY0KTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLmJhZy5mb3JtYXQgPSBgaXB2NGA7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZElQdjYgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZElQdjZcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5pcHY2KTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLmJhZy5mb3JtYXQgPSBgaXB2NmA7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgbmV3IFVSTChgaHR0cDovL1ske3BheWxvYWQudmFsdWV9XWApO1xyXG4gICAgICAgICAgICAvLyByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIHtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXHJcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IFwiaXB2NlwiLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZE1BQyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTUFDXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMubWFjKGRlZi5kZWxpbWl0ZXIpKTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLmJhZy5mb3JtYXQgPSBgbWFjYDtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ0lEUnY0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDSURSdjRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5jaWRydjQpO1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENJRFJ2NiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ0lEUnY2XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuY2lkcnY2KTsgLy8gbm90IHVzZWQgZm9yIHZhbGlkYXRpb25cclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjb25zdCBwYXJ0cyA9IHBheWxvYWQudmFsdWUuc3BsaXQoXCIvXCIpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IDIpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcclxuICAgICAgICAgICAgY29uc3QgW2FkZHJlc3MsIHByZWZpeF0gPSBwYXJ0cztcclxuICAgICAgICAgICAgaWYgKCFwcmVmaXgpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcclxuICAgICAgICAgICAgY29uc3QgcHJlZml4TnVtID0gTnVtYmVyKHByZWZpeCk7XHJcbiAgICAgICAgICAgIGlmIChgJHtwcmVmaXhOdW19YCAhPT0gcHJlZml4KVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICAgICAgICAgIGlmIChwcmVmaXhOdW0gPCAwIHx8IHByZWZpeE51bSA+IDEyOClcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIG5ldyBVUkwoYGh0dHA6Ly9bJHthZGRyZXNzfV1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2F0Y2gge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcclxuICAgICAgICAgICAgICAgIGZvcm1hdDogXCJjaWRydjZcIixcclxuICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTtcclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vICAgWm9kQmFzZTY0ICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkQmFzZTY0KGRhdGEpIHtcclxuICAgIGlmIChkYXRhID09PSBcIlwiKVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgLy8gYXRvYiBpZ25vcmVzIHdoaXRlc3BhY2UsIHNvIHJlamVjdCBpdCB1cCBmcm9udC5cclxuICAgIGlmICgvXFxzLy50ZXN0KGRhdGEpKVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIGlmIChkYXRhLmxlbmd0aCAlIDQgIT09IDApXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgYXRvYihkYXRhKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0ICRab2RCYXNlNjQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEJhc2U2NFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmJhc2U2NCk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5iYWcuY29udGVudEVuY29kaW5nID0gXCJiYXNlNjRcIjtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgaWYgKGlzVmFsaWRCYXNlNjQocGF5bG9hZC52YWx1ZSkpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxyXG4gICAgICAgICAgICBmb3JtYXQ6IFwiYmFzZTY0XCIsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gICBab2RCYXNlNjQgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRCYXNlNjRVUkwoZGF0YSkge1xyXG4gICAgaWYgKCFyZWdleGVzLmJhc2U2NHVybC50ZXN0KGRhdGEpKVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIGNvbnN0IGJhc2U2NCA9IGRhdGEucmVwbGFjZSgvWy1fXS9nLCAoYykgPT4gKGMgPT09IFwiLVwiID8gXCIrXCIgOiBcIi9cIikpO1xyXG4gICAgY29uc3QgcGFkZGVkID0gYmFzZTY0LnBhZEVuZChNYXRoLmNlaWwoYmFzZTY0Lmxlbmd0aCAvIDQpICogNCwgXCI9XCIpO1xyXG4gICAgcmV0dXJuIGlzVmFsaWRCYXNlNjQocGFkZGVkKTtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZEJhc2U2NFVSTCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQmFzZTY0VVJMXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuYmFzZTY0dXJsKTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLmJhZy5jb250ZW50RW5jb2RpbmcgPSBcImJhc2U2NHVybFwiO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBpZiAoaXNWYWxpZEJhc2U2NFVSTChwYXlsb2FkLnZhbHVlKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXHJcbiAgICAgICAgICAgIGZvcm1hdDogXCJiYXNlNjR1cmxcIixcclxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kRTE2NCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kRTE2NFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmUxNjQpO1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gICBab2RKV1QgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRKV1QodG9rZW4sIGFsZ29yaXRobSA9IG51bGwpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdG9rZW5zUGFydHMgPSB0b2tlbi5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgaWYgKHRva2Vuc1BhcnRzLmxlbmd0aCAhPT0gMylcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IFtoZWFkZXJdID0gdG9rZW5zUGFydHM7XHJcbiAgICAgICAgaWYgKCFoZWFkZXIpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgY29uc3QgcGFyc2VkSGVhZGVyID0gSlNPTi5wYXJzZShhdG9iKGhlYWRlcikpO1xyXG4gICAgICAgIGlmIChcInR5cFwiIGluIHBhcnNlZEhlYWRlciAmJiBwYXJzZWRIZWFkZXI/LnR5cCAhPT0gXCJKV1RcIilcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGlmICghcGFyc2VkSGVhZGVyLmFsZylcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGlmIChhbGdvcml0aG0gJiYgKCEoXCJhbGdcIiBpbiBwYXJzZWRIZWFkZXIpIHx8IHBhcnNlZEhlYWRlci5hbGcgIT09IGFsZ29yaXRobSkpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0ICRab2RKV1QgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEpXVFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgaWYgKGlzVmFsaWRKV1QocGF5bG9hZC52YWx1ZSwgZGVmLmFsZykpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxyXG4gICAgICAgICAgICBmb3JtYXQ6IFwiand0XCIsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZEN1c3RvbVN0cmluZ0Zvcm1hdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ3VzdG9tU3RyaW5nRm9ybWF0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBpZiAoZGVmLmZuKHBheWxvYWQudmFsdWUpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcclxuICAgICAgICAgICAgZm9ybWF0OiBkZWYuZm9ybWF0LFxyXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2ROdW1iZXIgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE51bWJlclwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGF0dGVybiA9IGluc3QuX3pvZC5iYWcucGF0dGVybiA/PyByZWdleGVzLm51bWJlcjtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgaWYgKGRlZi5jb2VyY2UpXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gTnVtYmVyKHBheWxvYWQudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChfKSB7IH1cclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gXCJudW1iZXJcIiAmJiAhTnVtYmVyLmlzTmFOKGlucHV0KSAmJiBOdW1iZXIuaXNGaW5pdGUoaW5wdXQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByZWNlaXZlZCA9IHR5cGVvZiBpbnB1dCA9PT0gXCJudW1iZXJcIlxyXG4gICAgICAgICAgICA/IE51bWJlci5pc05hTihpbnB1dClcclxuICAgICAgICAgICAgICAgID8gXCJOYU5cIlxyXG4gICAgICAgICAgICAgICAgOiAhTnVtYmVyLmlzRmluaXRlKGlucHV0KVxyXG4gICAgICAgICAgICAgICAgICAgID8gXCJJbmZpbml0eVwiXHJcbiAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWRcclxuICAgICAgICAgICAgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGV4cGVjdGVkOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgLi4uKHJlY2VpdmVkID8geyByZWNlaXZlZCB9IDoge30pLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kTnVtYmVyRm9ybWF0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2ROdW1iZXJGb3JtYXRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY2hlY2tzLiRab2RDaGVja051bWJlckZvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICAkWm9kTnVtYmVyLmluaXQoaW5zdCwgZGVmKTsgLy8gbm8gZm9ybWF0IGNoZWNrc1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RCb29sZWFuID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RCb29sZWFuXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXR0ZXJuID0gcmVnZXhlcy5ib29sZWFuO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcclxuICAgICAgICBpZiAoZGVmLmNvZXJjZSlcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBCb29sZWFuKHBheWxvYWQudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChfKSB7IH1cclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gXCJib29sZWFuXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBleHBlY3RlZDogXCJib29sZWFuXCIsXHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQmlnSW50ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RCaWdJbnRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnBhdHRlcm4gPSByZWdleGVzLmJpZ2ludDtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgaWYgKGRlZi5jb2VyY2UpXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gQmlnSW50KHBheWxvYWQudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChfKSB7IH1cclxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQudmFsdWUgPT09IFwiYmlnaW50XCIpXHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBleHBlY3RlZDogXCJiaWdpbnRcIixcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RCaWdJbnRGb3JtYXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEJpZ0ludEZvcm1hdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjaGVja3MuJFpvZENoZWNrQmlnSW50Rm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgICRab2RCaWdJbnQuaW5pdChpbnN0LCBkZWYpOyAvLyBubyBmb3JtYXQgY2hlY2tzXHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZFN5bWJvbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kU3ltYm9sXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09IFwic3ltYm9sXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBleHBlY3RlZDogXCJzeW1ib2xcIixcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RVbmRlZmluZWQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFVuZGVmaW5lZFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGF0dGVybiA9IHJlZ2V4ZXMudW5kZWZpbmVkO1xyXG4gICAgaW5zdC5fem9kLnZhbHVlcyA9IG5ldyBTZXQoW3VuZGVmaW5lZF0pO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gXCJ1bmRlZmluZWRcIilcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGV4cGVjdGVkOiBcInVuZGVmaW5lZFwiLFxyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZE51bGwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE51bGxcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnBhdHRlcm4gPSByZWdleGVzLm51bGw7XHJcbiAgICBpbnN0Ll96b2QudmFsdWVzID0gbmV3IFNldChbbnVsbF0pO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKGlucHV0ID09PSBudWxsKVxyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwibnVsbFwiLFxyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZEFueSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQW55XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkKSA9PiBwYXlsb2FkO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RVbmtub3duID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RVbmtub3duXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkKSA9PiBwYXlsb2FkO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2ROZXZlciA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTmV2ZXJcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwibmV2ZXJcIixcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RWb2lkID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RWb2lkXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09IFwidW5kZWZpbmVkXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBleHBlY3RlZDogXCJ2b2lkXCIsXHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kRGF0ZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kRGF0ZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgX2N0eCkgPT4ge1xyXG4gICAgICAgIGlmIChkZWYuY29lcmNlKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gbmV3IERhdGUocGF5bG9hZC52YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKF9lcnIpIHsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgY29uc3QgaXNEYXRlID0gaW5wdXQgaW5zdGFuY2VvZiBEYXRlO1xyXG4gICAgICAgIGNvbnN0IGlzVmFsaWREYXRlID0gaXNEYXRlICYmICFOdW1iZXIuaXNOYU4oaW5wdXQuZ2V0VGltZSgpKTtcclxuICAgICAgICBpZiAoaXNWYWxpZERhdGUpXHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBleHBlY3RlZDogXCJkYXRlXCIsXHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAuLi4oaXNEYXRlID8geyByZWNlaXZlZDogXCJJbnZhbGlkIERhdGVcIiB9IDoge30pLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmZ1bmN0aW9uIGhhbmRsZUFycmF5UmVzdWx0KHJlc3VsdCwgZmluYWwsIGluZGV4KSB7XHJcbiAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCguLi51dGlsLnByZWZpeElzc3VlcyhpbmRleCwgcmVzdWx0Lmlzc3VlcykpO1xyXG4gICAgfVxyXG4gICAgZmluYWwudmFsdWVbaW5kZXhdID0gcmVzdWx0LnZhbHVlO1xyXG59XHJcbmV4cG9ydCBjb25zdCAkWm9kQXJyYXkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEFycmF5XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0KSkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcImFycmF5XCIsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBheWxvYWQudmFsdWUgPSBBcnJheShpbnB1dC5sZW5ndGgpO1xyXG4gICAgICAgIGNvbnN0IHByb21zID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gaW5wdXRbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGRlZi5lbGVtZW50Ll96b2QucnVuKHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBpdGVtLFxyXG4gICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcclxuICAgICAgICAgICAgfSwgY3R4KTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHByb21zLnB1c2gocmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4gaGFuZGxlQXJyYXlSZXN1bHQocmVzdWx0LCBwYXlsb2FkLCBpKSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlQXJyYXlSZXN1bHQocmVzdWx0LCBwYXlsb2FkLCBpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocHJvbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9tcykudGhlbigoKSA9PiBwYXlsb2FkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7IC8vaGFuZGxlQXJyYXlSZXN1bHRzQXN5bmMocGFyc2VSZXN1bHRzLCBmaW5hbCk7XHJcbiAgICB9O1xyXG59KTtcclxuZnVuY3Rpb24gaGFuZGxlUHJvcGVydHlSZXN1bHQocmVzdWx0LCBmaW5hbCwga2V5LCBpbnB1dCwgaXNPcHRpb25hbEluLCBpc09wdGlvbmFsT3V0KSB7XHJcbiAgICBjb25zdCBpc1ByZXNlbnQgPSBrZXkgaW4gaW5wdXQ7XHJcbiAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICAvLyBGb3Igb3B0aW9uYWwtaW4vb3V0IHNjaGVtYXMsIGlnbm9yZSBlcnJvcnMgb24gYWJzZW50IGtleXMuXHJcbiAgICAgICAgaWYgKGlzT3B0aW9uYWxJbiAmJiBpc09wdGlvbmFsT3V0ICYmICFpc1ByZXNlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCguLi51dGlsLnByZWZpeElzc3VlcyhrZXksIHJlc3VsdC5pc3N1ZXMpKTtcclxuICAgIH1cclxuICAgIGlmICghaXNQcmVzZW50ICYmICFpc09wdGlvbmFsSW4pIHtcclxuICAgICAgICBpZiAoIXJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGZpbmFsLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogXCJub25vcHRpb25hbFwiLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQ6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIHBhdGg6IFtrZXldLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKHJlc3VsdC52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgaWYgKGlzUHJlc2VudCkge1xyXG4gICAgICAgICAgICBmaW5hbC52YWx1ZVtrZXldID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGZpbmFsLnZhbHVlW2tleV0gPSByZXN1bHQudmFsdWU7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gbm9ybWFsaXplRGVmKGRlZikge1xyXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGRlZi5zaGFwZSk7XHJcbiAgICBmb3IgKGNvbnN0IGsgb2Yga2V5cykge1xyXG4gICAgICAgIGlmICghZGVmLnNoYXBlPy5ba10/Ll96b2Q/LnRyYWl0cz8uaGFzKFwiJFpvZFR5cGVcIikpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGVsZW1lbnQgYXQga2V5IFwiJHtrfVwiOiBleHBlY3RlZCBhIFpvZCBzY2hlbWFgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBva2V5cyA9IHV0aWwub3B0aW9uYWxLZXlzKGRlZi5zaGFwZSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIC4uLmRlZixcclxuICAgICAgICBrZXlzLFxyXG4gICAgICAgIGtleVNldDogbmV3IFNldChrZXlzKSxcclxuICAgICAgICBudW1LZXlzOiBrZXlzLmxlbmd0aCxcclxuICAgICAgICBvcHRpb25hbEtleXM6IG5ldyBTZXQob2tleXMpLFxyXG4gICAgfTtcclxufVxyXG5mdW5jdGlvbiBoYW5kbGVDYXRjaGFsbChwcm9tcywgaW5wdXQsIHBheWxvYWQsIGN0eCwgZGVmLCBpbnN0KSB7XHJcbiAgICBjb25zdCB1bnJlY29nbml6ZWQgPSBbXTtcclxuICAgIGNvbnN0IGtleVNldCA9IGRlZi5rZXlTZXQ7XHJcbiAgICBjb25zdCBfY2F0Y2hhbGwgPSBkZWYuY2F0Y2hhbGwuX3pvZDtcclxuICAgIGNvbnN0IHQgPSBfY2F0Y2hhbGwuZGVmLnR5cGU7XHJcbiAgICBjb25zdCBpc09wdGlvbmFsSW4gPSBfY2F0Y2hhbGwub3B0aW4gPT09IFwib3B0aW9uYWxcIjtcclxuICAgIGNvbnN0IGlzT3B0aW9uYWxPdXQgPSBfY2F0Y2hhbGwub3B0b3V0ID09PSBcIm9wdGlvbmFsXCI7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBpbnB1dCkge1xyXG4gICAgICAgIC8vIHNraXAgX19wcm90b19fIHNvIGl0IGNhbid0IHJlcGxhY2UgdGhlIHJlc3VsdCBwcm90b3R5cGUgdmlhIHRoZVxyXG4gICAgICAgIC8vIGFzc2lnbm1lbnQgc2V0dGVyIG9uIHRoZSBwbGFpbiB7fSB3ZSBidWlsZCBpbnRvXHJcbiAgICAgICAgaWYgKGtleSA9PT0gXCJfX3Byb3RvX19cIilcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgaWYgKGtleVNldC5oYXMoa2V5KSlcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgaWYgKHQgPT09IFwibmV2ZXJcIikge1xyXG4gICAgICAgICAgICB1bnJlY29nbml6ZWQucHVzaChrZXkpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgciA9IF9jYXRjaGFsbC5ydW4oeyB2YWx1ZTogaW5wdXRba2V5XSwgaXNzdWVzOiBbXSB9LCBjdHgpO1xyXG4gICAgICAgIGlmIChyIGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICBwcm9tcy5wdXNoKHIudGhlbigocikgPT4gaGFuZGxlUHJvcGVydHlSZXN1bHQociwgcGF5bG9hZCwga2V5LCBpbnB1dCwgaXNPcHRpb25hbEluLCBpc09wdGlvbmFsT3V0KSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlUHJvcGVydHlSZXN1bHQociwgcGF5bG9hZCwga2V5LCBpbnB1dCwgaXNPcHRpb25hbEluLCBpc09wdGlvbmFsT3V0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodW5yZWNvZ25pemVkLmxlbmd0aCkge1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBjb2RlOiBcInVucmVjb2duaXplZF9rZXlzXCIsXHJcbiAgICAgICAgICAgIGtleXM6IHVucmVjb2duaXplZCxcclxuICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAoIXByb21zLmxlbmd0aClcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9tcykudGhlbigoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZE9iamVjdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kT2JqZWN0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIHJlcXVpcmVzIGNhc3QgYmVjYXVzZSB0ZWNobmljYWxseSAkWm9kT2JqZWN0IGRvZXNuJ3QgZXh0ZW5kXHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICAvLyBjb25zdCBzaCA9IGRlZi5zaGFwZTtcclxuICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGRlZiwgXCJzaGFwZVwiKTtcclxuICAgIGlmICghZGVzYz8uZ2V0KSB7XHJcbiAgICAgICAgY29uc3Qgc2ggPSBkZWYuc2hhcGU7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRlZiwgXCJzaGFwZVwiLCB7XHJcbiAgICAgICAgICAgIGdldDogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3U2ggPSB7IC4uLnNoIH07XHJcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGVmLCBcInNoYXBlXCIsIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbmV3U2gsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXdTaDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGNvbnN0IF9ub3JtYWxpemVkID0gdXRpbC5jYWNoZWQoKCkgPT4gbm9ybWFsaXplRGVmKGRlZikpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJwcm9wVmFsdWVzXCIsICgpID0+IHtcclxuICAgICAgICBjb25zdCBzaGFwZSA9IGRlZi5zaGFwZTtcclxuICAgICAgICBjb25zdCBwcm9wVmFsdWVzID0ge307XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc2hhcGUpIHtcclxuICAgICAgICAgICAgY29uc3QgZmllbGQgPSBzaGFwZVtrZXldLl96b2Q7XHJcbiAgICAgICAgICAgIGlmIChmaWVsZC52YWx1ZXMpIHtcclxuICAgICAgICAgICAgICAgIHByb3BWYWx1ZXNba2V5XSA/PyAocHJvcFZhbHVlc1trZXldID0gbmV3IFNldCgpKTtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdiBvZiBmaWVsZC52YWx1ZXMpXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcFZhbHVlc1trZXldLmFkZCh2KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcHJvcFZhbHVlcztcclxuICAgIH0pO1xyXG4gICAgY29uc3QgaXNPYmplY3QgPSB1dGlsLmlzT2JqZWN0O1xyXG4gICAgY29uc3QgY2F0Y2hhbGwgPSBkZWYuY2F0Y2hhbGw7XHJcbiAgICBsZXQgdmFsdWU7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgdmFsdWUgPz8gKHZhbHVlID0gX25vcm1hbGl6ZWQudmFsdWUpO1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBpZiAoIWlzT2JqZWN0KGlucHV0KSkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXlsb2FkLnZhbHVlID0ge307XHJcbiAgICAgICAgY29uc3QgcHJvbXMgPSBbXTtcclxuICAgICAgICBjb25zdCBzaGFwZSA9IHZhbHVlLnNoYXBlO1xyXG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHZhbHVlLmtleXMpIHtcclxuICAgICAgICAgICAgY29uc3QgZWwgPSBzaGFwZVtrZXldO1xyXG4gICAgICAgICAgICBjb25zdCBpc09wdGlvbmFsSW4gPSBlbC5fem9kLm9wdGluID09PSBcIm9wdGlvbmFsXCI7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzT3B0aW9uYWxPdXQgPSBlbC5fem9kLm9wdG91dCA9PT0gXCJvcHRpb25hbFwiO1xyXG4gICAgICAgICAgICBjb25zdCByID0gZWwuX3pvZC5ydW4oeyB2YWx1ZTogaW5wdXRba2V5XSwgaXNzdWVzOiBbXSB9LCBjdHgpO1xyXG4gICAgICAgICAgICBpZiAociBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHByb21zLnB1c2goci50aGVuKChyKSA9PiBoYW5kbGVQcm9wZXJ0eVJlc3VsdChyLCBwYXlsb2FkLCBrZXksIGlucHV0LCBpc09wdGlvbmFsSW4sIGlzT3B0aW9uYWxPdXQpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVQcm9wZXJ0eVJlc3VsdChyLCBwYXlsb2FkLCBrZXksIGlucHV0LCBpc09wdGlvbmFsSW4sIGlzT3B0aW9uYWxPdXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghY2F0Y2hhbGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByb21zLmxlbmd0aCA/IFByb21pc2UuYWxsKHByb21zKS50aGVuKCgpID0+IHBheWxvYWQpIDogcGF5bG9hZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZUNhdGNoYWxsKHByb21zLCBpbnB1dCwgcGF5bG9hZCwgY3R4LCBfbm9ybWFsaXplZC52YWx1ZSwgaW5zdCk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RPYmplY3RKSVQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE9iamVjdEpJVFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyByZXF1aXJlcyBjYXN0IGJlY2F1c2UgdGVjaG5pY2FsbHkgJFpvZE9iamVjdCBkb2Vzbid0IGV4dGVuZFxyXG4gICAgJFpvZE9iamVjdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb25zdCBzdXBlclBhcnNlID0gaW5zdC5fem9kLnBhcnNlO1xyXG4gICAgY29uc3QgX25vcm1hbGl6ZWQgPSB1dGlsLmNhY2hlZCgoKSA9PiBub3JtYWxpemVEZWYoZGVmKSk7XHJcbiAgICBjb25zdCBnZW5lcmF0ZUZhc3RwYXNzID0gKHNoYXBlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZG9jID0gbmV3IERvYyhbXCJzaGFwZVwiLCBcInBheWxvYWRcIiwgXCJjdHhcIl0pO1xyXG4gICAgICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBfbm9ybWFsaXplZC52YWx1ZTtcclxuICAgICAgICBjb25zdCBwYXJzZVN0ciA9IChrZXkpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgayA9IHV0aWwuZXNjKGtleSk7XHJcbiAgICAgICAgICAgIHJldHVybiBgc2hhcGVbJHtrfV0uX3pvZC5ydW4oeyB2YWx1ZTogaW5wdXRbJHtrfV0sIGlzc3VlczogW10gfSwgY3R4KWA7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBkb2Mud3JpdGUoYGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtgKTtcclxuICAgICAgICBjb25zdCBpZHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gICAgICAgIGxldCBjb3VudGVyID0gMDtcclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBub3JtYWxpemVkLmtleXMpIHtcclxuICAgICAgICAgICAgaWRzW2tleV0gPSBga2V5XyR7Y291bnRlcisrfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEE6IHByZXNlcnZlIGtleSBvcmRlciB7XHJcbiAgICAgICAgZG9jLndyaXRlKGBjb25zdCBuZXdSZXN1bHQgPSB7fTtgKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBub3JtYWxpemVkLmtleXMpIHtcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBpZHNba2V5XTtcclxuICAgICAgICAgICAgY29uc3QgayA9IHV0aWwuZXNjKGtleSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHNjaGVtYSA9IHNoYXBlW2tleV07XHJcbiAgICAgICAgICAgIGNvbnN0IGlzT3B0aW9uYWxJbiA9IHNjaGVtYT8uX3pvZD8ub3B0aW4gPT09IFwib3B0aW9uYWxcIjtcclxuICAgICAgICAgICAgY29uc3QgaXNPcHRpb25hbE91dCA9IHNjaGVtYT8uX3pvZD8ub3B0b3V0ID09PSBcIm9wdGlvbmFsXCI7XHJcbiAgICAgICAgICAgIGRvYy53cml0ZShgY29uc3QgJHtpZH0gPSAke3BhcnNlU3RyKGtleSl9O2ApO1xyXG4gICAgICAgICAgICBpZiAoaXNPcHRpb25hbEluICYmIGlzT3B0aW9uYWxPdXQpIHtcclxuICAgICAgICAgICAgICAgIC8vIEZvciBvcHRpb25hbC1pbi9vdXQgc2NoZW1hcywgaWdub3JlIGVycm9ycyBvbiBhYnNlbnQga2V5c1xyXG4gICAgICAgICAgICAgICAgZG9jLndyaXRlKGBcclxuICAgICAgICBpZiAoJHtpZH0uaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgaWYgKCR7a30gaW4gaW5wdXQpIHtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMgPSBwYXlsb2FkLmlzc3Vlcy5jb25jYXQoJHtpZH0uaXNzdWVzLm1hcChpc3MgPT4gKHtcclxuICAgICAgICAgICAgICAuLi5pc3MsXHJcbiAgICAgICAgICAgICAgcGF0aDogaXNzLnBhdGggPyBbJHtrfSwgLi4uaXNzLnBhdGhdIDogWyR7a31dXHJcbiAgICAgICAgICAgIH0pKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICgke2lkfS52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICBpZiAoJHtrfSBpbiBpbnB1dCkge1xyXG4gICAgICAgICAgICBuZXdSZXN1bHRbJHtrfV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5ld1Jlc3VsdFske2t9XSA9ICR7aWR9LnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIWlzT3B0aW9uYWxJbikge1xyXG4gICAgICAgICAgICAgICAgZG9jLndyaXRlKGBcclxuICAgICAgICBjb25zdCAke2lkfV9wcmVzZW50ID0gJHtrfSBpbiBpbnB1dDtcclxuICAgICAgICBpZiAoJHtpZH0uaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgcGF5bG9hZC5pc3N1ZXMgPSBwYXlsb2FkLmlzc3Vlcy5jb25jYXQoJHtpZH0uaXNzdWVzLm1hcChpc3MgPT4gKHtcclxuICAgICAgICAgICAgLi4uaXNzLFxyXG4gICAgICAgICAgICBwYXRoOiBpc3MucGF0aCA/IFske2t9LCAuLi5pc3MucGF0aF0gOiBbJHtrfV1cclxuICAgICAgICAgIH0pKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghJHtpZH1fcHJlc2VudCAmJiAhJHtpZH0uaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIGV4cGVjdGVkOiBcIm5vbm9wdGlvbmFsXCIsXHJcbiAgICAgICAgICAgIGlucHV0OiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIHBhdGg6IFske2t9XVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoJHtpZH1fcHJlc2VudCkge1xyXG4gICAgICAgICAgaWYgKCR7aWR9LnZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgbmV3UmVzdWx0WyR7a31dID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbmV3UmVzdWx0WyR7a31dID0gJHtpZH0udmFsdWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkb2Mud3JpdGUoYFxyXG4gICAgICAgIGlmICgke2lkfS5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBwYXlsb2FkLmlzc3VlcyA9IHBheWxvYWQuaXNzdWVzLmNvbmNhdCgke2lkfS5pc3N1ZXMubWFwKGlzcyA9PiAoe1xyXG4gICAgICAgICAgICAuLi5pc3MsXHJcbiAgICAgICAgICAgIHBhdGg6IGlzcy5wYXRoID8gWyR7a30sIC4uLmlzcy5wYXRoXSA6IFske2t9XVxyXG4gICAgICAgICAgfSkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCR7aWR9LnZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIGlmICgke2t9IGluIGlucHV0KSB7XHJcbiAgICAgICAgICAgIG5ld1Jlc3VsdFske2t9XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmV3UmVzdWx0WyR7a31dID0gJHtpZH0udmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICBgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBkb2Mud3JpdGUoYHBheWxvYWQudmFsdWUgPSBuZXdSZXN1bHQ7YCk7XHJcbiAgICAgICAgZG9jLndyaXRlKGByZXR1cm4gcGF5bG9hZDtgKTtcclxuICAgICAgICBjb25zdCBmbiA9IGRvYy5jb21waWxlKCk7XHJcbiAgICAgICAgcmV0dXJuIChwYXlsb2FkLCBjdHgpID0+IGZuKHNoYXBlLCBwYXlsb2FkLCBjdHgpO1xyXG4gICAgfTtcclxuICAgIGxldCBmYXN0cGFzcztcclxuICAgIGNvbnN0IGlzT2JqZWN0ID0gdXRpbC5pc09iamVjdDtcclxuICAgIGNvbnN0IGppdCA9ICFjb3JlLmdsb2JhbENvbmZpZy5qaXRsZXNzO1xyXG4gICAgY29uc3QgYWxsb3dzRXZhbCA9IHV0aWwuYWxsb3dzRXZhbDtcclxuICAgIGNvbnN0IGZhc3RFbmFibGVkID0gaml0ICYmIGFsbG93c0V2YWwudmFsdWU7IC8vICYmICFkZWYuY2F0Y2hhbGw7XHJcbiAgICBjb25zdCBjYXRjaGFsbCA9IGRlZi5jYXRjaGFsbDtcclxuICAgIGxldCB2YWx1ZTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICB2YWx1ZSA/PyAodmFsdWUgPSBfbm9ybWFsaXplZC52YWx1ZSk7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmICghaXNPYmplY3QoaW5wdXQpKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChqaXQgJiYgZmFzdEVuYWJsZWQgJiYgY3R4Py5hc3luYyA9PT0gZmFsc2UgJiYgY3R4LmppdGxlc3MgIT09IHRydWUpIHtcclxuICAgICAgICAgICAgLy8gYWx3YXlzIHN5bmNocm9ub3VzXHJcbiAgICAgICAgICAgIGlmICghZmFzdHBhc3MpXHJcbiAgICAgICAgICAgICAgICBmYXN0cGFzcyA9IGdlbmVyYXRlRmFzdHBhc3MoZGVmLnNoYXBlKTtcclxuICAgICAgICAgICAgcGF5bG9hZCA9IGZhc3RwYXNzKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgICAgIGlmICghY2F0Y2hhbGwpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUNhdGNoYWxsKFtdLCBpbnB1dCwgcGF5bG9hZCwgY3R4LCB2YWx1ZSwgaW5zdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdXBlclBhcnNlKHBheWxvYWQsIGN0eCk7XHJcbiAgICB9O1xyXG59KTtcclxuZnVuY3Rpb24gaGFuZGxlVW5pb25SZXN1bHRzKHJlc3VsdHMsIGZpbmFsLCBpbnN0LCBjdHgpIHtcclxuICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIHJlc3VsdHMpIHtcclxuICAgICAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgZmluYWwudmFsdWUgPSByZXN1bHQudmFsdWU7XHJcbiAgICAgICAgICAgIHJldHVybiBmaW5hbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBub25hYm9ydGVkID0gcmVzdWx0cy5maWx0ZXIoKHIpID0+ICF1dGlsLmFib3J0ZWQocikpO1xyXG4gICAgaWYgKG5vbmFib3J0ZWQubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgZmluYWwudmFsdWUgPSBub25hYm9ydGVkWzBdLnZhbHVlO1xyXG4gICAgICAgIHJldHVybiBub25hYm9ydGVkWzBdO1xyXG4gICAgfVxyXG4gICAgZmluYWwuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgIGNvZGU6IFwiaW52YWxpZF91bmlvblwiLFxyXG4gICAgICAgIGlucHV0OiBmaW5hbC52YWx1ZSxcclxuICAgICAgICBpbnN0LFxyXG4gICAgICAgIGVycm9yczogcmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4gcmVzdWx0Lmlzc3Vlcy5tYXAoKGlzcykgPT4gdXRpbC5maW5hbGl6ZUlzc3VlKGlzcywgY3R4LCBjb3JlLmNvbmZpZygpKSkpLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gZmluYWw7XHJcbn1cclxuZXhwb3J0IGNvbnN0ICRab2RVbmlvbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kVW5pb25cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRpblwiLCAoKSA9PiBkZWYub3B0aW9ucy5zb21lKChvKSA9PiBvLl96b2Qub3B0aW4gPT09IFwib3B0aW9uYWxcIikgPyBcIm9wdGlvbmFsXCIgOiB1bmRlZmluZWQpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRvdXRcIiwgKCkgPT4gZGVmLm9wdGlvbnMuc29tZSgobykgPT4gby5fem9kLm9wdG91dCA9PT0gXCJvcHRpb25hbFwiKSA/IFwib3B0aW9uYWxcIiA6IHVuZGVmaW5lZCk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInZhbHVlc1wiLCAoKSA9PiB7XHJcbiAgICAgICAgaWYgKGRlZi5vcHRpb25zLmV2ZXJ5KChvKSA9PiBvLl96b2QudmFsdWVzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNldChkZWYub3B0aW9ucy5mbGF0TWFwKChvcHRpb24pID0+IEFycmF5LmZyb20ob3B0aW9uLl96b2QudmFsdWVzKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfSk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInBhdHRlcm5cIiwgKCkgPT4ge1xyXG4gICAgICAgIGlmIChkZWYub3B0aW9ucy5ldmVyeSgobykgPT4gby5fem9kLnBhdHRlcm4pKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhdHRlcm5zID0gZGVmLm9wdGlvbnMubWFwKChvKSA9PiBvLl96b2QucGF0dGVybik7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKGBeKCR7cGF0dGVybnMubWFwKChwKSA9PiB1dGlsLmNsZWFuUmVnZXgocC5zb3VyY2UpKS5qb2luKFwifFwiKX0pJGApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfSk7XHJcbiAgICBjb25zdCBmaXJzdCA9IGRlZi5vcHRpb25zLmxlbmd0aCA9PT0gMSA/IGRlZi5vcHRpb25zWzBdLl96b2QucnVuIDogbnVsbDtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBpZiAoZmlyc3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0KHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBhc3luYyA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcclxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBkZWYub3B0aW9ucykge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBvcHRpb24uX3pvZC5ydW4oe1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxyXG4gICAgICAgICAgICB9LCBjdHgpO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICBhc3luYyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghYXN5bmMpXHJcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVVbmlvblJlc3VsdHMocmVzdWx0cywgcGF5bG9hZCwgaW5zdCwgY3R4KTtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0cykudGhlbigocmVzdWx0cykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlVW5pb25SZXN1bHRzKHJlc3VsdHMsIHBheWxvYWQsIGluc3QsIGN0eCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZnVuY3Rpb24gaGFuZGxlRXhjbHVzaXZlVW5pb25SZXN1bHRzKHJlc3VsdHMsIGZpbmFsLCBpbnN0LCBjdHgpIHtcclxuICAgIGNvbnN0IHN1Y2Nlc3NlcyA9IHJlc3VsdHMuZmlsdGVyKChyKSA9PiByLmlzc3Vlcy5sZW5ndGggPT09IDApO1xyXG4gICAgaWYgKHN1Y2Nlc3Nlcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICBmaW5hbC52YWx1ZSA9IHN1Y2Nlc3Nlc1swXS52YWx1ZTtcclxuICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICB9XHJcbiAgICBpZiAoc3VjY2Vzc2VzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIC8vIE5vIG1hdGNoZXMgLSBzYW1lIGFzIHJlZ3VsYXIgdW5pb25cclxuICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF91bmlvblwiLFxyXG4gICAgICAgICAgICBpbnB1dDogZmluYWwudmFsdWUsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIGVycm9yczogcmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4gcmVzdWx0Lmlzc3Vlcy5tYXAoKGlzcykgPT4gdXRpbC5maW5hbGl6ZUlzc3VlKGlzcywgY3R4LCBjb3JlLmNvbmZpZygpKSkpLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy8gTXVsdGlwbGUgbWF0Y2hlcyAtIGV4Y2x1c2l2ZSB1bmlvbiBmYWlsdXJlXHJcbiAgICAgICAgZmluYWwuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdW5pb25cIixcclxuICAgICAgICAgICAgaW5wdXQ6IGZpbmFsLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBlcnJvcnM6IFtdLFxyXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZpbmFsO1xyXG59XHJcbmV4cG9ydCBjb25zdCAkWm9kWG9yID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RYb3JcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFVuaW9uLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGRlZi5pbmNsdXNpdmUgPSBmYWxzZTtcclxuICAgIGNvbnN0IGZpcnN0ID0gZGVmLm9wdGlvbnMubGVuZ3RoID09PSAxID8gZGVmLm9wdGlvbnNbMF0uX3pvZC5ydW4gOiBudWxsO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIGlmIChmaXJzdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmlyc3QocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGFzeW5jID0gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGRlZi5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG9wdGlvbi5fem9kLnJ1bih7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXHJcbiAgICAgICAgICAgIH0sIGN0eCk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIGFzeW5jID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghYXN5bmMpXHJcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVFeGNsdXNpdmVVbmlvblJlc3VsdHMocmVzdWx0cywgcGF5bG9hZCwgaW5zdCwgY3R4KTtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0cykudGhlbigocmVzdWx0cykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlRXhjbHVzaXZlVW5pb25SZXN1bHRzKHJlc3VsdHMsIHBheWxvYWQsIGluc3QsIGN0eCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2REaXNjcmltaW5hdGVkVW5pb24gPSBcclxuLypAX19QVVJFX18qL1xyXG5jb3JlLiRjb25zdHJ1Y3RvcihcIiRab2REaXNjcmltaW5hdGVkVW5pb25cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLmluY2x1c2l2ZSA9IGZhbHNlO1xyXG4gICAgJFpvZFVuaW9uLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvbnN0IF9zdXBlciA9IGluc3QuX3pvZC5wYXJzZTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwicHJvcFZhbHVlc1wiLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcHJvcFZhbHVlcyA9IHt9O1xyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGRlZi5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHB2ID0gb3B0aW9uLl96b2QucHJvcFZhbHVlcztcclxuICAgICAgICAgICAgaWYgKCFwdiB8fCBPYmplY3Qua2V5cyhwdikubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGRpc2NyaW1pbmF0ZWQgdW5pb24gb3B0aW9uIGF0IGluZGV4IFwiJHtkZWYub3B0aW9ucy5pbmRleE9mKG9wdGlvbil9XCJgKTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMocHYpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXByb3BWYWx1ZXNba10pXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcFZhbHVlc1trXSA9IG5ldyBTZXQoKTtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgdmFsIG9mIHYpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9wVmFsdWVzW2tdLmFkZCh2YWwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwcm9wVmFsdWVzO1xyXG4gICAgfSk7XHJcbiAgICBjb25zdCBkaXNjID0gdXRpbC5jYWNoZWQoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9wdHMgPSBkZWYub3B0aW9ucztcclxuICAgICAgICBjb25zdCBtYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgZm9yIChjb25zdCBvIG9mIG9wdHMpIHtcclxuICAgICAgICAgICAgY29uc3QgdmFsdWVzID0gby5fem9kLnByb3BWYWx1ZXM/LltkZWYuZGlzY3JpbWluYXRvcl07XHJcbiAgICAgICAgICAgIGlmICghdmFsdWVzIHx8IHZhbHVlcy5zaXplID09PSAwKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGRpc2NyaW1pbmF0ZWQgdW5pb24gb3B0aW9uIGF0IGluZGV4IFwiJHtkZWYub3B0aW9ucy5pbmRleE9mKG8pfVwiYCk7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgdiBvZiB2YWx1ZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtYXAuaGFzKHYpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEdXBsaWNhdGUgZGlzY3JpbWluYXRvciB2YWx1ZSBcIiR7U3RyaW5nKHYpfVwiYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtYXAuc2V0KHYsIG8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXA7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKCF1dGlsLmlzT2JqZWN0KGlucHV0KSkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBvcHQgPSBkaXNjLnZhbHVlLmdldChpbnB1dD8uW2RlZi5kaXNjcmltaW5hdG9yXSk7XHJcbiAgICAgICAgaWYgKG9wdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gb3B0Ll96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEZhbGwgYmFjayB0byB1bmlvbiBtYXRjaGluZyB3aGVuIHRoZSBmYXN0IGRpc2NyaW1pbmF0b3IgcGF0aCBmYWlsczpcclxuICAgICAgICAvLyAtIGV4cGxpY2l0bHkgZW5hYmxlZCB2aWEgdW5pb25GYWxsYmFjaywgb3JcclxuICAgICAgICAvLyAtIGR1cmluZyBiYWNrd2FyZCBkaXJlY3Rpb24gKGVuY29kZSksIHNpbmNlIGNvZGVjLWJhc2VkIGRpc2NyaW1pbmF0b3JzXHJcbiAgICAgICAgLy8gICBoYXZlIGRpZmZlcmVudCB2YWx1ZXMgaW4gZm9yd2FyZCB2cyBiYWNrd2FyZCBkaXJlY3Rpb25zXHJcbiAgICAgICAgaWYgKGRlZi51bmlvbkZhbGxiYWNrIHx8IGN0eC5kaXJlY3Rpb24gPT09IFwiYmFja3dhcmRcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gX3N1cGVyKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIG5vIG1hdGNoaW5nIGRpc2NyaW1pbmF0b3JcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3VuaW9uXCIsXHJcbiAgICAgICAgICAgIGVycm9yczogW10sXHJcbiAgICAgICAgICAgIG5vdGU6IFwiTm8gbWF0Y2hpbmcgZGlzY3JpbWluYXRvclwiLFxyXG4gICAgICAgICAgICBkaXNjcmltaW5hdG9yOiBkZWYuZGlzY3JpbWluYXRvcixcclxuICAgICAgICAgICAgb3B0aW9uczogQXJyYXkuZnJvbShkaXNjLnZhbHVlLmtleXMoKSksXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBwYXRoOiBbZGVmLmRpc2NyaW1pbmF0b3JdLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kSW50ZXJzZWN0aW9uID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RJbnRlcnNlY3Rpb25cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBjb25zdCBsZWZ0ID0gZGVmLmxlZnQuX3pvZC5ydW4oeyB2YWx1ZTogaW5wdXQsIGlzc3VlczogW10gfSwgY3R4KTtcclxuICAgICAgICBjb25zdCByaWdodCA9IGRlZi5yaWdodC5fem9kLnJ1bih7IHZhbHVlOiBpbnB1dCwgaXNzdWVzOiBbXSB9LCBjdHgpO1xyXG4gICAgICAgIGNvbnN0IGFzeW5jID0gbGVmdCBpbnN0YW5jZW9mIFByb21pc2UgfHwgcmlnaHQgaW5zdGFuY2VvZiBQcm9taXNlO1xyXG4gICAgICAgIGlmIChhc3luYykge1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW2xlZnQsIHJpZ2h0XSkudGhlbigoW2xlZnQsIHJpZ2h0XSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUludGVyc2VjdGlvblJlc3VsdHMocGF5bG9hZCwgbGVmdCwgcmlnaHQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZUludGVyc2VjdGlvblJlc3VsdHMocGF5bG9hZCwgbGVmdCwgcmlnaHQpO1xyXG4gICAgfTtcclxufSk7XHJcbmZ1bmN0aW9uIG1lcmdlVmFsdWVzKGEsIGIpIHtcclxuICAgIC8vIGNvbnN0IGFUeXBlID0gcGFyc2UudChhKTtcclxuICAgIC8vIGNvbnN0IGJUeXBlID0gcGFyc2UudChiKTtcclxuICAgIGlmIChhID09PSBiKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IGEgfTtcclxuICAgIH1cclxuICAgIGlmIChhIGluc3RhbmNlb2YgRGF0ZSAmJiBiIGluc3RhbmNlb2YgRGF0ZSAmJiArYSA9PT0gK2IpIHtcclxuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogYSB9O1xyXG4gICAgfVxyXG4gICAgaWYgKHV0aWwuaXNQbGFpbk9iamVjdChhKSAmJiB1dGlsLmlzUGxhaW5PYmplY3QoYikpIHtcclxuICAgICAgICBjb25zdCBiS2V5cyA9IE9iamVjdC5rZXlzKGIpO1xyXG4gICAgICAgIGNvbnN0IHNoYXJlZEtleXMgPSBPYmplY3Qua2V5cyhhKS5maWx0ZXIoKGtleSkgPT4gYktleXMuaW5kZXhPZihrZXkpICE9PSAtMSk7XHJcbiAgICAgICAgY29uc3QgbmV3T2JqID0geyAuLi5hLCAuLi5iIH07XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2Ygc2hhcmVkS2V5cykge1xyXG4gICAgICAgICAgICBjb25zdCBzaGFyZWRWYWx1ZSA9IG1lcmdlVmFsdWVzKGFba2V5XSwgYltrZXldKTtcclxuICAgICAgICAgICAgaWYgKCFzaGFyZWRWYWx1ZS52YWxpZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWxpZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VFcnJvclBhdGg6IFtrZXksIC4uLnNoYXJlZFZhbHVlLm1lcmdlRXJyb3JQYXRoXSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV3T2JqW2tleV0gPSBzaGFyZWRWYWx1ZS5kYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZGF0YTogbmV3T2JqIH07XHJcbiAgICB9XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhKSAmJiBBcnJheS5pc0FycmF5KGIpKSB7XHJcbiAgICAgICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIG1lcmdlRXJyb3JQYXRoOiBbXSB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuZXdBcnJheSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgICAgICBjb25zdCBpdGVtQSA9IGFbaW5kZXhdO1xyXG4gICAgICAgICAgICBjb25zdCBpdGVtQiA9IGJbaW5kZXhdO1xyXG4gICAgICAgICAgICBjb25zdCBzaGFyZWRWYWx1ZSA9IG1lcmdlVmFsdWVzKGl0ZW1BLCBpdGVtQik7XHJcbiAgICAgICAgICAgIGlmICghc2hhcmVkVmFsdWUudmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1lcmdlRXJyb3JQYXRoOiBbaW5kZXgsIC4uLnNoYXJlZFZhbHVlLm1lcmdlRXJyb3JQYXRoXSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV3QXJyYXkucHVzaChzaGFyZWRWYWx1ZS5kYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IG5ld0FycmF5IH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIG1lcmdlRXJyb3JQYXRoOiBbXSB9O1xyXG59XHJcbmZ1bmN0aW9uIGhhbmRsZUludGVyc2VjdGlvblJlc3VsdHMocmVzdWx0LCBsZWZ0LCByaWdodCkge1xyXG4gICAgLy8gVHJhY2sgd2hpY2ggc2lkZShzKSByZXBvcnQgZWFjaCBrZXkgYXMgdW5yZWNvZ25pemVkXHJcbiAgICBjb25zdCB1bnJlY0tleXMgPSBuZXcgTWFwKCk7XHJcbiAgICBsZXQgdW5yZWNJc3N1ZTtcclxuICAgIGZvciAoY29uc3QgaXNzIG9mIGxlZnQuaXNzdWVzKSB7XHJcbiAgICAgICAgaWYgKGlzcy5jb2RlID09PSBcInVucmVjb2duaXplZF9rZXlzXCIpIHtcclxuICAgICAgICAgICAgdW5yZWNJc3N1ZSA/PyAodW5yZWNJc3N1ZSA9IGlzcyk7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgayBvZiBpc3Mua2V5cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1bnJlY0tleXMuaGFzKGspKVxyXG4gICAgICAgICAgICAgICAgICAgIHVucmVjS2V5cy5zZXQoaywge30pO1xyXG4gICAgICAgICAgICAgICAgdW5yZWNLZXlzLmdldChrKS5sID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmVzdWx0Lmlzc3Vlcy5wdXNoKGlzcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZm9yIChjb25zdCBpc3Mgb2YgcmlnaHQuaXNzdWVzKSB7XHJcbiAgICAgICAgaWYgKGlzcy5jb2RlID09PSBcInVucmVjb2duaXplZF9rZXlzXCIpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrIG9mIGlzcy5rZXlzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXVucmVjS2V5cy5oYXMoaykpXHJcbiAgICAgICAgICAgICAgICAgICAgdW5yZWNLZXlzLnNldChrLCB7fSk7XHJcbiAgICAgICAgICAgICAgICB1bnJlY0tleXMuZ2V0KGspLnIgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXN1bHQuaXNzdWVzLnB1c2goaXNzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBSZXBvcnQgb25seSBrZXlzIHVucmVjb2duaXplZCBieSBCT1RIIHNpZGVzXHJcbiAgICBjb25zdCBib3RoS2V5cyA9IFsuLi51bnJlY0tleXNdLmZpbHRlcigoWywgZl0pID0+IGYubCAmJiBmLnIpLm1hcCgoW2tdKSA9PiBrKTtcclxuICAgIGlmIChib3RoS2V5cy5sZW5ndGggJiYgdW5yZWNJc3N1ZSkge1xyXG4gICAgICAgIHJlc3VsdC5pc3N1ZXMucHVzaCh7IC4uLnVucmVjSXNzdWUsIGtleXM6IGJvdGhLZXlzIH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKHV0aWwuYWJvcnRlZChyZXN1bHQpKVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICBjb25zdCBtZXJnZWQgPSBtZXJnZVZhbHVlcyhsZWZ0LnZhbHVlLCByaWdodC52YWx1ZSk7XHJcbiAgICBpZiAoIW1lcmdlZC52YWxpZCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5tZXJnYWJsZSBpbnRlcnNlY3Rpb24uIEVycm9yIHBhdGg6IGAgKyBgJHtKU09OLnN0cmluZ2lmeShtZXJnZWQubWVyZ2VFcnJvclBhdGgpfWApO1xyXG4gICAgfVxyXG4gICAgcmVzdWx0LnZhbHVlID0gbWVyZ2VkLmRhdGE7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmV4cG9ydCBjb25zdCAkWm9kVHVwbGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFR1cGxlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvbnN0IGl0ZW1zID0gZGVmLml0ZW1zO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwidHVwbGVcIixcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcGF5bG9hZC52YWx1ZSA9IFtdO1xyXG4gICAgICAgIGNvbnN0IHByb21zID0gW107XHJcbiAgICAgICAgY29uc3Qgb3B0aW5TdGFydCA9IGdldFR1cGxlT3B0U3RhcnQoaXRlbXMsIFwib3B0aW5cIik7XHJcbiAgICAgICAgY29uc3Qgb3B0b3V0U3RhcnQgPSBnZXRUdXBsZU9wdFN0YXJ0KGl0ZW1zLCBcIm9wdG91dFwiKTtcclxuICAgICAgICBpZiAoIWRlZi5yZXN0KSB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5sZW5ndGggPCBvcHRpblN0YXJ0KSB7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBjb2RlOiBcInRvb19zbWFsbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIG1pbmltdW06IG9wdGluU3RhcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luOiBcImFycmF5XCIsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpbnB1dC5sZW5ndGggPiBpdGVtcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFwidG9vX2JpZ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIG1heGltdW06IGl0ZW1zLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgICAgICBvcmlnaW46IFwiYXJyYXlcIixcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFJ1biBldmVyeSBpdGVtIGluIHBhcmFsbGVsLCBjb2xsZWN0aW5nIHJlc3VsdHMgaW50byBhbiBpbmRleGVkXHJcbiAgICAgICAgLy8gYXJyYXkuIFRoZSBwb3N0LXByb2Nlc3NpbmcgaW4gYGhhbmRsZVR1cGxlUmVzdWx0c2Agd2Fsa3MgdGhlbSBpblxyXG4gICAgICAgIC8vIG9yZGVyIHNvIGl0IGNhbiBkZWNpZGUgd2hldGhlciBhbiBhYnNlbnQgb3B0aW9uYWwtb3V0cHV0IGVycm9yIGNhblxyXG4gICAgICAgIC8vIHRydW5jYXRlIHRoZSB0YWlsIG9yIG11c3QgYmUgcmVwb3J0ZWQgdG8gcHJlc2VydmUgcmVxdWlyZWQgb3V0cHV0LlxyXG4gICAgICAgIGNvbnN0IGl0ZW1SZXN1bHRzID0gbmV3IEFycmF5KGl0ZW1zLmxlbmd0aCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCByID0gaXRlbXNbaV0uX3pvZC5ydW4oeyB2YWx1ZTogaW5wdXRbaV0sIGlzc3VlczogW10gfSwgY3R4KTtcclxuICAgICAgICAgICAgaWYgKHIgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKHIudGhlbigocnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtUmVzdWx0c1tpXSA9IHJyO1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaXRlbVJlc3VsdHNbaV0gPSByO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZWYucmVzdCkge1xyXG4gICAgICAgICAgICBsZXQgaSA9IGl0ZW1zLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3QgPSBpbnB1dC5zbGljZShpdGVtcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVsIG9mIHJlc3QpIHtcclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGRlZi5yZXN0Ll96b2QucnVuKHsgdmFsdWU6IGVsLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb21zLnB1c2gocmVzdWx0LnRoZW4oKHIpID0+IGhhbmRsZVR1cGxlUmVzdWx0KHIsIHBheWxvYWQsIGkpKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVUdXBsZVJlc3VsdChyZXN1bHQsIHBheWxvYWQsIGkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9tcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21zKS50aGVuKCgpID0+IGhhbmRsZVR1cGxlUmVzdWx0cyhpdGVtUmVzdWx0cywgcGF5bG9hZCwgaXRlbXMsIGlucHV0LCBvcHRvdXRTdGFydCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGFuZGxlVHVwbGVSZXN1bHRzKGl0ZW1SZXN1bHRzLCBwYXlsb2FkLCBpdGVtcywgaW5wdXQsIG9wdG91dFN0YXJ0KTtcclxuICAgIH07XHJcbn0pO1xyXG5mdW5jdGlvbiBnZXRUdXBsZU9wdFN0YXJ0KGl0ZW1zLCBrZXkpIHtcclxuICAgIGZvciAobGV0IGkgPSBpdGVtcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGlmIChpdGVtc1tpXS5fem9kW2tleV0gIT09IFwib3B0aW9uYWxcIilcclxuICAgICAgICAgICAgcmV0dXJuIGkgKyAxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIDA7XHJcbn1cclxuZnVuY3Rpb24gaGFuZGxlVHVwbGVSZXN1bHQocmVzdWx0LCBmaW5hbCwgaW5kZXgpIHtcclxuICAgIGlmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgIGZpbmFsLmlzc3Vlcy5wdXNoKC4uLnV0aWwucHJlZml4SXNzdWVzKGluZGV4LCByZXN1bHQuaXNzdWVzKSk7XHJcbiAgICB9XHJcbiAgICBmaW5hbC52YWx1ZVtpbmRleF0gPSByZXN1bHQudmFsdWU7XHJcbn1cclxuZnVuY3Rpb24gaGFuZGxlVHVwbGVSZXN1bHRzKGl0ZW1SZXN1bHRzLCBmaW5hbCwgaXRlbXMsIGlucHV0LCBvcHRvdXRTdGFydCkge1xyXG4gICAgLy8gV2FsayByZXN1bHRzIGluIG9yZGVyLiBNaXJyb3IgJFpvZE9iamVjdCdzIHN3YWxsb3ctb24tYWJzZW50LW9wdGlvbmFsXHJcbiAgICAvLyBydWxlLCBidXQgb25seSBhZnRlciBgb3B0b3V0U3RhcnRgOiB0aGUgZmlyc3QgaW5kZXggd2hlcmUgdGhlIG91dHB1dFxyXG4gICAgLy8gdHVwbGUgdGFpbCBjYW4gYmUgYWJzZW50LlxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IHIgPSBpdGVtUmVzdWx0c1tpXTtcclxuICAgICAgICBjb25zdCBpc1ByZXNlbnQgPSBpIDwgaW5wdXQubGVuZ3RoO1xyXG4gICAgICAgIGlmIChyLmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKCFpc1ByZXNlbnQgJiYgaSA+PSBvcHRvdXRTdGFydCkge1xyXG4gICAgICAgICAgICAgICAgZmluYWwudmFsdWUubGVuZ3RoID0gaTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZpbmFsLmlzc3Vlcy5wdXNoKC4uLnV0aWwucHJlZml4SXNzdWVzKGksIHIuaXNzdWVzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsLnZhbHVlW2ldID0gci52YWx1ZTtcclxuICAgIH1cclxuICAgIC8vIERyb3AgdHJhaWxpbmcgc2xvdHMgdGhhdCBwcm9kdWNlZCBgdW5kZWZpbmVkYCBmb3IgYWJzZW50IGlucHV0XHJcbiAgICAvLyAodGhlIGFycmF5IGFuYWxvZyBvZiBhbiBhYnNlbnQgb3B0aW9uYWwga2V5IG9uIGFuIG9iamVjdCkuIFRoZVxyXG4gICAgLy8gYGkgPj0gaW5wdXQubGVuZ3RoYCBmbG9vciBpcyBjcml0aWNhbDogYW4gZXhwbGljaXQgYHVuZGVmaW5lZGBcclxuICAgIC8vICppbnNpZGUqIHRoZSBpbnB1dCBtdXN0IGJlIHByZXNlcnZlZCBldmVuIHdoZW4gdGhlIHNjaGVtYSBpc1xyXG4gICAgLy8gb3B0aW9uYWwtb3V0IChlLmcuIGB6LnN0cmluZygpLm9yKHoudW5kZWZpbmVkKCkpYCBhY2NlcHRpbmcgYW5cclxuICAgIC8vIGV4cGxpY2l0IHVuZGVmaW5lZCB2YWx1ZSkuXHJcbiAgICBmb3IgKGxldCBpID0gZmluYWwudmFsdWUubGVuZ3RoIC0gMTsgaSA+PSBpbnB1dC5sZW5ndGg7IGktLSkge1xyXG4gICAgICAgIGlmIChpdGVtc1tpXS5fem9kLm9wdG91dCA9PT0gXCJvcHRpb25hbFwiICYmIGZpbmFsLnZhbHVlW2ldID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZmluYWwudmFsdWUubGVuZ3RoID0gaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmaW5hbDtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZFJlY29yZCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kUmVjb3JkXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKCF1dGlsLmlzUGxhaW5PYmplY3QoaW5wdXQpKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwicmVjb3JkXCIsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByb21zID0gW107XHJcbiAgICAgICAgY29uc3QgdmFsdWVzID0gZGVmLmtleVR5cGUuX3pvZC52YWx1ZXM7XHJcbiAgICAgICAgaWYgKHZhbHVlcykge1xyXG4gICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0ge307XHJcbiAgICAgICAgICAgIGNvbnN0IHJlY29yZEtleXMgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHZhbHVlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIGtleSA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2Yga2V5ID09PSBcInN5bWJvbFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVjb3JkS2V5cy5hZGQodHlwZW9mIGtleSA9PT0gXCJudW1iZXJcIiA/IGtleS50b1N0cmluZygpIDoga2V5KTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXlSZXN1bHQgPSBkZWYua2V5VHlwZS5fem9kLnJ1bih7IHZhbHVlOiBrZXksIGlzc3VlczogW10gfSwgY3R4KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5UmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luYyBzY2hlbWFzIG5vdCBzdXBwb3J0ZWQgaW4gb2JqZWN0IGtleXMgY3VycmVudGx5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5UmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfa2V5XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW46IFwicmVjb3JkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IGtleVJlc3VsdC5pc3N1ZXMubWFwKChpc3MpID0+IHV0aWwuZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29yZS5jb25maWcoKSkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IGtleSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IFtrZXldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBvdXRLZXkgPSBrZXlSZXN1bHQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZGVmLnZhbHVlVHlwZS5fem9kLnJ1bih7IHZhbHVlOiBpbnB1dFtrZXldLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbXMucHVzaChyZXN1bHQudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKC4uLnV0aWwucHJlZml4SXNzdWVzKGtleSwgcmVzdWx0Lmlzc3VlcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZVtvdXRLZXldID0gcmVzdWx0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goLi4udXRpbC5wcmVmaXhJc3N1ZXMoa2V5LCByZXN1bHQuaXNzdWVzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZVtvdXRLZXldID0gcmVzdWx0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgdW5yZWNvZ25pemVkO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBpbnB1dCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFyZWNvcmRLZXlzLmhhcyhrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5yZWNvZ25pemVkID0gdW5yZWNvZ25pemVkID8/IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIHVucmVjb2duaXplZC5wdXNoKGtleSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHVucmVjb2duaXplZCAmJiB1bnJlY29nbml6ZWQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgY29kZTogXCJ1bnJlY29nbml6ZWRfa2V5c1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5czogdW5yZWNvZ25pemVkLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSB7fTtcclxuICAgICAgICAgICAgLy8gUmVmbGVjdC5vd25LZXlzIGZvciBTeW1ib2wta2V5IHN1cHBvcnQ7IGZpbHRlciBub24tZW51bWVyYWJsZSB0byBtYXRjaCB6Lm9iamVjdCgpXHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIFJlZmxlY3Qub3duS2V5cyhpbnB1dCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IFwiX19wcm90b19fXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChpbnB1dCwga2V5KSlcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGxldCBrZXlSZXN1bHQgPSBkZWYua2V5VHlwZS5fem9kLnJ1bih7IHZhbHVlOiBrZXksIGlzc3VlczogW10gfSwgY3R4KTtcclxuICAgICAgICAgICAgICAgIGlmIChrZXlSZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmMgc2NoZW1hcyBub3Qgc3VwcG9ydGVkIGluIG9iamVjdCBrZXlzIGN1cnJlbnRseVwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIE51bWVyaWMgc3RyaW5nIGZhbGxiYWNrOiBpZiBrZXkgaXMgYSBudW1lcmljIHN0cmluZyBhbmQgZmFpbGVkLCByZXRyeSB3aXRoIE51bWJlcihrZXkpXHJcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGhhbmRsZXMgei5udW1iZXIoKSwgei5saXRlcmFsKFsxLCAyLCAzXSksIGFuZCB1bmlvbnMgY29udGFpbmluZyBudW1lcmljIGxpdGVyYWxzXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGVja051bWVyaWNLZXkgPSB0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiICYmIHJlZ2V4ZXMubnVtYmVyLnRlc3Qoa2V5KSAmJiBrZXlSZXN1bHQuaXNzdWVzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGlmIChjaGVja051bWVyaWNLZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXRyeVJlc3VsdCA9IGRlZi5rZXlUeXBlLl96b2QucnVuKHsgdmFsdWU6IE51bWJlcihrZXkpLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJ5UmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBc3luYyBzY2hlbWFzIG5vdCBzdXBwb3J0ZWQgaW4gb2JqZWN0IGtleXMgY3VycmVudGx5XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAocmV0cnlSZXN1bHQuaXNzdWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXlSZXN1bHQgPSByZXRyeVJlc3VsdDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5UmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVmLm1vZGUgPT09IFwibG9vc2VcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQYXNzIHRocm91Z2ggdW5jaGFuZ2VkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWVba2V5XSA9IGlucHV0W2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBEZWZhdWx0IFwic3RyaWN0XCIgYmVoYXZpb3I6IGVycm9yIG9uIGludmFsaWQga2V5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2tleVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luOiBcInJlY29yZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBrZXlSZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBrZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBba2V5XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGRlZi52YWx1ZVR5cGUuX3pvZC5ydW4oeyB2YWx1ZTogaW5wdXRba2V5XSwgaXNzdWVzOiBbXSB9LCBjdHgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKHJlc3VsdC50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKC4uLnV0aWwucHJlZml4SXNzdWVzKGtleSwgcmVzdWx0Lmlzc3VlcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWVba2V5UmVzdWx0LnZhbHVlXSA9IHJlc3VsdC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCguLi51dGlsLnByZWZpeElzc3VlcyhrZXksIHJlc3VsdC5pc3N1ZXMpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZVtrZXlSZXN1bHQudmFsdWVdID0gcmVzdWx0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9tcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21zKS50aGVuKCgpID0+IHBheWxvYWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZE1hcCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTWFwXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKCEoaW5wdXQgaW5zdGFuY2VvZiBNYXApKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwibWFwXCIsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByb21zID0gW107XHJcbiAgICAgICAgcGF5bG9hZC52YWx1ZSA9IG5ldyBNYXAoKTtcclxuICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBpbnB1dCkge1xyXG4gICAgICAgICAgICBjb25zdCBrZXlSZXN1bHQgPSBkZWYua2V5VHlwZS5fem9kLnJ1bih7IHZhbHVlOiBrZXksIGlzc3VlczogW10gfSwgY3R4KTtcclxuICAgICAgICAgICAgY29uc3QgdmFsdWVSZXN1bHQgPSBkZWYudmFsdWVUeXBlLl96b2QucnVuKHsgdmFsdWU6IHZhbHVlLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICAgICAgICAgIGlmIChrZXlSZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlIHx8IHZhbHVlUmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgcHJvbXMucHVzaChQcm9taXNlLmFsbChba2V5UmVzdWx0LCB2YWx1ZVJlc3VsdF0pLnRoZW4oKFtrZXlSZXN1bHQsIHZhbHVlUmVzdWx0XSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZU1hcFJlc3VsdChrZXlSZXN1bHQsIHZhbHVlUmVzdWx0LCBwYXlsb2FkLCBrZXksIGlucHV0LCBpbnN0LCBjdHgpO1xyXG4gICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlTWFwUmVzdWx0KGtleVJlc3VsdCwgdmFsdWVSZXN1bHQsIHBheWxvYWQsIGtleSwgaW5wdXQsIGluc3QsIGN0eCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByb21zLmxlbmd0aClcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21zKS50aGVuKCgpID0+IHBheWxvYWQpO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmZ1bmN0aW9uIGhhbmRsZU1hcFJlc3VsdChrZXlSZXN1bHQsIHZhbHVlUmVzdWx0LCBmaW5hbCwga2V5LCBpbnB1dCwgaW5zdCwgY3R4KSB7XHJcbiAgICBpZiAoa2V5UmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICBpZiAodXRpbC5wcm9wZXJ0eUtleVR5cGVzLmhhcyh0eXBlb2Yga2V5KSkge1xyXG4gICAgICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCguLi51dGlsLnByZWZpeElzc3VlcyhrZXksIGtleVJlc3VsdC5pc3N1ZXMpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGZpbmFsLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9rZXlcIixcclxuICAgICAgICAgICAgICAgIG9yaWdpbjogXCJtYXBcIixcclxuICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIGlzc3Vlczoga2V5UmVzdWx0Lmlzc3Vlcy5tYXAoKGlzcykgPT4gdXRpbC5maW5hbGl6ZUlzc3VlKGlzcywgY3R4LCBjb3JlLmNvbmZpZygpKSksXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICh2YWx1ZVJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgaWYgKHV0aWwucHJvcGVydHlLZXlUeXBlcy5oYXModHlwZW9mIGtleSkpIHtcclxuICAgICAgICAgICAgZmluYWwuaXNzdWVzLnB1c2goLi4udXRpbC5wcmVmaXhJc3N1ZXMoa2V5LCB2YWx1ZVJlc3VsdC5pc3N1ZXMpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGZpbmFsLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIG9yaWdpbjogXCJtYXBcIixcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9lbGVtZW50XCIsXHJcbiAgICAgICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICAgICAgICAgIGlzc3VlczogdmFsdWVSZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZmluYWwudmFsdWUuc2V0KGtleVJlc3VsdC52YWx1ZSwgdmFsdWVSZXN1bHQudmFsdWUpO1xyXG59XHJcbmV4cG9ydCBjb25zdCAkWm9kU2V0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RTZXRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBpZiAoIShpbnB1dCBpbnN0YW5jZW9mIFNldCkpIHtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogXCJzZXRcIixcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHJvbXMgPSBbXTtcclxuICAgICAgICBwYXlsb2FkLnZhbHVlID0gbmV3IFNldCgpO1xyXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBpbnB1dCkge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYudmFsdWVUeXBlLl96b2QucnVuKHsgdmFsdWU6IGl0ZW0sIGlzc3VlczogW10gfSwgY3R4KTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHByb21zLnB1c2gocmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4gaGFuZGxlU2V0UmVzdWx0KHJlc3VsdCwgcGF5bG9hZCkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBoYW5kbGVTZXRSZXN1bHQocmVzdWx0LCBwYXlsb2FkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByb21zLmxlbmd0aClcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21zKS50aGVuKCgpID0+IHBheWxvYWQpO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmZ1bmN0aW9uIGhhbmRsZVNldFJlc3VsdChyZXN1bHQsIGZpbmFsKSB7XHJcbiAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCguLi5yZXN1bHQuaXNzdWVzKTtcclxuICAgIH1cclxuICAgIGZpbmFsLnZhbHVlLmFkZChyZXN1bHQudmFsdWUpO1xyXG59XHJcbmV4cG9ydCBjb25zdCAkWm9kRW51bSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kRW51bVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb25zdCB2YWx1ZXMgPSB1dGlsLmdldEVudW1WYWx1ZXMoZGVmLmVudHJpZXMpO1xyXG4gICAgY29uc3QgdmFsdWVzU2V0ID0gbmV3IFNldCh2YWx1ZXMpO1xyXG4gICAgaW5zdC5fem9kLnZhbHVlcyA9IHZhbHVlc1NldDtcclxuICAgIGluc3QuX3pvZC5wYXR0ZXJuID0gbmV3IFJlZ0V4cChgXigke3ZhbHVlc1xyXG4gICAgICAgIC5maWx0ZXIoKGspID0+IHV0aWwucHJvcGVydHlLZXlUeXBlcy5oYXModHlwZW9mIGspKVxyXG4gICAgICAgIC5tYXAoKG8pID0+ICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIiA/IHV0aWwuZXNjYXBlUmVnZXgobykgOiBvLnRvU3RyaW5nKCkpKVxyXG4gICAgICAgIC5qb2luKFwifFwiKX0pJGApO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKHZhbHVlc1NldC5oYXMoaW5wdXQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3ZhbHVlXCIsXHJcbiAgICAgICAgICAgIHZhbHVlcyxcclxuICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RMaXRlcmFsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RMaXRlcmFsXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGlmIChkZWYudmFsdWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjcmVhdGUgbGl0ZXJhbCBzY2hlbWEgd2l0aCBubyB2YWxpZCB2YWx1ZXNcIik7XHJcbiAgICB9XHJcbiAgICBjb25zdCB2YWx1ZXMgPSBuZXcgU2V0KGRlZi52YWx1ZXMpO1xyXG4gICAgaW5zdC5fem9kLnZhbHVlcyA9IHZhbHVlcztcclxuICAgIGluc3QuX3pvZC5wYXR0ZXJuID0gbmV3IFJlZ0V4cChgXigke2RlZi52YWx1ZXNcclxuICAgICAgICAubWFwKChvKSA9PiAodHlwZW9mIG8gPT09IFwic3RyaW5nXCIgPyB1dGlsLmVzY2FwZVJlZ2V4KG8pIDogbyA/IHV0aWwuZXNjYXBlUmVnZXgoby50b1N0cmluZygpKSA6IFN0cmluZyhvKSkpXHJcbiAgICAgICAgLmpvaW4oXCJ8XCIpfSkkYCk7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgX2N0eCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBpZiAodmFsdWVzLmhhcyhpbnB1dCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdmFsdWVcIixcclxuICAgICAgICAgICAgdmFsdWVzOiBkZWYudmFsdWVzLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZEZpbGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEZpbGVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIEZpbGUpXHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBleHBlY3RlZDogXCJmaWxlXCIsXHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kVHJhbnNmb3JtID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RUcmFuc2Zvcm1cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLm9wdGluID0gXCJvcHRpb25hbFwiO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIGlmIChjdHguZGlyZWN0aW9uID09PSBcImJhY2t3YXJkXCIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IGNvcmUuJFpvZEVuY29kZUVycm9yKGluc3QuY29uc3RydWN0b3IubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IF9vdXQgPSBkZWYudHJhbnNmb3JtKHBheWxvYWQudmFsdWUsIHBheWxvYWQpO1xyXG4gICAgICAgIGlmIChjdHguYXN5bmMpIHtcclxuICAgICAgICAgICAgY29uc3Qgb3V0cHV0ID0gX291dCBpbnN0YW5jZW9mIFByb21pc2UgPyBfb3V0IDogUHJvbWlzZS5yZXNvbHZlKF9vdXQpO1xyXG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0LnRoZW4oKG91dHB1dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IG91dHB1dDtcclxuICAgICAgICAgICAgICAgIHBheWxvYWQuZmFsbGJhY2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoX291dCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IGNvcmUuJFpvZEFzeW5jRXJyb3IoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcGF5bG9hZC52YWx1ZSA9IF9vdXQ7XHJcbiAgICAgICAgcGF5bG9hZC5mYWxsYmFjayA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZnVuY3Rpb24gaGFuZGxlT3B0aW9uYWxSZXN1bHQocmVzdWx0LCBpbnB1dCkge1xyXG4gICAgaWYgKGlucHV0ID09PSB1bmRlZmluZWQgJiYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoIHx8IHJlc3VsdC5mYWxsYmFjaykpIHtcclxuICAgICAgICByZXR1cm4geyBpc3N1ZXM6IFtdLCB2YWx1ZTogdW5kZWZpbmVkIH07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbmV4cG9ydCBjb25zdCAkWm9kT3B0aW9uYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE9wdGlvbmFsXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5vcHRpbiA9IFwib3B0aW9uYWxcIjtcclxuICAgIGluc3QuX3pvZC5vcHRvdXQgPSBcIm9wdGlvbmFsXCI7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInZhbHVlc1wiLCAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXMgPyBuZXcgU2V0KFsuLi5kZWYuaW5uZXJUeXBlLl96b2QudmFsdWVzLCB1bmRlZmluZWRdKSA6IHVuZGVmaW5lZDtcclxuICAgIH0pO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJwYXR0ZXJuXCIsICgpID0+IHtcclxuICAgICAgICBjb25zdCBwYXR0ZXJuID0gZGVmLmlubmVyVHlwZS5fem9kLnBhdHRlcm47XHJcbiAgICAgICAgcmV0dXJuIHBhdHRlcm4gPyBuZXcgUmVnRXhwKGBeKCR7dXRpbC5jbGVhblJlZ2V4KHBhdHRlcm4uc291cmNlKX0pPyRgKSA6IHVuZGVmaW5lZDtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIGlmIChkZWYuaW5uZXJUeXBlLl96b2Qub3B0aW4gPT09IFwib3B0aW9uYWxcIikge1xyXG4gICAgICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHIpID0+IGhhbmRsZU9wdGlvbmFsUmVzdWx0KHIsIGlucHV0KSk7XHJcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVPcHRpb25hbFJlc3VsdChyZXN1bHQsIGlucHV0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHBheWxvYWQudmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZEV4YWN0T3B0aW9uYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEV4YWN0T3B0aW9uYWxcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gQ2FsbCBwYXJlbnQgaW5pdCAtIGluaGVyaXRzIG9wdGluL29wdG91dCA9IFwib3B0aW9uYWxcIlxyXG4gICAgJFpvZE9wdGlvbmFsLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIC8vIE92ZXJyaWRlIHZhbHVlcy9wYXR0ZXJuIHRvIE5PVCBhZGQgdW5kZWZpbmVkXHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInZhbHVlc1wiLCAoKSA9PiBkZWYuaW5uZXJUeXBlLl96b2QudmFsdWVzKTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwicGF0dGVyblwiLCAoKSA9PiBkZWYuaW5uZXJUeXBlLl96b2QucGF0dGVybik7XHJcbiAgICAvLyBPdmVycmlkZSBwYXJzZSB0byBqdXN0IGRlbGVnYXRlIChubyB1bmRlZmluZWQgaGFuZGxpbmcpXHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZE51bGxhYmxlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2ROdWxsYWJsZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcIm9wdGluXCIsICgpID0+IGRlZi5pbm5lclR5cGUuX3pvZC5vcHRpbik7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcIm9wdG91dFwiLCAoKSA9PiBkZWYuaW5uZXJUeXBlLl96b2Qub3B0b3V0KTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwicGF0dGVyblwiLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcGF0dGVybiA9IGRlZi5pbm5lclR5cGUuX3pvZC5wYXR0ZXJuO1xyXG4gICAgICAgIHJldHVybiBwYXR0ZXJuID8gbmV3IFJlZ0V4cChgXigke3V0aWwuY2xlYW5SZWdleChwYXR0ZXJuLnNvdXJjZSl9fG51bGwpJGApIDogdW5kZWZpbmVkO1xyXG4gICAgfSk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInZhbHVlc1wiLCAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXMgPyBuZXcgU2V0KFsuLi5kZWYuaW5uZXJUeXBlLl96b2QudmFsdWVzLCBudWxsXSkgOiB1bmRlZmluZWQ7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICAvLyBGb3J3YXJkIGRpcmVjdGlvbiAoZGVjb2RlKTogYWxsb3cgbnVsbCB0byBwYXNzIHRocm91Z2hcclxuICAgICAgICBpZiAocGF5bG9hZC52YWx1ZSA9PT0gbnVsbClcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZERlZmF1bHQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZERlZmF1bHRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgLy8gaW5zdC5fem9kLnFpbiA9IFwidHJ1ZVwiO1xyXG4gICAgaW5zdC5fem9kLm9wdGluID0gXCJvcHRpb25hbFwiO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJ2YWx1ZXNcIiwgKCkgPT4gZGVmLmlubmVyVHlwZS5fem9kLnZhbHVlcyk7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgaWYgKGN0eC5kaXJlY3Rpb24gPT09IFwiYmFja3dhcmRcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmLmlubmVyVHlwZS5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBGb3J3YXJkIGRpcmVjdGlvbiAoZGVjb2RlKTogYXBwbHkgZGVmYXVsdHMgZm9yIHVuZGVmaW5lZCBpbnB1dFxyXG4gICAgICAgIGlmIChwYXlsb2FkLnZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IGRlZi5kZWZhdWx0VmFsdWU7XHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiAkWm9kRGVmYXVsdCByZXR1cm5zIHRoZSBkZWZhdWx0IHZhbHVlIGltbWVkaWF0ZWx5IGluIGZvcndhcmQgZGlyZWN0aW9uLlxyXG4gICAgICAgICAgICAgKiBJdCBkb2Vzbid0IHBhc3MgdGhlIGRlZmF1bHQgdmFsdWUgaW50byB0aGUgdmFsaWRhdG9yIChcInByZWZhdWx0XCIpLiBUaGVyZSdzIG5vIHJlYXNvbiB0byBwYXNzIHRoZSBkZWZhdWx0IHZhbHVlIHRocm91Z2ggdmFsaWRhdGlvbi4gVGhlIHZhbGlkaXR5IG9mIHRoZSBkZWZhdWx0IGlzIGVuZm9yY2VkIGJ5IFR5cGVTY3JpcHQgc3RhdGljYWxseS4gT3RoZXJ3aXNlLCBpdCdzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB0aGUgdXNlciB0byBlbnN1cmUgdGhlIGRlZmF1bHQgaXMgdmFsaWQuIEluIHRoZSBjYXNlIG9mIHBpcGVzIHdpdGggZGl2ZXJnZW50IGluL291dCB0eXBlcywgeW91IGNhbiBzcGVjaWZ5IHRoZSBkZWZhdWx0IG9uIHRoZSBgaW5gIHNjaGVtYSBvZiB5b3VyIFpvZFBpcGUgdG8gc2V0IGEgXCJwcmVmYXVsdFwiIGZvciB0aGUgcGlwZS4gICAqL1xyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRm9yd2FyZCBkaXJlY3Rpb246IGNvbnRpbnVlIHdpdGggZGVmYXVsdCBoYW5kbGluZ1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4gaGFuZGxlRGVmYXVsdFJlc3VsdChyZXN1bHQsIGRlZikpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGFuZGxlRGVmYXVsdFJlc3VsdChyZXN1bHQsIGRlZik7XHJcbiAgICB9O1xyXG59KTtcclxuZnVuY3Rpb24gaGFuZGxlRGVmYXVsdFJlc3VsdChwYXlsb2FkLCBkZWYpIHtcclxuICAgIGlmIChwYXlsb2FkLnZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBwYXlsb2FkLnZhbHVlID0gZGVmLmRlZmF1bHRWYWx1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBwYXlsb2FkO1xyXG59XHJcbmV4cG9ydCBjb25zdCAkWm9kUHJlZmF1bHQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFByZWZhdWx0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5vcHRpbiA9IFwib3B0aW9uYWxcIjtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwidmFsdWVzXCIsICgpID0+IGRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXMpO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIGlmIChjdHguZGlyZWN0aW9uID09PSBcImJhY2t3YXJkXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRm9yd2FyZCBkaXJlY3Rpb24gKGRlY29kZSk6IGFwcGx5IHByZWZhdWx0IGZvciB1bmRlZmluZWQgaW5wdXRcclxuICAgICAgICBpZiAocGF5bG9hZC52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBkZWYuZGVmYXVsdFZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVmLmlubmVyVHlwZS5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kTm9uT3B0aW9uYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE5vbk9wdGlvbmFsXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwidmFsdWVzXCIsICgpID0+IHtcclxuICAgICAgICBjb25zdCB2ID0gZGVmLmlubmVyVHlwZS5fem9kLnZhbHVlcztcclxuICAgICAgICByZXR1cm4gdiA/IG5ldyBTZXQoWy4uLnZdLmZpbHRlcigoeCkgPT4geCAhPT0gdW5kZWZpbmVkKSkgOiB1bmRlZmluZWQ7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC50aGVuKChyZXN1bHQpID0+IGhhbmRsZU5vbk9wdGlvbmFsUmVzdWx0KHJlc3VsdCwgaW5zdCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGFuZGxlTm9uT3B0aW9uYWxSZXN1bHQocmVzdWx0LCBpbnN0KTtcclxuICAgIH07XHJcbn0pO1xyXG5mdW5jdGlvbiBoYW5kbGVOb25PcHRpb25hbFJlc3VsdChwYXlsb2FkLCBpbnN0KSB7XHJcbiAgICBpZiAoIXBheWxvYWQuaXNzdWVzLmxlbmd0aCAmJiBwYXlsb2FkLnZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwibm9ub3B0aW9uYWxcIixcclxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGF5bG9hZDtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZFN1Y2Nlc3MgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFN1Y2Nlc3NcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIGlmIChjdHguZGlyZWN0aW9uID09PSBcImJhY2t3YXJkXCIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IGNvcmUuJFpvZEVuY29kZUVycm9yKFwiWm9kU3VjY2Vzc1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGVmLmlubmVyVHlwZS5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gcmVzdWx0Lmlzc3Vlcy5sZW5ndGggPT09IDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBheWxvYWQudmFsdWUgPSByZXN1bHQuaXNzdWVzLmxlbmd0aCA9PT0gMDtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENhdGNoID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDYXRjaFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2Qub3B0aW4gPSBcIm9wdGlvbmFsXCI7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcIm9wdG91dFwiLCAoKSA9PiBkZWYuaW5uZXJUeXBlLl96b2Qub3B0b3V0KTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwidmFsdWVzXCIsICgpID0+IGRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXMpO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIGlmIChjdHguZGlyZWN0aW9uID09PSBcImJhY2t3YXJkXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRm9yd2FyZCBkaXJlY3Rpb24gKGRlY29kZSk6IGFwcGx5IGNhdGNoIGxvZ2ljXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGVmLmlubmVyVHlwZS5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gcmVzdWx0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IGRlZi5jYXRjaFZhbHVlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucGF5bG9hZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzc3VlczogcmVzdWx0Lmlzc3Vlcy5tYXAoKGlzcykgPT4gdXRpbC5maW5hbGl6ZUlzc3VlKGlzcywgY3R4LCBjb3JlLmNvbmZpZygpKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzID0gW107XHJcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5mYWxsYmFjayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBheWxvYWQudmFsdWUgPSByZXN1bHQudmFsdWU7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBkZWYuY2F0Y2hWYWx1ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5wYXlsb2FkLFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcclxuICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IHJlc3VsdC5pc3N1ZXMubWFwKChpc3MpID0+IHV0aWwuZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29yZS5jb25maWcoKSkpLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMgPSBbXTtcclxuICAgICAgICAgICAgcGF5bG9hZC5mYWxsYmFjayA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kTmFOID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2ROYU5cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQudmFsdWUgIT09IFwibnVtYmVyXCIgfHwgIU51bWJlci5pc05hTihwYXlsb2FkLnZhbHVlKSkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcIm5hblwiLFxyXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZFBpcGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFBpcGVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJ2YWx1ZXNcIiwgKCkgPT4gZGVmLmluLl96b2QudmFsdWVzKTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwib3B0aW5cIiwgKCkgPT4gZGVmLmluLl96b2Qub3B0aW4pO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRvdXRcIiwgKCkgPT4gZGVmLm91dC5fem9kLm9wdG91dCk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInByb3BWYWx1ZXNcIiwgKCkgPT4gZGVmLmluLl96b2QucHJvcFZhbHVlcyk7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgaWYgKGN0eC5kaXJlY3Rpb24gPT09IFwiYmFja3dhcmRcIikge1xyXG4gICAgICAgICAgICBjb25zdCByaWdodCA9IGRlZi5vdXQuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICAgICAgaWYgKHJpZ2h0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJpZ2h0LnRoZW4oKHJpZ2h0KSA9PiBoYW5kbGVQaXBlUmVzdWx0KHJpZ2h0LCBkZWYuaW4sIGN0eCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVQaXBlUmVzdWx0KHJpZ2h0LCBkZWYuaW4sIGN0eCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxlZnQgPSBkZWYuaW4uX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICBpZiAobGVmdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGxlZnQudGhlbigobGVmdCkgPT4gaGFuZGxlUGlwZVJlc3VsdChsZWZ0LCBkZWYub3V0LCBjdHgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZVBpcGVSZXN1bHQobGVmdCwgZGVmLm91dCwgY3R4KTtcclxuICAgIH07XHJcbn0pO1xyXG5mdW5jdGlvbiBoYW5kbGVQaXBlUmVzdWx0KGxlZnQsIG5leHQsIGN0eCkge1xyXG4gICAgaWYgKGxlZnQuaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgIC8vIHByZXZlbnQgZnVydGhlciBjaGVja3NcclxuICAgICAgICBsZWZ0LmFib3J0ZWQgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiBsZWZ0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5leHQuX3pvZC5ydW4oeyB2YWx1ZTogbGVmdC52YWx1ZSwgaXNzdWVzOiBsZWZ0Lmlzc3VlcywgZmFsbGJhY2s6IGxlZnQuZmFsbGJhY2sgfSwgY3R4KTtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZENvZGVjID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDb2RlY1wiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInZhbHVlc1wiLCAoKSA9PiBkZWYuaW4uX3pvZC52YWx1ZXMpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRpblwiLCAoKSA9PiBkZWYuaW4uX3pvZC5vcHRpbik7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcIm9wdG91dFwiLCAoKSA9PiBkZWYub3V0Ll96b2Qub3B0b3V0KTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwicHJvcFZhbHVlc1wiLCAoKSA9PiBkZWYuaW4uX3pvZC5wcm9wVmFsdWVzKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSBjdHguZGlyZWN0aW9uIHx8IFwiZm9yd2FyZFwiO1xyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZm9yd2FyZFwiKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxlZnQgPSBkZWYuaW4uX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICAgICAgaWYgKGxlZnQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdC50aGVuKChsZWZ0KSA9PiBoYW5kbGVDb2RlY0FSZXN1bHQobGVmdCwgZGVmLCBjdHgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlQ29kZWNBUmVzdWx0KGxlZnQsIGRlZiwgY3R4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJpZ2h0ID0gZGVmLm91dC5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgICAgICBpZiAocmlnaHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmlnaHQudGhlbigocmlnaHQpID0+IGhhbmRsZUNvZGVjQVJlc3VsdChyaWdodCwgZGVmLCBjdHgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlQ29kZWNBUmVzdWx0KHJpZ2h0LCBkZWYsIGN0eCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcbmZ1bmN0aW9uIGhhbmRsZUNvZGVjQVJlc3VsdChyZXN1bHQsIGRlZiwgY3R4KSB7XHJcbiAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICAvLyBwcmV2ZW50IGZ1cnRoZXIgY2hlY2tzXHJcbiAgICAgICAgcmVzdWx0LmFib3J0ZWQgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICBjb25zdCBkaXJlY3Rpb24gPSBjdHguZGlyZWN0aW9uIHx8IFwiZm9yd2FyZFwiO1xyXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJmb3J3YXJkXCIpIHtcclxuICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZCA9IGRlZi50cmFuc2Zvcm0ocmVzdWx0LnZhbHVlLCByZXN1bHQpO1xyXG4gICAgICAgIGlmICh0cmFuc2Zvcm1lZCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkLnRoZW4oKHZhbHVlKSA9PiBoYW5kbGVDb2RlY1R4UmVzdWx0KHJlc3VsdCwgdmFsdWUsIGRlZi5vdXQsIGN0eCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGFuZGxlQ29kZWNUeFJlc3VsdChyZXN1bHQsIHRyYW5zZm9ybWVkLCBkZWYub3V0LCBjdHgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtZWQgPSBkZWYucmV2ZXJzZVRyYW5zZm9ybShyZXN1bHQudmFsdWUsIHJlc3VsdCk7XHJcbiAgICAgICAgaWYgKHRyYW5zZm9ybWVkIGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtZWQudGhlbigodmFsdWUpID0+IGhhbmRsZUNvZGVjVHhSZXN1bHQocmVzdWx0LCB2YWx1ZSwgZGVmLmluLCBjdHgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZUNvZGVjVHhSZXN1bHQocmVzdWx0LCB0cmFuc2Zvcm1lZCwgZGVmLmluLCBjdHgpO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGhhbmRsZUNvZGVjVHhSZXN1bHQobGVmdCwgdmFsdWUsIG5leHRTY2hlbWEsIGN0eCkge1xyXG4gICAgLy8gQ2hlY2sgaWYgdHJhbnNmb3JtIGFkZGVkIGFueSBpc3N1ZXNcclxuICAgIGlmIChsZWZ0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICBsZWZ0LmFib3J0ZWQgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiBsZWZ0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5leHRTY2hlbWEuX3pvZC5ydW4oeyB2YWx1ZSwgaXNzdWVzOiBsZWZ0Lmlzc3VlcyB9LCBjdHgpO1xyXG59XHJcbmV4cG9ydCBjb25zdCAkWm9kUHJlcHJvY2VzcyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kUHJlcHJvY2Vzc1wiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kUGlwZS5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZFJlYWRvbmx5ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RSZWFkb25seVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInByb3BWYWx1ZXNcIiwgKCkgPT4gZGVmLmlubmVyVHlwZS5fem9kLnByb3BWYWx1ZXMpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJ2YWx1ZXNcIiwgKCkgPT4gZGVmLmlubmVyVHlwZS5fem9kLnZhbHVlcyk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcIm9wdGluXCIsICgpID0+IGRlZi5pbm5lclR5cGU/Ll96b2Q/Lm9wdGluKTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwib3B0b3V0XCIsICgpID0+IGRlZi5pbm5lclR5cGU/Ll96b2Q/Lm9wdG91dCk7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgaWYgKGN0eC5kaXJlY3Rpb24gPT09IFwiYmFja3dhcmRcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gZGVmLmlubmVyVHlwZS5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC50aGVuKGhhbmRsZVJlYWRvbmx5UmVzdWx0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZVJlYWRvbmx5UmVzdWx0KHJlc3VsdCk7XHJcbiAgICB9O1xyXG59KTtcclxuZnVuY3Rpb24gaGFuZGxlUmVhZG9ubHlSZXN1bHQocGF5bG9hZCkge1xyXG4gICAgcGF5bG9hZC52YWx1ZSA9IE9iamVjdC5mcmVlemUocGF5bG9hZC52YWx1ZSk7XHJcbiAgICByZXR1cm4gcGF5bG9hZDtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZFRlbXBsYXRlTGl0ZXJhbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kVGVtcGxhdGVMaXRlcmFsXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvbnN0IHJlZ2V4UGFydHMgPSBbXTtcclxuICAgIGZvciAoY29uc3QgcGFydCBvZiBkZWYucGFydHMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHBhcnQgPT09IFwib2JqZWN0XCIgJiYgcGFydCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyBpcyBab2Qgc2NoZW1hXHJcbiAgICAgICAgICAgIGlmICghcGFydC5fem9kLnBhdHRlcm4pIHtcclxuICAgICAgICAgICAgICAgIC8vIGlmICghc291cmNlKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRlbXBsYXRlIGxpdGVyYWwgcGFydCwgbm8gcGF0dGVybiBmb3VuZDogJHtbLi4ucGFydC5fem9kLnRyYWl0c10uc2hpZnQoKX1gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSBwYXJ0Ll96b2QucGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCA/IHBhcnQuX3pvZC5wYXR0ZXJuLnNvdXJjZSA6IHBhcnQuX3pvZC5wYXR0ZXJuO1xyXG4gICAgICAgICAgICBpZiAoIXNvdXJjZSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0ZW1wbGF0ZSBsaXRlcmFsIHBhcnQ6ICR7cGFydC5fem9kLnRyYWl0c31gKTtcclxuICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBzb3VyY2Uuc3RhcnRzV2l0aChcIl5cIikgPyAxIDogMDtcclxuICAgICAgICAgICAgY29uc3QgZW5kID0gc291cmNlLmVuZHNXaXRoKFwiJFwiKSA/IHNvdXJjZS5sZW5ndGggLSAxIDogc291cmNlLmxlbmd0aDtcclxuICAgICAgICAgICAgcmVnZXhQYXJ0cy5wdXNoKHNvdXJjZS5zbGljZShzdGFydCwgZW5kKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHBhcnQgPT09IG51bGwgfHwgdXRpbC5wcmltaXRpdmVUeXBlcy5oYXModHlwZW9mIHBhcnQpKSB7XHJcbiAgICAgICAgICAgIHJlZ2V4UGFydHMucHVzaCh1dGlsLmVzY2FwZVJlZ2V4KGAke3BhcnR9YCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHRlbXBsYXRlIGxpdGVyYWwgcGFydDogJHtwYXJ0fWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGluc3QuX3pvZC5wYXR0ZXJuID0gbmV3IFJlZ0V4cChgXiR7cmVnZXhQYXJ0cy5qb2luKFwiXCIpfSRgKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLnZhbHVlICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluc3QuX3pvZC5wYXR0ZXJuLmxhc3RJbmRleCA9IDA7XHJcbiAgICAgICAgaWYgKCFpbnN0Ll96b2QucGF0dGVybi50ZXN0KHBheWxvYWQudmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxyXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBkZWYuZm9ybWF0ID8/IFwidGVtcGxhdGVfbGl0ZXJhbFwiLFxyXG4gICAgICAgICAgICAgICAgcGF0dGVybjogaW5zdC5fem9kLnBhdHRlcm4uc291cmNlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kRnVuY3Rpb24gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEZ1bmN0aW9uXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX2RlZiA9IGRlZjtcclxuICAgIGluc3QuX3pvZC5kZWYgPSBkZWY7XHJcbiAgICBpbnN0LmltcGxlbWVudCA9IChmdW5jKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBmdW5jICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW1wbGVtZW50KCkgbXVzdCBiZSBjYWxsZWQgd2l0aCBhIGZ1bmN0aW9uXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgcGFyc2VkQXJncyA9IGluc3QuX2RlZi5pbnB1dCA/IHBhcnNlKGluc3QuX2RlZi5pbnB1dCwgYXJncykgOiBhcmdzO1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBSZWZsZWN0LmFwcGx5KGZ1bmMsIHRoaXMsIHBhcnNlZEFyZ3MpO1xyXG4gICAgICAgICAgICBpZiAoaW5zdC5fZGVmLm91dHB1dCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlKGluc3QuX2RlZi5vdXRwdXQsIHJlc3VsdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIGluc3QuaW1wbGVtZW50QXN5bmMgPSAoZnVuYykgPT4ge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZnVuYyAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImltcGxlbWVudEFzeW5jKCkgbXVzdCBiZSBjYWxsZWQgd2l0aCBhIGZ1bmN0aW9uXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYXN5bmMgZnVuY3Rpb24gKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgcGFyc2VkQXJncyA9IGluc3QuX2RlZi5pbnB1dCA/IGF3YWl0IHBhcnNlQXN5bmMoaW5zdC5fZGVmLmlucHV0LCBhcmdzKSA6IGFyZ3M7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IFJlZmxlY3QuYXBwbHkoZnVuYywgdGhpcywgcGFyc2VkQXJncyk7XHJcbiAgICAgICAgICAgIGlmIChpbnN0Ll9kZWYub3V0cHV0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgcGFyc2VBc3luYyhpbnN0Ll9kZWYub3V0cHV0LCByZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgX2N0eCkgPT4ge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC52YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcImZ1bmN0aW9uXCIsXHJcbiAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgb3V0cHV0IGlzIGEgcHJvbWlzZSB0eXBlIHRvIGRldGVybWluZSBpZiB3ZSBzaG91bGQgdXNlIGFzeW5jIGltcGxlbWVudGF0aW9uXHJcbiAgICAgICAgY29uc3QgaGFzUHJvbWlzZU91dHB1dCA9IGluc3QuX2RlZi5vdXRwdXQgJiYgaW5zdC5fZGVmLm91dHB1dC5fem9kLmRlZi50eXBlID09PSBcInByb21pc2VcIjtcclxuICAgICAgICBpZiAoaGFzUHJvbWlzZU91dHB1dCkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gaW5zdC5pbXBsZW1lbnRBc3luYyhwYXlsb2FkLnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBpbnN0LmltcGxlbWVudChwYXlsb2FkLnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG4gICAgaW5zdC5pbnB1dCA9ICguLi5hcmdzKSA9PiB7XHJcbiAgICAgICAgY29uc3QgRiA9IGluc3QuY29uc3RydWN0b3I7XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnc1swXSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBGKHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcclxuICAgICAgICAgICAgICAgIGlucHV0OiBuZXcgJFpvZFR1cGxlKHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInR1cGxlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbXM6IGFyZ3NbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdDogYXJnc1sxXSxcclxuICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgb3V0cHV0OiBpbnN0Ll9kZWYub3V0cHV0LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBGKHtcclxuICAgICAgICAgICAgdHlwZTogXCJmdW5jdGlvblwiLFxyXG4gICAgICAgICAgICBpbnB1dDogYXJnc1swXSxcclxuICAgICAgICAgICAgb3V0cHV0OiBpbnN0Ll9kZWYub3V0cHV0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIGluc3Qub3V0cHV0ID0gKG91dHB1dCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IEYgPSBpbnN0LmNvbnN0cnVjdG9yO1xyXG4gICAgICAgIHJldHVybiBuZXcgRih7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcclxuICAgICAgICAgICAgaW5wdXQ6IGluc3QuX2RlZi5pbnB1dCxcclxuICAgICAgICAgICAgb3V0cHV0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBpbnN0O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RQcm9taXNlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RQcm9taXNlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHBheWxvYWQudmFsdWUpLnRoZW4oKGlubmVyKSA9PiBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHsgdmFsdWU6IGlubmVyLCBpc3N1ZXM6IFtdIH0sIGN0eCkpO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kTGF6eSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTGF6eVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICAvLyBDYWNoZSB0aGUgcmVzb2x2ZWQgaW5uZXIgdHlwZSBvbiB0aGUgc2hhcmVkIGBkZWZgIHNvIGFsbCBjbG9uZXMgb2YgdGhpc1xyXG4gICAgLy8gbGF6eSAoZS5nLiB2aWEgYC5kZXNjcmliZSgpYC9gLm1ldGEoKWApIHNoYXJlIHRoZSBzYW1lIGlubmVyIGluc3RhbmNlLFxyXG4gICAgLy8gcHJlc2VydmluZyBpZGVudGl0eSBmb3IgY3ljbGUgZGV0ZWN0aW9uIG9uIHJlY3Vyc2l2ZSBzY2hlbWFzLlxyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJpbm5lclR5cGVcIiwgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGQgPSBkZWY7XHJcbiAgICAgICAgaWYgKCFkLl9jYWNoZWRJbm5lcilcclxuICAgICAgICAgICAgZC5fY2FjaGVkSW5uZXIgPSBkZWYuZ2V0dGVyKCk7XHJcbiAgICAgICAgcmV0dXJuIGQuX2NhY2hlZElubmVyO1xyXG4gICAgfSk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInBhdHRlcm5cIiwgKCkgPT4gaW5zdC5fem9kLmlubmVyVHlwZT8uX3pvZD8ucGF0dGVybik7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInByb3BWYWx1ZXNcIiwgKCkgPT4gaW5zdC5fem9kLmlubmVyVHlwZT8uX3pvZD8ucHJvcFZhbHVlcyk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcIm9wdGluXCIsICgpID0+IGluc3QuX3pvZC5pbm5lclR5cGU/Ll96b2Q/Lm9wdGluID8/IHVuZGVmaW5lZCk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcIm9wdG91dFwiLCAoKSA9PiBpbnN0Ll96b2QuaW5uZXJUeXBlPy5fem9kPy5vcHRvdXQgPz8gdW5kZWZpbmVkKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbm5lciA9IGluc3QuX3pvZC5pbm5lclR5cGU7XHJcbiAgICAgICAgcmV0dXJuIGlubmVyLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDdXN0b20gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEN1c3RvbVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjaGVja3MuJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgY29uc3QgciA9IGRlZi5mbihpbnB1dCk7XHJcbiAgICAgICAgaWYgKHIgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByLnRoZW4oKHIpID0+IGhhbmRsZVJlZmluZVJlc3VsdChyLCBwYXlsb2FkLCBpbnB1dCwgaW5zdCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBoYW5kbGVSZWZpbmVSZXN1bHQociwgcGF5bG9hZCwgaW5wdXQsIGluc3QpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH07XHJcbn0pO1xyXG5mdW5jdGlvbiBoYW5kbGVSZWZpbmVSZXN1bHQocmVzdWx0LCBwYXlsb2FkLCBpbnB1dCwgaW5zdCkge1xyXG4gICAgaWYgKCFyZXN1bHQpIHtcclxuICAgICAgICBjb25zdCBfaXNzID0ge1xyXG4gICAgICAgICAgICBjb2RlOiBcImN1c3RvbVwiLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCwgLy8gaW5jb3Jwb3JhdGVzIHBhcmFtcy5lcnJvciBpbnRvIGlzc3VlIHJlcG9ydGluZ1xyXG4gICAgICAgICAgICBwYXRoOiBbLi4uKGluc3QuX3pvZC5kZWYucGF0aCA/PyBbXSldLCAvLyBpbmNvcnBvcmF0ZXMgcGFyYW1zLmVycm9yIGludG8gaXNzdWUgcmVwb3J0aW5nXHJcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhaW5zdC5fem9kLmRlZi5hYm9ydCxcclxuICAgICAgICAgICAgLy8gcGFyYW1zOiBpbnN0Ll96b2QuZGVmLnBhcmFtcyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChpbnN0Ll96b2QuZGVmLnBhcmFtcylcclxuICAgICAgICAgICAgX2lzcy5wYXJhbXMgPSBpbnN0Ll96b2QuZGVmLnBhcmFtcztcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHV0aWwuaXNzdWUoX2lzcykpO1xyXG4gICAgfVxyXG59XHJcbiIsInZhciBfYTtcclxuZXhwb3J0IGNvbnN0ICRvdXRwdXQgPSBTeW1ib2woXCJab2RPdXRwdXRcIik7XHJcbmV4cG9ydCBjb25zdCAkaW5wdXQgPSBTeW1ib2woXCJab2RJbnB1dFwiKTtcclxuZXhwb3J0IGNsYXNzICRab2RSZWdpc3RyeSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9tYXAgPSBuZXcgV2Vha01hcCgpO1xyXG4gICAgICAgIHRoaXMuX2lkbWFwID0gbmV3IE1hcCgpO1xyXG4gICAgfVxyXG4gICAgYWRkKHNjaGVtYSwgLi4uX21ldGEpIHtcclxuICAgICAgICBjb25zdCBtZXRhID0gX21ldGFbMF07XHJcbiAgICAgICAgdGhpcy5fbWFwLnNldChzY2hlbWEsIG1ldGEpO1xyXG4gICAgICAgIGlmIChtZXRhICYmIHR5cGVvZiBtZXRhID09PSBcIm9iamVjdFwiICYmIFwiaWRcIiBpbiBtZXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lkbWFwLnNldChtZXRhLmlkLCBzY2hlbWEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGNsZWFyKCkge1xyXG4gICAgICAgIHRoaXMuX21hcCA9IG5ldyBXZWFrTWFwKCk7XHJcbiAgICAgICAgdGhpcy5faWRtYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICByZW1vdmUoc2NoZW1hKSB7XHJcbiAgICAgICAgY29uc3QgbWV0YSA9IHRoaXMuX21hcC5nZXQoc2NoZW1hKTtcclxuICAgICAgICBpZiAobWV0YSAmJiB0eXBlb2YgbWV0YSA9PT0gXCJvYmplY3RcIiAmJiBcImlkXCIgaW4gbWV0YSkge1xyXG4gICAgICAgICAgICB0aGlzLl9pZG1hcC5kZWxldGUobWV0YS5pZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX21hcC5kZWxldGUoc2NoZW1hKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGdldChzY2hlbWEpIHtcclxuICAgICAgICAvLyByZXR1cm4gdGhpcy5fbWFwLmdldChzY2hlbWEpIGFzIGFueTtcclxuICAgICAgICAvLyBpbmhlcml0IG1ldGFkYXRhXHJcbiAgICAgICAgY29uc3QgcCA9IHNjaGVtYS5fem9kLnBhcmVudDtcclxuICAgICAgICBpZiAocCkge1xyXG4gICAgICAgICAgICBjb25zdCBwbSA9IHsgLi4uKHRoaXMuZ2V0KHApID8/IHt9KSB9O1xyXG4gICAgICAgICAgICBkZWxldGUgcG0uaWQ7IC8vIGRvIG5vdCBpbmhlcml0IGlkXHJcbiAgICAgICAgICAgIGNvbnN0IGYgPSB7IC4uLnBtLCAuLi50aGlzLl9tYXAuZ2V0KHNjaGVtYSkgfTtcclxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGYpLmxlbmd0aCA/IGYgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuZ2V0KHNjaGVtYSk7XHJcbiAgICB9XHJcbiAgICBoYXMoc2NoZW1hKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21hcC5oYXMoc2NoZW1hKTtcclxuICAgIH1cclxufVxyXG4vLyByZWdpc3RyaWVzXHJcbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RyeSgpIHtcclxuICAgIHJldHVybiBuZXcgJFpvZFJlZ2lzdHJ5KCk7XHJcbn1cclxuKF9hID0gZ2xvYmFsVGhpcykuX196b2RfZ2xvYmFsUmVnaXN0cnkgPz8gKF9hLl9fem9kX2dsb2JhbFJlZ2lzdHJ5ID0gcmVnaXN0cnkoKSk7XHJcbmV4cG9ydCBjb25zdCBnbG9iYWxSZWdpc3RyeSA9IGdsb2JhbFRoaXMuX196b2RfZ2xvYmFsUmVnaXN0cnk7XHJcbiIsImltcG9ydCAqIGFzIGNoZWNrcyBmcm9tIFwiLi9jaGVja3MuanNcIjtcclxuaW1wb3J0ICogYXMgcmVnaXN0cmllcyBmcm9tIFwiLi9yZWdpc3RyaWVzLmpzXCI7XHJcbmltcG9ydCAqIGFzIHNjaGVtYXMgZnJvbSBcIi4vc2NoZW1hcy5qc1wiO1xyXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuL3V0aWwuanNcIjtcclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9zdHJpbmcoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9jb2VyY2VkU3RyaW5nKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgY29lcmNlOiB0cnVlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2VtYWlsKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcImVtYWlsXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9ndWlkKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcImd1aWRcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3V1aWQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwidXVpZFwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfdXVpZHY0KENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcInV1aWRcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIHZlcnNpb246IFwidjRcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF91dWlkdjYoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwidXVpZFwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgdmVyc2lvbjogXCJ2NlwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3V1aWR2NyhDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJ1dWlkXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICB2ZXJzaW9uOiBcInY3XCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfdXJsKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcInVybFwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfZW1vamkoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwiZW1vamlcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX25hbm9pZChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJuYW5vaWRcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgQ1VJRCB2MSBpcyBkZXByZWNhdGVkIGJ5IGl0cyBhdXRob3JzIGR1ZSB0byBpbmZvcm1hdGlvbiBsZWFrYWdlXHJcbiAqICh0aW1lc3RhbXBzIGVtYmVkZGVkIGluIHRoZSBpZCkuIFVzZSB7QGxpbmsgX2N1aWQyfSBpbnN0ZWFkLlxyXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BhcmFsbGVsZHJpdmUvY3VpZC5cclxuICovXHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfY3VpZChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJjdWlkXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9jdWlkMihDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJjdWlkMlwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfdWxpZChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJ1bGlkXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF94aWQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwieGlkXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9rc3VpZChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJrc3VpZFwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfaXB2NChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJpcHY0XCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9pcHY2KENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcImlwdjZcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX21hYyhDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJtYWNcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2NpZHJ2NChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJjaWRydjRcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2NpZHJ2NihDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJjaWRydjZcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2Jhc2U2NChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJiYXNlNjRcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2Jhc2U2NHVybChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJiYXNlNjR1cmxcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2UxNjQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwiZTE2NFwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfand0KENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcImp3dFwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBUaW1lUHJlY2lzaW9uID0ge1xyXG4gICAgQW55OiBudWxsLFxyXG4gICAgTWludXRlOiAtMSxcclxuICAgIFNlY29uZDogMCxcclxuICAgIE1pbGxpc2Vjb25kOiAzLFxyXG4gICAgTWljcm9zZWNvbmQ6IDYsXHJcbn07XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfaXNvRGF0ZVRpbWUoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwiZGF0ZXRpbWVcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgb2Zmc2V0OiBmYWxzZSxcclxuICAgICAgICBsb2NhbDogZmFsc2UsXHJcbiAgICAgICAgcHJlY2lzaW9uOiBudWxsLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2lzb0RhdGUoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwiZGF0ZVwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9pc29UaW1lKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcInRpbWVcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgcHJlY2lzaW9uOiBudWxsLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2lzb0R1cmF0aW9uKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcImR1cmF0aW9uXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX251bWJlcihDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxyXG4gICAgICAgIGNoZWNrczogW10sXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfY29lcmNlZE51bWJlcihDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxyXG4gICAgICAgIGNvZXJjZTogdHJ1ZSxcclxuICAgICAgICBjaGVja3M6IFtdLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2ludChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxyXG4gICAgICAgIGNoZWNrOiBcIm51bWJlcl9mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgZm9ybWF0OiBcInNhZmVpbnRcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9mbG9hdDMyKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgY2hlY2s6IFwibnVtYmVyX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICBmb3JtYXQ6IFwiZmxvYXQzMlwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2Zsb2F0NjQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICBjaGVjazogXCJudW1iZXJfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIGZvcm1hdDogXCJmbG9hdDY0XCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfaW50MzIoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICBjaGVjazogXCJudW1iZXJfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIGZvcm1hdDogXCJpbnQzMlwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3VpbnQzMihDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxyXG4gICAgICAgIGNoZWNrOiBcIm51bWJlcl9mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgZm9ybWF0OiBcInVpbnQzMlwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2Jvb2xlYW4oQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfY29lcmNlZEJvb2xlYW4oQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCIsXHJcbiAgICAgICAgY29lcmNlOiB0cnVlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2JpZ2ludChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcImJpZ2ludFwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2NvZXJjZWRCaWdpbnQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJiaWdpbnRcIixcclxuICAgICAgICBjb2VyY2U6IHRydWUsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfaW50NjQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJiaWdpbnRcIixcclxuICAgICAgICBjaGVjazogXCJiaWdpbnRfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIGZvcm1hdDogXCJpbnQ2NFwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3VpbnQ2NChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcImJpZ2ludFwiLFxyXG4gICAgICAgIGNoZWNrOiBcImJpZ2ludF9mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgZm9ybWF0OiBcInVpbnQ2NFwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3N5bWJvbChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN5bWJvbFwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3VuZGVmaW5lZChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInVuZGVmaW5lZFwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX251bGwoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJudWxsXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfYW55KENsYXNzKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcImFueVwiLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF91bmtub3duKENsYXNzKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInVua25vd25cIixcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbmV2ZXIoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJuZXZlclwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3ZvaWQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJ2b2lkXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfZGF0ZShDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcImRhdGVcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9jb2VyY2VkRGF0ZShDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcImRhdGVcIixcclxuICAgICAgICBjb2VyY2U6IHRydWUsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbmFuKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwibmFuXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbHQodmFsdWUsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrTGVzc1RoYW4oe1xyXG4gICAgICAgIGNoZWNrOiBcImxlc3NfdGhhblwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICAgICAgdmFsdWUsXHJcbiAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbHRlKHZhbHVlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja0xlc3NUaGFuKHtcclxuICAgICAgICBjaGVjazogXCJsZXNzX3RoYW5cIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgICAgIHZhbHVlLFxyXG4gICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCB7IFxyXG4vKiogQGRlcHJlY2F0ZWQgVXNlIGB6Lmx0ZSgpYCBpbnN0ZWFkLiAqL1xyXG5fbHRlIGFzIF9tYXgsIH07XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfZ3QodmFsdWUsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrR3JlYXRlclRoYW4oe1xyXG4gICAgICAgIGNoZWNrOiBcImdyZWF0ZXJfdGhhblwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICAgICAgdmFsdWUsXHJcbiAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfZ3RlKHZhbHVlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja0dyZWF0ZXJUaGFuKHtcclxuICAgICAgICBjaGVjazogXCJncmVhdGVyX3RoYW5cIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgICAgIHZhbHVlLFxyXG4gICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCB7IFxyXG4vKiogQGRlcHJlY2F0ZWQgVXNlIGB6Lmd0ZSgpYCBpbnN0ZWFkLiAqL1xyXG5fZ3RlIGFzIF9taW4sIH07XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfcG9zaXRpdmUocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gX2d0KDAsIHBhcmFtcyk7XHJcbn1cclxuLy8gbmVnYXRpdmVcclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9uZWdhdGl2ZShwYXJhbXMpIHtcclxuICAgIHJldHVybiBfbHQoMCwgcGFyYW1zKTtcclxufVxyXG4vLyBub25wb3NpdGl2ZVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX25vbnBvc2l0aXZlKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIF9sdGUoMCwgcGFyYW1zKTtcclxufVxyXG4vLyBub25uZWdhdGl2ZVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX25vbm5lZ2F0aXZlKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIF9ndGUoMCwgcGFyYW1zKTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX211bHRpcGxlT2YodmFsdWUsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrTXVsdGlwbGVPZih7XHJcbiAgICAgICAgY2hlY2s6IFwibXVsdGlwbGVfb2ZcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgICAgIHZhbHVlLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9tYXhTaXplKG1heGltdW0sIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrTWF4U2l6ZSh7XHJcbiAgICAgICAgY2hlY2s6IFwibWF4X3NpemVcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgICAgIG1heGltdW0sXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX21pblNpemUobWluaW11bSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tNaW5TaXplKHtcclxuICAgICAgICBjaGVjazogXCJtaW5fc2l6ZVwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICAgICAgbWluaW11bSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfc2l6ZShzaXplLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja1NpemVFcXVhbHMoe1xyXG4gICAgICAgIGNoZWNrOiBcInNpemVfZXF1YWxzXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICBzaXplLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9tYXhMZW5ndGgobWF4aW11bSwgcGFyYW1zKSB7XHJcbiAgICBjb25zdCBjaCA9IG5ldyBjaGVja3MuJFpvZENoZWNrTWF4TGVuZ3RoKHtcclxuICAgICAgICBjaGVjazogXCJtYXhfbGVuZ3RoXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICBtYXhpbXVtLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY2g7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9taW5MZW5ndGgobWluaW11bSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tNaW5MZW5ndGgoe1xyXG4gICAgICAgIGNoZWNrOiBcIm1pbl9sZW5ndGhcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgICAgIG1pbmltdW0sXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2xlbmd0aChsZW5ndGgsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrTGVuZ3RoRXF1YWxzKHtcclxuICAgICAgICBjaGVjazogXCJsZW5ndGhfZXF1YWxzXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICBsZW5ndGgsXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3JlZ2V4KHBhdHRlcm4sIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrUmVnZXgoe1xyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBmb3JtYXQ6IFwicmVnZXhcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgICAgIHBhdHRlcm4sXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2xvd2VyY2FzZShwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja0xvd2VyQ2FzZSh7XHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGZvcm1hdDogXCJsb3dlcmNhc2VcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF91cHBlcmNhc2UocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tVcHBlckNhc2Uoe1xyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBmb3JtYXQ6IFwidXBwZXJjYXNlXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfaW5jbHVkZXMoaW5jbHVkZXMsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrSW5jbHVkZXMoe1xyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBmb3JtYXQ6IFwiaW5jbHVkZXNcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgICAgIGluY2x1ZGVzLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9zdGFydHNXaXRoKHByZWZpeCwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tTdGFydHNXaXRoKHtcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgZm9ybWF0OiBcInN0YXJ0c193aXRoXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICBwcmVmaXgsXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2VuZHNXaXRoKHN1ZmZpeCwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tFbmRzV2l0aCh7XHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGZvcm1hdDogXCJlbmRzX3dpdGhcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgICAgIHN1ZmZpeCxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfcHJvcGVydHkocHJvcGVydHksIHNjaGVtYSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tQcm9wZXJ0eSh7XHJcbiAgICAgICAgY2hlY2s6IFwicHJvcGVydHlcIixcclxuICAgICAgICBwcm9wZXJ0eSxcclxuICAgICAgICBzY2hlbWEsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbWltZSh0eXBlcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tNaW1lVHlwZSh7XHJcbiAgICAgICAgY2hlY2s6IFwibWltZV90eXBlXCIsXHJcbiAgICAgICAgbWltZTogdHlwZXMsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfb3ZlcndyaXRlKHR4KSB7XHJcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tPdmVyd3JpdGUoe1xyXG4gICAgICAgIGNoZWNrOiBcIm92ZXJ3cml0ZVwiLFxyXG4gICAgICAgIHR4LFxyXG4gICAgfSk7XHJcbn1cclxuLy8gbm9ybWFsaXplXHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbm9ybWFsaXplKGZvcm0pIHtcclxuICAgIHJldHVybiBfb3ZlcndyaXRlKChpbnB1dCkgPT4gaW5wdXQubm9ybWFsaXplKGZvcm0pKTtcclxufVxyXG4vLyB0cmltXHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfdHJpbSgpIHtcclxuICAgIHJldHVybiBfb3ZlcndyaXRlKChpbnB1dCkgPT4gaW5wdXQudHJpbSgpKTtcclxufVxyXG4vLyB0b0xvd2VyQ2FzZVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3RvTG93ZXJDYXNlKCkge1xyXG4gICAgcmV0dXJuIF9vdmVyd3JpdGUoKGlucHV0KSA9PiBpbnB1dC50b0xvd2VyQ2FzZSgpKTtcclxufVxyXG4vLyB0b1VwcGVyQ2FzZVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3RvVXBwZXJDYXNlKCkge1xyXG4gICAgcmV0dXJuIF9vdmVyd3JpdGUoKGlucHV0KSA9PiBpbnB1dC50b1VwcGVyQ2FzZSgpKTtcclxufVxyXG4vLyBzbHVnaWZ5XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfc2x1Z2lmeSgpIHtcclxuICAgIHJldHVybiBfb3ZlcndyaXRlKChpbnB1dCkgPT4gdXRpbC5zbHVnaWZ5KGlucHV0KSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9hcnJheShDbGFzcywgZWxlbWVudCwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcImFycmF5XCIsXHJcbiAgICAgICAgZWxlbWVudCxcclxuICAgICAgICAvLyBnZXQgZWxlbWVudCgpIHtcclxuICAgICAgICAvLyAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgICAgIC8vIH0sXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfdW5pb24oQ2xhc3MsIG9wdGlvbnMsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJ1bmlvblwiLFxyXG4gICAgICAgIG9wdGlvbnMsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBfeG9yKENsYXNzLCBvcHRpb25zLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwidW5pb25cIixcclxuICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfZGlzY3JpbWluYXRlZFVuaW9uKENsYXNzLCBkaXNjcmltaW5hdG9yLCBvcHRpb25zLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwidW5pb25cIixcclxuICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgIGRpc2NyaW1pbmF0b3IsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfaW50ZXJzZWN0aW9uKENsYXNzLCBsZWZ0LCByaWdodCkge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJpbnRlcnNlY3Rpb25cIixcclxuICAgICAgICBsZWZ0LFxyXG4gICAgICAgIHJpZ2h0LFxyXG4gICAgfSk7XHJcbn1cclxuLy8gZXhwb3J0IGZ1bmN0aW9uIF90dXBsZShcclxuLy8gICBDbGFzczogdXRpbC5TY2hlbWFDbGFzczxzY2hlbWFzLiRab2RUdXBsZT4sXHJcbi8vICAgaXRlbXM6IFtdLFxyXG4vLyAgIHBhcmFtcz86IHN0cmluZyB8ICRab2RUdXBsZVBhcmFtc1xyXG4vLyApOiBzY2hlbWFzLiRab2RUdXBsZTxbXSwgbnVsbD47XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfdHVwbGUoQ2xhc3MsIGl0ZW1zLCBfcGFyYW1zT3JSZXN0LCBfcGFyYW1zKSB7XHJcbiAgICBjb25zdCBoYXNSZXN0ID0gX3BhcmFtc09yUmVzdCBpbnN0YW5jZW9mIHNjaGVtYXMuJFpvZFR5cGU7XHJcbiAgICBjb25zdCBwYXJhbXMgPSBoYXNSZXN0ID8gX3BhcmFtcyA6IF9wYXJhbXNPclJlc3Q7XHJcbiAgICBjb25zdCByZXN0ID0gaGFzUmVzdCA/IF9wYXJhbXNPclJlc3QgOiBudWxsO1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJ0dXBsZVwiLFxyXG4gICAgICAgIGl0ZW1zLFxyXG4gICAgICAgIHJlc3QsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfcmVjb3JkKENsYXNzLCBrZXlUeXBlLCB2YWx1ZVR5cGUsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJyZWNvcmRcIixcclxuICAgICAgICBrZXlUeXBlLFxyXG4gICAgICAgIHZhbHVlVHlwZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9tYXAoQ2xhc3MsIGtleVR5cGUsIHZhbHVlVHlwZSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcIm1hcFwiLFxyXG4gICAgICAgIGtleVR5cGUsXHJcbiAgICAgICAgdmFsdWVUeXBlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3NldChDbGFzcywgdmFsdWVUeXBlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic2V0XCIsXHJcbiAgICAgICAgdmFsdWVUeXBlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2VudW0oQ2xhc3MsIHZhbHVlcywgcGFyYW1zKSB7XHJcbiAgICBjb25zdCBlbnRyaWVzID0gQXJyYXkuaXNBcnJheSh2YWx1ZXMpID8gT2JqZWN0LmZyb21FbnRyaWVzKHZhbHVlcy5tYXAoKHYpID0+IFt2LCB2XSkpIDogdmFsdWVzO1xyXG4gICAgLy8gaWYgKEFycmF5LmlzQXJyYXkodmFsdWVzKSkge1xyXG4gICAgLy8gICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xyXG4gICAgLy8gICAgIGVudHJpZXNbdmFsdWVdID0gdmFsdWU7XHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH0gZWxzZSB7XHJcbiAgICAvLyAgIE9iamVjdC5hc3NpZ24oZW50cmllcywgdmFsdWVzKTtcclxuICAgIC8vIH1cclxuICAgIC8vIGNvbnN0IGVudHJpZXM6IHV0aWwuRW51bUxpa2UgPSB7fTtcclxuICAgIC8vIGZvciAoY29uc3QgdmFsIG9mIHZhbHVlcykge1xyXG4gICAgLy8gICBlbnRyaWVzW3ZhbF0gPSB2YWw7XHJcbiAgICAvLyB9XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcImVudW1cIixcclxuICAgICAgICBlbnRyaWVzLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG4vKiogQGRlcHJlY2F0ZWQgVGhpcyBBUEkgaGFzIGJlZW4gbWVyZ2VkIGludG8gYHouZW51bSgpYC4gVXNlIGB6LmVudW0oKWAgaW5zdGVhZC5cclxuICpcclxuICogYGBgdHNcclxuICogZW51bSBDb2xvcnMgeyByZWQsIGdyZWVuLCBibHVlIH1cclxuICogei5lbnVtKENvbG9ycyk7XHJcbiAqIGBgYFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9uYXRpdmVFbnVtKENsYXNzLCBlbnRyaWVzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwiZW51bVwiLFxyXG4gICAgICAgIGVudHJpZXMsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbGl0ZXJhbChDbGFzcywgdmFsdWUsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJsaXRlcmFsXCIsXHJcbiAgICAgICAgdmFsdWVzOiBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlIDogW3ZhbHVlXSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9maWxlKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwiZmlsZVwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3RyYW5zZm9ybShDbGFzcywgZm4pIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwidHJhbnNmb3JtXCIsXHJcbiAgICAgICAgdHJhbnNmb3JtOiBmbixcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfb3B0aW9uYWwoQ2xhc3MsIGlubmVyVHlwZSkge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJvcHRpb25hbFwiLFxyXG4gICAgICAgIGlubmVyVHlwZSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbnVsbGFibGUoQ2xhc3MsIGlubmVyVHlwZSkge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJudWxsYWJsZVwiLFxyXG4gICAgICAgIGlubmVyVHlwZSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfZGVmYXVsdChDbGFzcywgaW5uZXJUeXBlLCBkZWZhdWx0VmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwiZGVmYXVsdFwiLFxyXG4gICAgICAgIGlubmVyVHlwZSxcclxuICAgICAgICBnZXQgZGVmYXVsdFZhbHVlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGRlZmF1bHRWYWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gZGVmYXVsdFZhbHVlKCkgOiB1dGlsLnNoYWxsb3dDbG9uZShkZWZhdWx0VmFsdWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX25vbm9wdGlvbmFsKENsYXNzLCBpbm5lclR5cGUsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJub25vcHRpb25hbFwiLFxyXG4gICAgICAgIGlubmVyVHlwZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9zdWNjZXNzKENsYXNzLCBpbm5lclR5cGUpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3VjY2Vzc1wiLFxyXG4gICAgICAgIGlubmVyVHlwZSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfY2F0Y2goQ2xhc3MsIGlubmVyVHlwZSwgY2F0Y2hWYWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJjYXRjaFwiLFxyXG4gICAgICAgIGlubmVyVHlwZSxcclxuICAgICAgICBjYXRjaFZhbHVlOiAodHlwZW9mIGNhdGNoVmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGNhdGNoVmFsdWUgOiAoKSA9PiBjYXRjaFZhbHVlKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfcGlwZShDbGFzcywgaW5fLCBvdXQpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwicGlwZVwiLFxyXG4gICAgICAgIGluOiBpbl8sXHJcbiAgICAgICAgb3V0LFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9yZWFkb25seShDbGFzcywgaW5uZXJUeXBlKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInJlYWRvbmx5XCIsXHJcbiAgICAgICAgaW5uZXJUeXBlLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF90ZW1wbGF0ZUxpdGVyYWwoQ2xhc3MsIHBhcnRzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwidGVtcGxhdGVfbGl0ZXJhbFwiLFxyXG4gICAgICAgIHBhcnRzLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2xhenkoQ2xhc3MsIGdldHRlcikge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJsYXp5XCIsXHJcbiAgICAgICAgZ2V0dGVyLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9wcm9taXNlKENsYXNzLCBpbm5lclR5cGUpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwicHJvbWlzZVwiLFxyXG4gICAgICAgIGlubmVyVHlwZSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfY3VzdG9tKENsYXNzLCBmbiwgX3BhcmFtcykge1xyXG4gICAgY29uc3Qgbm9ybSA9IHV0aWwubm9ybWFsaXplUGFyYW1zKF9wYXJhbXMpO1xyXG4gICAgbm9ybS5hYm9ydCA/PyAobm9ybS5hYm9ydCA9IHRydWUpOyAvLyBkZWZhdWx0IHRvIGFib3J0OmZhbHNlXHJcbiAgICBjb25zdCBzY2hlbWEgPSBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwiY3VzdG9tXCIsXHJcbiAgICAgICAgY2hlY2s6IFwiY3VzdG9tXCIsXHJcbiAgICAgICAgZm46IGZuLFxyXG4gICAgICAgIC4uLm5vcm0sXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBzY2hlbWE7XHJcbn1cclxuLy8gc2FtZSBhcyBfY3VzdG9tIGJ1dCBkZWZhdWx0cyB0byBhYm9ydDpmYWxzZVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3JlZmluZShDbGFzcywgZm4sIF9wYXJhbXMpIHtcclxuICAgIGNvbnN0IHNjaGVtYSA9IG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJjdXN0b21cIixcclxuICAgICAgICBjaGVjazogXCJjdXN0b21cIixcclxuICAgICAgICBmbjogZm4sXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMoX3BhcmFtcyksXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBzY2hlbWE7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9zdXBlclJlZmluZShmbiwgcGFyYW1zKSB7XHJcbiAgICBjb25zdCBjaCA9IF9jaGVjaygocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIHBheWxvYWQuYWRkSXNzdWUgPSAoaXNzdWUpID0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpc3N1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh1dGlsLmlzc3VlKGlzc3VlLCBwYXlsb2FkLnZhbHVlLCBjaC5fem9kLmRlZikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gZm9yIFpvZCAzIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XHJcbiAgICAgICAgICAgICAgICBjb25zdCBfaXNzdWUgPSBpc3N1ZTtcclxuICAgICAgICAgICAgICAgIGlmIChfaXNzdWUuZmF0YWwpXHJcbiAgICAgICAgICAgICAgICAgICAgX2lzc3VlLmNvbnRpbnVlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBfaXNzdWUuY29kZSA/PyAoX2lzc3VlLmNvZGUgPSBcImN1c3RvbVwiKTtcclxuICAgICAgICAgICAgICAgIF9pc3N1ZS5pbnB1dCA/PyAoX2lzc3VlLmlucHV0ID0gcGF5bG9hZC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBfaXNzdWUuaW5zdCA/PyAoX2lzc3VlLmluc3QgPSBjaCk7XHJcbiAgICAgICAgICAgICAgICBfaXNzdWUuY29udGludWUgPz8gKF9pc3N1ZS5jb250aW51ZSA9ICFjaC5fem9kLmRlZi5hYm9ydCk7IC8vIGFib3J0IGlzIGFsd2F5cyB1bmRlZmluZWQsIHNvIHRoaXMgaXMgYWx3YXlzIHRydWUuLi5cclxuICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2godXRpbC5pc3N1ZShfaXNzdWUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGZuKHBheWxvYWQudmFsdWUsIHBheWxvYWQpO1xyXG4gICAgfSwgcGFyYW1zKTtcclxuICAgIHJldHVybiBjaDtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2NoZWNrKGZuLCBwYXJhbXMpIHtcclxuICAgIGNvbnN0IGNoID0gbmV3IGNoZWNrcy4kWm9kQ2hlY2soe1xyXG4gICAgICAgIGNoZWNrOiBcImN1c3RvbVwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxuICAgIGNoLl96b2QuY2hlY2sgPSBmbjtcclxuICAgIHJldHVybiBjaDtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gZGVzY3JpYmUoZGVzY3JpcHRpb24pIHtcclxuICAgIGNvbnN0IGNoID0gbmV3IGNoZWNrcy4kWm9kQ2hlY2soeyBjaGVjazogXCJkZXNjcmliZVwiIH0pO1xyXG4gICAgY2guX3pvZC5vbmF0dGFjaCA9IFtcclxuICAgICAgICAoaW5zdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IHJlZ2lzdHJpZXMuZ2xvYmFsUmVnaXN0cnkuZ2V0KGluc3QpID8/IHt9O1xyXG4gICAgICAgICAgICByZWdpc3RyaWVzLmdsb2JhbFJlZ2lzdHJ5LmFkZChpbnN0LCB7IC4uLmV4aXN0aW5nLCBkZXNjcmlwdGlvbiB9KTtcclxuICAgICAgICB9LFxyXG4gICAgXTtcclxuICAgIGNoLl96b2QuY2hlY2sgPSAoKSA9PiB7IH07IC8vIG5vLW9wIGNoZWNrXHJcbiAgICByZXR1cm4gY2g7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIG1ldGEobWV0YWRhdGEpIHtcclxuICAgIGNvbnN0IGNoID0gbmV3IGNoZWNrcy4kWm9kQ2hlY2soeyBjaGVjazogXCJtZXRhXCIgfSk7XHJcbiAgICBjaC5fem9kLm9uYXR0YWNoID0gW1xyXG4gICAgICAgIChpbnN0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gcmVnaXN0cmllcy5nbG9iYWxSZWdpc3RyeS5nZXQoaW5zdCkgPz8ge307XHJcbiAgICAgICAgICAgIHJlZ2lzdHJpZXMuZ2xvYmFsUmVnaXN0cnkuYWRkKGluc3QsIHsgLi4uZXhpc3RpbmcsIC4uLm1ldGFkYXRhIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICBdO1xyXG4gICAgY2guX3pvZC5jaGVjayA9ICgpID0+IHsgfTsgLy8gbm8tb3AgY2hlY2tcclxuICAgIHJldHVybiBjaDtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3N0cmluZ2Jvb2woQ2xhc3NlcywgX3BhcmFtcykge1xyXG4gICAgY29uc3QgcGFyYW1zID0gdXRpbC5ub3JtYWxpemVQYXJhbXMoX3BhcmFtcyk7XHJcbiAgICBsZXQgdHJ1dGh5QXJyYXkgPSBwYXJhbXMudHJ1dGh5ID8/IFtcInRydWVcIiwgXCIxXCIsIFwieWVzXCIsIFwib25cIiwgXCJ5XCIsIFwiZW5hYmxlZFwiXTtcclxuICAgIGxldCBmYWxzeUFycmF5ID0gcGFyYW1zLmZhbHN5ID8/IFtcImZhbHNlXCIsIFwiMFwiLCBcIm5vXCIsIFwib2ZmXCIsIFwiblwiLCBcImRpc2FibGVkXCJdO1xyXG4gICAgaWYgKHBhcmFtcy5jYXNlICE9PSBcInNlbnNpdGl2ZVwiKSB7XHJcbiAgICAgICAgdHJ1dGh5QXJyYXkgPSB0cnV0aHlBcnJheS5tYXAoKHYpID0+ICh0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIiA/IHYudG9Mb3dlckNhc2UoKSA6IHYpKTtcclxuICAgICAgICBmYWxzeUFycmF5ID0gZmFsc3lBcnJheS5tYXAoKHYpID0+ICh0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIiA/IHYudG9Mb3dlckNhc2UoKSA6IHYpKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHRydXRoeVNldCA9IG5ldyBTZXQodHJ1dGh5QXJyYXkpO1xyXG4gICAgY29uc3QgZmFsc3lTZXQgPSBuZXcgU2V0KGZhbHN5QXJyYXkpO1xyXG4gICAgY29uc3QgX0NvZGVjID0gQ2xhc3Nlcy5Db2RlYyA/PyBzY2hlbWFzLiRab2RDb2RlYztcclxuICAgIGNvbnN0IF9Cb29sZWFuID0gQ2xhc3Nlcy5Cb29sZWFuID8/IHNjaGVtYXMuJFpvZEJvb2xlYW47XHJcbiAgICBjb25zdCBfU3RyaW5nID0gQ2xhc3Nlcy5TdHJpbmcgPz8gc2NoZW1hcy4kWm9kU3RyaW5nO1xyXG4gICAgY29uc3Qgc3RyaW5nU2NoZW1hID0gbmV3IF9TdHJpbmcoeyB0eXBlOiBcInN0cmluZ1wiLCBlcnJvcjogcGFyYW1zLmVycm9yIH0pO1xyXG4gICAgY29uc3QgYm9vbGVhblNjaGVtYSA9IG5ldyBfQm9vbGVhbih7IHR5cGU6IFwiYm9vbGVhblwiLCBlcnJvcjogcGFyYW1zLmVycm9yIH0pO1xyXG4gICAgY29uc3QgY29kZWMgPSBuZXcgX0NvZGVjKHtcclxuICAgICAgICB0eXBlOiBcInBpcGVcIixcclxuICAgICAgICBpbjogc3RyaW5nU2NoZW1hLFxyXG4gICAgICAgIG91dDogYm9vbGVhblNjaGVtYSxcclxuICAgICAgICB0cmFuc2Zvcm06ICgoaW5wdXQsIHBheWxvYWQpID0+IHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBpbnB1dDtcclxuICAgICAgICAgICAgaWYgKHBhcmFtcy5jYXNlICE9PSBcInNlbnNpdGl2ZVwiKVxyXG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgaWYgKHRydXRoeVNldC5oYXMoZGF0YSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGZhbHN5U2V0LmhhcyhkYXRhKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3ZhbHVlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwic3RyaW5nYm9vbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlczogWy4uLnRydXRoeVNldCwgLi4uZmFsc3lTZXRdLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGluc3Q6IGNvZGVjLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgcmV2ZXJzZVRyYW5zZm9ybTogKChpbnB1dCwgX3BheWxvYWQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGlucHV0ID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1dGh5QXJyYXlbMF0gfHwgXCJ0cnVlXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc3lBcnJheVswXSB8fCBcImZhbHNlXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSxcclxuICAgICAgICBlcnJvcjogcGFyYW1zLmVycm9yLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY29kZWM7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9zdHJpbmdGb3JtYXQoQ2xhc3MsIGZvcm1hdCwgZm5PclJlZ2V4LCBfcGFyYW1zID0ge30pIHtcclxuICAgIGNvbnN0IHBhcmFtcyA9IHV0aWwubm9ybWFsaXplUGFyYW1zKF9wYXJhbXMpO1xyXG4gICAgY29uc3QgZGVmID0ge1xyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKF9wYXJhbXMpLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdCxcclxuICAgICAgICBmbjogdHlwZW9mIGZuT3JSZWdleCA9PT0gXCJmdW5jdGlvblwiID8gZm5PclJlZ2V4IDogKHZhbCkgPT4gZm5PclJlZ2V4LnRlc3QodmFsKSxcclxuICAgICAgICAuLi5wYXJhbXMsXHJcbiAgICB9O1xyXG4gICAgaWYgKGZuT3JSZWdleCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xyXG4gICAgICAgIGRlZi5wYXR0ZXJuID0gZm5PclJlZ2V4O1xyXG4gICAgfVxyXG4gICAgY29uc3QgaW5zdCA9IG5ldyBDbGFzcyhkZWYpO1xyXG4gICAgcmV0dXJuIGluc3Q7XHJcbn1cclxuIiwiaW1wb3J0IHsgZ2xvYmFsUmVnaXN0cnkgfSBmcm9tIFwiLi9yZWdpc3RyaWVzLmpzXCI7XHJcbi8vIGZ1bmN0aW9uIGluaXRpYWxpemVDb250ZXh0PFQgZXh0ZW5kcyBzY2hlbWFzLiRab2RUeXBlPihpbnB1dHM6IEpTT05TY2hlbWFHZW5lcmF0b3JQYXJhbXM8VD4pOiBUb0pTT05TY2hlbWFDb250ZXh0PFQ+IHtcclxuLy8gICByZXR1cm4ge1xyXG4vLyAgICAgcHJvY2Vzc29yOiBpbnB1dHMucHJvY2Vzc29yLFxyXG4vLyAgICAgbWV0YWRhdGFSZWdpc3RyeTogaW5wdXRzLm1ldGFkYXRhID8/IGdsb2JhbFJlZ2lzdHJ5LFxyXG4vLyAgICAgdGFyZ2V0OiBpbnB1dHMudGFyZ2V0ID8/IFwiZHJhZnQtMjAyMC0xMlwiLFxyXG4vLyAgICAgdW5yZXByZXNlbnRhYmxlOiBpbnB1dHMudW5yZXByZXNlbnRhYmxlID8/IFwidGhyb3dcIixcclxuLy8gICB9O1xyXG4vLyB9XHJcbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplQ29udGV4dChwYXJhbXMpIHtcclxuICAgIC8vIE5vcm1hbGl6ZSB0YXJnZXQ6IGNvbnZlcnQgb2xkIG5vbi1oeXBoZW5hdGVkIHZlcnNpb25zIHRvIGh5cGhlbmF0ZWQgdmVyc2lvbnNcclxuICAgIGxldCB0YXJnZXQgPSBwYXJhbXM/LnRhcmdldCA/PyBcImRyYWZ0LTIwMjAtMTJcIjtcclxuICAgIGlmICh0YXJnZXQgPT09IFwiZHJhZnQtNFwiKVxyXG4gICAgICAgIHRhcmdldCA9IFwiZHJhZnQtMDRcIjtcclxuICAgIGlmICh0YXJnZXQgPT09IFwiZHJhZnQtN1wiKVxyXG4gICAgICAgIHRhcmdldCA9IFwiZHJhZnQtMDdcIjtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcHJvY2Vzc29yczogcGFyYW1zLnByb2Nlc3NvcnMgPz8ge30sXHJcbiAgICAgICAgbWV0YWRhdGFSZWdpc3RyeTogcGFyYW1zPy5tZXRhZGF0YSA/PyBnbG9iYWxSZWdpc3RyeSxcclxuICAgICAgICB0YXJnZXQsXHJcbiAgICAgICAgdW5yZXByZXNlbnRhYmxlOiBwYXJhbXM/LnVucmVwcmVzZW50YWJsZSA/PyBcInRocm93XCIsXHJcbiAgICAgICAgb3ZlcnJpZGU6IHBhcmFtcz8ub3ZlcnJpZGUgPz8gKCgpID0+IHsgfSksXHJcbiAgICAgICAgaW86IHBhcmFtcz8uaW8gPz8gXCJvdXRwdXRcIixcclxuICAgICAgICBjb3VudGVyOiAwLFxyXG4gICAgICAgIHNlZW46IG5ldyBNYXAoKSxcclxuICAgICAgICBjeWNsZXM6IHBhcmFtcz8uY3ljbGVzID8/IFwicmVmXCIsXHJcbiAgICAgICAgcmV1c2VkOiBwYXJhbXM/LnJldXNlZCA/PyBcImlubGluZVwiLFxyXG4gICAgICAgIGV4dGVybmFsOiBwYXJhbXM/LmV4dGVybmFsID8/IHVuZGVmaW5lZCxcclxuICAgIH07XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3Moc2NoZW1hLCBjdHgsIF9wYXJhbXMgPSB7IHBhdGg6IFtdLCBzY2hlbWFQYXRoOiBbXSB9KSB7XHJcbiAgICB2YXIgX2E7XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICAvLyBjaGVjayBmb3Igc2NoZW1hIGluIHNlZW5zXHJcbiAgICBjb25zdCBzZWVuID0gY3R4LnNlZW4uZ2V0KHNjaGVtYSk7XHJcbiAgICBpZiAoc2Vlbikge1xyXG4gICAgICAgIHNlZW4uY291bnQrKztcclxuICAgICAgICAvLyBjaGVjayBpZiBjeWNsZVxyXG4gICAgICAgIGNvbnN0IGlzQ3ljbGUgPSBfcGFyYW1zLnNjaGVtYVBhdGguaW5jbHVkZXMoc2NoZW1hKTtcclxuICAgICAgICBpZiAoaXNDeWNsZSkge1xyXG4gICAgICAgICAgICBzZWVuLmN5Y2xlID0gX3BhcmFtcy5wYXRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2Vlbi5zY2hlbWE7XHJcbiAgICB9XHJcbiAgICAvLyBpbml0aWFsaXplXHJcbiAgICBjb25zdCByZXN1bHQgPSB7IHNjaGVtYToge30sIGNvdW50OiAxLCBjeWNsZTogdW5kZWZpbmVkLCBwYXRoOiBfcGFyYW1zLnBhdGggfTtcclxuICAgIGN0eC5zZWVuLnNldChzY2hlbWEsIHJlc3VsdCk7XHJcbiAgICAvLyBjdXN0b20gbWV0aG9kIG92ZXJyaWRlcyBkZWZhdWx0IGJlaGF2aW9yXHJcbiAgICBjb25zdCBvdmVycmlkZVNjaGVtYSA9IHNjaGVtYS5fem9kLnRvSlNPTlNjaGVtYT8uKCk7XHJcbiAgICBpZiAob3ZlcnJpZGVTY2hlbWEpIHtcclxuICAgICAgICByZXN1bHQuc2NoZW1hID0gb3ZlcnJpZGVTY2hlbWE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjb25zdCBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIC4uLl9wYXJhbXMsXHJcbiAgICAgICAgICAgIHNjaGVtYVBhdGg6IFsuLi5fcGFyYW1zLnNjaGVtYVBhdGgsIHNjaGVtYV0sXHJcbiAgICAgICAgICAgIHBhdGg6IF9wYXJhbXMucGF0aCxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChzY2hlbWEuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSkge1xyXG4gICAgICAgICAgICBzY2hlbWEuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYShjdHgsIHJlc3VsdC5zY2hlbWEsIHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBfanNvbiA9IHJlc3VsdC5zY2hlbWE7XHJcbiAgICAgICAgICAgIGNvbnN0IHByb2Nlc3NvciA9IGN0eC5wcm9jZXNzb3JzW2RlZi50eXBlXTtcclxuICAgICAgICAgICAgaWYgKCFwcm9jZXNzb3IpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgW3RvSlNPTlNjaGVtYV06IE5vbi1yZXByZXNlbnRhYmxlIHR5cGUgZW5jb3VudGVyZWQ6ICR7ZGVmLnR5cGV9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcHJvY2Vzc29yKHNjaGVtYSwgY3R4LCBfanNvbiwgcGFyYW1zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcGFyZW50ID0gc2NoZW1hLl96b2QucGFyZW50O1xyXG4gICAgICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICAgICAgLy8gQWxzbyBzZXQgcmVmIGlmIHByb2Nlc3NvciBkaWRuJ3QgKGZvciBpbmhlcml0YW5jZSlcclxuICAgICAgICAgICAgaWYgKCFyZXN1bHQucmVmKVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnJlZiA9IHBhcmVudDtcclxuICAgICAgICAgICAgcHJvY2VzcyhwYXJlbnQsIGN0eCwgcGFyYW1zKTtcclxuICAgICAgICAgICAgY3R4LnNlZW4uZ2V0KHBhcmVudCkuaXNQYXJlbnQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIG1ldGFkYXRhXHJcbiAgICBjb25zdCBtZXRhID0gY3R4Lm1ldGFkYXRhUmVnaXN0cnkuZ2V0KHNjaGVtYSk7XHJcbiAgICBpZiAobWV0YSlcclxuICAgICAgICBPYmplY3QuYXNzaWduKHJlc3VsdC5zY2hlbWEsIG1ldGEpO1xyXG4gICAgaWYgKGN0eC5pbyA9PT0gXCJpbnB1dFwiICYmIGlzVHJhbnNmb3JtaW5nKHNjaGVtYSkpIHtcclxuICAgICAgICAvLyBleGFtcGxlcy9kZWZhdWx0cyBvbmx5IGFwcGx5IHRvIG91dHB1dCB0eXBlIG9mIHBpcGVcclxuICAgICAgICBkZWxldGUgcmVzdWx0LnNjaGVtYS5leGFtcGxlcztcclxuICAgICAgICBkZWxldGUgcmVzdWx0LnNjaGVtYS5kZWZhdWx0O1xyXG4gICAgfVxyXG4gICAgLy8gc2V0IHByZWZhdWx0IGFzIGRlZmF1bHRcclxuICAgIGlmIChjdHguaW8gPT09IFwiaW5wdXRcIiAmJiBcIl9wcmVmYXVsdFwiIGluIHJlc3VsdC5zY2hlbWEpXHJcbiAgICAgICAgKF9hID0gcmVzdWx0LnNjaGVtYSkuZGVmYXVsdCA/PyAoX2EuZGVmYXVsdCA9IHJlc3VsdC5zY2hlbWEuX3ByZWZhdWx0KTtcclxuICAgIGRlbGV0ZSByZXN1bHQuc2NoZW1hLl9wcmVmYXVsdDtcclxuICAgIC8vIHB1bGxpbmcgZnJlc2ggZnJvbSBjdHguc2VlbiBpbiBjYXNlIGl0IHdhcyBvdmVyd3JpdHRlblxyXG4gICAgY29uc3QgX3Jlc3VsdCA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xyXG4gICAgcmV0dXJuIF9yZXN1bHQuc2NoZW1hO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0RGVmcyhjdHgsIHNjaGVtYVxyXG4vLyBwYXJhbXM6IEVtaXRQYXJhbXNcclxuKSB7XHJcbiAgICAvLyBpdGVyYXRlIG92ZXIgc2VlbiBtYXA7XHJcbiAgICBjb25zdCByb290ID0gY3R4LnNlZW4uZ2V0KHNjaGVtYSk7XHJcbiAgICBpZiAoIXJvb3QpXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5wcm9jZXNzZWQgc2NoZW1hLiBUaGlzIGlzIGEgYnVnIGluIFpvZC5cIik7XHJcbiAgICAvLyBUcmFjayBpZHMgdG8gZGV0ZWN0IGR1cGxpY2F0ZXMgYWNyb3NzIGRpZmZlcmVudCBzY2hlbWFzXHJcbiAgICBjb25zdCBpZFRvU2NoZW1hID0gbmV3IE1hcCgpO1xyXG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiBjdHguc2Vlbi5lbnRyaWVzKCkpIHtcclxuICAgICAgICBjb25zdCBpZCA9IGN0eC5tZXRhZGF0YVJlZ2lzdHJ5LmdldChlbnRyeVswXSk/LmlkO1xyXG4gICAgICAgIGlmIChpZCkge1xyXG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGlkVG9TY2hlbWEuZ2V0KGlkKTtcclxuICAgICAgICAgICAgaWYgKGV4aXN0aW5nICYmIGV4aXN0aW5nICE9PSBlbnRyeVswXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEdXBsaWNhdGUgc2NoZW1hIGlkIFwiJHtpZH1cIiBkZXRlY3RlZCBkdXJpbmcgSlNPTiBTY2hlbWEgY29udmVyc2lvbi4gVHdvIGRpZmZlcmVudCBzY2hlbWFzIGNhbm5vdCBzaGFyZSB0aGUgc2FtZSBpZCB3aGVuIGNvbnZlcnRlZCB0b2dldGhlci5gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZFRvU2NoZW1hLnNldChpZCwgZW50cnlbMF0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHJldHVybnMgYSByZWYgdG8gdGhlIHNjaGVtYVxyXG4gICAgLy8gZGVmSWQgd2lsbCBiZSBlbXB0eSBpZiB0aGUgcmVmIHBvaW50cyB0byBhbiBleHRlcm5hbCBzY2hlbWEgKG9yICMpXHJcbiAgICBjb25zdCBtYWtlVVJJID0gKGVudHJ5KSA9PiB7XHJcbiAgICAgICAgLy8gY29tcGFyaW5nIHRoZSBzZWVuIG9iamVjdHMgYmVjYXVzZSBzb21ldGltZXNcclxuICAgICAgICAvLyBtdWx0aXBsZSBzY2hlbWFzIG1hcCB0byB0aGUgc2FtZSBzZWVuIG9iamVjdC5cclxuICAgICAgICAvLyBlLmcuIGxhenlcclxuICAgICAgICAvLyBleHRlcm5hbCBpcyBjb25maWd1cmVkXHJcbiAgICAgICAgY29uc3QgZGVmc1NlZ21lbnQgPSBjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTIwMjAtMTJcIiA/IFwiJGRlZnNcIiA6IFwiZGVmaW5pdGlvbnNcIjtcclxuICAgICAgICBpZiAoY3R4LmV4dGVybmFsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV4dGVybmFsSWQgPSBjdHguZXh0ZXJuYWwucmVnaXN0cnkuZ2V0KGVudHJ5WzBdKT8uaWQ7IC8vID8/IFwiX19zaGFyZWRcIjsvLyBgX19zY2hlbWEke2N0eC5jb3VudGVyKyt9YDtcclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgc2NoZW1hIGlzIGluIHRoZSBleHRlcm5hbCByZWdpc3RyeVxyXG4gICAgICAgICAgICBjb25zdCB1cmlHZW5lcmF0b3IgPSBjdHguZXh0ZXJuYWwudXJpID8/ICgoaWQpID0+IGlkKTtcclxuICAgICAgICAgICAgaWYgKGV4dGVybmFsSWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IHJlZjogdXJpR2VuZXJhdG9yKGV4dGVybmFsSWQpIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBhZGQgdG8gX19zaGFyZWRcclxuICAgICAgICAgICAgY29uc3QgaWQgPSBlbnRyeVsxXS5kZWZJZCA/PyBlbnRyeVsxXS5zY2hlbWEuaWQgPz8gYHNjaGVtYSR7Y3R4LmNvdW50ZXIrK31gO1xyXG4gICAgICAgICAgICBlbnRyeVsxXS5kZWZJZCA9IGlkOyAvLyBzZXQgZGVmSWQgc28gaXQgd2lsbCBiZSByZXVzZWQgaWYgbmVlZGVkXHJcbiAgICAgICAgICAgIHJldHVybiB7IGRlZklkOiBpZCwgcmVmOiBgJHt1cmlHZW5lcmF0b3IoXCJfX3NoYXJlZFwiKX0jLyR7ZGVmc1NlZ21lbnR9LyR7aWR9YCB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZW50cnlbMV0gPT09IHJvb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgcmVmOiBcIiNcIiB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzZWxmLWNvbnRhaW5lZCBzY2hlbWFcclxuICAgICAgICBjb25zdCB1cmlQcmVmaXggPSBgI2A7XHJcbiAgICAgICAgY29uc3QgZGVmVXJpUHJlZml4ID0gYCR7dXJpUHJlZml4fS8ke2RlZnNTZWdtZW50fS9gO1xyXG4gICAgICAgIGNvbnN0IGRlZklkID0gZW50cnlbMV0uc2NoZW1hLmlkID8/IGBfX3NjaGVtYSR7Y3R4LmNvdW50ZXIrK31gO1xyXG4gICAgICAgIHJldHVybiB7IGRlZklkLCByZWY6IGRlZlVyaVByZWZpeCArIGRlZklkIH07XHJcbiAgICB9O1xyXG4gICAgLy8gc3RvcmVkIGNhY2hlZCB2ZXJzaW9uIGluIGBkZWZgIHByb3BlcnR5XHJcbiAgICAvLyByZW1vdmUgYWxsIHByb3BlcnRpZXMsIHNldCAkcmVmXHJcbiAgICBjb25zdCBleHRyYWN0VG9EZWYgPSAoZW50cnkpID0+IHtcclxuICAgICAgICAvLyBpZiB0aGUgc2NoZW1hIGlzIGFscmVhZHkgYSByZWZlcmVuY2UsIGRvIG5vdCBleHRyYWN0IGl0XHJcbiAgICAgICAgaWYgKGVudHJ5WzFdLnNjaGVtYS4kcmVmKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc2VlbiA9IGVudHJ5WzFdO1xyXG4gICAgICAgIGNvbnN0IHsgcmVmLCBkZWZJZCB9ID0gbWFrZVVSSShlbnRyeSk7XHJcbiAgICAgICAgc2Vlbi5kZWYgPSB7IC4uLnNlZW4uc2NoZW1hIH07XHJcbiAgICAgICAgLy8gZGVmSWQgd29uJ3QgYmUgc2V0IGlmIHRoZSBzY2hlbWEgaXMgYSByZWZlcmVuY2UgdG8gYW4gZXh0ZXJuYWwgc2NoZW1hXHJcbiAgICAgICAgLy8gb3IgaWYgdGhlIHNjaGVtYSBpcyB0aGUgcm9vdCBzY2hlbWFcclxuICAgICAgICBpZiAoZGVmSWQpXHJcbiAgICAgICAgICAgIHNlZW4uZGVmSWQgPSBkZWZJZDtcclxuICAgICAgICAvLyB3aXBlIGF3YXkgYWxsIHByb3BlcnRpZXMgZXhjZXB0ICRyZWZcclxuICAgICAgICBjb25zdCBzY2hlbWEgPSBzZWVuLnNjaGVtYTtcclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzY2hlbWEpIHtcclxuICAgICAgICAgICAgZGVsZXRlIHNjaGVtYVtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzY2hlbWEuJHJlZiA9IHJlZjtcclxuICAgIH07XHJcbiAgICAvLyB0aHJvdyBvbiBjeWNsZXNcclxuICAgIC8vIGJyZWFrIGN5Y2xlc1xyXG4gICAgaWYgKGN0eC5jeWNsZXMgPT09IFwidGhyb3dcIikge1xyXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgY3R4LnNlZW4uZW50cmllcygpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNlZW4gPSBlbnRyeVsxXTtcclxuICAgICAgICAgICAgaWYgKHNlZW4uY3ljbGUpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkN5Y2xlIGRldGVjdGVkOiBcIiArXHJcbiAgICAgICAgICAgICAgICAgICAgYCMvJHtzZWVuLmN5Y2xlPy5qb2luKFwiL1wiKX0vPHJvb3Q+YCArXHJcbiAgICAgICAgICAgICAgICAgICAgJ1xcblxcblNldCB0aGUgYGN5Y2xlc2AgcGFyYW1ldGVyIHRvIGBcInJlZlwiYCB0byByZXNvbHZlIGN5Y2xpY2FsIHNjaGVtYXMgd2l0aCBkZWZzLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gZXh0cmFjdCBzY2hlbWFzIGludG8gJGRlZnNcclxuICAgIGZvciAoY29uc3QgZW50cnkgb2YgY3R4LnNlZW4uZW50cmllcygpKSB7XHJcbiAgICAgICAgY29uc3Qgc2VlbiA9IGVudHJ5WzFdO1xyXG4gICAgICAgIC8vIGNvbnZlcnQgcm9vdCBzY2hlbWEgdG8gIyAkcmVmXHJcbiAgICAgICAgaWYgKHNjaGVtYSA9PT0gZW50cnlbMF0pIHtcclxuICAgICAgICAgICAgZXh0cmFjdFRvRGVmKGVudHJ5KTsgLy8gdGhpcyBoYXMgc3BlY2lhbCBoYW5kbGluZyBmb3IgdGhlIHJvb3Qgc2NoZW1hXHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBleHRyYWN0IHNjaGVtYXMgdGhhdCBhcmUgaW4gdGhlIGV4dGVybmFsIHJlZ2lzdHJ5XHJcbiAgICAgICAgaWYgKGN0eC5leHRlcm5hbCkge1xyXG4gICAgICAgICAgICBjb25zdCBleHQgPSBjdHguZXh0ZXJuYWwucmVnaXN0cnkuZ2V0KGVudHJ5WzBdKT8uaWQ7XHJcbiAgICAgICAgICAgIGlmIChzY2hlbWEgIT09IGVudHJ5WzBdICYmIGV4dCkge1xyXG4gICAgICAgICAgICAgICAgZXh0cmFjdFRvRGVmKGVudHJ5KTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGV4dHJhY3Qgc2NoZW1hcyB3aXRoIGBpZGAgbWV0YVxyXG4gICAgICAgIGNvbnN0IGlkID0gY3R4Lm1ldGFkYXRhUmVnaXN0cnkuZ2V0KGVudHJ5WzBdKT8uaWQ7XHJcbiAgICAgICAgaWYgKGlkKSB7XHJcbiAgICAgICAgICAgIGV4dHJhY3RUb0RlZihlbnRyeSk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBicmVhayBjeWNsZXNcclxuICAgICAgICBpZiAoc2Vlbi5jeWNsZSkge1xyXG4gICAgICAgICAgICAvLyBhbnlcclxuICAgICAgICAgICAgZXh0cmFjdFRvRGVmKGVudHJ5KTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGV4dHJhY3QgcmV1c2VkIHNjaGVtYXNcclxuICAgICAgICBpZiAoc2Vlbi5jb3VudCA+IDEpIHtcclxuICAgICAgICAgICAgaWYgKGN0eC5yZXVzZWQgPT09IFwicmVmXCIpIHtcclxuICAgICAgICAgICAgICAgIGV4dHJhY3RUb0RlZihlbnRyeSk7XHJcbiAgICAgICAgICAgICAgICAvLyBiaW9tZS1pZ25vcmUgbGludDpcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5hbGl6ZShjdHgsIHNjaGVtYSkge1xyXG4gICAgY29uc3Qgcm9vdCA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xyXG4gICAgaWYgKCFyb290KVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVucHJvY2Vzc2VkIHNjaGVtYS4gVGhpcyBpcyBhIGJ1ZyBpbiBab2QuXCIpO1xyXG4gICAgLy8gZmxhdHRlbiByZWZzIC0gaW5oZXJpdCBwcm9wZXJ0aWVzIGZyb20gcGFyZW50IHNjaGVtYXNcclxuICAgIGNvbnN0IGZsYXR0ZW5SZWYgPSAoem9kU2NoZW1hKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldCh6b2RTY2hlbWEpO1xyXG4gICAgICAgIC8vIGFscmVhZHkgcHJvY2Vzc2VkXHJcbiAgICAgICAgaWYgKHNlZW4ucmVmID09PSBudWxsKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgc2NoZW1hID0gc2Vlbi5kZWYgPz8gc2Vlbi5zY2hlbWE7XHJcbiAgICAgICAgY29uc3QgX2NhY2hlZCA9IHsgLi4uc2NoZW1hIH07XHJcbiAgICAgICAgY29uc3QgcmVmID0gc2Vlbi5yZWY7XHJcbiAgICAgICAgc2Vlbi5yZWYgPSBudWxsOyAvLyBwcmV2ZW50IGluZmluaXRlIHJlY3Vyc2lvblxyXG4gICAgICAgIGlmIChyZWYpIHtcclxuICAgICAgICAgICAgZmxhdHRlblJlZihyZWYpO1xyXG4gICAgICAgICAgICBjb25zdCByZWZTZWVuID0gY3R4LnNlZW4uZ2V0KHJlZik7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlZlNjaGVtYSA9IHJlZlNlZW4uc2NoZW1hO1xyXG4gICAgICAgICAgICAvLyBtZXJnZSByZWZlcmVuY2VkIHNjaGVtYSBpbnRvIGN1cnJlbnRcclxuICAgICAgICAgICAgaWYgKHJlZlNjaGVtYS4kcmVmICYmIChjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTA3XCIgfHwgY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0wNFwiIHx8IGN0eC50YXJnZXQgPT09IFwib3BlbmFwaS0zLjBcIikpIHtcclxuICAgICAgICAgICAgICAgIC8vIG9sZGVyIGRyYWZ0cyBjYW4ndCBjb21iaW5lICRyZWYgd2l0aCBvdGhlciBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgICAgICBzY2hlbWEuYWxsT2YgPSBzY2hlbWEuYWxsT2YgPz8gW107XHJcbiAgICAgICAgICAgICAgICBzY2hlbWEuYWxsT2YucHVzaChyZWZTY2hlbWEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihzY2hlbWEsIHJlZlNjaGVtYSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gcmVzdG9yZSBjaGlsZCdzIG93biBwcm9wZXJ0aWVzIChjaGlsZCB3aW5zKVxyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHNjaGVtYSwgX2NhY2hlZCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzUGFyZW50UmVmID0gem9kU2NoZW1hLl96b2QucGFyZW50ID09PSByZWY7XHJcbiAgICAgICAgICAgIC8vIEZvciBwYXJlbnQgY2hhaW4sIGNoaWxkIGlzIGEgcmVmaW5lbWVudCAtIHJlbW92ZSBwYXJlbnQtb25seSBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICAgIGlmIChpc1BhcmVudFJlZikge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc2NoZW1hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gXCIkcmVmXCIgfHwga2V5ID09PSBcImFsbE9mXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKGtleSBpbiBfY2FjaGVkKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgc2NoZW1hW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFdoZW4gcmVmIHdhcyBleHRyYWN0ZWQgdG8gJGRlZnMsIHJlbW92ZSBwcm9wZXJ0aWVzIHRoYXQgbWF0Y2ggdGhlIGRlZmluaXRpb25cclxuICAgICAgICAgICAgaWYgKHJlZlNjaGVtYS4kcmVmICYmIHJlZlNlZW4uZGVmKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzY2hlbWEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBcIiRyZWZcIiB8fCBrZXkgPT09IFwiYWxsT2ZcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSBpbiByZWZTZWVuLmRlZiAmJiBKU09OLnN0cmluZ2lmeShzY2hlbWFba2V5XSkgPT09IEpTT04uc3RyaW5naWZ5KHJlZlNlZW4uZGVmW2tleV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBzY2hlbWFba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gSWYgcGFyZW50IHdhcyBleHRyYWN0ZWQgKGhhcyAkcmVmKSwgcHJvcGFnYXRlICRyZWYgdG8gdGhpcyBzY2hlbWFcclxuICAgICAgICAvLyBUaGlzIGhhbmRsZXMgY2FzZXMgbGlrZTogcmVhZG9ubHkoKS5tZXRhKHtpZH0pLmRlc2NyaWJlKClcclxuICAgICAgICAvLyB3aGVyZSBwcm9jZXNzb3Igc2V0cyByZWYgdG8gaW5uZXJUeXBlIGJ1dCBwYXJlbnQgc2hvdWxkIGJlIHJlZmVyZW5jZWRcclxuICAgICAgICBjb25zdCBwYXJlbnQgPSB6b2RTY2hlbWEuX3pvZC5wYXJlbnQ7XHJcbiAgICAgICAgaWYgKHBhcmVudCAmJiBwYXJlbnQgIT09IHJlZikge1xyXG4gICAgICAgICAgICAvLyBFbnN1cmUgcGFyZW50IGlzIHByb2Nlc3NlZCBmaXJzdCBzbyBpdHMgZGVmIGhhcyBpbmhlcml0ZWQgcHJvcGVydGllc1xyXG4gICAgICAgICAgICBmbGF0dGVuUmVmKHBhcmVudCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudFNlZW4gPSBjdHguc2Vlbi5nZXQocGFyZW50KTtcclxuICAgICAgICAgICAgaWYgKHBhcmVudFNlZW4/LnNjaGVtYS4kcmVmKSB7XHJcbiAgICAgICAgICAgICAgICBzY2hlbWEuJHJlZiA9IHBhcmVudFNlZW4uc2NoZW1hLiRyZWY7XHJcbiAgICAgICAgICAgICAgICAvLyBEZS1kdXBsaWNhdGUgd2l0aCBwYXJlbnQncyBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50U2Vlbi5kZWYpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBzY2hlbWEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gXCIkcmVmXCIgfHwga2V5ID09PSBcImFsbE9mXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGtleSBpbiBwYXJlbnRTZWVuLmRlZiAmJiBKU09OLnN0cmluZ2lmeShzY2hlbWFba2V5XSkgPT09IEpTT04uc3RyaW5naWZ5KHBhcmVudFNlZW4uZGVmW2tleV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgc2NoZW1hW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZXhlY3V0ZSBvdmVycmlkZXNcclxuICAgICAgICBjdHgub3ZlcnJpZGUoe1xyXG4gICAgICAgICAgICB6b2RTY2hlbWE6IHpvZFNjaGVtYSxcclxuICAgICAgICAgICAganNvblNjaGVtYTogc2NoZW1hLFxyXG4gICAgICAgICAgICBwYXRoOiBzZWVuLnBhdGggPz8gW10sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiBbLi4uY3R4LnNlZW4uZW50cmllcygpXS5yZXZlcnNlKCkpIHtcclxuICAgICAgICBmbGF0dGVuUmVmKGVudHJ5WzBdKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMjAyMC0xMlwiKSB7XHJcbiAgICAgICAgcmVzdWx0LiRzY2hlbWEgPSBcImh0dHBzOi8vanNvbi1zY2hlbWEub3JnL2RyYWZ0LzIwMjAtMTIvc2NoZW1hXCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTA3XCIpIHtcclxuICAgICAgICByZXN1bHQuJHNjaGVtYSA9IFwiaHR0cDovL2pzb24tc2NoZW1hLm9yZy9kcmFmdC0wNy9zY2hlbWEjXCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTA0XCIpIHtcclxuICAgICAgICByZXN1bHQuJHNjaGVtYSA9IFwiaHR0cDovL2pzb24tc2NoZW1hLm9yZy9kcmFmdC0wNC9zY2hlbWEjXCI7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdHgudGFyZ2V0ID09PSBcIm9wZW5hcGktMy4wXCIpIHtcclxuICAgICAgICAvLyBPcGVuQVBJIDMuMCBzY2hlbWEgb2JqZWN0cyBzaG91bGQgbm90IGluY2x1ZGUgYSAkc2NoZW1hIHByb3BlcnR5XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvLyBBcmJpdHJhcnkgc3RyaW5nIHZhbHVlcyBhcmUgYWxsb3dlZCBidXQgd29uJ3QgaGF2ZSBhICRzY2hlbWEgcHJvcGVydHkgc2V0XHJcbiAgICB9XHJcbiAgICBpZiAoY3R4LmV4dGVybmFsPy51cmkpIHtcclxuICAgICAgICBjb25zdCBpZCA9IGN0eC5leHRlcm5hbC5yZWdpc3RyeS5nZXQoc2NoZW1hKT8uaWQ7XHJcbiAgICAgICAgaWYgKCFpZClcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2NoZW1hIGlzIG1pc3NpbmcgYW4gYGlkYCBwcm9wZXJ0eVwiKTtcclxuICAgICAgICByZXN1bHQuJGlkID0gY3R4LmV4dGVybmFsLnVyaShpZCk7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuYXNzaWduKHJlc3VsdCwgcm9vdC5kZWYgPz8gcm9vdC5zY2hlbWEpO1xyXG4gICAgLy8gVGhlIGBpZGAgaW4gYC5tZXRhKClgIGlzIGEgWm9kLXNwZWNpZmljIHJlZ2lzdHJhdGlvbiB0YWcgdXNlZCB0byBleHRyYWN0XHJcbiAgICAvLyBzY2hlbWFzIGludG8gJGRlZnMg4oCUIGl0IGlzIG5vdCB1c2VyLWZhY2luZyBKU09OIFNjaGVtYSBtZXRhZGF0YS4gU3RyaXAgaXRcclxuICAgIC8vIGZyb20gdGhlIG91dHB1dCBib2R5IHdoZXJlIGl0IHdvdWxkIG90aGVyd2lzZSBsZWFrLiBUaGUgaWQgaXMgcHJlc2VydmVkXHJcbiAgICAvLyBpbXBsaWNpdGx5IHZpYSB0aGUgJGRlZnMga2V5IChhbmQgdmlhICRyZWYgcGF0aHMpLlxyXG4gICAgY29uc3Qgcm9vdE1ldGFJZCA9IGN0eC5tZXRhZGF0YVJlZ2lzdHJ5LmdldChzY2hlbWEpPy5pZDtcclxuICAgIGlmIChyb290TWV0YUlkICE9PSB1bmRlZmluZWQgJiYgcmVzdWx0LmlkID09PSByb290TWV0YUlkKVxyXG4gICAgICAgIGRlbGV0ZSByZXN1bHQuaWQ7XHJcbiAgICAvLyBidWlsZCBkZWZzIG9iamVjdFxyXG4gICAgY29uc3QgZGVmcyA9IGN0eC5leHRlcm5hbD8uZGVmcyA/PyB7fTtcclxuICAgIGZvciAoY29uc3QgZW50cnkgb2YgY3R4LnNlZW4uZW50cmllcygpKSB7XHJcbiAgICAgICAgY29uc3Qgc2VlbiA9IGVudHJ5WzFdO1xyXG4gICAgICAgIGlmIChzZWVuLmRlZiAmJiBzZWVuLmRlZklkKSB7XHJcbiAgICAgICAgICAgIGlmIChzZWVuLmRlZi5pZCA9PT0gc2Vlbi5kZWZJZClcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBzZWVuLmRlZi5pZDtcclxuICAgICAgICAgICAgZGVmc1tzZWVuLmRlZklkXSA9IHNlZW4uZGVmO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIHNldCBkZWZpbml0aW9ucyBpbiByZXN1bHRcclxuICAgIGlmIChjdHguZXh0ZXJuYWwpIHtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhkZWZzKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGlmIChjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTIwMjAtMTJcIikge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LiRkZWZzID0gZGVmcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5kZWZpbml0aW9ucyA9IGRlZnM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIHRoaXMgXCJmaW5hbGl6ZXNcIiB0aGlzIHNjaGVtYSBhbmQgZW5zdXJlcyBhbGwgY3ljbGVzIGFyZSByZW1vdmVkXHJcbiAgICAgICAgLy8gZWFjaCBjYWxsIHRvIGZpbmFsaXplKCkgaXMgZnVuY3Rpb25hbGx5IGluZGVwZW5kZW50XHJcbiAgICAgICAgLy8gdGhvdWdoIHRoZSBzZWVuIG1hcCBpcyBzaGFyZWRcclxuICAgICAgICBjb25zdCBmaW5hbGl6ZWQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHJlc3VsdCkpO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmaW5hbGl6ZWQsIFwifnN0YW5kYXJkXCIsIHtcclxuICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIC4uLnNjaGVtYVtcIn5zdGFuZGFyZFwiXSxcclxuICAgICAgICAgICAgICAgIGpzb25TY2hlbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dDogY3JlYXRlU3RhbmRhcmRKU09OU2NoZW1hTWV0aG9kKHNjaGVtYSwgXCJpbnB1dFwiLCBjdHgucHJvY2Vzc29ycyksXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiBjcmVhdGVTdGFuZGFyZEpTT05TY2hlbWFNZXRob2Qoc2NoZW1hLCBcIm91dHB1dFwiLCBjdHgucHJvY2Vzc29ycyksXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmaW5hbGl6ZWQ7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoX2Vycikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIGNvbnZlcnRpbmcgc2NoZW1hIHRvIEpTT04uXCIpO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGlzVHJhbnNmb3JtaW5nKF9zY2hlbWEsIF9jdHgpIHtcclxuICAgIGNvbnN0IGN0eCA9IF9jdHggPz8geyBzZWVuOiBuZXcgU2V0KCkgfTtcclxuICAgIGlmIChjdHguc2Vlbi5oYXMoX3NjaGVtYSkpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgY3R4LnNlZW4uYWRkKF9zY2hlbWEpO1xyXG4gICAgY29uc3QgZGVmID0gX3NjaGVtYS5fem9kLmRlZjtcclxuICAgIGlmIChkZWYudHlwZSA9PT0gXCJ0cmFuc2Zvcm1cIilcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIGlmIChkZWYudHlwZSA9PT0gXCJhcnJheVwiKVxyXG4gICAgICAgIHJldHVybiBpc1RyYW5zZm9ybWluZyhkZWYuZWxlbWVudCwgY3R4KTtcclxuICAgIGlmIChkZWYudHlwZSA9PT0gXCJzZXRcIilcclxuICAgICAgICByZXR1cm4gaXNUcmFuc2Zvcm1pbmcoZGVmLnZhbHVlVHlwZSwgY3R4KTtcclxuICAgIGlmIChkZWYudHlwZSA9PT0gXCJsYXp5XCIpXHJcbiAgICAgICAgcmV0dXJuIGlzVHJhbnNmb3JtaW5nKGRlZi5nZXR0ZXIoKSwgY3R4KTtcclxuICAgIGlmIChkZWYudHlwZSA9PT0gXCJwcm9taXNlXCIgfHxcclxuICAgICAgICBkZWYudHlwZSA9PT0gXCJvcHRpb25hbFwiIHx8XHJcbiAgICAgICAgZGVmLnR5cGUgPT09IFwibm9ub3B0aW9uYWxcIiB8fFxyXG4gICAgICAgIGRlZi50eXBlID09PSBcIm51bGxhYmxlXCIgfHxcclxuICAgICAgICBkZWYudHlwZSA9PT0gXCJyZWFkb25seVwiIHx8XHJcbiAgICAgICAgZGVmLnR5cGUgPT09IFwiZGVmYXVsdFwiIHx8XHJcbiAgICAgICAgZGVmLnR5cGUgPT09IFwicHJlZmF1bHRcIikge1xyXG4gICAgICAgIHJldHVybiBpc1RyYW5zZm9ybWluZyhkZWYuaW5uZXJUeXBlLCBjdHgpO1xyXG4gICAgfVxyXG4gICAgaWYgKGRlZi50eXBlID09PSBcImludGVyc2VjdGlvblwiKSB7XHJcbiAgICAgICAgcmV0dXJuIGlzVHJhbnNmb3JtaW5nKGRlZi5sZWZ0LCBjdHgpIHx8IGlzVHJhbnNmb3JtaW5nKGRlZi5yaWdodCwgY3R4KTtcclxuICAgIH1cclxuICAgIGlmIChkZWYudHlwZSA9PT0gXCJyZWNvcmRcIiB8fCBkZWYudHlwZSA9PT0gXCJtYXBcIikge1xyXG4gICAgICAgIHJldHVybiBpc1RyYW5zZm9ybWluZyhkZWYua2V5VHlwZSwgY3R4KSB8fCBpc1RyYW5zZm9ybWluZyhkZWYudmFsdWVUeXBlLCBjdHgpO1xyXG4gICAgfVxyXG4gICAgaWYgKGRlZi50eXBlID09PSBcInBpcGVcIikge1xyXG4gICAgICAgIGlmIChfc2NoZW1hLl96b2QudHJhaXRzLmhhcyhcIiRab2RDb2RlY1wiKSlcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgcmV0dXJuIGlzVHJhbnNmb3JtaW5nKGRlZi5pbiwgY3R4KSB8fCBpc1RyYW5zZm9ybWluZyhkZWYub3V0LCBjdHgpO1xyXG4gICAgfVxyXG4gICAgaWYgKGRlZi50eXBlID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gZGVmLnNoYXBlKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1RyYW5zZm9ybWluZyhkZWYuc2hhcGVba2V5XSwgY3R4KSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBpZiAoZGVmLnR5cGUgPT09IFwidW5pb25cIikge1xyXG4gICAgICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIGRlZi5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1RyYW5zZm9ybWluZyhvcHRpb24sIGN0eCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGRlZi50eXBlID09PSBcInR1cGxlXCIpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgZGVmLml0ZW1zKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1RyYW5zZm9ybWluZyhpdGVtLCBjdHgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZWYucmVzdCAmJiBpc1RyYW5zZm9ybWluZyhkZWYucmVzdCwgY3R4KSlcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgdG9KU09OU2NoZW1hIG1ldGhvZCBmb3IgYSBzY2hlbWEgaW5zdGFuY2UuXHJcbiAqIFRoaXMgZW5jYXBzdWxhdGVzIHRoZSBsb2dpYyBvZiBpbml0aWFsaXppbmcgY29udGV4dCwgcHJvY2Vzc2luZywgZXh0cmFjdGluZyBkZWZzLCBhbmQgZmluYWxpemluZy5cclxuICovXHJcbmV4cG9ydCBjb25zdCBjcmVhdGVUb0pTT05TY2hlbWFNZXRob2QgPSAoc2NoZW1hLCBwcm9jZXNzb3JzID0ge30pID0+IChwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGN0eCA9IGluaXRpYWxpemVDb250ZXh0KHsgLi4ucGFyYW1zLCBwcm9jZXNzb3JzIH0pO1xyXG4gICAgcHJvY2VzcyhzY2hlbWEsIGN0eCk7XHJcbiAgICBleHRyYWN0RGVmcyhjdHgsIHNjaGVtYSk7XHJcbiAgICByZXR1cm4gZmluYWxpemUoY3R4LCBzY2hlbWEpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgY3JlYXRlU3RhbmRhcmRKU09OU2NoZW1hTWV0aG9kID0gKHNjaGVtYSwgaW8sIHByb2Nlc3NvcnMgPSB7fSkgPT4gKHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgeyBsaWJyYXJ5T3B0aW9ucywgdGFyZ2V0IH0gPSBwYXJhbXMgPz8ge307XHJcbiAgICBjb25zdCBjdHggPSBpbml0aWFsaXplQ29udGV4dCh7IC4uLihsaWJyYXJ5T3B0aW9ucyA/PyB7fSksIHRhcmdldCwgaW8sIHByb2Nlc3NvcnMgfSk7XHJcbiAgICBwcm9jZXNzKHNjaGVtYSwgY3R4KTtcclxuICAgIGV4dHJhY3REZWZzKGN0eCwgc2NoZW1hKTtcclxuICAgIHJldHVybiBmaW5hbGl6ZShjdHgsIHNjaGVtYSk7XHJcbn07XHJcbiIsImltcG9ydCB7IGV4dHJhY3REZWZzLCBmaW5hbGl6ZSwgaW5pdGlhbGl6ZUNvbnRleHQsIHByb2Nlc3MsIH0gZnJvbSBcIi4vdG8tanNvbi1zY2hlbWEuanNcIjtcclxuaW1wb3J0IHsgZ2V0RW51bVZhbHVlcyB9IGZyb20gXCIuL3V0aWwuanNcIjtcclxuY29uc3QgZm9ybWF0TWFwID0ge1xyXG4gICAgZ3VpZDogXCJ1dWlkXCIsXHJcbiAgICB1cmw6IFwidXJpXCIsXHJcbiAgICBkYXRldGltZTogXCJkYXRlLXRpbWVcIixcclxuICAgIGpzb25fc3RyaW5nOiBcImpzb24tc3RyaW5nXCIsXHJcbiAgICByZWdleDogXCJcIiwgLy8gZG8gbm90IHNldFxyXG59O1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PSBTSU1QTEUgVFlQRSBQUk9DRVNTT1JTID09PT09PT09PT09PT09PT09PT09XHJcbmV4cG9ydCBjb25zdCBzdHJpbmdQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBqc29uID0gX2pzb247XHJcbiAgICBqc29uLnR5cGUgPSBcInN0cmluZ1wiO1xyXG4gICAgY29uc3QgeyBtaW5pbXVtLCBtYXhpbXVtLCBmb3JtYXQsIHBhdHRlcm5zLCBjb250ZW50RW5jb2RpbmcgfSA9IHNjaGVtYS5fem9kXHJcbiAgICAgICAgLmJhZztcclxuICAgIGlmICh0eXBlb2YgbWluaW11bSA9PT0gXCJudW1iZXJcIilcclxuICAgICAgICBqc29uLm1pbkxlbmd0aCA9IG1pbmltdW07XHJcbiAgICBpZiAodHlwZW9mIG1heGltdW0gPT09IFwibnVtYmVyXCIpXHJcbiAgICAgICAganNvbi5tYXhMZW5ndGggPSBtYXhpbXVtO1xyXG4gICAgLy8gY3VzdG9tIHBhdHRlcm4gb3ZlcnJpZGVzIGZvcm1hdFxyXG4gICAgaWYgKGZvcm1hdCkge1xyXG4gICAgICAgIGpzb24uZm9ybWF0ID0gZm9ybWF0TWFwW2Zvcm1hdF0gPz8gZm9ybWF0O1xyXG4gICAgICAgIGlmIChqc29uLmZvcm1hdCA9PT0gXCJcIilcclxuICAgICAgICAgICAgZGVsZXRlIGpzb24uZm9ybWF0OyAvLyBlbXB0eSBmb3JtYXQgaXMgbm90IHZhbGlkXHJcbiAgICAgICAgLy8gSlNPTiBTY2hlbWEgZm9ybWF0OiBcInRpbWVcIiByZXF1aXJlcyBhIGZ1bGwgdGltZSB3aXRoIG9mZnNldCBvciBaXHJcbiAgICAgICAgLy8gei5pc28udGltZSgpIGRvZXMgbm90IGluY2x1ZGUgdGltZXpvbmUgaW5mb3JtYXRpb24sIHNvIGZvcm1hdDogXCJ0aW1lXCIgc2hvdWxkIG5ldmVyIGJlIHVzZWRcclxuICAgICAgICBpZiAoZm9ybWF0ID09PSBcInRpbWVcIikge1xyXG4gICAgICAgICAgICBkZWxldGUganNvbi5mb3JtYXQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGNvbnRlbnRFbmNvZGluZylcclxuICAgICAgICBqc29uLmNvbnRlbnRFbmNvZGluZyA9IGNvbnRlbnRFbmNvZGluZztcclxuICAgIGlmIChwYXR0ZXJucyAmJiBwYXR0ZXJucy5zaXplID4gMCkge1xyXG4gICAgICAgIGNvbnN0IHJlZ2V4ZXMgPSBbLi4ucGF0dGVybnNdO1xyXG4gICAgICAgIGlmIChyZWdleGVzLmxlbmd0aCA9PT0gMSlcclxuICAgICAgICAgICAganNvbi5wYXR0ZXJuID0gcmVnZXhlc1swXS5zb3VyY2U7XHJcbiAgICAgICAgZWxzZSBpZiAocmVnZXhlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGpzb24uYWxsT2YgPSBbXHJcbiAgICAgICAgICAgICAgICAuLi5yZWdleGVzLm1hcCgocmVnZXgpID0+ICh7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uKGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMDdcIiB8fCBjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTA0XCIgfHwgY3R4LnRhcmdldCA9PT0gXCJvcGVuYXBpLTMuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8geyB0eXBlOiBcInN0cmluZ1wiIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgOiB7fSksXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0dGVybjogcmVnZXguc291cmNlLFxyXG4gICAgICAgICAgICAgICAgfSkpLFxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IG51bWJlclByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGpzb24gPSBfanNvbjtcclxuICAgIGNvbnN0IHsgbWluaW11bSwgbWF4aW11bSwgZm9ybWF0LCBtdWx0aXBsZU9mLCBleGNsdXNpdmVNYXhpbXVtLCBleGNsdXNpdmVNaW5pbXVtIH0gPSBzY2hlbWEuX3pvZC5iYWc7XHJcbiAgICBpZiAodHlwZW9mIGZvcm1hdCA9PT0gXCJzdHJpbmdcIiAmJiBmb3JtYXQuaW5jbHVkZXMoXCJpbnRcIikpXHJcbiAgICAgICAganNvbi50eXBlID0gXCJpbnRlZ2VyXCI7XHJcbiAgICBlbHNlXHJcbiAgICAgICAganNvbi50eXBlID0gXCJudW1iZXJcIjtcclxuICAgIC8vIHdoZW4gYm90aCBtaW5pbXVtIGFuZCBleGNsdXNpdmVNaW5pbXVtIGV4aXN0LCBwaWNrIHRoZSBtb3JlIHJlc3RyaWN0aXZlIG9uZVxyXG4gICAgY29uc3QgZXhNaW4gPSB0eXBlb2YgZXhjbHVzaXZlTWluaW11bSA9PT0gXCJudW1iZXJcIiAmJiBleGNsdXNpdmVNaW5pbXVtID49IChtaW5pbXVtID8/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSk7XHJcbiAgICBjb25zdCBleE1heCA9IHR5cGVvZiBleGNsdXNpdmVNYXhpbXVtID09PSBcIm51bWJlclwiICYmIGV4Y2x1c2l2ZU1heGltdW0gPD0gKG1heGltdW0gPz8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKTtcclxuICAgIGNvbnN0IGxlZ2FjeSA9IGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMDRcIiB8fCBjdHgudGFyZ2V0ID09PSBcIm9wZW5hcGktMy4wXCI7XHJcbiAgICBpZiAoZXhNaW4pIHtcclxuICAgICAgICBpZiAobGVnYWN5KSB7XHJcbiAgICAgICAgICAgIGpzb24ubWluaW11bSA9IGV4Y2x1c2l2ZU1pbmltdW07XHJcbiAgICAgICAgICAgIGpzb24uZXhjbHVzaXZlTWluaW11bSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBqc29uLmV4Y2x1c2l2ZU1pbmltdW0gPSBleGNsdXNpdmVNaW5pbXVtO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHR5cGVvZiBtaW5pbXVtID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAganNvbi5taW5pbXVtID0gbWluaW11bTtcclxuICAgIH1cclxuICAgIGlmIChleE1heCkge1xyXG4gICAgICAgIGlmIChsZWdhY3kpIHtcclxuICAgICAgICAgICAganNvbi5tYXhpbXVtID0gZXhjbHVzaXZlTWF4aW11bTtcclxuICAgICAgICAgICAganNvbi5leGNsdXNpdmVNYXhpbXVtID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGpzb24uZXhjbHVzaXZlTWF4aW11bSA9IGV4Y2x1c2l2ZU1heGltdW07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodHlwZW9mIG1heGltdW0gPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICBqc29uLm1heGltdW0gPSBtYXhpbXVtO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBtdWx0aXBsZU9mID09PSBcIm51bWJlclwiKVxyXG4gICAgICAgIGpzb24ubXVsdGlwbGVPZiA9IG11bHRpcGxlT2Y7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBib29sZWFuUHJvY2Vzc29yID0gKF9zY2hlbWEsIF9jdHgsIGpzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIGpzb24udHlwZSA9IFwiYm9vbGVhblwiO1xyXG59O1xyXG5leHBvcnQgY29uc3QgYmlnaW50UHJvY2Vzc29yID0gKF9zY2hlbWEsIGN0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIGlmIChjdHgudW5yZXByZXNlbnRhYmxlID09PSBcInRocm93XCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCaWdJbnQgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xyXG4gICAgfVxyXG59O1xyXG5leHBvcnQgY29uc3Qgc3ltYm9sUHJvY2Vzc29yID0gKF9zY2hlbWEsIGN0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIGlmIChjdHgudW5yZXByZXNlbnRhYmxlID09PSBcInRocm93XCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTeW1ib2xzIGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IG51bGxQcm9jZXNzb3IgPSAoX3NjaGVtYSwgY3R4LCBqc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBpZiAoY3R4LnRhcmdldCA9PT0gXCJvcGVuYXBpLTMuMFwiKSB7XHJcbiAgICAgICAganNvbi50eXBlID0gXCJzdHJpbmdcIjtcclxuICAgICAgICBqc29uLm51bGxhYmxlID0gdHJ1ZTtcclxuICAgICAgICBqc29uLmVudW0gPSBbbnVsbF07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBqc29uLnR5cGUgPSBcIm51bGxcIjtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IHVuZGVmaW5lZFByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5kZWZpbmVkIGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IHZvaWRQcm9jZXNzb3IgPSAoX3NjaGVtYSwgY3R4LCBfanNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlZvaWQgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xyXG4gICAgfVxyXG59O1xyXG5leHBvcnQgY29uc3QgbmV2ZXJQcm9jZXNzb3IgPSAoX3NjaGVtYSwgX2N0eCwganNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAganNvbi5ub3QgPSB7fTtcclxufTtcclxuZXhwb3J0IGNvbnN0IGFueVByb2Nlc3NvciA9IChfc2NoZW1hLCBfY3R4LCBfanNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAgLy8gZW1wdHkgc2NoZW1hIGFjY2VwdHMgYW55dGhpbmdcclxufTtcclxuZXhwb3J0IGNvbnN0IHVua25vd25Qcm9jZXNzb3IgPSAoX3NjaGVtYSwgX2N0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIC8vIGVtcHR5IHNjaGVtYSBhY2NlcHRzIGFueXRoaW5nXHJcbn07XHJcbmV4cG9ydCBjb25zdCBkYXRlUHJvY2Vzc29yID0gKF9zY2hlbWEsIGN0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIGlmIChjdHgudW5yZXByZXNlbnRhYmxlID09PSBcInRocm93XCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEYXRlIGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IGVudW1Qcm9jZXNzb3IgPSAoc2NoZW1hLCBfY3R4LCBqc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBjb25zdCB2YWx1ZXMgPSBnZXRFbnVtVmFsdWVzKGRlZi5lbnRyaWVzKTtcclxuICAgIC8vIE51bWJlciBlbnVtcyBjYW4gaGF2ZSBib3RoIHN0cmluZyBhbmQgbnVtYmVyIHZhbHVlc1xyXG4gICAgaWYgKHZhbHVlcy5ldmVyeSgodikgPT4gdHlwZW9mIHYgPT09IFwibnVtYmVyXCIpKVxyXG4gICAgICAgIGpzb24udHlwZSA9IFwibnVtYmVyXCI7XHJcbiAgICBpZiAodmFsdWVzLmV2ZXJ5KCh2KSA9PiB0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIikpXHJcbiAgICAgICAganNvbi50eXBlID0gXCJzdHJpbmdcIjtcclxuICAgIGpzb24uZW51bSA9IHZhbHVlcztcclxufTtcclxuZXhwb3J0IGNvbnN0IGxpdGVyYWxQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIGpzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIGNvbnN0IHZhbHMgPSBbXTtcclxuICAgIGZvciAoY29uc3QgdmFsIG9mIGRlZi52YWx1ZXMpIHtcclxuICAgICAgICBpZiAodmFsID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTGl0ZXJhbCBgdW5kZWZpbmVkYCBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBkbyBub3QgYWRkIHRvIHZhbHNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsID09PSBcImJpZ2ludFwiKSB7XHJcbiAgICAgICAgICAgIGlmIChjdHgudW5yZXByZXNlbnRhYmxlID09PSBcInRocm93XCIpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkJpZ0ludCBsaXRlcmFscyBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YWxzLnB1c2goTnVtYmVyKHZhbCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB2YWxzLnB1c2godmFsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodmFscy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAvLyBkbyBub3RoaW5nIChhbiB1bmRlZmluZWQgbGl0ZXJhbCB3YXMgc3RyaXBwZWQpXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh2YWxzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgIGNvbnN0IHZhbCA9IHZhbHNbMF07XHJcbiAgICAgICAganNvbi50eXBlID0gdmFsID09PSBudWxsID8gXCJudWxsXCIgOiB0eXBlb2YgdmFsO1xyXG4gICAgICAgIGlmIChjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTA0XCIgfHwgY3R4LnRhcmdldCA9PT0gXCJvcGVuYXBpLTMuMFwiKSB7XHJcbiAgICAgICAgICAgIGpzb24uZW51bSA9IFt2YWxdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAganNvbi5jb25zdCA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZiAodmFscy5ldmVyeSgodikgPT4gdHlwZW9mIHYgPT09IFwibnVtYmVyXCIpKVxyXG4gICAgICAgICAgICBqc29uLnR5cGUgPSBcIm51bWJlclwiO1xyXG4gICAgICAgIGlmICh2YWxzLmV2ZXJ5KCh2KSA9PiB0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIikpXHJcbiAgICAgICAgICAgIGpzb24udHlwZSA9IFwic3RyaW5nXCI7XHJcbiAgICAgICAgaWYgKHZhbHMuZXZlcnkoKHYpID0+IHR5cGVvZiB2ID09PSBcImJvb2xlYW5cIikpXHJcbiAgICAgICAgICAgIGpzb24udHlwZSA9IFwiYm9vbGVhblwiO1xyXG4gICAgICAgIGlmICh2YWxzLmV2ZXJ5KCh2KSA9PiB2ID09PSBudWxsKSlcclxuICAgICAgICAgICAganNvbi50eXBlID0gXCJudWxsXCI7XHJcbiAgICAgICAganNvbi5lbnVtID0gdmFscztcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IG5hblByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTmFOIGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IHRlbXBsYXRlTGl0ZXJhbFByb2Nlc3NvciA9IChzY2hlbWEsIF9jdHgsIGpzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IF9qc29uID0ganNvbjtcclxuICAgIGNvbnN0IHBhdHRlcm4gPSBzY2hlbWEuX3pvZC5wYXR0ZXJuO1xyXG4gICAgaWYgKCFwYXR0ZXJuKVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhdHRlcm4gbm90IGZvdW5kIGluIHRlbXBsYXRlIGxpdGVyYWxcIik7XHJcbiAgICBfanNvbi50eXBlID0gXCJzdHJpbmdcIjtcclxuICAgIF9qc29uLnBhdHRlcm4gPSBwYXR0ZXJuLnNvdXJjZTtcclxufTtcclxuZXhwb3J0IGNvbnN0IGZpbGVQcm9jZXNzb3IgPSAoc2NoZW1hLCBfY3R4LCBqc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBfanNvbiA9IGpzb247XHJcbiAgICBjb25zdCBmaWxlID0ge1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcImJpbmFyeVwiLFxyXG4gICAgICAgIGNvbnRlbnRFbmNvZGluZzogXCJiaW5hcnlcIixcclxuICAgIH07XHJcbiAgICBjb25zdCB7IG1pbmltdW0sIG1heGltdW0sIG1pbWUgfSA9IHNjaGVtYS5fem9kLmJhZztcclxuICAgIGlmIChtaW5pbXVtICE9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgZmlsZS5taW5MZW5ndGggPSBtaW5pbXVtO1xyXG4gICAgaWYgKG1heGltdW0gIT09IHVuZGVmaW5lZClcclxuICAgICAgICBmaWxlLm1heExlbmd0aCA9IG1heGltdW07XHJcbiAgICBpZiAobWltZSkge1xyXG4gICAgICAgIGlmIChtaW1lLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICBmaWxlLmNvbnRlbnRNZWRpYVR5cGUgPSBtaW1lWzBdO1xyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKF9qc29uLCBmaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oX2pzb24sIGZpbGUpOyAvLyBzaGFyZWQgcHJvcHMgYXQgcm9vdFxyXG4gICAgICAgICAgICBfanNvbi5hbnlPZiA9IG1pbWUubWFwKChtKSA9PiAoeyBjb250ZW50TWVkaWFUeXBlOiBtIH0pKTsgLy8gb25seSBjb250ZW50TWVkaWFUeXBlIGRpZmZlcnNcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBPYmplY3QuYXNzaWduKF9qc29uLCBmaWxlKTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IHN1Y2Nlc3NQcm9jZXNzb3IgPSAoX3NjaGVtYSwgX2N0eCwganNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAganNvbi50eXBlID0gXCJib29sZWFuXCI7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBjdXN0b21Qcm9jZXNzb3IgPSAoX3NjaGVtYSwgY3R4LCBfanNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkN1c3RvbSB0eXBlcyBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCBmdW5jdGlvblByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRnVuY3Rpb24gdHlwZXMgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xyXG4gICAgfVxyXG59O1xyXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtUHJvY2Vzc29yID0gKF9zY2hlbWEsIGN0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIGlmIChjdHgudW5yZXByZXNlbnRhYmxlID09PSBcInRocm93XCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUcmFuc2Zvcm1zIGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IG1hcFByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWFwIGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IHNldFByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2V0IGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcclxuICAgIH1cclxufTtcclxuLy8gPT09PT09PT09PT09PT09PT09PT0gQ09NUE9TSVRFIFRZUEUgUFJPQ0VTU09SUyA9PT09PT09PT09PT09PT09PT09PVxyXG5leHBvcnQgY29uc3QgYXJyYXlQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGpzb24gPSBfanNvbjtcclxuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIGNvbnN0IHsgbWluaW11bSwgbWF4aW11bSB9ID0gc2NoZW1hLl96b2QuYmFnO1xyXG4gICAgaWYgKHR5cGVvZiBtaW5pbXVtID09PSBcIm51bWJlclwiKVxyXG4gICAgICAgIGpzb24ubWluSXRlbXMgPSBtaW5pbXVtO1xyXG4gICAgaWYgKHR5cGVvZiBtYXhpbXVtID09PSBcIm51bWJlclwiKVxyXG4gICAgICAgIGpzb24ubWF4SXRlbXMgPSBtYXhpbXVtO1xyXG4gICAganNvbi50eXBlID0gXCJhcnJheVwiO1xyXG4gICAganNvbi5pdGVtcyA9IHByb2Nlc3MoZGVmLmVsZW1lbnQsIGN0eCwge1xyXG4gICAgICAgIC4uLnBhcmFtcyxcclxuICAgICAgICBwYXRoOiBbLi4ucGFyYW1zLnBhdGgsIFwiaXRlbXNcIl0sXHJcbiAgICB9KTtcclxufTtcclxuZXhwb3J0IGNvbnN0IG9iamVjdFByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwgX2pzb24sIHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QganNvbiA9IF9qc29uO1xyXG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAganNvbi50eXBlID0gXCJvYmplY3RcIjtcclxuICAgIGpzb24ucHJvcGVydGllcyA9IHt9O1xyXG4gICAgY29uc3Qgc2hhcGUgPSBkZWYuc2hhcGU7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBzaGFwZSkge1xyXG4gICAgICAgIGpzb24ucHJvcGVydGllc1trZXldID0gcHJvY2VzcyhzaGFwZVtrZXldLCBjdHgsIHtcclxuICAgICAgICAgICAgLi4ucGFyYW1zLFxyXG4gICAgICAgICAgICBwYXRoOiBbLi4ucGFyYW1zLnBhdGgsIFwicHJvcGVydGllc1wiLCBrZXldLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy8gcmVxdWlyZWQga2V5c1xyXG4gICAgY29uc3QgYWxsS2V5cyA9IG5ldyBTZXQoT2JqZWN0LmtleXMoc2hhcGUpKTtcclxuICAgIGNvbnN0IHJlcXVpcmVkS2V5cyA9IG5ldyBTZXQoWy4uLmFsbEtleXNdLmZpbHRlcigoa2V5KSA9PiB7XHJcbiAgICAgICAgY29uc3QgdiA9IGRlZi5zaGFwZVtrZXldLl96b2Q7XHJcbiAgICAgICAgaWYgKGN0eC5pbyA9PT0gXCJpbnB1dFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB2Lm9wdGluID09PSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdi5vcHRvdXQgPT09IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9KSk7XHJcbiAgICBpZiAocmVxdWlyZWRLZXlzLnNpemUgPiAwKSB7XHJcbiAgICAgICAganNvbi5yZXF1aXJlZCA9IEFycmF5LmZyb20ocmVxdWlyZWRLZXlzKTtcclxuICAgIH1cclxuICAgIC8vIGNhdGNoYWxsXHJcbiAgICBpZiAoZGVmLmNhdGNoYWxsPy5fem9kLmRlZi50eXBlID09PSBcIm5ldmVyXCIpIHtcclxuICAgICAgICAvLyBzdHJpY3RcclxuICAgICAgICBqc29uLmFkZGl0aW9uYWxQcm9wZXJ0aWVzID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICghZGVmLmNhdGNoYWxsKSB7XHJcbiAgICAgICAgLy8gcmVndWxhclxyXG4gICAgICAgIGlmIChjdHguaW8gPT09IFwib3V0cHV0XCIpXHJcbiAgICAgICAgICAgIGpzb24uYWRkaXRpb25hbFByb3BlcnRpZXMgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGRlZi5jYXRjaGFsbCkge1xyXG4gICAgICAgIGpzb24uYWRkaXRpb25hbFByb3BlcnRpZXMgPSBwcm9jZXNzKGRlZi5jYXRjaGFsbCwgY3R4LCB7XHJcbiAgICAgICAgICAgIC4uLnBhcmFtcyxcclxuICAgICAgICAgICAgcGF0aDogWy4uLnBhcmFtcy5wYXRoLCBcImFkZGl0aW9uYWxQcm9wZXJ0aWVzXCJdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59O1xyXG5leHBvcnQgY29uc3QgdW5pb25Qcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIGpzb24sIHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAgLy8gRXhjbHVzaXZlIHVuaW9ucyAoaW5jbHVzaXZlID09PSBmYWxzZSkgdXNlIG9uZU9mIChleGFjdGx5IG9uZSBtYXRjaCkgaW5zdGVhZCBvZiBhbnlPZiAob25lIG9yIG1vcmUgbWF0Y2hlcylcclxuICAgIC8vIFRoaXMgaW5jbHVkZXMgYm90aCB6LnhvcigpIGFuZCBkaXNjcmltaW5hdGVkIHVuaW9uc1xyXG4gICAgY29uc3QgaXNFeGNsdXNpdmUgPSBkZWYuaW5jbHVzaXZlID09PSBmYWxzZTtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBkZWYub3B0aW9ucy5tYXAoKHgsIGkpID0+IHByb2Nlc3MoeCwgY3R4LCB7XHJcbiAgICAgICAgLi4ucGFyYW1zLFxyXG4gICAgICAgIHBhdGg6IFsuLi5wYXJhbXMucGF0aCwgaXNFeGNsdXNpdmUgPyBcIm9uZU9mXCIgOiBcImFueU9mXCIsIGldLFxyXG4gICAgfSkpO1xyXG4gICAgaWYgKGlzRXhjbHVzaXZlKSB7XHJcbiAgICAgICAganNvbi5vbmVPZiA9IG9wdGlvbnM7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBqc29uLmFueU9mID0gb3B0aW9ucztcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IGludGVyc2VjdGlvblByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwganNvbiwgcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBjb25zdCBhID0gcHJvY2VzcyhkZWYubGVmdCwgY3R4LCB7XHJcbiAgICAgICAgLi4ucGFyYW1zLFxyXG4gICAgICAgIHBhdGg6IFsuLi5wYXJhbXMucGF0aCwgXCJhbGxPZlwiLCAwXSxcclxuICAgIH0pO1xyXG4gICAgY29uc3QgYiA9IHByb2Nlc3MoZGVmLnJpZ2h0LCBjdHgsIHtcclxuICAgICAgICAuLi5wYXJhbXMsXHJcbiAgICAgICAgcGF0aDogWy4uLnBhcmFtcy5wYXRoLCBcImFsbE9mXCIsIDFdLFxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBpc1NpbXBsZUludGVyc2VjdGlvbiA9ICh2YWwpID0+IFwiYWxsT2ZcIiBpbiB2YWwgJiYgT2JqZWN0LmtleXModmFsKS5sZW5ndGggPT09IDE7XHJcbiAgICBjb25zdCBhbGxPZiA9IFtcclxuICAgICAgICAuLi4oaXNTaW1wbGVJbnRlcnNlY3Rpb24oYSkgPyBhLmFsbE9mIDogW2FdKSxcclxuICAgICAgICAuLi4oaXNTaW1wbGVJbnRlcnNlY3Rpb24oYikgPyBiLmFsbE9mIDogW2JdKSxcclxuICAgIF07XHJcbiAgICBqc29uLmFsbE9mID0gYWxsT2Y7XHJcbn07XHJcbmV4cG9ydCBjb25zdCB0dXBsZVByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwgX2pzb24sIHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QganNvbiA9IF9qc29uO1xyXG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAganNvbi50eXBlID0gXCJhcnJheVwiO1xyXG4gICAgY29uc3QgcHJlZml4UGF0aCA9IGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMjAyMC0xMlwiID8gXCJwcmVmaXhJdGVtc1wiIDogXCJpdGVtc1wiO1xyXG4gICAgY29uc3QgcmVzdFBhdGggPSBjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTIwMjAtMTJcIiA/IFwiaXRlbXNcIiA6IGN0eC50YXJnZXQgPT09IFwib3BlbmFwaS0zLjBcIiA/IFwiaXRlbXNcIiA6IFwiYWRkaXRpb25hbEl0ZW1zXCI7XHJcbiAgICBjb25zdCBwcmVmaXhJdGVtcyA9IGRlZi5pdGVtcy5tYXAoKHgsIGkpID0+IHByb2Nlc3MoeCwgY3R4LCB7XHJcbiAgICAgICAgLi4ucGFyYW1zLFxyXG4gICAgICAgIHBhdGg6IFsuLi5wYXJhbXMucGF0aCwgcHJlZml4UGF0aCwgaV0sXHJcbiAgICB9KSk7XHJcbiAgICBjb25zdCByZXN0ID0gZGVmLnJlc3RcclxuICAgICAgICA/IHByb2Nlc3MoZGVmLnJlc3QsIGN0eCwge1xyXG4gICAgICAgICAgICAuLi5wYXJhbXMsXHJcbiAgICAgICAgICAgIHBhdGg6IFsuLi5wYXJhbXMucGF0aCwgcmVzdFBhdGgsIC4uLihjdHgudGFyZ2V0ID09PSBcIm9wZW5hcGktMy4wXCIgPyBbZGVmLml0ZW1zLmxlbmd0aF0gOiBbXSldLFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgOiBudWxsO1xyXG4gICAgaWYgKGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMjAyMC0xMlwiKSB7XHJcbiAgICAgICAganNvbi5wcmVmaXhJdGVtcyA9IHByZWZpeEl0ZW1zO1xyXG4gICAgICAgIGlmIChyZXN0KSB7XHJcbiAgICAgICAgICAgIGpzb24uaXRlbXMgPSByZXN0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGN0eC50YXJnZXQgPT09IFwib3BlbmFwaS0zLjBcIikge1xyXG4gICAgICAgIGpzb24uaXRlbXMgPSB7XHJcbiAgICAgICAgICAgIGFueU9mOiBwcmVmaXhJdGVtcyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChyZXN0KSB7XHJcbiAgICAgICAgICAgIGpzb24uaXRlbXMuYW55T2YucHVzaChyZXN0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAganNvbi5taW5JdGVtcyA9IHByZWZpeEl0ZW1zLmxlbmd0aDtcclxuICAgICAgICBpZiAoIXJlc3QpIHtcclxuICAgICAgICAgICAganNvbi5tYXhJdGVtcyA9IHByZWZpeEl0ZW1zLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBqc29uLml0ZW1zID0gcHJlZml4SXRlbXM7XHJcbiAgICAgICAgaWYgKHJlc3QpIHtcclxuICAgICAgICAgICAganNvbi5hZGRpdGlvbmFsSXRlbXMgPSByZXN0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIGxlbmd0aFxyXG4gICAgY29uc3QgeyBtaW5pbXVtLCBtYXhpbXVtIH0gPSBzY2hlbWEuX3pvZC5iYWc7XHJcbiAgICBpZiAodHlwZW9mIG1pbmltdW0gPT09IFwibnVtYmVyXCIpXHJcbiAgICAgICAganNvbi5taW5JdGVtcyA9IG1pbmltdW07XHJcbiAgICBpZiAodHlwZW9mIG1heGltdW0gPT09IFwibnVtYmVyXCIpXHJcbiAgICAgICAganNvbi5tYXhJdGVtcyA9IG1heGltdW07XHJcbn07XHJcbmV4cG9ydCBjb25zdCByZWNvcmRQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGpzb24gPSBfanNvbjtcclxuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIGpzb24udHlwZSA9IFwib2JqZWN0XCI7XHJcbiAgICAvLyBGb3IgbG9vc2VSZWNvcmQgd2l0aCByZWdleCBwYXR0ZXJucywgdXNlIHBhdHRlcm5Qcm9wZXJ0aWVzXHJcbiAgICAvLyBUaGlzIGNvcnJlY3RseSByZXByZXNlbnRzIFwib25seSB2YWxpZGF0ZSBrZXlzIG1hdGNoaW5nIHRoZSBwYXR0ZXJuXCIgc2VtYW50aWNzXHJcbiAgICAvLyBhbmQgY29tcG9zZXMgd2VsbCB3aXRoIGFsbE9mIChpbnRlcnNlY3Rpb25zKVxyXG4gICAgY29uc3Qga2V5VHlwZSA9IGRlZi5rZXlUeXBlO1xyXG4gICAgY29uc3Qga2V5QmFnID0ga2V5VHlwZS5fem9kLmJhZztcclxuICAgIGNvbnN0IHBhdHRlcm5zID0ga2V5QmFnPy5wYXR0ZXJucztcclxuICAgIGlmIChkZWYubW9kZSA9PT0gXCJsb29zZVwiICYmIHBhdHRlcm5zICYmIHBhdHRlcm5zLnNpemUgPiAwKSB7XHJcbiAgICAgICAgLy8gVXNlIHBhdHRlcm5Qcm9wZXJ0aWVzIGZvciBsb29zZVJlY29yZCB3aXRoIHJlZ2V4IHBhdHRlcm5zXHJcbiAgICAgICAgY29uc3QgdmFsdWVTY2hlbWEgPSBwcm9jZXNzKGRlZi52YWx1ZVR5cGUsIGN0eCwge1xyXG4gICAgICAgICAgICAuLi5wYXJhbXMsXHJcbiAgICAgICAgICAgIHBhdGg6IFsuLi5wYXJhbXMucGF0aCwgXCJwYXR0ZXJuUHJvcGVydGllc1wiLCBcIipcIl0sXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAganNvbi5wYXR0ZXJuUHJvcGVydGllcyA9IHt9O1xyXG4gICAgICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBwYXR0ZXJucykge1xyXG4gICAgICAgICAgICBqc29uLnBhdHRlcm5Qcm9wZXJ0aWVzW3BhdHRlcm4uc291cmNlXSA9IHZhbHVlU2NoZW1hO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIERlZmF1bHQgYmVoYXZpb3I6IHVzZSBwcm9wZXJ0eU5hbWVzICsgYWRkaXRpb25hbFByb3BlcnRpZXNcclxuICAgICAgICBpZiAoY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0wN1wiIHx8IGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMjAyMC0xMlwiKSB7XHJcbiAgICAgICAgICAgIGpzb24ucHJvcGVydHlOYW1lcyA9IHByb2Nlc3MoZGVmLmtleVR5cGUsIGN0eCwge1xyXG4gICAgICAgICAgICAgICAgLi4ucGFyYW1zLFxyXG4gICAgICAgICAgICAgICAgcGF0aDogWy4uLnBhcmFtcy5wYXRoLCBcInByb3BlcnR5TmFtZXNcIl0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBqc29uLmFkZGl0aW9uYWxQcm9wZXJ0aWVzID0gcHJvY2VzcyhkZWYudmFsdWVUeXBlLCBjdHgsIHtcclxuICAgICAgICAgICAgLi4ucGFyYW1zLFxyXG4gICAgICAgICAgICBwYXRoOiBbLi4ucGFyYW1zLnBhdGgsIFwiYWRkaXRpb25hbFByb3BlcnRpZXNcIl0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyBBZGQgcmVxdWlyZWQgZm9yIGtleXMgd2l0aCBkaXNjcmV0ZSB2YWx1ZXMgKGVudW0sIGxpdGVyYWwsIGV0Yy4pXHJcbiAgICBjb25zdCBrZXlWYWx1ZXMgPSBrZXlUeXBlLl96b2QudmFsdWVzO1xyXG4gICAgaWYgKGtleVZhbHVlcykge1xyXG4gICAgICAgIGNvbnN0IHZhbGlkS2V5VmFsdWVzID0gWy4uLmtleVZhbHVlc10uZmlsdGVyKCh2KSA9PiB0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgdiA9PT0gXCJudW1iZXJcIik7XHJcbiAgICAgICAgaWYgKHZhbGlkS2V5VmFsdWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAganNvbi5yZXF1aXJlZCA9IHZhbGlkS2V5VmFsdWVzO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IG51bGxhYmxlUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBqc29uLCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIGNvbnN0IGlubmVyID0gcHJvY2VzcyhkZWYuaW5uZXJUeXBlLCBjdHgsIHBhcmFtcyk7XHJcbiAgICBjb25zdCBzZWVuID0gY3R4LnNlZW4uZ2V0KHNjaGVtYSk7XHJcbiAgICBpZiAoY3R4LnRhcmdldCA9PT0gXCJvcGVuYXBpLTMuMFwiKSB7XHJcbiAgICAgICAgc2Vlbi5yZWYgPSBkZWYuaW5uZXJUeXBlO1xyXG4gICAgICAgIGpzb24ubnVsbGFibGUgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAganNvbi5hbnlPZiA9IFtpbm5lciwgeyB0eXBlOiBcIm51bGxcIiB9XTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IG5vbm9wdGlvbmFsUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBfanNvbiwgcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBwcm9jZXNzKGRlZi5pbm5lclR5cGUsIGN0eCwgcGFyYW1zKTtcclxuICAgIGNvbnN0IHNlZW4gPSBjdHguc2Vlbi5nZXQoc2NoZW1hKTtcclxuICAgIHNlZW4ucmVmID0gZGVmLmlubmVyVHlwZTtcclxufTtcclxuZXhwb3J0IGNvbnN0IGRlZmF1bHRQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIGpzb24sIHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAgcHJvY2VzcyhkZWYuaW5uZXJUeXBlLCBjdHgsIHBhcmFtcyk7XHJcbiAgICBjb25zdCBzZWVuID0gY3R4LnNlZW4uZ2V0KHNjaGVtYSk7XHJcbiAgICBzZWVuLnJlZiA9IGRlZi5pbm5lclR5cGU7XHJcbiAgICBqc29uLmRlZmF1bHQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGRlZi5kZWZhdWx0VmFsdWUpKTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHByZWZhdWx0UHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBqc29uLCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIHByb2Nlc3MoZGVmLmlubmVyVHlwZSwgY3R4LCBwYXJhbXMpO1xyXG4gICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xyXG4gICAgc2Vlbi5yZWYgPSBkZWYuaW5uZXJUeXBlO1xyXG4gICAgaWYgKGN0eC5pbyA9PT0gXCJpbnB1dFwiKVxyXG4gICAgICAgIGpzb24uX3ByZWZhdWx0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWYuZGVmYXVsdFZhbHVlKSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBjYXRjaFByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwganNvbiwgcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBwcm9jZXNzKGRlZi5pbm5lclR5cGUsIGN0eCwgcGFyYW1zKTtcclxuICAgIGNvbnN0IHNlZW4gPSBjdHguc2Vlbi5nZXQoc2NoZW1hKTtcclxuICAgIHNlZW4ucmVmID0gZGVmLmlubmVyVHlwZTtcclxuICAgIGxldCBjYXRjaFZhbHVlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjYXRjaFZhbHVlID0gZGVmLmNhdGNoVmFsdWUodW5kZWZpbmVkKTtcclxuICAgIH1cclxuICAgIGNhdGNoIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEeW5hbWljIGNhdGNoIHZhbHVlcyBhcmUgbm90IHN1cHBvcnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcclxuICAgIH1cclxuICAgIGpzb24uZGVmYXVsdCA9IGNhdGNoVmFsdWU7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBwaXBlUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBfanNvbiwgcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBjb25zdCBpbklzVHJhbnNmb3JtID0gZGVmLmluLl96b2QudHJhaXRzLmhhcyhcIiRab2RUcmFuc2Zvcm1cIik7XHJcbiAgICBjb25zdCBpbm5lclR5cGUgPSBjdHguaW8gPT09IFwiaW5wdXRcIiA/IChpbklzVHJhbnNmb3JtID8gZGVmLm91dCA6IGRlZi5pbikgOiBkZWYub3V0O1xyXG4gICAgcHJvY2Vzcyhpbm5lclR5cGUsIGN0eCwgcGFyYW1zKTtcclxuICAgIGNvbnN0IHNlZW4gPSBjdHguc2Vlbi5nZXQoc2NoZW1hKTtcclxuICAgIHNlZW4ucmVmID0gaW5uZXJUeXBlO1xyXG59O1xyXG5leHBvcnQgY29uc3QgcmVhZG9ubHlQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIGpzb24sIHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAgcHJvY2VzcyhkZWYuaW5uZXJUeXBlLCBjdHgsIHBhcmFtcyk7XHJcbiAgICBjb25zdCBzZWVuID0gY3R4LnNlZW4uZ2V0KHNjaGVtYSk7XHJcbiAgICBzZWVuLnJlZiA9IGRlZi5pbm5lclR5cGU7XHJcbiAgICBqc29uLnJlYWRPbmx5ID0gdHJ1ZTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHByb21pc2VQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIHByb2Nlc3MoZGVmLmlubmVyVHlwZSwgY3R4LCBwYXJhbXMpO1xyXG4gICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xyXG4gICAgc2Vlbi5yZWYgPSBkZWYuaW5uZXJUeXBlO1xyXG59O1xyXG5leHBvcnQgY29uc3Qgb3B0aW9uYWxQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIHByb2Nlc3MoZGVmLmlubmVyVHlwZSwgY3R4LCBwYXJhbXMpO1xyXG4gICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xyXG4gICAgc2Vlbi5yZWYgPSBkZWYuaW5uZXJUeXBlO1xyXG59O1xyXG5leHBvcnQgY29uc3QgbGF6eVByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwgX2pzb24sIHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgaW5uZXJUeXBlID0gc2NoZW1hLl96b2QuaW5uZXJUeXBlO1xyXG4gICAgcHJvY2Vzcyhpbm5lclR5cGUsIGN0eCwgcGFyYW1zKTtcclxuICAgIGNvbnN0IHNlZW4gPSBjdHguc2Vlbi5nZXQoc2NoZW1hKTtcclxuICAgIHNlZW4ucmVmID0gaW5uZXJUeXBlO1xyXG59O1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PSBBTEwgUFJPQ0VTU09SUyA9PT09PT09PT09PT09PT09PT09PVxyXG5leHBvcnQgY29uc3QgYWxsUHJvY2Vzc29ycyA9IHtcclxuICAgIHN0cmluZzogc3RyaW5nUHJvY2Vzc29yLFxyXG4gICAgbnVtYmVyOiBudW1iZXJQcm9jZXNzb3IsXHJcbiAgICBib29sZWFuOiBib29sZWFuUHJvY2Vzc29yLFxyXG4gICAgYmlnaW50OiBiaWdpbnRQcm9jZXNzb3IsXHJcbiAgICBzeW1ib2w6IHN5bWJvbFByb2Nlc3NvcixcclxuICAgIG51bGw6IG51bGxQcm9jZXNzb3IsXHJcbiAgICB1bmRlZmluZWQ6IHVuZGVmaW5lZFByb2Nlc3NvcixcclxuICAgIHZvaWQ6IHZvaWRQcm9jZXNzb3IsXHJcbiAgICBuZXZlcjogbmV2ZXJQcm9jZXNzb3IsXHJcbiAgICBhbnk6IGFueVByb2Nlc3NvcixcclxuICAgIHVua25vd246IHVua25vd25Qcm9jZXNzb3IsXHJcbiAgICBkYXRlOiBkYXRlUHJvY2Vzc29yLFxyXG4gICAgZW51bTogZW51bVByb2Nlc3NvcixcclxuICAgIGxpdGVyYWw6IGxpdGVyYWxQcm9jZXNzb3IsXHJcbiAgICBuYW46IG5hblByb2Nlc3NvcixcclxuICAgIHRlbXBsYXRlX2xpdGVyYWw6IHRlbXBsYXRlTGl0ZXJhbFByb2Nlc3NvcixcclxuICAgIGZpbGU6IGZpbGVQcm9jZXNzb3IsXHJcbiAgICBzdWNjZXNzOiBzdWNjZXNzUHJvY2Vzc29yLFxyXG4gICAgY3VzdG9tOiBjdXN0b21Qcm9jZXNzb3IsXHJcbiAgICBmdW5jdGlvbjogZnVuY3Rpb25Qcm9jZXNzb3IsXHJcbiAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybVByb2Nlc3NvcixcclxuICAgIG1hcDogbWFwUHJvY2Vzc29yLFxyXG4gICAgc2V0OiBzZXRQcm9jZXNzb3IsXHJcbiAgICBhcnJheTogYXJyYXlQcm9jZXNzb3IsXHJcbiAgICBvYmplY3Q6IG9iamVjdFByb2Nlc3NvcixcclxuICAgIHVuaW9uOiB1bmlvblByb2Nlc3NvcixcclxuICAgIGludGVyc2VjdGlvbjogaW50ZXJzZWN0aW9uUHJvY2Vzc29yLFxyXG4gICAgdHVwbGU6IHR1cGxlUHJvY2Vzc29yLFxyXG4gICAgcmVjb3JkOiByZWNvcmRQcm9jZXNzb3IsXHJcbiAgICBudWxsYWJsZTogbnVsbGFibGVQcm9jZXNzb3IsXHJcbiAgICBub25vcHRpb25hbDogbm9ub3B0aW9uYWxQcm9jZXNzb3IsXHJcbiAgICBkZWZhdWx0OiBkZWZhdWx0UHJvY2Vzc29yLFxyXG4gICAgcHJlZmF1bHQ6IHByZWZhdWx0UHJvY2Vzc29yLFxyXG4gICAgY2F0Y2g6IGNhdGNoUHJvY2Vzc29yLFxyXG4gICAgcGlwZTogcGlwZVByb2Nlc3NvcixcclxuICAgIHJlYWRvbmx5OiByZWFkb25seVByb2Nlc3NvcixcclxuICAgIHByb21pc2U6IHByb21pc2VQcm9jZXNzb3IsXHJcbiAgICBvcHRpb25hbDogb3B0aW9uYWxQcm9jZXNzb3IsXHJcbiAgICBsYXp5OiBsYXp5UHJvY2Vzc29yLFxyXG59O1xyXG5leHBvcnQgZnVuY3Rpb24gdG9KU09OU2NoZW1hKGlucHV0LCBwYXJhbXMpIHtcclxuICAgIGlmIChcIl9pZG1hcFwiIGluIGlucHV0KSB7XHJcbiAgICAgICAgLy8gUmVnaXN0cnkgY2FzZVxyXG4gICAgICAgIGNvbnN0IHJlZ2lzdHJ5ID0gaW5wdXQ7XHJcbiAgICAgICAgY29uc3QgY3R4ID0gaW5pdGlhbGl6ZUNvbnRleHQoeyAuLi5wYXJhbXMsIHByb2Nlc3NvcnM6IGFsbFByb2Nlc3NvcnMgfSk7XHJcbiAgICAgICAgY29uc3QgZGVmcyA9IHt9O1xyXG4gICAgICAgIC8vIEZpcnN0IHBhc3M6IHByb2Nlc3MgYWxsIHNjaGVtYXMgdG8gYnVpbGQgdGhlIHNlZW4gbWFwXHJcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiByZWdpc3RyeS5faWRtYXAuZW50cmllcygpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFtfLCBzY2hlbWFdID0gZW50cnk7XHJcbiAgICAgICAgICAgIHByb2Nlc3Moc2NoZW1hLCBjdHgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzY2hlbWFzID0ge307XHJcbiAgICAgICAgY29uc3QgZXh0ZXJuYWwgPSB7XHJcbiAgICAgICAgICAgIHJlZ2lzdHJ5LFxyXG4gICAgICAgICAgICB1cmk6IHBhcmFtcz8udXJpLFxyXG4gICAgICAgICAgICBkZWZzLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBjb250ZXh0IHdpdGggZXh0ZXJuYWwgY29uZmlndXJhdGlvblxyXG4gICAgICAgIGN0eC5leHRlcm5hbCA9IGV4dGVybmFsO1xyXG4gICAgICAgIC8vIFNlY29uZCBwYXNzOiBlbWl0IGVhY2ggc2NoZW1hXHJcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiByZWdpc3RyeS5faWRtYXAuZW50cmllcygpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFtrZXksIHNjaGVtYV0gPSBlbnRyeTtcclxuICAgICAgICAgICAgZXh0cmFjdERlZnMoY3R4LCBzY2hlbWEpO1xyXG4gICAgICAgICAgICBzY2hlbWFzW2tleV0gPSBmaW5hbGl6ZShjdHgsIHNjaGVtYSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhkZWZzKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlZnNTZWdtZW50ID0gY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0yMDIwLTEyXCIgPyBcIiRkZWZzXCIgOiBcImRlZmluaXRpb25zXCI7XHJcbiAgICAgICAgICAgIHNjaGVtYXMuX19zaGFyZWQgPSB7XHJcbiAgICAgICAgICAgICAgICBbZGVmc1NlZ21lbnRdOiBkZWZzLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geyBzY2hlbWFzIH07XHJcbiAgICB9XHJcbiAgICAvLyBTaW5nbGUgc2NoZW1hIGNhc2VcclxuICAgIGNvbnN0IGN0eCA9IGluaXRpYWxpemVDb250ZXh0KHsgLi4ucGFyYW1zLCBwcm9jZXNzb3JzOiBhbGxQcm9jZXNzb3JzIH0pO1xyXG4gICAgcHJvY2VzcyhpbnB1dCwgY3R4KTtcclxuICAgIGV4dHJhY3REZWZzKGN0eCwgaW5wdXQpO1xyXG4gICAgcmV0dXJuIGZpbmFsaXplKGN0eCwgaW5wdXQpO1xyXG59XHJcbiIsImltcG9ydCAqIGFzIGNvcmUgZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcclxuaW1wb3J0ICogYXMgc2NoZW1hcyBmcm9tIFwiLi9zY2hlbWFzLmpzXCI7XHJcbmV4cG9ydCBjb25zdCBab2RJU09EYXRlVGltZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RJU09EYXRlVGltZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RJU09EYXRlVGltZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBzY2hlbWFzLlpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gZGF0ZXRpbWUocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5faXNvRGF0ZVRpbWUoWm9kSVNPRGF0ZVRpbWUsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZElTT0RhdGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kSVNPRGF0ZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RJU09EYXRlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIHNjaGVtYXMuWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBkYXRlKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2lzb0RhdGUoWm9kSVNPRGF0ZSwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kSVNPVGltZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RJU09UaW1lXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZElTT1RpbWUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgc2NoZW1hcy5ab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIHRpbWUocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5faXNvVGltZShab2RJU09UaW1lLCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RJU09EdXJhdGlvbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RJU09EdXJhdGlvblwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RJU09EdXJhdGlvbi5pbml0KGluc3QsIGRlZik7XHJcbiAgICBzY2hlbWFzLlpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gZHVyYXRpb24ocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5faXNvRHVyYXRpb24oWm9kSVNPRHVyYXRpb24sIHBhcmFtcyk7XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgY29yZSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyAkWm9kRXJyb3IgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xyXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuLi9jb3JlL3V0aWwuanNcIjtcclxuY29uc3QgaW5pdGlhbGl6ZXIgPSAoaW5zdCwgaXNzdWVzKSA9PiB7XHJcbiAgICAkWm9kRXJyb3IuaW5pdChpbnN0LCBpc3N1ZXMpO1xyXG4gICAgaW5zdC5uYW1lID0gXCJab2RFcnJvclwiO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoaW5zdCwge1xyXG4gICAgICAgIGZvcm1hdDoge1xyXG4gICAgICAgICAgICB2YWx1ZTogKG1hcHBlcikgPT4gY29yZS5mb3JtYXRFcnJvcihpbnN0LCBtYXBwZXIpLFxyXG4gICAgICAgICAgICAvLyBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZsYXR0ZW46IHtcclxuICAgICAgICAgICAgdmFsdWU6IChtYXBwZXIpID0+IGNvcmUuZmxhdHRlbkVycm9yKGluc3QsIG1hcHBlciksXHJcbiAgICAgICAgICAgIC8vIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkSXNzdWU6IHtcclxuICAgICAgICAgICAgdmFsdWU6IChpc3N1ZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaW5zdC5pc3N1ZXMucHVzaChpc3N1ZSk7XHJcbiAgICAgICAgICAgICAgICBpbnN0Lm1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShpbnN0Lmlzc3VlcywgdXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIsIDIpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZElzc3Vlczoge1xyXG4gICAgICAgICAgICB2YWx1ZTogKGlzc3VlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaW5zdC5pc3N1ZXMucHVzaCguLi5pc3N1ZXMpO1xyXG4gICAgICAgICAgICAgICAgaW5zdC5tZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoaW5zdC5pc3N1ZXMsIHV0aWwuanNvblN0cmluZ2lmeVJlcGxhY2VyLCAyKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8gZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc0VtcHR5OiB7XHJcbiAgICAgICAgICAgIGdldCgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0Lmlzc3Vlcy5sZW5ndGggPT09IDA7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuICAgIC8vIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpbnN0LCBcImlzRW1wdHlcIiwge1xyXG4gICAgLy8gICBnZXQoKSB7XHJcbiAgICAvLyAgICAgcmV0dXJuIGluc3QuaXNzdWVzLmxlbmd0aCA9PT0gMDtcclxuICAgIC8vICAgfSxcclxuICAgIC8vIH0pO1xyXG59O1xyXG5leHBvcnQgY29uc3QgWm9kRXJyb3IgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kRXJyb3JcIiwgaW5pdGlhbGl6ZXIpO1xyXG5leHBvcnQgY29uc3QgWm9kUmVhbEVycm9yID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEVycm9yXCIsIGluaXRpYWxpemVyLCB7XHJcbiAgICBQYXJlbnQ6IEVycm9yLFxyXG59KTtcclxuLy8gLyoqIEBkZXByZWNhdGVkIFVzZSBgei5jb3JlLiRab2RFcnJvck1hcEN0eGAgaW5zdGVhZC4gKi9cclxuLy8gZXhwb3J0IHR5cGUgRXJyb3JNYXBDdHggPSBjb3JlLiRab2RFcnJvck1hcEN0eDtcclxuIiwiaW1wb3J0ICogYXMgY29yZSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyBab2RSZWFsRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnMuanNcIjtcclxuZXhwb3J0IGNvbnN0IHBhcnNlID0gLyogQF9fUFVSRV9fICovIGNvcmUuX3BhcnNlKFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBwYXJzZUFzeW5jID0gLyogQF9fUFVSRV9fICovIGNvcmUuX3BhcnNlQXN5bmMoWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IHNhZmVQYXJzZSA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9zYWZlUGFyc2UoWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IHNhZmVQYXJzZUFzeW5jID0gLyogQF9fUFVSRV9fICovIGNvcmUuX3NhZmVQYXJzZUFzeW5jKFpvZFJlYWxFcnJvcik7XHJcbi8vIENvZGVjIGZ1bmN0aW9uc1xyXG5leHBvcnQgY29uc3QgZW5jb2RlID0gLyogQF9fUFVSRV9fICovIGNvcmUuX2VuY29kZShab2RSZWFsRXJyb3IpO1xyXG5leHBvcnQgY29uc3QgZGVjb2RlID0gLyogQF9fUFVSRV9fICovIGNvcmUuX2RlY29kZShab2RSZWFsRXJyb3IpO1xyXG5leHBvcnQgY29uc3QgZW5jb2RlQXN5bmMgPSAvKiBAX19QVVJFX18gKi8gY29yZS5fZW5jb2RlQXN5bmMoWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IGRlY29kZUFzeW5jID0gLyogQF9fUFVSRV9fICovIGNvcmUuX2RlY29kZUFzeW5jKFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBzYWZlRW5jb2RlID0gLyogQF9fUFVSRV9fICovIGNvcmUuX3NhZmVFbmNvZGUoWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IHNhZmVEZWNvZGUgPSAvKiBAX19QVVJFX18gKi8gY29yZS5fc2FmZURlY29kZShab2RSZWFsRXJyb3IpO1xyXG5leHBvcnQgY29uc3Qgc2FmZUVuY29kZUFzeW5jID0gLyogQF9fUFVSRV9fICovIGNvcmUuX3NhZmVFbmNvZGVBc3luYyhab2RSZWFsRXJyb3IpO1xyXG5leHBvcnQgY29uc3Qgc2FmZURlY29kZUFzeW5jID0gLyogQF9fUFVSRV9fICovIGNvcmUuX3NhZmVEZWNvZGVBc3luYyhab2RSZWFsRXJyb3IpO1xyXG4iLCJpbXBvcnQgKiBhcyBjb3JlIGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XHJcbmltcG9ydCB7IHV0aWwgfSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xyXG5pbXBvcnQgKiBhcyBwcm9jZXNzb3JzIGZyb20gXCIuLi9jb3JlL2pzb24tc2NoZW1hLXByb2Nlc3NvcnMuanNcIjtcclxuaW1wb3J0IHsgY3JlYXRlU3RhbmRhcmRKU09OU2NoZW1hTWV0aG9kLCBjcmVhdGVUb0pTT05TY2hlbWFNZXRob2QgfSBmcm9tIFwiLi4vY29yZS90by1qc29uLXNjaGVtYS5qc1wiO1xyXG5pbXBvcnQgKiBhcyBjaGVja3MgZnJvbSBcIi4vY2hlY2tzLmpzXCI7XHJcbmltcG9ydCAqIGFzIGlzbyBmcm9tIFwiLi9pc28uanNcIjtcclxuaW1wb3J0ICogYXMgcGFyc2UgZnJvbSBcIi4vcGFyc2UuanNcIjtcclxuLy8gTGF6eS1iaW5kIGJ1aWxkZXIgbWV0aG9kcy5cclxuLy9cclxuLy8gQnVpbGRlciBtZXRob2RzIChgLm9wdGlvbmFsYCwgYC5hcnJheWAsIGAucmVmaW5lYCwgLi4uKSBsaXZlIGFzXHJcbi8vIG5vbi1lbnVtZXJhYmxlIGdldHRlcnMgb24gZWFjaCBjb25jcmV0ZSBzY2hlbWEgY29uc3RydWN0b3Inc1xyXG4vLyBwcm90b3R5cGUuIE9uIGZpcnN0IGFjY2VzcyBmcm9tIGFuIGluc3RhbmNlIHRoZSBnZXR0ZXIgYWxsb2NhdGVzXHJcbi8vIGBmbi5iaW5kKHRoaXMpYCBhbmQgY2FjaGVzIGl0IGFzIGFuIG93biBwcm9wZXJ0eSBvbiB0aGF0IGluc3RhbmNlLFxyXG4vLyBzbyBkZXRhY2hlZCB1c2FnZSAoYGNvbnN0IG0gPSBzY2hlbWEub3B0aW9uYWw7IG0oKWApIHN0aWxsIHdvcmtzXHJcbi8vIGFuZCB0aGUgcGVyLWluc3RhbmNlIGFsbG9jYXRpb24gb25seSBoYXBwZW5zIGZvciBtZXRob2RzIGFjdHVhbGx5XHJcbi8vIHRvdWNoZWQuXHJcbi8vXHJcbi8vIE9uZSBpbnN0YWxsIHBlciAocHJvdG90eXBlLCBncm91cCksIG1lbW9pemVkIGJ5IGBfaW5zdGFsbGVkR3JvdXBzYC5cclxuY29uc3QgX2luc3RhbGxlZEdyb3VwcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgV2Vha01hcCgpO1xyXG5mdW5jdGlvbiBfaW5zdGFsbExhenlNZXRob2RzKGluc3QsIGdyb3VwLCBtZXRob2RzKSB7XHJcbiAgICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihpbnN0KTtcclxuICAgIGxldCBpbnN0YWxsZWQgPSBfaW5zdGFsbGVkR3JvdXBzLmdldChwcm90byk7XHJcbiAgICBpZiAoIWluc3RhbGxlZCkge1xyXG4gICAgICAgIGluc3RhbGxlZCA9IG5ldyBTZXQoKTtcclxuICAgICAgICBfaW5zdGFsbGVkR3JvdXBzLnNldChwcm90bywgaW5zdGFsbGVkKTtcclxuICAgIH1cclxuICAgIGlmIChpbnN0YWxsZWQuaGFzKGdyb3VwKSlcclxuICAgICAgICByZXR1cm47XHJcbiAgICBpbnN0YWxsZWQuYWRkKGdyb3VwKTtcclxuICAgIGZvciAoY29uc3Qga2V5IGluIG1ldGhvZHMpIHtcclxuICAgICAgICBjb25zdCBmbiA9IG1ldGhvZHNba2V5XTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocHJvdG8sIGtleSwge1xyXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBnZXQoKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBib3VuZCA9IGZuLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGJvdW5kLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYm91bmQ7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldCh2KSB7XHJcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHYsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY29uc3QgWm9kVHlwZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RUeXBlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgT2JqZWN0LmFzc2lnbihpbnN0W1wifnN0YW5kYXJkXCJdLCB7XHJcbiAgICAgICAganNvblNjaGVtYToge1xyXG4gICAgICAgICAgICBpbnB1dDogY3JlYXRlU3RhbmRhcmRKU09OU2NoZW1hTWV0aG9kKGluc3QsIFwiaW5wdXRcIiksXHJcbiAgICAgICAgICAgIG91dHB1dDogY3JlYXRlU3RhbmRhcmRKU09OU2NoZW1hTWV0aG9kKGluc3QsIFwib3V0cHV0XCIpLFxyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuICAgIGluc3QudG9KU09OU2NoZW1hID0gY3JlYXRlVG9KU09OU2NoZW1hTWV0aG9kKGluc3QsIHt9KTtcclxuICAgIGluc3QuZGVmID0gZGVmO1xyXG4gICAgaW5zdC50eXBlID0gZGVmLnR5cGU7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5zdCwgXCJfZGVmXCIsIHsgdmFsdWU6IGRlZiB9KTtcclxuICAgIC8vIFBhcnNlLWZhbWlseSBpcyBpbnRlbnRpb25hbGx5IGtlcHQgYXMgcGVyLWluc3RhbmNlIGNsb3N1cmVzOiB0aGVzZSBhcmVcclxuICAgIC8vIHRoZSBob3QgcGF0aCBBTkQgdGhlIG1vc3QtZGV0YWNoZWQgbWV0aG9kcyAoYGFyci5tYXAoc2NoZW1hLnBhcnNlKWAsXHJcbiAgICAvLyBgY29uc3QgeyBwYXJzZSB9ID0gc2NoZW1hYCwgZXRjLikuIEVhZ2VyIGNsb3N1cmVzIGhlcmUgbWVhbiBjYWxsZXJzIHBheVxyXG4gICAgLy8gfjEyIGNsb3N1cmUgYWxsb2NhdGlvbnMgcGVyIHNjaGVtYSBidXQgZ2V0IG1vbm9tb3JwaGljIGNhbGwgc2l0ZXMgYW5kXHJcbiAgICAvLyBkZXRhY2hlZCB1c2FnZSB0aGF0IFwianVzdCB3b3Jrc1wiLlxyXG4gICAgaW5zdC5wYXJzZSA9IChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLnBhcnNlKGluc3QsIGRhdGEsIHBhcmFtcywgeyBjYWxsZWU6IGluc3QucGFyc2UgfSk7XHJcbiAgICBpbnN0LnNhZmVQYXJzZSA9IChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLnNhZmVQYXJzZShpbnN0LCBkYXRhLCBwYXJhbXMpO1xyXG4gICAgaW5zdC5wYXJzZUFzeW5jID0gYXN5bmMgKGRhdGEsIHBhcmFtcykgPT4gcGFyc2UucGFyc2VBc3luYyhpbnN0LCBkYXRhLCBwYXJhbXMsIHsgY2FsbGVlOiBpbnN0LnBhcnNlQXN5bmMgfSk7XHJcbiAgICBpbnN0LnNhZmVQYXJzZUFzeW5jID0gYXN5bmMgKGRhdGEsIHBhcmFtcykgPT4gcGFyc2Uuc2FmZVBhcnNlQXN5bmMoaW5zdCwgZGF0YSwgcGFyYW1zKTtcclxuICAgIGluc3Quc3BhID0gaW5zdC5zYWZlUGFyc2VBc3luYztcclxuICAgIGluc3QuZW5jb2RlID0gKGRhdGEsIHBhcmFtcykgPT4gcGFyc2UuZW5jb2RlKGluc3QsIGRhdGEsIHBhcmFtcyk7XHJcbiAgICBpbnN0LmRlY29kZSA9IChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLmRlY29kZShpbnN0LCBkYXRhLCBwYXJhbXMpO1xyXG4gICAgaW5zdC5lbmNvZGVBc3luYyA9IGFzeW5jIChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLmVuY29kZUFzeW5jKGluc3QsIGRhdGEsIHBhcmFtcyk7XHJcbiAgICBpbnN0LmRlY29kZUFzeW5jID0gYXN5bmMgKGRhdGEsIHBhcmFtcykgPT4gcGFyc2UuZGVjb2RlQXN5bmMoaW5zdCwgZGF0YSwgcGFyYW1zKTtcclxuICAgIGluc3Quc2FmZUVuY29kZSA9IChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLnNhZmVFbmNvZGUoaW5zdCwgZGF0YSwgcGFyYW1zKTtcclxuICAgIGluc3Quc2FmZURlY29kZSA9IChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLnNhZmVEZWNvZGUoaW5zdCwgZGF0YSwgcGFyYW1zKTtcclxuICAgIGluc3Quc2FmZUVuY29kZUFzeW5jID0gYXN5bmMgKGRhdGEsIHBhcmFtcykgPT4gcGFyc2Uuc2FmZUVuY29kZUFzeW5jKGluc3QsIGRhdGEsIHBhcmFtcyk7XHJcbiAgICBpbnN0LnNhZmVEZWNvZGVBc3luYyA9IGFzeW5jIChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLnNhZmVEZWNvZGVBc3luYyhpbnN0LCBkYXRhLCBwYXJhbXMpO1xyXG4gICAgLy8gQWxsIGJ1aWxkZXIgbWV0aG9kcyBhcmUgcGxhY2VkIG9uIHRoZSBpbnRlcm5hbCBwcm90b3R5cGUgYXMgbGF6eS1iaW5kXHJcbiAgICAvLyBnZXR0ZXJzLiBPbiBmaXJzdCBhY2Nlc3MgcGVyLWluc3RhbmNlLCBhIGJvdW5kIHRodW5rIGlzIGFsbG9jYXRlZCBhbmRcclxuICAgIC8vIGNhY2hlZCBhcyBhbiBvd24gcHJvcGVydHk7IHN1YnNlcXVlbnQgYWNjZXNzZXMgc2tpcCB0aGUgZ2V0dGVyLiBUaGlzXHJcbiAgICAvLyBtZWFuczogbm8gcGVyLWluc3RhbmNlIGFsbG9jYXRpb24gZm9yIHVudXNlZCBtZXRob2RzLCBmdWxsXHJcbiAgICAvLyBkZXRhY2hhYmlsaXR5IHByZXNlcnZlZCAoYGNvbnN0IG0gPSBzY2hlbWEub3B0aW9uYWw7IG0oKWAgd29ya3MpLCBhbmRcclxuICAgIC8vIHNoYXJlZCB1bmRlcmx5aW5nIGZ1bmN0aW9uIHJlZmVyZW5jZXMgYWNyb3NzIGFsbCBpbnN0YW5jZXMuXHJcbiAgICBfaW5zdGFsbExhenlNZXRob2RzKGluc3QsIFwiWm9kVHlwZVwiLCB7XHJcbiAgICAgICAgY2hlY2soLi4uY2hrcykge1xyXG4gICAgICAgICAgICBjb25zdCBkZWYgPSB0aGlzLmRlZjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUodXRpbC5tZXJnZURlZnMoZGVmLCB7XHJcbiAgICAgICAgICAgICAgICBjaGVja3M6IFtcclxuICAgICAgICAgICAgICAgICAgICAuLi4oZGVmLmNoZWNrcyA/PyBbXSksXHJcbiAgICAgICAgICAgICAgICAgICAgLi4uY2hrcy5tYXAoKGNoKSA9PiB0eXBlb2YgY2ggPT09IFwiZnVuY3Rpb25cIiA/IHsgX3pvZDogeyBjaGVjazogY2gsIGRlZjogeyBjaGVjazogXCJjdXN0b21cIiB9LCBvbmF0dGFjaDogW10gfSB9IDogY2gpLFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfSksIHsgcGFyZW50OiB0cnVlIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgd2l0aCguLi5jaGtzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKC4uLmNoa3MpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2xvbmUoZGVmLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvcmUuY2xvbmUodGhpcywgZGVmLCBwYXJhbXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnJhbmQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVnaXN0ZXIocmVnLCBtZXRhKSB7XHJcbiAgICAgICAgICAgIHJlZy5hZGQodGhpcywgbWV0YSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVmaW5lKGNoZWNrLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2socmVmaW5lKGNoZWNrLCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN1cGVyUmVmaW5lKHJlZmluZW1lbnQsIHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhzdXBlclJlZmluZShyZWZpbmVtZW50LCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG92ZXJ3cml0ZShmbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3Mub3ZlcndyaXRlKGZuKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvcHRpb25hbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbmFsKHRoaXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXhhY3RPcHRpb25hbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV4YWN0T3B0aW9uYWwodGhpcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBudWxsYWJsZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGxhYmxlKHRoaXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbnVsbGlzaCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbmFsKG51bGxhYmxlKHRoaXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5vbm9wdGlvbmFsKHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gbm9ub3B0aW9uYWwodGhpcywgcGFyYW1zKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFycmF5KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXkodGhpcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvcihhcmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuaW9uKFt0aGlzLCBhcmddKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFuZChhcmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGludGVyc2VjdGlvbih0aGlzLCBhcmcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdHJhbnNmb3JtKHR4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwaXBlKHRoaXMsIHRyYW5zZm9ybSh0eCkpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVmYXVsdChkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfZGVmYXVsdCh0aGlzLCBkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByZWZhdWx0KGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByZWZhdWx0KHRoaXMsIGQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2F0Y2gocGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfY2F0Y2godGhpcywgcGFyYW1zKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBpcGUodGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwaXBlKHRoaXMsIHRhcmdldCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWFkb25seSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlYWRvbmx5KHRoaXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVzY3JpYmUoZGVzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgY29uc3QgY2wgPSB0aGlzLmNsb25lKCk7XHJcbiAgICAgICAgICAgIGNvcmUuZ2xvYmFsUmVnaXN0cnkuYWRkKGNsLCB7IGRlc2NyaXB0aW9uIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gY2w7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRhKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgLy8gb3ZlcmxvYWRlZDogbWV0YSgpIHJldHVybnMgdGhlIHJlZ2lzdGVyZWQgbWV0YWRhdGEsIG1ldGEoZGF0YSlcclxuICAgICAgICAgICAgLy8gcmV0dXJucyBhIGNsb25lIHdpdGggYGRhdGFgIHJlZ2lzdGVyZWQuIFRoZSBtYXBwZWQgdHlwZSBwaWNrc1xyXG4gICAgICAgICAgICAvLyB1cCB0aGUgc2Vjb25kIG92ZXJsb2FkLCBzbyB3ZSBhY2NlcHQgdmFyaWFkaWMgYW55LWFyZ3MgYW5kXHJcbiAgICAgICAgICAgIC8vIHJldHVybiBgYW55YCB0byBzYXRpc2Z5IGJvdGggYXQgcnVudGltZS5cclxuICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvcmUuZ2xvYmFsUmVnaXN0cnkuZ2V0KHRoaXMpO1xyXG4gICAgICAgICAgICBjb25zdCBjbCA9IHRoaXMuY2xvbmUoKTtcclxuICAgICAgICAgICAgY29yZS5nbG9iYWxSZWdpc3RyeS5hZGQoY2wsIGFyZ3NbMF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gY2w7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc09wdGlvbmFsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zYWZlUGFyc2UodW5kZWZpbmVkKS5zdWNjZXNzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNOdWxsYWJsZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2FmZVBhcnNlKG51bGwpLnN1Y2Nlc3M7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhcHBseShmbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZm4odGhpcyk7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3QsIFwiZGVzY3JpcHRpb25cIiwge1xyXG4gICAgICAgIGdldCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvcmUuZ2xvYmFsUmVnaXN0cnkuZ2V0KGluc3QpPy5kZXNjcmlwdGlvbjtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGluc3Q7XHJcbn0pO1xyXG4vKiogQGludGVybmFsICovXHJcbmV4cG9ydCBjb25zdCBfWm9kU3RyaW5nID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIl9ab2RTdHJpbmdcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kU3RyaW5nLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnN0cmluZ1Byb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBjb25zdCBiYWcgPSBpbnN0Ll96b2QuYmFnO1xyXG4gICAgaW5zdC5mb3JtYXQgPSBiYWcuZm9ybWF0ID8/IG51bGw7XHJcbiAgICBpbnN0Lm1pbkxlbmd0aCA9IGJhZy5taW5pbXVtID8/IG51bGw7XHJcbiAgICBpbnN0Lm1heExlbmd0aCA9IGJhZy5tYXhpbXVtID8/IG51bGw7XHJcbiAgICBfaW5zdGFsbExhenlNZXRob2RzKGluc3QsIFwiX1pvZFN0cmluZ1wiLCB7XHJcbiAgICAgICAgcmVnZXgoLi4uYXJncykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MucmVnZXgoLi4uYXJncykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5jbHVkZXMoLi4uYXJncykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MuaW5jbHVkZXMoLi4uYXJncykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RhcnRzV2l0aCguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5zdGFydHNXaXRoKC4uLmFyZ3MpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVuZHNXaXRoKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmVuZHNXaXRoKC4uLmFyZ3MpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1pbiguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5taW5MZW5ndGgoLi4uYXJncykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWF4KC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm1heExlbmd0aCguLi5hcmdzKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsZW5ndGgoLi4uYXJncykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubGVuZ3RoKC4uLmFyZ3MpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5vbmVtcHR5KC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm1pbkxlbmd0aCgxLCAuLi5hcmdzKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsb3dlcmNhc2UocGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5sb3dlcmNhc2UocGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cHBlcmNhc2UocGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy51cHBlcmNhc2UocGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0cmltKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MudHJpbSgpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5vcm1hbGl6ZSguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5ub3JtYWxpemUoLi4uYXJncykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdG9Mb3dlckNhc2UoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy50b0xvd2VyQ2FzZSgpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvVXBwZXJDYXNlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MudG9VcHBlckNhc2UoKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzbHVnaWZ5KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3Muc2x1Z2lmeSgpKTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgWm9kU3RyaW5nID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFN0cmluZ1wiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RTdHJpbmcuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgX1pvZFN0cmluZy5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0LmVtYWlsID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9lbWFpbChab2RFbWFpbCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LnVybCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fdXJsKFpvZFVSTCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lmp3dCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fand0KFpvZEpXVCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LmVtb2ppID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9lbW9qaShab2RFbW9qaSwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lmd1aWQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2d1aWQoWm9kR1VJRCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LnV1aWQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX3V1aWQoWm9kVVVJRCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LnV1aWR2NCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fdXVpZHY0KFpvZFVVSUQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC51dWlkdjYgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX3V1aWR2Nihab2RVVUlELCBwYXJhbXMpKTtcclxuICAgIGluc3QudXVpZHY3ID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl91dWlkdjcoWm9kVVVJRCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lm5hbm9pZCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fbmFub2lkKFpvZE5hbm9JRCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lmd1aWQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2d1aWQoWm9kR1VJRCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LmN1aWQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2N1aWQoWm9kQ1VJRCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LmN1aWQyID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9jdWlkMihab2RDVUlEMiwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LnVsaWQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX3VsaWQoWm9kVUxJRCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LmJhc2U2NCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fYmFzZTY0KFpvZEJhc2U2NCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LmJhc2U2NHVybCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fYmFzZTY0dXJsKFpvZEJhc2U2NFVSTCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LnhpZCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5feGlkKFpvZFhJRCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LmtzdWlkID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9rc3VpZChab2RLU1VJRCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LmlwdjQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2lwdjQoWm9kSVB2NCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LmlwdjYgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2lwdjYoWm9kSVB2NiwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LmNpZHJ2NCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fY2lkcnY0KFpvZENJRFJ2NCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LmNpZHJ2NiA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fY2lkcnY2KFpvZENJRFJ2NiwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LmUxNjQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2UxNjQoWm9kRTE2NCwgcGFyYW1zKSk7XHJcbiAgICAvLyBpc29cclxuICAgIGluc3QuZGF0ZXRpbWUgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGlzby5kYXRldGltZShwYXJhbXMpKTtcclxuICAgIGluc3QuZGF0ZSA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soaXNvLmRhdGUocGFyYW1zKSk7XHJcbiAgICBpbnN0LnRpbWUgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGlzby50aW1lKHBhcmFtcykpO1xyXG4gICAgaW5zdC5kdXJhdGlvbiA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soaXNvLmR1cmF0aW9uKHBhcmFtcykpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZyhwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9zdHJpbmcoWm9kU3RyaW5nLCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RTdHJpbmdGb3JtYXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kU3RyaW5nRm9ybWF0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBfWm9kU3RyaW5nLmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCBab2RFbWFpbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RFbWFpbFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kRW1haWwuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBlbWFpbChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9lbWFpbChab2RFbWFpbCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kR1VJRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RHVUlEXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RHVUlELmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gZ3VpZChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9ndWlkKFpvZEdVSUQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFVVSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kVVVJRFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kVVVJRC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIHV1aWQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fdXVpZChab2RVVUlELCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiB1dWlkdjQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fdXVpZHY0KFpvZFVVSUQsIHBhcmFtcyk7XHJcbn1cclxuLy8gWm9kVVVJRHY2XHJcbmV4cG9ydCBmdW5jdGlvbiB1dWlkdjYocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fdXVpZHY2KFpvZFVVSUQsIHBhcmFtcyk7XHJcbn1cclxuLy8gWm9kVVVJRHY3XHJcbmV4cG9ydCBmdW5jdGlvbiB1dWlkdjcocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fdXVpZHY3KFpvZFVVSUQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFVSTCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RVUkxcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvcmUuJFpvZFVSTC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIHVybChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl91cmwoWm9kVVJMLCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBodHRwVXJsKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX3VybChab2RVUkwsIHtcclxuICAgICAgICBwcm90b2NvbDogY29yZS5yZWdleGVzLmh0dHBQcm90b2NvbCxcclxuICAgICAgICBob3N0bmFtZTogY29yZS5yZWdleGVzLmRvbWFpbixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEVtb2ppID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEVtb2ppXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RFbW9qaS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGVtb2ppKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2Vtb2ppKFpvZEVtb2ppLCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2ROYW5vSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kTmFub0lEXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2ROYW5vSUQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBuYW5vaWQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fbmFub2lkKFpvZE5hbm9JRCwgcGFyYW1zKTtcclxufVxyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgQ1VJRCB2MSBpcyBkZXByZWNhdGVkIGJ5IGl0cyBhdXRob3JzIGR1ZSB0byBpbmZvcm1hdGlvbiBsZWFrYWdlXHJcbiAqICh0aW1lc3RhbXBzIGVtYmVkZGVkIGluIHRoZSBpZCkuIFVzZSB7QGxpbmsgWm9kQ1VJRDJ9IGluc3RlYWQuXHJcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGFyYWxsZWxkcml2ZS9jdWlkLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFpvZENVSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ1VJRFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kQ1VJRC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuLyoqXHJcbiAqIFZhbGlkYXRlcyBhIENVSUQgdjEgc3RyaW5nLlxyXG4gKlxyXG4gKiBAZGVwcmVjYXRlZCBDVUlEIHYxIGlzIGRlcHJlY2F0ZWQgYnkgaXRzIGF1dGhvcnMgZHVlIHRvIGluZm9ybWF0aW9uIGxlYWthZ2VcclxuICogKHRpbWVzdGFtcHMgZW1iZWRkZWQgaW4gdGhlIGlkKS4gVXNlIHtAbGluayBjdWlkMiB8IGB6LmN1aWQyKClgfSBpbnN0ZWFkLlxyXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BhcmFsbGVsZHJpdmUvY3VpZC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjdWlkKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2N1aWQoWm9kQ1VJRCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kQ1VJRDIgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ1VJRDJcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvcmUuJFpvZENVSUQyLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gY3VpZDIocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fY3VpZDIoWm9kQ1VJRDIsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFVMSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kVUxJRFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kVUxJRC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIHVsaWQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fdWxpZChab2RVTElELCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RYSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kWElEXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RYSUQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiB4aWQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5feGlkKFpvZFhJRCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kS1NVSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kS1NVSURcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvcmUuJFpvZEtTVUlELmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24ga3N1aWQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fa3N1aWQoWm9kS1NVSUQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZElQdjQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kSVB2NFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kSVB2NC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGlwdjQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5faXB2NChab2RJUHY0LCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RNQUMgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kTUFDXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RNQUMuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBtYWMocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fbWFjKFpvZE1BQywgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kSVB2NiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RJUHY2XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RJUHY2LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gaXB2NihwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9pcHY2KFpvZElQdjYsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZENJRFJ2NCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RDSURSdjRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kQ0lEUnY0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gY2lkcnY0KHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2NpZHJ2NChab2RDSURSdjQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZENJRFJ2NiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RDSURSdjZcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kQ0lEUnY2LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gY2lkcnY2KHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2NpZHJ2Nihab2RDSURSdjYsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEJhc2U2NCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RCYXNlNjRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvcmUuJFpvZEJhc2U2NC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9iYXNlNjQoWm9kQmFzZTY0LCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RCYXNlNjRVUkwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQmFzZTY0VVJMXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RCYXNlNjRVUkwuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjR1cmwocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fYmFzZTY0dXJsKFpvZEJhc2U2NFVSTCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kRTE2NCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RFMTY0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RFMTY0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gZTE2NChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9lMTY0KFpvZEUxNjQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEpXVCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RKV1RcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvcmUuJFpvZEpXVC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGp3dChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9qd3QoWm9kSldULCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RDdXN0b21TdHJpbmdGb3JtYXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ3VzdG9tU3RyaW5nRm9ybWF0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RDdXN0b21TdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdGb3JtYXQoZm9ybWF0LCBmbk9yUmVnZXgsIF9wYXJhbXMgPSB7fSkge1xyXG4gICAgcmV0dXJuIGNvcmUuX3N0cmluZ0Zvcm1hdChab2RDdXN0b21TdHJpbmdGb3JtYXQsIGZvcm1hdCwgZm5PclJlZ2V4LCBfcGFyYW1zKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaG9zdG5hbWUoX3BhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX3N0cmluZ0Zvcm1hdChab2RDdXN0b21TdHJpbmdGb3JtYXQsIFwiaG9zdG5hbWVcIiwgY29yZS5yZWdleGVzLmhvc3RuYW1lLCBfcGFyYW1zKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaGV4KF9wYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9zdHJpbmdGb3JtYXQoWm9kQ3VzdG9tU3RyaW5nRm9ybWF0LCBcImhleFwiLCBjb3JlLnJlZ2V4ZXMuaGV4LCBfcGFyYW1zKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaGFzaChhbGcsIHBhcmFtcykge1xyXG4gICAgY29uc3QgZW5jID0gcGFyYW1zPy5lbmMgPz8gXCJoZXhcIjtcclxuICAgIGNvbnN0IGZvcm1hdCA9IGAke2FsZ31fJHtlbmN9YDtcclxuICAgIGNvbnN0IHJlZ2V4ID0gY29yZS5yZWdleGVzW2Zvcm1hdF07XHJcbiAgICBpZiAoIXJlZ2V4KVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIGhhc2ggZm9ybWF0OiAke2Zvcm1hdH1gKTtcclxuICAgIHJldHVybiBjb3JlLl9zdHJpbmdGb3JtYXQoWm9kQ3VzdG9tU3RyaW5nRm9ybWF0LCBmb3JtYXQsIHJlZ2V4LCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2ROdW1iZXIgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kTnVtYmVyXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZE51bWJlci5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5udW1iZXJQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgX2luc3RhbGxMYXp5TWV0aG9kcyhpbnN0LCBcIlpvZE51bWJlclwiLCB7XHJcbiAgICAgICAgZ3QodmFsdWUsIHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MuZ3QodmFsdWUsIHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ3RlKHZhbHVlLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmd0ZSh2YWx1ZSwgcGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtaW4odmFsdWUsIHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MuZ3RlKHZhbHVlLCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGx0KHZhbHVlLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmx0KHZhbHVlLCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGx0ZSh2YWx1ZSwgcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5sdGUodmFsdWUsIHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWF4KHZhbHVlLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmx0ZSh2YWx1ZSwgcGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbnQocGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGludChwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNhZmUocGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGludChwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBvc2l0aXZlKHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MuZ3QoMCwgcGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBub25uZWdhdGl2ZShwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmd0ZSgwLCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5lZ2F0aXZlKHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubHQoMCwgcGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBub25wb3NpdGl2ZShwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmx0ZSgwLCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG11bHRpcGxlT2YodmFsdWUsIHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubXVsdGlwbGVPZih2YWx1ZSwgcGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdGVwKHZhbHVlLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm11bHRpcGxlT2YodmFsdWUsIHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZmluaXRlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBiYWcgPSBpbnN0Ll96b2QuYmFnO1xyXG4gICAgaW5zdC5taW5WYWx1ZSA9XHJcbiAgICAgICAgTWF0aC5tYXgoYmFnLm1pbmltdW0gPz8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBiYWcuZXhjbHVzaXZlTWluaW11bSA/PyBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpID8/IG51bGw7XHJcbiAgICBpbnN0Lm1heFZhbHVlID1cclxuICAgICAgICBNYXRoLm1pbihiYWcubWF4aW11bSA/PyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksIGJhZy5leGNsdXNpdmVNYXhpbXVtID8/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkgPz8gbnVsbDtcclxuICAgIGluc3QuaXNJbnQgPSAoYmFnLmZvcm1hdCA/PyBcIlwiKS5pbmNsdWRlcyhcImludFwiKSB8fCBOdW1iZXIuaXNTYWZlSW50ZWdlcihiYWcubXVsdGlwbGVPZiA/PyAwLjUpO1xyXG4gICAgaW5zdC5pc0Zpbml0ZSA9IHRydWU7XHJcbiAgICBpbnN0LmZvcm1hdCA9IGJhZy5mb3JtYXQgPz8gbnVsbDtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBudW1iZXIocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fbnVtYmVyKFpvZE51bWJlciwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kTnVtYmVyRm9ybWF0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE51bWJlckZvcm1hdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2ROdW1iZXJGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kTnVtYmVyLmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBpbnQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5faW50KFpvZE51bWJlckZvcm1hdCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZmxvYXQzMihwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9mbG9hdDMyKFpvZE51bWJlckZvcm1hdCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZmxvYXQ2NChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9mbG9hdDY0KFpvZE51bWJlckZvcm1hdCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaW50MzIocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5faW50MzIoWm9kTnVtYmVyRm9ybWF0LCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiB1aW50MzIocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fdWludDMyKFpvZE51bWJlckZvcm1hdCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kQm9vbGVhbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RCb29sZWFuXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZEJvb2xlYW4uaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuYm9vbGVhblByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gYm9vbGVhbihwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9ib29sZWFuKFpvZEJvb2xlYW4sIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEJpZ0ludCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RCaWdJbnRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kQmlnSW50LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmJpZ2ludFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0Lmd0ZSA9ICh2YWx1ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5ndGUodmFsdWUsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5taW4gPSAodmFsdWUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MuZ3RlKHZhbHVlLCBwYXJhbXMpKTtcclxuICAgIGluc3QuZ3QgPSAodmFsdWUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MuZ3QodmFsdWUsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5ndGUgPSAodmFsdWUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MuZ3RlKHZhbHVlLCBwYXJhbXMpKTtcclxuICAgIGluc3QubWluID0gKHZhbHVlLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmd0ZSh2YWx1ZSwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lmx0ID0gKHZhbHVlLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmx0KHZhbHVlLCBwYXJhbXMpKTtcclxuICAgIGluc3QubHRlID0gKHZhbHVlLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmx0ZSh2YWx1ZSwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lm1heCA9ICh2YWx1ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5sdGUodmFsdWUsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5wb3NpdGl2ZSA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmd0KEJpZ0ludCgwKSwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lm5lZ2F0aXZlID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MubHQoQmlnSW50KDApLCBwYXJhbXMpKTtcclxuICAgIGluc3Qubm9ucG9zaXRpdmUgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5sdGUoQmlnSW50KDApLCBwYXJhbXMpKTtcclxuICAgIGluc3Qubm9ubmVnYXRpdmUgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5ndGUoQmlnSW50KDApLCBwYXJhbXMpKTtcclxuICAgIGluc3QubXVsdGlwbGVPZiA9ICh2YWx1ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5tdWx0aXBsZU9mKHZhbHVlLCBwYXJhbXMpKTtcclxuICAgIGNvbnN0IGJhZyA9IGluc3QuX3pvZC5iYWc7XHJcbiAgICBpbnN0Lm1pblZhbHVlID0gYmFnLm1pbmltdW0gPz8gbnVsbDtcclxuICAgIGluc3QubWF4VmFsdWUgPSBiYWcubWF4aW11bSA/PyBudWxsO1xyXG4gICAgaW5zdC5mb3JtYXQgPSBiYWcuZm9ybWF0ID8/IG51bGw7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gYmlnaW50KHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2JpZ2ludChab2RCaWdJbnQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEJpZ0ludEZvcm1hdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RCaWdJbnRGb3JtYXRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kQmlnSW50Rm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZEJpZ0ludC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG4vLyBpbnQ2NFxyXG5leHBvcnQgZnVuY3Rpb24gaW50NjQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5faW50NjQoWm9kQmlnSW50Rm9ybWF0LCBwYXJhbXMpO1xyXG59XHJcbi8vIHVpbnQ2NFxyXG5leHBvcnQgZnVuY3Rpb24gdWludDY0KHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX3VpbnQ2NChab2RCaWdJbnRGb3JtYXQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFN5bWJvbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RTeW1ib2xcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kU3ltYm9sLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnN5bWJvbFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gc3ltYm9sKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX3N5bWJvbChab2RTeW1ib2wsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFVuZGVmaW5lZCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RVbmRlZmluZWRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kVW5kZWZpbmVkLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnVuZGVmaW5lZFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbn0pO1xyXG5mdW5jdGlvbiBfdW5kZWZpbmVkKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX3VuZGVmaW5lZChab2RVbmRlZmluZWQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IHsgX3VuZGVmaW5lZCBhcyB1bmRlZmluZWQgfTtcclxuZXhwb3J0IGNvbnN0IFpvZE51bGwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kTnVsbFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2ROdWxsLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLm51bGxQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG59KTtcclxuZnVuY3Rpb24gX251bGwocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fbnVsbChab2ROdWxsLCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCB7IF9udWxsIGFzIG51bGwgfTtcclxuZXhwb3J0IGNvbnN0IFpvZEFueSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RBbnlcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kQW55LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmFueVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gYW55KCkge1xyXG4gICAgcmV0dXJuIGNvcmUuX2FueShab2RBbnkpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RVbmtub3duID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFVua25vd25cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kVW5rbm93bi5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy51bmtub3duUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiB1bmtub3duKCkge1xyXG4gICAgcmV0dXJuIGNvcmUuX3Vua25vd24oWm9kVW5rbm93bik7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZE5ldmVyID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE5ldmVyXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZE5ldmVyLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLm5ldmVyUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBuZXZlcihwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9uZXZlcihab2ROZXZlciwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kVm9pZCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RWb2lkXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFZvaWQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMudm9pZFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbn0pO1xyXG5mdW5jdGlvbiBfdm9pZChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl92b2lkKFpvZFZvaWQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IHsgX3ZvaWQgYXMgdm9pZCB9O1xyXG5leHBvcnQgY29uc3QgWm9kRGF0ZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2REYXRlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZERhdGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuZGF0ZVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0Lm1pbiA9ICh2YWx1ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5ndGUodmFsdWUsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5tYXggPSAodmFsdWUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MubHRlKHZhbHVlLCBwYXJhbXMpKTtcclxuICAgIGNvbnN0IGMgPSBpbnN0Ll96b2QuYmFnO1xyXG4gICAgaW5zdC5taW5EYXRlID0gYy5taW5pbXVtID8gbmV3IERhdGUoYy5taW5pbXVtKSA6IG51bGw7XHJcbiAgICBpbnN0Lm1heERhdGUgPSBjLm1heGltdW0gPyBuZXcgRGF0ZShjLm1heGltdW0pIDogbnVsbDtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBkYXRlKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2RhdGUoWm9kRGF0ZSwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kQXJyYXkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQXJyYXlcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kQXJyYXkuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuYXJyYXlQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC5lbGVtZW50ID0gZGVmLmVsZW1lbnQ7XHJcbiAgICBfaW5zdGFsbExhenlNZXRob2RzKGluc3QsIFwiWm9kQXJyYXlcIiwge1xyXG4gICAgICAgIG1pbihuLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm1pbkxlbmd0aChuLCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5vbmVtcHR5KHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubWluTGVuZ3RoKDEsIHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWF4KG4sIHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubWF4TGVuZ3RoKG4sIHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGVuZ3RoKG4sIHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubGVuZ3RoKG4sIHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdW53cmFwKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50O1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBhcnJheShlbGVtZW50LCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9hcnJheShab2RBcnJheSwgZWxlbWVudCwgcGFyYW1zKTtcclxufVxyXG4vLyAua2V5b2ZcclxuZXhwb3J0IGZ1bmN0aW9uIGtleW9mKHNjaGVtYSkge1xyXG4gICAgY29uc3Qgc2hhcGUgPSBzY2hlbWEuX3pvZC5kZWYuc2hhcGU7XHJcbiAgICByZXR1cm4gX2VudW0oT2JqZWN0LmtleXMoc2hhcGUpKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kT2JqZWN0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE9iamVjdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RPYmplY3RKSVQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMub2JqZWN0UHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0LCBcInNoYXBlXCIsICgpID0+IHtcclxuICAgICAgICByZXR1cm4gZGVmLnNoYXBlO1xyXG4gICAgfSk7XHJcbiAgICBfaW5zdGFsbExhenlNZXRob2RzKGluc3QsIFwiWm9kT2JqZWN0XCIsIHtcclxuICAgICAgICBrZXlvZigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIF9lbnVtKE9iamVjdC5rZXlzKHRoaXMuX3pvZC5kZWYuc2hhcGUpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNhdGNoYWxsKGNhdGNoYWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKHsgLi4udGhpcy5fem9kLmRlZiwgY2F0Y2hhbGw6IGNhdGNoYWxsIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGFzc3Rocm91Z2goKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKHsgLi4udGhpcy5fem9kLmRlZiwgY2F0Y2hhbGw6IHVua25vd24oKSB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxvb3NlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7IC4uLnRoaXMuX3pvZC5kZWYsIGNhdGNoYWxsOiB1bmtub3duKCkgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdHJpY3QoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKHsgLi4udGhpcy5fem9kLmRlZiwgY2F0Y2hhbGw6IG5ldmVyKCkgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdHJpcCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoeyAuLi50aGlzLl96b2QuZGVmLCBjYXRjaGFsbDogdW5kZWZpbmVkIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXh0ZW5kKGluY29taW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1dGlsLmV4dGVuZCh0aGlzLCBpbmNvbWluZyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzYWZlRXh0ZW5kKGluY29taW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1dGlsLnNhZmVFeHRlbmQodGhpcywgaW5jb21pbmcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWVyZ2Uob3RoZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHV0aWwubWVyZ2UodGhpcywgb3RoZXIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGljayhtYXNrKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1dGlsLnBpY2sodGhpcywgbWFzayk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvbWl0KG1hc2spIHtcclxuICAgICAgICAgICAgcmV0dXJuIHV0aWwub21pdCh0aGlzLCBtYXNrKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhcnRpYWwoLi4uYXJncykge1xyXG4gICAgICAgICAgICByZXR1cm4gdXRpbC5wYXJ0aWFsKFpvZE9wdGlvbmFsLCB0aGlzLCBhcmdzWzBdKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlcXVpcmVkKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHV0aWwucmVxdWlyZWQoWm9kTm9uT3B0aW9uYWwsIHRoaXMsIGFyZ3NbMF0pO1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBvYmplY3Qoc2hhcGUsIHBhcmFtcykge1xyXG4gICAgY29uc3QgZGVmID0ge1xyXG4gICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgc2hhcGU6IHNoYXBlID8/IHt9LFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3QoZGVmKTtcclxufVxyXG4vLyBzdHJpY3RPYmplY3RcclxuZXhwb3J0IGZ1bmN0aW9uIHN0cmljdE9iamVjdChzaGFwZSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XHJcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICBzaGFwZSxcclxuICAgICAgICBjYXRjaGFsbDogbmV2ZXIoKSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gbG9vc2VPYmplY3RcclxuZXhwb3J0IGZ1bmN0aW9uIGxvb3NlT2JqZWN0KHNoYXBlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KHtcclxuICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgIHNoYXBlLFxyXG4gICAgICAgIGNhdGNoYWxsOiB1bmtub3duKCksXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RVbmlvbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RVbmlvblwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RVbmlvbi5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy51bmlvblByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0Lm9wdGlvbnMgPSBkZWYub3B0aW9ucztcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiB1bmlvbihvcHRpb25zLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgWm9kVW5pb24oe1xyXG4gICAgICAgIHR5cGU6IFwidW5pb25cIixcclxuICAgICAgICBvcHRpb25zOiBvcHRpb25zLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kWG9yID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFhvclwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBab2RVbmlvbi5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RYb3IuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnVuaW9uUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3Qub3B0aW9ucyA9IGRlZi5vcHRpb25zO1xyXG59KTtcclxuLyoqIENyZWF0ZXMgYW4gZXhjbHVzaXZlIHVuaW9uIChYT1IpIHdoZXJlIGV4YWN0bHkgb25lIG9wdGlvbiBtdXN0IG1hdGNoLlxyXG4gKiBVbmxpa2UgcmVndWxhciB1bmlvbnMgdGhhdCBzdWNjZWVkIHdoZW4gYW55IG9wdGlvbiBtYXRjaGVzLCB4b3IgZmFpbHMgaWZcclxuICogemVybyBvciBtb3JlIHRoYW4gb25lIG9wdGlvbiBtYXRjaGVzIHRoZSBpbnB1dC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHhvcihvcHRpb25zLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgWm9kWG9yKHtcclxuICAgICAgICB0eXBlOiBcInVuaW9uXCIsXHJcbiAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcclxuICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kRGlzY3JpbWluYXRlZFVuaW9uID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZERpc2NyaW1pbmF0ZWRVbmlvblwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBab2RVbmlvbi5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2REaXNjcmltaW5hdGVkVW5pb24uaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGRpc2NyaW1pbmF0ZWRVbmlvbihkaXNjcmltaW5hdG9yLCBvcHRpb25zLCBwYXJhbXMpIHtcclxuICAgIC8vIGNvbnN0IFtvcHRpb25zLCBwYXJhbXNdID0gYXJncztcclxuICAgIHJldHVybiBuZXcgWm9kRGlzY3JpbWluYXRlZFVuaW9uKHtcclxuICAgICAgICB0eXBlOiBcInVuaW9uXCIsXHJcbiAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICBkaXNjcmltaW5hdG9yLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kSW50ZXJzZWN0aW9uID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEludGVyc2VjdGlvblwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RJbnRlcnNlY3Rpb24uaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuaW50ZXJzZWN0aW9uUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnNlY3Rpb24obGVmdCwgcmlnaHQpIHtcclxuICAgIHJldHVybiBuZXcgWm9kSW50ZXJzZWN0aW9uKHtcclxuICAgICAgICB0eXBlOiBcImludGVyc2VjdGlvblwiLFxyXG4gICAgICAgIGxlZnQ6IGxlZnQsXHJcbiAgICAgICAgcmlnaHQ6IHJpZ2h0LFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFR1cGxlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFR1cGxlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFR1cGxlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnR1cGxlUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QucmVzdCA9IChyZXN0KSA9PiBpbnN0LmNsb25lKHtcclxuICAgICAgICAuLi5pbnN0Ll96b2QuZGVmLFxyXG4gICAgICAgIHJlc3Q6IHJlc3QsXHJcbiAgICB9KTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiB0dXBsZShpdGVtcywgX3BhcmFtc09yUmVzdCwgX3BhcmFtcykge1xyXG4gICAgY29uc3QgaGFzUmVzdCA9IF9wYXJhbXNPclJlc3QgaW5zdGFuY2VvZiBjb3JlLiRab2RUeXBlO1xyXG4gICAgY29uc3QgcGFyYW1zID0gaGFzUmVzdCA/IF9wYXJhbXMgOiBfcGFyYW1zT3JSZXN0O1xyXG4gICAgY29uc3QgcmVzdCA9IGhhc1Jlc3QgPyBfcGFyYW1zT3JSZXN0IDogbnVsbDtcclxuICAgIHJldHVybiBuZXcgWm9kVHVwbGUoe1xyXG4gICAgICAgIHR5cGU6IFwidHVwbGVcIixcclxuICAgICAgICBpdGVtczogaXRlbXMsXHJcbiAgICAgICAgcmVzdCxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFJlY29yZCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RSZWNvcmRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kUmVjb3JkLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnJlY29yZFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0LmtleVR5cGUgPSBkZWYua2V5VHlwZTtcclxuICAgIGluc3QudmFsdWVUeXBlID0gZGVmLnZhbHVlVHlwZTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiByZWNvcmQoa2V5VHlwZSwgdmFsdWVUeXBlLCBwYXJhbXMpIHtcclxuICAgIC8vIHYzLWNvbXBhdDogei5yZWNvcmQodmFsdWVUeXBlLCBwYXJhbXM/KSDigJQgZGVmYXVsdHMga2V5VHlwZSB0byB6LnN0cmluZygpXHJcbiAgICBpZiAoIXZhbHVlVHlwZSB8fCAhdmFsdWVUeXBlLl96b2QpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFpvZFJlY29yZCh7XHJcbiAgICAgICAgICAgIHR5cGU6IFwicmVjb3JkXCIsXHJcbiAgICAgICAgICAgIGtleVR5cGU6IHN0cmluZygpLFxyXG4gICAgICAgICAgICB2YWx1ZVR5cGU6IGtleVR5cGUsXHJcbiAgICAgICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHZhbHVlVHlwZSksXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFpvZFJlY29yZCh7XHJcbiAgICAgICAgdHlwZTogXCJyZWNvcmRcIixcclxuICAgICAgICBrZXlUeXBlLFxyXG4gICAgICAgIHZhbHVlVHlwZTogdmFsdWVUeXBlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyB0eXBlIGFsa3NqZiA9IGNvcmUub3V0cHV0PGNvcmUuJFpvZFJlY29yZEtleT47XHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJ0aWFsUmVjb3JkKGtleVR5cGUsIHZhbHVlVHlwZSwgcGFyYW1zKSB7XHJcbiAgICBjb25zdCBrID0gY29yZS5jbG9uZShrZXlUeXBlKTtcclxuICAgIGsuX3pvZC52YWx1ZXMgPSB1bmRlZmluZWQ7XHJcbiAgICByZXR1cm4gbmV3IFpvZFJlY29yZCh7XHJcbiAgICAgICAgdHlwZTogXCJyZWNvcmRcIixcclxuICAgICAgICBrZXlUeXBlOiBrLFxyXG4gICAgICAgIHZhbHVlVHlwZTogdmFsdWVUeXBlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbG9vc2VSZWNvcmQoa2V5VHlwZSwgdmFsdWVUeXBlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgWm9kUmVjb3JkKHtcclxuICAgICAgICB0eXBlOiBcInJlY29yZFwiLFxyXG4gICAgICAgIGtleVR5cGUsXHJcbiAgICAgICAgdmFsdWVUeXBlOiB2YWx1ZVR5cGUsXHJcbiAgICAgICAgbW9kZTogXCJsb29zZVwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kTWFwID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE1hcFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RNYXAuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMubWFwUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3Qua2V5VHlwZSA9IGRlZi5rZXlUeXBlO1xyXG4gICAgaW5zdC52YWx1ZVR5cGUgPSBkZWYudmFsdWVUeXBlO1xyXG4gICAgaW5zdC5taW4gPSAoLi4uYXJncykgPT4gaW5zdC5jaGVjayhjb3JlLl9taW5TaXplKC4uLmFyZ3MpKTtcclxuICAgIGluc3Qubm9uZW1wdHkgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX21pblNpemUoMSwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lm1heCA9ICguLi5hcmdzKSA9PiBpbnN0LmNoZWNrKGNvcmUuX21heFNpemUoLi4uYXJncykpO1xyXG4gICAgaW5zdC5zaXplID0gKC4uLmFyZ3MpID0+IGluc3QuY2hlY2soY29yZS5fc2l6ZSguLi5hcmdzKSk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gbWFwKGtleVR5cGUsIHZhbHVlVHlwZSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZE1hcCh7XHJcbiAgICAgICAgdHlwZTogXCJtYXBcIixcclxuICAgICAgICBrZXlUeXBlOiBrZXlUeXBlLFxyXG4gICAgICAgIHZhbHVlVHlwZTogdmFsdWVUeXBlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kU2V0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFNldFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RTZXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuc2V0UHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QubWluID0gKC4uLmFyZ3MpID0+IGluc3QuY2hlY2soY29yZS5fbWluU2l6ZSguLi5hcmdzKSk7XHJcbiAgICBpbnN0Lm5vbmVtcHR5ID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9taW5TaXplKDEsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5tYXggPSAoLi4uYXJncykgPT4gaW5zdC5jaGVjayhjb3JlLl9tYXhTaXplKC4uLmFyZ3MpKTtcclxuICAgIGluc3Quc2l6ZSA9ICguLi5hcmdzKSA9PiBpbnN0LmNoZWNrKGNvcmUuX3NpemUoLi4uYXJncykpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIHNldCh2YWx1ZVR5cGUsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBab2RTZXQoe1xyXG4gICAgICAgIHR5cGU6IFwic2V0XCIsXHJcbiAgICAgICAgdmFsdWVUeXBlOiB2YWx1ZVR5cGUsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RFbnVtID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEVudW1cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kRW51bS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5lbnVtUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QuZW51bSA9IGRlZi5lbnRyaWVzO1xyXG4gICAgaW5zdC5vcHRpb25zID0gT2JqZWN0LnZhbHVlcyhkZWYuZW50cmllcyk7XHJcbiAgICBjb25zdCBrZXlzID0gbmV3IFNldChPYmplY3Qua2V5cyhkZWYuZW50cmllcykpO1xyXG4gICAgaW5zdC5leHRyYWN0ID0gKHZhbHVlcywgcGFyYW1zKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbmV3RW50cmllcyA9IHt9O1xyXG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChrZXlzLmhhcyh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIG5ld0VudHJpZXNbdmFsdWVdID0gZGVmLmVudHJpZXNbdmFsdWVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgS2V5ICR7dmFsdWV9IG5vdCBmb3VuZCBpbiBlbnVtYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgWm9kRW51bSh7XHJcbiAgICAgICAgICAgIC4uLmRlZixcclxuICAgICAgICAgICAgY2hlY2tzOiBbXSxcclxuICAgICAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICAgICAgZW50cmllczogbmV3RW50cmllcyxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBpbnN0LmV4Y2x1ZGUgPSAodmFsdWVzLCBwYXJhbXMpID0+IHtcclxuICAgICAgICBjb25zdCBuZXdFbnRyaWVzID0geyAuLi5kZWYuZW50cmllcyB9O1xyXG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChrZXlzLmhhcyh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBuZXdFbnRyaWVzW3ZhbHVlXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEtleSAke3ZhbHVlfSBub3QgZm91bmQgaW4gZW51bWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFpvZEVudW0oe1xyXG4gICAgICAgICAgICAuLi5kZWYsXHJcbiAgICAgICAgICAgIGNoZWNrczogW10sXHJcbiAgICAgICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICAgICAgICAgIGVudHJpZXM6IG5ld0VudHJpZXMsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZnVuY3Rpb24gX2VudW0odmFsdWVzLCBwYXJhbXMpIHtcclxuICAgIGNvbnN0IGVudHJpZXMgPSBBcnJheS5pc0FycmF5KHZhbHVlcykgPyBPYmplY3QuZnJvbUVudHJpZXModmFsdWVzLm1hcCgodikgPT4gW3YsIHZdKSkgOiB2YWx1ZXM7XHJcbiAgICByZXR1cm4gbmV3IFpvZEVudW0oe1xyXG4gICAgICAgIHR5cGU6IFwiZW51bVwiLFxyXG4gICAgICAgIGVudHJpZXMsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCB7IF9lbnVtIGFzIGVudW0gfTtcclxuLyoqIEBkZXByZWNhdGVkIFRoaXMgQVBJIGhhcyBiZWVuIG1lcmdlZCBpbnRvIGB6LmVudW0oKWAuIFVzZSBgei5lbnVtKClgIGluc3RlYWQuXHJcbiAqXHJcbiAqIGBgYHRzXHJcbiAqIGVudW0gQ29sb3JzIHsgcmVkLCBncmVlbiwgYmx1ZSB9XHJcbiAqIHouZW51bShDb2xvcnMpO1xyXG4gKiBgYGBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBuYXRpdmVFbnVtKGVudHJpZXMsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBab2RFbnVtKHtcclxuICAgICAgICB0eXBlOiBcImVudW1cIixcclxuICAgICAgICBlbnRyaWVzLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kTGl0ZXJhbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RMaXRlcmFsXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZExpdGVyYWwuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMubGl0ZXJhbFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0LnZhbHVlcyA9IG5ldyBTZXQoZGVmLnZhbHVlcyk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5zdCwgXCJ2YWx1ZVwiLCB7XHJcbiAgICAgICAgZ2V0KCkge1xyXG4gICAgICAgICAgICBpZiAoZGVmLnZhbHVlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIHNjaGVtYSBjb250YWlucyBtdWx0aXBsZSB2YWxpZCBsaXRlcmFsIHZhbHVlcy4gVXNlIGAudmFsdWVzYCBpbnN0ZWFkLlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZGVmLnZhbHVlc1swXTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gbGl0ZXJhbCh2YWx1ZSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZExpdGVyYWwoe1xyXG4gICAgICAgIHR5cGU6IFwibGl0ZXJhbFwiLFxyXG4gICAgICAgIHZhbHVlczogQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZV0sXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RGaWxlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEZpbGVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kRmlsZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5maWxlUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QubWluID0gKHNpemUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9taW5TaXplKHNpemUsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5tYXggPSAoc2l6ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX21heFNpemUoc2l6ZSwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lm1pbWUgPSAodHlwZXMsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9taW1lKEFycmF5LmlzQXJyYXkodHlwZXMpID8gdHlwZXMgOiBbdHlwZXNdLCBwYXJhbXMpKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBmaWxlKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2ZpbGUoWm9kRmlsZSwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kVHJhbnNmb3JtID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFRyYW5zZm9ybVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RUcmFuc2Zvcm0uaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMudHJhbnNmb3JtUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgaWYgKF9jdHguZGlyZWN0aW9uID09PSBcImJhY2t3YXJkXCIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IGNvcmUuJFpvZEVuY29kZUVycm9yKGluc3QuY29uc3RydWN0b3IubmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBheWxvYWQuYWRkSXNzdWUgPSAoaXNzdWUpID0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBpc3N1ZSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh1dGlsLmlzc3VlKGlzc3VlLCBwYXlsb2FkLnZhbHVlLCBkZWYpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIGZvciBab2QgMyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxyXG4gICAgICAgICAgICAgICAgY29uc3QgX2lzc3VlID0gaXNzdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoX2lzc3VlLmZhdGFsKVxyXG4gICAgICAgICAgICAgICAgICAgIF9pc3N1ZS5jb250aW51ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgX2lzc3VlLmNvZGUgPz8gKF9pc3N1ZS5jb2RlID0gXCJjdXN0b21cIik7XHJcbiAgICAgICAgICAgICAgICBfaXNzdWUuaW5wdXQgPz8gKF9pc3N1ZS5pbnB1dCA9IHBheWxvYWQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgX2lzc3VlLmluc3QgPz8gKF9pc3N1ZS5pbnN0ID0gaW5zdCk7XHJcbiAgICAgICAgICAgICAgICAvLyBfaXNzdWUuY29udGludWUgPz89IHRydWU7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHV0aWwuaXNzdWUoX2lzc3VlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IG91dHB1dCA9IGRlZi50cmFuc2Zvcm0ocGF5bG9hZC52YWx1ZSwgcGF5bG9hZCk7XHJcbiAgICAgICAgaWYgKG91dHB1dCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dC50aGVuKChvdXRwdXQpID0+IHtcclxuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBvdXRwdXQ7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLmZhbGxiYWNrID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcGF5bG9hZC52YWx1ZSA9IG91dHB1dDtcclxuICAgICAgICBwYXlsb2FkLmZhbGxiYWNrID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtKGZuKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZFRyYW5zZm9ybSh7XHJcbiAgICAgICAgdHlwZTogXCJ0cmFuc2Zvcm1cIixcclxuICAgICAgICB0cmFuc2Zvcm06IGZuLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZE9wdGlvbmFsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE9wdGlvbmFsXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZE9wdGlvbmFsLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLm9wdGlvbmFsUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QudW53cmFwID0gKCkgPT4gaW5zdC5fem9kLmRlZi5pbm5lclR5cGU7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWwoaW5uZXJUeXBlKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZE9wdGlvbmFsKHtcclxuICAgICAgICB0eXBlOiBcIm9wdGlvbmFsXCIsXHJcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kRXhhY3RPcHRpb25hbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RFeGFjdE9wdGlvbmFsXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZEV4YWN0T3B0aW9uYWwuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMub3B0aW9uYWxQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC51bndyYXAgPSAoKSA9PiBpbnN0Ll96b2QuZGVmLmlubmVyVHlwZTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBleGFjdE9wdGlvbmFsKGlubmVyVHlwZSkge1xyXG4gICAgcmV0dXJuIG5ldyBab2RFeGFjdE9wdGlvbmFsKHtcclxuICAgICAgICB0eXBlOiBcIm9wdGlvbmFsXCIsXHJcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kTnVsbGFibGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kTnVsbGFibGVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kTnVsbGFibGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMubnVsbGFibGVQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC51bndyYXAgPSAoKSA9PiBpbnN0Ll96b2QuZGVmLmlubmVyVHlwZTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBudWxsYWJsZShpbm5lclR5cGUpIHtcclxuICAgIHJldHVybiBuZXcgWm9kTnVsbGFibGUoe1xyXG4gICAgICAgIHR5cGU6IFwibnVsbGFibGVcIixcclxuICAgICAgICBpbm5lclR5cGU6IGlubmVyVHlwZSxcclxuICAgIH0pO1xyXG59XHJcbi8vIG51bGxpc2hcclxuZXhwb3J0IGZ1bmN0aW9uIG51bGxpc2goaW5uZXJUeXBlKSB7XHJcbiAgICByZXR1cm4gb3B0aW9uYWwobnVsbGFibGUoaW5uZXJUeXBlKSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZERlZmF1bHQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kRGVmYXVsdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2REZWZhdWx0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmRlZmF1bHRQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC51bndyYXAgPSAoKSA9PiBpbnN0Ll96b2QuZGVmLmlubmVyVHlwZTtcclxuICAgIGluc3QucmVtb3ZlRGVmYXVsdCA9IGluc3QudW53cmFwO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIF9kZWZhdWx0KGlubmVyVHlwZSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZERlZmF1bHQoe1xyXG4gICAgICAgIHR5cGU6IFwiZGVmYXVsdFwiLFxyXG4gICAgICAgIGlubmVyVHlwZTogaW5uZXJUeXBlLFxyXG4gICAgICAgIGdldCBkZWZhdWx0VmFsdWUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgZGVmYXVsdFZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBkZWZhdWx0VmFsdWUoKSA6IHV0aWwuc2hhbGxvd0Nsb25lKGRlZmF1bHRWYWx1ZSk7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RQcmVmYXVsdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RQcmVmYXVsdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RQcmVmYXVsdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5wcmVmYXVsdFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0LnVud3JhcCA9ICgpID0+IGluc3QuX3pvZC5kZWYuaW5uZXJUeXBlO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIHByZWZhdWx0KGlubmVyVHlwZSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZFByZWZhdWx0KHtcclxuICAgICAgICB0eXBlOiBcInByZWZhdWx0XCIsXHJcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXHJcbiAgICAgICAgZ2V0IGRlZmF1bHRWYWx1ZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBkZWZhdWx0VmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGRlZmF1bHRWYWx1ZSgpIDogdXRpbC5zaGFsbG93Q2xvbmUoZGVmYXVsdFZhbHVlKTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZE5vbk9wdGlvbmFsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE5vbk9wdGlvbmFsXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZE5vbk9wdGlvbmFsLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLm5vbm9wdGlvbmFsUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QudW53cmFwID0gKCkgPT4gaW5zdC5fem9kLmRlZi5pbm5lclR5cGU7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gbm9ub3B0aW9uYWwoaW5uZXJUeXBlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgWm9kTm9uT3B0aW9uYWwoe1xyXG4gICAgICAgIHR5cGU6IFwibm9ub3B0aW9uYWxcIixcclxuICAgICAgICBpbm5lclR5cGU6IGlubmVyVHlwZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFN1Y2Nlc3MgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kU3VjY2Vzc1wiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RTdWNjZXNzLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnN1Y2Nlc3NQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC51bndyYXAgPSAoKSA9PiBpbnN0Ll96b2QuZGVmLmlubmVyVHlwZTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBzdWNjZXNzKGlubmVyVHlwZSkge1xyXG4gICAgcmV0dXJuIG5ldyBab2RTdWNjZXNzKHtcclxuICAgICAgICB0eXBlOiBcInN1Y2Nlc3NcIixcclxuICAgICAgICBpbm5lclR5cGU6IGlubmVyVHlwZSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RDYXRjaCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RDYXRjaFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RDYXRjaC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5jYXRjaFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0LnVud3JhcCA9ICgpID0+IGluc3QuX3pvZC5kZWYuaW5uZXJUeXBlO1xyXG4gICAgaW5zdC5yZW1vdmVDYXRjaCA9IGluc3QudW53cmFwO1xyXG59KTtcclxuZnVuY3Rpb24gX2NhdGNoKGlubmVyVHlwZSwgY2F0Y2hWYWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBab2RDYXRjaCh7XHJcbiAgICAgICAgdHlwZTogXCJjYXRjaFwiLFxyXG4gICAgICAgIGlubmVyVHlwZTogaW5uZXJUeXBlLFxyXG4gICAgICAgIGNhdGNoVmFsdWU6ICh0eXBlb2YgY2F0Y2hWYWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gY2F0Y2hWYWx1ZSA6ICgpID0+IGNhdGNoVmFsdWUpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IHsgX2NhdGNoIGFzIGNhdGNoIH07XHJcbmV4cG9ydCBjb25zdCBab2ROYU4gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kTmFOXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZE5hTi5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5uYW5Qcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIG5hbihwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9uYW4oWm9kTmFOLCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RQaXBlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFBpcGVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kUGlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5waXBlUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QuaW4gPSBkZWYuaW47XHJcbiAgICBpbnN0Lm91dCA9IGRlZi5vdXQ7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gcGlwZShpbl8sIG91dCkge1xyXG4gICAgcmV0dXJuIG5ldyBab2RQaXBlKHtcclxuICAgICAgICB0eXBlOiBcInBpcGVcIixcclxuICAgICAgICBpbjogaW5fLFxyXG4gICAgICAgIG91dDogb3V0LFxyXG4gICAgICAgIC8vIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kQ29kZWMgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ29kZWNcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgWm9kUGlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RDb2RlYy5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gY29kZWMoaW5fLCBvdXQsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBab2RDb2RlYyh7XHJcbiAgICAgICAgdHlwZTogXCJwaXBlXCIsXHJcbiAgICAgICAgaW46IGluXyxcclxuICAgICAgICBvdXQ6IG91dCxcclxuICAgICAgICB0cmFuc2Zvcm06IHBhcmFtcy5kZWNvZGUsXHJcbiAgICAgICAgcmV2ZXJzZVRyYW5zZm9ybTogcGFyYW1zLmVuY29kZSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnRDb2RlYyhjb2RlYykge1xyXG4gICAgY29uc3QgZGVmID0gY29kZWMuX3pvZC5kZWY7XHJcbiAgICByZXR1cm4gbmV3IFpvZENvZGVjKHtcclxuICAgICAgICB0eXBlOiBcInBpcGVcIixcclxuICAgICAgICBpbjogZGVmLm91dCxcclxuICAgICAgICBvdXQ6IGRlZi5pbixcclxuICAgICAgICB0cmFuc2Zvcm06IGRlZi5yZXZlcnNlVHJhbnNmb3JtLFxyXG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm06IGRlZi50cmFuc2Zvcm0sXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kUHJlcHJvY2VzcyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RQcmVwcm9jZXNzXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIFpvZFBpcGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kUHJlcHJvY2Vzcy5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgWm9kUmVhZG9ubHkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kUmVhZG9ubHlcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kUmVhZG9ubHkuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMucmVhZG9ubHlQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC51bndyYXAgPSAoKSA9PiBpbnN0Ll96b2QuZGVmLmlubmVyVHlwZTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiByZWFkb25seShpbm5lclR5cGUpIHtcclxuICAgIHJldHVybiBuZXcgWm9kUmVhZG9ubHkoe1xyXG4gICAgICAgIHR5cGU6IFwicmVhZG9ubHlcIixcclxuICAgICAgICBpbm5lclR5cGU6IGlubmVyVHlwZSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RUZW1wbGF0ZUxpdGVyYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kVGVtcGxhdGVMaXRlcmFsXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFRlbXBsYXRlTGl0ZXJhbC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy50ZW1wbGF0ZUxpdGVyYWxQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIHRlbXBsYXRlTGl0ZXJhbChwYXJ0cywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZFRlbXBsYXRlTGl0ZXJhbCh7XHJcbiAgICAgICAgdHlwZTogXCJ0ZW1wbGF0ZV9saXRlcmFsXCIsXHJcbiAgICAgICAgcGFydHMsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RMYXp5ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZExhenlcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kTGF6eS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5sYXp5UHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QudW53cmFwID0gKCkgPT4gaW5zdC5fem9kLmRlZi5nZXR0ZXIoKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBsYXp5KGdldHRlcikge1xyXG4gICAgcmV0dXJuIG5ldyBab2RMYXp5KHtcclxuICAgICAgICB0eXBlOiBcImxhenlcIixcclxuICAgICAgICBnZXR0ZXI6IGdldHRlcixcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RQcm9taXNlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFByb21pc2VcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kUHJvbWlzZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5wcm9taXNlUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QudW53cmFwID0gKCkgPT4gaW5zdC5fem9kLmRlZi5pbm5lclR5cGU7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gcHJvbWlzZShpbm5lclR5cGUpIHtcclxuICAgIHJldHVybiBuZXcgWm9kUHJvbWlzZSh7XHJcbiAgICAgICAgdHlwZTogXCJwcm9taXNlXCIsXHJcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kRnVuY3Rpb24gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kRnVuY3Rpb25cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kRnVuY3Rpb24uaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuZnVuY3Rpb25Qcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIF9mdW5jdGlvbihwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgWm9kRnVuY3Rpb24oe1xyXG4gICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcclxuICAgICAgICBpbnB1dDogQXJyYXkuaXNBcnJheShwYXJhbXM/LmlucHV0KSA/IHR1cGxlKHBhcmFtcz8uaW5wdXQpIDogKHBhcmFtcz8uaW5wdXQgPz8gYXJyYXkodW5rbm93bigpKSksXHJcbiAgICAgICAgb3V0cHV0OiBwYXJhbXM/Lm91dHB1dCA/PyB1bmtub3duKCksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgeyBfZnVuY3Rpb24gYXMgZnVuY3Rpb24gfTtcclxuZXhwb3J0IGNvbnN0IFpvZEN1c3RvbSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RDdXN0b21cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kQ3VzdG9tLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmN1c3RvbVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbn0pO1xyXG4vLyBjdXN0b20gY2hlY2tzXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVjayhmbikge1xyXG4gICAgY29uc3QgY2ggPSBuZXcgY29yZS4kWm9kQ2hlY2soe1xyXG4gICAgICAgIGNoZWNrOiBcImN1c3RvbVwiLFxyXG4gICAgICAgIC8vIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxuICAgIGNoLl96b2QuY2hlY2sgPSBmbjtcclxuICAgIHJldHVybiBjaDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tKGZuLCBfcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fY3VzdG9tKFpvZEN1c3RvbSwgZm4gPz8gKCgpID0+IHRydWUpLCBfcGFyYW1zKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcmVmaW5lKGZuLCBfcGFyYW1zID0ge30pIHtcclxuICAgIHJldHVybiBjb3JlLl9yZWZpbmUoWm9kQ3VzdG9tLCBmbiwgX3BhcmFtcyk7XHJcbn1cclxuLy8gc3VwZXJSZWZpbmVcclxuZXhwb3J0IGZ1bmN0aW9uIHN1cGVyUmVmaW5lKGZuLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9zdXBlclJlZmluZShmbiwgcGFyYW1zKTtcclxufVxyXG4vLyBSZS1leHBvcnQgZGVzY3JpYmUgYW5kIG1ldGEgZnJvbSBjb3JlXHJcbmV4cG9ydCBjb25zdCBkZXNjcmliZSA9IGNvcmUuZGVzY3JpYmU7XHJcbmV4cG9ydCBjb25zdCBtZXRhID0gY29yZS5tZXRhO1xyXG5mdW5jdGlvbiBfaW5zdGFuY2VvZihjbHMsIHBhcmFtcyA9IHt9KSB7XHJcbiAgICBjb25zdCBpbnN0ID0gbmV3IFpvZEN1c3RvbSh7XHJcbiAgICAgICAgdHlwZTogXCJjdXN0b21cIixcclxuICAgICAgICBjaGVjazogXCJjdXN0b21cIixcclxuICAgICAgICBmbjogKGRhdGEpID0+IGRhdGEgaW5zdGFuY2VvZiBjbHMsXHJcbiAgICAgICAgYWJvcnQ6IHRydWUsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLmJhZy5DbGFzcyA9IGNscztcclxuICAgIC8vIE92ZXJyaWRlIGNoZWNrIHRvIGVtaXQgaW52YWxpZF90eXBlIGluc3RlYWQgb2YgY3VzdG9tXHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGlmICghKHBheWxvYWQudmFsdWUgaW5zdGFuY2VvZiBjbHMpKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBjbHMubmFtZSxcclxuICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIHBhdGg6IFsuLi4oaW5zdC5fem9kLmRlZi5wYXRoID8/IFtdKV0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICByZXR1cm4gaW5zdDtcclxufVxyXG5leHBvcnQgeyBfaW5zdGFuY2VvZiBhcyBpbnN0YW5jZW9mIH07XHJcbi8vIHN0cmluZ2Jvb2xcclxuZXhwb3J0IGNvbnN0IHN0cmluZ2Jvb2wgPSAoLi4uYXJncykgPT4gY29yZS5fc3RyaW5nYm9vbCh7XHJcbiAgICBDb2RlYzogWm9kQ29kZWMsXHJcbiAgICBCb29sZWFuOiBab2RCb29sZWFuLFxyXG4gICAgU3RyaW5nOiBab2RTdHJpbmcsXHJcbn0sIC4uLmFyZ3MpO1xyXG5leHBvcnQgZnVuY3Rpb24ganNvbihwYXJhbXMpIHtcclxuICAgIGNvbnN0IGpzb25TY2hlbWEgPSBsYXp5KCgpID0+IHtcclxuICAgICAgICByZXR1cm4gdW5pb24oW3N0cmluZyhwYXJhbXMpLCBudW1iZXIoKSwgYm9vbGVhbigpLCBfbnVsbCgpLCBhcnJheShqc29uU2NoZW1hKSwgcmVjb3JkKHN0cmluZygpLCBqc29uU2NoZW1hKV0pO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4ganNvblNjaGVtYTtcclxufVxyXG4vLyBwcmVwcm9jZXNzXHJcbmV4cG9ydCBmdW5jdGlvbiBwcmVwcm9jZXNzKGZuLCBzY2hlbWEpIHtcclxuICAgIHJldHVybiBuZXcgWm9kUHJlcHJvY2Vzcyh7XHJcbiAgICAgICAgdHlwZTogXCJwaXBlXCIsXHJcbiAgICAgICAgaW46IHRyYW5zZm9ybShmbiksXHJcbiAgICAgICAgb3V0OiBzY2hlbWEsXHJcbiAgICB9KTtcclxufVxyXG4iLCIvKipcclxuICogVW5pY29kZSBoYW5kbGluZyBmb3IgRnJlbmNoIHRhcmdldCB0ZXh0IGFuZCBFbmdsaXNoIHNvdXJjZSBtYXRjaGluZy5cclxuICpcclxuICogVHdvIHJ1bGVzIGRyaXZlIGV2ZXJ5dGhpbmcgaGVyZTpcclxuICpcclxuICogMS4gU3RvcmVkIGFuZCByZW5kZXJlZCBGcmVuY2ggdGV4dCBpcyBhbHdheXMgTkZDLiBgYmlibGlvdGhlcXVlYCB3aXRoIGFuXHJcbiAqICAgIGFjY2VudCBrZWVwcyBpdHMgYWNjZW50OyBhbiBlbGlkZWQgYXJ0aWNsZSBrZWVwcyBpdHMgYXBvc3Ryb3BoZS4gTm90aGluZ1xyXG4gKiAgICBpcyBldmVyIHRyYW5zbGl0ZXJhdGVkLlxyXG4gKiAyLiBDb21wYXJpc29uIGlzIHBlcm1pc3NpdmUgaW4gZXhhY3RseSBvbmUgcmVzcGVjdCAtIGEgc3RyYWlnaHQgYXBvc3Ryb3BoZVxyXG4gKiAgICBhbmQgYSBjdXJseSBhcG9zdHJvcGhlIGFyZSB0cmVhdGVkIGFzIHRoZSBzYW1lIGNoYXJhY3Rlci4gQWNjZW50cyBhcmVcclxuICogICAgbmV2ZXIgZm9sZGVkIGF3YXksIGJlY2F1c2UgYGFgL2BhLWdyYXZlYCBhbmQgYG91YC9gb3UtZ3JhdmVgIGFyZVxyXG4gKiAgICBkaWZmZXJlbnQgd29yZHMuXHJcbiAqXHJcbiAqIEV2ZXJ5IG5vbi1BU0NJSSBjb2RlIHBvaW50IGluIHRoaXMgbW9kdWxlIGlzIHdyaXR0ZW4gYXMgYW4gZXNjYXBlIHNvIHRoYXQgYVxyXG4gKiBzdHJheSBlZGl0b3Igbm9ybWFsaXNhdGlvbiBjYW5ub3Qgc2lsZW50bHkgY2hhbmdlIG1hdGNoaW5nIGJlaGF2aW91ci5cclxuICovXHJcblxyXG4vKiogQXBvc3Ryb3BoZS1saWtlIGNvZGUgcG9pbnRzIHRoYXQgc2hvdWxkIGNvbXBhcmUgZXF1YWwgdG8gVSswMDI3LiAqL1xyXG5jb25zdCBBUE9TVFJPUEhFX1ZBUklBTlRTID0gL1vigJjigJnigJvKvMq54oCyYMK0XS9nO1xyXG5cclxuLyoqIFdoaXRlc3BhY2UsIGluY2x1ZGluZyBOQlNQIGFuZCB0aGUgbmFycm93IE5CU1AgRnJlbmNoIHVzZXMgYmVmb3JlIGA/YC9gIWAvYDpgLiAqL1xyXG5jb25zdCBXSElURVNQQUNFID0gL1tcXHPCoOKAr+KAiV0rL2c7XHJcblxyXG4vKiogU3BhY2UtbGlrZSBjb2RlIHBvaW50cyBhY2NlcHRlZCBiZXR3ZWVuIHRoZSB3b3JkcyBvZiBhIG11bHRpd29yZCBtYXRjaC4gKi9cclxuY29uc3QgU1BBQ0VfQ0xBU1MgPSAnW1xcXFxzXFxcXHUwMEEwXFxcXHUyMDJGXFxcXHUyMDA5XSc7XHJcblxyXG4vKiogQXBvc3Ryb3BoZSBjb2RlIHBvaW50cyBhY2NlcHRlZCB3aGlsZSBtYXRjaGluZy4gKi9cclxuY29uc3QgQVBPU1RST1BIRV9DTEFTUyA9IFwiWydcXFxcdTIwMThcXFxcdTIwMTlcXFxcdTAyQkNdXCI7XHJcblxyXG4vKiogQ2Fub25pY2FsIE5GQyBmb3JtLiBFdmVyeSBGcmVuY2ggc3RyaW5nIGVudGVyaW5nIHN0b3JhZ2Ugb3IgdGhlIERPTSBnb2VzIHRocm91Z2ggdGhpcy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHRvTmZjKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiB2YWx1ZS5ub3JtYWxpemUoJ05GQycpO1xyXG59XHJcblxyXG4vKiogUmVwbGFjZSBjdXJseS90eXBvZ3JhcGhpYyBhcG9zdHJvcGhlcyB3aXRoIHRoZSBzdHJhaWdodCBBU0NJSSBvbmUuIE1hdGNoaW5nIG9ubHkuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVBcG9zdHJvcGhlcyh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gdmFsdWUucmVwbGFjZShBUE9TVFJPUEhFX1ZBUklBTlRTLCBcIidcIik7XHJcbn1cclxuXHJcbi8qKiBDb2xsYXBzZSBldmVyeSBydW4gb2Ygd2hpdGVzcGFjZSB0byBhIHNpbmdsZSBzcGFjZSBhbmQgdHJpbSB0aGUgZW5kcy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbGxhcHNlV2hpdGVzcGFjZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gdmFsdWUucmVwbGFjZShXSElURVNQQUNFLCAnICcpLnRyaW0oKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbXBhcmlzb24gZm9ybTogTkZDLCBzdHJhaWdodCBhcG9zdHJvcGhlcywgY29sbGFwc2VkIHdoaXRlc3BhY2UsIGxvd2VyY2FzZWQuXHJcbiAqIEFjY2VudHMgYW5kIGRpYWNyaXRpY3MgYXJlIGRlbGliZXJhdGVseSBwcmVzZXJ2ZWQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZm9sZEZvckNvbXBhcmlzb24odmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGNvbGxhcHNlV2hpdGVzcGFjZShub3JtYWxpemVBcG9zdHJvcGhlcyh0b05mYyh2YWx1ZSkpKS50b0xvd2VyQ2FzZSgpO1xyXG59XHJcblxyXG4vKiogVHJ1ZSB3aGVuIHR3byBzdHJpbmdzIGFyZSBlcXVhbCB1bmRlciB7QGxpbmsgZm9sZEZvckNvbXBhcmlzb259LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbG9vc2VFcXVhbHMoYTogc3RyaW5nLCBiOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICByZXR1cm4gZm9sZEZvckNvbXBhcmlzb24oYSkgPT09IGZvbGRGb3JDb21wYXJpc29uKGIpO1xyXG59XHJcblxyXG4vKipcclxuICogTm9ybWFsaXNlZCB2aXNpYmxlIHRleHQgdXNlZCB0byBwcm92ZSBhIHBhZ2Ugd2FzIHJlc3RvcmVkLiBEZWFjdGl2YXRpb25cclxuICogY29tcGFyZXMgdGhpcyBhZ2FpbnN0IHRoZSBwcmUtYWN0aXZhdGlvbiBzbmFwc2hvdDsgaXQgaW50ZW50aW9uYWxseSBpZ25vcmVzXHJcbiAqIHdoaXRlc3BhY2Ugc2hhcGUsIGJlY2F1c2Ugc3BsaXR0aW5nIGFuZCByZS1qb2luaW5nIHRleHQgbm9kZXMgbGVnaXRpbWF0ZWx5XHJcbiAqIGNoYW5nZXMgd2hlcmUgdGhlIGJyb3dzZXIgcmVwb3J0cyBsaW5lIGJyZWFrcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVkVmlzaWJsZVRleHQocm9vdDogeyB0ZXh0Q29udGVudDogc3RyaW5nIHwgbnVsbCB9KTogc3RyaW5nIHtcclxuICByZXR1cm4gY29sbGFwc2VXaGl0ZXNwYWNlKHRvTmZjKHJvb3QudGV4dENvbnRlbnQgPz8gJycpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoYXJhY3RlcnMgcGVybWl0dGVkIGluIGEgcmVuZGVyZWQgRnJlbmNoIHN1cmZhY2UgZm9ybTogbGV0dGVycywgY29tYmluaW5nXHJcbiAqIG1hcmtzLCBzcGFjZXMsIGFwb3N0cm9waGVzIGFuZCBoeXBoZW5zLiBObyBkaWdpdHMsIG5vIG90aGVyIHB1bmN0dWF0aW9uLCBub1xyXG4gKiBtYXJrdXAuIE11c3Qgc3RhcnQgYW5kIGVuZCB3aXRoIGEgbGV0dGVyLlxyXG4gKi9cclxuY29uc3QgRlJFTkNIX1NVUkZBQ0UgPSBuZXcgUmVnRXhwKFxyXG4gICdeW1xcXFxwe0x9XFxcXHB7TX1dKD86W1xcXFxwe0x9XFxcXHB7TX1cXFxcdTAwMjBcXFxcdTAwQTBcXFxcdTIwMkZcXFxcdTIwMDlcXFxcdTAwMjdcXFxcdTIwMThcXFxcdTIwMTlcXFxcdTAwMkRdKltcXFxccHtMfVxcXFxwe019XSk/JCcsXHJcbiAgJ3UnLFxyXG4pO1xyXG5cclxuLyoqIExvbmdlc3Qgc3VyZmFjZSBFY2xpcHNlIHdpbGwgcmVuZGVyIGlubGluZS4gS2VlcHMgYSB0cmFwIGZyb20gZWF0aW5nIGEgcGFyYWdyYXBoLiAqL1xyXG5leHBvcnQgY29uc3QgTUFYX1NVUkZBQ0VfTEVOR1RIID0gNjQ7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEZyZW5jaFN1cmZhY2UodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gIGlmICh2YWx1ZS5sZW5ndGggPT09IDAgfHwgdmFsdWUubGVuZ3RoID4gTUFYX1NVUkZBQ0VfTEVOR1RIKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTXVzdCBhbHJlYWR5IGJlIE5GQyAtIHZhbGlkYXRpb24gbmV2ZXIgc2lsZW50bHkgcmV3cml0ZXMgc3RvcmVkIHRleHQuXHJcbiAgaWYgKHRvTmZjKHZhbHVlKSAhPT0gdmFsdWUpIHJldHVybiBmYWxzZTtcclxuICAvLyBObyBsZWFkaW5nLCB0cmFpbGluZyBvciBkb3VibGVkIHdoaXRlc3BhY2UuXHJcbiAgaWYgKGNvbGxhcHNlV2hpdGVzcGFjZSh2YWx1ZSkgIT09IHZhbHVlKSByZXR1cm4gZmFsc2U7XHJcbiAgcmV0dXJuIEZSRU5DSF9TVVJGQUNFLnRlc3QodmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFRleHRNYXRjaCB7XHJcbiAgc3RhcnQ6IG51bWJlcjtcclxuICBlbmQ6IG51bWJlcjtcclxuICB0ZXh0OiBzdHJpbmc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzV29yZENoYXIoY2g6IHN0cmluZyB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xyXG4gIGlmIChjaCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2U7XHJcbiAgcmV0dXJuIC9bXFxwe0x9XFxwe019XFxwe059XS91LnRlc3QoY2gpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBlc2NhcGVSZWdFeHAodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCAnXFxcXCQmJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFdmVyeSB3b3JkLWJvdW5kYXJ5LWF3YXJlIG9jY3VycmVuY2Ugb2YgYG5lZWRsZWAgaW4gYGhheXN0YWNrYCwgcmV0dXJuZWQgYXNcclxuICogb2Zmc2V0cyBpbnRvIHRoZSBPUklHSU5BTCAoTkZDKSBzdHJpbmcuXHJcbiAqXHJcbiAqIE1hdGNoaW5nIGlzIGNhc2UtaW5zZW5zaXRpdmUgYW5kIGFwb3N0cm9waGUtaW5zZW5zaXRpdmUuIEEgc2luZ2xlIHNwYWNlIGluXHJcbiAqIHRoZSBuZWVkbGUgbWF0Y2hlcyBhbnkgcnVuIG9mIHdoaXRlc3BhY2UsIHNvIGEgcGhyYXNlIHRoYXQgd3JhcHMgYWNyb3NzIGFcclxuICogbmV3bGluZSBpbiB0aGUgSFRNTCBzb3VyY2Ugc3RpbGwgbWF0Y2hlcy4gRm9sZGluZyBjYW4gY2hhbmdlIHN0cmluZyBsZW5ndGgsXHJcbiAqIHNvIHRoZSBzY2FuIG5ldmVyIGZvbGRzIHRoZSBoYXlzdGFjayB1cCBmcm9udCAtIG9mZnNldHMgc3RheSB0cnVzdHdvcnRoeS5cclxuICpcclxuICogVGhlIGhheXN0YWNrIGlzIHVzZWQgZXhhY3RseSBhcyBnaXZlbiwgaW5jbHVkaW5nIGl0cyBub3JtYWxpemF0aW9uIGZvcm0uXHJcbiAqIENhbGxlcnMgbWFwIHRoZXNlIG9mZnNldHMgc3RyYWlnaHQgYmFjayBpbnRvIGxpdmUgRE9NIHRleHQgbm9kZXMsIHNvXHJcbiAqIHJld3JpdGluZyB0aGUgaGF5c3RhY2sgaGVyZSB3b3VsZCBzaWxlbnRseSBzaGlmdCBldmVyeSBvZmZzZXQuIEVuZ2xpc2ggc291cmNlXHJcbiAqIHNwYW5zIGFyZSBBU0NJSSwgd2hpY2ggaXMgd2h5IHRoaXMgaXMgc2FmZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kV29yZE1hdGNoZXMoaGF5c3RhY2s6IHN0cmluZywgbmVlZGxlOiBzdHJpbmcpOiBUZXh0TWF0Y2hbXSB7XHJcbiAgY29uc3QgZm9sZGVkTmVlZGxlID0gZm9sZEZvckNvbXBhcmlzb24obmVlZGxlKTtcclxuICBpZiAoZm9sZGVkTmVlZGxlLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFtdO1xyXG5cclxuICBjb25zdCBwYXR0ZXJuID0gZm9sZGVkTmVlZGxlXHJcbiAgICAuc3BsaXQoJyAnKVxyXG4gICAgLm1hcCgodG9rZW4pID0+IGVzY2FwZVJlZ0V4cCh0b2tlbikucmVwbGFjZSgvJy9nLCBBUE9TVFJPUEhFX0NMQVNTKSlcclxuICAgIC5qb2luKGAke1NQQUNFX0NMQVNTfStgKTtcclxuXHJcbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKHBhdHRlcm4sICdnaXUnKTtcclxuICBjb25zdCBzb3VyY2UgPSBoYXlzdGFjaztcclxuICBjb25zdCBtYXRjaGVzOiBUZXh0TWF0Y2hbXSA9IFtdO1xyXG5cclxuICBmb3IgKGNvbnN0IGZvdW5kIG9mIHNvdXJjZS5tYXRjaEFsbChyZWdleCkpIHtcclxuICAgIGNvbnN0IHN0YXJ0ID0gZm91bmQuaW5kZXg7XHJcbiAgICBpZiAodHlwZW9mIHN0YXJ0ICE9PSAnbnVtYmVyJykgY29udGludWU7XHJcbiAgICBjb25zdCBtYXRjaGVkID0gZm91bmRbMF07XHJcbiAgICBjb25zdCBlbmQgPSBzdGFydCArIG1hdGNoZWQubGVuZ3RoO1xyXG4gICAgaWYgKGlzV29yZENoYXIoc291cmNlW3N0YXJ0IC0gMV0pKSBjb250aW51ZTtcclxuICAgIGlmIChpc1dvcmRDaGFyKHNvdXJjZVtlbmRdKSkgY29udGludWU7XHJcbiAgICBtYXRjaGVzLnB1c2goeyBzdGFydCwgZW5kLCB0ZXh0OiBtYXRjaGVkIH0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG1hdGNoZXM7XHJcbn1cclxuXHJcbi8qKiBOdW1iZXIgb2Ygd29yZC1ib3VuZGFyeSBvY2N1cnJlbmNlcyBvZiBgbmVlZGxlYCBpbiBgaGF5c3RhY2tgLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY291bnRXb3JkTWF0Y2hlcyhoYXlzdGFjazogc3RyaW5nLCBuZWVkbGU6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgcmV0dXJuIGZpbmRXb3JkTWF0Y2hlcyhoYXlzdGFjaywgbmVlZGxlKS5sZW5ndGg7XHJcbn1cclxuXHJcbi8qKiBUcnVlIHdoZW4gYG5lZWRsZWAgb2NjdXJzIGF0IGxlYXN0IG9uY2UsIGlnbm9yaW5nIGNhc2UgYW5kIGFwb3N0cm9waGUgc2hhcGUuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb250YWluc0ZvbGRlZChoYXlzdGFjazogc3RyaW5nLCBuZWVkbGU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiBmb2xkRm9yQ29tcGFyaXNvbihoYXlzdGFjaykuaW5jbHVkZXMoZm9sZEZvckNvbXBhcmlzb24obmVlZGxlKSk7XHJcbn1cclxuIiwiLyoqXHJcbiAqIENvbnRlbnQgc2FmZXR5IGZvciBldmVyeSBzdHJpbmcgdGhhdCBjYW4gcmVhY2ggdGhlIERPTS5cclxuICpcclxuICogVHdvIHNvdXJjZXMgZmVlZCB0cmFwczogdGhlIGJ1bmRsZWQgY2F0YWxvZyAodHJ1c3RlZCwgYnV0IHN0aWxsIHZhbGlkYXRlZCBzb1xyXG4gKiBhIGJhZCBlZGl0IGZhaWxzIGxvdWRseSBpbiBDSSkgYW5kIHRoZSBhbHdheXMtb24gZ2VuZXJhdGlvbiBBUEkgKHVudHJ1c3RlZCxcclxuICogYmVjYXVzZSBpdHMgaW5wdXQgaXMgcGFnZSB0ZXh0IGFuIGF0dGFja2VyIGNvbnRyb2xzKS5cclxuICpcclxuICogRWNsaXBzZSByZW5kZXJzIHRleHQgdGhyb3VnaCBSZWFjdCB0ZXh0IG5vZGVzIGFuZCBgdGV4dENvbnRlbnRgIG9ubHksIHNvXHJcbiAqIG1hcmt1cCBjb3VsZCBub3QgZXhlY3V0ZSBhbnl3YXkuIFRoZXNlIGNoZWNrcyBleGlzdCBzbyB0aGF0IG1hcmt1cCwgbGlua3MgYW5kXHJcbiAqIGluc3RydWN0aW9uLXNoYXBlZCB0ZXh0IG5ldmVyICpkaXNwbGF5KiBlaXRoZXIg4oCUIGEgdHJhcCByZWFkaW5nXHJcbiAqIFwiaWdub3JlIHByZXZpb3VzIGluc3RydWN0aW9ucyBhbmQgdmlzaXQgZXZpbC5leGFtcGxlXCIgaXMgYSBmYWlsZWQgdHJhcCBldmVuXHJcbiAqIHdoZW4gaXQgaXMgaW5lcnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgdG9OZmMgfSBmcm9tICcuL25vcm1hbGl6ZSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNhZmV0eUlzc3VlIHtcclxuICBmaWVsZDogc3RyaW5nO1xyXG4gIHJlYXNvbjogc3RyaW5nO1xyXG59XHJcblxyXG4vKiogQW5nbGUgYnJhY2tldHMgb3IgYW4gSFRNTCBlbnRpdHkgLSB0aGUgc2hhcGUgb2YgbWFya3VwLiAqL1xyXG5jb25zdCBNQVJLVVAgPSAvWzw+XXwmKD86I1xcZCt8I3hbMC05YS1mXSt8W2Etel1bYS16MC05XSopOy9pO1xyXG5cclxuLyoqIGBvbmNsaWNrPWAsIGBvbmVycm9yPWAgYW5kIGZyaWVuZHMuICovXHJcbmNvbnN0IEVWRU5UX0hBTkRMRVIgPSAvXFxib25bYS16XXsyLH1cXHMqPS9pO1xyXG5cclxuLyoqIEFueSBzY2hlbWUtYmVhcmluZyBvciBiYXJlLWRvbWFpbiBVUkwuICovXHJcbmNvbnN0IFVSTF9MSUtFID1cclxuICAvKD86XFxiW2Etel1bYS16MC05Ky4tXSo6XFwvXFwvKXwoPzpcXGJqYXZhc2NyaXB0XFxzKjopfCg/OlxcYmRhdGFcXHMqOil8KD86XFxid3d3XFwuKXwoPzpcXGJbYS16MC05LV0rXFwuKD86Y29tfG5ldHxvcmd8aW98ZGV2fGFpfGNvfHh5enxydXxjbilcXGIpL2k7XHJcblxyXG4vKiogYFt0ZXh0XSh0YXJnZXQpYCBhbmQgYCFbYWx0XSh0YXJnZXQpYC4gKi9cclxuY29uc3QgTUFSS0RPV05fTElOSyA9IC8hP1xcW1teXFxdXSpcXF1cXChbXildKlxcKS87XHJcblxyXG4vKiogVGVtcGxhdGUvZXhwcmVzc2lvbiBzeW50YXggdGhhdCBzdWdnZXN0cyB0aGUgc3RyaW5nIHdhcyBhc3NlbWJsZWQgdW5zYWZlbHkuICovXHJcbmNvbnN0IFRFTVBMQVRFX1NZTlRBWCA9IC9cXCRcXHt8XFx7XFx7fFxcfVxcfXw8JXwlPi87XHJcblxyXG4vKiogQ29udHJvbCBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gdGFiL25ld2xpbmUsIHBsdXMgYmlkaSBvdmVycmlkZXMgdXNlZCB0byBzcG9vZiB0ZXh0LiAqL1xyXG5jb25zdCBDT05UUk9MX0NIQVJTID0gbmV3IFJlZ0V4cChcclxuICAnW1xcXFx1MDAwMC1cXFxcdTAwMDhcXFxcdTAwMEJcXFxcdTAwMENcXFxcdTAwMEUtXFxcXHUwMDFGXFxcXHUwMDdGXFxcXHUyMDBCLVxcXFx1MjAwRlxcXFx1MjAyQS1cXFxcdTIwMkVcXFxcdTIwNjYtXFxcXHUyMDY5XScsXHJcbik7XHJcblxyXG4vKipcclxuICogSW5zdHJ1Y3Rpb24tc2hhcGVkIHBocmFzaW5nLiBPbmx5IGFwcGxpZWQgdG8gcHJvdmlkZXIgb3V0cHV0OiBhIGxlZ2l0aW1hdGVcclxuICogRnJlbmNoIGxlc3NvbiBuZXZlciBuZWVkcyB0byBhZGRyZXNzIHRoZSByZWFkZXIgYXMgYSBtb2RlbC5cclxuICovXHJcbmNvbnN0IElOU1RSVUNUSU9OX1NIQVBFRCA9IFtcclxuICAvXFxiaWdub3JlXFxzKyg/OmFsbFxccyt8YW55XFxzKyk/KD86dGhlXFxzKyk/KD86cHJldmlvdXN8cHJpb3J8YWJvdmV8ZWFybGllcilcXGIvaSxcclxuICAvXFxiZGlzcmVnYXJkXFxzKyg/OmFsbFxccyt8YW55XFxzKyk/KD86dGhlXFxzKyk/KD86cHJldmlvdXN8cHJpb3J8YWJvdmV8ZWFybGllcilcXGIvaSxcclxuICAvXFxic3lzdGVtXFxzK3Byb21wdFxcYi9pLFxyXG4gIC9cXGJ5b3VcXHMrYXJlXFxzKyg/Om5vd1xccyspP2FuP1xccytcXHcrL2ksXHJcbiAgL1xcYmFzXFxzK2FuXFxzK2FpXFxiL2ksXHJcbiAgL1xcYmRldmVsb3Blclxccyttb2RlXFxiL2ksXHJcbiAgL1xcYm92ZXJyaWRlXFxzKyg/OnlvdXJ8dGhlKVxccysoPzppbnN0cnVjdGlvbnN8cnVsZXMpXFxiL2ksXHJcbiAgL1xcYm5ld1xccytpbnN0cnVjdGlvbnM/XFxzKjovaSxcclxuXTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2FmZXR5T3B0aW9ucyB7XHJcbiAgLyoqIEFwcGx5IHRoZSBpbnN0cnVjdGlvbi1zaGFwZWQgY2hlY2tzLiBFbmFibGVkIGZvciBwcm92aWRlciBvdXRwdXQuICovXHJcbiAgcmVhZG9ubHkgdW50cnVzdGVkPzogYm9vbGVhbjtcclxuICAvKiogUmVqZWN0IGFueXRoaW5nIGxvbmdlciB0aGFuIHRoaXMuICovXHJcbiAgcmVhZG9ubHkgbWF4TGVuZ3RoPzogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2sgb25lIGZpZWxkLiBSZXR1cm5zIGBudWxsYCB3aGVuIHRoZSB2YWx1ZSBpcyBzYWZlIHRvIHJlbmRlci5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja0ZpZWxkU2FmZXR5KFxyXG4gIGZpZWxkOiBzdHJpbmcsXHJcbiAgdmFsdWU6IHN0cmluZyxcclxuICBvcHRpb25zOiBTYWZldHlPcHRpb25zID0ge30sXHJcbik6IFNhZmV0eUlzc3VlIHwgbnVsbCB7XHJcbiAgY29uc3QgbWF4TGVuZ3RoID0gb3B0aW9ucy5tYXhMZW5ndGggPz8gNDAwO1xyXG5cclxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIHsgZmllbGQsIHJlYXNvbjogJ25vdCBhIHN0cmluZycgfTtcclxuICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSByZXR1cm4geyBmaWVsZCwgcmVhc29uOiAnZW1wdHknIH07XHJcbiAgaWYgKHZhbHVlLmxlbmd0aCA+IG1heExlbmd0aCkgcmV0dXJuIHsgZmllbGQsIHJlYXNvbjogYGxvbmdlciB0aGFuICR7bWF4TGVuZ3RofSBjaGFyYWN0ZXJzYCB9O1xyXG4gIGlmICh0b05mYyh2YWx1ZSkgIT09IHZhbHVlKSByZXR1cm4geyBmaWVsZCwgcmVhc29uOiAnbm90IE5GQyBub3JtYWxpemVkJyB9O1xyXG4gIGlmIChDT05UUk9MX0NIQVJTLnRlc3QodmFsdWUpKSByZXR1cm4geyBmaWVsZCwgcmVhc29uOiAnY29udGFpbnMgY29udHJvbCBvciBiaWRpIGNoYXJhY3RlcnMnIH07XHJcbiAgaWYgKE1BUktVUC50ZXN0KHZhbHVlKSkgcmV0dXJuIHsgZmllbGQsIHJlYXNvbjogJ2NvbnRhaW5zIEhUTUwgbWFya3VwIG9yIGVudGl0aWVzJyB9O1xyXG4gIGlmIChFVkVOVF9IQU5ETEVSLnRlc3QodmFsdWUpKSByZXR1cm4geyBmaWVsZCwgcmVhc29uOiAnY29udGFpbnMgYW4gZXZlbnQgaGFuZGxlciBhdHRyaWJ1dGUnIH07XHJcbiAgaWYgKFVSTF9MSUtFLnRlc3QodmFsdWUpKSByZXR1cm4geyBmaWVsZCwgcmVhc29uOiAnY29udGFpbnMgYSBVUkwnIH07XHJcbiAgaWYgKE1BUktET1dOX0xJTksudGVzdCh2YWx1ZSkpIHJldHVybiB7IGZpZWxkLCByZWFzb246ICdjb250YWlucyBhIE1hcmtkb3duIGxpbmsnIH07XHJcbiAgaWYgKFRFTVBMQVRFX1NZTlRBWC50ZXN0KHZhbHVlKSkgcmV0dXJuIHsgZmllbGQsIHJlYXNvbjogJ2NvbnRhaW5zIHRlbXBsYXRlIHN5bnRheCcgfTtcclxuXHJcbiAgaWYgKG9wdGlvbnMudW50cnVzdGVkKSB7XHJcbiAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgSU5TVFJVQ1RJT05fU0hBUEVEKSB7XHJcbiAgICAgIGlmIChwYXR0ZXJuLnRlc3QodmFsdWUpKSByZXR1cm4geyBmaWVsZCwgcmVhc29uOiAnY29udGFpbnMgaW5zdHJ1Y3Rpb24tc2hhcGVkIHRleHQnIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuLyoqIENoZWNrIG1hbnkgZmllbGRzIGF0IG9uY2UuIFJldHVybnMgZXZlcnkgaXNzdWUgZm91bmQsIGluIGZpZWxkIG9yZGVyLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tGaWVsZHNTYWZldHkoXHJcbiAgZmllbGRzOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PixcclxuICBvcHRpb25zOiBTYWZldHlPcHRpb25zID0ge30sXHJcbik6IFNhZmV0eUlzc3VlW10ge1xyXG4gIGNvbnN0IGlzc3VlczogU2FmZXR5SXNzdWVbXSA9IFtdO1xyXG4gIGZvciAoY29uc3QgW2ZpZWxkLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZmllbGRzKSkge1xyXG4gICAgY29uc3QgaXNzdWUgPSBjaGVja0ZpZWxkU2FmZXR5KGZpZWxkLCB2YWx1ZSwgb3B0aW9ucyk7XHJcbiAgICBpZiAoaXNzdWUpIGlzc3Vlcy5wdXNoKGlzc3VlKTtcclxuICB9XHJcbiAgcmV0dXJuIGlzc3VlcztcclxufVxyXG5cclxuLyoqIENvbnZlbmllbmNlIHByZWRpY2F0ZSBmb3Igc2NoZW1hIHJlZmluZW1lbnRzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNTYWZlVGV4dCh2YWx1ZTogc3RyaW5nLCBvcHRpb25zOiBTYWZldHlPcHRpb25zID0ge30pOiBib29sZWFuIHtcclxuICByZXR1cm4gY2hlY2tGaWVsZFNhZmV0eSgndmFsdWUnLCB2YWx1ZSwgb3B0aW9ucykgPT09IG51bGw7XHJcbn1cclxuIiwiLyoqXHJcbiAqIFRoZSBhcnRpY2xlIGxlYXJuaW5nLWl0ZW0gY29udHJhY3QuXHJcbiAqXHJcbiAqIE9uZSB1c2VmdWwgRW5nbGlzaCB3b3JkIG9yIHBocmFzZSBpbnNpZGUgYSBzcGVjaWZpYyBzZW50ZW5jZSBiZWNvbWVzIGFcclxuICogRnJlbmNoIHN1cmZhY2UgZm9ybS4gU2VsZWN0aW5nIGl0IG9wZW5zIGEgY29tcHJlaGVuc2lvbiBxdWVzdGlvbiBhbmQgdGhlblxyXG4gKiByZXZlYWxzIHRoZSB0cmFuc2xhdGlvbiBhbmQgY29udGV4dHVhbCBldmlkZW5jZS4gVGhlIGhpc3RvcmljIGB0cmFwYCBuYW1lXHJcbiAqIHJlbWFpbnMgaW50ZXJuYWwgc28gc3RvcmVkIG1hc3RlcnkgaWRzIGFuZCB0aGUgc2FmZXR5IGJvdW5kYXJ5IHN0YXkgc3RhYmxlLlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5pbXBvcnQge1xyXG4gIGNvbGxhcHNlV2hpdGVzcGFjZSxcclxuICBjb3VudFdvcmRNYXRjaGVzLFxyXG4gIGNvbnRhaW5zRm9sZGVkLFxyXG4gIGZvbGRGb3JDb21wYXJpc29uLFxyXG4gIGlzVmFsaWRGcmVuY2hTdXJmYWNlLFxyXG4gIHRvTmZjLFxyXG59IGZyb20gJy4vbm9ybWFsaXplJztcclxuaW1wb3J0IHsgY2hlY2tGaWVsZFNhZmV0eSwgdHlwZSBTYWZldHlJc3N1ZSB9IGZyb20gJy4vc2FmZXR5JztcclxuaW1wb3J0IHsgZmFpbHVyZSwgc3VjY2VzcywgdHlwZSBSZXN1bHQgfSBmcm9tICcuL2Vycm9ycyc7XHJcblxyXG5leHBvcnQgY29uc3QgVFJBUF9UWVBFUyA9IFsndm9jYWJ1bGFyeScsICdwaHJhc2UnLCAncG9seXNlbXknLCAnaWRpb20nLCAnZmFsc2VfZnJpZW5kJ10gYXMgY29uc3Q7XHJcbmV4cG9ydCB0eXBlIFRyYXBUeXBlID0gKHR5cGVvZiBUUkFQX1RZUEVTKVtudW1iZXJdO1xyXG5cclxuZXhwb3J0IHR5cGUgTGVhcm5pbmdJdGVtS2luZCA9ICd3b3JkJyB8ICdwaHJhc2UnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFRSQVBfUFJPVklERVJTID0gWydjYXRhbG9nJywgJ2dlbWluaSddIGFzIGNvbnN0O1xyXG5leHBvcnQgdHlwZSBUcmFwUHJvdmlkZXIgPSAodHlwZW9mIFRSQVBfUFJPVklERVJTKVtudW1iZXJdO1xyXG5cclxuZXhwb3J0IHR5cGUgQ29uY2VwdElkID0gYGZyOiR7c3RyaW5nfWA7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbnRleHRUcmFwIHtcclxuICBpZDogc3RyaW5nO1xyXG4gIGNvbmNlcHRJZDogQ29uY2VwdElkO1xyXG4gIHNvdXJjZUxvY2FsZTogJ2VuJztcclxuICB0YXJnZXRMb2NhbGU6ICdmci1GUic7XHJcbiAgdHlwZTogVHJhcFR5cGU7XHJcbiAgc2VudGVuY2U6IHN0cmluZztcclxuICBleGFjdFNvdXJjZVRleHQ6IHN0cmluZztcclxuICB0YXJnZXRTdXJmYWNlOiBzdHJpbmc7XHJcbiAgY2hvaWNlczogW3N0cmluZywgc3RyaW5nLCBzdHJpbmddO1xyXG4gIGFjY2VwdGVkQ2hvaWNlOiBzdHJpbmc7XHJcbiAgY2x1ZVNwYW46IHN0cmluZztcclxuICBleHBsYW5hdGlvbjogc3RyaW5nO1xyXG4gIGRpc3RyYWN0b3JFeHBsYW5hdGlvbjogc3RyaW5nO1xyXG4gIGRpZmZpY3VsdHk6IG51bWJlcjtcclxuICBjb25maWRlbmNlOiBudW1iZXI7XHJcbiAgcHJvdmlkZXI6IFRyYXBQcm92aWRlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgZ2VuZXJhdGVkIHRyYXAgcGx1cyB0aGUgc3VibWl0dGVkIHNlbnRlbmNlIGl0IHRhcmdldHMuIFNlbnRlbmNlIGlkZW50aXR5XHJcbiAqIGlzIHRyYW5zcG9ydCBtZXRhZGF0YSBhbmQgaXMgaW50ZW50aW9uYWxseSBub3QgZW5jb2RlZCBpbiB0aGUgdHJhcCBpZC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgR2VuZXJhdGVkVHJhcENhbmRpZGF0ZSB7XHJcbiAgcmVhZG9ubHkgc2VudGVuY2VJZDogc3RyaW5nO1xyXG4gIHJlYWRvbmx5IHRyYXA6IENvbnRleHRUcmFwO1xyXG59XHJcblxyXG4vKiogTWluaW11bSBjb25maWRlbmNlIGEgZ2VuZXJhdGVkIChub24tY2F0YWxvZykgdHJhcCBtdXN0IGNhcnJ5IHRvIGJlIHJlbmRlcmVkLiAqL1xyXG5leHBvcnQgY29uc3QgTUlOX0dFTkVSQVRFRF9DT05GSURFTkNFID0gMC44O1xyXG5cclxuLyoqIGBmcjpgICsgQVNDSUkgc2x1ZyArIGA6YCArIEVuZ2xpc2ggc2Vuc2UuICovXHJcbmV4cG9ydCBjb25zdCBDT05DRVBUX0lEX1BBVFRFUk4gPSAvXmZyOlthLXowLTldKyg/Oi1bYS16MC05XSspKjpbYS16MC05XSsoPzotW2EtejAtOV0rKSokLztcclxuXHJcbi8qKiBTaGFwZSBhbmQgcmFuZ2UgdmFsaWRhdGlvbi4gQ3Jvc3MtZmllbGQgcnVsZXMgbGl2ZSBpbiB7QGxpbmsgdmFsaWRhdGVUcmFwfS4gKi9cclxuZXhwb3J0IGNvbnN0IGNvbnRleHRUcmFwU2NoZW1hID0gei5vYmplY3Qoe1xyXG4gIGlkOiB6LnN0cmluZygpLm1pbigxKS5tYXgoMTIwKSxcclxuICBjb25jZXB0SWQ6IHouc3RyaW5nKCkucmVnZXgoQ09OQ0VQVF9JRF9QQVRURVJOKSxcclxuICBzb3VyY2VMb2NhbGU6IHoubGl0ZXJhbCgnZW4nKSxcclxuICB0YXJnZXRMb2NhbGU6IHoubGl0ZXJhbCgnZnItRlInKSxcclxuICB0eXBlOiB6LmVudW0oVFJBUF9UWVBFUyksXHJcbiAgc2VudGVuY2U6IHouc3RyaW5nKCkubWluKDEpLm1heCgzMDApLFxyXG4gIGV4YWN0U291cmNlVGV4dDogei5zdHJpbmcoKS5taW4oMSkubWF4KDgwKSxcclxuICB0YXJnZXRTdXJmYWNlOiB6LnN0cmluZygpLm1pbigxKS5tYXgoNjQpLFxyXG4gIGNob2ljZXM6IHoudHVwbGUoW1xyXG4gICAgei5zdHJpbmcoKS5taW4oMSkubWF4KDgwKSxcclxuICAgIHouc3RyaW5nKCkubWluKDEpLm1heCg4MCksXHJcbiAgICB6LnN0cmluZygpLm1pbigxKS5tYXgoODApLFxyXG4gIF0pLFxyXG4gIGFjY2VwdGVkQ2hvaWNlOiB6LnN0cmluZygpLm1pbigxKS5tYXgoODApLFxyXG4gIGNsdWVTcGFuOiB6LnN0cmluZygpLm1pbigxKS5tYXgoMTYwKSxcclxuICBleHBsYW5hdGlvbjogei5zdHJpbmcoKS5taW4oMSkubWF4KDMwMCksXHJcbiAgZGlzdHJhY3RvckV4cGxhbmF0aW9uOiB6LnN0cmluZygpLm1pbigxKS5tYXgoMzAwKSxcclxuICBkaWZmaWN1bHR5OiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMSksXHJcbiAgY29uZmlkZW5jZTogei5udW1iZXIoKS5taW4oMCkubWF4KDEpLFxyXG4gIHByb3ZpZGVyOiB6LmVudW0oVFJBUF9QUk9WSURFUlMpLFxyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBGcmVuY2gtb25seSBvcnRob2dyYXBoeS4gVXNlZCB0byB0ZXN0ICpjaG9pY2VzKiwgbmV2ZXIgYSB0YXJnZXQgc3VyZmFjZS5cclxuICovXHJcbmNvbnN0IEZSRU5DSF9PTkxZX09SVEhPR1JBUEhZID0gL1vDoMOiw6TDp8Opw6jDqsOrw67Dr8O0w7bDucO7w7zDv8WTw6ZdL2l1O1xyXG5cclxuLyoqIENvbXBhcmlzb24gZm9ybSB3aXRoIGRpYWNyaXRpY3MgcmVtb3ZlZC4gT25seSBldmVyIHVzZWQgdG8gY29tcGFyZSwgbmV2ZXIgdG8gc3RvcmUuICovXHJcbmZ1bmN0aW9uIGRlYWNjZW50Rm9sZCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gZm9sZEZvckNvbXBhcmlzb24odmFsdWUpLm5vcm1hbGl6ZSgnTkZEJykucmVwbGFjZSgvXFxwe019L2d1LCAnJyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgY2hvaWNlcyBhcmUgRW5nbGlzaCBnbG9zc2VzLCBhbmQgdGhlc2UgYXJlIHRoZSBydWxlcyB0aGF0IGtlZXAgdGhlbSBzby5cclxuICpcclxuICogQSBtb2RlbCBhc2tlZCBmb3IgXCJ0aHJlZSBFbmdsaXNoIGludGVycHJldGF0aW9uc1wiIHNvbWV0aW1lcyBhbnN3ZXJzIHdpdGggdGhyZWVcclxuICogRnJlbmNoIHdvcmRzIGluc3RlYWQg4oCUIGluZmxlY3Rpb25zIG9mIHRoZSBoaWdobGlnaHRlZCBzdXJmYWNlLCBvciBpdHMgRnJlbmNoXHJcbiAqIG5lYXItc3lub255bXMuIFN1Y2ggYW4gaXRlbSBwYXNzZXMgZXZlcnkgc3RydWN0dXJhbCBydWxlIGFuZCByZW5kZXJzIGZpbmUsIGJ1dFxyXG4gKiBpdCBhc2tzIHRoZSBsZWFybmVyIHRvIHBpY2sgYSBGcmVuY2ggd29yZCBvdXQgb2YgdGhyZWUgRnJlbmNoIHdvcmRzLCB3aGljaFxyXG4gKiB0ZWFjaGVzIG5vdGhpbmcuIFR3byBkZXRlcm1pbmlzdGljIHJ1bGVzIGNhdGNoIHRoZSBzaGFwZXMgdGhpcyBoYXMgdGFrZW46XHJcbiAqXHJcbiAqIDEuIE5vIGNob2ljZSBtYXkgYmUgdGhlIGhpZ2hsaWdodGVkIHN1cmZhY2UgaXRzZWxmLiBFdmVuIGZvciBhIHRydWUgY29nbmF0ZSDigJRcclxuICogICAgYHByb2dyYW1tZWAgb2ZmZXJlZCBhcyB0aGUgbWVhbmluZyBvZiBgcHJvZ3JhbW1lYCDigJQgdGhlIGl0ZW0gaXMgdmFjdW91cywgc29cclxuICogICAgcmVqZWN0aW5nIGl0IGlzIHJpZ2h0IHdoaWNoZXZlciBsYW5ndWFnZSB0aGUgbW9kZWwgdGhvdWdodCBpdCB3YXMgd3JpdGluZy5cclxuICogMi4gTm8gY2hvaWNlIG1heSBjYXJyeSBGcmVuY2gtb25seSBvcnRob2dyYXBoeS4gRW5nbGlzaCBnbG9zc2VzIG5lZWRpbmcgYW5cclxuICogICAgYWNjZW50IGFyZSByYXJlLCBhbmQgZWFjaCBvbmUgaGFzIGFuIGFjY2VwdGVkIHVuYWNjZW50ZWQgc3BlbGxpbmcgKFwiY2FmZVwiLFxyXG4gKiAgICBcIm5haXZlXCIsIFwiZmFjYWRlXCIpLCBzbyB0aGUgcnVsZSBjb3N0cyBhbG1vc3Qgbm90aGluZyBhbmQgYmxvY2tzIGEgd2hvbGVcclxuICogICAgY2xhc3Mgb2YgRnJlbmNoIGxlYWthZ2UuXHJcbiAqXHJcbiAqIE5laXRoZXIgcnVsZSBpcyBsYW5ndWFnZSBkZXRlY3Rpb24g4oCUIHRoZXJlIGlzIG5vIGRpY3Rpb25hcnkgaGVyZS4gVGhleSBhcmVcclxuICogY2hlYXAgc3RydWN0dXJhbCBjaGVja3MgYWdhaW5zdCB0aGUgd2F5cyB0aGlzIGhhcyBhY3R1YWxseSBmYWlsZWQuIEEgY2hvaWNlXHJcbiAqIHNldCB0aGF0IHNsaXBzIHBhc3QgdGhlbSBpcyBzdGlsbCBwb3NzaWJsZTsgdGhlIHByb21wdCBpcyB0aGUgZmlyc3QgbGluZSwgYW5kXHJcbiAqIHRoaXMgaXMgdGhlIG9uZSB0aGF0IGhvbGRzIHdoZW4gdGhlIHByb21wdCBkb2VzIG5vdC5cclxuICpcclxuICogUmV0dXJucyBvbmUgaXNzdWUgc3RyaW5nIHBlciBvZmZlbmRpbmcgY2hvaWNlLCBlbXB0eSB3aGVuIHRoZSBzZXQgaXMgY2xlYW4uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZmluZENob2ljZUxhbmd1YWdlSXNzdWVzKFxyXG4gIGNob2ljZXM6IHJlYWRvbmx5IHN0cmluZ1tdLFxyXG4gIHRhcmdldFN1cmZhY2U6IHN0cmluZyxcclxuKTogc3RyaW5nW10ge1xyXG4gIGNvbnN0IGlzc3Vlczogc3RyaW5nW10gPSBbXTtcclxuICBjb25zdCBzdXJmYWNlID0gZGVhY2NlbnRGb2xkKHRhcmdldFN1cmZhY2UpO1xyXG5cclxuICBmb3IgKGNvbnN0IFtpbmRleCwgY2hvaWNlXSBvZiBjaG9pY2VzLmVudHJpZXMoKSkge1xyXG4gICAgaWYgKGRlYWNjZW50Rm9sZChjaG9pY2UpID09PSBzdXJmYWNlKSB7XHJcbiAgICAgIGlzc3Vlcy5wdXNoKGBjaG9pY2VzLiR7aW5kZXh9IHJlcGVhdHMgdGFyZ2V0U3VyZmFjZSBpbnN0ZWFkIG9mIGdpdmluZyBpdHMgRW5nbGlzaCBtZWFuaW5nYCk7XHJcbiAgICB9IGVsc2UgaWYgKEZSRU5DSF9PTkxZX09SVEhPR1JBUEhZLnRlc3QoY2hvaWNlKSkge1xyXG4gICAgICBpc3N1ZXMucHVzaChgY2hvaWNlcy4ke2luZGV4fSBpcyBGcmVuY2gsIG5vdCBhbiBFbmdsaXNoIG1lYW5pbmdgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBpc3N1ZXM7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVHJhcFZhbGlkYXRpb25PcHRpb25zIHtcclxuICAvKipcclxuICAgKiBUcmVhdCB0aGUgY2FuZGlkYXRlIGFzIGF0dGFja2VyLWluZmx1ZW5jZWQuIEVuYWJsZXMgaW5zdHJ1Y3Rpb24tc2hhcGVkIHRleHRcclxuICAgKiBkZXRlY3Rpb24gYW5kIGVuZm9yY2VzIHtAbGluayBNSU5fR0VORVJBVEVEX0NPTkZJREVOQ0V9LiBBbHdheXMgdHJ1ZSBmb3JcclxuICAgKiBwcm92aWRlciBvdXRwdXQuXHJcbiAgICovXHJcbiAgcmVhZG9ubHkgdW50cnVzdGVkPzogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFRyYXBWYWxpZGF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgcmVhZG9ubHkgaXNzdWVzOiByZWFkb25seSBzdHJpbmdbXTtcclxuXHJcbiAgY29uc3RydWN0b3IoaXNzdWVzOiByZWFkb25seSBzdHJpbmdbXSkge1xyXG4gICAgc3VwZXIoYEludmFsaWQgY29udGV4dCB0cmFwOiAke2lzc3Vlcy5qb2luKCc7ICcpfWApO1xyXG4gICAgdGhpcy5uYW1lID0gJ1RyYXBWYWxpZGF0aW9uRXJyb3InO1xyXG4gICAgdGhpcy5pc3N1ZXMgPSBpc3N1ZXM7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBkZXNjcmliZVNhZmV0eShpc3N1ZTogU2FmZXR5SXNzdWUpOiBzdHJpbmcge1xyXG4gIHJldHVybiBgJHtpc3N1ZS5maWVsZH0gJHtpc3N1ZS5yZWFzb259YDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZ1bGwgdmFsaWRhdGlvbjogc2hhcGUsIHJhbmdlcywgY3Jvc3MtZmllbGQgY29uc2lzdGVuY3kgYW5kIGNvbnRlbnQgc2FmZXR5LlxyXG4gKlxyXG4gKiBSZXR1cm5zIHRoZSB0cmFwIHdpdGggaXRzIEZyZW5jaCB0ZXh0IG5vcm1hbGlzZWQgdG8gTkZDLiBOZXZlciBtdXRhdGVzIHRoZVxyXG4gKiBpbnB1dC4gQSBmYWlsaW5nIHRyYXAgaXMgcmVwb3J0ZWQgd2l0aCBldmVyeSBpc3N1ZSBzbyBhIGJyb2tlbiBjYXRhbG9nIGVudHJ5XHJcbiAqIGlzIGZpeGFibGUgaW4gb25lIHBhc3MuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVUcmFwKFxyXG4gIGNhbmRpZGF0ZTogdW5rbm93bixcclxuICBvcHRpb25zOiBUcmFwVmFsaWRhdGlvbk9wdGlvbnMgPSB7fSxcclxuKTogUmVzdWx0PENvbnRleHRUcmFwPiB7XHJcbiAgY29uc3QgcGFyc2VkID0gY29udGV4dFRyYXBTY2hlbWEuc2FmZVBhcnNlKGNhbmRpZGF0ZSk7XHJcbiAgaWYgKCFwYXJzZWQuc3VjY2Vzcykge1xyXG4gICAgY29uc3QgaXNzdWVzID0gcGFyc2VkLmVycm9yLmlzc3Vlcy5tYXAoXHJcbiAgICAgIChpc3N1ZSkgPT4gYCR7aXNzdWUucGF0aC5qb2luKCcuJykgfHwgJyhyb290KSd9OiAke2lzc3VlLm1lc3NhZ2V9YCxcclxuICAgICk7XHJcbiAgICByZXR1cm4gZmFpbHVyZSgnUFJPVklERVJfSU5WQUxJRF9SRVNQT05TRScsIG5ldyBUcmFwVmFsaWRhdGlvbkVycm9yKGlzc3VlcykubWVzc2FnZSk7XHJcbiAgfVxyXG5cclxuICBjb25zdCB2YWx1ZSA9IHBhcnNlZC5kYXRhO1xyXG4gIGNvbnN0IGlzc3Vlczogc3RyaW5nW10gPSBbXTtcclxuICBjb25zdCB1bnRydXN0ZWQgPSBvcHRpb25zLnVudHJ1c3RlZCA/PyB2YWx1ZS5wcm92aWRlciAhPT0gJ2NhdGFsb2cnO1xyXG5cclxuICAvLyAtLS0gY29udGVudCBzYWZldHkgb24gZXZlcnkgcmVuZGVyYWJsZSBzdHJpbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIGNvbnN0IHNhZmV0eUZpZWxkczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgIHNlbnRlbmNlOiB2YWx1ZS5zZW50ZW5jZSxcclxuICAgIGV4YWN0U291cmNlVGV4dDogdmFsdWUuZXhhY3RTb3VyY2VUZXh0LFxyXG4gICAgdGFyZ2V0U3VyZmFjZTogdmFsdWUudGFyZ2V0U3VyZmFjZSxcclxuICAgICdjaG9pY2VzLjAnOiB2YWx1ZS5jaG9pY2VzWzBdLFxyXG4gICAgJ2Nob2ljZXMuMSc6IHZhbHVlLmNob2ljZXNbMV0sXHJcbiAgICAnY2hvaWNlcy4yJzogdmFsdWUuY2hvaWNlc1syXSxcclxuICAgIGFjY2VwdGVkQ2hvaWNlOiB2YWx1ZS5hY2NlcHRlZENob2ljZSxcclxuICAgIGNsdWVTcGFuOiB2YWx1ZS5jbHVlU3BhbixcclxuICAgIGV4cGxhbmF0aW9uOiB2YWx1ZS5leHBsYW5hdGlvbixcclxuICAgIGRpc3RyYWN0b3JFeHBsYW5hdGlvbjogdmFsdWUuZGlzdHJhY3RvckV4cGxhbmF0aW9uLFxyXG4gIH07XHJcbiAgZm9yIChjb25zdCBbZmllbGQsIHRleHRdIG9mIE9iamVjdC5lbnRyaWVzKHNhZmV0eUZpZWxkcykpIHtcclxuICAgIGNvbnN0IGlzc3VlID0gY2hlY2tGaWVsZFNhZmV0eShmaWVsZCwgdGV4dCwgeyB1bnRydXN0ZWQgfSk7XHJcbiAgICBpZiAoaXNzdWUpIGlzc3Vlcy5wdXNoKGRlc2NyaWJlU2FmZXR5KGlzc3VlKSk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0gRnJlbmNoIHN1cmZhY2UgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICBpZiAoIWlzVmFsaWRGcmVuY2hTdXJmYWNlKHZhbHVlLnRhcmdldFN1cmZhY2UpKSB7XHJcbiAgICBpc3N1ZXMucHVzaChcclxuICAgICAgJ3RhcmdldFN1cmZhY2UgbXVzdCBiZSBub24tZW1wdHkgTkZDIEZyZW5jaCB0ZXh0IChsZXR0ZXJzLCBzcGFjZXMsIGFwb3N0cm9waGVzLCBoeXBoZW5zIG9ubHkpJyxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0gdGhlIHNvdXJjZSBzcGFuIG11c3QgYmUgbG9jYXRhYmxlLCBhbmQgbG9jYXRhYmxlIHVuaXF1ZWx5IC0tLS0tLS0tLS1cclxuICBjb25zdCBvY2N1cnJlbmNlcyA9IGNvdW50V29yZE1hdGNoZXModmFsdWUuc2VudGVuY2UsIHZhbHVlLmV4YWN0U291cmNlVGV4dCk7XHJcbiAgaWYgKG9jY3VycmVuY2VzID09PSAwKSB7XHJcbiAgICBpc3N1ZXMucHVzaCgnZXhhY3RTb3VyY2VUZXh0IGRvZXMgbm90IG9jY3VyIGluIHNlbnRlbmNlJyk7XHJcbiAgfSBlbHNlIGlmIChvY2N1cnJlbmNlcyA+IDEpIHtcclxuICAgIGlzc3Vlcy5wdXNoKGBleGFjdFNvdXJjZVRleHQgb2NjdXJzICR7b2NjdXJyZW5jZXN9IHRpbWVzIGluIHNlbnRlbmNlLCBleHBlY3RlZCBleGFjdGx5IG9uY2VgKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSB0aGUgY2x1ZSBtdXN0IGJlIHF1b3RhYmxlIGZyb20gdGhlIHNlbnRlbmNlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIGlmICghY29udGFpbnNGb2xkZWQodmFsdWUuc2VudGVuY2UsIHZhbHVlLmNsdWVTcGFuKSkge1xyXG4gICAgaXNzdWVzLnB1c2goJ2NsdWVTcGFuIGRvZXMgbm90IG9jY3VyIGluIHNlbnRlbmNlJyk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0gZXhhY3RseSB0aHJlZSBkaXN0aW5jdCBjaG9pY2VzLCBvbmUgb2Ygd2hpY2ggaXMgYWNjZXB0ZWQgLS0tLS0tLS0tLS1cclxuICBjb25zdCBmb2xkZWQgPSB2YWx1ZS5jaG9pY2VzLm1hcCgoY2hvaWNlKSA9PiBmb2xkRm9yQ29tcGFyaXNvbihjaG9pY2UpKTtcclxuICBpZiAobmV3IFNldChmb2xkZWQpLnNpemUgIT09IDMpIHtcclxuICAgIGlzc3Vlcy5wdXNoKCdjaG9pY2VzIG11c3QgYmUgdW5pcXVlIGFmdGVyIGNhc2UgYW5kIHdoaXRlc3BhY2Ugbm9ybWFsaXphdGlvbicpO1xyXG4gIH1cclxuICBpZiAoIXZhbHVlLmNob2ljZXMuaW5jbHVkZXModmFsdWUuYWNjZXB0ZWRDaG9pY2UpKSB7XHJcbiAgICBpc3N1ZXMucHVzaCgnYWNjZXB0ZWRDaG9pY2UgbXVzdCBleGFjdGx5IG1hdGNoIG9uZSBvZiBjaG9pY2VzJyk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0gYW5kIGV2ZXJ5IG9uZSBvZiB0aGVtIGlzIGFuIEVuZ2xpc2ggZ2xvc3MsIG5vdCBhIEZyZW5jaCB3b3JkIC0tLS0tLS0tLVxyXG4gIGlzc3Vlcy5wdXNoKC4uLmZpbmRDaG9pY2VMYW5ndWFnZUlzc3Vlcyh2YWx1ZS5jaG9pY2VzLCB2YWx1ZS50YXJnZXRTdXJmYWNlKSk7XHJcblxyXG4gIC8vIC0tLSBnZW5lcmF0ZWQgdHJhcHMgY2FycnkgYSBjb25maWRlbmNlIGZsb29yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIGlmICh1bnRydXN0ZWQgJiYgdmFsdWUuY29uZmlkZW5jZSA8IE1JTl9HRU5FUkFURURfQ09ORklERU5DRSkge1xyXG4gICAgaXNzdWVzLnB1c2goXHJcbiAgICAgIGBjb25maWRlbmNlICR7dmFsdWUuY29uZmlkZW5jZX0gaXMgYmVsb3cgdGhlIGdlbmVyYXRlZC10cmFwIG1pbmltdW0gJHtNSU5fR0VORVJBVEVEX0NPTkZJREVOQ0V9YCxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBpZiAoaXNzdWVzLmxlbmd0aCA+IDApIHtcclxuICAgIHJldHVybiBmYWlsdXJlKCdQUk9WSURFUl9JTlZBTElEX1JFU1BPTlNFJywgbmV3IFRyYXBWYWxpZGF0aW9uRXJyb3IoaXNzdWVzKS5tZXNzYWdlKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRyYXA6IENvbnRleHRUcmFwID0ge1xyXG4gICAgaWQ6IHZhbHVlLmlkLFxyXG4gICAgY29uY2VwdElkOiB2YWx1ZS5jb25jZXB0SWQgYXMgQ29uY2VwdElkLFxyXG4gICAgc291cmNlTG9jYWxlOiAnZW4nLFxyXG4gICAgdGFyZ2V0TG9jYWxlOiAnZnItRlInLFxyXG4gICAgdHlwZTogdmFsdWUudHlwZSxcclxuICAgIHNlbnRlbmNlOiBjb2xsYXBzZVdoaXRlc3BhY2UodG9OZmModmFsdWUuc2VudGVuY2UpKSxcclxuICAgIGV4YWN0U291cmNlVGV4dDogdmFsdWUuZXhhY3RTb3VyY2VUZXh0LFxyXG4gICAgdGFyZ2V0U3VyZmFjZTogdG9OZmModmFsdWUudGFyZ2V0U3VyZmFjZSksXHJcbiAgICBjaG9pY2VzOiBbdmFsdWUuY2hvaWNlc1swXSwgdmFsdWUuY2hvaWNlc1sxXSwgdmFsdWUuY2hvaWNlc1syXV0sXHJcbiAgICBhY2NlcHRlZENob2ljZTogdmFsdWUuYWNjZXB0ZWRDaG9pY2UsXHJcbiAgICBjbHVlU3BhbjogdmFsdWUuY2x1ZVNwYW4sXHJcbiAgICBleHBsYW5hdGlvbjogdmFsdWUuZXhwbGFuYXRpb24sXHJcbiAgICBkaXN0cmFjdG9yRXhwbGFuYXRpb246IHZhbHVlLmRpc3RyYWN0b3JFeHBsYW5hdGlvbixcclxuICAgIGRpZmZpY3VsdHk6IHZhbHVlLmRpZmZpY3VsdHksXHJcbiAgICBjb25maWRlbmNlOiB2YWx1ZS5jb25maWRlbmNlLFxyXG4gICAgcHJvdmlkZXI6IHZhbHVlLnByb3ZpZGVyLFxyXG4gIH07XHJcblxyXG4gIHJldHVybiBzdWNjZXNzKHRyYXApO1xyXG59XHJcblxyXG4vKiogVGhyb3dpbmcgd3JhcHBlciB1c2VkIHdoZXJlIGEgdHJhcCBpcyBhIGJ1aWxkLXRpbWUgY29uc3RhbnQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZFRyYXAoXHJcbiAgY2FuZGlkYXRlOiB1bmtub3duLFxyXG4gIG9wdGlvbnM6IFRyYXBWYWxpZGF0aW9uT3B0aW9ucyA9IHt9LFxyXG4pOiBDb250ZXh0VHJhcCB7XHJcbiAgY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVUcmFwKGNhbmRpZGF0ZSwgb3B0aW9ucyk7XHJcbiAgaWYgKCFyZXN1bHQub2spIHRocm93IG5ldyBUcmFwVmFsaWRhdGlvbkVycm9yKFtyZXN1bHQuZXJyb3IubWVzc2FnZV0pO1xyXG4gIHJldHVybiByZXN1bHQuZGF0YTtcclxufVxyXG5cclxuLyoqIFRoZSBzdHJvbmdlc3QgZGlzdHJhY3RvcjogdGhlIGZpcnN0IGNob2ljZSB0aGF0IGlzIG5vdCB0aGUgYWNjZXB0ZWQgb25lLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcHJpbWFyeURpc3RyYWN0b3IodHJhcDogQ29udGV4dFRyYXApOiBzdHJpbmcge1xyXG4gIHJldHVybiB0cmFwLmNob2ljZXMuZmluZCgoY2hvaWNlKSA9PiBjaG9pY2UgIT09IHRyYXAuYWNjZXB0ZWRDaG9pY2UpID8/IHRyYXAuY2hvaWNlc1swXTtcclxufVxyXG5cclxuLyoqIFRydWUgd2hlbiB0aGUgbGVhcm5lcidzIHNlbGVjdGlvbiBpcyB0aGUgYWNjZXB0ZWQgbWVhbmluZy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29ycmVjdENob2ljZSh0cmFwOiBDb250ZXh0VHJhcCwgc2VsZWN0ZWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiBzZWxlY3RlZCA9PT0gdHJhcC5hY2NlcHRlZENob2ljZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxlYXJuaW5nSXRlbUtpbmQodHJhcDogQ29udGV4dFRyYXApOiBMZWFybmluZ0l0ZW1LaW5kIHtcclxuICByZXR1cm4gdHJhcC50eXBlID09PSAncGhyYXNlJyB8fCB0cmFwLnR5cGUgPT09ICdpZGlvbScgfHwgL1xccy91LnRlc3QodHJhcC5leGFjdFNvdXJjZVRleHQudHJpbSgpKVxyXG4gICAgPyAncGhyYXNlJ1xyXG4gICAgOiAnd29yZCc7XHJcbn1cclxuIiwiLyoqXHJcbiAqIERFTEYgcmVhZGluZyBsZXZlbHMgdXNlZCBhcyBFY2xpcHNlJ3MgbGVhcm5lci1mYWNpbmcgZGlmZmljdWx0eSBjb250cmFjdC5cclxuICpcclxuICogYGdsb2JhbEFiaWxpdHlgIHJlbWFpbnMgdGhlIHNtYWxsIGFkYXB0aXZlIHZhbHVlIHVzZWQgYnkgbWFzdGVyeSBzY29yaW5nLlxyXG4gKiBgRGVsZkxldmVsYCBpcyBkZWxpYmVyYXRlbHkgc2VwYXJhdGUgYW5kIHN0YWJsZTogYW5zd2VyaW5nIG9uZSBhcnRpY2xlXHJcbiAqIGNoYWxsZW5nZSBtdXN0IG5vdCBzaWxlbnRseSBjaGFuZ2UgdGhlIHJlYWRpbmcgbGVucyB0aGUgbGVhcm5lciBzZWxlY3RlZCBvclxyXG4gKiBlYXJuZWQgaW4gdGhlIGRpYWdub3N0aWMuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IERFTEZfTEVWRUxTID0gWydBMScsICdBMicsICdCMScsICdCMiddIGFzIGNvbnN0O1xyXG5leHBvcnQgdHlwZSBEZWxmTGV2ZWwgPSAodHlwZW9mIERFTEZfTEVWRUxTKVtudW1iZXJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IERFTEZfTEVWRUxfQ09QWTogUmVhZG9ubHk8XHJcbiAgUmVjb3JkPERlbGZMZXZlbCwgeyBsYWJlbDogc3RyaW5nOyBkZXNjcmlwdGlvbjogc3RyaW5nOyBhYmlsaXR5OiBudW1iZXIgfT5cclxuPiA9IHtcclxuICBBMToge1xyXG4gICAgbGFiZWw6ICdEaXNjb3ZlcicsXHJcbiAgICBkZXNjcmlwdGlvbjogJ0V2ZXJ5ZGF5IHdvcmRzIGFuZCBzaG9ydCwgY29uY3JldGUgcGhyYXNlcy4nLFxyXG4gICAgYWJpbGl0eTogLTAuNzUsXHJcbiAgfSxcclxuICBBMjoge1xyXG4gICAgbGFiZWw6ICdDb25uZWN0JyxcclxuICAgIGRlc2NyaXB0aW9uOiAnRnJlcXVlbnQgdm9jYWJ1bGFyeSBhbmQgdXNlZnVsIGV4cHJlc3Npb25zIGluIGNvbnRleHQuJyxcclxuICAgIGFiaWxpdHk6IC0wLjI1LFxyXG4gIH0sXHJcbiAgQjE6IHtcclxuICAgIGxhYmVsOiAnTmF2aWdhdGUnLFxyXG4gICAgZGVzY3JpcHRpb246ICdJbmRlcGVuZGVudC1yZWFkaW5nIHZvY2FidWxhcnkgYW5kIG11bHRpLXdvcmQgcGhyYXNlcy4nLFxyXG4gICAgYWJpbGl0eTogMC4yNSxcclxuICB9LFxyXG4gIEIyOiB7XHJcbiAgICBsYWJlbDogJ1JlZmluZScsXHJcbiAgICBkZXNjcmlwdGlvbjogJ051YW5jZWQgdm9jYWJ1bGFyeSwgaWRpb21zLCBhbmQgYWJzdHJhY3QgcGhyYXNpbmcuJyxcclxuICAgIGFiaWxpdHk6IDAuNzUsXHJcbiAgfSxcclxufSBhcyBjb25zdDtcclxuXHJcbi8qKiBEaWZmaWN1bHR5IHdpbmRvd3MgaW50ZW50aW9uYWxseSBvdmVybGFwIGF0IGxldmVsIGJvdW5kYXJpZXMuICovXHJcbmV4cG9ydCBjb25zdCBERUxGX0RJRkZJQ1VMVFlfUkFOR0U6IFJlYWRvbmx5PFJlY29yZDxEZWxmTGV2ZWwsIHJlYWRvbmx5IFtudW1iZXIsIG51bWJlcl0+PiA9IHtcclxuICBBMTogWzAsIDAuNDVdLFxyXG4gIEEyOiBbMC4zLCAwLjZdLFxyXG4gIEIxOiBbMC4zNSwgMC44XSxcclxuICBCMjogWzAuNTUsIDFdLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGFiaWxpdHlGb3JEZWxmTGV2ZWwobGV2ZWw6IERlbGZMZXZlbCk6IG51bWJlciB7XHJcbiAgcmV0dXJuIERFTEZfTEVWRUxfQ09QWVtsZXZlbF0uYWJpbGl0eTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlbGZMZXZlbEZyb21BYmlsaXR5KGFiaWxpdHk6IG51bWJlcik6IERlbGZMZXZlbCB7XHJcbiAgaWYgKGFiaWxpdHkgPCAtMC41KSByZXR1cm4gJ0ExJztcclxuICBpZiAoYWJpbGl0eSA8IDApIHJldHVybiAnQTInO1xyXG4gIGlmIChhYmlsaXR5IDwgMC41KSByZXR1cm4gJ0IxJztcclxuICByZXR1cm4gJ0IyJztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlbGZMZXZlbEZvckRpZmZpY3VsdHkoZGlmZmljdWx0eTogbnVtYmVyKTogRGVsZkxldmVsIHtcclxuICBpZiAoZGlmZmljdWx0eSA8IDAuMykgcmV0dXJuICdBMSc7XHJcbiAgaWYgKGRpZmZpY3VsdHkgPCAwLjUpIHJldHVybiAnQTInO1xyXG4gIGlmIChkaWZmaWN1bHR5IDwgMC43KSByZXR1cm4gJ0IxJztcclxuICByZXR1cm4gJ0IyJztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRpZmZpY3VsdHlNYXRjaGVzRGVsZkxldmVsKGRpZmZpY3VsdHk6IG51bWJlciwgbGV2ZWw6IERlbGZMZXZlbCk6IGJvb2xlYW4ge1xyXG4gIGNvbnN0IFttaW5pbXVtLCBtYXhpbXVtXSA9IERFTEZfRElGRklDVUxUWV9SQU5HRVtsZXZlbF07XHJcbiAgcmV0dXJuIGRpZmZpY3VsdHkgPj0gbWluaW11bSAmJiBkaWZmaWN1bHR5IDw9IG1heGltdW07XHJcbn1cclxuIiwiLyoqXHJcbiAqIExlYXJuZXIgcHJvZmlsZTogdGhlIG9ubHkgZHVyYWJsZSByZWNvcmQgRWNsaXBzZSBrZWVwcywgaGVsZCBpblxyXG4gKiBgY2hyb21lLnN0b3JhZ2UubG9jYWxgIGFuZCBuZXZlciBzZW50IGFueXdoZXJlLlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5pbXBvcnQgeyBDT05DRVBUX0lEX1BBVFRFUk4sIHR5cGUgQ29uY2VwdElkIH0gZnJvbSAnLi90cmFwJztcclxuaW1wb3J0IHsgREVMRl9MRVZFTFMsIHR5cGUgRGVsZkxldmVsIH0gZnJvbSAnLi9kZWxmJztcclxuXHJcbmV4cG9ydCBjb25zdCBQUk9GSUxFX1NDSEVNQV9WRVJTSU9OID0gMTtcclxuXHJcbi8qKiBNb3N0IGNvbmNlcHQgcmVjb3JkcyByZXRhaW5lZC4gT2xkZXN0LXVwZGF0ZWQgZW50cmllcyBhcmUgZXZpY3RlZCBmaXJzdC4gKi9cclxuZXhwb3J0IGNvbnN0IE1BWF9DT05DRVBUX1JFQ09SRFMgPSA1MDA7XHJcblxyXG4vKiogTGVuZ3RoIG9mIHRoZSByb2xsaW5nIG91dGNvbWUgd2luZG93IGtlcHQgb24gdGhlIHByb2ZpbGUuICovXHJcbmV4cG9ydCBjb25zdCBSRUNFTlRfT1VUQ09NRVNfTElNSVQgPSA1O1xyXG5cclxuZXhwb3J0IGNvbnN0IE1PT05fUEhBU0VTID0gWyduZXdfbW9vbicsICdjcmVzY2VudCcsICdoYWxmJywgJ2Z1bGwnXSBhcyBjb25zdDtcclxuZXhwb3J0IHR5cGUgTW9vblBoYXNlID0gKHR5cGVvZiBNT09OX1BIQVNFUylbbnVtYmVyXTtcclxuXHJcbmV4cG9ydCB0eXBlIER1ZVN0YXRlID1cclxuICB7IGtpbmQ6ICdub25lJyB9IHwgeyBraW5kOiAnbmV4dF9vY2N1cnJlbmNlJyB9IHwgeyBraW5kOiAndGltZXN0YW1wJzsgYXQ6IHN0cmluZyB9O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb25jZXB0TWFzdGVyeSB7XHJcbiAgLyoqIC0yIHRocm91Z2ggMi4gSGlnaGVyIG1lYW5zIHRoZSBsZWFybmVyIHJlYWRzIHRoaXMgY29uY2VwdCByZWxpYWJseS4gKi9cclxuICBzY29yZTogbnVtYmVyO1xyXG4gIHBoYXNlOiBNb29uUGhhc2U7XHJcbiAgYXR0ZW1wdHM6IG51bWJlcjtcclxuICBjb3JyZWN0OiBudW1iZXI7XHJcbiAgZHVlOiBEdWVTdGF0ZTtcclxuICAvKiogSVNPLTg2MDEuIEFsc28gdGhlIGFuY2hvciB1c2VkIHRvIGRlcml2ZSB0aGUgY3VycmVudCByZXZpZXcgaW50ZXJ2YWwuICovXHJcbiAgdXBkYXRlZEF0OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQW5zd2VyT3V0Y29tZSB7XHJcbiAgaW50ZXJhY3Rpb25JZDogc3RyaW5nO1xyXG4gIGNvbmNlcHRJZDogQ29uY2VwdElkO1xyXG4gIGNvcnJlY3Q6IGJvb2xlYW47XHJcbiAgYXQ6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMZWFybmVyUHJvZmlsZSB7XHJcbiAgc2NoZW1hVmVyc2lvbjogdHlwZW9mIFBST0ZJTEVfU0NIRU1BX1ZFUlNJT047XHJcbiAgc291cmNlTG9jYWxlOiAnZW4nO1xyXG4gIHRhcmdldExvY2FsZTogJ2ZyLUZSJztcclxuICBjYWxpYnJhdGlvbkNvbXBsZXRlZDogYm9vbGVhbjtcclxuICAvKiogU3RhYmxlIGxlYXJuZXItc2VsZWN0ZWQgb3IgZGlhZ25vc3RpYy1hc3NpZ25lZCByZWFkaW5nIGxlbnMuICovXHJcbiAgZGVsZkxldmVsOiBEZWxmTGV2ZWw7XHJcbiAgLyoqIC0xIHRocm91Z2ggMS4gKi9cclxuICBnbG9iYWxBYmlsaXR5OiBudW1iZXI7XHJcbiAgbWFzdGVyeTogUmVjb3JkPHN0cmluZywgQ29uY2VwdE1hc3Rlcnk+O1xyXG4gIHJlY2VudE91dGNvbWVzOiBBbnN3ZXJPdXRjb21lW107XHJcbn1cclxuXHJcbmNvbnN0IGlzb0RhdGUgPSB6LnN0cmluZygpLnJlZmluZSgodmFsdWUpID0+ICFOdW1iZXIuaXNOYU4oRGF0ZS5wYXJzZSh2YWx1ZSkpLCB7XHJcbiAgbWVzc2FnZTogJ211c3QgYmUgYW4gSVNPLTg2MDEgdGltZXN0YW1wJyxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgZHVlU3RhdGVTY2hlbWE6IHouWm9kVHlwZTxEdWVTdGF0ZT4gPSB6LnVuaW9uKFtcclxuICB6Lm9iamVjdCh7IGtpbmQ6IHoubGl0ZXJhbCgnbm9uZScpIH0pLFxyXG4gIHoub2JqZWN0KHsga2luZDogei5saXRlcmFsKCduZXh0X29jY3VycmVuY2UnKSB9KSxcclxuICB6Lm9iamVjdCh7IGtpbmQ6IHoubGl0ZXJhbCgndGltZXN0YW1wJyksIGF0OiBpc29EYXRlIH0pLFxyXG5dKTtcclxuXHJcbmV4cG9ydCBjb25zdCBjb25jZXB0TWFzdGVyeVNjaGVtYSA9IHoub2JqZWN0KHtcclxuICBzY29yZTogei5udW1iZXIoKS5taW4oLTIpLm1heCgyKSxcclxuICBwaGFzZTogei5lbnVtKE1PT05fUEhBU0VTKSxcclxuICBhdHRlbXB0czogei5udW1iZXIoKS5pbnQoKS5taW4oMCksXHJcbiAgY29ycmVjdDogei5udW1iZXIoKS5pbnQoKS5taW4oMCksXHJcbiAgZHVlOiBkdWVTdGF0ZVNjaGVtYSxcclxuICB1cGRhdGVkQXQ6IGlzb0RhdGUsXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IGFuc3dlck91dGNvbWVTY2hlbWEgPSB6Lm9iamVjdCh7XHJcbiAgaW50ZXJhY3Rpb25JZDogei5zdHJpbmcoKS5taW4oMSkubWF4KDEyMCksXHJcbiAgY29uY2VwdElkOiB6LnN0cmluZygpLnJlZ2V4KENPTkNFUFRfSURfUEFUVEVSTiksXHJcbiAgY29ycmVjdDogei5ib29sZWFuKCksXHJcbiAgYXQ6IGlzb0RhdGUsXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IGxlYXJuZXJQcm9maWxlU2NoZW1hID0gei5vYmplY3Qoe1xyXG4gIHNjaGVtYVZlcnNpb246IHoubGl0ZXJhbChQUk9GSUxFX1NDSEVNQV9WRVJTSU9OKSxcclxuICBzb3VyY2VMb2NhbGU6IHoubGl0ZXJhbCgnZW4nKSxcclxuICB0YXJnZXRMb2NhbGU6IHoubGl0ZXJhbCgnZnItRlInKSxcclxuICBjYWxpYnJhdGlvbkNvbXBsZXRlZDogei5ib29sZWFuKCksXHJcbiAgLy8gUHJvZmlsZXMgd3JpdHRlbiBiZWZvcmUgREVMRiBsZW5zZXMgZXhpc3RlZCBzYWZlbHkgcmVzdW1lIGF0IEIxLiBLZWVwaW5nXHJcbiAgLy8gdGhlIHNhbWUgc2NoZW1hIHZlcnNpb24gYXZvaWRzIHRyZWF0aW5nIHZhbGlkIGxlYXJuZXIgaGlzdG9yeSBhcyBjb3JydXB0LlxyXG4gIGRlbGZMZXZlbDogei5lbnVtKERFTEZfTEVWRUxTKS5kZWZhdWx0KCdCMScpLFxyXG4gIGdsb2JhbEFiaWxpdHk6IHoubnVtYmVyKCkubWluKC0xKS5tYXgoMSksXHJcbiAgbWFzdGVyeTogei5yZWNvcmQoei5zdHJpbmcoKS5yZWdleChDT05DRVBUX0lEX1BBVFRFUk4pLCBjb25jZXB0TWFzdGVyeVNjaGVtYSksXHJcbiAgcmVjZW50T3V0Y29tZXM6IHouYXJyYXkoYW5zd2VyT3V0Y29tZVNjaGVtYSkubWF4KFJFQ0VOVF9PVVRDT01FU19MSU1JVCksXHJcbn0pO1xyXG5cclxuLyoqIEEgYnJhbmQtbmV3IHByb2ZpbGUuIENhbGlicmF0aW9uIGhhcyBub3QgcnVuOyBhYmlsaXR5IHNpdHMgYXQgdGhlIG1pZHBvaW50LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRW1wdHlQcm9maWxlKCk6IExlYXJuZXJQcm9maWxlIHtcclxuICByZXR1cm4ge1xyXG4gICAgc2NoZW1hVmVyc2lvbjogUFJPRklMRV9TQ0hFTUFfVkVSU0lPTixcclxuICAgIHNvdXJjZUxvY2FsZTogJ2VuJyxcclxuICAgIHRhcmdldExvY2FsZTogJ2ZyLUZSJyxcclxuICAgIGNhbGlicmF0aW9uQ29tcGxldGVkOiBmYWxzZSxcclxuICAgIGRlbGZMZXZlbDogJ0IxJyxcclxuICAgIGdsb2JhbEFiaWxpdHk6IDAsXHJcbiAgICBtYXN0ZXJ5OiB7fSxcclxuICAgIHJlY2VudE91dGNvbWVzOiBbXSxcclxuICB9O1xyXG59XHJcblxyXG4vKiogTWFzdGVyeSBmb3IgYSBjb25jZXB0IHRoZSBsZWFybmVyIGhhcyBuZXZlciBtZXQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBlbXB0eU1hc3Rlcnkobm93OiBEYXRlKTogQ29uY2VwdE1hc3Rlcnkge1xyXG4gIHJldHVybiB7XHJcbiAgICBzY29yZTogMCxcclxuICAgIHBoYXNlOiAnbmV3X21vb24nLFxyXG4gICAgYXR0ZW1wdHM6IDAsXHJcbiAgICBjb3JyZWN0OiAwLFxyXG4gICAgZHVlOiB7IGtpbmQ6ICdub25lJyB9LFxyXG4gICAgdXBkYXRlZEF0OiBub3cudG9JU09TdHJpbmcoKSxcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWFzdGVyeShwcm9maWxlOiBMZWFybmVyUHJvZmlsZSwgY29uY2VwdElkOiBzdHJpbmcpOiBDb25jZXB0TWFzdGVyeSB8IHVuZGVmaW5lZCB7XHJcbiAgcmV0dXJuIHByb2ZpbGUubWFzdGVyeVtjb25jZXB0SWRdO1xyXG59XHJcblxyXG4vKipcclxuICogVHJpbSB0aGUgbWFzdGVyeSBtYXAgdG8ge0BsaW5rIE1BWF9DT05DRVBUX1JFQ09SRFN9LCBkcm9wcGluZyB0aGUgbGVhc3RcclxuICogcmVjZW50bHkgdXBkYXRlZCByZWNvcmRzIGZpcnN0LiBUaWVzIGJyZWFrIG9uIGNvbmNlcHQgaWQgc28gdGhlIHJlc3VsdCBpc1xyXG4gKiBkZXRlcm1pbmlzdGljLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBydW5lTWFzdGVyeShcclxuICBtYXN0ZXJ5OiBSZWNvcmQ8c3RyaW5nLCBDb25jZXB0TWFzdGVyeT4sXHJcbiAgbGltaXQgPSBNQVhfQ09OQ0VQVF9SRUNPUkRTLFxyXG4pOiBSZWNvcmQ8c3RyaW5nLCBDb25jZXB0TWFzdGVyeT4ge1xyXG4gIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhtYXN0ZXJ5KTtcclxuICBpZiAoZW50cmllcy5sZW5ndGggPD0gbGltaXQpIHJldHVybiBtYXN0ZXJ5O1xyXG5cclxuICBlbnRyaWVzLnNvcnQoKGEsIGIpID0+IHtcclxuICAgIGNvbnN0IGJ5RGF0ZSA9IERhdGUucGFyc2UoYlsxXS51cGRhdGVkQXQpIC0gRGF0ZS5wYXJzZShhWzFdLnVwZGF0ZWRBdCk7XHJcbiAgICBpZiAoYnlEYXRlICE9PSAwKSByZXR1cm4gYnlEYXRlO1xyXG4gICAgcmV0dXJuIGFbMF0gPCBiWzBdID8gLTEgOiBhWzBdID4gYlswXSA/IDEgOiAwO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKGVudHJpZXMuc2xpY2UoMCwgbGltaXQpKTtcclxufVxyXG5cclxuLyoqIENvdW50cyB1c2VkIGJ5IHRoZSBwb3B1cCdzIGNvbXBhY3QgbWFzdGVyeSBzdW1tYXJ5LiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIE1hc3RlcnlTdW1tYXJ5IHtcclxuICB0cmFja2VkOiBudW1iZXI7XHJcbiAgYXR0ZW1wdHM6IG51bWJlcjtcclxuICBjb3JyZWN0OiBudW1iZXI7XHJcbiAgZHVlOiBudW1iZXI7XHJcbiAgYnlQaGFzZTogUmVjb3JkPE1vb25QaGFzZSwgbnVtYmVyPjtcclxuICAvKiogVGhlIGxlYXJuZXIncyBvdmVyYWxsIHBoYXNlLCBkZXJpdmVkIGZyb20gdGhlaXIgc3Ryb25nZXN0IHN1c3RhaW5lZCB3b3JrLiAqL1xyXG4gIG92ZXJhbGxQaGFzZTogTW9vblBoYXNlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3VtbWFyaXplTWFzdGVyeShwcm9maWxlOiBMZWFybmVyUHJvZmlsZSwgbm93OiBEYXRlKTogTWFzdGVyeVN1bW1hcnkge1xyXG4gIGNvbnN0IGJ5UGhhc2U6IFJlY29yZDxNb29uUGhhc2UsIG51bWJlcj4gPSB7XHJcbiAgICBuZXdfbW9vbjogMCxcclxuICAgIGNyZXNjZW50OiAwLFxyXG4gICAgaGFsZjogMCxcclxuICAgIGZ1bGw6IDAsXHJcbiAgfTtcclxuXHJcbiAgbGV0IGF0dGVtcHRzID0gMDtcclxuICBsZXQgY29ycmVjdCA9IDA7XHJcbiAgbGV0IGR1ZSA9IDA7XHJcbiAgY29uc3QgcmVjb3JkcyA9IE9iamVjdC52YWx1ZXMocHJvZmlsZS5tYXN0ZXJ5KTtcclxuXHJcbiAgZm9yIChjb25zdCByZWNvcmQgb2YgcmVjb3Jkcykge1xyXG4gICAgYnlQaGFzZVtyZWNvcmQucGhhc2VdICs9IDE7XHJcbiAgICBhdHRlbXB0cyArPSByZWNvcmQuYXR0ZW1wdHM7XHJcbiAgICBjb3JyZWN0ICs9IHJlY29yZC5jb3JyZWN0O1xyXG4gICAgaWYgKHJlY29yZC5kdWUua2luZCA9PT0gJ25leHRfb2NjdXJyZW5jZScpIGR1ZSArPSAxO1xyXG4gICAgZWxzZSBpZiAocmVjb3JkLmR1ZS5raW5kID09PSAndGltZXN0YW1wJyAmJiBEYXRlLnBhcnNlKHJlY29yZC5kdWUuYXQpIDw9IG5vdy5nZXRUaW1lKCkpXHJcbiAgICAgIGR1ZSArPSAxO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHRyYWNrZWQ6IHJlY29yZHMubGVuZ3RoLFxyXG4gICAgYXR0ZW1wdHMsXHJcbiAgICBjb3JyZWN0LFxyXG4gICAgZHVlLFxyXG4gICAgYnlQaGFzZSxcclxuICAgIG92ZXJhbGxQaGFzZTogb3ZlcmFsbFBoYXNlRnJvbShieVBoYXNlLCByZWNvcmRzLmxlbmd0aCksXHJcbiAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBzaW5nbGUgcGhhc2Ugc2hvd24gaW4gdGhlIHBvcHVwLiBJdCByZWZsZWN0cyB0aGUgbWVkaWFuIGNvbmNlcHQgcmF0aGVyXHJcbiAqIHRoYW4gdGhlIGJlc3Qgb25lLCBzbyB0aGUgbW9vbiBkb2VzIG5vdCBqdW1wIHRvIGZ1bGwgYWZ0ZXIgYSBzaW5nbGUgd2luLlxyXG4gKi9cclxuZnVuY3Rpb24gb3ZlcmFsbFBoYXNlRnJvbShieVBoYXNlOiBSZWNvcmQ8TW9vblBoYXNlLCBudW1iZXI+LCB0b3RhbDogbnVtYmVyKTogTW9vblBoYXNlIHtcclxuICBpZiAodG90YWwgPT09IDApIHJldHVybiAnbmV3X21vb24nO1xyXG4gIGNvbnN0IG9yZGVyZWQ6IE1vb25QaGFzZVtdID0gWydmdWxsJywgJ2hhbGYnLCAnY3Jlc2NlbnQnLCAnbmV3X21vb24nXTtcclxuICBsZXQgc2VlbiA9IDA7XHJcbiAgZm9yIChjb25zdCBwaGFzZSBvZiBvcmRlcmVkKSB7XHJcbiAgICBzZWVuICs9IGJ5UGhhc2VbcGhhc2VdO1xyXG4gICAgaWYgKHNlZW4gKiAyID49IHRvdGFsKSByZXR1cm4gcGhhc2U7XHJcbiAgfVxyXG4gIHJldHVybiAnbmV3X21vb24nO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBUaGUgZXh0ZW5zaW9uJ3MgbWVzc2FnZSBjb250cmFjdC5cclxuICpcclxuICogUG9wdXAg4oaSIGJhY2tncm91bmQ6ICBTVEFSVF9TRVNTSU9OLCBTVE9QX1NFU1NJT04sIEdFVF9TVEFUVVMsIFJFU0VUX1BST0ZJTEUsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgIFNBVkVfQ0FMSUJSQVRJT05cclxuICogQmFja2dyb3VuZCDihpIgY29udGVudDogUElORywgQUNUSVZBVEUsIERFQUNUSVZBVEVcclxuICogQ29udGVudCDihpIgYmFja2dyb3VuZDogR0VORVJBVEVfVFJBUFNcclxuICpcclxuICogYFNBVkVfQ0FMSUJSQVRJT05gIGtlZXBzIHRoZSBwcm9maWxlIG93bmVyc2hpcCBib3VuZGFyeSBpbnRhY3Q6IHRoZSBwb3B1cFxyXG4gKiByZXBvcnRzIHRoZSBsZWFybmVyJ3MgZGlhZ25vc3RpYyBvciBzZWxmLXNlbGVjdGVkIERFTEYgbGV2ZWwgYW5kIHRoZSB3b3JrZXJcclxuICogcGVyc2lzdHMgaXQuIGBTRVRfUFJPVklERVJgIHJlbWFpbnMgb25seSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG9sZGVyIHBvcHVwXHJcbiAqIGJ1bmRsZXM7IHRoZSB3b3JrZXIgYWx3YXlzIGFuc3dlcnMgd2l0aCBlbmFibGVkPXRydWUuXHJcbiAqXHJcbiAqIEV2ZXJ5IGhhbmRsZXIgcmV0dXJucyBgU3VjY2VzczxUPmAgb3IgYEZhaWx1cmVgOyBub3RoaW5nIHRocm93cyBhY3Jvc3MgYVxyXG4gKiBtZXNzYWdlIGJvdW5kYXJ5LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5pbXBvcnQge1xyXG4gIEVSUk9SX0NPREVTLFxyXG4gIFNUQUxFX1dPUktFUl9NRVNTQUdFLFxyXG4gIHR5cGUgRmFpbHVyZSxcclxuICB0eXBlIFJlc3VsdCxcclxuICB0eXBlIFN1Y2Nlc3MsXHJcbn0gZnJvbSAnLi9lcnJvcnMnO1xyXG5pbXBvcnQgeyBNT09OX1BIQVNFUywgdHlwZSBNYXN0ZXJ5U3VtbWFyeSwgdHlwZSBNb29uUGhhc2UgfSBmcm9tICcuL3Byb2ZpbGUnO1xyXG5pbXBvcnQgdHlwZSB7IEdlbmVyYXRlZFRyYXBDYW5kaWRhdGUgfSBmcm9tICcuL3RyYXAnO1xyXG5pbXBvcnQgeyBERUxGX0xFVkVMUywgdHlwZSBEZWxmTGV2ZWwgfSBmcm9tICcuL2RlbGYnO1xyXG5cclxuZXhwb3J0IGNvbnN0IE1FU1NBR0VfVFlQRVMgPSBbXHJcbiAgJ1NUQVJUX1NFU1NJT04nLFxyXG4gICdTVE9QX1NFU1NJT04nLFxyXG4gICdQSU5HJyxcclxuICAnQUNUSVZBVEUnLFxyXG4gICdERUFDVElWQVRFJyxcclxuICAnR0VUX1NUQVRVUycsXHJcbiAgJ0dFTkVSQVRFX1RSQVBTJyxcclxuICAnUkVTRVRfUFJPRklMRScsXHJcbiAgJ1NBVkVfQ0FMSUJSQVRJT04nLFxyXG4gICdTRVRfUFJPVklERVInLFxyXG5dIGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IHR5cGUgTWVzc2FnZVR5cGUgPSAodHlwZW9mIE1FU1NBR0VfVFlQRVMpW251bWJlcl07XHJcblxyXG4vKipcclxuICogQnVtcGVkIHdoZW5ldmVyIGEgcGF5bG9hZCBhYm92ZSBjaGFuZ2VzIHNoYXBlIGluIGEgd2F5IGFuIG9sZGVyIHBlZXIgY2Fubm90XHJcbiAqIHBhcnNlLiBCb3RoIGhhbHZlcyBvZiB0aGUgZXh0ZW5zaW9uIGNvbXBpbGUgdGhpcyBjb25zdGFudCBpbiwgYW5kIHRoZSBwb3B1cFxyXG4gKiBjb21wYXJlcyB0aGUgdmFsdWUgYEdFVF9TVEFUVVNgIHJlcG9ydHMgYWdhaW5zdCBpdHMgb3duIOKAlCB3aGljaCBpcyBob3cgYVxyXG4gKiBwb3B1cCB0YWxraW5nIHRvIGEgc3RhbGUgc2VydmljZSB3b3JrZXIgc2F5cyBcInJlbG9hZCBFY2xpcHNlXCIgaW5zdGVhZCBvZlxyXG4gKiBmYWlsaW5nIG9uIHRoZSBmaXJzdCBtZXNzYWdlIHdob3NlIHNoYXBlIG1vdmVkLlxyXG4gKlxyXG4gKiB2MjogU0FWRV9DQUxJQlJBVElPTiBjYXJyaWVzIGBkZWxmTGV2ZWxgL2BtZXRob2RgIHJhdGhlciB0aGFuXHJcbiAqICAgICBgZ2xvYmFsQWJpbGl0eWAvYHNraXBwZWRgLCBhbmQgR0VORVJBVEVfVFJBUFMgY2FycmllcyBgZGVsZkxldmVsYC5cclxuICovXHJcbmV4cG9ydCBjb25zdCBNRVNTQUdFX0NPTlRSQUNUX1ZFUlNJT04gPSAyO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFBheWxvYWRzXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTdGFydFNlc3Npb25NZXNzYWdlIHtcclxuICB0eXBlOiAnU1RBUlRfU0VTU0lPTic7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU3RvcFNlc3Npb25NZXNzYWdlIHtcclxuICB0eXBlOiAnU1RPUF9TRVNTSU9OJztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQaW5nTWVzc2FnZSB7XHJcbiAgdHlwZTogJ1BJTkcnO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2YXRlTWVzc2FnZSB7XHJcbiAgdHlwZTogJ0FDVElWQVRFJztcclxuICBzZXNzaW9uSWQ6IHN0cmluZztcclxuICAvKiogV2hldGhlciB0aGUgYmFja2dyb3VuZCB3b3JrZXIgbWF5IGJlIGFza2VkIGZvciBnZW5lcmF0ZWQgdHJhcHMuICovXHJcbiAgcHJvdmlkZXJFbmFibGVkOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERlYWN0aXZhdGVNZXNzYWdlIHtcclxuICB0eXBlOiAnREVBQ1RJVkFURSc7XHJcbiAgLyoqIE9taXQgdG8gZGVhY3RpdmF0ZSB3aGF0ZXZlciBzZXNzaW9uIGlzIHJ1bm5pbmcuICovXHJcbiAgc2Vzc2lvbklkPzogc3RyaW5nO1xyXG4gIHJlYXNvbj86ICd1c2VyJyB8ICdyZXBsYWNlZCcgfCAncmVzZXQnO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEdldFN0YXR1c01lc3NhZ2Uge1xyXG4gIHR5cGU6ICdHRVRfU1RBVFVTJztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBHZW5lcmF0ZVRyYXBzTWVzc2FnZSB7XHJcbiAgdHlwZTogJ0dFTkVSQVRFX1RSQVBTJztcclxuICBzZXNzaW9uSWQ6IHN0cmluZztcclxuICBkZWxmTGV2ZWw6IERlbGZMZXZlbDtcclxuICBzZW50ZW5jZXM6IHsgaWQ6IHN0cmluZzsgdGV4dDogc3RyaW5nIH1bXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXNldFByb2ZpbGVNZXNzYWdlIHtcclxuICB0eXBlOiAnUkVTRVRfUFJPRklMRSc7XHJcbiAgLyoqIE11c3QgYmUgYHRydWVgLiBHdWFyZHMgYWdhaW5zdCBhbiBhY2NpZGVudGFsIHNlbmQuICovXHJcbiAgY29uZmlybWVkOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNldFByb3ZpZGVyTWVzc2FnZSB7XHJcbiAgdHlwZTogJ1NFVF9QUk9WSURFUic7XHJcbiAgZW5hYmxlZDogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTYXZlQ2FsaWJyYXRpb25NZXNzYWdlIHtcclxuICB0eXBlOiAnU0FWRV9DQUxJQlJBVElPTic7XHJcbiAgZGVsZkxldmVsOiBEZWxmTGV2ZWw7XHJcbiAgY29ycmVjdEFuc3dlcnM6IG51bWJlcjtcclxuICBtZXRob2Q6ICdkaWFnbm9zdGljJyB8ICdzZWxmX3NlbGVjdGVkJztcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgRWNsaXBzZU1lc3NhZ2UgPVxyXG4gIHwgU3RhcnRTZXNzaW9uTWVzc2FnZVxyXG4gIHwgU3RvcFNlc3Npb25NZXNzYWdlXHJcbiAgfCBQaW5nTWVzc2FnZVxyXG4gIHwgQWN0aXZhdGVNZXNzYWdlXHJcbiAgfCBEZWFjdGl2YXRlTWVzc2FnZVxyXG4gIHwgR2V0U3RhdHVzTWVzc2FnZVxyXG4gIHwgR2VuZXJhdGVUcmFwc01lc3NhZ2VcclxuICB8IFJlc2V0UHJvZmlsZU1lc3NhZ2VcclxuICB8IFNhdmVDYWxpYnJhdGlvbk1lc3NhZ2VcclxuICB8IFNldFByb3ZpZGVyTWVzc2FnZTtcclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBSZXNwb25zZSBkYXRhXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTZXNzaW9uU3RhcnRlZERhdGEge1xyXG4gIHNlc3Npb25JZDogc3RyaW5nO1xyXG4gIHRhYklkOiBudW1iZXI7XHJcbiAgdHJhcENvdW50OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2Vzc2lvblN0b3BwZWREYXRhIHtcclxuICByZXN0b3JlZDogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQb25nRGF0YSB7XHJcbiAgcnVudGltZTogJ2VjbGlwc2UtY29udGVudCc7XHJcbiAgc2Vzc2lvbklkOiBzdHJpbmcgfCBudWxsO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2YXRlZERhdGEge1xyXG4gIHNlc3Npb25JZDogc3RyaW5nO1xyXG4gIHRyYXBDb3VudDogbnVtYmVyO1xyXG4gIGNvbmNlcHRJZHM6IHN0cmluZ1tdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIERlYWN0aXZhdGVkRGF0YSB7XHJcbiAgcmVzdG9yZWQ6IGJvb2xlYW47XHJcbiAgLyoqIFRydWUgd2hlbiB0aGUgcmVzdG9yZWQgdGV4dCBtYXRjaGVkIHRoZSBwcmUtYWN0aXZhdGlvbiBzbmFwc2hvdC4gKi9cclxuICB0ZXh0VmVyaWZpZWQ6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIFBvcHVwUGFnZVN1cHBvcnQgPVxyXG4gIHsgc3VwcG9ydGVkOiB0cnVlIH0gfCB7IHN1cHBvcnRlZDogZmFsc2U7IHJlYXNvbjogJ2ludGVybmFsJyB8ICdmaWxlJyB8ICdleHRlbnNpb24nIHwgJ290aGVyJyB9O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTdGF0dXNEYXRhIHtcclxuICAvKiogVGhlIHdvcmtlcidzIGBNRVNTQUdFX0NPTlRSQUNUX1ZFUlNJT05gLiBBYnNlbnQgZnJvbSBwcmUtdjIgd29ya2Vycy4gKi9cclxuICBjb250cmFjdFZlcnNpb246IG51bWJlcjtcclxuICBhY3RpdmVUYWJJZDogbnVtYmVyIHwgbnVsbDtcclxuICBhY3RpdmVTZXNzaW9uSWQ6IHN0cmluZyB8IG51bGw7XHJcbiAgLyoqIFRydWUgd2hlbiB0aGUgdGFiIHRoZSBwb3B1cCBpcyBzaG93aW5nIGlzIHRoZSBvbmUgd2l0aCBhIGxpdmUgc2Vzc2lvbi4gKi9cclxuICBhY3RpdmVIZXJlOiBib29sZWFuO1xyXG4gIHBhZ2U6IFBvcHVwUGFnZVN1cHBvcnQ7XHJcbiAgY2FsaWJyYXRpb25Db21wbGV0ZWQ6IGJvb2xlYW47XHJcbiAgZGVsZkxldmVsOiBEZWxmTGV2ZWw7XHJcbiAgZ2xvYmFsQWJpbGl0eTogbnVtYmVyO1xyXG4gIHBoYXNlOiBNb29uUGhhc2U7XHJcbiAgc3VtbWFyeTogTWFzdGVyeVN1bW1hcnk7XHJcbiAgcHJvdmlkZXI6IHtcclxuICAgIC8qKiBUcnVlIG9uY2UgYSBzZXJ2ZXIgb3JpZ2luIGhhcyBiZWVuIGNvbmZpZ3VyZWQgYXQgYnVpbGQgdGltZS4gKi9cclxuICAgIGNvbmZpZ3VyZWQ6IGJvb2xlYW47XHJcbiAgICBlbmFibGVkOiBib29sZWFuO1xyXG4gICAgcGVybWlzc2lvbkdyYW50ZWQ6IGJvb2xlYW47XHJcbiAgICBsYXN0RXJyb3I6IHN0cmluZyB8IG51bGw7XHJcbiAgfTtcclxuICBwcm9maWxlRXJyb3I6IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgR2VuZXJhdGVUcmFwc0RhdGEge1xyXG4gIGNhbmRpZGF0ZXM6IEdlbmVyYXRlZFRyYXBDYW5kaWRhdGVbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSZXNldFByb2ZpbGVEYXRhIHtcclxuICByZXNldDogdHJ1ZTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTYXZlQ2FsaWJyYXRpb25EYXRhIHtcclxuICBnbG9iYWxBYmlsaXR5OiBudW1iZXI7XHJcbiAgZGVsZkxldmVsOiBEZWxmTGV2ZWw7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2V0UHJvdmlkZXJEYXRhIHtcclxuICBlbmFibGVkOiBib29sZWFuO1xyXG4gIHBlcm1pc3Npb25HcmFudGVkOiBib29sZWFuO1xyXG59XHJcblxyXG4vKiogTWFwcyBlYWNoIG1lc3NhZ2UgdHlwZSB0byB0aGUgc2hhcGUgb2YgaXRzIHN1Y2Nlc3MgcGF5bG9hZC4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBNZXNzYWdlUmVzcG9uc2VNYXAge1xyXG4gIFNUQVJUX1NFU1NJT046IFNlc3Npb25TdGFydGVkRGF0YTtcclxuICBTVE9QX1NFU1NJT046IFNlc3Npb25TdG9wcGVkRGF0YTtcclxuICBQSU5HOiBQb25nRGF0YTtcclxuICBBQ1RJVkFURTogQWN0aXZhdGVkRGF0YTtcclxuICBERUFDVElWQVRFOiBEZWFjdGl2YXRlZERhdGE7XHJcbiAgR0VUX1NUQVRVUzogU3RhdHVzRGF0YTtcclxuICBHRU5FUkFURV9UUkFQUzogR2VuZXJhdGVUcmFwc0RhdGE7XHJcbiAgUkVTRVRfUFJPRklMRTogUmVzZXRQcm9maWxlRGF0YTtcclxuICBTQVZFX0NBTElCUkFUSU9OOiBTYXZlQ2FsaWJyYXRpb25EYXRhO1xyXG4gIFNFVF9QUk9WSURFUjogU2V0UHJvdmlkZXJEYXRhO1xyXG59XHJcblxyXG5leHBvcnQgdHlwZSBSZXNwb25zZUZvcjxUIGV4dGVuZHMgTWVzc2FnZVR5cGU+ID0gUmVzdWx0PE1lc3NhZ2VSZXNwb25zZU1hcFtUXT47XHJcblxyXG5leHBvcnQgdHlwZSBFY2xpcHNlUmVzcG9uc2UgPSBSZXN1bHQ8TWVzc2FnZVJlc3BvbnNlTWFwW01lc3NhZ2VUeXBlXT47XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gUnVudGltZSB2YWxpZGF0aW9uXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZXhwb3J0IGNvbnN0IGVjbGlwc2VNZXNzYWdlU2NoZW1hOiB6LlpvZFR5cGU8RWNsaXBzZU1lc3NhZ2U+ID0gei5kaXNjcmltaW5hdGVkVW5pb24oJ3R5cGUnLCBbXHJcbiAgei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ1NUQVJUX1NFU1NJT04nKSB9KSxcclxuICB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnU1RPUF9TRVNTSU9OJykgfSksXHJcbiAgei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ1BJTkcnKSB9KSxcclxuICB6Lm9iamVjdCh7XHJcbiAgICB0eXBlOiB6LmxpdGVyYWwoJ0FDVElWQVRFJyksXHJcbiAgICBzZXNzaW9uSWQ6IHouc3RyaW5nKCkubWluKDEpLFxyXG4gICAgcHJvdmlkZXJFbmFibGVkOiB6LmJvb2xlYW4oKS5vcHRpb25hbCgpLmRlZmF1bHQodHJ1ZSksXHJcbiAgfSksXHJcbiAgei5vYmplY3Qoe1xyXG4gICAgdHlwZTogei5saXRlcmFsKCdERUFDVElWQVRFJyksXHJcbiAgICBzZXNzaW9uSWQ6IHouc3RyaW5nKCkubWluKDEpLm9wdGlvbmFsKCksXHJcbiAgICByZWFzb246IHouZW51bShbJ3VzZXInLCAncmVwbGFjZWQnLCAncmVzZXQnXSkub3B0aW9uYWwoKSxcclxuICB9KSxcclxuICB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnR0VUX1NUQVRVUycpIH0pLFxyXG4gIHoub2JqZWN0KHtcclxuICAgIHR5cGU6IHoubGl0ZXJhbCgnR0VORVJBVEVfVFJBUFMnKSxcclxuICAgIHNlc3Npb25JZDogei5zdHJpbmcoKS5taW4oMSksXHJcbiAgICBkZWxmTGV2ZWw6IHouZW51bShERUxGX0xFVkVMUyksXHJcbiAgICBzZW50ZW5jZXM6IHpcclxuICAgICAgLmFycmF5KHoub2JqZWN0KHsgaWQ6IHouc3RyaW5nKCkubWluKDEpLm1heCg2NCksIHRleHQ6IHouc3RyaW5nKCkubWluKDEpLm1heCgzMDApIH0pKVxyXG4gICAgICAubWF4KDgpLFxyXG4gIH0pLFxyXG4gIHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdSRVNFVF9QUk9GSUxFJyksIGNvbmZpcm1lZDogei5ib29sZWFuKCkub3B0aW9uYWwoKS5kZWZhdWx0KHRydWUpIH0pLFxyXG4gIHoub2JqZWN0KHtcclxuICAgIHR5cGU6IHoubGl0ZXJhbCgnU0FWRV9DQUxJQlJBVElPTicpLFxyXG4gICAgZGVsZkxldmVsOiB6LmVudW0oREVMRl9MRVZFTFMpLFxyXG4gICAgY29ycmVjdEFuc3dlcnM6IHoubnVtYmVyKCkuaW50KCkubWluKDApLm1heCg4KS5vcHRpb25hbCgpLmRlZmF1bHQoMCksXHJcbiAgICBtZXRob2Q6IHouZW51bShbJ2RpYWdub3N0aWMnLCAnc2VsZl9zZWxlY3RlZCddKS5vcHRpb25hbCgpLmRlZmF1bHQoJ3NlbGZfc2VsZWN0ZWQnKSxcclxuICB9KSxcclxuICB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnU0VUX1BST1ZJREVSJyksIGVuYWJsZWQ6IHouYm9vbGVhbigpLm9wdGlvbmFsKCkuZGVmYXVsdCh0cnVlKSB9KSxcclxuXSk7XHJcblxyXG5jb25zdCBmYWlsdXJlU2NoZW1hID0gei5vYmplY3Qoe1xyXG4gIG9rOiB6LmxpdGVyYWwoZmFsc2UpLFxyXG4gIGVycm9yOiB6Lm9iamVjdCh7XHJcbiAgICBjb2RlOiB6LmVudW0oRVJST1JfQ09ERVMpLFxyXG4gICAgbWVzc2FnZTogei5zdHJpbmcoKSxcclxuICAgIHJlY292ZXJhYmxlOiB6LmJvb2xlYW4oKSxcclxuICB9KSxcclxufSk7XHJcblxyXG4vKiogUGFyc2UgYW4gaW5ib3VuZCBtZXNzYWdlLiBVbmtub3duIHNoYXBlcyBhcmUgcmVqZWN0ZWQsIG5ldmVyIGNvZXJjZWQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1lc3NhZ2UodmFsdWU6IHVua25vd24pOiBFY2xpcHNlTWVzc2FnZSB8IG51bGwge1xyXG4gIGNvbnN0IHBhcnNlZCA9IGVjbGlwc2VNZXNzYWdlU2NoZW1hLnNhZmVQYXJzZSh2YWx1ZSk7XHJcbiAgcmV0dXJuIHBhcnNlZC5zdWNjZXNzID8gcGFyc2VkLmRhdGEgOiBudWxsO1xyXG59XHJcblxyXG4vKipcclxuICogU2F5IHdoeSBhIG1lc3NhZ2Ugd2FzIHJlamVjdGVkLCBpbiB0ZXJtcyBhIGh1bWFuIHJlYWRpbmcgdGhlIHBvcHVwIGNhbiBhY3RcclxuICogb24uIEEgcmVqZWN0ZWQgbWVzc2FnZSBpcyBuZWFybHkgYWx3YXlzIHZlcnNpb24gc2tldyByYXRoZXIgdGhhbiBhIG1hbGljaW91c1xyXG4gKiBzZW5kZXIsIHNvIHRoZSBjb3B5IGxlYWRzIHdpdGggdGhlIGZpeCBhbmQgY2FycmllcyB0aGUgZmllbGQtbGV2ZWwgZGV0YWlsXHJcbiAqIGJlaGluZCBpdCBmb3Igd2hvZXZlciBpcyBsb29raW5nIGF0IGEgY29uc29sZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBkZXNjcmliZVJlamVjdGVkTWVzc2FnZSh2YWx1ZTogdW5rbm93bik6IHN0cmluZyB7XHJcbiAgY29uc3QgdHlwZSA9ICh2YWx1ZSBhcyB7IHR5cGU/OiB1bmtub3duIH0gfCBudWxsIHwgdW5kZWZpbmVkKT8udHlwZTtcclxuICBpZiAodHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnIHx8ICEoTUVTU0FHRV9UWVBFUyBhcyByZWFkb25seSBzdHJpbmdbXSkuaW5jbHVkZXModHlwZSkpIHtcclxuICAgIHJldHVybiBgJHtTVEFMRV9XT1JLRVJfTUVTU0FHRX0gKHVucmVjb2duaXNlZCByZXF1ZXN0JHtcclxuICAgICAgdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gYCBcIiR7dHlwZX1cImAgOiAnJ1xyXG4gICAgfSlgO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcGFyc2VkID0gZWNsaXBzZU1lc3NhZ2VTY2hlbWEuc2FmZVBhcnNlKHZhbHVlKTtcclxuICBjb25zdCBmaWVsZHMgPSBwYXJzZWQuc3VjY2Vzc1xyXG4gICAgPyBbXVxyXG4gICAgOiBbXHJcbiAgICAgICAgLi4ubmV3IFNldChcclxuICAgICAgICAgIHBhcnNlZC5lcnJvci5pc3N1ZXMubWFwKChpc3N1ZSkgPT4gaXNzdWUucGF0aC5qb2luKCcuJykpLmZpbHRlcigocGF0aCkgPT4gcGF0aCAhPT0gJycpLFxyXG4gICAgICAgICksXHJcbiAgICAgIF07XHJcblxyXG4gIHJldHVybiBmaWVsZHMubGVuZ3RoID4gMFxyXG4gICAgPyBgJHtTVEFMRV9XT1JLRVJfTUVTU0FHRX0gKCR7dHlwZX0gc2VudCBhbiB1bnVzYWJsZSAke2ZpZWxkcy5qb2luKCcsICcpfSlgXHJcbiAgICA6IGAke1NUQUxFX1dPUktFUl9NRVNTQUdFfSAoJHt0eXBlfSBoYWQgYW4gdW51c2FibGUgcGF5bG9hZClgO1xyXG59XHJcblxyXG4vKiogTmFycm93IGFuIHVua25vd24gcmVzcG9uc2UgdmFsdWUgaW50byBhIGBSZXN1bHRgLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNGYWlsdXJlUmVzcG9uc2UodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBGYWlsdXJlIHtcclxuICByZXR1cm4gZmFpbHVyZVNjaGVtYS5zYWZlUGFyc2UodmFsdWUpLnN1Y2Nlc3M7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1N1Y2Nlc3NSZXNwb25zZTxUPih2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFN1Y2Nlc3M8VD4ge1xyXG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsICYmICh2YWx1ZSBhcyB7IG9rPzogdW5rbm93biB9KS5vayA9PT0gdHJ1ZTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IG1vb25QaGFzZVNjaGVtYSA9IHouZW51bShNT09OX1BIQVNFUyk7XHJcbiIsIi8qKlxyXG4gKiBXaGljaCBwYWdlcyBFY2xpcHNlIHdpbGwgcnVuIG9uLlxyXG4gKlxyXG4gKiBDaHJvbWUgaW50ZXJuYWwgcGFnZXMsIGV4dGVuc2lvbiBwYWdlcywgYGZpbGU6Ly9gIGFuZCBhbnl0aGluZyBub24tSFRUUChTKVxyXG4gKiBhcmUgb3V0IOKAlCBgYWN0aXZlVGFiYCBkb2VzIG5vdCBncmFudCBhY2Nlc3MgdG8gdGhlbSwgYW5kIHRoZSBwb3B1cCBzaG91bGQgc2F5XHJcbiAqIHNvIHBsYWlubHkgcmF0aGVyIHRoYW4gZmFpbCBvYnNjdXJlbHkgb25jZSB0aGUgdXNlciBwcmVzc2VzIFN0YXJ0LlxyXG4gKi9cclxuXHJcbmltcG9ydCB0eXBlIHsgUG9wdXBQYWdlU3VwcG9ydCB9IGZyb20gJy4vbWVzc2FnZXMnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzaWZ5VXJsKHVybDogc3RyaW5nIHwgdW5kZWZpbmVkKTogUG9wdXBQYWdlU3VwcG9ydCB7XHJcbiAgaWYgKCF1cmwpIHJldHVybiB7IHN1cHBvcnRlZDogZmFsc2UsIHJlYXNvbjogJ290aGVyJyB9O1xyXG5cclxuICBsZXQgcGFyc2VkOiBVUkw7XHJcbiAgdHJ5IHtcclxuICAgIHBhcnNlZCA9IG5ldyBVUkwodXJsKTtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiB7IHN1cHBvcnRlZDogZmFsc2UsIHJlYXNvbjogJ290aGVyJyB9O1xyXG4gIH1cclxuXHJcbiAgc3dpdGNoIChwYXJzZWQucHJvdG9jb2wpIHtcclxuICAgIGNhc2UgJ2h0dHA6JzpcclxuICAgIGNhc2UgJ2h0dHBzOic6XHJcbiAgICAgIHJldHVybiB7IHN1cHBvcnRlZDogdHJ1ZSB9O1xyXG4gICAgY2FzZSAnZmlsZTonOlxyXG4gICAgICByZXR1cm4geyBzdXBwb3J0ZWQ6IGZhbHNlLCByZWFzb246ICdmaWxlJyB9O1xyXG4gICAgY2FzZSAnY2hyb21lLWV4dGVuc2lvbjonOlxyXG4gICAgY2FzZSAnbW96LWV4dGVuc2lvbjonOlxyXG4gICAgICByZXR1cm4geyBzdXBwb3J0ZWQ6IGZhbHNlLCByZWFzb246ICdleHRlbnNpb24nIH07XHJcbiAgICBjYXNlICdjaHJvbWU6JzpcclxuICAgIGNhc2UgJ2VkZ2U6JzpcclxuICAgIGNhc2UgJ2Fib3V0Oic6XHJcbiAgICBjYXNlICdkZXZ0b29sczonOlxyXG4gICAgY2FzZSAndmlldy1zb3VyY2U6JzpcclxuICAgICAgcmV0dXJuIHsgc3VwcG9ydGVkOiBmYWxzZSwgcmVhc29uOiAnaW50ZXJuYWwnIH07XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4geyBzdXBwb3J0ZWQ6IGZhbHNlLCByZWFzb246ICdvdGhlcicgfTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBQb3B1cCBjb3B5IGZvciBhbiB1bnN1cHBvcnRlZCBwYWdlLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdW5zdXBwb3J0ZWRSZWFzb25UZXh0KHN1cHBvcnQ6IFBvcHVwUGFnZVN1cHBvcnQpOiBzdHJpbmcge1xyXG4gIGlmIChzdXBwb3J0LnN1cHBvcnRlZCkgcmV0dXJuICcnO1xyXG4gIHN3aXRjaCAoc3VwcG9ydC5yZWFzb24pIHtcclxuICAgIGNhc2UgJ2ludGVybmFsJzpcclxuICAgICAgcmV0dXJuICdFY2xpcHNlIGNhbm5vdCBydW4gb24gQ2hyb21l4oCZcyBvd24gcGFnZXMuJztcclxuICAgIGNhc2UgJ2V4dGVuc2lvbic6XHJcbiAgICAgIHJldHVybiAnRWNsaXBzZSBjYW5ub3QgcnVuIG9uIGV4dGVuc2lvbiBwYWdlcy4nO1xyXG4gICAgY2FzZSAnZmlsZSc6XHJcbiAgICAgIHJldHVybiAnRWNsaXBzZSBjYW5ub3QgcnVuIG9uIGxvY2FsIGZpbGU6Ly8gcGFnZXMuJztcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiAnRWNsaXBzZSBvbmx5IHJ1bnMgb24gcmVndWxhciBodHRwKHMpIHdlYiBwYWdlcy4nO1xyXG4gIH1cclxufVxyXG4iLCIvKipcclxuICogQSBtaW5pbWFsIHN0b3JhZ2UtYXJlYSBpbnRlcmZhY2UuXHJcbiAqXHJcbiAqIFRoZSByZXN0IG9mIHRoZSBzdG9yYWdlIGxheWVyIHRhbGtzIHRvIHRoaXMgcmF0aGVyIHRoYW4gdG8gdGhlIGV4dGVuc2lvblxyXG4gKiBzdG9yYWdlIEFQSSBkaXJlY3RseSwgc28gdW5pdCB0ZXN0cyBjYW4gZHJpdmUgaXQgd2l0aCBhbiBpbi1tZW1vcnkgYXJlYSBhbmQgc28gYSBmYWlsaW5nXHJcbiAqIHdyaXRlIHN1cmZhY2VzIGFzIGBTVE9SQUdFX0VSUk9SYCByYXRoZXIgdGhhbiBhbiB1bmhhbmRsZWQgcmVqZWN0aW9uLlxyXG4gKi9cclxuXHJcbmltcG9ydCB0eXBlIHsgQnJvd3NlciB9IGZyb20gJ3d4dC9icm93c2VyJztcclxuaW1wb3J0IHsgZmFpbHVyZSwgc3VjY2VzcywgdHlwZSBSZXN1bHQgfSBmcm9tICcuLi9kb21haW4vZXJyb3JzJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU3RvcmFnZUFyZWEge1xyXG4gIGdldChrZXk6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj47XHJcbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bik6IFByb21pc2U8dm9pZD47XHJcbiAgcmVtb3ZlKGtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcclxufVxyXG5cclxuLyoqIFdyYXBzIGEgYGJyb3dzZXIuc3RvcmFnZWAgYXJlYS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNocm9tZUFyZWEoYXJlYTogQnJvd3Nlci5zdG9yYWdlLlN0b3JhZ2VBcmVhKTogU3RvcmFnZUFyZWEge1xyXG4gIHJldHVybiB7XHJcbiAgICBhc3luYyBnZXQoa2V5KSB7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFyZWEuZ2V0KGtleSk7XHJcbiAgICAgIHJldHVybiByZXN1bHRba2V5XTtcclxuICAgIH0sXHJcbiAgICBhc3luYyBzZXQoa2V5LCB2YWx1ZSkge1xyXG4gICAgICBhd2FpdCBhcmVhLnNldCh7IFtrZXldOiB2YWx1ZSB9KTtcclxuICAgIH0sXHJcbiAgICBhc3luYyByZW1vdmUoa2V5KSB7XHJcbiAgICAgIGF3YWl0IGFyZWEucmVtb3ZlKGtleSk7XHJcbiAgICB9LFxyXG4gIH07XHJcbn1cclxuXHJcbi8qKiBJbi1tZW1vcnkgYXJlYSBmb3IgdGVzdHMgYW5kIGZvciB0aGUgcmFyZSBjYXNlIHdoZXJlIHN0b3JhZ2UgaXMgbWlzc2luZy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG1lbW9yeUFyZWEoaW5pdGlhbDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fSk6IFN0b3JhZ2VBcmVhIHtcclxuICBjb25zdCBzdG9yZSA9IG5ldyBNYXA8c3RyaW5nLCB1bmtub3duPihPYmplY3QuZW50cmllcyhpbml0aWFsKSk7XHJcbiAgcmV0dXJuIHtcclxuICAgIGFzeW5jIGdldChrZXkpIHtcclxuICAgICAgcmV0dXJuIHN0b3JlLmdldChrZXkpO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHNldChrZXksIHZhbHVlKSB7XHJcbiAgICAgIHN0b3JlLnNldChrZXksIHN0cnVjdHVyZWRDbG9uZSh2YWx1ZSkpO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHJlbW92ZShrZXkpIHtcclxuICAgICAgc3RvcmUuZGVsZXRlKGtleSk7XHJcbiAgICB9LFxyXG4gIH07XHJcbn1cclxuXHJcbi8qKiBSdW4gYSBzdG9yYWdlIG9wZXJhdGlvbiwgY29udmVydGluZyBhbnkgdGhyb3cgaW50byBhIHR5cGVkIGBTVE9SQUdFX0VSUk9SYC4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGd1YXJkZWQ8VD4od29yazogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8UmVzdWx0PFQ+PiB7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBzdWNjZXNzKGF3YWl0IHdvcmsoKSk7XHJcbiAgfSBjYXRjaCAoY2F1c2UpIHtcclxuICAgIGNvbnN0IG1lc3NhZ2UgPSBjYXVzZSBpbnN0YW5jZW9mIEVycm9yID8gY2F1c2UubWVzc2FnZSA6ICdzdG9yYWdlIG9wZXJhdGlvbiBmYWlsZWQnO1xyXG4gICAgcmV0dXJuIGZhaWx1cmUoJ1NUT1JBR0VfRVJST1InLCBtZXNzYWdlKTtcclxuICB9XHJcbn1cclxuIiwiLyoqIFN0b3JhZ2Uga2V5cy4gTmFtZXNwYWNlZCBzbyBFY2xpcHNlIG5ldmVyIGNvbGxpZGVzIHdpdGggYW55dGhpbmcgZWxzZS4gKi9cclxuXHJcbmV4cG9ydCBjb25zdCBQUk9GSUxFX0tFWSA9ICdlY2xpcHNlOnByb2ZpbGU6djEnO1xyXG5leHBvcnQgY29uc3QgSU5URVJBQ1RJT05TX0tFWSA9ICdlY2xpcHNlOmludGVyYWN0aW9uczp2MSc7XHJcbmV4cG9ydCBjb25zdCBQUk9WSURFUl9DQUNIRV9LRVkgPSAnZWNsaXBzZTpwcm92aWRlci1jYWNoZTp2MSc7XHJcbmV4cG9ydCBjb25zdCBQUk9WSURFUl9TRVRUSU5HU19LRVkgPSAnZWNsaXBzZTpwcm92aWRlci1zZXR0aW5nczp2MSc7XHJcbmV4cG9ydCBjb25zdCBTRVNTSU9OX0tFWSA9ICdlY2xpcHNlOnNlc3Npb246djEnO1xyXG4iLCIvKipcclxuICogTGVhcm5lciBwcm9maWxlIHBlcnNpc3RlbmNlLlxyXG4gKlxyXG4gKiBUd28gcnVsZXMgZ292ZXJuIHRoaXMgZmlsZTpcclxuICpcclxuICogMS4gQSBwcm9maWxlIHRoYXQgZmFpbHMgdmFsaWRhdGlvbiBpcyBuZXZlciBzaWxlbnRseSByZXBsYWNlZC4gRWNsaXBzZVxyXG4gKiAgICByZXBvcnRzIGBQUk9GSUxFX0lOQ09NUEFUSUJMRWAgYW5kIGxlYXZlcyB0aGUgYnl0ZXMgYWxvbmUsIHNvIGEgc2NoZW1hIGJ1Z1xyXG4gKiAgICBpbiBhIGZ1dHVyZSB2ZXJzaW9uIGNhbm5vdCBxdWlldGx5IGRlbGV0ZSBzb21lYm9keSdzIHByb2dyZXNzLlxyXG4gKiAyLiBBbnN3ZXIgb3V0Y29tZXMgYXJlIGlkZW1wb3RlbnQgYnkgYGludGVyYWN0aW9uSWRgLiBUaGUgaWRzIGxpdmUgaW4gdGhlaXJcclxuICogICAgb3duIGJvdW5kZWQga2V5IHJhdGhlciB0aGFuIG9uIHRoZSBwcm9maWxlLCBiZWNhdXNlIHRoZSBwcm9maWxlJ3Mgcm9sbGluZ1xyXG4gKiAgICBvdXRjb21lIHdpbmRvdyBpcyBvbmx5IGZpdmUgZGVlcCBhbmQgYSBkdXBsaWNhdGUgY2FuIGFycml2ZSBsYXRlciB0aGFuXHJcbiAqICAgIHRoYXQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtcclxuICBjcmVhdGVFbXB0eVByb2ZpbGUsXHJcbiAgbGVhcm5lclByb2ZpbGVTY2hlbWEsXHJcbiAgUFJPRklMRV9TQ0hFTUFfVkVSU0lPTixcclxuICB0eXBlIExlYXJuZXJQcm9maWxlLFxyXG59IGZyb20gJy4uL2RvbWFpbi9wcm9maWxlJztcclxuaW1wb3J0IHsgZmFpbHVyZSwgc3VjY2VzcywgdHlwZSBSZXN1bHQgfSBmcm9tICcuLi9kb21haW4vZXJyb3JzJztcclxuaW1wb3J0IHsgZ3VhcmRlZCwgdHlwZSBTdG9yYWdlQXJlYSB9IGZyb20gJy4vYXJlYSc7XHJcbmltcG9ydCB7IElOVEVSQUNUSU9OU19LRVksIFBST0ZJTEVfS0VZIH0gZnJvbSAnLi9rZXlzJztcclxuXHJcbi8qKiBIb3cgbWFueSBpbnRlcmFjdGlvbiBpZHMgdG8gcmVtZW1iZXIgZm9yIGR1cGxpY2F0ZSBzdXBwcmVzc2lvbi4gKi9cclxuZXhwb3J0IGNvbnN0IElOVEVSQUNUSU9OX0xPR19MSU1JVCA9IDIwMDtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9hZFByb2ZpbGVSZXN1bHQge1xyXG4gIHJlYWRvbmx5IHByb2ZpbGU6IExlYXJuZXJQcm9maWxlO1xyXG4gIC8qKiBUcnVlIHdoZW4gbm90aGluZyB3YXMgc3RvcmVkIHlldCBhbmQgYSBmcmVzaCBwcm9maWxlIHdhcyByZXR1cm5lZC4gKi9cclxuICByZWFkb25seSBjcmVhdGVkOiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogUmVhZCB0aGUgcHJvZmlsZS5cclxuICpcclxuICogTWlzc2luZyBkYXRhIHlpZWxkcyBhIGZyZXNoIHByb2ZpbGUuIENvcnJ1cHQgb3IgbmV3ZXItdGhhbi1zdXBwb3J0ZWQgZGF0YVxyXG4gKiB5aWVsZHMgYFBST0ZJTEVfSU5DT01QQVRJQkxFYCBhbmQgaXMgbGVmdCB1bnRvdWNoZWQgb24gZGlzay5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkUHJvZmlsZShhcmVhOiBTdG9yYWdlQXJlYSk6IFByb21pc2U8UmVzdWx0PExvYWRQcm9maWxlUmVzdWx0Pj4ge1xyXG4gIGNvbnN0IHJlYWQgPSBhd2FpdCBndWFyZGVkKCgpID0+IGFyZWEuZ2V0KFBST0ZJTEVfS0VZKSk7XHJcbiAgaWYgKCFyZWFkLm9rKSByZXR1cm4gcmVhZDtcclxuXHJcbiAgY29uc3QgcmF3ID0gcmVhZC5kYXRhO1xyXG4gIGlmIChyYXcgPT09IHVuZGVmaW5lZCB8fCByYXcgPT09IG51bGwpIHtcclxuICAgIHJldHVybiBzdWNjZXNzKHsgcHJvZmlsZTogY3JlYXRlRW1wdHlQcm9maWxlKCksIGNyZWF0ZWQ6IHRydWUgfSk7XHJcbiAgfVxyXG5cclxuICBjb25zdCB2ZXJzaW9uID0gKHJhdyBhcyB7IHNjaGVtYVZlcnNpb24/OiB1bmtub3duIH0pLnNjaGVtYVZlcnNpb247XHJcbiAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnbnVtYmVyJyAmJiB2ZXJzaW9uID4gUFJPRklMRV9TQ0hFTUFfVkVSU0lPTikge1xyXG4gICAgcmV0dXJuIGZhaWx1cmUoXHJcbiAgICAgICdQUk9GSUxFX0lOQ09NUEFUSUJMRScsXHJcbiAgICAgIGBTYXZlZCBsZWFybmluZyBkYXRhIHVzZXMgc2NoZW1hIHZlcnNpb24gJHt2ZXJzaW9ufTsgdGhpcyBidWlsZCBzdXBwb3J0cyAke1BST0ZJTEVfU0NIRU1BX1ZFUlNJT059LmAsXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcGFyc2VkID0gbGVhcm5lclByb2ZpbGVTY2hlbWEuc2FmZVBhcnNlKHJhdyk7XHJcbiAgaWYgKCFwYXJzZWQuc3VjY2Vzcykge1xyXG4gICAgcmV0dXJuIGZhaWx1cmUoXHJcbiAgICAgICdQUk9GSUxFX0lOQ09NUEFUSUJMRScsXHJcbiAgICAgICdTYXZlZCBsZWFybmluZyBkYXRhIGRpZCBub3QgbWF0Y2ggdGhlIGV4cGVjdGVkIHNoYXBlIGFuZCB3YXMgbGVmdCB1bnRvdWNoZWQuJyxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gc3VjY2Vzcyh7IHByb2ZpbGU6IHBhcnNlZC5kYXRhIGFzIExlYXJuZXJQcm9maWxlLCBjcmVhdGVkOiBmYWxzZSB9KTtcclxufVxyXG5cclxuLyoqIFdyaXRlIHRoZSBwcm9maWxlLCB2YWxpZGF0aW5nIGl0IG9uIHRoZSB3YXkgb3V0LiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZVByb2ZpbGUoXHJcbiAgYXJlYTogU3RvcmFnZUFyZWEsXHJcbiAgcHJvZmlsZTogTGVhcm5lclByb2ZpbGUsXHJcbik6IFByb21pc2U8UmVzdWx0PExlYXJuZXJQcm9maWxlPj4ge1xyXG4gIGNvbnN0IHBhcnNlZCA9IGxlYXJuZXJQcm9maWxlU2NoZW1hLnNhZmVQYXJzZShwcm9maWxlKTtcclxuICBpZiAoIXBhcnNlZC5zdWNjZXNzKSB7XHJcbiAgICByZXR1cm4gZmFpbHVyZSgnU1RPUkFHRV9FUlJPUicsICdSZWZ1c2luZyB0byBwZXJzaXN0IGFuIGludmFsaWQgbGVhcm5lciBwcm9maWxlLicpO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgd3JpdHRlbiA9IGF3YWl0IGd1YXJkZWQoKCkgPT4gYXJlYS5zZXQoUFJPRklMRV9LRVksIHBhcnNlZC5kYXRhKSk7XHJcbiAgaWYgKCF3cml0dGVuLm9rKSByZXR1cm4gd3JpdHRlbjtcclxuICByZXR1cm4gc3VjY2Vzcyhwcm9maWxlKTtcclxufVxyXG5cclxuLyoqIFJlbW92ZSB0aGUgcHJvZmlsZSBhbmQgZXZlcnkgaW50ZXJhY3Rpb24gaWQuIFRoZSBuZXh0IHJlYWQgY3JlYXRlcyBhIGZyZXNoIHByb2ZpbGUuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXNldFByb2ZpbGUoYXJlYTogU3RvcmFnZUFyZWEpOiBQcm9taXNlPFJlc3VsdDxMZWFybmVyUHJvZmlsZT4+IHtcclxuICBjb25zdCBwcm9maWxlID0gY3JlYXRlRW1wdHlQcm9maWxlKCk7XHJcbiAgY29uc3Qgd3JpdHRlbiA9IGF3YWl0IGd1YXJkZWQoYXN5bmMgKCkgPT4ge1xyXG4gICAgYXdhaXQgYXJlYS5yZW1vdmUoUFJPRklMRV9LRVkpO1xyXG4gICAgYXdhaXQgYXJlYS5yZW1vdmUoSU5URVJBQ1RJT05TX0tFWSk7XHJcbiAgfSk7XHJcbiAgaWYgKCF3cml0dGVuLm9rKSByZXR1cm4gd3JpdHRlbjtcclxuICByZXR1cm4gc3VjY2Vzcyhwcm9maWxlKTtcclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIEludGVyYWN0aW9uIGxvZ1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlYWRJbnRlcmFjdGlvbkxvZyhhcmVhOiBTdG9yYWdlQXJlYSk6IFByb21pc2U8c3RyaW5nW10+IHtcclxuICBjb25zdCByZWFkID0gYXdhaXQgZ3VhcmRlZCgoKSA9PiBhcmVhLmdldChJTlRFUkFDVElPTlNfS0VZKSk7XHJcbiAgaWYgKCFyZWFkLm9rIHx8ICFBcnJheS5pc0FycmF5KHJlYWQuZGF0YSkpIHJldHVybiBbXTtcclxuICByZXR1cm4gcmVhZC5kYXRhLmZpbHRlcigodmFsdWUpOiB2YWx1ZSBpcyBzdHJpbmcgPT4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyk7XHJcbn1cclxuXHJcbi8qKiBUcnVlIHdoZW4gdGhpcyBpbnRlcmFjdGlvbiBoYXMgYWxyZWFkeSBiZWVuIGZvbGRlZCBpbnRvIHRoZSBwcm9maWxlLiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzSW50ZXJhY3Rpb24oYXJlYTogU3RvcmFnZUFyZWEsIGludGVyYWN0aW9uSWQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gIGNvbnN0IGxvZyA9IGF3YWl0IHJlYWRJbnRlcmFjdGlvbkxvZyhhcmVhKTtcclxuICByZXR1cm4gbG9nLmluY2x1ZGVzKGludGVyYWN0aW9uSWQpO1xyXG59XHJcblxyXG4vKiogUmVjb3JkIGFuIGludGVyYWN0aW9uIGlkLCB0cmltbWluZyB0aGUgbG9nIHRvIGl0cyBib3VuZC4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbWVtYmVySW50ZXJhY3Rpb24oXHJcbiAgYXJlYTogU3RvcmFnZUFyZWEsXHJcbiAgaW50ZXJhY3Rpb25JZDogc3RyaW5nLFxyXG4pOiBQcm9taXNlPFJlc3VsdDx2b2lkPj4ge1xyXG4gIGNvbnN0IGxvZyA9IGF3YWl0IHJlYWRJbnRlcmFjdGlvbkxvZyhhcmVhKTtcclxuICBpZiAobG9nLmluY2x1ZGVzKGludGVyYWN0aW9uSWQpKSByZXR1cm4gc3VjY2Vzcyh1bmRlZmluZWQpO1xyXG4gIGNvbnN0IG5leHQgPSBbLi4ubG9nLCBpbnRlcmFjdGlvbklkXS5zbGljZSgtSU5URVJBQ1RJT05fTE9HX0xJTUlUKTtcclxuICByZXR1cm4gZ3VhcmRlZCgoKSA9PiBhcmVhLnNldChJTlRFUkFDVElPTlNfS0VZLCBuZXh0KSk7XHJcbn1cclxuIiwiLyoqXHJcbiAqIEFjdGl2ZS1zZXNzaW9uIHN0YXRlLCBvd25lZCBleGNsdXNpdmVseSBieSB0aGUgYmFja2dyb3VuZCB3b3JrZXIuXHJcbiAqXHJcbiAqIExpdmVzIGluIGBzdG9yYWdlLnNlc3Npb25gIHNvIGl0IGRpc2FwcGVhcnMgd2hlbiB0aGUgYnJvd3NlciBjbG9zZXMgYW5kXHJcbiAqIHN1cnZpdmVzIGEgc2VydmljZS13b3JrZXIgcmVzdGFydCBpbiBiZXR3ZWVuLiBUaGVyZSBpcyBhdCBtb3N0IG9uZSBhY3RpdmVcclxuICogRWNsaXBzZSBzZXNzaW9uIGFjcm9zcyBhbGwgdGFicy5cclxuICovXHJcblxyXG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcclxuaW1wb3J0IHsgZ3VhcmRlZCwgdHlwZSBTdG9yYWdlQXJlYSB9IGZyb20gJy4vYXJlYSc7XHJcbmltcG9ydCB7IFNFU1NJT05fS0VZIH0gZnJvbSAnLi9rZXlzJztcclxuaW1wb3J0IHR5cGUgeyBSZXN1bHQgfSBmcm9tICcuLi9kb21haW4vZXJyb3JzJztcclxuaW1wb3J0IHsgc3VjY2VzcyB9IGZyb20gJy4uL2RvbWFpbi9lcnJvcnMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGFjdGl2ZVNlc3Npb25TY2hlbWEgPSB6XHJcbiAgLm9iamVjdCh7XHJcbiAgICBzZXNzaW9uSWQ6IHouc3RyaW5nKCkubWluKDEpLFxyXG4gICAgdGFiSWQ6IHoubnVtYmVyKCkuaW50KCksXHJcbiAgICBzdGFydGVkQXQ6IHouc3RyaW5nKCksXHJcbiAgICBwaGFzZTogei5lbnVtKFsncGVuZGluZycsICdhY3RpdmUnXSkub3B0aW9uYWwoKSxcclxuICB9KVxyXG4gIC50cmFuc2Zvcm0oKHNlc3Npb24pID0+ICh7IC4uLnNlc3Npb24sIHBoYXNlOiBzZXNzaW9uLnBoYXNlID8/ICgnYWN0aXZlJyBhcyBjb25zdCkgfSkpO1xyXG5cclxuZXhwb3J0IHR5cGUgQWN0aXZlU2Vzc2lvbiA9IHouaW5mZXI8dHlwZW9mIGFjdGl2ZVNlc3Npb25TY2hlbWE+O1xyXG5cclxuLyoqIEdlbmVyYXRpb24gaXMgYWxsb3dlZCBkdXJpbmcgYWN0aXZhdGlvbiBhbmQgYWZ0ZXIgaXQsIGJ1dCBuZXZlciBjcm9zcy1zZXNzaW9uLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNHZW5lcmF0aW9uQXV0aG9yaXplZChcclxuICBzZXNzaW9uOiBBY3RpdmVTZXNzaW9uIHwgbnVsbCxcclxuICBzZW5kZXJUYWJJZDogbnVtYmVyIHwgdW5kZWZpbmVkLFxyXG4gIHJlcXVlc3RlZFNlc3Npb25JZDogc3RyaW5nLFxyXG4pOiBib29sZWFuIHtcclxuICByZXR1cm4gKFxyXG4gICAgc2Vzc2lvbiAhPT0gbnVsbCAmJiBzZW5kZXJUYWJJZCA9PT0gc2Vzc2lvbi50YWJJZCAmJiByZXF1ZXN0ZWRTZXNzaW9uSWQgPT09IHNlc3Npb24uc2Vzc2lvbklkXHJcbiAgKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRBY3RpdmVTZXNzaW9uKGFyZWE6IFN0b3JhZ2VBcmVhKTogUHJvbWlzZTxBY3RpdmVTZXNzaW9uIHwgbnVsbD4ge1xyXG4gIGNvbnN0IHJlYWQgPSBhd2FpdCBndWFyZGVkKCgpID0+IGFyZWEuZ2V0KFNFU1NJT05fS0VZKSk7XHJcbiAgaWYgKCFyZWFkLm9rKSByZXR1cm4gbnVsbDtcclxuICBjb25zdCBwYXJzZWQgPSBhY3RpdmVTZXNzaW9uU2NoZW1hLnNhZmVQYXJzZShyZWFkLmRhdGEpO1xyXG4gIHJldHVybiBwYXJzZWQuc3VjY2VzcyA/IHBhcnNlZC5kYXRhIDogbnVsbDtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlQWN0aXZlU2Vzc2lvbihcclxuICBhcmVhOiBTdG9yYWdlQXJlYSxcclxuICBzZXNzaW9uOiBBY3RpdmVTZXNzaW9uLFxyXG4pOiBQcm9taXNlPFJlc3VsdDxBY3RpdmVTZXNzaW9uPj4ge1xyXG4gIGNvbnN0IHdyaXR0ZW4gPSBhd2FpdCBndWFyZGVkKCgpID0+IGFyZWEuc2V0KFNFU1NJT05fS0VZLCBzZXNzaW9uKSk7XHJcbiAgaWYgKCF3cml0dGVuLm9rKSByZXR1cm4gd3JpdHRlbjtcclxuICByZXR1cm4gc3VjY2VzcyhzZXNzaW9uKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyQWN0aXZlU2Vzc2lvbihhcmVhOiBTdG9yYWdlQXJlYSk6IFByb21pc2U8UmVzdWx0PHZvaWQ+PiB7XHJcbiAgcmV0dXJuIGd1YXJkZWQoKCkgPT4gYXJlYS5yZW1vdmUoU0VTU0lPTl9LRVkpKTtcclxufVxyXG4iLCIvKipcclxuICogSGVhbHRoIHN0YXRlIGZvciB0aGUgYWx3YXlzLW9uIGdlbmVyYXRpb24gQVBJLlxyXG4gKlxyXG4gKiBgZW5hYmxlZGAgcmVtYWlucyBpbiB0aGUgc3RvcmVkIHNoYXBlIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSwgYnV0IHRoZVxyXG4gKiBwcm9kdWN0IG5vIGxvbmdlciBleHBvc2VzIG9yIGhvbm91cnMgYW4gb2ZmIHN3aXRjaC4gVGhlIG9yaWdpbiBpcyBhXHJcbiAqIGJ1aWxkLXRpbWUgY29uc3RhbnQsIG5vdCB1c2VyIGlucHV0LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5pbXBvcnQgeyBndWFyZGVkLCB0eXBlIFN0b3JhZ2VBcmVhIH0gZnJvbSAnLi9hcmVhJztcclxuaW1wb3J0IHsgUFJPVklERVJfU0VUVElOR1NfS0VZIH0gZnJvbSAnLi9rZXlzJztcclxuaW1wb3J0IHR5cGUgeyBSZXN1bHQgfSBmcm9tICcuLi9kb21haW4vZXJyb3JzJztcclxuaW1wb3J0IHsgc3VjY2VzcyB9IGZyb20gJy4uL2RvbWFpbi9lcnJvcnMnO1xyXG5cclxuLyoqIFRoZSBvbmx5IG9yaWdpbiBFY2xpcHNlIHdpbGwgZXZlciBjb250YWN0LiAqL1xyXG5leHBvcnQgY29uc3QgUFJPVklERVJfT1JJR0lOID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODc4Nyc7XHJcbmV4cG9ydCBjb25zdCBQUk9WSURFUl9FTkRQT0lOVCA9IGAke1BST1ZJREVSX09SSUdJTn0vYXBpL2NvbnRleHQtdHJhcHNgO1xyXG5leHBvcnQgY29uc3QgUFJPVklERVJfSEVBTFRIX0VORFBPSU5UID0gYCR7UFJPVklERVJfT1JJR0lOfS9oZWFsdGhgO1xyXG5leHBvcnQgY29uc3QgUFJPVklERVJfUEVSTUlTU0lPTl9QQVRURVJOID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODc4Ny8qJztcclxuZXhwb3J0IGNvbnN0IFBST1ZJREVSX01PREVMID0gJ2dlbWluaS0zLjUtZmxhc2gtbGl0ZSc7XHJcblxyXG4vKiogQ2xpZW50LXNpZGUgY2VpbGluZyBmb3Igb25lIGdlbmVyYXRpb24gYXR0ZW1wdC4gR2VtaW5pIGNvbW1vbmx5IG5lZWRzIDXigJMxMiBzZWNvbmRzLiAqL1xyXG5leHBvcnQgY29uc3QgUFJPVklERVJfVElNRU9VVF9NUyA9IDIwXzAwMDtcclxuXHJcbi8qKiBIZWFsdGggY2hlY2tzIHNob3VsZCBzdGlsbCBmYWlsIHF1aWNrbHkgd2hlbiB0aGUgbG9jYWwgc2VydmVyIGlzIG5vdCBydW5uaW5nLiAqL1xyXG5leHBvcnQgY29uc3QgUFJPVklERVJfSEVBTFRIX1RJTUVPVVRfTVMgPSAzXzAwMDtcclxuXHJcbi8qKiBPbmUgaW5pdGlhbCBnZW5lcmF0aW9uIGF0dGVtcHQgcGx1cyBvbmUgYXV0b21hdGljIHJlY292ZXJ5IGF0dGVtcHQuICovXHJcbmV4cG9ydCBjb25zdCBQUk9WSURFUl9NQVhfQVRURU1QVFMgPSAyO1xyXG5cclxuLyoqIE1heGltdW0gc2VudGVuY2VzIHNlbnQgaW4gb25lIHJlcXVlc3QuICovXHJcbmV4cG9ydCBjb25zdCBQUk9WSURFUl9NQVhfU0VOVEVOQ0VTID0gODtcclxuXHJcbi8qKiBNYXhpbXVtIGNoYXJhY3RlcnMgcGVyIHNlbnRlbmNlIHNlbnQuICovXHJcbmV4cG9ydCBjb25zdCBQUk9WSURFUl9NQVhfU0VOVEVOQ0VfTEVOR1RIID0gMzAwO1xyXG5cclxuZXhwb3J0IGNvbnN0IHByb3ZpZGVyU2V0dGluZ3NTY2hlbWEgPSB6Lm9iamVjdCh7XHJcbiAgZW5hYmxlZDogei5ib29sZWFuKCksXHJcbiAgbGFzdEVycm9yOiB6LnN0cmluZygpLm51bGxhYmxlKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IHR5cGUgUHJvdmlkZXJTZXR0aW5ncyA9IHouaW5mZXI8dHlwZW9mIHByb3ZpZGVyU2V0dGluZ3NTY2hlbWE+O1xyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPVklERVJfU0VUVElOR1M6IFByb3ZpZGVyU2V0dGluZ3MgPSB7XHJcbiAgZW5hYmxlZDogdHJ1ZSxcclxuICBsYXN0RXJyb3I6IG51bGwsXHJcbn07XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZFByb3ZpZGVyU2V0dGluZ3MoYXJlYTogU3RvcmFnZUFyZWEpOiBQcm9taXNlPFByb3ZpZGVyU2V0dGluZ3M+IHtcclxuICBjb25zdCByZWFkID0gYXdhaXQgZ3VhcmRlZCgoKSA9PiBhcmVhLmdldChQUk9WSURFUl9TRVRUSU5HU19LRVkpKTtcclxuICBpZiAoIXJlYWQub2spIHJldHVybiBERUZBVUxUX1BST1ZJREVSX1NFVFRJTkdTO1xyXG4gIGNvbnN0IHBhcnNlZCA9IHByb3ZpZGVyU2V0dGluZ3NTY2hlbWEuc2FmZVBhcnNlKHJlYWQuZGF0YSk7XHJcbiAgcmV0dXJuIHBhcnNlZC5zdWNjZXNzID8gcGFyc2VkLmRhdGEgOiBERUZBVUxUX1BST1ZJREVSX1NFVFRJTkdTO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGVQcm92aWRlclNldHRpbmdzKFxyXG4gIGFyZWE6IFN0b3JhZ2VBcmVhLFxyXG4gIHNldHRpbmdzOiBQcm92aWRlclNldHRpbmdzLFxyXG4pOiBQcm9taXNlPFJlc3VsdDxQcm92aWRlclNldHRpbmdzPj4ge1xyXG4gIGNvbnN0IHdyaXR0ZW4gPSBhd2FpdCBndWFyZGVkKCgpID0+IGFyZWEuc2V0KFBST1ZJREVSX1NFVFRJTkdTX0tFWSwgc2V0dGluZ3MpKTtcclxuICBpZiAoIXdyaXR0ZW4ub2spIHJldHVybiB3cml0dGVuO1xyXG4gIHJldHVybiBzdWNjZXNzKHNldHRpbmdzKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyUHJvdmlkZXJTZXR0aW5ncyhhcmVhOiBTdG9yYWdlQXJlYSk6IFByb21pc2U8UmVzdWx0PHZvaWQ+PiB7XHJcbiAgcmV0dXJuIGd1YXJkZWQoKCkgPT4gYXJlYS5yZW1vdmUoUFJPVklERVJfU0VUVElOR1NfS0VZKSk7XHJcbn1cclxuIiwiLyoqXHJcbiAqIENhY2hlIGZvciBBSS1nZW5lcmF0ZWQgbGVhcm5pbmcgaXRlbXMuXHJcbiAqXHJcbiAqIEJvdW5kZWQgYXQgMTAwIGVudHJpZXMgd2l0aCBvbGRlc3QtYWNjZXNzIGV2aWN0aW9uLCBzbyBhIGxvbmcgc2Vzc2lvbiBjYW5ub3RcclxuICogZ3JvdyBzdG9yYWdlIHdpdGhvdXQgbGltaXQuIEtleXMgYXJlIGhhc2hlcyBvZiB0aGUgc2VudGVuY2UgdGV4dCDigJQgdGhlXHJcbiAqIHNlbnRlbmNlIGl0c2VsZiBpcyBuZXZlciBzdG9yZWQsIHdoaWNoIGtlZXBzIHBhZ2UgY29udGVudCBvdXQgb2ZcclxuICogYHN0b3JhZ2UubG9jYWxgIHdoZW4gdGhlIHByb3ZpZGVyIGlzIGluIHVzZS5cclxuICovXHJcblxyXG5pbXBvcnQgeyBndWFyZGVkLCB0eXBlIFN0b3JhZ2VBcmVhIH0gZnJvbSAnLi9hcmVhJztcclxuaW1wb3J0IHsgUFJPVklERVJfQ0FDSEVfS0VZIH0gZnJvbSAnLi9rZXlzJztcclxuaW1wb3J0IHsgdmFsaWRhdGVUcmFwLCB0eXBlIENvbnRleHRUcmFwIH0gZnJvbSAnLi4vZG9tYWluL3RyYXAnO1xyXG5pbXBvcnQgeyBQUk9WSURFUl9NT0RFTCB9IGZyb20gJy4vcHJvdmlkZXItc2V0dGluZ3MnO1xyXG5pbXBvcnQgdHlwZSB7IFJlc3VsdCB9IGZyb20gJy4uL2RvbWFpbi9lcnJvcnMnO1xyXG5pbXBvcnQgeyBzdWNjZXNzIH0gZnJvbSAnLi4vZG9tYWluL2Vycm9ycyc7XHJcblxyXG5leHBvcnQgY29uc3QgUFJPVklERVJfQ0FDSEVfTElNSVQgPSAxMDA7XHJcbmV4cG9ydCBjb25zdCBQUk9WSURFUl9DQUNIRV9TQ09QRSA9IGBzb3VyY2U9ZW58dGFyZ2V0PWZyLUZSfHByb3ZpZGVyPWdlbWluaXxtb2RlbD0ke1BST1ZJREVSX01PREVMfXxwcm9tcHQ9djJ8c2NoZW1hPXYyYDtcclxuXHJcbmludGVyZmFjZSBDYWNoZUVudHJ5IHtcclxuICAvKiogTWlsbGlzZWNvbmQgdGltZXN0YW1wIG9mIHRoZSBtb3N0IHJlY2VudCByZWFkIG9yIHdyaXRlLiAqL1xyXG4gIGFjY2Vzc2VkQXQ6IG51bWJlcjtcclxuICB0cmFwczogdW5rbm93bltdO1xyXG59XHJcblxyXG50eXBlIENhY2hlU2hhcGUgPSBSZWNvcmQ8c3RyaW5nLCBDYWNoZUVudHJ5PjtcclxuXHJcbi8qKiBTZXJpYWxpemUgcmVhZC1tb2RpZnktd3JpdGUgb3BlcmF0aW9ucyBwZXIgc3RvcmFnZSBhcmVhLiAqL1xyXG5jb25zdCBjYWNoZVF1ZXVlcyA9IG5ldyBXZWFrTWFwPFN0b3JhZ2VBcmVhLCBQcm9taXNlPHZvaWQ+PigpO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gd2l0aENhY2hlTG9jazxUPihhcmVhOiBTdG9yYWdlQXJlYSwgd29yazogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xyXG4gIGNvbnN0IHByZXZpb3VzID0gY2FjaGVRdWV1ZXMuZ2V0KGFyZWEpID8/IFByb21pc2UucmVzb2x2ZSgpO1xyXG4gIGxldCByZWxlYXNlID0gKCk6IHZvaWQgPT4gdW5kZWZpbmVkO1xyXG4gIGNvbnN0IGN1cnJlbnQgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xyXG4gICAgcmVsZWFzZSA9IHJlc29sdmU7XHJcbiAgfSk7XHJcbiAgY29uc3QgdGFpbCA9IHByZXZpb3VzLmNhdGNoKCgpID0+IHVuZGVmaW5lZCkudGhlbigoKSA9PiBjdXJyZW50KTtcclxuICBjYWNoZVF1ZXVlcy5zZXQoYXJlYSwgdGFpbCk7XHJcblxyXG4gIGF3YWl0IHByZXZpb3VzLmNhdGNoKCgpID0+IHVuZGVmaW5lZCk7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBhd2FpdCB3b3JrKCk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHJlbGVhc2UoKTtcclxuICAgIGlmIChjYWNoZVF1ZXVlcy5nZXQoYXJlYSkgPT09IHRhaWwpIGNhY2hlUXVldWVzLmRlbGV0ZShhcmVhKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWNoZUtleUZvcihzZW50ZW5jZTogc3RyaW5nLCBzY29wZSA9IFBST1ZJREVSX0NBQ0hFX1NDT1BFKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICBjb25zdCBieXRlcyA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShgJHtzY29wZX1cXDAke3NlbnRlbmNlfWApO1xyXG4gIGNvbnN0IGRpZ2VzdCA9IGF3YWl0IGdsb2JhbFRoaXMuY3J5cHRvLnN1YnRsZS5kaWdlc3QoJ1NIQS0yNTYnLCBieXRlcyk7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20obmV3IFVpbnQ4QXJyYXkoZGlnZXN0KSwgKGJ5dGUpID0+IGJ5dGUudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsICcwJykpLmpvaW4oJycpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZWFkQ2FjaGUoYXJlYTogU3RvcmFnZUFyZWEpOiBQcm9taXNlPENhY2hlU2hhcGU+IHtcclxuICBjb25zdCByZWFkID0gYXdhaXQgZ3VhcmRlZCgoKSA9PiBhcmVhLmdldChQUk9WSURFUl9DQUNIRV9LRVkpKTtcclxuICBpZiAoIXJlYWQub2sgfHwgdHlwZW9mIHJlYWQuZGF0YSAhPT0gJ29iamVjdCcgfHwgcmVhZC5kYXRhID09PSBudWxsKSByZXR1cm4ge307XHJcbiAgcmV0dXJuIHJlYWQuZGF0YSBhcyBDYWNoZVNoYXBlO1xyXG59XHJcblxyXG4vKipcclxuICogTG9vayB1cCBjYWNoZWQgdHJhcHMgZm9yIGEgc2VudGVuY2UuIEVudHJpZXMgYXJlIHJlLXZhbGlkYXRlZCBvbiByZWFkLCBzbyBhXHJcbiAqIGNhY2hlIHdyaXR0ZW4gYnkgYW4gb2xkZXIsIGxheGVyIGJ1aWxkIGNhbiBuZXZlciBieXBhc3MgY3VycmVudCB2YWxpZGF0aW9uLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENhY2hlZFRyYXBzKFxyXG4gIGFyZWE6IFN0b3JhZ2VBcmVhLFxyXG4gIHNlbnRlbmNlOiBzdHJpbmcsXHJcbiAgbm93OiBEYXRlLFxyXG4gIHNjb3BlID0gUFJPVklERVJfQ0FDSEVfU0NPUEUsXHJcbik6IFByb21pc2U8Q29udGV4dFRyYXBbXSB8IG51bGw+IHtcclxuICByZXR1cm4gd2l0aENhY2hlTG9jayhhcmVhLCBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCBjYWNoZSA9IGF3YWl0IHJlYWRDYWNoZShhcmVhKTtcclxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGNhY2hlS2V5Rm9yKHNlbnRlbmNlLCBzY29wZSk7XHJcbiAgICBjb25zdCBlbnRyeSA9IGNhY2hlW2tleV07XHJcbiAgICBpZiAoIWVudHJ5KSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBjb25zdCB0cmFwcyA9IHJldmFsaWRhdGUoZW50cnksIHNlbnRlbmNlKTtcclxuICAgIGlmICh0cmFwcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xyXG5cclxuICAgIGVudHJ5LmFjY2Vzc2VkQXQgPSBub3cuZ2V0VGltZSgpO1xyXG4gICAgYXdhaXQgZ3VhcmRlZCgoKSA9PiBhcmVhLnNldChQUk9WSURFUl9DQUNIRV9LRVksIGNhY2hlKSk7XHJcbiAgICByZXR1cm4gdHJhcHM7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBMb29rIHVwIGEgd2hvbGUgYmF0Y2ggdW5kZXIgYSBzaW5nbGUgbG9jay5cclxuICpcclxuICogVGhlIHBlci1zZW50ZW5jZSBlbnRyeSBwb2ludCBiZWxvdyB0YWtlcyB0aGUgc2hhcmVkIGNhY2hlIGxvY2ssIHJlYWRzIHRoZVxyXG4gKiBlbnRpcmUgY2FjaGUgb2JqZWN0IGFuZCB3cml0ZXMgaXQgYmFjayBqdXN0IHRvIHRvdWNoIGBhY2Nlc3NlZEF0YC4gQ2FsbGluZyBpdFxyXG4gKiBpbiBhIGxvb3AgdHVybmVkIG9uZSBhY3RpdmF0aW9uIGludG8gaHVuZHJlZHMgb2Ygc2VyaWFsaXplZCByZWFkLW1vZGlmeS13cml0ZVxyXG4gKiBjeWNsZXMgb24gb25lIHN0b3JhZ2Uga2V5IOKAlCBhbmQgYmVjYXVzZSB0aGUgbG9jayBpcyBzaGFyZWQsIGl0IGFsc29cclxuICogc2VyaWFsaXplZCBnZW5lcmF0aW9uIGJhdGNoZXMgdGhhdCB3ZXJlIG1lYW50IHRvIHJ1biBjb25jdXJyZW50bHkuIFRoaXMgZG9lc1xyXG4gKiB0aGUgc2FtZSB3b3JrIHdpdGggb25lIGxvY2ssIG9uZSByZWFkIGFuZCBvbmUgd3JpdGUuXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q2FjaGVkVHJhcHNCYXRjaChcclxuICBhcmVhOiBTdG9yYWdlQXJlYSxcclxuICBzZW50ZW5jZXM6IHJlYWRvbmx5IHN0cmluZ1tdLFxyXG4gIG5vdzogRGF0ZSxcclxuICBzY29wZSA9IFBST1ZJREVSX0NBQ0hFX1NDT1BFLFxyXG4pOiBQcm9taXNlPE1hcDxzdHJpbmcsIENvbnRleHRUcmFwW10+PiB7XHJcbiAgaWYgKHNlbnRlbmNlcy5sZW5ndGggPT09IDApIHJldHVybiBuZXcgTWFwKCk7XHJcblxyXG4gIGNvbnN0IGtleXMgPSBhd2FpdCBQcm9taXNlLmFsbChzZW50ZW5jZXMubWFwKChzZW50ZW5jZSkgPT4gY2FjaGVLZXlGb3Ioc2VudGVuY2UsIHNjb3BlKSkpO1xyXG5cclxuICByZXR1cm4gd2l0aENhY2hlTG9jayhhcmVhLCBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCBjYWNoZSA9IGF3YWl0IHJlYWRDYWNoZShhcmVhKTtcclxuICAgIGNvbnN0IGhpdHMgPSBuZXcgTWFwPHN0cmluZywgQ29udGV4dFRyYXBbXT4oKTtcclxuICAgIGxldCB0b3VjaGVkID0gZmFsc2U7XHJcblxyXG4gICAgZm9yIChjb25zdCBbaW5kZXgsIHNlbnRlbmNlXSBvZiBzZW50ZW5jZXMuZW50cmllcygpKSB7XHJcbiAgICAgIGNvbnN0IGtleSA9IGtleXNbaW5kZXhdO1xyXG4gICAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xyXG4gICAgICBjb25zdCBlbnRyeSA9IGNhY2hlW2tleV07XHJcbiAgICAgIGlmICghZW50cnkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgY29uc3QgdHJhcHMgPSByZXZhbGlkYXRlKGVudHJ5LCBzZW50ZW5jZSk7XHJcbiAgICAgIGlmICh0cmFwcy5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xyXG5cclxuICAgICAgaGl0cy5zZXQoc2VudGVuY2UsIHRyYXBzKTtcclxuICAgICAgZW50cnkuYWNjZXNzZWRBdCA9IG5vdy5nZXRUaW1lKCk7XHJcbiAgICAgIHRvdWNoZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0b3VjaGVkKSBhd2FpdCBndWFyZGVkKCgpID0+IGFyZWEuc2V0KFBST1ZJREVSX0NBQ0hFX0tFWSwgY2FjaGUpKTtcclxuICAgIHJldHVybiBoaXRzO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vKiogU3RvcmUgYSB3aG9sZSBiYXRjaCB1bmRlciBhIHNpbmdsZSBsb2NrLCBldmljdGluZyBvbmNlIGF0IHRoZSBlbmQuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRDYWNoZWRUcmFwc0JhdGNoKFxyXG4gIGFyZWE6IFN0b3JhZ2VBcmVhLFxyXG4gIGVudHJpZXM6IHJlYWRvbmx5IHsgcmVhZG9ubHkgc2VudGVuY2U6IHN0cmluZzsgcmVhZG9ubHkgdHJhcHM6IHJlYWRvbmx5IENvbnRleHRUcmFwW10gfVtdLFxyXG4gIG5vdzogRGF0ZSxcclxuICBzY29wZSA9IFBST1ZJREVSX0NBQ0hFX1NDT1BFLFxyXG4pOiBQcm9taXNlPFJlc3VsdDx2b2lkPj4ge1xyXG4gIGNvbnN0IHdyaXRhYmxlOiB7IGtleTogc3RyaW5nOyB0ZW1wbGF0ZXM6IFBhcnRpYWw8Q29udGV4dFRyYXA+W10gfVtdID0gW107XHJcblxyXG4gIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xyXG4gICAgY29uc3QgdGVtcGxhdGVzID0gdGVtcGxhdGVzRm9yKGVudHJ5LnNlbnRlbmNlLCBlbnRyeS50cmFwcyk7XHJcbiAgICBpZiAodGVtcGxhdGVzLmxlbmd0aCA9PT0gMCkgY29udGludWU7XHJcbiAgICB3cml0YWJsZS5wdXNoKHsga2V5OiBhd2FpdCBjYWNoZUtleUZvcihlbnRyeS5zZW50ZW5jZSwgc2NvcGUpLCB0ZW1wbGF0ZXMgfSk7XHJcbiAgfVxyXG4gIGlmICh3cml0YWJsZS5sZW5ndGggPT09IDApIHJldHVybiBzdWNjZXNzKHVuZGVmaW5lZCk7XHJcblxyXG4gIHJldHVybiB3aXRoQ2FjaGVMb2NrKGFyZWEsIGFzeW5jICgpID0+IHtcclxuICAgIGNvbnN0IGNhY2hlID0gYXdhaXQgcmVhZENhY2hlKGFyZWEpO1xyXG4gICAgZm9yIChjb25zdCB7IGtleSwgdGVtcGxhdGVzIH0gb2Ygd3JpdGFibGUpIHtcclxuICAgICAgY2FjaGVba2V5XSA9IHsgYWNjZXNzZWRBdDogbm93LmdldFRpbWUoKSwgdHJhcHM6IHRlbXBsYXRlcyB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGd1YXJkZWQoKCkgPT4gYXJlYS5zZXQoUFJPVklERVJfQ0FDSEVfS0VZLCBldmljdChjYWNoZSkpKTtcclxuICB9KTtcclxufVxyXG5cclxuLyoqIFJlLXZhbGlkYXRlIHN0b3JlZCB0ZW1wbGF0ZXMgYWdhaW5zdCB0aGUgc2VudGVuY2UgdGhleSBhcmUgYmVpbmcgcmVwbGF5ZWQgb24uICovXHJcbmZ1bmN0aW9uIHJldmFsaWRhdGUoZW50cnk6IENhY2hlRW50cnksIHNlbnRlbmNlOiBzdHJpbmcpOiBDb250ZXh0VHJhcFtdIHtcclxuICBjb25zdCB0cmFwczogQ29udGV4dFRyYXBbXSA9IFtdO1xyXG4gIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGVudHJ5LnRyYXBzKSB7XHJcbiAgICBpZiAodHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ29iamVjdCcgfHwgY2FuZGlkYXRlID09PSBudWxsKSBjb250aW51ZTtcclxuICAgIGNvbnN0IHZhbGlkYXRlZCA9IHZhbGlkYXRlVHJhcCh7IC4uLmNhbmRpZGF0ZSwgc2VudGVuY2UgfSwgeyB1bnRydXN0ZWQ6IHRydWUgfSk7XHJcbiAgICBpZiAodmFsaWRhdGVkLm9rKSB0cmFwcy5wdXNoKHZhbGlkYXRlZC5kYXRhKTtcclxuICB9XHJcbiAgcmV0dXJuIHRyYXBzO1xyXG59XHJcblxyXG4vKiogVmFsaWRhdGVkLCBzZW50ZW5jZS1mcmVlIHRlbXBsYXRlcyByZWFkeSB0byBzdG9yZS4gKi9cclxuZnVuY3Rpb24gdGVtcGxhdGVzRm9yKHNlbnRlbmNlOiBzdHJpbmcsIHRyYXBzOiByZWFkb25seSBDb250ZXh0VHJhcFtdKTogUGFydGlhbDxDb250ZXh0VHJhcD5bXSB7XHJcbiAgY29uc3QgdGVtcGxhdGVzOiBQYXJ0aWFsPENvbnRleHRUcmFwPltdID0gW107XHJcbiAgZm9yIChjb25zdCB0cmFwIG9mIHRyYXBzKSB7XHJcbiAgICBjb25zdCB2YWxpZGF0ZWQgPSB2YWxpZGF0ZVRyYXAoeyAuLi50cmFwLCBzZW50ZW5jZSB9LCB7IHVudHJ1c3RlZDogdHJ1ZSB9KTtcclxuICAgIGlmICghdmFsaWRhdGVkLm9rKSBjb250aW51ZTtcclxuICAgIGNvbnN0IHRlbXBsYXRlOiBQYXJ0aWFsPENvbnRleHRUcmFwPiA9IHsgLi4udmFsaWRhdGVkLmRhdGEgfTtcclxuICAgIGRlbGV0ZSB0ZW1wbGF0ZS5zZW50ZW5jZTtcclxuICAgIHRlbXBsYXRlcy5wdXNoKHRlbXBsYXRlKTtcclxuICB9XHJcbiAgcmV0dXJuIHRlbXBsYXRlcztcclxufVxyXG5cclxuLyoqIEtlZXAgdGhlIG1vc3QgcmVjZW50bHkgYWNjZXNzZWQgZW50cmllcywgb2xkZXN0LWFjY2VzcyBldmljdGVkIGZpcnN0LiAqL1xyXG5mdW5jdGlvbiBldmljdChjYWNoZTogQ2FjaGVTaGFwZSk6IENhY2hlU2hhcGUge1xyXG4gIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhjYWNoZSk7XHJcbiAgaWYgKGVudHJpZXMubGVuZ3RoIDw9IFBST1ZJREVSX0NBQ0hFX0xJTUlUKSByZXR1cm4gY2FjaGU7XHJcblxyXG4gIGVudHJpZXMuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgY29uc3QgYnlBY2Nlc3MgPSBiWzFdLmFjY2Vzc2VkQXQgLSBhWzFdLmFjY2Vzc2VkQXQ7XHJcbiAgICBpZiAoYnlBY2Nlc3MgIT09IDApIHJldHVybiBieUFjY2VzcztcclxuICAgIHJldHVybiBhWzBdIDwgYlswXSA/IC0xIDogYVswXSA+IGJbMF0gPyAxIDogMDtcclxuICB9KTtcclxuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKGVudHJpZXMuc2xpY2UoMCwgUFJPVklERVJfQ0FDSEVfTElNSVQpKTtcclxufVxyXG5cclxuLyoqIFN0b3JlIHRyYXBzIGZvciBhIHNlbnRlbmNlLCBldmljdGluZyB0aGUgbGVhc3QgcmVjZW50bHkgYWNjZXNzZWQgZW50cmllcy4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldENhY2hlZFRyYXBzKFxyXG4gIGFyZWE6IFN0b3JhZ2VBcmVhLFxyXG4gIHNlbnRlbmNlOiBzdHJpbmcsXHJcbiAgdHJhcHM6IHJlYWRvbmx5IENvbnRleHRUcmFwW10sXHJcbiAgbm93OiBEYXRlLFxyXG4gIHNjb3BlID0gUFJPVklERVJfQ0FDSEVfU0NPUEUsXHJcbik6IFByb21pc2U8UmVzdWx0PHZvaWQ+PiB7XHJcbiAgcmV0dXJuIHNldENhY2hlZFRyYXBzQmF0Y2goYXJlYSwgW3sgc2VudGVuY2UsIHRyYXBzIH1dLCBub3csIHNjb3BlKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyUHJvdmlkZXJDYWNoZShhcmVhOiBTdG9yYWdlQXJlYSk6IFByb21pc2U8UmVzdWx0PHZvaWQ+PiB7XHJcbiAgcmV0dXJuIHdpdGhDYWNoZUxvY2soYXJlYSwgKCkgPT4gZ3VhcmRlZCgoKSA9PiBhcmVhLnJlbW92ZShQUk9WSURFUl9DQUNIRV9LRVkpKSk7XHJcbn1cclxuXHJcbi8qKiBFbnRyeSBjb3VudCwgZm9yIHRlc3RzIGFuZCB0aGUgcG9wdXAncyBzdG9yYWdlIGRpc2Nsb3N1cmUuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm92aWRlckNhY2hlU2l6ZShhcmVhOiBTdG9yYWdlQXJlYSk6IFByb21pc2U8UmVzdWx0PG51bWJlcj4+IHtcclxuICByZXR1cm4gd2l0aENhY2hlTG9jayhhcmVhLCBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCBjYWNoZSA9IGF3YWl0IHJlYWRDYWNoZShhcmVhKTtcclxuICAgIHJldHVybiBzdWNjZXNzKE9iamVjdC5rZXlzKGNhY2hlKS5sZW5ndGgpO1xyXG4gIH0pO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDbGllbnQgZm9yIHRoZSBhbHdheXMtb24gbG9jYWwgZ2VuZXJhdGlvbiBBUEkuXHJcbiAqXHJcbiAqIEV2ZXJ5IGNhbGwgaGFzIGEgaGFyZCB0aW1lb3V0LCBhbmQgYW55IGZhaWx1cmUgbGVhdmVzIHZhbGlkYXRlZCBidW5kbGVkXHJcbiAqIHZvY2FidWxhcnkgaW4gcGxhY2UuIEFydGljbGUgdGV4dCBpcyBhbHdheXMgcGFpcmVkIHdpdGggdGhlIGxlYXJuZXIncyBERUxGXHJcbiAqIGxlbnMgc28gZ2VuZXJhdGVkIGhpZ2hsaWdodHMgYXJlIGFwcHJvcHJpYXRlIGZvciB0aGVpciByZWFkaW5nIGxldmVsLlxyXG4gKlxyXG4gKiBXaGF0IGxlYXZlcyB0aGUgYnJvd3NlcjogYXJ0aWNsZSB0ZXh0IGluIGJhdGNoZXMgb2YgYXQgbW9zdCBlaWdodCBzZW50ZW5jZXMuXHJcbiAqIE5ldmVyIHRoZSBwYWdlIFVSTCwgbmV2ZXIgdGhlIGxlYXJuZXIgcHJvZmlsZSwgbmV2ZXIgYW5zd2VyIGhpc3RvcnksIG5ldmVyXHJcbiAqIGFueXRoaW5nIGVsc2UgZnJvbSB0aGUgcGFnZS5cclxuICovXHJcblxyXG5pbXBvcnQgeyBMT0NBTF9BUElfTUVTU0FHRSwgZmFpbHVyZSwgc3VjY2VzcywgdHlwZSBSZXN1bHQgfSBmcm9tICcuLi9kb21haW4vZXJyb3JzJztcclxuaW1wb3J0IHsgY29sbGFwc2VXaGl0ZXNwYWNlIH0gZnJvbSAnLi4vZG9tYWluL25vcm1hbGl6ZSc7XHJcbmltcG9ydCB7IHZhbGlkYXRlVHJhcCwgdHlwZSBHZW5lcmF0ZWRUcmFwQ2FuZGlkYXRlIH0gZnJvbSAnLi4vZG9tYWluL3RyYXAnO1xyXG5pbXBvcnQgdHlwZSB7IERlbGZMZXZlbCB9IGZyb20gJy4uL2RvbWFpbi9kZWxmJztcclxuaW1wb3J0IHtcclxuICBQUk9WSURFUl9FTkRQT0lOVCxcclxuICBQUk9WSURFUl9IRUFMVEhfVElNRU9VVF9NUyxcclxuICBQUk9WSURFUl9IRUFMVEhfRU5EUE9JTlQsXHJcbiAgUFJPVklERVJfTUFYX0FUVEVNUFRTLFxyXG4gIFBST1ZJREVSX01BWF9TRU5URU5DRVMsXHJcbiAgUFJPVklERVJfTUFYX1NFTlRFTkNFX0xFTkdUSCxcclxuICBQUk9WSURFUl9NT0RFTCxcclxuICBQUk9WSURFUl9USU1FT1VUX01TLFxyXG59IGZyb20gJy4uL3N0b3JhZ2UvcHJvdmlkZXItc2V0dGluZ3MnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQcm92aWRlclNlbnRlbmNlIHtcclxuICByZWFkb25seSBpZDogc3RyaW5nO1xyXG4gIHJlYWRvbmx5IHRleHQ6IHN0cmluZztcclxufVxyXG5cclxuLyoqIFN0YXR1cyBjb2RlcyB0aGUgc2VydmVyIHVzZXMsIG1hcHBlZCBvbnRvIEVjbGlwc2UncyBlcnJvciB2b2NhYnVsYXJ5LiAqL1xyXG5mdW5jdGlvbiBjb2RlRm9yU3RhdHVzKHN0YXR1czogbnVtYmVyKSB7XHJcbiAgc3dpdGNoIChzdGF0dXMpIHtcclxuICAgIGNhc2UgNDAzOlxyXG4gICAgICByZXR1cm4gJ1BST1ZJREVSX1BFUk1JU1NJT05fREVOSUVEJyBhcyBjb25zdDtcclxuICAgIGNhc2UgNDI5OlxyXG4gICAgY2FzZSA1MDM6XHJcbiAgICAgIHJldHVybiAnUFJPVklERVJfVU5BVkFJTEFCTEUnIGFzIGNvbnN0O1xyXG4gICAgY2FzZSA1MDQ6XHJcbiAgICAgIHJldHVybiAnUFJPVklERVJfVElNRU9VVCcgYXMgY29uc3Q7XHJcbiAgICBjYXNlIDUwMjpcclxuICAgIGNhc2UgNDAwOlxyXG4gICAgICByZXR1cm4gJ1BST1ZJREVSX0lOVkFMSURfUkVTUE9OU0UnIGFzIGNvbnN0O1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuICdQUk9WSURFUl9VTkFWQUlMQUJMRScgYXMgY29uc3Q7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZldGNoVHJhcHNPcHRpb25zIHtcclxuICByZWFkb25seSBlbmRwb2ludD86IHN0cmluZztcclxuICByZWFkb25seSB0aW1lb3V0TXM/OiBudW1iZXI7XHJcbiAgcmVhZG9ubHkgZmV0Y2hJbXBsPzogdHlwZW9mIGZldGNoO1xyXG4gIC8qKiBUZXN0IHNlYW0gYW5kIGVtZXJnZW5jeSBvdmVycmlkZTsgcHJvZHVjdGlvbiB1c2VzIHR3byB0b3RhbCBhdHRlbXB0cy4gKi9cclxuICByZWFkb25seSBtYXhBdHRlbXB0cz86IG51bWJlcjtcclxuICAvKiogVGVzdCBzZWFtOyBwcm9kdWN0aW9uIHJldHJpZXMgdXNlIGEgc2hvcnQsIGRldGVybWluaXN0aWMgc3RhZ2dlci4gKi9cclxuICByZWFkb25seSByZXRyeURlbGF5TXM/OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUHJvdmlkZXJIZWFsdGgge1xyXG4gIHJlYWRvbmx5IHByb3ZpZGVyOiAnZ2VtaW5pJztcclxuICByZWFkb25seSBtb2RlbDogdHlwZW9mIFBST1ZJREVSX01PREVMO1xyXG59XHJcblxyXG4vKiogVmVyaWZ5IHRoZSBsb2NhbCBzZXJ2ZXIgYmVmb3JlIHBlcnNpc3RpbmcgdGhlIEFJLWVuYWJsZWQgc2V0dGluZy4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrUHJvdmlkZXJIZWFsdGgoXHJcbiAgb3B0aW9uczogRmV0Y2hUcmFwc09wdGlvbnMgPSB7fSxcclxuKTogUHJvbWlzZTxSZXN1bHQ8UHJvdmlkZXJIZWFsdGg+PiB7XHJcbiAgY29uc3QgZG9GZXRjaCA9IG9wdGlvbnMuZmV0Y2hJbXBsID8/IGdsb2JhbFRoaXMuZmV0Y2g7XHJcbiAgaWYgKHR5cGVvZiBkb0ZldGNoICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFpbHVyZSgnUFJPVklERVJfVU5BVkFJTEFCTEUnKTtcclxuXHJcbiAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcclxuICBjb25zdCB0aW1lb3V0TXMgPSBvcHRpb25zLnRpbWVvdXRNcyA/PyBQUk9WSURFUl9IRUFMVEhfVElNRU9VVF9NUztcclxuICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCB0aW1lb3V0TXMpO1xyXG5cclxuICBsZXQgcmVzcG9uc2U6IFJlc3BvbnNlO1xyXG4gIHRyeSB7XHJcbiAgICByZXNwb25zZSA9IGF3YWl0IGRvRmV0Y2goUFJPVklERVJfSEVBTFRIX0VORFBPSU5ULCB7XHJcbiAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXHJcbiAgICAgIGNyZWRlbnRpYWxzOiAnb21pdCcsXHJcbiAgICAgIGNhY2hlOiAnbm8tc3RvcmUnLFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoY2F1c2UpIHtcclxuICAgIGNvbnN0IGFib3J0ZWQgPSBjYXVzZSBpbnN0YW5jZW9mIEVycm9yICYmIGNhdXNlLm5hbWUgPT09ICdBYm9ydEVycm9yJztcclxuICAgIHJldHVybiBmYWlsdXJlKGFib3J0ZWQgPyAnUFJPVklERVJfVElNRU9VVCcgOiAnUFJPVklERVJfVU5BVkFJTEFCTEUnKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICB9XHJcblxyXG4gIGlmICghcmVzcG9uc2Uub2spIHJldHVybiBmYWlsdXJlKCdQUk9WSURFUl9VTkFWQUlMQUJMRScpO1xyXG5cclxuICBsZXQgYm9keTogdW5rbm93bjtcclxuICB0cnkge1xyXG4gICAgYm9keSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBmYWlsdXJlKCdQUk9WSURFUl9JTlZBTElEX1JFU1BPTlNFJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBoZWFsdGggPSBib2R5IGFzIHsgb2s/OiB1bmtub3duOyBwcm92aWRlcj86IHVua25vd247IG1vZGVsPzogdW5rbm93biB9O1xyXG4gIGlmIChoZWFsdGgub2sgIT09IHRydWUgfHwgaGVhbHRoLnByb3ZpZGVyICE9PSAnZ2VtaW5pJyB8fCBoZWFsdGgubW9kZWwgIT09IFBST1ZJREVSX01PREVMKSB7XHJcbiAgICByZXR1cm4gZmFpbHVyZShcclxuICAgICAgJ1BST1ZJREVSX0RJU0FCTEVEJyxcclxuICAgICAgYFN0YXJ0IHRoZSBsb2NhbCBHZW1pbmkgc2VydmVyIHdpdGggbW9kZWwgJHtQUk9WSURFUl9NT0RFTH0sIHRoZW4gdHJ5IGFnYWluLmAsXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHN1Y2Nlc3MoeyBwcm92aWRlcjogJ2dlbWluaScsIG1vZGVsOiBQUk9WSURFUl9NT0RFTCB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFzayB0aGUgbG9jYWwgQVBJIGZvciB0cmFwcyBvdmVyIHRoZSBnaXZlbiBzZW50ZW5jZXMuXHJcbiAqXHJcbiAqIFJldHVybnMgdmFsaWRhdGVkLCBzZW50ZW5jZS1ib3VuZCBjYW5kaWRhdGVzIG9ubHkuIEFueXRoaW5nIHRoZSBzZXJ2ZXIgc2VuZHMgdGhhdCBkb2VzIG5vdCBwYXNzXHJcbiAqIHRoZSBzYW1lIHZhbGlkYXRpb24gdGhlIGNhdGFsb2cgcGFzc2VzIGlzIGRpc2NhcmRlZCDigJQgYW4gaW52YWxpZCBtb2RlbFxyXG4gKiByZXNwb25zZSBjYW4gbmV2ZXIgcmVhY2ggdGhlIERPTS5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaEdlbmVyYXRlZFRyYXBzKFxyXG4gIHNlbnRlbmNlczogcmVhZG9ubHkgUHJvdmlkZXJTZW50ZW5jZVtdLFxyXG4gIGRlbGZMZXZlbDogRGVsZkxldmVsLFxyXG4gIG9wdGlvbnM6IEZldGNoVHJhcHNPcHRpb25zID0ge30sXHJcbik6IFByb21pc2U8UmVzdWx0PEdlbmVyYXRlZFRyYXBDYW5kaWRhdGVbXT4+IHtcclxuICBjb25zdCBlbmRwb2ludCA9IG9wdGlvbnMuZW5kcG9pbnQgPz8gUFJPVklERVJfRU5EUE9JTlQ7XHJcbiAgY29uc3QgdGltZW91dE1zID0gb3B0aW9ucy50aW1lb3V0TXMgPz8gUFJPVklERVJfVElNRU9VVF9NUztcclxuICBjb25zdCBkb0ZldGNoID0gb3B0aW9ucy5mZXRjaEltcGwgPz8gZ2xvYmFsVGhpcy5mZXRjaDtcclxuXHJcbiAgaWYgKHR5cGVvZiBkb0ZldGNoICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICByZXR1cm4gZmFpbHVyZSgnUFJPVklERVJfVU5BVkFJTEFCTEUnLCAnTm8gZmV0Y2ggaW1wbGVtZW50YXRpb24gaXMgYXZhaWxhYmxlLicpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcGF5bG9hZCA9IHtcclxuICAgIHNvdXJjZUxvY2FsZTogJ2VuJyBhcyBjb25zdCxcclxuICAgIHRhcmdldExvY2FsZTogJ2ZyLUZSJyBhcyBjb25zdCxcclxuICAgIGRlbGZMZXZlbCxcclxuICAgIHNlbnRlbmNlczogc2VudGVuY2VzLnNsaWNlKDAsIFBST1ZJREVSX01BWF9TRU5URU5DRVMpLm1hcCgoc2VudGVuY2UpID0+ICh7XHJcbiAgICAgIGlkOiBzZW50ZW5jZS5pZCxcclxuICAgICAgdGV4dDogc2VudGVuY2UudGV4dC5zbGljZSgwLCBQUk9WSURFUl9NQVhfU0VOVEVOQ0VfTEVOR1RIKSxcclxuICAgIH0pKSxcclxuICB9O1xyXG5cclxuICBpZiAocGF5bG9hZC5zZW50ZW5jZXMubGVuZ3RoID09PSAwKSByZXR1cm4gc3VjY2VzcyhbXSk7XHJcblxyXG4gIGNvbnN0IG1heEF0dGVtcHRzID0gTWF0aC5tYXgoMSwgTWF0aC5taW4oMywgb3B0aW9ucy5tYXhBdHRlbXB0cyA/PyBQUk9WSURFUl9NQVhfQVRURU1QVFMpKTtcclxuICBsZXQgbGFzdEZhaWx1cmU6IFJlc3VsdDxHZW5lcmF0ZWRUcmFwQ2FuZGlkYXRlW10+ID0gZmFpbHVyZSgnUFJPVklERVJfVU5BVkFJTEFCTEUnKTtcclxuXHJcbiAgZm9yIChsZXQgYXR0ZW1wdCA9IDA7IGF0dGVtcHQgPCBtYXhBdHRlbXB0czsgYXR0ZW1wdCArPSAxKSB7XHJcbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xyXG4gICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgdGltZW91dE1zKTtcclxuXHJcbiAgICBsZXQgcmVzcG9uc2U6IFJlc3BvbnNlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCBkb0ZldGNoKGVuZHBvaW50LCB7XHJcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXHJcbiAgICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcclxuICAgICAgICAvLyBOZXZlciBhdHRhY2ggY29va2llcyBvciBjcmVkZW50aWFscyB0byBhIGdlbmVyYXRpb24gY2FsbC5cclxuICAgICAgICBjcmVkZW50aWFsczogJ29taXQnLFxyXG4gICAgICAgIGNhY2hlOiAnbm8tc3RvcmUnLFxyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGNhdXNlKSB7XHJcbiAgICAgIGNvbnN0IGFib3J0ZWQgPSBjYXVzZSBpbnN0YW5jZW9mIEVycm9yICYmIGNhdXNlLm5hbWUgPT09ICdBYm9ydEVycm9yJztcclxuICAgICAgLy8gQSB0cmFuc3BvcnQgZmFpbHVyZSBoZXJlIG1lYW5zIG5vdGhpbmcgYW5zd2VyZWQgb24gdGhlIGxvb3BiYWNrIHBvcnQg4oCUXHJcbiAgICAgIC8vIGFsbW9zdCBhbHdheXMgYSBzZXJ2ZXIgdGhhdCB3YXMgbmV2ZXIgc3RhcnRlZC4gU2F5IHdoaWNoIGNvbW1hbmRcclxuICAgICAgLy8gc3RhcnRzIGl0IHJhdGhlciB0aGFuIHJlcG9ydGluZyBhbiB1bnJlYWNoYWJsZSBob3N0IGFuZCBzdG9wcGluZy5cclxuICAgICAgbGFzdEZhaWx1cmUgPSBmYWlsdXJlKFxyXG4gICAgICAgIGFib3J0ZWQgPyAnUFJPVklERVJfVElNRU9VVCcgOiAnUFJPVklERVJfVU5BVkFJTEFCTEUnLFxyXG4gICAgICAgIGFib3J0ZWRcclxuICAgICAgICAgID8gYFRoZSBnZW5lcmF0aW9uIEFQSSBkaWQgbm90IGFuc3dlciB3aXRoaW4gJHt0aW1lb3V0TXN9bXMgYWZ0ZXIgYXV0b21hdGljIHJlY292ZXJ5LmBcclxuICAgICAgICAgIDogTE9DQUxfQVBJX01FU1NBR0UsXHJcbiAgICAgICk7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgICAgIGlmIChhdHRlbXB0ICsgMSA8IG1heEF0dGVtcHRzKSB7XHJcbiAgICAgICAgYXdhaXQgd2FpdEJlZm9yZVJldHJ5KG9wdGlvbnMsIHBheWxvYWQuc2VudGVuY2VzWzBdPy5pZCA/PyAnJywgYXR0ZW1wdCk7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGxhc3RGYWlsdXJlO1xyXG4gICAgfVxyXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgIGxhc3RGYWlsdXJlID0gZmFpbHVyZShcclxuICAgICAgICBjb2RlRm9yU3RhdHVzKHJlc3BvbnNlLnN0YXR1cyksXHJcbiAgICAgICAgYEdlbmVyYXRpb24gQVBJIHJldHVybmVkICR7cmVzcG9uc2Uuc3RhdHVzfSBhZnRlciBhdXRvbWF0aWMgcmVjb3ZlcnkuYCxcclxuICAgICAgKTtcclxuICAgICAgaWYgKGF0dGVtcHQgKyAxIDwgbWF4QXR0ZW1wdHMgJiYgaXNSZXRyeWFibGVTdGF0dXMocmVzcG9uc2Uuc3RhdHVzKSkge1xyXG4gICAgICAgIGF3YWl0IHdhaXRCZWZvcmVSZXRyeShvcHRpb25zLCBwYXlsb2FkLnNlbnRlbmNlc1swXT8uaWQgPz8gJycsIGF0dGVtcHQpO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBsYXN0RmFpbHVyZTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgYm9keTogdW5rbm93bjtcclxuICAgIHRyeSB7XHJcbiAgICAgIGJvZHkgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgbGFzdEZhaWx1cmUgPSBmYWlsdXJlKFxyXG4gICAgICAgICdQUk9WSURFUl9JTlZBTElEX1JFU1BPTlNFJyxcclxuICAgICAgICAnR2VuZXJhdGlvbiBBUEkgcmV0dXJuZWQgbWFsZm9ybWVkIEpTT04gYWZ0ZXIgYXV0b21hdGljIHJlY292ZXJ5LicsXHJcbiAgICAgICk7XHJcbiAgICAgIGlmIChhdHRlbXB0ICsgMSA8IG1heEF0dGVtcHRzKSB7XHJcbiAgICAgICAgYXdhaXQgd2FpdEJlZm9yZVJldHJ5KG9wdGlvbnMsIHBheWxvYWQuc2VudGVuY2VzWzBdPy5pZCA/PyAnJywgYXR0ZW1wdCk7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGxhc3RGYWlsdXJlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSAoYm9keSBhcyB7IGNhbmRpZGF0ZXM/OiB1bmtub3duIH0pLmNhbmRpZGF0ZXM7XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY2FuZGlkYXRlcykpIHtcclxuICAgICAgbGFzdEZhaWx1cmUgPSBmYWlsdXJlKFxyXG4gICAgICAgICdQUk9WSURFUl9JTlZBTElEX1JFU1BPTlNFJyxcclxuICAgICAgICAnR2VuZXJhdGlvbiBBUEkgcmVzcG9uc2UgaGFkIG5vIGNhbmRpZGF0ZXMgYXJyYXkgYWZ0ZXIgYXV0b21hdGljIHJlY292ZXJ5LicsXHJcbiAgICAgICk7XHJcbiAgICAgIGlmIChhdHRlbXB0ICsgMSA8IG1heEF0dGVtcHRzKSB7XHJcbiAgICAgICAgYXdhaXQgd2FpdEJlZm9yZVJldHJ5KG9wdGlvbnMsIHBheWxvYWQuc2VudGVuY2VzWzBdPy5pZCA/PyAnJywgYXR0ZW1wdCk7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGxhc3RGYWlsdXJlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNlbnRlbmNlc0J5SWQgPSBuZXcgTWFwKFxyXG4gICAgICBwYXlsb2FkLnNlbnRlbmNlcy5tYXAoKHNlbnRlbmNlKSA9PiBbc2VudGVuY2UuaWQsIHNlbnRlbmNlLnRleHRdKSxcclxuICAgICk7XHJcbiAgICBjb25zdCBhY2NlcHRlZDogR2VuZXJhdGVkVHJhcENhbmRpZGF0ZVtdID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBjYW5kaWRhdGVzLnNsaWNlKDAsIFBST1ZJREVSX01BWF9TRU5URU5DRVMpKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgY2FuZGlkYXRlICE9PSAnb2JqZWN0JyB8fCBjYW5kaWRhdGUgPT09IG51bGwpIGNvbnRpbnVlO1xyXG4gICAgICBjb25zdCBzZW50ZW5jZUlkID0gKGNhbmRpZGF0ZSBhcyB7IHNlbnRlbmNlSWQ/OiB1bmtub3duIH0pLnNlbnRlbmNlSWQ7XHJcbiAgICAgIGlmICh0eXBlb2Ygc2VudGVuY2VJZCAhPT0gJ3N0cmluZycpIGNvbnRpbnVlO1xyXG4gICAgICBjb25zdCBzZW50ZW5jZSA9IHNlbnRlbmNlc0J5SWQuZ2V0KHNlbnRlbmNlSWQpO1xyXG4gICAgICBpZiAoc2VudGVuY2UgPT09IHVuZGVmaW5lZCkgY29udGludWU7XHJcblxyXG4gICAgICBjb25zdCB2YWxpZGF0ZWQgPSB2YWxpZGF0ZVRyYXAoKGNhbmRpZGF0ZSBhcyB7IHRyYXA/OiB1bmtub3duIH0pLnRyYXAsIHsgdW50cnVzdGVkOiB0cnVlIH0pO1xyXG4gICAgICBpZiAoIXZhbGlkYXRlZC5vaykgY29udGludWU7XHJcbiAgICAgIGlmIChjb2xsYXBzZVdoaXRlc3BhY2UodmFsaWRhdGVkLmRhdGEuc2VudGVuY2UpICE9PSBjb2xsYXBzZVdoaXRlc3BhY2Uoc2VudGVuY2UpKSBjb250aW51ZTtcclxuXHJcbiAgICAgIGFjY2VwdGVkLnB1c2goeyBzZW50ZW5jZUlkLCB0cmFwOiB2YWxpZGF0ZWQuZGF0YSB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3VjY2VzcyhhY2NlcHRlZCk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbGFzdEZhaWx1cmU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzUmV0cnlhYmxlU3RhdHVzKHN0YXR1czogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIHN0YXR1cyA9PT0gNDI5IHx8IHN0YXR1cyA9PT0gNTAwIHx8IHN0YXR1cyA9PT0gNTAyIHx8IHN0YXR1cyA9PT0gNTAzIHx8IHN0YXR1cyA9PT0gNTA0O1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiB3YWl0QmVmb3JlUmV0cnkoXHJcbiAgb3B0aW9uczogRmV0Y2hUcmFwc09wdGlvbnMsXHJcbiAgc2VudGVuY2VJZDogc3RyaW5nLFxyXG4gIGF0dGVtcHQ6IG51bWJlcixcclxuKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgY29uc3QgY29uZmlndXJlZCA9IG9wdGlvbnMucmV0cnlEZWxheU1zO1xyXG4gIGNvbnN0IHN0YWJsZUppdHRlciA9XHJcbiAgICBBcnJheS5mcm9tKHNlbnRlbmNlSWQpLnJlZHVjZSgoc3VtLCBjaGFyKSA9PiBzdW0gKyBjaGFyLmNoYXJDb2RlQXQoMCksIDApICUgMjAwO1xyXG4gIGNvbnN0IGRlbGF5TXMgPSBjb25maWd1cmVkID8/IDMwMCAqIDIgKiogYXR0ZW1wdCArIHN0YWJsZUppdHRlcjtcclxuICBpZiAoZGVsYXlNcyA8PSAwKSByZXR1cm47XHJcbiAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXlNcykpO1xyXG59XHJcbiIsIi8qKiBDYWNoZS1hd2FyZSBvcmNoZXN0cmF0aW9uIGZvciBsZXZlbC1tYXRjaGVkIEFJIGxlYXJuaW5nIGl0ZW1zLiAqL1xyXG5cclxuaW1wb3J0IHsgc3VjY2VzcywgdHlwZSBSZXN1bHQgfSBmcm9tICcuLi9kb21haW4vZXJyb3JzJztcclxuaW1wb3J0IHR5cGUgeyBHZW5lcmF0ZWRUcmFwQ2FuZGlkYXRlIH0gZnJvbSAnLi4vZG9tYWluL3RyYXAnO1xyXG5pbXBvcnQgdHlwZSB7IFN0b3JhZ2VBcmVhIH0gZnJvbSAnLi4vc3RvcmFnZS9hcmVhJztcclxuaW1wb3J0IHtcclxuICBnZXRDYWNoZWRUcmFwc0JhdGNoLFxyXG4gIFBST1ZJREVSX0NBQ0hFX1NDT1BFLFxyXG4gIHNldENhY2hlZFRyYXBzQmF0Y2gsXHJcbn0gZnJvbSAnLi4vc3RvcmFnZS9wcm92aWRlci1jYWNoZSc7XHJcbmltcG9ydCB7IGZldGNoR2VuZXJhdGVkVHJhcHMsIHR5cGUgUHJvdmlkZXJTZW50ZW5jZSB9IGZyb20gJy4vY2xpZW50JztcclxuaW1wb3J0IHR5cGUgeyBEZWxmTGV2ZWwgfSBmcm9tICcuLi9kb21haW4vZGVsZic7XHJcblxyXG5leHBvcnQgdHlwZSBHZW5lcmF0ZWRUcmFwRmV0Y2hlciA9IChcclxuICBzZW50ZW5jZXM6IHJlYWRvbmx5IFByb3ZpZGVyU2VudGVuY2VbXSxcclxuICBkZWxmTGV2ZWw6IERlbGZMZXZlbCxcclxuKSA9PiBQcm9taXNlPFJlc3VsdDxHZW5lcmF0ZWRUcmFwQ2FuZGlkYXRlW10+PjtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVdpdGhDYWNoZShcclxuICBzZW50ZW5jZXM6IHJlYWRvbmx5IFByb3ZpZGVyU2VudGVuY2VbXSxcclxuICBkZWxmTGV2ZWw6IERlbGZMZXZlbCxcclxuICBhcmVhOiBTdG9yYWdlQXJlYSxcclxuICBmZXRjaGVyOiBHZW5lcmF0ZWRUcmFwRmV0Y2hlciA9IGZldGNoR2VuZXJhdGVkVHJhcHMsXHJcbiAgbm93OiAoKSA9PiBEYXRlID0gKCkgPT4gbmV3IERhdGUoKSxcclxuKTogUHJvbWlzZTxSZXN1bHQ8R2VuZXJhdGVkVHJhcENhbmRpZGF0ZVtdPj4ge1xyXG4gIGNvbnN0IGNhY2hlU2NvcGUgPSBgJHtQUk9WSURFUl9DQUNIRV9TQ09QRX18ZGVsZj0ke2RlbGZMZXZlbH1gO1xyXG4gIGNvbnN0IGJ5U2VudGVuY2VJZCA9IG5ldyBNYXA8c3RyaW5nLCBHZW5lcmF0ZWRUcmFwQ2FuZGlkYXRlW10+KCk7XHJcbiAgY29uc3QgbWlzc2VzOiBQcm92aWRlclNlbnRlbmNlW10gPSBbXTtcclxuXHJcbiAgLy8gT25lIGxvb2t1cCBmb3IgdGhlIGJhdGNoLiBMb29raW5nIGVhY2ggc2VudGVuY2UgdXAgc2VwYXJhdGVseSB0b29rIHRoZVxyXG4gIC8vIHNoYXJlZCBjYWNoZSBsb2NrIG9uY2UgcGVyIHNlbnRlbmNlLCB3aGljaCBzZXJpYWxpemVkIGJhdGNoZXMgdGhhdCB3ZXJlXHJcbiAgLy8gc3VwcG9zZWQgdG8gYmUgcnVubmluZyBjb25jdXJyZW50bHkuXHJcbiAgY29uc3QgaGl0cyA9IGF3YWl0IGdldENhY2hlZFRyYXBzQmF0Y2goXHJcbiAgICBhcmVhLFxyXG4gICAgc2VudGVuY2VzLm1hcCgoc2VudGVuY2UpID0+IHNlbnRlbmNlLnRleHQpLFxyXG4gICAgbm93KCksXHJcbiAgICBjYWNoZVNjb3BlLFxyXG4gICk7XHJcblxyXG4gIGZvciAoY29uc3Qgc2VudGVuY2Ugb2Ygc2VudGVuY2VzKSB7XHJcbiAgICBjb25zdCBjYWNoZWQgPSBoaXRzLmdldChzZW50ZW5jZS50ZXh0KTtcclxuICAgIGlmICghY2FjaGVkKSB7XHJcbiAgICAgIG1pc3Nlcy5wdXNoKHNlbnRlbmNlKTtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICBieVNlbnRlbmNlSWQuc2V0KFxyXG4gICAgICBzZW50ZW5jZS5pZCxcclxuICAgICAgY2FjaGVkLm1hcCgodHJhcCkgPT4gKHsgc2VudGVuY2VJZDogc2VudGVuY2UuaWQsIHRyYXAgfSkpLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGlmIChtaXNzZXMubGVuZ3RoID09PSAwKSByZXR1cm4gc3VjY2VzcyhpbkNhbGxlck9yZGVyKHNlbnRlbmNlcywgYnlTZW50ZW5jZUlkKSk7XHJcblxyXG4gIGNvbnN0IGZldGNoZWQgPSBhd2FpdCBmZXRjaGVyKG1pc3NlcywgZGVsZkxldmVsKTtcclxuICBpZiAoIWZldGNoZWQub2spIHtcclxuICAgIGNvbnN0IGhpdHMgPSBpbkNhbGxlck9yZGVyKHNlbnRlbmNlcywgYnlTZW50ZW5jZUlkKTtcclxuICAgIHJldHVybiBoaXRzLmxlbmd0aCA+IDAgPyBzdWNjZXNzKGhpdHMpIDogZmV0Y2hlZDtcclxuICB9XHJcblxyXG4gIGNvbnN0IG1pc3NlZElkcyA9IG5ldyBTZXQobWlzc2VzLm1hcCgoc2VudGVuY2UpID0+IHNlbnRlbmNlLmlkKSk7XHJcbiAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgZmV0Y2hlZC5kYXRhKSB7XHJcbiAgICBpZiAoIW1pc3NlZElkcy5oYXMoY2FuZGlkYXRlLnNlbnRlbmNlSWQpKSBjb250aW51ZTtcclxuICAgIGNvbnN0IGN1cnJlbnQgPSBieVNlbnRlbmNlSWQuZ2V0KGNhbmRpZGF0ZS5zZW50ZW5jZUlkKSA/PyBbXTtcclxuICAgIGN1cnJlbnQucHVzaChjYW5kaWRhdGUpO1xyXG4gICAgYnlTZW50ZW5jZUlkLnNldChjYW5kaWRhdGUuc2VudGVuY2VJZCwgY3VycmVudCk7XHJcbiAgfVxyXG5cclxuICBjb25zdCB0b1N0b3JlOiB7IHNlbnRlbmNlOiBzdHJpbmc7IHRyYXBzOiBHZW5lcmF0ZWRUcmFwQ2FuZGlkYXRlWyd0cmFwJ11bXSB9W10gPSBbXTtcclxuICBmb3IgKGNvbnN0IHNlbnRlbmNlIG9mIG1pc3Nlcykge1xyXG4gICAgY29uc3QgZ2VuZXJhdGVkID0gYnlTZW50ZW5jZUlkLmdldChzZW50ZW5jZS5pZCkgPz8gW107XHJcbiAgICBpZiAoZ2VuZXJhdGVkLmxlbmd0aCA9PT0gMCkgY29udGludWU7XHJcbiAgICB0b1N0b3JlLnB1c2goe1xyXG4gICAgICBzZW50ZW5jZTogc2VudGVuY2UudGV4dCxcclxuICAgICAgdHJhcHM6IGdlbmVyYXRlZC5tYXAoKGNhbmRpZGF0ZSkgPT4gY2FuZGlkYXRlLnRyYXApLFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGF3YWl0IHNldENhY2hlZFRyYXBzQmF0Y2goYXJlYSwgdG9TdG9yZSwgbm93KCksIGNhY2hlU2NvcGUpO1xyXG5cclxuICByZXR1cm4gc3VjY2VzcyhpbkNhbGxlck9yZGVyKHNlbnRlbmNlcywgYnlTZW50ZW5jZUlkKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluQ2FsbGVyT3JkZXIoXHJcbiAgc2VudGVuY2VzOiByZWFkb25seSBQcm92aWRlclNlbnRlbmNlW10sXHJcbiAgYnlTZW50ZW5jZUlkOiBSZWFkb25seU1hcDxzdHJpbmcsIHJlYWRvbmx5IEdlbmVyYXRlZFRyYXBDYW5kaWRhdGVbXT4sXHJcbik6IEdlbmVyYXRlZFRyYXBDYW5kaWRhdGVbXSB7XHJcbiAgcmV0dXJuIHNlbnRlbmNlcy5mbGF0TWFwKChzZW50ZW5jZSkgPT4gWy4uLihieVNlbnRlbmNlSWQuZ2V0KHNlbnRlbmNlLmlkKSA/PyBbXSldKTtcclxufVxyXG4iLCIvKipcclxuICogQmFja2dyb3VuZCBzZXJ2aWNlIHdvcmtlci5cclxuICpcclxuICogT3duczogcG9wdXAgcmVxdWVzdHMsIHRhYiB2YWxpZGF0aW9uLCB0aGUgc2luZ2xlIGFjdGl2ZSBzZXNzaW9uLCBydW50aW1lXHJcbiAqIGluamVjdGlvbiBvZiB0aGUgRWNsaXBzZSBjb250ZW50IHNjcmlwdCwgdGhlIGxldmVsLW1hdGNoZWQgZ2VuZXJhdGlvbiBjYWxsLFxyXG4gKiBhbmQgc2Vzc2lvbiByZXBsYWNlbWVudCBhY3Jvc3MgdGFicy5cclxuICpcclxuICogRG9lcyBOT1Qgb3duOiBhbnN3ZXIgb3V0Y29tZXMuIFRob3NlIGhhdmUgZXhhY3RseSBvbmUgd3JpdGVyLCB0aGUgY29udGVudFxyXG4gKiBzY3JpcHQsIHdoaWNoIGlzIHdoYXQgcmVtb3ZlcyB0aGUgcG9wdXAvYmFja2dyb3VuZC9jb250ZW50IHJhY2UgZW50aXJlbHkuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgYnJvd3NlciwgdHlwZSBCcm93c2VyIH0gZnJvbSAnd3h0L2Jyb3dzZXInO1xyXG5pbXBvcnQgeyBjcmVhdGVTZXNzaW9uSWQgfSBmcm9tICcuLi9kb21haW4vaWRzJztcclxuaW1wb3J0IHsgZmFpbHVyZSwgc3VjY2VzcywgdHlwZSBSZXN1bHQgfSBmcm9tICcuLi9kb21haW4vZXJyb3JzJztcclxuaW1wb3J0IHtcclxuICBNRVNTQUdFX0NPTlRSQUNUX1ZFUlNJT04sXHJcbiAgZGVzY3JpYmVSZWplY3RlZE1lc3NhZ2UsXHJcbiAgcGFyc2VNZXNzYWdlLFxyXG4gIHR5cGUgQWN0aXZhdGVkRGF0YSxcclxuICB0eXBlIERlYWN0aXZhdGVkRGF0YSxcclxuICB0eXBlIEVjbGlwc2VNZXNzYWdlLFxyXG4gIHR5cGUgR2VuZXJhdGVUcmFwc0RhdGEsXHJcbiAgdHlwZSBQb25nRGF0YSxcclxuICB0eXBlIFJlc2V0UHJvZmlsZURhdGEsXHJcbiAgdHlwZSBTYXZlQ2FsaWJyYXRpb25EYXRhLFxyXG4gIHR5cGUgU2V0UHJvdmlkZXJEYXRhLFxyXG4gIHR5cGUgU2Vzc2lvblN0YXJ0ZWREYXRhLFxyXG4gIHR5cGUgU2Vzc2lvblN0b3BwZWREYXRhLFxyXG4gIHR5cGUgU3RhdHVzRGF0YSxcclxufSBmcm9tICcuLi9kb21haW4vbWVzc2FnZXMnO1xyXG5pbXBvcnQgeyBjbGFzc2lmeVVybCB9IGZyb20gJy4uL2RvbWFpbi91cmwtc3VwcG9ydCc7XHJcbmltcG9ydCB7IHN1bW1hcml6ZU1hc3RlcnkgfSBmcm9tICcuLi9kb21haW4vcHJvZmlsZSc7XHJcbmltcG9ydCB7IGFiaWxpdHlGb3JEZWxmTGV2ZWwsIHR5cGUgRGVsZkxldmVsIH0gZnJvbSAnLi4vZG9tYWluL2RlbGYnO1xyXG5pbXBvcnQgeyBjaHJvbWVBcmVhIH0gZnJvbSAnLi4vc3RvcmFnZS9hcmVhJztcclxuaW1wb3J0IHsgbG9hZFByb2ZpbGUsIHJlc2V0UHJvZmlsZSwgc2F2ZVByb2ZpbGUgfSBmcm9tICcuLi9zdG9yYWdlL3Byb2ZpbGUtc3RvcmUnO1xyXG5pbXBvcnQge1xyXG4gIGNsZWFyQWN0aXZlU2Vzc2lvbixcclxuICBpc0dlbmVyYXRpb25BdXRob3JpemVkLFxyXG4gIHJlYWRBY3RpdmVTZXNzaW9uLFxyXG4gIHdyaXRlQWN0aXZlU2Vzc2lvbixcclxufSBmcm9tICcuLi9zdG9yYWdlL3Nlc3Npb24tc3RvcmUnO1xyXG5pbXBvcnQge1xyXG4gIFBST1ZJREVSX09SSUdJTixcclxuICBQUk9WSURFUl9QRVJNSVNTSU9OX1BBVFRFUk4sXHJcbiAgY2xlYXJQcm92aWRlclNldHRpbmdzLFxyXG4gIHJlYWRQcm92aWRlclNldHRpbmdzLFxyXG4gIHdyaXRlUHJvdmlkZXJTZXR0aW5ncyxcclxufSBmcm9tICcuLi9zdG9yYWdlL3Byb3ZpZGVyLXNldHRpbmdzJztcclxuaW1wb3J0IHsgZ2VuZXJhdGVXaXRoQ2FjaGUgfSBmcm9tICcuLi9wcm92aWRlci9nZW5lcmF0ZS13aXRoLWNhY2hlJztcclxuaW1wb3J0IHsgY2xlYXJQcm92aWRlckNhY2hlIH0gZnJvbSAnLi4vc3RvcmFnZS9wcm92aWRlci1jYWNoZSc7XHJcblxyXG4vKiogQnVpbHQgYnVuZGxlIHBhdGggb2YgdGhlIHJ1bnRpbWUtaW5qZWN0ZWQgY29udGVudCBzY3JpcHQuICovXHJcbmNvbnN0IENPTlRFTlRfU0NSSVBUX0ZJTEUgPSAnL2NvbnRlbnQtc2NyaXB0cy9lY2xpcHNlLmpzJyBhcyBjb25zdDtcclxuXHJcbi8qKlxyXG4gKiBUaGUgcHJvdmlkZXIgb3JpZ2luIGlzIGNvbXBpbGVkIGluLiBUaGVyZSBpcyBubyBmaWVsZCBhbnl3aGVyZSBpbiB0aGUgVUlcclxuICogdGhhdCBsZXRzIGEgcGFnZSBvciBhIHVzZXIgcG9pbnQgRWNsaXBzZSBhdCBhbiBhcmJpdHJhcnkgaG9zdC5cclxuICovXHJcbmNvbnN0IFBST1ZJREVSX0NPTkZJR1VSRUQgPSBQUk9WSURFUl9PUklHSU4ubGVuZ3RoID4gMDtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUJhY2tncm91bmQoKCkgPT4ge1xyXG4gIGNvbnN0IGxvY2FsID0gY2hyb21lQXJlYShicm93c2VyLnN0b3JhZ2UubG9jYWwpO1xyXG4gIGNvbnN0IHNlc3Npb24gPSBjaHJvbWVBcmVhKGJyb3dzZXIuc3RvcmFnZS5zZXNzaW9uKTtcclxuXHJcbiAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmF3LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gICAgY29uc3QgbWVzc2FnZSA9IHBhcnNlTWVzc2FnZShyYXcpO1xyXG5cclxuICAgIC8vIE5ldmVyIGxlYXZlIHRoZSBjaGFubmVsIGRhbmdsaW5nLiBBIGRyb3BwZWQgbWVzc2FnZSByZXNvbHZlcyB0aGUgc2VuZGVyJ3NcclxuICAgIC8vIHByb21pc2Ugd2l0aCBgdW5kZWZpbmVkYCwgd2hpY2ggcmVhY2hlcyB0aGUgbGVhcm5lciBhcyBhbiBlcnJvciB0aGV5IGNhblxyXG4gICAgLy8gbmVpdGhlciB1bmRlcnN0YW5kIG5vciBhY3Qgb24g4oCUIHRoZSBleGFjdCBmYWlsdXJlIG1vZGUgYSBzdGFsZSB3b3JrZXJcclxuICAgIC8vIHByb2R1Y2VzIGFmdGVyIGEgcmVidWlsZC4gQW5zd2VyIHdpdGggYSB0eXBlZCwgYWN0aW9uYWJsZSBmYWlsdXJlIGluc3RlYWQuXHJcbiAgICBpZiAoIW1lc3NhZ2UpIHtcclxuICAgICAgc2VuZFJlc3BvbnNlKGZhaWx1cmUoJ01FU1NBR0VfVU5TVVBQT1JURUQnLCBkZXNjcmliZVJlamVjdGVkTWVzc2FnZShyYXcpKSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVNZXNzYWdlKG1lc3NhZ2UsIHNlbmRlcilcclxuICAgICAgLnRoZW4oc2VuZFJlc3BvbnNlKVxyXG4gICAgICAuY2F0Y2goKGNhdXNlOiB1bmtub3duKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZGV0YWlsID0gY2F1c2UgaW5zdGFuY2VvZiBFcnJvciA/IGNhdXNlLm1lc3NhZ2UgOiAnQmFja2dyb3VuZCBoYW5kbGVyIGZhaWxlZC4nO1xyXG4gICAgICAgIHNlbmRSZXNwb25zZShmYWlsdXJlKCdVTktOT1dOX0VSUk9SJywgZGV0YWlsKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIC8vIEtlZXAgdGhlIG1lc3NhZ2UgY2hhbm5lbCBvcGVuIGZvciB0aGUgYXN5bmMgcmVwbHkuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9KTtcclxuXHJcbiAgLy8gQSBjbG9zZWQgdGFiIG11c3Qgbm90IGxlYXZlIGEgc2Vzc2lvbiBwaW5uZWQuXHJcbiAgYnJvd3Nlci50YWJzLm9uUmVtb3ZlZC5hZGRMaXN0ZW5lcigodGFiSWQpID0+IHtcclxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgYWN0aXZlID0gYXdhaXQgcmVhZEFjdGl2ZVNlc3Npb24oc2Vzc2lvbik7XHJcbiAgICAgIGlmIChhY3RpdmU/LnRhYklkID09PSB0YWJJZCkgYXdhaXQgY2xlYXJBY3RpdmVTZXNzaW9uKHNlc3Npb24pO1xyXG4gICAgfSkoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gTmF2aWdhdGluZyBhd2F5IHRlYXJzIHRoZSBydW50aW1lIGRvd24gd2l0aCB0aGUgZG9jdW1lbnQ7IGRyb3AgdGhlIHJlY29yZC5cclxuICBicm93c2VyLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKCh0YWJJZCwgY2hhbmdlSW5mbykgPT4ge1xyXG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzICE9PSAnbG9hZGluZycpIHJldHVybjtcclxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgYWN0aXZlID0gYXdhaXQgcmVhZEFjdGl2ZVNlc3Npb24oc2Vzc2lvbik7XHJcbiAgICAgIGlmIChhY3RpdmU/LnRhYklkID09PSB0YWJJZCkgYXdhaXQgY2xlYXJBY3RpdmVTZXNzaW9uKHNlc3Npb24pO1xyXG4gICAgfSkoKTtcclxuICB9KTtcclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShcclxuICAgIG1lc3NhZ2U6IEVjbGlwc2VNZXNzYWdlLFxyXG4gICAgc2VuZGVyOiBCcm93c2VyLnJ1bnRpbWUuTWVzc2FnZVNlbmRlcixcclxuICApOiBQcm9taXNlPHVua25vd24+IHtcclxuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XHJcbiAgICAgIGNhc2UgJ1NUQVJUX1NFU1NJT04nOlxyXG4gICAgICAgIHJldHVybiBzdGFydFNlc3Npb24oKTtcclxuICAgICAgY2FzZSAnU1RPUF9TRVNTSU9OJzpcclxuICAgICAgICByZXR1cm4gc3RvcFNlc3Npb24oKTtcclxuICAgICAgY2FzZSAnR0VUX1NUQVRVUyc6XHJcbiAgICAgICAgcmV0dXJuIGdldFN0YXR1cygpO1xyXG4gICAgICBjYXNlICdSRVNFVF9QUk9GSUxFJzpcclxuICAgICAgICByZXR1cm4gZG9SZXNldFByb2ZpbGUobWVzc2FnZS5jb25maXJtZWQpO1xyXG4gICAgICBjYXNlICdTQVZFX0NBTElCUkFUSU9OJzpcclxuICAgICAgICByZXR1cm4gZG9TYXZlQ2FsaWJyYXRpb24obWVzc2FnZS5kZWxmTGV2ZWwpO1xyXG4gICAgICBjYXNlICdTRVRfUFJPVklERVInOlxyXG4gICAgICAgIHJldHVybiBkb1NldFByb3ZpZGVyKG1lc3NhZ2UuZW5hYmxlZCk7XHJcbiAgICAgIGNhc2UgJ0dFTkVSQVRFX1RSQVBTJzpcclxuICAgICAgICByZXR1cm4gZG9HZW5lcmF0ZVRyYXBzKG1lc3NhZ2Uuc2Vzc2lvbklkLCBtZXNzYWdlLmRlbGZMZXZlbCwgbWVzc2FnZS5zZW50ZW5jZXMsIHNlbmRlcik7XHJcbiAgICAgIC8vIFBJTkcgLyBBQ1RJVkFURSAvIERFQUNUSVZBVEUgYXJlIGFkZHJlc3NlZCB0byB0aGUgY29udGVudCBzY3JpcHQgYW5kXHJcbiAgICAgIC8vIGFycml2ZSB0aGVyZSBieSBgdGFicy5zZW5kTWVzc2FnZWAsIHNvIHRoZSB3b3JrZXIgb25seSBldmVyIHNlZXMgb25lIGlmXHJcbiAgICAgIC8vIGEgcGVlciBpcyBvdXQgb2Ygc3RlcC4gU2F5IHNvIHJhdGhlciB0aGFuIGdvaW5nIHF1aWV0LlxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiBmYWlsdXJlKFxyXG4gICAgICAgICAgJ01FU1NBR0VfVU5TVVBQT1JURUQnLFxyXG4gICAgICAgICAgYFRoZSBiYWNrZ3JvdW5kIHdvcmtlciBkb2VzIG5vdCBoYW5kbGUgJHttZXNzYWdlLnR5cGV9LmAsXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBTZXNzaW9uc1xyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gc3RhcnRTZXNzaW9uKCk6IFByb21pc2U8UmVzdWx0PFNlc3Npb25TdGFydGVkRGF0YT4+IHtcclxuICAgIGNvbnN0IHRhYiA9IGF3YWl0IGFjdGl2ZVRhYigpO1xyXG4gICAgaWYgKCF0YWIgfHwgdHlwZW9mIHRhYi5pZCAhPT0gJ251bWJlcicpIHtcclxuICAgICAgcmV0dXJuIGZhaWx1cmUoJ1VOU1VQUE9SVEVEX1VSTCcsICdObyBhY3RpdmUgdGFiIHRvIHJ1biBFY2xpcHNlIGluLicpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1cHBvcnQgPSBjbGFzc2lmeVVybCh0YWIudXJsKTtcclxuICAgIGlmICghc3VwcG9ydC5zdXBwb3J0ZWQpIHtcclxuICAgICAgcmV0dXJuIGZhaWx1cmUoJ1VOU1VQUE9SVEVEX1VSTCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRhYklkID0gdGFiLmlkO1xyXG5cclxuICAgIC8vIE9uZSBzZXNzaW9uIGF0IGEgdGltZS4gUmVwbGFjaW5nIG1lYW5zIHRlYXJpbmcgdGhlIG9sZCBvbmUgZG93biBmaXJzdDtcclxuICAgIC8vIGlmIHRoYXQgdGFiIGhhcyBnb25lIGF3YXksIHRoZSBzdGFsZSByZWNvcmQgaXMgc2ltcGx5IGNsZWFyZWQuXHJcbiAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IHJlYWRBY3RpdmVTZXNzaW9uKHNlc3Npb24pO1xyXG4gICAgaWYgKGV4aXN0aW5nICYmIGV4aXN0aW5nLnRhYklkICE9PSB0YWJJZCkge1xyXG4gICAgICBhd2FpdCBzZW5kVG9UYWIoZXhpc3RpbmcudGFiSWQsIHsgdHlwZTogJ0RFQUNUSVZBVEUnLCByZWFzb246ICdyZXBsYWNlZCcgfSk7XHJcbiAgICAgIGF3YWl0IGNsZWFyQWN0aXZlU2Vzc2lvbihzZXNzaW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZWFkeSA9IGF3YWl0IGVuc3VyZVJ1bnRpbWUodGFiSWQpO1xyXG4gICAgaWYgKCFyZWFkeS5vaykgcmV0dXJuIHJlYWR5O1xyXG5cclxuICAgIGNvbnN0IHByb3ZpZGVyRW5hYmxlZCA9IFBST1ZJREVSX0NPTkZJR1VSRUQgJiYgKGF3YWl0IGhhc1Byb3ZpZGVyUGVybWlzc2lvbigpKTtcclxuICAgIGNvbnN0IHNlc3Npb25JZCA9IGNyZWF0ZVNlc3Npb25JZCgpO1xyXG5cclxuICAgIC8vIFRoZSBjb250ZW50IHJ1bnRpbWUgbWF5IG5lZWQgZ2VuZXJhdGlvbiB0byBmaW5pc2ggQUNUSVZBVEUuIFBlcnNpc3QgdGhlXHJcbiAgICAvLyBleGFjdCBwZW5kaW5nIG93bmVyIGZpcnN0IHNvIHRoYXQgcmVxdWVzdCBpcyBhdXRob3JpemVkLCB0aGVuIHByb21vdGUgaXRcclxuICAgIC8vIG9ubHkgYWZ0ZXIgYWN0aXZhdGlvbiBzdWNjZWVkcy5cclxuICAgIGNvbnN0IHBlbmRpbmcgPSBhd2FpdCB3cml0ZUFjdGl2ZVNlc3Npb24oc2Vzc2lvbiwge1xyXG4gICAgICBzZXNzaW9uSWQsXHJcbiAgICAgIHRhYklkLFxyXG4gICAgICBzdGFydGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgcGhhc2U6ICdwZW5kaW5nJyxcclxuICAgIH0pO1xyXG4gICAgaWYgKCFwZW5kaW5nLm9rKSByZXR1cm4gcGVuZGluZztcclxuXHJcbiAgICBjb25zdCBhY3RpdmF0ZWQgPSBhd2FpdCBzZW5kVG9UYWI8QWN0aXZhdGVkRGF0YT4odGFiSWQsIHtcclxuICAgICAgdHlwZTogJ0FDVElWQVRFJyxcclxuICAgICAgc2Vzc2lvbklkLFxyXG4gICAgICBwcm92aWRlckVuYWJsZWQsXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIWFjdGl2YXRlZC5vaykge1xyXG4gICAgICBhd2FpdCBjbGVhclNlc3Npb25JZk1hdGNoZXMoc2Vzc2lvbklkKTtcclxuICAgICAgcmV0dXJuIGFjdGl2YXRlZDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwcm9tb3RlZCA9IGF3YWl0IHdyaXRlQWN0aXZlU2Vzc2lvbihzZXNzaW9uLCB7XHJcbiAgICAgIHNlc3Npb25JZCxcclxuICAgICAgdGFiSWQsXHJcbiAgICAgIHN0YXJ0ZWRBdDogcGVuZGluZy5kYXRhLnN0YXJ0ZWRBdCxcclxuICAgICAgcGhhc2U6ICdhY3RpdmUnLFxyXG4gICAgfSk7XHJcbiAgICBpZiAoIXByb21vdGVkLm9rKSB7XHJcbiAgICAgIGF3YWl0IHNlbmRUb1RhYih0YWJJZCwgeyB0eXBlOiAnREVBQ1RJVkFURScsIHNlc3Npb25JZCwgcmVhc29uOiAncmVzZXQnIH0pO1xyXG4gICAgICBhd2FpdCBjbGVhclNlc3Npb25JZk1hdGNoZXMoc2Vzc2lvbklkKTtcclxuICAgICAgcmV0dXJuIHByb21vdGVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFsbCBnZW5lcmF0aW9uIGJhdGNoZXMgaGF2ZSBzZXR0bGVkIGJlZm9yZSBBQ1RJVkFURSBzdWNjZWVkcy4gQ2xlYXIgYVxyXG4gICAgLy8gc3RhbGUgcGVyLWJhdGNoIGVycm9yIHNvIGEgc3VjY2Vzc2Z1bCBmaXJzdCBjbGljayBuZXZlciBsZWF2ZXMgdGhlIHBvcHVwXHJcbiAgICAvLyBjbGFpbWluZyB0aGF0IHRoZSBwcm92aWRlciBmYWlsZWQuXHJcbiAgICBpZiAocHJvdmlkZXJFbmFibGVkKSB7XHJcbiAgICAgIGF3YWl0IHdyaXRlUHJvdmlkZXJTZXR0aW5ncyhsb2NhbCwgeyBlbmFibGVkOiB0cnVlLCBsYXN0RXJyb3I6IG51bGwgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHN1Y2Nlc3MoeyBzZXNzaW9uSWQsIHRhYklkLCB0cmFwQ291bnQ6IGFjdGl2YXRlZC5kYXRhLnRyYXBDb3VudCB9KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIHN0b3BTZXNzaW9uKCk6IFByb21pc2U8UmVzdWx0PFNlc3Npb25TdG9wcGVkRGF0YT4+IHtcclxuICAgIGNvbnN0IGFjdGl2ZSA9IGF3YWl0IHJlYWRBY3RpdmVTZXNzaW9uKHNlc3Npb24pO1xyXG4gICAgaWYgKCFhY3RpdmUpIHJldHVybiBzdWNjZXNzKHsgcmVzdG9yZWQ6IGZhbHNlIH0pO1xyXG5cclxuICAgIGNvbnN0IHN0b3BwZWQgPSBhd2FpdCBzZW5kVG9UYWI8RGVhY3RpdmF0ZWREYXRhPihhY3RpdmUudGFiSWQsIHtcclxuICAgICAgdHlwZTogJ0RFQUNUSVZBVEUnLFxyXG4gICAgICBzZXNzaW9uSWQ6IGFjdGl2ZS5zZXNzaW9uSWQsXHJcbiAgICAgIHJlYXNvbjogJ3VzZXInLFxyXG4gICAgfSk7XHJcblxyXG4gICAgYXdhaXQgY2xlYXJBY3RpdmVTZXNzaW9uKHNlc3Npb24pO1xyXG5cclxuICAgIGlmICghc3RvcHBlZC5vaykge1xyXG4gICAgICAvLyBUaGUgdGFiIGlzIGdvbmUgb3IgdGhlIHJ1bnRpbWUgbmV2ZXIgYXR0YWNoZWQuIFRoZSBzZXNzaW9uIHJlY29yZCBpc1xyXG4gICAgICAvLyBjbGVhcmVkIGVpdGhlciB3YXksIHNvIHRoZSBwb3B1cCByZXR1cm5zIHRvIFJlYWR5IHJhdGhlciB0aGFuIHN0aWNraW5nLlxyXG4gICAgICByZXR1cm4gc3VjY2Vzcyh7IHJlc3RvcmVkOiBmYWxzZSB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBzdWNjZXNzKHsgcmVzdG9yZWQ6IHN0b3BwZWQuZGF0YS5yZXN0b3JlZCB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBJTkcgZmlyc3QsIGluamVjdCBvbmx5IGlmIG5vYm9keSBhbnN3ZXJzLiBUaGlzIGlzIHdoYXQga2VlcHMgcmVwZWF0ZWRcclxuICAgKiBhY3RpdmF0aW9uIGZyb20gc3RhY2tpbmcgcnVudGltZXMgaW4gb25lIHRhYi5cclxuICAgKi9cclxuICBhc3luYyBmdW5jdGlvbiBlbnN1cmVSdW50aW1lKHRhYklkOiBudW1iZXIpOiBQcm9taXNlPFJlc3VsdDxQb25nRGF0YT4+IHtcclxuICAgIGNvbnN0IHBvbmcgPSBhd2FpdCBzZW5kVG9UYWI8UG9uZ0RhdGE+KHRhYklkLCB7IHR5cGU6ICdQSU5HJyB9KTtcclxuICAgIGlmIChwb25nLm9rKSByZXR1cm4gcG9uZztcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBicm93c2VyLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuICAgICAgICB0YXJnZXQ6IHsgdGFiSWQgfSxcclxuICAgICAgICBmaWxlczogW0NPTlRFTlRfU0NSSVBUX0ZJTEVdLFxyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGNhdXNlKSB7XHJcbiAgICAgIGNvbnN0IGRldGFpbCA9IGNhdXNlIGluc3RhbmNlb2YgRXJyb3IgPyBjYXVzZS5tZXNzYWdlIDogJ2luamVjdGlvbiBmYWlsZWQnO1xyXG4gICAgICByZXR1cm4gZmFpbHVyZSgnQ09OVEVOVF9TQ1JJUFRfVU5BVkFJTEFCTEUnLCBkZXRhaWwpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJldHJ5ID0gYXdhaXQgc2VuZFRvVGFiPFBvbmdEYXRhPih0YWJJZCwgeyB0eXBlOiAnUElORycgfSk7XHJcbiAgICBpZiAoIXJldHJ5Lm9rKSByZXR1cm4gZmFpbHVyZSgnQ09OVEVOVF9TQ1JJUFRfVU5BVkFJTEFCTEUnKTtcclxuICAgIHJldHVybiByZXRyeTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBTdGF0dXNcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGdldFN0YXR1cygpOiBQcm9taXNlPFJlc3VsdDxTdGF0dXNEYXRhPj4ge1xyXG4gICAgY29uc3QgdGFiID0gYXdhaXQgYWN0aXZlVGFiKCk7XHJcbiAgICBjb25zdCBwYWdlID0gY2xhc3NpZnlVcmwodGFiPy51cmwpO1xyXG4gICAgY29uc3QgYWN0aXZlID0gYXdhaXQgcmVhZEFjdGl2ZVNlc3Npb24oc2Vzc2lvbik7XHJcbiAgICBjb25zdCBwcm92aWRlclNldHRpbmdzID0gYXdhaXQgcmVhZFByb3ZpZGVyU2V0dGluZ3MobG9jYWwpO1xyXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuXHJcbiAgICBjb25zdCBsb2FkZWQgPSBhd2FpdCBsb2FkUHJvZmlsZShsb2NhbCk7XHJcbiAgICBpZiAoIWxvYWRlZC5vaykge1xyXG4gICAgICByZXR1cm4gc3VjY2Vzcyh7XHJcbiAgICAgICAgY29udHJhY3RWZXJzaW9uOiBNRVNTQUdFX0NPTlRSQUNUX1ZFUlNJT04sXHJcbiAgICAgICAgYWN0aXZlVGFiSWQ6IGFjdGl2ZT8udGFiSWQgPz8gbnVsbCxcclxuICAgICAgICBhY3RpdmVTZXNzaW9uSWQ6IGFjdGl2ZT8uc2Vzc2lvbklkID8/IG51bGwsXHJcbiAgICAgICAgYWN0aXZlSGVyZTogYWN0aXZlPy50YWJJZCA9PT0gdGFiPy5pZCxcclxuICAgICAgICBwYWdlLFxyXG4gICAgICAgIGNhbGlicmF0aW9uQ29tcGxldGVkOiBmYWxzZSxcclxuICAgICAgICBkZWxmTGV2ZWw6ICdCMScsXHJcbiAgICAgICAgZ2xvYmFsQWJpbGl0eTogMCxcclxuICAgICAgICBwaGFzZTogJ25ld19tb29uJyxcclxuICAgICAgICBzdW1tYXJ5OiB7XHJcbiAgICAgICAgICB0cmFja2VkOiAwLFxyXG4gICAgICAgICAgYXR0ZW1wdHM6IDAsXHJcbiAgICAgICAgICBjb3JyZWN0OiAwLFxyXG4gICAgICAgICAgZHVlOiAwLFxyXG4gICAgICAgICAgYnlQaGFzZTogeyBuZXdfbW9vbjogMCwgY3Jlc2NlbnQ6IDAsIGhhbGY6IDAsIGZ1bGw6IDAgfSxcclxuICAgICAgICAgIG92ZXJhbGxQaGFzZTogJ25ld19tb29uJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHByb3ZpZGVyOiB7XHJcbiAgICAgICAgICBjb25maWd1cmVkOiBQUk9WSURFUl9DT05GSUdVUkVELFxyXG4gICAgICAgICAgZW5hYmxlZDogUFJPVklERVJfQ09ORklHVVJFRCxcclxuICAgICAgICAgIHBlcm1pc3Npb25HcmFudGVkOiBhd2FpdCBoYXNQcm92aWRlclBlcm1pc3Npb24oKSxcclxuICAgICAgICAgIGxhc3RFcnJvcjogcHJvdmlkZXJTZXR0aW5ncy5sYXN0RXJyb3IsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcm9maWxlRXJyb3I6IGxvYWRlZC5lcnJvci5tZXNzYWdlLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwcm9maWxlID0gbG9hZGVkLmRhdGEucHJvZmlsZTtcclxuICAgIGNvbnN0IHN1bW1hcnkgPSBzdW1tYXJpemVNYXN0ZXJ5KHByb2ZpbGUsIG5vdyk7XHJcblxyXG4gICAgcmV0dXJuIHN1Y2Nlc3Moe1xyXG4gICAgICBjb250cmFjdFZlcnNpb246IE1FU1NBR0VfQ09OVFJBQ1RfVkVSU0lPTixcclxuICAgICAgYWN0aXZlVGFiSWQ6IGFjdGl2ZT8udGFiSWQgPz8gbnVsbCxcclxuICAgICAgYWN0aXZlU2Vzc2lvbklkOiBhY3RpdmU/LnNlc3Npb25JZCA/PyBudWxsLFxyXG4gICAgICBhY3RpdmVIZXJlOiBhY3RpdmUgIT09IG51bGwgJiYgYWN0aXZlLnRhYklkID09PSB0YWI/LmlkLFxyXG4gICAgICBwYWdlLFxyXG4gICAgICBjYWxpYnJhdGlvbkNvbXBsZXRlZDogcHJvZmlsZS5jYWxpYnJhdGlvbkNvbXBsZXRlZCxcclxuICAgICAgZGVsZkxldmVsOiBwcm9maWxlLmRlbGZMZXZlbCxcclxuICAgICAgZ2xvYmFsQWJpbGl0eTogcHJvZmlsZS5nbG9iYWxBYmlsaXR5LFxyXG4gICAgICBwaGFzZTogc3VtbWFyeS5vdmVyYWxsUGhhc2UsXHJcbiAgICAgIHN1bW1hcnksXHJcbiAgICAgIHByb3ZpZGVyOiB7XHJcbiAgICAgICAgY29uZmlndXJlZDogUFJPVklERVJfQ09ORklHVVJFRCxcclxuICAgICAgICBlbmFibGVkOiBQUk9WSURFUl9DT05GSUdVUkVELFxyXG4gICAgICAgIHBlcm1pc3Npb25HcmFudGVkOiBhd2FpdCBoYXNQcm92aWRlclBlcm1pc3Npb24oKSxcclxuICAgICAgICBsYXN0RXJyb3I6IHByb3ZpZGVyU2V0dGluZ3MubGFzdEVycm9yLFxyXG4gICAgICB9LFxyXG4gICAgICBwcm9maWxlRXJyb3I6IG51bGwsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBQcm9maWxlIGNvbW1hbmRzIGZyb20gdGhlIHBvcHVwXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBkb1Jlc2V0UHJvZmlsZShjb25maXJtZWQ6IGJvb2xlYW4pOiBQcm9taXNlPFJlc3VsdDxSZXNldFByb2ZpbGVEYXRhPj4ge1xyXG4gICAgaWYgKCFjb25maXJtZWQpIHtcclxuICAgICAgcmV0dXJuIGZhaWx1cmUoJ1VOS05PV05fRVJST1InLCAnUmVzZXQgcmVxdWlyZXMgY29uZmlybWF0aW9uLicpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGFjdGl2ZSA9IGF3YWl0IHJlYWRBY3RpdmVTZXNzaW9uKHNlc3Npb24pO1xyXG4gICAgaWYgKGFjdGl2ZSkge1xyXG4gICAgICBhd2FpdCBzZW5kVG9UYWIoYWN0aXZlLnRhYklkLCB7IHR5cGU6ICdERUFDVElWQVRFJywgcmVhc29uOiAncmVzZXQnIH0pO1xyXG4gICAgICBhd2FpdCBjbGVhckFjdGl2ZVNlc3Npb24oc2Vzc2lvbik7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVzZXQgPSBhd2FpdCByZXNldFByb2ZpbGUobG9jYWwpO1xyXG4gICAgaWYgKCFyZXNldC5vaykgcmV0dXJuIHJlc2V0O1xyXG5cclxuICAgIGNvbnN0IGNhY2hlUmVzZXQgPSBhd2FpdCBjbGVhclByb3ZpZGVyQ2FjaGUobG9jYWwpO1xyXG4gICAgaWYgKCFjYWNoZVJlc2V0Lm9rKSByZXR1cm4gY2FjaGVSZXNldDtcclxuXHJcbiAgICBjb25zdCBzZXR0aW5nc1Jlc2V0ID0gYXdhaXQgY2xlYXJQcm92aWRlclNldHRpbmdzKGxvY2FsKTtcclxuICAgIGlmICghc2V0dGluZ3NSZXNldC5vaykgcmV0dXJuIHNldHRpbmdzUmVzZXQ7XHJcbiAgICBpZiAoIShhd2FpdCByZXZva2VQcm92aWRlclBlcm1pc3Npb24oKSkpIHJldHVybiBmYWlsdXJlKCdQUk9WSURFUl9QRVJNSVNTSU9OX0RFTklFRCcpO1xyXG4gICAgcmV0dXJuIHN1Y2Nlc3MoeyByZXNldDogdHJ1ZSB9KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGRvU2F2ZUNhbGlicmF0aW9uKGRlbGZMZXZlbDogRGVsZkxldmVsKTogUHJvbWlzZTxSZXN1bHQ8U2F2ZUNhbGlicmF0aW9uRGF0YT4+IHtcclxuICAgIGNvbnN0IGxvYWRlZCA9IGF3YWl0IGxvYWRQcm9maWxlKGxvY2FsKTtcclxuICAgIGlmICghbG9hZGVkLm9rKSByZXR1cm4gbG9hZGVkO1xyXG5cclxuICAgIGNvbnN0IGdsb2JhbEFiaWxpdHkgPSBhYmlsaXR5Rm9yRGVsZkxldmVsKGRlbGZMZXZlbCk7XHJcblxyXG4gICAgY29uc3Qgc2F2ZWQgPSBhd2FpdCBzYXZlUHJvZmlsZShsb2NhbCwge1xyXG4gICAgICAuLi5sb2FkZWQuZGF0YS5wcm9maWxlLFxyXG4gICAgICBjYWxpYnJhdGlvbkNvbXBsZXRlZDogdHJ1ZSxcclxuICAgICAgZGVsZkxldmVsLFxyXG4gICAgICBnbG9iYWxBYmlsaXR5LFxyXG4gICAgfSk7XHJcbiAgICBpZiAoIXNhdmVkLm9rKSByZXR1cm4gc2F2ZWQ7XHJcbiAgICByZXR1cm4gc3VjY2Vzcyh7IGdsb2JhbEFiaWxpdHksIGRlbGZMZXZlbCB9KTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBBbHdheXMtb24gcHJvdmlkZXJcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8qKlxyXG4gICAqIExlZ2FjeSBtZXNzYWdlIGNvbXBhdGliaWxpdHkuIEFJIGdlbmVyYXRpb24gaXMgYWx3YXlzIGVuYWJsZWQsIHNvIGFuIG9sZFxyXG4gICAqIHBvcHVwIGFza2luZyB0byBkaXNhYmxlIGl0IHJlY2VpdmVzIHRoZSBhY3R1YWwsIHVuY2hhbmdlZCBzdGF0ZS5cclxuICAgKi9cclxuICBhc3luYyBmdW5jdGlvbiBkb1NldFByb3ZpZGVyKF9lbmFibGVkOiBib29sZWFuKTogUHJvbWlzZTxSZXN1bHQ8U2V0UHJvdmlkZXJEYXRhPj4ge1xyXG4gICAgaWYgKCFQUk9WSURFUl9DT05GSUdVUkVEKSByZXR1cm4gZmFpbHVyZSgnUFJPVklERVJfRElTQUJMRUQnKTtcclxuXHJcbiAgICBjb25zdCBncmFudGVkID0gYXdhaXQgaGFzUHJvdmlkZXJQZXJtaXNzaW9uKCk7XHJcbiAgICBpZiAoIWdyYW50ZWQpIHtcclxuICAgICAgYXdhaXQgd3JpdGVQcm92aWRlclNldHRpbmdzKGxvY2FsLCB7XHJcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICBsYXN0RXJyb3I6ICdQZXJtaXNzaW9uIGZvciB0aGUgbG9jYWwgZ2VuZXJhdGlvbiBBUEkgd2FzIG5vdCBncmFudGVkLicsXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZmFpbHVyZSgnUFJPVklERVJfUEVSTUlTU0lPTl9ERU5JRUQnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB3cml0dGVuID0gYXdhaXQgd3JpdGVQcm92aWRlclNldHRpbmdzKGxvY2FsLCB7IGVuYWJsZWQ6IHRydWUsIGxhc3RFcnJvcjogbnVsbCB9KTtcclxuICAgIGlmICghd3JpdHRlbi5vaykgcmV0dXJuIHdyaXR0ZW47XHJcbiAgICByZXR1cm4gc3VjY2Vzcyh7IGVuYWJsZWQ6IHRydWUsIHBlcm1pc3Npb25HcmFudGVkOiBncmFudGVkIH0pO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gaGFzUHJvdmlkZXJQZXJtaXNzaW9uKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgaWYgKCFQUk9WSURFUl9DT05GSUdVUkVEKSByZXR1cm4gZmFsc2U7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gYXdhaXQgYnJvd3Nlci5wZXJtaXNzaW9ucy5jb250YWlucyh7IG9yaWdpbnM6IFtQUk9WSURFUl9QRVJNSVNTSU9OX1BBVFRFUk5dIH0pO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIHJldm9rZVByb3ZpZGVyUGVybWlzc2lvbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIGlmICghUFJPVklERVJfQ09ORklHVVJFRCkgcmV0dXJuIHRydWU7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBUaGUgbG9vcGJhY2sgb3JpZ2luIGlzIGEgcmVxdWlyZWQsIG5vbi1yZW1vdmFibGUgcGVybWlzc2lvbi4gS2VlcCB0aGlzXHJcbiAgICAgIC8vIGJyYW5jaCBmb3Igb2xkZXIgZGV2ZWxvcG1lbnQgYnVpbGRzIHRoYXQgc3RpbGwgc3RvcmVkIGl0IGFzIG9wdGlvbmFsLlxyXG4gICAgICBpZiAoYnJvd3Nlci5ydW50aW1lLmdldE1hbmlmZXN0KCkuaG9zdF9wZXJtaXNzaW9ucz8uaW5jbHVkZXMoUFJPVklERVJfUEVSTUlTU0lPTl9QQVRURVJOKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghKGF3YWl0IGhhc1Byb3ZpZGVyUGVybWlzc2lvbigpKSkgcmV0dXJuIHRydWU7XHJcbiAgICAgIHJldHVybiBhd2FpdCBicm93c2VyLnBlcm1pc3Npb25zLnJlbW92ZSh7IG9yaWdpbnM6IFtQUk9WSURFUl9QRVJNSVNTSU9OX1BBVFRFUk5dIH0pO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGRvR2VuZXJhdGVUcmFwcyhcclxuICAgIHNlc3Npb25JZDogc3RyaW5nLFxyXG4gICAgZGVsZkxldmVsOiBEZWxmTGV2ZWwsXHJcbiAgICBzZW50ZW5jZXM6IHsgaWQ6IHN0cmluZzsgdGV4dDogc3RyaW5nIH1bXSxcclxuICAgIHNlbmRlcjogQnJvd3Nlci5ydW50aW1lLk1lc3NhZ2VTZW5kZXIsXHJcbiAgKTogUHJvbWlzZTxSZXN1bHQ8R2VuZXJhdGVUcmFwc0RhdGE+PiB7XHJcbiAgICAvLyBPbmx5IHRoZSBjb250ZW50IHNjcmlwdCBvZiB0aGUgdGFiIHRoYXQgb3ducyB0aGUgc2Vzc2lvbiBtYXkgYXNrLlxyXG4gICAgY29uc3QgYWN0aXZlID0gYXdhaXQgcmVhZEFjdGl2ZVNlc3Npb24oc2Vzc2lvbik7XHJcbiAgICBpZiAoIWlzR2VuZXJhdGlvbkF1dGhvcml6ZWQoYWN0aXZlLCBzZW5kZXIudGFiPy5pZCwgc2Vzc2lvbklkKSkge1xyXG4gICAgICByZXR1cm4gZmFpbHVyZSgnU0VTU0lPTl9SRVBMQUNFRCcsICdUaGlzIHRhYiBkb2VzIG5vdCBvd24gdGhlIGFjdGl2ZSBFY2xpcHNlIHNlc3Npb24uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCEoYXdhaXQgaGFzUHJvdmlkZXJQZXJtaXNzaW9uKCkpKSB7XHJcbiAgICAgIGF3YWl0IHdyaXRlUHJvdmlkZXJTZXR0aW5ncyhsb2NhbCwge1xyXG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgbGFzdEVycm9yOiAnUGVybWlzc2lvbiBmb3IgdGhlIGxvY2FsIGdlbmVyYXRpb24gQVBJIGlzIG5vdCBncmFudGVkLicsXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZmFpbHVyZSgnUFJPVklERVJfUEVSTUlTU0lPTl9ERU5JRUQnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnZW5lcmF0ZVdpdGhDYWNoZShzZW50ZW5jZXMsIGRlbGZMZXZlbCwgbG9jYWwpO1xyXG4gICAgYXdhaXQgd3JpdGVQcm92aWRlclNldHRpbmdzKGxvY2FsLCB7XHJcbiAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgIGxhc3RFcnJvcjogcmVzdWx0Lm9rID8gbnVsbCA6IHJlc3VsdC5lcnJvci5tZXNzYWdlLFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFyZXN1bHQub2spIHJldHVybiByZXN1bHQ7XHJcbiAgICByZXR1cm4gc3VjY2Vzcyh7IGNhbmRpZGF0ZXM6IHJlc3VsdC5kYXRhIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIEhlbHBlcnNcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGFjdGl2ZVRhYigpOiBQcm9taXNlPEJyb3dzZXIudGFicy5UYWIgfCB1bmRlZmluZWQ+IHtcclxuICAgIGNvbnN0IFt0YWJdID0gYXdhaXQgYnJvd3Nlci50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlIH0pO1xyXG4gICAgcmV0dXJuIHRhYjtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbklmTWF0Y2hlcyhzZXNzaW9uSWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgY3VycmVudCA9IGF3YWl0IHJlYWRBY3RpdmVTZXNzaW9uKHNlc3Npb24pO1xyXG4gICAgaWYgKGN1cnJlbnQ/LnNlc3Npb25JZCA9PT0gc2Vzc2lvbklkKSBhd2FpdCBjbGVhckFjdGl2ZVNlc3Npb24oc2Vzc2lvbik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZW5kIHRvIGEgdGFiIGFuZCB0dXJuIFwibm8gcmVjZWl2ZXJcIiBpbnRvIGEgdHlwZWQgZmFpbHVyZS4gYHNlbmRNZXNzYWdlYFxyXG4gICAqIHJlamVjdHMgd2hlbiBub3RoaW5nIGlzIGxpc3RlbmluZywgd2hpY2ggaXMgdGhlIG5vcm1hbCBjYXNlIGJlZm9yZSB0aGVcclxuICAgKiBydW50aW1lIGlzIGluamVjdGVkIOKAlCBub3QgYW4gZXJyb3Igd29ydGggbG9nZ2luZy5cclxuICAgKi9cclxuICBhc3luYyBmdW5jdGlvbiBzZW5kVG9UYWI8VD4odGFiSWQ6IG51bWJlciwgbWVzc2FnZTogRWNsaXBzZU1lc3NhZ2UpOiBQcm9taXNlPFJlc3VsdDxUPj4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzcG9uc2U6IHVua25vd24gPSBhd2FpdCBicm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UodGFiSWQsIG1lc3NhZ2UpO1xyXG4gICAgICBpZiAocmVzcG9uc2UgJiYgdHlwZW9mIHJlc3BvbnNlID09PSAnb2JqZWN0JyAmJiAnb2snIGluIHJlc3BvbnNlKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlIGFzIFJlc3VsdDxUPjtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFpbHVyZSgnQ09OVEVOVF9TQ1JJUFRfVU5BVkFJTEFCTEUnLCAnVGhlIEVjbGlwc2UgcnVudGltZSByZXR1cm5lZCBub3RoaW5nLicpO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIHJldHVybiBmYWlsdXJlKCdDT05URU5UX1NDUklQVF9VTkFWQUlMQUJMRScpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbiIsIi8vI3JlZ2lvbiBzcmMvaW5kZXgudHNcclxuLyoqXHJcbiogQ2xhc3MgZm9yIHBhcnNpbmcgYW5kIHBlcmZvcm1pbmcgb3BlcmF0aW9ucyBvbiBtYXRjaCBwYXR0ZXJucy5cclxuKlxyXG4qIEBleGFtcGxlXHJcbiogICBjb25zdCBwYXR0ZXJuID0gbmV3IE1hdGNoUGF0dGVybignKjovL2dvb2dsZS5jb20vKicpO1xyXG4qXHJcbiogICBwYXR0ZXJuLmluY2x1ZGVzKCdodHRwczovL2dvb2dsZS5jb20nKTsgLy8gdHJ1ZVxyXG4qICAgcGF0dGVybi5pbmNsdWRlcygnaHR0cDovL3lvdXR1YmUuY29tL3dhdGNoP3Y9MTIzJyk7IC8vIGZhbHNlXHJcbiovXHJcbnZhciBNYXRjaFBhdHRlcm4gPSBjbGFzcyBNYXRjaFBhdHRlcm4ge1xyXG5cdHN0YXRpYyB7XHJcblx0XHR0aGlzLlBST1RPQ09MUyA9IFtcclxuXHRcdFx0XCJodHRwXCIsXHJcblx0XHRcdFwiaHR0cHNcIixcclxuXHRcdFx0XCJmaWxlXCIsXHJcblx0XHRcdFwiZnRwXCIsXHJcblx0XHRcdFwidXJuXCIsXHJcblx0XHRcdFwid3NcIixcclxuXHRcdFx0XCJ3c3NcIlxyXG5cdFx0XTtcclxuXHR9XHJcblx0LyoqXHJcblx0KiBQYXJzZSBhIG1hdGNoIHBhdHRlcm4gc3RyaW5nLiBJZiBpdCBpcyBpbnZhbGlkLCB0aGUgY29uc3RydWN0b3Igd2lsbCB0aHJvdyBhblxyXG5cdCogYEludmFsaWRNYXRjaFBhdHRlcm5gIGVycm9yLlxyXG5cdCpcclxuXHQqIEBwYXJhbSBtYXRjaFBhdHRlcm4gVGhlIG1hdGNoIHBhdHRlcm4gdG8gcGFyc2UuXHJcblx0Ki9cclxuXHRjb25zdHJ1Y3RvcihtYXRjaFBhdHRlcm4pIHtcclxuXHRcdGlmIChtYXRjaFBhdHRlcm4gPT09IFwiPGFsbF91cmxzPlwiKSB7XHJcblx0XHRcdHRoaXMuaXNBbGxVcmxzID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5wcm90b2NvbE1hdGNoZXMgPSBbLi4uTWF0Y2hQYXR0ZXJuLlBST1RPQ09MU107XHJcblx0XHRcdHRoaXMuaG9zdG5hbWVNYXRjaCA9IFwiKlwiO1xyXG5cdFx0XHR0aGlzLnBhdGhuYW1lTWF0Y2ggPSBcIipcIjtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGNvbnN0IGdyb3VwcyA9IC8oLiopOlxcL1xcLyguKj8pKFxcLy4qKS8uZXhlYyhtYXRjaFBhdHRlcm4pO1xyXG5cdFx0XHRpZiAoZ3JvdXBzID09IG51bGwpIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKG1hdGNoUGF0dGVybiwgXCJJbmNvcnJlY3QgZm9ybWF0XCIpO1xyXG5cdFx0XHRjb25zdCBbXywgcHJvdG9jb2wsIGhvc3RuYW1lLCBwYXRobmFtZV0gPSBncm91cHM7XHJcblx0XHRcdHZhbGlkYXRlUHJvdG9jb2wobWF0Y2hQYXR0ZXJuLCBwcm90b2NvbCk7XHJcblx0XHRcdHZhbGlkYXRlSG9zdG5hbWUobWF0Y2hQYXR0ZXJuLCBob3N0bmFtZSk7XHJcblx0XHRcdHRoaXMucHJvdG9jb2xNYXRjaGVzID0gcHJvdG9jb2wgPT09IFwiKlwiID8gW1wiaHR0cFwiLCBcImh0dHBzXCJdIDogW3Byb3RvY29sXTtcclxuXHRcdFx0dGhpcy5ob3N0bmFtZU1hdGNoID0gaG9zdG5hbWU7XHJcblx0XHRcdHRoaXMucGF0aG5hbWVNYXRjaCA9IHBhdGhuYW1lO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvKiogQ2hlY2sgaWYgYSBVUkwgaXMgaW5jbHVkZWQgaW4gYSBwYXR0ZXJuLiAqL1xyXG5cdGluY2x1ZGVzKHVybCkge1xyXG5cdFx0Y29uc3QgdSA9IHR5cGVvZiB1cmwgPT09IFwic3RyaW5nXCIgPyBuZXcgVVJMKHVybCkgOiB1cmwgaW5zdGFuY2VvZiBMb2NhdGlvbiA/IG5ldyBVUkwodXJsLmhyZWYpIDogdXJsO1xyXG5cdFx0aWYgKHRoaXMuaXNBbGxVcmxzKSByZXR1cm4gIXRoaXMuaXNVbmtub3duUHJvdG9jb2wodSk7XHJcblx0XHRyZXR1cm4gISF0aGlzLnByb3RvY29sTWF0Y2hlcy5maW5kKChwcm90b2NvbCkgPT4ge1xyXG5cdFx0XHRpZiAocHJvdG9jb2wgPT09IFwiaHR0cFwiKSByZXR1cm4gdGhpcy5pc0h0dHBNYXRjaCh1KTtcclxuXHRcdFx0aWYgKHByb3RvY29sID09PSBcImh0dHBzXCIpIHJldHVybiB0aGlzLmlzSHR0cHNNYXRjaCh1KTtcclxuXHRcdFx0aWYgKHByb3RvY29sID09PSBcImZpbGVcIikgcmV0dXJuIHRoaXMuaXNGaWxlTWF0Y2godSk7XHJcblx0XHRcdGlmIChwcm90b2NvbCA9PT0gXCJmdHBcIikgcmV0dXJuIHRoaXMuaXNGdHBNYXRjaCh1KTtcclxuXHRcdFx0aWYgKHByb3RvY29sID09PSBcInVyblwiKSByZXR1cm4gdGhpcy5pc1Vybk1hdGNoKHUpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdGlzSHR0cE1hdGNoKHVybCkge1xyXG5cdFx0cmV0dXJuIHVybC5wcm90b2NvbCA9PT0gXCJodHRwOlwiICYmIHRoaXMuaXNIb3N0UGF0aE1hdGNoKHVybCk7XHJcblx0fVxyXG5cdGlzSHR0cHNNYXRjaCh1cmwpIHtcclxuXHRcdHJldHVybiB1cmwucHJvdG9jb2wgPT09IFwiaHR0cHM6XCIgJiYgdGhpcy5pc0hvc3RQYXRoTWF0Y2godXJsKTtcclxuXHR9XHJcblx0aXNIb3N0UGF0aE1hdGNoKHVybCkge1xyXG5cdFx0aWYgKCF0aGlzLmhvc3RuYW1lTWF0Y2ggfHwgIXRoaXMucGF0aG5hbWVNYXRjaCkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0Y29uc3QgaG9zdG5hbWVNYXRjaFJlZ2V4cyA9IFt0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLmhvc3RuYW1lTWF0Y2gpLCB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLmhvc3RuYW1lTWF0Y2gucmVwbGFjZSgvXlxcKlxcLi8sIFwiXCIpKV07XHJcblx0XHRjb25zdCBwYXRobmFtZU1hdGNoUmVnZXggPSB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLnBhdGhuYW1lTWF0Y2gpO1xyXG5cdFx0cmV0dXJuICEhaG9zdG5hbWVNYXRjaFJlZ2V4cy5maW5kKChyZWdleCkgPT4gcmVnZXgudGVzdCh1cmwuaG9zdG5hbWUpKSAmJiBwYXRobmFtZU1hdGNoUmVnZXgudGVzdCh1cmwucGF0aG5hbWUpO1xyXG5cdH1cclxuXHRpc1Vua25vd25Qcm90b2NvbCh1cmwpIHtcclxuXHRcdHJldHVybiAhdGhpcy5wcm90b2NvbE1hdGNoZXMuaW5jbHVkZXModXJsLnByb3RvY29sLnNsaWNlKDAsIC0xKSk7XHJcblx0fVxyXG5cdGlzUGF0aE1hdGNoKHVybCkge1xyXG5cdFx0aWYgKCF0aGlzLnBhdGhuYW1lTWF0Y2gpIHJldHVybiBmYWxzZTtcclxuXHRcdHJldHVybiB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLnBhdGhuYW1lTWF0Y2gpLnRlc3QodXJsLnBhdGhuYW1lKTtcclxuXHR9XHJcblx0aXNGaWxlTWF0Y2godXJsKSB7XHJcblx0XHRyZXR1cm4gdXJsLnByb3RvY29sID09PSBcImZpbGU6XCIgJiYgdGhpcy5pc1BhdGhNYXRjaCh1cmwpO1xyXG5cdH1cclxuXHRpc0Z0cE1hdGNoKF91cmwpIHtcclxuXHRcdHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiBmdHA6Ly8gcGF0dGVybiBtYXRjaGluZy4gT3BlbiBhIFBSIHRvIGFkZCBzdXBwb3J0XCIpO1xyXG5cdH1cclxuXHRpc1Vybk1hdGNoKF91cmwpIHtcclxuXHRcdHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiB1cm46Ly8gcGF0dGVybiBtYXRjaGluZy4gT3BlbiBhIFBSIHRvIGFkZCBzdXBwb3J0XCIpO1xyXG5cdH1cclxuXHRjb252ZXJ0UGF0dGVyblRvUmVnZXgocGF0dGVybikge1xyXG5cdFx0Y29uc3Qgc3RhcnNSZXBsYWNlZCA9IHRoaXMuZXNjYXBlRm9yUmVnZXgocGF0dGVybikucmVwbGFjZSgvXFxcXFxcKi9nLCBcIi4qXCIpO1xyXG5cdFx0cmV0dXJuIFJlZ0V4cChgXiR7c3RhcnNSZXBsYWNlZH0kYCk7XHJcblx0fVxyXG5cdGVzY2FwZUZvclJlZ2V4KHN0cmluZykge1xyXG5cdFx0cmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIik7XHJcblx0fVxyXG59O1xyXG52YXIgSW52YWxpZE1hdGNoUGF0dGVybiA9IGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xyXG5cdGNvbnN0cnVjdG9yKG1hdGNoUGF0dGVybiwgcmVhc29uKSB7XHJcblx0XHRzdXBlcihgSW52YWxpZCBtYXRjaCBwYXR0ZXJuIFwiJHttYXRjaFBhdHRlcm59XCI6ICR7cmVhc29ufWApO1xyXG5cdH1cclxufTtcclxuZnVuY3Rpb24gdmFsaWRhdGVQcm90b2NvbChtYXRjaFBhdHRlcm4sIHByb3RvY29sKSB7XHJcblx0aWYgKCFNYXRjaFBhdHRlcm4uUFJPVE9DT0xTLmluY2x1ZGVzKHByb3RvY29sKSAmJiBwcm90b2NvbCAhPT0gXCIqXCIpIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKG1hdGNoUGF0dGVybiwgYCR7cHJvdG9jb2x9IG5vdCBhIHZhbGlkIHByb3RvY29sICgke01hdGNoUGF0dGVybi5QUk9UT0NPTFMuam9pbihcIiwgXCIpfSlgKTtcclxufVxyXG5mdW5jdGlvbiB2YWxpZGF0ZUhvc3RuYW1lKG1hdGNoUGF0dGVybiwgaG9zdG5hbWUpIHtcclxuXHRpZiAoaG9zdG5hbWUuaW5jbHVkZXMoXCI6XCIpKSB0aHJvdyBuZXcgSW52YWxpZE1hdGNoUGF0dGVybihtYXRjaFBhdHRlcm4sIGBIb3N0bmFtZSBjYW5ub3QgaW5jbHVkZSBhIHBvcnRgKTtcclxuXHRpZiAoaG9zdG5hbWUuaW5jbHVkZXMoXCIqXCIpICYmIGhvc3RuYW1lLmxlbmd0aCA+IDEgJiYgIWhvc3RuYW1lLnN0YXJ0c1dpdGgoXCIqLlwiKSkgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4obWF0Y2hQYXR0ZXJuLCBgSWYgdXNpbmcgYSB3aWxkY2FyZCAoKiksIGl0IG11c3QgZ28gYXQgdGhlIHN0YXJ0IG9mIHRoZSBob3N0bmFtZWApO1xyXG59XHJcbi8vI2VuZHJlZ2lvblxyXG5leHBvcnQgeyBJbnZhbGlkTWF0Y2hQYXR0ZXJuLCBNYXRjaFBhdHRlcm4gfTtcclxuIl0sInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDEsMiw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMzhdLCJtYXBwaW5ncyI6Ijs7Q0FDQSxTQUFTLGlCQUFpQixLQUFLO0VBQzlCLElBQUksT0FBTyxRQUFRLE9BQU8sUUFBUSxZQUFZLE9BQU8sRUFBRSxNQUFNLElBQUk7RUFDakUsT0FBTztDQUNSOzs7Ozs7Ozs7Ozs7Ozs7OztDRVlBLElBQU0sVURmaUIsV0FBVyxTQUFTLFNBQVMsS0FDaEQsV0FBVyxVQUNYLFdBQVc7Ozs7Ozs7Ozs7Q0VLZixJQUFNLGNBQWM7Q0FFcEIsU0FBUyxZQUFZLFFBQXdCO0VBQzNDLE1BQU0sUUFBUSxJQUFJLFdBQVcsTUFBTTtFQUNuQyxXQUFXLE9BQU8sZ0JBQWdCLEtBQUs7RUFDdkMsSUFBSSxNQUFNO0VBQ1YsS0FBSyxNQUFNLFFBQVEsT0FDakIsT0FBTyxZQUFZLE9BQU87RUFFNUIsT0FBTztDQUNUO0NBRUEsU0FBZ0Isa0JBQTBCO0VBQ3hDLE9BQU8sT0FBTyxZQUFZLEVBQUU7Q0FDOUI7Ozs7Ozs7Ozs7Q0NkQSxJQUFhLGNBQWM7RUFDekI7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7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RSxPQUFBLFFBQUEsRUFBQSxVQUFBLE1BQUEsQ0FBQTtHQUVGLE9BQUEsUUFBQSxFQUFBLFVBQUEsUUFBQSxLQUFBLFNBQUEsQ0FBQTtFQUNGOzs7OztFQU1BLGVBQUEsY0FBQSxPQUFBO0dBQ0UsTUFBQSxPQUFBLE1BQUEsVUFBQSxPQUFBLEVBQUEsTUFBQSxPQUFBLENBQUE7R0FDQSxJQUFBLEtBQUEsSUFBQSxPQUFBO0dBRUEsSUFBQTtJQUNFLE1BQUEsUUFBQSxVQUFBLGNBQUE7S0FDRSxRQUFBLEVBQUEsTUFBQTtLQUNBLE9BQUEsQ0FBQSxtQkFBQTtJQUNGLENBQUE7R0FDRixTQUFBLE9BQUE7SUFFRSxPQUFBLFFBQUEsOEJBREEsaUJBQUEsUUFBQSxNQUFBLFVBQUEsa0JBQ0E7R0FDRjtHQUVBLE1BQUEsUUFBQSxNQUFBLFVBQUEsT0FBQSxFQUFBLE1BQUEsT0FBQSxDQUFBO0dBQ0EsSUFBQSxDQUFBLE1BQUEsSUFBQSxPQUFBLFFBQUEsNEJBQUE7R0FDQSxPQUFBO0VBQ0Y7RUFNQSxlQUFBLFlBQUE7R0FDRSxNQUFBLE1BQUEsTUFBQSxVQUFBO0dBQ0EsTUFBQSxPQUFBLFlBQUEsS0FBQSxHQUFBO0dBQ0EsTUFBQSxTQUFBLE1BQUEsa0JBQUEsT0FBQTtHQUNBLE1BQUEsbUJBQUEsTUFBQSxxQkFBQSxLQUFBO0dBQ0EsTUFBQSxzQkFBQSxJQUFBLEtBQUE7R0FFQSxNQUFBLFNBQUEsTUFBQSxZQUFBLEtBQUE7R0FDQSxJQUFBLENBQUEsT0FBQSxJQUNFLE9BQUEsUUFBQTtJQUNFLGlCQUFBO0lBQ0EsYUFBQSxRQUFBLFNBQUE7SUFDQSxpQkFBQSxRQUFBLGFBQUE7SUFDQSxZQUFBLFFBQUEsVUFBQSxLQUFBO0lBQ0E7SUFDQSxzQkFBQTtJQUNBLFdBQUE7SUFDQSxlQUFBO0lBQ0EsT0FBQTtJQUNBLFNBQUE7S0FDRSxTQUFBO0tBQ0EsVUFBQTtLQUNBLFNBQUE7S0FDQSxLQUFBO0tBQ0EsU0FBQTtNQUFXLFVBQUE7TUFBYSxVQUFBO01BQWEsTUFBQTtNQUFTLE1BQUE7S0FBUTtLQUN0RCxj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