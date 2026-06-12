        const canvas = document.getElementById('firefliesCanvas');
        const ctx = canvas.getContext('2d');

        // --- GESTION DU MENU ET DES COULEURS ---
        const settingsButton = document.getElementById('settings-button');
        const settingsPanel = document.getElementById('settings-panel');
        const colorButtons = document.querySelectorAll('.color-btn');

        // 1. Définition des thèmes de couleurs (Cœur lumineux et Halo)
        const colorThemes = {
            original: {
                core: '235, 255, 120', // RGB pur sans 'rgba()'
                halo: '160, 240, 80'
            },
            cyan: {
                core: '120, 255, 255',
                halo: '80, 240, 192'
            },
            blue: {
                core: '120, 170, 255',
                halo: '80, 80, 240'
            },
            magenta: {
                core: '255, 120, 234',
                halo: '240, 80, 80'
            }
        };

        // Variable globale contenant le thème actif
        let activeTheme = colorThemes.original;

        // 2. Logique d'ouverture/fermeture du menu
        settingsButton.addEventListener('click', () => {
            settingsPanel.classList.toggle('open');
        });

        // 3. Logique de changement de couleur
        colorButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Mettre à jour l'état visuel des boutons
                document.querySelector('.color-btn.active').classList.remove('active');
                button.classList.add('active');

                // Récupérer le nom de la couleur et appliquer le thème
                const colorName = button.getAttribute('data-color');
                activeTheme = colorThemes[colorName];
                
                // Optionnel : fermer le menu après sélection
                settingsPanel.classList.remove('open');
            });
        });


        // --- LOGIQUE EXISTANTE DU CANVAS (MODIFIÉE POUR LES COULEURS) ---

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const Perlin = {
            rand_next: 0,
            init: function() { this.rand_next = Math.random(); },
            noise2D: function(x, y) {
                let t = Math.sin(x * 0.1) * Math.cos(y * 0.1) + Math.sin(x * 0.05);
                t += Math.cos(x * 0.01 + y * 0.02);
                return (t + 2) / 4;
            }
        };
        Perlin.init();

        const FIREFLY_COUNT = 120;
        const fireflies = [];

        class Firefly {
            constructor() {
                this.reset();
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 50; 
                this.size = Math.random() * 2.5 + 1;
                this.speed = Math.random() * 0.4 + 0.2;
                this.alphaChange = Math.random() * 0.03 + 0.01;
                this.alpha = Math.random();
                this.maxAlpha = Math.random() * 0.6 + 0.4;
                this.growing = Math.random() > 0.5;
                this.noiseSeedX = Math.random() * 1000;
                this.noiseSeedY = Math.random() * 1000;
            }

            update(time) {
                let angle = Perlin.noise2D(this.x * 0.005 + this.noiseSeedX, this.y * 0.005 + time * 0.002) * Math.PI * 4;
                this.x += Math.cos(angle) * this.speed;
                this.y += Math.sin(angle) * this.speed - (this.speed * 0.5); 

                if (this.growing) {
                    this.alpha += this.alphaChange;
                    if (this.alpha >= this.maxAlpha) this.growing = false;
                } else {
                    this.alpha -= this.alphaChange;
                    if (this.alpha <= 0.1) this.growing = true;
                }

                if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20) {
                    this.reset();
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                
                // Effet de halo lumineux (Glow) modifié pour utiliser activeTheme
                let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 5);
                
                // Construction dynamique des chaînes rgba() à partir du thème actif
                gradient.addColorStop(0, `rgba(${activeTheme.core}, 1)`);   
                gradient.addColorStop(0.2, `rgba(${activeTheme.halo}, 0.8)`);
                gradient.addColorStop(1, `rgba(${activeTheme.halo}, 0)`);     

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < FIREFLY_COUNT; i++) {
            fireflies.push(new Firefly());
        }

        function drawFog(time) {
            let fog1 = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 10, canvas.width/2, canvas.height/2, canvas.width * 0.8);
            let pulse = Math.sin(time * 0.001) * 0.02;
            fog1.addColorStop(0, `rgba(15, 30, 25, ${0.2 + pulse})`);
            fog1.addColorStop(0.5, 'rgba(8, 20, 15, 0.1)');
            fog1.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = fog1;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        function animate(time) {
            ctx.fillStyle = 'rgba(5, 11, 10, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawFog(time);
            fireflies.forEach(firefly => {
                firefly.update(time);
                firefly.draw();
            });
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
