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
    this.cameraMode = 'orbit-overview'; // 'orbit-overview' | 'focus-project'

    this.scrollProgress = 0;
    this.targetScrollProgress = 0;

    this.textureLoader = new THREE.TextureLoader();

    // Celestial projects with real textures & tech branding
    this.projectsData = [
      {
        id: 'dotnet',
        name: 'Systime Enterprise (.NET 10 & C#)',
        techName: '.NET 10 / C#',
        badge: 'Producción Activa',
        role: 'DevOps Lead & Systems Engineer',
        stack: '.NET 10 • C# • Azure SQL • Quiter ERP • CI/CD',
        desc: 'Ecosistema enterprise para talleres y concesionarios. Sincronización bidireccional en tiempo real hacia ERP Quiter DMS, multitenancy estricto, compuertas CI/CD automatizadas y distribución en Google Play Console.',
        link: 'https://github.com/Mitchel2003',
        texturePath: 'assets/textures/saturn.jpg',
        hasRingTexture: true,
        ringTexturePath: 'assets/textures/saturn_ring.png',
        iconPath: 'assets/icons/dotnet.svg',
        orbitRadius: 5.6,
        speed: 0.00065,
        angle: 0.8,
        size: 0.42,
        primaryColor: '#10b981',
        glowColor: '#34d399'
      },
      {
        id: 'typescript',
        name: 'Sysmed / Ingest (TypeScript & Redis)',
        techName: 'TypeScript / Node',
        badge: 'Sector Regulatorio INVIMA',
        role: 'Full-Stack & Co-Diseñador de Arquitectura',
        stack: 'TypeScript • Node.js • PostgreSQL • Prisma • BullMQ • Redis',
        desc: 'Plataforma para gestión y auditorías regulatorias biomédicas. Diseñada con Arquitectura Hexagonal en TypeScript, colas asíncronas BullMQ sobre Redis, modelo de permisos CASL y React 18.',
        link: 'https://github.com/Mitchel2003/mern_crud',
        texturePath: 'assets/textures/neptune.jpg',
        hasRingTexture: false,
        iconPath: 'assets/icons/typescript.svg',
        orbitRadius: 8.2,
        speed: 0.00045,
        angle: 2.4,
        size: 0.38,
        primaryColor: '#8b5cf6',
        glowColor: '#a78bfa'
      },
      {
        id: 'azure',
        name: 'Infraestructura Cloud & CI/CD',
        techName: 'Azure Cloud / DevOps',
        badge: 'Zero-Downtime Releases',
        role: 'DevOps Lead',
        stack: 'Microsoft Azure • App Services • Azure SQL • GitHub Runners',
        desc: 'Administración integral de infraestructura en la nube Microsoft Azure, inspectores preflight para migraciones desatendidas, runners self-hosted y suites de pruebas arquitectónicas.',
        link: 'https://github.com/Mitchel2003',
        texturePath: 'assets/textures/earth.jpg',
        hasRingTexture: false,
        iconPath: 'assets/icons/azure.svg',
        orbitRadius: 10.8,
        speed: 0.00032,
        angle: 3.9,
        size: 0.36,
        primaryColor: '#00f5ff',
        glowColor: '#38bdf8'
      },
      {
        id: 'rpa',
        name: 'Bots RPA & Win32 Systems',
        techName: 'Python & Win32 API',
        badge: 'Automation & Low-Level',
        role: 'Automation Engineer',
        stack: 'C# Win32 • Playwright • Redis • Screen OCR • Python',
        desc: 'Bots de alta confiabilidad para resolución de portales y captchas complejos, hooks nativos de Win32, emulación de hardware e inspección de pantalla en tiempo real.',
        link: 'https://github.com/Mitchel2003',
        texturePath: 'assets/textures/jupiter.jpg',
        hasRingTexture: false,
        iconPath: 'assets/icons/python.svg',
        orbitRadius: 13.5,
        speed: 0.00022,
        angle: 5.3,
        size: 0.35,
        primaryColor: '#f59e0b',
        glowColor: '#fbbf24'
      }
    ];

    this.mousePointer = new THREE.Vector2(-100, -100);
    this.targetCameraPos = new THREE.Vector3(0, 15, 24);
    this.targetControlsTarget = new THREE.Vector3(0, 0, 0);

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x010206, 0.018);

    this.camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      300
    );
    this.camera.position.set(0, 16, 26);

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x010206, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 2.2;
    this.controls.maxDistance = 55;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.12;
    this.controls.target.set(0, 0, 0);

    this.raycaster = new THREE.Raycaster();
    this.particleTexture = this.generateParticleTexture();

    // 1. Gargantua Black Hole (Dense 140,000 particle Accretion Disk & Lensing)
    this.buildGargantua();

    // 2. Cosmic Deep Starfield
    this.buildStarfield();

    // 3. Realistic Orbiting Technology Celestial Bodies
    this.buildPlanets();

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x162238, 1.4);
    this.scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x00f5ff, 6.0, 45, 1.1);
    coreLight.position.set(0, 0, 0);
    this.scene.add(coreLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 3.5, 30, 1.2);
    amberLight.position.set(0, 1.2, 0);
    this.scene.add(amberLight);

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
    gradient.addColorStop(0.55, 'rgba(0, 245, 255, 0.5)');
    gradient.addColorStop(0.85, 'rgba(139, 92, 246, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  buildGargantua() {
    this.blackHoleGroup = new THREE.Group();

    // 1. Event Horizon (Pitch-black sphere)
    const horizonGeo = new THREE.SphereGeometry(1.5, 64, 64);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x000000
    });
    this.eventHorizon = new THREE.Mesh(horizonGeo, horizonMat);
    this.blackHoleGroup.add(this.eventHorizon);

    // 2. Gravitational Lensing Arch (Light bent over & under)
    const archGeo = new THREE.TorusGeometry(1.95, 0.1, 16, 140);
    const archMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });
    this.lensingArch = new THREE.Mesh(archGeo, archMat);
    this.lensingArch.rotation.x = Math.PI / 2;
    this.blackHoleGroup.add(this.lensingArch);

    // Vertical Curved Light Ring
    const vHaloGeo = new THREE.RingGeometry(1.52, 2.6, 64);
    const vHaloMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    this.verticalHalo = new THREE.Mesh(vHaloGeo, vHaloMat);
    this.blackHoleGroup.add(this.verticalHalo);

    // 3. Massive Relativistic Accretion Disk (140,000 Particles)
    const particleCount = this.isMobile ? 55000 : 140000;
    this.accretionGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    this.particleRadii = new Float32Array(particleCount);
    this.particleAngles = new Float32Array(particleCount);
    this.particleSpeeds = new Float32Array(particleCount);

    const minR = 1.7;
    const maxR = 4.8;

    const cWhite = new THREE.Color(0xffffff);
    const cCyan = new THREE.Color(0x00f5ff);
    const cAmber = new THREE.Color(0xf59e0b);
    const cViolet = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Exponential distribution denser near event horizon
      const r = minR + Math.pow(Math.random(), 2.4) * (maxR - minR);
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 0.16 * (1 - (r - minR) / (maxR - minR));

      positions[i3] = Math.cos(angle) * r;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * r;

      this.particleRadii[i] = r;
      this.particleAngles[i] = angle;
      // Keplerian speed: inner particles rotate faster
      this.particleSpeeds[i] = (0.016 / Math.sqrt(r)) * (0.85 + Math.random() * 0.3);

      const norm = (r - minR) / (maxR - minR);
      const col = new THREE.Color();
      if (norm < 0.15) {
        col.lerpColors(cWhite, cCyan, norm / 0.15);
      } else if (norm < 0.55) {
        col.lerpColors(cCyan, cAmber, (norm - 0.15) / 0.4);
      } else {
        col.lerpColors(cAmber, cViolet, (norm - 0.55) / 0.45);
      }

      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    this.accretionGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.accretionGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.accretionMat = new THREE.PointsMaterial({
      size: this.isMobile ? 0.024 : 0.020,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.96
    });

    this.accretionPoints = new THREE.Points(this.accretionGeo, this.accretionMat);
    this.blackHoleGroup.add(this.accretionPoints);

    this.blackHoleGroup.rotation.x = 0.28;
    this.blackHoleGroup.rotation.z = -0.16;
    this.scene.add(this.blackHoleGroup);
  }

  buildStarfield() {
    const starCount = this.isMobile ? 8000 : 20000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const r = 40 + Math.random() * 95;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);

      const lum = 0.4 + Math.random() * 0.6;
      col[i3] = lum * 0.85;
      col[i3 + 1] = lum * 0.95;
      col[i3 + 2] = lum;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.038,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.8
    });

    this.starfield = new THREE.Points(geo, mat);
    this.scene.add(this.starfield);
  }

  buildPlanets() {
    this.planetMeshes = [];
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
        color: new THREE.Color(data.primaryColor),
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending
      });
      const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
      orbitLine.rotation.x = this.blackHoleGroup.rotation.x;
      orbitLine.rotation.z = this.blackHoleGroup.rotation.z;
      this.orbitsGroup.add(orbitLine);

      // 2. Planet Container
      const planetGroup = new THREE.Group();

      // Planet Surface Texture (Real high-res texture file)
      const planetTexture = this.textureLoader.load(data.texturePath);
      planetTexture.wrapS = THREE.RepeatWrapping;
      planetTexture.wrapT = THREE.ClampToEdgeWrapping;

      const planetGeo = new THREE.SphereGeometry(data.size, 48, 48);
      const planetMat = new THREE.MeshStandardMaterial({
        map: planetTexture,
        roughness: 0.5,
        metalness: 0.1,
        emissive: new THREE.Color(data.primaryColor),
        emissiveIntensity: 0.18
      });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);

      // 3. Generous Invisible Hit-Sphere for Effortless Clicking
      const hitGeo = new THREE.SphereGeometry(data.size * 2.4, 16, 16);
      const hitMat = new THREE.MeshBasicMaterial({
        visible: false
      });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = data;
      planetGroup.add(hitMesh);

      // 4. Glowing Atmosphere Corona
      const atmoGeo = new THREE.SphereGeometry(data.size * 1.28, 32, 32);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(data.glowColor),
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
      planetGroup.add(atmoMesh);

      // 5. Realistic Saturn Ring (If applicable)
      if (data.hasRingTexture) {
        const ringGeo = new THREE.RingGeometry(data.size * 1.4, data.size * 2.8, 64);
        const ringTexture = this.textureLoader.load(data.ringTexturePath);

        // Adjust UVs for radial mapping
        const pos = ringGeo.attributes.position;
        const uv = ringGeo.attributes.uv;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const dist = Math.sqrt(x * x + y * y);
          const normDist = (dist - data.size * 1.4) / (data.size * 1.4);
          uv.setXY(i, normDist, 0.5);
        }

        const ringMat = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });

        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.8;
        planetGroup.add(ringMesh);
      }

      // 6. Floating 3D Tech Emblem Billboard
      const iconTexture = this.textureLoader.load(data.iconPath);
      const spriteMat = new THREE.SpriteMaterial({
        map: iconTexture,
        transparent: true,
        opacity: 0.95
      });
      const iconSprite = new THREE.Sprite(spriteMat);
      iconSprite.scale.set(0.42, 0.42, 1);
      iconSprite.position.set(0, data.size + 0.35, 0);
      planetGroup.add(iconSprite);

      planetGroup.add(planetMesh);
      this.orbitsGroup.add(planetGroup);

      this.planetMeshes.push({
        group: planetGroup,
        mesh: planetMesh,
        hitMesh: hitMesh,
        atmo: atmoMesh,
        sprite: iconSprite,
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
      if (e.target.closest('.hud-header, .orbit-dock, .project-dossier, .cv-modal, .executive-profile, button, a')) {
        return;
      }
      this.checkPlanetClick();
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  checkPlanetClick() {
    this.raycaster.setFromCamera(this.mousePointer, this.camera);
    const hitMeshes = this.planetMeshes.map(p => p.hitMesh);
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

      // Adjust based on scroll phase
      if (this.scrollProgress < 0.4) {
        this.targetCameraPos.set(0, 16, 26);
        this.targetControlsTarget.set(0, 0, 0);
      } else {
        this.targetCameraPos.set(0, 5.5, 16.5);
        this.targetControlsTarget.set(0, 0, 0);
      }

      if (this.onProjectSelect) {
        this.onProjectSelect(null);
      }
      return;
    }

    const item = this.planetMeshes.find(p => p.data.id === projectId);
    if (!item) return;

    this.activeProject = item;
    this.cameraMode = 'focus-project';

    if (this.onProjectSelect) {
      this.onProjectSelect(item.data);
    }
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Smooth scroll interpolation
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.05;

    // 1. Accretion Disk Physics
    if (this.accretionGeo && this.particleAngles) {
      const pos = this.accretionGeo.attributes.position.array;
      const count = this.particleAngles.length;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        this.particleAngles[i] += this.particleSpeeds[i];
        const r = this.particleRadii[i];
        const a = this.particleAngles[i];

        pos[i3] = Math.cos(a) * r;
        pos[i3 + 2] = Math.sin(a) * r;
      }
      this.accretionGeo.attributes.position.needsUpdate = true;
    }

    // 2. Gravitational Rings subtle rotation
    if (this.lensingArch) {
      this.lensingArch.rotation.z += 0.002;
    }
    if (this.verticalHalo) {
      this.verticalHalo.rotation.z += 0.001;
    }

    // 3. Move Planets along their orbits (Majestic slow speeds)
    this.planetMeshes.forEach((item) => {
      item.data.angle += item.data.speed;
      const localX = Math.cos(item.data.angle) * item.data.orbitRadius;
      const localZ = Math.sin(item.data.angle) * item.data.orbitRadius;

      const tiltedVec = new THREE.Vector3(localX, 0, localZ);
      tiltedVec.applyEuler(this.blackHoleGroup.rotation);

      item.group.position.copy(tiltedVec);

      // Self rotation on axis
      item.mesh.rotation.y += 0.008;

      // Atmosphere breathing
      const atmoScale = 1 + Math.sin(Date.now() * 0.002 + item.data.orbitRadius) * 0.05;
      item.atmo.scale.set(atmoScale, atmoScale, atmoScale);
    });

    // 4. Camera Dynamics: Two-Phase Scroll Transition & Project Focus
    if (this.cameraMode === 'focus-project' && this.activeProject) {
      const pPos = this.activeProject.group.position;
      const camOffset = new THREE.Vector3(1.4, 0.7, 2.0);
      this.targetCameraPos.copy(pPos).add(camOffset);
      this.targetControlsTarget.copy(pPos);

      this.camera.position.lerp(this.targetCameraPos, 0.05);
      this.controls.target.lerp(this.targetControlsTarget, 0.05);
    } else {
      // Two-phase scroll interpolation:
      // Phase 1 (scroll = 0): High altitude overview of the cosmos behind the executive profile
      // Phase 2 (scroll = 1): Dive into the equatorial orbit plane
      const p1Pos = new THREE.Vector3(0, 16, 26);
      const p2Pos = new THREE.Vector3(0, 5.5, 16.5);
      const currentTargetPos = p1Pos.clone().lerp(p2Pos, this.scrollProgress);

      this.camera.position.lerp(currentTargetPos, 0.04);
      this.controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.04);
    }

    // 5. Starfield rotation
    if (this.starfield) {
      this.starfield.rotation.y += 0.00015;
    }

    this.controls.update();

    // Hover Cursor check
    this.raycaster.setFromCamera(this.mousePointer, this.camera);
    const hitMeshes = this.planetMeshes.map(p => p.hitMesh);
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
