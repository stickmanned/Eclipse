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
	* runtime and the optional generation API.
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
		"UNKNOWN_ERROR"
	];
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
		UNKNOWN_ERROR: false
	};
	/** Human-readable default copy. Callers may override with something specific. */
	var DEFAULT_MESSAGE = {
		UNSUPPORTED_URL: "Eclipse only runs on regular http(s) web pages.",
		NO_ARTICLE: "No readable article was found on this page.",
		NO_ELIGIBLE_TRAPS: "No French context traps fit this article yet.",
		CONTENT_SCRIPT_UNAVAILABLE: "Eclipse could not attach to this tab. Reload the page and retry.",
		SESSION_REPLACED: "Eclipse moved to another tab.",
		DOM_INVALIDATED: "The page changed underneath Eclipse, so the session was ended safely.",
		STORAGE_ERROR: "Your progress could not be saved.",
		PROFILE_INCOMPATIBLE: "Saved learning data was written by a newer version of Eclipse.",
		PROVIDER_DISABLED: "AI-generated traps are turned off.",
		PROVIDER_PERMISSION_DENIED: "Permission for the local generation API was not granted.",
		PROVIDER_UNAVAILABLE: "The local generation API is not reachable.",
		PROVIDER_TIMEOUT: "The local generation API took too long.",
		PROVIDER_INVALID_RESPONSE: "The local generation API returned something Eclipse cannot trust.",
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
	* a bad edit fails loudly in CI) and the optional generation API (untrusted,
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
	* The context-trap contract.
	*
	* A trap is one replacement: a specific English span inside a specific sentence
	* becomes a French surface form, and answering it reveals the evidence that
	* settles the meaning. Traps arrive from the bundled catalog or, optionally,
	* from the local generation API. Both go through {@link validateTrap} before
	* anything is rendered.
	*/
	var TRAP_TYPES = [
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
	* `SAVE_CALIBRATION` and `SET_PROVIDER` are the two additions to the eight
	* message types in the plan, and both exist to keep the ownership boundary
	* intact rather than to add features:
	*
	* - Calibration produces a `globalAbility`, which is learner history. The plan
	*   says the popup must not write that directly, so it routes through here.
	* - Enabling the optional provider needs `chrome.permissions.request`, which
	*   requires a user gesture and therefore must be called from the popup — but
	*   the resulting setting is the worker's to persist.
	*
	* Every handler returns `Success<T>` or `Failure`; nothing throws across a
	* message boundary.
	*/
	var eclipseMessageSchema = discriminatedUnion("type", [
		object({ type: literal("START_SESSION") }),
		object({ type: literal("STOP_SESSION") }),
		object({ type: literal("PING") }),
		object({
			type: literal("ACTIVATE"),
			sessionId: string().min(1),
			providerEnabled: boolean()
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
			sentences: array(object({
				id: string().min(1).max(64),
				text: string().min(1).max(300)
			})).max(8)
		}),
		object({
			type: literal("RESET_PROFILE"),
			confirmed: boolean()
		}),
		object({
			type: literal("SAVE_CALIBRATION"),
			globalAbility: number().min(-1).max(1),
			correctAnswers: number().int().min(0).max(3),
			skipped: boolean()
		}),
		object({
			type: literal("SET_PROVIDER"),
			enabled: boolean()
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
	* Whether the optional generation API is switched on.
	*
	* Off by default and off after a reset. The origin is a build-time constant,
	* not user input, so there is no way for a page to point Eclipse at a server of
	* its choosing.
	*/
	/** The only origin Eclipse will ever contact, and only when explicitly enabled. */
	var PROVIDER_ORIGIN = "http://localhost:8787";
	var PROVIDER_ENDPOINT = `${PROVIDER_ORIGIN}/api/context-traps`;
	var PROVIDER_HEALTH_ENDPOINT = `${PROVIDER_ORIGIN}/health`;
	var PROVIDER_PERMISSION_PATTERN = "http://localhost:8787/*";
	var PROVIDER_MODEL = "gemini-3.5-flash-lite";
	var providerSettingsSchema = object({
		enabled: boolean(),
		lastError: string().nullable()
	});
	var DEFAULT_PROVIDER_SETTINGS = {
		enabled: false,
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
	var PROVIDER_CACHE_SCOPE = `source=en|target=fr-FR|provider=gemini|model=${PROVIDER_MODEL}|prompt=v1|schema=v1`;
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
	* Look up cached traps for a sentence. Entries are re-validated on read, so a
	* cache written by an older, laxer build can never bypass current validation.
	*/
	async function getCachedTraps(area, sentence, now, scope = PROVIDER_CACHE_SCOPE) {
		const cache = await readCache(area);
		const entry = cache[await cacheKeyFor(sentence, scope)];
		if (!entry) return null;
		const traps = [];
		for (const candidate of entry.traps) {
			if (typeof candidate !== "object" || candidate === null) continue;
			const validated = validateTrap({
				...candidate,
				sentence
			}, { untrusted: true });
			if (validated.ok) traps.push(validated.data);
		}
		if (traps.length === 0) return null;
		entry.accessedAt = now.getTime();
		await guarded(() => area.set(PROVIDER_CACHE_KEY, cache));
		return traps;
	}
	/** Store traps for a sentence, evicting the least recently accessed entries. */
	async function setCachedTraps(area, sentence, traps, now, scope = PROVIDER_CACHE_SCOPE) {
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
		if (templates.length === 0) return success(void 0);
		const cache = await readCache(area);
		const key = await cacheKeyFor(sentence, scope);
		cache[key] = {
			accessedAt: now.getTime(),
			traps: templates
		};
		const entries = Object.entries(cache);
		if (entries.length > 100) {
			entries.sort((a, b) => {
				const byAccess = b[1].accessedAt - a[1].accessedAt;
				if (byAccess !== 0) return byAccess;
				return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
			});
			const kept = Object.fromEntries(entries.slice(0, 100));
			return guarded(() => area.set(PROVIDER_CACHE_KEY, kept));
		}
		return guarded(() => area.set(PROVIDER_CACHE_KEY, cache));
	}
	async function clearProviderCache(area) {
		return guarded(() => area.remove(PROVIDER_CACHE_KEY));
	}
	//#endregion
	//#region src/provider/client.ts
	/**
	* Client for the optional local generation API.
	*
	* Everything about this path is designed to be skippable. It runs only when the
	* user has switched it on, it has a hard timeout, it never retries during
	* activation, and any failure at all leaves the catalog traps exactly as they
	* were.
	*
	* What leaves the browser: at most eight sentences of article text. Never the
	* page URL, never the learner profile, never answer history, never anything
	* else from the page.
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
	/** Verify the local server before persisting the AI-enabled setting. */
	async function checkProviderHealth(options = {}) {
		const doFetch = options.fetchImpl ?? globalThis.fetch;
		if (typeof doFetch !== "function") return failure("PROVIDER_UNAVAILABLE");
		const controller = new AbortController();
		const timeoutMs = options.timeoutMs ?? 4e3;
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		let response;
		try {
			response = await doFetch(PROVIDER_HEALTH_ENDPOINT, {
				method: "GET",
				signal: controller.signal,
				credentials: "omit",
				cache: "no-store"
			});
		} catch (cause) {
			return failure(cause instanceof Error && cause.name === "AbortError" ? "PROVIDER_TIMEOUT" : "PROVIDER_UNAVAILABLE");
		} finally {
			clearTimeout(timer);
		}
		if (!response.ok) return failure("PROVIDER_UNAVAILABLE");
		let body;
		try {
			body = await response.json();
		} catch {
			return failure("PROVIDER_INVALID_RESPONSE");
		}
		const health = body;
		if (health.ok !== true || health.provider !== "gemini" || health.model !== "gemini-3.5-flash-lite") return failure("PROVIDER_DISABLED", `Start the local Gemini server with model ${PROVIDER_MODEL}, then try again.`);
		return success({
			provider: "gemini",
			model: PROVIDER_MODEL
		});
	}
	/**
	* Ask the local API for traps over the given sentences.
	*
	* Returns validated, sentence-bound candidates only. Anything the server sends that does not pass
	* the same validation the catalog passes is discarded — an invalid model
	* response can never reach the DOM.
	*/
	async function fetchGeneratedTraps(sentences, options = {}) {
		const endpoint = options.endpoint ?? PROVIDER_ENDPOINT;
		const timeoutMs = options.timeoutMs ?? 4e3;
		const doFetch = options.fetchImpl ?? globalThis.fetch;
		if (typeof doFetch !== "function") return failure("PROVIDER_UNAVAILABLE", "No fetch implementation is available.");
		const payload = {
			sourceLocale: "en",
			targetLocale: "fr-FR",
			sentences: sentences.slice(0, 8).map((sentence) => ({
				id: sentence.id,
				text: sentence.text.slice(0, 300)
			}))
		};
		if (payload.sentences.length === 0) return success([]);
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
			return failure(aborted ? "PROVIDER_TIMEOUT" : "PROVIDER_UNAVAILABLE", aborted ? `The generation API did not answer within ${timeoutMs}ms.` : "The generation API could not be reached.");
		} finally {
			clearTimeout(timer);
		}
		if (!response.ok) return failure(codeForStatus(response.status), `Generation API returned ${response.status}.`);
		let body;
		try {
			body = await response.json();
		} catch {
			return failure("PROVIDER_INVALID_RESPONSE", "Generation API returned malformed JSON.");
		}
		const candidates = body.candidates;
		if (!Array.isArray(candidates)) return failure("PROVIDER_INVALID_RESPONSE", "Generation API response had no candidates array.");
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
	//#endregion
	//#region src/provider/generate-with-cache.ts
	/** Cache-aware orchestration for the optional provider request. */
	async function generateWithCache(sentences, area, fetcher = fetchGeneratedTraps, now = () => /* @__PURE__ */ new Date()) {
		const bySentenceId = /* @__PURE__ */ new Map();
		const misses = [];
		for (const sentence of sentences) {
			const cached = await getCachedTraps(area, sentence.text, now());
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
		const fetched = await fetcher(misses);
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
		for (const sentence of misses) {
			const generated = bySentenceId.get(sentence.id) ?? [];
			if (generated.length === 0) continue;
			await setCachedTraps(area, sentence.text, generated.map((candidate) => candidate.trap), now());
		}
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
	* injection of the Eclipse content script, the optional provider permission and
	* network call, and session replacement across tabs.
	*
	* Does NOT own: answer outcomes. Those have exactly one writer, the content
	* script, which is what removes the popup/background/content race entirely.
	*/
	/** Built bundle path of the runtime-injected content script. */
	var CONTENT_SCRIPT_FILE = "/content-scripts/eclipse.js";
	/**
	* The optional provider is only ever offered when a server origin was compiled
	* in. There is no field anywhere in the UI that lets a page or a user point
	* Eclipse at an arbitrary host.
	*/
	var PROVIDER_CONFIGURED = PROVIDER_ORIGIN.length > 0;
	var background_default = defineBackground(() => {
		const local = chromeArea(browser.storage.local);
		const session = chromeArea(browser.storage.session);
		browser.runtime.onMessage.addListener((raw, sender, sendResponse) => {
			const message = parseMessage(raw);
			if (!message) {
				sendResponse(failure("UNKNOWN_ERROR", "Unrecognised message."));
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
				case "SAVE_CALIBRATION": return doSaveCalibration(message.globalAbility);
				case "SET_PROVIDER": return doSetProvider(message.enabled);
				case "GENERATE_TRAPS": return doGenerateTraps(message.sessionId, message.sentences, sender);
				default: return failure("UNKNOWN_ERROR", `The background worker does not handle ${message.type}.`);
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
			const providerSettings = await readProviderSettings(local);
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
				providerEnabled: providerSettings.enabled
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
				activeTabId: active?.tabId ?? null,
				activeSessionId: active?.sessionId ?? null,
				activeHere: active?.tabId === tab?.id,
				page,
				calibrationCompleted: false,
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
					enabled: providerSettings.enabled,
					permissionGranted: await hasProviderPermission(),
					lastError: providerSettings.lastError
				},
				profileError: loaded.error.message
			});
			const profile = loaded.data.profile;
			const summary = summarizeMastery(profile, now);
			return success({
				activeTabId: active?.tabId ?? null,
				activeSessionId: active?.sessionId ?? null,
				activeHere: active !== null && active.tabId === tab?.id,
				page,
				calibrationCompleted: profile.calibrationCompleted,
				globalAbility: profile.globalAbility,
				phase: summary.overallPhase,
				summary,
				provider: {
					configured: PROVIDER_CONFIGURED,
					enabled: providerSettings.enabled,
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
		async function doSaveCalibration(globalAbility) {
			const loaded = await loadProfile(local);
			if (!loaded.ok) return loaded;
			const saved = await saveProfile(local, {
				...loaded.data.profile,
				calibrationCompleted: true,
				globalAbility
			});
			if (!saved.ok) return saved;
			return success({ globalAbility });
		}
		/**
		* Persist the optional-provider toggle.
		*
		* The permission prompt itself belongs to the popup — `permissions.request`
		* needs a user gesture — so by the time this runs the grant has either
		* happened or been refused. Enabling without the grant is refused here rather
		* than stored and discovered later.
		*/
		async function doSetProvider(enabled) {
			if (!PROVIDER_CONFIGURED) return failure("PROVIDER_DISABLED");
			const granted = await hasProviderPermission();
			if (enabled && !granted) {
				await writeProviderSettings(local, {
					enabled: false,
					lastError: "Permission for the local generation API was not granted."
				});
				return failure("PROVIDER_PERMISSION_DENIED");
			}
			if (!enabled && granted && !await revokeProviderPermission()) return failure("PROVIDER_PERMISSION_DENIED", "The optional local-server permission could not be removed.");
			if (enabled) {
				const health = await checkProviderHealth();
				if (!health.ok) {
					await revokeProviderPermission();
					await writeProviderSettings(local, {
						enabled: false,
						lastError: health.error.message
					});
					return health;
				}
			}
			const written = await writeProviderSettings(local, {
				enabled,
				lastError: null
			});
			if (!written.ok) return written;
			return success({
				enabled,
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
		async function doGenerateTraps(sessionId, sentences, sender) {
			if (!isGenerationAuthorized(await readActiveSession(session), sender.tab?.id, sessionId)) return failure("SESSION_REPLACED", "This tab does not own the active Eclipse session.");
			const settings = await readProviderSettings(local);
			if (!settings.enabled) return failure("PROVIDER_DISABLED");
			if (!await hasProviderPermission()) {
				await writeProviderSettings(local, {
					enabled: false,
					lastError: "Permission for the local generation API is not granted."
				});
				return failure("PROVIDER_PERMISSION_DENIED");
			}
			const result = await generateWithCache(sentences, local);
			await writeProviderSettings(local, {
				enabled: settings.enabled,
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
	//#region \0virtual:wxt-background-entrypoint?C:/Users/mikei/Documents/Eclipse/src/entrypoints/background.ts
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsIm5hbWVzIjpbImJyb3dzZXIiLCJfYSIsIkYiLCJpbml0aWFsaXplciIsInV0aWwuanNvblN0cmluZ2lmeVJlcGxhY2VyIiwiY29yZS4kWm9kQXN5bmNFcnJvciIsInV0aWwuZmluYWxpemVJc3N1ZSIsImNvcmUuY29uZmlnIiwiZXJyb3JzLiRab2RFcnJvciIsInNhZmVQYXJzZSIsImVycm9ycy4kWm9kUmVhbEVycm9yIiwic2FmZVBhcnNlQXN5bmMiLCJkdXJhdGlvbiIsIl9lbW9qaSIsImRhdGUiLCJ0aW1lIiwiZGF0ZXRpbWUiLCJzdHJpbmciLCJudW1iZXIiLCJib29sZWFuIiwidXRpbC5mbG9hdFNhZmVSZW1haW5kZXIiLCJ1dGlsLk5VTUJFUl9GT1JNQVRfUkFOR0VTIiwicmVnZXhlcy5pbnRlZ2VyIiwidXRpbC5udWxsaXNoIiwidXRpbC5nZXRMZW5ndGhhYmxlT3JpZ2luIiwicmVnZXhlcy5sb3dlcmNhc2UiLCJyZWdleGVzLnVwcGVyY2FzZSIsInV0aWwuZXNjYXBlUmVnZXgiLCJjb250ZW50IiwidXRpbC5hYm9ydGVkIiwidXRpbC5leHBsaWNpdGx5QWJvcnRlZCIsImNvcmUuJFpvZEFzeW5jRXJyb3IiLCJzYWZlUGFyc2UiLCJzYWZlUGFyc2VBc3luYyIsInJlZ2V4ZXMuc3RyaW5nIiwicmVnZXhlcy5ndWlkIiwicmVnZXhlcy51dWlkIiwicmVnZXhlcy5lbWFpbCIsInJlZ2V4ZXMuZW1vamkiLCJyZWdleGVzLm5hbm9pZCIsInJlZ2V4ZXMuY3VpZCIsInJlZ2V4ZXMuY3VpZDIiLCJyZWdleGVzLnVsaWQiLCJyZWdleGVzLnhpZCIsInJlZ2V4ZXMua3N1aWQiLCJyZWdleGVzLmRhdGV0aW1lIiwicmVnZXhlcy5kYXRlIiwicmVnZXhlcy50aW1lIiwicmVnZXhlcy5kdXJhdGlvbiIsInJlZ2V4ZXMuaXB2NCIsInJlZ2V4ZXMuaXB2NiIsInJlZ2V4ZXMuY2lkcnY0IiwicmVnZXhlcy5jaWRydjYiLCJyZWdleGVzLmJhc2U2NCIsInJlZ2V4ZXMuYmFzZTY0dXJsIiwicmVnZXhlcy5lMTY0IiwicmVnZXhlcy5udW1iZXIiLCJyZWdleGVzLmJvb2xlYW4iLCJ1dGlsLnByZWZpeElzc3VlcyIsInV0aWwub3B0aW9uYWxLZXlzIiwidXRpbC5jYWNoZWQiLCJpc09iamVjdCIsInV0aWwuaXNPYmplY3QiLCJ1dGlsLmVzYyIsImFsbG93c0V2YWwiLCJ1dGlsLmFsbG93c0V2YWwiLCJ1dGlsLmZpbmFsaXplSXNzdWUiLCJjb3JlLmNvbmZpZyIsInV0aWwuY2xlYW5SZWdleCIsInV0aWwuaXNQbGFpbk9iamVjdCIsInV0aWwuZ2V0RW51bVZhbHVlcyIsInV0aWwuZXNjYXBlUmVnZXgiLCJjb3JlLiRab2RFbmNvZGVFcnJvciIsInV0aWwuaXNzdWUiLCJ1dGlsLm5vcm1hbGl6ZVBhcmFtcyIsImNoZWNrcy4kWm9kQ2hlY2tMZXNzVGhhbiIsImNoZWNrcy4kWm9kQ2hlY2tHcmVhdGVyVGhhbiIsImNoZWNrcy4kWm9kQ2hlY2tNdWx0aXBsZU9mIiwiY2hlY2tzLiRab2RDaGVja01heExlbmd0aCIsImNoZWNrcy4kWm9kQ2hlY2tNaW5MZW5ndGgiLCJjaGVja3MuJFpvZENoZWNrTGVuZ3RoRXF1YWxzIiwiY2hlY2tzLiRab2RDaGVja1JlZ2V4IiwiY2hlY2tzLiRab2RDaGVja0xvd2VyQ2FzZSIsImNoZWNrcy4kWm9kQ2hlY2tVcHBlckNhc2UiLCJjaGVja3MuJFpvZENoZWNrSW5jbHVkZXMiLCJjaGVja3MuJFpvZENoZWNrU3RhcnRzV2l0aCIsImNoZWNrcy4kWm9kQ2hlY2tFbmRzV2l0aCIsImNoZWNrcy4kWm9kQ2hlY2tPdmVyd3JpdGUiLCJ1dGlsLnNsdWdpZnkiLCJpc3N1ZSIsInV0aWwuaXNzdWUiLCJjaGVja3MuJFpvZENoZWNrIiwiY29yZS5faXNvRGF0ZVRpbWUiLCJjb3JlLl9pc29EYXRlIiwiY29yZS5faXNvVGltZSIsImNvcmUuX2lzb0R1cmF0aW9uIiwiY29yZS5mb3JtYXRFcnJvciIsImNvcmUuZmxhdHRlbkVycm9yIiwidXRpbC5qc29uU3RyaW5naWZ5UmVwbGFjZXIiLCJwYXJzZS5wYXJzZSIsInBhcnNlLnNhZmVQYXJzZSIsInBhcnNlLnBhcnNlQXN5bmMiLCJwYXJzZS5zYWZlUGFyc2VBc3luYyIsInBhcnNlLmVuY29kZSIsInBhcnNlLmRlY29kZSIsInBhcnNlLmVuY29kZUFzeW5jIiwicGFyc2UuZGVjb2RlQXN5bmMiLCJwYXJzZS5zYWZlRW5jb2RlIiwicGFyc2Uuc2FmZURlY29kZSIsInBhcnNlLnNhZmVFbmNvZGVBc3luYyIsInBhcnNlLnNhZmVEZWNvZGVBc3luYyIsInV0aWwubWVyZ2VEZWZzIiwiY29yZS5jbG9uZSIsImNoZWNrcy5vdmVyd3JpdGUiLCJwcm9jZXNzb3JzLnN0cmluZ1Byb2Nlc3NvciIsImNoZWNrcy5yZWdleCIsImNoZWNrcy5pbmNsdWRlcyIsImNoZWNrcy5zdGFydHNXaXRoIiwiY2hlY2tzLmVuZHNXaXRoIiwiY2hlY2tzLm1pbkxlbmd0aCIsImNoZWNrcy5tYXhMZW5ndGgiLCJjaGVja3MubGVuZ3RoIiwiY2hlY2tzLmxvd2VyY2FzZSIsImNoZWNrcy51cHBlcmNhc2UiLCJjaGVja3MudHJpbSIsImNoZWNrcy5ub3JtYWxpemUiLCJjaGVja3MudG9Mb3dlckNhc2UiLCJjaGVja3MudG9VcHBlckNhc2UiLCJjaGVja3Muc2x1Z2lmeSIsImNvcmUuX2VtYWlsIiwiY29yZS5fdXJsIiwiY29yZS5fand0IiwiY29yZS5fZW1vamkiLCJjb3JlLl9ndWlkIiwiY29yZS5fdXVpZCIsImNvcmUuX3V1aWR2NCIsImNvcmUuX3V1aWR2NiIsImNvcmUuX3V1aWR2NyIsImNvcmUuX25hbm9pZCIsImNvcmUuX2N1aWQiLCJjb3JlLl9jdWlkMiIsImNvcmUuX3VsaWQiLCJjb3JlLl9iYXNlNjQiLCJjb3JlLl9iYXNlNjR1cmwiLCJjb3JlLl94aWQiLCJjb3JlLl9rc3VpZCIsImNvcmUuX2lwdjQiLCJjb3JlLl9pcHY2IiwiY29yZS5fY2lkcnY0IiwiY29yZS5fY2lkcnY2IiwiY29yZS5fZTE2NCIsImlzby5kYXRldGltZSIsImlzby5kYXRlIiwiaXNvLnRpbWUiLCJpc28uZHVyYXRpb24iLCJjb3JlLl9zdHJpbmciLCJwcm9jZXNzb3JzLm51bWJlclByb2Nlc3NvciIsImNoZWNrcy5ndCIsImNoZWNrcy5ndGUiLCJjaGVja3MubHQiLCJjaGVja3MubHRlIiwiY2hlY2tzLm11bHRpcGxlT2YiLCJjb3JlLl9udW1iZXIiLCJjb3JlLl9pbnQiLCJwcm9jZXNzb3JzLmJvb2xlYW5Qcm9jZXNzb3IiLCJjb3JlLl9ib29sZWFuIiwicHJvY2Vzc29ycy51bmtub3duUHJvY2Vzc29yIiwiY29yZS5fdW5rbm93biIsInByb2Nlc3NvcnMubmV2ZXJQcm9jZXNzb3IiLCJjb3JlLl9uZXZlciIsInByb2Nlc3NvcnMuYXJyYXlQcm9jZXNzb3IiLCJjb3JlLl9hcnJheSIsInByb2Nlc3NvcnMub2JqZWN0UHJvY2Vzc29yIiwidXRpbC5leHRlbmQiLCJ1dGlsLnNhZmVFeHRlbmQiLCJ1dGlsLm1lcmdlIiwidXRpbC5waWNrIiwidXRpbC5vbWl0IiwidXRpbC5wYXJ0aWFsIiwidXRpbC5yZXF1aXJlZCIsInV0aWwubm9ybWFsaXplUGFyYW1zIiwicHJvY2Vzc29ycy51bmlvblByb2Nlc3NvciIsInByb2Nlc3NvcnMuaW50ZXJzZWN0aW9uUHJvY2Vzc29yIiwicHJvY2Vzc29ycy50dXBsZVByb2Nlc3NvciIsImNvcmUuJFpvZFR5cGUiLCJwcm9jZXNzb3JzLnJlY29yZFByb2Nlc3NvciIsInByb2Nlc3NvcnMuZW51bVByb2Nlc3NvciIsInByb2Nlc3NvcnMubGl0ZXJhbFByb2Nlc3NvciIsInByb2Nlc3NvcnMudHJhbnNmb3JtUHJvY2Vzc29yIiwiY29yZS4kWm9kRW5jb2RlRXJyb3IiLCJpc3N1ZSIsInV0aWwuaXNzdWUiLCJwcm9jZXNzb3JzLm9wdGlvbmFsUHJvY2Vzc29yIiwicHJvY2Vzc29ycy5udWxsYWJsZVByb2Nlc3NvciIsInByb2Nlc3NvcnMuZGVmYXVsdFByb2Nlc3NvciIsInV0aWwuc2hhbGxvd0Nsb25lIiwicHJvY2Vzc29ycy5wcmVmYXVsdFByb2Nlc3NvciIsInByb2Nlc3NvcnMubm9ub3B0aW9uYWxQcm9jZXNzb3IiLCJwcm9jZXNzb3JzLmNhdGNoUHJvY2Vzc29yIiwicHJvY2Vzc29ycy5waXBlUHJvY2Vzc29yIiwicHJvY2Vzc29ycy5yZWFkb25seVByb2Nlc3NvciIsInByb2Nlc3NvcnMuY3VzdG9tUHJvY2Vzc29yIiwiY29yZS5fcmVmaW5lIiwiY29yZS5fc3VwZXJSZWZpbmUiXSwic291cmNlcyI6WyIuLi8uLi9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvZGVmaW5lLWJhY2tncm91bmQubWpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0B3eHQtZGV2L2Jyb3dzZXIvc3JjL2luZGV4Lm1qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy93eHQvZGlzdC9icm93c2VyLm1qcyIsIi4uLy4uL3NyYy9kb21haW4vaWRzLnRzIiwiLi4vLi4vc3JjL2RvbWFpbi9lcnJvcnMudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvem9kL3Y0L2NvcmUvY29yZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS91dGlsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL2Vycm9ycy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS9wYXJzZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS9yZWdleGVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL2NoZWNrcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS9kb2MuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvem9kL3Y0L2NvcmUvdmVyc2lvbnMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvem9kL3Y0L2NvcmUvc2NoZW1hcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS9yZWdpc3RyaWVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3pvZC92NC9jb3JlL2FwaS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS90by1qc29uLXNjaGVtYS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY29yZS9qc29uLXNjaGVtYS1wcm9jZXNzb3JzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3pvZC92NC9jbGFzc2ljL2lzby5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy96b2QvdjQvY2xhc3NpYy9lcnJvcnMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvem9kL3Y0L2NsYXNzaWMvcGFyc2UuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvem9kL3Y0L2NsYXNzaWMvc2NoZW1hcy5qcyIsIi4uLy4uL3NyYy9kb21haW4vbm9ybWFsaXplLnRzIiwiLi4vLi4vc3JjL2RvbWFpbi9zYWZldHkudHMiLCIuLi8uLi9zcmMvZG9tYWluL3RyYXAudHMiLCIuLi8uLi9zcmMvZG9tYWluL3Byb2ZpbGUudHMiLCIuLi8uLi9zcmMvZG9tYWluL21lc3NhZ2VzLnRzIiwiLi4vLi4vc3JjL2RvbWFpbi91cmwtc3VwcG9ydC50cyIsIi4uLy4uL3NyYy9zdG9yYWdlL2FyZWEudHMiLCIuLi8uLi9zcmMvc3RvcmFnZS9rZXlzLnRzIiwiLi4vLi4vc3JjL3N0b3JhZ2UvcHJvZmlsZS1zdG9yZS50cyIsIi4uLy4uL3NyYy9zdG9yYWdlL3Nlc3Npb24tc3RvcmUudHMiLCIuLi8uLi9zcmMvc3RvcmFnZS9wcm92aWRlci1zZXR0aW5ncy50cyIsIi4uLy4uL3NyYy9zdG9yYWdlL3Byb3ZpZGVyLWNhY2hlLnRzIiwiLi4vLi4vc3JjL3Byb3ZpZGVyL2NsaWVudC50cyIsIi4uLy4uL3NyYy9wcm92aWRlci9nZW5lcmF0ZS13aXRoLWNhY2hlLnRzIiwiLi4vLi4vc3JjL2VudHJ5cG9pbnRzL2JhY2tncm91bmQudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQHdlYmV4dC1jb3JlL21hdGNoLXBhdHRlcm5zL2Rpc3QvaW5kZXgubWpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vI3JlZ2lvbiBzcmMvdXRpbHMvZGVmaW5lLWJhY2tncm91bmQudHNcbmZ1bmN0aW9uIGRlZmluZUJhY2tncm91bmQoYXJnKSB7XG5cdGlmIChhcmcgPT0gbnVsbCB8fCB0eXBlb2YgYXJnID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB7IG1haW46IGFyZyB9O1xuXHRyZXR1cm4gYXJnO1xufVxuLy8jZW5kcmVnaW9uXG5leHBvcnQgeyBkZWZpbmVCYWNrZ3JvdW5kIH07XG4iLCIvLyAjcmVnaW9uIHNuaXBwZXRcclxuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSBnbG9iYWxUaGlzLmJyb3dzZXI/LnJ1bnRpbWU/LmlkXHJcbiAgPyBnbG9iYWxUaGlzLmJyb3dzZXJcclxuICA6IGdsb2JhbFRoaXMuY2hyb21lO1xyXG4vLyAjZW5kcmVnaW9uIHNuaXBwZXRcclxuIiwiaW1wb3J0IHsgYnJvd3NlciBhcyBicm93c2VyJDEgfSBmcm9tIFwiQHd4dC1kZXYvYnJvd3NlclwiO1xuLy8jcmVnaW9uIHNyYy9icm93c2VyLnRzXG4vKipcbiogQ29udGFpbnMgdGhlIGBicm93c2VyYCBleHBvcnQgd2hpY2ggeW91IHNob3VsZCB1c2UgdG8gYWNjZXNzIHRoZSBleHRlbnNpb25cbiogQVBJcyBpbiB5b3VyIHByb2plY3Q6XG4qXG4qIGBgYHRzXG4qIGltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICd3eHQvYnJvd3Nlcic7XG4qXG4qIGJyb3dzZXIucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XG4qICAgLy8gLi4uXG4qIH0pO1xuKiBgYGBcbipcbiogQG1vZHVsZSB3eHQvYnJvd3NlclxuKi9cbmNvbnN0IGJyb3dzZXIgPSBicm93c2VyJDE7XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGJyb3dzZXIgfTtcbiIsIi8qKlxyXG4gKiBJZGVudGlmaWVyIGdlbmVyYXRpb24uXHJcbiAqXHJcbiAqIGBzZXNzaW9uSWRgIGlzIG1pbnRlZCBwZXIgYWN0aXZhdGlvbjsgYGludGVyYWN0aW9uSWRgIHBlciBhbnN3ZXIuIEJvdGggYXJlXHJcbiAqIHJhbmRvbSBhbmQgbG9jYWwg4oCUIHRoZXkgYXJlIG5ldmVyIHNlbnQgYW55d2hlcmUgYW5kIGFyZSBub3Qgc3RhYmxlIGFjcm9zc1xyXG4gKiBpbnN0YWxscywgc28gdGhleSBjYW5ub3QgaWRlbnRpZnkgYSB1c2VyLlxyXG4gKi9cclxuXHJcbmNvbnN0IElEX0FMUEhBQkVUID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSc7XHJcblxyXG5mdW5jdGlvbiByYW5kb21Ub2tlbihsZW5ndGg6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShsZW5ndGgpO1xyXG4gIGdsb2JhbFRoaXMuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhieXRlcyk7XHJcbiAgbGV0IG91dCA9ICcnO1xyXG4gIGZvciAoY29uc3QgYnl0ZSBvZiBieXRlcykge1xyXG4gICAgb3V0ICs9IElEX0FMUEhBQkVUW2J5dGUgJSBJRF9BTFBIQUJFVC5sZW5ndGhdO1xyXG4gIH1cclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2Vzc2lvbklkKCk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGBzZXNfJHtyYW5kb21Ub2tlbigxNil9YDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUludGVyYWN0aW9uSWQoKTogc3RyaW5nIHtcclxuICByZXR1cm4gYGludF8ke3JhbmRvbVRva2VuKDE2KX1gO1xyXG59XHJcblxyXG4vKipcclxuICogRGV0ZXJtaW5pc3RpYyBpZCBmb3IgYSBwbGFjZWQgdHJhcDogY29uY2VwdCBwbHVzIHdoZXJlIGl0IGxhbmRlZC4gVHdvIHJ1bnNcclxuICogb3ZlciB0aGUgc2FtZSBhcnRpY2xlIHByb2R1Y2UgdGhlIHNhbWUgaWRzLCB3aGljaCBpcyB3aGF0IGtlZXBzIHRoZSBFMkVcclxuICogYXNzZXJ0aW9ucyBhbmQgdGhlIHNlbGVjdGlvbiB0aWUtYnJlYWsgc3RhYmxlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYXBJZChjb25jZXB0SWQ6IHN0cmluZywgYmxvY2tJbmRleDogbnVtYmVyLCBvZmZzZXQ6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGAke2NvbmNlcHRJZH1AJHtibG9ja0luZGV4fToke29mZnNldH1gO1xyXG59XHJcblxyXG4vKiogQSBzaG9ydCwgc3RhYmxlLCBub24tY3J5cHRvZ3JhcGhpYyBoYXNoLiBVc2VkIGZvciBjYWNoZSBrZXlzIG9ubHkuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBzdGFibGVIYXNoKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGxldCBoMSA9IDB4ODExYzlkYzU7XHJcbiAgbGV0IGgyID0gMHgwMTAwMDE5MztcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICBjb25zdCBjb2RlID0gdmFsdWUuY2hhckNvZGVBdChpKTtcclxuICAgIGgxID0gTWF0aC5pbXVsKGgxIF4gY29kZSwgMHgwMTAwMDE5Myk7XHJcbiAgICBoMiA9IE1hdGguaW11bChoMiArIGNvZGUsIDB4ODVlYmNhNmIpIF4gKGgyID4+PiAxMyk7XHJcbiAgfVxyXG4gIGNvbnN0IGEgPSAoaDEgPj4+IDApLnRvU3RyaW5nKDM2KTtcclxuICBjb25zdCBiID0gKGgyID4+PiAwKS50b1N0cmluZygzNik7XHJcbiAgcmV0dXJuIGAke2F9JHtifWA7XHJcbn1cclxuIiwiLyoqXHJcbiAqIFR5cGVkIGZhaWx1cmUgdm9jYWJ1bGFyeSBzaGFyZWQgYnkgdGhlIHBvcHVwLCBiYWNrZ3JvdW5kIHdvcmtlciwgY29udGVudFxyXG4gKiBydW50aW1lIGFuZCB0aGUgb3B0aW9uYWwgZ2VuZXJhdGlvbiBBUEkuXHJcbiAqXHJcbiAqIEV2ZXJ5IGJvdW5kYXJ5IGluIEVjbGlwc2UgcmV0dXJucyBhIGBSZXN1bHRgLCBuZXZlciBhIHRocm93biB2YWx1ZS4gQ2FsbGVyc1xyXG4gKiBicmFuY2ggb24gYG9rYCBhbmQsIHdoZW4gaXQgaXMgYGZhbHNlYCwgb24gYGVycm9yLmNvZGVgLlxyXG4gKi9cclxuXHJcbmV4cG9ydCBjb25zdCBFUlJPUl9DT0RFUyA9IFtcclxuICAnVU5TVVBQT1JURURfVVJMJyxcclxuICAnTk9fQVJUSUNMRScsXHJcbiAgJ05PX0VMSUdJQkxFX1RSQVBTJyxcclxuICAnQ09OVEVOVF9TQ1JJUFRfVU5BVkFJTEFCTEUnLFxyXG4gICdTRVNTSU9OX1JFUExBQ0VEJyxcclxuICAnRE9NX0lOVkFMSURBVEVEJyxcclxuICAnU1RPUkFHRV9FUlJPUicsXHJcbiAgJ1BST0ZJTEVfSU5DT01QQVRJQkxFJyxcclxuICAnUFJPVklERVJfRElTQUJMRUQnLFxyXG4gICdQUk9WSURFUl9QRVJNSVNTSU9OX0RFTklFRCcsXHJcbiAgJ1BST1ZJREVSX1VOQVZBSUxBQkxFJyxcclxuICAnUFJPVklERVJfVElNRU9VVCcsXHJcbiAgJ1BST1ZJREVSX0lOVkFMSURfUkVTUE9OU0UnLFxyXG4gICdVTktOT1dOX0VSUk9SJyxcclxuXSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCB0eXBlIEVycm9yQ29kZSA9ICh0eXBlb2YgRVJST1JfQ09ERVMpW251bWJlcl07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVjbGlwc2VGYWlsdXJlRGV0YWlsIHtcclxuICBjb2RlOiBFcnJvckNvZGU7XHJcbiAgbWVzc2FnZTogc3RyaW5nO1xyXG4gIHJlY292ZXJhYmxlOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgdHlwZSBTdWNjZXNzPFQ+ID0geyBvazogdHJ1ZTsgZGF0YTogVCB9O1xyXG5cclxuZXhwb3J0IHR5cGUgRmFpbHVyZSA9IHsgb2s6IGZhbHNlOyBlcnJvcjogRWNsaXBzZUZhaWx1cmVEZXRhaWwgfTtcclxuXHJcbmV4cG9ydCB0eXBlIFJlc3VsdDxUPiA9IFN1Y2Nlc3M8VD4gfCBGYWlsdXJlO1xyXG5cclxuLyoqXHJcbiAqIFdoZXRoZXIgYSBjb2RlIGRlc2NyaWJlcyBhIGNvbmRpdGlvbiB0aGUgdXNlciBjYW4gYWN0IG9uIHdpdGhvdXQgcmVsb2FkaW5nXHJcbiAqIHRoZSBleHRlbnNpb24uIFJlY292ZXJhYmxlIGZhaWx1cmVzIGFyZSBzdXJmYWNlZCBhcyBpbmxpbmUgcG9wdXAgc3RhdHVzO1xyXG4gKiB1bnJlY292ZXJhYmxlIG9uZXMgZW5kIHRoZSBzZXNzaW9uLlxyXG4gKi9cclxuY29uc3QgUkVDT1ZFUkFCTEVfQllfREVGQVVMVDogUmVhZG9ubHk8UmVjb3JkPEVycm9yQ29kZSwgYm9vbGVhbj4+ID0ge1xyXG4gIFVOU1VQUE9SVEVEX1VSTDogdHJ1ZSxcclxuICBOT19BUlRJQ0xFOiB0cnVlLFxyXG4gIE5PX0VMSUdJQkxFX1RSQVBTOiB0cnVlLFxyXG4gIENPTlRFTlRfU0NSSVBUX1VOQVZBSUxBQkxFOiB0cnVlLFxyXG4gIFNFU1NJT05fUkVQTEFDRUQ6IHRydWUsXHJcbiAgRE9NX0lOVkFMSURBVEVEOiBmYWxzZSxcclxuICBTVE9SQUdFX0VSUk9SOiB0cnVlLFxyXG4gIFBST0ZJTEVfSU5DT01QQVRJQkxFOiBmYWxzZSxcclxuICBQUk9WSURFUl9ESVNBQkxFRDogdHJ1ZSxcclxuICBQUk9WSURFUl9QRVJNSVNTSU9OX0RFTklFRDogdHJ1ZSxcclxuICBQUk9WSURFUl9VTkFWQUlMQUJMRTogdHJ1ZSxcclxuICBQUk9WSURFUl9USU1FT1VUOiB0cnVlLFxyXG4gIFBST1ZJREVSX0lOVkFMSURfUkVTUE9OU0U6IHRydWUsXHJcbiAgVU5LTk9XTl9FUlJPUjogZmFsc2UsXHJcbn07XHJcblxyXG4vKiogSHVtYW4tcmVhZGFibGUgZGVmYXVsdCBjb3B5LiBDYWxsZXJzIG1heSBvdmVycmlkZSB3aXRoIHNvbWV0aGluZyBzcGVjaWZpYy4gKi9cclxuY29uc3QgREVGQVVMVF9NRVNTQUdFOiBSZWFkb25seTxSZWNvcmQ8RXJyb3JDb2RlLCBzdHJpbmc+PiA9IHtcclxuICBVTlNVUFBPUlRFRF9VUkw6ICdFY2xpcHNlIG9ubHkgcnVucyBvbiByZWd1bGFyIGh0dHAocykgd2ViIHBhZ2VzLicsXHJcbiAgTk9fQVJUSUNMRTogJ05vIHJlYWRhYmxlIGFydGljbGUgd2FzIGZvdW5kIG9uIHRoaXMgcGFnZS4nLFxyXG4gIE5PX0VMSUdJQkxFX1RSQVBTOiAnTm8gRnJlbmNoIGNvbnRleHQgdHJhcHMgZml0IHRoaXMgYXJ0aWNsZSB5ZXQuJyxcclxuICBDT05URU5UX1NDUklQVF9VTkFWQUlMQUJMRTogJ0VjbGlwc2UgY291bGQgbm90IGF0dGFjaCB0byB0aGlzIHRhYi4gUmVsb2FkIHRoZSBwYWdlIGFuZCByZXRyeS4nLFxyXG4gIFNFU1NJT05fUkVQTEFDRUQ6ICdFY2xpcHNlIG1vdmVkIHRvIGFub3RoZXIgdGFiLicsXHJcbiAgRE9NX0lOVkFMSURBVEVEOiAnVGhlIHBhZ2UgY2hhbmdlZCB1bmRlcm5lYXRoIEVjbGlwc2UsIHNvIHRoZSBzZXNzaW9uIHdhcyBlbmRlZCBzYWZlbHkuJyxcclxuICBTVE9SQUdFX0VSUk9SOiAnWW91ciBwcm9ncmVzcyBjb3VsZCBub3QgYmUgc2F2ZWQuJyxcclxuICBQUk9GSUxFX0lOQ09NUEFUSUJMRTogJ1NhdmVkIGxlYXJuaW5nIGRhdGEgd2FzIHdyaXR0ZW4gYnkgYSBuZXdlciB2ZXJzaW9uIG9mIEVjbGlwc2UuJyxcclxuICBQUk9WSURFUl9ESVNBQkxFRDogJ0FJLWdlbmVyYXRlZCB0cmFwcyBhcmUgdHVybmVkIG9mZi4nLFxyXG4gIFBST1ZJREVSX1BFUk1JU1NJT05fREVOSUVEOiAnUGVybWlzc2lvbiBmb3IgdGhlIGxvY2FsIGdlbmVyYXRpb24gQVBJIHdhcyBub3QgZ3JhbnRlZC4nLFxyXG4gIFBST1ZJREVSX1VOQVZBSUxBQkxFOiAnVGhlIGxvY2FsIGdlbmVyYXRpb24gQVBJIGlzIG5vdCByZWFjaGFibGUuJyxcclxuICBQUk9WSURFUl9USU1FT1VUOiAnVGhlIGxvY2FsIGdlbmVyYXRpb24gQVBJIHRvb2sgdG9vIGxvbmcuJyxcclxuICBQUk9WSURFUl9JTlZBTElEX1JFU1BPTlNFOiAnVGhlIGxvY2FsIGdlbmVyYXRpb24gQVBJIHJldHVybmVkIHNvbWV0aGluZyBFY2xpcHNlIGNhbm5vdCB0cnVzdC4nLFxyXG4gIFVOS05PV05fRVJST1I6ICdTb21ldGhpbmcgdW5leHBlY3RlZCBoYXBwZW5lZC4nLFxyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3M8VD4oZGF0YTogVCk6IFN1Y2Nlc3M8VD4ge1xyXG4gIHJldHVybiB7IG9rOiB0cnVlLCBkYXRhIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmYWlsdXJlKGNvZGU6IEVycm9yQ29kZSwgbWVzc2FnZT86IHN0cmluZywgcmVjb3ZlcmFibGU/OiBib29sZWFuKTogRmFpbHVyZSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG9rOiBmYWxzZSxcclxuICAgIGVycm9yOiB7XHJcbiAgICAgIGNvZGUsXHJcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UgPz8gREVGQVVMVF9NRVNTQUdFW2NvZGVdLFxyXG4gICAgICByZWNvdmVyYWJsZTogcmVjb3ZlcmFibGUgPz8gUkVDT1ZFUkFCTEVfQllfREVGQVVMVFtjb2RlXSxcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG5cclxuLyoqIEFuIGVycm9yIGNhcnJ5aW5nIGFuIEVjbGlwc2UgY29kZSwgZm9yIHRoZSBmZXcgcGxhY2VzIGEgdGhyb3cgaXMgbmF0dXJhbC4gKi9cclxuZXhwb3J0IGNsYXNzIEVjbGlwc2VFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICByZWFkb25seSBjb2RlOiBFcnJvckNvZGU7XHJcbiAgcmVhZG9ubHkgcmVjb3ZlcmFibGU6IGJvb2xlYW47XHJcblxyXG4gIGNvbnN0cnVjdG9yKGNvZGU6IEVycm9yQ29kZSwgbWVzc2FnZT86IHN0cmluZywgcmVjb3ZlcmFibGU/OiBib29sZWFuKSB7XHJcbiAgICBzdXBlcihtZXNzYWdlID8/IERFRkFVTFRfTUVTU0FHRVtjb2RlXSk7XHJcbiAgICB0aGlzLm5hbWUgPSAnRWNsaXBzZUVycm9yJztcclxuICAgIHRoaXMuY29kZSA9IGNvZGU7XHJcbiAgICB0aGlzLnJlY292ZXJhYmxlID0gcmVjb3ZlcmFibGUgPz8gUkVDT1ZFUkFCTEVfQllfREVGQVVMVFtjb2RlXTtcclxuICB9XHJcblxyXG4gIHRvRmFpbHVyZSgpOiBGYWlsdXJlIHtcclxuICAgIHJldHVybiBmYWlsdXJlKHRoaXMuY29kZSwgdGhpcy5tZXNzYWdlLCB0aGlzLnJlY292ZXJhYmxlKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0Vycm9yQ29kZSh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIEVycm9yQ29kZSB7XHJcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgKEVSUk9SX0NPREVTIGFzIHJlYWRvbmx5IHN0cmluZ1tdKS5pbmNsdWRlcyh2YWx1ZSk7XHJcbn1cclxuXHJcbi8qKiBOb3JtYWxpc2UgYW55dGhpbmcgY2F1Z2h0IGluIGEgYGNhdGNoYCBpbnRvIGEgYEZhaWx1cmVgLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9GYWlsdXJlKGNhdXNlOiB1bmtub3duLCBmYWxsYmFjazogRXJyb3JDb2RlID0gJ1VOS05PV05fRVJST1InKTogRmFpbHVyZSB7XHJcbiAgaWYgKGNhdXNlIGluc3RhbmNlb2YgRWNsaXBzZUVycm9yKSByZXR1cm4gY2F1c2UudG9GYWlsdXJlKCk7XHJcbiAgaWYgKGNhdXNlIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiBmYWlsdXJlKGZhbGxiYWNrLCBjYXVzZS5tZXNzYWdlKTtcclxuICByZXR1cm4gZmFpbHVyZShmYWxsYmFjayk7XHJcbn1cclxuIiwidmFyIF9hO1xyXG4vKiogQSBzcGVjaWFsIGNvbnN0YW50IHdpdGggdHlwZSBgbmV2ZXJgICovXHJcbmV4cG9ydCBjb25zdCBORVZFUiA9IC8qQF9fUFVSRV9fKi8gT2JqZWN0LmZyZWV6ZSh7XHJcbiAgICBzdGF0dXM6IFwiYWJvcnRlZFwiLFxyXG59KTtcclxuZXhwb3J0IC8qQF9fTk9fU0lERV9FRkZFQ1RTX18qLyBmdW5jdGlvbiAkY29uc3RydWN0b3IobmFtZSwgaW5pdGlhbGl6ZXIsIHBhcmFtcykge1xyXG4gICAgZnVuY3Rpb24gaW5pdChpbnN0LCBkZWYpIHtcclxuICAgICAgICBpZiAoIWluc3QuX3pvZCkge1xyXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5zdCwgXCJfem9kXCIsIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0cjogXyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFpdHM6IG5ldyBTZXQoKSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnN0Ll96b2QudHJhaXRzLmhhcyhuYW1lKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluc3QuX3pvZC50cmFpdHMuYWRkKG5hbWUpO1xyXG4gICAgICAgIGluaXRpYWxpemVyKGluc3QsIGRlZik7XHJcbiAgICAgICAgLy8gc3VwcG9ydCBwcm90b3R5cGUgbW9kaWZpY2F0aW9uc1xyXG4gICAgICAgIGNvbnN0IHByb3RvID0gXy5wcm90b3R5cGU7XHJcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHByb3RvKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgayA9IGtleXNbaV07XHJcbiAgICAgICAgICAgIGlmICghKGsgaW4gaW5zdCkpIHtcclxuICAgICAgICAgICAgICAgIGluc3Rba10gPSBwcm90b1trXS5iaW5kKGluc3QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gZG9lc24ndCB3b3JrIGlmIFBhcmVudCBoYXMgYSBjb25zdHJ1Y3RvciB3aXRoIGFyZ3VtZW50c1xyXG4gICAgY29uc3QgUGFyZW50ID0gcGFyYW1zPy5QYXJlbnQgPz8gT2JqZWN0O1xyXG4gICAgY2xhc3MgRGVmaW5pdGlvbiBleHRlbmRzIFBhcmVudCB7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRGVmaW5pdGlvbiwgXCJuYW1lXCIsIHsgdmFsdWU6IG5hbWUgfSk7XHJcbiAgICBmdW5jdGlvbiBfKGRlZikge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICBjb25zdCBpbnN0ID0gcGFyYW1zPy5QYXJlbnQgPyBuZXcgRGVmaW5pdGlvbigpIDogdGhpcztcclxuICAgICAgICBpbml0KGluc3QsIGRlZik7XHJcbiAgICAgICAgKF9hID0gaW5zdC5fem9kKS5kZWZlcnJlZCA/PyAoX2EuZGVmZXJyZWQgPSBbXSk7XHJcbiAgICAgICAgZm9yIChjb25zdCBmbiBvZiBpbnN0Ll96b2QuZGVmZXJyZWQpIHtcclxuICAgICAgICAgICAgZm4oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGluc3Q7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXywgXCJpbml0XCIsIHsgdmFsdWU6IGluaXQgfSk7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXywgU3ltYm9sLmhhc0luc3RhbmNlLCB7XHJcbiAgICAgICAgdmFsdWU6IChpbnN0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChwYXJhbXM/LlBhcmVudCAmJiBpbnN0IGluc3RhbmNlb2YgcGFyYW1zLlBhcmVudClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm4gaW5zdD8uX3pvZD8udHJhaXRzPy5oYXMobmFtZSk7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF8sIFwibmFtZVwiLCB7IHZhbHVlOiBuYW1lIH0pO1xyXG4gICAgcmV0dXJuIF87XHJcbn1cclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vICAgVVRJTElUSUVTICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbmV4cG9ydCBjb25zdCAkYnJhbmQgPSBTeW1ib2woXCJ6b2RfYnJhbmRcIik7XHJcbmV4cG9ydCBjbGFzcyAkWm9kQXN5bmNFcnJvciBleHRlbmRzIEVycm9yIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKGBFbmNvdW50ZXJlZCBQcm9taXNlIGR1cmluZyBzeW5jaHJvbm91cyBwYXJzZS4gVXNlIC5wYXJzZUFzeW5jKCkgaW5zdGVhZC5gKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgJFpvZEVuY29kZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gICAgY29uc3RydWN0b3IobmFtZSkge1xyXG4gICAgICAgIHN1cGVyKGBFbmNvdW50ZXJlZCB1bmlkaXJlY3Rpb25hbCB0cmFuc2Zvcm0gZHVyaW5nIGVuY29kZTogJHtuYW1lfWApO1xyXG4gICAgICAgIHRoaXMubmFtZSA9IFwiWm9kRW5jb2RlRXJyb3JcIjtcclxuICAgIH1cclxufVxyXG4oX2EgPSBnbG9iYWxUaGlzKS5fX3pvZF9nbG9iYWxDb25maWcgPz8gKF9hLl9fem9kX2dsb2JhbENvbmZpZyA9IHt9KTtcclxuZXhwb3J0IGNvbnN0IGdsb2JhbENvbmZpZyA9IGdsb2JhbFRoaXMuX196b2RfZ2xvYmFsQ29uZmlnO1xyXG5leHBvcnQgZnVuY3Rpb24gY29uZmlnKG5ld0NvbmZpZykge1xyXG4gICAgaWYgKG5ld0NvbmZpZylcclxuICAgICAgICBPYmplY3QuYXNzaWduKGdsb2JhbENvbmZpZywgbmV3Q29uZmlnKTtcclxuICAgIHJldHVybiBnbG9iYWxDb25maWc7XHJcbn1cclxuIiwiaW1wb3J0IHsgZ2xvYmFsQ29uZmlnIH0gZnJvbSBcIi4vY29yZS5qc1wiO1xyXG4vLyBmdW5jdGlvbnNcclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEVxdWFsKHZhbCkge1xyXG4gICAgcmV0dXJuIHZhbDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0Tm90RXF1YWwodmFsKSB7XHJcbiAgICByZXR1cm4gdmFsO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRJcyhfYXJnKSB7IH1cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5ldmVyKF94KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHZhbHVlIGluIGV4aGF1c3RpdmUgY2hlY2tcIik7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChfKSB7IH1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEVudW1WYWx1ZXMoZW50cmllcykge1xyXG4gICAgY29uc3QgbnVtZXJpY1ZhbHVlcyA9IE9iamVjdC52YWx1ZXMoZW50cmllcykuZmlsdGVyKCh2KSA9PiB0eXBlb2YgdiA9PT0gXCJudW1iZXJcIik7XHJcbiAgICBjb25zdCB2YWx1ZXMgPSBPYmplY3QuZW50cmllcyhlbnRyaWVzKVxyXG4gICAgICAgIC5maWx0ZXIoKFtrLCBfXSkgPT4gbnVtZXJpY1ZhbHVlcy5pbmRleE9mKCtrKSA9PT0gLTEpXHJcbiAgICAgICAgLm1hcCgoW18sIHZdKSA9PiB2KTtcclxuICAgIHJldHVybiB2YWx1ZXM7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGpvaW5WYWx1ZXMoYXJyYXksIHNlcGFyYXRvciA9IFwifFwiKSB7XHJcbiAgICByZXR1cm4gYXJyYXkubWFwKCh2YWwpID0+IHN0cmluZ2lmeVByaW1pdGl2ZSh2YWwpKS5qb2luKHNlcGFyYXRvcik7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGpzb25TdHJpbmdpZnlSZXBsYWNlcihfLCB2YWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJiaWdpbnRcIilcclxuICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcclxuICAgIHJldHVybiB2YWx1ZTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY2FjaGVkKGdldHRlcikge1xyXG4gICAgY29uc3Qgc2V0ID0gZmFsc2U7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldCB2YWx1ZSgpIHtcclxuICAgICAgICAgICAgaWYgKCFzZXQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZ2V0dGVyKCk7XHJcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJ2YWx1ZVwiLCB7IHZhbHVlIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhY2hlZCB2YWx1ZSBhbHJlYWR5IHNldFwiKTtcclxuICAgICAgICB9LFxyXG4gICAgfTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbnVsbGlzaChpbnB1dCkge1xyXG4gICAgcmV0dXJuIGlucHV0ID09PSBudWxsIHx8IGlucHV0ID09PSB1bmRlZmluZWQ7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuUmVnZXgoc291cmNlKSB7XHJcbiAgICBjb25zdCBzdGFydCA9IHNvdXJjZS5zdGFydHNXaXRoKFwiXlwiKSA/IDEgOiAwO1xyXG4gICAgY29uc3QgZW5kID0gc291cmNlLmVuZHNXaXRoKFwiJFwiKSA/IHNvdXJjZS5sZW5ndGggLSAxIDogc291cmNlLmxlbmd0aDtcclxuICAgIHJldHVybiBzb3VyY2Uuc2xpY2Uoc3RhcnQsIGVuZCk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGZsb2F0U2FmZVJlbWFpbmRlcih2YWwsIHN0ZXApIHtcclxuICAgIGNvbnN0IHJhdGlvID0gdmFsIC8gc3RlcDtcclxuICAgIGNvbnN0IHJvdW5kZWRSYXRpbyA9IE1hdGgucm91bmQocmF0aW8pO1xyXG4gICAgLy8gVXNlIGEgcmVsYXRpdmUgZXBzaWxvbiBzY2FsZWQgdG8gdGhlIG1hZ25pdHVkZSBvZiB0aGUgcmVzdWx0XHJcbiAgICBjb25zdCB0b2xlcmFuY2UgPSBOdW1iZXIuRVBTSUxPTiAqIE1hdGgubWF4KE1hdGguYWJzKHJhdGlvKSwgMSk7XHJcbiAgICBpZiAoTWF0aC5hYnMocmF0aW8gLSByb3VuZGVkUmF0aW8pIDwgdG9sZXJhbmNlKVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgcmV0dXJuIHJhdGlvIC0gcm91bmRlZFJhdGlvO1xyXG59XHJcbmNvbnN0IEVWQUxVQVRJTkcgPSAvKiBAX19QVVJFX18qLyBTeW1ib2woXCJldmFsdWF0aW5nXCIpO1xyXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lTGF6eShvYmplY3QsIGtleSwgZ2V0dGVyKSB7XHJcbiAgICBsZXQgdmFsdWUgPSB1bmRlZmluZWQ7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcclxuICAgICAgICBnZXQoKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gRVZBTFVBVElORykge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2lyY3VsYXIgcmVmZXJlbmNlIGRldGVjdGVkLCByZXR1cm4gdW5kZWZpbmVkIHRvIGJyZWFrIHRoZSBjeWNsZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBFVkFMVUFUSU5HO1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBnZXR0ZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQodikge1xyXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB2LFxyXG4gICAgICAgICAgICAgICAgLy8gY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gb2JqZWN0W2tleV0gPSB2O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdENsb25lKG9iaikge1xyXG4gICAgcmV0dXJuIE9iamVjdC5jcmVhdGUoT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaiksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKG9iaikpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ25Qcm9wKHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3AsIHtcclxuICAgICAgICB2YWx1ZSxcclxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcclxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZURlZnMoLi4uZGVmcykge1xyXG4gICAgY29uc3QgbWVyZ2VkRGVzY3JpcHRvcnMgPSB7fTtcclxuICAgIGZvciAoY29uc3QgZGVmIG9mIGRlZnMpIHtcclxuICAgICAgICBjb25zdCBkZXNjcmlwdG9ycyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGRlZik7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihtZXJnZWREZXNjcmlwdG9ycywgZGVzY3JpcHRvcnMpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHt9LCBtZXJnZWREZXNjcmlwdG9ycyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lRGVmKHNjaGVtYSkge1xyXG4gICAgcmV0dXJuIG1lcmdlRGVmcyhzY2hlbWEuX3pvZC5kZWYpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50QXRQYXRoKG9iaiwgcGF0aCkge1xyXG4gICAgaWYgKCFwYXRoKVxyXG4gICAgICAgIHJldHVybiBvYmo7XHJcbiAgICByZXR1cm4gcGF0aC5yZWR1Y2UoKGFjYywga2V5KSA9PiBhY2M/LltrZXldLCBvYmopO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBwcm9taXNlQWxsT2JqZWN0KHByb21pc2VzT2JqKSB7XHJcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMocHJvbWlzZXNPYmopO1xyXG4gICAgY29uc3QgcHJvbWlzZXMgPSBrZXlzLm1hcCgoa2V5KSA9PiBwcm9taXNlc09ialtrZXldKTtcclxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbigocmVzdWx0cykgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJlc29sdmVkT2JqID0ge307XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmVkT2JqW2tleXNbaV1dID0gcmVzdWx0c1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc29sdmVkT2JqO1xyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbVN0cmluZyhsZW5ndGggPSAxMCkge1xyXG4gICAgY29uc3QgY2hhcnMgPSBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCI7XHJcbiAgICBsZXQgc3RyID0gXCJcIjtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBzdHIgKz0gY2hhcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2hhcnMubGVuZ3RoKV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RyO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBlc2Moc3RyKSB7XHJcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc3RyKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc2x1Z2lmeShpbnB1dCkge1xyXG4gICAgcmV0dXJuIGlucHV0XHJcbiAgICAgICAgLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAudHJpbSgpXHJcbiAgICAgICAgLnJlcGxhY2UoL1teXFx3XFxzLV0vZywgXCJcIilcclxuICAgICAgICAucmVwbGFjZSgvW1xcc18tXSsvZywgXCItXCIpXHJcbiAgICAgICAgLnJlcGxhY2UoL14tK3wtKyQvZywgXCJcIik7XHJcbn1cclxuZXhwb3J0IGNvbnN0IGNhcHR1cmVTdGFja1RyYWNlID0gKFwiY2FwdHVyZVN0YWNrVHJhY2VcIiBpbiBFcnJvciA/IEVycm9yLmNhcHR1cmVTdGFja1RyYWNlIDogKC4uLl9hcmdzKSA9PiB7IH0pO1xyXG5leHBvcnQgZnVuY3Rpb24gaXNPYmplY3QoZGF0YSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBkYXRhID09PSBcIm9iamVjdFwiICYmIGRhdGEgIT09IG51bGwgJiYgIUFycmF5LmlzQXJyYXkoZGF0YSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IGFsbG93c0V2YWwgPSAvKiBAX19QVVJFX18qLyBjYWNoZWQoKCkgPT4ge1xyXG4gICAgLy8gU2tpcCB0aGUgcHJvYmUgdW5kZXIgYGppdGxlc3NgOiBzdHJpY3QgQ1NQcyByZXBvcnQgdGhlIGNhdWdodCBgbmV3IEZ1bmN0aW9uYFxyXG4gICAgLy8gYXMgYSBgc2VjdXJpdHlwb2xpY3l2aW9sYXRpb25gIGV2ZW4gdGhvdWdoIHRoZSB0aHJvdyBpcyBzd2FsbG93ZWQuXHJcbiAgICBpZiAoZ2xvYmFsQ29uZmlnLmppdGxlc3MpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICAvLyBAdHMtaWdub3JlXHJcbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiBuYXZpZ2F0b3I/LnVzZXJBZ2VudD8uaW5jbHVkZXMoXCJDbG91ZGZsYXJlXCIpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBGID0gRnVuY3Rpb247XHJcbiAgICAgICAgbmV3IEYoXCJcIik7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoXykge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG8pIHtcclxuICAgIGlmIChpc09iamVjdChvKSA9PT0gZmFsc2UpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgLy8gbW9kaWZpZWQgY29uc3RydWN0b3JcclxuICAgIGNvbnN0IGN0b3IgPSBvLmNvbnN0cnVjdG9yO1xyXG4gICAgaWYgKGN0b3IgPT09IHVuZGVmaW5lZClcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIGlmICh0eXBlb2YgY3RvciAhPT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgLy8gbW9kaWZpZWQgcHJvdG90eXBlXHJcbiAgICBjb25zdCBwcm90ID0gY3Rvci5wcm90b3R5cGU7XHJcbiAgICBpZiAoaXNPYmplY3QocHJvdCkgPT09IGZhbHNlKVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIC8vIGN0b3IgZG9lc24ndCBoYXZlIHN0YXRpYyBgaXNQcm90b3R5cGVPZmBcclxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocHJvdCwgXCJpc1Byb3RvdHlwZU9mXCIpID09PSBmYWxzZSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzaGFsbG93Q2xvbmUobykge1xyXG4gICAgaWYgKGlzUGxhaW5PYmplY3QobykpXHJcbiAgICAgICAgcmV0dXJuIHsgLi4ubyB9O1xyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobykpXHJcbiAgICAgICAgcmV0dXJuIFsuLi5vXTtcclxuICAgIGlmIChvIGluc3RhbmNlb2YgTWFwKVxyXG4gICAgICAgIHJldHVybiBuZXcgTWFwKG8pO1xyXG4gICAgaWYgKG8gaW5zdGFuY2VvZiBTZXQpXHJcbiAgICAgICAgcmV0dXJuIG5ldyBTZXQobyk7XHJcbiAgICByZXR1cm4gbztcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbnVtS2V5cyhkYXRhKSB7XHJcbiAgICBsZXQga2V5Q291bnQgPSAwO1xyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gZGF0YSkge1xyXG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KSkge1xyXG4gICAgICAgICAgICBrZXlDb3VudCsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBrZXlDb3VudDtcclxufVxyXG5leHBvcnQgY29uc3QgZ2V0UGFyc2VkVHlwZSA9IChkYXRhKSA9PiB7XHJcbiAgICBjb25zdCB0ID0gdHlwZW9mIGRhdGE7XHJcbiAgICBzd2l0Y2ggKHQpIHtcclxuICAgICAgICBjYXNlIFwidW5kZWZpbmVkXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBcInVuZGVmaW5lZFwiO1xyXG4gICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwic3RyaW5nXCI7XHJcbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxyXG4gICAgICAgICAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGRhdGEpID8gXCJuYW5cIiA6IFwibnVtYmVyXCI7XHJcbiAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiYm9vbGVhblwiO1xyXG4gICAgICAgIGNhc2UgXCJmdW5jdGlvblwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJmdW5jdGlvblwiO1xyXG4gICAgICAgIGNhc2UgXCJiaWdpbnRcIjpcclxuICAgICAgICAgICAgcmV0dXJuIFwiYmlnaW50XCI7XHJcbiAgICAgICAgY2FzZSBcInN5bWJvbFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gXCJzeW1ib2xcIjtcclxuICAgICAgICBjYXNlIFwib2JqZWN0XCI6XHJcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJhcnJheVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJudWxsXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRhdGEudGhlbiAmJiB0eXBlb2YgZGF0YS50aGVuID09PSBcImZ1bmN0aW9uXCIgJiYgZGF0YS5jYXRjaCAmJiB0eXBlb2YgZGF0YS5jYXRjaCA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJwcm9taXNlXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBNYXAgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIE1hcCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibWFwXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBTZXQgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIFNldCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwic2V0XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBEYXRlICE9PSBcInVuZGVmaW5lZFwiICYmIGRhdGEgaW5zdGFuY2VvZiBEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJkYXRlXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIEZpbGUgIT09IFwidW5kZWZpbmVkXCIgJiYgZGF0YSBpbnN0YW5jZW9mIEZpbGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImZpbGVcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gXCJvYmplY3RcIjtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gZGF0YSB0eXBlOiAke3R9YCk7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCBwcm9wZXJ0eUtleVR5cGVzID0gLyogQF9fUFVSRV9fKi8gbmV3IFNldChbXCJzdHJpbmdcIiwgXCJudW1iZXJcIiwgXCJzeW1ib2xcIl0pO1xyXG5leHBvcnQgY29uc3QgcHJpbWl0aXZlVHlwZXMgPSAvKiBAX19QVVJFX18qLyBuZXcgU2V0KFtcclxuICAgIFwic3RyaW5nXCIsXHJcbiAgICBcIm51bWJlclwiLFxyXG4gICAgXCJiaWdpbnRcIixcclxuICAgIFwiYm9vbGVhblwiLFxyXG4gICAgXCJzeW1ib2xcIixcclxuICAgIFwidW5kZWZpbmVkXCIsXHJcbl0pO1xyXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlUmVnZXgoc3RyKSB7XHJcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcclxufVxyXG4vLyB6b2Qtc3BlY2lmaWMgdXRpbHNcclxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGluc3QsIGRlZiwgcGFyYW1zKSB7XHJcbiAgICBjb25zdCBjbCA9IG5ldyBpbnN0Ll96b2QuY29uc3RyKGRlZiA/PyBpbnN0Ll96b2QuZGVmKTtcclxuICAgIGlmICghZGVmIHx8IHBhcmFtcz8ucGFyZW50KVxyXG4gICAgICAgIGNsLl96b2QucGFyZW50ID0gaW5zdDtcclxuICAgIHJldHVybiBjbDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUGFyYW1zKF9wYXJhbXMpIHtcclxuICAgIGNvbnN0IHBhcmFtcyA9IF9wYXJhbXM7XHJcbiAgICBpZiAoIXBhcmFtcylcclxuICAgICAgICByZXR1cm4ge307XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gXCJzdHJpbmdcIilcclxuICAgICAgICByZXR1cm4geyBlcnJvcjogKCkgPT4gcGFyYW1zIH07XHJcbiAgICBpZiAocGFyYW1zPy5tZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBpZiAocGFyYW1zPy5lcnJvciAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgc3BlY2lmeSBib3RoIGBtZXNzYWdlYCBhbmQgYGVycm9yYCBwYXJhbXNcIik7XHJcbiAgICAgICAgcGFyYW1zLmVycm9yID0gcGFyYW1zLm1lc3NhZ2U7XHJcbiAgICB9XHJcbiAgICBkZWxldGUgcGFyYW1zLm1lc3NhZ2U7XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtcy5lcnJvciA9PT0gXCJzdHJpbmdcIilcclxuICAgICAgICByZXR1cm4geyAuLi5wYXJhbXMsIGVycm9yOiAoKSA9PiBwYXJhbXMuZXJyb3IgfTtcclxuICAgIHJldHVybiBwYXJhbXM7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYW5zcGFyZW50UHJveHkoZ2V0dGVyKSB7XHJcbiAgICBsZXQgdGFyZ2V0O1xyXG4gICAgcmV0dXJuIG5ldyBQcm94eSh7fSwge1xyXG4gICAgICAgIGdldChfLCBwcm9wLCByZWNlaXZlcikge1xyXG4gICAgICAgICAgICB0YXJnZXQgPz8gKHRhcmdldCA9IGdldHRlcigpKTtcclxuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0KF8sIHByb3AsIHZhbHVlLCByZWNlaXZlcikge1xyXG4gICAgICAgICAgICB0YXJnZXQgPz8gKHRhcmdldCA9IGdldHRlcigpKTtcclxuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3Quc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUsIHJlY2VpdmVyKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGhhcyhfLCBwcm9wKSB7XHJcbiAgICAgICAgICAgIHRhcmdldCA/PyAodGFyZ2V0ID0gZ2V0dGVyKCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5oYXModGFyZ2V0LCBwcm9wKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlbGV0ZVByb3BlcnR5KF8sIHByb3ApIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID8/ICh0YXJnZXQgPSBnZXR0ZXIoKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvd25LZXlzKF8pIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID8/ICh0YXJnZXQgPSBnZXR0ZXIoKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0Lm93bktleXModGFyZ2V0KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihfLCBwcm9wKSB7XHJcbiAgICAgICAgICAgIHRhcmdldCA/PyAodGFyZ2V0ID0gZ2V0dGVyKCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlZmluZVByb3BlcnR5KF8sIHByb3AsIGRlc2NyaXB0b3IpIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID8/ICh0YXJnZXQgPSBnZXR0ZXIoKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcCwgZGVzY3JpcHRvcik7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnlQcmltaXRpdmUodmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYmlnaW50XCIpXHJcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCkgKyBcIm5cIjtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpXHJcbiAgICAgICAgcmV0dXJuIGBcIiR7dmFsdWV9XCJgO1xyXG4gICAgcmV0dXJuIGAke3ZhbHVlfWA7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsS2V5cyhzaGFwZSkge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHNoYXBlKS5maWx0ZXIoKGspID0+IHtcclxuICAgICAgICByZXR1cm4gc2hhcGVba10uX3pvZC5vcHRpbiA9PT0gXCJvcHRpb25hbFwiICYmIHNoYXBlW2tdLl96b2Qub3B0b3V0ID09PSBcIm9wdGlvbmFsXCI7XHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgTlVNQkVSX0ZPUk1BVF9SQU5HRVMgPSB7XHJcbiAgICBzYWZlaW50OiBbTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIsIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXSxcclxuICAgIGludDMyOiBbLTIxNDc0ODM2NDgsIDIxNDc0ODM2NDddLFxyXG4gICAgdWludDMyOiBbMCwgNDI5NDk2NzI5NV0sXHJcbiAgICBmbG9hdDMyOiBbLTMuNDAyODIzNDY2Mzg1Mjg4NmUzOCwgMy40MDI4MjM0NjYzODUyODg2ZTM4XSxcclxuICAgIGZsb2F0NjQ6IFstTnVtYmVyLk1BWF9WQUxVRSwgTnVtYmVyLk1BWF9WQUxVRV0sXHJcbn07XHJcbmV4cG9ydCBjb25zdCBCSUdJTlRfRk9STUFUX1JBTkdFUyA9IHtcclxuICAgIGludDY0OiBbLyogQF9fUFVSRV9fKi8gQmlnSW50KFwiLTkyMjMzNzIwMzY4NTQ3NzU4MDhcIiksIC8qIEBfX1BVUkVfXyovIEJpZ0ludChcIjkyMjMzNzIwMzY4NTQ3NzU4MDdcIildLFxyXG4gICAgdWludDY0OiBbLyogQF9fUFVSRV9fKi8gQmlnSW50KDApLCAvKiBAX19QVVJFX18qLyBCaWdJbnQoXCIxODQ0Njc0NDA3MzcwOTU1MTYxNVwiKV0sXHJcbn07XHJcbmV4cG9ydCBmdW5jdGlvbiBwaWNrKHNjaGVtYSwgbWFzaykge1xyXG4gICAgY29uc3QgY3VyckRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIGNvbnN0IGNoZWNrcyA9IGN1cnJEZWYuY2hlY2tzO1xyXG4gICAgY29uc3QgaGFzQ2hlY2tzID0gY2hlY2tzICYmIGNoZWNrcy5sZW5ndGggPiAwO1xyXG4gICAgaWYgKGhhc0NoZWNrcykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIi5waWNrKCkgY2Fubm90IGJlIHVzZWQgb24gb2JqZWN0IHNjaGVtYXMgY29udGFpbmluZyByZWZpbmVtZW50c1wiKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGRlZiA9IG1lcmdlRGVmcyhzY2hlbWEuX3pvZC5kZWYsIHtcclxuICAgICAgICBnZXQgc2hhcGUoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1NoYXBlID0ge307XHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG1hc2spIHtcclxuICAgICAgICAgICAgICAgIGlmICghKGtleSBpbiBjdXJyRGVmLnNoYXBlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5yZWNvZ25pemVkIGtleTogXCIke2tleX1cImApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFtYXNrW2tleV0pXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBuZXdTaGFwZVtrZXldID0gY3VyckRlZi5zaGFwZVtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFzc2lnblByb3AodGhpcywgXCJzaGFwZVwiLCBuZXdTaGFwZSk7IC8vIHNlbGYtY2FjaGluZ1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3U2hhcGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjaGVja3M6IFtdLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY2xvbmUoc2NoZW1hLCBkZWYpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBvbWl0KHNjaGVtYSwgbWFzaykge1xyXG4gICAgY29uc3QgY3VyckRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIGNvbnN0IGNoZWNrcyA9IGN1cnJEZWYuY2hlY2tzO1xyXG4gICAgY29uc3QgaGFzQ2hlY2tzID0gY2hlY2tzICYmIGNoZWNrcy5sZW5ndGggPiAwO1xyXG4gICAgaWYgKGhhc0NoZWNrcykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIi5vbWl0KCkgY2Fubm90IGJlIHVzZWQgb24gb2JqZWN0IHNjaGVtYXMgY29udGFpbmluZyByZWZpbmVtZW50c1wiKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGRlZiA9IG1lcmdlRGVmcyhzY2hlbWEuX3pvZC5kZWYsIHtcclxuICAgICAgICBnZXQgc2hhcGUoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1NoYXBlID0geyAuLi5zY2hlbWEuX3pvZC5kZWYuc2hhcGUgfTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbWFzaykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCEoa2V5IGluIGN1cnJEZWYuc2hhcGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnJlY29nbml6ZWQga2V5OiBcIiR7a2V5fVwiYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIW1hc2tba2V5XSlcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSBuZXdTaGFwZVtrZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFzc2lnblByb3AodGhpcywgXCJzaGFwZVwiLCBuZXdTaGFwZSk7IC8vIHNlbGYtY2FjaGluZ1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3U2hhcGU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjaGVja3M6IFtdLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY2xvbmUoc2NoZW1hLCBkZWYpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQoc2NoZW1hLCBzaGFwZSkge1xyXG4gICAgaWYgKCFpc1BsYWluT2JqZWN0KHNoYXBlKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5wdXQgdG8gZXh0ZW5kOiBleHBlY3RlZCBhIHBsYWluIG9iamVjdFwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGNoZWNrcyA9IHNjaGVtYS5fem9kLmRlZi5jaGVja3M7XHJcbiAgICBjb25zdCBoYXNDaGVja3MgPSBjaGVja3MgJiYgY2hlY2tzLmxlbmd0aCA+IDA7XHJcbiAgICBpZiAoaGFzQ2hlY2tzKSB7XHJcbiAgICAgICAgLy8gT25seSB0aHJvdyBpZiBuZXcgc2hhcGUgb3ZlcmxhcHMgd2l0aCBleGlzdGluZyBzaGFwZVxyXG4gICAgICAgIC8vIFVzZSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgdG8gY2hlY2sga2V5IGV4aXN0ZW5jZSB3aXRob3V0IGFjY2Vzc2luZyB2YWx1ZXNcclxuICAgICAgICBjb25zdCBleGlzdGluZ1NoYXBlID0gc2NoZW1hLl96b2QuZGVmLnNoYXBlO1xyXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNoYXBlKSB7XHJcbiAgICAgICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGV4aXN0aW5nU2hhcGUsIGtleSkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IG92ZXJ3cml0ZSBrZXlzIG9uIG9iamVjdCBzY2hlbWFzIGNvbnRhaW5pbmcgcmVmaW5lbWVudHMuIFVzZSBgLnNhZmVFeHRlbmQoKWAgaW5zdGVhZC5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCBkZWYgPSBtZXJnZURlZnMoc2NoZW1hLl96b2QuZGVmLCB7XHJcbiAgICAgICAgZ2V0IHNoYXBlKCkge1xyXG4gICAgICAgICAgICBjb25zdCBfc2hhcGUgPSB7IC4uLnNjaGVtYS5fem9kLmRlZi5zaGFwZSwgLi4uc2hhcGUgfTtcclxuICAgICAgICAgICAgYXNzaWduUHJvcCh0aGlzLCBcInNoYXBlXCIsIF9zaGFwZSk7IC8vIHNlbGYtY2FjaGluZ1xyXG4gICAgICAgICAgICByZXR1cm4gX3NoYXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjbG9uZShzY2hlbWEsIGRlZik7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNhZmVFeHRlbmQoc2NoZW1hLCBzaGFwZSkge1xyXG4gICAgaWYgKCFpc1BsYWluT2JqZWN0KHNoYXBlKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5wdXQgdG8gc2FmZUV4dGVuZDogZXhwZWN0ZWQgYSBwbGFpbiBvYmplY3RcIik7XHJcbiAgICB9XHJcbiAgICBjb25zdCBkZWYgPSBtZXJnZURlZnMoc2NoZW1hLl96b2QuZGVmLCB7XHJcbiAgICAgICAgZ2V0IHNoYXBlKCkge1xyXG4gICAgICAgICAgICBjb25zdCBfc2hhcGUgPSB7IC4uLnNjaGVtYS5fem9kLmRlZi5zaGFwZSwgLi4uc2hhcGUgfTtcclxuICAgICAgICAgICAgYXNzaWduUHJvcCh0aGlzLCBcInNoYXBlXCIsIF9zaGFwZSk7IC8vIHNlbGYtY2FjaGluZ1xyXG4gICAgICAgICAgICByZXR1cm4gX3NoYXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjbG9uZShzY2hlbWEsIGRlZik7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlKGEsIGIpIHtcclxuICAgIGlmIChhLl96b2QuZGVmLmNoZWNrcz8ubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiLm1lcmdlKCkgY2Fubm90IGJlIHVzZWQgb24gb2JqZWN0IHNjaGVtYXMgY29udGFpbmluZyByZWZpbmVtZW50cy4gVXNlIC5zYWZlRXh0ZW5kKCkgaW5zdGVhZC5cIik7XHJcbiAgICB9XHJcbiAgICBjb25zdCBkZWYgPSBtZXJnZURlZnMoYS5fem9kLmRlZiwge1xyXG4gICAgICAgIGdldCBzaGFwZSgpIHtcclxuICAgICAgICAgICAgY29uc3QgX3NoYXBlID0geyAuLi5hLl96b2QuZGVmLnNoYXBlLCAuLi5iLl96b2QuZGVmLnNoYXBlIH07XHJcbiAgICAgICAgICAgIGFzc2lnblByb3AodGhpcywgXCJzaGFwZVwiLCBfc2hhcGUpOyAvLyBzZWxmLWNhY2hpbmdcclxuICAgICAgICAgICAgcmV0dXJuIF9zaGFwZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldCBjYXRjaGFsbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGIuX3pvZC5kZWYuY2F0Y2hhbGw7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjaGVja3M6IGIuX3pvZC5kZWYuY2hlY2tzID8/IFtdLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gY2xvbmUoYSwgZGVmKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcGFydGlhbChDbGFzcywgc2NoZW1hLCBtYXNrKSB7XHJcbiAgICBjb25zdCBjdXJyRGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAgY29uc3QgY2hlY2tzID0gY3VyckRlZi5jaGVja3M7XHJcbiAgICBjb25zdCBoYXNDaGVja3MgPSBjaGVja3MgJiYgY2hlY2tzLmxlbmd0aCA+IDA7XHJcbiAgICBpZiAoaGFzQ2hlY2tzKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiLnBhcnRpYWwoKSBjYW5ub3QgYmUgdXNlZCBvbiBvYmplY3Qgc2NoZW1hcyBjb250YWluaW5nIHJlZmluZW1lbnRzXCIpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZGVmID0gbWVyZ2VEZWZzKHNjaGVtYS5fem9kLmRlZiwge1xyXG4gICAgICAgIGdldCBzaGFwZSgpIHtcclxuICAgICAgICAgICAgY29uc3Qgb2xkU2hhcGUgPSBzY2hlbWEuX3pvZC5kZWYuc2hhcGU7XHJcbiAgICAgICAgICAgIGNvbnN0IHNoYXBlID0geyAuLi5vbGRTaGFwZSB9O1xyXG4gICAgICAgICAgICBpZiAobWFzaykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbWFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKGtleSBpbiBvbGRTaGFwZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnJlY29nbml6ZWQga2V5OiBcIiR7a2V5fVwiYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWFza1trZXldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiAob2xkU2hhcGVba2V5XSEuX3pvZC5vcHRpbiA9PT0gXCJvcHRpb25hbFwiKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICBzaGFwZVtrZXldID0gQ2xhc3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBuZXcgQ2xhc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcHRpb25hbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJUeXBlOiBvbGRTaGFwZVtrZXldLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG9sZFNoYXBlW2tleV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvbGRTaGFwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChvbGRTaGFwZVtrZXldIS5fem9kLm9wdGluID09PSBcIm9wdGlvbmFsXCIpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHNoYXBlW2tleV0gPSBDbGFzc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IG5ldyBDbGFzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9wdGlvbmFsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbm5lclR5cGU6IG9sZFNoYXBlW2tleV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogb2xkU2hhcGVba2V5XTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhc3NpZ25Qcm9wKHRoaXMsIFwic2hhcGVcIiwgc2hhcGUpOyAvLyBzZWxmLWNhY2hpbmdcclxuICAgICAgICAgICAgcmV0dXJuIHNoYXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2hlY2tzOiBbXSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNsb25lKHNjaGVtYSwgZGVmKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcmVxdWlyZWQoQ2xhc3MsIHNjaGVtYSwgbWFzaykge1xyXG4gICAgY29uc3QgZGVmID0gbWVyZ2VEZWZzKHNjaGVtYS5fem9kLmRlZiwge1xyXG4gICAgICAgIGdldCBzaGFwZSgpIHtcclxuICAgICAgICAgICAgY29uc3Qgb2xkU2hhcGUgPSBzY2hlbWEuX3pvZC5kZWYuc2hhcGU7XHJcbiAgICAgICAgICAgIGNvbnN0IHNoYXBlID0geyAuLi5vbGRTaGFwZSB9O1xyXG4gICAgICAgICAgICBpZiAobWFzaykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbWFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghKGtleSBpbiBzaGFwZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnJlY29nbml6ZWQga2V5OiBcIiR7a2V5fVwiYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWFza1trZXldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBvdmVyd3JpdGUgd2l0aCBub24tb3B0aW9uYWxcclxuICAgICAgICAgICAgICAgICAgICBzaGFwZVtrZXldID0gbmV3IENsYXNzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJub25vcHRpb25hbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lclR5cGU6IG9sZFNoYXBlW2tleV0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvbGRTaGFwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG92ZXJ3cml0ZSB3aXRoIG5vbi1vcHRpb25hbFxyXG4gICAgICAgICAgICAgICAgICAgIHNoYXBlW2tleV0gPSBuZXcgQ2xhc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm5vbm9wdGlvbmFsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyVHlwZTogb2xkU2hhcGVba2V5XSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhc3NpZ25Qcm9wKHRoaXMsIFwic2hhcGVcIiwgc2hhcGUpOyAvLyBzZWxmLWNhY2hpbmdcclxuICAgICAgICAgICAgcmV0dXJuIHNoYXBlO1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBjbG9uZShzY2hlbWEsIGRlZik7XHJcbn1cclxuLy8gaW52YWxpZF90eXBlIHwgdG9vX2JpZyB8IHRvb19zbWFsbCB8IGludmFsaWRfZm9ybWF0IHwgbm90X211bHRpcGxlX29mIHwgdW5yZWNvZ25pemVkX2tleXMgfCBpbnZhbGlkX3VuaW9uIHwgaW52YWxpZF9rZXkgfCBpbnZhbGlkX2VsZW1lbnQgfCBpbnZhbGlkX3ZhbHVlIHwgY3VzdG9tXHJcbmV4cG9ydCBmdW5jdGlvbiBhYm9ydGVkKHgsIHN0YXJ0SW5kZXggPSAwKSB7XHJcbiAgICBpZiAoeC5hYm9ydGVkID09PSB0cnVlKVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0SW5kZXg7IGkgPCB4Lmlzc3Vlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmICh4Lmlzc3Vlc1tpXT8uY29udGludWUgIT09IHRydWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcbi8vIENoZWNrcyBmb3IgZXhwbGljaXQgYWJvcnQgKGNvbnRpbnVlID09PSBmYWxzZSksIGFzIG9wcG9zZWQgdG8gaW1wbGljaXQgYWJvcnQgKGNvbnRpbnVlID09PSB1bmRlZmluZWQpLlxyXG4vLyBVc2VkIHRvIHJlc3BlY3QgYGFib3J0OiB0cnVlYCBpbiAucmVmaW5lKCkgZXZlbiBmb3IgY2hlY2tzIHRoYXQgaGF2ZSBhIGB3aGVuYCBmdW5jdGlvbi5cclxuZXhwb3J0IGZ1bmN0aW9uIGV4cGxpY2l0bHlBYm9ydGVkKHgsIHN0YXJ0SW5kZXggPSAwKSB7XHJcbiAgICBpZiAoeC5hYm9ydGVkID09PSB0cnVlKVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0SW5kZXg7IGkgPCB4Lmlzc3Vlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmICh4Lmlzc3Vlc1tpXT8uY29udGludWUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcHJlZml4SXNzdWVzKHBhdGgsIGlzc3Vlcykge1xyXG4gICAgcmV0dXJuIGlzc3Vlcy5tYXAoKGlzcykgPT4ge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICAoX2EgPSBpc3MpLnBhdGggPz8gKF9hLnBhdGggPSBbXSk7XHJcbiAgICAgICAgaXNzLnBhdGgudW5zaGlmdChwYXRoKTtcclxuICAgICAgICByZXR1cm4gaXNzO1xyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHVud3JhcE1lc3NhZ2UobWVzc2FnZSkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBtZXNzYWdlID09PSBcInN0cmluZ1wiID8gbWVzc2FnZSA6IG1lc3NhZ2U/Lm1lc3NhZ2U7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvbmZpZykge1xyXG4gICAgY29uc3QgbWVzc2FnZSA9IGlzcy5tZXNzYWdlXHJcbiAgICAgICAgPyBpc3MubWVzc2FnZVxyXG4gICAgICAgIDogKHVud3JhcE1lc3NhZ2UoaXNzLmluc3Q/Ll96b2QuZGVmPy5lcnJvcj8uKGlzcykpID8/XHJcbiAgICAgICAgICAgIHVud3JhcE1lc3NhZ2UoY3R4Py5lcnJvcj8uKGlzcykpID8/XHJcbiAgICAgICAgICAgIHVud3JhcE1lc3NhZ2UoY29uZmlnLmN1c3RvbUVycm9yPy4oaXNzKSkgPz9cclxuICAgICAgICAgICAgdW53cmFwTWVzc2FnZShjb25maWcubG9jYWxlRXJyb3I/Lihpc3MpKSA/P1xyXG4gICAgICAgICAgICBcIkludmFsaWQgaW5wdXRcIik7XHJcbiAgICBjb25zdCB7IGluc3Q6IF9pbnN0LCBjb250aW51ZTogX2NvbnRpbnVlLCBpbnB1dDogX2lucHV0LCAuLi5yZXN0IH0gPSBpc3M7XHJcbiAgICByZXN0LnBhdGggPz8gKHJlc3QucGF0aCA9IFtdKTtcclxuICAgIHJlc3QubWVzc2FnZSA9IG1lc3NhZ2U7XHJcbiAgICBpZiAoY3R4Py5yZXBvcnRJbnB1dCkge1xyXG4gICAgICAgIHJlc3QuaW5wdXQgPSBfaW5wdXQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2l6YWJsZU9yaWdpbihpbnB1dCkge1xyXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgU2V0KVxyXG4gICAgICAgIHJldHVybiBcInNldFwiO1xyXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgTWFwKVxyXG4gICAgICAgIHJldHVybiBcIm1hcFwiO1xyXG4gICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgRmlsZSlcclxuICAgICAgICByZXR1cm4gXCJmaWxlXCI7XHJcbiAgICByZXR1cm4gXCJ1bmtub3duXCI7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldExlbmd0aGFibGVPcmlnaW4oaW5wdXQpIHtcclxuICAgIGlmIChBcnJheS5pc0FycmF5KGlucHV0KSlcclxuICAgICAgICByZXR1cm4gXCJhcnJheVwiO1xyXG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gXCJzdHJpbmdcIilcclxuICAgICAgICByZXR1cm4gXCJzdHJpbmdcIjtcclxuICAgIHJldHVybiBcInVua25vd25cIjtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VkVHlwZShkYXRhKSB7XHJcbiAgICBjb25zdCB0ID0gdHlwZW9mIGRhdGE7XHJcbiAgICBzd2l0Y2ggKHQpIHtcclxuICAgICAgICBjYXNlIFwibnVtYmVyXCI6IHtcclxuICAgICAgICAgICAgcmV0dXJuIE51bWJlci5pc05hTihkYXRhKSA/IFwibmFuXCIgOiBcIm51bWJlclwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlIFwib2JqZWN0XCI6IHtcclxuICAgICAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIm51bGxcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiYXJyYXlcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBvYmogPSBkYXRhO1xyXG4gICAgICAgICAgICBpZiAob2JqICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopICE9PSBPYmplY3QucHJvdG90eXBlICYmIFwiY29uc3RydWN0b3JcIiBpbiBvYmogJiYgb2JqLmNvbnN0cnVjdG9yKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmNvbnN0cnVjdG9yLm5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaXNzdWUoLi4uYXJncykge1xyXG4gICAgY29uc3QgW2lzcywgaW5wdXQsIGluc3RdID0gYXJncztcclxuICAgIGlmICh0eXBlb2YgaXNzID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbWVzc2FnZTogaXNzLFxyXG4gICAgICAgICAgICBjb2RlOiBcImN1c3RvbVwiLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHsgLi4uaXNzIH07XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuRW51bShvYmopIHtcclxuICAgIHJldHVybiBPYmplY3QuZW50cmllcyhvYmopXHJcbiAgICAgICAgLmZpbHRlcigoW2ssIF9dKSA9PiB7XHJcbiAgICAgICAgLy8gcmV0dXJuIHRydWUgaWYgTmFOLCBtZWFuaW5nIGl0J3Mgbm90IGEgbnVtYmVyLCB0aHVzIGEgc3RyaW5nIGtleVxyXG4gICAgICAgIHJldHVybiBOdW1iZXIuaXNOYU4oTnVtYmVyLnBhcnNlSW50KGssIDEwKSk7XHJcbiAgICB9KVxyXG4gICAgICAgIC5tYXAoKGVsKSA9PiBlbFsxXSk7XHJcbn1cclxuLy8gQ29kZWMgdXRpbGl0eSBmdW5jdGlvbnNcclxuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvVWludDhBcnJheShiYXNlNjQpIHtcclxuICAgIGNvbnN0IGJpbmFyeVN0cmluZyA9IGF0b2IoYmFzZTY0KTtcclxuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5U3RyaW5nLmxlbmd0aCk7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeVN0cmluZy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGJ5dGVzW2ldID0gYmluYXJ5U3RyaW5nLmNoYXJDb2RlQXQoaSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYnl0ZXM7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHVpbnQ4QXJyYXlUb0Jhc2U2NChieXRlcykge1xyXG4gICAgbGV0IGJpbmFyeVN0cmluZyA9IFwiXCI7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgYmluYXJ5U3RyaW5nICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5U3RyaW5nKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0dXJsVG9VaW50OEFycmF5KGJhc2U2NHVybCkge1xyXG4gICAgY29uc3QgYmFzZTY0ID0gYmFzZTY0dXJsLnJlcGxhY2UoLy0vZywgXCIrXCIpLnJlcGxhY2UoL18vZywgXCIvXCIpO1xyXG4gICAgY29uc3QgcGFkZGluZyA9IFwiPVwiLnJlcGVhdCgoNCAtIChiYXNlNjQubGVuZ3RoICUgNCkpICUgNCk7XHJcbiAgICByZXR1cm4gYmFzZTY0VG9VaW50OEFycmF5KGJhc2U2NCArIHBhZGRpbmcpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiB1aW50OEFycmF5VG9CYXNlNjR1cmwoYnl0ZXMpIHtcclxuICAgIHJldHVybiB1aW50OEFycmF5VG9CYXNlNjQoYnl0ZXMpLnJlcGxhY2UoL1xcKy9nLCBcIi1cIikucmVwbGFjZSgvXFwvL2csIFwiX1wiKS5yZXBsYWNlKC89L2csIFwiXCIpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBoZXhUb1VpbnQ4QXJyYXkoaGV4KSB7XHJcbiAgICBjb25zdCBjbGVhbkhleCA9IGhleC5yZXBsYWNlKC9eMHgvLCBcIlwiKTtcclxuICAgIGlmIChjbGVhbkhleC5sZW5ndGggJSAyICE9PSAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBoZXggc3RyaW5nIGxlbmd0aFwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoY2xlYW5IZXgubGVuZ3RoIC8gMik7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsZWFuSGV4Lmxlbmd0aDsgaSArPSAyKSB7XHJcbiAgICAgICAgYnl0ZXNbaSAvIDJdID0gTnVtYmVyLnBhcnNlSW50KGNsZWFuSGV4LnNsaWNlKGksIGkgKyAyKSwgMTYpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJ5dGVzO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiB1aW50OEFycmF5VG9IZXgoYnl0ZXMpIHtcclxuICAgIHJldHVybiBBcnJheS5mcm9tKGJ5dGVzKVxyXG4gICAgICAgIC5tYXAoKGIpID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsIFwiMFwiKSlcclxuICAgICAgICAuam9pbihcIlwiKTtcclxufVxyXG4vLyBpbnN0YW5jZW9mXHJcbmV4cG9ydCBjbGFzcyBDbGFzcyB7XHJcbiAgICBjb25zdHJ1Y3RvciguLi5fYXJncykgeyB9XHJcbn1cclxuIiwiaW1wb3J0IHsgJGNvbnN0cnVjdG9yIH0gZnJvbSBcIi4vY29yZS5qc1wiO1xyXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuL3V0aWwuanNcIjtcclxuY29uc3QgaW5pdGlhbGl6ZXIgPSAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBpbnN0Lm5hbWUgPSBcIiRab2RFcnJvclwiO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3QsIFwiX3pvZFwiLCB7XHJcbiAgICAgICAgdmFsdWU6IGluc3QuX3pvZCxcclxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgIH0pO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3QsIFwiaXNzdWVzXCIsIHtcclxuICAgICAgICB2YWx1ZTogZGVmLFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgfSk7XHJcbiAgICBpbnN0Lm1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShkZWYsIHV0aWwuanNvblN0cmluZ2lmeVJlcGxhY2VyLCAyKTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpbnN0LCBcInRvU3RyaW5nXCIsIHtcclxuICAgICAgICB2YWx1ZTogKCkgPT4gaW5zdC5tZXNzYWdlLFxyXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgfSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCAkWm9kRXJyb3IgPSAkY29uc3RydWN0b3IoXCIkWm9kRXJyb3JcIiwgaW5pdGlhbGl6ZXIpO1xyXG5leHBvcnQgY29uc3QgJFpvZFJlYWxFcnJvciA9ICRjb25zdHJ1Y3RvcihcIiRab2RFcnJvclwiLCBpbml0aWFsaXplciwgeyBQYXJlbnQ6IEVycm9yIH0pO1xyXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlbkVycm9yKGVycm9yLCBtYXBwZXIgPSAoaXNzdWUpID0+IGlzc3VlLm1lc3NhZ2UpIHtcclxuICAgIGNvbnN0IGZpZWxkRXJyb3JzID0ge307XHJcbiAgICBjb25zdCBmb3JtRXJyb3JzID0gW107XHJcbiAgICBmb3IgKGNvbnN0IHN1YiBvZiBlcnJvci5pc3N1ZXMpIHtcclxuICAgICAgICBpZiAoc3ViLnBhdGgubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBmaWVsZEVycm9yc1tzdWIucGF0aFswXV0gPSBmaWVsZEVycm9yc1tzdWIucGF0aFswXV0gfHwgW107XHJcbiAgICAgICAgICAgIGZpZWxkRXJyb3JzW3N1Yi5wYXRoWzBdXS5wdXNoKG1hcHBlcihzdWIpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGZvcm1FcnJvcnMucHVzaChtYXBwZXIoc3ViKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHsgZm9ybUVycm9ycywgZmllbGRFcnJvcnMgfTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RXJyb3IoZXJyb3IsIG1hcHBlciA9IChpc3N1ZSkgPT4gaXNzdWUubWVzc2FnZSkge1xyXG4gICAgY29uc3QgZmllbGRFcnJvcnMgPSB7IF9lcnJvcnM6IFtdIH07XHJcbiAgICBjb25zdCBwcm9jZXNzRXJyb3IgPSAoZXJyb3IsIHBhdGggPSBbXSkgPT4ge1xyXG4gICAgICAgIGZvciAoY29uc3QgaXNzdWUgb2YgZXJyb3IuaXNzdWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfdW5pb25cIiAmJiBpc3N1ZS5lcnJvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBpc3N1ZS5lcnJvcnMubWFwKChpc3N1ZXMpID0+IHByb2Nlc3NFcnJvcih7IGlzc3VlcyB9LCBbLi4ucGF0aCwgLi4uaXNzdWUucGF0aF0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfa2V5XCIpIHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NFcnJvcih7IGlzc3VlczogaXNzdWUuaXNzdWVzIH0sIFsuLi5wYXRoLCAuLi5pc3N1ZS5wYXRoXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUuY29kZSA9PT0gXCJpbnZhbGlkX2VsZW1lbnRcIikge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0Vycm9yKHsgaXNzdWVzOiBpc3N1ZS5pc3N1ZXMgfSwgWy4uLnBhdGgsIC4uLmlzc3VlLnBhdGhdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxwYXRoID0gWy4uLnBhdGgsIC4uLmlzc3VlLnBhdGhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZ1bGxwYXRoLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkRXJyb3JzLl9lcnJvcnMucHVzaChtYXBwZXIoaXNzdWUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyID0gZmllbGRFcnJvcnM7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgZnVsbHBhdGgubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gZnVsbHBhdGhbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlcm1pbmFsID0gaSA9PT0gZnVsbHBhdGgubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0ZXJtaW5hbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycltlbF0gPSBjdXJyW2VsXSB8fCB7IF9lcnJvcnM6IFtdIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyW2VsXSA9IGN1cnJbZWxdIHx8IHsgX2Vycm9yczogW10gfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJbZWxdLl9lcnJvcnMucHVzaChtYXBwZXIoaXNzdWUpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyID0gY3VycltlbF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcHJvY2Vzc0Vycm9yKGVycm9yKTtcclxuICAgIHJldHVybiBmaWVsZEVycm9ycztcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gdHJlZWlmeUVycm9yKGVycm9yLCBtYXBwZXIgPSAoaXNzdWUpID0+IGlzc3VlLm1lc3NhZ2UpIHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHsgZXJyb3JzOiBbXSB9O1xyXG4gICAgY29uc3QgcHJvY2Vzc0Vycm9yID0gKGVycm9yLCBwYXRoID0gW10pID0+IHtcclxuICAgICAgICB2YXIgX2EsIF9iO1xyXG4gICAgICAgIGZvciAoY29uc3QgaXNzdWUgb2YgZXJyb3IuaXNzdWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfdW5pb25cIiAmJiBpc3N1ZS5lcnJvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyByZWd1bGFyIHVuaW9uIGVycm9yXHJcbiAgICAgICAgICAgICAgICBpc3N1ZS5lcnJvcnMubWFwKChpc3N1ZXMpID0+IHByb2Nlc3NFcnJvcih7IGlzc3VlcyB9LCBbLi4ucGF0aCwgLi4uaXNzdWUucGF0aF0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpc3N1ZS5jb2RlID09PSBcImludmFsaWRfa2V5XCIpIHtcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NFcnJvcih7IGlzc3VlczogaXNzdWUuaXNzdWVzIH0sIFsuLi5wYXRoLCAuLi5pc3N1ZS5wYXRoXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoaXNzdWUuY29kZSA9PT0gXCJpbnZhbGlkX2VsZW1lbnRcIikge1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0Vycm9yKHsgaXNzdWVzOiBpc3N1ZS5pc3N1ZXMgfSwgWy4uLnBhdGgsIC4uLmlzc3VlLnBhdGhdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxwYXRoID0gWy4uLnBhdGgsIC4uLmlzc3VlLnBhdGhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZ1bGxwYXRoLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5lcnJvcnMucHVzaChtYXBwZXIoaXNzdWUpKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCBjdXJyID0gcmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCBmdWxscGF0aC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGZ1bGxwYXRoW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlcm1pbmFsID0gaSA9PT0gZnVsbHBhdGgubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVsID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIucHJvcGVydGllcyA/PyAoY3Vyci5wcm9wZXJ0aWVzID0ge30pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAoX2EgPSBjdXJyLnByb3BlcnRpZXMpW2VsXSA/PyAoX2FbZWxdID0geyBlcnJvcnM6IFtdIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyID0gY3Vyci5wcm9wZXJ0aWVzW2VsXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnIuaXRlbXMgPz8gKGN1cnIuaXRlbXMgPSBbXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChfYiA9IGN1cnIuaXRlbXMpW2VsXSA/PyAoX2JbZWxdID0geyBlcnJvcnM6IFtdIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyID0gY3Vyci5pdGVtc1tlbF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXJtaW5hbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyLmVycm9ycy5wdXNoKG1hcHBlcihpc3N1ZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcHJvY2Vzc0Vycm9yKGVycm9yKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuLyoqIEZvcm1hdCBhIFpvZEVycm9yIGFzIGEgaHVtYW4tcmVhZGFibGUgc3RyaW5nIGluIHRoZSBmb2xsb3dpbmcgZm9ybS5cclxuICpcclxuICogRnJvbVxyXG4gKlxyXG4gKiBgYGB0c1xyXG4gKiBab2RFcnJvciB7XHJcbiAqICAgaXNzdWVzOiBbXHJcbiAqICAgICB7XHJcbiAqICAgICAgIGV4cGVjdGVkOiAnc3RyaW5nJyxcclxuICogICAgICAgY29kZTogJ2ludmFsaWRfdHlwZScsXHJcbiAqICAgICAgIHBhdGg6IFsgJ3VzZXJuYW1lJyBdLFxyXG4gKiAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBpbnB1dDogZXhwZWN0ZWQgc3RyaW5nJ1xyXG4gKiAgICAgfSxcclxuICogICAgIHtcclxuICogICAgICAgZXhwZWN0ZWQ6ICdudW1iZXInLFxyXG4gKiAgICAgICBjb2RlOiAnaW52YWxpZF90eXBlJyxcclxuICogICAgICAgcGF0aDogWyAnZmF2b3JpdGVOdW1iZXJzJywgMSBdLFxyXG4gKiAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBpbnB1dDogZXhwZWN0ZWQgbnVtYmVyJ1xyXG4gKiAgICAgfVxyXG4gKiAgIF07XHJcbiAqIH1cclxuICogYGBgXHJcbiAqXHJcbiAqIHRvXHJcbiAqXHJcbiAqIGBgYFxyXG4gKiB1c2VybmFtZVxyXG4gKiAgIOKcliBFeHBlY3RlZCBudW1iZXIsIHJlY2VpdmVkIHN0cmluZyBhdCBcInVzZXJuYW1lXHJcbiAqIGZhdm9yaXRlTnVtYmVyc1swXVxyXG4gKiAgIOKcliBJbnZhbGlkIGlucHV0OiBleHBlY3RlZCBudW1iZXJcclxuICogYGBgXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9Eb3RQYXRoKF9wYXRoKSB7XHJcbiAgICBjb25zdCBzZWdzID0gW107XHJcbiAgICBjb25zdCBwYXRoID0gX3BhdGgubWFwKChzZWcpID0+ICh0eXBlb2Ygc2VnID09PSBcIm9iamVjdFwiID8gc2VnLmtleSA6IHNlZykpO1xyXG4gICAgZm9yIChjb25zdCBzZWcgb2YgcGF0aCkge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygc2VnID09PSBcIm51bWJlclwiKVxyXG4gICAgICAgICAgICBzZWdzLnB1c2goYFske3NlZ31dYCk7XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHNlZyA9PT0gXCJzeW1ib2xcIilcclxuICAgICAgICAgICAgc2Vncy5wdXNoKGBbJHtKU09OLnN0cmluZ2lmeShTdHJpbmcoc2VnKSl9XWApO1xyXG4gICAgICAgIGVsc2UgaWYgKC9bXlxcdyRdLy50ZXN0KHNlZykpXHJcbiAgICAgICAgICAgIHNlZ3MucHVzaChgWyR7SlNPTi5zdHJpbmdpZnkoc2VnKX1dYCk7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChzZWdzLmxlbmd0aClcclxuICAgICAgICAgICAgICAgIHNlZ3MucHVzaChcIi5cIik7XHJcbiAgICAgICAgICAgIHNlZ3MucHVzaChzZWcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBzZWdzLmpvaW4oXCJcIik7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHByZXR0aWZ5RXJyb3IoZXJyb3IpIHtcclxuICAgIGNvbnN0IGxpbmVzID0gW107XHJcbiAgICAvLyBzb3J0IGJ5IHBhdGggbGVuZ3RoXHJcbiAgICBjb25zdCBpc3N1ZXMgPSBbLi4uZXJyb3IuaXNzdWVzXS5zb3J0KChhLCBiKSA9PiAoYS5wYXRoID8/IFtdKS5sZW5ndGggLSAoYi5wYXRoID8/IFtdKS5sZW5ndGgpO1xyXG4gICAgLy8gUHJvY2VzcyBlYWNoIGlzc3VlXHJcbiAgICBmb3IgKGNvbnN0IGlzc3VlIG9mIGlzc3Vlcykge1xyXG4gICAgICAgIGxpbmVzLnB1c2goYOKcliAke2lzc3VlLm1lc3NhZ2V9YCk7XHJcbiAgICAgICAgaWYgKGlzc3VlLnBhdGg/Lmxlbmd0aClcclxuICAgICAgICAgICAgbGluZXMucHVzaChgICDihpIgYXQgJHt0b0RvdFBhdGgoaXNzdWUucGF0aCl9YCk7XHJcbiAgICB9XHJcbiAgICAvLyBDb252ZXJ0IE1hcCB0byBmb3JtYXR0ZWQgc3RyaW5nXHJcbiAgICByZXR1cm4gbGluZXMuam9pbihcIlxcblwiKTtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBjb3JlIGZyb20gXCIuL2NvcmUuanNcIjtcclxuaW1wb3J0ICogYXMgZXJyb3JzIGZyb20gXCIuL2Vycm9ycy5qc1wiO1xyXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuL3V0aWwuanNcIjtcclxuZXhwb3J0IGNvbnN0IF9wYXJzZSA9IChfRXJyKSA9PiAoc2NoZW1hLCB2YWx1ZSwgX2N0eCwgX3BhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgY3R4ID0gX2N0eCA/IHsgLi4uX2N0eCwgYXN5bmM6IGZhbHNlIH0gOiB7IGFzeW5jOiBmYWxzZSB9O1xyXG4gICAgY29uc3QgcmVzdWx0ID0gc2NoZW1hLl96b2QucnVuKHsgdmFsdWUsIGlzc3VlczogW10gfSwgY3R4KTtcclxuICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IGNvcmUuJFpvZEFzeW5jRXJyb3IoKTtcclxuICAgIH1cclxuICAgIGlmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgIGNvbnN0IGUgPSBuZXcgKF9wYXJhbXM/LkVyciA/PyBfRXJyKShyZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSk7XHJcbiAgICAgICAgdXRpbC5jYXB0dXJlU3RhY2tUcmFjZShlLCBfcGFyYW1zPy5jYWxsZWUpO1xyXG4gICAgICAgIHRocm93IGU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xyXG59O1xyXG5leHBvcnQgY29uc3QgcGFyc2UgPSAvKiBAX19QVVJFX18qLyBfcGFyc2UoZXJyb3JzLiRab2RSZWFsRXJyb3IpO1xyXG5leHBvcnQgY29uc3QgX3BhcnNlQXN5bmMgPSAoX0VycikgPT4gYXN5bmMgKHNjaGVtYSwgdmFsdWUsIF9jdHgsIHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgY3R4ID0gX2N0eCA/IHsgLi4uX2N0eCwgYXN5bmM6IHRydWUgfSA6IHsgYXN5bmM6IHRydWUgfTtcclxuICAgIGxldCByZXN1bHQgPSBzY2hlbWEuX3pvZC5ydW4oeyB2YWx1ZSwgaXNzdWVzOiBbXSB9LCBjdHgpO1xyXG4gICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpXHJcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzdWx0O1xyXG4gICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgY29uc3QgZSA9IG5ldyAocGFyYW1zPy5FcnIgPz8gX0VycikocmVzdWx0Lmlzc3Vlcy5tYXAoKGlzcykgPT4gdXRpbC5maW5hbGl6ZUlzc3VlKGlzcywgY3R4LCBjb3JlLmNvbmZpZygpKSkpO1xyXG4gICAgICAgIHV0aWwuY2FwdHVyZVN0YWNrVHJhY2UoZSwgcGFyYW1zPy5jYWxsZWUpO1xyXG4gICAgICAgIHRocm93IGU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0LnZhbHVlO1xyXG59O1xyXG5leHBvcnQgY29uc3QgcGFyc2VBc3luYyA9IC8qIEBfX1BVUkVfXyovIF9wYXJzZUFzeW5jKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IF9zYWZlUGFyc2UgPSAoX0VycikgPT4gKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcclxuICAgIGNvbnN0IGN0eCA9IF9jdHggPyB7IC4uLl9jdHgsIGFzeW5jOiBmYWxzZSB9IDogeyBhc3luYzogZmFsc2UgfTtcclxuICAgIGNvbnN0IHJlc3VsdCA9IHNjaGVtYS5fem9kLnJ1bih7IHZhbHVlLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgIHRocm93IG5ldyBjb3JlLiRab2RBc3luY0Vycm9yKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0Lmlzc3Vlcy5sZW5ndGhcclxuICAgICAgICA/IHtcclxuICAgICAgICAgICAgc3VjY2VzczogZmFsc2UsXHJcbiAgICAgICAgICAgIGVycm9yOiBuZXcgKF9FcnIgPz8gZXJyb3JzLiRab2RFcnJvcikocmVzdWx0Lmlzc3Vlcy5tYXAoKGlzcykgPT4gdXRpbC5maW5hbGl6ZUlzc3VlKGlzcywgY3R4LCBjb3JlLmNvbmZpZygpKSkpLFxyXG4gICAgICAgIH1cclxuICAgICAgICA6IHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0LnZhbHVlIH07XHJcbn07XHJcbmV4cG9ydCBjb25zdCBzYWZlUGFyc2UgPSAvKiBAX19QVVJFX18qLyBfc2FmZVBhcnNlKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IF9zYWZlUGFyc2VBc3luYyA9IChfRXJyKSA9PiBhc3luYyAoc2NoZW1hLCB2YWx1ZSwgX2N0eCkgPT4ge1xyXG4gICAgY29uc3QgY3R4ID0gX2N0eCA/IHsgLi4uX2N0eCwgYXN5bmM6IHRydWUgfSA6IHsgYXN5bmM6IHRydWUgfTtcclxuICAgIGxldCByZXN1bHQgPSBzY2hlbWEuX3pvZC5ydW4oeyB2YWx1ZSwgaXNzdWVzOiBbXSB9LCBjdHgpO1xyXG4gICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpXHJcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgcmVzdWx0O1xyXG4gICAgcmV0dXJuIHJlc3VsdC5pc3N1ZXMubGVuZ3RoXHJcbiAgICAgICAgPyB7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBlcnJvcjogbmV3IF9FcnIocmVzdWx0Lmlzc3Vlcy5tYXAoKGlzcykgPT4gdXRpbC5maW5hbGl6ZUlzc3VlKGlzcywgY3R4LCBjb3JlLmNvbmZpZygpKSkpLFxyXG4gICAgICAgIH1cclxuICAgICAgICA6IHsgc3VjY2VzczogdHJ1ZSwgZGF0YTogcmVzdWx0LnZhbHVlIH07XHJcbn07XHJcbmV4cG9ydCBjb25zdCBzYWZlUGFyc2VBc3luYyA9IC8qIEBfX1BVUkVfXyovIF9zYWZlUGFyc2VBc3luYyhlcnJvcnMuJFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBfZW5jb2RlID0gKF9FcnIpID0+IChzY2hlbWEsIHZhbHVlLCBfY3R4KSA9PiB7XHJcbiAgICBjb25zdCBjdHggPSBfY3R4ID8geyAuLi5fY3R4LCBkaXJlY3Rpb246IFwiYmFja3dhcmRcIiB9IDogeyBkaXJlY3Rpb246IFwiYmFja3dhcmRcIiB9O1xyXG4gICAgcmV0dXJuIF9wYXJzZShfRXJyKShzY2hlbWEsIHZhbHVlLCBjdHgpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgZW5jb2RlID0gLyogQF9fUFVSRV9fKi8gX2VuY29kZShlcnJvcnMuJFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBfZGVjb2RlID0gKF9FcnIpID0+IChzY2hlbWEsIHZhbHVlLCBfY3R4KSA9PiB7XHJcbiAgICByZXR1cm4gX3BhcnNlKF9FcnIpKHNjaGVtYSwgdmFsdWUsIF9jdHgpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgZGVjb2RlID0gLyogQF9fUFVSRV9fKi8gX2RlY29kZShlcnJvcnMuJFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBfZW5jb2RlQXN5bmMgPSAoX0VycikgPT4gYXN5bmMgKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcclxuICAgIGNvbnN0IGN0eCA9IF9jdHggPyB7IC4uLl9jdHgsIGRpcmVjdGlvbjogXCJiYWNrd2FyZFwiIH0gOiB7IGRpcmVjdGlvbjogXCJiYWNrd2FyZFwiIH07XHJcbiAgICByZXR1cm4gX3BhcnNlQXN5bmMoX0Vycikoc2NoZW1hLCB2YWx1ZSwgY3R4KTtcclxufTtcclxuZXhwb3J0IGNvbnN0IGVuY29kZUFzeW5jID0gLyogQF9fUFVSRV9fKi8gX2VuY29kZUFzeW5jKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IF9kZWNvZGVBc3luYyA9IChfRXJyKSA9PiBhc3luYyAoc2NoZW1hLCB2YWx1ZSwgX2N0eCkgPT4ge1xyXG4gICAgcmV0dXJuIF9wYXJzZUFzeW5jKF9FcnIpKHNjaGVtYSwgdmFsdWUsIF9jdHgpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgZGVjb2RlQXN5bmMgPSAvKiBAX19QVVJFX18qLyBfZGVjb2RlQXN5bmMoZXJyb3JzLiRab2RSZWFsRXJyb3IpO1xyXG5leHBvcnQgY29uc3QgX3NhZmVFbmNvZGUgPSAoX0VycikgPT4gKHNjaGVtYSwgdmFsdWUsIF9jdHgpID0+IHtcclxuICAgIGNvbnN0IGN0eCA9IF9jdHggPyB7IC4uLl9jdHgsIGRpcmVjdGlvbjogXCJiYWNrd2FyZFwiIH0gOiB7IGRpcmVjdGlvbjogXCJiYWNrd2FyZFwiIH07XHJcbiAgICByZXR1cm4gX3NhZmVQYXJzZShfRXJyKShzY2hlbWEsIHZhbHVlLCBjdHgpO1xyXG59O1xyXG5leHBvcnQgY29uc3Qgc2FmZUVuY29kZSA9IC8qIEBfX1BVUkVfXyovIF9zYWZlRW5jb2RlKGVycm9ycy4kWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IF9zYWZlRGVjb2RlID0gKF9FcnIpID0+IChzY2hlbWEsIHZhbHVlLCBfY3R4KSA9PiB7XHJcbiAgICByZXR1cm4gX3NhZmVQYXJzZShfRXJyKShzY2hlbWEsIHZhbHVlLCBfY3R4KTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHNhZmVEZWNvZGUgPSAvKiBAX19QVVJFX18qLyBfc2FmZURlY29kZShlcnJvcnMuJFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBfc2FmZUVuY29kZUFzeW5jID0gKF9FcnIpID0+IGFzeW5jIChzY2hlbWEsIHZhbHVlLCBfY3R4KSA9PiB7XHJcbiAgICBjb25zdCBjdHggPSBfY3R4ID8geyAuLi5fY3R4LCBkaXJlY3Rpb246IFwiYmFja3dhcmRcIiB9IDogeyBkaXJlY3Rpb246IFwiYmFja3dhcmRcIiB9O1xyXG4gICAgcmV0dXJuIF9zYWZlUGFyc2VBc3luYyhfRXJyKShzY2hlbWEsIHZhbHVlLCBjdHgpO1xyXG59O1xyXG5leHBvcnQgY29uc3Qgc2FmZUVuY29kZUFzeW5jID0gLyogQF9fUFVSRV9fKi8gX3NhZmVFbmNvZGVBc3luYyhlcnJvcnMuJFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBfc2FmZURlY29kZUFzeW5jID0gKF9FcnIpID0+IGFzeW5jIChzY2hlbWEsIHZhbHVlLCBfY3R4KSA9PiB7XHJcbiAgICByZXR1cm4gX3NhZmVQYXJzZUFzeW5jKF9FcnIpKHNjaGVtYSwgdmFsdWUsIF9jdHgpO1xyXG59O1xyXG5leHBvcnQgY29uc3Qgc2FmZURlY29kZUFzeW5jID0gLyogQF9fUFVSRV9fKi8gX3NhZmVEZWNvZGVBc3luYyhlcnJvcnMuJFpvZFJlYWxFcnJvcik7XHJcbiIsImltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4vdXRpbC5qc1wiO1xyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgQ1VJRCB2MSBpcyBkZXByZWNhdGVkIGJ5IGl0cyBhdXRob3JzIGR1ZSB0byBpbmZvcm1hdGlvbiBsZWFrYWdlXHJcbiAqICh0aW1lc3RhbXBzIGVtYmVkZGVkIGluIHRoZSBpZCkuIFVzZSB7QGxpbmsgY3VpZDJ9IGluc3RlYWQuXHJcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGFyYWxsZWxkcml2ZS9jdWlkLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGN1aWQgPSAvXltjQ11bMC05YS16XXs2LH0kLztcclxuZXhwb3J0IGNvbnN0IGN1aWQyID0gL15bMC05YS16XSskLztcclxuZXhwb3J0IGNvbnN0IHVsaWQgPSAvXlswLTlBLUhKS01OUC1UVi1aYS1oamttbnAtdHYtel17MjZ9JC87XHJcbmV4cG9ydCBjb25zdCB4aWQgPSAvXlswLTlhLXZBLVZdezIwfSQvO1xyXG5leHBvcnQgY29uc3Qga3N1aWQgPSAvXltBLVphLXowLTldezI3fSQvO1xyXG5leHBvcnQgY29uc3QgbmFub2lkID0gL15bYS16QS1aMC05Xy1dezIxfSQvO1xyXG4vKiogSVNPIDg2MDEtMSBkdXJhdGlvbiByZWdleC4gRG9lcyBub3Qgc3VwcG9ydCB0aGUgODYwMS0yIGV4dGVuc2lvbnMgbGlrZSBuZWdhdGl2ZSBkdXJhdGlvbnMgb3IgZnJhY3Rpb25hbC9uZWdhdGl2ZSBjb21wb25lbnRzLiAqL1xyXG5leHBvcnQgY29uc3QgZHVyYXRpb24gPSAvXlAoPzooXFxkK1cpfCg/IS4qVykoPz1cXGR8VFxcZCkoXFxkK1kpPyhcXGQrTSk/KFxcZCtEKT8oVCg/PVxcZCkoXFxkK0gpPyhcXGQrTSk/KFxcZCsoWy4sXVxcZCspP1MpPyk/KSQvO1xyXG4vKiogSW1wbGVtZW50cyBJU08gODYwMS0yIGV4dGVuc2lvbnMgbGlrZSBleHBsaWNpdCArLSBwcmVmaXhlcywgbWl4aW5nIHdlZWtzIHdpdGggb3RoZXIgdW5pdHMsIGFuZCBmcmFjdGlvbmFsL25lZ2F0aXZlIGNvbXBvbmVudHMuICovXHJcbmV4cG9ydCBjb25zdCBleHRlbmRlZER1cmF0aW9uID0gL15bLStdP1AoPyEkKSg/Oig/OlstK10/XFxkK1kpfCg/OlstK10/XFxkK1suLF1cXGQrWSQpKT8oPzooPzpbLStdP1xcZCtNKXwoPzpbLStdP1xcZCtbLixdXFxkK00kKSk/KD86KD86Wy0rXT9cXGQrVyl8KD86Wy0rXT9cXGQrWy4sXVxcZCtXJCkpPyg/Oig/OlstK10/XFxkK0QpfCg/OlstK10/XFxkK1suLF1cXGQrRCQpKT8oPzpUKD89W1xcZCstXSkoPzooPzpbLStdP1xcZCtIKXwoPzpbLStdP1xcZCtbLixdXFxkK0gkKSk/KD86KD86Wy0rXT9cXGQrTSl8KD86Wy0rXT9cXGQrWy4sXVxcZCtNJCkpPyg/OlstK10/XFxkKyg/OlsuLF1cXGQrKT9TKT8pPz8kLztcclxuLyoqIEEgcmVnZXggZm9yIGFueSBVVUlELWxpa2UgaWRlbnRpZmllcjogOC00LTQtNC0xMiBoZXggcGF0dGVybiAqL1xyXG5leHBvcnQgY29uc3QgZ3VpZCA9IC9eKFswLTlhLWZBLUZdezh9LVswLTlhLWZBLUZdezR9LVswLTlhLWZBLUZdezR9LVswLTlhLWZBLUZdezR9LVswLTlhLWZBLUZdezEyfSkkLztcclxuLyoqIFJldHVybnMgYSByZWdleCBmb3IgdmFsaWRhdGluZyBhbiBSRkMgOTU2Mi80MTIyIFVVSUQuXHJcbiAqXHJcbiAqIEBwYXJhbSB2ZXJzaW9uIE9wdGlvbmFsbHkgc3BlY2lmeSBhIHZlcnNpb24gMS04LiBJZiBubyB2ZXJzaW9uIGlzIHNwZWNpZmllZCwgYWxsIHZlcnNpb25zIGFyZSBzdXBwb3J0ZWQuICovXHJcbmV4cG9ydCBjb25zdCB1dWlkID0gKHZlcnNpb24pID0+IHtcclxuICAgIGlmICghdmVyc2lvbilcclxuICAgICAgICByZXR1cm4gL14oWzAtOWEtZkEtRl17OH0tWzAtOWEtZkEtRl17NH0tWzEtOF1bMC05YS1mQS1GXXszfS1bODlhYkFCXVswLTlhLWZBLUZdezN9LVswLTlhLWZBLUZdezEyfXwwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDB8ZmZmZmZmZmYtZmZmZi1mZmZmLWZmZmYtZmZmZmZmZmZmZmZmKSQvO1xyXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYF4oWzAtOWEtZkEtRl17OH0tWzAtOWEtZkEtRl17NH0tJHt2ZXJzaW9ufVswLTlhLWZBLUZdezN9LVs4OWFiQUJdWzAtOWEtZkEtRl17M30tWzAtOWEtZkEtRl17MTJ9KSRgKTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHV1aWQ0ID0gLypAX19QVVJFX18qLyB1dWlkKDQpO1xyXG5leHBvcnQgY29uc3QgdXVpZDYgPSAvKkBfX1BVUkVfXyovIHV1aWQoNik7XHJcbmV4cG9ydCBjb25zdCB1dWlkNyA9IC8qQF9fUFVSRV9fKi8gdXVpZCg3KTtcclxuLyoqIFByYWN0aWNhbCBlbWFpbCB2YWxpZGF0aW9uICovXHJcbmV4cG9ydCBjb25zdCBlbWFpbCA9IC9eKD8hXFwuKSg/IS4qXFwuXFwuKShbQS1aYS16MC05XycrXFwtXFwuXSopW0EtWmEtejAtOV8rLV1AKFtBLVphLXowLTldW0EtWmEtejAtOVxcLV0qXFwuKStbQS1aYS16XXsyLH0kLztcclxuLyoqIEVxdWl2YWxlbnQgdG8gdGhlIEhUTUw1IGlucHV0W3R5cGU9ZW1haWxdIHZhbGlkYXRpb24gaW1wbGVtZW50ZWQgYnkgYnJvd3NlcnMuIFNvdXJjZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRNTC9FbGVtZW50L2lucHV0L2VtYWlsICovXHJcbmV4cG9ydCBjb25zdCBodG1sNUVtYWlsID0gL15bYS16QS1aMC05LiEjJCUmJyorLz0/Xl9ge3x9fi1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKiQvO1xyXG4vKiogVGhlIGNsYXNzaWMgZW1haWxyZWdleC5jb20gcmVnZXggZm9yIFJGQyA1MzIyLWNvbXBsaWFudCBlbWFpbHMgKi9cclxuZXhwb3J0IGNvbnN0IHJmYzUzMjJFbWFpbCA9IC9eKChbXjw+KClcXFtcXF1cXFxcLiw7Olxcc0BcIl0rKFxcLltePD4oKVxcW1xcXVxcXFwuLDs6XFxzQFwiXSspKil8KFwiLitcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfV0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xyXG4vKiogQSBsb29zZSByZWdleCB0aGF0IGFsbG93cyBVbmljb2RlIGNoYXJhY3RlcnMsIGVuZm9yY2VzIGxlbmd0aCBsaW1pdHMsIGFuZCB0aGF0J3MgYWJvdXQgaXQuICovXHJcbmV4cG9ydCBjb25zdCB1bmljb2RlRW1haWwgPSAvXlteXFxzQFwiXXsxLDY0fUBbXlxcc0BdezEsMjU1fSQvdTtcclxuZXhwb3J0IGNvbnN0IGlkbkVtYWlsID0gdW5pY29kZUVtYWlsO1xyXG5leHBvcnQgY29uc3QgYnJvd3NlckVtYWlsID0gL15bYS16QS1aMC05LiEjJCUmJyorLz0/Xl9ge3x9fi1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKiQvO1xyXG4vLyBmcm9tIGh0dHBzOi8vdGhla2V2aW5zY290dC5jb20vZW1vamlzLWluLWphdmFzY3JpcHQvI3dyaXRpbmctYS1yZWd1bGFyLWV4cHJlc3Npb25cclxuY29uc3QgX2Vtb2ppID0gYF4oXFxcXHB7RXh0ZW5kZWRfUGljdG9ncmFwaGljfXxcXFxccHtFbW9qaV9Db21wb25lbnR9KSskYDtcclxuZXhwb3J0IGZ1bmN0aW9uIGVtb2ppKCkge1xyXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoX2Vtb2ppLCBcInVcIik7XHJcbn1cclxuZXhwb3J0IGNvbnN0IGlwdjQgPSAvXig/Oig/OjI1WzAtNV18MlswLTRdWzAtOV18MVswLTldWzAtOV18WzEtOV1bMC05XXxbMC05XSlcXC4pezN9KD86MjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKSQvO1xyXG5leHBvcnQgY29uc3QgaXB2NiA9IC9eKChbMC05YS1mQS1GXXsxLDR9Oil7N31bMC05YS1mQS1GXXsxLDR9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw3fTp8KFswLTlhLWZBLUZdezEsNH06KXsxLDZ9OlswLTlhLWZBLUZdezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDV9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDJ9fChbMC05YS1mQS1GXXsxLDR9Oil7MSw0fSg6WzAtOWEtZkEtRl17MSw0fSl7MSwzfXwoWzAtOWEtZkEtRl17MSw0fTopezEsM30oOlswLTlhLWZBLUZdezEsNH0pezEsNH18KFswLTlhLWZBLUZdezEsNH06KXsxLDJ9KDpbMC05YS1mQS1GXXsxLDR9KXsxLDV9fFswLTlhLWZBLUZdezEsNH06KCg6WzAtOWEtZkEtRl17MSw0fSl7MSw2fSl8OigoOlswLTlhLWZBLUZdezEsNH0pezEsN318OikpJC87XHJcbmV4cG9ydCBjb25zdCBtYWMgPSAoZGVsaW1pdGVyKSA9PiB7XHJcbiAgICBjb25zdCBlc2NhcGVkRGVsaW0gPSB1dGlsLmVzY2FwZVJlZ2V4KGRlbGltaXRlciA/PyBcIjpcIik7XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXig/OlswLTlBLUZdezJ9JHtlc2NhcGVkRGVsaW19KXs1fVswLTlBLUZdezJ9JHxeKD86WzAtOWEtZl17Mn0ke2VzY2FwZWREZWxpbX0pezV9WzAtOWEtZl17Mn0kYCk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBjaWRydjQgPSAvXigoMjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKVxcLil7M30oMjVbMC01XXwyWzAtNF1bMC05XXwxWzAtOV1bMC05XXxbMS05XVswLTldfFswLTldKVxcLyhbMC05XXxbMS0yXVswLTldfDNbMC0yXSkkLztcclxuZXhwb3J0IGNvbnN0IGNpZHJ2NiA9IC9eKChbMC05YS1mQS1GXXsxLDR9Oil7N31bMC05YS1mQS1GXXsxLDR9fDo6fChbMC05YS1mQS1GXXsxLDR9KT86OihbMC05YS1mQS1GXXsxLDR9Oj8pezAsNn0pXFwvKDEyWzAtOF18MVswMV1bMC05XXxbMS05XT9bMC05XSkkLztcclxuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNzg2MDM5Mi9kZXRlcm1pbmUtaWYtc3RyaW5nLWlzLWluLWJhc2U2NC11c2luZy1qYXZhc2NyaXB0XHJcbmV4cG9ydCBjb25zdCBiYXNlNjQgPSAvXiR8Xig/OlswLTlhLXpBLVorL117NH0pKig/Oig/OlswLTlhLXpBLVorL117Mn09PSl8KD86WzAtOWEtekEtWisvXXszfT0pKT8kLztcclxuZXhwb3J0IGNvbnN0IGJhc2U2NHVybCA9IC9eW0EtWmEtejAtOV8tXSokLztcclxuLy8gYmFzZWQgb24gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTA2MTc5L3JlZ3VsYXItZXhwcmVzc2lvbi10by1tYXRjaC1kbnMtaG9zdG5hbWUtb3ItaXAtYWRkcmVzc1xyXG4vLyBleHBvcnQgY29uc3QgaG9zdG5hbWU6IFJlZ0V4cCA9IC9eKFthLXpBLVowLTktXStcXC4pKlthLXpBLVowLTktXSskLztcclxuZXhwb3J0IGNvbnN0IGhvc3RuYW1lID0gL14oPz0uezEsMjUzfVxcLj8kKVthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86Wy0wLTlhLXpBLVpdezAsNjF9WzAtOWEtekEtWl0pPykqXFwuPyQvO1xyXG5leHBvcnQgY29uc3QgZG9tYWluID0gL14oW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/XFwuKStbYS16QS1aXXsyLH0kLztcclxuZXhwb3J0IGNvbnN0IGh0dHBQcm90b2NvbCA9IC9eaHR0cHM/JC87XHJcbi8vIGh0dHBzOi8vYmxvZy5zdGV2ZW5sZXZpdGhhbi5jb20vYXJjaGl2ZXMvdmFsaWRhdGUtcGhvbmUtbnVtYmVyI3I0LTMgKHJlZ2V4IHNhbnMgc3BhY2VzKVxyXG4vLyBFLjE2NDogbGVhZGluZyBkaWdpdCBtdXN0IGJlIDEtOTsgdG90YWwgZGlnaXRzIChleGNsdWRpbmcgJysnKSBiZXR3ZWVuIDctMTVcclxuZXhwb3J0IGNvbnN0IGUxNjQgPSAvXlxcK1sxLTldXFxkezYsMTR9JC87XHJcbi8vIGNvbnN0IGRhdGVTb3VyY2UgPSBgKChcXFxcZFxcXFxkWzI0NjhdWzA0OF18XFxcXGRcXFxcZFsxMzU3OV1bMjZdfFxcXFxkXFxcXGQwWzQ4XXxbMDI0NjhdWzA0OF0wMHxbMTM1NzldWzI2XTAwKS0wMi0yOXxcXFxcZHs0fS0oKDBbMTM1NzhdfDFbMDJdKS0oMFsxLTldfFsxMl1cXFxcZHwzWzAxXSl8KDBbNDY5XXwxMSktKDBbMS05XXxbMTJdXFxcXGR8MzApfCgwMiktKDBbMS05XXwxXFxcXGR8MlswLThdKSkpYDtcclxuY29uc3QgZGF0ZVNvdXJjZSA9IGAoPzooPzpcXFxcZFxcXFxkWzI0NjhdWzA0OF18XFxcXGRcXFxcZFsxMzU3OV1bMjZdfFxcXFxkXFxcXGQwWzQ4XXxbMDI0NjhdWzA0OF0wMHxbMTM1NzldWzI2XTAwKS0wMi0yOXxcXFxcZHs0fS0oPzooPzowWzEzNTc4XXwxWzAyXSktKD86MFsxLTldfFsxMl1cXFxcZHwzWzAxXSl8KD86MFs0NjldfDExKS0oPzowWzEtOV18WzEyXVxcXFxkfDMwKXwoPzowMiktKD86MFsxLTldfDFcXFxcZHwyWzAtOF0pKSlgO1xyXG5leHBvcnQgY29uc3QgZGF0ZSA9IC8qQF9fUFVSRV9fKi8gbmV3IFJlZ0V4cChgXiR7ZGF0ZVNvdXJjZX0kYCk7XHJcbmZ1bmN0aW9uIHRpbWVTb3VyY2UoYXJncykge1xyXG4gICAgY29uc3QgaGhtbSA9IGAoPzpbMDFdXFxcXGR8MlswLTNdKTpbMC01XVxcXFxkYDtcclxuICAgIGNvbnN0IHJlZ2V4ID0gdHlwZW9mIGFyZ3MucHJlY2lzaW9uID09PSBcIm51bWJlclwiXHJcbiAgICAgICAgPyBhcmdzLnByZWNpc2lvbiA9PT0gLTFcclxuICAgICAgICAgICAgPyBgJHtoaG1tfWBcclxuICAgICAgICAgICAgOiBhcmdzLnByZWNpc2lvbiA9PT0gMFxyXG4gICAgICAgICAgICAgICAgPyBgJHtoaG1tfTpbMC01XVxcXFxkYFxyXG4gICAgICAgICAgICAgICAgOiBgJHtoaG1tfTpbMC01XVxcXFxkXFxcXC5cXFxcZHske2FyZ3MucHJlY2lzaW9ufX1gXHJcbiAgICAgICAgOiBgJHtoaG1tfSg/OjpbMC01XVxcXFxkKD86XFxcXC5cXFxcZCspPyk/YDtcclxuICAgIHJldHVybiByZWdleDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gdGltZShhcmdzKSB7XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7dGltZVNvdXJjZShhcmdzKX0kYCk7XHJcbn1cclxuLy8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zMTQzMjMxXHJcbmV4cG9ydCBmdW5jdGlvbiBkYXRldGltZShhcmdzKSB7XHJcbiAgICBjb25zdCB0aW1lID0gdGltZVNvdXJjZSh7IHByZWNpc2lvbjogYXJncy5wcmVjaXNpb24gfSk7XHJcbiAgICBjb25zdCBvcHRzID0gW1wiWlwiXTtcclxuICAgIGlmIChhcmdzLmxvY2FsKVxyXG4gICAgICAgIG9wdHMucHVzaChcIlwiKTtcclxuICAgIC8vIGlmIChhcmdzLm9mZnNldCkgb3B0cy5wdXNoKGAoWystXVxcXFxkezJ9OlxcXFxkezJ9KWApO1xyXG4gICAgaWYgKGFyZ3Mub2Zmc2V0KVxyXG4gICAgICAgIG9wdHMucHVzaChgKFsrLV0oPzpbMDFdXFxcXGR8MlswLTNdKTpbMC01XVxcXFxkKWApO1xyXG4gICAgY29uc3QgdGltZVJlZ2V4ID0gYCR7dGltZX0oPzoke29wdHMuam9pbihcInxcIil9KWA7XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7ZGF0ZVNvdXJjZX1UKD86JHt0aW1lUmVnZXh9KSRgKTtcclxufVxyXG5leHBvcnQgY29uc3Qgc3RyaW5nID0gKHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgcmVnZXggPSBwYXJhbXMgPyBgW1xcXFxzXFxcXFNdeyR7cGFyYW1zPy5taW5pbXVtID8/IDB9LCR7cGFyYW1zPy5tYXhpbXVtID8/IFwiXCJ9fWAgOiBgW1xcXFxzXFxcXFNdKmA7XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXiR7cmVnZXh9JGApO1xyXG59O1xyXG5leHBvcnQgY29uc3QgYmlnaW50ID0gL14tP1xcZCtuPyQvO1xyXG5leHBvcnQgY29uc3QgaW50ZWdlciA9IC9eLT9cXGQrJC87XHJcbmV4cG9ydCBjb25zdCBudW1iZXIgPSAvXi0/XFxkKyg/OlxcLlxcZCspPyQvO1xyXG5leHBvcnQgY29uc3QgYm9vbGVhbiA9IC9eKD86dHJ1ZXxmYWxzZSkkL2k7XHJcbmNvbnN0IF9udWxsID0gL15udWxsJC9pO1xyXG5leHBvcnQgeyBfbnVsbCBhcyBudWxsIH07XHJcbmNvbnN0IF91bmRlZmluZWQgPSAvXnVuZGVmaW5lZCQvaTtcclxuZXhwb3J0IHsgX3VuZGVmaW5lZCBhcyB1bmRlZmluZWQgfTtcclxuLy8gcmVnZXggZm9yIHN0cmluZyB3aXRoIG5vIHVwcGVyY2FzZSBsZXR0ZXJzXHJcbmV4cG9ydCBjb25zdCBsb3dlcmNhc2UgPSAvXlteQS1aXSokLztcclxuLy8gcmVnZXggZm9yIHN0cmluZyB3aXRoIG5vIGxvd2VyY2FzZSBsZXR0ZXJzXHJcbmV4cG9ydCBjb25zdCB1cHBlcmNhc2UgPSAvXlteYS16XSokLztcclxuLy8gcmVnZXggZm9yIGhleGFkZWNpbWFsIHN0cmluZ3MgKGFueSBsZW5ndGgpXHJcbmV4cG9ydCBjb25zdCBoZXggPSAvXlswLTlhLWZBLUZdKiQvO1xyXG4vLyBIYXNoIHJlZ2V4ZXMgZm9yIGRpZmZlcmVudCBhbGdvcml0aG1zIGFuZCBlbmNvZGluZ3NcclxuLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBiYXNlNjQgcmVnZXggd2l0aCBleGFjdCBsZW5ndGggYW5kIHBhZGRpbmdcclxuZnVuY3Rpb24gZml4ZWRCYXNlNjQoYm9keUxlbmd0aCwgcGFkZGluZykge1xyXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoYF5bQS1aYS16MC05Ky9deyR7Ym9keUxlbmd0aH19JHtwYWRkaW5nfSRgKTtcclxufVxyXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGJhc2U2NHVybCByZWdleCB3aXRoIGV4YWN0IGxlbmd0aCAobm8gcGFkZGluZylcclxuZnVuY3Rpb24gZml4ZWRCYXNlNjR1cmwobGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChgXltBLVphLXowLTlfLV17JHtsZW5ndGh9fSRgKTtcclxufVxyXG4vLyBNRDUgKDE2IGJ5dGVzKTogYmFzZTY0ID0gMjQgY2hhcnMgdG90YWwgKDIyICsgXCI9PVwiKVxyXG5leHBvcnQgY29uc3QgbWQ1X2hleCA9IC9eWzAtOWEtZkEtRl17MzJ9JC87XHJcbmV4cG9ydCBjb25zdCBtZDVfYmFzZTY0ID0gLypAX19QVVJFX18qLyBmaXhlZEJhc2U2NCgyMiwgXCI9PVwiKTtcclxuZXhwb3J0IGNvbnN0IG1kNV9iYXNlNjR1cmwgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0dXJsKDIyKTtcclxuLy8gU0hBMSAoMjAgYnl0ZXMpOiBiYXNlNjQgPSAyOCBjaGFycyB0b3RhbCAoMjcgKyBcIj1cIilcclxuZXhwb3J0IGNvbnN0IHNoYTFfaGV4ID0gL15bMC05YS1mQS1GXXs0MH0kLztcclxuZXhwb3J0IGNvbnN0IHNoYTFfYmFzZTY0ID0gLypAX19QVVJFX18qLyBmaXhlZEJhc2U2NCgyNywgXCI9XCIpO1xyXG5leHBvcnQgY29uc3Qgc2hhMV9iYXNlNjR1cmwgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0dXJsKDI3KTtcclxuLy8gU0hBMjU2ICgzMiBieXRlcyk6IGJhc2U2NCA9IDQ0IGNoYXJzIHRvdGFsICg0MyArIFwiPVwiKVxyXG5leHBvcnQgY29uc3Qgc2hhMjU2X2hleCA9IC9eWzAtOWEtZkEtRl17NjR9JC87XHJcbmV4cG9ydCBjb25zdCBzaGEyNTZfYmFzZTY0ID0gLypAX19QVVJFX18qLyBmaXhlZEJhc2U2NCg0MywgXCI9XCIpO1xyXG5leHBvcnQgY29uc3Qgc2hhMjU2X2Jhc2U2NHVybCA9IC8qQF9fUFVSRV9fKi8gZml4ZWRCYXNlNjR1cmwoNDMpO1xyXG4vLyBTSEEzODQgKDQ4IGJ5dGVzKTogYmFzZTY0ID0gNjQgY2hhcnMgdG90YWwgKG5vIHBhZGRpbmcpXHJcbmV4cG9ydCBjb25zdCBzaGEzODRfaGV4ID0gL15bMC05YS1mQS1GXXs5Nn0kLztcclxuZXhwb3J0IGNvbnN0IHNoYTM4NF9iYXNlNjQgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0KDY0LCBcIlwiKTtcclxuZXhwb3J0IGNvbnN0IHNoYTM4NF9iYXNlNjR1cmwgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0dXJsKDY0KTtcclxuLy8gU0hBNTEyICg2NCBieXRlcyk6IGJhc2U2NCA9IDg4IGNoYXJzIHRvdGFsICg4NiArIFwiPT1cIilcclxuZXhwb3J0IGNvbnN0IHNoYTUxMl9oZXggPSAvXlswLTlhLWZBLUZdezEyOH0kLztcclxuZXhwb3J0IGNvbnN0IHNoYTUxMl9iYXNlNjQgPSAvKkBfX1BVUkVfXyovIGZpeGVkQmFzZTY0KDg2LCBcIj09XCIpO1xyXG5leHBvcnQgY29uc3Qgc2hhNTEyX2Jhc2U2NHVybCA9IC8qQF9fUFVSRV9fKi8gZml4ZWRCYXNlNjR1cmwoODYpO1xyXG4iLCIvLyBpbXBvcnQgeyAkWm9kVHlwZSB9IGZyb20gXCIuL3NjaGVtYXMuanNcIjtcclxuaW1wb3J0ICogYXMgY29yZSBmcm9tIFwiLi9jb3JlLmpzXCI7XHJcbmltcG9ydCAqIGFzIHJlZ2V4ZXMgZnJvbSBcIi4vcmVnZXhlcy5qc1wiO1xyXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuL3V0aWwuanNcIjtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVjayA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgdmFyIF9hO1xyXG4gICAgaW5zdC5fem9kID8/IChpbnN0Ll96b2QgPSB7fSk7XHJcbiAgICBpbnN0Ll96b2QuZGVmID0gZGVmO1xyXG4gICAgKF9hID0gaW5zdC5fem9kKS5vbmF0dGFjaCA/PyAoX2Eub25hdHRhY2ggPSBbXSk7XHJcbn0pO1xyXG5jb25zdCBudW1lcmljT3JpZ2luTWFwID0ge1xyXG4gICAgbnVtYmVyOiBcIm51bWJlclwiLFxyXG4gICAgYmlnaW50OiBcImJpZ2ludFwiLFxyXG4gICAgb2JqZWN0OiBcImRhdGVcIixcclxufTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja0xlc3NUaGFuID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja0xlc3NUaGFuXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb25zdCBvcmlnaW4gPSBudW1lcmljT3JpZ2luTWFwW3R5cGVvZiBkZWYudmFsdWVdO1xyXG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcclxuICAgICAgICBjb25zdCBiYWcgPSBpbnN0Ll96b2QuYmFnO1xyXG4gICAgICAgIGNvbnN0IGN1cnIgPSAoZGVmLmluY2x1c2l2ZSA/IGJhZy5tYXhpbXVtIDogYmFnLmV4Y2x1c2l2ZU1heGltdW0pID8/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgICAgICBpZiAoZGVmLnZhbHVlIDwgY3Vycikge1xyXG4gICAgICAgICAgICBpZiAoZGVmLmluY2x1c2l2ZSlcclxuICAgICAgICAgICAgICAgIGJhZy5tYXhpbXVtID0gZGVmLnZhbHVlO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBiYWcuZXhjbHVzaXZlTWF4aW11bSA9IGRlZi52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgaWYgKGRlZi5pbmNsdXNpdmUgPyBwYXlsb2FkLnZhbHVlIDw9IGRlZi52YWx1ZSA6IHBheWxvYWQudmFsdWUgPCBkZWYudmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgb3JpZ2luLFxyXG4gICAgICAgICAgICBjb2RlOiBcInRvb19iaWdcIixcclxuICAgICAgICAgICAgbWF4aW11bTogdHlwZW9mIGRlZi52YWx1ZSA9PT0gXCJvYmplY3RcIiA/IGRlZi52YWx1ZS5nZXRUaW1lKCkgOiBkZWYudmFsdWUsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGRlZi5pbmNsdXNpdmUsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tHcmVhdGVyVGhhbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tHcmVhdGVyVGhhblwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29uc3Qgb3JpZ2luID0gbnVtZXJpY09yaWdpbk1hcFt0eXBlb2YgZGVmLnZhbHVlXTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcclxuICAgICAgICBjb25zdCBjdXJyID0gKGRlZi5pbmNsdXNpdmUgPyBiYWcubWluaW11bSA6IGJhZy5leGNsdXNpdmVNaW5pbXVtKSA/PyBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XHJcbiAgICAgICAgaWYgKGRlZi52YWx1ZSA+IGN1cnIpIHtcclxuICAgICAgICAgICAgaWYgKGRlZi5pbmNsdXNpdmUpXHJcbiAgICAgICAgICAgICAgICBiYWcubWluaW11bSA9IGRlZi52YWx1ZTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgYmFnLmV4Y2x1c2l2ZU1pbmltdW0gPSBkZWYudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGlmIChkZWYuaW5jbHVzaXZlID8gcGF5bG9hZC52YWx1ZSA+PSBkZWYudmFsdWUgOiBwYXlsb2FkLnZhbHVlID4gZGVmLnZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIG9yaWdpbixcclxuICAgICAgICAgICAgY29kZTogXCJ0b29fc21hbGxcIixcclxuICAgICAgICAgICAgbWluaW11bTogdHlwZW9mIGRlZi52YWx1ZSA9PT0gXCJvYmplY3RcIiA/IGRlZi52YWx1ZS5nZXRUaW1lKCkgOiBkZWYudmFsdWUsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbmNsdXNpdmU6IGRlZi5pbmNsdXNpdmUsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tNdWx0aXBsZU9mID0gXHJcbi8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tNdWx0aXBsZU9mXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICAoX2EgPSBpbnN0Ll96b2QuYmFnKS5tdWx0aXBsZU9mID8/IChfYS5tdWx0aXBsZU9mID0gZGVmLnZhbHVlKTtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQudmFsdWUgIT09IHR5cGVvZiBkZWYudmFsdWUpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBtaXggbnVtYmVyIGFuZCBiaWdpbnQgaW4gbXVsdGlwbGVfb2YgY2hlY2suXCIpO1xyXG4gICAgICAgIGNvbnN0IGlzTXVsdGlwbGUgPSB0eXBlb2YgcGF5bG9hZC52YWx1ZSA9PT0gXCJiaWdpbnRcIlxyXG4gICAgICAgICAgICA/IHBheWxvYWQudmFsdWUgJSBkZWYudmFsdWUgPT09IEJpZ0ludCgwKVxyXG4gICAgICAgICAgICA6IHV0aWwuZmxvYXRTYWZlUmVtYWluZGVyKHBheWxvYWQudmFsdWUsIGRlZi52YWx1ZSkgPT09IDA7XHJcbiAgICAgICAgaWYgKGlzTXVsdGlwbGUpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgb3JpZ2luOiB0eXBlb2YgcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgY29kZTogXCJub3RfbXVsdGlwbGVfb2ZcIixcclxuICAgICAgICAgICAgZGl2aXNvcjogZGVmLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja051bWJlckZvcm1hdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tOdW1iZXJGb3JtYXRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTsgLy8gbm8gZm9ybWF0IGNoZWNrc1xyXG4gICAgZGVmLmZvcm1hdCA9IGRlZi5mb3JtYXQgfHwgXCJmbG9hdDY0XCI7XHJcbiAgICBjb25zdCBpc0ludCA9IGRlZi5mb3JtYXQ/LmluY2x1ZGVzKFwiaW50XCIpO1xyXG4gICAgY29uc3Qgb3JpZ2luID0gaXNJbnQgPyBcImludFwiIDogXCJudW1iZXJcIjtcclxuICAgIGNvbnN0IFttaW5pbXVtLCBtYXhpbXVtXSA9IHV0aWwuTlVNQkVSX0ZPUk1BVF9SQU5HRVNbZGVmLmZvcm1hdF07XHJcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJhZyA9IGluc3QuX3pvZC5iYWc7XHJcbiAgICAgICAgYmFnLmZvcm1hdCA9IGRlZi5mb3JtYXQ7XHJcbiAgICAgICAgYmFnLm1pbmltdW0gPSBtaW5pbXVtO1xyXG4gICAgICAgIGJhZy5tYXhpbXVtID0gbWF4aW11bTtcclxuICAgICAgICBpZiAoaXNJbnQpXHJcbiAgICAgICAgICAgIGJhZy5wYXR0ZXJuID0gcmVnZXhlcy5pbnRlZ2VyO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBpZiAoaXNJbnQpIHtcclxuICAgICAgICAgICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGlucHV0KSkge1xyXG4gICAgICAgICAgICAgICAgLy8gaW52YWxpZF9mb3JtYXQgaXNzdWVcclxuICAgICAgICAgICAgICAgIC8vIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgLy8gICBleHBlY3RlZDogZGVmLmZvcm1hdCxcclxuICAgICAgICAgICAgICAgIC8vICAgZm9ybWF0OiBkZWYuZm9ybWF0LFxyXG4gICAgICAgICAgICAgICAgLy8gICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXHJcbiAgICAgICAgICAgICAgICAvLyAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgLy8gICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgLy8gfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBpbnZhbGlkX3R5cGUgaXNzdWVcclxuICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBvcmlnaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBkZWYuZm9ybWF0LFxyXG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIC8vIG5vdF9tdWx0aXBsZV9vZiBpc3N1ZVxyXG4gICAgICAgICAgICAgICAgLy8gcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAvLyAgIGNvZGU6IFwibm90X211bHRpcGxlX29mXCIsXHJcbiAgICAgICAgICAgICAgICAvLyAgIG9yaWdpbjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgICAgIC8vICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICAvLyAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICAvLyAgIGRpdmlzb3I6IDEsXHJcbiAgICAgICAgICAgICAgICAvLyB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKGlucHV0KSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlucHV0ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvb19iaWdcclxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFwidG9vX2JpZ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm90ZTogXCJJbnRlZ2VycyBtdXN0IGJlIHdpdGhpbiB0aGUgc2FmZSBpbnRlZ2VyIHJhbmdlLlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyB0b29fc21hbGxcclxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFwidG9vX3NtYWxsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbmltdW06IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlOiBcIkludGVnZXJzIG11c3QgYmUgd2l0aGluIHRoZSBzYWZlIGludGVnZXIgcmFuZ2UuXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5wdXQgPCBtaW5pbXVtKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgb3JpZ2luOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcInRvb19zbWFsbFwiLFxyXG4gICAgICAgICAgICAgICAgbWluaW11bSxcclxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbnB1dCA+IG1heGltdW0pIHtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW46IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwidG9vX2JpZ1wiLFxyXG4gICAgICAgICAgICAgICAgbWF4aW11bSxcclxuICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tCaWdJbnRGb3JtYXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrQmlnSW50Rm9ybWF0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7IC8vIG5vIGZvcm1hdCBjaGVja3NcclxuICAgIGNvbnN0IFttaW5pbXVtLCBtYXhpbXVtXSA9IHV0aWwuQklHSU5UX0ZPUk1BVF9SQU5HRVNbZGVmLmZvcm1hdF07XHJcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJhZyA9IGluc3QuX3pvZC5iYWc7XHJcbiAgICAgICAgYmFnLmZvcm1hdCA9IGRlZi5mb3JtYXQ7XHJcbiAgICAgICAgYmFnLm1pbmltdW0gPSBtaW5pbXVtO1xyXG4gICAgICAgIGJhZy5tYXhpbXVtID0gbWF4aW11bTtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKGlucHV0IDwgbWluaW11bSkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIG9yaWdpbjogXCJiaWdpbnRcIixcclxuICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgY29kZTogXCJ0b29fc21hbGxcIixcclxuICAgICAgICAgICAgICAgIG1pbmltdW06IG1pbmltdW0sXHJcbiAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5wdXQgPiBtYXhpbXVtKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgb3JpZ2luOiBcImJpZ2ludFwiLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcInRvb19iaWdcIixcclxuICAgICAgICAgICAgICAgIG1heGltdW0sXHJcbiAgICAgICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrTWF4U2l6ZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tNYXhTaXplXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIHZhciBfYTtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICAoX2EgPSBpbnN0Ll96b2QuZGVmKS53aGVuID8/IChfYS53aGVuID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjb25zdCB2YWwgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIHJldHVybiAhdXRpbC5udWxsaXNoKHZhbCkgJiYgdmFsLnNpemUgIT09IHVuZGVmaW5lZDtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLm9uYXR0YWNoLnB1c2goKGluc3QpID0+IHtcclxuICAgICAgICBjb25zdCBjdXJyID0gKGluc3QuX3pvZC5iYWcubWF4aW11bSA/PyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpO1xyXG4gICAgICAgIGlmIChkZWYubWF4aW11bSA8IGN1cnIpXHJcbiAgICAgICAgICAgIGluc3QuX3pvZC5iYWcubWF4aW11bSA9IGRlZi5tYXhpbXVtO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBjb25zdCBzaXplID0gaW5wdXQuc2l6ZTtcclxuICAgICAgICBpZiAoc2l6ZSA8PSBkZWYubWF4aW11bSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBvcmlnaW46IHV0aWwuZ2V0U2l6YWJsZU9yaWdpbihpbnB1dCksXHJcbiAgICAgICAgICAgIGNvZGU6IFwidG9vX2JpZ1wiLFxyXG4gICAgICAgICAgICBtYXhpbXVtOiBkZWYubWF4aW11bSxcclxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja01pblNpemUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrTWluU2l6ZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICB2YXIgX2E7XHJcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgKF9hID0gaW5zdC5fem9kLmRlZikud2hlbiA/PyAoX2Eud2hlbiA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFsID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICByZXR1cm4gIXV0aWwubnVsbGlzaCh2YWwpICYmIHZhbC5zaXplICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgY3VyciA9IChpbnN0Ll96b2QuYmFnLm1pbmltdW0gPz8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKTtcclxuICAgICAgICBpZiAoZGVmLm1pbmltdW0gPiBjdXJyKVxyXG4gICAgICAgICAgICBpbnN0Ll96b2QuYmFnLm1pbmltdW0gPSBkZWYubWluaW11bTtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGlucHV0LnNpemU7XHJcbiAgICAgICAgaWYgKHNpemUgPj0gZGVmLm1pbmltdW0pXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgb3JpZ2luOiB1dGlsLmdldFNpemFibGVPcmlnaW4oaW5wdXQpLFxyXG4gICAgICAgICAgICBjb2RlOiBcInRvb19zbWFsbFwiLFxyXG4gICAgICAgICAgICBtaW5pbXVtOiBkZWYubWluaW11bSxcclxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja1NpemVFcXVhbHMgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrU2l6ZUVxdWFsc1wiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICB2YXIgX2E7XHJcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgKF9hID0gaW5zdC5fem9kLmRlZikud2hlbiA/PyAoX2Eud2hlbiA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFsID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICByZXR1cm4gIXV0aWwubnVsbGlzaCh2YWwpICYmIHZhbC5zaXplICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcclxuICAgICAgICBiYWcubWluaW11bSA9IGRlZi5zaXplO1xyXG4gICAgICAgIGJhZy5tYXhpbXVtID0gZGVmLnNpemU7XHJcbiAgICAgICAgYmFnLnNpemUgPSBkZWYuc2l6ZTtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgY29uc3Qgc2l6ZSA9IGlucHV0LnNpemU7XHJcbiAgICAgICAgaWYgKHNpemUgPT09IGRlZi5zaXplKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3QgdG9vQmlnID0gc2l6ZSA+IGRlZi5zaXplO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBvcmlnaW46IHV0aWwuZ2V0U2l6YWJsZU9yaWdpbihpbnB1dCksXHJcbiAgICAgICAgICAgIC4uLih0b29CaWcgPyB7IGNvZGU6IFwidG9vX2JpZ1wiLCBtYXhpbXVtOiBkZWYuc2l6ZSB9IDogeyBjb2RlOiBcInRvb19zbWFsbFwiLCBtaW5pbXVtOiBkZWYuc2l6ZSB9KSxcclxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICBleGFjdDogdHJ1ZSxcclxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tNYXhMZW5ndGggPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrTWF4TGVuZ3RoXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIHZhciBfYTtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICAoX2EgPSBpbnN0Ll96b2QuZGVmKS53aGVuID8/IChfYS53aGVuID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjb25zdCB2YWwgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIHJldHVybiAhdXRpbC5udWxsaXNoKHZhbCkgJiYgdmFsLmxlbmd0aCAhPT0gdW5kZWZpbmVkO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGN1cnIgPSAoaW5zdC5fem9kLmJhZy5tYXhpbXVtID8/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSk7XHJcbiAgICAgICAgaWYgKGRlZi5tYXhpbXVtIDwgY3VycilcclxuICAgICAgICAgICAgaW5zdC5fem9kLmJhZy5tYXhpbXVtID0gZGVmLm1heGltdW07XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuZ3RoIDw9IGRlZi5tYXhpbXVtKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luID0gdXRpbC5nZXRMZW5ndGhhYmxlT3JpZ2luKGlucHV0KTtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgb3JpZ2luLFxyXG4gICAgICAgICAgICBjb2RlOiBcInRvb19iaWdcIixcclxuICAgICAgICAgICAgbWF4aW11bTogZGVmLm1heGltdW0sXHJcbiAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tNaW5MZW5ndGggPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrTWluTGVuZ3RoXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIHZhciBfYTtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICAoX2EgPSBpbnN0Ll96b2QuZGVmKS53aGVuID8/IChfYS53aGVuID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBjb25zdCB2YWwgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIHJldHVybiAhdXRpbC5udWxsaXNoKHZhbCkgJiYgdmFsLmxlbmd0aCAhPT0gdW5kZWZpbmVkO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGN1cnIgPSAoaW5zdC5fem9kLmJhZy5taW5pbXVtID8/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSk7XHJcbiAgICAgICAgaWYgKGRlZi5taW5pbXVtID4gY3VycilcclxuICAgICAgICAgICAgaW5zdC5fem9kLmJhZy5taW5pbXVtID0gZGVmLm1pbmltdW07XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuZ3RoID49IGRlZi5taW5pbXVtKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgb3JpZ2luID0gdXRpbC5nZXRMZW5ndGhhYmxlT3JpZ2luKGlucHV0KTtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgb3JpZ2luLFxyXG4gICAgICAgICAgICBjb2RlOiBcInRvb19zbWFsbFwiLFxyXG4gICAgICAgICAgICBtaW5pbXVtOiBkZWYubWluaW11bSxcclxuICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja0xlbmd0aEVxdWFscyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tMZW5ndGhFcXVhbHNcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgdmFyIF9hO1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIChfYSA9IGluc3QuX3pvZC5kZWYpLndoZW4gPz8gKF9hLndoZW4gPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgcmV0dXJuICF1dGlsLm51bGxpc2godmFsKSAmJiB2YWwubGVuZ3RoICE9PSB1bmRlZmluZWQ7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcclxuICAgICAgICBiYWcubWluaW11bSA9IGRlZi5sZW5ndGg7XHJcbiAgICAgICAgYmFnLm1heGltdW0gPSBkZWYubGVuZ3RoO1xyXG4gICAgICAgIGJhZy5sZW5ndGggPSBkZWYubGVuZ3RoO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBpbnB1dC5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gZGVmLmxlbmd0aClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHV0aWwuZ2V0TGVuZ3RoYWJsZU9yaWdpbihpbnB1dCk7XHJcbiAgICAgICAgY29uc3QgdG9vQmlnID0gbGVuZ3RoID4gZGVmLmxlbmd0aDtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgb3JpZ2luLFxyXG4gICAgICAgICAgICAuLi4odG9vQmlnID8geyBjb2RlOiBcInRvb19iaWdcIiwgbWF4aW11bTogZGVmLmxlbmd0aCB9IDogeyBjb2RlOiBcInRvb19zbWFsbFwiLCBtaW5pbXVtOiBkZWYubGVuZ3RoIH0pLFxyXG4gICAgICAgICAgICBpbmNsdXNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIGV4YWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja1N0cmluZ0Zvcm1hdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tTdHJpbmdGb3JtYXRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgdmFyIF9hLCBfYjtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJhZyA9IGluc3QuX3pvZC5iYWc7XHJcbiAgICAgICAgYmFnLmZvcm1hdCA9IGRlZi5mb3JtYXQ7XHJcbiAgICAgICAgaWYgKGRlZi5wYXR0ZXJuKSB7XHJcbiAgICAgICAgICAgIGJhZy5wYXR0ZXJucyA/PyAoYmFnLnBhdHRlcm5zID0gbmV3IFNldCgpKTtcclxuICAgICAgICAgICAgYmFnLnBhdHRlcm5zLmFkZChkZWYucGF0dGVybik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZiAoZGVmLnBhdHRlcm4pXHJcbiAgICAgICAgKF9hID0gaW5zdC5fem9kKS5jaGVjayA/PyAoX2EuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgICAgICBkZWYucGF0dGVybi5sYXN0SW5kZXggPSAwO1xyXG4gICAgICAgICAgICBpZiAoZGVmLnBhdHRlcm4udGVzdChwYXlsb2FkLnZhbHVlKSlcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW46IFwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXHJcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IGRlZi5mb3JtYXQsXHJcbiAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgICAgIC4uLihkZWYucGF0dGVybiA/IHsgcGF0dGVybjogZGVmLnBhdHRlcm4udG9TdHJpbmcoKSB9IDoge30pLFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIGVsc2VcclxuICAgICAgICAoX2IgPSBpbnN0Ll96b2QpLmNoZWNrID8/IChfYi5jaGVjayA9ICgpID0+IHsgfSk7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrUmVnZXggPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENoZWNrUmVnZXhcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZENoZWNrU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgZGVmLnBhdHRlcm4ubGFzdEluZGV4ID0gMDtcclxuICAgICAgICBpZiAoZGVmLnBhdHRlcm4udGVzdChwYXlsb2FkLnZhbHVlKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBvcmlnaW46IFwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcclxuICAgICAgICAgICAgZm9ybWF0OiBcInJlZ2V4XCIsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBwYXR0ZXJuOiBkZWYucGF0dGVybi50b1N0cmluZygpLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrTG93ZXJDYXNlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja0xvd2VyQ2FzZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmxvd2VyY2FzZSk7XHJcbiAgICAkWm9kQ2hlY2tTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja1VwcGVyQ2FzZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tVcHBlckNhc2VcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy51cHBlcmNhc2UpO1xyXG4gICAgJFpvZENoZWNrU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tJbmNsdWRlcyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2hlY2tJbmNsdWRlc1wiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29uc3QgZXNjYXBlZFJlZ2V4ID0gdXRpbC5lc2NhcGVSZWdleChkZWYuaW5jbHVkZXMpO1xyXG4gICAgY29uc3QgcGF0dGVybiA9IG5ldyBSZWdFeHAodHlwZW9mIGRlZi5wb3NpdGlvbiA9PT0gXCJudW1iZXJcIiA/IGBeLnske2RlZi5wb3NpdGlvbn19JHtlc2NhcGVkUmVnZXh9YCA6IGVzY2FwZWRSZWdleCk7XHJcbiAgICBkZWYucGF0dGVybiA9IHBhdHRlcm47XHJcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJhZyA9IGluc3QuX3pvZC5iYWc7XHJcbiAgICAgICAgYmFnLnBhdHRlcm5zID8/IChiYWcucGF0dGVybnMgPSBuZXcgU2V0KCkpO1xyXG4gICAgICAgIGJhZy5wYXR0ZXJucy5hZGQocGF0dGVybik7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgaWYgKHBheWxvYWQudmFsdWUuaW5jbHVkZXMoZGVmLmluY2x1ZGVzLCBkZWYucG9zaXRpb24pKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIG9yaWdpbjogXCJzdHJpbmdcIixcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxyXG4gICAgICAgICAgICBmb3JtYXQ6IFwiaW5jbHVkZXNcIixcclxuICAgICAgICAgICAgaW5jbHVkZXM6IGRlZi5pbmNsdWRlcyxcclxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ2hlY2tTdGFydHNXaXRoID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja1N0YXJ0c1dpdGhcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZENoZWNrLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvbnN0IHBhdHRlcm4gPSBuZXcgUmVnRXhwKGBeJHt1dGlsLmVzY2FwZVJlZ2V4KGRlZi5wcmVmaXgpfS4qYCk7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSBwYXR0ZXJuKTtcclxuICAgIGluc3QuX3pvZC5vbmF0dGFjaC5wdXNoKChpbnN0KSA9PiB7XHJcbiAgICAgICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcclxuICAgICAgICBiYWcucGF0dGVybnMgPz8gKGJhZy5wYXR0ZXJucyA9IG5ldyBTZXQoKSk7XHJcbiAgICAgICAgYmFnLnBhdHRlcm5zLmFkZChwYXR0ZXJuKTtcclxuICAgIH0pO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBpZiAocGF5bG9hZC52YWx1ZS5zdGFydHNXaXRoKGRlZi5wcmVmaXgpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIG9yaWdpbjogXCJzdHJpbmdcIixcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxyXG4gICAgICAgICAgICBmb3JtYXQ6IFwic3RhcnRzX3dpdGhcIixcclxuICAgICAgICAgICAgcHJlZml4OiBkZWYucHJlZml4LFxyXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja0VuZHNXaXRoID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja0VuZHNXaXRoXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb25zdCBwYXR0ZXJuID0gbmV3IFJlZ0V4cChgLioke3V0aWwuZXNjYXBlUmVnZXgoZGVmLnN1ZmZpeCl9JGApO1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcGF0dGVybik7XHJcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJhZyA9IGluc3QuX3pvZC5iYWc7XHJcbiAgICAgICAgYmFnLnBhdHRlcm5zID8/IChiYWcucGF0dGVybnMgPSBuZXcgU2V0KCkpO1xyXG4gICAgICAgIGJhZy5wYXR0ZXJucy5hZGQocGF0dGVybik7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgaWYgKHBheWxvYWQudmFsdWUuZW5kc1dpdGgoZGVmLnN1ZmZpeCkpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgb3JpZ2luOiBcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXHJcbiAgICAgICAgICAgIGZvcm1hdDogXCJlbmRzX3dpdGhcIixcclxuICAgICAgICAgICAgc3VmZml4OiBkZWYuc3VmZml4LFxyXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuLy8vLy8gICAgJFpvZENoZWNrUHJvcGVydHkgICAgLy8vLy9cclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuZnVuY3Rpb24gaGFuZGxlQ2hlY2tQcm9wZXJ0eVJlc3VsdChyZXN1bHQsIHBheWxvYWQsIHByb3BlcnR5KSB7XHJcbiAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKC4uLnV0aWwucHJlZml4SXNzdWVzKHByb3BlcnR5LCByZXN1bHQuaXNzdWVzKSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja1Byb3BlcnR5ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja1Byb3BlcnR5XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRlZi5zY2hlbWEuX3pvZC5ydW4oe1xyXG4gICAgICAgICAgICB2YWx1ZTogcGF5bG9hZC52YWx1ZVtkZWYucHJvcGVydHldLFxyXG4gICAgICAgICAgICBpc3N1ZXM6IFtdLFxyXG4gICAgICAgIH0sIHt9KTtcclxuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4gaGFuZGxlQ2hlY2tQcm9wZXJ0eVJlc3VsdChyZXN1bHQsIHBheWxvYWQsIGRlZi5wcm9wZXJ0eSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBoYW5kbGVDaGVja1Byb3BlcnR5UmVzdWx0KHJlc3VsdCwgcGF5bG9hZCwgZGVmLnByb3BlcnR5KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDaGVja01pbWVUeXBlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja01pbWVUeXBlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb25zdCBtaW1lU2V0ID0gbmV3IFNldChkZWYubWltZSk7XHJcbiAgICBpbnN0Ll96b2Qub25hdHRhY2gucHVzaCgoaW5zdCkgPT4ge1xyXG4gICAgICAgIGluc3QuX3pvZC5iYWcubWltZSA9IGRlZi5taW1lO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGlmIChtaW1lU2V0LmhhcyhwYXlsb2FkLnZhbHVlLnR5cGUpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF92YWx1ZVwiLFxyXG4gICAgICAgICAgICB2YWx1ZXM6IGRlZi5taW1lLFxyXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZS50eXBlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENoZWNrT3ZlcndyaXRlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDaGVja092ZXJ3cml0ZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kQ2hlY2suaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBwYXlsb2FkLnZhbHVlID0gZGVmLnR4KHBheWxvYWQudmFsdWUpO1xyXG4gICAgfTtcclxufSk7XHJcbiIsImV4cG9ydCBjbGFzcyBEb2Mge1xyXG4gICAgY29uc3RydWN0b3IoYXJncyA9IFtdKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZW50ID0gW107XHJcbiAgICAgICAgdGhpcy5pbmRlbnQgPSAwO1xyXG4gICAgICAgIGlmICh0aGlzKVxyXG4gICAgICAgICAgICB0aGlzLmFyZ3MgPSBhcmdzO1xyXG4gICAgfVxyXG4gICAgaW5kZW50ZWQoZm4pIHtcclxuICAgICAgICB0aGlzLmluZGVudCArPSAxO1xyXG4gICAgICAgIGZuKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuaW5kZW50IC09IDE7XHJcbiAgICB9XHJcbiAgICB3cml0ZShhcmcpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGFyZyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGFyZyh0aGlzLCB7IGV4ZWN1dGlvbjogXCJzeW5jXCIgfSk7XHJcbiAgICAgICAgICAgIGFyZyh0aGlzLCB7IGV4ZWN1dGlvbjogXCJhc3luY1wiIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhcmc7XHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KFwiXFxuXCIpLmZpbHRlcigoeCkgPT4geCk7XHJcbiAgICAgICAgY29uc3QgbWluSW5kZW50ID0gTWF0aC5taW4oLi4ubGluZXMubWFwKCh4KSA9PiB4Lmxlbmd0aCAtIHgudHJpbVN0YXJ0KCkubGVuZ3RoKSk7XHJcbiAgICAgICAgY29uc3QgZGVkZW50ZWQgPSBsaW5lcy5tYXAoKHgpID0+IHguc2xpY2UobWluSW5kZW50KSkubWFwKCh4KSA9PiBcIiBcIi5yZXBlYXQodGhpcy5pbmRlbnQgKiAyKSArIHgpO1xyXG4gICAgICAgIGZvciAoY29uc3QgbGluZSBvZiBkZWRlbnRlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQucHVzaChsaW5lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb21waWxlKCkge1xyXG4gICAgICAgIGNvbnN0IEYgPSBGdW5jdGlvbjtcclxuICAgICAgICBjb25zdCBhcmdzID0gdGhpcz8uYXJncztcclxuICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcz8uY29udGVudCA/PyBbYGBdO1xyXG4gICAgICAgIGNvbnN0IGxpbmVzID0gWy4uLmNvbnRlbnQubWFwKCh4KSA9PiBgICAke3h9YCldO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGxpbmVzLmpvaW4oXCJcXG5cIikpO1xyXG4gICAgICAgIHJldHVybiBuZXcgRiguLi5hcmdzLCBsaW5lcy5qb2luKFwiXFxuXCIpKTtcclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgY29uc3QgdmVyc2lvbiA9IHtcclxuICAgIG1ham9yOiA0LFxyXG4gICAgbWlub3I6IDQsXHJcbiAgICBwYXRjaDogMyxcclxufTtcclxuIiwiaW1wb3J0ICogYXMgY2hlY2tzIGZyb20gXCIuL2NoZWNrcy5qc1wiO1xyXG5pbXBvcnQgKiBhcyBjb3JlIGZyb20gXCIuL2NvcmUuanNcIjtcclxuaW1wb3J0IHsgRG9jIH0gZnJvbSBcIi4vZG9jLmpzXCI7XHJcbmltcG9ydCB7IHBhcnNlLCBwYXJzZUFzeW5jLCBzYWZlUGFyc2UsIHNhZmVQYXJzZUFzeW5jIH0gZnJvbSBcIi4vcGFyc2UuanNcIjtcclxuaW1wb3J0ICogYXMgcmVnZXhlcyBmcm9tIFwiLi9yZWdleGVzLmpzXCI7XHJcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4vdXRpbC5qc1wiO1xyXG5pbXBvcnQgeyB2ZXJzaW9uIH0gZnJvbSBcIi4vdmVyc2lvbnMuanNcIjtcclxuZXhwb3J0IGNvbnN0ICRab2RUeXBlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RUeXBlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIHZhciBfYTtcclxuICAgIGluc3QgPz8gKGluc3QgPSB7fSk7XHJcbiAgICBpbnN0Ll96b2QuZGVmID0gZGVmOyAvLyBzZXQgX2RlZiBwcm9wZXJ0eVxyXG4gICAgaW5zdC5fem9kLmJhZyA9IGluc3QuX3pvZC5iYWcgfHwge307IC8vIGluaXRpYWxpemUgX2JhZyBvYmplY3RcclxuICAgIGluc3QuX3pvZC52ZXJzaW9uID0gdmVyc2lvbjtcclxuICAgIGNvbnN0IGNoZWNrcyA9IFsuLi4oaW5zdC5fem9kLmRlZi5jaGVja3MgPz8gW10pXTtcclxuICAgIC8vIGlmIGluc3QgaXMgaXRzZWxmIGEgY2hlY2tzLiRab2RDaGVjaywgcnVuIGl0IGFzIGEgY2hlY2tcclxuICAgIGlmIChpbnN0Ll96b2QudHJhaXRzLmhhcyhcIiRab2RDaGVja1wiKSkge1xyXG4gICAgICAgIGNoZWNrcy51bnNoaWZ0KGluc3QpO1xyXG4gICAgfVxyXG4gICAgZm9yIChjb25zdCBjaCBvZiBjaGVja3MpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGZuIG9mIGNoLl96b2Qub25hdHRhY2gpIHtcclxuICAgICAgICAgICAgZm4oaW5zdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGNoZWNrcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAvLyBkZWZlcnJlZCBpbml0aWFsaXplclxyXG4gICAgICAgIC8vIGluc3QuX3pvZC5wYXJzZSBpcyBub3QgeWV0IGRlZmluZWRcclxuICAgICAgICAoX2EgPSBpbnN0Ll96b2QpLmRlZmVycmVkID8/IChfYS5kZWZlcnJlZCA9IFtdKTtcclxuICAgICAgICBpbnN0Ll96b2QuZGVmZXJyZWQ/LnB1c2goKCkgPT4ge1xyXG4gICAgICAgICAgICBpbnN0Ll96b2QucnVuID0gaW5zdC5fem9kLnBhcnNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY29uc3QgcnVuQ2hlY2tzID0gKHBheWxvYWQsIGNoZWNrcywgY3R4KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpc0Fib3J0ZWQgPSB1dGlsLmFib3J0ZWQocGF5bG9hZCk7XHJcbiAgICAgICAgICAgIGxldCBhc3luY1Jlc3VsdDtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBjaCBvZiBjaGVja3MpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjaC5fem9kLmRlZi53aGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHV0aWwuZXhwbGljaXRseUFib3J0ZWQocGF5bG9hZCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3VsZFJ1biA9IGNoLl96b2QuZGVmLndoZW4ocGF5bG9hZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzaG91bGRSdW4pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNBYm9ydGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyTGVuID0gcGF5bG9hZC5pc3N1ZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgXyA9IGNoLl96b2QuY2hlY2socGF5bG9hZCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoXyBpbnN0YW5jZW9mIFByb21pc2UgJiYgY3R4Py5hc3luYyA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgY29yZS4kWm9kQXN5bmNFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGFzeW5jUmVzdWx0IHx8IF8gaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXN5bmNSZXN1bHQgPSAoYXN5bmNSZXN1bHQgPz8gUHJvbWlzZS5yZXNvbHZlKCkpLnRoZW4oYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBfO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0TGVuID0gcGF5bG9hZC5pc3N1ZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dExlbiA9PT0gY3VyckxlbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0Fib3J0ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0Fib3J0ZWQgPSB1dGlsLmFib3J0ZWQocGF5bG9hZCwgY3Vyckxlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0TGVuID0gcGF5bG9hZC5pc3N1ZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0TGVuID09PSBjdXJyTGVuKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQWJvcnRlZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNBYm9ydGVkID0gdXRpbC5hYm9ydGVkKHBheWxvYWQsIGN1cnJMZW4pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChhc3luY1Jlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jUmVzdWx0LnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBoYW5kbGVDYW5hcnlSZXN1bHQgPSAoY2FuYXJ5LCBwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICAgICAgLy8gYWJvcnQgaWYgdGhlIGNhbmFyeSBpcyBhYm9ydGVkXHJcbiAgICAgICAgICAgIGlmICh1dGlsLmFib3J0ZWQoY2FuYXJ5KSkge1xyXG4gICAgICAgICAgICAgICAgY2FuYXJ5LmFib3J0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbmFyeTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBydW4gY2hlY2tzIGZpcnN0LCB0aGVuXHJcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrUmVzdWx0ID0gcnVuQ2hlY2tzKHBheWxvYWQsIGNoZWNrcywgY3R4KTtcclxuICAgICAgICAgICAgaWYgKGNoZWNrUmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGN0eC5hc3luYyA9PT0gZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGNvcmUuJFpvZEFzeW5jRXJyb3IoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjaGVja1Jlc3VsdC50aGVuKChjaGVja1Jlc3VsdCkgPT4gaW5zdC5fem9kLnBhcnNlKGNoZWNrUmVzdWx0LCBjdHgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaW5zdC5fem9kLnBhcnNlKGNoZWNrUmVzdWx0LCBjdHgpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaW5zdC5fem9kLnJ1biA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICAgICAgaWYgKGN0eC5za2lwQ2hlY2tzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdC5fem9kLnBhcnNlKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGN0eC5kaXJlY3Rpb24gPT09IFwiYmFja3dhcmRcIikge1xyXG4gICAgICAgICAgICAgICAgLy8gcnVuIGNhbmFyeVxyXG4gICAgICAgICAgICAgICAgLy8gaW5pdGlhbCBwYXNzIChubyBjaGVja3MpXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjYW5hcnkgPSBpbnN0Ll96b2QucGFyc2UoeyB2YWx1ZTogcGF5bG9hZC52YWx1ZSwgaXNzdWVzOiBbXSB9LCB7IC4uLmN0eCwgc2tpcENoZWNrczogdHJ1ZSB9KTtcclxuICAgICAgICAgICAgICAgIGlmIChjYW5hcnkgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbmFyeS50aGVuKChjYW5hcnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUNhbmFyeVJlc3VsdChjYW5hcnksIHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlQ2FuYXJ5UmVzdWx0KGNhbmFyeSwgcGF5bG9hZCwgY3R4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBmb3J3YXJkXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGluc3QuX3pvZC5wYXJzZShwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGN0eC5hc3luYyA9PT0gZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IGNvcmUuJFpvZEFzeW5jRXJyb3IoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigocmVzdWx0KSA9PiBydW5DaGVja3MocmVzdWx0LCBjaGVja3MsIGN0eCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBydW5DaGVja3MocmVzdWx0LCBjaGVja3MsIGN0eCk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIC8vIExhenkgaW5pdGlhbGl6ZSB+c3RhbmRhcmQgdG8gYXZvaWQgY3JlYXRpbmcgb2JqZWN0cyBmb3IgZXZlcnkgc2NoZW1hXHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdCwgXCJ+c3RhbmRhcmRcIiwgKCkgPT4gKHtcclxuICAgICAgICB2YWxpZGF0ZTogKHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByID0gc2FmZVBhcnNlKGluc3QsIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByLnN1Y2Nlc3MgPyB7IHZhbHVlOiByLmRhdGEgfSA6IHsgaXNzdWVzOiByLmVycm9yPy5pc3N1ZXMgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoXykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNhZmVQYXJzZUFzeW5jKGluc3QsIHZhbHVlKS50aGVuKChyKSA9PiAoci5zdWNjZXNzID8geyB2YWx1ZTogci5kYXRhIH0gOiB7IGlzc3Vlczogci5lcnJvcj8uaXNzdWVzIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdmVuZG9yOiBcInpvZFwiLFxyXG4gICAgICAgIHZlcnNpb246IDEsXHJcbiAgICB9KSk7XHJcbn0pO1xyXG5leHBvcnQgeyBjbG9uZSB9IGZyb20gXCIuL3V0aWwuanNcIjtcclxuZXhwb3J0IGNvbnN0ICRab2RTdHJpbmcgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFN0cmluZ1wiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGF0dGVybiA9IFsuLi4oaW5zdD8uX3pvZC5iYWc/LnBhdHRlcm5zID8/IFtdKV0ucG9wKCkgPz8gcmVnZXhlcy5zdHJpbmcoaW5zdC5fem9kLmJhZyk7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgXykgPT4ge1xyXG4gICAgICAgIGlmIChkZWYuY29lcmNlKVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IFN0cmluZyhwYXlsb2FkLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoXykgeyB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLnZhbHVlID09PSBcInN0cmluZ1wiKVxyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kU3RyaW5nRm9ybWF0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RTdHJpbmdGb3JtYXRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gY2hlY2sgaW5pdGlhbGl6YXRpb24gbXVzdCBjb21lIGZpcnN0XHJcbiAgICBjaGVja3MuJFpvZENoZWNrU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgICRab2RTdHJpbmcuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RHVUlEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RHVUlEXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuZ3VpZCk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kVVVJRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kVVVJRFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBpZiAoZGVmLnZlcnNpb24pIHtcclxuICAgICAgICBjb25zdCB2ZXJzaW9uTWFwID0ge1xyXG4gICAgICAgICAgICB2MTogMSxcclxuICAgICAgICAgICAgdjI6IDIsXHJcbiAgICAgICAgICAgIHYzOiAzLFxyXG4gICAgICAgICAgICB2NDogNCxcclxuICAgICAgICAgICAgdjU6IDUsXHJcbiAgICAgICAgICAgIHY2OiA2LFxyXG4gICAgICAgICAgICB2NzogNyxcclxuICAgICAgICAgICAgdjg6IDgsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCB2ID0gdmVyc2lvbk1hcFtkZWYudmVyc2lvbl07XHJcbiAgICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIFVVSUQgdmVyc2lvbjogXCIke2RlZi52ZXJzaW9ufVwiYCk7XHJcbiAgICAgICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy51dWlkKHYpKTtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgICAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLnV1aWQoKSk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kRW1haWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEVtYWlsXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuZW1haWwpO1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZFVSTCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kVVJMXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBUcmltIHdoaXRlc3BhY2UgZnJvbSBpbnB1dFxyXG4gICAgICAgICAgICBjb25zdCB0cmltbWVkID0gcGF5bG9hZC52YWx1ZS50cmltKCk7XHJcbiAgICAgICAgICAgIC8vIFdoZW4gbm9ybWFsaXplIGlzIG9mZiwgcmVxdWlyZSA6Ly8gZm9yIGh0dHAvaHR0cHMgVVJMc1xyXG4gICAgICAgICAgICAvLyBUaGlzIHByZXZlbnRzIHN0cmluZ3MgbGlrZSBcImh0dHA6ZXhhbXBsZS5jb21cIiBvciBcImh0dHBzOi9wYXRoXCIgZnJvbSBiZWluZyBzaWxlbnRseSBhY2NlcHRlZFxyXG4gICAgICAgICAgICBpZiAoIWRlZi5ub3JtYWxpemUgJiYgZGVmLnByb3RvY29sPy5zb3VyY2UgPT09IHJlZ2V4ZXMuaHR0cFByb3RvY29sLnNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCEvXmh0dHBzPzpcXC9cXC8vaS50ZXN0KHRyaW1tZWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBcInVybFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RlOiBcIkludmFsaWQgVVJMIGZvcm1hdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh0cmltbWVkKTtcclxuICAgICAgICAgICAgaWYgKGRlZi5ob3N0bmFtZSkge1xyXG4gICAgICAgICAgICAgICAgZGVmLmhvc3RuYW1lLmxhc3RJbmRleCA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWRlZi5ob3N0bmFtZS50ZXN0KHVybC5ob3N0bmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQ6IFwidXJsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdGU6IFwiSW52YWxpZCBob3N0bmFtZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuOiBkZWYuaG9zdG5hbWUuc291cmNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRlZi5wcm90b2NvbCkge1xyXG4gICAgICAgICAgICAgICAgZGVmLnByb3RvY29sLmxhc3RJbmRleCA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWRlZi5wcm90b2NvbC50ZXN0KHVybC5wcm90b2NvbC5lbmRzV2l0aChcIjpcIikgPyB1cmwucHJvdG9jb2wuc2xpY2UoMCwgLTEpIDogdXJsLnByb3RvY29sKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdDogXCJ1cmxcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm90ZTogXCJJbnZhbGlkIHByb3RvY29sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdHRlcm46IGRlZi5wcm90b2NvbC5zb3VyY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBTZXQgdGhlIG91dHB1dCB2YWx1ZSBiYXNlZCBvbiBub3JtYWxpemUgZmxhZ1xyXG4gICAgICAgICAgICBpZiAoZGVmLm5vcm1hbGl6ZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gVXNlIG5vcm1hbGl6ZWQgVVJMXHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gdXJsLmhyZWY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBQcmVzZXJ2ZSB0aGUgb3JpZ2luYWwgaW5wdXQgKHRyaW1tZWQpXHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gdHJpbW1lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChfKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxyXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBcInVybFwiLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZEVtb2ppID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RFbW9qaVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmVtb2ppKCkpO1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZE5hbm9JRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTmFub0lEXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMubmFub2lkKTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuLyoqXHJcbiAqIEBkZXByZWNhdGVkIENVSUQgdjEgaXMgZGVwcmVjYXRlZCBieSBpdHMgYXV0aG9ycyBkdWUgdG8gaW5mb3JtYXRpb24gbGVha2FnZVxyXG4gKiAodGltZXN0YW1wcyBlbWJlZGRlZCBpbiB0aGUgaWQpLiBVc2Uge0BsaW5rICRab2RDVUlEMn0gaW5zdGVhZC5cclxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXJhbGxlbGRyaXZlL2N1aWQuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgJFpvZENVSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENVSURcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5jdWlkKTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDVUlEMiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ1VJRDJcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5jdWlkMik7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kVUxJRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kVUxJRFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLnVsaWQpO1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZFhJRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kWElEXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMueGlkKTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RLU1VJRCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kS1NVSURcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5rc3VpZCk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kSVNPRGF0ZVRpbWUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZElTT0RhdGVUaW1lXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuZGF0ZXRpbWUoZGVmKSk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kSVNPRGF0ZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kSVNPRGF0ZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmRhdGUpO1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZElTT1RpbWUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZElTT1RpbWVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy50aW1lKGRlZikpO1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZElTT0R1cmF0aW9uID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RJU09EdXJhdGlvblwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmR1cmF0aW9uKTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RJUHY0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RJUHY0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuaXB2NCk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5iYWcuZm9ybWF0ID0gYGlwdjRgO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RJUHY2ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RJUHY2XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuaXB2Nik7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5iYWcuZm9ybWF0ID0gYGlwdjZgO1xyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIG5ldyBVUkwoYGh0dHA6Ly9bJHtwYXlsb2FkLnZhbHVlfV1gKTtcclxuICAgICAgICAgICAgLy8gcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxyXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBcImlwdjZcIixcclxuICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RNQUMgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE1BQ1wiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLm1hYyhkZWYuZGVsaW1pdGVyKSk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5iYWcuZm9ybWF0ID0gYG1hY2A7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZENJRFJ2NCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ0lEUnY0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5wYXR0ZXJuID8/IChkZWYucGF0dGVybiA9IHJlZ2V4ZXMuY2lkcnY0KTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDSURSdjYgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZENJRFJ2NlwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmNpZHJ2Nik7IC8vIG5vdCB1c2VkIGZvciB2YWxpZGF0aW9uXHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcGFydHMgPSBwYXlsb2FkLnZhbHVlLnNwbGl0KFwiL1wiKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoICE9PSAyKVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IFthZGRyZXNzLCBwcmVmaXhdID0gcGFydHM7XHJcbiAgICAgICAgICAgIGlmICghcHJlZml4KVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHByZWZpeE51bSA9IE51bWJlcihwcmVmaXgpO1xyXG4gICAgICAgICAgICBpZiAoYCR7cHJlZml4TnVtfWAgIT09IHByZWZpeClcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xyXG4gICAgICAgICAgICBpZiAocHJlZml4TnVtIDwgMCB8fCBwcmVmaXhOdW0gPiAxMjgpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBuZXcgVVJMKGBodHRwOi8vWyR7YWRkcmVzc31dYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIHtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXHJcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IFwiY2lkcnY2XCIsXHJcbiAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufSk7XHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyAgIFpvZEJhc2U2NCAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZEJhc2U2NChkYXRhKSB7XHJcbiAgICBpZiAoZGF0YSA9PT0gXCJcIilcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIC8vIGF0b2IgaWdub3JlcyB3aGl0ZXNwYWNlLCBzbyByZWplY3QgaXQgdXAgZnJvbnQuXHJcbiAgICBpZiAoL1xccy8udGVzdChkYXRhKSlcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICBpZiAoZGF0YS5sZW5ndGggJSA0ICE9PSAwKVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGF0b2IoZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCAkWm9kQmFzZTY0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RCYXNlNjRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5iYXNlNjQpO1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QuYmFnLmNvbnRlbnRFbmNvZGluZyA9IFwiYmFzZTY0XCI7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGlmIChpc1ZhbGlkQmFzZTY0KHBheWxvYWQudmFsdWUpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcclxuICAgICAgICAgICAgZm9ybWF0OiBcImJhc2U2NFwiLFxyXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vICAgWm9kQmFzZTY0ICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkQmFzZTY0VVJMKGRhdGEpIHtcclxuICAgIGlmICghcmVnZXhlcy5iYXNlNjR1cmwudGVzdChkYXRhKSlcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICBjb25zdCBiYXNlNjQgPSBkYXRhLnJlcGxhY2UoL1stX10vZywgKGMpID0+IChjID09PSBcIi1cIiA/IFwiK1wiIDogXCIvXCIpKTtcclxuICAgIGNvbnN0IHBhZGRlZCA9IGJhc2U2NC5wYWRFbmQoTWF0aC5jZWlsKGJhc2U2NC5sZW5ndGggLyA0KSAqIDQsIFwiPVwiKTtcclxuICAgIHJldHVybiBpc1ZhbGlkQmFzZTY0KHBhZGRlZCk7XHJcbn1cclxuZXhwb3J0IGNvbnN0ICRab2RCYXNlNjRVUkwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEJhc2U2NFVSTFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBkZWYucGF0dGVybiA/PyAoZGVmLnBhdHRlcm4gPSByZWdleGVzLmJhc2U2NHVybCk7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5iYWcuY29udGVudEVuY29kaW5nID0gXCJiYXNlNjR1cmxcIjtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgaWYgKGlzVmFsaWRCYXNlNjRVUkwocGF5bG9hZC52YWx1ZSkpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2Zvcm1hdFwiLFxyXG4gICAgICAgICAgICBmb3JtYXQ6IFwiYmFzZTY0dXJsXCIsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBjb250aW51ZTogIWRlZi5hYm9ydCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZEUxNjQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEUxNjRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgZGVmLnBhdHRlcm4gPz8gKGRlZi5wYXR0ZXJuID0gcmVnZXhlcy5lMTY0KTtcclxuICAgICRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vICAgWm9kSldUICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkSldUKHRva2VuLCBhbGdvcml0aG0gPSBudWxsKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHRva2Vuc1BhcnRzID0gdG9rZW4uc3BsaXQoXCIuXCIpO1xyXG4gICAgICAgIGlmICh0b2tlbnNQYXJ0cy5sZW5ndGggIT09IDMpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICBjb25zdCBbaGVhZGVyXSA9IHRva2Vuc1BhcnRzO1xyXG4gICAgICAgIGlmICghaGVhZGVyKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgIGNvbnN0IHBhcnNlZEhlYWRlciA9IEpTT04ucGFyc2UoYXRvYihoZWFkZXIpKTtcclxuICAgICAgICBpZiAoXCJ0eXBcIiBpbiBwYXJzZWRIZWFkZXIgJiYgcGFyc2VkSGVhZGVyPy50eXAgIT09IFwiSldUXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICBpZiAoIXBhcnNlZEhlYWRlci5hbGcpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICBpZiAoYWxnb3JpdGhtICYmICghKFwiYWxnXCIgaW4gcGFyc2VkSGVhZGVyKSB8fCBwYXJzZWRIZWFkZXIuYWxnICE9PSBhbGdvcml0aG0pKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjb25zdCAkWm9kSldUID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RKV1RcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QuY2hlY2sgPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgIGlmIChpc1ZhbGlkSldUKHBheWxvYWQudmFsdWUsIGRlZi5hbGcpKVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcclxuICAgICAgICAgICAgZm9ybWF0OiBcImp3dFwiLFxyXG4gICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgY29udGludWU6ICFkZWYuYWJvcnQsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDdXN0b21TdHJpbmdGb3JtYXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEN1c3RvbVN0cmluZ0Zvcm1hdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgaWYgKGRlZi5mbihwYXlsb2FkLnZhbHVlKSlcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZm9ybWF0XCIsXHJcbiAgICAgICAgICAgIGZvcm1hdDogZGVmLmZvcm1hdCxcclxuICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlOiAhZGVmLmFib3J0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kTnVtYmVyID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2ROdW1iZXJcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnBhdHRlcm4gPSBpbnN0Ll96b2QuYmFnLnBhdHRlcm4gPz8gcmVnZXhlcy5udW1iZXI7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgX2N0eCkgPT4ge1xyXG4gICAgICAgIGlmIChkZWYuY29lcmNlKVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IE51bWJlcihwYXlsb2FkLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoXykgeyB9XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09IFwibnVtYmVyXCIgJiYgIU51bWJlci5pc05hTihpbnB1dCkgJiYgTnVtYmVyLmlzRmluaXRlKGlucHV0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVjZWl2ZWQgPSB0eXBlb2YgaW5wdXQgPT09IFwibnVtYmVyXCJcclxuICAgICAgICAgICAgPyBOdW1iZXIuaXNOYU4oaW5wdXQpXHJcbiAgICAgICAgICAgICAgICA/IFwiTmFOXCJcclxuICAgICAgICAgICAgICAgIDogIU51bWJlci5pc0Zpbml0ZShpbnB1dClcclxuICAgICAgICAgICAgICAgICAgICA/IFwiSW5maW5pdHlcIlxyXG4gICAgICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkXHJcbiAgICAgICAgICAgIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBleHBlY3RlZDogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIC4uLihyZWNlaXZlZCA/IHsgcmVjZWl2ZWQgfSA6IHt9KSxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZE51bWJlckZvcm1hdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTnVtYmVyRm9ybWF0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNoZWNrcy4kWm9kQ2hlY2tOdW1iZXJGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgJFpvZE51bWJlci5pbml0KGluc3QsIGRlZik7IC8vIG5vIGZvcm1hdCBjaGVja3NcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQm9vbGVhbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQm9vbGVhblwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGF0dGVybiA9IHJlZ2V4ZXMuYm9vbGVhbjtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgaWYgKGRlZi5jb2VyY2UpXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gQm9vbGVhbihwYXlsb2FkLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoXykgeyB9XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09IFwiYm9vbGVhblwiKVxyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwiYm9vbGVhblwiLFxyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZEJpZ0ludCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQmlnSW50XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXR0ZXJuID0gcmVnZXhlcy5iaWdpbnQ7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgX2N0eCkgPT4ge1xyXG4gICAgICAgIGlmIChkZWYuY29lcmNlKVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IEJpZ0ludChwYXlsb2FkLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoXykgeyB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLnZhbHVlID09PSBcImJpZ2ludFwiKVxyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwiYmlnaW50XCIsXHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQmlnSW50Rm9ybWF0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RCaWdJbnRGb3JtYXRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY2hlY2tzLiRab2RDaGVja0JpZ0ludEZvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICAkWm9kQmlnSW50LmluaXQoaW5zdCwgZGVmKTsgLy8gbm8gZm9ybWF0IGNoZWNrc1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RTeW1ib2wgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFN5bWJvbFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgX2N0eCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSBcInN5bWJvbFwiKVxyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwic3ltYm9sXCIsXHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kVW5kZWZpbmVkID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RVbmRlZmluZWRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnBhdHRlcm4gPSByZWdleGVzLnVuZGVmaW5lZDtcclxuICAgIGluc3QuX3pvZC52YWx1ZXMgPSBuZXcgU2V0KFt1bmRlZmluZWRdKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09IFwidW5kZWZpbmVkXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBleHBlY3RlZDogXCJ1bmRlZmluZWRcIixcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2ROdWxsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2ROdWxsXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXR0ZXJuID0gcmVnZXhlcy5udWxsO1xyXG4gICAgaW5zdC5fem9kLnZhbHVlcyA9IG5ldyBTZXQoW251bGxdKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmIChpbnB1dCA9PT0gbnVsbClcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGV4cGVjdGVkOiBcIm51bGxcIixcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RBbnkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEFueVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCkgPT4gcGF5bG9hZDtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kVW5rbm93biA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kVW5rbm93blwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCkgPT4gcGF5bG9hZDtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kTmV2ZXIgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE5ldmVyXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGV4cGVjdGVkOiBcIm5ldmVyXCIsXHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kVm9pZCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kVm9pZFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgX2N0eCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSBcInVuZGVmaW5lZFwiKVxyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwidm9pZFwiLFxyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZERhdGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZERhdGVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcclxuICAgICAgICBpZiAoZGVmLmNvZXJjZSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IG5ldyBEYXRlKHBheWxvYWQudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChfZXJyKSB7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IGlzRGF0ZSA9IGlucHV0IGluc3RhbmNlb2YgRGF0ZTtcclxuICAgICAgICBjb25zdCBpc1ZhbGlkRGF0ZSA9IGlzRGF0ZSAmJiAhTnVtYmVyLmlzTmFOKGlucHV0LmdldFRpbWUoKSk7XHJcbiAgICAgICAgaWYgKGlzVmFsaWREYXRlKVxyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwiZGF0ZVwiLFxyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgLi4uKGlzRGF0ZSA/IHsgcmVjZWl2ZWQ6IFwiSW52YWxpZCBEYXRlXCIgfSA6IHt9KSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5mdW5jdGlvbiBoYW5kbGVBcnJheVJlc3VsdChyZXN1bHQsIGZpbmFsLCBpbmRleCkge1xyXG4gICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgZmluYWwuaXNzdWVzLnB1c2goLi4udXRpbC5wcmVmaXhJc3N1ZXMoaW5kZXgsIHJlc3VsdC5pc3N1ZXMpKTtcclxuICAgIH1cclxuICAgIGZpbmFsLnZhbHVlW2luZGV4XSA9IHJlc3VsdC52YWx1ZTtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZEFycmF5ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RBcnJheVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogXCJhcnJheVwiLFxyXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXlsb2FkLnZhbHVlID0gQXJyYXkoaW5wdXQubGVuZ3RoKTtcclxuICAgICAgICBjb25zdCBwcm9tcyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGlucHV0W2ldO1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYuZWxlbWVudC5fem9kLnJ1bih7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogaXRlbSxcclxuICAgICAgICAgICAgICAgIGlzc3VlczogW10sXHJcbiAgICAgICAgICAgIH0sIGN0eCk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKHJlc3VsdC50aGVuKChyZXN1bHQpID0+IGhhbmRsZUFycmF5UmVzdWx0KHJlc3VsdCwgcGF5bG9hZCwgaSkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZUFycmF5UmVzdWx0KHJlc3VsdCwgcGF5bG9hZCwgaSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHByb21zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbXMpLnRoZW4oKCkgPT4gcGF5bG9hZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXlsb2FkOyAvL2hhbmRsZUFycmF5UmVzdWx0c0FzeW5jKHBhcnNlUmVzdWx0cywgZmluYWwpO1xyXG4gICAgfTtcclxufSk7XHJcbmZ1bmN0aW9uIGhhbmRsZVByb3BlcnR5UmVzdWx0KHJlc3VsdCwgZmluYWwsIGtleSwgaW5wdXQsIGlzT3B0aW9uYWxJbiwgaXNPcHRpb25hbE91dCkge1xyXG4gICAgY29uc3QgaXNQcmVzZW50ID0ga2V5IGluIGlucHV0O1xyXG4gICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgLy8gRm9yIG9wdGlvbmFsLWluL291dCBzY2hlbWFzLCBpZ25vcmUgZXJyb3JzIG9uIGFic2VudCBrZXlzLlxyXG4gICAgICAgIGlmIChpc09wdGlvbmFsSW4gJiYgaXNPcHRpb25hbE91dCAmJiAhaXNQcmVzZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWwuaXNzdWVzLnB1c2goLi4udXRpbC5wcmVmaXhJc3N1ZXMoa2V5LCByZXN1bHQuaXNzdWVzKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWlzUHJlc2VudCAmJiAhaXNPcHRpb25hbEluKSB7XHJcbiAgICAgICAgaWYgKCFyZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwibm9ub3B0aW9uYWxcIixcclxuICAgICAgICAgICAgICAgIGlucHV0OiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBba2V5XSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChyZXN1bHQudmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGlmIChpc1ByZXNlbnQpIHtcclxuICAgICAgICAgICAgZmluYWwudmFsdWVba2V5XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBmaW5hbC52YWx1ZVtrZXldID0gcmVzdWx0LnZhbHVlO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZURlZihkZWYpIHtcclxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhkZWYuc2hhcGUpO1xyXG4gICAgZm9yIChjb25zdCBrIG9mIGtleXMpIHtcclxuICAgICAgICBpZiAoIWRlZi5zaGFwZT8uW2tdPy5fem9kPy50cmFpdHM/LmhhcyhcIiRab2RUeXBlXCIpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBlbGVtZW50IGF0IGtleSBcIiR7a31cIjogZXhwZWN0ZWQgYSBab2Qgc2NoZW1hYCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc3Qgb2tleXMgPSB1dGlsLm9wdGlvbmFsS2V5cyhkZWYuc2hhcGUpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICAuLi5kZWYsXHJcbiAgICAgICAga2V5cyxcclxuICAgICAgICBrZXlTZXQ6IG5ldyBTZXQoa2V5cyksXHJcbiAgICAgICAgbnVtS2V5czoga2V5cy5sZW5ndGgsXHJcbiAgICAgICAgb3B0aW9uYWxLZXlzOiBuZXcgU2V0KG9rZXlzKSxcclxuICAgIH07XHJcbn1cclxuZnVuY3Rpb24gaGFuZGxlQ2F0Y2hhbGwocHJvbXMsIGlucHV0LCBwYXlsb2FkLCBjdHgsIGRlZiwgaW5zdCkge1xyXG4gICAgY29uc3QgdW5yZWNvZ25pemVkID0gW107XHJcbiAgICBjb25zdCBrZXlTZXQgPSBkZWYua2V5U2V0O1xyXG4gICAgY29uc3QgX2NhdGNoYWxsID0gZGVmLmNhdGNoYWxsLl96b2Q7XHJcbiAgICBjb25zdCB0ID0gX2NhdGNoYWxsLmRlZi50eXBlO1xyXG4gICAgY29uc3QgaXNPcHRpb25hbEluID0gX2NhdGNoYWxsLm9wdGluID09PSBcIm9wdGlvbmFsXCI7XHJcbiAgICBjb25zdCBpc09wdGlvbmFsT3V0ID0gX2NhdGNoYWxsLm9wdG91dCA9PT0gXCJvcHRpb25hbFwiO1xyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gaW5wdXQpIHtcclxuICAgICAgICAvLyBza2lwIF9fcHJvdG9fXyBzbyBpdCBjYW4ndCByZXBsYWNlIHRoZSByZXN1bHQgcHJvdG90eXBlIHZpYSB0aGVcclxuICAgICAgICAvLyBhc3NpZ25tZW50IHNldHRlciBvbiB0aGUgcGxhaW4ge30gd2UgYnVpbGQgaW50b1xyXG4gICAgICAgIGlmIChrZXkgPT09IFwiX19wcm90b19fXCIpXHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmIChrZXlTZXQuaGFzKGtleSkpXHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIGlmICh0ID09PSBcIm5ldmVyXCIpIHtcclxuICAgICAgICAgICAgdW5yZWNvZ25pemVkLnB1c2goa2V5KTtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHIgPSBfY2F0Y2hhbGwucnVuKHsgdmFsdWU6IGlucHV0W2tleV0sIGlzc3VlczogW10gfSwgY3R4KTtcclxuICAgICAgICBpZiAociBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgcHJvbXMucHVzaChyLnRoZW4oKHIpID0+IGhhbmRsZVByb3BlcnR5UmVzdWx0KHIsIHBheWxvYWQsIGtleSwgaW5wdXQsIGlzT3B0aW9uYWxJbiwgaXNPcHRpb25hbE91dCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGhhbmRsZVByb3BlcnR5UmVzdWx0KHIsIHBheWxvYWQsIGtleSwgaW5wdXQsIGlzT3B0aW9uYWxJbiwgaXNPcHRpb25hbE91dCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHVucmVjb2duaXplZC5sZW5ndGgpIHtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgY29kZTogXCJ1bnJlY29nbml6ZWRfa2V5c1wiLFxyXG4gICAgICAgICAgICBrZXlzOiB1bnJlY29nbml6ZWQsXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKCFwcm9tcy5sZW5ndGgpXHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbXMpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0ICRab2RPYmplY3QgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE9iamVjdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyByZXF1aXJlcyBjYXN0IGJlY2F1c2UgdGVjaG5pY2FsbHkgJFpvZE9iamVjdCBkb2Vzbid0IGV4dGVuZFxyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgLy8gY29uc3Qgc2ggPSBkZWYuc2hhcGU7XHJcbiAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihkZWYsIFwic2hhcGVcIik7XHJcbiAgICBpZiAoIWRlc2M/LmdldCkge1xyXG4gICAgICAgIGNvbnN0IHNoID0gZGVmLnNoYXBlO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkZWYsIFwic2hhcGVcIiwge1xyXG4gICAgICAgICAgICBnZXQ6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1NoID0geyAuLi5zaCB9O1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRlZiwgXCJzaGFwZVwiLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG5ld1NoLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3U2g7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBfbm9ybWFsaXplZCA9IHV0aWwuY2FjaGVkKCgpID0+IG5vcm1hbGl6ZURlZihkZWYpKTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwicHJvcFZhbHVlc1wiLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2hhcGUgPSBkZWYuc2hhcGU7XHJcbiAgICAgICAgY29uc3QgcHJvcFZhbHVlcyA9IHt9O1xyXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNoYXBlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gc2hhcGVba2V5XS5fem9kO1xyXG4gICAgICAgICAgICBpZiAoZmllbGQudmFsdWVzKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wVmFsdWVzW2tleV0gPz8gKHByb3BWYWx1ZXNba2V5XSA9IG5ldyBTZXQoKSk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHYgb2YgZmllbGQudmFsdWVzKVxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BWYWx1ZXNba2V5XS5hZGQodik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHByb3BWYWx1ZXM7XHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGlzT2JqZWN0ID0gdXRpbC5pc09iamVjdDtcclxuICAgIGNvbnN0IGNhdGNoYWxsID0gZGVmLmNhdGNoYWxsO1xyXG4gICAgbGV0IHZhbHVlO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIHZhbHVlID8/ICh2YWx1ZSA9IF9ub3JtYWxpemVkLnZhbHVlKTtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKCFpc09iamVjdChpbnB1dCkpIHtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcGF5bG9hZC52YWx1ZSA9IHt9O1xyXG4gICAgICAgIGNvbnN0IHByb21zID0gW107XHJcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB2YWx1ZS5zaGFwZTtcclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB2YWx1ZS5rZXlzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVsID0gc2hhcGVba2V5XTtcclxuICAgICAgICAgICAgY29uc3QgaXNPcHRpb25hbEluID0gZWwuX3pvZC5vcHRpbiA9PT0gXCJvcHRpb25hbFwiO1xyXG4gICAgICAgICAgICBjb25zdCBpc09wdGlvbmFsT3V0ID0gZWwuX3pvZC5vcHRvdXQgPT09IFwib3B0aW9uYWxcIjtcclxuICAgICAgICAgICAgY29uc3QgciA9IGVsLl96b2QucnVuKHsgdmFsdWU6IGlucHV0W2tleV0sIGlzc3VlczogW10gfSwgY3R4KTtcclxuICAgICAgICAgICAgaWYgKHIgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKHIudGhlbigocikgPT4gaGFuZGxlUHJvcGVydHlSZXN1bHQociwgcGF5bG9hZCwga2V5LCBpbnB1dCwgaXNPcHRpb25hbEluLCBpc09wdGlvbmFsT3V0KSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlUHJvcGVydHlSZXN1bHQociwgcGF5bG9hZCwga2V5LCBpbnB1dCwgaXNPcHRpb25hbEluLCBpc09wdGlvbmFsT3V0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWNhdGNoYWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcm9tcy5sZW5ndGggPyBQcm9taXNlLmFsbChwcm9tcykudGhlbigoKSA9PiBwYXlsb2FkKSA6IHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoYW5kbGVDYXRjaGFsbChwcm9tcywgaW5wdXQsIHBheWxvYWQsIGN0eCwgX25vcm1hbGl6ZWQudmFsdWUsIGluc3QpO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kT2JqZWN0SklUID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RPYmplY3RKSVRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gcmVxdWlyZXMgY2FzdCBiZWNhdXNlIHRlY2huaWNhbGx5ICRab2RPYmplY3QgZG9lc24ndCBleHRlbmRcclxuICAgICRab2RPYmplY3QuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29uc3Qgc3VwZXJQYXJzZSA9IGluc3QuX3pvZC5wYXJzZTtcclxuICAgIGNvbnN0IF9ub3JtYWxpemVkID0gdXRpbC5jYWNoZWQoKCkgPT4gbm9ybWFsaXplRGVmKGRlZikpO1xyXG4gICAgY29uc3QgZ2VuZXJhdGVGYXN0cGFzcyA9IChzaGFwZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRvYyA9IG5ldyBEb2MoW1wic2hhcGVcIiwgXCJwYXlsb2FkXCIsIFwiY3R4XCJdKTtcclxuICAgICAgICBjb25zdCBub3JtYWxpemVkID0gX25vcm1hbGl6ZWQudmFsdWU7XHJcbiAgICAgICAgY29uc3QgcGFyc2VTdHIgPSAoa2V5KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGsgPSB1dGlsLmVzYyhrZXkpO1xyXG4gICAgICAgICAgICByZXR1cm4gYHNoYXBlWyR7a31dLl96b2QucnVuKHsgdmFsdWU6IGlucHV0WyR7a31dLCBpc3N1ZXM6IFtdIH0sIGN0eClgO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgZG9jLndyaXRlKGBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7YCk7XHJcbiAgICAgICAgY29uc3QgaWRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICAgICAgICBsZXQgY291bnRlciA9IDA7XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2Ygbm9ybWFsaXplZC5rZXlzKSB7XHJcbiAgICAgICAgICAgIGlkc1trZXldID0gYGtleV8ke2NvdW50ZXIrK31gO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBOiBwcmVzZXJ2ZSBrZXkgb3JkZXIge1xyXG4gICAgICAgIGRvYy53cml0ZShgY29uc3QgbmV3UmVzdWx0ID0ge307YCk7XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2Ygbm9ybWFsaXplZC5rZXlzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gaWRzW2tleV07XHJcbiAgICAgICAgICAgIGNvbnN0IGsgPSB1dGlsLmVzYyhrZXkpO1xyXG4gICAgICAgICAgICBjb25zdCBzY2hlbWEgPSBzaGFwZVtrZXldO1xyXG4gICAgICAgICAgICBjb25zdCBpc09wdGlvbmFsSW4gPSBzY2hlbWE/Ll96b2Q/Lm9wdGluID09PSBcIm9wdGlvbmFsXCI7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzT3B0aW9uYWxPdXQgPSBzY2hlbWE/Ll96b2Q/Lm9wdG91dCA9PT0gXCJvcHRpb25hbFwiO1xyXG4gICAgICAgICAgICBkb2Mud3JpdGUoYGNvbnN0ICR7aWR9ID0gJHtwYXJzZVN0cihrZXkpfTtgKTtcclxuICAgICAgICAgICAgaWYgKGlzT3B0aW9uYWxJbiAmJiBpc09wdGlvbmFsT3V0KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBGb3Igb3B0aW9uYWwtaW4vb3V0IHNjaGVtYXMsIGlnbm9yZSBlcnJvcnMgb24gYWJzZW50IGtleXNcclxuICAgICAgICAgICAgICAgIGRvYy53cml0ZShgXHJcbiAgICAgICAgaWYgKCR7aWR9Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIGlmICgke2t9IGluIGlucHV0KSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzID0gcGF5bG9hZC5pc3N1ZXMuY29uY2F0KCR7aWR9Lmlzc3Vlcy5tYXAoaXNzID0+ICh7XHJcbiAgICAgICAgICAgICAgLi4uaXNzLFxyXG4gICAgICAgICAgICAgIHBhdGg6IGlzcy5wYXRoID8gWyR7a30sIC4uLmlzcy5wYXRoXSA6IFske2t9XVxyXG4gICAgICAgICAgICB9KSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoJHtpZH0udmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgaWYgKCR7a30gaW4gaW5wdXQpIHtcclxuICAgICAgICAgICAgbmV3UmVzdWx0WyR7a31dID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBuZXdSZXN1bHRbJHtrfV0gPSAke2lkfS52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgIGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFpc09wdGlvbmFsSW4pIHtcclxuICAgICAgICAgICAgICAgIGRvYy53cml0ZShgXHJcbiAgICAgICAgY29uc3QgJHtpZH1fcHJlc2VudCA9ICR7a30gaW4gaW5wdXQ7XHJcbiAgICAgICAgaWYgKCR7aWR9Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHBheWxvYWQuaXNzdWVzID0gcGF5bG9hZC5pc3N1ZXMuY29uY2F0KCR7aWR9Lmlzc3Vlcy5tYXAoaXNzID0+ICh7XHJcbiAgICAgICAgICAgIC4uLmlzcyxcclxuICAgICAgICAgICAgcGF0aDogaXNzLnBhdGggPyBbJHtrfSwgLi4uaXNzLnBhdGhdIDogWyR7a31dXHJcbiAgICAgICAgICB9KSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoISR7aWR9X3ByZXNlbnQgJiYgISR7aWR9Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICBleHBlY3RlZDogXCJub25vcHRpb25hbFwiLFxyXG4gICAgICAgICAgICBpbnB1dDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICBwYXRoOiBbJHtrfV1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCR7aWR9X3ByZXNlbnQpIHtcclxuICAgICAgICAgIGlmICgke2lkfS52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIG5ld1Jlc3VsdFske2t9XSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5ld1Jlc3VsdFske2t9XSA9ICR7aWR9LnZhbHVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIGApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZG9jLndyaXRlKGBcclxuICAgICAgICBpZiAoJHtpZH0uaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgcGF5bG9hZC5pc3N1ZXMgPSBwYXlsb2FkLmlzc3Vlcy5jb25jYXQoJHtpZH0uaXNzdWVzLm1hcChpc3MgPT4gKHtcclxuICAgICAgICAgICAgLi4uaXNzLFxyXG4gICAgICAgICAgICBwYXRoOiBpc3MucGF0aCA/IFske2t9LCAuLi5pc3MucGF0aF0gOiBbJHtrfV1cclxuICAgICAgICAgIH0pKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICgke2lkfS52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICBpZiAoJHtrfSBpbiBpbnB1dCkge1xyXG4gICAgICAgICAgICBuZXdSZXN1bHRbJHtrfV0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5ld1Jlc3VsdFske2t9XSA9ICR7aWR9LnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZG9jLndyaXRlKGBwYXlsb2FkLnZhbHVlID0gbmV3UmVzdWx0O2ApO1xyXG4gICAgICAgIGRvYy53cml0ZShgcmV0dXJuIHBheWxvYWQ7YCk7XHJcbiAgICAgICAgY29uc3QgZm4gPSBkb2MuY29tcGlsZSgpO1xyXG4gICAgICAgIHJldHVybiAocGF5bG9hZCwgY3R4KSA9PiBmbihzaGFwZSwgcGF5bG9hZCwgY3R4KTtcclxuICAgIH07XHJcbiAgICBsZXQgZmFzdHBhc3M7XHJcbiAgICBjb25zdCBpc09iamVjdCA9IHV0aWwuaXNPYmplY3Q7XHJcbiAgICBjb25zdCBqaXQgPSAhY29yZS5nbG9iYWxDb25maWcuaml0bGVzcztcclxuICAgIGNvbnN0IGFsbG93c0V2YWwgPSB1dGlsLmFsbG93c0V2YWw7XHJcbiAgICBjb25zdCBmYXN0RW5hYmxlZCA9IGppdCAmJiBhbGxvd3NFdmFsLnZhbHVlOyAvLyAmJiAhZGVmLmNhdGNoYWxsO1xyXG4gICAgY29uc3QgY2F0Y2hhbGwgPSBkZWYuY2F0Y2hhbGw7XHJcbiAgICBsZXQgdmFsdWU7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgdmFsdWUgPz8gKHZhbHVlID0gX25vcm1hbGl6ZWQudmFsdWUpO1xyXG4gICAgICAgIGNvbnN0IGlucHV0ID0gcGF5bG9hZC52YWx1ZTtcclxuICAgICAgICBpZiAoIWlzT2JqZWN0KGlucHV0KSkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaml0ICYmIGZhc3RFbmFibGVkICYmIGN0eD8uYXN5bmMgPT09IGZhbHNlICYmIGN0eC5qaXRsZXNzICE9PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIC8vIGFsd2F5cyBzeW5jaHJvbm91c1xyXG4gICAgICAgICAgICBpZiAoIWZhc3RwYXNzKVxyXG4gICAgICAgICAgICAgICAgZmFzdHBhc3MgPSBnZW5lcmF0ZUZhc3RwYXNzKGRlZi5zaGFwZSk7XHJcbiAgICAgICAgICAgIHBheWxvYWQgPSBmYXN0cGFzcyhwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgICAgICBpZiAoIWNhdGNoYWxsKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgICAgIHJldHVybiBoYW5kbGVDYXRjaGFsbChbXSwgaW5wdXQsIHBheWxvYWQsIGN0eCwgdmFsdWUsIGluc3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VwZXJQYXJzZShwYXlsb2FkLCBjdHgpO1xyXG4gICAgfTtcclxufSk7XHJcbmZ1bmN0aW9uIGhhbmRsZVVuaW9uUmVzdWx0cyhyZXN1bHRzLCBmaW5hbCwgaW5zdCwgY3R4KSB7XHJcbiAgICBmb3IgKGNvbnN0IHJlc3VsdCBvZiByZXN1bHRzKSB7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIGZpbmFsLnZhbHVlID0gcmVzdWx0LnZhbHVlO1xyXG4gICAgICAgICAgICByZXR1cm4gZmluYWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc3Qgbm9uYWJvcnRlZCA9IHJlc3VsdHMuZmlsdGVyKChyKSA9PiAhdXRpbC5hYm9ydGVkKHIpKTtcclxuICAgIGlmIChub25hYm9ydGVkLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgIGZpbmFsLnZhbHVlID0gbm9uYWJvcnRlZFswXS52YWx1ZTtcclxuICAgICAgICByZXR1cm4gbm9uYWJvcnRlZFswXTtcclxuICAgIH1cclxuICAgIGZpbmFsLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICBjb2RlOiBcImludmFsaWRfdW5pb25cIixcclxuICAgICAgICBpbnB1dDogZmluYWwudmFsdWUsXHJcbiAgICAgICAgaW5zdCxcclxuICAgICAgICBlcnJvcnM6IHJlc3VsdHMubWFwKChyZXN1bHQpID0+IHJlc3VsdC5pc3N1ZXMubWFwKChpc3MpID0+IHV0aWwuZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29yZS5jb25maWcoKSkpKSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGZpbmFsO1xyXG59XHJcbmV4cG9ydCBjb25zdCAkWm9kVW5pb24gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFVuaW9uXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwib3B0aW5cIiwgKCkgPT4gZGVmLm9wdGlvbnMuc29tZSgobykgPT4gby5fem9kLm9wdGluID09PSBcIm9wdGlvbmFsXCIpID8gXCJvcHRpb25hbFwiIDogdW5kZWZpbmVkKTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwib3B0b3V0XCIsICgpID0+IGRlZi5vcHRpb25zLnNvbWUoKG8pID0+IG8uX3pvZC5vcHRvdXQgPT09IFwib3B0aW9uYWxcIikgPyBcIm9wdGlvbmFsXCIgOiB1bmRlZmluZWQpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJ2YWx1ZXNcIiwgKCkgPT4ge1xyXG4gICAgICAgIGlmIChkZWYub3B0aW9ucy5ldmVyeSgobykgPT4gby5fem9kLnZhbHVlcykpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTZXQoZGVmLm9wdGlvbnMuZmxhdE1hcCgob3B0aW9uKSA9PiBBcnJheS5mcm9tKG9wdGlvbi5fem9kLnZhbHVlcykpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH0pO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJwYXR0ZXJuXCIsICgpID0+IHtcclxuICAgICAgICBpZiAoZGVmLm9wdGlvbnMuZXZlcnkoKG8pID0+IG8uX3pvZC5wYXR0ZXJuKSkge1xyXG4gICAgICAgICAgICBjb25zdCBwYXR0ZXJucyA9IGRlZi5vcHRpb25zLm1hcCgobykgPT4gby5fem9kLnBhdHRlcm4pO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZ0V4cChgXigke3BhdHRlcm5zLm1hcCgocCkgPT4gdXRpbC5jbGVhblJlZ2V4KHAuc291cmNlKSkuam9pbihcInxcIil9KSRgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH0pO1xyXG4gICAgY29uc3QgZmlyc3QgPSBkZWYub3B0aW9ucy5sZW5ndGggPT09IDEgPyBkZWYub3B0aW9uc1swXS5fem9kLnJ1biA6IG51bGw7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgaWYgKGZpcnN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmaXJzdChwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYXN5bmMgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gW107XHJcbiAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgZGVmLm9wdGlvbnMpIHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gb3B0aW9uLl96b2QucnVuKHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgaXNzdWVzOiBbXSxcclxuICAgICAgICAgICAgfSwgY3R4KTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgYXN5bmMgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWFzeW5jKVxyXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlVW5pb25SZXN1bHRzKHJlc3VsdHMsIHBheWxvYWQsIGluc3QsIGN0eCk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHJlc3VsdHMpLnRoZW4oKHJlc3VsdHMpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZVVuaW9uUmVzdWx0cyhyZXN1bHRzLCBwYXlsb2FkLCBpbnN0LCBjdHgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcbmZ1bmN0aW9uIGhhbmRsZUV4Y2x1c2l2ZVVuaW9uUmVzdWx0cyhyZXN1bHRzLCBmaW5hbCwgaW5zdCwgY3R4KSB7XHJcbiAgICBjb25zdCBzdWNjZXNzZXMgPSByZXN1bHRzLmZpbHRlcigocikgPT4gci5pc3N1ZXMubGVuZ3RoID09PSAwKTtcclxuICAgIGlmIChzdWNjZXNzZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgZmluYWwudmFsdWUgPSBzdWNjZXNzZXNbMF0udmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIGZpbmFsO1xyXG4gICAgfVxyXG4gICAgaWYgKHN1Y2Nlc3Nlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAvLyBObyBtYXRjaGVzIC0gc2FtZSBhcyByZWd1bGFyIHVuaW9uXHJcbiAgICAgICAgZmluYWwuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdW5pb25cIixcclxuICAgICAgICAgICAgaW5wdXQ6IGZpbmFsLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICBlcnJvcnM6IHJlc3VsdHMubWFwKChyZXN1bHQpID0+IHJlc3VsdC5pc3N1ZXMubWFwKChpc3MpID0+IHV0aWwuZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29yZS5jb25maWcoKSkpKSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIE11bHRpcGxlIG1hdGNoZXMgLSBleGNsdXNpdmUgdW5pb24gZmFpbHVyZVxyXG4gICAgICAgIGZpbmFsLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3VuaW9uXCIsXHJcbiAgICAgICAgICAgIGlucHV0OiBmaW5hbC52YWx1ZSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgZXJyb3JzOiBbXSxcclxuICAgICAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBmaW5hbDtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZFhvciA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kWG9yXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RVbmlvbi5pbml0KGluc3QsIGRlZik7XHJcbiAgICBkZWYuaW5jbHVzaXZlID0gZmFsc2U7XHJcbiAgICBjb25zdCBmaXJzdCA9IGRlZi5vcHRpb25zLmxlbmd0aCA9PT0gMSA/IGRlZi5vcHRpb25zWzBdLl96b2QucnVuIDogbnVsbDtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBpZiAoZmlyc3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZpcnN0KHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBhc3luYyA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcclxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBkZWYub3B0aW9ucykge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBvcHRpb24uX3pvZC5ydW4oe1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IFtdLFxyXG4gICAgICAgICAgICB9LCBjdHgpO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICBhc3luYyA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWFzeW5jKVxyXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlRXhjbHVzaXZlVW5pb25SZXN1bHRzKHJlc3VsdHMsIHBheWxvYWQsIGluc3QsIGN0eCk7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHJlc3VsdHMpLnRoZW4oKHJlc3VsdHMpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUV4Y2x1c2l2ZVVuaW9uUmVzdWx0cyhyZXN1bHRzLCBwYXlsb2FkLCBpbnN0LCBjdHgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kRGlzY3JpbWluYXRlZFVuaW9uID0gXHJcbi8qQF9fUFVSRV9fKi9cclxuY29yZS4kY29uc3RydWN0b3IoXCIkWm9kRGlzY3JpbWluYXRlZFVuaW9uXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGRlZi5pbmNsdXNpdmUgPSBmYWxzZTtcclxuICAgICRab2RVbmlvbi5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb25zdCBfc3VwZXIgPSBpbnN0Ll96b2QucGFyc2U7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInByb3BWYWx1ZXNcIiwgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHByb3BWYWx1ZXMgPSB7fTtcclxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBkZWYub3B0aW9ucykge1xyXG4gICAgICAgICAgICBjb25zdCBwdiA9IG9wdGlvbi5fem9kLnByb3BWYWx1ZXM7XHJcbiAgICAgICAgICAgIGlmICghcHYgfHwgT2JqZWN0LmtleXMocHYpLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBkaXNjcmltaW5hdGVkIHVuaW9uIG9wdGlvbiBhdCBpbmRleCBcIiR7ZGVmLm9wdGlvbnMuaW5kZXhPZihvcHRpb24pfVwiYCk7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKHB2KSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFwcm9wVmFsdWVzW2tdKVxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BWYWx1ZXNba10gPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHZhbCBvZiB2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcFZhbHVlc1trXS5hZGQodmFsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcHJvcFZhbHVlcztcclxuICAgIH0pO1xyXG4gICAgY29uc3QgZGlzYyA9IHV0aWwuY2FjaGVkKCgpID0+IHtcclxuICAgICAgICBjb25zdCBvcHRzID0gZGVmLm9wdGlvbnM7XHJcbiAgICAgICAgY29uc3QgbWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIGZvciAoY29uc3QgbyBvZiBvcHRzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlcyA9IG8uX3pvZC5wcm9wVmFsdWVzPy5bZGVmLmRpc2NyaW1pbmF0b3JdO1xyXG4gICAgICAgICAgICBpZiAoIXZhbHVlcyB8fCB2YWx1ZXMuc2l6ZSA9PT0gMClcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBkaXNjcmltaW5hdGVkIHVuaW9uIG9wdGlvbiBhdCBpbmRleCBcIiR7ZGVmLm9wdGlvbnMuaW5kZXhPZihvKX1cImApO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHYgb2YgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFwLmhhcyh2KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRHVwbGljYXRlIGRpc2NyaW1pbmF0b3IgdmFsdWUgXCIke1N0cmluZyh2KX1cImApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbWFwLnNldCh2LCBvKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWFwO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmICghdXRpbC5pc09iamVjdChpbnB1dCkpIHtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgb3B0ID0gZGlzYy52YWx1ZS5nZXQoaW5wdXQ/LltkZWYuZGlzY3JpbWluYXRvcl0pO1xyXG4gICAgICAgIGlmIChvcHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9wdC5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBGYWxsIGJhY2sgdG8gdW5pb24gbWF0Y2hpbmcgd2hlbiB0aGUgZmFzdCBkaXNjcmltaW5hdG9yIHBhdGggZmFpbHM6XHJcbiAgICAgICAgLy8gLSBleHBsaWNpdGx5IGVuYWJsZWQgdmlhIHVuaW9uRmFsbGJhY2ssIG9yXHJcbiAgICAgICAgLy8gLSBkdXJpbmcgYmFja3dhcmQgZGlyZWN0aW9uIChlbmNvZGUpLCBzaW5jZSBjb2RlYy1iYXNlZCBkaXNjcmltaW5hdG9yc1xyXG4gICAgICAgIC8vICAgaGF2ZSBkaWZmZXJlbnQgdmFsdWVzIGluIGZvcndhcmQgdnMgYmFja3dhcmQgZGlyZWN0aW9uc1xyXG4gICAgICAgIGlmIChkZWYudW5pb25GYWxsYmFjayB8fCBjdHguZGlyZWN0aW9uID09PSBcImJhY2t3YXJkXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIF9zdXBlcihwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBubyBtYXRjaGluZyBkaXNjcmltaW5hdG9yXHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF91bmlvblwiLFxyXG4gICAgICAgICAgICBlcnJvcnM6IFtdLFxyXG4gICAgICAgICAgICBub3RlOiBcIk5vIG1hdGNoaW5nIGRpc2NyaW1pbmF0b3JcIixcclxuICAgICAgICAgICAgZGlzY3JpbWluYXRvcjogZGVmLmRpc2NyaW1pbmF0b3IsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IEFycmF5LmZyb20oZGlzYy52YWx1ZS5rZXlzKCkpLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgcGF0aDogW2RlZi5kaXNjcmltaW5hdG9yXSxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZEludGVyc2VjdGlvbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kSW50ZXJzZWN0aW9uXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IGRlZi5sZWZ0Ll96b2QucnVuKHsgdmFsdWU6IGlucHV0LCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICAgICAgY29uc3QgcmlnaHQgPSBkZWYucmlnaHQuX3pvZC5ydW4oeyB2YWx1ZTogaW5wdXQsIGlzc3VlczogW10gfSwgY3R4KTtcclxuICAgICAgICBjb25zdCBhc3luYyA9IGxlZnQgaW5zdGFuY2VvZiBQcm9taXNlIHx8IHJpZ2h0IGluc3RhbmNlb2YgUHJvbWlzZTtcclxuICAgICAgICBpZiAoYXN5bmMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtsZWZ0LCByaWdodF0pLnRoZW4oKFtsZWZ0LCByaWdodF0pID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVJbnRlcnNlY3Rpb25SZXN1bHRzKHBheWxvYWQsIGxlZnQsIHJpZ2h0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoYW5kbGVJbnRlcnNlY3Rpb25SZXN1bHRzKHBheWxvYWQsIGxlZnQsIHJpZ2h0KTtcclxuICAgIH07XHJcbn0pO1xyXG5mdW5jdGlvbiBtZXJnZVZhbHVlcyhhLCBiKSB7XHJcbiAgICAvLyBjb25zdCBhVHlwZSA9IHBhcnNlLnQoYSk7XHJcbiAgICAvLyBjb25zdCBiVHlwZSA9IHBhcnNlLnQoYik7XHJcbiAgICBpZiAoYSA9PT0gYikge1xyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBhIH07XHJcbiAgICB9XHJcbiAgICBpZiAoYSBpbnN0YW5jZW9mIERhdGUgJiYgYiBpbnN0YW5jZW9mIERhdGUgJiYgK2EgPT09ICtiKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IGEgfTtcclxuICAgIH1cclxuICAgIGlmICh1dGlsLmlzUGxhaW5PYmplY3QoYSkgJiYgdXRpbC5pc1BsYWluT2JqZWN0KGIpKSB7XHJcbiAgICAgICAgY29uc3QgYktleXMgPSBPYmplY3Qua2V5cyhiKTtcclxuICAgICAgICBjb25zdCBzaGFyZWRLZXlzID0gT2JqZWN0LmtleXMoYSkuZmlsdGVyKChrZXkpID0+IGJLZXlzLmluZGV4T2Yoa2V5KSAhPT0gLTEpO1xyXG4gICAgICAgIGNvbnN0IG5ld09iaiA9IHsgLi4uYSwgLi4uYiB9O1xyXG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHNoYXJlZEtleXMpIHtcclxuICAgICAgICAgICAgY29uc3Qgc2hhcmVkVmFsdWUgPSBtZXJnZVZhbHVlcyhhW2tleV0sIGJba2V5XSk7XHJcbiAgICAgICAgICAgIGlmICghc2hhcmVkVmFsdWUudmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsaWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1lcmdlRXJyb3JQYXRoOiBba2V5LCAuLi5zaGFyZWRWYWx1ZS5tZXJnZUVycm9yUGF0aF0sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5ld09ialtrZXldID0gc2hhcmVkVmFsdWUuZGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGRhdGE6IG5ld09iaiB9O1xyXG4gICAgfVxyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYSkgJiYgQXJyYXkuaXNBcnJheShiKSkge1xyXG4gICAgICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBtZXJnZUVycm9yUGF0aDogW10gfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmV3QXJyYXkgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYS5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgY29uc3QgaXRlbUEgPSBhW2luZGV4XTtcclxuICAgICAgICAgICAgY29uc3QgaXRlbUIgPSBiW2luZGV4XTtcclxuICAgICAgICAgICAgY29uc3Qgc2hhcmVkVmFsdWUgPSBtZXJnZVZhbHVlcyhpdGVtQSwgaXRlbUIpO1xyXG4gICAgICAgICAgICBpZiAoIXNoYXJlZFZhbHVlLnZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBtZXJnZUVycm9yUGF0aDogW2luZGV4LCAuLi5zaGFyZWRWYWx1ZS5tZXJnZUVycm9yUGF0aF0sXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5ld0FycmF5LnB1c2goc2hhcmVkVmFsdWUuZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBkYXRhOiBuZXdBcnJheSB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBtZXJnZUVycm9yUGF0aDogW10gfTtcclxufVxyXG5mdW5jdGlvbiBoYW5kbGVJbnRlcnNlY3Rpb25SZXN1bHRzKHJlc3VsdCwgbGVmdCwgcmlnaHQpIHtcclxuICAgIC8vIFRyYWNrIHdoaWNoIHNpZGUocykgcmVwb3J0IGVhY2gga2V5IGFzIHVucmVjb2duaXplZFxyXG4gICAgY29uc3QgdW5yZWNLZXlzID0gbmV3IE1hcCgpO1xyXG4gICAgbGV0IHVucmVjSXNzdWU7XHJcbiAgICBmb3IgKGNvbnN0IGlzcyBvZiBsZWZ0Lmlzc3Vlcykge1xyXG4gICAgICAgIGlmIChpc3MuY29kZSA9PT0gXCJ1bnJlY29nbml6ZWRfa2V5c1wiKSB7XHJcbiAgICAgICAgICAgIHVucmVjSXNzdWUgPz8gKHVucmVjSXNzdWUgPSBpc3MpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGsgb2YgaXNzLmtleXMpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdW5yZWNLZXlzLmhhcyhrKSlcclxuICAgICAgICAgICAgICAgICAgICB1bnJlY0tleXMuc2V0KGssIHt9KTtcclxuICAgICAgICAgICAgICAgIHVucmVjS2V5cy5nZXQoaykubCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5pc3N1ZXMucHVzaChpc3MpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZvciAoY29uc3QgaXNzIG9mIHJpZ2h0Lmlzc3Vlcykge1xyXG4gICAgICAgIGlmIChpc3MuY29kZSA9PT0gXCJ1bnJlY29nbml6ZWRfa2V5c1wiKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgayBvZiBpc3Mua2V5cykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1bnJlY0tleXMuaGFzKGspKVxyXG4gICAgICAgICAgICAgICAgICAgIHVucmVjS2V5cy5zZXQoaywge30pO1xyXG4gICAgICAgICAgICAgICAgdW5yZWNLZXlzLmdldChrKS5yID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmVzdWx0Lmlzc3Vlcy5wdXNoKGlzcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gUmVwb3J0IG9ubHkga2V5cyB1bnJlY29nbml6ZWQgYnkgQk9USCBzaWRlc1xyXG4gICAgY29uc3QgYm90aEtleXMgPSBbLi4udW5yZWNLZXlzXS5maWx0ZXIoKFssIGZdKSA9PiBmLmwgJiYgZi5yKS5tYXAoKFtrXSkgPT4gayk7XHJcbiAgICBpZiAoYm90aEtleXMubGVuZ3RoICYmIHVucmVjSXNzdWUpIHtcclxuICAgICAgICByZXN1bHQuaXNzdWVzLnB1c2goeyAuLi51bnJlY0lzc3VlLCBrZXlzOiBib3RoS2V5cyB9KTtcclxuICAgIH1cclxuICAgIGlmICh1dGlsLmFib3J0ZWQocmVzdWx0KSlcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgY29uc3QgbWVyZ2VkID0gbWVyZ2VWYWx1ZXMobGVmdC52YWx1ZSwgcmlnaHQudmFsdWUpO1xyXG4gICAgaWYgKCFtZXJnZWQudmFsaWQpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVubWVyZ2FibGUgaW50ZXJzZWN0aW9uLiBFcnJvciBwYXRoOiBgICsgYCR7SlNPTi5zdHJpbmdpZnkobWVyZ2VkLm1lcmdlRXJyb3JQYXRoKX1gKTtcclxuICAgIH1cclxuICAgIHJlc3VsdC52YWx1ZSA9IG1lcmdlZC5kYXRhO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZFR1cGxlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RUdXBsZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb25zdCBpdGVtcyA9IGRlZi5pdGVtcztcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0KSkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcInR1cGxlXCIsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBheWxvYWQudmFsdWUgPSBbXTtcclxuICAgICAgICBjb25zdCBwcm9tcyA9IFtdO1xyXG4gICAgICAgIGNvbnN0IG9wdGluU3RhcnQgPSBnZXRUdXBsZU9wdFN0YXJ0KGl0ZW1zLCBcIm9wdGluXCIpO1xyXG4gICAgICAgIGNvbnN0IG9wdG91dFN0YXJ0ID0gZ2V0VHVwbGVPcHRTdGFydChpdGVtcywgXCJvcHRvdXRcIik7XHJcbiAgICAgICAgaWYgKCFkZWYucmVzdCkge1xyXG4gICAgICAgICAgICBpZiAoaW5wdXQubGVuZ3RoIDwgb3B0aW5TdGFydCkge1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgY29kZTogXCJ0b29fc21hbGxcIixcclxuICAgICAgICAgICAgICAgICAgICBtaW5pbXVtOiBvcHRpblN0YXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgIGluY2x1c2l2ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbjogXCJhcnJheVwiLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaW5wdXQubGVuZ3RoID4gaXRlbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBjb2RlOiBcInRvb19iaWdcIixcclxuICAgICAgICAgICAgICAgICAgICBtYXhpbXVtOiBpdGVtcy5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVzaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luOiBcImFycmF5XCIsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBSdW4gZXZlcnkgaXRlbSBpbiBwYXJhbGxlbCwgY29sbGVjdGluZyByZXN1bHRzIGludG8gYW4gaW5kZXhlZFxyXG4gICAgICAgIC8vIGFycmF5LiBUaGUgcG9zdC1wcm9jZXNzaW5nIGluIGBoYW5kbGVUdXBsZVJlc3VsdHNgIHdhbGtzIHRoZW0gaW5cclxuICAgICAgICAvLyBvcmRlciBzbyBpdCBjYW4gZGVjaWRlIHdoZXRoZXIgYW4gYWJzZW50IG9wdGlvbmFsLW91dHB1dCBlcnJvciBjYW5cclxuICAgICAgICAvLyB0cnVuY2F0ZSB0aGUgdGFpbCBvciBtdXN0IGJlIHJlcG9ydGVkIHRvIHByZXNlcnZlIHJlcXVpcmVkIG91dHB1dC5cclxuICAgICAgICBjb25zdCBpdGVtUmVzdWx0cyA9IG5ldyBBcnJheShpdGVtcy5sZW5ndGgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgciA9IGl0ZW1zW2ldLl96b2QucnVuKHsgdmFsdWU6IGlucHV0W2ldLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICAgICAgICAgIGlmIChyIGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgcHJvbXMucHVzaChyLnRoZW4oKHJyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbVJlc3VsdHNbaV0gPSBycjtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1SZXN1bHRzW2ldID0gcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVmLnJlc3QpIHtcclxuICAgICAgICAgICAgbGV0IGkgPSBpdGVtcy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBjb25zdCByZXN0ID0gaW5wdXQuc2xpY2UoaXRlbXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBlbCBvZiByZXN0KSB7XHJcbiAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYucmVzdC5fem9kLnJ1bih7IHZhbHVlOiBlbCwgaXNzdWVzOiBbXSB9LCBjdHgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKHJlc3VsdC50aGVuKChyKSA9PiBoYW5kbGVUdXBsZVJlc3VsdChyLCBwYXlsb2FkLCBpKSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlVHVwbGVSZXN1bHQocmVzdWx0LCBwYXlsb2FkLCBpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocHJvbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9tcykudGhlbigoKSA9PiBoYW5kbGVUdXBsZVJlc3VsdHMoaXRlbVJlc3VsdHMsIHBheWxvYWQsIGl0ZW1zLCBpbnB1dCwgb3B0b3V0U3RhcnQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZVR1cGxlUmVzdWx0cyhpdGVtUmVzdWx0cywgcGF5bG9hZCwgaXRlbXMsIGlucHV0LCBvcHRvdXRTdGFydCk7XHJcbiAgICB9O1xyXG59KTtcclxuZnVuY3Rpb24gZ2V0VHVwbGVPcHRTdGFydChpdGVtcywga2V5KSB7XHJcbiAgICBmb3IgKGxldCBpID0gaXRlbXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBpZiAoaXRlbXNbaV0uX3pvZFtrZXldICE9PSBcIm9wdGlvbmFsXCIpXHJcbiAgICAgICAgICAgIHJldHVybiBpICsgMTtcclxuICAgIH1cclxuICAgIHJldHVybiAwO1xyXG59XHJcbmZ1bmN0aW9uIGhhbmRsZVR1cGxlUmVzdWx0KHJlc3VsdCwgZmluYWwsIGluZGV4KSB7XHJcbiAgICBpZiAocmVzdWx0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCguLi51dGlsLnByZWZpeElzc3VlcyhpbmRleCwgcmVzdWx0Lmlzc3VlcykpO1xyXG4gICAgfVxyXG4gICAgZmluYWwudmFsdWVbaW5kZXhdID0gcmVzdWx0LnZhbHVlO1xyXG59XHJcbmZ1bmN0aW9uIGhhbmRsZVR1cGxlUmVzdWx0cyhpdGVtUmVzdWx0cywgZmluYWwsIGl0ZW1zLCBpbnB1dCwgb3B0b3V0U3RhcnQpIHtcclxuICAgIC8vIFdhbGsgcmVzdWx0cyBpbiBvcmRlci4gTWlycm9yICRab2RPYmplY3QncyBzd2FsbG93LW9uLWFic2VudC1vcHRpb25hbFxyXG4gICAgLy8gcnVsZSwgYnV0IG9ubHkgYWZ0ZXIgYG9wdG91dFN0YXJ0YDogdGhlIGZpcnN0IGluZGV4IHdoZXJlIHRoZSBvdXRwdXRcclxuICAgIC8vIHR1cGxlIHRhaWwgY2FuIGJlIGFic2VudC5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBjb25zdCByID0gaXRlbVJlc3VsdHNbaV07XHJcbiAgICAgICAgY29uc3QgaXNQcmVzZW50ID0gaSA8IGlucHV0Lmxlbmd0aDtcclxuICAgICAgICBpZiAoci5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNQcmVzZW50ICYmIGkgPj0gb3B0b3V0U3RhcnQpIHtcclxuICAgICAgICAgICAgICAgIGZpbmFsLnZhbHVlLmxlbmd0aCA9IGk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCguLi51dGlsLnByZWZpeElzc3VlcyhpLCByLmlzc3VlcykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbC52YWx1ZVtpXSA9IHIudmFsdWU7XHJcbiAgICB9XHJcbiAgICAvLyBEcm9wIHRyYWlsaW5nIHNsb3RzIHRoYXQgcHJvZHVjZWQgYHVuZGVmaW5lZGAgZm9yIGFic2VudCBpbnB1dFxyXG4gICAgLy8gKHRoZSBhcnJheSBhbmFsb2cgb2YgYW4gYWJzZW50IG9wdGlvbmFsIGtleSBvbiBhbiBvYmplY3QpLiBUaGVcclxuICAgIC8vIGBpID49IGlucHV0Lmxlbmd0aGAgZmxvb3IgaXMgY3JpdGljYWw6IGFuIGV4cGxpY2l0IGB1bmRlZmluZWRgXHJcbiAgICAvLyAqaW5zaWRlKiB0aGUgaW5wdXQgbXVzdCBiZSBwcmVzZXJ2ZWQgZXZlbiB3aGVuIHRoZSBzY2hlbWEgaXNcclxuICAgIC8vIG9wdGlvbmFsLW91dCAoZS5nLiBgei5zdHJpbmcoKS5vcih6LnVuZGVmaW5lZCgpKWAgYWNjZXB0aW5nIGFuXHJcbiAgICAvLyBleHBsaWNpdCB1bmRlZmluZWQgdmFsdWUpLlxyXG4gICAgZm9yIChsZXQgaSA9IGZpbmFsLnZhbHVlLmxlbmd0aCAtIDE7IGkgPj0gaW5wdXQubGVuZ3RoOyBpLS0pIHtcclxuICAgICAgICBpZiAoaXRlbXNbaV0uX3pvZC5vcHRvdXQgPT09IFwib3B0aW9uYWxcIiAmJiBmaW5hbC52YWx1ZVtpXSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGZpbmFsLnZhbHVlLmxlbmd0aCA9IGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmluYWw7XHJcbn1cclxuZXhwb3J0IGNvbnN0ICRab2RSZWNvcmQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFJlY29yZFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmICghdXRpbC5pc1BsYWluT2JqZWN0KGlucHV0KSkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcInJlY29yZFwiLFxyXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwcm9tcyA9IFtdO1xyXG4gICAgICAgIGNvbnN0IHZhbHVlcyA9IGRlZi5rZXlUeXBlLl96b2QudmFsdWVzO1xyXG4gICAgICAgIGlmICh2YWx1ZXMpIHtcclxuICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IHt9O1xyXG4gICAgICAgICAgICBjb25zdCByZWNvcmRLZXlzID0gbmV3IFNldCgpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiB2YWx1ZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBrZXkgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIGtleSA9PT0gXCJzeW1ib2xcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlY29yZEtleXMuYWRkKHR5cGVvZiBrZXkgPT09IFwibnVtYmVyXCIgPyBrZXkudG9TdHJpbmcoKSA6IGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5UmVzdWx0ID0gZGVmLmtleVR5cGUuX3pvZC5ydW4oeyB2YWx1ZToga2V5LCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleVJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmMgc2NoZW1hcyBub3Qgc3VwcG9ydGVkIGluIG9iamVjdCBrZXlzIGN1cnJlbnRseVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleVJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX2tleVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luOiBcInJlY29yZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiBrZXlSZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBrZXksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBba2V5XSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3V0S2V5ID0ga2V5UmVzdWx0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGRlZi52YWx1ZVR5cGUuX3pvZC5ydW4oeyB2YWx1ZTogaW5wdXRba2V5XSwgaXNzdWVzOiBbXSB9LCBjdHgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21zLnB1c2gocmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCguLi51dGlsLnByZWZpeElzc3VlcyhrZXksIHJlc3VsdC5pc3N1ZXMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWVbb3V0S2V5XSA9IHJlc3VsdC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKC4uLnV0aWwucHJlZml4SXNzdWVzKGtleSwgcmVzdWx0Lmlzc3VlcykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWVbb3V0S2V5XSA9IHJlc3VsdC52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHVucmVjb2duaXplZDtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gaW5wdXQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghcmVjb3JkS2V5cy5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVucmVjb2duaXplZCA9IHVucmVjb2duaXplZCA/PyBbXTtcclxuICAgICAgICAgICAgICAgICAgICB1bnJlY29nbml6ZWQucHVzaChrZXkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh1bnJlY29nbml6ZWQgJiYgdW5yZWNvZ25pemVkLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFwidW5yZWNvZ25pemVkX2tleXNcIixcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgICAgIGtleXM6IHVucmVjb2duaXplZCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0ge307XHJcbiAgICAgICAgICAgIC8vIFJlZmxlY3Qub3duS2V5cyBmb3IgU3ltYm9sLWtleSBzdXBwb3J0OyBmaWx0ZXIgbm9uLWVudW1lcmFibGUgdG8gbWF0Y2ggei5vYmplY3QoKVxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBSZWZsZWN0Lm93bktleXMoaW5wdXQpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBcIl9fcHJvdG9fX1wiKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoaW5wdXQsIGtleSkpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICBsZXQga2V5UmVzdWx0ID0gZGVmLmtleVR5cGUuX3pvZC5ydW4oeyB2YWx1ZToga2V5LCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5UmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkFzeW5jIHNjaGVtYXMgbm90IHN1cHBvcnRlZCBpbiBvYmplY3Qga2V5cyBjdXJyZW50bHlcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBOdW1lcmljIHN0cmluZyBmYWxsYmFjazogaWYga2V5IGlzIGEgbnVtZXJpYyBzdHJpbmcgYW5kIGZhaWxlZCwgcmV0cnkgd2l0aCBOdW1iZXIoa2V5KVxyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBoYW5kbGVzIHoubnVtYmVyKCksIHoubGl0ZXJhbChbMSwgMiwgM10pLCBhbmQgdW5pb25zIGNvbnRhaW5pbmcgbnVtZXJpYyBsaXRlcmFsc1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hlY2tOdW1lcmljS2V5ID0gdHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiAmJiByZWdleGVzLm51bWJlci50ZXN0KGtleSkgJiYga2V5UmVzdWx0Lmlzc3Vlcy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tOdW1lcmljS2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmV0cnlSZXN1bHQgPSBkZWYua2V5VHlwZS5fem9kLnJ1bih7IHZhbHVlOiBOdW1iZXIoa2V5KSwgaXNzdWVzOiBbXSB9LCBjdHgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXRyeVJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXN5bmMgc2NoZW1hcyBub3Qgc3VwcG9ydGVkIGluIG9iamVjdCBrZXlzIGN1cnJlbnRseVwiKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJ5UmVzdWx0Lmlzc3Vlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5UmVzdWx0ID0gcmV0cnlSZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGtleVJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlZi5tb2RlID09PSBcImxvb3NlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGFzcyB0aHJvdWdoIHVuY2hhbmdlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlW2tleV0gPSBpbnB1dFtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGVmYXVsdCBcInN0cmljdFwiIGJlaGF2aW9yOiBlcnJvciBvbiBpbnZhbGlkIGtleVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9rZXlcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbjogXCJyZWNvcmRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzc3Vlczoga2V5UmVzdWx0Lmlzc3Vlcy5tYXAoKGlzcykgPT4gdXRpbC5maW5hbGl6ZUlzc3VlKGlzcywgY3R4LCBjb3JlLmNvbmZpZygpKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDoga2V5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogW2tleV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYudmFsdWVUeXBlLl96b2QucnVuKHsgdmFsdWU6IGlucHV0W2tleV0sIGlzc3VlczogW10gfSwgY3R4KTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvbXMucHVzaChyZXN1bHQudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCguLi51dGlsLnByZWZpeElzc3VlcyhrZXksIHJlc3VsdC5pc3N1ZXMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlW2tleVJlc3VsdC52YWx1ZV0gPSByZXN1bHQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goLi4udXRpbC5wcmVmaXhJc3N1ZXMoa2V5LCByZXN1bHQuaXNzdWVzKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWVba2V5UmVzdWx0LnZhbHVlXSA9IHJlc3VsdC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocHJvbXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9tcykudGhlbigoKSA9PiBwYXlsb2FkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RNYXAgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZE1hcFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmICghKGlucHV0IGluc3RhbmNlb2YgTWFwKSkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcIm1hcFwiLFxyXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwcm9tcyA9IFtdO1xyXG4gICAgICAgIHBheWxvYWQudmFsdWUgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgaW5wdXQpIHtcclxuICAgICAgICAgICAgY29uc3Qga2V5UmVzdWx0ID0gZGVmLmtleVR5cGUuX3pvZC5ydW4oeyB2YWx1ZToga2V5LCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlUmVzdWx0ID0gZGVmLnZhbHVlVHlwZS5fem9kLnJ1bih7IHZhbHVlOiB2YWx1ZSwgaXNzdWVzOiBbXSB9LCBjdHgpO1xyXG4gICAgICAgICAgICBpZiAoa2V5UmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSB8fCB2YWx1ZVJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHByb21zLnB1c2goUHJvbWlzZS5hbGwoW2tleVJlc3VsdCwgdmFsdWVSZXN1bHRdKS50aGVuKChba2V5UmVzdWx0LCB2YWx1ZVJlc3VsdF0pID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVNYXBSZXN1bHQoa2V5UmVzdWx0LCB2YWx1ZVJlc3VsdCwgcGF5bG9hZCwga2V5LCBpbnB1dCwgaW5zdCwgY3R4KTtcclxuICAgICAgICAgICAgICAgIH0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZU1hcFJlc3VsdChrZXlSZXN1bHQsIHZhbHVlUmVzdWx0LCBwYXlsb2FkLCBrZXksIGlucHV0LCBpbnN0LCBjdHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9tcy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9tcykudGhlbigoKSA9PiBwYXlsb2FkKTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5mdW5jdGlvbiBoYW5kbGVNYXBSZXN1bHQoa2V5UmVzdWx0LCB2YWx1ZVJlc3VsdCwgZmluYWwsIGtleSwgaW5wdXQsIGluc3QsIGN0eCkge1xyXG4gICAgaWYgKGtleVJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgaWYgKHV0aWwucHJvcGVydHlLZXlUeXBlcy5oYXModHlwZW9mIGtleSkpIHtcclxuICAgICAgICAgICAgZmluYWwuaXNzdWVzLnB1c2goLi4udXRpbC5wcmVmaXhJc3N1ZXMoa2V5LCBrZXlSZXN1bHQuaXNzdWVzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfa2V5XCIsXHJcbiAgICAgICAgICAgICAgICBvcmlnaW46IFwibWFwXCIsXHJcbiAgICAgICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IGtleVJlc3VsdC5pc3N1ZXMubWFwKChpc3MpID0+IHV0aWwuZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29yZS5jb25maWcoKSkpLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodmFsdWVSZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgIGlmICh1dGlsLnByb3BlcnR5S2V5VHlwZXMuaGFzKHR5cGVvZiBrZXkpKSB7XHJcbiAgICAgICAgICAgIGZpbmFsLmlzc3Vlcy5wdXNoKC4uLnV0aWwucHJlZml4SXNzdWVzKGtleSwgdmFsdWVSZXN1bHQuaXNzdWVzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBmaW5hbC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW46IFwibWFwXCIsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfZWxlbWVudFwiLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IHZhbHVlUmVzdWx0Lmlzc3Vlcy5tYXAoKGlzcykgPT4gdXRpbC5maW5hbGl6ZUlzc3VlKGlzcywgY3R4LCBjb3JlLmNvbmZpZygpKSksXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZpbmFsLnZhbHVlLnNldChrZXlSZXN1bHQudmFsdWUsIHZhbHVlUmVzdWx0LnZhbHVlKTtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZFNldCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kU2V0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKCEoaW5wdXQgaW5zdGFuY2VvZiBTZXQpKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IFwic2V0XCIsXHJcbiAgICAgICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHByb21zID0gW107XHJcbiAgICAgICAgcGF5bG9hZC52YWx1ZSA9IG5ldyBTZXQoKTtcclxuICAgICAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgaW5wdXQpIHtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gZGVmLnZhbHVlVHlwZS5fem9kLnJ1bih7IHZhbHVlOiBpdGVtLCBpc3N1ZXM6IFtdIH0sIGN0eCk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9tcy5wdXNoKHJlc3VsdC50aGVuKChyZXN1bHQpID0+IGhhbmRsZVNldFJlc3VsdChyZXN1bHQsIHBheWxvYWQpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgaGFuZGxlU2V0UmVzdWx0KHJlc3VsdCwgcGF5bG9hZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcm9tcy5sZW5ndGgpXHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9tcykudGhlbigoKSA9PiBwYXlsb2FkKTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5mdW5jdGlvbiBoYW5kbGVTZXRSZXN1bHQocmVzdWx0LCBmaW5hbCkge1xyXG4gICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgZmluYWwuaXNzdWVzLnB1c2goLi4ucmVzdWx0Lmlzc3Vlcyk7XHJcbiAgICB9XHJcbiAgICBmaW5hbC52YWx1ZS5hZGQocmVzdWx0LnZhbHVlKTtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZEVudW0gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZEVudW1cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29uc3QgdmFsdWVzID0gdXRpbC5nZXRFbnVtVmFsdWVzKGRlZi5lbnRyaWVzKTtcclxuICAgIGNvbnN0IHZhbHVlc1NldCA9IG5ldyBTZXQodmFsdWVzKTtcclxuICAgIGluc3QuX3pvZC52YWx1ZXMgPSB2YWx1ZXNTZXQ7XHJcbiAgICBpbnN0Ll96b2QucGF0dGVybiA9IG5ldyBSZWdFeHAoYF4oJHt2YWx1ZXNcclxuICAgICAgICAuZmlsdGVyKChrKSA9PiB1dGlsLnByb3BlcnR5S2V5VHlwZXMuaGFzKHR5cGVvZiBrKSlcclxuICAgICAgICAubWFwKChvKSA9PiAodHlwZW9mIG8gPT09IFwic3RyaW5nXCIgPyB1dGlsLmVzY2FwZVJlZ2V4KG8pIDogby50b1N0cmluZygpKSlcclxuICAgICAgICAuam9pbihcInxcIil9KSRgKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGlmICh2YWx1ZXNTZXQuaGFzKGlucHV0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF92YWx1ZVwiLFxyXG4gICAgICAgICAgICB2YWx1ZXMsXHJcbiAgICAgICAgICAgIGlucHV0LFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kTGl0ZXJhbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTGl0ZXJhbFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpZiAoZGVmLnZhbHVlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY3JlYXRlIGxpdGVyYWwgc2NoZW1hIHdpdGggbm8gdmFsaWQgdmFsdWVzXCIpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdmFsdWVzID0gbmV3IFNldChkZWYudmFsdWVzKTtcclxuICAgIGluc3QuX3pvZC52YWx1ZXMgPSB2YWx1ZXM7XHJcbiAgICBpbnN0Ll96b2QucGF0dGVybiA9IG5ldyBSZWdFeHAoYF4oJHtkZWYudmFsdWVzXHJcbiAgICAgICAgLm1hcCgobykgPT4gKHR5cGVvZiBvID09PSBcInN0cmluZ1wiID8gdXRpbC5lc2NhcGVSZWdleChvKSA6IG8gPyB1dGlsLmVzY2FwZVJlZ2V4KG8udG9TdHJpbmcoKSkgOiBTdHJpbmcobykpKVxyXG4gICAgICAgIC5qb2luKFwifFwiKX0pJGApO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcclxuICAgICAgICBjb25zdCBpbnB1dCA9IHBheWxvYWQudmFsdWU7XHJcbiAgICAgICAgaWYgKHZhbHVlcy5oYXMoaW5wdXQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3ZhbHVlXCIsXHJcbiAgICAgICAgICAgIHZhbHVlczogZGVmLnZhbHVlcyxcclxuICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RGaWxlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RGaWxlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcclxuICAgICAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBGaWxlKVxyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgZXhwZWN0ZWQ6IFwiZmlsZVwiLFxyXG4gICAgICAgICAgICBjb2RlOiBcImludmFsaWRfdHlwZVwiLFxyXG4gICAgICAgICAgICBpbnB1dCxcclxuICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZFRyYW5zZm9ybSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kVHJhbnNmb3JtXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5vcHRpbiA9IFwib3B0aW9uYWxcIjtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBpZiAoY3R4LmRpcmVjdGlvbiA9PT0gXCJiYWNrd2FyZFwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBjb3JlLiRab2RFbmNvZGVFcnJvcihpbnN0LmNvbnN0cnVjdG9yLm5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBfb3V0ID0gZGVmLnRyYW5zZm9ybShwYXlsb2FkLnZhbHVlLCBwYXlsb2FkKTtcclxuICAgICAgICBpZiAoY3R4LmFzeW5jKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG91dHB1dCA9IF9vdXQgaW5zdGFuY2VvZiBQcm9taXNlID8gX291dCA6IFByb21pc2UucmVzb2x2ZShfb3V0KTtcclxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dC50aGVuKChvdXRwdXQpID0+IHtcclxuICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBvdXRwdXQ7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLmZhbGxiYWNrID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKF9vdXQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBjb3JlLiRab2RBc3luY0Vycm9yKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBheWxvYWQudmFsdWUgPSBfb3V0O1xyXG4gICAgICAgIHBheWxvYWQuZmFsbGJhY2sgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxufSk7XHJcbmZ1bmN0aW9uIGhhbmRsZU9wdGlvbmFsUmVzdWx0KHJlc3VsdCwgaW5wdXQpIHtcclxuICAgIGlmIChpbnB1dCA9PT0gdW5kZWZpbmVkICYmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCB8fCByZXN1bHQuZmFsbGJhY2spKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgaXNzdWVzOiBbXSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZE9wdGlvbmFsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RPcHRpb25hbFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2Qub3B0aW4gPSBcIm9wdGlvbmFsXCI7XHJcbiAgICBpbnN0Ll96b2Qub3B0b3V0ID0gXCJvcHRpb25hbFwiO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJ2YWx1ZXNcIiwgKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBkZWYuaW5uZXJUeXBlLl96b2QudmFsdWVzID8gbmV3IFNldChbLi4uZGVmLmlubmVyVHlwZS5fem9kLnZhbHVlcywgdW5kZWZpbmVkXSkgOiB1bmRlZmluZWQ7XHJcbiAgICB9KTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwicGF0dGVyblwiLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcGF0dGVybiA9IGRlZi5pbm5lclR5cGUuX3pvZC5wYXR0ZXJuO1xyXG4gICAgICAgIHJldHVybiBwYXR0ZXJuID8gbmV3IFJlZ0V4cChgXigke3V0aWwuY2xlYW5SZWdleChwYXR0ZXJuLnNvdXJjZSl9KT8kYCkgOiB1bmRlZmluZWQ7XHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBpZiAoZGVmLmlubmVyVHlwZS5fem9kLm9wdGluID09PSBcIm9wdGlvbmFsXCIpIHtcclxuICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC50aGVuKChyKSA9PiBoYW5kbGVPcHRpb25hbFJlc3VsdChyLCBpbnB1dCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlT3B0aW9uYWxSZXN1bHQocmVzdWx0LCBpbnB1dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwYXlsb2FkLnZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RFeGFjdE9wdGlvbmFsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RFeGFjdE9wdGlvbmFsXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIENhbGwgcGFyZW50IGluaXQgLSBpbmhlcml0cyBvcHRpbi9vcHRvdXQgPSBcIm9wdGlvbmFsXCJcclxuICAgICRab2RPcHRpb25hbC5pbml0KGluc3QsIGRlZik7XHJcbiAgICAvLyBPdmVycmlkZSB2YWx1ZXMvcGF0dGVybiB0byBOT1QgYWRkIHVuZGVmaW5lZFxyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJ2YWx1ZXNcIiwgKCkgPT4gZGVmLmlubmVyVHlwZS5fem9kLnZhbHVlcyk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInBhdHRlcm5cIiwgKCkgPT4gZGVmLmlubmVyVHlwZS5fem9kLnBhdHRlcm4pO1xyXG4gICAgLy8gT3ZlcnJpZGUgcGFyc2UgdG8ganVzdCBkZWxlZ2F0ZSAobm8gdW5kZWZpbmVkIGhhbmRsaW5nKVxyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2ROdWxsYWJsZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTnVsbGFibGVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRpblwiLCAoKSA9PiBkZWYuaW5uZXJUeXBlLl96b2Qub3B0aW4pO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRvdXRcIiwgKCkgPT4gZGVmLmlubmVyVHlwZS5fem9kLm9wdG91dCk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInBhdHRlcm5cIiwgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBhdHRlcm4gPSBkZWYuaW5uZXJUeXBlLl96b2QucGF0dGVybjtcclxuICAgICAgICByZXR1cm4gcGF0dGVybiA/IG5ldyBSZWdFeHAoYF4oJHt1dGlsLmNsZWFuUmVnZXgocGF0dGVybi5zb3VyY2UpfXxudWxsKSRgKSA6IHVuZGVmaW5lZDtcclxuICAgIH0pO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJ2YWx1ZXNcIiwgKCkgPT4ge1xyXG4gICAgICAgIHJldHVybiBkZWYuaW5uZXJUeXBlLl96b2QudmFsdWVzID8gbmV3IFNldChbLi4uZGVmLmlubmVyVHlwZS5fem9kLnZhbHVlcywgbnVsbF0pIDogdW5kZWZpbmVkO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgLy8gRm9yd2FyZCBkaXJlY3Rpb24gKGRlY29kZSk6IGFsbG93IG51bGwgdG8gcGFzcyB0aHJvdWdoXHJcbiAgICAgICAgaWYgKHBheWxvYWQudmFsdWUgPT09IG51bGwpXHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIHJldHVybiBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2REZWZhdWx0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2REZWZhdWx0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIC8vIGluc3QuX3pvZC5xaW4gPSBcInRydWVcIjtcclxuICAgIGluc3QuX3pvZC5vcHRpbiA9IFwib3B0aW9uYWxcIjtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwidmFsdWVzXCIsICgpID0+IGRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXMpO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIGlmIChjdHguZGlyZWN0aW9uID09PSBcImJhY2t3YXJkXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gRm9yd2FyZCBkaXJlY3Rpb24gKGRlY29kZSk6IGFwcGx5IGRlZmF1bHRzIGZvciB1bmRlZmluZWQgaW5wdXRcclxuICAgICAgICBpZiAocGF5bG9hZC52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBkZWYuZGVmYXVsdFZhbHVlO1xyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogJFpvZERlZmF1bHQgcmV0dXJucyB0aGUgZGVmYXVsdCB2YWx1ZSBpbW1lZGlhdGVseSBpbiBmb3J3YXJkIGRpcmVjdGlvbi5cclxuICAgICAgICAgICAgICogSXQgZG9lc24ndCBwYXNzIHRoZSBkZWZhdWx0IHZhbHVlIGludG8gdGhlIHZhbGlkYXRvciAoXCJwcmVmYXVsdFwiKS4gVGhlcmUncyBubyByZWFzb24gdG8gcGFzcyB0aGUgZGVmYXVsdCB2YWx1ZSB0aHJvdWdoIHZhbGlkYXRpb24uIFRoZSB2YWxpZGl0eSBvZiB0aGUgZGVmYXVsdCBpcyBlbmZvcmNlZCBieSBUeXBlU2NyaXB0IHN0YXRpY2FsbHkuIE90aGVyd2lzZSwgaXQncyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIHVzZXIgdG8gZW5zdXJlIHRoZSBkZWZhdWx0IGlzIHZhbGlkLiBJbiB0aGUgY2FzZSBvZiBwaXBlcyB3aXRoIGRpdmVyZ2VudCBpbi9vdXQgdHlwZXMsIHlvdSBjYW4gc3BlY2lmeSB0aGUgZGVmYXVsdCBvbiB0aGUgYGluYCBzY2hlbWEgb2YgeW91ciBab2RQaXBlIHRvIHNldCBhIFwicHJlZmF1bHRcIiBmb3IgdGhlIHBpcGUuICAgKi9cclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEZvcndhcmQgZGlyZWN0aW9uOiBjb250aW51ZSB3aXRoIGRlZmF1bHQgaGFuZGxpbmdcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC50aGVuKChyZXN1bHQpID0+IGhhbmRsZURlZmF1bHRSZXN1bHQocmVzdWx0LCBkZWYpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZURlZmF1bHRSZXN1bHQocmVzdWx0LCBkZWYpO1xyXG4gICAgfTtcclxufSk7XHJcbmZ1bmN0aW9uIGhhbmRsZURlZmF1bHRSZXN1bHQocGF5bG9hZCwgZGVmKSB7XHJcbiAgICBpZiAocGF5bG9hZC52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcGF5bG9hZC52YWx1ZSA9IGRlZi5kZWZhdWx0VmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcGF5bG9hZDtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZFByZWZhdWx0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RQcmVmYXVsdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2Qub3B0aW4gPSBcIm9wdGlvbmFsXCI7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInZhbHVlc1wiLCAoKSA9PiBkZWYuaW5uZXJUeXBlLl96b2QudmFsdWVzKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBpZiAoY3R4LmRpcmVjdGlvbiA9PT0gXCJiYWNrd2FyZFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEZvcndhcmQgZGlyZWN0aW9uIChkZWNvZGUpOiBhcHBseSBwcmVmYXVsdCBmb3IgdW5kZWZpbmVkIGlucHV0XHJcbiAgICAgICAgaWYgKHBheWxvYWQudmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gZGVmLmRlZmF1bHRWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZE5vbk9wdGlvbmFsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2ROb25PcHRpb25hbFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInZhbHVlc1wiLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdiA9IGRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXM7XHJcbiAgICAgICAgcmV0dXJuIHYgPyBuZXcgU2V0KFsuLi52XS5maWx0ZXIoKHgpID0+IHggIT09IHVuZGVmaW5lZCkpIDogdW5kZWZpbmVkO1xyXG4gICAgfSk7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGVmLmlubmVyVHlwZS5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbigocmVzdWx0KSA9PiBoYW5kbGVOb25PcHRpb25hbFJlc3VsdChyZXN1bHQsIGluc3QpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZU5vbk9wdGlvbmFsUmVzdWx0KHJlc3VsdCwgaW5zdCk7XHJcbiAgICB9O1xyXG59KTtcclxuZnVuY3Rpb24gaGFuZGxlTm9uT3B0aW9uYWxSZXN1bHQocGF5bG9hZCwgaW5zdCkge1xyXG4gICAgaWYgKCFwYXlsb2FkLmlzc3Vlcy5sZW5ndGggJiYgcGF5bG9hZC52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIGV4cGVjdGVkOiBcIm5vbm9wdGlvbmFsXCIsXHJcbiAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBheWxvYWQ7XHJcbn1cclxuZXhwb3J0IGNvbnN0ICRab2RTdWNjZXNzID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RTdWNjZXNzXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBpZiAoY3R4LmRpcmVjdGlvbiA9PT0gXCJiYWNrd2FyZFwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBjb3JlLiRab2RFbmNvZGVFcnJvcihcIlpvZFN1Y2Nlc3NcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IHJlc3VsdC5pc3N1ZXMubGVuZ3RoID09PSAwO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXlsb2FkLnZhbHVlID0gcmVzdWx0Lmlzc3Vlcy5sZW5ndGggPT09IDA7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RDYXRjaCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ2F0Y2hcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLm9wdGluID0gXCJvcHRpb25hbFwiO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRvdXRcIiwgKCkgPT4gZGVmLmlubmVyVHlwZS5fem9kLm9wdG91dCk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInZhbHVlc1wiLCAoKSA9PiBkZWYuaW5uZXJUeXBlLl96b2QudmFsdWVzKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBjdHgpID0+IHtcclxuICAgICAgICBpZiAoY3R4LmRpcmVjdGlvbiA9PT0gXCJiYWNrd2FyZFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkZWYuaW5uZXJUeXBlLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEZvcndhcmQgZGlyZWN0aW9uIChkZWNvZGUpOiBhcHBseSBjYXRjaCBsb2dpY1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnRoZW4oKHJlc3VsdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IHJlc3VsdC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQudmFsdWUgPSBkZWYuY2F0Y2hWYWx1ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnBheWxvYWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc3N1ZXM6IHJlc3VsdC5pc3N1ZXMubWFwKChpc3MpID0+IHV0aWwuZmluYWxpemVJc3N1ZShpc3MsIGN0eCwgY29yZS5jb25maWcoKSkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3VlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQuZmFsbGJhY2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXlsb2FkLnZhbHVlID0gcmVzdWx0LnZhbHVlO1xyXG4gICAgICAgIGlmIChyZXN1bHQuaXNzdWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gZGVmLmNhdGNoVmFsdWUoe1xyXG4gICAgICAgICAgICAgICAgLi4ucGF5bG9hZCxcclxuICAgICAgICAgICAgICAgIGVycm9yOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNzdWVzOiByZXN1bHQuaXNzdWVzLm1hcCgoaXNzKSA9PiB1dGlsLmZpbmFsaXplSXNzdWUoaXNzLCBjdHgsIGNvcmUuY29uZmlnKCkpKSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzID0gW107XHJcbiAgICAgICAgICAgIHBheWxvYWQuZmFsbGJhY2sgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZE5hTiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kTmFOXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wYXJzZSA9IChwYXlsb2FkLCBfY3R4KSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXlsb2FkLnZhbHVlICE9PSBcIm51bWJlclwiIHx8ICFOdW1iZXIuaXNOYU4ocGF5bG9hZC52YWx1ZSkpIHtcclxuICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogXCJuYW5cIixcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RQaXBlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RQaXBlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgICRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwidmFsdWVzXCIsICgpID0+IGRlZi5pbi5fem9kLnZhbHVlcyk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcIm9wdGluXCIsICgpID0+IGRlZi5pbi5fem9kLm9wdGluKTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwib3B0b3V0XCIsICgpID0+IGRlZi5vdXQuX3pvZC5vcHRvdXQpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJwcm9wVmFsdWVzXCIsICgpID0+IGRlZi5pbi5fem9kLnByb3BWYWx1ZXMpO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIGlmIChjdHguZGlyZWN0aW9uID09PSBcImJhY2t3YXJkXCIpIHtcclxuICAgICAgICAgICAgY29uc3QgcmlnaHQgPSBkZWYub3V0Ll96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgICAgIGlmIChyaWdodCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByaWdodC50aGVuKChyaWdodCkgPT4gaGFuZGxlUGlwZVJlc3VsdChyaWdodCwgZGVmLmluLCBjdHgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaGFuZGxlUGlwZVJlc3VsdChyaWdodCwgZGVmLmluLCBjdHgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsZWZ0ID0gZGVmLmluLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgaWYgKGxlZnQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsZWZ0LnRoZW4oKGxlZnQpID0+IGhhbmRsZVBpcGVSZXN1bHQobGVmdCwgZGVmLm91dCwgY3R4KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoYW5kbGVQaXBlUmVzdWx0KGxlZnQsIGRlZi5vdXQsIGN0eCk7XHJcbiAgICB9O1xyXG59KTtcclxuZnVuY3Rpb24gaGFuZGxlUGlwZVJlc3VsdChsZWZ0LCBuZXh0LCBjdHgpIHtcclxuICAgIGlmIChsZWZ0Lmlzc3Vlcy5sZW5ndGgpIHtcclxuICAgICAgICAvLyBwcmV2ZW50IGZ1cnRoZXIgY2hlY2tzXHJcbiAgICAgICAgbGVmdC5hYm9ydGVkID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gbGVmdDtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXh0Ll96b2QucnVuKHsgdmFsdWU6IGxlZnQudmFsdWUsIGlzc3VlczogbGVmdC5pc3N1ZXMsIGZhbGxiYWNrOiBsZWZ0LmZhbGxiYWNrIH0sIGN0eCk7XHJcbn1cclxuZXhwb3J0IGNvbnN0ICRab2RDb2RlYyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kQ29kZWNcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJ2YWx1ZXNcIiwgKCkgPT4gZGVmLmluLl96b2QudmFsdWVzKTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwib3B0aW5cIiwgKCkgPT4gZGVmLmluLl96b2Qub3B0aW4pO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRvdXRcIiwgKCkgPT4gZGVmLm91dC5fem9kLm9wdG91dCk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcInByb3BWYWx1ZXNcIiwgKCkgPT4gZGVmLmluLl96b2QucHJvcFZhbHVlcyk7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uID0gY3R4LmRpcmVjdGlvbiB8fCBcImZvcndhcmRcIjtcclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBcImZvcndhcmRcIikge1xyXG4gICAgICAgICAgICBjb25zdCBsZWZ0ID0gZGVmLmluLl96b2QucnVuKHBheWxvYWQsIGN0eCk7XHJcbiAgICAgICAgICAgIGlmIChsZWZ0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnQudGhlbigobGVmdCkgPT4gaGFuZGxlQ29kZWNBUmVzdWx0KGxlZnQsIGRlZiwgY3R4KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUNvZGVjQVJlc3VsdChsZWZ0LCBkZWYsIGN0eCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCByaWdodCA9IGRlZi5vdXQuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICAgICAgaWYgKHJpZ2h0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJpZ2h0LnRoZW4oKHJpZ2h0KSA9PiBoYW5kbGVDb2RlY0FSZXN1bHQocmlnaHQsIGRlZiwgY3R4KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZUNvZGVjQVJlc3VsdChyaWdodCwgZGVmLCBjdHgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbn0pO1xyXG5mdW5jdGlvbiBoYW5kbGVDb2RlY0FSZXN1bHQocmVzdWx0LCBkZWYsIGN0eCkge1xyXG4gICAgaWYgKHJlc3VsdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgLy8gcHJldmVudCBmdXJ0aGVyIGNoZWNrc1xyXG4gICAgICAgIHJlc3VsdC5hYm9ydGVkID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgY29uc3QgZGlyZWN0aW9uID0gY3R4LmRpcmVjdGlvbiB8fCBcImZvcndhcmRcIjtcclxuICAgIGlmIChkaXJlY3Rpb24gPT09IFwiZm9yd2FyZFwiKSB7XHJcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtZWQgPSBkZWYudHJhbnNmb3JtKHJlc3VsdC52YWx1ZSwgcmVzdWx0KTtcclxuICAgICAgICBpZiAodHJhbnNmb3JtZWQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1lZC50aGVuKCh2YWx1ZSkgPT4gaGFuZGxlQ29kZWNUeFJlc3VsdChyZXN1bHQsIHZhbHVlLCBkZWYub3V0LCBjdHgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhbmRsZUNvZGVjVHhSZXN1bHQocmVzdWx0LCB0cmFuc2Zvcm1lZCwgZGVmLm91dCwgY3R4KTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkID0gZGVmLnJldmVyc2VUcmFuc2Zvcm0ocmVzdWx0LnZhbHVlLCByZXN1bHQpO1xyXG4gICAgICAgIGlmICh0cmFuc2Zvcm1lZCBpbnN0YW5jZW9mIFByb21pc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWVkLnRoZW4oKHZhbHVlKSA9PiBoYW5kbGVDb2RlY1R4UmVzdWx0KHJlc3VsdCwgdmFsdWUsIGRlZi5pbiwgY3R4KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoYW5kbGVDb2RlY1R4UmVzdWx0KHJlc3VsdCwgdHJhbnNmb3JtZWQsIGRlZi5pbiwgY3R4KTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBoYW5kbGVDb2RlY1R4UmVzdWx0KGxlZnQsIHZhbHVlLCBuZXh0U2NoZW1hLCBjdHgpIHtcclxuICAgIC8vIENoZWNrIGlmIHRyYW5zZm9ybSBhZGRlZCBhbnkgaXNzdWVzXHJcbiAgICBpZiAobGVmdC5pc3N1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgbGVmdC5hYm9ydGVkID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gbGVmdDtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXh0U2NoZW1hLl96b2QucnVuKHsgdmFsdWUsIGlzc3VlczogbGVmdC5pc3N1ZXMgfSwgY3R4KTtcclxufVxyXG5leHBvcnQgY29uc3QgJFpvZFByZXByb2Nlc3MgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFByZXByb2Nlc3NcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFBpcGUuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0ICRab2RSZWFkb25seSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kUmVhZG9ubHlcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJwcm9wVmFsdWVzXCIsICgpID0+IGRlZi5pbm5lclR5cGUuX3pvZC5wcm9wVmFsdWVzKTtcclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwidmFsdWVzXCIsICgpID0+IGRlZi5pbm5lclR5cGUuX3pvZC52YWx1ZXMpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRpblwiLCAoKSA9PiBkZWYuaW5uZXJUeXBlPy5fem9kPy5vcHRpbik7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdC5fem9kLCBcIm9wdG91dFwiLCAoKSA9PiBkZWYuaW5uZXJUeXBlPy5fem9kPy5vcHRvdXQpO1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIGN0eCkgPT4ge1xyXG4gICAgICAgIGlmIChjdHguZGlyZWN0aW9uID09PSBcImJhY2t3YXJkXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRlZi5pbm5lclR5cGUuX3pvZC5ydW4ocGF5bG9hZCwgY3R4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGVmLmlubmVyVHlwZS5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xyXG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbihoYW5kbGVSZWFkb25seVJlc3VsdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoYW5kbGVSZWFkb25seVJlc3VsdChyZXN1bHQpO1xyXG4gICAgfTtcclxufSk7XHJcbmZ1bmN0aW9uIGhhbmRsZVJlYWRvbmx5UmVzdWx0KHBheWxvYWQpIHtcclxuICAgIHBheWxvYWQudmFsdWUgPSBPYmplY3QuZnJlZXplKHBheWxvYWQudmFsdWUpO1xyXG4gICAgcmV0dXJuIHBheWxvYWQ7XHJcbn1cclxuZXhwb3J0IGNvbnN0ICRab2RUZW1wbGF0ZUxpdGVyYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZFRlbXBsYXRlTGl0ZXJhbFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb25zdCByZWdleFBhcnRzID0gW107XHJcbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgZGVmLnBhcnRzKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJ0ID09PSBcIm9iamVjdFwiICYmIHBhcnQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgLy8gaXMgWm9kIHNjaGVtYVxyXG4gICAgICAgICAgICBpZiAoIXBhcnQuX3pvZC5wYXR0ZXJuKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBpZiAoIXNvdXJjZSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0ZW1wbGF0ZSBsaXRlcmFsIHBhcnQsIG5vIHBhdHRlcm4gZm91bmQ6ICR7Wy4uLnBhcnQuX3pvZC50cmFpdHNdLnNoaWZ0KCl9YCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gcGFydC5fem9kLnBhdHRlcm4gaW5zdGFuY2VvZiBSZWdFeHAgPyBwYXJ0Ll96b2QucGF0dGVybi5zb3VyY2UgOiBwYXJ0Ll96b2QucGF0dGVybjtcclxuICAgICAgICAgICAgaWYgKCFzb3VyY2UpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgdGVtcGxhdGUgbGl0ZXJhbCBwYXJ0OiAke3BhcnQuX3pvZC50cmFpdHN9YCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gc291cmNlLnN0YXJ0c1dpdGgoXCJeXCIpID8gMSA6IDA7XHJcbiAgICAgICAgICAgIGNvbnN0IGVuZCA9IHNvdXJjZS5lbmRzV2l0aChcIiRcIikgPyBzb3VyY2UubGVuZ3RoIC0gMSA6IHNvdXJjZS5sZW5ndGg7XHJcbiAgICAgICAgICAgIHJlZ2V4UGFydHMucHVzaChzb3VyY2Uuc2xpY2Uoc3RhcnQsIGVuZCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChwYXJ0ID09PSBudWxsIHx8IHV0aWwucHJpbWl0aXZlVHlwZXMuaGFzKHR5cGVvZiBwYXJ0KSkge1xyXG4gICAgICAgICAgICByZWdleFBhcnRzLnB1c2godXRpbC5lc2NhcGVSZWdleChgJHtwYXJ0fWApKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0ZW1wbGF0ZSBsaXRlcmFsIHBhcnQ6ICR7cGFydH1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpbnN0Ll96b2QucGF0dGVybiA9IG5ldyBSZWdFeHAoYF4ke3JlZ2V4UGFydHMuam9pbihcIlwiKX0kYCk7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgX2N0eCkgPT4ge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcGF5bG9hZC52YWx1ZSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgY29kZTogXCJpbnZhbGlkX3R5cGVcIixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbnN0Ll96b2QucGF0dGVybi5sYXN0SW5kZXggPSAwO1xyXG4gICAgICAgIGlmICghaW5zdC5fem9kLnBhdHRlcm4udGVzdChwYXlsb2FkLnZhbHVlKSkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGlucHV0OiBwYXlsb2FkLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgaW5zdCxcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF9mb3JtYXRcIixcclxuICAgICAgICAgICAgICAgIGZvcm1hdDogZGVmLmZvcm1hdCA/PyBcInRlbXBsYXRlX2xpdGVyYWxcIixcclxuICAgICAgICAgICAgICAgIHBhdHRlcm46IGluc3QuX3pvZC5wYXR0ZXJuLnNvdXJjZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZEZ1bmN0aW9uID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RGdW5jdGlvblwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll9kZWYgPSBkZWY7XHJcbiAgICBpbnN0Ll96b2QuZGVmID0gZGVmO1xyXG4gICAgaW5zdC5pbXBsZW1lbnQgPSAoZnVuYykgPT4ge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZnVuYyAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImltcGxlbWVudCgpIG11c3QgYmUgY2FsbGVkIHdpdGggYSBmdW5jdGlvblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZEFyZ3MgPSBpbnN0Ll9kZWYuaW5wdXQgPyBwYXJzZShpbnN0Ll9kZWYuaW5wdXQsIGFyZ3MpIDogYXJncztcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gUmVmbGVjdC5hcHBseShmdW5jLCB0aGlzLCBwYXJzZWRBcmdzKTtcclxuICAgICAgICAgICAgaWYgKGluc3QuX2RlZi5vdXRwdXQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZShpbnN0Ll9kZWYub3V0cHV0LCByZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcbiAgICBpbnN0LmltcGxlbWVudEFzeW5jID0gKGZ1bmMpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIGZ1bmMgIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbXBsZW1lbnRBc3luYygpIG11c3QgYmUgY2FsbGVkIHdpdGggYSBmdW5jdGlvblwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFzeW5jIGZ1bmN0aW9uICguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZEFyZ3MgPSBpbnN0Ll9kZWYuaW5wdXQgPyBhd2FpdCBwYXJzZUFzeW5jKGluc3QuX2RlZi5pbnB1dCwgYXJncykgOiBhcmdzO1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBSZWZsZWN0LmFwcGx5KGZ1bmMsIHRoaXMsIHBhcnNlZEFyZ3MpO1xyXG4gICAgICAgICAgICBpZiAoaW5zdC5fZGVmLm91dHB1dCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHBhcnNlQXN5bmMoaW5zdC5fZGVmLm91dHB1dCwgcmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG4gICAgaW5zdC5fem9kLnBhcnNlID0gKHBheWxvYWQsIF9jdHgpID0+IHtcclxuICAgICAgICBpZiAodHlwZW9mIHBheWxvYWQudmFsdWUgIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogXCJmdW5jdGlvblwiLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQ6IHBheWxvYWQudmFsdWUsXHJcbiAgICAgICAgICAgICAgICBpbnN0LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIENoZWNrIGlmIG91dHB1dCBpcyBhIHByb21pc2UgdHlwZSB0byBkZXRlcm1pbmUgaWYgd2Ugc2hvdWxkIHVzZSBhc3luYyBpbXBsZW1lbnRhdGlvblxyXG4gICAgICAgIGNvbnN0IGhhc1Byb21pc2VPdXRwdXQgPSBpbnN0Ll9kZWYub3V0cHV0ICYmIGluc3QuX2RlZi5vdXRwdXQuX3pvZC5kZWYudHlwZSA9PT0gXCJwcm9taXNlXCI7XHJcbiAgICAgICAgaWYgKGhhc1Byb21pc2VPdXRwdXQpIHtcclxuICAgICAgICAgICAgcGF5bG9hZC52YWx1ZSA9IGluc3QuaW1wbGVtZW50QXN5bmMocGF5bG9hZC52YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gaW5zdC5pbXBsZW1lbnQocGF5bG9hZC52YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxuICAgIGluc3QuaW5wdXQgPSAoLi4uYXJncykgPT4ge1xyXG4gICAgICAgIGNvbnN0IEYgPSBpbnN0LmNvbnN0cnVjdG9yO1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGFyZ3NbMF0pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRih7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXHJcbiAgICAgICAgICAgICAgICBpbnB1dDogbmV3ICRab2RUdXBsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0dXBsZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBhcmdzWzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3Q6IGFyZ3NbMV0sXHJcbiAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgIG91dHB1dDogaW5zdC5fZGVmLm91dHB1dCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgRih7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiZnVuY3Rpb25cIixcclxuICAgICAgICAgICAgaW5wdXQ6IGFyZ3NbMF0sXHJcbiAgICAgICAgICAgIG91dHB1dDogaW5zdC5fZGVmLm91dHB1dCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICBpbnN0Lm91dHB1dCA9IChvdXRwdXQpID0+IHtcclxuICAgICAgICBjb25zdCBGID0gaW5zdC5jb25zdHJ1Y3RvcjtcclxuICAgICAgICByZXR1cm4gbmV3IEYoe1xyXG4gICAgICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXHJcbiAgICAgICAgICAgIGlucHV0OiBpbnN0Ll9kZWYuaW5wdXQsXHJcbiAgICAgICAgICAgIG91dHB1dCxcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gaW5zdDtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kUHJvbWlzZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCIkWm9kUHJvbWlzZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwYXlsb2FkLnZhbHVlKS50aGVuKChpbm5lcikgPT4gZGVmLmlubmVyVHlwZS5fem9kLnJ1bih7IHZhbHVlOiBpbm5lciwgaXNzdWVzOiBbXSB9LCBjdHgpKTtcclxuICAgIH07XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgJFpvZExhenkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiJFpvZExhenlcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgJFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgLy8gQ2FjaGUgdGhlIHJlc29sdmVkIGlubmVyIHR5cGUgb24gdGhlIHNoYXJlZCBgZGVmYCBzbyBhbGwgY2xvbmVzIG9mIHRoaXNcclxuICAgIC8vIGxhenkgKGUuZy4gdmlhIGAuZGVzY3JpYmUoKWAvYC5tZXRhKClgKSBzaGFyZSB0aGUgc2FtZSBpbm5lciBpbnN0YW5jZSxcclxuICAgIC8vIHByZXNlcnZpbmcgaWRlbnRpdHkgZm9yIGN5Y2xlIGRldGVjdGlvbiBvbiByZWN1cnNpdmUgc2NoZW1hcy5cclxuICAgIHV0aWwuZGVmaW5lTGF6eShpbnN0Ll96b2QsIFwiaW5uZXJUeXBlXCIsICgpID0+IHtcclxuICAgICAgICBjb25zdCBkID0gZGVmO1xyXG4gICAgICAgIGlmICghZC5fY2FjaGVkSW5uZXIpXHJcbiAgICAgICAgICAgIGQuX2NhY2hlZElubmVyID0gZGVmLmdldHRlcigpO1xyXG4gICAgICAgIHJldHVybiBkLl9jYWNoZWRJbm5lcjtcclxuICAgIH0pO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJwYXR0ZXJuXCIsICgpID0+IGluc3QuX3pvZC5pbm5lclR5cGU/Ll96b2Q/LnBhdHRlcm4pO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJwcm9wVmFsdWVzXCIsICgpID0+IGluc3QuX3pvZC5pbm5lclR5cGU/Ll96b2Q/LnByb3BWYWx1ZXMpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRpblwiLCAoKSA9PiBpbnN0Ll96b2QuaW5uZXJUeXBlPy5fem9kPy5vcHRpbiA/PyB1bmRlZmluZWQpO1xyXG4gICAgdXRpbC5kZWZpbmVMYXp5KGluc3QuX3pvZCwgXCJvcHRvdXRcIiwgKCkgPT4gaW5zdC5fem9kLmlubmVyVHlwZT8uX3pvZD8ub3B0b3V0ID8/IHVuZGVmaW5lZCk7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgY3R4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5uZXIgPSBpbnN0Ll96b2QuaW5uZXJUeXBlO1xyXG4gICAgICAgIHJldHVybiBpbm5lci5fem9kLnJ1bihwYXlsb2FkLCBjdHgpO1xyXG4gICAgfTtcclxufSk7XHJcbmV4cG9ydCBjb25zdCAkWm9kQ3VzdG9tID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIiRab2RDdXN0b21cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY2hlY2tzLiRab2RDaGVjay5pbml0KGluc3QsIGRlZik7XHJcbiAgICAkWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgXykgPT4ge1xyXG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xyXG4gICAgfTtcclxuICAgIGluc3QuX3pvZC5jaGVjayA9IChwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW5wdXQgPSBwYXlsb2FkLnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IHIgPSBkZWYuZm4oaW5wdXQpO1xyXG4gICAgICAgIGlmIChyIGluc3RhbmNlb2YgUHJvbWlzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gci50aGVuKChyKSA9PiBoYW5kbGVSZWZpbmVSZXN1bHQociwgcGF5bG9hZCwgaW5wdXQsIGluc3QpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaGFuZGxlUmVmaW5lUmVzdWx0KHIsIHBheWxvYWQsIGlucHV0LCBpbnN0KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9O1xyXG59KTtcclxuZnVuY3Rpb24gaGFuZGxlUmVmaW5lUmVzdWx0KHJlc3VsdCwgcGF5bG9hZCwgaW5wdXQsIGluc3QpIHtcclxuICAgIGlmICghcmVzdWx0KSB7XHJcbiAgICAgICAgY29uc3QgX2lzcyA9IHtcclxuICAgICAgICAgICAgY29kZTogXCJjdXN0b21cIixcclxuICAgICAgICAgICAgaW5wdXQsXHJcbiAgICAgICAgICAgIGluc3QsIC8vIGluY29ycG9yYXRlcyBwYXJhbXMuZXJyb3IgaW50byBpc3N1ZSByZXBvcnRpbmdcclxuICAgICAgICAgICAgcGF0aDogWy4uLihpbnN0Ll96b2QuZGVmLnBhdGggPz8gW10pXSwgLy8gaW5jb3Jwb3JhdGVzIHBhcmFtcy5lcnJvciBpbnRvIGlzc3VlIHJlcG9ydGluZ1xyXG4gICAgICAgICAgICBjb250aW51ZTogIWluc3QuX3pvZC5kZWYuYWJvcnQsXHJcbiAgICAgICAgICAgIC8vIHBhcmFtczogaW5zdC5fem9kLmRlZi5wYXJhbXMsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoaW5zdC5fem9kLmRlZi5wYXJhbXMpXHJcbiAgICAgICAgICAgIF9pc3MucGFyYW1zID0gaW5zdC5fem9kLmRlZi5wYXJhbXM7XHJcbiAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh1dGlsLmlzc3VlKF9pc3MpKTtcclxuICAgIH1cclxufVxyXG4iLCJ2YXIgX2E7XHJcbmV4cG9ydCBjb25zdCAkb3V0cHV0ID0gU3ltYm9sKFwiWm9kT3V0cHV0XCIpO1xyXG5leHBvcnQgY29uc3QgJGlucHV0ID0gU3ltYm9sKFwiWm9kSW5wdXRcIik7XHJcbmV4cG9ydCBjbGFzcyAkWm9kUmVnaXN0cnkge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5fbWFwID0gbmV3IFdlYWtNYXAoKTtcclxuICAgICAgICB0aGlzLl9pZG1hcCA9IG5ldyBNYXAoKTtcclxuICAgIH1cclxuICAgIGFkZChzY2hlbWEsIC4uLl9tZXRhKSB7XHJcbiAgICAgICAgY29uc3QgbWV0YSA9IF9tZXRhWzBdO1xyXG4gICAgICAgIHRoaXMuX21hcC5zZXQoc2NoZW1hLCBtZXRhKTtcclxuICAgICAgICBpZiAobWV0YSAmJiB0eXBlb2YgbWV0YSA9PT0gXCJvYmplY3RcIiAmJiBcImlkXCIgaW4gbWV0YSkge1xyXG4gICAgICAgICAgICB0aGlzLl9pZG1hcC5zZXQobWV0YS5pZCwgc2NoZW1hKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBjbGVhcigpIHtcclxuICAgICAgICB0aGlzLl9tYXAgPSBuZXcgV2Vha01hcCgpO1xyXG4gICAgICAgIHRoaXMuX2lkbWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlKHNjaGVtYSkge1xyXG4gICAgICAgIGNvbnN0IG1ldGEgPSB0aGlzLl9tYXAuZ2V0KHNjaGVtYSk7XHJcbiAgICAgICAgaWYgKG1ldGEgJiYgdHlwZW9mIG1ldGEgPT09IFwib2JqZWN0XCIgJiYgXCJpZFwiIGluIG1ldGEpIHtcclxuICAgICAgICAgICAgdGhpcy5faWRtYXAuZGVsZXRlKG1ldGEuaWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9tYXAuZGVsZXRlKHNjaGVtYSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBnZXQoc2NoZW1hKSB7XHJcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuX21hcC5nZXQoc2NoZW1hKSBhcyBhbnk7XHJcbiAgICAgICAgLy8gaW5oZXJpdCBtZXRhZGF0YVxyXG4gICAgICAgIGNvbnN0IHAgPSBzY2hlbWEuX3pvZC5wYXJlbnQ7XHJcbiAgICAgICAgaWYgKHApIHtcclxuICAgICAgICAgICAgY29uc3QgcG0gPSB7IC4uLih0aGlzLmdldChwKSA/PyB7fSkgfTtcclxuICAgICAgICAgICAgZGVsZXRlIHBtLmlkOyAvLyBkbyBub3QgaW5oZXJpdCBpZFxyXG4gICAgICAgICAgICBjb25zdCBmID0geyAuLi5wbSwgLi4udGhpcy5fbWFwLmdldChzY2hlbWEpIH07XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhmKS5sZW5ndGggPyBmIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fbWFwLmdldChzY2hlbWEpO1xyXG4gICAgfVxyXG4gICAgaGFzKHNjaGVtYSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9tYXAuaGFzKHNjaGVtYSk7XHJcbiAgICB9XHJcbn1cclxuLy8gcmVnaXN0cmllc1xyXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0cnkoKSB7XHJcbiAgICByZXR1cm4gbmV3ICRab2RSZWdpc3RyeSgpO1xyXG59XHJcbihfYSA9IGdsb2JhbFRoaXMpLl9fem9kX2dsb2JhbFJlZ2lzdHJ5ID8/IChfYS5fX3pvZF9nbG9iYWxSZWdpc3RyeSA9IHJlZ2lzdHJ5KCkpO1xyXG5leHBvcnQgY29uc3QgZ2xvYmFsUmVnaXN0cnkgPSBnbG9iYWxUaGlzLl9fem9kX2dsb2JhbFJlZ2lzdHJ5O1xyXG4iLCJpbXBvcnQgKiBhcyBjaGVja3MgZnJvbSBcIi4vY2hlY2tzLmpzXCI7XHJcbmltcG9ydCAqIGFzIHJlZ2lzdHJpZXMgZnJvbSBcIi4vcmVnaXN0cmllcy5qc1wiO1xyXG5pbXBvcnQgKiBhcyBzY2hlbWFzIGZyb20gXCIuL3NjaGVtYXMuanNcIjtcclxuaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi91dGlsLmpzXCI7XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfc3RyaW5nKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfY29lcmNlZFN0cmluZyhDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGNvZXJjZTogdHJ1ZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9lbWFpbChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJlbWFpbFwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfZ3VpZChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJndWlkXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF91dWlkKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcInV1aWRcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3V1aWR2NChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJ1dWlkXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICB2ZXJzaW9uOiBcInY0XCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfdXVpZHY2KENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcInV1aWRcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIHZlcnNpb246IFwidjZcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF91dWlkdjcoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwidXVpZFwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgdmVyc2lvbjogXCJ2N1wiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3VybChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJ1cmxcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2Vtb2ppKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcImVtb2ppXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9uYW5vaWQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwibmFub2lkXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLyoqXHJcbiAqIEBkZXByZWNhdGVkIENVSUQgdjEgaXMgZGVwcmVjYXRlZCBieSBpdHMgYXV0aG9ycyBkdWUgdG8gaW5mb3JtYXRpb24gbGVha2FnZVxyXG4gKiAodGltZXN0YW1wcyBlbWJlZGRlZCBpbiB0aGUgaWQpLiBVc2Uge0BsaW5rIF9jdWlkMn0gaW5zdGVhZC5cclxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXJhbGxlbGRyaXZlL2N1aWQuXHJcbiAqL1xyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2N1aWQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwiY3VpZFwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfY3VpZDIoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwiY3VpZDJcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3VsaWQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwidWxpZFwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfeGlkKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcInhpZFwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfa3N1aWQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwia3N1aWRcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2lwdjQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwiaXB2NFwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfaXB2NihDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJpcHY2XCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9tYWMoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwibWFjXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9jaWRydjQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwiY2lkcnY0XCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9jaWRydjYoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwiY2lkcnY2XCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9iYXNlNjQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwiYmFzZTY0XCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9iYXNlNjR1cmwoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQ6IFwiYmFzZTY0dXJsXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9lMTY0KENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcImUxNjRcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2p3dChDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJqd3RcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgVGltZVByZWNpc2lvbiA9IHtcclxuICAgIEFueTogbnVsbCxcclxuICAgIE1pbnV0ZTogLTEsXHJcbiAgICBTZWNvbmQ6IDAsXHJcbiAgICBNaWxsaXNlY29uZDogMyxcclxuICAgIE1pY3Jvc2Vjb25kOiA2LFxyXG59O1xyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2lzb0RhdGVUaW1lKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcImRhdGV0aW1lXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIG9mZnNldDogZmFsc2UsXHJcbiAgICAgICAgbG9jYWw6IGZhbHNlLFxyXG4gICAgICAgIHByZWNpc2lvbjogbnVsbCxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9pc29EYXRlKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXHJcbiAgICAgICAgZm9ybWF0OiBcImRhdGVcIixcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfaXNvVGltZShDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJ0aW1lXCIsXHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIHByZWNpc2lvbjogbnVsbCxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9pc29EdXJhdGlvbihDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJkdXJhdGlvblwiLFxyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9udW1iZXIoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICBjaGVja3M6IFtdLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2NvZXJjZWROdW1iZXIoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICBjb2VyY2U6IHRydWUsXHJcbiAgICAgICAgY2hlY2tzOiBbXSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9pbnQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICBjaGVjazogXCJudW1iZXJfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIGZvcm1hdDogXCJzYWZlaW50XCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfZmxvYXQzMihDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxyXG4gICAgICAgIGNoZWNrOiBcIm51bWJlcl9mb3JtYXRcIixcclxuICAgICAgICBhYm9ydDogZmFsc2UsXHJcbiAgICAgICAgZm9ybWF0OiBcImZsb2F0MzJcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9mbG9hdDY0KENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgY2hlY2s6IFwibnVtYmVyX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICBmb3JtYXQ6IFwiZmxvYXQ2NFwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2ludDMyKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgY2hlY2s6IFwibnVtYmVyX2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICBmb3JtYXQ6IFwiaW50MzJcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF91aW50MzIoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcclxuICAgICAgICBjaGVjazogXCJudW1iZXJfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIGZvcm1hdDogXCJ1aW50MzJcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9ib29sZWFuKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2NvZXJjZWRCb29sZWFuKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxyXG4gICAgICAgIGNvZXJjZTogdHJ1ZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9iaWdpbnQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJiaWdpbnRcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9jb2VyY2VkQmlnaW50KENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwiYmlnaW50XCIsXHJcbiAgICAgICAgY29lcmNlOiB0cnVlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2ludDY0KENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwiYmlnaW50XCIsXHJcbiAgICAgICAgY2hlY2s6IFwiYmlnaW50X2Zvcm1hdFwiLFxyXG4gICAgICAgIGFib3J0OiBmYWxzZSxcclxuICAgICAgICBmb3JtYXQ6IFwiaW50NjRcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF91aW50NjQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJiaWdpbnRcIixcclxuICAgICAgICBjaGVjazogXCJiaWdpbnRfZm9ybWF0XCIsXHJcbiAgICAgICAgYWJvcnQ6IGZhbHNlLFxyXG4gICAgICAgIGZvcm1hdDogXCJ1aW50NjRcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9zeW1ib2woQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzeW1ib2xcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF91bmRlZmluZWQoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJ1bmRlZmluZWRcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9udWxsKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwibnVsbFwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2FueShDbGFzcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJhbnlcIixcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfdW5rbm93bihDbGFzcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJ1bmtub3duXCIsXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX25ldmVyKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwibmV2ZXJcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF92b2lkKENsYXNzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwidm9pZFwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2RhdGUoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJkYXRlXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfY29lcmNlZERhdGUoQ2xhc3MsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJkYXRlXCIsXHJcbiAgICAgICAgY29lcmNlOiB0cnVlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX25hbihDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcIm5hblwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2x0KHZhbHVlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja0xlc3NUaGFuKHtcclxuICAgICAgICBjaGVjazogXCJsZXNzX3RoYW5cIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgICAgIHZhbHVlLFxyXG4gICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2x0ZSh2YWx1ZSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tMZXNzVGhhbih7XHJcbiAgICAgICAgY2hlY2s6IFwibGVzc190aGFuXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICB2YWx1ZSxcclxuICAgICAgICBpbmNsdXNpdmU6IHRydWUsXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgeyBcclxuLyoqIEBkZXByZWNhdGVkIFVzZSBgei5sdGUoKWAgaW5zdGVhZC4gKi9cclxuX2x0ZSBhcyBfbWF4LCB9O1xyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2d0KHZhbHVlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja0dyZWF0ZXJUaGFuKHtcclxuICAgICAgICBjaGVjazogXCJncmVhdGVyX3RoYW5cIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgICAgIHZhbHVlLFxyXG4gICAgICAgIGluY2x1c2l2ZTogZmFsc2UsXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2d0ZSh2YWx1ZSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tHcmVhdGVyVGhhbih7XHJcbiAgICAgICAgY2hlY2s6IFwiZ3JlYXRlcl90aGFuXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICB2YWx1ZSxcclxuICAgICAgICBpbmNsdXNpdmU6IHRydWUsXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgeyBcclxuLyoqIEBkZXByZWNhdGVkIFVzZSBgei5ndGUoKWAgaW5zdGVhZC4gKi9cclxuX2d0ZSBhcyBfbWluLCB9O1xyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3Bvc2l0aXZlKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIF9ndCgwLCBwYXJhbXMpO1xyXG59XHJcbi8vIG5lZ2F0aXZlXHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbmVnYXRpdmUocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gX2x0KDAsIHBhcmFtcyk7XHJcbn1cclxuLy8gbm9ucG9zaXRpdmVcclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9ub25wb3NpdGl2ZShwYXJhbXMpIHtcclxuICAgIHJldHVybiBfbHRlKDAsIHBhcmFtcyk7XHJcbn1cclxuLy8gbm9ubmVnYXRpdmVcclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9ub25uZWdhdGl2ZShwYXJhbXMpIHtcclxuICAgIHJldHVybiBfZ3RlKDAsIHBhcmFtcyk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9tdWx0aXBsZU9mKHZhbHVlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja011bHRpcGxlT2Yoe1xyXG4gICAgICAgIGNoZWNrOiBcIm11bHRpcGxlX29mXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICB2YWx1ZSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbWF4U2l6ZShtYXhpbXVtLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja01heFNpemUoe1xyXG4gICAgICAgIGNoZWNrOiBcIm1heF9zaXplXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICBtYXhpbXVtLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9taW5TaXplKG1pbmltdW0sIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrTWluU2l6ZSh7XHJcbiAgICAgICAgY2hlY2s6IFwibWluX3NpemVcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgICAgIG1pbmltdW0sXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3NpemUoc2l6ZSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tTaXplRXF1YWxzKHtcclxuICAgICAgICBjaGVjazogXCJzaXplX2VxdWFsc1wiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICAgICAgc2l6ZSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbWF4TGVuZ3RoKG1heGltdW0sIHBhcmFtcykge1xyXG4gICAgY29uc3QgY2ggPSBuZXcgY2hlY2tzLiRab2RDaGVja01heExlbmd0aCh7XHJcbiAgICAgICAgY2hlY2s6IFwibWF4X2xlbmd0aFwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICAgICAgbWF4aW11bSxcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNoO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbWluTGVuZ3RoKG1pbmltdW0sIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrTWluTGVuZ3RoKHtcclxuICAgICAgICBjaGVjazogXCJtaW5fbGVuZ3RoXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICBtaW5pbXVtLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9sZW5ndGgobGVuZ3RoLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja0xlbmd0aEVxdWFscyh7XHJcbiAgICAgICAgY2hlY2s6IFwibGVuZ3RoX2VxdWFsc1wiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICAgICAgbGVuZ3RoLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9yZWdleChwYXR0ZXJuLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja1JlZ2V4KHtcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgZm9ybWF0OiBcInJlZ2V4XCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICBwYXR0ZXJuLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9sb3dlcmNhc2UocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IGNoZWNrcy4kWm9kQ2hlY2tMb3dlckNhc2Uoe1xyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBmb3JtYXQ6IFwibG93ZXJjYXNlXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfdXBwZXJjYXNlKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrVXBwZXJDYXNlKHtcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgZm9ybWF0OiBcInVwcGVyY2FzZVwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2luY2x1ZGVzKGluY2x1ZGVzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgY2hlY2tzLiRab2RDaGVja0luY2x1ZGVzKHtcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgZm9ybWF0OiBcImluY2x1ZGVzXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICBpbmNsdWRlcyxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfc3RhcnRzV2l0aChwcmVmaXgsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrU3RhcnRzV2l0aCh7XHJcbiAgICAgICAgY2hlY2s6IFwic3RyaW5nX2Zvcm1hdFwiLFxyXG4gICAgICAgIGZvcm1hdDogXCJzdGFydHNfd2l0aFwiLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICAgICAgcHJlZml4LFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9lbmRzV2l0aChzdWZmaXgsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrRW5kc1dpdGgoe1xyXG4gICAgICAgIGNoZWNrOiBcInN0cmluZ19mb3JtYXRcIixcclxuICAgICAgICBmb3JtYXQ6IFwiZW5kc193aXRoXCIsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgICAgICBzdWZmaXgsXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3Byb3BlcnR5KHByb3BlcnR5LCBzY2hlbWEsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrUHJvcGVydHkoe1xyXG4gICAgICAgIGNoZWNrOiBcInByb3BlcnR5XCIsXHJcbiAgICAgICAgcHJvcGVydHksXHJcbiAgICAgICAgc2NoZW1hLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX21pbWUodHlwZXMsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrTWltZVR5cGUoe1xyXG4gICAgICAgIGNoZWNrOiBcIm1pbWVfdHlwZVwiLFxyXG4gICAgICAgIG1pbWU6IHR5cGVzLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX292ZXJ3cml0ZSh0eCkge1xyXG4gICAgcmV0dXJuIG5ldyBjaGVja3MuJFpvZENoZWNrT3ZlcndyaXRlKHtcclxuICAgICAgICBjaGVjazogXCJvdmVyd3JpdGVcIixcclxuICAgICAgICB0eCxcclxuICAgIH0pO1xyXG59XHJcbi8vIG5vcm1hbGl6ZVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX25vcm1hbGl6ZShmb3JtKSB7XHJcbiAgICByZXR1cm4gX292ZXJ3cml0ZSgoaW5wdXQpID0+IGlucHV0Lm5vcm1hbGl6ZShmb3JtKSk7XHJcbn1cclxuLy8gdHJpbVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3RyaW0oKSB7XHJcbiAgICByZXR1cm4gX292ZXJ3cml0ZSgoaW5wdXQpID0+IGlucHV0LnRyaW0oKSk7XHJcbn1cclxuLy8gdG9Mb3dlckNhc2VcclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF90b0xvd2VyQ2FzZSgpIHtcclxuICAgIHJldHVybiBfb3ZlcndyaXRlKChpbnB1dCkgPT4gaW5wdXQudG9Mb3dlckNhc2UoKSk7XHJcbn1cclxuLy8gdG9VcHBlckNhc2VcclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF90b1VwcGVyQ2FzZSgpIHtcclxuICAgIHJldHVybiBfb3ZlcndyaXRlKChpbnB1dCkgPT4gaW5wdXQudG9VcHBlckNhc2UoKSk7XHJcbn1cclxuLy8gc2x1Z2lmeVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3NsdWdpZnkoKSB7XHJcbiAgICByZXR1cm4gX292ZXJ3cml0ZSgoaW5wdXQpID0+IHV0aWwuc2x1Z2lmeShpbnB1dCkpO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfYXJyYXkoQ2xhc3MsIGVsZW1lbnQsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJhcnJheVwiLFxyXG4gICAgICAgIGVsZW1lbnQsXHJcbiAgICAgICAgLy8gZ2V0IGVsZW1lbnQoKSB7XHJcbiAgICAgICAgLy8gICByZXR1cm4gZWxlbWVudDtcclxuICAgICAgICAvLyB9LFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3VuaW9uKENsYXNzLCBvcHRpb25zLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwidW5pb25cIixcclxuICAgICAgICBvcHRpb25zLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gX3hvcihDbGFzcywgb3B0aW9ucywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInVuaW9uXCIsXHJcbiAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICBpbmNsdXNpdmU6IGZhbHNlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2Rpc2NyaW1pbmF0ZWRVbmlvbihDbGFzcywgZGlzY3JpbWluYXRvciwgb3B0aW9ucywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInVuaW9uXCIsXHJcbiAgICAgICAgb3B0aW9ucyxcclxuICAgICAgICBkaXNjcmltaW5hdG9yLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2ludGVyc2VjdGlvbihDbGFzcywgbGVmdCwgcmlnaHQpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwiaW50ZXJzZWN0aW9uXCIsXHJcbiAgICAgICAgbGVmdCxcclxuICAgICAgICByaWdodCxcclxuICAgIH0pO1xyXG59XHJcbi8vIGV4cG9ydCBmdW5jdGlvbiBfdHVwbGUoXHJcbi8vICAgQ2xhc3M6IHV0aWwuU2NoZW1hQ2xhc3M8c2NoZW1hcy4kWm9kVHVwbGU+LFxyXG4vLyAgIGl0ZW1zOiBbXSxcclxuLy8gICBwYXJhbXM/OiBzdHJpbmcgfCAkWm9kVHVwbGVQYXJhbXNcclxuLy8gKTogc2NoZW1hcy4kWm9kVHVwbGU8W10sIG51bGw+O1xyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3R1cGxlKENsYXNzLCBpdGVtcywgX3BhcmFtc09yUmVzdCwgX3BhcmFtcykge1xyXG4gICAgY29uc3QgaGFzUmVzdCA9IF9wYXJhbXNPclJlc3QgaW5zdGFuY2VvZiBzY2hlbWFzLiRab2RUeXBlO1xyXG4gICAgY29uc3QgcGFyYW1zID0gaGFzUmVzdCA/IF9wYXJhbXMgOiBfcGFyYW1zT3JSZXN0O1xyXG4gICAgY29uc3QgcmVzdCA9IGhhc1Jlc3QgPyBfcGFyYW1zT3JSZXN0IDogbnVsbDtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwidHVwbGVcIixcclxuICAgICAgICBpdGVtcyxcclxuICAgICAgICByZXN0LFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3JlY29yZChDbGFzcywga2V5VHlwZSwgdmFsdWVUeXBlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwicmVjb3JkXCIsXHJcbiAgICAgICAga2V5VHlwZSxcclxuICAgICAgICB2YWx1ZVR5cGUsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfbWFwKENsYXNzLCBrZXlUeXBlLCB2YWx1ZVR5cGUsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJtYXBcIixcclxuICAgICAgICBrZXlUeXBlLFxyXG4gICAgICAgIHZhbHVlVHlwZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9zZXQoQ2xhc3MsIHZhbHVlVHlwZSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInNldFwiLFxyXG4gICAgICAgIHZhbHVlVHlwZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9lbnVtKENsYXNzLCB2YWx1ZXMsIHBhcmFtcykge1xyXG4gICAgY29uc3QgZW50cmllcyA9IEFycmF5LmlzQXJyYXkodmFsdWVzKSA/IE9iamVjdC5mcm9tRW50cmllcyh2YWx1ZXMubWFwKCh2KSA9PiBbdiwgdl0pKSA6IHZhbHVlcztcclxuICAgIC8vIGlmIChBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcclxuICAgIC8vICAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHtcclxuICAgIC8vICAgICBlbnRyaWVzW3ZhbHVlXSA9IHZhbHVlO1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9IGVsc2Uge1xyXG4gICAgLy8gICBPYmplY3QuYXNzaWduKGVudHJpZXMsIHZhbHVlcyk7XHJcbiAgICAvLyB9XHJcbiAgICAvLyBjb25zdCBlbnRyaWVzOiB1dGlsLkVudW1MaWtlID0ge307XHJcbiAgICAvLyBmb3IgKGNvbnN0IHZhbCBvZiB2YWx1ZXMpIHtcclxuICAgIC8vICAgZW50cmllc1t2YWxdID0gdmFsO1xyXG4gICAgLy8gfVxyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJlbnVtXCIsXHJcbiAgICAgICAgZW50cmllcyxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuLyoqIEBkZXByZWNhdGVkIFRoaXMgQVBJIGhhcyBiZWVuIG1lcmdlZCBpbnRvIGB6LmVudW0oKWAuIFVzZSBgei5lbnVtKClgIGluc3RlYWQuXHJcbiAqXHJcbiAqIGBgYHRzXHJcbiAqIGVudW0gQ29sb3JzIHsgcmVkLCBncmVlbiwgYmx1ZSB9XHJcbiAqIHouZW51bShDb2xvcnMpO1xyXG4gKiBgYGBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfbmF0aXZlRW51bShDbGFzcywgZW50cmllcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcImVudW1cIixcclxuICAgICAgICBlbnRyaWVzLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2xpdGVyYWwoQ2xhc3MsIHZhbHVlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwibGl0ZXJhbFwiLFxyXG4gICAgICAgIHZhbHVlczogQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZV0sXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfZmlsZShDbGFzcywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcImZpbGVcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF90cmFuc2Zvcm0oQ2xhc3MsIGZuKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInRyYW5zZm9ybVwiLFxyXG4gICAgICAgIHRyYW5zZm9ybTogZm4sXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX29wdGlvbmFsKENsYXNzLCBpbm5lclR5cGUpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwib3B0aW9uYWxcIixcclxuICAgICAgICBpbm5lclR5cGUsXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX251bGxhYmxlKENsYXNzLCBpbm5lclR5cGUpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwibnVsbGFibGVcIixcclxuICAgICAgICBpbm5lclR5cGUsXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2RlZmF1bHQoQ2xhc3MsIGlubmVyVHlwZSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcImRlZmF1bHRcIixcclxuICAgICAgICBpbm5lclR5cGUsXHJcbiAgICAgICAgZ2V0IGRlZmF1bHRWYWx1ZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBkZWZhdWx0VmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGRlZmF1bHRWYWx1ZSgpIDogdXRpbC5zaGFsbG93Q2xvbmUoZGVmYXVsdFZhbHVlKTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9ub25vcHRpb25hbChDbGFzcywgaW5uZXJUeXBlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwibm9ub3B0aW9uYWxcIixcclxuICAgICAgICBpbm5lclR5cGUsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfc3VjY2VzcyhDbGFzcywgaW5uZXJUeXBlKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInN1Y2Nlc3NcIixcclxuICAgICAgICBpbm5lclR5cGUsXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2NhdGNoKENsYXNzLCBpbm5lclR5cGUsIGNhdGNoVmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwiY2F0Y2hcIixcclxuICAgICAgICBpbm5lclR5cGUsXHJcbiAgICAgICAgY2F0Y2hWYWx1ZTogKHR5cGVvZiBjYXRjaFZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBjYXRjaFZhbHVlIDogKCkgPT4gY2F0Y2hWYWx1ZSksXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX3BpcGUoQ2xhc3MsIGluXywgb3V0KSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInBpcGVcIixcclxuICAgICAgICBpbjogaW5fLFxyXG4gICAgICAgIG91dCxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfcmVhZG9ubHkoQ2xhc3MsIGlubmVyVHlwZSkge1xyXG4gICAgcmV0dXJuIG5ldyBDbGFzcyh7XHJcbiAgICAgICAgdHlwZTogXCJyZWFkb25seVwiLFxyXG4gICAgICAgIGlubmVyVHlwZSxcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfdGVtcGxhdGVMaXRlcmFsKENsYXNzLCBwYXJ0cywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInRlbXBsYXRlX2xpdGVyYWxcIixcclxuICAgICAgICBwYXJ0cyxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9sYXp5KENsYXNzLCBnZXR0ZXIpIHtcclxuICAgIHJldHVybiBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwibGF6eVwiLFxyXG4gICAgICAgIGdldHRlcixcclxuICAgIH0pO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfcHJvbWlzZShDbGFzcywgaW5uZXJUeXBlKSB7XHJcbiAgICByZXR1cm4gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcInByb21pc2VcIixcclxuICAgICAgICBpbm5lclR5cGUsXHJcbiAgICB9KTtcclxufVxyXG4vLyBAX19OT19TSURFX0VGRkVDVFNfX1xyXG5leHBvcnQgZnVuY3Rpb24gX2N1c3RvbShDbGFzcywgZm4sIF9wYXJhbXMpIHtcclxuICAgIGNvbnN0IG5vcm0gPSB1dGlsLm5vcm1hbGl6ZVBhcmFtcyhfcGFyYW1zKTtcclxuICAgIG5vcm0uYWJvcnQgPz8gKG5vcm0uYWJvcnQgPSB0cnVlKTsgLy8gZGVmYXVsdCB0byBhYm9ydDpmYWxzZVxyXG4gICAgY29uc3Qgc2NoZW1hID0gbmV3IENsYXNzKHtcclxuICAgICAgICB0eXBlOiBcImN1c3RvbVwiLFxyXG4gICAgICAgIGNoZWNrOiBcImN1c3RvbVwiLFxyXG4gICAgICAgIGZuOiBmbixcclxuICAgICAgICAuLi5ub3JtLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gc2NoZW1hO1xyXG59XHJcbi8vIHNhbWUgYXMgX2N1c3RvbSBidXQgZGVmYXVsdHMgdG8gYWJvcnQ6ZmFsc2VcclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9yZWZpbmUoQ2xhc3MsIGZuLCBfcGFyYW1zKSB7XHJcbiAgICBjb25zdCBzY2hlbWEgPSBuZXcgQ2xhc3Moe1xyXG4gICAgICAgIHR5cGU6IFwiY3VzdG9tXCIsXHJcbiAgICAgICAgY2hlY2s6IFwiY3VzdG9tXCIsXHJcbiAgICAgICAgZm46IGZuLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKF9wYXJhbXMpLFxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gc2NoZW1hO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfc3VwZXJSZWZpbmUoZm4sIHBhcmFtcykge1xyXG4gICAgY29uc3QgY2ggPSBfY2hlY2soKHBheWxvYWQpID0+IHtcclxuICAgICAgICBwYXlsb2FkLmFkZElzc3VlID0gKGlzc3VlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaXNzdWUgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2godXRpbC5pc3N1ZShpc3N1ZSwgcGF5bG9hZC52YWx1ZSwgY2guX3pvZC5kZWYpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIGZvciBab2QgMyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxyXG4gICAgICAgICAgICAgICAgY29uc3QgX2lzc3VlID0gaXNzdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAoX2lzc3VlLmZhdGFsKVxyXG4gICAgICAgICAgICAgICAgICAgIF9pc3N1ZS5jb250aW51ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgX2lzc3VlLmNvZGUgPz8gKF9pc3N1ZS5jb2RlID0gXCJjdXN0b21cIik7XHJcbiAgICAgICAgICAgICAgICBfaXNzdWUuaW5wdXQgPz8gKF9pc3N1ZS5pbnB1dCA9IHBheWxvYWQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgX2lzc3VlLmluc3QgPz8gKF9pc3N1ZS5pbnN0ID0gY2gpO1xyXG4gICAgICAgICAgICAgICAgX2lzc3VlLmNvbnRpbnVlID8/IChfaXNzdWUuY29udGludWUgPSAhY2guX3pvZC5kZWYuYWJvcnQpOyAvLyBhYm9ydCBpcyBhbHdheXMgdW5kZWZpbmVkLCBzbyB0aGlzIGlzIGFsd2F5cyB0cnVlLi4uXHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHV0aWwuaXNzdWUoX2lzc3VlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBmbihwYXlsb2FkLnZhbHVlLCBwYXlsb2FkKTtcclxuICAgIH0sIHBhcmFtcyk7XHJcbiAgICByZXR1cm4gY2g7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9jaGVjayhmbiwgcGFyYW1zKSB7XHJcbiAgICBjb25zdCBjaCA9IG5ldyBjaGVja3MuJFpvZENoZWNrKHtcclxuICAgICAgICBjaGVjazogXCJjdXN0b21cIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbiAgICBjaC5fem9kLmNoZWNrID0gZm47XHJcbiAgICByZXR1cm4gY2g7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIGRlc2NyaWJlKGRlc2NyaXB0aW9uKSB7XHJcbiAgICBjb25zdCBjaCA9IG5ldyBjaGVja3MuJFpvZENoZWNrKHsgY2hlY2s6IFwiZGVzY3JpYmVcIiB9KTtcclxuICAgIGNoLl96b2Qub25hdHRhY2ggPSBbXHJcbiAgICAgICAgKGluc3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSByZWdpc3RyaWVzLmdsb2JhbFJlZ2lzdHJ5LmdldChpbnN0KSA/PyB7fTtcclxuICAgICAgICAgICAgcmVnaXN0cmllcy5nbG9iYWxSZWdpc3RyeS5hZGQoaW5zdCwgeyAuLi5leGlzdGluZywgZGVzY3JpcHRpb24gfSk7XHJcbiAgICAgICAgfSxcclxuICAgIF07XHJcbiAgICBjaC5fem9kLmNoZWNrID0gKCkgPT4geyB9OyAvLyBuby1vcCBjaGVja1xyXG4gICAgcmV0dXJuIGNoO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBtZXRhKG1ldGFkYXRhKSB7XHJcbiAgICBjb25zdCBjaCA9IG5ldyBjaGVja3MuJFpvZENoZWNrKHsgY2hlY2s6IFwibWV0YVwiIH0pO1xyXG4gICAgY2guX3pvZC5vbmF0dGFjaCA9IFtcclxuICAgICAgICAoaW5zdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IHJlZ2lzdHJpZXMuZ2xvYmFsUmVnaXN0cnkuZ2V0KGluc3QpID8/IHt9O1xyXG4gICAgICAgICAgICByZWdpc3RyaWVzLmdsb2JhbFJlZ2lzdHJ5LmFkZChpbnN0LCB7IC4uLmV4aXN0aW5nLCAuLi5tZXRhZGF0YSB9KTtcclxuICAgICAgICB9LFxyXG4gICAgXTtcclxuICAgIGNoLl96b2QuY2hlY2sgPSAoKSA9PiB7IH07IC8vIG5vLW9wIGNoZWNrXHJcbiAgICByZXR1cm4gY2g7XHJcbn1cclxuLy8gQF9fTk9fU0lERV9FRkZFQ1RTX19cclxuZXhwb3J0IGZ1bmN0aW9uIF9zdHJpbmdib29sKENsYXNzZXMsIF9wYXJhbXMpIHtcclxuICAgIGNvbnN0IHBhcmFtcyA9IHV0aWwubm9ybWFsaXplUGFyYW1zKF9wYXJhbXMpO1xyXG4gICAgbGV0IHRydXRoeUFycmF5ID0gcGFyYW1zLnRydXRoeSA/PyBbXCJ0cnVlXCIsIFwiMVwiLCBcInllc1wiLCBcIm9uXCIsIFwieVwiLCBcImVuYWJsZWRcIl07XHJcbiAgICBsZXQgZmFsc3lBcnJheSA9IHBhcmFtcy5mYWxzeSA/PyBbXCJmYWxzZVwiLCBcIjBcIiwgXCJub1wiLCBcIm9mZlwiLCBcIm5cIiwgXCJkaXNhYmxlZFwiXTtcclxuICAgIGlmIChwYXJhbXMuY2FzZSAhPT0gXCJzZW5zaXRpdmVcIikge1xyXG4gICAgICAgIHRydXRoeUFycmF5ID0gdHJ1dGh5QXJyYXkubWFwKCh2KSA9PiAodHlwZW9mIHYgPT09IFwic3RyaW5nXCIgPyB2LnRvTG93ZXJDYXNlKCkgOiB2KSk7XHJcbiAgICAgICAgZmFsc3lBcnJheSA9IGZhbHN5QXJyYXkubWFwKCh2KSA9PiAodHlwZW9mIHYgPT09IFwic3RyaW5nXCIgPyB2LnRvTG93ZXJDYXNlKCkgOiB2KSk7XHJcbiAgICB9XHJcbiAgICBjb25zdCB0cnV0aHlTZXQgPSBuZXcgU2V0KHRydXRoeUFycmF5KTtcclxuICAgIGNvbnN0IGZhbHN5U2V0ID0gbmV3IFNldChmYWxzeUFycmF5KTtcclxuICAgIGNvbnN0IF9Db2RlYyA9IENsYXNzZXMuQ29kZWMgPz8gc2NoZW1hcy4kWm9kQ29kZWM7XHJcbiAgICBjb25zdCBfQm9vbGVhbiA9IENsYXNzZXMuQm9vbGVhbiA/PyBzY2hlbWFzLiRab2RCb29sZWFuO1xyXG4gICAgY29uc3QgX1N0cmluZyA9IENsYXNzZXMuU3RyaW5nID8/IHNjaGVtYXMuJFpvZFN0cmluZztcclxuICAgIGNvbnN0IHN0cmluZ1NjaGVtYSA9IG5ldyBfU3RyaW5nKHsgdHlwZTogXCJzdHJpbmdcIiwgZXJyb3I6IHBhcmFtcy5lcnJvciB9KTtcclxuICAgIGNvbnN0IGJvb2xlYW5TY2hlbWEgPSBuZXcgX0Jvb2xlYW4oeyB0eXBlOiBcImJvb2xlYW5cIiwgZXJyb3I6IHBhcmFtcy5lcnJvciB9KTtcclxuICAgIGNvbnN0IGNvZGVjID0gbmV3IF9Db2RlYyh7XHJcbiAgICAgICAgdHlwZTogXCJwaXBlXCIsXHJcbiAgICAgICAgaW46IHN0cmluZ1NjaGVtYSxcclxuICAgICAgICBvdXQ6IGJvb2xlYW5TY2hlbWEsXHJcbiAgICAgICAgdHJhbnNmb3JtOiAoKGlucHV0LCBwYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gaW5wdXQ7XHJcbiAgICAgICAgICAgIGlmIChwYXJhbXMuY2FzZSAhPT0gXCJzZW5zaXRpdmVcIilcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGlmICh0cnV0aHlTZXQuaGFzKGRhdGEpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChmYWxzeVNldC5oYXMoZGF0YSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF92YWx1ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBcInN0cmluZ2Jvb2xcIixcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IFsuLi50cnV0aHlTZXQsIC4uLmZhbHN5U2V0XSxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICBpbnN0OiBjb2RlYyxcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm06ICgoaW5wdXQsIF9wYXlsb2FkKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChpbnB1dCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydXRoeUFycmF5WzBdIHx8IFwidHJ1ZVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHN5QXJyYXlbMF0gfHwgXCJmYWxzZVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgZXJyb3I6IHBhcmFtcy5lcnJvcixcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGNvZGVjO1xyXG59XHJcbi8vIEBfX05PX1NJREVfRUZGRUNUU19fXHJcbmV4cG9ydCBmdW5jdGlvbiBfc3RyaW5nRm9ybWF0KENsYXNzLCBmb3JtYXQsIGZuT3JSZWdleCwgX3BhcmFtcyA9IHt9KSB7XHJcbiAgICBjb25zdCBwYXJhbXMgPSB1dGlsLm5vcm1hbGl6ZVBhcmFtcyhfcGFyYW1zKTtcclxuICAgIGNvbnN0IGRlZiA9IHtcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhfcGFyYW1zKSxcclxuICAgICAgICBjaGVjazogXCJzdHJpbmdfZm9ybWF0XCIsXHJcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcclxuICAgICAgICBmb3JtYXQsXHJcbiAgICAgICAgZm46IHR5cGVvZiBmbk9yUmVnZXggPT09IFwiZnVuY3Rpb25cIiA/IGZuT3JSZWdleCA6ICh2YWwpID0+IGZuT3JSZWdleC50ZXN0KHZhbCksXHJcbiAgICAgICAgLi4ucGFyYW1zLFxyXG4gICAgfTtcclxuICAgIGlmIChmbk9yUmVnZXggaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuICAgICAgICBkZWYucGF0dGVybiA9IGZuT3JSZWdleDtcclxuICAgIH1cclxuICAgIGNvbnN0IGluc3QgPSBuZXcgQ2xhc3MoZGVmKTtcclxuICAgIHJldHVybiBpbnN0O1xyXG59XHJcbiIsImltcG9ydCB7IGdsb2JhbFJlZ2lzdHJ5IH0gZnJvbSBcIi4vcmVnaXN0cmllcy5qc1wiO1xyXG4vLyBmdW5jdGlvbiBpbml0aWFsaXplQ29udGV4dDxUIGV4dGVuZHMgc2NoZW1hcy4kWm9kVHlwZT4oaW5wdXRzOiBKU09OU2NoZW1hR2VuZXJhdG9yUGFyYW1zPFQ+KTogVG9KU09OU2NoZW1hQ29udGV4dDxUPiB7XHJcbi8vICAgcmV0dXJuIHtcclxuLy8gICAgIHByb2Nlc3NvcjogaW5wdXRzLnByb2Nlc3NvcixcclxuLy8gICAgIG1ldGFkYXRhUmVnaXN0cnk6IGlucHV0cy5tZXRhZGF0YSA/PyBnbG9iYWxSZWdpc3RyeSxcclxuLy8gICAgIHRhcmdldDogaW5wdXRzLnRhcmdldCA/PyBcImRyYWZ0LTIwMjAtMTJcIixcclxuLy8gICAgIHVucmVwcmVzZW50YWJsZTogaW5wdXRzLnVucmVwcmVzZW50YWJsZSA/PyBcInRocm93XCIsXHJcbi8vICAgfTtcclxuLy8gfVxyXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZUNvbnRleHQocGFyYW1zKSB7XHJcbiAgICAvLyBOb3JtYWxpemUgdGFyZ2V0OiBjb252ZXJ0IG9sZCBub24taHlwaGVuYXRlZCB2ZXJzaW9ucyB0byBoeXBoZW5hdGVkIHZlcnNpb25zXHJcbiAgICBsZXQgdGFyZ2V0ID0gcGFyYW1zPy50YXJnZXQgPz8gXCJkcmFmdC0yMDIwLTEyXCI7XHJcbiAgICBpZiAodGFyZ2V0ID09PSBcImRyYWZ0LTRcIilcclxuICAgICAgICB0YXJnZXQgPSBcImRyYWZ0LTA0XCI7XHJcbiAgICBpZiAodGFyZ2V0ID09PSBcImRyYWZ0LTdcIilcclxuICAgICAgICB0YXJnZXQgPSBcImRyYWZ0LTA3XCI7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHByb2Nlc3NvcnM6IHBhcmFtcy5wcm9jZXNzb3JzID8/IHt9LFxyXG4gICAgICAgIG1ldGFkYXRhUmVnaXN0cnk6IHBhcmFtcz8ubWV0YWRhdGEgPz8gZ2xvYmFsUmVnaXN0cnksXHJcbiAgICAgICAgdGFyZ2V0LFxyXG4gICAgICAgIHVucmVwcmVzZW50YWJsZTogcGFyYW1zPy51bnJlcHJlc2VudGFibGUgPz8gXCJ0aHJvd1wiLFxyXG4gICAgICAgIG92ZXJyaWRlOiBwYXJhbXM/Lm92ZXJyaWRlID8/ICgoKSA9PiB7IH0pLFxyXG4gICAgICAgIGlvOiBwYXJhbXM/LmlvID8/IFwib3V0cHV0XCIsXHJcbiAgICAgICAgY291bnRlcjogMCxcclxuICAgICAgICBzZWVuOiBuZXcgTWFwKCksXHJcbiAgICAgICAgY3ljbGVzOiBwYXJhbXM/LmN5Y2xlcyA/PyBcInJlZlwiLFxyXG4gICAgICAgIHJldXNlZDogcGFyYW1zPy5yZXVzZWQgPz8gXCJpbmxpbmVcIixcclxuICAgICAgICBleHRlcm5hbDogcGFyYW1zPy5leHRlcm5hbCA/PyB1bmRlZmluZWQsXHJcbiAgICB9O1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzKHNjaGVtYSwgY3R4LCBfcGFyYW1zID0geyBwYXRoOiBbXSwgc2NoZW1hUGF0aDogW10gfSkge1xyXG4gICAgdmFyIF9hO1xyXG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAgLy8gY2hlY2sgZm9yIHNjaGVtYSBpbiBzZWVuc1xyXG4gICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xyXG4gICAgaWYgKHNlZW4pIHtcclxuICAgICAgICBzZWVuLmNvdW50Kys7XHJcbiAgICAgICAgLy8gY2hlY2sgaWYgY3ljbGVcclxuICAgICAgICBjb25zdCBpc0N5Y2xlID0gX3BhcmFtcy5zY2hlbWFQYXRoLmluY2x1ZGVzKHNjaGVtYSk7XHJcbiAgICAgICAgaWYgKGlzQ3ljbGUpIHtcclxuICAgICAgICAgICAgc2Vlbi5jeWNsZSA9IF9wYXJhbXMucGF0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNlZW4uc2NoZW1hO1xyXG4gICAgfVxyXG4gICAgLy8gaW5pdGlhbGl6ZVxyXG4gICAgY29uc3QgcmVzdWx0ID0geyBzY2hlbWE6IHt9LCBjb3VudDogMSwgY3ljbGU6IHVuZGVmaW5lZCwgcGF0aDogX3BhcmFtcy5wYXRoIH07XHJcbiAgICBjdHguc2Vlbi5zZXQoc2NoZW1hLCByZXN1bHQpO1xyXG4gICAgLy8gY3VzdG9tIG1ldGhvZCBvdmVycmlkZXMgZGVmYXVsdCBiZWhhdmlvclxyXG4gICAgY29uc3Qgb3ZlcnJpZGVTY2hlbWEgPSBzY2hlbWEuX3pvZC50b0pTT05TY2hlbWE/LigpO1xyXG4gICAgaWYgKG92ZXJyaWRlU2NoZW1hKSB7XHJcbiAgICAgICAgcmVzdWx0LnNjaGVtYSA9IG92ZXJyaWRlU2NoZW1hO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgY29uc3QgcGFyYW1zID0ge1xyXG4gICAgICAgICAgICAuLi5fcGFyYW1zLFxyXG4gICAgICAgICAgICBzY2hlbWFQYXRoOiBbLi4uX3BhcmFtcy5zY2hlbWFQYXRoLCBzY2hlbWFdLFxyXG4gICAgICAgICAgICBwYXRoOiBfcGFyYW1zLnBhdGgsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoc2NoZW1hLl96b2QucHJvY2Vzc0pTT05TY2hlbWEpIHtcclxuICAgICAgICAgICAgc2NoZW1hLl96b2QucHJvY2Vzc0pTT05TY2hlbWEoY3R4LCByZXN1bHQuc2NoZW1hLCBwYXJhbXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgX2pzb24gPSByZXN1bHQuc2NoZW1hO1xyXG4gICAgICAgICAgICBjb25zdCBwcm9jZXNzb3IgPSBjdHgucHJvY2Vzc29yc1tkZWYudHlwZV07XHJcbiAgICAgICAgICAgIGlmICghcHJvY2Vzc29yKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFt0b0pTT05TY2hlbWFdOiBOb24tcmVwcmVzZW50YWJsZSB0eXBlIGVuY291bnRlcmVkOiAke2RlZi50eXBlfWApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHByb2Nlc3NvcihzY2hlbWEsIGN0eCwgX2pzb24sIHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHNjaGVtYS5fem9kLnBhcmVudDtcclxuICAgICAgICBpZiAocGFyZW50KSB7XHJcbiAgICAgICAgICAgIC8vIEFsc28gc2V0IHJlZiBpZiBwcm9jZXNzb3IgZGlkbid0IChmb3IgaW5oZXJpdGFuY2UpXHJcbiAgICAgICAgICAgIGlmICghcmVzdWx0LnJlZilcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5yZWYgPSBwYXJlbnQ7XHJcbiAgICAgICAgICAgIHByb2Nlc3MocGFyZW50LCBjdHgsIHBhcmFtcyk7XHJcbiAgICAgICAgICAgIGN0eC5zZWVuLmdldChwYXJlbnQpLmlzUGFyZW50ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBtZXRhZGF0YVxyXG4gICAgY29uc3QgbWV0YSA9IGN0eC5tZXRhZGF0YVJlZ2lzdHJ5LmdldChzY2hlbWEpO1xyXG4gICAgaWYgKG1ldGEpXHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihyZXN1bHQuc2NoZW1hLCBtZXRhKTtcclxuICAgIGlmIChjdHguaW8gPT09IFwiaW5wdXRcIiAmJiBpc1RyYW5zZm9ybWluZyhzY2hlbWEpKSB7XHJcbiAgICAgICAgLy8gZXhhbXBsZXMvZGVmYXVsdHMgb25seSBhcHBseSB0byBvdXRwdXQgdHlwZSBvZiBwaXBlXHJcbiAgICAgICAgZGVsZXRlIHJlc3VsdC5zY2hlbWEuZXhhbXBsZXM7XHJcbiAgICAgICAgZGVsZXRlIHJlc3VsdC5zY2hlbWEuZGVmYXVsdDtcclxuICAgIH1cclxuICAgIC8vIHNldCBwcmVmYXVsdCBhcyBkZWZhdWx0XHJcbiAgICBpZiAoY3R4LmlvID09PSBcImlucHV0XCIgJiYgXCJfcHJlZmF1bHRcIiBpbiByZXN1bHQuc2NoZW1hKVxyXG4gICAgICAgIChfYSA9IHJlc3VsdC5zY2hlbWEpLmRlZmF1bHQgPz8gKF9hLmRlZmF1bHQgPSByZXN1bHQuc2NoZW1hLl9wcmVmYXVsdCk7XHJcbiAgICBkZWxldGUgcmVzdWx0LnNjaGVtYS5fcHJlZmF1bHQ7XHJcbiAgICAvLyBwdWxsaW5nIGZyZXNoIGZyb20gY3R4LnNlZW4gaW4gY2FzZSBpdCB3YXMgb3ZlcndyaXR0ZW5cclxuICAgIGNvbnN0IF9yZXN1bHQgPSBjdHguc2Vlbi5nZXQoc2NoZW1hKTtcclxuICAgIHJldHVybiBfcmVzdWx0LnNjaGVtYTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdERlZnMoY3R4LCBzY2hlbWFcclxuLy8gcGFyYW1zOiBFbWl0UGFyYW1zXHJcbikge1xyXG4gICAgLy8gaXRlcmF0ZSBvdmVyIHNlZW4gbWFwO1xyXG4gICAgY29uc3Qgcm9vdCA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xyXG4gICAgaWYgKCFyb290KVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVucHJvY2Vzc2VkIHNjaGVtYS4gVGhpcyBpcyBhIGJ1ZyBpbiBab2QuXCIpO1xyXG4gICAgLy8gVHJhY2sgaWRzIHRvIGRldGVjdCBkdXBsaWNhdGVzIGFjcm9zcyBkaWZmZXJlbnQgc2NoZW1hc1xyXG4gICAgY29uc3QgaWRUb1NjaGVtYSA9IG5ldyBNYXAoKTtcclxuICAgIGZvciAoY29uc3QgZW50cnkgb2YgY3R4LnNlZW4uZW50cmllcygpKSB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBjdHgubWV0YWRhdGFSZWdpc3RyeS5nZXQoZW50cnlbMF0pPy5pZDtcclxuICAgICAgICBpZiAoaWQpIHtcclxuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBpZFRvU2NoZW1hLmdldChpZCk7XHJcbiAgICAgICAgICAgIGlmIChleGlzdGluZyAmJiBleGlzdGluZyAhPT0gZW50cnlbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRHVwbGljYXRlIHNjaGVtYSBpZCBcIiR7aWR9XCIgZGV0ZWN0ZWQgZHVyaW5nIEpTT04gU2NoZW1hIGNvbnZlcnNpb24uIFR3byBkaWZmZXJlbnQgc2NoZW1hcyBjYW5ub3Qgc2hhcmUgdGhlIHNhbWUgaWQgd2hlbiBjb252ZXJ0ZWQgdG9nZXRoZXIuYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWRUb1NjaGVtYS5zZXQoaWQsIGVudHJ5WzBdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyByZXR1cm5zIGEgcmVmIHRvIHRoZSBzY2hlbWFcclxuICAgIC8vIGRlZklkIHdpbGwgYmUgZW1wdHkgaWYgdGhlIHJlZiBwb2ludHMgdG8gYW4gZXh0ZXJuYWwgc2NoZW1hIChvciAjKVxyXG4gICAgY29uc3QgbWFrZVVSSSA9IChlbnRyeSkgPT4ge1xyXG4gICAgICAgIC8vIGNvbXBhcmluZyB0aGUgc2VlbiBvYmplY3RzIGJlY2F1c2Ugc29tZXRpbWVzXHJcbiAgICAgICAgLy8gbXVsdGlwbGUgc2NoZW1hcyBtYXAgdG8gdGhlIHNhbWUgc2VlbiBvYmplY3QuXHJcbiAgICAgICAgLy8gZS5nLiBsYXp5XHJcbiAgICAgICAgLy8gZXh0ZXJuYWwgaXMgY29uZmlndXJlZFxyXG4gICAgICAgIGNvbnN0IGRlZnNTZWdtZW50ID0gY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0yMDIwLTEyXCIgPyBcIiRkZWZzXCIgOiBcImRlZmluaXRpb25zXCI7XHJcbiAgICAgICAgaWYgKGN0eC5leHRlcm5hbCkge1xyXG4gICAgICAgICAgICBjb25zdCBleHRlcm5hbElkID0gY3R4LmV4dGVybmFsLnJlZ2lzdHJ5LmdldChlbnRyeVswXSk/LmlkOyAvLyA/PyBcIl9fc2hhcmVkXCI7Ly8gYF9fc2NoZW1hJHtjdHguY291bnRlcisrfWA7XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIHNjaGVtYSBpcyBpbiB0aGUgZXh0ZXJuYWwgcmVnaXN0cnlcclxuICAgICAgICAgICAgY29uc3QgdXJpR2VuZXJhdG9yID0gY3R4LmV4dGVybmFsLnVyaSA/PyAoKGlkKSA9PiBpZCk7XHJcbiAgICAgICAgICAgIGlmIChleHRlcm5hbElkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyByZWY6IHVyaUdlbmVyYXRvcihleHRlcm5hbElkKSB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgYWRkIHRvIF9fc2hhcmVkXHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gZW50cnlbMV0uZGVmSWQgPz8gZW50cnlbMV0uc2NoZW1hLmlkID8/IGBzY2hlbWEke2N0eC5jb3VudGVyKyt9YDtcclxuICAgICAgICAgICAgZW50cnlbMV0uZGVmSWQgPSBpZDsgLy8gc2V0IGRlZklkIHNvIGl0IHdpbGwgYmUgcmV1c2VkIGlmIG5lZWRlZFxyXG4gICAgICAgICAgICByZXR1cm4geyBkZWZJZDogaWQsIHJlZjogYCR7dXJpR2VuZXJhdG9yKFwiX19zaGFyZWRcIil9Iy8ke2RlZnNTZWdtZW50fS8ke2lkfWAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGVudHJ5WzFdID09PSByb290KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHJlZjogXCIjXCIgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc2VsZi1jb250YWluZWQgc2NoZW1hXHJcbiAgICAgICAgY29uc3QgdXJpUHJlZml4ID0gYCNgO1xyXG4gICAgICAgIGNvbnN0IGRlZlVyaVByZWZpeCA9IGAke3VyaVByZWZpeH0vJHtkZWZzU2VnbWVudH0vYDtcclxuICAgICAgICBjb25zdCBkZWZJZCA9IGVudHJ5WzFdLnNjaGVtYS5pZCA/PyBgX19zY2hlbWEke2N0eC5jb3VudGVyKyt9YDtcclxuICAgICAgICByZXR1cm4geyBkZWZJZCwgcmVmOiBkZWZVcmlQcmVmaXggKyBkZWZJZCB9O1xyXG4gICAgfTtcclxuICAgIC8vIHN0b3JlZCBjYWNoZWQgdmVyc2lvbiBpbiBgZGVmYCBwcm9wZXJ0eVxyXG4gICAgLy8gcmVtb3ZlIGFsbCBwcm9wZXJ0aWVzLCBzZXQgJHJlZlxyXG4gICAgY29uc3QgZXh0cmFjdFRvRGVmID0gKGVudHJ5KSA9PiB7XHJcbiAgICAgICAgLy8gaWYgdGhlIHNjaGVtYSBpcyBhbHJlYWR5IGEgcmVmZXJlbmNlLCBkbyBub3QgZXh0cmFjdCBpdFxyXG4gICAgICAgIGlmIChlbnRyeVsxXS5zY2hlbWEuJHJlZikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHNlZW4gPSBlbnRyeVsxXTtcclxuICAgICAgICBjb25zdCB7IHJlZiwgZGVmSWQgfSA9IG1ha2VVUkkoZW50cnkpO1xyXG4gICAgICAgIHNlZW4uZGVmID0geyAuLi5zZWVuLnNjaGVtYSB9O1xyXG4gICAgICAgIC8vIGRlZklkIHdvbid0IGJlIHNldCBpZiB0aGUgc2NoZW1hIGlzIGEgcmVmZXJlbmNlIHRvIGFuIGV4dGVybmFsIHNjaGVtYVxyXG4gICAgICAgIC8vIG9yIGlmIHRoZSBzY2hlbWEgaXMgdGhlIHJvb3Qgc2NoZW1hXHJcbiAgICAgICAgaWYgKGRlZklkKVxyXG4gICAgICAgICAgICBzZWVuLmRlZklkID0gZGVmSWQ7XHJcbiAgICAgICAgLy8gd2lwZSBhd2F5IGFsbCBwcm9wZXJ0aWVzIGV4Y2VwdCAkcmVmXHJcbiAgICAgICAgY29uc3Qgc2NoZW1hID0gc2Vlbi5zY2hlbWE7XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc2NoZW1hKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBzY2hlbWFba2V5XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2NoZW1hLiRyZWYgPSByZWY7XHJcbiAgICB9O1xyXG4gICAgLy8gdGhyb3cgb24gY3ljbGVzXHJcbiAgICAvLyBicmVhayBjeWNsZXNcclxuICAgIGlmIChjdHguY3ljbGVzID09PSBcInRocm93XCIpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGN0eC5zZWVuLmVudHJpZXMoKSkge1xyXG4gICAgICAgICAgICBjb25zdCBzZWVuID0gZW50cnlbMV07XHJcbiAgICAgICAgICAgIGlmIChzZWVuLmN5Y2xlKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDeWNsZSBkZXRlY3RlZDogXCIgK1xyXG4gICAgICAgICAgICAgICAgICAgIGAjLyR7c2Vlbi5jeWNsZT8uam9pbihcIi9cIil9Lzxyb290PmAgK1xyXG4gICAgICAgICAgICAgICAgICAgICdcXG5cXG5TZXQgdGhlIGBjeWNsZXNgIHBhcmFtZXRlciB0byBgXCJyZWZcImAgdG8gcmVzb2x2ZSBjeWNsaWNhbCBzY2hlbWFzIHdpdGggZGVmcy4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIGV4dHJhY3Qgc2NoZW1hcyBpbnRvICRkZWZzXHJcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGN0eC5zZWVuLmVudHJpZXMoKSkge1xyXG4gICAgICAgIGNvbnN0IHNlZW4gPSBlbnRyeVsxXTtcclxuICAgICAgICAvLyBjb252ZXJ0IHJvb3Qgc2NoZW1hIHRvICMgJHJlZlxyXG4gICAgICAgIGlmIChzY2hlbWEgPT09IGVudHJ5WzBdKSB7XHJcbiAgICAgICAgICAgIGV4dHJhY3RUb0RlZihlbnRyeSk7IC8vIHRoaXMgaGFzIHNwZWNpYWwgaGFuZGxpbmcgZm9yIHRoZSByb290IHNjaGVtYVxyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZXh0cmFjdCBzY2hlbWFzIHRoYXQgYXJlIGluIHRoZSBleHRlcm5hbCByZWdpc3RyeVxyXG4gICAgICAgIGlmIChjdHguZXh0ZXJuYWwpIHtcclxuICAgICAgICAgICAgY29uc3QgZXh0ID0gY3R4LmV4dGVybmFsLnJlZ2lzdHJ5LmdldChlbnRyeVswXSk/LmlkO1xyXG4gICAgICAgICAgICBpZiAoc2NoZW1hICE9PSBlbnRyeVswXSAmJiBleHQpIHtcclxuICAgICAgICAgICAgICAgIGV4dHJhY3RUb0RlZihlbnRyeSk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBleHRyYWN0IHNjaGVtYXMgd2l0aCBgaWRgIG1ldGFcclxuICAgICAgICBjb25zdCBpZCA9IGN0eC5tZXRhZGF0YVJlZ2lzdHJ5LmdldChlbnRyeVswXSk/LmlkO1xyXG4gICAgICAgIGlmIChpZCkge1xyXG4gICAgICAgICAgICBleHRyYWN0VG9EZWYoZW50cnkpO1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gYnJlYWsgY3ljbGVzXHJcbiAgICAgICAgaWYgKHNlZW4uY3ljbGUpIHtcclxuICAgICAgICAgICAgLy8gYW55XHJcbiAgICAgICAgICAgIGV4dHJhY3RUb0RlZihlbnRyeSk7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBleHRyYWN0IHJldXNlZCBzY2hlbWFzXHJcbiAgICAgICAgaWYgKHNlZW4uY291bnQgPiAxKSB7XHJcbiAgICAgICAgICAgIGlmIChjdHgucmV1c2VkID09PSBcInJlZlwiKSB7XHJcbiAgICAgICAgICAgICAgICBleHRyYWN0VG9EZWYoZW50cnkpO1xyXG4gICAgICAgICAgICAgICAgLy8gYmlvbWUtaWdub3JlIGxpbnQ6XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZmluYWxpemUoY3R4LCBzY2hlbWEpIHtcclxuICAgIGNvbnN0IHJvb3QgPSBjdHguc2Vlbi5nZXQoc2NoZW1hKTtcclxuICAgIGlmICghcm9vdClcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbnByb2Nlc3NlZCBzY2hlbWEuIFRoaXMgaXMgYSBidWcgaW4gWm9kLlwiKTtcclxuICAgIC8vIGZsYXR0ZW4gcmVmcyAtIGluaGVyaXQgcHJvcGVydGllcyBmcm9tIHBhcmVudCBzY2hlbWFzXHJcbiAgICBjb25zdCBmbGF0dGVuUmVmID0gKHpvZFNjaGVtYSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNlZW4gPSBjdHguc2Vlbi5nZXQoem9kU2NoZW1hKTtcclxuICAgICAgICAvLyBhbHJlYWR5IHByb2Nlc3NlZFxyXG4gICAgICAgIGlmIChzZWVuLnJlZiA9PT0gbnVsbClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHNjaGVtYSA9IHNlZW4uZGVmID8/IHNlZW4uc2NoZW1hO1xyXG4gICAgICAgIGNvbnN0IF9jYWNoZWQgPSB7IC4uLnNjaGVtYSB9O1xyXG4gICAgICAgIGNvbnN0IHJlZiA9IHNlZW4ucmVmO1xyXG4gICAgICAgIHNlZW4ucmVmID0gbnVsbDsgLy8gcHJldmVudCBpbmZpbml0ZSByZWN1cnNpb25cclxuICAgICAgICBpZiAocmVmKSB7XHJcbiAgICAgICAgICAgIGZsYXR0ZW5SZWYocmVmKTtcclxuICAgICAgICAgICAgY29uc3QgcmVmU2VlbiA9IGN0eC5zZWVuLmdldChyZWYpO1xyXG4gICAgICAgICAgICBjb25zdCByZWZTY2hlbWEgPSByZWZTZWVuLnNjaGVtYTtcclxuICAgICAgICAgICAgLy8gbWVyZ2UgcmVmZXJlbmNlZCBzY2hlbWEgaW50byBjdXJyZW50XHJcbiAgICAgICAgICAgIGlmIChyZWZTY2hlbWEuJHJlZiAmJiAoY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0wN1wiIHx8IGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMDRcIiB8fCBjdHgudGFyZ2V0ID09PSBcIm9wZW5hcGktMy4wXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBvbGRlciBkcmFmdHMgY2FuJ3QgY29tYmluZSAkcmVmIHdpdGggb3RoZXIgcHJvcGVydGllc1xyXG4gICAgICAgICAgICAgICAgc2NoZW1hLmFsbE9mID0gc2NoZW1hLmFsbE9mID8/IFtdO1xyXG4gICAgICAgICAgICAgICAgc2NoZW1hLmFsbE9mLnB1c2gocmVmU2NoZW1hKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oc2NoZW1hLCByZWZTY2hlbWEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHJlc3RvcmUgY2hpbGQncyBvd24gcHJvcGVydGllcyAoY2hpbGQgd2lucylcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihzY2hlbWEsIF9jYWNoZWQpO1xyXG4gICAgICAgICAgICBjb25zdCBpc1BhcmVudFJlZiA9IHpvZFNjaGVtYS5fem9kLnBhcmVudCA9PT0gcmVmO1xyXG4gICAgICAgICAgICAvLyBGb3IgcGFyZW50IGNoYWluLCBjaGlsZCBpcyBhIHJlZmluZW1lbnQgLSByZW1vdmUgcGFyZW50LW9ubHkgcHJvcGVydGllc1xyXG4gICAgICAgICAgICBpZiAoaXNQYXJlbnRSZWYpIHtcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNjaGVtYSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IFwiJHJlZlwiIHx8IGtleSA9PT0gXCJhbGxPZlwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gX2NhY2hlZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHNjaGVtYVtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBXaGVuIHJlZiB3YXMgZXh0cmFjdGVkIHRvICRkZWZzLCByZW1vdmUgcHJvcGVydGllcyB0aGF0IG1hdGNoIHRoZSBkZWZpbml0aW9uXHJcbiAgICAgICAgICAgIGlmIChyZWZTY2hlbWEuJHJlZiAmJiByZWZTZWVuLmRlZikge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc2NoZW1hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gXCIkcmVmXCIgfHwga2V5ID09PSBcImFsbE9mXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgaW4gcmVmU2Vlbi5kZWYgJiYgSlNPTi5zdHJpbmdpZnkoc2NoZW1hW2tleV0pID09PSBKU09OLnN0cmluZ2lmeShyZWZTZWVuLmRlZltrZXldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgc2NoZW1hW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIElmIHBhcmVudCB3YXMgZXh0cmFjdGVkIChoYXMgJHJlZiksIHByb3BhZ2F0ZSAkcmVmIHRvIHRoaXMgc2NoZW1hXHJcbiAgICAgICAgLy8gVGhpcyBoYW5kbGVzIGNhc2VzIGxpa2U6IHJlYWRvbmx5KCkubWV0YSh7aWR9KS5kZXNjcmliZSgpXHJcbiAgICAgICAgLy8gd2hlcmUgcHJvY2Vzc29yIHNldHMgcmVmIHRvIGlubmVyVHlwZSBidXQgcGFyZW50IHNob3VsZCBiZSByZWZlcmVuY2VkXHJcbiAgICAgICAgY29uc3QgcGFyZW50ID0gem9kU2NoZW1hLl96b2QucGFyZW50O1xyXG4gICAgICAgIGlmIChwYXJlbnQgJiYgcGFyZW50ICE9PSByZWYpIHtcclxuICAgICAgICAgICAgLy8gRW5zdXJlIHBhcmVudCBpcyBwcm9jZXNzZWQgZmlyc3Qgc28gaXRzIGRlZiBoYXMgaW5oZXJpdGVkIHByb3BlcnRpZXNcclxuICAgICAgICAgICAgZmxhdHRlblJlZihwYXJlbnQpO1xyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnRTZWVuID0gY3R4LnNlZW4uZ2V0KHBhcmVudCk7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnRTZWVuPy5zY2hlbWEuJHJlZikge1xyXG4gICAgICAgICAgICAgICAgc2NoZW1hLiRyZWYgPSBwYXJlbnRTZWVuLnNjaGVtYS4kcmVmO1xyXG4gICAgICAgICAgICAgICAgLy8gRGUtZHVwbGljYXRlIHdpdGggcGFyZW50J3MgZGVmaW5pdGlvblxyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudFNlZW4uZGVmKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gc2NoZW1hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IFwiJHJlZlwiIHx8IGtleSA9PT0gXCJhbGxPZlwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChrZXkgaW4gcGFyZW50U2Vlbi5kZWYgJiYgSlNPTi5zdHJpbmdpZnkoc2NoZW1hW2tleV0pID09PSBKU09OLnN0cmluZ2lmeShwYXJlbnRTZWVuLmRlZltrZXldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHNjaGVtYVtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGV4ZWN1dGUgb3ZlcnJpZGVzXHJcbiAgICAgICAgY3R4Lm92ZXJyaWRlKHtcclxuICAgICAgICAgICAgem9kU2NoZW1hOiB6b2RTY2hlbWEsXHJcbiAgICAgICAgICAgIGpzb25TY2hlbWE6IHNjaGVtYSxcclxuICAgICAgICAgICAgcGF0aDogc2Vlbi5wYXRoID8/IFtdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIGZvciAoY29uc3QgZW50cnkgb2YgWy4uLmN0eC5zZWVuLmVudHJpZXMoKV0ucmV2ZXJzZSgpKSB7XHJcbiAgICAgICAgZmxhdHRlblJlZihlbnRyeVswXSk7XHJcbiAgICB9XHJcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcclxuICAgIGlmIChjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTIwMjAtMTJcIikge1xyXG4gICAgICAgIHJlc3VsdC4kc2NoZW1hID0gXCJodHRwczovL2pzb24tc2NoZW1hLm9yZy9kcmFmdC8yMDIwLTEyL3NjaGVtYVwiO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0wN1wiKSB7XHJcbiAgICAgICAgcmVzdWx0LiRzY2hlbWEgPSBcImh0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDcvc2NoZW1hI1wiO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0wNFwiKSB7XHJcbiAgICAgICAgcmVzdWx0LiRzY2hlbWEgPSBcImh0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDQvc2NoZW1hI1wiO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoY3R4LnRhcmdldCA9PT0gXCJvcGVuYXBpLTMuMFwiKSB7XHJcbiAgICAgICAgLy8gT3BlbkFQSSAzLjAgc2NoZW1hIG9iamVjdHMgc2hvdWxkIG5vdCBpbmNsdWRlIGEgJHNjaGVtYSBwcm9wZXJ0eVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy8gQXJiaXRyYXJ5IHN0cmluZyB2YWx1ZXMgYXJlIGFsbG93ZWQgYnV0IHdvbid0IGhhdmUgYSAkc2NoZW1hIHByb3BlcnR5IHNldFxyXG4gICAgfVxyXG4gICAgaWYgKGN0eC5leHRlcm5hbD8udXJpKSB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBjdHguZXh0ZXJuYWwucmVnaXN0cnkuZ2V0KHNjaGVtYSk/LmlkO1xyXG4gICAgICAgIGlmICghaWQpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjaGVtYSBpcyBtaXNzaW5nIGFuIGBpZGAgcHJvcGVydHlcIik7XHJcbiAgICAgICAgcmVzdWx0LiRpZCA9IGN0eC5leHRlcm5hbC51cmkoaWQpO1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmFzc2lnbihyZXN1bHQsIHJvb3QuZGVmID8/IHJvb3Quc2NoZW1hKTtcclxuICAgIC8vIFRoZSBgaWRgIGluIGAubWV0YSgpYCBpcyBhIFpvZC1zcGVjaWZpYyByZWdpc3RyYXRpb24gdGFnIHVzZWQgdG8gZXh0cmFjdFxyXG4gICAgLy8gc2NoZW1hcyBpbnRvICRkZWZzIOKAlCBpdCBpcyBub3QgdXNlci1mYWNpbmcgSlNPTiBTY2hlbWEgbWV0YWRhdGEuIFN0cmlwIGl0XHJcbiAgICAvLyBmcm9tIHRoZSBvdXRwdXQgYm9keSB3aGVyZSBpdCB3b3VsZCBvdGhlcndpc2UgbGVhay4gVGhlIGlkIGlzIHByZXNlcnZlZFxyXG4gICAgLy8gaW1wbGljaXRseSB2aWEgdGhlICRkZWZzIGtleSAoYW5kIHZpYSAkcmVmIHBhdGhzKS5cclxuICAgIGNvbnN0IHJvb3RNZXRhSWQgPSBjdHgubWV0YWRhdGFSZWdpc3RyeS5nZXQoc2NoZW1hKT8uaWQ7XHJcbiAgICBpZiAocm9vdE1ldGFJZCAhPT0gdW5kZWZpbmVkICYmIHJlc3VsdC5pZCA9PT0gcm9vdE1ldGFJZClcclxuICAgICAgICBkZWxldGUgcmVzdWx0LmlkO1xyXG4gICAgLy8gYnVpbGQgZGVmcyBvYmplY3RcclxuICAgIGNvbnN0IGRlZnMgPSBjdHguZXh0ZXJuYWw/LmRlZnMgPz8ge307XHJcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGN0eC5zZWVuLmVudHJpZXMoKSkge1xyXG4gICAgICAgIGNvbnN0IHNlZW4gPSBlbnRyeVsxXTtcclxuICAgICAgICBpZiAoc2Vlbi5kZWYgJiYgc2Vlbi5kZWZJZCkge1xyXG4gICAgICAgICAgICBpZiAoc2Vlbi5kZWYuaWQgPT09IHNlZW4uZGVmSWQpXHJcbiAgICAgICAgICAgICAgICBkZWxldGUgc2Vlbi5kZWYuaWQ7XHJcbiAgICAgICAgICAgIGRlZnNbc2Vlbi5kZWZJZF0gPSBzZWVuLmRlZjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBzZXQgZGVmaW5pdGlvbnMgaW4gcmVzdWx0XHJcbiAgICBpZiAoY3R4LmV4dGVybmFsKSB7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMoZGVmcykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBpZiAoY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0yMDIwLTEyXCIpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC4kZGVmcyA9IGRlZnM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuZGVmaW5pdGlvbnMgPSBkZWZzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdHJ5IHtcclxuICAgICAgICAvLyB0aGlzIFwiZmluYWxpemVzXCIgdGhpcyBzY2hlbWEgYW5kIGVuc3VyZXMgYWxsIGN5Y2xlcyBhcmUgcmVtb3ZlZFxyXG4gICAgICAgIC8vIGVhY2ggY2FsbCB0byBmaW5hbGl6ZSgpIGlzIGZ1bmN0aW9uYWxseSBpbmRlcGVuZGVudFxyXG4gICAgICAgIC8vIHRob3VnaCB0aGUgc2VlbiBtYXAgaXMgc2hhcmVkXHJcbiAgICAgICAgY29uc3QgZmluYWxpemVkID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShyZXN1bHQpKTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZmluYWxpemVkLCBcIn5zdGFuZGFyZFwiLCB7XHJcbiAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zY2hlbWFbXCJ+c3RhbmRhcmRcIl0sXHJcbiAgICAgICAgICAgICAgICBqc29uU2NoZW1hOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IGNyZWF0ZVN0YW5kYXJkSlNPTlNjaGVtYU1ldGhvZChzY2hlbWEsIFwiaW5wdXRcIiwgY3R4LnByb2Nlc3NvcnMpLFxyXG4gICAgICAgICAgICAgICAgICAgIG91dHB1dDogY3JlYXRlU3RhbmRhcmRKU09OU2NoZW1hTWV0aG9kKHNjaGVtYSwgXCJvdXRwdXRcIiwgY3R4LnByb2Nlc3NvcnMpLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZmluYWxpemVkO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKF9lcnIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBjb252ZXJ0aW5nIHNjaGVtYSB0byBKU09OLlwiKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBpc1RyYW5zZm9ybWluZyhfc2NoZW1hLCBfY3R4KSB7XHJcbiAgICBjb25zdCBjdHggPSBfY3R4ID8/IHsgc2VlbjogbmV3IFNldCgpIH07XHJcbiAgICBpZiAoY3R4LnNlZW4uaGFzKF9zY2hlbWEpKVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIGN0eC5zZWVuLmFkZChfc2NoZW1hKTtcclxuICAgIGNvbnN0IGRlZiA9IF9zY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBpZiAoZGVmLnR5cGUgPT09IFwidHJhbnNmb3JtXCIpXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBpZiAoZGVmLnR5cGUgPT09IFwiYXJyYXlcIilcclxuICAgICAgICByZXR1cm4gaXNUcmFuc2Zvcm1pbmcoZGVmLmVsZW1lbnQsIGN0eCk7XHJcbiAgICBpZiAoZGVmLnR5cGUgPT09IFwic2V0XCIpXHJcbiAgICAgICAgcmV0dXJuIGlzVHJhbnNmb3JtaW5nKGRlZi52YWx1ZVR5cGUsIGN0eCk7XHJcbiAgICBpZiAoZGVmLnR5cGUgPT09IFwibGF6eVwiKVxyXG4gICAgICAgIHJldHVybiBpc1RyYW5zZm9ybWluZyhkZWYuZ2V0dGVyKCksIGN0eCk7XHJcbiAgICBpZiAoZGVmLnR5cGUgPT09IFwicHJvbWlzZVwiIHx8XHJcbiAgICAgICAgZGVmLnR5cGUgPT09IFwib3B0aW9uYWxcIiB8fFxyXG4gICAgICAgIGRlZi50eXBlID09PSBcIm5vbm9wdGlvbmFsXCIgfHxcclxuICAgICAgICBkZWYudHlwZSA9PT0gXCJudWxsYWJsZVwiIHx8XHJcbiAgICAgICAgZGVmLnR5cGUgPT09IFwicmVhZG9ubHlcIiB8fFxyXG4gICAgICAgIGRlZi50eXBlID09PSBcImRlZmF1bHRcIiB8fFxyXG4gICAgICAgIGRlZi50eXBlID09PSBcInByZWZhdWx0XCIpIHtcclxuICAgICAgICByZXR1cm4gaXNUcmFuc2Zvcm1pbmcoZGVmLmlubmVyVHlwZSwgY3R4KTtcclxuICAgIH1cclxuICAgIGlmIChkZWYudHlwZSA9PT0gXCJpbnRlcnNlY3Rpb25cIikge1xyXG4gICAgICAgIHJldHVybiBpc1RyYW5zZm9ybWluZyhkZWYubGVmdCwgY3R4KSB8fCBpc1RyYW5zZm9ybWluZyhkZWYucmlnaHQsIGN0eCk7XHJcbiAgICB9XHJcbiAgICBpZiAoZGVmLnR5cGUgPT09IFwicmVjb3JkXCIgfHwgZGVmLnR5cGUgPT09IFwibWFwXCIpIHtcclxuICAgICAgICByZXR1cm4gaXNUcmFuc2Zvcm1pbmcoZGVmLmtleVR5cGUsIGN0eCkgfHwgaXNUcmFuc2Zvcm1pbmcoZGVmLnZhbHVlVHlwZSwgY3R4KTtcclxuICAgIH1cclxuICAgIGlmIChkZWYudHlwZSA9PT0gXCJwaXBlXCIpIHtcclxuICAgICAgICBpZiAoX3NjaGVtYS5fem9kLnRyYWl0cy5oYXMoXCIkWm9kQ29kZWNcIikpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIHJldHVybiBpc1RyYW5zZm9ybWluZyhkZWYuaW4sIGN0eCkgfHwgaXNUcmFuc2Zvcm1pbmcoZGVmLm91dCwgY3R4KTtcclxuICAgIH1cclxuICAgIGlmIChkZWYudHlwZSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGRlZi5zaGFwZSkge1xyXG4gICAgICAgICAgICBpZiAoaXNUcmFuc2Zvcm1pbmcoZGVmLnNoYXBlW2tleV0sIGN0eCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGRlZi50eXBlID09PSBcInVuaW9uXCIpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBkZWYub3B0aW9ucykge1xyXG4gICAgICAgICAgICBpZiAoaXNUcmFuc2Zvcm1pbmcob3B0aW9uLCBjdHgpKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChkZWYudHlwZSA9PT0gXCJ0dXBsZVwiKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIGRlZi5pdGVtcykge1xyXG4gICAgICAgICAgICBpZiAoaXNUcmFuc2Zvcm1pbmcoaXRlbSwgY3R4KSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVmLnJlc3QgJiYgaXNUcmFuc2Zvcm1pbmcoZGVmLnJlc3QsIGN0eCkpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG4vKipcclxuICogQ3JlYXRlcyBhIHRvSlNPTlNjaGVtYSBtZXRob2QgZm9yIGEgc2NoZW1hIGluc3RhbmNlLlxyXG4gKiBUaGlzIGVuY2Fwc3VsYXRlcyB0aGUgbG9naWMgb2YgaW5pdGlhbGl6aW5nIGNvbnRleHQsIHByb2Nlc3NpbmcsIGV4dHJhY3RpbmcgZGVmcywgYW5kIGZpbmFsaXppbmcuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgY3JlYXRlVG9KU09OU2NoZW1hTWV0aG9kID0gKHNjaGVtYSwgcHJvY2Vzc29ycyA9IHt9KSA9PiAocGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBjdHggPSBpbml0aWFsaXplQ29udGV4dCh7IC4uLnBhcmFtcywgcHJvY2Vzc29ycyB9KTtcclxuICAgIHByb2Nlc3Moc2NoZW1hLCBjdHgpO1xyXG4gICAgZXh0cmFjdERlZnMoY3R4LCBzY2hlbWEpO1xyXG4gICAgcmV0dXJuIGZpbmFsaXplKGN0eCwgc2NoZW1hKTtcclxufTtcclxuZXhwb3J0IGNvbnN0IGNyZWF0ZVN0YW5kYXJkSlNPTlNjaGVtYU1ldGhvZCA9IChzY2hlbWEsIGlvLCBwcm9jZXNzb3JzID0ge30pID0+IChwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IHsgbGlicmFyeU9wdGlvbnMsIHRhcmdldCB9ID0gcGFyYW1zID8/IHt9O1xyXG4gICAgY29uc3QgY3R4ID0gaW5pdGlhbGl6ZUNvbnRleHQoeyAuLi4obGlicmFyeU9wdGlvbnMgPz8ge30pLCB0YXJnZXQsIGlvLCBwcm9jZXNzb3JzIH0pO1xyXG4gICAgcHJvY2VzcyhzY2hlbWEsIGN0eCk7XHJcbiAgICBleHRyYWN0RGVmcyhjdHgsIHNjaGVtYSk7XHJcbiAgICByZXR1cm4gZmluYWxpemUoY3R4LCBzY2hlbWEpO1xyXG59O1xyXG4iLCJpbXBvcnQgeyBleHRyYWN0RGVmcywgZmluYWxpemUsIGluaXRpYWxpemVDb250ZXh0LCBwcm9jZXNzLCB9IGZyb20gXCIuL3RvLWpzb24tc2NoZW1hLmpzXCI7XHJcbmltcG9ydCB7IGdldEVudW1WYWx1ZXMgfSBmcm9tIFwiLi91dGlsLmpzXCI7XHJcbmNvbnN0IGZvcm1hdE1hcCA9IHtcclxuICAgIGd1aWQ6IFwidXVpZFwiLFxyXG4gICAgdXJsOiBcInVyaVwiLFxyXG4gICAgZGF0ZXRpbWU6IFwiZGF0ZS10aW1lXCIsXHJcbiAgICBqc29uX3N0cmluZzogXCJqc29uLXN0cmluZ1wiLFxyXG4gICAgcmVnZXg6IFwiXCIsIC8vIGRvIG5vdCBzZXRcclxufTtcclxuLy8gPT09PT09PT09PT09PT09PT09PT0gU0lNUExFIFRZUEUgUFJPQ0VTU09SUyA9PT09PT09PT09PT09PT09PT09PVxyXG5leHBvcnQgY29uc3Qgc3RyaW5nUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBfanNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAgY29uc3QganNvbiA9IF9qc29uO1xyXG4gICAganNvbi50eXBlID0gXCJzdHJpbmdcIjtcclxuICAgIGNvbnN0IHsgbWluaW11bSwgbWF4aW11bSwgZm9ybWF0LCBwYXR0ZXJucywgY29udGVudEVuY29kaW5nIH0gPSBzY2hlbWEuX3pvZFxyXG4gICAgICAgIC5iYWc7XHJcbiAgICBpZiAodHlwZW9mIG1pbmltdW0gPT09IFwibnVtYmVyXCIpXHJcbiAgICAgICAganNvbi5taW5MZW5ndGggPSBtaW5pbXVtO1xyXG4gICAgaWYgKHR5cGVvZiBtYXhpbXVtID09PSBcIm51bWJlclwiKVxyXG4gICAgICAgIGpzb24ubWF4TGVuZ3RoID0gbWF4aW11bTtcclxuICAgIC8vIGN1c3RvbSBwYXR0ZXJuIG92ZXJyaWRlcyBmb3JtYXRcclxuICAgIGlmIChmb3JtYXQpIHtcclxuICAgICAgICBqc29uLmZvcm1hdCA9IGZvcm1hdE1hcFtmb3JtYXRdID8/IGZvcm1hdDtcclxuICAgICAgICBpZiAoanNvbi5mb3JtYXQgPT09IFwiXCIpXHJcbiAgICAgICAgICAgIGRlbGV0ZSBqc29uLmZvcm1hdDsgLy8gZW1wdHkgZm9ybWF0IGlzIG5vdCB2YWxpZFxyXG4gICAgICAgIC8vIEpTT04gU2NoZW1hIGZvcm1hdDogXCJ0aW1lXCIgcmVxdWlyZXMgYSBmdWxsIHRpbWUgd2l0aCBvZmZzZXQgb3IgWlxyXG4gICAgICAgIC8vIHouaXNvLnRpbWUoKSBkb2VzIG5vdCBpbmNsdWRlIHRpbWV6b25lIGluZm9ybWF0aW9uLCBzbyBmb3JtYXQ6IFwidGltZVwiIHNob3VsZCBuZXZlciBiZSB1c2VkXHJcbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gXCJ0aW1lXCIpIHtcclxuICAgICAgICAgICAgZGVsZXRlIGpzb24uZm9ybWF0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChjb250ZW50RW5jb2RpbmcpXHJcbiAgICAgICAganNvbi5jb250ZW50RW5jb2RpbmcgPSBjb250ZW50RW5jb2Rpbmc7XHJcbiAgICBpZiAocGF0dGVybnMgJiYgcGF0dGVybnMuc2l6ZSA+IDApIHtcclxuICAgICAgICBjb25zdCByZWdleGVzID0gWy4uLnBhdHRlcm5zXTtcclxuICAgICAgICBpZiAocmVnZXhlcy5sZW5ndGggPT09IDEpXHJcbiAgICAgICAgICAgIGpzb24ucGF0dGVybiA9IHJlZ2V4ZXNbMF0uc291cmNlO1xyXG4gICAgICAgIGVsc2UgaWYgKHJlZ2V4ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBqc29uLmFsbE9mID0gW1xyXG4gICAgICAgICAgICAgICAgLi4ucmVnZXhlcy5tYXAoKHJlZ2V4KSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLihjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTA3XCIgfHwgY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0wNFwiIHx8IGN0eC50YXJnZXQgPT09IFwib3BlbmFwaS0zLjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA/IHsgdHlwZTogXCJzdHJpbmdcIiB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDoge30pLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhdHRlcm46IHJlZ2V4LnNvdXJjZSxcclxuICAgICAgICAgICAgICAgIH0pKSxcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCBudW1iZXJQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBqc29uID0gX2pzb247XHJcbiAgICBjb25zdCB7IG1pbmltdW0sIG1heGltdW0sIGZvcm1hdCwgbXVsdGlwbGVPZiwgZXhjbHVzaXZlTWF4aW11bSwgZXhjbHVzaXZlTWluaW11bSB9ID0gc2NoZW1hLl96b2QuYmFnO1xyXG4gICAgaWYgKHR5cGVvZiBmb3JtYXQgPT09IFwic3RyaW5nXCIgJiYgZm9ybWF0LmluY2x1ZGVzKFwiaW50XCIpKVxyXG4gICAgICAgIGpzb24udHlwZSA9IFwiaW50ZWdlclwiO1xyXG4gICAgZWxzZVxyXG4gICAgICAgIGpzb24udHlwZSA9IFwibnVtYmVyXCI7XHJcbiAgICAvLyB3aGVuIGJvdGggbWluaW11bSBhbmQgZXhjbHVzaXZlTWluaW11bSBleGlzdCwgcGljayB0aGUgbW9yZSByZXN0cmljdGl2ZSBvbmVcclxuICAgIGNvbnN0IGV4TWluID0gdHlwZW9mIGV4Y2x1c2l2ZU1pbmltdW0gPT09IFwibnVtYmVyXCIgJiYgZXhjbHVzaXZlTWluaW11bSA+PSAobWluaW11bSA/PyBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpO1xyXG4gICAgY29uc3QgZXhNYXggPSB0eXBlb2YgZXhjbHVzaXZlTWF4aW11bSA9PT0gXCJudW1iZXJcIiAmJiBleGNsdXNpdmVNYXhpbXVtIDw9IChtYXhpbXVtID8/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSk7XHJcbiAgICBjb25zdCBsZWdhY3kgPSBjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTA0XCIgfHwgY3R4LnRhcmdldCA9PT0gXCJvcGVuYXBpLTMuMFwiO1xyXG4gICAgaWYgKGV4TWluKSB7XHJcbiAgICAgICAgaWYgKGxlZ2FjeSkge1xyXG4gICAgICAgICAgICBqc29uLm1pbmltdW0gPSBleGNsdXNpdmVNaW5pbXVtO1xyXG4gICAgICAgICAgICBqc29uLmV4Y2x1c2l2ZU1pbmltdW0gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAganNvbi5leGNsdXNpdmVNaW5pbXVtID0gZXhjbHVzaXZlTWluaW11bTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0eXBlb2YgbWluaW11bSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgIGpzb24ubWluaW11bSA9IG1pbmltdW07XHJcbiAgICB9XHJcbiAgICBpZiAoZXhNYXgpIHtcclxuICAgICAgICBpZiAobGVnYWN5KSB7XHJcbiAgICAgICAgICAgIGpzb24ubWF4aW11bSA9IGV4Y2x1c2l2ZU1heGltdW07XHJcbiAgICAgICAgICAgIGpzb24uZXhjbHVzaXZlTWF4aW11bSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBqc29uLmV4Y2x1c2l2ZU1heGltdW0gPSBleGNsdXNpdmVNYXhpbXVtO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHR5cGVvZiBtYXhpbXVtID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAganNvbi5tYXhpbXVtID0gbWF4aW11bTtcclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgbXVsdGlwbGVPZiA9PT0gXCJudW1iZXJcIilcclxuICAgICAgICBqc29uLm11bHRpcGxlT2YgPSBtdWx0aXBsZU9mO1xyXG59O1xyXG5leHBvcnQgY29uc3QgYm9vbGVhblByb2Nlc3NvciA9IChfc2NoZW1hLCBfY3R4LCBqc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBqc29uLnR5cGUgPSBcImJvb2xlYW5cIjtcclxufTtcclxuZXhwb3J0IGNvbnN0IGJpZ2ludFByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQmlnSW50IGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IHN5bWJvbFByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3ltYm9scyBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCBudWxsUHJvY2Vzc29yID0gKF9zY2hlbWEsIGN0eCwganNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAgaWYgKGN0eC50YXJnZXQgPT09IFwib3BlbmFwaS0zLjBcIikge1xyXG4gICAgICAgIGpzb24udHlwZSA9IFwic3RyaW5nXCI7XHJcbiAgICAgICAganNvbi5udWxsYWJsZSA9IHRydWU7XHJcbiAgICAgICAganNvbi5lbnVtID0gW251bGxdO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAganNvbi50eXBlID0gXCJudWxsXCI7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCB1bmRlZmluZWRQcm9jZXNzb3IgPSAoX3NjaGVtYSwgY3R4LCBfanNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuZGVmaW5lZCBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCB2b2lkUHJvY2Vzc29yID0gKF9zY2hlbWEsIGN0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIGlmIChjdHgudW5yZXByZXNlbnRhYmxlID09PSBcInRocm93XCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWb2lkIGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IG5ldmVyUHJvY2Vzc29yID0gKF9zY2hlbWEsIF9jdHgsIGpzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIGpzb24ubm90ID0ge307XHJcbn07XHJcbmV4cG9ydCBjb25zdCBhbnlQcm9jZXNzb3IgPSAoX3NjaGVtYSwgX2N0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIC8vIGVtcHR5IHNjaGVtYSBhY2NlcHRzIGFueXRoaW5nXHJcbn07XHJcbmV4cG9ydCBjb25zdCB1bmtub3duUHJvY2Vzc29yID0gKF9zY2hlbWEsIF9jdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICAvLyBlbXB0eSBzY2hlbWEgYWNjZXB0cyBhbnl0aGluZ1xyXG59O1xyXG5leHBvcnQgY29uc3QgZGF0ZVByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRGF0ZSBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCBlbnVtUHJvY2Vzc29yID0gKHNjaGVtYSwgX2N0eCwganNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAgY29uc3QgdmFsdWVzID0gZ2V0RW51bVZhbHVlcyhkZWYuZW50cmllcyk7XHJcbiAgICAvLyBOdW1iZXIgZW51bXMgY2FuIGhhdmUgYm90aCBzdHJpbmcgYW5kIG51bWJlciB2YWx1ZXNcclxuICAgIGlmICh2YWx1ZXMuZXZlcnkoKHYpID0+IHR5cGVvZiB2ID09PSBcIm51bWJlclwiKSlcclxuICAgICAgICBqc29uLnR5cGUgPSBcIm51bWJlclwiO1xyXG4gICAgaWYgKHZhbHVlcy5ldmVyeSgodikgPT4gdHlwZW9mIHYgPT09IFwic3RyaW5nXCIpKVxyXG4gICAgICAgIGpzb24udHlwZSA9IFwic3RyaW5nXCI7XHJcbiAgICBqc29uLmVudW0gPSB2YWx1ZXM7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBsaXRlcmFsUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBqc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBjb25zdCB2YWxzID0gW107XHJcbiAgICBmb3IgKGNvbnN0IHZhbCBvZiBkZWYudmFsdWVzKSB7XHJcbiAgICAgICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGlmIChjdHgudW5yZXByZXNlbnRhYmxlID09PSBcInRocm93XCIpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkxpdGVyYWwgYHVuZGVmaW5lZGAgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gZG8gbm90IGFkZCB0byB2YWxzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gXCJiaWdpbnRcIikge1xyXG4gICAgICAgICAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCaWdJbnQgbGl0ZXJhbHMgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFscy5wdXNoKE51bWJlcih2YWwpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFscy5wdXNoKHZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHZhbHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgLy8gZG8gbm90aGluZyAoYW4gdW5kZWZpbmVkIGxpdGVyYWwgd2FzIHN0cmlwcGVkKVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodmFscy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICBjb25zdCB2YWwgPSB2YWxzWzBdO1xyXG4gICAgICAgIGpzb24udHlwZSA9IHZhbCA9PT0gbnVsbCA/IFwibnVsbFwiIDogdHlwZW9mIHZhbDtcclxuICAgICAgICBpZiAoY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0wNFwiIHx8IGN0eC50YXJnZXQgPT09IFwib3BlbmFwaS0zLjBcIikge1xyXG4gICAgICAgICAgICBqc29uLmVudW0gPSBbdmFsXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGpzb24uY29uc3QgPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKHZhbHMuZXZlcnkoKHYpID0+IHR5cGVvZiB2ID09PSBcIm51bWJlclwiKSlcclxuICAgICAgICAgICAganNvbi50eXBlID0gXCJudW1iZXJcIjtcclxuICAgICAgICBpZiAodmFscy5ldmVyeSgodikgPT4gdHlwZW9mIHYgPT09IFwic3RyaW5nXCIpKVxyXG4gICAgICAgICAgICBqc29uLnR5cGUgPSBcInN0cmluZ1wiO1xyXG4gICAgICAgIGlmICh2YWxzLmV2ZXJ5KCh2KSA9PiB0eXBlb2YgdiA9PT0gXCJib29sZWFuXCIpKVxyXG4gICAgICAgICAgICBqc29uLnR5cGUgPSBcImJvb2xlYW5cIjtcclxuICAgICAgICBpZiAodmFscy5ldmVyeSgodikgPT4gdiA9PT0gbnVsbCkpXHJcbiAgICAgICAgICAgIGpzb24udHlwZSA9IFwibnVsbFwiO1xyXG4gICAgICAgIGpzb24uZW51bSA9IHZhbHM7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCBuYW5Qcm9jZXNzb3IgPSAoX3NjaGVtYSwgY3R4LCBfanNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5hTiBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCB0ZW1wbGF0ZUxpdGVyYWxQcm9jZXNzb3IgPSAoc2NoZW1hLCBfY3R4LCBqc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBfanNvbiA9IGpzb247XHJcbiAgICBjb25zdCBwYXR0ZXJuID0gc2NoZW1hLl96b2QucGF0dGVybjtcclxuICAgIGlmICghcGF0dGVybilcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXR0ZXJuIG5vdCBmb3VuZCBpbiB0ZW1wbGF0ZSBsaXRlcmFsXCIpO1xyXG4gICAgX2pzb24udHlwZSA9IFwic3RyaW5nXCI7XHJcbiAgICBfanNvbi5wYXR0ZXJuID0gcGF0dGVybi5zb3VyY2U7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBmaWxlUHJvY2Vzc29yID0gKHNjaGVtYSwgX2N0eCwganNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgX2pzb24gPSBqc29uO1xyXG4gICAgY29uc3QgZmlsZSA9IHtcclxuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgIGZvcm1hdDogXCJiaW5hcnlcIixcclxuICAgICAgICBjb250ZW50RW5jb2Rpbmc6IFwiYmluYXJ5XCIsXHJcbiAgICB9O1xyXG4gICAgY29uc3QgeyBtaW5pbXVtLCBtYXhpbXVtLCBtaW1lIH0gPSBzY2hlbWEuX3pvZC5iYWc7XHJcbiAgICBpZiAobWluaW11bSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgIGZpbGUubWluTGVuZ3RoID0gbWluaW11bTtcclxuICAgIGlmIChtYXhpbXVtICE9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgZmlsZS5tYXhMZW5ndGggPSBtYXhpbXVtO1xyXG4gICAgaWYgKG1pbWUpIHtcclxuICAgICAgICBpZiAobWltZS5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgICAgZmlsZS5jb250ZW50TWVkaWFUeXBlID0gbWltZVswXTtcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihfanNvbiwgZmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKF9qc29uLCBmaWxlKTsgLy8gc2hhcmVkIHByb3BzIGF0IHJvb3RcclxuICAgICAgICAgICAgX2pzb24uYW55T2YgPSBtaW1lLm1hcCgobSkgPT4gKHsgY29udGVudE1lZGlhVHlwZTogbSB9KSk7IC8vIG9ubHkgY29udGVudE1lZGlhVHlwZSBkaWZmZXJzXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihfanNvbiwgZmlsZSk7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCBzdWNjZXNzUHJvY2Vzc29yID0gKF9zY2hlbWEsIF9jdHgsIGpzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIGpzb24udHlwZSA9IFwiYm9vbGVhblwiO1xyXG59O1xyXG5leHBvcnQgY29uc3QgY3VzdG9tUHJvY2Vzc29yID0gKF9zY2hlbWEsIGN0eCwgX2pzb24sIF9wYXJhbXMpID0+IHtcclxuICAgIGlmIChjdHgudW5yZXByZXNlbnRhYmxlID09PSBcInRocm93XCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDdXN0b20gdHlwZXMgY2Fubm90IGJlIHJlcHJlc2VudGVkIGluIEpTT04gU2NoZW1hXCIpO1xyXG4gICAgfVxyXG59O1xyXG5leHBvcnQgY29uc3QgZnVuY3Rpb25Qcm9jZXNzb3IgPSAoX3NjaGVtYSwgY3R4LCBfanNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZ1bmN0aW9uIHR5cGVzIGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiBKU09OIFNjaGVtYVwiKTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybVByb2Nlc3NvciA9IChfc2NoZW1hLCBjdHgsIF9qc29uLCBfcGFyYW1zKSA9PiB7XHJcbiAgICBpZiAoY3R4LnVucmVwcmVzZW50YWJsZSA9PT0gXCJ0aHJvd1wiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVHJhbnNmb3JtcyBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCBtYXBQcm9jZXNzb3IgPSAoX3NjaGVtYSwgY3R4LCBfanNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1hcCBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCBzZXRQcm9jZXNzb3IgPSAoX3NjaGVtYSwgY3R4LCBfanNvbiwgX3BhcmFtcykgPT4ge1xyXG4gICAgaWYgKGN0eC51bnJlcHJlc2VudGFibGUgPT09IFwidGhyb3dcIikge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNldCBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gSlNPTiBTY2hlbWFcIik7XHJcbiAgICB9XHJcbn07XHJcbi8vID09PT09PT09PT09PT09PT09PT09IENPTVBPU0lURSBUWVBFIFBST0NFU1NPUlMgPT09PT09PT09PT09PT09PT09PT1cclxuZXhwb3J0IGNvbnN0IGFycmF5UHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBfanNvbiwgcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBqc29uID0gX2pzb247XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBjb25zdCB7IG1pbmltdW0sIG1heGltdW0gfSA9IHNjaGVtYS5fem9kLmJhZztcclxuICAgIGlmICh0eXBlb2YgbWluaW11bSA9PT0gXCJudW1iZXJcIilcclxuICAgICAgICBqc29uLm1pbkl0ZW1zID0gbWluaW11bTtcclxuICAgIGlmICh0eXBlb2YgbWF4aW11bSA9PT0gXCJudW1iZXJcIilcclxuICAgICAgICBqc29uLm1heEl0ZW1zID0gbWF4aW11bTtcclxuICAgIGpzb24udHlwZSA9IFwiYXJyYXlcIjtcclxuICAgIGpzb24uaXRlbXMgPSBwcm9jZXNzKGRlZi5lbGVtZW50LCBjdHgsIHtcclxuICAgICAgICAuLi5wYXJhbXMsXHJcbiAgICAgICAgcGF0aDogWy4uLnBhcmFtcy5wYXRoLCBcIml0ZW1zXCJdLFxyXG4gICAgfSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBvYmplY3RQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGpzb24gPSBfanNvbjtcclxuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIGpzb24udHlwZSA9IFwib2JqZWN0XCI7XHJcbiAgICBqc29uLnByb3BlcnRpZXMgPSB7fTtcclxuICAgIGNvbnN0IHNoYXBlID0gZGVmLnNoYXBlO1xyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gc2hhcGUpIHtcclxuICAgICAgICBqc29uLnByb3BlcnRpZXNba2V5XSA9IHByb2Nlc3Moc2hhcGVba2V5XSwgY3R4LCB7XHJcbiAgICAgICAgICAgIC4uLnBhcmFtcyxcclxuICAgICAgICAgICAgcGF0aDogWy4uLnBhcmFtcy5wYXRoLCBcInByb3BlcnRpZXNcIiwga2V5XSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8vIHJlcXVpcmVkIGtleXNcclxuICAgIGNvbnN0IGFsbEtleXMgPSBuZXcgU2V0KE9iamVjdC5rZXlzKHNoYXBlKSk7XHJcbiAgICBjb25zdCByZXF1aXJlZEtleXMgPSBuZXcgU2V0KFsuLi5hbGxLZXlzXS5maWx0ZXIoKGtleSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHYgPSBkZWYuc2hhcGVba2V5XS5fem9kO1xyXG4gICAgICAgIGlmIChjdHguaW8gPT09IFwiaW5wdXRcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gdi5vcHRpbiA9PT0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHYub3B0b3V0ID09PSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSkpO1xyXG4gICAgaWYgKHJlcXVpcmVkS2V5cy5zaXplID4gMCkge1xyXG4gICAgICAgIGpzb24ucmVxdWlyZWQgPSBBcnJheS5mcm9tKHJlcXVpcmVkS2V5cyk7XHJcbiAgICB9XHJcbiAgICAvLyBjYXRjaGFsbFxyXG4gICAgaWYgKGRlZi5jYXRjaGFsbD8uX3pvZC5kZWYudHlwZSA9PT0gXCJuZXZlclwiKSB7XHJcbiAgICAgICAgLy8gc3RyaWN0XHJcbiAgICAgICAganNvbi5hZGRpdGlvbmFsUHJvcGVydGllcyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIWRlZi5jYXRjaGFsbCkge1xyXG4gICAgICAgIC8vIHJlZ3VsYXJcclxuICAgICAgICBpZiAoY3R4LmlvID09PSBcIm91dHB1dFwiKVxyXG4gICAgICAgICAgICBqc29uLmFkZGl0aW9uYWxQcm9wZXJ0aWVzID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChkZWYuY2F0Y2hhbGwpIHtcclxuICAgICAgICBqc29uLmFkZGl0aW9uYWxQcm9wZXJ0aWVzID0gcHJvY2VzcyhkZWYuY2F0Y2hhbGwsIGN0eCwge1xyXG4gICAgICAgICAgICAuLi5wYXJhbXMsXHJcbiAgICAgICAgICAgIHBhdGg6IFsuLi5wYXJhbXMucGF0aCwgXCJhZGRpdGlvbmFsUHJvcGVydGllc1wiXSxcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTtcclxuZXhwb3J0IGNvbnN0IHVuaW9uUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBqc29uLCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIC8vIEV4Y2x1c2l2ZSB1bmlvbnMgKGluY2x1c2l2ZSA9PT0gZmFsc2UpIHVzZSBvbmVPZiAoZXhhY3RseSBvbmUgbWF0Y2gpIGluc3RlYWQgb2YgYW55T2YgKG9uZSBvciBtb3JlIG1hdGNoZXMpXHJcbiAgICAvLyBUaGlzIGluY2x1ZGVzIGJvdGggei54b3IoKSBhbmQgZGlzY3JpbWluYXRlZCB1bmlvbnNcclxuICAgIGNvbnN0IGlzRXhjbHVzaXZlID0gZGVmLmluY2x1c2l2ZSA9PT0gZmFsc2U7XHJcbiAgICBjb25zdCBvcHRpb25zID0gZGVmLm9wdGlvbnMubWFwKCh4LCBpKSA9PiBwcm9jZXNzKHgsIGN0eCwge1xyXG4gICAgICAgIC4uLnBhcmFtcyxcclxuICAgICAgICBwYXRoOiBbLi4ucGFyYW1zLnBhdGgsIGlzRXhjbHVzaXZlID8gXCJvbmVPZlwiIDogXCJhbnlPZlwiLCBpXSxcclxuICAgIH0pKTtcclxuICAgIGlmIChpc0V4Y2x1c2l2ZSkge1xyXG4gICAgICAgIGpzb24ub25lT2YgPSBvcHRpb25zO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAganNvbi5hbnlPZiA9IG9wdGlvbnM7XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCBpbnRlcnNlY3Rpb25Qcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIGpzb24sIHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAgY29uc3QgYSA9IHByb2Nlc3MoZGVmLmxlZnQsIGN0eCwge1xyXG4gICAgICAgIC4uLnBhcmFtcyxcclxuICAgICAgICBwYXRoOiBbLi4ucGFyYW1zLnBhdGgsIFwiYWxsT2ZcIiwgMF0sXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGIgPSBwcm9jZXNzKGRlZi5yaWdodCwgY3R4LCB7XHJcbiAgICAgICAgLi4ucGFyYW1zLFxyXG4gICAgICAgIHBhdGg6IFsuLi5wYXJhbXMucGF0aCwgXCJhbGxPZlwiLCAxXSxcclxuICAgIH0pO1xyXG4gICAgY29uc3QgaXNTaW1wbGVJbnRlcnNlY3Rpb24gPSAodmFsKSA9PiBcImFsbE9mXCIgaW4gdmFsICYmIE9iamVjdC5rZXlzKHZhbCkubGVuZ3RoID09PSAxO1xyXG4gICAgY29uc3QgYWxsT2YgPSBbXHJcbiAgICAgICAgLi4uKGlzU2ltcGxlSW50ZXJzZWN0aW9uKGEpID8gYS5hbGxPZiA6IFthXSksXHJcbiAgICAgICAgLi4uKGlzU2ltcGxlSW50ZXJzZWN0aW9uKGIpID8gYi5hbGxPZiA6IFtiXSksXHJcbiAgICBdO1xyXG4gICAganNvbi5hbGxPZiA9IGFsbE9mO1xyXG59O1xyXG5leHBvcnQgY29uc3QgdHVwbGVQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGpzb24gPSBfanNvbjtcclxuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIGpzb24udHlwZSA9IFwiYXJyYXlcIjtcclxuICAgIGNvbnN0IHByZWZpeFBhdGggPSBjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTIwMjAtMTJcIiA/IFwicHJlZml4SXRlbXNcIiA6IFwiaXRlbXNcIjtcclxuICAgIGNvbnN0IHJlc3RQYXRoID0gY3R4LnRhcmdldCA9PT0gXCJkcmFmdC0yMDIwLTEyXCIgPyBcIml0ZW1zXCIgOiBjdHgudGFyZ2V0ID09PSBcIm9wZW5hcGktMy4wXCIgPyBcIml0ZW1zXCIgOiBcImFkZGl0aW9uYWxJdGVtc1wiO1xyXG4gICAgY29uc3QgcHJlZml4SXRlbXMgPSBkZWYuaXRlbXMubWFwKCh4LCBpKSA9PiBwcm9jZXNzKHgsIGN0eCwge1xyXG4gICAgICAgIC4uLnBhcmFtcyxcclxuICAgICAgICBwYXRoOiBbLi4ucGFyYW1zLnBhdGgsIHByZWZpeFBhdGgsIGldLFxyXG4gICAgfSkpO1xyXG4gICAgY29uc3QgcmVzdCA9IGRlZi5yZXN0XHJcbiAgICAgICAgPyBwcm9jZXNzKGRlZi5yZXN0LCBjdHgsIHtcclxuICAgICAgICAgICAgLi4ucGFyYW1zLFxyXG4gICAgICAgICAgICBwYXRoOiBbLi4ucGFyYW1zLnBhdGgsIHJlc3RQYXRoLCAuLi4oY3R4LnRhcmdldCA9PT0gXCJvcGVuYXBpLTMuMFwiID8gW2RlZi5pdGVtcy5sZW5ndGhdIDogW10pXSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIDogbnVsbDtcclxuICAgIGlmIChjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTIwMjAtMTJcIikge1xyXG4gICAgICAgIGpzb24ucHJlZml4SXRlbXMgPSBwcmVmaXhJdGVtcztcclxuICAgICAgICBpZiAocmVzdCkge1xyXG4gICAgICAgICAgICBqc29uLml0ZW1zID0gcmVzdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChjdHgudGFyZ2V0ID09PSBcIm9wZW5hcGktMy4wXCIpIHtcclxuICAgICAgICBqc29uLml0ZW1zID0ge1xyXG4gICAgICAgICAgICBhbnlPZjogcHJlZml4SXRlbXMsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAocmVzdCkge1xyXG4gICAgICAgICAgICBqc29uLml0ZW1zLmFueU9mLnB1c2gocmVzdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGpzb24ubWluSXRlbXMgPSBwcmVmaXhJdGVtcy5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCFyZXN0KSB7XHJcbiAgICAgICAgICAgIGpzb24ubWF4SXRlbXMgPSBwcmVmaXhJdGVtcy5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAganNvbi5pdGVtcyA9IHByZWZpeEl0ZW1zO1xyXG4gICAgICAgIGlmIChyZXN0KSB7XHJcbiAgICAgICAgICAgIGpzb24uYWRkaXRpb25hbEl0ZW1zID0gcmVzdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBsZW5ndGhcclxuICAgIGNvbnN0IHsgbWluaW11bSwgbWF4aW11bSB9ID0gc2NoZW1hLl96b2QuYmFnO1xyXG4gICAgaWYgKHR5cGVvZiBtaW5pbXVtID09PSBcIm51bWJlclwiKVxyXG4gICAgICAgIGpzb24ubWluSXRlbXMgPSBtaW5pbXVtO1xyXG4gICAgaWYgKHR5cGVvZiBtYXhpbXVtID09PSBcIm51bWJlclwiKVxyXG4gICAgICAgIGpzb24ubWF4SXRlbXMgPSBtYXhpbXVtO1xyXG59O1xyXG5leHBvcnQgY29uc3QgcmVjb3JkUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBfanNvbiwgcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBqc29uID0gX2pzb247XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBqc29uLnR5cGUgPSBcIm9iamVjdFwiO1xyXG4gICAgLy8gRm9yIGxvb3NlUmVjb3JkIHdpdGggcmVnZXggcGF0dGVybnMsIHVzZSBwYXR0ZXJuUHJvcGVydGllc1xyXG4gICAgLy8gVGhpcyBjb3JyZWN0bHkgcmVwcmVzZW50cyBcIm9ubHkgdmFsaWRhdGUga2V5cyBtYXRjaGluZyB0aGUgcGF0dGVyblwiIHNlbWFudGljc1xyXG4gICAgLy8gYW5kIGNvbXBvc2VzIHdlbGwgd2l0aCBhbGxPZiAoaW50ZXJzZWN0aW9ucylcclxuICAgIGNvbnN0IGtleVR5cGUgPSBkZWYua2V5VHlwZTtcclxuICAgIGNvbnN0IGtleUJhZyA9IGtleVR5cGUuX3pvZC5iYWc7XHJcbiAgICBjb25zdCBwYXR0ZXJucyA9IGtleUJhZz8ucGF0dGVybnM7XHJcbiAgICBpZiAoZGVmLm1vZGUgPT09IFwibG9vc2VcIiAmJiBwYXR0ZXJucyAmJiBwYXR0ZXJucy5zaXplID4gMCkge1xyXG4gICAgICAgIC8vIFVzZSBwYXR0ZXJuUHJvcGVydGllcyBmb3IgbG9vc2VSZWNvcmQgd2l0aCByZWdleCBwYXR0ZXJuc1xyXG4gICAgICAgIGNvbnN0IHZhbHVlU2NoZW1hID0gcHJvY2VzcyhkZWYudmFsdWVUeXBlLCBjdHgsIHtcclxuICAgICAgICAgICAgLi4ucGFyYW1zLFxyXG4gICAgICAgICAgICBwYXRoOiBbLi4ucGFyYW1zLnBhdGgsIFwicGF0dGVyblByb3BlcnRpZXNcIiwgXCIqXCJdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGpzb24ucGF0dGVyblByb3BlcnRpZXMgPSB7fTtcclxuICAgICAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcclxuICAgICAgICAgICAganNvbi5wYXR0ZXJuUHJvcGVydGllc1twYXR0ZXJuLnNvdXJjZV0gPSB2YWx1ZVNjaGVtYTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICAvLyBEZWZhdWx0IGJlaGF2aW9yOiB1c2UgcHJvcGVydHlOYW1lcyArIGFkZGl0aW9uYWxQcm9wZXJ0aWVzXHJcbiAgICAgICAgaWYgKGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMDdcIiB8fCBjdHgudGFyZ2V0ID09PSBcImRyYWZ0LTIwMjAtMTJcIikge1xyXG4gICAgICAgICAgICBqc29uLnByb3BlcnR5TmFtZXMgPSBwcm9jZXNzKGRlZi5rZXlUeXBlLCBjdHgsIHtcclxuICAgICAgICAgICAgICAgIC4uLnBhcmFtcyxcclxuICAgICAgICAgICAgICAgIHBhdGg6IFsuLi5wYXJhbXMucGF0aCwgXCJwcm9wZXJ0eU5hbWVzXCJdLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAganNvbi5hZGRpdGlvbmFsUHJvcGVydGllcyA9IHByb2Nlc3MoZGVmLnZhbHVlVHlwZSwgY3R4LCB7XHJcbiAgICAgICAgICAgIC4uLnBhcmFtcyxcclxuICAgICAgICAgICAgcGF0aDogWy4uLnBhcmFtcy5wYXRoLCBcImFkZGl0aW9uYWxQcm9wZXJ0aWVzXCJdLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy8gQWRkIHJlcXVpcmVkIGZvciBrZXlzIHdpdGggZGlzY3JldGUgdmFsdWVzIChlbnVtLCBsaXRlcmFsLCBldGMuKVxyXG4gICAgY29uc3Qga2V5VmFsdWVzID0ga2V5VHlwZS5fem9kLnZhbHVlcztcclxuICAgIGlmIChrZXlWYWx1ZXMpIHtcclxuICAgICAgICBjb25zdCB2YWxpZEtleVZhbHVlcyA9IFsuLi5rZXlWYWx1ZXNdLmZpbHRlcigodikgPT4gdHlwZW9mIHYgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIHYgPT09IFwibnVtYmVyXCIpO1xyXG4gICAgICAgIGlmICh2YWxpZEtleVZhbHVlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGpzb24ucmVxdWlyZWQgPSB2YWxpZEtleVZhbHVlcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCBudWxsYWJsZVByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwganNvbiwgcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBjb25zdCBpbm5lciA9IHByb2Nlc3MoZGVmLmlubmVyVHlwZSwgY3R4LCBwYXJhbXMpO1xyXG4gICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xyXG4gICAgaWYgKGN0eC50YXJnZXQgPT09IFwib3BlbmFwaS0zLjBcIikge1xyXG4gICAgICAgIHNlZW4ucmVmID0gZGVmLmlubmVyVHlwZTtcclxuICAgICAgICBqc29uLm51bGxhYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGpzb24uYW55T2YgPSBbaW5uZXIsIHsgdHlwZTogXCJudWxsXCIgfV07XHJcbiAgICB9XHJcbn07XHJcbmV4cG9ydCBjb25zdCBub25vcHRpb25hbFByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwgX2pzb24sIHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAgcHJvY2VzcyhkZWYuaW5uZXJUeXBlLCBjdHgsIHBhcmFtcyk7XHJcbiAgICBjb25zdCBzZWVuID0gY3R4LnNlZW4uZ2V0KHNjaGVtYSk7XHJcbiAgICBzZWVuLnJlZiA9IGRlZi5pbm5lclR5cGU7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBkZWZhdWx0UHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBqc29uLCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIHByb2Nlc3MoZGVmLmlubmVyVHlwZSwgY3R4LCBwYXJhbXMpO1xyXG4gICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xyXG4gICAgc2Vlbi5yZWYgPSBkZWYuaW5uZXJUeXBlO1xyXG4gICAganNvbi5kZWZhdWx0ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkZWYuZGVmYXVsdFZhbHVlKSk7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBwcmVmYXVsdFByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwganNvbiwgcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBwcm9jZXNzKGRlZi5pbm5lclR5cGUsIGN0eCwgcGFyYW1zKTtcclxuICAgIGNvbnN0IHNlZW4gPSBjdHguc2Vlbi5nZXQoc2NoZW1hKTtcclxuICAgIHNlZW4ucmVmID0gZGVmLmlubmVyVHlwZTtcclxuICAgIGlmIChjdHguaW8gPT09IFwiaW5wdXRcIilcclxuICAgICAgICBqc29uLl9wcmVmYXVsdCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGVmLmRlZmF1bHRWYWx1ZSkpO1xyXG59O1xyXG5leHBvcnQgY29uc3QgY2F0Y2hQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIGpzb24sIHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAgcHJvY2VzcyhkZWYuaW5uZXJUeXBlLCBjdHgsIHBhcmFtcyk7XHJcbiAgICBjb25zdCBzZWVuID0gY3R4LnNlZW4uZ2V0KHNjaGVtYSk7XHJcbiAgICBzZWVuLnJlZiA9IGRlZi5pbm5lclR5cGU7XHJcbiAgICBsZXQgY2F0Y2hWYWx1ZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY2F0Y2hWYWx1ZSA9IGRlZi5jYXRjaFZhbHVlKHVuZGVmaW5lZCk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRHluYW1pYyBjYXRjaCB2YWx1ZXMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gSlNPTiBTY2hlbWFcIik7XHJcbiAgICB9XHJcbiAgICBqc29uLmRlZmF1bHQgPSBjYXRjaFZhbHVlO1xyXG59O1xyXG5leHBvcnQgY29uc3QgcGlwZVByb2Nlc3NvciA9IChzY2hlbWEsIGN0eCwgX2pzb24sIHBhcmFtcykgPT4ge1xyXG4gICAgY29uc3QgZGVmID0gc2NoZW1hLl96b2QuZGVmO1xyXG4gICAgY29uc3QgaW5Jc1RyYW5zZm9ybSA9IGRlZi5pbi5fem9kLnRyYWl0cy5oYXMoXCIkWm9kVHJhbnNmb3JtXCIpO1xyXG4gICAgY29uc3QgaW5uZXJUeXBlID0gY3R4LmlvID09PSBcImlucHV0XCIgPyAoaW5Jc1RyYW5zZm9ybSA/IGRlZi5vdXQgOiBkZWYuaW4pIDogZGVmLm91dDtcclxuICAgIHByb2Nlc3MoaW5uZXJUeXBlLCBjdHgsIHBhcmFtcyk7XHJcbiAgICBjb25zdCBzZWVuID0gY3R4LnNlZW4uZ2V0KHNjaGVtYSk7XHJcbiAgICBzZWVuLnJlZiA9IGlubmVyVHlwZTtcclxufTtcclxuZXhwb3J0IGNvbnN0IHJlYWRvbmx5UHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBqc29uLCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGRlZiA9IHNjaGVtYS5fem9kLmRlZjtcclxuICAgIHByb2Nlc3MoZGVmLmlubmVyVHlwZSwgY3R4LCBwYXJhbXMpO1xyXG4gICAgY29uc3Qgc2VlbiA9IGN0eC5zZWVuLmdldChzY2hlbWEpO1xyXG4gICAgc2Vlbi5yZWYgPSBkZWYuaW5uZXJUeXBlO1xyXG4gICAganNvbi5yZWFkT25seSA9IHRydWU7XHJcbn07XHJcbmV4cG9ydCBjb25zdCBwcm9taXNlUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBfanNvbiwgcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBwcm9jZXNzKGRlZi5pbm5lclR5cGUsIGN0eCwgcGFyYW1zKTtcclxuICAgIGNvbnN0IHNlZW4gPSBjdHguc2Vlbi5nZXQoc2NoZW1hKTtcclxuICAgIHNlZW4ucmVmID0gZGVmLmlubmVyVHlwZTtcclxufTtcclxuZXhwb3J0IGNvbnN0IG9wdGlvbmFsUHJvY2Vzc29yID0gKHNjaGVtYSwgY3R4LCBfanNvbiwgcGFyYW1zKSA9PiB7XHJcbiAgICBjb25zdCBkZWYgPSBzY2hlbWEuX3pvZC5kZWY7XHJcbiAgICBwcm9jZXNzKGRlZi5pbm5lclR5cGUsIGN0eCwgcGFyYW1zKTtcclxuICAgIGNvbnN0IHNlZW4gPSBjdHguc2Vlbi5nZXQoc2NoZW1hKTtcclxuICAgIHNlZW4ucmVmID0gZGVmLmlubmVyVHlwZTtcclxufTtcclxuZXhwb3J0IGNvbnN0IGxhenlQcm9jZXNzb3IgPSAoc2NoZW1hLCBjdHgsIF9qc29uLCBwYXJhbXMpID0+IHtcclxuICAgIGNvbnN0IGlubmVyVHlwZSA9IHNjaGVtYS5fem9kLmlubmVyVHlwZTtcclxuICAgIHByb2Nlc3MoaW5uZXJUeXBlLCBjdHgsIHBhcmFtcyk7XHJcbiAgICBjb25zdCBzZWVuID0gY3R4LnNlZW4uZ2V0KHNjaGVtYSk7XHJcbiAgICBzZWVuLnJlZiA9IGlubmVyVHlwZTtcclxufTtcclxuLy8gPT09PT09PT09PT09PT09PT09PT0gQUxMIFBST0NFU1NPUlMgPT09PT09PT09PT09PT09PT09PT1cclxuZXhwb3J0IGNvbnN0IGFsbFByb2Nlc3NvcnMgPSB7XHJcbiAgICBzdHJpbmc6IHN0cmluZ1Byb2Nlc3NvcixcclxuICAgIG51bWJlcjogbnVtYmVyUHJvY2Vzc29yLFxyXG4gICAgYm9vbGVhbjogYm9vbGVhblByb2Nlc3NvcixcclxuICAgIGJpZ2ludDogYmlnaW50UHJvY2Vzc29yLFxyXG4gICAgc3ltYm9sOiBzeW1ib2xQcm9jZXNzb3IsXHJcbiAgICBudWxsOiBudWxsUHJvY2Vzc29yLFxyXG4gICAgdW5kZWZpbmVkOiB1bmRlZmluZWRQcm9jZXNzb3IsXHJcbiAgICB2b2lkOiB2b2lkUHJvY2Vzc29yLFxyXG4gICAgbmV2ZXI6IG5ldmVyUHJvY2Vzc29yLFxyXG4gICAgYW55OiBhbnlQcm9jZXNzb3IsXHJcbiAgICB1bmtub3duOiB1bmtub3duUHJvY2Vzc29yLFxyXG4gICAgZGF0ZTogZGF0ZVByb2Nlc3NvcixcclxuICAgIGVudW06IGVudW1Qcm9jZXNzb3IsXHJcbiAgICBsaXRlcmFsOiBsaXRlcmFsUHJvY2Vzc29yLFxyXG4gICAgbmFuOiBuYW5Qcm9jZXNzb3IsXHJcbiAgICB0ZW1wbGF0ZV9saXRlcmFsOiB0ZW1wbGF0ZUxpdGVyYWxQcm9jZXNzb3IsXHJcbiAgICBmaWxlOiBmaWxlUHJvY2Vzc29yLFxyXG4gICAgc3VjY2Vzczogc3VjY2Vzc1Byb2Nlc3NvcixcclxuICAgIGN1c3RvbTogY3VzdG9tUHJvY2Vzc29yLFxyXG4gICAgZnVuY3Rpb246IGZ1bmN0aW9uUHJvY2Vzc29yLFxyXG4gICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm1Qcm9jZXNzb3IsXHJcbiAgICBtYXA6IG1hcFByb2Nlc3NvcixcclxuICAgIHNldDogc2V0UHJvY2Vzc29yLFxyXG4gICAgYXJyYXk6IGFycmF5UHJvY2Vzc29yLFxyXG4gICAgb2JqZWN0OiBvYmplY3RQcm9jZXNzb3IsXHJcbiAgICB1bmlvbjogdW5pb25Qcm9jZXNzb3IsXHJcbiAgICBpbnRlcnNlY3Rpb246IGludGVyc2VjdGlvblByb2Nlc3NvcixcclxuICAgIHR1cGxlOiB0dXBsZVByb2Nlc3NvcixcclxuICAgIHJlY29yZDogcmVjb3JkUHJvY2Vzc29yLFxyXG4gICAgbnVsbGFibGU6IG51bGxhYmxlUHJvY2Vzc29yLFxyXG4gICAgbm9ub3B0aW9uYWw6IG5vbm9wdGlvbmFsUHJvY2Vzc29yLFxyXG4gICAgZGVmYXVsdDogZGVmYXVsdFByb2Nlc3NvcixcclxuICAgIHByZWZhdWx0OiBwcmVmYXVsdFByb2Nlc3NvcixcclxuICAgIGNhdGNoOiBjYXRjaFByb2Nlc3NvcixcclxuICAgIHBpcGU6IHBpcGVQcm9jZXNzb3IsXHJcbiAgICByZWFkb25seTogcmVhZG9ubHlQcm9jZXNzb3IsXHJcbiAgICBwcm9taXNlOiBwcm9taXNlUHJvY2Vzc29yLFxyXG4gICAgb3B0aW9uYWw6IG9wdGlvbmFsUHJvY2Vzc29yLFxyXG4gICAgbGF6eTogbGF6eVByb2Nlc3NvcixcclxufTtcclxuZXhwb3J0IGZ1bmN0aW9uIHRvSlNPTlNjaGVtYShpbnB1dCwgcGFyYW1zKSB7XHJcbiAgICBpZiAoXCJfaWRtYXBcIiBpbiBpbnB1dCkge1xyXG4gICAgICAgIC8vIFJlZ2lzdHJ5IGNhc2VcclxuICAgICAgICBjb25zdCByZWdpc3RyeSA9IGlucHV0O1xyXG4gICAgICAgIGNvbnN0IGN0eCA9IGluaXRpYWxpemVDb250ZXh0KHsgLi4ucGFyYW1zLCBwcm9jZXNzb3JzOiBhbGxQcm9jZXNzb3JzIH0pO1xyXG4gICAgICAgIGNvbnN0IGRlZnMgPSB7fTtcclxuICAgICAgICAvLyBGaXJzdCBwYXNzOiBwcm9jZXNzIGFsbCBzY2hlbWFzIHRvIGJ1aWxkIHRoZSBzZWVuIG1hcFxyXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgcmVnaXN0cnkuX2lkbWFwLmVudHJpZXMoKSkge1xyXG4gICAgICAgICAgICBjb25zdCBbXywgc2NoZW1hXSA9IGVudHJ5O1xyXG4gICAgICAgICAgICBwcm9jZXNzKHNjaGVtYSwgY3R4KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc2NoZW1hcyA9IHt9O1xyXG4gICAgICAgIGNvbnN0IGV4dGVybmFsID0ge1xyXG4gICAgICAgICAgICByZWdpc3RyeSxcclxuICAgICAgICAgICAgdXJpOiBwYXJhbXM/LnVyaSxcclxuICAgICAgICAgICAgZGVmcyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgY29udGV4dCB3aXRoIGV4dGVybmFsIGNvbmZpZ3VyYXRpb25cclxuICAgICAgICBjdHguZXh0ZXJuYWwgPSBleHRlcm5hbDtcclxuICAgICAgICAvLyBTZWNvbmQgcGFzczogZW1pdCBlYWNoIHNjaGVtYVxyXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgcmVnaXN0cnkuX2lkbWFwLmVudHJpZXMoKSkge1xyXG4gICAgICAgICAgICBjb25zdCBba2V5LCBzY2hlbWFdID0gZW50cnk7XHJcbiAgICAgICAgICAgIGV4dHJhY3REZWZzKGN0eCwgc2NoZW1hKTtcclxuICAgICAgICAgICAgc2NoZW1hc1trZXldID0gZmluYWxpemUoY3R4LCBzY2hlbWEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoT2JqZWN0LmtleXMoZGVmcykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBkZWZzU2VnbWVudCA9IGN0eC50YXJnZXQgPT09IFwiZHJhZnQtMjAyMC0xMlwiID8gXCIkZGVmc1wiIDogXCJkZWZpbml0aW9uc1wiO1xyXG4gICAgICAgICAgICBzY2hlbWFzLl9fc2hhcmVkID0ge1xyXG4gICAgICAgICAgICAgICAgW2RlZnNTZWdtZW50XTogZGVmcyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgc2NoZW1hcyB9O1xyXG4gICAgfVxyXG4gICAgLy8gU2luZ2xlIHNjaGVtYSBjYXNlXHJcbiAgICBjb25zdCBjdHggPSBpbml0aWFsaXplQ29udGV4dCh7IC4uLnBhcmFtcywgcHJvY2Vzc29yczogYWxsUHJvY2Vzc29ycyB9KTtcclxuICAgIHByb2Nlc3MoaW5wdXQsIGN0eCk7XHJcbiAgICBleHRyYWN0RGVmcyhjdHgsIGlucHV0KTtcclxuICAgIHJldHVybiBmaW5hbGl6ZShjdHgsIGlucHV0KTtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBjb3JlIGZyb20gXCIuLi9jb3JlL2luZGV4LmpzXCI7XHJcbmltcG9ydCAqIGFzIHNjaGVtYXMgZnJvbSBcIi4vc2NoZW1hcy5qc1wiO1xyXG5leHBvcnQgY29uc3QgWm9kSVNPRGF0ZVRpbWUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kSVNPRGF0ZVRpbWVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kSVNPRGF0ZVRpbWUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgc2NoZW1hcy5ab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGRhdGV0aW1lKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2lzb0RhdGVUaW1lKFpvZElTT0RhdGVUaW1lLCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RJU09EYXRlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZElTT0RhdGVcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kSVNPRGF0ZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBzY2hlbWFzLlpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gZGF0ZShwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9pc29EYXRlKFpvZElTT0RhdGUsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZElTT1RpbWUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kSVNPVGltZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RJU09UaW1lLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIHNjaGVtYXMuWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiB0aW1lKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2lzb1RpbWUoWm9kSVNPVGltZSwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kSVNPRHVyYXRpb24gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kSVNPRHVyYXRpb25cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kSVNPRHVyYXRpb24uaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgc2NoZW1hcy5ab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGR1cmF0aW9uKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2lzb0R1cmF0aW9uKFpvZElTT0R1cmF0aW9uLCBwYXJhbXMpO1xyXG59XHJcbiIsImltcG9ydCAqIGFzIGNvcmUgZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcclxuaW1wb3J0IHsgJFpvZEVycm9yIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcclxuaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi4vY29yZS91dGlsLmpzXCI7XHJcbmNvbnN0IGluaXRpYWxpemVyID0gKGluc3QsIGlzc3VlcykgPT4ge1xyXG4gICAgJFpvZEVycm9yLmluaXQoaW5zdCwgaXNzdWVzKTtcclxuICAgIGluc3QubmFtZSA9IFwiWm9kRXJyb3JcIjtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGluc3QsIHtcclxuICAgICAgICBmb3JtYXQ6IHtcclxuICAgICAgICAgICAgdmFsdWU6IChtYXBwZXIpID0+IGNvcmUuZm9ybWF0RXJyb3IoaW5zdCwgbWFwcGVyKSxcclxuICAgICAgICAgICAgLy8gZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmbGF0dGVuOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAobWFwcGVyKSA9PiBjb3JlLmZsYXR0ZW5FcnJvcihpbnN0LCBtYXBwZXIpLFxyXG4gICAgICAgICAgICAvLyBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFkZElzc3VlOiB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAoaXNzdWUpID0+IHtcclxuICAgICAgICAgICAgICAgIGluc3QuaXNzdWVzLnB1c2goaXNzdWUpO1xyXG4gICAgICAgICAgICAgICAgaW5zdC5tZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoaW5zdC5pc3N1ZXMsIHV0aWwuanNvblN0cmluZ2lmeVJlcGxhY2VyLCAyKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8gZW51bWVyYWJsZTogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRJc3N1ZXM6IHtcclxuICAgICAgICAgICAgdmFsdWU6IChpc3N1ZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIGluc3QuaXNzdWVzLnB1c2goLi4uaXNzdWVzKTtcclxuICAgICAgICAgICAgICAgIGluc3QubWVzc2FnZSA9IEpTT04uc3RyaW5naWZ5KGluc3QuaXNzdWVzLCB1dGlsLmpzb25TdHJpbmdpZnlSZXBsYWNlciwgMik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIGVudW1lcmFibGU6IGZhbHNlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNFbXB0eToge1xyXG4gICAgICAgICAgICBnZXQoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdC5pc3N1ZXMubGVuZ3RoID09PSAwO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAvLyBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbiAgICAvLyBPYmplY3QuZGVmaW5lUHJvcGVydHkoaW5zdCwgXCJpc0VtcHR5XCIsIHtcclxuICAgIC8vICAgZ2V0KCkge1xyXG4gICAgLy8gICAgIHJldHVybiBpbnN0Lmlzc3Vlcy5sZW5ndGggPT09IDA7XHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyB9KTtcclxufTtcclxuZXhwb3J0IGNvbnN0IFpvZEVycm9yID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEVycm9yXCIsIGluaXRpYWxpemVyKTtcclxuZXhwb3J0IGNvbnN0IFpvZFJlYWxFcnJvciA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RFcnJvclwiLCBpbml0aWFsaXplciwge1xyXG4gICAgUGFyZW50OiBFcnJvcixcclxufSk7XHJcbi8vIC8qKiBAZGVwcmVjYXRlZCBVc2UgYHouY29yZS4kWm9kRXJyb3JNYXBDdHhgIGluc3RlYWQuICovXHJcbi8vIGV4cG9ydCB0eXBlIEVycm9yTWFwQ3R4ID0gY29yZS4kWm9kRXJyb3JNYXBDdHg7XHJcbiIsImltcG9ydCAqIGFzIGNvcmUgZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcclxuaW1wb3J0IHsgWm9kUmVhbEVycm9yIH0gZnJvbSBcIi4vZXJyb3JzLmpzXCI7XHJcbmV4cG9ydCBjb25zdCBwYXJzZSA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9wYXJzZShab2RSZWFsRXJyb3IpO1xyXG5leHBvcnQgY29uc3QgcGFyc2VBc3luYyA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9wYXJzZUFzeW5jKFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBzYWZlUGFyc2UgPSAvKiBAX19QVVJFX18gKi8gY29yZS5fc2FmZVBhcnNlKFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBzYWZlUGFyc2VBc3luYyA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9zYWZlUGFyc2VBc3luYyhab2RSZWFsRXJyb3IpO1xyXG4vLyBDb2RlYyBmdW5jdGlvbnNcclxuZXhwb3J0IGNvbnN0IGVuY29kZSA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9lbmNvZGUoWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IGRlY29kZSA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9kZWNvZGUoWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IGVuY29kZUFzeW5jID0gLyogQF9fUFVSRV9fICovIGNvcmUuX2VuY29kZUFzeW5jKFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBkZWNvZGVBc3luYyA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9kZWNvZGVBc3luYyhab2RSZWFsRXJyb3IpO1xyXG5leHBvcnQgY29uc3Qgc2FmZUVuY29kZSA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9zYWZlRW5jb2RlKFpvZFJlYWxFcnJvcik7XHJcbmV4cG9ydCBjb25zdCBzYWZlRGVjb2RlID0gLyogQF9fUFVSRV9fICovIGNvcmUuX3NhZmVEZWNvZGUoWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IHNhZmVFbmNvZGVBc3luYyA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9zYWZlRW5jb2RlQXN5bmMoWm9kUmVhbEVycm9yKTtcclxuZXhwb3J0IGNvbnN0IHNhZmVEZWNvZGVBc3luYyA9IC8qIEBfX1BVUkVfXyAqLyBjb3JlLl9zYWZlRGVjb2RlQXN5bmMoWm9kUmVhbEVycm9yKTtcclxuIiwiaW1wb3J0ICogYXMgY29yZSBmcm9tIFwiLi4vY29yZS9pbmRleC5qc1wiO1xyXG5pbXBvcnQgeyB1dGlsIH0gZnJvbSBcIi4uL2NvcmUvaW5kZXguanNcIjtcclxuaW1wb3J0ICogYXMgcHJvY2Vzc29ycyBmcm9tIFwiLi4vY29yZS9qc29uLXNjaGVtYS1wcm9jZXNzb3JzLmpzXCI7XHJcbmltcG9ydCB7IGNyZWF0ZVN0YW5kYXJkSlNPTlNjaGVtYU1ldGhvZCwgY3JlYXRlVG9KU09OU2NoZW1hTWV0aG9kIH0gZnJvbSBcIi4uL2NvcmUvdG8tanNvbi1zY2hlbWEuanNcIjtcclxuaW1wb3J0ICogYXMgY2hlY2tzIGZyb20gXCIuL2NoZWNrcy5qc1wiO1xyXG5pbXBvcnQgKiBhcyBpc28gZnJvbSBcIi4vaXNvLmpzXCI7XHJcbmltcG9ydCAqIGFzIHBhcnNlIGZyb20gXCIuL3BhcnNlLmpzXCI7XHJcbi8vIExhenktYmluZCBidWlsZGVyIG1ldGhvZHMuXHJcbi8vXHJcbi8vIEJ1aWxkZXIgbWV0aG9kcyAoYC5vcHRpb25hbGAsIGAuYXJyYXlgLCBgLnJlZmluZWAsIC4uLikgbGl2ZSBhc1xyXG4vLyBub24tZW51bWVyYWJsZSBnZXR0ZXJzIG9uIGVhY2ggY29uY3JldGUgc2NoZW1hIGNvbnN0cnVjdG9yJ3NcclxuLy8gcHJvdG90eXBlLiBPbiBmaXJzdCBhY2Nlc3MgZnJvbSBhbiBpbnN0YW5jZSB0aGUgZ2V0dGVyIGFsbG9jYXRlc1xyXG4vLyBgZm4uYmluZCh0aGlzKWAgYW5kIGNhY2hlcyBpdCBhcyBhbiBvd24gcHJvcGVydHkgb24gdGhhdCBpbnN0YW5jZSxcclxuLy8gc28gZGV0YWNoZWQgdXNhZ2UgKGBjb25zdCBtID0gc2NoZW1hLm9wdGlvbmFsOyBtKClgKSBzdGlsbCB3b3Jrc1xyXG4vLyBhbmQgdGhlIHBlci1pbnN0YW5jZSBhbGxvY2F0aW9uIG9ubHkgaGFwcGVucyBmb3IgbWV0aG9kcyBhY3R1YWxseVxyXG4vLyB0b3VjaGVkLlxyXG4vL1xyXG4vLyBPbmUgaW5zdGFsbCBwZXIgKHByb3RvdHlwZSwgZ3JvdXApLCBtZW1vaXplZCBieSBgX2luc3RhbGxlZEdyb3Vwc2AuXHJcbmNvbnN0IF9pbnN0YWxsZWRHcm91cHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtNYXAoKTtcclxuZnVuY3Rpb24gX2luc3RhbGxMYXp5TWV0aG9kcyhpbnN0LCBncm91cCwgbWV0aG9kcykge1xyXG4gICAgY29uc3QgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoaW5zdCk7XHJcbiAgICBsZXQgaW5zdGFsbGVkID0gX2luc3RhbGxlZEdyb3Vwcy5nZXQocHJvdG8pO1xyXG4gICAgaWYgKCFpbnN0YWxsZWQpIHtcclxuICAgICAgICBpbnN0YWxsZWQgPSBuZXcgU2V0KCk7XHJcbiAgICAgICAgX2luc3RhbGxlZEdyb3Vwcy5zZXQocHJvdG8sIGluc3RhbGxlZCk7XHJcbiAgICB9XHJcbiAgICBpZiAoaW5zdGFsbGVkLmhhcyhncm91cCkpXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgaW5zdGFsbGVkLmFkZChncm91cCk7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBtZXRob2RzKSB7XHJcbiAgICAgICAgY29uc3QgZm4gPSBtZXRob2RzW2tleV07XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3RvLCBrZXksIHtcclxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgZ2V0KCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYm91bmQgPSBmbi5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGtleSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBib3VuZCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQodikge1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGtleSwge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2LFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFR5cGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kVHlwZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIE9iamVjdC5hc3NpZ24oaW5zdFtcIn5zdGFuZGFyZFwiXSwge1xyXG4gICAgICAgIGpzb25TY2hlbWE6IHtcclxuICAgICAgICAgICAgaW5wdXQ6IGNyZWF0ZVN0YW5kYXJkSlNPTlNjaGVtYU1ldGhvZChpbnN0LCBcImlucHV0XCIpLFxyXG4gICAgICAgICAgICBvdXRwdXQ6IGNyZWF0ZVN0YW5kYXJkSlNPTlNjaGVtYU1ldGhvZChpbnN0LCBcIm91dHB1dFwiKSxcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbiAgICBpbnN0LnRvSlNPTlNjaGVtYSA9IGNyZWF0ZVRvSlNPTlNjaGVtYU1ldGhvZChpbnN0LCB7fSk7XHJcbiAgICBpbnN0LmRlZiA9IGRlZjtcclxuICAgIGluc3QudHlwZSA9IGRlZi50eXBlO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3QsIFwiX2RlZlwiLCB7IHZhbHVlOiBkZWYgfSk7XHJcbiAgICAvLyBQYXJzZS1mYW1pbHkgaXMgaW50ZW50aW9uYWxseSBrZXB0IGFzIHBlci1pbnN0YW5jZSBjbG9zdXJlczogdGhlc2UgYXJlXHJcbiAgICAvLyB0aGUgaG90IHBhdGggQU5EIHRoZSBtb3N0LWRldGFjaGVkIG1ldGhvZHMgKGBhcnIubWFwKHNjaGVtYS5wYXJzZSlgLFxyXG4gICAgLy8gYGNvbnN0IHsgcGFyc2UgfSA9IHNjaGVtYWAsIGV0Yy4pLiBFYWdlciBjbG9zdXJlcyBoZXJlIG1lYW4gY2FsbGVycyBwYXlcclxuICAgIC8vIH4xMiBjbG9zdXJlIGFsbG9jYXRpb25zIHBlciBzY2hlbWEgYnV0IGdldCBtb25vbW9ycGhpYyBjYWxsIHNpdGVzIGFuZFxyXG4gICAgLy8gZGV0YWNoZWQgdXNhZ2UgdGhhdCBcImp1c3Qgd29ya3NcIi5cclxuICAgIGluc3QucGFyc2UgPSAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5wYXJzZShpbnN0LCBkYXRhLCBwYXJhbXMsIHsgY2FsbGVlOiBpbnN0LnBhcnNlIH0pO1xyXG4gICAgaW5zdC5zYWZlUGFyc2UgPSAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5zYWZlUGFyc2UoaW5zdCwgZGF0YSwgcGFyYW1zKTtcclxuICAgIGluc3QucGFyc2VBc3luYyA9IGFzeW5jIChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLnBhcnNlQXN5bmMoaW5zdCwgZGF0YSwgcGFyYW1zLCB7IGNhbGxlZTogaW5zdC5wYXJzZUFzeW5jIH0pO1xyXG4gICAgaW5zdC5zYWZlUGFyc2VBc3luYyA9IGFzeW5jIChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLnNhZmVQYXJzZUFzeW5jKGluc3QsIGRhdGEsIHBhcmFtcyk7XHJcbiAgICBpbnN0LnNwYSA9IGluc3Quc2FmZVBhcnNlQXN5bmM7XHJcbiAgICBpbnN0LmVuY29kZSA9IChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLmVuY29kZShpbnN0LCBkYXRhLCBwYXJhbXMpO1xyXG4gICAgaW5zdC5kZWNvZGUgPSAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5kZWNvZGUoaW5zdCwgZGF0YSwgcGFyYW1zKTtcclxuICAgIGluc3QuZW5jb2RlQXN5bmMgPSBhc3luYyAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5lbmNvZGVBc3luYyhpbnN0LCBkYXRhLCBwYXJhbXMpO1xyXG4gICAgaW5zdC5kZWNvZGVBc3luYyA9IGFzeW5jIChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLmRlY29kZUFzeW5jKGluc3QsIGRhdGEsIHBhcmFtcyk7XHJcbiAgICBpbnN0LnNhZmVFbmNvZGUgPSAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5zYWZlRW5jb2RlKGluc3QsIGRhdGEsIHBhcmFtcyk7XHJcbiAgICBpbnN0LnNhZmVEZWNvZGUgPSAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5zYWZlRGVjb2RlKGluc3QsIGRhdGEsIHBhcmFtcyk7XHJcbiAgICBpbnN0LnNhZmVFbmNvZGVBc3luYyA9IGFzeW5jIChkYXRhLCBwYXJhbXMpID0+IHBhcnNlLnNhZmVFbmNvZGVBc3luYyhpbnN0LCBkYXRhLCBwYXJhbXMpO1xyXG4gICAgaW5zdC5zYWZlRGVjb2RlQXN5bmMgPSBhc3luYyAoZGF0YSwgcGFyYW1zKSA9PiBwYXJzZS5zYWZlRGVjb2RlQXN5bmMoaW5zdCwgZGF0YSwgcGFyYW1zKTtcclxuICAgIC8vIEFsbCBidWlsZGVyIG1ldGhvZHMgYXJlIHBsYWNlZCBvbiB0aGUgaW50ZXJuYWwgcHJvdG90eXBlIGFzIGxhenktYmluZFxyXG4gICAgLy8gZ2V0dGVycy4gT24gZmlyc3QgYWNjZXNzIHBlci1pbnN0YW5jZSwgYSBib3VuZCB0aHVuayBpcyBhbGxvY2F0ZWQgYW5kXHJcbiAgICAvLyBjYWNoZWQgYXMgYW4gb3duIHByb3BlcnR5OyBzdWJzZXF1ZW50IGFjY2Vzc2VzIHNraXAgdGhlIGdldHRlci4gVGhpc1xyXG4gICAgLy8gbWVhbnM6IG5vIHBlci1pbnN0YW5jZSBhbGxvY2F0aW9uIGZvciB1bnVzZWQgbWV0aG9kcywgZnVsbFxyXG4gICAgLy8gZGV0YWNoYWJpbGl0eSBwcmVzZXJ2ZWQgKGBjb25zdCBtID0gc2NoZW1hLm9wdGlvbmFsOyBtKClgIHdvcmtzKSwgYW5kXHJcbiAgICAvLyBzaGFyZWQgdW5kZXJseWluZyBmdW5jdGlvbiByZWZlcmVuY2VzIGFjcm9zcyBhbGwgaW5zdGFuY2VzLlxyXG4gICAgX2luc3RhbGxMYXp5TWV0aG9kcyhpbnN0LCBcIlpvZFR5cGVcIiwge1xyXG4gICAgICAgIGNoZWNrKC4uLmNoa3MpIHtcclxuICAgICAgICAgICAgY29uc3QgZGVmID0gdGhpcy5kZWY7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKHV0aWwubWVyZ2VEZWZzKGRlZiwge1xyXG4gICAgICAgICAgICAgICAgY2hlY2tzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgLi4uKGRlZi5jaGVja3MgPz8gW10pLFxyXG4gICAgICAgICAgICAgICAgICAgIC4uLmNoa3MubWFwKChjaCkgPT4gdHlwZW9mIGNoID09PSBcImZ1bmN0aW9uXCIgPyB7IF96b2Q6IHsgY2hlY2s6IGNoLCBkZWY6IHsgY2hlY2s6IFwiY3VzdG9tXCIgfSwgb25hdHRhY2g6IFtdIH0gfSA6IGNoKSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH0pLCB7IHBhcmVudDogdHJ1ZSB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHdpdGgoLi4uY2hrcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayguLi5jaGtzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsb25lKGRlZiwgcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb3JlLmNsb25lKHRoaXMsIGRlZiwgcGFyYW1zKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJyYW5kKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZ2lzdGVyKHJlZywgbWV0YSkge1xyXG4gICAgICAgICAgICByZWcuYWRkKHRoaXMsIG1ldGEpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZmluZShjaGVjaywgcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKHJlZmluZShjaGVjaywgcGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdXBlclJlZmluZShyZWZpbmVtZW50LCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soc3VwZXJSZWZpbmUocmVmaW5lbWVudCwgcGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvdmVyd3JpdGUoZm4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm92ZXJ3cml0ZShmbikpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3B0aW9uYWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25hbCh0aGlzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4YWN0T3B0aW9uYWwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBleGFjdE9wdGlvbmFsKHRoaXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbnVsbGFibGUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsYWJsZSh0aGlzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG51bGxpc2goKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25hbChudWxsYWJsZSh0aGlzKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBub25vcHRpb25hbChwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5vbm9wdGlvbmFsKHRoaXMsIHBhcmFtcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhcnJheSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5KHRoaXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3IoYXJnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmlvbihbdGhpcywgYXJnXSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhbmQoYXJnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnRlcnNlY3Rpb24odGhpcywgYXJnKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRyYW5zZm9ybSh0eCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGlwZSh0aGlzLCB0cmFuc2Zvcm0odHgpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlZmF1bHQoZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gX2RlZmF1bHQodGhpcywgZCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwcmVmYXVsdChkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwcmVmYXVsdCh0aGlzLCBkKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNhdGNoKHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gX2NhdGNoKHRoaXMsIHBhcmFtcyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwaXBlKHRhcmdldCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGlwZSh0aGlzLCB0YXJnZXQpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVhZG9ubHkoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZWFkb25seSh0aGlzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlc2NyaWJlKGRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsID0gdGhpcy5jbG9uZSgpO1xyXG4gICAgICAgICAgICBjb3JlLmdsb2JhbFJlZ2lzdHJ5LmFkZChjbCwgeyBkZXNjcmlwdGlvbiB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGNsO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0YSguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIC8vIG92ZXJsb2FkZWQ6IG1ldGEoKSByZXR1cm5zIHRoZSByZWdpc3RlcmVkIG1ldGFkYXRhLCBtZXRhKGRhdGEpXHJcbiAgICAgICAgICAgIC8vIHJldHVybnMgYSBjbG9uZSB3aXRoIGBkYXRhYCByZWdpc3RlcmVkLiBUaGUgbWFwcGVkIHR5cGUgcGlja3NcclxuICAgICAgICAgICAgLy8gdXAgdGhlIHNlY29uZCBvdmVybG9hZCwgc28gd2UgYWNjZXB0IHZhcmlhZGljIGFueS1hcmdzIGFuZFxyXG4gICAgICAgICAgICAvLyByZXR1cm4gYGFueWAgdG8gc2F0aXNmeSBib3RoIGF0IHJ1bnRpbWUuXHJcbiAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb3JlLmdsb2JhbFJlZ2lzdHJ5LmdldCh0aGlzKTtcclxuICAgICAgICAgICAgY29uc3QgY2wgPSB0aGlzLmNsb25lKCk7XHJcbiAgICAgICAgICAgIGNvcmUuZ2xvYmFsUmVnaXN0cnkuYWRkKGNsLCBhcmdzWzBdKTtcclxuICAgICAgICAgICAgcmV0dXJuIGNsO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNPcHRpb25hbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2FmZVBhcnNlKHVuZGVmaW5lZCkuc3VjY2VzcztcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzTnVsbGFibGUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNhZmVQYXJzZShudWxsKS5zdWNjZXNzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXBwbHkoZm4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZuKHRoaXMpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpbnN0LCBcImRlc2NyaXB0aW9uXCIsIHtcclxuICAgICAgICBnZXQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb3JlLmdsb2JhbFJlZ2lzdHJ5LmdldChpbnN0KT8uZGVzY3JpcHRpb247XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICB9KTtcclxuICAgIHJldHVybiBpbnN0O1xyXG59KTtcclxuLyoqIEBpbnRlcm5hbCAqL1xyXG5leHBvcnQgY29uc3QgX1pvZFN0cmluZyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJfWm9kU3RyaW5nXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFN0cmluZy5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5zdHJpbmdQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcclxuICAgIGluc3QuZm9ybWF0ID0gYmFnLmZvcm1hdCA/PyBudWxsO1xyXG4gICAgaW5zdC5taW5MZW5ndGggPSBiYWcubWluaW11bSA/PyBudWxsO1xyXG4gICAgaW5zdC5tYXhMZW5ndGggPSBiYWcubWF4aW11bSA/PyBudWxsO1xyXG4gICAgX2luc3RhbGxMYXp5TWV0aG9kcyhpbnN0LCBcIl9ab2RTdHJpbmdcIiwge1xyXG4gICAgICAgIHJlZ2V4KC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLnJlZ2V4KC4uLmFyZ3MpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluY2x1ZGVzKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmluY2x1ZGVzKC4uLmFyZ3MpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0YXJ0c1dpdGgoLi4uYXJncykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3Muc3RhcnRzV2l0aCguLi5hcmdzKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmRzV2l0aCguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5lbmRzV2l0aCguLi5hcmdzKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtaW4oLi4uYXJncykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubWluTGVuZ3RoKC4uLmFyZ3MpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1heCguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5tYXhMZW5ndGgoLi4uYXJncykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGVuZ3RoKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmxlbmd0aCguLi5hcmdzKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBub25lbXB0eSguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5taW5MZW5ndGgoMSwgLi4uYXJncykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbG93ZXJjYXNlKHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubG93ZXJjYXNlKHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBwZXJjYXNlKHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MudXBwZXJjYXNlKHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdHJpbSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLnRyaW0oKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBub3JtYWxpemUoLi4uYXJncykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3Mubm9ybWFsaXplKC4uLmFyZ3MpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvTG93ZXJDYXNlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MudG9Mb3dlckNhc2UoKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0b1VwcGVyQ2FzZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLnRvVXBwZXJDYXNlKCkpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2x1Z2lmeSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLnNsdWdpZnkoKSk7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0IFpvZFN0cmluZyA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RTdHJpbmdcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kU3RyaW5nLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIF9ab2RTdHJpbmcuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5lbWFpbCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fZW1haWwoWm9kRW1haWwsIHBhcmFtcykpO1xyXG4gICAgaW5zdC51cmwgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX3VybChab2RVUkwsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5qd3QgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2p3dChab2RKV1QsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5lbW9qaSA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fZW1vamkoWm9kRW1vamksIHBhcmFtcykpO1xyXG4gICAgaW5zdC5ndWlkID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9ndWlkKFpvZEdVSUQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC51dWlkID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl91dWlkKFpvZFVVSUQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC51dWlkdjQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX3V1aWR2NChab2RVVUlELCBwYXJhbXMpKTtcclxuICAgIGluc3QudXVpZHY2ID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl91dWlkdjYoWm9kVVVJRCwgcGFyYW1zKSk7XHJcbiAgICBpbnN0LnV1aWR2NyA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fdXVpZHY3KFpvZFVVSUQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5uYW5vaWQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX25hbm9pZChab2ROYW5vSUQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5ndWlkID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9ndWlkKFpvZEdVSUQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5jdWlkID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9jdWlkKFpvZENVSUQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5jdWlkMiA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fY3VpZDIoWm9kQ1VJRDIsIHBhcmFtcykpO1xyXG4gICAgaW5zdC51bGlkID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl91bGlkKFpvZFVMSUQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5iYXNlNjQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2Jhc2U2NChab2RCYXNlNjQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5iYXNlNjR1cmwgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2Jhc2U2NHVybChab2RCYXNlNjRVUkwsIHBhcmFtcykpO1xyXG4gICAgaW5zdC54aWQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX3hpZChab2RYSUQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5rc3VpZCA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fa3N1aWQoWm9kS1NVSUQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5pcHY0ID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9pcHY0KFpvZElQdjQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5pcHY2ID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9pcHY2KFpvZElQdjYsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5jaWRydjQgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2NpZHJ2NChab2RDSURSdjQsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5jaWRydjYgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNvcmUuX2NpZHJ2Nihab2RDSURSdjYsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5lMTY0ID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9lMTY0KFpvZEUxNjQsIHBhcmFtcykpO1xyXG4gICAgLy8gaXNvXHJcbiAgICBpbnN0LmRhdGV0aW1lID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhpc28uZGF0ZXRpbWUocGFyYW1zKSk7XHJcbiAgICBpbnN0LmRhdGUgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGlzby5kYXRlKHBhcmFtcykpO1xyXG4gICAgaW5zdC50aW1lID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhpc28udGltZShwYXJhbXMpKTtcclxuICAgIGluc3QuZHVyYXRpb24gPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGlzby5kdXJhdGlvbihwYXJhbXMpKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmcocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fc3RyaW5nKFpvZFN0cmluZywgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kU3RyaW5nRm9ybWF0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFN0cmluZ0Zvcm1hdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgX1pvZFN0cmluZy5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgY29uc3QgWm9kRW1haWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kRW1haWxcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvcmUuJFpvZEVtYWlsLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gZW1haWwocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fZW1haWwoWm9kRW1haWwsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEdVSUQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kR1VJRFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kR1VJRC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGd1aWQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fZ3VpZChab2RHVUlELCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RVVUlEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFVVSURcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvcmUuJFpvZFVVSUQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiB1dWlkKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX3V1aWQoWm9kVVVJRCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gdXVpZHY0KHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX3V1aWR2NChab2RVVUlELCBwYXJhbXMpO1xyXG59XHJcbi8vIFpvZFVVSUR2NlxyXG5leHBvcnQgZnVuY3Rpb24gdXVpZHY2KHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX3V1aWR2Nihab2RVVUlELCBwYXJhbXMpO1xyXG59XHJcbi8vIFpvZFVVSUR2N1xyXG5leHBvcnQgZnVuY3Rpb24gdXVpZHY3KHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX3V1aWR2Nyhab2RVVUlELCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RVUkwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kVVJMXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RVUkwuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiB1cmwocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fdXJsKFpvZFVSTCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaHR0cFVybChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl91cmwoWm9kVVJMLCB7XHJcbiAgICAgICAgcHJvdG9jb2w6IGNvcmUucmVnZXhlcy5odHRwUHJvdG9jb2wsXHJcbiAgICAgICAgaG9zdG5hbWU6IGNvcmUucmVnZXhlcy5kb21haW4sXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RFbW9qaSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RFbW9qaVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kRW1vamkuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBlbW9qaShwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9lbW9qaShab2RFbW9qaSwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kTmFub0lEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE5hbm9JRFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kTmFub0lELmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gbmFub2lkKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX25hbm9pZChab2ROYW5vSUQsIHBhcmFtcyk7XHJcbn1cclxuLyoqXHJcbiAqIEBkZXByZWNhdGVkIENVSUQgdjEgaXMgZGVwcmVjYXRlZCBieSBpdHMgYXV0aG9ycyBkdWUgdG8gaW5mb3JtYXRpb24gbGVha2FnZVxyXG4gKiAodGltZXN0YW1wcyBlbWJlZGRlZCBpbiB0aGUgaWQpLiBVc2Uge0BsaW5rIFpvZENVSUQyfSBpbnN0ZWFkLlxyXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BhcmFsbGVsZHJpdmUvY3VpZC5cclxuICovXHJcbmV4cG9ydCBjb25zdCBab2RDVUlEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZENVSURcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvcmUuJFpvZENVSUQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgYSBDVUlEIHYxIHN0cmluZy5cclxuICpcclxuICogQGRlcHJlY2F0ZWQgQ1VJRCB2MSBpcyBkZXByZWNhdGVkIGJ5IGl0cyBhdXRob3JzIGR1ZSB0byBpbmZvcm1hdGlvbiBsZWFrYWdlXHJcbiAqICh0aW1lc3RhbXBzIGVtYmVkZGVkIGluIHRoZSBpZCkuIFVzZSB7QGxpbmsgY3VpZDIgfCBgei5jdWlkMigpYH0gaW5zdGVhZC5cclxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXJhbGxlbGRyaXZlL2N1aWQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3VpZChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9jdWlkKFpvZENVSUQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZENVSUQyID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZENVSUQyXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RDVUlEMi5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGN1aWQyKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2N1aWQyKFpvZENVSUQyLCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RVTElEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFVMSURcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvcmUuJFpvZFVMSUQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiB1bGlkKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX3VsaWQoWm9kVUxJRCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kWElEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFhJRFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kWElELmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24geGlkKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX3hpZChab2RYSUQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEtTVUlEID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEtTVUlEXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RLU1VJRC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGtzdWlkKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2tzdWlkKFpvZEtTVUlELCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RJUHY0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZElQdjRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgLy8gWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvcmUuJFpvZElQdjQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBpcHY0KHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2lwdjQoWm9kSVB2NCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kTUFDID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE1BQ1wiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kTUFDLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gbWFjKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX21hYyhab2RNQUMsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZElQdjYgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kSVB2NlwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kSVB2Ni5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGlwdjYocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5faXB2Nihab2RJUHY2LCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RDSURSdjQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ0lEUnY0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZENJRFJ2NC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGNpZHJ2NChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9jaWRydjQoWm9kQ0lEUnY0LCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RDSURSdjYgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ0lEUnY2XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZENJRFJ2Ni5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGNpZHJ2NihwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9jaWRydjYoWm9kQ0lEUnY2LCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RCYXNlNjQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQmFzZTY0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RCYXNlNjQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBiYXNlNjQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fYmFzZTY0KFpvZEJhc2U2NCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kQmFzZTY0VVJMID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEJhc2U2NFVSTFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kQmFzZTY0VVJMLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gYmFzZTY0dXJsKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2Jhc2U2NHVybChab2RCYXNlNjRVUkwsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEUxNjQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kRTE2NFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kRTE2NC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGUxNjQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fZTE2NChab2RFMTY0LCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RKV1QgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kSldUXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIC8vIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBjb3JlLiRab2RKV1QuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBqd3QocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fand0KFpvZEpXVCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kQ3VzdG9tU3RyaW5nRm9ybWF0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEN1c3RvbVN0cmluZ0Zvcm1hdFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICAvLyBab2RTdHJpbmdGb3JtYXQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kQ3VzdG9tU3RyaW5nRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFN0cmluZ0Zvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nRm9ybWF0KGZvcm1hdCwgZm5PclJlZ2V4LCBfcGFyYW1zID0ge30pIHtcclxuICAgIHJldHVybiBjb3JlLl9zdHJpbmdGb3JtYXQoWm9kQ3VzdG9tU3RyaW5nRm9ybWF0LCBmb3JtYXQsIGZuT3JSZWdleCwgX3BhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGhvc3RuYW1lKF9wYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9zdHJpbmdGb3JtYXQoWm9kQ3VzdG9tU3RyaW5nRm9ybWF0LCBcImhvc3RuYW1lXCIsIGNvcmUucmVnZXhlcy5ob3N0bmFtZSwgX3BhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGhleChfcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fc3RyaW5nRm9ybWF0KFpvZEN1c3RvbVN0cmluZ0Zvcm1hdCwgXCJoZXhcIiwgY29yZS5yZWdleGVzLmhleCwgX3BhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGhhc2goYWxnLCBwYXJhbXMpIHtcclxuICAgIGNvbnN0IGVuYyA9IHBhcmFtcz8uZW5jID8/IFwiaGV4XCI7XHJcbiAgICBjb25zdCBmb3JtYXQgPSBgJHthbGd9XyR7ZW5jfWA7XHJcbiAgICBjb25zdCByZWdleCA9IGNvcmUucmVnZXhlc1tmb3JtYXRdO1xyXG4gICAgaWYgKCFyZWdleClcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVucmVjb2duaXplZCBoYXNoIGZvcm1hdDogJHtmb3JtYXR9YCk7XHJcbiAgICByZXR1cm4gY29yZS5fc3RyaW5nRm9ybWF0KFpvZEN1c3RvbVN0cmluZ0Zvcm1hdCwgZm9ybWF0LCByZWdleCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kTnVtYmVyID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE51bWJlclwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2ROdW1iZXIuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMubnVtYmVyUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIF9pbnN0YWxsTGF6eU1ldGhvZHMoaW5zdCwgXCJab2ROdW1iZXJcIiwge1xyXG4gICAgICAgIGd0KHZhbHVlLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmd0KHZhbHVlLCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGd0ZSh2YWx1ZSwgcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5ndGUodmFsdWUsIHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWluKHZhbHVlLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmd0ZSh2YWx1ZSwgcGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsdCh2YWx1ZSwgcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5sdCh2YWx1ZSwgcGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsdGUodmFsdWUsIHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhjaGVja3MubHRlKHZhbHVlLCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1heCh2YWx1ZSwgcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5sdGUodmFsdWUsIHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW50KHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhpbnQocGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzYWZlKHBhcmFtcykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVjayhpbnQocGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwb3NpdGl2ZShwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmd0KDAsIHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbm9ubmVnYXRpdmUocGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5ndGUoMCwgcGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBuZWdhdGl2ZShwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmx0KDAsIHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbm9ucG9zaXRpdmUocGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5sdGUoMCwgcGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtdWx0aXBsZU9mKHZhbHVlLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm11bHRpcGxlT2YodmFsdWUsIHBhcmFtcykpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RlcCh2YWx1ZSwgcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5tdWx0aXBsZU9mKHZhbHVlLCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZpbml0ZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgY29uc3QgYmFnID0gaW5zdC5fem9kLmJhZztcclxuICAgIGluc3QubWluVmFsdWUgPVxyXG4gICAgICAgIE1hdGgubWF4KGJhZy5taW5pbXVtID8/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgYmFnLmV4Y2x1c2l2ZU1pbmltdW0gPz8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKSA/PyBudWxsO1xyXG4gICAgaW5zdC5tYXhWYWx1ZSA9XHJcbiAgICAgICAgTWF0aC5taW4oYmFnLm1heGltdW0gPz8gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLCBiYWcuZXhjbHVzaXZlTWF4aW11bSA/PyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpID8/IG51bGw7XHJcbiAgICBpbnN0LmlzSW50ID0gKGJhZy5mb3JtYXQgPz8gXCJcIikuaW5jbHVkZXMoXCJpbnRcIikgfHwgTnVtYmVyLmlzU2FmZUludGVnZXIoYmFnLm11bHRpcGxlT2YgPz8gMC41KTtcclxuICAgIGluc3QuaXNGaW5pdGUgPSB0cnVlO1xyXG4gICAgaW5zdC5mb3JtYXQgPSBiYWcuZm9ybWF0ID8/IG51bGw7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX251bWJlcihab2ROdW1iZXIsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZE51bWJlckZvcm1hdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2ROdW1iZXJGb3JtYXRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kTnVtYmVyRm9ybWF0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZE51bWJlci5pbml0KGluc3QsIGRlZik7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gaW50KHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2ludChab2ROdW1iZXJGb3JtYXQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGZsb2F0MzIocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fZmxvYXQzMihab2ROdW1iZXJGb3JtYXQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGZsb2F0NjQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fZmxvYXQ2NChab2ROdW1iZXJGb3JtYXQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGludDMyKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2ludDMyKFpvZE51bWJlckZvcm1hdCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gdWludDMyKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX3VpbnQzMihab2ROdW1iZXJGb3JtYXQsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEJvb2xlYW4gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQm9vbGVhblwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RCb29sZWFuLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmJvb2xlYW5Qcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGJvb2xlYW4ocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fYm9vbGVhbihab2RCb29sZWFuLCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RCaWdJbnQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQmlnSW50XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZEJpZ0ludC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5iaWdpbnRQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC5ndGUgPSAodmFsdWUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MuZ3RlKHZhbHVlLCBwYXJhbXMpKTtcclxuICAgIGluc3QubWluID0gKHZhbHVlLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmd0ZSh2YWx1ZSwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lmd0ID0gKHZhbHVlLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmd0KHZhbHVlLCBwYXJhbXMpKTtcclxuICAgIGluc3QuZ3RlID0gKHZhbHVlLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmd0ZSh2YWx1ZSwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lm1pbiA9ICh2YWx1ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5ndGUodmFsdWUsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5sdCA9ICh2YWx1ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5sdCh2YWx1ZSwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lmx0ZSA9ICh2YWx1ZSwgcGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5sdGUodmFsdWUsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5tYXggPSAodmFsdWUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MubHRlKHZhbHVlLCBwYXJhbXMpKTtcclxuICAgIGluc3QucG9zaXRpdmUgPSAocGFyYW1zKSA9PiBpbnN0LmNoZWNrKGNoZWNrcy5ndChCaWdJbnQoMCksIHBhcmFtcykpO1xyXG4gICAgaW5zdC5uZWdhdGl2ZSA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmx0KEJpZ0ludCgwKSwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lm5vbnBvc2l0aXZlID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MubHRlKEJpZ0ludCgwKSwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lm5vbm5lZ2F0aXZlID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MuZ3RlKEJpZ0ludCgwKSwgcGFyYW1zKSk7XHJcbiAgICBpbnN0Lm11bHRpcGxlT2YgPSAodmFsdWUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MubXVsdGlwbGVPZih2YWx1ZSwgcGFyYW1zKSk7XHJcbiAgICBjb25zdCBiYWcgPSBpbnN0Ll96b2QuYmFnO1xyXG4gICAgaW5zdC5taW5WYWx1ZSA9IGJhZy5taW5pbXVtID8/IG51bGw7XHJcbiAgICBpbnN0Lm1heFZhbHVlID0gYmFnLm1heGltdW0gPz8gbnVsbDtcclxuICAgIGluc3QuZm9ybWF0ID0gYmFnLmZvcm1hdCA/PyBudWxsO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGJpZ2ludChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9iaWdpbnQoWm9kQmlnSW50LCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RCaWdJbnRGb3JtYXQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQmlnSW50Rm9ybWF0XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZEJpZ0ludEZvcm1hdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RCaWdJbnQuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuLy8gaW50NjRcclxuZXhwb3J0IGZ1bmN0aW9uIGludDY0KHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2ludDY0KFpvZEJpZ0ludEZvcm1hdCwgcGFyYW1zKTtcclxufVxyXG4vLyB1aW50NjRcclxuZXhwb3J0IGZ1bmN0aW9uIHVpbnQ2NChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl91aW50NjQoWm9kQmlnSW50Rm9ybWF0LCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RTeW1ib2wgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kU3ltYm9sXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFN5bWJvbC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5zeW1ib2xQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIHN5bWJvbChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9zeW1ib2woWm9kU3ltYm9sLCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RVbmRlZmluZWQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kVW5kZWZpbmVkXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFVuZGVmaW5lZC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy51bmRlZmluZWRQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG59KTtcclxuZnVuY3Rpb24gX3VuZGVmaW5lZChwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl91bmRlZmluZWQoWm9kVW5kZWZpbmVkLCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCB7IF91bmRlZmluZWQgYXMgdW5kZWZpbmVkIH07XHJcbmV4cG9ydCBjb25zdCBab2ROdWxsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE51bGxcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kTnVsbC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5udWxsUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxufSk7XHJcbmZ1bmN0aW9uIF9udWxsKHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX251bGwoWm9kTnVsbCwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgeyBfbnVsbCBhcyBudWxsIH07XHJcbmV4cG9ydCBjb25zdCBab2RBbnkgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQW55XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZEFueS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5hbnlQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGFueSgpIHtcclxuICAgIHJldHVybiBjb3JlLl9hbnkoWm9kQW55KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kVW5rbm93biA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RVbmtub3duXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFVua25vd24uaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMudW5rbm93blByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gdW5rbm93bigpIHtcclxuICAgIHJldHVybiBjb3JlLl91bmtub3duKFpvZFVua25vd24pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2ROZXZlciA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2ROZXZlclwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2ROZXZlci5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5uZXZlclByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gbmV2ZXIocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fbmV2ZXIoWm9kTmV2ZXIsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFZvaWQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kVm9pZFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RWb2lkLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnZvaWRQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG59KTtcclxuZnVuY3Rpb24gX3ZvaWQocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fdm9pZChab2RWb2lkLCBwYXJhbXMpO1xyXG59XHJcbmV4cG9ydCB7IF92b2lkIGFzIHZvaWQgfTtcclxuZXhwb3J0IGNvbnN0IFpvZERhdGUgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kRGF0ZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2REYXRlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmRhdGVQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC5taW4gPSAodmFsdWUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjaGVja3MuZ3RlKHZhbHVlLCBwYXJhbXMpKTtcclxuICAgIGluc3QubWF4ID0gKHZhbHVlLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY2hlY2tzLmx0ZSh2YWx1ZSwgcGFyYW1zKSk7XHJcbiAgICBjb25zdCBjID0gaW5zdC5fem9kLmJhZztcclxuICAgIGluc3QubWluRGF0ZSA9IGMubWluaW11bSA/IG5ldyBEYXRlKGMubWluaW11bSkgOiBudWxsO1xyXG4gICAgaW5zdC5tYXhEYXRlID0gYy5tYXhpbXVtID8gbmV3IERhdGUoYy5tYXhpbXVtKSA6IG51bGw7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gZGF0ZShwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9kYXRlKFpvZERhdGUsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEFycmF5ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEFycmF5XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZEFycmF5LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmFycmF5UHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QuZWxlbWVudCA9IGRlZi5lbGVtZW50O1xyXG4gICAgX2luc3RhbGxMYXp5TWV0aG9kcyhpbnN0LCBcIlpvZEFycmF5XCIsIHtcclxuICAgICAgICBtaW4obiwgcGFyYW1zKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrKGNoZWNrcy5taW5MZW5ndGgobiwgcGFyYW1zKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBub25lbXB0eShwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm1pbkxlbmd0aCgxLCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1heChuLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLm1heExlbmd0aChuLCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxlbmd0aChuLCBwYXJhbXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2soY2hlY2tzLmxlbmd0aChuLCBwYXJhbXMpKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVud3JhcCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gYXJyYXkoZWxlbWVudCwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fYXJyYXkoWm9kQXJyYXksIGVsZW1lbnQsIHBhcmFtcyk7XHJcbn1cclxuLy8gLmtleW9mXHJcbmV4cG9ydCBmdW5jdGlvbiBrZXlvZihzY2hlbWEpIHtcclxuICAgIGNvbnN0IHNoYXBlID0gc2NoZW1hLl96b2QuZGVmLnNoYXBlO1xyXG4gICAgcmV0dXJuIF9lbnVtKE9iamVjdC5rZXlzKHNoYXBlKSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZE9iamVjdCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RPYmplY3RcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kT2JqZWN0SklULmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLm9iamVjdFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICB1dGlsLmRlZmluZUxhenkoaW5zdCwgXCJzaGFwZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGRlZi5zaGFwZTtcclxuICAgIH0pO1xyXG4gICAgX2luc3RhbGxMYXp5TWV0aG9kcyhpbnN0LCBcIlpvZE9iamVjdFwiLCB7XHJcbiAgICAgICAga2V5b2YoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfZW51bShPYmplY3Qua2V5cyh0aGlzLl96b2QuZGVmLnNoYXBlKSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjYXRjaGFsbChjYXRjaGFsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7IC4uLnRoaXMuX3pvZC5kZWYsIGNhdGNoYWxsOiBjYXRjaGFsbCB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhc3N0aHJvdWdoKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7IC4uLnRoaXMuX3pvZC5kZWYsIGNhdGNoYWxsOiB1bmtub3duKCkgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBsb29zZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoeyAuLi50aGlzLl96b2QuZGVmLCBjYXRjaGFsbDogdW5rbm93bigpIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RyaWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSh7IC4uLnRoaXMuX3pvZC5kZWYsIGNhdGNoYWxsOiBuZXZlcigpIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RyaXAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKHsgLi4udGhpcy5fem9kLmRlZiwgY2F0Y2hhbGw6IHVuZGVmaW5lZCB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4dGVuZChpbmNvbWluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdXRpbC5leHRlbmQodGhpcywgaW5jb21pbmcpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2FmZUV4dGVuZChpbmNvbWluZykge1xyXG4gICAgICAgICAgICByZXR1cm4gdXRpbC5zYWZlRXh0ZW5kKHRoaXMsIGluY29taW5nKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1lcmdlKG90aGVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1dGlsLm1lcmdlKHRoaXMsIG90aGVyKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBpY2sobWFzaykge1xyXG4gICAgICAgICAgICByZXR1cm4gdXRpbC5waWNrKHRoaXMsIG1hc2spO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb21pdChtYXNrKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1dGlsLm9taXQodGhpcywgbWFzayk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwYXJ0aWFsKC4uLmFyZ3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHV0aWwucGFydGlhbChab2RPcHRpb25hbCwgdGhpcywgYXJnc1swXSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXF1aXJlZCguLi5hcmdzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1dGlsLnJlcXVpcmVkKFpvZE5vbk9wdGlvbmFsLCB0aGlzLCBhcmdzWzBdKTtcclxuICAgICAgICB9LFxyXG4gICAgfSk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gb2JqZWN0KHNoYXBlLCBwYXJhbXMpIHtcclxuICAgIGNvbnN0IGRlZiA9IHtcclxuICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgIHNoYXBlOiBzaGFwZSA/PyB7fSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfTtcclxuICAgIHJldHVybiBuZXcgWm9kT2JqZWN0KGRlZik7XHJcbn1cclxuLy8gc3RyaWN0T2JqZWN0XHJcbmV4cG9ydCBmdW5jdGlvbiBzdHJpY3RPYmplY3Qoc2hhcGUsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBab2RPYmplY3Qoe1xyXG4gICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgc2hhcGUsXHJcbiAgICAgICAgY2F0Y2hhbGw6IG5ldmVyKCksXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbi8vIGxvb3NlT2JqZWN0XHJcbmV4cG9ydCBmdW5jdGlvbiBsb29zZU9iamVjdChzaGFwZSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZE9iamVjdCh7XHJcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICBzaGFwZSxcclxuICAgICAgICBjYXRjaGFsbDogdW5rbm93bigpLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kVW5pb24gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kVW5pb25cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kVW5pb24uaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMudW5pb25Qcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC5vcHRpb25zID0gZGVmLm9wdGlvbnM7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gdW5pb24ob3B0aW9ucywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZFVuaW9uKHtcclxuICAgICAgICB0eXBlOiBcInVuaW9uXCIsXHJcbiAgICAgICAgb3B0aW9uczogb3B0aW9ucyxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFhvciA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RYb3JcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgWm9kVW5pb24uaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kWG9yLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy51bmlvblByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0Lm9wdGlvbnMgPSBkZWYub3B0aW9ucztcclxufSk7XHJcbi8qKiBDcmVhdGVzIGFuIGV4Y2x1c2l2ZSB1bmlvbiAoWE9SKSB3aGVyZSBleGFjdGx5IG9uZSBvcHRpb24gbXVzdCBtYXRjaC5cclxuICogVW5saWtlIHJlZ3VsYXIgdW5pb25zIHRoYXQgc3VjY2VlZCB3aGVuIGFueSBvcHRpb24gbWF0Y2hlcywgeG9yIGZhaWxzIGlmXHJcbiAqIHplcm8gb3IgbW9yZSB0aGFuIG9uZSBvcHRpb24gbWF0Y2hlcyB0aGUgaW5wdXQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB4b3Iob3B0aW9ucywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZFhvcih7XHJcbiAgICAgICAgdHlwZTogXCJ1bmlvblwiLFxyXG4gICAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXHJcbiAgICAgICAgaW5jbHVzaXZlOiBmYWxzZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZERpc2NyaW1pbmF0ZWRVbmlvbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2REaXNjcmltaW5hdGVkVW5pb25cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgWm9kVW5pb24uaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kRGlzY3JpbWluYXRlZFVuaW9uLmluaXQoaW5zdCwgZGVmKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBkaXNjcmltaW5hdGVkVW5pb24oZGlzY3JpbWluYXRvciwgb3B0aW9ucywgcGFyYW1zKSB7XHJcbiAgICAvLyBjb25zdCBbb3B0aW9ucywgcGFyYW1zXSA9IGFyZ3M7XHJcbiAgICByZXR1cm4gbmV3IFpvZERpc2NyaW1pbmF0ZWRVbmlvbih7XHJcbiAgICAgICAgdHlwZTogXCJ1bmlvblwiLFxyXG4gICAgICAgIG9wdGlvbnMsXHJcbiAgICAgICAgZGlzY3JpbWluYXRvcixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEludGVyc2VjdGlvbiA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RJbnRlcnNlY3Rpb25cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kSW50ZXJzZWN0aW9uLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmludGVyc2VjdGlvblByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJzZWN0aW9uKGxlZnQsIHJpZ2h0KSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZEludGVyc2VjdGlvbih7XHJcbiAgICAgICAgdHlwZTogXCJpbnRlcnNlY3Rpb25cIixcclxuICAgICAgICBsZWZ0OiBsZWZ0LFxyXG4gICAgICAgIHJpZ2h0OiByaWdodCxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RUdXBsZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RUdXBsZVwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RUdXBsZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy50dXBsZVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0LnJlc3QgPSAocmVzdCkgPT4gaW5zdC5jbG9uZSh7XHJcbiAgICAgICAgLi4uaW5zdC5fem9kLmRlZixcclxuICAgICAgICByZXN0OiByZXN0LFxyXG4gICAgfSk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gdHVwbGUoaXRlbXMsIF9wYXJhbXNPclJlc3QsIF9wYXJhbXMpIHtcclxuICAgIGNvbnN0IGhhc1Jlc3QgPSBfcGFyYW1zT3JSZXN0IGluc3RhbmNlb2YgY29yZS4kWm9kVHlwZTtcclxuICAgIGNvbnN0IHBhcmFtcyA9IGhhc1Jlc3QgPyBfcGFyYW1zIDogX3BhcmFtc09yUmVzdDtcclxuICAgIGNvbnN0IHJlc3QgPSBoYXNSZXN0ID8gX3BhcmFtc09yUmVzdCA6IG51bGw7XHJcbiAgICByZXR1cm4gbmV3IFpvZFR1cGxlKHtcclxuICAgICAgICB0eXBlOiBcInR1cGxlXCIsXHJcbiAgICAgICAgaXRlbXM6IGl0ZW1zLFxyXG4gICAgICAgIHJlc3QsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RSZWNvcmQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kUmVjb3JkXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFJlY29yZC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5yZWNvcmRQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC5rZXlUeXBlID0gZGVmLmtleVR5cGU7XHJcbiAgICBpbnN0LnZhbHVlVHlwZSA9IGRlZi52YWx1ZVR5cGU7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gcmVjb3JkKGtleVR5cGUsIHZhbHVlVHlwZSwgcGFyYW1zKSB7XHJcbiAgICAvLyB2My1jb21wYXQ6IHoucmVjb3JkKHZhbHVlVHlwZSwgcGFyYW1zPykg4oCUIGRlZmF1bHRzIGtleVR5cGUgdG8gei5zdHJpbmcoKVxyXG4gICAgaWYgKCF2YWx1ZVR5cGUgfHwgIXZhbHVlVHlwZS5fem9kKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBab2RSZWNvcmQoe1xyXG4gICAgICAgICAgICB0eXBlOiBcInJlY29yZFwiLFxyXG4gICAgICAgICAgICBrZXlUeXBlOiBzdHJpbmcoKSxcclxuICAgICAgICAgICAgdmFsdWVUeXBlOiBrZXlUeXBlLFxyXG4gICAgICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyh2YWx1ZVR5cGUpLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBab2RSZWNvcmQoe1xyXG4gICAgICAgIHR5cGU6IFwicmVjb3JkXCIsXHJcbiAgICAgICAga2V5VHlwZSxcclxuICAgICAgICB2YWx1ZVR5cGU6IHZhbHVlVHlwZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuLy8gdHlwZSBhbGtzamYgPSBjb3JlLm91dHB1dDxjb3JlLiRab2RSZWNvcmRLZXk+O1xyXG5leHBvcnQgZnVuY3Rpb24gcGFydGlhbFJlY29yZChrZXlUeXBlLCB2YWx1ZVR5cGUsIHBhcmFtcykge1xyXG4gICAgY29uc3QgayA9IGNvcmUuY2xvbmUoa2V5VHlwZSk7XHJcbiAgICBrLl96b2QudmFsdWVzID0gdW5kZWZpbmVkO1xyXG4gICAgcmV0dXJuIG5ldyBab2RSZWNvcmQoe1xyXG4gICAgICAgIHR5cGU6IFwicmVjb3JkXCIsXHJcbiAgICAgICAga2V5VHlwZTogayxcclxuICAgICAgICB2YWx1ZVR5cGU6IHZhbHVlVHlwZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGxvb3NlUmVjb3JkKGtleVR5cGUsIHZhbHVlVHlwZSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZFJlY29yZCh7XHJcbiAgICAgICAgdHlwZTogXCJyZWNvcmRcIixcclxuICAgICAgICBrZXlUeXBlLFxyXG4gICAgICAgIHZhbHVlVHlwZTogdmFsdWVUeXBlLFxyXG4gICAgICAgIG1vZGU6IFwibG9vc2VcIixcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZE1hcCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RNYXBcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kTWFwLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLm1hcFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0LmtleVR5cGUgPSBkZWYua2V5VHlwZTtcclxuICAgIGluc3QudmFsdWVUeXBlID0gZGVmLnZhbHVlVHlwZTtcclxuICAgIGluc3QubWluID0gKC4uLmFyZ3MpID0+IGluc3QuY2hlY2soY29yZS5fbWluU2l6ZSguLi5hcmdzKSk7XHJcbiAgICBpbnN0Lm5vbmVtcHR5ID0gKHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9taW5TaXplKDEsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5tYXggPSAoLi4uYXJncykgPT4gaW5zdC5jaGVjayhjb3JlLl9tYXhTaXplKC4uLmFyZ3MpKTtcclxuICAgIGluc3Quc2l6ZSA9ICguLi5hcmdzKSA9PiBpbnN0LmNoZWNrKGNvcmUuX3NpemUoLi4uYXJncykpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIG1hcChrZXlUeXBlLCB2YWx1ZVR5cGUsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBab2RNYXAoe1xyXG4gICAgICAgIHR5cGU6IFwibWFwXCIsXHJcbiAgICAgICAga2V5VHlwZToga2V5VHlwZSxcclxuICAgICAgICB2YWx1ZVR5cGU6IHZhbHVlVHlwZSxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFNldCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RTZXRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kU2V0LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnNldFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0Lm1pbiA9ICguLi5hcmdzKSA9PiBpbnN0LmNoZWNrKGNvcmUuX21pblNpemUoLi4uYXJncykpO1xyXG4gICAgaW5zdC5ub25lbXB0eSA9IChwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fbWluU2l6ZSgxLCBwYXJhbXMpKTtcclxuICAgIGluc3QubWF4ID0gKC4uLmFyZ3MpID0+IGluc3QuY2hlY2soY29yZS5fbWF4U2l6ZSguLi5hcmdzKSk7XHJcbiAgICBpbnN0LnNpemUgPSAoLi4uYXJncykgPT4gaW5zdC5jaGVjayhjb3JlLl9zaXplKC4uLmFyZ3MpKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXQodmFsdWVUeXBlLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgWm9kU2V0KHtcclxuICAgICAgICB0eXBlOiBcInNldFwiLFxyXG4gICAgICAgIHZhbHVlVHlwZTogdmFsdWVUeXBlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kRW51bSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RFbnVtXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZEVudW0uaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuZW51bVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0LmVudW0gPSBkZWYuZW50cmllcztcclxuICAgIGluc3Qub3B0aW9ucyA9IE9iamVjdC52YWx1ZXMoZGVmLmVudHJpZXMpO1xyXG4gICAgY29uc3Qga2V5cyA9IG5ldyBTZXQoT2JqZWN0LmtleXMoZGVmLmVudHJpZXMpKTtcclxuICAgIGluc3QuZXh0cmFjdCA9ICh2YWx1ZXMsIHBhcmFtcykgPT4ge1xyXG4gICAgICAgIGNvbnN0IG5ld0VudHJpZXMgPSB7fTtcclxuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xyXG4gICAgICAgICAgICBpZiAoa2V5cy5oYXModmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdFbnRyaWVzW3ZhbHVlXSA9IGRlZi5lbnRyaWVzW3ZhbHVlXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEtleSAke3ZhbHVlfSBub3QgZm91bmQgaW4gZW51bWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFpvZEVudW0oe1xyXG4gICAgICAgICAgICAuLi5kZWYsXHJcbiAgICAgICAgICAgIGNoZWNrczogW10sXHJcbiAgICAgICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICAgICAgICAgIGVudHJpZXM6IG5ld0VudHJpZXMsXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgaW5zdC5leGNsdWRlID0gKHZhbHVlcywgcGFyYW1zKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbmV3RW50cmllcyA9IHsgLi4uZGVmLmVudHJpZXMgfTtcclxuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xyXG4gICAgICAgICAgICBpZiAoa2V5cy5oYXModmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgbmV3RW50cmllc1t2YWx1ZV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBLZXkgJHt2YWx1ZX0gbm90IGZvdW5kIGluIGVudW1gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBab2RFbnVtKHtcclxuICAgICAgICAgICAgLi4uZGVmLFxyXG4gICAgICAgICAgICBjaGVja3M6IFtdLFxyXG4gICAgICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgICAgICAgICBlbnRyaWVzOiBuZXdFbnRyaWVzLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxufSk7XHJcbmZ1bmN0aW9uIF9lbnVtKHZhbHVlcywgcGFyYW1zKSB7XHJcbiAgICBjb25zdCBlbnRyaWVzID0gQXJyYXkuaXNBcnJheSh2YWx1ZXMpID8gT2JqZWN0LmZyb21FbnRyaWVzKHZhbHVlcy5tYXAoKHYpID0+IFt2LCB2XSkpIDogdmFsdWVzO1xyXG4gICAgcmV0dXJuIG5ldyBab2RFbnVtKHtcclxuICAgICAgICB0eXBlOiBcImVudW1cIixcclxuICAgICAgICBlbnRyaWVzLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgeyBfZW51bSBhcyBlbnVtIH07XHJcbi8qKiBAZGVwcmVjYXRlZCBUaGlzIEFQSSBoYXMgYmVlbiBtZXJnZWQgaW50byBgei5lbnVtKClgLiBVc2UgYHouZW51bSgpYCBpbnN0ZWFkLlxyXG4gKlxyXG4gKiBgYGB0c1xyXG4gKiBlbnVtIENvbG9ycyB7IHJlZCwgZ3JlZW4sIGJsdWUgfVxyXG4gKiB6LmVudW0oQ29sb3JzKTtcclxuICogYGBgXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbmF0aXZlRW51bShlbnRyaWVzLCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgWm9kRW51bSh7XHJcbiAgICAgICAgdHlwZTogXCJlbnVtXCIsXHJcbiAgICAgICAgZW50cmllcyxcclxuICAgICAgICAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZExpdGVyYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kTGl0ZXJhbFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RMaXRlcmFsLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmxpdGVyYWxQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC52YWx1ZXMgPSBuZXcgU2V0KGRlZi52YWx1ZXMpO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGluc3QsIFwidmFsdWVcIiwge1xyXG4gICAgICAgIGdldCgpIHtcclxuICAgICAgICAgICAgaWYgKGRlZi52YWx1ZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBzY2hlbWEgY29udGFpbnMgbXVsdGlwbGUgdmFsaWQgbGl0ZXJhbCB2YWx1ZXMuIFVzZSBgLnZhbHVlc2AgaW5zdGVhZC5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGRlZi52YWx1ZXNbMF07XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGxpdGVyYWwodmFsdWUsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBab2RMaXRlcmFsKHtcclxuICAgICAgICB0eXBlOiBcImxpdGVyYWxcIixcclxuICAgICAgICB2YWx1ZXM6IEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUgOiBbdmFsdWVdLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kRmlsZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RGaWxlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZEZpbGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuZmlsZVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0Lm1pbiA9IChzaXplLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fbWluU2l6ZShzaXplLCBwYXJhbXMpKTtcclxuICAgIGluc3QubWF4ID0gKHNpemUsIHBhcmFtcykgPT4gaW5zdC5jaGVjayhjb3JlLl9tYXhTaXplKHNpemUsIHBhcmFtcykpO1xyXG4gICAgaW5zdC5taW1lID0gKHR5cGVzLCBwYXJhbXMpID0+IGluc3QuY2hlY2soY29yZS5fbWltZShBcnJheS5pc0FycmF5KHR5cGVzKSA/IHR5cGVzIDogW3R5cGVzXSwgcGFyYW1zKSk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gZmlsZShwYXJhbXMpIHtcclxuICAgIHJldHVybiBjb3JlLl9maWxlKFpvZEZpbGUsIHBhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFRyYW5zZm9ybSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RUcmFuc2Zvcm1cIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kVHJhbnNmb3JtLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnRyYW5zZm9ybVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0Ll96b2QucGFyc2UgPSAocGF5bG9hZCwgX2N0eCkgPT4ge1xyXG4gICAgICAgIGlmIChfY3R4LmRpcmVjdGlvbiA9PT0gXCJiYWNrd2FyZFwiKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBjb3JlLiRab2RFbmNvZGVFcnJvcihpbnN0LmNvbnN0cnVjdG9yLm5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwYXlsb2FkLmFkZElzc3VlID0gKGlzc3VlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaXNzdWUgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIHBheWxvYWQuaXNzdWVzLnB1c2godXRpbC5pc3N1ZShpc3N1ZSwgcGF5bG9hZC52YWx1ZSwgZGVmKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBmb3IgWm9kIDMgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcclxuICAgICAgICAgICAgICAgIGNvbnN0IF9pc3N1ZSA9IGlzc3VlO1xyXG4gICAgICAgICAgICAgICAgaWYgKF9pc3N1ZS5mYXRhbClcclxuICAgICAgICAgICAgICAgICAgICBfaXNzdWUuY29udGludWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIF9pc3N1ZS5jb2RlID8/IChfaXNzdWUuY29kZSA9IFwiY3VzdG9tXCIpO1xyXG4gICAgICAgICAgICAgICAgX2lzc3VlLmlucHV0ID8/IChfaXNzdWUuaW5wdXQgPSBwYXlsb2FkLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIF9pc3N1ZS5pbnN0ID8/IChfaXNzdWUuaW5zdCA9IGluc3QpO1xyXG4gICAgICAgICAgICAgICAgLy8gX2lzc3VlLmNvbnRpbnVlID8/PSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5pc3N1ZXMucHVzaCh1dGlsLmlzc3VlKF9pc3N1ZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBvdXRwdXQgPSBkZWYudHJhbnNmb3JtKHBheWxvYWQudmFsdWUsIHBheWxvYWQpO1xyXG4gICAgICAgIGlmIChvdXRwdXQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQudGhlbigob3V0cHV0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBwYXlsb2FkLnZhbHVlID0gb3V0cHV0O1xyXG4gICAgICAgICAgICAgICAgcGF5bG9hZC5mYWxsYmFjayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF5bG9hZDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHBheWxvYWQudmFsdWUgPSBvdXRwdXQ7XHJcbiAgICAgICAgcGF5bG9hZC5mYWxsYmFjayA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XHJcbiAgICB9O1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xyXG4gICAgcmV0dXJuIG5ldyBab2RUcmFuc2Zvcm0oe1xyXG4gICAgICAgIHR5cGU6IFwidHJhbnNmb3JtXCIsXHJcbiAgICAgICAgdHJhbnNmb3JtOiBmbixcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RPcHRpb25hbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RPcHRpb25hbFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RPcHRpb25hbC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5vcHRpb25hbFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0LnVud3JhcCA9ICgpID0+IGluc3QuX3pvZC5kZWYuaW5uZXJUeXBlO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsKGlubmVyVHlwZSkge1xyXG4gICAgcmV0dXJuIG5ldyBab2RPcHRpb25hbCh7XHJcbiAgICAgICAgdHlwZTogXCJvcHRpb25hbFwiLFxyXG4gICAgICAgIGlubmVyVHlwZTogaW5uZXJUeXBlLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEV4YWN0T3B0aW9uYWwgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kRXhhY3RPcHRpb25hbFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RFeGFjdE9wdGlvbmFsLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLm9wdGlvbmFsUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QudW53cmFwID0gKCkgPT4gaW5zdC5fem9kLmRlZi5pbm5lclR5cGU7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RPcHRpb25hbChpbm5lclR5cGUpIHtcclxuICAgIHJldHVybiBuZXcgWm9kRXhhY3RPcHRpb25hbCh7XHJcbiAgICAgICAgdHlwZTogXCJvcHRpb25hbFwiLFxyXG4gICAgICAgIGlubmVyVHlwZTogaW5uZXJUeXBlLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZE51bGxhYmxlID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE51bGxhYmxlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZE51bGxhYmxlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLm51bGxhYmxlUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QudW53cmFwID0gKCkgPT4gaW5zdC5fem9kLmRlZi5pbm5lclR5cGU7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gbnVsbGFibGUoaW5uZXJUeXBlKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZE51bGxhYmxlKHtcclxuICAgICAgICB0eXBlOiBcIm51bGxhYmxlXCIsXHJcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXHJcbiAgICB9KTtcclxufVxyXG4vLyBudWxsaXNoXHJcbmV4cG9ydCBmdW5jdGlvbiBudWxsaXNoKGlubmVyVHlwZSkge1xyXG4gICAgcmV0dXJuIG9wdGlvbmFsKG51bGxhYmxlKGlubmVyVHlwZSkpO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2REZWZhdWx0ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZERlZmF1bHRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kRGVmYXVsdC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5kZWZhdWx0UHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QudW53cmFwID0gKCkgPT4gaW5zdC5fem9kLmRlZi5pbm5lclR5cGU7XHJcbiAgICBpbnN0LnJlbW92ZURlZmF1bHQgPSBpbnN0LnVud3JhcDtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBfZGVmYXVsdChpbm5lclR5cGUsIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBab2REZWZhdWx0KHtcclxuICAgICAgICB0eXBlOiBcImRlZmF1bHRcIixcclxuICAgICAgICBpbm5lclR5cGU6IGlubmVyVHlwZSxcclxuICAgICAgICBnZXQgZGVmYXVsdFZhbHVlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGRlZmF1bHRWYWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gZGVmYXVsdFZhbHVlKCkgOiB1dGlsLnNoYWxsb3dDbG9uZShkZWZhdWx0VmFsdWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kUHJlZmF1bHQgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kUHJlZmF1bHRcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kUHJlZmF1bHQuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMucHJlZmF1bHRQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC51bndyYXAgPSAoKSA9PiBpbnN0Ll96b2QuZGVmLmlubmVyVHlwZTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBwcmVmYXVsdChpbm5lclR5cGUsIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBab2RQcmVmYXVsdCh7XHJcbiAgICAgICAgdHlwZTogXCJwcmVmYXVsdFwiLFxyXG4gICAgICAgIGlubmVyVHlwZTogaW5uZXJUeXBlLFxyXG4gICAgICAgIGdldCBkZWZhdWx0VmFsdWUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgZGVmYXVsdFZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBkZWZhdWx0VmFsdWUoKSA6IHV0aWwuc2hhbGxvd0Nsb25lKGRlZmF1bHRWYWx1ZSk7XHJcbiAgICAgICAgfSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2ROb25PcHRpb25hbCA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2ROb25PcHRpb25hbFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2ROb25PcHRpb25hbC5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5ub25vcHRpb25hbFByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0LnVud3JhcCA9ICgpID0+IGluc3QuX3pvZC5kZWYuaW5uZXJUeXBlO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIG5vbm9wdGlvbmFsKGlubmVyVHlwZSwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZE5vbk9wdGlvbmFsKHtcclxuICAgICAgICB0eXBlOiBcIm5vbm9wdGlvbmFsXCIsXHJcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXHJcbiAgICAgICAgLi4udXRpbC5ub3JtYWxpemVQYXJhbXMocGFyYW1zKSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCBjb25zdCBab2RTdWNjZXNzID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFN1Y2Nlc3NcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kU3VjY2Vzcy5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5zdWNjZXNzUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QudW53cmFwID0gKCkgPT4gaW5zdC5fem9kLmRlZi5pbm5lclR5cGU7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gc3VjY2Vzcyhpbm5lclR5cGUpIHtcclxuICAgIHJldHVybiBuZXcgWm9kU3VjY2Vzcyh7XHJcbiAgICAgICAgdHlwZTogXCJzdWNjZXNzXCIsXHJcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kQ2F0Y2ggPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ2F0Y2hcIiwgKGluc3QsIGRlZikgPT4ge1xyXG4gICAgY29yZS4kWm9kQ2F0Y2guaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMuY2F0Y2hQcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG4gICAgaW5zdC51bndyYXAgPSAoKSA9PiBpbnN0Ll96b2QuZGVmLmlubmVyVHlwZTtcclxuICAgIGluc3QucmVtb3ZlQ2F0Y2ggPSBpbnN0LnVud3JhcDtcclxufSk7XHJcbmZ1bmN0aW9uIF9jYXRjaChpbm5lclR5cGUsIGNhdGNoVmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgWm9kQ2F0Y2goe1xyXG4gICAgICAgIHR5cGU6IFwiY2F0Y2hcIixcclxuICAgICAgICBpbm5lclR5cGU6IGlubmVyVHlwZSxcclxuICAgICAgICBjYXRjaFZhbHVlOiAodHlwZW9mIGNhdGNoVmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGNhdGNoVmFsdWUgOiAoKSA9PiBjYXRjaFZhbHVlKSxcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydCB7IF9jYXRjaCBhcyBjYXRjaCB9O1xyXG5leHBvcnQgY29uc3QgWm9kTmFOID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZE5hTlwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2ROYU4uaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMubmFuUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBuYW4ocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fbmFuKFpvZE5hTiwgcGFyYW1zKTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kUGlwZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RQaXBlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFBpcGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMucGlwZVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0LmluID0gZGVmLmluO1xyXG4gICAgaW5zdC5vdXQgPSBkZWYub3V0O1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIHBpcGUoaW5fLCBvdXQpIHtcclxuICAgIHJldHVybiBuZXcgWm9kUGlwZSh7XHJcbiAgICAgICAgdHlwZTogXCJwaXBlXCIsXHJcbiAgICAgICAgaW46IGluXyxcclxuICAgICAgICBvdXQ6IG91dCxcclxuICAgICAgICAvLyAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZENvZGVjID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZENvZGVjXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIFpvZFBpcGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgY29yZS4kWm9kQ29kZWMuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIGNvZGVjKGluXywgb3V0LCBwYXJhbXMpIHtcclxuICAgIHJldHVybiBuZXcgWm9kQ29kZWMoe1xyXG4gICAgICAgIHR5cGU6IFwicGlwZVwiLFxyXG4gICAgICAgIGluOiBpbl8sXHJcbiAgICAgICAgb3V0OiBvdXQsXHJcbiAgICAgICAgdHJhbnNmb3JtOiBwYXJhbXMuZGVjb2RlLFxyXG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm06IHBhcmFtcy5lbmNvZGUsXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0Q29kZWMoY29kZWMpIHtcclxuICAgIGNvbnN0IGRlZiA9IGNvZGVjLl96b2QuZGVmO1xyXG4gICAgcmV0dXJuIG5ldyBab2RDb2RlYyh7XHJcbiAgICAgICAgdHlwZTogXCJwaXBlXCIsXHJcbiAgICAgICAgaW46IGRlZi5vdXQsXHJcbiAgICAgICAgb3V0OiBkZWYuaW4sXHJcbiAgICAgICAgdHJhbnNmb3JtOiBkZWYucmV2ZXJzZVRyYW5zZm9ybSxcclxuICAgICAgICByZXZlcnNlVHJhbnNmb3JtOiBkZWYudHJhbnNmb3JtLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZFByZXByb2Nlc3MgPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kUHJlcHJvY2Vzc1wiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBab2RQaXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGNvcmUuJFpvZFByZXByb2Nlc3MuaW5pdChpbnN0LCBkZWYpO1xyXG59KTtcclxuZXhwb3J0IGNvbnN0IFpvZFJlYWRvbmx5ID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFJlYWRvbmx5XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFJlYWRvbmx5LmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLnJlYWRvbmx5UHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxuICAgIGluc3QudW53cmFwID0gKCkgPT4gaW5zdC5fem9kLmRlZi5pbm5lclR5cGU7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gcmVhZG9ubHkoaW5uZXJUeXBlKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZFJlYWRvbmx5KHtcclxuICAgICAgICB0eXBlOiBcInJlYWRvbmx5XCIsXHJcbiAgICAgICAgaW5uZXJUeXBlOiBpbm5lclR5cGUsXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kVGVtcGxhdGVMaXRlcmFsID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZFRlbXBsYXRlTGl0ZXJhbFwiLCAoaW5zdCwgZGVmKSA9PiB7XHJcbiAgICBjb3JlLiRab2RUZW1wbGF0ZUxpdGVyYWwuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMudGVtcGxhdGVMaXRlcmFsUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUxpdGVyYWwocGFydHMsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIG5ldyBab2RUZW1wbGF0ZUxpdGVyYWwoe1xyXG4gICAgICAgIHR5cGU6IFwidGVtcGxhdGVfbGl0ZXJhbFwiLFxyXG4gICAgICAgIHBhcnRzLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kTGF6eSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RMYXp5XCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZExhenkuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMubGF6eVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0LnVud3JhcCA9ICgpID0+IGluc3QuX3pvZC5kZWYuZ2V0dGVyKCk7XHJcbn0pO1xyXG5leHBvcnQgZnVuY3Rpb24gbGF6eShnZXR0ZXIpIHtcclxuICAgIHJldHVybiBuZXcgWm9kTGF6eSh7XHJcbiAgICAgICAgdHlwZTogXCJsYXp5XCIsXHJcbiAgICAgICAgZ2V0dGVyOiBnZXR0ZXIsXHJcbiAgICB9KTtcclxufVxyXG5leHBvcnQgY29uc3QgWm9kUHJvbWlzZSA9IC8qQF9fUFVSRV9fKi8gY29yZS4kY29uc3RydWN0b3IoXCJab2RQcm9taXNlXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZFByb21pc2UuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgWm9kVHlwZS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBpbnN0Ll96b2QucHJvY2Vzc0pTT05TY2hlbWEgPSAoY3R4LCBqc29uLCBwYXJhbXMpID0+IHByb2Nlc3NvcnMucHJvbWlzZVByb2Nlc3NvcihpbnN0LCBjdHgsIGpzb24sIHBhcmFtcyk7XHJcbiAgICBpbnN0LnVud3JhcCA9ICgpID0+IGluc3QuX3pvZC5kZWYuaW5uZXJUeXBlO1xyXG59KTtcclxuZXhwb3J0IGZ1bmN0aW9uIHByb21pc2UoaW5uZXJUeXBlKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZFByb21pc2Uoe1xyXG4gICAgICAgIHR5cGU6IFwicHJvbWlzZVwiLFxyXG4gICAgICAgIGlubmVyVHlwZTogaW5uZXJUeXBlLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFpvZEZ1bmN0aW9uID0gLypAX19QVVJFX18qLyBjb3JlLiRjb25zdHJ1Y3RvcihcIlpvZEZ1bmN0aW9uXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZEZ1bmN0aW9uLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIFpvZFR5cGUuaW5pdChpbnN0LCBkZWYpO1xyXG4gICAgaW5zdC5fem9kLnByb2Nlc3NKU09OU2NoZW1hID0gKGN0eCwganNvbiwgcGFyYW1zKSA9PiBwcm9jZXNzb3JzLmZ1bmN0aW9uUHJvY2Vzc29yKGluc3QsIGN0eCwganNvbiwgcGFyYW1zKTtcclxufSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBfZnVuY3Rpb24ocGFyYW1zKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZEZ1bmN0aW9uKHtcclxuICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXHJcbiAgICAgICAgaW5wdXQ6IEFycmF5LmlzQXJyYXkocGFyYW1zPy5pbnB1dCkgPyB0dXBsZShwYXJhbXM/LmlucHV0KSA6IChwYXJhbXM/LmlucHV0ID8/IGFycmF5KHVua25vd24oKSkpLFxyXG4gICAgICAgIG91dHB1dDogcGFyYW1zPy5vdXRwdXQgPz8gdW5rbm93bigpLFxyXG4gICAgfSk7XHJcbn1cclxuZXhwb3J0IHsgX2Z1bmN0aW9uIGFzIGZ1bmN0aW9uIH07XHJcbmV4cG9ydCBjb25zdCBab2RDdXN0b20gPSAvKkBfX1BVUkVfXyovIGNvcmUuJGNvbnN0cnVjdG9yKFwiWm9kQ3VzdG9tXCIsIChpbnN0LCBkZWYpID0+IHtcclxuICAgIGNvcmUuJFpvZEN1c3RvbS5pbml0KGluc3QsIGRlZik7XHJcbiAgICBab2RUeXBlLmluaXQoaW5zdCwgZGVmKTtcclxuICAgIGluc3QuX3pvZC5wcm9jZXNzSlNPTlNjaGVtYSA9IChjdHgsIGpzb24sIHBhcmFtcykgPT4gcHJvY2Vzc29ycy5jdXN0b21Qcm9jZXNzb3IoaW5zdCwgY3R4LCBqc29uLCBwYXJhbXMpO1xyXG59KTtcclxuLy8gY3VzdG9tIGNoZWNrc1xyXG5leHBvcnQgZnVuY3Rpb24gY2hlY2soZm4pIHtcclxuICAgIGNvbnN0IGNoID0gbmV3IGNvcmUuJFpvZENoZWNrKHtcclxuICAgICAgICBjaGVjazogXCJjdXN0b21cIixcclxuICAgICAgICAvLyAuLi51dGlsLm5vcm1hbGl6ZVBhcmFtcyhwYXJhbXMpLFxyXG4gICAgfSk7XHJcbiAgICBjaC5fem9kLmNoZWNrID0gZm47XHJcbiAgICByZXR1cm4gY2g7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGN1c3RvbShmbiwgX3BhcmFtcykge1xyXG4gICAgcmV0dXJuIGNvcmUuX2N1c3RvbShab2RDdXN0b20sIGZuID8/ICgoKSA9PiB0cnVlKSwgX3BhcmFtcyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHJlZmluZShmbiwgX3BhcmFtcyA9IHt9KSB7XHJcbiAgICByZXR1cm4gY29yZS5fcmVmaW5lKFpvZEN1c3RvbSwgZm4sIF9wYXJhbXMpO1xyXG59XHJcbi8vIHN1cGVyUmVmaW5lXHJcbmV4cG9ydCBmdW5jdGlvbiBzdXBlclJlZmluZShmbiwgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gY29yZS5fc3VwZXJSZWZpbmUoZm4sIHBhcmFtcyk7XHJcbn1cclxuLy8gUmUtZXhwb3J0IGRlc2NyaWJlIGFuZCBtZXRhIGZyb20gY29yZVxyXG5leHBvcnQgY29uc3QgZGVzY3JpYmUgPSBjb3JlLmRlc2NyaWJlO1xyXG5leHBvcnQgY29uc3QgbWV0YSA9IGNvcmUubWV0YTtcclxuZnVuY3Rpb24gX2luc3RhbmNlb2YoY2xzLCBwYXJhbXMgPSB7fSkge1xyXG4gICAgY29uc3QgaW5zdCA9IG5ldyBab2RDdXN0b20oe1xyXG4gICAgICAgIHR5cGU6IFwiY3VzdG9tXCIsXHJcbiAgICAgICAgY2hlY2s6IFwiY3VzdG9tXCIsXHJcbiAgICAgICAgZm46IChkYXRhKSA9PiBkYXRhIGluc3RhbmNlb2YgY2xzLFxyXG4gICAgICAgIGFib3J0OiB0cnVlLFxyXG4gICAgICAgIC4uLnV0aWwubm9ybWFsaXplUGFyYW1zKHBhcmFtcyksXHJcbiAgICB9KTtcclxuICAgIGluc3QuX3pvZC5iYWcuQ2xhc3MgPSBjbHM7XHJcbiAgICAvLyBPdmVycmlkZSBjaGVjayB0byBlbWl0IGludmFsaWRfdHlwZSBpbnN0ZWFkIG9mIGN1c3RvbVxyXG4gICAgaW5zdC5fem9kLmNoZWNrID0gKHBheWxvYWQpID0+IHtcclxuICAgICAgICBpZiAoIShwYXlsb2FkLnZhbHVlIGluc3RhbmNlb2YgY2xzKSkge1xyXG4gICAgICAgICAgICBwYXlsb2FkLmlzc3Vlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIGNvZGU6IFwiaW52YWxpZF90eXBlXCIsXHJcbiAgICAgICAgICAgICAgICBleHBlY3RlZDogY2xzLm5hbWUsXHJcbiAgICAgICAgICAgICAgICBpbnB1dDogcGF5bG9hZC52YWx1ZSxcclxuICAgICAgICAgICAgICAgIGluc3QsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBbLi4uKGluc3QuX3pvZC5kZWYucGF0aCA/PyBbXSldLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIGluc3Q7XHJcbn1cclxuZXhwb3J0IHsgX2luc3RhbmNlb2YgYXMgaW5zdGFuY2VvZiB9O1xyXG4vLyBzdHJpbmdib29sXHJcbmV4cG9ydCBjb25zdCBzdHJpbmdib29sID0gKC4uLmFyZ3MpID0+IGNvcmUuX3N0cmluZ2Jvb2woe1xyXG4gICAgQ29kZWM6IFpvZENvZGVjLFxyXG4gICAgQm9vbGVhbjogWm9kQm9vbGVhbixcclxuICAgIFN0cmluZzogWm9kU3RyaW5nLFxyXG59LCAuLi5hcmdzKTtcclxuZXhwb3J0IGZ1bmN0aW9uIGpzb24ocGFyYW1zKSB7XHJcbiAgICBjb25zdCBqc29uU2NoZW1hID0gbGF6eSgoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHVuaW9uKFtzdHJpbmcocGFyYW1zKSwgbnVtYmVyKCksIGJvb2xlYW4oKSwgX251bGwoKSwgYXJyYXkoanNvblNjaGVtYSksIHJlY29yZChzdHJpbmcoKSwganNvblNjaGVtYSldKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIGpzb25TY2hlbWE7XHJcbn1cclxuLy8gcHJlcHJvY2Vzc1xyXG5leHBvcnQgZnVuY3Rpb24gcHJlcHJvY2Vzcyhmbiwgc2NoZW1hKSB7XHJcbiAgICByZXR1cm4gbmV3IFpvZFByZXByb2Nlc3Moe1xyXG4gICAgICAgIHR5cGU6IFwicGlwZVwiLFxyXG4gICAgICAgIGluOiB0cmFuc2Zvcm0oZm4pLFxyXG4gICAgICAgIG91dDogc2NoZW1hLFxyXG4gICAgfSk7XHJcbn1cclxuIiwiLyoqXHJcbiAqIFVuaWNvZGUgaGFuZGxpbmcgZm9yIEZyZW5jaCB0YXJnZXQgdGV4dCBhbmQgRW5nbGlzaCBzb3VyY2UgbWF0Y2hpbmcuXHJcbiAqXHJcbiAqIFR3byBydWxlcyBkcml2ZSBldmVyeXRoaW5nIGhlcmU6XHJcbiAqXHJcbiAqIDEuIFN0b3JlZCBhbmQgcmVuZGVyZWQgRnJlbmNoIHRleHQgaXMgYWx3YXlzIE5GQy4gYGJpYmxpb3RoZXF1ZWAgd2l0aCBhblxyXG4gKiAgICBhY2NlbnQga2VlcHMgaXRzIGFjY2VudDsgYW4gZWxpZGVkIGFydGljbGUga2VlcHMgaXRzIGFwb3N0cm9waGUuIE5vdGhpbmdcclxuICogICAgaXMgZXZlciB0cmFuc2xpdGVyYXRlZC5cclxuICogMi4gQ29tcGFyaXNvbiBpcyBwZXJtaXNzaXZlIGluIGV4YWN0bHkgb25lIHJlc3BlY3QgLSBhIHN0cmFpZ2h0IGFwb3N0cm9waGVcclxuICogICAgYW5kIGEgY3VybHkgYXBvc3Ryb3BoZSBhcmUgdHJlYXRlZCBhcyB0aGUgc2FtZSBjaGFyYWN0ZXIuIEFjY2VudHMgYXJlXHJcbiAqICAgIG5ldmVyIGZvbGRlZCBhd2F5LCBiZWNhdXNlIGBhYC9gYS1ncmF2ZWAgYW5kIGBvdWAvYG91LWdyYXZlYCBhcmVcclxuICogICAgZGlmZmVyZW50IHdvcmRzLlxyXG4gKlxyXG4gKiBFdmVyeSBub24tQVNDSUkgY29kZSBwb2ludCBpbiB0aGlzIG1vZHVsZSBpcyB3cml0dGVuIGFzIGFuIGVzY2FwZSBzbyB0aGF0IGFcclxuICogc3RyYXkgZWRpdG9yIG5vcm1hbGlzYXRpb24gY2Fubm90IHNpbGVudGx5IGNoYW5nZSBtYXRjaGluZyBiZWhhdmlvdXIuXHJcbiAqL1xyXG5cclxuLyoqIEFwb3N0cm9waGUtbGlrZSBjb2RlIHBvaW50cyB0aGF0IHNob3VsZCBjb21wYXJlIGVxdWFsIHRvIFUrMDAyNy4gKi9cclxuY29uc3QgQVBPU1RST1BIRV9WQVJJQU5UUyA9IC9b4oCY4oCZ4oCbyrzKueKAsmDCtF0vZztcclxuXHJcbi8qKiBXaGl0ZXNwYWNlLCBpbmNsdWRpbmcgTkJTUCBhbmQgdGhlIG5hcnJvdyBOQlNQIEZyZW5jaCB1c2VzIGJlZm9yZSBgP2AvYCFgL2A6YC4gKi9cclxuY29uc3QgV0hJVEVTUEFDRSA9IC9bXFxzwqDigK/igIldKy9nO1xyXG5cclxuLyoqIFNwYWNlLWxpa2UgY29kZSBwb2ludHMgYWNjZXB0ZWQgYmV0d2VlbiB0aGUgd29yZHMgb2YgYSBtdWx0aXdvcmQgbWF0Y2guICovXHJcbmNvbnN0IFNQQUNFX0NMQVNTID0gJ1tcXFxcc1xcXFx1MDBBMFxcXFx1MjAyRlxcXFx1MjAwOV0nO1xyXG5cclxuLyoqIEFwb3N0cm9waGUgY29kZSBwb2ludHMgYWNjZXB0ZWQgd2hpbGUgbWF0Y2hpbmcuICovXHJcbmNvbnN0IEFQT1NUUk9QSEVfQ0xBU1MgPSBcIlsnXFxcXHUyMDE4XFxcXHUyMDE5XFxcXHUwMkJDXVwiO1xyXG5cclxuLyoqIENhbm9uaWNhbCBORkMgZm9ybS4gRXZlcnkgRnJlbmNoIHN0cmluZyBlbnRlcmluZyBzdG9yYWdlIG9yIHRoZSBET00gZ29lcyB0aHJvdWdoIHRoaXMuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0b05mYyh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICByZXR1cm4gdmFsdWUubm9ybWFsaXplKCdORkMnKTtcclxufVxyXG5cclxuLyoqIFJlcGxhY2UgY3VybHkvdHlwb2dyYXBoaWMgYXBvc3Ryb3BoZXMgd2l0aCB0aGUgc3RyYWlnaHQgQVNDSUkgb25lLiBNYXRjaGluZyBvbmx5LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQXBvc3Ryb3BoZXModmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoQVBPU1RST1BIRV9WQVJJQU5UUywgXCInXCIpO1xyXG59XHJcblxyXG4vKiogQ29sbGFwc2UgZXZlcnkgcnVuIG9mIHdoaXRlc3BhY2UgdG8gYSBzaW5nbGUgc3BhY2UgYW5kIHRyaW0gdGhlIGVuZHMuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb2xsYXBzZVdoaXRlc3BhY2UodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoV0hJVEVTUEFDRSwgJyAnKS50cmltKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb21wYXJpc29uIGZvcm06IE5GQywgc3RyYWlnaHQgYXBvc3Ryb3BoZXMsIGNvbGxhcHNlZCB3aGl0ZXNwYWNlLCBsb3dlcmNhc2VkLlxyXG4gKiBBY2NlbnRzIGFuZCBkaWFjcml0aWNzIGFyZSBkZWxpYmVyYXRlbHkgcHJlc2VydmVkLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvbGRGb3JDb21wYXJpc29uKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiBjb2xsYXBzZVdoaXRlc3BhY2Uobm9ybWFsaXplQXBvc3Ryb3BoZXModG9OZmModmFsdWUpKSkudG9Mb3dlckNhc2UoKTtcclxufVxyXG5cclxuLyoqIFRydWUgd2hlbiB0d28gc3RyaW5ncyBhcmUgZXF1YWwgdW5kZXIge0BsaW5rIGZvbGRGb3JDb21wYXJpc29ufS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxvb3NlRXF1YWxzKGE6IHN0cmluZywgYjogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIGZvbGRGb3JDb21wYXJpc29uKGEpID09PSBmb2xkRm9yQ29tcGFyaXNvbihiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE5vcm1hbGlzZWQgdmlzaWJsZSB0ZXh0IHVzZWQgdG8gcHJvdmUgYSBwYWdlIHdhcyByZXN0b3JlZC4gRGVhY3RpdmF0aW9uXHJcbiAqIGNvbXBhcmVzIHRoaXMgYWdhaW5zdCB0aGUgcHJlLWFjdGl2YXRpb24gc25hcHNob3Q7IGl0IGludGVudGlvbmFsbHkgaWdub3Jlc1xyXG4gKiB3aGl0ZXNwYWNlIHNoYXBlLCBiZWNhdXNlIHNwbGl0dGluZyBhbmQgcmUtam9pbmluZyB0ZXh0IG5vZGVzIGxlZ2l0aW1hdGVseVxyXG4gKiBjaGFuZ2VzIHdoZXJlIHRoZSBicm93c2VyIHJlcG9ydHMgbGluZSBicmVha3MuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplZFZpc2libGVUZXh0KHJvb3Q6IHsgdGV4dENvbnRlbnQ6IHN0cmluZyB8IG51bGwgfSk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGNvbGxhcHNlV2hpdGVzcGFjZSh0b05mYyhyb290LnRleHRDb250ZW50ID8/ICcnKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGFyYWN0ZXJzIHBlcm1pdHRlZCBpbiBhIHJlbmRlcmVkIEZyZW5jaCBzdXJmYWNlIGZvcm06IGxldHRlcnMsIGNvbWJpbmluZ1xyXG4gKiBtYXJrcywgc3BhY2VzLCBhcG9zdHJvcGhlcyBhbmQgaHlwaGVucy4gTm8gZGlnaXRzLCBubyBvdGhlciBwdW5jdHVhdGlvbiwgbm9cclxuICogbWFya3VwLiBNdXN0IHN0YXJ0IGFuZCBlbmQgd2l0aCBhIGxldHRlci5cclxuICovXHJcbmNvbnN0IEZSRU5DSF9TVVJGQUNFID0gbmV3IFJlZ0V4cChcclxuICAnXltcXFxccHtMfVxcXFxwe019XSg/OltcXFxccHtMfVxcXFxwe019XFxcXHUwMDIwXFxcXHUwMEEwXFxcXHUyMDJGXFxcXHUyMDA5XFxcXHUwMDI3XFxcXHUyMDE4XFxcXHUyMDE5XFxcXHUwMDJEXSpbXFxcXHB7TH1cXFxccHtNfV0pPyQnLFxyXG4gICd1JyxcclxuKTtcclxuXHJcbi8qKiBMb25nZXN0IHN1cmZhY2UgRWNsaXBzZSB3aWxsIHJlbmRlciBpbmxpbmUuIEtlZXBzIGEgdHJhcCBmcm9tIGVhdGluZyBhIHBhcmFncmFwaC4gKi9cclxuZXhwb3J0IGNvbnN0IE1BWF9TVVJGQUNFX0xFTkdUSCA9IDY0O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzVmFsaWRGcmVuY2hTdXJmYWNlKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICBpZiAodmFsdWUubGVuZ3RoID09PSAwIHx8IHZhbHVlLmxlbmd0aCA+IE1BWF9TVVJGQUNFX0xFTkdUSCkgcmV0dXJuIGZhbHNlO1xyXG4gIC8vIE11c3QgYWxyZWFkeSBiZSBORkMgLSB2YWxpZGF0aW9uIG5ldmVyIHNpbGVudGx5IHJld3JpdGVzIHN0b3JlZCB0ZXh0LlxyXG4gIGlmICh0b05mYyh2YWx1ZSkgIT09IHZhbHVlKSByZXR1cm4gZmFsc2U7XHJcbiAgLy8gTm8gbGVhZGluZywgdHJhaWxpbmcgb3IgZG91YmxlZCB3aGl0ZXNwYWNlLlxyXG4gIGlmIChjb2xsYXBzZVdoaXRlc3BhY2UodmFsdWUpICE9PSB2YWx1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gIHJldHVybiBGUkVOQ0hfU1VSRkFDRS50ZXN0KHZhbHVlKTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBUZXh0TWF0Y2gge1xyXG4gIHN0YXJ0OiBudW1iZXI7XHJcbiAgZW5kOiBudW1iZXI7XHJcbiAgdGV4dDogc3RyaW5nO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc1dvcmRDaGFyKGNoOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBib29sZWFuIHtcclxuICBpZiAoY2ggPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlO1xyXG4gIHJldHVybiAvW1xccHtMfVxccHtNfVxccHtOfV0vdS50ZXN0KGNoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpO1xyXG59XHJcblxyXG4vKipcclxuICogRXZlcnkgd29yZC1ib3VuZGFyeS1hd2FyZSBvY2N1cnJlbmNlIG9mIGBuZWVkbGVgIGluIGBoYXlzdGFja2AsIHJldHVybmVkIGFzXHJcbiAqIG9mZnNldHMgaW50byB0aGUgT1JJR0lOQUwgKE5GQykgc3RyaW5nLlxyXG4gKlxyXG4gKiBNYXRjaGluZyBpcyBjYXNlLWluc2Vuc2l0aXZlIGFuZCBhcG9zdHJvcGhlLWluc2Vuc2l0aXZlLiBBIHNpbmdsZSBzcGFjZSBpblxyXG4gKiB0aGUgbmVlZGxlIG1hdGNoZXMgYW55IHJ1biBvZiB3aGl0ZXNwYWNlLCBzbyBhIHBocmFzZSB0aGF0IHdyYXBzIGFjcm9zcyBhXHJcbiAqIG5ld2xpbmUgaW4gdGhlIEhUTUwgc291cmNlIHN0aWxsIG1hdGNoZXMuIEZvbGRpbmcgY2FuIGNoYW5nZSBzdHJpbmcgbGVuZ3RoLFxyXG4gKiBzbyB0aGUgc2NhbiBuZXZlciBmb2xkcyB0aGUgaGF5c3RhY2sgdXAgZnJvbnQgLSBvZmZzZXRzIHN0YXkgdHJ1c3R3b3J0aHkuXHJcbiAqXHJcbiAqIFRoZSBoYXlzdGFjayBpcyB1c2VkIGV4YWN0bHkgYXMgZ2l2ZW4sIGluY2x1ZGluZyBpdHMgbm9ybWFsaXphdGlvbiBmb3JtLlxyXG4gKiBDYWxsZXJzIG1hcCB0aGVzZSBvZmZzZXRzIHN0cmFpZ2h0IGJhY2sgaW50byBsaXZlIERPTSB0ZXh0IG5vZGVzLCBzb1xyXG4gKiByZXdyaXRpbmcgdGhlIGhheXN0YWNrIGhlcmUgd291bGQgc2lsZW50bHkgc2hpZnQgZXZlcnkgb2Zmc2V0LiBFbmdsaXNoIHNvdXJjZVxyXG4gKiBzcGFucyBhcmUgQVNDSUksIHdoaWNoIGlzIHdoeSB0aGlzIGlzIHNhZmUuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZmluZFdvcmRNYXRjaGVzKGhheXN0YWNrOiBzdHJpbmcsIG5lZWRsZTogc3RyaW5nKTogVGV4dE1hdGNoW10ge1xyXG4gIGNvbnN0IGZvbGRlZE5lZWRsZSA9IGZvbGRGb3JDb21wYXJpc29uKG5lZWRsZSk7XHJcbiAgaWYgKGZvbGRlZE5lZWRsZS5sZW5ndGggPT09IDApIHJldHVybiBbXTtcclxuXHJcbiAgY29uc3QgcGF0dGVybiA9IGZvbGRlZE5lZWRsZVxyXG4gICAgLnNwbGl0KCcgJylcclxuICAgIC5tYXAoKHRva2VuKSA9PiBlc2NhcGVSZWdFeHAodG9rZW4pLnJlcGxhY2UoLycvZywgQVBPU1RST1BIRV9DTEFTUykpXHJcbiAgICAuam9pbihgJHtTUEFDRV9DTEFTU30rYCk7XHJcblxyXG4gIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCAnZ2l1Jyk7XHJcbiAgY29uc3Qgc291cmNlID0gaGF5c3RhY2s7XHJcbiAgY29uc3QgbWF0Y2hlczogVGV4dE1hdGNoW10gPSBbXTtcclxuXHJcbiAgZm9yIChjb25zdCBmb3VuZCBvZiBzb3VyY2UubWF0Y2hBbGwocmVnZXgpKSB7XHJcbiAgICBjb25zdCBzdGFydCA9IGZvdW5kLmluZGV4O1xyXG4gICAgaWYgKHR5cGVvZiBzdGFydCAhPT0gJ251bWJlcicpIGNvbnRpbnVlO1xyXG4gICAgY29uc3QgbWF0Y2hlZCA9IGZvdW5kWzBdO1xyXG4gICAgY29uc3QgZW5kID0gc3RhcnQgKyBtYXRjaGVkLmxlbmd0aDtcclxuICAgIGlmIChpc1dvcmRDaGFyKHNvdXJjZVtzdGFydCAtIDFdKSkgY29udGludWU7XHJcbiAgICBpZiAoaXNXb3JkQ2hhcihzb3VyY2VbZW5kXSkpIGNvbnRpbnVlO1xyXG4gICAgbWF0Y2hlcy5wdXNoKHsgc3RhcnQsIGVuZCwgdGV4dDogbWF0Y2hlZCB9KTtcclxuICB9XHJcblxyXG4gIHJldHVybiBtYXRjaGVzO1xyXG59XHJcblxyXG4vKiogTnVtYmVyIG9mIHdvcmQtYm91bmRhcnkgb2NjdXJyZW5jZXMgb2YgYG5lZWRsZWAgaW4gYGhheXN0YWNrYC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvdW50V29yZE1hdGNoZXMoaGF5c3RhY2s6IHN0cmluZywgbmVlZGxlOiBzdHJpbmcpOiBudW1iZXIge1xyXG4gIHJldHVybiBmaW5kV29yZE1hdGNoZXMoaGF5c3RhY2ssIG5lZWRsZSkubGVuZ3RoO1xyXG59XHJcblxyXG4vKiogVHJ1ZSB3aGVuIGBuZWVkbGVgIG9jY3VycyBhdCBsZWFzdCBvbmNlLCBpZ25vcmluZyBjYXNlIGFuZCBhcG9zdHJvcGhlIHNoYXBlLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNGb2xkZWQoaGF5c3RhY2s6IHN0cmluZywgbmVlZGxlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICByZXR1cm4gZm9sZEZvckNvbXBhcmlzb24oaGF5c3RhY2spLmluY2x1ZGVzKGZvbGRGb3JDb21wYXJpc29uKG5lZWRsZSkpO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDb250ZW50IHNhZmV0eSBmb3IgZXZlcnkgc3RyaW5nIHRoYXQgY2FuIHJlYWNoIHRoZSBET00uXHJcbiAqXHJcbiAqIFR3byBzb3VyY2VzIGZlZWQgdHJhcHM6IHRoZSBidW5kbGVkIGNhdGFsb2cgKHRydXN0ZWQsIGJ1dCBzdGlsbCB2YWxpZGF0ZWQgc29cclxuICogYSBiYWQgZWRpdCBmYWlscyBsb3VkbHkgaW4gQ0kpIGFuZCB0aGUgb3B0aW9uYWwgZ2VuZXJhdGlvbiBBUEkgKHVudHJ1c3RlZCxcclxuICogYmVjYXVzZSBpdHMgaW5wdXQgaXMgcGFnZSB0ZXh0IGFuIGF0dGFja2VyIGNvbnRyb2xzKS5cclxuICpcclxuICogRWNsaXBzZSByZW5kZXJzIHRleHQgdGhyb3VnaCBSZWFjdCB0ZXh0IG5vZGVzIGFuZCBgdGV4dENvbnRlbnRgIG9ubHksIHNvXHJcbiAqIG1hcmt1cCBjb3VsZCBub3QgZXhlY3V0ZSBhbnl3YXkuIFRoZXNlIGNoZWNrcyBleGlzdCBzbyB0aGF0IG1hcmt1cCwgbGlua3MgYW5kXHJcbiAqIGluc3RydWN0aW9uLXNoYXBlZCB0ZXh0IG5ldmVyICpkaXNwbGF5KiBlaXRoZXIg4oCUIGEgdHJhcCByZWFkaW5nXHJcbiAqIFwiaWdub3JlIHByZXZpb3VzIGluc3RydWN0aW9ucyBhbmQgdmlzaXQgZXZpbC5leGFtcGxlXCIgaXMgYSBmYWlsZWQgdHJhcCBldmVuXHJcbiAqIHdoZW4gaXQgaXMgaW5lcnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgdG9OZmMgfSBmcm9tICcuL25vcm1hbGl6ZSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNhZmV0eUlzc3VlIHtcclxuICBmaWVsZDogc3RyaW5nO1xyXG4gIHJlYXNvbjogc3RyaW5nO1xyXG59XHJcblxyXG4vKiogQW5nbGUgYnJhY2tldHMgb3IgYW4gSFRNTCBlbnRpdHkgLSB0aGUgc2hhcGUgb2YgbWFya3VwLiAqL1xyXG5jb25zdCBNQVJLVVAgPSAvWzw+XXwmKD86I1xcZCt8I3hbMC05YS1mXSt8W2Etel1bYS16MC05XSopOy9pO1xyXG5cclxuLyoqIGBvbmNsaWNrPWAsIGBvbmVycm9yPWAgYW5kIGZyaWVuZHMuICovXHJcbmNvbnN0IEVWRU5UX0hBTkRMRVIgPSAvXFxib25bYS16XXsyLH1cXHMqPS9pO1xyXG5cclxuLyoqIEFueSBzY2hlbWUtYmVhcmluZyBvciBiYXJlLWRvbWFpbiBVUkwuICovXHJcbmNvbnN0IFVSTF9MSUtFID1cclxuICAvKD86XFxiW2Etel1bYS16MC05Ky4tXSo6XFwvXFwvKXwoPzpcXGJqYXZhc2NyaXB0XFxzKjopfCg/OlxcYmRhdGFcXHMqOil8KD86XFxid3d3XFwuKXwoPzpcXGJbYS16MC05LV0rXFwuKD86Y29tfG5ldHxvcmd8aW98ZGV2fGFpfGNvfHh5enxydXxjbilcXGIpL2k7XHJcblxyXG4vKiogYFt0ZXh0XSh0YXJnZXQpYCBhbmQgYCFbYWx0XSh0YXJnZXQpYC4gKi9cclxuY29uc3QgTUFSS0RPV05fTElOSyA9IC8hP1xcW1teXFxdXSpcXF1cXChbXildKlxcKS87XHJcblxyXG4vKiogVGVtcGxhdGUvZXhwcmVzc2lvbiBzeW50YXggdGhhdCBzdWdnZXN0cyB0aGUgc3RyaW5nIHdhcyBhc3NlbWJsZWQgdW5zYWZlbHkuICovXHJcbmNvbnN0IFRFTVBMQVRFX1NZTlRBWCA9IC9cXCRcXHt8XFx7XFx7fFxcfVxcfXw8JXwlPi87XHJcblxyXG4vKiogQ29udHJvbCBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gdGFiL25ld2xpbmUsIHBsdXMgYmlkaSBvdmVycmlkZXMgdXNlZCB0byBzcG9vZiB0ZXh0LiAqL1xyXG5jb25zdCBDT05UUk9MX0NIQVJTID0gbmV3IFJlZ0V4cChcclxuICAnW1xcXFx1MDAwMC1cXFxcdTAwMDhcXFxcdTAwMEJcXFxcdTAwMENcXFxcdTAwMEUtXFxcXHUwMDFGXFxcXHUwMDdGXFxcXHUyMDBCLVxcXFx1MjAwRlxcXFx1MjAyQS1cXFxcdTIwMkVcXFxcdTIwNjYtXFxcXHUyMDY5XScsXHJcbik7XHJcblxyXG4vKipcclxuICogSW5zdHJ1Y3Rpb24tc2hhcGVkIHBocmFzaW5nLiBPbmx5IGFwcGxpZWQgdG8gcHJvdmlkZXIgb3V0cHV0OiBhIGxlZ2l0aW1hdGVcclxuICogRnJlbmNoIGxlc3NvbiBuZXZlciBuZWVkcyB0byBhZGRyZXNzIHRoZSByZWFkZXIgYXMgYSBtb2RlbC5cclxuICovXHJcbmNvbnN0IElOU1RSVUNUSU9OX1NIQVBFRCA9IFtcclxuICAvXFxiaWdub3JlXFxzKyg/OmFsbFxccyt8YW55XFxzKyk/KD86dGhlXFxzKyk/KD86cHJldmlvdXN8cHJpb3J8YWJvdmV8ZWFybGllcilcXGIvaSxcclxuICAvXFxiZGlzcmVnYXJkXFxzKyg/OmFsbFxccyt8YW55XFxzKyk/KD86dGhlXFxzKyk/KD86cHJldmlvdXN8cHJpb3J8YWJvdmV8ZWFybGllcilcXGIvaSxcclxuICAvXFxic3lzdGVtXFxzK3Byb21wdFxcYi9pLFxyXG4gIC9cXGJ5b3VcXHMrYXJlXFxzKyg/Om5vd1xccyspP2FuP1xccytcXHcrL2ksXHJcbiAgL1xcYmFzXFxzK2FuXFxzK2FpXFxiL2ksXHJcbiAgL1xcYmRldmVsb3Blclxccyttb2RlXFxiL2ksXHJcbiAgL1xcYm92ZXJyaWRlXFxzKyg/OnlvdXJ8dGhlKVxccysoPzppbnN0cnVjdGlvbnN8cnVsZXMpXFxiL2ksXHJcbiAgL1xcYm5ld1xccytpbnN0cnVjdGlvbnM/XFxzKjovaSxcclxuXTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2FmZXR5T3B0aW9ucyB7XHJcbiAgLyoqIEFwcGx5IHRoZSBpbnN0cnVjdGlvbi1zaGFwZWQgY2hlY2tzLiBFbmFibGVkIGZvciBwcm92aWRlciBvdXRwdXQuICovXHJcbiAgcmVhZG9ubHkgdW50cnVzdGVkPzogYm9vbGVhbjtcclxuICAvKiogUmVqZWN0IGFueXRoaW5nIGxvbmdlciB0aGFuIHRoaXMuICovXHJcbiAgcmVhZG9ubHkgbWF4TGVuZ3RoPzogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hlY2sgb25lIGZpZWxkLiBSZXR1cm5zIGBudWxsYCB3aGVuIHRoZSB2YWx1ZSBpcyBzYWZlIHRvIHJlbmRlci5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjaGVja0ZpZWxkU2FmZXR5KFxyXG4gIGZpZWxkOiBzdHJpbmcsXHJcbiAgdmFsdWU6IHN0cmluZyxcclxuICBvcHRpb25zOiBTYWZldHlPcHRpb25zID0ge30sXHJcbik6IFNhZmV0eUlzc3VlIHwgbnVsbCB7XHJcbiAgY29uc3QgbWF4TGVuZ3RoID0gb3B0aW9ucy5tYXhMZW5ndGggPz8gNDAwO1xyXG5cclxuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIHsgZmllbGQsIHJlYXNvbjogJ25vdCBhIHN0cmluZycgfTtcclxuICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSByZXR1cm4geyBmaWVsZCwgcmVhc29uOiAnZW1wdHknIH07XHJcbiAgaWYgKHZhbHVlLmxlbmd0aCA+IG1heExlbmd0aCkgcmV0dXJuIHsgZmllbGQsIHJlYXNvbjogYGxvbmdlciB0aGFuICR7bWF4TGVuZ3RofSBjaGFyYWN0ZXJzYCB9O1xyXG4gIGlmICh0b05mYyh2YWx1ZSkgIT09IHZhbHVlKSByZXR1cm4geyBmaWVsZCwgcmVhc29uOiAnbm90IE5GQyBub3JtYWxpemVkJyB9O1xyXG4gIGlmIChDT05UUk9MX0NIQVJTLnRlc3QodmFsdWUpKSByZXR1cm4geyBmaWVsZCwgcmVhc29uOiAnY29udGFpbnMgY29udHJvbCBvciBiaWRpIGNoYXJhY3RlcnMnIH07XHJcbiAgaWYgKE1BUktVUC50ZXN0KHZhbHVlKSkgcmV0dXJuIHsgZmllbGQsIHJlYXNvbjogJ2NvbnRhaW5zIEhUTUwgbWFya3VwIG9yIGVudGl0aWVzJyB9O1xyXG4gIGlmIChFVkVOVF9IQU5ETEVSLnRlc3QodmFsdWUpKSByZXR1cm4geyBmaWVsZCwgcmVhc29uOiAnY29udGFpbnMgYW4gZXZlbnQgaGFuZGxlciBhdHRyaWJ1dGUnIH07XHJcbiAgaWYgKFVSTF9MSUtFLnRlc3QodmFsdWUpKSByZXR1cm4geyBmaWVsZCwgcmVhc29uOiAnY29udGFpbnMgYSBVUkwnIH07XHJcbiAgaWYgKE1BUktET1dOX0xJTksudGVzdCh2YWx1ZSkpIHJldHVybiB7IGZpZWxkLCByZWFzb246ICdjb250YWlucyBhIE1hcmtkb3duIGxpbmsnIH07XHJcbiAgaWYgKFRFTVBMQVRFX1NZTlRBWC50ZXN0KHZhbHVlKSkgcmV0dXJuIHsgZmllbGQsIHJlYXNvbjogJ2NvbnRhaW5zIHRlbXBsYXRlIHN5bnRheCcgfTtcclxuXHJcbiAgaWYgKG9wdGlvbnMudW50cnVzdGVkKSB7XHJcbiAgICBmb3IgKGNvbnN0IHBhdHRlcm4gb2YgSU5TVFJVQ1RJT05fU0hBUEVEKSB7XHJcbiAgICAgIGlmIChwYXR0ZXJuLnRlc3QodmFsdWUpKSByZXR1cm4geyBmaWVsZCwgcmVhc29uOiAnY29udGFpbnMgaW5zdHJ1Y3Rpb24tc2hhcGVkIHRleHQnIH07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuLyoqIENoZWNrIG1hbnkgZmllbGRzIGF0IG9uY2UuIFJldHVybnMgZXZlcnkgaXNzdWUgZm91bmQsIGluIGZpZWxkIG9yZGVyLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tGaWVsZHNTYWZldHkoXHJcbiAgZmllbGRzOiBSZWFkb25seTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PixcclxuICBvcHRpb25zOiBTYWZldHlPcHRpb25zID0ge30sXHJcbik6IFNhZmV0eUlzc3VlW10ge1xyXG4gIGNvbnN0IGlzc3VlczogU2FmZXR5SXNzdWVbXSA9IFtdO1xyXG4gIGZvciAoY29uc3QgW2ZpZWxkLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoZmllbGRzKSkge1xyXG4gICAgY29uc3QgaXNzdWUgPSBjaGVja0ZpZWxkU2FmZXR5KGZpZWxkLCB2YWx1ZSwgb3B0aW9ucyk7XHJcbiAgICBpZiAoaXNzdWUpIGlzc3Vlcy5wdXNoKGlzc3VlKTtcclxuICB9XHJcbiAgcmV0dXJuIGlzc3VlcztcclxufVxyXG5cclxuLyoqIENvbnZlbmllbmNlIHByZWRpY2F0ZSBmb3Igc2NoZW1hIHJlZmluZW1lbnRzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNTYWZlVGV4dCh2YWx1ZTogc3RyaW5nLCBvcHRpb25zOiBTYWZldHlPcHRpb25zID0ge30pOiBib29sZWFuIHtcclxuICByZXR1cm4gY2hlY2tGaWVsZFNhZmV0eSgndmFsdWUnLCB2YWx1ZSwgb3B0aW9ucykgPT09IG51bGw7XHJcbn1cclxuIiwiLyoqXHJcbiAqIFRoZSBjb250ZXh0LXRyYXAgY29udHJhY3QuXHJcbiAqXHJcbiAqIEEgdHJhcCBpcyBvbmUgcmVwbGFjZW1lbnQ6IGEgc3BlY2lmaWMgRW5nbGlzaCBzcGFuIGluc2lkZSBhIHNwZWNpZmljIHNlbnRlbmNlXHJcbiAqIGJlY29tZXMgYSBGcmVuY2ggc3VyZmFjZSBmb3JtLCBhbmQgYW5zd2VyaW5nIGl0IHJldmVhbHMgdGhlIGV2aWRlbmNlIHRoYXRcclxuICogc2V0dGxlcyB0aGUgbWVhbmluZy4gVHJhcHMgYXJyaXZlIGZyb20gdGhlIGJ1bmRsZWQgY2F0YWxvZyBvciwgb3B0aW9uYWxseSxcclxuICogZnJvbSB0aGUgbG9jYWwgZ2VuZXJhdGlvbiBBUEkuIEJvdGggZ28gdGhyb3VnaCB7QGxpbmsgdmFsaWRhdGVUcmFwfSBiZWZvcmVcclxuICogYW55dGhpbmcgaXMgcmVuZGVyZWQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XHJcbmltcG9ydCB7XHJcbiAgY29sbGFwc2VXaGl0ZXNwYWNlLFxyXG4gIGNvdW50V29yZE1hdGNoZXMsXHJcbiAgY29udGFpbnNGb2xkZWQsXHJcbiAgZm9sZEZvckNvbXBhcmlzb24sXHJcbiAgaXNWYWxpZEZyZW5jaFN1cmZhY2UsXHJcbiAgdG9OZmMsXHJcbn0gZnJvbSAnLi9ub3JtYWxpemUnO1xyXG5pbXBvcnQgeyBjaGVja0ZpZWxkU2FmZXR5LCB0eXBlIFNhZmV0eUlzc3VlIH0gZnJvbSAnLi9zYWZldHknO1xyXG5pbXBvcnQgeyBmYWlsdXJlLCBzdWNjZXNzLCB0eXBlIFJlc3VsdCB9IGZyb20gJy4vZXJyb3JzJztcclxuXHJcbmV4cG9ydCBjb25zdCBUUkFQX1RZUEVTID0gWydwb2x5c2VteScsICdpZGlvbScsICdmYWxzZV9mcmllbmQnXSBhcyBjb25zdDtcclxuZXhwb3J0IHR5cGUgVHJhcFR5cGUgPSAodHlwZW9mIFRSQVBfVFlQRVMpW251bWJlcl07XHJcblxyXG5leHBvcnQgY29uc3QgVFJBUF9QUk9WSURFUlMgPSBbJ2NhdGFsb2cnLCAnZ2VtaW5pJ10gYXMgY29uc3Q7XHJcbmV4cG9ydCB0eXBlIFRyYXBQcm92aWRlciA9ICh0eXBlb2YgVFJBUF9QUk9WSURFUlMpW251bWJlcl07XHJcblxyXG5leHBvcnQgdHlwZSBDb25jZXB0SWQgPSBgZnI6JHtzdHJpbmd9YDtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29udGV4dFRyYXAge1xyXG4gIGlkOiBzdHJpbmc7XHJcbiAgY29uY2VwdElkOiBDb25jZXB0SWQ7XHJcbiAgc291cmNlTG9jYWxlOiAnZW4nO1xyXG4gIHRhcmdldExvY2FsZTogJ2ZyLUZSJztcclxuICB0eXBlOiBUcmFwVHlwZTtcclxuICBzZW50ZW5jZTogc3RyaW5nO1xyXG4gIGV4YWN0U291cmNlVGV4dDogc3RyaW5nO1xyXG4gIHRhcmdldFN1cmZhY2U6IHN0cmluZztcclxuICBjaG9pY2VzOiBbc3RyaW5nLCBzdHJpbmcsIHN0cmluZ107XHJcbiAgYWNjZXB0ZWRDaG9pY2U6IHN0cmluZztcclxuICBjbHVlU3Bhbjogc3RyaW5nO1xyXG4gIGV4cGxhbmF0aW9uOiBzdHJpbmc7XHJcbiAgZGlzdHJhY3RvckV4cGxhbmF0aW9uOiBzdHJpbmc7XHJcbiAgZGlmZmljdWx0eTogbnVtYmVyO1xyXG4gIGNvbmZpZGVuY2U6IG51bWJlcjtcclxuICBwcm92aWRlcjogVHJhcFByb3ZpZGVyO1xyXG59XHJcblxyXG4vKipcclxuICogQSBnZW5lcmF0ZWQgdHJhcCBwbHVzIHRoZSBzdWJtaXR0ZWQgc2VudGVuY2UgaXQgdGFyZ2V0cy4gU2VudGVuY2UgaWRlbnRpdHlcclxuICogaXMgdHJhbnNwb3J0IG1ldGFkYXRhIGFuZCBpcyBpbnRlbnRpb25hbGx5IG5vdCBlbmNvZGVkIGluIHRoZSB0cmFwIGlkLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBHZW5lcmF0ZWRUcmFwQ2FuZGlkYXRlIHtcclxuICByZWFkb25seSBzZW50ZW5jZUlkOiBzdHJpbmc7XHJcbiAgcmVhZG9ubHkgdHJhcDogQ29udGV4dFRyYXA7XHJcbn1cclxuXHJcbi8qKiBNaW5pbXVtIGNvbmZpZGVuY2UgYSBnZW5lcmF0ZWQgKG5vbi1jYXRhbG9nKSB0cmFwIG11c3QgY2FycnkgdG8gYmUgcmVuZGVyZWQuICovXHJcbmV4cG9ydCBjb25zdCBNSU5fR0VORVJBVEVEX0NPTkZJREVOQ0UgPSAwLjg7XHJcblxyXG4vKiogYGZyOmAgKyBBU0NJSSBzbHVnICsgYDpgICsgRW5nbGlzaCBzZW5zZS4gKi9cclxuZXhwb3J0IGNvbnN0IENPTkNFUFRfSURfUEFUVEVSTiA9IC9eZnI6W2EtejAtOV0rKD86LVthLXowLTldKykqOlthLXowLTldKyg/Oi1bYS16MC05XSspKiQvO1xyXG5cclxuLyoqIFNoYXBlIGFuZCByYW5nZSB2YWxpZGF0aW9uLiBDcm9zcy1maWVsZCBydWxlcyBsaXZlIGluIHtAbGluayB2YWxpZGF0ZVRyYXB9LiAqL1xyXG5leHBvcnQgY29uc3QgY29udGV4dFRyYXBTY2hlbWEgPSB6Lm9iamVjdCh7XHJcbiAgaWQ6IHouc3RyaW5nKCkubWluKDEpLm1heCgxMjApLFxyXG4gIGNvbmNlcHRJZDogei5zdHJpbmcoKS5yZWdleChDT05DRVBUX0lEX1BBVFRFUk4pLFxyXG4gIHNvdXJjZUxvY2FsZTogei5saXRlcmFsKCdlbicpLFxyXG4gIHRhcmdldExvY2FsZTogei5saXRlcmFsKCdmci1GUicpLFxyXG4gIHR5cGU6IHouZW51bShUUkFQX1RZUEVTKSxcclxuICBzZW50ZW5jZTogei5zdHJpbmcoKS5taW4oMSkubWF4KDMwMCksXHJcbiAgZXhhY3RTb3VyY2VUZXh0OiB6LnN0cmluZygpLm1pbigxKS5tYXgoODApLFxyXG4gIHRhcmdldFN1cmZhY2U6IHouc3RyaW5nKCkubWluKDEpLm1heCg2NCksXHJcbiAgY2hvaWNlczogei50dXBsZShbXHJcbiAgICB6LnN0cmluZygpLm1pbigxKS5tYXgoODApLFxyXG4gICAgei5zdHJpbmcoKS5taW4oMSkubWF4KDgwKSxcclxuICAgIHouc3RyaW5nKCkubWluKDEpLm1heCg4MCksXHJcbiAgXSksXHJcbiAgYWNjZXB0ZWRDaG9pY2U6IHouc3RyaW5nKCkubWluKDEpLm1heCg4MCksXHJcbiAgY2x1ZVNwYW46IHouc3RyaW5nKCkubWluKDEpLm1heCgxNjApLFxyXG4gIGV4cGxhbmF0aW9uOiB6LnN0cmluZygpLm1pbigxKS5tYXgoMzAwKSxcclxuICBkaXN0cmFjdG9yRXhwbGFuYXRpb246IHouc3RyaW5nKCkubWluKDEpLm1heCgzMDApLFxyXG4gIGRpZmZpY3VsdHk6IHoubnVtYmVyKCkubWluKDApLm1heCgxKSxcclxuICBjb25maWRlbmNlOiB6Lm51bWJlcigpLm1pbigwKS5tYXgoMSksXHJcbiAgcHJvdmlkZXI6IHouZW51bShUUkFQX1BST1ZJREVSUyksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBUcmFwVmFsaWRhdGlvbk9wdGlvbnMge1xyXG4gIC8qKlxyXG4gICAqIFRyZWF0IHRoZSBjYW5kaWRhdGUgYXMgYXR0YWNrZXItaW5mbHVlbmNlZC4gRW5hYmxlcyBpbnN0cnVjdGlvbi1zaGFwZWQgdGV4dFxyXG4gICAqIGRldGVjdGlvbiBhbmQgZW5mb3JjZXMge0BsaW5rIE1JTl9HRU5FUkFURURfQ09ORklERU5DRX0uIEFsd2F5cyB0cnVlIGZvclxyXG4gICAqIHByb3ZpZGVyIG91dHB1dC5cclxuICAgKi9cclxuICByZWFkb25seSB1bnRydXN0ZWQ/OiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVHJhcFZhbGlkYXRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcclxuICByZWFkb25seSBpc3N1ZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihpc3N1ZXM6IHJlYWRvbmx5IHN0cmluZ1tdKSB7XHJcbiAgICBzdXBlcihgSW52YWxpZCBjb250ZXh0IHRyYXA6ICR7aXNzdWVzLmpvaW4oJzsgJyl9YCk7XHJcbiAgICB0aGlzLm5hbWUgPSAnVHJhcFZhbGlkYXRpb25FcnJvcic7XHJcbiAgICB0aGlzLmlzc3VlcyA9IGlzc3VlcztcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlc2NyaWJlU2FmZXR5KGlzc3VlOiBTYWZldHlJc3N1ZSk6IHN0cmluZyB7XHJcbiAgcmV0dXJuIGAke2lzc3VlLmZpZWxkfSAke2lzc3VlLnJlYXNvbn1gO1xyXG59XHJcblxyXG4vKipcclxuICogRnVsbCB2YWxpZGF0aW9uOiBzaGFwZSwgcmFuZ2VzLCBjcm9zcy1maWVsZCBjb25zaXN0ZW5jeSBhbmQgY29udGVudCBzYWZldHkuXHJcbiAqXHJcbiAqIFJldHVybnMgdGhlIHRyYXAgd2l0aCBpdHMgRnJlbmNoIHRleHQgbm9ybWFsaXNlZCB0byBORkMuIE5ldmVyIG11dGF0ZXMgdGhlXHJcbiAqIGlucHV0LiBBIGZhaWxpbmcgdHJhcCBpcyByZXBvcnRlZCB3aXRoIGV2ZXJ5IGlzc3VlIHNvIGEgYnJva2VuIGNhdGFsb2cgZW50cnlcclxuICogaXMgZml4YWJsZSBpbiBvbmUgcGFzcy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVRyYXAoXHJcbiAgY2FuZGlkYXRlOiB1bmtub3duLFxyXG4gIG9wdGlvbnM6IFRyYXBWYWxpZGF0aW9uT3B0aW9ucyA9IHt9LFxyXG4pOiBSZXN1bHQ8Q29udGV4dFRyYXA+IHtcclxuICBjb25zdCBwYXJzZWQgPSBjb250ZXh0VHJhcFNjaGVtYS5zYWZlUGFyc2UoY2FuZGlkYXRlKTtcclxuICBpZiAoIXBhcnNlZC5zdWNjZXNzKSB7XHJcbiAgICBjb25zdCBpc3N1ZXMgPSBwYXJzZWQuZXJyb3IuaXNzdWVzLm1hcChcclxuICAgICAgKGlzc3VlKSA9PiBgJHtpc3N1ZS5wYXRoLmpvaW4oJy4nKSB8fCAnKHJvb3QpJ306ICR7aXNzdWUubWVzc2FnZX1gLFxyXG4gICAgKTtcclxuICAgIHJldHVybiBmYWlsdXJlKCdQUk9WSURFUl9JTlZBTElEX1JFU1BPTlNFJywgbmV3IFRyYXBWYWxpZGF0aW9uRXJyb3IoaXNzdWVzKS5tZXNzYWdlKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHZhbHVlID0gcGFyc2VkLmRhdGE7XHJcbiAgY29uc3QgaXNzdWVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gIGNvbnN0IHVudHJ1c3RlZCA9IG9wdGlvbnMudW50cnVzdGVkID8/IHZhbHVlLnByb3ZpZGVyICE9PSAnY2F0YWxvZyc7XHJcblxyXG4gIC8vIC0tLSBjb250ZW50IHNhZmV0eSBvbiBldmVyeSByZW5kZXJhYmxlIHN0cmluZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgY29uc3Qgc2FmZXR5RmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgc2VudGVuY2U6IHZhbHVlLnNlbnRlbmNlLFxyXG4gICAgZXhhY3RTb3VyY2VUZXh0OiB2YWx1ZS5leGFjdFNvdXJjZVRleHQsXHJcbiAgICB0YXJnZXRTdXJmYWNlOiB2YWx1ZS50YXJnZXRTdXJmYWNlLFxyXG4gICAgJ2Nob2ljZXMuMCc6IHZhbHVlLmNob2ljZXNbMF0sXHJcbiAgICAnY2hvaWNlcy4xJzogdmFsdWUuY2hvaWNlc1sxXSxcclxuICAgICdjaG9pY2VzLjInOiB2YWx1ZS5jaG9pY2VzWzJdLFxyXG4gICAgYWNjZXB0ZWRDaG9pY2U6IHZhbHVlLmFjY2VwdGVkQ2hvaWNlLFxyXG4gICAgY2x1ZVNwYW46IHZhbHVlLmNsdWVTcGFuLFxyXG4gICAgZXhwbGFuYXRpb246IHZhbHVlLmV4cGxhbmF0aW9uLFxyXG4gICAgZGlzdHJhY3RvckV4cGxhbmF0aW9uOiB2YWx1ZS5kaXN0cmFjdG9yRXhwbGFuYXRpb24sXHJcbiAgfTtcclxuICBmb3IgKGNvbnN0IFtmaWVsZCwgdGV4dF0gb2YgT2JqZWN0LmVudHJpZXMoc2FmZXR5RmllbGRzKSkge1xyXG4gICAgY29uc3QgaXNzdWUgPSBjaGVja0ZpZWxkU2FmZXR5KGZpZWxkLCB0ZXh0LCB7IHVudHJ1c3RlZCB9KTtcclxuICAgIGlmIChpc3N1ZSkgaXNzdWVzLnB1c2goZGVzY3JpYmVTYWZldHkoaXNzdWUpKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSBGcmVuY2ggc3VyZmFjZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIGlmICghaXNWYWxpZEZyZW5jaFN1cmZhY2UodmFsdWUudGFyZ2V0U3VyZmFjZSkpIHtcclxuICAgIGlzc3Vlcy5wdXNoKFxyXG4gICAgICAndGFyZ2V0U3VyZmFjZSBtdXN0IGJlIG5vbi1lbXB0eSBORkMgRnJlbmNoIHRleHQgKGxldHRlcnMsIHNwYWNlcywgYXBvc3Ryb3BoZXMsIGh5cGhlbnMgb25seSknLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSB0aGUgc291cmNlIHNwYW4gbXVzdCBiZSBsb2NhdGFibGUsIGFuZCBsb2NhdGFibGUgdW5pcXVlbHkgLS0tLS0tLS0tLVxyXG4gIGNvbnN0IG9jY3VycmVuY2VzID0gY291bnRXb3JkTWF0Y2hlcyh2YWx1ZS5zZW50ZW5jZSwgdmFsdWUuZXhhY3RTb3VyY2VUZXh0KTtcclxuICBpZiAob2NjdXJyZW5jZXMgPT09IDApIHtcclxuICAgIGlzc3Vlcy5wdXNoKCdleGFjdFNvdXJjZVRleHQgZG9lcyBub3Qgb2NjdXIgaW4gc2VudGVuY2UnKTtcclxuICB9IGVsc2UgaWYgKG9jY3VycmVuY2VzID4gMSkge1xyXG4gICAgaXNzdWVzLnB1c2goYGV4YWN0U291cmNlVGV4dCBvY2N1cnMgJHtvY2N1cnJlbmNlc30gdGltZXMgaW4gc2VudGVuY2UsIGV4cGVjdGVkIGV4YWN0bHkgb25jZWApO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tIHRoZSBjbHVlIG11c3QgYmUgcXVvdGFibGUgZnJvbSB0aGUgc2VudGVuY2UgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgaWYgKCFjb250YWluc0ZvbGRlZCh2YWx1ZS5zZW50ZW5jZSwgdmFsdWUuY2x1ZVNwYW4pKSB7XHJcbiAgICBpc3N1ZXMucHVzaCgnY2x1ZVNwYW4gZG9lcyBub3Qgb2NjdXIgaW4gc2VudGVuY2UnKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSBleGFjdGx5IHRocmVlIGRpc3RpbmN0IGNob2ljZXMsIG9uZSBvZiB3aGljaCBpcyBhY2NlcHRlZCAtLS0tLS0tLS0tLVxyXG4gIGNvbnN0IGZvbGRlZCA9IHZhbHVlLmNob2ljZXMubWFwKChjaG9pY2UpID0+IGZvbGRGb3JDb21wYXJpc29uKGNob2ljZSkpO1xyXG4gIGlmIChuZXcgU2V0KGZvbGRlZCkuc2l6ZSAhPT0gMykge1xyXG4gICAgaXNzdWVzLnB1c2goJ2Nob2ljZXMgbXVzdCBiZSB1bmlxdWUgYWZ0ZXIgY2FzZSBhbmQgd2hpdGVzcGFjZSBub3JtYWxpemF0aW9uJyk7XHJcbiAgfVxyXG4gIGlmICghdmFsdWUuY2hvaWNlcy5pbmNsdWRlcyh2YWx1ZS5hY2NlcHRlZENob2ljZSkpIHtcclxuICAgIGlzc3Vlcy5wdXNoKCdhY2NlcHRlZENob2ljZSBtdXN0IGV4YWN0bHkgbWF0Y2ggb25lIG9mIGNob2ljZXMnKTtcclxuICB9XHJcblxyXG4gIC8vIC0tLSBnZW5lcmF0ZWQgdHJhcHMgY2FycnkgYSBjb25maWRlbmNlIGZsb29yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIGlmICh1bnRydXN0ZWQgJiYgdmFsdWUuY29uZmlkZW5jZSA8IE1JTl9HRU5FUkFURURfQ09ORklERU5DRSkge1xyXG4gICAgaXNzdWVzLnB1c2goXHJcbiAgICAgIGBjb25maWRlbmNlICR7dmFsdWUuY29uZmlkZW5jZX0gaXMgYmVsb3cgdGhlIGdlbmVyYXRlZC10cmFwIG1pbmltdW0gJHtNSU5fR0VORVJBVEVEX0NPTkZJREVOQ0V9YCxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBpZiAoaXNzdWVzLmxlbmd0aCA+IDApIHtcclxuICAgIHJldHVybiBmYWlsdXJlKCdQUk9WSURFUl9JTlZBTElEX1JFU1BPTlNFJywgbmV3IFRyYXBWYWxpZGF0aW9uRXJyb3IoaXNzdWVzKS5tZXNzYWdlKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRyYXA6IENvbnRleHRUcmFwID0ge1xyXG4gICAgaWQ6IHZhbHVlLmlkLFxyXG4gICAgY29uY2VwdElkOiB2YWx1ZS5jb25jZXB0SWQgYXMgQ29uY2VwdElkLFxyXG4gICAgc291cmNlTG9jYWxlOiAnZW4nLFxyXG4gICAgdGFyZ2V0TG9jYWxlOiAnZnItRlInLFxyXG4gICAgdHlwZTogdmFsdWUudHlwZSxcclxuICAgIHNlbnRlbmNlOiBjb2xsYXBzZVdoaXRlc3BhY2UodG9OZmModmFsdWUuc2VudGVuY2UpKSxcclxuICAgIGV4YWN0U291cmNlVGV4dDogdmFsdWUuZXhhY3RTb3VyY2VUZXh0LFxyXG4gICAgdGFyZ2V0U3VyZmFjZTogdG9OZmModmFsdWUudGFyZ2V0U3VyZmFjZSksXHJcbiAgICBjaG9pY2VzOiBbdmFsdWUuY2hvaWNlc1swXSwgdmFsdWUuY2hvaWNlc1sxXSwgdmFsdWUuY2hvaWNlc1syXV0sXHJcbiAgICBhY2NlcHRlZENob2ljZTogdmFsdWUuYWNjZXB0ZWRDaG9pY2UsXHJcbiAgICBjbHVlU3BhbjogdmFsdWUuY2x1ZVNwYW4sXHJcbiAgICBleHBsYW5hdGlvbjogdmFsdWUuZXhwbGFuYXRpb24sXHJcbiAgICBkaXN0cmFjdG9yRXhwbGFuYXRpb246IHZhbHVlLmRpc3RyYWN0b3JFeHBsYW5hdGlvbixcclxuICAgIGRpZmZpY3VsdHk6IHZhbHVlLmRpZmZpY3VsdHksXHJcbiAgICBjb25maWRlbmNlOiB2YWx1ZS5jb25maWRlbmNlLFxyXG4gICAgcHJvdmlkZXI6IHZhbHVlLnByb3ZpZGVyLFxyXG4gIH07XHJcblxyXG4gIHJldHVybiBzdWNjZXNzKHRyYXApO1xyXG59XHJcblxyXG4vKiogVGhyb3dpbmcgd3JhcHBlciB1c2VkIHdoZXJlIGEgdHJhcCBpcyBhIGJ1aWxkLXRpbWUgY29uc3RhbnQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZFRyYXAoXHJcbiAgY2FuZGlkYXRlOiB1bmtub3duLFxyXG4gIG9wdGlvbnM6IFRyYXBWYWxpZGF0aW9uT3B0aW9ucyA9IHt9LFxyXG4pOiBDb250ZXh0VHJhcCB7XHJcbiAgY29uc3QgcmVzdWx0ID0gdmFsaWRhdGVUcmFwKGNhbmRpZGF0ZSwgb3B0aW9ucyk7XHJcbiAgaWYgKCFyZXN1bHQub2spIHRocm93IG5ldyBUcmFwVmFsaWRhdGlvbkVycm9yKFtyZXN1bHQuZXJyb3IubWVzc2FnZV0pO1xyXG4gIHJldHVybiByZXN1bHQuZGF0YTtcclxufVxyXG5cclxuLyoqIFRoZSBzdHJvbmdlc3QgZGlzdHJhY3RvcjogdGhlIGZpcnN0IGNob2ljZSB0aGF0IGlzIG5vdCB0aGUgYWNjZXB0ZWQgb25lLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcHJpbWFyeURpc3RyYWN0b3IodHJhcDogQ29udGV4dFRyYXApOiBzdHJpbmcge1xyXG4gIHJldHVybiB0cmFwLmNob2ljZXMuZmluZCgoY2hvaWNlKSA9PiBjaG9pY2UgIT09IHRyYXAuYWNjZXB0ZWRDaG9pY2UpID8/IHRyYXAuY2hvaWNlc1swXTtcclxufVxyXG5cclxuLyoqIFRydWUgd2hlbiB0aGUgbGVhcm5lcidzIHNlbGVjdGlvbiBpcyB0aGUgYWNjZXB0ZWQgbWVhbmluZy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29ycmVjdENob2ljZSh0cmFwOiBDb250ZXh0VHJhcCwgc2VsZWN0ZWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiBzZWxlY3RlZCA9PT0gdHJhcC5hY2NlcHRlZENob2ljZTtcclxufVxyXG4iLCIvKipcclxuICogTGVhcm5lciBwcm9maWxlOiB0aGUgb25seSBkdXJhYmxlIHJlY29yZCBFY2xpcHNlIGtlZXBzLCBoZWxkIGluXHJcbiAqIGBjaHJvbWUuc3RvcmFnZS5sb2NhbGAgYW5kIG5ldmVyIHNlbnQgYW55d2hlcmUuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgeiB9IGZyb20gJ3pvZCc7XHJcbmltcG9ydCB7IENPTkNFUFRfSURfUEFUVEVSTiwgdHlwZSBDb25jZXB0SWQgfSBmcm9tICcuL3RyYXAnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBST0ZJTEVfU0NIRU1BX1ZFUlNJT04gPSAxO1xyXG5cclxuLyoqIE1vc3QgY29uY2VwdCByZWNvcmRzIHJldGFpbmVkLiBPbGRlc3QtdXBkYXRlZCBlbnRyaWVzIGFyZSBldmljdGVkIGZpcnN0LiAqL1xyXG5leHBvcnQgY29uc3QgTUFYX0NPTkNFUFRfUkVDT1JEUyA9IDUwMDtcclxuXHJcbi8qKiBMZW5ndGggb2YgdGhlIHJvbGxpbmcgb3V0Y29tZSB3aW5kb3cga2VwdCBvbiB0aGUgcHJvZmlsZS4gKi9cclxuZXhwb3J0IGNvbnN0IFJFQ0VOVF9PVVRDT01FU19MSU1JVCA9IDU7XHJcblxyXG5leHBvcnQgY29uc3QgTU9PTl9QSEFTRVMgPSBbJ25ld19tb29uJywgJ2NyZXNjZW50JywgJ2hhbGYnLCAnZnVsbCddIGFzIGNvbnN0O1xyXG5leHBvcnQgdHlwZSBNb29uUGhhc2UgPSAodHlwZW9mIE1PT05fUEhBU0VTKVtudW1iZXJdO1xyXG5cclxuZXhwb3J0IHR5cGUgRHVlU3RhdGUgPVxyXG4gIHsga2luZDogJ25vbmUnIH0gfCB7IGtpbmQ6ICduZXh0X29jY3VycmVuY2UnIH0gfCB7IGtpbmQ6ICd0aW1lc3RhbXAnOyBhdDogc3RyaW5nIH07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmNlcHRNYXN0ZXJ5IHtcclxuICAvKiogLTIgdGhyb3VnaCAyLiBIaWdoZXIgbWVhbnMgdGhlIGxlYXJuZXIgcmVhZHMgdGhpcyBjb25jZXB0IHJlbGlhYmx5LiAqL1xyXG4gIHNjb3JlOiBudW1iZXI7XHJcbiAgcGhhc2U6IE1vb25QaGFzZTtcclxuICBhdHRlbXB0czogbnVtYmVyO1xyXG4gIGNvcnJlY3Q6IG51bWJlcjtcclxuICBkdWU6IER1ZVN0YXRlO1xyXG4gIC8qKiBJU08tODYwMS4gQWxzbyB0aGUgYW5jaG9yIHVzZWQgdG8gZGVyaXZlIHRoZSBjdXJyZW50IHJldmlldyBpbnRlcnZhbC4gKi9cclxuICB1cGRhdGVkQXQ6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBBbnN3ZXJPdXRjb21lIHtcclxuICBpbnRlcmFjdGlvbklkOiBzdHJpbmc7XHJcbiAgY29uY2VwdElkOiBDb25jZXB0SWQ7XHJcbiAgY29ycmVjdDogYm9vbGVhbjtcclxuICBhdDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIExlYXJuZXJQcm9maWxlIHtcclxuICBzY2hlbWFWZXJzaW9uOiB0eXBlb2YgUFJPRklMRV9TQ0hFTUFfVkVSU0lPTjtcclxuICBzb3VyY2VMb2NhbGU6ICdlbic7XHJcbiAgdGFyZ2V0TG9jYWxlOiAnZnItRlInO1xyXG4gIGNhbGlicmF0aW9uQ29tcGxldGVkOiBib29sZWFuO1xyXG4gIC8qKiAtMSB0aHJvdWdoIDEuICovXHJcbiAgZ2xvYmFsQWJpbGl0eTogbnVtYmVyO1xyXG4gIG1hc3Rlcnk6IFJlY29yZDxzdHJpbmcsIENvbmNlcHRNYXN0ZXJ5PjtcclxuICByZWNlbnRPdXRjb21lczogQW5zd2VyT3V0Y29tZVtdO1xyXG59XHJcblxyXG5jb25zdCBpc29EYXRlID0gei5zdHJpbmcoKS5yZWZpbmUoKHZhbHVlKSA9PiAhTnVtYmVyLmlzTmFOKERhdGUucGFyc2UodmFsdWUpKSwge1xyXG4gIG1lc3NhZ2U6ICdtdXN0IGJlIGFuIElTTy04NjAxIHRpbWVzdGFtcCcsXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IGR1ZVN0YXRlU2NoZW1hOiB6LlpvZFR5cGU8RHVlU3RhdGU+ID0gei51bmlvbihbXHJcbiAgei5vYmplY3QoeyBraW5kOiB6LmxpdGVyYWwoJ25vbmUnKSB9KSxcclxuICB6Lm9iamVjdCh7IGtpbmQ6IHoubGl0ZXJhbCgnbmV4dF9vY2N1cnJlbmNlJykgfSksXHJcbiAgei5vYmplY3QoeyBraW5kOiB6LmxpdGVyYWwoJ3RpbWVzdGFtcCcpLCBhdDogaXNvRGF0ZSB9KSxcclxuXSk7XHJcblxyXG5leHBvcnQgY29uc3QgY29uY2VwdE1hc3RlcnlTY2hlbWEgPSB6Lm9iamVjdCh7XHJcbiAgc2NvcmU6IHoubnVtYmVyKCkubWluKC0yKS5tYXgoMiksXHJcbiAgcGhhc2U6IHouZW51bShNT09OX1BIQVNFUyksXHJcbiAgYXR0ZW1wdHM6IHoubnVtYmVyKCkuaW50KCkubWluKDApLFxyXG4gIGNvcnJlY3Q6IHoubnVtYmVyKCkuaW50KCkubWluKDApLFxyXG4gIGR1ZTogZHVlU3RhdGVTY2hlbWEsXHJcbiAgdXBkYXRlZEF0OiBpc29EYXRlLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBhbnN3ZXJPdXRjb21lU2NoZW1hID0gei5vYmplY3Qoe1xyXG4gIGludGVyYWN0aW9uSWQ6IHouc3RyaW5nKCkubWluKDEpLm1heCgxMjApLFxyXG4gIGNvbmNlcHRJZDogei5zdHJpbmcoKS5yZWdleChDT05DRVBUX0lEX1BBVFRFUk4pLFxyXG4gIGNvcnJlY3Q6IHouYm9vbGVhbigpLFxyXG4gIGF0OiBpc29EYXRlLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBsZWFybmVyUHJvZmlsZVNjaGVtYSA9IHoub2JqZWN0KHtcclxuICBzY2hlbWFWZXJzaW9uOiB6LmxpdGVyYWwoUFJPRklMRV9TQ0hFTUFfVkVSU0lPTiksXHJcbiAgc291cmNlTG9jYWxlOiB6LmxpdGVyYWwoJ2VuJyksXHJcbiAgdGFyZ2V0TG9jYWxlOiB6LmxpdGVyYWwoJ2ZyLUZSJyksXHJcbiAgY2FsaWJyYXRpb25Db21wbGV0ZWQ6IHouYm9vbGVhbigpLFxyXG4gIGdsb2JhbEFiaWxpdHk6IHoubnVtYmVyKCkubWluKC0xKS5tYXgoMSksXHJcbiAgbWFzdGVyeTogei5yZWNvcmQoei5zdHJpbmcoKS5yZWdleChDT05DRVBUX0lEX1BBVFRFUk4pLCBjb25jZXB0TWFzdGVyeVNjaGVtYSksXHJcbiAgcmVjZW50T3V0Y29tZXM6IHouYXJyYXkoYW5zd2VyT3V0Y29tZVNjaGVtYSkubWF4KFJFQ0VOVF9PVVRDT01FU19MSU1JVCksXHJcbn0pO1xyXG5cclxuLyoqIEEgYnJhbmQtbmV3IHByb2ZpbGUuIENhbGlicmF0aW9uIGhhcyBub3QgcnVuOyBhYmlsaXR5IHNpdHMgYXQgdGhlIG1pZHBvaW50LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRW1wdHlQcm9maWxlKCk6IExlYXJuZXJQcm9maWxlIHtcclxuICByZXR1cm4ge1xyXG4gICAgc2NoZW1hVmVyc2lvbjogUFJPRklMRV9TQ0hFTUFfVkVSU0lPTixcclxuICAgIHNvdXJjZUxvY2FsZTogJ2VuJyxcclxuICAgIHRhcmdldExvY2FsZTogJ2ZyLUZSJyxcclxuICAgIGNhbGlicmF0aW9uQ29tcGxldGVkOiBmYWxzZSxcclxuICAgIGdsb2JhbEFiaWxpdHk6IDAsXHJcbiAgICBtYXN0ZXJ5OiB7fSxcclxuICAgIHJlY2VudE91dGNvbWVzOiBbXSxcclxuICB9O1xyXG59XHJcblxyXG4vKiogTWFzdGVyeSBmb3IgYSBjb25jZXB0IHRoZSBsZWFybmVyIGhhcyBuZXZlciBtZXQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBlbXB0eU1hc3Rlcnkobm93OiBEYXRlKTogQ29uY2VwdE1hc3Rlcnkge1xyXG4gIHJldHVybiB7XHJcbiAgICBzY29yZTogMCxcclxuICAgIHBoYXNlOiAnbmV3X21vb24nLFxyXG4gICAgYXR0ZW1wdHM6IDAsXHJcbiAgICBjb3JyZWN0OiAwLFxyXG4gICAgZHVlOiB7IGtpbmQ6ICdub25lJyB9LFxyXG4gICAgdXBkYXRlZEF0OiBub3cudG9JU09TdHJpbmcoKSxcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWFzdGVyeShwcm9maWxlOiBMZWFybmVyUHJvZmlsZSwgY29uY2VwdElkOiBzdHJpbmcpOiBDb25jZXB0TWFzdGVyeSB8IHVuZGVmaW5lZCB7XHJcbiAgcmV0dXJuIHByb2ZpbGUubWFzdGVyeVtjb25jZXB0SWRdO1xyXG59XHJcblxyXG4vKipcclxuICogVHJpbSB0aGUgbWFzdGVyeSBtYXAgdG8ge0BsaW5rIE1BWF9DT05DRVBUX1JFQ09SRFN9LCBkcm9wcGluZyB0aGUgbGVhc3RcclxuICogcmVjZW50bHkgdXBkYXRlZCByZWNvcmRzIGZpcnN0LiBUaWVzIGJyZWFrIG9uIGNvbmNlcHQgaWQgc28gdGhlIHJlc3VsdCBpc1xyXG4gKiBkZXRlcm1pbmlzdGljLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBydW5lTWFzdGVyeShcclxuICBtYXN0ZXJ5OiBSZWNvcmQ8c3RyaW5nLCBDb25jZXB0TWFzdGVyeT4sXHJcbiAgbGltaXQgPSBNQVhfQ09OQ0VQVF9SRUNPUkRTLFxyXG4pOiBSZWNvcmQ8c3RyaW5nLCBDb25jZXB0TWFzdGVyeT4ge1xyXG4gIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhtYXN0ZXJ5KTtcclxuICBpZiAoZW50cmllcy5sZW5ndGggPD0gbGltaXQpIHJldHVybiBtYXN0ZXJ5O1xyXG5cclxuICBlbnRyaWVzLnNvcnQoKGEsIGIpID0+IHtcclxuICAgIGNvbnN0IGJ5RGF0ZSA9IERhdGUucGFyc2UoYlsxXS51cGRhdGVkQXQpIC0gRGF0ZS5wYXJzZShhWzFdLnVwZGF0ZWRBdCk7XHJcbiAgICBpZiAoYnlEYXRlICE9PSAwKSByZXR1cm4gYnlEYXRlO1xyXG4gICAgcmV0dXJuIGFbMF0gPCBiWzBdID8gLTEgOiBhWzBdID4gYlswXSA/IDEgOiAwO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKGVudHJpZXMuc2xpY2UoMCwgbGltaXQpKTtcclxufVxyXG5cclxuLyoqIENvdW50cyB1c2VkIGJ5IHRoZSBwb3B1cCdzIGNvbXBhY3QgbWFzdGVyeSBzdW1tYXJ5LiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIE1hc3RlcnlTdW1tYXJ5IHtcclxuICB0cmFja2VkOiBudW1iZXI7XHJcbiAgYXR0ZW1wdHM6IG51bWJlcjtcclxuICBjb3JyZWN0OiBudW1iZXI7XHJcbiAgZHVlOiBudW1iZXI7XHJcbiAgYnlQaGFzZTogUmVjb3JkPE1vb25QaGFzZSwgbnVtYmVyPjtcclxuICAvKiogVGhlIGxlYXJuZXIncyBvdmVyYWxsIHBoYXNlLCBkZXJpdmVkIGZyb20gdGhlaXIgc3Ryb25nZXN0IHN1c3RhaW5lZCB3b3JrLiAqL1xyXG4gIG92ZXJhbGxQaGFzZTogTW9vblBoYXNlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3VtbWFyaXplTWFzdGVyeShwcm9maWxlOiBMZWFybmVyUHJvZmlsZSwgbm93OiBEYXRlKTogTWFzdGVyeVN1bW1hcnkge1xyXG4gIGNvbnN0IGJ5UGhhc2U6IFJlY29yZDxNb29uUGhhc2UsIG51bWJlcj4gPSB7XHJcbiAgICBuZXdfbW9vbjogMCxcclxuICAgIGNyZXNjZW50OiAwLFxyXG4gICAgaGFsZjogMCxcclxuICAgIGZ1bGw6IDAsXHJcbiAgfTtcclxuXHJcbiAgbGV0IGF0dGVtcHRzID0gMDtcclxuICBsZXQgY29ycmVjdCA9IDA7XHJcbiAgbGV0IGR1ZSA9IDA7XHJcbiAgY29uc3QgcmVjb3JkcyA9IE9iamVjdC52YWx1ZXMocHJvZmlsZS5tYXN0ZXJ5KTtcclxuXHJcbiAgZm9yIChjb25zdCByZWNvcmQgb2YgcmVjb3Jkcykge1xyXG4gICAgYnlQaGFzZVtyZWNvcmQucGhhc2VdICs9IDE7XHJcbiAgICBhdHRlbXB0cyArPSByZWNvcmQuYXR0ZW1wdHM7XHJcbiAgICBjb3JyZWN0ICs9IHJlY29yZC5jb3JyZWN0O1xyXG4gICAgaWYgKHJlY29yZC5kdWUua2luZCA9PT0gJ25leHRfb2NjdXJyZW5jZScpIGR1ZSArPSAxO1xyXG4gICAgZWxzZSBpZiAocmVjb3JkLmR1ZS5raW5kID09PSAndGltZXN0YW1wJyAmJiBEYXRlLnBhcnNlKHJlY29yZC5kdWUuYXQpIDw9IG5vdy5nZXRUaW1lKCkpXHJcbiAgICAgIGR1ZSArPSAxO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIHRyYWNrZWQ6IHJlY29yZHMubGVuZ3RoLFxyXG4gICAgYXR0ZW1wdHMsXHJcbiAgICBjb3JyZWN0LFxyXG4gICAgZHVlLFxyXG4gICAgYnlQaGFzZSxcclxuICAgIG92ZXJhbGxQaGFzZTogb3ZlcmFsbFBoYXNlRnJvbShieVBoYXNlLCByZWNvcmRzLmxlbmd0aCksXHJcbiAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBzaW5nbGUgcGhhc2Ugc2hvd24gaW4gdGhlIHBvcHVwLiBJdCByZWZsZWN0cyB0aGUgbWVkaWFuIGNvbmNlcHQgcmF0aGVyXHJcbiAqIHRoYW4gdGhlIGJlc3Qgb25lLCBzbyB0aGUgbW9vbiBkb2VzIG5vdCBqdW1wIHRvIGZ1bGwgYWZ0ZXIgYSBzaW5nbGUgd2luLlxyXG4gKi9cclxuZnVuY3Rpb24gb3ZlcmFsbFBoYXNlRnJvbShieVBoYXNlOiBSZWNvcmQ8TW9vblBoYXNlLCBudW1iZXI+LCB0b3RhbDogbnVtYmVyKTogTW9vblBoYXNlIHtcclxuICBpZiAodG90YWwgPT09IDApIHJldHVybiAnbmV3X21vb24nO1xyXG4gIGNvbnN0IG9yZGVyZWQ6IE1vb25QaGFzZVtdID0gWydmdWxsJywgJ2hhbGYnLCAnY3Jlc2NlbnQnLCAnbmV3X21vb24nXTtcclxuICBsZXQgc2VlbiA9IDA7XHJcbiAgZm9yIChjb25zdCBwaGFzZSBvZiBvcmRlcmVkKSB7XHJcbiAgICBzZWVuICs9IGJ5UGhhc2VbcGhhc2VdO1xyXG4gICAgaWYgKHNlZW4gKiAyID49IHRvdGFsKSByZXR1cm4gcGhhc2U7XHJcbiAgfVxyXG4gIHJldHVybiAnbmV3X21vb24nO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBUaGUgZXh0ZW5zaW9uJ3MgbWVzc2FnZSBjb250cmFjdC5cclxuICpcclxuICogUG9wdXAg4oaSIGJhY2tncm91bmQ6ICBTVEFSVF9TRVNTSU9OLCBTVE9QX1NFU1NJT04sIEdFVF9TVEFUVVMsIFJFU0VUX1BST0ZJTEUsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgIFNBVkVfQ0FMSUJSQVRJT05cclxuICogQmFja2dyb3VuZCDihpIgY29udGVudDogUElORywgQUNUSVZBVEUsIERFQUNUSVZBVEVcclxuICogQ29udGVudCDihpIgYmFja2dyb3VuZDogR0VORVJBVEVfVFJBUFNcclxuICpcclxuICogYFNBVkVfQ0FMSUJSQVRJT05gIGFuZCBgU0VUX1BST1ZJREVSYCBhcmUgdGhlIHR3byBhZGRpdGlvbnMgdG8gdGhlIGVpZ2h0XHJcbiAqIG1lc3NhZ2UgdHlwZXMgaW4gdGhlIHBsYW4sIGFuZCBib3RoIGV4aXN0IHRvIGtlZXAgdGhlIG93bmVyc2hpcCBib3VuZGFyeVxyXG4gKiBpbnRhY3QgcmF0aGVyIHRoYW4gdG8gYWRkIGZlYXR1cmVzOlxyXG4gKlxyXG4gKiAtIENhbGlicmF0aW9uIHByb2R1Y2VzIGEgYGdsb2JhbEFiaWxpdHlgLCB3aGljaCBpcyBsZWFybmVyIGhpc3RvcnkuIFRoZSBwbGFuXHJcbiAqICAgc2F5cyB0aGUgcG9wdXAgbXVzdCBub3Qgd3JpdGUgdGhhdCBkaXJlY3RseSwgc28gaXQgcm91dGVzIHRocm91Z2ggaGVyZS5cclxuICogLSBFbmFibGluZyB0aGUgb3B0aW9uYWwgcHJvdmlkZXIgbmVlZHMgYGNocm9tZS5wZXJtaXNzaW9ucy5yZXF1ZXN0YCwgd2hpY2hcclxuICogICByZXF1aXJlcyBhIHVzZXIgZ2VzdHVyZSBhbmQgdGhlcmVmb3JlIG11c3QgYmUgY2FsbGVkIGZyb20gdGhlIHBvcHVwIOKAlCBidXRcclxuICogICB0aGUgcmVzdWx0aW5nIHNldHRpbmcgaXMgdGhlIHdvcmtlcidzIHRvIHBlcnNpc3QuXHJcbiAqXHJcbiAqIEV2ZXJ5IGhhbmRsZXIgcmV0dXJucyBgU3VjY2VzczxUPmAgb3IgYEZhaWx1cmVgOyBub3RoaW5nIHRocm93cyBhY3Jvc3MgYVxyXG4gKiBtZXNzYWdlIGJvdW5kYXJ5LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5pbXBvcnQgeyBFUlJPUl9DT0RFUywgdHlwZSBGYWlsdXJlLCB0eXBlIFJlc3VsdCwgdHlwZSBTdWNjZXNzIH0gZnJvbSAnLi9lcnJvcnMnO1xyXG5pbXBvcnQgeyBNT09OX1BIQVNFUywgdHlwZSBNYXN0ZXJ5U3VtbWFyeSwgdHlwZSBNb29uUGhhc2UgfSBmcm9tICcuL3Byb2ZpbGUnO1xyXG5pbXBvcnQgdHlwZSB7IEdlbmVyYXRlZFRyYXBDYW5kaWRhdGUgfSBmcm9tICcuL3RyYXAnO1xyXG5cclxuZXhwb3J0IGNvbnN0IE1FU1NBR0VfVFlQRVMgPSBbXHJcbiAgJ1NUQVJUX1NFU1NJT04nLFxyXG4gICdTVE9QX1NFU1NJT04nLFxyXG4gICdQSU5HJyxcclxuICAnQUNUSVZBVEUnLFxyXG4gICdERUFDVElWQVRFJyxcclxuICAnR0VUX1NUQVRVUycsXHJcbiAgJ0dFTkVSQVRFX1RSQVBTJyxcclxuICAnUkVTRVRfUFJPRklMRScsXHJcbiAgJ1NBVkVfQ0FMSUJSQVRJT04nLFxyXG4gICdTRVRfUFJPVklERVInLFxyXG5dIGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IHR5cGUgTWVzc2FnZVR5cGUgPSAodHlwZW9mIE1FU1NBR0VfVFlQRVMpW251bWJlcl07XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gUGF5bG9hZHNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFN0YXJ0U2Vzc2lvbk1lc3NhZ2Uge1xyXG4gIHR5cGU6ICdTVEFSVF9TRVNTSU9OJztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTdG9wU2Vzc2lvbk1lc3NhZ2Uge1xyXG4gIHR5cGU6ICdTVE9QX1NFU1NJT04nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFBpbmdNZXNzYWdlIHtcclxuICB0eXBlOiAnUElORyc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZhdGVNZXNzYWdlIHtcclxuICB0eXBlOiAnQUNUSVZBVEUnO1xyXG4gIHNlc3Npb25JZDogc3RyaW5nO1xyXG4gIC8qKiBXaGV0aGVyIHRoZSBiYWNrZ3JvdW5kIHdvcmtlciBtYXkgYmUgYXNrZWQgZm9yIGdlbmVyYXRlZCB0cmFwcy4gKi9cclxuICBwcm92aWRlckVuYWJsZWQ6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGVhY3RpdmF0ZU1lc3NhZ2Uge1xyXG4gIHR5cGU6ICdERUFDVElWQVRFJztcclxuICAvKiogT21pdCB0byBkZWFjdGl2YXRlIHdoYXRldmVyIHNlc3Npb24gaXMgcnVubmluZy4gKi9cclxuICBzZXNzaW9uSWQ/OiBzdHJpbmc7XHJcbiAgcmVhc29uPzogJ3VzZXInIHwgJ3JlcGxhY2VkJyB8ICdyZXNldCc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgR2V0U3RhdHVzTWVzc2FnZSB7XHJcbiAgdHlwZTogJ0dFVF9TVEFUVVMnO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEdlbmVyYXRlVHJhcHNNZXNzYWdlIHtcclxuICB0eXBlOiAnR0VORVJBVEVfVFJBUFMnO1xyXG4gIHNlc3Npb25JZDogc3RyaW5nO1xyXG4gIHNlbnRlbmNlczogeyBpZDogc3RyaW5nOyB0ZXh0OiBzdHJpbmcgfVtdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlc2V0UHJvZmlsZU1lc3NhZ2Uge1xyXG4gIHR5cGU6ICdSRVNFVF9QUk9GSUxFJztcclxuICAvKiogTXVzdCBiZSBgdHJ1ZWAuIEd1YXJkcyBhZ2FpbnN0IGFuIGFjY2lkZW50YWwgc2VuZC4gKi9cclxuICBjb25maXJtZWQ6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2V0UHJvdmlkZXJNZXNzYWdlIHtcclxuICB0eXBlOiAnU0VUX1BST1ZJREVSJztcclxuICBlbmFibGVkOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNhdmVDYWxpYnJhdGlvbk1lc3NhZ2Uge1xyXG4gIHR5cGU6ICdTQVZFX0NBTElCUkFUSU9OJztcclxuICBnbG9iYWxBYmlsaXR5OiBudW1iZXI7XHJcbiAgY29ycmVjdEFuc3dlcnM6IG51bWJlcjtcclxuICBza2lwcGVkOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgdHlwZSBFY2xpcHNlTWVzc2FnZSA9XHJcbiAgfCBTdGFydFNlc3Npb25NZXNzYWdlXHJcbiAgfCBTdG9wU2Vzc2lvbk1lc3NhZ2VcclxuICB8IFBpbmdNZXNzYWdlXHJcbiAgfCBBY3RpdmF0ZU1lc3NhZ2VcclxuICB8IERlYWN0aXZhdGVNZXNzYWdlXHJcbiAgfCBHZXRTdGF0dXNNZXNzYWdlXHJcbiAgfCBHZW5lcmF0ZVRyYXBzTWVzc2FnZVxyXG4gIHwgUmVzZXRQcm9maWxlTWVzc2FnZVxyXG4gIHwgU2F2ZUNhbGlicmF0aW9uTWVzc2FnZVxyXG4gIHwgU2V0UHJvdmlkZXJNZXNzYWdlO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIFJlc3BvbnNlIGRhdGFcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNlc3Npb25TdGFydGVkRGF0YSB7XHJcbiAgc2Vzc2lvbklkOiBzdHJpbmc7XHJcbiAgdGFiSWQ6IG51bWJlcjtcclxuICB0cmFwQ291bnQ6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTZXNzaW9uU3RvcHBlZERhdGEge1xyXG4gIHJlc3RvcmVkOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFBvbmdEYXRhIHtcclxuICBydW50aW1lOiAnZWNsaXBzZS1jb250ZW50JztcclxuICBzZXNzaW9uSWQ6IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZhdGVkRGF0YSB7XHJcbiAgc2Vzc2lvbklkOiBzdHJpbmc7XHJcbiAgdHJhcENvdW50OiBudW1iZXI7XHJcbiAgY29uY2VwdElkczogc3RyaW5nW107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRGVhY3RpdmF0ZWREYXRhIHtcclxuICByZXN0b3JlZDogYm9vbGVhbjtcclxuICAvKiogVHJ1ZSB3aGVuIHRoZSByZXN0b3JlZCB0ZXh0IG1hdGNoZWQgdGhlIHByZS1hY3RpdmF0aW9uIHNuYXBzaG90LiAqL1xyXG4gIHRleHRWZXJpZmllZDogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgUG9wdXBQYWdlU3VwcG9ydCA9XHJcbiAgeyBzdXBwb3J0ZWQ6IHRydWUgfSB8IHsgc3VwcG9ydGVkOiBmYWxzZTsgcmVhc29uOiAnaW50ZXJuYWwnIHwgJ2ZpbGUnIHwgJ2V4dGVuc2lvbicgfCAnb3RoZXInIH07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFN0YXR1c0RhdGEge1xyXG4gIGFjdGl2ZVRhYklkOiBudW1iZXIgfCBudWxsO1xyXG4gIGFjdGl2ZVNlc3Npb25JZDogc3RyaW5nIHwgbnVsbDtcclxuICAvKiogVHJ1ZSB3aGVuIHRoZSB0YWIgdGhlIHBvcHVwIGlzIHNob3dpbmcgaXMgdGhlIG9uZSB3aXRoIGEgbGl2ZSBzZXNzaW9uLiAqL1xyXG4gIGFjdGl2ZUhlcmU6IGJvb2xlYW47XHJcbiAgcGFnZTogUG9wdXBQYWdlU3VwcG9ydDtcclxuICBjYWxpYnJhdGlvbkNvbXBsZXRlZDogYm9vbGVhbjtcclxuICBnbG9iYWxBYmlsaXR5OiBudW1iZXI7XHJcbiAgcGhhc2U6IE1vb25QaGFzZTtcclxuICBzdW1tYXJ5OiBNYXN0ZXJ5U3VtbWFyeTtcclxuICBwcm92aWRlcjoge1xyXG4gICAgLyoqIFRydWUgb25jZSBhIHNlcnZlciBvcmlnaW4gaGFzIGJlZW4gY29uZmlndXJlZCBhdCBidWlsZCB0aW1lLiAqL1xyXG4gICAgY29uZmlndXJlZDogYm9vbGVhbjtcclxuICAgIGVuYWJsZWQ6IGJvb2xlYW47XHJcbiAgICBwZXJtaXNzaW9uR3JhbnRlZDogYm9vbGVhbjtcclxuICAgIGxhc3RFcnJvcjogc3RyaW5nIHwgbnVsbDtcclxuICB9O1xyXG4gIHByb2ZpbGVFcnJvcjogc3RyaW5nIHwgbnVsbDtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBHZW5lcmF0ZVRyYXBzRGF0YSB7XHJcbiAgY2FuZGlkYXRlczogR2VuZXJhdGVkVHJhcENhbmRpZGF0ZVtdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJlc2V0UHJvZmlsZURhdGEge1xyXG4gIHJlc2V0OiB0cnVlO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNhdmVDYWxpYnJhdGlvbkRhdGEge1xyXG4gIGdsb2JhbEFiaWxpdHk6IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTZXRQcm92aWRlckRhdGEge1xyXG4gIGVuYWJsZWQ6IGJvb2xlYW47XHJcbiAgcGVybWlzc2lvbkdyYW50ZWQ6IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKiBNYXBzIGVhY2ggbWVzc2FnZSB0eXBlIHRvIHRoZSBzaGFwZSBvZiBpdHMgc3VjY2VzcyBwYXlsb2FkLiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIE1lc3NhZ2VSZXNwb25zZU1hcCB7XHJcbiAgU1RBUlRfU0VTU0lPTjogU2Vzc2lvblN0YXJ0ZWREYXRhO1xyXG4gIFNUT1BfU0VTU0lPTjogU2Vzc2lvblN0b3BwZWREYXRhO1xyXG4gIFBJTkc6IFBvbmdEYXRhO1xyXG4gIEFDVElWQVRFOiBBY3RpdmF0ZWREYXRhO1xyXG4gIERFQUNUSVZBVEU6IERlYWN0aXZhdGVkRGF0YTtcclxuICBHRVRfU1RBVFVTOiBTdGF0dXNEYXRhO1xyXG4gIEdFTkVSQVRFX1RSQVBTOiBHZW5lcmF0ZVRyYXBzRGF0YTtcclxuICBSRVNFVF9QUk9GSUxFOiBSZXNldFByb2ZpbGVEYXRhO1xyXG4gIFNBVkVfQ0FMSUJSQVRJT046IFNhdmVDYWxpYnJhdGlvbkRhdGE7XHJcbiAgU0VUX1BST1ZJREVSOiBTZXRQcm92aWRlckRhdGE7XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIFJlc3BvbnNlRm9yPFQgZXh0ZW5kcyBNZXNzYWdlVHlwZT4gPSBSZXN1bHQ8TWVzc2FnZVJlc3BvbnNlTWFwW1RdPjtcclxuXHJcbmV4cG9ydCB0eXBlIEVjbGlwc2VSZXNwb25zZSA9IFJlc3VsdDxNZXNzYWdlUmVzcG9uc2VNYXBbTWVzc2FnZVR5cGVdPjtcclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBSdW50aW1lIHZhbGlkYXRpb25cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5leHBvcnQgY29uc3QgZWNsaXBzZU1lc3NhZ2VTY2hlbWE6IHouWm9kVHlwZTxFY2xpcHNlTWVzc2FnZT4gPSB6LmRpc2NyaW1pbmF0ZWRVbmlvbigndHlwZScsIFtcclxuICB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnU1RBUlRfU0VTU0lPTicpIH0pLFxyXG4gIHoub2JqZWN0KHsgdHlwZTogei5saXRlcmFsKCdTVE9QX1NFU1NJT04nKSB9KSxcclxuICB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnUElORycpIH0pLFxyXG4gIHoub2JqZWN0KHtcclxuICAgIHR5cGU6IHoubGl0ZXJhbCgnQUNUSVZBVEUnKSxcclxuICAgIHNlc3Npb25JZDogei5zdHJpbmcoKS5taW4oMSksXHJcbiAgICBwcm92aWRlckVuYWJsZWQ6IHouYm9vbGVhbigpLFxyXG4gIH0pLFxyXG4gIHoub2JqZWN0KHtcclxuICAgIHR5cGU6IHoubGl0ZXJhbCgnREVBQ1RJVkFURScpLFxyXG4gICAgc2Vzc2lvbklkOiB6LnN0cmluZygpLm1pbigxKS5vcHRpb25hbCgpLFxyXG4gICAgcmVhc29uOiB6LmVudW0oWyd1c2VyJywgJ3JlcGxhY2VkJywgJ3Jlc2V0J10pLm9wdGlvbmFsKCksXHJcbiAgfSksXHJcbiAgei5vYmplY3QoeyB0eXBlOiB6LmxpdGVyYWwoJ0dFVF9TVEFUVVMnKSB9KSxcclxuICB6Lm9iamVjdCh7XHJcbiAgICB0eXBlOiB6LmxpdGVyYWwoJ0dFTkVSQVRFX1RSQVBTJyksXHJcbiAgICBzZXNzaW9uSWQ6IHouc3RyaW5nKCkubWluKDEpLFxyXG4gICAgc2VudGVuY2VzOiB6XHJcbiAgICAgIC5hcnJheSh6Lm9iamVjdCh7IGlkOiB6LnN0cmluZygpLm1pbigxKS5tYXgoNjQpLCB0ZXh0OiB6LnN0cmluZygpLm1pbigxKS5tYXgoMzAwKSB9KSlcclxuICAgICAgLm1heCg4KSxcclxuICB9KSxcclxuICB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnUkVTRVRfUFJPRklMRScpLCBjb25maXJtZWQ6IHouYm9vbGVhbigpIH0pLFxyXG4gIHoub2JqZWN0KHtcclxuICAgIHR5cGU6IHoubGl0ZXJhbCgnU0FWRV9DQUxJQlJBVElPTicpLFxyXG4gICAgZ2xvYmFsQWJpbGl0eTogei5udW1iZXIoKS5taW4oLTEpLm1heCgxKSxcclxuICAgIGNvcnJlY3RBbnN3ZXJzOiB6Lm51bWJlcigpLmludCgpLm1pbigwKS5tYXgoMyksXHJcbiAgICBza2lwcGVkOiB6LmJvb2xlYW4oKSxcclxuICB9KSxcclxuICB6Lm9iamVjdCh7IHR5cGU6IHoubGl0ZXJhbCgnU0VUX1BST1ZJREVSJyksIGVuYWJsZWQ6IHouYm9vbGVhbigpIH0pLFxyXG5dKTtcclxuXHJcbmNvbnN0IGZhaWx1cmVTY2hlbWEgPSB6Lm9iamVjdCh7XHJcbiAgb2s6IHoubGl0ZXJhbChmYWxzZSksXHJcbiAgZXJyb3I6IHoub2JqZWN0KHtcclxuICAgIGNvZGU6IHouZW51bShFUlJPUl9DT0RFUyksXHJcbiAgICBtZXNzYWdlOiB6LnN0cmluZygpLFxyXG4gICAgcmVjb3ZlcmFibGU6IHouYm9vbGVhbigpLFxyXG4gIH0pLFxyXG59KTtcclxuXHJcbi8qKiBQYXJzZSBhbiBpbmJvdW5kIG1lc3NhZ2UuIFVua25vd24gc2hhcGVzIGFyZSByZWplY3RlZCwgbmV2ZXIgY29lcmNlZC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTWVzc2FnZSh2YWx1ZTogdW5rbm93bik6IEVjbGlwc2VNZXNzYWdlIHwgbnVsbCB7XHJcbiAgY29uc3QgcGFyc2VkID0gZWNsaXBzZU1lc3NhZ2VTY2hlbWEuc2FmZVBhcnNlKHZhbHVlKTtcclxuICByZXR1cm4gcGFyc2VkLnN1Y2Nlc3MgPyBwYXJzZWQuZGF0YSA6IG51bGw7XHJcbn1cclxuXHJcbi8qKiBOYXJyb3cgYW4gdW5rbm93biByZXNwb25zZSB2YWx1ZSBpbnRvIGEgYFJlc3VsdGAuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0ZhaWx1cmVSZXNwb25zZSh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIEZhaWx1cmUge1xyXG4gIHJldHVybiBmYWlsdXJlU2NoZW1hLnNhZmVQYXJzZSh2YWx1ZSkuc3VjY2VzcztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU3VjY2Vzc1Jlc3BvbnNlPFQ+KHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgU3VjY2VzczxUPiB7XHJcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwgJiYgKHZhbHVlIGFzIHsgb2s/OiB1bmtub3duIH0pLm9rID09PSB0cnVlO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbW9vblBoYXNlU2NoZW1hID0gei5lbnVtKE1PT05fUEhBU0VTKTtcclxuIiwiLyoqXHJcbiAqIFdoaWNoIHBhZ2VzIEVjbGlwc2Ugd2lsbCBydW4gb24uXHJcbiAqXHJcbiAqIENocm9tZSBpbnRlcm5hbCBwYWdlcywgZXh0ZW5zaW9uIHBhZ2VzLCBgZmlsZTovL2AgYW5kIGFueXRoaW5nIG5vbi1IVFRQKFMpXHJcbiAqIGFyZSBvdXQg4oCUIGBhY3RpdmVUYWJgIGRvZXMgbm90IGdyYW50IGFjY2VzcyB0byB0aGVtLCBhbmQgdGhlIHBvcHVwIHNob3VsZCBzYXlcclxuICogc28gcGxhaW5seSByYXRoZXIgdGhhbiBmYWlsIG9ic2N1cmVseSBvbmNlIHRoZSB1c2VyIHByZXNzZXMgU3RhcnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHR5cGUgeyBQb3B1cFBhZ2VTdXBwb3J0IH0gZnJvbSAnLi9tZXNzYWdlcyc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlVcmwodXJsOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBQb3B1cFBhZ2VTdXBwb3J0IHtcclxuICBpZiAoIXVybCkgcmV0dXJuIHsgc3VwcG9ydGVkOiBmYWxzZSwgcmVhc29uOiAnb3RoZXInIH07XHJcblxyXG4gIGxldCBwYXJzZWQ6IFVSTDtcclxuICB0cnkge1xyXG4gICAgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgcmV0dXJuIHsgc3VwcG9ydGVkOiBmYWxzZSwgcmVhc29uOiAnb3RoZXInIH07XHJcbiAgfVxyXG5cclxuICBzd2l0Y2ggKHBhcnNlZC5wcm90b2NvbCkge1xyXG4gICAgY2FzZSAnaHR0cDonOlxyXG4gICAgY2FzZSAnaHR0cHM6JzpcclxuICAgICAgcmV0dXJuIHsgc3VwcG9ydGVkOiB0cnVlIH07XHJcbiAgICBjYXNlICdmaWxlOic6XHJcbiAgICAgIHJldHVybiB7IHN1cHBvcnRlZDogZmFsc2UsIHJlYXNvbjogJ2ZpbGUnIH07XHJcbiAgICBjYXNlICdjaHJvbWUtZXh0ZW5zaW9uOic6XHJcbiAgICBjYXNlICdtb3otZXh0ZW5zaW9uOic6XHJcbiAgICAgIHJldHVybiB7IHN1cHBvcnRlZDogZmFsc2UsIHJlYXNvbjogJ2V4dGVuc2lvbicgfTtcclxuICAgIGNhc2UgJ2Nocm9tZTonOlxyXG4gICAgY2FzZSAnZWRnZTonOlxyXG4gICAgY2FzZSAnYWJvdXQ6JzpcclxuICAgIGNhc2UgJ2RldnRvb2xzOic6XHJcbiAgICBjYXNlICd2aWV3LXNvdXJjZTonOlxyXG4gICAgICByZXR1cm4geyBzdXBwb3J0ZWQ6IGZhbHNlLCByZWFzb246ICdpbnRlcm5hbCcgfTtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiB7IHN1cHBvcnRlZDogZmFsc2UsIHJlYXNvbjogJ290aGVyJyB9O1xyXG4gIH1cclxufVxyXG5cclxuLyoqIFBvcHVwIGNvcHkgZm9yIGFuIHVuc3VwcG9ydGVkIHBhZ2UuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1bnN1cHBvcnRlZFJlYXNvblRleHQoc3VwcG9ydDogUG9wdXBQYWdlU3VwcG9ydCk6IHN0cmluZyB7XHJcbiAgaWYgKHN1cHBvcnQuc3VwcG9ydGVkKSByZXR1cm4gJyc7XHJcbiAgc3dpdGNoIChzdXBwb3J0LnJlYXNvbikge1xyXG4gICAgY2FzZSAnaW50ZXJuYWwnOlxyXG4gICAgICByZXR1cm4gJ0VjbGlwc2UgY2Fubm90IHJ1biBvbiBDaHJvbWXigJlzIG93biBwYWdlcy4nO1xyXG4gICAgY2FzZSAnZXh0ZW5zaW9uJzpcclxuICAgICAgcmV0dXJuICdFY2xpcHNlIGNhbm5vdCBydW4gb24gZXh0ZW5zaW9uIHBhZ2VzLic7XHJcbiAgICBjYXNlICdmaWxlJzpcclxuICAgICAgcmV0dXJuICdFY2xpcHNlIGNhbm5vdCBydW4gb24gbG9jYWwgZmlsZTovLyBwYWdlcy4nO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuICdFY2xpcHNlIG9ubHkgcnVucyBvbiByZWd1bGFyIGh0dHAocykgd2ViIHBhZ2VzLic7XHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKiBBIG1pbmltYWwgc3RvcmFnZS1hcmVhIGludGVyZmFjZS5cclxuICpcclxuICogVGhlIHJlc3Qgb2YgdGhlIHN0b3JhZ2UgbGF5ZXIgdGFsa3MgdG8gdGhpcyByYXRoZXIgdGhhbiB0byB0aGUgZXh0ZW5zaW9uXHJcbiAqIHN0b3JhZ2UgQVBJIGRpcmVjdGx5LCBzbyB1bml0IHRlc3RzIGNhbiBkcml2ZSBpdCB3aXRoIGFuIGluLW1lbW9yeSBhcmVhIGFuZCBzbyBhIGZhaWxpbmdcclxuICogd3JpdGUgc3VyZmFjZXMgYXMgYFNUT1JBR0VfRVJST1JgIHJhdGhlciB0aGFuIGFuIHVuaGFuZGxlZCByZWplY3Rpb24uXHJcbiAqL1xyXG5cclxuaW1wb3J0IHR5cGUgeyBCcm93c2VyIH0gZnJvbSAnd3h0L2Jyb3dzZXInO1xyXG5pbXBvcnQgeyBmYWlsdXJlLCBzdWNjZXNzLCB0eXBlIFJlc3VsdCB9IGZyb20gJy4uL2RvbWFpbi9lcnJvcnMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTdG9yYWdlQXJlYSB7XHJcbiAgZ2V0KGtleTogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPjtcclxuICBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKTogUHJvbWlzZTx2b2lkPjtcclxuICByZW1vdmUoa2V5OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+O1xyXG59XHJcblxyXG4vKiogV3JhcHMgYSBgYnJvd3Nlci5zdG9yYWdlYCBhcmVhLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2hyb21lQXJlYShhcmVhOiBCcm93c2VyLnN0b3JhZ2UuU3RvcmFnZUFyZWEpOiBTdG9yYWdlQXJlYSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIGFzeW5jIGdldChrZXkpIHtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXJlYS5nZXQoa2V5KTtcclxuICAgICAgcmV0dXJuIHJlc3VsdFtrZXldO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHNldChrZXksIHZhbHVlKSB7XHJcbiAgICAgIGF3YWl0IGFyZWEuc2V0KHsgW2tleV06IHZhbHVlIH0pO1xyXG4gICAgfSxcclxuICAgIGFzeW5jIHJlbW92ZShrZXkpIHtcclxuICAgICAgYXdhaXQgYXJlYS5yZW1vdmUoa2V5KTtcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG5cclxuLyoqIEluLW1lbW9yeSBhcmVhIGZvciB0ZXN0cyBhbmQgZm9yIHRoZSByYXJlIGNhc2Ugd2hlcmUgc3RvcmFnZSBpcyBtaXNzaW5nLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbWVtb3J5QXJlYShpbml0aWFsOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9KTogU3RvcmFnZUFyZWEge1xyXG4gIGNvbnN0IHN0b3JlID0gbmV3IE1hcDxzdHJpbmcsIHVua25vd24+KE9iamVjdC5lbnRyaWVzKGluaXRpYWwpKTtcclxuICByZXR1cm4ge1xyXG4gICAgYXN5bmMgZ2V0KGtleSkge1xyXG4gICAgICByZXR1cm4gc3RvcmUuZ2V0KGtleSk7XHJcbiAgICB9LFxyXG4gICAgYXN5bmMgc2V0KGtleSwgdmFsdWUpIHtcclxuICAgICAgc3RvcmUuc2V0KGtleSwgc3RydWN0dXJlZENsb25lKHZhbHVlKSk7XHJcbiAgICB9LFxyXG4gICAgYXN5bmMgcmVtb3ZlKGtleSkge1xyXG4gICAgICBzdG9yZS5kZWxldGUoa2V5KTtcclxuICAgIH0sXHJcbiAgfTtcclxufVxyXG5cclxuLyoqIFJ1biBhIHN0b3JhZ2Ugb3BlcmF0aW9uLCBjb252ZXJ0aW5nIGFueSB0aHJvdyBpbnRvIGEgdHlwZWQgYFNUT1JBR0VfRVJST1JgLiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ3VhcmRlZDxUPih3b3JrOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxSZXN1bHQ8VD4+IHtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuIHN1Y2Nlc3MoYXdhaXQgd29yaygpKTtcclxuICB9IGNhdGNoIChjYXVzZSkge1xyXG4gICAgY29uc3QgbWVzc2FnZSA9IGNhdXNlIGluc3RhbmNlb2YgRXJyb3IgPyBjYXVzZS5tZXNzYWdlIDogJ3N0b3JhZ2Ugb3BlcmF0aW9uIGZhaWxlZCc7XHJcbiAgICByZXR1cm4gZmFpbHVyZSgnU1RPUkFHRV9FUlJPUicsIG1lc3NhZ2UpO1xyXG4gIH1cclxufVxyXG4iLCIvKiogU3RvcmFnZSBrZXlzLiBOYW1lc3BhY2VkIHNvIEVjbGlwc2UgbmV2ZXIgY29sbGlkZXMgd2l0aCBhbnl0aGluZyBlbHNlLiAqL1xyXG5cclxuZXhwb3J0IGNvbnN0IFBST0ZJTEVfS0VZID0gJ2VjbGlwc2U6cHJvZmlsZTp2MSc7XHJcbmV4cG9ydCBjb25zdCBJTlRFUkFDVElPTlNfS0VZID0gJ2VjbGlwc2U6aW50ZXJhY3Rpb25zOnYxJztcclxuZXhwb3J0IGNvbnN0IFBST1ZJREVSX0NBQ0hFX0tFWSA9ICdlY2xpcHNlOnByb3ZpZGVyLWNhY2hlOnYxJztcclxuZXhwb3J0IGNvbnN0IFBST1ZJREVSX1NFVFRJTkdTX0tFWSA9ICdlY2xpcHNlOnByb3ZpZGVyLXNldHRpbmdzOnYxJztcclxuZXhwb3J0IGNvbnN0IFNFU1NJT05fS0VZID0gJ2VjbGlwc2U6c2Vzc2lvbjp2MSc7XHJcbiIsIi8qKlxyXG4gKiBMZWFybmVyIHByb2ZpbGUgcGVyc2lzdGVuY2UuXHJcbiAqXHJcbiAqIFR3byBydWxlcyBnb3Zlcm4gdGhpcyBmaWxlOlxyXG4gKlxyXG4gKiAxLiBBIHByb2ZpbGUgdGhhdCBmYWlscyB2YWxpZGF0aW9uIGlzIG5ldmVyIHNpbGVudGx5IHJlcGxhY2VkLiBFY2xpcHNlXHJcbiAqICAgIHJlcG9ydHMgYFBST0ZJTEVfSU5DT01QQVRJQkxFYCBhbmQgbGVhdmVzIHRoZSBieXRlcyBhbG9uZSwgc28gYSBzY2hlbWEgYnVnXHJcbiAqICAgIGluIGEgZnV0dXJlIHZlcnNpb24gY2Fubm90IHF1aWV0bHkgZGVsZXRlIHNvbWVib2R5J3MgcHJvZ3Jlc3MuXHJcbiAqIDIuIEFuc3dlciBvdXRjb21lcyBhcmUgaWRlbXBvdGVudCBieSBgaW50ZXJhY3Rpb25JZGAuIFRoZSBpZHMgbGl2ZSBpbiB0aGVpclxyXG4gKiAgICBvd24gYm91bmRlZCBrZXkgcmF0aGVyIHRoYW4gb24gdGhlIHByb2ZpbGUsIGJlY2F1c2UgdGhlIHByb2ZpbGUncyByb2xsaW5nXHJcbiAqICAgIG91dGNvbWUgd2luZG93IGlzIG9ubHkgZml2ZSBkZWVwIGFuZCBhIGR1cGxpY2F0ZSBjYW4gYXJyaXZlIGxhdGVyIHRoYW5cclxuICogICAgdGhhdC5cclxuICovXHJcblxyXG5pbXBvcnQge1xyXG4gIGNyZWF0ZUVtcHR5UHJvZmlsZSxcclxuICBsZWFybmVyUHJvZmlsZVNjaGVtYSxcclxuICBQUk9GSUxFX1NDSEVNQV9WRVJTSU9OLFxyXG4gIHR5cGUgTGVhcm5lclByb2ZpbGUsXHJcbn0gZnJvbSAnLi4vZG9tYWluL3Byb2ZpbGUnO1xyXG5pbXBvcnQgeyBmYWlsdXJlLCBzdWNjZXNzLCB0eXBlIFJlc3VsdCB9IGZyb20gJy4uL2RvbWFpbi9lcnJvcnMnO1xyXG5pbXBvcnQgeyBndWFyZGVkLCB0eXBlIFN0b3JhZ2VBcmVhIH0gZnJvbSAnLi9hcmVhJztcclxuaW1wb3J0IHsgSU5URVJBQ1RJT05TX0tFWSwgUFJPRklMRV9LRVkgfSBmcm9tICcuL2tleXMnO1xyXG5cclxuLyoqIEhvdyBtYW55IGludGVyYWN0aW9uIGlkcyB0byByZW1lbWJlciBmb3IgZHVwbGljYXRlIHN1cHByZXNzaW9uLiAqL1xyXG5leHBvcnQgY29uc3QgSU5URVJBQ1RJT05fTE9HX0xJTUlUID0gMjAwO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMb2FkUHJvZmlsZVJlc3VsdCB7XHJcbiAgcmVhZG9ubHkgcHJvZmlsZTogTGVhcm5lclByb2ZpbGU7XHJcbiAgLyoqIFRydWUgd2hlbiBub3RoaW5nIHdhcyBzdG9yZWQgeWV0IGFuZCBhIGZyZXNoIHByb2ZpbGUgd2FzIHJldHVybmVkLiAqL1xyXG4gIHJlYWRvbmx5IGNyZWF0ZWQ6IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZWFkIHRoZSBwcm9maWxlLlxyXG4gKlxyXG4gKiBNaXNzaW5nIGRhdGEgeWllbGRzIGEgZnJlc2ggcHJvZmlsZS4gQ29ycnVwdCBvciBuZXdlci10aGFuLXN1cHBvcnRlZCBkYXRhXHJcbiAqIHlpZWxkcyBgUFJPRklMRV9JTkNPTVBBVElCTEVgIGFuZCBpcyBsZWZ0IHVudG91Y2hlZCBvbiBkaXNrLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRQcm9maWxlKGFyZWE6IFN0b3JhZ2VBcmVhKTogUHJvbWlzZTxSZXN1bHQ8TG9hZFByb2ZpbGVSZXN1bHQ+PiB7XHJcbiAgY29uc3QgcmVhZCA9IGF3YWl0IGd1YXJkZWQoKCkgPT4gYXJlYS5nZXQoUFJPRklMRV9LRVkpKTtcclxuICBpZiAoIXJlYWQub2spIHJldHVybiByZWFkO1xyXG5cclxuICBjb25zdCByYXcgPSByZWFkLmRhdGE7XHJcbiAgaWYgKHJhdyA9PT0gdW5kZWZpbmVkIHx8IHJhdyA9PT0gbnVsbCkge1xyXG4gICAgcmV0dXJuIHN1Y2Nlc3MoeyBwcm9maWxlOiBjcmVhdGVFbXB0eVByb2ZpbGUoKSwgY3JlYXRlZDogdHJ1ZSB9KTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHZlcnNpb24gPSAocmF3IGFzIHsgc2NoZW1hVmVyc2lvbj86IHVua25vd24gfSkuc2NoZW1hVmVyc2lvbjtcclxuICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdudW1iZXInICYmIHZlcnNpb24gPiBQUk9GSUxFX1NDSEVNQV9WRVJTSU9OKSB7XHJcbiAgICByZXR1cm4gZmFpbHVyZShcclxuICAgICAgJ1BST0ZJTEVfSU5DT01QQVRJQkxFJyxcclxuICAgICAgYFNhdmVkIGxlYXJuaW5nIGRhdGEgdXNlcyBzY2hlbWEgdmVyc2lvbiAke3ZlcnNpb259OyB0aGlzIGJ1aWxkIHN1cHBvcnRzICR7UFJPRklMRV9TQ0hFTUFfVkVSU0lPTn0uYCxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBwYXJzZWQgPSBsZWFybmVyUHJvZmlsZVNjaGVtYS5zYWZlUGFyc2UocmF3KTtcclxuICBpZiAoIXBhcnNlZC5zdWNjZXNzKSB7XHJcbiAgICByZXR1cm4gZmFpbHVyZShcclxuICAgICAgJ1BST0ZJTEVfSU5DT01QQVRJQkxFJyxcclxuICAgICAgJ1NhdmVkIGxlYXJuaW5nIGRhdGEgZGlkIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgc2hhcGUgYW5kIHdhcyBsZWZ0IHVudG91Y2hlZC4nLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBzdWNjZXNzKHsgcHJvZmlsZTogcGFyc2VkLmRhdGEgYXMgTGVhcm5lclByb2ZpbGUsIGNyZWF0ZWQ6IGZhbHNlIH0pO1xyXG59XHJcblxyXG4vKiogV3JpdGUgdGhlIHByb2ZpbGUsIHZhbGlkYXRpbmcgaXQgb24gdGhlIHdheSBvdXQuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUHJvZmlsZShcclxuICBhcmVhOiBTdG9yYWdlQXJlYSxcclxuICBwcm9maWxlOiBMZWFybmVyUHJvZmlsZSxcclxuKTogUHJvbWlzZTxSZXN1bHQ8TGVhcm5lclByb2ZpbGU+PiB7XHJcbiAgY29uc3QgcGFyc2VkID0gbGVhcm5lclByb2ZpbGVTY2hlbWEuc2FmZVBhcnNlKHByb2ZpbGUpO1xyXG4gIGlmICghcGFyc2VkLnN1Y2Nlc3MpIHtcclxuICAgIHJldHVybiBmYWlsdXJlKCdTVE9SQUdFX0VSUk9SJywgJ1JlZnVzaW5nIHRvIHBlcnNpc3QgYW4gaW52YWxpZCBsZWFybmVyIHByb2ZpbGUuJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCB3cml0dGVuID0gYXdhaXQgZ3VhcmRlZCgoKSA9PiBhcmVhLnNldChQUk9GSUxFX0tFWSwgcGFyc2VkLmRhdGEpKTtcclxuICBpZiAoIXdyaXR0ZW4ub2spIHJldHVybiB3cml0dGVuO1xyXG4gIHJldHVybiBzdWNjZXNzKHByb2ZpbGUpO1xyXG59XHJcblxyXG4vKiogUmVtb3ZlIHRoZSBwcm9maWxlIGFuZCBldmVyeSBpbnRlcmFjdGlvbiBpZC4gVGhlIG5leHQgcmVhZCBjcmVhdGVzIGEgZnJlc2ggcHJvZmlsZS4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc2V0UHJvZmlsZShhcmVhOiBTdG9yYWdlQXJlYSk6IFByb21pc2U8UmVzdWx0PExlYXJuZXJQcm9maWxlPj4ge1xyXG4gIGNvbnN0IHByb2ZpbGUgPSBjcmVhdGVFbXB0eVByb2ZpbGUoKTtcclxuICBjb25zdCB3cml0dGVuID0gYXdhaXQgZ3VhcmRlZChhc3luYyAoKSA9PiB7XHJcbiAgICBhd2FpdCBhcmVhLnJlbW92ZShQUk9GSUxFX0tFWSk7XHJcbiAgICBhd2FpdCBhcmVhLnJlbW92ZShJTlRFUkFDVElPTlNfS0VZKTtcclxuICB9KTtcclxuICBpZiAoIXdyaXR0ZW4ub2spIHJldHVybiB3cml0dGVuO1xyXG4gIHJldHVybiBzdWNjZXNzKHByb2ZpbGUpO1xyXG59XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gSW50ZXJhY3Rpb24gbG9nXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVhZEludGVyYWN0aW9uTG9nKGFyZWE6IFN0b3JhZ2VBcmVhKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xyXG4gIGNvbnN0IHJlYWQgPSBhd2FpdCBndWFyZGVkKCgpID0+IGFyZWEuZ2V0KElOVEVSQUNUSU9OU19LRVkpKTtcclxuICBpZiAoIXJlYWQub2sgfHwgIUFycmF5LmlzQXJyYXkocmVhZC5kYXRhKSkgcmV0dXJuIFtdO1xyXG4gIHJldHVybiByZWFkLmRhdGEuZmlsdGVyKCh2YWx1ZSk6IHZhbHVlIGlzIHN0cmluZyA9PiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKTtcclxufVxyXG5cclxuLyoqIFRydWUgd2hlbiB0aGlzIGludGVyYWN0aW9uIGhhcyBhbHJlYWR5IGJlZW4gZm9sZGVkIGludG8gdGhlIHByb2ZpbGUuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNJbnRlcmFjdGlvbihhcmVhOiBTdG9yYWdlQXJlYSwgaW50ZXJhY3Rpb25JZDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgY29uc3QgbG9nID0gYXdhaXQgcmVhZEludGVyYWN0aW9uTG9nKGFyZWEpO1xyXG4gIHJldHVybiBsb2cuaW5jbHVkZXMoaW50ZXJhY3Rpb25JZCk7XHJcbn1cclxuXHJcbi8qKiBSZWNvcmQgYW4gaW50ZXJhY3Rpb24gaWQsIHRyaW1taW5nIHRoZSBsb2cgdG8gaXRzIGJvdW5kLiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtZW1iZXJJbnRlcmFjdGlvbihcclxuICBhcmVhOiBTdG9yYWdlQXJlYSxcclxuICBpbnRlcmFjdGlvbklkOiBzdHJpbmcsXHJcbik6IFByb21pc2U8UmVzdWx0PHZvaWQ+PiB7XHJcbiAgY29uc3QgbG9nID0gYXdhaXQgcmVhZEludGVyYWN0aW9uTG9nKGFyZWEpO1xyXG4gIGlmIChsb2cuaW5jbHVkZXMoaW50ZXJhY3Rpb25JZCkpIHJldHVybiBzdWNjZXNzKHVuZGVmaW5lZCk7XHJcbiAgY29uc3QgbmV4dCA9IFsuLi5sb2csIGludGVyYWN0aW9uSWRdLnNsaWNlKC1JTlRFUkFDVElPTl9MT0dfTElNSVQpO1xyXG4gIHJldHVybiBndWFyZGVkKCgpID0+IGFyZWEuc2V0KElOVEVSQUNUSU9OU19LRVksIG5leHQpKTtcclxufVxyXG4iLCIvKipcclxuICogQWN0aXZlLXNlc3Npb24gc3RhdGUsIG93bmVkIGV4Y2x1c2l2ZWx5IGJ5IHRoZSBiYWNrZ3JvdW5kIHdvcmtlci5cclxuICpcclxuICogTGl2ZXMgaW4gYHN0b3JhZ2Uuc2Vzc2lvbmAgc28gaXQgZGlzYXBwZWFycyB3aGVuIHRoZSBicm93c2VyIGNsb3NlcyBhbmRcclxuICogc3Vydml2ZXMgYSBzZXJ2aWNlLXdvcmtlciByZXN0YXJ0IGluIGJldHdlZW4uIFRoZXJlIGlzIGF0IG1vc3Qgb25lIGFjdGl2ZVxyXG4gKiBFY2xpcHNlIHNlc3Npb24gYWNyb3NzIGFsbCB0YWJzLlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5pbXBvcnQgeyBndWFyZGVkLCB0eXBlIFN0b3JhZ2VBcmVhIH0gZnJvbSAnLi9hcmVhJztcclxuaW1wb3J0IHsgU0VTU0lPTl9LRVkgfSBmcm9tICcuL2tleXMnO1xyXG5pbXBvcnQgdHlwZSB7IFJlc3VsdCB9IGZyb20gJy4uL2RvbWFpbi9lcnJvcnMnO1xyXG5pbXBvcnQgeyBzdWNjZXNzIH0gZnJvbSAnLi4vZG9tYWluL2Vycm9ycyc7XHJcblxyXG5leHBvcnQgY29uc3QgYWN0aXZlU2Vzc2lvblNjaGVtYSA9IHpcclxuICAub2JqZWN0KHtcclxuICAgIHNlc3Npb25JZDogei5zdHJpbmcoKS5taW4oMSksXHJcbiAgICB0YWJJZDogei5udW1iZXIoKS5pbnQoKSxcclxuICAgIHN0YXJ0ZWRBdDogei5zdHJpbmcoKSxcclxuICAgIHBoYXNlOiB6LmVudW0oWydwZW5kaW5nJywgJ2FjdGl2ZSddKS5vcHRpb25hbCgpLFxyXG4gIH0pXHJcbiAgLnRyYW5zZm9ybSgoc2Vzc2lvbikgPT4gKHsgLi4uc2Vzc2lvbiwgcGhhc2U6IHNlc3Npb24ucGhhc2UgPz8gKCdhY3RpdmUnIGFzIGNvbnN0KSB9KSk7XHJcblxyXG5leHBvcnQgdHlwZSBBY3RpdmVTZXNzaW9uID0gei5pbmZlcjx0eXBlb2YgYWN0aXZlU2Vzc2lvblNjaGVtYT47XHJcblxyXG4vKiogR2VuZXJhdGlvbiBpcyBhbGxvd2VkIGR1cmluZyBhY3RpdmF0aW9uIGFuZCBhZnRlciBpdCwgYnV0IG5ldmVyIGNyb3NzLXNlc3Npb24uICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0dlbmVyYXRpb25BdXRob3JpemVkKFxyXG4gIHNlc3Npb246IEFjdGl2ZVNlc3Npb24gfCBudWxsLFxyXG4gIHNlbmRlclRhYklkOiBudW1iZXIgfCB1bmRlZmluZWQsXHJcbiAgcmVxdWVzdGVkU2Vzc2lvbklkOiBzdHJpbmcsXHJcbik6IGJvb2xlYW4ge1xyXG4gIHJldHVybiAoXHJcbiAgICBzZXNzaW9uICE9PSBudWxsICYmIHNlbmRlclRhYklkID09PSBzZXNzaW9uLnRhYklkICYmIHJlcXVlc3RlZFNlc3Npb25JZCA9PT0gc2Vzc2lvbi5zZXNzaW9uSWRcclxuICApO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEFjdGl2ZVNlc3Npb24oYXJlYTogU3RvcmFnZUFyZWEpOiBQcm9taXNlPEFjdGl2ZVNlc3Npb24gfCBudWxsPiB7XHJcbiAgY29uc3QgcmVhZCA9IGF3YWl0IGd1YXJkZWQoKCkgPT4gYXJlYS5nZXQoU0VTU0lPTl9LRVkpKTtcclxuICBpZiAoIXJlYWQub2spIHJldHVybiBudWxsO1xyXG4gIGNvbnN0IHBhcnNlZCA9IGFjdGl2ZVNlc3Npb25TY2hlbWEuc2FmZVBhcnNlKHJlYWQuZGF0YSk7XHJcbiAgcmV0dXJuIHBhcnNlZC5zdWNjZXNzID8gcGFyc2VkLmRhdGEgOiBudWxsO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGVBY3RpdmVTZXNzaW9uKFxyXG4gIGFyZWE6IFN0b3JhZ2VBcmVhLFxyXG4gIHNlc3Npb246IEFjdGl2ZVNlc3Npb24sXHJcbik6IFByb21pc2U8UmVzdWx0PEFjdGl2ZVNlc3Npb24+PiB7XHJcbiAgY29uc3Qgd3JpdHRlbiA9IGF3YWl0IGd1YXJkZWQoKCkgPT4gYXJlYS5zZXQoU0VTU0lPTl9LRVksIHNlc3Npb24pKTtcclxuICBpZiAoIXdyaXR0ZW4ub2spIHJldHVybiB3cml0dGVuO1xyXG4gIHJldHVybiBzdWNjZXNzKHNlc3Npb24pO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJBY3RpdmVTZXNzaW9uKGFyZWE6IFN0b3JhZ2VBcmVhKTogUHJvbWlzZTxSZXN1bHQ8dm9pZD4+IHtcclxuICByZXR1cm4gZ3VhcmRlZCgoKSA9PiBhcmVhLnJlbW92ZShTRVNTSU9OX0tFWSkpO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBXaGV0aGVyIHRoZSBvcHRpb25hbCBnZW5lcmF0aW9uIEFQSSBpcyBzd2l0Y2hlZCBvbi5cclxuICpcclxuICogT2ZmIGJ5IGRlZmF1bHQgYW5kIG9mZiBhZnRlciBhIHJlc2V0LiBUaGUgb3JpZ2luIGlzIGEgYnVpbGQtdGltZSBjb25zdGFudCxcclxuICogbm90IHVzZXIgaW5wdXQsIHNvIHRoZXJlIGlzIG5vIHdheSBmb3IgYSBwYWdlIHRvIHBvaW50IEVjbGlwc2UgYXQgYSBzZXJ2ZXIgb2ZcclxuICogaXRzIGNob29zaW5nLlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IHogfSBmcm9tICd6b2QnO1xyXG5pbXBvcnQgeyBndWFyZGVkLCB0eXBlIFN0b3JhZ2VBcmVhIH0gZnJvbSAnLi9hcmVhJztcclxuaW1wb3J0IHsgUFJPVklERVJfU0VUVElOR1NfS0VZIH0gZnJvbSAnLi9rZXlzJztcclxuaW1wb3J0IHR5cGUgeyBSZXN1bHQgfSBmcm9tICcuLi9kb21haW4vZXJyb3JzJztcclxuaW1wb3J0IHsgc3VjY2VzcyB9IGZyb20gJy4uL2RvbWFpbi9lcnJvcnMnO1xyXG5cclxuLyoqIFRoZSBvbmx5IG9yaWdpbiBFY2xpcHNlIHdpbGwgZXZlciBjb250YWN0LCBhbmQgb25seSB3aGVuIGV4cGxpY2l0bHkgZW5hYmxlZC4gKi9cclxuZXhwb3J0IGNvbnN0IFBST1ZJREVSX09SSUdJTiA9ICdodHRwOi8vbG9jYWxob3N0Ojg3ODcnO1xyXG5leHBvcnQgY29uc3QgUFJPVklERVJfRU5EUE9JTlQgPSBgJHtQUk9WSURFUl9PUklHSU59L2FwaS9jb250ZXh0LXRyYXBzYDtcclxuZXhwb3J0IGNvbnN0IFBST1ZJREVSX0hFQUxUSF9FTkRQT0lOVCA9IGAke1BST1ZJREVSX09SSUdJTn0vaGVhbHRoYDtcclxuZXhwb3J0IGNvbnN0IFBST1ZJREVSX1BFUk1JU1NJT05fUEFUVEVSTiA9ICdodHRwOi8vbG9jYWxob3N0Ojg3ODcvKic7XHJcbmV4cG9ydCBjb25zdCBQUk9WSURFUl9NT0RFTCA9ICdnZW1pbmktMy41LWZsYXNoLWxpdGUnO1xyXG5cclxuLyoqIENsaWVudC1zaWRlIGNlaWxpbmcgb24gaG93IGxvbmcgYWN0aXZhdGlvbiB3aWxsIHdhaXQgZm9yIGdlbmVyYXRlZCB0cmFwcy4gKi9cclxuZXhwb3J0IGNvbnN0IFBST1ZJREVSX1RJTUVPVVRfTVMgPSA0MDAwO1xyXG5cclxuLyoqIE1heGltdW0gc2VudGVuY2VzIHNlbnQgaW4gb25lIHJlcXVlc3QuICovXHJcbmV4cG9ydCBjb25zdCBQUk9WSURFUl9NQVhfU0VOVEVOQ0VTID0gODtcclxuXHJcbi8qKiBNYXhpbXVtIGNoYXJhY3RlcnMgcGVyIHNlbnRlbmNlIHNlbnQuICovXHJcbmV4cG9ydCBjb25zdCBQUk9WSURFUl9NQVhfU0VOVEVOQ0VfTEVOR1RIID0gMzAwO1xyXG5cclxuZXhwb3J0IGNvbnN0IHByb3ZpZGVyU2V0dGluZ3NTY2hlbWEgPSB6Lm9iamVjdCh7XHJcbiAgZW5hYmxlZDogei5ib29sZWFuKCksXHJcbiAgbGFzdEVycm9yOiB6LnN0cmluZygpLm51bGxhYmxlKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IHR5cGUgUHJvdmlkZXJTZXR0aW5ncyA9IHouaW5mZXI8dHlwZW9mIHByb3ZpZGVyU2V0dGluZ3NTY2hlbWE+O1xyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPVklERVJfU0VUVElOR1M6IFByb3ZpZGVyU2V0dGluZ3MgPSB7XHJcbiAgZW5hYmxlZDogZmFsc2UsXHJcbiAgbGFzdEVycm9yOiBudWxsLFxyXG59O1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRQcm92aWRlclNldHRpbmdzKGFyZWE6IFN0b3JhZ2VBcmVhKTogUHJvbWlzZTxQcm92aWRlclNldHRpbmdzPiB7XHJcbiAgY29uc3QgcmVhZCA9IGF3YWl0IGd1YXJkZWQoKCkgPT4gYXJlYS5nZXQoUFJPVklERVJfU0VUVElOR1NfS0VZKSk7XHJcbiAgaWYgKCFyZWFkLm9rKSByZXR1cm4gREVGQVVMVF9QUk9WSURFUl9TRVRUSU5HUztcclxuICBjb25zdCBwYXJzZWQgPSBwcm92aWRlclNldHRpbmdzU2NoZW1hLnNhZmVQYXJzZShyZWFkLmRhdGEpO1xyXG4gIHJldHVybiBwYXJzZWQuc3VjY2VzcyA/IHBhcnNlZC5kYXRhIDogREVGQVVMVF9QUk9WSURFUl9TRVRUSU5HUztcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlUHJvdmlkZXJTZXR0aW5ncyhcclxuICBhcmVhOiBTdG9yYWdlQXJlYSxcclxuICBzZXR0aW5nczogUHJvdmlkZXJTZXR0aW5ncyxcclxuKTogUHJvbWlzZTxSZXN1bHQ8UHJvdmlkZXJTZXR0aW5ncz4+IHtcclxuICBjb25zdCB3cml0dGVuID0gYXdhaXQgZ3VhcmRlZCgoKSA9PiBhcmVhLnNldChQUk9WSURFUl9TRVRUSU5HU19LRVksIHNldHRpbmdzKSk7XHJcbiAgaWYgKCF3cml0dGVuLm9rKSByZXR1cm4gd3JpdHRlbjtcclxuICByZXR1cm4gc3VjY2VzcyhzZXR0aW5ncyk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbGVhclByb3ZpZGVyU2V0dGluZ3MoYXJlYTogU3RvcmFnZUFyZWEpOiBQcm9taXNlPFJlc3VsdDx2b2lkPj4ge1xyXG4gIHJldHVybiBndWFyZGVkKCgpID0+IGFyZWEucmVtb3ZlKFBST1ZJREVSX1NFVFRJTkdTX0tFWSkpO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDYWNoZSBmb3Igb3B0aW9uYWwgcHJvdmlkZXIgcmVzdWx0cy5cclxuICpcclxuICogQm91bmRlZCBhdCAxMDAgZW50cmllcyB3aXRoIG9sZGVzdC1hY2Nlc3MgZXZpY3Rpb24sIHNvIGEgbG9uZyBzZXNzaW9uIGNhbm5vdFxyXG4gKiBncm93IHN0b3JhZ2Ugd2l0aG91dCBsaW1pdC4gS2V5cyBhcmUgaGFzaGVzIG9mIHRoZSBzZW50ZW5jZSB0ZXh0IOKAlCB0aGVcclxuICogc2VudGVuY2UgaXRzZWxmIGlzIG5ldmVyIHN0b3JlZCwgd2hpY2gga2VlcHMgcGFnZSBjb250ZW50IG91dCBvZlxyXG4gKiBgc3RvcmFnZS5sb2NhbGAgZXZlbiB3aGVuIHRoZSBvcHRpb25hbCBwcm92aWRlciBpcyBpbiB1c2UuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZ3VhcmRlZCwgdHlwZSBTdG9yYWdlQXJlYSB9IGZyb20gJy4vYXJlYSc7XHJcbmltcG9ydCB7IFBST1ZJREVSX0NBQ0hFX0tFWSB9IGZyb20gJy4va2V5cyc7XHJcbmltcG9ydCB7IHZhbGlkYXRlVHJhcCwgdHlwZSBDb250ZXh0VHJhcCB9IGZyb20gJy4uL2RvbWFpbi90cmFwJztcclxuaW1wb3J0IHsgUFJPVklERVJfTU9ERUwgfSBmcm9tICcuL3Byb3ZpZGVyLXNldHRpbmdzJztcclxuaW1wb3J0IHR5cGUgeyBSZXN1bHQgfSBmcm9tICcuLi9kb21haW4vZXJyb3JzJztcclxuaW1wb3J0IHsgc3VjY2VzcyB9IGZyb20gJy4uL2RvbWFpbi9lcnJvcnMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBST1ZJREVSX0NBQ0hFX0xJTUlUID0gMTAwO1xyXG5leHBvcnQgY29uc3QgUFJPVklERVJfQ0FDSEVfU0NPUEUgPSBgc291cmNlPWVufHRhcmdldD1mci1GUnxwcm92aWRlcj1nZW1pbml8bW9kZWw9JHtQUk9WSURFUl9NT0RFTH18cHJvbXB0PXYxfHNjaGVtYT12MWA7XHJcblxyXG5pbnRlcmZhY2UgQ2FjaGVFbnRyeSB7XHJcbiAgLyoqIE1pbGxpc2Vjb25kIHRpbWVzdGFtcCBvZiB0aGUgbW9zdCByZWNlbnQgcmVhZCBvciB3cml0ZS4gKi9cclxuICBhY2Nlc3NlZEF0OiBudW1iZXI7XHJcbiAgdHJhcHM6IHVua25vd25bXTtcclxufVxyXG5cclxudHlwZSBDYWNoZVNoYXBlID0gUmVjb3JkPHN0cmluZywgQ2FjaGVFbnRyeT47XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FjaGVLZXlGb3Ioc2VudGVuY2U6IHN0cmluZywgc2NvcGUgPSBQUk9WSURFUl9DQUNIRV9TQ09QRSk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoYCR7c2NvcGV9XFwwJHtzZW50ZW5jZX1gKTtcclxuICBjb25zdCBkaWdlc3QgPSBhd2FpdCBnbG9iYWxUaGlzLmNyeXB0by5zdWJ0bGUuZGlnZXN0KCdTSEEtMjU2JywgYnl0ZXMpO1xyXG4gIHJldHVybiBBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KGRpZ2VzdCksIChieXRlKSA9PiBieXRlLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKS5qb2luKCcnKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcmVhZENhY2hlKGFyZWE6IFN0b3JhZ2VBcmVhKTogUHJvbWlzZTxDYWNoZVNoYXBlPiB7XHJcbiAgY29uc3QgcmVhZCA9IGF3YWl0IGd1YXJkZWQoKCkgPT4gYXJlYS5nZXQoUFJPVklERVJfQ0FDSEVfS0VZKSk7XHJcbiAgaWYgKCFyZWFkLm9rIHx8IHR5cGVvZiByZWFkLmRhdGEgIT09ICdvYmplY3QnIHx8IHJlYWQuZGF0YSA9PT0gbnVsbCkgcmV0dXJuIHt9O1xyXG4gIHJldHVybiByZWFkLmRhdGEgYXMgQ2FjaGVTaGFwZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIExvb2sgdXAgY2FjaGVkIHRyYXBzIGZvciBhIHNlbnRlbmNlLiBFbnRyaWVzIGFyZSByZS12YWxpZGF0ZWQgb24gcmVhZCwgc28gYVxyXG4gKiBjYWNoZSB3cml0dGVuIGJ5IGFuIG9sZGVyLCBsYXhlciBidWlsZCBjYW4gbmV2ZXIgYnlwYXNzIGN1cnJlbnQgdmFsaWRhdGlvbi5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDYWNoZWRUcmFwcyhcclxuICBhcmVhOiBTdG9yYWdlQXJlYSxcclxuICBzZW50ZW5jZTogc3RyaW5nLFxyXG4gIG5vdzogRGF0ZSxcclxuICBzY29wZSA9IFBST1ZJREVSX0NBQ0hFX1NDT1BFLFxyXG4pOiBQcm9taXNlPENvbnRleHRUcmFwW10gfCBudWxsPiB7XHJcbiAgY29uc3QgY2FjaGUgPSBhd2FpdCByZWFkQ2FjaGUoYXJlYSk7XHJcbiAgY29uc3Qga2V5ID0gYXdhaXQgY2FjaGVLZXlGb3Ioc2VudGVuY2UsIHNjb3BlKTtcclxuICBjb25zdCBlbnRyeSA9IGNhY2hlW2tleV07XHJcbiAgaWYgKCFlbnRyeSkgcmV0dXJuIG51bGw7XHJcblxyXG4gIGNvbnN0IHRyYXBzOiBDb250ZXh0VHJhcFtdID0gW107XHJcbiAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgZW50cnkudHJhcHMpIHtcclxuICAgIGlmICh0eXBlb2YgY2FuZGlkYXRlICE9PSAnb2JqZWN0JyB8fCBjYW5kaWRhdGUgPT09IG51bGwpIGNvbnRpbnVlO1xyXG4gICAgY29uc3QgdmFsaWRhdGVkID0gdmFsaWRhdGVUcmFwKHsgLi4uY2FuZGlkYXRlLCBzZW50ZW5jZSB9LCB7IHVudHJ1c3RlZDogdHJ1ZSB9KTtcclxuICAgIGlmICh2YWxpZGF0ZWQub2spIHRyYXBzLnB1c2godmFsaWRhdGVkLmRhdGEpO1xyXG4gIH1cclxuICBpZiAodHJhcHMubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgZW50cnkuYWNjZXNzZWRBdCA9IG5vdy5nZXRUaW1lKCk7XHJcbiAgYXdhaXQgZ3VhcmRlZCgoKSA9PiBhcmVhLnNldChQUk9WSURFUl9DQUNIRV9LRVksIGNhY2hlKSk7XHJcbiAgcmV0dXJuIHRyYXBzO1xyXG59XHJcblxyXG4vKiogU3RvcmUgdHJhcHMgZm9yIGEgc2VudGVuY2UsIGV2aWN0aW5nIHRoZSBsZWFzdCByZWNlbnRseSBhY2Nlc3NlZCBlbnRyaWVzLiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0Q2FjaGVkVHJhcHMoXHJcbiAgYXJlYTogU3RvcmFnZUFyZWEsXHJcbiAgc2VudGVuY2U6IHN0cmluZyxcclxuICB0cmFwczogcmVhZG9ubHkgQ29udGV4dFRyYXBbXSxcclxuICBub3c6IERhdGUsXHJcbiAgc2NvcGUgPSBQUk9WSURFUl9DQUNIRV9TQ09QRSxcclxuKTogUHJvbWlzZTxSZXN1bHQ8dm9pZD4+IHtcclxuICBjb25zdCB0ZW1wbGF0ZXM6IFBhcnRpYWw8Q29udGV4dFRyYXA+W10gPSBbXTtcclxuICBmb3IgKGNvbnN0IHRyYXAgb2YgdHJhcHMpIHtcclxuICAgIGNvbnN0IHZhbGlkYXRlZCA9IHZhbGlkYXRlVHJhcCh7IC4uLnRyYXAsIHNlbnRlbmNlIH0sIHsgdW50cnVzdGVkOiB0cnVlIH0pO1xyXG4gICAgaWYgKCF2YWxpZGF0ZWQub2spIGNvbnRpbnVlO1xyXG4gICAgY29uc3QgdGVtcGxhdGU6IFBhcnRpYWw8Q29udGV4dFRyYXA+ID0geyAuLi52YWxpZGF0ZWQuZGF0YSB9O1xyXG4gICAgZGVsZXRlIHRlbXBsYXRlLnNlbnRlbmNlO1xyXG4gICAgdGVtcGxhdGVzLnB1c2godGVtcGxhdGUpO1xyXG4gIH1cclxuICBpZiAodGVtcGxhdGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHN1Y2Nlc3ModW5kZWZpbmVkKTtcclxuXHJcbiAgY29uc3QgY2FjaGUgPSBhd2FpdCByZWFkQ2FjaGUoYXJlYSk7XHJcbiAgY29uc3Qga2V5ID0gYXdhaXQgY2FjaGVLZXlGb3Ioc2VudGVuY2UsIHNjb3BlKTtcclxuICBjYWNoZVtrZXldID0ge1xyXG4gICAgYWNjZXNzZWRBdDogbm93LmdldFRpbWUoKSxcclxuICAgIHRyYXBzOiB0ZW1wbGF0ZXMsXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKGNhY2hlKTtcclxuICBpZiAoZW50cmllcy5sZW5ndGggPiBQUk9WSURFUl9DQUNIRV9MSU1JVCkge1xyXG4gICAgZW50cmllcy5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgIGNvbnN0IGJ5QWNjZXNzID0gYlsxXS5hY2Nlc3NlZEF0IC0gYVsxXS5hY2Nlc3NlZEF0O1xyXG4gICAgICBpZiAoYnlBY2Nlc3MgIT09IDApIHJldHVybiBieUFjY2VzcztcclxuICAgICAgcmV0dXJuIGFbMF0gPCBiWzBdID8gLTEgOiBhWzBdID4gYlswXSA/IDEgOiAwO1xyXG4gICAgfSk7XHJcbiAgICBjb25zdCBrZXB0ID0gT2JqZWN0LmZyb21FbnRyaWVzKGVudHJpZXMuc2xpY2UoMCwgUFJPVklERVJfQ0FDSEVfTElNSVQpKTtcclxuICAgIHJldHVybiBndWFyZGVkKCgpID0+IGFyZWEuc2V0KFBST1ZJREVSX0NBQ0hFX0tFWSwga2VwdCkpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGd1YXJkZWQoKCkgPT4gYXJlYS5zZXQoUFJPVklERVJfQ0FDSEVfS0VZLCBjYWNoZSkpO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJQcm92aWRlckNhY2hlKGFyZWE6IFN0b3JhZ2VBcmVhKTogUHJvbWlzZTxSZXN1bHQ8dm9pZD4+IHtcclxuICByZXR1cm4gZ3VhcmRlZCgoKSA9PiBhcmVhLnJlbW92ZShQUk9WSURFUl9DQUNIRV9LRVkpKTtcclxufVxyXG5cclxuLyoqIEVudHJ5IGNvdW50LCBmb3IgdGVzdHMgYW5kIHRoZSBwb3B1cCdzIHN0b3JhZ2UgZGlzY2xvc3VyZS4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb3ZpZGVyQ2FjaGVTaXplKGFyZWE6IFN0b3JhZ2VBcmVhKTogUHJvbWlzZTxSZXN1bHQ8bnVtYmVyPj4ge1xyXG4gIGNvbnN0IGNhY2hlID0gYXdhaXQgcmVhZENhY2hlKGFyZWEpO1xyXG4gIHJldHVybiBzdWNjZXNzKE9iamVjdC5rZXlzKGNhY2hlKS5sZW5ndGgpO1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDbGllbnQgZm9yIHRoZSBvcHRpb25hbCBsb2NhbCBnZW5lcmF0aW9uIEFQSS5cclxuICpcclxuICogRXZlcnl0aGluZyBhYm91dCB0aGlzIHBhdGggaXMgZGVzaWduZWQgdG8gYmUgc2tpcHBhYmxlLiBJdCBydW5zIG9ubHkgd2hlbiB0aGVcclxuICogdXNlciBoYXMgc3dpdGNoZWQgaXQgb24sIGl0IGhhcyBhIGhhcmQgdGltZW91dCwgaXQgbmV2ZXIgcmV0cmllcyBkdXJpbmdcclxuICogYWN0aXZhdGlvbiwgYW5kIGFueSBmYWlsdXJlIGF0IGFsbCBsZWF2ZXMgdGhlIGNhdGFsb2cgdHJhcHMgZXhhY3RseSBhcyB0aGV5XHJcbiAqIHdlcmUuXHJcbiAqXHJcbiAqIFdoYXQgbGVhdmVzIHRoZSBicm93c2VyOiBhdCBtb3N0IGVpZ2h0IHNlbnRlbmNlcyBvZiBhcnRpY2xlIHRleHQuIE5ldmVyIHRoZVxyXG4gKiBwYWdlIFVSTCwgbmV2ZXIgdGhlIGxlYXJuZXIgcHJvZmlsZSwgbmV2ZXIgYW5zd2VyIGhpc3RvcnksIG5ldmVyIGFueXRoaW5nXHJcbiAqIGVsc2UgZnJvbSB0aGUgcGFnZS5cclxuICovXHJcblxyXG5pbXBvcnQgeyBmYWlsdXJlLCBzdWNjZXNzLCB0eXBlIFJlc3VsdCB9IGZyb20gJy4uL2RvbWFpbi9lcnJvcnMnO1xyXG5pbXBvcnQgeyBjb2xsYXBzZVdoaXRlc3BhY2UgfSBmcm9tICcuLi9kb21haW4vbm9ybWFsaXplJztcclxuaW1wb3J0IHsgdmFsaWRhdGVUcmFwLCB0eXBlIEdlbmVyYXRlZFRyYXBDYW5kaWRhdGUgfSBmcm9tICcuLi9kb21haW4vdHJhcCc7XHJcbmltcG9ydCB7XHJcbiAgUFJPVklERVJfRU5EUE9JTlQsXHJcbiAgUFJPVklERVJfSEVBTFRIX0VORFBPSU5ULFxyXG4gIFBST1ZJREVSX01BWF9TRU5URU5DRVMsXHJcbiAgUFJPVklERVJfTUFYX1NFTlRFTkNFX0xFTkdUSCxcclxuICBQUk9WSURFUl9NT0RFTCxcclxuICBQUk9WSURFUl9USU1FT1VUX01TLFxyXG59IGZyb20gJy4uL3N0b3JhZ2UvcHJvdmlkZXItc2V0dGluZ3MnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQcm92aWRlclNlbnRlbmNlIHtcclxuICByZWFkb25seSBpZDogc3RyaW5nO1xyXG4gIHJlYWRvbmx5IHRleHQ6IHN0cmluZztcclxufVxyXG5cclxuLyoqIFN0YXR1cyBjb2RlcyB0aGUgc2VydmVyIHVzZXMsIG1hcHBlZCBvbnRvIEVjbGlwc2UncyBlcnJvciB2b2NhYnVsYXJ5LiAqL1xyXG5mdW5jdGlvbiBjb2RlRm9yU3RhdHVzKHN0YXR1czogbnVtYmVyKSB7XHJcbiAgc3dpdGNoIChzdGF0dXMpIHtcclxuICAgIGNhc2UgNDAzOlxyXG4gICAgICByZXR1cm4gJ1BST1ZJREVSX1BFUk1JU1NJT05fREVOSUVEJyBhcyBjb25zdDtcclxuICAgIGNhc2UgNDI5OlxyXG4gICAgY2FzZSA1MDM6XHJcbiAgICAgIHJldHVybiAnUFJPVklERVJfVU5BVkFJTEFCTEUnIGFzIGNvbnN0O1xyXG4gICAgY2FzZSA1MDQ6XHJcbiAgICAgIHJldHVybiAnUFJPVklERVJfVElNRU9VVCcgYXMgY29uc3Q7XHJcbiAgICBjYXNlIDUwMjpcclxuICAgIGNhc2UgNDAwOlxyXG4gICAgICByZXR1cm4gJ1BST1ZJREVSX0lOVkFMSURfUkVTUE9OU0UnIGFzIGNvbnN0O1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuICdQUk9WSURFUl9VTkFWQUlMQUJMRScgYXMgY29uc3Q7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEZldGNoVHJhcHNPcHRpb25zIHtcclxuICByZWFkb25seSBlbmRwb2ludD86IHN0cmluZztcclxuICByZWFkb25seSB0aW1lb3V0TXM/OiBudW1iZXI7XHJcbiAgcmVhZG9ubHkgZmV0Y2hJbXBsPzogdHlwZW9mIGZldGNoO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFByb3ZpZGVySGVhbHRoIHtcclxuICByZWFkb25seSBwcm92aWRlcjogJ2dlbWluaSc7XHJcbiAgcmVhZG9ubHkgbW9kZWw6IHR5cGVvZiBQUk9WSURFUl9NT0RFTDtcclxufVxyXG5cclxuLyoqIFZlcmlmeSB0aGUgbG9jYWwgc2VydmVyIGJlZm9yZSBwZXJzaXN0aW5nIHRoZSBBSS1lbmFibGVkIHNldHRpbmcuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja1Byb3ZpZGVySGVhbHRoKFxyXG4gIG9wdGlvbnM6IEZldGNoVHJhcHNPcHRpb25zID0ge30sXHJcbik6IFByb21pc2U8UmVzdWx0PFByb3ZpZGVySGVhbHRoPj4ge1xyXG4gIGNvbnN0IGRvRmV0Y2ggPSBvcHRpb25zLmZldGNoSW1wbCA/PyBnbG9iYWxUaGlzLmZldGNoO1xyXG4gIGlmICh0eXBlb2YgZG9GZXRjaCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhaWx1cmUoJ1BST1ZJREVSX1VOQVZBSUxBQkxFJyk7XHJcblxyXG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XHJcbiAgY29uc3QgdGltZW91dE1zID0gb3B0aW9ucy50aW1lb3V0TXMgPz8gUFJPVklERVJfVElNRU9VVF9NUztcclxuICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4gY29udHJvbGxlci5hYm9ydCgpLCB0aW1lb3V0TXMpO1xyXG5cclxuICBsZXQgcmVzcG9uc2U6IFJlc3BvbnNlO1xyXG4gIHRyeSB7XHJcbiAgICByZXNwb25zZSA9IGF3YWl0IGRvRmV0Y2goUFJPVklERVJfSEVBTFRIX0VORFBPSU5ULCB7XHJcbiAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXHJcbiAgICAgIGNyZWRlbnRpYWxzOiAnb21pdCcsXHJcbiAgICAgIGNhY2hlOiAnbm8tc3RvcmUnLFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoY2F1c2UpIHtcclxuICAgIGNvbnN0IGFib3J0ZWQgPSBjYXVzZSBpbnN0YW5jZW9mIEVycm9yICYmIGNhdXNlLm5hbWUgPT09ICdBYm9ydEVycm9yJztcclxuICAgIHJldHVybiBmYWlsdXJlKGFib3J0ZWQgPyAnUFJPVklERVJfVElNRU9VVCcgOiAnUFJPVklERVJfVU5BVkFJTEFCTEUnKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICB9XHJcblxyXG4gIGlmICghcmVzcG9uc2Uub2spIHJldHVybiBmYWlsdXJlKCdQUk9WSURFUl9VTkFWQUlMQUJMRScpO1xyXG5cclxuICBsZXQgYm9keTogdW5rbm93bjtcclxuICB0cnkge1xyXG4gICAgYm9keSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBmYWlsdXJlKCdQUk9WSURFUl9JTlZBTElEX1JFU1BPTlNFJyk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBoZWFsdGggPSBib2R5IGFzIHsgb2s/OiB1bmtub3duOyBwcm92aWRlcj86IHVua25vd247IG1vZGVsPzogdW5rbm93biB9O1xyXG4gIGlmIChoZWFsdGgub2sgIT09IHRydWUgfHwgaGVhbHRoLnByb3ZpZGVyICE9PSAnZ2VtaW5pJyB8fCBoZWFsdGgubW9kZWwgIT09IFBST1ZJREVSX01PREVMKSB7XHJcbiAgICByZXR1cm4gZmFpbHVyZShcclxuICAgICAgJ1BST1ZJREVSX0RJU0FCTEVEJyxcclxuICAgICAgYFN0YXJ0IHRoZSBsb2NhbCBHZW1pbmkgc2VydmVyIHdpdGggbW9kZWwgJHtQUk9WSURFUl9NT0RFTH0sIHRoZW4gdHJ5IGFnYWluLmAsXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHN1Y2Nlc3MoeyBwcm92aWRlcjogJ2dlbWluaScsIG1vZGVsOiBQUk9WSURFUl9NT0RFTCB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFzayB0aGUgbG9jYWwgQVBJIGZvciB0cmFwcyBvdmVyIHRoZSBnaXZlbiBzZW50ZW5jZXMuXHJcbiAqXHJcbiAqIFJldHVybnMgdmFsaWRhdGVkLCBzZW50ZW5jZS1ib3VuZCBjYW5kaWRhdGVzIG9ubHkuIEFueXRoaW5nIHRoZSBzZXJ2ZXIgc2VuZHMgdGhhdCBkb2VzIG5vdCBwYXNzXHJcbiAqIHRoZSBzYW1lIHZhbGlkYXRpb24gdGhlIGNhdGFsb2cgcGFzc2VzIGlzIGRpc2NhcmRlZCDigJQgYW4gaW52YWxpZCBtb2RlbFxyXG4gKiByZXNwb25zZSBjYW4gbmV2ZXIgcmVhY2ggdGhlIERPTS5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaEdlbmVyYXRlZFRyYXBzKFxyXG4gIHNlbnRlbmNlczogcmVhZG9ubHkgUHJvdmlkZXJTZW50ZW5jZVtdLFxyXG4gIG9wdGlvbnM6IEZldGNoVHJhcHNPcHRpb25zID0ge30sXHJcbik6IFByb21pc2U8UmVzdWx0PEdlbmVyYXRlZFRyYXBDYW5kaWRhdGVbXT4+IHtcclxuICBjb25zdCBlbmRwb2ludCA9IG9wdGlvbnMuZW5kcG9pbnQgPz8gUFJPVklERVJfRU5EUE9JTlQ7XHJcbiAgY29uc3QgdGltZW91dE1zID0gb3B0aW9ucy50aW1lb3V0TXMgPz8gUFJPVklERVJfVElNRU9VVF9NUztcclxuICBjb25zdCBkb0ZldGNoID0gb3B0aW9ucy5mZXRjaEltcGwgPz8gZ2xvYmFsVGhpcy5mZXRjaDtcclxuXHJcbiAgaWYgKHR5cGVvZiBkb0ZldGNoICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICByZXR1cm4gZmFpbHVyZSgnUFJPVklERVJfVU5BVkFJTEFCTEUnLCAnTm8gZmV0Y2ggaW1wbGVtZW50YXRpb24gaXMgYXZhaWxhYmxlLicpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcGF5bG9hZCA9IHtcclxuICAgIHNvdXJjZUxvY2FsZTogJ2VuJyBhcyBjb25zdCxcclxuICAgIHRhcmdldExvY2FsZTogJ2ZyLUZSJyBhcyBjb25zdCxcclxuICAgIHNlbnRlbmNlczogc2VudGVuY2VzLnNsaWNlKDAsIFBST1ZJREVSX01BWF9TRU5URU5DRVMpLm1hcCgoc2VudGVuY2UpID0+ICh7XHJcbiAgICAgIGlkOiBzZW50ZW5jZS5pZCxcclxuICAgICAgdGV4dDogc2VudGVuY2UudGV4dC5zbGljZSgwLCBQUk9WSURFUl9NQVhfU0VOVEVOQ0VfTEVOR1RIKSxcclxuICAgIH0pKSxcclxuICB9O1xyXG5cclxuICBpZiAocGF5bG9hZC5zZW50ZW5jZXMubGVuZ3RoID09PSAwKSByZXR1cm4gc3VjY2VzcyhbXSk7XHJcblxyXG4gIGNvbnN0IGNvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XHJcbiAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IGNvbnRyb2xsZXIuYWJvcnQoKSwgdGltZW91dE1zKTtcclxuXHJcbiAgbGV0IHJlc3BvbnNlOiBSZXNwb25zZTtcclxuICB0cnkge1xyXG4gICAgcmVzcG9uc2UgPSBhd2FpdCBkb0ZldGNoKGVuZHBvaW50LCB7XHJcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXHJcbiAgICAgIHNpZ25hbDogY29udHJvbGxlci5zaWduYWwsXHJcbiAgICAgIC8vIE5ldmVyIGF0dGFjaCBjb29raWVzIG9yIGNyZWRlbnRpYWxzIHRvIGEgZ2VuZXJhdGlvbiBjYWxsLlxyXG4gICAgICBjcmVkZW50aWFsczogJ29taXQnLFxyXG4gICAgICBjYWNoZTogJ25vLXN0b3JlJyxcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGNhdXNlKSB7XHJcbiAgICBjb25zdCBhYm9ydGVkID0gY2F1c2UgaW5zdGFuY2VvZiBFcnJvciAmJiBjYXVzZS5uYW1lID09PSAnQWJvcnRFcnJvcic7XHJcbiAgICByZXR1cm4gZmFpbHVyZShcclxuICAgICAgYWJvcnRlZCA/ICdQUk9WSURFUl9USU1FT1VUJyA6ICdQUk9WSURFUl9VTkFWQUlMQUJMRScsXHJcbiAgICAgIGFib3J0ZWRcclxuICAgICAgICA/IGBUaGUgZ2VuZXJhdGlvbiBBUEkgZGlkIG5vdCBhbnN3ZXIgd2l0aGluICR7dGltZW91dE1zfW1zLmBcclxuICAgICAgICA6ICdUaGUgZ2VuZXJhdGlvbiBBUEkgY291bGQgbm90IGJlIHJlYWNoZWQuJyxcclxuICAgICk7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgfVxyXG5cclxuICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICByZXR1cm4gZmFpbHVyZShjb2RlRm9yU3RhdHVzKHJlc3BvbnNlLnN0YXR1cyksIGBHZW5lcmF0aW9uIEFQSSByZXR1cm5lZCAke3Jlc3BvbnNlLnN0YXR1c30uYCk7XHJcbiAgfVxyXG5cclxuICBsZXQgYm9keTogdW5rbm93bjtcclxuICB0cnkge1xyXG4gICAgYm9keSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBmYWlsdXJlKCdQUk9WSURFUl9JTlZBTElEX1JFU1BPTlNFJywgJ0dlbmVyYXRpb24gQVBJIHJldHVybmVkIG1hbGZvcm1lZCBKU09OLicpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgY2FuZGlkYXRlcyA9IChib2R5IGFzIHsgY2FuZGlkYXRlcz86IHVua25vd24gfSkuY2FuZGlkYXRlcztcclxuICBpZiAoIUFycmF5LmlzQXJyYXkoY2FuZGlkYXRlcykpIHtcclxuICAgIHJldHVybiBmYWlsdXJlKCdQUk9WSURFUl9JTlZBTElEX1JFU1BPTlNFJywgJ0dlbmVyYXRpb24gQVBJIHJlc3BvbnNlIGhhZCBubyBjYW5kaWRhdGVzIGFycmF5LicpO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc2VudGVuY2VzQnlJZCA9IG5ldyBNYXAocGF5bG9hZC5zZW50ZW5jZXMubWFwKChzZW50ZW5jZSkgPT4gW3NlbnRlbmNlLmlkLCBzZW50ZW5jZS50ZXh0XSkpO1xyXG4gIGNvbnN0IGFjY2VwdGVkOiBHZW5lcmF0ZWRUcmFwQ2FuZGlkYXRlW10gPSBbXTtcclxuICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBjYW5kaWRhdGVzLnNsaWNlKDAsIFBST1ZJREVSX01BWF9TRU5URU5DRVMpKSB7XHJcbiAgICBpZiAodHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ29iamVjdCcgfHwgY2FuZGlkYXRlID09PSBudWxsKSBjb250aW51ZTtcclxuICAgIGNvbnN0IHNlbnRlbmNlSWQgPSAoY2FuZGlkYXRlIGFzIHsgc2VudGVuY2VJZD86IHVua25vd24gfSkuc2VudGVuY2VJZDtcclxuICAgIGlmICh0eXBlb2Ygc2VudGVuY2VJZCAhPT0gJ3N0cmluZycpIGNvbnRpbnVlO1xyXG4gICAgY29uc3Qgc2VudGVuY2UgPSBzZW50ZW5jZXNCeUlkLmdldChzZW50ZW5jZUlkKTtcclxuICAgIGlmIChzZW50ZW5jZSA9PT0gdW5kZWZpbmVkKSBjb250aW51ZTtcclxuXHJcbiAgICBjb25zdCB2YWxpZGF0ZWQgPSB2YWxpZGF0ZVRyYXAoKGNhbmRpZGF0ZSBhcyB7IHRyYXA/OiB1bmtub3duIH0pLnRyYXAsIHsgdW50cnVzdGVkOiB0cnVlIH0pO1xyXG4gICAgaWYgKCF2YWxpZGF0ZWQub2spIGNvbnRpbnVlO1xyXG4gICAgaWYgKGNvbGxhcHNlV2hpdGVzcGFjZSh2YWxpZGF0ZWQuZGF0YS5zZW50ZW5jZSkgIT09IGNvbGxhcHNlV2hpdGVzcGFjZShzZW50ZW5jZSkpIGNvbnRpbnVlO1xyXG5cclxuICAgIGFjY2VwdGVkLnB1c2goeyBzZW50ZW5jZUlkLCB0cmFwOiB2YWxpZGF0ZWQuZGF0YSB9KTtcclxuICB9XHJcblxyXG4gIHJldHVybiBzdWNjZXNzKGFjY2VwdGVkKTtcclxufVxyXG4iLCIvKiogQ2FjaGUtYXdhcmUgb3JjaGVzdHJhdGlvbiBmb3IgdGhlIG9wdGlvbmFsIHByb3ZpZGVyIHJlcXVlc3QuICovXHJcblxyXG5pbXBvcnQgeyBzdWNjZXNzLCB0eXBlIFJlc3VsdCB9IGZyb20gJy4uL2RvbWFpbi9lcnJvcnMnO1xyXG5pbXBvcnQgdHlwZSB7IEdlbmVyYXRlZFRyYXBDYW5kaWRhdGUgfSBmcm9tICcuLi9kb21haW4vdHJhcCc7XHJcbmltcG9ydCB0eXBlIHsgU3RvcmFnZUFyZWEgfSBmcm9tICcuLi9zdG9yYWdlL2FyZWEnO1xyXG5pbXBvcnQgeyBnZXRDYWNoZWRUcmFwcywgc2V0Q2FjaGVkVHJhcHMgfSBmcm9tICcuLi9zdG9yYWdlL3Byb3ZpZGVyLWNhY2hlJztcclxuaW1wb3J0IHsgZmV0Y2hHZW5lcmF0ZWRUcmFwcywgdHlwZSBQcm92aWRlclNlbnRlbmNlIH0gZnJvbSAnLi9jbGllbnQnO1xyXG5cclxuZXhwb3J0IHR5cGUgR2VuZXJhdGVkVHJhcEZldGNoZXIgPSAoXHJcbiAgc2VudGVuY2VzOiByZWFkb25seSBQcm92aWRlclNlbnRlbmNlW10sXHJcbikgPT4gUHJvbWlzZTxSZXN1bHQ8R2VuZXJhdGVkVHJhcENhbmRpZGF0ZVtdPj47XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVXaXRoQ2FjaGUoXHJcbiAgc2VudGVuY2VzOiByZWFkb25seSBQcm92aWRlclNlbnRlbmNlW10sXHJcbiAgYXJlYTogU3RvcmFnZUFyZWEsXHJcbiAgZmV0Y2hlcjogR2VuZXJhdGVkVHJhcEZldGNoZXIgPSBmZXRjaEdlbmVyYXRlZFRyYXBzLFxyXG4gIG5vdzogKCkgPT4gRGF0ZSA9ICgpID0+IG5ldyBEYXRlKCksXHJcbik6IFByb21pc2U8UmVzdWx0PEdlbmVyYXRlZFRyYXBDYW5kaWRhdGVbXT4+IHtcclxuICBjb25zdCBieVNlbnRlbmNlSWQgPSBuZXcgTWFwPHN0cmluZywgR2VuZXJhdGVkVHJhcENhbmRpZGF0ZVtdPigpO1xyXG4gIGNvbnN0IG1pc3NlczogUHJvdmlkZXJTZW50ZW5jZVtdID0gW107XHJcblxyXG4gIGZvciAoY29uc3Qgc2VudGVuY2Ugb2Ygc2VudGVuY2VzKSB7XHJcbiAgICBjb25zdCBjYWNoZWQgPSBhd2FpdCBnZXRDYWNoZWRUcmFwcyhhcmVhLCBzZW50ZW5jZS50ZXh0LCBub3coKSk7XHJcbiAgICBpZiAoIWNhY2hlZCkge1xyXG4gICAgICBtaXNzZXMucHVzaChzZW50ZW5jZSk7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG4gICAgYnlTZW50ZW5jZUlkLnNldChcclxuICAgICAgc2VudGVuY2UuaWQsXHJcbiAgICAgIGNhY2hlZC5tYXAoKHRyYXApID0+ICh7IHNlbnRlbmNlSWQ6IHNlbnRlbmNlLmlkLCB0cmFwIH0pKSxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBpZiAobWlzc2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHN1Y2Nlc3MoaW5DYWxsZXJPcmRlcihzZW50ZW5jZXMsIGJ5U2VudGVuY2VJZCkpO1xyXG5cclxuICBjb25zdCBmZXRjaGVkID0gYXdhaXQgZmV0Y2hlcihtaXNzZXMpO1xyXG4gIGlmICghZmV0Y2hlZC5vaykge1xyXG4gICAgY29uc3QgaGl0cyA9IGluQ2FsbGVyT3JkZXIoc2VudGVuY2VzLCBieVNlbnRlbmNlSWQpO1xyXG4gICAgcmV0dXJuIGhpdHMubGVuZ3RoID4gMCA/IHN1Y2Nlc3MoaGl0cykgOiBmZXRjaGVkO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgbWlzc2VkSWRzID0gbmV3IFNldChtaXNzZXMubWFwKChzZW50ZW5jZSkgPT4gc2VudGVuY2UuaWQpKTtcclxuICBmb3IgKGNvbnN0IGNhbmRpZGF0ZSBvZiBmZXRjaGVkLmRhdGEpIHtcclxuICAgIGlmICghbWlzc2VkSWRzLmhhcyhjYW5kaWRhdGUuc2VudGVuY2VJZCkpIGNvbnRpbnVlO1xyXG4gICAgY29uc3QgY3VycmVudCA9IGJ5U2VudGVuY2VJZC5nZXQoY2FuZGlkYXRlLnNlbnRlbmNlSWQpID8/IFtdO1xyXG4gICAgY3VycmVudC5wdXNoKGNhbmRpZGF0ZSk7XHJcbiAgICBieVNlbnRlbmNlSWQuc2V0KGNhbmRpZGF0ZS5zZW50ZW5jZUlkLCBjdXJyZW50KTtcclxuICB9XHJcblxyXG4gIGZvciAoY29uc3Qgc2VudGVuY2Ugb2YgbWlzc2VzKSB7XHJcbiAgICBjb25zdCBnZW5lcmF0ZWQgPSBieVNlbnRlbmNlSWQuZ2V0KHNlbnRlbmNlLmlkKSA/PyBbXTtcclxuICAgIGlmIChnZW5lcmF0ZWQubGVuZ3RoID09PSAwKSBjb250aW51ZTtcclxuICAgIGF3YWl0IHNldENhY2hlZFRyYXBzKFxyXG4gICAgICBhcmVhLFxyXG4gICAgICBzZW50ZW5jZS50ZXh0LFxyXG4gICAgICBnZW5lcmF0ZWQubWFwKChjYW5kaWRhdGUpID0+IGNhbmRpZGF0ZS50cmFwKSxcclxuICAgICAgbm93KCksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHN1Y2Nlc3MoaW5DYWxsZXJPcmRlcihzZW50ZW5jZXMsIGJ5U2VudGVuY2VJZCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbkNhbGxlck9yZGVyKFxyXG4gIHNlbnRlbmNlczogcmVhZG9ubHkgUHJvdmlkZXJTZW50ZW5jZVtdLFxyXG4gIGJ5U2VudGVuY2VJZDogUmVhZG9ubHlNYXA8c3RyaW5nLCByZWFkb25seSBHZW5lcmF0ZWRUcmFwQ2FuZGlkYXRlW10+LFxyXG4pOiBHZW5lcmF0ZWRUcmFwQ2FuZGlkYXRlW10ge1xyXG4gIHJldHVybiBzZW50ZW5jZXMuZmxhdE1hcCgoc2VudGVuY2UpID0+IFsuLi4oYnlTZW50ZW5jZUlkLmdldChzZW50ZW5jZS5pZCkgPz8gW10pXSk7XHJcbn1cclxuIiwiLyoqXHJcbiAqIEJhY2tncm91bmQgc2VydmljZSB3b3JrZXIuXHJcbiAqXHJcbiAqIE93bnM6IHBvcHVwIHJlcXVlc3RzLCB0YWIgdmFsaWRhdGlvbiwgdGhlIHNpbmdsZSBhY3RpdmUgc2Vzc2lvbiwgcnVudGltZVxyXG4gKiBpbmplY3Rpb24gb2YgdGhlIEVjbGlwc2UgY29udGVudCBzY3JpcHQsIHRoZSBvcHRpb25hbCBwcm92aWRlciBwZXJtaXNzaW9uIGFuZFxyXG4gKiBuZXR3b3JrIGNhbGwsIGFuZCBzZXNzaW9uIHJlcGxhY2VtZW50IGFjcm9zcyB0YWJzLlxyXG4gKlxyXG4gKiBEb2VzIE5PVCBvd246IGFuc3dlciBvdXRjb21lcy4gVGhvc2UgaGF2ZSBleGFjdGx5IG9uZSB3cml0ZXIsIHRoZSBjb250ZW50XHJcbiAqIHNjcmlwdCwgd2hpY2ggaXMgd2hhdCByZW1vdmVzIHRoZSBwb3B1cC9iYWNrZ3JvdW5kL2NvbnRlbnQgcmFjZSBlbnRpcmVseS5cclxuICovXHJcblxyXG5pbXBvcnQgeyBicm93c2VyLCB0eXBlIEJyb3dzZXIgfSBmcm9tICd3eHQvYnJvd3Nlcic7XHJcbmltcG9ydCB7IGNyZWF0ZVNlc3Npb25JZCB9IGZyb20gJy4uL2RvbWFpbi9pZHMnO1xyXG5pbXBvcnQgeyBmYWlsdXJlLCBzdWNjZXNzLCB0eXBlIFJlc3VsdCB9IGZyb20gJy4uL2RvbWFpbi9lcnJvcnMnO1xyXG5pbXBvcnQge1xyXG4gIHBhcnNlTWVzc2FnZSxcclxuICB0eXBlIEFjdGl2YXRlZERhdGEsXHJcbiAgdHlwZSBEZWFjdGl2YXRlZERhdGEsXHJcbiAgdHlwZSBFY2xpcHNlTWVzc2FnZSxcclxuICB0eXBlIEdlbmVyYXRlVHJhcHNEYXRhLFxyXG4gIHR5cGUgUG9uZ0RhdGEsXHJcbiAgdHlwZSBSZXNldFByb2ZpbGVEYXRhLFxyXG4gIHR5cGUgU2F2ZUNhbGlicmF0aW9uRGF0YSxcclxuICB0eXBlIFNldFByb3ZpZGVyRGF0YSxcclxuICB0eXBlIFNlc3Npb25TdGFydGVkRGF0YSxcclxuICB0eXBlIFNlc3Npb25TdG9wcGVkRGF0YSxcclxuICB0eXBlIFN0YXR1c0RhdGEsXHJcbn0gZnJvbSAnLi4vZG9tYWluL21lc3NhZ2VzJztcclxuaW1wb3J0IHsgY2xhc3NpZnlVcmwgfSBmcm9tICcuLi9kb21haW4vdXJsLXN1cHBvcnQnO1xyXG5pbXBvcnQgeyBzdW1tYXJpemVNYXN0ZXJ5IH0gZnJvbSAnLi4vZG9tYWluL3Byb2ZpbGUnO1xyXG5pbXBvcnQgeyBjaHJvbWVBcmVhIH0gZnJvbSAnLi4vc3RvcmFnZS9hcmVhJztcclxuaW1wb3J0IHsgbG9hZFByb2ZpbGUsIHJlc2V0UHJvZmlsZSwgc2F2ZVByb2ZpbGUgfSBmcm9tICcuLi9zdG9yYWdlL3Byb2ZpbGUtc3RvcmUnO1xyXG5pbXBvcnQge1xyXG4gIGNsZWFyQWN0aXZlU2Vzc2lvbixcclxuICBpc0dlbmVyYXRpb25BdXRob3JpemVkLFxyXG4gIHJlYWRBY3RpdmVTZXNzaW9uLFxyXG4gIHdyaXRlQWN0aXZlU2Vzc2lvbixcclxufSBmcm9tICcuLi9zdG9yYWdlL3Nlc3Npb24tc3RvcmUnO1xyXG5pbXBvcnQge1xyXG4gIFBST1ZJREVSX09SSUdJTixcclxuICBQUk9WSURFUl9QRVJNSVNTSU9OX1BBVFRFUk4sXHJcbiAgY2xlYXJQcm92aWRlclNldHRpbmdzLFxyXG4gIHJlYWRQcm92aWRlclNldHRpbmdzLFxyXG4gIHdyaXRlUHJvdmlkZXJTZXR0aW5ncyxcclxufSBmcm9tICcuLi9zdG9yYWdlL3Byb3ZpZGVyLXNldHRpbmdzJztcclxuaW1wb3J0IHsgZ2VuZXJhdGVXaXRoQ2FjaGUgfSBmcm9tICcuLi9wcm92aWRlci9nZW5lcmF0ZS13aXRoLWNhY2hlJztcclxuaW1wb3J0IHsgY2hlY2tQcm92aWRlckhlYWx0aCB9IGZyb20gJy4uL3Byb3ZpZGVyL2NsaWVudCc7XHJcbmltcG9ydCB7IGNsZWFyUHJvdmlkZXJDYWNoZSB9IGZyb20gJy4uL3N0b3JhZ2UvcHJvdmlkZXItY2FjaGUnO1xyXG5cclxuLyoqIEJ1aWx0IGJ1bmRsZSBwYXRoIG9mIHRoZSBydW50aW1lLWluamVjdGVkIGNvbnRlbnQgc2NyaXB0LiAqL1xyXG5jb25zdCBDT05URU5UX1NDUklQVF9GSUxFID0gJy9jb250ZW50LXNjcmlwdHMvZWNsaXBzZS5qcycgYXMgY29uc3Q7XHJcblxyXG4vKipcclxuICogVGhlIG9wdGlvbmFsIHByb3ZpZGVyIGlzIG9ubHkgZXZlciBvZmZlcmVkIHdoZW4gYSBzZXJ2ZXIgb3JpZ2luIHdhcyBjb21waWxlZFxyXG4gKiBpbi4gVGhlcmUgaXMgbm8gZmllbGQgYW55d2hlcmUgaW4gdGhlIFVJIHRoYXQgbGV0cyBhIHBhZ2Ugb3IgYSB1c2VyIHBvaW50XHJcbiAqIEVjbGlwc2UgYXQgYW4gYXJiaXRyYXJ5IGhvc3QuXHJcbiAqL1xyXG5jb25zdCBQUk9WSURFUl9DT05GSUdVUkVEID0gUFJPVklERVJfT1JJR0lOLmxlbmd0aCA+IDA7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVCYWNrZ3JvdW5kKCgpID0+IHtcclxuICBjb25zdCBsb2NhbCA9IGNocm9tZUFyZWEoYnJvd3Nlci5zdG9yYWdlLmxvY2FsKTtcclxuICBjb25zdCBzZXNzaW9uID0gY2hyb21lQXJlYShicm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbik7XHJcblxyXG4gIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKHJhdywgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICAgIGNvbnN0IG1lc3NhZ2UgPSBwYXJzZU1lc3NhZ2UocmF3KTtcclxuICAgIGlmICghbWVzc2FnZSkge1xyXG4gICAgICBzZW5kUmVzcG9uc2UoZmFpbHVyZSgnVU5LTk9XTl9FUlJPUicsICdVbnJlY29nbmlzZWQgbWVzc2FnZS4nKSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVNZXNzYWdlKG1lc3NhZ2UsIHNlbmRlcilcclxuICAgICAgLnRoZW4oc2VuZFJlc3BvbnNlKVxyXG4gICAgICAuY2F0Y2goKGNhdXNlOiB1bmtub3duKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZGV0YWlsID0gY2F1c2UgaW5zdGFuY2VvZiBFcnJvciA/IGNhdXNlLm1lc3NhZ2UgOiAnQmFja2dyb3VuZCBoYW5kbGVyIGZhaWxlZC4nO1xyXG4gICAgICAgIHNlbmRSZXNwb25zZShmYWlsdXJlKCdVTktOT1dOX0VSUk9SJywgZGV0YWlsKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIC8vIEtlZXAgdGhlIG1lc3NhZ2UgY2hhbm5lbCBvcGVuIGZvciB0aGUgYXN5bmMgcmVwbHkuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9KTtcclxuXHJcbiAgLy8gQSBjbG9zZWQgdGFiIG11c3Qgbm90IGxlYXZlIGEgc2Vzc2lvbiBwaW5uZWQuXHJcbiAgYnJvd3Nlci50YWJzLm9uUmVtb3ZlZC5hZGRMaXN0ZW5lcigodGFiSWQpID0+IHtcclxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgYWN0aXZlID0gYXdhaXQgcmVhZEFjdGl2ZVNlc3Npb24oc2Vzc2lvbik7XHJcbiAgICAgIGlmIChhY3RpdmU/LnRhYklkID09PSB0YWJJZCkgYXdhaXQgY2xlYXJBY3RpdmVTZXNzaW9uKHNlc3Npb24pO1xyXG4gICAgfSkoKTtcclxuICB9KTtcclxuXHJcbiAgLy8gTmF2aWdhdGluZyBhd2F5IHRlYXJzIHRoZSBydW50aW1lIGRvd24gd2l0aCB0aGUgZG9jdW1lbnQ7IGRyb3AgdGhlIHJlY29yZC5cclxuICBicm93c2VyLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKCh0YWJJZCwgY2hhbmdlSW5mbykgPT4ge1xyXG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzICE9PSAnbG9hZGluZycpIHJldHVybjtcclxuICAgIHZvaWQgKGFzeW5jICgpID0+IHtcclxuICAgICAgY29uc3QgYWN0aXZlID0gYXdhaXQgcmVhZEFjdGl2ZVNlc3Npb24oc2Vzc2lvbik7XHJcbiAgICAgIGlmIChhY3RpdmU/LnRhYklkID09PSB0YWJJZCkgYXdhaXQgY2xlYXJBY3RpdmVTZXNzaW9uKHNlc3Npb24pO1xyXG4gICAgfSkoKTtcclxuICB9KTtcclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShcclxuICAgIG1lc3NhZ2U6IEVjbGlwc2VNZXNzYWdlLFxyXG4gICAgc2VuZGVyOiBCcm93c2VyLnJ1bnRpbWUuTWVzc2FnZVNlbmRlcixcclxuICApOiBQcm9taXNlPHVua25vd24+IHtcclxuICAgIHN3aXRjaCAobWVzc2FnZS50eXBlKSB7XHJcbiAgICAgIGNhc2UgJ1NUQVJUX1NFU1NJT04nOlxyXG4gICAgICAgIHJldHVybiBzdGFydFNlc3Npb24oKTtcclxuICAgICAgY2FzZSAnU1RPUF9TRVNTSU9OJzpcclxuICAgICAgICByZXR1cm4gc3RvcFNlc3Npb24oKTtcclxuICAgICAgY2FzZSAnR0VUX1NUQVRVUyc6XHJcbiAgICAgICAgcmV0dXJuIGdldFN0YXR1cygpO1xyXG4gICAgICBjYXNlICdSRVNFVF9QUk9GSUxFJzpcclxuICAgICAgICByZXR1cm4gZG9SZXNldFByb2ZpbGUobWVzc2FnZS5jb25maXJtZWQpO1xyXG4gICAgICBjYXNlICdTQVZFX0NBTElCUkFUSU9OJzpcclxuICAgICAgICByZXR1cm4gZG9TYXZlQ2FsaWJyYXRpb24obWVzc2FnZS5nbG9iYWxBYmlsaXR5KTtcclxuICAgICAgY2FzZSAnU0VUX1BST1ZJREVSJzpcclxuICAgICAgICByZXR1cm4gZG9TZXRQcm92aWRlcihtZXNzYWdlLmVuYWJsZWQpO1xyXG4gICAgICBjYXNlICdHRU5FUkFURV9UUkFQUyc6XHJcbiAgICAgICAgcmV0dXJuIGRvR2VuZXJhdGVUcmFwcyhtZXNzYWdlLnNlc3Npb25JZCwgbWVzc2FnZS5zZW50ZW5jZXMsIHNlbmRlcik7XHJcbiAgICAgIC8vIFBJTkcgLyBBQ1RJVkFURSAvIERFQUNUSVZBVEUgYXJlIGFkZHJlc3NlZCB0byB0aGUgY29udGVudCBzY3JpcHQuIFRoZVxyXG4gICAgICAvLyB3b3JrZXIgbmV2ZXIgYW5zd2VycyB0aGVtLlxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiBmYWlsdXJlKCdVTktOT1dOX0VSUk9SJywgYFRoZSBiYWNrZ3JvdW5kIHdvcmtlciBkb2VzIG5vdCBoYW5kbGUgJHttZXNzYWdlLnR5cGV9LmApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIFNlc3Npb25zXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBzdGFydFNlc3Npb24oKTogUHJvbWlzZTxSZXN1bHQ8U2Vzc2lvblN0YXJ0ZWREYXRhPj4ge1xyXG4gICAgY29uc3QgdGFiID0gYXdhaXQgYWN0aXZlVGFiKCk7XHJcbiAgICBpZiAoIXRhYiB8fCB0eXBlb2YgdGFiLmlkICE9PSAnbnVtYmVyJykge1xyXG4gICAgICByZXR1cm4gZmFpbHVyZSgnVU5TVVBQT1JURURfVVJMJywgJ05vIGFjdGl2ZSB0YWIgdG8gcnVuIEVjbGlwc2UgaW4uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3VwcG9ydCA9IGNsYXNzaWZ5VXJsKHRhYi51cmwpO1xyXG4gICAgaWYgKCFzdXBwb3J0LnN1cHBvcnRlZCkge1xyXG4gICAgICByZXR1cm4gZmFpbHVyZSgnVU5TVVBQT1JURURfVVJMJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdGFiSWQgPSB0YWIuaWQ7XHJcblxyXG4gICAgLy8gT25lIHNlc3Npb24gYXQgYSB0aW1lLiBSZXBsYWNpbmcgbWVhbnMgdGVhcmluZyB0aGUgb2xkIG9uZSBkb3duIGZpcnN0O1xyXG4gICAgLy8gaWYgdGhhdCB0YWIgaGFzIGdvbmUgYXdheSwgdGhlIHN0YWxlIHJlY29yZCBpcyBzaW1wbHkgY2xlYXJlZC5cclxuICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgcmVhZEFjdGl2ZVNlc3Npb24oc2Vzc2lvbik7XHJcbiAgICBpZiAoZXhpc3RpbmcgJiYgZXhpc3RpbmcudGFiSWQgIT09IHRhYklkKSB7XHJcbiAgICAgIGF3YWl0IHNlbmRUb1RhYihleGlzdGluZy50YWJJZCwgeyB0eXBlOiAnREVBQ1RJVkFURScsIHJlYXNvbjogJ3JlcGxhY2VkJyB9KTtcclxuICAgICAgYXdhaXQgY2xlYXJBY3RpdmVTZXNzaW9uKHNlc3Npb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlYWR5ID0gYXdhaXQgZW5zdXJlUnVudGltZSh0YWJJZCk7XHJcbiAgICBpZiAoIXJlYWR5Lm9rKSByZXR1cm4gcmVhZHk7XHJcblxyXG4gICAgY29uc3QgcHJvdmlkZXJTZXR0aW5ncyA9IGF3YWl0IHJlYWRQcm92aWRlclNldHRpbmdzKGxvY2FsKTtcclxuICAgIGNvbnN0IHNlc3Npb25JZCA9IGNyZWF0ZVNlc3Npb25JZCgpO1xyXG5cclxuICAgIC8vIFRoZSBjb250ZW50IHJ1bnRpbWUgbWF5IG5lZWQgZ2VuZXJhdGlvbiB0byBmaW5pc2ggQUNUSVZBVEUuIFBlcnNpc3QgdGhlXHJcbiAgICAvLyBleGFjdCBwZW5kaW5nIG93bmVyIGZpcnN0IHNvIHRoYXQgcmVxdWVzdCBpcyBhdXRob3JpemVkLCB0aGVuIHByb21vdGUgaXRcclxuICAgIC8vIG9ubHkgYWZ0ZXIgYWN0aXZhdGlvbiBzdWNjZWVkcy5cclxuICAgIGNvbnN0IHBlbmRpbmcgPSBhd2FpdCB3cml0ZUFjdGl2ZVNlc3Npb24oc2Vzc2lvbiwge1xyXG4gICAgICBzZXNzaW9uSWQsXHJcbiAgICAgIHRhYklkLFxyXG4gICAgICBzdGFydGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgICAgcGhhc2U6ICdwZW5kaW5nJyxcclxuICAgIH0pO1xyXG4gICAgaWYgKCFwZW5kaW5nLm9rKSByZXR1cm4gcGVuZGluZztcclxuXHJcbiAgICBjb25zdCBhY3RpdmF0ZWQgPSBhd2FpdCBzZW5kVG9UYWI8QWN0aXZhdGVkRGF0YT4odGFiSWQsIHtcclxuICAgICAgdHlwZTogJ0FDVElWQVRFJyxcclxuICAgICAgc2Vzc2lvbklkLFxyXG4gICAgICBwcm92aWRlckVuYWJsZWQ6IHByb3ZpZGVyU2V0dGluZ3MuZW5hYmxlZCxcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghYWN0aXZhdGVkLm9rKSB7XHJcbiAgICAgIGF3YWl0IGNsZWFyU2Vzc2lvbklmTWF0Y2hlcyhzZXNzaW9uSWQpO1xyXG4gICAgICByZXR1cm4gYWN0aXZhdGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHByb21vdGVkID0gYXdhaXQgd3JpdGVBY3RpdmVTZXNzaW9uKHNlc3Npb24sIHtcclxuICAgICAgc2Vzc2lvbklkLFxyXG4gICAgICB0YWJJZCxcclxuICAgICAgc3RhcnRlZEF0OiBwZW5kaW5nLmRhdGEuc3RhcnRlZEF0LFxyXG4gICAgICBwaGFzZTogJ2FjdGl2ZScsXHJcbiAgICB9KTtcclxuICAgIGlmICghcHJvbW90ZWQub2spIHtcclxuICAgICAgYXdhaXQgc2VuZFRvVGFiKHRhYklkLCB7IHR5cGU6ICdERUFDVElWQVRFJywgc2Vzc2lvbklkLCByZWFzb246ICdyZXNldCcgfSk7XHJcbiAgICAgIGF3YWl0IGNsZWFyU2Vzc2lvbklmTWF0Y2hlcyhzZXNzaW9uSWQpO1xyXG4gICAgICByZXR1cm4gcHJvbW90ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHN1Y2Nlc3MoeyBzZXNzaW9uSWQsIHRhYklkLCB0cmFwQ291bnQ6IGFjdGl2YXRlZC5kYXRhLnRyYXBDb3VudCB9KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIHN0b3BTZXNzaW9uKCk6IFByb21pc2U8UmVzdWx0PFNlc3Npb25TdG9wcGVkRGF0YT4+IHtcclxuICAgIGNvbnN0IGFjdGl2ZSA9IGF3YWl0IHJlYWRBY3RpdmVTZXNzaW9uKHNlc3Npb24pO1xyXG4gICAgaWYgKCFhY3RpdmUpIHJldHVybiBzdWNjZXNzKHsgcmVzdG9yZWQ6IGZhbHNlIH0pO1xyXG5cclxuICAgIGNvbnN0IHN0b3BwZWQgPSBhd2FpdCBzZW5kVG9UYWI8RGVhY3RpdmF0ZWREYXRhPihhY3RpdmUudGFiSWQsIHtcclxuICAgICAgdHlwZTogJ0RFQUNUSVZBVEUnLFxyXG4gICAgICBzZXNzaW9uSWQ6IGFjdGl2ZS5zZXNzaW9uSWQsXHJcbiAgICAgIHJlYXNvbjogJ3VzZXInLFxyXG4gICAgfSk7XHJcblxyXG4gICAgYXdhaXQgY2xlYXJBY3RpdmVTZXNzaW9uKHNlc3Npb24pO1xyXG5cclxuICAgIGlmICghc3RvcHBlZC5vaykge1xyXG4gICAgICAvLyBUaGUgdGFiIGlzIGdvbmUgb3IgdGhlIHJ1bnRpbWUgbmV2ZXIgYXR0YWNoZWQuIFRoZSBzZXNzaW9uIHJlY29yZCBpc1xyXG4gICAgICAvLyBjbGVhcmVkIGVpdGhlciB3YXksIHNvIHRoZSBwb3B1cCByZXR1cm5zIHRvIFJlYWR5IHJhdGhlciB0aGFuIHN0aWNraW5nLlxyXG4gICAgICByZXR1cm4gc3VjY2Vzcyh7IHJlc3RvcmVkOiBmYWxzZSB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBzdWNjZXNzKHsgcmVzdG9yZWQ6IHN0b3BwZWQuZGF0YS5yZXN0b3JlZCB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBJTkcgZmlyc3QsIGluamVjdCBvbmx5IGlmIG5vYm9keSBhbnN3ZXJzLiBUaGlzIGlzIHdoYXQga2VlcHMgcmVwZWF0ZWRcclxuICAgKiBhY3RpdmF0aW9uIGZyb20gc3RhY2tpbmcgcnVudGltZXMgaW4gb25lIHRhYi5cclxuICAgKi9cclxuICBhc3luYyBmdW5jdGlvbiBlbnN1cmVSdW50aW1lKHRhYklkOiBudW1iZXIpOiBQcm9taXNlPFJlc3VsdDxQb25nRGF0YT4+IHtcclxuICAgIGNvbnN0IHBvbmcgPSBhd2FpdCBzZW5kVG9UYWI8UG9uZ0RhdGE+KHRhYklkLCB7IHR5cGU6ICdQSU5HJyB9KTtcclxuICAgIGlmIChwb25nLm9rKSByZXR1cm4gcG9uZztcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBicm93c2VyLnNjcmlwdGluZy5leGVjdXRlU2NyaXB0KHtcclxuICAgICAgICB0YXJnZXQ6IHsgdGFiSWQgfSxcclxuICAgICAgICBmaWxlczogW0NPTlRFTlRfU0NSSVBUX0ZJTEVdLFxyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGNhdXNlKSB7XHJcbiAgICAgIGNvbnN0IGRldGFpbCA9IGNhdXNlIGluc3RhbmNlb2YgRXJyb3IgPyBjYXVzZS5tZXNzYWdlIDogJ2luamVjdGlvbiBmYWlsZWQnO1xyXG4gICAgICByZXR1cm4gZmFpbHVyZSgnQ09OVEVOVF9TQ1JJUFRfVU5BVkFJTEFCTEUnLCBkZXRhaWwpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJldHJ5ID0gYXdhaXQgc2VuZFRvVGFiPFBvbmdEYXRhPih0YWJJZCwgeyB0eXBlOiAnUElORycgfSk7XHJcbiAgICBpZiAoIXJldHJ5Lm9rKSByZXR1cm4gZmFpbHVyZSgnQ09OVEVOVF9TQ1JJUFRfVU5BVkFJTEFCTEUnKTtcclxuICAgIHJldHVybiByZXRyeTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBTdGF0dXNcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGdldFN0YXR1cygpOiBQcm9taXNlPFJlc3VsdDxTdGF0dXNEYXRhPj4ge1xyXG4gICAgY29uc3QgdGFiID0gYXdhaXQgYWN0aXZlVGFiKCk7XHJcbiAgICBjb25zdCBwYWdlID0gY2xhc3NpZnlVcmwodGFiPy51cmwpO1xyXG4gICAgY29uc3QgYWN0aXZlID0gYXdhaXQgcmVhZEFjdGl2ZVNlc3Npb24oc2Vzc2lvbik7XHJcbiAgICBjb25zdCBwcm92aWRlclNldHRpbmdzID0gYXdhaXQgcmVhZFByb3ZpZGVyU2V0dGluZ3MobG9jYWwpO1xyXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcclxuXHJcbiAgICBjb25zdCBsb2FkZWQgPSBhd2FpdCBsb2FkUHJvZmlsZShsb2NhbCk7XHJcbiAgICBpZiAoIWxvYWRlZC5vaykge1xyXG4gICAgICByZXR1cm4gc3VjY2Vzcyh7XHJcbiAgICAgICAgYWN0aXZlVGFiSWQ6IGFjdGl2ZT8udGFiSWQgPz8gbnVsbCxcclxuICAgICAgICBhY3RpdmVTZXNzaW9uSWQ6IGFjdGl2ZT8uc2Vzc2lvbklkID8/IG51bGwsXHJcbiAgICAgICAgYWN0aXZlSGVyZTogYWN0aXZlPy50YWJJZCA9PT0gdGFiPy5pZCxcclxuICAgICAgICBwYWdlLFxyXG4gICAgICAgIGNhbGlicmF0aW9uQ29tcGxldGVkOiBmYWxzZSxcclxuICAgICAgICBnbG9iYWxBYmlsaXR5OiAwLFxyXG4gICAgICAgIHBoYXNlOiAnbmV3X21vb24nLFxyXG4gICAgICAgIHN1bW1hcnk6IHtcclxuICAgICAgICAgIHRyYWNrZWQ6IDAsXHJcbiAgICAgICAgICBhdHRlbXB0czogMCxcclxuICAgICAgICAgIGNvcnJlY3Q6IDAsXHJcbiAgICAgICAgICBkdWU6IDAsXHJcbiAgICAgICAgICBieVBoYXNlOiB7IG5ld19tb29uOiAwLCBjcmVzY2VudDogMCwgaGFsZjogMCwgZnVsbDogMCB9LFxyXG4gICAgICAgICAgb3ZlcmFsbFBoYXNlOiAnbmV3X21vb24nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJvdmlkZXI6IHtcclxuICAgICAgICAgIGNvbmZpZ3VyZWQ6IFBST1ZJREVSX0NPTkZJR1VSRUQsXHJcbiAgICAgICAgICBlbmFibGVkOiBwcm92aWRlclNldHRpbmdzLmVuYWJsZWQsXHJcbiAgICAgICAgICBwZXJtaXNzaW9uR3JhbnRlZDogYXdhaXQgaGFzUHJvdmlkZXJQZXJtaXNzaW9uKCksXHJcbiAgICAgICAgICBsYXN0RXJyb3I6IHByb3ZpZGVyU2V0dGluZ3MubGFzdEVycm9yLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcHJvZmlsZUVycm9yOiBsb2FkZWQuZXJyb3IubWVzc2FnZSxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcHJvZmlsZSA9IGxvYWRlZC5kYXRhLnByb2ZpbGU7XHJcbiAgICBjb25zdCBzdW1tYXJ5ID0gc3VtbWFyaXplTWFzdGVyeShwcm9maWxlLCBub3cpO1xyXG5cclxuICAgIHJldHVybiBzdWNjZXNzKHtcclxuICAgICAgYWN0aXZlVGFiSWQ6IGFjdGl2ZT8udGFiSWQgPz8gbnVsbCxcclxuICAgICAgYWN0aXZlU2Vzc2lvbklkOiBhY3RpdmU/LnNlc3Npb25JZCA/PyBudWxsLFxyXG4gICAgICBhY3RpdmVIZXJlOiBhY3RpdmUgIT09IG51bGwgJiYgYWN0aXZlLnRhYklkID09PSB0YWI/LmlkLFxyXG4gICAgICBwYWdlLFxyXG4gICAgICBjYWxpYnJhdGlvbkNvbXBsZXRlZDogcHJvZmlsZS5jYWxpYnJhdGlvbkNvbXBsZXRlZCxcclxuICAgICAgZ2xvYmFsQWJpbGl0eTogcHJvZmlsZS5nbG9iYWxBYmlsaXR5LFxyXG4gICAgICBwaGFzZTogc3VtbWFyeS5vdmVyYWxsUGhhc2UsXHJcbiAgICAgIHN1bW1hcnksXHJcbiAgICAgIHByb3ZpZGVyOiB7XHJcbiAgICAgICAgY29uZmlndXJlZDogUFJPVklERVJfQ09ORklHVVJFRCxcclxuICAgICAgICBlbmFibGVkOiBwcm92aWRlclNldHRpbmdzLmVuYWJsZWQsXHJcbiAgICAgICAgcGVybWlzc2lvbkdyYW50ZWQ6IGF3YWl0IGhhc1Byb3ZpZGVyUGVybWlzc2lvbigpLFxyXG4gICAgICAgIGxhc3RFcnJvcjogcHJvdmlkZXJTZXR0aW5ncy5sYXN0RXJyb3IsXHJcbiAgICAgIH0sXHJcbiAgICAgIHByb2ZpbGVFcnJvcjogbnVsbCxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIFByb2ZpbGUgY29tbWFuZHMgZnJvbSB0aGUgcG9wdXBcclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGRvUmVzZXRQcm9maWxlKGNvbmZpcm1lZDogYm9vbGVhbik6IFByb21pc2U8UmVzdWx0PFJlc2V0UHJvZmlsZURhdGE+PiB7XHJcbiAgICBpZiAoIWNvbmZpcm1lZCkge1xyXG4gICAgICByZXR1cm4gZmFpbHVyZSgnVU5LTk9XTl9FUlJPUicsICdSZXNldCByZXF1aXJlcyBjb25maXJtYXRpb24uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYWN0aXZlID0gYXdhaXQgcmVhZEFjdGl2ZVNlc3Npb24oc2Vzc2lvbik7XHJcbiAgICBpZiAoYWN0aXZlKSB7XHJcbiAgICAgIGF3YWl0IHNlbmRUb1RhYihhY3RpdmUudGFiSWQsIHsgdHlwZTogJ0RFQUNUSVZBVEUnLCByZWFzb246ICdyZXNldCcgfSk7XHJcbiAgICAgIGF3YWl0IGNsZWFyQWN0aXZlU2Vzc2lvbihzZXNzaW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZXNldCA9IGF3YWl0IHJlc2V0UHJvZmlsZShsb2NhbCk7XHJcbiAgICBpZiAoIXJlc2V0Lm9rKSByZXR1cm4gcmVzZXQ7XHJcblxyXG4gICAgY29uc3QgY2FjaGVSZXNldCA9IGF3YWl0IGNsZWFyUHJvdmlkZXJDYWNoZShsb2NhbCk7XHJcbiAgICBpZiAoIWNhY2hlUmVzZXQub2spIHJldHVybiBjYWNoZVJlc2V0O1xyXG5cclxuICAgIGNvbnN0IHNldHRpbmdzUmVzZXQgPSBhd2FpdCBjbGVhclByb3ZpZGVyU2V0dGluZ3MobG9jYWwpO1xyXG4gICAgaWYgKCFzZXR0aW5nc1Jlc2V0Lm9rKSByZXR1cm4gc2V0dGluZ3NSZXNldDtcclxuICAgIGlmICghKGF3YWl0IHJldm9rZVByb3ZpZGVyUGVybWlzc2lvbigpKSkgcmV0dXJuIGZhaWx1cmUoJ1BST1ZJREVSX1BFUk1JU1NJT05fREVOSUVEJyk7XHJcbiAgICByZXR1cm4gc3VjY2Vzcyh7IHJlc2V0OiB0cnVlIH0pO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gZG9TYXZlQ2FsaWJyYXRpb24oZ2xvYmFsQWJpbGl0eTogbnVtYmVyKTogUHJvbWlzZTxSZXN1bHQ8U2F2ZUNhbGlicmF0aW9uRGF0YT4+IHtcclxuICAgIGNvbnN0IGxvYWRlZCA9IGF3YWl0IGxvYWRQcm9maWxlKGxvY2FsKTtcclxuICAgIGlmICghbG9hZGVkLm9rKSByZXR1cm4gbG9hZGVkO1xyXG5cclxuICAgIGNvbnN0IHNhdmVkID0gYXdhaXQgc2F2ZVByb2ZpbGUobG9jYWwsIHtcclxuICAgICAgLi4ubG9hZGVkLmRhdGEucHJvZmlsZSxcclxuICAgICAgY2FsaWJyYXRpb25Db21wbGV0ZWQ6IHRydWUsXHJcbiAgICAgIGdsb2JhbEFiaWxpdHksXHJcbiAgICB9KTtcclxuICAgIGlmICghc2F2ZWQub2spIHJldHVybiBzYXZlZDtcclxuICAgIHJldHVybiBzdWNjZXNzKHsgZ2xvYmFsQWJpbGl0eSB9KTtcclxuICB9XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBPcHRpb25hbCBwcm92aWRlclxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLyoqXHJcbiAgICogUGVyc2lzdCB0aGUgb3B0aW9uYWwtcHJvdmlkZXIgdG9nZ2xlLlxyXG4gICAqXHJcbiAgICogVGhlIHBlcm1pc3Npb24gcHJvbXB0IGl0c2VsZiBiZWxvbmdzIHRvIHRoZSBwb3B1cCDigJQgYHBlcm1pc3Npb25zLnJlcXVlc3RgXHJcbiAgICogbmVlZHMgYSB1c2VyIGdlc3R1cmUg4oCUIHNvIGJ5IHRoZSB0aW1lIHRoaXMgcnVucyB0aGUgZ3JhbnQgaGFzIGVpdGhlclxyXG4gICAqIGhhcHBlbmVkIG9yIGJlZW4gcmVmdXNlZC4gRW5hYmxpbmcgd2l0aG91dCB0aGUgZ3JhbnQgaXMgcmVmdXNlZCBoZXJlIHJhdGhlclxyXG4gICAqIHRoYW4gc3RvcmVkIGFuZCBkaXNjb3ZlcmVkIGxhdGVyLlxyXG4gICAqL1xyXG4gIGFzeW5jIGZ1bmN0aW9uIGRvU2V0UHJvdmlkZXIoZW5hYmxlZDogYm9vbGVhbik6IFByb21pc2U8UmVzdWx0PFNldFByb3ZpZGVyRGF0YT4+IHtcclxuICAgIGlmICghUFJPVklERVJfQ09ORklHVVJFRCkgcmV0dXJuIGZhaWx1cmUoJ1BST1ZJREVSX0RJU0FCTEVEJyk7XHJcblxyXG4gICAgY29uc3QgZ3JhbnRlZCA9IGF3YWl0IGhhc1Byb3ZpZGVyUGVybWlzc2lvbigpO1xyXG4gICAgaWYgKGVuYWJsZWQgJiYgIWdyYW50ZWQpIHtcclxuICAgICAgYXdhaXQgd3JpdGVQcm92aWRlclNldHRpbmdzKGxvY2FsLCB7XHJcbiAgICAgICAgZW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgbGFzdEVycm9yOiAnUGVybWlzc2lvbiBmb3IgdGhlIGxvY2FsIGdlbmVyYXRpb24gQVBJIHdhcyBub3QgZ3JhbnRlZC4nLFxyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGZhaWx1cmUoJ1BST1ZJREVSX1BFUk1JU1NJT05fREVOSUVEJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFlbmFibGVkICYmIGdyYW50ZWQgJiYgIShhd2FpdCByZXZva2VQcm92aWRlclBlcm1pc3Npb24oKSkpIHtcclxuICAgICAgcmV0dXJuIGZhaWx1cmUoXHJcbiAgICAgICAgJ1BST1ZJREVSX1BFUk1JU1NJT05fREVOSUVEJyxcclxuICAgICAgICAnVGhlIG9wdGlvbmFsIGxvY2FsLXNlcnZlciBwZXJtaXNzaW9uIGNvdWxkIG5vdCBiZSByZW1vdmVkLicsXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGVuYWJsZWQpIHtcclxuICAgICAgY29uc3QgaGVhbHRoID0gYXdhaXQgY2hlY2tQcm92aWRlckhlYWx0aCgpO1xyXG4gICAgICBpZiAoIWhlYWx0aC5vaykge1xyXG4gICAgICAgIGF3YWl0IHJldm9rZVByb3ZpZGVyUGVybWlzc2lvbigpO1xyXG4gICAgICAgIGF3YWl0IHdyaXRlUHJvdmlkZXJTZXR0aW5ncyhsb2NhbCwge1xyXG4gICAgICAgICAgZW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICBsYXN0RXJyb3I6IGhlYWx0aC5lcnJvci5tZXNzYWdlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBoZWFsdGg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB3cml0dGVuID0gYXdhaXQgd3JpdGVQcm92aWRlclNldHRpbmdzKGxvY2FsLCB7IGVuYWJsZWQsIGxhc3RFcnJvcjogbnVsbCB9KTtcclxuICAgIGlmICghd3JpdHRlbi5vaykgcmV0dXJuIHdyaXR0ZW47XHJcbiAgICByZXR1cm4gc3VjY2Vzcyh7IGVuYWJsZWQsIHBlcm1pc3Npb25HcmFudGVkOiBncmFudGVkIH0pO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gaGFzUHJvdmlkZXJQZXJtaXNzaW9uKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgaWYgKCFQUk9WSURFUl9DT05GSUdVUkVEKSByZXR1cm4gZmFsc2U7XHJcbiAgICB0cnkge1xyXG4gICAgICByZXR1cm4gYXdhaXQgYnJvd3Nlci5wZXJtaXNzaW9ucy5jb250YWlucyh7IG9yaWdpbnM6IFtQUk9WSURFUl9QRVJNSVNTSU9OX1BBVFRFUk5dIH0pO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIHJldm9rZVByb3ZpZGVyUGVybWlzc2lvbigpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIGlmICghUFJPVklERVJfQ09ORklHVVJFRCkgcmV0dXJuIHRydWU7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBUaGUgYXV0b21hdGVkIEUyRSBtYW5pZmVzdCBncmFudHMgdGhlIGxvb3BiYWNrIG9yaWdpbiBhcyBhIHJlcXVpcmVkLFxyXG4gICAgICAvLyBub24tcmVtb3ZhYmxlIHRlc3QgcGVybWlzc2lvbi4gVGhlIHByb2R1Y3Rpb24gbWFuaWZlc3QgbmV2ZXIgZG9lcy5cclxuICAgICAgaWYgKGJyb3dzZXIucnVudGltZS5nZXRNYW5pZmVzdCgpLmhvc3RfcGVybWlzc2lvbnM/LmluY2x1ZGVzKFBST1ZJREVSX1BFUk1JU1NJT05fUEFUVEVSTikpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIShhd2FpdCBoYXNQcm92aWRlclBlcm1pc3Npb24oKSkpIHJldHVybiB0cnVlO1xyXG4gICAgICByZXR1cm4gYXdhaXQgYnJvd3Nlci5wZXJtaXNzaW9ucy5yZW1vdmUoeyBvcmlnaW5zOiBbUFJPVklERVJfUEVSTUlTU0lPTl9QQVRURVJOXSB9KTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBkb0dlbmVyYXRlVHJhcHMoXHJcbiAgICBzZXNzaW9uSWQ6IHN0cmluZyxcclxuICAgIHNlbnRlbmNlczogeyBpZDogc3RyaW5nOyB0ZXh0OiBzdHJpbmcgfVtdLFxyXG4gICAgc2VuZGVyOiBCcm93c2VyLnJ1bnRpbWUuTWVzc2FnZVNlbmRlcixcclxuICApOiBQcm9taXNlPFJlc3VsdDxHZW5lcmF0ZVRyYXBzRGF0YT4+IHtcclxuICAgIC8vIE9ubHkgdGhlIGNvbnRlbnQgc2NyaXB0IG9mIHRoZSB0YWIgdGhhdCBvd25zIHRoZSBzZXNzaW9uIG1heSBhc2suXHJcbiAgICBjb25zdCBhY3RpdmUgPSBhd2FpdCByZWFkQWN0aXZlU2Vzc2lvbihzZXNzaW9uKTtcclxuICAgIGlmICghaXNHZW5lcmF0aW9uQXV0aG9yaXplZChhY3RpdmUsIHNlbmRlci50YWI/LmlkLCBzZXNzaW9uSWQpKSB7XHJcbiAgICAgIHJldHVybiBmYWlsdXJlKCdTRVNTSU9OX1JFUExBQ0VEJywgJ1RoaXMgdGFiIGRvZXMgbm90IG93biB0aGUgYWN0aXZlIEVjbGlwc2Ugc2Vzc2lvbi4nKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZXR0aW5ncyA9IGF3YWl0IHJlYWRQcm92aWRlclNldHRpbmdzKGxvY2FsKTtcclxuICAgIGlmICghc2V0dGluZ3MuZW5hYmxlZCkgcmV0dXJuIGZhaWx1cmUoJ1BST1ZJREVSX0RJU0FCTEVEJyk7XHJcblxyXG4gICAgaWYgKCEoYXdhaXQgaGFzUHJvdmlkZXJQZXJtaXNzaW9uKCkpKSB7XHJcbiAgICAgIGF3YWl0IHdyaXRlUHJvdmlkZXJTZXR0aW5ncyhsb2NhbCwge1xyXG4gICAgICAgIGVuYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgIGxhc3RFcnJvcjogJ1Blcm1pc3Npb24gZm9yIHRoZSBsb2NhbCBnZW5lcmF0aW9uIEFQSSBpcyBub3QgZ3JhbnRlZC4nLFxyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGZhaWx1cmUoJ1BST1ZJREVSX1BFUk1JU1NJT05fREVOSUVEJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZ2VuZXJhdGVXaXRoQ2FjaGUoc2VudGVuY2VzLCBsb2NhbCk7XHJcbiAgICBhd2FpdCB3cml0ZVByb3ZpZGVyU2V0dGluZ3MobG9jYWwsIHtcclxuICAgICAgZW5hYmxlZDogc2V0dGluZ3MuZW5hYmxlZCxcclxuICAgICAgbGFzdEVycm9yOiByZXN1bHQub2sgPyBudWxsIDogcmVzdWx0LmVycm9yLm1lc3NhZ2UsXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIXJlc3VsdC5vaykgcmV0dXJuIHJlc3VsdDtcclxuICAgIHJldHVybiBzdWNjZXNzKHsgY2FuZGlkYXRlczogcmVzdWx0LmRhdGEgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gSGVscGVyc1xyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gYWN0aXZlVGFiKCk6IFByb21pc2U8QnJvd3Nlci50YWJzLlRhYiB8IHVuZGVmaW5lZD4ge1xyXG4gICAgY29uc3QgW3RhYl0gPSBhd2FpdCBicm93c2VyLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSk7XHJcbiAgICByZXR1cm4gdGFiO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gY2xlYXJTZXNzaW9uSWZNYXRjaGVzKHNlc3Npb25JZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBjdXJyZW50ID0gYXdhaXQgcmVhZEFjdGl2ZVNlc3Npb24oc2Vzc2lvbik7XHJcbiAgICBpZiAoY3VycmVudD8uc2Vzc2lvbklkID09PSBzZXNzaW9uSWQpIGF3YWl0IGNsZWFyQWN0aXZlU2Vzc2lvbihzZXNzaW9uKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlbmQgdG8gYSB0YWIgYW5kIHR1cm4gXCJubyByZWNlaXZlclwiIGludG8gYSB0eXBlZCBmYWlsdXJlLiBgc2VuZE1lc3NhZ2VgXHJcbiAgICogcmVqZWN0cyB3aGVuIG5vdGhpbmcgaXMgbGlzdGVuaW5nLCB3aGljaCBpcyB0aGUgbm9ybWFsIGNhc2UgYmVmb3JlIHRoZVxyXG4gICAqIHJ1bnRpbWUgaXMgaW5qZWN0ZWQg4oCUIG5vdCBhbiBlcnJvciB3b3J0aCBsb2dnaW5nLlxyXG4gICAqL1xyXG4gIGFzeW5jIGZ1bmN0aW9uIHNlbmRUb1RhYjxUPih0YWJJZDogbnVtYmVyLCBtZXNzYWdlOiBFY2xpcHNlTWVzc2FnZSk6IFByb21pc2U8UmVzdWx0PFQ+PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZTogdW5rbm93biA9IGF3YWl0IGJyb3dzZXIudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgbWVzc2FnZSk7XHJcbiAgICAgIGlmIChyZXNwb25zZSAmJiB0eXBlb2YgcmVzcG9uc2UgPT09ICdvYmplY3QnICYmICdvaycgaW4gcmVzcG9uc2UpIHtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UgYXMgUmVzdWx0PFQ+O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWlsdXJlKCdDT05URU5UX1NDUklQVF9VTkFWQUlMQUJMRScsICdUaGUgRWNsaXBzZSBydW50aW1lIHJldHVybmVkIG5vdGhpbmcuJyk7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgcmV0dXJuIGZhaWx1cmUoJ0NPTlRFTlRfU0NSSVBUX1VOQVZBSUxBQkxFJyk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuIiwiLy8jcmVnaW9uIHNyYy9pbmRleC50c1xyXG4vKipcclxuKiBDbGFzcyBmb3IgcGFyc2luZyBhbmQgcGVyZm9ybWluZyBvcGVyYXRpb25zIG9uIG1hdGNoIHBhdHRlcm5zLlxyXG4qXHJcbiogQGV4YW1wbGVcclxuKiAgIGNvbnN0IHBhdHRlcm4gPSBuZXcgTWF0Y2hQYXR0ZXJuKCcqOi8vZ29vZ2xlLmNvbS8qJyk7XHJcbipcclxuKiAgIHBhdHRlcm4uaW5jbHVkZXMoJ2h0dHBzOi8vZ29vZ2xlLmNvbScpOyAvLyB0cnVlXHJcbiogICBwYXR0ZXJuLmluY2x1ZGVzKCdodHRwOi8veW91dHViZS5jb20vd2F0Y2g/dj0xMjMnKTsgLy8gZmFsc2VcclxuKi9cclxudmFyIE1hdGNoUGF0dGVybiA9IGNsYXNzIE1hdGNoUGF0dGVybiB7XHJcblx0c3RhdGljIHtcclxuXHRcdHRoaXMuUFJPVE9DT0xTID0gW1xyXG5cdFx0XHRcImh0dHBcIixcclxuXHRcdFx0XCJodHRwc1wiLFxyXG5cdFx0XHRcImZpbGVcIixcclxuXHRcdFx0XCJmdHBcIixcclxuXHRcdFx0XCJ1cm5cIixcclxuXHRcdFx0XCJ3c1wiLFxyXG5cdFx0XHRcIndzc1wiXHJcblx0XHRdO1xyXG5cdH1cclxuXHQvKipcclxuXHQqIFBhcnNlIGEgbWF0Y2ggcGF0dGVybiBzdHJpbmcuIElmIGl0IGlzIGludmFsaWQsIHRoZSBjb25zdHJ1Y3RvciB3aWxsIHRocm93IGFuXHJcblx0KiBgSW52YWxpZE1hdGNoUGF0dGVybmAgZXJyb3IuXHJcblx0KlxyXG5cdCogQHBhcmFtIG1hdGNoUGF0dGVybiBUaGUgbWF0Y2ggcGF0dGVybiB0byBwYXJzZS5cclxuXHQqL1xyXG5cdGNvbnN0cnVjdG9yKG1hdGNoUGF0dGVybikge1xyXG5cdFx0aWYgKG1hdGNoUGF0dGVybiA9PT0gXCI8YWxsX3VybHM+XCIpIHtcclxuXHRcdFx0dGhpcy5pc0FsbFVybHMgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLnByb3RvY29sTWF0Y2hlcyA9IFsuLi5NYXRjaFBhdHRlcm4uUFJPVE9DT0xTXTtcclxuXHRcdFx0dGhpcy5ob3N0bmFtZU1hdGNoID0gXCIqXCI7XHJcblx0XHRcdHRoaXMucGF0aG5hbWVNYXRjaCA9IFwiKlwiO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Y29uc3QgZ3JvdXBzID0gLyguKik6XFwvXFwvKC4qPykoXFwvLiopLy5leGVjKG1hdGNoUGF0dGVybik7XHJcblx0XHRcdGlmIChncm91cHMgPT0gbnVsbCkgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4obWF0Y2hQYXR0ZXJuLCBcIkluY29ycmVjdCBmb3JtYXRcIik7XHJcblx0XHRcdGNvbnN0IFtfLCBwcm90b2NvbCwgaG9zdG5hbWUsIHBhdGhuYW1lXSA9IGdyb3VwcztcclxuXHRcdFx0dmFsaWRhdGVQcm90b2NvbChtYXRjaFBhdHRlcm4sIHByb3RvY29sKTtcclxuXHRcdFx0dmFsaWRhdGVIb3N0bmFtZShtYXRjaFBhdHRlcm4sIGhvc3RuYW1lKTtcclxuXHRcdFx0dGhpcy5wcm90b2NvbE1hdGNoZXMgPSBwcm90b2NvbCA9PT0gXCIqXCIgPyBbXCJodHRwXCIsIFwiaHR0cHNcIl0gOiBbcHJvdG9jb2xdO1xyXG5cdFx0XHR0aGlzLmhvc3RuYW1lTWF0Y2ggPSBob3N0bmFtZTtcclxuXHRcdFx0dGhpcy5wYXRobmFtZU1hdGNoID0gcGF0aG5hbWU7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8qKiBDaGVjayBpZiBhIFVSTCBpcyBpbmNsdWRlZCBpbiBhIHBhdHRlcm4uICovXHJcblx0aW5jbHVkZXModXJsKSB7XHJcblx0XHRjb25zdCB1ID0gdHlwZW9mIHVybCA9PT0gXCJzdHJpbmdcIiA/IG5ldyBVUkwodXJsKSA6IHVybCBpbnN0YW5jZW9mIExvY2F0aW9uID8gbmV3IFVSTCh1cmwuaHJlZikgOiB1cmw7XHJcblx0XHRpZiAodGhpcy5pc0FsbFVybHMpIHJldHVybiAhdGhpcy5pc1Vua25vd25Qcm90b2NvbCh1KTtcclxuXHRcdHJldHVybiAhIXRoaXMucHJvdG9jb2xNYXRjaGVzLmZpbmQoKHByb3RvY29sKSA9PiB7XHJcblx0XHRcdGlmIChwcm90b2NvbCA9PT0gXCJodHRwXCIpIHJldHVybiB0aGlzLmlzSHR0cE1hdGNoKHUpO1xyXG5cdFx0XHRpZiAocHJvdG9jb2wgPT09IFwiaHR0cHNcIikgcmV0dXJuIHRoaXMuaXNIdHRwc01hdGNoKHUpO1xyXG5cdFx0XHRpZiAocHJvdG9jb2wgPT09IFwiZmlsZVwiKSByZXR1cm4gdGhpcy5pc0ZpbGVNYXRjaCh1KTtcclxuXHRcdFx0aWYgKHByb3RvY29sID09PSBcImZ0cFwiKSByZXR1cm4gdGhpcy5pc0Z0cE1hdGNoKHUpO1xyXG5cdFx0XHRpZiAocHJvdG9jb2wgPT09IFwidXJuXCIpIHJldHVybiB0aGlzLmlzVXJuTWF0Y2godSk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0aXNIdHRwTWF0Y2godXJsKSB7XHJcblx0XHRyZXR1cm4gdXJsLnByb3RvY29sID09PSBcImh0dHA6XCIgJiYgdGhpcy5pc0hvc3RQYXRoTWF0Y2godXJsKTtcclxuXHR9XHJcblx0aXNIdHRwc01hdGNoKHVybCkge1xyXG5cdFx0cmV0dXJuIHVybC5wcm90b2NvbCA9PT0gXCJodHRwczpcIiAmJiB0aGlzLmlzSG9zdFBhdGhNYXRjaCh1cmwpO1xyXG5cdH1cclxuXHRpc0hvc3RQYXRoTWF0Y2godXJsKSB7XHJcblx0XHRpZiAoIXRoaXMuaG9zdG5hbWVNYXRjaCB8fCAhdGhpcy5wYXRobmFtZU1hdGNoKSByZXR1cm4gZmFsc2U7XHJcblx0XHRjb25zdCBob3N0bmFtZU1hdGNoUmVnZXhzID0gW3RoaXMuY29udmVydFBhdHRlcm5Ub1JlZ2V4KHRoaXMuaG9zdG5hbWVNYXRjaCksIHRoaXMuY29udmVydFBhdHRlcm5Ub1JlZ2V4KHRoaXMuaG9zdG5hbWVNYXRjaC5yZXBsYWNlKC9eXFwqXFwuLywgXCJcIikpXTtcclxuXHRcdGNvbnN0IHBhdGhuYW1lTWF0Y2hSZWdleCA9IHRoaXMuY29udmVydFBhdHRlcm5Ub1JlZ2V4KHRoaXMucGF0aG5hbWVNYXRjaCk7XHJcblx0XHRyZXR1cm4gISFob3N0bmFtZU1hdGNoUmVnZXhzLmZpbmQoKHJlZ2V4KSA9PiByZWdleC50ZXN0KHVybC5ob3N0bmFtZSkpICYmIHBhdGhuYW1lTWF0Y2hSZWdleC50ZXN0KHVybC5wYXRobmFtZSk7XHJcblx0fVxyXG5cdGlzVW5rbm93blByb3RvY29sKHVybCkge1xyXG5cdFx0cmV0dXJuICF0aGlzLnByb3RvY29sTWF0Y2hlcy5pbmNsdWRlcyh1cmwucHJvdG9jb2wuc2xpY2UoMCwgLTEpKTtcclxuXHR9XHJcblx0aXNQYXRoTWF0Y2godXJsKSB7XHJcblx0XHRpZiAoIXRoaXMucGF0aG5hbWVNYXRjaCkgcmV0dXJuIGZhbHNlO1xyXG5cdFx0cmV0dXJuIHRoaXMuY29udmVydFBhdHRlcm5Ub1JlZ2V4KHRoaXMucGF0aG5hbWVNYXRjaCkudGVzdCh1cmwucGF0aG5hbWUpO1xyXG5cdH1cclxuXHRpc0ZpbGVNYXRjaCh1cmwpIHtcclxuXHRcdHJldHVybiB1cmwucHJvdG9jb2wgPT09IFwiZmlsZTpcIiAmJiB0aGlzLmlzUGF0aE1hdGNoKHVybCk7XHJcblx0fVxyXG5cdGlzRnRwTWF0Y2goX3VybCkge1xyXG5cdFx0dGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQ6IGZ0cDovLyBwYXR0ZXJuIG1hdGNoaW5nLiBPcGVuIGEgUFIgdG8gYWRkIHN1cHBvcnRcIik7XHJcblx0fVxyXG5cdGlzVXJuTWF0Y2goX3VybCkge1xyXG5cdFx0dGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQ6IHVybjovLyBwYXR0ZXJuIG1hdGNoaW5nLiBPcGVuIGEgUFIgdG8gYWRkIHN1cHBvcnRcIik7XHJcblx0fVxyXG5cdGNvbnZlcnRQYXR0ZXJuVG9SZWdleChwYXR0ZXJuKSB7XHJcblx0XHRjb25zdCBzdGFyc1JlcGxhY2VkID0gdGhpcy5lc2NhcGVGb3JSZWdleChwYXR0ZXJuKS5yZXBsYWNlKC9cXFxcXFwqL2csIFwiLipcIik7XHJcblx0XHRyZXR1cm4gUmVnRXhwKGBeJHtzdGFyc1JlcGxhY2VkfSRgKTtcclxuXHR9XHJcblx0ZXNjYXBlRm9yUmVnZXgoc3RyaW5nKSB7XHJcblx0XHRyZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCBcIlxcXFwkJlwiKTtcclxuXHR9XHJcbn07XHJcbnZhciBJbnZhbGlkTWF0Y2hQYXR0ZXJuID0gY2xhc3MgZXh0ZW5kcyBFcnJvciB7XHJcblx0Y29uc3RydWN0b3IobWF0Y2hQYXR0ZXJuLCByZWFzb24pIHtcclxuXHRcdHN1cGVyKGBJbnZhbGlkIG1hdGNoIHBhdHRlcm4gXCIke21hdGNoUGF0dGVybn1cIjogJHtyZWFzb259YCk7XHJcblx0fVxyXG59O1xyXG5mdW5jdGlvbiB2YWxpZGF0ZVByb3RvY29sKG1hdGNoUGF0dGVybiwgcHJvdG9jb2wpIHtcclxuXHRpZiAoIU1hdGNoUGF0dGVybi5QUk9UT0NPTFMuaW5jbHVkZXMocHJvdG9jb2wpICYmIHByb3RvY29sICE9PSBcIipcIikgdGhyb3cgbmV3IEludmFsaWRNYXRjaFBhdHRlcm4obWF0Y2hQYXR0ZXJuLCBgJHtwcm90b2NvbH0gbm90IGEgdmFsaWQgcHJvdG9jb2wgKCR7TWF0Y2hQYXR0ZXJuLlBST1RPQ09MUy5qb2luKFwiLCBcIil9KWApO1xyXG59XHJcbmZ1bmN0aW9uIHZhbGlkYXRlSG9zdG5hbWUobWF0Y2hQYXR0ZXJuLCBob3N0bmFtZSkge1xyXG5cdGlmIChob3N0bmFtZS5pbmNsdWRlcyhcIjpcIikpIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKG1hdGNoUGF0dGVybiwgYEhvc3RuYW1lIGNhbm5vdCBpbmNsdWRlIGEgcG9ydGApO1xyXG5cdGlmIChob3N0bmFtZS5pbmNsdWRlcyhcIipcIikgJiYgaG9zdG5hbWUubGVuZ3RoID4gMSAmJiAhaG9zdG5hbWUuc3RhcnRzV2l0aChcIiouXCIpKSB0aHJvdyBuZXcgSW52YWxpZE1hdGNoUGF0dGVybihtYXRjaFBhdHRlcm4sIGBJZiB1c2luZyBhIHdpbGRjYXJkICgqKSwgaXQgbXVzdCBnbyBhdCB0aGUgc3RhcnQgb2YgdGhlIGhvc3RuYW1lYCk7XHJcbn1cclxuLy8jZW5kcmVnaW9uXHJcbmV4cG9ydCB7IEludmFsaWRNYXRjaFBhdHRlcm4sIE1hdGNoUGF0dGVybiB9O1xyXG4iXSwieF9nb29nbGVfaWdub3JlTGlzdCI6WzAsMSwyLDUsNiw3LDgsOSwxMCwxMSwxMiwx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YUFBQSxRQUFBLGlCQURBLGlCQUFBLFFBQUEsTUFBQSxVQUFBLDRCQUNBLENBQUE7R0FDRixDQUFBO0dBR0YsT0FBQTtFQUNGLENBQUE7RUFHQSxRQUFBLEtBQUEsVUFBQSxhQUFBLFVBQUE7R0FDRSxDQUFBLFlBQUE7SUFFRSxLQUFBLE1BREEsa0JBQUEsT0FBQSxFQUFBLEVBQ0EsVUFBQSxPQUFBLE1BQUEsbUJBQUEsT0FBQTtHQUNGLEVBQUEsQ0FBQTtFQUNGLENBQUE7RUFHQSxRQUFBLEtBQUEsVUFBQSxhQUFBLE9BQUEsZUFBQTtHQUNFLElBQUEsV0FBQSxXQUFBLFdBQUE7R0FDQSxDQUFBLFlBQUE7SUFFRSxLQUFBLE1BREEsa0JBQUEsT0FBQSxFQUFBLEVBQ0EsVUFBQSxPQUFBLE1BQUEsbUJBQUEsT0FBQTtHQUNGLEVBQUEsQ0FBQTtFQUNGLENBQUE7RUFFQSxlQUFBLGNBQUEsU0FBQSxRQUFBO0dBSUUsUUFBQSxRQUFBLE1BQUE7SUFDRSxLQUFBLGlCQUFBLE9BQUEsYUFBQTtJQUVBLEtBQUEsZ0JBQUEsT0FBQSxZQUFBO0lBRUEsS0FBQSxjQUFBLE9BQUEsVUFBQTtJQUVBLEtBQUEsaUJBQUEsT0FBQSxlQUFBLFFBQUEsU0FBQTtJQUVBLEtBQUEsb0JBQUEsT0FBQSxrQkFBQSxRQUFBLGFBQUE7SUFFQSxLQUFBLGdCQUFBLE9BQUEsY0FBQSxRQUFBLE9BQUE7SUFFQSxLQUFBLGtCQUFBLE9BQUEsZ0JBQUEsUUFBQSxXQUFBLFFBQUEsV0FBQSxNQUFBO0lBSUEsU0FBQSxPQUFBLFFBQUEsaUJBQUEseUNBQUEsUUFBQSxLQUFBLEVBQUE7R0FFRjtFQUNGO0VBTUEsZUFBQSxlQUFBO0dBQ0UsTUFBQSxNQUFBLE1BQUEsVUFBQTtHQUNBLElBQUEsQ0FBQSxPQUFBLE9BQUEsSUFBQSxPQUFBLFVBQ0UsT0FBQSxRQUFBLG1CQUFBLGtDQUFBO0dBSUYsSUFBQSxDQURBLFlBQUEsSUFBQSxHQUNBLENBQUEsQ0FBQSxXQUNFLE9BQUEsUUFBQSxpQkFBQTtHQUdGLE1BQUEsUUFBQSxJQUFBO0dBSUEsTUFBQSxXQUFBLE1BQUEsa0JBQUEsT0FBQTtHQUNBLElBQUEsWUFBQSxTQUFBLFVBQUEsT0FBQTtJQUNFLE1BQUEsVUFBQSxTQUFBLE9BQUE7S0FBa0MsTUFBQTtLQUFvQixRQUFBO0lBQW1CLENBQUE7SUFDekUsTUFBQSxtQkFBQSxPQUFBO0dBQ0Y7R0FFQSxNQUFBLFFBQUEsTUFBQSxjQUFBLEtBQUE7R0FDQSxJQUFBLENBQUEsTUFBQSxJQUFBLE9BQUE7R0FFQSxNQUFBLG1CQUFBLE1BQUEscUJBQUEsS0FBQTtHQUNBLE1BQUEsWUFBQSxnQkFBQTtHQUtBLE1BQUEsVUFBQSxNQUFBLG1CQUFBLFNBQUE7SUFDRTtJQUNBO0lBQ0EsNEJBQUEsSUFBQSxLQUFBLEVBQUEsQ0FBQSxZQUFBO0lBQ0EsT0FBQTtHQUNGLENBQUE7R0FDQSxJQUFBLENBQUEsUUFBQSxJQUFBLE9BQUE7R0FFQSxNQUFBLFlBQUEsTUFBQSxVQUFBLE9BQUE7SUFDRSxNQUFBO0lBQ0E7SUFDQSxpQkFBQSxpQkFBQTtHQUNGLENBQUE7R0FFQSxJQUFBLENBQUEsVUFBQSxJQUFBO0lBQ0UsTUFBQSxzQkFBQSxTQUFBO0lBQ0EsT0FBQTtHQUNGO0dBRUEsTUFBQSxXQUFBLE1BQUEsbUJBQUEsU0FBQTtJQUNFO0lBQ0E7SUFDQSxXQUFBLFFBQUEsS0FBQTtJQUNBLE9BQUE7R0FDRixDQUFBO0dBQ0EsSUFBQSxDQUFBLFNBQUEsSUFBQTtJQUNFLE1BQUEsVUFBQSxPQUFBO0tBQXlCLE1BQUE7S0FBb0I7S0FBVyxRQUFBO0lBQWdCLENBQUE7SUFDeEUsTUFBQSxzQkFBQSxTQUFBO0lBQ0EsT0FBQTtHQUNGO0dBRUEsT0FBQSxRQUFBO0lBQWlCO0lBQVc7SUFBTyxXQUFBLFVBQUEsS0FBQTtHQUFvQyxDQUFBO0VBQ3pFO0VBRUEsZUFBQSxjQUFBO0dBQ0UsTUFBQSxTQUFBLE1BQUEsa0JBQUEsT0FBQTtHQUNBLElBQUEsQ0FBQSxRQUFBLE9BQUEsUUFBQSxFQUFBLFVBQUEsTUFBQSxDQUFBO0dBRUEsTUFBQSxVQUFBLE1BQUEsVUFBQSxPQUFBLE9BQUE7SUFDRSxNQUFBO0lBQ0EsV0FBQSxPQUFBO0lBQ0EsUUFBQTtHQUNGLENBQUE7R0FFQSxNQUFBLG1CQUFBLE9BQUE7R0FFQSxJQUFBLENBQUEsUUFBQSxJQUdFLE9BQUEsUUFBQSxFQUFBLFVBQUEsTUFBQSxDQUFBO0dBRUYsT0FBQSxRQUFBLEVBQUEsVUFBQSxRQUFBLEtBQUEsU0FBQSxDQUFBO0VBQ0Y7Ozs7O0VBTUEsZUFBQSxjQUFBLE9BQUE7R0FDRSxNQUFBLE9BQUEsTUFBQSxVQUFBLE9BQUEsRUFBQSxNQUFBLE9BQUEsQ0FBQTtHQUNBLElBQUEsS0FBQSxJQUFBLE9BQUE7R0FFQSxJQUFBO0lBQ0UsTUFBQSxRQUFBLFVBQUEsY0FBQTtLQUNFLFFBQUEsRUFBQSxNQUFBO0tBQ0EsT0FBQSxDQUFBLG1CQUFBO0lBQ0YsQ0FBQTtHQUNGLFNBQUEsT0FBQTtJQUVFLE9BQUEsUUFBQSw4QkFEQSxpQkFBQSxRQUFBLE1BQUEsVUFBQSxrQkFDQTtHQUNGO0dBRUEsTUFBQSxRQUFBLE1BQUEsVUFBQSxPQUFBLEVBQUEsTUFBQSxPQUFBLENBQUE7R0FDQSxJQUFBLENBQUEsTUFBQSxJQUFBLE9BQUEsUUFBQSw0QkFBQTtHQUNBLE9BQUE7RUFDRjtFQU1BLGVBQUEsWUFBQTtHQUNFLE1BQUEsTUFBQSxNQUFBLFVBQUE7R0FDQSxNQUFBLE9BQUEsWUFBQSxLQUFBLEdBQUE7R0FDQSxNQUFBLFNBQUEsTUFBQSxrQkFBQSxPQUFBO0dBQ0EsTUFBQSxtQkFBQSxNQUFBLHFCQUFBLEtBQUE7R0FDQSxNQUFBLHNCQUFBLElBQUEsS0FBQTtHQUVBLE1BQUEsU0FBQSxNQUFBLFlBQUEsS0FBQTtHQUNBLElBQUEsQ0FBQSxPQUFBLElBQ0UsT0FBQSxRQUFBO0lBQ0UsYUFBQSxRQUFBLFNBQUE7SUFDQSxpQkFBQSxRQUFBLGFBQUE7SUFDQSxZQUFBLFFBQUEsVUFBQSxLQUFBO0lBQ0E7SUFDQSxzQkFBQTtJQUNBLGVBQUE7SUFDQSxPQUFBO0lBQ0EsU0FBQTtLQUNFLFNBQUE7S0FDQSxVQUFBO0tBQ0Es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