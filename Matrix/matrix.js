
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- CONFIGURATION ---
const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
const STREAM_COUNT = 150; 
const CHARS_PER_STREAM = 30;

let scene, camera, renderer, composer;
let streams = [];

// 1. Création d'une texture dynamique pour les caractères matriciels
function createCharTexture(char, isHead) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 64, 64);
    
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (isHead) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 10;
    } else {
        ctx.fillStyle = '#00ff66';
    }
    
    ctx.fillText(char, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Pré-génération de quelques textures pour optimiser les performances
const textures = [];
const headTextures = [];
for(let i = 0; i < CHARS.length; i++) {
    textures.push(createCharTexture(CHARS[i], false));
    headTextures.push(createCharTexture(CHARS[i], true));
}

function init() {
    // Masquer le texte de chargement
    document.getElementById('loading').style.display = 'none';

    // --- SCÈNE & CAMÉRA ---
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.007); // Simule le Flou de profondeur / effet de distance

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Position initiale de la caméra au cœur du flux
    camera.position.set(0, 0, 50);

    // --- RENDERER ---
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // --- POST-PROCESSING (BLOOM / GLOW EFFECT) ---
    const renderScene = new RenderPass(scene, camera);
    // Paramètres du Bloom : Résolution, Force, Rayon, Seuil
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight), 
        2.0,  // Force de la lueur
        0.4,  // Rayon
        0.1   // Seuil de luminosité
    );

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- CRÉATION DES FLUX DE CODE (STREAMS) ---
    for (let i = 0; i < STREAM_COUNT; i++) {
        const streamGroup = new THREE.Group();
        
        // Dispersion aléatoire en 3D (X, Y, Z)
        const x = (Math.random() - 0.5) * 200;
        const y = Math.random() * 100 + 50; // Commence en haut
        const z = (Math.random() - 0.5) * 300; // Profondeur importante
        
        streamGroup.position.set(x, y, z);
        
        const speed = 1.5 + Math.random() * 2;
        const charMeshes = [];

        // Générer les caractères de la ligne
        for (let j = 0; j < CHARS_PER_STREAM; j++) {
            const isHead = (j === 0);
            const randIndex = Math.floor(Math.random() * CHARS.length);
            const texture = isHead ? headTextures[randIndex] : textures[randIndex];
            
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: isHead ? 1.0 : 1.0 - (j / CHARS_PER_STREAM), // Dégradé de traînée
                blending: THREE.AdditiveBlending
            });

            const geometry = new THREE.PlaneGeometry(2, 2);
            const mesh = new THREE.Mesh(geometry, material);
            
            // Espacement vertical des lettres
            mesh.position.y = -j * 2.2; 
            
            streamGroup.add(mesh);
            charMeshes.push({
                mesh: mesh,
                isHead: isHead
            });
        }

        scene.add(streamGroup);
        
        streams.push({
            group: streamGroup,
            speed: speed,
            chars: charMeshes,
            initialY: y
        });
    }

    window.addEventListener('resize', onWindowResize);
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// --- BOUCLE D'ANIMATION ---
let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // 1. Animation de la caméra (Traversée 3D)
    // Elle avance lentement sur l'axe Z et oscille légèrement pour un effet organique
    camera.position.z -= 15 * delta;
    camera.position.x = Math.sin(time * 0.2) * 10;
    camera.position.y = Math.cos(time * 0.1) * 5;

    // Si la caméra avance trop loin, on boucle sa position
    if (camera.position.z < -200) {
        camera.position.z = 100;
    }

    // 2. Animation de la pluie de code
    streams.forEach(stream => {
        stream.group.position.y -= stream.speed;

        // Si le flux sort de l'écran par le bas, on le reset en haut
        if (stream.group.position.y < -100) {
            stream.group.position.y = stream.initialY;
            // On en profite pour changer subtilement sa position X et Z
            stream.group.position.x = (Math.random() - 0.5) * 200;
            stream.group.position.z = camera.position.z - (Math.random() * 200);
        }

        // Faire clignoter / changer les caractères aléatoirement
        if (Math.random() < 0.05) {
            const randCharIndex = Math.floor(Math.random() * stream.chars.length);
            const charObj = stream.chars[randCharIndex];
            const randTextureIndex = Math.floor(Math.random() * CHARS.length);
            
            charObj.mesh.material.map = charObj.isHead ? headTextures[randTextureIndex] : textures[randTextureIndex];
        }

        // Faire en sorte que les lettres fassent toujours face à la caméra (Effet Billboarding)
        stream.chars.forEach(char => {
            char.mesh.lookAt(camera.position);
        });
    });

    // Rendu avec les effets de Bloom et Fog
    composer.render();
}

// Lancement après chargement des scripts
setTimeout(init, 500);
