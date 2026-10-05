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
        url: 'https://systime.co/',
        linkText: 'Visualizar Systime en Producción',
        iconPath: 'assets/icons/csharp.svg',
        orbitRadius: 4.2,
        speed: 0.00048,
        angle: 0.9,
        colorHex: '#9B4F96',
        isCore: false
      },
      {
        id: 'sysmed-v2',
        name: 'Sysmed (Gestión Biomédica)',
        techName: 'TypeScript / Node.js',
        badge: 'v1 En Producción • v2 Próximamente',
        role: 'Full-Stack & Co-Diseñador de Arquitectura',
        stack: 'TypeScript • Node.js • PostgreSQL • Prisma • BullMQ • Redis • CASL',
        desc: 'Plataforma líder para gestión y auditorías regulatorias biomédicas INVIMA. Sysmed v1 se encuentra actualmente desplegado y operativo en la nube; Sysmed v2 está en desarrollo bajo Arquitectura Hexagonal en TypeScript con colas BullMQ, Redis y CASL (Próximamente).',
        url: 'https://mern-crud-three-lemon.vercel.app',
        linkText: 'Visualizar Sysmed v1 en Vivo',
        secondaryStatus: 'Sysmed v2: Próximamente',
        iconPath: 'assets/icons/typescript.svg',
        orbitRadius: 6.0,
        speed: 0.00038,
        angle: 2.5,
        colorHex: '#8b5cf6',
        isCore: true
      },
      {
        id: 'ecommerce',
        name: 'E-Commerce Platform',
        techName: 'TypeScript / React',
        badge: 'Full-Stack Web • En Vivo',
        role: 'Frontend & Architecture',
        stack: 'TypeScript • React • State Management • REST API • TailwindCSS',
        desc: 'Solución completa de comercio electrónico con arquitectura moderna desacoplada, catálogo dinámico con filtros en tiempo real, gestión de carrito y checkout optimizado.',
        url: 'https://e-commerce-mauve-omega.vercel.app/',
        linkText: 'Visualizar E-Commerce en Vivo',
        iconPath: 'assets/icons/typescript.svg',
        orbitRadius: 7.8,
        speed: 0.00030,
        angle: 4.1,
        colorHex: '#00f5ff',
        isCore: false
      },
      {
        id: 'gestion-salud',
        name: 'SisMed v0 / Gestión Salud',
        techName: 'JavaScript / Web',
        badge: 'Versión 0 Semillero • En Vivo',
        role: 'Desarrollador Junior (SENA)',
        stack: 'JavaScript • Node.js • Express • MySQL • React',
        desc: 'Primera versión y prototipo fundacional del sistema biomédico. Modelado de datos relacional inicial, CRUDs para equipos hospitalarios y bases operativas de auditoría.',
        url: 'https://mitchel2003.github.io/Gestion_salud/',
        linkText: 'Visualizar SisMed v0 en Vivo',
        iconPath: 'assets/icons/javascript.svg',
        orbitRadius: 9.6,
        speed: 0.00024,
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
        linkText: 'Ver Proyecto App Kequi',
        iconPath: 'assets/icons/java.svg',
        orbitRadius: 11.4,
        speed: 0.00019,
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
        linkText: 'Ver Automatizaciones',
        iconPath: 'assets/icons/python.svg',
        orbitRadius: 13.2,
        speed: 0.00015,
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
    // Pure deep cosmic black void with transparent fog allowing distant galaxies and quasars to shine
    this.scene.fog = new THREE.FogExp2(0x000000, 0.0035);

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

    // 8. Dynamic Comets & Cosmic Entities
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
    const maxR = 30.0; // Expansive field enveloping all inner projects and outer celestial planets

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
      // Keplerian velocity - slowed down for graceful, hypnotic cosmic motion
      this.dustSpeeds[i] = (0.0022 / Math.sqrt(r)) * (0.8 + Math.random() * 0.4);

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
    const starCount = this.isMobile ? 10000 : 22000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);

    const spectralColors = [
      new THREE.Color(0xa5f3fc), // O/B Blue-White Giant
      new THREE.Color(0xffffff), // A White Diamond
      new THREE.Color(0xfef08a), // G Warm Golden Star
      new THREE.Color(0xfdba74), // K Orange Star
      new THREE.Color(0xfca5a5)  // M Red Dwarf
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const r = 45 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      const baseCol = spectralColors[i % spectralColors.length];
      const brightness = 0.45 + Math.random() * 0.55;
      col[i3] = baseCol.r * brightness;
      col[i3 + 1] = baseCol.g * brightness;
      col[i3 + 2] = baseCol.b * brightness;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: this.isMobile ? 0.50 : 0.68,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.90
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

      // 2. Node Group anchored to orbit
      const nodeGroup = new THREE.Group();

      // Glowing Halo / Tech Beacon Ring on orbital plane (y = 0)
      const ringGeo = new THREE.RingGeometry(0.28, 0.36, 32);
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

      // Inner concentrated laser anchor
      const innerRingGeo = new THREE.RingGeometry(0.04, 0.10, 24);
      const innerRingMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
      innerRingMesh.rotation.x = Math.PI / 2;
      nodeGroup.add(innerRingMesh);

      // Vertical Holographic Light Conduit (projects up from the orbit ring to the badge)
      const pillarGeo = new THREE.CylinderGeometry(0.012, 0.038, 0.42, 16, 1, true);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(data.colorHex),
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(0, 0.21, 0);
      nodeGroup.add(pillar);

      // 3. Floating 3D Holographic Medallion (Always faces the viewer with realistic depth & shadow)
      const billboardGroup = new THREE.Group();
      billboardGroup.position.set(0, 0.42, 0);

      // Occlusion Drop Shadow (Soft dark radial shadow grounding the badge against space)
      const shadowMat = new THREE.SpriteMaterial({
        map: this.particleTexture,
        color: 0x000000,
        transparent: true,
        opacity: 0.82
      });
      const shadowSprite = new THREE.Sprite(shadowMat);
      shadowSprite.scale.set(1.15, 1.15, 1);
      shadowSprite.position.set(0, -0.02, -0.05);
      billboardGroup.add(shadowSprite);

      // Dark Obsidian Glass Backing Disc (Subtle frosted shield)
      const glassGeo = new THREE.CircleGeometry(0.34, 32);
      const glassMat = new THREE.MeshBasicMaterial({
        color: 0x070b18,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(0, 0, -0.02);
      billboardGroup.add(glassMesh);

      // Glowing Perimeter Bezel / Border Ring
      const bezelGeo = new THREE.RingGeometry(0.32, 0.35, 32);
      const bezelMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(data.colorHex),
        transparent: true,
        opacity: 0.80,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
      bezelMesh.position.set(0, 0, -0.015);
      billboardGroup.add(bezelMesh);

      // Crisp Official Tech Emblem (with depthTest: true!)
      const iconTexture = this.textureLoader.load(data.iconPath);
      iconTexture.colorSpace = THREE.SRGBColorSpace;
      const spriteMat = new THREE.SpriteMaterial({
        map: iconTexture,
        transparent: true,
        opacity: 0.96,
        depthTest: true,
        toneMapped: false
      });
      const iconSprite = new THREE.Sprite(spriteMat);
      const iconScale = data.isCore ? 0.50 : 0.42;
      iconSprite.scale.set(iconScale, iconScale, 1);
      iconSprite.position.set(0, 0, 0.01);
      billboardGroup.add(iconSprite);

      nodeGroup.add(billboardGroup);

      // 4. Invisible Hit-Sphere for Effortless Clickability
      const hitGeo = new THREE.SphereGeometry(1.0, 16, 16);
      const hitMat = new THREE.MeshBasicMaterial({
        visible: false
      });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(0, 0.42, 0);
      hitMesh.userData = data;
      nodeGroup.add(hitMesh);

      this.orbitsGroup.add(nodeGroup);

      this.emblemNodes.push({
        group: nodeGroup,
        billboard: billboardGroup,
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

    // Dedicated subtle orbital track line for outer ambient planets
    const createPlanetOrbitLine = (radius, colorHex, opacity = 0.16) => {
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
      emissive: new THREE.Color(0x94a3b8),
      emissiveIntensity: 0.15,
      roughness: 0.65,
      metalness: 0.05
    });

    // 1. Planet 1 (Outer Orbit I: 16.5): Azure Earth-like Oasis with 1 Moon
    const earthTex = this.textureLoader.load('assets/textures/earth.jpg');
    earthTex.colorSpace = THREE.SRGBColorSpace;
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTex,
      emissive: new THREE.Color(0x1d4ed8),
      emissiveIntensity: 0.15,
      roughness: 0.55,
      metalness: 0.05
    });
    const earthMesh = new THREE.Mesh(sphereGeo, earthMat);
    earthMesh.scale.set(0.38, 0.38, 0.38);

    const eMoon1 = new THREE.Mesh(sphereGeo, moonMat);
    eMoon1.scale.set(0.06, 0.06, 0.06);
    const earthMoons = [
      { mesh: eMoon1, dist: 0.82, speed: 0.0036, angle: 1.2, inc: 0.14 }
    ];

    const earthSystem = new THREE.Group();
    earthSystem.add(earthMesh);
    earthMoons.forEach(m => earthSystem.add(m.mesh));

    const earthOrbitLine = createPlanetOrbitLine(16.5, 0x38bdf8, 0.18);
    this.ambientPlanetsGroup.add(earthOrbitLine);

    this.ambientPlanets.push({
      group: earthSystem,
      planetMesh: earthMesh,
      moons: earthMoons,
      orbitRadius: 16.5,
      orbitSpeed: 0.00015,
      currentAngle: 0.4,
      rotationSpeed: 0.006
    });
    this.ambientPlanetsGroup.add(earthSystem);

    // 2. Planet 2 (Outer Orbit II: 20.0): Jovian Giant with 2 Moons
    const jupiterTex = this.textureLoader.load('assets/textures/jupiter.jpg');
    jupiterTex.colorSpace = THREE.SRGBColorSpace;
    const jupiterMat = new THREE.MeshStandardMaterial({
      map: jupiterTex,
      emissive: new THREE.Color(0x92400e),
      emissiveIntensity: 0.14,
      roughness: 0.55,
      metalness: 0.05
    });
    const jupiterMesh = new THREE.Mesh(sphereGeo, jupiterMat);
    jupiterMesh.scale.set(0.52, 0.52, 0.52);

    const jMoon1 = new THREE.Mesh(sphereGeo, moonMat);
    jMoon1.scale.set(0.08, 0.08, 0.08);
    const jMoon2 = new THREE.Mesh(sphereGeo, moonMat);
    jMoon2.scale.set(0.06, 0.06, 0.06);
    const jupiterMoons = [
      { mesh: jMoon1, dist: 1.05, speed: 0.0032, angle: 0.8, inc: 0.22 },
      { mesh: jMoon2, dist: 1.55, speed: 0.0022, angle: 2.5, inc: -0.18 }
    ];

    const jupiterSystem = new THREE.Group();
    jupiterSystem.add(jupiterMesh);
    jupiterMoons.forEach(m => jupiterSystem.add(m.mesh));

    const jupiterOrbitLine = createPlanetOrbitLine(20.0, 0xf59e0b, 0.16);
    this.ambientPlanetsGroup.add(jupiterOrbitLine);

    this.ambientPlanets.push({
      group: jupiterSystem,
      planetMesh: jupiterMesh,
      moons: jupiterMoons,
      orbitRadius: 20.0,
      orbitSpeed: 0.00012,
      currentAngle: 1.8,
      rotationSpeed: 0.005
    });
    this.ambientPlanetsGroup.add(jupiterSystem);

    // 3. Planet 3 (Outer Orbit III: 24.0): Ringed Giant (Saturn) with 1 Moon
    const saturnTex = this.textureLoader.load('assets/textures/saturn.jpg');
    saturnTex.colorSpace = THREE.SRGBColorSpace;
    const saturnMat = new THREE.MeshStandardMaterial({
      map: saturnTex,
      emissive: new THREE.Color(0xb48c56),
      emissiveIntensity: 0.12,
      roughness: 0.65,
      metalness: 0.05
    });
    const saturnMesh = new THREE.Mesh(sphereGeo, saturnMat);
    saturnMesh.scale.set(0.48, 0.48, 0.48);

    const ringTex = this.textureLoader.load('assets/textures/saturn_ring.png');
    ringTex.colorSpace = THREE.SRGBColorSpace;
    // Map Saturn rings radially so Cassini divisions form true concentric circles
    const saturnRingGeo = new THREE.RingGeometry(0.62, 1.45, 64, 32);
    const ringPos = saturnRingGeo.attributes.position;
    const ringUv = saturnRingGeo.attributes.uv;
    for (let i = 0; i < ringPos.count; i++) {
      const rx = ringPos.getX(i);
      const ry = ringPos.getY(i);
      const r = Math.sqrt(rx * rx + ry * ry);
      const u = (r - 0.62) / (1.45 - 0.62);
      ringUv.setXY(i, u, 0.5);
    }
    ringUv.needsUpdate = true;

    const saturnRingMat = new THREE.MeshStandardMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      roughness: 0.55,
      metalness: 0.05
    });
    const saturnRing = new THREE.Mesh(saturnRingGeo, saturnRingMat);
    saturnRing.rotation.x = Math.PI / 2;

    const saturnBodyGroup = new THREE.Group();
    saturnBodyGroup.add(saturnMesh);
    saturnBodyGroup.add(saturnRing);
    saturnBodyGroup.rotation.z = 0.46; // Authentic 26.7° Saturnian axial tilt

    const sMoon1 = new THREE.Mesh(sphereGeo, moonMat);
    sMoon1.scale.set(0.07, 0.07, 0.07);
    const saturnMoons = [
      { mesh: sMoon1, dist: 1.75, speed: 0.0026, angle: 3.1, inc: 0.3 }
    ];

    const saturnSystem = new THREE.Group();
    saturnSystem.add(saturnBodyGroup);
    saturnMoons.forEach(m => saturnSystem.add(m.mesh));

    const saturnOrbitLine = createPlanetOrbitLine(24.0, 0xfacc15, 0.16);
    this.ambientPlanetsGroup.add(saturnOrbitLine);

    this.ambientPlanets.push({
      group: saturnSystem,
      planetMesh: saturnMesh,
      moons: saturnMoons,
      orbitRadius: 24.0,
      orbitSpeed: 0.00009,
      currentAngle: 4.5,
      rotationSpeed: 0.007
    });
    this.ambientPlanetsGroup.add(saturnSystem);

    // 4. Planet 4 (Outer Orbit IV: 28.5): Ice Giant (Neptune) in Outer Deep Reach
    const neptuneTex = this.textureLoader.load('assets/textures/neptune.jpg');
    neptuneTex.colorSpace = THREE.SRGBColorSpace;
    const neptuneMat = new THREE.MeshStandardMaterial({
      map: neptuneTex,
      emissive: new THREE.Color(0x312e81),
      emissiveIntensity: 0.18,
      roughness: 0.55,
      metalness: 0.05
    });
    const neptuneMesh = new THREE.Mesh(sphereGeo, neptuneMat);
    neptuneMesh.scale.set(0.44, 0.44, 0.44);

    const nMoon1 = new THREE.Mesh(sphereGeo, moonMat);
    nMoon1.scale.set(0.055, 0.055, 0.055);
    const neptuneMoons = [
      { mesh: nMoon1, dist: 1.0, speed: 0.0024, angle: 5.0, inc: -0.2 }
    ];

    const neptuneSystem = new THREE.Group();
    neptuneSystem.add(neptuneMesh);
    neptuneMoons.forEach(m => neptuneSystem.add(m.mesh));

    const neptuneOrbitLine = createPlanetOrbitLine(28.5, 0x818cf8, 0.16);
    this.ambientPlanetsGroup.add(neptuneOrbitLine);

    this.ambientPlanets.push({
      group: neptuneSystem,
      planetMesh: neptuneMesh,
      moons: neptuneMoons,
      orbitRadius: 28.5,
      orbitSpeed: 0.00007,
      currentAngle: 3.2,
      rotationSpeed: 0.004
    });
    this.ambientPlanetsGroup.add(neptuneSystem);

    this.scene.add(this.ambientPlanetsGroup);
  }

  initComets() {
    this.activeComets = [];
    this.maxActiveComets = 1;
    this.nextCometTime = Date.now() + 3500;
  }

  spawnComet() {
    const cometGroup = new THREE.Group();

    // 1. Incandescent White Nucleus Sphere (Refined, miniature celestial needle)
    const nucleusGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const nucleusMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    cometGroup.add(nucleusMesh);

    // 2. Multi-layered Brilliant Coma (Miniature diamond flare + soft ion halo)
    const flareMat = new THREE.SpriteMaterial({
      map: this.particleTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    });
    const flare = new THREE.Sprite(flareMat);
    flare.scale.set(0.70, 0.70, 1);
    cometGroup.add(flare);

    const isCyanComet = Math.random() > 0.35;
    const comaColor = isCyanComet ? 0x00f5ff : 0xfde047;
    const tailEndColor = isCyanComet ? 0xa855f7 : 0xf97316;

    const comaMat = new THREE.SpriteMaterial({
      map: this.particleTexture,
      color: comaColor,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    });
    const coma = new THREE.Sprite(comaMat);
    coma.scale.set(1.5, 1.5, 1);
    cometGroup.add(coma);

    // 3. Volumetric Stardust Particle Tail System (Fine, gossamer 3D trail)
    const maxParticles = 65;
    const tailGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const colors = new Float32Array(maxParticles * 3);

    for (let i = 0; i < maxParticles; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      colors[i * 3] = 0;
      colors[i * 3 + 1] = 0;
      colors[i * 3 + 2] = 0;
    }

    tailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    tailGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const tailMat = new THREE.PointsMaterial({
      size: this.isMobile ? 0.28 : 0.38,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.90
    });
    const tailPoints = new THREE.Points(tailGeo, tailMat);

    // Dynamic light cast by comet
    const cometLight = new THREE.PointLight(comaColor, 1.4, 12, 1.2);
    cometGroup.add(cometLight);

    // Trajectory starting from visible periphery, sweeping through the midground
    const side = Math.random() > 0.5 ? 1 : -1;
    const startX = side * (16 + Math.random() * 8);
    const startY = 5 + Math.random() * 5;
    const startZ = -10 + Math.random() * 6;

    cometGroup.position.set(startX, startY, startZ);

    const endX = -startX * (0.85 + Math.random() * 0.3);
    const endY = -(1.5 + Math.random() * 3);
    const endZ = 14 + Math.random() * 8;

    const dir = new THREE.Vector3(endX - startX, endY - startY, endZ - startZ).normalize();
    const speed = 0.24 + Math.random() * 0.06;
    const velocity = dir.multiplyScalar(speed);

    this.scene.add(cometGroup);
    this.scene.add(tailPoints);

    this.activeComets.push({
      group: cometGroup,
      tailPoints: tailPoints,
      tailGeo: tailGeo,
      velocity: velocity,
      particles: [],
      maxParticles: maxParticles,
      coma: coma,
      flare: flare,
      light: cometLight,
      headColor: new THREE.Color(0xffffff),
      midColor: new THREE.Color(comaColor),
      endColor: new THREE.Color(tailEndColor),
      life: 0,
      maxLife: 240
    });
  }

  updateComets() {
    if (Date.now() > this.nextCometTime && this.activeComets.length < this.maxActiveComets) {
      this.spawnComet();
      this.nextCometTime = Date.now() + 14000 + Math.random() * 10000;
    }

    for (let i = this.activeComets.length - 1; i >= 0; i--) {
      const comet = this.activeComets[i];
      comet.life++;

      // Gravitational pull toward Singularity (0,0,0) curving path naturally
      const toCenter = new THREE.Vector3(0, 0, 0).sub(comet.group.position);
      const distToCenter = toCenter.length();
      if (distToCenter > 3.0) {
        toCenter.normalize().multiplyScalar(0.00065);
        comet.velocity.add(toCenter);
      }

      comet.group.position.add(comet.velocity);

      // Emit new volumetric stardust particles at comet nucleus
      if (comet.particles.length < comet.maxParticles) {
        const spread = 0.06;
        comet.particles.push({
          pos: comet.group.position.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread
          )),
          vel: comet.velocity.clone().multiplyScalar(-0.08).add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.015,
            (Math.random() - 0.5) * 0.015,
            (Math.random() - 0.5) * 0.015
          )),
          age: 0,
          maxAge: 35 + Math.random() * 15
        });
      }

      // Update active tail stardust particles
      const posArray = comet.tailGeo.attributes.position.array;
      const colArray = comet.tailGeo.attributes.color.array;

      for (let p = comet.particles.length - 1; p >= 0; p--) {
        const pt = comet.particles[p];
        pt.age++;
        pt.pos.add(pt.vel);

        if (pt.age >= pt.maxAge) {
          comet.particles.splice(p, 1);
        }
      }

      for (let idx = 0; idx < comet.maxParticles; idx++) {
        const idx3 = idx * 3;
        if (idx < comet.particles.length) {
          const pt = comet.particles[idx];
          posArray[idx3] = pt.pos.x;
          posArray[idx3 + 1] = pt.pos.y;
          posArray[idx3 + 2] = pt.pos.z;

          const progress = pt.age / pt.maxAge;
          const col = new THREE.Color();
          if (progress < 0.25) {
            col.lerpColors(comet.headColor, comet.midColor, progress / 0.25);
          } else {
            col.lerpColors(comet.midColor, comet.endColor, (progress - 0.25) / 0.75);
          }

          const fade = Math.pow(1.0 - progress, 1.3);
          colArray[idx3] = col.r * fade;
          colArray[idx3 + 1] = col.g * fade;
          colArray[idx3 + 2] = col.b * fade;
        } else {
          posArray[idx3] = 0;
          posArray[idx3 + 1] = 0;
          posArray[idx3 + 2] = 0;
          colArray[idx3] = 0;
          colArray[idx3 + 1] = 0;
          colArray[idx3 + 2] = 0;
        }
      }
      comet.tailGeo.attributes.position.needsUpdate = true;
      comet.tailGeo.attributes.color.needsUpdate = true;

      const pulse = 1.0 + Math.sin(comet.life * 0.18) * 0.2;
      comet.coma.scale.set(1.5 * pulse, 1.5 * pulse, 1);

      if (comet.life > comet.maxLife || comet.group.position.length() > 80) {
        this.scene.remove(comet.group);
        this.scene.remove(comet.tailPoints);
        comet.tailGeo.dispose();
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

      // Orient holographic medallion badge to camera smoothly
      if (item.billboard) {
        item.billboard.quaternion.copy(this.camera.quaternion);
      }

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

    // 7. Dynamic Comets update
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
