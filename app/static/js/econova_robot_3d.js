/**
 * Robot 3D Hero para Econova
 * Animación interactiva del robot principal
 */

class EconovaRobot3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.robot = null;
        this.animationId = null;
        this.isAnimating = false;

        this.init();
        this.createRobot();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);

        // Crear cámara
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 5);

        // Crear renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Agregar renderer al contenedor
        this.container.appendChild(this.renderer.domElement);

        // Iluminación
        this.setupLighting();

        // Controles de órbita (opcional)
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = false;
            this.controls.enablePan = false;
        }
    }

    setupLighting() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Luz direccional principal
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Luz puntual para efectos
        const pointLight = new THREE.PointLight(0x00ffff, 0.5, 100);
        pointLight.position.set(-5, 5, 5);
        this.scene.add(pointLight);

        // Luz de relleno
        const fillLight = new THREE.DirectionalLight(0xff6b6b, 0.3);
        fillLight.position.set(-5, -5, -5);
        this.scene.add(fillLight);
    }

    createRobot() {
        this.robot = new THREE.Group();

        // Cuerpo principal (torso)
        const torsoGeometry = new THREE.CylinderGeometry(0.8, 1.2, 2, 16);
        const torsoMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            shininess: 100,
            specular: 0x111111
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.castShadow = true;
        this.robot.add(torso);

        // Cabeza
        const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 100
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        head.castShadow = true;
        this.robot.add(head);

        // Ojos
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2, 1.7, 0.4);
        this.robot.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2, 1.7, 0.4);
        this.robot.add(rightEye);

        // Antena
        const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
        const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.y = 2.2;
        this.robot.add(antenna);

        // Brazo izquierdo
        const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0x4ecdc4 });
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-1.2, 0.2, 0);
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        this.robot.add(leftArm);

        // Brazo derecho
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(1.2, 0.2, 0);
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        this.robot.add(rightArm);

        // Pierna izquierda
        const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x45b7d1 });
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.4, -2, 0);
        leftLeg.castShadow = true;
        this.robot.add(leftLeg);

        // Pierna derecha
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.4, -2, 0);
        rightLeg.castShadow = true;
        this.robot.add(rightLeg);

        // Base circular
        const baseGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 16);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x2c3e50,
            shininess: 30
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -2.8;
        base.receiveShadow = true;
        this.robot.add(base);

        this.scene.add(this.robot);

        // Guardar referencias para animación
        this.head = head;
        this.leftArm = leftArm;
        this.rightArm = rightArm;
        this.antenna = antenna;
        this.leftEye = leftEye;
        this.rightEye = rightEye;
    }

    setupEventListeners() {
        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });

        // Interacción con mouse
        this.container.addEventListener('mouseenter', () => {
            this.isAnimating = true;
        });

        this.container.addEventListener('mouseleave', () => {
            this.isAnimating = false;
        });

        // Click para activar animación especial
        this.container.addEventListener('click', () => {
            this.activateSpecialAnimation();
        });
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Rotación base del robot
        this.robot.rotation.y += 0.005;

        // Animación de cabeza (mirando alrededor)
        this.head.rotation.y = Math.sin(time * 0.5) * 0.3;
        this.head.rotation.x = Math.sin(time * 0.3) * 0.1;

        // Animación de brazos
        this.leftArm.rotation.x = Math.sin(time * 1.5) * 0.2 + Math.PI / 6;
        this.rightArm.rotation.x = Math.sin(time * 1.5 + Math.PI) * 0.2 - Math.PI / 6;

        // Animación de antena
        this.antenna.rotation.z = Math.sin(time * 2) * 0.1;

        // Efecto de ojos parpadeantes
        const blinkIntensity = Math.sin(time * 3) > 0.95 ? 0.1 : 1;
        this.leftEye.material.opacity = blinkIntensity;
        this.rightEye.material.opacity = blinkIntensity;

        // Animación especial cuando está activo
        if (this.isAnimating) {
            this.robot.position.y = Math.sin(time * 2) * 0.1;
            this.robot.rotation.z = Math.sin(time * 1.8) * 0.05;
        } else {
            this.robot.position.y = 0;
            this.robot.rotation.z = 0;
        }

        // Actualizar controles si existen
        if (this.controls) {
            this.controls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    activateSpecialAnimation() {
        // Animación especial al hacer click
        const originalY = this.robot.position.y;
        let animationProgress = 0;
        const animationDuration = 1000; // 1 segundo
        const startTime = Date.now();

        const animateSpecial = () => {
            const elapsed = Date.now() - startTime;
            animationProgress = Math.min(elapsed / animationDuration, 1);

            // Salto parabólico
            const jumpHeight = Math.sin(animationProgress * Math.PI) * 2;
            this.robot.position.y = originalY + jumpHeight;

            // Rotación rápida
            this.robot.rotation.y += 0.2;

            if (animationProgress < 1) {
                requestAnimationFrame(animateSpecial);
            } else {
                this.robot.position.y = originalY;
            }
        };

        animateSpecial();
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.renderer) {
            this.container.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si Three.js está disponible
    if (typeof THREE === 'undefined') {
        console.warn('Three.js no está cargado. Usando animación CSS alternativa.');
        // Crear robot CSS alternativo
        window.econovaRobot = new EconovaRobotCSS('robot-container');
        return;
    }

    // Crear instancia del robot 3D
    window.econovaRobot = new EconovaRobot3D('robot-container');
});

