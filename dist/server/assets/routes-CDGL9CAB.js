import { n as cn, t as StarLogo } from "./StarLogo-aUAmbt8U.js";
import { t as Toaster$1 } from "./sonner-DoFKumIW.js";
import { n as useAuth, r as CHAT_ENDPOINT, t as AuthProvider } from "./AuthProvider-CkRiyMfH.js";
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertTriangle, ArrowDownWideNarrow, ArrowUp, Brain, Bug, ChartNoAxesColumn, Check, ChevronDown, ChevronRight, CircleHelp, Code2, Copy, Download, Eraser, ExternalLink, FileText, FolderClosed, FolderPlus, Globe, ImageIcon, Info, Languages, Loader2, Lock, LogOut, Megaphone, Menu, MessageSquarePlus, Mic, Orbit, Paperclip, PenLine, Pencil, Pin, PinOff, RefreshCw, Search, Settings, Sheet, Sparkle, Square, Trash2, User, Volume2, Wand2, X, Zap } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
//#region src/components/star/AdBanner.tsx
var AD = {
	enabled: true,
	label: "تبلیغ",
	title: "جای تبلیغ شما در Star-AI",
	description: "برای معرفی محصول یا خدمات خود با ما تماس بگیرید.",
	image: "/ad-banner.png",
	destination: "https://star-ai-2026.github.io/star-ai-pmstudio/"
};
function AdBanner({ className = "" }) {
	if (!AD.enabled) return null;
	const hasImage = Boolean(AD.image);
	const validDestination = AD.destination.startsWith("https://") || AD.destination.startsWith("http://");
	return /* @__PURE__ */ jsx("aside", {
		"aria-label": "تبلیغ مستقیم",
		className: `mx-auto w-full max-w-3xl px-3 py-2 ${className}`,
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card/80 p-3 shadow-sm",
			children: [
				hasImage ? /* @__PURE__ */ jsx("img", {
					src: AD.image,
					alt: "",
					className: "h-16 w-20 shrink-0 rounded-xl object-cover",
					onError: (event) => {
						event.currentTarget.style.display = "none";
					}
				}) : /* @__PURE__ */ jsx("div", {
					className: "flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-secondary",
					children: /* @__PURE__ */ jsx(Megaphone, { className: "h-7 w-7 text-muted-foreground" })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "mb-1 inline-block rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground",
							children: AD.label
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "truncate text-sm font-semibold",
							children: AD.title
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 line-clamp-2 text-xs text-muted-foreground",
							children: AD.description
						})
					]
				}),
				validDestination && /* @__PURE__ */ jsx("a", {
					href: AD.destination,
					target: "_blank",
					rel: "noopener noreferrer",
					"aria-label": "مشاهده تبلیغ",
					className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border hover:bg-secondary",
					children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" })
				})
			]
		})
	});
}
//#endregion
//#region src/lib/ai/versions.ts
var RESPONSE_STYLES = [
	{
		id: "balanced",
		label: "Balanced",
		hint: "Clear, neutral, well-rounded"
	},
	{
		id: "creative",
		label: "Creative",
		hint: "Imaginative and expressive"
	},
	{
		id: "precise",
		label: "Precise",
		hint: "Exact, minimal speculation"
	},
	{
		id: "friendly",
		label: "Friendly",
		hint: "Warm and conversational"
	},
	{
		id: "professional",
		label: "Professional",
		hint: "Formal business tone"
	},
	{
		id: "short",
		label: "Short",
		hint: "Tight, to the point"
	},
	{
		id: "detailed",
		label: "Detailed",
		hint: "Thorough and structured"
	}
];
var VERSIONS = {
	"2.0": {
		id: "2.0",
		name: "Star-AI 2.0",
		badge: "Star-AI 2.0",
		subtitle: "Smart AI for everyday tasks",
		tagline: "Fast, simple and reliable",
		advanced: false,
		capabilities: [
			"General conversation",
			"Question answering",
			"Text generation",
			"Summarization",
			"Translation",
			"Coding assistance",
			"Mathematics",
			"Creative writing",
			"Basic reasoning"
		],
		cards: [
			{
				title: "Ask anything",
				description: "Quick answers to everyday questions",
				icon: "sparkle",
				prompt: "Explain how solar panels work in simple terms."
			},
			{
				title: "Write",
				description: "Emails, posts and creative text",
				icon: "pen",
				prompt: "Write a short, friendly email asking my team for project updates."
			},
			{
				title: "Translate",
				description: "Natural translation between languages",
				icon: "languages",
				prompt: "Translate this to Persian: 'The meeting has been moved to Monday at 9am.'"
			},
			{
				title: "Code",
				description: "Snippets, fixes and explanations",
				icon: "code",
				prompt: "Write a JavaScript function that debounces another function."
			}
		],
		examples: [
			"Summarize the theory of relativity in 5 bullet points",
			"Give me a 20-minute healthy dinner recipe",
			"Fix this SQL query and explain the bug"
		],
		supportsImages: true,
		supportsFiles: true
	},
	"3.0": {
		id: "3.0",
		name: "Star-AI 3.0",
		badge: "Star-AI 3.0",
		subtitle: "Advanced intelligence for complex tasks",
		tagline: "Advanced Mode",
		advanced: true,
		capabilities: [
			"Advanced reasoning",
			"Complex problem solving",
			"Coding",
			"Debugging",
			"Mathematics",
			"Translation",
			"Long-form writing",
			"Summarization",
			"Creative generation",
			"Data analysis",
			"Multi-step reasoning",
			"File understanding",
			"Image understanding",
			"Conversation memory",
			"Context-aware responses"
		],
		cards: [
			{
				title: "Advanced Reasoning",
				description: "Multi-step thinking on hard problems",
				icon: "brain",
				prompt: "Design a fair scheduling algorithm for 3 teams across 4 timezones and justify it."
			},
			{
				title: "Code & Debug",
				description: "Architecture, refactors, root-cause fixes",
				icon: "bug",
				prompt: "Here is a React component that re-renders too often. Diagnose and refactor it."
			},
			{
				title: "Analyze",
				description: "Data, trends and structured insight",
				icon: "chart",
				prompt: "Analyze this CSV of monthly sales and tell me what is driving the decline."
			},
			{
				title: "Create",
				description: "Long-form and original generation",
				icon: "wand",
				prompt: "Write the opening chapter of a hard sci-fi novel set on a dying star."
			},
			{
				title: "Understand Files",
				description: "PDF, DOCX, CSV, JSON and images",
				icon: "file",
				prompt: "Summarize the attached document and extract every action item."
			},
			{
				title: "Complex Problems",
				description: "Research-grade, multi-constraint tasks",
				icon: "orbit",
				prompt: "Plan a migration from a monolith to services with zero downtime and a rollback path."
			}
		],
		examples: [
			"Prove that the square root of 2 is irrational, step by step",
			"Compare three caching strategies for a read-heavy API",
			"Turn this messy spec into a prioritized engineering plan"
		],
		supportsImages: true,
		supportsFiles: true
	},
	"4.0": {
		id: "4.0",
		name: "Star-AI 4.0",
		badge: "Star-AI 4.0",
		subtitle: "Next-generation intelligence",
		tagline: "Next-Generation Mode",
		advanced: true,
		capabilities: [
			"Advanced reasoning",
			"Complex problem solving",
			"Coding and debugging",
			"Mathematics",
			"Long-form writing",
			"Data analysis",
			"Image understanding",
			"File understanding",
			"Multi-step reasoning",
			"Context-aware responses"
		],
		cards: [
			{
				title: "Deep Reasoning",
				description: "Work through complex problems carefully",
				icon: "brain",
				prompt: "Analyze this difficult problem step by step and explain the assumptions."
			},
			{
				title: "Code & Build",
				description: "Design, debug and improve software",
				icon: "code",
				prompt: "Review this code, identify bugs, and suggest a robust fix."
			},
			{
				title: "Analyze Data",
				description: "Extract useful patterns and insights",
				icon: "chart",
				prompt: "Analyze this dataset and summarize the most important findings."
			},
			{
				title: "Understand Files",
				description: "Work with documents and images",
				icon: "file",
				prompt: "Summarize the attached file and list its key points."
			}
		],
		examples: [
			"Compare multiple solutions and explain their trade-offs",
			"Debug this program and provide a corrected version",
			"Create a detailed plan with risks and fallback steps"
		],
		supportsImages: true,
		supportsFiles: true
	}
};
var VERSION_LIST = [
	VERSIONS["2.0"],
	VERSIONS["3.0"],
	VERSIONS["4.0"]
];
var VERSION_CATALOG = [
	{
		id: "2.0",
		name: "Star-AI 2.0",
		emoji: "⭐",
		subtitle: "Modern blue technology",
		theme: "tech-blue",
		swatch: ["oklch(0.68 0.18 275)", "oklch(0.72 0.16 225)"],
		enabled: true
	},
	{
		id: "3.0",
		name: "Star-AI 3.0",
		emoji: "⭐",
		subtitle: "Advanced blue / purple cosmic",
		theme: "cosmic-violet",
		swatch: ["oklch(0.79 0.15 330)", "oklch(0.82 0.14 195)"],
		enabled: true
	},
	{
		id: "4.0",
		name: "Star-AI 4.0",
		emoji: "🚀",
		subtitle: "Futuristic cyan / blue",
		theme: "futuristic-cyan",
		swatch: ["oklch(0.82 0.14 200)", "oklch(0.7 0.16 245)"],
		enabled: true
	},
	{
		id: "5.0",
		name: "Star-AI 5.0",
		emoji: "🔥",
		subtitle: "Powerful cosmic energy",
		theme: "cosmic-energy",
		swatch: ["oklch(0.75 0.2 35)", "oklch(0.7 0.19 320)"],
		enabled: false
	},
	{
		id: "programming",
		name: "Star-AI Programming",
		emoji: "💻",
		subtitle: "Futuristic developer / code",
		theme: "developer",
		swatch: ["oklch(0.8 0.19 150)", "oklch(0.72 0.13 205)"],
		enabled: false
	},
	{
		id: "5.5",
		name: "Star-AI 5.5",
		emoji: "⚡",
		subtitle: "Premium cosmic",
		theme: "premium-cosmic",
		swatch: ["oklch(0.85 0.15 95)", "oklch(0.72 0.17 300)"],
		enabled: false
	},
	{
		id: "5.6",
		name: "Star-AI 5.6",
		emoji: "🌌",
		subtitle: "Flagship deep space",
		theme: "deep-space",
		swatch: ["oklch(0.62 0.2 285)", "oklch(0.84 0.12 210)"],
		enabled: false
	}
];
VERSION_CATALOG.filter((v) => v.enabled);
VERSION_CATALOG.filter((v) => !v.enabled);
function isVersionUnlocked(id) {
	return VERSION_CATALOG.some((v) => v.id === id && v.enabled);
}
/** Only unlocked ids that the chat runtime actually supports today. */
function isRuntimeVersion(id) {
	return (id === "2.0" || id === "3.0" || id === "4.0") && isVersionUnlocked(id);
}
//#endregion
//#region src/lib/star/types.ts
var DEFAULT_SETTINGS = {
	version: "3.0",
	defaultVersion: "3.0",
	style: "balanced",
	mode: "general",
	assistantName: "",
	language: "auto",
	uiLanguage: "en",
	webSearch: false,
	colorMode: "dark",
	animations: true,
	blur: true,
	liquidGlass: true,
	particles: true,
	backgroundIntensity: 70,
	streaming: true,
	memoryEnabled: true,
	notifications: false,
	autoSpeak: false,
	sort: "recent"
};
//#endregion
//#region src/lib/star/store.tsx
var KEY = "star-ai:state:v1";
/** Local auto-title: first meaningful sentence of the opening question. */
function autoTitle(text, fallback = "New chat") {
	const clean = text.replace(/\s+/g, " ").replace(/^[^\w]+/, "").trim();
	if (!clean) return fallback;
	const words = (clean.split(/(?<=[.!?])\s/)[0] ?? clean).split(" ").slice(0, 8).join(" ");
	const title = words.length > 52 ? `${words.slice(0, 52)}…` : words;
	return title.charAt(0).toUpperCase() + title.slice(1);
}
var uid = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
function load() {
	if (typeof window === "undefined") return {
		settings: DEFAULT_SETTINGS,
		conversations: [],
		memories: [],
		folders: []
	};
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) throw new Error("empty");
		const parsed = JSON.parse(raw);
		return {
			settings: {
				...DEFAULT_SETTINGS,
				...parsed.settings ?? {}
			},
			conversations: parsed.conversations ?? [],
			memories: parsed.memories ?? [],
			folders: parsed.folders ?? []
		};
	} catch {
		return {
			settings: DEFAULT_SETTINGS,
			conversations: [],
			memories: [],
			folders: []
		};
	}
}
var StarContext = createContext(null);
function useStar() {
	const ctx = useContext(StarContext);
	if (!ctx) throw new Error("useStar must be used inside <StarProvider>");
	return ctx;
}
function StarProvider({ children }) {
	const { displayName } = useAuth();
	const [hydrated, setHydrated] = useState(false);
	const [settings, setSettings] = useState(DEFAULT_SETTINGS);
	const [conversations, setConversations] = useState([]);
	const [memories, setMemories] = useState([]);
	const [folders, setFolders] = useState([]);
	const [activeId, setActiveId] = useState(null);
	const [switching, setSwitching] = useState(false);
	const [stream, setStream] = useState({
		conversationId: null,
		busy: false
	});
	const abortRef = useRef(null);
	useEffect(() => {
		const data = load();
		setSettings({
			...data.settings,
			version: data.settings.defaultVersion ?? data.settings.version
		});
		setConversations(data.conversations);
		setMemories(data.memories);
		setFolders(data.folders);
		setHydrated(true);
	}, []);
	useEffect(() => {
		if (!hydrated) return;
		try {
			window.localStorage.setItem(KEY, JSON.stringify({
				settings,
				conversations,
				memories,
				folders
			}));
		} catch {}
	}, [
		hydrated,
		settings,
		conversations,
		memories,
		folders
	]);
	useEffect(() => {
		if (typeof document === "undefined") return;
		const root = document.documentElement;
		root.dataset["starVersion"] = settings.version === "3.0" ? "3" : "2";
		root.dataset["starVersionTheme"] = VERSION_CATALOG.find((v) => v.id === settings.version)?.theme ?? "tech-blue";
		root.dataset["starAnim"] = settings.animations ? "on" : "off";
		root.dataset["starAnimations"] = settings.animations ? "on" : "off";
		root.dataset["starBlur"] = settings.blur ? "on" : "off";
		root.dataset["starLiquidGlass"] = settings.liquidGlass ? "on" : "off";
		root.lang = settings.uiLanguage ?? "fa";
		root.dir = (settings.uiLanguage ?? "fa") === "fa" ? "rtl" : "ltr";
		root.dataset["uiLanguage"] = settings.uiLanguage ?? "fa";
		const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
		const dark = settings.colorMode === "dark" || settings.colorMode === "system" && prefersDark;
		root.classList.toggle("dark", dark);
		root.style.setProperty("--bg-intensity", String(settings.backgroundIntensity / 100));
	}, [
		settings.version,
		settings.colorMode,
		settings.animations,
		settings.blur,
		settings.liquidGlass,
		settings.backgroundIntensity,
		settings.uiLanguage
	]);
	const updateSettings = useCallback((patch) => {
		setSettings((s) => ({
			...s,
			...patch
		}));
	}, []);
	const setVersion = useCallback((v) => {
		setSettings((s) => s.version === v ? s : {
			...s,
			version: v
		});
		setSwitching(true);
		window.setTimeout(() => setSwitching(false), 900);
	}, []);
	const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId]);
	const newConversation = useCallback(() => setActiveId(null), []);
	const renameConversation = useCallback((id, title) => {
		setConversations((cs) => cs.map((c) => c.id === id ? {
			...c,
			title: title.trim() || c.title,
			updatedAt: Date.now()
		} : c));
	}, []);
	const deleteConversation = useCallback((id) => {
		setConversations((cs) => cs.filter((c) => c.id !== id));
		setActiveId((cur) => cur === id ? null : cur);
	}, []);
	const togglePin = useCallback((id) => {
		setConversations((cs) => cs.map((c) => c.id === id ? {
			...c,
			pinned: !c.pinned
		} : c));
	}, []);
	const clearConversation = useCallback((id) => {
		setConversations((cs) => cs.map((c) => c.id === id ? {
			...c,
			messages: [],
			updatedAt: Date.now()
		} : c));
	}, []);
	const moveConversation = useCallback((id, folderId) => {
		setConversations((cs) => cs.map((c) => c.id === id ? {
			...c,
			folderId
		} : c));
	}, []);
	const createFolder = useCallback((name) => {
		const n = name.trim();
		if (!n) return;
		setFolders((f) => [...f, {
			id: uid(),
			name: n,
			createdAt: Date.now()
		}]);
	}, []);
	const renameFolder = useCallback((id, name) => {
		setFolders((f) => f.map((x) => x.id === id ? {
			...x,
			name: name.trim() || x.name
		} : x));
	}, []);
	const deleteFolder = useCallback((id) => {
		setFolders((f) => f.filter((x) => x.id !== id));
		setConversations((cs) => cs.map((c) => c.folderId === id ? {
			...c,
			folderId: null
		} : c));
	}, []);
	const setMode = useCallback((m) => setSettings((s) => ({
		...s,
		mode: m
	})), []);
	const setWebSearch = useCallback((v) => setSettings((s) => ({
		...s,
		webSearch: v
	})), []);
	const addMemory = useCallback((text) => {
		const t = text.trim();
		if (!t) return;
		setMemories((m) => [{
			id: uid(),
			text: t,
			createdAt: Date.now()
		}, ...m]);
	}, []);
	const deleteMemory = useCallback((id) => {
		setMemories((m) => m.filter((x) => x.id !== id));
	}, []);
	const clearMemories = useCallback(() => setMemories([]), []);
	const stopGenerating = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setStream({
			conversationId: null,
			busy: false
		});
	}, []);
	/** Core generation loop: posts history to the secure backend and streams back. */
	const run = useCallback(async (conversationId, history, version) => {
		const assistantId = uid();
		const controller = new AbortController();
		abortRef.current = controller;
		setStream({
			conversationId,
			busy: true
		});
		setConversations((cs) => cs.map((c) => c.id === conversationId ? {
			...c,
			updatedAt: Date.now(),
			messages: [...c.messages, {
				id: assistantId,
				role: "assistant",
				content: "",
				createdAt: Date.now(),
				version
			}]
		} : c));
		const patch = (fn) => setConversations((cs) => cs.map((c) => c.id === conversationId ? {
			...c,
			messages: c.messages.map((m) => m.id === assistantId ? fn(m) : m)
		} : c));
		try {
			const res = await fetch(CHAT_ENDPOINT, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				signal: controller.signal,
				body: JSON.stringify({
					version,
					style: settings.style,
					mode: settings.mode,
					webSearch: settings.webSearch,
					...settings.assistantName ? { assistantName: settings.assistantName } : {},
					...displayName ? { userName: displayName } : {},
					...settings.language && settings.language !== "auto" ? { language: settings.language } : {},
					uiLanguage: settings.uiLanguage,
					memories: settings.memoryEnabled ? memories.map((m) => m.text) : [],
					messages: history.map((m) => ({
						role: m.role,
						content: m.content,
						attachments: (m.attachments ?? []).filter((a) => !a.unsupported).map((a) => ({
							name: a.name,
							mimeType: a.mimeType,
							...a.dataUrl ? { dataUrl: a.dataUrl } : {},
							...a.text ? { text: a.text } : {}
						}))
					}))
				})
			});
			if (!res.ok || !res.body) {
				let msg = "Star-AI is temporarily unavailable. Please try again.";
				try {
					const j = await res.json();
					if (j.error) msg = j.error;
				} catch {}
				patch((m) => ({
					...m,
					error: msg
				}));
				return;
			}
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buf = "";
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buf += decoder.decode(value, { stream: true });
				const lines = buf.split("\n");
				buf = lines.pop() ?? "";
				for (const l of lines) {
					if (!l.trim()) continue;
					let evt;
					try {
						evt = JSON.parse(l);
					} catch {
						continue;
					}
					if (evt.type === "text") patch((m) => ({
						...m,
						content: m.content + (evt.value ?? "")
					}));
					else if (evt.type === "reasoning") patch((m) => ({
						...m,
						reasoning: (m.reasoning ?? "") + (evt.value ?? "")
					}));
					else if (evt.type === "sources") patch((m) => ({
						...m,
						sources: evt.sources ?? []
					}));
					else if (evt.type === "notice") patch((m) => ({
						...m,
						notice: evt.value ?? ""
					}));
					else if (evt.type === "status") setStream((s) => ({
						...s,
						status: evt.value ?? ""
					}));
					else if (evt.type === "error") patch((m) => ({
						...m,
						error: evt.value ?? "Something went wrong. Please try again."
					}));
				}
			}
			patch((m) => m.content.trim() || m.error ? m : {
				...m,
				error: "Star-AI didn't return a response. Please try again."
			});
		} catch (err) {
			if (err?.name !== "AbortError") patch((m) => ({
				...m,
				error: "Something went wrong. Please try again."
			}));
		} finally {
			abortRef.current = null;
			setStream({
				conversationId: null,
				busy: false
			});
		}
	}, [
		displayName,
		memories,
		settings.memoryEnabled,
		settings.style,
		settings.mode,
		settings.webSearch,
		settings.assistantName,
		settings.language
	]);
	const sendMessage = useCallback(async (text, attachments) => {
		const trimmed = text.trim();
		if (!trimmed && !attachments?.length) return;
		const version = settings.version;
		const userMessage = {
			id: uid(),
			role: "user",
			content: trimmed,
			createdAt: Date.now(),
			version,
			...attachments?.length ? { attachments } : {}
		};
		let conversationId = activeId;
		let history = [];
		if (!conversationId) {
			conversationId = uid();
			const convo = {
				id: conversationId,
				title: autoTitle(trimmed, attachments?.[0]?.name ?? "New chat"),
				version,
				mode: settings.version === "3.0" ? settings.mode : settings.mode,
				folderId: null,
				autoTitled: true,
				pinned: false,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				messages: [userMessage]
			};
			history = [userMessage];
			setConversations((cs) => [convo, ...cs]);
			setActiveId(conversationId);
		} else {
			history = [...conversations.find((c) => c.id === conversationId)?.messages ?? [], userMessage];
			setConversations((cs) => cs.map((c) => c.id === conversationId ? {
				...c,
				messages: [...c.messages, userMessage],
				updatedAt: Date.now()
			} : c));
		}
		await run(conversationId, history, version);
	}, [
		activeId,
		conversations,
		run,
		settings.version,
		settings.mode
	]);
	const regenerate = useCallback(async () => {
		if (!activeId) return;
		const convo = conversations.find((c) => c.id === activeId);
		if (!convo) return;
		const msgs = [...convo.messages];
		while (msgs.length && msgs[msgs.length - 1].role === "assistant") msgs.pop();
		if (!msgs.length) return;
		setConversations((cs) => cs.map((c) => c.id === activeId ? {
			...c,
			messages: msgs
		} : c));
		await run(activeId, msgs, settings.version);
	}, [
		activeId,
		conversations,
		run,
		settings.version
	]);
	const editMessage = useCallback(async (messageId, text) => {
		if (!activeId) return;
		const convo = conversations.find((c) => c.id === activeId);
		if (!convo) return;
		const idx = convo.messages.findIndex((m) => m.id === messageId);
		if (idx === -1) return;
		const msgs = convo.messages.slice(0, idx + 1);
		msgs[idx] = {
			...msgs[idx],
			content: text
		};
		setConversations((cs) => cs.map((c) => c.id === activeId ? {
			...c,
			messages: msgs
		} : c));
		await run(activeId, msgs, settings.version);
	}, [
		activeId,
		conversations,
		run,
		settings.version
	]);
	const value = {
		hydrated,
		settings,
		updateSettings,
		version: settings.version,
		setVersion,
		switching,
		conversations,
		folders,
		createFolder,
		renameFolder,
		deleteFolder,
		moveConversation,
		mode: settings.mode,
		setMode,
		webSearch: settings.webSearch,
		setWebSearch,
		activeId,
		active,
		setActiveId,
		newConversation,
		renameConversation,
		deleteConversation,
		togglePin,
		clearConversation,
		memories,
		addMemory,
		deleteMemory,
		clearMemories,
		stream,
		sendMessage,
		regenerate,
		editMessage,
		stopGenerating
	};
	return /* @__PURE__ */ jsx(StarContext.Provider, {
		value,
		children
	});
}
//#endregion
//#region src/lib/star/files.ts
var ACCEPTED = ".pdf,.txt,.md,.docx,.doc,.csv,.tsv,.json,.xlsx,.xls,.log,.xml,.yaml,.yml,.png,.jpg,.jpeg,.webp,.gif,.svg";
var TEXT_EXT = /\.(txt|md|csv|tsv|json|log|xml|yaml|yml|ya?ml)$/i;
var SHEET_EXT = /\.(xlsx|xls)$/i;
var CSV_EXT = /\.(csv|tsv)$/i;
var MAX_TEXT_CHARS = 2e5;
var FileTooLargeError = class extends Error {};
var UnreadableFileError = class extends Error {};
function readAsDataUrl(file, onProgress) {
	return new Promise((resolve, reject) => {
		const r = new FileReader();
		r.onprogress = (e) => {
			if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 90));
		};
		r.onload = () => resolve(String(r.result));
		r.onerror = () => reject(new UnreadableFileError(file.name));
		r.readAsDataURL(file);
	});
}
function clampText(text) {
	return text.length > MAX_TEXT_CHARS ? `${text.slice(0, MAX_TEXT_CHARS)}\n\n[Content truncated — file is larger than the analysis window.]` : text;
}
function profileRows(rows) {
	const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
	const columns = headers.map((name) => {
		const values = rows.map((r) => r[name]);
		const present = values.filter((v) => v !== void 0 && v !== null && v !== "");
		const numbers = present.map((v) => Number(v)).filter((n) => Number.isFinite(n));
		const isNumeric = present.length > 0 && numbers.length / present.length > .8;
		const col = {
			name,
			type: isNumeric ? "number" : "text",
			missing: values.length - present.length,
			sample: present.slice(0, 3).map((v) => String(v).slice(0, 40))
		};
		if (isNumeric && numbers.length) {
			const sum = numbers.reduce((a, b) => a + b, 0);
			const sorted = [...numbers].sort((a, b) => a - b);
			col.stats = `min ${sorted[0]}, max ${sorted[sorted.length - 1]}, mean ${(sum / numbers.length).toFixed(2)}, median ${sorted[Math.floor(sorted.length / 2)]}`;
		}
		return col;
	});
	const preview = rows.slice(0, 40);
	const text = [
		`Dataset profile — ${rows.length} rows × ${headers.length} columns.`,
		"",
		"Columns:",
		...columns.map((c) => `- ${c.name} (${c.type}${c.missing ? `, ${c.missing} missing` : ""})${c.stats ? ` — ${c.stats}` : ""}; e.g. ${c.sample.join(" | ") || "—"}`),
		"",
		`First ${preview.length} rows as JSON:`,
		JSON.stringify(preview)
	].join("\n");
	return {
		summary: `${rows.length} rows · ${headers.length} columns`,
		text: clampText(text)
	};
}
function parseDelimited(raw, delimiter) {
	const rows = [];
	let field = "";
	let row = [];
	let quoted = false;
	for (let i = 0; i < raw.length; i++) {
		const ch = raw[i];
		if (quoted) if (ch === "\"" && raw[i + 1] === "\"") {
			field += "\"";
			i++;
		} else if (ch === "\"") quoted = false;
		else field += ch;
		else if (ch === "\"") quoted = true;
		else if (ch === delimiter) {
			row.push(field);
			field = "";
		} else if (ch === "\n") {
			row.push(field.replace(/\r$/, ""));
			rows.push(row);
			row = [];
			field = "";
		} else field += ch;
	}
	if (field || row.length) {
		row.push(field);
		rows.push(row);
	}
	const [header, ...body] = rows.filter((r) => r.some((c) => c.trim() !== ""));
	if (!header) return [];
	return body.map((r) => Object.fromEntries(header.map((h, i) => [h || `col_${i + 1}`, r[i] ?? ""])));
}
async function toAttachment(file, onProgress) {
	if (file.size > 12582912) throw new FileTooLargeError(file.name);
	const tick = (n) => onProgress?.(n);
	tick(5);
	const base = {
		id: uid(),
		name: file.name,
		mimeType: file.type || "application/octet-stream",
		size: file.size
	};
	try {
		if (file.type.startsWith("image/")) {
			const dataUrl = await readAsDataUrl(file, tick);
			tick(100);
			return {
				...base,
				kind: "image",
				dataUrl,
				summary: "Image · vision analysis"
			};
		}
		if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) {
			const dataUrl = await readAsDataUrl(file, tick);
			tick(100);
			return {
				...base,
				kind: "pdf",
				mimeType: "application/pdf",
				dataUrl,
				summary: "PDF · document analysis"
			};
		}
		if (SHEET_EXT.test(file.name) || file.type.includes("spreadsheet") || file.type.includes("ms-excel")) {
			const XLSX = await import("xlsx");
			tick(35);
			const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
			const sheetName = wb.SheetNames[0];
			const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "" });
			tick(85);
			const { summary, text } = profileRows(rows);
			tick(100);
			return {
				...base,
				kind: "data",
				summary: `${sheetName} · ${summary}`,
				text: `Spreadsheet "${file.name}" (sheet: ${sheetName}, sheets available: ${wb.SheetNames.join(", ")})\n\n${text}`
			};
		}
		if (CSV_EXT.test(file.name) || file.type === "text/csv") {
			const raw = await file.text();
			tick(60);
			const { summary, text } = profileRows(parseDelimited(raw, /\.tsv$/i.test(file.name) ? "	" : ","));
			tick(100);
			return {
				...base,
				kind: "data",
				summary,
				text: `CSV file "${file.name}"\n\n${text}`
			};
		}
		if (/\.docx$/i.test(file.name) || file.type.includes("wordprocessingml")) {
			const mammoth = await import("mammoth");
			tick(35);
			const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
			tick(90);
			const text = result.value.trim();
			if (!text) throw new UnreadableFileError(file.name);
			tick(100);
			return {
				...base,
				kind: "document",
				summary: `Word document · ${text.split(/\s+/).length} words`,
				text: clampText(`Word document "${file.name}"\n\n${text}`)
			};
		}
		if (file.type.startsWith("text/") || TEXT_EXT.test(file.name) || file.type === "application/json") {
			const text = await file.text();
			tick(100);
			return {
				...base,
				kind: "text",
				summary: `${text.split(/\r?\n/).length} lines`,
				text: clampText(text)
			};
		}
	} catch (err) {
		if (err instanceof FileTooLargeError) throw err;
		throw new UnreadableFileError(file.name);
	}
	return {
		...base,
		kind: "other",
		unsupported: true,
		summary: "Unsupported format — paste the content instead"
	};
}
function formatSize(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
//#endregion
//#region src/lib/star/speech.ts
/**
* Browser speech helpers: dictation (Web Speech API) and text-to-speech.
* Both degrade gracefully when the browser has no support.
*/
function getRecognition() {
	if (typeof window === "undefined") return null;
	const w = window;
	const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
	return Ctor ? new Ctor() : null;
}
function useDictation(onText) {
	const [listening, setListening] = useState(false);
	const [supported, setSupported] = useState(false);
	const ref = useRef(null);
	const cb = useRef(onText);
	cb.current = onText;
	useEffect(() => {
		setSupported(getRecognition() !== null);
		return () => ref.current?.stop();
	}, []);
	const stop = useCallback(() => {
		ref.current?.stop();
		ref.current = null;
		setListening(false);
	}, []);
	return {
		listening,
		supported,
		start: useCallback(() => {
			const rec = getRecognition();
			if (!rec) return false;
			rec.lang = typeof navigator !== "undefined" ? navigator.language : "en-US";
			rec.continuous = true;
			rec.interimResults = true;
			rec.onresult = (e) => {
				let text = "";
				let isFinal = false;
				for (let i = e.resultIndex; i < e.results.length; i++) {
					const r = e.results[i];
					text += r[0]?.transcript ?? "";
					if (r.isFinal) isFinal = true;
				}
				cb.current({
					transcript: text,
					isFinal
				});
			};
			rec.onerror = () => {
				ref.current = null;
				setListening(false);
			};
			rec.onend = () => {
				ref.current = null;
				setListening(false);
			};
			ref.current = rec;
			rec.start();
			setListening(true);
			return true;
		}, []),
		stop
	};
}
/** Strip markdown so spoken output doesn't read symbols aloud. */
function speakableText(markdown) {
	return markdown.replace(/```[\s\S]*?```/g, " code block. ").replace(/`([^`]+)`/g, "$1").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[#>*_~|]/g, "").replace(/\$\$?[^$]*\$\$?/g, " formula ").replace(/\s+/g, " ").trim();
}
var tts = {
	supported: () => typeof window !== "undefined" && "speechSynthesis" in window,
	speak(text, onEnd) {
		if (!this.supported()) return false;
		window.speechSynthesis.cancel();
		const u = new SpeechSynthesisUtterance(speakableText(text).slice(0, 4e3));
		u.rate = 1.02;
		u.onend = () => onEnd?.();
		u.onerror = () => onEnd?.();
		window.speechSynthesis.speak(u);
		return true;
	},
	stop() {
		if (this.supported()) window.speechSynthesis.cancel();
	}
};
//#endregion
//#region src/lib/star/i18n.ts
var fa = {
	"Settings": "تنظیمات",
	"Done": "انجام شد",
	"General": "عمومی",
	"Language": "زبان",
	"Appearance": "ظاهر",
	"AI": "هوش مصنوعی",
	"Memory": "حافظه",
	"Privacy": "حریم خصوصی",
	"Notifications": "اعلان‌ها",
	"Shortcuts": "میانبرها",
	"About": "درباره برنامه",
	"Interface language": "زبان رابط کاربری",
	"Choose the language used throughout the app": "زبان مورد استفاده در تمام بخش‌های برنامه را انتخاب کنید",
	"New chat": "گفتگوی جدید",
	"Search conversations": "جستجوی گفتگوها",
	"Most recent": "جدیدترین",
	"Oldest first": "قدیمی‌ترین",
	"AI platform": "پلتفرم هوش مصنوعی",
	"Available": "در دسترس",
	"Coming soon": "به‌زودی",
	"Help": "راهنما",
	"Profile": "حساب کاربری",
	"Close": "بستن",
	"No conversations yet.": "هنوز گفتگویی وجود ندارد.",
	"No conversations match your search.": "گفتگویی با جستجوی شما مطابقت ندارد.",
	"Empty folder": "پوشه خالی",
	"No folder": "بدون پوشه",
	"Folder name": "نام پوشه",
	"Rename conversation": "تغییر نام گفتگو",
	"Rename": "تغییر نام",
	"Delete": "حذف",
	"Pin": "سنجاق‌کردن",
	"Unpin": "برداشتن سنجاق",
	"Move to folder": "انتقال به پوشه",
	"New folder": "پوشه جدید",
	"Message Star-AI": "پیام به Star-AI",
	"Attach file": "پیوست فایل",
	"Stop generating": "توقف تولید پاسخ",
	"Send message": "ارسال پیام",
	"Stop voice input": "توقف ورودی صوتی",
	"Start voice input": "شروع ورودی صوتی",
	"Listening…": "در حال گوش‌دادن…",
	"Web": "وب",
	"Advanced Mode": "حالت پیشرفته",
	"Star-AI can make mistakes. Verify important information.": "Star-AI ممکن است اشتباه کند. اطلاعات مهم را بررسی کنید.",
	"Your message is too long. Please shorten it.": "پیام شما بیش از حد طولانی است. لطفاً آن را کوتاه‌تر کنید.",
	"Color mode": "حالت رنگ",
	"Background intensity": "شدت پس‌زمینه",
	"Animations": "پویانمایی‌ها",
	"Blur": "محو‌شدگی (Blur)",
	"Enable background blur effects": "فعال‌سازی محوشدگی پس‌زمینه‌ها",
	"Liquid Glass": "شیشه مایع (Liquid Glass)",
	"Enable translucent liquid glass surfaces": "فعال‌سازی ظاهر شیشه‌ای و شفاف",
	"Particle effects": "جلوه‌های ذره‌ای",
	"Send with Enter": "ارسال با Enter",
	"Shift + Enter adds a new line": "Shift + Enter خط جدید ایجاد می‌کند",
	"Always on": "همیشه روشن",
	"AI reply language": "زبان پاسخ هوش مصنوعی",
	"Automatic": "خودکار",
	"Call me by": "دستیار مرا با این نام خطاب کند",
	"What Star-AI should call itself for you": "نامی که Star-AI برای خطاب‌کردن شما استفاده می‌کند",
	"Default version": "نسخه پیش‌فرض",
	"Used when Star-AI starts": "هنگام اجرای Star-AI استفاده می‌شود",
	"Response style": "سبک پاسخ",
	"Web search": "جستجوی وب",
	"Read answers aloud": "خواندن پاسخ‌ها با صدا",
	"Streaming responses": "پاسخ‌دهی جریانی",
	"Enable memory": "فعال‌سازی حافظه",
	"Save": "ذخیره",
	"No saved memories yet.": "هنوز حافظه‌ای ذخیره نشده است.",
	"Attachments": "فایل‌های پیوست",
	"Try an example": "یک نمونه را امتحان کنید",
	"Welcome to Star-AI": "به Star-AI خوش آمدید",
	"Ask anything": "هر چیزی بپرسید",
	"Write": "نوشتن",
	"Translate": "ترجمه",
	"Code": "برنامه‌نویسی",
	"Advanced Reasoning": "استدلال پیشرفته",
	"Code & Debug": "کدنویسی و رفع اشکال",
	"Analyze": "تحلیل",
	"Create": "خلق محتوا",
	"Understand Files": "درک فایل‌ها",
	"Complex Problems": "مسائل پیچیده",
	"Quick answers to everyday questions": "پاسخ سریع به پرسش‌های روزمره",
	"Emails, posts and creative text": "ایمیل، پست و متن خلاقانه",
	"Natural translation between languages": "ترجمه روان میان زبان‌ها",
	"Snippets, fixes and explanations": "قطعه‌کد، اصلاح و توضیح",
	"Data, trends and structured insight": "داده‌ها، روندها و تحلیل ساختاریافته",
	"Long-form and original generation": "تولید محتوای بلند و خلاقانه",
	"PDF, DOCX, CSV, JSON and images": "فایل‌های PDF، DOCX، CSV، JSON و تصاویر",
	"Multi-step thinking on hard problems": "تفکر چندمرحله‌ای برای مسائل دشوار",
	"Architecture, refactors, root-cause fixes": "معماری، بازآرایی و رفع علت اصلی خطا",
	"conversationsStored": "گفتگوهای ذخیره‌شده",
	"savedOnDevice": "روی این دستگاه ذخیره شده‌اند",
	"replyLanguage": "زبان پاسخ هوش مصنوعی",
	"Automatic follows the language you write in": "خودکار؛ مطابق زبانی که با آن می‌نویسید",
	"uiLanguage": "زبان برنامه",
	"Assistant name": "نام دستیار",
	"Applied to the AI system configuration": "در تنظیمات هوش مصنوعی اعمال می‌شود",
	"Default mode": "حالت پیش‌فرض",
	"Task framing applied to new messages": "برای پیام‌های جدید اعمال می‌شود",
	"Requires a search provider key on the server": "به کلید ارائه‌دهنده جستجو روی سرور نیاز دارد",
	"Speak each response when it finishes": "پس از پایان، هر پاسخ خوانده شود",
	"Show text as it is generated": "نمایش متن هم‌زمان با تولید",
	"Model configuration": "پیکربندی مدل",
	"Chosen on the server per version": "برای هر نسخه روی سرور انتخاب می‌شود",
	"Let Star-AI remember useful details": "اجازه دهید Star-AI نکات مفید را به خاطر بسپارد",
	"Clear all memories": "پاک‌کردن همه حافظه‌ها",
	"Cancel": "لغو",
	"English": "English",
	"Spanish": "اسپانیایی",
	"French": "فرانسوی",
	"German": "آلمانی",
	"Portuguese": "پرتغالی",
	"Arabic": "عربی",
	"Hindi": "هندی",
	"Chinese": "چینی",
	"Japanese": "ژاپنی",
	"Dark": "تیره",
	"Light": "روشن",
	"System": "سیستم",
	"Balanced": "متعادل",
	"Concise": "مختصر",
	"Detailed": "با جزئیات",
	"Creative": "خلاقانه",
	"Precise": "دقیق",
	"Coding": "برنامه‌نویسی",
	"Writing": "نگارش",
	"Research": "پژوهش",
	"Star-AI ships in two generations. Switch anytime from the sidebar — the theme, animations and AI configuration all change with it.": "Star-AI در سه نسل ارائه می‌شود. از انتخاب‌گر نسخه، هر زمان نسخه موردنظر را تغییر دهید؛ پوسته، پویانمایی‌ها و تنظیمات هوش مصنوعی نیز تغییر می‌کنند.",
	"Images, PDFs and text-based files (TXT, MD, CSV, JSON) are sent to the AI. Other formats are flagged before sending so nothing fails silently.": "تصاویر، PDF و فایل‌های متنی (TXT، MD، CSV، JSON) برای هوش مصنوعی ارسال می‌شوند. قالب‌های دیگر پیش از ارسال مشخص می‌شوند.",
	"Remember that…": "این مورد را به خاطر بسپار…",
	"Data location": "محل نگهداری داده\\u200cها",
	"Conversations stay in this browser": "گفتگوها در همین مرورگر ذخیره می\\u200cشوند",
	"Local device": "دستگاه محلی",
	"API keys": "کلیدهای API",
	"Never exposed to the browser": "هرگز در مرورگر نمایش داده نمی\\u200cشوند",
	"Server-side only": "فقط در سمت سرور",
	"Completion alerts": "اعلان پایان پاسخ",
	"Notify when a long response finishes": "پس از پایان پاسخ طولانی اعلان بده",
	"Voice input isn’t supported in this browser.": "ورودی صوتی در این مرورگر پشتیبانی نمی\\u200cشود.",
	"Message Star-AI ": "پیام به Star-AI ",
	"Voice input isn't supported in this browser.": "ورودی صوتی در این مرورگر پشتیبانی نمی\\u200cشود.",
	"Auto": "خودکار",
	"Folders": "پوشه\\u200cها",
	"Sort conversations": "مرتب\\u200cسازی گفتگوها",
	"Delete conversation": "حذف گفتگو",
	"Create folder": "ساخت پوشه",
	"You": "شما",
	"Star-AI": "Star-AI",
	"Regenerate": "تولید دوباره",
	"Copy": "کپی",
	"Edit": "ویرایش",
	"Good response": "پاسخ خوب",
	"Bad response": "پاسخ نامناسب",
	"Sources": "منابع",
	"Thinking…": "در حال فکرکردن…",
	"Searching the web…": "در حال جستجو در وب…",
	"Copied": "کپی شد",
	"Copy failed": "کپی انجام نشد",
	"Retry": "تلاش دوباره",
	"Confirm": "تأیید",
	"Loading…": "در حال بارگذاری…",
	"Upload": "بارگذاری",
	"Download": "دانلود",
	"Sign in": "ورود",
	"Sign up": "ثبت\\u200cنام",
	"Email": "ایمیل",
	"Password": "رمز عبور",
	"Forgot password?": "رمز عبور را فراموش کرده\\u200cاید؟",
	"Continue with Google": "ادامه با گوگل",
	"Log out": "خروج",
	"Account": "حساب",
	"Smart AI for everyday tasks": "هوش مصنوعی هوشمند برای کارهای روزمره",
	"Fast, simple and reliable": "سریع، ساده و قابل‌اعتماد",
	"Advanced intelligence for complex tasks": "هوش پیشرفته برای کارهای پیچیده",
	"General conversation": "گفتگوی عمومی",
	"Question answering": "پاسخ به پرسش‌ها",
	"Text generation": "تولید متن",
	"Summarization": "خلاصه‌سازی",
	"Translation": "ترجمه",
	"Coding assistance": "کمک در برنامه‌نویسی",
	"Mathematics": "ریاضیات",
	"Creative writing": "نگارش خلاقانه",
	"Basic reasoning": "استدلال پایه",
	"Advanced reasoning": "استدلال پیشرفته",
	"Complex problem solving": "حل مسائل پیچیده",
	"Debugging": "اشکال‌زدایی",
	"Long-form writing": "نگارش بلند",
	"Creative generation": "تولید خلاقانه",
	"Data analysis": "تحلیل داده",
	"Multi-step reasoning": "استدلال چندمرحله‌ای",
	"File understanding": "درک فایل",
	"Image understanding": "درک تصویر",
	"Conversation memory": "حافظه گفتگو",
	"Context-aware responses": "پاسخ‌های آگاه از زمینه",
	"Friendly": "دوستانه",
	"Professional": "حرفه‌ای",
	"Short": "کوتاه",
	"Clear, neutral, well-rounded": "شفاف، بی‌طرف و متعادل",
	"Imaginative and expressive": "خلاقانه و بیان‌محور",
	"Exact, minimal speculation": "دقیق با حداقل گمانه‌زنی",
	"Warm and conversational": "گرم و محاوره‌ای",
	"Formal business tone": "لحن رسمی و کاری",
	"Tight, to the point": "کوتاه و مستقیم",
	"Thorough and structured": "کامل و ساختاریافته",
	"Your memories are private to your account.": "حافظه‌های شما خصوصی هستند.",
	"فارسی": "فارسی",
	"Open menu": "بازکردن منو",
	"mode": "حالت",
	"Export": "خروجی گرفتن",
	"Clear": "پاک‌کردن",
	"locked": "قفل‌شده",
	"This version is locked": "این نسخه قفل است",
	"is currently locked and will become available in future Star-AI updates.": "در حال حاضر قفل است و در به‌روزرسانی‌های آینده Star-AI در دسترس قرار می‌گیرد.",
	"Edit your message": "ویرایش پیام شما",
	"Send": "ارسال",
	"Copy message": "کپی پیام",
	"Edit message": "ویرایش پیام",
	"Thought process": "روند تفکر",
	"Copy response": "کپی پاسخ",
	"Regenerate response": "تولید دوباره پاسخ",
	"Stop reading aloud": "توقف خواندن با صدا",
	"Read response aloud": "خواندن پاسخ با صدا",
	"Star-AI version": "نسخه Star-AI",
	"Next-generation intelligence": "هوش نسل جدید",
	"Next-Generation Mode": "حالت نسل جدید",
	"Deep Reasoning": "استدلال عمیق",
	"Work through complex problems carefully": "بررسی دقیق مسائل پیچیده و چندمرحله‌ای",
	"Code & Build": "کدنویسی و ساخت",
	"Design, debug and improve software": "طراحی، رفع اشکال و بهبود نرم‌افزار",
	"Analyze Data": "تحلیل داده‌ها",
	"Extract useful patterns and insights": "استخراج الگوها و بینش‌های کاربردی",
	"Work with documents and images": "کار با اسناد و تصاویر",
	"Compare multiple solutions and explain their trade-offs": "مقایسه چند راه‌حل و توضیح مزایا و محدودیت‌های آن‌ها",
	"Debug this program and provide a corrected version": "این برنامه را اشکال‌زدایی و نسخه اصلاح‌شده آن را ارائه کن",
	"Create a detailed plan with risks and fallback steps": "برنامه‌ای دقیق همراه با ریسک‌ها و راهکارهای جایگزین تهیه کن",
	"Modern blue technology": "فناوری آبی مدرن",
	"Advanced blue / purple cosmic": "تم کیهانی آبی و بنفش پیشرفته",
	"Futuristic cyan / blue": "تم آینده‌نگر فیروزه‌ای و آبی",
	"Powerful cosmic energy": "انرژی کیهانی قدرتمند",
	"Futuristic developer / code": "تم آینده‌نگر برنامه‌نویسی و کدنویسی",
	"Premium cosmic": "تم کیهانی ویژه",
	"Flagship deep space": "تم پرچم‌دار اعماق فضا",
	"Available": "در دسترس",
	"Coming soon": "به‌زودی",
	"Try an example": "یک نمونه را امتحان کنید",
	"Advanced Mode": "حالت پیشرفته",
	"General conversation": "گفتگوی عمومی",
	"Question answering": "پاسخ‌گویی به پرسش‌ها",
	"Text generation": "تولید متن",
	"Summarization": "خلاصه‌سازی",
	"Coding and debugging": "کدنویسی و رفع اشکال",
	"Mathematics": "ریاضیات",
	"Long-form writing": "نگارش بلند",
	"Data analysis": "تحلیل داده‌ها",
	"Image understanding": "درک تصویر",
	"File understanding": "درک فایل",
	"Multi-step reasoning": "استدلال چندمرحله‌ای",
	"Context-aware responses": "پاسخ‌های آگاه از زمینه",
	"Smart AI for everyday tasks": "هوش مصنوعی هوشمند برای کارهای روزمره",
	"Fast, simple and reliable": "سریع، ساده و قابل‌اعتماد",
	"Advanced intelligence for complex tasks": "هوش پیشرفته برای کارهای پیچیده",
	"Advanced reasoning": "استدلال پیشرفته",
	"Complex problem solving": "حل مسائل پیچیده",
	"Coding": "برنامه‌نویسی",
	"Debugging": "اشکال‌زدایی",
	"Translation": "ترجمه",
	"Creative writing": "نگارش خلاقانه",
	"Basic reasoning": "استدلال پایه",
	"Emails, posts and creative text": "ایمیل، پست و متن خلاقانه",
	"Quick answers to everyday questions": "پاسخ سریع به پرسش‌های روزمره",
	"Natural translation between languages": "ترجمه روان میان زبان‌ها",
	"Snippets, fixes and explanations": "قطعه‌کد، اصلاح و توضیح",
	"Ask anything": "هر چیزی بپرسید",
	"Emails, posts and creative text": "ایمیل، پست و متن خلاقانه",
	"Write": "نوشتن",
	"Translate": "ترجمه",
	"Code": "برنامه‌نویسی",
	"Summarize the theory of relativity in 5 bullet points": "نظریه نسبیت را در ۵ مورد خلاصه کن",
	"Give me a 20-minute healthy dinner recipe": "یک دستور غذای سالم و سریع برای شام ۲۰ دقیقه‌ای بده",
	"Fix this SQL query and explain the bug": "این پرس‌وجوی SQL را اصلاح کن و خطا را توضیح بده",
	"Prove that the square root of 2 is irrational, step by step": "گام‌به‌گام ثابت کن که ریشه دوم ۲ عددی گنگ است",
	"Compare three caching strategies for a read-heavy API": "سه روش کش‌کردن را برای یک API با درخواست‌های خواندن زیاد مقایسه کن",
	"Turn this messy spec into a prioritized engineering plan": "این مشخصات نامنظم را به یک برنامه مهندسی اولویت‌بندی‌شده تبدیل کن",
	"Next-generation intelligence": "هوش نسل جدید",
	"Help": "راهنما",
	"Star-AI ships in three generations. Switch anytime from the version selector — the theme, animations and AI configuration all change with it.": "Star-AI در سه نسل ارائه می‌شود. هر زمان از انتخاب‌گر نسخه، نسخه موردنظر را انتخاب کنید؛ پوسته، پویانمایی‌ها و تنظیمات هوش مصنوعی نیز متناسب با آن تغییر می‌کنند."
};
function useI18n() {
	const { settings } = useStar();
	const language = settings.uiLanguage ?? "en";
	useEffect(() => {
		document.documentElement.lang = language;
		document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
		document.body.dir = language === "fa" ? "rtl" : "ltr";
	}, [language]);
	useEffect(() => {
		const root = document.documentElement;
		root.dataset.starAnimations = settings.animations ? "on" : "off";
		root.dataset.starBlur = settings.blur ? "on" : "off";
		root.dataset.starLiquidGlass = settings.liquidGlass ? "on" : "off";
	}, [
		settings.animations,
		settings.blur,
		settings.liquidGlass
	]);
	const t = (value) => language === "fa" ? fa[value] ?? value : value;
	return {
		language,
		dir: language === "fa" ? "rtl" : "ltr",
		t
	};
}
//#endregion
//#region src/components/star/Composer.tsx
var MAX_CHARS = 24e3;
var MAX_FILES = 6;
function Composer() {
	const { version, settings, stream, sendMessage, stopGenerating, webSearch, setWebSearch } = useStar();
	const meta = VERSIONS[version];
	const { t, dir } = useI18n();
	const [text, setText] = useState("");
	const [attachments, setAttachments] = useState([]);
	const [uploads, setUploads] = useState([]);
	const [dragging, setDragging] = useState(false);
	const taRef = useRef(null);
	const fileRef = useRef(null);
	const baseText = useRef("");
	const dictation = useDictation(({ transcript, isFinal }) => {
		setText(`${baseText.current}${baseText.current ? " " : ""}${transcript}`.slice(0, MAX_CHARS));
		if (isFinal) baseText.current = `${baseText.current} ${transcript}`.trim();
	});
	useEffect(() => {
		const ta = taRef.current;
		if (!ta) return;
		ta.style.height = "0px";
		ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`;
	}, [text]);
	useEffect(() => {
		if (!stream.busy) taRef.current?.focus();
	}, [stream.busy]);
	const submit = () => {
		if (stream.busy) return;
		if (!text.trim() && attachments.length === 0) return;
		if (text.length > MAX_CHARS) {
			toast.error(t("Your message is too long. Please shorten it."));
			return;
		}
		if (dictation.listening) dictation.stop();
		sendMessage(text, attachments);
		setText("");
		baseText.current = "";
		setAttachments([]);
	};
	const onFiles = async (files) => {
		if (!files) return;
		const list = Array.from(files);
		if (!list.length) return;
		if (attachments.length + list.length > MAX_FILES) {
			toast.error(`You can attach up to ${MAX_FILES} files per message.`);
			return;
		}
		for (const file of list) {
			const tempId = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
			setUploads((u) => [...u, {
				id: tempId,
				name: file.name,
				progress: 0
			}]);
			try {
				const a = await toAttachment(file, (p) => setUploads((u) => u.map((x) => x.id === tempId ? {
					...x,
					progress: p
				} : x)));
				if (a.unsupported) toast.warning(`${a.name} can't be read directly — paste its content instead.`);
				setAttachments((prev) => [...prev, a]);
			} catch (err) {
				if (err instanceof FileTooLargeError) toast.error(`${file.name} is larger than 12 MB.`);
				else if (err instanceof UnreadableFileError) toast.error(`${file.name} could not be read. It may be corrupted or protected.`);
				else toast.error("Your file could not be processed.");
			} finally {
				setUploads((u) => u.filter((x) => x.id !== tempId));
			}
		}
	};
	const toggleMic = () => {
		if (dictation.listening) {
			dictation.stop();
			return;
		}
		baseText.current = text.trim();
		if (!dictation.start()) toast.info(t("Voice input isn't supported in this browser."));
	};
	return /* @__PURE__ */ jsxs("div", {
		dir,
		className: "mx-auto w-full max-w-3xl px-3 pb-4 sm:px-4 sm:pb-6",
		onDragOver: (e) => {
			e.preventDefault();
			setDragging(true);
		},
		onDragLeave: () => setDragging(false),
		onDrop: (e) => {
			e.preventDefault();
			setDragging(false);
			onFiles(e.dataTransfer.files);
		},
		children: [
			(attachments.length > 0 || uploads.length > 0) && /* @__PURE__ */ jsxs("div", {
				className: "mb-2 flex flex-wrap gap-2",
				children: [attachments.map((a) => /* @__PURE__ */ jsxs("div", {
					className: "glass flex items-center gap-2 rounded-xl px-3 py-2 text-xs",
					children: [
						a.dataUrl && a.mimeType.startsWith("image/") ? /* @__PURE__ */ jsx("img", {
							src: a.dataUrl,
							alt: "",
							className: "h-8 w-8 rounded-md object-cover"
						}) : a.kind === "data" ? /* @__PURE__ */ jsx(Sheet, { className: "h-4 w-4 text-accent" }) : a.mimeType.startsWith("image/") ? /* @__PURE__ */ jsx(ImageIcon, { className: "h-4 w-4 text-accent" }) : /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 text-accent" }),
						/* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("p", {
								className: "max-w-40 truncate font-medium",
								children: a.name
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-[10px] text-muted-foreground",
								children: [formatSize(a.size), a.summary ? ` · ${a.summary}` : ""]
							})]
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: () => setAttachments((p) => p.filter((x) => x.id !== a.id)),
							className: "text-muted-foreground hover:text-foreground",
							"aria-label": `Remove ${a.name}`,
							children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
						})
					]
				}, a.id)), uploads.map((u) => /* @__PURE__ */ jsxs("div", {
					className: "glass w-44 rounded-xl px-3 py-2 text-xs",
					children: [/* @__PURE__ */ jsx("p", {
						className: "truncate font-medium",
						children: u.name
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-1.5 h-1 overflow-hidden rounded-full bg-secondary",
						role: "progressbar",
						"aria-valuenow": u.progress,
						"aria-valuemin": 0,
						"aria-valuemax": 100,
						"aria-label": `Processing ${u.name}`,
						children: /* @__PURE__ */ jsx("div", {
							className: "h-full rounded-full bg-brand-gradient transition-all",
							style: { width: `${Math.max(u.progress, 8)}%` }
						})
					})]
				}, u.id))]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: cn("glass rounded-3xl p-2 shadow-glow transition-all duration-500", dragging && "ring-2 ring-primary", dictation.listening && "ring-2 ring-accent"),
				children: [/* @__PURE__ */ jsx("textarea", {
					ref: taRef,
					rows: 1,
					value: text,
					onChange: (e) => setText(e.target.value),
					onPaste: (e) => {
						const files = Array.from(e.clipboardData.files);
						if (files.length) {
							e.preventDefault();
							onFiles(files);
						}
					},
					onKeyDown: (e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							submit();
						}
					},
					"aria-label": t("Message Star-AI"),
					placeholder: dictation.listening ? t("Listening…") : `${t("Message Star-AI")} ${version}…`,
					className: "max-h-60 w-full resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-1 px-1 pb-0.5",
					children: [
						/* @__PURE__ */ jsx("input", {
							ref: fileRef,
							type: "file",
							multiple: true,
							accept: ACCEPTED,
							className: "hidden",
							onChange: (e) => {
								onFiles(e.target.files);
								e.target.value = "";
							}
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: () => fileRef.current?.click(),
							className: "rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
							"aria-label": t("Attach file"),
							children: /* @__PURE__ */ jsx(Paperclip, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: toggleMic,
							className: cn("rounded-full p-2 transition-colors hover:bg-secondary hover:text-foreground", dictation.listening ? "bg-accent/20 text-accent" : "text-muted-foreground"),
							"aria-label": dictation.listening ? t("Stop voice input") : t("Start voice input"),
							"aria-pressed": dictation.listening,
							children: /* @__PURE__ */ jsx(Mic, { className: cn("h-4 w-4", dictation.listening && "animate-pulse") })
						}),
						/* @__PURE__ */ jsxs("button", {
							onClick: () => setWebSearch(!webSearch),
							"aria-pressed": webSearch,
							className: cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition-colors", webSearch ? "border-transparent bg-brand-gradient text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary"),
							children: [/* @__PURE__ */ jsx(Globe, { className: "h-3.5 w-3.5" }), /* @__PURE__ */ jsx("span", {
								className: "hidden sm:inline",
								children: t("Web")
							})]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "ml-1 hidden truncate rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground lg:inline",
							children: [
								meta.badge,
								meta.advanced ? " · Advanced" : "",
								" · ",
								settings.style
							]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: cn("ml-auto mr-1 text-[11px] tabular-nums", text.length > MAX_CHARS ? "text-destructive" : "text-muted-foreground"),
							children: [
								text.length,
								"/",
								MAX_CHARS
							]
						}),
						stream.busy ? /* @__PURE__ */ jsx("button", {
							onClick: stopGenerating,
							className: "flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground transition-transform hover:scale-105",
							"aria-label": t("Stop generating"),
							children: /* @__PURE__ */ jsx(Square, { className: "h-3.5 w-3.5 fill-current" })
						}) : /* @__PURE__ */ jsx("button", {
							onClick: submit,
							disabled: !text.trim() && attachments.length === 0,
							className: "flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-soft transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100",
							"aria-label": t("Send message"),
							children: /* @__PURE__ */ jsx(ArrowUp, { className: "h-4 w-4" })
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2 text-center text-[11px] text-muted-foreground",
				children: "Star-AI can make mistakes. Verify important information."
			})
		]
	});
}
//#endregion
//#region src/lib/star/export.ts
function download(filename, content, mime = "text/plain;charset=utf-8") {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function slug(s) {
	return s.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "chat";
}
function toMarkdown(c) {
	const lines = [
		`# ${c.title}`,
		"",
		`_Star-AI ${c.version} · ${new Date(c.createdAt).toLocaleString()}_`,
		""
	];
	for (const m of c.messages) {
		lines.push(`## ${m.role === "user" ? "You" : `Star-AI ${m.version}`}`, "", m.content, "");
		if (m.sources?.length) {
			lines.push("**Sources**", "");
			m.sources.forEach((s, i) => lines.push(`${i + 1}. [${s.title}](${s.url})`));
			lines.push("");
		}
	}
	return lines.join("\n");
}
function toPlainText(c) {
	return c.messages.map((m) => `${m.role === "user" ? "You" : `Star-AI ${m.version}`}:\n${m.content}`).join("\n\n---\n\n");
}
function exportConversation(c, format) {
	const name = slug(c.title);
	if (format === "md") return download(`${name}.md`, toMarkdown(c), "text/markdown;charset=utf-8");
	if (format === "txt") return download(`${name}.txt`, toPlainText(c));
	if (format === "json") return download(`${name}.json`, JSON.stringify(c, null, 2), "application/json");
	const win = window.open("", "_blank", "width=820,height=900");
	if (!win) return;
	const esc = (s) => s.replace(/[&<>]/g, (ch) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;"
	})[ch] ?? ch);
	win.document.write(`<!doctype html><html><head><title>${esc(c.title)}</title>
<style>body{font:14px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#111}
h1{font-size:22px} .who{font-weight:600;margin-top:22px;color:#4338ca} pre{white-space:pre-wrap;background:#f4f4f5;padding:12px;border-radius:8px}
.msg{white-space:pre-wrap}</style></head><body>
<h1>${esc(c.title)}</h1><p>Star-AI ${c.version} — ${new Date(c.createdAt).toLocaleString()}</p>
${c.messages.map((m) => `<div class="who">${m.role === "user" ? "You" : `Star-AI ${m.version}`}</div><div class="msg">${esc(m.content)}</div>`).join("")}
</body></html>`);
	win.document.close();
	win.focus();
	win.print();
}
//#endregion
//#region src/components/star/Markdown.tsx
var EXT = {
	javascript: "js",
	typescript: "ts",
	tsx: "tsx",
	jsx: "jsx",
	python: "py",
	bash: "sh",
	shell: "sh",
	html: "html",
	css: "css",
	json: "json",
	sql: "sql",
	java: "java",
	csharp: "cs",
	cpp: "cpp",
	c: "c",
	go: "go",
	rust: "rs",
	php: "php",
	yaml: "yml",
	markdown: "md"
};
function textOf(node) {
	if (node == null || typeof node === "boolean") return "";
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(textOf).join("");
	const el = node;
	return el.props ? textOf(el.props.children) : "";
}
function CodeBlock({ children }) {
	const [copied, setCopied] = useState(false);
	const code = textOf(children);
	const lang = children?.props?.className?.match(/language-([\w+-]+)/)?.[1] ?? "code";
	const lines = code.trimEnd().split("\n").length;
	return /* @__PURE__ */ jsxs("div", {
		className: "group relative my-3 overflow-hidden rounded-xl border border-border bg-black/35",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between border-b border-border/70 px-3 py-1.5",
			children: [/* @__PURE__ */ jsxs("span", {
				className: "font-mono text-[11px] uppercase tracking-wider text-muted-foreground",
				children: [
					lang,
					" · ",
					lines,
					" ",
					lines === 1 ? "line" : "lines"
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => download(`star-ai-snippet.${EXT[lang] ?? "txt"}`, code),
					className: "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
					"aria-label": "Download code",
					children: [/* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }), " Download"]
				}), /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => {
						navigator.clipboard.writeText(code);
						setCopied(true);
						window.setTimeout(() => setCopied(false), 1600);
					},
					className: "flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
					children: [copied ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3 w-3" }), copied ? "Copied" : "Copy"]
				})]
			})]
		}), /* @__PURE__ */ jsx("pre", { children })]
	});
}
var Markdown = memo(function Markdown({ content }) {
	return /* @__PURE__ */ jsx("div", {
		className: "md-body",
		children: /* @__PURE__ */ jsx(ReactMarkdown, {
			remarkPlugins: [remarkGfm, remarkMath],
			rehypePlugins: [[rehypeHighlight, {
				detect: true,
				ignoreMissing: true
			}], [rehypeKatex, {
				throwOnError: false,
				output: "html"
			}]],
			components: {
				pre: ({ children }) => /* @__PURE__ */ jsx(CodeBlock, { children }),
				a: ({ children, ...props }) => /* @__PURE__ */ jsx("a", {
					...props,
					target: "_blank",
					rel: "noreferrer noopener",
					children
				})
			},
			children: content
		})
	});
});
//#endregion
//#region src/components/star/ThinkingIndicator.tsx
function ThinkingIndicator({ label }) {
	const { version } = useStar();
	const advanced = version === "3.0";
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-3",
		children: [/* @__PURE__ */ jsxs("span", {
			className: "relative flex h-8 w-8 items-center justify-center",
			children: [advanced && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
				className: "absolute inset-0 rounded-full border border-primary/50",
				style: { animation: "orbit-spin 2.4s linear infinite" }
			}), /* @__PURE__ */ jsx("span", {
				className: "absolute inset-1 rounded-full border border-accent/60 border-dashed",
				style: { animation: "orbit-spin 3.6s linear infinite reverse" }
			})] }), /* @__PURE__ */ jsx(StarLogo, { className: "h-5 w-5 text-primary" })]
		}), /* @__PURE__ */ jsx("span", {
			className: "thinking-shimmer text-sm font-medium",
			children: label ?? (advanced ? "Reasoning through this…" : "Thinking…")
		})]
	});
}
//#endregion
//#region src/components/star/MessageItem.tsx
function time(ts) {
	return new Date(ts).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function AttachmentIcon({ a }) {
	if (a.kind === "image" || a.mimeType.startsWith("image/")) return /* @__PURE__ */ jsx(ImageIcon, { className: "h-3.5 w-3.5 text-accent" });
	if (a.kind === "data") return /* @__PURE__ */ jsx(Sheet, { className: "h-3.5 w-3.5 text-accent" });
	return /* @__PURE__ */ jsx(FileText, { className: "h-3.5 w-3.5 text-accent" });
}
function MessageItem({ message, streaming, onRegenerate, onEdit, autoSpeak = false }) {
	const { t, dir } = useI18n();
	const [copied, setCopied] = useState(false);
	const [editing, setEditing] = useState(false);
	const [speaking, setSpeaking] = useState(false);
	const [draft, setDraft] = useState(message.content);
	const isUser = message.role === "user";
	const copy = () => {
		navigator.clipboard.writeText(message.content);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1600);
	};
	const toggleSpeak = () => {
		if (speaking) {
			tts.stop();
			setSpeaking(false);
			return;
		}
		if (tts.speak(message.content, () => setSpeaking(false))) setSpeaking(true);
	};
	useEffect(() => {
		if (!autoSpeak || isUser || streaming || !message.content.trim() || message.error) return;
		if (tts.speak(message.content, () => setSpeaking(false))) setSpeaking(true);
		return () => tts.stop();
	}, [streaming]);
	if (isUser) return /* @__PURE__ */ jsxs("div", {
		dir,
		className: "group flex flex-col items-end gap-1.5",
		children: [
			!!message.attachments?.length && /* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap justify-end gap-2",
				children: message.attachments.map((a) => /* @__PURE__ */ jsxs("div", {
					className: "glass flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs",
					children: [
						/* @__PURE__ */ jsx(AttachmentIcon, { a }),
						/* @__PURE__ */ jsx("span", {
							className: "max-w-40 truncate",
							children: a.name
						}),
						a.summary && /* @__PURE__ */ jsx("span", {
							className: "hidden text-[10px] text-muted-foreground sm:inline",
							children: a.summary
						})
					]
				}, a.id))
			}),
			editing ? /* @__PURE__ */ jsxs("div", {
				className: "glass w-full max-w-2xl rounded-2xl p-3",
				children: [/* @__PURE__ */ jsx("textarea", {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					rows: 3,
					"aria-label": t("Edit your message"),
					className: "w-full resize-none bg-transparent text-sm outline-none"
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-2 flex justify-end gap-2 text-xs",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => {
							setEditing(false);
							setDraft(message.content);
						},
						className: "rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground",
						children: "Cancel"
					}), /* @__PURE__ */ jsx("button", {
						onClick: () => {
							setEditing(false);
							onEdit(draft);
						},
						className: "rounded-lg bg-brand-gradient px-3 py-1.5 font-medium text-primary-foreground",
						children: "Send"
					})]
				})]
			}) : /* @__PURE__ */ jsx("div", {
				className: "max-w-[85%] rounded-2xl rounded-br-md bg-brand-gradient px-4 py-2.5 text-sm text-primary-foreground shadow-soft",
				children: /* @__PURE__ */ jsx("p", {
					className: "whitespace-pre-wrap",
					children: message.content
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 text-[11px] text-muted-foreground opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100",
				children: [
					/* @__PURE__ */ jsx("span", { children: time(message.createdAt) }),
					/* @__PURE__ */ jsx("button", {
						onClick: copy,
						className: "hover:text-foreground",
						"aria-label": t("Copy message"),
						children: copied ? /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" })
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => setEditing((e) => !e),
						className: "hover:text-foreground",
						"aria-label": t("Edit message"),
						children: editing ? /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" })
					})
				]
			})
		]
	});
	const empty = !message.content.trim();
	return /* @__PURE__ */ jsxs("div", {
		dir,
		className: "group flex flex-col gap-2",
		children: [
			message.reasoning && /* @__PURE__ */ jsxs("details", {
				className: "glass rounded-xl px-3 py-2 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ jsx("summary", {
					className: "cursor-pointer select-none font-medium",
					children: t("Thought process")
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-2 whitespace-pre-wrap",
					children: message.reasoning
				})]
			}),
			message.notice && /* @__PURE__ */ jsxs("p", {
				className: "flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ jsx(Info, { className: "h-3.5 w-3.5" }),
					" ",
					message.notice
				]
			}),
			message.error ? /* @__PURE__ */ jsxs("div", {
				className: "flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm",
				children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0 text-destructive" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", { children: message.error }), /* @__PURE__ */ jsxs("button", {
					onClick: onRegenerate,
					className: "mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-secondary",
					children: [/* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3" }), " Retry"]
				})] })]
			}) : empty && streaming ? /* @__PURE__ */ jsx(ThinkingIndicator, {}) : /* @__PURE__ */ jsx("div", {
				className: "max-w-full text-sm",
				children: /* @__PURE__ */ jsx(Markdown, { content: message.content })
			}),
			!!message.sources?.length && /* @__PURE__ */ jsxs("div", {
				className: "glass rounded-2xl p-3",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
					children: [/* @__PURE__ */ jsx(Globe, { className: "h-3.5 w-3.5" }), " Sources"]
				}), /* @__PURE__ */ jsx("ol", {
					className: "grid gap-2 sm:grid-cols-2",
					children: message.sources.map((s, i) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", {
						href: s.url,
						target: "_blank",
						rel: "noreferrer noopener",
						className: "block rounded-xl border border-border px-3 py-2 transition-colors hover:bg-secondary",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1.5 text-xs font-medium",
							children: [
								/* @__PURE__ */ jsxs("span", {
									className: "text-muted-foreground",
									children: [
										"[",
										i + 1,
										"]"
									]
								}),
								/* @__PURE__ */ jsx("span", {
									className: "truncate",
									children: s.title
								}),
								/* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 shrink-0 text-muted-foreground" })
							]
						}), /* @__PURE__ */ jsx("span", {
							className: "mt-0.5 block truncate text-[10px] text-muted-foreground",
							children: s.domain
						})]
					}) }, s.url))
				})]
			}),
			!streaming && !message.error && !empty && /* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 text-[11px] text-muted-foreground opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100",
				children: [
					/* @__PURE__ */ jsx("span", { children: time(message.createdAt) }),
					/* @__PURE__ */ jsxs("span", {
						className: cn("rounded-full border border-border px-1.5 py-0.5"),
						children: ["Star-AI ", message.version]
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: copy,
						className: "hover:text-foreground",
						"aria-label": t("Copy response"),
						children: copied ? /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" })
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: onRegenerate,
						className: "hover:text-foreground",
						"aria-label": t("Regenerate response"),
						children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5" })
					}),
					tts.supported() && /* @__PURE__ */ jsx("button", {
						onClick: toggleSpeak,
						className: "hover:text-foreground",
						"aria-label": speaking ? t("Stop reading aloud") : t("Read response aloud"),
						children: speaking ? /* @__PURE__ */ jsx(Square, { className: "h-3.5 w-3.5 fill-current" }) : /* @__PURE__ */ jsx(Volume2, { className: "h-3.5 w-3.5" })
					})
				]
			})
		]
	});
}
//#endregion
//#region src/components/star/WelcomeScreen.tsx
var ICONS = {
	sparkle: Sparkle,
	pen: PenLine,
	languages: Languages,
	code: Code2,
	brain: Brain,
	bug: Bug,
	chart: ChartNoAxesColumn,
	wand: Wand2,
	file: FileText,
	orbit: Orbit
};
function WelcomeScreen() {
	const { version, sendMessage } = useStar();
	const { displayName } = useAuth();
	const meta = VERSIONS[version];
	const { t, dir, language } = useI18n();
	return /* @__PURE__ */ jsxs("div", {
		dir,
		className: "version-morph mx-auto w-full max-w-4xl px-4 py-10 sm:py-16",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center text-center",
				children: [
					/* @__PURE__ */ jsx(StarLogo, { className: "h-14 w-14 text-primary drop-shadow-[0_0_18px_var(--glow)]" }),
					displayName ? /* @__PURE__ */ jsxs("div", {
						dir,
						className: "mt-5",
						children: [/* @__PURE__ */ jsxs("p", {
							className: "text-lg font-semibold sm:text-xl",
							children: [language === "fa" ? `سلام ${displayName}` : `Hello ${displayName}`, " 👋"]
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: language === "fa" ? "امروز چطور می‌تونم کمکت کنم؟" : "How can I help you today?"
						})]
					}) : /* @__PURE__ */ jsx("p", {
						className: "mt-5 text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground",
						children: t("Welcome to Star-AI")
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-2 text-4xl font-semibold sm:text-5xl",
						children: /* @__PURE__ */ jsx("span", {
							className: "text-brand-gradient",
							children: meta.name
						})
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-3 max-w-xl text-sm text-muted-foreground sm:text-base",
						children: t(meta.subtitle)
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4 flex flex-wrap items-center justify-center gap-2 text-xs",
						children: [/* @__PURE__ */ jsx("span", {
							className: "glass rounded-full px-3 py-1 font-medium",
							children: t(meta.badge)
						}), meta.advanced && /* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1 rounded-full bg-brand-gradient px-3 py-1 font-semibold text-primary-foreground shadow-glow",
							children: [
								/* @__PURE__ */ jsx(Zap, { className: "h-3 w-3" }),
								" ",
								t("Advanced Mode")
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: meta.cards.map((card) => {
					const Icon = ICONS[card.icon] ?? Sparkle;
					return /* @__PURE__ */ jsxs("button", {
						onClick: () => void sendMessage(card.prompt),
						dir,
						className: "glass group rounded-2xl p-4 text-start transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground",
								children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ jsx("h3", {
								className: "mt-3 text-sm font-semibold",
								children: t(card.title)
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: t(card.description)
							})
						]
					}, card.title);
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-8",
				children: [/* @__PURE__ */ jsx("p", {
					className: "mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground",
					children: t("Try an example")
				}), /* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap gap-2",
					children: meta.examples.map((ex) => /* @__PURE__ */ jsx("button", {
						onClick: () => void sendMessage(ex),
						className: "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
						children: t(ex)
					}, ex))
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-8 flex flex-wrap justify-center gap-1.5",
				children: meta.capabilities.map((c) => /* @__PURE__ */ jsx("span", {
					className: "rounded-full bg-secondary/60 px-2.5 py-1 text-[11px] text-muted-foreground",
					children: t(c)
				}, c))
			})
		]
	}, version);
}
//#endregion
//#region src/components/star/LockedVersionDialog.tsx
/**
* Locked-version screen. Purely presentational — it never activates a
* version and never triggers an AI request.
*/
function LockedVersionDialog({ version, onClose }) {
	const { t, dir } = useI18n();
	if (!version) return null;
	return /* @__PURE__ */ jsx("div", {
		role: "dialog",
		"aria-modal": "true",
		dir,
		"aria-label": `${t(version.name)} ${t("locked")} `,
		className: "fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm",
		onClick: onClose,
		children: /* @__PURE__ */ jsxs("div", {
			onClick: (e) => e.stopPropagation(),
			className: "glass w-full max-w-sm rounded-3xl p-7 text-center shadow-glow",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border",
					style: { background: `radial-gradient(circle, color-mix(in oklab, ${version.swatch[0]} 35%, transparent), transparent 70%)` },
					children: /* @__PURE__ */ jsx(Lock, { className: "h-7 w-7 text-primary" })
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-4 text-2xl",
					"aria-hidden": true,
					children: "🔒"
				}),
				/* @__PURE__ */ jsx("h2", {
					dir: "rtl",
					className: "mt-2 font-display text-lg font-semibold",
					children: t("This version is locked")
				}),
				/* @__PURE__ */ jsxs("p", {
					dir: "rtl",
					className: "mt-3 text-sm leading-7 text-muted-foreground",
					children: [
						t(version.name),
						" ",
						t("is currently locked and will become available in future Star-AI updates.")
					]
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: onClose,
					autoFocus: true,
					className: "mt-6 w-full rounded-2xl bg-brand-gradient py-2.5 text-sm font-semibold text-primary-foreground shadow-glow",
					children: t("Close")
				})
			]
		})
	});
}
//#endregion
//#region src/components/star/VersionMenu.tsx
function VersionMenu() {
	const { version, setVersion } = useStar();
	const { t, dir } = useI18n();
	const [open, setOpen] = useState(false);
	const [locked, setLocked] = useState(null);
	const rootRef = useRef(null);
	const current = VERSION_CATALOG.find((item) => item.id === version) ?? VERSION_CATALOG[0];
	useEffect(() => {
		const onPointerDown = (event) => {
			if (!rootRef.current?.contains(event.target)) setOpen(false);
		};
		const onKeyDown = (event) => {
			if (event.key === "Escape") setOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		ref: rootRef,
		dir,
		className: "relative",
		children: [
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => setOpen((value) => !value),
				"aria-haspopup": "listbox",
				"aria-expanded": open,
				className: "flex max-w-[170px] items-center gap-1.5 rounded-full border border-border/80 bg-background/35 px-2.5 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-accent/50 hover:bg-secondary/80 active:scale-[0.96]",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "h-2.5 w-2.5 shrink-0 rounded-full border border-white/20",
						style: { background: `linear-gradient(135deg, ${current.swatch[0]}, ${current.swatch[1]})` }
					}),
					/* @__PURE__ */ jsx("span", {
						className: "truncate",
						children: t(current.name)
					}),
					/* @__PURE__ */ jsx(ChevronDown, { className: cn("h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180") })
				]
			}),
			open && /* @__PURE__ */ jsxs("div", {
				role: "listbox",
				"aria-label": t("Star-AI version"),
				className: "glass absolute right-0 top-full z-50 mt-2 max-h-[min(65vh,390px)] w-[min(270px,calc(100vw-32px))] overflow-y-auto rounded-[1.35rem] border border-white/15 p-1.5 shadow-glow animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "px-2.5 pb-1 pt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
						children: t("Available")
					}),
					VERSION_CATALOG.filter((item) => item.enabled).map((item) => {
						const selected = item.id === version;
						return /* @__PURE__ */ jsxs("button", {
							type: "button",
							role: "option",
							"aria-selected": selected,
							onClick: () => {
								if (isRuntimeVersion(item.id)) setVersion(item.id);
								setOpen(false);
							},
							className: cn("flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-start transition-all duration-200 hover:bg-secondary/80 active:scale-[0.99]", selected && "bg-brand-gradient text-primary-foreground shadow-glow"),
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "shrink-0",
									children: item.emoji
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ jsx("span", {
										className: "block truncate text-xs font-semibold",
										children: t(item.name)
									}), /* @__PURE__ */ jsx("span", {
										className: "block truncate text-[10px] opacity-70",
										children: t(item.subtitle)
									})]
								}),
								selected && /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5 shrink-0" })
							]
						}, item.id);
					}),
					/* @__PURE__ */ jsx("p", {
						className: "px-2.5 pb-1 pt-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
						children: t("Coming soon")
					}),
					VERSION_CATALOG.filter((item) => !item.enabled).map((item) => /* @__PURE__ */ jsxs("button", {
						type: "button",
						role: "option",
						"aria-selected": false,
						onClick: () => {
							setOpen(false);
							setLocked(item);
						},
						className: "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-start text-muted-foreground/85 transition-all duration-200 hover:bg-secondary/70 hover:text-foreground active:scale-[0.99]",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "shrink-0",
								children: item.emoji
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ jsx("span", {
									className: "block truncate text-xs font-medium",
									children: t(item.name)
								}), /* @__PURE__ */ jsx("span", {
									className: "block truncate text-[10px] opacity-70",
									children: t(item.subtitle)
								})]
							}),
							/* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5 shrink-0" })
						]
					}, item.id))
				]
			}),
			/* @__PURE__ */ jsx(LockedVersionDialog, {
				version: locked,
				onClose: () => setLocked(null)
			})
		]
	});
}
//#endregion
//#region src/lib/ai/modes.ts
var AI_MODES = [
	{
		id: "general",
		label: "General",
		icon: "sparkle",
		hint: "Everyday assistance"
	},
	{
		id: "coding",
		label: "Coding",
		icon: "code",
		hint: "Write, debug and refactor code"
	},
	{
		id: "writing",
		label: "Writing",
		icon: "pen",
		hint: "Drafting and editing"
	},
	{
		id: "research",
		label: "Research",
		icon: "search",
		hint: "Structured, sourced answers"
	},
	{
		id: "math",
		label: "Math",
		icon: "sigma",
		hint: "Step-by-step problem solving"
	},
	{
		id: "data",
		label: "Data Analysis",
		icon: "chart",
		hint: "Datasets, stats and insight"
	},
	{
		id: "creative",
		label: "Creative",
		icon: "wand",
		hint: "Ideas and original writing"
	},
	{
		id: "study",
		label: "Study",
		icon: "book",
		hint: "Explain and quiz me"
	}
];
var MODE_MAP = Object.fromEntries(AI_MODES.map((m) => [m.id, m]));
//#endregion
//#region src/components/star/ChatView.tsx
function ChatView({ onOpenSidebar }) {
	const { active, version, stream, settings, regenerate, editMessage, clearConversation } = useStar();
	const meta = VERSIONS[version];
	const { t, dir } = useI18n();
	const bottomRef = useRef(null);
	const [exportOpen, setExportOpen] = useState(false);
	useEffect(() => {
		bottomRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "end"
		});
	}, [active?.messages.length, active?.messages[active.messages.length - 1]?.content]);
	return /* @__PURE__ */ jsxs("div", {
		dir,
		className: "flex h-full min-w-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "flex items-center gap-2 px-3 py-3 sm:px-5",
				children: [
					/* @__PURE__ */ jsx("button", {
						onClick: onOpenSidebar,
						className: "glass rounded-xl p-2 md:hidden",
						"aria-label": t("Open menu"),
						children: /* @__PURE__ */ jsx(Menu, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ jsx(VersionMenu, {}),
					/* @__PURE__ */ jsx(StarLogo, {
						className: "hidden h-6 w-6 text-primary md:block",
						animated: false
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsx("h1", {
							className: "truncate font-display text-sm font-semibold",
							children: active?.title ?? meta.name
						}), /* @__PURE__ */ jsxs("p", {
							className: "truncate text-[11px] text-muted-foreground",
							children: [
								stream.busy && stream.status ? stream.status : t(meta.subtitle),
								" · ",
								t(MODE_MAP[settings.mode].label),
								" ",
								t("mode")
							]
						})]
					}),
					meta.advanced && /* @__PURE__ */ jsxs("span", {
						className: "ml-2 hidden items-center gap-1 rounded-full bg-brand-gradient px-2.5 py-1 text-[11px] font-semibold text-primary-foreground sm:flex",
						children: [
							/* @__PURE__ */ jsx(Zap, { className: "h-3 w-3" }),
							" ",
							t("Advanced Mode")
						]
					}),
					active && active.messages.length > 0 && /* @__PURE__ */ jsxs("div", {
						className: "relative ml-auto flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ jsxs("button", {
								onClick: () => setExportOpen((o) => !o),
								"aria-haspopup": "menu",
								"aria-expanded": exportOpen,
								className: "flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground",
								children: [
									/* @__PURE__ */ jsx(Download, { className: "h-3 w-3" }),
									" ",
									t("Export")
								]
							}),
							exportOpen && /* @__PURE__ */ jsx("div", {
								role: "menu",
								className: "glass absolute right-0 top-full z-30 mt-2 w-40 rounded-2xl p-1 text-xs shadow-glow",
								onMouseLeave: () => setExportOpen(false),
								children: [
									"md",
									"txt",
									"json",
									"pdf"
								].map((f) => /* @__PURE__ */ jsx("button", {
									role: "menuitem",
									onClick: () => {
										exportConversation(active, f);
										setExportOpen(false);
									},
									className: "block w-full rounded-xl px-3 py-2 text-start hover:bg-secondary",
									children: f === "md" ? "Markdown (.md)" : f === "txt" ? "Plain text (.txt)" : f === "json" ? "JSON (.json)" : "PDF / print"
								}, f))
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: () => clearConversation(active.id),
								className: "flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground",
								children: [
									/* @__PURE__ */ jsx(Eraser, { className: "h-3 w-3" }),
									" ",
									t("Clear")
								]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "scrollbar-thin flex-1 overflow-y-auto",
				role: "log",
				"aria-live": "polite",
				children: !active || active.messages.length === 0 ? /* @__PURE__ */ jsx(WelcomeScreen, {}) : /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6",
					children: [active.messages.map((m, i) => /* @__PURE__ */ jsx(MessageItem, {
						message: m,
						streaming: stream.busy && i === active.messages.length - 1,
						autoSpeak: settings.autoSpeak,
						onRegenerate: () => void regenerate(),
						onEdit: (text) => void editMessage(m.id, text)
					}, m.id)), /* @__PURE__ */ jsx("div", { ref: bottomRef })]
				})
			}),
			/* @__PURE__ */ jsx(AdBanner, { className: "shrink-0" }),
			/* @__PURE__ */ jsx(Composer, {})
		]
	});
}
//#endregion
//#region src/components/star/HelpDialog.tsx
function HelpDialog({ open, onClose }) {
	const { t, dir } = useI18n();
	if (!open) return null;
	return /* @__PURE__ */ jsx("div", {
		dir,
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm",
		children: /* @__PURE__ */ jsxs("div", {
			className: "glass scrollbar-thin max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 shadow-glow",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "font-display text-lg font-semibold",
					children: t("Help")
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: t("Star-AI ships in two generations. Switch anytime from the sidebar — the theme, animations and AI configuration all change with it.")
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-5 space-y-4",
					children: VERSION_LIST.map((v) => /* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl border border-border p-4",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "text-sm font-semibold text-brand-gradient",
								children: v.name
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: t(v.subtitle)
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-2 flex flex-wrap gap-1.5",
								children: v.capabilities.map((c) => /* @__PURE__ */ jsx("span", {
									className: "rounded-full bg-secondary/60 px-2 py-0.5 text-[10px]",
									children: c
								}, c))
							})
						]
					}, v.id))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ jsx("p", {
						className: "font-medium text-foreground",
						children: t("Attachments")
					}), /* @__PURE__ */ jsx("p", { children: t("Images, PDFs and text-based files (TXT, MD, CSV, JSON) are sent to the AI. Other formats are flagged before sending so nothing fails silently.") })]
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: onClose,
					className: "mt-6 w-full rounded-2xl bg-brand-gradient py-2.5 text-sm font-semibold text-primary-foreground",
					children: t("Close")
				})
			]
		})
	});
}
//#endregion
//#region src/components/star/ProfileDialog.tsx
var field = "w-full rounded-xl border border-input bg-background/60 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-60";
function ProfileDialog({ open, onClose }) {
	const { user, profile, displayName, updateDisplayName, signOut } = useAuth();
	const [name, setName] = useState(displayName);
	const [busy, setBusy] = useState(false);
	useEffect(() => {
		if (open) setName(displayName);
	}, [open, displayName]);
	if (!open) return null;
	const save = async () => {
		setBusy(true);
		const { error } = await updateDisplayName(name);
		setBusy(false);
		if (error) {
			toast.error(error);
			return;
		}
		toast.success("نام نمایشی ذخیره شد.");
		onClose();
	};
	const created = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fa-IR") : "—";
	const provider = profile?.provider === "google" ? "Google" : "ایمیل و رمز عبور";
	return /* @__PURE__ */ jsxs("div", {
		dir: "rtl",
		className: "fixed inset-0 z-50 flex items-center justify-center px-4",
		children: [/* @__PURE__ */ jsx("div", {
			className: "absolute inset-0 bg-black/60",
			onClick: onClose
		}), /* @__PURE__ */ jsxs("div", {
			className: "glass relative w-full max-w-md rounded-3xl p-6 shadow-glow",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-base font-semibold",
						children: "ویرایش پروفایل"
					}), /* @__PURE__ */ jsx("button", {
						onClick: onClose,
						"aria-label": "بستن",
						className: "rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground",
						children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5 space-y-3",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "mb-1 block text-xs text-muted-foreground",
							children: "نام نمایشی"
						}), /* @__PURE__ */ jsx("input", {
							value: name,
							onChange: (e) => setName(e.target.value),
							"aria-label": "نام نمایشی",
							className: field
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
							className: "mb-1 block text-xs text-muted-foreground",
							children: "ایمیل"
						}), /* @__PURE__ */ jsx("input", {
							value: user?.email ?? "",
							dir: "ltr",
							disabled: true,
							className: field
						})] }),
						/* @__PURE__ */ jsxs("div", {
							className: "grid grid-cols-2 gap-3 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ jsxs("p", { children: ["روش ورود: ", provider] }), /* @__PURE__ */ jsxs("p", { children: ["تاریخ ساخت حساب: ", created] })]
						})
					]
				}),
				/* @__PURE__ */ jsxs("button", {
					onClick: () => void save(),
					disabled: busy,
					className: "mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60",
					children: [busy && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }), " ذخیره تغییرات"]
				}),
				/* @__PURE__ */ jsxs("button", {
					onClick: () => void signOut(),
					className: "mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-input px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
					children: [/* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }), " خروج از حساب"]
				})
			]
		})]
	});
}
//#endregion
//#region src/components/star/SettingsDialog.tsx
var SECTIONS = [
	"General",
	"Language",
	"Appearance",
	"AI",
	"Memory",
	"Privacy",
	"Notifications",
	"Shortcuts",
	"About"
];
function Row({ label, hint, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between gap-4 border-b border-border py-3 last:border-0",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
			className: "text-sm font-medium",
			children: label
		}), hint && /* @__PURE__ */ jsx("p", {
			className: "text-xs text-muted-foreground",
			children: hint
		})] }), /* @__PURE__ */ jsx("div", {
			className: "shrink-0",
			children
		})]
	});
}
function Toggle({ on, onChange }) {
	return /* @__PURE__ */ jsx("button", {
		onClick: () => onChange(!on),
		role: "switch",
		"aria-checked": on,
		className: cn("h-6 w-11 rounded-full p-0.5 transition-colors", on ? "bg-brand-gradient" : "bg-secondary"),
		children: /* @__PURE__ */ jsx("span", { className: cn("block h-5 w-5 rounded-full bg-background transition-transform", on && "translate-x-5") })
	});
}
function SettingsDialog({ open, onClose }) {
	const { settings, updateSettings, memories, addMemory, deleteMemory, clearMemories, conversations } = useStar();
	const [section, setSection] = useState("General");
	const [memoryDraft, setMemoryDraft] = useState("");
	const { t, dir } = useI18n();
	if (!open) return null;
	return /* @__PURE__ */ jsx("div", {
		dir,
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm",
		children: /* @__PURE__ */ jsxs("div", {
			className: "glass flex h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl shadow-glow md:flex-row",
			children: [/* @__PURE__ */ jsxs("nav", {
				className: "scrollbar-thin flex shrink-0 gap-1 overflow-x-auto border-b border-border p-3 md:w-48 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r",
				children: [/* @__PURE__ */ jsx("p", {
					className: "hidden px-2 pb-2 font-display text-sm font-semibold md:block",
					children: t("Settings")
				}), SECTIONS.map((s) => /* @__PURE__ */ jsx("button", {
					onClick: () => setSection(s),
					className: cn("whitespace-nowrap rounded-xl px-3 py-2 text-start text-xs font-medium transition-colors", section === s ? "bg-brand-gradient text-primary-foreground" : "hover:bg-secondary"),
					children: t(s)
				}, s))]
			}), /* @__PURE__ */ jsxs("div", {
				className: "scrollbar-thin flex-1 overflow-y-auto p-5",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "mb-4 flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "font-display text-lg font-semibold",
							children: t(section)
						}), /* @__PURE__ */ jsx("button", {
							onClick: onClose,
							className: "rounded-xl border border-border px-3 py-1.5 text-xs hover:bg-secondary",
							children: t("Done")
						})]
					}),
					section === "General" && /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx(Row, {
							label: t("conversationsStored"),
							hint: t("savedOnDevice"),
							children: /* @__PURE__ */ jsx("span", {
								className: "text-sm tabular-nums",
								children: conversations.length
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Send with Enter"),
							hint: t("Shift + Enter adds a new line"),
							children: /* @__PURE__ */ jsx("span", {
								className: "text-xs text-muted-foreground",
								children: t("Always on")
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("replyLanguage"),
							hint: t("Automatic follows the language you write in"),
							children: /* @__PURE__ */ jsx("select", {
								value: settings.language,
								onChange: (e) => updateSettings({ language: e.target.value }),
								className: "rounded-xl border border-border bg-popover px-3 py-1.5 text-xs",
								children: [
									"auto",
									"English",
									"Spanish",
									"French",
									"German",
									"Portuguese",
									"Arabic",
									"Hindi",
									"Chinese",
									"Japanese"
								].map((l) => /* @__PURE__ */ jsx("option", {
									value: l,
									children: l === "auto" ? t("Automatic") : t(l)
								}, l))
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Call me by"),
							hint: t("What Star-AI should call itself for you"),
							children: /* @__PURE__ */ jsx("input", {
								value: settings.assistantName,
								onChange: (e) => updateSettings({ assistantName: e.target.value }),
								placeholder: t("Star-AI"),
								"aria-label": t("Assistant name"),
								className: "w-40 rounded-xl border border-border bg-transparent px-3 py-1.5 text-xs outline-none"
							})
						})
					] }),
					section === "Language" && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Row, {
						label: t("uiLanguage"),
						hint: t("Choose the language used throughout the app"),
						children: /* @__PURE__ */ jsxs("select", {
							value: settings.uiLanguage ?? "en",
							onChange: (e) => updateSettings({ uiLanguage: e.target.value }),
							className: "min-w-32 rounded-xl border border-border bg-popover px-3 py-2 text-xs",
							"aria-label": t("uiLanguage"),
							children: [/* @__PURE__ */ jsx("option", {
								value: "en",
								children: "English"
							}), /* @__PURE__ */ jsx("option", {
								value: "fa",
								children: "فارسی"
							})]
						})
					}) }),
					section === "Appearance" && /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx(Row, {
							label: t("Color mode"),
							children: /* @__PURE__ */ jsx("div", {
								className: "flex gap-1 rounded-xl border border-border p-1",
								children: [
									"dark",
									"light",
									"system"
								].map((m) => /* @__PURE__ */ jsx("button", {
									onClick: () => updateSettings({ colorMode: m }),
									className: cn("rounded-lg px-2.5 py-1 text-xs capitalize", settings.colorMode === m && "bg-brand-gradient text-primary-foreground"),
									children: m
								}, m))
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Background intensity"),
							children: /* @__PURE__ */ jsx("input", {
								type: "range",
								min: 0,
								max: 100,
								value: settings.backgroundIntensity,
								onChange: (e) => updateSettings({ backgroundIntensity: Number(e.target.value) }),
								className: "w-40 accent-[var(--primary)]"
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Animations"),
							children: /* @__PURE__ */ jsx(Toggle, {
								on: settings.animations,
								onChange: (v) => updateSettings({ animations: v })
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Blur"),
							hint: t("Enable background blur effects"),
							children: /* @__PURE__ */ jsx(Toggle, {
								on: settings.blur,
								onChange: (v) => updateSettings({ blur: v })
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Liquid Glass"),
							hint: t("Enable translucent liquid glass surfaces"),
							children: /* @__PURE__ */ jsx(Toggle, {
								on: settings.liquidGlass,
								onChange: (v) => updateSettings({ liquidGlass: v })
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Particle effects"),
							children: /* @__PURE__ */ jsx(Toggle, {
								on: settings.particles,
								onChange: (v) => updateSettings({ particles: v })
							})
						})
					] }),
					section === "AI" && /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx(Row, {
							label: t("Default version"),
							hint: t("Used when Star-AI starts"),
							children: /* @__PURE__ */ jsx("select", {
								value: settings.defaultVersion,
								onChange: (e) => updateSettings({ defaultVersion: e.target.value }),
								className: "rounded-xl border border-border bg-popover px-3 py-1.5 text-xs",
								children: VERSION_LIST.map((v) => /* @__PURE__ */ jsx("option", {
									value: v.id,
									children: v.name
								}, v.id))
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Response style"),
							hint: t("Applied to the AI system configuration"),
							children: /* @__PURE__ */ jsx("select", {
								value: settings.style,
								onChange: (e) => updateSettings({ style: e.target.value }),
								className: "rounded-xl border border-border bg-popover px-3 py-1.5 text-xs",
								children: RESPONSE_STYLES.map((s) => /* @__PURE__ */ jsxs("option", {
									value: s.id,
									children: [
										t(s.label),
										" — ",
										t(s.hint)
									]
								}, s.id))
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Default mode"),
							hint: t("Task framing applied to new messages"),
							children: /* @__PURE__ */ jsx("select", {
								value: settings.mode,
								onChange: (e) => updateSettings({ mode: e.target.value }),
								className: "rounded-xl border border-border bg-popover px-3 py-1.5 text-xs",
								children: AI_MODES.map((m) => /* @__PURE__ */ jsxs("option", {
									value: m.id,
									children: [
										t(m.label),
										" — ",
										t(m.hint)
									]
								}, m.id))
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Web search"),
							hint: t("Requires a search provider key on the server"),
							children: /* @__PURE__ */ jsx(Toggle, {
								on: settings.webSearch,
								onChange: (v) => updateSettings({ webSearch: v })
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Read answers aloud"),
							hint: t("Speak each response when it finishes"),
							children: /* @__PURE__ */ jsx(Toggle, {
								on: settings.autoSpeak,
								onChange: (v) => updateSettings({ autoSpeak: v })
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Streaming responses"),
							hint: t("Show text as it is generated"),
							children: /* @__PURE__ */ jsx(Toggle, {
								on: settings.streaming,
								onChange: (v) => updateSettings({ streaming: v })
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("Model configuration"),
							hint: t("Chosen on the server per version"),
							children: /* @__PURE__ */ jsx("span", {
								className: "text-xs text-muted-foreground",
								children: "STAR_AI_2_MODEL / STAR_AI_3_MODEL"
							})
						})
					] }),
					section === "Memory" && /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx(Row, {
							label: t("Enable memory"),
							hint: t("Let Star-AI remember useful details"),
							children: /* @__PURE__ */ jsx(Toggle, {
								on: settings.memoryEnabled,
								onChange: (v) => updateSettings({ memoryEnabled: v })
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-4 flex gap-2",
							children: [/* @__PURE__ */ jsx("input", {
								value: memoryDraft,
								onChange: (e) => setMemoryDraft(e.target.value),
								placeholder: t("Remember that…"),
								className: "flex-1 rounded-xl border border-border bg-transparent px-3 py-2 text-xs outline-none"
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => {
									addMemory(memoryDraft);
									setMemoryDraft("");
								},
								className: "rounded-xl bg-brand-gradient px-3 py-2 text-xs font-medium text-primary-foreground",
								children: "Save"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 space-y-2",
							children: [memories.length === 0 && /* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: t("No saved memories yet.")
							}), memories.map((m) => /* @__PURE__ */ jsxs("div", {
								className: "flex items-start justify-between gap-3 rounded-xl border border-border px-3 py-2",
								children: [/* @__PURE__ */ jsx("p", {
									className: "text-xs",
									children: m.text
								}), /* @__PURE__ */ jsx("button", {
									onClick: () => deleteMemory(m.id),
									className: "text-muted-foreground hover:text-destructive",
									"aria-label": t("Delete"),
									children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" })
								})]
							}, m.id))]
						}),
						memories.length > 0 && /* @__PURE__ */ jsx("button", {
							onClick: () => {
								clearMemories();
								toast.success("All memories cleared.");
							},
							className: "mt-4 rounded-xl border border-destructive/50 px-3 py-1.5 text-xs text-destructive",
							children: "Clear all memories"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-4 text-[11px] text-muted-foreground",
							children: "Avoid storing passwords, financial details or other sensitive information."
						})
					] }),
					section === "Privacy" && /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx(Row, {
							label: t("Data location"),
							hint: t("Conversations stay in this browser"),
							children: /* @__PURE__ */ jsx("span", {
								className: "text-xs text-muted-foreground",
								children: t("Local device")
							})
						}),
						/* @__PURE__ */ jsx(Row, {
							label: t("API keys"),
							hint: t("Never exposed to the browser"),
							children: /* @__PURE__ */ jsx("span", {
								className: "text-xs text-muted-foreground",
								children: t("Server-side only")
							})
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: () => {
								window.localStorage.removeItem("star-ai:state:v1");
								window.location.reload();
							},
							className: "mt-4 rounded-xl border border-destructive/50 px-3 py-1.5 text-xs text-destructive",
							children: "Delete all local data"
						})
					] }),
					section === "Notifications" && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Row, {
						label: t("Completion alerts"),
						hint: t("Notify when a long response finishes"),
						children: /* @__PURE__ */ jsx(Toggle, {
							on: settings.notifications,
							onChange: (v) => updateSettings({ notifications: v })
						})
					}) }),
					section === "Shortcuts" && /* @__PURE__ */ jsx("div", {
						className: "space-y-2 text-xs",
						children: [
							["Enter", "Send message"],
							["Shift + Enter", "New line"],
							["Ctrl / ⌘ + K", "Search conversations"],
							["Ctrl / ⌘ + N", "New chat"],
							["Esc", "Stop generating"]
						].map(([k, d]) => /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between border-b border-border py-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-muted-foreground",
								children: d
							}), /* @__PURE__ */ jsx("kbd", {
								className: "rounded-md border border-border px-2 py-1 font-mono text-[11px]",
								children: k
							})]
						}, k))
					}),
					section === "About" && /* @__PURE__ */ jsxs("div", {
						className: "space-y-3 text-sm",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "font-display text-xl font-semibold text-brand-gradient",
								children: t("Star-AI")
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: "Two generations of the same assistant. Star-AI 2.0 is tuned for fast everyday work; Star-AI 3.0 adds deeper reasoning, file and image understanding, and long-form work."
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs text-muted-foreground",
								children: "Model selection happens entirely on the server via the STAR_AI_2_MODEL and STAR_AI_3_MODEL environment variables."
							})
						]
					})
				]
			})]
		})
	});
}
//#endregion
//#region src/components/star/Sidebar.tsx
function relative(ts) {
	const d = Date.now() - ts;
	if (d < 6e4) return "just now";
	if (d < 36e5) return `${Math.floor(d / 6e4)}m ago`;
	if (d < 864e5) return `${Math.floor(d / 36e5)}h ago`;
	return new Date(ts).toLocaleDateString();
}
var SORTS = [
	{
		id: "recent",
		label: "Most recent"
	},
	{
		id: "oldest",
		label: "Oldest first"
	},
	{
		id: "alpha",
		label: "A → Z"
	}
];
function Sidebar({ onOpenSettings, onOpenHelp, onOpenProfile, onClose }) {
	const { displayName, user } = useAuth();
	const { t, dir } = useI18n();
	const { conversations, activeId, setActiveId, newConversation, renameConversation, deleteConversation, togglePin, folders, createFolder, deleteFolder, moveConversation, settings, updateSettings } = useStar();
	const [query, setQuery] = useState("");
	const [renaming, setRenaming] = useState(null);
	const [draft, setDraft] = useState("");
	const [collapsed, setCollapsed] = useState({});
	const list = useMemo(() => {
		const q = query.trim().toLowerCase();
		return conversations.filter((c) => !q || c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content.toLowerCase().includes(q))).sort((a, b) => {
			if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
			if (settings.sort === "alpha") return a.title.localeCompare(b.title);
			if (settings.sort === "oldest") return a.updatedAt - b.updatedAt;
			return b.updatedAt - a.updatedAt;
		});
	}, [
		conversations,
		query,
		settings.sort
	]);
	const groups = useMemo(() => {
		const byFolder = /* @__PURE__ */ new Map();
		for (const c of list) {
			const key = c.folderId ?? "__none";
			const arr = byFolder.get(key) ?? [];
			arr.push(c);
			byFolder.set(key, arr);
		}
		return byFolder;
	}, [list]);
	const row = (c) => /* @__PURE__ */ jsxs("div", {
		className: cn("group mb-1 rounded-xl px-2.5 py-2 transition-colors", activeId === c.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"),
		children: [renaming === c.id ? /* @__PURE__ */ jsx("input", {
			autoFocus: true,
			value: draft,
			onChange: (e) => setDraft(e.target.value),
			"aria-label": t("Rename conversation"),
			onBlur: () => {
				renameConversation(c.id, draft);
				setRenaming(null);
			},
			onKeyDown: (e) => {
				if (e.key === "Enter") {
					renameConversation(c.id, draft);
					setRenaming(null);
				}
				if (e.key === "Escape") setRenaming(null);
			},
			className: "w-full rounded-md bg-background/60 px-2 py-1 text-xs outline-none"
		}) : /* @__PURE__ */ jsxs("button", {
			onClick: () => {
				setActiveId(c.id);
				onClose?.();
			},
			className: "block w-full text-start",
			children: [/* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1.5",
				children: [c.pinned && /* @__PURE__ */ jsx(Pin, { className: "h-3 w-3 shrink-0 text-primary" }), /* @__PURE__ */ jsx("span", {
					className: "truncate text-xs font-medium",
					children: c.title
				})]
			}), /* @__PURE__ */ jsxs("span", {
				className: "mt-0.5 block text-[10px] text-muted-foreground",
				children: [
					"Star-AI ",
					c.version,
					" · ",
					c.messages.length,
					" msg · ",
					relative(c.updatedAt)
				]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-1 flex items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100",
			children: [
				/* @__PURE__ */ jsx("button", {
					onClick: () => togglePin(c.id),
					className: "rounded p-1 text-muted-foreground hover:text-foreground",
					"aria-label": c.pinned ? "Unpin" : "Pin",
					children: c.pinned ? /* @__PURE__ */ jsx(PinOff, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Pin, { className: "h-3 w-3" })
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: () => {
						setRenaming(c.id);
						setDraft(c.title);
					},
					className: "rounded p-1 text-muted-foreground hover:text-foreground",
					"aria-label": t("Rename"),
					children: /* @__PURE__ */ jsx(Pencil, { className: "h-3 w-3" })
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: () => deleteConversation(c.id),
					className: "rounded p-1 text-muted-foreground hover:text-destructive",
					"aria-label": t("Delete"),
					children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" })
				}),
				folders.length > 0 && /* @__PURE__ */ jsxs("select", {
					value: c.folderId ?? "",
					onChange: (e) => moveConversation(c.id, e.target.value || null),
					"aria-label": t("Move to folder"),
					className: "ml-auto max-w-24 truncate rounded bg-transparent text-[10px] text-muted-foreground outline-none",
					children: [/* @__PURE__ */ jsx("option", {
						value: "",
						children: t("No folder")
					}), folders.map((f) => /* @__PURE__ */ jsx("option", {
						value: f.id,
						children: f.name
					}, f.id))]
				})
			]
		})]
	}, c.id);
	return /* @__PURE__ */ jsxs("aside", {
		dir,
		className: "glass flex h-full w-72 flex-col rounded-none border-y-0 border-l-0 bg-sidebar text-sidebar-foreground md:rounded-r-3xl",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 px-4 pt-4",
				children: [
					/* @__PURE__ */ jsx(StarLogo, { className: "h-8 w-8 text-primary" }),
					/* @__PURE__ */ jsxs("div", {
						className: "leading-tight",
						children: [/* @__PURE__ */ jsx("p", {
							className: "font-display text-base font-semibold",
							children: "Star-AI"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-[11px] text-muted-foreground",
							children: t("AI platform")
						})]
					}),
					onClose && /* @__PURE__ */ jsx("button", {
						onClick: onClose,
						className: "ml-auto p-1 text-muted-foreground md:hidden",
						"aria-label": "Close menu",
						children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "px-3 pt-3",
				children: /* @__PURE__ */ jsxs("button", {
					onClick: () => {
						newConversation();
						onClose?.();
					},
					className: "flex w-full items-center gap-2 rounded-2xl bg-brand-gradient px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-[1.02]",
					children: [
						/* @__PURE__ */ jsx(MessageSquarePlus, { className: "h-4 w-4" }),
						" ",
						t("New chat")
					]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "px-3 pt-3",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2 rounded-xl border border-border px-3 py-2",
					children: [/* @__PURE__ */ jsx(Search, { className: "h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ jsx("input", {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: t("Search conversations"),
						"aria-label": t("Search conversations"),
						className: "w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
					})]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 px-3 pt-2",
				children: [
					/* @__PURE__ */ jsx(ArrowDownWideNarrow, { className: "h-3 w-3 text-muted-foreground" }),
					/* @__PURE__ */ jsx("select", {
						value: settings.sort,
						onChange: (e) => updateSettings({ sort: e.target.value }),
						"aria-label": t("Sort conversations"),
						className: "flex-1 bg-transparent text-[11px] text-muted-foreground outline-none",
						children: SORTS.map((s) => /* @__PURE__ */ jsx("option", {
							value: s.id,
							children: s.label
						}, s.id))
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => {
							const name = window.prompt(t("Folder name"));
							if (name) createFolder(name);
						},
						className: "rounded p-1 text-muted-foreground hover:text-foreground",
						"aria-label": t("New folder"),
						children: /* @__PURE__ */ jsx(FolderPlus, { className: "h-3.5 w-3.5" })
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "scrollbar-thin mt-2 flex-1 overflow-y-auto px-2 pb-2",
				children: list.length === 0 ? /* @__PURE__ */ jsx("p", {
					className: "px-3 py-6 text-center text-xs text-muted-foreground",
					children: query ? t("No conversations match your search.") : t("No conversations yet.")
				}) : /* @__PURE__ */ jsxs(Fragment, { children: [folders.map((f) => {
					const items = groups.get(f.id) ?? [];
					const isCollapsed = collapsed[f.id];
					return /* @__PURE__ */ jsxs("div", {
						className: "mb-1",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center gap-1 px-1.5 py-1",
							children: [/* @__PURE__ */ jsxs("button", {
								onClick: () => setCollapsed((c) => ({
									...c,
									[f.id]: !c[f.id]
								})),
								className: "flex flex-1 items-center gap-1.5 text-start text-[11px] font-semibold text-muted-foreground hover:text-foreground",
								"aria-expanded": !isCollapsed,
								children: [
									isCollapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-3 w-3" }),
									/* @__PURE__ */ jsx(FolderClosed, { className: "h-3 w-3" }),
									/* @__PURE__ */ jsx("span", {
										className: "truncate",
										children: f.name
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-[10px] opacity-70",
										children: items.length
									})
								]
							}), /* @__PURE__ */ jsx("button", {
								onClick: () => deleteFolder(f.id),
								className: "rounded p-1 text-muted-foreground hover:text-destructive",
								"aria-label": `Delete folder ${f.name}`,
								children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" })
							})]
						}), !isCollapsed && (items.length ? items.map(row) : /* @__PURE__ */ jsx("p", {
							className: "px-3 py-1 text-[10px] text-muted-foreground",
							children: t("Empty folder")
						}))]
					}, f.id);
				}), (groups.get("__none") ?? []).map(row)] })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "border-t border-sidebar-border p-2",
				children: [
					/* @__PURE__ */ jsxs("button", {
						onClick: onOpenSettings,
						className: "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
						children: [
							/* @__PURE__ */ jsx(Settings, { className: "h-3.5 w-3.5" }),
							" ",
							t("Settings")
						]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: onOpenHelp,
						className: "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
						children: [
							/* @__PURE__ */ jsx(CircleHelp, { className: "h-3.5 w-3.5" }),
							" ",
							t("Help")
						]
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: onOpenProfile,
						className: "mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-sidebar-accent",
						children: [/* @__PURE__ */ jsx("span", {
							className: "flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-[11px] font-semibold text-primary-foreground",
							children: displayName ? displayName.charAt(0).toUpperCase() : /* @__PURE__ */ jsx(User, { className: "h-3.5 w-3.5" })
						}), /* @__PURE__ */ jsxs("div", {
							className: "min-w-0 text-start leading-tight",
							children: [/* @__PURE__ */ jsx("p", {
								className: "truncate text-xs font-medium",
								children: displayName || "Star-AI"
							}), /* @__PURE__ */ jsx("p", {
								className: "truncate text-[10px] text-muted-foreground",
								children: user?.email ?? ""
							})]
						})]
					})
				]
			})
		]
	});
}
//#endregion
//#region src/components/star/VersionBackground.tsx
function seeded(n) {
	let s = n * 9301 + 49297;
	return () => {
		s = (s * 9301 + 49297) % 233280;
		return s / 233280;
	};
}
/**
* Version-specific animated background.
* 2.0 -> blue/violet tech grid with drifting particles
* 3.0 -> deep cosmic field with nebulae and glowing stars
*/
function VersionBackground() {
	const { version, settings, switching } = useStar();
	const cosmic = version === "3.0";
	const count = settings.particles ? cosmic ? 90 : 55 : 0;
	const stars = useMemo(() => {
		const rand = seeded(cosmic ? 77 : 21);
		return Array.from({ length: count }, () => ({
			left: rand() * 100,
			top: rand() * 100,
			size: cosmic ? .6 + rand() * 2.2 : .8 + rand() * 1.6,
			delay: rand() * 14,
			duration: (cosmic ? 26 : 34) + rand() * 30,
			opacity: .25 + rand() * .7
		}));
	}, [count, cosmic]);
	return /* @__PURE__ */ jsxs("div", {
		"aria-hidden": true,
		className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden version-morph",
		style: { opacity: `calc(0.45 + 0.55 * var(--bg-intensity))` },
		children: [
			/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-background" }),
			/* @__PURE__ */ jsx("div", {
				className: "absolute -top-1/3 left-1/2 h-[90vh] w-[120vw] -translate-x-1/2 rounded-full",
				style: {
					background: "var(--gradient-halo)",
					animation: settings.animations ? "nebula-pulse 16s ease-in-out infinite" : void 0
				}
			}),
			cosmic ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
				className: "absolute -left-40 top-1/4 h-[55vh] w-[55vh] rounded-full blur-3xl",
				style: {
					background: "radial-gradient(circle, color-mix(in oklab, var(--primary) 55%, transparent), transparent 70%)",
					animation: settings.animations ? "nebula-pulse 22s ease-in-out infinite" : void 0
				}
			}), /* @__PURE__ */ jsx("div", {
				className: "absolute -right-32 bottom-0 h-[60vh] w-[60vh] rounded-full blur-3xl",
				style: {
					background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 45%, transparent), transparent 70%)",
					animation: settings.animations ? "nebula-pulse 28s ease-in-out infinite reverse" : void 0
				}
			})] }) : /* @__PURE__ */ jsx("div", {
				className: "absolute inset-0 opacity-[0.35]",
				style: {
					backgroundImage: "linear-gradient(color-mix(in oklab, var(--primary) 22%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--primary) 22%, transparent) 1px, transparent 1px)",
					backgroundSize: "68px 68px",
					maskImage: "radial-gradient(ellipse at 50% 20%, black, transparent 78%)"
				}
			}),
			/* @__PURE__ */ jsx("div", {
				className: "absolute inset-0",
				children: stars.map((s, i) => /* @__PURE__ */ jsx("span", {
					className: "absolute rounded-full",
					style: {
						left: `${s.left}%`,
						top: `${s.top}%`,
						width: s.size,
						height: s.size,
						opacity: s.opacity,
						background: cosmic ? "color-mix(in oklab, var(--glow) 55%, white)" : "color-mix(in oklab, var(--accent) 65%, white)",
						boxShadow: cosmic ? "0 0 8px currentColor" : void 0,
						animation: settings.animations ? `star-drift ${s.duration}s linear ${s.delay}s infinite` : void 0
					}
				}, i))
			}),
			switching && /* @__PURE__ */ jsx("div", {
				className: "absolute inset-0",
				style: {
					background: "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--glow) 35%, transparent), transparent 60%)",
					animation: "version-morph 900ms ease-out"
				}
			})
		]
	}, version);
}
//#endregion
//#region src/components/star/StarApp.tsx
function StarApp() {
	const { hydrated, newConversation, stopGenerating, stream } = useStar();
	const [drawer, setDrawer] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	useEffect(() => {
		const onKey = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
				e.preventDefault();
				newConversation();
			}
			if (e.key === "Escape" && stream.busy) stopGenerating();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		newConversation,
		stopGenerating,
		stream.busy
	]);
	return /* @__PURE__ */ jsxs("div", {
		className: "relative flex h-dvh w-full overflow-hidden",
		children: [
			/* @__PURE__ */ jsx(VersionBackground, {}),
			/* @__PURE__ */ jsx("div", {
				className: "hidden md:block",
				children: hydrated && /* @__PURE__ */ jsx(Sidebar, {
					onOpenSettings: () => setSettingsOpen(true),
					onOpenHelp: () => setHelpOpen(true),
					onOpenProfile: () => setProfileOpen(true)
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: cn("fixed inset-0 z-40 md:hidden", drawer ? "pointer-events-auto" : "pointer-events-none"),
				children: [/* @__PURE__ */ jsx("div", {
					onClick: () => setDrawer(false),
					className: cn("absolute inset-0 bg-black/60 transition-opacity", drawer ? "opacity-100" : "opacity-0")
				}), /* @__PURE__ */ jsx("div", {
					className: cn("absolute inset-y-0 left-0 transition-transform duration-300", drawer ? "translate-x-0" : "-translate-x-full"),
					children: hydrated && /* @__PURE__ */ jsx(Sidebar, {
						onClose: () => setDrawer(false),
						onOpenSettings: () => {
							setDrawer(false);
							setSettingsOpen(true);
						},
						onOpenHelp: () => {
							setDrawer(false);
							setHelpOpen(true);
						},
						onOpenProfile: () => {
							setDrawer(false);
							setProfileOpen(true);
						}
					})
				})]
			}),
			/* @__PURE__ */ jsx("main", {
				className: "flex min-w-0 flex-1",
				children: /* @__PURE__ */ jsx(ChatView, { onOpenSidebar: () => setDrawer(true) })
			}),
			/* @__PURE__ */ jsx(SettingsDialog, {
				open: settingsOpen,
				onClose: () => setSettingsOpen(false)
			}),
			/* @__PURE__ */ jsx(HelpDialog, {
				open: helpOpen,
				onClose: () => setHelpOpen(false)
			}),
			/* @__PURE__ */ jsx(ProfileDialog, {
				open: profileOpen,
				onClose: () => setProfileOpen(false)
			})
		]
	});
}
//#endregion
//#region src/routes/index.tsx?tsr-split=component
function Gate() {
	const { loading, session } = useAuth();
	const navigate = useNavigate();
	useEffect(() => {
		if (!loading && !session) navigate({
			to: "/auth",
			replace: true
		});
	}, [
		loading,
		session,
		navigate
	]);
	if (loading || !session) return /* @__PURE__ */ jsx("div", {
		className: "flex h-dvh items-center justify-center",
		children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-primary" })
	});
	return /* @__PURE__ */ jsx(StarApp, {});
}
function Index() {
	return /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsxs(StarProvider, { children: [/* @__PURE__ */ jsx(Gate, {}), /* @__PURE__ */ jsx(Toaster$1, { position: "top-center" })] }) });
}
//#endregion
export { Index as component };
