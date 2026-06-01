class LocalSearch {
    constructor() {
        this.store = [];
        this.currentQuery = '';
        this.currentPage = 0;
        this.resultsPerPage = 10;
        this.currentResults = [];
        this.searchTimeout = null;
        this.elements = this.cacheElements();
        this.init();
    }

    cacheElements() {
        return {
            searchMask: document.getElementById("search-mask"),
            searchDialog: document.querySelector("#local-search .search-dialog"),
            searchInput: document.getElementById("search-input"),
            searchResults: document.getElementById("search-results"),
            searchPagination: document.getElementById("search-pagination"),
            searchTips: document.getElementById("search-tips"),
            searchButton: document.querySelector("#search-button > .search"),
            closeButton: document.querySelector("#local-search .search-close-button"),
        };
    }

    async init() {
        try {
            await this.loadSearchData();
            this.bindEvents();
            this.bindKeyboardShortcuts();
        } catch (error) {
            console.error('Search init failed:', error);
        }
    }

    async loadSearchData() {
        const path = GLOBAL_CONFIG?.localsearch?.path || '/search.xml';
        const resp = await fetch(path);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const xml = await resp.text();
        const doc = new DOMParser().parseFromString(xml, "text/xml");
        this.store = Array.from(doc.getElementsByTagName("entry")).map(e => ({
            title: (e.getElementsByTagName("title")[0]?.textContent || '').trim(),
            link:  (e.getElementsByTagName("url")[0]?.textContent || '').trim(),
        })).filter(i => i.title && i.link);
    }

    bindEvents() {
        this.elements.searchInput?.addEventListener('input', this.debounce(e => {
            this.handleSearchInput(e.target.value.trim());
        }, 250));

        this.elements.searchButton?.addEventListener('click', () => this.openSearch());
        this.elements.closeButton?.addEventListener('click', () => this.closeSearch());
        this.elements.searchMask?.addEventListener('click', () => this.closeSearch());

        window.addEventListener('pjax:complete', () => {
            this.elements = this.cacheElements();
            this.bindEvents();
        });
    }

    bindKeyboardShortcuts() {
        document.addEventListener("keydown", e => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                this.openSearch();
            }
            if (e.code === "Escape" && this.isSearchOpen()) this.closeSearch();
        });
    }

    openSearch() {
        if (!this.elements.searchMask || !this.elements.searchDialog) return;
        this.elements.searchMask.style.display = 'block';
        this.elements.searchDialog.style.display = 'flex';
        setTimeout(() => this.elements.searchInput?.focus(), 150);
    }

    closeSearch() {
        if (!this.elements.searchMask || !this.elements.searchDialog) return;
        this.elements.searchMask.style.display = 'none';
        this.elements.searchDialog.style.display = 'none';
        this.currentQuery = '';
        this.currentPage = 0;
    }

    isSearchOpen() {
        return this.elements.searchDialog?.style.display === "flex";
    }

    handleSearchInput(query) {
        this.currentQuery = query;
        this.currentPage = 0;
        if (!query) { this.clearSearchResults(); return; }

        var t0 = performance.now();
        this.currentResults = this.performSearch(query);
        var t1 = performance.now();

        this.renderResults(this.currentResults, this.currentPage, (t1 - t0).toFixed(1));
        this.renderPagination(this.currentResults.length);
    }

    // ── PRECISE MATCHING ENGINE (title-only, token-boundary) ──
    performSearch(query) {
        if (!query || !this.store.length) return [];

        var q = query.toLowerCase().trim();
        var tokens = q.split(/\s+/).filter(Boolean);

        var self = this;
        var scored = this.store
            .map(function(item) { return { item: item, score: self.scoreTitle(item.title.toLowerCase(), q, tokens) }; })
            .filter(function(r) { return r.score > 0; })
            .sort(function(a, b) { return b.score - a.score; });

        return scored.map(function(r) { return r.item; });
    }

    scoreTitle(title, rawQuery, tokens) {
        var s = 0;

        // Exact full-title match
        if (title === rawQuery) return 100;

        // Title starts with the exact query
        if (title.startsWith(rawQuery)) s += 40;

        // Each token matching at word boundaries
        for (var i = 0; i < tokens.length; i++) {
            var tk = tokens[i];
            var re = new RegExp('(^|[\\s\\-._/])' + this.escapeRegExp(tk) + '($|[\\s\\-._/])', 'i');
            if (re.test(title)) s += 30;
            else if (title.includes(tk)) s += 12;
            else if (tk.length >= 2 && title.startsWith(tk)) s += 8;
        }

        // All tokens present
        var allFound = tokens.every(function(tk) { return title.includes(tk); });
        if (allFound && tokens.length >= 2) s += 15;

        return s;
    }

    escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    // ── RENDERING ──
    renderResults(results, page, timeMs) {
        if (!this.elements.searchResults || !this.elements.searchTips) return;
        this.elements.searchResults.innerHTML = '';
        this.elements.searchTips.innerHTML = '';

        if (!results.length) {
            var el = document.createElement("span");
            el.className = "search-result-empty";
            el.textContent = '未找到「' + this.currentQuery + '」相关的内容';
            this.elements.searchResults.appendChild(el);
            return;
        }

        var start = page * this.resultsPerPage;
        var end = start + this.resultsPerPage;
        var frag = document.createDocumentFragment();

        for (var i = start; i < end && i < results.length; i++) {
            var li = document.createElement("li");
            li.className = "search-result-item";
            var a = document.createElement("a");
            a.className = "search-result-title";
            a.href = results[i].link;
            a.innerHTML = this.highlight(results[i].title, this.currentQuery);
            li.appendChild(a);
            frag.appendChild(li);
        }

        this.elements.searchResults.appendChild(frag);

        var count = document.createElement("span");
        count.className = "search-result-count";
        count.textContent = '找到 ' + results.length + ' 条结果，用时 ' + timeMs + ' ms';
        this.elements.searchTips.appendChild(count);
    }

    highlight(text, query) {
        var tokens = query.split(/\s+/).filter(Boolean);
        var out = text;
        for (var i = 0; i < tokens.length; i++) {
            var re = new RegExp('(' + this.escapeRegExp(tokens[i]) + ')', 'gi');
            out = out.replace(re, '<em>$1</em>');
        }
        return out;
    }

    renderPagination(total) {
        if (!this.elements.searchPagination) return;
        this.elements.searchPagination.innerHTML = '';
        var pages = Math.ceil(total / this.resultsPerPage);
        if (pages <= 1) return;
        var ul = document.createElement("ul");
        ul.className = "pagination-list";
        for (var i = 0; i < pages; i++) {
            var li = document.createElement("li");
            li.className = "pagination-item" + (i === this.currentPage ? ' select' : '');
            li.textContent = i + 1;
            (function(idx) {
                li.addEventListener('click', function() { self.currentPage = idx; self.renderResults(self.currentResults, idx); });
            })(i);
        }
        ul.appendChild(li);
        this.elements.searchPagination.appendChild(ul);
    }

    clearSearchResults() {
        if (this.elements.searchResults) this.elements.searchResults.innerHTML = '';
        if (this.elements.searchPagination) this.elements.searchPagination.innerHTML = '';
        if (this.elements.searchTips) this.elements.searchTips.innerHTML = '';
        this.currentResults = []; this.currentPage = 0;
    }

    debounce(fn, ms) {
        var self = this;
        return function() {
            var args = arguments, ctx = this;
            clearTimeout(self.searchTimeout);
            self.searchTimeout = setTimeout(function() { fn.apply(ctx, args); }, ms);
        };
    }
}

window.addEventListener("load", function() { window.localSearch = new LocalSearch(); });
