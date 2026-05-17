import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, ServerRouter, UNSAFE_withComponentProps, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { jsx, jsxs } from "react/jsx-runtime";
import { Button, Card, Form, FormLabel } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/@react-router/dev/dist/config/defaults/entry.server.node.tsx
var entry_server_node_exports = /* @__PURE__ */ __exportAll({
	default: () => handleRequest,
	streamTimeout: () => streamTimeout
});
var streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
	if (request.method.toUpperCase() === "HEAD") return new Response(null, {
		status: responseStatusCode,
		headers: responseHeaders
	});
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		let userAgent = request.headers.get("user-agent");
		let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
		let timeoutId = setTimeout(() => abort(), streamTimeout + 1e3);
		const { pipe, abort } = renderToPipeableStream(/* @__PURE__ */ jsx(ServerRouter, {
			context: routerContext,
			url: request.url
		}), {
			[readyOption]() {
				shellRendered = true;
				const body = new PassThrough({ final(callback) {
					clearTimeout(timeoutId);
					timeoutId = void 0;
					callback();
				} });
				const stream = createReadableStreamFromReadable(body);
				responseHeaders.set("Content-Type", "text/html");
				pipe(body);
				resolve(new Response(stream, {
					headers: responseHeaders,
					status: responseStatusCode
				}));
			},
			onShellError(error) {
				reject(error);
			},
			onError(error) {
				responseStatusCode = 500;
				if (shellRendered) console.error(error);
			}
		});
	});
}
//#endregion
//#region app/root.tsx
var root_exports = /* @__PURE__ */ __exportAll({
	ErrorBoundary: () => ErrorBoundary,
	Layout: () => Layout,
	default: () => root_default,
	links: () => links
});
var links = () => [
	{
		rel: "preconnect",
		href: "https://fonts.googleapis.com"
	},
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous"
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
	}
];
function Layout({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsxs("head", { children: [
			/* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
			/* @__PURE__ */ jsx("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			}),
			/* @__PURE__ */ jsx(Meta, {}),
			/* @__PURE__ */ jsx(Links, {})
		] }), /* @__PURE__ */ jsxs("body", { children: [
			children,
			/* @__PURE__ */ jsx(ScrollRestoration, {}),
			/* @__PURE__ */ jsx(Scripts, {})
		] })]
	});
}
var root_default = UNSAFE_withComponentProps(function App() {
	return /* @__PURE__ */ jsx(Outlet, {});
});
var ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary({ error }) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack;
	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	}
	return /* @__PURE__ */ jsxs("main", {
		className: "pt-16 p-4 container mx-auto",
		children: [
			/* @__PURE__ */ jsx("h1", { children: message }),
			/* @__PURE__ */ jsx("p", { children: details }),
			stack
		]
	});
});
//#endregion
//#region app/routes/home.tsx
var home_exports = /* @__PURE__ */ __exportAll({
	default: () => home_default,
	meta: () => meta,
	useWithSounds: () => useWithSounds
});
var State = /* @__PURE__ */ function(State) {
	State[State["PAUSED"] = 0] = "PAUSED";
	State[State["GO"] = 1] = "GO";
	State[State["REST"] = 2] = "REST";
	return State;
}(State || {});
function meta({}) {
	return [{ title: "Agility Training" }, {
		name: "description",
		content: ""
	}];
}
var useWithSounds = (sources) => {
	const refs = useRef({});
	useEffect(() => {
		sources.forEach(({ label, location }) => {
			const audio = new Audio(location);
			audio.preload = "auto";
			refs.current[label] = audio;
		});
	}, []);
	const play = (name) => {
		const audio = refs.current[name];
		if (audio) {
			audio.currentTime = 0;
			audio.play();
		}
	};
	return { play };
};
var sounds = [{
	"label": "Left",
	"location": "/left.mp3"
}, {
	"label": "Right",
	"location": "/right.mp3"
}];
var home_default = UNSAFE_withComponentProps(function Home() {
	const { play } = useWithSounds(sounds);
	const [config, setConfig] = useState({
		selected: [],
		minTime: 1,
		maxTime: 10,
		restTime: 30
	});
	const [running, setRunning] = useState(false);
	const timeoutRef = useRef(null);
	const [restTime, setRestTime] = useState(0);
	const restTimeRef = useRef(0);
	const [state, setState] = useState(State.PAUSED);
	const configRef = useRef(config);
	const setRange = (key, value) => setConfig((prev) => ({
		...prev,
		[key]: value
	}));
	const startRest = () => {
		restTimeRef.current = config.restTime * 1e3;
		setRestTime(restTimeRef.current);
		setState(State.REST);
		timeoutRef.current = setTimeout(runRest, 1e3);
	};
	const runRest = () => {
		if (restTimeRef.current > 0) {
			restTimeRef.current -= 1e3;
			setRestTime(restTimeRef.current);
			timeoutRef.current = setTimeout(runRest, 1e3);
		} else scheduleRun();
	};
	const scheduleRun = () => {
		setState(State.GO);
		const delay = Math.random() * (configRef.current.maxTime - configRef.current.minTime) + configRef.current.minTime;
		return setTimeout(() => {
			const available = sounds.filter((x) => configRef.current.selected.includes(x.label));
			if (available.length > 0) {
				const pick = available[Math.floor(Math.random() * available.length)];
				play(pick.label);
			}
			startRest();
		}, delay * 1e3);
	};
	useEffect(() => {
		if (running) timeoutRef.current = scheduleRun();
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			setRestTime(0);
			setState(State.PAUSED);
		};
	}, [running]);
	useEffect(() => {
		configRef.current = config;
	}, [config]);
	return /* @__PURE__ */ jsxs("main", { children: [/* @__PURE__ */ jsx("link", {
		rel: "stylesheet",
		href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css",
		integrity: "sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB",
		crossOrigin: "anonymous"
	}), /* @__PURE__ */ jsxs("div", {
		className: "row p-3",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "col",
			style: { maxWidth: 400 },
			children: [
				/* @__PURE__ */ jsx(Form.Label, { children: "Sounds To Use" }),
				sounds.map((x) => /* @__PURE__ */ jsx(Form.Check, {
					type: "checkbox",
					label: x.label,
					onChange: (e) => setConfig((prev) => ({
						...prev,
						selected: e.target.checked ? [...prev.selected, x.label] : prev.selected.filter((s) => s !== x.label)
					}))
				}, x.label)),
				/* @__PURE__ */ jsxs("div", {
					className: "d-flex align-items-center gap-2",
					children: [
						/* @__PURE__ */ jsx(Form.Label, { children: "Min Time" }),
						/* @__PURE__ */ jsx(Form.Range, {
							value: config.minTime,
							onChange: (e) => setRange("minTime", Number(e.target.value)),
							max: 10
						}),
						/* @__PURE__ */ jsxs(FormLabel, { children: [config.minTime, " seconds"] })
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "d-flex align-items-center gap-2",
					children: [
						/* @__PURE__ */ jsx(Form.Label, { children: "Max Time" }),
						/* @__PURE__ */ jsx(Form.Range, {
							value: config.maxTime,
							onChange: (e) => setRange("maxTime", Number(e.target.value)),
							max: 10
						}),
						/* @__PURE__ */ jsxs(FormLabel, { children: [config.maxTime, " seconds"] })
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "d-flex align-items-center gap-2",
					children: [
						/* @__PURE__ */ jsx(Form.Label, { children: "Rest Time" }),
						/* @__PURE__ */ jsx(Form.Range, {
							value: config.restTime,
							onChange: (e) => setRange("restTime", Number(e.target.value)),
							max: 120
						}),
						/* @__PURE__ */ jsxs(FormLabel, { children: [config.restTime, " seconds"] })
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "d-flex align-items-center gap-2",
					children: /* @__PURE__ */ jsx(Button, {
						variant: running ? "danger" : "success",
						onClick: () => setRunning((prev) => !prev),
						children: running ? "Stop" : "Start"
					})
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "col",
			children: /* @__PURE__ */ jsx(Card, {
				style: { width: "18rem" },
				children: state === State.PAUSED ? /* @__PURE__ */ jsxs(Card.Body, { children: [/* @__PURE__ */ jsx(Card.Title, { children: "Paused" }), /* @__PURE__ */ jsx(Card.Text, {})] }) : state === State.GO ? /* @__PURE__ */ jsxs(Card.Body, { children: [/* @__PURE__ */ jsx(Card.Title, { children: "Go!" }), /* @__PURE__ */ jsx(Card.Text, {})] }) : /* @__PURE__ */ jsxs(Card.Body, { children: [/* @__PURE__ */ jsx(Card.Title, { children: "Rest" }), /* @__PURE__ */ jsxs(Card.Text, { children: [restTime / 1e3, " s"] })] })
			})
		})]
	})] });
});
//#endregion
//#region \0virtual:react-router/server-manifest
var server_manifest_default = {
	"entry": {
		"module": "/assets/entry.client-BJMcf1u-.js",
		"imports": ["/assets/jsx-runtime-BbSEct4w.js"],
		"css": []
	},
	"routes": {
		"root": {
			"id": "root",
			"parentId": void 0,
			"path": "",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": true,
			"module": "/assets/root-D1DJRYA1.js",
			"imports": ["/assets/jsx-runtime-BbSEct4w.js"],
			"css": ["/assets/root-BvQMNOFK.css"],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/home": {
			"id": "routes/home",
			"parentId": "root",
			"path": void 0,
			"index": true,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/home-BSh6sD3A.js",
			"imports": ["/assets/jsx-runtime-BbSEct4w.js"],
			"css": ["/assets/home-CqLr8KVv.css"],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		}
	},
	"url": "/assets/manifest-666fd62d.js",
	"version": "666fd62d",
	"sri": void 0
};
//#endregion
//#region \0virtual:react-router/server-build
var assetsBuildDirectory = "build/client";
var basename = "/";
var future = {
	"unstable_optimizeDeps": false,
	"unstable_passThroughRequests": false,
	"unstable_subResourceIntegrity": false,
	"unstable_trailingSlashAwareDataRequests": false,
	"unstable_previewServerPrerendering": false,
	"v8_middleware": false,
	"v8_splitRouteModules": false,
	"v8_viteEnvironmentApi": false
};
var ssr = true;
var isSpaMode = false;
var prerender = [];
var routeDiscovery = {
	"mode": "lazy",
	"manifestPath": "/__manifest"
};
var publicPath = "/";
var entry = { module: entry_server_node_exports };
var routes = {
	"root": {
		id: "root",
		parentId: void 0,
		path: "",
		index: void 0,
		caseSensitive: void 0,
		module: root_exports
	},
	"routes/home": {
		id: "routes/home",
		parentId: "root",
		path: void 0,
		index: true,
		caseSensitive: void 0,
		module: home_exports
	}
};
var allowedActionOrigins = false;
//#endregion
export { allowedActionOrigins, server_manifest_default as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, prerender, publicPath, routeDiscovery, routes, ssr };
