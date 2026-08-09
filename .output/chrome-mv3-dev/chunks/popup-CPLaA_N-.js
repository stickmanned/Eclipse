//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region node_modules/wxt/dist/virtual/reload-html.mjs
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
try {
	getDevServerWebSocket().addWxtEventListener("wxt:reload-page", (event) => {
		if (event.detail === location.pathname.substring(1)) location.reload();
	});
} catch (err) {
	logger.error("Failed to setup web socket connection with dev server", err);
}
//#endregion

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAtQ1BMYUFfTi0uanMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3ZpcnR1YWwvcmVsb2FkLWh0bWwubWpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vI3JlZ2lvbiBzcmMvdXRpbHMvaW50ZXJuYWwvbG9nZ2VyLnRzXHJcbmZ1bmN0aW9uIHByaW50KG1ldGhvZCwgLi4uYXJncykge1xyXG5cdGlmIChpbXBvcnQubWV0YS5lbnYuTU9ERSA9PT0gXCJwcm9kdWN0aW9uXCIpIHJldHVybjtcclxuXHRpZiAodHlwZW9mIGFyZ3NbMF0gPT09IFwic3RyaW5nXCIpIG1ldGhvZChgW3d4dF0gJHthcmdzLnNoaWZ0KCl9YCwgLi4uYXJncyk7XHJcblx0ZWxzZSBtZXRob2QoXCJbd3h0XVwiLCAuLi5hcmdzKTtcclxufVxyXG4vKiogV3JhcHBlciBhcm91bmQgYGNvbnNvbGVgIHdpdGggYSBcIlt3eHRdXCIgcHJlZml4ICovXHJcbmNvbnN0IGxvZ2dlciA9IHtcclxuXHRkZWJ1ZzogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUuZGVidWcsIC4uLmFyZ3MpLFxyXG5cdGxvZzogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUubG9nLCAuLi5hcmdzKSxcclxuXHR3YXJuOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS53YXJuLCAuLi5hcmdzKSxcclxuXHRlcnJvcjogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUuZXJyb3IsIC4uLmFyZ3MpXHJcbn07XHJcbi8vI2VuZHJlZ2lvblxyXG4vLyNyZWdpb24gc3JjL3V0aWxzL2ludGVybmFsL2Rldi1zZXJ2ZXItd2Vic29ja2V0LnRzXHJcbmxldCB3cztcclxuLyoqIENvbm5lY3QgdG8gdGhlIHdlYnNvY2tldCBhbmQgbGlzdGVuIGZvciBtZXNzYWdlcy4gKi9cclxuZnVuY3Rpb24gZ2V0RGV2U2VydmVyV2ViU29ja2V0KCkge1xyXG5cdGlmIChpbXBvcnQubWV0YS5lbnYuQ09NTUFORCAhPT0gXCJzZXJ2ZVwiKSB0aHJvdyBFcnJvcihcIk11c3QgYmUgcnVubmluZyBXWFQgZGV2IGNvbW1hbmQgdG8gY29ubmVjdCB0byBjYWxsIGdldERldlNlcnZlcldlYlNvY2tldCgpXCIpO1xyXG5cdGlmICh3cyA9PSBudWxsKSB7XHJcblx0XHRjb25zdCBzZXJ2ZXJVcmwgPSBfX0RFVl9TRVJWRVJfT1JJR0lOX187XHJcblx0XHRsb2dnZXIuZGVidWcoXCJDb25uZWN0aW5nIHRvIGRldiBzZXJ2ZXIgQFwiLCBzZXJ2ZXJVcmwpO1xyXG5cdFx0d3MgPSBuZXcgV2ViU29ja2V0KHNlcnZlclVybCwgXCJ2aXRlLWhtclwiKTtcclxuXHRcdHdzLmFkZFd4dEV2ZW50TGlzdGVuZXIgPSB3cy5hZGRFdmVudExpc3RlbmVyLmJpbmQod3MpO1xyXG5cdFx0d3Muc2VuZEN1c3RvbSA9IChldmVudCwgcGF5bG9hZCkgPT4gd3M/LnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xyXG5cdFx0XHR0eXBlOiBcImN1c3RvbVwiLFxyXG5cdFx0XHRldmVudCxcclxuXHRcdFx0cGF5bG9hZFxyXG5cdFx0fSkpO1xyXG5cdFx0d3MuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgKCkgPT4ge1xyXG5cdFx0XHRsb2dnZXIuZGVidWcoXCJDb25uZWN0ZWQgdG8gZGV2IHNlcnZlclwiKTtcclxuXHRcdH0pO1xyXG5cdFx0d3MuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsICgpID0+IHtcclxuXHRcdFx0bG9nZ2VyLmRlYnVnKFwiRGlzY29ubmVjdGVkIGZyb20gZGV2IHNlcnZlclwiKTtcclxuXHRcdH0pO1xyXG5cdFx0d3MuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIChldmVudCkgPT4ge1xyXG5cdFx0XHRsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gY29ubmVjdCB0byBkZXYgc2VydmVyXCIsIGV2ZW50KTtcclxuXHRcdH0pO1xyXG5cdFx0d3MuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgKGUpID0+IHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRjb25zdCBtZXNzYWdlID0gSlNPTi5wYXJzZShlLmRhdGEpO1xyXG5cdFx0XHRcdGlmIChtZXNzYWdlLnR5cGUgPT09IFwiY3VzdG9tXCIpIHdzPy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChtZXNzYWdlLmV2ZW50LCB7IGRldGFpbDogbWVzc2FnZS5kYXRhIH0pKTtcclxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0bG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIGhhbmRsZSBtZXNzYWdlXCIsIGVycik7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHRyZXR1cm4gd3M7XHJcbn1cclxuLy8jZW5kcmVnaW9uXHJcbi8vI3JlZ2lvbiBzcmMvdmlydHVhbC9yZWxvYWQtaHRtbC50c1xyXG5pZiAoaW1wb3J0Lm1ldGEuZW52LkNPTU1BTkQgPT09IFwic2VydmVcIikgdHJ5IHtcclxuXHRnZXREZXZTZXJ2ZXJXZWJTb2NrZXQoKS5hZGRXeHRFdmVudExpc3RlbmVyKFwid3h0OnJlbG9hZC1wYWdlXCIsIChldmVudCkgPT4ge1xyXG5cdFx0aWYgKGV2ZW50LmRldGFpbCA9PT0gbG9jYXRpb24ucGF0aG5hbWUuc3Vic3RyaW5nKDEpKSBsb2NhdGlvbi5yZWxvYWQoKTtcclxuXHR9KTtcclxufSBjYXRjaCAoZXJyKSB7XHJcblx0bG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIHNldHVwIHdlYiBzb2NrZXQgY29ubmVjdGlvbiB3aXRoIGRldiBzZXJ2ZXJcIiwgZXJyKTtcclxufVxyXG4vLyNlbmRyZWdpb25cclxuZXhwb3J0IHt9O1xyXG4iXSwieF9nb29nbGVfaWdub3JlTGlzdCI6WzBdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxTQUFTLE1BQU0sUUFBUSxHQUFHLE1BQU07Q0FFL0IsSUFBSSxPQUFPLEtBQUssT0FBTyxVQUFVLE9BQU8sU0FBUyxLQUFLLE1BQU0sS0FBSyxHQUFHLElBQUk7TUFDbkUsT0FBTyxTQUFTLEdBQUcsSUFBSTtBQUM3Qjs7QUFFQSxJQUFNLFNBQVM7Q0FDZCxRQUFRLEdBQUcsU0FBUyxNQUFNLFFBQVEsT0FBTyxHQUFHLElBQUk7Q0FDaEQsTUFBTSxHQUFHLFNBQVMsTUFBTSxRQUFRLEtBQUssR0FBRyxJQUFJO0NBQzVDLE9BQU8sR0FBRyxTQUFTLE1BQU0sUUFBUSxNQUFNLEdBQUcsSUFBSTtDQUM5QyxRQUFRLEdBQUcsU0FBUyxNQUFNLFFBQVEsT0FBTyxHQUFHLElBQUk7QUFDakQ7QUFHQSxJQUFJOztBQUVKLFNBQVMsd0JBQXdCO0NBRWhDLElBQUksTUFBTSxNQUFNO0VBQ2YsTUFBTSxZQUFBO0VBQ04sT0FBTyxNQUFNLDhCQUE4QixTQUFTO0VBQ3BELEtBQUssSUFBSSxVQUFVLFdBQVcsVUFBVTtFQUN4QyxHQUFHLHNCQUFzQixHQUFHLGlCQUFpQixLQUFLLEVBQUU7RUFDcEQsR0FBRyxjQUFjLE9BQU8sWUFBWSxJQUFJLEtBQUssS0FBSyxVQUFVO0dBQzNELE1BQU07R0FDTjtHQUNBO0VBQ0QsQ0FBQyxDQUFDO0VBQ0YsR0FBRyxpQkFBaUIsY0FBYztHQUNqQyxPQUFPLE1BQU0seUJBQXlCO0VBQ3ZDLENBQUM7RUFDRCxHQUFHLGlCQUFpQixlQUFlO0dBQ2xDLE9BQU8sTUFBTSw4QkFBOEI7RUFDNUMsQ0FBQztFQUNELEdBQUcsaUJBQWlCLFVBQVUsVUFBVTtHQUN2QyxPQUFPLE1BQU0sbUNBQW1DLEtBQUs7RUFDdEQsQ0FBQztFQUNELEdBQUcsaUJBQWlCLFlBQVksTUFBTTtHQUNyQyxJQUFJO0lBQ0gsTUFBTSxVQUFVLEtBQUssTUFBTSxFQUFFLElBQUk7SUFDakMsSUFBSSxRQUFRLFNBQVMsVUFBVSxJQUFJLGNBQWMsSUFBSSxZQUFZLFFBQVEsT0FBTyxFQUFFLFFBQVEsUUFBUSxLQUFLLENBQUMsQ0FBQztHQUMxRyxTQUFTLEtBQUs7SUFDYixPQUFPLE1BQU0sNEJBQTRCLEdBQUc7R0FDN0M7RUFDRCxDQUFDO0NBQ0Y7Q0FDQSxPQUFPO0FBQ1I7QUFHeUMsSUFBSTtDQUM1QyxzQkFBc0IsQ0FBQyxDQUFDLG9CQUFvQixvQkFBb0IsVUFBVTtFQUN6RSxJQUFJLE1BQU0sV0FBVyxTQUFTLFNBQVMsVUFBVSxDQUFDLEdBQUcsU0FBUyxPQUFPO0NBQ3RFLENBQUM7QUFDRixTQUFTLEtBQUs7Q0FDYixPQUFPLE1BQU0seURBQXlELEdBQUc7QUFDMUUifQ==