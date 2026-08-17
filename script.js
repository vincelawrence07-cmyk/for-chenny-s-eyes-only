document.addEventListener("DOMContentLoaded", () => {
    const yesBtn = document.getElementById("yesBtn");
    const noBtn = document.getElementById("noBtn");
    const questionScreen = document.getElementById("question-screen");
    const climaxScreen = document.getElementById("climax-screen");
    
    const loveBgText = document.getElementById("love-bg-text");
    const envelopeTrigger = document.getElementById("envelope-trigger");
    const envelopeFlap = document.querySelector(".envelope-icon > div:first-child");
    
    const letterOverlay = document.getElementById("letter-overlay");
    const letterBox = document.getElementById("letter-box");
    const letterTextElement = document.getElementById("letter-text");
    const signature = document.getElementById("letter-signature");
    const closeBtn = document.getElementById("closeBtn");
    const bgMusic = document.getElementById("bgMusic");

    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    
    let W = window.innerWidth;
    let H = window.innerHeight;
    let CX = W / 2;
    let CY = H / 2;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let scale = Math.min(W, H) * 0.22;

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        CX = W / 2;
        CY = H / 2;
        scale = Math.min(W, H) * 0.22;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    const NUM_POINTS = 220;
    const ROTATION_SPEED_Y = 0.012;

    const WORDS = [
        'I love you', 'I love you', '❤', 'Love', 'Sorry', 'darling',
        'Forever', 'Always', 'You', 'You & I', 'Love you', 'Sweetheart'
    ];

    const secretMessage = "Chenny, I'm sorry if I hurt you that night, trust me, I didn't mean to. It's just that I can't bear seeing you argue with your familiy—just because of me. You have all the rights to be mad at me and I completely understand if you decide to reject this. I’ll be here waiting, and hopefully, when the time comes that it’s possible, it will be possible. "
    let isFixed = false;
    let isTyping = false;
    let typingTimeout;
    let canvasActive = false;
    let startTimestamp = null;

    function moveNoButton() {
        const rect = noBtn.getBoundingClientRect();
        
        if (!isFixed) {
            noBtn.style.position = 'fixed';
            noBtn.style.left = rect.left + 'px';
            noBtn.style.top = rect.top + 'px';
            noBtn.style.margin = '0';
            noBtn.style.zIndex = '999';
            isFixed = true;
        }

        const pad = 40;
        const maxX = window.innerWidth - rect.width - pad;
        const maxY = window.innerHeight - rect.height - pad;

        let newX = Math.random() * (maxX - pad) + pad;
        let newY = Math.random() * (maxY - pad) + pad;

        const yesRect = yesBtn.getBoundingClientRect();
        const buffer = 80;

        while (
            newX < yesRect.right + buffer &&
            newX + rect.width > yesRect.left - buffer &&
            newY < yesRect.bottom + buffer &&
            newY + rect.height > yesRect.top - buffer
        ) {
            newX = Math.random() * (maxX - pad) + pad;
            newY = Math.random() * (maxY - pad) + pad;
        }

        gsap.to(noBtn, {
            left: newX,
            top: newY,
            duration: 0.2,
            ease: "power2.out"
        });
    }

    noBtn.addEventListener("mouseenter", moveNoButton);
    noBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        moveNoButton();
    });

    yesBtn.addEventListener("click", () => {
        bgMusic.volume = 0.5;
        bgMusic.play().catch(err => console.log("Audio play prevented:", err));

        noBtn.style.pointerEvents = "none";
        
        gsap.to(questionScreen, {
            opacity: 0,
            scale: 0.8,
            duration: 0.6,
            ease: "power3.inOut",
            onComplete: () => {
                questionScreen.style.display = "none";
                show3DClimax();
            }
        });
    });

    function show3DClimax() {
        climaxScreen.classList.remove("hidden-state");
        canvas.classList.remove("hidden-state");
        
        canvasActive = true;
        startTimestamp = performance.now();
        requestAnimationFrame(loop);

        gsap.timeline()
            .to(loveBgText, {
                scale: 1,
                opacity: 1,
                y: -120,
                duration: 1.2,
                ease: "back.out(1.2)"
            })
            .to(envelopeTrigger, {
                scale: 1,
                duration: 0.8,
                ease: "back.out(1.5)"
            }, "-=0.6");
    }

    envelopeTrigger.addEventListener("click", () => {
        gsap.to(envelopeFlap, {
            rotateX: 180,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: openLetterOverlay
        });
    });

    function openLetterOverlay() {
        letterOverlay.classList.remove("hidden-state");
        gsap.set(letterOverlay, { opacity: 0 });
        gsap.set(letterBox, { y: 120, scale: 0.95 });
        
        gsap.to(letterOverlay, {
            opacity: 1,
            duration: 0.4
        });

        gsap.to(letterBox, {
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
            onComplete: () => {
                startTypingLetter();
                fireLetterConfetti();
            }
        });
    }

    function startTypingLetter() {
        if (isTyping) return;
        isTyping = true;
        
        letterTextElement.innerHTML = "";
        signature.style.opacity = 0;
        signature.style.transform = "translateY(16px)";

        let i = 0;
        const typingSpeed = 35;

        function typeWriter() {
            if (i < secretMessage.length) {
                letterTextElement.innerHTML += secretMessage.charAt(i);
                i++;
                typingTimeout = setTimeout(typeWriter, typingSpeed);
            } else {
                isTyping = false;
                gsap.to(signature, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out"
                });
            }
        }
        typeWriter();
    }

    closeBtn.addEventListener("click", () => {
        clearTimeout(typingTimeout);
        isTyping = false;

        gsap.to(letterBox, {
            y: 100,
            scale: 0.95,
            duration: 0.5,
            ease: "power3.in"
        });

        gsap.to(letterOverlay, {
            opacity: 0,
            duration: 0.4,
            onComplete: () => {
                letterOverlay.classList.add("hidden-state");
                gsap.to(envelopeFlap, {
                    rotateX: 0,
                    duration: 0.4,
                    ease: "power2.inOut"
                });
            }
        });
    });

    function fireLetterConfetti() {
        const myConfetti = confetti.create(document.getElementById('confetti-canvas'), {
            resize: true,
            useWorker: true
        });

        let duration = 2.5 * 1000;
        let end = Date.now() + duration;

        (function frame() {
            myConfetti({
                particleCount: 4,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ff4f81', '#ff7ca3', '#ffffff', '#ffd7e4']
            });
            myConfetti({
                particleCount: 4,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ff4f81', '#ff7ca3', '#ffffff', '#ffd7e4']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    const particlesContainer = document.getElementById("particles");
    for (let i = 0; i < 40; i++) {
        let p = document.createElement("div");
        p.className = "particle";
        
        let size = Math.random() * 4 + 1.5;
        p.style.width = size + "px";
        p.style.height = size + "px";
        
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh";
        p.style.opacity = Math.random() * 0.5 + 0.15;
        
        particlesContainer.appendChild(p);

        gsap.to(p, {
            y: `-=${Math.random() * 180 + 60}`,
            x: `+=${Math.random() * 80 - 40}`,
            opacity: 0,
            duration: Math.random() * 6 + 6,
            repeat: -1,
            ease: "none",
            onRepeat: () => {
                p.style.top = "110vh";
                p.style.left = Math.random() * 100 + "vw";
                p.style.opacity = Math.random() * 0.5 + 0.15;
            }
        });
    }

    function getHeartPoint(t, layer) {
        const x = Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
        const r = Math.sqrt(1 - layer * layer);
        const depthScale = 0.45 + 0.55 * r;

        return {
            x: x * depthScale * 1.5,
            y: (y * depthScale - 0.08) * 1.5,
            z: layer * 0.7
        };
    }

    function project3D(point, rotY, rotX) {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = point.x * cosY - point.z * sinY;
        const z1 = point.x * sinY + point.z * cosY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = point.y * cosX - z1 * sinX;
        const z2 = point.y * sinX + z1 * cosX;

        const dist = 3.5;
        const perspective = dist / (dist + z2);

        point.projX = CX + x1 * scale * perspective;
        point.projY = CY + (y2 * scale * perspective) - 30;
        point.projZ = z2;
        point.projScale = perspective;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    class Particle3D {
        constructor(index) {
            this.index = index;
            this.text = WORDS[index % WORDS.length];

            const spanX = W / scale;
            const spanY = H / scale;

            this.rainX = (Math.random() - 0.5) * spanX * 1.1;
            this.rainY = -spanY * 0.65 - Math.random() * spanY * 0.5;
            this.rainZ = (Math.random() - 0.5) * 0.4;

            this.speedY = Math.random() * 0.03 + 0.03;
            this.speedX = (Math.random() - 0.5) * 0.001;

            const theta = (index / NUM_POINTS) * Math.PI * 2 * 7;
            const layer = (index / NUM_POINTS) * 2 - 1;
            const hp = getHeartPoint(theta, layer);

            this.targetX = hp.x;
            this.targetY = hp.y;
            this.targetZ = hp.z;

            this.x = this.rainX;
            this.y = this.rainY;
            this.z = this.rainZ;

            this.trail = [];
            this.maxTrail = 4;

            this.assembleDelay = Math.random() * 0.4;
            this.fontSize = Math.random() < 0.25 ? 13 : (Math.random() < 0.7 ? 11 : 9);
            this.weight = '600';
            this.opacity = Math.random() * 0.3 + 0.7;
            this.noiseOffset = Math.random() * 100;
        }

        update(phase, progress, rotY, rotX, beatFactor, time) {
            const spanY = H / scale;

            if (phase === 'rain') {
                this.rainY += this.speedY;
                this.rainX += this.speedX;

                if (this.rainY > spanY * 0.6) {
                    this.rainY = -spanY * 0.65;
                    this.rainX = (Math.random() - 0.5) * (W / scale) * 1.1;
                    this.trail = [];
                }
                this.x = this.rainX;
                this.y = this.rainY;
                this.z = this.rainZ;

            } else if (phase === 'assemble') {
                const adjProgress = Math.max(0, Math.min(1, (progress - this.assembleDelay) / (1 - this.assembleDelay)));
                const t = easeInOutCubic(adjProgress);

                this.x = lerp(this.rainX, this.targetX * beatFactor, t);
                this.y = lerp(this.rainY, this.targetY * beatFactor, t);
                this.z = lerp(this.rainZ, this.targetZ * beatFactor, t);

            } else if (phase === 'beating') {
                const wave = Math.sin(time * 2.5 + this.noiseOffset) * 0.02;
                this.x = (this.targetX + wave) * beatFactor;
                this.y = (this.targetY + wave) * beatFactor;
                this.z = (this.targetZ + wave) * beatFactor;
            }

            const currentRotY = phase === 'rain' ? 0 : rotY;
            const currentRotX = phase === 'rain' ? 0.05 : rotX;

            project3D(this, currentRotY, currentRotX);

            if (phase !== 'beating') {
                this.trail.push({ x: this.projX, y: this.projY });
                if (this.trail.length > this.maxTrail) {
                    this.trail.shift();
                }
            } else {
                this.trail = [];
            }
        }
    }

    class Sparkle {
        constructor() {
            this.x = CX + (Math.random() - 0.5) * 40;
            this.y = CY + (Math.random() - 0.5) * 40 - 40;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - Math.random() * 1.2;
            this.size = Math.random() * 2.5 + 1;
            this.alpha = 1;
            this.decay = Math.random() * 0.025 + 0.02;
            this.isHeart = Math.random() < 0.4;

            const colors = [
                { r: 255, g: 45, b: 85 },
                { r: 196, g: 71, b: 245 },
                { r: 255, g: 107, b: 157 }
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.96;
            this.vy *= 0.96;
            this.vy += 0.04;
            this.alpha -= this.decay;
        }

        draw() {
            if (this.alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;

            if (this.isHeart) {
                const s = this.size * 2.5;
                ctx.translate(this.x, this.y);
                ctx.beginPath();
                ctx.moveTo(0, s * 0.3);
                ctx.bezierCurveTo(-s * 0.5, -s * 0.2, -s, s * 0.1, 0, s);
                ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.2, 0, s * 0.3);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    class BackgroundStar {
        constructor() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.size = Math.random() * 1.2 + 0.3;
            this.baseAlpha = Math.random() * 0.25 + 0.05;
            this.speed = Math.random() * 0.02 + 0.005;
            this.offset = Math.random() * Math.PI * 2;
        }

        draw(time) {
            const alpha = this.baseAlpha + Math.sin(time * this.speed + this.offset) * 0.08;
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.02, alpha)})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const heartParticles = [];
    for (let i = 0; i < NUM_POINTS; i++) {
        heartParticles.push(new Particle3D(i));
    }

    const bgStars = [];
    for (let i = 0; i < 70; i++) {
        bgStars.push(new BackgroundStar());
    }

    let sparkles = [];
    let rotY = 0;
    let rotX = 0.2;

    const RAIN_DURATION = 1500;
    const ASSEMBLE_DURATION = 1800;
    let beatIntensity = 0;

    function triggerBeatExplosion() {
        const count = Math.floor(Math.random() * 5) + 8;
        for (let i = 0; i < count; i++) {
            sparkles.push(new Sparkle());
        }
    }

    function loop(now) {
        if (!canvasActive) return;

        const elapsed = now - startTimestamp;
        const time = now * 0.001;
        ctx.clearRect(0, 0, W, H);

        bgStars.forEach(star => star.draw(time));

        let phase = 'rain';
        let progress = 0;

        if (elapsed < RAIN_DURATION) {
            phase = 'rain';
            progress = elapsed / RAIN_DURATION;
        } else if (elapsed < RAIN_DURATION + ASSEMBLE_DURATION) {
            phase = 'assemble';
            progress = (elapsed - RAIN_DURATION) / ASSEMBLE_DURATION;
        } else {
            phase = 'beating';
            progress = 1.0;
        }

        let beatFactor = 1.0;
        if (phase === 'beating') {
            const beatCycle = 1500;
            const cycleProgress = (elapsed - (RAIN_DURATION + ASSEMBLE_DURATION)) % beatCycle;

            if (cycleProgress < 140) {
                const t = cycleProgress / 140;
                beatFactor = 1.0 + Math.sin(t * Math.PI) * 0.15;
                beatIntensity = Math.sin(t * Math.PI);
            } else if (cycleProgress >= 260 && cycleProgress < 410) {
                const t = (cycleProgress - 260) / 150;
                beatFactor = 1.0 + Math.sin(t * Math.PI) * 0.11;
                beatIntensity = Math.sin(t * Math.PI) * 0.7;
            } else {
                beatFactor = 1.0;
                beatIntensity = Math.max(0, beatIntensity - 0.04);
            }

            const triggerTolerance = 16;
            if (Math.abs(cycleProgress - 70) < triggerTolerance && sparkles.length < 25) {
                triggerBeatExplosion();
            }
            if (Math.abs(cycleProgress - 335) < triggerTolerance && sparkles.length < 25) {
                triggerBeatExplosion();
            }
        }

        const glowOpacity = phase === 'beating' ? 0.04 + beatIntensity * 0.08 : 0.02;
        const radialGlow = ctx.createRadialGradient(CX, CY - 30, 10, CX, CY - 30, Math.max(W, H) * 0.4);
        radialGlow.addColorStop(0, `rgba(255, 45, 85, ${glowOpacity})`);
        radialGlow.addColorStop(0.5, `rgba(196, 71, 245, ${glowOpacity * 0.3})`);
        radialGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = radialGlow;
        ctx.fillRect(0, 0, W, H);

        if (phase !== 'rain') {
            rotY += ROTATION_SPEED_Y;
            rotX = 0.25 + Math.sin(time * 0.8) * 0.1;
        }

        for (let i = 0; i < NUM_POINTS; i++) {
            heartParticles[i].update(phase, progress, rotY, rotX, beatFactor, time);
        }

        heartParticles.sort((a, b) => a.projZ - b.projZ);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let lastFont = '';
        let lastColor = '';

        for (let i = 0; i < NUM_POINTS; i++) {
            const p = heartParticles[i];
            const zNorm = (p.projZ + 0.8) / 1.6;

            if (phase === 'beating' && zNorm > 0.55) {
                continue;
            }

            if (phase !== 'beating' && p.trail.length > 1) {
                const trailLen = p.trail.length;
                for (let j = 0; j < trailLen - 1; j++) {
                    const trailPos = p.trail[j];
                    const trailAlpha = (p.opacity * (j / trailLen) * 0.2).toFixed(2);

                    ctx.font = `${p.weight} ${Math.max(5, Math.round(p.fontSize * 0.7 * p.projScale))}px 'Plus Jakarta Sans', sans-serif`;
                    ctx.fillStyle = `rgba(255, 45, 85, ${trailAlpha})`;
                    ctx.fillText(p.text, trailPos.x, trailPos.y);
                }
                lastFont = '';
                lastColor = '';
            }

            const fSize = Math.max(7, Math.round(p.fontSize * p.projScale));
            const fontStr = `${p.weight} ${fSize}px 'Plus Jakarta Sans', sans-serif`;
            if (fontStr !== lastFont) {
                ctx.font = fontStr;
                lastFont = fontStr;
            }

            let r, g, b;
            if (phase === 'rain') {
                r = 255; g = 45; b = 85;
            } else {
                if (zNorm < 0.5) {
                    const t = zNorm * 2;
                    r = 255; g = Math.round(45 + t * 45); b = Math.round(85 + t * 45);
                } else {
                    const t = (zNorm - 0.5) * 2;
                    r = Math.round(255 - t * 80); g = Math.round(90 - t * 40); b = Math.round(130 + t * 100);
                }
            }

            let alpha = p.opacity * Math.max(0.15, (1.2 - zNorm));
            if (phase === 'beating') {
                if (zNorm > 0.45) {
                    alpha *= (0.55 - zNorm) / 0.1;
                }
            }

            const colorStr = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
            if (colorStr !== lastColor) {
                ctx.fillStyle = colorStr;
                lastColor = colorStr;
            }

            ctx.fillText(p.text, p.projX, p.projY);
        }

        sparkles = sparkles.filter(s => {
            s.update();
            s.draw();
            return s.alpha > 0;
        });

        const vignetteGlow = ctx.createRadialGradient(CX, CY, Math.min(W, H) * 0.3, CX, CY, Math.max(W, H) * 0.8);
        vignetteGlow.addColorStop(0, 'rgba(2, 0, 5, 0)');
        vignetteGlow.addColorStop(1, 'rgba(2, 0, 5, 0.7)');
        ctx.fillStyle = vignetteGlow;
        ctx.fillRect(0, 0, W, H);

        requestAnimationFrame(loop);
    }
});