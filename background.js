/*  PREMIUM TYPOGRAPHY CANVAS  */
/*  Theme: Ambient halftone grid + drifting movable type + gentle mouse parallax  */
document.addEventListener('DOMContentLoaded', () => {
    let canvas = document.getElementById('parallax-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'parallax-canvas';
        document.body.prepend(canvas);
    }

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';

    const ctx = canvas.getContext('2d', { alpha: false });
    let w, h;

    /* ============================================
       MOUSE TRACKING
       mouse.x / mouse.y  — raw position
       mouse.tx / mouse.ty — smoothed (lerped) position
       mouse.nx / mouse.ny — normalised −1 → +1
    ============================================ */
    const mouse = {
        x: 0, y: 0,        // raw
        tx: 0, ty: 0,      // smoothed target (set on mousemove)
        sx: 0, sy: 0,      // current smoothed position (lerped each frame)
        nx: 0, ny: 0,      // normalised −1 → +1
        active: false
    };

    window.addEventListener('mousemove', (e) => {
        mouse.tx = e.clientX;
        mouse.ty = e.clientY;
        mouse.active = true;
    }, { passive: true });

    // On touch devices use touch position
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.tx = e.touches[0].clientX;
            mouse.ty = e.touches[0].clientY;
            mouse.active = true;
        }
    }, { passive: true });

    let resizeTimer;
    function resize() {
        w = canvas.width  = window.innerWidth;
        h = canvas.height = window.innerHeight;
        // Seed smoothed pos to center so there's no jump on load
        if (!mouse.active) {
            mouse.tx = mouse.sx = w / 2;
            mouse.ty = mouse.sy = h / 2;
        }
        initElements();
    }
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 200);
    });

    /* ============================================
       1. FLOATING TYPOGRAPHY GLYPHS
    ============================================ */
    const glyphsChars = ['A', 'Ω', '&', 'P', '"', '"', '§', '¶', 'R', 'T', '*', '?'];
    let glyphs = [];
    const glyphCount = window.innerWidth < 768 ? 14 : 28;

    class Glyph {
        constructor() {
            this.reset(true);
        }

        reset(init = false) {
            this.char    = glyphsChars[Math.floor(Math.random() * glyphsChars.length)];
            this.x       = Math.random() * w;
            this.y       = init ? Math.random() * h : (Math.random() > 0.5 ? -50 : h + 50);
            this.size    = Math.random() * 32 + 16;
            // Base drift velocity
            this.vx      = (Math.random() - 0.5) * 0.14;
            this.vy      = (Math.random() - 0.5) * 0.14;
            this.angle   = Math.random() * Math.PI * 2;
            this.vAngle  = (Math.random() - 0.5) * 0.003;
            this.alpha   = Math.random() * 0.15 + 0.08;
            // Mouse parallax depth — each glyph has a unique depth factor (0.01 – 0.06)
            // Deeper glyphs move less with the mouse, surface glyphs move more
            this.depth   = Math.random() * 0.055 + 0.01;
            const colors = ['rgba(245, 197, 24, ', 'rgba(255, 255, 255, ', 'rgba(120, 180, 255, '];
            this.colorType = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            // Autonomous drift
            this.x += this.vx;
            this.y += this.vy;
            this.angle += this.vAngle;

            // Wrap around edges
            if (this.x < -60) this.x = w + 60;
            if (this.x > w + 60) this.x = -60;
            if (this.y < -60) this.y = h + 60;
            if (this.y > h + 60) this.y = -60;
        }

        draw() {
            // Parallax offset based on smoothed mouse position
            // nx/ny are −1 to +1. Multiply by depth → gentle drift.
            const ox = mouse.nx * w * this.depth;
            const oy = mouse.ny * h * this.depth;

            ctx.save();
            ctx.translate(this.x + ox, this.y + oy);
            ctx.rotate(this.angle);
            ctx.font = `300 ${this.size}px "Playfair Display", Georgia, serif`;
            ctx.fillStyle = this.colorType + this.alpha + ')';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 6;
            ctx.shadowColor = this.colorType + '0.4)';
            ctx.fillText(this.char, 0, 0);
            ctx.restore();
        }
    }

    /* ============================================
       2. HALFTONE GRID
    ============================================ */
    const GRID_SPACING = window.innerWidth < 768 ? 40 : 35;

    function drawHalftoneGrid() {
        const cols = Math.ceil(w / GRID_SPACING);
        const rows = Math.ceil(h / GRID_SPACING);

        // Mouse influence on the grid — creates a soft magnetic ripple near the cursor
        // Each dot whose distance to the mouse is < INFLUENCE_RADIUS gets a slight boost
        const INFLUENCE_RADIUS = 140;
        const mx = mouse.sx;  // use smoothed position
        const my = mouse.sy;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let px = i * GRID_SPACING + (GRID_SPACING / 2);
                let py = j * GRID_SPACING + (GRID_SPACING / 2);

                // Offset every other row for hexagonal packing
                if (j % 2 === 0) px += GRID_SPACING / 2;

                // Ambient breathing phase from center
                let distToCenter = Math.hypot(px - w / 2, py - h / 2);
                let phase = distToCenter * 0.004 - time;
                let r = 1.0 + Math.sin(phase) * 0.6;
                if (r < 0.2) r = 0.2;

                // Mouse proximity boost — dots near cursor expand slightly
                const distToMouse = Math.hypot(px - mx, py - my);
                if (distToMouse < INFLUENCE_RADIUS) {
                    const boost = (1 - distToMouse / INFLUENCE_RADIUS) * 2.2;
                    r += boost;
                }

                ctx.beginPath();
                ctx.arc(px, py, r, 0, Math.PI * 2);

                let shimmer = (Math.sin(phase) + 1) / 2; // 0 → 1

                // Extra shimmer near mouse
                let mouseShimmer = 0;
                if (distToMouse < INFLUENCE_RADIUS) {
                    mouseShimmer = (1 - distToMouse / INFLUENCE_RADIUS) * 0.12;
                }

                ctx.fillStyle = `rgba(245, 197, 24, ${shimmer * 0.08 + 0.01 + mouseShimmer})`;
                ctx.fill();
            }
        }
    }

    function initElements() {
        glyphs = [];
        for (let i = 0; i < glyphCount; i++) {
            glyphs.push(new Glyph());
        }
    }

    let time = 0;

    function animate() {
        requestAnimationFrame(animate);
        time += 0.015;

        /* ------ SMOOTH MOUSE LERP ------
           The smoothed position (sx, sy) chases the target (tx, ty)
           with a lag factor. 0.04 = very smooth & slow (not dizzy).
           Increase toward 0.15 for snappier tracking.
        --------------------------------- */
        const LERP = 0.045;
        mouse.sx += (mouse.tx - mouse.sx) * LERP;
        mouse.sy += (mouse.ty - mouse.sy) * LERP;

        // Normalise to −1 → +1 from center
        mouse.nx = (mouse.sx / w - 0.5) * 2;
        mouse.ny = (mouse.sy / h - 0.5) * 2;

        /* ------ BACKGROUND ------ */
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0,   '#030814');
        bg.addColorStop(0.5, '#051228');
        bg.addColorStop(1,   '#030814');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        /* ------ AURORA BLOBS ------
           These now SOFTLY follow the mouse (with a large blend radius
           so the shift is atmospheric and not jarring).
        --------------------------------- */
        // Autonomous slow orbit offset
        const orbitX = Math.cos(time * 0.5) * w * 0.15;
        const orbitY = Math.sin(time * 0.3) * h * 0.15;
        // Mouse contribution (very small — just breathes toward cursor)
        const mouseInfluence = 0.08;

        const cx1 = w * 0.5 + orbitX + mouse.nx * w * mouseInfluence;
        const cy1 = h * 0.5 + orbitY + mouse.ny * h * mouseInfluence;
        const aurora1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, w * 0.45);
        aurora1.addColorStop(0, 'rgba(40, 90, 220, 0.08)');
        aurora1.addColorStop(1, 'rgba(40, 90, 220, 0)');
        ctx.fillStyle = aurora1;
        ctx.fillRect(0, 0, w, h);

        const orbitX2 = Math.cos(time * 0.3 + Math.PI) * w * 0.2;
        const orbitY2 = Math.sin(time * 0.4 + Math.PI) * h * 0.2;
        const cx2 = w * 0.5 + orbitX2 - mouse.nx * w * mouseInfluence;
        const cy2 = h * 0.5 + orbitY2 - mouse.ny * h * mouseInfluence;
        const aurora2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, w * 0.42);
        aurora2.addColorStop(0, 'rgba(245, 197, 24, 0.03)');
        aurora2.addColorStop(1, 'rgba(245, 197, 24, 0)');
        ctx.fillStyle = aurora2;
        ctx.fillRect(0, 0, w, h);

        /* ------ CURSOR SPOTLIGHT ------
           A very soft white/gold glow that follows the mouse exactly —
           like a lamp sweeping across the page. Radius is huge so it
           blends seamlessly and never feels intrusive.
        --------------------------------- */
        const spotlight = ctx.createRadialGradient(
            mouse.sx, mouse.sy, 0,
            mouse.sx, mouse.sy, 320
        );
        spotlight.addColorStop(0,   'rgba(245, 197, 24, 0.04)');
        spotlight.addColorStop(0.4, 'rgba(255, 255, 255, 0.015)');
        spotlight.addColorStop(1,   'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spotlight;
        ctx.fillRect(0, 0, w, h);

        /* ------ DEPTH LAYERS ------ */
        // 1. Far: halftone grid (with mouse proximity ripple)
        drawHalftoneGrid();

        // 2. Near: floating movable-type glyphs (with parallax offset)
        glyphs.forEach(g => {
            g.update();
            g.draw();
        });
    }

    // Clean up any legacy canvas
    const oldCanvas = document.getElementById('bg-canvas');
    if (oldCanvas) { oldCanvas.style.display = 'none'; oldCanvas.remove(); }

    resize();
    animate();
});

