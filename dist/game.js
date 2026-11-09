"use strict";
const $ = (id) => document.getElementById(id);
const species = [
    { name: 'Дуб', latin: 'Quercus robur', description: 'Округлые лопасти и короткий черешок — приметы дуба черешчатого. Осенью его листья становятся охристыми и медно-коричневыми.', fact: 'Некоторые сухие листья остаются на молодых дубах до самой весны.', x: 307, y: 292 },
    { name: 'Клён', latin: 'Acer platanoides', description: 'Пять остроконечных лопастей расходятся, словно пальцы ладони. Осенью крона клёна окрашивается в золотистые, оранжевые и красные тона.', fact: 'Крылатые плоды клёна кружатся при падении, как маленькие вертолёты.', x: 721, y: 733 },
    { name: 'Берёза', latin: 'Betula pendula', description: 'Небольшой треугольный лист с острым кончиком и зубчатым краем. Осенью берёза роняет на тропинки россыпи золотистых листьев.', fact: 'Тонкие ветви берёзы повислой мягко опускаются вниз — отсюда её название.', x: 886, y: 208 },
    { name: 'Липа', latin: 'Tilia cordata', description: 'Лист похож на маленькое сердце: у основания он чуть несимметричен, а по краю идут мелкие зубчики. К осени зелень сменяется нежным золотом.', fact: 'Летом цветущая липа наполняет воздух медовым ароматом и привлекает пчёл.', x: 1094, y: 494 },
    { name: 'Осина', latin: 'Populus tremula', description: 'Почти круглый лист с волнистым краем держится на длинном, сплющенном с боков черешке. Осенью он бывает жёлтым, оранжевым или багряным.', fact: 'Из-за формы черешка листья осины трепещут даже при слабом ветерке.', x: 1404, y: 377 }
];
let collected = [];
try {
    const saved = JSON.parse(localStorage.getItem('quiet-herbarium-v1') || '[]');
    if (Array.isArray(saved))
        collected = [...new Set(saved.filter((n) => Number.isInteger(n) && n >= 0 && n < 5))];
}
catch { }
let scene, started = false, guide = false, nearest = -1, toastTimer;
const leafCrops = [[0, 382], [382, 838], [838, 1177], [1177, 1591], [1591, 1983]];
function leafStyle(i) { const [left, right] = leafCrops[i], width = right - left; return 'aspect-ratio:' + width + '/793;background-size:' + (1983 / width * 100) + '% 100%;background-position:' + (left / (1983 - width) * 100) + '% 50%'; }
const modal = () => !!document.querySelector('dialog[open]');
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4500); }
function save() { try {
    localStorage.setItem('quiet-herbarium-v1', JSON.stringify(collected));
}
catch {
    toast('Браузер не разрешил сохранить гербарий. В этой прогулке находки останутся с вами.');
} updateCount(); }
function updateCount() { $('count').textContent = collected.length + ' / 5'; $('album').setAttribute('aria-label', 'Гербарий: ' + collected.length + ' из 5 листьев'); }
function showCard(index, isNew = false) { const s = species[index]; $('specimen-number').textContent = '№ 0' + (index + 1); $('leaf-photo').style.cssText = leafStyle(index); $('leaf-photo').setAttribute('role', 'img'); $('leaf-photo').setAttribute('aria-label', 'Лист дерева ' + s.name); $('leaf-name').textContent = s.name; $('leaf-latin').textContent = s.latin; $('leaf-description').textContent = s.description; $('leaf-fact').textContent = s.fact; $('card-label').textContent = isNew ? 'НОВАЯ НАХОДКА' : 'СТРАНИЦА ГЕРБАРИЯ'; $('continue').innerHTML = isNew ? 'Положить в гербарий <span>↗</span>' : 'Вернуться к прогулке <span>↗</span>'; $('card-progress').textContent = collected.length + ' из 5 лесных находок'; scene?.stopWalking(); $('card').showModal(); }
function pickUp() { if (nearest < 0 || modal() || !started)
    return; const index = nearest; collected.push(index); save(); scene.leafObjects[index].setVisible(false); nearest = -1; $('prompt').hidden = true; showCard(index, true); sound.chime(); }
