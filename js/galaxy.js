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
        iconPath: 'assets/icons/dotnet.svg',
        orbitRadius: 5.8,
        speed: 0.00042,
        angle: 0.9,
        colorHex: '#10b981',
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

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0x080812, 1.0);
    this.scene.add(ambientLight);

    const photonLight = new THREE.PointLight(0x00f5ff, 5.0, 50, 1.1);
    photonLight.position.set(0, 0, 0);
    this.scene.add(photonLight);

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
      const ringGeo = new THREE.RingGeometry(0.38, 0.45, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(data.colorHex),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      nodeGroup.add(ringMesh);

      // Core Highlight Particle Beacon
      const beaconGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0xffffff
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      nodeGroup.add(beaconMesh);

      // 3. Floating 3D Official Tech Emblem Billboard (Crisp SVG Texture)
      const iconTexture = this.textureLoader.load(data.iconPath);
      const spriteMat = new THREE.SpriteMaterial({
        map: iconTexture,
        transparent: true,
        opacity: 0.98,
        depthTest: false
      });
      const iconSprite = new THREE.Sprite(spriteMat);
      const iconScale = data.isCore ? 0.72 : 0.58;
      iconSprite.scale.set(iconScale, iconScale, 1);
      iconSprite.position.set(0, 0.48, 0);
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

    // 5. Nebulae slow rotation
    if (this.nebulaeMesh) {
      this.nebulaeMesh.rotation.y += 0.00008;
    }
    if (this.starfield) {
      this.starfield.rotation.y += 0.00012;
    }

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