// Clase alternativa CSS para cuando Three.js no está disponible
class EconovaRobotCSS {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        this.isAnimating = false;
        this.animationInterval = null;

        this.createCSSRobot();
        this.setupEventListeners();
        this.startIdleAnimation();

        console.log('🤖 Robot CSS alternativo creado');
    }

    createCSSRobot() {
        // Limpiar contenedor
        this.container.innerHTML = '';

        // Crear estructura del robot con CSS
        const robotHTML = `
            <div class="css-robot">
                <!-- Antena -->
                <div class="robot-antenna">
                    <div class="antenna-light"></div>
                </div>

                <!-- Cabeza -->
                <div class="robot-head">
                    <div class="robot-eye left-eye"></div>
                    <div class="robot-eye right-eye"></div>
                    <div class="robot-mouth"></div>
                </div>

                <!-- Cuerpo -->
                <div class="robot-body">
                    <div class="robot-chest">
                        <div class="robot-screen">
                            <div class="screen-content">
                                <div class="screen-line line-1"></div>
                                <div class="screen-line line-2"></div>
                                <div class="screen-line line-3"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Brazos -->
                <div class="robot-arm left-arm"></div>
                <div class="robot-arm right-arm"></div>

                <!-- Piernas -->
                <div class="robot-leg left-leg"></div>
                <div class="robot-leg right-leg"></div>

                <!-- Base -->
                <div class="robot-base"></div>
            </div>
        `;

        // Estilos CSS para el robot
        const robotCSS = `
            <style>
                .css-robot {
                    position: relative;
                    width: 200px;
                    height: 300px;
                    margin: 0 auto;
                    transform-style: preserve-3d;
                }

                /* Antena */
                .robot-antenna {
                    position: absolute;
                    top: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 30px;
                    background: var(--color-secondary, #ff6b6b);
                    border-radius: 2px;
                }

                .antenna-light {
                    position: absolute;
                    top: -5px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 8px;
                    height: 8px;
                    background: var(--color-accent, #4ecdc4);
                    border-radius: 50%;
                    animation: antenna-glow 2s ease-in-out infinite alternate;
                }

                @keyframes antenna-glow {
                    from { opacity: 0.5; transform: translateX(-50%) scale(1); }
                    to { opacity: 1; transform: translateX(-50%) scale(1.2); }
                }

                /* Cabeza */
                .robot-head {
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80px;
                    height: 80px;
                    background: var(--color-primary, #00ffff);
                    border-radius: 40px 40px 20px 20px;
                    border: 3px solid var(--color-text, #333);
                }

                .robot-eye {
                    position: absolute;
                    top: 25px;
                    width: 12px;
                    height: 12px;
                    background: var(--color-error, #f44336);
                    border-radius: 50%;
                    animation: eye-blink 3s ease-in-out infinite;
                }

                .left-eye { left: 20px; }
                .right-eye { right: 20px; }

                @keyframes eye-blink {
                    0%, 95%, 100% { opacity: 1; }
                    97.5% { opacity: 0.1; }
                }

                .robot-mouth {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 20px;
                    height: 8px;
                    background: var(--color-text, #333);
                    border-radius: 4px;
                }

                /* Cuerpo */
                .robot-body {
                    position: absolute;
                    top: 100px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100px;
                    height: 120px;
                }

                .robot-chest {
                    width: 100%;
                    height: 100%;
                    background: var(--color-surface, #f8f9fa);
                    border: 3px solid var(--color-text, #333);
                    border-radius: 15px;
                    position: relative;
                }

                .robot-screen {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    right: 15px;
                    bottom: 15px;
                    background: var(--color-background, #121212);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .screen-content {
                    padding: 10px;
                }

                .screen-line {
                    height: 3px;
                    background: var(--color-primary, #00ffff);
                    margin-bottom: 5px;
                    border-radius: 1px;
                    animation: screen-scan 2s linear infinite;
                }

                .line-1 { animation-delay: 0s; }
                .line-2 { animation-delay: 0.5s; }
                .line-3 { animation-delay: 1s; }

                @keyframes screen-scan {
                    0% { width: 0%; opacity: 0; }
                    50% { width: 100%; opacity: 1; }
                    100% { width: 100%; opacity: 0; }
                }

                /* Brazos */
                .robot-arm {
                    position: absolute;
                    top: 120px;
                    width: 20px;
                    height: 60px;
                    background: var(--color-accent, #4ecdc4);
                    border: 2px solid var(--color-text, #333);
                    border-radius: 10px;
                }

                .left-arm {
                    left: 20px;
                    transform-origin: top center;
                    animation: arm-wave-left 3s ease-in-out infinite;
                }

                .right-arm {
                    right: 20px;
                    transform-origin: top center;
                    animation: arm-wave-right 3s ease-in-out infinite;
                }

                @keyframes arm-wave-left {
                    0%, 100% { transform: rotate(10deg); }
                    50% { transform: rotate(-10deg); }
                }

                @keyframes arm-wave-right {
                    0%, 100% { transform: rotate(-10deg); }
                    50% { transform: rotate(10deg); }
                }

                /* Piernas */
                .robot-leg {
                    position: absolute;
                    top: 220px;
                    width: 25px;
                    height: 50px;
                    background: var(--color-info, #2196f3);
                    border: 2px solid var(--color-text, #333);
                    border-radius: 12px;
                }

                .left-leg { left: 37px; }
                .right-leg { right: 37px; }

                /* Base */
                .robot-base {
                    position: absolute;
                    top: 270px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 120px;
                    height: 15px;
                    background: var(--color-text, #333);
                    border-radius: 50%;
                    opacity: 0.8;
                }

                /* Animación hover */
                .css-robot:hover .robot-arm {
                    animation-duration: 1s;
                }

                .css-robot:hover .robot-head {
                    animation: head-nod 1s ease-in-out;
                }

                @keyframes head-nod {
                    0%, 100% { transform: translateX(-50%) rotate(0deg); }
                    25% { transform: translateX(-50%) rotate(-5deg); }
                    75% { transform: translateX(-50%) rotate(5deg); }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .css-robot {
                        width: 150px;
                        height: 225px;
                    }

                    .robot-head {
                        width: 60px;
                        height: 60px;
                    }

                    .robot-body {
                        width: 75px;
                        height: 90px;
                    }

                    .robot-arm {
                        width: 15px;
                        height: 45px;
                    }

                    .robot-leg {
                        width: 18px;
                        height: 37px;
                        top: 165px;
                    }

                    .robot-base {
                        width: 90px;
                        top: 202px;
                    }
                }
            </style>
        `;

        this.container.innerHTML = robotCSS + robotHTML;
    }

    setupEventListeners() {
        const robot = this.container.querySelector('.css-robot');

        if (robot) {
            robot.addEventListener('mouseenter', () => {
                this.isAnimating = true;
                robot.style.animation = 'robot-excited 0.5s ease-in-out';
            });

            robot.addEventListener('mouseleave', () => {
                this.isAnimating = false;
                robot.style.animation = '';
            });

            robot.addEventListener('click', () => {
                this.activateSpecialAnimation();
            });
        }
    }

    startIdleAnimation() {
        // Animación sutil continua
        this.animationInterval = setInterval(() => {
            const robot = this.container.querySelector('.css-robot');
            if (robot && !this.isAnimating) {
                const randomDelay = Math.random() * 5000 + 2000; // 2-7 segundos
                setTimeout(() => {
                    if (!this.isAnimating) {
                        robot.style.transform = `translateY(${Math.random() * 5 - 2.5}px)`;
                        setTimeout(() => {
                            if (!this.isAnimating) {
                                robot.style.transform = '';
                            }
                        }, 500);
                    }
                }, randomDelay);
            }
        }, 1000);
    }

    activateSpecialAnimation() {
        const robot = this.container.querySelector('.css-robot');
        if (robot) {
            // Animación de salto
            robot.style.animation = 'robot-jump 0.8s ease-in-out';

            // Cambiar colores temporalmente
            const originalColors = {
                head: robot.querySelector('.robot-head').style.background,
                chest: robot.querySelector('.robot-chest').style.background
            };

            robot.querySelector('.robot-head').style.background = 'var(--color-accent, #4ecdc4)';
            robot.querySelector('.robot-chest').style.background = 'var(--color-primary, #00ffff)';

            setTimeout(() => {
                robot.querySelector('.robot-head').style.background = originalColors.head;
                robot.querySelector('.robot-chest').style.background = originalColors.chest;
                robot.style.animation = '';
            }, 800);
        }
    }

    dispose() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
    }

    init() {
        // Método de compatibilidad
        return this;
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EconovaRobot3D, EconovaRobotCSS };
}