function album() { scene?.stopWalking(); $('album-grid').replaceChildren(); species.forEach((s, i) => { const found = collected.includes(i), b = document.createElement('button'); b.className = 'album-item' + (found ? '' : ' locked'); b.disabled = !found; b.setAttribute('aria-label', found ? 'Открыть лист: ' + s.name : 'Ещё не найденный лист'); b.innerHTML = '<div class="leaf-photo" style="' + leafStyle(i) + '"></div><strong>' + (found ? s.name : 'Не найден') + '</strong><small>' + (found ? s.latin : 'Лес ещё хранит эту находку') + '</small>'; b.onclick = () => { $('collection').close(); showCard(i); }; $('album-grid').append(b); }); $('album-subtitle').textContent = collected.length === 5 ? 'Все пять листочков дома. А лес по-прежнему ждёт вас.' : 'Найдено ' + collected.length + ' из 5 листочков. Остальные ждут на тропинках.'; $('reset-confirm').hidden = true; $('collection').showModal(); }
document.querySelectorAll('dialog .close').forEach((b) => b.onclick = () => b.closest('dialog').close());
document.querySelectorAll('dialog').forEach((d) => { d.addEventListener('click', (e) => { if (e.target === d) {
    const r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        if (d.id !== 'welcome')
            d.close();
    }
} }); d.addEventListener('close', () => { scene?.stopWalking(); if (d.id === 'card' && collected.length === 5)
    toast('Гербарий собран. Можно просто остаться в лесу. ❧'); }); });
$('welcome').addEventListener('cancel', (e) => e.preventDefault());
$('continue').onclick = () => $('card').close();
$('album').onclick = album;
$('help').onclick = () => { scene?.stopWalking(); $('help-dialog').showModal(); };
$('pickup').onclick = pickUp;
$('guide-toggle').onclick = () => { guide = !guide; $('guide-toggle').textContent = guide ? '⌁ Скрыть подсказку' : '⌁ Найти листочек'; if (collected.length === 5)
    toast('Все листья уже в гербарии. Наслаждайтесь прогулкой.'); };
$('reset').onclick = () => $('reset-confirm').hidden = false;
$('reset-no').onclick = () => $('reset-confirm').hidden = true;
$('reset-yes').onclick = () => { collected = []; save(); scene.reset(); $('collection').close(); toast('Новая прогулка. Знакомый лес, новые находки.'); };
document.addEventListener('keydown', e => { if (e.code === 'KeyE' && !e.repeat)
    pickUp(); });
window.addEventListener('blur', () => scene?.stopWalking());
document.addEventListener('visibilitychange', () => { if (document.hidden) {
    scene?.stopWalking();
    sound.suspend();
}
else
    sound.resume(); });
