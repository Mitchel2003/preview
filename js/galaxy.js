import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CosmicCosmos {
  constructor(containerId = 'webgl-container', onProjectSelect = null) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Container #${containerId} not found.`);
      return;
    }

    this.onProjectSelect = onProjectSelect;
    this.isMobile = window.innerWidth < 768;
    this.activeProject = null;
    this.cameraMode = 'orbit-overview';

    this.scrollProgress = 0;
    this.targetScrollProgress = 0;

    this.textureLoader = new THREE.TextureLoader();

    // 5 Projects + Central Core definition
    this.projectsData = [
      {
        id: 'systime',
        name: 'Systime Enterprise',
        techName: 'C# / .NET 10',
        badge: 'Producción Activa (Actual)',
        role: 'DevOps Lead & Systems Engineer',
        stack: 'C# • .NET 10 • Microsoft Azure • Azure SQL • Quiter ERP • CI/CD',
        desc: 'Plataforma empresarial de misión crítica para talleres y concesionarios automotrices. Sincronización bidireccional en tiempo real con ERP Quiter DMS, multitenancy estricto con RBAC, compuertas CI/CD con runners self-hosted y empaquetado para Google Play.',
        url: 'https://systime.co',
        iconPath: 'assets/icons/csharp.svg',
        orbitRadius: 5.8,
        speed: 0.00042,
        angle: 0.9,
        colorHex: '#9B4F96',
        isCore: false
      },
      {
        id: 'sysmed-v2',
        name: 'Sysmed v2 (Proyecto Núcleo)',
        techName: 'TypeScript / Node.js',
        badge: 'Núcleo Central // Operativo',
        role: 'Full-Stack & Co-Diseñador de Arquitectura',
        stack: 'TypeScript • Node.js • PostgreSQL • Prisma • BullMQ • Redis • CASL',
        desc: 'Plataforma líder para gestión y auditorías regulatorias biomédicas INVIMA. Diseñada bajo Arquitectura Hexagonal en TypeScript, invalidación de caché en Redis, colas de eventos asíncronas con BullMQ y control de acceso granular CASL.',
        url: 'https://github.com/Mitchel2003/mern_crud',
        iconPath: 'assets/icons/typescript.svg',
        orbitRadius: 8.4,
        speed: 0.00032,
        angle: 2.5,
        colorHex: '#8b5cf6',
        isCore: true
      },
      {
        id: 'ecommerce',
        name: 'E-Commerce Platform',
        techName: 'TypeScript / React',
        badge: 'Full-Stack Web',
        role: 'Frontend & Architecture',
        stack: 'TypeScript • React • State Management • REST API • TailwindCSS',
        desc: 'Solución completa de comercio electrónico con arquitectura moderna desacoplada, catálogo dinámico con filtros en tiempo real, gestión de carrito y checkout optimizado.',
        url: 'https://github.com/Mitchel2003/e-commerce',
        iconPath: 'assets/icons/typescript.svg',
        orbitRadius: 10.8,
        speed: 0.00025,
        angle: 4.1,
        colorHex: '#00f5ff',
        isCore: false
      },
      {
        id: 'gestion-salud',
        name: 'SisMed v0 / Gestión Salud',
        techName: 'JavaScript / Web',
        badge: 'Versión 0 Semillero',
        role: 'Desarrollador Junior (SENA)',
        stack: 'JavaScript • Node.js • Express • MySQL • React',
        desc: 'Primera versión y prototipo fundacional del sistema biomédico. Modelado de datos relacional inicial, CRUDs para equipos hospitalarios y bases operativas de auditoría.',
        url: 'https://github.com/Mitchel2003/Gestion_salud',
        iconPath: 'assets/icons/javascript.svg',
        orbitRadius: 13.2,
        speed: 0.00019,
        angle: 5.4,
        colorHex: '#facc15',
        isCore: false
      },
      {
        id: 'kequi',
        name: 'App Kequi (Banca Móvil)',
        techName: 'Java / Android',
        badge: 'Mobile Banking',
        role: 'Mobile Developer',
        stack: 'Java • Android SDK • Firebase Auth • Realtime Database',
        desc: 'Aplicación bancaria móvil nativa en Java con integración a servicios en la nube de Firebase, autenticación segura y persistencia de transacciones en tiempo real.',
        url: 'https://github.com/Mitchel2003/appKequi',
        iconPath: 'assets/icons/java.svg',
        orbitRadius: 15.6,
        speed: 0.00015,
        angle: 1.6,
        colorHex: '#f97316',
        isCore: false
      },
      {
        id: 'rpa-bots',
        name: 'Bots RPA & Win32 Systems',
        techName: 'Python & Win32 API',
        badge: 'Automation & Low-Level',
        role: 'Automation Engineer',
        stack: 'Python • Playwright • C# Win32 • Redis • OCR Screen Parsing',
        desc: 'Automatización desatendida de alta escala, resolución de captchas y portales complejos mediante Playwright y colas en Redis, y herramientas de escritorio en C# con APIs nativas de Windows.',
        url: 'https://github.com/Mitchel2003',
        iconPath: 'assets/icons/python.svg',
        orbitRadius: 18.0,
        speed: 0.00011,
        angle: 3.3,
        colorHex: '#38bdf8',
        isCore: false
      }
    ];

    this.mousePointer = new THREE.Vector2(-100, -100);
    this.targetCameraPos = new THREE.Vector3(0, 18, 28);
    this.targetControlsTarget = new THREE.Vector3(0, 0, 0);

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    // Pitch Black Void: No blue fog! Pure deep cosmic black
    this.scene.fog = new THREE.FogExp2(0x000000, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );
    this.camera.position.set(0, 18, 28);

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 1); // 100% Black
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 60;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.15;
    this.controls.target.set(0, 0, 0);

    this.raycaster = new THREE.Raycaster();
    this.particleTexture = this.generateParticleTexture();
    this.nebulaTexture = this.generateNebulaTexture();

    // 1. Interstellar Nebulae Clouds (Manchas Galácticas)
    this.buildNebulae();

    // 2. Pure Black Singularity & Razor Corona (No ugly flat discs!)
    this.buildSingularity();

    // 3. Expansive Accretion & Asteroid Dust Field (180,000 Particles spanning all orbits)
    this.buildAccretionAndAsteroids();

    // 4. Background Starfield
    this.buildStarfield();

    // 5. Floating Glowing Tech Emblems (No more balls/spheres!)
    this.buildTechEmblems();

    // 6. Lighting: Deep Ambient + Cyan Photon Glow + Frontal Camera Light + Warm Stellar Core
    const ambientLight = new THREE.AmbientLight(0x22263d, 1.8);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 1.6);
    this.scene.add(hemiLight);

    // Frontal directional light attached to camera so planets facing user are never in dark eclipse
    const cameraLight = new THREE.DirectionalLight(0xffffff, 2.4);
    cameraLight.position.set(0, 0, 1);
    this.camera.add(cameraLight);
    this.scene.add(this.camera);

    const photonLight = new THREE.PointLight(0x00f5ff, 4.5, 50, 1.1);
    photonLight.position.set(0, 0, 0);
    this.scene.add(photonLight);

    const stellarCoreLight = new THREE.PointLight(0xfff5e6, 3.8, 65, 0.9);
    stellarCoreLight.position.set(0, 0, 0);
    this.scene.add(stellarCoreLight);

    // 7. Ambient Companion Celestial Systems (Planets with Moons)
    this.buildAmbientPlanets();

    // 8. Distant Deep-Space Galaxies & Star Clusters
    this.buildDistantGalaxies();

    // 9. Dynamic Comets & Cosmic Entities
    this.initComets();

    this.bindEvents();
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  generateParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(240, 250, 255, 0.95)');
    gradient.addColorStop(0.55, 'rgba(0, 245, 255, 0.45)');
    gradient.addColorStop(0.85, 'rgba(139, 92, 246, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  generateNebulaTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.3, 'rgba(168, 85, 247, 0.45)');
    gradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  buildNebulae() {
    // Interstellar Gas & Dust Stains (Manchas Galácticas)
    const nebulaCount = this.isMobile ? 120 : 280;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(nebulaCount * 3);
    const col = new Float32Array(nebulaCount * 3);

    const nebulaColors = [
      new THREE.Color(0xa855f7), // Violet
      new THREE.Color(0xec4899), // Deep magenta
      new THREE.Color(0x06b6d4), // Cyan
      new THREE.Color(0x3b82f6), // Deep blue
      new THREE.Color(0xf59e0b)  // Subtle amber dust
    ];

    for (let i = 0; i < nebulaCount; i++) {
      const i3 = i * 3;
      const r = 22 + Math.random() * 55;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.7; // Disk-like spread

      pos[i3] = r * Math.cos(phi) * Math.cos(theta);
      pos[i3 + 1] = (Math.random() - 0.5) * 14;
      pos[i3 + 2] = r * Math.cos(phi) * Math.sin(theta);

      const baseCol = nebulaColors[i % nebulaColors.length];
      col[i3] = baseCol.r * (0.6 + Math.random() * 0.4);
      col[i3 + 1] = baseCol.g * (0.6 + Math.random() * 0.4);
      col[i3 + 2] = baseCol.b * (0.6 + Math.random() * 0.4);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: this.isMobile ? 12 : 22,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.nebulaTexture,
      transparent: true,
      opacity: 0.18
    });

    this.nebulaeMesh = new THREE.Points(geo, mat);
    this.scene.add(this.nebulaeMesh);
  }

  buildSingularity() {
    this.blackHoleGroup = new THREE.Group();

    // 1. Event Horizon: Absolute pitch-black sphere
    const horizonGeo = new THREE.SphereGeometry(1.65, 48, 48);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x000000
    });
    this.eventHorizon = new THREE.Mesh(horizonGeo, horizonMat);
    this.blackHoleGroup.add(this.eventHorizon);

    // 2. Razor-thin Relativistic Photon Ring (No thick ugly discs!)
    const coronaGeo = new THREE.TorusGeometry(1.72, 0.045, 16, 120);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    this.photonCorona = new THREE.Mesh(coronaGeo, coronaMat);
    this.photonCorona.rotation.x = Math.PI / 2;
    this.blackHoleGroup.add(this.photonCorona);

    this.blackHoleGroup.rotation.x = 0.28;
    this.blackHoleGroup.rotation.z = -0.14;
    this.scene.add(this.blackHoleGroup);
  }

  buildAccretionAndAsteroids() {
    // Expansive cosmic dust & asteroid rocks spanning from inner accretion to outer orbits!
    const totalCount = this.isMobile ? 70000 : 180000;
    this.dustGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(totalCount * 3);
    const colors = new Float32Array(totalCount * 3);
    this.dustRadii = new Float32Array(totalCount);
    this.dustAngles = new Float32Array(totalCount);
    this.dustSpeeds = new Float32Array(totalCount);

    const minR = 1.75;
    const maxR = 21.0; // Expansive field enveloping all orbits

    const cWhite = new THREE.Color(0xffffff);
    const cCyan = new THREE.Color(0x00f5ff);
    const cAmber = new THREE.Color(0xf59e0b);
    const cViolet = new THREE.Color(0x8b5cf6);
    const cStardust = new THREE.Color(0x94a3b8);

    for (let i = 0; i < totalCount; i++) {
      const i3 = i * 3;
      // Exponential distribution: dense at inner accretion, spreading widely into asteroid field
      const isInner = i < totalCount * 0.45;
      let r, height;

      if (isInner) {
        r = minR + Math.pow(Math.random(), 2.6) * 3.8;
        height = (Math.random() - 0.5) * 0.18 * (1 - (r - minR) / 3.8);
      } else {
        r = 4.5 + Math.random() * (maxR - 4.5);
        height = (Math.random() - 0.5) * (0.2 + (r / maxR) * 0.8);
      }

      const angle = Math.random() * Math.PI * 2;

      positions[i3] = Math.cos(angle) * r;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * r;

      this.dustRadii[i] = r;
      this.dustAngles[i] = angle;
      // Keplerian velocity
      this.dustSpeeds[i] = (0.014 / Math.sqrt(r)) * (0.8 + Math.random() * 0.4);

      const col = new THREE.Color();
      if (r < 2.5) {
        col.lerpColors(cWhite, cCyan, (r - minR) / (2.5 - minR));
      } else if (r < 5.0) {
        col.lerpColors(cCyan, cAmber, (r - 2.5) / 2.5);
      } else if (r < 9.0) {
        col.lerpColors(cAmber, cViolet, (r - 5.0) / 4.0);
      } else {
        col.lerpColors(cViolet, cStardust, (r - 9.0) / (maxR - 9.0));
      }

      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    this.dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.dustGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.dustMat = new THREE.PointsMaterial({
      size: this.isMobile ? 0.024 : 0.018,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.92
    });

    this.dustPoints = new THREE.Points(this.dustGeo, this.dustMat);
    this.blackHoleGroup.add(this.dustPoints);
  }

  buildStarfield() {
    const starCount = this.isMobile ? 6000 : 16000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const r = 50 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      const lum = 0.35 + Math.random() * 0.65;
      col[i3] = lum;
      col[i3 + 1] = lum;
      col[i3 + 2] = lum;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.035,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.75
    });

    this.starfield = new THREE.Points(geo, mat);
    this.scene.add(this.starfield);
  }

  buildTechEmblems() {
    this.emblemNodes = [];
    this.orbitsGroup = new THREE.Group();

    this.projectsData.forEach((data) => {
      // 1. Orbital Track Line
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,
        data.orbitRadius, data.orbitRadius,
        0, 2 * Math.PI,
        false,
        0
      );
      const points = orbitCurve.getPoints(140);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const orbitMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(data.colorHex),
        transparent: true,
        opacity: data.isCore ? 0.45 : 0.22,
        blending: THREE.AdditiveBlending
      });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
      orbitLine.rotation.x = this.blackHoleGroup.rotation.x;
      orbitLine.rotation.z = this.blackHoleGroup.rotation.z;
      this.orbitsGroup.add(orbitLine);

      // 2. Node Group (No solid balls!)
      const nodeGroup = new THREE.Group();

      // Glowing Halo / Tech Beacon Ring (Subtle futuristic laser ring)
      const ringGeo = new THREE.RingGeometry(0.32, 0.40, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(data.colorHex),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      nodeGroup.add(ringMesh);

      // Inner concentrated laser anchor (no solid egg/ball!)
      const innerRingGeo = new THREE.RingGeometry(0.04, 0.12, 24);
      const innerRingMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });
      const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
      innerRingMesh.rotation.x = Math.PI / 2;
      nodeGroup.add(innerRingMesh);

      // 3. Floating 3D Official Tech Emblem Billboard (Crisp, Vibrant, True Brand Colors)
      const iconTexture = this.textureLoader.load(data.iconPath);
      iconTexture.colorSpace = THREE.SRGBColorSpace;
      const spriteMat = new THREE.SpriteMaterial({
        map: iconTexture,
        transparent: true,
        opacity: 1.0,
        depthTest: false,
        toneMapped: false // Prevents ACESFilmic from washing out brand colors!
      });
      const iconSprite = new THREE.Sprite(spriteMat);
      const iconScale = data.isCore ? 0.76 : 0.62;
      iconSprite.scale.set(iconScale, iconScale, 1);
      iconSprite.position.set(0, 0.42, 0);
      nodeGroup.add(iconSprite);

      // 4. Invisible Hit-Sphere for Effortless Clickability
      const hitGeo = new THREE.SphereGeometry(1.1, 16, 16);
      const hitMat = new THREE.MeshBasicMaterial({
        visible: false
      });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = data;
      nodeGroup.add(hitMesh);

      this.orbitsGroup.add(nodeGroup);

      this.emblemNodes.push({
        group: nodeGroup,
        sprite: iconSprite,
        ring: ringMesh,
        hitMesh: hitMesh,
        data: data
      });
    });

    this.scene.add(this.orbitsGroup);
  }

  buildAmbientPlanets() {
    this.ambientPlanetsGroup = new THREE.Group();
    this.ambientPlanets = [];

    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);

    // Dedicated subtle orbital track line for ambient planets
    const createPlanetOrbitLine = (radius, colorHex, opacity = 0.18) => {
      const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
      const pts = curve.getPoints(140);
      const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 0, p.y)));
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.LineLoop(geo, mat);
      line.rotation.x = this.blackHoleGroup.rotation.x;
      line.rotation.z = this.blackHoleGroup.rotation.z;
      return line;
    };

    // Common Moon Texture & Luminous Material
    const moonTex = this.textureLoader.load('assets/textures/moon.jpg');
    moonTex.colorSpace = THREE.SRGBColorSpace;
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      emissiveMap: moonTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.35,
      roughness: 0.6,
      metalness: 0.05
    });

    // 1. Planet 1: Jovian Giant with 2 Moons (Orbit Radius: 7.0)
    const jupiterTex = this.textureLoader.load('assets/textures/jupiter.jpg');
    jupiterTex.colorSpace = THREE.SRGBColorSpace;
    const jupiterMat = new THREE.MeshStandardMaterial({
      map: jupiterTex,
      emissiveMap: jupiterTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.38,
      roughness: 0.45,
      metalness: 0.05
    });
    const jupiterMesh = new THREE.Mesh(sphereGeo, jupiterMat);
    jupiterMesh.scale.set(0.48, 0.48, 0.48);

    const jMoon1 = new THREE.Mesh(sphereGeo, moonMat);
    jMoon1.scale.set(0.075, 0.075, 0.075);
    const jMoon2 = new THREE.Mesh(sphereGeo, moonMat);
    jMoon2.scale.set(0.055, 0.055, 0.055);
    const jupiterMoons = [
      { mesh: jMoon1, dist: 0.95, speed: 0.0034, angle: 0.8, inc: 0.22 },
      { mesh: jMoon2, dist: 1.45, speed: 0.0022, angle: 2.5, inc: -0.18 }
    ];

    const jupiterSystem = new THREE.Group();
    jupiterSystem.add(jupiterMesh);
    jupiterMoons.forEach(m => jupiterSystem.add(m.mesh));

    const jupiterOrbitLine = createPlanetOrbitLine(7.0, 0xf59e0b, 0.18);
    this.ambientPlanetsGroup.add(jupiterOrbitLine);

    this.ambientPlanets.push({
      group: jupiterSystem,
      planetMesh: jupiterMesh,
      moons: jupiterMoons,
      orbitRadius: 7.0,
      orbitSpeed: 0.00032,
      currentAngle: 1.8,
      rotationSpeed: 0.005
    });
    this.ambientPlanetsGroup.add(jupiterSystem);

    // 2. Planet 2: Azure Earth-like Oasis with 1 Moon (Orbit Radius: 9.6)
    const earthTex = this.textureLoader.load('assets/textures/earth.jpg');
    earthTex.colorSpace = THREE.SRGBColorSpace;
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      emissiveMap: earthTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.42,
      roughness: 0.45,
      metalness: 0.1
    });
    const earthMesh = new THREE.Mesh(sphereGeo, earthMat);
    earthMesh.scale.set(0.35, 0.35, 0.35);

    const eMoon1 = new THREE.Mesh(sphereGeo, moonMat);
    eMoon1.scale.set(0.055, 0.055, 0.055);
    const earthMoons = [
      { mesh: eMoon1, dist: 0.76, speed: 0.0038, angle: 1.2, inc: 0.14 }
    ];

    const earthSystem = new THREE.Group();
    earthSystem.add(earthMesh);
    earthMoons.forEach(m => earthSystem.add(m.mesh));

    const earthOrbitLine = createPlanetOrbitLine(9.6, 0x38bdf8, 0.20);
    this.ambientPlanetsGroup.add(earthOrbitLine);

    this.ambientPlanets.push({
      group: earthSystem,
      planetMesh: earthMesh,
      moons: earthMoons,
      orbitRadius: 9.6,
      orbitSpeed: 0.00024,
      currentAngle: 0.4,
      rotationSpeed: 0.006
    });
    this.ambientPlanetsGroup.add(earthSystem);

    // 3. Planet 3: Ringed Giant (Saturn) with 1 Moon (Orbit Radius: 14.4)
    const saturnTex = this.textureLoader.load('assets/textures/saturn.jpg');
    saturnTex.colorSpace = THREE.SRGBColorSpace;
    const saturnMat = new THREE.MeshStandardMaterial({
      map: saturnTex,
      emissiveMap: saturnTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.38,
      roughness: 0.48,
      metalness: 0.1
    });
    const saturnMesh = new THREE.Mesh(sphereGeo, saturnMat);
    saturnMesh.scale.set(0.44, 0.44, 0.44);

    const ringTex = this.textureLoader.load('assets/textures/saturn_ring.png');
    ringTex.colorSpace = THREE.SRGBColorSpace;
    const saturnRingGeo = new THREE.RingGeometry(0.58, 1.25, 64);
    const saturnRingMat = new THREE.MeshStandardMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      roughness: 0.4
    });
    const saturnRing = new THREE.Mesh(saturnRingGeo, saturnRingMat);
    saturnRing.rotation.x = Math.PI / 2 + 0.35;
    saturnRing.rotation.y = 0.15;

    const sMoon1 = new THREE.Mesh(sphereGeo, moonMat);
    sMoon1.scale.set(0.065, 0.065, 0.065);
    const saturnMoons = [
      { mesh: sMoon1, dist: 1.62, speed: 0.0026, angle: 3.1, inc: 0.3 }
    ];

    const saturnSystem = new THREE.Group();
    saturnSystem.add(saturnMesh);
    saturnSystem.add(saturnRing);
    saturnMoons.forEach(m => saturnSystem.add(m.mesh));

    const saturnOrbitLine = createPlanetOrbitLine(14.4, 0xfacc15, 0.18);
    this.ambientPlanetsGroup.add(saturnOrbitLine);

    this.ambientPlanets.push({
      group: saturnSystem,
      planetMesh: saturnMesh,
      moons: saturnMoons,
      orbitRadius: 14.4,
      orbitSpeed: 0.00018,
      currentAngle: 4.5,
      rotationSpeed: 0.007
    });
    this.ambientPlanetsGroup.add(saturnSystem);

    // 4. Planet 4: Ice Giant (Neptune) in Outer Frontier (Orbit Radius: 20.4)
    const neptuneTex = this.textureLoader.load('assets/textures/neptune.jpg');
    neptuneTex.colorSpace = THREE.SRGBColorSpace;
    const neptuneMat = new THREE.MeshStandardMaterial({
      map: neptuneTex,
      emissiveMap: neptuneTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.40,
      roughness: 0.5,
      metalness: 0.05
    });
    const neptuneMesh = new THREE.Mesh(sphereGeo, neptuneMat);
    neptuneMesh.scale.set(0.40, 0.40, 0.40);

    const nMoon1 = new THREE.Mesh(sphereGeo, moonMat);
    nMoon1.scale.set(0.05, 0.05, 0.05);
    const neptuneMoons = [
      { mesh: nMoon1, dist: 0.90, speed: 0.0024, angle: 5.0, inc: -0.2 }
    ];

    const neptuneSystem = new THREE.Group();
    neptuneSystem.add(neptuneMesh);
    neptuneMoons.forEach(m => neptuneSystem.add(m.mesh));

    const neptuneOrbitLine = createPlanetOrbitLine(20.4, 0x818cf8, 0.18);
    this.ambientPlanetsGroup.add(neptuneOrbitLine);

    this.ambientPlanets.push({
      group: neptuneSystem,
      planetMesh: neptuneMesh,
      moons: neptuneMoons,
      orbitRadius: 20.4,
      orbitSpeed: 0.00011,
      currentAngle: 3.2,
      rotationSpeed: 0.004
    });
    this.ambientPlanetsGroup.add(neptuneSystem);

    this.scene.add(this.ambientPlanetsGroup);
  }

  buildDistantGalaxies() {
    this.distantGalaxiesGroup = new THREE.Group();
    this.distantGalaxies = [];

    const createSpiralGalaxy = (starCount, armCount, radius, innerColor, outerColor, position, tilt) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(starCount * 3);
      const col = new Float32Array(starCount * 3);

      const cIn = new THREE.Color(innerColor);
      const cOut = new THREE.Color(outerColor);

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        const armIndex = i % armCount;
        const armAngle = (armIndex / armCount) * Math.PI * 2;
        const dist = Math.pow(Math.random(), 2.2) * radius;
        const spinAngle = dist * 0.85;

        const spread = (Math.random() - 0.5) * (0.8 + dist * 0.15);
        const height = (Math.random() - 0.5) * (0.4 + dist * 0.08);

        pos[i3] = Math.cos(armAngle + spinAngle) * dist + spread;
        pos[i3 + 1] = height;
        pos[i3 + 2] = Math.sin(armAngle + spinAngle) * dist + spread;

        const starCol = new THREE.Color().lerpColors(cIn, cOut, dist / radius);
        col[i3] = starCol.r * (0.75 + Math.random() * 0.25);
        col[i3 + 1] = starCol.g * (0.75 + Math.random() * 0.25);
        col[i3 + 2] = starCol.b * (0.75 + Math.random() * 0.25);
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.28,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        map: this.particleTexture,
        transparent: true,
        opacity: 0.75
      });

      const points = new THREE.Points(geo, mat);
      const group = new THREE.Group();
      group.add(points);
      group.position.copy(position);
      group.rotation.copy(tilt);

      return { group, points, rotationSpeed: 0.0004 };
    };

    const createEllipticalGalaxy = (starCount, radius, colorHex, position, tilt) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(starCount * 3);
      const col = new Float32Array(starCount * 3);
      const cBase = new THREE.Color(colorHex);

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        const r = Math.pow(Math.random(), 1.8) * radius;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        pos[i3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i3 + 1] = (r * Math.sin(phi) * Math.sin(theta)) * 0.55;
        pos[i3 + 2] = (r * Math.cos(phi)) * 0.75;

        col[i3] = cBase.r * (0.8 + Math.random() * 0.2);
        col[i3 + 1] = cBase.g * (0.8 + Math.random() * 0.2);
        col[i3 + 2] = cBase.b * (0.8 + Math.random() * 0.2);
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.25,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        map: this.particleTexture,
        transparent: true,
        opacity: 0.68
      });

      const points = new THREE.Points(geo, mat);
      const group = new THREE.Group();
      group.add(points);
      group.position.copy(position);
      group.rotation.copy(tilt);

      return { group, points, rotationSpeed: 0.0002 };
    };

    // 1. Andromeda Azure/Cyan Spiral in Deep Space
    const g1 = createSpiralGalaxy(
      1500, 2, 14, 0xffffff, 0x00f5ff,
      new THREE.Vector3(-120, 55, -140),
      new THREE.Euler(0.7, 0.4, -0.3)
    );
    this.distantGalaxies.push(g1);
    this.distantGalaxiesGroup.add(g1.group);

    // 2. Whirlpool Violet/Magenta Spiral in Deep Space
    const g2 = createSpiralGalaxy(
      1200, 3, 11, 0xffe4e6, 0xa855f7,
      new THREE.Vector3(140, -45, -130),
      new THREE.Euler(-0.5, 0.8, 0.6)
    );
    this.distantGalaxies.push(g2);
    this.distantGalaxiesGroup.add(g2.group);

    // 3. Golden Amber Elliptical Galaxy
    const g3 = createEllipticalGalaxy(
      900, 9, 0xfacc15,
      new THREE.Vector3(-80, -60, 150),
      new THREE.Euler(0.3, -0.4, 0.5)
    );
    this.distantGalaxies.push(g3);
    this.distantGalaxiesGroup.add(g3.group);

    // 4. Compact Globular Star Cluster
    const g4 = createEllipticalGalaxy(
      600, 6, 0x38bdf8,
      new THREE.Vector3(100, 70, 95),
      new THREE.Euler(0.2, 0.5, -0.2)
    );
    this.distantGalaxies.push(g4);
    this.distantGalaxiesGroup.add(g4.group);

    this.scene.add(this.distantGalaxiesGroup);
  }

  initComets() {
    this.activeComets = [];
    this.maxActiveComets = 2;
    this.nextCometTime = Date.now() + 1500;
  }

  spawnComet() {
    const cometGroup = new THREE.Group();

    // 1. Incandescent Core
    const coreGeo = new THREE.SphereGeometry(0.20, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    cometGroup.add(coreMesh);

    // Halo Glow
    const haloMat = new THREE.SpriteMaterial({
      map: this.particleTexture,
      color: Math.random() > 0.35 ? 0x00f5ff : 0xfde047,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(1.6, 1.6, 1);
    cometGroup.add(halo);

    // Trail with Gradient Color
    const trailSegments = 60;
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(trailSegments * 3);
    const trailColors = new Float32Array(trailSegments * 3);

    const cHead = new THREE.Color(0xffffff);
    const cMid = new THREE.Color(haloMat.color);
    const cTail = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < trailSegments; i++) {
      const t = i / (trailSegments - 1);
      const col = new THREE.Color();
      if (t < 0.25) {
        col.lerpColors(cHead, cMid, t / 0.25);
      } else {
        col.lerpColors(cMid, cTail, (t - 0.25) / 0.75);
      }
      const fade = Math.pow(1 - t, 1.35);
      trailColors[i * 3] = col.r * fade;
      trailColors[i * 3 + 1] = col.g * fade;
      trailColors[i * 3 + 2] = col.b * fade;
    }

    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));

    const trailMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });
    const trailLine = new THREE.Line(trailGeo, trailMat);

    // Trajectory sweeping directly across the active central viewport!
    // Visible without zooming out — passing through inner and mid planetary orbits
    const side = Math.random() > 0.5 ? 1 : -1;
    const startX = side * (16 + Math.random() * 8); // ±16 to ±24 (visible periphery)
    const startY = 4 + Math.random() * 6;           // Visible upper altitude
    const startZ = -8 + Math.random() * 6;          // Near the central system back plane

    cometGroup.position.set(startX, startY, startZ);

    const endX = -startX * (0.8 + Math.random() * 0.4);
    const endY = -(1 + Math.random() * 4);          // Slopes down towards bottom
    const endZ = 12 + Math.random() * 10;           // Glides forward toward camera

    const dir = new THREE.Vector3(endX - startX, endY - startY, endZ - startZ).normalize();
    const speed = 0.22 + Math.random() * 0.08;      // Smooth, majestic cosmic motion
    const velocity = dir.multiplyScalar(speed);

    const history = [];
    for (let i = 0; i < trailSegments; i++) {
      history.push(cometGroup.position.clone());
    }

    this.scene.add(cometGroup);
    this.scene.add(trailLine);

    this.activeComets.push({
      group: cometGroup,
      trailLine: trailLine,
      trailGeo: trailGeo,
      velocity: velocity,
      history: history,
      trailSegments: trailSegments,
      halo: halo,
      life: 0,
      maxLife: 280
    });
  }

  updateComets() {
    if (Date.now() > this.nextCometTime && this.activeComets.length < this.maxActiveComets) {
      this.spawnComet();
      this.nextCometTime = Date.now() + 4500 + Math.random() * 5500;
    }

    for (let i = this.activeComets.length - 1; i >= 0; i--) {
      const comet = this.activeComets[i];
      comet.life++;

      comet.group.position.add(comet.velocity);
      comet.history.unshift(comet.group.position.clone());
      if (comet.history.length > comet.trailSegments) {
        comet.history.pop();
      }

      const pos = comet.trailGeo.attributes.position.array;
      for (let j = 0; j < comet.history.length; j++) {
        pos[j * 3] = comet.history[j].x;
        pos[j * 3 + 1] = comet.history[j].y;
        pos[j * 3 + 2] = comet.history[j].z;
      }
      comet.trailGeo.attributes.position.needsUpdate = true;

      const pulse = 1.3 + Math.sin(comet.life * 0.15) * 0.3;
      comet.halo.scale.set(pulse, pulse, 1);

      if (comet.life > comet.maxLife || comet.group.position.length() > 120) {
        this.scene.remove(comet.group);
        this.scene.remove(comet.trailLine);
        comet.trailGeo.dispose();
        this.activeComets.splice(i, 1);
      }
    }
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mousePointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mousePointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    window.addEventListener('click', (e) => {
      if (e.target.closest('.hud-header, .orbit-dock, .project-dossier, .cv-modal, .section-presentation, button, a')) {
        return;
      }
      this.checkNodeClick();
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  checkNodeClick() {
    this.raycaster.setFromCamera(this.mousePointer, this.camera);
    const hitMeshes = this.emblemNodes.map(p => p.hitMesh);
    const intersects = this.raycaster.intersectObjects(hitMeshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const data = hit.userData;
      if (data && data.id) {
        this.focusProject(data.id);
      }
    }
  }

  setScrollProgress(progress) {
    this.targetScrollProgress = Math.max(0, Math.min(1, progress));
  }

  focusProject(projectId) {
    if (!projectId || projectId === 'singularidad') {
      this.cameraMode = 'orbit-overview';
      this.activeProject = null;

      if (this.scrollProgress < 0.4) {
        this.targetCameraPos.set(0, 18, 28);
        this.targetControlsTarget.set(0, 0, 0);
      } else {
        this.targetCameraPos.set(0, 6.0, 18.0);
        this.targetControlsTarget.set(0, 0, 0);
      }

      if (this.onProjectSelect) {
        this.onProjectSelect(null);
      }
      return;
    }

    const item = this.emblemNodes.find(p => p.data.id === projectId);
    if (!item) return;

    this.activeProject = item;
    this.cameraMode = 'focus-project';

    if (this.onProjectSelect) {
      this.onProjectSelect(item.data);
    }
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.05;

    // 1. Accretion & Asteroid Swarm Physics (Keplerian speeds)
    if (this.dustGeo && this.dustAngles) {
      const pos = this.dustGeo.attributes.position.array;
      const count = this.dustAngles.length;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        this.dustAngles[i] += this.dustSpeeds[i];
        const r = this.dustRadii[i];
        const a = this.dustAngles[i];

        pos[i3] = Math.cos(a) * r;
        pos[i3 + 2] = Math.sin(a) * r;
      }
      this.dustGeo.attributes.position.needsUpdate = true;
    }

    // 2. Photon Corona subtle rotation
    if (this.photonCorona) {
      this.photonCorona.rotation.z += 0.003;
    }

    // 3. Move Floating Tech Emblems along their orbits (Majestic calm motion)
    this.emblemNodes.forEach((item) => {
      item.data.angle += item.data.speed;
      const localX = Math.cos(item.data.angle) * item.data.orbitRadius;
      const localZ = Math.sin(item.data.angle) * item.data.orbitRadius;

      const tiltedVec = new THREE.Vector3(localX, 0, localZ);
      tiltedVec.applyEuler(this.blackHoleGroup.rotation);

      item.group.position.copy(tiltedVec);

      // Subtle breathing pulse for tech ring
      const ringScale = 1 + Math.sin(Date.now() * 0.003 + item.data.orbitRadius) * 0.12;
      item.ring.scale.set(ringScale, ringScale, ringScale);
    });

    // 4. Camera Dynamics: Two-Phase Scroll Transition & Project Focus
    if (this.cameraMode === 'focus-project' && this.activeProject) {
      const pPos = this.activeProject.group.position;
      const camOffset = new THREE.Vector3(1.5, 0.8, 2.4);
      this.targetCameraPos.copy(pPos).add(camOffset);
      this.targetControlsTarget.copy(pPos);

      this.camera.position.lerp(this.targetCameraPos, 0.05);
      this.controls.target.lerp(this.targetControlsTarget, 0.05);
    } else {
      // Phase 1 (top): High perspective over the black hole behind profile
      // Phase 2 (scrolled): Drops into the equatorial orbit
      const p1Pos = new THREE.Vector3(0, 18, 28);
      const p2Pos = new THREE.Vector3(0, 6.0, 18.0);
      const currentTargetPos = p1Pos.clone().lerp(p2Pos, this.scrollProgress);

      this.camera.position.lerp(currentTargetPos, 0.04);
      this.controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.04);
    }

    // 5. Nebulae & Starfield slow rotation
    if (this.nebulaeMesh) {
      this.nebulaeMesh.rotation.y += 0.00008;
    }
    if (this.starfield) {
      this.starfield.rotation.y += 0.00012;
    }

    // 6. Ambient Companion Planets & Moons Motion (Locked along dedicated visible orbit tracks)
    if (this.ambientPlanets) {
      this.ambientPlanets.forEach((p) => {
        p.currentAngle += p.orbitSpeed;
        const px = Math.cos(p.currentAngle) * p.orbitRadius;
        const pz = Math.sin(p.currentAngle) * p.orbitRadius;

        const tiltedPos = new THREE.Vector3(px, 0, pz);
        tiltedPos.applyEuler(this.blackHoleGroup.rotation);
        p.group.position.copy(tiltedPos);

        p.planetMesh.rotation.y += p.rotationSpeed;

        p.moons.forEach((m) => {
          m.angle += m.speed;
          m.mesh.position.set(
            Math.cos(m.angle) * m.dist,
            Math.sin(m.angle * 2) * (m.dist * m.inc),
            Math.sin(m.angle) * m.dist
          );
        });
      });
    }

    // 7. Distant Deep-Space Galaxies slow spin
    if (this.distantGalaxies) {
      this.distantGalaxies.forEach((g) => {
        g.points.rotation.y += g.rotationSpeed;
      });
    }

    // 8. Dynamic Comets update
    this.updateComets();

    this.controls.update();

    // Hover Cursor check
    this.raycaster.setFromCamera(this.mousePointer, this.camera);
    const hitMeshes = this.emblemNodes.map(p => p.hitMesh);
    const hits = this.raycaster.intersectObjects(hitMeshes, false);
    if (hits.length > 0) {
      document.body.style.cursor = 'pointer';
    } else if (!document.body.style.cursor || document.body.style.cursor === 'pointer') {
      document.body.style.cursor = 'default';
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