class ForestSound {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.enabled = false;
        this.step = 0;
    }
    async toggle() { if (!this.ctx)
        this.create(); if (this.ctx?.state === 'suspended')
        await this.ctx.resume(); this.enabled = !this.enabled; this.master?.gain.setTargetAtTime(this.enabled ? .3 : 0, this.ctx.currentTime, .6); $('sound').innerHTML = this.enabled ? '♫ <span>Звуки леса</span>' : '♫ <span>Звук выключен</span>'; $('sound').setAttribute('aria-label', this.enabled ? 'Выключить звук' : 'Включить звук'); $('sound').setAttribute('aria-pressed', String(this.enabled)); }
    create() {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) {
            toast('Этот браузер не поддерживает звук. Можно гулять в тишине.');
            return;
        }
        this.ctx = new AudioCtor();
        const c = this.ctx;
        this.master = c.createGain();
        this.master.gain.value = 0;
        this.master.connect(c.destination);
        const buffer = c.createBuffer(1, c.sampleRate * 6, c.sampleRate), d = buffer.getChannelData(0);
        let brown = 0;
        for (let i = 0; i < d.length; i++) {
            brown = (brown + (Math.random() * 2 - 1) * .024) / 1.024;
            d[i] = brown * 3.5;
        }
        const noise = c.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 700;
        const g = c.createGain();
        g.gain.value = .25;
        noise.connect(filter).connect(g).connect(this.master);
        noise.start();
        const lfo = c.createOscillator(), lg = c.createGain();
        lfo.frequency.value = .07;
        lg.gain.value = .10;
        lfo.connect(lg).connect(g.gain);
        lfo.start();
        this.timer = setInterval(() => { if (!this.enabled || document.hidden)
            return; const notes = [196, 246.94, 293.66, 369.99, 293.66, 246.94, 220, 293.66, 329.63, 440, 329.63, 293.66, 174.61, 220, 261.63, 349.23]; const f = notes[this.step++ % notes.length]; this.pluck(f, .32); if (this.step % 4 === 1)
            this.pluck(f / 2, .19, 3.4); }, 780);
        this.birdTimer = setInterval(() => { if (!this.enabled || document.hidden)
            return; const t = c.currentTime; for (let i = 0; i < 3; i++) {
            const o = c.createOscillator(), g = c.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(1700 + Math.random() * 900, t + i * .17);
            o.frequency.exponentialRampToValueAtTime(2800, t + i * .17 + .08);
            g.gain.setValueAtTime(0, t + i * .17);
            g.gain.linearRampToValueAtTime(.018, t + i * .17 + .025);
            g.gain.exponentialRampToValueAtTime(.0001, t + i * .17 + .15);
            o.connect(g).connect(this.master);
            o.start(t + i * .17);
            o.stop(t + i * .17 + .2);
        } }, 7300);
    }
    pluck(f, level, duration = 2.5) { if (!this.ctx || !this.master)
        return; const c = this.ctx, t = c.currentTime; [1, 2, 3].forEach((harmonic, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f * harmonic; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(level / (i * 5 + 1), t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + duration / (i * .6 + 1)); o.connect(g).connect(this.master); o.start(); o.stop(t + duration + .1); }); }
    chime() { if (this.enabled) {
        this.pluck(659.25, .22);
        setTimeout(() => this.pluck(880, .13), 160);
    } }
    suspend() { this.ctx?.suspend(); }
    resume() { if (this.enabled)
        this.ctx?.resume(); }
}
const sound = new ForestSound();
$('sound').onclick = () => sound.toggle().catch(() => toast('Не удалось включить звук. Попробуйте ещё раз.'));
$('start').onclick = () => { started = true; $('welcome').close(); if ($('start-sound').checked)
    sound.toggle().catch(() => { }); toast('Первый листочек совсем рядом. Следуйте по тропинке.'); };
const nodes = [{ x: 725, y: 960 }, { x: 705, y: 820 }, { x: 700, y: 670 }, { x: 660, y: 594 }, { x: 786, y: 482 }, { x: 866, y: 360 }, { x: 882, y: 291 }, { x: 859, y: 218 }, { x: 918, y: 130 }, { x: 943, y: 42 }, { x: 500, y: 570 }, { x: 300, y: 517 }, { x: 163, y: 427 }, { x: 201, y: 353 }, { x: 349, y: 280 }, { x: 515, y: 236 }, { x: 975, y: 468 }, { x: 1165, y: 510 }, { x: 1342, y: 459 }, { x: 1445, y: 373 }, { x: 1404, y: 303 }, { x: 1333, y: 261 }];
const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [3, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [4, 16], [16, 17], [17, 18], [18, 19], [19, 20], [20, 21]];
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function project(p, a, b) { const t = Phaser.Math.Clamp(((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / ((b.x - a.x) ** 2 + (b.y - a.y) ** 2), 0, 1); return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
function nearestEdge(p) { let best = { p: nodes[0], e: edges[0], d: Infinity }; edges.forEach(e => { const q = project(p, nodes[e[0]], nodes[e[1]]), d = dist(p, q); if (d < best.d)
    best = { p: q, e, d }; }); return best; }
function route(from, to) { const a = nearestEdge(from), b = nearestEdge(to); if (a.e === b.e)
    return [b.p]; const pts = [...nodes, a.p, b.p], start = pts.length - 2, end = pts.length - 1, links = [...edges, [start, a.e[0]], [start, a.e[1]], [end, b.e[0]], [end, b.e[1]]], ds = pts.map(() => Infinity), prev = pts.map(() => -1), seen = new Set(); ds[start] = 0; while (seen.size < pts.length) {
    let u = -1;
    ds.forEach((d, i) => { if (!seen.has(i) && (u === -1 || d < ds[u]))
        u = i; });
    if (u === end || u < 0 || !Number.isFinite(ds[u]))
        break;
    seen.add(u);
    links.forEach(([v, w]) => { let next = v === u ? w : w === u ? v : -1; if (next < 0)
        return; const nd = ds[u] + dist(pts[u], pts[next]); if (nd < ds[next]) {
        ds[next] = nd;
        prev[next] = u;
    } });
} const result = []; for (let u = end; u !== start && u >= 0; u = prev[u])
    result.unshift(pts[u]); return result; }
function createGirl(gameScene) {
    for (let frame = 0; frame < 8; frame++) {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 140;
        const c = canvas.getContext('2d'), phase = frame / 8 * Math.PI * 2, swing = Math.sin(phase) * 6;
        const path = (color, stroke, draw) => { c.beginPath(); draw(); c.fillStyle = color; c.fill(); if (stroke) {
            c.strokeStyle = stroke;
            c.lineWidth = 1.8;
            c.stroke();
        } };
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.translate(0, Math.abs(Math.sin(phase)) * -1.5);
        path('#514434', '#433a2c', () => { c.roundRect(36 + swing, 111, 10, 19, 4); c.roundRect(55 - swing, 111, 10, 19, 4); });
        path('#e4d1a4', '#716346', () => { c.moveTo(37, 98); c.lineTo(38 + swing, 120); c.lineTo(45 + swing, 120); c.lineTo(47, 100); c.moveTo(54, 99); c.lineTo(55 - swing, 120); c.lineTo(62 - swing, 120); c.lineTo(64, 98); });
        path('#9e7552', '#4e4b33', () => { c.ellipse(46, 78, 23, 30, -.2, 0, Math.PI * 2); });
        path('#b16e43', '#594933', () => { c.moveTo(35, 64); c.quadraticCurveTo(25, 81, 26, 107); c.quadraticCurveTo(49, 118, 74, 105); c.lineTo(62, 63); c.closePath(); });
        path('#d7c29b', '#6d6547', () => { c.moveTo(42, 62); c.lineTo(38, 106); c.quadraticCurveTo(51, 112, 65, 105); c.lineTo(57, 62); c.closePath(); });
        path('#b16e43', '#594933', () => { c.moveTo(59, 66); c.quadraticCurveTo(71, 72, 76, 90 + swing / 2); c.lineTo(69, 94 + swing / 2); c.lineTo(56, 79); c.closePath(); });
        path('#e6bb90', '#70563d', () => { c.ellipse(73, 94 + swing / 2, 4, 6, -.4, 0, Math.PI * 2); });
        path('#73513a', '#463d2e', () => { c.ellipse(48, 44, 22, 26, .1, 0, Math.PI * 2); });
        path('#e8c19a', '#695139', () => { c.ellipse(56, 45, 15, 19, .13, 0, Math.PI * 2); });
        path('#73513a', '#463d2e', () => { c.moveTo(31, 44); c.bezierCurveTo(27, 9, 65, 13, 72, 33); c.quadraticCurveTo(50, 27, 43, 49); c.lineTo(37, 65); c.lineTo(28, 62); c.closePath(); });
        path('#c1b47d', '#6b6947', () => { c.moveTo(28, 28); c.quadraticCurveTo(47, 6, 68, 27); c.lineTo(69, 31); c.quadraticCurveTo(45, 21, 29, 35); c.closePath(); });
        for (let i = 0; i < 4; i++)
            path(i % 2 ? '#85603f' : '#6f5138', '#4b432f', () => { c.ellipse(31 - i * .2, 61 + i * 7, 6 - i * .6, 5, .5, 0, Math.PI * 2); });
        path('#c4b377', '', () => { c.ellipse(30, 90, 4, 3, 0, 0, Math.PI * 2); });
        c.fillStyle = '#493f31';
        c.beginPath();
        c.arc(63, 44, 1.4, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = '#a67559';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(63, 53);
        c.quadraticCurveTo(65, 55, 67, 52);
        c.stroke();
        path('#b5955d', '#5f573b', () => { c.moveTo(66, 94); c.lineTo(83, 94); c.lineTo(80, 109); c.lineTo(68, 109); c.closePath(); });
        c.beginPath();
        c.ellipse(75, 93, 7, 7, 0, Math.PI, Math.PI * 2);
        c.strokeStyle = '#74613f';
        c.stroke();
        c.globalAlpha = .25;
        c.strokeStyle = '#685235';
        for (let i = 0; i < 4; i++) {
            c.beginPath();
            c.moveTo(67, 98 + i * 3);
            c.lineTo(82, 98 + i * 3);
            c.stroke();
        }
        c.globalAlpha = 1;
        gameScene.textures.addCanvas('girl' + frame, canvas);
    }
}
class ForestScene extends Phaser.Scene {
    constructor() {
        super('Forest');
        this.leafObjects = [];
        this.sparks = [];
        this.waypoints = [];
        this.walkTime = 0;
        this.previousNear = -1;
        this.ready = false;
    }
    preload() { this.load.image('forest', 'assets/forest.png'); this.load.image('leaves', 'assets/leaves.png'); this.load.on('loaderror', () => toast('Не удалось загрузить часть леса. Обновите страницу.')); }
    create() {
        scene = this;
        this.add.image(0, 0, 'forest').setOrigin(0);
        createGirl(this);
        this.shadow = this.add.ellipse(710, 850, 34, 13, 0x303d29, .25);
        this.girl = this.add.sprite(710, 850, 'girl0').setOrigin(.5, .96).setScale(.66);
        this.cameras.main.setBounds(0, 0, 1536, 1024);
        this.cameras.main.startFollow(this.girl, true, .045, .045);
        this.resize();
        this.scale.on('resize', () => this.resize());
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        this.input.keyboard.addCapture(['W', 'A', 'S', 'D', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE']);
        const source = this.textures.get('leaves').getSourceImage();
        for (let i = 0; i < 5; i++)
            this.textures.get('leaves').add('leaf' + i, 0, leafCrops[i][0], 0, leafCrops[i][1] - leafCrops[i][0], source.height);
        species.forEach((s, i) => { const halo = this.add.ellipse(s.x, s.y + 3, 48, 21, 0xffe7a2, .15); this.tweens.add({ targets: halo, alpha: .04, scaleX: 1.4, scaleY: 1.4, duration: 1800, yoyo: true, repeat: -1, delay: i * 250 }); const leaf = this.add.image(s.x, s.y, 'leaves', 'leaf' + i); leaf.setDisplaySize((leafCrops[i][1] - leafCrops[i][0]) / 793 * 49, 49).setAngle(-25 + i * 19); const group = this.add.container(0, 0, [halo, leaf]); group.setVisible(!collected.includes(i)); this.leafObjects.push(group); for (let j = 0; j < 3; j++) {
            const dot = this.add.circle(s.x + (j - 1) * 15, s.y - 12 - j * 10, 1.7, 0xffecc2, .8);
            group.add(dot);
            this.tweens.add({ targets: dot, y: dot.y - 16, alpha: 0, duration: 1600 + j * 300, repeat: -1, delay: j * 500 });
        } });
        for (let i = 0; i < 27; i++) {
            const p = this.add.circle(Phaser.Math.Between(20, 1510), Phaser.Math.Between(20, 990), Phaser.Math.FloatBetween(.7, 1.6), 0xfff3c1, .45);
            this.tweens.add({ targets: p, x: p.x + Phaser.Math.Between(-40, 40), y: p.y - 60, alpha: .05, duration: 5000 + i * 170, yoyo: true, repeat: -1 });
            this.sparks.push(p);
        }
        this.marker = this.add.ellipse(0, 0, 26, 11).setStrokeStyle(1, 0xffe6ad, .7).setVisible(false);
        this.guideLine = this.add.graphics();
        this.input.on('pointerdown', (p) => { if (!started || modal())
            return; const q = this.cameras.main.getWorldPoint(p.x, p.y); let target = q; const clicked = species.findIndex((s, i) => !collected.includes(i) && dist(s, q) < 28); if (clicked >= 0) {
            target = species[clicked];
            if (dist(this.girl, target) < 61) {
                nearest = clicked;
                pickUp();
                return;
            }
        } this.waypoints = route(this.girl, target); const end = this.waypoints[this.waypoints.length - 1]; if (end) {
            this.marker.setPosition(end.x, end.y).setVisible(true);
            this.tweens.add({ targets: this.marker, alpha: { from: 1, to: .2 }, duration: 800 });
        } });
        this.ready = true;
        updateCount();
        $('welcome').showModal();
        window.herbarium = { getState: () => ({ position: { x: this.girl.x, y: this.girl.y }, collected: [...collected], nearest, started, route: this.waypoints.length, dialog: document.querySelector('dialog[open]')?.id }), species: species.map(s => ({ x: s.x, y: s.y, name: s.name })) };
    }
    resize() { const w = this.scale.width, h = this.scale.height; this.cameras.main.setZoom(w < 700 ? .95 : Math.max(.85, Math.min(1.35, h / 800))); }
    stopWalking() { this.waypoints = []; this.marker?.setVisible(false); this.input?.keyboard?.resetKeys(true); }
    reset() { this.stopWalking(); this.girl.setPosition(710, 850); this.leafObjects.forEach(o => o.setVisible(true)); nearest = -1; guide = false; $('guide-toggle').textContent = '⌁ Найти листочек'; }
    update(time, delta) {
        if (!this.ready)
            return;
        const active = started && !modal();
        let dx = 0, dy = 0;
        const dt = Math.min(delta, 40) / 1000, speed = 112;
        if (active) {
            dx = Number(this.cursors.right.isDown || this.keys.D.isDown) - Number(this.cursors.left.isDown || this.keys.A.isDown);
            dy = Number(this.cursors.down.isDown || this.keys.S.isDown) - Number(this.cursors.up.isDown || this.keys.W.isDown);
            if (dx || dy)
                this.waypoints = [];
            else if (this.waypoints.length) {
                const p = this.waypoints[0], d = dist(this.girl, p);
                if (d < speed * dt + 2) {
                    this.girl.setPosition(p.x, p.y);
                    this.waypoints.shift();
                    if (!this.waypoints.length)
                        this.marker.setVisible(false);
                }
                else {
                    dx = (p.x - this.girl.x) / d;
                    dy = (p.y - this.girl.y) / d;
                }
            }
        }
        const moving = !!(dx || dy);
        if (moving) {
            const len = Math.hypot(dx, dy);
            dx /= len;
            dy /= len;
            let next = { x: this.girl.x + dx * speed * dt, y: this.girl.y + dy * speed * dt };
            const n = nearestEdge(next);
            if (n.d > 37) {
                const away = dist(next, n.p);
                next = { x: n.p.x + (next.x - n.p.x) * 37 / away, y: n.p.y + (next.y - n.p.y) * 37 / away };
            }
            this.girl.setPosition(Phaser.Math.Clamp(next.x, 25, 1510), Phaser.Math.Clamp(next.y, 40, 985));
            if (dx)
                this.girl.setFlipX(dx < 0);
            this.walkTime += delta;
            this.girl.setTexture('girl' + Math.floor(this.walkTime / 115) % 8);
        }
        else
            this.girl.setTexture('girl0');
        this.shadow.setPosition(this.girl.x, this.girl.y - 1);
        nearest = -1;
        if (active) {
            let d = 62;
            species.forEach((s, i) => { const n = dist(this.girl, s); if (!collected.includes(i) && n < d) {
                d = n;
                nearest = i;
            } });
        }
        $('prompt').hidden = nearest < 0;
        this.guideLine.clear();
        if (guide && active && collected.length < 5) {
            let best = -1, bd = Infinity;
            species.forEach((s, i) => { if (!collected.includes(i)) {
                const d = dist(this.girl, s);
                if (d < bd) {
                    bd = d;
                    best = i;
                }
            } });
            if (best >= 0) {
                const path = route(this.girl, species[best]);
                this.guideLine.lineStyle(2, 0xffe6a6, .32);
                let prev = this.girl;
                path.forEach(p => { const d = dist(prev, p); for (let k = 8; k < d; k += 20) {
                    const t = k / d;
                    this.guideLine.fillStyle(0xffe6a6, .52);
                    this.guideLine.fillCircle(prev.x + (p.x - prev.x) * t, prev.y + (p.y - prev.y) * t, 2);
                } prev = p; });
            }
        }
    }
}
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', backgroundColor: '#596a48', scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, render: { antialias: true, pixelArt: false }, scene: [ForestScene], audio: { noAudio: true } });
updateCount();
